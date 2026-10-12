/* Question bank.
   t: 'single' (default) | 'tf' | 'multi' | 'text'
   single: { q, o:[4 options], a:index, e }
   tf:     { t:'tf', q, a:true|false, e }
   multi:  { t:'multi', q, o:[...], a:[indexes], e }
   text:   { t:'text', q, a:[accepted answers], h:'hint', e } */
var QUIZ_DATA = {
  html: { label: 'HTML5', questions: [
    { q: 'Which element wraps the dominant, unique content of a page?', o: ['<section>', '<main>', '<aside>', '<div>'], a: 1, e: '<main> identifies the central content. A page should have only one visible <main>.' },
    { q: 'Which attribute provides alternative text for an image?', o: ['title', 'src', 'alt', 'caption'], a: 2, e: 'The alt attribute is read by screen readers and shown when the image fails to load.' },
    { q: 'Which of these is a semantic element?', o: ['<nav>', '<span>', '<b>', '<div>'], a: 0, e: '<nav> tells browsers and assistive technology that the content is a set of navigation links.' },
    { t: 'tf', q: 'The <br> element must be closed with </br>.', a: false, e: '<br> is a void element: it has no content and no closing tag.' },
    { q: 'Which input type displays a native date picker?', o: ['type="calendar"', 'type="time"', 'type="date"', 'type="day"'], a: 2, e: 'type="date" gives a built-in date control and a validated value.' },
    { q: 'Which element groups related form controls and is named by a <legend>?', o: ['<group>', '<fieldset>', '<section>', '<label>'], a: 1, e: '<fieldset> with <legend> gives related controls a shared accessible name.' },
    { t: 'multi', q: 'Which of these are semantic HTML5 elements?', o: ['<header>', '<div>', '<article>', '<span>', '<footer>'], a: [0, 2, 4], e: '<header>, <article> and <footer> carry meaning. <div> and <span> are generic containers.' },
    { t: 'tf', q: 'The <title> element belongs inside <head>.', a: true, e: '<title> sets the tab title and the name used in search results and bookmarks.' },
    { t: 'text', q: 'Which attribute makes a form field mandatory? (one word)', a: ['required'], h: 'It is a boolean attribute, 8 letters.', e: 'The required attribute blocks form submission until the field is filled.' },
    { q: 'Which attribute value opens a link in a new tab?', o: ['target="_new"', 'target="_blank"', 'rel="external"', 'open="tab"'], a: 1, e: 'target="_blank" opens a new browsing context. Add rel="noopener" for safety.' }
  ] },
  css: { label: 'CSS3', questions: [
    { q: 'Which declaration turns an element into a flex container?', o: ['display: flex;', 'flex: container;', 'position: flex;', 'layout: flex;'], a: 0, e: 'display: flex makes the element a flex container and its children flex items.' },
    { q: 'Which unit is relative to the root element’s font size?', o: ['em', 'px', 'vh', 'rem'], a: 3, e: 'rem is based on the font size of <html>, which makes scaling predictable.' },
    { q: 'Which property sets the space between items in a grid?', o: ['gap', 'margin-grid', 'spacing', 'gutter'], a: 0, e: 'gap (formerly grid-gap) controls row and column gutters in Grid and Flexbox.' },
    { q: 'Which at-rule applies styles depending on the viewport width?', o: ['@viewport', '@media', '@screen', '@responsive'], a: 1, e: '@media queries are the backbone of responsive design.' },
    { q: 'What is the default value of the position property?', o: ['relative', 'absolute', 'static', 'fixed'], a: 2, e: 'Elements are static by default, so top, left, right and bottom have no effect.' },
    { q: 'Which declaration creates three equal-width columns?', o: ['columns: 3 equal;', 'grid-template-columns: repeat(3, 1fr);', 'display: columns(3);', 'grid-columns: 3;'], a: 1, e: 'repeat(3, 1fr) creates three columns that share the free space equally.' },
    { t: 'tf', q: 'With the default box-sizing, padding is added to an element’s declared width.', a: true, e: 'content-box is the default. box-sizing: border-box includes padding and border in the width.' },
    { t: 'multi', q: 'Which of these are valid CSS colour values?', o: ['#ff5d9e', 'rgb(255, 93, 158)', 'hsl(340, 100%, 68%)', 'color(pink!)'], a: [0, 1, 2], e: 'Hex, rgb() and hsl() are all valid. "color(pink!)" is not CSS.' },
    { t: 'text', q: 'Which pseudo-class styles an element while the mouse is over it? (type it with its colon)', a: [':hover'], h: 'It starts with a colon and has 5 letters.', e: ':hover matches while a pointing device is over the element.' },
    { t: 'tf', q: 'CSS Grid is designed for two-dimensional layouts (rows and columns).', a: true, e: 'Grid controls both axes at once, while Flexbox mainly handles one axis.' }
  ] },
  js: { label: 'JavaScript', questions: [
    { q: 'Which keyword declares a block-scoped variable that cannot be reassigned?', o: ['var', 'let', 'const', 'static'], a: 2, e: 'const creates a block-scoped binding that cannot be reassigned.' },
    { q: 'What does typeof null return?', o: ['"null"', '"undefined"', '"object"', '"number"'], a: 2, e: 'This is a historical quirk of the language: typeof null is "object".' },
    { q: 'What does "5" + 3 evaluate to?', o: ['8', '"53"', 'NaN', 'Error'], a: 1, e: 'With a string operand, + concatenates, so the number 3 is converted to "3".' },
    { q: 'Which method adds an element to the end of an array?', o: ['push()', 'pop()', 'shift()', 'unshift()'], a: 0, e: 'push() appends to the end. pop() removes from the end.' },
    { q: 'Which method returns the first element matching a CSS selector?', o: ['getElement()', 'querySelector()', 'findElement()', 'selectAll()'], a: 1, e: 'document.querySelector() returns the first match, or null if there is none.' },
    { q: 'Which method converts a JSON string into an object?', o: ['JSON.stringify()', 'JSON.parse()', 'JSON.object()', 'JSON.decode()'], a: 1, e: 'JSON.parse() reads a JSON string. JSON.stringify() does the opposite.' },
    { t: 'tf', q: 'The === operator compares values without converting their types.', a: true, e: '=== is strict equality. == converts types before comparing.' },
    { t: 'multi', q: 'Which of these values are falsy?', o: ['0', '"0"', '""', 'null', '[]'], a: [0, 2, 3], e: '0, an empty string and null are falsy. The string "0" and an empty array are truthy.' },
    { t: 'text', q: 'Which array method builds a new array by transforming every element? (method name only)', a: ['map', 'map()'], h: 'Three letters.', e: 'map() returns a new array with the result of calling a function on each element.' },
    { q: 'Which method attaches a click handler to an element?', o: ['onClick()', 'addEventListener()', 'attachEvent()', 'listen()'], a: 1, e: 'addEventListener(type, handler) is the standard way to listen to events.' }
  ] },
  web: { label: 'Web and accessibility', questions: [
    { q: 'Which HTTP status code means “Not Found”?', o: ['200', '301', '404', '500'], a: 2, e: '404 means the server cannot find the requested resource.' },
    { q: 'What does HTTPS add to HTTP?', o: ['Faster rendering', 'Encryption of the traffic', 'Free hosting', 'Automatic caching'], a: 1, e: 'HTTPS uses TLS to encrypt data between the browser and the server.' },
    { q: 'What does WCAG stand for?', o: ['Web Content Accessibility Guidelines', 'World Code and Graphics', 'Web Compatible Application Group', 'Wide Contrast and Gamma'], a: 0, e: 'WCAG is the W3C standard for making web content accessible.' },
    { t: 'tf', q: 'Colour alone is enough to convey meaning, such as a correct or wrong answer.', a: false, e: 'Add text or icons too, so people with colour-vision deficiencies get the message.' },
    { t: 'multi', q: 'Which practices help keyboard users?', o: ['A visible focus outline', 'A skip link', 'outline: none on every element', 'A logical tab order', 'Menus that only open on mouse hover'], a: [0, 1, 3], e: 'Visible focus, skip links and a logical order make keyboard navigation usable.' },
    { q: 'Which attribute links a <label> to its form control?', o: ['for', 'name', 'href', 'target'], a: 0, e: 'label for="id" connects the label to the control with that id.' },
    { t: 'text', q: 'Which HTTP method is typically used to submit a form that creates data? (4 letters)', a: ['post'], h: 'Not GET.', e: 'POST sends data in the request body, typically to create a resource.' },
    { t: 'tf', q: 'The viewport meta tag helps a page scale properly on phones.', a: true, e: '<meta name="viewport" content="width=device-width, initial-scale=1"> enables responsive layouts.' },
    { q: 'What is the minimum WCAG AA contrast ratio for normal-size text?', o: ['2:1', '3:1', '4.5:1', '10:1'], a: 2, e: 'AA requires 4.5:1 for normal text and 3:1 for large text.' },
    { q: 'What does alt="" on an image signal?', o: ['The image is decorative and can be skipped', 'The image failed to load', 'The alt text is missing', 'The image is a link'], a: 0, e: 'An empty alt tells screen readers to ignore purely decorative images.' }
  ] }
};
