import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Tata Capital footer — template-slotted chrome (replica of the gated prototype footer).
 *
 * The authored /footer document carries the content, one section per band:
 *   1. top links (list)
 *   2. other websites: heading paragraph + link list, per group
 *   3. policies: heading paragraph + tab list per group; a tab item is a label with a nested
 *      panel list (items with their own nested list render as titled groups), or a bare link
 *   4. follow: logo link, app-store links (per app), a "Follow Us" heading, social links
 *   5. copyright: legal link list + copyright paragraph
 * The block MOVES the authored nodes into the prototype's footer DOM (same class names, so the
 * canon rules in footer.css apply) and ports the tab panels + mobile accordions.
 *
 * @ew-exempt <span> tab-accordian titles (section 3) — presentational copies of the tab labels,
 *   shown only below 768px where the tab rail is hidden (instrumentation stripped, EW4)
 */

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'hidden') node.hidden = v;
    else node.setAttribute(k, v);
  });
  node.append(...children.filter(Boolean));
  return node;
}

const container = (...children) => el('div', { class: 'footer-container' }, ...children);
const wrapOf = (section) => (section && (section.querySelector('.default-content-wrapper')
  || section)) || el('div');

function stripInstrumentation(node) {
  [node, ...node.querySelectorAll('*')].forEach((n) => {
    if (n.nodeType !== 1) return;
    [...n.attributes].forEach((a) => {
      if (/^data-(prose|image|block)-index$/.test(a.name)) n.removeAttribute(a.name);
    });
  });
  return node;
}

/** label nodes in front of a list item's nested list (bare text, or its first paragraph) */
function takeLabel(li) {
  const frag = document.createDocumentFragment();
  const first = li.firstElementChild;
  let lead = '';
  for (let n = li.firstChild; n && n !== first; n = n.nextSibling) lead += n.textContent;
  if (first && first.tagName === 'P' && !lead.trim()) {
    frag.append(...first.childNodes);
    first.remove();
    return frag;
  }
  const stop = (n) => n.nodeType === 1 && /^(UL|OL)$/.test(n.tagName);
  while (li.firstChild && !stop(li.firstChild)) {
    frag.append(li.firstChild);
  }
  return frag;
}

/** pairs each heading paragraph with the list that follows it */
function pairs(wrap) {
  const out = [];
  [...wrap.children].forEach((child) => {
    if (child.tagName === 'P') out.push({ head: child, list: null });
    else if (/^(UL|OL)$/.test(child.tagName) && out.length && !out[out.length - 1].list) {
      out[out.length - 1].list = child;
    }
  });
  return out.filter((g) => g.list);
}

function buildTopBox(wrap) {
  const ul = wrap.querySelector('ul') || el('ul');
  return el('div', { class: 'footer-top-box' }, container(ul));
}

function buildOtherWebsites(wrap) {
  const row = el('div', { class: 'row-flex' });
  pairs(wrap).forEach(({ head, list }) => {
    const heading = el('div', {
      class: 'footer-headings',
      role: 'button',
      tabindex: '0',
      'aria-expanded': 'false',
    }, head);
    list.className = 'footer-links';
    const panel = el('div', { class: 'accordian-panel' }, heading, list);
    row.append(el('div', { class: 'row-col-50' }, panel));
  });
  return el('div', { class: 'our-other-websites' }, container(row));
}

function buildPanel(panelList, index) {
  const panel = el('div', { class: 'tab-panel', 'data-panel': String(index), hidden: true });
  if (!panelList) return panel;
  const items = [...panelList.children];
  const grouped = items.length > 0 && items.every((it) => it.querySelector(':scope > ul'));
  if (grouped) {
    items.forEach((it) => {
      const group = el('div');
      group.append(...it.childNodes);
      panel.append(group);
    });
    panelList.remove();
  } else {
    panel.append(panelList);
  }
  return panel;
}

function buildPolicies(wrap) {
  const main = container();
  pairs(wrap).forEach(({ head, list }) => {
    head.classList.add('footer-headings');
    const content = el('div', { class: 'tab-content' });
    list.className = 'tablist-nav';
    [...list.children].forEach((li, i) => {
      const nested = li.querySelector(':scope > ul');
      const link = !nested && li.querySelector('a');
      let control;
      let title;
      if (link) {
        const p = link.parentElement;
        if (p.tagName === 'P') p.replaceWith(link);
        link.className = 'nav-link link-no-tabs';
        control = link;
        title = stripInstrumentation(link.cloneNode(true));
        title.removeAttribute('class');
      } else {
        const label = takeLabel(li);
        control = el('button', {
          type: 'button',
          class: 'nav-link',
          'aria-expanded': 'false',
          'data-panel': String(i),
        }, label);
        const copies = [...control.childNodes].map((n) => n.cloneNode(true));
        title = stripInstrumentation(el('span', {}, ...copies));
      }
      const panel = buildPanel(nested, i);
      li.className = 'nav-tablist';
      li.replaceChildren(control);
      content.append(el(
        'div',
        { class: 'accordian-content' },
        el('div', { class: 'tab-accordian' }, title),
        panel,
      ));
    });
    main.append(el(
      'div',
      { class: 'top-outer-policies' },
      head,
      el('div', { class: 'policies-tabnav' }, list, content),
    ));
  });
  return el('div', { class: 'footer-main-content' }, main);
}

function buildFollow(wrap) {
  const outer = el('div', { class: 'follow-left-outer' });
  const right = el('div', { class: 'follow-right follow-3' });
  let col = null;
  let afterHeading = false;
  [...wrap.children].forEach((child) => {
    if (/^H[1-6]$/.test(child.tagName)) {
      child.classList.add('heading14');
      right.append(child);
      afterHeading = true;
      return;
    }
    if (child.tagName !== 'P') return;
    const links = child.querySelectorAll('a');
    if (afterHeading) {
      right.append(el('div', { class: 'socal-lists' }, child));
    } else if (links.length === 1) {
      const logo = el('div', { class: 'follow-logo' }, child);
      col = el('div', { class: 'follow-left follow-3' }, logo);
      outer.append(col);
    } else if (col) {
      col.append(el('div', { class: 'follow-app-store' }, child));
    }
  });
  outer.append(right);
  return el(
    'div',
    { class: 'footer-follow-box' },
    container(el('div', { class: 'footer-follow-inner' }, outer)),
  );
}

function buildCopyright(wrap) {
  const ul = wrap.querySelector('ul');
  const p = wrap.querySelector('p');
  return el('div', { class: 'copyright-box' }, container(el(
    'div',
    { class: 'copyright-inner' },
    ul && el('div', { class: 'copyright-links' }, ul),
    p && el('div', { class: 'copyright-text' }, p),
  )));
}

function wireTabs(root) {
  root.querySelectorAll('.policies-tabnav').forEach((nav) => {
    const btns = [...nav.querySelectorAll('.tablist-nav button.nav-link')];
    const panels = [...nav.querySelectorAll('.tab-panel')];
    const titles = [...nav.querySelectorAll('.tab-accordian')];
    const show = (i, open) => {
      panels.forEach((p) => { p.hidden = true; });
      btns.forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
        b.parentElement.classList.remove('active');
      });
      titles.forEach((t) => t.classList.remove('active'));
      if (!open) return;
      panels[i].hidden = false;
      titles[i].classList.add('active');
      const b = btns.find((x) => +x.dataset.panel === i);
      if (b) {
        b.setAttribute('aria-expanded', 'true');
        b.parentElement.classList.add('active');
      }
    };
    btns.forEach((b) => {
      b.addEventListener('click', () => {
        const i = +b.dataset.panel;
        show(i, panels[i].hidden);
      });
    });
    titles.forEach((t, i) => {
      if (t.querySelector('a')) return;
      t.setAttribute('role', 'button');
      t.setAttribute('tabindex', '0');
      const toggle = () => show(i, panels[i].hidden);
      t.addEventListener('click', toggle);
      t.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  });
  root.querySelectorAll('.our-other-websites .footer-headings').forEach((h) => {
    const toggle = () => {
      const ul = h.nextElementSibling;
      const open = getComputedStyle(ul).display === 'none';
      ul.style.display = open ? 'flex' : '';
      h.setAttribute('aria-expanded', String(open));
    };
    h.addEventListener('click', toggle);
    h.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const [top, other, policies, follow, copyright] = [0, 1, 2, 3, 4].map((i) => wrapOf(sections[i]));

  const inner = el(
    'div',
    { class: 'footer-inner' },
    buildTopBox(top),
    buildOtherWebsites(other),
    buildPolicies(policies),
    buildFollow(follow),
    buildCopyright(copyright),
  );
  block.replaceChildren(inner);
  wireTabs(inner);
}
