/**
 * about-more-products — "Personal Loans for Different Customer Profiles" band (source
 * `about-more-products` / `personal-loan-cntr`): centred <h2> over product cards (art with a
 * glass overlay holding the title and an Apply Now link); three per view with dots on
 * desktop, a stacked list ≤767px (as live).
 * Schema: stardust/eds-schema/personal-loan.json → sections[personal-loan-cntr].
 * Decode tier: reconstructive (one row per card).
 *
 * Authoring rows: 1. <h2> (<strong> tail) · 2..N. desktop picture | mobile picture |
 * <h3> title, optional description <p>s, <p><a>Apply Now</a></p>.
 * Variant `four` (home-loan source): four per view from 1200px, fewer cards centred.
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids.filter(Boolean));
  return n;
}

const perViewOf = (four) => () => {
  if (four && window.matchMedia('(min-width: 1200px)').matches) return 4;
  if (window.matchMedia('(min-width: 992px)').matches) return 3;
  if (window.matchMedia('(min-width: 768px)').matches) return 2;
  return 1;
};

function slider(box, slides, perView) {
  const track = el('div', 'slick-track', ...slides);
  const list = el('div', 'slick-list draggable', track);
  const dots = el('ul', 'slick-dots');
  dots.setAttribute('role', 'tablist');
  let index = 0;
  const pages = () => Math.max(1, slides.length - perView() + 1);
  const layout = () => {
    const w = list.clientWidth / perView();
    slides.forEach((s, i) => {
      s.style.width = `${w}px`;
      s.classList.toggle('slick-active', i >= index && i < index + perView());
      s.classList.toggle('slick-current', i === index);
    });
    track.style.width = `${w * slides.length}px`;
    track.style.transform = `translate3d(${-w * index}px, 0px, 0px)`;
    dots.replaceChildren(...Array.from({ length: pages() }, (_, i) => {
      const b = el('button', '');
      b.type = 'button';
      b.textContent = String(i + 1);
      b.setAttribute('role', 'tab');
      b.addEventListener('click', () => { index = i; layout(); });
      return el('li', i === index ? 'slick-active' : '', b);
    }));
  };
  slides.forEach((s) => s.classList.add('slick-slide'));
  box.classList.add('slick-initialized', 'slick-slider', 'slick-dotted');
  box.append(list, dots);
  if (window.ResizeObserver) new ResizeObserver(layout).observe(list);
  requestAnimationFrame(layout);
}

export default function decorate(block) {
  const rows = [...block.children];
  const heading = block.querySelector('h2');
  const cards = rows.filter((r) => r.querySelector('h3')).map((r) => {
    const pics = [...r.querySelectorAll('picture')];
    const h3 = r.querySelector('h3');
    h3.classList.add('hThree', 'heading_aa');
    const linkP = [...r.querySelectorAll('p')].find((p) => p.querySelector('a'));
    const desc = [...r.querySelectorAll('p')].filter((p) => p !== linkP && !p.querySelector('picture'));
    if (linkP) linkP.querySelector('a').className = 'btn-link btn-big bg-wgite';
    const holder = el('div', 'media-holder');
    pics.forEach((p, i) => {
      const img = p.querySelector('img');
      if (img) img.classList.add(i === 0 && pics.length > 1 ? 'dsk-img' : 'mob-img');
      holder.append(p);
    });
    return el('div', 'about-more-products-items teaser', el(
      'div',
      'item',
      holder,
      el('div', 'per-loan-outers', el('div', 'personal-loan-detail', el(
        'div',
        'personal-wrapper',
        el('div', 'text', h3, ...desc),
        linkP ? el('div', 'btn-holder', el('div', 'btn-holders-btns', linkP)) : null,
      ))),
    ));
  });
  const box = el('div', 'cmp-container personal-loan-slider js-personal-loan-slider');
  slider(box, cards, perViewOf(block.classList.contains('four')));
  if (heading) heading.classList.add('text-center', 'heading36');
  block.replaceChildren(el('div', 'about-more-products-wrap', el(
    'section',
    'personal-loan-cntr space-tb40',
    heading ? el('div', 'container', el('div', 'tops-heads', el('div', 'container', heading))) : null,
    el('div', 'container mob-pd0', el('div', 'personal-loan-pro-box', box)),
  )));
}
