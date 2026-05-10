# Download Blog Post as Polaroid Image — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a subtle 📸 pill button at the bottom of every blog post that downloads the full article as a polaroid-style PNG image.

**Architecture:** A hidden off-screen `<div id="download-card">` is rendered in the template and holds the polaroid layout. On button click, vanilla JS lazy-loads html2canvas from CDN, populates the card with cloned post content, captures it as a 2× PNG, and triggers a browser download. No build step, no npm.

**Tech Stack:** Hugo templates, vanilla JS (ES5-compatible), SCSS, html2canvas v1.4.1 (CDN)

---

## File Map

| File | Role |
|------|------|
| `layouts/blog/single.html` | Add `#download-card` hidden div + `.dl-btn-wrap` button |
| `assets/main.scss` | Add `#download-card` off-screen rule + `.dl-*` polaroid + button styles |
| `static/assets/js/site.js` | Add `initDownloadButton()`, call it from `DOMContentLoaded` |

---

### Task 1: Add hidden render target and button to template

**Files:**
- Modify: `layouts/blog/single.html`

- [ ] **Step 1: Open the template and understand the current structure**

  Read `layouts/blog/single.html`. The file ends with `</article>` at line 33. The button and hidden card both go inside `<article>`, before the closing tag.

- [ ] **Step 2: Add the hidden polaroid card and the 📸 button**

  Replace the closing `</article>` block so the file reads:

  ```html
  {{ define "main" }}
  {{ with .Params.external_url }}
  <meta http-equiv="refresh" content="0; url={{ . }}">
  <meta name="robots" content="noindex">
  <script>window.location.replace("{{ . }}")</script>
  <p>Redirecting… <a href="{{ . }}">Click here if not redirected.</a></p>
  {{ end }}
  <article class="page-content page-content--prose" itemscope itemtype="http://schema.org/BlogPosting">

      <div class="center aligned ui header">
        <h1 itemprop="name headline">{{ .Title | htmlEscape }}</h1>
        <div class="sub header">
          <time datetime="{{ .Date.Format "2006-01-02T15:04:05Z07:00" }}" itemprop="datePublished">{{ .Date.Format "2006-01-02" }}</time>
        </div>
      </div>

      <div class="post-content" itemprop="articleBody">
        {{ .Content }}
      </div>

      {{ with .Params.category }}
        {{ $catName := . }}
        {{ $cat := index (where $.Site.Data.blogcategory "name" $catName) 0 }}
        {{ with $cat }}
          <div class="center aligned category-intro">
            <h4 class="ui horizontal divider disabled header">{{ .click }}</h4>
            <a href="{{ .link }}">{{ $catName }}</a>
            <p>{{ .description | safeHTML }}</p>
          </div>
        {{ end }}
      {{ end }}

      {{/* Hidden polaroid card — off-screen, zero layout impact */}}
      <div id="download-card" aria-hidden="true">
        <div class="dl-polaroid-outer">
          <div class="dl-polaroid-inner">
            <div class="dl-polaroid-content">
              <h2 class="dl-title"></h2>
              <div class="dl-date"></div>
              <div class="post-content dl-body"></div>
            </div>
            <div class="dl-polaroid-credit">zurassic.com</div>
          </div>
        </div>
      </div>

      <div class="dl-btn-wrap">
        <button class="dl-btn" id="dl-btn" title="Save as image">📸</button>
      </div>

  </article>
  {{ end }}
  ```

  Key details:
  - `#download-card` uses `aria-hidden="true"` — screen readers skip it
  - `.dl-body` also carries class `post-content` so existing SCSS (image borders, code styles, hr) applies to cloned content without any extra CSS
  - `.dl-btn-wrap` + `#dl-btn` sit after `#download-card` in DOM order — both inside `<article>`

- [ ] **Step 3: Start the dev server and verify**

  ```bash
  hugo server
  ```

  Open any blog post (e.g. `http://localhost:1313/blog/`). Check:
  - The 📸 button appears at the bottom of the post, centered, small and subtle
  - No layout shift, no unexpected space, no visible hidden card
  - Category section (if present) still appears above the button
  - Page scrollbar is not affected (the -9999px positioning is added in Task 2 — verify after that task)

- [ ] **Step 4: Commit**

  ```bash
  git add layouts/blog/single.html
  git commit -m "feat: add polaroid download card and photo button to blog template"
  ```

---

### Task 2: Add polaroid and button styles to main.scss

**Files:**
- Modify: `assets/main.scss` (append at end of file)

- [ ] **Step 1: Append the download styles to main.scss**

  Add this block at the very end of `assets/main.scss`:

  ```scss
  // ── Blog post image download ─────────────────────────────────────────────

  #download-card {
    position: absolute;
    left: -9999px;
    top: -9999px;
    pointer-events: none;
    width: 800px;
    font-family: Lato, 'Helvetica Neue', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  }

  .dl-polaroid-outer {
    background: #e0e0e0;
    padding: 24px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, .25);
  }

  .dl-polaroid-inner {
    background: #fff;
    padding: 12px 12px 36px;
  }

  .dl-polaroid-content {
    background: #f9f9f9;
    padding: 16px;
    border: 1px solid #eee;
  }

  .dl-title {
    margin: 0 0 4px;
    font-size: 20px;
    color: #343434;
    font-weight: 700;
    line-height: 1.3;
  }

  .dl-date {
    color: #aaa;
    font-size: 11px;
    margin-bottom: 16px;
  }

  .dl-polaroid-credit {
    text-align: center;
    margin-top: 12px;
    color: #bbb;
    font-size: 11px;
    letter-spacing: .06em;
  }

  .dl-btn-wrap {
    text-align: center;
    margin: 1.5em 0 0.25em;
  }

  .dl-btn {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    background: #fff;
    cursor: pointer;
    font-size: 11px;
    color: #bbb;
    box-shadow: 0 1px 2px rgba(0, 0, 0, .06);
    font-family: inherit;
    letter-spacing: .02em;
    line-height: 1.6;

    &:hover {
      background: #f9f9f9;
    }

    &:disabled {
      cursor: wait;
      opacity: 0.6;
    }
  }
  ```

- [ ] **Step 2: Verify build and layout**

  ```bash
  hugo server
  ```

  Open a blog post and verify:
  - 📸 button is small, pill-shaped, grey, centered — matches the approved mockup
  - No horizontal scrollbar (the `left: -9999px` card must not widen the page)
  - Hover state on the button gives a very slight background change

- [ ] **Step 3: Commit**

  ```bash
  git add assets/main.scss
  git commit -m "feat: add polaroid card and download button styles"
  ```

---

### Task 3: Add `initDownloadButton()` to site.js

**Files:**
- Modify: `static/assets/js/site.js`

- [ ] **Step 1: Add the function before the `/* ── Init ──` comment**

  In `static/assets/js/site.js`, find the `/* ── Init ──` block (currently around line 141). Insert the following function immediately before it:

  ```javascript
  /* ── Blog post image download ───────────────────────────────────────────
     Lazy-loads html2canvas on first click, renders the hidden #download-card
     polaroid, and triggers a PNG download. */
  function initDownloadButton() {
    var btn  = document.getElementById('dl-btn');
    var card = document.getElementById('download-card');
    if (!btn || !card) return;

    var html2canvasPromise = null;

    function loadHtml2Canvas() {
      if (html2canvasPromise) return html2canvasPromise;
      html2canvasPromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        s.onload  = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
      return html2canvasPromise;
    }

    function getSlug() {
      var parts = window.location.pathname.replace(/\.html$/, '').split('/');
      return parts[parts.length - 1] || 'post';
    }

    function populateCard() {
      var h1   = document.querySelector('article h1');
      var time = document.querySelector('article time');
      var body = document.querySelector('article .post-content');

      card.querySelector('.dl-title').textContent = h1   ? h1.textContent   : '';
      card.querySelector('.dl-date').textContent  = time ? time.textContent  : '';
      card.querySelector('.dl-body').innerHTML    = body ? body.innerHTML    : '';
    }

    btn.addEventListener('click', function () {
      btn.textContent = '⏳';
      btn.disabled = true;

      populateCard();

      loadHtml2Canvas()
        .then(function () {
          return window.html2canvas(card, { scale: 2, useCORS: true, logging: false });
        })
        .then(function (canvas) {
          var a = document.createElement('a');
          a.download = getSlug() + '.png';
          a.href = canvas.toDataURL('image/png');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        })
        .catch(function (err) {
          console.error('[dl] image capture failed', err);
        })
        .then(function () {
          btn.textContent = '📸';
          btn.disabled = false;
        });
    });
  }

  ```

  Note: `.then()` is used as a finally-equivalent at the end (always runs, resets button) to stay compatible without requiring ES2018.

- [ ] **Step 2: Call `initDownloadButton()` from the `DOMContentLoaded` block**

  Find the existing init block at the bottom of `site.js`:

  ```javascript
  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initTracking();
    initQuoteWidget();
    initNavScroll();
    initParkEasterEgg();
  });
  ```

  Add the new call:

  ```javascript
  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initTracking();
    initQuoteWidget();
    initNavScroll();
    initParkEasterEgg();
    initDownloadButton();
  });
  ```

- [ ] **Step 3: Manual end-to-end test**

  ```bash
  hugo server
  ```

  Open a blog post that has at least one image. Open DevTools Network tab. Then:

  1. **First click:** Confirm `html2canvas.min.js` is fetched from cdnjs (~600 KB). A PNG file named after the post slug downloads.
  2. **Second click:** Confirm `html2canvas.min.js` is NOT re-fetched (cached in closure). PNG downloads again.
  3. **During capture:** Button shows ⏳ and is disabled. After download, it returns to 📸.
  4. **Open the PNG:** Verify polaroid layout — grey outer background, white frame with extra bottom margin, light grey content area, post title, date, article body with images, `zurassic.com` credit at bottom center.
  5. **Post without category:** Confirm button still appears and works correctly.
  6. **Non-blog page** (e.g. homepage): Confirm no JS errors in console — `initDownloadButton` exits early since `#dl-btn` is absent.

- [ ] **Step 4: Commit**

  ```bash
  git add static/assets/js/site.js
  git commit -m "feat: add initDownloadButton — polaroid PNG download on blog posts"
  ```

---

## Done

All three files changed. The feature is complete when:
- A 📸 pill appears at the bottom of every blog post
- Clicking it downloads a polaroid-style PNG of the full article
- No layout regressions on any other page type
