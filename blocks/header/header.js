import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Tata Capital header — template-slotted chrome (replica of the gated prototype header).
 *
 * The authored /nav document carries the content, one section per role:
 *   1. top bar: promo paragraph (with its link), icon links (one paragraph each), language list
 *   2. brand: the logo image linked to the home page
 *   3. menu: top-level items; a nested list is either the mega-menu tab rail (every item a link
 *      with its own nested panel list) or the groups of one tab-less panel
 *   4. tools: search label, offers, sign in, login — label first, then the dropdown content
 *   5. mobile drawer: default content (links and nested lists)
 * The block MOVES the authored nodes into the prototype's chrome DOM (same class names, so the
 * canon rules in header.css apply) and ports the prototype behaviour (affix on scroll, hover/focus
 * mega menus with a tab rail, click dropdowns, mobile drawer).
 *
 * @ew-exempt <ul> language list (section 1) — rendered as native <select> options
 */

const DESKTOP = window.matchMedia('(width >= 992px)');

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

const glyph = (name, extra = '') => el('span', {
  class: `icon-${name}${extra ? ` ${extra}` : ''}`,
  'aria-hidden': 'true',
});

/** authored :icon: spans render through the icon font, not /icons/*.svg */
function toGlyphs(root) {
  root.querySelectorAll('span.icon').forEach((span) => {
    span.querySelectorAll('img').forEach((img) => img.remove());
    span.classList.remove('icon');
    span.setAttribute('aria-hidden', 'true');
  });
}

const wrapOf = (section) => (section && (section.querySelector('.default-content-wrapper')
  || section)) || el('div');

/** the trigger link of a list item: `li > a` (authored) or `li > p > a` (delivered, #98) */
function triggerOf(li) {
  const a = li.querySelector(':scope > a, :scope > p > a');
  if (!a) return null;
  const p = a.parentElement;
  const alone = p.children.length === 1 && p.textContent.trim() === a.textContent.trim();
  if (p.tagName === 'P' && alone) {
    p.replaceWith(a);
  }
  return a;
}

/** the label nodes in front of an item's nested content (text, or the first paragraph) */
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
  const stop = (n) => n.nodeType === 1 && /^(UL|OL|DIV|P)$/.test(n.tagName);
  while (li.firstChild && !stop(li.firstChild)) frag.append(li.firstChild);
  return frag;
}

const textOf = (frag) => frag.textContent.replace(/\s+/g, ' ').trim();

function fillPanel(panel, list) {
  const inner = el('div');
  [...list.children].forEach((item) => {
    const group = el('div');
    group.append(...item.childNodes);
    inner.append(group);
  });
  panel.append(inner);
  list.remove();
}

/** a link alone (bare, or alone in its paragraph) */
function linkOnly(node) {
  if (!node) return false;
  if (node.tagName === 'A') return true;
  const a = node.tagName === 'P' && node.children.length === 1 && node.querySelector(':scope > a');
  return !!a && node.textContent.trim() === a.textContent.trim();
}

/** a mega-menu tab: its link alone, optionally followed by its panel list */
function isTab(item) {
  const kids = [...item.children];
  return kids.length >= 1 && kids.length <= 2 && linkOnly(kids[0])
    && (kids.length === 1 || kids[1].tagName === 'UL');
}

function buildMega(sub) {
  const mega = el('div', { class: 'mega', hidden: true });
  const items = [...sub.children];
  const tabsMode = items.length > 0 && items.every(isTab);
  const panels = el('div', { class: 'mega__panels' });
  if (tabsMode) {
    sub.className = 'mega__tabs';
    items.forEach((it, i) => {
      const a = triggerOf(it);
      a.classList.add('mega__tab');
      if (i === 0) a.classList.add('is-active');
      const panel = el('div', { class: 'mega__panel', hidden: i > 0 });
      const list = it.querySelector(':scope > ul');
      if (list) fillPanel(panel, list);
      panels.append(panel);
    });
    mega.append(sub, panels);
  } else {
    const panel = el('div', { class: 'mega__panel' });
    fillPanel(panel, sub);
    panels.append(panel);
    mega.append(panels);
  }
  return mega;
}

function buildTopBar(wrap) {
  const left = el('div', { class: 'left-col' });
  const right = el('div', { class: 'right-col' });
  const paras = [...wrap.querySelectorAll(':scope > p')];
  paras.forEach((p) => {
    const a = p.querySelector('a');
    const iconLink = a && p.textContent.trim() === a.textContent.trim();
    if (!iconLink && !left.children.length) {
      p.classList.add('header-top-text');
      if (a) a.classList.add('text-downloads');
      p.querySelectorAll('[class^="icon-"]').forEach((g) => g.classList.add('download2icon'));
      left.append(p);
    } else if (a) {
      a.classList.add('text-icon-link');
      right.append(p);
    }
  });
  const langs = wrap.querySelector(':scope > ul');
  if (langs) {
    const select = el('select', {
      class: 'text-icon-link language-dropdown',
      id: 'P9LngDdl',
      'aria-label': 'Select language',
    });
    [...langs.children].forEach((li) => select.append(el('option', {}, li.textContent.trim())));
    right.append(el('div', { class: 'lang-wrap' }, select));
  }
  return el(
    'div',
    { class: 'header-top' },
    el(
      'div',
      { class: 'header-container' },
      el('div', { class: 'header-slider-contact-wrap' }, left, right),
    ),
  );
}

function buildLogo(wrap) {
  const burger = el(
    'button',
    {
      type: 'button',
      class: 'hamburger-menu',
      'aria-label': 'Open navigation menu',
      'aria-expanded': 'false',
    },
    el('span'),
    el('span'),
    el('span'),
  );
  const logo = el('div', { class: 'header-logo' }, burger);
  const a = wrap.querySelector('a');
  if (a) {
    const p = a.closest('p');
    a.classList.add('logos');
    logo.append(a);
    if (p && !p.textContent.trim() && !p.querySelector('img, picture')) p.remove();
  }
  return logo;
}

function buildMenu(wrap) {
  const ul = wrap.querySelector(':scope > ul') || el('ul');
  ul.className = 'header-menu';
  [...ul.children].forEach((li) => {
    li.className = 'menu-item';
    const sub = li.querySelector(':scope > ul');
    let trig = triggerOf(li);
    if (!trig) {
      trig = el('span', { class: 'nav-link' });
      trig.append(takeLabel(li));
      if (sub) {
        trig.setAttribute('role', 'button');
        trig.setAttribute('tabindex', '0');
      }
      li.prepend(trig);
    }
    trig.classList.add('nav-link');
    if (sub) {
      trig.classList.add('nav-link-dropdown');
      trig.setAttribute('aria-haspopup', 'true');
      trig.setAttribute('aria-expanded', 'false');
      li.append(buildMega(sub));
    }
  });
  return el('nav', { class: 'header-menu-wrap', 'aria-label': 'Main navigation' }, ul);
}

function buildTools(wrap) {
  // campaign navs (CSR) author a brand image instead of the tools list: right-hand logo slot
  const brandPic = !wrap.querySelector(':scope > ul') && wrap.querySelector('picture, img');
  if (brandPic) {
    return el(
      'div',
      { class: 'login-search-wrap csr-login-search-wrap' },
      el('div', { class: 'csr-logo' }, brandPic),
    );
  }
  const ul = wrap.querySelector(':scope > ul') || el('ul');
  ul.className = 'login-search-menu';
  const [search, offers, signin, login] = [...ul.children];
  const icons = `${window.hlx.codeBasePath}/icons`;
  if (search) {
    search.className = 'login-search-item';
    const label = takeLabel(search);
    const btn = el(
      'button',
      { type: 'button', class: 'sf-hs-bar', 'aria-label': 'Open Smart Search' },
      el(
        'span',
        { class: 'sf-eva-icon' },
        el('img', { class: 'sf-eva-search', src: `${icons}/sf-eva-search.svg`, alt: '' }),
        el('img', { class: 'sf-eva-star', src: `${icons}/sf-eva-star.svg`, alt: '' }),
      ),
      el('span', { class: 'sf-hs-placeholder' }, label),
    );
    // interim Smart Search panel: the authored quick actions + a search box whose submit opens
    // the source site, where the vendor widget lives (dynamics row chrome-search, owner decides)
    const input = el('input', {
      type: 'search',
      class: 'sf-search-input',
      name: 'q',
      placeholder: textOf(btn.querySelector('.sf-hs-placeholder')) || 'Search',
      'aria-label': 'Search',
    });
    const close = el(
      'button',
      { type: 'button', class: 'sf-search-close', 'aria-label': 'Close search' },
      glyph('close'),
    );
    const form = el('form', { class: 'sf-search-form', role: 'search' }, input, close);
    const panel = el('div', { class: 'sf-search-panel', hidden: true }, form);
    panel.append(...search.childNodes);
    const wrapper = el('div', { class: 'sf-search-wrapper', 'aria-label': 'Site Search' }, btn);
    search.replaceChildren(wrapper, panel);
  }
  if (offers) {
    offers.className = 'login-search-item search-icon-wrap';
    const label = takeLabel(offers);
    const name = textOf(label);
    const dd = el('div', { class: 'dropdown-block', hidden: true });
    dd.append(el('div', {}, el('p', {}, label), el('div', {}, glyph('close'))));
    dd.append(...offers.childNodes);
    offers.replaceChildren(
      el(
        'button',
        { type: 'button', class: 'notification-wrap', 'aria-label': name },
        glyph('bell'),
      ),
      dd,
    );
  }
  if (signin) {
    signin.className = 'login-search-item';
    const label = takeLabel(signin);
    const dd = el('div', { class: 'dropdown-block signin-dropdown', hidden: true });
    dd.append(...signin.childNodes);
    signin.replaceChildren(
      el(
        'button',
        { type: 'button', class: 'google-wrap' },
        glyph('google'),
        el('span', { class: 'sr-only' }, label),
      ),
      dd,
    );
  }
  if (login) {
    login.className = 'login-search-item login-btn-wrap';
    const label = takeLabel(login);
    const name = textOf(label);
    const dd = el('div', { class: 'dropdown-block login-dropdown', hidden: true });
    dd.append(...login.childNodes);
    login.replaceChildren(
      el('button', { type: 'button', class: 'user-icon', 'aria-label': name }, glyph('user')),
      el('div', { class: 'login-btn', tabindex: '0', role: 'button' }, label),
      dd,
    );
  }
  return el('div', { class: 'login-search-wrap' }, ul);
}

function buildDrawer(wrap, triggers) {
  // a group title without a link (Investment, Apply) is a "#" trigger in the prototype drawer
  wrap.querySelectorAll(':scope > p').forEach((p) => {
    if (p.querySelector('a') || !triggers.includes(p.textContent.trim())) return;
    const a = el('a', { href: '#' });
    a.append(...p.childNodes);
    p.append(a);
  });
  const inner = el('div');
  inner.append(...wrap.childNodes);
  return el(
    'div',
    { class: 'mob-drawer', hidden: true },
    el('nav', { class: 'mob-drawer__inner', 'aria-label': 'Mobile navigation' }, inner),
  );
}

function setOpen(li, open) {
  li.classList.toggle('is-open', open);
  const t = li.querySelector(':scope > .nav-link-dropdown');
  if (t) t.setAttribute('aria-expanded', String(open));
}

function wireMenus(menu) {
  menu.querySelectorAll(':scope > .menu-item').forEach((li) => {
    const mega = li.querySelector(':scope > .mega');
    if (!mega) return;
    const trig = li.querySelector(':scope > .nav-link');
    li.addEventListener('mouseenter', () => { if (DESKTOP.matches) setOpen(li, true); });
    li.addEventListener('mouseleave', () => { if (DESKTOP.matches) setOpen(li, false); });
    let quiet = false;
    li.addEventListener('focusin', () => { if (!quiet) setOpen(li, true); });
    li.addEventListener('focusout', (e) => {
      if (!li.contains(e.relatedTarget)) setOpen(li, false);
    });
    li.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      setOpen(li, false);
      quiet = true;
      trig.focus();
      quiet = false;
    });
    if (trig.tagName !== 'A') {
      const toggle = () => setOpen(li, !li.classList.contains('is-open'));
      trig.addEventListener('click', toggle);
      trig.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    }
    const tabs = mega.querySelectorAll('.mega__tab');
    const panels = mega.querySelectorAll('.mega__panel');
    tabs.forEach((tab, i) => {
      const show = () => {
        tabs.forEach((x) => x.classList.remove('is-active'));
        tab.classList.add('is-active');
        panels.forEach((p, j) => { p.hidden = j !== i; });
      };
      tab.addEventListener('mouseenter', show);
      tab.addEventListener('focus', show);
    });
  });
}

function wireDropdowns(tools) {
  const items = [...tools.querySelectorAll('.login-search-item')];
  const closeAll = () => items.forEach((o) => {
    o.classList.remove('is-open');
    o.querySelectorAll('[aria-expanded]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  });
  items.forEach((li) => {
    const dd = li.querySelector('.dropdown-block');
    if (!dd) return;
    const triggers = li.querySelectorAll(':scope > button, :scope > .login-btn');
    triggers.forEach((b) => {
      b.setAttribute('aria-expanded', 'false');
      const toggle = (e) => {
        e.stopPropagation();
        const open = !li.classList.contains('is-open');
        closeAll();
        li.classList.toggle('is-open', open);
        b.setAttribute('aria-expanded', String(open));
      };
      b.addEventListener('click', toggle);
      if (b.tagName !== 'BUTTON') {
        b.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle(e);
          }
        });
      }
    });
    dd.addEventListener('click', (e) => e.stopPropagation());
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && li.classList.contains('is-open')) {
        closeAll();
        triggers[0].focus();
      }
    });
  });
  document.addEventListener('click', closeAll);
}

function wireSearch(tools) {
  const item = tools.querySelector('.sf-search-wrapper');
  const panel = tools.querySelector('.sf-search-panel');
  if (!item || !panel) return;
  const btn = item.querySelector('.sf-hs-bar');
  const input = panel.querySelector('input');
  const set = (open) => {
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    // the full-screen panel below the desktop step locks page scroll, as the source does
    document.body.style.overflow = open && !DESKTOP.matches ? 'hidden' : '';
    if (open) input.focus();
  };
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    set(panel.hidden);
  });
  panel.addEventListener('click', (e) => e.stopPropagation());
  panel.querySelector('.sf-search-close').addEventListener('click', () => {
    set(false);
    btn.focus();
  });
  panel.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    window.location.href = 'https://www.tatacapital.com/';
  });
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      set(false);
      btn.focus();
    }
  });
  document.addEventListener('click', () => { if (!panel.hidden) set(false); });
}

function wireDrawer(burger, drawer) {
  const set = (open) => {
    drawer.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  };
  burger.addEventListener('click', () => set(drawer.hidden));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) {
      set(false);
      burger.focus();
    }
  });
  DESKTOP.addEventListener('change', () => set(false));
}

/* scroll morph — the source header_fixed(): affix once scrollY >= .header-top height and pad
   the header section by navbar + top heights so the page does not jump */
function wireAffix(section, inner, top, navbar) {
  let navH = 0;
  const onScroll = () => {
    const th = top.offsetHeight;
    // a page that cannot scroll past the whole header never affixes (nothing to keep in view)
    const range = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= th && th > 0 && range > inner.offsetHeight) {
      if (!inner.classList.contains('affix')) {
        navH = navbar.offsetHeight;
        inner.classList.add('affix');
        section.style.paddingTop = `${navH + th}px`;
      }
    } else if (inner.classList.contains('affix')) {
      inner.classList.remove('affix');
      section.style.paddingTop = '0px';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    inner.classList.remove('affix');
    section.style.paddingTop = '0px';
    onScroll();
  });
  onScroll();
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;
  toGlyphs(fragment);

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const [topWrap, brandWrap, menuWrap, toolsWrap, drawerWrap] = [0, 1, 2, 3, 4]
    .map((i) => wrapOf(sections[i]));

  const top = buildTopBar(topWrap);
  const logo = buildLogo(brandWrap);
  const menu = buildMenu(menuWrap);
  const tools = buildTools(toolsWrap);
  const triggers = [...menu.querySelectorAll('.menu-item > span.nav-link-dropdown')]
    .map((t) => t.textContent.trim());
  const drawer = buildDrawer(drawerWrap, triggers);

  const navbar = el(
    'div',
    { class: 'header-navbar' },
    el(
      'div',
      { class: 'header-container' },
      el('div', { class: 'header-navbar-inner' }, logo, menu, tools),
    ),
  );
  const inner = el('div', { class: 'header-inner' }, top, navbar);
  const section = el('div', { class: 'header-section', id: 'headerStactionEF' }, inner, drawer);
  block.replaceChildren(section);

  wireMenus(menu.querySelector('.header-menu'));
  wireDropdowns(tools);
  wireSearch(tools);
  wireDrawer(logo.querySelector('.hamburger-menu'), drawer);
  wireAffix(section, inner, top, navbar);
}
