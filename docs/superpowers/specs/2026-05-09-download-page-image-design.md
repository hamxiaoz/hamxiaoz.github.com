# Download Blog Post as Polaroid Image

**Date:** 2026-05-09  
**Status:** Approved

## Summary

Add a small 📸 button at the bottom of every blog post page. When clicked, it captures the full article as a polaroid-style PNG image and triggers a browser download.

## Button Design

- **Appearance:** Small pill shape, emoji-only label (`📸`), very subtle styling
  - `border: 1px solid #e0e0e0`, `border-radius: 20px`, `box-shadow: 0 1px 2px rgba(0,0,0,.06)`
  - Text color: `#bbb`, font-size: `11px`, padding: `4px 12px`
- **Placement:** Statically positioned, centered, at the very bottom of the article — after the category block (if present), inside `<article>`
- **No floating/fixed positioning** — purely inline in the document flow

## Downloaded Image Design (Polaroid)

Fixed width: **800px** (scale 2× → 1600px for retina-quality PNG).

```
┌─────────────────────────────────────┐  ← grey outer background + shadow
│  ┌───────────────────────────────┐  │  ← white frame (polaroid)
│  │  ┌─────────────────────────┐  │  │  ← light grey content area
│  │  │  Title (bold, dark)     │  │  │
│  │  │  Date (muted, small)    │  │  │
│  │  │                         │  │  │
│  │  │  Article body content   │  │  │
│  │  │  (text + images)        │  │  │
│  │  └─────────────────────────┘  │  │
│  │                                │  │
│  │       zurassic.com             │  │  ← credit, centered, muted
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

- **Outer:** grey background (`#e0e0e0`), `padding: 24px`, drop shadow
- **White frame:** `background: #fff`, `padding: 12px 12px 36px` (extra bottom for polaroid feel)
- **Content area:** `background: #f9f9f9`, `padding: 16px`, `border: 1px solid #eee`
- **Credit:** `zurassic.com`, centered, `font-size: 11px`, `color: #bbb`, `letter-spacing: .06em`

## Architecture

### Files changed

| File | Change |
|------|--------|
| `layouts/blog/single.html` | Add `#download-card` hidden div + 📸 button |
| `assets/main.scss` | Add `#download-card` and `.dl-*` polaroid styles |
| `static/assets/js/site.js` | Add `initDownloadButton()` function |

### Hidden render target

`#download-card` lives inside the `<article>` but is visually off-screen:

```css
#download-card {
  position: absolute;
  left: -9999px;
  top: -9999px;
  pointer-events: none;
}
```

This ensures zero impact on layout, scrolling, or stacking context.

### JavaScript flow (`initDownloadButton`)

1. Find the 📸 button; if absent (non-blog page), return early
2. On click:
   a. Lazy-load html2canvas from CDN (only once; cached in closure)
   b. Populate `#download-card` with:
      - Title text (read from `<h1>` in the article header)
      - Date text (read from `<time>` element)
      - Deep clone of `.post-content` inner HTML
   c. Call `html2canvas(downloadCard, { scale: 2, useCORS: true })`
   d. Convert canvas to PNG data URL
   e. Create `<a download="[slug].png">`, click it, remove it
3. Slug derived from `window.location.pathname` (last segment, strip `.html`)

### CSS isolation

All polaroid styles use the `.dl-` prefix:

- `.dl-polaroid-outer` — grey background wrapper
- `.dl-polaroid-inner` — white frame
- `.dl-polaroid-content` — light grey content area
- `.dl-polaroid-credit` — "zurassic.com" footer text

These classes only exist inside `#download-card` and have no overlap with existing site classes.

## Constraints & Decisions

- **No npm / no build step** — html2canvas v1.4.1 loaded from CDN lazy on first click only:  
  `https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js`
- **`useCORS: true`** on html2canvas — needed for blog post images served from the same origin; cross-origin images fall back to blank gracefully
- **Scale 2×** — produces crisp output on retina displays without changing the 800px layout width
- **Clones `.post-content`** — captures the fully-rendered article (markdown → HTML, images already loaded) rather than re-fetching or re-rendering
- **Does not clone nav/footer** — only article content inside the polaroid frame

## Out of Scope

- Server-side rendering or headless browser capture
- Sharing directly to social media
- Customising the polaroid style per-post
- Applying to non-blog page types (`writing`, `prose`, etc.)
