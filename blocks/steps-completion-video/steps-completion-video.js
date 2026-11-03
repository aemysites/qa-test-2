/**
 * steps-completion-video — the source `steps-completion-video` loan-steps panel: a centred
 * <h2> over a glass box with a numbered timeline of steps (icon, "Step n", title), store
 * badges, and a video poster with a play button that opens the video in a modal player.
 * Schema: stardust/eds-schema/home-loan-app.json → sections[space-tb40] (loan-steps-box).
 * Decode tier: reconstructive (one step per row).
 *
 * Authoring:
 *   1. head — <h2> (<strong> for the bold tail), optional
 *   2..N. one row per step — icon picture | <p> step label + <p> title (or <h3>)
 *   then a row with the store-badge paragraph (linked images), and a row with the poster
 *   picture. The video is a plain YouTube link authored as default content right after the
 *   block in the same section (a link inside the block is accepted too); it is moved into
 *   the block as the play button's target.
 * Behaviour: the timeline shows the source's at-rest state (first step completed, second
 * highlighted). The green tick and play glyph are block assets.
 * @ew-exempt <a> video link — rendered as the play button's target
 */

const BASE = '/blocks/steps-completion-video';
const EMBED = /(youtube\.com|youtu\.be|vimeo\.com)/i;

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids.filter(Boolean));
  return n;
}

function asset(file, cls) {
  const i = el('img', cls);
  i.src = `${BASE}/${file}`;
  i.alt = '';
  i.loading = 'lazy';
  return i;
}

function embedUrl(href) {
  try {
    const u = new URL(href);
    if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.endsWith('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }
    return u.href;
  } catch {
    return href;
  }
}

function playerModal() {
  const frame = el('iframe', 'frameSrc');
  frame.title = 'Video player';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture';
  frame.allowFullscreen = true;
  const close = el('button', 'popover-modal-close');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close dialog');
  const x = el('i', 'icon-close');
  x.setAttribute('aria-hidden', 'true');
  close.append(x);
  const modal = el(
    'div',
    'popover-modal fade',
    el('div', 'popover-modal-dialog popover-modal-dialog-centered popover-modal-lg2', el(
      'div',
      'popover-modal-content video-modals',
      close,
      el('div', 'popover-modal-body', el('div', 'videos-outer', frame)),
    )),
  );
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
  const open = (src, from) => {
    opener = from;
    const sep = src.includes('?') ? '&' : '?';
    frame.src = `${src}${sep}autoplay=1`;
    modal.hidden = false;
    modal.setAttribute('aria-modal', 'true');
    modal.classList.add('show');
    close.focus();
  };
  return { modal, open };
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  let heading = null;
  const steps = [];
  let stores = null;
  let poster = null;
  let video = null;
  let videoPara = null;
  rows.forEach((row) => {
    const h2 = row.querySelector('h2');
    if (h2) { heading = h2; return; }
    const badge = [...row.querySelectorAll('p')].find((p) => p.querySelector('a img, a picture'));
    if (badge) { stores = badge; return; }
    const pic = row.querySelector('picture') || row.querySelector('img');
    const texts = [...row.querySelectorAll('h3, h4, p')]
      .filter((p) => !p.querySelector('picture, img, a') && p.textContent.trim());
    const sub = texts.find((n) => n.tagName !== 'P');
    if (sub || texts.length >= 2) {
      const title = sub || texts[texts.length - 1];
      const label = texts.find((n) => n !== title);
      steps.push({ pic, label, title });
      return;
    }
    const link = row.querySelector('a[href]');
    if (pic) poster = pic;
    if (link) {
      video = link;
      videoPara = link.closest('p');
    }
  });

  if (!video) {
    const wrap = block.parentElement && block.parentElement.nextElementSibling;
    const lone = (x) => x.parentElement.textContent.trim() === x.textContent.trim();
    const a = wrap && [...wrap.querySelectorAll('p > a[href]')]
      .find((x) => EMBED.test(x.href) && lone(x));
    if (a) {
      video = a;
      videoPara = a.parentElement;
      if (wrap.children.length === 1) wrap.hidden = true;
    }
  }

  const ul = el('div', 'loan-steps-ul');
  ul.id = 'timeline-container';
  steps.forEach((s, i) => {
    let state = '';
    if (i === 0) state = ' completed';
    else if (i === 1) state = ' highlight';
    if (s.label) s.label.classList.add('steps-number');
    s.title.classList.add('heading20');
    ul.append(el(
      'div',
      `loan-steps-li tl-item-flag${state}`,
      el(
        'div',
        'steps-li-left',
        el('div', 'progress-custom-container', el('div', 'progressircle progressCircle')),
        el(
          'div',
          'steps-icons',
          asset('steps-green-ticks.svg', 'step-ticks-img'),
          el('span', 'steps-icon-in', s.pic),
        ),
      ),
      el('div', 'steps-li-right', s.label, s.title),
    ));
  });
  const left = el('div', 'loan-steps-left', ul);
  if (stores) {
    const box = el('div', 'pd-t10 steps-downloads-store');
    box.append(...stores.childNodes);
    stores.remove();
    left.append(box);
  }

  const right = el('div', 'loan-steps-right');
  let player = null;
  if (poster || video) {
    const img = poster && (poster.querySelector('img') || poster);
    if (img) img.classList.add('step-video-poster');
    const glyph = asset('step-video-play.svg');
    glyph.alt = 'Play-button'; // the source button's only label (its image alt)
    const play = el('a', 'step-play-btn', glyph);
    play.href = video ? video.href : '#';
    play.setAttribute('role', 'button');
    if (videoPara) {
      videoPara.classList.add('video-link');
      videoPara.hidden = true;
    }
    right.append(el('div', 'video-imgs', poster, play, videoPara));
    if (video) {
      player = playerModal();
      play.addEventListener('click', (e) => {
        e.preventDefault();
        player.open(embedUrl(video.href), play);
      });
    }
  }

  const wrap = el('div', 'cmp-container pd-t45i');
  if (heading) {
    heading.classList.add('text-center', 'heading36');
    wrap.append(el('div', 'component-title title mg-b15', el('div', 'container', heading)));
  }
  wrap.append(el('div', 'steps-completion-video', el('section', 'space-tb40', el(
    'div',
    'container',
    el('div', 'loan-steps-box bg-div', el('div', 'loan-steps-inner', left, right)),
  )), player && player.modal));
  block.replaceChildren(wrap);
}
