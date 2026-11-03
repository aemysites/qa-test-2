/**
 * vertical-navigation — the source `csr-vertical-navigation` in-page rail (CSR campaign page):
 * a fixed left rail of round section icons (hover label), a scroll-spy active state, and on
 * mobile a "+" toggle that opens the list plus a column of section dots.
 * Decode tier: reconstructive (one item per row).
 *
 * Authoring: one row per item — `:icon-name:` paragraph | paragraph with an in-page link
 * (`#anchor` + label). Anchors resolve to the section ids the page blocks set (banner image →
 * introduction, csr-videos → videos, …); an anchor no block sets falls back to the band the
 * known block name renders (financial-insights → blogs).
 * @ew-exempt <p> item icon paragraph — `:icon:` glyph key, rendered through the icon font
 */

const ICON_KEY = /^:([\w-]+):$/;
const FALLBACK = { blogs: '.financial-insights-wrap', introduction: '.banner-cntr-new' };

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

function glyph(cell) {
  const p = cell && cell.querySelector('p');
  if (!p) return null;
  let span = p.querySelector('span.icon');
  if (span) {
    span.querySelectorAll('img').forEach((i) => i.remove());
    span.classList.remove('icon');
  } else {
    const m = p.textContent.trim().match(ICON_KEY); // HARNESS-ONLY: pipeline makes span.icon
    if (!m) return null;
    span = el('i', `icon-${m[1].toLowerCase()}`);
  }
  span.classList.add('vertical-navigation__icon');
  span.setAttribute('aria-hidden', 'true');
  return span;
}

function target(hash) {
  const id = hash.replace(/^#/, '');
  let t = document.getElementById(id);
  if (!t && FALLBACK[id]) {
    t = document.querySelector(FALLBACK[id]);
    if (t) t.id = id;
  }
  return t;
}

export default function decorate(block) {
  const items = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const a = row.querySelector('a');
    if (!a) return;
    const icon = glyph(cells.find((c) => !c.querySelector('a')));
    const label = el('span', 'vertical-navigation__label', ...a.childNodes);
    a.className = 'vertical-navigation__link';
    a.replaceChildren(el('span', 'vertical-navigation__icon-wrapper', ...(icon ? [icon] : [])), label);
    items.push(el('li', 'vertical-navigation__item', a));
  });
  const list = el('ul', 'vertical-navigation__list', ...items);
  const dots = el('div', 'vertical-navigation__dots');
  dots.setAttribute('aria-label', 'Section Indicators');
  items.forEach((li) => {
    const d = el('span', 'vertical-navigation__dot');
    d.setAttribute('role', 'button');
    d.setAttribute('aria-label', `dots ${li.textContent.trim()}`);
    d.addEventListener('click', () => li.querySelector('a').click());
    dots.append(d);
  });
  const toggle = el('button', 'vertical-navigation__toggle', el('span', 'vertical-navigation__toggle-icon', '+'));
  toggle.setAttribute('aria-label', 'Toggle Navigation');
  toggle.setAttribute('aria-expanded', 'false');
  const nav = el('nav', 'vertical-navigation', toggle, el('div', 'vertical-navigation__list-container', list), dots);
  nav.setAttribute('aria-label', 'Page Navigation');
  nav.dataset.showLabels = 'true';
  block.replaceChildren(el('div', 'csr-vertical-navigation list', nav));

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  const setActive = (i) => {
    items.forEach((li, j) => li.classList.toggle('is-active', i === j));
    [...dots.children].forEach((d, j) => d.classList.toggle('is-active', i === j));
  };
  setActive(0);
  items.forEach((li, i) => li.querySelector('a').addEventListener('click', (e) => {
    const t = target(li.querySelector('a').hash);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth' });
    setActive(i);
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
  const spy = () => {
    let cur = 0;
    items.forEach((li, i) => {
      const t = target(li.querySelector('a').hash);
      if (t && t.getBoundingClientRect().top < window.innerHeight / 2) cur = i;
    });
    setActive(cur);
  };
  window.addEventListener('scroll', spy, { passive: true });
}
