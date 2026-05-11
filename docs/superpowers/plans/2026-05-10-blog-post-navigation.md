# Blog Post Prev/Next Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Previous/Next post navigation to the bottom of every `blog` and `writing` single-post page using Hugo's built-in page variables.

**Architecture:** One shared partial (`post-nav.html`) renders the nav strip using `.PrevInSection` (older post, shown left) and `.NextInSection` (newer post, shown right). Both section single templates include it. CSS is appended to the existing `layout.css`. Zero JavaScript.

**Tech Stack:** Hugo templates, plain CSS, no JS, no new dependencies.

**Spec:** `docs/superpowers/specs/2026-05-10-blog-post-navigation-design.md`

---

## File Map

| Action | File |
|--------|------|
| Create | `layouts/partials/post-nav.html` |
| Modify | `layouts/blog/single.html` |
| Modify | `layouts/writing/single.html` |
| Modify | `static/assets/layout.css` |

---

### Task 1: Create the post-nav partial

**Files:**
- Create: `layouts/partials/post-nav.html`

Hugo's `.PrevInSection` points to the post immediately before the current one in section order (Hugo sorts newest-first, so `.PrevInSection` = older post). `.NextInSection` = newer post. The partial gracefully handles first and last posts by using `{{ with }}` which no-ops when the value is nil.

- [ ] **Step 1: Create the partial**

Create `layouts/partials/post-nav.html` with this exact content:

```html
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

- [ ] **Step 2: Commit**

```bash
git add layouts/partials/post-nav.html
git commit -m "feat: add post-nav partial for prev/next navigation"
```

---

### Task 2: Add CSS to layout.css

**Files:**
- Modify: `static/assets/layout.css` (append at end of file)

- [ ] **Step 1: Append the CSS**

Add these rules at the very end of `static/assets/layout.css`:

```css
/* ── Post prev/next navigation ─────────────────────────────────────────── */
.post-nav {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5em 0 0.5em;
  border-top: 1px solid #eee;
  gap: 1em;
  margin-top: 1.5em;
}

.post-nav__link {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
  text-decoration: none;
  max-width: 44%;
}

.post-nav__link--next {
  text-align: right;
  align-items: flex-end;
}

.post-nav__label {
  font-size: 0.7em;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #bbb;
}

.post-nav__title {
  font-size: 0.85em;
  font-weight: 600;
  color: rgba(147, 34, 16, 0.80);
  line-height: 1.35;
}

.post-nav__title:hover {
  color: rgba(147, 34, 16, 1);
  text-decoration: underline;
}

.post-nav__spacer {
  flex: 1;
}
```

- [ ] **Step 2: Commit**

```bash
git add static/assets/layout.css
git commit -m "feat: add post-nav CSS to layout.css"
```

---

### Task 3: Wire into blog/single.html

**Files:**
- Modify: `layouts/blog/single.html`

The current file ends with `</article>` on line 61. The partial goes inside the `<article>`, just before it closes — after the existing polaroid download button block.

- [ ] **Step 1: Add the partial call**

In `layouts/blog/single.html`, find the closing `</article>` tag and insert the partial just before it:

Current (lines 59–61):
```html
    </div>

</article>
```

Replace with:
```html
    </div>

    {{ partial "post-nav" . }}

</article>
```

- [ ] **Step 2: Build and verify output contains nav HTML**

```bash
hugo --quiet 2>&1 | tail -3
grep -l "post-nav" public/blog/*.html | head -3
```

Expected: `hugo` exits 0. At least one `public/blog/*.html` file is listed. If no files match, check that the partial path and template edit are correct.

Then spot-check a mid-stream post:

```bash
grep -A 10 'class="post-nav"' "$(ls public/blog/*.html | sed -n '2p')"
```

Expected: you see both `post-nav__link--prev` and `post-nav__link--next` elements with real href values (not empty).

- [ ] **Step 3: Commit**

```bash
git add layouts/blog/single.html
git commit -m "feat: add prev/next nav to blog single template"
```

---

### Task 4: Wire into writing/single.html

**Files:**
- Modify: `layouts/writing/single.html`

Current file is 13 lines — the partial goes inside `<article>`, just before it closes.

- [ ] **Step 1: Add the partial call**

In `layouts/writing/single.html`, find the closing `</article>` tag and insert the partial just before it:

Current (lines 11–13):
```html
  </div>
</article>
```

Replace with:
```html
  </div>
  {{ partial "post-nav" . }}
</article>
```

- [ ] **Step 2: Build and verify output**

Writing single posts live at `public/writing/<subsection>/<slug>/index.html` (not flat like blog).

```bash
hugo --quiet 2>&1 | tail -3
find public/writing -mindepth 3 -name "index.html" | head -3
```

Expected: `hugo` exits 0. At least a few paths like `public/writing/fp/fp-array/index.html` are listed.

Spot-check a mid-stream writing post:

```bash
TARGET=$(find public/writing -mindepth 3 -name "index.html" | sed -n '2p')
echo "Checking: $TARGET"
grep -A 10 'class="post-nav"' "$TARGET"
```

Expected: you see both prev and next link elements with real URLs.

- [ ] **Step 3: Commit**

```bash
git add layouts/writing/single.html
git commit -m "feat: add prev/next nav to writing single template"
```

---

### Task 5: Verify edge cases and visual check

**Files:** (read-only verification, no changes)

- [ ] **Step 1: Find and verify the oldest blog post (no "Previous")**

Blog posts are flat files at `public/blog/<slug>.html`. Sort by name to find the chronologically oldest (earliest date prefix).

```bash
OLDEST=$(ls public/blog/*.html 2>/dev/null | grep -v "index.html" | sort | head -1)
echo "Checking: $OLDEST"
grep -A 8 'class="post-nav"' "$OLDEST"
```

Expected: you see `post-nav__spacer` on the left (no prev link) and a `post-nav__link--next` on the right.

- [ ] **Step 2: Find and verify the newest blog post (no "Next")**

```bash
NEWEST=$(ls public/blog/*.html 2>/dev/null | grep -v "index.html" | sort | tail -1)
echo "Checking: $NEWEST"
grep -A 8 'class="post-nav"' "$NEWEST"
```

Expected: you see a `post-nav__link--prev` on the left and NO `post-nav__link--next` element.

- [ ] **Step 3: Start dev server and open a blog post**

```bash
hugo server --disableFastRender &
```

Open `http://localhost:1313/blog/` in a browser, click any post, scroll to the bottom. Verify:
- The nav strip appears below the content, separated by a thin line
- "← Previous" is on the left, "Next →" on the right (or one is absent on first/last)
- Links use the rust-red color
- Clicking a link navigates to the correct adjacent post

Kill the server when done: `kill %1`

- [ ] **Step 4: Final commit (if any cleanup needed)**

If no cleanup needed, this task is done. Otherwise:

```bash
git add -p  # stage only intentional changes
git commit -m "fix: <description of any cleanup>"
```
