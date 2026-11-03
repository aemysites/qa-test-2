/**
 * loan-steps — the "How to Apply" band (source `steps-completion-video` / `loan-steps-box`):
 * centred <h2> over a glass card holding a vertical step timeline + apply CTA on the left and
 * a video poster with a play button on the right (play opens a modal YouTube player).
 * Schema: stardust/eds-schema/personal-loan.json → sections[loan-steps-box].
 * Decode tier: reconstructive (one row per step).
 *
 * Authoring rows:
 *   1. head — <h2> (<strong> tail); optional
 *   2..N. step — :icon: paragraph | step number <p> | step title <p>
 *   CTA row — <p><strong><a>…</a></strong></p>, then the video link <p> (YouTube embed / watch URL)
 *   video row — poster picture
 * @ew-exempt <p> video link (CTA row) — the player source, never displayed
 * The completion ticks, progress rings, play button and modal player are generated chrome.
 */

const BASE = `${window.hlx?.codeBasePath || ''}/blocks/loan-steps`;

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids.filter(Boolean));
  return n;
}

function icon(src, cls, alt = '') {
  const i = el('img', cls);
  i.src = `${BASE}/${src}`;
  i.alt = alt;
  i.loading = 'lazy';
  return i;
}

function embed(href) {
  const m = href.match(/(?:embed\/|v=|youtu\.be\/)([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : href;
}

function player() {
  const frame = el('iframe', 'frameSrc');
  frame.title = 'Video player';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture';
  frame.allowFullscreen = true;
  const close = el('button', 'popover-modal-close', el('i', 'icon-close'));
  close.type = 'button';
  close.setAttribute('aria-label', 'Close dialog');
  const modal = el('div', 'popover-modal fade', el(
    'div',
    'popover-modal-dialog popover-modal-dialog-centered popover-modal-lg2',
    el('div', 'popover-modal-content video-modals', close, el('div', 'popover-modal-body', el('div', 'videos-outer', frame))),
  ));
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Video player');
  modal.hidden = true;
  let opener = null;
  const hide = () => {
    modal.classList.remove('show');
    modal.hidden = true;
    modal.removeAttribute('aria-modal');
    frame.src = 'about:blank';
    if (opener) opener.focus();
  };
  close.addEventListener('click', hide);
  modal.addEventListener('click', (e) => { if (e.target === modal) hide(); });
  modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  return {
    modal,
    open: (src, from) => {
      opener = from;
      frame.src = `${src}${src.includes('?') ? '&' : '?'}autoplay=1`;
      modal.hidden = false;
      modal.setAttribute('aria-modal', 'true');
      modal.classList.add('show');
      close.focus();
    },
  };
}

export default function decorate(block) {
  const rows = [...block.children];
  const heading = block.querySelector('h2');
  const videoRow = rows.find((r) => r.querySelector('picture'));
  const ctaRow = rows.find((r) => r !== videoRow && r.querySelector('a') && !r.querySelector('h2'));
  const stepRows = rows.filter((r) => r !== videoRow && r !== ctaRow && !r.querySelector('h2'));
  const modal = player();

  const ul = el('div', 'loan-steps-ul');
  stepRows.forEach((r, i) => {
    const cells = [...r.children];
    const ic = cells[0].querySelector('.icon') || cells[0].querySelector('p');
    const num = cells[1] && (cells[1].querySelector('p') || cells[1]);
    const title = cells[2] && (cells[2].querySelector('p') || cells[2]);
    if (num) num.className = 'steps-number';
    if (title) title.className = 'heading20';
    ul.append(el(
      'div',
      `loan-steps-li tl-item-flag${i === 0 ? ' highlight' : ''}`,
      el(
        'div',
        'steps-li-left',
        el('div', 'progress-custom-container', el('div', 'progressircle progressCircle')),
        el('div', 'steps-icons', icon('steps-green-ticks.svg', 'step-ticks-img'), el('span', 'steps-icon-in', ic)),
      ),
      el('div', 'steps-li-right', num, title),
    ));
  });
  const left = el('div', 'loan-steps-left', ul);
  if (ctaRow) {
    const a = [...ctaRow.querySelectorAll('a')].find((x) => !/youtu/.test(x.href));
    if (a) {
      a.className = 'btn-blue btn-large mobile-w-100';
      left.append(el('div', 'pd-t10 steps-apply-btn', a.closest('p') || a));
    }
  }
  const inner = el('div', 'loan-steps-inner', left);
  if (videoRow) {
    const pic = videoRow.querySelector('picture');
    const img = pic.querySelector('img');
    if (img) img.classList.add('step-video-poster');
    const vLink = [...block.querySelectorAll('a')].find((a) => /youtu/.test(a.href));
    const imgs = el('div', 'video-imgs', pic);
    if (vLink) {
      const play = el('button', 'step-play-btn', icon('step-video-play.svg', '', 'Play-button'));
      play.type = 'button';
      play.setAttribute('aria-label', 'Play video');
      const src = embed(vLink.href);
      play.addEventListener('click', () => modal.open(src, play));
      imgs.append(play);
    }
    inner.append(el('div', 'loan-steps-right', imgs));
  }
  const out = [];
  if (heading) {
    heading.classList.add('text-center', 'heading36');
    out.push(el('div', 'component-title title mg-b15', el('div', 'container', heading)));
  }
  out.push(el('div', 'steps-completion-video', el(
    'section',
    'space-tb40',
    el('div', 'container', el('div', 'loan-steps-box bg-div', inner)),
  )), modal.modal);
  block.replaceChildren(...out);
}
