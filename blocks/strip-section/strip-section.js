/**
 * strip-section — the blue CSR campaign strip (source `strip-section`). Schema:
 * stardust/eds-schema/index.json → sections[strip-section]. Decode tier: template-slotted.
 *
 * Authoring (query-based): pictures in order — 1 logo, 2 desktop overlay art, 3 mobile overlay
 * art; one heading (a <strong> tail renders as its own bold line); one CTA paragraph.
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

export default function decorate(block) {
  const pics = [...block.querySelectorAll('picture, img')]
    .filter((p) => p.tagName === 'PICTURE' || !p.closest('picture'));
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const ctaP = [...block.querySelectorAll('p')].find((p) => p.querySelector('a'));

  const left = el('div', 'strip-left');
  if (pics[0]) left.append(el('div', 'srtip-img', pics[0]));
  if (heading) left.append(el('div', 'strip-text', heading));
  const overlay = el('div', 'strip-overlay-img');
  if (pics[1]) overlay.append(el('div', 'strip-desktop-img', pics[1]));
  if (pics[2]) overlay.append(el('div', 'strip-desktop-mobile', pics[2]));
  const right = el('div', 'strip-right', overlay);
  if (ctaP) {
    const a = ctaP.querySelector('a');
    a.classList.remove('button', 'primary', 'secondary', 'accent');
    a.classList.add('btn');
    ctaP.classList.remove('button-wrapper');
    right.append(el('div', 'strip-cta', ctaP));
  }
  block.replaceChildren(el(
    'div',
    'strip-section space-tb40',
    el('div', 'container', el('div', 'strip-banner', el('div', 'strip-row', left, right))),
  ));
}
