/**
 * newsletter — the site-wide "Subscribe to our newsletter" band (source `newsletter` /
 * `subscribe-box`; rules live in styles/lazy-styles.css). Decode tier: template-slotted.
 *
 * Authoring (query-based): <h2> (a <strong> tail renders as its own bold line), field label
 * <p>, submit label <p> (the last paragraph).
 * @ew-exempt <p> submit label (last paragraph) — rendered as the form's submit <button> (EW7)
 * Interim behaviour (dynamic-features-plan D4): the e-mail is validated client-side and the
 * submit shows a notice; no request leaves the page.
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

let uid = 0;

export default function decorate(block) {
  uid += 1;
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const ps = [...block.querySelectorAll('p')];
  const filled = ps.filter((p) => p.textContent.trim());
  const label = filled[0];
  const submit = filled.length > 1 ? filled[filled.length - 1] : null;

  const input = el('input', 'input-textbox');
  input.id = `nl-email-${uid}`;
  input.type = 'text';
  input.autocomplete = 'email';
  if (label) input.setAttribute('aria-label', label.textContent.trim());
  const box = el('div', 'form-textbox', el('div', 'label-name', ...(label ? [label] : [])), el('div', 'textbox-inner', input));
  const sync = () => box.classList.toggle('active', document.activeElement === input || !!input.value);
  input.addEventListener('focus', sync);
  input.addEventListener('blur', sync);
  const notice = el('p', 'subscribe-notice');
  notice.setAttribute('role', 'status');
  notice.hidden = true;
  const form = el('form', 'subscribe-form', box);
  form.noValidate = true;
  const btn = el('button', 'btn-link btn-big btn-subscribes', submit ? submit.textContent.trim() : 'Subscribe');
  btn.type = 'submit';
  if (submit) submit.remove();
  form.append(btn, notice);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    notice.textContent = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)
      ? 'Newsletter sign-up is not connected on this site yet; nothing was sent.'
      : 'Please enter a valid email ID';
    notice.hidden = false;
  });
  const left = el('div', 'subscribe-left');
  if (heading) left.append(heading);
  block.replaceChildren(el('div', 'subscribe-box', el('div', 'container', el(
    'div',
    'subscribe-inner',
    el('div', 'subscribe-row', left, el('div', 'subscribe-right', form)),
  ))));
}
