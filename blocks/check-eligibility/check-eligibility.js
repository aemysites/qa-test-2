/**
 * check-eligibility — the source `check-loan-eligibility` band: a centred heading36 title
 * over one glass card of rich text (source `check-eligibility-box` > `eligibility-cards`).
 * Schema: stardust/eds-schema/privacy-commitment.json → sections[check-eligibility-box].
 * Decode tier: template-slotted.
 *
 * Authoring: row 1 = the <h2> (<strong> for the bold tail); row 2 = the card body
 * (paragraphs, lists). A missing row renders without that part.
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const heading = block.querySelector('h1, h2, h3');
  const bodyNodes = [];
  cells.forEach((cell) => {
    [...cell.children].forEach((c) => {
      if (c !== heading) bodyNodes.push(c);
    });
  });
  const container = el('div', 'container');
  if (heading) {
    heading.classList.add('text-center', 'heading36');
    container.append(el('div', 'tops-heads', el('div', 'container', heading)));
  }
  if (bodyNodes.length) {
    const rte = el('div', 'rte title', el('div', 'tc-rte', ...bodyNodes));
    container.append(el('div', 'bg-div eligibility-cards', rte));
  }
  block.replaceChildren(el(
    'div',
    'check-loan-eligibility',
    el('section', 'check-eligibility-box space-tb40', container),
  ));
}
