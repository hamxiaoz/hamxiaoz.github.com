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

## Structure

```
content/posts/       — blog posts (.md files and page bundle folders)
content/ann/         — ann section pages
content/             — standalone pages (books, ying, park, etc.)
layouts/             — Hugo templates
static/assets/       — CSS, JS, fonts, images
data/                — JSON data files (quotes, categories, projects)
assets/              — SCSS processed by Hugo Pipes
```
