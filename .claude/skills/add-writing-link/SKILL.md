---
name: add-writing-link
description: >
  Add a writing article link to the hamxiaoz.github.com site.
  Use when the user provides a Medium or LinkedIn article URL and wants
  to create a new entry in content/writing/<subfolder>/.
  Trigger: "add writing", "add article", "add this link", "/add-writing-link",
  plus any time user pastes a Medium/LinkedIn URL with intent to save it to the writing section.
allowed-tools:
  - WebFetch
  - Write
  - AskUserQuestion
---

# add-writing-link

Add a Medium or LinkedIn article to the writing section of hamxiaoz.github.com.

## Steps

1. **Parse input** — extract the URL from the user's message. Also note if they specified a subfolder (`AI`, `engineering`, `fp`, `leadership`).

2. **Ask for subfolder if missing** — if no subfolder was given, ask:
   > Which subfolder? `AI`, `engineering`, `fp`, `leadership` — or a new one?

3. **Fetch the page** — use WebFetch on the URL.

4. **Extract metadata** from the page HTML:
   - **title**: `og:title` meta tag, or the `<title>` tag (strip site name suffix like " | Medium")
   - **date**: `article:published_time` meta tag, or `datePublished` in JSON-LD, or the visible publish date — format as `YYYY-MM-DD`
   - **cover**: `og:image` meta tag URL — omit the field entirely if not found

5. **Slugify the title** — lowercase, replace spaces and special chars with hyphens, collapse multiple hyphens, strip leading/trailing hyphens. Example: `"My Article: A Story!"` → `my-article-a-story`

6. **Write the file** to `content/writing/<subfolder>/<slug>.md`:

```yaml
---
title: "<title>"
date: <YYYY-MM-DD>
external_url: "<url>"
cover: "<og:image url>"
---
```

Omit the `cover` line if no image was found.

7. **Confirm** — print the file path and the frontmatter that was written.
