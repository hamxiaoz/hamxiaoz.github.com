/* site.js — replaces jQuery + Semantic UI JS + FastClick + jquery.address
   Vanilla JS, no dependencies */

(function () {
  'use strict';

  /* ── Tab switching ──────────────────────────────────────────────────────
     Reads the active tab from the URL hash on load and activates it.
     Updates the hash when a tab is clicked.
     Sends a GA pageview for each tab shown. */
  function initTabs() {
    var menuItems = document.querySelectorAll('.site-tab .item[data-tab]');
    var panels    = document.querySelectorAll('.ui.tab[data-tab]');

    if (!menuItems.length) return;

    function activateTab(tabName) {
      menuItems.forEach(function (item) {
        item.classList.toggle('active', item.dataset.tab === tabName);
      });
      panels.forEach(function (panel) {
        panel.classList.toggle('active', panel.dataset.tab === tabName);
      });
    }

    function getHashTab() {
      /* jquery.address used the hash as the tab identifier */
      var hash = window.location.hash.replace(/^#\/?/, '');
      return hash || null;
    }

    /* Activate tab from hash, or default to first tab */
    var initial = getHashTab();
    var firstTab = menuItems[0] && menuItems[0].dataset.tab;
    activateTab(initial && document.querySelector('.ui.tab[data-tab="' + initial + '"]')
      ? initial
      : firstTab);

    menuItems.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        var tabName = item.dataset.tab;
        activateTab(tabName);
        history.replaceState(null, '', '#' + tabName);
        if (window.ga) { ga('send', 'pageview', tabName); }
      });
    });

    window.addEventListener('hashchange', function () {
      var tabName = getHashTab();
      if (tabName && document.querySelector('.ui.tab[data-tab="' + tabName + '"]')) {
        activateTab(tabName);
      }
    });
  }

  /* ── GA click tracking ──────────────────────────────────────────────────
     Elements with class "trackable" and data-ga attribute */
  function initTracking() {
    document.querySelectorAll('.trackable[data-ga]').forEach(function (el) {
      el.addEventListener('click', function () {
        if (window.ga) { ga('send', 'pageview', el.dataset.ga); }
      });
    });
  }

  /* ── Random quote widget ────────────────────────────────────────────────
     Fetches /assets/data/quotes.json and displays a random entry.
     The refresh button picks a different one each time. */
  function initQuoteWidget() {
    var container  = document.querySelector('.quote-container');
    var textEl     = document.querySelector('.quote-text');
    var authorEl   = document.querySelector('.quote-author');
    var refreshBtn = document.querySelector('.random-quote');

    if (!container || !textEl || !authorEl) return;

    var currentIndex = -1;

    function setLoading(on) {
      container.classList.toggle('loading', on);
      if (refreshBtn) refreshBtn.classList.toggle('loading', on);
    }

    function showQuote(quotes) {
      var i;
      do { i = Math.floor(Math.random() * quotes.length); } while (i === currentIndex && quotes.length > 1);
      currentIndex = i;
      textEl.textContent   = quotes[i].text;
      authorEl.textContent = quotes[i].author;
      setTimeout(function () { setLoading(false); }, 400);
    }

    var cached = null;

    function loadQuote() {
      setLoading(true);
      if (cached) { showQuote(cached); return; }
      fetch('/assets/data/quotes.json')
        .then(function (r) { return r.json(); })
        .then(function (data) { cached = data; showQuote(data); })
        .catch(function ()   { setLoading(false); });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', loadQuote);
    }
    loadQuote();
  }

  /* ── Portfolio nav scroll effect ────────────────────────────────────────
     Adds .scrolled class to .site-nav when page is scrolled > 50px */
  function initNavScroll() {
    var nav = document.getElementById('site-nav');
    if (!nav) return;
    function update() { nav.classList.toggle('scrolled', window.scrollY > 50); }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ── Park easter egg ────────────────────────────────────────────────────
     Double-click (desktop) or double-tap (mobile) the nav logo → /park */
  function initParkEasterEgg() {
    var logo = document.querySelector('.nav-logo');
    if (!logo) return;
    logo.addEventListener('dblclick', function (e) {
      e.preventDefault();
      window.location.href = '/park';
    });
    var lastTap = 0;
    logo.addEventListener('touchend', function (e) {
      var now = Date.now();
      if (now - lastTap < 300) {
        e.preventDefault();
        window.location.href = '/park';
      }
      lastTap = now;
    });
  }

  /* ── Blog post image download ───────────────────────────────────────────
     On load: lazy-loads qrcode from jsDelivr, generates QR for the page URL
     into both the on-page widget and the hidden #download-card.
     On click of #dl-qr-wrap: lazy-loads html2canvas, captures the card as
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
        if (err) { console.warn('[dl] QR generation failed', err); return; }
        var pageImg = document.getElementById('dl-qr-img');
        if (pageImg) { pageImg.src = dataUrl; }
        card.querySelector('.dl-qr-img').src = dataUrl;
      });
    }).catch(function () {});

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

  /* ── Init ───────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initTracking();
    initQuoteWidget();
    initNavScroll();
    initParkEasterEgg();
    initDownloadButton();
  });

}());
