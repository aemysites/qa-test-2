/**
 * communities — CSR "Creating value for our communities" panel (source `communities-box`).
 * Schema: stardust/eds-schema/index.json → sections[communities-box]. Decode tier:
 * reconstructive (rows classified by shape).
 *
 * Authoring rows:
 *   heading row: <h2> (a <strong> tail renders as its own bold line)
 *   focus-area rows: icon key | label  (icon key = an icomoon glyph name, e.g. loan-education)
 *   CTA row: <p><strong><a>…</a></strong></p>
 *   stat rows (after the CTA): figure | caption
 * @ew-exempt <p> icon key (focus-area cell 1) — glyph-key metadata, never displayed
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

export default function decorate(block) {
  const rows = [...block.children];
  const left = el('div', 'communities-left');
  const list = el('ul', 'communities-list');
  const stats = el('ul', 'communities-pers');
  let ctaSeen = false;
  let heading = null;
  let cta = null;
  rows.forEach((row) => {
    const h = row.querySelector('h1, h2, h3, h4, h5, h6');
    const a = row.querySelector('a');
    const cells = [...row.children];
    if (h) {
      heading = h;
    } else if (a) {
      cta = a.closest('p') || a;
      a.classList.remove('button', 'primary', 'secondary', 'accent');
      a.classList.add('btn-blue', 'btn-big');
      ctaSeen = true;
    } else if (cells.length >= 2) {
      const [k, v] = cells;
      const label = v.querySelector('p') || v;
      if (!ctaSeen) {
        const key = k.textContent.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
        const glyph = el('span', `icon-${key}`);
        glyph.setAttribute('aria-hidden', 'true');
        list.append(el('li', '', el('span', 'all-icon communities-icons', glyph), el('div', 'text16i', label)));
      } else {
        const fig = k.querySelector('p') || k;
        stats.append(el('li', '', el('div', 'heading36', fig), el('div', 'text16i', label)));
      }
    }
  });
  if (heading) left.append(el('div', 'main-heading', heading));
  left.append(list);
  if (cta) {
    if (cta.classList) cta.classList.remove('button-wrapper');
    left.append(el('div', 'communities-btn', cta));
  }
  const rowBox = el('div', 'communities-row', left);
  if (stats.children.length) rowBox.append(el('div', 'communities-details', stats));
  block.replaceChildren(el(
    'div',
    'communities-box space-tb40',
    el('div', 'container', el('div', 'mx-944', rowBox)),
  ));
}
