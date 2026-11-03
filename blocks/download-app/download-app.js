/**
 * download-app — the source `download-app-box` call-out: a blue rounded band with an <h2>,
 * a line of copy, a QR code, an "or" divider and the store badges, with a phone image
 * overlapping the band's right edge.
 * Schema: stardust/eds-schema/home-loan-app.json → sections[space-tb40] (get-loans-box).
 * Decode tier: template-slotted (cells classified by content, any order).
 *
 * Authoring (one row):
 *   - text cell: <h2> + <p> copy
 *   - QR picture cell (first picture without a link)
 *   - badges cell: optional divider <p> ("or") + paragraph of linked store-badge images
 *   - side picture cell (second picture without a link)
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids.filter(Boolean));
  return n;
}

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const heading = block.querySelector('h2, h3');
  const paras = [...block.querySelectorAll('p')];
  const stores = paras.find((p) => p.querySelector('a img, a picture'));
  const loose = [...block.querySelectorAll('picture, img')]
    .filter((n) => !n.closest('a') && (n.tagName === 'PICTURE' || !n.closest('picture')));
  const [qr, side] = loose;
  const textCell = heading ? cells.find((c) => c.contains(heading)) : null;
  const copy = paras.filter((p) => p !== stores && !p.querySelector('picture, img')
    && textCell && textCell.contains(p));
  const or = paras.find((p) => p !== stores && !copy.includes(p) && !p.querySelector('picture, img')
    && p.textContent.trim());

  const store = el('div', 'steps-downloads-store');
  if (stores) {
    store.append(...stores.childNodes);
    stores.remove();
  }
  if (or) or.classList.add('ortext');
  const row = el(
    'div',
    'gets-loans-row',
    el('div', 'get-loan-lefts', qr),
    el('div', 'get-loan-center', or),
    el('div', 'get-loan-right', store),
  );
  const inner = el('div', 'get-loans-inner', heading, ...copy, row);
  if (side) (side.querySelector('img') || side).classList.add('get-loans-img');
  const box = el('div', 'bg-div get-loans-box', inner, side);
  block.replaceChildren(el('section', 'space-tb40 space-b80', el('div', 'container', box)));
}
