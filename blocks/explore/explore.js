/**
 * explore — "Explore our products" card slider (source `explore-box`). Schema:
 * stardust/eds-schema/index.json → sections[explore-box]. Decode tier: reconstructive.
 *
 * Authoring rows:
 *   1     section head: <h1> (or <h2>) — a <strong> tail renders semibold
 *   2..N  card: icon picture | <h5> title (optionally linked), description <p>, then one <p>
 *         per action — plain link = blue arrow link, <em> link = green arrow link, a link-free
 *         <p> = inactive label
 * Cards are paired two per slide column; three columns per view (one below 768px).
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

function buildCard(row) {
  const media = row.querySelector('picture, img');
  const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
  const ps = [...row.querySelectorAll('p')].filter((p) => !p.querySelector('picture, img'));
  const all = [...row.querySelectorAll('h1, h2, h3, h4, h5, h6, p')];
  const after = ps.filter((p) => all.indexOf(p) > all.indexOf(heading));
  const desc = after.find((p) => !p.querySelector('a'));
  const actions = after.filter((p) => p !== desc);

  const head = el('div', 'explore-heading');
  if (media) head.append(el('div', 'img-icons', media));
  if (heading) head.append(el('div', 'heading20', heading));
  const card = el('div', 'explore-details', head);
  if (desc) card.append(el('div', 'explore-desc', desc));
  const list = el('div', 'btn-lists');
  actions.forEach((p) => {
    const a = p.querySelector('a');
    p.classList.remove('button-wrapper');
    if (a) {
      a.classList.remove('button', 'primary', 'secondary', 'accent');
      a.classList.add('btn-links');
      if (a.closest('em')) a.classList.add('text-dark-green');
      const arrow = el('span', 'icon-arrow-right arros');
      arrow.setAttribute('aria-hidden', 'true');
      a.append(arrow);
      list.append(el('div', 'btn-link-item', p));
    } else {
      list.append(el('div', 'btn-link-item btn-links btn-links-text', p));
    }
  });
  card.append(list);
  return card;
}

function slider(root, track, slides, dots, prev, next) {
  let idx = 0;
  const perView = () => {
    const w = slides[0].getBoundingClientRect().width || 1;
    return Math.max(1, Math.round(root.querySelector('.slick-list').clientWidth / w));
  };
  const maxIdx = () => Math.max(0, slides.length - perView());
  const go = (i) => {
    const m = maxIdx();
    idx = Math.max(0, Math.min(i, m));
    const w = slides[0].getBoundingClientRect().width;
    track.style.transform = `translate3d(${-w * idx}px,0,0)`;
    const pv = perView();
    slides.forEach((s, j) => {
      const vis = j >= idx && j < idx + pv;
      s.classList.toggle('is-active', vis);
      if (vis) s.removeAttribute('aria-hidden');
      else s.setAttribute('aria-hidden', 'true');
    });
    const page = Math.min(dots.length - 1, idx);
    dots.forEach((li, j) => li.classList.toggle('slick-active', j === page));
    prev.classList.toggle('slick-disabled', idx === 0);
    next.classList.toggle('slick-disabled', idx === m);
  };
  prev.addEventListener('click', () => go(idx - 1));
  next.addEventListener('click', () => go(idx + 1));
  dots.forEach((li, j) => li.querySelector('button').addEventListener('click', () => go(j)));
  window.addEventListener('resize', () => go(idx));
  go(0);
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const cardRows = rows.filter((r) => r.querySelector('picture, img') || r.querySelector('h5, h4, h3'));
  const headRows = rows.filter((r) => !cardRows.includes(r));
  const title = el('div', 'main-title');
  headRows.forEach((r) => {
    [...r.querySelectorAll('h1, h2, h3, h4, h5, h6, p')].forEach((n) => title.append(n));
  });

  const cards = cardRows.map(buildCard);
  const slides = [];
  for (let i = 0; i < cards.length; i += 2) {
    const col = el('div', 'explore-col', ...cards.slice(i, i + 2));
    slides.push(el('div', 'explore-our-product-container', col));
  }
  const track = el('div', 'slick-track', ...slides);
  const prev = el('button', 'slick-prev slick-arrow', 'Previous');
  const next = el('button', 'slick-next slick-arrow', 'Next');
  [prev, next].forEach((b) => {
    b.type = 'button';
    b.setAttribute('aria-label', b.textContent);
  });
  const pages = Math.max(1, slides.length - 2);
  const dots = Array.from({ length: pages }, (_, i) => {
    const b = el('button', '', String(i + 1));
    b.type = 'button';
    b.setAttribute('aria-label', `${i + 1} of ${pages}`);
    return el('li', '', b);
  });
  const root = el(
    'div',
    'explore-product-slider slider-arrows slider-dots',
    prev,
    el('div', 'slick-list', track),
    next,
    el('ul', 'slick-dots', ...dots),
  );
  const box = el(
    'div',
    'explore-box space-tb40',
    el('div', 'container', el('div', 'component-title tops-heads', title)),
    el('div', 'container relative', el('div', 'explore-inner', root)),
  );
  block.replaceChildren(box);
  if (slides.length) slider(root, track, slides, dots, prev, next);
}
