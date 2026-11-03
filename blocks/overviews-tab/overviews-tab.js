/**
 * overviews-tab — the source `overviews-tab-box` sub-navigation bar under the page banner:
 * a "Back" link on the left and an apply / check CTA on the right (hidden ≤767px).
 * Schema: stardust/eds-schema/check-credit-score.json → sections[overviews-tab-box].
 * Decode tier: template-slotted.
 *
 * Authoring (one row, cells in any order — classified by content):
 *   - back link: <p><a href="…">Back</a></p> (plain link)
 *   - CTA: <p><strong><a href="…">Check Free <em>Credit Score</em></a></strong></p> — the
 *     <em> part is the tail the source hides on tablet widths
 * Variant `nav` (program pages, source `overviews-tab` link bar): cell 1 is a <ul> of page
 * links (first = current page); an item holding a label + nested <ul> renders as a hover
 * sub-menu. The CTA stays visible on mobile and a "current page" toggle opens the list there.
 * @ew-exempt derived — the mobile toggle label repeats the first (current) nav item
 * Out of scope (not rendered): the source's mobile apply journey popups (OTP, consent,
 * thank-you) — hidden at rest; the CTA navigates to its href.
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

function buildNav(ul) {
  ul.className = 'overviews-link';
  [...ul.children].forEach((li, i) => {
    if (i === 0) li.classList.add('active');
    const sub = li.querySelector(':scope > ul');
    if (!sub) return;
    const label = el('span', 'link-submenu sub-nav-js-void');
    label.setAttribute('role', 'button');
    label.tabIndex = 0;
    label.append(...[...li.childNodes].filter((n) => n !== sub));
    li.replaceChildren(label, el('div', 'overview-sub-menu', sub));
  });
  const nav = el('nav', 'overviews-tab', ul);
  nav.setAttribute('aria-label', 'Section navigation');
  const first = ul.querySelector('li');
  const toggle = el('a', 'overviews-links jsMobOverviewsLink');
  toggle.setAttribute('role', 'button');
  toggle.tabIndex = 0;
  toggle.textContent = first ? first.textContent.trim() : '';
  const mob = el('div', 'mob-overviews-tab close-on-outside', toggle);
  toggle.addEventListener('click', () => mob.classList.toggle('active'));
  return [nav, mob];
}

export default function decorate(block) {
  if (block.classList.contains('nav')) {
    const ul = block.querySelector('ul');
    const navParts = ul ? buildNav(ul) : [];
    const strongA = [...block.querySelectorAll('a')].find((a) => !a.closest('ul')
      && (a.closest('strong, em') || a.classList.contains('button')));
    const row = el('div', 'overviews-row', ...navParts);
    if (strongA) {
      strongA.classList.remove('button', 'primary', 'secondary');
      strongA.classList.add('btn-blue', 'animated-btn');
      const p = strongA.closest('p');
      if (p) p.classList.remove('button-wrapper');
      row.append(el('div', 'apply-over-btn subnav-desktop d-block d-lg-block', el('div', 'subnav-desktop-cta', p || strongA)));
    }
    const section = el('section', 'overviews-tab-box js-floating', el('div', 'custom-container', el('div', 'np-inner', row)));
    block.replaceChildren(el('div', 'sub-nav', el('div', 'overview-top-space', section)));
    return;
  }
  const links = [...block.querySelectorAll('a')];
  const cta = links.find((a) => a.closest('strong') || a.classList.contains('button'));
  const back = links.find((a) => a !== cta);

  const row = el('div', 'overviews-row');
  if (back) row.append(el('div', 'backtolinks', back.closest('p') || back));
  if (cta) {
    cta.classList.remove('button', 'primary', 'secondary');
    cta.classList.add('btn-blue', 'animated-btn');
    const p = cta.closest('p');
    if (p) p.classList.remove('button-wrapper');
    row.append(el(
      'div',
      'apply-over-btn subnav-desktop d-block d-lg-block hide-on-mobile',
      el('div', 'subnav-desktop-cta', p || cta),
    ));
  }
  const section = el(
    'section',
    'overviews-tab-box js-floating',
    el('div', 'custom-container', el('div', 'np-inner', row)),
  );
  block.replaceChildren(el('div', 'sub-nav', el('div', 'overview-top-space', section)));
}
