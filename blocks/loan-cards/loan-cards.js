/**
 * loan-cards — the source `personal-loan-box` (about-product) white content card: an <h2>
 * title over rich text (paragraphs, <h3> sub-heads, bulleted lists). Blocks authored right
 * after it in the same section (e.g. a `table`) are adopted into the card, after the text.
 * Schema: stardust/eds-schema/check-credit-score.json → sections[personal-loan-box].
 * Decode tier: reconstructive (one card per <h2>; flat cells or one row per card).
 *
 * Authoring: one or more rows/cells; each <h2> (<strong> for the bold tail) opens a card, and
 * every element up to the next <h2> (p, h3–h6, ul, ol, picture) is the card's body.
 * Content before the first <h2> opens a title-less card.
 * A row holding only CTA paragraphs (<strong><a>) is the actions row: the button renders
 * centred below the card (source `customcontainer > white-blue-button`).
 * Variant `details` (program pages, source `top-loan-space` card + `product-loan-box`): the
 * row with 2+ cells (not the CTA row) is the blue key-figures strip under the first card —
 * one cell per figure: label <p>, value <p>, optional link <p> (or a link-only cell).
 * Variant `pull` (with `details`, home-loan): the strip items keep the source -30px pull
 * (live they sit in a nested div.amount-info-pers, so the ul margin reset never applied).
 * Variant `spaced` (campaign pages): one blank line after the last list item (the source's
 * trailing `<br>&nbsp;` the pipeline drops; CSS only).
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      // harness-only fallback: bare text moved (never copied) into a <p>
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

function buildCard(heading, body) {
  const para = el('div', 'personal-para');
  if (heading) para.append(el('div', 'component-title title', heading));
  if (body.length) para.append(el('div', 'rte title', el('div', 'tc-rte', ...body)));
  const card = el('div', 'about-product-big-div title', el('div', 'bg-div personal-cards', para));
  return { card, para };
}

const isCtaRow = (row) => {
  const kids = [...row.querySelectorAll(':scope > div > *')];
  return kids.length > 0 && kids.every((k) => k.tagName === 'P' && k.querySelector('strong a, em a, a.button')
    && k.textContent.trim() === k.querySelector('a').textContent.trim());
};

function buildActions(row) {
  const box = el('div', 'cmp-container d-flex justify-content-center');
  row.querySelectorAll(':scope > div > p').forEach((p) => {
    const a = p.querySelector('a');
    a.classList.remove('button', 'primary', 'secondary');
    a.classList.add('text-center', 'btn-blue', 'btn-big');
    p.classList.remove('button-wrapper');
    box.append(el('div', 'white-blue-button button', p));
  });
  return el('div', 'customcontainer container', box);
}

// variant `inner-cta`: the source button sits inside the card, under the text
function buildInnerActions(row) {
  const box = el('div', 'cmp-container');
  row.querySelectorAll(':scope > div > p').forEach((p) => {
    const a = p.querySelector('a');
    a.classList.remove('button', 'primary', 'secondary');
    a.classList.add('btn-blue', 'btn-large', 'mg-t15');
    p.classList.remove('button-wrapper');
    box.append(el('div', 'white-blue-button button', p));
  });
  return box;
}

function buildDetails(row) {
  const ul = el('ul', 'amount-info-pers');
  [...row.children].forEach((cell) => {
    const ps = [...cell.querySelectorAll(':scope > p')];
    const linkOnly = ps.length === 1 && ps[0].querySelector('a')
      && ps[0].textContent.trim() === ps[0].querySelector('a').textContent.trim();
    if (linkOnly) {
      ps[0].classList.remove('button-wrapper');
      ps[0].classList.add('btn-links', 'views-links', 'white-links');
      ps[0].querySelector('a').classList.remove('button', 'primary', 'secondary');
    }
    const [label, value, ...rest] = linkOnly ? [] : ps;
    if (label) label.className = 'text16i';
    if (value) value.className = 'heading20';
    rest.forEach((x) => x.classList.add('btn-links', 'views-links', 'white-links'));
    const li = el('li', 'blue-card-items');
    if (rest.length) {
      li.append(
        el('div', 'personal-loan-rte title', label),
        el('div', 'last-text', el('div', 'per-flex-text', value, ...rest)),
      );
    } else li.append(el('div', 'personal-loan-rte title', ...ps));
    ul.append(li);
  });
  row.remove();
  return el('div', 'cmp-container', el('div', 'product-loan-box title', el(
    'div',
    'loan-details-outer z-index-0',
    el('div', 'loans-details-per', ul),
  )));
}

export default function decorate(block) {
  const detailsRow = block.classList.contains('details')
    ? [...block.children].find((r) => r.children.length > 1 && !isCtaRow(r)) : null;
  const details = detailsRow ? buildDetails(detailsRow) : null;
  const actionRows = [...block.children].filter(isCtaRow);
  const inner = block.classList.contains('inner-cta');
  const actions = actionRows.map(inner ? buildInnerActions : buildActions);
  actionRows.forEach((r) => r.remove());
  const nodes = collectNodes(block);
  const groups = [];
  nodes.forEach((n) => {
    if (n.tagName === 'H2' || !groups.length) groups.push({ heading: null, body: [] });
    const g = groups[groups.length - 1];
    if (n.tagName === 'H2' && !g.heading) g.heading = n;
    else g.body.push(n);
  });
  if (!groups.length) return;
  const built = groups.map((g) => buildCard(g.heading, g.body));
  const container = el('div', 'container', ...built.map((b) => b.card));

  // adopt the blocks that follow in the same section (e.g. a table) into the last card
  const wrapper = block.parentElement;
  const adopt = [];
  let next = wrapper ? wrapper.nextElementSibling : null;
  while (next && next.querySelector(':scope > .block') && !next.classList.contains('loan-cards-wrapper')) {
    adopt.push(next);
    next = next.nextElementSibling;
  }
  if (adopt.length) built[built.length - 1].para.append(...adopt);
  const sectionCls = details ? 'personal-loan-box top-loan-space space-tb40' : 'personal-loan-box space-tb40';
  if (details) {
    built[0].card.firstElementChild.classList.add('personal-bottom-card');
    built[0].card.append(details);
  }

  if (inner && actions.length) built[built.length - 1].card.firstElementChild.append(...actions);
  block.replaceChildren(
    el('div', 'about-product', el('section', sectionCls, container)),
    ...(inner ? [] : actions),
  );
}
