const assert = require('node:assert/strict');
const L = require('../dist/logic.js');
let checks = 0;
function eq(actual, expected) { assert.equal(actual, expected); checks++; }
function station(patch) { return { ...L.initial(), mode: 'station', ...patch }; }

for (const [route, seconds] of [['IG', 180], ['3G', 180], ['DEP', 180], ['R6', 180], ['R13', 180], ['R14', 180], ['R7', 30], ['R8', 30], ['R15', 30], ['R16', 30], ['SHUNT', 30]]) {
  for (const position of [0, 20, 40, 70]) {
    const st = L.evaluate(station({ stationRoute: route, stationTrain: position, cancelMode: 'zra', zraProgress: 1 })).station;
    eq(st.zraUnlocked, false);
    eq(st.manualUnlocked, false);
  }
  let s = L.update(station({ stationRoute: route, stationTrain: -10 }), { cancelMode: 'zra' });
  eq(L.evaluate(s).station.zraSeconds, seconds);
  s = L.advanceStation(s, seconds / 60 - .01);
  eq(L.evaluate(s).station.zraUnlocked, false);
  s = L.advanceStation(s, .02);
  eq(L.evaluate(s).station.zraUnlocked, true);
  s = L.update(s, { stationTrain: 0 });
  eq(s.zraProgress, 0);
  eq(s.zraInterrupted, true);
  s = L.update(s, { stationTrain: -10 });
  s = L.advanceStation(s, 100);
  eq(L.evaluate(s).station.zraUnlocked, false);
  s = L.update(s, { cancelMode: 'none' });
  s = L.update(s, { cancelMode: 'zra' });
  s = L.advanceStation(s, seconds / 60 + .01);
  eq(L.evaluate(s).station.zraUnlocked, true);
}

let s = station({ stationTrain: -10, cancelMode: 'zra', zraProgress: .5 });
s = L.update(s, { switchFault: true });
eq(s.zraProgress, 0);
s = L.update(s, { switchFault: false });
s = L.advanceStation(s, 10);
eq(L.evaluate(s).station.zraUnlocked, false);
s = L.update(s, { stationRoute: 'SHUNT' });
eq(s.zraProgress, 0);
eq(s.zraInterrupted, false);
eq(L.evaluate(station({ stationTrain: -26, cancelMode: 'zra' })).station.zraUnlocked, true);
eq(L.evaluate(station({ stationTrain: -26, cancelMode: 'zqa', switchFault: true })).station.zqaUnlocked, false);

// Forward QJJ blocks SGA even when a retained-lock exercise has been injected.
let st = L.evaluate(station({ stationTrain: 40, cancelMode: 'sga', blindFault: 'stuckSection' })).station;
eq(st.sgaQjj, true);
eq(st.sgaUnlocked, false);
eq(st.dg1Unlocked, false);
eq(st.dg11Unlocked, false);
st = L.evaluate(station({ stationTrain: 115, cancelMode: 'sga', blindFault: 'stuckSection' })).station;
eq(st.sgaUnlocked, true);
eq(st.dg11Unlocked, true);
eq(st.manualUnlocked, false);
st = L.evaluate(station({ stationRoute: 'DEP', stationTrain: 50, cancelMode: 'sga' })).station;
eq(st.occ1DG, true);
eq(st.dg11Unlocked, true);
eq(st.dg1Unlocked, false);
eq(st.iagUnlocked, false);
st = L.evaluate(station({ stationRoute: 'SHUNT', stationTrain: 75, cancelMode: 'sga' })).station;
eq(st.sgaTarget, '1DG');
eq(st.occ11DG, true);
eq(st.dg1Unlocked, true);
eq(st.dg11Unlocked, false);

for (const [type, hold] of Object.entries(L.HOLD_SECONDS)) {
  for (const slow of [false, true]) {
    const factor = slow ? 4 : 1;
    const on = { ...L.initial(), type, polarity: 1, slow };
    const off = { ...on, polarity: 0 };
    let t = L.advanceRelay(null, on, 1);
    eq(t.picked, true);
    t = L.advanceRelay(t, off, (hold - .01) * factor);
    eq(t.picked, true);
    eq(t.held, true);
    t = L.advanceRelay(t, off, .02 * factor);
    eq(t.picked, false);
    t = L.advanceRelay(t, on, 0);
    t = L.advanceRelay(t, off, hold * factor / 2);
    t = L.advanceRelay(t, on, 0); // Re-energization cancels pending release.
    t = L.advanceRelay(t, off, hold * factor / 2);
    eq(t.picked, true);
    eq(L.advanceRelay(t, { ...off, type: 'neutral' }, 0).picked, false);
    eq(L.advanceRelay(t, { ...off, mode: 'track', type: 'rectifier', power: false }, 0).picked, false);
  }
  const on = { ...L.initial(), type, polarity: 1 };
  let t = L.advanceRelay(null, on, 0);
  for (let i = 0; i < 100; i++) t = L.advanceRelay(t, { ...on, polarity: 0 }, hold / 200);
  eq(t.picked, true);
  t = L.advanceRelay(t, { ...on, polarity: 0 }, hold);
  eq(t.picked, false);
}
const timerOn = { ...L.initial(), type: 'timeRelay', polarity: 1 };
let t = L.advanceRelay(null, timerOn, 2.99);
eq(t.picked, false);
t = L.advanceRelay(t, timerOn, .02);
eq(t.picked, true);
t = L.advanceRelay(t, { ...timerOn, polarity: 0 }, 0);
eq(t.picked, false);
eq(t.progress, 0);
eq(L.advanceRelay(t, timerOn, 1).picked, false);
assert.throws(() => L.advanceRelay(null, timerOn, -1)); checks++;
assert.throws(() => L.advanceStation(s, NaN)); checks++;

// Codex 复核回归 1（PDF p.49 / 书 p.39）：引导接车 R1 开放 HB → 车入 IAG 后注入灯丝双断 DJ↓（或道岔失表示/敌对/人工关灯）→ 列车通过全进路严禁自动逐段解锁，必须待办理 ZRA 一次性解锁！
{
  let g = L.update(L.initial(), { mode: 'station', stationRoute: 'R1', stationStage: 5, stationTrain: -26, guideMode: true });
  eq(L.evaluate(g).station.signals.X, 'HB');
  eq(L.evaluate(g).station.guideRouteLocked, true);
  // 列车进入 IAG 后注入灯丝双断 DJ↓
  g = L.update(g, { stationTrain: 10 });
  eq(L.evaluate(g).station.signals.X, 'H');
  g = L.update(g, { lampFault: true });
  eq(L.evaluate(g).station.signals.X, 'DARK');
  eq(L.evaluate(g).station.relays.YXJ, false);
  eq(L.evaluate(g).station.guideRouteLocked, true);
  eq(L.evaluate(g).station.guideActive, true);
  // 让列车依次通过 IAG → 1DG → 7-11DG → IG，每步推进 4s 仿真时间
  for (const pos of [25, 45, 65, 85, 102, 115]) {
    g = L.update(g, { stationTrain: pos });
    g = L.advanceStation(g, 4);
  }
  const afterFaultPass = L.evaluate(g).station;
  eq(afterFaultPass.secStates.IAG.unlocked, false);
  eq(afterFaultPass.secStates['1DG'].unlocked, false);
  eq(afterFaultPass.secStates['11DG'].unlocked, false);
  eq(afterFaultPass.relays.SJ, false);
  eq(afterFaultPass.guideActive, true);
  // 即使此时恢复灯丝完好，引导信号也不得自动重开，进路仍保持引导锁闭，ZQA 不得解锁
  g = L.update(g, { lampFault: false });
  eq(L.evaluate(g).station.relays.YXJ, false);
  eq(L.evaluate(g).station.secStates['11DG'].unlocked, false);
  const tryZqa = L.update(g, { cancelMode: 'zqa' });
  eq(L.evaluate(tryZqa).station.zqaUnlocked, false);
  eq(L.evaluate(tryZqa).station.secStates['11DG'].unlocked, false);
  // 办理总人工解锁 ZRA + 延时满 180 s 后一次性解锁全部进路区段
  g = L.update(g, { cancelMode: 'zra' });
  eq(L.evaluate(g).station.zraCounting, true);
  g = L.advanceStation(g, 4);
  const afterZra = L.evaluate(g).station;
  eq(afterZra.zraUnlocked, true);
  eq(afterZra.secStates.IAG.unlocked, true);
  eq(afterZra.secStates['1DG'].unlocked, true);
  eq(afterZra.secStates['11DG'].unlocked, true);
  eq(afterZra.relays.SJ, true);
  eq(afterZra.relays.ZCJ, true);
}

// Codex 复核回归 2（PDF p.192 / 书 p.182）：双车模式下二号车 B（R24 D₇→IG）与一号车统一使用时间驱动 3 s FDGJ 缓放，禁止按走过距离提前/卡死解锁！
{
  let b = L.update(L.initial(), { mode: 'station', multiTrainMode: 'parallel_shunt', stationRoute: 'R18', secondRoute: 'R24', stationStage: 5, stationTrain: -26, secondTrain: -26 });
  for (const posB of [0, 30, 68, 85]) {
    b = L.update(b, { secondTrain: posB });
  }
  // 刚出清 7-11DG(0..68) 压入 IG，dt = 0 → FDGJ 开始 3s 缓放计时，不得立即解锁
  let stB = L.evaluate(b).station;
  eq(stB.secStates['11DG'].occ, false);
  eq(stB.secStates['11DG'].slow, true);
  eq(stB.secStates['11DG'].unlocked, false);
  // 继续移动 10 格至 95（但 dt = 0，未满 3s）→ 仍须保持缓放，不得因移动距离立即解锁！
  b = L.update(b, { secondTrain: 95 });
  stB = L.evaluate(b).station;
  eq(stB.secStates['11DG'].slow, true);
  eq(stB.secStates['11DG'].unlocked, false);
  // 停在原位 95 不动，仅推进时间 1.5 s → 仍缓放
  b = L.advanceStation(b, 1.5);
  stB = L.evaluate(b).station;
  eq(stB.secStates['11DG'].slow, true);
  eq(stB.secStates['11DG'].unlocked, false);
  // 继续停在原位 95 不动，再推进 1.6 s（总计 3.1 s ≥ 3 s）→ 纯靠时间完成 FDGJ 缓放并解锁！
  b = L.advanceStation(b, 1.6);
  stB = L.evaluate(b).station;
  eq(stB.secStates['11DG'].slow, false);
  eq(stB.secStates['11DG'].unlocked, true);
  eq(stB.multiTrain.allUnlockedB, true);
}

console.log(`通过 ${checks} 项解锁限制、连续计时、区段隔离及缓放时序回归断言`);
