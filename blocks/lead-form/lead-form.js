/**
 * lead-form — the floating short lead form (source `non-product-short-lead-form`; on the home
 * page it is shown, on article/static templates the source renders it hidden — author the
 * block as `lead-form (hidden)`). Schema: stardust/eds-schema/index.json →
 * sections[non-product-short-lead-form]. Decode tier: template-slotted.
 *
 * Authoring: one row — placeholder <p> | submit label <p>
 * Variant (block class): `hidden` renders the form parked off-screen (default shown).
 * @ew-exempt <p> placeholder (cell 1) — rendered as the input placeholder
 * @ew-exempt <p> submit label (cell 2) — rendered as the form's submit <button> (EW7)
 * Interim behaviour (dynamic-features-plan D4): the number is validated client-side and the
 * submit shows a notice; no request leaves the page.
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const texts = cells.map((c) => (c.querySelector('p') || c).textContent.trim()).filter(Boolean);
  const hint = texts[0];
  const label = texts[1] || 'Submit';
  const placeholder = hint || 'Enter mobile number';

  const input = el('input');
  input.type = 'tel';
  input.name = 'mobile';
  input.maxLength = 10;
  input.inputMode = 'numeric';
  input.pattern = '[0-9]{10}';
  input.placeholder = placeholder;
  input.autocomplete = 'tel';
  input.setAttribute('aria-label', placeholder);
  const err = el('span', 'error-msgs');
  err.setAttribute('aria-live', 'polite');
  const form = el('form', 'short-lead-form-fields', el('div', 'short-lead-form-input', input, err));
  form.noValidate = true;
  const btn = el('button', 'btn-blue short-lead-form-btn', label);
  btn.type = 'submit';
  form.append(btn);
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 10);
    err.textContent = '';
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    err.textContent = /^[6-9][0-9]{9}$/.test(input.value)
      ? 'Thanks — updates are not connected on this site yet; nothing was sent.'
      : 'Please enter a valid mobile number';
  });
  const section = el(
    'div',
    `non-product-short-lead-form${block.classList.contains('hidden') ? ' is-hidden' : ''}`,
    el('div', 'container', el('div', 'short-lead-form-box', el(
      'div',
      'short-lead-form-content',
      el('div', 'short-lead-form-text', form),
    ))),
  );
  block.replaceChildren(section);
}
