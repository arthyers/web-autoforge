/* AutoForge page logic: navigation, motion, configurator UI, portfolio, saved builds. */
(function () {
  'use strict';
  var CF = window.CF;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function toast(msg) {
    var t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove('is-on'); }, 2400);
  }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || 'null');
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function money(n) { return '$' + n.toLocaleString('en-US'); }

  /* ================= page motion ================= */
  function initNav() {
    var nav = $('#nav'), bar = $('#progress'), links = $('#navLinks'), tg = $('#navToggle');
    function onScroll() {
      var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
      nav.classList.toggle('is-solid', y > 30);
      bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    }
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    tg.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      tg.setAttribute('aria-expanded', String(open));
    });
    $$('a', links).forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('is-open'); tg.setAttribute('aria-expanded', 'false'); });
    });
    var map = {};
    $$('[data-spy]').forEach(function (a) { map[a.dataset.spy] = a; });
    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting && map[e.target.id]) {
            $$('[data-spy]').forEach(function (a) { a.classList.remove('is-active'); });
            map[e.target.id].classList.add('is-active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
    }
  }

  function initCursor() {
    var c = $('#cursor');
    if (!c || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var x = 0, y = 0, tx = 0, ty = 0;
    addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; c.classList.add('is-on'); });
    document.addEventListener('mouseover', function (e) {
      c.classList.toggle('is-big', !!e.target.closest('a, button, .card, .port, canvas, input, label'));
    });
    (function loop() {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      c.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  function initText() {
    $$('[data-split]').forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.setAttribute('aria-label', words.join(' '));
      el.innerHTML = words.map(function (w, i) {
        return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + w + '</span></span>';
      }).join(' ');
    });
  }

  function initReveal() {
    var els = $$('.reveal');
    els.forEach(function (el, i) { el.style.setProperty('--d', (i % 4) * 90 + 'ms'); });
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach(function (e) { io.observe(e); });

    var counters = $$('[data-count]');
    var co = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        var end = +e.target.dataset.count, t0 = performance.now();
        (function step(now) {
          var k = Math.min((now - t0) / 1200, 1);
          e.target.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    });
    counters.forEach(function (c) { co.observe(c); });

    var mo = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) { $$('i[data-w]', e.target).forEach(function (b) { b.style.width = b.dataset.w + '%'; }); mo.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    var meters = $('#meters'); if (meters) mo.observe(meters);
  }

  function initTilt() {
    if (!window.matchMedia('(hover: hover)').matches || reduce) return;
    $$('.card').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(700px) rotateY(' + px * 8 + 'deg) rotateX(' + -py * 8 + 'deg) translateY(-3px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
    $$('.btn-primary, .nav-cta').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.12 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.2 + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  function initGoals() {
    var items = $$('.goal');
    items.forEach(function (li) {
      $('.goal-head', li).addEventListener('click', function () {
        var open = li.classList.contains('is-open');
        items.forEach(function (o) { o.classList.remove('is-open'); $('.goal-head', o).setAttribute('aria-expanded', 'false'); });
        if (!open) { li.classList.add('is-open'); $('.goal-head', li).setAttribute('aria-expanded', 'true'); }
      });
    });
  }

  /* ================= hero ================= */
  function initHero() {
    var canvas = $('#heroCanvas'); if (!canvas) return;
    var stage;
    try { stage = CF.createStage(canvas, { autoRotate: true, rotateSpeed: 0.9, fov: 32 }); } catch (e) { return; }
    stage.controls.enableZoom = false;
    var types = ['sedan', 'suv', 'truck'], i = 0;
    var paints = ['#0e9aa7', '#b3122b', '#e8601c'];
    function make(t, idx) {
      var cfg = CF.defaultConfig(t);
      ['body', 'hood', 'roof', 'doors', 'bed'].forEach(function (p) { cfg.parts[p].color = paints[idx]; });
      return cfg;
    }
    stage.setCar(types[0], make(types[0], 0), true);
    function shift() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w) return;
      var cam = stage.camera;
      if (w > 820) cam.setViewOffset(w, h, -w * 0.2, 0, w, h); else cam.clearViewOffset();
      cam.updateProjectionMatrix();
    }
    stage.camera.position.set(6.4, 2.3, 6.6);
    stage.controls.target.set(0, 0.8, 0);
    stage.driving = false;
    shift(); addEventListener('resize', shift);
    stage.start();
    var t = setInterval(function () {
      if (!stage.visible) return;
      i = (i + 1) % 3;
      stage.setCar(types[i], make(types[i], i));
    }, 7000);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stage.visible = false; });
    void t;
  }

  /* ================= configurator ================= */
  var cfg, stage, car, mode = 'exterior', selected = 'body', webgl = true;

  function partDef(id) { return CF.PARTS.filter(function (p) { return p.id === id; })[0]; }
  function paletteOf(id) { return CF.PALETTES[partDef(id).palette]; }

  function applyAll(animate) {
    CF.PARTS.forEach(function (p) {
      car.setColor(p.id, cfg.parts[p.id].color, animate);
      car.setFinish(p.id, cfg.parts[p.id].finish);
    });
  }

  function buildCurrent(instant) {
    car = stage.setCar(cfg.type, cfg, instant);
    car.setMode(mode === 'interior' ? 'cutaway' : 'exterior', cfg.tint);
    car.setDoors(cfg.doorsOpen);
    car.setHeight(cfg.height);
    if (cfg.underglow) car.setGlow(true, cfg.glowColor);
    var v = mode === 'interior' ? car.views.cutaway : car.views.three;
    stage.flyTo(v.pos, v.target, 1.2);
  }

  function setPart(id, color, finish) {
    var def = partDef(id);
    var linked = CF.PARTS.filter(function (p) { return p.linked; }).map(function (p) { return p.id; });
    var ids = [id];
    if (id === 'body' && cfg.match) ids = ['body'].concat(linked);
    else if (def.linked && cfg.match) { cfg.match = false; $('#matchBody').checked = false; toast('Match body turned off'); }
    ids.forEach(function (k) {
      if (color) { cfg.parts[k].color = color; car.setColor(k, color, true); }
      if (finish) { cfg.parts[k].finish = finish; car.setFinish(k, finish); }
    });
    renderPanel();
  }

  function finishGradient(key) {
    var g = {
      gloss: 'linear-gradient(180deg,#fff 0 12%,#2a8f9a 14%,#0b3a40)',
      satin: 'linear-gradient(180deg,#9ccfd5,#1f6a72 55%,#0e3f45)',
      matte: 'linear-gradient(180deg,#3d6f75,#2a5358)',
      metallic: 'linear-gradient(115deg,#0b3a40,#9be4ee 35%,#164a52 55%,#6fc1cb 80%)',
      chrome: 'linear-gradient(180deg,#fff,#7a8791 45%,#1b2227 50%,#c9d4db)'
    };
    return g[key];
  }

  function rimSvg(st) {
    var s = '<svg viewBox="-20 -20 40 40" aria-hidden="true"><circle r="18" fill="none" stroke="currentColor" stroke-width="2"/>';
    if (st.disc) s += '<circle r="14" fill="currentColor" opacity=".55"/>';
    else {
      var n = Math.min(st.n, 12);
      for (var i = 0; i < n; i++) {
        var a = i / n * Math.PI * 2, b = a + st.skew * 0.5;
        s += '<line x1="0" y1="0" x2="' + (Math.cos(b) * 16).toFixed(1) + '" y2="' + (Math.sin(b) * 16).toFixed(1) + '" stroke="currentColor" stroke-width="' + (st.w > 0.05 ? 3.4 : 1.8) + '" stroke-linecap="round"/>';
      }
    }
    return s + '<circle r="3" fill="currentColor"/></svg>';
  }

  function renderPanel() {
    var T = CF.TYPES[cfg.type];
    $('#panelTitle').textContent = 'Configure your ' + T.label.toLowerCase();
    $('#accLabel').textContent = T.accessory;

    var parts = CF.partsFor(cfg.type).filter(function (p) { return p.group === mode; });
    if (!parts.some(function (p) { return p.id === selected; })) selected = parts[0].id;

    var list = $('#partList'); list.innerHTML = '';
    parts.forEach(function (p) {
      var b = document.createElement('button');
      b.className = 'part' + (p.id === selected ? ' is-on' : '');
      b.setAttribute('role', 'option'); b.setAttribute('aria-selected', String(p.id === selected));
      b.innerHTML = '<i style="--c:' + cfg.parts[p.id].color + '"></i>' + p.label;
      b.addEventListener('click', function () { selected = p.id; renderPanel(); focusPart(p.id); });
      list.appendChild(b);
    });

    var def = partDef(selected), cur = cfg.parts[selected];
    $('#colorTitle').textContent = def.label + ' color';
    var pal = CF.PALETTES[def.palette];
    $('#colorCount').textContent = ('0' + pal.length).slice(-2);
    var sw = $('#swatches'); sw.innerHTML = '';
    pal.forEach(function (c) {
      var b = document.createElement('button');
      var on = c.hex.toLowerCase() === cur.color.toLowerCase();
      b.className = 'swatch' + (on ? ' is-on' : '');
      b.setAttribute('aria-label', c.name); b.setAttribute('aria-pressed', String(on));
      b.innerHTML = '<span class="chipc" style="--c:' + c.hex + '"></span><span class="n">' + c.name + '</span>';
      b.addEventListener('click', function () { setPart(selected, c.hex); });
      sw.appendChild(b);
    });
    $('#customColor').value = cur.color;

    $('#finishGroup').hidden = !!def.noFinish;
    var fin = $('#finishes'); fin.innerHTML = '';
    var keys = Object.keys(CF.FINISHES);
    $('#finishCount').textContent = ('0' + keys.length).slice(-2);
    keys.forEach(function (k) {
      var b = document.createElement('button');
      b.className = 'finish' + (cur.finish === k ? ' is-on' : '');
      b.setAttribute('aria-pressed', String(cur.finish === k));
      b.innerHTML = '<i style="--g:' + finishGradient(k) + '"></i>' + CF.FINISHES[k].label;
      b.addEventListener('click', function () { setPart(selected, null, k); });
      fin.appendChild(b);
    });

    var rs = $('#rimStyles'); rs.innerHTML = '';
    CF.RIM_STYLES.forEach(function (st) {
      var b = document.createElement('button');
      b.className = 'rim' + (cfg.rim === st.id ? ' is-on' : '');
      b.setAttribute('aria-label', st.label + ' rims'); b.setAttribute('aria-pressed', String(cfg.rim === st.id));
      b.innerHTML = rimSvg(st) + '<span>' + st.label + '</span>';
      b.addEventListener('click', function () { cfg.rim = st.id; car.setRim(st.id); renderPanel(); focusPart('rims'); });
      rs.appendChild(b);
    });

    var gs = $('#glowSwatches'); gs.innerHTML = '';
    CF.PALETTES.glow.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'swatch' + (c.hex === cfg.glowColor ? ' is-on' : '');
      b.setAttribute('aria-label', 'Underglow ' + c.name);
      b.innerHTML = '<span class="chipc" style="--c:' + c.hex + '"></span><span class="n">' + c.name + '</span>';
      b.addEventListener('click', function () {
        cfg.glowColor = c.hex; $('#optGlow').checked = cfg.underglow = true; car.setGlow(true, c.hex); renderPanel();
      });
      gs.appendChild(b);
    });

    $('#extGroup').hidden = $('#extras').hidden = mode !== 'exterior';
    $('#matchWrap').style.visibility = selected === 'body' || (def.linked) ? 'visible' : 'hidden';

    var sum = $('#summary');
    var extra = (cfg.spoiler ? 1200 : 0) + (cfg.rack ? 650 : 0) + (cfg.underglow ? 480 : 0) + (cfg.rim !== 'spoke5' ? 900 : 0);
    var pricey = Object.keys(cfg.parts).filter(function (k) { var f = cfg.parts[k].finish; return f === 'metallic' || f === 'chrome'; }).length * 260;
    sum.innerHTML = '<div>Body<b>' + nameOf('paint', cfg.parts.body.color) + '</b></div><div>Interior<b>' + nameOf('interior', cfg.parts.seats.color) + '</b></div><div>Estimate<b>' + money(T.price + extra + pricey) + '</b></div>';
  }

  function nameOf(pal, hex) {
    var f = CF.PALETTES[pal].filter(function (c) { return c.hex.toLowerCase() === hex.toLowerCase(); })[0];
    return f ? f.name : 'Custom';
  }

  /* camera hint when picking a part */
  function focusPart(id) {
    if (!car) return;
    var S = car.spec, h = S.h, L = S.L;
    var map = {
      hood: [[L * 0.75, h * 1.3, L * 0.7], [S.hood[1][0], S.hood[1][1], 0]],
      roof: [[L * 0.5, h * 2.2, L * 0.7], [0, h, 0]],
      bumpers: [[L * 1.1, h * 0.7, L * 0.9], [S.bumper.f[0], 0.5, 0]],
      rims: [[S.axles[0] + 0.5, 0.7, 2.7], [S.axles[0], 0.4, 1]],
      calipers: [[S.axles[0] + 0.4, 0.6, 2.3], [S.axles[0], 0.4, 1]],
      lights: [[L * 0.95, h * 0.9, L * 0.45], [S.head[0], S.head[1], 0.5]],
      spoiler: [[-L * 1.1, h * 1.3, -L * 0.8], [S.rack.x0, h * 0.8, 0]],
      bed: [[-L * 0.8, h * 1.6, L * 0.9], [-1.7, 0.8, 0]],
      trim: [[L * 0.9, h, L * 0.9], [S.mirror[0], S.mirror[1], 0.8]]
    };
    if (mode === 'interior') {
      var v = car.views;
      var im = {
        seats: v.cutaway, dash: v.driver, steering: v.driver, carpet: v.cutaway, headliner: v.cutaway, accent: v.cutaway
      };
      if (im[id]) stage.flyTo(im[id].pos, im[id].target, 1);
      return;
    }
    if (map[id]) stage.flyTo(map[id][0], map[id][1], 1);
  }

  function setMode(m) {
    mode = m;
    $$('.seg').forEach(function (b) { var on = b.dataset.mode === m; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); });
    selected = m === 'interior' ? 'seats' : 'body';
    car.setMode(m === 'interior' ? 'cutaway' : 'exterior', cfg.tint);
    var v = m === 'interior' ? car.views.cutaway : car.views.three;
    stage.flyTo(v.pos, v.target, 1.2);
    stage.controls.autoRotate = false; syncTools();
    renderPanel();
  }

  function syncTools() {
    $('#btnSpin').setAttribute('aria-pressed', String(stage.controls.autoRotate));
    $('#btnDoors').setAttribute('aria-pressed', String(cfg.doorsOpen));
    $('#btnDrive').setAttribute('aria-pressed', String(stage.driving));
    $$('[data-type]', $('.type-switch')).forEach(function (b) {
      var on = b.dataset.type === cfg.type; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on));
    });
    $('#matchBody').checked = cfg.match;
    $('#optSpoiler').checked = cfg.spoiler; $('#optRack').checked = cfg.rack; $('#optGlow').checked = cfg.underglow;
    $('#height').value = cfg.height; $('#tint').value = cfg.tint;
  }

  function loadConfig(c, fly) {
    cfg = clone(c);
    if (!cfg.parts.bed) cfg.parts.bed = clone(CF.defaultConfig('truck').parts.bed);
    selected = mode === 'interior' ? 'seats' : 'body';
    buildCurrent(false);
    syncTools(); renderPanel();
    if (fly) toast('Loaded into the configurator');
  }

  function shotData(w, h) {
    stage.renderOnce();
    var src = stage.renderer.domElement, c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    var sr = src.width / src.height, tr = w / h, sw = src.width, sh = src.height, sx = 0, sy = 0;
    if (sr > tr) { sw = src.height * tr; sx = (src.width - sw) / 2; } else { sh = src.width / tr; sy = (src.height - sh) / 2; }
    g.drawImage(src, sx, sy, sw, sh, 0, 0, w, h);
    return c.toDataURL('image/jpeg', 0.82);
  }

  function renderSaved() {
    var list = store('af_saved') || [], wrap = $('#savedWrap'), grid = $('#savedGrid');
    wrap.hidden = !list.length; grid.innerHTML = '';
    list.forEach(function (it, idx) {
      var d = document.createElement('div'); d.className = 'saved-card';
      d.innerHTML = '<img alt="Saved ' + it.cfg.type + ' build" src="' + it.img + '"><div><span>' + CF.TYPES[it.cfg.type].label + ' - ' + nameOf('paint', it.cfg.parts.body.color) + '</span><span><button data-a="load">Load</button> <button data-a="del">Delete</button></span></div>';
      d.addEventListener('click', function (e) {
        var a = e.target.dataset.a; if (!a) return;
        if (a === 'load') { loadConfig(it.cfg); $('#configurator').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        else { list.splice(idx, 1); store('af_saved', list); renderSaved(); }
      });
      grid.appendChild(d);
    });
  }

  function initConfigurator() {
    var canvas = $('#cfCanvas'); if (!canvas) return;
    try {
      stage = CF.createStage(canvas, { autoRotate: true, rotateSpeed: 1.1 });
    } catch (e) {
      webgl = false; $('#webglFail').hidden = false; $('#cfLoading').classList.add('is-done'); return;
    }
    cfg = CF.defaultConfig('sedan');
    stage.camera.position.set(6.2, 2.6, 6.4);
    stage.setCar(cfg.type, cfg, true);
    car = stage.car;
    stage.start();
    stage.controls.addEventListener('start', function () { if (stage.controls.autoRotate) { stage.controls.autoRotate = false; syncTools(); } });
    setTimeout(function () { $('#cfLoading').classList.add('is-done'); }, 500);

    /* type switch */
    $$('[data-type]', $('.type-switch')).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.type === cfg.type) return;
        cfg.type = b.dataset.type;
        if (!partDef(selected) || (partDef(selected).types && partDef(selected).types.indexOf(cfg.type) < 0)) selected = 'body';
        buildCurrent(false); syncTools(); renderPanel();
        toast(CF.TYPES[cfg.type].label + ' loaded');
      });
    });
    /* camera views */
    $$('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = car.views[b.dataset.view]; stage.controls.autoRotate = false; syncTools();
        if (b.dataset.view === 'driver') { if (mode !== 'interior') setMode('interior'); selected = 'dash'; renderPanel(); }
        stage.flyTo(v.pos, v.target, 1.1);
      });
    });
    $('#btnSpin').addEventListener('click', function () { stage.controls.autoRotate = !stage.controls.autoRotate; syncTools(); });
    $('#btnDoors').addEventListener('click', function () { cfg.doorsOpen = !cfg.doorsOpen; car.setDoors(cfg.doorsOpen); syncTools(); });
    $('#btnDrive').addEventListener('click', function () {
      stage.driving = !stage.driving;
      if (stage.driving) { stage.controls.autoRotate = true; var v = car.views.side; stage.flyTo(v.pos, v.target, 1); }
      syncTools();
    });
    $('#btnShot').addEventListener('click', function () {
      var a = document.createElement('a'); a.href = shotData(1600, 900); a.download = 'autoforge-' + cfg.type + '.jpg'; a.click();
      toast('Image saved');
    });
    $$('.seg').forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.mode); }); });

    $('#matchBody').addEventListener('change', function (e) {
      cfg.match = e.target.checked;
      if (cfg.match) {
        var b = cfg.parts.body;
        CF.PARTS.filter(function (p) { return p.linked; }).forEach(function (p) { cfg.parts[p.id] = { color: b.color, finish: b.finish }; car.setColor(p.id, b.color, true); car.setFinish(p.id, b.finish); });
        renderPanel();
      }
    });
    $('#customColor').addEventListener('input', function (e) { setPartLive(selected, e.target.value); });
    $('#height').addEventListener('input', function (e) { cfg.height = +e.target.value; car.setHeight(cfg.height); });
    $('#tint').addEventListener('input', function (e) { cfg.tint = +e.target.value; car.setTint(cfg.tint); });
    $('#optSpoiler').addEventListener('change', function (e) { cfg.spoiler = e.target.checked; car.setSpoiler(cfg.spoiler); if (cfg.spoiler) focusPart('spoiler'); renderPanel(); });
    $('#optRack').addEventListener('change', function (e) { cfg.rack = e.target.checked; car.setRack(cfg.rack); renderPanel(); });
    $('#optGlow').addEventListener('change', function (e) { cfg.underglow = e.target.checked; car.setGlow(cfg.underglow, cfg.glowColor); renderPanel(); });

    $('#btnReset').addEventListener('click', function () { var t = cfg.type; loadConfig(CF.defaultConfig(t)); toast('Reset to factory'); });
    $('#btnRandom').addEventListener('click', function () {
      var c = CF.defaultConfig(cfg.type), fk = Object.keys(CF.FINISHES);
      function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
      var paint = pick(CF.PALETTES.paint).hex, fin = pick(['gloss', 'satin', 'metallic', 'matte']);
      ['body', 'hood', 'roof', 'doors', 'bed'].forEach(function (k) { c.parts[k] = { color: paint, finish: fin }; });
      c.parts.trim.color = pick(CF.PALETTES.trim).hex; c.parts.bumpers.color = pick(CF.PALETTES.trim).hex;
      c.parts.rims = { color: pick(CF.PALETTES.rim).hex, finish: pick(['metallic', 'chrome', 'satin']) };
      c.parts.calipers.color = pick(CF.PALETTES.paint).hex;
      ['seats', 'dash', 'carpet', 'steering', 'headliner'].forEach(function (k) { c.parts[k].color = pick(CF.PALETTES.interior).hex; });
      c.parts.accent.color = pick(CF.PALETTES.glow).hex; c.parts.lights.color = pick(CF.PALETTES.glow).hex;
      c.rim = pick(CF.RIM_STYLES).id; c.spoiler = Math.random() > 0.5; c.underglow = Math.random() > 0.6; c.glowColor = pick(CF.PALETTES.glow).hex;
      void fk;
      loadConfig(c);
    });
    $('#btnSave').addEventListener('click', function () {
      var list = store('af_saved') || [];
      list.unshift({ cfg: clone(cfg), img: shotData(480, 300) });
      store('af_saved', list.slice(0, 6));
      renderSaved(); toast('Build saved below the configurator');
    });

    syncTools(); renderPanel(); renderSaved();
  }

  function setPartLive(id, hex) {
    var def = partDef(id), linked = CF.PARTS.filter(function (p) { return p.linked; }).map(function (p) { return p.id; });
    var ids = (id === 'body' && cfg.match) ? ['body'].concat(linked) : [id];
    if (def.linked && cfg.match && id !== 'body') { cfg.match = false; $('#matchBody').checked = false; }
    ids.forEach(function (k) { cfg.parts[k].color = hex; car.setColor(k, hex, false); });
    $$('.swatch.is-on').forEach(function (s) { s.classList.remove('is-on'); });
  }

  /* ================= portfolio ================= */
  var BUILDS = [
    { name: 'Harbor Sedan', type: 'sedan', note: 'Lagoon gloss with silver 5-spoke wheels.', make: function (c) { paint(c, '#0e9aa7', 'gloss'); } },
    { name: 'Night Courier', type: 'sedan', note: 'Onyx metallic, gold wheels, cognac cabin.', make: function (c) { paint(c, '#0b0b0c', 'metallic'); c.parts.rims = { color: '#c79a3a', finish: 'metallic' }; c.rim = 'multi10'; seatsCol(c, '#8a4b24'); c.spoiler = true; } },
    { name: 'Ridge Runner', type: 'suv', note: 'Moss satin with roof rack and bronze mesh rims.', make: function (c) { paint(c, '#3b5a2a', 'satin'); c.rack = true; c.rim = 'mesh'; c.parts.rims = { color: '#7a5230', finish: 'satin' }; seatsCol(c, '#d9cdb4'); } },
    { name: 'City Ember', type: 'suv', note: 'Ember metallic, black trim, slate interior.', make: function (c) { paint(c, '#e8601c', 'metallic'); c.parts.rims = { color: '#16171a', finish: 'satin' }; c.rim = 'twist'; seatsCol(c, '#4b535c'); } },
    { name: 'Work Horse', type: 'truck', note: 'Pearl white matte with cab light bar.', make: function (c) { paint(c, '#ececec', 'matte'); c.spoiler = true; c.rack = true; c.parts.bumpers.color = '#34373c'; } },
    { name: 'Midnight Hauler', type: 'truck', note: 'Midnight gloss, cyan underglow, aero discs.', make: function (c) { paint(c, '#14264a', 'gloss'); c.underglow = true; c.glowColor = '#38d4ff'; c.rim = 'aero'; c.height = 0.08; } }
  ];
  function paint(c, hex, fin) { ['body', 'hood', 'roof', 'doors', 'bed'].forEach(function (k) { c.parts[k] = { color: hex, finish: fin }; }); }
  function seatsCol(c, hex) { ['seats', 'steering'].forEach(function (k) { c.parts[k].color = hex; }); }

  function initPortfolio() {
    var grid = $('#portGrid'); if (!grid) return;
    var cards = BUILDS.map(function (b) {
      var c = CF.defaultConfig(b.type); b.make(c); b.cfg = c;
      var el = document.createElement('button');
      el.className = 'port reveal'; el.dataset.type = b.type;
      el.innerHTML = '<span class="tag">' + CF.TYPES[b.type].label + '</span><div class="shot"></div><div class="meta"><b>' + b.name + '</b><small>' + b.note + '</small><span class="go">Open in configurator</span></div>';
      el.addEventListener('click', function () {
        if (!webgl) return;
        loadConfig(b.cfg, true);
        $('#configurator').scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      grid.appendChild(el);
      return el;
    });
    $$('[data-filter]').forEach(function (f) {
      f.addEventListener('click', function () {
        $$('[data-filter]').forEach(function (o) { o.classList.toggle('is-on', o === f); });
        cards.forEach(function (c) { c.classList.toggle('is-hidden', f.dataset.filter !== 'all' && c.dataset.type !== f.dataset.filter); });
      });
    });
    /* render thumbnails with a throw-away stage when the section is near the screen */
    var done = false;
    function thumbs() {
      if (done || !webgl) return; done = true;
      var cv = document.createElement('canvas'), st;
      try { st = CF.createStage(cv, { autoRotate: false, noControls: true, maxDpr: 1 }); } catch (e) { return; }
      st.renderer.setSize(720, 450, false);
      st.camera.aspect = 720 / 450; st.camera.updateProjectionMatrix();
      var i = 0;
      (function next() {
        if (i >= BUILDS.length) { CF.disposeObject(st.scene); st.renderer.dispose(); return; }
        var b = BUILDS[i], car2 = st.setCar(b.type, b.cfg, true);
        var v = car2.views.three;
        st.camera.position.set(v.pos[0] * 0.95, v.pos[1] * 0.95, v.pos[2] * 0.95);
        st.controls.target.set(v.target[0], v.target[1], v.target[2]);
        st.controls.update();
        st.renderer.render(st.scene, st.camera);
        var img = new Image(); img.alt = b.name + ' build preview'; img.src = cv.toDataURL('image/jpeg', 0.85);
        $('.shot', cards[i]).appendChild(img);
        i++; setTimeout(next, 60);
      })();
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); setTimeout(thumbs, 100); } }, { rootMargin: '700px' });
      io.observe(grid);
    } else thumbs();
  }

  /* ================= boot ================= */
  function boot() {
    initText(); initNav(); initCursor(); initGoals();
    if (!window.THREE || !CF || !CF.createStage) {
      webgl = false;
      $('#webglFail').hidden = false; $('#cfLoading').classList.add('is-done');
      $('#webglFail p').textContent = '3D library could not load. Check your internet connection and reload.';
    } else {
      initHero(); initConfigurator(); initPortfolio();
    }
    initReveal(); initTilt();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
