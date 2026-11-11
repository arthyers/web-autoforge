/* AutoForge cars: parametric sedan, SUV and truck built from code.
   Every model is made of named parts so each one can be recoloured or refinished. */
(function () {
  'use strict';
  var T = THREE, CF = window.CF;

  /* x is length (front = +x), y is up, z is width (right = +z). Units are metres. */
  CF.SPECS = {
    sedan: {
      L: 4.8, W: 1.85, h: 1.47, wr: 0.34, axles: [1.45, -1.4], tireW: 0.25,
      belt: 0.93, floor: 0.36, driverZ: -0.38,
      body:  [[-2.4, 0.22], [-2.43, 0.6], [-2.36, 0.86], [-1.2, 0.9], [0.95, 0.92], [2.32, 0.8], [2.43, 0.62], [2.4, 0.22]],
      front: [[0.5, 0.22], [0.5, 0.92], [0.95, 0.92], [2.32, 0.8], [2.43, 0.62], [2.4, 0.22]],
      rear:  [[-2.4, 0.22], [-2.43, 0.6], [-2.36, 0.86], [-1.3, 0.9], [-1.3, 0.22]],
      cabin: [[-1.3, 0.9], [-0.7, 1.4], [0.3, 1.42], [1.0, 0.92]], cabinW: 0.86,
      roof:  [[-0.72, 1.36], [-0.66, 1.455], [0.32, 1.47], [0.4, 1.36]], roofW: 0.78,
      hood:  [[0.98, 0.95], [2.3, 0.85], [2.37, 0.78], [0.98, 0.84]], hoodW: 0.82,
      trunk: [[-2.34, 0.94], [-1.25, 0.97], [-1.25, 0.86], [-2.38, 0.8]],
      tub: { x: -0.4, len: 1.8 }, liner: { x: -0.15, len: 1.1, y: 1.33 },
      doors: [{ x0: 0.85, x1: -0.1 }, { x0: -0.15, x1: -0.95 }], doorY: [0.36, 0.9],
      bumper: { f: [2.3, 0.42, 0.3], r: [-2.3, 0.42, 0.3] },
      grille: [2.44, 0.55, 0.8, 0.16], head: [2.38, 0.72, 0.62], tail: [-2.4, 0.74, 0.68], plate: [2.46, -2.46, 0.4],
      mirror: [0.9, 1.0],
      seats: [-0.05, -0.9], seatScale: 0.88, dashX: 0.62, steer: [0.28, 1.0],
      rack: { y: 1.52, x0: -0.5, x1: 0.15, w: 0.74 }
    },
    suv: {
      L: 4.7, W: 1.95, h: 1.87, wr: 0.4, axles: [1.4, -1.35], tireW: 0.28,
      belt: 1.07, floor: 0.5, driverZ: -0.4,
      body:  [[-2.35, 0.3], [-2.4, 0.7], [-2.38, 1.02], [0.9, 1.06], [2.2, 0.98], [2.35, 0.9], [2.38, 0.7], [2.35, 0.3]],
      front: [[0.6, 0.3], [0.6, 1.06], [0.9, 1.06], [2.2, 0.98], [2.35, 0.9], [2.38, 0.7], [2.35, 0.3]],
      rear:  [[-2.35, 0.3], [-2.4, 0.7], [-2.38, 1.02], [-2.25, 1.04], [-2.25, 0.3]],
      cabin: [[-2.3, 1.06], [-2.2, 1.78], [0.2, 1.82], [1.0, 1.08]], cabinW: 0.88,
      roof:  [[-2.22, 1.74], [-2.18, 1.84], [0.18, 1.87], [0.26, 1.74]], roofW: 0.82,
      hood:  [[1.0, 1.12], [2.2, 1.04], [2.3, 0.94], [1.0, 1.0]], hoodW: 0.84,
      trunk: null,
      tub: { x: -0.85, len: 2.8 }, liner: { x: -1.0, len: 2.4, y: 1.72 },
      doors: [{ x0: 0.85, x1: 0.0 }, { x0: -0.05, x1: -0.8 }], doorY: [0.45, 1.04],
      bumper: { f: [2.28, 0.5, 0.34], r: [-2.28, 0.5, 0.34] },
      grille: [2.4, 0.72, 0.9, 0.22], head: [2.34, 0.9, 0.66], tail: [-2.4, 1.0, 0.74], plate: [2.45, -2.45, 0.5],
      mirror: [0.95, 1.16],
      seats: [0.1, -0.75], seatScale: 1.0, dashX: 0.78, steer: [0.4, 1.22],
      rack: { y: 1.93, x0: -1.9, x1: -0.1, w: 0.8 }
    },
    truck: {
      L: 5.6, W: 2.0, h: 1.97, wr: 0.44, axles: [1.75, -1.55], tireW: 0.3,
      belt: 1.13, floor: 0.55, driverZ: -0.42,
      body:  [[-0.6, 0.32], [-0.6, 1.1], [1.0, 1.12], [2.4, 1.05], [2.78, 0.95], [2.8, 0.7], [2.76, 0.32]],
      front: [[1.0, 0.32], [1.0, 1.12], [2.4, 1.05], [2.78, 0.95], [2.8, 0.7], [2.76, 0.32]],
      rear:  [[-0.62, 0.32], [-0.62, 1.12], [-0.46, 1.12], [-0.46, 0.32]],
      cabin: [[-0.6, 1.1], [-0.5, 1.9], [0.7, 1.92], [1.35, 1.14]], cabinW: 0.9,
      roof:  [[-0.55, 1.86], [-0.5, 1.95], [0.7, 1.97], [0.8, 1.86]], roofW: 0.84,
      hood:  [[1.4, 1.18], [2.7, 1.1], [2.82, 1.0], [1.4, 1.06]], hoodW: 0.86,
      trunk: null,
      tub: { x: 0.2, len: 1.6 }, liner: { x: 0.2, len: 1.2, y: 1.83 },
      doors: [{ x0: 1.15, x1: 0.2 }, { x0: 0.15, x1: -0.55 }], doorY: [0.5, 1.1],
      bumper: { f: [2.74, 0.52, 0.3], r: [-2.86, 0.52, 0.2] },
      grille: [2.82, 0.85, 1.0, 0.3], head: [2.78, 1.0, 0.72], tail: [-2.84, 1.0, 0.85], plate: [2.84, -2.9, 0.5],
      mirror: [1.25, 1.22],
      seats: [0.7, -0.05], seatScale: 1.0, dashX: 1.08, steer: [0.8, 1.33],
      rack: { y: 2.02, x0: -0.35, x1: 0.55, w: 0.8 },
      bed: { x0: -2.8, x1: -0.6 }
    }
  };

  var glowTex = null;
  function getGlowTex() {
    if (glowTex) return glowTex;
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var g = c.getContext('2d');
    var gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.5, 'rgba(255,255,255,0.35)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    glowTex = new T.CanvasTexture(c);
    return glowTex;
  }

  CF.buildCar = function (type, cfg) {
    var S = CF.SPECS[type];
    var W = S.W, L = S.L, wr = S.wr;
    var group = new T.Group();
    var shell = new T.Group(); group.add(shell);
    var wheelsG = new T.Group(); group.add(wheelsG);

    /* ----- materials ----- */
    var M = {};
    CF.PARTS.forEach(function (p) { M[p.id] = CF.makeMat(cfg.parts[p.id].color, cfg.parts[p.id].finish); });
    M.body.side = T.DoubleSide;
    M.glass = new T.MeshPhysicalMaterial({ color: 0x0b1016, metalness: 0.1, roughness: 0.05, transparent: true, opacity: cfg.tint, clearcoat: 1 });
    M.tire = new T.MeshStandardMaterial({ color: 0x0e0e0f, roughness: 0.85, metalness: 0, side: T.DoubleSide });
    M.dark = new T.MeshStandardMaterial({ color: 0x08090a, roughness: 0.8, metalness: 0.2 });
    M.steel = new T.MeshStandardMaterial({ color: 0x55585d, roughness: 0.4, metalness: 0.9 });
    M.liner = new T.MeshStandardMaterial({ color: 0x1b1c1e, roughness: 0.95, metalness: 0 });
    M.plate = new T.MeshStandardMaterial({ color: 0xdadde0, roughness: 0.5, metalness: 0.1 });
    M.head = new T.MeshStandardMaterial({ color: 0xffffff, emissive: new T.Color(cfg.parts.lights.color), emissiveIntensity: 1.8, roughness: 0.2 });
    M.tail = new T.MeshStandardMaterial({ color: 0x330004, emissive: new T.Color(0xff1020), emissiveIntensity: 1.6, roughness: 0.3 });
    M.glowAccent = new T.MeshStandardMaterial({ color: 0x111111, emissive: new T.Color(cfg.parts.accent.color), emissiveIntensity: 1.4, roughness: 0.4 });
    M.rims.side = T.DoubleSide;

    function mk(parent, geo, mat, x, y, z) {
      var m = new T.Mesh(geo, mat);
      m.position.set(x || 0, y || 0, z || 0);
      m.castShadow = mat !== M.glass;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    }

    /* ----- body: side walls, front and rear blocks, open cabin tub ----- */
    var wallT = 0.12;
    [-1, 1].forEach(function (s) {
      mk(shell, CF.extrude(S.body, 0.12, wallT, 0.025), M.body, 0, 0, s * (W / 2 - wallT / 2));
    });
    mk(shell, CF.extrude(S.front, 0.1, W - 2 * wallT + 0.02, 0.02), M.body);
    mk(shell, CF.extrude(S.rear, 0.1, W - 2 * wallT + 0.02, 0.02), M.body);
    mk(shell, CF.rbox(S.tub.len, 0.04, W - 2 * wallT, 0.01), M.carpet, S.tub.x, S.floor, 0);

    mk(shell, CF.extrude(S.cabin, 0.07, W * S.cabinW, 0.02), M.glass);
    var roofMesh = mk(shell, CF.extrude(S.roof, 0.04, W * S.roofW, 0.025), M.roof);
    mk(shell, CF.extrude(S.hood, 0.03, W * S.hoodW, 0.02), M.hood);
    if (S.trunk) mk(shell, CF.extrude(S.trunk, 0.03, W * S.hoodW, 0.02), M.hood);
    var liner = mk(shell, CF.rbox(S.liner.len, 0.03, W * 0.78, 0.01), M.headliner, S.liner.x, S.liner.y, 0);

    /* bumpers, grille, plates */
    var bf = S.bumper.f, br = S.bumper.r;
    mk(shell, CF.rbox(bf[2], bf[1] * 0.62, W * 0.98, 0.07), M.bumpers, bf[0], bf[1], 0);
    mk(shell, CF.rbox(br[2], br[1] * 0.62, W * 0.98, 0.07), M.bumpers, br[0], br[1], 0);
    mk(shell, CF.rbox(0.05, S.grille[3], S.grille[2], 0.04), M.dark, S.grille[0], S.grille[1], 0);
    mk(shell, CF.rbox(0.03, 0.13, 0.34, 0.01), M.plate, S.plate[0], bf[1] - 0.04, 0);
    mk(shell, CF.rbox(0.03, 0.13, 0.34, 0.01), M.plate, S.plate[1], br[1] + 0.12, 0);

    /* lights */
    [-1, 1].forEach(function (s) {
      mk(shell, CF.rbox(0.12, 0.1, 0.34, 0.04), M.head, S.head[0], S.head[1], s * S.head[2]);
      mk(shell, CF.rbox(0.08, 0.025, 0.46, 0.01), M.head, S.head[0] - 0.01, S.head[1] - 0.09, s * S.head[2]);
      mk(shell, CF.rbox(0.08, 0.1, 0.4, 0.03), M.tail, S.tail[0], S.tail[1], s * S.tail[2]);
    });

    /* mirrors */
    [-1, 1].forEach(function (s) {
      mk(shell, CF.rbox(0.12, 0.1, 0.2, 0.04), M.trim, S.mirror[0], S.mirror[1], s * (W / 2 + 0.08));
      mk(shell, CF.rbox(0.05, 0.04, 0.1, 0.01), M.trim, S.mirror[0] + 0.02, S.mirror[1] - 0.04, s * (W / 2 + 0.01));
    });

    /* wheel arches */
    var archGeo = new T.CylinderGeometry(wr * 1.2, wr * 1.2, 0.03, 32, 1, false, Math.PI / 2, Math.PI);
    archGeo.rotateX(Math.PI / 2);
    S.axles.forEach(function (ax) {
      [-1, 1].forEach(function (s) {
        mk(shell, archGeo, M.dark, ax, wr, s * (W / 2 + 0.005));
        var ring = new T.TorusGeometry(wr * 1.2, 0.028, 8, 36, Math.PI);
        mk(shell, ring, M.trim, ax, wr, s * (W / 2 + 0.018));
      });
    });

    /* truck bed and frame */
    if (S.bed) {
      var bx = (S.bed.x0 + S.bed.x1) / 2, bl = S.bed.x1 - S.bed.x0;
      mk(shell, CF.rbox(bl, 0.18, W * 0.7, 0.03), M.dark, bx, 0.42, 0);
      mk(shell, CF.rbox(bl, 0.08, W * 0.9, 0.02), M.liner, bx, 0.7, 0);
      [-1, 1].forEach(function (s) {
        mk(shell, CF.rbox(bl, 0.58, 0.09, 0.03), M.bed, bx, 0.97, s * (W / 2 - 0.045));
        var bumpG = new T.CylinderGeometry(wr * 1.2, wr * 1.2, 0.03, 32, 1, false, Math.PI / 2, Math.PI);
        bumpG.rotateX(Math.PI / 2);
        mk(shell, bumpG, M.dark, S.axles[1], wr, s * (W / 2 + 0.005));
      });
      mk(shell, CF.rbox(0.1, 0.58, W - 0.1, 0.03), M.bed, S.bed.x1 - 0.06, 0.97, 0);
      mk(shell, CF.rbox(0.1, 0.58, W - 0.1, 0.03), M.bed, S.bed.x0 + 0.05, 0.97, 0);
    }

    /* ----- doors (hinged at the front edge) ----- */
    var doors = [];
    S.doors.forEach(function (d) {
      [-1, 1].forEach(function (s) {
        var pivot = new T.Group();
        pivot.position.set(d.x0, 0, s * (W / 2 + 0.012));
        var len = d.x1 - d.x0;
        var pts = [[0, S.doorY[0]], [len, S.doorY[0]], [len, S.doorY[1]], [0, S.doorY[1]]];
        mk(pivot, CF.extrude(pts, 0.05, 0.035, 0.008), M.doors, 0, 0, 0);
        mk(pivot, CF.rbox(0.18, 0.026, 0.04, 0.01), M.trim, len * 0.8, S.doorY[1] - 0.1, s * 0.02);
        shell.add(pivot);
        doors.push({ pivot: pivot, side: s, open: 0 });
      });
    });

    /* ----- interior ----- */
    var seatGeos = {
      cushion: CF.rbox(0.55, 0.16, 0.5, 0.06),
      back: CF.rbox(0.13, 0.56, 0.5, 0.06),
      head: CF.rbox(0.1, 0.18, 0.26, 0.05),
      pipe: CF.rbox(0.02, 0.02, 0.5, 0.008)
    };
    function seat(x, z) {
      var g = new T.Group();
      g.position.set(x, S.floor, z);
      g.scale.setScalar(S.seatScale);
      mk(g, seatGeos.cushion, M.seats, 0, 0.26, 0);
      var back = mk(g, seatGeos.back, M.seats, -0.24, 0.62, 0);
      back.rotation.z = 0.18;
      var head = mk(g, seatGeos.head, M.seats, -0.31, 1.0, 0);
      head.rotation.z = 0.18;
      mk(g, seatGeos.pipe, M.glowAccent, 0.28, 0.33, 0);
      mk(g, CF.rbox(0.3, 0.2, 0.3, 0.05), M.dark, 0, 0.1, 0);
      shell.add(g);
    }
    var seatZ = S.driverZ * -1;
    S.seats.forEach(function (x) { seat(x, -seatZ); seat(x, seatZ); });

    var dashTop = S.belt + 0.15;
    var dashH = dashTop - S.floor;
    mk(shell, CF.rbox(0.5, dashH, W - 2 * wallT, 0.06), M.dash, S.dashX, S.floor + dashH / 2, 0);
    mk(shell, CF.rbox(0.34, 0.1, W - 2 * wallT, 0.04), M.dash, S.dashX - 0.04, dashTop + 0.04, 0);
    mk(shell, CF.rbox(0.03, 0.16, 0.34, 0.02), M.dark, S.dashX - 0.26, S.belt + 0.06, 0);
    mk(shell, CF.rbox(0.02, 0.02, W * 0.7, 0.008), M.glowAccent, S.dashX - 0.26, S.belt - 0.06, 0);

    var steer = new T.Group();
    steer.position.set(S.steer[0], S.steer[1], S.driverZ);
    steer.rotation.z = -0.3;
    var ring = new T.Mesh(new T.TorusGeometry(0.17, 0.024, 10, 32), M.steering);
    ring.rotation.y = Math.PI / 2; ring.castShadow = true; steer.add(ring);
    var hub = new T.Mesh(CF.rbox(0.06, 0.09, 0.09, 0.03), M.steering);
    hub.castShadow = true; steer.add(hub);
    var col = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.3, 10), M.dark);
    col.rotation.z = Math.PI / 2; col.position.x = 0.15; steer.add(col);
    shell.add(steer);

    /* ----- accessories ----- */
    var spoilerG = new T.Group();
    if (type === 'sedan') {
      mk(spoilerG, CF.rbox(0.3, 0.04, W * 0.74, 0.015), M.spoiler, -2.27, 1.13, 0);
      [-1, 1].forEach(function (s) { mk(spoilerG, CF.rbox(0.05, 0.17, 0.04, 0.01), M.spoiler, -2.22, 1.03, s * 0.55); });
    } else if (type === 'suv') {
      mk(spoilerG, CF.rbox(0.32, 0.05, W * 0.8, 0.02), M.spoiler, -2.26, 1.9, 0);
    } else {
      mk(spoilerG, CF.rbox(0.12, 0.1, W * 0.72, 0.03), M.spoiler, 0.82, 2.04, 0);
      for (var i = -3; i <= 3; i++) mk(spoilerG, CF.rbox(0.02, 0.06, 0.1, 0.01), M.head, 0.89, 2.04, i * 0.22);
    }
    spoilerG.visible = !!cfg.spoiler;
    shell.add(spoilerG);

    var rackG = new T.Group();
    var rk = S.rack, rkW = W * rk.w, rkX = (rk.x0 + rk.x1) / 2;
    [-1, 1].forEach(function (s) { mk(rackG, CF.rbox(rk.x1 - rk.x0, 0.04, 0.05, 0.015), M.trim, rkX, rk.y, s * rkW / 2); });
    [rk.x0, rk.x1, rkX].forEach(function (x) { mk(rackG, CF.rbox(0.05, 0.04, rkW, 0.015), M.trim, x, rk.y + 0.02, 0); });
    [rk.x0, rk.x1].forEach(function (x) {
      [-1, 1].forEach(function (s) { mk(rackG, CF.rbox(0.05, 0.06, 0.05, 0.015), M.trim, x, rk.y - 0.04, s * rkW / 2); });
    });
    rackG.visible = !!cfg.rack;
    shell.add(rackG);

    /* ----- underglow ----- */
    var glowMat = new T.MeshBasicMaterial({
      map: getGlowTex(), color: new T.Color(cfg.glowColor), transparent: true, opacity: 0.9,
      blending: T.AdditiveBlending, depthWrite: false
    });
    var glowPlane = new T.Mesh(new T.PlaneGeometry(L * 1.25, W * 1.9), glowMat);
    glowPlane.rotation.x = -Math.PI / 2; glowPlane.position.y = 0.015;
    var glowLight = new T.PointLight(new T.Color(cfg.glowColor), 2.4, 6.5);
    glowLight.position.set(0, 0.18, 0);
    glowPlane.visible = glowLight.visible = !!cfg.underglow;
    group.add(glowPlane); group.add(glowLight);

    /* ----- wheels ----- */
    var tireW = S.tireW, tireGeo;
    (function () {
      var R = wr, rimR = R * 0.64, hw = tireW / 2;
      var pts = [
        [rimR * 0.98, -hw], [R * 0.93, -hw], [R * 0.985, -hw * 0.7], [R, -hw * 0.25],
        [R, hw * 0.25], [R * 0.985, hw * 0.7], [R * 0.93, hw], [rimR * 0.98, hw]
      ].map(function (p) { return new T.Vector2(p[0], p[1]); });
      tireGeo = new T.LatheGeometry(pts, 48);
      tireGeo.rotateX(Math.PI / 2);
    })();

    var rimR = wr * 0.64;
    var wheels = [];

    function buildRim(styleId) {
      var st = CF.RIM_STYLES.filter(function (r) { return r.id === styleId; })[0] || CF.RIM_STYLES[0];
      var g = new T.Group();
      var zf = tireW * 0.2;
      var barrel = new T.CylinderGeometry(rimR, rimR, tireW * 0.85, 36, 1, true); barrel.rotateX(Math.PI / 2);
      mk(g, barrel, M.rims);
      var lip = new T.TorusGeometry(rimR, 0.014, 8, 40);
      mk(g, lip, M.rims, 0, 0, tireW * 0.43);
      var back = new T.CylinderGeometry(rimR * 0.97, rimR * 0.97, 0.02, 32); back.rotateX(Math.PI / 2);
      mk(g, back, M.dark, 0, 0, -0.02);
      var bd = new T.CylinderGeometry(rimR * 0.8, rimR * 0.8, 0.025, 36); bd.rotateX(Math.PI / 2);
      mk(g, bd, M.steel, 0, 0, tireW * 0.02);
      var cal = mk(g, CF.rbox(0.14, 0.2, 0.07, 0.03), M.calipers, rimR * 0.5, rimR * 0.5, tireW * 0.1);
      cal.rotation.z = Math.PI / 4;
      if (st.disc) {
        var d = new T.CylinderGeometry(rimR * 0.97, rimR * 0.97, 0.03, 40); d.rotateX(Math.PI / 2);
        mk(g, d, M.rims, 0, 0, zf);
      } else {
        var len = rimR * 0.94, sk = st.skew * rimR * 0.25;
        var pts = [[0.03, -st.w / 2], [len, -st.w / 2 * 0.8 + sk], [len, st.w / 2 * 0.8 + sk], [0.03, st.w / 2]];
        var sg = CF.extrude(pts, Math.min(0.006, st.w / 3), 0.03, 0.004);
        for (var i = 0; i < st.n; i++) {
          var sp = mk(g, sg, M.rims, 0, 0, zf);
          sp.rotation.z = i / st.n * Math.PI * 2;
        }
        if (st.ring) mk(g, new T.TorusGeometry(rimR * 0.55, 0.012, 8, 36), M.rims, 0, 0, zf);
      }
      var cap = new T.CylinderGeometry(rimR * 0.16, rimR * 0.16, 0.05, 20); cap.rotateX(Math.PI / 2);
      mk(g, cap, M.rims, 0, 0, zf + 0.02);
      return g;
    }

    S.axles.forEach(function (ax) {
      [-1, 1].forEach(function (s) {
        var holder = new T.Group();
        holder.position.set(ax, wr, s * (W / 2 - tireW / 2 + 0.02));
        if (s < 0) holder.rotation.y = Math.PI;
        var spin = new T.Group();
        mk(spin, tireGeo, M.tire);
        var rim = buildRim(cfg.rim);
        spin.add(rim);
        holder.add(spin);
        wheelsG.add(holder);
        wheels.push({ holder: holder, spin: spin, rim: rim, dir: s < 0 ? 1 : -1 });
      });
    });

    /* ----- state and animation ----- */
    var anims = {};
    var mode = 'exterior';
    var glowOn = !!cfg.underglow;
    var time = 0;
    shell.position.y = cfg.height || 0;

    var h = S.h;
    var views = {
      three:   { pos: [L * 1.3, h * 1.1, L * 1.33], target: [0, h * 0.5, 0] },
      front:   { pos: [L * 1.45, h * 0.75, L * 0.2], target: [0, h * 0.5, 0] },
      rear:    { pos: [-L * 1.45, h * 0.8, -L * 0.22], target: [0, h * 0.5, 0] },
      side:    { pos: [0.001, h * 0.7, L * 1.55], target: [0, h * 0.5, 0] },
      top:     { pos: [0.01, L * 1.75, 0.01], target: [0, 0.4, 0] },
      cutaway: { pos: [-L * 0.5, h * 2.1, L * 0.6], target: [S.tub.x, S.floor + 0.25, 0] },
      driver:  { pos: [S.steer[0] - 0.62, S.steer[1] + 0.3, S.driverZ + 0.05], target: [S.dashX, S.steer[1] - 0.05, S.driverZ * 0.4] }
    };

    var car = {
      type: type, group: group, M: M, views: views, spec: S,

      setColor: function (id, hex, animate) {
        if (id === 'lights') { M.head.emissive.set(hex); return; }
        if (id === 'accent') { M.glowAccent.emissive.set(hex); return; }
        var mat = M[id]; if (!mat) return;
        var to = new T.Color(hex);
        if (!animate) { mat.color.copy(to); delete anims[id]; return; }
        anims[id] = { mat: mat, from: mat.color.clone(), to: to, t: 0 };
      },
      setFinish: function (id, finish) { if (M[id] && id !== 'lights' && id !== 'accent') CF.applyFinish(M[id], finish); },

      setRim: function (styleId) {
        wheels.forEach(function (w) {
          w.spin.remove(w.rim);
          CF.disposeObject(w.rim);
          w.rim = buildRim(styleId);
          w.spin.add(w.rim);
        });
      },
      setSpoiler: function (v) { spoilerG.visible = !!v; },
      setRack: function (v) { rackG.visible = !!v; },
      setHeight: function (v) { shell.position.y = v; },
      setTint: function (v) { if (mode === 'exterior') M.glass.opacity = v; },
      setGlow: function (on, hex) {
        glowOn = !!on;
        glowPlane.visible = glowLight.visible = glowOn;
        if (hex) { glowMat.color.set(hex); glowLight.color.set(hex); }
      },
      setDoors: function (open) { doors.forEach(function (d) { d.target = open ? 1 : 0; }); },
      setMode: function (m, tint) {
        mode = m;
        roofMesh.visible = liner.visible = (m !== 'cutaway');
        M.glass.opacity = m === 'exterior' ? tint : 0.08;
      },

      tick: function (dt, driving) {
        time += dt;
        Object.keys(anims).forEach(function (k) {
          var a = anims[k];
          a.t += dt / 0.45;
          var e = Math.min(a.t, 1); e = e * e * (3 - 2 * e);
          a.mat.color.lerpColors(a.from, a.to, e);
          if (a.t >= 1) delete anims[k];
        });
        doors.forEach(function (d) {
          var tgt = d.target || 0;
          d.open += (tgt - d.open) * Math.min(dt * 5, 1);
          d.pivot.rotation.y = d.side * d.open * 1.0;
        });
        var spd = driving ? 14 : 0;
        if (spd) wheels.forEach(function (w) { w.spin.rotation.z += w.dir * spd * dt / wr; });
        if (glowOn) glowLight.intensity = 2.2 + Math.sin(time * 2) * 0.35;
        if (driving) shell.position.y = (cfg.height || 0) + Math.sin(time * 18) * 0.003;
      }
    };
    return car;
  };
})();
