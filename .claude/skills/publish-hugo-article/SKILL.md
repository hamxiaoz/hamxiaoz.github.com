---
name: publish-hugo-article
description: >
  Prepare a Hugo markdown article for publishing to Medium, LinkedIn, and X.
  Generates a LinkedIn hook, hashtags, Medium tags, and a copy-paste-ready
  LinkedIn post and tweet; writes them to frontmatter; then guides MANUAL
  posting on all three platforms — because none of them offer a reliable
  self-serve publishing API anymore (see "Why manual" below). Records the
  published URL for each platform back into frontmatter for tracking. Never
  touches external_url — the /writing and /blog cards always keep linking to
  the canonical blog page.
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
Do NOT skip steps. Every platform in this skill is copy-paste only — never call
an API or run a posting script on the user's behalf. This skill implements the
flow documented in `docs/publishing-plan.md` — if the two ever disagree, that
doc is the source of truth for policy; treat this file as its mechanical
execution.

## Why manual (read this first)

As of 2026, none of Medium, LinkedIn, or X offer a publishing path worth
automating, so this skill prepares content for manual posting on all three:

- **Medium** stopped issuing new integration tokens (~2025) and the API is
  officially unsupported. Only pre-2025 legacy tokens still work. The best manual
  path is Medium's **"Import a story"** feature, which pulls the article from its
  canonical URL with full formatting.
- **LinkedIn** native article publishing (`/rest/articles`) requires closed
  partner access that LinkedIn is not currently granting. Only a plain **feed
  post** is self-serve, and the legacy `/v2/ugcPosts` endpoint is deprecated. So
  this skill produces a ready-to-paste feed post that links back to your site.
- **X** free-tier write access still technically works, but the user has chosen
  to keep posting manual across the board rather than manage API credentials
  for one platform while the other two are copy-paste. This skill always prints
  a ready-to-paste tweet — it never calls the X API.

The canonical copy of every article lives on the Hugo site (zurassic.com). Medium,
LinkedIn, and X all link back to it — but the site itself never links out to
them from list pages (see `external_url` note in Step 10).

---

## STEP 1 — Identify the article

If the user provided a file path, use it. Otherwise:
1. Run (from the repo root): `find content/writing -name "*.md" ! -name "_index.md" -newer content/writing -maxdepth 3 | head -10` to find recent articles
2. Use Glob to list files in `content/writing/**/*.md` (excluding `_index.md`)
3. Ask the user which article to publish using AskUserQuestion

Read the article file fully before proceeding.

---

## STEP 2 — Check publish state

Look at the frontmatter for existing `linkedin_url`, `medium_url`, `x_url`.
If any are already set, tell the user that platform is already published and
ask whether they want to redo it.

---

## STEP 3 — Confirm the blog is published (canonical first)

The article must be live on zurassic.com before anything below can link to it.

- If the article isn't committed/deployed yet, tell the user to publish it
  first (the site builds via GitHub Actions on push to `master`), then
  re-run this skill.
- If it's live, ask for (or derive and confirm) the canonical URL, e.g.
  `https://zurassic.com/writing/<section>/<slug>/`. Remember Hugo lowercases
  section names in URLs (a section folder named `AI` renders as `/writing/ai/...`).
- Recommend waiting ~24h after the blog publish before syndicating, so Google
  indexes the blog URL as the original.

Hold onto this URL — call it `{canonical_url}` below.

---

## STEP 4 — Generate suggestions

Read the article title and body carefully, then generate ALL of the following yourself (no external API/model call needed):

### LinkedIn hook
1–2 sentences that:
- Open with a provocative insight, counterintuitive claim, or relatable pain point
- Do NOT start with "I" or the article title
- Target the professional audience implied by the article topic
- End with a subtle forward pull (make them want to read on)

### LinkedIn hashtags
5–7 hashtags. Mix: 1–2 broad (#Engineering, #Leadership), 2–3 topic-specific, 1–2 niche. Format: `#Tag1 #Tag2 #Tag3`

### Medium tags
3–5 tags as plain lowercase words (no `#`) — Medium's tag taxonomy, e.g. `engineering`, `leadership`, `ai`, `programming`, `productivity`.

### X post
A complete tweet-thread opener:
- Start with the hook (condensed to 1 punchy sentence)
- Include `{url}` as placeholder (replaced at post time with the canonical URL)
- End with 3–4 hashtags
- Total length ≤ 240 characters (leaves room for the URL)

### X hashtags
3–4 hashtags for X. Shorter and punchier than LinkedIn.

---

## STEP 5 — Confirm the LinkedIn hook

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

## STEP 6 — Confirm hashtags and tags

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

## STEP 7 — Write metadata to frontmatter

Use the Edit tool to add/update these fields in the article's frontmatter (between the `---` delimiters). Add them after existing fields:

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

## STEP 8 — LinkedIn (manual)

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

After they post, ask for the published LinkedIn URL and use Edit to set
`linkedin_url: "{url}"` in frontmatter.

---

## STEP 9 — Medium (manual)

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

Recommend publishing 2–3 days after the blog and LinkedIn, not same-day.

After they post, ask for the published Medium URL and use Edit to set
`medium_url: "{url}"` in frontmatter.

---

## STEP 10 — X (manual)

Ask whether to post to X. If yes, print the `x_post` with `{url}` replaced by
`{canonical_url}`, truncated to 280 chars if needed, inside a fenced block:

```
X — copy-paste this as a new post (x.com, "Post"):

{x_post with {url} replaced}
```

Mention the thread-building tips from the plan: break at natural beats, lead
with the strongest hook, put the blog link in the **last** tweet (never the
first), pin the thread, and consider a quote-tweet of the best line a day
later. Always manual — this skill never calls the X API or runs a posting
script.

After they post, ask for the published X/tweet URL and use Edit to set
`x_url: "{url}"` in frontmatter.

**Do not set `external_url`** on any of these three steps. `external_url`
controls where the `/writing` and `/blog` list-page cards link — it must stay
unset (or pointed at nothing) so those cards always link to the canonical blog
page, never out to Medium/LinkedIn/X. `linkedin_url`/`medium_url`/`x_url` are
for your own tracking only.

---

## STEP 11 — Optional: communities

For "buildy" articles (a tool or app people can try), ask if the user wants to
also post to:
- Show HN (title + link + repo)
- Relevant subreddits
- Product Hunt, timed the same week as the other launches

This step is optional and not tracked in frontmatter.

---

## STEP 12 — Summary

Show a checklist of what was prepared and what's been recorded:

```
Prepared and written to frontmatter: hook, hashtags, Medium tags, X post.

Posted:
- LinkedIn: {linkedin_url, or "not yet"}
- Medium: {medium_url, or "not yet"}
- X: {x_url, or "not yet"}

external_url was not touched — the /writing card still links to {canonical_url}.
```

---

## Error handling

**Missing canonical URL:** the article must be live on the site before Medium
import or the LinkedIn/X links will work. Tell the user to commit/deploy first.

**User asks to publish via an API instead of copy-paste:** explain why this
skill is manual-only across all three platforms (see "Why manual" above) and
steer them back to the import/copy-paste flow for that platform. Only deviate if
the user explicitly says they hold a working pre-2025 Medium token or LinkedIn
partner access — X automation is out of scope for this skill regardless of
credentials, since the user has chosen manual-everywhere for consistency.

**User asks to set `external_url` to a platform URL:** confirm they really want
the site's list-page card to send readers off-site instead of to the canonical
blog page — this is a deliberate deviation from the default (see Step 10) and
should be a conscious choice, not a side effect of running this skill.
