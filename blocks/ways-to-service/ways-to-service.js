/**
 * ways-to-service — "Access your loan information" tabs + service option cards (source
 * `ways-to-service-box`). Schema: stardust/eds-schema/index.json → sections[ways-to-service-box].
 * Decode tier: reconstructive (rows classified by shape).
 *
 * Authoring rows:
 *   head row (one cell): <h2> (a <strong> tail renders as its own bold line) + intro <p>
 *   tab rows (first cell text): tab label <p> | panel cell | panel picture
 *     panel cell, in any order: <h2> panel heading; optional QR picture <p> followed by its
 *     caption <p>; description <p>s; <ul>; rating pairs (a "4.6"-style <p> then its
 *     "… REVIEWS" <p>); app-badge <p> (links wrapping images); CTA <p><strong><a>
 *   card rows (first cell a picture): icon picture | <h3> + description <p> + one <p> per
 *     link (tel: links render large with a phone glyph; a link-free <p> after the description
 *     is a sub-label)
 */

const GFX = `${window.hlx?.codeBasePath || ''}/blocks/ways-to-service`;
const RATING = /^\s*\d(\.\d)?\s*$/;

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids);
  return n;
}

function icon(name) {
  const s = el('span', `icon-${name}`);
  s.setAttribute('aria-hidden', 'true');
  return s;
}

function isPic(n) {
  return n.matches('picture, img') || !!n.querySelector('picture, img');
}

function buildPanel(cell, picCell, i) {
  const nodes = [...cell.children];
  const desc = el('div', 'content-decs-wrap');
  const sub = el('div', 'sub-heading');
  let qr = null;
  let ratings = null;
  let apps = null;
  for (let k = 0; k < nodes.length; k += 1) {
    const n = nodes[k];
    const a = n.querySelector('a');
    if (/^H\d$/.test(n.tagName)) {
      desc.append(el('div', 'main-heading', n));
    } else if (isPic(n) && !a) {
      qr = el('div', 'scan-to-downloads', n);
      const cap = nodes[k + 1];
      if (cap && cap.tagName === 'P' && !isPic(cap) && !cap.querySelector('a')) {
        qr.append(el('div', 'scantodownload-text', cap));
        k += 1;
      }
    } else if (a && isPic(n)) {
      apps = el('div', 'mobiles-app-download', n);
    } else if (a) {
      a.classList.remove('button', 'primary', 'secondary', 'accent');
      a.classList.add('btn-blue', 'btn-big');
      n.classList.remove('button-wrapper');
      sub.append(el('div', 'wts-tabs-teaser-button', n));
    } else if (n.tagName === 'P' && RATING.test(n.textContent)) {
      if (!ratings) {
        ratings = el('div', 'ul-ratings');
        sub.append(ratings);
      }
      const value = el('div', 'heading20 semibold rating-value', n, icon('star'));
      const item = el('div', 'li-ratings', value);
      const cap = nodes[k + 1];
      if (cap && cap.tagName === 'P' && !RATING.test(cap.textContent) && !cap.querySelector('a')) {
        item.append(el('div', 'text16i ratings-reviews-txt', cap));
        k += 1;
      }
      ratings.append(item);
    } else {
      sub.append(n);
    }
  }
  if (apps) sub.append(apps);
  if (qr) {
    // the source repeats the QR inside the copy for small screens (hidden by its CSS): a
    // presentational clone, stripped of editor instrumentation (EW4)
    const mob = qr.cloneNode(true);
    mob.classList.add('scan-mob');
    mob.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
      n.removeAttribute('data-prose-index');
      n.removeAttribute('data-image-index');
    });
    sub.prepend(mob);
  }
  desc.append(sub);
  const content = el('div', `tab-content${qr ? ' has-qr' : ''}`, desc);
  const pic = picCell ? picCell.querySelector('picture, img') : null;
  if (pic) content.append(el('div', `default-content-img${qr ? ' img-with-scandownload' : ''}`, pic));
  if (qr) content.append(qr);
  const panel = el('div', 'cmp-tabs__tabpanel', content);
  panel.setAttribute('role', 'tabpanel');
  panel.id = `wts-panel-${i}`;
  if (i) panel.hidden = true;
  return panel;
}

function buildCard(row) {
  const media = row.querySelector('picture, img');
  const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
  const ps = [...row.querySelectorAll('p')].filter((p) => !isPic(p));
  const desc = ps.find((p) => !p.querySelector('a'));
  const head = el('div', 'way-service-options-heading');
  if (media) head.append(el('div', 'img-icons', media));
  if (heading) head.append(el('div', 'heading20', heading));
  const card = el('div', 'way-service-options-card', head);
  if (desc) card.append(el('div', 'wso-desc', desc));
  const links = el('div', 'way-service-options-links');
  ps.filter((p) => p !== desc).forEach((p) => {
    const a = p.querySelector('a');
    p.classList.remove('button-wrapper');
    if (!a) {
      links.append(el('div', 'wso-link wts-sub-label', p));
      return;
    }
    a.classList.remove('button', 'primary', 'secondary', 'accent');
    if (a.href.startsWith('tel:')) {
      a.classList.add('big-text');
      a.prepend(icon('phone-fill'));
    } else {
      a.append(icon('arrow-right'));
    }
    links.append(el('div', 'wso-link', p));
  });
  card.append(links);
  return el('div', 'way-service-options-row', card);
}

export default function decorate(block) {
  const rows = [...block.children];
  const head = el('div', 'tops-heads');
  const tabRows = [];
  const cardRows = [];
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length === 1) {
      head.append(...row.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));
    } else if (cells[0].querySelector('picture, img')) {
      cardRows.push(row);
    } else {
      tabRows.push(row);
    }
  });

  const out = [head];
  if (tabRows.length) {
    const tabList = el('div', 'tab-left');
    tabList.setAttribute('role', 'tablist');
    const panels = el('div', 'tab-content-wrap');
    const tabs = tabRows.map((row, i) => {
      const [labelCell, panelCell, picCell] = [...row.children];
      const label = labelCell.querySelector('p') || labelCell;
      const tab = el('div', `tablinks has-arrow${i ? '' : ' cmp-tabs__tab--active'}`, label);
      tab.setAttribute('role', 'tab');
      tab.tabIndex = 0;
      tab.setAttribute('aria-selected', String(!i));
      tab.setAttribute('aria-controls', `wts-panel-${i}`);
      tabList.append(tab);
      panels.append(buildPanel(panelCell || labelCell, picCell, i));
      return tab;
    });
    const select = (i) => {
      tabs.forEach((t, j) => {
        t.classList.toggle('cmp-tabs__tab--active', j === i);
        t.setAttribute('aria-selected', String(j === i));
      });
      [...panels.children].forEach((p, j) => {
        p.hidden = j !== i;
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select(i);
        }
      });
    });
    const gfx = (cls) => {
      const img = el('img', cls);
      img.src = `${GFX}/${cls}.svg`;
      img.alt = '';
      img.loading = 'lazy';
      return img;
    };
    out.push(el('div', 'custom-tabs', gfx('tab-graphics-top'), gfx('tab-graphics-bottom'), tabList, panels));
  }
  if (cardRows.length) out.push(el('div', 'way-to-service-options', ...cardRows.map(buildCard)));
  block.replaceChildren(el(
    'div',
    'ways-to-service-box space-tb40',
    el('div', 'ways-inner', el('div', 'container', ...out)),
  ));
}
