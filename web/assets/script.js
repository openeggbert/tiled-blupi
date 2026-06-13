/* tiled-blupi Documentation — shared script */

(function () {
  'use strict';

  /* ── Theme toggle ── */
  const THEME_KEY = 'tb-theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = theme === 'dark' ? '☀ Light' : '☾ Dark';
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  /* ── Sidebar hamburger ── */
  function initSidebar() {
    const btn = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    if (!btn || !sidebar) return;
    btn.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !btn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  /* ── Mark active sidebar link ── */
  function markActive() {
    const path = window.location.pathname;
    document.querySelectorAll('.sidebar a').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href) return;
      const url = new URL(href, window.location.href);
      if (url.pathname === path || (path.endsWith('/index.html') && url.pathname.endsWith('/'))) {
        a.classList.add('active');
      }
    });
  }

  /* ── Client-side search ── */
  function initSearch() {
    const input = document.getElementById('searchInput');
    const results = document.getElementById('search-results');
    if (!input || !results) return;

    let index = null;

    function loadIndex(cb) {
      if (index) return cb(index);
      const base = input.dataset.base || '';
      fetch(base + 'assets/search-index.js')
        .then((r) => r.text())
        .then((text) => {
          const m = text.match(/window\.SEARCH_INDEX\s*=\s*(\[[\s\S]*?\]);/);
          if (m) {
            index = JSON.parse(m[1]);
            cb(index);
          }
        })
        .catch(() => {});
    }

    function doSearch(q) {
      q = q.trim().toLowerCase();
      if (!q || q.length < 2) { results.innerHTML = ''; return; }
      loadIndex((idx) => {
        const matches = idx.filter((item) => {
          return item.title.toLowerCase().includes(q) ||
                 item.body.toLowerCase().includes(q);
        }).slice(0, 15);
        if (matches.length === 0) {
          results.innerHTML = '<p style="color:var(--muted)">No results found.</p>';
          return;
        }
        const base = input.dataset.base || '';
        results.innerHTML = matches.map((item) => `
          <div class="search-result">
            <div><a href="${base}${item.url}">${item.title}</a>
            <span class="result-path">${item.url}</span></div>
            <p>${item.body.substring(0, 140).trim()}…</p>
          </div>
        `).join('');
      });
    }

    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => doSearch(input.value), 200);
    });
  }

  /* ── Header search ── */
  function initHeaderSearch() {
    const form = document.getElementById('headerSearchForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = form.querySelector('input').value.trim();
      if (q) {
        const base = form.dataset.base || '';
        window.location.href = base + 'search.html?q=' + encodeURIComponent(q);
      }
    });
  }

  /* ── Search page auto-run ── */
  function initSearchPage() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      input.value = q;
      input.dispatchEvent(new Event('input'));
    }
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    const btn = document.getElementById('themeBtn');
    if (btn) btn.addEventListener('click', toggleTheme);
    initSidebar();
    markActive();
    initSearch();
    initHeaderSearch();
    initSearchPage();
  });
})();
