/**
 * calc-banner — the program-page hero (source `calc-banner-center calc-banner-new`): banner art,
 * h1 + highlight list + rating link on the left, an inline EMI calculator card on the right,
 * and the illustrative-values disclaimer line under the banner.
 * Schema: stardust/eds-schema/personal-loan.json → sections[calc-banner-center].
 * Decode tier: template-slotted with keyed rows (component shape: key-value).
 *
 * Authoring rows (classified by content, in this order):
 *   1. art — desktop picture (≥1200px) | mobile / tablet picture
 *   2. text — <h1> (<strong> tail), <ul> highlights,
 *      rating <p><a><strong>4.8/5</strong> (n reviews)</a></p>
 *   3. calculator title <p>
 *   4–6. label | default value — loan amount, tenure (years), interest rate
 *   7. result label | CTA <p><strong><a>…</a></strong></p>
 *   8. disclaimer <p> (single cell, last row; optional)
 * Variants: plain-list — highlight <ul> without bullets/indent, white, one blank line after
 * (home-loan); big-title — 21px calculator title, 28px card top padding (home-loan).
 * Client-only maths, no network (amount is re-formatted en-IN on change).
 * @ew-exempt <p> default values (rows 4–6, cell 2) — rendered as the inputs' values
 * @ew-exempt derived — the months-tenure label repeats the tenure label; EMI is computed
 */

const BASE = `${window.hlx?.codeBasePath || ''}/blocks/calc-banner`;

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids.filter(Boolean));
  return n;
}

const num = (v) => Number(String(v).replace(/[^\d.]/g, '')) || 0;
const inr = (v) => Math.round(v).toLocaleString('en-IN');

function input(cls, value, label) {
  const i = el('input', `banner-input-text-calc disable-emoji ${cls}`);
  i.type = 'text';
  i.value = value;
  if (label) i.setAttribute('aria-label', label);
  return i;
}

function field(labelP, inner, wrapCls) {
  labelP.className = 'banner-calc-heading';
  return el(
    'div',
    'banner-calc-details-top',
    labelP,
    el('div', 'banner-calc-textbox with-border', el('div', `textbox-inner input-with-text ${wrapCls}`, ...inner)),
  );
}

function buildText(cell) {
  const h1 = cell.querySelector('h1');
  const ul = cell.querySelector('ul');
  const rating = [...cell.querySelectorAll('p')].find((p) => p.querySelector('a'));
  const text = el('div', 'calc-banner-text');
  const rte = ul ? el('div', 'rte title', el('div', 'tc-rte', ul)) : null;
  if (ul) ul.classList.add('list-circle-info', 'list-circle-info-custom');
  text.append(el('div', 'title-main', el(
    'div',
    'cmp-container',
    h1 ? el('div', 'component-title title', el('div', 'main-title', h1)) : null,
    rte,
  )));
  if (rating) {
    const a = rating.querySelector('a');
    const strong = a.querySelector('strong');
    const rest = [...a.childNodes].filter((n) => n !== strong);
    const stars = el('div', 'banner-rating-star bannerStars');
    [2, 2, 2, 2, 'one'].forEach((s) => {
      const img = el('img');
      img.src = `${BASE}/star-fill-${s}.svg`;
      img.alt = '';
      img.width = 16;
      img.height = 16;
      stars.append(img);
    });
    const tail = el('span', 'rating-texts');
    tail.append(...rest);
    a.replaceChildren(stars, strong ? el('span', 'rating-texts bold', strong) : null, tail);
    a.className = 'banner-rating-review';
    rating.className = 'banner-ratings-outer';
    text.append(el('div', 'info-title'), rating);
  }
  return text;
}

function buildCalc(title, fields, result) {
  const [amountRow, yearsRow, rateRow] = fields;
  const cells = (r) => [...r.children].map((c) => c.querySelector('p') || c);
  const [aL, aV] = cells(amountRow);
  const [yL, yV] = cells(yearsRow);
  const [rL, rV] = cells(rateRow);
  const amount = input('price-with-comma-js-input-banner', aV.textContent.trim(), aL.textContent.trim());
  const years = input('only-numeric-input-banner', yV.textContent.trim(), yL.textContent.trim());
  const months = input('only-numeric-input-banner', String(num(yV.textContent) * 12), yL.textContent.trim());
  const rate = input('only-numeric-decimal-js-input-banner', rV.textContent.trim(), rL.textContent.trim());
  const yearsBox = el('div', 'calculator-details', field(yL, [years], 'year-month-input'));
  const mLabel = el('p');
  mLabel.textContent = yL.textContent.trim();
  const monthsBox = el('div', 'calculator-details d-none', field(mLabel, [months], 'year-month-input'));

  const tabs = el('ul', 'banner-month-year-tab-box');
  const btns = ['Yr', 'Mo'].map((t, i) => {
    const b = el('button', `banner-year-month-btn-squared custom-month-year-js-void${i ? '' : ' active'}`);
    b.type = 'button';
    b.textContent = ` ${t} `;
    tabs.append(el('li', 'banner-year-month-item', b));
    return b;
  });

  const [resL, resC] = [...result.children];
  const resLabel = resL.querySelector('p') || resL;
  const label = el('label', 'static-label');
  label.append(...resLabel.childNodes);
  const emi = el('input', 'input-textbox disable-emoji only-numeric-decimal-input price-with-comma');
  emi.type = 'text';
  emi.disabled = true;
  emi.setAttribute('aria-label', label.textContent.trim());
  const ctaP = resC.querySelector('p');
  const a = resC.querySelector('a');
  if (a) a.className = 'btn-blue';
  const ctaWrap = ctaP || a;
  if (ctaP) ctaP.className = 'apply-cta';

  const tenureMonths = () => (monthsBox.classList.contains('d-none') ? num(years.value) * 12 : num(months.value));
  const update = () => {
    const p = num(amount.value);
    const r = num(rate.value) / 1200;
    const n = tenureMonths();
    const v = r && n ? (p * r * (1 + r) ** n) / ((1 + r) ** n - 1) : 0;
    emi.value = inr(v);
  };
  [amount, years, months, rate].forEach((i) => i.addEventListener('input', update));
  amount.addEventListener('change', () => { amount.value = inr(num(amount.value)); update(); });
  btns.forEach((b, i) => b.addEventListener('click', () => {
    btns.forEach((x) => x.classList.toggle('active', x === b));
    yearsBox.classList.toggle('d-none', i === 1);
    monthsBox.classList.toggle('d-none', i === 0);
    if (i === 1) months.value = String(num(years.value) * 12);
    update();
  }));
  update();

  title.className = 'semibold';
  return el(
    'div',
    'banner-calc-wrap',
    title,
    el(
      'div',
      'banner-calc-input-top',
      field(aL, [el('span', 'input-text', '₹'), amount], 'prefix-text'),
      el(
        'div',
        'banner-month-year-wrap',
        el('div', 'banner-month-year-tab-wrap', tabs),
        yearsBox,
        monthsBox,
      ),
      field(rL, [el('span', 'input-text', '%'), rate], 'suffix-text'),
    ),
    el('div', 'banner-calc-bottom', el('div', 'input-with-btn-outer', el(
      'div',
      'input-with-apply-btn',
      el('div', 'apply-input-wrap', label, el('div', 'apply-input-withrupee', el('span', 'rupee-sign icon-rupee'), emi)),
      ctaWrap,
    ))),
  );
}

export default function decorate(block) {
  const rows = [...block.children];
  const art = rows.find((r) => r.querySelector('picture'));
  const textRow = rows.find((r) => r.querySelector('h1'));
  const keyed = rows.filter((r) => r.children.length === 2 && r !== art);
  const fields = keyed.filter((r) => !r.querySelector('a'));
  const result = keyed.find((r) => r.querySelector('a'));
  const singles = rows.filter((r) => r !== art && r !== textRow && !keyed.includes(r));
  // singles before the first keyed row = calculator title; after it = disclaimer (optional)
  const firstKeyed = keyed.length ? rows.indexOf(keyed[0]) : rows.length;
  const titleRow = singles.find((r) => rows.indexOf(r) < firstKeyed) || null;
  const disclaimerRow = singles.filter((r) => rows.indexOf(r) > firstKeyed).pop();

  const article = el('article', 'calc-banner-box');
  if (art) {
    const pics = [...art.querySelectorAll('picture')];
    pics.forEach((p, i) => {
      p.classList.add('banner-clip-img', i === 0 && pics.length > 1 ? 'is-desktop' : 'is-mobile');
      const img = p.querySelector('img');
      if (img) {
        img.classList.add('banners-img');
        if (i === 0) img.loading = 'eager';
      }
      article.append(p);
    });
  }
  const main = el('div', 'banner-calc-main-wrap');
  if (textRow) main.append(buildText(textRow.firstElementChild));
  if (titleRow && fields.length >= 3 && result) {
    main.append(buildCalc(titleRow.querySelector('p') || titleRow.firstElementChild, fields, result));
  }
  article.append(el('div', 'calc-banner-item', main));

  const out = [el('div', 'customcontainer container', el('div', 'cmp-container mb-b25', el(
    'div',
    'banner-calc teaser',
    el('section', 'calc-banner-center calc-banner-new', el('div', 'custom-container banner-calc-custom', article)),
  )))];
  if (disclaimerRow && disclaimerRow !== titleRow) {
    const ps = [...disclaimerRow.querySelectorAll('p')];
    out.push(el('div', 'rte title', el('div', 'tc-rte', el('div', 'container tops-heads mg-t15 text14i', ...ps))));
  }
  block.replaceChildren(...out);
}
