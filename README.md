# QuizVerse – Interactive Quiz (v2)

A playful web-dev quiz built with plain HTML5, CSS3 and JavaScript (no framework, no build step).

## Run it
Open `index.html` in a browser. Nothing to install.

## Structure
```
quizverse/
├── index.html      Home: topic, difficulty and length, question types, scoring, progress
├── quiz.html       Quiz interface + final results and answer review
├── scores.html     Personal bests and game history
├── assets/favicon.svg
├── css/style.css   All styles (Flexbox, Grid, themes, animations, responsive)
└── js/
    ├── theme.js    Dark / light theme (remembered)
    ├── storage.js  Shared helpers: history and best scores (localStorage)
    ├── data.js     Question bank (40 questions, easy to extend)
    ├── quiz.js     Quiz engine: timer, scoring, streaks, 50/50, results
    ├── home.js     Counts, best scores and stats on the home page
    └── scores.js   Scores page rendering
```

## Features
- 5 modes: HTML5, CSS3, JavaScript, Web and accessibility, Mixed
- 4 question types: single choice, true/false, select all that apply, type the answer
- 3 difficulty levels (30 / 20 / 12 s per question, points x1 / x1.5 / x2) and 5 / 8 / 10 questions
- Dynamic points: each correct answer starts at 20 points and decreases to a 5-point minimum as time runs; streak bonuses and difficulty multipliers apply after the time penalty. Wrong answers and timeouts score 0.
- Instant feedback (colour + icon + text), shake/pop animations, confetti for scores of 70% and more
- Final screen: animated score ring, stats, personal best, copyable score, answer review with explanations
- Scores page with history table, bests per topic and data reset
- Responsive (mobile-first, Flexbox + Grid), dark and light themes, keyboard shortcuts (1-4, Enter)
- Accessibility: landmarks, skip link, ARIA live feedback, visible focus, labelled form controls, reduced-motion support

## Add questions
Edit `js/data.js`. Formats are documented at the top of the file.

## Scoring
For a correct answer, the time penalty is rounded from 15 points across the question's timer. The earned points are `(20 - time penalty + streak bonus) × difficulty multiplier`, rounded to a whole point. The streak bonus is `min(streak - 1, 5)`; a correct answer at the last second still earns at least the 5-point base before the multiplier. Wrong answers and timeouts earn 0 and reset the streak. The results screen reports the total time penalty after applying the difficulty multiplier.

## Validation
Check each page at https://validator.w3.org/ (Validate by File Upload) and the CSS at https://jigsaw.w3.org/css-validator/.
