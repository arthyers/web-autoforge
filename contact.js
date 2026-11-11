/* Contact page: nav, reveal, validation, demo submit (stored in localStorage only). */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* nav */
  var links = $('#navLinks'), tg = $('#navToggle'), bar = $('#progress');
  tg.addEventListener('click', function () {
    var open = links.classList.toggle('is-open'); tg.setAttribute('aria-expanded', String(open));
  });
  addEventListener('scroll', function () {
    var max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
  }, { passive: true });

  /* reveal */
  var rv = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    rv.forEach(function (e, i) { e.style.setProperty('--d', i * 110 + 'ms'); io.observe(e); });
  } else rv.forEach(function (e) { e.classList.add('is-in'); });

  /* cursor */
  var cur = $('#cursor');
  if (cur && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var x = 0, y = 0, tx = 0, ty = 0;
    addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add('is-on'); });
    document.addEventListener('mouseover', function (e) { cur.classList.toggle('is-big', !!e.target.closest('a, button, input, select, textarea')); });
    (function loop() { x += (tx - x) * 0.2; y += (ty - y) * 0.2; cur.style.transform = 'translate(' + x + 'px,' + y + 'px)'; requestAnimationFrame(loop); })();
  }

  /* type picker (radio group) */
  var picks = $$('.type-pick .chip'), carType = 'Sedan';
  picks.forEach(function (b, i) {
    b.addEventListener('click', function () { select(i); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select((i + 1) % picks.length); picks[(i + 1) % picks.length].focus(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); var p = (i + picks.length - 1) % picks.length; select(p); picks[p].focus(); }
    });
  });
  function select(i) {
    picks.forEach(function (b, k) { b.classList.toggle('is-on', k === i); b.setAttribute('aria-checked', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
    carType = picks[i].dataset.type;
  }
  select(0);

  /* validation */
  var form = $('#form'), msg = $('#msg');
  msg.addEventListener('input', function () { $('#counter').textContent = msg.value.length + ' / 600'; });

  function check(id, fieldId, test, text) {
    var input = document.getElementById(id), box = document.getElementById(fieldId);
    var ok = test(input.value.trim());
    box.classList.toggle('is-bad', !ok);
    box.querySelector('.err').textContent = ok ? '' : text;
    input.setAttribute('aria-invalid', String(!ok));
    return ok;
  }
  var rules = [
    ['name', 'f-name', function (v) { return v.length >= 2; }, 'Please enter your name.'],
    ['email', 'f-email', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }, 'Enter a valid email address.'],
    ['msg', 'f-msg', function (v) { return v.length >= 10; }, 'Tell us a little more, at least 10 characters.']
  ];
  rules.forEach(function (r) {
    document.getElementById(r[0]).addEventListener('blur', function () { check.apply(null, r); });
    document.getElementById(r[0]).addEventListener('input', function () { if (document.getElementById(r[1]).classList.contains('is-bad')) check.apply(null, r); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var good = rules.map(function (r) { return check.apply(null, r); }).every(Boolean);
    if (!good) { var bad = form.querySelector('.is-bad input, .is-bad textarea'); if (bad) bad.focus(); return; }
    var btn = $('#send'); btn.disabled = true; btn.textContent = 'Sending';
    var record = { name: $('#name').value.trim(), email: $('#email').value.trim(), type: carType, topic: $('#topic').value, msg: msg.value.trim(), at: new Date().toISOString() };
    setTimeout(function () {
      try {
        var all = JSON.parse(localStorage.getItem('af_messages') || '[]'); all.push(record); localStorage.setItem('af_messages', JSON.stringify(all));
      } catch (err) { /* storage can be blocked; the demo still completes */ }
      form.style.display = 'none';
      $('#okText').textContent = 'Thanks, ' + record.name.split(' ')[0] + '. We will reply to ' + record.email + ' about your ' + (carType === 'Not sure' ? 'car' : carType.toLowerCase()) + ' build.';
      var ok = $('#ok'); ok.classList.add('is-on'); ok.focus();
      btn.disabled = false; btn.textContent = 'Send message';
    }, 700);
  });

  $('#again').addEventListener('click', function () {
    form.reset(); form.style.display = ''; $('#ok').classList.remove('is-on'); $('#counter').textContent = '0 / 600'; select(0);
    $$('.field').forEach(function (f) { f.classList.remove('is-bad'); });
    $('#name').focus();
  });
})();
