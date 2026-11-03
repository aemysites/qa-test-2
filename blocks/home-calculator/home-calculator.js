/**
 * home-calculator — "Tools to help you decide" EMI calculator (source `calculator-box`, the
 * home-page-calculator-structure). Schema: stardust/eds-schema/index.json →
 * sections[calculator-box]. Decode tier: template-slotted with keyed rows (component shape:
 * key-value).
 *
 * Authoring rows:
 *   heading row: <h2> (a <strong> tail renders as its own bold line)
 *   loans | <ul> loan types (dropdown)        tabs | <ul> calculator tabs
 *   amount | label | min label | max label     years | … (same shape)
 *   months | …                                  rate | …
 *   units | <ul> Yr, Mo                         emi | label   total | label   interest | label
 *   CTA row: <p><strong><a>…</a></strong></p>   disclaimer row: <p> (no key)
 * Ranges (min/max/step/default) are calculator configuration held here, not content.
 * Client-only maths, no network. The pre-payment / eligibility / home-loan panels of the
 * source are non-functional hidden markup there and are not rendered (tabs switch state only).
 * @ew-exempt <p> row keys (cell 1) — keyed-row metadata, never displayed
 * @ew-exempt derived — the dropdown heading repeats the active loan label; results are computed
 */

const RANGES = {
  amount: {
    min: 40000, max: 3500000, step: 1000, value: 100000,
  },
  years: {
    min: 1, max: 6, step: 1, value: 2,
  },
  months: {
    min: 12, max: 72, step: 1, value: 24,
  },
  rate: {
    min: 10.99, max: 33, step: 0.01, value: 10.99,
  },
};
const KEYS = ['loans', 'tabs', 'amount', 'years', 'months', 'rate', 'units', 'emi', 'total', 'interest'];

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}*`;

function readRows(block) {
  const cfg = { extra: [] };
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = cells.length > 1 ? cells[0].textContent.trim().toLowerCase() : '';
    if (KEYS.includes(key)) {
      cfg[key] = cells.slice(1);
    } else {
      const h = row.querySelector('h1, h2, h3, h4, h5, h6');
      const a = row.querySelector('a');
      if (h && !cfg.heading) cfg.heading = h;
      else if (a && !cfg.cta) cfg.cta = a.closest('p') || a;
      else if (row.textContent.trim()) cfg.extra.push(...row.querySelectorAll('p'));
    }
  });
  return cfg;
}

const first = (cell) => (cell ? cell.querySelector('p, ul, ol') || cell : null);

function field(key, cells, state) {
  const r = RANGES[key];
  const [labelCell, minCell, maxCell] = cells || [];
  const inner = el('div', 'textbox-inner');
  const input = el('input', 'input-textbox-calulator');
  input.type = 'text';
  input.inputMode = key === 'rate' ? 'decimal' : 'numeric';
  input.dataset.field = key;
  const label = first(labelCell);
  if (label) input.setAttribute('aria-label', label.textContent.trim());
  if (key === 'amount') {
    inner.classList.add('prefix-text');
    inner.append(el('span', 'input-text', '₹'), input);
  } else if (key === 'rate') {
    inner.classList.add('suffix-text');
    inner.append(input, el('span', 'input-text', '%'));
  } else {
    inner.classList.add('year-month-input');
    inner.append(input);
  }
  const top = el(
    'div',
    'calculator-details-top',
    el('div', 'calculator-heading', ...(label ? [label] : [])),
    el('div', 'calculator-textbox with-border', inner),
  );
  const bar = el('span', 'range__bar');
  const handle = el('span', 'range__handle');
  handle.setAttribute('role', 'slider');
  handle.tabIndex = 0;
  handle.setAttribute('aria-valuemin', r.min);
  handle.setAttribute('aria-valuemax', r.max);
  if (label) handle.setAttribute('aria-label', label.textContent.trim());
  const range = el('div', 'range', el('span', 'range__line'), bar, handle);
  const labels = el('div', 'custom-range-label');
  [minCell, maxCell].forEach((c) => {
    const n = first(c);
    if (n) labels.append(el('div', 'range-end', n));
  });
  const box = el('div', 'calculator-details', top, range, labels);
  if (key === 'years' || key === 'months') box.dataset.unitPanel = key === 'years' ? 'yr' : 'mo';
  const paint = (v) => {
    const p = ((v - r.min) / (r.max - r.min)) * 100;
    bar.style.width = `${p}%`;
    handle.style.left = `${p}%`;
    handle.setAttribute('aria-valuenow', v);
  };
  const fromX = (x) => {
    const b = range.getBoundingClientRect();
    let v = r.min + Math.max(0, Math.min(1, (x - b.left) / b.width)) * (r.max - r.min);
    v = Math.round(v / r.step) * r.step;
    state.set(key, +v.toFixed(2));
  };
  range.addEventListener('pointerdown', (e) => {
    range.setPointerCapture(e.pointerId);
    fromX(e.clientX);
    range.onpointermove = (ev) => fromX(ev.clientX);
  });
  range.addEventListener('pointerup', () => {
    range.onpointermove = null;
  });
  handle.addEventListener('keydown', (e) => {
    const up = e.key === 'ArrowRight' || e.key === 'ArrowUp';
    const down = e.key === 'ArrowLeft' || e.key === 'ArrowDown';
    if (!up && !down) return;
    e.preventDefault();
    const v = state.st[key] + (up ? r.step : -r.step);
    state.set(key, +Math.max(r.min, Math.min(r.max, v)).toFixed(2));
  });
  input.addEventListener('change', () => {
    const v = parseFloat(input.value.replace(/,/g, '')) || r.min;
    state.set(key, Math.max(r.min, Math.min(r.max, v)));
  });
  return {
    box, input, paint,
  };
}

function listItems(cell) {
  const list = cell && cell[0] ? cell[0].querySelector('ul, ol') : null;
  return list ? { list, items: [...list.children] } : { list: null, items: [] };
}

export default function decorate(block) {
  const cfg = readRows(block);
  const st = {
    amount: RANGES.amount.value,
    years: RANGES.years.value,
    months: RANGES.months.value,
    rate: RANGES.rate.value,
    unit: 'yr',
  };
  const fields = {};
  let render = () => {};
  const state = {
    st,
    set(k, v) {
      st[k] = v;
      if (k === 'years') st.months = v * 12;
      if (k === 'months') st.years = v / 12;
      render();
    },
  };

  // loan-type dropdown
  const dd = el('div', 'loans-dropdown');
  const loans = listItems(cfg.loans);
  const ddBtn = el('a', 'dropdown-heading', loans.items[0] ? loans.items[0].textContent.trim() : '');
  ddBtn.href = '#';
  ddBtn.setAttribute('role', 'button');
  ddBtn.setAttribute('aria-expanded', 'false');
  dd.append(ddBtn);
  if (loans.list) {
    loans.list.classList.add('custom-active-tab');
    loans.list.hidden = true;
    loans.items.forEach((li, i) => {
      li.classList.add('switch-tab');
      li.classList.toggle('is-active', !i);
      const link = el('a', '', ...li.childNodes);
      link.href = '#';
      li.append(link);
      li.addEventListener('click', (e) => {
        e.preventDefault();
        loans.items.forEach((x) => x.classList.toggle('is-active', x === li));
        ddBtn.textContent = li.textContent.trim();
        loans.list.hidden = true;
        ddBtn.setAttribute('aria-expanded', 'false');
      });
    });
    dd.append(loans.list);
    ddBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      loans.list.hidden = !loans.list.hidden;
      ddBtn.setAttribute('aria-expanded', String(!loans.list.hidden));
    });
    document.addEventListener('click', (e) => {
      if (!dd.contains(e.target)) loans.list.hidden = true;
    });
  }

  // calculator tabs
  const tabs = listItems(cfg.tabs);
  const calc = el('div', 'calc-loan');
  if (tabs.list) {
    tabs.list.classList.add('custom-tab-menu');
    tabs.items.forEach((li, i) => {
      li.classList.add('tab-item');
      li.classList.toggle('is-active', !i);
      const btn = el('a', 'tab-btn', ...li.childNodes);
      btn.href = '#';
      li.append(btn);
      li.addEventListener('click', (e) => {
        e.preventDefault();
        tabs.items.forEach((x) => x.classList.toggle('is-active', x === li));
      });
    });
    calc.append(tabs.list);
  }

  // inputs
  ['amount', 'years', 'months', 'rate'].forEach((k) => {
    fields[k] = field(k, cfg[k], state);
  });
  fields.months.box.hidden = true;
  const units = listItems(cfg.units);
  const unitWrap = el('div', 'month-year-tab-wrap');
  if (units.list) {
    units.list.classList.add('month-year-tab-box');
    units.items.forEach((li, i) => {
      li.classList.add('year-month-item');
      const b = el('span', `year-month-btn-squared${i ? '' : ' active'}`, ...li.childNodes);
      b.dataset.unit = i ? 'mo' : 'yr';
      b.setAttribute('role', 'button');
      b.tabIndex = 0;
      li.append(b);
      b.addEventListener('click', () => {
        st.unit = b.dataset.unit;
        units.list.querySelectorAll('.year-month-btn-squared')
          .forEach((x) => x.classList.toggle('active', x === b));
        fields.years.box.hidden = st.unit !== 'yr';
        fields.months.box.hidden = st.unit !== 'mo';
        render();
      });
    });
    unitWrap.append(units.list);
  }
  const inputsWrap = el(
    'div',
    'calculator-inputs-wrap',
    fields.amount.box,
    el('div', 'month-year-wrapper', unitWrap, fields.years.box, fields.months.box),
    fields.rate.box,
  );

  // results
  const out = {};
  const outP = (name, cls) => {
    out[name] = el('p', cls);
    return out[name];
  };
  const price = el('div', 'calculate-price', ...(cfg.emi ? [first(cfg.emi[0])] : []), outP('emi', 'calculated-emi'));
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'emi-pie');
  svg.setAttribute('viewBox', '0 0 120 120');
  svg.setAttribute('width', '120');
  svg.setAttribute('height', '120');
  svg.setAttribute('aria-hidden', 'true');
  const circle = document.createElementNS(svgNS, 'circle');
  [['cx', 60], ['cy', 60], ['r', 54], ['fill', '#2f8be6']].forEach(([k, v]) => circle.setAttribute(k, v));
  const slice = document.createElementNS(svgNS, 'path');
  slice.setAttribute('fill', '#d8e024');
  slice.setAttribute('transform', 'translate(4 -3)');
  svg.append(circle, slice);
  const legend = el('ul', 'chart-value-list');
  [['total', ''], ['interest', ' charts-lime']].forEach(([k, lime]) => {
    const lab = cfg[k] ? first(cfg[k][0]) : null;
    legend.append(el(
      'li',
      '',
      el('span', `charts-circles${lime}`),
      el('div', 'total-amt-text', ...(lab ? [lab] : [])),
      outP(k, 'total-amt'),
    ));
  });
  const charts = el(
    'div',
    'charts-blocks',
    el('div', 'charts-blocks-left', svg),
    el('div', 'charts-blocks-right', legend),
  );
  const graph = el('div', 'calculator-graph-inner', price, charts);
  if (cfg.cta) {
    const a = cfg.cta.querySelector ? cfg.cta.querySelector('a') || cfg.cta : cfg.cta;
    a.classList.remove('button', 'primary', 'secondary', 'accent');
    a.classList.add('calculate-btn', 'btn-blue', 'btn-large');
    if (cfg.cta.classList) cfg.cta.classList.remove('button-wrapper');
    graph.append(el('div', 'calculate-btn-wrap', cfg.cta));
  }
  calc.append(el(
    'div',
    'calculator-content-wrap calc-panel',
    inputsWrap,
    el('div', 'calculator-graph-wrap', graph),
  ));

  render = () => {
    const n = st.unit === 'yr' ? st.years * 12 : st.months;
    const r = st.rate / 1200;
    const emi = r ? (st.amount * r * (1 + r) ** n) / ((1 + r) ** n - 1) : st.amount / n;
    const total = Math.round(emi) * n;
    const interest = total - st.amount;
    out.emi.textContent = inr(emi);
    out.total.textContent = inr(total);
    out.interest.textContent = inr(interest);
    const ang = (interest / total) * 2 * Math.PI;
    const R = 54;
    const x = 60 + R * Math.sin(ang);
    const y = 60 - R * Math.cos(ang);
    slice.setAttribute('d', `M60 60 L60 ${60 - R} A${R} ${R} 0 ${ang > Math.PI ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`);
    Object.keys(fields).forEach((k) => fields[k].paint(st[k]));
    const active = document.activeElement;
    if (active !== fields.amount.input) fields.amount.input.value = Math.round(st.amount).toLocaleString('en-IN');
    if (active !== fields.years.input) fields.years.input.value = Math.round(st.years * 100) / 100;
    if (active !== fields.months.input) fields.months.input.value = Math.round(st.months);
    if (active !== fields.rate.input) fields.rate.input.value = st.rate;
  };

  const box = el('div', 'loans-calculation-box', dd, calc);
  const inner = el('div', 'mx-944');
  if (cfg.heading) inner.append(el('div', 'calc-title text-center', cfg.heading));
  inner.append(box);
  if (cfg.extra.length) inner.append(el('div', 'calc-disclaimer', ...cfg.extra));
  block.replaceChildren(el('div', 'calculator-box space-tb40', el('div', 'container', inner)));
  render();
}
