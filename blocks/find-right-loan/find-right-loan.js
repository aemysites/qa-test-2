/**
 * find-right-loan — "Different Types of …" tabbed band (source `find-right-loan-box` /
 * `who-can-take-loan-tabs`): centred <h2>, a vertical tab list on the left and the active
 * panel (title, copy, Know More button, illustration) on the right.
 * Schema: stardust/eds-schema/personal-loan.json → sections[find-right-loan-box].
 * Decode tier: reconstructive (one row per tab).
 *
 * Authoring rows: 1. <h2> (<strong> tail) · 2..N. tab label <p> or <h3> | <h3> title (or a
 * <p><strong> title as the home-loan source), copy (<p>, lists),
 * <p><strong><a>Know More</a></strong></p> | picture.
 * Tabs are role=tab <h3>s (as the source) around the moved label (EW7: no <button>).
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.append(...kids.filter(Boolean));
  return n;
}

let uid = 0;

export default function decorate(block) {
  uid += 1;
  const rows = [...block.children];
  const heading = block.querySelector('h2');
  const tabRows = rows.filter((r) => r.children.length >= 2);
  const list = el('div', 'cmp-tabs__tablist tab-left');
  list.setAttribute('role', 'tablist');
  const wrap = el('div', 'tab-content-wrap');
  const tabs = [];
  const panels = [];
  tabRows.forEach((r, i) => {
    const [labelCell, bodyCell, picCell] = [...r.children];
    const id = `frl-${uid}-${i}`;
    const lead = labelCell.firstElementChild;
    const tab = lead && /^H[1-6]$/.test(lead.tagName) ? lead
      : el('h3', '', ...labelCell.childNodes);
    tab.classList.add('cmp-tabs__tab', 'tablinks', 'has-arrow', 'tabScrollCenter');
    tab.id = `${id}-tab`;
    tab.setAttribute('role', 'tab');
    tab.tabIndex = i ? -1 : 0;
    tab.setAttribute('aria-controls', `${id}-panel`);
    const first = bodyCell.firstElementChild;
    const strongTitle = first && first.tagName === 'P' && first.children.length === 1
      && first.firstElementChild.tagName === 'STRONG' && first.textContent.trim() === first.firstElementChild.textContent.trim();
    const h3 = bodyCell.querySelector('h3') || (strongTitle ? first : null);
    if (h3) h3.classList.add('heading20');
    const ps = [...bodyCell.children].filter((n) => n !== h3);
    const cta = ps.find((p) => p.querySelector('a') && p.textContent.trim() === p.querySelector('a').textContent.trim());
    const desc = ps.filter((p) => p !== cta);
    const teaser = el('div', 'right-loan-tabs', h3, el('div', 'cmp-teaser__description', ...desc));
    if (cta) {
      const a = cta.querySelector('a');
      a.className = 'btn-blue btn-large';
      teaser.append(el('div', 'cmp-container', el('div', 'white-blue-button button', cta)));
    }
    const pic = (picCell || bodyCell).querySelector('picture');
    if (pic) {
      const img = pic.querySelector('img');
      if (img) img.classList.add('desktop-img');
    }
    const panel = el('div', 'cmp-tabs__tabpanel tab-content', el(
      'div',
      'find-right-loan-box-teaser teaser',
      teaser,
      pic ? el('div', 'right-loan-img', el('div', 'img-wrapper', pic)) : null,
    ));
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    list.append(tab);
    wrap.append(panel);
    tabs.push(tab);
    panels.push(panel);
  });
  const select = (i) => {
    tabs.forEach((t, j) => {
      t.classList.toggle('cmp-tabs__tab--active', i === j);
      t.setAttribute('aria-selected', String(i === j));
      t.tabIndex = i === j ? 0 : -1;
      panels[j].classList.toggle('cmp-tabs__tabpanel--active', i === j);
      panels[j].hidden = i !== j;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') tabs[(i + 1) % tabs.length].focus();
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') tabs[(i - 1 + tabs.length) % tabs.length].focus();
    });
  });
  if (tabs.length) select(0);
  if (heading) heading.classList.add('text-center', 'heading36');
  block.replaceChildren(el('div', 'who-can-take-loan', el('section', 'find-right-loan-box space-tb40', el(
    'div',
    'container',
    heading ? el('div', 'tops-heads', el('div', 'component-title title', el('div', 'container', heading))) : null,
    el('div', 'who-can-take-loan-tabs tabs panelcontainer', el('div', 'cmp-tabs find-right-loan-tabs', list, wrap)),
  ))));
}
