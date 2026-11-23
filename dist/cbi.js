(function (root) {
  'use strict';

  // 表 3.2.2 下行咽喉联锁表交互实操题（严格逐格核对知识库 images/page-042.jpg & page-043.jpg 原表）
  const LOCK_ROUTES = [
    {
      id: 'R1', name: '① 列车接车：北京方面 X 至 IG (正线)', page: 42,
      options: {
        buttons: ['XLA、SⅠLA', 'XLA、SⅠDA', 'SⅠLA、XLA'],
        aspect: ['U（单黄灯）', 'UU（双黄灯）', 'L（绿灯）'],
        switches: ['1/3、5/7、11', '(1/3)、5/7、11', '1/3、5/7、(11)'],
        hostile: ['D1、D3、D7、SⅠ', 'D1、D5、SⅡ', 'D7、D3、D1、X'],
        sections: ['IAG、1DG、1/7G、7-11DG、IG', 'IAG、1DG、1/7G、7-11DG（不含IG）', '1DG、1/7G、7-11DG、IG'],
        headOn: '列车 IG ｜ 调车 IG'
      },
      answer: { buttons: 'XLA、SⅠLA', aspect: 'U（单黄灯）', switches: '1/3、5/7、11', hostile: 'D1、D3、D7、SⅠ', sections: 'IAG、1DG、1/7G、7-11DG、IG' },
      note: '教材 PDF p.42 表 3.2.2 第 1 条：接车终端按钮取反向出站按钮 SⅠLA；接车进路范围包含股道 IG；全部道岔定位，正线接车开放单黄 U（注：PDF 51 页首段误印双黄属于原文笔误，应以本表为准）。',
      sandRoute: 'IG'
    },
    {
      id: 'R3', name: '③ 列车接车：北京方面 X 至 3G (侧线)', page: 42,
      options: {
        buttons: ['XLA、S3LA', 'XLA、S3DA', 'XLA、D7A'],
        aspect: ['UU（双黄灯）', 'U（单黄灯）', 'LU（绿黄灯）'],
        switches: ['1/3、5/7、(11)', '1/3、(5/7)、(11)', '1/3、5/7、11'],
        hostile: ['D1、D3、D7、S3', 'D1、D5、S3', 'D1、D3、SⅠ'],
        sections: ['IAG、1DG、1/7G、7-11DG、3G', 'IAG、1DG、3DG、5-9DG、3G', 'IAG、1DG、1/7G、7-11DG'],
        headOn: '列车 3G ｜ 调车 3G'
      },
      answer: { buttons: 'XLA、S3LA', aspect: 'UU（双黄灯）', switches: '1/3、5/7、(11)', hostile: 'D1、D3、D7、S3', sections: 'IAG、1DG、1/7G、7-11DG、3G' },
      note: '表 3.2.2 第 3 条：11 号道岔反位用圆括号 (11) 表示；接侧线须经 11 号道岔反位，进站信号机 X 点双黄灯 UU。',
      sandRoute: '3G'
    },
    {
      id: 'R5', name: '⑤ 列车发车：由 IG 向北京方面 (S₁ → X)', page: 42,
      options: {
        buttons: ['SⅠLA、XLA', 'XLA、SⅠLA', 'SⅠLA、XTA'],
        aspect: ['L（绿灯 + 右表示器）', 'U（单黄灯）', 'L（无表示器）'],
        switches: ['11、5/7、1/3', '1/3、5/7、(11)', '(11)、5/7、1/3'],
        hostile: ['D7、D3、D1、X', 'D1、D3、D7、SⅠ', 'D5、D1、X'],
        sections: ['7-11DG、1/7G、1DG、IAG', 'IG、7-11DG、1/7G、1DG、IAG', '7-11DG、1/7G、1DG'],
        headOn: '其他联锁：BS（闭塞条件）'
      },
      answer: { buttons: 'SⅠLA、XLA', aspect: 'L（绿灯 + 右表示器）', switches: '11、5/7、1/3', hostile: 'D7、D3、D1、X', sections: '7-11DG、1/7G、1DG、IAG' },
      note: '表 3.2.2 第 5 条与图 2.6.1 铁律：【发车进路不含出发股道 IG】，区间运行须通过 SⅠ 且点亮方向表示器“右”（发车其他联锁检查 BS 闭塞）。',
      sandRoute: 'DEP'
    },
    {
      id: 'R17', name: '⑰ 调车进路：D₁ 至 D₇', page: 43,
      options: {
        buttons: ['D1A、D3A', 'D1A、D7A', 'D3A、D1A'],
        aspect: ['B（月白灯）', 'U（黄灯）', 'A（蓝灯）'],
        switches: ['1/3', '(1/3)', '1/3、5/7'],
        hostile: ['X、D3、<5/7>(SⅠ、S3)', 'X、D3、SⅠ、S3', 'X、D3'],
        sections: ['1DG', 'IAG、1DG', '1DG、1/7G'],
        headOn: '无迎面'
      },
      answer: { buttons: 'D1A、D3A', aspect: 'B（月白灯）', switches: '1/3', hostile: 'X、D3、<5/7>(SⅠ、S3)', sections: '1DG' },
      note: '表 3.2.2 第 17 条两大难点：①终端阻拦信号机 D7 为差置信号机（与 D3 分居 1/7G 两端背向差置，§2.6.2(3) PDF p.32），故终端按钮取【背向差置按钮 D3A】！②<5/7>(SⅠ、S3) 用尖括号标明仅当 5/7 在定位时 SⅠ、S3 方为条件敌对！',
      sandRoute: 'SHUNT'
    },
    {
      id: 'R20', name: '⑳ 调车进路：D₅ 至 IG', page: 43,
      options: {
        buttons: ['D5A、SⅠDA', 'D5A、SⅠLA', 'D5A、XLA'],
        aspect: ['B（月白灯）', 'U（单黄灯）', 'H（红灯）'],
        switches: ['(5/7)、11', '5/7、11', '(5/7)、(11)'],
        hostile: ['XF、SⅠ、<(3)>X', 'XF、SⅠ、X', 'D7、SⅠ'],
        sections: ['5-9DG、7-11DG', '5-9DG、7-11DG、IG', '3DG、5-9DG、7-11DG'],
        headOn: '列车 IG'
      },
      answer: { buttons: 'D5A、SⅠDA', aspect: 'B（月白灯）', switches: '(5/7)、11', hostile: 'XF、SⅠ、<(3)>X', sections: '5-9DG、7-11DG' },
      note: '表 3.2.2 第 20 条：同一咽喉既有列车按钮 SⅠLA 也有调车按钮 SⅠDA，调车终端必按【SⅠDA】；且敌对信号中 `<(3)>X` 表示当双动道岔 1/3 处于反位 `(3)` 时，进站 X 才构成条件敌对！',
      sandRoute: 'R20'
    },
    {
      id: 'R27', name: '㉗ 调车进路：S₁ 向 X_F', page: 43,
      options: {
        buttons: ['S₁DA、SDZA', 'S₁LA、XFLA', 'S₁DA、D1A'],
        aspect: ['B（月白灯）', 'L（绿灯）', 'A（蓝灯）'],
        switches: ['11、(5/7)、1/3', '11、5/7、1/3', '(11)、(5/7)、1/3'],
        hostile: ['D5、XF', 'D5、X', 'D7、D5、XF'],
        sections: ['7-11DG、5-9DG、3DG', 'IG、7-11DG、5-9DG', '7-11DG、1/7G、1DG'],
        headOn: '无迎面'
      },
      answer: { buttons: 'S₁DA、SDZA', aspect: 'B（月白灯）', switches: '11、(5/7)、1/3', hostile: 'D5、XF', sections: '7-11DG、5-9DG、3DG' },
      note: '表 3.2.2 第 27 条与第 2.6.2(6) 节（PDF p.32／书 22 页）：因 D₅ 位于反方向位置无法作终端，故专设调车终端按钮【SDZA】（也可按进站信号机方向命名为 X_F DZA）；反方向出岔不走 IAG。',
      sandRoute: 'R27'
    }
  ];

  // 内部交互状态
  const state = {
    overLimitOn: true,
    neighborOcc: false,
    yardRange: 'receive', // 'receive' | 'depart' | 'through' | 'shunt'
    switchQIdx: 0,
    switchQChoice: null,
    lockIdx: 0,
    lockDraft: {},
    lockChecked: false,
    redMode: '2x2oo2', // 'hotStandby' | '2oo2' | '2oo3' | '2x2oo2'
    redFaults: { A1: false, A2: false, B1: false, B2: false, C: false },
    dataRouteIdx: 0,
    dataFlags: { reserved: false, locked: true, wasOccupied: false, occupied: false, sigOpened: true },
    mod6502Idx: 0,
    modQuizChoice: null,
    // 第 2.4–2.5 节 扩展状态：渡线双动/单动超限特例与四大站场道岔定位场景
    crossoverDouble: true,
    switchNormalScene: 'singleLine', // 'singleLine' | 'safetyTrack' | 'doubleLine' | 'facingTrailing'
    trainMoveRight: true,
    // 第 5.2–5.3 节 室外设备接口实验室状态
    ifc5TurnoutStage: 0,
    ifc5SjLocked: false,
    ifc5IndFault: 'none', // 'none' | 'wireCross' | 'capShort' | 'capOpen' | 'trailThrough'
    ifc5TrackShunt: false,
    ifc5BranchFault: false,
    ifc5Traction50Hz: true,
    ifc5JointBroken: false,
    ifc5PhaseCrossed: true,
    // 第 7 章 1–7 线选排与选岔实验室状态
    selRouteIdx: 0,
    selStep: 6, // 1..6
    selFault: 'none', // 'none' | 'secBusy' | 'headOnGjj' | 'noDbj'
    selFigKey: '7-9-3',
    // 第 13.2 节 故障—安全静态 4 光耦编码与电荷泵微电路状态
    fsRelayJUp: true,
    fsOcFaults: ['ok', 'ok', 'ok', 'ok'], // each: 'ok' | 'open' | 'short'
    fsPumpPhase: 'high', // 'low' | 'high' | 'stuckHigh' | 'd1Short'
  };

  // 第 7 章（7.2 / 7.9 / 7.10 节）1–7 线选排典型进路数据（严格对应图 3.1.1、图 7.2.1、图 7.9.1–7.9.3、图 7.10.1）
  const ROUTES_1_7 = [
    {
      id: 'X_IG', name: '① X → IG 下行正线接车（图7.2.1 / 图7.10.1）',
      buttons: 'XLA（始端）+ S₁LA（终端）',
      aj: 'XLAJ↑ · S₁LAJ↑', fj: 'LJJ↑（列车接车方向）',
      line12: '不经 1、2 线（5/7 要求定位）',
      line34: '不经 3、4 线（1/3 要求定位）',
      line56: 'XJXJ↑ → 1/3-1DCJ↑ → D₃JXJ↑ → D₇JXJ↑ → 5/7-2DCJ↑ → 11DCJ↑ → S₁JXJ↑（自左向右顺序励磁）',
      line7: 'KZ → XFKJ↑ → 1/3(1SJ↑·DBJ↑·1DCJ↑) → 5/7(2DCJ↑·DBJ↑·2SJ↑) → 11(SJ↑·DBJ↑·DCJ↑) → S₁ZJ↓ → XKJ↑',
      switches: '1/3定位 · 5/7定位 · 11定位',
      sandRoute: 'IG'
    },
    {
      id: 'X_4G', name: '② X → 4G 侧线接车（经 3、4 线选捺形 1/3 反位）',
      buttons: 'XLA（始端）+ S₄LA（终端）',
      aj: 'XLAJ↑ · S₄LAJ↑', fj: 'LJJ↑（列车接车方向）',
      line12: '不经 1、2 线（5/7 在本进路不走反位）',
      line34: '✓ 经 3、4 线选“八”字第二笔捺形 1/3 双动反位：1FCJ↑ 自闭 → 2FCJ↑ 自闭（D₃/D₄ 防 KF 串电）',
      line56: '1/3-2FCJ↑ 接通 5、6 线 → 5/7-1DCJ↑ → D₅JXJ↑ → 9FCJ↑ → S₄JXJ↑',
      line7: 'KZ → XFKJ↑ → 1/3(1SJ↑·FBJ↑·1FCJ↑) → 5/7(1DCJ↑·DBJ↑·1SJ↑) → 9(SJ↑·FBJ↑·FCJ↑) → S₄ZJ↓ → XKJ↑',
      switches: '(1/3)反位 · 5/7定位 · (9)反位',
      sandRoute: 'R4'
    },
    {
      id: 'XF_3G', name: '③ X_F → 3G 反方向接车（经 1、2 线选撇形 5/7 反位）',
      buttons: 'XFLA（始端）+ S₃LA（终端）',
      aj: 'XFLAJ↑ · S₃LAJ↑', fj: 'LJJ↑（列车接车方向）',
      line12: '✓ 经 1、2 线选“八”字第一笔撇形 5/7 双动反位（图7.9.1）：1FCJ↑ 自闭 → 2FCJ↑ 自闭',
      line34: '不经 3、4 线（1/3 要求定位）',
      line56: '1/3-2DCJ↑ → D₅JXJ↑ → (由 1-2 线 5/7-2FCJ↑ 转入) → 11FCJ↑ → S₃JXJ↑',
      line7: 'KZ → XFFKJ↑ → 1/3(2SJ↑·DBJ↑·2DCJ↑) → 5/7(2FCJ↑·FBJ↑·2SJ↑) → 11(SJ↑·FBJ↑·FCJ↑) → S₃ZJ↓ → XFKJ↑',
      switches: '1/3定位 · (5/7)反位 · (11)反位',
      sandRoute: 'R11'
    },
    {
      id: 'D7_IG', name: '④ D₇ → IG 调车进路（图7.9.3 教材原图实例）',
      buttons: 'D₇A（始端）+ S₁DA（终端）',
      aj: 'D₇AJ↑ · S₁DAJ↑', fj: 'DJJ↑（调车由左向右方向，供 KF-共用-Q）',
      line12: '不经 1、2 线（5/7 要求定位）',
      line34: '不经 3、4 线',
      line56: 'KZ → D₇XJJ后 → D₇JXJ↑ → 5/7-2DCJ↑(检7-11DG: QJJ↓·CJ↑·DGJ↑) → 11DCJ↑(检S₁: GJJ↓·DAJ↑) → S₁JXJ↑',
      line7: 'KZ → D₇FKJ↑ → 5/7(2DCJ↑·DBJ↑·2SJ↑) → 11(SJ↑·DBJ↑·DCJ↑) → S₁ZJ↑(调车终端) → D₇KJ↑',
      switches: '5/7定位 · 11定位',
      sandRoute: 'R24'
    }
  ];

  // 第 6.3 节 12 种定型组合 & 图 6.3.1 典型小站下行咽喉组合连接表（严格依据 PDF p.98–101）
  const MODULES_6502 = [
    {
      id: 'SW11', equip: '单动道岔 9 / 11', combo: 'DD（单动道岔组合）', figTag: '1 / 2 · DD',
      relays: '表6.3.1 全10槽：0整流/RD₁~₄ · 1:BB · 2:1DQJ(125/0.44) · 3:SJ · 4:2DQJ(135/220) · 5:AJ · 6:DCJ · 7:FCJ · 8:DBJ · 9:FBJ',
      why: '每组道岔继电器不超过 10 个，故 1 套定型 DD 组合即可独立完成 1 组单动道岔的启动、转极、锁闭与半波表示。'
    },
    {
      id: 'SW1_3', equip: '双动道岔 1/3 · 5/7', combo: 'SDZ + SDF（双动主+半个辅组合）', figTag: 'II-1/II-1B · I-1/I-1A',
      relays: '含 1SJ/2SJ（左/右侧独立锁闭）、1DCJ/1FCJ、2DCJ/2FCJ、1DQJ、2DQJ、DBJ/FBJ 及复示 DBJF/FBJF',
      why: '双动道岔继电器数量超过单个组合架 10 槽上限，因此拆成双动主组合 SDZ 与共用 1 套辅组合 SDF（每组占半个 SDF）。'
    },
    {
      id: 'SEC_Q', equip: '轨道区段 1DG / 1/7G / 3DG / 5-9DG / 7-11DG', combo: 'Q（区段组合）', figTag: '1 / 2 · Q',
      relays: '含本区段解锁核心：QJJ(9线) · 1LJ(12线) · 2LJ(13线) · CJ(传递) · DGJF/FDGJ(3s缓放)',
      why: '不论有岔区段还是列车进路内的无岔区段，全部统一采用 1 种 Q 区段组合（每个组合架按实际布局顺次拼入 1–15 线）。'
    },
    {
      id: 'X_in', equip: '进站信号机 X / X_F', combo: '1LXF + YX + LXZ (+ DL<L1>)', figTag: 'A-2 / 2 · 1LXF+YX+LXZ',
      relays: 'LXZ 列车信号主组合(LXJ/XJJ/TXJ/ZXJ/KJ/FKJ) + 1LXF 辅组合(含 ZCJ/GJJ) + YX 引导组合(YXJ) + DL 灯丝报警',
      why: '进站兼具正线/侧线/通过及引导接车，需主组合 LXZ 叠加 1LXF（单方向辅助）与 YX 引导组合。'
    },
    {
      id: 'DEP_sig', equip: '出站信号机 S₁ / SⅡ / S3 / S4', combo: 'LXZ + 1LXF（单发车方向）/ 2LXF（两方向）', figTag: 'B-1 · LXZ+1LXF',
      relays: 'LXJ / ZXJ / DJ / ZCJ(迎面照查，图8.3.2) / GJJ(股道/迎面锁闭) / JYJ(接近预告)',
      why: '图 3.1.1 仅向北京方向发车故用 LXZ+1LXF；若有两条发车线路方向（如图 5.1.3）则改用 2LXF 辅组合增配 2LQJ/3LQJ/3DJ。'
    },
    {
      id: 'DX_sig', equip: '调车信号机 D₁ / D₃ / D₅ / D₇', combo: 'DX（调车信号）+ DXF（单置辅助）', figTag: 'DX / DXF',
      relays: 'DXJ / DJ / ZJ（调车白灯保留） / AJ / D₅ 单置增用半个 DXF（同端可作单置/变通按钮）',
      why: '并置/差置/尽头调车直接用 DX；单置调车如 D₅ 与各信号机复示终端按钮需借用半个 DXF 辅助组合。'
    },
    {
      id: 'F_DY', equip: '下行咽喉共用方向与电源', combo: 'F（方向组合）+ DY（电源组合）', figTag: 'X_F(下行方向) · XDY(电源)',
      relays: 'F 含 LJJ/LFJ/DFJ/DJJ(方向)、GZZ(总定位/总反位)；DY 含 ZQJ/ZRJ(总取消/总人工解锁计时 JSBXC-850)',
      why: 'F 与 DY 按“每一咽喉一套”设置（不归属单个道岔或信号机），在 1–4 线向全咽喉提供方向条件电源，在 15 线供人工解锁计时电源。'
    }
  ];

  const SWITCH_NORMAL_QS = [
    { q: '图 2.4.5：连接安全线或避难线的道岔，其规定定位是哪一侧？', opts: ['一律以直向股道为定位', '以开通【安全线或避难线】的位置为定位（安全优先）', '以开通到发线为定位'], ans: 1, exp: '图 2.4.5（PDF p.28）：安全优先于效率！平时开通安全线可防止相邻停留车辆误入正线/到发线造成冲突。' },
    { q: '图 2.4.4：单线车站正线进站道岔，其定位如何确定？', opts: ['两端均开通正线为定位', '以【各端分别向不同股道开通】的位置为定位', '一律以直股为定位'], ans: 1, exp: '图 2.4.4（PDF p.28）：单线车站为迎接入站上下行列车交会，进站道岔定位由车站两端分别向不同股道开通。' },
    { q: '图 2.4.6：双线车站正线上的道岔，其定位如何确定？', opts: ['以【分别向各自方向正线开通】的位置为定位', '侧线为定位', '由值班员每日自定'], ans: 0, exp: '图 2.4.6（PDF p.28）：双线车站上、下行正线各通各自方向正线，平时保证正线直通安全与效率。' },
    { q: '关于“道岔定位就是道岔的直向位置”的说法对吗？', opts: ['对，99%都是直向', '【错误！】定位与直/曲股无必然绑定（如安全线、单线弯股接车、侧线平行作业）', '只适用于调车场'], ans: 1, exp: '第 2.4 节核心警示（PDF p.28）：道岔定位是规定的常态安全位置，很多时候正好是弯股/侧向，切忌望文生义！' }
  ];

  function render(container, appState, callbacks) {
    if (!container) return;
    const tab = appState.cbiTab || 'yardRules';
    const tabsHtml = [
      ['yardRules', '🗺 2章 · 定位/侵限/进路范围'],
      ['lockTable', '📋 3.2节 · 图3.1.1 联锁表编制'],
      ['fieldIfc5', '🔌 5章 · 道岔/轨道接口电路'],
      ['modules6502', '🧱 6.3节 · 6502 12种定型组合'],
      ['routeSelect1_7', '🔀 7章 · 1–7线选排与选岔网'],
      ['cbiIo', '💻 10–11章 · 计算机联锁层次与 I/O'],
      ['redundancy', '🛡 13章 · 冗余表决与故障—安全'],
      ['dataStruct', '🗂 12章 · 静态/动态进路数据结构']
    ].map(([id, label]) => `<button class="cbi-subtab${tab === id ? ' active' : ''}" data-cbi-tab="${id}">${label}</button>`).join('');

    let body = '';
    if (tab === 'yardRules') body = renderYardRules();
    else if (tab === 'lockTable') body = renderLockTable();
    else if (tab === 'fieldIfc5') body = renderFieldIfc5();
    else if (tab === 'modules6502') body = renderModules6502();
    else if (tab === 'routeSelect1_7') body = renderRouteSelect1_7();
    else if (tab === 'cbiIo') body = renderCbiIoArch();
    else if (tab === 'redundancy') body = renderRedundancy();
    else if (tab === 'dataStruct') body = renderDataStruct();

    container.innerHTML = `
      <div class="cbi-header">
        <div>
          <div class="section-eyebrow">TEXTBOOK INTERACTIVE LABS · CHAPTERS 2, 3, 5, 6, 7, 10–13</div>
          <h2>站场联锁规则、表 3.2.2 联锁表、室外接口、6502 选排网与计算机联锁安全实验室</h2>
        </div>
        <div class="cbi-subtabs">${tabsHtml}</div>
      </div>
      <div class="cbi-body">${body}</div>
    `;

    // 绑定所有子实验内部事件
    container.querySelectorAll('[data-cbi-tab]').forEach(b => {
      b.onclick = () => callbacks.onUpdateState({ cbiTab: b.dataset.cbiTab });
    });
    bindSubEvents(container, appState, callbacks);
  }

  function renderYardRules() {
    const sq = SWITCH_NORMAL_QS[state.switchQIdx];
    const sideConflict = state.overLimitOn && state.neighborOcc;
    const rangeInfo = {
      receive: { title: '接车进路 (X → IG)', scope: '自进站信号机 X（含 X 内方区段）至对向出站信号机 S₁(反)，【包含所接入股道 IG】；终端按钮取反向出站按钮 S₁LA', path: 'M60,95H590', stop: '590' },
      depart: { title: '发车进路 (S₁ → X)', scope: '自股道咽喉端出站信号机 S₁ 至反向进站信号机 X（或站界标），【不含出发股道 IG】！终端按钮取 XLA（或发车终端 SLZA/XLZA）', path: 'M310,95H60', stop: '60' },
      through: { title: '通过进路 (X → 正线 IG → 出站口)', scope: '等同于“正线接车 + 同方向发车”，包含整个正线股道及两侧咽喉，始端一般按通过按钮 XTA/STA', path: 'M60,95H640', stop: '640' },
      shunt: { title: '调车进路 (D₁ → 咽喉/股道)', scope: '由始端调车信号机至同方向阻拦信号机/车挡/站界标；终端若为并置/差置信号机则按【背向按钮】，单置按自身按钮', path: 'M150,95H450', stop: '450' }
    }[state.yardRange];

    return `
      <div class="cbi-grid-2">
        <div class="cbi-card">
          <div class="cbi-card-head">
            <h3>实验 1｜第 2.5 节：普通 vs 超限绝缘（图 2.5.1 & 图 3.1.2）</h3>
            <button class="text-button" data-open-page="29">📄 看原书 PDF p.29</button>
          </div>
          <svg viewBox="0 0 640 165" class="cbi-svg">
            <path d="M40,95H600M220,95L380,42H590" stroke="#7892a6" stroke-width="4" fill="none"/>
            <path d="M295,68h220" stroke="${sideConflict ? '#f3959f' : state.neighborOcc ? '#efb860' : '#7de0bd'}" stroke-width="5"/>
            <line x1="295" y1="54" x2="295" y2="82" stroke="#d5ad70" stroke-width="2.5"/>
            ${state.overLimitOn ? '<circle cx="295" cy="68" r="9" fill="none" stroke="#efb860" stroke-width="2"/>' : ''}
            <circle cx="345" cy="52" r="5" fill="#d5ad70"/><text x="355" y="28" style="fill:#d5ad70;font-size:11px">警冲标(${state.overLimitOn ? '距绝缘 < 3.5 m' : '距绝缘 ≥ 3.5 m'})</text>
            ${state.neighborOcc ? '<rect x="315" y="57" width="85" height="20" rx="3" fill="#f3959f"/><text x="357" y="71" text-anchor="middle" style="fill:#111;font-size:10px;font-weight:700">邻段占车/侵限</text>' : ''}
            <path d="M40,95H590" stroke="${sideConflict ? '#f3959f' : '#7de0bd'}" stroke-width="3" stroke-dasharray="${sideConflict ? '6 4' : 'none'}"/>
            <text x="120" y="120" style="fill:#9cc0d6;font-size:11px">主进路 D₉ → D₁₇ (${sideConflict ? '❌ 侧面冲突禁止建立！' : '✓ 满足平行安全'})</text>
          </svg>
          <div class="cbi-controls-row">
            <label class="inline-check"><input type="checkbox" id="cbi-overlimit" ${state.overLimitOn ? 'checked' : ''}>设为超限绝缘（圆圈 ○ · 距警冲标 <3.5m）</label>
            <label class="inline-check"><input type="checkbox" id="cbi-nocc" ${state.neighborOcc ? 'checked' : ''}>模拟邻区段（105-108DG）停留/占用车辆</label>
            <label class="inline-check"><input type="checkbox" id="cbi-cross-double" ${state.crossoverDouble ? 'checked' : ''}>渡线两端为双动道岔（如1/3、5/7）</label>
          </div>
          <p class="cbi-note">${sideConflict
            ? '⚠ 当前为【超限绝缘】且邻区段占用：车辆虽未压过绝缘节，却已越过警冲标侵占邻线限界！联锁表必须检查条件侵限，坚决禁止开放冲突进路（图3.1.2/图3.2.1）。'
            : !state.overLimitOn && state.neighborOcc
              ? '✓ 当前为普通绝缘（距离 ≥3.5 m）：邻区段有车停留在警冲标内方外侧，不侵占主进路限界，两条平行进路互不冲突。'
              : '点击下方复选框切换“普通绝缘 vs 超限绝缘”，体验为何两条看起来没有共用区段的进路也会变成“条件敌对”。'}<br><strong>渡线绝缘特例（PDF p.29 第2.5.1节）：</strong>${state.crossoverDouble ? '✓ 当前渡线两端为【双动道岔】（同时转换），故渡线上的绝缘节虽距警冲标 <3.5m，但【不作为超限绝缘处理】！' : '⚠ 当前渡线两端不是双动道岔（为两个独立单动道岔），渡线上的绝缘节【必须作为超限绝缘 ○ 处理】，严防一端道岔反位车列侵限！'}</p>
        </div>

        <div class="cbi-card">
          <div class="cbi-card-head">
            <h3>实验 2｜第 2.4 节：道岔定位规则辨析 (4 题)</h3>
            <button class="text-button" data-open-page="28">📄 看原书 PDF p.28</button>
          </div>
          <p class="cbi-q">${sq.q}</p>
          <div class="cbi-opts">
            ${sq.opts.map((opt, idx) => `<button class="cbi-opt${state.switchQChoice === idx ? (idx === sq.ans ? ' correct' : ' wrong') : ''}" data-sq-opt="${idx}">${idx + 1}. ${opt}</button>`).join('')}
          </div>
          ${state.switchQChoice !== null ? `<p class="cbi-note">${sq.exp}</p>` : '<p class="cbi-note">请选择答案，破除“道岔定位＝直向”的常见误区。</p>'}
          <div class="cbi-controls-row"><button class="quiet-button" id="cbi-sq-next">下一题 (${state.switchQIdx + 1}/${SWITCH_NORMAL_QS.length}) ▶</button></div>
        </div>
      </div>

      <div class="cbi-grid-2" style="margin-top:14px">
        <div class="cbi-card">
          <div class="cbi-card-head">
            <h3>实验 3｜第 2.4 节：图 2.4.2–2.4.7 四大典型站场道岔定位与对向/顺向交互台</h3>
            <button class="text-button" data-open-page="28">📄 看原图 PDF p.27–28</button>
          </div>
          <div class="cbi-subtabs" style="margin-bottom:8px">
            <button class="cbi-subtab${state.switchNormalScene === 'singleLine' ? ' active' : ''}" data-sw-scene="singleLine">图2.4.4 单线站防迎面</button>
            <button class="cbi-subtab${state.switchNormalScene === 'safetyTrack' ? ' active' : ''}" data-sw-scene="safetyTrack">图2.4.5 安全线/避难线</button>
            <button class="cbi-subtab${state.switchNormalScene === 'doubleLine' ? ' active' : ''}" data-sw-scene="doubleLine">图2.4.6 双线站+奇偶编号</button>
            <button class="cbi-subtab${state.switchNormalScene === 'facingTrailing' ? ' active' : ''}" data-sw-scene="facingTrailing">图2.4.2 对向 vs 顺向</button>
          </div>
          ${state.switchNormalScene === 'singleLine' ? `
            <div class="ds-box">
              <strong>图 2.4.4 单线车站正线进站道岔定位：两端分别向不同股道开通！</strong>
              <p class="cbi-note">单线铁路上下行共用区间正线。为防止两个咽喉同时把列车接进同一条股道发生迎面相撞，规定左端 1 号道岔定位于侧线 <code>3G</code>（弯股定位！），右端 2 号道岔定位于正线 <code>IIG</code>（直股定位）。</p>
            </div>
          ` : state.switchNormalScene === 'safetyTrack' ? `
            <div class="ds-box">
              <strong>图 2.4.5 安全线、避难线道岔定位：一律以开通安全线/避难线为定位！</strong>
              <p class="cbi-note">安全原则优先于效率原则！平时将道岔定位于导向安全线/避难线的位置，一旦专用线机车车辆溜逸或陡长下坡道列车失控，只进入安全线/避难线，绝不闯入正线或到发线。</p>
            </div>
          ` : state.switchNormalScene === 'doubleLine' ? `
            <div class="ds-box">
              <strong>图 2.4.3 / 2.4.6 双线车站道岔编号 4 铁律与定位位置</strong>
              <p class="cbi-note">① <strong>下行咽喉编单号（1、3、5、7、9、11）</strong>，<strong>上行咽喉编双号（2、4、6、8、10、12）</strong>；② 从站界向站内顺序编号；③ 双动联动道岔必须连续编号（如 <code>1/3</code>、<code>5/7</code>、<code>2/4</code>）；④ 双线站正线道岔定位于各自方向正线（<code>IG / IIG</code>）。</p>
            </div>
          ` : `
            <div class="ds-box">
              <strong>图 2.4.2 对向道岔 vs 顺向道岔（随列车运行方向动态变化！）</strong>
              <div class="cbi-controls-row" style="margin:6px 0">
                <button class="quiet-button" id="cbi-toggle-train-dir">⇄ 切换运行方向（当前：${state.trainMoveRight ? '自左向右 ▶ 迎着尖轨 = 对向道岔' : '◀ 自右向左 顺着辙叉 = 顺向道岔'}）</button>
              </div>
              <p class="cbi-note">道岔本身不分对向/顺向！当列车<strong>迎着尖轨尖端</strong>运行（${state.trainMoveRight ? '当前状态 ✓' : '反方向'}）时称为<strong>对向道岔</strong>（尖轨不密贴有挤岔/脱轨危险，锁闭要求最高）；顺着辙叉心运行时称为<strong>顺向道岔</strong>（未开通本股道会造成挤岔）。</p>
            </div>
          `}
          <div style="margin-top:8px"><img src="textbook/fig-2-4-4.jpg" alt="图2.4.4-2.4.7 道岔定位位置" style="width:100%;background:#fff;padding:6px;border-radius:6px"/></div>
        </div>

        <div class="cbi-card">
          <div class="cbi-card-head">
            <h3>实验 4｜第 2.6 节：进路范围与始终端按钮对比（图 2.6.1 · 考试极易混点）</h3>
            <button class="text-button" data-open-page="31">📄 看原书 PDF p.31–32</button>
          </div>
          <div class="cbi-subtabs" style="margin-bottom:10px">
            <button class="cbi-subtab${state.yardRange === 'receive' ? ' active' : ''}" data-yr="receive">接车进路</button>
            <button class="cbi-subtab${state.yardRange === 'depart' ? ' active' : ''}" data-yr="depart">发车进路</button>
            <button class="cbi-subtab${state.yardRange === 'through' ? ' active' : ''}" data-yr="through">通过进路</button>
            <button class="cbi-subtab${state.yardRange === 'shunt' ? ' active' : ''}" data-yr="shunt">调车进路</button>
          </div>
          <svg viewBox="0 0 680 120" class="cbi-svg">
            <path d="M40,95H650" stroke="#42586b" stroke-width="4"/>
            <path d="${rangeInfo.path}" stroke="#7de0bd" stroke-width="6"/>
            ${[60, 150, 310, 590].map(x => `<line x1="${x}" y1="86" x2="${x}" y2="104" stroke="#d5ad70" stroke-width="2"/>`).join('')}
            <text x="60" y="75" text-anchor="middle" style="fill:#c4d8ea;font-size:11px">X 进站</text>
            <text x="150" y="75" text-anchor="middle" style="fill:#c4d8ea;font-size:11px">D₁</text>
            <text x="230" y="75" text-anchor="middle" style="fill:#9bb6ce;font-size:11px">咽喉区</text>
            <text x="310" y="75" text-anchor="middle" style="fill:#c4d8ea;font-size:11px">S₁(发车始端)</text>
            <text x="450" y="75" text-anchor="middle" style="fill:#9bb6ce;font-size:11px">IG 股道</text>
            <text x="590" y="75" text-anchor="middle" style="fill:#c4d8ea;font-size:11px">S₁(反·接车终端)</text>
            <text x="340" y="34" text-anchor="middle" style="fill:#7de0bd;font-size:13px;font-weight:600">${rangeInfo.title}</text>
          </svg>
          <p class="cbi-note">${rangeInfo.scope}</p>
          <div style="margin-top:8px"><img src="textbook/fig-2-5-1.jpg" alt="图2.5.1 轨道电路划分与超限绝缘" style="width:100%;background:#fff;padding:6px;border-radius:6px"/></div>
        </div>
      </div>
    `;
  }

  function renderLockTable() {
    const r = LOCK_ROUTES[state.lockIdx];
    const sel = k => state.lockDraft[k] || '';
    const field = (key, title, opts) => `
      <div class="lt-col">
        <label>${title}</label>
        <select data-lt-field="${key}">
          <option value="">-- 请对照图3.1.1选择 --</option>
          ${opts.map(o => `<option value="${o}" ${sel(key) === o ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
        ${state.lockChecked ? `<span class="${sel(key) === r.answer[key] ? 'lt-ok' : 'lt-err'}">${sel(key) === r.answer[key] ? '✓ 正确' : '✕ 表3.2.2标准：' + r.answer[key]}</span>` : ''}
      </div>
    `;
    const tabs = LOCK_ROUTES.map((rt, i) => `<button class="cbi-subtab${i === state.lockIdx ? ' active' : ''}" data-lt-idx="${i}">${rt.name}</button>`).join('');
    return `
      <div class="cbi-card">
        <div class="cbi-card-head">
          <h3>第 3.2 节 图 3.1.1 / 表 3.2.2 交互式联锁表编制实验室</h3>
          <div style="display:flex;gap:8px">
            <button class="text-button" data-open-page="35">📄 图3.1.1 站场 (p.35)</button>
            <button class="text-button" data-open-page="${r.page}">📄 表3.2.2 原表 (p.${r.page})</button>
          </div>
        </div>
        <div class="cbi-subtabs" style="margin-bottom:12px">${tabs}</div>
        <div class="lt-legend">符号规则：反位道岔 <code>()</code> · 防护道岔 <code>[]</code> · 带动道岔 <code>{}</code> · 条件敌对/侵限 <code>&lt;&gt;</code></div>
        <div class="lt-grid">
          ${field('buttons', '排列进路按下按钮', r.options.buttons)}
          ${field('aspect', '信号机显示', r.options.aspect)}
          ${field('switches', '进路内道岔位置', r.options.switches)}
          ${field('hostile', '敌对及条件敌对信号', r.options.hostile)}
          ${field('sections', '检查轨道区段', r.options.sections)}
          <div class="lt-col"><label>迎面进路 / 其他联锁</label><div class="lt-static">${r.options.headOn}</div></div>
        </div>
        <div class="cbi-controls-row" style="margin-top:12px">
          <button class="primary-button" id="cbi-lt-check">✓ 核对表 3.2.2 批改</button>
          <button class="quiet-button" id="cbi-lt-fill">💡 填入表 3.2.2 标准答案</button>
          ${r.sandRoute ? `<button class="quiet-button" data-lt-run="${r.sandRoute}">⚡ 载入 03 沙盘 3D 试跑 (${r.sandRoute})</button>` : ''}
        </div>
        ${state.lockChecked ? `<p class="cbi-note" style="margin-top:10px">${r.note}</p>` : ''}
      </div>
    `;
  }

  function renderFieldIfc5() {
    const stg = state.ifc5TurnoutStage;
    const sjL = state.ifc5SjLocked;
    const indF = state.ifc5IndFault;
    const startBlocked = sjL && (stg === 1 || stg === 2);
    const dqj1Up = ((stg === 1 || stg === 2) && !sjL) || stg === 3;
    const dqj2Rev = stg >= 2 && !startBlocked;
    const dbjUp = stg === 0 && indF === 'none';
    const fbjUp = stg === 4 && indF === 'none';
    const gjOk = !state.ifc5TrackShunt && !state.ifc5BranchFault && (!state.ifc5JointBroken || !state.ifc5PhaseCrossed);
    const jointUnsafe = state.ifc5JointBroken && !state.ifc5PhaseCrossed && !state.ifc5TrackShunt && !state.ifc5BranchFault;
    const stageNames = ['0 定位密贴(DBJ↑)', '1 1DQJ 3-4励磁(125Ω)', '2 2DQJ转极(1DQJ缓放)', '3 1DQJ 1-2(0.44Ω)串电机自闭', '4 反位到位(A爪断·FBJ↑)'];

    return `
      <div class="cbi-grid-2">
        <div class="cbi-card">
          <div class="cbi-card-head">
            <h3>第 5.2 节｜图 5.2.2–5.2.3 ZD6 四线制启动/自闭与半波表示故障矩阵</h3>
            <button class="text-button" data-open-page="79">📄 看原图 PDF p.79–82</button>
          </div>
          <div class="cbi-subtabs" style="margin-bottom:8px">
            ${stageNames.map((nm, idx) => `<button class="cbi-subtab${stg === idx ? ' active' : ''}" data-ifc5-stg="${idx}">${nm}</button>`).join('')}
          </div>
          <div class="cbi-controls-row" style="margin-bottom:8px">
            <label class="inline-check"><input type="checkbox" id="cbi-ifc5-sj" ${sjL ? 'checked' : ''}>模拟道岔锁闭 SJ↓（启动前禁动；启动后 1DQJ 0.44Ω 自闭脱离 SJ 继续转到底！）</label>
          </div>
          <div class="cbi-subtabs" style="margin-bottom:8px">
            ${[
              ['none', '✓ 表示回路正常'],
              ['wireCross', '① 外线混线(交流电入JPXC)'],
              ['capShort', '② 电容C击穿短路'],
              ['capOpen', '③ 电容C引线断线(颤动)'],
              ['trailThrough', '④ 挤岔(01-02/03-04顶开)']
            ].map(([k, lbl]) => `<button class="cbi-subtab${indF === k ? ' active' : ''}" data-ifc5-ind="${k}">${lbl}</button>`).join('')}
          </div>
          <div class="ds-box">
            <strong>当前继电器与开闭器状态：1DQJ:${dqj1Up ? (stg === 3 ? '↑(1-2线圈0.44Ω串电机自闭)' : stg === 2 ? '⏳铜套缓放' : '↑(3-4线圈125Ω)') : '↓'} · 2DQJ:${dqj2Rev ? '反位' : '定位'} · DBJ:${dbjUp ? '↑' : '↓'} · FBJ:${fbjUp ? '↑' : '↓'}</strong>
            <p class="cbi-note">${startBlocked
              ? '🔒 <strong>技术条件(1)(2)生效（PDF p.76/81）</strong>：1DQJ 的 3-4 启动励磁电路串有 SJ81-82 前接点（及 DGJ 前接点），锁闭时严禁道岔启动！'
              : stg === 3 && sjL
                ? '⚙ <strong>技术条件(3)生效（PDF p.76/81）</strong>：道岔启动后列车随即驶入使 SJ↓，但因 1DQJ 1-2 低阻线圈(0.44Ω)与直流电机 M 串联自闭已脱离 SJ 控制，保证道岔转换到底不停转！'
                : indF === 'wireCross'
                  ? '🛡 <strong>外线混线防护（PDF p.82）</strong>：室外整流二极管 Z 失去单向导电作用，交流电直接流入偏极继电器 JPXC-1000，DBJ↓、FBJ↓ 绝不误吸起！'
                  : indF === 'capShort'
                    ? '🛡 <strong>电容 C 击穿短路（PDF p.82）</strong>：表示继电器线圈被电容 C 短路掉，DBJ↓、FBJ↓ 可靠落下。'
                    : indF === 'capOpen'
                      ? '⚠ <strong>电容 C 引线断线（PDF p.82）</strong>：在交流电另一半周失去电容 C 放电维持，DBJ/FBJ 发生半波颤动不能稳定吸起。'
                      : indF === 'trailThrough'
                        ? '🚨 <strong>挤岔报警（PDF p.82）</strong>：自动开闭器动接点被顶至中间且移位接触器 01-02/03-04 断开，DBJ↓ 且 FBJ↓ 双落报警！'
                        : '图 5.2.3 自动开闭器动接点规律：“内侧先动，外侧后动”（定→反时 B 爪先由 3 排转 4 排备好反转回路，到位后 A 爪速动由 1 排转 2 排接通反位表示）。'}</p>
          </div>
          <div style="margin-top:8px"><img src="textbook/fig-5-2-2.jpg" alt="图5.2.2 单动道岔的四线制控制电路" style="width:100%;background:#fff;padding:6px;border-radius:6px"/></div>
          <div class="cbi-controls-row" style="margin-top:8px">
            <button class="primary-button" id="cbi-jump-turnout3d">⑂ 进入 3D 四线制道岔联动台</button>
            <button class="quiet-button" id="cbi-jump-fivewire3d">3Φ 进入 3D 五线制三相道岔台</button>
          </div>
        </div>

        <div class="cbi-card">
          <div class="cbi-card-head">
            <h3>第 5.3 节｜图 5.3.2–5.3.3 一送多受分支串联、25Hz 相敏与绝缘节破损极性交叉</h3>
            <button class="text-button" data-open-page="88">📄 看原图 PDF p.87–89</button>
          </div>
          <div class="cbi-controls-row" style="margin-bottom:8px">
            <label class="inline-check"><input type="checkbox" id="cbi-ifc5-shunt" ${state.ifc5TrackShunt ? 'checked' : ''}>主轨轮对分路占用</label>
            <label class="inline-check"><input type="checkbox" id="cbi-ifc5-branch" ${state.ifc5BranchFault ? 'checked' : ''}>道岔侧股分支分路 / 跳线折断 (DGJ₁↓)</label>
            <label class="inline-check"><input type="checkbox" id="cbi-ifc5-50hz" ${state.ifc5Traction50Hz ? 'checked' : ''}>50Hz 电气化牵引电流叠加</label>
            <label class="inline-check"><input type="checkbox" id="cbi-ifc5-joint" ${state.ifc5JointBroken ? 'checked' : ''}>模拟相邻区段机械绝缘节破损</label>
            <label class="inline-check"><input type="checkbox" id="cbi-ifc5-cross" ${state.ifc5PhaseCrossed ? 'checked' : ''}>相邻区段已设极性交叉(180°反相)</label>
          </div>
          <div class="ds-box">
            <strong>状态判据：支 DGJ₁:${state.ifc5BranchFault ? '↓ 落下' : '↑ 吸起'} · 主 DGJ / 二元二位 GJ:${jointUnsafe ? '⚠ 危险误吸风险!(未极性交叉)' : gjOk ? '↑ 吸起(区段空闲)' : '↓ 可靠落下(导向安全)'} ｜ 50Hz 480电路:${state.ifc5Traction50Hz ? '⚠ 同频牵引干扰(禁用)' : '✓ 非电化区段可用'}</strong>
            <p class="cbi-note">${state.ifc5BranchFault
              ? '✓ <strong>图 5.3.2 一送多受串联监督（PDF p.87–88）</strong>：各分支受电端 DGJ₁、DGJ₂ 的前接点串联在主 DGJ 线圈电路中，任一分支有车分路或跳线折断均使主 DGJ 落下！'
              : state.ifc5JointBroken && state.ifc5PhaseCrossed
                ? '🛡 <strong>绝缘破损极性交叉防护生效（PDF p.87/89）</strong>：相邻区段电源相位相差 180°（极性交叉），绝缘节破损时反相电流使二元二位 GJ 产生反向转矩压落 ↓！'
                : jointUnsafe
                  ? '⚠ <strong>未做极性交叉隐患（PDF p.87/89）</strong>：若相邻区段未做极性/相位交叉，机械绝缘节破损时邻段同相电源可能侵入使 GJ 错误保持吸起！'
                  : state.ifc5TrackShunt
                    ? '✓ <strong>轮对分路（PDF p.87）</strong>：车轮电阻远小于 GJ 线圈阻抗，轨面残压跌落使 GJ 可靠落下 ↓。'
                    : state.ifc5Traction50Hz
                      ? '✓ <strong>图 5.3.3 25Hz 相敏轨道电路（PDF p.88–89）</strong>：当前存在 50Hz 电气化牵引电流，50Hz 480 轨道电路会受同频干扰不适用；必须采用 25Hz 轨道+局部电源（90° 相位差）驱动二元二位 GJ，天然甄别并抑制 50Hz 牵引干扰！'
                      : '✓ <strong>非电气化区段对比（PDF p.87–88）</strong>：当前无 50Hz 牵引电流叠加，50Hz 480 交流连续半波整流轨道电路与 25Hz 相敏轨道电路均可稳定工作。'}</p>
          </div>
          <div style="margin-top:8px"><img src="textbook/fig-5-3-2.jpg" alt="图5.3.2 一送多受并联式与图5.3.3 25Hz相敏轨道电路" style="width:100%;background:#fff;padding:6px;border-radius:6px"/></div>
          <div class="cbi-controls-row" style="margin-top:8px">
            <button class="primary-button" id="cbi-jump-track25">🚄 进入 3D 25Hz 相敏轨道电路分路台</button>
            <button class="quiet-button" id="cbi-jump-track50">⚡ 进入 3D 50Hz 一送两受道岔区段台</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderRouteSelect1_7() {
    const rt = ROUTES_1_7[state.selRouteIdx] || ROUTES_1_7[0];
    const stp = state.selStep;
    const flt = state.selFault;
    const blocked56 = (flt === 'secBusy' || flt === 'headOnGjj') && stp >= 4;
    const blocked7 = (blocked56 || flt === 'noDbj') && stp >= 6;
    const figMap = {
      '7-2-1': { src: 'textbook/fig-7-2-1.jpg', title: '图 7.2.1 下行接车至 IG 列车进路的选排时序逻辑 (PDF p.110)', page: 110 },
      '7-9-1': { src: 'textbook/fig-7-9-1.jpg', title: '图 7.9.1 1、2线选岔网路：八字第一笔撇形双动反位 (PDF p.132)', page: 132 },
      '7-9-3': { src: 'textbook/fig-7-9-3.jpg', title: '图 7.9.3 5、6线选岔电路：D₇ → IG 实例 (PDF p.134)', page: 134 },
      '7-10-1': { src: 'textbook/fig-7-10-1.jpg', title: '图 7.10.1 开始继电器 KJ 工作电路：7线选排一致检查 (PDF p.137)', page: 137 }
    };
    const fig = figMap[state.selFigKey] || figMap['7-9-3'];
    const stageTitles = [
      '① 按下始终端按钮 (AJ↑)',
      '② 方向继电器吸起 (供KZ/KF)',
      '③ 1–4线优先选双动反位 (FCJ↑)',
      '④ 5–6线自左向右选岔 & 记录复原',
      '⑤ 转辙机转换到位 (DBJ/FBJ↑)',
      '⑥ 7线检查选排一致 (KJ↑自闭)'
    ];

    return `
      <div class="cbi-grid-2">
        <div class="cbi-card">
          <div class="cbi-card-head">
            <h3>第 7 章｜6502 进路选排 1–7 线方向电流与 6 阶段单步时序实验室</h3>
            <button class="text-button" data-open-page="${fig.page}">📄 看原书 PDF p.${fig.page}</button>
          </div>
          <div class="cbi-subtabs" style="margin-bottom:8px">
            ${ROUTES_1_7.map((r, i) => `<button class="cbi-subtab${i === state.selRouteIdx ? ' active' : ''}" data-sel-rt="${i}">${r.name}</button>`).join('')}
          </div>
          <div class="cbi-subtabs" style="margin-bottom:8px">
            ${stageTitles.map((t, i) => `<button class="cbi-subtab${stp === i + 1 ? ' active' : ''}" data-sel-stp="${i + 1}">${t}</button>`).join('')}
          </div>
          <div class="cbi-controls-row" style="margin-bottom:8px">
            <label>联锁条件阻断测试：
              <select id="cbi-sel-fault">
                <option value="none" ${flt === 'none' ? 'selected' : ''}>✓ 联锁条件全部满足（空闲未锁闭 · 无迎面敌对 · 道岔表示一致）</option>
                <option value="secBusy" ${flt === 'secBusy' ? 'selected' : ''}>① 模拟区段占用或未解锁 (DGJ↓/QJJ↑/CJ↓ → 切断 5、6 线)</option>
                <option value="headOnGjj" ${flt === 'headOnGjj' ? 'selected' : ''}>② 模拟向同股道已建迎面进路 (GJJ↑ → 切断 6 线 KF 电源)</option>
                <option value="noDbj" ${flt === 'noDbj' ? 'selected' : ''}>③ 模拟道岔受阻未到位失表示 (DBJ/FBJ↓ → 阻断 7 线 KJ↑)</option>
              </select>
            </label>
          </div>
          <svg viewBox="0 0 660 198" class="cbi-svg">
            <rect x="12" y="12" width="145" height="76" rx="5" fill="${stp >= 2 ? '#14332a' : '#152231'}" stroke="${stp >= 1 ? '#7de0bd' : '#3a5268'}" stroke-width="2"/>
            <text x="84" y="34" text-anchor="middle" style="fill:#eef7ff;font-weight:700;font-size:11px">阶段①② 按钮与方向</text>
            <text x="84" y="54" text-anchor="middle" style="fill:#7de0bd;font-size:10px">${stp >= 1 ? rt.aj : '等待按压按钮'}</text>
            <text x="84" y="72" text-anchor="middle" style="fill:#9cc0d6;font-size:10px">${stp >= 2 ? rt.fj : '方向继电器↓'}</text>

            <rect x="172" y="12" width="225" height="76" rx="5" fill="${stp >= 3 && (rt.id === 'X_4G' || rt.id === 'XF_3G') ? '#1c3347' : '#152231'}" stroke="${stp >= 3 ? '#92bdfa' : '#3a5268'}" stroke-width="2"/>
            <text x="284" y="34" text-anchor="middle" style="fill:#eef7ff;font-weight:700;font-size:11px">阶段③ 1–4线（双动反位优先）</text>
            <text x="284" y="54" text-anchor="middle" style="fill:#92bdfa;font-size:10px">1-2线(撇5/7反): ${rt.id === 'XF_3G' && stp >= 3 ? '1FCJ↑→2FCJ↑' : '不经'}</text>
            <text x="284" y="72" text-anchor="middle" style="fill:#92bdfa;font-size:10px">3-4线(捺1/3反): ${rt.id === 'X_4G' && stp >= 3 ? '1FCJ↑→2FCJ↑' : '不经'}</text>

            <rect x="412" y="12" width="236" height="76" rx="5" fill="${blocked56 ? '#3b1d26' : stp >= 4 ? '#14332a' : '#152231'}" stroke="${blocked56 ? '#f3959f' : stp >= 4 ? '#7de0bd' : '#3a5268'}" stroke-width="2"/>
            <text x="530" y="34" text-anchor="middle" style="fill:#eef7ff;font-weight:700;font-size:11px">阶段④ 5–6线（自左向右选排）</text>
            <text x="530" y="54" text-anchor="middle" style="fill:${blocked56 ? '#f3959f' : '#7de0bd'};font-size:10px">${blocked56 ? (flt === 'secBusy' ? '✕ QJJ↑/CJ↓/DGJ↓ 断开5-6线!' : '✕ GJJ↑ 切断6线 KF 电源!') : stp >= 4 ? '✓ DCJ/FCJ/JXJ 顺序↑ → 记录复原' : '等待 1-4 线或 AJ 接通'}</text>
            <text x="530" y="72" text-anchor="middle" style="fill:#9cc0d6;font-size:10px">道岔目标：${rt.switches}</text>

            <rect x="12" y="104" width="636" height="82" rx="5" fill="${blocked7 ? '#3b1d26' : stp >= 6 ? '#14332a' : '#152231'}" stroke="${blocked7 ? '#f3959f' : stp >= 5 ? '#7de0bd' : '#3a5268'}" stroke-width="2"/>
            <text x="330" y="126" text-anchor="middle" style="fill:#eef7ff;font-weight:700;font-size:11px">阶段⑤⑥ 道岔转换 (1DQJ→2DQJ→DBJ/FBJ↑) 与 7 线开始继电器 KJ 选排一致检查</text>
            <text x="330" y="148" text-anchor="middle" style="fill:${blocked7 ? '#f3959f' : '#7de0bd'};font-size:10.5px">${blocked7 ? (flt === 'noDbj' ? '✕ 道岔失表示(DBJ/FBJ↓)，7线开路，KJ 保持落下↓！' : '✕ 因 5–6 线选路阻断，7 线无激励，KJ 落下↓！') : stp >= 6 ? '✓ ' + rt.line7 : stp === 5 ? '⚙ 道岔正在转换到位，DBJ/FBJ 吸起接通 7 线桥接接点...' : '等待选路完成后转辙机动作与 7 线检查'}</text>
            <text x="330" y="170" text-anchor="middle" style="fill:#9cc0d6;font-size:10px">7线铁律(PDF p.135–138)：串检沿途道岔 DCJ·DBJ(或FCJ·FBJ) + SJ↑ + 他路FKJ↓·ZJ↓ → KJ↑ 经 QJJ/1LJ/2LJ 自闭</text>
          </svg>
          <div class="ds-box" style="margin-top:8px">
            <strong>当前进路 1–7 线完整传递链（${rt.name}）</strong>
            <div class="lt-static" style="font-size:11px"><strong>1–4线：</strong>${rt.line12} ｜ ${rt.line34}<br><strong>5–6线：</strong>${rt.line56}<br><strong>7 线：</strong>${rt.line7}</div>
          </div>
          <div class="cbi-controls-row" style="margin-top:8px">
            <button class="primary-button" data-lt-run="${rt.sandRoute}">🚉 载入 03 沙盘验证本进路 (${rt.sandRoute})</button>
          </div>
        </div>

        <div class="cbi-card">
          <div class="cbi-card-head">
            <h3>第 7 章教材核心原图对照（图 7.2.1 / 7.9.1 / 7.9.3 / 7.10.1）</h3>
            <button class="text-button" data-open-page="${fig.page}">📄 打开 PDF p.${fig.page}</button>
          </div>
          <div class="cbi-subtabs" style="margin-bottom:8px">
            <button class="cbi-subtab${state.selFigKey === '7-2-1' ? ' active' : ''}" data-sel-fig="7-2-1">图7.2.1 选排时序逻辑</button>
            <button class="cbi-subtab${state.selFigKey === '7-9-1' ? ' active' : ''}" data-sel-fig="7-9-1">图7.9.1 1、2线选岔网</button>
            <button class="cbi-subtab${state.selFigKey === '7-9-3' ? ' active' : ''}" data-sel-fig="7-9-3">图7.9.3 5、6线选岔网</button>
            <button class="cbi-subtab${state.selFigKey === '7-10-1' ? ' active' : ''}" data-sel-fig="7-10-1">图7.10.1 7线KJ电路</button>
          </div>
          <p class="cbi-note"><strong>${fig.title}</strong>：为什么 6502 要把双动道岔反位拆到 1–4 线？因为双动渡线会形成并联迂回电路（PDF p.131），必须把“八”字第一笔撇形反位（1、2线）和第二笔捺形反位（3、4线，加防串电二极管 D₁–D₄）分离出来先选，再接通 5、6 线！</p>
          <div style="margin-top:8px"><img src="${fig.src}" alt="${fig.title}" style="width:100%;background:#fff;padding:6px;border-radius:6px"/></div>
        </div>
      </div>
    `;
  }

  function renderModules6502() {
    const cur = MODULES_6502[state.mod6502Idx] || MODULES_6502[0];
    const btns = MODULES_6502.map((m, i) => `<button class="cbi-subtab${i === state.mod6502Idx ? ' active' : ''}" data-mod-idx="${i}">${m.equip} → ${m.combo.split('（')[0]}</button>`).join('');
    const ddSlots = [
      ['0', 'D/R/C/RD', '防雷/熔丝'], ['1', 'BB', 'BD₁-7'], ['2', '1DQJ', 'JWJXC-H'], ['3', 'SJ', 'JWXC-1700'], ['4', '2DQJ', 'JYJXC'],
      ['5', 'AJ', 'JWXC-1700'], ['6', 'DCJ', 'JWXC-1700'], ['7', 'FCJ', 'JWXC-1700'], ['8', 'DBJ', 'JPXC-1000'], ['9', 'FBJ', 'JPXC-1000']
    ];
    const qOpts = [
      '全部采用与单动道岔相同的 DD 组合即可',
      '1/3 双动道岔继电器超过 10 个，必须采用【SDZ 双动主组合 + 半个 SDF 辅组合】拼装',
      '直接借用 Q 区段组合代替道岔组合'
    ];
    return `
      <div class="cbi-grid-2">
        <div class="cbi-card">
          <div class="cbi-card-head">
            <h3>第 6.3 节｜图 6.3.1 下行咽喉 12 种定型组合拼装实验</h3>
            <button class="text-button" data-open-page="101">📄 看原图 PDF p.101</button>
          </div>
          <p class="cbi-note">教材把 6502 全站继电器浓缩成 12 种定型组合，按站场图 3.1.1 直接拼接入 1–15 条网路线。点击下排现场设备查看对应定型组合与内置继电器：</p>
          <div class="cbi-subtabs" style="margin:6px 0">${btns}</div>
          <div class="ds-box">
            <strong>${cur.equip} ⟹ ${cur.combo}</strong>
            <div class="lt-static">${cur.relays}</div>
            <p class="cbi-note">${cur.why}</p>
            <div style="font:11px var(--mono);color:var(--blue)">图 6.3.1 拼图位标：${cur.figTag}</div>
          </div>
          <div style="margin-top:8px">
            <img src="textbook/fig-6-3-1.jpg" alt="图6.3.1 典型小站下行咽喉组合连接图" style="width:100%;background:#fff;padding:8px;border-radius:6px"/>
          </div>
        </div>

        <div class="cbi-card">
          <div class="cbi-card-head">
            <h3>表 6.3.1｜单动道岔组合 DD (0–9号槽) 继电器排布与选型考核</h3>
            <button class="text-button" data-open-page="99">📄 看原表 PDF p.99</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px">
            ${ddSlots.map(([slot, name, mdl]) => `<div class="ds-box" style="padding:7px"><strong style="font-size:11px">${slot} · ${name}</strong><span style="font-size:10px;color:var(--muted)">${mdl}</span></div>`).join('')}
          </div>
          <div style="border-top:1px solid var(--edge);padding-top:10px;margin-top:4px">
            <p class="cbi-q">选型小考（表 6.3.1 & 图 6.3.1）：图 3.1.1 中 1/3 号或 5/7 号双动渡线道岔，在信号楼定型组合架上应当如何配置定型组合？</p>
            <div class="cbi-opts" style="margin-top:8px">
              ${qOpts.map((t, idx) => `<button class="cbi-opt${state.modQuizChoice === idx ? (idx === 1 ? ' correct' : ' wrong') : ''}" data-mod-quiz="${idx}">${idx + 1}. ${t}</button>`).join('')}
            </div>
            ${state.modQuizChoice !== null ? `<p class="cbi-note">${state.modQuizChoice === 1 ? '✓ 完全正确！一组双动道岔所需继电器超过每组合最多 10 个的限制，故拆为 1 个主组合 SDZ + 半个辅组合 SDF（1/3 与 5/7 仅多 1 套 SDF 共用）。' : '再核对表 6.3.1 与 6.3.1 节：每个定型组合最多放 10 个继电器，双动道岔超限需拆分为 SDZ + 半个 SDF！'}</p>` : ''}
          </div>
          <div class="cbi-controls-row" style="margin-top:8px">
            <button class="primary-button" id="cbi-jump-station-rack">🚉 到 03 车站 3D 组合架实操观察</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderCbiIoArch() {
    return `
      <div class="cbi-grid-2">
        <div class="cbi-card">
          <div class="cbi-card-head">
            <h3>第 10.2–10.3 节｜计算机联锁四层结构与三种 I/O 构建（图 10.2.1 / 10.3.1）</h3>
            <button class="text-button" data-open-page="217">📄 看原书 PDF p.217</button>
          </div>
          <div class="arch-stack">
            <div class="arch-layer"><strong>① 人机交互层（控显机/维修机）</strong><span>负责按钮捕捉、站场光带与日志回放；<strong>不承担安全防护职责</strong>，重点保高可用（PDF p.215）</span></div>
            <div class="arch-layer core"><strong>② 联锁运算层（嵌入式安全主机）</strong><span>核心故障—安全大脑（双机热备/二乘二取二/三取二），执行全站联锁条件运算</span></div>
            <div class="arch-layer"><strong>③ I/O 接口层（三种构建对比 · 图10.3.1）</strong><span>(a) 并行总线+无CPU安全板+继电接口 ｜ (b) 串行总线+智能ET电子终端+继电接口 ｜ (c) 全电子强电执行单元直接控室外</span></div>
            <div class="arch-layer"><strong>④ 室外设备层 + 第5章继电执行接口</strong><span>保留或等效实现 DJ/ZXJ/1DQJ/DBJ/FBJ/GJ 等物理防混/断线接口</span></div>
          </div>
          <div class="cbi-controls-row" style="margin-top:12px">
            <button class="primary-button" id="cbi-jump-3dio">🔌 进入 3D 计算机联锁动态驱采实验台（演示 CPU 卡死 1 安全落下）</button>
          </div>
        </div>
        <div class="cbi-card">
          <div class="cbi-card-head">
            <h3>第 11.3 节｜计算机与继电接口的双向“采”与“驱”（图 11.3.2）</h3>
            <button class="text-button" data-open-page="224">📄 看原书 PDF p.224</button>
          </div>
          <img src="textbook/fig-11-3-2.jpg" alt="图11.3.2 计算机联锁继电器驱采电路" style="width:100%;background:#fff;padding:8px;border-radius:6px;margin-bottom:10px"/>
          <p class="cbi-note">核心理解（PDF p.224—225）：计算机联锁<strong>彻底取消了 6502 中间 1–13 线庞大的选排/建立/解锁继电网络</strong>（这些全部变成计算机软件运算！），只保留并直接“驱/采”室外接口层的少量安全执行继电器（如信号的 <code>LXJ/ZXJ/DJ/2DJ</code>，道岔的 <code>DCJ/FCJ/SJ/DBJ/FBJ</code>），由第 13 章故障—安全电路完成强弱电隔离与安全动作。</p>
        </div>
      </div>
    `;
  }

  function renderRedundancy() {
    const f = state.redFaults;
    const mode = state.redMode;
    let verdict = '', safeOut = true, avail = true;
    if (mode === 'hotStandby') {
      const deadCount = (f.A1 ? 1 : 0) + (f.B1 ? 1 : 0);
      if (deadCount === 0) { verdict = '【主机 A 运行 · 备机 B 同步热备】输出正常（单机自检保安全，双机互备保可靠，如图 13.1.1 / JD-1A）。'; }
      else if (f.A1 && !f.B1) { verdict = '⚡ 【主机 A 故障停机 → 热备机 B 接管】当前布尔条件演示保留输出许可。切换耗时与可用性未建模。'; }
      else if (!f.A1 && f.B1) { verdict = '⚠ 【热备机 B 离线维修 · 主机 A 仍带病/单机运行】系统不停车但丧失冗余热备能力。'; }
      else { safeOut = false; avail = false; verdict = '🛑 【主备双机同时故障】切换输出切断至 0 V，导向故障—安全停机！'; }
    } else if (mode === '2oo2') {
      if (f.A1 || f.A2) { safeOut = false; avail = false; verdict = '🛑 【单系二取二表决不一致！】（图 13.2.5）：CPU1 与 CPU2 输出比较不等，表决器立即切断输出至 0 V 安全停机（安全性极高，但单机错即停机可用性差）。'; }
      else { verdict = '✓ 【CPU1 == CPU2 一致输出】单系二取二实时同步比对全部结果一致，安全放行。'; }
    } else if (mode === '2oo3') {
      const dead = (f.A1 ? 1 : 0) + (f.A2 ? 1 : 0) + (f.C ? 1 : 0);
      if (dead === 0) verdict = '✓ 【三台计算机 3/3 一致】三取二表决器全票通过安全输出（图 13.1.2）。';
      else if (dead === 1) verdict = '🛡 【故障掩蔽成功！2/3 少数服从多数】虽然 1 台计算机失效，但其余两台结果一致，系统在不中断条件下继续安全工作！';
      else { safeOut = false; avail = false; verdict = '🛑 【≥2 台不一致】无法形成 2/3 多数一致性，安全表决器强制切断输出！'; }
    } else {
      const sysAok = !(f.A1 || f.A2), sysBok = !(f.B1 || f.B2);
      if (sysAok && sysBok) verdict = '✓ 【DS6-K5B 二乘二取二完美状态】主系 A（内二取二一致）输出驱动，备系 B（内二取二一致）同步热备，FSCPU 电子终端并行。';
      else if (!sysAok && sysBok) verdict = '🛡 【主系 A 内有 CPU 不一致：系 A 立即安全停机自保 → 热备系 B（内二取二正常）接管】演示系内表决与系间备用关系，切换过程和安全等级未验证。';
      else if (sysAok && !sysBok) verdict = '⚠ 【备系 B 内有 CPU 故障已退热备，主系 A 正常安全接管全站输出并等待修复 B 系】。';
      else { safeOut = false; avail = false; verdict = '🛑 【A、B 两系均因系内二取二不一致而关闭输出】全站信号关闭红灯，本例输出关闭。'; }
    }

    return `
      <div class="cbi-card">
        <div class="cbi-card-head">
          <h3>第 13.1 / 13.3 / 13.4 节｜四大设备级冗余与故障—安全交互台</h3>
          <div style="display:flex;gap:8px">
            <button class="text-button" data-open-page="254">📄 双机热备/三取二 (p.254)</button>
            <button class="text-button" data-open-page="268">📄 二乘二取二 (p.268)</button>
          </div>
        </div>
        <div class="cbi-subtabs" style="margin-bottom:12px">
          <button class="cbi-subtab${mode === 'hotStandby' ? ' active' : ''}" data-red-mode="hotStandby">双机热备 (JD-1A · 图13.1.1)</button>
          <button class="cbi-subtab${mode === '2oo2' ? ' active' : ''}" data-red-mode="2oo2">单系二取二 (图13.2.5)</button>
          <button class="cbi-subtab${mode === '2oo3' ? ' active' : ''}" data-red-mode="2oo3">静态三取二 (图13.1.2)</button>
          <button class="cbi-subtab${mode === '2x2oo2' ? ' active' : ''}" data-red-mode="2x2oo2">二乘二取二 (DS6-K5B · 图13.4.1)</button>
        </div>
        <div class="red-nodes">
          ${mode === 'hotStandby' ? `
            <button class="red-node${f.A1 ? ' fault' : ' ok'}" data-red-fault="A1"><strong>主机 A (带自检)</strong><span>${f.A1 ? '✕ 故障停机' : '✓ 正常输出'}</span></button>
            <button class="red-node${f.B1 ? ' fault' : ' ok'}" data-red-fault="B1"><strong>热备机 B (带自检)</strong><span>${f.B1 ? '✕ 故障隔离' : '✓ 同步热备'}</span></button>
          ` : mode === '2oo2' ? `
            <button class="red-node${f.A1 ? ' fault' : ' ok'}" data-red-fault="A1"><strong>CPU 1</strong><span>${f.A1 ? '✕ 结果异常' : '✓ 正常'}</span></button>
            <button class="red-node${f.A2 ? ' fault' : ' ok'}" data-red-fault="A2"><strong>CPU 2</strong><span>${f.A2 ? '✕ 结果异常' : '✓ 正常'}</span></button>
          ` : mode === '2oo3' ? `
            <button class="red-node${f.A1 ? ' fault' : ' ok'}" data-red-fault="A1"><strong>计算机 A</strong><span>${f.A1 ? '✕ 故障' : '✓ 正常'}</span></button>
            <button class="red-node${f.A2 ? ' fault' : ' ok'}" data-red-fault="A2"><strong>计算机 B</strong><span>${f.A2 ? '✕ 故障' : '✓ 正常'}</span></button>
            <button class="red-node${f.C ? ' fault' : ' ok'}" data-red-fault="C"><strong>计算机 C</strong><span>${f.C ? '✕ 故障' : '✓ 正常'}</span></button>
          ` : `
            <div class="red-pair">
              <div class="red-pair-title">Ⅰ 系（内二取二比较）</div>
              <button class="red-node${f.A1 ? ' fault' : ' ok'}" data-red-fault="A1"><strong>Ⅰ-CPU A</strong><span>${f.A1 ? '✕ 故障' : '✓ 同步'}</span></button>
              <button class="red-node${f.A2 ? ' fault' : ' ok'}" data-red-fault="A2"><strong>Ⅰ-CPU B</strong><span>${f.A2 ? '✕ 故障' : '✓ 同步'}</span></button>
            </div>
            <div class="red-pair">
              <div class="red-pair-title">Ⅱ 系（热备内二取二）</div>
              <button class="red-node${f.B1 ? ' fault' : ' ok'}" data-red-fault="B1"><strong>Ⅱ-CPU A</strong><span>${f.B1 ? '✕ 故障' : '✓ 同步'}</span></button>
              <button class="red-node${f.B2 ? ' fault' : ' ok'}" data-red-fault="B2"><strong>Ⅱ-CPU B</strong><span>${f.B2 ? '✕ 故障' : '✓ 同步'}</span></button>
            </div>
          `}
          <div class="red-output ${avail ? 'ok' : 'safe'}">
            <strong>输出与安全判据</strong>
            <span>${avail ? '🟢 允许安全输出（系统可用）' : '🔴 切断输出 → 0V（故障—安全）'}</span>
          </div>
        </div>
        <p class="cbi-note" style="margin-top:12px">点击上方任意计算机/CPU卡片注入故障（再次点击恢复）：<br><strong>${verdict}</strong></p>

        <div class="cbi-grid-2" style="margin-top:14px">
          <div class="ds-box">
            <div class="cbi-card-head" style="margin-bottom:6px">
              <strong>图 13.2.2(a)｜4 光耦静态故障—安全输入编码器（1010 / 0101）</strong>
              <button class="text-button" data-open-page="259">📄 PDF p.258–259</button>
            </div>
            <div class="cbi-controls-row" style="margin-bottom:8px">
              <button class="quiet-button" id="cbi-fs-toggle-j">现场继电器 J 前接点：${state.fsRelayJUp ? '↑ 闭合 (危险侧)' : '↓ 断开 (安全侧)'}</button>
            </div>
            <div class="cbi-subtabs" style="margin-bottom:8px">
              ${state.fsOcFaults.map((st, idx) => {
                const inv = idx % 2 === 0; // 图13.2.2(a)：OC1/OC3 上拉反相(开路恒1/短路恒0)，OC2/OC4 射极下拉同相(开路恒0/短路恒1)
                return `<button class="cbi-subtab${st !== 'ok' ? ' active' : ''}" data-fs-oc="${idx}">OC${idx + 1}: ${st === 'ok' ? '正常' : st === 'open' ? (inv ? '✕开路(恒1)' : '✕开路(恒0)') : (inv ? '✕短路(恒0)' : '✕短路(恒1)')}</button>`;
              }).join('')}
            </div>
            ${(() => {
              const normalBits = state.fsRelayJUp ? ['0', '1', '0', '1'] : ['1', '0', '1', '0'];
              const bits = normalBits.map((b, i) => {
                const inv = i % 2 === 0;
                if (state.fsOcFaults[i] === 'open') return inv ? '1' : '0';
                if (state.fsOcFaults[i] === 'short') return inv ? '0' : '1';
                return b;
              }).join('');
              const isSafeCode = bits === '1010';
              const isDangerCode = bits === '0101';
              const hasAnyFault = state.fsOcFaults.some(x => x !== 'ok');
              return `<p class="cbi-note">当前采集端口 ①②③④ 编码：<code>${bits}</code> ⟹ ${isDangerCode ? (hasAnyFault ? '⚠ <strong>多光耦同向叠加巧合（实际需单点故障安全：任意单光耦开/短路即破坏 0101）</strong>' : '🟢 <strong>合法吸起码 0101</strong>（仅当 J↑ 且 4 路光耦全部完好时成立）') : isSafeCode ? '🛡 <strong>合法安全侧码 1010</strong>（J↓ 安全释放）' : '🚨 <strong>非法故障码（14种非法码之一）！</strong>联锁机立即按【安全侧编码 1010（J↓）】处理，绝不误判为吸起！'}</p>`;
            })()}
            <div style="margin-top:6px"><img src="textbook/fig-13-2-2.jpg" alt="图13.2.2 故障—安全输入电路" style="width:100%;background:#fff;padding:6px;border-radius:6px"/></div>
          </div>

          <div class="ds-box">
            <div class="cbi-card-head" style="margin-bottom:6px">
              <strong>图 13.2.3–13.2.4｜脉冲变压器与动/静态电荷泵输出微电路实验</strong>
              <button class="text-button" data-open-page="260">📄 PDF p.260</button>
            </div>
            <div class="cbi-subtabs" style="margin-bottom:8px">
              <button class="cbi-subtab${state.fsPumpPhase === 'low' ? ' active' : ''}" data-fs-pump="low">脉冲低电平 (回路②充C1)</button>
              <button class="cbi-subtab${state.fsPumpPhase === 'high' ? ' active' : ''}" data-fs-pump="high">脉冲高电平 (回路①充C2驱J↑)</button>
              <button class="cbi-subtab${state.fsPumpPhase === 'stuckHigh' ? ' active' : ''}" data-fs-pump="stuckHigh">⚠ CPU卡死常高1</button>
              <button class="cbi-subtab${state.fsPumpPhase === 'd1Short' ? ' active' : ''}" data-fs-pump="d1Short">⚠ 二极管D1反向击穿</button>
            </div>
            <p class="cbi-note">${state.fsPumpPhase === 'low'
              ? '<strong>图 13.2.4 低电平时段（虚线回路②）</strong>：光耦 U1 截止 → 三极管 T1 导通、T2 截止 → 30V 电源经 R2、T1 向电容 C1 充电，同时储能电容 C2 向偏极继电器 J 放电保持 J↑！'
              : state.fsPumpPhase === 'high'
                ? '<strong>图 13.2.4 高电平时段（点线回路①）</strong>：光耦 U1 导通 → T1 截止、T2 导通 → C1 通过 D2 向 C2 泵电补充能量并向偏极继电器 J 输出工作电流保持 J↑！'
                : state.fsPumpPhase === 'stuckHigh'
                  ? '🛡 <strong>CPU 死机输出恒定高电平 1（PDF p.260）</strong>：脉冲变压器 T 因 dΦ/dt=0 隔直无输出；图 13.2.4 电荷泵中 T1 长期截止使 C1 无法补充电荷，待 C2 放电至落下值后 J 可靠失磁落下 ↓！'
                  : '🛡 <strong>二极管 D1 反向击穿（PDF p.260 原文重点）</strong>：即使 D1 反向击穿，由于执行继电器 J 采用【偏极继电器 JPXC-1000】，反极性电流无法使其吸起，依然导向安全落下 ↓！'}</p>
            <div class="cbi-grid-2" style="margin-top:6px">
              <div><img src="textbook/fig-13-2-3.jpg" alt="图13.2.3 脉冲变压器动态输出" style="width:100%;background:#fff;padding:6px;border-radius:6px"/></div>
              <div><img src="textbook/fig-13-2-4.jpg" alt="图13.2.4 动静态电容泵输出" style="width:100%;background:#fff;padding:6px;border-radius:6px"/></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderDataStruct() {
    const fl = state.dataFlags;
    const routes = [
      { id: 1, name: 'X → IG 正线接车', sw: '[1/3:定, 5/7:定, 11:定]', sec: '[IAG, 1DG, 1/7G, 7-11DG, IG]', opp: '[D1, D3, D7, SⅠ]' },
      { id: 3, name: 'X → 3G 侧线接车', sw: '[1/3:定, 5/7:定, 11:反]', sec: '[IAG, 1DG, 1/7G, 7-11DG, 3G]', opp: '[D1, D3, D7, S3]' },
      { id: 17, name: 'D₁ → D₇ 调车', sw: '[1/3:定]', sec: '[1DG]', opp: '[X, D3, 条件<5/7>(SⅠ,S3)]' }
    ];
    const rt = routes[state.dataRouteIdx];
    return `
      <div class="cbi-card">
        <div class="cbi-card-head">
          <h3>第 12.4–12.5 节｜进路表静态数据（表 12.4.8）与物理/逻辑动态标志对照</h3>
          <div style="display:flex;gap:8px">
            <button class="text-button" data-open-page="244">📄 进路静态表 (p.244)</button>
            <button class="text-button" data-open-page="246">📄 物理/逻辑分离 (p.246)</button>
          </div>
        </div>
        <div class="cbi-subtabs" style="margin-bottom:10px">
          ${routes.map((r, idx) => `<button class="cbi-subtab${idx === state.dataRouteIdx ? ' active' : ''}" data-ds-route="${idx}">${r.name}</button>`).join('')}
        </div>
        <div class="cbi-grid-2">
          <div class="ds-box">
            <strong>① 只读静态联锁表数据（表 12.4.8 · ROM 固化，抗单粒子篡改）</strong>
            <pre class="ds-code">RouteID: ${rt.id} (${rt.name})
BtnPair: { start, end }   // 区分始端与终端按钮
RequiredSwitches: ${rt.sw}
RouteSections:    ${rt.sec}
HostileSignals:   ${rt.opp}
ConflictCheck:    表12.4.8 + 超限绝缘检查数组</pre>
            <p class="cbi-note">提示：原教材 PDF 242 页表 12.4.4 印刷“空闲时进路不能建立”系原文与下文矛盾，实际联锁条件与表 12.2.1 一致：空闲且未征用才能建立。</p>
          </div>
          <div class="ds-box">
            <strong>② 实时动态数据（物理采集状态 ≠ 软件逻辑标志 · PDF p.246）</strong>
            <div class="cbi-controls-row" style="margin:8px 0">
              <label class="inline-check"><input type="checkbox" data-df="occupied" ${fl.occupied ? 'checked' : ''}>物理采集 DGJ↓ (轨道有车)</label>
              <label class="inline-check"><input type="checkbox" data-df="reserved" ${fl.reserved ? 'checked' : ''}>逻辑：征用标志 Reserved</label>
              <label class="inline-check"><input type="checkbox" data-df="locked" ${fl.locked ? 'checked' : ''}>逻辑：锁闭标志 Locked (等效SJ↓)</label>
              <label class="inline-check"><input type="checkbox" data-df="wasOccupied" ${fl.wasOccupied ? 'checked' : ''}>逻辑：曾占用 WasOccupied (等效1LJ↑)</label>
              <label class="inline-check"><input type="checkbox" data-df="sigOpened" ${fl.sigOpened ? 'checked' : ''}>逻辑：曾开放 SigOpened (防重开/区分预接近)</label>
            </div>
            <p class="cbi-note">${fl.occupied && !fl.locked
              ? '当前区段属于“故障/常规占用”，【无进路锁闭标志】；此时与第 12.2 节对应不可误触发自动三点解锁！'
              : fl.locked && fl.wasOccupied && !fl.occupied
                ? '✓ 已满足“进路曾锁闭 + 本段曾占用(等效1LJ↑) + 当前物理出清(DGJ↑)”，等待 3 s 延时与下一段物理占用后即可清除动态进路控制表并解锁！'
                : '教材第 12.4.3 节核心要求：物理状态仅反映采集回采的 0101/1010，绝不可与软件运算的“征用、锁闭、曾占用、曾开放”混用同一标志位！'}</p>
          </div>
        </div>
      </div>
    `;
  }

  function bindSubEvents(container, appState, callbacks) {
    const ov = container.querySelector('#cbi-overlimit');
    if (ov) ov.onchange = e => { state.overLimitOn = e.target.checked; render(container, appState, callbacks); };
    const no = container.querySelector('#cbi-nocc');
    if (no) no.onchange = e => { state.neighborOcc = e.target.checked; render(container, appState, callbacks); };
    const cd = container.querySelector('#cbi-cross-double');
    if (cd) cd.onchange = e => { state.crossoverDouble = e.target.checked; render(container, appState, callbacks); };
    container.querySelectorAll('[data-sw-scene]').forEach(b => {
      b.onclick = () => { state.switchNormalScene = b.dataset.swScene; render(container, appState, callbacks); };
    });
    const tdir = container.querySelector('#cbi-toggle-train-dir');
    if (tdir) tdir.onclick = () => { state.trainMoveRight = !state.trainMoveRight; render(container, appState, callbacks); };
    container.querySelectorAll('[data-sq-opt]').forEach(b => {
      b.onclick = () => { state.switchQChoice = Number(b.dataset.sqOpt); render(container, appState, callbacks); };
    });
    const sqNext = container.querySelector('#cbi-sq-next');
    if (sqNext) sqNext.onclick = () => { state.switchQIdx = (state.switchQIdx + 1) % SWITCH_NORMAL_QS.length; state.switchQChoice = null; render(container, appState, callbacks); };
    container.querySelectorAll('[data-yr]').forEach(b => {
      b.onclick = () => { state.yardRange = b.dataset.yr; render(container, appState, callbacks); };
    });

    // 第 5 章 室外接口电路事件
    container.querySelectorAll('[data-ifc5-stg]').forEach(b => {
      b.onclick = () => { state.ifc5TurnoutStage = Number(b.dataset.ifc5Stg); render(container, appState, callbacks); };
    });
    const ifc5Sj = container.querySelector('#cbi-ifc5-sj');
    if (ifc5Sj) ifc5Sj.onchange = e => { state.ifc5SjLocked = e.target.checked; render(container, appState, callbacks); };
    container.querySelectorAll('[data-ifc5-ind]').forEach(b => {
      b.onclick = () => { state.ifc5IndFault = b.dataset.ifc5Ind; render(container, appState, callbacks); };
    });
    const ifc5Shunt = container.querySelector('#cbi-ifc5-shunt');
    if (ifc5Shunt) ifc5Shunt.onchange = e => { state.ifc5TrackShunt = e.target.checked; render(container, appState, callbacks); };
    const ifc5Br = container.querySelector('#cbi-ifc5-branch');
    if (ifc5Br) ifc5Br.onchange = e => { state.ifc5BranchFault = e.target.checked; render(container, appState, callbacks); };
    const ifc550 = container.querySelector('#cbi-ifc5-50hz');
    if (ifc550) ifc550.onchange = e => { state.ifc5Traction50Hz = e.target.checked; render(container, appState, callbacks); };
    const ifc5Jt = container.querySelector('#cbi-ifc5-joint');
    if (ifc5Jt) ifc5Jt.onchange = e => { state.ifc5JointBroken = e.target.checked; render(container, appState, callbacks); };
    const ifc5Cr = container.querySelector('#cbi-ifc5-cross');
    if (ifc5Cr) ifc5Cr.onchange = e => { state.ifc5PhaseCrossed = e.target.checked; render(container, appState, callbacks); };
    const jTo3d = container.querySelector('#cbi-jump-turnout3d');
    if (jTo3d) jTo3d.onclick = () => callbacks.onLaunch({ mode: 'bench', type: 'turnoutLab', toStage: state.ifc5TurnoutStage, toSjLocked: state.ifc5SjLocked, toIndFault: state.ifc5IndFault });
    const jFw3d = container.querySelector('#cbi-jump-fivewire3d');
    if (jFw3d) jFw3d.onclick = () => callbacks.onLaunch({ mode: 'bench', type: 'fiveWireLab', fwStage: 0 });
    const jTr25 = container.querySelector('#cbi-jump-track25');
    if (jTr25) jTr25.onclick = () => callbacks.onLaunch({ mode: 'track', type: 'phase' });
    const jTr50 = container.querySelector('#cbi-jump-track50');
    if (jTr50) jTr50.onclick = () => callbacks.onLaunch({ mode: 'track', type: 'rectifier', multi: true });

    // 第 7 章 1–7 线选排实验室事件
    container.querySelectorAll('[data-sel-rt]').forEach(b => {
      b.onclick = () => { state.selRouteIdx = Number(b.dataset.selRt); render(container, appState, callbacks); };
    });
    container.querySelectorAll('[data-sel-stp]').forEach(b => {
      b.onclick = () => { state.selStep = Number(b.dataset.selStp); render(container, appState, callbacks); };
    });
    const selFlt = container.querySelector('#cbi-sel-fault');
    if (selFlt) selFlt.onchange = e => { state.selFault = e.target.value; render(container, appState, callbacks); };
    container.querySelectorAll('[data-sel-fig]').forEach(b => {
      b.onclick = () => { state.selFigKey = b.dataset.selFig; render(container, appState, callbacks); };
    });

    // 第 13.2 节 静态 4 光耦与电荷泵微电路事件
    const fsToggleJ = container.querySelector('#cbi-fs-toggle-j');
    if (fsToggleJ) fsToggleJ.onclick = () => { state.fsRelayJUp = !state.fsRelayJUp; render(container, appState, callbacks); };
    container.querySelectorAll('[data-fs-oc]').forEach(b => {
      b.onclick = () => {
        const idx = Number(b.dataset.fsOc);
        const order = ['ok', 'open', 'short'];
        state.fsOcFaults[idx] = order[(order.indexOf(state.fsOcFaults[idx]) + 1) % order.length];
        render(container, appState, callbacks);
      };
    });
    container.querySelectorAll('[data-fs-pump]').forEach(b => {
      b.onclick = () => { state.fsPumpPhase = b.dataset.fsPump; render(container, appState, callbacks); };
    });

    container.querySelectorAll('[data-lt-idx]').forEach(b => {
      b.onclick = () => { state.lockIdx = Number(b.dataset.ltIdx); state.lockDraft = {}; state.lockChecked = false; render(container, appState, callbacks); };
    });
    container.querySelectorAll('[data-lt-field]').forEach(sel => {
      sel.onchange = e => { state.lockDraft[sel.dataset.ltField] = e.target.value; render(container, appState, callbacks); };
    });
    const ltChk = container.querySelector('#cbi-lt-check');
    if (ltChk) ltChk.onclick = () => { state.lockChecked = true; render(container, appState, callbacks); };
    const ltFill = container.querySelector('#cbi-lt-fill');
    if (ltFill) ltFill.onclick = () => { state.lockDraft = { ...LOCK_ROUTES[state.lockIdx].answer }; state.lockChecked = true; render(container, appState, callbacks); };
    container.querySelectorAll('[data-lt-run]').forEach(b => {
      b.onclick = () => callbacks.onLaunch({ mode: 'station', stationRoute: b.dataset.ltRun, stationStage: 5, stationTrain: -26, cancelMode: 'none', blindFault: 'none', lampFault: false, switchFault: false, poorShunt: false, signalFaultLocked: false });
    });

    const j3d = container.querySelector('#cbi-jump-3dio');
    if (j3d) j3d.onclick = () => callbacks.onLaunch({ mode: 'bench', type: 'cbiIoLab', cbiFault: 'none' });

    container.querySelectorAll('[data-mod-idx]').forEach(b => {
      b.onclick = () => { state.mod6502Idx = Number(b.dataset.modIdx); render(container, appState, callbacks); };
    });
    container.querySelectorAll('[data-mod-quiz]').forEach(b => {
      b.onclick = () => { state.modQuizChoice = Number(b.dataset.modQuiz); render(container, appState, callbacks); };
    });
    const jsr = container.querySelector('#cbi-jump-station-rack');
    if (jsr) jsr.onclick = () => callbacks.onLaunch({ mode: 'station', stationStage: 5, stationTrain: -26 });

    container.querySelectorAll('[data-red-mode]').forEach(b => {
      b.onclick = () => { state.redMode = b.dataset.redMode; state.redFaults = { A1: false, A2: false, B1: false, B2: false, C: false }; render(container, appState, callbacks); };
    });
    container.querySelectorAll('[data-red-fault]').forEach(b => {
      b.onclick = () => { const k = b.dataset.redFault; state.redFaults[k] = !state.redFaults[k]; render(container, appState, callbacks); };
    });
    container.querySelectorAll('[data-ds-route]').forEach(b => {
      b.onclick = () => { state.dataRouteIdx = Number(b.dataset.dsRoute); render(container, appState, callbacks); };
    });
    container.querySelectorAll('[data-df]').forEach(inp => {
      inp.onchange = e => { state.dataFlags[inp.dataset.df] = e.target.checked; render(container, appState, callbacks); };
    });
    container.querySelectorAll('[data-open-page]').forEach(b => {
      b.onclick = () => callbacks.onOpenPage(Number(b.dataset.openPage));
    });
  }

  const api = { render, LOCK_ROUTES, SWITCH_NORMAL_QS, MODULES_6502, ROUTES_1_7 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CbiLab = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
