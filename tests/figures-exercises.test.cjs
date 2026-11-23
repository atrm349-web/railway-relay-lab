const assert = require('assert');
const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
globalThis.window = globalThis;
const FigYard = require(path.join(distDir, 'figdata-yard.js'));
const FigCirA = require(path.join(distDir, 'figdata-circuit-a.js'));
const FigCirB = require(path.join(distDir, 'figdata-circuit-b.js'));
const FigSys = require(path.join(distDir, 'figdata-sys.js'));
const Curr = require(path.join(distDir, 'curriculum.js'));
const FigLab = require(path.join(distDir, 'figlab.js'));

let count = 0;
function ok(cond, msg) { assert.ok(cond, msg); count++; }
function eq(a, b, msg) { assert.strictEqual(a, b, msg); count++; }

// ① 全书 168 幅插图覆盖完整性与渲染零 NaN/undefined 核查
const allFigs = FigLab.getAllFigures();
eq(allFigs.length, 168, '全书插图总数必须严格为 168 幅');
eq(FigYard.length, 34, '站场引擎覆盖 34 幅图');
eq(FigCirA.length, 43, '第4-6章电路引擎覆盖 43 幅图');
eq(FigCirB.length, 60, '第7-13章电路引擎覆盖 60 幅图');
eq(FigSys.length, 31, '系统/流程/冗余引擎覆盖 31 幅图');

const idSet = new Set();
for (const fig of allFigs) {
  ok(!idSet.has(fig.id), `重复图号: ${fig.id}`);
  idSet.add(fig.id);
  ok(fig.page >= 1 && fig.page <= 277, `图 ${fig.id} 页码越界: ${fig.page}`);
  const imgFile = path.join(distDir, 'textbook', `page-${String(fig.page).padStart(3, '0')}.jpg`);
  ok(fs.existsSync(imgFile), `图 ${fig.id} 缺失教材原页图: ${imgFile}`);
  const st = FigLab.getFigState(fig);
  const svg = FigLab.renderFigureCanvas(fig, st);
  ok(svg && svg.startsWith('<svg') && svg.endsWith('</svg>'), `图 ${fig.id} SVG 渲染无效`);
  ok(!svg.includes('NaN') && !svg.includes('undefined'), `图 ${fig.id} SVG 包含 NaN 或 undefined`);
}

// ② 整本教材全部 127 道课后习题 100% 绑定可运行仿真
eq(Curr.QUESTIONS.length, 127, '课后习题总数必须严格为 127 题');
for (const q of Curr.QUESTIONS) {
  ok(Boolean(q.go && q.go.mode), `习题 ${q.id} 缺失 .go 交互仿真入口`);
  ok(Boolean(q.figId && idSet.has(q.figId)), `习题 ${q.id} 关联图号无效: ${q.figId}`);
  if (q.go.mode === 'figures') {
    ok(idSet.has(q.go.figureId), `习题 ${q.id} 指向不存在的图号: ${q.go.figureId}`);
  }
}

// ③ 站场物理与联锁核心断言
function getFig(id) { return allFigs.find(f => f.id === id); }

// 图 3.1.1：c3-12 (上行接车 S->4G) 与 c3-13 (3G->D2 调车发车)
{
  const f311 = getFig('3.1.1');
  const st = FigLab.getFigState(f311);
  // c3-12: 上行接车 S->4G
  st.routeIdx = 0; st.trainT = 0; Object.assign(st.switches, f311.routes[0].reqSw);
  let ev = FigLab.evaluateYard(f311, st);
  eq(ev.conflictMsg, '', '图3.1.1 c3-12 正确道岔位不应冲突');
  eq(ev.sigAspects.S, 'UU', '图3.1.1 c3-12 上行侧线接4G应开放双黄 UU');
  st.trainT = 0.22; // 首轮压入 S_AG
  ev = FigLab.evaluateYard(f311, st);
  eq(ev.sigAspects.S, 'H', '图3.1.1 c3-12 首轮压入内方后 S 必须关闭红灯 H');

  // c3-13: 3G -> D2 调车发车
  st.routeIdx = 1; st.trainT = 0; Object.assign(st.switches, f311.routes[1].reqSw);
  ev = FigLab.evaluateYard(f311, st);
  eq(ev.conflictMsg, '', '图3.1.1 c3-13 正确道岔位不应冲突');
  eq(ev.sigAspects.X3, 'B', '图3.1.1 c3-13 调车发车 X3 应开放月白灯 B');
  st.trainT = 0.72; // 整列越过 X3
  ev = FigLab.evaluateYard(f311, st);
  eq(ev.sigAspects.X3, 'H', '图3.1.1 c3-13 整列越过 X3 后应关闭');
}

// 图 2.1.1：四显示自动闭塞分区物理追踪
{
  const f211 = getFig('2.1.1');
  const st = FigLab.getFigState(f211);
  st.trainT = 0.25; // 列车位于 1G
  let ev = FigLab.evaluateYard(f211, st);
  eq(ev.sigAspects['S甲'], 'H', '列车在 1G 时，S甲 必须显示红灯 H');
  st.trainT = 0.42; // 列车进入 2G 且出清 1G
  ev = FigLab.evaluateYard(f211, st);
  ok(['U', 'H'].includes(ev.sigAspects['S甲']), '列车在 2G 时 S甲 应降级为 U/H');
  st.trainT = 0.85; // 列车进入乙站
  ev = FigLab.evaluateYard(f211, st);
  eq(ev.sigAspects['S甲'], 'L', '前方≥3闭塞分区空闲时 S甲 应恢复绿灯 L');
}

// 图 3.1.2 & 3.2.1：条件侵限拦截
{
  const f312 = getFig('3.1.2');
  const st = FigLab.getFigState(f312);
  st.ctrl.occ105 = true;
  let ev = FigLab.evaluateYard(f312, st);
  ok(ev.conflictMsg.length > 0 && ev.sigAspects.D9 === 'A', '图3.1.2 105-108DG占用时必须拦截 D9 保持蓝灯');
  st.ctrl.occ105 = false;
  ev = FigLab.evaluateYard(f312, st);
  eq(ev.conflictMsg, '', '图3.1.2 105-108DG空闲后允许开放 D9');
  eq(ev.sigAspects.D9, 'B', '图3.1.2 空闲后 D9 亮月白灯 B');

  const f321 = getFig('3.2.1');
  const s321 = FigLab.getFigState(f321);
  s321.ctrl.occ12 = true; s321.routeIdx = 0; s321.switches['12'] = 'N';
  ok(FigLab.evaluateYard(f321, s321).conflictMsg.length > 0, '图3.2.1 12定位+12DG占用触发条件侵限');
  s321.routeIdx = 1; s321.switches['12'] = 'R';
  eq(FigLab.evaluateYard(f321, s321).conflictMsg, '', '图3.2.1 12转反位后解除条件侵限');
}

// ④ 继电电路与安全电子物理定律核心断言
function runPreset(figId, presetIdx) {
  const fig = getFig(figId);
  const st = FigLab.getFigState(fig);
  Object.assign(st.inputs, fig.presets[presetIdx].set);
  FigLab.solveLadder(fig, st, 0);
  return st;
}

// 图 4.2.2 自闭保持与 FUJ 复原
{
  const st = runPreset('4.2.2', 0); // 按下 A
  eq(st.relays.AJ, true, '图4.2.2 按 A 后 AJ 必须吸起');
  runPreset('4.2.2', 1); // 松开 A
  eq(st.relays.AJ, true, '图4.2.2 松开 A 后 AJ 必须靠自闭保持吸起');
  runPreset('4.2.2', 3); // FUJ 吸起
  eq(st.relays.AJ, false, '图4.2.2 FUJ↑ 后 AJ 必须可靠落下');
}

// 图 4.3.2 & 4.3.4 & 4.3.5 混线防护
{
  const s432 = runPreset('4.3.2', 0);
  eq(s432.relays.DBJ_unsafe, true, '图4.3.2(a) 同端供电混线导致 DBJ 危险误吸');
  eq(s432.relays.DBJ_safe, false, '图4.3.2(b) 远端供电混线使 DBJ 安全落下');

  const s434 = runPreset('4.3.4', 0);
  eq(s434.relays.DBJ3_single, true, '图4.3.4(a) 单断 Q 线混线导致 3DBJ 危险误吸');
  eq(s434.relays.DBJ3_double, false, '图4.3.4(b) 双断法 Q/H 隔离 3DBJ 保持安全落下');

  const s435 = runPreset('4.3.5', 1);
  eq(s435.relays.KJF, true, '图4.3.5 分路线断线+混线导致 KJF 误吸（证伪故障-安全）');
}

// 图 5.1.2 (2DJ防升级) & 图 5.1.3 (反向3DJ监督) & 图 5.3.2 (一送三受)
{
  const s512 = runPreset('5.1.2', 3); // UU + 2DJ↓
  eq(s512.relays.LAMP_U1, false, '图5.1.2 2DJ↓ 必须切断 U1 严防双黄升级成单黄');
  const s513 = runPreset('5.1.3', 1); // 反向 3DJ↓
  eq(s513.relays.LAMP_L, false, '图5.1.3 反向表示器 3DJ↓ 必须切断绿灯 L');
  const s532 = runPreset('5.3.2', 2); // 分支2断线
  eq(s532.relays.DGJ_MAIN, false, '图5.3.2 一送三受分支2断线必须切断主 DGJ↓');
}

// 图 7.3.4 单置三继电器 4 功能精确编码
{
  let st = runPreset('7.3.4', 0);
  ok(st.relays.AJ1 && st.relays.AJ && !st.relays.AJ2, '图7.3.4 始端编码必须为 1AJ↑·AJ↑·2AJ↓');
  st = runPreset('7.3.4', 1);
  ok(st.relays.AJ1 && !st.relays.AJ && st.relays.AJ2, '图7.3.4 终端编码必须为 1AJ↑·2AJ↑·AJ↓');
  st = runPreset('7.3.4', 2);
  ok(st.relays.AJ1 && st.relays.AJ && st.relays.AJ2, '图7.3.4 变通编码必须三者全吸');
}

// 图 8.3.2 ZCJ 不因 GJJ 先落提前解除照查
{
  let st = runPreset('8.3.2', 1);
  eq(st.relays.ZCJ, false, '图8.3.2 进路锁闭后 ZCJ 落下');
  st = runPreset('8.3.2', 2); // GJJ↓ 但 11SJ 仍↓
  eq(st.relays.ZCJ, false, '图8.3.2 列车压入后 GJJ 先落但 11SJ 未解锁，ZCJ 必须保持↓不提前解除照查');
}

// 图 8.8.6 红灯双断丝严禁引导
{
  const st = runPreset('8.8.6', 2);
  eq(st.relays.YXJ, false, '图8.8.6 红灯双断丝 1DJF↓ 必须严禁开放引导 YXJ');
}

// 图 9.5.8 电源分流 & 图 9.6.1 运行前方严禁区故解
{
  eq(runPreset('9.5.8', 0).relays.KF_IMM, true, '图9.5.8 预先锁闭选普通 KF');
  eq(runPreset('9.5.8', 1).relays.KF_3MIN, true, '图9.5.8 列车接近锁闭选 KF-3min');
  eq(runPreset('9.5.8', 2).relays.KF_30S, true, '图9.5.8 调车/侧发接近锁闭选 KF-30s');
  eq(runPreset('9.6.1', 0).relays.LJ12_SJ, true, '图9.6.1 DGJF↑·QJJ↓ + SGA+ZRA 允许区故解');
  eq(runPreset('9.6.1', 1).relays.LJ12_SJ, false, '图9.6.1 运行前方 QJJ↑ 绝对禁止区故解');
  eq(runPreset('9.6.1', 2).relays.LJ12_SJ, false, '图9.6.1 区段有车 DGJF↓ 绝对禁止区故解');
}

// 图 13.2.2(a) 4光耦 OC2 开路必须破坏 0101 输出非法码 0001
{
  const f = getFig('13.2.2');
  const st = FigLab.getFigState(f);
  st.ctrl.subMode = 'a'; st.ctrl.jUp = true; st.ctrl.ocFault = 'oc2_open';
  const svg = FigLab.renderFigureCanvas(f, st);
  ok(svg.includes('【0001】') && svg.includes('非法故障码'), '图13.2.2(a) J↑ 下 OC2 开路必须产出 0001 非法故障码');
}

// ⑤ 深度复查新增物理、缓放、站场拓扑与 jump3d 键名回归断言
{
  // (a) 缓放 1.0× 真实计时（绝不 5× 加速扣减）
  const f632 = getFig('6.3.2');
  const s632 = FigLab.getFigState(f632);
  Object.assign(s632.inputs, f632.presets[0].set);
  FigLab.solveLadder(f632, s632, 0);
  eq(s632.relays.AJ, true, '图6.3.2 按 XLA 后 AJ 吸起');
  Object.assign(s632.inputs, f632.presets[2].set); // 选路完毕切自闭
  FigLab.solveLadder(f632, s632, 0.1);
  eq(s632.relays.AJ, true, '图6.3.2 缓放 0.4s，经过 0.1s 仍须保持吸起（防止 5× 错扣）');
  ok(Math.abs(s632.relayDecay.AJ - 0.3) < 0.02, `图6.3.2 经过 0.1s 剩余缓放应≈0.3s，实为 ${s632.relayDecay.AJ}`);
  FigLab.solveLadder(f632, s632, 0.35);
  eq(s632.relays.AJ, false, '图6.3.2 累计 0.45s > 0.4s 后 AJ 必须可靠落下');

  // (b) 图 7.3.4 选路完毕复原（Preset ④ 须切落 1AJ/AJ/2AJ 至全↓）
  const s734 = runPreset('7.3.4', 3);
  ok(!s734.relays.AJ1 && !s734.relays.AJ && !s734.relays.AJ2, '图7.3.4 选路通过 JXJ6后切自闭必须复原三继电器全↓');

  // (c) 图 3.1.1 习题 c3-13（3G → D₂ 经 10反、6/8定、2/4反）必须逐段分路 6-10DG / 4-2DG / 2DG 且不串扰邻线
  const f311 = getFig('3.1.1');
  const s311 = { routeIdx: 1, playing: false, trainT: 0, switches: {}, clearedAt: {}, ctrl: {} };
  f311.switches.forEach(sw => { s311.switches[sw.id] = sw.defPos || 'N'; });
  Object.entries(f311.routes[1].reqSw).forEach(([k, v]) => { s311.switches[k] = v; });
  const occ311 = new Set();
  for (let i = 0; i <= 50; i++) {
    s311.trainT = i / 50;
    const ev = FigLab.evaluateYard(f311, s311);
    Object.entries(ev.secStates).forEach(([k, v]) => { if (v === 'occ') occ311.add(k); });
  }
  for (const reqSec of ['6-10DG', '4-2DG', '2DG']) {
    ok(occ311.has(reqSec), `图3.1.1 c3-13 必须实际分路区段 ${reqSec}`);
  }
  ok(!occ311.has('IG') && !occ311.has('IIG') && !occ311.has('4G'), '图3.1.1 c3-13 绝不得串扰邻线股道 IG/IIG/4G');

  // (d) 起点三节车厢间距分离（绝不叠压穿模）
  const ev0 = FigLab.evaluateYard(f311, { ...s311, trainT: 0 });
  const d01 = Math.hypot(ev0.cars[0].x - ev0.cars[1].x, ev0.cars[0].y - ev0.cars[1].y);
  const d12 = Math.hypot(ev0.cars[1].x - ev0.cars[2].x, ev0.cars[1].y - ev0.cars[2].y);
  ok(d01 >= 29 && d12 >= 29, `起点三节车厢中心距必须≥29px 防叠压，实测 ${d01.toFixed(1)} / ${d12.toFixed(1)}`);

  // (e) 图 2.1.9 警冲标 tailPos=0 不得被 0||-10 误跳，tailPos>0 必须联锁封锁 X 红灯
  const f219 = getFig('2.1.9');
  const s219 = FigLab.getFigState(f219);
  s219.ctrl.tailPos = 0;
  ok(FigLab.renderFigureCanvas(f219, s219).includes('安全 0m'), '图2.1.9 tailPos=0 必须精确显示 0m');
  s219.ctrl.tailPos = 6;
  const ev219 = FigLab.evaluateYard(f219, s219);
  ok(ev219.conflictMsg.length > 0 && ev219.sigAspects.X === 'H', '图2.1.9 越过警冲标(+6m)必须联锁封锁 X 为红灯 H');

  // (f) 图 4.1.1 无重力对比演示失电后必须卡滞吸起位
  const f411 = getFig('4.1.1');
  const s411 = FigLab.getFigState(f411);
  s411.ctrl.volt = 24; s411.ctrl.weightBroken = false;
  FigLab.renderFigureCanvas(f411, s411);
  s411.ctrl.weightBroken = true; s411.ctrl.volt = 0;
  ok(FigLab.renderFigureCanvas(f411, s411).includes('失电卡滞吸起位'), '图4.1.1 取消重力返还后失电必须演示卡滞吸起位');

  // (g) 所有 jump3d / 课后习题 .go 的状态键名必须全部在 logic.js 合法 Schema 内
  const L = require(path.join(distDir, 'logic.js'));
  const validKeys = new Set(Object.keys(L.initial()));
  for (const f of FigLab.getAllFigures()) {
    if (f.jump3d && f.jump3d.go) {
      for (const k of Object.keys(f.jump3d.go)) {
        ok(validKeys.has(k), `图 ${f.id} jump3d 键名 ${k} 必须是 logic.js 合法状态键`);
      }
      if (f.jump3d.go.cbiMode) {
        ok(['staticIn', 'dynamicIn', 'pulseTrans', 'capPump'].includes(f.jump3d.go.cbiMode), `图 ${f.id} cbiMode 必须合法`);
      }
    }
  }
}

console.log(`通过 ${count} 项全书 168 幅插图覆盖、127 道课后习题模拟联动与物理/联锁核心定律回归断言`);
