/* Home page: question counts, best scores per topic and personal stats. */
(function () {
  'use strict';
  var best = QV.best();
  var history = QV.history();

  document.querySelectorAll('[data-count]').forEach(function (el) {
    var key = el.getAttribute('data-count');
    var n = key === 'mix'
      ? Object.keys(QUIZ_DATA).reduce(function (s, k) { return s + QUIZ_DATA[k].questions.length; }, 0)
      : QUIZ_DATA[key].questions.length;
    el.textContent = n + ' questions';
  });

  document.querySelectorAll('[data-best]').forEach(function (el) {
    var b = best[el.getAttribute('data-best')];
    if (b) { el.textContent = 'Best: ' + b.percent + '%'; }
  });

  var played = history.length;
  var totalPoints = history.reduce(function (s, r) { return s + r.points; }, 0);
  var avg = played ? Math.round(history.reduce(function (s, r) { return s + r.percent; }, 0) / played) : 0;
  document.getElementById('stat-played').textContent = played;
  document.getElementById('stat-avg').textContent = played ? avg + '%' : '–';
  document.getElementById('stat-points').textContent = totalPoints;
})();
