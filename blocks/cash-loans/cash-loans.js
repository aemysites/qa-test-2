/**
 * cash-loans — "Choose the Personal Loan Amount" band (source `cash-loans-box`): centred <h2>
 * over a two-column list of amount links; the first six show, "Read More" reveals the rest.
 * Schema: stardust/eds-schema/personal-loan.json → sections[cash-loans-box].
 * Decode tier: reconstructive (one row per link; a flat <ul> of links also works).
 *
 * Authoring rows: 1. <h2> (<strong> tail) · 2..N. <p><a href>label</a></p> (or one <ul>).
 * "Read More" / "Read Less" are generated controls (source buttons, not authored text).
 * Variant `expanded` (home-loan "Different Budgets"): every link shows, no Read More control.
 */

const SHOWN = 6;

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids.filter(Boolean));
  return n;
}

function button(cls, label) {
  const b = el('button', cls);
  b.type = 'button';
  b.textContent = label;
  return b;
}

export default function decorate(block) {
  const heading = block.querySelector('h2');
  const links = [...block.querySelectorAll('a')];
  const ul = el('ul', 'list-cash-loans cashLoanReadMoreLess');
  links.forEach((a) => {
    a.className = 'bg-div heading20 semibold myAnchorTag';
    ul.append(el('li', 'cash-loan-row', a.closest('p, li') || a));
  });
  const items = [...ul.children];
  const card = el('div', 'cash-loan-card', ul);
  if (items.length > SHOWN && !block.classList.contains('expanded')) {
    const more = button('btn-blue btn-large', 'Read More');
    const less = button('btn-blue btn-large d-none', 'Read Less');
    const set = (open) => {
      items.forEach((li, i) => { li.hidden = !open && i >= SHOWN; });
      more.classList.toggle('d-none', open);
      less.classList.toggle('d-none', !open);
    };
    more.addEventListener('click', () => set(true));
    less.addEventListener('click', () => set(false));
    set(false);
    card.append(el('div', 'cash-list-load text-center pd-t30i', more, less));
  }
  const top = heading ? el('div', 'tops-heads', el('div', 'component-title title text-center', heading)) : null;
  if (heading) heading.classList.add('heading36', 'best-deals-heading');
  block.replaceChildren(el('div', 'cash-loan', el(
    'section',
    'cash-loans-box space-tb40',
    el('div', 'container', top, el('div', 'mx-944', card)),
  )));
}
