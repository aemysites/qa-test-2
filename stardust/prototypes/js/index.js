/* Home-only behaviours: carousels (hero autoplay, explore, testimonials, insights), ways-to-service tabs,
   EMI calculator (client-only, no network), insight share menus. */
(function () {
  'use strict';
  var d = document;

  /* ---------- carousels: translate the track by whole slides; dots = pages ---------- */
  function carousel(root) {
    var track = root.querySelector('.slick-track');
    var slides = Array.prototype.slice.call(track.children);
    var dots = Array.prototype.slice.call(root.querySelectorAll('.slick-dots li'));
    var prev = root.querySelector('.slick-prev'), next = root.querySelector('.slick-next');
    var idx = 0;
    function perView() {
      var w = slides[0].getBoundingClientRect().width || 1;
      return Math.max(1, Math.round(root.querySelector('.slick-list').clientWidth / w));
    }
    function maxIdx() { return Math.max(0, slides.length - perView()); }
    function go(i) {
      var m = maxIdx();
      idx = Math.max(0, Math.min(i, m));
      track.style.transform = 'translate3d(' + (-slides[0].getBoundingClientRect().width * idx) + 'px,0,0)';
      slides.forEach(function (s, j) {
        var vis = j >= idx && j < idx + perView();
        s.classList.toggle('is-active', vis);
        if (vis) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      });
      var page = dots.length ? Math.min(dots.length - 1, idx) : 0;
      dots.forEach(function (li, j) { li.classList.toggle('slick-active', j === page); });
      if (prev) prev.classList.toggle('slick-disabled', idx === 0 && root.dataset.carousel === 'explore');
      if (next) next.classList.toggle('slick-disabled', idx === m && root.dataset.carousel === 'explore');
    }
    if (prev) prev.addEventListener('click', function () { go(idx === 0 && root.dataset.carousel !== 'explore' ? maxIdx() : idx - 1); });
    if (next) next.addEventListener('click', function () { go(idx >= maxIdx() && root.dataset.carousel !== 'explore' ? 0 : idx + 1); });
    dots.forEach(function (li, j) { li.querySelector('button').addEventListener('click', function () { go(j); }); });
    window.addEventListener('resize', function () { go(idx); });
    var ap = +root.dataset.autoplay;
    if (ap) {
      var t = setInterval(function () { go(idx >= maxIdx() ? 0 : idx + 1); }, ap);
      root.addEventListener('mouseenter', function () { clearInterval(t); });
    }
    root._go = go;
  }
  d.querySelectorAll('[data-carousel]').forEach(carousel);

  /* ---------- ways to service tabs ---------- */
  d.querySelectorAll('[data-tabs]').forEach(function (box) {
    var tabs = box.querySelectorAll('.tablinks');
    var panels = box.querySelectorAll('.cmp-tabs__tabpanel');
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x, j) { x.classList.toggle('cmp-tabs__tab--active', j === i); x.setAttribute('aria-selected', String(j === i)); });
        panels.forEach(function (p, j) { p.hidden = j !== i; });
      });
    });
  });

  /* ---------- EMI calculator ---------- */
  var calc = d.querySelector('[data-calc="emi"]');
  if (calc) {
    var st = { amount: 100000, years: 2, months: 24, rate: 10.99, unit: 'yr' };
    var inr = function (n) { return '₹' + Math.round(n).toLocaleString('en-IN') + '*'; };
    var fmt = function (n) { return Math.round(n).toLocaleString('en-IN'); };
    var ranges = {};
    calc.querySelectorAll('.range').forEach(function (r) {
      var key = r.dataset.range, min = +r.dataset.min, max = +r.dataset.max, step = +r.dataset.step;
      var bar = r.querySelector('.range__bar'), h = r.querySelector('.range__handle');
      function paint(v) { var p = (v - min) / (max - min) * 100; bar.style.width = p + '%'; h.style.left = p + '%'; h.setAttribute('aria-valuenow', v); }
      function fromX(x) {
        var b = r.getBoundingClientRect();
        var v = min + Math.max(0, Math.min(1, (x - b.left) / b.width)) * (max - min);
        v = Math.round(v / step) * step;
        set(key, +v.toFixed(2));
      }
      r.addEventListener('pointerdown', function (e) { r.setPointerCapture(e.pointerId); fromX(e.clientX); r.onpointermove = function (ev) { fromX(ev.clientX); }; });
      r.addEventListener('pointerup', function () { r.onpointermove = null; });
      h.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { set(key, Math.min(max, st[key] + step)); e.preventDefault(); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { set(key, Math.max(min, st[key] - step)); e.preventDefault(); }
      });
      h.setAttribute('aria-valuemin', min); h.setAttribute('aria-valuemax', max);
      ranges[key] = { paint: paint, min: min, max: max };
    });
    var inputs = {};
    calc.querySelectorAll('[data-field]').forEach(function (i) {
      inputs[i.dataset.field] = i;
      i.addEventListener('change', function () {
        var r = ranges[i.dataset.field];
        var v = parseFloat(i.value.replace(/,/g, '')) || r.min;
        set(i.dataset.field, Math.max(r.min, Math.min(r.max, v)));
      });
    });
    function set(k, v) {
      st[k] = v;
      if (k === 'years') st.months = v * 12;
      if (k === 'months') st.years = v / 12;
      render();
    }
    var out = function (n) { return calc.querySelector('[data-out="' + n + '"]'); };
    function render() {
      var n = st.unit === 'yr' ? st.years * 12 : st.months;
      var r = st.rate / 1200;
      var emi = r ? st.amount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : st.amount / n;
      var total = Math.round(emi) * n, interest = total - st.amount;
      out('emi').textContent = inr(emi);
      out('total').textContent = inr(total);
      out('interest').textContent = inr(interest);
      var a = interest / total * 2 * Math.PI, R = 54;
      var x = 60 + R * Math.sin(a), y = 60 - R * Math.cos(a);
      out('slice').setAttribute('d', 'M60 60 L60 ' + (60 - R) + ' A' + R + ' ' + R + ' 0 ' + (a > Math.PI ? 1 : 0) + ' 1 ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' Z');
      Object.keys(ranges).forEach(function (k) { ranges[k].paint(st[k]); });
      if (d.activeElement !== inputs.amount) inputs.amount.value = fmt(st.amount);
      if (d.activeElement !== inputs.years) inputs.years.value = Math.round(st.years * 100) / 100;
      if (d.activeElement !== inputs.months) inputs.months.value = Math.round(st.months);
      if (d.activeElement !== inputs.rate) inputs.rate.value = st.rate;
    }
    calc.querySelectorAll('[data-unit]').forEach(function (b) {
      b.addEventListener('click', function () {
        st.unit = b.dataset.unit;
        calc.querySelectorAll('[data-unit]').forEach(function (x) { x.classList.toggle('active', x === b); });
        calc.querySelectorAll('[data-unit-panel]').forEach(function (p) { p.hidden = p.dataset.unitPanel !== st.unit; });
        render();
      });
    });
    var tabItems = calc.querySelectorAll('.custom-tab-menu .tab-item');
    tabItems.forEach(function (li) { li.querySelector('button').addEventListener('click', function () { tabItems.forEach(function (x) { x.classList.toggle('is-active', x === li); }); }); });
    var ddBtn = calc.querySelector('.dropdown-heading'), ddList = calc.querySelector('.custom-active-tab');
    if (ddBtn && ddList) {
      ddBtn.addEventListener('click', function (e) { e.stopPropagation(); ddList.hidden = !ddList.hidden; ddBtn.setAttribute('aria-expanded', String(!ddList.hidden)); });
      ddList.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { ddBtn.textContent = b.textContent; ddList.hidden = true; }); });
      d.addEventListener('click', function () { ddList.hidden = true; });
    }
    render();
  }

  /* ---------- insight share menus ---------- */
  d.querySelectorAll('.js-fi-share-btn').forEach(function (b) {
    b.addEventListener('click', function (e) { e.stopPropagation(); var m = b.nextElementSibling; m.hidden = !m.hidden; if (!m.hidden && window.tcLazySwap) window.tcLazySwap(m); });
  });
})();
