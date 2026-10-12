/* Scores page: personal bests and game history. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var history = QV.history();
  var best = QV.best();

  /* Personal bests */
  var grid = $('best-grid');
  Object.keys(QV.labels).forEach(function (key) {
    var li = document.createElement('li');
    li.className = 'best-card';
    var name = document.createElement('span');
    name.className = 'best-card__name';
    name.textContent = QV.labels[key];
    var value = document.createElement('strong');
    var sub = document.createElement('span');
    if (best[key]) { value.textContent = best[key].percent + '%'; sub.textContent = best[key].points + ' points'; }
    else { value.textContent = '–'; sub.textContent = 'No score yet'; }
    li.appendChild(name); li.appendChild(value); li.appendChild(sub);
    grid.appendChild(li);
  });

  /* History */
  if (!history.length) {
    $('history-wrap').hidden = true;
    $('clear-btn').hidden = true;
    $('empty').hidden = false;
    return;
  }
  var body = $('history-body');
  history.forEach(function (r) {
    var tr = document.createElement('tr');
    var cells = [
      new Date(r.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
      QV.labels[r.category] || r.category,
      QV.levels[r.level] || r.level,
      r.correct + '/' + r.count + ' (' + r.percent + '%)',
      r.points,
      r.bestStreak
    ];
    cells.forEach(function (text, i) {
      var cell = document.createElement(i === 0 ? 'th' : 'td');
      if (i === 0) { cell.scope = 'row'; }
      cell.textContent = text;
      tr.appendChild(cell);
    });
    body.appendChild(tr);
  });

  $('clear-btn').addEventListener('click', function () {
    if (window.confirm('Delete all saved scores on this device?')) {
      QV.clear();
      window.location.reload();
    }
  });
})();
