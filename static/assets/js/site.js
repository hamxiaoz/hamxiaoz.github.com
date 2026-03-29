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

  /* ── Init ───────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initTracking();
    initQuoteWidget();
    initNavScroll();
    initParkEasterEgg();
  });

}());
