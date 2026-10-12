/* Shared helpers: game history and best scores (localStorage, always in try/catch). */
(function (w) {
  'use strict';
  var HISTORY_KEY = 'quizverse-history';
  var BEST_KEY = 'quizverse-best';
  var MAX_HISTORY = 30;

  function read(key, fallback) {
    try { var v = w.localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function write(key, value) {
    try { w.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  w.QV = {
    labels: { html: 'HTML5', css: 'CSS3', js: 'JavaScript', web: 'Web and accessibility', mix: 'Mixed' },
    levels: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
    history: function () { return read(HISTORY_KEY, []); },
    best: function () { return read(BEST_KEY, {}); },
    /* Saves a finished game and tells whether it is a new personal best for the topic. */
    save: function (r) {
      var h = read(HISTORY_KEY, []);
      h.unshift(r);
      write(HISTORY_KEY, h.slice(0, MAX_HISTORY));
      var b = read(BEST_KEY, {});
      var prev = b[r.category];
      var isBest = !prev || r.percent > prev.percent || (r.percent === prev.percent && r.points > prev.points);
      if (isBest) { b[r.category] = { percent: r.percent, points: r.points }; write(BEST_KEY, b); }
      return { isBest: isBest, previous: prev || null };
    },
    clear: function () {
      try { w.localStorage.removeItem(HISTORY_KEY); w.localStorage.removeItem(BEST_KEY); } catch (e) { /* ignore */ }
    }
  };
})(window);
