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
for (const type of ['contacts', 'neutral', 'slowRelease', 'heavySlow', 'differential', 'rectifier', 'timeRelay']) {
  for (const polarity of [-1, 0, 1]) check({ type, polarity }, polarity !== 0);
}
for (const polarity of [-1, 0, 1]) check({ type: 'biased', polarity }, polarity === 1);
check({ type: 'filament', polarity: 1, filamentMode: 'main' }, true);
check({ type: 'filament', polarity: 1, filamentMode: 'backup' }, true);
check({ type: 'filament', polarity: 1, filamentMode: 'broken' }, false);

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
  for (const front of [-25, -0.01, 0, 50, 100, 140, 140.01, 165]) {
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

// 验证 03 · 车站接车联锁沙盘（图3.1.1 X → IG 正线 / 3G 侧线接车全流程）
const stIG = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'IG', stationStage: 5, stationTrain: -26 }).station;
assert.equal(stIG.signalAspect, 'U');
assert.equal(stIG.relays.LXJ, true);
assert.equal(stIG.relays.ZXJ, true);
assert.equal(stIG.relays.DBJ, true);
assert.equal(stIG.relays.SJ, false);
checks += 5;

const st3GConv = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: '3G', stationStage: 2, stationTrain: -26 }).station;
assert.equal(st3GConv.relays.FCJ, true);
assert.equal(st3GConv.relays.DQJ1, true);
assert.equal(st3GConv.relays.DQJ2, true);
checks += 3;

const st3GOpen = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: '3G', stationStage: 5, stationTrain: -26 }).station;
assert.equal(st3GOpen.signalAspect, 'UU');
assert.equal(st3GOpen.relays.FBJ, true);
assert.equal(st3GOpen.relays.DJ2, true);
checks += 3;

// 第一轮对压入内方第一区段 IAG 时，进站信号机 X 立即关闭回红灯 H
const stEnterIAG = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'IG', stationStage: 5, stationTrain: 5 }).station;
assert.equal(stEnterIAG.occIAG, true);
assert.equal(stEnterIAG.relays.LXJ, false);
assert.equal(stEnterIAG.signalAspect, 'H');
checks += 3;

// 瞬间分路不良测试：列车在 7-11DG 内(stationTrain=70)、尚未进入 IG 时，即使 DGJ 误吸，2LJ 绝不吸起、区段绝不提前解锁
const stPoorShunt = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'IG', stationStage: 5, stationTrain: 70, poorShunt: true }).station;
assert.equal(stPoorShunt.relays.DGJ, true);
assert.equal(stPoorShunt.relays.LJ2, false);
assert.equal(stPoorShunt.dg11Unlocked, false);
assert.equal(stPoorShunt.relays.SJ, false);
checks += 4;

// 列车整列进入股道 IG 并完成 FDGJ 3s 缓放后 (stationTrain=115)，咽喉区段全部解锁 (SJ↑)
const stArrived = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'IG', stationStage: 5, stationTrain: 115 }).station;
assert.equal(stArrived.occTrack, true);
assert.equal(stArrived.dg11Unlocked, true);
assert.equal(stArrived.relays.SJ, true);
checks += 3;

// 验证专题 A：第 4.2 节自闭电路 4 步时序与第 4.3 节断线/远端供电位置法防护
let sh = L.update(L.initial(), { type: 'selfHold', shButton: true });
assert.equal(L.evaluate(sh).picked, true);
assert.equal(L.evaluate(sh).selfHold.startBranchLive, true);
sh = L.update(sh, { shButton: false }); // 松开自复按钮 A，靠 AJ(11-12) 自闭保持
assert.equal(L.evaluate(sh).picked, true);
assert.equal(L.evaluate(sh).selfHold.holdBranchLive, true);
sh = L.update(sh, { shFujPicked: true }); // FUJ 励磁吸起断开 11-13，AJ 复原落下
assert.equal(L.evaluate(sh).picked, false);
sh = L.update(sh, { shFujPicked: false });
assert.equal(L.evaluate(sh).picked, false);
// 混线防护：图4.3.2(a) 同端供电混线误吸 vs 图4.3.2(b) 远端供电位置法可靠落下
assert.equal(L.evaluate(L.update(sh, { shCrossFault: 'naive' })).picked, true);
assert.equal(L.evaluate(L.update(sh, { shCrossFault: 'position' })).picked, false);
checks += 8;

// 验证专题 B：第 5.2.2 节单动道岔四线制控制与表示电路 5 阶段 + 夹异物/遮断器保护
const to0 = L.evaluate({ ...L.initial(), type: 'turnoutLab', toStage: 0 }).turnout;
assert.equal(to0.dbjPicked, true);
assert.equal(to0.dqj1Picked, false);
const to2 = L.evaluate({ ...L.initial(), type: 'turnoutLab', toStage: 2 }).turnout;
assert.equal(to2.dqj1Picked, true);
assert.equal(to2.dqj1SlowHold, true);
const to3 = L.evaluate({ ...L.initial(), type: 'turnoutLab', toStage: 3 }).turnout;
assert.equal(to3.motorRunning, true);
assert.equal(to3.k41_42, true); // B 爪先行动作闭合 41-42
assert.equal(to3.k11_12, true); // A 爪尚未断开 11-12
const to4 = L.evaluate({ ...L.initial(), type: 'turnoutLab', toStage: 4 }).turnout;
assert.equal(to4.fbjPicked, true);
assert.equal(to4.dqj1Picked, false);
const toLid = L.evaluate({ ...L.initial(), type: 'turnoutLab', toStage: 3, toLidOpen: true }).turnout;
assert.equal(toLid.motorRunning, false);
checks += 10;

// 验证专题 C：第 3.3.3 / 9.5 节总取消(ZQA) vs 总人工解锁(ZRA) 与信号故障恢复防自动重复开放
const stZqaPre = L.evaluate({ ...L.initial(), mode: 'station', stationStage: 5, stationTrain: -26, cancelMode: 'zqa' }).station;
assert.equal(stZqaPre.signalAspect, 'H');
assert.equal(stZqaPre.relays.SJ, true); // 预先锁闭立即解锁
const stZqaApp = L.evaluate({ ...L.initial(), mode: 'station', stationStage: 5, stationTrain: -10, cancelMode: 'zqa' }).station;
assert.equal(stZqaApp.signalAspect, 'H');
assert.equal(stZqaApp.relays.SJ, false); // 接近锁闭仅关信号、严禁解锁
const stZraDone = L.evaluate({ ...L.initial(), mode: 'station', stationStage: 5, stationTrain: -10, cancelMode: 'zra', zraProgress: 1 }).station;
assert.equal(stZraDone.relays.SJ, true); // 3min 延时满后解锁
let stFault = L.update(L.initial(), { mode: 'station', stationStage: 5, lampFault: true });
assert.equal(L.evaluate(stFault).station.signalAspect, 'H');
stFault = L.update(stFault, { lampFault: false }); // 故障恢复后因 signalFaultLocked 保持 H 灯不自动重开
assert.equal(L.evaluate(stFault).station.signalAspect, 'H');
checks += 7;

assert.throws(() => L.evaluate({ ...L.initial(), mode: 'track' })); checks++;
assert.throws(() => L.update(L.initial(), { polarity: 2 })); checks++;
assert.throws(() => L.update(L.initial(), { front: NaN })); checks++;

// 全书 13 章路径、127 题库及 CBI 联锁表校验
const Curriculum = require('../dist/curriculum.js');
const Cbi = require('../dist/cbi.js');
assert.equal(Curriculum.CHAPTERS.length, 13);
assert.equal(Curriculum.QUESTIONS.length, 127);
const totalSections = Curriculum.CHAPTERS.reduce((sum, c) => sum + c.sections.length, 0);
assert.equal(totalSections, 51);
checks += 3;
for (const q of Curriculum.QUESTIONS) {
  assert.ok(q.page >= 1 && q.page <= 277, `Question ${q.id} page out of bounds`);
  if (q.go) {
    const st = L.update(L.initial(), q.go);
    L.evaluate(st);
  }
  checks++;
}
for (const rt of Cbi.LOCK_ROUTES) {
  for (const [k, ans] of Object.entries(rt.answer)) {
    assert.ok(rt.options[k].includes(ans), `LOCK_ROUTES ${rt.id}.${k} mismatch`);
    checks++;
  }
}
for (const sq of Cbi.SWITCH_NORMAL_QS) {
  assert.ok(sq.ans >= 0 && sq.ans < sq.opts.length);
  checks++;
}

// 五线制三相道岔 (S700K)、5法防混线、CBI动态驱采与发车/调车/区故解验证
const fw0 = L.evaluate({ ...L.initial(), type: 'fiveWireLab', fwStage: 0 }).fiveWire;
assert.equal(fw0.dbjPicked, true);
assert.equal(fw0.bhjPicked, false);
const fw3 = L.evaluate({ ...L.initial(), type: 'fiveWireLab', fwStage: 3, fwPhaseLoss: false }).fiveWire;
assert.equal(fw3.bhjPicked, true);
assert.equal(fw3.motorRunning, true);
const fwLoss = L.evaluate({ ...L.initial(), type: 'fiveWireLab', fwStage: 3, fwPhaseLoss: true }).fiveWire;
assert.equal(fwLoss.bhjPicked, false);
assert.equal(fwLoss.motorRunning, false);
assert.equal(fwLoss.dqj1Picked, false);
const fw4 = L.evaluate({ ...L.initial(), type: 'fiveWireLab', fwStage: 4 }).fiveWire;
assert.equal(fw4.fbjPicked, true);
checks += 8;

const ciOk = L.evaluate({ ...L.initial(), type: 'cbiIoLab', cbiMode: 'pulseTrans', cbiCmd: true, cbiFault: 'none' }).cbiIo;
assert.equal(ciOk.relayPicked, true);
const ciStuckHigh = L.evaluate({ ...L.initial(), type: 'cbiIoLab', cbiMode: 'pulseTrans', cbiCmd: true, cbiFault: 'stuckHigh' }).cbiIo;
assert.equal(ciStuckHigh.relayPicked, false);
assert.equal(ciStuckHigh.dynamicActive, false);
const ciCapHigh = L.evaluate({ ...L.initial(), type: 'cbiIoLab', cbiMode: 'capPump', cbiCmd: true, cbiFault: 'stuckHigh' }).cbiIo;
assert.equal(ciCapHigh.relayPicked, false);
const ciStatBad = L.evaluate({ ...L.initial(), type: 'cbiIoLab', cbiMode: 'staticIn', cbiCmd: true, cbiFault: 'diodeShort' }).cbiIo;
assert.equal(ciStatBad.inputValid, false);
assert.equal(ciStatBad.relayPicked, false);
checks += 6;

const shPosFault = L.evaluate({ ...L.initial(), type: 'selfHold', shCrossMethod: 'position', shCrossFault: 'active' }).selfHold;
assert.equal(shPosFault.ajPicked, false);
const shShuntOk = L.evaluate({ ...L.initial(), type: 'selfHold', shCrossMethod: 'shunt', shCrossFault: 'active', shShuntLineBreak: false }).selfHold;
assert.equal(shShuntOk.ajPicked, false);
const shShuntFail = L.evaluate({ ...L.initial(), type: 'selfHold', shCrossMethod: 'shunt', shCrossFault: 'active', shShuntLineBreak: true }).selfHold;
assert.equal(shShuntFail.ajPicked, true);
checks += 3;

const stDep = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'DEP', stationStage: 5, stationTrain: -26 }).station;
assert.equal(stDep.signalAspect, 'L');
assert.equal(stDep.isDep, true);
const stDepRun = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'DEP', stationStage: 5, stationTrain: 10 }).station;
assert.equal(stDepRun.signalAspect, 'H');
const stShunt = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'SHUNT', stationStage: 5, stationTrain: 10 }).station;
assert.equal(stShunt.signalAspect, 'B');
const stShuntEnd = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'SHUNT', stationStage: 5, stationTrain: 78 }).station;
assert.equal(stShuntEnd.signalAspect, 'A');
const stSgaBlocked = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'IG', stationStage: 5, stationTrain: 70, cancelMode: 'sga' }).station;
assert.equal(stSgaBlocked.sgaBlocked, true);
assert.equal(stSgaBlocked.sgaUnlocked, false);
const stStuckBeforeSga = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'IG', stationStage: 5, stationTrain: 115, blindFault: 'stuckSection' }).station;
assert.equal(stStuckBeforeSga.relays.DGJ, true);
assert.equal(stStuckBeforeSga.relays.QJJ, false); // 已进入并越过7-11DG，QJJ已落，具备SGA条件
assert.equal(stStuckBeforeSga.relays.SJ, false);
const stLampCheck = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'IG', stationStage: 5, stationTrain: -26, blindFault: 'lamp' }).station;
assert.equal(stLampCheck.relays.XJJ, true); // 8线XJJ检道岔/敌对不检DJ
assert.equal(stLampCheck.relays.DJ, false);
assert.equal(stLampCheck.relays.LXJ, false); // 11线检DJ↓立即关闭信号
const stDepStg4 = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'DEP', stationStage: 4, stationTrain: -26 }).station;
assert.equal(stDepStg4.relays.JYJ, false); // 发车股道已占构成接近锁闭
const stShuntStg4 = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'SHUNT', stationStage: 4, stationTrain: -26 }).station;
assert.equal(stShuntStg4.relays.JYJ, false); // 调车IAG已占构成接近锁闭
const stSgaOk = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'IG', stationStage: 5, stationTrain: 115, cancelMode: 'sga' }).station;
assert.equal(stSgaOk.sgaUnlocked, true);
assert.equal(stSgaOk.relays.SJ, true);
checks += 17;

// 第 2.3 节 6 类信号机与第 5.1 节继电器联动校验
for (const sigType of L.SIGNAL_TYPES) {
  const aspEntries = Object.entries(L.SIGNAL_ASPECTS[sigType]);
  assert.ok(aspEntries.length >= 2);
  for (const [asp, aspSpec] of aspEntries) {
    const resMain = L.evaluate({ ...L.initial(), mode: 'signal', signalType: sigType, signalAspect: asp, signalFilament: 'main', signalIndicator: 'right' });
    assert.equal(resMain.signal.aspect, asp);
    assert.equal(resMain.signal.relays.DJ, true);
    assert.equal(resMain.signal.relays.DZJ, true);
    assert.ok(Array.isArray(resMain.signal.lit) && resMain.signal.lit.length === aspSpec.lit.length);
    checks += 4;
  }
  const resBackup = L.evaluate({ ...L.initial(), mode: 'signal', signalType: sigType, signalAspect: aspEntries[0][0], signalFilament: 'backup' });
  assert.equal(resBackup.signal.relays.DJ, true);
  assert.equal(resBackup.signal.relays.DZJ, false);
  const resBroken = L.evaluate({ ...L.initial(), mode: 'signal', signalType: sigType, signalAspect: aspEntries[aspEntries.length - 1][0], signalFilament: 'broken' });
  assert.equal(resBroken.signal.relays.DJ, false);
  assert.equal(resBroken.signal.lit.length, 0);
  assert.equal(resBroken.picked, false);
  checks += 5;
}
const depInd = L.evaluate({ ...L.initial(), mode: 'signal', signalType: 'depFour', signalAspect: 'L', signalIndicator: 'right', signalFilament: 'main' }).signal;
assert.equal(depInd.indicator, 'right');
assert.equal(depInd.relays.LQJ3, true);
checks += 2;

// 表 3.2.2 下行咽喉全部 33 条进路（R1..R33）道岔、信号、敌对与故障保护校验
const J = require('../dist/journey.js');
assert.equal(J.ROUTES_3_2_2.length, 33);
for (const rt of J.ROUTES_3_2_2) {
  const stOpen = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: rt.code, stationStage: 5, stationTrain: -26 }).station;
  const expectedAsp = rt.aspect === 'L/LU/U' ? 'L' : rt.aspect;
  assert.equal(stOpen.signalAspect, expectedAsp, `${rt.code} signalAspect`);
  assert.equal(stOpen.signals[rt.sig], expectedAsp, `${rt.code} signals[${rt.sig}]`);
  assert.equal(stOpen.indicatorOn, Boolean(rt.indicator), `${rt.code} indicator`);
  for (const swk of ['s1_3', 's5_7', 's9', 's11']) {
    assert.equal(stOpen.switchesState[swk], rt.switches[swk] || 'N', `${rt.code} switchesState.${swk}`);
  }
  for (const [sKey, sVal] of Object.entries(stOpen.signals)) {
    if (sKey !== rt.sig) {
      assert.equal(sVal, sKey.startsWith('D') ? 'A' : 'H', `${rt.code} non-route ${sKey} protective aspect`);
    }
  }
  const stLamp = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: rt.code, stationStage: 5, stationTrain: -26, lampFault: true }).station;
  assert.equal(stLamp.relays.DJ, false, `${rt.code} lampFault DJ`);
  assert.equal(stLamp.signals[rt.sig], 'DARK', `${rt.code} lampFault DARK`);
  checks += 7;
}

// 表 3.2.2 全 33 条进路（包含非经典 R2/R6/R9/R20/R27）运行时 列车↔继电器↔信号 同步逐点核查
for (const tc of ['R1', 'R2', 'R6', 'R9', 'R17', 'R20', 'R27']) {
  const rt = J.resolveRoute(tc);
  const stg4 = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: tc, stationStage: 4, stationTrain: -26 }).station;
  assert.equal(stg4.relays.QJJ, true, `${tc} stage 4 QJJ must be UP`);
  assert.equal(stg4.relays.KJ, true, `${tc} stage 4 KJ must be UP`);
  assert.equal(stg4.relays.SJ, false, `${tc} stage 4 SJ must be DOWN (locked)`);
  if (rt.kind !== 'shunt') {
    assert.equal(stg4.relays.GJJ, true, `${tc} stage 4 GJJ must be UP`);
    assert.equal(stg4.relays.ZCJ, false, `${tc} stage 4 ZCJ must be DOWN (opposing lock)`);
  }
  let sim = L.update(L.initial(), { mode: 'station', stationRoute: tc, stationStage: 5, stationTrain: -26 });
  for (let p = -20; p <= 122; p += 6) {
    sim = L.update(sim, { stationTrain: p });
    sim = L.advanceStation(sim, 3.6);
    const stNow = L.evaluate(sim).station;
    if (rt.kind === 'shunt') {
      // §9.4.2 (PDF p.191 / 书 p.181)：调车信号在整列越过始端信号机(r > 0)后关闭
      const expectWhite = p - 16 <= 0;
      assert.equal(stNow.relays.LXJ, expectWhite, `${tc}@${p} shunt LXJ`);
      const closedCol = rt.sig.startsWith('D') ? 'A' : 'H';
      assert.equal(stNow.signals[rt.sig], expectWhite ? 'B' : closedCol, `${tc}@${p} shunt signal`);
      assert.equal(stNow.signalAspect, expectWhite ? 'B' : closedCol, `${tc}@${p} signalAspect consistency`);
    } else {
      const expectOpen = p < 0;
      assert.equal(stNow.relays.LXJ, expectOpen, `${tc}@${p} train LXJ`);
      if (!expectOpen) assert.equal(stNow.signals[rt.sig], 'H', `${tc}@${p} train signal closes H`);
    }
    if (stNow.secStates[stNow.sgaSectionId]) assert.equal(stNow.relays.DGJ, !stNow.secStates[stNow.sgaSectionId].occ, `${tc}@${p} DGJ matches section occupancy`);
  }
  const stEnd = L.evaluate(sim).station;
  assert.equal(stEnd.relays.SJ, true, `${tc} after exit SJ must unlock UP`);
  assert.equal(stEnd.relays.KJ, false, `${tc} after exit KJ must drop DOWN`);
  assert.equal(stEnd.relays.ZCJ, true, `${tc} after exit ZCJ must restore UP`);
  checks += 12;
}

// 第 5.1.2 节(3) 2DJ↓ 防信号升级保护测试 + 第 3.3.4 节引导接车 HB + ZRA 解锁闭环测试
for (const [stType, asp] of [['inStation', 'UU'], ['inStation', 'LU'], ['depFour', 'LU'], ['depFour', 'LL']]) {
  const dgRes = L.evaluate({ ...L.initial(), mode: 'signal', signalType: stType, signalAspect: asp, signalSecondFilamentFault: true }).signal;
  assert.equal(dgRes.aspect, 'H');
  assert.equal(dgRes.downgradedToRed, true);
  assert.equal(dgRes.relays.LXJ, false);
  assert.equal(dgRes.relays.DJ2, false);
  assert.deepEqual(dgRes.lit, ['H']);
  checks += 5;
}

// PDF p.49 / 书 p.39 引导信号开放 4 项技术条件（主体红灯、道岔位置/总锁闭、无敌对进路）+ 15s 维持 + ZRA 一次性解锁闭环
// (a) 主体红灯不可用 (DJ↓) 严禁开放 HB
const gBadLamp = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'R1', stationStage: 5, stationTrain: -26, lampFault: true, switchFault: true, guideManualConfirm: true, guideTotalLock: true, guideMode: true }).station;
assert.equal(gBadLamp.relays.DJ, false);
assert.equal(gBadLamp.relays.YXJ, false);
assert.equal(gBadLamp.signals.X, 'DARK');
assert.equal(gBadLamp.guideActive, false);
// (b) 道岔失表示但无人工确认或无咽喉引导总锁闭，严禁开放 HB
const gBadSwNone = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'R1', stationStage: 5, stationTrain: -26, switchFault: true, guideMode: true }).station;
assert.equal(gBadSwNone.relays.YXJ, false);
assert.equal(gBadSwNone.signals.X, 'H');
const gBadSwNoLock = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'R1', stationStage: 5, stationTrain: -26, switchFault: true, guideManualConfirm: true, guideTotalLock: false, guideMode: true }).station;
assert.equal(gBadSwNoLock.relays.YXJ, false);
const gBadSwNoConf = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'R1', stationStage: 5, stationTrain: -26, switchFault: true, guideManualConfirm: false, guideTotalLock: true, guideMode: true }).station;
assert.equal(gBadSwNoConf.relays.YXJ, false);
// (c) 存在已建立的敌对进路，严禁开放 HB
const gBadHostile = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'R1', stationStage: 5, stationTrain: -26, hostileRoute: true, guideMode: true }).station;
assert.equal(gBadHostile.relays.YXJ, false);
assert.equal(gBadHostile.signals.X, 'H');
assert.equal(gBadHostile.hostileRouteActive, true);
// (d) 主体红灯有效 (DJ↑) + 道岔失表示已人工确认 + 咽喉引导总锁闭 + 无敌对进路 → 允许开放 HB
let gState = L.update(L.initial(), { mode: 'station', stationRoute: 'R2', stationStage: 5, stationTrain: -26, lampFault: false, switchFault: true, guideManualConfirm: true, guideTotalLock: true, guideMode: true });
const gOpen = L.evaluate(gState).station;
assert.equal(gOpen.relays.DJ, true);
assert.equal(gOpen.relays.YXJ, true);
assert.equal(gOpen.signals.X, 'HB');
assert.equal(gOpen.guideTotalLockActive, true);
assert.equal(gOpen.relays.ZCJ, false);
// 第一轮对进入内方第一轨道区段立即关闭引导灯，同时保留引导进路锁闭 (SJ↓)
gState = L.update(gState, { stationTrain: 2 });
const gEntered = L.evaluate(gState).station;
assert.equal(gEntered.relays.YXJ, false);
assert.equal(gEntered.signals.X, 'H');
assert.equal(gEntered.relays.SJ, false);
for (let p = 14; p <= 122; p += 12) {
  gState = L.update(gState, { stationTrain: p });
  gState = L.advanceStation(gState, 4);
}
const gAfterPass = L.evaluate(gState).station;
assert.equal(gAfterPass.relays.YXJ, false);
assert.equal(gAfterPass.signals.X, 'H');
assert.equal(gAfterPass.relays.SJ, false); // 第3.3.4节(4): 引导进路过车不自动逐段解锁!
gState = L.update(gState, { cancelMode: 'zra' });
gState = L.advanceStation(gState, 4);
const gAfterZra = L.evaluate(gState).station;
assert.equal(gAfterZra.zraUnlocked, true);
assert.equal(gAfterZra.relays.SJ, true);
assert.equal(gAfterZra.relays.ZCJ, true);
// (e) 内方首区段故障 15 s 维持开放与超时关闭（PDF p.49 (3)③）
let gHold = L.update(L.initial(), { mode: 'station', stationRoute: 'R1', stationStage: 5, stationTrain: -26, guideFirstSecFault: true, guideMode: true });
assert.equal(L.evaluate(gHold).station.relays.YXJ, true);
assert.equal(L.evaluate(gHold).station.signals.X, 'HB');
gHold = L.advanceStation(gHold, 14.5);
assert.equal(L.evaluate(gHold).station.relays.YXJ, true);
gHold = L.update(gHold, { guideHoldElapsed: 0 }); // 15 s 内维持操作重置
gHold = L.advanceStation(gHold, 10);
assert.equal(L.evaluate(gHold).station.relays.YXJ, true);
gHold = L.advanceStation(gHold, 5.5); // 超过 15 s 未维持，引导信号自动关闭
const gHoldExpired = L.evaluate(gHold).station;
assert.equal(gHoldExpired.relays.YXJ, false);
assert.equal(gHoldExpired.signals.X, 'H');
assert.equal(gHoldExpired.relays.SJ, false);
checks += 32;

// 第 6.3 节 6502 12 种定型组合数据完整性断言
assert.ok(Array.isArray(Cbi.MODULES_6502) && Cbi.MODULES_6502.length >= 7);
const allCombos = Cbi.MODULES_6502.map(m => m.combo).join(' ');
for (const tag of ['DD', 'SDZ', 'SDF', 'Q', 'LXZ', '1LXF', 'YX', 'DX', 'DXF', 'F', 'DY']) {
  assert.ok(allCombos.includes(tag), `MODULES_6502 missing ${tag}`); checks++;
}

// 第 5.2.1–5.2.2 节 四线制道岔 SJ↓ 启动闭锁 vs 0.44Ω 自闭转换到底 & 4 种表示电路故障断言
const toPreLock = L.evaluate({ ...L.initial(), mode: 'bench', type: 'turnoutLab', toStage: 1, toSjLocked: true }).turnout;
assert.equal(toPreLock.dqj1Picked, false, 'SJ↓ before start must block 1DQJ 3-4 excitation'); checks++;
const toPostLock = L.evaluate({ ...L.initial(), mode: 'bench', type: 'turnoutLab', toStage: 3, toSjLocked: true }).turnout;
assert.equal(toPostLock.dqj1Picked, true, '1DQJ 1-2 0.44Ω series self-hold must bypass SJ↓ and finish conversion');
assert.equal(toPostLock.motorRunning, true); checks += 2;
for (const fKey of ['wireCross', 'capShort', 'capOpen', 'trailThrough']) {
  const ind0 = L.evaluate({ ...L.initial(), mode: 'bench', type: 'turnoutLab', toStage: 0, toIndFault: fKey }).turnout;
  const ind4 = L.evaluate({ ...L.initial(), mode: 'bench', type: 'turnoutLab', toStage: 4, toIndFault: fKey }).turnout;
  assert.equal(ind0.dbjPicked, false, `${fKey} must drop DBJ`);
  assert.equal(ind4.fbjPicked, false, `${fKey} must drop FBJ`);
  checks += 2;
}

// 第 7 章 1–7 线选排典型进路表 (ROUTES_1_7) 断言
assert.ok(Array.isArray(Cbi.ROUTES_1_7) && Cbi.ROUTES_1_7.length === 4);
assert.ok(Cbi.ROUTES_1_7.some(r => r.id === 'X_4G' && r.line34.includes('3、4')));
assert.ok(Cbi.ROUTES_1_7.some(r => r.id === 'XF_3G' && r.line12.includes('1、2')));
assert.ok(Cbi.ROUTES_1_7.some(r => r.id === 'D7_IG' && r.line56.includes('QJJ') && r.sandRoute === 'R24'));
checks += 4;

// 验证逐区段实时追踪 activeSec 与 controlledChain（列車经过 IAG → 1DG → 7-11DG 时继电器实时切换）
const secAtIAG = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'R1', stationStage: 5, stationTrain: 10 }).station;
assert.equal(secAtIAG.activeSec.id, 'IAG');
assert.equal(secAtIAG.activeSec.DGJ, false);
assert.equal(secAtIAG.activeSec.LJ1, true);
assert.equal(secAtIAG.activeSec.QJJ, false);
const secAt1DG = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'R1', stationStage: 5, stationTrain: 48 }).station;
assert.equal(secAt1DG.activeSec.id, '1DG');
assert.equal(secAt1DG.activeSec.DGJ, false);
assert.equal(secAt1DG.activeSec.LJ1, true);
assert.equal(secAt1DG.controlledChain[0].unlocked, true, 'IAG unlocked after rear clears 25 + 3s');
const secAt11DG = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: 'R1', stationStage: 5, stationTrain: 78 }).station;
assert.equal(secAt11DG.activeSec.id, '11DG');
assert.equal(secAt11DG.activeSec.label, '7-11DG');
assert.equal(secAt11DG.activeSec.DGJ, false);
assert.equal(secAt11DG.controlledChain[1].unlocked, true, '1DG unlocked after rear clears 55 + 3s');
checks += 11;

// 验证多列车同时运行与联锁冲突/平行作业仿真（教材第2.5.2 / 3.1.1 / 3.3.4 / 9.4节）
// ① 平行作业：X→IG (R1) ∥ SⅡ→X_F (R14)
const mtPar1 = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'parallel_rec_dep', stationRoute: 'R1', secondRoute: 'R14', stationStage: 5, stationTrain: -26, secondTrain: -26 }).station;
assert.equal(mtPar1.multiTrain.active, true);
assert.equal(mtPar1.multiTrain.bCanLockNow, true);
assert.equal(mtPar1.signals.X, 'U');
assert.equal(mtPar1.signals.SII, 'L');
const mtPar1Run = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'parallel_rec_dep', stationRoute: 'R1', secondRoute: 'R14', stationStage: 5, stationTrain: 10, secondTrain: -20 }).station;
assert.equal(mtPar1Run.signals.X, 'H'); // 一号车压入 IAG，X 立即关闭
assert.equal(mtPar1Run.signals.SII, 'L'); // 二号车尚未越过 SⅡ，SⅡ 保持开放 L
// ② 平行作业：X→IG (R1) ∥ X_F→IIG (R10)
const mtPar2 = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'parallel_dual_rec', stationRoute: 'R1', secondRoute: 'R10', stationStage: 5, stationTrain: -26, secondTrain: -26 }).station;
assert.equal(mtPar2.signals.X, 'U');
assert.equal(mtPar2.signals.XF, 'U');
// ③ 平行调车：D₁→D₅ (R18) ∥ D₇→IG (R24)
const mtPar3 = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'parallel_shunt', stationRoute: 'R18', secondRoute: 'R24', stationStage: 5, stationTrain: -20, secondTrain: -20 }).station;
assert.equal(mtPar3.signals.D1, 'B');
assert.equal(mtPar3.signals.D7, 'B');
assert.equal(mtPar3.switchesState.s1_3, 'R');
assert.equal(mtPar3.switchesState.s5_7, 'N');
// ④ 抵触排队与分段解锁：一号车 X→IG (R1) 先行，二号车 D₅→IG (R20) 等待 5/7 与 7-11DG 解锁后自动开放
const mtQueueWait = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'conflict_queue', stationRoute: 'R1', secondRoute: 'R20', stationStage: 5, stationTrain: 40, secondTrain: -12 }).station;
assert.equal(mtQueueWait.multiTrain.bWaitingForA, true);
assert.equal(mtQueueWait.multiTrain.lxjB, false);
assert.equal(mtQueueWait.signals.D5, 'A');
assert.equal(mtQueueWait.switchesState.s5_7, 'N');
const mtQueueGo = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'conflict_queue', stationRoute: 'R1', secondRoute: 'R20', stationStage: 5, stationTrain: 115, secondTrain: -12 }).station;
assert.equal(mtQueueGo.multiTrain.bCanLockNow, true);
assert.equal(mtQueueGo.multiTrain.lxjB, true);
assert.equal(mtQueueGo.signals.D5, 'B');
assert.equal(mtQueueGo.switchesState.s5_7, 'R');
// ⑤ 股道 IG 已停二号车：列车接车 X→IG 禁开正常信号 vs 引导 HB vs 调车 D₇→IG 允许开放白灯 B
const mtOccRec = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'track_occupied', stationRoute: 'R1', stationStage: 5, stationTrain: -26, secondTrain: 108 }).station;
assert.equal(mtOccRec.secStates.IG.occ, true);
assert.equal(mtOccRec.relays.LXJ, false);
assert.equal(mtOccRec.signals.X, 'H');
const mtOccGuide = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'track_occupied', stationRoute: 'R1', stationStage: 5, stationTrain: -26, secondTrain: 108, guideMode: true }).station;
assert.equal(mtOccGuide.relays.YXJ, true);
assert.equal(mtOccGuide.signals.X, 'HB');
const mtOccShunt = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'track_occupied', stationRoute: 'R24', stationStage: 5, stationTrain: -20, secondTrain: 108 }).station;
assert.equal(mtOccShunt.relays.LXJ, true);
assert.equal(mtOccShunt.signals.D7, 'B');
// ⑥ 正线发车 (DEP / R5) 专项联锁回归：压入 7-11DG 时 IAG·QJJ 保持↑、1/7G 尚未占用、倒退不使已落 QJJ 误复吸；股道占车切 IG 发车隐藏重复 B 且出清 IG 后变绿
let depFlow = L.update({ ...L.initial(), mode: 'station', stationRoute: 'DEP', stationStage: 5, stationTrain: -26 }, {});
depFlow = L.update(depFlow, { stationTrain: 10 });
const depAt11DG = L.evaluate(depFlow).station;
assert.equal(depAt11DG.signals.S1, 'H');
assert.equal(depAt11DG.secStates['11DG'].qjj, false);
assert.equal(depAt11DG.secStates['1DG'].qjj, true);
assert.equal(depAt11DG.secStates.IAG.qjj, true);
assert.equal(depAt11DG.secStates['1/7G'].occ, false);
depFlow = L.update(depFlow, { stationTrain: -10 });
const depRev = L.evaluate(depFlow).station;
assert.equal(depRev.secStates['11DG'].qjj, false); // 已占用过的 7-11DG 的 QJJ 倒退后严禁误跳回↑
assert.equal(depRev.secStates.IAG.qjj, true);
const mtOccDep = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'track_occupied', stationRoute: 'DEP', stationStage: 5, stationTrain: -26, secondTrain: 126 }).station;
assert.equal(mtOccDep.multiTrain.hideDuplicateB, true);
assert.equal(mtOccDep.signals.S1, 'L');
const mtOccDepLeft = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'track_occupied', stationRoute: 'DEP', stationStage: 5, stationTrain: 25, secondTrain: 126 }).station;
assert.equal(mtOccDepLeft.secStates.IG.occ, false);
// ⑦ 抵触排队跟进与股道占车结束逻辑专项回归
const mtQueueMidB = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'conflict_queue', stationRoute: 'R1', secondRoute: 'R20', stationStage: 5, stationTrain: 130, secondTrain: 35 }).station;
assert.equal(mtQueueMidB.switchesState.s5_7, 'R');
assert.equal(mtQueueMidB.relays.FBJ, true);  // 5/7 自动转反位时 FBJ 必须同步吸起
assert.equal(mtQueueMidB.relays.DBJ, false);
assert.equal(mtQueueMidB.activeSec.DGJ, false); // 二号车占用 7-11DG 时活跃区段实时反映 DGJ↓、SJ↓
assert.equal(mtQueueMidB.activeSec.SJ, false);
const mtQueueDone = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'conflict_queue', stationRoute: 'R1', secondRoute: 'R20', stationStage: 5, stationTrain: 130, secondTrain: 105 }).station;
assert.equal(mtQueueDone.secStates['5-9DG'].unlocked, true);
assert.equal(mtQueueDone.secStates['11DG'].unlocked, true);
assert.equal(mtQueueDone.multiTrain.allUnlockedB, true);
assert.ok(mtQueueDone.multiTrain.conflictReason.includes('演示完成'));
// 股道占车未办 HB 强行越过红灯(冒进)严禁咽喉自动解锁；办理 HB 进站后须保持锁闭等待 ZRA
const mtOccSpad = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'track_occupied', stationRoute: 'R1', stationStage: 5, stationTrain: 102, secondTrain: 126, guideMode: false }).station;
assert.equal(mtOccSpad.spadViolation, true);
assert.equal(mtOccSpad.secStates['11DG'].unlocked, false);
assert.equal(mtOccSpad.relays.SJ, false);
const mtOccHbDone = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'track_occupied', stationRoute: 'R1', stationStage: 5, stationTrain: 102, secondTrain: 126, guideMode: true }).station;
assert.equal(mtOccHbDone.spadViolation, false);
assert.equal(mtOccHbDone.relays.YXJ, false);
assert.equal(mtOccHbDone.secStates['11DG'].unlocked, false);
assert.ok(mtOccHbDone.multiTrain.conflictReason.includes('总人工解锁 ZRA'));
checks += 53;

// ⑧ Codex 修正项 1–5 专项边界回归（双车占用参与信号/解锁、侧线发车30s、调车整列越过关灯、排队逻辑一致性）
// Item 1 复现 A：custom 双车 A=R1(X→IG), B=R5(IG→X)@-14 → IG占用保留，routeClear=false，X严禁开U
const c1a = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'custom', stationRoute: 'R1', secondRoute: 'R5', stationStage: 5, stationTrain: -26, secondTrain: -14 }).station;
assert.equal(c1a.secStates.IG.occ, true);
assert.equal(c1a.routeClear, false);
assert.equal(c1a.relays.LXJ, false);
assert.equal(c1a.signals.X, 'H');
// Item 1 复现 B：track_occupied A=R1@-26, B=126，办理 ZQA → 关闭信号但严禁解锁 (zqaUnlocked=false, SJ=false)
const c1b = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'track_occupied', stationRoute: 'R1', stationStage: 5, stationTrain: -26, secondTrain: 126, cancelMode: 'zqa' }).station;
assert.equal(c1b.secStates.IG.occ, true);
assert.equal(c1b.routeClear, false);
assert.equal(c1b.zqaUnlocked, false);
assert.equal(c1b.relays.SJ, false);
assert.equal(c1b.signals.X, 'H');
// Item 1：ZRA 计时过程中二号车进入受控区段 7-11DG，必须中止计时
let c1zra = L.update(L.initial(), { mode: 'station', multiTrainMode: 'custom', stationRoute: 'R1', secondRoute: 'R20', stationStage: 5, stationTrain: -10, secondTrain: -16, cancelMode: 'zra' });
c1zra = L.advanceStation(c1zra, 1.0);
assert.ok(c1zra.zraProgress > 0 && c1zra.zraInterrupted === false);
c1zra = L.update(c1zra, { secondTrain: 40 }); // B 压入 7-11DG
assert.equal(c1zra.zraProgress, 0);
assert.equal(c1zra.zraInterrupted, true);
assert.equal(L.evaluate(c1zra).station.routeClear, false);
// Item 1：双车建立敌对进路（排队释放后 B 已开 D5:B）不得开放 A 引导信号 HB
const c2DualHostile = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'custom', stationRoute: 'R1', secondRoute: 'R20', stationStage: 5, stationTrain: 115, secondTrain: -12, guideMode: true }).station;
assert.equal(c2DualHostile.hostileRouteActive, true);
assert.equal(c2DualHostile.relays.YXJ, false);
// Item 3：表 3.2.2 全部发车进路 ZRA 延时判定（正线 IG/IIG 发车 180s，侧线 3G/4G 发车 30s）
for (const [rc, expectSec] of [['R1', 180], ['R3', 180], ['R5', 180], ['R6', 180], ['R7', 30], ['R8', 30], ['R13', 180], ['R14', 180], ['R15', 30], ['R16', 30], ['R17', 30], ['R20', 30]]) {
  const stZ = L.evaluate({ ...L.initial(), mode: 'station', stationRoute: rc, stationStage: 5, stationTrain: -10, cancelMode: 'zra' }).station;
  assert.equal(stZ.zraSeconds, expectSec, `${rc} zraSeconds must be ${expectSec}`);
}
// Item 4：单车 R17 (D1→D7) 与双车 B (R24) 调车信号三阶段边界（进入、车尾未过、整列越过 r>0 关蓝灯而首区段仍占锁）
let c4 = L.update(L.initial(), { mode: 'station', stationRoute: 'R17', stationStage: 5, stationTrain: -26 });
for (const [pos, expectSig, expectOcc1DG] of [[5, 'B', true], [16, 'B', true], [16.2, 'A', true], [22, 'A', true]]) {
  c4 = L.update(c4, { stationTrain: pos });
  const st4 = L.evaluate(c4).station;
  assert.equal(st4.signals.D1, expectSig, `R17@${pos} D1 aspect`);
  assert.equal(st4.secStates['1DG'].occ, expectOcc1DG, `R17@${pos} 1DG still occupied`);
  assert.equal(st4.relays.SJ, false, `R17@${pos} 1DG stays locked`);
}
const c4BEnter = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'parallel_shunt', stationRoute: 'R18', secondRoute: 'R24', stationStage: 5, stationTrain: -20, secondTrain: 10 }).station;
assert.equal(c4BEnter.signals.D7, 'B');
const c4BCleared = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'parallel_shunt', stationRoute: 'R18', secondRoute: 'R24', stationStage: 5, stationTrain: -20, secondTrain: 22 }).station;
assert.equal(c4BCleared.signals.D7, 'A');
assert.equal(c4BCleared.secStates['11DG'].occ, true);
assert.equal(c4BCleared.secStates['11DG'].unlocked, false);
// Item 5：conflict_queue 逻辑位置/等待/占用一致性（A@75 时 B@78.8/79.0 统一候车于 -12）
for (const pB of [78.8, 79.0, 95.0]) {
  const c5 = L.evaluate({ ...L.initial(), mode: 'station', multiTrainMode: 'conflict_queue', stationRoute: 'R1', secondRoute: 'R20', stationStage: 5, stationTrain: 75, secondTrain: pB }).station;
  assert.equal(c5.multiTrain.bWaitingForA, true);
  assert.equal(c5.multiTrain.trainB, -12);
  assert.equal(c5.secStates['5-9DG'].occ, false);
  assert.equal(c5.secStates['3DG'].occ, true);
}
checks += 49;

// ⑨ 四大专题接口电路（selfHold / turnoutLab / fiveWireLab / cbiIoLab）教材精度与故障—安全回归断言
// (1) selfHold: 图4.2.2 4步自闭 + 图4.3.1 断线 + 图4.3.2–4.3.5 五种防混线（含 wrongMixEnergized / polaritySecondPicked）
{
  let shS = L.update(L.initial(), { mode: 'bench', type: 'selfHold' });
  let shR = L.evaluate(shS).selfHold;
  assert.equal(shR.ajPicked, false);
  assert.equal(shR.wrongMixEnergized, false);
  // Step 1 按下 A → AJ↑
  shS = L.update(shS, { shButton: true });
  shR = L.evaluate(shS).selfHold;
  assert.equal(shR.ajPicked, true);
  assert.equal(shR.startBranchLive, true);
  assert.equal(shS.shLatched, true);
  // Step 2 松开 A → 自闭保持
  shS = L.update(shS, { shButton: false });
  shR = L.evaluate(shS).selfHold;
  assert.equal(shR.ajPicked, true);
  assert.equal(shR.startBranchLive, false);
  assert.equal(shR.holdBranchLive, true);
  // Step 3 FUJ↑ → 切断共用电路 AJ↓
  shS = L.update(shS, { shFujPicked: true });
  shR = L.evaluate(shS).selfHold;
  assert.equal(shR.ajPicked, false);
  assert.equal(shR.commonLive, false);
  // 极性法 FUJ↑ 时 2JBJ 不得误显示吸起
  const shPolFuj = L.evaluate({ ...L.initial(), mode: 'bench', type: 'selfHold', shCrossMethod: 'polarity', shFujPicked: true }).selfHold;
  assert.equal(shPolFuj.polaritySecondPicked, false);
  // naive 混线误吸（即使当前 shCrossMethod 为 position 也不应被覆盖）
  const shNaive = L.evaluate({ ...L.initial(), mode: 'bench', type: 'selfHold', shCrossMethod: 'position', shCrossFault: 'naive' }).selfHold;
  assert.equal(shNaive.wrongMixEnergized, true);
  assert.equal(shNaive.ajPicked, true);
  // 位置法 / 极性法 / 双断法 / 独立电源法 混线防护安全落下
  for (const m of ['position', 'polarity', 'doubleBreak', 'isolatedPower']) {
    const r = L.evaluate({ ...L.initial(), mode: 'bench', type: 'selfHold', shCrossMethod: m, shCrossFault: 'active' }).selfHold;
    assert.equal(r.wrongMixEnergized, false, `${m} active cross must not energize`);
    assert.equal(r.ajPicked, false, `${m} active cross must keep AJ dropped`);
  }
  // 分路法分路线断线 + 混线 → 致命误吸起
  const shBadShunt = L.evaluate({ ...L.initial(), mode: 'bench', type: 'selfHold', shCrossMethod: 'shunt', shCrossFault: 'active', shShuntLineBreak: true }).selfHold;
  assert.equal(shBadShunt.wrongMixEnergized, true);
  assert.equal(shBadShunt.ajPicked, true);
  // 供电断线闭路防护优先
  const shBreak = L.evaluate({ ...L.initial(), mode: 'bench', type: 'selfHold', shCrossFault: 'naive', shWireBreak: true }).selfHold;
  assert.equal(shBreak.wrongMixEnergized, false);
  assert.equal(shBreak.ajPicked, false);
  checks += 24;
}
// (2) turnoutLab: 图5.2.2–5.2.3 挤岔A/B双开、夹异物4阶段仍空转、05-06遮断器仅切动作回线不切静态表示
{
  const toTrail = L.evaluate({ ...L.initial(), mode: 'bench', type: 'turnoutLab', toStage: 0, toIndFault: 'trailThrough' }).turnout;
  assert.equal(toTrail.k11_12, false);
  assert.equal(toTrail.k21_22, false);
  assert.equal(toTrail.k31_32, false);
  assert.equal(toTrail.k41_42, false);
  assert.equal(toTrail.dbjPicked, false);
  assert.equal(toTrail.fbjPicked, false);
  // 尖轨夹异物切到阶段 4 仍维持空转自闭、FBJ↓
  const toJam4 = L.evaluate({ ...L.initial(), mode: 'bench', type: 'turnoutLab', toStage: 4, toObstacle: true }).turnout;
  assert.equal(toJam4.motorRunning, true);
  assert.equal(toJam4.dqj1Picked, true);
  assert.equal(toJam4.dqj1CurrentHold, true);
  assert.equal(toJam4.k11_12, true);
  assert.equal(toJam4.k21_22, false);
  assert.equal(toJam4.fbjPicked, false);
  // 打开机盖（05-06 断开）：阶段 3 动作立即切断停机，但阶段 0/4 静态表示回路不含 05-06 仍保持 DBJ↑/FBJ↑
  const toLid3 = L.evaluate({ ...L.initial(), mode: 'bench', type: 'turnoutLab', toStage: 3, toLidOpen: true }).turnout;
  assert.equal(toLid3.motorRunning, false);
  assert.equal(toLid3.dqj1Picked, false);
  const toLid0 = L.evaluate({ ...L.initial(), mode: 'bench', type: 'turnoutLab', toStage: 0, toLidOpen: true }).turnout;
  assert.equal(toLid0.dbjPicked, true);
  const toLid4 = L.evaluate({ ...L.initial(), mode: 'bench', type: 'turnoutLab', toStage: 4, toLidOpen: true }).turnout;
  assert.equal(toLid4.fbjPicked, true);
  checks += 16;
}
// (3) fiveWireLab: 图5.2.5 阶段1即吸起1DQJF↑、阶段2室内直流转极不受交流缺相提前破坏、阶段3缺相/开盖立即使BHJ↓切断自闭
{
  const fw1 = L.evaluate({ ...L.initial(), mode: 'bench', type: 'fiveWireLab', fwStage: 1 }).fiveWire;
  assert.equal(fw1.dqj1Picked, true);
  assert.equal(fw1.dqj1fPicked, true);
  assert.equal(fw1.bhjPicked, false);
  // 阶段 2 室内直流 24V 缓放转极不受 AC 380V 缺相提前落下
  const fw2Loss = L.evaluate({ ...L.initial(), mode: 'bench', type: 'fiveWireLab', fwStage: 2, fwPhaseLoss: true }).fiveWire;
  assert.equal(fw2Loss.dqj1Picked, true);
  assert.equal(fw2Loss.dqj1SlowHold, true);
  assert.equal(fw2Loss.dqj1fPicked, true);
  assert.equal(fw2Loss.dqj2Reverse, true);
  // 阶段 3 接入三相交流时，缺相或遮断开关 K 断开立即触发 DBQ→BHJ↓ 切断 1DQJ/1DQJF 自闭
  for (const patch of [{ fwPhaseLoss: true }, { fwLidOpen: true }]) {
    const fw3Trip = L.evaluate({ ...L.initial(), mode: 'bench', type: 'fiveWireLab', fwStage: 3, ...patch }).fiveWire;
    assert.equal(fw3Trip.bhjPicked, false);
    assert.equal(fw3Trip.dqj1Picked, false);
    assert.equal(fw3Trip.dqj1fPicked, false);
    assert.equal(fw3Trip.motorRunning, false);
  }
  // 正常阶段 3 → 4 完整转换
  const fw3Ok = L.evaluate({ ...L.initial(), mode: 'bench', type: 'fiveWireLab', fwStage: 3 }).fiveWire;
  assert.equal(fw3Ok.bhjPicked, true);
  assert.equal(fw3Ok.motorRunning, true);
  const fw4Ok = L.evaluate({ ...L.initial(), mode: 'bench', type: 'fiveWireLab', fwStage: 4 }).fiveWire;
  assert.equal(fw4Ok.fbjPicked, true);
  assert.equal(fw4Ok.bhjPicked, false);
  checks += 19;
}
// (4) cbiIoLab: 图13.2.2–13.2.4 全部 4 种体制在 4 类致命故障下的安全导向（含 dynamicIn inputValid=false）
{
  for (const mode of ['pulseTrans', 'capPump', 'staticIn', 'dynamicIn']) {
    const okOn = L.evaluate({ ...L.initial(), mode: 'bench', type: 'cbiIoLab', cbiMode: mode, cbiCmd: true, cbiFault: 'none' }).cbiIo;
    assert.equal(okOn.relayPicked, true, `${mode} cmd=true normal must pick`);
    assert.equal(okOn.inputValid, true, `${mode} normal inputValid`);
    const okOff = L.evaluate({ ...L.initial(), mode: 'bench', type: 'cbiIoLab', cbiMode: mode, cbiCmd: false, cbiFault: 'none' }).cbiIo;
    assert.equal(okOff.relayPicked, false, `${mode} cmd=false normal must drop`);
    for (const flt of ['stuckHigh', 'stuckLow', 'wireOpen', 'diodeShort']) {
      const fRes = L.evaluate({ ...L.initial(), mode: 'bench', type: 'cbiIoLab', cbiMode: mode, cbiCmd: true, cbiFault: flt }).cbiIo;
      assert.equal(fRes.relayPicked, false, `${mode}+${flt} must fail-safe drop`);
      assert.equal(fRes.inputValid, false, `${mode}+${flt} must mark inputValid=false`);
    }
  }
  checks += 44;
}

// ⑩ 全项目复核新增回归断言（第5.1节信号机继电器/方向ZXJ、图5.1.3、题库c5-2/c5-4）
{
  const sigUsu = L.evaluate({ ...L.initial(), mode: 'signal', signalType: 'inStation', signalAspect: 'USU' }).signal;
  assert.equal(sigUsu.relays.CTXJ, true, 'USU must use CTXJ per PDF p.70');
  assert.equal(sigUsu.relays.SNJ, true, 'USU must use SNJ per PDF p.70');
  assert.equal(sigUsu.relays.DJ2, true);
  assert.deepEqual(sigUsu.lit, ['U1', 'U2']);
  const sigHb = L.evaluate({ ...L.initial(), mode: 'signal', signalType: 'inStation', signalAspect: 'HB' }).signal;
  assert.equal(sigHb.relays.YXJ, true);
  assert.equal(sigHb.relays.DJ2, true, 'HB YB lamp must be supervised by 2DJ per PDF p.70');
  // 四显示两方向出站：主方向 ZXJ↑，点亮反向方向表示器时 ZXJ↓ 且 3DJ↑（图5.1.3 PDF p.73-74）
  const depMain = L.evaluate({ ...L.initial(), mode: 'signal', signalType: 'depFour', signalAspect: 'L', signalIndicator: '' }).signal;
  assert.equal(depMain.relays.ZXJ, true);
  const depRev = L.evaluate({ ...L.initial(), mode: 'signal', signalType: 'depFour', signalAspect: 'L', signalIndicator: 'right' }).signal;
  assert.equal(depRev.relays.ZXJ, false, 'Reverse departure with indicator must have ZXJ↓ per 图5.1.3');
  assert.equal(depRev.relays.DJ3, true, 'Reverse departure with indicator must supervise 3DJ↑ per 图5.1.3');
  // 题库 c5-2 四线制表示变压器电压为 AC 220V；c5-4 自动开闭器先动为内侧 B 爪
  const Curr = require('../dist/curriculum.js');
  const q52 = Curr.QUESTIONS.find(q => q.id === 'c5-2');
  const q54 = Curr.QUESTIONS.find(q => q.id === 'c5-4');
  assert.ok(q52 && q52.a.includes('AC 220V') && !q52.a.includes('BB110V'));
  assert.ok(q54 && q54.a.includes('内侧 B 爪') && !q54.a.includes('外侧/B 爪'));
  checks += 11;
}

console.log(`通过 ${checks} 项全书 1–13 章路径、127 题库、继电器状态、第2.3/5.1/5.2/7章电路、四大专题接口、多列车同时运行与表3.2.2全部33条进路同步断言`);
