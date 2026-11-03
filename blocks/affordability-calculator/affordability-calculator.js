/**
 * affordability-calculator — the source `loan-affordability-calculator` (CSR campaign page):
 * a two-step glass card (step 1: monthly income, expenses and existing loan EMIs; step 2: the
 * new loan's type, amount, duration and rate) beside a "Monthly Income Breakdown" pie with a
 * legend, an "Upcoming Step" teaser, and after step 2 the estimated EMI + an affordability note.
 * Decode tier: template-slotted (rows fill the fixed widget in order).
 *
 * Authoring (one row each, in this order):
 *   1. head — <h2> (<strong> for the bold tail) + lede <p>
 *   2. step-1 title | step badge ("Step 1/2")
 *   3. income slider — label | min label | max label | start value  (e.g. ₹10,000 | ₹20,00,000)
 *   4. expenses slider — same four cells
 *   5. existing-loans title | add-loan button label
 *   6. loan card title | loan-type label | <ul> of loan types
 *   7. existing-EMI slider — same four cells
 *   8. next button label
 *   9. step-2 title | step badge
 *   10. new-loan type label | <ul> of loan types
 *   11–13. loan amount, duration (years) and interest-rate sliders — same four cells
 *   14. chart title | <ul> legend: label <strong>value</strong> (new EMI, income, expenses, EMI)
 *   15. teaser badge | teaser title | <ul> of teaser items
 *   16. repayment title | EMI label | per-month suffix
 *   17. affordability note title | note text
 * Counter buttons, the Yr/Mo toggle, slider tracks and the pie are generated chrome.
 */

const base = `${window.hlx?.codeBasePath || ''}/blocks/affordability-calculator/`;
const ICONS = ['icon-EMI-calculator', 'icon-save-interest', 'icon-handsome-loan'];
const PIE = [
  ['46,147,235', [0.45, 0.9, 0.85], 85.5],
  ['216,224,36', [0.35, 0.72, 0.55], 95],
  ['178,135,212', [0.35, 0.72, 0.55], 95],
  ['25,97,172', [0.35, 0.72, 0.55], 95],
];

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids.filter((k) => k !== null && k !== undefined));
  return n;
}

function icon(file, alt) {
  const i = el('img');
  i.src = `${base}${file}`;
  i.alt = alt;
  return i;
}

function button(cls, ...kids) {
  const b = el('button', cls, ...kids);
  b.type = 'button';
  return b;
}

const num = (s) => {
  const t = (s || '').replace(/,/g, '');
  const m = t.match(/[\d.]+/);
  if (!m) return 0;
  const v = parseFloat(m[0]);
  if (/cr/i.test(t)) return v * 1e7;
  if (/lakh|lac/i.test(t)) return v * 1e5;
  return v;
};
const inr = (v) => Math.round(v).toLocaleString('en-IN');
const cellText = (c) => (c ? c.textContent.trim() : '');

/**
 * moves a cell's authored paragraph into place (EW1: the node itself, never its text): a `p`
 * slot takes the paragraph with the slot classes; any other slot wraps it, the paragraph laid
 * out inline (`la-text`, display: contents)
 */
function take(cell, tag, cls) {
  let p = cell ? cell.querySelector('p') : null;
  if (!p) {
    p = el('p');
    if (cell) p.append(...cell.childNodes);
  }
  if (tag === 'p') {
    if (cls) p.className = cls;
    return p;
  }
  p.classList.add('la-text');
  return el(tag, cls, p);
}

function slider(row, opts = {}) {
  const [labelCell, minCell, maxCell, valCell] = row ? [...row.children] : [];
  const min = num(cellText(minCell));
  const max = num(cellText(maxCell));
  const value = take(valCell, 'p', 'counter-value js-loanAffordabilityCounterValue');
  const state = {
    min, max, value: num(value.textContent) || min, unit: 1,
  };
  const step = opts.step || (max - min > 1e6 ? 1000 : 500);
  const handle = el('span', 'irs-handle single', el('i'), el('i'), el('i'));
  const bar = el('span', 'irs-bar irs-bar--single');
  const single = el('span', 'irs-single');
  const irs = el(
    'span',
    'irs irs--round',
    el('span', 'irs', el('span', 'irs-line'), el('span', 'irs-min', inr(min)), el('span', 'irs-max', inr(max)), single),
    el('span', 'irs-grid'),
    bar,
    el('span', 'irs-shadow shadow-single'),
    handle,
  );
  const input = el('input', 'js-loanAffordabilityRangeSlider la-range');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(opts.step || step);
  input.value = String(state.value);
  input.setAttribute('aria-label', cellText(labelCell));
  const labels = el(
    'div',
    'custom-range-label',
    take(minCell, 'span'),
    ' ',
    take(maxCell, 'span'),
  );
  const paint = () => {
    const pct = max > min ? (state.value - min) / (max - min) : 0;
    const hw = irs.offsetWidth ? (handle.offsetWidth / irs.offsetWidth) * 100 : 4.18;
    const left = pct * (100 - hw);
    handle.style.left = `${left}%`;
    bar.style.left = '0px';
    bar.style.width = `${left + hw / 2}%`;
    single.textContent = inr(state.value);
  };
  const set = (v, from) => {
    state.value = Math.min(max, Math.max(min, v));
    if (from !== 'input') input.value = String(state.value);
    if (from !== 'text') value.textContent = opts.raw ? String(state.value) : inr(state.value);
    paint();
    if (opts.onChange) opts.onChange();
  };
  input.addEventListener('input', () => set(Number(input.value), 'input'));
  value.contentEditable = 'true';
  value.setAttribute('inputmode', 'decimal');
  value.spellcheck = false;
  value.addEventListener('blur', () => set(num(value.textContent) || min));
  value.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      value.blur();
    }
  });
  const counter = el('div', `loan-affordability-calculator-counter${opts.duration ? ' loan-affordability-duration-counter' : ''}`);
  if (opts.duration) {
    const yr = button('loan-affordability-duration-toggle__btn is-active js-loanAffordabilityDurationUnit', 'Yr');
    const mo = button('loan-affordability-duration-toggle__btn js-loanAffordabilityDurationUnit', 'Mo');
    [yr, mo].forEach((b) => b.addEventListener('click', () => {
      yr.classList.toggle('is-active', b === yr);
      mo.classList.toggle('is-active', b === mo);
      state.unit = b === yr ? 1 : 1 / 12;
      if (opts.onChange) opts.onChange();
    }));
    counter.append(value, el('div', 'loan-affordability-duration-toggle', yr, mo));
  } else {
    const minus = button('counter-reduce-btn js-loanAffordabilityCounterMinus', icon('minus-icon.svg', 'Decrease'));
    const plus = button('counter-increase-btn js-loanAffordabilityCounterPlus', icon('add-icon.svg', 'Increase'));
    minus.addEventListener('click', () => set(state.value - Number(input.step)));
    plus.addEventListener('click', () => set(state.value + Number(input.step)));
    counter.append(minus, value, plus);
  }
  const details = el(
    'div',
    'loan-affordabilty-calculator-details',
    el('div', 'loan-affordability-calculator-details-top', take(labelCell, 'p', 'loan-affordability-calculator-details-text'), counter),
    el('div', 'loan-affordability-calculator-details-bottom', el('div', 'custom-range-slider-wrap', irs, input, labels)),
  );
  if (opts.interest) input.classList.add('js-loanAffordabilityInterestSlider');
  if (opts.duration) input.classList.add('js-loanAffordabilityDurationSlider');
  return {
    details, state, paint, label: cellText(labelCell),
  };
}

function dropdown(labelCell, list) {
  const items = list ? [...list.children] : [];
  const valueSpan = el('span', 'loan-type-dropdown__value js-loanTypeDropdownValue', items[0] ? items[0].textContent.trim() : '');
  const trigger = button(
    'loan-type-dropdown__trigger js-loanTypeDropdownToggle',
    el('div', 'loan-type-dropdown__content', take(labelCell, 'p', 'loan-type-dropdown__label'), valueSpan),
    el('span', 'loan-type-dropdown__arrow', icon('chevron-down.svg', '')),
  );
  trigger.setAttribute('aria-expanded', 'false');
  const ul = list || el('ul');
  ul.className = 'loan-type-dropdown__list';
  items.forEach((li, i) => {
    const b = button(`loan-type-dropdown__option js-loanTypeDropdownOption${i ? '' : ' is-active'}`, ...li.childNodes);
    li.append(b);
  });
  const box = el(
    'div',
    'loan-type-dropdown js-loanTypeDropdown',
    trigger,
    el('div', 'loan-type-dropdown__menu', el('div', 'loan-type-dropdown__scroll js-loanTypeDropdownScroll', ul)),
  );
  const setOpen = (open) => {
    box.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
  };
  trigger.addEventListener('click', () => setOpen(!box.classList.contains('is-open')));
  ul.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    ul.querySelectorAll('button').forEach((x) => x.classList.toggle('is-active', x === b));
    valueSpan.textContent = b.textContent.trim();
    setOpen(false);
  }));
  document.addEventListener('click', (e) => { if (!box.contains(e.target)) setOpen(false); });
  return box;
}

function pie(values) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 210 210');
  svg.setAttribute('width', '210');
  svg.setAttribute('height', '210');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Monthly income breakdown chart');
  const defs = document.createElementNS(ns, 'defs');
  svg.append(defs);
  const uid = `la-${Math.random().toString(36).slice(2, 8)}`;
  PIE.forEach(([rgb, ops], i) => {
    const g = document.createElementNS(ns, 'radialGradient');
    g.id = `${uid}-${i}`;
    ['cx', 'cy'].forEach((k) => g.setAttribute(k, '105'));
    g.setAttribute('r', '150');
    g.setAttribute('gradientUnits', 'userSpaceOnUse');
    [0, 0.55, 1].forEach((off, j) => {
      const s = document.createElementNS(ns, 'stop');
      s.setAttribute('offset', String(off));
      s.setAttribute('stop-color', `rgb(${i === 0 && j === 2 ? '16,141,250' : rgb})`);
      s.setAttribute('stop-opacity', String(ops[j]));
      g.append(s);
    });
    defs.append(g);
  });
  const total = values.reduce((a, b) => a + Math.max(0, b), 0) || 1;
  let a0 = 0;
  values.forEach((v, i) => {
    if (v <= 0) return;
    const sweep = (v / total) * Math.PI * 2;
    const r = PIE[i][2];
    const a1 = a0 + Math.min(sweep, Math.PI * 2 - 1e-4);
    const p = document.createElementNS(ns, 'path');
    const x0 = 105 + r * Math.cos(a0);
    const y0 = 105 + r * Math.sin(a0);
    const x1 = 105 + r * Math.cos(a1);
    const y1 = 105 + r * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    p.setAttribute('d', `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L 105 105 Z`);
    p.setAttribute('fill', `url(#${uid}-${i})`);
    p.setAttribute('stroke', 'rgba(255, 255, 255, 0.7)');
    svg.append(p);
    a0 += sweep;
  });
  return svg;
}

export default function decorate(block) {
  const rows = [...block.children];
  const at = (i) => rows[i] || null;
  const cells = (i) => (at(i) ? [...at(i).children] : []);

  const head = at(0);
  const heading = head && head.querySelector('h1, h2, h3');
  const lede = head && head.querySelector('p');
  const tops = el('div', 'tops-heads', heading, lede);

  const headwrap = (i, extra = '') => {
    const [t, s] = cells(i);
    return el(
      'div',
      `loan-affordability-calculator-details-headwrap${extra}`,
      take(t, 'p', 'loan-affordability-calculator-details-head-title'),
      el('div', 'loan-affordability-calculator-step', take(s, 'span')),
    );
  };

  let update = () => {};
  let touched = false;
  const onChange = () => {
    touched = true;
    update();
  };
  const income = slider(at(2), { onChange });
  const expenses = slider(at(3), { onChange });
  const [exTitle, addCell] = cells(4);
  const [cardTitle, typeLabel, typeCell] = cells(5);
  const emi = slider(at(6), { onChange });
  const [nextCell] = cells(7);
  const amount = slider(at(10), { onChange, raw: true, step: 10000 });
  const duration = slider(at(11), { onChange, duration: true, step: 1 });
  const rate = slider(at(12), { onChange, interest: true, step: 0.5 });

  const addBtn = button(
    'loan-affordability-calculator-details-head-btn js-loanAffordabilityAddLoan',
    el('span', '', icon('add-icon.svg', '')),
    ' ',
    take(addCell, 'span').firstChild,
  );
  const loanCard = el(
    'div',
    'loan-affordability-calculator-details-bottom-card js-loanAffordabilityLoanCard',
    el(
      'div',
      'card-top',
      el(
        'div',
        'top-heading',
        take(cardTitle, 'p', 'js-loanAffordabilityLoanTitle'),
        el(
          'div',
          'card-actions',
          button('card-edit-btn js-loanAffordabilityEditLoan', icon('edit-loan-icon.svg', 'Edit loan')),
          button('card-delete-btn js-loanAffordabilityDeleteLoan', icon('trash.svg', 'Delete loan')),
        ),
      ),
      dropdown(typeLabel, typeCell && typeCell.querySelector('ul')),
    ),
    el('div', 'card-bottom', ...emi.details.children),
  );
  // source inline display state: a single loan card shows delete, not edit
  loanCard.querySelector('.card-delete-btn').style.display = 'flex';
  const nextBtn = button('loan-affordability-calculator-details-bottom-wrap-cta js-loanAffordabilityNext', take(nextCell, 'span').firstChild);
  const step1 = el(
    'div',
    'js-loanAffordabilityStep1',
    headwrap(1),
    el(
      'div',
      'loan-affordability-calculator-details-wrapper',
      el('div', 'loan-affordabilty-calculator-details-top-wrap', income.details, expenses.details),
      el(
        'div',
        'loan-affordabilty-calculator-details-bottom-wrap',
        el(
          'div',
          'loan-affordability-calculator-details-headwrap',
          take(exTitle, 'p', 'loan-affordability-calculator-details-head-title'),
          addBtn,
        ),
        el('div', 'loan-affordability-calculator-details-bottom-cards-wrap js-loanAffordabilityLoanCards', loanCard),
        nextBtn,
      ),
    ),
  );
  const summaryGrid = el('div', 'loan-affordability-step1-summary__grid js-loanAffordabilityStep1SummaryGrid');
  const editBtn = button('loan-affordability-step1-summary__edit js-loanAffordabilityEditStep1', icon('edit-loan-icon.svg', 'Edit step 1'));
  const step1Head = step1.querySelector('.loan-affordability-calculator-details-headwrap');
  const summary = el(
    'div',
    'loan-affordability-step1-summary js-loanAffordabilityStep1Summary d-none',
    el(
      'div',
      'loan-affordability-calculator-details-headwrap',
      el(
        'div',
        'loan-affordability-step1-summary__heading',
        // filled on step 2 with the step-1 head nodes (moved, not copied)
        el('div', 'la-summary-head'),
      ),
      editBtn,
    ),
    summaryGrid,
  );
  const step2Head = headwrap(8, ' js-loanAffordabilityStep2Headwrap d-none');
  const step2 = el(
    'div',
    'js-loanAffordabilityStep2 d-none',
    dropdown(cells(9)[0], cells(9)[1] && cells(9)[1].querySelector('ul')),
    amount.details,
    duration.details,
    rate.details,
  );
  const inputs = el('div', 'loan-affordability-calculator-inputs-wrap', el('div', 'loan-affordability-calculator-inputs-inner', summary, step1, step2Head, step2));

  // graph column
  const [chartTitle, legendCell] = cells(13);
  const legendItems = legendCell && legendCell.querySelector('ul') ? [...legendCell.querySelector('ul').children] : [];
  const dots = ['new-emi', 'income', 'expenses', 'emi'];
  const legendValues = [];
  const legend = (legendCell && legendCell.querySelector('ul')) || el('ul');
  legend.className = 'loan-affordability-graph-legend';
  legendItems.forEach((li, i) => {
    const strong = li.querySelector('strong');
    if (strong) strong.remove();
    const val = strong || el('strong');
    legendValues.push(val);
    if (i === 0) li.className = 'js-loanAffordabilityLegendNewEmi d-none';
    const label = el('p', '', ...li.childNodes);
    li.append(
      el('span', `loan-affordability-graph-legend__dot loan-affordability-graph-legend__dot--${dots[i] || 'emi'}`),
      el('div', 'loan-affordability-graph-legend__text', label, el('p', '', val)),
    );
  });
  const chart = el('div', 'loan-affordability-graph-chart graph-chart-box');
  const [badge, teaserTitle, teaserCell] = cells(14);
  const teaserList = (teaserCell && teaserCell.querySelector('ul')) || el('ul');
  teaserList.className = 'loan-affordability-upcoming-step__list';
  [...teaserList.children].forEach((li, i) => {
    const ic = el('span', 'loan-affordability-upcoming-step__icon', el('i', ICONS[i % ICONS.length]));
    li.prepend(ic, ' ');
  });
  const graphStep1 = el(
    'div',
    'loan-affordability-graph-bottom js-loanAffordabilityGraphStep1',
    el(
      'div',
      'loan-affordability-upcoming-step',
      take(badge, 'span', 'loan-affordability-upcoming-step__badge'),
      take(teaserTitle, 'p', 'loan-affordability-upcoming-step__title'),
      teaserList,
    ),
  );
  const [repTitle, repLabel, repSuffix] = cells(15);
  const newEmiValue = el('strong', 'js-loanAffordabilityNewEmiValue');
  const perMonth = take(repSuffix, 'span');
  newEmiValue.append(perMonth);
  const repLabelP = take(repLabel, 'p', 'loan-affordability-repayment-card__emi');
  repLabelP.append(' ', newEmiValue);
  const graphStep2 = el(
    'div',
    'loan-affordability-graph-bottom js-loanAffordabilityGraphStep2 d-none',
    take(repTitle, 'p', 'loan-affordability-graph-bottom__title'),
    el('div', 'loan-affordability-repayment-card', repLabelP),
  );
  const [warnTitle, warnText] = cells(16);
  const warning = el(
    'div',
    'loan-affordability-repayment-warning js-loanAffordabilityWarning d-none',
    icon('warning-icon.svg', ''),
    el(
      'div',
      'loan-affordability-repayment-warning__content',
      take(warnTitle, 'p', 'loan-affordability-repayment-warning__title js-loanAffordabilityWarningTitle'),
      take(warnText, 'p', 'loan-affordability-repayment-warning__text js-loanAffordabilityWarningText'),
    ),
  );
  warning.firstChild.className = 'loan-affordability-repayment-warning__icon';
  const graph = el('div', 'loan-affordability-calculator-graph-wrapper', el(
    'div',
    'loan-affordability-calculator-graph-wrap js-loanAffordabilityGraphWrap',
    el(
      'div',
      'loan-affordability-calculator-graph-inner',
      el(
        'div',
        'loan-affordability-graph-top',
        take(chartTitle, 'p', 'loan-affordability-graph-top__title'),
        el('div', 'loan-affordability-graph-top__body', chart, legend),
      ),
      graphStep1,
      graphStep2,
      warning,
    ),
  ));

  const widget = el('div', 'loan-affordability-calculator', el('div', 'loan-affordability-calculator-content-wrap', inputs, graph));
  const section = el('section', 'loan-affordability-calculator-box space-tb40', el(
    'div',
    'container',
    el('div', 'mx-944', tops, el('div', '', widget)),
  ));
  section.id = 'calculator';
  block.replaceChildren(section);

  let stage = 1;
  update = () => {
    const inc = income.state.value;
    const exp = expenses.state.value;
    const old = emi.state.value;
    let newEmi = 0;
    if (stage === 2) {
      const n = Math.max(1, Math.round(duration.state.value * duration.state.unit * 12));
      const r = rate.state.value / 1200;
      const p = amount.state.value;
      newEmi = r ? (p * r * (1 + r) ** n) / ((1 + r) ** n - 1) : p / n;
      newEmiValue.replaceChildren(`₹${inr(newEmi)}`, perMonth);
      const ok = inc - exp - old - newEmi >= 0 && (old + newEmi) / (inc || 1) <= 0.5;
      warning.classList.toggle('loan-affordability-repayment-warning--success', ok);
    }
    const vals = [newEmi, inc, exp, old];
    // authored legend values stay as written until the visitor changes an input
    if (touched) legendValues.forEach((v, i) => { v.textContent = `₹${inr(vals[i])}`; });
    const rest = Math.max(0, inc - exp - old - newEmi);
    chart.replaceChildren(pie([rest, exp, old, newEmi]));
  };
  const goStep = (s) => {
    stage = s;
    step1.classList.toggle('d-none', s === 2);
    summary.classList.toggle('d-none', s !== 2);
    step2.classList.toggle('d-none', s !== 2);
    graphStep1.classList.toggle('d-none', s === 2);
    graphStep2.classList.toggle('d-none', s !== 2);
    warning.classList.toggle('d-none', s !== 2);
    legend.firstChild?.classList.toggle('d-none', s !== 2);
    const sumHead = summary.querySelector('.la-summary-head');
    const [t1, b1] = s === 2 ? [...step1Head.children] : [...sumHead.children];
    (s === 2 ? sumHead : step1Head).append(...[t1, b1].filter(Boolean));
    if (s === 2) {
      summaryGrid.replaceChildren(...[income, expenses, emi].map((f) => el(
        'div',
        'loan-affordability-step1-summary__item',
        el('p', '', f.label),
        el('p', '', el('strong', '', `₹${inr(f.state.value)}`)),
      )));
      [amount, duration, rate].forEach((f) => f.paint());
    }
    update();
  };
  nextBtn.addEventListener('click', () => {
    touched = true;
    goStep(2);
  });
  editBtn.addEventListener('click', () => goStep(1));
  [income, expenses, emi].forEach((f) => f.paint());
  update();
  const all = [income, expenses, emi, amount, duration, rate];
  window.addEventListener('resize', () => all.forEach((f) => f.paint()));
  if (document.fonts) document.fonts.ready.then(() => all.forEach((f) => f.paint()));
}
