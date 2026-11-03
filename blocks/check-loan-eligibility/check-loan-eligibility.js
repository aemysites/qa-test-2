/**
 * check-loan-eligibility — "Get Instant … with the Best Deals" band (source `best-deals` /
 * `check-loan-eligibility-box`): heading, lede and pre-approved CTA on the left; a theme card
 * (art, bullet points, personalised-offer link) on the right.
 * Schema: stardust/eds-schema/personal-loan.json → sections[check-loan-eligibility-box].
 * Decode tier: template-slotted.
 *
 * Authoring rows: 1. title <p> (<strong> tail; a <h2> also works — the source title is a
 *   styled <span>, not a heading), lede <p>, CTA <p><strong><a>…</a></strong></p>
 * 2. picture | <ul> points, link <p><a>…</a></p>.
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids.filter(Boolean));
  return n;
}

export default function decorate(block) {
  const rows = [...block.children];
  const leftRow = rows.find((r) => !r.querySelector('picture')) || rows[0];
  const rightRow = rows.find((r) => r !== leftRow);
  const left = el('div', 'check-loan-eligibility-box-left');
  const ps = [...leftRow.querySelectorAll('p')];
  const ctaP = ps.find((p) => p.querySelector('strong a, em a, a.button'));
  const title = leftRow.querySelector('h1, h2, h3') || ps.find((p) => p !== ctaP);
  if (title) {
    title.classList.add('heading36', 'best-deals-heading');
    left.append(title);
  }
  const lede = ps.filter((p) => p !== ctaP && p !== title);
  if (lede.length) left.append(el('div', 'cmp-text', ...lede));
  if (ctaP) {
    const a = ctaP.querySelector('a');
    a.className = 'btn-blue btn-large check-pre-approve-btn';
    ctaP.classList.add('check-pre-approve');
    left.append(ctaP);
  }
  const wrap = el('div', 'check-loan-wrap', left);
  if (rightRow) {
    const card = el('div', 'card theme-card');
    const pic = rightRow.querySelector('picture');
    if (pic) {
      const img = pic.querySelector('img');
      if (img) img.classList.add('check-loan-img');
      card.append(pic);
    }
    const body = el('div', 'card-body');
    const ul = rightRow.querySelector('ul');
    if (ul) {
      ul.classList.add('dot-list', 'check-loan-eligibility-points');
      body.append(ul);
    }
    const linkP = [...rightRow.querySelectorAll('p')].find((p) => p.querySelector('a'));
    if (linkP) {
      linkP.querySelector('a').className = 'btn-link btn-big bg-wgite check-eligibility-btn';
      linkP.classList.add('check-eligibility');
      body.append(linkP);
    }
    card.append(body);
    wrap.append(el('div', 'check-loan-eligibility-box-right', card));
  }
  block.replaceChildren(el('div', 'best-deals', el(
    'section',
    'check-loan-eligibility-box space-tb40',
    el('div', 'container', wrap),
  )));
}
