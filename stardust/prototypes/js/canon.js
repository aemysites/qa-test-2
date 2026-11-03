/* Tata Capital canon behaviours: header scroll morph (affix), mega menus, header dropdowns,
   mobile drawer, footer tab panels / accordions, sticky actions, short lead form (UI only — no submission). */
(function () {
  'use strict';
  var d = document;

  /* header affix — lifted from the source header_fixed(): affix once scrollTop >= .header-top height,
     and pad the outer header by navbar + top heights so the page does not jump */
  var section = d.querySelector('.header-section');
  var inner = d.querySelector('.header-inner');
  var top = d.querySelector('.header-top');
  var navbar = d.querySelector('.header-navbar');
  if (section && inner && top && navbar) {
    var navH = navbar.offsetHeight;
    var onScroll = function () {
      var th = top.offsetHeight;
      if (window.scrollY >= th) {
        if (!inner.classList.contains('affix')) {
          inner.classList.add('affix');
          section.style.paddingTop = (navH + th) + 'px';
        }
      } else if (inner.classList.contains('affix')) {
        inner.classList.remove('affix');
        section.style.paddingTop = '0px';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { inner.classList.remove('affix'); section.style.paddingTop = '0px'; navH = navbar.offsetHeight; onScroll(); });
    onScroll();
  }

  /* mega menus: hover handled in CSS; keyboard/click opens via .is-open; tab rail switches panels */
  d.querySelectorAll('.header-menu .menu-item').forEach(function (li) {
    var mega = li.querySelector('.mega');
    if (!mega) return;
    li.addEventListener('focusin', function () { li.classList.add('is-open'); });
    li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) li.classList.remove('is-open'); });
    var tabs = mega.querySelectorAll('.mega__tab');
    var panels = mega.querySelectorAll('.mega__panel');
    tabs.forEach(function (t, i) {
      t.addEventListener('mouseenter', function () {
        tabs.forEach(function (x) { x.classList.remove('is-active'); });
        t.classList.add('is-active');
        panels.forEach(function (p, j) { p.hidden = j !== i; });
      });
    });
  });

  /* header dropdowns (offers bell, sign-in, login) — click toggles, outside click closes */
  var items = d.querySelectorAll('.login-search-item');
  items.forEach(function (li) {
    var dd = li.querySelector('.dropdown-block');
    if (!dd) return;
    li.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = !li.classList.contains('is-open');
        items.forEach(function (o) { o.classList.remove('is-open'); });
        li.classList.toggle('is-open', open);
      });
    });
  });
  d.addEventListener('click', function () { items.forEach(function (o) { o.classList.remove('is-open'); }); });

  /* mobile drawer */
  var burger = d.querySelector('.hamburger-menu');
  var drawer = d.querySelector('.mob-drawer');
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = drawer.hidden;
      drawer.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    });
  }

  /* footer: policy tab panels + subsidiary accordions (mobile) */
  d.querySelectorAll('.policies-tabnav').forEach(function (nav) {
    var btns = nav.querySelectorAll('button.nav-link');
    var panels = nav.querySelectorAll('.tab-panel');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.panel;
        var open = panels[i].hidden;
        panels.forEach(function (p) { p.hidden = true; });
        btns.forEach(function (x) { x.setAttribute('aria-expanded', 'false'); x.parentNode.classList.remove('active'); });
        if (open) { panels[i].hidden = false; b.setAttribute('aria-expanded', 'true'); b.parentNode.classList.add('active'); }
      });
    });
  });
  d.querySelectorAll('.our-other-websites .footer-headings').forEach(function (h) {
    h.addEventListener('click', function () {
      var ul = h.nextElementSibling;
      var open = getComputedStyle(ul).display === 'none';
      ul.style.display = open ? 'flex' : '';
      h.setAttribute('aria-expanded', String(open));
    });
  });

  /* sticky actions drawer toggle (mobile) */
  var sa = d.querySelector('[data-sticky-actions]');
  if (sa) {
    var tg = sa.querySelector('.actions-toggle');
    if (tg) tg.addEventListener('click', function () { sa.classList.toggle('active'); });
  }

  /* floating label fields */
  d.querySelectorAll('.form-textbox input').forEach(function (inp) {
    var box = inp.closest('.form-textbox');
    var sync = function () { box.classList.toggle('active', d.activeElement === inp || inp.value !== ''); };
    inp.addEventListener('focus', sync); inp.addEventListener('blur', sync); inp.addEventListener('input', sync);
  });

  /* lazy images — mirrors the source loader: placeholder src, real asset in data-src, swapped once in view */
  var swap = function (img) { if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); } };
  window.tcLazySwap = function (root) { root.querySelectorAll('img[data-src]').forEach(swap); };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { swap(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '200px 0px' });
    d.querySelectorAll('img[data-src]').forEach(function (img) { io.observe(img); });
  } else { window.tcLazySwap(d); }

  /* short lead form — UI validation only; submission is blocked in the prototype */
  d.querySelectorAll('.short-lead-form-fields').forEach(function (f) {
    var inp = f.querySelector('input');
    var err = f.querySelector('.error-msgs');
    inp.addEventListener('input', function () { inp.value = inp.value.replace(/\D/g, '').slice(0, 10); err.textContent = ''; });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      err.textContent = /^[6-9][0-9]{9}$/.test(inp.value) ? '' : 'Please enter a valid mobile number';
    });
  });
})();
