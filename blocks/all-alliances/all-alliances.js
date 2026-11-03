/**
 * all-alliances — the source `all-alliances-box` (partners page): centred title + lede, then
 * one full-width card per partner (logo tile | name, description, "View …" links).
 *
 * Authoring rows:
 *   1. head — <h1> (or <h2>) title + lede paragraph(s)
 *   2..N. one row per partner: logo picture | <h3> name, description paragraph(s),
 *         one paragraph per link (a paragraph holding only a link is a card link).
 *   Optional 3rd cell: the word `spaced` — the source card carried two blank spacer lines
 *   (`&nbsp;` paragraphs / trailing breaks) under its copy, which DA drops.
 *   Partners may also be authored flat in one cell: a picture or a second heading opens
 *   the next card. The source's empty (`&nbsp;`) spacer paragraphs do not survive DA, so
 *   the blank line between paragraphs and the gap above the links are block CSS.
 *
 * @variants cell 3: spaced
 * @ew-exempt <p> 3rd-cell variant word (`spaced`) — card metadata, never displayed
 */

const VARIANTS = ['spaced'];

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

const isMedia = (n) => n.matches('picture, img') || !!n.querySelector('picture, img');
const isHead = (n) => /^H[12]$/.test(n.tagName);
const isTitle = (n) => /^H[3-6]$/.test(n.tagName);

function isLinkPara(n) {
  if (n.tagName !== 'P') return false;
  const links = n.querySelectorAll('a[href]');
  return links.length === 1 && n.textContent.trim() === links[0].textContent.trim()
    && !!n.textContent.trim();
}

/** a trailing cell holding only a declared variant word: consumed, returned */
function takeVariant(row) {
  const cells = row.querySelectorAll(':scope > div');
  const last = cells.length > 1 ? cells[cells.length - 1] : null;
  const word = last ? last.textContent.trim().toLowerCase() : '';
  if (!VARIANTS.includes(word)) return null;
  last.remove();
  return word;
}

/** existing authored elements of one row, in order (media-led <p> wrappers expanded) */
function rowNodes(row) {
  const out = [];
  row.querySelectorAll(':scope > div').forEach((cell) => {
    [...cell.children].forEach((kid) => {
      if (kid.tagName === 'P' && kid.querySelector('picture') && kid.children.length > 1) {
        out.push(...kid.children);
      } else {
        out.push(kid);
      }
    });
  });
  return out;
}

function buildCard(nodes) {
  const left = el('div', 'left-col');
  const text = el('div', 'text14i');
  const actions = el('div', 'cmp-teaser__action-container');
  const right = el('div', 'right-col');
  let title = null;
  nodes.forEach((n) => {
    if (!title && !text.children.length && isMedia(n) && !isLinkPara(n)) {
      left.append(n);
    } else if (!title && isTitle(n)) {
      title = n;
    } else if (isLinkPara(n)) {
      const arrow = el('span', 'icon-arrow-right arros');
      arrow.setAttribute('aria-hidden', 'true');
      n.querySelector('a').target = '_blank';
      actions.append(el('div', 'btn-links link-with-arrow alliances-space', n, arrow));
    } else {
      text.append(el('div', 'text-para', n));
    }
  });
  if (title) right.append(el('div', 'heading20', title));
  if (text.children.length) right.append(text);
  if (actions.children.length) right.append(el('div', 'view-details', actions));
  return el('div', 'all-alliances-items teaser all-alliances-row', el(
    'div',
    'all-alliances-col bg-div',
    left,
    right,
  ));
}

/** split one row's nodes into cards: a picture or a second title opens a new card */
function segment(nodes) {
  const cards = [];
  let cur = null;
  nodes.forEach((n) => {
    const media = isMedia(n) && !isLinkPara(n);
    const opens = !cur || (media && cur.some((x) => isTitle(x) || x.tagName === 'P'))
      || (isTitle(n) && cur.some(isTitle));
    if (opens) {
      cur = [];
      cards.push(cur);
    }
    cur.push(n);
  });
  return cards;
}

export default function decorate(block) {
  const head = el('div', 'tops-heads');
  const inner = el('div', 'all-alliances-inner');
  [...block.children].forEach((row) => {
    const variant = takeVariant(row);
    const nodes = rowNodes(row);
    if (!nodes.length) return;
    if (nodes.some(isHead) || (!nodes.some(isTitle) && !nodes.some(isMedia))) {
      nodes.forEach((n) => {
        if (isHead(n)) head.append(el('div', 'main-title', n));
        else head.append(n);
      });
      return;
    }
    segment(nodes).forEach((card) => {
      const unit = buildCard(card);
      if (variant) unit.classList.add(variant);
      inner.append(unit);
    });
  });
  const container = el('div', 'container');
  if (head.children.length) container.append(head);
  container.append(inner);
  block.replaceChildren(el(
    'section',
    'all-alliances-box space-tb40 pd-t50 space-b80',
    container,
  ));
}
