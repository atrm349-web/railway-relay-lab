(function (root) {
  'use strict';

  // 第 7、8、9、11.3、13.2 章共 60 幅核心继电联锁与安全电子接口电路仿真定义
  // 严格对照岳强《车站信号自动控制》（第二版）及 audit/电路接点逐图核查.md
  const CIRCUIT_FIGURES_B = [
    // ==================== 第 7 章（20 幅：7.2.1 — 7.10.2） ====================
    {
      id: '7.2.1', ch: 7, page: 110, engine: 'circuit', sub: 'sequence',
      title: '图 7.2.1 · 下行接车至 ⅠG 列车进路的时序逻辑（选排全链因果推进）',
      summary: '按图 7.2.1 实序步进：`XLAJ↑ → LJJ↑`、按终端 `SⅠLAJ↑` → 左端 `XJXJ↑` 触发 `LKJ↑/FKJ↑` → 自左向右并联传递 `1/3-1DCJ → D3JXJ → D7JXJ → 5/7-2DCJ → 11DCJ → SⅠJXJ` → 记录复原 → 转动道岔 `DBJ↑` → `XKJ↑`！',
      signals: ['XLAJ/SⅠLAJ', 'LJJ(方向)', 'XJXJ/SⅠJXJ', 'FKJ/LKJ', '1/3·5/7·11DCJ', 'DBJ(表示)', 'XKJ(7线)'],
      steps: [
        { title: '① 按压始端 XLA、终端 SⅠLA', active: ['XLAJ/SⅠLAJ'], desc: '始终端按钮继电器自闭记录进路两端。' },
        { title: '② 方向继电器 LJJ↑ 吸起送出方向电源', active: ['XLAJ/SⅠLAJ', 'LJJ(方向)'], desc: 'XLAJ 前接点接通 LJJ（列车接车方向），向选岔网路送 KZ/KF-LJJ-Q。' },
        { title: '③ 5–6 线自左向右并联传递选岔与 JXJ', active: ['XLAJ/SⅠLAJ', 'LJJ(方向)', 'XJXJ/SⅠJXJ', 'FKJ/LKJ', '1/3·5/7·11DCJ'], desc: 'XJXJ↑ 励磁 LKJ/FKJ，随后 1/3-1DCJ → D3JXJ → D7JXJ → 5/7-2DCJ → 11DCJ → SⅠJXJ 顺序吸起！' },
        { title: '④ 记录电路自动复原（AJ↓ · LJJ↓ · JXJ↓）', active: ['FKJ/LKJ', '1/3·5/7·11DCJ'], desc: '各 JXJ 切本点 AJ，全部 AJ 复原后 LJJ 与 JXJ 落下，保留 FKJ/LKJ 与 DCJ。' },
        { title: '⑤ 道岔转换密贴并有定位表示（DBJ↑）', active: ['FKJ/LKJ', '1/3·5/7·11DCJ', 'DBJ(表示)'], desc: 'DCJ 驱动 1DQJ→2DQJ→转辙机到位，确认 1/3、5/7、11 全定位 DBJ↑。' },
        { title: '⑥ 7 线验证选排一致 → XKJ↑ 吸起！', active: ['FKJ/LKJ', '1/3·5/7·11DCJ', 'DBJ(表示)', 'XKJ(7线)'], desc: '7 线串检 DCJ·DBJ 与 SJ↑、敌对未建后使 XKJ↑，转入 8–11 线进路建立！' }
      ]
    },
    {
      id: '7.2.2', ch: 7, page: 112, engine: 'circuit', sub: 'sequence',
      title: '图 7.2.2 · 调车发车进路时序逻辑（SⅠ → X_F 含 1–2 线先选双动反位）',
      summary: '调车发车先由 `SⅠDAJ→DFJ`，因进路经 **5/7 双动反位**，先经 **1–2 线选 `5/7 1FCJ→2FCJ`**，再由 5–6 线自左向右 `XFJXJ→1/3-2DCJ→D5JXJ→11DCJ→SⅠJXJ`，`XFZJ` 记终端、`SⅠFKJ` 记始端，最后 7 线 `SⅠKJ↑`！',
      signals: ['SⅠDAJ/XFAJ', 'DFJ(调发)', '1-2线(5/7FCJ)', '5-6线(DCJ/JXJ)', 'SⅠFKJ/XFZJ', 'DBJ/FBJ', 'SⅠKJ(7线)'],
      steps: [
        { title: '① 按压调车始端 SⅠDA 与终端 X_FA', active: ['SⅠDAJ/XFAJ'], desc: '按钮继电器自闭记录进路起止。' },
        { title: '② 调车发车方向 DFJ↑ 吸起', active: ['SⅠDAJ/XFAJ', 'DFJ(调发)'], desc: 'DFJ 送出 KZ/KF-DFJ-Q 方向电源。' },
        { title: '③ 1–2 线优先选双动 5/7 反位（1FCJ→2FCJ）', active: ['SⅠDAJ/XFAJ', 'DFJ(调发)', '1-2线(5/7FCJ)'], desc: '先用 1–2 线单独选出撇形双动渡线 5/7 反位，防并联迂回！' },
        { title: '④ 5–6 线自左向右选其余道岔与 JXJ', active: ['DFJ(调发)', '1-2线(5/7FCJ)', '5-6线(DCJ/JXJ)', 'SⅠFKJ/XFZJ'], desc: 'XFJXJ→1/3-2DCJ→D5JXJ→11DCJ→SⅠJXJ，同时励磁始端 SⅠFKJ 与终端 XFZJ。' },
        { title: '⑤ 道岔转换到位（5/7 FBJ↑ · 1/3与11 DBJ↑）', active: ['1-2线(5/7FCJ)', '5-6线(DCJ/JXJ)', 'SⅠFKJ/XFZJ', 'DBJ/FBJ'], desc: '所有道岔转换至要求位置并给出对应表示。' },
        { title: '⑥ 7 线检查一致 → SⅠKJ↑ 吸起', active: ['1-2线(5/7FCJ)', 'SⅠFKJ/XFZJ', 'DBJ/FBJ', 'SⅠKJ(7线)'], desc: '检查 11SJ/1/3-2SJ↑、表示一致与敌对未建，SⅠKJ↑ 完成选排！' }
      ]
    },
    {
      id: '7.3.1', ch: 7, page: 113, engine: 'circuit', sub: 'ladder',
      title: '图 7.3.1 · X 进站信号机列车 AJ 工作电路（3-4 励磁 + 1-2 自闭与缓放）',
      summary: '与图 6.3.2 同构：按下 XLA 励磁 `AJ(3-4)`，`AJ(1-2)` 串 `XJ后·QJ后·FKJ后·JXJ后·AJ7前` 自闭；JXJ 吸起切断 AJ 时，靠 **AJ 缓放特性**保证 JXJ 可靠吸起！',
      rails: ['KZ', 'KF'],
      inputs: [
        { id: 'xla', label: '按压 XLA 进站列车按钮', def: false },
        { id: 'jxj', label: 'XJXJ↑（选路通过自动切 AJ）', def: false },
        { id: 'fkj', label: 'FKJ↑（始端记录中）', def: false },
        { id: 'xj', label: 'LXJ↑（信号已开放）', def: false }
      ],
      rungs: [
        { id: 'xaj', label: 'XLA→AJ(3-4) ∥ XJ1后·QJ6后·FKJ2后·JXJ6后·AJ7前→AJ(1-2)', coil: 'XLAJ', slowRelease: 0.45, contacts: [
          { label: '按压 XLA', kind: 'btn', on: s => s.xla }
        ], altBranch: {
          label: '1-2 缓放自闭保持',
          contacts: [
            { label: 'XJ1后·FKJ2后', kind: 'back', on: s => !s.xj && !s.fkj },
            { label: 'JXJ 6后', kind: 'back', on: s => !s.jxj },
            { label: 'AJ 7前自闭', kind: 'front', on: (s, rl) => rl.XLAJ }
          ]
        }}
      ],
      presets: [
        { label: '① 按压 XLA 励磁', set: { xla: true, jxj: false, fkj: false, xj: false } },
        { label: '② 松手自闭记忆', set: { xla: false, jxj: false, fkj: false, xj: false } },
        { label: '③ JXJ↑ 切断（缓放防抢断）', set: { xla: false, jxj: true, fkj: false, xj: false } }
      ],
      verdict: (s, rl) => `XLAJ=${rl.XLAJ ? '↑(记录中/缓放)' : '↓(已复原)'}`
    },
    {
      id: '7.3.2', ch: 7, page: 115, engine: 'circuit', sub: 'ladder',
      title: '图 7.3.2 · 进站信号机内方带调车的按钮继电器工作电路（XLAJ 与 D1AJ 共链）',
      summary: '进站 X 与内方调车 D1 共用 `LXJ1后·DXJ2后·QJ后·FKJ后·JXJ后` 复原断链，分别由 `XLA` 励磁 `XLAJ(3-4)`、`D1A` 励磁 `D1AJ(3-4)` 并各自第 7 组前接点自闭保持！',
      rails: ['KZ', 'KF'],
      inputs: [
        { id: 'xla', label: '按压进站列车按钮 XLA', def: false },
        { id: 'd1a', label: '按压内方调车按钮 D1A', def: false },
        { id: 'open', label: 'LXJ↑ 或 DXJ↑（信号已开放，禁止自闭！）', def: false },
        { id: 'jxj', label: 'JXJ↑（选路完毕复原切断）', def: false }
      ],
      rungs: [
        { id: 'la', label: 'XLAJ：XLA→3-4 ∥ 共用(LXJ后·DXJ后·JXJ后)·XLAJ7前→1-2', coil: 'XLAJ', contacts: [
          { label: '按 XLA', kind: 'btn', on: s => s.xla }
        ], altBranch: { label: 'XLAJ自闭', contacts: [{ label: 'LXJ/DXJ/JXJ后', kind: 'back', on: s => !s.open && !s.jxj }, { label: 'XLAJ 7前', kind: 'front', on: (s, rl) => rl.XLAJ }] } },
        { id: 'da', label: 'D1AJ：D1A→3-4 ∥ 共用(LXJ后·DXJ后·JXJ后)·D1AJ7前→1-2', coil: 'D1AJ', contacts: [
          { label: '按 D1A', kind: 'btn', on: s => s.d1a }
        ], altBranch: { label: 'D1AJ自闭', contacts: [{ label: 'LXJ/DXJ/JXJ后', kind: 'back', on: s => !s.open && !s.jxj }, { label: 'D1AJ 7前', kind: 'front', on: (s, rl) => rl.D1AJ }] } }
      ],
      presets: [
        { label: '① 按 XLA 办列车接车', set: { xla: true, d1a: false, open: false, jxj: false } },
        { label: '② 按 D1A 办调车作业', set: { xla: false, d1a: true, open: false, jxj: false } },
        { label: '③ 开放信号或选路毕复原', set: { xla: false, d1a: false, open: true, jxj: true } }
      ],
      verdict: (s, rl) => `XLAJ=${rl.XLAJ ? '↑' : '↓'} ｜ D1AJ=${rl.D1AJ ? '↑' : '↓'}（列车/调车共享复原链，严防开放后再误自闭）`
    },
    {
      id: '7.3.3', ch: 7, page: 115, engine: 'circuit', sub: 'ladder',
      title: '图 7.3.3 · 差置信号机 AJ 工作电路（D3AJ / D7AJ 互带与变通功能）',
      summary: '差置 D3/D7 分别有 3-4 励磁和 1-2 自闭，并通过**对方第 4 组后接点**接 `KZ-列共-Q` 构成列车变通带动电路（绝不可将第 4 组后接点错改为前接点）！',
      rails: ['KZ / KZ-列共-Q', 'KF'],
      inputs: [
        { id: 'd3a', label: '按压 D3A（左向差置按钮）', def: false },
        { id: 'd7a', label: '按压 D7A（右向差置按钮）', def: false },
        { id: 'colPower', label: 'KZ-列共-Q 有电（办理列车变通进路！）', def: false },
        { id: 'done', label: 'JXJ↑ 选路完毕复原', def: false }
      ],
      rungs: [
        { id: 'd3', label: 'D3AJ：D3A→3-4 ∥ (KZ-列共-Q·D7AJ4后 / D3AJ6前·JXJ6后)→1-2', coil: 'D3AJ', contacts: [
          { label: '按 D3A', kind: 'btn', on: s => s.d3a }
        ], altBranch: { label: 'D3AJ自闭/变通', contacts: [{ label: 'D3AJ6前 ∥ 变通(列共·D7AJ4后)', kind: 'front', on: (s, rl) => rl.D3AJ || (s.colPower && !rl.D7AJ) }, { label: 'JXJ6后', kind: 'back', on: s => !s.done }] } },
        { id: 'd7', label: 'D7AJ：D7A→3-4 ∥ (KZ-列共-Q·D3AJ4后 / D7AJ6前·JXJ6后)→1-2', coil: 'D7AJ', contacts: [
          { label: '按 D7A', kind: 'btn', on: s => s.d7a }
        ], altBranch: { label: 'D7AJ自闭/变通', contacts: [{ label: 'D7AJ6前 ∥ 变通(列共·D3AJ4后)', kind: 'front', on: (s, rl) => rl.D7AJ || (s.colPower && !rl.D3AJ) }, { label: 'JXJ6后', kind: 'back', on: s => !s.done }] } }
      ],
      presets: [
        { label: '① 单按 D7A 办理调车', set: { d3a: false, d7a: true, colPower: false, done: false } },
        { label: '② 列车变通进路送 KZ-列共-Q', set: { d3a: false, d7a: false, colPower: true, done: false } },
        { label: '③ 选路毕复原', set: { d3a: false, d7a: false, colPower: false, done: true } }
      ],
      verdict: (s, rl) => `差置互带状态：D3AJ=${rl.D3AJ ? '↑' : '↓'} ｜ D7AJ=${rl.D7AJ ? '↑' : '↓'}`
    },
    {
      id: '7.3.4', ch: 7, page: 116, engine: 'circuit', sub: 'ladder',
      title: '图 7.3.4 · 单置调车信号机 AJ 工作电路（1AJ · 2AJ · AJ 三继电器 4 大功能！）',
      summary: '第 7 章必考大题（c7-7）！单置调车信号机设 `1AJ、2AJ、AJ` 三个继电器，配合区分四大功能：**① 作始端 (`1AJ↑·AJ↑·2AJ↓`)**、**② 作终端 (`1AJ↑·2AJ↑·AJ↓`)**、**③ 作变通 (`三者全↑`)**、**④ 取消/重复开放**！',
      rails: ['KZ / 方向正电源', 'KF / KF-共用-Q'],
      inputs: [
        { id: 'd5a', label: '按压单置按钮 D5A（励磁 1AJ）', def: true },
        { id: 'dirMode', label: '已建立方向电源（即本按钮为【第2个/终端】按下！）', def: false },
        { id: 'viaMode', label: '作变通进路按钮（同时满足始端与终端条件）', def: false },
        { id: 'jxjCut', label: '选路通过复原：JXJ 6组吸起（切断 1AJ 自闭！）', def: false }
      ],
      rungs: [
        { id: 'aj1', label: '1AJ：D5A → 1AJ(3-4) ∥ JXJ6后·1AJ4前 → 1AJ(1-2) → KF共用-Q', coil: 'AJ1', contacts: [
          { label: '按压 D5A', kind: 'btn', on: s => s.d5a }
        ], altBranch: { label: '1AJ自闭与复原', contacts: [
          { label: '1AJ 4前自闭', kind: 'front', on: (s, rl) => rl.AJ1 },
          { label: 'JXJ 6后(未复原)', kind: 'back', on: s => !s.jxjCut }
        ]}},
        { id: 'aj', label: 'AJ（始端标志）：1AJ↑ 且 (未建方向作始端 ∥ 变通)', coil: 'AJ', contacts: [
          { label: '1AJ 前', kind: 'front', on: (s, rl) => rl.AJ1 },
          { label: '无方向电源(始端) ∥ 变通', kind: 'front', on: s => !s.dirMode || s.viaMode }
        ]},
        { id: 'aj2', label: '2AJ（终端标志）：1AJ↑ 且 (已建方向作终端 ∥ 变通)', coil: 'AJ2', contacts: [
          { label: '1AJ 前', kind: 'front', on: (s, rl) => rl.AJ1 },
          { label: '有方向电源(终端) ∥ 变通', kind: 'front', on: s => s.dirMode || s.viaMode }
        ]}
      ],
      presets: [
        { label: '① 功能1：作始端（1AJ↑ · AJ↑ · 2AJ↓）', set: { d5a: true, dirMode: false, viaMode: false, jxjCut: false } },
        { label: '② 功能2：作终端（1AJ↑ · 2AJ↑ · AJ↓）', set: { d5a: true, dirMode: true, viaMode: false, jxjCut: false } },
        { label: '③ 功能3：作变通按钮（1AJ↑ · AJ↑ · 2AJ↑ 全吸！）', set: { d5a: true, dirMode: true, viaMode: true, jxjCut: false } },
        { label: '④ 选路完毕复原（JXJ6后切自闭 → 三者全↓）', set: { d5a: false, dirMode: false, viaMode: false, jxjCut: true } }
      ],
      verdict: (s, rl) => {
        if (rl.AJ1 && rl.AJ && rl.AJ2) return '★ 编码 [1AJ↑ · AJ↑ · 2AJ↑] → 功能③：变通按钮！';
        if (rl.AJ1 && rl.AJ && !rl.AJ2) return '★ 编码 [1AJ↑ · AJ↑ · 2AJ↓] → 功能①：调车进路始端！';
        if (rl.AJ1 && !rl.AJ && rl.AJ2) return '★ 编码 [1AJ↑ · 2AJ↑ · AJ↓] → 功能②：调车进路终端！';
        return '○ 待机/已复原（0-0-0）。';
      }
    },
    {
      id: '7.4.1', ch: 7, page: 118, engine: 'circuit', sub: 'ladder',
      title: '图 7.4.1 · 下行咽喉方向继电器电路（LJJ / LFJ / DJJ / DFJ 四方向严格互斥）',
      summary: '按教材图 7.4.1：列车接车 LJJ、列车发车 LFJ、调车接车 DJJ、调车发车 DFJ 通过各自第 1、2 组后接点**两两交叉互锁**（任何时刻咽喉最多只准吸起 1 只方向继电器！），共用 KF 串 `ZQJ4后`！',
      rails: ['KZ', 'KF (经 ZQJ 4后)'],
      inputs: [
        { id: 'xla', label: '始端按压 XLA（列车接车 → LJJ）', def: true },
        { id: 'sla', label: '始端按压 SⅠLA（列车发车 → LFJ）', def: false },
        { id: 'd1a', label: '始端按压 D1A（调车接车 → DJJ）', def: false },
        { id: 'sda', label: '始端按压 SⅠDA（调车发车 → DFJ）', def: false },
        { id: 'zqj', label: '正在办理总取消 ZQJ↑（切断共用 KF!）', def: false }
      ],
      rungs: [
        { id: 'ljj', label: 'LJJ (列接)：XLAJ前 · LFJ2后 · DJJ1后 · DFJ1后 · ZQJ4后', coil: 'LJJ', contacts: [
          { label: 'XLAJ前', kind: 'front', on: s => s.xla },
          { label: '三方向互斥后', kind: 'back', on: (s, rl) => !rl.LFJ && !rl.DJJ && !rl.DFJ },
          { label: 'ZQJ 4后', kind: 'back', on: s => !s.zqj }
        ]},
        { id: 'lfj', label: 'LFJ (列发)：SⅠLAJ前 · LJJ2后 · DJJ1后 · DFJ1后 · ZQJ4后', coil: 'LFJ', contacts: [
          { label: 'SⅠLAJ前', kind: 'front', on: s => s.sla },
          { label: '三方向互斥后', kind: 'back', on: (s, rl) => !rl.LJJ && !rl.DJJ && !rl.DFJ },
          { label: 'ZQJ 4后', kind: 'back', on: s => !s.zqj }
        ]},
        { id: 'djj', label: 'DJJ (调接)：D1AJ前 · DFJ2后 · LJJ1后 · LFJ1后 · ZQJ4后', coil: 'DJJ', contacts: [
          { label: 'D1AJ前', kind: 'front', on: s => s.d1a },
          { label: '三方向互斥后', kind: 'back', on: (s, rl) => !rl.DFJ && !rl.LJJ && !rl.LFJ },
          { label: 'ZQJ 4后', kind: 'back', on: s => !s.zqj }
        ]},
        { id: 'dfj', label: 'DFJ (调发)：SⅠDAJ前 · DJJ2后 · LJJ1后 · LFJ1后 · ZQJ4后', coil: 'DFJ', contacts: [
          { label: 'SⅠDAJ前', kind: 'front', on: s => s.sda },
          { label: '三方向互斥后', kind: 'back', on: (s, rl) => !rl.DJJ && !rl.LJJ && !rl.LFJ },
          { label: 'ZQJ 4后', kind: 'back', on: s => !s.zqj }
        ]}
      ],
      presets: [
        { label: '① 下行列车接车 LJJ↑', set: { xla: true, sla: false, d1a: false, sda: false, zqj: false } },
        { label: '② 下行列车发车 LFJ↑', set: { xla: false, sla: true, d1a: false, sda: false, zqj: false } },
        { label: '③ 调车发车 DFJ↑', set: { xla: false, sla: false, d1a: false, sda: true, zqj: false } },
        { label: '④ 总取消 ZQJ↑（统切所有方向继电器!）', set: { xla: true, sla: false, d1a: false, sda: false, zqj: true } }
      ],
      verdict: (s, rl) => {
        const up = ['LJJ','LFJ','DJJ','DFJ'].filter(k => rl[k]);
        return up.length ? `✓ 当前咽喉唯一方向：【${up.join(',')}↑】（其余 3 方向已可靠互锁断开）` : '○ 无方向继电器吸起（待机或 ZQJ↑ 正在取消）';
      }
    },
    {
      id: '7.5.1', ch: 7, page: 120, engine: 'circuit', sub: 'ladder',
      title: '图 7.5.1 · 方向条件电源原理（10 种方向条件电源实时生成矩阵）',
      summary: '由 4 只方向继电器与 `ZQJ` 组合产出全站 10 种方向条件电源：`ZQJ5后` 控正电源、`ZQJ6后` 控负电源、`KF-共用-Q` 由四方向第 1 组前接点**并联**供出、`KZ/KF-共用-H` 由四方向后接点串联供出！',
      rails: ['KZ / KF 母线', '10 种方向条件电源'],
      inputs: [
        { id: 'LJJ', label: 'LJJ↑ (列接)', def: true },
        { id: 'LFJ', label: 'LFJ↑ (列发)', def: false },
        { id: 'DJJ', label: 'DJJ↑ (调接)', def: false },
        { id: 'DFJ', label: 'DFJ↑ (调发)', def: false },
        { id: 'ZQJ', label: 'ZQJ↑ (取消态切断专用选路电源!)', def: false }
      ],
      rungs: [
        { id: 'p_ljj', label: 'KZ/KF-LJJ-Q：ZQJ后 · LJJ前（列车接车专用选岔电源）', coil: 'LJJ_Q', contacts: [{ label: 'ZQJ5/6后', kind: 'back', on: s => !s.ZQJ }, { label: 'LJJ前', kind: 'front', on: s => s.LJJ }] },
        { id: 'p_col', label: 'KZ/KF-列共-Q：ZQJ后 · (LJJ前 ∥ LFJ前)', coil: 'COL_Q', contacts: [{ label: 'ZQJ后', kind: 'back', on: s => !s.ZQJ }, { label: 'LJJ∥LFJ前', kind: 'front', on: s => s.LJJ || s.LFJ }] },
        { id: 'p_allq', label: 'KF-共用-Q：ZQJ4后 · (LJJ1前 ∥ LFJ1前 ∥ DJJ1前 ∥ DFJ1前 并联!)', coil: 'ALL_Q', contacts: [{ label: 'ZQJ4后', kind: 'back', on: s => !s.ZQJ }, { label: '四方向1前并联', kind: 'front', on: s => s.LJJ || s.LFJ || s.DJJ || s.DFJ }] },
        { id: 'p_allh', label: 'KZ/KF-共用-H：四方向后接点串联（仅在无方向选路时有电！）', coil: 'ALL_H', contacts: [{ label: 'LJJ/LFJ/DJJ/DFJ全后', kind: 'back', on: s => !s.LJJ && !s.LFJ && !s.DJJ && !s.DFJ }] }
      ],
      presets: [
        { label: '① 列接选路态 (LJJ↑ → LJJ-Q / 列共-Q / 共用-Q 有电)', set: { LJJ: true, LFJ: false, DJJ: false, DFJ: false, ZQJ: false } },
        { label: '② 调发选路态 (DFJ↑ → 共用-Q 有电，列共-Q 无电)', set: { LJJ: false, LFJ: false, DJJ: false, DFJ: true, ZQJ: false } },
        { label: '③ 无选路静态 (四方向全↓ → 共用-H 有电，用于重开/复原)', set: { LJJ: false, LFJ: false, DJJ: false, DFJ: false, ZQJ: false } }
      ],
      verdict: (s, rl) => `有电电源：[${['LJJ_Q','COL_Q','ALL_Q','ALL_H'].filter(k => rl[k]).join(' · ') || '全断(ZQJ取消)'}]`
    },
    {
      id: '7.6.1', ch: 7, page: 122, engine: 'circuit', sub: 'ladder',
      title: '图 7.6.1 · 单置调车信号机的 FKJ 电路（正常选路 vs 故障后人工重开）',
      summary: '正常选路：`KZ → JXJ5前 → FKJ(3-4) → JXJ4前 → KF-DJJ-Q`；重复开放信号：`QJ6后·KJ7前·JXJ5后 → FKJ(3-4) → JXJ4后·1AJ2前 → KF-共用-H`；自闭串 `FKJ3前·QJ7后·XJ7后`（XJ↑ 后 FKJ 复原）！',
      rails: ['KZ', 'KF-DJJ-Q / KF-共用-H'],
      inputs: [
        { id: 'jxj', label: '选路中 JXJ↑ (5前/4前闭合)', def: true },
        { id: 'reopen', label: '重复开放：KJ↑ + 重按始端 1AJ↑', def: false },
        { id: 'xj', label: '信号已开放 XJ↑（切断 FKJ 复原！）', def: false },
        { id: 'qj', label: '取消继电器 QJ↑', def: false }
      ],
      rungs: [
        { id: 'fkj', label: 'FKJ(3-4 正常选路 ∥ 重复开放) ∥ FKJ(1-2 经 FKJ3前·QJ7后·XJ7后自闭)', coil: 'FKJ', contacts: [
          { label: '正常(JXJ5/4前) ∥ 重开(KJ7前·1AJ2前)', kind: 'front', on: s => s.jxj || (s.reopen && !s.jxj && !s.qj) }
        ], altBranch: { label: '1-2 保持自闭', contacts: [{ label: 'FKJ 3前', kind: 'front', on: (s, rl) => rl.FKJ }, { label: 'QJ7后·XJ7后', kind: 'back', on: s => !s.qj && !s.xj }] } }
      ],
      presets: [
        { label: '① 正常选路 JXJ↑ 励磁 FKJ↑', set: { jxj: true, reopen: false, xj: false, qj: false } },
        { label: '② 开放信号 XJ↑ 后 FKJ 自动复原↓', set: { jxj: false, reopen: false, xj: true, qj: false } },
        { label: '③ 故障关灯后按 1AJ 人工重复开放 (KJ↑·1AJ↑ → FKJ↑!)', set: { jxj: false, reopen: true, xj: false, qj: false } }
      ],
      verdict: (s, rl) => rl.FKJ ? '✓ FKJ↑ 吸起（记录始端并允许 7/8/11 线动作或人工重复开放信号）' : '○ FKJ↓（信号已开复原，防止故障恢复后自动重开信号！）'
    },
    {
      id: '7.6.2', ch: 7, page: 124, engine: 'circuit', sub: 'ladder',
      title: '图 7.6.2 · 列车和调车共用的 FKJ 电路（LKJ 区分列/调电源与重开按钮）',
      summary: '进站/出站列调共用 FKJ：`LKJ 6组` 切换正常选路的列车/调车方向负电源；重复开放时由 `LKJ 1组转换接点` 严格辨别按压 `XLA`（列车）还是 `D1A`（调车）！',
      rails: ['KZ', 'KF-列/调 / KF-共用-H'],
      inputs: [
        { id: 'lkj', label: 'LKJ↑（列车进路标志；断开=调车进路）', def: true },
        { id: 'jxj', label: '选路 JXJ↑（励磁 FKJ 3-4）', def: true },
        { id: 'reXla', label: '重开按 XLA (需 LKJ↑ 匹配)', def: false },
        { id: 'reD1a', label: '重开按 D1A (需 LKJ↓ 匹配)', def: false },
        { id: 'xjOpen', label: 'LXJ↑ 或 DXJ↑（信号已开，切自闭）', def: false }
      ],
      rungs: [
        { id: 'fkj', label: '共用 FKJ：选路(JXJ·LKJ6组) ∥ 重开(LKJ1前·XLA / LKJ1后·D1A) ∥ 自闭(LXJ后·DXJ后)', coil: 'FKJ', contacts: [
          { label: '选路 ∥ 匹配重开', kind: 'front', on: s => s.jxj || (s.lkj && s.reXla) || (!s.lkj && s.reD1a) }
        ], altBranch: { label: '1-2 自闭', contacts: [{ label: 'LXJ后·DXJ后', kind: 'back', on: s => !s.xjOpen }, { label: 'FKJ 2前', kind: 'front', on: (s, rl) => rl.FKJ }] } }
      ],
      presets: [
        { label: '① 列车选路 LKJ↑·JXJ↑ → FKJ↑', set: { lkj: true, jxj: true, reXla: false, reD1a: false, xjOpen: false } },
        { label: '② 列车进路误按调车按钮 D1A（LKJ1前不匹配，拒绝重开!）', set: { lkj: true, jxj: false, reXla: false, reD1a: true, xjOpen: false } },
        { label: '③ 列车进路正确按 XLA 重开（FKJ↑）', set: { lkj: true, jxj: false, reXla: true, reD1a: false, xjOpen: false } }
      ],
      verdict: (s, rl) => rl.FKJ ? `✓ 共用 FKJ↑（当前性质：${s.lkj ? '列车' : '调车'}）` : '○ FKJ↓（已开放复原，或重开按钮与 LKJ 进路性质不匹配！）'
    },
    {
      id: '7.7.1', ch: 7, page: 125, engine: 'circuit', sub: 'ladder',
      title: '图 7.7.1 · ZJ 电路（调车终端记录继电器：DCJ/FCJ → SJ后 两阶段缓放交接）',
      summary: '调车进路终端由 `ZJ` 记录：`JXJ3前` 励磁 `ZJ(3-4)`；自闭由 **锁闭前 `11DCJ/11FCJ 8前`** 与 **锁闭后 `11SJ 3后`** 并联交接（靠 ZJ 缓放跨越切换），直到最后解锁 `11SJ↑` 复原！',
      rails: ['KZ', 'KF'],
      inputs: [
        { id: 'jxj', label: '终端选路 JXJ 3前（励磁 ZJ 3-4）', def: true },
        { id: 'opRelay', label: '锁闭前阶段：11DCJ/11FCJ 8前闭合', def: true },
        { id: 'sjLocked', label: '锁闭后阶段：11SJ↓（3组后接点闭合保持！）', def: false }
      ],
      rungs: [
        { id: 'zj', label: 'ZJ(3-4 经 JXJ3前) ∥ ZJ(1-2 经 ZJ8前 · [11DCJ/FCJ8前 ∥ 11SJ3后])', coil: 'ZJ', slowRelease: 0.4, contacts: [
          { label: 'JXJ 3前', kind: 'front', on: s => s.jxj }
        ], altBranch: { label: '双阶段缓放交接保持', contacts: [
          { label: 'ZJ 8前自闭', kind: 'front', on: (s, rl) => rl.ZJ },
          { label: '11DCJ/FCJ8前 ∥ 11SJ3后', kind: 'front', on: s => s.opRelay || s.sjLocked }
        ]}}
      ],
      presets: [
        { label: '① 选路 JXJ↑ 励磁 ZJ↑（道岔操作继电器保持）', set: { jxj: true, opRelay: true, sjLocked: false } },
        { label: '② 进路锁闭（11DCJ复原，由 11SJ 3后无缝接力保持 ZJ↑!）', set: { jxj: false, opRelay: false, sjLocked: true } },
        { label: '③ 进路解锁完毕 11SJ↑（ZJ 自动复原↓）', set: { jxj: false, opRelay: false, sjLocked: false } }
      ],
      verdict: (s, rl) => rl.ZJ ? '✓ ZJ↑ 保持记录调车终端（选路期靠 DCJ/FCJ，锁闭期靠 SJ↓）' : '○ ZJ↓ 进路解锁完毕，终端记录已复原。'
    },
    {
      id: '7.8.1', ch: 7, page: 126, engine: 'circuit', sub: 'ladder',
      title: '图 7.8.1 · 并联传递网路电路原理（逐级右传 KZ 且非串联分压！）',
      summary: '6502 选岔网路核心机制：各点 3-4 励磁线圈**并联跨接在 A/B 干线间**，由前一点第 2 组前接点向右传 KZ，下一点第 3 组后接点切断前点励磁，各点靠自身 1-2 自闭保持——绝不靠线圈串联分压！',
      rails: ['左端 KZ (A线)', '右端 KF (B线)'],
      inputs: [
        { id: 'start', label: '左端始端送入 KZ（触发第1级 JXJ1）', def: true },
        { id: 'endKf', label: '右端终端送入 KF（闭合 B 线回路）', def: true },
        { id: 'block2', label: '⚡ 模拟第 2 级条件阻断（检验传递中止）', def: false, fault: true }
      ],
      rungs: [
        { id: 'n1', label: '第 1 级 (JXJ1)：左端 KZ → JXJ1(3-4) ∥ JXJ1自闭(1-2)', coil: 'N1', contacts: [{ label: '左端KZ·右端KF', kind: 'front', on: s => s.start && s.endKf }] },
        { id: 'n2', label: '第 2 级 (DCJ)：由 N1 第2组前传 KZ → DCJ(3-4) ∥ 自闭(1-2)', coil: 'N2', contacts: [{ label: 'N1 2前传电', kind: 'front', on: (s, rl) => rl.N1 }, { label: '本级条件满足', kind: 'back', on: s => !s.block2 }] },
        { id: 'n3', label: '第 3 级 (终端JXJ)：由 N2 第2组前传 KZ → 终端JXJ(3-4) → 完成!', coil: 'N3', contacts: [{ label: 'N2 2前传电', kind: 'front', on: (s, rl) => rl.N2 }] }
      ],
      presets: [
        { label: '① 正常自左向右并联逐级传递 (N1→N2→N3 全吸)', set: { start: true, endKf: true, block2: false } },
        { label: '② 中途第 2 级阻断（传递止于 N1，终端不吸）', set: { start: true, endKf: true, block2: true } }
      ],
      verdict: (s, rl) => rl.N3 ? '✓ 并联逐级传递抵达终端！每级全额 24V 独立励磁并转 1-2 自闭，无串联分压压降！' : '⚠ 传递未贯通终端（检查始终端电源或中途阻断条件）。'
    },
    {
      id: '7.8.2', ch: 7, page: 128, engine: 'circuit', sub: 'ladder',
      title: '图 7.8.2 · 进站带调车信号机进路选择继电器电路（5/6 线含 D1 防串电）',
      summary: '严格按图 7.8.2：起端 `XLAJ3前 · D1AJ3后 · XGJJ3后` 送 `X-D1/JXJ(3-4)`；6 线串每区段 `QJJ6后·CJ6前·DGJ2前`、敌对道岔后接点及 **二极管 D₁ 防 KF 串电**，终端由 `SⅠGJJ3后·LAJ/DAJ3组` 送 KF！',
      rails: ['5 线 (起端 KZ)', '6 线 (终端 KF)'],
      inputs: [
        { id: 'btns', label: '按压 XLA + SⅠLA（起端送KZ，终端送KF）', def: true },
        { id: 'secFree', label: '6 线沿途区段空闲未锁 (QJJ6后·CJ6前·DGJ2前)', def: true },
        { id: 'noHostile', label: '无迎面敌对进路 (XGJJ3后·SⅠGJJ3后)', def: true },
        { id: 'd1Ok', label: '防串电二极管 D₁ 正常单向导通', def: true }
      ],
      rungs: [
        { id: 'xjxj', label: '起端 X-D1/JXJ：XLAJ3前 · D1AJ3后 · XGJJ3后 · 6线完好 → JXJ↑', coil: 'XJXJ', contacts: [
          { label: 'XLAJ3前·XGJJ3后', kind: 'front', on: s => s.btns && s.noHostile },
          { label: '6线(QJJ后·CJ前·DGJ前)', kind: 'front', on: s => s.secFree },
          { label: '二极管 D₁', kind: 'diode', on: s => s.d1Ok }
        ]},
        { id: 's1jxj', label: '终端 SⅠJXJ：经沿途 DCJ 传递 + SⅠGJJ3后·SⅠLAJ3前 → SⅠJXJ↑', coil: 'S1JXJ', contacts: [
          { label: 'XJXJ 2前右传', kind: 'front', on: (s, rl) => rl.XJXJ },
          { label: 'SⅠGJJ3后·终端KF', kind: 'front', on: s => s.btns && s.noHostile }
        ]}
      ],
      presets: [
        { label: '① 5/6 线全链选路通过', set: { btns: true, secFree: true, noHostile: true, d1Ok: true } },
        { label: '② 区段占用/已锁闭（6线切断，严禁选路!）', set: { btns: true, secFree: false, noHostile: true, d1Ok: true } },
        { label: '③ 对端已建迎面进路 SⅠGJJ↑（切断 6 线 KF!）', set: { btns: true, secFree: true, noHostile: false, d1Ok: true } }
      ],
      verdict: (s, rl) => rl.S1JXJ ? '✓ 5/6 线贯通：X-D1/JXJ↑ → 沿途 DCJ↑ → SⅠJXJ↑！' : '🛡 选路被 6 线条件（区段占用/已锁闭或迎面敌对 GJJ↑）可靠阻断！'
    },
    {
      id: '7.8.3', ch: 7, page: 130, engine: 'circuit', sub: 'ladder',
      title: '图 7.8.3 · 单置调车信号机 JXJ 电路（DXF 终端侧 vs DX 始端侧双 JXJ）',
      summary: '单置调车设两套 JXJ：**DXF 侧**由 `2AJ 3前` 接 KF 作进路终端，**DX 侧**由 `AJ 3前` 接 KZ 作进路始端（且右传串 `XJJ 6后` 防重复选路），各自 1-2 线圈向 `KF-共用-Q` 自闭保持！',
      rails: ['KZ (DX 始端)', 'KF (DXF 终端)'],
      inputs: [
        { id: 'asStart', label: '本单置信号机作【始端】：AJ 3前闭合', def: true },
        { id: 'asEnd', label: '本单置信号机作【终端】：2AJ 3前闭合', def: false },
        { id: 'xjjDown', label: 'XJJ 6后闭合（未曾建立敌对/重复选路）', def: true }
      ],
      rungs: [
        { id: 'dx', label: 'DX 始端侧 JXJ：AJ 3前送 KZ · XJJ 6后 → DX-JXJ↑', coil: 'DX_JXJ', contacts: [{ label: 'AJ 3前(始端)', kind: 'front', on: s => s.asStart }, { label: 'XJJ 6后', kind: 'back', on: s => s.xjjDown }] },
        { id: 'dxf', label: 'DXF 终端侧 JXJ：2AJ 3前送 KF → DXF-JXJ↑', coil: 'DXF_JXJ', contacts: [{ label: '2AJ 3前(终端)', kind: 'front', on: s => s.asEnd }] }
      ],
      presets: [
        { label: '① 作始端：DX-JXJ↑ 向右传电', set: { asStart: true, asEnd: false, xjjDown: true } },
        { label: '② 作终端：DXF-JXJ↑ 接入终端 KF', set: { asStart: false, asEnd: true, xjjDown: true } },
        { label: '③ 作变通：两侧双 JXJ 同时贯通', set: { asStart: true, asEnd: true, xjjDown: true } }
      ],
      verdict: (s, rl) => `单置双 JXJ：DX(始端)=${rl.DX_JXJ ? '↑' : '↓'} ｜ DXF(终端)=${rl.DXF_JXJ ? '↑' : '↓'}`
    },
    {
      id: '7.8.4', ch: 7, page: 130, engine: 'circuit', sub: 'ladder',
      title: '图 7.8.4 · 差置调车信号机 JXJ 电路（D3/D7 跨 A/B 线 + 中间 1/7G Q组合）',
      summary: '差置 D3/D7 间夹有轨道区段 `1/7G`，故 B 线必串联 `1/7G` 的 `QJJ6后·CJ6前·GJ2前`（并置调车无中间区段故省此 Q 检查）；D3 下方 AJ 送 KF，D7 上方 AJ 送 KZ！',
      rails: ['A 线 (KZ)', 'B 线 (KF)'],
      inputs: [
        { id: 'd7Start', label: 'D7 始端送 KZ / D3 终端送 KF', def: true },
        { id: 'sec17g', label: '中间区段 1/7G 空闲未锁 (QJJ后·CJ前·GJ前)', def: true }
      ],
      rungs: [
        { id: 'chazhi', label: 'D7/D3 差置跨 A/B 传递：AJ前 · 1/7G(QJJ后·CJ前·GJ前) → JXJ↑', coil: 'CHAZHI_JXJ', contacts: [
          { label: 'D7/D3 AJ前', kind: 'front', on: s => s.d7Start },
          { label: '1/7G Q组合检查', kind: 'front', on: s => s.sec17g }
        ]}
      ],
      presets: [
        { label: '① 1/7G 空闲：差置顺利选通', set: { d7Start: true, sec17g: true } },
        { label: '② 1/7G 有车占用（B 线阻断选路!）', set: { d7Start: true, sec17g: false } }
      ],
      verdict: (s, rl) => rl.CHAZHI_JXJ ? '✓ 差置中间 1/7G 检查通过，JXJ↑ 选路继续传递！' : '🛡 中间区段 1/7G 占用或锁闭，差置选路安全阻断！'
    },
    {
      id: '7.9.1', ch: 7, page: 132, engine: 'circuit', sub: 'ladder',
      title: '图 7.9.1 · 1、2 线选岔网路（撇形双动渡线反位 1FCJ→2FCJ + D1/D2 防串电）',
      summary: '为什么把双动渡线反位拆到 1–4 线？防止并联迂回电路！1、2 线专选“八”字第一笔**撇形双动反位**（如 5/7 反）：左端送 KZ 经 `1DCJ4后` 先励磁 `1FCJ`，再经 `1FCJ2前` 传 `2FCJ`，`D1/D2` 阻锐角回路 KF 串电！',
      rails: ['1 线 (左端 KZ)', '2 线 (右端 KF)'],
      inputs: [
        { id: 'reqRev', label: '进路需经撇形 5/7 双动反位（如 X_F→3G）', def: true },
        { id: 'sjUp', label: '1SJ↑ · 2SJ↑ 道岔未锁闭（允许自闭保持）', def: true },
        { id: 'dcjFree', label: '1DCJ4后 · 2DCJ4后 闭合（未选定位互锁）', def: true }
      ],
      rungs: [
        { id: 'fcj1', label: '1FCJ(3-4)：1线 KZ → 1DCJ4后 → 1FCJ(3-4) ∥ KZ-ZQJ-H·1FCJ1前·1SJ4前自闭', coil: 'FCJ1', contacts: [
          { label: '1线撇形反位条件', kind: 'front', on: s => s.reqRev },
          { label: '1DCJ 4后', kind: 'back', on: s => s.dcjFree },
          { label: 'D1/D2 防串电', kind: 'diode', on: () => true }
        ]},
        { id: 'fcj2', label: '2FCJ(3-4)：1FCJ 2前右传 → 2DCJ4后 → 2FCJ(3-4) ∥ 2SJ4前自闭', coil: 'FCJ2', contacts: [
          { label: '1FCJ 2前右传', kind: 'front', on: (s, rl) => rl.FCJ1 },
          { label: '2DCJ4后 · 2SJ4前', kind: 'front', on: s => s.dcjFree && s.sjUp }
        ]}
      ],
      presets: [
        { label: '① 撇形双动反位：1FCJ↑ → 2FCJ↑ 顺序吸起！', set: { reqRev: true, sjUp: true, dcjFree: true } },
        { label: '② 已锁闭 2SJ↓（禁止反转操作！）', set: { reqRev: true, sjUp: false, dcjFree: true } }
      ],
      verdict: (s, rl) => (rl.FCJ1 && rl.FCJ2) ? '✓ 1、2 线完成撇形双动反位选岔（1FCJ↑ → 2FCJ↑），D1/D2 隔离防串电！' : '○ 1、2 线未动作或被互斥/锁闭条件阻止。'
    },
    {
      id: '7.9.2', ch: 7, page: 134, engine: 'circuit', sub: 'ladder',
      title: '图 7.9.2 · 3、4 线选岔网路（捺形双动渡线反位 1/3 反 + D3/D4 防串电）',
      summary: '3、4 线专选“八”字第二笔**捺形双动反位**（如 `X→4G` 经 1/3 反位）：原理与 1、2 线对偶，`1FCJ→2FCJ` 顺序励磁并独立由 `KZ-ZQJ-H` 自闭，`D3/D4` 阻串电！',
      rails: ['3 线 (KZ)', '4 线 (KF)'],
      inputs: [
        { id: 'reqRev', label: '进路需经捺形 1/3 双动反位（如 X→4G）', def: true },
        { id: 'sjUp', label: '1SJ↑ · 2SJ↑ 未锁闭', def: true },
        { id: 'd34Ok', label: '防串电二极管 D3/D4 完好', def: true }
      ],
      rungs: [
        { id: 'fcj1', label: '3、4线 1FCJ：捺形反位条件 · D3/D4 → 1/3-1FCJ↑', coil: 'FCJ1', contacts: [{ label: '捺形反位请求', kind: 'front', on: s => s.reqRev }, { label: 'D3/D4 防串电', kind: 'diode', on: s => s.d34Ok }] },
        { id: 'fcj2', label: '3、4线 2FCJ：1FCJ2前 · 2SJ4前 → 1/3-2FCJ↑', coil: 'FCJ2', contacts: [{ label: '1FCJ 2前', kind: 'front', on: (s, rl) => rl.FCJ1 }, { label: '2SJ 4前', kind: 'front', on: s => s.sjUp }] }
      ],
      presets: [
        { label: '① 选捺形 1/3 双动反位 (1FCJ↑→2FCJ↑)', set: { reqRev: true, sjUp: true, d34Ok: true } },
        { label: '② 进路不经捺形渡线（3、4 线不动作）', set: { reqRev: false, sjUp: true, d34Ok: true } }
      ],
      verdict: (s, rl) => (rl.FCJ1 && rl.FCJ2) ? '✓ 3、4 线已选出捺形双动 1/3 反位，转由 5、6 线继续选其余定位道岔！' : '○ 3、4 线未动作。'
    },
    {
      id: '7.9.3', ch: 7, page: 134, engine: 'circuit', sub: 'ladder',
      title: '图 7.9.3 · 5、6 线选岔电路（教材原例 D7 → ⅠG 自左向右选排仿真）',
      summary: '严格复现教材图 7.9.3 实例（D7→ⅠG）：`D7JXJ → 5/7-2DCJ → 11DCJ → SⅠJXJ`！6 线串接 `7-11DG(QJJ后·CJ前·DGJ前)`、各 `FCJ后` 与终端 `SⅠGJJ后` 及防串电 `D1`，锁闭 `SJ↓` 后操作继电器自动复原！',
      jump3d: { label: '🚉 在 03 沙盘直接试跑 R24 (D7 → ⅠG)', go: { mode: 'station', stationRoute: 'R24' } },
      rails: ['5 线 (D7 端 KZ)', '6 线 (SⅠ 端 KF)'],
      inputs: [
        { id: 'd7s1', label: '按压 D7A + SⅠDA（启动 5/6 线）', def: true },
        { id: 'qFree', label: '7-11DG 空闲未锁 (QJJ后·CJ前·DGJ前)', def: true },
        { id: 'noGjj', label: '无迎面敌对 (SⅠGJJ 后闭合)', def: true },
        { id: 'sjUp', label: '2SJ↑ · 11SJ↑ 未锁闭（保持 DCJ 自闭）', def: true }
      ],
      rungs: [
        { id: 'd7', label: '① D7JXJ 吸起并右传 5 线 KZ', coil: 'D7JXJ', contacts: [{ label: 'D7A·SⅠDA', kind: 'front', on: s => s.d7s1 }, { label: '6线区段与GJJ后', kind: 'front', on: s => s.qFree && s.noGjj }] },
        { id: 'dcj57', label: '② 5/7-2DCJ 励磁并由 2SJ前 自闭', coil: 'DCJ57', contacts: [{ label: 'D7JXJ 2前', kind: 'front', on: (s, rl) => rl.D7JXJ }, { label: '2SJ前', kind: 'front', on: s => s.sjUp }] },
        { id: 'dcj11', label: '③ 11DCJ 励磁并由 11SJ前 自闭（D1 防串电）', coil: 'DCJ11', contacts: [{ label: '5/7-2DCJ 2前', kind: 'front', on: (s, rl) => rl.DCJ57 }, { label: 'D1·11SJ前', kind: 'diode', on: s => s.sjUp }] },
        { id: 's1', label: '④ 终端 SⅠJXJ 吸起 → 选路结束复原记录！', coil: 'S1JXJ', contacts: [{ label: '11DCJ 2前', kind: 'front', on: (s, rl) => rl.DCJ11 }] }
      ],
      presets: [
        { label: '① D7→ⅠG 5/6 线全线顺序吸起！', set: { d7s1: true, qFree: true, noGjj: true, sjUp: true } },
        { label: '② 7-11DG 有车占用（6线切断，全线不选!）', set: { d7s1: true, qFree: false, noGjj: true, sjUp: true } },
        { label: '③ 进入锁闭 SJ↓（DCJ 自动复原释放!）', set: { d7s1: false, qFree: true, noGjj: true, sjUp: false } }
      ],
      verdict: (s, rl) => rl.S1JXJ ? '✓ 5/6 线选岔完美贯通：D7JXJ↑ → 5/7-2DCJ↑ → 11DCJ↑ → SⅠJXJ↑！' : '○ 5/6 线未贯通或已完成锁闭释放操作继电器。'
    },
    {
      id: '7.10.1', ch: 7, page: 137, engine: 'circuit', sub: 'ladder',
      title: '图 7.10.1 · 开始继电器 KJ 工作电路（7 线选排一致检验与锁闭自闭）',
      summary: '7 线自终端送 KZ，沿途逐组检查 `DCJ·DBJ`（或 `FCJ·FBJ`）一致、`SJ↑` 未锁闭、沿途敌对 `FKJ7后/ZJ7后`，抵达始端 `FKJ前·JXJ7后 → KJ(3-4)`；锁闭后 `SJ↓` 切 7 线改接 11 线，KJ 转由 `QJJ4前 ∥ 1LJ4后 ∥ 2LJ4后` 保持！',
      rails: ['终端 KZ (7线)', '始端 KF'],
      inputs: [
        { id: 'swMatch', label: '沿途道岔选排与表示一致 (DCJ·DBJ / FCJ·FBJ)', def: true },
        { id: 'noEnemy', label: '沿途敌对信号未建 (D3/D7 FKJ7后·ZJ7后)', def: true },
        { id: 'sjUp', label: '选排阶段 SJ↑（前接点接 7 线；落下后改接 11 线!）', def: true },
        { id: 'locked', label: '进路已锁闭 (QJJ4前 ∥ 1LJ4后 ∥ 2LJ4后)', def: false }
      ],
      rungs: [
        { id: 'kj', label: '7线励磁(道岔一致·SJ↑·敌对后·FKJ前·JXJ7后→KJ3-4) ∥ 自闭(KJ8前·QJJ/1LJ/2LJ)', coil: 'KJ', contacts: [
          { label: 'DCJ·DBJ 一致', kind: 'front', on: s => s.swMatch },
          { label: 'SJ↑(7线) · 敌对后', kind: 'front', on: s => s.sjUp && s.noEnemy }
        ], altBranch: { label: 'KJ 1-2 锁闭保持', contacts: [
          { label: 'KJ 8前', kind: 'front', on: (s, rl) => rl.KJ },
          { label: 'QJJ↑∥1LJ↓∥2LJ↓', kind: 'front', on: s => s.locked }
        ]}}
      ],
      presets: [
        { label: '① 道岔到位选排一致 → 7 线吸起 KJ↑', set: { swMatch: true, noEnemy: true, sjUp: true, locked: false } },
        { label: '② 锁闭阶段 SJ↓（切 7 线接 11 线，靠 QJJ/LJ 保持 KJ↑）', set: { swMatch: true, noEnemy: true, sjUp: false, locked: true } },
        { label: '③ ⚠ 11# 道岔失表示 DBJ↓（阻断 7 线，KJ 保持↓！）', set: { swMatch: false, noEnemy: true, sjUp: true, locked: false } }
      ],
      verdict: (s, rl) => rl.KJ ? '✓ KJ↑：7 线选排一致检验通过（或已转入锁闭保持）！' : '🛡 KJ↓：选排不一致、存在敌对进路或已全线解锁。'
    },
    {
      id: '7.10.2', ch: 7, page: 141, engine: 'circuit', sub: 'ladder',
      title: '图 7.10.2 · LKJ 电路（列车开始继电器：FKJ 桥接过渡至 KJ 保持）',
      summary: '列调共用始端处设 `LKJ` 区分列车与调车进路：`JXJ5前 + KF-LJJ-Q` 励磁 `LKJ(3-4)`；自闭正端 `LKJ2前`，负端 **`FKJ6前` 与 `KJ7前` 并联**——FKJ 桥接 KJ 尚未吸起的过渡窗口，KJ 落下后 LKJ 复原！',
      rails: ['KZ', 'KF-LJJ-Q / KF'],
      inputs: [
        { id: 'jxjTrain', label: '列车选路中：JXJ5前 + KF-LJJ-Q', def: true },
        { id: 'fkj', label: 'FKJ 6前（桥接 KJ 未吸起的过渡阶段!）', def: true },
        { id: 'kj', label: 'KJ 7前（进路锁闭全程保持 LKJ↑）', def: false }
      ],
      rungs: [
        { id: 'lkj', label: 'LKJ(3-4 经 JXJ5前·KF-LJJ-Q) ∥ LKJ(1-2 经 LKJ2前·[FKJ6前 ∥ KJ7前])', coil: 'LKJ', contacts: [
          { label: 'JXJ5前 · KF-LJJ-Q', kind: 'front', on: s => s.jxjTrain }
        ], altBranch: { label: 'FKJ→KJ 无缝桥接自闭', contacts: [
          { label: 'LKJ 2前', kind: 'front', on: (s, rl) => rl.LKJ },
          { label: 'FKJ6前 ∥ KJ7前', kind: 'front', on: s => s.fkj || s.kj }
        ]}}
      ],
      presets: [
        { label: '① 选路启动 LKJ↑（靠 FKJ 桥接等待 KJ↑）', set: { jxjTrain: true, fkj: true, kj: false } },
        { label: '② KJ↑ 接管保持（信号开放后 FKJ 复原，LKJ 仍保持↑!）', set: { jxjTrain: false, fkj: false, kj: true } },
        { label: '③ 解锁完毕 KJ↓（LKJ 同步复原↓）', set: { jxjTrain: false, fkj: false, kj: false } }
      ],
      verdict: (s, rl) => rl.LKJ ? '✓ LKJ↑：标定本进路为【列车进路】（用于区分 3min 延时与 X2/X3JG 接近检查）！' : '○ LKJ↓：当前非列车进路或已解锁复原。'
    },

    // ==================== 第 8 章（17 幅：8.2.1 — 8.8.6，8.3.1 已在 yard） ====================
    {
      id: '8.2.1', ch: 8, page: 146, engine: 'circuit', sub: 'sequence',
      title: '图 8.2.1 · 调车接车的进路建立时序逻辑（D7 → ⅠG 8–11 线全流程）',
      summary: '调车接车 `D7 → ⅠG` 建立阶段严格按 `D7KJ↑ → 8线 D7XJJ↑ → 9线 7-11QJJ↑/SⅠGJJ↑ → 10线自闭且 1LJ/2LJ↓ → 7-11SJ↓ 锁闭 → 11线 D7DXJ↑ 开放月白灯 B` 推进！',
      signals: ['D7KJ', '8线 D7XJJ', '9线 QJJ/GJJ', '1LJ/2LJ(落锁)', '7-11SJ(落锁)', '11线 D7DXJ'],
      steps: [
        { title: '① 7 线选排一致完成：D7KJ↑', active: ['D7KJ', '1LJ/2LJ(落锁)', '7-11SJ(落锁)'], desc: '5/7 与 11 道岔密贴一致，始端 D7KJ 吸起启动 8 线（1LJ/2LJ 与 SJ 尚处常态↑）。' },
        { title: '② 8 线联锁检查通过：D7XJJ↑', active: ['D7KJ', '8线 D7XJJ', '1LJ/2LJ(落锁)', '7-11SJ(落锁)'], desc: '8 线检查 7-11DG 空闲、道岔表示、敌对未建及照查 ZCJ↑。' },
        { title: '③ 9 线励磁区段与股道：7-11QJJ↑ · SⅠGJJ↑', active: ['D7KJ', '8线 D7XJJ', '9线 QJJ/GJJ', '1LJ/2LJ(落锁)', '7-11SJ(落锁)'], desc: 'D7XJJ 送 9 线电源并励 7-11QJJ 与终端 GJJ，转 10 线自闭！' },
        { title: '④ QJJ↑ 切 1LJ/2LJ↓ → 7-11SJ↓ 建立进路锁闭！', active: ['D7KJ', '8线 D7XJJ', '9线 QJJ/GJJ'], desc: '1LJ/2LJ 由常态↑落下切断 SJ↓，点亮 7-11DG 白色锁闭光带，切 7 线转 11 线。' },
        { title: '⑤ 11 线复核安全条件 → D7DXJ↑ 开放白灯 B', active: ['D7KJ', '8线 D7XJJ', '9线 QJJ/GJJ', '11线 D7DXJ'], desc: '11 线复查道岔、区段、照查与灯丝 DJ↑，D7 开放月白灯 B！' }
      ]
    },
    {
      id: '8.2.2', ch: 8, page: 147, engine: 'circuit', sub: 'sequence',
      title: '图 8.2.2 · X 至 ⅠG 下行列车接车进路建立时序逻辑（三区段并锁）',
      summary: '列车接车 `X → ⅠG`：8 线除查 1DG、1/7G、7-11DG 外还须查 **IAG 与股道 ⅠG 空闲**；9 线并行锁闭 1DG、1/7G、7-11DG 三个 Q 组合（IAG 无 Q 组合故不参锁）并励磁 `SⅠGJJ`，最终 11 线 `XLXJ↑` 开放单黄 U！',
      signals: ['XKJ/XLKJ', '8线 XXJJ', '9线 3×QJJ+GJJ', '3×SJ(落锁)', 'SⅠZCJ(防迎面)', '11线 XLXJ(U)'],
      steps: [
        { title: '① 7 线选排一致：XKJ↑ · XLKJ↑', active: ['XKJ/XLKJ', '3×SJ(落锁)', 'SⅠZCJ(防迎面)'], desc: '1/3、5/7、11 全定位表示一致（3×SJ 与 SⅠZCJ 尚处常态↑）。' },
        { title: '② 8 线全联锁检查（含 IAG & ⅠG）：XXJJ↑', active: ['XKJ/XLKJ', '8线 XXJJ', '3×SJ(落锁)', 'SⅠZCJ(防迎面)'], desc: '证明 IAG、1DG、1/7G、7-11DG、ⅠG 全部空闲且无敌对。' },
        { title: '③ 9 线并行励磁三段 QJJ 与 SⅠGJJ', active: ['XKJ/XLKJ', '8线 XXJJ', '9线 3×QJJ+GJJ', '3×SJ(落锁)', 'SⅠZCJ(防迎面)'], desc: '1DG/1/7G/7-11DG 的 QJJ 并联吸起并由 10 线自闭，SⅠGJJ↑ 切断本端 ZCJ 自闭。' },
        { title: '④ 三段 1LJ/2LJ↓ → 三段 SJ↓ 锁闭 + ZCJ↓ 照查生效', active: ['XKJ/XLKJ', '8线 XXJJ', '9线 3×QJJ+GJJ'], desc: '咽喉三段白光带点亮锁闭（3×SJ↓），SⅠZCJ↓ 阻断上行咽喉向 ⅠG 迎面接车！' },
        { title: '⑤ 11 线开放进站信号：XLXJ↑（点亮单黄 U）', active: ['XKJ/XLKJ', '8线 XXJJ', '9线 3×QJJ+GJJ', '11线 XLXJ(U)'], desc: '11 线检 DJ↑、道岔、CJ↓ 与照查，XLXJ 吸起经图 5.1.2 亮单黄 U！' }
      ]
    },
    {
      id: '8.3.2', ch: 8, page: 149, engine: 'circuit', sub: 'ladder',
      title: '图 8.3.2 · ZCJ 电路（迎面照查继电器：GJJ 第 7 组后接点切自闭 + 11SJ 切励磁）',
      summary: '严格按图 8.3.2 核查：`ZCJ(1-2)` 自闭经自身 7 前和 **`GJJ 7后`**，`ZCJ(3-4)` 励磁经 `11SJ 6前`！办理进路时 GJJ↑ 先切自闭，随后 11SJ↓ 再切励磁使 **ZCJ↓**，有效防止列车入路后 GJJ 先落而提前解除照查！',
      errata: '教材 PDF p.149 正文曾误写为“GJJ的前接点”，与图 8.3.2 及 PDF p.150“GJJ后接点”矛盾，本电路严格按原图使用 GJJ 第 7 组后接点！',
      rails: ['KZ', 'KF'],
      inputs: [
        { id: 'gjj', label: '本端 GJJ↑（正在建立接车/调车进路，断开 GJJ 7后!）', def: false },
        { id: 'sjUp', label: '本咽喉相邻 11SJ↑（未锁闭/已解锁）', def: true }
      ],
      rungs: [
        { id: 'zcj', label: 'ZCJ(3-4 经 11SJ 6前励磁) ∥ ZCJ(1-2 经 ZCJ7前 · GJJ 7后自闭)', coil: 'ZCJ', contacts: [
          { label: '11SJ 6前(未锁)', kind: 'front', on: s => s.sjUp }
        ], altBranch: { label: '1-2 保持自闭', contacts: [
          { label: 'ZCJ 7前', kind: 'front', on: (s, rl) => rl.ZCJ },
          { label: 'GJJ 7后(未建)', kind: 'back', on: s => !s.gjj }
        ]}}
      ],
      presets: [
        { label: '① 常态空闲允许迎面照查（GJJ↓ · 11SJ↑ → ZCJ↑）', set: { gjj: false, sjUp: true } },
        { label: '② 进路建立并锁闭（GJJ↑切自闭 + 11SJ↓切励磁 → ZCJ↓ 严防迎面!）', set: { gjj: true, sjUp: false } },
        { label: '③ 列车压入后 GJJ 先落下（但 11SJ 仍↓，ZCJ 仍保持↓不提前解除!）', set: { gjj: false, sjUp: false } },
        { label: '④ 列车全出清 11SJ↑（ZCJ 恢复常态↑）', set: { gjj: false, sjUp: true } }
      ],
      verdict: (s, rl) => rl.ZCJ ? '✓ ZCJ↑（本端无迎面锁闭，允许对方咽喉向本股道办进路）' : '🔒 ZCJ↓（正在锁闭防迎面！即使 GJJ 先落下，只要 11SJ 未解锁就绝不恢复！）'
    },
    {
      id: '8.3.3', ch: 8, page: 150, engine: 'circuit', sub: 'ladder',
      title: '图 8.3.3 · 两咽喉 ZCJ 电路（S3/11SJ 与 X3/10SJ 对称互送照查）',
      summary: '左右两咽喉 ZCJ 完全同构：下行端 `S3-ZCJ` 受 11SJ 与 S3GJJ 控制并送往**上行端 8/9/11 线**；上行端 `X3-ZCJ` 受 10SJ 与 X3GJJ 控制并送往**下行端 8/9/11 线**！',
      rails: ['下行咽喉 (S3)', '上行咽喉 (X3)'],
      inputs: [
        { id: 's3Lock', label: '下行端已锁闭接 3G（11SJ↓ · S3GJJ↑）', def: true },
        { id: 'x3Lock', label: '上行端已锁闭接 3G（10SJ↓ · X3GJJ↑）', def: false }
      ],
      rungs: [
        { id: 's3z', label: '下行 S3-ZCJ（送往【上行】8/9/11线作照查许可）', coil: 'S3_ZCJ', contacts: [{ label: '下行 11SJ↑未锁', kind: 'front', on: s => !s.s3Lock }] },
        { id: 'x3z', label: '上行 X3-ZCJ（送往【下行】8/9/11线作照查许可）', coil: 'X3_ZCJ', contacts: [{ label: '上行 10SJ↑未锁', kind: 'front', on: s => !s.x3Lock }] }
      ],
      presets: [
        { label: '① 下行锁闭接 3G → 切断上行迎面许可', set: { s3Lock: true, x3Lock: false } },
        { label: '② 上行锁闭接 3G → 切断下行迎面许可', set: { s3Lock: false, x3Lock: true } },
        { label: '③ 双端均空闲（双端 ZCJ↑）', set: { s3Lock: false, x3Lock: false } }
      ],
      verdict: (s, rl) => `上行能否接3G(看下行S3-ZCJ)=${rl.S3_ZCJ ? '✓允许' : '✕禁止'} ｜ 下行能否接3G(看上行X3-ZCJ)=${rl.X3_ZCJ ? '✓允许' : '✕禁止'}`
    },
    {
      id: '8.4.1', ch: 8, page: 152, engine: 'circuit', sub: 'ladder',
      title: '图 8.4.1 · SJ 电路（锁闭继电器：KZ-YZSJ-H → 1LJ3前·2LJ3前·DGJF3前·FDGJ3后）',
      summary: '锁闭继电器 SJ 是进路锁闭总开关：常态吸起↑（允许转岔）；`1LJ/2LJ` 任一落下、区段占用 `DGJF↓`、缓放 `FDGJ↑` 或按下**引导总锁闭 `YZSJ↓`**（统切正电源），SJ 立即可靠落下锁闭道岔！',
      rails: ['KZ-YZSJ-H (引导总锁闭)', 'KF'],
      inputs: [
        { id: 'yzsj', label: '引导总锁闭 YZSJ↑（正常未总锁；断开=全咽喉总锁闭!）', def: true },
        { id: 'lj1', label: '1LJ 3前闭合（未被锁闭/已解锁）', def: true },
        { id: 'lj2', label: '2LJ 3前闭合（未被锁闭/已解锁）', def: true },
        { id: 'dgjf', label: 'DGJF 3前闭合（轨道区段空闲）', def: true },
        { id: 'fdgj', label: 'FDGJ 吸起中（出清 3s 缓放未落，断开 3后!）', def: false }
      ],
      rungs: [
        { id: 'sj', label: 'KZ-YZSJ-H → SJ(1-4) → 1LJ3前 → 2LJ3前 → DGJF3前 → FDGJ3后 → KF', coil: 'SJ', contacts: [
          { label: 'YZSJ 正电源', kind: 'front', on: s => s.yzsj },
          { label: '1LJ3前·2LJ3前', kind: 'front', on: s => s.lj1 && s.lj2 },
          { label: 'DGJF 3前', kind: 'front', on: s => s.dgjf },
          { label: 'FDGJ 3后', kind: 'back', on: s => !s.fdgj }
        ]}
      ],
      presets: [
        { label: '① 空闲未锁闭常态（SJ↑ 允许操岔）', set: { yzsj: true, lj1: true, lj2: true, dgjf: true, fdgj: false } },
        { label: '② 进路锁闭（1LJ↓·2LJ↓ → SJ↓ 锁闭道岔！）', set: { yzsj: true, lj1: false, lj2: false, dgjf: true, fdgj: false } },
        { label: '③ 刚出清 FDGJ 缓放 3s（DGJF↑但 FDGJ↑，SJ 仍保持↓！）', set: { yzsj: true, lj1: true, lj2: true, dgjf: true, fdgj: true } },
        { label: '④ 引导总锁闭 YZSJ↓（统切全咽喉所有 SJ↓！）', set: { yzsj: false, lj1: true, lj2: true, dgjf: true, fdgj: false } }
      ],
      verdict: (s, rl) => rl.SJ ? '✓ SJ↑ 解锁态（允许 1DQJ 启动操岔，7 线连通）' : '🔒 SJ↓ 锁闭态（切断 1DQJ 3-4 启动，防列车压岔转换！）'
    },
    {
      id: '8.5.1', ch: 8, page: 153, engine: 'circuit', sub: 'ladder',
      title: '图 8.5.1 · 调车 JYJ 电路（接近区段继电器：区分预先锁闭 vs 接近锁闭）',
      summary: '调车 JYJ 检查接近区段 `3DGJF 4前`：信号未开时靠 `XJ3后·JYJ4前` 保持↑（**预先锁闭**，可直接 ZQA 立即取消）；一旦信号开放 `XJ↑` 且车列压入接近区段 `3DGJF↓`，**JYJ↓ 转接近锁闭**，必须 ZRA 延时 30s 解锁！',
      rails: ['KZ', 'KF'],
      inputs: [
        { id: 'kj', label: '已建进路 KJ↑（断开 KJ 8后）', def: true },
        { id: 'xj', label: '调车信号已开放 XJ↑（断开 XJ 3后！）', def: true },
        { id: 'appFree', label: '接近区段空闲 3DGJF 4前闭合', def: true }
      ],
      rungs: [
        { id: 'jyj', label: 'JYJ(1-2 经 KJ8后 ∥ XJ3后·JYJ4前) ∥ JYJ(3-4 经 3DGJF4前)', coil: 'JYJ', contacts: [
          { label: '接近区段 3DGJF4前', kind: 'front', on: s => s.appFree }
        ], altBranch: { label: '无进路或未开信号保↑', contacts: [
          { label: 'KJ8后 ∥ (XJ3后·JYJ4前)', kind: 'back', on: (s, rl) => !s.kj || (!s.xj && rl.JYJ) }
        ]}}
      ],
      presets: [
        { label: '① 预先锁闭（XJ↑ 但接近空闲 → JYJ↑，可 ZQA 立即取消）', set: { kj: true, xj: true, appFree: true } },
        { label: '② 接近锁闭（XJ↑ 且车压接近区段 → JYJ↓，须 ZRA 延时 30s!）', set: { kj: true, xj: true, appFree: false } },
        { label: '③ 仅建未开信号（XJ↓ 即使接近有车仍保 JYJ↑）', set: { kj: true, xj: false, appFree: false } }
      ],
      verdict: (s, rl) => rl.JYJ ? '✓ JYJ↑（预先锁闭：允许 ZQA 立即取消进路）' : '🔒 JYJ↓（接近锁闭已成立！禁止 ZQA 立即取消，须 ZRA 延时解锁！）'
    },
    {
      id: '8.5.2', ch: 8, page: 154, engine: 'circuit', sub: 'ladder',
      title: '图 8.5.2 · 进站与调车共用的 JYJ 电路（LKJF 4组切换列车 2/3JG vs 调车 IAG）',
      summary: '同一咽喉口共用 JYJ 时，用 **`LKJF 第 4 组转换接点`**精准切换接近区段：列车进路(`LKJF↑`) 串查外方两闭塞分区 **`X2JGJ · X3JGJ`**；调车进路(`LKJF↓`) 改查内方 **`IAGJF`**！',
      rails: ['KZ', 'KF'],
      inputs: [
        { id: 'lkjf', label: 'LKJF↑（列车进路；断开=调车进路）', def: true },
        { id: 'x23Free', label: '列车接近区段空闲 (X2JGJ4前 · X3JGJ4前)', def: true },
        { id: 'iagFree', label: '调车接近区段空闲 (IAGJF 4前)', def: true },
        { id: 'sigOpen', label: '信号已开放 (LXJ↑ 或 D1XJ↑)', def: true }
      ],
      rungs: [
        { id: 'jyj', label: 'JYJ(3-4)：LKJF4前·(X2JGJ·X3JGJ) ∥ LKJF4后·IAGJF', coil: 'JYJ', contacts: [
          { label: '列(X2·X3JG) / 调(IAG)', kind: 'front', on: s => s.lkjf ? s.x23Free : s.iagFree }
        ], altBranch: { label: '未开信号保持', contacts: [{ label: 'LXJ1后·D1XJ2后', kind: 'back', on: s => !s.sigOpen }] } }
      ],
      presets: [
        { label: '① 列车进路 + X3JG 来车 → JYJ↓（列车接近锁闭 3min!）', set: { lkjf: true, x23Free: false, iagFree: true, sigOpen: true } },
        { label: '② 调车进路 + IAG 有车 → JYJ↓（调车接近锁闭 30s!）', set: { lkjf: false, x23Free: true, iagFree: false, sigOpen: true } }
      ],
      verdict: (s, rl) => `当前查【${s.lkjf ? '列车 X2JG+X3JG' : '调车 IAG'}】：JYJ=${rl.JYJ ? '↑预先锁闭' : '↓接近锁闭'}`
    },
    {
      id: '8.5.3', ch: 8, page: 155, engine: 'circuit', sub: 'ladder',
      title: '图 8.5.3 · 出站与调车共用的 JYJ 电路（通过列车经 GJJ·SJGJ 延长接近区）',
      summary: '股道出站 JYJ 不仅查本股道 `ⅡGJF`，还按作业性质分三支路：**通过列车**走 `XⅡGJJ6前·SJGJ5前` 自动延长接近区至进站外方，普通始发/调车走 `XⅡZCJ/XⅡZJ` 支路！',
      rails: ['KZ', 'KF'],
      inputs: [
        { id: 'g2Free', label: '本股道 ⅡG 空闲 (ⅡGJF 4前)', def: false },
        { id: 'through', label: '办理正线通过进路 (XⅡGJJ↑ 延长至进站接近 SJGJ!)', def: true },
        { id: 'sjgFree', label: '进站外方接近区段 SJGJ 空闲', def: true },
        { id: 'sigOpen', label: '出站信号已开放', def: true }
      ],
      rungs: [
        { id: 'jyj', label: '出站 JYJ：普通始发(ⅡGJF) / 通过延长(ⅡGJF·XⅡGJJ·SJGJ)', coil: 'JYJ', contacts: [
          { label: '本股道及延长接近空闲', kind: 'front', on: s => s.through ? (s.g2Free && s.sjgFree) : s.g2Free }
        ], altBranch: { label: '未开放保持', contacts: [{ label: 'LXJ/DXJ后', kind: 'back', on: s => !s.sigOpen }] } }
      ],
      presets: [
        { label: '① 列车停于 ⅡG 始发开信号 → 立即转接近锁闭 JYJ↓', set: { g2Free: false, through: false, sjgFree: true, sigOpen: true } },
        { label: '② 正线通过 + 进站外方来车 SJGJ↓ → 出站同步转接近锁闭 JYJ↓!', set: { g2Free: true, through: true, sjgFree: false, sigOpen: true } }
      ],
      verdict: (s, rl) => rl.JYJ ? '✓ 出站 JYJ↑（预先锁闭）' : '🔒 出站 JYJ↓（接近锁闭，防止始发/通过列车冒进时立即取消进路！）'
    },
    {
      id: '8.6.1', ch: 8, page: 158, engine: 'circuit', sub: 'ladder',
      title: '图 8.6.1 · 8 线网路和信号检查继电器电路（上下双干线全条件联锁检查）',
      summary: '8 线是 6502 联锁安全总闸门：沿上下双干线逐段串联检查 **IAGJF、1DGJ、道岔表示、敌对 KJ/ZJ后、1/7GJ、7-11DGJ、对方照查 XⅠZCJ 与接车股道 ⅠGJF**，全部闭合方使 `XJJ↑`！',
      rails: ['始端 XJJ (8线)', '终端 KF (股道/照查)'],
      inputs: [
        { id: 'secs', label: '沿途全部轨道区段空闲 (IAG/1DG/1-7G/7-11DG/ⅠG)', def: true },
        { id: 'swPos', label: '道岔表示符合站场位置 (DBJ前·FBJ后)', def: true },
        { id: 'noEnemy', label: '沿途敌对未建 (D3/D7/SⅠ KJ后·ZJ后)', def: true },
        { id: 'zcj', label: '对方咽喉照查允许 (XⅠZCJ↑)', def: true }
      ],
      rungs: [
        { id: 'line8', label: '8线总检：XJJ → IAGJF·1DGJ·1/3DBJ·D3KJ后·1/7GJ·7-11DGJ·11DBJ·XⅠZCJ·ⅠGJF → KF', coil: 'XJJ', contacts: [
          { label: '全区段 DGJ/GJ前', kind: 'front', on: s => s.secs },
          { label: '道岔表示', kind: 'front', on: s => s.swPos },
          { label: '敌对 KJ/ZJ后', kind: 'back', on: s => s.noEnemy },
          { label: '对端 XⅠZCJ↑', kind: 'front', on: s => s.zcj }
        ]}
      ],
      presets: [
        { label: '① 8 线全条件满足 → XJJ↑ 准许锁闭与开放信号', set: { secs: true, swPos: true, noEnemy: true, zcj: true } },
        { label: '② 股道 ⅠG 占车（ⅠGJF↓ 断开 8 线，严禁开放正常信号!）', set: { secs: false, swPos: true, noEnemy: true, zcj: true } },
        { label: '③ 上行已建迎面进路（XⅠZCJ↓ 断开 8 线!）', set: { secs: true, swPos: true, noEnemy: true, zcj: false } }
      ],
      verdict: (s, rl) => rl.XJJ ? '✓ 8 线联锁检查全通过 → XJJ↑！' : '🛡 8 线检查不满足，XJJ↓ 阻止进路锁闭与信号开放！'
    },
    {
      id: '8.6.2', ch: 8, page: 160, engine: 'circuit', sub: 'ladder',
      title: '图 8.6.2 · XJJ 局部电路（a–g 七大工作支路精确切换仿真）',
      summary: '教材经典难点！XJJ 局部电路含 **7 条功能支路**：`a` 选路检查、`b` 调车开放保持、`c` 列车开放保持、`d` 取消检查、`e` 延时起点、`f` 延时过程自闭、`g` **调车防瞬间分路不良保护(LKJ2后，列车切掉)**！',
      rails: ['KZ / KZ-ZRJ-H', '8 线 / KF'],
      inputs: [
        { id: 'mode', label: '切换 XJJ 局部支路 (a–g)', type: 'select', def: 'a', options: [
          ['a', '支路 a：进路建立检查 (LAJ后·DAJ后·FKJ前·QJ后→8线)'],
          ['b', '支路 b：调车开放保持 (DXJ前·XJJ前→8线)'],
          ['c', '支路 c：列车开放保持 (LXJ前→8线)'],
          ['d', '支路 d：总取消检查 (JYJ前·QJ前→8线)'],
          ['e', '支路 e：总人解延时起点 (KZ-ZRJ-H·JYJ后·QJ前→8线)'],
          ['f', '支路 f：延时期间自闭 (LXJ/DXJ后·QJ6前·JYJ2后→XJJ1-2)'],
          ['g', '支路 g：调车防分路不良保护 (LKJ2后·XJJ3后·JYJ3前·QJ5后→脱离8线!)']
        ]},
        { id: 'line8ok', label: '8 线外部区段空闲（支路 g 故意脱离 8 线!）', def: true }
      ],
      rungs: [
        { id: 'xjj34', label: 'XJJ 3-4 (经 8 线检查支路 a / b / c / d / e)', coil: 'XJJ_34', contacts: [
          { label: '支路 a–e 选通', kind: 'front', on: s => ['a','b','c','d','e'].includes(s.mode) },
          { label: '8 线全空闲', kind: 'front', on: s => s.line8ok }
        ]},
        { id: 'xjj12', label: 'XJJ 1-2 (脱离 8 线自闭：支路 f 延时中 / 支路 g 调车保护)', coil: 'XJJ_12', contacts: [
          { label: '支路 f/g (脱离8线!)', kind: 'front', on: s => ['f','g'].includes(s.mode) }
        ]}
      ],
      presets: [
        { label: '① 支路 c 列车保持（压入8线立即 XJJ↓ 关信号!）', set: { mode: 'c', line8ok: false } },
        { label: '② 支路 g 调车保护（接近无车时瞬间分路 8线断，XJJ 1-2 仍保持↑防误解!）', set: { mode: 'g', line8ok: false } },
        { label: '③ 支路 f 人工延时中（脱离 8 线自闭等待 3min/30s）', set: { mode: 'f', line8ok: false } }
      ],
      verdict: (s, rl) => `XJJ=${(rl.XJJ_34 || rl.XJJ_12) ? '↑吸起' : '↓落下'}（当前支路 ${s.mode}：${s.mode === 'g' ? 'LKJ↓ 调车专用，脱离 8 线防瞬间分路不良导致错误解锁！' : s.mode === 'f' ? '延时期间依靠 1-2 自闭保持至超时解锁' : '经 8 线实时监督区段空闲！'}）`
    },
    {
      id: '8.7.1', ch: 8, page: 166, engine: 'circuit', sub: 'ladder',
      title: '图 8.7.1 · QJJ 和 GJJ 电路（9 线并励 + 10 线 FDGJ 后自闭与占用切落）',
      summary: '9 线由始端 `XJJ2前·QJ2后` 送 KZ 并行励磁沿途各 `QJJ(3-4)`（串 `DGJF6前`）与终端 `GJJ`；随后转由 10 线经 `QJJ7前 · FDGJ2后` 自闭；列车占用使 `DGJ↓ → FDGJ↑` 立即切断本段 QJJ！',
      errata: '教材 PDF p.169 末段文字误写“占用时 DGJ吸起、FDGJ落下”，与图 8.7.1 及后文完全相反，本仿真严格按原图执行“占用时 DGJ↓、FDGJ↑ 切 QJJ”。',
      rails: ['9 线 (XJJ2前 送KZ)', '10 线 (自闭 KF)'],
      inputs: [
        { id: 'xjj', label: '8 线通过 XJJ 2前闭合（9 线励磁送电）', def: true },
        { id: 'dgjf', label: '本区段空闲 DGJF↑（未占用）', def: true },
        { id: 'fdgj', label: '本区段已进入：FDGJ↑ 吸起（切 10 线自闭!）', def: false },
        { id: 'line10', label: '10 线道岔表示贯通 + LXJ/JYJ 供负电', def: true }
      ],
      rungs: [
        { id: 'qjj', label: 'QJJ：9线励磁(XJJ2前·DGJF6前→3-4) ∥ 10线自闭(QJJ7前·FDGJ2后→1-2)', coil: 'QJJ', contacts: [
          { label: '9线 XJJ2前', kind: 'front', on: s => s.xjj },
          { label: 'DGJF 6前(空闲)', kind: 'front', on: s => s.dgjf }
        ], altBranch: { label: '10线自闭保持', contacts: [
          { label: 'QJJ 7前', kind: 'front', on: (s, rl) => rl.QJJ },
          { label: 'FDGJ 2后 · 10线KF', kind: 'back', on: s => !s.fdgj && s.line10 }
        ]}},
        { id: 'gjj', label: '终端 GJJ：9线 ZJ2组 · 对方ZCJ2前 → GJJ(1-2)', coil: 'GJJ', contacts: [{ label: '9线·对端ZCJ↑', kind: 'front', on: s => s.xjj && s.dgjf }] }
      ],
      presets: [
        { label: '① 9 线励磁 QJJ↑ · GJJ↑（开始锁闭并转 10 线自闭）', set: { xjj: true, dgjf: true, fdgj: false, line10: true } },
        { label: '② 列车压入占用（DGJF↓ · FDGJ↑ → 立即切断 QJJ↓ 准备三点解锁！）', set: { xjj: false, dgjf: false, fdgj: true, line10: true } }
      ],
      verdict: (s, rl) => `QJJ=${rl.QJJ ? '↑(锁闭建立/保持，严禁区故解)' : '↓(已进入或未建立，允许三点/区故解)'} ｜ GJJ=${rl.GJJ ? '↑' : '↓'}`
    },
    {
      id: '8.8.1', ch: 8, page: 172, engine: 'circuit', sub: 'ladder',
      title: '图 8.8.1 · XJ 电路（11 线：SJ 后转换 + CJ 后 + 引导 DGJF 后旁路 + LXJ RC缓放）',
      summary: '11 线与 7 线共用道岔 DBJ/FBJ，靠 **SJ 两组转换接点**在锁闭(`SJ↓`)后转入 11 线！串联各区段 `CJ4后`（引导时并联 `DGJF1后` 旁路故障段）、敌对 `KJ/ZJ4后`、`DJ1前` 与 `XJJ4前`，LXJ 线圈并 RC 缓放！',
      rails: ['KZ (LKJF·DJ·FKJ)', '11 线 (GJJ·道岔·CJ后)'],
      inputs: [
        { id: 'sjLocked', label: '道岔已锁闭 SJ↓（后接点切入 11 线！）', def: true },
        { id: 'djUp', label: '红灯灯丝监督 DJ 1前闭合', def: true },
        { id: 'fkjOrSelf', label: '始端 FKJ 3前闭合（或 LXJ 已自闭）', def: true },
        { id: 'xjjUp', label: '8 线 XJJ 4前闭合（持续检查区段空闲）', def: true },
        { id: 'cjDown', label: '沿途 CJ 4后闭合（未进入解锁）', def: true }
      ],
      rungs: [
        { id: 'lxj', label: 'KZ → LKJF2前·DJ1前·(FKJ3前∥LXJ4前) → LXJ(1-4并RC) → XJJ4前·KJ4前 → 11线(SJ后·CJ4后)', coil: 'LXJ', slowRelease: 0.3, contacts: [
          { label: 'DJ 1前', kind: 'front', on: s => s.djUp },
          { label: 'FKJ3前 ∥ LXJ4前', kind: 'front', on: (s, rl) => s.fkjOrSelf || rl.LXJ },
          { label: 'XJJ 4前', kind: 'front', on: s => s.xjjUp },
          { label: '11线(SJ后·CJ4后)', kind: 'front', on: s => s.sjLocked && s.cjDown }
        ]}
      ],
      presets: [
        { label: '① 全条件满足 → LXJ↑ 开放列车允许信号', set: { sjLocked: true, djUp: true, fkjOrSelf: true, xjjUp: true, cjDown: true } },
        { label: '② 灯丝双断 DJ↓ → LXJ↓ 立即关信号（防恢复自重开!）', set: { sjLocked: true, djUp: false, fkjOrSelf: false, xjjUp: true, cjDown: true } },
        { label: '③ 首轮压入区段 XJJ↓ → LXJ↓ 立即自动关闭信号！', set: { sjLocked: true, djUp: true, fkjOrSelf: false, xjjUp: false, cjDown: true } }
      ],
      verdict: (s, rl) => rl.LXJ ? '✓ 11 线贯通 → LXJ↑ 开放列车允许灯光！' : '● LXJ↓ 关闭红灯（灯丝断、首轮压入或未锁闭，且因 FKJ 已落严防自动重开！）'
    },
    {
      id: '8.8.2', ch: 8, page: 175, engine: 'circuit', sub: 'ladder',
      title: '图 8.8.2 · 调车 XJ 自闭电路（白灯保留电路：JYJ 后 · 7-11DGJF 后 · DXJ 前）',
      summary: '调车与列车信号关闭时机根本不同！D7 调车入路后 8 线断开，但 `XJJ 4组后接点` 自动切到 **`JYJ4后 · 7-11DGJF6后 · DXJ7前`** 构成白灯保留自闭，直到**整列越过 D7（接近区段出清 JYJ↑）**才关闭白灯！',
      rails: ['KZ (QJ后·DJ前)', '8 线 / 白灯保留 KF'],
      inputs: [
        { id: 'fkj', label: '始端 FKJ 6前（首次开放激励）', def: true },
        { id: 'xjjUp', label: '进路空闲 XJJ 4前闭合（正常 8 线通路）', def: true },
        { id: 'appOcc', label: '调车压在接近区段未越尽 (JYJ 4后闭合!)', def: false },
        { id: 'firstOcc', label: '首段 7-11DG 已压入占用 (7-11DGJF 6后闭合!)', def: false }
      ],
      rungs: [
        { id: 'dxj', label: 'DXJ(3-4)：[FKJ6前∥DXJ4前·DJ1前] → [XJJ4前(8线) ∥ XJJ4后·JYJ4后·7-11DGJF6后·DXJ7前(白灯保留!)]', coil: 'DXJ', contacts: [
          { label: 'FKJ6前 ∥ DXJ4前', kind: 'front', on: (s, rl) => s.fkj || rl.DXJ },
          { label: '8线(XJJ前) ∥ 白灯保留(JYJ后·DGJF后)', kind: 'front', on: (s, rl) => s.xjjUp || (!s.xjjUp && s.appOcc && s.firstOcc && rl.DXJ) }
        ]}
      ],
      presets: [
        { label: '① 首次开放调车月白灯 B（XJJ↑ → DXJ↑）', set: { fkj: true, xjjUp: true, appOcc: true, firstOcc: false } },
        { label: '② 机车头刚压入 7-11DG，车尾仍在接近（白灯保留继续亮 B!）', set: { fkj: false, xjjUp: false, appOcc: true, firstOcc: true } },
        { label: '③ 整列完全越过 D7 出清接近（JYJ↑ 切白灯保留 → 转蓝灯 A!）', set: { fkj: false, xjjUp: false, appOcc: false, firstOcc: true } }
      ],
      verdict: (s, rl) => rl.DXJ ? (s.xjjUp ? '○ DXJ↑ 开放月白灯 B（8 线正常保持）' : '○ DXJ↑ 仍在【白灯保留自闭】（车列尚未完全越过 D7！）') : '● DXJ↓ 调车信号转蓝灯 A（整列已越过或未开放）！'
    },
    {
      id: '8.8.3', ch: 8, page: 177, engine: 'circuit', sub: 'ladder',
      title: '图 8.8.3 · ZXJ 电路图（正线信号继电器：1/3DBJF · 11DBJF 串联）',
      summary: '正线信号继电器 `ZXJ` 串联检查正线沿途全部对向道岔定位表示复示继电器（`1/3DBJF 1前 · 11DBJF 1前`）：全定位才使 ZXJ↑ 开通正线（单黄 U / 绿 L），任一道岔反位则 ZXJ↓ 转侧线双黄 UU！',
      rails: ['KZ', 'KF'],
      inputs: [
        { id: 'db13', label: '1/3 双动道岔定位 (1/3DBJF 1前)', def: true },
        { id: 'db11', label: '11 号道岔定位 (11DBJF 1前)', def: true }
      ],
      rungs: [
        { id: 'zxj', label: 'KZ → 1/3DBJF 1前 → 11DBJF 1前 → ZXJ(1-4) → KF', coil: 'ZXJ', contacts: [
          { label: '1/3DBJF 1前', kind: 'front', on: s => s.db13 },
          { label: '11DBJF 1前', kind: 'front', on: s => s.db11 }
        ]}
      ],
      presets: [
        { label: '① 正线道岔全定位 → ZXJ↑（允许正线 U / L）', set: { db13: true, db11: true } },
        { label: '② 11# 转反位进 3G → ZXJ↓（转侧线双黄 UU）', set: { db13: true, db11: false } }
      ],
      verdict: (s, rl) => rl.ZXJ ? '✓ ZXJ↑（开通正线直向）' : '○ ZXJ↓（开通侧线弯股 → 接车必显示双黄 UU！）'
    },
    {
      id: '8.8.4', ch: 8, page: 178, engine: 'circuit', sub: 'ladder',
      title: '图 8.8.4 · TXJ 与 LUXJ 电路（通过绿 L vs 绿黄 LU 条件区分）',
      summary: 'TXJ 与 LUXJ 并联共用 `2/4DBJF5前 · XⅠLXJ3前 · XZXJ5前 · XLXJ2前`（证明出站与进站均开通正线）；其中仅 `TXJ` 支路另串 **`2LQJF 4前`**——前方≥2闭塞空闲亮绿灯 L，仅 1 闭塞空闲则 `TXJ↓·LUXJ↑` 亮绿黄 LU！',
      rails: ['KZ', 'KF'],
      inputs: [
        { id: 'mainThru', label: '进站与出站均已开放正线 (XⅠLXJ·XZXJ·XLXJ·2/4DBJF)', def: true },
        { id: 'lqj2', label: '出站前方 ≥2 闭塞空闲 (2LQJF 4前闭合)', def: true }
      ],
      rungs: [
        { id: 'txj', label: 'TXJ (正线绿 L)：共用正线通过条件 · 2LQJF 4前 → TXJ', coil: 'TXJ', contacts: [{ label: '正线接发全开放', kind: 'front', on: s => s.mainThru }, { label: '2LQJF 4前', kind: 'front', on: s => s.lqj2 }] },
        { id: 'luxj', label: 'LUXJ (绿黄 LU)：共用正线通过条件（不串 2LQJF）→ LUXJ', coil: 'LUXJ', contacts: [{ label: '正线接发全开放', kind: 'front', on: s => s.mainThru }] }
      ],
      presets: [
        { label: '① 出站亮绿/绿黄 (2LQJF↑) → TXJ↑ 进站亮绿灯 L', set: { mainThru: true, lqj2: true } },
        { label: '② 出站亮单黄 (2LQJF↓) → TXJ↓ · LUXJ↑ 进站亮绿黄 LU!', set: { mainThru: true, lqj2: false } }
      ],
      verdict: (s, rl) => !s.mainThru ? '○ 未建正线通过进路（TXJ↓ · LUXJ↓）' : rl.TXJ ? '🟢 TXJ↑ → 进站开放【L 绿灯】（正线快速通过）' : '🟢🟡 TXJ↓ · LUXJ↑ → 进站开放【LU 绿黄灯】（预告出站单黄！）'
    },
    {
      id: '8.8.5', ch: 8, page: 178, engine: 'circuit', sub: 'wave', waveType: 'snjFlasher',
      title: '图 8.8.5 · CTXJ 与 SNJ 电路（18# 大号道岔侧线黄闪黄 USU 物理振荡器）',
      summary: '经 18# 及以上大号道岔侧线通过时（`11FBJF↑ · 10FBJF↑ · XⅠLXJF↑ · XLXJF↑`），**CTXJ↑** 吸起驱动 **SNJ 闪光继电器**：利用自身第 5 组后接点与 `C1/R1/R2` 构成 RC 缓吸缓放自激振荡，使第一黄 U1 稳定闪烁（USU）！',
      controls: [
        { id: 'ctxj', type: 'checkbox', label: '大号侧线通过条件满足（CTXJ↑ 启动 SNJ 闪光振荡！）', def: true },
        { id: 'rcScale', type: 'range', label: 'RC 闪光周期倍率（演示 C1/R1/R2 对闪频的影响）', min: 50, max: 200, step: 25, def: 100 }
      ]
    },
    {
      id: '8.8.6', ch: 8, page: 179, engine: 'circuit', sub: 'ladder',
      title: '图 8.8.6 · 引导信号继电器 YXJ 相关电路（引导进路锁闭 vs 引导总锁闭）',
      summary: '严格按图 8.8.6：正常引导进路经 `IAGJF2前 · YXJ1前 · 1DJF1前 · YZSJ5后 · D1KJ1前` 进 11 线；按下 **YZSA 引导总锁闭**时 `YZSJ↓` 统锁全咽喉道岔并旁路开放引导；按压 `YA` 经 `C/R` 延时 `YAJ` 维持 15s！',
      jump3d: { label: '🚉 在 03 沙盘实操 HB 引导接车与 YZA 总锁闭', go: { mode: 'station', stationRoute: 'R1', guideMode: true } },
      rails: ['KZ', '11 线 / KF-ZRJ-Q'],
      inputs: [
        { id: 'ya', label: '按压引导按钮 YA（励磁 YAJ 并经 C/R 维持 15s）', def: true },
        { id: 'dj1', label: '红灯主/副丝完好 1DJF 1前闭合（红灯灭灯严禁引导!）', def: true },
        { id: 'yzsa', label: '采用【引导总锁闭】(YZSA → YZSJ↓ 旁路故障道岔/区段)', def: false },
        { id: 'iagOk', label: '内方首区段 IAG 空闲 (IAGJF 2前；故障时须持续按 YA 15s!)', def: true }
      ],
      rungs: [
        { id: 'yaj', label: 'YAJ：YA 按钮 · LXJF3后 · ZCJ3前 → YAJ(并 C/R 15s延时)', coil: 'YAJ', slowRelease: 1.5, contacts: [{ label: '按压 YA', kind: 'btn', on: s => s.ya }] },
        { id: 'yxj', label: 'YXJ：1DJF1前 · [引导进路(IAGJF2前·YZSJ5前) ∥ 引导总锁闭(YZSJ5后)] → YXJ↑', coil: 'YXJ', contacts: [
          { label: '1DJF1前(红灯完好!)', kind: 'front', on: s => s.dj1 },
          { label: 'YAJ↑ 引导触发', kind: 'front', on: (s, rl) => rl.YAJ },
          { label: 'IAG空闲 ∥ YZSJ总锁闭', kind: 'front', on: s => s.iagOk || s.yzsa }
        ]}
      ],
      presets: [
        { label: '① 正常引导进路锁闭（亮红+月白 HB）', set: { ya: true, dj1: true, yzsa: false, iagOk: true } },
        { label: '② 引导总锁闭（YZSJ↓ 统锁全咽喉并开放 HB）', set: { ya: true, dj1: true, yzsa: true, iagOk: false } },
        { label: '③ ⚠ 红灯双断丝 1DJF↓（严禁开放引导信号!）', set: { ya: true, dj1: false, yzsa: true, iagOk: true } }
      ],
      verdict: (s, rl) => !s.dj1 ? '🛡 红灯灯丝双断 (1DJF↓)，电路可靠切断 YXJ，严防单独亮月白灯引发误认！' : rl.YXJ ? '🔴⚪ YXJ↑ → 开放引导信号【HB 红+月白】（列车限速 ≤20 km/h 进站，过车后仍保持锁闭须 ZRA 人工解锁！）' : '○ YXJ↓ 未开放引导。'
    },

    // ==================== 第 9 章（16 幅：9.3.1 — 9.6.1，9.4.1/9.4.3 已在 yard） ====================
    {
      id: '9.3.1', ch: 9, page: 183, engine: 'circuit', sub: 'wave', waveType: 'rcDecay',
      title: '图 9.3.1 · FDGJ 电路（重复开放/防分路不良缓放：C1=1000μF · R1=51Ω 缓放 3–4s）',
      summary: 'KZ-GDJ 经 `QJJ5前 ∥ FDGJ7前` 供 `FDGJ(1-4)` 串 `DGJ4后` 到 KF；线圈并接 **`C1=1000μF + R1=51Ω`**！列车占用 `DGJ↓` 时 FDGJ↑；**出清 `DGJ↑` 后靠电容放电缓放 3–4 s**，确保短暂分路不良不会提前错误解锁！',
      controls: [
        { id: 'aj', type: 'checkbox', label: '列车占用区段 DGJ↓（断开取消勾选即观察出清后 3–4s 缓放曲线！）', def: true },
        { id: 'R', type: 'range', label: '原图串联电阻 R1 (Ω · 标准 51Ω)', min: 20, max: 120, step: 1, def: 51 },
        { id: 'C', type: 'range', label: '原图储能电容 C1 (μF · 标准 1000μF)', min: 400, max: 2000, step: 100, def: 1000 }
      ]
    },
    {
      id: '9.3.2', ch: 9, page: 185, engine: 'circuit', sub: 'ladder',
      title: '图 9.3.2 · LJ 电路（1LJ / 2LJ 左右对称记录占用与出清的三点检查核心）',
      summary: '严格按图 9.3.2：`1LJ`/`2LJ` 公共正端经 `QJJ5后` 接 `KZ-GDJ`，左右对称接入 12 线与 13 线，实现 **“前段已清解 + 本段曾占 → 1LJ↑”** 与 **“本段已出清 + 后段已占 → 2LJ↑”**，双 LJ 全吸即解锁 `SJ↑`！',
      rails: ['KZ-GDJ (经 QJJ5后)', '12 线 / 13 线 KF'],
      inputs: [
        { id: 'qjjDown', label: 'QJJ 5后闭合（列车已入本段，QJJ 已落）', def: true },
        { id: 'prevDone', label: '① 前段已出清并解锁（12 线送来 KF）', def: true },
        { id: 'thisOcc', label: '② 本段正在占用中 (DGJ↓ · FDGJ↑)', def: true },
        { id: 'nextOcc', label: '③ 下一区段已占用（13 线送来 KF）', def: false }
      ],
      rungs: [
        { id: 'lj1', label: '1LJ：QJJ5后 · 前段已清解(12线) · 本段曾占用 → 1LJ↑ 并自闭', coil: 'LJ1', contacts: [
          { label: 'QJJ5后 · 12线前段已解', kind: 'front', on: s => s.qjjDown && s.prevDone },
          { label: '本段占用记录', kind: 'front', on: (s, rl) => s.thisOcc || rl.LJ1 }
        ]},
        { id: 'lj2', label: '2LJ：QJJ5后 · 1LJ↑ · 本段已出清 · 后段已占(13线) → 2LJ↑', coil: 'LJ2', contacts: [
          { label: '1LJ已吸 · 本段出清', kind: 'front', on: (s, rl) => rl.LJ1 && !s.thisOcc },
          { label: '13线后段已占', kind: 'front', on: s => s.nextOcc }
        ]}
      ],
      presets: [
        { label: '① 车刚压入本段（1LJ↑ 记录曾占用，2LJ↓ 仍锁闭）', set: { qjjDown: true, prevDone: true, thisOcc: true, nextOcc: false } },
        { label: '② 车出清本段并压入下段（1LJ↑ · 2LJ↑ → 三点成立解锁 SJ↑！）', set: { qjjDown: true, prevDone: true, thisOcc: false, nextOcc: true } },
        { label: '③ ⚠ 瞬间分路不良（出清但下段未占 → 2LJ↓ 拒绝误解锁！）', set: { qjjDown: true, prevDone: true, thisOcc: false, nextOcc: false } }
      ],
      verdict: (s, rl) => (rl.LJ1 && rl.LJ2) ? '✓ 三点检查成立 (1LJ↑ · 2LJ↑) → 解锁本区段 SJ↑！' : `1LJ=${rl.LJ1 ? '↑(已记占用)' : '↓'} · 2LJ=${rl.LJ2 ? '↑' : '↓(等待出清+后占)'} → 保持锁闭！`
    },
    {
      id: '9.3.3', ch: 9, page: 187, engine: 'circuit', sub: 'ladder',
      title: '图 9.3.3 · CJ 电路（传递继电器：快吸慢放特性与正常/取消/区故解三用途）',
      summary: 'CJ 兼具两大核心特性：① `CJ(3-4)` 正端由 `1LJ4前 ∥ 2LJ4前` 供电、负端串 `FDGJ1后`（正常过车因 FDGJ 缓放而滞后吸起，取消无车因 FDGJ↓ 立即吸起）；② `CJ(1-2)` 串 `DGJF5前·SGA` 专供图 9.6.1 区段故障解锁！',
      rails: ['KZ-GDJ', 'KF / KF-ZRJ-Q'],
      inputs: [
        { id: 'ljAny', label: '1LJ 4前 或 2LJ 4前 闭合（准备向下段传递）', def: true },
        { id: 'fdgj', label: 'FDGJ↑（正常通过缓放中，断开 FDGJ 1后！）', def: true },
        { id: 'sga', label: '区故解：同时按下 SGA + ZRA（且区段空闲 DGJF↑）', def: false },
        { id: 'dgjf', label: '区段空闲 DGJF 5前闭合', def: true }
      ],
      rungs: [
        { id: 'cj34', label: 'CJ(3-4 正常/取消传递)：(1LJ4前 ∥ 2LJ4前) · (FDGJ1后 ∥ CJ2前自闭)', coil: 'CJ34', slowRelease: 0.5, contacts: [
          { label: '1LJ4前 ∥ 2LJ4前', kind: 'front', on: s => s.ljAny },
          { label: 'FDGJ1后 ∥ CJ2前', kind: 'back', on: (s, rl) => !s.fdgj || rl.CJ34 }
        ]},
        { id: 'cj12', label: 'CJ(1-2 区段故障解锁)：DGJF5前 · SGA · KF-ZRJ-Q', coil: 'CJ12', contacts: [
          { label: 'DGJF 5前(无车!)', kind: 'front', on: s => s.dgjf },
          { label: 'SGA + ZRA', kind: 'btn', on: s => s.sga }
        ]}
      ],
      presets: [
        { label: '① 正常过车滞后：FDGJ 缓放期间 CJ 暂不吸', set: { ljAny: true, fdgj: true, sga: false, dgjf: true } },
        { label: '② 取消/缓放结束：FDGJ↓ → CJ(3-4) 立即吸起传递解锁！', set: { ljAny: true, fdgj: false, sga: false, dgjf: true } },
        { label: '③ 区段故障解锁：DGJF↑ + 按 SGA+ZRA → CJ(1-2) 强励解锁！', set: { ljAny: false, fdgj: false, sga: true, dgjf: true } }
      ],
      verdict: (s, rl) => (rl.CJ34 || rl.CJ12) ? `✓ CJ↑ 吸起（路径：${rl.CJ12 ? '1-2 区故解强励' : '3-4 传递解锁'}，兼具快吸慢放特性）！` : '○ CJ↓（等待 FDGJ 缓放结束或取消触发）。'
    },
    {
      id: '9.4.2', ch: 9, page: 193, engine: 'circuit', sub: 'sequence',
      title: '图 9.4.2 · 列车接车进路解锁的时序逻辑关系表达式（三段逐段解锁波形）',
      summary: '下行列车接车 `X → ⅠG` 逐段解锁全时序：依次完成 `1DG(1LJ→2LJ→SJ↑)` → `1/7G(1LJ→2LJ→SJ↑)` → `7-11DG(1LJ→2LJ→SJ↑)` → 全部出清 `SⅠZCJ↑ · XKJ↓` 复原！',
      signals: ['X-LXJ', '1DG(1LJ/2LJ/SJ)', '1/7G(1LJ/2LJ/SJ)', '7-11DG(1LJ/2LJ/SJ)', 'SⅠZCJ', 'XKJ'],
      steps: [
        { title: '① 进路已开放，列车接近 X3JG', active: ['X-LXJ', 'XKJ'], desc: '三区段 SJ↓ 锁闭，ZCJ↓ 防迎面，X 亮黄灯 U。' },
        { title: '② 首轮压入 IAG → X-LXJ↓ 关红灯', active: ['XKJ'], desc: '列车压入内方首段 IAG，X 信号自动关闭。' },
        { title: '③ 压入 1DG → 出清压入 1/7G → 1DG 三点解锁 SJ↑', active: ['1DG(1LJ/2LJ/SJ)', 'XKJ'], desc: '1DG 满足前清+本占清(FDGJ 3s)+后占 → 1LJ↑·2LJ↑ → 1DG SJ↑ 率先解锁！' },
        { title: '④ 出清 1/7G 压入 7-11DG → 1/7G 三点解锁 SJ↑', active: ['1DG(1LJ/2LJ/SJ)', '1/7G(1LJ/2LJ/SJ)', 'XKJ'], desc: '1/7G 满足三点检查解锁，白光带依次熄灭。' },
        { title: '⑤ 出清 7-11DG 全列进 ⅠG → 7-11DG 解锁 + ZCJ↑ + XKJ↓', active: ['1DG(1LJ/2LJ/SJ)', '1/7G(1LJ/2LJ/SJ)', '7-11DG(1LJ/2LJ/SJ)', 'SⅠZCJ'], desc: '末段解锁后 ZCJ 恢复常态↑，始端 XKJ↓ 复原，整条进路完全解锁！' }
      ]
    },
    {
      id: '9.4.4', ch: 9, page: 194, engine: 'circuit', sub: 'sequence',
      title: '图 9.4.4 · 调车接车进路解锁时序逻辑关系表达式（D1→D5）',
      summary: '调车接车 `D1 → D5` 经 `IAG/1DG/3DG/5-9DG`：白灯受接近区段出清延迟关闭，逐段依次经 `1LJ → 2LJ → SJ↑` 解锁（允许留车的边界段采用两点检查）！',
      signals: ['D1-DXJ(B)', '1DG解锁', '3DG解锁', '5-9DG解锁', 'D1KJ'],
      steps: [
        { title: '① 开放 D1 月白灯 B，车列由 IAG 启动', active: ['D1-DXJ(B)', 'D1KJ'], desc: '1DG/3DG/5-9DG 均处于进路锁闭状态。' },
        { title: '② 压入 1DG 但车尾仍在 IAG（白灯保留继续亮 B！）', active: ['D1-DXJ(B)', 'D1KJ'], desc: '由图 8.8.2 白灯保留自闭维持亮灯。' },
        { title: '③ 整列越过 D1 出清 IAG → D1 转蓝灯，1DG 进入解锁', active: ['1DG解锁', 'D1KJ'], desc: 'IAG 出清切断白灯保留，车压 3DG 时 1DG 三点解锁。' },
        { title: '④ 车出清 3DG 压入 5-9DG → 3DG 解锁', active: ['1DG解锁', '3DG解锁', 'D1KJ'], desc: '3DG 白光带熄灭，道岔可复归。' },
        { title: '⑤ 调车全列进入目的线出清 5-9DG → 全线解锁复原', active: ['1DG解锁', '3DG解锁', '5-9DG解锁'], desc: '5-9DG 解锁，D1KJ↓ 与终端 D5ZJ↓ 复原。' }
      ]
    },
    {
      id: '9.4.5', ch: 9, page: 196, engine: 'circuit', sub: 'ladder',
      title: '图 9.4.5 · 下行列车接车进路的解锁网络图（12/13 线 + 3×Q 组合 + 股道 GJJ）',
      summary: '严格按图 9.4.5：12 线经 `1DG → 1/7G → 7-11DG` 及道岔 `DBJ/FBJ·SJ5组` 逐段向终端传递，经股道端 `GJJ(3-4)` 励磁后由 13 线（串道岔 6 组表示）返程解锁各 `2LJ↑ → SJ↑`！',
      rails: ['12 线 (始端→终端)', '13 线 (终端 GJJ 返程)'],
      inputs: [
        { id: 'd1', label: '1DG 曾占已清 + 下段占用', def: true },
        { id: 'd2', label: '1/7G 曾占已清 + 下段占用', def: true },
        { id: 'd3', label: '7-11DG 曾占已清 + 列车入 ⅠG', def: false },
        { id: 'swOk', label: '道岔 1/3、5/7、11 表示在 12/13 线贯通', def: true }
      ],
      rungs: [
        { id: 'q1', label: '1DG Q组合：12/13 线局部三点成立 → 1DG-1LJ↑·2LJ↑ → 1DG 解锁', coil: 'U_1DG', contacts: [{ label: '1DG三点', kind: 'front', on: s => s.d1 && s.swOk }] },
        { id: 'q2', label: '1/7G Q组合：前段 1DG 已解 + 本段三点 → 1/7G 解锁', coil: 'U_17G', contacts: [{ label: '1DG已解', kind: 'front', on: (s, rl) => rl.U_1DG }, { label: '1/7G三点', kind: 'front', on: s => s.d2 && s.swOk }] },
        { id: 'q3', label: '7-11DG + 股道 GJJ(3-4)：前段已解 + 入 ⅠG → 末段解锁 + 复原', coil: 'U_711', contacts: [{ label: '1/7G已解', kind: 'front', on: (s, rl) => rl.U_17G }, { label: '入ⅠG·GJJ返程', kind: 'front', on: s => s.d3 && s.swOk }] }
      ],
      presets: [
        { label: '① 车行至 7-11DG（前两段 1DG/1-7G 已逐段解锁!）', set: { d1: true, d2: true, d3: false, swOk: true } },
        { label: '② 整列进 ⅠG（末段 7-11DG 经 GJJ 返程全解锁！）', set: { d1: true, d2: true, d3: true, swOk: true } }
      ],
      verdict: (s, rl) => `解锁进度：1DG=${rl.U_1DG ? '✓已解' : '🔒锁闭'} ｜ 1/7G=${rl.U_17G ? '✓已解' : '🔒锁闭'} ｜ 7-11DG=${rl.U_711 ? '✓已解' : '🔒锁闭'}`
    },
    {
      id: '9.4.6', ch: 9, page: 199, engine: 'circuit', sub: 'ladder',
      title: '图 9.4.6 · 调车发车进路的解锁网络图举例（D3 向左调车：先 2LJ 后 1LJ！）',
      summary: '向右与向左进路 1LJ/2LJ 动作次序恰好相反！D3 向左调车时先经 `D3XJJ后·D3JYJ前·D3XJ缓放前` 送解锁窗口，**先励磁 2LJ 后励磁 1LJ**；1DG 内方 IAG 无 Q 组合只作边界占用条件！',
      rails: ['13 线 (D3 右端→左)', '12 线 (IAG 左端返程)'],
      inputs: [
        { id: 'leftStart', label: 'D3 信号关闭窗口送出解锁电源', def: true },
        { id: 'occ1dg', label: '车列经 1DG 向左压入 IAG 边界', def: true },
        { id: 'clr1dg', label: '车尾完全出清 1DG（1DGJ↑）', def: true }
      ],
      rungs: [
        { id: 'lj2', label: '向左先记占用：13线 → 1DG-2LJ↑（注意向左先 2LJ!）', coil: 'LJ2', contacts: [{ label: 'D3关闭窗口·压1DG', kind: 'front', on: s => s.leftStart && s.occ1dg }] },
        { id: 'lj1', label: '向左后记出清：12线(IAG占·1DG清) → 1DG-1LJ↑ → 1/3-1SJ↑解锁！', coil: 'LJ1', contacts: [{ label: '2LJ已吸', kind: 'front', on: (s, rl) => rl.LJ2 }, { label: '1DG出清·压IAG', kind: 'front', on: s => s.clr1dg }] }
      ],
      presets: [
        { label: '① 向左压入 1DG（先吸 2LJ↑）', set: { leftStart: true, occ1dg: true, clr1dg: false } },
        { label: '② 出清 1DG 入 IAG（再吸 1LJ↑ → 解锁！）', set: { leftStart: true, occ1dg: true, clr1dg: true } }
      ],
      verdict: (s, rl) => `D3 向左调车：先 2LJ=${rl.LJ2 ? '↑' : '↓'} → 后 1LJ=${rl.LJ1 ? '↑(已解锁!)' : '↓'}`
    },
    {
      id: '9.5.1', ch: 9, page: 201, engine: 'circuit', sub: 'wave', waveType: 'rcDecay',
      title: '图 9.5.1 · 总取消与总人解继电器电路（ZQJ / ZRJ · 51Ω/200μF 约 1s 缓放）',
      summary: 'ZQA 与 `ZRJ 1前` 并联供总取消 `ZQJ`（因此按总人解 ZRA 时 ZQJ 也同步吸起！），ZRA 供总人解 `ZRJ`；两线圈均并 `R=51Ω/C=200μF` 缓放约 1s，提供按钮松手后的脉冲输出宽度！',
      errata: '教材原图 9.5.1(a) 标题与接点均为 ZQJ，但线圈旁印刷误标为 ZRJ，本仿真按正确功能标注 ZQJ/ZRJ 并保留该原书勘误说明。',
      controls: [
        { id: 'aj', type: 'checkbox', label: '按压 ZQA / ZRA 按钮（松手观察 51Ω/200μF ≈1s 缓放曲线！）', def: true },
        { id: 'R', type: 'range', label: '串联电阻 R (Ω · 原图 51Ω)', min: 20, max: 120, step: 1, def: 51 },
        { id: 'C', type: 'range', label: '并联电容 C (μF · 原图 200μF)', min: 100, max: 1000, step: 50, def: 200 }
      ]
    },
    {
      id: '9.5.2', ch: 9, page: 202, engine: 'circuit', sub: 'ladder',
      title: '图 9.5.2 · 调车信号的取消继电器 QJ 电路（AJ/1AJ + KF-ZQJ-Q 触发）',
      summary: '办理调车取消/人解时，先按 `ZQA/ZRA` 送出 `KF-ZQJ-Q`，再按始端按钮使 `AJ前 → QJ(3-4)` 励磁，并经 `XJJ6前·FKJ2转换·QJ8前` 自闭保持 `QJ(1-2)`，同时切断 `AJ/FKJ/XJ` 立即关闭信号！',
      rails: ['KZ', 'KF-ZQJ-Q / KF'],
      inputs: [
        { id: 'zqa', label: '按下总取消 ZQA / 总人解 ZRA (送 KF-ZQJ-Q)', def: true },
        { id: 'aj', label: '再按始端按钮 AJ / 1AJ', def: true },
        { id: 'xjj', label: 'XJJ 6前闭合（进路检查完好，允许 QJ 自闭）', def: true }
      ],
      rungs: [
        { id: 'qj', label: 'QJ(3-4 经 AJ前·KF-ZQJ-Q) ∥ QJ(1-2 经 XJJ6前·QJ8前自闭)', coil: 'QJ', contacts: [
          { label: 'AJ前 · KF-ZQJ-Q', kind: 'front', on: s => s.zqa && s.aj }
        ], altBranch: { label: '1-2 保持至全解锁', contacts: [{ label: 'XJJ 6前', kind: 'front', on: s => s.xjj }, { label: 'QJ 8前', kind: 'front', on: (s, rl) => rl.QJ }] } }
      ],
      presets: [
        { label: '① ZQA + 始端 AJ → QJ↑ 立即关闭调车信号！', set: { zqa: true, aj: true, xjj: true } },
        { label: '② 松开按钮后 QJ 经 XJJ 保持至解锁完毕', set: { zqa: false, aj: false, xjj: true } },
        { label: '③ 解锁完毕 XJJ↓ → QJ 自动复原↓', set: { zqa: false, aj: false, xjj: false } }
      ],
      verdict: (s, rl) => rl.QJ ? '✓ QJ↑：已触发取消/人解并关闭信号，保持至整条进路解锁完成！' : '○ QJ↓ 复原态。'
    },
    {
      id: '9.5.3', ch: 9, page: 202, engine: 'circuit', sub: 'ladder',
      title: '图 9.5.3 · 列车与调车合用的取消继电器电路（LAJ/DAJ 并联触发 + XJJ 1组复用）',
      summary: '列调共用始端处，`LAJ 6前` 与 `DAJ 6前` 并联触发 `QJ(3-4)`，`QJ 2前` 保证松手自闭，1-2 线圈由 `XJJ 1前`（复用 5 线传电接点，不再串 FKJ）保持直至解锁复原！',
      rails: ['KZ', 'KF-ZQJ-Q / KF'],
      inputs: [
        { id: 'zqa', label: '送出 KF-ZQJ-Q (ZQA/ZRA)', def: true },
        { id: 'laj', label: '按列车始端 LAJ 6前', def: true },
        { id: 'daj', label: '按调车始端 DAJ 6前', def: false },
        { id: 'xjj1', label: 'XJJ 1前闭合（取消过程保持）', def: true }
      ],
      rungs: [
        { id: 'qj', label: '共用 QJ：(LAJ6前 ∥ DAJ6前) · KF-ZQJ-Q → 3-4 ∥ XJJ1前·QJ8前 → 1-2', coil: 'QJ', contacts: [
          { label: '(LAJ6前∥DAJ6前)·ZQJ', kind: 'front', on: s => s.zqa && (s.laj || s.daj) }
        ], altBranch: { label: 'XJJ1前自闭', contacts: [{ label: 'XJJ 1前', kind: 'front', on: s => s.xjj1 }, { label: 'QJ 8前', kind: 'front', on: (s, rl) => rl.QJ }] } }
      ],
      presets: [
        { label: '① 取消列车进路 (ZQA+XLA → QJ↑)', set: { zqa: true, laj: true, daj: false, xjj1: true } },
        { label: '② 取消调车进路 (ZQA+D1A → QJ↑)', set: { zqa: true, laj: false, daj: true, xjj1: true } }
      ],
      verdict: (s, rl) => rl.QJ ? '✓ 合用 QJ↑：同时覆盖列车与调车进路取消/人解！' : '○ QJ↓'
    },
    {
      id: '9.5.4', ch: 9, page: 203, engine: 'circuit', sub: 'sequence',
      title: '图 9.5.4 · 列车接车进路取消的过程时序逻辑（12线顺传 → GJJ↑ → 13线由终到始解锁！）',
      summary: '与正常过车“由始到终逐段解锁”完全相反！取消进路无车占用（FDGJ 始终↓），`QJ↑→LXJ↓→QJJ↓`，12 线自左向右顺传 `1DG→1/7G→7-11DG` 各 `1LJ/CJ↑`，抵达终端 `GJJ(3-4)↑` 后沿 13 线**自终端向始端逆序解锁各 2LJ/SJ↑**！',
      signals: ['QJ↑', 'LXJ↓/QJJ↓', '12线顺传(1LJ/CJ)', '终端GJJ(3-4)↑', '13线逆解(2LJ/SJ↑)', 'ZCJ↑/KJ↓'],
      steps: [
        { title: '① 按 ZQA + XLA → QJ↑，立即关闭信号 LXJ↓', active: ['QJ↑'], desc: '先关信号再解锁，确保安全铁律！' },
        { title: '② 10 线断电，全进路 QJJ↓ 落下', active: ['QJ↑', 'LXJ↓/QJJ↓'], desc: '因无车占用，FDGJ 始终落下。' },
        { title: '③ 12 线自始端向终端连续传递（1DG→1/7G→7-11DG 1LJ/CJ↑）', active: ['QJ↑', 'LXJ↓/QJJ↓', '12线顺传(1LJ/CJ)'], desc: '无 FDGJ 缓放阻碍，各 CJ 迅速连续传递 KF 至股道终端。' },
        { title: '④ 股道终端 GJJ(3-4)↑ 励磁，折返送出 13 线 KF！', active: ['QJ↑', '12线顺传(1LJ/CJ)', '终端GJJ(3-4)↑'], desc: 'GJJ 吸起接通 13 线反向返程电源。' },
        { title: '⑤ 13 线【由终端向始端】逆序解锁 7-11DG → 1/7G → 1DG！', active: ['12线顺传(1LJ/CJ)', '终端GJJ(3-4)↑', '13线逆解(2LJ/SJ↑)'], desc: '各段 2LJ↑ → SJ↑ 逆序解锁！' },
        { title: '⑥ 照查 ZCJ↑ 恢复，始端 KJ↓·XJJ↓·QJ↓ 全部复原', active: ['13线逆解(2LJ/SJ↑)', 'ZCJ↑/KJ↓'], desc: '整条进路彻底取消复原。' }
      ]
    },
    {
      id: '9.5.5', ch: 9, page: 204, engine: 'circuit', sub: 'sequence',
      title: '图 9.5.5 · 调车进路取消的过程时序逻辑（D3→D1 经 D1ZJ 折返）',
      summary: '调车取消（以 D3→D1 为例）：`D3QJ↑ → D3DXJ↓ → 1DG-QJJ↓` → 先励磁 `1DG-2LJ/CJ↑` → 经终端 **`D1ZJ`** 折返 12/13 线 → `1DG-1LJ↑ → 1/3-1SJ↑` 解锁，最后 `D1ZJ↓ · D3KJ↓` 复原！',
      signals: ['D3QJ↑', 'D3DXJ↓/QJJ↓', '1DG-2LJ/CJ↑', '终端 D1ZJ 折返', '1DG-1LJ↑/SJ↑'],
      steps: [
        { title: '① 按 ZQA + D3A → D3QJ↑ 立即关 D3 白灯', active: ['D3QJ↑'], desc: '调车取消先确认信号关闭。' },
        { title: '② 1DG-QJJ↓ 落下', active: ['D3QJ↑', 'D3DXJ↓/QJJ↓'], desc: '断开 10 线自闭，开放 12/13 线准备取消传递。' },
        { title: '③ 励磁 1DG-2LJ↑ 与 CJ↑ 传至终端 D1', active: ['D3QJ↑', '1DG-2LJ/CJ↑'], desc: '由右向左送解锁负电。' },
        { title: '④ 经终端 D1ZJ 折返送出回程负电', active: ['1DG-2LJ/CJ↑', '终端 D1ZJ 折返'], desc: '调车无股道 GJJ，改由终端 ZJ 完成 12/13 线折返！' },
        { title: '⑤ 1DG-1LJ↑ → 1/3-1SJ↑ 解锁复原', active: ['1DG-2LJ/CJ↑', '终端 D1ZJ 折返', '1DG-1LJ↑/SJ↑'], desc: 'SJ 吸起，D1ZJ 与 D3KJ 全部复原。' }
      ]
    },
    {
      id: '9.5.6', ch: 9, page: 205, engine: 'circuit', sub: 'ladder',
      title: '图 9.5.6 · 列车接车的取消进路解锁网络电路（追踪原图虚线 ①–⑦ 供电路径）',
      summary: '实体电路与图 9.4.5 相同，取消时由 `QJ·XJJ·JYJ` 向 12 线送入连续 KF（路径①→②→③→④经三段 CJ 直达 GJJ），再沿路径⑤→⑥→⑦由 13 线逆序解锁 `7-11DG → 1/7G → 1DG`！',
      rails: ['12 线 (路径 ①–④)', '13 线 (路径 ⑤–⑦)'],
      inputs: [
        { id: 'cond', label: '满足取消起点条件 (QJ↑·XJJ↑·JYJ↑·LXJ↓)', def: true },
        { id: 'allFree', label: '全进路 3 个区段完全空闲（无车 FDGJ↓）', def: true }
      ],
      rungs: [
        { id: 'p14', label: '路径 ①–④ (12线顺传)：始端KF → 1DG(1LJ/CJ) → 1/7G → 7-11DG → GJJ(3-4)↑', coil: 'PATH_14', contacts: [{ label: 'QJ·XJJ·JYJ·LXJ↓', kind: 'front', on: s => s.cond }, { label: '全进路无车空闲', kind: 'front', on: s => s.allFree }] },
        { id: 'p57', label: '路径 ⑤–⑦ (13线逆解)：GJJ5前折返 → 7-11DG(2LJ/SJ↑) → 1/7G → 1DG 逆序解锁！', coil: 'PATH_57', contacts: [{ label: 'GJJ 折返成功', kind: 'front', on: (s, rl) => rl.PATH_14 }] }
      ],
      presets: [
        { label: '① 预先锁闭全空闲：路径 ①→⑦ 一气呵成取消解锁！', set: { cond: true, allFree: true } },
        { label: '② 若进路内有车占用（断开 XJJ/12线，严禁取消解锁！）', set: { cond: true, allFree: false } }
      ],
      verdict: (s, rl) => rl.PATH_57 ? '✓ 虚线 ①–④ (12线顺传) + ⑤–⑦ (13线逆解) 完整贯通，进路由终至始取消解锁！' : '🛡 取消条件不满足（信号未关、接近已锁闭或区段有车），阻断取消！'
    },
    {
      id: '9.5.7', ch: 9, page: 208, engine: 'circuit', sub: 'ladder',
      title: '图 9.5.7 · 调车发车的取消进路解锁网络（追踪虚线 ①–② 经 ZJ 折返）',
      summary: '调车发车取消网络：实体与图 9.4.6 同构，取消时沿虚线 ① 经 CJ 传至终端 ZJ，由终端 ZJ 折返沿虚线 ② 完成调车进路逆序取消解锁！',
      rails: ['路径 ① (始端→ZJ)', '路径 ② (ZJ 折返解锁)'],
      inputs: [
        { id: 'qjOk', label: '调车取消条件 (QJ↑·XJJ↑·JYJ↑·DXJ↓)', def: true },
        { id: 'zjUp', label: '终端 ZJ↑ 接通 12/13 线折返通道', def: true }
      ],
      rungs: [
        { id: 'p1', label: '路径 ①：QJ·XJJ·JYJ → 12/13 线经 CJ 抵达终端 ZJ', coil: 'P1', contacts: [{ label: '调车取消条件', kind: 'front', on: s => s.qjOk }] },
        { id: 'p2', label: '路径 ②：经终端 ZJ 折返 → 解锁本段 SJ↑ 并复原 ZJ/KJ', coil: 'P2', contacts: [{ label: '路径①贯通', kind: 'front', on: (s, rl) => rl.P1 }, { label: 'ZJ 折返', kind: 'front', on: s => s.zjUp }] }
      ],
      presets: [
        { label: '① 路径 ①→② 正常取消解锁', set: { qjOk: true, zjUp: true } },
        { label: '② 调车已入接近锁闭 JYJ↓（需改按 ZRA 延时 30s!）', set: { qjOk: false, zjUp: true } }
      ],
      verdict: (s, rl) => rl.P2 ? '✓ 调车取消路径 ①→② 贯通解锁！' : '🛡 调车未满足即时取消条件（检查是否已转接近锁闭 JYJ↓）。'
    },
    {
      id: '9.5.8', ch: 9, page: 209, engine: 'circuit', sub: 'ladder',
      title: '图 9.5.8 · 总人工延时解锁电源条件电路（JYJ + LKJ 自动选通 KF / 3min / 30s）',
      summary: '严格按图 9.5.8：12 线经 `KJ5前·QJ5前·XJJ5前` 后由 **`JYJ 3组`**分流：`JYJ前`（预先锁闭）直取普通 `KF` 立即取消；`JYJ后`（接近锁闭）再由 **`LKJ 5组`**切换——列车接车/正线发车取 **`KF-3min`**（高铁 4min），调车/侧线发车取 **`KF-30s`**！',
      jump3d: { label: '⏱ 查看 01 半导体时间继电器 JSBXC-850 (3′)', go: { mode: 'bench', type: 'timeRelay', polarity: 1 } },
      rails: ['12 线 (KJ·QJ·XJJ 5前)', 'KF / KF-3min / KF-30s'],
      inputs: [
        { id: 'baseOk', label: '基础条件满足 (KJ5前·QJ5前·XJJ5前，信号已关)', def: true },
        { id: 'jyjUp', label: 'JYJ 3前闭合（预先锁闭；断开=接近锁闭须延时!）', def: false },
        { id: 'lkjUp', label: 'LKJ 5前闭合（列车接车/正线发车 3min；断开=调车/侧发 30s）', def: true }
      ],
      rungs: [
        { id: 'imm', label: '立即取消支路 (ZQA)：JYJ 3前 → 普通 KF（0s 立即解锁）', coil: 'KF_IMM', contacts: [{ label: '基础条件', kind: 'front', on: s => s.baseOk }, { label: 'JYJ 3前(预先)', kind: 'front', on: s => s.jyjUp }] },
        { id: 't3m', label: '列车 3 min 延时 (ZRA)：JYJ 3后 · LKJ 5前 → KF-3min (JSBXC-850 180s)', coil: 'KF_3MIN', contacts: [{ label: '基础条件', kind: 'front', on: s => s.baseOk }, { label: 'JYJ3后·LKJ5前', kind: 'front', on: s => !s.jyjUp && s.lkjUp }] },
        { id: 't30s', label: '调车/侧线发车 30 s 延时 (ZRA)：JYJ 3后 · LKJ 5后 → KF-30s (30s)', coil: 'KF_30S', contacts: [{ label: '基础条件', kind: 'front', on: s => s.baseOk }, { label: 'JYJ3后·LKJ5后', kind: 'front', on: s => !s.jyjUp && !s.lkjUp }] }
      ],
      presets: [
        { label: '① 预先锁闭 (JYJ↑) → 普通 KF 立即取消 (0s)', set: { baseOk: true, jyjUp: true, lkjUp: true } },
        { label: '② 列车接近锁闭 (JYJ↓·LKJ↑) → 必须延时 3 min (180s)!', set: { baseOk: true, jyjUp: false, lkjUp: true } },
        { label: '③ 调车/侧线发车接近锁闭 (JYJ↓·LKJ↓) → 延时 30 s!', set: { baseOk: true, jyjUp: false, lkjUp: false } }
      ],
      verdict: (s, rl) => rl.KF_IMM ? '⚡ 选通普通 KF（0s 立即取消解锁）' : rl.KF_3MIN ? '⏱ 选通 KF-3min（必须等待 180s 确认列车停稳未冒进！）' : rl.KF_30S ? '⏱ 选通 KF-30s（调车或侧线发车等待 30s 延时解锁！）' : '✕ 信号未关闭或 XJJ↓，严禁送解锁电源！'
    },
    {
      id: '9.6.1', ch: 9, page: 211, engine: 'circuit', sub: 'ladder',
      title: '图 9.6.1 · 区段故障解锁电路（SGA + ZRA · 必检 DGJF↑ 空闲 且 QJJ↓ 非前方！）',
      summary: '分路不良遗留白光带唯一合规解锁法：按压 `SGA + ZRA` 经 `DGJF 5前`（证明区段确已空闲无车！）强励 `CJ(1-2)`，其第 1/3 组前接点与 **`QJJ 5后`**（证明绝不是列车运行前方尚未压入的区段！）共同吸起 `1LJ/2LJ → SJ↑`！',
      jump3d: { label: '🚉 在 03 沙盘演练遗留白光带 + SGA+ZRA 区故解', go: { mode: 'station', stationRoute: 'R1', blindFault: 'stuck' } },
      rails: ['KZ-GDJ', 'KF-ZRJ-Q (SGA+ZRA)'],
      inputs: [
        { id: 'sgaZra', label: '双人确认后同时按下 SGA + ZRA 按钮', def: true },
        { id: 'dgjfUp', label: '条件①：本区段轨道继电器已恢复空闲 (DGJF↑)', def: true },
        { id: 'qjjDown', label: '条件②：QJJ↓（列车已进入过本段，绝非运行前方！）', def: true }
      ],
      rungs: [
        { id: 'cj', label: '强励 CJ(1-2)：KZ-GDJ → CJ(1-2) → DGJF5前 → SGA → KF-ZRJ-Q', coil: 'CJ', contacts: [
          { label: 'DGJF 5前(无车!)', kind: 'front', on: s => s.dgjfUp },
          { label: 'SGA + ZRA', kind: 'btn', on: s => s.sgaZra }
        ]},
        { id: 'lj', label: '励磁 1LJ/2LJ：KZ-GDJ → QJJ 5后 → 1LJ/2LJ(1-2) → CJ 1/3前 → KF', coil: 'LJ12_SJ', contacts: [
          { label: 'QJJ 5后(非前方!)', kind: 'back', on: s => s.qjjDown },
          { label: 'CJ 1/3前', kind: 'front', on: (s, rl) => rl.CJ }
        ]}
      ],
      presets: [
        { label: '① 遗留白光带合规区故解（DGJF↑ · QJJ↓ + SGA+ZRA → 解锁！）', set: { sgaZra: true, dgjfUp: true, qjjDown: true } },
        { label: '② ⚠ 企图强解列车运行前方区段（QJJ↑ 断开 5 后，绝对禁止!）', set: { sgaZra: true, dgjfUp: true, qjjDown: false } },
        { label: '③ ⚠ 区段仍有车占用（DGJF↓ 断开 5 前，绝对禁止!）', set: { sgaZra: true, dgjfUp: false, qjjDown: true } }
      ],
      verdict: (s, rl) => rl.LJ12_SJ ? '✓ 区段故障解锁成功（1LJ↑ · 2LJ↑ → SJ↑ 熄灭遗留白光带）！' : (!s.dgjfUp ? '🛡 轨道区段仍有车占用 (DGJF↓)，电路硬件阻止强解！' : !s.qjjDown ? '🛡 本段处于列车运行前方 (QJJ↑)，QJJ 5后断开严禁提前强制解锁！' : '○ 等待按下 SGA+ZRA。')
    },

    // ==================== 第 11 章驱采电路（3 幅：11.3.2 — 11.3.4） ====================
    {
      id: '11.3.2', ch: 11, page: 224, engine: 'circuit', sub: 'ladder',
      title: '图 11.3.2 · 计算机联锁继电器驱采电路（双向采集回线 + 驱动回线）',
      summary: '计算机联锁取消 6502 中间 1–13 线庞大选排/锁闭网络，仅经接口柜/组合侧面端子保留与室外接口继电器的双向“采（读接点状态）”与“驱（控线圈吸落）”！',
      jump3d: { label: '💻 进入 01 计算机联锁安全 I/O 3D 实验室', go: { mode: 'bench', type: 'cbiIoLab' } },
      rails: ['联锁主机驱采接口', '室外接口继电器 XJ'],
      inputs: [
        { id: 'drvCmd', label: '联锁主机输出【驱动命令】(安全动态脉冲)', def: true },
        { id: 'xjPick', label: '现场继电器 XJ 实际吸起（前接点闭 → 采集回采）', def: true }
      ],
      rungs: [
        { id: 'drv', label: '驱动回线：驱采输出板 → 接口柜端子 → XJ 线圈(1-4)', coil: 'DRV', contacts: [{ label: '安全驱动命令', kind: 'front', on: s => s.drvCmd }] },
        { id: 'acq', label: '采集回线：XJ 第1组转换接点 → 接口柜端子 → 驱采输入板（回采核对!）', coil: 'ACQ', contacts: [{ label: 'XJ 前接点回采', kind: 'front', on: s => s.xjPick }] }
      ],
      presets: [
        { label: '① 驱动与回采一致（闭环确认安全）', set: { drvCmd: true, xjPick: true } },
        { label: '② ⚠ 驱而不吸（回采不一致 → 主机报警并导向关闭!）', set: { drvCmd: true, xjPick: false } }
      ],
      verdict: (s, rl) => (rl.DRV === rl.ACQ) ? `✓ 驱采闭环一致（驱动=${rl.DRV ? '1' : '0'} · 采集=${rl.ACQ ? '1' : '0'}）` : '⚠ 驱采不一致报警！安全联锁软件立即判定接口故障并导向安全侧！'
    },
    {
      id: '11.3.3', ch: 11, page: 225, engine: 'circuit', sub: 'ladder',
      title: '图 11.3.3 · 进站信号机驱采电路（DY24 公共端采 7 路 + Q+/Q- 驱 5 路）',
      summary: '严格按图 11.3.3：计算机联锁以 `DY24` 为公共端采集进站组合 `LXJ、ZXJ、TXJ、LUXJ、YXJ、DJ、2DJ` 共 7 只继电器第 1 组接点，并由独立安全通道 `Q+/Q-` 直接驱动 5 只控制继电器线圈！',
      rails: ['CBI 输出(Q+/Q-) / 采集(DY24)', '进站信号组合'],
      inputs: [
        { id: 'lxj', label: '驱动 LXJ↑ (开放允许)', def: true },
        { id: 'zxj', label: '驱动 ZXJ↑ (正线直向)', def: false },
        { id: 'dj', label: '回采室外 DJ↑ (主/副灯丝完好)', def: true },
        { id: 'dj2', label: '回采室外 2DJ↑ (第二允许灯丝完好)', def: true }
      ],
      rungs: [
        { id: 'c_drv', label: '驱动输出：Q+/Q- 分别驱动 LXJ / ZXJ / TXJ / LUXJ / YXJ 线圈', coil: 'SIG_DRV', contacts: [{ label: 'LXJ/ZXJ 驱动命令', kind: 'front', on: s => s.lxj }] },
        { id: 'c_acq', label: '回采监督：DY24 公共端采集 DJ / 2DJ 及控制继电器第 1 组前接点', coil: 'SIG_ACQ', contacts: [{ label: 'DJ↑ · 2DJ↑ 回采完好', kind: 'front', on: s => s.dj && s.dj2 }] }
      ],
      presets: [
        { label: '① 侧线双黄 UU 驱动且灯丝回采完好', set: { lxj: true, zxj: false, dj: true, dj2: true } },
        { label: '② ⚠ 回采到 2DJ↓ 断丝（联锁机立即撤除 LXJ 降回红灯!）', set: { lxj: true, zxj: false, dj: true, dj2: false } }
      ],
      verdict: (s, rl) => !s.dj || !s.dj2 ? '🛡 采集板检出 DJ/2DJ↓ 断丝，联锁软件立即切断 LXJ 输出强制关闭信号！' : `当前信号驱采：${s.lxj ? (s.zxj ? '正线单黄 U' : '侧线双黄 UU') : '红灯 H'}（回采 100% 匹配）`
    },
    {
      id: '11.3.4', ch: 11, page: 225, engine: 'circuit', sub: 'ladder',
      title: '图 11.3.4 · 四线制道岔转辙机驱采电路（采 DBJ/FBJ/SJ · 驱 SJ/DCJ/FCJ）',
      summary: '计算机联锁保留第 5 章物理四线制道岔执行电路，仅用 I/O 驱动 `SJ、DCJ、FCJ`（1-4 线圈）并采集 `DBJ、FBJ、SJ` 第 1 组接点，仍由物理 `SJ` 锁闭与 `1DQJ/2DQJ` 保障安全！',
      rails: ['CBI 驱采接口', 'DD 道岔组合'],
      inputs: [
        { id: 'sjDrv', label: '驱动 SJ↑（允许转换；断开=进路软件锁闭 SJ↓!）', def: true },
        { id: 'cmdDir', label: '驱动命令：DCJ↑(定位) / 断开则驱动 FCJ↑(反位)', def: false },
        { id: 'posRev', label: '现场到位回采：反位密贴 (FBJ↑·DBJ↓)', def: true }
      ],
      rungs: [
        { id: 'd_sj', label: '驱动 SJ(1-4) + DCJ/FCJ(1-4) → 启动物理 1DQJ/2DQJ', coil: 'TO_DRV', contacts: [{ label: 'SJ驱动↑', kind: 'front', on: s => s.sjDrv }] },
        { id: 'a_fb', label: '回采 DBJ1组 / FBJ1组 / SJ1组 → 送入联锁运算层校验一致性', coil: 'TO_FB', contacts: [{ label: '与目标位置一致', kind: 'front', on: s => (s.cmdDir && !s.posRev) || (!s.cmdDir && s.posRev) }] }
      ],
      presets: [
        { label: '① 驱动转反位且回采 FBJ↑ 一致', set: { sjDrv: true, cmdDir: false, posRev: true } },
        { label: '② 进路锁闭（切 SJ↓，严禁物理 1DQJ 启动！）', set: { sjDrv: false, cmdDir: false, posRev: true } }
      ],
      verdict: (s, rl) => !s.sjDrv ? '🔒 SJ↓ 锁闭态（CBI 与物理 1DQJ 双重锁闭道岔，不可转动）' : rl.TO_FB ? '✓ 道岔驱采位置一致（密贴有表示）！' : '⏳ 道岔转换中或挤岔失表示报警！'
    },

    // ==================== 第 13.2 节故障—安全电子接口电路（4 幅：13.2.1 — 13.2.4） ====================
    {
      id: '13.2.1', ch: 13, page: 258, engine: 'circuit', sub: 'wave', waveType: 'fourTermCapFilter',
      title: '图 13.2.1 · 电源滤波器电路原理图（普通电容 vs 四头穿心电容开路安全物理波形）',
      summary: '普通二端滤波电容一旦引脚脱焊开路，整流后**脉动电压仍会直通负载**可能引发隐患；改用**四头（穿心）电容**串联在滤波通道中，电容一开路输出电流立即**物理归零**（故障—安全）！',
      controls: [
        { id: 'capType', type: 'select', label: '对比滤波电容拓扑', def: 'four', options: [
          ['four', '四头安全电容（开路即切断输出 → 故障-安全!）'],
          ['two', '普通二端并联电容（开路仍残留脉动输出 → 非安全!）']
        ]},
        { id: 'openFault', type: 'checkbox', label: '⚡ 注入滤波电容内部脱焊开路故障！', def: true }
      ]
    },
    {
      id: '13.2.2', ch: 13, page: 259, engine: 'circuit', sub: 'wave', waveType: 'optocoupler4',
      title: '图 13.2.2 · 故障—安全输入电路（(a) 4光耦静态 1010/0101 + (b) 脉冲动态双光耦）',
      summary: '完整覆盖 (a)(b) 两套电路：(a) 4 光耦静态编码——`OC1/OC3` 上拉反相（开路恒1/短路恒0）、**`OC2/OC4` 射极下拉同相（开路恒0/短路恒1）**，仅 `1010`(落下) 与 `0101`(吸起) 合法；(b) 动态脉冲经 `OC1→J前→OC2` 回读匹配脉冲！',
      controls: [
        { id: 'subMode', type: 'select', label: '切换子图 (a) 静态4光耦 / (b) 动态脉冲输入', def: 'a', options: [
          ['a', '图 13.2.2(a)：4 光耦静态编码（OC1/3反相 · OC2/4同相）'],
          ['b', '图 13.2.2(b)：双光耦动态脉冲采样电路（脉冲回读校验）']
        ]},
        { id: 'jUp', type: 'checkbox', label: '现场继电器 J 前接点闭合（危险侧 ↑）', def: true },
        { id: 'ocFault', type: 'select', label: '⚡ 注入光耦开路 / 击穿短路故障', def: 'none', options: [
          ['none', '✓ 全部光耦完好（合法码 0101 / 1010 或脉冲同步）'],
          ['oc1_open', 'OC1 开路故障（上拉反相恒输出 1 → 1101 非法!）'],
          ['oc2_open', 'OC2 开路故障（射极下拉恒输出 0 → 0001 非法!）'],
          ['oc3_short', 'OC3 击穿短路（上拉反相恒输出 0 → 0101/1000 非法!）'],
          ['oc4_short', 'OC4 击穿短路（射极下拉恒输出 1 → 1011 非法!）']
        ]}
      ]
    },
    {
      id: '13.2.3', ch: 13, page: 260, engine: 'circuit', sub: 'wave', waveType: 'pulseTransformer',
      title: '图 13.2.3 · 采用脉冲变压器的动态输出电路（法拉第电磁感应防死机常高 1）',
      summary: '物理铁律 $e = -N\\frac{d\\Phi}{dt}$！只有联锁机持续输出**交变动态方波脉冲**，脉冲变压器次级才感应交流经整流桥 DR 吸起安全继电器 J；一旦 CPU 死机卡死在**常高 1 或常低 0**，$\\frac{d\\Phi}{dt}=0$，次级电压立即归零、`J↓` 导向安全！',
      jump3d: { label: '💻 进入 01 脉冲变压器 3D 动态实验台', go: { mode: 'bench', type: 'cbiIoLab', cbiMode: 'pulseTrans' } },
      controls: [
        { id: 'cpuMode', type: 'select', label: '切换联锁 CPU 输出口状态', def: 'pulse', options: [
          ['pulse', '∿ 正常动态交变方波脉冲（持续磁耦合 → J↑）'],
          ['stuck1', '⚡ CPU 死机卡死常高 1（直流磁饱和 dΦ/dt=0 → J↓ 安全!）'],
          ['stuck0', '⚡ CPU 停机卡死常低 0（无激励 → J↓ 安全!）'],
          ['transOpen', '⚡ 脉冲变压器绕组断路/DR开路（J↓ 安全!）']
        ]}
      ]
    },
    {
      id: '13.2.4', ch: 13, page: 260, engine: 'circuit', sub: 'wave', waveType: 'chargePump',
      title: '图 13.2.4 · 采用动/静态转换输出电路（U1/T1/T2 电荷泵 C1→D2→C2 物理充放电仿真）',
      summary: '无变压器全电子电荷泵：脉冲**低电平**时 `U1截·T1通·T2截` 经 `D1` 给 `C1` 充电（此时 `C2` 维持 `J↑`）；脉冲**高电平**时 `U1通·T1截·T2通` 将 `C1` 能量经 `D2` 泵入 `C2` 续供偏极继电器 `J↑`！失脉冲或 `D1` 击穿立即 `C2` 放空 `J↓`！',
      jump3d: { label: '💻 进入 01 电荷泵 3D 安全 I/O 实验台', go: { mode: 'bench', type: 'cbiIoLab', cbiMode: 'capPump' } },
      controls: [
        { id: 'cpuMode', type: 'select', label: '切换输入脉冲与元器件故障', def: 'pulse', options: [
          ['pulse', '∿ 正常方波交替泵能（低充 C1 ⇄ 高泵 C2 → J↑）'],
          ['stuck1', '⚡ CPU 卡死常高 1（C1 无法再充电 → C2 放空 J↓!）'],
          ['stuck0', '⚡ CPU 卡死常低 0（T2 永截止不泵能 → C2 放空 J↓!）'],
          ['d1Short', '⚡ 二极管 D1 反向击穿（无法电荷泵升压 → J↓!）']
        ]}
      ]
    }
  ];

  root.FigDataCircuitB = CIRCUIT_FIGURES_B;
  if (typeof module !== 'undefined' && module.exports) module.exports = CIRCUIT_FIGURES_B;
})(typeof window !== 'undefined' ? window : globalThis);
