const assert = require('node:assert/strict');
const fs = require('node:fs');
const L = require('../dist/logic.js');
const J = require('../dist/journey.js');
const S = require('../dist/sources.js');
let checks = 0;
function eq(actual, expected, message) { assert.equal(actual, expected, message); checks++; }
for (const route of ['IG', '3G', 'DEP', 'SHUNT']) {
  let s = L.update(L.initial(), { mode: 'station', stationRoute: route });
  s = L.update(s, { stationTrain: 120 });
  const ids = J.layout(route).filter(d => d.controlled).map(d => d.id);
  for (const id of ids) {
    eq(s.stationHistory.sections[id].first, true, route + '/' + id + ' first');
    eq(s.stationHistory.sections[id].second, true, route + '/' + id + ' second');
    eq(s.stationHistory.sections[id].released, false, 'Moving slider cannot invent a delay');
  }
  s = L.advanceStation(s, 2.99);
  for (const id of ids) eq(s.stationHistory.sections[id].released, false);
  s = L.advanceStation(s, .02);
  for (const id of ids) { eq(s.stationHistory.sections[id].released, true); eq(s.stationHistory.sections[id].remaining, 0); }
  const events = s.stationHistory.events;
  for (const id of ids) {
    const enter = events.findIndex(e => e.kind === 'occupy' && e.label.startsWith(id + ' '));
    const clear = events.findIndex(e => e.kind === 'clear' && e.label.startsWith(id + ' '));
    const release = events.findIndex(e => e.kind === 'release' && e.label.startsWith(id + ' '));
    assert.ok(enter >= 0 && clear > enter && release > clear); checks++;
  }
}
let approach = L.update(L.initial(), { mode: 'station' });
approach = L.update(approach, { stationTrain: -10 });
approach = L.update(approach, { stationTrain: -26, cancelMode: 'zqa' });
eq(approach.stationHistory.approached, true);
eq(L.evaluate(approach).station.zqaUnlocked, false);
eq(L.evaluate(approach).station.approachLocked, true);
let s = L.update(L.initial(), { mode: 'station' });
s = L.update(s, { stationTrain: 50 });
eq(s.stationHistory.sections.IAG.second, true);
s = L.update(s, { stationTrain: 20 });
eq(s.stationHistory.reverse, true);
eq(s.signalFaultLocked, true);
s = L.advanceStation(s, 10);
eq(s.stationHistory.sections.IAG.released, false);
eq(s.stationHistory.sections['11DG'].released, false);
// A section ahead of the train keeps QJJ up when SGA is pressed.
s = L.update(s, { cancelMode: 'sga' });
eq(L.evaluate(s).station.sgaUnlocked, false);
// A scene initialized beyond a section has no fabricated passage record.
s = L.update(L.initial(), { mode: 'station', stationTrain: 115 });
eq(s.stationHistory.sections['11DG'].entered, false);
eq(L.evaluate({ ...s, cancelMode: 'sga' }).station.sgaUnlocked, false);
// A real recorded pass followed by a retained lock can be released individually.
s = L.update(L.initial(), { mode: 'station', blindFault: 'stuckSection' });
s = L.update(s, { stationTrain: 115 });
s = L.advanceStation(s, 4);
eq(s.stationHistory.sections['11DG'].released, false);
s = L.update(s, { cancelMode: 'sga' });
eq(L.evaluate(s).station.sgaUnlocked, true);
eq(s.stationHistory.sections['11DG'].released, true);
s = L.update(s, { cancelMode: 'none' });
eq(s.stationHistory.sections['11DG'].released, true);
// Interruption and restoration never complete a pending ZRA request.
s = L.update(L.initial(), { mode: 'station', stationTrain: -10 });
s = L.update(s, { cancelMode: 'zra' });
s = L.advanceStation(s, 1);
s = L.update(s, { switchFault: true });
s = L.update(s, { switchFault: false });
s = L.advanceStation(s, 10);
eq(L.evaluate(s).station.zraUnlocked, false);
assert.ok(s.stationHistory.events.some(e => e.kind === 'fault')); checks++;
let motion = L.advanceTrain(null, L.initial(), 1);
eq(motion.speed, 4);
motion = L.advanceTrain(motion, { ...L.initial(), pantograph: false }, 1);
assert.ok(motion.speed > 0 && motion.speed < 4); checks++;
motion = L.advanceTrain(motion, { ...L.initial(), trainBrake: true }, 1);
eq(motion.speed, 0);
eq(L.advanceTrain(null, { ...L.initial(), mainBreaker: false }, 1).speed, 0);
eq(L.advanceTrain({ speed: 12 }, L.initial(), 1, false).speed, 4);
eq(L.advanceTrain({ speed: 4 }, { ...L.initial(), trainBrake: true }, 1).distance, 1);
eq(L.advanceTrain(null, { ...L.initial(), slow: true }, 4).speed, 4);
const seeded = J.advance(J.move(J.create({ ...L.initial(), stationTrain: -26 }), 115, true), 3, true);
const cancelled = L.update(L.update(L.initial(), { mode: 'station' }), { cancelMode: 'zqa' });
eq(cancelled.signalFaultLocked, true);
eq(L.evaluate(L.update(cancelled, { cancelMode: 'none', signalFaultLocked: false })).station.relays.LXJ, false);
const scene = L.update(L.initial(), { mode: 'station', stationTrain: 115, stationHistory: seeded, blindFault: 'stuckSection' });
eq(scene.stationHistory.sections['11DG'].first, true);
for (const type of ['neutral', 'biased', 'latching', 'slowRelease', 'heavySlow', 'filament', 'rectifier']) {
  for (const part of ['coil', 'armature', 'rod', 'front', 'common', 'back']) {
    const b = S.partBinding(type, part);
    assert.ok(b && fs.existsSync(require('node:path').join(__dirname, '../dist', b.image))); checks++;
    assert.ok(b.rect.every(Number.isFinite)); checks++;
    assert.ok(b.rect[0] >= 0 && b.rect[1] >= 0 && b.rect[0] + b.rect[2] <= 1 && b.rect[1] + b.rect[3] <= 1); checks++;
  }
}
eq(S.partBinding('phase', 'coil'), null);
eq(L.update(L.initial(), { pantograph: false }).mainBreaker, false);
eq(L.update(L.initial(), { catenaryPower: false }).mainBreaker, false);
const html = fs.readFileSync(require('node:path').join(__dirname, '../dist/index.html'), 'utf8');
assert.ok(html.indexOf('src="journey.js') > 0 && html.indexOf('src="journey.js') < html.indexOf('src="logic.js')); checks++;

global.THREE = require('../dist/vendor/three.min.js'); global.RelaySources = S;
require('../dist/model.js');
for (const type of ['neutral', 'biased', 'latching', 'slowRelease', 'heavySlow', 'filament', 'rectifier']) {
  const m = RelayModel.createRelay(type);
  for (const pose of [0, .5, 1]) {
    m.setView({ labels: true, contactFocus: true });
    m.pose(pose, { drive: false, picked: false }, { mode: 'bench', polarity: 0 }, 0);
    eq(m.contactGroups.filter(g => g.visible).length, 1);
    eq(m.subGroups.magnet.visible, false);
  }
  m.setView({ labels: true, contactFocus: false });
  eq(m.subGroups.magnet.visible, true);
  m.dispose();
}
const track = RelayModel.createTrack();
const train = track.train;
train.setOperatingState({ pantograph: true, power: true, direction: 1, distance: 5 });
const bow = train.userData.pantograph.children.at(-1);
eq(Number(bow.position.y.toFixed(8)), 1.83);
train.setOperatingState({ pantograph: false, power: false, direction: -1, distance: 0 });
eq(bow.position.y, 1.4);
eq(train.userData.carCount, 3);
eq(train.userData.cars.length, 3);
eq(train.userData.wheelGroups.length, 6);
eq(train.userData.frontAxle, 0);
eq(train.userData.lastAxle, -3.52);
train.traverse(o => {
  if (o.isMesh) {
    const positions = o.geometry.attributes.position.array;
    assert.ok(Array.from(positions).every(Number.isFinite)); checks++;
  }
});
const station = RelayModel.createStation();
eq(Number(station.train.userData.lastAxle.toFixed(8)), Number((-16 * .115 / .82).toFixed(8)));
station.dispose();

// 验证表 3.2.2 全 33 条进路结构、别名映射、非经典进路三点解锁时序及第 2.3 节来源绑定
eq(J.ROUTES_3_2_2.length, 33);
J.ROUTES_3_2_2.forEach((rt, idx) => eq(rt.num, idx + 1));
eq(J.resolveRoute('IG').code, 'R1');
eq(J.resolveRoute('3G').code, 'R3');
eq(J.resolveRoute('DEP').code, 'R5');
eq(J.resolveRoute('SHUNT').code, 'R17');
for (const rtCode of ['R2', 'R9', 'R14', 'R18', 'R27']) {
  const defs = J.layout(rtCode);
  const ctrls = defs.filter(d => d.controlled);
  assert.ok(ctrls.length >= 1, `${rtCode} should define controlled sections`); checks++;
  let hj = J.create({ stationRoute: rtCode, stationStage: 5, stationTrain: -26 });
  for (let p = -20; p <= 125; p += 8) {
    hj = J.move(hj, p, false);
    hj = J.advance(hj, 4, false);
  }
  assert.ok(ctrls.every(d => hj.sections[d.id].released), `${rtCode} all controlled sections released after exit`); checks++;
}
for (const [sigType, sigSpec] of Object.entries(S.signalModels)) {
  assert.ok(sigSpec.variants.length >= 2 && sigSpec.figures.length >= 2); checks++;
  const b = S.signalPartBinding(sigType, 'lens');
  assert.ok(b && b.page === 26 && fs.existsSync(require('node:path').join(__dirname, '../dist', b.image))); checks++;
}
const bShuntFil = S.signalPartBinding('shuntSig', 'filament');
assert.ok(bShuntFil && bShuntFil.page === 75 && fs.existsSync(require('node:path').join(__dirname, '../dist', bShuntFil.image))); checks++;
for (const fk of ['2-4-4', '5-1-4', '5-2-2', '6-3-1', '7-2-1', '7-9-1', '7-9-3', '7-10-1', '8-3-2', '13-2-2']) {
  assert.ok(S.figures[fk] && fs.existsSync(require('node:path').join(__dirname, '../dist/textbook', `fig-${fk}.jpg`))); checks++;
}
console.log(`通过 ${checks} 项运行历史、三点时序、表3.2.2全33条进路、第2.3/2.4/5.1/5.2/6.3/7/8.3/13.2节来源、接点隔离、受电弓及列车几何检查`);
