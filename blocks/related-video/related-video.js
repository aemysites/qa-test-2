/**
 * related-video — the source `related-video-cntr` band: a centred <h2> over one or more
 * video cards (thumbnail with a play button | hashtag, title, description, duration, Share).
 * Play opens the video in a modal player (source `popover-modal video-popup`).
 * Schema: stardust/eds-schema/check-credit-score.json → sections[related-video-cntr].
 * Decode tier: reconstructive (one row per video).
 *
 * Authoring:
 *   1. head — <h2> (<strong> for the bold tail); optional (a heading authored as default
 *      content just before the block is reabsorbed)
 *   2..N. one row per video — thumbnail picture | text cell: hashtag <p> (starts with #),
 *      <h3> title, description <p>s, duration <p> (m:ss), video link <p> (embed / watch URL)
 * @ew-exempt <p> video link (text cell) — the player source, never displayed
 * Two or more videos: the first renders large (block-left), the rest as a scrolling side list
 * (block-right, `small-size` cards: thumbnail, title, duration).
 * @variants block class: flush-top — no band top padding (the personal-loan source)
 * Share buttons (WhatsApp, Facebook, X, copy link) and the modal player are generated chrome.
 */

const ICONS = `${window.hlx?.codeBasePath || ''}/blocks/related-video`;
const SOCIAL = [
  { name: 'WhatsApp', icon: 'whatsapp-colored.svg', url: (u) => `https://wa.me/?text=${u}` },
  { name: 'Facebook', icon: 'facebook-colored.svg', url: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  { name: 'X', icon: 'twitter-x.svg', url: (u) => `https://twitter.com/intent/tweet?url=${u}` },
];
const VIDEO_RE = /youtube\.com|youtu\.be|vimeo\.com|\.mp4($|\?)/;

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids.filter(Boolean));
  return n;
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

function shareMenu(href) {
  const bundle = el('div', 'new-share-bundle js-close-outside');
  const toggle = el('button', 'btn-white js-shares-btn', 'Share ');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  const glyph = el('span', 'icon-share');
  glyph.setAttribute('aria-hidden', 'true');
  toggle.append(glyph);
  const menu = el('div', 'share-bundle-menu');
  const url = encodeURIComponent(href);
  SOCIAL.forEach((s) => {
    const a = el('a', 'social-btn');
    a.href = s.url(url);
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', `Share on ${s.name}`);
    const img = el('img');
    img.src = `${ICONS}/${s.icon}`;
    img.alt = '';
    img.loading = 'lazy';
    img.width = 22;
    img.height = 22;
    a.append(img);
    menu.append(a);
  });
  const copy = el('button', 'social-btn jsCopyLink');
  copy.type = 'button';
  const copyGlyph = el('span', 'icon-copy icon');
  copyGlyph.setAttribute('aria-hidden', 'true');
  copy.append(copyGlyph, el('span', 'text-copy', 'Copy'));
  copy.addEventListener('click', () => navigator.clipboard?.writeText(href));
  menu.append(copy);
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const on = !menu.classList.contains('active');
    menu.classList.toggle('active', on);
    toggle.setAttribute('aria-expanded', String(on));
  });
  document.addEventListener('click', (e) => {
    if (!bundle.contains(e.target)) {
      menu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
  bundle.append(toggle, menu);
  return bundle;
}

function playerModal() {
  const frame = el('iframe', 'iframClass');
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
    'popover-modal video-popup fade',
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

function buildCard(row, player) {
  const media = row.querySelector('picture, img');
  const textNodes = [...row.querySelectorAll(':scope > div > *')].filter((n) => !n.matches('picture, img')
    && !(n.tagName === 'P' && n.querySelector('picture, img') && !n.textContent.trim()));
  let video = null;
  const tag = [];
  let title = null;
  const desc = [];
  const time = [];
  textNodes.forEach((n) => {
    const a = n.tagName === 'P' ? n.querySelector('a') : null;
    const t = n.textContent.trim();
    if (a && VIDEO_RE.test(a.href) && t === a.textContent.trim()) video = a.href;
    else if (/^H[1-6]$/.test(n.tagName) && !title) title = n;
    else if (n.tagName === 'P' && /^#\S/.test(t) && !title) tag.push(n);
    else if (n.tagName === 'P' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(t)) time.push(n);
    else if (t) desc.push(n);
  });
  const src = video ? embedUrl(video) : null;
  const holder = el('div', 'media-holder', media);
  if (src) {
    const play = el('button', 'media-figure');
    play.type = 'button';
    play.setAttribute('aria-label', 'Play video');
    const i = el('i', 'icon-play pointEvt');
    i.setAttribute('aria-hidden', 'true');
    play.append(i);
    play.addEventListener('click', () => player.open(src, play));
    holder.append(play);
  }
  const top = el(
    'div',
    'top',
    tag.length ? el('div', 'hash-tag', ...tag) : null,
    title ? el('div', 'block-title', el('div', 'heading20 related-video-main-title', title)) : null,
    desc.length ? el('div', 'related-text', ...desc) : null,
    time.length ? el('div', 'post-info', ...time.map((p) => el('div', 'post-time', p))) : null,
  );
  const bottom = el('div', 'bottom', shareMenu(src || window.location.href));
  return el('div', 'related-video', holder, el('div', 'text', top, bottom));
}

export default function decorate(block) {
  const rows = [...block.children];
  let heading = block.querySelector('h2');
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  if (!heading && prev && prev.classList.contains('default-content-wrapper')) {
    heading = prev.querySelector('h2');
    if (heading) prev.remove();
  }
  const cardRows = rows.filter((r) => r.querySelector('picture, img, h3, h4'));
  const player = playerModal();
  const cards = cardRows.map((r) => buildCard(r, player));
  const container = el('div', 'container');
  if (heading) {
    container.append(el('div', 'tops-heads', el('div', 'component-title title', el(
      'div',
      'container heading36 text-center',
      heading,
    ))));
  }
  const full = cards.length === 1 ? ' related-video-full' : '';
  if (cards.length > 1) {
    // first video large on the left, the rest in a scrolling side list (source block-right)
    const side = cards.slice(1);
    block.classList.add('has-side-list');
    side.forEach((c) => {
      c.classList.add('small-size');
      const t = c.querySelector('.related-video-main-title');
      if (t) t.className = 'related-video-side-title';
      c.querySelectorAll('.related-text, .hash-tag, .bottom').forEach((n) => n.classList.add('is-side'));
    });
    container.append(el(
      'div',
      'related-video-box',
      el('div', 'block-left', cards[0]),
      el('div', 'block-right', el('div', 'block-scroll', ...side)),
    ));
  } else {
    container.append(el('div', `related-video-box${full}`, ...cards.map((c) => el('div', 'block-left', c))));
  }
  block.replaceChildren(
    el('div', 'custome-related-videos', el('section', 'related-video-cntr space-tb40', container)),
    player.modal,
  );
}
