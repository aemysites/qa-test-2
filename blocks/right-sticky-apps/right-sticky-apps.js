/**
 * right-sticky-apps — the source `right-sticky-apps` rail: vertical store badges fixed to the
 * right edge of the viewport.
 * Schema: stardust/eds-schema/home-loan-app.json (fixed layer, outside the section flow).
 * Decode tier: template-slotted.
 *
 * Authoring (one cell): a paragraph of linked badge images (`<a><img></a>` pairs).
 */

export default function decorate(block) {
  const links = [...block.querySelectorAll('a')].filter((a) => a.querySelector('img, picture'));
  const rail = document.createElement('div');
  rail.className = 'right-sticky-apps';
  links.forEach((a) => {
    a.setAttribute('aria-label', (a.querySelector('img') || {}).alt || a.href);
    rail.append(a);
  });
  block.replaceChildren(rail);
}
