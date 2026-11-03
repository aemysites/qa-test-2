/**
 * instant-loan — pre-approved offer teaser with the Name / Phone form (source
 * `instant-loan-cntr`). Schema: stardust/eds-schema/index.json → sections[instant-loan-cntr].
 * Decode tier: template-slotted (authored nodes moved into the source composition).
 *
 * Authoring (query-based, any row shape):
 *   pictures: 1st = desktop illustration, 2nd = mobile tick badge
 *   <h2> heading (a <strong> tail renders as its own bold line)
 *   offer <p> (with its inline link) — the first link-free-label paragraph after the heading
 *   form row: field label <p>s (one input each; 2nd and later = phone) | submit label <p>
 *   "Already applied" <p> with its link — the last paragraph
 * Interim behaviour (dynamic-features-plan D4): submit validates and shows a notice; no
 * request leaves the page. The OTP / error states of the source are not rendered.
 * @ew-exempt <p> submit label (form row, cell 2) — rendered as the form's submit <button> (EW7)
 */

let uid = 0;

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

export default function decorate(block) {
  uid += 1;
  const pics = [...block.querySelectorAll('picture, img')].filter((p) => !p.closest('picture') || p.tagName === 'PICTURE');
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const ps = [...block.querySelectorAll('p')].filter((p) => !p.querySelector('picture, img'));
  const linked = ps.filter((p) => p.querySelector('a'));
  const info = linked[0] || null;
  const applied = linked.length > 1 ? linked[linked.length - 1] : null;
  const formRow = [...block.children].find((r) => r.children.length > 1
    && !r.querySelector('a, picture, img, h1, h2, h3, h4, h5, h6'));
  const formCells = formRow ? [...formRow.children] : [];
  const labels = formCells[0] ? [...formCells[0].querySelectorAll('p')] : [];
  const submitP = formCells[1] ? formCells[1].querySelector('p') || formCells[1] : null;

  const desk = el('div', 'media-holder image-desk');
  if (pics[0]) desk.append(pics[0]);
  const mob = el('div', 'media-holder image-mob');
  if (pics[1]) mob.append(pics[1]);

  const form = el('form', 'pre-approved-form');
  form.noValidate = true;
  const inputs = labels.map((p, i) => {
    const id = `il-${uid}-${i}`;
    const input = el('input', 'input-textbox');
    input.id = id;
    input.type = 'text';
    input.setAttribute('aria-label', p.textContent.trim());
    if (i > 0) {
      input.inputMode = 'numeric';
      input.maxLength = 10;
      input.autocomplete = 'tel';
    } else input.autocomplete = 'name';
    const box = el('div', 'form-textbox', el('div', 'label-name', p), el('div', 'textbox-inner', input));
    const sync = () => box.classList.toggle('active', document.activeElement === input || !!input.value);
    input.addEventListener('focus', sync);
    input.addEventListener('blur', sync);
    input.addEventListener('input', () => {
      if (i > 0) input.value = input.value.replace(/\D/g, '').slice(0, 10);
      sync();
    });
    box.querySelector('.label-name').addEventListener('click', () => input.focus());
    form.append(box);
    return input;
  });
  const notice = el('p', 'form-notice');
  notice.setAttribute('role', 'status');
  notice.hidden = true;
  const btn = el('button', 'btn-blue btn-large js-proceed-btn', submitP ? submitP.textContent.trim() : 'Proceed');
  btn.type = 'submit';
  form.append(el('div', 'btn-holder', btn), notice);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = inputs[1];
    const ok = (!inputs[0] || inputs[0].value.trim()) && (!phone || /^[6-9]\d{9}$/.test(phone.value));
    notice.textContent = ok
      ? 'Online pre-approved offers are not connected on this site yet. No details were sent.'
      : 'Please enter your name and a valid 10-digit mobile number.';
    notice.hidden = false;
  });

  const infoBox = el('div', 'info');
  if (info) infoBox.append(info);
  const offer = el('div', 'pre-approved-offer', mob, infoBox, form);
  const right = el('div', 'instant-loan');
  if (heading) right.append(el('div', 'heading-section', heading));
  right.append(offer);
  if (applied) {
    const a = applied.querySelector('a');
    const arrow = el('span', 'icon-arrow-right');
    arrow.setAttribute('aria-hidden', 'true');
    a.append(' ', arrow);
    right.append(el('div', 'already-applied', applied));
  }
  block.replaceChildren(el(
    'div',
    'instant-loan-cntr',
    el('div', 'container', el('div', 'instant-loan-box space-tb40', desk, right)),
  ));
}
