---
name: new-blog
description: >
  Create a new blog post in the 博客 section of hamxiaoz.github.com (content/blog/).
  Use when the user wants to write/start/scaffold an original blog post (not an external
  link — for Medium/LinkedIn links use add-blog-link instead).
  Trigger: "new blog", "create a blog", "write a blog post", "start a post", "/new-blog".
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - AskUserQuestion
---

# new-blog

Scaffold an original blog post for hamxiaoz.github.com under `content/blog/`. The post
renders via `layouts/blog/single.html`, gets URL `/blog/<slug>.html` (date prefix is
stripped automatically), and appears on `/blog` under 最近, 全部, and its category.

For external Medium/LinkedIn links, use `add-blog-link` instead — this skill is for
original content authored on the site.

## Steps

1. **Get the title.** Take it from the user's message, or ask for it.

2. **Ask: pictures or not?** Use AskUserQuestion:
   - **With photos** → create a *page bundle*: a folder `content/blog/<date>-<slug>/index.md`,
     with placeholder embeds and image files dropped alongside `index.md`.
   - **No photos** → create a *flat file*: `content/blog/<date>-<slug>.md`.

3. **Ask: which category?** Read the live list from `data/blogcategory.json` and offer those
   names via AskUserQuestion, plus an "Uncategorized" option and an "Other (new category)" option.
   - Current categories are typically: `蓝人女王传`, `ùzhi青年`, `诗和远方`, `MM`, `Gift Exchange`.
   - Uncategorized → omit the `category` field (post still shows in 最近 and 全部).
   - New category → write the `category` value as given; mention that to surface it as its own
     section on `/blog`, an entry must be added to `data/blogcategory.json` (offer to do it).

4. **Build the slug.** Lowercase ASCII, hyphen-separated. For Chinese titles, romanize to pinyin
   (match existing posts, e.g. `美味厨师之` → `mei-wei-chu-shi-zhi`, `泳者之心` → `yong-zhe-zhi-xin`).
   Collapse repeated hyphens; strip leading/trailing hyphens.

5. **Date.** Default to today (`date +%Y-%m-%d`) unless the user gave one. The date prefixes the
   filename/folder and is also written in frontmatter.

6. **Write the file** with this frontmatter (drop `category` if Uncategorized):

   ```yaml
   ---
   title: "<title>"
   date: <YYYY-MM-DD>
   category: "<category>"
   ---
   ```

   - **With photos:** add a short intro line and a few placeholder embeds, then tell the user to
     drop the image files into the folder:
     ```markdown
     ![](photo-1.jpg)
     ![](photo-2.jpg)
     ```
     Embed images with plain markdown `![](file.jpg)` (no shortcode/gallery exists — this matches
     the existing photo articles).
   - **No photos:** add a short starter line or the user's provided body.

7. **Chinese punctuation pass (REQUIRED for Chinese posts).** If the title or body is primarily
   Chinese, read the FULL written content and convert ASCII punctuation in the prose to full-width
   Chinese punctuation. See the conversion rules below. Apply with judgment — do NOT blindly regex.

8. **Confirm.** Print the file/folder path and the frontmatter. If a page bundle, remind the user
   to drop `photo-1.jpg`, `photo-2.jpg`, … into the folder (or rename embeds to match their files).

## Chinese punctuation conversion

When a post is Chinese, sentence punctuation should be full-width. Read the whole content and convert:

| ASCII | Chinese | Notes |
|-------|---------|-------|
| `,` | `，` | comma between Chinese clauses |
| `.` | `。` | sentence end (NOT decimals, version numbers, or `.md`/URLs) |
| `?` | `？` | |
| `!` | `！` | |
| `:` | `：` | |
| `;` | `；` | |
| `(` `)` | `（` `）` | when wrapping Chinese text |
| `"..."` | `“...”` | curly double quotes around Chinese |
| `'...'` | `‘...’` | curly single quotes |
| `...` | `……` | ellipsis |
| `--` | `——` | em dash |

**Do NOT convert** punctuation inside:
- YAML frontmatter (the `---` block, `date:`, URLs, filenames)
- code spans/blocks (between backticks or fenced ``` ```)
- image/link markdown targets — `![](photo-1.jpg)`, `[text](https://…)`
- English words, numbers, decimals (`3.14`), version strings, file extensions (`.jpg`)
- HTML comments `<!-- ... -->`

Leave the markdown image/link syntax and any HTML untouched. Only convert punctuation that sits
within Chinese prose.

## Quick reference

| Choice | Result |
|--------|--------|
| With photos | `content/blog/<date>-<slug>/index.md` + image files in same folder |
| No photos | `content/blog/<date>-<slug>.md` |
| Uncategorized | omit `category:` from frontmatter |
| Permalink | `/blog/<slug>.html` (date stripped) |

## Common mistakes

- **Using a shortcode/gallery for images** — there is none. Use plain `![](file.jpg)`.
- **Writing the file before asking about photos/category** — ask first; structure depends on it.
- **Converting punctuation inside frontmatter, code, or image paths** — those stay ASCII.
- **English/numeric punctuation** — `3.14`, `v1.2`, `index.md` keep their ASCII dots.
- **Slug from raw Chinese characters** — romanize to pinyin to match existing URLs.
