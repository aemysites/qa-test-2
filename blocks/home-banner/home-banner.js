/**
 * home-banner — the home hero carousel (source `banner-cntr-new` + the smart-search bar that
 * overlaps its foot, `track-my-application-cls`). Schema: stardust/eds-schema/index.json →
 * sections[banner-cntr-new]. Decode tier: reconstructive (one slide per row).
 *
 * Authoring rows:
 *   1..N  slide: desktop picture(s) — 1st ≥1200px, optional 2nd 768–1199px | mobile picture |
 *         text cell (title <p>, info <p> — bold
 *         info as <strong>, CTA <p> — <strong><a> blue, <em><a> yellow). Text cell optional:
 *         an image-only slide keeps only its CTA.
 *   last  (no picture) smart search: headline <p><strong>…</strong></p> | placeholder <p>
 *
 * Behaviour: autoplay rotation every 5 s (captureState restoreAtDelivery), dots, pause on
 * hover; reduced motion disables autoplay. The search bar opens the header Smart Search panel.
 * @ew-exempt <p> search placeholder (last row, 2nd paragraph) — rendered as the input placeholder
 */

const AUTOPLAY = 5000;
const ICONS = `${window.hlx?.codeBasePath || ''}/blocks/home-banner`;

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

function paintCta(a, classes) {
  a.classList.remove('button', 'primary', 'secondary', 'accent');
  a.classList.add(...classes);
  const p = a.closest('p');
  if (p) p.classList.remove('button-wrapper');
}

function buildSlide(row) {
  const cells = [...row.children];
  const media = cells.map((c) => c.querySelector('picture, img'));
  const deskPics = [...cells[0].querySelectorAll('picture, img')]
    .filter((n) => n.tagName === 'PICTURE' || !n.closest('picture'));
  const mob = media[1] || null;
  const textCell = cells.find((c, i) => i > 1 || (!media[i] && c.textContent.trim()));
  const ps = textCell ? [...textCell.querySelectorAll('p')] : [];
  const ctaP = ps.find((p) => p.querySelector('a'));
  const texts = ps.filter((p) => !p.querySelector('a') && !p.querySelector('picture, img'));
  const hasText = texts.length > 0;

  const captions = el('div', 'banner-captions');
  if (texts[0]) captions.append(el('div', 'main-title heading-h1', texts[0]));
  if (texts[1]) captions.append(el('div', 'title-info', ...texts.slice(1)));
  if (mob) captions.append(el('div', 'banner-img mob-banners', mob));
  const ctaBox = el('div', 'dsk-banner-cta btn-holder');
  if (ctaP) {
    const a = ctaP.querySelector('a');
    const yellow = !!a.closest('em');
    paintCta(a, ['btn-blue', 'btn-large', 'cta-gap', ...(yellow ? ['btn-yellow'] : [])]);
    ctaBox.append(ctaP);
  }
  captions.append(ctaBox);
  const wrap = el(
    'div',
    `banner-wrap banner-new-full ${hasText ? 'banner-has-text-content' : 'banner-no-text-content'}`,
    el('div', 'banner-text-new', captions),
  );
  if (deskPics.length) {
    const dsk = el('div', 'banner-img dsk-banners');
    deskPics.forEach((pic, i) => dsk.append(el('div', i ? 'pic-md' : 'pic-xl', pic)));
    if (deskPics.length === 1) dsk.firstChild.className = 'pic-all';
    wrap.append(dsk);
  }
  return el('div', 'banner-item-new', wrap);
}

function buildSearch(row) {
  const ps = [...row.querySelectorAll('p')];
  const head = ps[0];
  const hint = ps[1];
  const img = (cls, file) => {
    const i = el('img', cls);
    i.src = `${ICONS}/${file}.svg`;
    i.alt = '';
    return i;
  };
  const input = el('input', 'sf-bs-input');
  input.type = 'text';
  input.placeholder = hint ? hint.textContent.trim() : '';
  input.setAttribute('aria-label', 'Ask about loans.');
  input.readOnly = true;
  const lang = el('button', 'sf-bs-lang-btn', el('span', '', 'EN'), img('sf-bs-lang-chevron', 'lang-chevron'));
  lang.type = 'button';
  lang.setAttribute('aria-label', 'Select language');
  const badge = el(
    'div',
    'sf-bs-search-badge',
    img('sf-bs-search-disc', 'search-disc'),
    img('sf-bs-search-glyph', 'search-glyph'),
    img('sf-bs-search-star', 'search-star'),
  );
  const bar = el(
    'div',
    'sf-bs-input-bar',
    badge,
    input,
    el('div', 'sf-bs-input-actions', el('div', 'sf-bs-lang-picker-wrap', lang)),
  );
  bar.addEventListener('click', () => {
    const trigger = document.querySelector('header .sf-hs-bar');
    if (trigger) trigger.click();
  });
  const shell = el('div', 'sf-bs-shell');
  if (head) shell.append(el('div', 'sf-bs-headline', head));
  shell.append(el('div', 'sf-bs-search-section', bar));
  return el(
    'div',
    'track-my-application-cls',
    el(
      'div',
      'custom-container homepage-smart-search-container',
      el('div', 'smart-search-banner', el('div', 'sf-bs-container', shell)),
    ),
  );
}

function carousel(root, track, slides, dots) {
  let idx = 0;
  const go = (i) => {
    idx = (i + slides.length) % slides.length;
    track.style.transform = `translate3d(${-100 * idx}%,0,0)`;
    slides.forEach((s, j) => {
      s.classList.toggle('is-active', j === idx);
      if (j === idx) s.removeAttribute('aria-hidden');
      else s.setAttribute('aria-hidden', 'true');
    });
    dots.forEach((li, j) => li.classList.toggle('slick-active', j === idx));
  };
  dots.forEach((li, j) => li.querySelector('button').addEventListener('click', () => go(j)));
  go(0);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (slides.length > 1 && !reduce) {
    let t = setInterval(() => go(idx + 1), AUTOPLAY);
    root.addEventListener('mouseenter', () => clearInterval(t));
    root.addEventListener('mouseleave', () => {
      clearInterval(t);
      t = setInterval(() => go(idx + 1), AUTOPLAY);
    });
  }
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const slideRows = rows.filter((r) => r.querySelector('picture, img'));
  const searchRow = rows.find((r) => !r.querySelector('picture, img') && r.textContent.trim());

  const track = el('div', 'slick-track');
  const slides = slideRows.map(buildSlide);
  track.append(...slides);
  slides.slice(0, 1).forEach((s) => s.querySelectorAll('img').forEach((i) => {
    i.loading = 'eager';
  }));
  const dots = slides.map((s, i) => {
    const b = el('button', '', String(i + 1));
    b.type = 'button';
    b.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
    return el('li', '', b);
  });
  const slider = el('div', 'banner-slider-new slider-dots', el('div', 'slick-list', track));
  if (dots.length > 1) slider.append(el('ul', 'slick-dots', ...dots));
  const section = el(
    'div',
    'banner-cntr-new',
    el('div', 'custom-container', el('article', 'banner-new-box', slider)),
  );
  const out = [section];
  if (searchRow) out.push(buildSearch(searchRow));
  block.replaceChildren(...out);
  carousel(slider, track, slides, dots);
}
