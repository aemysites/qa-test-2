/**
 * financial-insights — the source `financial-insights-wrap`: centred section title and a slider
 * of blog cards (thumbnail, glass overlay card with tag, linked title, date and a Share menu).
 *
 * Authoring rows:
 *   1. head — <h2> section title (<strong> for the bold half), optional; a heading authored as
 *      default content in the same section is reabsorbed instead (EW8)
 *   2..N. one row per card, any cell order: picture | tag paragraph | <h3> with the post link |
 *      date paragraph. Text before the heading is the tag, text after it is the date.
 *   Cards may also be authored flat in one cell (segmented on the heading; a picture opens
 *   the next card). Any number of cards: arrows + dots appear when they overflow the view.
 *
 * Share buttons (WhatsApp, Facebook, X, copy link) are generated chrome, not authored text.
 * @variants block class: home (home-page slider spacing); clip — card titles longer than 48
 *   characters show the first 48 and an ellipsis, the rest stays in the DOM visually hidden
 *   (source `financial-insight-title` + `remaining-content d-none`, campaign pages);
 *   top-flush — no top padding (source `space-tb40 padding-top-0`, CSR campaign page; CSS only);
 *   framed — arrows/dots positioned on the slider, 30px under it (home-loan blogs)
 */

const SOCIAL = [
  { name: 'WhatsApp', icon: 'whatsapp-colored.svg', url: (u) => `https://wa.me/?text=${u}` },
  { name: 'Facebook', icon: 'facebook-colored.svg', url: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  { name: 'X', icon: 'twitter-x.svg', url: (u) => `https://twitter.com/intent/tweet?url=${u}` },
];

const isHeading = (node) => /^H[1-6]$/.test(node.tagName);
const media = (node) => (node.matches('picture, img') ? node : node.querySelector('picture, img'));
const hasText = (node) => node.textContent.trim().length > 0;

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children.filter(Boolean));
  return node;
}

/** cell-level collector; expands the runtime's media-led <p> wrapper (#104) */
function cellNodes(cell) {
  const kids = [...cell.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('picture, img')
    && kids[0].children.length > 1) {
    return [...kids[0].children];
  }
  if (kids.length) return kids;
  if (hasText(cell)) {
    // HARNESS-ONLY fallback (EW5): DA always delivers a <p>; move the text node, never copy it
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

/** split authored nodes into a head and card groups (heading boundary, picture hint) */
function segment(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const head = [];
  const cards = [];
  const rowGroups = rows.map((row) => [...row.querySelectorAll(':scope > div')].flatMap(cellNodes));
  const cardTag = (() => {
    const counts = {};
    rowGroups.flat().filter(isHeading).forEach((h) => {
      counts[h.tagName] = (counts[h.tagName] || 0) + 1;
    });
    const tags = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || (a < b ? 1 : -1));
    return tags[0] || 'H3';
  })();

  let card = null;
  const open = () => {
    card = {
      picture: null, tag: [], heading: null, after: [], links: [],
    };
    cards.push(card);
  };
  rowGroups.forEach((nodes) => {
    const rowHasMedia = nodes.some((n) => media(n));
    const rowHasCardHeading = nodes.some((n) => n.tagName === cardTag);
    if (!rowHasMedia && !rowHasCardHeading && !card) {
      head.push(...nodes);
      return;
    }
    if (rowHasMedia || rowHasCardHeading) card = null;
    nodes.forEach((node) => {
      const pic = media(node);
      if (pic) {
        if (!card || card.picture || card.heading) open();
        card.picture = node;
        return;
      }
      if (node.tagName === cardTag) {
        if (!card || card.heading) open();
        card.heading = node;
        return;
      }
      if (!card) open();
      if (!card.heading) card.tag.push(node);
      else card.after.push(node);
    });
  });
  return { head, cards: cards.filter((c) => c.heading || c.picture) };
}

function shareMenu(href) {
  const bundle = el('div', 'share-bundle close-on-outside');
  const toggle = el('button', 'btn-white js-fi-share-btn', 'Share ');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  const glyph = el('span', 'icon-share');
  glyph.setAttribute('aria-hidden', 'true');
  toggle.append(glyph);
  const menu = el('div', 'share-bundle-menu');
  const url = encodeURIComponent(href || window.location.href);
  SOCIAL.forEach((s) => {
    const a = el('a', 'social-btn');
    a.href = s.url(url);
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', `Share on ${s.name}`);
    const img = document.createElement('img');
    img.src = `${window.hlx?.codeBasePath || ''}/blocks/financial-insights/${s.icon}`;
    img.alt = '';
    img.loading = 'lazy';
    img.width = 22;
    img.height = 22;
    a.append(img);
    menu.append(a);
  });
  const copy = el('button', 'social-btn jsCopyLink');
  copy.type = 'button';
  const copyGlyph = el('span', 'icon-copy icon');
  copyGlyph.setAttribute('aria-hidden', 'true');
  copy.append(copyGlyph, el('span', 'text-copy', 'Copy'));
  copy.addEventListener('click', () => {
    navigator.clipboard?.writeText(href || window.location.href);
  });
  menu.append(copy);
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const on = !menu.classList.contains('active');
    document.querySelectorAll('.financial-insights .share-bundle-menu.active')
      .forEach((m) => m.classList.remove('active'));
    menu.classList.toggle('active', on);
    toggle.setAttribute('aria-expanded', on ? 'true' : 'false');
  });
  bundle.append(toggle, menu);
  return bundle;
}

const CLIP = 48;

/** split the title's text (moved nodes, never copies) at CLIP characters */
function clipTitle(heading) {
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  let seen = 0;
  let node = walker.nextNode();
  while (node && seen + node.data.length <= CLIP) {
    seen += node.data.length;
    node = walker.nextNode();
  }
  if (!node || !node.data.slice(CLIP - seen).trim()) return;
  const rest = node.splitText(CLIP - seen);
  const tail = [rest];
  let next = rest.nextSibling;
  while (next) {
    tail.push(next);
    next = next.nextSibling;
  }
  const hidden = el('span', 'remaining-content d-none');
  rest.before(hidden);
  hidden.append(...tail);
  const dots = el('span', 'clip-dots', ' ...');
  dots.setAttribute('aria-hidden', 'true');
  hidden.after(dots);
}

function buildSlide(card) {
  const slide = el('div', 'financial-insights-slider');
  const item = el('div', 'financial-insights-item');
  const link = card.heading && card.heading.querySelector('a');
  const href = link ? link.href : '';

  const thumb = el('div', 'fi-thumbnail-img');
  if (card.picture) thumb.append(card.picture);

  const top = el('div', 'fi-card-top');
  top.append(el('div', 'fi-insight-tag', ...card.tag));
  if (!card.tag.length) top.firstChild.classList.add('is-empty');
  const arrow = el('span', 'icon-arrow-up-right arrow-icon');
  arrow.setAttribute('aria-hidden', 'true');
  top.append(arrow);

  const mid = el(href ? 'a' : 'div', 'fi-card-mid');
  if (href) {
    mid.href = href;
    // EW6: the indexed heading survives inside the card anchor
    link.replaceWith(...link.childNodes);
  }
  if (card.heading) mid.append(card.heading);

  const dates = card.after.filter((n) => !n.querySelector('a'));
  const extras = card.after.filter((n) => n.querySelector('a'));
  const bottom = el('div', 'fi-card-bottom', el('div', 'time-stamp', ...dates), shareMenu(href));

  const overlay = el('div', 'fi-overlay-card', top, mid, ...extras, bottom);
  item.append(thumb, overlay);
  slide.append(item);
  return slide;
}

function perView() {
  if (window.matchMedia('(width >= 992px)').matches) return 3;
  if (window.matchMedia('(width >= 768px)').matches) return 2;
  return 1;
}

function initSlider(slider, list, track, slides) {
  let index = 0;
  const prev = el('button', 'slick-prev slick-arrow', 'Previous');
  const next = el('button', 'slick-next slick-arrow', 'Next');
  prev.type = 'button';
  next.type = 'button';
  prev.setAttribute('aria-label', 'Previous');
  next.setAttribute('aria-label', 'Next');
  const dots = el('ul', 'slick-dots');
  dots.setAttribute('role', 'tablist');
  slider.prepend(prev);
  slider.append(next, dots);

  const render = () => {
    const view = perView();
    const pages = Math.max(1, slides.length - view + 1);
    const overflow = slides.length > view;
    index = Math.min(index, pages - 1);
    slider.classList.toggle('slider-dots', overflow);
    slider.classList.toggle('is-static', !overflow);
    prev.hidden = !overflow;
    next.hidden = !overflow;
    prev.classList.toggle('slick-disabled', index === 0);
    next.classList.toggle('slick-disabled', index >= pages - 1);
    const cs = getComputedStyle(list);
    const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const width = (list.clientWidth - pad) / view;
    slides.forEach((s) => { s.style.width = `${width}px`; });
    track.style.transform = overflow ? `translate3d(${-index * width}px, 0, 0)` : '';
    dots.replaceChildren(...(overflow ? Array.from({ length: pages }, (_, i) => {
      const b = el('button', '', String(i + 1));
      b.type = 'button';
      b.setAttribute('aria-label', `${i + 1} of ${pages}`);
      b.addEventListener('click', () => { index = i; render(); });
      const li = el('li', i === index ? 'slick-active' : '', b);
      li.setAttribute('role', 'presentation');
      return li;
    }) : []));
  };
  prev.addEventListener('click', () => { index = Math.max(0, index - 1); render(); });
  next.addEventListener('click', () => { index += 1; render(); });

  let startX = null;
  list.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  list.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) < 40) return;
    index = Math.max(0, index + (dx < 0 ? 1 : -1));
    render();
  });

  if (window.ResizeObserver) new ResizeObserver(() => render()).observe(list);
  render();
}

export default function decorate(block) {
  const { head, cards } = segment(block);
  let headNodes = head;
  if (!headNodes.some(isHeading)) {
    // EW8: reabsorb a section heading authored as default content
    const wrapper = block.closest('.section')?.querySelector('.default-content-wrapper');
    if (wrapper && wrapper.querySelector('h1, h2, h3')) {
      headNodes = [...wrapper.children, ...headNodes];
      wrapper.remove();
    }
  }

  const section = el('section', 'financial-insights-wrap space-tb40');
  const inner = el('div', 'financial-inner');
  if (headNodes.length) inner.append(el('div', 'container fi-head text-center', ...headNodes));

  if (block.classList.contains('clip')) cards.forEach((c) => c.heading && clipTitle(c.heading));
  const track = el('div', 'slick-track', ...cards.map(buildSlide));
  const list = el('div', 'slick-list', track);
  const slider = el('div', 'js-fi-slider financial-insights-slider-dots slider-arrows', list);
  inner.append(el('div', 'container mob-px-0', slider));
  section.append(inner);
  block.replaceChildren(section);

  document.addEventListener('click', (e) => {
    if (e.target.closest('.share-bundle')) return;
    block.querySelectorAll('.share-bundle-menu.active').forEach((m) => m.classList.remove('active'));
  });

  if (cards.length) initSlider(slider, list, track, [...track.children]);
}
