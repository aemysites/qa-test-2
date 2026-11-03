/**
 * loan-quiz — the source `loan-ready-quiz` (CSR campaign page): heading + lede over a stack of
 * blue question cards (the active card in front, the rest fanned behind it), Yes / No answers
 * (inside the card on desktop, under the stack on mobile), and a result panel with the score
 * and the key takeaways once every card is answered.
 * Decode tier: reconstructive (one card per question row).
 *
 * Authoring:
 *   1. head — <h2> (<strong> for the bold tail) + lede <p>
 *   2..N. one row per question — question <p> | correct answer <p> (Yes / No) | takeaway <p>
 *   last. result copy — title <p> (<strong> for the coloured tail), next-step <p>,
 *      takeaways heading <p>
 * Button labels (No / Yes / OR) and the card art are generated chrome.
 */

const base = `${window.hlx?.codeBasePath || ''}/blocks/loan-quiz/`;

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

function img(file, alt) {
  const i = el('img');
  i.src = `${base}${file}`;
  i.alt = alt;
  i.loading = 'lazy';
  return i;
}

function answerButtons(cls) {
  const no = el('button', 'btn btn-apply js-quiz-next btn-no', img('btn-no.png', ''), 'No');
  const yes = el('button', 'btn btn-apply js-quiz-next btn-yes', img('btn-yes.png', ''), 'Yes');
  no.type = 'button';
  yes.type = 'button';
  no.dataset.answer = 'no';
  yes.dataset.answer = 'yes';
  return el('div', cls, no, yes);
}

export default function decorate(block) {
  const rows = [...block.children];
  const head = rows.shift();
  const isQuestion = (r) => r.children.length >= 2;
  const resultRow = rows.length && !isQuestion(rows[rows.length - 1]) ? rows.pop() : null;

  const heading = head && head.querySelector('h1, h2, h3');
  const lede = head && head.querySelector('p');
  const tops = el('div', 'tops-heads', ...[heading, lede].filter(Boolean));

  const questions = rows.filter(isQuestion).map((row, i) => {
    const [qCell, aCell, tCell] = row.children;
    const q = qCell.querySelector('p') || el('p', '', ...qCell.childNodes);
    q.classList.add('text-center');
    const correct = (aCell.textContent || '').trim().toLowerCase().startsWith('y') ? 'yes' : 'no';
    // the authored answer stays in the card as hidden data (revealed by no visual state)
    const answerP = aCell.querySelector('p') || el('p', '', ...aCell.childNodes);
    answerP.className = 'quiz-card-answer';
    answerP.hidden = true;
    const takeaway = tCell ? (tCell.querySelector('p') || el('p', '', ...tCell.childNodes)) : null;
    const prev = el('button', 'btn btn-apply js-nav-prev', el('span', 'icon-arrow-left'));
    const next = el('button', 'btn btn-apply js-nav-next btn-disabled', el('span', 'icon-arrow-right'));
    prev.type = 'button';
    next.type = 'button';
    prev.setAttribute('aria-label', 'Previous question');
    next.setAttribute('aria-label', 'Next question');
    if (!i) prev.classList.add('btn-disabled');
    const inner = el(
      'div',
      'quiz-card-inner',
      el('div', 'quiz-card-number', el('p', '', String(i + 1))),
      el('div', 'quiz-card-question', q),
      el('div', 'quiz-card-image', img('quiz-card-image.png', '')),
      answerButtons('quiz-card-buttons-desktop'),
      el('div', 'navigation-buttons', prev, next),
      answerP,
    );
    const li = el('li', `quiz-slider-item swiper-slide${i ? '' : ' active'}`, el('div', 'quiz-card', inner));
    return {
      li, correct, takeaway, prev, next,
    };
  });

  const list = el('ul', 'quiz-slider-list swiper-wrapper', ...questions.map((x) => x.li));
  const mobileButtons = answerButtons('quiz-card-buttons-mobile');
  const sliderArea = el('div', 'container', el(
    'div',
    'quiz-slider-box',
    el('div', 'quiz-slider-box-inner swiper mySwiper', list),
    el('div', 'separator', el('span', '', 'OR')),
    mobileButtons,
  ));
  sliderArea.id = 'quizSliderArea';
  const quiz = el('section', 'quiz-box space-tb40 space-b80', el('div', 'container', tops), sliderArea);
  quiz.id = 'quiz';

  const resPs = resultRow ? [...resultRow.querySelectorAll('p')] : [];
  const [resTitle, resNext, resHeading] = resPs;
  const score = el('p', 'js-result-score');
  const takeList = el('ul', 'take-away-list swiper-wrapper');
  const result = el('section', 'quiz-result-section space-tb40', el('div', 'container', el(
    'div',
    'result-box',
    el(
      'div',
      'results-inner',
      el('div', 'great-start-box', el(
        'div',
        'great-start',
        el(
          'div',
          'great-start-top',
          el('div', 'top-image', img('result-icon.png', '')),
          el('div', 'top-content', ...(resTitle ? [resTitle] : [])),
          el('div', 'result', score),
        ),
        el('div', 'great-start-bottom', el('div', 'bottom-content', ...(resNext ? [resNext] : []))),
      )),
      el('div', 'take-away', el(
        'div',
        'take-away-inner',
        el('div', 'heading', ...(resHeading ? [resHeading] : [])),
        el('div', 'take-away-content myResultSwiper swiper', takeList),
      )),
    ),
  )));
  result.id = 'quizResultSection';
  result.style.display = 'none';
  // the takeaways are authored content: they stay in the DOM (in the result list) from the start
  questions.forEach((x, i) => {
    if (!x.takeaway) return;
    const num = el('span', '', String(i + 1).padStart(2, '0'));
    num.setAttribute('aria-hidden', 'true');
    takeList.append(el('li', 'take-away-item swiper-slide', el('div', 'take-away-item-inner', num, x.takeaway)));
  });
  block.replaceChildren(el('div', 'loan-ready-quiz', quiz, result));

  const answers = [];
  let cur = 0;
  const show = (i) => {
    cur = i;
    // answered cards leave the stack so the fanned nth-child sizes follow the remaining ones
    questions.forEach((x, j) => {
      x.li.classList.toggle('active', j === i);
      if (j < i) x.li.remove();
      else if (!x.li.isConnected || x.li.parentElement !== list) list.append(x.li);
    });
    questions.slice(i).forEach((x) => list.append(x.li));
    questions.forEach((x, j) => x.next.classList.toggle('btn-disabled', answers[j] === undefined));
  };
  const finish = () => {
    const right = answers.filter((a, j) => a === questions[j].correct).length;
    score.textContent = `${right}/${questions.length}`;
    result.style.display = '';
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const answer = (value) => {
    answers[cur] = value;
    if (cur + 1 < questions.length) show(cur + 1);
    else finish();
  };
  block.querySelectorAll('.js-quiz-next').forEach((b) => b.addEventListener('click', () => answer(b.dataset.answer)));
  questions.forEach((x, j) => {
    x.prev.addEventListener('click', () => { if (j > 0) show(j - 1); });
    x.next.addEventListener('click', () => {
      if (answers[j] !== undefined && j + 1 < questions.length) show(j + 1);
    });
  });
}
