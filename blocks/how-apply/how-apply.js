/**
 * how-apply — the source `how-apply-box` steps panel: a centred <h2> over a glass box with a
 * vertical tab rail (left) and the active tab's bulleted steps + CTA (right); on tablet and
 * mobile the rail becomes a horizontal row above the panel.
 * Schema: stardust/eds-schema/check-credit-score.json → sections[how-apply-box].
 * Decode tier: reconstructive (one row per tab).
 *
 * Authoring:
 *   1. head — <h2> (<strong> for the bold tail); optional (a heading authored as default
 *      content just before the block is reabsorbed)
 *   2..N. one row per tab — label <p> | panel: steps <ul> (or <p>s) + CTA <p><strong><a>
 * Tabs are focusable role=tab divs wrapping the moved label <p> (EW7: no <button> around
 * authored text); the first tab is active. Enter/Space select, arrow keys move between tabs.
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
  const rows = [...block.children];
  const headRow = rows.find((r) => r.querySelector('h2'));
  let heading = headRow ? headRow.querySelector('h2') : null;
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  if (!heading && prev && prev.classList.contains('default-content-wrapper')) {
    heading = prev.querySelector('h2');
    if (heading) prev.remove();
  }
  const tabRows = rows.filter((r) => r !== headRow && r.children.length >= 2);

  const tablist = el('div', 'cmp-tabs__tablist tab-left');
  tablist.setAttribute('role', 'tablist');
  const contentWrap = el('div', 'tab-content-wrap');
  const tabs = [];
  const panels = [];
  tabRows.forEach((row, i) => {
    const [labelCell, panelCell] = row.children;
    const id = `how-apply-${uid}-${i}`;
    const tab = el('div', 'cmp-tabs__tab tablinks has-arrow tabScrollCenter', ...labelCell.children);
    if (!tab.children.length) tab.append(...labelCell.childNodes);
    tab.id = `${id}-tab`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', id);
    const desc = el('div', 'how-apply-desc');
    [...panelCell.children].forEach((n) => {
      const a = n.tagName === 'P' ? n.querySelector('a') : null;
      if (a && (a.closest('strong, em') || a.classList.contains('button'))) {
        a.classList.remove('button', 'primary', 'secondary');
        a.classList.add('text-center', 'btn-blue', 'btn-big');
        n.classList.remove('button-wrapper');
        desc.append(el('div', 'white-blue-button button', n));
      } else desc.append(n);
    });
    const panel = el('div', 'cmp-tabs__tabpanel tab-content', el('div', 'how-apply-list container', desc));
    panel.id = id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    tablist.append(tab);
    contentWrap.append(panel);
    tabs.push(tab);
    panels.push(panel);
  });

  const select = (i) => {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.classList.toggle('cmp-tabs__tab--active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[j].classList.toggle('cmp-tabs__tabpanel--active', on);
      if (on) panels[j].removeAttribute('aria-hidden');
      else panels[j].setAttribute('aria-hidden', 'true');
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', (e) => {
      e.preventDefault();
      select(i);
    });
    t.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(i);
        return;
      }
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
      const n = (i + step + tabs.length) % tabs.length;
      select(n);
      tabs[n].focus();
    });
  });
  if (tabs.length) select(0);

  const inner = el('div', 'cmp-container');
  if (heading) inner.append(el('div', 'rte title', el('div', 'tc-rte heading-row text-center', heading)));
  inner.append(el(
    'div',
    'who-can-take-loan-tabs tabs panelcontainer',
    el('div', 'cmp-tabs how-apply-tabs', tablist, contentWrap),
  ));
  const section = el(
    'section',
    'how-apply-box space-tb40',
    el('div', 'container', el('div', 'mx-944', el(
      'div',
      'cmp-container',
      // the source's empty head slot: hidden on desktop, a 34–40px spacer up to 991px
      el('div', 'customcontainer container', el('div', 'cmp-container tops-heads')),
      el('div', 'customcontainer container', inner),
    ))),
  );
  block.replaceChildren(el('div', 'who-can-take-loan', section));
}
