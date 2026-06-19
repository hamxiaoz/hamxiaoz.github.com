---
name: add-blog-link
description: >
  Add a Medium or LinkedIn article link to the blog section of hamxiaoz.github.com.
  Use when the user provides a Medium or LinkedIn article URL and wants to create a
  new entry in content/blog/ that shows up on the /blog page as an external link.
  Trigger: "add blog link", "add to blog", "/add-blog-link",
  plus any time user pastes a Medium/LinkedIn URL with intent to save it to the blog section.
allowed-tools:
  - WebFetch
  - Write
  - AskUserQuestion
---

# add-blog-link

Add a Medium or LinkedIn article to the blog section of hamxiaoz.github.com.
The article will appear in the /blog page and link out to the original URL.

## Steps

1. **Parse input** — extract the URL from the user's message. Also note if they specified a category.

2. **Ask for category if missing** — if no category was given, ask:
   > Which category? `诗和远方`, `蓝人女王传`, `ùzhi青年`, `MM`, `Gift Exchange` — or a new one?

3. **Fetch the page** — use WebFetch on the URL.

4. **Extract metadata** from the page HTML:
   - **title**: `og:title` meta tag, or the `<title>` tag (strip site name suffix like " | Medium")
   - **date**: `article:published_time` meta tag, or `datePublished` in JSON-LD, or the visible publish date — format as `YYYY-MM-DD`

5. **Slugify the title** — lowercase, replace spaces and special chars with hyphens, collapse multiple hyphens, strip leading/trailing hyphens. Example: `"My Article: A Story!"` → `my-article-a-story`

6. **Write the file** to `content/blog/<slug>.md`:

```yaml
---
title: "<title>"
date: <YYYY-MM-DD>
category: "<category name>"
external_url: "<url>"
---
```

7. **Confirm** — print the file path and the frontmatter that was written.
