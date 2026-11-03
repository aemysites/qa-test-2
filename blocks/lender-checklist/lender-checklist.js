/**
 * lender-checklist — the source `csr-checklist-pdf` / `loan-against-prop-box` card (CSR campaign
 * page): centred heading + intro over a glass card with a green title bar, a scrolling two-column
 * list of checked items, and a Download link to the checklist PDF.
 * Decode tier: reconstructive (one item per row).
 *
 * Authoring:
 *   1. head — <h2> (<strong> for the bold tail) + intro <p>s
 *   2. card title — one heading
 *   3..N. one row per checklist item — <p> (<strong> lead-in + text)
 *   last. download row — <p> with the PDF link
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

export default function decorate(block) {
  const rows = [...block.children];
  const head = rows.shift();
  const titleRow = rows[0] && rows[0].querySelector('h1, h2, h3, h4, h5, h6') ? rows.shift() : null;
  const last = rows[rows.length - 1];
  const dlRow = last && last.querySelector('a') && last.textContent.trim().length < 40 ? rows.pop() : null;

  const heading = head && head.querySelector('h1, h2, h3');
  if (heading) heading.classList.add('text-center');
  const intro = head ? [...head.querySelectorAll('p')] : [];
  const tops = el(
    'div',
    'tops-heads',
    el('div', 'container', ...(heading ? [heading] : [])),
    el('div', 'cmp-text', ...intro),
  );

  const title = titleRow && titleRow.querySelector('h1, h2, h3, h4, h5, h6');
  const items = rows.map((row) => {
    const tick = el('span', 'all-icon32 icon-check');
    tick.setAttribute('aria-hidden', 'true');
    const body = el('div', '', ...row.querySelectorAll('p'));
    return el('div', 'row-col-33 col-sp30', el('div', 'form-textbox-new', el(
      'div',
      'test-cols text14i csr-checklist-items',
      el('div', 'test-icon', tick),
      body,
    )));
  });
  const list = el('div', 'row-flex row-flex-30 simple-bar', el('div', 'simplebar-content', ...items));
  list.setAttribute('role', 'region');
  list.setAttribute('aria-label', title ? title.textContent.trim() : 'Checklist');
  list.tabIndex = 0;

  const form = el('div', 'loan-against-form', el('div', 'loan-against-form-wrapper', list));
  const dl = dlRow && dlRow.querySelector('a');
  if (dl) {
    dl.className = 'downloadBtn';
    const glyph = el('span', 'icon-download-new');
    glyph.setAttribute('aria-hidden', 'true');
    dl.append(glyph);
    const p = dl.closest('p');
    if (p) p.className = 'la-download';
    form.append(el('div', 'btn-controls', p || dl));
  }
  const card = el(
    'div',
    'loan-against-form-wrap',
    el('div', 'loan-against-header', ...(title ? [title] : [])),
    el('div', 'loan-against-body', form),
  );
  const section = el('section', 'loan-against-prop-box pd-t50', el('div', 'container', tops, card));
  section.id = 'checklist';
  block.replaceChildren(el('div', 'csr-checklist-pdf', section));
}
