/**
 * banner — the inner-page hero (source `banner-cntr-new inner-with-star inner-banner-new`):
 * a rounded art panel with the page <h1> and CTA buttons over it.
 * Schema: stardust/eds-schema/check-credit-score.json → sections[banner-cntr-new].
 * Decode tier: template-slotted (node-slotting; the authored nodes move into the source DOM).
 *
 * Authoring (one row, cells in any order — classified by content):
 *   - desktop art cell: 1st picture ≥1200px, optional 2nd picture 768–1199px
 *   - mobile art cell: one picture (≤767px); absent → the desktop art is used
 *   - text cell: <h1> (<strong> for the semibold tail), optional lede <p>s,
 *     CTA <p>s — <strong><a> = blue primary, <em><a> = white secondary
 * The first cell holding pictures is the desktop cell, the next one the mobile cell.
 * @variants block class: app — the app-campaign hero (source `home-loan-overview
 *   homepage-banner homeloans-contents`): text cell may add a <ul> of ratings
 *   (`<strong>4.6 :star:</strong> 60.9K + reviews` per item) and a paragraph of linked
 *   store-badge images (`<a><img></a>` pairs), rendered as the source ratings row.
 *   image — the art-only hero (source `banner-no-text-content`, CSR campaign page): no visible
 *   captions; an authored <h1> stays in the DOM visually hidden (the source h1 is display:none)
 *   and the band gets the source `banner-pdt28` top spacing and the `introduction` anchor id.
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

function paintCta(a) {
  const secondary = a.classList.contains('secondary') || !!a.closest('em');
  a.classList.remove('button', 'primary', 'secondary', 'accent');
  a.classList.add(...(secondary ? ['btn-link', 'btn-big'] : ['btn-blue', 'btn-large']), 'cta-gap');
  const p = a.closest('p');
  if (p) p.classList.remove('button-wrapper');
}

function ratingsRow(block) {
  const ul = block.querySelector('ul');
  const stores = [...block.querySelectorAll('p')].filter((p) => p.querySelector('a img, a picture'));
  if (!ul && !stores.length) return null;
  let row = el('div', 'shops-ratings-row');
  if (ul) {
    // the authored <ul>/<li>/<strong> are kept (moved, restyled as the source divs)
    ul.className = 'shops-ratings-row';
    [...ul.children].forEach((li) => {
      li.className = 'shops-cols';
      const strong = li.querySelector('strong');
      if (!strong) return;
      strong.classList.add('shops-ratings');
      strong.querySelectorAll('span.icon').forEach((g) => {
        g.querySelectorAll('img').forEach((i) => i.remove());
        g.classList.remove('icon');
        g.setAttribute('aria-hidden', 'true');
      });
      // HARNESS-ONLY: the pipeline makes span.icon server-side from `:name:`
      [...strong.childNodes].filter((n) => n.nodeType === 3 && /:[\w-]+:/.test(n.data))
        .forEach((n) => {
          const [before, name, after] = n.data.split(/:([\w-]+):/);
          const glyph = el('span', `icon-${name.toLowerCase()}`);
          glyph.setAttribute('aria-hidden', 'true');
          n.replaceWith(before, glyph, after);
        });
      const rest = [...li.childNodes].filter((n) => n !== strong);
      li.append(el('span', 'shops-rating-review', ...rest));
    });
    row = ul;
  }
  const box = el('div', 'banner-ratings-lists', row);
  if (stores.length) {
    const store = el('div', 'steps-downloads-store');
    stores.forEach((p) => store.append(...p.childNodes));
    stores.forEach((p) => p.remove());
    box.append(store);
  }
  return box;
}

const pics = (cell) => [...cell.querySelectorAll('picture, img')]
  .filter((n) => n.tagName === 'PICTURE' || !n.closest('picture'));

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  if (!cells.length) return;
  const mediaCells = cells.filter((c) => pics(c).length);
  const deskPics = mediaCells[0] ? pics(mediaCells[0]) : [];
  const mobPic = mediaCells[1] ? pics(mediaCells[1])[0] : null;
  const app = block.classList.contains('app');
  const artOnly = block.classList.contains('image');
  const ratings = app ? ratingsRow(block) : null;
  const heading = block.querySelector('h1, h2');
  const ps = [...block.querySelectorAll('p')].filter((p) => !p.querySelector('picture, img'));
  const ctas = ps.filter((p) => p.querySelector('a'));
  const ledes = ps.filter((p) => !p.querySelector('a') && p.textContent.trim());

  const captions = el('div', 'banner-captions');
  if (heading && artOnly) {
    captions.append(el('div', 'sr-only', heading));
  } else if (heading) {
    captions.append(el('div', 'main-title', el('div', 'main-title-inner heading-h1', heading)));
  }
  if (ledes.length) captions.append(el('div', 'title-info', ...ledes));
  if (ratings) {
    captions.append(el('div', 'banner-list-news', el('div', 'banner-list-ul')), ratings);
  }
  if (mobPic) captions.append(el('div', 'banner-img mob-banners', mobPic));
  captions.append(el('div', 'banner-list-info', el('div', 'row-flex')));
  const ctaBox = el('div', 'dsk-banner-cta btn-holder');
  ctas.forEach((p) => {
    p.querySelectorAll('a').forEach(paintCta);
    ctaBox.append(p);
  });
  captions.append(ctaBox);

  const wrap = el(
    'div',
    `banner-wrap banner-new-full banner-full-dark-text${app ? ' whiteDot homeloans-contents' : ''} banner-${artOnly ? 'no' : 'has'}-text-content`,
    el('div', 'banner-text-new', captions),
  );
  if (deskPics.length) {
    const dsk = el('div', `banner-img dsk-banners${mobPic ? '' : ' no-mob'}`);
    deskPics.forEach((pic, i) => dsk.append(el('div', i ? 'pic-md' : 'pic-xl', pic)));
    if (deskPics.length === 1) dsk.firstChild.className = 'pic-all';
    wrap.append(dsk);
  }
  const section = el(
    'section',
    `banner-cntr-new inner-with-star ${app ? 'home-loan-overview pd-t0i' : 'inner-banner-new'}`,
    el('div', 'custom-container', el(
      'article',
      'banner-new-box',
      el('div', `banner-slider-new${app ? ' homepage-banner' : ''}`, el('div', 'banner-item-new', wrap)),
    )),
  );
  if (artOnly) {
    section.classList.add('banner-pdt28');
    section.id = 'introduction';
  }
  block.replaceChildren(section);
}
