/**
 * calculator-tab — the source `calculator-tab-box`: centred title + lede, a tab rail and a
 * filterable grid of calculator cards (icon, linked title, one-line description).
 *
 * Authoring rows:
 *   1. head — <h1> (or <h2>) title + lede paragraph(s)
 *   2..N. one row per tab:
 *        cell 1: the tab label (a paragraph)
 *        cell 2: that tab's cards — per card `:icon-name:` paragraph (optional),
 *                <h3> with the card link, description paragraph
 *      A row with a label but no cards is the "show everything" tab (source: "All").
 *   Cards may also be authored flat after the label in a single cell (segmented by <h3>).
 *
 * @ew-exempt <p> card icon paragraph — `:icon:` glyph key, rendered through the icon font
 */

const text = (el) => (el ? el.textContent.trim() : '');

/** authored :icon: spans render through the icon font, not /icons/*.svg */
function toGlyph(span) {
  span.querySelectorAll('img').forEach((img) => img.remove());
  span.classList.remove('icon');
  span.setAttribute('aria-hidden', 'true');
  return span;
}

const ICON_KEY = /^:([\w-]+):$/;

function isIconPara(el) {
  if (el.tagName !== 'P') return false;
  if (el.querySelector('span.icon')) return !text(el).replace(/:[\w-]+:/g, '');
  // HARNESS-ONLY: the delivery pipeline turns `:name:` into span.icon server-side
  return ICON_KEY.test(text(el));
}

/** the glyph span of an icon paragraph (the raw `:name:` key off-pipeline) */
function glyphOf(iconPara) {
  const span = iconPara.querySelector('span.icon');
  if (span) return toGlyph(span);
  const key = text(iconPara).match(ICON_KEY);
  if (!key) return null;
  const glyph = document.createElement('span');
  glyph.className = `icon-${key[1].toLowerCase()}`;
  glyph.setAttribute('aria-hidden', 'true');
  return glyph;
}

/** segment a flat run of authored nodes into cards on the <h3> boundary */
function segmentCards(nodes) {
  const cards = [];
  let pendingIcon = null;
  let current = null;
  nodes.forEach((node) => {
    if (isIconPara(node)) {
      pendingIcon = node;
      current = null;
      return;
    }
    if (/^H[2-6]$/.test(node.tagName)) {
      current = { icon: pendingIcon, heading: node, body: [] };
      pendingIcon = null;
      cards.push(current);
      return;
    }
    if (current) current.body.push(node);
  });
  return cards;
}

function buildCard(card, category) {
  const li = document.createElement('div');
  li.className = 'calculator-list-li';
  li.dataset.content = category;

  const link = card.heading.querySelector('a') || card.body.map((n) => n.querySelector('a'))
    .find(Boolean);
  const cols = document.createElement(link ? 'a' : 'div');
  cols.className = 'calculator-list-cols bg-div';
  if (link) {
    cols.href = link.href;
    if (link.target) cols.target = link.target;
    // EW6: the indexed heading survives inside the card anchor; no nested anchors
    link.replaceWith(...link.childNodes);
  }

  const iconBox = document.createElement('span');
  iconBox.className = 'all-icon filters-icons';
  const glyph = card.icon && glyphOf(card.icon);
  if (glyph) iconBox.append(glyph);
  else {
    const fallback = document.createElement('span');
    fallback.className = 'icon-emi-calculator';
    fallback.setAttribute('aria-hidden', 'true');
    iconBox.append(fallback);
  }

  const copy = document.createElement('div');
  copy.className = 'calculator-list-copy';
  copy.append(card.heading, ...card.body);
  cols.append(iconBox, copy);
  li.append(cols);
  return li;
}

function activate(block, tabs, index) {
  tabs.forEach((tab, i) => {
    const on = i === index;
    tab.button.classList.toggle('active', on);
    tab.button.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  const { category } = tabs[index];
  block.querySelectorAll('.calculator-list-li').forEach((li) => {
    li.hidden = Boolean(category) && li.dataset.content !== category;
  });
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const head = document.createElement('div');
  head.className = 'tops-heads';
  const groups = [];

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    const nodes = cells.flatMap((cell) => [...cell.children]);
    const hasCards = nodes.some((n) => n.tagName === 'H3');
    const lead = nodes.find((n) => /^H[12]$/.test(n.tagName));
    if (lead && !hasCards) {
      head.append(...nodes);
      return;
    }
    let labelNode = null;
    let cardNodes = nodes;
    if (cells.length > 1) {
      [labelNode] = [...cells[0].children];
      cardNodes = cells.slice(1).flatMap((cell) => [...cell.children]);
    } else {
      const firstCard = nodes.findIndex((n) => n.tagName === 'H3' || isIconPara(n));
      const pre = firstCard === -1 ? nodes : nodes.slice(0, firstCard);
      labelNode = pre.find((n) => text(n));
      cardNodes = firstCard === -1 ? [] : nodes.slice(firstCard);
    }
    if (!labelNode && !cardNodes.length) return;
    groups.push({ labelNode, category: text(labelNode), cards: segmentCards(cardNodes) });
  });

  const section = document.createElement('section');
  section.className = 'calculator-tab-box space-tb40 pd-t20i';
  const container = document.createElement('div');
  container.className = 'container';
  section.append(container);
  if (head.children.length) container.append(head);

  const inner = document.createElement('div');
  inner.className = 'calculator-tab-inner';
  const rail = document.createElement('div');
  const tabList = document.createElement('ul');
  tabList.className = 'tab-btn-group';
  tabList.setAttribute('role', 'tablist');
  rail.append(tabList);
  const grid = document.createElement('div');
  grid.className = 'calculator-list-ul';

  const tabs = [];
  groups.forEach((group) => {
    group.cards.forEach((card) => grid.append(buildCard(card, group.category)));
    if (!group.labelNode) return;
    const item = document.createElement('li');
    item.className = 'tab-item';
    const button = document.createElement('a');
    button.className = 'tab-button';
    button.href = '#';
    button.setAttribute('role', 'tab');
    button.append(group.labelNode);
    item.append(button);
    tabList.append(item);
    tabs.push({ button, category: group.cards.length ? group.category : '' });
  });

  if (tabs.length > 1) inner.append(rail);
  inner.append(grid);
  container.append(inner);
  block.replaceChildren(section);

  if (!tabs.length) return;
  tabs.forEach((tab, i) => {
    tab.button.addEventListener('click', (e) => {
      e.preventDefault();
      activate(block, tabs, i);
    });
  });
  activate(block, tabs, 0);
}
