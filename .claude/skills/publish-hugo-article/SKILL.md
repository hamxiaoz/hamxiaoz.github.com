---
name: publish-hugo-article
description: >
  Prepare a Hugo markdown article for publishing to Medium and LinkedIn (and
  optionally X). Generates a LinkedIn hook, hashtags, Medium tags, and a
  copy-paste-ready LinkedIn post; writes them to frontmatter; then guides MANUAL
  posting — because Medium and LinkedIn no longer offer reliable self-serve
  publishing APIs (see "Why manual" below). Records the resulting public URLs
  back into frontmatter so the site's external-link card points to the right
  place. X (Twitter) can still be posted via API.
  Trigger: "/publish-hugo-article", "publish article", "publish this to medium",
  "publish to linkedin", "post this article", "share article".
allowed-tools:
  - Read
  - Glob
  - Edit
  - Bash
  - AskUserQuestion
---

You are running the `publish-hugo-article` skill. Follow these steps in order.
Do NOT skip steps. Do NOT post anything to X without explicit user confirmation.

## Why manual (read this first)

As of 2026, native API publishing to Medium and LinkedIn is not reliably
available, so this skill prepares content for manual posting instead of calling
their APIs:

- **Medium** stopped issuing new integration tokens (~2025) and the API is
  officially unsupported. Only pre-2025 legacy tokens still work. The best manual
  path is Medium's **"Import a story"** feature, which pulls the article from its
  canonical URL with full formatting.
- **LinkedIn** native article publishing (`/rest/articles`) requires closed
  partner access that LinkedIn is not currently granting. Only a plain **feed
  post** is self-serve, and the legacy `/v2/ugcPosts` endpoint is deprecated. So
  this skill produces a ready-to-paste feed post that links back to your site.
- **X** free-tier write access still works, so `scripts/publish.py --x` remains a
  valid optional API path.

The canonical copy of every article lives on the Hugo site (zurassic.com). Medium
and LinkedIn link back to it.

---

## STEP 1 — Identify the article

If the user provided a file path, use it. Otherwise:
1. Run (from the repo root): `find content/writing -name "*.md" ! -name "_index.md" -newer content/writing -maxdepth 3 | head -10` to find recent articles
2. Use Glob to list files in `content/writing/**/*.md` (excluding `_index.md`)
3. Ask the user which article to publish using AskUserQuestion

Read the article file fully before proceeding.

---

## STEP 2 — Check publish state

Look at the frontmatter for existing `medium_url`, `linkedin_posted`, `x_posted` fields.
If any platform is already done, tell the user and ask whether they want to redo it.

---

## STEP 3 — Generate suggestions

Read the article title and body carefully. Then generate ALL of the following yourself (no API call needed — you generate these inline):

### LinkedIn hook
Write 1–2 sentences that:
- Open with a provocative insight, counterintuitive claim, or relatable pain point
- Do NOT start with "I" or the article title
- Target the professional audience implied by the article topic
- End with a subtle forward pull (make them want to read on)

### LinkedIn hashtags
5–7 hashtags. Mix: 1–2 broad (#Engineering, #Leadership), 2–3 topic-specific, 1–2 niche. Format: `#Tag1 #Tag2 #Tag3`

### Medium tags
3–5 tags as plain lowercase words (no `#`). These are Medium's tag taxonomy — use common ones like `engineering`, `leadership`, `ai`, `programming`, `productivity`.

### X post
A complete tweet:
- Start with the hook (condensed to 1 punchy sentence)
- Include `{url}` as placeholder (replaced at post time with the canonical URL)
- End with 3–4 hashtags
- Total length ≤ 240 characters (leaves room for the URL)

### X hashtags
3–4 hashtags for X. Shorter and punchier than LinkedIn.

---

## STEP 4 — Confirm the LinkedIn hook

Present the hook clearly and ask:

```
Here's the LinkedIn hook I generated:

"{hook}"

What would you like to do?
```

Use AskUserQuestion with options:
- "Use this hook"
- "Suggest 2 alternatives"
- "I'll write my own" (then ask them to type it)

If they choose "Suggest 2 alternatives", generate 2 more and ask again.
If they choose "I'll write my own", use AskUserQuestion to collect their text.

---

## STEP 5 — Confirm hashtags and tags

Show all platform metadata together and ask for approval:

```
Here are the suggested tags/hashtags:

LinkedIn hashtags: {linkedin_hashtags}
Medium tags: {medium_tags}
X hashtags: {x_hashtags}
X post preview: {x_post}
```

Use AskUserQuestion:
- "Approve all"
- "Edit LinkedIn hashtags"
- "Edit Medium tags"
- "Edit X post/hashtags"

If they want to edit, use AskUserQuestion to collect the replacement text.

---

## STEP 6 — Write to frontmatter

After hook + hashtags are confirmed, use the Edit tool to add/update these fields in the article's frontmatter (between the `---` delimiters). Add them after existing fields:

```yaml
linkedin_hook: "{confirmed hook}"
linkedin_hashtags: "{confirmed hashtags}"
medium_tags: ["{tag1}", "{tag2}", "{tag3}"]
x_post: "{confirmed x post with {url} placeholder}"
x_hashtags: "{confirmed x hashtags}"
```

Use targeted replacement: find the closing `---` of the frontmatter and insert before it. Do NOT rewrite existing frontmatter fields.

Tell the user: "I've written the suggestions to the article frontmatter. You can always edit them directly in the file before posting."

---

## STEP 7 — Confirm the canonical URL

Medium import and the LinkedIn post both link back to the article on the Hugo
site, so it must be live first.

Ask the user (AskUserQuestion or plain prompt): "Is this article published and
live on zurassic.com? If so, paste its canonical URL (e.g.
`https://zurassic.com/writing/<section>/<slug>/`)."

- If they don't have a URL yet, tell them to commit/deploy the article first (the
  site builds via GitHub Actions), then re-run this step.
- Derive a best-guess URL from the file path and offer it for confirmation, but
  use what the user provides.

Hold onto this URL — call it `{canonical_url}` below.

---

## STEP 8 — Prepare Medium (manual)

Present this to the user:

```
MEDIUM — easiest path is Import a story (keeps formatting):

1. Go to: https://medium.com/p/import
2. Paste the canonical URL: {canonical_url}
3. Click Import — Medium pulls in the title, body, and images.
4. Add these tags (max 5): {medium_tags}
5. Set a canonical link to {canonical_url} under "..." → "Edit settings" so
   Medium's copy doesn't outrank yours in search.
6. Publish (or save as draft to review first).
```

If the user prefers raw copy-paste instead of import, offer to print the article
body (markdown) for them to paste into a new Medium story. Note that Medium's
editor renders pasted markdown as plain text, so import is strongly preferred.

---

## STEP 9 — Prepare LinkedIn (manual)

Build a ready-to-paste **feed post**: the confirmed hook, a one–two sentence
teaser drawn from the article's opening, the canonical link, and the hashtags.
Keep it under ~3000 characters.

Print it inside a fenced block so it's easy to copy:

```
LINKEDIN — copy-paste this as a new post (linkedin.com/feed, "Start a post"):

{linkedin_hook}

{1–2 sentence teaser}

Read the full piece: {canonical_url}

{linkedin_hashtags}
```

If the user instead wants a native LinkedIn **Article** (the long-form editor at
linkedin.com/article/new), offer to print the full article body for copy-paste,
and remind them to set the article's link/source back to {canonical_url}.

---

## STEP 10 — X (optional, API or manual)

Ask whether to post to X. If yes, offer two paths:

- **API:** check `scripts/publish.py` exists, then from the repo root run
  `python3 scripts/publish.py {article_path} --x`. The script substitutes the URL
  into `x_post`, truncates to 280 chars, posts via the X API, and sets
  `x_posted: true` in frontmatter. Requires the `X_*` credentials in `.env`
  (run `python3 scripts/x_auth.py` to obtain them). Show the command output.
- **Manual:** print the `x_post` with `{url}` replaced by `{canonical_url}`,
  truncated to 280 chars, for them to paste at x.com.

---

## STEP 11 — Record results in frontmatter

Manual posting means the skill can't capture URLs automatically. After the user
confirms what they posted, use the Edit tool to update frontmatter so the site's
external-link card points correctly:

- If they published to Medium, ask for the resulting Medium URL and set both
  `medium_url: "{url}"` and `external_url: "{url}"`. (`external_url` drives the
  card link on the /writing and /blog pages — without it the card has nowhere to
  go. Prefer the canonical Hugo URL or the Medium URL per the user's preference.)
- If they posted to LinkedIn, set `linkedin_posted: true`.
- If X was posted manually, set `x_posted: true` (the API path sets this itself).

Use targeted replacement; don't rewrite unrelated frontmatter.

---

## STEP 12 — Summary

Show a checklist of what was prepared and what the user still needs to do:

```
Prepared and written to frontmatter: hook, hashtags, Medium tags, X post.

To finish posting:
- Medium: import {canonical_url} at medium.com/p/import  (tags: {medium_tags})
- LinkedIn: paste the feed post above
- X: {posted via API ✓ | paste the tweet above}

Frontmatter updated with: {list of fields set, e.g. medium_url, external_url, linkedin_posted}
Run `hugo server` to verify the site card links to the right URL.
```

---

## Error handling

**Missing canonical URL:** the article must be live on the site before Medium
import or the LinkedIn link will work. Tell the user to commit/deploy first.

**User asks to publish to Medium/LinkedIn via API:** explain why that's no longer
self-serve (see "Why manual" above) and steer them to the import / copy-paste
flow. Only fall back to API publishing if the user explicitly says they hold a
working pre-2025 Medium token or LinkedIn partner access.

**X API fails:** the most common causes are missing `X_*` credentials in `.env`
(run `python3 scripts/x_auth.py`), or the app lacking Read+Write permission. Show
the error and offer the manual copy-paste tweet instead.
