---
name: publish-hugo-article
description: >
  Publish a Hugo markdown article to Medium, LinkedIn, and/or X (Twitter).
  Interactively guides step-by-step: generates a LinkedIn hook, hashtags for all
  platforms, and a tweet draft — asks for confirmation at each step before writing
  to frontmatter or calling any publishing API.
  Trigger: "/publish-hugo-article", "publish article", "publish this to medium",
  "publish to linkedin", "post this article", "share article".
  Uses scripts/publish.py as the publishing engine (handles API calls).
allowed-tools:
  - Read
  - Glob
  - Edit
  - Bash
  - AskUserQuestion
---

You are running the `publish-hugo-article` skill. Follow these steps in order.
Do NOT skip steps. Do NOT publish anything without explicit user confirmation.

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
If any platform is already published, tell the user and ask if they want to re-publish (use `--force` flag).

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
- Include `{url}` as placeholder (replaced at publish time)
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

Tell the user: "I've written the suggestions to the article frontmatter. You can always edit them directly in the file before publishing."

---

## STEP 7 — Choose platforms

Ask the user which platforms to publish to using AskUserQuestion with multiSelect: true:

Options:
- "Medium (draft)" — publishes as hidden draft for review before going public
- "Medium (public)" — goes live immediately  
- "LinkedIn (full article)"
- "X (post)"

---

## STEP 8 — Publish

For each selected platform, show a preview and confirm before calling the script.

### Before each publish, confirm:

**Medium draft:**
> "Ready to publish to Medium as a DRAFT. You'll need to log into Medium to make it public.
> Title: {title}
> Tags: {medium_tags}"
> Confirm?

**Medium public:**
> "Ready to publish to Medium as PUBLIC (goes live immediately).
> Title: {title}
> Tags: {medium_tags}"
> Confirm?

**LinkedIn:**
> "Ready to publish full article to LinkedIn.
> Hook: {linkedin_hook}
> Hashtags: {linkedin_hashtags}"
> Confirm?

**X:**
> "Ready to post to X:
> {x_post with url substituted if medium_url available, otherwise '{url}' shown literally}
> ({char_count}/280 chars)"
> Confirm?

### Run the script (only after confirmation):

Check that `scripts/publish.py` exists first. If it doesn't, tell the user to run the setup.

Run all commands from the repo root with `python3`:

```bash
# Medium draft
python3 scripts/publish.py {article_path} --medium

# Medium public  
python3 scripts/publish.py {article_path} --medium --publish

# LinkedIn
python3 scripts/publish.py {article_path} --linkedin

# X
python3 scripts/publish.py {article_path} --x
```

Show the output of each command. If a command fails, show the error and suggest fixes (missing `.env` credentials, expired token, etc.).

---

## STEP 9 — Summary

After all publishing is done, show a summary:

```
Published successfully:
- Medium draft: {url or "pending"}
- LinkedIn: posted ✓
- X: posted ✓

The article frontmatter has been updated with publish status.
Next: run `hugo server` to verify the site card links to the correct external URL.
```

If any platform failed, note it clearly and suggest re-running just that platform.

---

## Error handling

**Missing `.env` or credentials:**
Tell the user exactly which variable is missing and where to get it:
- `MEDIUM_TOKEN`: medium.com → Settings → Integration tokens
- `MEDIUM_AUTHOR_ID`: run `python3 scripts/publish.py --whoami-medium`
- `LINKEDIN_ACCESS_TOKEN`: run `python scripts/linkedin_auth.py`
- `LINKEDIN_PERSON_URN`: printed by `linkedin_auth.py`
- `X_*` credentials: run `python scripts/x_auth.py`

**Already published:**
Show existing URL and ask if they want to republish with `--force`.

**LinkedIn API restricted:**
If the script reports the Articles API is restricted, explain that LinkedIn requires Partner Program access for native article publishing. Offer to fall back to a long-form post instead.
