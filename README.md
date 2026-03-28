## Dev

To run locally: `hugo server`

To build: `hugo --minify`

Deployed automatically via GitHub Actions on push to `master`.

## Writing a blog post

### Post without images

Create a single Markdown file in `content/posts/`:

```
content/posts/2026-03-08-my-post-title.md
```

```markdown
---
title: "My Post Title"
category: "category-name"
---

Post content here.
```

The date is read from the filename — no `date:` field needed.

### Post with images (page bundle)

Create a folder instead of a file. Put `index.md` and all images together:

```
content/posts/2026-03-08-my-post-title/
  index.md
  photo.jpg
  another.jpg
```

`index.md` has the same front matter as above. Reference images by filename only:

```markdown
![](photo.jpg)
![caption text](another.jpg)
```

No S3 upload, no full URLs — just drop the image in the folder and reference it by name.

### Categories

Categories are defined in `data/blogcategory.json`. The `category:` field in front matter must match a key in that file exactly.

## Images

### Post images → page bundle
Put images alongside the post's `index.md` (see "Post with images" above). Reference by filename only — no path needed.

### Site UI images → static folder
Hero, logo, portfolio thumbnails, and other site-wide images go in:

```
static/assets/images/
```

Reference them in templates or `hugo.toml` with the absolute URL path `/assets/images/filename.ext`.

## Structure

```
content/posts/       — blog posts (.md files and page bundle folders)
content/lists/       — evergreen list pages (books, movies, games, etc.)
content/ann/         — ann section pages
content/             — standalone pages (ying, park, etc.)
layouts/             — Hugo templates
static/assets/       — CSS, JS, fonts, images
data/                — JSON data files (quotes, categories, projects)
assets/              — SCSS processed by Hugo Pipes
```

## Layout system

All page content is centered via two CSS classes in `static/assets/css/zurassic.css`:

| Class | Max-width | Use for |
|-------|-----------|---------|
| `.page-content` | 1100px (`--t-max`) | Section pages, cards grids, interactive pages |
| `.page-content.page-content--prose` | 680px | Blog posts, reading lists, long-form text |

Both classes apply the same horizontal padding (32px) and top padding (80px, to clear the fixed nav).

`.portfolio-section` (used by section list pages like `/work/`, `/writing/`, etc.) is aliased to the same rules as `.page-content` — no change needed there.

When adding a new layout, wrap the main content in one of these:

```html
<!-- standard page -->
<div class="page-content">…</div>

<!-- prose / reading page -->
<article class="page-content page-content--prose">…</article>
```

## Single page layouts

There are two single-page layouts:

| Layout | Used by | Front matter |
|--------|---------|--------------|
| `layouts/posts/single.html` | Blog posts and any article-style reading page | `type: posts` |
| `layouts/_default/single.html` | Custom full-page content (ann apps, ying, park) — manages its own layout via inline HTML | (default, no type needed) |

To make any page render like a blog post (centered title, date, narrow text column), add `type: posts` to its front matter. Example: `content/lists/books.md` uses this.

## Adding a new list page (books, movies, games…)

Create a file in `content/lists/`:

```markdown
---
title: "Movies I've Watched"
description: "Films watched since 2020"
date: 2025-01-01
type: posts
---

Content here.
```

It automatically appears in the 书单 section on the `/blog` page.