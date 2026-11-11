/* AutoForge core: constants, geometry helpers, materials, 3D stage.
   Requires THREE (r147 classic build) and THREE.OrbitControls. */
(function () {
  'use strict';
  var T = THREE;
  var CF = (window.CF = window.CF || {});

  /* ---------- data ---------- */
  CF.FINISHES = {
    gloss:    { label: 'Gloss',    metalness: 0.55, roughness: 0.22, clearcoat: 1,    clearcoatRoughness: 0.04 },
    satin:    { label: 'Satin',    metalness: 0.45, roughness: 0.45, clearcoat: 0.35, clearcoatRoughness: 0.35 },
    matte:    { label: 'Matte',    metalness: 0.08, roughness: 0.9,  clearcoat: 0,    clearcoatRoughness: 1 },
    metallic: { label: 'Metallic', metalness: 0.95, roughness: 0.28, clearcoat: 1,    clearcoatRoughness: 0.08 },
    chrome:   { label: 'Chrome',   metalness: 1,    roughness: 0.04, clearcoat: 0,    clearcoatRoughness: 0 }
  };

  CF.PALETTES = {
    paint: [
      { name: 'Crimson',      hex: '#b3122b' },
      { name: 'Lagoon',       hex: '#0e9aa7' },
      { name: 'Midnight',     hex: '#14264a' },
      { name: 'Moss',         hex: '#3b5a2a' },
      { name: 'Silver',       hex: '#9aa0a6' },
      { name: 'Pearl White',  hex: '#ececec' },
      { name: 'Onyx',         hex: '#0b0b0c' },
      { name: 'Ember',        hex: '#e8601c' },
      { name: 'Solar',        hex: '#f2c200' },
      { name: 'Amethyst',     hex: '#5b2a86' }
    ],
    rim: [
      { name: 'Silver',       hex: '#c9ccd1' },
      { name: 'Platinum',     hex: '#7d8187' },
      { name: 'Satin Black',  hex: '#16171a' },
      { name: 'Aurum Gold',   hex: '#c79a3a' },
      { name: 'Bronze',       hex: '#7a5230' },
      { name: 'White',        hex: '#f1f1f1' }
    ],
    trim: [
      { name: 'Gloss Black',  hex: '#0c0c0d' },
      { name: 'Brushed',      hex: '#b9bcc2' },
      { name: 'Carbon',       hex: '#34373c' },
      { name: 'Ember',        hex: '#e8601c' },
      { name: 'Gold',         hex: '#c79a3a' }
    ],
    interior: [
      { name: 'Onyx',         hex: '#141517' },
      { name: 'Cognac',       hex: '#8a4b24' },
      { name: 'Crimson',      hex: '#8e1b2c' },
      { name: 'Cream',        hex: '#d9cdb4' },
      { name: 'Slate',        hex: '#4b535c' },
      { name: 'Ocean',        hex: '#1f3d5c' }
    ],
    glow: [
      { name: 'Ice White',    hex: '#e9f4ff' },
      { name: 'Warm',         hex: '#ffd9a0' },
      { name: 'Cyan',         hex: '#38d4ff' },
      { name: 'Ember',        hex: '#ff7a1a' },
      { name: 'Lime',         hex: '#9dff3a' },
      { name: 'Magenta',      hex: '#ff3aa8' }
    ]
  };

  /* id, label, group, palette, default [color, finish], linked (follows body), types limit */
  CF.PARTS = [
    { id: 'body',     label: 'Body panels',      group: 'exterior', palette: 'paint',    def: ['#0e9aa7', 'gloss'] },
    { id: 'hood',     label: 'Hood',             group: 'exterior', palette: 'paint',    def: ['#0e9aa7', 'gloss'], linked: true },
    { id: 'roof',     label: 'Roof',             group: 'exterior', palette: 'paint',    def: ['#0e9aa7', 'gloss'], linked: true },
    { id: 'doors',    label: 'Doors',            group: 'exterior', palette: 'paint',    def: ['#0e9aa7', 'gloss'], linked: true },
    { id: 'bed',      label: 'Cargo bed',        group: 'exterior', palette: 'paint',    def: ['#0e9aa7', 'gloss'], linked: true, types: ['truck'] },
    { id: 'bumpers',  label: 'Bumpers',          group: 'exterior', palette: 'paint',    def: ['#1b1c1f', 'satin'] },
    { id: 'trim',     label: 'Trim and mirrors', group: 'exterior', palette: 'trim',     def: ['#0c0c0d', 'gloss'] },
    { id: 'spoiler',  label: 'Accessory',        group: 'exterior', palette: 'paint',    def: ['#0c0c0d', 'satin'] },
    { id: 'rims',     label: 'Rims',             group: 'exterior', palette: 'rim',      def: ['#c9ccd1', 'metallic'] },
    { id: 'calipers', label: 'Brake calipers',   group: 'exterior', palette: 'paint',    def: ['#d3202f', 'gloss'] },
    { id: 'lights',   label: 'Headlight glow',   group: 'exterior', palette: 'glow',     def: ['#e9f4ff', 'gloss'], noFinish: true },
    { id: 'seats',    label: 'Seats',            group: 'interior', palette: 'interior', def: ['#141517', 'satin'] },
    { id: 'dash',     label: 'Dashboard',        group: 'interior', palette: 'interior', def: ['#1b1d20', 'matte'] },
    { id: 'carpet',   label: 'Floor and carpet', group: 'interior', palette: 'interior', def: ['#26282b', 'matte'] },
    { id: 'steering', label: 'Steering wheel',   group: 'interior', palette: 'interior', def: ['#141517', 'satin'] },
    { id: 'headliner',label: 'Headliner',        group: 'interior', palette: 'interior', def: ['#4b535c', 'matte'] },
    { id: 'accent',   label: 'Ambient light',    group: 'interior', palette: 'glow',     def: ['#ff7a1a', 'gloss'], noFinish: true }
  ];

  CF.RIM_STYLES = [
    { id: 'spoke5',  label: '5 Spoke',   n: 5,  w: 0.085, disc: false, skew: 0 },
    { id: 'multi10', label: 'Multi 10',  n: 10, w: 0.04,  disc: false, skew: 0 },
    { id: 'mesh',    label: 'Mesh',      n: 24, w: 0.014, disc: false, skew: 0.35, ring: true },
    { id: 'twist',   label: 'Twist 7',   n: 7,  w: 0.06,  disc: false, skew: 0.6 },
    { id: 'aero',    label: 'Aero Disc', n: 0,  w: 0,     disc: true,  skew: 0 }
  ];

  CF.TYPES = {
    sedan: { label: 'Sedan', accessory: 'Rear wing', price: 38000 },
    suv:   { label: 'SUV',   accessory: 'Roof spoiler', price: 46000 },
    truck: { label: 'Truck', accessory: 'Cab light bar', price: 52000 }
  };

  CF.defaultConfig = function (type) {
    var parts = {};
    CF.PARTS.forEach(function (p) { parts[p.id] = { color: p.def[0], finish: p.def[1] }; });
    return {
      type: type || 'sedan',
      parts: parts,
      match: true,
      rim: 'spoke5',
      spoiler: false,
      rack: false,
      height: 0,
      tint: 0.55,
      underglow: false,
      glowColor: '#38d4ff',
      doorsOpen: false
    };
  };

  CF.partsFor = function (type) {
    return CF.PARTS.filter(function (p) { return !p.types || p.types.indexOf(type) >= 0; });
  };

  /* ---------- geometry helpers ---------- */
  CF.roundedShape = function (pts, r) {
    var n = pts.length, s = new T.Shape();
    for (var i = 0; i < n; i++) {
      var p = pts[i], a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
      var d1 = Math.hypot(p[0] - a[0], p[1] - a[1]);
      var d2 = Math.hypot(p[0] - b[0], p[1] - b[1]);
      var k = Math.min(r, d1 / 2, d2 / 2);
      var x1 = p[0] + (a[0] - p[0]) * k / d1, y1 = p[1] + (a[1] - p[1]) * k / d1;
      var x2 = p[0] + (b[0] - p[0]) * k / d2, y2 = p[1] + (b[1] - p[1]) * k / d2;
      if (i === 0) s.moveTo(x1, y1); else s.lineTo(x1, y1);
      s.quadraticCurveTo(p[0], p[1], x2, y2);
    }
    s.closePath();
    return s;
  };

  /* profile in x,y plane extruded along z, centred on z=0 */
  CF.extrude = function (pts, r, width, bevel) {
    var b = bevel || 0;
    var depth = Math.max(width - 2 * b, 0.01);
    var geo = new T.ExtrudeGeometry(CF.roundedShape(pts, r), {
      depth: depth,
      bevelEnabled: b > 0,
      bevelThickness: b,
      bevelSize: b * 0.9,
      bevelSegments: 3,
      curveSegments: 10
    });
    geo.translate(0, 0, -depth / 2);
    return geo;
  };

  /* rounded box: w along x, h along y, d along z */
  CF.rbox = function (w, h, d, r, bevel) {
    var b = bevel === undefined ? 0.015 : bevel;
    var rr = Math.min(r, w / 2 - b - 0.001, h / 2 - b - 0.001);
    rr = Math.max(rr, 0.004);
    var pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
    return CF.extrude(pts, rr, d, Math.min(b, d / 3));
  };

  CF.makeMat = function (color, finish) {
    var f = CF.FINISHES[finish] || CF.FINISHES.gloss;
    return new T.MeshPhysicalMaterial({
      color: new T.Color(color),
      metalness: f.metalness,
      roughness: f.roughness,
      clearcoat: f.clearcoat,
      clearcoatRoughness: f.clearcoatRoughness
    });
  };

  CF.applyFinish = function (mat, finish) {
    var f = CF.FINISHES[finish] || CF.FINISHES.gloss;
    mat.metalness = f.metalness;
    mat.roughness = f.roughness;
    mat.clearcoat = f.clearcoat;
    mat.clearcoatRoughness = f.clearcoatRoughness;
    mat.needsUpdate = true;
  };

  CF.disposeObject = function (obj) {
    obj.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        var list = Array.isArray(o.material) ? o.material : [o.material];
        list.forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); });
      }
    });
  };

  /* ---------- environment (studio softboxes baked to a PMREM) ---------- */
  function makeEnv(renderer) {
    var envScene = new T.Scene();
    envScene.add(new T.Mesh(new T.SphereGeometry(30, 32, 16), new T.MeshBasicMaterial({ color: 0x15171b, side: T.BackSide })));
    function panel(w, h, x, y, z, k, color) {
      var c = new T.Color(color); c.multiplyScalar(k);
      var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: c, side: T.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m);
    }
    panel(16, 6, 0, 14, 0, 6, 0xffffff);
    panel(9, 4, 12, 5, 7, 4, 0xffffff);
    panel(9, 4, -12, 5, -7, 3, 0xffe6cc);
    panel(12, 3, 0, 3, -14, 3, 0xffffff);
    panel(7, 3, -14, 4, 7, 2, 0xcfe0ff);
    var pm = new T.PMREMGenerator(renderer);
    var tex = pm.fromScene(envScene, 0.02).texture;
    pm.dispose();
    envScene.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    return tex;
  }

  function gridTexture() {
    var c = document.createElement('canvas'); c.width = c.height = 512;
    var g = c.getContext('2d');
    g.fillStyle = '#101113'; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 2;
    for (var i = 0; i <= 512; i += 64) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke();
      g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke();
    }
    var t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(10, 10);
    t.anisotropy = 4;
    t.encoding = T.sRGBEncoding;
    return t;
  }

  /* ---------- stage ---------- */
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  CF.createStage = function (canvas, opts) {
    opts = opts || {};
    var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: !!opts.preserve });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr || 2));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;

    var scene = new T.Scene();
    var bg = opts.bg === undefined ? 0x0a0a0b : opts.bg;
    scene.background = new T.Color(bg);
    scene.fog = new T.Fog(bg, 14, 32);
    scene.environment = makeEnv(renderer);

    var camera = new T.PerspectiveCamera(opts.fov || 36, 1, 0.05, 120);
    camera.position.set(6.2, 2.5, 6.4);

    var controls = new T.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 0.4;
    controls.maxDistance = 13;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.target.set(0, 0.85, 0);
    controls.autoRotate = !!opts.autoRotate;
    controls.autoRotateSpeed = opts.rotateSpeed || 1.2;
    if (opts.noControls) controls.enabled = false;

    scene.add(new T.HemisphereLight(0xbfd4ff, 0x15110d, 0.35));
    var key = new T.DirectionalLight(0xffffff, 1.5);
    key.position.set(5, 9, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    var sc = key.shadow.camera; sc.left = -7; sc.right = 7; sc.top = 7; sc.bottom = -7; sc.near = 1; sc.far = 28;
    key.shadow.bias = -0.0004; key.shadow.radius = 4;
    scene.add(key);
    var rimA = new T.PointLight(0xff7a1a, 1.6, 16); rimA.position.set(-5, 2.6, -4); scene.add(rimA);
    var rimB = new T.PointLight(0x4aa8ff, 1.2, 16); rimB.position.set(5.5, 2, -5); scene.add(rimB);

    var gt = gridTexture();
    var ground = new T.Mesh(
      new T.CircleGeometry(18, 64),
      new T.MeshStandardMaterial({ color: 0xffffff, map: gt, roughness: 0.6, metalness: 0.25 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    var stage = {
      renderer: renderer, scene: scene, camera: camera, controls: controls, ground: ground,
      car: null, driving: false, visible: true, running: false
    };

    var tweens = [];      // camera tweens
    var slides = [];      // car slide animations
    var last = performance.now();

    stage.flyTo = function (pos, target, dur) {
      tweens.length = 0;
      tweens.push({
        t: 0, dur: dur || 1.1,
        p0: camera.position.clone(), p1: new T.Vector3(pos[0], pos[1], pos[2]),
        c0: controls.target.clone(), c1: new T.Vector3(target[0], target[1], target[2])
      });
    };

    stage.setCar = function (type, cfg, instant) {
      var next = CF.buildCar(type, cfg);
      scene.add(next.group);
      var old = stage.car;
      stage.car = next;
      if (instant) {
        if (old) { scene.remove(old.group); CF.disposeObject(old.group); }
        return next;
      }
      next.group.position.x = -11;
      slides.push({ obj: next, from: -11, to: 0, t: 0, dur: 1.0, drop: false });
      if (old) slides.push({ obj: old, from: 0, to: 11, t: 0, dur: 0.9, drop: true });
      return next;
    };

    stage.resize = function () {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    function frame(now) {
      if (!stage.running) return;
      requestAnimationFrame(frame);
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!stage.visible) return;

      if (tweens.length) {
        var tw = tweens[0];
        tw.t += dt / tw.dur;
        var k = ease(Math.min(tw.t, 1));
        camera.position.lerpVectors(tw.p0, tw.p1, k);
        controls.target.lerpVectors(tw.c0, tw.c1, k);
        if (tw.t >= 1) tweens.shift();
      }
      for (var i = slides.length - 1; i >= 0; i--) {
        var s = slides[i];
        s.t += dt / s.dur;
        var e = ease(Math.min(s.t, 1));
        s.obj.group.position.x = s.from + (s.to - s.from) * e;
        if (s.t >= 1) {
          if (s.drop) { scene.remove(s.obj.group); CF.disposeObject(s.obj.group); }
          slides.splice(i, 1);
        }
      }
      if (stage.driving) gt.offset.x -= dt * 0.5;
      if (stage.car) stage.car.tick(dt, stage.driving);
      slides.forEach(function (s) { if (s.drop) s.obj.tick(dt, stage.driving); });
      controls.update();
      renderer.render(scene, camera);
    }

    stage.start = function () {
      if (stage.running) return;
      stage.running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    };

    stage.renderOnce = function () {
      stage.resize();
      controls.update();
      renderer.render(scene, camera);
    };

    if (window.ResizeObserver) new ResizeObserver(function () { stage.resize(); }).observe(canvas);
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (en) { stage.visible = en[0].isIntersecting; }, { threshold: 0 }).observe(canvas);
    }
    stage.resize();
    return stage;
  };
})();
