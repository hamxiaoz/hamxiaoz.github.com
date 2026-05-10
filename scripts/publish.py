#!/usr/bin/env python3
"""
Publishing engine for hamxiaoz.github.com articles.
Publishes markdown articles to Medium, LinkedIn, and X.

Usage:
    python scripts/publish.py <article_path> [--medium] [--linkedin] [--x]
                              [--publish] [--dry-run] [--force] [--whoami-medium]

Options:
    --medium        Publish to Medium (draft by default)
    --linkedin      Publish full article to LinkedIn
    --x             Post to X (Twitter)
    --publish       Make Medium post public immediately (default: draft)
    --dry-run       Show what would be sent without calling any APIs
    --force         Republish even if already published
    --whoami-medium Print your Medium author ID and exit
"""

import argparse
import json
import os
import re
import sys
import time
import hmac
import hashlib
import base64
import urllib.parse
import urllib.request
import urllib.error


# ---------------------------------------------------------------------------
# .env loader (no dependencies)
# ---------------------------------------------------------------------------

def load_dotenv():
    """Load .env from repo root into os.environ."""
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(base, '.env')
    if not os.path.exists(env_path):
        return
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            k, v = line.split('=', 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            os.environ.setdefault(k, v)


def require_env(key):
    val = os.environ.get(key)
    if not val:
        sys.exit(f'ERROR: Missing required credential: {key}\nCheck your .env file. See .env.example for setup instructions.')
    return val


# ---------------------------------------------------------------------------
# Frontmatter parser / writer (stdlib only, targeted in-place replacement)
# ---------------------------------------------------------------------------

def read_article(filepath):
    """Returns (frontmatter_dict, body_text, raw_text)."""
    with open(filepath) as f:
        raw = f.read()
    if not raw.startswith('---'):
        return {}, raw, raw
    try:
        end = raw.index('\n---\n', 3)
    except ValueError:
        return {}, raw, raw
    fm_raw = raw[3:end]
    body = raw[end + 5:]
    fields = {}
    for line in fm_raw.splitlines():
        # Handle: key: value and key: "value" and key: ['a', 'b']
        m = re.match(r'^(\w+):\s*(.*)', line)
        if m:
            k = m.group(1)
            v = m.group(2).strip()
            # Strip surrounding quotes
            if (v.startswith('"') and v.endswith('"')) or \
               (v.startswith("'") and v.endswith("'")):
                v = v[1:-1]
            fields[k] = v
    return fields, body, raw


def set_frontmatter_key(filepath, key, value):
    """Add or replace a single key in frontmatter without touching anything else."""
    with open(filepath) as f:
        text = f.read()
    if not text.startswith('---'):
        return
    try:
        end_idx = text.index('\n---\n', 3)
    except ValueError:
        return
    fm = text[3:end_idx]
    after = text[end_idx:]  # includes \n---\n...

    # Format value
    if isinstance(value, bool) or value in ('true', 'false'):
        new_line = f'{key}: {str(value).lower()}'
    elif isinstance(value, list):
        items = ', '.join(f'"{i}"' for i in value)
        new_line = f'{key}: [{items}]'
    else:
        sv = str(value)
        # Quote if contains special chars
        if any(c in sv for c in [':', '#', '{', '[']):
            sv = sv.replace('"', '\\"')
            new_line = f'{key}: "{sv}"'
        else:
            new_line = f'{key}: "{sv}"'

    pattern = re.compile(rf'^{re.escape(key)}:.*$', re.MULTILINE)
    if pattern.search(fm):
        fm = pattern.sub(new_line, fm)
    else:
        fm = fm.rstrip('\n') + f'\n{new_line}'

    with open(filepath, 'w') as f:
        f.write(f'---{fm}{after}')


# ---------------------------------------------------------------------------
# Teaser extractor
# ---------------------------------------------------------------------------

def extract_teaser(body, max_chars=700):
    """First substantial paragraph from markdown body, stripped of syntax."""
    for p in body.split('\n\n'):
        p = p.strip()
        if not p or p.startswith('#') or p.startswith('```') or p.startswith('|'):
            continue
        clean = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', p)
        clean = re.sub(r'[*_`#>!]', '', clean)
        clean = re.sub(r'\s+', ' ', clean).strip()
        if len(clean) > 60:
            return clean[:max_chars] + ('…' if len(clean) > max_chars else '')
    return ''


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def http_post(url, payload, headers):
    """POST JSON payload, return parsed JSON response."""
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        raise RuntimeError(f'HTTP {e.code} from {url}:\n{body}') from e


def http_get(url, headers):
    """GET request, return parsed JSON response."""
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        raise RuntimeError(f'HTTP {e.code} from {url}:\n{body}') from e


# ---------------------------------------------------------------------------
# Medium
# ---------------------------------------------------------------------------

def get_medium_author_id(token):
    data = http_get('https://api.medium.com/v1/me', {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    })
    return data['data']['id']


def publish_to_medium(filepath, fields, body, token, author_id, publish=False, dry_run=False):
    title = fields.get('title', '').strip('"\'')
    # Parse medium_tags from frontmatter
    raw_tags = fields.get('medium_tags', '')
    if raw_tags.startswith('['):
        tags = [t.strip().strip('"\'') for t in raw_tags.strip('[]').split(',') if t.strip()]
    else:
        tags = [t.strip() for t in raw_tags.split(',') if t.strip()]

    # Prepend cover image if set
    cover = fields.get('cover', '').strip('"\'')
    full_body = f'![cover]({cover})\n\n{body}' if cover else body

    payload = {
        'title': title,
        'contentFormat': 'markdown',
        'content': full_body,
        'publishStatus': 'public' if publish else 'draft',
        'tags': tags[:5],  # Medium max 5 tags
    }

    print(f'\n--- Medium {"(public)" if publish else "(draft)"} ---')
    print(f'Title: {title}')
    print(f'Tags: {tags}')
    print(f'Body length: {len(full_body)} chars')

    if dry_run:
        print('[dry-run] Would POST to Medium API. No request sent.')
        return None

    url = f'https://api.medium.com/v1/users/{author_id}/posts'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    resp = http_post(url, payload, headers)
    medium_url = resp['data']['url']
    print(f'Published: {medium_url}')
    return medium_url


# ---------------------------------------------------------------------------
# LinkedIn
# ---------------------------------------------------------------------------

def markdown_to_linkedin_blocks(body):
    """Convert markdown body to LinkedIn article content blocks."""
    blocks = []
    lines = body.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i]

        # Code block
        if line.startswith('```'):
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                code_lines.append(lines[i])
                i += 1
            blocks.append({
                'blockType': 'CODE',
                'code': {'text': '\n'.join(code_lines)}
            })
            i += 1
            continue

        # Headings
        h_match = re.match(r'^(#{1,3})\s+(.*)', line)
        if h_match:
            level = len(h_match.group(1))
            text = h_match.group(2).strip()
            heading_type = {1: 'HEADING_ONE', 2: 'HEADING_TWO', 3: 'HEADING_THREE'}.get(level, 'HEADING_TWO')
            blocks.append({
                'blockType': 'PARAGRAPH',
                'paragraph': {
                    'text': {'text': text},
                    'style': heading_type,
                }
            })
            i += 1
            continue

        # List items
        if re.match(r'^[-*+]\s+', line):
            items = []
            while i < len(lines) and re.match(r'^[-*+]\s+', lines[i]):
                items.append(re.sub(r'^[-*+]\s+', '', lines[i]).strip())
                i += 1
            blocks.append({
                'blockType': 'LIST',
                'list': {
                    'items': [{'text': {'text': t}} for t in items],
                    'listOrdering': 'UNORDERED',
                }
            })
            continue

        # Numbered list
        if re.match(r'^\d+\.\s+', line):
            items = []
            while i < len(lines) and re.match(r'^\d+\.\s+', lines[i]):
                items.append(re.sub(r'^\d+\.\s+', '', lines[i]).strip())
                i += 1
            blocks.append({
                'blockType': 'LIST',
                'list': {
                    'items': [{'text': {'text': t}} for t in items],
                    'listOrdering': 'ORDERED',
                }
            })
            continue

        # Blank line — skip
        if not line.strip():
            i += 1
            continue

        # Regular paragraph (accumulate until blank line)
        para_lines = []
        while i < len(lines) and lines[i].strip():
            para_lines.append(lines[i])
            i += 1
        para_text = ' '.join(para_lines)
        # Strip markdown inline formatting for block text
        para_text = re.sub(r'\*\*([^*]+)\*\*', r'\1', para_text)
        para_text = re.sub(r'\*([^*]+)\*', r'\1', para_text)
        para_text = re.sub(r'`([^`]+)`', r'\1', para_text)
        para_text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', para_text)
        if para_text.strip():
            blocks.append({
                'blockType': 'PARAGRAPH',
                'paragraph': {'text': {'text': para_text.strip()}}
            })

    return blocks


def publish_to_linkedin(filepath, fields, body, access_token, person_urn, dry_run=False):
    title = fields.get('title', '').strip('"\'')
    hook = fields.get('linkedin_hook', '').strip('"\'')
    hashtags = fields.get('linkedin_hashtags', '').strip('"\'')

    print(f'\n--- LinkedIn Article ---')
    print(f'Title: {title}')
    print(f'Hook: {hook[:80]}...' if len(hook) > 80 else f'Hook: {hook}')
    print(f'Hashtags: {hashtags}')

    content_blocks = markdown_to_linkedin_blocks(body)
    print(f'Content blocks: {len(content_blocks)}')

    if dry_run:
        print('[dry-run] Would POST to LinkedIn Articles API. No request sent.')
        return True

    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202401',
    }

    # Append hashtags as footer paragraph
    if hashtags:
        content_blocks.append({
            'blockType': 'PARAGRAPH',
            'paragraph': {'text': {'text': hashtags}}
        })

    payload = {
        'author': person_urn,
        'title': {'text': title},
        'content': {
            'contentBlocks': content_blocks,
        },
        'lifecycleState': 'PUBLISHED',
        'visibility': 'PUBLIC',
    }

    if hook:
        payload['description'] = {'text': hook}

    try:
        resp = http_post('https://api.linkedin.com/rest/articles', payload, headers)
        print(f'LinkedIn article published.')
        return True
    except RuntimeError as e:
        err_str = str(e)
        if '403' in err_str or '451' in err_str or 'FORBIDDEN' in err_str.upper():
            print(f'WARNING: LinkedIn Articles API appears restricted (may require Partner Program).')
            print('Falling back to LinkedIn long-form post...')
            return _linkedin_fallback_post(title, hook, body, hashtags, access_token, person_urn)
        raise


def _linkedin_fallback_post(title, hook, body, hashtags, access_token, person_urn):
    """Fallback: post as a LinkedIn UGC text post (limited to ~3000 chars)."""
    teaser = extract_teaser(body, max_chars=2000)
    post_text = f'{hook}\n\n{teaser}\n\n{hashtags}' if hook else f'{teaser}\n\n{hashtags}'
    post_text = post_text[:3000]

    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
    }
    payload = {
        'author': person_urn,
        'lifecycleState': 'PUBLISHED',
        'specificContent': {
            'com.linkedin.ugc.ShareContent': {
                'shareCommentary': {'text': post_text},
                'shareMediaCategory': 'NONE',
            }
        },
        'visibility': {'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'},
    }
    http_post('https://api.linkedin.com/v2/ugcPosts', payload, headers)
    print('LinkedIn long-form post published (fallback mode).')
    return True


# ---------------------------------------------------------------------------
# X (Twitter) — OAuth1.0a
# ---------------------------------------------------------------------------

def _oauth1_header(method, url, params, api_key, api_secret, token, token_secret):
    """Build OAuth1.0a Authorization header."""
    oauth_params = {
        'oauth_consumer_key': api_key,
        'oauth_nonce': base64.b64encode(os.urandom(16)).decode('ascii').rstrip('='),
        'oauth_signature_method': 'HMAC-SHA1',
        'oauth_timestamp': str(int(time.time())),
        'oauth_token': token,
        'oauth_version': '1.0',
    }
    # Combine all params for signature
    all_params = {**params, **oauth_params}
    param_str = '&'.join(
        f'{urllib.parse.quote(k, safe="")}={urllib.parse.quote(str(v), safe="")}'
        for k, v in sorted(all_params.items())
    )
    base_str = '&'.join([
        method.upper(),
        urllib.parse.quote(url, safe=''),
        urllib.parse.quote(param_str, safe=''),
    ])
    signing_key = f'{urllib.parse.quote(api_secret, safe="")}&{urllib.parse.quote(token_secret, safe="")}'
    signature = base64.b64encode(
        hmac.new(signing_key.encode('utf-8'), base_str.encode('utf-8'), hashlib.sha1).digest()
    ).decode('ascii')
    oauth_params['oauth_signature'] = signature
    header_parts = ', '.join(
        f'{urllib.parse.quote(k, safe="")}="{urllib.parse.quote(v, safe="")}"'
        for k, v in sorted(oauth_params.items())
    )
    return f'OAuth {header_parts}'


def post_to_x(filepath, fields, body, api_key, api_secret, access_token, access_secret,
              medium_url=None, dry_run=False):
    title = fields.get('title', '').strip('"\'')
    x_post = fields.get('x_post', '').strip('"\'')
    x_hashtags = fields.get('x_hashtags', '').strip('"\'')

    # Substitute {url} placeholder
    url_to_use = medium_url or fields.get('medium_url', '').strip('"\'') or \
                 fields.get('external_url', '').strip('"\'') or '{url}'
    if x_post:
        tweet_text = x_post.replace('{url}', url_to_use)
    else:
        # Fallback: title + url + hashtags
        tweet_text = f'{title} {url_to_use} {x_hashtags}'.strip()

    # Truncate to 280
    if len(tweet_text) > 280:
        tweet_text = tweet_text[:277] + '…'

    print(f'\n--- X Post ---')
    print(f'Tweet ({len(tweet_text)}/280): {tweet_text}')

    if dry_run:
        print('[dry-run] Would POST to X API. No request sent.')
        return True

    url = 'https://api.twitter.com/2/tweets'
    payload = {'text': tweet_text}
    auth_header = _oauth1_header('POST', url, {}, api_key, api_secret, access_token, access_secret)
    headers = {
        'Authorization': auth_header,
        'Content-Type': 'application/json',
    }
    resp = http_post(url, payload, headers)
    tweet_id = resp['data']['id']
    print(f'Posted to X: https://x.com/i/web/status/{tweet_id}')
    return True


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description='Publish article to Medium, LinkedIn, X')
    parser.add_argument('article', nargs='?', help='Path to markdown article file')
    parser.add_argument('--medium', action='store_true', help='Publish to Medium')
    parser.add_argument('--linkedin', action='store_true', help='Publish to LinkedIn')
    parser.add_argument('--x', action='store_true', help='Post to X')
    parser.add_argument('--publish', action='store_true', help='Make Medium post public (default: draft)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be sent, no API calls')
    parser.add_argument('--force', action='store_true', help='Republish even if already published')
    parser.add_argument('--whoami-medium', action='store_true', help='Print Medium author ID and exit')
    args = parser.parse_args()

    load_dotenv()

    # Special: print Medium author ID
    if args.whoami_medium:
        token = require_env('MEDIUM_TOKEN')
        author_id = get_medium_author_id(token)
        print(f'MEDIUM_AUTHOR_ID={author_id}')
        return

    if not args.article:
        parser.print_help()
        sys.exit(1)

    if not os.path.exists(args.article):
        sys.exit(f'ERROR: File not found: {args.article}')

    fields, body, _ = read_article(args.article)
    title = fields.get('title', os.path.basename(args.article)).strip('"\'')
    print(f'Article: {title}')

    medium_url = None

    # --- Medium ---
    if args.medium:
        # Idempotency check
        existing = fields.get('medium_url', '').strip('"\'')
        if existing and not args.force and not args.dry_run:
            sys.exit(f'Already published to Medium: {existing}\nUse --force to republish.')

        token = '' if args.dry_run else require_env('MEDIUM_TOKEN')
        author_id = '' if args.dry_run else require_env('MEDIUM_AUTHOR_ID')
        medium_url = publish_to_medium(
            args.article, fields, body, token, author_id,
            publish=args.publish, dry_run=args.dry_run
        )
        if medium_url and not args.dry_run:
            set_frontmatter_key(args.article, 'medium_url', medium_url)
            set_frontmatter_key(args.article, 'external_url', medium_url)
            print(f'Frontmatter updated: medium_url + external_url')

    # --- LinkedIn ---
    if args.linkedin:
        existing = fields.get('linkedin_posted', '').strip('"\'')
        if existing == 'true' and not args.force and not args.dry_run:
            sys.exit('Already posted to LinkedIn. Use --force to repost.')

        access_token = '' if args.dry_run else require_env('LINKEDIN_ACCESS_TOKEN')
        person_urn = '' if args.dry_run else require_env('LINKEDIN_PERSON_URN')
        ok = publish_to_linkedin(
            args.article, fields, body, access_token, person_urn,
            dry_run=args.dry_run
        )
        if ok and not args.dry_run:
            set_frontmatter_key(args.article, 'linkedin_posted', 'true')
            print('Frontmatter updated: linkedin_posted')

    # --- X ---
    if args.x:
        existing = fields.get('x_posted', '').strip('"\'')
        if existing == 'true' and not args.force and not args.dry_run:
            sys.exit('Already posted to X. Use --force to repost.')

        api_key = '' if args.dry_run else require_env('X_API_KEY')
        api_secret = '' if args.dry_run else require_env('X_API_SECRET')
        access_token = '' if args.dry_run else require_env('X_ACCESS_TOKEN')
        access_secret = '' if args.dry_run else require_env('X_ACCESS_TOKEN_SECRET')
        ok = post_to_x(
            args.article, fields, body, api_key, api_secret, access_token, access_secret,
            medium_url=medium_url, dry_run=args.dry_run
        )
        if ok and not args.dry_run:
            set_frontmatter_key(args.article, 'x_posted', 'true')
            print('Frontmatter updated: x_posted')

    if not any([args.medium, args.linkedin, args.x, args.whoami_medium]):
        print('No platform specified. Use --medium, --linkedin, --x, or --whoami-medium.')
        parser.print_help()


if __name__ == '__main__':
    main()
