/**
 * what-personal — the source `what-personal-box` benefits grid: a centred head (<h2> + intro
 * paragraphs) over glass cards (icon beside the <h3> title, description below); two cards
 * per row, centred.
 * Schema: stardust/eds-schema/check-credit-score.json → sections[what-personal-box].
 * Decode tier: reconstructive (one card per <h3>).
 *
 * Authoring:
 *   1. head — <h2> (<strong> for the bold tail) + intro <p>s (optional; a heading authored
 *      as default content just before the block is reabsorbed)
 *   2..N. one row per card — `:icon-name:` paragraph (optional) | <h3> title | <p> text.
 *      Cards may also be authored flat in one cell (segmented on the <h3>).
 * Variant `slider` (program pages, source `multipurpose-slider`): icon above the title, four
 * cards per view with arrows + dots (slick-like), stacked ≤767px as live.
 * Variant `stack` (home-loan repayment options): one card per row ≤767px.
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

const perView = () => {
  if (window.matchMedia('(min-width: 1200px)').matches) return 4;
  if (window.matchMedia('(min-width: 992px)').matches) return 3;
  return 2;
};

function slider(box, slides) {
  const track = el('div', 'slick-track', ...slides);
  const list = el('div', 'slick-list draggable', track);
  const btn = (cls, label) => {
    const b = el('button', cls);
    b.type = 'button';
    b.textContent = label;
    b.setAttribute('aria-label', label);
    return b;
  };
  const prev = btn('slick-prev slick-arrow', 'Previous');
  const next = btn('slick-next slick-arrow', 'Next');
  const dots = el('ul', 'slick-dots');
  let index = 0;
  const pages = () => Math.max(1, slides.length - perView() + 1);
  const layout = () => {
    const w = list.clientWidth / perView();
    index = Math.min(index, pages() - 1);
    slides.forEach((s, i) => {
      s.style.width = `${w}px`;
      s.classList.toggle('slick-active', i >= index && i < index + perView());
      s.classList.toggle('slick-current', i === index);
    });
    track.style.width = `${w * slides.length}px`;
    track.style.transform = `translate3d(${-w * index}px, 0px, 0px)`;
    prev.classList.toggle('slick-disabled', index === 0);
    next.classList.toggle('slick-disabled', index >= pages() - 1);
    dots.replaceChildren(...Array.from({ length: pages() }, (_, i) => {
      const b = btn('', String(i + 1));
      b.addEventListener('click', () => { index = i; layout(); });
      return el('li', i === index ? 'slick-active' : '', b);
    }));
  };
  prev.addEventListener('click', () => { index = Math.max(0, index - 1); layout(); });
  next.addEventListener('click', () => { index = Math.min(pages() - 1, index + 1); layout(); });
  slides.forEach((s) => s.classList.add('slick-slide'));
  box.classList.add('slick-initialized', 'slick-slider', 'slick-dotted');
  box.append(prev, list, next, dots);
  if (window.ResizeObserver) new ResizeObserver(layout).observe(list);
  requestAnimationFrame(layout);
}

export default function decorate(block) {
  const { head, cards } = segment([...reabsorbHead(block), ...collectNodes(block)]);
  const section = el('section', 'what-personal-box space-tb40');
  if (head.length) {
    const h2 = head.find((n) => n.tagName === 'H2');
    const top = el('div', 'cmp-container tops-heads');
    if (h2) top.append(el('div', 'component-title title', el('div', 'container heading36 text-center', h2)));
    const rest = head.filter((n) => n !== h2);
    if (rest.length) top.append(el('div', 'rte title', el('div', 'tc-rte', ...rest)));
    section.append(el('div', 'container', el('ul', '', top)));
  }
  if (block.classList.contains('slider')) {
    const slides = cards.map((c) => {
      const top = el('div', 'instant-top');
      if (c.icon) top.append(glyphOf(c.icon));
      c.title.classList.add('heading20', 'key-feature-card-title');
      const desc = el('div', 'cmp-teaser__description text14i', ...c.body);
      return el(
        'li',
        'key-features-card teaser instant-per-row',
        el('div', 'cmp-teaser instant-per-col', el('div', 'instant-per-div bg-div', top, c.title, desc)),
      );
    });
    const box = el('div', 'cmp-container instant-personal-slider multipurpose-slider flex-slider slider-arrows jsMultiPurposeSlider');
    slider(box, slides);
    section.append(el('div', 'container mob-pd0', el('ul', '', box)));
    block.replaceChildren(el('div', 'key-features', section));
    return;
  }
  const row = el('div', 'cmp-container instant-personal-slider take-per-slider flex-slider slider-arrows slider-dots');
  cards.forEach((c) => {
    const top = el('div', 'instant-top insta-top-one');
    if (c.icon) top.append(glyphOf(c.icon));
    top.append(c.title);
    const desc = el('div', 'cmp-teaser__description text14i', ...c.body);
    row.append(el(
      'li',
      'key-features-card teaser instant-per-row',
      el('div', 'cmp-teaser instant-per-col', el('div', 'instant-per-div bg-div', top, desc)),
    ));
  });
  section.append(el('div', 'container mob-pd0', el('ul', '', row)));
  block.replaceChildren(el('div', 'key-features', section));
}
