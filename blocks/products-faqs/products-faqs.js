/**
 * products-faqs — the source `csr-products-faqs` / `media-resources-box` band (CSR campaign
 * page): centred heading + intro; left, a green loan-type dropdown over a side image; right, a
 * scrolling accordion of the selected loan type's "Sahi Sawaal" questions.
 * Decode tier: reconstructive (one accordion column per loan-type row).
 *
 * Authoring:
 *   1. head — <h2> (<strong> for the bold tail) + intro <p>s
 *   2. side picture (one cell)
 *   3..N. one row per loan type — loan-type name <p> | questions: <h3> question + answer <p>s,
 *      repeated
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

function accordion(cell, idx) {
  const list = el('div', 'resource-update-list cmp-accordion simple-bar');
  let item = null;
  [...cell.children].forEach((n) => {
    if (/^H[2-6]$/.test(n.tagName)) {
      n.className = 'faq-heading cmp-accordion__button faq-accordion-button';
      n.setAttribute('role', 'button');
      n.tabIndex = 0;
      n.setAttribute('aria-expanded', 'false');
      const panel = el('div', 'cmp-accordion__panel cmp-accordion__panel--hidden', el(
        'div',
        'popular-faq-description-structure',
        el('div', 'faq-body-inner', el('div', 'text', el('div', 'cmp-text'))),
      ));
      item = el('div', 'cmp-accordion__item faq-row', el('div', 'cmp-accordion__header faq-accordion-button', n), panel);
      list.append(item);
    } else if (item) {
      item.querySelector('.cmp-text').append(n);
    }
  });
  list.setAttribute('role', 'region');
  list.setAttribute('aria-label', `Questions ${idx + 1}`);
  list.tabIndex = 0;
  const col = el('div', 'col-sp20 resent50 csr-right-accordian', el(
    'div',
    'resource-update-wrap bg-div',
    el('div', 'resoure-update-bottom', list),
  ));
  return col;
}

function wireAccordion(col) {
  col.querySelectorAll('.faq-heading').forEach((h) => {
    const panel = h.closest('.faq-row').querySelector('.cmp-accordion__panel');
    const toggle = () => {
      const open = panel.classList.toggle('cmp-accordion__panel--hidden') === false;
      h.classList.toggle('active', open);
      h.setAttribute('aria-expanded', String(open));
    };
    h.addEventListener('click', toggle);
    h.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  const head = rows.shift();
  const sideRow = rows[0] && rows[0].querySelector('picture, img') && !rows[0].querySelector('h3')
    ? rows.shift() : null;
  const heading = head && head.querySelector('h1, h2, h3');
  if (heading) heading.classList.add('text-center', 'heading36');
  const intro = head ? [...head.querySelectorAll('p')] : [];
  const tops = el('div', 'tops-heads', el(
    'div',
    'cmp-container',
    el('div', 'component-title title', el('div', 'container', ...(heading ? [heading] : []))),
    el('div', 'text', el('div', 'cmp-text', ...intro)),
  ));

  const types = [];
  const cols = [];
  rows.forEach((row, i) => {
    const [nameCell, qCell] = row.children;
    if (!nameCell || !qCell) return;
    const name = nameCell.querySelector('p') || nameCell;
    const a = el('a', 'hpc-dropdown-title csr-dropdown', name);
    a.href = '#';
    const li = el('li', 'switch-tab', a);
    li.setAttribute('role', 'tab');
    types.push(li);
    const col = accordion(qCell, i);
    if (i) col.classList.add('d-none');
    cols.push(col);
  });

  const current = el('a', 'hpc-dropdown-heading dropdown-heading csrLoanDropdown', types[0] ? types[0].textContent.trim() : '');
  current.href = '#';
  current.setAttribute('role', 'button');
  current.setAttribute('aria-expanded', 'false');
  const menu = el('div', 'dropdown-block', el('ul', 'custom-active-tab', ...types));
  const dropdown = el('div', 'custom-dropdown close-on-outside loans-dropdown', current, menu);
  const left = el('div', 'resource-report-right', dropdown);
  const pic = sideRow && sideRow.querySelector('picture, img');
  if (pic) {
    const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img');
    if (img) img.classList.add('resource-right-img');
    left.append(el('div', 'resource-report-rb', pic));
  }
  const grid = el('div', 'row-flex row-flex-20', el('div', 'col-sp20 resent50 csr-left-img', left), ...cols);
  const section = el('section', 'media-resources-box space-tb40', el('div', 'container', tops, grid));
  section.id = 'products-faqs';
  block.replaceChildren(el('div', 'csr-products-faqs', section));

  cols.forEach(wireAccordion);
  const setMenu = (open) => {
    menu.style.display = open ? 'block' : '';
    current.classList.toggle('active', open);
    current.setAttribute('aria-expanded', String(open));
  };
  current.addEventListener('click', (e) => {
    e.preventDefault();
    setMenu(menu.style.display !== 'block');
  });
  types.forEach((li, i) => li.querySelector('a').addEventListener('click', (e) => {
    e.preventDefault();
    current.textContent = li.textContent.trim();
    types.forEach((t) => t.querySelector('a').classList.toggle('active', t === li));
    cols.forEach((c, j) => c.classList.toggle('d-none', j !== i));
    setMenu(false);
  }));
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) setMenu(false);
  });
}
