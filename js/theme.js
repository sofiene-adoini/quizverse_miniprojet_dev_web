
(function () {
  'use strict';
  var KEY = 'quizverse-theme';
  var root = document.documentElement;
  var theme = null;
  try { theme = window.localStorage.getItem(KEY); } catch (e) { /* ignore */ }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  root.setAttribute('data-theme', theme);

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) { return; }
    function sync() { btn.setAttribute('aria-pressed', String(root.getAttribute('data-theme') === 'dark')); }
    sync();
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { window.localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
      sync();
    });
  });
})();
