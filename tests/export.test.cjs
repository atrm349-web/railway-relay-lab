const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
global.THREE = require('../dist/vendor/three.min.js');
global.RelaySources = require('../dist/sources.js');
const L = require('../dist/logic.js');
require('../dist/model.js');
let checked = 0;

function validate(buffer) {
  const bytes = Buffer.from(buffer);
  assert.equal(bytes.readUInt32LE(0), 0x46546c67);
  assert.equal(bytes.readUInt32LE(4), 2);
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  const jsonSize = bytes.readUInt32LE(12);
  assert.equal(bytes.readUInt32LE(16), 0x4e4f534a);
  const doc = JSON.parse(bytes.subarray(20, 20 + jsonSize).toString());
  const binaryStart = 20 + jsonSize;
  assert.equal(bytes.readUInt32LE(binaryStart + 4), 0x004e4942);
  const binSize = bytes.readUInt32LE(binaryStart);
  assert.equal(doc.buffers[0].byteLength, binSize);
  assert.equal(bytes.length, binaryStart + 8 + binSize);
  assert.ok(doc.meshes.length > 40);
  assert.equal(doc.nodes.length, doc.meshes.length);
  for (const bv of doc.bufferViews) {
    assert.equal(bv.byteOffset % 4, 0);
    assert.ok(bv.byteOffset + bv.byteLength <= binSize);
  }
  for (const a of doc.accessors) {
    const bv = doc.bufferViews[a.bufferView];
    assert.equal(bv.byteLength, a.count * (a.type === 'VEC3' ? 3 : 1) * 4);
    if (a.min) for (let i = 0; i < 3; i++) { assert.ok(Number.isFinite(a.min[i])); assert.ok(a.min[i] <= a.max[i]); }
  }
  for (const mesh of doc.meshes) for (const p of mesh.primitives) {
    assert.ok(doc.materials[p.material]);
    const position = doc.accessors[p.attributes.POSITION];
    if (p.indices !== undefined) {
      const indices = doc.accessors[p.indices], bv = doc.bufferViews[indices.bufferView];
      for (let i = 0; i < indices.count; i++) assert.ok(bytes.readUInt32LE(binaryStart + 8 + bv.byteOffset + i * 4) < position.count);
    }
  }
  checked++;
  return doc.meshes.length;
}

function groupBox(grp) {
  const b = new THREE.Box3();
  grp.traverse(o => { if (o.isMesh) b.expandByObject(o); });
  return b;
}

const output = path.resolve(__dirname, '../outputs/models'); fs.mkdirSync(output, { recursive: true });
const relaySpecs = [
  ['neutral', 8, 8],
  ['slowRelease', 8, 8],
  ['heavySlow', 4, 4],     // 2QJ + 2H + 2QH => 4组前接点，4组后接点
  ['differential', 4, 2],  // 2QH + 2Q => 4组前接点，2组后接点
  ['biased', 8, 8],
  ['latching', 4, 4],
  ['rectifier', 6, 4],
  ['filament', 4, 4],
  ['timeRelay', 4, 4]
];

for (const [type, frontCount, backCount] of relaySpecs) {
  const model = RelayModel.createRelay(type);
  const fronts = new Set(), backs = new Set();
  model.root.traverse(o => {
    if (o.userData.contactGroup) {
      if (o.userData.part === 'front') fronts.add(o.userData.contactGroup);
      if (o.userData.part === 'back') backs.add(o.userData.contactGroup);
    }
  });
  assert.equal(fronts.size, frontCount, `${type} 前／定位接点组数须匹配教材表4.1.4`);
  assert.equal(backs.size, backCount, `${type} 后／反位接点组数须匹配教材表4.1.4`);

  // 验证拆解 100% 时：1) 标注全部可见；2) 5 大子组件(fixed/backplate/magnet/mechanism/contacts)三维包围盒两两互不相交（零穿模）！
  model.setView({ labels: true, cover: false, explode: 100, field: true });
  model.pose(0, { picked: false, drive: false, localEnergized: false }, { mode: 'bench', polarity: 0 }, 0);
  model.root.updateMatrixWorld(true);
  const subEntries = Object.entries(model.subGroups).map(([name, grp]) => [name, groupBox(grp)]);
  for (const [name, box] of subEntries) {
    assert.ok(box.min.y >= -0.26, `${type} 拆解100%时 ${name} 严禁穿入地平面(-0.25)，实测 min.y=${box.min.y.toFixed(3)}`);
  }
  for (let i = 0; i < subEntries.length; i++) {
    for (let j = i + 1; j < subEntries.length; j++) {
      const [n1, b1] = subEntries[i], [n2, b2] = subEntries[j];
      assert.equal(b1.intersectsBox(b2), false, `${type} 拆解100%时 ${n1} 与 ${n2} 包围盒严禁穿模相交`);
    }
  }

  for (const picked of [false, true]) {
    model.setView({ labels: true, cover: false, explode: 0, field: true });
    model.pose(Number(picked), { picked, drive: picked, localEnergized: true }, { mode: 'bench', polarity: picked ? 1 : 0 }, 0);
    model.root.updateMatrixWorld(true);

    let yokeTop = -Infinity, armHorizontalBottom = Infinity;
    model.root.traverse(o => {
      if (!o.isMesh) return;
      const b = new THREE.Box3().setFromObject(o);
      if ((o.userData.part === 'yoke' || o.userData.part === 'permanent') && b.max.x > -2.2) {
        yokeTop = Math.max(yokeTop, b.max.y);
      }
      if ((o.userData.part === 'armature' || o.userData.part === 'weight') && b.max.x > -1.8 && b.min.y > 1.2) {
        armHorizontalBottom = Math.min(armHorizontalBottom, b.min.y);
      }
    });
    assert.ok(armHorizontalBottom > yokeTop, `${type} (${picked ? 'picked' : 'dropped'}) 衔铁/重锤底面须高于轭铁/永磁顶面`);

    const buffer = RelayModel.exportGLB(model.root), meshCount = validate(buffer);
    const modelId = RelaySources.models[type].model.split('（')[0].replaceAll('/', '-');
    fs.writeFileSync(path.join(output, `${modelId}-${picked ? 'picked' : 'dropped'}.glb`), Buffer.from(buffer));
    console.log(`${type} (${modelId}) ${picked ? '吸起/定位' : '落下/反位'}：${meshCount} 网格，${buffer.byteLength} 字节，100%拆解零穿模通过`);
  }
  model.dispose();
}

const phase = RelayModel.createRelay('phase');
assert.equal(phase.physical, false);
assert.equal(phase.root.name, 'textbook-interface-only');
phase.dispose();

const selfHoldModel = RelayModel.createRelay('selfHold');
assert.equal(selfHoldModel.physical, false);
for (const btn of [false, true]) {
  const shState = L.update(L.initial(), { type: 'selfHold', shButton: btn, explode: 50 });
  const shRes = L.evaluate(shState);
  selfHoldModel.setView(shState);
  selfHoldModel.pose(Number(shRes.picked), shRes, shState, .5);
}
selfHoldModel.dispose();

const turnoutModel = RelayModel.createRelay('turnoutLab');
assert.equal(turnoutModel.physical, false);
for (const stg of [0, 1, 2, 3, 4]) {
  const toState = L.update(L.initial(), { type: 'turnoutLab', toStage: stg, toObstacle: stg === 3, explode: 40 });
  const toRes = L.evaluate(toState);
  turnoutModel.setView(toState);
  turnoutModel.pose(Number(toRes.picked), toRes, toState, .8);
}
turnoutModel.dispose();

// 验证第 2.3 节全部 6 类 13 种信号机机构（a/b/c）100% 拆解零穿模 + 有效 GLB 导出
const Sources = require('../dist/sources.js');
let signalChecked = 0;
for (const [sigType, sigSpec] of Object.entries(Sources.signalModels)) {
  for (const variant of sigSpec.variants) {
    const sm = RelayModel.createSignal(sigType, variant);
    const sigZeroState = L.update(L.initial(), { mode: 'signal', signalType: sigType, signalVariant: variant, signalAspect: Object.keys(L.SIGNAL_ASPECTS[sigType]).at(-1), signalIndicator: 'right', explode: 0 });
    sm.setView(sigZeroState);
    sm.pose(1, L.evaluate(sigZeroState), sigZeroState, 0);
    sm.root.updateMatrixWorld(true);
    const fullSigBox = new THREE.Box3().setFromObject(sm.root);
    assert.ok(fullSigBox.min.y >= -0.25, `${sigType}.${variant} foundation must sit strictly above floor (-0.25), got min.y=${fullSigBox.min.y}`);
    const sigState = L.update(L.initial(), { mode: 'signal', signalType: sigType, signalVariant: variant, signalAspect: Object.keys(L.SIGNAL_ASPECTS[sigType]).at(-1), signalIndicator: 'right', explode: 100 });
    const sigRes = L.evaluate(sigState);
    sm.setView(sigState);
    sm.pose(1, sigRes, sigState, 0);
    sm.root.updateMatrixWorld(true);
    const partBoxes = [];
    for (const [partName, grp] of Object.entries(sm.subGroups)) {
      if (!grp || !grp.visible) continue;
      const box = new THREE.Box3();
      grp.traverseVisible(m => { if (m.isMesh) box.expandByObject(m); });
      if (!box.isEmpty()) partBoxes.push([partName, box]);
    }
    assert.ok(partBoxes.length >= 6, `${sigType}.${variant} should expose at least 6 subGroups`);
    for (const [partName, box] of partBoxes) {
      assert.ok(box.min.y >= -0.25, `${sigType}.${variant} 拆解100%时 ${partName} 严禁穿入地平面(-0.25)，实测 min.y=${box.min.y.toFixed(3)}`);
    }
    for (let i = 0; i < partBoxes.length; i++) {
      for (let j = i + 1; j < partBoxes.length; j++) {
        assert.ok(!partBoxes[i][1].intersectsBox(partBoxes[j][1]), `${sigType}.${variant} exploded parts collide: ${partBoxes[i][0]} vs ${partBoxes[j][0]}`);
      }
    }
    const buf = RelayModel.exportGLB(sm.root);
    const meshes = validate(buf);
    assert.ok(meshes >= 20 && buf.byteLength > 10000, `${sigType}.${variant} GLB export too small`);
    sm.dispose();
    signalChecked++;
    checked++;
  }
}

// 验证 3D 车站全作业联锁沙盘创建与全阶段姿态更新（覆盖图3.1.1 / 表3.2.2 全33条进路）
const station = RelayModel.createStation();
for (const route of ['IG', '3G', 'DEP', 'SHUNT', 'R2', 'R9', 'R14', 'R18', 'R20', 'R27', 'R33']) {
  for (const stage of [0, 3, 4, 5]) {
    for (const trainPos of [-26, -8, 12, 40, 70, 95, 118]) {
      const stState = { ...L.initial(), mode: 'station', stationRoute: route, stationStage: stage, stationTrain: trainPos };
      const stRes = L.evaluate(stState);
      station.setView(stState);
      station.pose(Number(stRes.picked), stRes, stState, 0);
    }
  }
}
const sgaState = { ...L.initial(), mode: 'station', stationRoute: 'IG', stationStage: 5, stationTrain: 115, cancelMode: 'sga', blindFault: 'stuckSection' };
station.setView(sgaState);
station.pose(0, L.evaluate(sgaState), sgaState, 0);
assert.equal(station.trainB.visible, false, 'single-train mode hides trainB');
const mtState = { ...L.initial(), mode: 'station', multiTrainMode: 'parallel_rec_dep', stationRoute: 'R1', secondRoute: 'R14', stationStage: 5, stationTrain: 20, secondTrain: 30 };
station.pose(1, L.evaluate(mtState), mtState, 0.5);
assert.equal(station.trainB.visible, true, 'multi-train mode shows 3D trainB');
assert.ok(Number.isFinite(station.trainB.position.x) && Number.isFinite(station.trainB.position.z));

// 校验绝缘隔离平行调车、股道占车(HB引导/调连)与抵触排队全过程两车 3D 包围盒严禁穿模碰撞
const checkNoTrainCollision = (label, patch) => {
  const st = { ...L.initial(), mode: 'station', stationStage: 5, ...patch };
  station.pose(1, L.evaluate(st), st, 0.5);
  station.root.updateMatrixWorld(true);
  const boxA = new THREE.Box3().setFromObject(station.train);
  const boxB = new THREE.Box3().setFromObject(station.trainB);
  assert.equal(boxA.intersectsBox(boxB), false, `${label}: trainA [${boxA.min.x.toFixed(2)}..${boxA.max.x.toFixed(2)}, z:${boxA.min.z.toFixed(2)}..${boxA.max.z.toFixed(2)}] collided with trainB [${boxB.min.x.toFixed(2)}..${boxB.max.x.toFixed(2)}, z:${boxB.min.z.toFixed(2)}..${boxB.max.z.toFixed(2)}]`);
};
for (const pA of [-20, 0, 15, 30, 50, 75, 95, 105]) {
  for (const pB of [-20, 0, 15, 30, 50, 75, 95, 105]) {
    checkNoTrainCollision(`parallel_shunt@${pA},${pB}`, { multiTrainMode: 'parallel_shunt', stationRoute: 'R18', secondRoute: 'R24', stationTrain: pA, secondTrain: pB });
  }
}
// 专项防穿越瞬移回归：在 ③ 绝缘隔离平行调车中仅拖动一号车滑块 (-20→105) 且二号车停在 D₇ 前 (-20) 时，一号车必须严格单调平滑沿 (1/3)→3DG→5-9DG(Z2) 运行，严禁任何跳变穿越！
let prevShuntX = null, fixedBX = null;
for (let pA = -20; pA <= 105; pA += 1) {
  const st = { ...L.initial(), mode: 'station', stationStage: 5, multiTrainMode: 'parallel_shunt', stationRoute: 'R18', secondRoute: 'R24', stationTrain: pA, secondTrain: -20 };
  station.pose(1, L.evaluate(st), st, 0.5);
  const ax = station.train.position.x, az = station.train.position.z, bx = station.trainB.position.x;
  if (prevShuntX !== null) {
    const dx = ax - prevShuntX;
    assert.ok(dx > 0 && dx < 0.35, `parallel_shunt@${pA}: sudden jump/teleport detected (dx=${dx.toFixed(3)})`);
  }
  if (fixedBX !== null) {
    assert.ok(Math.abs(bx - fixedBX) < 1e-4, `parallel_shunt@${pA}: parked trainB moved unexpectedly (${fixedBX.toFixed(2)} -> ${bx.toFixed(2)})`);
  }
  if (pA >= 52) {
    assert.ok(Math.abs(az - station.debugTrack.Z2) < 1e-3, `parallel_shunt@${pA}: R18 must stay on Z2 after 1/3, got z=${az.toFixed(3)}`);
  }
  prevShuntX = ax;
  fixedBX = bx;
}
for (const pA of [75, 86, 98, 102, 115]) {
  checkNoTrainCollision(`track_occupied_R1@${pA}`, { multiTrainMode: 'track_occupied', stationRoute: 'R1', secondRoute: 'R1', stationTrain: pA, secondTrain: 126, guideMode: true });
}
for (const pA of [0, 45, 85, 96, 105]) {
  checkNoTrainCollision(`track_occupied_R24@${pA}`, { multiTrainMode: 'track_occupied', stationRoute: 'R24', secondRoute: 'R1', stationTrain: pA, secondTrain: 126 });
}
checkNoTrainCollision('conflict_queue_end', { multiTrainMode: 'conflict_queue', stationRoute: 'R1', secondRoute: 'R20', stationTrain: 130, secondTrain: 105 });

// Codex Item 5 专项连续采样：排队状态 A@75 时 B 从 70.0..105.0 (含临界 78.8→79.0) 严禁越过 A 或瞬移；释放后从实际候车位 -12 连续平滑跟进且永不越过 A！
let prevQueueBX = null;
for (let pB = 70.0; pB <= 105.01; pB = Number((pB + 0.2).toFixed(1))) {
  const stQ = { ...L.initial(), mode: 'station', stationStage: 5, multiTrainMode: 'conflict_queue', stationRoute: 'R1', secondRoute: 'R20', stationTrain: 75, secondTrain: pB };
  const evQ = L.evaluate(stQ);
  station.pose(1, evQ, stQ, 0.5);
  station.root.updateMatrixWorld(true);
  const xA = station.train.position.x, xB = station.trainB.position.x;
  assert.ok(xB < xA - 4.9, `conflict_queue@75,${pB}: rear B (${xB.toFixed(2)}) must stay strictly behind A (${xA.toFixed(2)})`);
  if (prevQueueBX !== null) {
    assert.ok(Math.abs(xB - prevQueueBX) < 0.05, `conflict_queue@75,${pB}: sudden B jump (${prevQueueBX.toFixed(2)} -> ${xB.toFixed(2)})`);
  }
  prevQueueBX = xB;
  const boxA = new THREE.Box3().setFromObject(station.train);
  const boxB = new THREE.Box3().setFromObject(station.trainB);
  assert.equal(boxA.intersectsBox(boxB), false, `conflict_queue@75,${pB} 3D collision`);
}
for (const fixedA of [115, 130]) {
  let prevRecX = null;
  for (let pB = -12; pB <= 105; pB += 1) {
    const stR = { ...L.initial(), mode: 'station', stationStage: 5, multiTrainMode: 'conflict_queue', stationRoute: 'R1', secondRoute: 'R20', stationTrain: fixedA, secondTrain: pB };
    const evR = L.evaluate(stR);
    station.pose(1, evR, stR, 0.5);
    station.root.updateMatrixWorld(true);
    const xA = station.train.position.x, xB = station.trainB.position.x;
    if (Math.abs(station.train.position.z - station.trainB.position.z) < 0.55) {
      assert.ok(xB <= xA - 4.9, `conflict_queue_recover@${fixedA},${pB}: B (${xB.toFixed(2)}) overtook A (${xA.toFixed(2)})`);
    }
    if (prevRecX !== null) {
      const dx = xB - prevRecX;
      assert.ok(dx >= -1e-4 && dx < 0.45, `conflict_queue_recover@${fixedA},${pB}: non-monotonic/teleport step dx=${dx.toFixed(3)}`);
    }
    prevRecX = xB;
    const boxA = new THREE.Box3().setFromObject(station.train);
    const boxB = new THREE.Box3().setFromObject(station.trainB);
    assert.equal(boxA.intersectsBox(boxB), false, `conflict_queue_recover@${fixedA},${pB} 3D collision`);
  }
}
// 股道占车单调防越过连续采样：A 从 70..130 严禁穿越驻停于 126 的 B
let prevOccAX = null;
for (let pA = 70; pA <= 130; pA += 1) {
  const stO = { ...L.initial(), mode: 'station', stationStage: 5, multiTrainMode: 'track_occupied', stationRoute: 'R1', secondRoute: 'R1', stationTrain: pA, secondTrain: 126, guideMode: true };
  station.pose(1, L.evaluate(stO), stO, 0.5);
  const xA = station.train.position.x, xB = station.trainB.position.x;
  assert.ok(xA <= xB - 4.9, `track_occupied@${pA}: A (${xA.toFixed(2)}) overtook parked B (${xB.toFixed(2)})`);
  if (prevOccAX !== null) {
    assert.ok(xA - prevOccAX >= -1e-4 && xA - prevOccAX < 0.45, `track_occupied@${pA}: jump dx=${(xA - prevOccAX).toFixed(3)}`);
  }
  prevOccAX = xA;
}

// 校验 3 节编组动车组结构及股道占车切换 IG 正线发车时不重复渲染叠加二号车 B
assert.equal(station.train.userData.carCount, 3, 'station train must be 3-car EMU');
assert.equal(station.train.userData.cars.length, 3, 'station train must expose 3 car groups');
assert.equal(station.trainB.userData.carCount, 3, 'station trainB must be 3-car EMU');
const depOccState = { ...L.initial(), mode: 'station', multiTrainMode: 'track_occupied', stationRoute: 'DEP', stationStage: 5, stationTrain: -26, secondTrain: 126 };
station.pose(1, L.evaluate(depOccState), depOccState, 0.5);
assert.equal(station.trainB.visible, false, 'track_occupied + DEP (IG departure) must hide duplicate trainB so no two trains fuse on IG');

// 严格几何审计：表 3.2.2 全 33 条进路每条曲线段必须与 4 组实体 3D 道岔首尾重合、严禁越轨斜穿道床、严禁调头翻转、3 节编组相邻车厢折角 ≤ 20°
const dt = station.debugTrack;
const J = require('../dist/journey.js');
const physicalTurnouts = Object.values(dt.turnouts);
const matchesTurnout = (a, b) => physicalTurnouts.some(t =>
  (Math.abs(a.x - t.x0) < 1e-3 && Math.abs(a.z - t.z0) < 1e-3 && Math.abs(b.x - t.x1) < 1e-3 && Math.abs(b.z - t.z1) < 1e-3) ||
  (Math.abs(a.x - t.x1) < 1e-3 && Math.abs(a.z - t.z1) < 1e-3 && Math.abs(b.x - t.x0) < 1e-3 && Math.abs(b.z - t.z0) < 1e-3)
);
const onPhysicalTrack = (x, z) => {
  if (Math.abs(z - dt.Z1) < 2e-3 || Math.abs(z - dt.Z2) < 2e-3) return true;
  if ((Math.abs(z - dt.Z3) < 2e-3 || Math.abs(z - dt.Z4) < 2e-3) && x >= 3.9 && x <= 15.5) return true;
  for (const t of physicalTurnouts) {
    const minX = Math.min(t.x0, t.x1) - 1e-3, maxX = Math.max(t.x0, t.x1) + 1e-3;
    if (x >= minX && x <= maxX) {
      const u = (x - t.x0) / (t.x1 - t.x0);
      const tz = t.z0 + (t.z1 - t.z0) * dt.turnoutEase(u);
      if (Math.abs(z - tz) < 3e-3) return true;
    }
  }
  return false;
};
const normAng = a => Math.atan2(Math.sin(a), Math.cos(a));
for (const rt of J.ROUTES_3_2_2) {
  const wps = dt.routeWaypoints(rt.code);
  const dirSign = Math.sign(wps[1].x - wps[0].x);
  assert.ok(dirSign === 1 || dirSign === -1, `${rt.code} invalid initial direction`);
  for (let i = 0; i < wps.length - 1; i++) {
    const a = wps[i], b = wps[i + 1];
    assert.ok(b.p > a.p, `${rt.code} waypoint p must increase (${a.p} -> ${b.p})`);
    assert.ok(Math.sign(b.x - a.x) === dirSign && Math.abs(b.x - a.x) > 0.05, `${rt.code} seg ${i} x direction reversal/stall (${a.x} -> ${b.x})`);
    if (Math.abs(b.z - a.z) > 1e-3) {
      assert.ok(matchesTurnout(a, b), `${rt.code} curved seg ${i} (${a.x},${a.z.toFixed(2)})->(${b.x},${b.z.toFixed(2)}) does not lie on any physical 3D turnout!`);
    }
  }
  const maxP = rt.kind === 'shunt' ? 105 : 125;
  let prevYaw = null;
  for (let p = -26; p <= maxP; p += 2) {
    const pt = dt.trackCoords(p, rt.code);
    assert.ok(onPhysicalTrack(pt.x, pt.z), `${rt.code}@${p}: (${pt.x.toFixed(2)}, ${pt.z.toFixed(2)}) off physical track!`);
    if (prevYaw !== null) {
      const dYaw = Math.abs(normAng(pt.yaw - prevYaw));
      assert.ok(dYaw < 0.25, `${rt.code}@${p}: sudden yaw jump ${(dYaw * 180 / Math.PI).toFixed(1)}°`);
    }
    prevYaw = pt.yaw;
    station.train.placeOnSpline(posVal => dt.trackCoords(posVal, rt.code), p);
    const [c1, c2, c3] = station.train.userData.cars;
    const bend12 = Math.abs(normAng(c1.rotation.y - c2.rotation.y)) * 180 / Math.PI;
    const bend23 = Math.abs(normAng(c2.rotation.y - c3.rotation.y)) * 180 / Math.PI;
    assert.ok(bend12 <= 20 && bend23 <= 20, `${rt.code}@${p}: 3-car bend angles (${bend12.toFixed(1)}°, ${bend23.toFixed(1)}°) exceed 20°!`);
  }
}
// 验证车站沙盘 0% 与 100% 拆解均严格位于地平面 (-0.25) 之上
for (const exp of [0, 100]) {
  station.setView({ ...L.initial(), mode: 'station', explode: exp });
  station.root.updateMatrixWorld(true);
  const sb = new THREE.Box3().setFromObject(station.root);
  assert.ok(sb.min.y >= -0.25, `station explode=${exp}% 严禁穿入地平面(-0.25)，实测 min.y=${sb.min.y.toFixed(3)}`);
}
station.dispose();

// 全量防穿地审计：覆盖全部 15 类继电器/接口/专题实验台（含轨道电路分路场景下的整流式与25Hz相敏GJ），检验 0% 与 100% 拆解严格高于地平面 (-0.25)
const assertAboveFloor = (tag, obj) => {
  obj.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(obj);
  assert.ok(b.min.y >= -0.25, `${tag} 严禁穿入地平面(-0.25)，实测 min.y=${b.min.y.toFixed(3)}`);
};
for (const rType of L.TYPES) {
  const m = RelayModel.createRelay(rType);
  for (const exp of [0, 100]) {
    const st = { ...L.initial(), mode: 'bench', type: rType, explode: exp };
    m.setView(st);
    const res = L.evaluate(st);
    m.pose(Number(res.picked), res, st, 0.5);
    assertAboveFloor(`${rType}@bench(explode=${exp}%)`, m.root);
  }
  if (rType === 'rectifier' || rType === 'phase') {
    m.root.position.set(1, 0.02, 1.2);
    m.root.scale.setScalar(0.82);
    for (const exp of [0, 100]) {
      m.setView({ ...L.initial(), mode: 'track', type: rType, explode: exp });
      assertAboveFloor(`${rType}@track(explode=${exp}%)`, m.root);
    }
  }
  m.dispose();
}
const trk = RelayModel.createTrack();
assert.equal(trk.train.userData.carCount, 3, '轨道电路分路模拟列车须为3节编组');
for (const fPos of [-25, -20, 0, 50, 100, 140, 165]) {
  trk.set(fPos, !L.occupied(fPos), { pantograph: true, catenaryPower: true });
  assertAboveFloor(`track-bed@front=${fPos}`, trk.root);
  trk.root.updateMatrixWorld(true);
  const tb = new THREE.Box3().setFromObject(trk.train);
  assert.ok(tb.min.x >= -13.05 && tb.max.x <= 13.05, `3节轨道列车在 front=${fPos} 越出钢轨范围 [${tb.min.x.toFixed(2)}, ${tb.max.x.toFixed(2)}]`);
  assert.ok(tb.max.z < -2.0, `3节轨道列车在 front=${fPos} 侵入前景继电器区域 z=${tb.max.z.toFixed(2)}`);
}

// 验证五线制道岔与 CBI 安全 I/O 3D 联动模型创建与姿态驱动
for (const [labType, states] of [
  ['fiveWireLab', [{ fwStage: 0 }, { fwStage: 3, fwPhaseLoss: false }, { fwStage: 3, fwPhaseLoss: true }, { fwStage: 4 }]],
  ['cbiIoLab', [{ cbiMode: 'pulseTrans', cbiCmd: true, cbiFault: 'none' }, { cbiMode: 'pulseTrans', cbiCmd: true, cbiFault: 'stuckHigh' }, { cbiMode: 'capPump', cbiCmd: true, cbiFault: 'stuckHigh' }]]
]) {
  const m = RelayModel.createRelay(labType);
  assert.ok(m.root && m.root.children.length > 0, `${labType} should create 3D meshes`);
  for (const patch of states) {
    const st = { ...L.initial(), mode: 'bench', type: labType, ...patch };
    const res = L.evaluate(st);
    m.setView(st);
    m.pose(Number(res.picked), res, st, 0.5);
  }
  m.dispose();
  checked++;
}

// 验证全书 277 页原书 JPG 与全部 figs 图摘录均存在且非空
const tbDir = path.join(__dirname, '..', 'dist', 'textbook');
for (let p = 1; p <= 277; p++) {
  const fp = path.join(tbDir, `page-${String(p).padStart(3, '0')}.jpg`);
  assert.ok(fs.existsSync(fp) && fs.statSync(fp).size > 1000, `Missing textbook page ${p}`);
}
for (const figId of Object.keys(Sources.figures)) {
  const fp = path.join(tbDir, `fig-${figId}.jpg`);
  assert.ok(fs.existsSync(fp) && fs.statSync(fp).size > 1000, `Missing figure ${figId}`);
}

console.log(`通过 ${checked} 份 3D 模型/导出检查（含 ${signalChecked} 种第2.3节信号机机构）、9类实体继电器 100% 拆解零穿模、全33条表3.2.2进路联锁沙盘与 277 页教材图库完整性验证。`);
