/**
 * faq — the source `faq-box` accordion: a centred <h2> over a white card of questions; each
 * question row toggles its answer, the first six show and "Read More" reveals the rest.
 * Schema: stardust/eds-schema/check-credit-score.json → sections[faq-box].
 * Decode tier: reconstructive (one row per question).
 *
 * Authoring:
 *   1. head — <h2> (<strong> for bold); optional (a heading authored as default content just
 *      before the block is reabsorbed)
 *   2..N. one row per item — question (<h3>, or a <p>) | answer (<p>s, lists, links)
 * @variants block class: all (show every item, no Read More) — default shows 6;
 *   app — campaign page sheet spacing (title 25px above the card at ≥768px)
 * The question stays an authored heading inside a clickable header row; the chevron is a
 * generated toggle <button> (EW7). "Read More" / "Read Less" are generated controls.
 */

const VISIBLE = 6;
let uid = 0;

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids.filter(Boolean));
  return n;
}

function button(cls, label) {
  const b = el('button', cls, label);
  b.type = 'button';
  return b;
}

export default function decorate(block) {
  uid += 1;
  const rows = [...block.children];
  let heading = null;
  const items = [];
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) {
      const h = row.querySelector('h1, h2');
      if (h && !heading) heading = h;
      return;
    }
    items.push({ q: cells[0], a: cells[1] });
  });
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  if (!heading && prev && prev.classList.contains('default-content-wrapper')) {
    heading = prev.querySelector('h2');
    if (heading) prev.remove();
  }

  const list = el('div', 'cmp-accordion');
  const rowsOut = items.map(({ q, a }, i) => {
    const id = `faq-${uid}-${i}`;
    const question = q.querySelector('h2, h3, h4, h5, h6, p') || q;
    const toggle = button('cmp-accordion__icon');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', `${id}-panel`);
    toggle.setAttribute('aria-label', 'Show answer');
    const header = el('div', 'cmp-accordion__header', ...q.childNodes.length ? [...q.childNodes] : [], toggle);
    const body = el('div', 'text', el('div', 'cmp-text', ...a.children));
    const panel = el(
      'div',
      'cmp-accordion__panel cmp-accordion__panel--hidden',
      el('div', 'popular-faq-description-structure', el('div', 'faq-body-inner', el('div', 'cmp-container', body))),
    );
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'region');
    if (question.id) panel.setAttribute('aria-labelledby', question.id);
    const item = el('div', 'cmp-accordion__item faq-row', header, panel);
    const flip = () => {
      const open = panel.classList.contains('cmp-accordion__panel--hidden');
      panel.classList.toggle('cmp-accordion__panel--hidden', !open);
      item.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Hide answer' : 'Show answer');
    };
    header.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      flip();
    });
    return item;
  });
  list.append(...rowsOut);

  const card = el('div', 'faq-card bg-div jsFaqLoadmoreList pd-b-0', el(
    'div',
    'cmp-container',
    el('div', 'popular-faq accordion panelcontainer', list),
  ));
  const all = block.classList.contains('all') || rowsOut.length <= VISIBLE;
  const show = (n) => rowsOut.forEach((r, i) => r.classList.toggle('is-visible', i < n));
  const container = el('div', 'container');
  if (heading) {
    container.append(el('div', 'tops-heads', el('div', 'cmp-container', el('div', 'component-title title', el(
      'div',
      'container heading36 text-center',
      heading,
    )))));
  }
  container.append(el('div', 'faq-list', card));
  show(all ? rowsOut.length : VISIBLE);
  if (!all) {
    const more = button('btn-blue btn-large', 'Read More');
    const less = button('btn-blue btn-large d-none', 'Read Less');
    more.addEventListener('click', () => {
      show(rowsOut.length);
      more.classList.add('d-none');
      less.classList.remove('d-none');
    });
    less.addEventListener('click', () => {
      show(VISIBLE);
      less.classList.add('d-none');
      more.classList.remove('d-none');
      card.scrollIntoView({ block: 'start' });
    });
    container.append(el('div', 'faq-list-load text-center pd-t30i', more, less));
  }
  block.replaceChildren(el('div', 'popular-faq-box title', el('section', 'faq-box space-tb40', container)));
}
