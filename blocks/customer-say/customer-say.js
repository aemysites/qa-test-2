/**
 * customer-say — testimonial slider (source `customer-say-box`; shared by the home and program
 * templates). Schema: stardust/eds-schema/index.json → sections[customer-say-box].
 * Decode tier: reconstructive.
 *
 * Authoring rows:
 *   heading row: <h2> (a <strong> tail renders bold, as the source <span>)
 *   testimonial rows: quote <p>(s) | meta <p> ("<strong>Product</strong> | date", optional) |
 *                     star count (optional, 1–5)
 *   CTA row (optional): <p><strong><a>…</a></strong></p>
 * Three cards per view (one below 768px); arrows loop; dots page through the views.
 * @ew-exempt <p> star count (testimonial cell 3) — rating metadata rendered as star icons
 */

const STAR = `${window.hlx?.codeBasePath || ''}/blocks/customer-say/star-fill.svg`;

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

function buildCard(row, i) {
  const cells = [...row.children];
  const [quoteCell, metaCell, rateCell] = cells;
  const top = el('div', 'customer-top');
  top.tabIndex = 0;
  top.setAttribute('aria-label', `Testimonial scroll area ${i + 1}`);
  const quotes = [...quoteCell.querySelectorAll('p, ul, ol')];
  if (quotes.length) top.append(...quotes);
  else top.append(...quoteCell.childNodes);
  const bottom = el('div', 'customer-bottom');
  if (metaCell) {
    const meta = metaCell.querySelector('p') || metaCell;
    bottom.append(el('div', 'loan-date', meta));
  }
  const n = rateCell ? parseInt(rateCell.textContent, 10) : 0;
  if (n > 0) {
    const stars = el('div', 'list-star');
    stars.setAttribute('role', 'img');
    stars.setAttribute('aria-label', `${n} out of 5 stars`);
    for (let s = 0; s < Math.min(n, 5); s += 1) {
      const img = el('img');
      img.src = STAR;
      img.alt = '';
      img.width = 13;
      img.height = 13;
      img.loading = 'lazy';
      stars.append(img);
    }
    bottom.append(stars);
  }
  const card = el('div', 'customer-say-details', top, bottom);
  const slide = el('div', 'customer-row', el('div', 'customer-col', card));
  slide.dataset.slide = i;
  return slide;
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
    const page = Math.min(dots.length - 1, Math.ceil(idx / pv));
    dots.forEach((li, j) => li.classList.toggle('slick-active', j === page));
  };
  prev.addEventListener('click', () => go(idx === 0 ? maxIdx() : idx - perView()));
  next.addEventListener('click', () => go(idx >= maxIdx() ? 0 : idx + perView()));
  dots.forEach((li, j) => li.querySelector('button').addEventListener('click', () => go(j * perView())));
  window.addEventListener('resize', () => go(idx));
  go(0);
}

export default function decorate(block) {
  const rows = [...block.children];
  let heading = null;
  let cta = null;
  const cardRows = [];
  rows.forEach((row) => {
    const h = row.querySelector('h1, h2, h3, h4, h5, h6');
    const ctaA = row.querySelector('strong > a, em > a, a.button');
    if (h && !heading) heading = h;
    else if (ctaA && row.children.length === 1 && !cta) cta = ctaA.closest('p') || ctaA;
    else if (row.textContent.trim()) cardRows.push(row);
  });

  const out = [];
  if (heading) {
    out.push(el('div', 'container', el('div', 'component-title text-center heading36', heading)));
  }
  const slides = cardRows.map(buildCard);
  const track = el('div', 'slick-track', ...slides);
  const prev = el('button', 'slick-prev slick-arrow', 'Previous');
  const next = el('button', 'slick-next slick-arrow', 'Next');
  [prev, next].forEach((b) => {
    b.type = 'button';
    b.setAttribute('aria-label', b.textContent);
  });
  const pages = Math.max(1, Math.ceil(slides.length / 3));
  const dots = Array.from({ length: pages }, (_, i) => {
    const b = el('button', '', String(i + 1));
    b.type = 'button';
    b.setAttribute('aria-label', `${i + 1} of ${pages}`);
    return el('li', i ? '' : 'slick-active', b);
  });
  const root = el(
    'div',
    'customer-say-slider slider-dots slider-arrows',
    prev,
    el('div', 'slick-list', track),
    next,
  );
  if (pages > 1) root.append(el('ul', 'slick-dots', ...dots));
  const inner = el('div', 'container mob-pd0 relative', root);
  if (cta) {
    const a = cta.querySelector ? (cta.querySelector('a') || cta) : cta;
    a.classList.remove('button', 'primary', 'secondary', 'accent');
    a.classList.add('btn-blue', 'btn-large');
    if (cta.classList) cta.classList.remove('button-wrapper');
    inner.append(el('div', 'say-btn', cta));
  }
  out.push(el('div', 'customer-say-inner', inner));
  block.replaceChildren(el('div', 'customer-say-box space-tb40', ...out));
  if (slides.length) slider(root, track, slides, dots, prev, next);
}
