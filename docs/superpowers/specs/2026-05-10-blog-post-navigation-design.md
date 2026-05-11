# Blog Post Prev/Next Navigation

**Date:** 2026-05-10  
**Status:** Approved

## Summary

Add previous/next post navigation to the bottom of every blog and writing single-post page. Uses Hugo's built-in `.PrevInSection` / `.NextInSection` variables — zero JavaScript required.

## Scope

- `layouts/blog/single.html` — add nav partial
- `layouts/writing/single.html` — add nav partial
- `layouts/partials/post-nav.html` — new shared partial
- `static/assets/layout.css` — add ~20 lines of CSS

No JS. No new dependencies.

## Design

### Visual style

Bottom-of-article strip separated by a `1px` top border. Background `#faf9f7` (matches site tone). Two columns: left = "← Previous", right = "Next →". Title text uses the site's rust-red accent `rgba(147,34,16,0.80)`. Label text is small uppercase gray (`#bbb`).

### Hugo variable mapping

Hugo sorts content newest-first by default, so the variable names feel counter-intuitive:

| Hugo variable     | Direction in list | Shown as     | Position |
|-------------------|-------------------|--------------|----------|
| `.PrevInSection`  | older post        | `← Previous` | left     |
| `.NextInSection`  | newer post        | `Next →`     | right    |

### Edge cases

- **First post** (no older post): `.PrevInSection` is nil — left slot renders a `<span>` spacer so "Next →" floats right.
- **Last post** (no newer post): `.NextInSection` is nil — right slot is omitted, "← Previous" sits left.
- **Only post in section**: both slots empty — nav renders but is invisible (zero content).

### Template structure

```
layouts/partials/post-nav.html
  <nav class="post-nav">
    {{ with .PrevInSection }}
      <a class="post-nav__link post-nav__link--prev" href="{{ .RelPermalink }}">
        <span class="post-nav__label">← Previous</span>
        <span class="post-nav__title">{{ .Title }}</span>
      </a>
    {{ else }}
      <span class="post-nav__spacer"></span>
    {{ end }}
    {{ with .NextInSection }}
      <a class="post-nav__link post-nav__link--next" href="{{ .RelPermalink }}">
        <span class="post-nav__label">Next →</span>
        <span class="post-nav__title">{{ .Title }}</span>
      </a>
    {{ end }}
  </nav>
```

Inserted in both single templates just before `</article>`.

### CSS (added to layout.css)

```css
.post-nav { display:flex; justify-content:space-between; align-items:flex-start;
            padding:20px 0; border-top:1px solid #eee; gap:16px; }
.post-nav__link { display:flex; flex-direction:column; gap:4px;
                  text-decoration:none; max-width:44%; }
.post-nav__link--next { text-align:right; align-items:flex-end; }
.post-nav__label { font-size:0.7rem; text-transform:uppercase;
                   letter-spacing:0.07em; color:#bbb; }
.post-nav__title { font-size:0.84rem; font-weight:600;
                   color:rgba(147,34,16,0.80); line-height:1.35; }
.post-nav__title:hover { color:rgba(147,34,16,1); text-decoration:underline; }
.post-nav__spacer { flex:1; }
```

## Implementation Steps

1. Create `layouts/partials/post-nav.html`
2. Add `{{ partial "post-nav" . }}` to `layouts/blog/single.html` (before `</article>`)
3. Add `{{ partial "post-nav" . }}` to `layouts/writing/single.html` (before `</article>`)
4. Append CSS to `static/assets/layout.css`
5. Test with `hugo server` — verify nav appears on a mid-stream post, a first post, and a last post
