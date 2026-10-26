/* QuizVerse: quiz engine (4 question types, levels, timer, points, streaks, 50/50, results). */
(function () {
  'use strict';

  var LEVELS = {
    easy:   { label: 'Easy',   time: 30, mult: 1 },
    medium: { label: 'Medium', time: 20, mult: 1.5 },
    hard:   { label: 'Hard',   time: 12, mult: 2 }
  };
  var KIND_LABELS = { single: 'Single choice', tf: 'True or false', multi: 'Select all that apply', text: 'Type the answer' };
  var RING_LENGTH = 339.3; // 2 * PI * 54
  var BASE_POINTS = 20;
  var MIN_POINTS = 5;

  var $ = function (id) { return document.getElementById(id); };
  var has = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };

  /* ---------- Settings from the URL ---------- */
  var params = new URLSearchParams(window.location.search);
  var category = params.get('category');
  if (category !== 'mix' && !has(QUIZ_DATA, category)) { category = 'mix'; }
  var levelKey = has(LEVELS, params.get('level')) ? params.get('level') : 'medium';
  var level = LEVELS[levelKey];
  var count = parseInt(params.get('count'), 10);
  if ([5, 8, 10].indexOf(count) === -1) { count = 10; }

  /* ---------- Helpers ---------- */
  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function norm(s) { return String(s).toLowerCase().replace(/[\s"'`;]/g, ''); }

  /* Turns a raw question into a playable one (shuffled options, indexes of right answers). */
  function prepare(q) {
    var p = { kind: q.t || 'single', text: q.q, explanation: q.e, hint: q.h || '' };
    if (p.kind === 'tf') {
      p.options = ['True', 'False'];
      p.correct = [q.a ? 0 : 1];
    } else if (p.kind === 'text') {
      p.accepted = q.a;
    } else {
      var right = (p.kind === 'multi' ? q.a : [q.a]).map(function (i) { return q.o[i]; });
      p.options = shuffle(q.o);
      p.correct = [];
      p.options.forEach(function (t, i) { if (right.indexOf(t) > -1) { p.correct.push(i); } });
    }
    return p;
  }
  function answerText(q) {
    return q.kind === 'text' ? q.accepted[0] : q.correct.map(function (i) { return q.options[i]; }).join(' + ');
  }

  var pool = category === 'mix'
    ? Object.keys(QUIZ_DATA).reduce(function (all, k) { return all.concat(QUIZ_DATA[k].questions); }, [])
    : QUIZ_DATA[category].questions;
  var questions;
  var title = QV.labels[category] + ' quiz';

  /* ---------- State ---------- */
  var current = 0, points = 0, correctCount = 0, streak = 0, bestStreak = 0;
  var fiftyLeft = 1, locked = false, timeLeft = level.time, timerId = null;
  var log = [], times = [], timePenaltyTotal = 0, leaving = false, confettiTimer = null;

  function buildQuestions() { questions = shuffle(pool).slice(0, count).map(prepare); }
  buildQuestions();

  $('quiz-title').textContent = title;
  $('level-info').textContent = level.label + ' level: ' + level.time + ' s per question, points ×' + level.mult;
  document.title = title + ' – QuizVerse';

  function optionEls() { return Array.prototype.slice.call($('options').children); }

  /* ---------- Timer ---------- */
  function paintTimer() {
    $('time-left').textContent = timeLeft;
    $('timer-bar').style.width = (timeLeft / level.time * 100) + '%';
    $('timer-chip').classList.toggle('is-low', timeLeft <= 5);
    var elapsed = level.time - timeLeft;
    var penalty = Math.round((BASE_POINTS - MIN_POINTS) * elapsed / level.time);
    $('potential').textContent = Math.round((BASE_POINTS - penalty + Math.min(streak, 5)) * level.mult);
  }
  function stopTimer() { clearInterval(timerId); }
  function startTimer() {
    stopTimer();
    timeLeft = level.time;
    paintTimer();
    timerId = setInterval(function () {
      timeLeft--;
      paintTimer();
      if (timeLeft <= 0) { submit({ timeout: true }); }
    }, 1000);
  }

  function updateFifty() {
    var q = questions[current];
    $('fifty-btn').disabled = locked || q.kind !== 'single' || fiftyLeft < 1;
    $('fifty-left').textContent = fiftyLeft > 0 ? '1 left' : 'used';
  }

  /* ---------- Rendering a question ---------- */
  function render() {
    var q = questions[current];
    locked = false;

    $('counter').textContent = 'Question ' + (current + 1) + ' of ' + questions.length;
    $('qtype').textContent = KIND_LABELS[q.kind];
    $('question-text').textContent = q.text;

    var progress = Math.round(current / questions.length * 100);
    $('progress-bar').style.width = progress + '%';
    $('progress').setAttribute('aria-valuenow', progress);

    var isText = q.kind === 'text';
    var box = $('options');
    box.textContent = '';
    box.hidden = isText;
    $('text-answer').hidden = !isText;

    if (isText) {
      var input = $('answer-input');
      input.value = '';
      input.disabled = false;
      input.className = 'text-input';
      $('hint').textContent = q.hint ? 'Hint: ' + q.hint : '';
    } else {
      q.options.forEach(function (text, i) {
        var el;
        var inner = '<span class="option__key" aria-hidden="true"></span><span class="option__text"></span><span class="option__icon" aria-hidden="true"></span>';
        if (q.kind === 'multi') {
          el = document.createElement('label');
          el.className = 'option option--check';
          el.innerHTML = '<input class="option__input" type="checkbox">' + inner;
          el.querySelector('input').addEventListener('change', function (e) {
            el.classList.toggle('is-selected', e.target.checked);
          });
        } else {
          el = document.createElement('button');
          el.type = 'button';
          el.className = 'option';
          el.innerHTML = inner;
          el.addEventListener('click', function () { submit({ choice: [i] }); });
        }
        el.querySelector('.option__key').textContent = i + 1;
        el.querySelector('.option__text').textContent = text;
        box.appendChild(el);
      });
    }

    $('feedback').hidden = true;
    $('next-btn').hidden = true;
    $('check-btn').hidden = !(q.kind === 'multi' || isText);
    updateFifty();

    var card = $('card');
    card.classList.remove('is-wrong', 'is-enter', 'is-leaving');
    void card.offsetWidth; // restart the CSS animation
    card.classList.add('is-enter');

    startTimer();
    if (isText) { $('answer-input').focus({ preventScroll: true }); }
    else { $('question-text').focus({ preventScroll: true }); }
  }

  /* ---------- Answering ---------- */
  function checkedIndexes() {
    return optionEls().reduce(function (acc, el, i) {
      if (el.querySelector('input') && el.querySelector('input').checked) { acc.push(i); }
      return acc;
    }, []);
  }

  function submit(a) {
    if (locked) { return; }
    var q = questions[current];
    if (q.kind === 'text' && !a.timeout && !a.text.trim()) { $('answer-input').focus(); return; }

    locked = true;
    stopTimer();

    var ok = false, chosen = '', picked = [];
    if (a.timeout) {
      chosen = '';
    } else if (q.kind === 'text') {
      chosen = a.text.trim();
      ok = q.accepted.some(function (x) { return norm(x) === norm(chosen); });
    } else {
      picked = a.choice.slice().sort(function (x, y) { return x - y; });
      ok = picked.length === q.correct.length && picked.every(function (v, i) { return v === q.correct[i]; });
      chosen = picked.map(function (i) { return q.options[i]; }).join(' + ');
    }

    /* Visual state */
    if (q.kind === 'text') {
      var input = $('answer-input');
      input.disabled = true;
      input.classList.add(ok ? 'is-correct' : 'is-wrong');
    } else {
      optionEls().forEach(function (el, k) {
        var control = el.querySelector('input') || el;
        control.disabled = true;
        if (q.correct.indexOf(k) > -1) { el.classList.add('is-correct'); }
        else if (picked.indexOf(k) > -1) { el.classList.add('is-wrong'); }
        else { el.classList.add('is-dim'); }
      });
    }

    /* Correct answers lose points as time passes, with a floor of MIN_POINTS. */
    var gained = 0, timePenalty = 0;
    if (ok) {
      streak++;
      bestStreak = Math.max(bestStreak, streak);
      correctCount++;
      var elapsed = level.time - timeLeft;
      timePenalty = Math.round((BASE_POINTS - MIN_POINTS) * elapsed / level.time);
      gained = Math.round((BASE_POINTS - timePenalty + Math.min(streak - 1, 5)) * level.mult);
      timePenaltyTotal += Math.round(timePenalty * level.mult);
      points += gained;
      $('score').textContent = points;
      var chip = $('score').parentNode;
      chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
    } else {
      streak = 0;
      $('card').classList.add('is-wrong');
    }
    $('streak').textContent = streak;
    times.push(a.timeout ? level.time : level.time - timeLeft);
    log.push({ kind: q.kind, text: q.text, chosen: chosen, answer: answerText(q), ok: ok, explanation: q.explanation, timePenalty: timePenalty });

    /* Feedback message (announced by the live region) */
    var fb = $('feedback');
    fb.className = 'feedback ' + (ok ? 'feedback--ok' : 'feedback--ko');
    $('feedback-title').textContent = ok
      ? 'Correct! +' + gained + ' points (time penalty -' + Math.round(timePenalty * level.mult) + ')' + (streak >= 2 ? ', streak of ' + streak : '')
      : (a.timeout ? 'Time’s up!' : 'Not quite.');
    $('feedback-text').textContent = (ok ? '' : 'The right answer is “' + answerText(q) + '”. ') + q.explanation;
    fb.hidden = false;

    $('check-btn').hidden = true;
    updateFifty();
    var next = $('next-btn');
    next.textContent = current === questions.length - 1 ? 'See my results' : 'Next question';
    next.hidden = false;
    next.focus();
  }

  /* ---------- 50/50 lifeline ---------- */
  $('fifty-btn').addEventListener('click', function () {
    var q = questions[current];
    if (locked || q.kind !== 'single' || fiftyLeft < 1) { return; }
    var wrong = [];
    q.options.forEach(function (t, i) { if (q.correct.indexOf(i) === -1) { wrong.push(i); } });
    var els = optionEls();
    shuffle(wrong).slice(0, 2).forEach(function (i) {
      els[i].disabled = true;
      els[i].classList.add('is-removed');
    });
    fiftyLeft--;
    updateFifty();
    var firstFree = els.filter(function (el) { return !el.disabled; })[0];
    if (firstFree) { firstFree.focus(); }
  });

  /* ---------- Results ---------- */
  function showResults() {
    var total = questions.length;
    var percent = Math.round(correctCount / total * 100);

    $('quiz-section').hidden = true;
    $('results-section').hidden = false;
    $('percent').textContent = percent;
    $('verdict').textContent = percent >= 90 ? 'Outstanding!' : percent >= 70 ? 'Great job!' :
                               percent >= 50 ? 'Not bad, keep going.' : 'Time to review the basics.';
    $('result-text').textContent = 'You answered ' + correctCount + ' of ' + total + ' questions correctly (' +
                                   level.label + ' level).';

    var avg = (times.reduce(function (s, t) { return s + t; }, 0) / times.length).toFixed(1);
    $('r-points').textContent = points;
    $('r-correct').textContent = correctCount + '/' + total;
    $('r-streak').textContent = bestStreak;
    $('r-time').textContent = avg + ' s';
    $('r-penalties').textContent = timePenaltyTotal;

    var saved = QV.save({
      date: Date.now(), category: category, level: levelKey, count: total,
      correct: correctCount, points: points, bestStreak: bestStreak, percent: percent, timePenalty: timePenaltyTotal
    });
    var prev = saved.previous;
    $('best-text').textContent = saved.isBest ? 'New personal best on this topic!'
                                              : 'Your best here: ' + prev.percent + '% (' + prev.points + ' points)';

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        $('ring').style.strokeDashoffset = RING_LENGTH * (1 - percent / 100);
      });
    });

    if (percent >= 70) { confetti(); }

    var list = $('review');
    list.textContent = '';
    log.forEach(function (h) {
      var li = document.createElement('li');
      li.className = 'review__item ' + (h.ok ? 'review__item--ok' : 'review__item--ko');
      var parts = [
        ['review__meta', (h.ok ? 'Correct' : 'Wrong') + ' – ' + KIND_LABELS[h.kind]],
        ['review__q', h.text],
        ['review__a', h.ok ? 'Your answer: ' + h.answer
                           : (h.chosen ? 'You answered “' + h.chosen + '”. ' : 'No answer given. ') + 'Right answer: “' + h.answer + '”.'],
        ['review__why', h.explanation]
      ];
      parts.forEach(function (p) {
        var el = document.createElement('p');
        el.className = p[0];
        el.textContent = p[1];
        li.appendChild(el);
      });
      list.appendChild(li);
    });

    $('results-title').focus();

    $('share-btn').onclick = function () {
      var msg = 'I scored ' + points + ' points (' + correctCount + '/' + total + ') on the ' + title +
                ', ' + level.label + ' level. Can you beat me?';
      var status = $('copy-status');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).then(
          function () { status.textContent = 'Score copied to the clipboard.'; },
          function () { status.textContent = 'Copy failed. Select and copy this text: ' + msg; });
      } else {
        status.textContent = 'Copy is not available here. ' + msg;
      }
    };
  }

  function confetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }
    var box = $('confetti');
    box.textContent = '';
    for (var i = 0; i < 40; i++) {
      var s = document.createElement('span');
      s.className = 'c' + (i % 4);
      s.style.left = Math.random() * 100 + '%';
      s.style.animationDelay = (Math.random() * 0.8) + 's';
      s.style.animationDuration = (2.2 + Math.random() * 1.6) + 's';
      box.appendChild(s);
    }
    clearTimeout(confettiTimer);
    confettiTimer = setTimeout(function () { box.textContent = ''; }, 5000);
  }

  function resetGame() {
    stopTimer();
    clearTimeout(confettiTimer);
    current = 0; points = 0; correctCount = 0; streak = 0; bestStreak = 0;
    fiftyLeft = 1; locked = false; timeLeft = level.time; log = []; times = [];
    timePenaltyTotal = 0; leaving = false;
    buildQuestions();
    $('score').textContent = '0'; $('streak').textContent = '0';
    $('score').parentNode.classList.remove('bump');
    $('progress-bar').style.width = '0%'; $('progress').setAttribute('aria-valuenow', '0');
    $('ring').style.strokeDashoffset = RING_LENGTH;
    $('confetti').textContent = ''; $('copy-status').textContent = '';
    $('quiz-section').hidden = false; $('results-section').hidden = true;
    render();
  }

  /* ---------- Events ---------- */
  $('next-btn').addEventListener('click', function () {
    if (leaving) { return; }
    if (current < questions.length - 1) {
      leaving = true;
      var card = $('card');
      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) { current++; leaving = false; render(); return; }
      var finished = false, fallback;
      function advance() {
        if (finished) { return; }
        finished = true; clearTimeout(fallback); card.removeEventListener('animationend', onEnd);
        current++; leaving = false; render();
      }
      function onEnd(e) { if (e.target === card) { advance(); } }
      card.addEventListener('animationend', onEnd);
      fallback = setTimeout(advance, 250);
      card.classList.add('is-leaving');
    } else { showResults(); }
  });

  $('check-btn').addEventListener('click', function () {
    var q = questions[current];
    if (q.kind === 'text') { submit({ text: $('answer-input').value }); return; }
    var sel = checkedIndexes();
    if (!sel.length) { optionEls()[0].querySelector('input').focus(); return; }
    submit({ choice: sel });
  });

  $('answer-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); $('check-btn').click(); }
  });

  $('retry-btn').addEventListener('click', resetGame);

  document.addEventListener('keydown', function (e) {
    if (locked || $('quiz-section').hidden || e.ctrlKey || e.metaKey || e.altKey) { return; }
    var q = questions[current];
    if (e.target && e.target.type === 'text') { return; }
    if (e.key === 'Enter' && q.kind === 'multi' && e.target.type === 'checkbox') {
      e.preventDefault(); $('check-btn').click(); return;
    }
    var n = parseInt(e.key, 10);
    if (q.kind === 'text' || isNaN(n) || n < 1 || n > q.options.length) { return; }
    e.preventDefault();
    var el = optionEls()[n - 1];
    if (el.classList.contains('is-removed')) { return; }
    if (q.kind === 'multi') {
      var box = el.querySelector('input');
      box.checked = !box.checked;
      el.classList.toggle('is-selected', box.checked);
    } else {
      submit({ choice: [n - 1] });
    }
  });

  render();
})();
