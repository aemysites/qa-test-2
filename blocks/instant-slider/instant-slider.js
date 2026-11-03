/**
 * instant-slider — "Explore … Available in Your City" band (source `instant-slider-box`,
 * `jsHomeLoanCitySlider`): centred <h2> over a slider of city cards (icon + linked title),
 * three per view with arrows and dots on desktop; a stacked list ≤767px (as live).
 * Schema: stardust/eds-schema/personal-loan.json → sections[instant-slider-box].
 * Decode tier: reconstructive (one row per card).
 *
 * Authoring rows: 1. <h2> (<strong> tail) · 2..N. <h3><a href>Personal Loan in …</a></h3>, or an
 *   unlinked <h3> + a link <p> ("Know More" with arrow — the home-loan city card).
 * The city icon, arrows and dots are generated chrome.
 */

const BASE = `${window.hlx?.codeBasePath || ''}/blocks/instant-slider`;
const START = 1; // the source slider rests on its second card (captured slick state)

const AUTOPLAY_MS = 3000;

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
  b.setAttribute('aria-label', label);
  return b;
}

const perView = () => {
  if (window.matchMedia('(min-width: 992px)').matches) return 3;
  if (window.matchMedia('(min-width: 768px)').matches) return 2;
  return 1;
};

function slider(box, slides) {
  const track = el('div', 'slick-track', ...slides);
  const list = el('div', 'slick-list draggable', track);
  const prev = button('slick-prev slick-arrow', 'Previous');
  const next = button('slick-next slick-arrow', 'Next');
  const dots = el('ul', 'slick-dots');
  dots.setAttribute('role', 'tablist');
  let index = Math.min(START, Math.max(slides.length - 1, 0));
  const layout = () => {
    const w = list.clientWidth / perView();
    slides.forEach((s, i) => {
      s.style.width = `${w}px`;
      const show = i >= index && i < index + perView();
      s.classList.toggle('slick-active', show);
      s.classList.toggle('slick-current', i === index);
      s.setAttribute('aria-hidden', String(!show));
    });
    track.style.width = `${w * slides.length}px`;
    track.style.transform = `translate3d(${-w * index}px, 0px, 0px)`;
    [...dots.children].forEach((li, i) => li.classList.toggle('slick-active', i === index));
  };
  const go = (i) => {
    index = (i + slides.length) % slides.length;
    layout();
  };
  slides.forEach((s, i) => {
    s.classList.add('slick-slide');
    const b = button('', String(i + 1));
    b.setAttribute('role', 'tab');
    b.addEventListener('click', () => go(i));
    dots.append(el('li', '', b));
  });
  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  box.classList.add('slick-initialized', 'slick-slider', 'slick-dotted');
  box.append(prev, list, next, dots);
  if (window.ResizeObserver) new ResizeObserver(layout).observe(list);
  requestAnimationFrame(layout);
  // the source slider auto-advances (observed live: a later slide in view after load)
  let paused = false;
  box.addEventListener('mouseenter', () => { paused = true; });
  box.addEventListener('mouseleave', () => { paused = false; });
  setInterval(() => {
    const stacked = window.matchMedia('(width <= 767px)').matches;
    if (!paused && !stacked && !document.hidden) go(index + 1);
  }, AUTOPLAY_MS);
}

export default function decorate(block) {
  const heading = block.querySelector('h2');
  const cards = [...block.querySelectorAll('h3')].map((h3, i) => {
    h3.classList.add('heading20');
    if (i) h3.classList.add('custom-city-tag');
    const a = h3.querySelector('a');
    if (a) {
      a.classList.add('cmp-title__link', 'city-title-link');
      a.append(el('span', '', ...a.childNodes));
    } else h3.append(el('span', '', ...h3.childNodes));
    const linkP = !a ? [...(h3.parentElement?.querySelectorAll(':scope > p') || [])]
      .find((p) => p.querySelector('a')) : null;
    if (linkP) {
      const more = linkP.querySelector('a');
      more.className = 'cmp-title__link btn-links link-with-arrow';
      const arrow = el('span', 'icon-arrow-right arros');
      arrow.setAttribute('aria-hidden', 'true');
      more.append(arrow);
    }
    const icon = el('img');
    icon.src = `${BASE}/city-col.svg`;
    icon.alt = '';
    icon.loading = 'lazy';
    return el('div', 'instant-row', el('div', 'cmp-title instant-col', el(
      'div',
      'bg-div instant-card padding-without-btn', // live: also on the "Know More" city cards
      el('div', 'loan-instants-in', el('div', 'city-left-img', icon), el('div', 'city-right-content', h3, linkP)),
    )));
  });
  const box = el('div', 'cmp-container instant-slider flex-slider slider-dots slider-arrows jsHomeLoanCitySlider');
  slider(box, cards);
  if (heading) heading.classList.add('text-center', 'heading36');
  block.replaceChildren(el('div', 'city-cards', el(
    'section',
    'instant-slider-box space-tb40',
    heading ? el('div', 'tops-heads', el('div', 'cmp-container', el('div', 'component-title title', el('div', 'container', heading)))) : null,
    el('div', 'container mob-pd0', box),
  )));
}
