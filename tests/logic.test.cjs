const assert = require('node:assert/strict');
const L = require('../dist/logic.js');
let checks = 0;
function check(s, picked) {
  const r = L.evaluate({ ...L.initial(), ...s });
  assert.equal(r.picked, picked, JSON.stringify(s));
  assert.equal(r.frontClosed, picked);
  assert.equal(r.backClosed, !picked);
  checks += 3;
}
for (const type of ['contacts', 'neutral', 'rectifier']) {
  for (const polarity of [-1, 0, 1]) check({ type, polarity }, polarity !== 0);
}
for (const polarity of [-1, 0, 1]) check({ type: 'biased', polarity }, polarity === 1);
let s = L.initial();
s = L.update(s, { type: 'latching', polarity: 1 });
s = L.update(s, { polarity: 0 });
assert.equal(L.evaluate(s).picked, true); checks++;
s = L.update(s, { polarity: -1 });
s = L.update(s, { polarity: 0 });
assert.equal(L.evaluate(s).picked, false); checks++;
for (const localPower of [true, false]) for (const frequency of ['correct', 'wrong']) for (const phase of ['correct', 'reversed', 'wrong']) {
  check({ type: 'phase', polarity: 1, localPower, frequency, phase }, localPower && frequency === 'correct' && phase === 'correct');
}
for (const type of ['rectifier', 'phase']) {
  for (const front of [-25, -0.01, 0, 50, 100, 118, 118.01, 145]) {
    check({ type, mode: 'track', front }, !L.occupied(front));
  }
  for (const patch of [{ power: false }, { railBreak: true }, { receiverBreak: true }]) {
    check({ type, mode: 'track', ...patch }, false);
  }
}
check({ type: 'rectifier', mode: 'track', multi: true, branchOccupied: true }, false);
check({ type: 'rectifier', mode: 'track', multi: true, branchOccupied: false }, true);
const interlocked = L.evaluate({ ...L.initial(), type: 'rectifier', mode: 'track', multi: true, branchOccupied: true });
assert.equal(interlocked.receiverAvailable, true); checks++;
assert.equal(interlocked.drive, false); checks++;
check({ type: 'phase', mode: 'track', localPower: false }, false);
check({ type: 'phase', mode: 'track', phase: 'reversed' }, false);
assert.throws(() => L.evaluate({ ...L.initial(), mode: 'track' })); checks++;
assert.throws(() => L.update(L.initial(), { polarity: 2 })); checks++;
assert.throws(() => L.update(L.initial(), { front: NaN })); checks++;
console.log(`通过 ${checks} 项状态与接点断言（含占用边界、故障、极性保持及相敏条件）`);
