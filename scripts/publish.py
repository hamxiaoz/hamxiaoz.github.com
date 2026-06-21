#!/usr/bin/env python3
"""
Publishing engine for hamxiaoz.github.com articles.

Posts to X (Twitter). Medium and LinkedIn are published manually — see the
/publish-hugo-article skill — because neither offers a reliable self-serve
publishing API anymore (Medium stopped issuing integration tokens; LinkedIn
native articles require closed partner access).

Usage:
    python scripts/publish.py <article_path> --x [--dry-run] [--force]

Options:
    --x         Post to X (Twitter)
    --dry-run   Show what would be sent without calling any APIs
    --force     Repost even if already posted
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
# HTTP helper
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
              dry_run=False):
    title = fields.get('title', '').strip('"\'')
    x_post = fields.get('x_post', '').strip('"\'')
    x_hashtags = fields.get('x_hashtags', '').strip('"\'')

    # Substitute {url} placeholder with the canonical/external URL
    url_to_use = fields.get('external_url', '').strip('"\'') or \
                 fields.get('medium_url', '').strip('"\'') or '{url}'
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
    parser = argparse.ArgumentParser(description='Post an article to X (Twitter)')
    parser.add_argument('article', nargs='?', help='Path to markdown article file')
    parser.add_argument('--x', action='store_true', help='Post to X')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be sent, no API calls')
    parser.add_argument('--force', action='store_true', help='Repost even if already posted')
    args = parser.parse_args()

    load_dotenv()

    if not args.article:
        parser.print_help()
        sys.exit(1)

    if not os.path.exists(args.article):
        sys.exit(f'ERROR: File not found: {args.article}')

    fields, body, _ = read_article(args.article)
    title = fields.get('title', os.path.basename(args.article)).strip('"\'')
    print(f'Article: {title}')

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
            dry_run=args.dry_run
        )
        if ok and not args.dry_run:
            set_frontmatter_key(args.article, 'x_posted', 'true')
            print('Frontmatter updated: x_posted')
    else:
        print('No platform specified. Use --x.')
        print('Medium and LinkedIn are published manually — run the /publish-hugo-article skill.')
        parser.print_help()


if __name__ == '__main__':
    main()
