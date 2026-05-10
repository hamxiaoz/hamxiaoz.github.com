# QR Code Features — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add QR codes to the blog post polaroid download feature: a scannable QR code replaces the 📸 button on the page (click to download, scan to share URL), and the same QR code appears inside the downloaded polaroid PNG.

**Architecture:** The `qrcode` npm package (browser build from jsDelivr, lazy-loaded on page init) generates the QR code as a data URL. One `<img>` is rendered on the page inside `.dl-qr-wrap`; a second `<img>` sits inside `#download-card` so html2canvas captures it automatically. Clicking `.dl-qr-wrap` triggers the existing html2canvas download flow unchanged.

**Tech Stack:** Hugo templates, vanilla JS (ES5-compatible), SCSS, qrcode v1.5.3 (CDN via jsDelivr), html2canvas v1.4.1 (CDN via cdnjs — already in place)

---

## File Map

| File | Change |
|------|--------|
| `layouts/blog/single.html` | Add `<img class="dl-qr-img">` inside `#download-card`; replace `.dl-btn-wrap` block with `.dl-qr-wrap` block |
| `assets/main.scss` | Remove `.dl-btn-wrap` / `.dl-btn`; add `.dl-qr-block` / `.dl-qr-wrap` / `.dl-qr-label` |
| `static/assets/js/site.js` | Rewrite `initDownloadButton()`: load qrcode lib on init, generate both QR images, wire click on wrap |

---

### Task 1: Update template

**Files:**
- Modify: `layouts/blog/single.html`

- [ ] **Step 1: Open the template and locate the two blocks to change**

  Read `layouts/blog/single.html`. The two regions to change are:
  1. Inside `#download-card`, between `</div><!-- .dl-polaroid-content -->` (line 41) and `<div class="dl-polaroid-credit">` (line 42) — add a QR img here.
  2. Lines 47–49 — the `.dl-btn-wrap` / `#dl-btn` block — replace with `.dl-qr-wrap`.

- [ ] **Step 2: Replace both regions so the file reads exactly**

  The complete new file content (copy verbatim):

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
            <div class="dl-qr-block">
              <img class="dl-qr-img" alt="">
            </div>
            <div class="dl-polaroid-credit">zurassic.com</div>
          </div>
        </div>
      </div>

      {{/* QR code — scan to share URL, click to download polaroid PNG */}}
      <div class="dl-qr-wrap" id="dl-qr-wrap">
        <img id="dl-qr-img" alt="Scan to share">
        <p class="dl-qr-label">scan · click to save</p>
      </div>

  </article>
  {{ end }}
  ```

  Key changes:
  - `#download-card` now has `.dl-qr-block` > `img.dl-qr-img` between the content area and the credit line
  - `.dl-btn-wrap` / `#dl-btn` replaced by `.dl-qr-wrap` / `#dl-qr-wrap` with an `img#dl-qr-img` and a label
  - Both `img` elements start with empty `src` — JS fills them after QR lib loads

- [ ] **Step 3: Start dev server and verify no regressions**

  ```bash
  hugo server
  ```

  Open any blog post. Check:
  - No visible broken-image icon at the bottom (the `<img>` has no src yet, it should be invisible or 0×0 — verify in DevTools that width/height are 0 before JS runs)
  - The page otherwise looks identical to before (category block still appears, no layout shift)
  - The hidden `#download-card` does not affect scrollbar or page width

- [ ] **Step 4: Commit**

  ```bash
  git add layouts/blog/single.html
  git commit -m "feat: add QR img placeholders to template (page + polaroid card)"
  ```

---

### Task 2: Update SCSS

**Files:**
- Modify: `assets/main.scss`

- [ ] **Step 1: Darken the polaroid outer background**

  In `assets/main.scss`, find the `.dl-polaroid-outer` rule (around line 312) and change its background from light grey to near-black:

  ```scss
  .dl-polaroid-outer {
    background: #1c1c1e;
    padding: 24px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, .25);
  }
  ```

  The white `.dl-polaroid-inner` frame now pops against the dark background like a photo on a dark surface. The credit text (`color: #bbb`) stays inside the white frame so no color change needed there.

- [ ] **Step 2: Find the existing button styles**

  In `assets/main.scss`, locate the block starting at `.dl-btn-wrap` (around line 351) through the closing `}` of `.dl-btn` (around line 379). This entire block will be replaced.

- [ ] **Step 3: Replace `.dl-btn-wrap` / `.dl-btn` with QR styles**

  Delete the existing `.dl-btn-wrap` and `.dl-btn` rules and replace them with:

  ```scss
  // ── Page QR code widget (replaces download button) ──────────────────────

  .dl-qr-wrap {
    text-align: center;
    margin: 1.5em 0 0.25em;
    cursor: pointer;
    display: inline-block;
    width: 100%;

    img {
      display: inline-block;
      opacity: 0.55;
      transition: opacity 0.15s;
    }

    &:hover img {
      opacity: 0.85;
    }
  }

  .dl-qr-label {
    display: block;
    color: #ccc;
    font-size: 9px;
    letter-spacing: .06em;
    margin-top: 5px;
  }

  // ── QR block inside polaroid download card ───────────────────────────────

  .dl-qr-block {
    text-align: center;
    padding: 14px 0 2px;

    img {
      display: inline-block;
    }
  }
  ```

- [ ] **Step 4: Verify build and layout**

  ```bash
  hugo server
  ```

  Open a blog post and verify:
  - No horizontal scrollbar (QR wrap is `width: 100%` but `text-align: center` keeps it contained)
  - The empty img at the bottom is not visible (0×0 with no src renders as nothing)
  - No SCSS compilation errors in the hugo server output

- [ ] **Step 5: Commit**

  ```bash
  git add assets/main.scss
  git commit -m "feat: dark polaroid background; replace button styles with QR widget styles"
  ```

---

### Task 3: Update `initDownloadButton()` in site.js

**Files:**
- Modify: `static/assets/js/site.js` (lines 141–211)

- [ ] **Step 1: Replace the entire `initDownloadButton` function**

  Find the function from the comment `/* ── Blog post image download ──` through the closing `}` (currently lines 141–211). Replace it entirely with:

  ```javascript
  /* ── Blog post image download ───────────────────────────────────────────
     On load: lazy-loads qrcode from jsDelivr, generates QR for the page URL
     into both the on-page widget and the hidden #download-card.
     On click of .dl-qr-wrap: lazy-loads html2canvas, captures the card as
     a 2× PNG polaroid with QR embedded, and triggers a browser download. */
  function initDownloadButton() {
    var qrWrap = document.getElementById('dl-qr-wrap');
    var card   = document.getElementById('download-card');
    if (!qrWrap || !card) return;

    var html2canvasPromise = null;
    var qrLibPromise = null;
    var pageUrl = window.location.href.replace(/\/$/, '');

    function loadQrLib() {
      if (qrLibPromise) return qrLibPromise;
      qrLibPromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
        s.onload  = resolve;
        s.onerror = function (err) { qrLibPromise = null; reject(err); };
        document.head.appendChild(s);
      });
      return qrLibPromise;
    }

    function loadHtml2Canvas() {
      if (html2canvasPromise) return html2canvasPromise;
      html2canvasPromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        s.onload  = resolve;
        s.onerror = function (err) { html2canvasPromise = null; reject(err); };
        document.head.appendChild(s);
      });
      return html2canvasPromise;
    }

    function getSlug() {
      var parts = window.location.pathname.replace(/\/$/, '').replace(/\.html$/, '').split('/');
      return parts[parts.length - 1] || 'post';
    }

    function populateCard() {
      var h1   = document.querySelector('article h1');
      var time = document.querySelector('article time');
      var body = document.querySelector('article .post-content:not(.dl-body)');
      card.querySelector('.dl-title').textContent = h1   ? h1.textContent   : '';
      card.querySelector('.dl-date').textContent  = time ? time.textContent  : '';
      card.querySelector('.dl-body').innerHTML    = body ? body.innerHTML    : '';
    }

    /* Generate QR codes on page load — fills both the visible widget
       and the hidden card img so html2canvas can capture it immediately */
    loadQrLib().then(function () {
      var opts = { width: 80, margin: 1, color: { dark: '#343434', light: '#ffffff' } };
      QRCode.toDataURL(pageUrl, opts, function (err, dataUrl) {
        if (err) return;
        document.getElementById('dl-qr-img').src     = dataUrl;
        card.querySelector('.dl-qr-img').src          = dataUrl;
      });
    });

    /* Click → download polaroid PNG */
    qrWrap.addEventListener('click', function () {
      qrWrap.style.opacity       = '0.4';
      qrWrap.style.pointerEvents = 'none';

      populateCard();

      loadHtml2Canvas()
        .then(function () {
          return window.html2canvas(card, { scale: 2, useCORS: true, logging: false });
        })
        .then(function (canvas) {
          return new Promise(function (resolve) {
            canvas.toBlob(function (blob) {
              var url = URL.createObjectURL(blob);
              var a = document.createElement('a');
              a.download = getSlug() + '.png';
              a.href = url;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              resolve();
            }, 'image/png');
          });
        })
        .catch(function (err) {
          console.error('[dl] image capture failed', err);
        })
        .then(function () {
          qrWrap.style.opacity       = '';
          qrWrap.style.pointerEvents = '';
        });
    });
  }
  ```

  What changed vs. the old function:
  - Entry guard now looks for `#dl-qr-wrap` instead of `#dl-btn`
  - `loadQrLib()` added (lazy-loads `qrcode@1.5.3` from jsDelivr)
  - QR generation fires on page load (not on click), filling `#dl-qr-img` on the page and `.dl-qr-img` inside `#download-card`
  - Click target is now `qrWrap` (the whole block); busy state fades the block and disables pointer events instead of swapping emoji on a button
  - `loadHtml2Canvas`, `getSlug`, `populateCard`, and the `canvas.toBlob` download flow are unchanged

- [ ] **Step 2: Verify the DOMContentLoaded block still calls `initDownloadButton()`**

  The block at the bottom of site.js should be unchanged:

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

  No change needed here — just confirm it's still there.

- [ ] **Step 3: Manual end-to-end test**

  ```bash
  hugo server
  ```

  Open a blog post (e.g. `http://localhost:1313/blog/`). Open DevTools Network tab. Then:

  1. **Page load:** After a moment, a small QR code appears at the bottom of the post, centered, subtly faded. Confirm `qrcode.min.js` was fetched from jsDelivr (~40 KB).
  2. **QR scan:** Use a phone camera to scan the on-page QR code. Confirm it opens the blog post URL.
  3. **Click QR:** The QR block fades to 40% opacity. After ~10 seconds, a PNG file named after the slug downloads.
  4. **Open the PNG:** Verify the polaroid layout — grey outer background, white frame, light grey content area, post title, date, article body, **QR code below the content**, "zurassic.com" credit at the bottom.
  5. **QR in PNG:** Use a phone camera to scan the QR code inside the downloaded PNG. Confirm it opens the correct blog post URL.
  6. **Second click:** `qrcode.min.js` and `html2canvas.min.js` are NOT re-fetched (both cached in closures). PNG downloads again.
  7. **Non-blog page** (e.g. homepage): Confirm no JS errors in console — `initDownloadButton` exits early since `#dl-qr-wrap` is absent.

- [ ] **Step 4: Commit**

  ```bash
  git add static/assets/js/site.js
  git commit -m "feat: replace download button with QR code widget; embed QR in polaroid PNG"
  ```

---

## Done

All three files changed. The feature is complete when:
- A small QR code appears at the bottom of every blog post (scannable to open the URL)
- Clicking the QR downloads a polaroid PNG that also contains a QR code for the same URL
- No layout regressions on any other page type
- Both QR codes decode correctly to the post URL
