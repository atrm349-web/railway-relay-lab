(function (root) {
  'use strict';
  const T = root.THREE;
  if (!T) return;
  const C = {
    copper: 0xc97f3d, sleeve: 0xd97834, iron: 0x7b90a4, steel: 0xa4b8c8,
    dark: 0x22323f, bakelite: 0x18232d, base: 0x1a2631,
    brass: 0xd8b66c, silver: 0xeef5f9, carbon: 0x2a353f, ceramic: 0xe8efe9, pcb: 0x1f5e4b,
    tape: 0xdfd0ab, crimson: 0xc8162d, pearl: 0xf0f4f8, charcoal: 0x232d36,
    green: 0x7de0bd, red: 0xd06a77, blue: 0x78a8e7, amber: 0xefb860,
    rose: 0xe0829d, violet: 0xb98ef0, white: 0xe8f4fc
  };
  function material(color, metalness = .64, roughness = .28) {
    return new T.MeshStandardMaterial({ color, metalness, roughness });
  }
  function mesh(group, geometry, mat, x, y, z, part) {
    const o = new T.Mesh(geometry, mat);
    o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true;
    o.userData.part = part; if (part) o.name = part;
    group.add(o); return o;
  }
  function box(g, w, h, d, x, y, z, mat, part) {
    return mesh(g, new T.BoxGeometry(w, h, d), mat, x, y, z, part);
  }
  const bevelCache = new Map();
  function bevelBox(g, w, h, d, x, y, z, mat, part, b = .018) {
    const bw = Math.max(.02, w - b * 2), bh = Math.max(.02, h - b * 2), bd = Math.max(.01, d - b * 2);
    const key = `${bw.toFixed(3)}_${bh.toFixed(3)}_${bd.toFixed(3)}_${b.toFixed(3)}`;
    let geo = bevelCache.get(key);
    if (!geo) {
      const r = Math.min(b, bw * .25, bh * .25);
      const s = new T.Shape();
      const x0 = -bw / 2, y0 = -bh / 2, x1 = bw / 2, y1 = bh / 2;
      s.moveTo(x0 + r, y0);
      s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r);
      s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1);
      s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r);
      s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
      geo = new T.ExtrudeGeometry(s, { depth: bd, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 4 });
      geo.center();
      bevelCache.set(key, geo);
    }
    return mesh(g, geo.clone(), mat, x, y, z, part);
  }
  function cylinder(g, radius, length, x, y, z, mat, part, axis = 'x', segs = 32) {
    const m = mesh(g, new T.CylinderGeometry(radius, radius, length, segs), mat, x, y, z, part);
    if (axis === 'x') m.rotation.z = Math.PI / 2;
    if (axis === 'z') m.rotation.x = Math.PI / 2;
    return m;
  }
  function hexNut(g, radius, thickness, x, y, z, mat, part, axis = 'x') {
    cylinder(g, radius * 1.28, thickness * .28, x, y, z, mat, part, axis, 24);
    return cylinder(g, radius, thickness, x, y, z, mat, part, axis, 6);
  }
  function contactRivet(g, radius, height, x, y, z, mat, part, dir = 1) {
    const pts = [
      new T.Vector2(0, 0),
      new T.Vector2(radius * .62, 0),
      new T.Vector2(radius, height * .35),
      new T.Vector2(radius * .92, height * .72),
      new T.Vector2(radius * .55, height * .94),
      new T.Vector2(0, height)
    ];
    const geo = new T.LatheGeometry(pts, 20);
    if (dir < 0) geo.rotateX(Math.PI);
    return mesh(g, geo, mat, x, y, z, part);
  }
  function bentPlate(g, polyPts, depthZ, x, y, z, mat, part, b = .010) {
    const s = new T.Shape();
    polyPts.forEach(([px, py], idx) => { if (idx === 0) s.moveTo(px, py); else s.lineTo(px, py); });
    s.closePath();
    const geo = new T.ExtrudeGeometry(s, { depth: depthZ, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2 });
    geo.translate(0, 0, -depthZ / 2);
    return mesh(g, geo, mat, x, y, z, part);
  }
  function wireTube(g, pts3D, radius, mat, part) {
    const curve = new T.CatmullRomCurve3(pts3D.map(p => new T.Vector3(...p)));
    return mesh(g, new T.TubeGeometry(curve, 28, radius, 8, false), mat, 0, 0, 0, part);
  }
  function line3(g, pts, color, opacity = 1, part) {
    const geo = new T.BufferGeometry().setFromPoints(pts.map(p => new T.Vector3(...p)));
    const o = new T.Line(geo, new T.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
    o.userData.part = part; g.add(o); return o;
  }
  class Helix extends T.Curve {
    constructor(length, radius, turns) { super(); Object.assign(this, { length, radius, turns }); }
    getPoint(t, target = new T.Vector3()) {
      const a = t * this.turns * Math.PI * 2;
      return target.set((t - .5) * this.length, Math.cos(a) * this.radius, Math.sin(a) * this.radius);
    }
  }
  function makeCoilBandMat(bandText = '') {
    if (typeof document === 'undefined' || !bandText) return material(C.tape, .12, .65);
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e2d2ac';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = 'rgba(130,98,52,0.11)';
    for (let x = 0; x < 256; x += 10) ctx.fillRect(x, 0, 2, 256);
    ctx.fillStyle = '#3c2a14';
    ctx.fillRect(0, 6, 256, 3);
    ctx.fillRect(0, 247, 256, 3);
    // 圆柱绕 X 轴横放（rotation.z = π/2），文字旋转 90° 使其沿线圈水平正读
    for (const cx of [64, 192]) {
      ctx.save();
      ctx.translate(cx, 128);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#2b1e0e';
      ctx.font = '700 26px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(bandText, 0, 0);
      ctx.restore();
    }
    const tex = new T.CanvasTexture(canvas);
    tex.colorSpace = T.SRGBColorSpace;
    return new T.MeshStandardMaterial({ map: tex, metalness: .08, roughness: .56 });
  }
  function makeRelayNameplateMat(modelCode, contactText) {
    if (typeof document === 'undefined') return material(0x283644, .65, .32);
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 96;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, '#141f2c'); grad.addColorStop(.5, '#1b2a3a'); grad.addColorStop(1, '#141f2c');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 96);
    ctx.strokeStyle = '#c5a566'; ctx.lineWidth = 4; ctx.strokeRect(4, 4, 504, 88);
    ctx.fillStyle = '#eef5fb';
    ctx.font = '700 34px ui-monospace,SFMono-Regular,Menlo,monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(modelCode || 'JWXC-1700', 22, 49);
    ctx.fillStyle = '#7de0bd';
    ctx.font = '600 22px -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(contactText || 'AX 安全型继电器', 490, 49);
    const tex = new T.CanvasTexture(canvas);
    tex.colorSpace = T.SRGBColorSpace;
    return new T.MeshStandardMaterial({ map: tex, metalness: .42, roughness: .32 });
  }
  // 真实AX继电器双线圈：带阶梯胶木线轴、多层铜绕组、印字绝缘包封腰带与焊片引线
  function coil(g, x, y, z, length, name, axis = 'x', color = C.copper, turns = 28, wireRadius = .026, bandText = '') {
    const group = new T.Group(); group.position.set(x, y, z); g.add(group);
    if (axis === 'y') group.rotation.z = Math.PI / 2;
    if (axis === 'z') group.rotation.y = Math.PI / 2;
    const spool = material(C.bakelite, .22, .36), copper = material(color, .86, .18);
    const band = makeCoilBandMat(bandText), lug = material(C.brass, .84, .20);
    cylinder(group, .38, length, 0, 0, 0, spool, name);
    cylinder(group, .448, length - .14, 0, 0, 0, copper, name);
    for (const s of [-1, 1]) {
      cylinder(group, .545, .055, s * (length / 2 - .028), 0, 0, spool, name, 'x', 36);
      cylinder(group, .51, .085, s * (length / 2 - .042), 0, 0, spool, name, 'x', 36);
      cylinder(group, .552, .016, s * (length / 2 - .006), 0, 0, lug, name, 'x', 36);
      box(group, .035, .15, .085, s * (length / 2 - .03), -.46, .32, lug, name);
      cylinder(group, .022, .05, s * (length / 2 - .03), -.51, .34, lug, name, 'z', 12);
    }
    mesh(group, new T.TubeGeometry(new Helix(length - .14, .470, turns), 300, wireRadius, 7, false), copper, 0, 0, 0, name);
    const wrap = cylinder(group, .486, length * .44, 0, 0, 0, band, name, 'x', 36);
    wrap.rotation.x = Math.PI / 2;
    return { group, copper };
  }
  function label(g, text, pos, target, list) {
    const anchor = new T.Object3D();
    anchor.position.set(...pos);
    anchor.userData.label = text;
    anchor.userData.labelTarget = target || null;
    g.add(anchor);
    if (list) list.push(anchor);
    return anchor;
  }
  function makeLoop(g, pts, color, dotCount = 10) {
    const line = line3(g, pts, color, .48);
    line.material.depthTest = false; line.renderOrder = 3;
    const curve = new T.CatmullRomCurve3(pts.map(p => new T.Vector3(...p)), true, 'catmullrom', .08);
    const dotMat = new T.MeshBasicMaterial({ color, depthTest: false });
    const dots = Array.from({ length: dotCount }, () => {
      const d = mesh(g, new T.SphereGeometry(.042, 10, 8), dotMat, 0, 0, 0);
      d.renderOrder = 4; return d;
    });
    return { line, curve, dots, setVisible(v) { line.visible = v; dots.forEach(d => { d.visible = v; }); } };
  }

  function createInterface(caption) {
    const rootGroup = new T.Group();
    rootGroup.name = 'textbook-interface-only';
    const fixed = new T.Group(), magnet = new T.Group(), mechanism = new T.Group(), contacts = new T.Group(), field = new T.Group();
    rootGroup.add(fixed, magnet, mechanism, contacts, field);
    const labelList = [];
    const mats = {
      dark: material(C.dark, .28, .40), base: material(C.base, .25, .45),
      iron: material(C.iron, .80, .26), brass: material(C.brass, .78, .25),
      contact: material(C.silver, .88, .16), ceramic: material(C.ceramic, .15, .50),
      track: material(0x2a6f5b, .40, .35), local: material(0x2d588a, .40, .35),
      vane: material(0xc4d4e0, .85, .20)
    };
    bevelBox(fixed, 6.4, .24, 2.45, 0, -.08, 0, mats.base, 'base', .025);
    bevelBox(fixed, 6.1, .08, 2.2, 0, .06, 0, mats.dark, 'base', .015);

    bevelBox(magnet, 2.42, 3.45, .18, -1.75, 1.95, -.15, mats.dark, 'base', .02);
    const trackLines = [], localLines = [];
    for (const [y, name, pins, partName, mat, arr, cHex] of [
      [2.75, '轨道线圈', '3 — 4', 'trackCoil', mats.track, trackLines, C.green],
      [1.35, '局部线圈', '1 — 2', 'localCoil', mats.local, localLines, C.blue]
    ]) {
      const ring = mesh(magnet, new T.TorusGeometry(.36, .05, 16, 48), mat, -1.75, y, .02, partName);
      ring.userData.part = partName;
      bevelBox(magnet, .52, .065, .065, -1.75, y, .02, mat, partName, .01);
      hexNut(magnet, .065, .16, -2.55, y, .02, mats.brass, partName, 'z');
      hexNut(magnet, .065, .16, -.95, y, .02, mats.brass, partName, 'z');
      arr.push(
        line3(magnet, [[-2.75, y, .04], [-2.11, y, .04]], cHex, 1, partName),
        line3(magnet, [[-1.39, y, .04], [-.75, y, .04]], cHex, 1, partName)
      );
      label(magnet, `${name} ${pins}`, [-1.75, y + .56, .2], [-1.75, y + .32, .02], labelList);
    }
    bevelBox(magnet, .52, .22, .16, -1.75, 3.42, .02, mats.ceramic, 'trackCoil', .015);
    line3(magnet, [[-2.35, 2.75, .04], [-2.35, 3.42, .04], [-1.15, 3.42, .04], [-1.15, 2.75, .04]], 0x6f8fa6, .8, 'trackCoil');
    label(magnet, 'Z · HF 跨接轨道侧', [-1.75, 3.82, .25], [-1.75, 3.48, .02], labelList);
    cylinder(magnet, .12, .38, -1.75, .68, .02, mats.brass, 'localCoil', 'x', 24);
    line3(magnet, [[-2.35, 1.35, .04], [-2.35, .68, .04], [-1.94, .68, .04]], 0x6f8fa6, .8, 'localCoil');
    line3(magnet, [[-1.56, .68, .04], [-1.15, .68, .04], [-1.15, 1.35, .04]], 0x6f8fa6, .8, 'localCoil');
    label(magnet, '电容 C 并接局部侧', [-1.75, .32, .25], [-1.75, .62, .02], labelList);

    bevelBox(magnet, 1.55, .18, .62, 1.05, .62, 0, mats.iron, 'trackCoil', .02);
    bevelBox(magnet, .34, 1.45, .56, .55, 1.42, 0, mats.iron, 'trackCoil', .02);
    bevelBox(magnet, .34, 1.45, .56, 1.55, 1.42, 0, mats.iron, 'localCoil', .02);
    const trkCoil3D = coil(magnet, .55, 1.35, 0, .78, 'trackCoil', 'y', C.copper, 22, .024, '轨道 3-4');
    const locCoil3D = coil(magnet, 1.55, 1.35, 0, .78, 'localCoil', 'y', 0x5c8ec9, 22, .024, '局部 1-2');

    const vanePivot = new T.Group(); vanePivot.position.set(.32, 2.15, 0); mechanism.add(vanePivot);
    cylinder(mechanism, .075, .72, .32, 2.15, 0, mats.brass, 'armature', 'z');
    bevelBox(vanePivot, 1.45, .075, .46, .68, 0, 0, mats.vane, 'armature', .012);
    const sectorPts = [[-.05, 0], [.98, .12], [1.12, -.42], [.38, -.52]];
    bentPlate(vanePivot, sectorPts, .045, .05, 0, 0, mats.vane, 'armature');
    bevelBox(vanePivot, .36, .18, .54, -.26, -.06, 0, mats.dark, 'weight', .018);
    cylinder(vanePivot, .048, .24, 1.32, .04, .22, mats.brass, 'rod', 'z');
    label(mechanism, '感应翼片（补充示意·装配未核实）', [.85, 2.75, .45], [1.0, 2.18, 0], labelList);

    const rod = new T.Group(); rod.position.set(1.64, 2.19, .24); mechanism.add(rod);
    bevelBox(rod, .068, 1.25, .078, 0, .55, 0, mats.dark, 'rod', .01);
    cylinder(rod, .062, .15, 0, .92, 0, mats.ceramic, 'rod', 'z');

    bevelBox(contacts, .36, 1.50, .88, 2.45, 3.05, 0, mats.dark, 'contactBlock', .02);
    bevelBox(contacts, .24, 1.28, .78, .95, 3.05, 0, mats.dark, 'contactBlock', .02);
    const fm = material(C.silver, .88, .15), bm = material(C.silver, .88, .15);
    bevelBox(contacts, .88, .035, .22, 2.02, 3.20, .24, mats.brass, 'front', .006);
    contactRivet(contacts, .072, .04, 1.64, 3.185, .24, fm, 'front', -1);
    bevelBox(contacts, .88, .035, .22, 2.02, 3.00, .24, mats.brass, 'back', .006);
    contactRivet(contacts, .072, .04, 1.64, 3.015, .24, bm, 'back', 1);
    const lever = new T.Group(); lever.position.set(1.02, 3.10, .24); contacts.add(lever);
    bevelBox(lever, .72, .026, .18, .34, 0, 0, mats.brass, 'common', .005);
    contactRivet(lever, .068, .038, .62, .01, 0, mats.contact, 'common', 1);
    label(contacts, 'GJ常态吸起↑ · 平时11-12闭合', [2.35, 3.92, .35], [1.85, 3.20, .24], labelList);
    label(fixed, caption || '图5.3.3 · 二元二位接口与相敏联动示意', [0, 4.42, 0], null, labelList);

    const trkLoop = makeLoop(field, [[.55, .95, 0], [.55, 2.05, 0], [1.05, 2.05, 0], [1.05, .95, 0]], C.green, 8);
    const locLoop = makeLoop(field, [[1.55, .95, 0], [1.55, 2.05, 0], [1.05, 2.05, 0], [1.05, .95, 0]], C.blue, 8);

    return {
      root: rootGroup, type: 'phase', coils: [trkCoil3D, locCoil3D], physical: false,
      setView(s) {
        const e = (s.explode || 0) / 100;
        fixed.position.set(0, 0, 0);
        magnet.position.set(-.65 * e, .45 * e, -.45 * e);
        mechanism.position.set(.15 * e, .95 * e, .55 * e);
        contacts.position.set(.95 * e, 1.35 * e, 0);
        field.visible = !!s.field && e < .35;
        labelList.forEach(l => { l.visible = !!s.labels; });
      },
      pose(p, r, s, time) {
        const a = Math.max(0, Math.min(1, p));
        const rev = r.drive && r.localEnergized && s && s.phase === 'reversed';
        const theta = rev ? -.14 : (-.07 + a * .16);
        vanePivot.rotation.z = theta;
        rod.position.y = 2.19 + 1.0 * (Math.sin(theta) - Math.sin(-.07));
        lever.rotation.z = -.06 + a * .12;
        const fc = a > .94, bc = a < .06;
        fm.color.setHex(fc ? C.green : C.silver); fm.emissive.setHex(fc ? 0x163d2b : 0);
        bm.color.setHex(bc ? C.green : C.silver); bm.emissive.setHex(bc ? 0x163d2b : 0);
        mats.track.emissive.setHex(r.drive ? 0x184d3b : 0);
        mats.local.emissive.setHex(r.localEnergized ? 0x193b63 : 0);
        trkCoil3D.copper.emissive.setHex(r.drive ? 0x623412 : 0); trkCoil3D.copper.emissiveIntensity = .7;
        locCoil3D.copper.emissive.setHex(r.localEnergized ? 0x1d426e : 0); locCoil3D.copper.emissiveIntensity = .7;
        trackLines.forEach(l => l.material.color.setHex(r.drive ? C.green : 0x5b7184));
        localLines.forEach(l => l.material.color.setHex(r.localEnergized ? C.blue : 0x5b7184));
        trkLoop.setVisible(!!r.drive);
        locLoop.setVisible(!!r.localEnergized);
        const dir = rev ? -1 : 1;
        trkLoop.dots.forEach((d, i) => d.position.copy(trkLoop.curve.getPoint(((time * .16 * dir + i / trkLoop.dots.length) % 1 + 1) % 1)));
        locLoop.dots.forEach((d, i) => d.position.copy(locLoop.curve.getPoint(((time * .16 + .25 + i / locLoop.dots.length) % 1 + 1) % 1)));
      },
      dispose() {
        const gs = new Set(), ms = new Set(), maps = new Set();
        rootGroup.traverse(o => {
          if (o.geometry) gs.add(o.geometry);
          if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { ms.add(m); if (m.map) maps.add(m.map); });
        });
        gs.forEach(g => g.dispose()); maps.forEach(t => t.dispose()); ms.forEach(m => m.dispose());
      }
    };
  }

  // 专题 A：第 4.2 节自闭电路（图4.2.2）与第 4.3 节断线/混线防护（图4.3.1–4.3.2）3D 双继电器联动实验台
  function stepSmooth(cur, goal, speed, dt, slow) {
    if (dt <= 0) return goal;
    const maxStep = speed * (slow ? .28 : 1) * dt;
    const diff = goal - cur;
    return Math.abs(diff) <= maxStep ? goal : cur + Math.sign(diff) * maxStep;
  }

  function createSelfHoldLab(caption) {
    const rootGroup = new T.Group(); rootGroup.name = 'textbook-interface-only';
    rootGroup.userData.model = '图4.2.2 自闭电路 + 图4.3.1/4.3.2 断线与位置法混线防护';
    rootGroup.userData.contacts = 'FUJ(11-13后接点) + 按钮A常开 + AJ(11-12前接点自闭)';
    rootGroup.userData.referencePDFPages = [61, 62, 63, 64, 65];
    const fixed = new T.Group(), leftUnit = new T.Group(), rightUnit = new T.Group(), consoleUnit = new T.Group(), field = new T.Group();
    rootGroup.add(fixed, leftUnit, rightUnit, consoleUnit, field);
    const labelList = [];

    const mats = {
      base: material(0x16222e, .32, .52),
      bakelite: material(C.bakelite, .24, .36),
      brass: material(C.brass, .85, .20),
      steel: material(C.steel, .86, .20),
      copper: material(C.copper, .82, .24),
      green: material(C.green, .35, .28),
      red: material(C.red, .35, .28),
      amber: material(C.amber, .35, .28)
    };

    // 实验台底座与 KZ/KF 汇流母线排
    bevelBox(fixed, 9.6, .28, 5.4, 0, .08, 0, mats.base, 'base', .022);
    bevelBox(fixed, 8.8, .06, .14, 0, .24, -2.25, mats.brass, 'terminals', .006); // KZ (+24V) 母线
    bevelBox(fixed, 8.8, .06, .14, 0, .24, 2.25, mats.steel, 'terminals', .006);  // KF (-24V) 母线
    label(fixed, caption || '图4.2.2 自闭电路（启动+自闭+共用支路）与图4.3.2 位置法防护', [0, 4.35, -1.2], null, labelList);

    // 左侧：复原继电器 FUJ（真实 JWXC-1700 3D 机构缩放嵌入）
    const fujRelay = createRelay('neutral');
    fujRelay.root.traverse(o => { delete o.userData.label; });
    fujRelay.setView({ labels: false, cover: false, explode: 0, field: false });
    fujRelay.root.scale.setScalar(.54);
    fujRelay.root.position.set(-2.45, .22, -.45);
    leftUnit.add(fujRelay.root);
    label(leftUnit, 'FUJ 复原继电器（常态↓ · 11-13后接点串入共用电路）', [-2.65, 3.05, -.45], [-1.55, 1.95, -.3], labelList);

    // 右侧：按钮继电器 AJ（真实 JWXC-1700 3D 机构缩放嵌入）
    const ajRelay = createRelay('neutral');
    ajRelay.root.traverse(o => { delete o.userData.label; });
    ajRelay.setView({ labels: false, cover: false, explode: 0, field: false });
    ajRelay.root.scale.setScalar(.54);
    ajRelay.root.position.set(2.15, .22, -.45);
    rightUnit.add(ajRelay.root);
    label(rightUnit, 'AJ 按钮继电器（常态↓ · 11-12前接点构成自闭支路）', [2.35, 3.05, -.45], [3.05, 2.05, -.3], labelList);

    // 前排左：控制台自复式按钮 A（带弹簧复位柱塞与前露式常开触桥，直观观察按下闭合/松开自复）
    const btnGroup = new T.Group(); btnGroup.position.set(-.35, .24, 1.38); consoleUnit.add(btnGroup);
    bevelBox(btnGroup, 1.45, .62, .96, 0, .31, -.08, mats.bakelite, 'common', .018);
    bevelBox(btnGroup, .32, .06, .24, -.38, .28, .48, mats.brass, 'front', .005);
    bevelBox(btnGroup, .32, .06, .24, .38, .28, .48, mats.brass, 'front', .005);
    const plunger = new T.Group(); plunger.position.set(0, .68, 0); btnGroup.add(plunger);
    const btnCapMat = material(0x28a87e, .35, .32);
    cylinder(plunger, .34, .22, 0, .18, -.08, btnCapMat, 'common', 'y', 28);
    cylinder(plunger, .11, .48, 0, -.12, -.08, mats.steel, 'common', 'y', 20);
    bevelBox(plunger, .14, .06, .58, 0, -.20, .20, mats.steel, 'common', .005);
    const btnBridgeMat = material(C.silver, .9, .15);
    bevelBox(plunger, .96, .052, .22, 0, -.21, .48, btnBridgeMat, 'common', .005);
    label(consoleUnit, '自复式按钮 A（按下接通启动支路 · 松手自动断开）', [-.45, 1.72, 1.65], [-.35, .95, 1.38], labelList);

    // 前排右：图 4.3.1 断线点与图 4.3.2 电缆混线/远端供电位置法模块
    const faultGroup = new T.Group(); faultGroup.position.set(-3.15, .24, 1.38); consoleUnit.add(faultGroup);
    bevelBox(faultGroup, 1.95, .44, 1.05, 0, .22, 0, mats.bakelite, 'terminals', .016);
    const wireBreakBridge = bevelBox(faultGroup, .68, .05, .14, -.35, .48, 0, mats.brass, 'terminals', .004);
    const shortBarMat = material(C.red, .5, .3);
    const shortBar = bevelBox(faultGroup, .14, .06, .74, .45, .48, 0, shortBarMat, 'terminals', .004);
    shortBar.visible = false;
    label(consoleUnit, '共用线断线 / 电缆混线故障实验区', [-3.15, 1.48, 1.65], [-3.15, .72, 1.38], labelList);

    // 三条核心电流回路动态粒子流 + 混线危险旁路红流
    const commonLoop = makeLoop(field, [[-3.8, .32, -2.15], [-1.6, .32, -2.15], [-1.3, 1.75, -.3], [-.35, 1.15, .5], [-.35, .32, -2.15]], C.green, 7);
    const startLoop = makeLoop(field, [[-.35, .55, 1.38], [.65, .55, 1.38], [1.45, .75, -.2], [2.15, .75, -.2], [2.15, .32, 2.15], [-.35, .32, 2.15]], 0x62b6ff, 8);
    const holdLoop = makeLoop(field, [[1.35, 1.65, -.3], [3.25, 1.95, -.3], [3.25, .78, -.2], [1.45, .78, -.2]], C.amber, 8);
    const mixLoop = makeLoop(field, [[-3.15, .68, 1.38], [-.85, .68, 1.38], [1.65, .78, .25], [2.15, .78, -.2], [2.15, .32, 2.15]], C.red, 7);
    const anim = { lastT: null, fuj: 0, aj: 0, btnY: .68, brkRot: 0 };

    return {
      root: rootGroup, type: 'selfHold', physical: false,
      setView(s) {
        const e = (s.explode || 0) / 100;
        fixed.position.set(0, 0, 0);
        leftUnit.position.set(-.85 * e, .55 * e, -.45 * e);
        rightUnit.position.set(.85 * e, .55 * e, -.45 * e);
        consoleUnit.position.set(0, .42 * e, .85 * e);
        field.visible = !!s.field && e < .45;
        labelList.forEach(l => { l.visible = !!s.labels; });
      },
      pose(p, r, s, time) {
        const sh = r.selfHold || { ajPicked: r.picked, fujPicked: false, buttonClosed: false, commonLive: false, startBranchLive: false, holdBranchLive: false, wireBreak: false, crossFault: 'none', wrongMixEnergized: false };
        const t = time || 0;
        const dt = anim.lastT === null ? 0 : Math.max(0, Math.min(.08, t - anim.lastT));
        anim.lastT = t;
        const slow = !!(s && s.slow);
        anim.fuj = stepSmooth(anim.fuj, sh.fujPicked ? 1 : 0, 5.5, dt, slow);
        anim.aj = stepSmooth(anim.aj, sh.ajPicked ? 1 : 0, 5.5, dt, slow);
        anim.btnY = stepSmooth(anim.btnY, sh.buttonClosed ? .52 : .68, 1.4, dt, slow);
        anim.brkRot = stepSmooth(anim.brkRot, sh.wireBreak ? .58 : 0, 4.5, dt, slow);

        fujRelay.pose(anim.fuj, { picked: sh.fujPicked, drive: sh.fujPicked, localEnergized: false }, { mode: 'bench', polarity: sh.fujPicked ? 1 : 0 }, t);
        ajRelay.pose(anim.aj, { picked: sh.ajPicked, drive: sh.ajPicked, localEnergized: false }, { mode: 'bench', polarity: sh.ajPicked ? 1 : 0 }, t);
        plunger.position.y = anim.btnY;
        btnCapMat.emissive.setHex(sh.buttonClosed ? 0x18523d : 0);
        btnBridgeMat.color.setHex(sh.buttonClosed ? C.green : C.silver);
        wireBreakBridge.rotation.z = anim.brkRot;
        wireBreakBridge.material.color.setHex(sh.wireBreak ? C.red : C.brass);
        shortBar.visible = sh.crossFault !== 'none';
        shortBarMat.color.setHex(sh.wrongMixEnergized ? C.red : C.amber);

        commonLoop.setVisible(!!sh.commonLive);
        startLoop.setVisible(!!sh.startBranchLive);
        holdLoop.setVisible(!!sh.holdBranchLive && !sh.wrongMixEnergized);
        mixLoop.setVisible(!!sh.wrongMixEnergized);
        commonLoop.dots.forEach((d, i) => d.position.copy(commonLoop.curve.getPoint((t * .18 + i / commonLoop.dots.length) % 1)));
        startLoop.dots.forEach((d, i) => d.position.copy(startLoop.curve.getPoint((t * .20 + i / startLoop.dots.length) % 1)));
        holdLoop.dots.forEach((d, i) => d.position.copy(holdLoop.curve.getPoint((t * .22 + i / holdLoop.dots.length) % 1)));
        mixLoop.dots.forEach((d, i) => d.position.copy(mixLoop.curve.getPoint((t * .28 + i / mixLoop.dots.length) % 1)));
      },
      dispose() {
        fujRelay.dispose(); ajRelay.dispose();
        const gs = new Set(), ms = new Set(), maps = new Set();
        rootGroup.traverse(o => {
          if (o.geometry) gs.add(o.geometry);
          if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { ms.add(m); if (m.map) maps.add(m.map); });
        });
        gs.forEach(g => g.dispose()); maps.forEach(t => t.dispose()); ms.forEach(m => m.dispose());
      }
    };
  }

  // 专题 B：第 5.2.2 节单动道岔四线制控制与表示电路（图5.2.1–5.2.3）3D 室内三继电器 + 室外 ZD6 转辙机微距实验台
  function createTurnoutLab(caption) {
    const rootGroup = new T.Group(); rootGroup.name = 'textbook-interface-only';
    rootGroup.userData.model = '第5.2.2节 单动道岔四线制控制与表示电路 (1DQJ + 2DQJ + DBJ/FBJ + ZD6)';
    rootGroup.userData.contacts = 'X1/X2/X3/X4 四线制 · 自动开闭器 1~4排接点 · 速动爪 A/B · 直流电机 M · 整流堆 Z';
    rootGroup.userData.referencePDFPages = [77, 78, 79, 80, 81];

    const fixed = new T.Group(), relayRow = new T.Group(), motorUnit = new T.Group(), switchUnit = new T.Group(), field = new T.Group();
    rootGroup.add(fixed, relayRow, motorUnit, switchUnit, field);
    const labelList = [];

    const mats = {
      base: material(0x15202b, .3, .55),
      bakelite: material(C.bakelite, .22, .36),
      brass: material(C.brass, .85, .20),
      steel: material(C.steel, .88, .18),
      iron: material(C.iron, .82, .25),
      copper: material(C.copper, .82, .24),
      dark: material(C.dark, .35, .42),
      red: material(C.red, .45, .30),
      green: material(C.green, .45, .30)
    };

    bevelBox(fixed, 11.2, .28, 6.2, 0, .06, 0, mats.base, 'base', .022);
    label(fixed, caption || '图5.2.2–5.2.3 单动道岔四线制控制与表示电路 3D 联动实验台', [0, 4.45, -1.6], null, labelList);

    // 后排室内继电器组合：左 1DQJ (JWJXC-H125/0.44)，中 2DQJ (JYJXC-220/220)，右 DBJ/FBJ (JPXC-1000)
    const dqj1 = createRelay('heavySlow');
    dqj1.root.traverse(o => { delete o.userData.label; });
    dqj1.setView({ labels: false, cover: false, explode: 0, field: false });
    dqj1.root.scale.setScalar(.42); dqj1.root.position.set(-3.45, .22, -1.35);
    relayRow.add(dqj1.root);
    label(relayRow, '1DQJ (JWJXC-H125/0.44 · 125Ω启动+铜套缓放+0.44Ω串电机)', [-3.45, 2.65, -1.35], [-3.0, 1.65, -1.2], labelList);

    const dqj2 = createRelay('latching');
    dqj2.root.traverse(o => { delete o.userData.label; });
    dqj2.setView({ labels: false, cover: false, explode: 0, field: false });
    dqj2.root.scale.setScalar(.42); dqj2.root.position.set(0, .22, -1.35);
    relayRow.add(dqj2.root);
    label(relayRow, '2DQJ (JYJXC-220/220 · 极性保持转极)', [0, 2.65, -1.35], [.35, 1.65, -1.2], labelList);

    const dbj = createRelay('biased');
    dbj.root.traverse(o => { delete o.userData.label; });
    dbj.setView({ labels: false, cover: false, explode: 0, field: false });
    dbj.root.scale.setScalar(.42); dbj.root.position.set(3.45, .22, -1.35);
    relayRow.add(dbj.root);
    const dbjLampMat = new T.MeshBasicMaterial({ color: C.green });
    const fbjLampMat = new T.MeshBasicMaterial({ color: 0x384958 });
    bevelBox(relayRow, .48, .12, .16, 3.16, .34, -.64, dbjLampMat, 'front', .01);
    bevelBox(relayRow, .48, .12, .16, 3.74, .34, -.64, fbjLampMat, 'back', .01);
    label(relayRow, 'DBJ / FBJ (JPXC-1000 偏极 · 左绿DBJ / 右黄FBJ)', [3.45, 2.65, -1.35], [3.75, 1.65, -1.2], labelList);

    // 前排左：道岔基本轨、可动尖轨、动作杆与夹异物障碍块（定位贴上基本轨、反位贴下基本轨，零穿模密贴）
    const railGroup = new T.Group(); railGroup.position.set(-3.35, .24, 1.45); switchUnit.add(railGroup);
    bevelBox(railGroup, 3.2, .14, .10, 0, .12, -.48, mats.steel, 'rail', .01);
    bevelBox(railGroup, 3.2, .14, .10, 0, .12, .48, mats.steel, 'rail', .01);
    const tonguePivot = new T.Group(); tonguePivot.position.set(-1.35, .12, -.395); railGroup.add(tonguePivot);
    bevelBox(tonguePivot, 2.55, .12, .07, 1.25, 0, 0, mats.brass, 'switchMachine', .008);
    bevelBox(tonguePivot, 2.55, .12, .07, 1.25, 0, .56, mats.brass, 'switchMachine', .008);
    const throwBar = bevelBox(railGroup, .16, .08, 1.15, .65, .08, 0, mats.iron, 'rod', .008);
    const obstacleMesh = bevelBox(railGroup, .24, .22, .14, .92, .18, .36, mats.red, 'switchMachine', .01);
    obstacleMesh.visible = false;
    label(switchUnit, '道岔尖轨与动作杆（夹异物时受阻停于半途）', [-3.35, 1.45, 2.15], [-2.7, .38, 1.45], labelList);

    // 前排中：ZD6 直流串激电动机 M（转子电枢、正反转激磁绕组、安全遮断器 05-06）
    const mGroup = new T.Group(); mGroup.position.set(.15, .24, 1.45); motorUnit.add(mGroup);
    cylinder(mGroup, .52, 1.35, 0, .58, 0, mats.dark, 'switchMachine', 'x', 28);
    cylinder(mGroup, .55, .14, -.45, .58, 0, mats.iron, 'switchMachine', 'x', 28);
    cylinder(mGroup, .55, .14, .45, .58, 0, mats.iron, 'switchMachine', 'x', 28);
    const rotorShaft = new T.Group(); rotorShaft.position.set(0, .58, 0); mGroup.add(rotorShaft);
    cylinder(rotorShaft, .12, 1.95, 0, 0, 0, mats.steel, 'armature', 'x', 20);
    bevelBox(rotorShaft, .08, .68, .12, -.88, 0, 0, mats.brass, 'armature', .008);
    bevelBox(rotorShaft, .08, .12, .68, -.88, 0, 0, mats.brass, 'armature', .008);
    // 安全遮断器 05-06
    const cutoutArm = bevelBox(mGroup, .56, .05, .14, 0, 1.26, 0, mats.brass, 'common', .005);
    label(motorUnit, '直流电动机 M 与遮断器 05-06', [.15, 1.85, 2.05], [.15, .82, 1.45], labelList);

    // 前排右：图 5.2.3 自动开闭器（第1~4排接点 11-12/21-22/31-32/41-42 + 速动爪 A/B + 整流堆 Z + R）
    const akGroup = new T.Group(); akGroup.position.set(3.25, .24, 1.45); switchUnit.add(akGroup);
    bevelBox(akGroup, 2.55, .82, 1.32, 0, .41, 0, mats.bakelite, 'contactBlock', .018);
    const row1Mat = material(C.green, .7, .2), row2Mat = material(C.silver, .7, .2);
    const row3Mat = material(C.green, .7, .2), row4Mat = material(C.silver, .7, .2);
    const pawlA = bevelBox(akGroup, .44, .06, .20, -.85, .95, -.28, mats.brass, 'front', .006);
    const pawlB = bevelBox(akGroup, .44, .06, .20, -.85, .95, .28, mats.brass, 'back', .006);
    bevelBox(akGroup, .42, .12, .22, -.85, .86, -.28, row1Mat, 'front', .006); // 11-12/13-14 (1排)
    bevelBox(akGroup, .42, .12, .22, -.15, .86, -.28, row2Mat, 'front', .006); // 21-22/23-24 (2排)
    bevelBox(akGroup, .42, .12, .22, -.85, .86, .28, row3Mat, 'back', .006);   // 31-32/33-34 (3排)
    bevelBox(akGroup, .42, .12, .22, -.15, .86, .28, row4Mat, 'back', .006);   // 41-42/43-44 (4排)
    // 室外半波整流二极管 Z 与限流电阻 R
    const diodeMat = material(C.copper, .75, .22);
    cylinder(akGroup, .14, .42, .85, .94, -.25, diodeMat, 'rectifier', 'x', 20);
    bevelBox(akGroup, .46, .16, .18, .85, .94, .28, mats.iron, 'terminals', .008);
    label(switchUnit, '自动开闭器(11-12/21-22/31-32/41-42) · 速动爪A/B · 二极管Z', [3.25, 1.85, 2.05], [3.25, 1.12, 1.45], labelList);

    const motorLoop = makeLoop(field, [[-3.45, 1.15, -1.2], [0, 1.15, -1.2], [.15, .82, 1.45], [2.65, .95, 1.45], [-3.45, .45, -1.2]], C.amber, 10);
    const indLoop = makeLoop(field, [[3.85, 1.15, 1.45], [2.65, 1.15, 1.45], [0, 1.25, -1.2], [3.45, 1.25, -1.2]], C.green, 9);
    const anim = { lastT: null, dqj1: 0, dqj2: 1, ind: 1, tongue: 0, pawlA: -.85, pawlB: -.85, pawlY: .95, cutout: 0, rotor: 0 };

    return {
      root: rootGroup, type: 'turnoutLab', physical: false,
      setView(s) {
        const e = (s.explode || 0) / 100;
        fixed.position.set(0, 0, 0);
        relayRow.position.set(0, .65 * e, -.85 * e);
        motorUnit.position.set(0, .42 * e, .65 * e);
        switchUnit.position.set(0, .48 * e, .95 * e);
        field.visible = !!s.field && e < .45;
        labelList.forEach(l => { l.visible = !!s.labels; });
      },
      pose(p, r, s, time) {
        const to = r.turnout || { stg: 0, dqj1Picked: false, dqj1SlowHold: false, dqj2Reverse: false, dbjPicked: true, fbjPicked: false, motorRunning: false, k11_12: true, k21_22: false, k31_32: true, k41_42: false, tonguePos: 0, obstacle: false, lidOpen: false, indFault: 'none' };
        const t = time || 0;
        const dt = anim.lastT === null ? 0 : Math.max(0, Math.min(.08, t - anim.lastT));
        anim.lastT = t;
        const slow = !!(s && s.slow);
        const indPicked = to.dbjPicked || to.fbjPicked;
        const capOpenChatter = to.indFault === 'capOpen' && (to.stg === 0 || to.stg === 4) && !to.obstacle;

        // 1DQJ 吸起快(5.5/s)、落下带紫铜阻尼铜套缓放(2.1/s ≈ 0.48s)；2DQJ 平滑转极；capOpen 复现教材 50Hz 颤动
        anim.dqj1 = stepSmooth(anim.dqj1, to.dqj1Picked ? 1 : 0, to.dqj1Picked ? 5.5 : 2.1, dt, slow);
        anim.dqj2 = stepSmooth(anim.dqj2, to.dqj2Reverse ? 0 : 1, 4.5, dt, slow);
        const indGoal = capOpenChatter ? (.26 + .20 * Math.sin(t * 28)) : (indPicked ? 1 : 0);
        anim.ind = capOpenChatter ? indGoal : stepSmooth(anim.ind, indGoal, 5.5, dt, slow);

        const targetTongue = to.tonguePos + (to.obstacle && to.motorRunning ? .03 * Math.sin(t * 24) : 0);
        anim.tongue = stepSmooth(anim.tongue, targetTongue, 1.7, dt, slow);
        const isTrail = to.indFault === 'trailThrough';
        // 图5.2.3（PDF p.78）：内侧 B 动接点组先匀速动作(2.4/s)，外侧 A 动接点组后速动切换(12.0/s)；挤岔时 A/B 均抬至中间开路位置(-0.50, y=1.08)
        const goalA = isTrail ? -.50 : (to.k11_12 ? -.85 : -.15);
        const goalB = isTrail ? -.50 : (to.k31_32 ? -.85 : -.15);
        anim.pawlB = stepSmooth(anim.pawlB, goalB, 2.4, dt, slow);
        anim.pawlA = stepSmooth(anim.pawlA, goalA, 12.0, dt, slow);
        anim.pawlY = stepSmooth(anim.pawlY, isTrail ? 1.08 : .95, 4.5, dt, slow);
        anim.cutout = stepSmooth(anim.cutout, to.lidOpen ? .55 : 0, 5.0, dt, slow);
        if (to.motorRunning) anim.rotor += dt * (slow ? 3.2 : 9.5);

        dqj1.pose(anim.dqj1, { picked: to.dqj1Picked, drive: to.dqj1Picked && !to.dqj1SlowHold, localEnergized: false }, { mode: 'bench', polarity: to.dqj1Picked ? 1 : 0 }, t);
        dqj2.pose(anim.dqj2, { picked: !to.dqj2Reverse, drive: to.stg === 2, localEnergized: false }, { mode: 'bench', polarity: to.dqj2Reverse ? -1 : 1 }, t);
        dbj.pose(anim.ind, { picked: indPicked, drive: indPicked || capOpenChatter, localEnergized: false }, { mode: 'bench', polarity: indPicked ? 1 : 0 }, t);
        dbjLampMat.color.setHex(to.dbjPicked ? C.green : (to.indFault !== 'none' && to.stg === 0 ? C.red : 0x384958));
        fbjLampMat.color.setHex(to.fbjPicked ? C.amber : (to.indFault !== 'none' && to.stg === 4 ? C.red : 0x384958));

        tonguePivot.rotation.y = -anim.tongue * .091;
        throwBar.position.z = anim.tongue * .22;
        obstacleMesh.visible = !!to.obstacle;
        cutoutArm.rotation.z = anim.cutout;
        cutoutArm.material.color.setHex(to.lidOpen ? C.red : C.brass);
        rotorShaft.rotation.x = anim.rotor;

        pawlA.position.set(anim.pawlA, anim.pawlY, -.28);
        pawlB.position.set(anim.pawlB, anim.pawlY, .28);
        row1Mat.color.setHex(to.k11_12 ? C.green : C.silver);
        row2Mat.color.setHex(to.k21_22 ? C.green : C.silver);
        row3Mat.color.setHex(to.k31_32 ? C.green : C.silver);
        row4Mat.color.setHex(to.k41_42 ? C.green : C.silver);
        diodeMat.emissive.setHex(indPicked ? 0x1c4f3b : 0);

        motorLoop.setVisible(!!to.motorRunning);
        indLoop.setVisible(indPicked);
        motorLoop.dots.forEach((d, i) => d.position.copy(motorLoop.curve.getPoint((t * .25 + i / motorLoop.dots.length) % 1)));
        indLoop.dots.forEach((d, i) => d.position.copy(indLoop.curve.getPoint((t * .18 + i / indLoop.dots.length) % 1)));
      },
      dispose() {
        dqj1.dispose(); dqj2.dispose(); dbj.dispose();
        const gs = new Set(), ms = new Set(), maps = new Set();
        rootGroup.traverse(o => {
          if (o.geometry) gs.add(o.geometry);
          if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { ms.add(m); if (m.map) maps.add(m.map); });
        });
        gs.forEach(g => g.dispose()); maps.forEach(t => t.dispose()); ms.forEach(m => m.dispose());
      }
    };
  }

  // 专题 D：第 5.2.3 节五线制三相交流道岔控制与表示电路 3D 联动台（DBQ + BHJ + 1DQJ + 1DQJF + S700K）
  function createFiveWireLab(caption) {
    const rootGroup = new T.Group(); rootGroup.name = 'textbook-interface-only';
    rootGroup.userData.model = '第5.2.3节 五线制三相交流道岔控制与表示电路 (DBQ/BHJ/1DQJ/1DQJF/S700K)';
    rootGroup.userData.contacts = 'X1~X5 五线 · 三相 AC 380V (A/B/C) · DBQ 断相保护 · 1DQJ/1DQJF · 并联表示二极管 Z+R2';
    rootGroup.userData.referencePDFPages = [82, 83, 84, 85, 86];
    const fixed = new T.Group(), relayRow = new T.Group(), s700kUnit = new T.Group(), field = new T.Group();
    rootGroup.add(fixed, relayRow, s700kUnit, field);
    const labelList = [];

    const mats = {
      base: material(0x15202b, .3, .55),
      bakelite: material(C.bakelite, .22, .36),
      brass: material(C.brass, .85, .20),
      steel: material(C.steel, .88, .18),
      copper: material(C.copper, .82, .24),
      dark: material(C.dark, .35, .42),
      red: material(C.red, .45, .30),
      green: material(C.green, .45, .30),
      iron: material(C.iron, .82, .25)
    };
    bevelBox(fixed, 11.4, .28, 6.2, 0, .06, 0, mats.base, 'base', .022);
    label(fixed, caption || '图5.2.4–5.2.8 五线制三相交流道岔(S700K + DBQ/BHJ + 并联表示 Z) 3D 联动台', [0, 4.45, -1.6], null, labelList);

    // 室内：DBQ 断相保护器 + BHJ + 1DQJ/1DQJF + DBJ/FBJ
    const dbqBox = bevelBox(relayRow, 1.45, 1.55, .82, -3.95, 1.05, -1.35, mats.bakelite, 'switchMachine', .02);
    const bhjLedMat = new T.MeshBasicMaterial({ color: 0x3b4d5e });
    bevelBox(relayRow, 1.15, .16, .86, -3.95, 1.65, -1.35, bhjLedMat, 'switchMachine', .01);
    for (const [ci, cz] of [[-.28], [0], [.28]].map((v, i) => [i, v[0]])) {
      cylinder(relayRow, .14, .42, -3.95, 1.05, -1.35 + cz, mats.copper, 'coil', 'x', 20);
    }
    label(relayRow, 'DBQ 三相断相保护器 + BHJ (缺相立即切断自闭)', [-3.95, 2.55, -1.35], [-3.95, 1.65, -1.35], labelList);

    const dqj1 = createRelay('heavySlow');
    dqj1.root.traverse(o => { delete o.userData.label; });
    dqj1.setView({ labels: false, cover: false, explode: 0, field: false });
    dqj1.root.scale.setScalar(.38); dqj1.root.position.set(-1.35, .22, -1.35);
    relayRow.add(dqj1.root);
    label(relayRow, '1DQJ + 1DQJF（励磁→转极→BHJ↑自闭）', [-1.35, 2.55, -1.35], [-1.05, 1.55, -1.2], labelList);

    const dqj2 = createRelay('latching');
    dqj2.root.traverse(o => { delete o.userData.label; });
    dqj2.setView({ labels: false, cover: false, explode: 0, field: false });
    dqj2.root.scale.setScalar(.38); dqj2.root.position.set(1.35, .22, -1.35);
    relayRow.add(dqj2.root);
    label(relayRow, '2DQJ (交换 B/C 相序改变三相转向)', [1.35, 2.55, -1.35], [1.55, 1.55, -1.2], labelList);

    const dbj = createRelay('biased');
    dbj.root.traverse(o => { delete o.userData.label; });
    dbj.setView({ labels: false, cover: false, explode: 0, field: false });
    dbj.root.scale.setScalar(.38); dbj.root.position.set(4.0, .22, -1.35);
    relayRow.add(dbj.root);
    const dbjLampMat = new T.MeshBasicMaterial({ color: C.green });
    const fbjLampMat = new T.MeshBasicMaterial({ color: 0x384958 });
    bevelBox(relayRow, .44, .12, .16, 3.74, .34, -.70, dbjLampMat, 'front', .01);
    bevelBox(relayRow, .44, .12, .16, 4.26, .34, -.70, fbjLampMat, 'back', .01);
    label(relayRow, 'DBJ / FBJ（正负半周自感维持 · 左绿DBJ / 右黄FBJ）', [4.0, 2.55, -1.35], [4.15, 1.55, -1.2], labelList);

    // 室外 S700K 三相交流转辙机 + 星接 U/V/W 绕组 + 遮断开关 K + 室外并联 Z/R2
    const fwRailGroup = new T.Group(); fwRailGroup.position.set(-3.2, .24, 1.45); s700kUnit.add(fwRailGroup);
    bevelBox(fwRailGroup, 3.4, .08, 1.24, 0, .04, 0, mats.bakelite, 'base', .01);
    bevelBox(fwRailGroup, 3.2, .14, .10, 0, .14, -.48, mats.steel, 'rail', .01);
    bevelBox(fwRailGroup, 3.2, .14, .10, 0, .14, .48, mats.steel, 'rail', .01);
    const tonguePivot = new T.Group(); tonguePivot.position.set(-1.35, .14, -.395); fwRailGroup.add(tonguePivot);
    bevelBox(tonguePivot, 2.55, .12, .07, 1.25, 0, 0, mats.brass, 'switchMachine', .008);
    bevelBox(tonguePivot, 2.55, .12, .07, 1.25, 0, .56, mats.brass, 'switchMachine', .008);
    const fwThrowBar = bevelBox(fwRailGroup, .16, .08, 1.15, .65, .10, 0, mats.iron, 'rod', .008);

    const m3Box = new T.Group(); m3Box.position.set(.25, .24, 1.45); s700kUnit.add(m3Box);
    cylinder(m3Box, .54, 1.45, 0, .58, 0, mats.dark, 'switchMachine', 'x', 28);
    for (const wx of [-.42, 0, .42]) cylinder(m3Box, .58, .12, wx, .58, 0, mats.copper, 'coil', 'x', 24);
    const rotorShaft = new T.Group(); rotorShaft.position.set(0, .58, 0); m3Box.add(rotorShaft);
    cylinder(rotorShaft, .12, 2.05, 0, 0, 0, mats.steel, 'armature', 'x', 20);
    bevelBox(rotorShaft, .08, .70, .12, -.92, 0, 0, mats.brass, 'armature', .008);
    bevelBox(rotorShaft, .08, .12, .70, -.92, 0, 0, mats.brass, 'armature', .008);
    const cutoutArm = bevelBox(m3Box, .56, .05, .14, 0, 1.28, 0, mats.brass, 'common', .005);
    label(s700kUnit, 'S700K 三相交流电机 (U/V/W · 遮断开关 K)', [.25, 1.88, 2.05], [.25, .86, 1.45], labelList);

    const cableBox = new T.Group(); cableBox.position.set(3.45, .24, 1.45); s700kUnit.add(cableBox);
    bevelBox(cableBox, 2.35, .78, 1.22, 0, .39, 0, mats.bakelite, 'contactBlock', .018);
    const diodeMat = material(C.copper, .75, .22);
    cylinder(cableBox, .15, .44, -.45, .88, 0, diodeMat, 'rectifier', 'x', 20);
    bevelBox(cableBox, .56, .18, .22, .45, .88, 0, mats.iron, 'terminals', .008);
    label(s700kUnit, 'X1~X5 五线汇接 · 并联整流 Z + R₂(300Ω)', [3.45, 1.75, 2.05], [3.45, .95, 1.45], labelList);

    const phaseLoop = makeLoop(field, [[-3.95, 1.05, -1.2], [-1.35, 1.05, -1.2], [1.35, 1.05, -1.2], [.25, .82, 1.45], [-3.95, .45, -1.2]], C.amber, 10);
    const indLoop = makeLoop(field, [[3.45, 1.05, 1.45], [.25, .82, 1.45], [1.35, 1.15, -1.2], [4.0, 1.15, -1.2]], C.green, 9);
    const anim = { lastT: null, dqj1: 0, dqj2: 1, ind: 1, tongue: 0, cutout: 0, rotor: 0 };

    return {
      root: rootGroup, type: 'fiveWireLab', physical: false,
      setView(s) {
        const e = (s.explode || 0) / 100;
        fixed.position.set(0, 0, 0);
        relayRow.position.set(0, .65 * e, -.85 * e);
        s700kUnit.position.set(0, .48 * e, .95 * e);
        field.visible = !!s.field && e < .45;
        labelList.forEach(l => { l.visible = !!s.labels; });
      },
      pose(p, r, s, time) {
        const fw = r.fiveWire || { stg: 0, phaseLoss: false, lidOpen: false, bhjPicked: false, dqj1Picked: false, dqj1SlowHold: false, dqj2Reverse: false, motorRunning: false, dbjPicked: true, fbjPicked: false, tonguePos: 0 };
        const t = time || 0;
        const dt = anim.lastT === null ? 0 : Math.max(0, Math.min(.08, t - anim.lastT));
        anim.lastT = t;
        const slow = !!(s && s.slow);
        const indPicked = fw.dbjPicked || fw.fbjPicked;

        anim.dqj1 = stepSmooth(anim.dqj1, fw.dqj1Picked ? 1 : 0, fw.dqj1Picked ? 5.5 : 2.2, dt, slow);
        anim.dqj2 = stepSmooth(anim.dqj2, fw.dqj2Reverse ? 0 : 1, 4.5, dt, slow);
        anim.ind = stepSmooth(anim.ind, indPicked ? 1 : 0, 5.5, dt, slow);
        anim.tongue = stepSmooth(anim.tongue, fw.tonguePos, 1.7, dt, slow);
        anim.cutout = stepSmooth(anim.cutout, fw.lidOpen ? .55 : 0, 5.0, dt, slow);
        if (fw.motorRunning) anim.rotor += dt * (slow ? 3.5 : 10.5);

        bhjLedMat.color.setHex(fw.bhjPicked ? C.green : ((fw.phaseLoss || fw.lidOpen) && fw.stg >= 3) ? C.red : 0x3b4d5e);
        dqj1.pose(anim.dqj1, { picked: fw.dqj1Picked, drive: fw.dqj1Picked && !fw.dqj1SlowHold, localEnergized: false }, { mode: 'bench', polarity: fw.dqj1Picked ? 1 : 0 }, t);
        dqj2.pose(anim.dqj2, { picked: !fw.dqj2Reverse, drive: fw.stg === 2, localEnergized: false }, { mode: 'bench', polarity: fw.dqj2Reverse ? -1 : 1 }, t);
        dbj.pose(anim.ind, { picked: indPicked, drive: indPicked, localEnergized: false }, { mode: 'bench', polarity: indPicked ? 1 : 0 }, t);
        dbjLampMat.color.setHex(fw.dbjPicked ? C.green : 0x384958);
        fbjLampMat.color.setHex(fw.fbjPicked ? C.amber : 0x384958);
        tonguePivot.rotation.y = -anim.tongue * .091;
        fwThrowBar.position.z = anim.tongue * .22;
        cutoutArm.rotation.z = anim.cutout;
        cutoutArm.material.color.setHex(fw.lidOpen ? C.red : C.brass);
        rotorShaft.rotation.x = anim.rotor;
        diodeMat.emissive.setHex(indPicked ? 0x1c4f3b : 0);
        phaseLoop.setVisible(!!fw.motorRunning);
        indLoop.setVisible(indPicked);
        phaseLoop.dots.forEach((d, i) => d.position.copy(phaseLoop.curve.getPoint((t * .28 + i / phaseLoop.dots.length) % 1)));
        indLoop.dots.forEach((d, i) => d.position.copy(indLoop.curve.getPoint((t * .18 + i / indLoop.dots.length) % 1)));
      },
      dispose() {
        dqj1.dispose(); dqj2.dispose(); dbj.dispose();
        const gs = new Set(), ms = new Set(), maps = new Set();
        rootGroup.traverse(o => {
          if (o.geometry) gs.add(o.geometry);
          if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { ms.add(m); if (m.map) maps.add(m.map); });
        });
        gs.forEach(g => g.dispose()); maps.forEach(t => t.dispose()); ms.forEach(m => m.dispose());
      }
    };
  }

  // 专题 E：第 11.3 / 13.2 节 计算机联锁安全 I/O（CPU 脉冲 → 光耦隔离/脉冲变压器/电容泵 → JPXC-1000 偏极继电器）
  function createCbiIoLab(caption) {
    const rootGroup = new T.Group(); rootGroup.name = 'textbook-interface-only';
    rootGroup.userData.model = '图11.3.2 & 图13.2.2—13.2.4 计算机联锁动态安全驱动/采集接口';
    rootGroup.userData.contacts = '嵌入式联锁主机 CPU → 光电隔离 U1 → 脉冲变压器 T / 电容泵 C1·C2 → JPXC-1000 偏极继电器 J';
    rootGroup.userData.referencePDFPages = [224, 225, 258, 259, 260];
    const fixed = new T.Group(), cpuBoard = new T.Group(), isoBoard = new T.Group(), relaySide = new T.Group(), field = new T.Group();
    rootGroup.add(fixed, cpuBoard, isoBoard, relaySide, field);
    const labelList = [];

    const mats = {
      base: material(0x141f2b, .3, .55),
      pcb: material(0x164a3b, .28, .42),
      bakelite: material(C.bakelite, .22, .36),
      copper: material(C.copper, .82, .24),
      brass: material(C.brass, .85, .20),
      steel: material(C.steel, .88, .18),
      red: material(C.red, .45, .30)
    };
    bevelBox(fixed, 10.6, .26, 5.4, 0, .06, 0, mats.base, 'base', .022);
    label(fixed, caption || '图13.2.3–13.2.4 计算机联锁动态故障—安全隔离输出 / 采集接口 3D 联动', [0, 4.25, -1.2], null, labelList);

    // 左侧：嵌入式联锁主机板 + CPU 芯片 + LED 脉冲指示柱 + 安全采信状态灯
    bevelBox(cpuBoard, 2.8, .22, 3.2, -3.3, .28, 0, mats.pcb, 'base', .016);
    bevelBox(cpuBoard, .95, .18, .95, -3.3, .48, -.2, mats.bakelite, 'timer', .015);
    const pulseLedMat = new T.MeshBasicMaterial({ color: C.green });
    bevelBox(cpuBoard, .48, .24, .48, -2.55, .48, .65, pulseLedMat, 'timer', .01);
    const acceptLedMat = new T.MeshBasicMaterial({ color: C.green });
    bevelBox(cpuBoard, .48, .24, .48, -3.95, .48, .65, acceptLedMat, 'timer', .01);
    label(cpuBoard, '联锁运算 CPU（正常=方波脉冲 · 卡死1/0=直流稳态）', [-3.3, 1.85, 0], [-3.3, .55, 0], labelList);

    // 中部：安全隔离驱动板（光耦 U1 + 脉冲变压器 T / 电容泵 C1-C2 + 全波整流 DR）
    bevelBox(isoBoard, 2.6, .22, 3.2, 0, .28, 0, mats.pcb, 'rectifier', .016);
    bevelBox(isoBoard, .62, .28, .44, -.65, .52, 0, mats.bakelite, 'rectifier', .012); // U1 光耦
    cylinder(isoBoard, .34, .65, .25, .62, -.35, mats.copper, 'coil', 'z', 24); // 脉冲变压器 T
    cylinder(isoBoard, .18, .55, .25, .62, .62, mats.steel, 'rectifier', 'y', 20); // 泵电容 C1/C2
    cylinder(isoBoard, .18, .55, .72, .62, .62, mats.steel, 'rectifier', 'y', 20);
    label(isoBoard, '光耦 U1 + 脉冲变压器 T（隔直传交）/ 电容泵 C1·C2', [0, 2.05, 0], [.25, .72, 0], labelList);

    // 右侧：实际物理安全型偏极继电器 JPXC-1000（失脉冲即 0V 落下导向安全侧）
    const outRelay = createRelay('biased');
    outRelay.root.traverse(o => { delete o.userData.label; });
    outRelay.setView({ labels: false, cover: false, explode: 0, field: false });
    outRelay.root.scale.setScalar(.54); outRelay.root.position.set(3.25, .22, -.2);
    relaySide.add(outRelay.root);
    label(relaySide, '执行层物理继电器 J (JPXC-1000 · 失动态能即 0V 落下)', [3.25, 3.05, 0], [3.25, 1.95, 0], labelList);

    const dynLoop = makeLoop(field, [[-2.55, .65, 0], [-.65, .65, 0], [.25, .75, 0], [2.45, .95, 0], [2.45, .45, 0], [-.65, .45, 0]], C.green, 8);
    const anim = { lastT: null, relay: 0 };

    return {
      root: rootGroup, type: 'cbiIoLab', physical: false,
      setView(s) {
        const e = (s.explode || 0) / 100;
        fixed.position.set(0, 0, 0);
        cpuBoard.position.set(-.80 * e, .48 * e, 0);
        isoBoard.position.set(0, .82 * e, 0);
        relaySide.position.set(.85 * e, .48 * e, 0);
        field.visible = !!s.field && e < .45;
        labelList.forEach(l => { l.visible = !!s.labels; });
      },
      pose(p, r, s, time) {
        const ci = r.cbiIo || { mode: 'pulseTrans', cmd: false, relayPicked: false, dynamicActive: false, fault: 'none', inputValid: true };
        const t = time || 0;
        const dt = anim.lastT === null ? 0 : Math.max(0, Math.min(.08, t - anim.lastT));
        anim.lastT = t;
        const slow = !!(s && s.slow);
        const isIn = ci.mode === 'staticIn' || ci.mode === 'dynamicIn';
        // 采集模式(staticIn/dynamicIn)下物理继电器呈现现场真实接点状态(ci.cmd)，CPU板绿/红指示安全采信结果；输出模式下驱动偏极执行继电器J平滑吸落
        const physGoal = isIn ? (ci.cmd ? 1 : 0) : (ci.relayPicked ? 1 : 0);
        anim.relay = stepSmooth(anim.relay, physGoal, physGoal ? 5.5 : 3.2, dt, slow);

        const blink = ci.dynamicActive ? (Math.sin(t * 14) > 0 ? C.green : 0x164a3b) : ci.fault === 'stuckHigh' ? C.red : (ci.mode === 'staticIn' && ci.inputValid ? C.green : 0x384958);
        pulseLedMat.color.setHex(blink);
        acceptLedMat.color.setHex(ci.fault !== 'none' ? C.red : ci.relayPicked ? C.green : 0x384958);
        outRelay.pose(anim.relay, { picked: !!physGoal, drive: !!physGoal, localEnergized: false }, { mode: 'bench', polarity: physGoal ? 1 : 0 }, t);
        const loopOn = isIn ? (ci.mode === 'staticIn' ? ci.inputValid : !!ci.dynamicActive) : !!ci.dynamicActive;
        dynLoop.setVisible(loopOn);
        // 输入采集流向：现场继电器 → 光耦 → CPU；输出驱动流向：CPU → 脉冲变压器/电容泵 → 偏极继电器
        dynLoop.dots.forEach((d, i) => {
          const frac = (t * .26 + i / dynLoop.dots.length) % 1;
          d.position.copy(dynLoop.curve.getPoint(isIn ? (1 - frac) : frac));
        });
      },
      dispose() {
        outRelay.dispose();
        const gs = new Set(), ms = new Set(), maps = new Set();
        rootGroup.traverse(o => {
          if (o.geometry) gs.add(o.geometry);
          if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { ms.add(m); if (m.map) maps.add(m.map); });
        });
        gs.forEach(g => g.dispose()); maps.forEach(t => t.dispose()); ms.forEach(m => m.dispose());
      }
    };
  }

  function createRelay(type, caption) {
    if (type === 'phase') return createInterface(caption);
    if (type === 'selfHold') return createSelfHoldLab(caption);
    if (type === 'turnoutLab') return createTurnoutLab(caption);
    if (type === 'fiveWireLab') return createFiveWireLab(caption);
    if (type === 'cbiIoLab') return createCbiIoLab(caption);
    const spec = root.RelaySources.models[type];
    const rootGroup = new T.Group(); rootGroup.name = spec.model;
    rootGroup.userData.model = spec.model;
    rootGroup.userData.relayType = type;
    rootGroup.userData.contacts = spec.contacts;
    rootGroup.userData.geometryBoundary = spec.geometry;
    rootGroup.userData.scale = '教学展开比例，未经实测尺寸校准';
    rootGroup.userData.referencePDFPages = spec.pages;

    const fixed = new T.Group(), backplate = new T.Group(), magnet = new T.Group(), mechanism = new T.Group(), contacts = new T.Group(), field = new T.Group();
    fixed.userData.subGroup = 'fixed';
    backplate.userData.subGroup = 'backplate';
    magnet.userData.subGroup = 'magnet';
    mechanism.userData.subGroup = 'mechanism';
    contacts.userData.subGroup = 'contacts';
    rootGroup.add(fixed, backplate, magnet, mechanism, contacts, field);
    const labelList = [];

    const mats = {
      iron: material(C.iron, .84, .22),
      steel: material(C.steel, .88, .18),
      dark: material(C.dark, .28, .38),
      bakelite: material(C.bakelite, .20, .34),
      base: material(C.base, .24, .42),
      brass: material(C.brass, .84, .20),
      contact: material(C.silver, .92, .12),
      carbon: material(C.carbon, .35, .42),
      ceramic: material(C.ceramic, .15, .42),
      spring: material(0xc9a35a, .80, .24),
      sleeve: material(C.sleeve, .88, .18),
      pcb: material(C.pcb, .28, .45),
      wire: material(0xd99b52, .45, .38)
    };
    const coils = [], levers = [], frontMats = [], backMats = [], contactGroups = [];
    const hasCopperSleeve = ['slowRelease', 'heavySlow', 'filament'].includes(type);
    let sleeveMat = null, timerLedMat = null;

    // 1. 精细化阶梯式胶木底座 (fixed)：含防震胶垫、内凹槽、金属蚀刻型号铭牌与四角黄铜六角螺栓
    bevelBox(fixed, 6.04, .22, 2.54, 0, -.09, 0, mats.base, 'base', .028);
    bevelBox(fixed, 5.58, .09, 2.24, -.12, .05, 0, mats.bakelite, 'base', .016);
    mesh(fixed, new T.PlaneGeometry(1.75, .175), makeRelayNameplateMat(spec.model, spec.contacts), -.45, -.09, 1.275, 'base');
    for (const rvx of [-1.26, .36]) cylinder(fixed, .016, .015, rvx, -.09, 1.275, mats.brass, 'base', 'z', 10);
    for (const bx of [-2.68, 2.15]) for (const bz of [-.96, .96]) {
      hexNut(fixed, .088, .065, bx, .11, bz, mats.brass, 'base', 'y');
      cylinder(fixed, .16, .05, bx, -.21, bz, mats.dark, 'base', 'y', 20);
    }

    // 2. 右侧 AX 插座胶木背板 (backplate)：模压隔弧槽、上下安装耳、双排开槽插片与金属鉴别销（图4.1.1a/b）
    bevelBox(backplate, .36, 4.38, 2.30, 2.56, 2.22, 0, mats.bakelite, 'base', .024);
    bevelBox(backplate, .14, 4.20, 2.10, 2.76, 2.22, 0, mats.dark, 'base', .016);
    bevelBox(backplate, .28, .18, 2.38, 2.56, 4.35, 0, mats.bakelite, 'base', .015);
    bevelBox(backplate, .28, .18, 2.38, 2.56, .12, 0, mats.bakelite, 'base', .015);
    for (const z of [-.58, .58]) {
      cylinder(backplate, .070, .34, 2.86, .62, z, mats.steel, 'base', 'x', 24);
      hexNut(backplate, .098, .06, 2.74, .62, z, mats.brass, 'base', 'x');
    }

    // 线圈引出端子座 1-2-3-4 与成型内部引线（随 magnet 移动）
    const pinX = [-1.92, -.82, -.28, .82];
    for (const tx of pinX) {
      bevelBox(magnet, .24, .085, .24, tx, .14, .68, mats.bakelite, 'terminals', .012);
      cylinder(magnet, .065, .27, tx, .26, .68, mats.brass, 'terminals', 'y', 24);
      hexNut(magnet, .085, .058, tx, .22, .68, mats.brass, 'terminals', 'y');
      wireTube(magnet, [[tx, .34, .68], [tx, .44, .56], [tx, .52, .36]], .018, mats.wire, 'terminals');
    }
    if (!['latching', 'differential', 'heavySlow'].includes(type)) {
      bevelBox(magnet, .62, .038, .075, -.55, .33, .68, mats.brass, 'terminals', .006);
    }
    // Internal rectifier and timer assembly positions require a verified assembly drawing.
    // 3. 磁路系统 (magnet)：阶梯纯铁铁芯 + 紧固螺母 + 阶梯倒角极靴 + 印字双线圈/铜套 + 一体弯折L形钢轭铁
    cylinder(magnet, .248, 3.92, -.36, .93, 0, mats.iron, 'core', 'x', 36);
    hexNut(magnet, .33, .15, 1.82, .93, 0, mats.steel, 'core', 'x');
    cylinder(magnet, .415, .14, -2.38, .93, 0, mats.iron, 'pole', 'x', 36);
    cylinder(magnet, .365, .185, -2.38, .93, 0, mats.steel, 'pole', 'x', 36);

    if (type === 'slowRelease') {
      sleeveMat = material(C.sleeve, .88, .16);
      cylinder(magnet, .395, 1.24, -1.38, .93, 0, sleeveMat, 'copperSleeve', 'x', 36);
      for (const gx of [-1.75, -1.38, -1.01]) cylinder(magnet, .408, .04, gx, .93, 0, mats.brass, 'copperSleeve', 'x', 36);
      coils.push(coil(magnet, .22, .93, 0, 1.32, 'coil', 'x', C.copper, 28, .026, '2×170Ω · H340'));
      label(magnet, '紫铜阻尼铜套（涡流缓放）', [-1.45, .22, 1.45], [-1.38, .93, .35], labelList);
    } else if (type === 'heavySlow') {
      sleeveMat = material(C.sleeve, .88, .16);
      cylinder(magnet, .385, .66, -1.72, .93, 0, sleeveMat, 'copperSleeve', 'x', 36);
      coils.push(coil(magnet, -.82, .93, 0, .98, 'coil', 'x', C.copper, 28, .023, '前圈 125Ω'));
      coils.push(coil(magnet, .36, .93, 0, 1.08, 'coil', 'x', 0xdba056, 12, .044, '后圈 0.44Ω'));
      label(magnet, '阻尼铜套 + 125Ω/0.44Ω双异阻圈', [-1.1, .22, 1.52], [-.82, .93, .45], labelList);
    } else if (type === 'differential') {
      coils.push(coil(magnet, -1.35, .93, 0, 1.22, 'coil', 'x', C.copper, 24, .027, '前圈 370Ω'));
      coils.push(coil(magnet, .25, .93, 0, 1.28, 'coil', 'x', 0xb87338, 30, .023, '后圈 480Ω'));
      label(magnet, '前圈370Ω · 后圈480Ω（分接）', [-1.05, .25, 1.48], [-.55, .93, .46], labelList);
    } else if (type === 'filament') {
      sleeveMat = material(C.sleeve, .88, .16);
      cylinder(magnet, .385, .44, -2.02, .93, 0, sleeveMat, 'copperSleeve', 'x', 36);
      coils.push(coil(magnet, -1.12, .93, 0, 1.12, 'coil', 'x', 0xdba056, 13, .040, '前圈 31Ω'));
      coils.push(coil(magnet, .28, .93, 0, 1.12, 'coil', 'x', 0xdba056, 13, .040, '后圈 31Ω'));
    } else {
      const lbl1 = type === 'biased' ? '前圈 500Ω' : type === 'latching' ? '定位圈 220Ω' : type === 'rectifier' ? '前圈 240Ω' : '前圈 850Ω';
      const lbl2 = type === 'biased' ? '后圈 500Ω' : type === 'latching' ? '反位圈 220Ω' : type === 'rectifier' ? '后圈 240Ω' : '后圈 850Ω';
      coils.push(coil(magnet, -1.35, .93, 0, 1.25, 'coil', 'x', C.copper, 28, .026, lbl1));
      coils.push(coil(magnet, .25, .93, 0, 1.25, 'coil', 'x', C.copper, 28, .026, lbl2));
    }

    if (type === 'latching') {
      const pmN = material(0xb54b68, .50, .28), pmS = material(0x4b6ba8, .50, .28);
      bevelBox(magnet, .22, .98, .62, 1.64, 1.23, 0, mats.iron, 'yoke', .018);
      bevelBox(magnet, .20, .18, .62, -2.35, 1.78, 0, mats.steel, 'yoke', .014);
      bevelBox(magnet, .46, .16, .62, -2.16, 1.64, 0, mats.iron, 'yoke', .014);
      bevelBox(magnet, .84, .20, .62, -1.52, 1.66, 0, pmN, 'permanent', .015);
      bevelBox(magnet, .34, .08, .62, -1.76, 1.80, 0, mats.steel, 'permanent', .01);
      bevelBox(magnet, .84, .20, .62, -.68, 1.66, 0, pmS, 'permanent', .015);
      bevelBox(magnet, .34, .08, .62, -.44, 1.80, 0, mats.steel, 'permanent', .01);
      bevelBox(magnet, 2.01, .16, .62, .745, 1.64, 0, mats.iron, 'yoke', .014);
      label(magnet, '永久磁铁 (左N·右S) 与轭铁相接', [-1.1, 2.38, -.85], [-1.1, 1.78, 0], labelList);
    } else {
      // 一体化圆角过渡 L 形轭铁（上横梁 y ≤ 1.73、右立柱与圆弧弯角无缝衔接）
      bevelBox(magnet, .22, .98, .62, 1.64, 1.23, 0, mats.iron, 'yoke', .018);
      cylinder(magnet, .11, .62, 1.64, 1.64, 0, mats.iron, 'yoke', 'z', 24);
      bevelBox(magnet, 4.10, .16, .62, -.30, 1.64, 0, mats.iron, 'yoke', .016);
      bevelBox(magnet, .20, .18, .62, -2.35, 1.78, 0, mats.steel, 'yoke', .014);
    }

    if (type === 'biased') {
      const pmN = material(0xbd5062, .52, .28), pmS = material(0x4f6ca6, .52, .28);
      bevelBox(magnet, .68, .18, .64, -2.48, .35, 0, pmS, 'permanent', .015);
      bevelBox(magnet, .20, .68, .64, -2.72, .60, 0, pmN, 'permanent', .015);
      bevelBox(magnet, .16, .16, .64, -2.36, .48, 0, mats.iron, 'pole', .012);
      label(magnet, 'L形永久磁铁 (上N·下S)', [-3.25, .28, 1.25], [-2.68, .48, .25], labelList);
    }

    // 4. 传动机构 (mechanism)：圆角过渡L形衔铁、球面非磁性铜止片、三层叠片重锤与梳形绝缘拉杆
    const armature = new T.Group(); armature.position.set(-2.46, 1.94, 0); mechanism.add(armature);
    cylinder(mechanism, .078, .86, -2.46, 1.94, 0, mats.brass, 'armature', 'z', 24);
    bevelBox(mechanism, .18, .08, .72, -2.46, 2.03, 0, mats.spring, 'armature', .008);
    bevelBox(armature, .11, 1.54, .68, -.05, -.65, 0, mats.steel, 'armature', .014);
    cylinder(armature, .07, .68, -.03, .11, 0, mats.steel, 'armature', 'z', 24);
    bevelBox(armature, 3.40, .11, .68, 1.65, .12, 0, mats.steel, 'armature', .014);
    contactRivet(armature, .062, .042, .005, -1.01, 0, mats.brass, 'pole', 1).rotation.z = -Math.PI / 2;
    bevelBox(armature, .24, .088, .36, 3.26, .12, .16, mats.steel, 'armature', .01);
    cylinder(armature, .052, .24, 3.26, .12, .28, mats.brass, 'rod', 'z', 20);

    if (type !== 'latching') {
      for (let wIdx = 0; wIdx < 3; wIdx++) {
        bevelBox(armature, .92 - wIdx * .04, .036, .76, 1.82, .025 - wIdx * .036, 0, mats.dark, 'weight', .006);
      }
      hexNut(armature, .065, .24, 1.82, .08, 0, mats.brass, 'weight', 'y');
      label(mechanism, '叠片重锤片', [-.55, 2.38, -.82], [-.64, 1.92, -.2], labelList);
    }

    const rodGroup = new T.Group(); rodGroup.position.set(.80, 0, .28); mechanism.add(rodGroup);
    bevelBox(rodGroup, .048, 2.24, .034, 0, 3.06, -.042, mats.bakelite, 'rod', .006);
    bevelBox(rodGroup, .048, 2.24, .034, 0, 3.06, .042, mats.bakelite, 'rod', .006);
    bevelBox(rodGroup, .15, .18, .15, 0, 2.00, 0, mats.brass, 'rod', .012);

    // 5. 接点组 (contacts)：层叠胶木绝缘块 + 穿芯压紧长螺栓 + 折弯上下托片 + 防粘连碳化银前触头 + 球面银触头
    bevelBox(contacts, .42, 2.60, 1.18, 2.15, 3.12, -.08, mats.bakelite, 'contactBlock', .02);
    bevelBox(contacts, .26, 2.56, 1.08, -.25, 3.12, -.08, mats.bakelite, 'contactBlock', .02);
    for (const bz of [-.42, .34]) {
      cylinder(contacts, .038, 2.74, 2.15, 3.12, bz, mats.brass, 'contactBlock', 'y', 16);
      hexNut(contacts, .068, .08, 2.15, 4.46, bz, mats.brass, 'contactBlock', 'y');
      cylinder(contacts, .032, 2.68, -.25, 3.12, bz, mats.brass, 'contactBlock', 'y', 16);
      hexNut(contacts, .058, .07, -.25, 4.43, bz, mats.brass, 'contactBlock', 'y');
    }

    const backOnlyCount = spec.backOnly || 0;
    const total = spec.complete + spec.frontOnly + backOnlyCount;
    const gap = total > 1 ? 1.84 / (total - 1) : .5;
    for (let i = 0; i < total; i++) {
      const y = 2.24 + i * gap;
      const contactGroup = new T.Group();
      contactGroups.push(contactGroup); contacts.add(contactGroup);
      // 层间金属隔片（模拟图4.1.1b 接点堆叠层次感）
      box(contactGroup, .44, .016, 1.12, 2.15, y, -.08, mats.steel, 'contactBlock');
      box(contactGroup, .28, .016, 1.02, -.25, y, -.08, mats.steel, 'contactBlock');

      let hasFront = true, hasBack = true;
      if (backOnlyCount > 0) {
        if (i < spec.frontOnly) { hasFront = true; hasBack = false; }
        else if (i < spec.frontOnly + backOnlyCount) { hasFront = false; hasBack = true; }
        else { hasFront = true; hasBack = true; }
      } else {
        hasFront = true;
        hasBack = i < spec.complete;
      }
      const reinforced = i < spec.reinforced;
      const width = reinforced ? .33 : .19;

      cylinder(rodGroup, .058, .14, 0, y, 0, mats.ceramic, 'rod', 'z', 20);
      cylinder(rodGroup, .036, .18, 0, y, 0, mats.brass, 'rod', 'z', 16);

      if (hasFront) {
        const fm = material(C.silver, .90, .14);
        frontMats.push(fm);
        const frontBlade = bevelBox(contactGroup, 1.22, .030, width, 1.63, y + .096, .28, mats.brass, 'front', .005);
        frontBlade.userData.contactGroup = i + 1;
        bevelBox(contactGroup, .125, .030, width * .86, 1.09, y + .078, .28, mats.carbon, 'front', .004);
        contactRivet(contactGroup, reinforced ? .082 : .068, .036, 1.09, y + .090, .28, fm, 'front', -1);
        const upperStop = bevelBox(contactGroup, .78, .024, width * .82, 1.68, y + .134, .28, mats.spring, 'front', .004);
        upperStop.rotation.z = -.048;
        bevelBox(backplate, .36, .026, .095, 2.74, y + .096, .28, mats.brass, 'front', .004);
      }

      if (hasBack) {
        const bm = material(C.silver, .90, .14);
        backMats.push(bm);
        const backBlade = bevelBox(contactGroup, 1.22, .030, width, 1.63, y - .096, .28, mats.brass, 'back', .005);
        backBlade.userData.contactGroup = i + 1;
        contactRivet(contactGroup, reinforced ? .082 : .068, .036, 1.09, y - .090, .28, bm, 'back', 1);
        const lowerStop = bevelBox(contactGroup, .78, .024, width * .82, 1.68, y - .134, .28, mats.spring, 'back', .004);
        lowerStop.rotation.z = .048;
        bevelBox(backplate, .36, .026, .095, 2.74, y - .096, .28, mats.brass, 'back', .004);
      }

      if (reinforced) {
        bevelBox(contactGroup, .22, .20, .045, 1.09, y, .49, mats.steel, 'front', .006);
        bevelBox(contactGroup, .16, .15, .035, 1.09, y, .52, mats.brass, 'front', .005);
      }

      const lever = new T.Group(); lever.position.set(-.20, y, .28); contactGroup.add(lever); levers.push(lever);
      const commonBlade = bevelBox(lever, 1.36, .026, width * .78, .66, 0, 0, mats.spring, 'common', .004);
      commonBlade.userData.contactGroup = i + 1;
      contactRivet(lever, reinforced ? .076 : .064, .032, 1.29, .005, 0, mats.contact, 'common', 1);
      contactRivet(lever, reinforced ? .076 : .064, .032, 1.29, -.005, 0, mats.contact, 'common', -1);
      bevelBox(backplate, .36, .026, .095, 2.74, y, -.18, mats.brass, 'common', .004);
      contactGroup.traverse(o => { if (o.isMesh) o.userData.contactGroup = i + 1; });
      if (hasFront && hasBack && !contactGroups.detailIndex) {
        contactGroups.detailIndex = i + 1;
        for (const [text, dy, part] of [[type === 'latching' ? '定位接点' : '前接点', .17, 'front'], ['中接点', 0, 'common'], [type === 'latching' ? '反位接点' : '后接点', -.17, 'back']]) {
          const anchor = label(contactGroup, text, [1.7, y + dy, .65], [1.09, y + dy * .5, .28], labelList);
          anchor.userData.detail = true; anchor.userData.part = part;
        }
      }
    }

    // 6. 标注各个继电器的接点常开/常闭与铁路规定常态（严格依据教材图4.1.7、表4.1.3、表5.1.1、表5.2.1）
    const topY = 2.24 + (total - 1) * gap;
    const normalTag = type === 'latching'
      ? '2DQJ常态定位(111-112闭合)'
      : ['rectifier', 'filament'].includes(type)
        ? (type === 'filament' ? 'DJ常态↑(平时11-12闭合)' : 'GJ常态↑(平时11-12闭合)')
        : type === 'biased'
          ? 'DBJ常态↑ / FBJ常态↓'
          : type === 'heavySlow'
            ? '1DQJ常态↓(平时11-13闭合)'
            : type === 'slowRelease'
              ? 'FDGJ常态↓(平时11-13闭合)'
              : '失电：11-12常开 / 11-13常闭';

    if (type === 'contacts') {
      label(contacts, '12 前接点（失电常开·GJ常态闭合）', [3.35, topY + .34, .55], [1.35, topY + .11, .28], labelList);
      label(contacts, '11 中接点（动接点簧片）', [3.35, topY - .15, .55], [1.09, topY, .28], labelList);
      label(contacts, '13 后接点（失电常闭·XJ常态闭合）', [3.35, topY - .65, .55], [1.35, topY - .11, .28], labelList);
      label(mechanism, '梳形拉杆（陶瓷推珠）', [.15, 4.55, .85], [.80, topY, .28], labelList);
      label(mechanism, '衔铁与叠片重锤', [-2.6, 2.55, .3], [-1.2, 2.02, 0], labelList);
    } else {
      if (!['slowRelease', 'heavySlow', 'differential'].includes(type)) {
        label(magnet, '双线圈 (1-2 / 3-4)', [-1.05, .28, 1.48], [-1.25, .9, .48], labelList);
      }
      label(magnet, '铁芯与极靴止片', [-3.05, .62, -.82], [-2.38, .93, 0], labelList);
      label(mechanism, '一体L形衔铁', [-3.25, 2.55, .25], [-2.46, 1.94, .25], labelList);
      label(mechanism, '拉杆', [.25, 4.55, .88], [.80, 3.45, .28], labelList);
      label(contacts, `${spec.contacts} · ${normalTag}`, [3.48, 3.82, .85], [1.45, 3.45, .28], labelList);
    }
    if (caption) label(fixed, `${caption} · ${spec.model}`, [0, 5.05, 0], null, labelList);

    const controlLoop = makeLoop(field, [[1.64, .93, 0], [-2.38, .93, 0], [-2.44, 1.92, 0], [1.64, 1.66, 0]], C.green, 12);
    let permLoop = null, eddyLoop = null;
    if (type === 'biased') {
      permLoop = makeLoop(field, [[-2.72, .35, 0], [-2.72, .88, 0], [-2.47, .88, 0], [-2.38, .55, 0], [-2.38, .35, 0]], C.rose, 7);
    } else if (type === 'latching') {
      permLoop = makeLoop(field, [[-1.76, 1.80, 0], [-1.76, 2.04, 0], [-.44, 2.02, 0], [-.44, 1.66, 0], [-1.76, 1.66, 0]], C.violet, 8);
    } else if (hasCopperSleeve) {
      eddyLoop = makeLoop(field, [[-1.95, .52, .38], [-1.05, .52, .38], [-1.05, 1.34, -.38], [-1.95, 1.34, -.38]], C.amber, 7);
    }

    const coverGroup = new T.Group(); rootGroup.add(coverGroup);
    const coverMat = new T.MeshPhysicalMaterial({ color: 0xb6d6e8, transparent: true, opacity: .10, roughness: .08, metalness: .05, transmission: .18, side: T.DoubleSide, depthWrite: false });
    const cover = box(coverGroup, 6.1, 4.75, 2.55, 0, 2.25, 0, coverMat, 'cover');
    const edges = new T.LineSegments(new T.EdgesGeometry(cover.geometry), new T.LineBasicMaterial({ color: 0x8bb6ca, transparent: true, opacity: .34 }));
    edges.position.copy(cover.position); coverGroup.add(edges);
    // 防尘罩顶部提手与两侧锁扣卡簧
    bevelBox(coverGroup, 1.35, .10, .14, -.2, 4.68, 0, mats.steel, 'cover', .015);
    for (const sx of [-.82, .42]) bevelBox(coverGroup, .10, .12, .14, sx, 4.62, 0, mats.dark, 'cover', .01);
    for (const cz of [-1.29, 1.29]) bevelBox(coverGroup, .24, .34, .05, -2.55, .18, cz, mats.steel, 'cover', .008);

    return {
      root: rootGroup, field, coils, type, physical: true, spec,
      contactGroups, contactCenter: [1.05, 2.24 + ((contactGroups.detailIndex || 1) - 1) * gap, .28],
      subGroups: { fixed, backplate, magnet, mechanism, contacts },
      setView(s) {
        const e = (s.explode || 0) / 100;
        coverGroup.visible = !!s.cover && !s.contactFocus;
        fixed.visible = backplate.visible = magnet.visible = mechanism.visible = !s.contactFocus;
        contactGroups.forEach((g, i) => { g.visible = !s.contactFocus || i + 1 === contactGroups.detailIndex; });
        fixed.position.set(0, 0, 0);
        magnet.position.set(-.35 * e, .72 * e, -.85 * e);
        mechanism.position.set(-1.55 * e, 1.28 * e, .90 * e);
        contacts.position.set(.55 * e, 1.72 * e, 0);
        backplate.position.set(2.05 * e, .98 * e, 0);
        labelList.forEach(l => { l.visible = !!s.labels && (s.contactFocus ? !!l.userData.detail : !l.userData.detail); });
        field.visible = !!s.field && e < .35 && !s.contactFocus;
      },
      pose(p, r, s, time) {
        const a = Math.max(0, Math.min(1, p));
        const theta = -.024 + a * .064;
        armature.rotation.z = theta;
        const dy = 3.26 * (Math.sin(theta) - Math.sin(-.024));
        rodGroup.position.y = dy;
        for (const lever of levers) lever.rotation.z = -.046 + a * .092;

        const fc = a > .94, bc = a < .06;
        frontMats.forEach(m => { m.color.setHex(fc ? C.green : C.silver); m.emissive.setHex(fc ? 0x163d2b : 0); });
        backMats.forEach(m => { m.color.setHex(bc ? C.green : C.silver); m.emissive.setHex(bc ? 0x163d2b : 0); });
        coils.forEach(c => { c.copper.emissive.setHex(r.drive ? 0x623412 : 0); c.copper.emissiveIntensity = .7; });

        const slowHolding = hasCopperSleeve && !r.drive && a > .04;
        if (sleeveMat) {
          sleeveMat.emissive.setHex(slowHolding ? 0x6b3b0e : 0);
          sleeveMat.emissiveIntensity = slowHolding ? .85 : 0;
        }
        if (timerLedMat) {
          const charging = r.drive && a < .94;
          timerLedMat.color.setHex(fc ? C.green : charging ? C.amber : 0x526475);
          timerLedMat.emissive.setHex(fc ? 0x1b5e43 : charging ? 0x6e4811 : 0);
        }

        controlLoop.setVisible(!!r.drive || slowHolding);
        const ctrlDir = (s && s.polarity === -1 && s.mode === 'bench') ? -1 : 1;
        controlLoop.dots.forEach((d, i) => {
          d.position.copy(controlLoop.curve.getPoint(((time * .13 * ctrlDir + i / controlLoop.dots.length) % 1 + 1) % 1));
        });

        if (permLoop) {
          permLoop.setVisible(true);
          const permDir = type === 'latching' ? (r.picked ? 1 : -1) : 1;
          permLoop.dots.forEach((d, i) => {
            d.position.copy(permLoop.curve.getPoint(((time * .10 * permDir + i / permLoop.dots.length) % 1 + 1) % 1));
          });
        }
        if (eddyLoop) {
          eddyLoop.setVisible(slowHolding || !!r.drive);
          eddyLoop.dots.forEach((d, i) => {
            d.position.copy(eddyLoop.curve.getPoint(((time * .18 + i / eddyLoop.dots.length) % 1 + 1) % 1));
          });
        }
      },
      dispose() {
        const gs = new Set(), ms = new Set(), maps = new Set();
        rootGroup.traverse(o => {
          if (o.geometry) gs.add(o.geometry);
          if (o.material) {
            const arr = Array.isArray(o.material) ? o.material : [o.material];
            arr.forEach(m => { ms.add(m); if (m.map) maps.add(m.map); });
          }
        });
        gs.forEach(g => g.dispose()); maps.forEach(t => t.dispose()); ms.forEach(m => m.dispose());
      }
    };
  }

  // CR400AF base-series exterior reference, with a shortened teaching body.
  // 严格对照实拍复兴号 CR400AF-A（红神龙 / 飞龙）金属银灰机身、亮银头罩、上扬红飘带、黑色鹰面窗带与无外露车轮全包气动裙板
  function makeCR400AFLiveryMat(isTail = false, uCab = .58) {
    if (typeof document === 'undefined') return material(0xc4ced8, .44, .22);
    const W = 1024, H = 512;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    // angle = -π/2 + v * 2π，v=0.25(+Z右侧), v=0.50(+Y车顶), v=0.75(-Z左侧)，底缝藏于车底
    const cyOf = (side, h) => {
      const clamped = Math.max(-1, Math.min(1, h));
      const ang = side > 0 ? Math.asin(clamped) : (Math.PI - Math.asin(clamped));
      const v = (ang + Math.PI / 2) / (Math.PI * 2);
      return (1 - v) * H;
    };
    const uX = u => (isTail ? (1 - u) : u) * W;
    const noseU = t => uCab + (1 - uCab) * t;
    const drawBand = (side, u0, u1, hLo, hHi, fill) => {
      const x0 = Math.min(uX(u0), uX(u1)), x1 = Math.max(uX(u0), uX(u1));
      const y0 = Math.min(cyOf(side, hLo), cyOf(side, hHi)), y1 = Math.max(cyOf(side, hLo), cyOf(side, hHi));
      ctx.fillStyle = fill;
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    };
    const drawPoly = (side, pts, fill) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      pts.forEach(([u, h], idx) => {
        const px = uX(u), py = cyOf(side, h);
        if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
    };

    // 1. 实车拉丝金属银灰底漆（对照参考图一：银灰车身 + 车顶浅银高光，非惨白塑料）
    const baseGrad = ctx.createLinearGradient(0, 0, 0, H);
    baseGrad.addColorStop(0, '#7c8896');
    baseGrad.addColorStop(.18, '#a8b4c0');
    baseGrad.addColorStop(.32, '#c8d2dc');
    baseGrad.addColorStop(.50, '#dfe6ee');
    baseGrad.addColorStop(.68, '#c8d2dc');
    baseGrad.addColorStop(.82, '#a8b4c0');
    baseGrad.addColorStop(1, '#7c8896');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, W, H);

    // 车头最前端抛光亮银色自动车钩头罩（对照参考图一左端亮银头罩 + 弧形分缝）
    const capX0 = Math.min(uX(noseU(.86)), uX(1.0)), capX1 = Math.max(uX(noseU(.86)), uX(1.0));
    const capGrad = ctx.createLinearGradient(0, 0, 0, H);
    capGrad.addColorStop(0, '#9aa8b6');
    capGrad.addColorStop(.35, '#dce5ee');
    capGrad.addColorStop(.50, '#f4f8fc');
    capGrad.addColorStop(.65, '#dce5ee');
    capGrad.addColorStop(1, '#9aa8b6');
    ctx.fillStyle = capGrad;
    ctx.fillRect(capX0, 0, capX1 - capX0, H);

    const uWinStart = .02, uWinEnd = Math.max(.34, uCab - .01);
    const uDoorStart = Math.max(.18, uWinEnd - .11), uDoorEnd = uDoorStart + .075;

    for (const side of [1, -1]) {
      // 2. 全包气动裙板底部深灰阴影饰条（贴近轨面，完全遮蔽车底与转向架）
      drawBand(side, 0, 1, -1.0, -0.78, '#26313c');
      drawBand(side, 0, 1, -0.78, -0.72, '#475665');

      // 3. 客室贯通黑色全景窗带（前端在驾驶室后方锐利收尖成飞镖形，严格还原参考图一！）
      drawPoly(side, [
        [uWinStart, .32], [uWinEnd, .32], [noseU(.10), .24],
        [noseU(.28), .04], [noseU(.42), -.24], [noseU(.26), -.26],
        [uWinEnd, -.14], [uWinStart, -.14]
      ], '#0a121b');
      // 客室玻璃窗高光反光格
      const wStart = uWinStart + .02, wEnd = uDoorStart - .02;
      if (wEnd > wStart + .05) {
        const wCount = wEnd - wStart > .22 ? 3 : 2;
        const step = (wEnd - wStart) / wCount;
        for (let wi = 0; wi < wCount; wi++) {
          const a = wStart + wi * step, b = a + step * .82;
          drawBand(side, a, b, -.09, .27, '#142434');
          drawBand(side, a + .005, b - .005, .14, .24, 'rgba(155,205,245,0.22)');
        }
      }
      // 前方锥形侧窗玻璃微光
      drawPoly(side, [
        [uDoorEnd + .02, .24], [noseU(.06), .18], [noseU(.22), .00],
        [noseU(.32), -.18], [uDoorEnd + .02, -.10]
      ], '#16283a');

      // 4. 标志性中国红“红神龙 / 飞龙”大弧度跃升飘带 + 客室下方细红腰线（与黑窗带之间留出金属银细缝！）
      const redGrad = ctx.createLinearGradient(uX(0), 0, uX(1), 0);
      redGrad.addColorStop(0, '#c81227');
      redGrad.addColorStop(.55, '#df1730');
      redGrad.addColorStop(1, '#ef233b');
      // 客室水平细红腰带（黑窗带 -0.14 下方留银边，红带在 -0.25..-0.35）
      drawBand(side, 0, noseU(.04), -.36, -.25, redGrad);
      // 车头宽幅中国红龙翼跃升飘带（自鼻锥下缘宽幅向后上方华丽弧线跃起，紧贴黑窗带前斜边！）
      drawPoly(side, [
        [noseU(.02), -.25], [noseU(.24), -.04], [noseU(.48), .08],
        [noseU(.70), -.22], [noseU(.84), -.66], [noseU(.66), -.66],
        [noseU(.48), -.22], [noseU(.24), -.24], [noseU(.02), -.36]
      ], redGrad);

      // 上沿细红“龙眉”饰线（紧贴黑色驾驶室风挡外缘，一直前伸汇向车头 CR 徽标！）
      drawPoly(side, [
        [noseU(.12), .48], [noseU(.36), .46], [noseU(.60), .42],
        [noseU(.78), .34], [noseU(.76), .28], [noseU(.58), .36],
        [noseU(.35), .40], [noseU(.12), .42]
      ], '#e21b33');

      // 驾驶室侧黑色狭长鹰眼侧窗（参考图一红色龙眉与大灯之间的锐利黑窗）
      drawPoly(side, [
        [noseU(.06), .38], [noseU(.28), .40], [noseU(.46), .26],
        [noseU(.24), .24], [noseU(.08), .28]
      ], '#0b141f');

      // 塞拉客室车门细黑框线（贯穿窗带与裙板）
      const dx0 = Math.min(uX(uDoorStart), uX(uDoorEnd)), dx1 = Math.max(uX(uDoorStart), uX(uDoorEnd));
      const dy0 = Math.min(cyOf(side, -.70), cyOf(side, .46)), dy1 = Math.max(cyOf(side, -.70), cyOf(side, .46));
      ctx.strokeStyle = '#1f2b36'; ctx.lineWidth = 2.6;
      ctx.strokeRect(dx0, dy0, dx1 - dx0, dy1 - dy0);
      drawBand(side, uDoorStart + .02, uDoorEnd - .02, -.08, .26, '#142638');

      // “复兴号”黑金书法铭文（位于窗带上方银灰车身，严格还原参考图一位置！）
      ctx.save();
      const fx = uX(Math.max(.10, uDoorStart - .12)), fy = cyOf(side, .47);
      ctx.translate(fx, fy);
      if (side < 0) ctx.scale(-1, 1);
      ctx.fillStyle = '#19222c';
      ctx.font = '700 19px "STKaiti","KaiTi","PingFang SC","Microsoft YaHei",serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('复兴号', 0, 0);
      ctx.restore();

      // 车型号 “CR400AF-A” 细字（位于红腰带下方银灰侧板，对照参考图一！）
      ctx.save();
      const cx2 = uX(noseU(.06)), cy2 = cyOf(side, -.50);
      ctx.translate(cx2, cy2);
      if (side < 0) ctx.scale(-1, 1);
      ctx.fillStyle = '#1e2a36';
      ctx.font = '700 13px ui-monospace,SFMono-Regular,Menlo,monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CR400AF-A', 0, 0);
      ctx.restore();

      // 亮银头罩与车身分缝弧线
      ctx.strokeStyle = 'rgba(42,54,66,0.72)'; ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(uX(noseU(.84)), cyOf(side, -.74));
      ctx.quadraticCurveTo(uX(noseU(.88)), cyOf(side, -.10), uX(noseU(.85)), cyOf(side, .58));
      ctx.stroke();
    }

    // 5. 超长低倾角黑色鹰面贯通前挡风（横跨车顶正中 v=0.50，与两侧红龙眉无缝贴合！）
    const wsX0 = Math.min(uX(noseU(.04)), uX(noseU(.56))), wsX1 = Math.max(uX(noseU(.04)), uX(noseU(.56)));
    const wsTop = cyOf(-1, .36), wsBot = cyOf(1, .36);
    const wsGrad = ctx.createLinearGradient(wsX0, wsTop, wsX1, wsBot);
    wsGrad.addColorStop(0, '#070f18');
    wsGrad.addColorStop(.42, '#1d3954');
    wsGrad.addColorStop(.52, '#0b1724');
    wsGrad.addColorStop(1, '#08111b');
    ctx.fillStyle = wsGrad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(wsX0, wsTop, wsX1 - wsX0, wsBot - wsTop, 28) : ctx.fillRect(wsX0, wsTop, wsX1 - wsX0, wsBot - wsTop);
    ctx.fill();
    // 挡风玻璃柔和银蓝反光与中置雨刮
    ctx.fillStyle = 'rgba(185,228,255,0.22)';
    ctx.fillRect(wsX0 + (wsX1 - wsX0) * .14, H * .435, (wsX1 - wsX0) * .64, H * .038);
    ctx.strokeStyle = '#384c5e'; ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(uX(noseU(.52)), H * .50); ctx.lineTo(uX(noseU(.24)), H * .48);
    ctx.stroke();

    // 鼻梁正中中国铁路 CR 徽标（嵌于双红龙眉交汇处前方）
    ctx.fillStyle = '#d8162e';
    ctx.beginPath();
    ctx.arc(uX(noseU(.76)), H * .50, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2d37c';
    ctx.beginPath();
    ctx.arc(uX(noseU(.76)), H * .50, 4.6, 0, Math.PI * 2);
    ctx.fill();

    const tex = new T.CanvasTexture(canvas);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 4;
    return new T.MeshStandardMaterial({ map: tex, metalness: .46, roughness: .22, side: T.DoubleSide });
  }

  // 复兴号 CR400AF-A 中间客车车厢无缝贯通涂装（与头车/尾车窗带、银灰细缝、红腰线及全包裙板像素级齐平）
  function makeCR400AFMidLiveryMat() {
    if (typeof document === 'undefined') return material(0xc4ced8, .44, .22);
    const W = 1024, H = 512;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const cyOf = (side, h) => {
      const clamped = Math.max(-1, Math.min(1, h));
      const ang = side > 0 ? Math.asin(clamped) : (Math.PI - Math.asin(clamped));
      const v = (ang + Math.PI / 2) / (Math.PI * 2);
      return (1 - v) * H;
    };
    const drawBand = (side, u0, u1, hLo, hHi, fill) => {
      const x0 = u0 * W, x1 = u1 * W;
      const y0 = Math.min(cyOf(side, hLo), cyOf(side, hHi)), y1 = Math.max(cyOf(side, hLo), cyOf(side, hHi));
      ctx.fillStyle = fill;
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    };
    const baseGrad = ctx.createLinearGradient(0, 0, 0, H);
    baseGrad.addColorStop(0, '#7c8896');
    baseGrad.addColorStop(.18, '#a8b4c0');
    baseGrad.addColorStop(.32, '#c8d2dc');
    baseGrad.addColorStop(.50, '#dfe6ee');
    baseGrad.addColorStop(.68, '#c8d2dc');
    baseGrad.addColorStop(.82, '#a8b4c0');
    baseGrad.addColorStop(1, '#7c8896');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, W, H);

    for (const side of [1, -1]) {
      drawBand(side, 0, 1, -1.0, -.78, '#26313c');
      drawBand(side, 0, 1, -.78, -.72, '#475665');
      // 全长贯通黑色全景客室窗带
      drawBand(side, 0, 1, -.14, .32, '#0a121b');
      // 5 扇大面积防眩客室玻璃窗 + 顶部微蓝反光
      const wStart = .16, wEnd = .84, wCount = 5, step = (wEnd - wStart) / wCount;
      for (let wi = 0; wi < wCount; wi++) {
        const a = wStart + wi * step + .01, b = wStart + (wi + 1) * step - .01;
        drawBand(side, a, b, -.09, .27, '#142434');
        drawBand(side, a + .004, b - .004, .14, .24, 'rgba(155,205,245,0.22)');
      }
      // 两端嵌入式塞拉客门与竖条门窗
      for (const [d0, d1] of [[.04, .12], [.88, .96]]) {
        drawBand(side, d0, d1, -.68, .35, 'rgba(20,30,42,0.18)');
        drawBand(side, d0 + .018, d1 - .018, -.08, .25, '#142638');
        ctx.strokeStyle = 'rgba(26,38,52,0.65)';
        ctx.lineWidth = 2;
        const dx0 = d0 * W, dx1 = d1 * W;
        const dy0 = Math.min(cyOf(side, -.68), cyOf(side, .35)), dy1 = Math.max(cyOf(side, -.68), cyOf(side, .35));
        ctx.strokeRect(dx0, dy0, dx1 - dx0, dy1 - dy0);
      }
      // 全长贯通中国红腰带（与头车/尾车 -0.36..-0.25 严格齐平）
      drawBand(side, 0, 1, -.36, -.25, '#d6162d');
      // 车顶两侧深银导流槽暗线
      drawBand(side, 0, 1, .76, .82, 'rgba(72,88,104,0.35)');
      // 侧身“复兴号”与“CR400AF-A”涂装铭牌
      ctx.save();
      ctx.translate(.50 * W, cyOf(side, .50));
      if (side < 0) ctx.scale(1, -1);
      ctx.fillStyle = '#1b2733';
      ctx.font = '700 26px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('复兴号', 0, 0);
      ctx.restore();
      ctx.save();
      ctx.translate(.50 * W, cyOf(side, -.52));
      if (side < 0) ctx.scale(1, -1);
      ctx.fillStyle = '#202d3a';
      ctx.font = '700 18px "Menlo","Helvetica Neue",sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CR400AF-A', 0, 0);
      ctx.restore();
    }
    const tex = new T.CanvasTexture(canvas);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 4;
    return new T.MeshStandardMaterial({ map: tex, metalness: .46, roughness: .22, side: T.DoubleSide });
  }

  // 构建单节流线型 CR400AF-A 复兴号车厢（支持头车/中间车/尾车，贴轨全包气动裙板无外露车轮，保留隐藏 wheelGroups 满足测试契约）
  function buildCR400AFCar(parent, opts) {
    const {
      xBack = -2.00, xFront = 1.16, xCabStart = -.18,
      halfW = .44, yBot = .16, yTop = .94,
      isTail = false, isMid = false, axleXs = [0, -.22, -1.36, -1.584], gauge = 1.06,
      withPantograph = true, pantoX = -.62, pantoBaseY = .95,
      headMaterials = [], tailMaterials = [], wheelGroups = []
    } = opts;
    const car = new T.Group();
    parent.add(car);
    const totalLen = xFront - xBack;
    const noseSpan = isMid ? 0 : Math.max(1e-4, isTail ? (xCabStart - xBack) : (xFront - xCabStart));
    const uCab = isMid ? 1 : (1 - noseSpan / totalLen);
    const bodyMat = isMid ? makeCR400AFMidLiveryMat() : makeCR400AFLiveryMat(isTail, uCab);
    const silverChrome = material(0xe3ebf2, .68, .18), skirt = material(0x1f2a35, .42, .48);
    const steel = material(0x889aa8, .78, .26), darkTrim = material(0x111a24, .45, .32);
    const redAccent = material(0xd4162e, .32, .26);

    function surface(x, angle, offset = 0) {
      let t = 0;
      if (!isMid) {
        if (!isTail) t = Math.max(0, Math.min(1, (x - xCabStart) / noseSpan));
        else t = Math.max(0, Math.min(1, (xCabStart - x) / noseSpan));
      }
      // 参考图一连续平滑低俯流线“飞龙”抛物轮廓（t^1.52，无折角白额头，直抵低矮亮银鼻尖）
      const top = yTop - (yTop - (yBot + .18)) * Math.pow(t, 1.52);
      const bottom = yBot + .04 * Math.pow(Math.max(0, (t - .68) / .32), 1.6);
      const wFactor = Math.pow(Math.max(.035, 1 - .90 * Math.pow(t, 2.08)), .48);
      const w = halfW * wFactor;
      const sin = Math.sin(angle), cos = Math.cos(angle);
      const p = (sin >= 0 ? .58 : .52) + .28 * t;
      const tuck = sin < 0 ? (1 - .10 * Math.pow(-sin, 1.4)) : 1;
      const midY = (top + bottom) / 2;
      const ry = (top - bottom) / 2 + offset;
      const rz = w * tuck + offset;
      return [x, midY + ry * Math.sign(sin) * Math.pow(Math.abs(sin), p), rz * Math.sign(cos) * Math.pow(Math.abs(cos), p)];
    }

    function loftSkin(x0, x1, a0, a1, mat, offset = 0, rows = 44, cols = 32, withUV = false) {
      const vertices = [], uvs = [], indices = [];
      for (let i = 0; i <= rows; i++) {
        const xi = x0 + (x1 - x0) * i / rows;
        const u = (xi - xBack) / totalLen;
        for (let j = 0; j <= cols; j++) {
          const v = j / cols;
          const ang = a0 + (a1 - a0) * v;
          vertices.push(...surface(xi, ang, offset));
          if (withUV) uvs.push(u, v);
        }
      }
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
        const k = i * (cols + 1) + j;
        indices.push(k, k + 1, k + cols + 1, k + 1, k + cols + 2, k + cols + 1);
      }
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
      if (withUV) geo.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices); geo.computeVertexNormals();
      return mesh(car, geo, mat, 0, 0, 0, 'train');
    }

    loftSkin(xBack, xFront, -Math.PI / 2, Math.PI * 1.5, bodyMat, 0, isMid ? 26 : 60, 36, true);

    // 封闭圆润亮银车鼻尖端面与平齐车端隔墙
    for (const [cx, isTip] of [[xBack, !isMid && isTail], [xFront, !isMid && !isTail]]) {
      const cY = isTip ? (yBot + .12) : ((yTop + yBot) / 2);
      const verts = [cx, cY, 0], idx = [];
      for (let i = 0; i <= 32; i++) verts.push(...surface(cx, -Math.PI / 2 + i * Math.PI / 16));
      for (let i = 1; i <= 32; i++) idx.push(0, i, i + 1);
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(verts, 3));
      geo.setIndex(idx); geo.computeVertexNormals();
      mesh(car, geo, isTip ? silverChrome : skirt, 0, 0, 0, 'train');
    }

    // 参考图一狭长斜掠“冰蓝白 LED 龙眼大灯”（仅头车/尾车安装）
    if (!isMid) {
      const lx0 = isTail ? (xBack + noseSpan * .34) : (xCabStart + noseSpan * .44);
      const lx1 = isTail ? (xBack + noseSpan * .56) : (xCabStart + noseSpan * .66);
      for (const side of [0, Math.PI]) {
        const sign = side === 0 ? 1 : -1;
        loftSkin(lx0, lx1, side + sign * .14, side + sign * .30, darkTrim, .008, 6, 4, false);
        const lampMat = new T.MeshBasicMaterial({ color: isTail ? 0xe62942 : 0xeef8ff, side: T.DoubleSide });
        (isTail ? tailMaterials : headMaterials).push(lampMat);
        loftSkin(lx0 + (lx1 - lx0) * .10, lx1 - (lx1 - lx0) * .08, side + sign * .17, side + sign * .265, lampMat, .013, 5, 3, false);
      }
    }

    if (!isMid && !isTail && opts.addFlatTailLights) {
      for (const zSign of [-1, 1]) {
        const tail = new T.MeshBasicMaterial({ color: 0xe62942 });
        tailMaterials.push(tail);
        box(car, .016, .040, .10, xBack - .008, (yBot + yTop) / 2, zSign * halfW * .56, tail, 'train');
      }
    }

    // 极低矮融入式流线车顶空调导流罩（中间车在受电弓前后设对称双空调罩）
    if (isMid) {
      for (const axOff of [-.42, .42]) {
        bevelBox(car, .30, .028, halfW * .80, axOff, yTop + .005, 0, silverChrome, 'train', .012);
        bevelBox(car, .19, .010, halfW * .52, axOff, yTop + .020, 0, darkTrim, 'train', .004);
      }
    } else {
      const acLen = Math.max(.26, (totalLen - noseSpan) * .54);
      const acX = isTail ? (xFront - acLen * .58) : (xBack + acLen * .58);
      bevelBox(car, acLen, .028, halfW * .82, acX, yTop + .005, 0, silverChrome, 'train', .012);
      bevelBox(car, acLen * .66, .010, halfW * .54, acX, yTop + .020, 0, darkTrim, 'train', .004);
    }

    // 响应用户要求：去掉外露车轮，保留内收在全包裙板之下的轮对分组节点与微弱底盘阴影以完整维持分路逻辑与测试契约
    const shadowSpan = Math.max(.4, (totalLen - noseSpan) * .92);
    const shadowMid = isMid ? ((xBack + xFront) / 2) : (isTail ? (xFront - shadowSpan / 2 - .04) : (xBack + shadowSpan / 2 + .04));
    box(car, shadowSpan, .035, halfW * 1.18, shadowMid, yBot + .01, 0, skirt, 'wheel');
    for (const axX of axleXs) {
      const ax = new T.Group(); ax.position.set(axX, yBot, 0); car.add(ax); wheelGroups.push(ax);
    }

    // DSA380 单臂受电弓与陶瓷绝缘子
    let pantograph = null, pantoLinks = [], pantoBow = null;
    if (withPantograph) {
      pantograph = new T.Group(); pantograph.name = 'pantograph'; car.add(pantograph);
      const armMat = material(0xc42034, .58, .28), carbon = material(0x18232a, .15, .65);
      const ceramic = material(0xe8eef0, .15, .42);
      bevelBox(pantograph, .36, .028, .34, pantoX, pantoBaseY + .014, 0, darkTrim, 'pantograph', .008);
      for (const [ix, iz] of [[-.09, -.09], [-.09, .09], [.10, 0]]) {
        cylinder(pantograph, .026, .068, pantoX + ix, pantoBaseY + .056, iz, ceramic, 'pantograph', 'y', 12);
      }
      bevelBox(pantograph, .28, .030, .28, pantoX, pantoBaseY + .10, 0, steel, 'pantograph', .008);
      wireTube(pantograph, [[pantoX - .15, pantoBaseY + .035, -.11], [pantoX - .28, pantoBaseY + .035, -.11]], .011, redAccent, 'pantograph');
      for (const z of [-.08, .08]) for (let i = 0; i < 2; i++) {
        const link = mesh(pantograph, new T.CylinderGeometry(.015, .015, 1, 10), armMat, 0, 0, z, 'pantograph');
        pantoLinks.push({ link, z, upper: i === 1 });
      }
      pantoBow = new T.Group(); pantograph.add(pantoBow);
      for (const x of [-.026, .026]) box(pantoBow, .028, .018, .52, x, 0, 0, carbon, 'pantograph');
      for (const z of [-.26, .26]) line3(pantoBow, [[0, 0, z], [0, -.040, z + Math.sign(z) * .065]], 0x8ea0ae, 1, 'pantograph');
    }

    return { car, pantograph, pantoLinks, pantoBow, pantoX };
  }

  // CR400AF-A 轨道电路 3 节编组复兴号动车组模型（头车 + 中间带受电弓客车 + 尾车 + 2 组柔性风挡，全包低裙板无外露车轮，保持 frontAxle=0、lastAxle=-axleSpan 与受电弓 1.83/1.40 高度契约）
  function buildTrainMesh(parent, scale = 1, axleSpan = 3.52, gauge = 1.06) {
    const train = new T.Group(); train.scale.setScalar(scale); parent.add(train);
    train.name = 'CR400AF-exterior-teaching-model-3car';
    train.userData.frontAxle = 0; train.userData.lastAxle = -axleSpan;
    train.userData.carCount = 3;
    train.userData.reference = 'https://www.crrcgc.cc/crrcgc/2026-05/09/article_2026050917102785945.html';
    train.userData.geometryBoundary = 'CR400AF-A 3 节编组动车组（头车+中间受电弓客车+尾车），全包气动裙板无外露车轮，前后端轮对范围严格对应 40% 区段分路长度';
    const xScale = axleSpan / 3.52;
    const headMaterials = [], tailMaterials = [], wheelGroups = [];
    const halfW = gauge * .40, yBot = .16, yTop = .86;

    const bMat = material(0x1b2530, .25, .68), bRib = material(0x2e3b48, .35, .52);
    const makeBellows = cx => {
      const bw = new T.Group(); bw.position.set(cx, 0, 0); train.add(bw);
      bevelBox(bw, .18 * xScale, .56, halfW * 1.44, 0, .49, 0, bMat, 'train', .014);
      for (const rx of [-.052, 0, .052]) bevelBox(bw, .018 * xScale, .58, halfW * 1.48, rx * xScale, .49, 0, bRib, 'train', .004);
      return bw;
    };

    // 第 1 节：头车（前轮位于 train 本地 x = 0，流线鼻尖 x = +0.62）
    const car1Wrap = new T.Group(); car1Wrap.position.set(-.32 * xScale, 0, 0); train.add(car1Wrap);
    buildCR400AFCar(car1Wrap, {
      xBack: -.64 * xScale, xFront: .94 * xScale, xCabStart: .20 * xScale,
      halfW, yBot, yTop,
      isTail: false, isMid: false, addFlatTailLights: false,
      axleXs: [.32 * xScale, -.42 * xScale], gauge,
      withPantograph: false,
      headMaterials, tailMaterials, wheelGroups
    });

    makeBellows(-1.03 * xScale);

    // 第 2 节：中间客车（居中 x = -1.76，配备车顶 DSA380 单臂受电弓与对称空调罩）
    const carMidWrap = new T.Group(); carMidWrap.position.set(-1.76 * xScale, 0, 0); train.add(carMidWrap);
    const carMid = buildCR400AFCar(carMidWrap, {
      xBack: -.66 * xScale, xFront: .66 * xScale, xCabStart: 0,
      halfW, yBot, yTop,
      isTail: false, isMid: true, addFlatTailLights: false,
      axleXs: [.42 * xScale, -.42 * xScale], gauge,
      withPantograph: true, pantoX: 0, pantoBaseY: yTop + .01,
      headMaterials, tailMaterials, wheelGroups
    });

    makeBellows(-2.49 * xScale);

    // 第 3 节：尾车（与头车严格镜像对称，后轮位于 train 本地 x = -3.52 = -axleSpan，尾尖 x = -4.14）
    const car3Wrap = new T.Group(); car3Wrap.position.set(-3.20 * xScale, 0, 0); train.add(car3Wrap);
    buildCR400AFCar(car3Wrap, {
      xBack: -.94 * xScale, xFront: .64 * xScale, xCabStart: -.20 * xScale,
      halfW, yBot, yTop,
      isTail: true, isMid: false, addFlatTailLights: false,
      axleXs: [.42 * xScale, -.32 * xScale], gauge,
      withPantograph: false,
      headMaterials, tailMaterials, wheelGroups
    });

    train.userData.cars = [car1Wrap, carMidWrap, car3Wrap];
    train.userData.wheelGroups = wheelGroups;
    train.userData.pantograph = carMid.pantograph;
    train.setOperatingState = function (state) {
      const raised = state.pantographPosition === undefined ? Number(!!state.pantograph) : state.pantographPosition;
      const height = 1.40 + .43 * Math.max(0, Math.min(1, raised));
      const elbow = new T.Vector3(-.28 * xScale, 1.12 + (height - 1.40) * .56, 0);
      const base = new T.Vector3(0, 1.00, 0), top = new T.Vector3(.06 * xScale, height, 0);
      for (const item of carMid.pantoLinks) {
        const a = (item.upper ? elbow : base).clone(), b = (item.upper ? top : elbow).clone();
        a.z = b.z = item.z;
        item.link.position.copy(a).add(b).multiplyScalar(.5);
        item.link.scale.y = a.distanceTo(b);
        item.link.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.sub(a).normalize());
      }
      carMid.pantoBow.position.copy(top);
      const powered = !!state.power;
      headMaterials.forEach(m => m.color.setHex(state.direction < 0 ? 0xe62942 : powered ? 0xeef8ff : 0x59616a));
      tailMaterials.forEach(m => m.color.setHex(state.direction < 0 && powered ? 0xeef8ff : 0xe62942));
      wheelGroups.forEach(g => { g.rotation.z = -(state.distance || 0) / .175; });
    };
    train.setOperatingState({ pantograph: true, power: true, direction: 1, distance: 0 });
    return train;
  }

  // 车站联锁专用：3 节编组铰接 CR400AF-A 复兴号动车组（头车 + 中间带受电弓客车 + 尾车 + 2 组柔性风挡，全包裙板无外露车轮，5点弧长贴轨过弯）
  function buildStationCR400AF(parent, scale = .82, axleSpan = 16 * .115 / .82, gauge = .74 / .82) {
    const train = new T.Group();
    parent.add(train);
    train.name = 'CR400AF-articulated-station-emu-3car';
    train.userData.frontAxle = 0;
    train.userData.lastAxle = -axleSpan;
    train.userData.carCount = 3;
    train.userData.geometryBoundary = 'CR400AF-A 3 节编组铰接动车组（头车+中间受电弓客车+尾车），全包裙板无外露车轮，按弧长贴合实体弯道道岔';
    const headMaterials = [], tailMaterials = [], wheelGroups = [];

    // 单节弧长 1.18 + 柔性风挡 0.11 × 2，整列修长威武 4.54 世界单位（与 60 单位站场及 10.6 单位中间股道比例完美匹配）
    const CAR_SPAN = 1.18, GAP = .11;
    const halfLocal = (CAR_SPAN / 2) / scale; // ≈ 0.720
    const bMat = material(0x1b2530, .25, .68), bRib = material(0x2e3b48, .35, .52);
    const makeBellows = () => {
      const bw = new T.Group(); train.add(bw);
      bevelBox(bw, .17, .50, .48, 0, .41, 0, bMat, 'train', .012);
      for (const rx of [-.048, 0, .048]) bevelBox(bw, .016, .52, .50, rx, .41, 0, bRib, 'train', .004);
      return bw;
    };

    // 第 1 节：头车（流线低俯鼻锥 + 龙眼LED头灯）
    const car1Wrap = new T.Group(); car1Wrap.scale.setScalar(scale); train.add(car1Wrap);
    buildCR400AFCar(car1Wrap, {
      xBack: -halfLocal - .05, xFront: halfLocal + .48, xCabStart: .04,
      halfW: gauge * .40, yBot: .15, yTop: .84,
      isTail: false, isMid: false, addFlatTailLights: false,
      axleXs: [halfLocal - .15, -halfLocal + .13], gauge,
      withPantograph: false,
      headMaterials, tailMaterials, wheelGroups
    });

    const bellows1Wrap = makeBellows();

    // 第 2 节：中间客车（连续全景窗带 + 塞拉客门 + 车顶 DSA380 单臂受电弓）
    const carMidWrap = new T.Group(); carMidWrap.scale.setScalar(scale); train.add(carMidWrap);
    const carMid = buildCR400AFCar(carMidWrap, {
      xBack: -halfLocal - .05, xFront: halfLocal + .05, xCabStart: 0,
      halfW: gauge * .40, yBot: .15, yTop: .84,
      isTail: false, isMid: true, addFlatTailLights: false,
      axleXs: [halfLocal - .16, -halfLocal + .16], gauge,
      withPantograph: true, pantoX: 0, pantoBaseY: .85,
      headMaterials, tailMaterials, wheelGroups
    });

    const bellows2Wrap = makeBellows();

    // 第 3 节：尾车（对称流线尾锥 + 红白可切换尾灯）
    const car3Wrap = new T.Group(); car3Wrap.scale.setScalar(scale); train.add(car3Wrap);
    buildCR400AFCar(car3Wrap, {
      xBack: -halfLocal - .48, xFront: halfLocal + .05, xCabStart: -.04,
      halfW: gauge * .40, yBot: .15, yTop: .84,
      isTail: true, isMid: false, addFlatTailLights: false,
      axleXs: [halfLocal - .13, -halfLocal + .15], gauge,
      withPantograph: false,
      headMaterials, tailMaterials, wheelGroups
    });

    train.userData.cars = [car1Wrap, carMidWrap, car3Wrap];
    train.userData.wheelGroups = wheelGroups;
    train.userData.pantograph = carMid.pantograph;
    train.setOperatingState = function (state) {
      const raised = state.pantographPosition === undefined ? Number(!!state.pantograph) : state.pantographPosition;
      const height = 1.40 + .43 * Math.max(0, Math.min(1, raised));
      const px = carMid.pantoX;
      const elbow = new T.Vector3(px - .26, 1.08 + (height - 1.40) * .58, 0);
      const base = new T.Vector3(px, .99, 0), top = new T.Vector3(px + .06, height, 0);
      for (const item of carMid.pantoLinks) {
        const a = (item.upper ? elbow : base).clone(), b = (item.upper ? top : elbow).clone();
        a.z = b.z = item.z;
        item.link.position.copy(a).add(b).multiplyScalar(.5);
        item.link.scale.y = a.distanceTo(b);
        item.link.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.sub(a).normalize());
      }
      carMid.pantoBow.position.copy(top);
      const powered = !!state.power;
      headMaterials.forEach(m => m.color.setHex(state.direction < 0 ? 0xe62942 : powered ? 0xeef8ff : 0x59616a));
      tailMaterials.forEach(m => m.color.setHex(state.direction < 0 && powered ? 0xeef8ff : 0xe62942));
      wheelGroups.forEach(g => { g.rotation.z = -(state.distance || 0) / .145; });
    };

    train.placeOnSpline = function (sampleFn, pos) {
      const p1F = sampleFn(pos);
      const targets = [
        CAR_SPAN,
        CAR_SPAN + GAP,
        CAR_SPAN * 2 + GAP,
        CAR_SPAN * 2 + GAP * 2,
        CAR_SPAN * 3 + GAP * 2
      ];
      const found = [null, null, null, null, null];
      let acc = 0, prevP = pos, prevPt = p1F, ti = 0;
      for (let step = 0; step < 300 && ti < targets.length; step++) {
        const nextP = prevP - .35;
        const nextPt = sampleFn(nextP);
        const seg = Math.hypot(nextPt.x - prevPt.x, nextPt.z - prevPt.z);
        if (seg < 1e-5) { prevP = nextP; prevPt = nextPt; continue; }
        while (ti < targets.length && acc + seg >= targets[ti]) {
          const frac = (targets[ti] - acc) / seg;
          found[ti] = {
            x: prevPt.x + (nextPt.x - prevPt.x) * frac,
            z: prevPt.z + (nextPt.z - prevPt.z) * frac
          };
          ti++;
        }
        acc += seg; prevP = nextP; prevPt = nextPt;
      }
      const dx0 = Math.cos(p1F.yaw), dz0 = Math.sin(p1F.yaw);
      const fallback = idx => ({ x: p1F.x - dx0 * targets[idx], z: p1F.z - dz0 * targets[idx] });
      const p1R = found[0] || fallback(0);
      const p2F = found[1] || fallback(1);
      const p2R = found[2] || fallback(2);
      const p3F = found[3] || fallback(3);
      const p3R = found[4] || fallback(4);

      train.position.set(p1F.x, 0, p1F.z);
      train.rotation.y = 0;
      const placeSeg = (grp, a, b) => {
        grp.position.set((a.x + b.x) / 2 - p1F.x, 0, (a.z + b.z) / 2 - p1F.z);
        grp.rotation.y = -Math.atan2(a.z - b.z, a.x - b.x);
      };
      placeSeg(car1Wrap, p1F, p1R);
      placeSeg(bellows1Wrap, p1R, p2F);
      placeSeg(carMidWrap, p2F, p2R);
      placeSeg(bellows2Wrap, p2R, p3F);
      placeSeg(car3Wrap, p3F, p3R);
    };

    train.setOperatingState({ pantograph: true, power: true, direction: 1, distance: 0 });
    return train;
  }

  function buildIRail(g, length, x, y, z, mat) {
    box(g, length, .035, .13, x, y + .018, z, mat, 'rail');
    box(g, length, .065, .045, x, y + .062, z, mat, 'rail');
    box(g, length, .042, .095, x, y + .110, z, mat, 'rail');
  }

  function catenarySupports(parent, x0, x1, z, height) {
    const poleMat = material(0x617584, .6, .45);
    line3(parent, [[x0, height + .15, z], [x1, height + .15, z]], 0x718896, .7, 'catenary');
    for (let x = x0; x <= x1; x += 4) {
      cylinder(parent, .028, height + .28, x, (height + .28) / 2, z + 1.0, poleMat, 'catenary', 'y', 10);
      line3(parent, [[x, height + .24, z + 1.0], [x, height + .15, z], [x + .14, height, z]], 0xa3b4c0, 1, 'catenary');
      line3(parent, [[x + 1, height + .15, z], [x + 1, height, z]], 0x91a6b6, .9, 'catenary');
    }
  }
  function createTrack() {
    const root = new T.Group(), railMat = material(C.steel, .85, .22), sleeper = material(0x3a4b56, .22, .65), ballast = material(0x1b2631, .12, .85), clipMat = material(C.dark, .5, .4);
    root.position.set(0, 0, -3.5);
    bevelBox(root, 26.6, .14, 2.35, 0, -.09, 0, ballast, 'rail', .03);
    for (const z of [-.53, .53]) buildIRail(root, 26, 0, .02, z, railMat);
    for (let i = -24; i <= 24; i++) {
      bevelBox(root, .21, .11, 1.72, i * .54, -.01, 0, sleeper, 'rail', .015);
      for (const z of [-.53, .53]) box(root, .09, .04, .18, i * .54, .05, z, clipMat, 'rail');
    }
    const boundaries = new T.Group(); root.add(boundaries);
    for (const x of [-4.4, 4.4]) {
      for (const z of [-.53, .53]) {
        bevelBox(boundaries, .14, .16, .16, x, .09, z, material(C.copper, .75, .28), 'insulation', .012);
      }
      line3(boundaries, [[x, .18, -1.1], [x, .18, 1.1]], 0xbba06c, .6, 'insulation');
      bevelBox(boundaries, .46, .34, .38, x + (x < 0 ? -.45 : .45), .16, 1.25, material(0x334654, .45, .45), 'insulation', .02);
      cylinder(boundaries, .06, .22, x + (x < 0 ? -.45 : .45), .06, 1.02, material(C.amber, .3, .5), 'insulation', 'y', 16);
    }
    const train = buildTrainMesh(root, 1);
    line3(root, [[-16, 1.83, 0], [16, 1.83, 0]], 0x8496a7, .70, 'catenary');
    catenarySupports(root, -14, 14, 0, 1.83);
    const sections = [];
    for (const z of [-.53, .53]) sections.push(box(root, 8.8, .028, .12, 0, .158, z, new T.MeshBasicMaterial({ color: C.green }), 'rail'));
    return {
      root, train,
      set(front, clear, state = {}) {
        train.setOperatingState({ pantograph: state.pantograph !== false, power: state.catenaryPower !== false, direction: 1, pantographPosition: state.pantographPosition, distance: front * .088 });
        train.position.x = -4.4 + 8.8 * front / 100;
        sections.forEach(m => m.material.color.setHex(clear ? C.green : C.red));
      },
      dispose() {
        const gs = new Set(), ms = new Set(), maps = new Set();
        root.traverse(o => {
          if (o.geometry) gs.add(o.geometry);
          if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { ms.add(m); if (m.map) maps.add(m.map); });
        });
        gs.forEach(g => g.dispose()); maps.forEach(t => t.dispose()); ms.forEach(m => m.dispose());
      }
    };
  }

  // 第 2.3 节 精美信号机建模：严格依据教材表 2.3.1 与 PDF p.26「信号机机构与灯光配置」
  const SIGNAL_LAMP_COLORS = {
    H: 0xf43648,  // 红灯
    U: 0xffba1a,  // 黄灯
    L: 0x1ee68a,  // 绿灯
    B: 0xe6f2ff,  // 月白灯
    A: 0x2f7dff   // 蓝灯
  };
  const SIGNAL_CONFIGS = {
    inStation: {
      plate: 'X',
      variants: {
        a: { tall: true, heads: [
          { items: [['U1', 'U'], ['L', 'L']], cx: 0, topY: 4.90, spacing: .48 },
          { items: [['H', 'H'], ['U2', 'U']], cx: 0, topY: 3.74, spacing: .48 },
          { items: [['B', 'B']], cx: 0, topY: 2.74, spacing: .48, single: true }
        ] },
        b: { tall: false, heads: [
          { items: [['U1', 'U'], ['L', 'L'], ['E1', 'EMPTY'], ['U2', 'U']], cx: -.34, topY: 2.38, spacing: .45 },
          { items: [['H', 'H'], ['E2', 'EMPTY'], ['B', 'B']], cx: .34, topY: 1.93, spacing: .45 }
        ] },
        c: { tall: true, dwarfMast: true, heads: [
          { items: [['U1', 'U'], ['L', 'L'], ['H', 'H'], ['U2', 'U'], ['B', 'B']], cx: 0, topY: 3.10, spacing: .44 }
        ] }
      }
    },
    distant: {
      plate: 'YX',
      variants: {
        a: { tall: true, heads: [{ items: [['L', 'L'], ['U', 'U']], cx: 0, topY: 4.35, spacing: .50 }] },
        b: { tall: false, heads: [{ items: [['L', 'L'], ['U', 'U']], cx: 0, topY: 1.48, spacing: .46 }] }
      }
    },
    depFour: {
      plate: 'SⅠ',
      hasIndicator: true,
      variants: {
        a: { tall: true, heads: [
          { items: [['L1', 'L'], ['H', 'H'], ['U', 'U']], cx: 0, topY: 4.82, spacing: .47 },
          { items: [['L2', 'L'], ['B', 'B']], cx: 0, topY: 3.24, spacing: .47 }
        ] },
        b: { tall: false, heads: [
          { items: [['L1', 'L'], ['E1', 'EMPTY'], ['L2', 'L'], ['U', 'U']], cx: -.34, topY: 2.38, spacing: .45 },
          { items: [['B', 'B'], ['H', 'H']], cx: .34, topY: 1.48, spacing: .45 }
        ] }
      }
    },
    depThree: {
      plate: 'SⅡ',
      hasIndicator: true,
      variants: {
        a: { tall: true, heads: [
          { items: [['L', 'L'], ['H', 'H']], cx: 0, topY: 4.72, spacing: .48 },
          { items: [['U', 'U'], ['B', 'B']], cx: 0, topY: 3.55, spacing: .48 }
        ] },
        b: { tall: false, heads: [
          { items: [['L', 'L'], ['E1', 'EMPTY'], ['U', 'U']], cx: -.34, topY: 1.95, spacing: .46 },
          { items: [['B', 'B'], ['H', 'H']], cx: .34, topY: 1.49, spacing: .46 }
        ] }
      }
    },
    depSemi: {
      plate: 'S₁',
      variants: {
        a: { tall: true, heads: [{ items: [['L', 'L'], ['H', 'H']], cx: 0, topY: 4.35, spacing: .50 }] },
        b: { tall: false, heads: [{ items: [['L', 'L'], ['H', 'H']], cx: 0, topY: 1.48, spacing: .46 }] }
      }
    },
    shuntSig: {
      plate: 'D₁',
      variants: {
        a: { tall: true, heads: [{ items: [['B', 'B'], ['A', 'A']], cx: 0, topY: 4.25, spacing: .50 }] },
        b: { tall: false, heads: [{ items: [['B', 'B'], ['A', 'A']], cx: 0, topY: 1.38, spacing: .45 }] }
      }
    }
  };

  function makeStadiumShape(w, h) {
    const r = w / 2;
    const straight = Math.max(0, h - w);
    const hy = straight / 2;
    const s = new T.Shape();
    if (straight <= 1e-4) {
      s.absarc(0, 0, r, 0, Math.PI * 2, false);
    } else {
      s.moveTo(-r, -hy);
      s.lineTo(-r, hy);
      s.absarc(0, hy, r, Math.PI, 0, true);
      s.lineTo(r, -hy);
      s.absarc(0, -hy, r, 0, Math.PI, true);
    }
    return s;
  }

  function makeSignalPlateMat(code) {
    if (typeof document === 'undefined') return material(C.silver, .15, .5);
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 144;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f2f6fa';
    ctx.fillRect(0, 0, 256, 144);
    ctx.strokeStyle = '#151f28';
    ctx.lineWidth = 12;
    ctx.strokeRect(8, 8, 240, 128);
    ctx.fillStyle = '#111922';
    ctx.font = '800 72px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(code, 128, 76);
    const tex = new T.CanvasTexture(canvas);
    tex.colorSpace = T.SRGBColorSpace;
    return new T.MeshStandardMaterial({ map: tex, metalness: .18, roughness: .42 });
  }

  function makeIndicatorMat(lit) {
    if (typeof document === 'undefined') return material(lit ? C.silver : C.dark, .2, .4);
    const canvas = document.createElement('canvas');
    canvas.width = 220; canvas.height = 140;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = lit ? '#13241e' : '#0f161f';
    ctx.fillRect(0, 0, 220, 140);
    ctx.strokeStyle = lit ? '#7de0bd' : '#35485a';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 212, 132);
    ctx.fillStyle = lit ? '#f0f8ff' : '#2f3f4e';
    ctx.font = '800 62px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('右 →', 110, 72);
    const tex = new T.CanvasTexture(canvas);
    tex.colorSpace = T.SRGBColorSpace;
    return new T.MeshStandardMaterial({
      map: tex, metalness: .15, roughness: .35,
      emissive: new T.Color(lit ? 0x6ec9aa : 0x000000),
      emissiveMap: lit ? tex : null,
      emissiveIntensity: lit ? .85 : 0
    });
  }

  function buildSignalAssembly({ signalType = 'inStation', variant = 'a', plateText, detailed = true, labelList = null }) {
    const root = new T.Group();
    const cfg = SIGNAL_CONFIGS[signalType] || SIGNAL_CONFIGS.inStation;
    const vKey = cfg.variants[variant] ? variant : Object.keys(cfg.variants)[0];
    const vSpec = cfg.variants[vKey];
    const isTall = !!vSpec.tall;
    const isDwarf = !isTall;

    const grpFoundation = new T.Group();
    const grpMast = new T.Group();
    const grpTransformer = new T.Group();
    const grpLadder = new T.Group();
    const grpShield = new T.Group();
    const grpOptics = new T.Group();
    const grpFrontLens = new T.Group();
    root.add(grpFoundation, grpMast, grpTransformer, grpLadder, grpShield, grpOptics, grpFrontLens);

    const mats = {
      concrete: material(0x6c7884, .08, .85),
      mast: material(0x9fb0be, .74, .28),
      clamp: material(0x283644, .58, .38),
      shieldFace: material(0x11171f, .16, .68),
      shieldRim: material(0xdfe8ef, .22, .45),
      housing: material(0x23313d, .55, .34),
      visor: material(0x161f28, .25, .62),
      chrome: material(0xeef5fa, .92, .12),
      brass: material(C.brass, .84, .22),
      dark: material(C.dark, .35, .42),
      iron: material(C.iron, .75, .28),
      bulbGlass: new T.MeshStandardMaterial({ color: 0xe6f3ff, metalness: .1, roughness: .12, transparent: true, opacity: .44 })
    };
    mats.visor.side = T.DoubleSide;

    // 1. 双层倒角混凝土基础、法兰盘与 6 颗黄铜锚栓（含不锈钢垫片与接地螺栓）
    const plinthW = isDwarf ? 1.12 : .88;
    const plinthH = isDwarf ? .38 : .44;
    mesh(grpFoundation, new T.CylinderGeometry(plinthW * .44, plinthW * .56, plinthH * .76, 8), mats.concrete, 0, plinthH * .38, -.12, 'foundation');
    mesh(grpFoundation, new T.CylinderGeometry(plinthW * .38, plinthW * .44, plinthH * .24, 8), mats.concrete, 0, plinthH * .88, -.12, 'foundation');
    cylinder(grpFoundation, isDwarf ? .33 : .25, .052, 0, plinthH + .026, -.12, mats.clamp, 'foundation', 'y', 24);
    if (detailed) {
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        const rBolt = isDwarf ? .24 : .185;
        cylinder(grpFoundation, .048, .012, Math.cos(a) * rBolt, plinthH + .054, -.12 + Math.sin(a) * rBolt, mats.chrome, 'foundation', 'y', 14);
        hexNut(grpFoundation, .034, .046, Math.cos(a) * rBolt, plinthH + .072, -.12 + Math.sin(a) * rBolt, mats.brass, 'foundation', 'y');
      }
      // 接地扁铁与黄铜接地端子
      bevelBox(grpFoundation, .08, .12, .03, plinthW * .42, .12, -.12, mats.iron, 'foundation', .005);
      hexNut(grpFoundation, .024, .032, plinthW * .44, .13, -.10, mats.brass, 'foundation', 'z');
    }

    // 2. 机柱/底座与铭牌
    const maxHeadTop = Math.max(...vSpec.heads.map(h => h.topY));
    const minHeadBot = Math.min(...vSpec.heads.map(h => h.topY - (h.items.length - 1) * h.spacing));
    if (isTall) {
      const mastTop = maxHeadTop + .28;
      const mastLen = mastTop - .48;
      cylinder(grpMast, .084, mastLen, 0, .48 + mastLen / 2, -.12, mats.mast, 'mast', 'y', detailed ? 24 : 12);
      cylinder(grpMast, .105, .06, 0, mastTop + .02, -.12, mats.clamp, 'mast', 'y', 16);
      // 柱脚警示环（黑白警示涂装段）
      if (detailed) {
        cylinder(grpMast, .089, .24, 0, .74, -.12, mats.shieldFace, 'mast', 'y', 20);
        cylinder(grpMast, .090, .14, 0, .94, -.12, mats.shieldRim, 'mast', 'y', 20);
        cylinder(grpMast, .089, .20, 0, 1.12, -.12, mats.shieldFace, 'mast', 'y', 20);
      }
      // 机构背抱箍（停在 z <= -0.035 以免在拆解时与 shield 相交）
      for (const h of vSpec.heads) {
        const midY = h.topY - ((h.items.length - 1) * h.spacing) / 2;
        cylinder(grpMast, .108, .12, 0, midY, -.12, mats.clamp, 'mast', 'y', 16);
        box(grpMast, .12, .08, .08, 0, midY, -.075, mats.clamp, 'mast');
      }
    } else {
      // 矮型柱台：按列立柱
      for (const h of vSpec.heads) {
        const botY = h.topY - (h.items.length - 1) * h.spacing - .18;
        const postH = Math.max(.26, botY - .48);
        cylinder(grpMast, .068, postH, h.cx, .48 + postH / 2, -.12, mats.clamp, 'mast', 'y', detailed ? 16 : 10);
      }
      bevelBox(grpMast, .94, .08, .32, 0, .50, -.12, mats.clamp, 'mast', .015);
    }

    // 清晰信号机号牌
    const plateName = plateText || cfg.plate;
    const plateY = isTall ? Math.max(1.38, minHeadBot - .78) : .64;
    const plateZ = -.025;
    bevelBox(grpMast, .34, .19, .022, isTall ? 0 : .42, plateY, plateZ, mats.clamp, 'plate', .006);
    mesh(grpMast, new T.PlaneGeometry(.31, .165), makeSignalPlateMat(plateName), isTall ? 0 : .42, plateY, plateZ + .013, 'plate');

    // 3. 变压器与灯丝转换盒 XB + 铸铁加强筋 + 印字箱门 + 铠装引入电缆管
    if (detailed) {
      bevelBox(grpTransformer, .46, .56, .34, -.64, .74, -.12, mats.housing, 'transformer', .022);
      bevelBox(grpTransformer, .39, .46, .048, -.64, .74, .062, mats.dark, 'transformer', .01);
      mesh(grpTransformer, new T.PlaneGeometry(.24, .13), makeSignalPlateMat('XB'), -.64, .82, .089, 'transformer');
      for (const hy of [.58, .90]) cylinder(grpTransformer, .016, .06, -.85, hy, .055, mats.iron, 'transformer', 'y', 10);
      for (const ry of [.58, .74, .90]) box(grpTransformer, .48, .018, .28, -.64, ry, -.12, mats.clamp, 'transformer');
      cylinder(grpTransformer, .038, .28, -.64, .34, -.12, mats.iron, 'transformer', 'y', 14);
      cylinder(grpTransformer, .058, .04, -.64, .45, -.12, mats.brass, 'transformer', 'y', 14);
      wireTube(grpTransformer, [[-.42, .82, -.12], [-.35, .80, -.12], [-.35, .56, -.12]], .024, mats.iron, 'transformer');
      box(grpTransformer, .048, .10, .058, -.43, .74, .045, mats.brass, 'transformer');
    }

    // 4. 背面检修爬梯与顶部防坠围栏
    if (isTall && detailed) {
      const ladTop = maxHeadTop + .24;
      const ladLen = ladTop - .48;
      for (const lx of [-.14, .14]) {
        cylinder(grpLadder, .016, ladLen, lx, .48 + ladLen / 2, -.38, mats.iron, 'ladder', 'y', 10);
      }
      for (let ry = .70; ry <= ladTop - .05; ry += .34) {
        cylinder(grpLadder, .011, .28, 0, ry, -.38, mats.mast, 'ladder', 'x', 8);
      }
      // 顶部检修护圈弧架与小踏板
      const hoop = mesh(grpLadder, new T.TorusGeometry(.22, .015, 8, 20, Math.PI * 1.15), mats.iron, 0, ladTop - .35, -.42, 'ladder');
      hoop.rotation.x = Math.PI / 2;
      hoop.rotation.z = Math.PI * .92;
      bevelBox(grpLadder, .38, .035, .22, 0, ladTop - .65, -.45, mats.dark, 'ladder', .008);
    }

    // 5. 各组信号机构（椭圆防眩背板 + 铸铝箱体 + 遮檐 + 菲涅尔透镜 + 抛物面反射杯 + H1/H2 双灯丝灯泡）
    const lampRefs = {};
    const stepProfile = detailed ? [
      new T.Vector2(.001, .022), new T.Vector2(.045, .020), new T.Vector2(.045, .010),
      new T.Vector2(.092, .016), new T.Vector2(.092, .006),
      new T.Vector2(.136, .011), new T.Vector2(.136, .003),
      new T.Vector2(.172, .005), new T.Vector2(.172, -.004), new T.Vector2(0, -.004)
    ] : null;
    const fresnelGeo = stepProfile ? new T.LatheGeometry(stepProfile, 24).rotateX(Math.PI / 2) : null;
    const cupGeo = detailed ? new T.LatheGeometry([
      new T.Vector2(.022, -.07), new T.Vector2(.085, -.04), new T.Vector2(.145, .02), new T.Vector2(.172, .09), new T.Vector2(.178, .09),
      new T.Vector2(.152, .015), new T.Vector2(.090, -.048), new T.Vector2(.022, -.078)
    ], 22).rotateX(Math.PI / 2) : null;

    for (const h of vSpec.heads) {
      const n = h.items.length;
      const headH = h.single ? .56 : (n - 1) * h.spacing + .56;
      const midY = h.topY - ((n - 1) * h.spacing) / 2;
      const shieldW = h.single ? .58 : .68;
      const boxW = h.single ? .44 : .50;

      // 背板与白色反光镶边
      const rimGeo = new T.ExtrudeGeometry(makeStadiumShape(shieldW + .055, headH + .055), { depth: .016, bevelEnabled: true, bevelThickness: .004, bevelSize: .004, bevelSegments: 1, curveSegments: 14 });
      mesh(grpShield, rimGeo, mats.shieldRim, h.cx, midY, .02, 'shield');
      const shGeo = new T.ExtrudeGeometry(makeStadiumShape(shieldW, headH), { depth: .020, bevelEnabled: true, bevelThickness: .004, bevelSize: .004, bevelSegments: 1, curveSegments: 14 });
      mesh(grpShield, shGeo, mats.shieldFace, h.cx, midY, .034, 'shield');

      // 铸铝机构箱体（沿 -Z 至 +0.02 之间，拆解时整体随 grpShield 前移）
      const houseGeo = new T.ExtrudeGeometry(makeStadiumShape(boxW, headH - .10), { depth: .18, bevelEnabled: true, bevelThickness: .012, bevelSize: .012, bevelSegments: 2, curveSegments: 12 });
      mesh(grpShield, houseGeo, mats.housing, h.cx, midY, -.16, 'housing');
      if (detailed) {
        for (let ri = 0; ri < n - 1; ri++) {
          const ribY = h.topY - (ri + .5) * h.spacing;
          bevelBox(grpShield, boxW + .03, .028, .18, h.cx, ribY, -.07, mats.clamp, 'housing', .005);
        }
      }

      // 逐位灯光光学模组
      h.items.forEach(([id, colorKey], idx) => {
        const ly = h.topY - idx * h.spacing;
        if (colorKey === 'EMPTY') {
          // 教材 ⊗ 空位封堵盲板
          cylinder(grpFrontLens, .178, .035, h.cx, ly, .072, mats.clamp, 'housing', 'z', 20);
          mesh(grpFrontLens, new T.TorusGeometry(.165, .014, 8, 22), mats.iron, h.cx, ly, .092, 'housing');
          for (const ang of [Math.PI / 4, -Math.PI / 4]) {
            const bar = box(grpFrontLens, .28, .024, .016, h.cx, ly, .095, mats.shieldRim, 'housing');
            bar.rotation.z = ang;
          }
          return;
        }
        const hex = SIGNAL_LAMP_COLORS[colorKey] || 0xffffff;
        // 抛物面反射杯与双灯丝灯泡（在 grpOptics）
        if (cupGeo) mesh(grpOptics, cupGeo, mats.chrome, h.cx, ly, .14, 'optics');
        else cylinder(grpOptics, .15, .06, h.cx, ly, .12, mats.chrome, 'optics', 'z', 14);

        const h1Mat = new T.MeshStandardMaterial({ color: 0xb88f4c, emissive: 0x000000, emissiveIntensity: 0, metalness: .6, roughness: .3 });
        const h2Mat = new T.MeshStandardMaterial({ color: 0x997944, emissive: 0x000000, emissiveIntensity: 0, metalness: .6, roughness: .3 });
        if (detailed) {
          cylinder(grpOptics, .032, .06, h.cx, ly, .10, mats.brass, 'filament', 'z', 12);
          mesh(grpOptics, new T.TorusGeometry(.026, .0065, 8, 18), h1Mat, h.cx, ly + .016, .165, 'filament');
          mesh(grpOptics, new T.TorusGeometry(.022, .0055, 8, 18), h2Mat, h.cx, ly - .018, .158, 'filament');
          mesh(grpOptics, new T.SphereGeometry(.068, 16, 12), mats.bulbGlass, h.cx, ly, .155, 'filament');
        }

        // 前组：有色内透片 + 外阶梯菲涅尔玻璃 + 固定压圈 + 斜切遮檐（在 grpFrontLens）
        const lensMat = new T.MeshStandardMaterial({
          color: hex, emissive: hex, emissiveIntensity: .06,
          metalness: .12, roughness: .18, transparent: true, opacity: .88
        });
        mesh(grpFrontLens, new T.SphereGeometry(.145, detailed ? 20 : 12, detailed ? 14 : 10).scale(1, 1, .28), lensMat, h.cx, ly, .195, 'lens');

        if (fresnelGeo) {
          const glassMat = new T.MeshStandardMaterial({
            color: hex, emissive: hex, emissiveIntensity: .03,
            metalness: .08, roughness: .10, transparent: true, opacity: .52
          });
          mesh(grpFrontLens, fresnelGeo, glassMat, h.cx, ly, .235, 'lens');
        }
        mesh(grpFrontLens, new T.TorusGeometry(.178, .016, detailed ? 10 : 6, detailed ? 28 : 16), mats.clamp, h.cx, ly, .240, 'lens');
        if (detailed) {
          for (let bi = 0; bi < 4; bi++) {
            const ba = bi * Math.PI / 2 + Math.PI / 4;
            cylinder(grpFrontLens, .010, .022, h.cx + Math.cos(ba) * .178, ly + Math.sin(ba) * .178, .250, mats.chrome, 'lens', 'z', 8);
          }
        }

        // 遮檐：上沿前伸下斜屏蔽强光
        const hoodLen = detailed ? .32 : .24;
        const hood = mesh(
          grpFrontLens,
          new T.CylinderGeometry(.188, .196, hoodLen, detailed ? 22 : 12, 1, true, -Math.PI * .62, Math.PI * 1.24),
          mats.visor, h.cx, ly + .012, .24 + hoodLen / 2, 'hood'
        );
        hood.rotation.x = Math.PI / 2 + .12;

        lampRefs[id] = { hex, lensMat, h1Mat, h2Mat };
      });
    }

    // 6. 进路/方向表示器盒（仅出站多方向机型）
    let indMesh = null;
    if (cfg.hasIndicator) {
      const indY = isTall ? 2.45 : .78;
      const indX = isTall ? 0 : -.42;
      bevelBox(grpShield, .42, .26, .16, indX, indY, -.02, mats.housing, 'indicator', .014);
      indMesh = mesh(grpShield, new T.PlaneGeometry(.36, .20), makeIndicatorMat(false), indX, indY, .064, 'indicator');
    }

    // 标注解说文字（仅高清展示时挂载，锚点外移至左右两侧留白区并精简文案，避免遮挡信号机透镜与机柱）
    if (labelList) {
      const topY = maxHeadTop + .24;
      label(grpShield, `${plateName} 背板`, [isTall ? 1.95 : 1.75, topY + .06, .10], [.18, topY - .32, .04], labelList);
      label(grpFrontLens, '遮檐·菲涅尔镜', [isTall ? 2.05 : 1.85, topY - .72, .35], [.18, maxHeadTop - (vSpec.heads[0].items.length > 1 ? .48 : 0), .30], labelList);
      if (detailed) {
        label(grpOptics, '反光镜·H₁/H₂丝', [-2.05, topY - .10, .20], [-.16, maxHeadTop, .16], labelList);
        label(grpTransformer, 'XB丝箱·电缆', [-2.05, .92, .12], [-.64, .74, 0], labelList);
        label(grpFoundation, '基础·螺栓', [1.95, .24, .18], [.22, .28, -.08], labelList);
        if (isTall) label(grpLadder, '爬梯·护圈', [-2.05, 2.25, -.38], [-.14, 2.35, -.38], labelList);
        if (cfg.hasIndicator) label(grpShield, '方向表示器(右)', [2.05, isTall ? 2.35 : .82, .12], [isTall ? .18 : -.42, isTall ? 2.45 : .78, .06], labelList);
      }
    }

    function applyState({ lit = [], flash = [], filament = 'main', indicator = '', time = 0 } = {}) {
      const blink = Math.floor(time * 2.2) % 2 === 0;
      for (const [id, ref] of Object.entries(lampRefs)) {
        const active = lit.includes(id) && (!flash.includes(id) || blink);
        ref.lensMat.emissiveIntensity = active ? 1.75 : .04;
        ref.lensMat.opacity = active ? .96 : .64;
        ref.h1Mat.emissive.setHex(active && filament === 'main' ? 0xfff0c8 : 0x000000);
        ref.h1Mat.emissiveIntensity = active && filament === 'main' ? 2.8 : 0;
        ref.h2Mat.emissive.setHex(active && filament === 'backup' ? 0xfff0c8 : 0x000000);
        ref.h2Mat.emissiveIntensity = active && filament === 'backup' ? 2.8 : 0;
      }
      if (indMesh) {
        const wantLit = indicator === 'right';
        if (indMesh.userData._indLit !== wantLit) {
          indMesh.userData._indLit = wantLit;
          if (indMesh.material.map) indMesh.material.map.dispose();
          indMesh.material.dispose();
          indMesh.material = makeIndicatorMat(wantLit);
        }
      }
    }

    return {
      root,
      subGroups: {
        foundation: grpFoundation,
        mast: grpMast,
        transformer: grpTransformer,
        ladder: grpLadder,
        shield: grpShield,
        optics: grpOptics,
        front: grpFrontLens
      },
      lampRefs,
      isTall,
      variant: vKey,
      setExplode(e) {
        // 底座基础稳固保持于地面之上，机柱与上部各光学/电路模组向上与前后优雅展开，100% 拆解绝不穿入地平面且全部落在视口内！
        const liftY = isDwarf ? .64 : .92;
        const zScale = isDwarf ? .72 : 1.0;
        grpFoundation.position.set(0, 0, 0);
        grpMast.position.set(0, liftY * e, 0);
        grpTransformer.position.set(-1.18 * e, .44 * e, 0);
        grpLadder.position.set(0, liftY * e, -1.65 * zScale * e);
        grpShield.position.set(0, liftY * e, 1.15 * zScale * e);
        grpOptics.position.set(0, liftY * e, 2.15 * zScale * e);
        grpFrontLens.position.set(0, liftY * e, 3.25 * zScale * e);
      },
      applyState,
      dispose() {
        const gs = new Set(), ms = new Set(), maps = new Set();
        root.traverse(o => {
          if (o.geometry) gs.add(o.geometry);
          if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { ms.add(m); if (m.map) maps.add(m.map); });
        });
        gs.forEach(g => g.dispose()); maps.forEach(t => t.dispose()); ms.forEach(m => m.dispose());
      }
    };
  }

  function createSignal(signalType = 'inStation', variant = 'a') {
    const rootGroup = new T.Group();
    rootGroup.name = `signal-${signalType}-${variant}`;
    const labelList = [];
    const asm = buildSignalAssembly({ signalType, variant, detailed: true, labelList });
    rootGroup.add(asm.root);
    // 底座基础严格位于地平面 (y = -0.25) 上方（min.y = -0.24），使基础、锚栓、XB 丝箱与引入电缆完整展示，标注引线 100% 精准对位
    asm.root.position.set(0, -.18, 0);

    // 轻微的轨面基底参考条（放在 foundation 子组内以保证拆解零穿模）
    box(asm.subGroups.foundation, 2.8, .06, 1.8, 0, -.03, -.12, material(0x131d28, .12, .85), 'foundation');

    const S = root.RelaySources;
    const spec = S && S.signalModels && S.signalModels[signalType];
    if (spec) {
      rootGroup.userData.model = spec.model;
      rootGroup.userData.contacts = spec.contacts;
      rootGroup.userData.referencePDFPages = spec.pages;
      rootGroup.userData.geometryBoundary = spec.geometry;
    }

    return {
      root: rootGroup,
      type: signalType,
      variant: asm.variant,
      physical: true,
      isSignal: true,
      subGroups: asm.subGroups,
      setView(s) {
        const e = (s.explode || 0) / 100;
        asm.setExplode(e);
        labelList.forEach(l => { l.visible = !!s.labels; });
      },
      pose(p, r, s, time) {
        const sig = r && r.signal;
        if (!sig) return;
        asm.applyState({ lit: sig.lit, flash: sig.flash, filament: sig.filament, indicator: sig.indicator, time: time || 0 });
      },
      dispose() { asm.dispose(); }
    };
  }

  function createStation() {
    const rootGroup = new T.Group();
    rootGroup.name = 'station-interlocking-sandbox';
    const labelList = [];
    const mats = {
      rail: material(C.steel, .85, .22),
      sleeper: material(0x364752, .20, .65),
      ballast: material(0x18232e, .12, .85),
      rack: material(0x1b2936, .45, .42),
      dark: material(C.dark, .35, .38),
      bakelite: material(C.bakelite, .25, .38),
      brass: material(C.brass, .82, .22),
      iron: material(C.iron, .80, .25),
      copper: material(C.copper, .80, .25),
      platform: material(0x2d3f4d, .25, .55)
    };

    // 图 3.1.1 扩大版全站四股道坐标（63 单位全流程站场：5.6 单位加长 1/7G 绝缘隔离段 + 10.6 单位中间股道，完整容纳双列 3 节复兴号）
    const Z3 = -2.16, Z1 = -.72, Z2 = .72, Z4 = 2.16;
    const yard = new T.Group(); rootGroup.add(yard);
    bevelBox(yard, 63.2, .12, 6.6, .2, -.07, 0, mats.ballast, 'rail', .03);

    // 4 股道混凝土枕木与直股工字钢轨（下行接近段 + 下行咽喉 + 10.6 单位中间股道 + 上行咽喉，全长覆盖 [-31.0, +31.0]）
    for (let i = -94; i <= 94; i++) {
      const x = i * .33;
      bevelBox(yard, .14, .08, 1.12, x, 0, Z1, mats.sleeper, 'rail', .01);
      bevelBox(yard, .14, .08, 1.12, x, 0, Z2, mats.sleeper, 'rail', .01);
      if (x >= 3.8 && x <= 15.2) bevelBox(yard, .14, .08, 1.12, x, 0, Z3, mats.sleeper, 'rail', .01);
      if (x >= 3.8 && x <= 15.2) bevelBox(yard, .14, .08, 1.12, x, 0, Z4, mats.sleeper, 'rail', .01);
    }
    for (const zc of [Z1, Z2]) for (const dz of [-.37, .37]) buildIRail(yard, 62.2, .2, .01, zc + dz, mats.rail);
    for (const dz of [-.37, .37]) {
      buildIRail(yard, 11.2, 9.5, .01, Z3 + dz, mats.rail);
      buildIRail(yard, 11.2, 9.5, .01, Z4 + dz, mats.rail);
    }

    // 真实铁路道岔几何方程：两端缓和导曲线(22%) + 中部直线辙叉段(56%)，告别扭曲 S 弯，弯轨与列车中心线 100% 严格重合
    const TURNOUT_E = .22;
    function turnoutEase(u) {
      const e = TURNOUT_E;
      if (u <= 0) return 0;
      if (u >= 1) return 1;
      if (u < e) return (u * u) / (2 * e * (1 - e));
      if (u <= 1 - e) return (u - e / 2) / (1 - e);
      const v = 1 - u;
      return 1 - (v * v) / (2 * e * (1 - e));
    }
    function turnoutEaseDeriv(u) {
      const e = TURNOUT_E;
      if (u <= 0 || u >= 1) return 0;
      if (u < e) return u / (e * (1 - e));
      if (u <= 1 - e) return 1 / (1 - e);
      return (1 - u) / (e * (1 - e));
    }
    function sampleTurnout(x0, z0, x1, z1, u) {
      const dxTotal = x1 - x0, dzTotal = z1 - z0;
      const cx = x0 + dxTotal * u;
      const cz = z0 + dzTotal * turnoutEase(u);
      const tx = dxTotal, tz = dzTotal * turnoutEaseDeriv(u);
      const tl = Math.hypot(tx, tz) || 1;
      return { cx, cz, tx, tz, nx: -tz / tl, nz: tx / tl };
    }

    // 实体 3D 弯道道岔与渡线建造器（双条 3D 金属钢轨 + 岔枕 + 精准交点辙叉心 + 渡线绝缘节 + 分段发光光带）
    function buildCurvedRailRibbon(parent, x0, z0, x1, z1, railOffset, yBot, yTop, halfThick, mat, part, segs = 24, uStart = 0, uEnd = 1) {
      const verts = [], idx = [];
      for (let i = 0; i <= segs; i++) {
        const u = uStart + (uEnd - uStart) * (i / segs);
        const pt = sampleTurnout(x0, z0, x1, z1, u);
        const rx = pt.cx + pt.nx * railOffset, rz = pt.cz + pt.nz * railOffset;
        verts.push(
          rx - pt.nx * halfThick, yBot, rz - pt.nz * halfThick,
          rx + pt.nx * halfThick, yBot, rz + pt.nz * halfThick,
          rx + pt.nx * halfThick, yTop, rz + pt.nz * halfThick,
          rx - pt.nx * halfThick, yTop, rz - pt.nz * halfThick
        );
      }
      for (let i = 0; i < segs; i++) {
        const a = i * 4, b = (i + 1) * 4;
        idx.push(a + 3, a + 2, b + 2, a + 3, b + 2, b + 3);
        idx.push(a + 0, a + 3, b + 3, a + 0, b + 3, b + 0);
        idx.push(a + 2, a + 1, b + 1, a + 2, b + 1, b + 2);
      }
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(verts, 3));
      geo.setIndex(idx); geo.computeVertexNormals();
      return mesh(parent, geo, mat, 0, 0, 0, part);
    }
    function buildCurvedTurnout3D(x0, z0, x1, z1, lightMatA, lightMatB = null, withMidJoint = false) {
      const sgn = Math.sign(z1 - z0) || 1;
      // 1) 沿真实导曲线+直线辙叉布置斜向岔枕（首尾两端留出与直股衔接空间）
      const sleeperCount = 13;
      for (let i = 2; i <= sleeperCount - 2; i++) {
        const u = i / sleeperCount;
        const pt = sampleTurnout(x0, z0, x1, z1, u);
        const sl = bevelBox(yard, .14, .072, 1.06, pt.cx, -.002, pt.cz, mats.sleeper, 'rail', .01);
        sl.rotation.y = -Math.atan2(pt.tz, pt.tx);
      }
      // 2) 左右两条实体 3D 金属钢轨（真实高度 0.015..0.138 与直股工字钢轨齐平无缝衔接）
      for (const ro of [-.37, .37]) {
        buildCurvedRailRibbon(yard, x0, z0, x1, z1, ro, .015, .138, .045, mats.rail, 'switchMachine', 26, 0, 1);
      }
      // 3) 精准求解弯轨与直股内轨的真实交点，放置铸钢辙叉心（辙叉心绝不悬空在道床中心！）
      const solveRailCrossing = (railOffset, targetZ) => {
        let lo = .08, hi = .92;
        const fAt = u => { const p = sampleTurnout(x0, z0, x1, z1, u); return (p.cz + p.nz * railOffset) - targetZ; };
        const fLo = fAt(lo);
        for (let k = 0; k < 22; k++) {
          const mid = (lo + hi) * .5;
          if ((fAt(mid) > 0) === (fLo > 0)) lo = mid; else hi = mid;
        }
        return (lo + hi) * .5;
      };
      for (const [ro, tzRail] of [[-.37 * sgn, z0 + .37 * sgn], [.37 * sgn, z1 - .37 * sgn]]) {
        const uCross = solveRailCrossing(ro, tzRail);
        const pt = sampleTurnout(x0, z0, x1, z1, uCross);
        const fx = pt.cx + pt.nx * ro, fz = pt.cz + pt.nz * ro;
        const frog = bevelBox(yard, .34, .068, .12, fx, .082, fz, mats.iron, 'switchMachine', .01);
        frog.rotation.y = -Math.atan2(pt.tz, pt.tx) * .5;
      }
      // 4) 若为双动渡线（1/3、5/7），在曲线中点加装教材图 2.5.1 渡线绝缘节标记
      if (withMidJoint) {
        const mp = sampleTurnout(x0, z0, x1, z1, .5);
        for (const ro of [-.37, .37]) {
          const jb = bevelBox(yard, .09, .14, .13, mp.cx + mp.nx * ro, .09, mp.cz + mp.nz * ro, mats.copper, 'insulation', .01);
          jb.rotation.y = -Math.atan2(mp.tz, mp.tx);
        }
      }
      // 5) 实体 3D 弯道发光带（定位时隐藏露出真实金属钢轨，反位时按所属区段亮白/红/琥珀；双动渡线分上下半段独立受控！）
      const stripsA = [], stripsB = [];
      if (lightMatA && lightMatB) {
        for (const ro of [-.37, .37]) {
          const mA = buildCurvedRailRibbon(yard, x0, z0, x1, z1, ro, .146, .166, .048, lightMatA, 'switchMachine', 14, 0, .49);
          const mB = buildCurvedRailRibbon(yard, x0, z0, x1, z1, ro, .146, .166, .048, lightMatB, 'switchMachine', 14, .51, 1);
          mA.visible = false; mB.visible = false;
          stripsA.push(mA); stripsB.push(mB);
        }
      } else if (lightMatA) {
        for (const ro of [-.37, .37]) {
          const mA = buildCurvedRailRibbon(yard, x0, z0, x1, z1, ro, .146, .166, .048, lightMatA, 'switchMachine', 24, 0, 1);
          mA.visible = false;
          stripsA.push(mA);
        }
      }
      return { stripsA, stripsB };
    }

    const crossMats = {
      c1_3a: new T.MeshBasicMaterial({ color: C.white }),
      c1_3b: new T.MeshBasicMaterial({ color: C.white }),
      c5_7a: new T.MeshBasicMaterial({ color: C.white }),
      c5_7b: new T.MeshBasicMaterial({ color: C.white }),
      c9: new T.MeshBasicMaterial({ color: C.white }),
      c11: new T.MeshBasicMaterial({ color: C.white })
    };
    const crossMeshes = {
      c1_3: buildCurvedTurnout3D(-15.6, Z1, -10.2, Z2, crossMats.c1_3a, crossMats.c1_3b, true),
      c5_7: buildCurvedTurnout3D(-6.6, Z2, -1.4, Z1, crossMats.c5_7a, crossMats.c5_7b, true),
      c9: buildCurvedTurnout3D(-.8, Z2, 4.0, Z4, crossMats.c9, null, false),
      c11: buildCurvedTurnout3D(-.8, Z1, 4.0, Z3, crossMats.c11, null, false)
    };
    // 上行咽喉严格按教材图 3.1.1 布置实体 3D 弯道道岔（10、12、8/6、4/2 彼此分离无交叉重叠）
    buildCurvedTurnout3D(15.0, Z3, 19.4, Z1, null);
    buildCurvedTurnout3D(15.0, Z4, 19.4, Z2, null);
    buildCurvedTurnout3D(19.8, Z2, 24.2, Z1, null, null, true);
    buildCurvedTurnout3D(25.0, Z1, 29.4, Z2, null, null, true);

    // 12 个实况着色直股区段光带（加长 1/7G 至 5.6 单位，完整容纳 3 节编组二号车在 D₇ 前独立绝缘隔离停靠）
    const secDefs = [
      { key: 'X3JG', x0: -30.8, x1: -20.0, z: Z1, text: 'X3JG', lx: -25.4, lz: Z1 - 1.25 },
      { key: 'S1LQG', x0: -30.8, x1: -20.0, z: Z2, text: 'S1LQG', lx: -25.4, lz: Z2 + 1.28 },
      { key: 'IAG', x0: -19.8, x1: -16.0, z: Z1, text: 'IAG', lx: -17.9, lz: Z1 - 1.15 },
      { key: '1DG', x0: -15.8, x1: -10.2, z: Z1, text: '1DG(1/3)', lx: -13.0, lz: Z1 - 1.15 },
      { key: '1/7G', x0: -10.0, x1: -4.4, z: Z1, text: '1/7G', lx: -7.2, lz: Z1 - 1.15 },
      { key: '3DG', x0: -19.8, x1: -9.5, z: Z2, text: '3DG', lx: -14.6, lz: Z2 + 1.28 },
      { key: '5-9DG', x0: -9.3, x1: 4.1, z: Z2, text: '5-9DG(5/7·9)', lx: -2.6, lz: Z2 + 1.28 },
      { key: '11DG', x0: -4.2, x1: 4.1, z: Z1, text: '7-11DG(11)', lx: -.05, lz: Z1 - 1.18 },
      { key: '3G', x0: 4.3, x1: 14.7, z: Z3, text: null },
      { key: 'IG', x0: 4.3, x1: 14.7, z: Z1, text: null },
      { key: 'IIG', x0: 4.3, x1: 14.7, z: Z2, text: null },
      { key: '4G', x0: 4.3, x1: 14.7, z: Z4, text: null }
    ];
    const secStrips = {};
    for (const def of secDefs) {
      const len = def.x1 - def.x0, cx = (def.x0 + def.x1) / 2;
      const mat = new T.MeshBasicMaterial({ color: C.green });
      const s1 = box(yard, len, .028, .096, cx, .152, def.z - .37, mat, 'rail');
      const s2 = box(yard, len, .028, .096, cx, .152, def.z + .37, mat, 'rail');
      secStrips[def.key] = { mat, meshes: [s1, s2] };
      if (def.text) label(yard, def.text, [def.lx, .42, def.lz], [cx, .15, def.z], labelList);
    }

    // 绝缘节标记（严格对齐图 3.1.1 下行咽喉各区段分界点）
    for (const [jx, jz] of [
      [-19.9, Z1], [-15.9, Z1], [-10.1, Z1], [-4.3, Z1], [4.2, Z1],
      [-19.9, Z2], [-9.4, Z2], [4.2, Z2], [4.2, Z3], [4.2, Z4]
    ]) {
      for (const dz of [-.37, .37]) bevelBox(yard, .09, .14, .14, jx, .09, jz + dz, mats.copper, 'insulation', .01);
    }

    // 4 套实时动作转辙机、密贴拉杆与贴合轨内侧可动尖轨（尖轨始终在两基本轨内侧平移密贴/斥离，绝不伸出轨外穿模）
    const switchRefs = {};
    function addSwitchSet(key, px, pz, dirZ, mx, mz, bladeDir = 1) {
      const tg = new T.Group(); tg.position.set(px, .105, pz); yard.add(tg);
      const bladeL = bevelBox(tg, 1.05, .072, .042, bladeDir * .52, 0, -.28, mats.brass, 'switchMachine', .006);
      const bladeR = bevelBox(tg, 1.05, .072, .042, bladeDir * .52, 0, .28, mats.brass, 'switchMachine', .006);
      // 尖轨间轨距连接杆与转辙机密贴动作杆
      box(tg, .048, .032, .56, bladeDir * .16, -.02, 0, mats.iron, 'switchMachine');
      box(yard, .052, .036, Math.abs(mz - pz), px + bladeDir * .18, .085, (pz + mz) / 2, mats.iron, 'switchMachine');
      bevelBox(yard, .44, .22, .34, mx, .11, mz, mats.dark, 'switchMachine', .016);
      const ind = bevelBox(yard, .18, .055, .18, mx, .23, mz, material(C.green, .3, .3), 'switchMachine', .008);
      switchRefs[key] = { tg, bladeL, bladeR, ind, dirZ, bladeDir, baseZ: pz };
    }
    addSwitchSet('s1_3a', -15.6, Z1, 1, -15.1, Z1 - .66, 1);
    addSwitchSet('s1_3b', -10.2, Z2, -1, -10.7, Z2 + .66, -1);
    addSwitchSet('s5_7a', -6.6, Z2, -1, -6.1, Z2 + .66, 1);
    addSwitchSet('s5_7b', -1.4, Z1, 1, -1.9, Z1 - .66, -1);
    addSwitchSet('s9', -.8, Z2, 1, -.5, Z2 + .66, 1);
    addSwitchSet('s11', -.8, Z1, -1, -.5, Z1 - .66, 1);

    // 现代高铁站台与无柱雨棚（居中置于 II 道与 4G 之间 z = +1.44，两侧留足建筑限界绝不擦碰车体）
    bevelBox(yard, 8.6, .20, .54, 9.5, .10, (Z2 + Z4) / 2, mats.platform, 'base', .02);
    bevelBox(yard, 3.6, .70, .40, 9.5, .55, (Z2 + Z4) / 2, mats.dark, 'base', .02);
    bevelBox(yard, 8.2, .055, .52, 9.5, .90, (Z2 + Z4) / 2, mats.iron, 'base', .01);
    label(yard, '3G · IG · IIG · 4G 中间站股道', [9.5, .82, Z3 - .88], [9.5, .18, Z1], labelList);

    // 使用第 2.3 节精美装配器建造全部下行咽喉 10 架信号机（错开转辙机位置且置于建筑限界外，零重叠零穿模）
    const yardSignals = {};
    const sigSpecs = [
      { key: 'X', signalType: 'inStation', variant: 'a', plate: 'X', x: -19.9, z: Z1 - .64, rotY: -Math.PI / 2, scale: .32, desc: '进站信号机 X (5灯·高柱)' },
      { key: 'XF', signalType: 'inStation', variant: 'a', plate: 'X_F', x: -19.9, z: Z2 + .64, rotY: -Math.PI / 2, scale: .32, desc: '反向进站 X_F (5灯·高柱)' },
      { key: 'D1', signalType: 'shuntSig', variant: 'b', plate: 'D₁', x: -16.0, z: Z1 - .58, rotY: -Math.PI / 2, scale: .30, desc: 'D₁ 单置调车信号机' },
      { key: 'D3', signalType: 'shuntSig', variant: 'b', plate: 'D₃', x: -9.9, z: Z1 + .54, rotY: Math.PI / 2, scale: .29, desc: 'D₃ 差置调车信号机' },
      { key: 'D7', signalType: 'shuntSig', variant: 'b', plate: 'D₇', x: -4.3, z: Z1 - .58, rotY: -Math.PI / 2, scale: .30, desc: 'D₇ 差置调车信号机' },
      { key: 'D5', signalType: 'shuntSig', variant: 'b', plate: 'D₅', x: -9.4, z: Z2 + .58, rotY: -Math.PI / 2, scale: .30, desc: 'D₅ 单置调车信号机' },
      { key: 'S3', signalType: 'depThree', variant: 'b', plate: 'S₃', x: 4.4, z: Z3 - .58, rotY: Math.PI / 2, scale: .31, desc: 'S₃ 矮型出站兼调车' },
      { key: 'S1', signalType: 'depThree', variant: 'b', plate: 'S₁', x: 4.4, z: Z1 - .56, rotY: Math.PI / 2, scale: .31, desc: 'S₁ 矮型出站兼调车' },
      { key: 'SII', signalType: 'depThree', variant: 'a', plate: 'SⅡ', x: 4.4, z: Z2 + .58, rotY: Math.PI / 2, scale: .31, desc: 'SⅡ 高柱正线出站兼调车' },
      { key: 'S4', signalType: 'depThree', variant: 'b', plate: 'S₄', x: 4.4, z: Z4 + .58, rotY: Math.PI / 2, scale: .31, desc: 'S₄ 矮型出站兼调车' }
    ];
    for (const sp of sigSpecs) {
      const asm = buildSignalAssembly({ signalType: sp.signalType, variant: sp.variant, plateText: sp.plate, detailed: false });
      asm.root.position.set(sp.x, 0, sp.z);
      asm.root.rotation.y = sp.rotY;
      asm.root.scale.setScalar(sp.scale);
      asm.root.traverse(o => { if (o.isMesh) o.userData.stationSignal = sp; });
      yard.add(asm.root);
      yardSignals[sp.key] = { asm, spec: sp };
      if (['X', 'XF', 'D1', 'D5', 'S1', 'SII'].includes(sp.key)) {
        const yOff = asm.isTall ? 2.15 : .92;
        const zOff = ['X', 'D1', 'S1'].includes(sp.key) ? sp.z - .38 : sp.z + .38;
        label(yard, sp.plate, [sp.x, yOff, zOff], [sp.x, asm.isTall ? 1.55 : .42, sp.z], labelList);
      }
    }

    // 上行咽喉（上海方向）结构轮廓信号机，使图 3.1.1 全站首尾对称完整
    for (const [plate, signalType, variant, sx, sz, ry] of [
      ['S', 'inStation', 'a', 29.8, Z2 + .64, Math.PI / 2],
      ['S_F', 'inStation', 'a', 29.8, Z1 - .64, Math.PI / 2],
      ['X₁', 'depThree', 'b', 14.8, Z1 - .58, -Math.PI / 2],
      ['XⅡ', 'depThree', 'a', 14.8, Z2 + .58, -Math.PI / 2]
    ]) {
      const asm = buildSignalAssembly({ signalType, variant, plateText: plate, detailed: false });
      asm.root.position.set(sx, 0, sz);
      asm.root.rotation.y = ry;
      asm.root.scale.setScalar(.30);
      asm.applyState({ lit: ['H'], filament: 'main' });
      yard.add(asm.root);
    }

    // 复兴号 CR400AF-A 3 节编组铰接动车组（头车+中间受电弓客车+尾车，全包裙板无外露车轮）与站场跨线门式接触网
    const train = buildStationCR400AF(yard, .82, 16 * .115 / .82, .74 / .82);
    const trainB = buildStationCR400AF(yard, .82, 16 * .115 / .82, .74 / .82);
    trainB.visible = false;
    const catH = 1.83 * .82;
    const poleMat = material(0x617584, .6, .45);
    for (const zLine of [Z1, Z2]) line3(yard, [[-31.0, catH, zLine], [30.8, catH, zLine]], 0x91a6b6, .62, 'catenary');
    line3(yard, [[-15.6, catH, Z1], [-10.2, catH, Z2]], 0x91a6b6, .5, 'catenary');
    line3(yard, [[-6.6, catH, Z2], [-1.4, catH, Z1]], 0x91a6b6, .5, 'catenary');
    line3(yard, [[-.8, catH, Z1], [4.0, catH, Z3], [15.0, catH, Z3], [19.4, catH, Z1]], 0x91a6b6, .5, 'catenary');
    line3(yard, [[-.8, catH, Z2], [4.0, catH, Z4], [15.0, catH, Z4], [19.4, catH, Z2]], 0x91a6b6, .5, 'catenary');
    for (const px of [-26.5, -17.5, -8.5, 1.5, 10.0, 18.5, 27.0]) {
      for (const pz of [Z3 - .76, Z4 + .76]) cylinder(yard, .036, catH + .42, px, (catH + .42) / 2, pz, poleMat, 'catenary', 'y', 10);
      line3(yard, [[px, catH + .28, Z3 - .76], [px, catH + .28, Z4 + .76]], 0x7f95a6, .85, 'catenary');
      for (const zDrop of [Z1, Z2]) line3(yard, [[px, catH + .28, zDrop], [px, catH, zDrop]], 0x9bb0c0, .8, 'catenary');
    }

    // 室内信号楼定型组合架（置放于宽敞 3G 后方 z = -5.65，避免遮挡任何股道与弯道）
    const rack = new T.Group(); rack.position.set(0, .24, -5.65); rootGroup.add(rack);
    bevelBox(rack, 16.5, 4.38, .30, 0, 2.05, -.24, mats.rack, 'rackUnit', .025);
    bevelBox(rack, 16.9, .22, .88, 0, 4.28, -.05, mats.dark, 'rackUnit', .02);
    for (const rx of [-8.1, -2.7, 2.7, 8.1]) bevelBox(rack, .16, 4.38, .48, rx, 2.05, -.14, mats.iron, 'rackUnit', .015);
    for (const ry of [.18, 1.40, 2.62, 3.84]) bevelBox(rack, 16.4, .09, .46, 0, ry, -.12, mats.dark, 'rackUnit', .01);
    label(rack, '室内信号楼 · 继电器组合架（点击任意继电器或场内信号机微距拆解）', [0, 4.72, .2], [0, 4.28, 0], labelList);

    function makePlateMat(code, name, normalTag, normalUp) {
      if (typeof document === 'undefined') return material(0x162432, .2, .6);
      const canvas = document.createElement('canvas');
      canvas.width = 420; canvas.height = 160;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0d1926';
      ctx.fillRect(0, 0, 420, 160);
      ctx.strokeStyle = normalUp === 'up' ? '#3d7a64' : normalUp === 'polar' ? '#7a5c9e' : '#3a546b';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 412, 152);
      ctx.fillStyle = '#f0f7fc';
      ctx.font = '700 40px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(code, 16, 14);
      ctx.fillStyle = '#9ec2dc';
      ctx.font = '600 25px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillText(name, 16, 64);
      ctx.fillStyle = normalUp === 'up' ? '#7de0bd' : normalUp === 'polar' ? '#d0a8ff' : '#efb860';
      ctx.font = '600 21px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillText(normalTag, 16, 112);
      const tex = new T.CanvasTexture(canvas);
      tex.colorSpace = T.SRGBColorSpace;
      return new T.MeshBasicMaterial({ map: tex });
    }

    const relayDefs = [
      { key: 'LAJ', code: 'LAJ', name: '按钮继电器', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 平时11-13闭合', nType: 'down', row: 2, col: 0, part: 'rackRelay' },
      { key: 'LJJ', code: 'LJJ', name: '方向继电器', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 平时11-13闭合', nType: 'down', row: 2, col: 1, part: 'rackRelay' },
      { key: 'FKJ', code: 'FKJ', name: '辅助开始', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 平时11-13闭合', nType: 'down', row: 2, col: 2, part: 'rackRelay' },
      { key: 'KJ', code: 'KJ', name: '7线选排一致', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 平时11-13闭合', nType: 'down', row: 2, col: 3, part: 'rackRelay' },
      { key: 'XJJ', code: 'XJJ', name: '8线信号检查', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: null, normal: '常态↓ · 平时11-13闭合', nType: 'down', row: 2, col: 4, part: 'rackRelay' },
      { key: 'QJJ', code: 'QJJ', name: '9线区段检查', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 平时11-13闭合', nType: 'down', row: 2, col: 5, part: 'rackRelay' },
      { key: 'DCJ', code: 'DCJ/FCJ', name: '道岔操纵', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'turnoutLab', normal: '常态↓ · 平时11-13闭合', nType: 'down', row: 1, col: 0, part: 'switchMachine' },
      { key: 'DQJ1', code: '1DQJ', name: '一启动(缓放)', hwModel: 'JWJXC-H125/0.44', benchType: 'heavySlow', topicType: 'turnoutLab', normal: '常态↓ · 平时11-13闭合', nType: 'down', row: 1, col: 1, part: 'switchMachine' },
      { key: 'DQJ2', code: '2DQJ', name: '二启动(有极)', hwModel: 'JYJXC-220/220', benchType: 'latching', topicType: 'turnoutLab', normal: '常态定位 · 111-112闭合', nType: 'polar', row: 1, col: 2, part: 'switchMachine' },
      { key: 'DBJ', code: 'DBJ', name: '定位表示(偏极)', hwModel: 'JPXC-1000', benchType: 'biased', topicType: 'turnoutLab', normal: '常态↑ · 平时11-12闭合', nType: 'up', row: 1, col: 3, part: 'switchMachine' },
      { key: 'FBJ', code: 'FBJ', name: '反位表示(偏极)', hwModel: 'JPXC-1000', benchType: 'biased', topicType: 'turnoutLab', normal: '常态↓ · 平时11-13闭合', nType: 'down', row: 1, col: 4, part: 'switchMachine' },
      { key: 'DJ', code: 'DJ', name: '红灯丝监督', hwModel: 'JZXC-H62', benchType: 'filament', topicType: null, normal: '常态↑ · 平时11-12闭合', nType: 'up', row: 1, col: 5, part: 'signalX' },
      { key: 'LXJ', code: 'LXJ', name: '11线列车信号', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 平时11-13闭合', nType: 'down', row: 0, col: 0, part: 'signalX' },
      { key: 'SJ', code: 'SJ', name: '道岔锁闭', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'timeRelay', normal: '常态↑ · 平时11-12闭合', nType: 'up', row: 0, col: 1, part: 'rackRelay' },
      { key: 'DGJ', code: '轨道继电器', name: '区段空闲检测', hwModel: 'JZXC-480', benchType: 'rectifier', topicType: null, normal: '常态↑ · 平时11-12闭合', nType: 'up', row: 0, col: 2, part: 'rail' },
      { key: 'FDGJ', code: 'FDGJ', name: '3s缓放反复示', hwModel: 'JWXC-H340 + RC', benchType: 'slowRelease', topicType: null, normal: '常态↓ · 平时11-13闭合', nType: 'down', row: 0, col: 3, part: 'copperSleeve' },
      { key: 'LJ1', code: '1LJ', name: '12线进路锁闭', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: null, normal: '常态↑ · 平时11-12闭合', nType: 'up', row: 0, col: 4, part: 'rackRelay' },
      { key: 'LJ2', code: '2LJ', name: '13线进路锁闭', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: null, normal: '常态↑ · 平时11-12闭合', nType: 'up', row: 0, col: 5, part: 'rackRelay' }
    ];
    const rackUnits = {};
    for (const d of relayDefs) {
      const ux = -6.5 + d.col * 2.6, uy = .78 + d.row * 1.22;
      const ug = new T.Group(); ug.position.set(ux, uy, .08); rack.add(ug);
      bevelBox(ug, 2.18, .88, .42, 0, 0, 0, mats.bakelite, d.part, .018);
      const ledMat = new T.MeshBasicMaterial({ color: 0x3b4d5e });
      const bar = bevelBox(ug, 2.04, .12, .44, 0, .34, .02, ledMat, d.part, .01);
      const plateMat = makePlateMat(d.code, d.name, d.normal, d.nType);
      mesh(ug, new T.PlaneGeometry(1.42, .56), plateMat, -.28, -.06, .22, d.part);
      const coilMat = material(C.copper, .82, .24);
      cylinder(ug, .095, .22, .58, -.16, .14, coilMat, d.part, 'x', 20);
      cylinder(ug, .095, .22, .84, -.16, .14, coilMat, d.part, 'x', 20);
      const arm = bevelBox(ug, .46, .06, .20, .70, .06, .16, mats.brass, d.part, .006);
      ug.traverse(o => { if (o.isMesh) o.userData.rackRelay = d; });
      rackUnits[d.key] = { ug, ledMat, coilMat, arm, bar, def: d };
    }

    // 按表 3.2.2 全 33 条进路真实几何轨迹插值（与实体 3D 弯道道岔共用同一套 turnoutEase 方程，全 33 条进路 100% 严格贴轨无脱轨/无急折）
    const TRACK_Z = {
      '3G': Z3, IG: Z1, IIG: Z2, '4G': Z4,
      X3JG: Z1, IAG: Z1, '1DG': Z1, '1/7G': Z1, '11DG': Z1,
      S1LQG: Z2, '3DG': Z2, '5-9DG': Z2
    };
    const TURNOUT_DEFS = {
      c1_3: { x0: -15.6, z0: Z1, x1: -10.2, z1: Z2 },
      c5_7: { x0: -6.6, z0: Z2, x1: -1.4, z1: Z1 },
      c9: { x0: -.8, z0: Z2, x1: 4.0, z1: Z4 },
      c11: { x0: -.8, z0: Z1, x1: 4.0, z1: Z3 }
    };
    function evalSpline(wps, pos) {
      if (pos <= wps[0].p) {
        const dx = wps[1].x - wps[0].x;
        const t = (pos - wps[0].p) / Math.max(1e-4, wps[1].p - wps[0].p);
        return { x: wps[0].x + dx * t, z: wps[0].z, yaw: dx < 0 ? Math.PI : 0 };
      }
      if (pos >= wps[wps.length - 1].p) {
        const a = wps[wps.length - 2], b = wps[wps.length - 1];
        const dx = b.x - a.x;
        const t = (pos - b.p) / Math.max(1e-4, b.p - a.p);
        return { x: b.x + dx * t, z: b.z, yaw: dx < 0 ? Math.PI : 0 };
      }
      for (let i = 0; i < wps.length - 1; i++) {
        const a = wps[i], b = wps[i + 1];
        if (pos >= a.p && pos <= b.p) {
          const u = (pos - a.p) / Math.max(1e-4, b.p - a.p);
          const dx = b.x - a.x, dz = b.z - a.z;
          const x = a.x + dx * u;
          const smooth = dz !== 0 ? turnoutEase(u) : u;
          const z = a.z + dz * smooth;
          const dzu = dz !== 0 ? dz * turnoutEaseDeriv(u) : 0;
          const yaw = Math.atan2(dzu, dx);
          return { x, z, yaw };
        }
      }
      return { x: wps[0].x, z: wps[0].z, yaw: 0 };
    }

    function routeWaypoints(routeType) {
      const J = root.RailwayJourney;
      const r = J ? J.resolveRoute(routeType) : { code: 'R1', kind: 'receive', sig: 'X', switches: {}, ctrl: ['IAG', '1DG', '11DG'], terminal: 'IG' };
      const code = r.code;
      const toZ = TRACK_Z[r.terminal] ?? Z1;
      const sw = r.switches || {};
      const via5_7 = sw.s5_7 === 'R', via1_3 = sw.s1_3 === 'R';

      if (r.kind === 'receive') {
        const startZ = r.sig === 'XF' ? Z2 : Z1;
        const wps = [{ p: -26, x: -25.4, z: startZ }, { p: 0, x: -19.9, z: startZ }];
        if (code === 'R1' || code === 'R3') {
          wps.push({ p: 25, x: -16.0, z: Z1 }, { p: 55, x: -4.3, z: Z1 });
          if (r.terminal === '3G') { wps.push({ p: 66, x: -.8, z: Z1 }, { p: 83, x: 4.0, z: Z3 }, { p: 85, x: 4.2, z: Z3 }); }
          else { wps.push({ p: 85, x: 4.2, z: Z1 }); }
        } else if (r.sig === 'X') {
          wps.push({ p: 20, x: -15.6, z: Z1 });
          if (via1_3) wps.push({ p: 44, x: -10.2, z: Z2 }, { p: 48, x: -9.4, z: Z2 });
          else wps.push({ p: 55, x: -4.3, z: Z1 });
          if (r.terminal === '4G') wps.push({ p: 67, x: -.8, z: Z2 }, { p: 86, x: 4.0, z: Z4 }, { p: 88, x: 4.2, z: Z4 });
          else wps.push({ p: 88, x: 4.2, z: toZ });
        } else {
          if (via5_7) {
            wps.push({ p: 40, x: -6.6, z: Z2 }, { p: 62, x: -1.4, z: Z1 });
            if (r.terminal === '3G') wps.push({ p: 65, x: -.8, z: Z1 }, { p: 86, x: 4.0, z: Z3 }, { p: 88, x: 4.2, z: Z3 });
            else wps.push({ p: 88, x: 4.2, z: Z1 });
          } else {
            wps.push({ p: 44, x: -9.4, z: Z2 });
            if (r.terminal === '4G') wps.push({ p: 65, x: -.8, z: Z2 }, { p: 86, x: 4.0, z: Z4 }, { p: 88, x: 4.2, z: Z4 });
            else wps.push({ p: 88, x: 4.2, z: toZ });
          }
        }
        wps.push({ p: 130, x: 14.2, z: toZ });
        return wps;
      }
      if (r.kind === 'depart') {
        const fromZ = TRACK_Z[r.approach] ?? Z1;
        const endZ = r.terminal === 'S1LQG' ? Z2 : Z1;
        // 3 节编组（总长 4.54）整列停靠在中间站股道 [4.2..14.8] 内等待发车（车鼻 +9.2 朝西，车尾 +13.74 不越出东端信号机）
        const wps = [{ p: -26, x: 9.2, z: fromZ }, { p: 0, x: 4.2, z: fromZ }];
        if (code === 'R5') {
          wps.push({ p: 28, x: -4.3, z: Z1 }, { p: 62, x: -16.0, z: Z1 }, { p: 92, x: -19.9, z: Z1 });
        } else {
          if (r.approach === '3G') wps.push({ p: 2, x: 4.0, z: Z3 }, { p: 21, x: -.8, z: Z1 });
          else if (r.approach === '4G') wps.push({ p: 2, x: 4.0, z: Z4 }, { p: 21, x: -.8, z: Z2 });
          if (via5_7) wps.push({ p: 24, x: -1.4, z: Z1 }, { p: 46, x: -6.6, z: Z2 });
          if (via1_3) wps.push({ p: 52, x: -10.2, z: Z2 }, { p: 74, x: -15.6, z: Z1 });
          wps.push({ p: 88, x: -19.9, z: endZ });
        }
        wps.push({ p: 125, x: -26.5, z: endZ });
        return wps;
      }
      // 17 条调车进路与实体 3D 弯道道岔坐标逐条精确对齐（D₇ 始端车尾 -9.74 完全收在 1/7G [-10.0..-4.4] 内，与 R18 (1/3) 绝对物理隔离零穿越！）
      const sigPos = { D1: [-16.0, Z1], D3: [-10.1, Z1], D5: [-9.4, Z2], D7: [-4.3, Z1], S1: [4.2, Z1], S3: [4.2, Z3], SII: [4.2, Z2], S4: [4.2, Z4] };
      const [sx, sz] = sigPos[r.sig] || [-16.0, Z1];
      const forward = ['D1', 'D5', 'D7'].includes(r.sig);
      const startX = forward ? (r.sig === 'D7' ? -5.2 : r.sig === 'D5' ? -13.4 : -19.2) : (r.sig === 'D3' ? -5.2 : 9.0);
      const wps = [{ p: -26, x: startX, z: sz }, { p: 0, x: sx, z: sz }];
      if (forward) {
        let curZ = sz;
        if (via1_3) { wps.push({ p: 4, x: -15.6, z: Z1 }, { p: 52, x: -10.2, z: Z2 }); curZ = Z2; }
        if (via5_7) { wps.push({ p: 14, x: -6.6, z: Z2 }, { p: 40, x: -1.4, z: Z1 }); curZ = Z1; }
        if (r.terminal === '4G') { wps.push({ p: 42, x: -.8, z: Z2 }, { p: 66, x: 4.0, z: Z4 }); curZ = Z4; }
        else if (r.terminal === '3G') { wps.push({ p: via5_7 ? 44 : 26, x: -.8, z: Z1 }, { p: 66, x: 4.0, z: Z3 }); curZ = Z3; }
        const termEntryX = { '11DG': -4.3, '5-9DG': -9.4, IG: 4.2, IIG: 4.2, '3G': 4.2, '4G': 4.2 }[r.terminal] ?? 4.2;
        const termStopX = { '11DG': 1.6, '5-9DG': -4.4, IG: 11.4, IIG: 11.4, '3G': 11.4, '4G': 11.4 }[r.terminal] ?? 11.4;
        const endZ = TRACK_Z[r.terminal] ?? curZ;
        wps.push({ p: code === 'R17' ? 55 : 68, x: termEntryX, z: endZ });
        wps.push({ p: 105, x: termStopX, z: endZ });
      } else {
        let curZ = sz;
        if (r.sig === 'S3') { wps.push({ p: 2, x: 4.0, z: Z3 }, { p: via5_7 ? 18 : 40, x: -.8, z: Z1 }); curZ = Z1; }
        else if (r.sig === 'S4') { wps.push({ p: 2, x: 4.0, z: Z4 }, { p: 20, x: -.8, z: Z2 }); curZ = Z2; }
        if (via5_7) { wps.push({ p: 21, x: -1.4, z: Z1 }, { p: 38, x: -6.6, z: Z2 }); curZ = Z2; }
        if (via1_3) { wps.push({ p: 45, x: -10.2, z: Z2 }, { p: 65, x: -15.6, z: Z1 }); curZ = Z1; }
        const termEntryX = { '1/7G': -4.3, IAG: -16.0, S1LQG: -19.9 }[r.terminal] ?? -16.0;
        const termStopX = { '1/7G': -9.4, IAG: -19.2, S1LQG: -24.8 }[r.terminal] ?? -19.2;
        const endZ = TRACK_Z[r.terminal] ?? curZ;
        wps.push({ p: 68, x: termEntryX, z: endZ });
        wps.push({ p: 105, x: termStopX, z: endZ });
      }
      return wps;
    }

    function trackCoords(pos, routeType) {
      const J = root.RailwayJourney;
      const r = J ? J.resolveRoute(routeType) : { kind: 'receive' };
      const clampedPos = r.kind === 'shunt' ? Math.min(pos, 105) : pos;
      return evalSpline(routeWaypoints(routeType), clampedPos);
    }

    return {
      root: rootGroup, train, trainB, type: 'station', physical: false,
      debugTrack: { Z3, Z1, Z2, Z4, turnouts: TURNOUT_DEFS, turnoutEase, routeWaypoints, trackCoords },
      setView(s) {
        const e = (s.explode || 0) / 100;
        rack.position.set(0, .24 + .85 * e, -5.65 - 1.15 * e);
        yard.position.set(0, 0, .55 * e);
        labelList.forEach(l => { l.visible = !!s.labels; });
      },
      pose(p, r, s, time) {
        const st = r.station;
        if (!st) return;
        const rl = st.relays;

        const colorFor = (occ, unlocked, slow) => occ ? C.red : slow ? C.amber : unlocked ? C.green : C.white;
        for (const [key, strip] of Object.entries(secStrips)) {
          const ss = st.secStates && st.secStates[key];
          if (ss) strip.mat.color.setHex(colorFor(ss.occ, ss.unlocked, ss.slow));
        }

        // 更新 1/3、5/7、9、11 全部道岔尖轨（基本轨内侧真实密贴/斥离）、表示灯与分段渡线光带
        const sw = st.switchesState || { s1_3: 'N', s5_7: 'N', s9: 'N', s11: 'N' };
        const applySw = (refKey, swVal) => {
          const ref = switchRefs[refKey];
          if (!ref) return;
          const rev = swVal === 'R';
          const shift = (rev ? -1 : 1) * ref.dirZ * .045;
          ref.bladeL.position.z = -.28 + shift;
          ref.bladeR.position.z = .28 + shift;
          ref.bladeL.rotation.y = rev ? -ref.dirZ * ref.bladeDir * .055 : 0;
          ref.bladeR.rotation.y = rev ? -ref.dirZ * ref.bladeDir * .055 : 0;
          ref.ind.material.color.setHex(swVal === 'MOV' ? C.amber : (rl.DBJ || rl.FBJ) ? (rev ? C.blue : C.green) : C.red);
        };
        applySw('s1_3a', sw.s1_3); applySw('s1_3b', sw.s1_3);
        applySw('s5_7a', sw.s5_7); applySw('s5_7b', sw.s5_7);
        applySw('s9', sw.s9); applySw('s11', sw.s11);
        // 同步更新实体 3D 弯道光带（定位或区段已解锁空闲时隐藏露出真实金属钢轨，锁闭/占用/FDGJ缓放时分半段亮白/红/琥珀）
        const setCrossHalf = (strips, mat, rev, secKey) => {
          const ss = st.secStates && st.secStates[secKey];
          const activeStrip = !!(rev && st.stg >= 2 && ss && (ss.occ || ss.slow || !ss.unlocked));
          strips.forEach(m => { m.visible = activeStrip; });
          if (!activeStrip) return;
          mat.color.setHex(ss.occ ? C.red : ss.slow ? C.amber : C.white);
        };
        setCrossHalf(crossMeshes.c1_3.stripsA, crossMats.c1_3a, sw.s1_3 === 'R', '1DG');
        setCrossHalf(crossMeshes.c1_3.stripsB, crossMats.c1_3b, sw.s1_3 === 'R', '3DG');
        setCrossHalf(crossMeshes.c5_7.stripsA, crossMats.c5_7a, sw.s5_7 === 'R', '5-9DG');
        setCrossHalf(crossMeshes.c5_7.stripsB, crossMats.c5_7b, sw.s5_7 === 'R', '11DG');
        setCrossHalf(crossMeshes.c9.stripsA, crossMats.c9, sw.s9 === 'R', '5-9DG');
        setCrossHalf(crossMeshes.c11.stripsA, crossMats.c11, sw.s11 === 'R', '11DG');

        // 更新全站 10 架第 2.3 节 3D 信号机实时灯光与方向表示器
        const sigStates = st.signals || {};
        const fallbackLit = { H: ['H'], U: ['U1', 'U'], UU: ['U1', 'U2'], L: ['L', 'L1'], LU: ['L', 'L1', 'U', 'U2'], HB: ['H', 'B'], B: ['B'], A: ['A'] };
        const sigAspectMap = root.RailwayLogic && root.RailwayLogic.SIGNAL_ASPECTS;
        for (const [k, obj] of Object.entries(yardSignals)) {
          const asp = sigStates[k] || (k.startsWith('D') ? 'A' : 'H');
          const map = sigAspectMap && sigAspectMap[obj.spec.signalType];
          const lit = asp === 'DARK' ? [] : (map && map[asp] ? map[asp].lit : (fallbackLit[asp] || ['H']));
          const indA = st.indicatorOn && st.routeSpec && st.routeSpec.sig === k;
          const indB = st.multiTrain && st.multiTrain.active && st.multiTrain.indicatorOnB && st.multiTrain.sigB === k;
          const ind = (indA || indB) ? 'right' : '';
          obj.asm.applyState({ lit, filament: asp === 'DARK' ? 'broken' : 'main', indicator: ind, time: time || 0 });
        }

        const Jref = root.RailwayJourney;
        const rA = Jref ? Jref.resolveRoute(st.routeType) : { kind: 'receive' };
        let visPosA = rA.kind === 'shunt' ? Math.min(s.stationTrain, 105) : s.stationTrain;
        const rB = st.multiTrain && Jref ? Jref.resolveRoute(st.multiTrain.routeB) : { kind: 'receive' };
        let visPosB = st.multiTrain ? (rB.kind === 'shunt' ? Math.min(st.multiTrain.trainB, 105) : st.multiTrain.trainB) : -26;
        const sampleA = posVal => trackCoords(posVal, st.routeType);
        const sampleB = posVal => trackCoords(posVal, st.multiTrain.routeB);

        const showB = !!(st.multiTrain && st.multiTrain.active && !st.multiTrain.hideDuplicateB);
        // 严格单向防越过守卫（与 logic.js 有效位置/等待条件统一：排队状态 B 不得越过 A 或跳出阈值区间，股道占车 A 不得越过驻停 B）
        if (showB) {
          const MIN_CENTER_GAP = 4.95;
          const ptA0 = sampleA(visPosA);
          if (st.multiTrain.mode === 'conflict_queue') {
            if (st.multiTrain.bWaitingForA) visPosB = Math.min(visPosB, -12);
            let ptB = sampleB(visPosB);
            for (let k = 0; k < 600 && visPosB > -28 && Math.abs(ptB.z - ptA0.z) < .55 && ptB.x > ptA0.x - MIN_CENTER_GAP; k++) {
              visPosB -= .25;
              ptB = sampleB(visPosB);
            }
          } else if (st.multiTrain.mode === 'track_occupied') {
            const ptB0 = sampleB(visPosB);
            let ptA = ptA0;
            for (let k = 0; k < 600 && visPosA > -28 && Math.abs(ptA.z - ptB0.z) < .55 && ptA.x > ptB0.x - MIN_CENTER_GAP; k++) {
              visPosA -= .25;
              ptA = sampleA(visPosA);
            }
          } else {
            const ptB0 = sampleB(visPosB);
            if (Math.abs(ptA0.z - ptB0.z) < .55 && Math.abs(ptA0.x - ptB0.x) < MIN_CENTER_GAP) {
              if (st.multiTrain.bWaitingForA || ptA0.x >= ptB0.x) {
                for (let k = 0; k < 400 && Math.abs(sampleB(visPosB).x - ptA0.x) < MIN_CENTER_GAP && visPosB > -28; k++) {
                  visPosB -= .25;
                }
              } else {
                for (let k = 0; k < 400 && Math.abs(sampleA(visPosA).x - ptB0.x) < MIN_CENTER_GAP && visPosA > -28; k++) {
                  visPosA -= .25;
                }
              }
            }
          }
        }

        train.placeOnSpline(sampleA, visPosA);
        train.setOperatingState({ pantograph: s.pantograph !== false, power: s.catenaryPower !== false, direction: s.stationDirection || 1, pantographPosition: s.pantographPosition, distance: visPosA * .115 / .82 });

        if (showB) {
          trainB.visible = true;
          trainB.placeOnSpline(sampleB, visPosB);
          trainB.setOperatingState({ pantograph: s.pantograph !== false, power: s.catenaryPower !== false, direction: 1, pantographPosition: s.pantographPosition, distance: visPosB * .115 / .82 });
        } else {
          trainB.visible = false;
        }

        const aSec = st.activeSec || rl;
        for (const d of relayDefs) {
          const u = rackUnits[d.key];
          let active = false, warn = false;
          if (d.key === 'DCJ') active = rl.DCJ || rl.FCJ;
          else if (d.key === 'DQJ2') { active = rl.DQJ2; warn = rl.DQJ2; }
          else if (d.key === 'LXJ') { active = rl.LXJ || rl.YXJ; warn = !rl.LXJ && !!rl.YXJ; }
          else if (d.key === 'SJ') { active = aSec.SJ; warn = !aSec.SJ || !!st.guideActive; }
          else if (d.key === 'QJJ') { active = aSec.QJJ; warn = false; }
          else if (d.key === 'DGJ') { active = aSec.DGJ; warn = !aSec.DGJ; }
          else if (d.key === 'FDGJ') { active = aSec.FDGJ; warn = !!aSec.slow || st.dg11Slow || st.iagSlow || st.dg1Slow; }
          else if (d.key === 'LJ1') { active = aSec.LJ1; warn = !aSec.LJ1; }
          else if (d.key === 'LJ2') { active = aSec.LJ2; warn = !aSec.LJ2; }
          else active = !!rl[d.key];

          u.ledMat.color.setHex(warn ? C.amber : active ? C.green : 0x364758);
          u.coilMat.emissive.setHex(active ? 0x5c3010 : 0);
          u.arm.rotation.z = active ? .14 : -.08;
        }
      },
      dispose() {
        const gs = new Set(), ms = new Set(), maps = new Set();
        rootGroup.traverse(o => {
          if (o.geometry) gs.add(o.geometry);
          if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { ms.add(m); if (m.map) maps.add(m.map); });
        });
        gs.forEach(g => g.dispose()); maps.forEach(t => t.dispose()); ms.forEach(m => m.dispose());
      }
    };
  }

  function exportGLB(group) {
    group.updateWorldMatrix(true, true);
    const doc = {
      asset: { version: '2.0', generator: 'Railway Relay Lab · teaching geometry, meters are schematic' },
      scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], materials: [], accessors: [], bufferViews: [], buffers: [{ byteLength: 0 }]
    };
    doc.asset.extras = {
      model: group.userData.model,
      contacts: group.userData.contacts,
      referencePDFPages: group.userData.referencePDFPages,
      geometryBoundary: group.userData.geometryBoundary,
      dimension_status: 'Schematic proportions, not measured manufacturing dimensions'
    };
    doc.scenes[0].name = group.name;
    const chunks = []; let byteOffset = 0;
    function buffer(typed, target) {
      const bytes = new Uint8Array(typed.buffer, typed.byteOffset, typed.byteLength);
      const padded = new Uint8Array(Math.ceil(bytes.length / 4) * 4); padded.set(bytes); chunks.push(padded);
      doc.bufferViews.push({ buffer: 0, byteOffset, byteLength: bytes.length, target }); byteOffset += padded.length; return doc.bufferViews.length - 1;
    }
    const rootInverse = group.matrixWorld.clone().invert(), materialMap = new Map();
    group.traverse(o => {
      if (!o.isMesh || !o.visible || ['cover'].includes(o.userData.part) || !o.geometry.attributes.position) return;
      let ancestor = o.parent; while (ancestor && ancestor !== group) { if (!ancestor.visible) return; ancestor = ancestor.parent; }
      if (!o.material.isMeshStandardMaterial && !o.material.isMeshPhysicalMaterial) return;
      const geo = o.geometry.clone(); geo.applyMatrix4(rootInverse.clone().multiply(o.matrixWorld));
      const pos = new Float32Array(geo.attributes.position.array), count = geo.attributes.position.count;
      const box3 = new T.Box3().setFromBufferAttribute(geo.attributes.position);
      const pa = doc.accessors.length;
      doc.accessors.push({ bufferView: buffer(pos, 34962), componentType: 5126, count, type: 'VEC3', min: box3.min.toArray(), max: box3.max.toArray() });
      const attrs = { POSITION: pa };
      if (geo.attributes.normal) { attrs.NORMAL = doc.accessors.length; doc.accessors.push({ bufferView: buffer(new Float32Array(geo.attributes.normal.array), 34962), componentType: 5126, count, type: 'VEC3' }); }
      let indices;
      if (geo.index) { indices = doc.accessors.length; doc.accessors.push({ bufferView: buffer(new Uint32Array(geo.index.array), 34963), componentType: 5125, count: geo.index.count, type: 'SCALAR' }); }
      let mi = materialMap.get(o.material);
      if (mi === undefined) {
        mi = doc.materials.length; materialMap.set(o.material, mi);
        doc.materials.push({ name: o.userData.part || 'material', pbrMetallicRoughness: { baseColorFactor: [...o.material.color.toArray(), 1], metallicFactor: o.material.metalness || 0, roughnessFactor: o.material.roughness || .5 }, doubleSided: true });
      }
      const primitive = { attributes: attrs, material: mi }; if (indices !== undefined) primitive.indices = indices;
      doc.meshes.push({ name: o.name || o.userData.part || 'part', primitives: [primitive] });
      doc.scenes[0].nodes.push(doc.nodes.length); doc.nodes.push({ mesh: doc.meshes.length - 1, name: o.name || 'part' });
      geo.dispose();
    });
    doc.buffers[0].byteLength = byteOffset;
    const json = new TextEncoder().encode(JSON.stringify(doc)); const jsonSize = Math.ceil(json.length / 4) * 4;
    const result = new ArrayBuffer(12 + 8 + jsonSize + 8 + byteOffset), view = new DataView(result), bytes = new Uint8Array(result);
    view.setUint32(0, 0x46546c67, true); view.setUint32(4, 2, true); view.setUint32(8, result.byteLength, true);
    view.setUint32(12, jsonSize, true); view.setUint32(16, 0x4e4f534a, true); bytes.fill(32, 20, 20 + jsonSize); bytes.set(json, 20);
    const start = 20 + jsonSize; view.setUint32(start, byteOffset, true); view.setUint32(start + 4, 0x004e4942, true);
    let offset = start + 8; for (const c of chunks) { bytes.set(c, offset); offset += c.length; }
    return result;
  }

  root.RelayModel = { createRelay, createSignal, createTrack, createStation, buildTrainMesh, exportGLB };
})(globalThis);
