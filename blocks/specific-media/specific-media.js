/**
 * specific-media — the source `specific-media` app-advantages panel: a centred <h2> over a
 * glass box with a list of feature steps (icon, title, text revealed on the active step)
 * beside the phone screenshot of the active step.
 * Schema: stardust/eds-schema/home-loan-app.json → sections[space-tb40] (specific-steps).
 * Decode tier: reconstructive (one step per row).
 *
 * Authoring:
 *   1. head — <h2> (<strong> for the bold tail)
 *   2..N. one row per step — icon picture | screenshot picture | title <p> (or <h3>) + <p> text
 *      (cells classified by content: the first picture cell is the icon, the next the shot)
 * Behaviour: the second step is active at rest (the source's captured state); clicking,
 * focusing or hovering a step activates it and shows its screenshot.
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

const picOf = (cell) => (cell ? cell.querySelector('picture') || cell.querySelector('img') : null);

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const heading = block.querySelector('h2');
  const steps = [];
  rows.forEach((row) => {
    const cells = [...row.children];
    const media = cells.filter((c) => c.querySelector('picture, img'));
    const text = cells.find((c) => !c.querySelector('picture, img') && c.textContent.trim());
    if (!text || row.querySelector('h2')) return;
    steps.push({ icon: picOf(media[0]), shot: picOf(media[1]), text });
  });

  const ul = el('div', 'specific-steps-ul');
  const right = el('div', 'specific-steps-right');
  const active = steps.length > 1 ? 1 : 0;
  const items = steps.map((s, i) => {
    const title = s.text.querySelector('h3, h4') || s.text.firstElementChild;
    title.classList.add('heading20', 'semibold');
    const texts = el('div', 'steps-texts', ...[...s.text.children].filter((n) => n !== title));
    const icons = el('div', 'steps-icons');
    if (s.icon) {
      (s.icon.querySelector('img') || s.icon).classList.add('step-ticks-img');
      icons.append(s.icon);
    }
    const li = el(
      'div',
      `specific-steps-li training-item${i === active ? ' active' : ''}`,
      el('div', 'specific-li-left', icons, title, texts),
      el('div', 'progress-custom-container', el('div', 'progressircle progressCircle conic-gradient-border')),
    );
    li.tabIndex = 0;
    ul.append(li);
    right.append(el('div', `media-holder-row${i === active ? '' : ' d-none'}`, ...(s.shot ? [s.shot] : [])));
    return li;
  });
  const activate = (idx) => {
    items.forEach((li, i) => li.classList.toggle('active', i === idx));
    [...right.children].forEach((r, i) => r.classList.toggle('d-none', i !== idx));
  };
  items.forEach((li, i) => {
    ['click', 'focus', 'mouseenter'].forEach((ev) => li.addEventListener(ev, () => activate(i)));
  });

  const inner = el('div', 'mx-1012');
  if (heading) inner.append(el('div', 'tops-heads', heading));
  inner.append(el('div', 'specific-box bg-div', el(
    'div',
    'specific-steps-inner',
    el('div', 'specific-steps-left', ul),
    right,
  )));
  block.replaceChildren(el('section', 'space-tb40', el('div', 'container', inner)));
}
