/**
 * reasons — the source `why-to-choose-us` / `reasons-box` feature list: a centred <h2> and
 * intro over full-width glass cards, each with a round icon, an <h3> title and copy.
 * Schema: stardust/eds-schema/home-loan-app.json → sections[reasons-box].
 * Decode tier: reconstructive (one card per <h3>).
 *
 * Authoring:
 *   1. head — <h2> (<strong> for the bold tail) + optional intro <p>s
 *   2..N. one row per card — `:icon-name:` paragraph (optional) | <h3> title | <p> text.
 *      Cards may also be authored flat in one cell (segmented on the <h3>).
 * @variants block class: spaced — one blank line after the intro (source trailing <br>&nbsp;)
 *   footnote — the last row is a footnote <p> under the cards (source `.text` after the list,
 *   home-loan features); its leading <br> blank line is CSS
 *   csr — statement band without cards (CSR campaign page, source `reasons-box
 *   padding-bottom-0` > `.CSR` > `cmp-container mg-b25`): no bottom padding, 25px under the head
 * @ew-exempt <p> card icon paragraph — `:icon:` glyph key, rendered through the icon font
 */

const ICON_KEY = /^:([\w-]+):$/;
const txt = (n) => (n ? n.textContent.trim() : '');

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

function isIconPara(n) {
  if (n.tagName !== 'P') return false;
  if (n.querySelector('span.icon')) return !txt(n).replace(/:[\w-]+:/g, '');
  return ICON_KEY.test(txt(n)); // HARNESS-ONLY: the pipeline makes span.icon server-side
}

function glyphOf(p) {
  let span = p.querySelector('span.icon');
  if (span) {
    span.querySelectorAll('img').forEach((i) => i.remove());
    span.classList.remove('icon');
  } else {
    span = el('span', `icon-${txt(p).match(ICON_KEY)[1].toLowerCase()}`);
  }
  span.classList.add('all-icon');
  span.setAttribute('aria-hidden', 'true');
  return span;
}

export default function decorate(block) {
  const foot = block.classList.contains('footnote') && block.children.length > 1
    ? block.lastElementChild : null;
  if (foot) foot.remove();
  const nodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) nodes.push(...kids);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p'); // harness-only fallback: moved, never copied
      p.append(...cell.childNodes);
      nodes.push(p);
    }
  });
  const headNodes = [];
  const cards = [];
  let icon = null;
  nodes.forEach((n) => {
    if (isIconPara(n)) { icon = n; return; }
    if (n.tagName === 'H3') {
      cards.push({ icon, title: n, body: [] });
      icon = null;
    } else if (cards.length) cards[cards.length - 1].body.push(n);
    else headNodes.push(n);
  });

  const heading = headNodes.find((n) => n.tagName === 'H2');
  const intro = headNodes.filter((n) => n !== heading);
  const head = el('div', 'cmp-container');
  if (heading) {
    heading.classList.add('text-center', 'heading36');
    head.append(el('div', 'component-title title mg-b15', el('div', 'container', heading)));
  }
  if (intro.length) head.append(el('div', 'rte title', el('div', 'tc-rte', ...intro)));

  const list = el('div', 'cmp-container reasons-list-container');
  cards.forEach((c) => {
    c.title.classList.add('heading20');
    const col = el('div', 'reasons-col');
    if (c.icon) col.append(el('div', 'reasons-icon', glyphOf(c.icon)));
    col.append(c.title, ...c.body);
    list.append(el('div', 'why-to-choose-us-reasonlist teaser', el('li', 'cmp-teaser', col)));
  });
  if (foot) list.append(el('div', 'text', el('div', 'cmp-text', ...foot.querySelectorAll('p'))));
  const ul = el('ul', 'reasons-list', list);
  if (block.classList.contains('csr')) head.classList.add('mg-b25');
  const box = `reasons-box space-tb40${block.classList.contains('csr') ? ' padding-bottom-0' : ''}`;
  block.replaceChildren(el('section', box, el(
    'div',
    'container',
    el('div', 'reasons-inner', head, ul),
  )));
}
