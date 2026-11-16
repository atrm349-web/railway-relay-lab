(function (root) {
  'use strict';
  const T = root.THREE;
  if (!T) return;
  const C = { copper: 0xc98144, iron: 0x6b7f92, dark: 0x263744, base: 0x24323d,
    brass: 0xc7a568, contact: 0xdce5e9, green: 0x7de0bd, red: 0xd06a77, blue: 0x78a8e7 };
  function material(color, metalness = .55, roughness = .36) {
    return new T.MeshStandardMaterial({ color, metalness, roughness });
  }
  function mesh(group, geometry, mat, x, y, z, part) {
    const o = new T.Mesh(geometry, mat);
    o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true;
    o.userData.part = part; if (part) o.name = part;
    group.add(o); return o;
  }
  function box(g, w, h, d, x, y, z, mat, part) { return mesh(g, new T.BoxGeometry(w, h, d), mat, x, y, z, part); }
  function cylinder(g, radius, length, x, y, z, mat, part, axis = 'x') {
    const m = mesh(g, new T.CylinderGeometry(radius, radius, length, 32), mat, x, y, z, part);
    if (axis === 'x') m.rotation.z = Math.PI / 2;
    if (axis === 'z') m.rotation.x = Math.PI / 2;
    return m;
  }
  function line3(g, pts, color, opacity = 1, part) {
    const geo = new T.BufferGeometry().setFromPoints(pts.map(p => new T.Vector3(...p)));
    const o = new T.Line(geo, new T.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
    o.userData.part = part; g.add(o); return o;
  }
  class Helix extends T.Curve {
    constructor(length, radius, turns) { super(); Object.assign(this, { length, radius, turns }); }
    getPoint(t, target = new T.Vector3()) { const a = t * this.turns * Math.PI * 2; return target.set((t - .5) * this.length, Math.cos(a) * this.radius, Math.sin(a) * this.radius); }
  }
  function coil(g, x, y, z, length, name, axis = 'x', color = C.copper) {
    const group = new T.Group(); group.position.set(x, y, z); g.add(group);
    if (axis === 'y') group.rotation.z = Math.PI / 2;
    if (axis === 'z') group.rotation.y = Math.PI / 2;
    const spool = material(C.dark, .15), copper = material(color, .75, .28);
    cylinder(group, .42, length, 0, 0, 0, spool, name);
    cylinder(group, .52, .09, -length / 2, 0, 0, spool, name);
    cylinder(group, .52, .09, length / 2, 0, 0, spool, name);
    mesh(group, new T.TubeGeometry(new Helix(length - .13, .465, 25), 400, .027, 6, false), copper, 0, 0, 0, name);
    return { group, copper };
  }
  function label(g, text, pos, target) {
    const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 100;
    const ctx = canvas.getContext('2d'); ctx.font = '500 38px "PingFang SC","Microsoft YaHei",sans-serif';
    const width = Math.min(630, ctx.measureText(text).width + 38);
    ctx.fillStyle = '#122335e8'; ctx.beginPath(); ctx.roundRect(320 - width / 2, 9, width, 78, 15); ctx.fill();
    ctx.fillStyle = '#d2e0ec'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 320, 50);
    const tex = new T.CanvasTexture(canvas); tex.colorSpace = T.SRGBColorSpace;
    const sprite = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    sprite.position.set(...pos); sprite.scale.set(2.6, .406, 1); sprite.renderOrder = 5; g.add(sprite);
    if (target) line3(g, [target, pos], 0x6c8b9f, .6);
  }
  function createRelay(type, caption) {
    const root = new T.Group(); root.name = type;
    const fixed = new T.Group(), magnet = new T.Group(), mechanism = new T.Group(), contacts = new T.Group(), labels = new T.Group(), field = new T.Group();
    root.add(fixed, magnet, mechanism, contacts, labels, field);
    const mats = { iron: material(C.iron, .78, .28), dark: material(C.dark, .3), base: material(C.base, .2), brass: material(C.brass, .7), contact: material(C.contact, .8, .2), green: material(C.green, .3) };
    const coils = [], levers = [], frontMats = [], backMats = [], fieldDots = [];
    box(fixed, 6.2, .32, 2.65, 0, -.06, 0, mats.base, 'base');
    box(fixed, 5.9, .08, 2.45, 0, .14, 0, mats.dark, 'base');
    for (const x of [-2.75, 2.75]) for (const z of [-.98, .98]) {
      cylinder(fixed, .11, .09, x, .24, z, mats.brass, 'base', 'y');
      box(fixed, .12, .012, .025, x, .29, z, mats.dark, 'base');
    }
    for (let i = 0; i < 4; i++) {
      const tx = -1.4 + i * .8;
      cylinder(fixed, .095, .18, tx, .24, .98, mats.brass, 'terminals', 'y');
    }
    box(contacts, .42, 2.5, 1.2, 2.25, 3.1, -.1, mats.dark, 'contactBlock');
    box(contacts, .25, 2.5, 1.12, -.25, 3.1, -.1, mats.dark, 'contactBlock');
    for (let i = 0; i < 4; i++) {
      const y = 2.3 + i * .53;
      const fm = material(C.contact, .8), bm = material(C.contact, .8);
      frontMats.push(fm); backMats.push(bm);
      box(contacts, 1.2, .045, .24, 1.62, y + .14, .28, mats.brass, 'front');
      box(contacts, 1.2, .045, .24, 1.62, y - .14, .28, mats.brass, 'back');
      cylinder(contacts, .09, .045, 1.09, y + .1, .28, fm, 'front', 'y');
      cylinder(contacts, .09, .045, 1.09, y - .1, .28, bm, 'back', 'y');
      const lever = new T.Group(); lever.position.set(-.2, y, .28); contacts.add(lever); levers.push(lever);
      box(lever, 1.33, .025, .16, .655, 0, 0, mats.brass, 'common');
      cylinder(lever, .085, .042, 1.28, 0, 0, mats.contact, 'common', 'y');
      box(contacts, .04, .16, .23, 2.49, y + .14, .28, fm, 'front');
      box(contacts, .04, .16, .23, 2.49, y - .14, .28, bm, 'back');
    }
    let armature, rod, vane = null;
    if (type === 'phase') {
      coils.push(coil(magnet, -1.55, 1.05, 0, 1.25, 'trackCoil', 'y'));
      coils.push(coil(magnet, .05, .95, -.6, 1.05, 'localCoil', 'z', 0xb39b61));
      box(magnet, .25, 1.7, .35, -2.05, .97, -.15, mats.iron, 'yoke');
      box(magnet, .55, .25, .35, -1.7, 1.7, -.15, mats.iron, 'yoke');
      box(magnet, .6, .5, .14, -.85, 1.28, -.3, mats.iron, 'pole');
      box(magnet, .6, .5, .14, -.85, 1.28, .3, mats.iron, 'pole');
      armature = new T.Group(); armature.position.set(-.5, 2.22, .05); mechanism.add(armature);
      const shape = new T.Shape(); shape.moveTo(0, 0); shape.lineTo(-1.35, -1.1); shape.absarc(0, 0, 1.74, -2.46, -.63, false); shape.lineTo(0, 0);
      const geo = new T.ExtrudeGeometry(shape, { depth: .045, bevelEnabled: false, curveSegments: 48 });
      vane = mesh(armature, geo, material(0xaabfc9, .9, .25), 0, 0, 0, 'vane');
      cylinder(mechanism, .12, .8, -.5, 2.22, .05, mats.brass, 'vane', 'z');
      box(armature, 1.48, .09, .16, .65, 0, 0, mats.iron, 'armature');
      rod = box(mechanism, .07, 1.92, .09, .82, 3.05, .45, mats.dark, 'rod');
      label(labels, '轨道线圈', [-3.4, 1.25, .4], [-1.5, .9, .5]);
      label(labels, '局部线圈', [-.5, .25, 1.7], [.1, .8, -.4]);
      label(labels, '铝翼 · 感应转矩', [-2.6, 2.5, .6], [-1, 1.7, .1]);
      if (!caption) label(labels, '二元二位 · 原理示意', [-.1, 4.85, 0], null);
    } else {
      cylinder(magnet, .245, 3.7, -.45, .93, 0, mats.iron, 'core');
      coils.push(coil(magnet, -1.35, .93, 0, 1.25, 'coil'));
      coils.push(coil(magnet, .25, .93, 0, 1.25, 'coil'));
      box(magnet, 4.1, .18, .62, -.3, 1.82, -.2, mats.iron, 'yoke');
      box(magnet, .22, 1.05, .62, 1.64, 1.31, -.2, mats.iron, 'yoke');
      cylinder(magnet, .39, .15, -2.38, .93, 0, mats.iron, 'pole');
      armature = new T.Group(); armature.position.set(-2.55, 1.85, 0); mechanism.add(armature);
      box(armature, .13, 1.17, .76, -.03, -.55, 0, mats.iron, 'armature');
      box(armature, 3.35, .13, .76, 1.55, .12, 0, mats.iron, 'armature');
      cylinder(mechanism, .1, 1.0, -2.55, 1.85, 0, mats.brass, 'armature', 'z');
      box(armature, .65, .2, .9, 2.5, .29, 0, mats.dark, 'weight');
      rod = box(mechanism, .07, 1.9, .09, .8, 2.98, .45, mats.dark, 'rod');
      if (type === 'biased' || type === 'latching') {
        const pm = material(type === 'biased' ? 0xb46c70 : 0x916b9b, .45);
        box(magnet, .26, .72, .65, -2.72, .54, -.05, pm, 'permanent');
        box(magnet, .9, .2, .65, -2.4, .28, -.05, pm, 'permanent');
        if (type === 'latching') box(magnet, .24, .55, .65, -1.98, .48, -.05, pm, 'permanent');
        label(labels, '永久磁铁', [-3.25, .45, 1.4], [-2.6, .4, .3]);
      }
      if (type === 'rectifier') {
        box(fixed, 1.3, .34, .44, 1.72, .43, .95, material(0x304d66, .2), 'rectifier');
        cylinder(fixed, .12, .5, 1.72, .67, .95, mats.dark, 'rectifier');
        cylinder(fixed, .123, .05, 1.88, .67, .95, mats.contact, 'rectifier');
        label(labels, '整流 · 等效模块', [2.25, .3, 1.9], [1.75, .6, .95]);
      }
      label(labels, '线圈', [-1.1, .32, 1.55], [-1.25, .9, .48]);
      label(labels, '铁芯', [-2.9, .5, -.85], [-2.33, .94, 0]);
      label(labels, '衔铁', [-3.25, 2.6, .2], [-2.56, 1.5, .35]);
      label(labels, '重锤片', [-.4, 2.4, -.85], [-.05, 2.13, -.15]);
    }
    label(labels, '拉杆', [.2, 4.6, .95], [.8, 3.4, .45]);
    label(labels, '前 / 中 / 后接点', [3.6, 3.7, .9], [1.4, 3.45, .4]);
    const pathPoints = type === 'phase' ? [[-2, .6, .1], [-2, 1.65, .1], [-.9, 1.65, .1], [-.9, .8, .1], [-2, .6, .1]] : [[1.55, .93, 0], [-2.43, .93, 0], [-2.5, 1.8, 0], [1.55, 1.8, 0], [1.55, .93, 0]];
    const fieldLine = line3(field, pathPoints, C.green, .4);
    fieldLine.material.depthTest = false; fieldLine.renderOrder = 3;
    const path = new T.CatmullRomCurve3(pathPoints.map(p => new T.Vector3(...p)), true, 'catmullrom', .05);
    for (let i = 0; i < 12; i++) { const d = mesh(field, new T.SphereGeometry(.045, 8, 6), new T.MeshBasicMaterial({ color: C.green, depthTest: false }), 0, 0, 0); d.renderOrder = 4; fieldDots.push(d); }
    if (caption) label(root, caption, [0, 5.05, 0], null);
    const coverMat = new T.MeshPhysicalMaterial({ color: 0x97bace, transparent: true, opacity: .09, roughness: .15, metalness: .05, side: T.DoubleSide, depthWrite: false });
    const cover = box(root, 6.3, 4.85, 2.7, 0, 2.35, 0, coverMat, 'cover');
    const edges = new T.LineSegments(new T.EdgesGeometry(cover.geometry), new T.LineBasicMaterial({ color: 0x7497a6, transparent: true, opacity: .25 }));
    edges.position.copy(cover.position); root.add(edges);
    return {
      root, labels, field, coils, type,
      setView(s) {
        labels.visible = s.labels; cover.visible = edges.visible = s.cover;
        const e = s.explode / 100;
        magnet.position.set(0, -.1 * e, -.9 * e);
        mechanism.position.set(-.25 * e, .65 * e, .4 * e);
        contacts.position.set(.9 * e, 1.05 * e, .4 * e);
        labels.visible = s.labels && e < .45;
        field.visible = s.field && e < .3;
      },
      pose(p, result, s, time) {
        const a = Math.max(0, Math.min(1, p));
        armature.rotation.z = type === 'phase' ? -.2 + a * .36 : -.085 + a * .105;
        rod.position.y = 2.98 + a * .23;
        const theta = -.065 + a * .13;
        for (const lever of levers) lever.rotation.z = theta;
        const fc = a > .94, bc = a < .06;
        frontMats.forEach(m => { m.color.setHex(fc ? C.green : C.contact); m.emissive.setHex(fc ? 0x163d2b : 0); });
        backMats.forEach(m => { m.color.setHex(bc ? C.green : C.contact); m.emissive.setHex(bc ? 0x163d2b : 0); });
        coils.forEach((c, i) => {
          const energized = type === 'phase' && i === 1 ? result.localEnergized : result.drive;
          c.copper.emissive.setHex(energized ? 0x623412 : 0); c.copper.emissiveIntensity = .7;
        });
        fieldDots.forEach((d, i) => {
          const active = result.drive || (type === 'latching' || type === 'biased');
          d.visible = active;
          const dir = s.polarity === -1 && s.mode === 'bench' ? -1 : 1;
          const f = ((time * .12 * dir + i / fieldDots.length) % 1 + 1) % 1;
          d.position.copy(path.getPoint(f));
        });
        // shortcut: 线表示磁路拓扑，不计算场强；需要定量分析时应使用电磁场求解器。
      },
      dispose() {
        const geometries = new Set(), materials = new Set(), maps = new Set();
        root.traverse(o => { if (o.geometry) geometries.add(o.geometry); if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { materials.add(m); if (m.map) maps.add(m.map); }); } });
        geometries.forEach(g => g.dispose()); maps.forEach(t => t.dispose()); materials.forEach(m => m.dispose());
      }
    };
  }
  function createTrack() {
    const root = new T.Group(), mat = material(0x4e6170, .7), sleeper = material(0x34454e, .15), wheels = material(0x384851, .8);
    root.position.set(0, 0, -3.5);
    for (const z of [-.53, .53]) box(root, 14, .12, .1, 0, .08, z, mat, 'rail');
    for (let i = -12; i <= 12; i++) box(root, .19, .12, 1.65, i * .54, -.01, 0, sleeper, 'rail');
    const boundaries = new T.Group(); root.add(boundaries);
    for (const x of [-4.4, 4.4]) {
      for (const z of [-.53, .53]) box(boundaries, .09, .15, .13, x, .08, z, material(C.copper), 'insulation');
      line3(boundaries, [[x, .18, -1.1], [x, .18, 1.1]], 0xbba06c, .6);
    }
    const train = new T.Group(); root.add(train);
    box(train, 2.4, .8, .95, -.65, .85, 0, material(0xc4d4dc, .45), 'train');
    box(train, 2.5, .08, 1.0, -.65, 1.29, 0, material(0x365066), 'train');
    box(train, 2.42, .12, .97, -.65, .77, 0, material(C.green, .4), 'train');
    for (let i = 0; i < 5; i++) for (const z of [-.484, .484]) box(train, .27, .24, .018, -1.55 + .43 * i, 1.01, z, material(0x243c50, .3), 'train');
    for (const x of [0, -1.584]) {
      cylinder(train, .06, 1.12, x, .29, 0, wheels, 'wheel', 'z');
      for (const z of [-.53, .53]) cylinder(train, .23, .13, x, .29, z, wheels, 'wheel', 'z');
    }
    const sections = [];
    for (const z of [-.53, .53]) sections.push(box(root, 8.8, .025, .14, 0, .155, z, new T.MeshBasicMaterial({ color: C.green }), 'rail'));
    return { root, train, set(front, clear) { train.position.x = -4.4 + 8.8 * front / 100; sections.forEach(m => m.material.color.setHex(clear ? C.green : C.red)); } };
  }
  function exportGLB(group) {
    group.updateWorldMatrix(true, true);
    const doc = { asset: { version: '2.0', generator: 'Railway Relay Lab · teaching geometry, meters are schematic' }, scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], materials: [], accessors: [], bufferViews: [], buffers: [{ byteLength: 0 }] };
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
  root.RelayModel = { createRelay, createTrack, exportGLB };
})(globalThis);
