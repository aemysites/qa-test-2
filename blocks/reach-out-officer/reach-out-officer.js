/**
 * reach-out-officer — the source `reach-out-officer` / `nodal-officer-box` band: a centred
 * 944px glass card holding rich-text lines (partners page: "To view the list of …, please
 * click here." disclosure links). Decode tier: template-slotted.
 *
 * Authoring (one cell): any default content — paragraphs, headings, lists — moved as is.
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

export default function decorate(block) {
  const rte = el('div', 'tc-rte');
  block.querySelectorAll(':scope > div > div').forEach((cell) => rte.append(...cell.children));
  block.replaceChildren(el('div', 'space-tb40', el('div', 'container', el(
    'div',
    'mx-944',
    el('div', 'nodal-officer-box', rte),
  ))));
}
