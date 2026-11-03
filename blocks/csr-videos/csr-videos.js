/**
 * csr-videos — the source `csr-videos` / `blog-video-box most-viewed` grid (CSR campaign page):
 * centred heading + description, a three-up grid of video cards (thumbnail with a play button,
 * title) that open the YouTube video in the source video modal, and a "Watch More" CTA.
 * Decode tier: reconstructive (one card per row).
 *
 * Authoring:
 *   1. head — <h2> + description <p>
 *   2..N. one row per card — picture | title <p>
 *   last. optional CTA row — <p><strong><a>…</a></strong></p> (the source white-blue-button)
 *   Video links: one link per card, in card order, authored as default content in the block's
 *   section (YouTube watch or shorts URLs, link text = the card title; shorts open the portrait
 *   modal). The block reabsorbs them (EW8): each becomes its card's title link + play button.
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

function embed(href) {
  let u;
  try { u = new URL(href); } catch { return ''; }
  const short = u.pathname.match(/\/shorts\/([\w-]+)/);
  const id = short ? short[1] : (u.searchParams.get('v') || u.pathname.split('/').pop());
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
}

function modal(kind) {
  const close = (where) => {
    const b = el('button', `video-modal-close ${where}`, el('span', 'icon-close'));
    b.setAttribute('aria-label', 'Close video modal');
    return b;
  };
  const frame = el('iframe');
  frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
  frame.setAttribute('allowfullscreen', '');
  frame.title = 'Video';
  const title = el('h3', 'video-modal-title');
  const box = el(
    'div',
    `video-modal-container${kind === 'short' ? ' short-video' : ''}`,
    el('div', 'video-modal-left', close('mobile'), el('div', `video-wrapper${kind === 'short' ? ' short-wrapper' : ''}`, frame)),
    el('div', 'video-modal-right', close('desktop'), el('div', 'video-info-content', title)),
  );
  const overlay = el('div', 'video-modal-overlay', box);
  overlay.setAttribute('role', 'dialog');
  overlay.hidden = true;
  const hide = () => {
    overlay.classList.remove('active');
    overlay.hidden = true;
    overlay.removeAttribute('aria-modal');
    frame.removeAttribute('src');
  };
  overlay.querySelectorAll('.video-modal-close').forEach((b) => b.addEventListener('click', hide));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) hide(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  overlay.open = (src, text) => {
    frame.src = src;
    title.textContent = text;
    overlay.hidden = false;
    overlay.setAttribute('aria-modal', 'true');
    overlay.classList.add('active');
    overlay.querySelector('.video-modal-close.desktop').focus();
  };
  return overlay;
}

export default function decorate(block) {
  const rows = [...block.children];
  const head = rows.shift();
  const ctaRow = rows.length && !rows[rows.length - 1].querySelector('picture, img')
    ? rows.pop() : null;
  const heading = head && head.querySelector('h1, h2, h3');
  const desc = head && head.querySelector('p');
  if (desc) desc.className = 'heading-description';
  const headView = el('div', 'heading-view', ...[heading, desc].filter(Boolean));

  // EW8: the section's default-content video links, one per card in order
  const wrapper = block.closest('.section')?.querySelector('.default-content-wrapper');
  const videoLinks = wrapper ? [...wrapper.querySelectorAll('a')] : [];
  if (wrapper && videoLinks.length) wrapper.remove();

  const long = modal('long');
  const short = modal('short');
  const grid = el('div', 'blog-video-slider webinars-noslider');
  rows.forEach((row, i) => {
    const pic = row.querySelector('picture') || row.querySelector('img');
    const link = videoLinks[i] || row.querySelector('a');
    const titleP = [...row.querySelectorAll('p')]
      .find((p) => !p.querySelector('picture, img, a') && p.textContent.trim()) || null;
    const titleText = titleP ? titleP.textContent.trim() : '';
    const play = el('button', 'play-btn video-play-trigger', el('span', 'icon-play'), el('span', 'sr-only', 'Play video'));
    play.type = 'button';
    play.setAttribute('aria-label', `Play ${titleText}`);
    if (link) {
      const { href } = link;
      play.addEventListener('click', () => {
        (/\/shorts\//.test(href) ? short : long).open(embed(href), titleText);
      });
      play.dataset.videoUrl = href;
      link.classList.remove('button', 'primary', 'secondary');
      link.classList.add('blog-video-link');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        play.click();
      });
    }
    const img = el('div', 'blog-img', ...(pic ? [pic] : []), el('div', 'video-overlay', play));
    const content = el('div', 'blog-content', ...(titleP ? [titleP] : []));
    const linkP = link && link.closest('p');
    if (linkP) {
      // the authored video link paragraph moves in with its card (visually hidden; the
      // play button and the card title open it)
      linkP.className = 'sr-only';
      content.append(linkP);
    }
    if (titleP && link) titleP.addEventListener('click', () => play.click());
    grid.append(el('div', 'blog-slider-col', el('div', 'blog-sliders', img, content)));
  });

  const section = el(
    'section',
    'blog-video-box most-viewed mg-b25 csr-videos',
    el('div', 'container mob-lr-15', headView, grid),
  );
  section.id = 'videos';
  const out = [el('div', 'csr-videos', section, long, short)];
  const cta = ctaRow && ctaRow.querySelector('a');
  if (cta) {
    cta.className = 'text-center btn-blue btn-big';
    const p = cta.closest('p') || el('p', '', cta);
    p.className = '';
    out.push(el('div', 'white-blue-button-row', el('div', 'white-blue-button button', p)));
  }
  block.replaceChildren(...out);
}
