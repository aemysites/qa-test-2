/**
 * table — the source `table-box` data table (blue header row, zebra rows, rounded corners,
 * scrollable region). Placed after a `loan-cards` block in the same section it renders
 * inside that card.
 * Schema: stardust/eds-schema/check-credit-score.json → personal-loan-box table units.
 * Decode tier: reconstructive (one row per table row; first row = header).
 *
 * Authoring: one row per table row, one cell per column; the first row is the header.
 * Cell content (text, <p>, links, <strong>) is moved into the <th>/<td> as authored.
 * @variants block class: no-header (default: first row is the header);
 *   two — the source `table-two` rates table (campaign pages): an optional first row holding
 *   only an <h2> renders as the centred section title above it; blue header row, zebra rows;
 *   black — the source `table-black` header row (dark grey instead of blue);
 *   grouped — an empty first cell continues the group above it (source `rowspan`).
 *   flush — with `two`: inside a loan-cards card, flush under the text (home-loan); cell
 *   <ul>s render as source list-circle-info bullets.
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

function decorateTwo(block, rows) {
  const out = [];
  let body = rows;
  const h2 = rows[0].querySelector('h2');
  if (h2 && rows[0].children.length === 1) {
    h2.classList.add('text-center', 'heading36');
    out.push(el('div', 'cmp-container pd-t40i', el(
      'div',
      'component-title title mg-b15',
      el('div', 'container', h2),
    )));
    body = rows.slice(1);
  }
  const table = el('table');
  const tbody = el('tbody');
  body.forEach((row, i) => {
    const tr = el('tr');
    [...row.children].forEach((cell) => tr.append(el(i ? 'td' : 'th', '', ...cell.childNodes)));
    if (i === 0) table.append(el('thead', '', tr));
    else tbody.append(tr);
  });
  table.append(tbody);
  out.push(el('div', 'cmp-container container pd-t30i', el('div', 'table-two', el(
    'div',
    'retes-chanrges-inner',
    el('div', 'table-section', el('div', 'table-main-new', table)),
  ))));
  block.replaceChildren(...out);
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;
  if (block.classList.contains('two')) {
    decorateTwo(block, rows);
    return;
  }
  const hasHead = !block.classList.contains('no-header');
  const black = block.classList.contains('black');
  const table = el('table', `table-main ${black ? 'table-black' : 'table-blue'} w-100`);
  const tbody = el('tbody');
  rows.forEach((row, i) => {
    const head = hasHead && i === 0;
    const tr = el('tr', head ? 'sticky-header' : '');
    [...row.children].forEach((cell, j) => {
      const c = el(head ? 'th' : 'td', j === 0 ? 'sticky-cell' : '', ...cell.childNodes);
      tr.append(c);
    });
    if (head) table.append(el('thead', '', tr));
    else tbody.append(tr);
  });
  table.append(tbody);
  if (block.classList.contains('grouped')) {
    let lead = null;
    [...tbody.rows].forEach((tr) => {
      const first = tr.cells[0];
      if (lead && first && !first.textContent.trim() && !first.children.length) {
        lead.rowSpan += 1;
        first.remove();
        tr.cells[0]?.classList.remove('sticky-cell');
      } else lead = first;
    });
  }
  const region = el('div', 'table-block', table);
  region.setAttribute('role', 'region');
  region.tabIndex = 0;
  const first = table.querySelector('th, td');
  region.setAttribute('aria-label', `${first ? first.textContent.trim() : 'Data'} table`);
  block.replaceChildren(el('div', 'main-content', el('section', 'table-box', el('div', 'table-section', region))));
}
