/**
 * apply-via-whatsapp — the WhatsApp apply strip (source `apply-via-whatsapp` /
 * `tata-whatsapp-box`): WhatsApp glyph + one-line pitch on the left, CTA on the right.
 * Schema: stardust/eds-schema/personal-loan.json → sections[tata-whatsapp-box].
 * Decode tier: template-slotted.
 *
 * Authoring: one cell — pitch <p>, CTA <p><strong><a>…</a></strong></p>.
 * The WhatsApp glyph is decorative chrome (block asset).
 * Variant `blue` (home-loan "Instant approval" strip): blue box, white pitch and white CTA,
 * no glyph.
 */

const BASE = `${window.hlx?.codeBasePath || ''}/blocks/apply-via-whatsapp`;

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids.filter(Boolean));
  return n;
}

export default function decorate(block) {
  const ps = [...block.querySelectorAll('p')];
  const ctaP = ps.find((p) => p.querySelector('a'));
  const pitch = ps.filter((p) => p !== ctaP);
  const img = el('img', 'cmp-image__image');
  img.src = `${BASE}/whatsapp-colored.svg`;
  img.alt = '';
  img.loading = 'lazy';
  pitch.forEach((p) => p.classList.add('heading20', 'component-title-dynamic-tag'));
  const blue = block.classList.contains('blue');
  const leftBox = el(
    'div',
    'cmp-container whatsapp-left',
    blue ? '' : el('div', 'image whatsapp', el('div', 'cmp-image', img)),
    el('div', 'component-title title', ...pitch),
  );
  const inner = el('div', 'whatsapp-inner', el('div', 'customcontainer container', leftBox));
  if (ctaP) {
    ctaP.querySelector('a').className = 'btn-blue btn14';
    inner.append(el('div', 'customcontainer container', el(
      'div',
      'cmp-container apply-whatsapp',
      el('div', 'white-blue-button button', ctaP),
    )));
  }
  block.replaceChildren(el('div', 'apply-via-whatsapp-box', el(
    'section',
    'space-tb40',
    el('div', 'container', el('div', 'mx-944 tata-whatsapp-box', inner)),
  )));
}
