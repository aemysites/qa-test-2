/**
 * emi-option — the source `emi-option-box document-required-box` feature grid: a centred
 * head (<h2> + intro paragraphs) over glass cards (icon, <h3> title, description); four or
 * fewer cards sit centred on desktop, one card per view (swipe) on mobile.
 * Schema: stardust/eds-schema/check-credit-score.json → sections[emi-option-box].
 * Decode tier: reconstructive (one card per <h3>).
 *
 * Authoring:
 *   1. head — <h2> (<strong> for the bold tail) + intro <p>s (optional; a heading authored
 *      as default content just before the block is reabsorbed)
 *   2..N. one row per card — `:icon-name:` paragraph (optional) | <h3> title | <p> text.
 *      Cards may also be authored flat in one cell (segmented on the <h3>).
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

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p'); // harness-only fallback: moved, never copied
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

/** split authored nodes into head (before the first card) and cards (on the <h3>) */
function segment(nodes) {
  const head = [];
  const cards = [];
  let pendingIcon = null;
  nodes.forEach((n) => {
    if (isIconPara(n)) { pendingIcon = n; return; }
    if (n.tagName === 'H3') {
      cards.push({ icon: pendingIcon, title: n, body: [] });
      pendingIcon = null;
    } else if (cards.length && n.tagName !== 'H2') cards[cards.length - 1].body.push(n);
    else head.push(n);
  });
  return { head, cards };
}

function reabsorbHead(block) {
  const wrapper = block.parentElement;
  const prev = wrapper && wrapper.previousElementSibling;
  if (!prev || !prev.classList.contains('default-content-wrapper') || block.querySelector('h2')) return [];
  const kids = [...prev.children];
  prev.remove();
  return kids;
}

export default function decorate(block) {
  const { head, cards } = segment([...reabsorbHead(block), ...collectNodes(block)]);
  const section = el('section', 'emi-option-box document-required-box document-four space-tb40');
  // variant `three`: the source box without `document-four` (three cards per row)
  if (block.classList.contains('three')) section.classList.remove('document-four');
  if (head.length) {
    const h2 = head.find((n) => n.tagName === 'H2');
    const top = el('div', 'cmp-container tops-heads mx-1060');
    if (h2) top.append(el('div', 'component-title title', el('div', 'container heading36 text-center', h2)));
    const rest = head.filter((n) => n !== h2);
    if (rest.length) top.append(el('div', 'rte title', el('div', 'tc-rte', ...rest)));
    section.append(el('div', 'container', el('ul', '', top)));
  }
  const row = el('div', 'cmp-container document-flex-row emi-option flex-slider slider-arrows slider-dots');
  cards.forEach((c) => {
    const icon = el('div', 'option-icon');
    if (c.icon) icon.append(glyphOf(c.icon));
    icon.append(c.title);
    const col = el('div', 'bg-div option-col', icon);
    // title-only cards (no body) carry no description box, as on the source
    if (c.body.length) col.append(el('div', 'cmp-teaser__description text14i', ...c.body));
    row.append(el(
      'li',
      'key-features-card teaser document-col',
      el('div', 'cmp-teaser h-100', col),
    ));
  });
  // mobile: one card per view with a peek of the next, dots below (live slick behaviour);
  // on wider screens the list/track wrappers are display: contents (plain flex row)
  const cardsEls = [...row.children];
  const track = el('div', 'slick-track', ...cardsEls);
  const list = el('div', 'slick-list', track);
  row.append(list);
  if (cardsEls.length > 1) {
    const dots = el('ul', 'slick-dots');
    dots.setAttribute('role', 'tablist');
    const go = (i) => {
      track.style.transform = `translate3d(${-100 * i}%, 0, 0)`;
      [...dots.children].forEach((li, j) => li.classList.toggle('slick-active', i === j));
    };
    cardsEls.forEach((c, i) => {
      const b = el('button', '', String(i + 1));
      b.type = 'button';
      b.setAttribute('aria-label', `${i + 1} of ${cardsEls.length}`);
      b.addEventListener('click', () => go(i));
      dots.append(el('li', i ? '' : 'slick-active', b));
    });
    let x0 = null;
    track.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const cur = [...dots.children].findIndex((li) => li.classList.contains('slick-active'));
      const next = cur + (dx < 0 ? 1 : -1);
      if (Math.abs(dx) > 40) go(Math.max(0, Math.min(cardsEls.length - 1, next)));
      x0 = null;
    });
    row.append(dots);
  }
  section.append(el('div', 'container mob-pd0', el('ul', '', row)));
  block.replaceChildren(el('div', 'key-features', section));
}
