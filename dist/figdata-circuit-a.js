(function (root) {
  'use strict';

  // 第 4、5、6 章共 43 幅教材插图完整交互物理/电路仿真定义
  // 严格对照岳强《车站信号自动控制》（第二版）及 audit/电路接点逐图核查.md
  const CIRCUIT_FIGURES_A = [
    // ==================== 第 4 章（17 幅：4.1.1 — 4.3.5） ====================
    {
      id: '4.1.1', ch: 4, page: 54, engine: 'circuit', sub: 'wave', waveType: 'magneticFlux', relayKind: 'neutral',
      title: '图 4.1.1 · AX 型安全继电器（电磁吸力 vs 重锤片重力物理模型）',
      summary: 'AX 型安全继电器靠电磁力克服重锤片重力吸起，失电后**强制依靠重锤片重力**可靠落下（故障—安全核心原则：不依赖易失效的弹簧复位）。',
      jump3d: { label: '🧲 进入 01 继电器 3D 拆解模型 (JWXC-1700)', go: { mode: 'bench', type: 'neutral' } },
      controls: [
        { id: 'volt', type: 'range', label: '线圈供电电压 (DC V · 额定24V)', min: -24, max: 24, step: 2, def: 24 },
        { id: 'weightBroken', type: 'checkbox', label: '对比演示：假设缺乏重力返还（非安全设计）', def: false }
      ]
    },
    {
      id: '4.1.2', ch: 4, page: 55, engine: 'circuit', sub: 'wave', waveType: 'namingDecoder',
      title: '图 4.1.2 · JWJXC-H 型继电器命名释义（全型号交互解码器）',
      summary: '逐位拆解铁路信号继电器命名规则：J(继电器) · W/P/Y/Z/S(磁路/工作特性) · J(加强接点) · X(信号) · C(插入式) · H(缓放) · 前/后线圈阻值(如 125/0.44 Ω)。',
      jump3d: { label: '🧲 查看 JWJXC-H125/0.44 3D 实体', go: { mode: 'bench', type: 'heavySlow' } },
      controls: [
        { id: 'modelPreset', type: 'select', label: '切换教材表 4.1.4 典型型号逐位解码', def: 'JWJXC-H125/0.44', options: [
          ['JWJXC-H125/0.44', 'JWJXC-H125/0.44（1DQJ 加强缓放双异阻）'],
          ['JWXC-1700', 'JWXC-1700（通用无极安全继电器）'],
          ['JWXC-H340', 'JWXC-H340（无极缓放继电器）'],
          ['JPXC-1000', 'JPXC-1000（偏极继电器 DBJ/FBJ）'],
          ['JYJXC-220/220', 'JYJXC-220/220（极性保持 2DQJ）'],
          ['JZXC-480', 'JZXC-480（整流式轨道继电器 GJ）'],
          ['JZXC-H62', 'JZXC-H62（灯丝检查继电器 DJ）'],
          ['JSBXC-850', 'JSBXC-850（半导体时间继电器 3′）']
        ]}
      ]
    },
    {
      id: '4.1.3', ch: 4, page: 55, engine: 'circuit', sub: 'wave', waveType: 'magneticFlux', relayKind: 'neutral',
      title: '图 4.1.3 · 无极继电器的磁路结构（双线圈 1-2/3-4 闭合磁通仿真）',
      summary: '无极继电器磁通沿铁芯→极靴→工作气隙→衔铁→轭铁闭合；由于电磁吸力 $F \\propto \\Phi^2$ 与磁通方向无关，正、反向通电均可克服重力吸起！',
      jump3d: { label: '🧲 进入无极继电器 3D 磁路仿真', go: { mode: 'bench', type: 'neutral' } },
      controls: [
        { id: 'volt', type: 'range', label: '线圈直流供电 (V，正负向皆可吸起)', min: -24, max: 24, step: 2, def: 24 }
      ]
    },
    {
      id: '4.1.4', ch: 4, page: 56, engine: 'circuit', sub: 'wave', waveType: 'magneticFlux', relayKind: 'biased',
      title: '图 4.1.4 · 偏极继电器的磁路结构（永久磁钢叠加/抵消鉴别极性）',
      summary: '偏极继电器加装 L 形永久磁钢：仅当 **1正4负** 时电磁磁通与永磁磁通在工作气隙内叠加产生吸力吸起；**4正1负** 时反而加强保持落下（反向不吸 > 200 V）！',
      errata: '教材 PDF p.56 末段文字对图 (a)/(b) 的括号配图存在交叉，本仿真严格按磁通矢量箭头物理叠加规律执行。',
      jump3d: { label: '🧲 进入偏极继电器 JPXC-1000 3D 模型', go: { mode: 'bench', type: 'biased' } },
      controls: [
        { id: 'volt', type: 'range', label: '线圈供电 (+1正4负吸起 / -4正1负锁闭落下)', min: -24, max: 24, step: 2, def: 24 }
      ]
    },
    {
      id: '4.1.5', ch: 4, page: 57, engine: 'circuit', sub: 'wave', waveType: 'magneticFlux', relayKind: 'latching',
      title: '图 4.1.5 · 极性保持继电器磁路结构图（双稳态定/反位记忆仿真）',
      summary: '极性保持继电器（如 2DQJ）：**1进4出转定位**、**4进1出转反位**；**断电后由永久磁钢磁通牢牢保持在最后一次转极位置**（无重力返还落下态）。',
      jump3d: { label: '🧲 进入极性保持继电器 JYJXC-220/220 3D 模型', go: { mode: 'bench', type: 'latching' } },
      controls: [
        { id: 'pulse', type: 'select', label: '施加转极脉冲或断电保持', def: 'pos', options: [
          ['pos', '＋ 正向脉冲（1进4出 → 转定位并记忆）'],
          ['zero', '○ 切断电源（永磁保持当前定/反位！）'],
          ['neg', '− 反向脉冲（4进1出 → 转反位并记忆）']
        ]}
      ]
    },
    {
      id: '4.1.6', ch: 4, page: 57, engine: 'circuit', sub: 'wave', waveType: 'contactBreakMake',
      title: '图 4.1.6 · AJ 前、中、后接点示意图（21-22-23 先断后接动作仿真）',
      summary: '以第 2 组接点为例：中接点 `21`、前接点 `22`、后接点 `23`。实线表示接通，虚线表示断开；衔铁转换必严格遵循**先断后接**，杜绝前后接点瞬间短接！',
      jump3d: { label: '🧲 进入 01 前/后接点微距 3D 观察', go: { mode: 'bench', type: 'contacts' } },
      controls: [
        { id: 'pose', type: 'range', label: '手动拖动衔铁行程 (0%落下 → 50%悬空双断 → 100%吸起)', min: 0, max: 100, step: 5, def: 0 }
      ]
    },
    {
      id: '4.1.7', ch: 4, page: 58, engine: 'circuit', sub: 'wave', waveType: 'normalStateCompare',
      title: '图 4.1.7 · 继电器线圈及接点表示图（常态吸起 vs 常态落下）',
      summary: '铁路规定继电器“常态”与设备通常状态一致：**DBJ、GJ、SJ、DJ 常态吸起↑**（图示前接点实线）；**XJ、AJ、1DQJ、FDGJ 常态落下↓**（图示后接点实线）。',
      controls: [
        { id: 'state', type: 'select', label: '切换系统运行状态观察三类典型继电器接点实/虚线', def: 'normal', options: [
          ['normal', '正常空闲常态（GJ↑ · DBJ↑ · XJ↓）'],
          ['routeOpen', '开放信号进路（GJ↑ · DBJ↑ · XJ↑）'],
          ['trainOcc', '列车压入占用（GJ↓ · DBJ↑ · XJ↓ · 导向安全！）']
        ]}
      ]
    },
    {
      id: '4.2.1', ch: 4, page: 62, engine: 'circuit', sub: 'ladder',
      title: '图 4.2.1 · 串/并联电路与串并联电路（(a)(b)(c)(d) 四网实时求值）',
      summary: '严格按教材图 4.2.1：(a) 串联与逻辑 `DJ = AJ·BJ·CJ̄`；(b) 并联或逻辑 `AJ = BJ+CJ+DJ`；(c) 串并联 `FJ = AJ·BJ·(CJ̄+DJ+EJ)`；(d) 串并联 `FJ = AJ·BJ·(CJ̄·EJ + DJ)`。',
      rails: ['KZ (+24V)', 'KF (0V)'],
      inputs: [
        { id: 'AJ', label: 'AJ 吸起', def: true },
        { id: 'BJ', label: 'BJ 吸起', def: true },
        { id: 'CJ', label: 'CJ 吸起', def: false },
        { id: 'DJ', label: 'DJ 吸起', def: false },
        { id: 'EJ', label: 'EJ 吸起', def: true }
      ],
      rungs: [
        { id: 'a', label: '(a) 串联电路：AJ前 · BJ前 · CJ后 → DJ', coil: 'DJ_a', contacts: [
          { label: 'AJ前', kind: 'front', on: s => s.AJ },
          { label: 'BJ前', kind: 'front', on: s => s.BJ },
          { label: 'CJ后', kind: 'back', on: s => !s.CJ }
        ]},
        { id: 'b', label: '(b) 并联电路：BJ前 ∥ CJ前 ∥ DJ前 → AJ(出)', coil: 'AJ_b', parallelContacts: [
          { label: 'BJ前', kind: 'front', on: s => s.BJ },
          { label: 'CJ前', kind: 'front', on: s => s.CJ },
          { label: 'DJ前', kind: 'front', on: s => s.DJ }
        ]},
        { id: 'c', label: '(c) 串并联：AJ前·BJ前 · (CJ后 ∥ DJ前 ∥ EJ前) → FJ₁', coil: 'FJ_c', contacts: [
          { label: 'AJ前', kind: 'front', on: s => s.AJ },
          { label: 'BJ前', kind: 'front', on: s => s.BJ },
          { label: 'CJ后∥DJ前∥EJ前', kind: 'front', on: s => (!s.CJ || s.DJ || s.EJ) }
        ]},
        { id: 'd', label: '(d) 串并联：AJ前·BJ前 · (CJ后·EJ前 ∥ DJ前) → FJ₂', coil: 'FJ_d', contacts: [
          { label: 'AJ前', kind: 'front', on: s => s.AJ },
          { label: 'BJ前', kind: 'front', on: s => s.BJ },
          { label: '(CJ后·EJ前)∥DJ前', kind: 'front', on: s => ((!s.CJ && s.EJ) || s.DJ) }
        ]}
      ],
      presets: [
        { label: '① 默认导通全验', set: { AJ: true, BJ: true, CJ: false, DJ: false, EJ: true } },
        { label: '② 令 CJ↑（断开(a)与(d)上支）', set: { AJ: true, BJ: true, CJ: true, DJ: false, EJ: true } },
        { label: '③ 令 DJ↑（经下支旁路救活(d)）', set: { AJ: true, BJ: true, CJ: true, DJ: true, EJ: false } }
      ],
      verdict: (s, rl) => `逻辑值：(a)DJ=${rl.DJ_a ? '↑' : '↓'} ｜ (b)AJ=${rl.AJ_b ? '↑' : '↓'} ｜ (c)FJ₁=${rl.FJ_c ? '↑' : '↓'} ｜ (d)FJ₂=${rl.FJ_d ? '↑' : '↓'}（完全符合布尔逻辑表）`
    },
    {
      id: '4.2.2', ch: 4, page: 62, engine: 'circuit', sub: 'ladder',
      title: '图 4.2.2 · 自闭电路（单线圈 (a)(b) 与双线圈 1-2/3-4 分支 (c) 活体仿真）',
      summary: '(b) 按下自复按钮 A 使 AJ 吸起，松手后靠 `AJ 前接点` 与共用 `FUJ 后接点` 自闭保持，直到 `FUJ↑` 复原切断；(c) 展示 `XJ 1-2` 启动线圈与 `XJ 3-4` 自闭线圈严格分离！',
      jump3d: { label: '⚡ 进入 01 自闭电路与防混线 3D 实验台', go: { mode: 'bench', type: 'selfHold' } },
      rails: ['KZ', 'KF'],
      inputs: [
        { id: 'btnA', label: '按压自复按钮 A', def: false },
        { id: 'FUJ', label: '复原继电器 FUJ↑（切断自闭）', def: false },
        { id: 'btnB', label: '(c) 按钮 B 按压', def: false },
        { id: 'CJ', label: '(c) CJ↑（允许 XJ 3-4 保持）', def: true }
      ],
      rungs: [
        { id: 'b', label: '(b) FUJ后(共用) → [按钮A ∥ AJ自闭前] → AJ线圈', coil: 'AJ', contacts: [
          { label: 'FUJ后(共用)', kind: 'back', on: s => !s.FUJ },
          { label: '按钮A ∥ AJ自闭前', kind: 'front', on: (s, rl) => s.btnA || rl.AJ }
        ]},
        { id: 'c1', label: '(c) 启动回路：AJ前 · 按钮B → XJ(1-2 启动线圈)', coil: 'XJ', contacts: [
          { label: 'AJ前', kind: 'front', on: (s, rl) => rl.AJ },
          { label: '按钮B', kind: 'btn', on: s => s.btnB }
        ], altBranch: {
          label: '(c) 保持回路：CJ前 · XJ自闭前 → XJ(3-4 保持线圈)',
          contacts: [
            { label: 'CJ前', kind: 'front', on: s => s.CJ },
            { label: 'XJ自闭前', kind: 'front', on: (s, rl) => rl.XJ }
          ]
        }}
      ],
      presets: [
        { label: '① 按下按钮 A（启动 AJ↑）', set: { btnA: true, FUJ: false, btnB: false, CJ: true } },
        { label: '② 松开 A（检验 AJ 自闭保持!）', set: { btnA: false, FUJ: false, btnB: false, CJ: true } },
        { label: '③ 按 B 启动 XJ(1-2) 后靠 CJ·XJ(3-4)自闭', set: { btnA: false, FUJ: false, btnB: true, CJ: true } },
        { label: '④ 令 FUJ↑ 且 CJ↓（全部可靠复原落下）', set: { btnA: false, FUJ: true, btnB: false, CJ: false } }
      ],
      verdict: (s, rl) => `AJ=${rl.AJ ? '↑(已吸起/自闭中)' : '↓(落下)'} ｜ XJ=${rl.XJ ? '↑(已吸起/3-4保持)' : '↓(落下)'}。提示：按顺序点预设 ①→② 可亲眼验证松手后自闭保持！`
    },
    {
      id: '4.2.3', ch: 4, page: 62, engine: 'circuit', sub: 'wave', waveType: 'rcDecay',
      title: '图 4.2.3 · 延时落下继电器电路（RC 并联指数放电物理曲线仿真）',
      summary: '在继电器 CJ 线圈两端并联串联支路 R + C。电源断开后，电容 C 通过电阻 R 与线圈形成闭合放电回路，$i(t)=I_0 e^{-t/((R+R_c)C)}$ 维持衔铁延时落下！调节 R、C 实时观测曲线。',
      controls: [
        { id: 'aj', type: 'checkbox', label: 'AJ·BJ 供电接通（充电并吸起 CJ↑）', def: true },
        { id: 'R', type: 'range', label: '串联电阻 R (Ω)', min: 20, max: 200, step: 10, def: 50 },
        { id: 'C', type: 'range', label: '储能电容 C (μF)', min: 200, max: 2000, step: 100, def: 1000 }
      ]
    },
    {
      id: '4.2.4', ch: 4, page: 63, engine: 'circuit', sub: 'ladder',
      title: '图 4.2.4 · 组合/时序逻辑表达式举例及对应电路（AJ→BJ→CJ 闭环脉冲时序）',
      summary: '教材经典闭环时序电路：按下 A 且 CJ↓ 时 `AJ(3-4)` 吸起并由 `AJ(1-2)` 自闭，随即触发 `BJ↑ → CJ↑`；CJ 吸起后其后接点立即切断 AJ，进而 `AJ↓ → BJ↓ → CJ↓` 完成单次脉冲循环！',
      rails: ['KZ', 'KF'],
      inputs: [
        { id: 'btnA', label: '按压按钮 A（单步观察 AJ→BJ→CJ→复原）', def: true },
        { id: 'stepMode', label: '暂停在当前时序阶段（方便手动观察）', def: false }
      ],
      rungs: [
        { id: 'aj', label: 'KZ → CJ后 → [按钮A→AJ(3-4) ∥ AJ2组前→AJ(1-2)] → KF', coil: 'AJ', slowRelease: 0.8, contacts: [
          { label: 'CJ后(反馈断)', kind: 'back', on: (s, rl) => !rl.CJ },
          { label: '按钮A ∥ AJ前自闭', kind: 'front', on: (s, rl) => s.btnA || rl.AJ }
        ]},
        { id: 'bj', label: 'KZ → AJ 1组前 → BJ 线圈 → KF', coil: 'BJ', slowRelease: 0.6, contacts: [
          { label: 'AJ 1组前', kind: 'front', on: (s, rl) => rl.AJ }
        ]},
        { id: 'cj', label: 'KZ → BJ 前 → CJ 线圈 → KF（反馈切 AJ!）', coil: 'CJ', slowRelease: 0.6, contacts: [
          { label: 'BJ前', kind: 'front', on: (s, rl) => rl.BJ }
        ]}
      ],
      presets: [
        { label: '▶ 触发脉冲：按钮 A 按下观察 AJ↑→BJ↑→CJ↑→回落', set: { btnA: true, stepMode: false } },
        { label: '⏹ 断开按钮 A（全部复位落下）', set: { btnA: false, stepMode: false } }
      ],
      verdict: (s, rl) => `${s.stepMode ? '⏸ 【已暂停缓放】' : ''}实时时序状态：AJ=${rl.AJ ? '↑' : '↓'} → BJ=${rl.BJ ? '↑' : '↓'} → CJ=${rl.CJ ? '↑' : '↓'}（CJ 吸起后反切 CJ 后接点使链式脉冲自动复原！）`
    },
    {
      id: '4.2.5', ch: 4, page: 63, engine: 'circuit', sub: 'ladder',
      title: '图 4.2.5 · 继电器励磁电路及接通路径举例（含防串电二极管 D）',
      summary: '按教材精准路径：`KZ → DGJ 11-12 → DBJ 21-22 → DJ 11-12 → 二极管 D(1-2) → CJ 线圈(1-4) → KF`。演示任一接点断开或二极管反接/断路均可靠阻断 CJ 励磁。',
      rails: ['KZ', 'KF'],
      inputs: [
        { id: 'DGJ', label: 'DGJ↑ (区段空闲 11-12闭)', def: true },
        { id: 'DBJ', label: 'DBJ↑ (道岔定位 21-22闭)', def: true },
        { id: 'DJ', label: 'DJ↑ (灯丝完好 11-12闭)', def: true },
        { id: 'diodeRev', label: '故障：二极管 D 反向/开路', def: false, fault: true }
      ],
      rungs: [
        { id: 'cj', label: 'KZ → DGJ(11-12) → DBJ(21-22) → DJ(11-12) → D(1-2) → CJ(1-4) → KF', coil: 'CJ', contacts: [
          { label: 'DGJ 11-12', kind: 'front', on: s => s.DGJ },
          { label: 'DBJ 21-22', kind: 'front', on: s => s.DBJ },
          { label: 'DJ 11-12', kind: 'front', on: s => s.DJ },
          { label: '二极管 D(1→2)', kind: 'diode', on: s => !s.diodeRev }
        ]}
      ],
      presets: [
        { label: '① 全条件满足（路径贯通 CJ↑）', set: { DGJ: true, DBJ: true, DJ: true, diodeRev: false } },
        { label: '② 轨道占用 DGJ↓（断开 11-12）', set: { DGJ: false, DBJ: true, DJ: true, diodeRev: false } },
        { label: '③ 二极管 D 反向截止（阻断串电）', set: { DGJ: true, DBJ: true, DJ: true, diodeRev: true } }
      ],
      verdict: (s, rl) => rl.CJ ? '✓ 完整导通路径：KZ → DGJ11-12 → DBJ21-22 → DJ11-12 → D1-2 → CJ1-4 → KF（CJ↑）' : '✕ 励磁路径中断，CJ 可靠落下↓！'
    },
    {
      id: '4.3.1', ch: 4, page: 64, engine: 'circuit', sub: 'ladder',
      title: '图 4.3.1 · 典型的断线防护电路（SJ 闭路链 & 轨道开路式 vs 闭路式对比）',
      summary: '严格按高分辨率核查：(a) `SJ(1-4)` 串 `1LJ前 · 2LJ前 · DGJF前 · FDGJ后`；(b) 开路式断线会掩盖车辆占用（**危险**）；(c) 闭路式断线或分路均使 `GJ↓`（**故障—安全**）！',
      rails: ['KZ / 送电端', 'KF / 受电端'],
      inputs: [
        { id: 'lj1', label: '(a) 1LJ前闭合 (已解锁)', def: true },
        { id: 'lj2', label: '(a) 2LJ前闭合 (已解锁)', def: true },
        { id: 'dgjf', label: '(a) DGJF前闭合 (区段空闲)', def: true },
        { id: 'fdgj', label: '(a) FDGJ吸起 (缓放未落)', def: false },
        { id: 'train', label: '(b)(c) 钢轨上有列车轮对', def: false },
        { id: 'wireBreak', label: '⚡ 注入钢轨/引线断线故障！', def: false, fault: true }
      ],
      rungs: [
        { id: 'a', label: '(a) SJ闭路防护：1LJ前 · 2LJ前 · DGJF前 · FDGJ后 → SJ(1-4)', coil: 'SJ', contacts: [
          { label: '1LJ 1前', kind: 'front', on: s => s.lj1 },
          { label: '2LJ 2前', kind: 'front', on: s => s.lj2 },
          { label: 'DGJF 2前', kind: 'front', on: s => s.dgjf },
          { label: 'FDGJ 后', kind: 'back', on: s => !s.fdgj },
          { label: '线路完好', kind: 'front', on: s => !s.wireBreak }
        ]},
        { id: 'b', label: '(b) 开路式检测(非安全)：仅列车导通两轨才吸起 GJ_开', coil: 'GJ_open', contacts: [
          { label: '列车导通', kind: 'front', on: s => s.train },
          { label: '引线完好', kind: 'front', on: s => !s.wireBreak }
        ]},
        { id: 'c', label: '(c) 闭路式检测(故障-安全)：无车且不断线时 GJ_闭↑', coil: 'GJ_closed', contacts: [
          { label: '无轮对分路', kind: 'back', on: s => !s.train },
          { label: '钢轨引线不断', kind: 'front', on: s => !s.wireBreak }
        ]}
      ],
      presets: [
        { label: '① 正常空闲态（SJ↑ · 闭路GJ↑）', set: { lj1: true, lj2: true, dgjf: true, fdgj: false, train: false, wireBreak: false } },
        { label: '② 列车压入 + 断线故障（揭露开路式隐患！）', set: { lj1: true, lj2: true, dgjf: false, fdgj: true, train: true, wireBreak: true } }
      ],
      verdict: (s, rl) => s.wireBreak
        ? `⚠ 断线故障下：(a) SJ=${rl.SJ ? '↑' : '↓安全锁闭'}；(b) 开路式 GJ_开=${rl.GJ_open ? '↑' : '↓(假装无车!极危险)'}；(c) 闭路式 GJ_闭=↓(报占用，导向安全！)`
        : `正常态：SJ=${rl.SJ ? '↑解锁' : '↓锁闭'} ｜ 闭路式 GJ=${rl.GJ_closed ? '↑空闲' : '↓有车占用'}`
    },
    {
      id: '4.3.2', ch: 4, page: 65, engine: 'circuit', sub: 'ladder',
      title: '图 4.3.2 · 远端供电法混线防护电路（(a)同端危险 vs (b)远端安全）',
      summary: '室外电缆芯线间最易混线：(a) 电源与 DBJ 同在室内而条件 DB 在室外，电缆混线将直接绕过 DB 使 DBJ 误吸；(b) 电源移至 DB 远端后，电缆混线反而**分路短路 DBJ**，杜绝误吸！',
      jump3d: { label: '⚡ 进入 01 五法防混线 3D 实验台', go: { mode: 'bench', type: 'selfHold', shCrossMethod: 'position', shCrossFault: 'active' } },
      rails: ['电源端', '回线端'],
      inputs: [
        { id: 'db', label: '室外控制接点 DB 闭合（正常允许）', def: false },
        { id: 'cross', label: '⚡ 注入室外电缆两线混线故障！', def: true, fault: true }
      ],
      rungs: [
        { id: 'a', label: '(a) 电源与DBJ同端：混线绕过DB直通室内 DBJ（危险误吸!）', coil: 'DBJ_unsafe', contacts: [
          { label: 'DB接点 ∥ 电缆混线旁路!', kind: 'fault', on: s => s.db || s.cross }
        ]},
        { id: 'b', label: '(b) 远端供电法：电源与DB同端，混线将室内 DBJ 短路分流（安全!）', coil: 'DBJ_safe', contacts: [
          { label: '室外 DB 接点', kind: 'front', on: s => s.db },
          { label: '电缆未混线分路', kind: 'back', on: s => !s.cross }
        ]}
      ],
      presets: [
        { label: '① DB断开 + 注入混线（对比安全差异!）', set: { db: false, cross: true } },
        { label: '② DB闭合正常励磁（无混线）', set: { db: true, cross: false } }
      ],
      verdict: (s, rl) => s.cross && !s.db
        ? '🛡 混线防护对比：(a) 同端供电 DBJ 危险误吸↑！ ｜ (b) 远端供电法 DBJ 被混线短路可靠落下↓（故障—安全）！'
        : `DB=${s.db ? '闭合' : '断开'}，(a) DBJ=${rl.DBJ_unsafe ? '↑' : '↓'}，(b) DBJ=${rl.DBJ_safe ? '↑' : '↓'}`
    },
    {
      id: '4.3.3', ch: 4, page: 65, engine: 'circuit', sub: 'ladder',
      title: '图 4.3.3 · 极性法混线防护电路（1JGJ 换极 + 2JGJ 双断 + 反向串联偏极）',
      summary: '1JGJ 两组转换接点交叉换极，2JGJ 串联在去线 Q 与回线 H 双断；受端 `1JBJ`、`2JBJ` 偏极继电器极性相反串联！任何外部固定极性电源混入都无法同时伪造双向可控极性！',
      jump3d: { label: '⚡ 进入 01 极性法防混线 3D 实验台', go: { mode: 'bench', type: 'selfHold', shCrossMethod: 'polarity', shCrossFault: 'active' } },
      rails: ['Q 去线', 'H 回线'],
      inputs: [
        { id: 'jgj1', label: '1JGJ 吸起（决定送出正/反极性）', def: true },
        { id: 'jgj2', label: '2JGJ 吸起（Q/H 双断总控）', def: true },
        { id: 'cross', label: '⚡ 注入电缆 Q-H 混线故障', def: false, fault: true }
      ],
      rungs: [
        { id: 'jbj1', label: '1JGJ↑ 正极性路径 → 2JGJ(Q/H双断) → 1JBJ↑ (偏极正向)', coil: 'JBJ1', contacts: [
          { label: '1JGJ 换极(+) ', kind: 'front', on: s => s.jgj1 },
          { label: '2JGJ 双断闭', kind: 'front', on: s => s.jgj2 },
          { label: '无Q-H短路混线', kind: 'back', on: s => !s.cross }
        ]},
        { id: 'jbj2', label: '1JGJ↓ 反极性路径 → 2JGJ(Q/H双断) → 2JBJ↑ (偏极反向)', coil: 'JBJ2', contacts: [
          { label: '1JGJ 换极(-)', kind: 'back', on: s => !s.jgj1 },
          { label: '2JGJ 双断闭', kind: 'front', on: s => s.jgj2 },
          { label: '无Q-H短路混线', kind: 'back', on: s => !s.cross }
        ]}
      ],
      presets: [
        { label: '① 1JGJ↑·2JGJ↑（1JBJ↑ · 2JBJ↓）', set: { jgj1: true, jgj2: true, cross: false } },
        { label: '② 1JGJ↓·2JGJ↑（极性反转：1JBJ↓ · 2JBJ↑）', set: { jgj1: false, jgj2: true, cross: false } },
        { label: '③ 2JGJ↓ 切断双线（全部落下安全）', set: { jgj1: true, jgj2: false, cross: false } }
      ],
      verdict: (s, rl) => `极性法结果：1JBJ=${rl.JBJ1 ? '↑' : '↓'}，2JBJ=${rl.JBJ2 ? '↑' : '↓'}（两偏极继电器永不同时吸起！）`
    },
    {
      id: '4.3.4', ch: 4, page: 66, engine: 'circuit', sub: 'ladder',
      title: '图 4.3.4 · 双断法混线防护电路（(a)单断混线误吸 vs (b)去/回双断安全）',
      summary: '(a) 仅在去线 Q 串接控制接点，1DBJ 与 3DBJ 去线混线时立即串电使本不该吸起的 `3DBJ` 危险误吸；(b) 在去线 Q、回线 H 同时串入相同控制接点，单处混线无法构成闭合回路！',
      jump3d: { label: '⚡ 进入 01 双断法防混线 3D 实验台', go: { mode: 'bench', type: 'selfHold', shCrossMethod: 'doubleBreak', shCrossFault: 'active' } },
      rails: ['KZ (Q去线)', 'KF (H回线)'],
      inputs: [
        { id: 'c1', label: '1道岔控制接点闭合 (允许 1DBJ↑)', def: true },
        { id: 'c3', label: '3道岔控制接点闭合 (允许 3DBJ↑)', def: false },
        { id: 'qCross', label: '⚡ 注入 1Q 与 3Q 电缆混线故障！', def: true, fault: true }
      ],
      rungs: [
        { id: 'a3', label: '(a) 单断法 3DBJ：仅 Q 线受控，1Q-3Q 混线使 3DBJ 危险误吸!', coil: 'DBJ3_single', contacts: [
          { label: '3Q条件 ∥ 1Q串电!', kind: 'fault', on: s => s.c3 || (s.c1 && s.qCross) },
          { label: '直连公共 KF', kind: 'front', on: () => true }
        ]},
        { id: 'b3', label: '(b) 双断法 3DBJ：Q 与 H 双端切断，1Q-3Q 单处混线仍可靠落下!', coil: 'DBJ3_double', contacts: [
          { label: '3Q 去线(混入1Q)', kind: 'fault', on: s => s.c3 || (s.c1 && s.qCross) },
          { label: '3H 回线独立切断', kind: 'front', on: s => s.c3 }
        ]}
      ],
      presets: [
        { label: '① 1Q与3Q混线（单断误吸 vs 双断安全！）', set: { c1: true, c3: false, qCross: true } },
        { label: '② 正常 3 路导通（双端全闭）', set: { c1: true, c3: true, qCross: false } }
      ],
      verdict: (s, rl) => s.qCross && s.c1 && !s.c3
        ? '🛡 实测对比：(a) 单断法 3DBJ 危险误吸↑！ ｜ (b) 双断法因 H 回线仍断开，3DBJ 保持可靠落下↓！'
        : `单断 3DBJ=${rl.DBJ3_single ? '↑' : '↓'} ｜ 双断 3DBJ=${rl.DBJ3_double ? '↑' : '↓'}`
    },
    {
      id: '4.3.5', ch: 4, page: 66, engine: 'circuit', sub: 'ladder',
      title: '图 4.3.5 · 分路法混线防护电路（及其为何【不属于】故障—安全）',
      summary: 'KJ 落下时用其后接点将 Q、H 短接形成对 `KJF` 线圈的分路。**教材特别警示**：该分路线本身一旦发生**断线故障不受检查**，此时若叠加外来电源混入将使 KJF 误吸，故分路法不属于故障—安全电路！',
      rails: ['KZ / 混入电源', 'KF'],
      inputs: [
        { id: 'kj', label: 'KJ 吸起（正常励磁 KJF）', def: false },
        { id: 'shuntBreak', label: '⚡ 隐蔽故障：KJ后接点分路线断线！', def: false, fault: true },
        { id: 'extCross', label: '⚡ 注入外部混线电源侵入 Q-H！', def: true, fault: true }
      ],
      rungs: [
        { id: 'kjf', label: 'KJ前供电 / 外部混线 → [KJ后分路保护(若未断线)] → KJF线圈', coil: 'KJF', contacts: [
          { label: 'KJ前 ∥ 外部混入电源', kind: 'fault', on: s => s.kj || s.extCross },
          { label: '未被分路线短路', kind: 'front', on: s => s.kj || s.shuntBreak }
        ]}
      ],
      presets: [
        { label: '① 分路线完好 + 外部混线（暂被分路防误吸）', set: { kj: false, shuntBreak: false, extCross: true } },
        { label: '② 隐蔽断线 + 外部混线（KJF 危险误吸！证伪故障-安全）', set: { kj: false, shuntBreak: true, extCross: true } }
      ],
      verdict: (s, rl) => (s.shuntBreak && s.extCross && !s.kj)
        ? '⚠ 隐患暴露：分路线断线平时无法发现，一旦混线侵入即导致 KJF 危险误吸↑！因此教材明确指出分路法不是故障—安全电路。'
        : `当前 KJF=${rl.KJF ? '↑' : '↓'}（尝试点击预设 ② 验证隐蔽断线失效！）`
    },

    // ==================== 第 5 章（15 幅：5.1.1 — 5.3.3） ====================
    {
      id: '5.1.1', ch: 5, page: 67, engine: 'circuit', sub: 'ladder',
      title: '图 5.1.1 · 继电接口电路在联锁系统中的位置（室内外双向隔离闭环）',
      summary: '继电接口电路横跨室内联锁核心（6502 / CBI）与室外设备（信号机 / 转辙机 / 轨道电路）之间，实现强弱电隔离、防混线/断线与室外状态回采。',
      rails: ['联锁核心 (室内)', '室外设备 (现场)'],
      inputs: [
        { id: 'cmdSig', label: '联锁下发：开放信号命令 (LXJ↑)', def: true },
        { id: 'cmdSw', label: '联锁下发：操岔命令 (DCJ/FCJ↑)', def: true },
        { id: 'trackFree', label: '室外钢轨状态：区段空闲 (无分路)', def: true }
      ],
      rungs: [
        { id: 'sig', label: '信号机接口：LXJ/ZXJ 控制点灯 ⇄ DJ/2DJ 监督回采', coil: 'SIG_OK', contacts: [{ label: 'LXJ↑', kind: 'front', on: s => s.cmdSig }, { label: 'DJ↑完好', kind: 'front', on: () => true }] },
        { id: 'sw', label: '道岔接口：1DQJ/2DQJ 驱电机 ⇄ DBJ/FBJ 密贴回采', coil: 'SW_OK', contacts: [{ label: 'DCJ/FCJ↑', kind: 'front', on: s => s.cmdSw }, { label: 'SJ↑未锁', kind: 'front', on: () => true }] },
        { id: 'trk', label: '轨道电路接口：钢轨传输 ⇄ GJ/DGJ 空闲采集', coil: 'GJ_OK', contacts: [{ label: '区段空闲', kind: 'front', on: s => s.trackFree }] }
      ],
      presets: [
        { label: '① 三大接口全链路正常闭环', set: { cmdSig: true, cmdSw: true, trackFree: true } },
        { label: '② 轨道区段被列车分路占用（GJ↓ 回传联锁）', set: { cmdSig: false, cmdSw: false, trackFree: false } }
      ],
      verdict: (s, rl) => `室内外双向接口：信号=${rl.SIG_OK ? '允许开放' : '红灯'} ｜ 道岔=${rl.SW_OK ? '密贴表示' : '保持'} ｜ 轨道=${rl.GJ_OK ? 'GJ↑空闲' : 'GJ↓占用'}`
    },
    {
      id: '5.1.2', ch: 5, page: 69, engine: 'circuit', sub: 'ladder',
      title: '图 5.1.2 · 进站信号机接口电路（全继电器矩阵 + 2DJ 防信号升级仿真）',
      summary: '严格按教材 PDF p.69–70：DJ 串在 H/L/U 共用送电支路，2DJ 串在 2U/YB 第二套支路；双黄 `UU` 与绿黄 `LU` 的第一允许灯回路均串 **2DJ 前接点**，第二黄断丝立即强制降红防信号升级！',
      jump3d: { label: '🚦 进入 2.3 进站信号机 3D 实体建模', go: { mode: 'signal', signalType: 'inStation' } },
      rails: ['BX-30 一次侧 (DJ)', '点灯回线'],
      inputs: [
        { id: 'LXJ', label: 'LXJ↑ (列车允许)', def: true },
        { id: 'ZXJ', label: 'ZXJ↑ (正线直向)', def: false },
        { id: 'TXJ', label: 'TXJ↑ (正线通过)', def: false },
        { id: 'LUXJ', label: 'LUXJ↑ (绿黄次架黄)', def: false },
        { id: 'YXJ', label: 'YXJ↑ (引导接车)', def: false },
        { id: 'DJ2_ok', label: '2U/YB 第二灯丝完好 (2DJ↑)', def: true },
        { id: 'DJ_ok', label: '主/副灯丝完好 (DJ↑)', def: true }
      ],
      rungs: [
        { id: 'H', label: '红灯 H：DJ → LXJ4后 → HB → LXJ6后', coil: 'LAMP_H', contacts: [
          { label: 'DJ↑', kind: 'front', on: s => s.DJ_ok },
          { label: 'LXJ 4后/6后', kind: 'back', on: s => !s.LXJ }
        ]},
        { id: 'L', label: '绿灯 L：LXJ4前 → ZXJ8前 → [TXJ2前 ∥ LUXJ2前·2DJ3前] → LB', coil: 'LAMP_L', contacts: [
          { label: 'DJ↑·LXJ4前·ZXJ8前', kind: 'front', on: s => s.DJ_ok && s.LXJ && s.ZXJ },
          { label: 'TXJ2前 ∥ (LUXJ2前·2DJ3前)', kind: 'front', on: s => s.TXJ || (s.LUXJ && s.DJ2_ok) }
        ]},
        { id: 'U1', label: '第一黄 U：LXJ4前 → [ZXJ8前·TXJ2后·LUXJ2后 ∥ ZXJ8后·2DJ2前] → UB', coil: 'LAMP_U1', contacts: [
          { label: 'DJ↑·LXJ4前', kind: 'front', on: s => s.DJ_ok && s.LXJ },
          { label: '正线单黄 ∥ 侧线2DJ2前', kind: 'front', on: s => (s.ZXJ && !s.TXJ && !s.LUXJ) || (!s.ZXJ && s.DJ2_ok) }
        ]},
        { id: 'U2', label: '第二黄 2U：2DJ → LXJF7前 → (ZXJ7后 ∥ LUXJ1前) → 2UB', coil: 'LAMP_U2', contacts: [
          { label: '2DJ↑·LXJF7前', kind: 'front', on: s => s.DJ2_ok && s.LXJ },
          { label: 'ZXJ7后(UU) ∥ LUXJ1前(LU)', kind: 'front', on: s => (!s.ZXJ || (s.ZXJ && s.LUXJ && !s.TXJ)) }
        ]},
        { id: 'YB', label: '引导月白 YB：2DJ → LXJF7后 → YXJ7前 → YBB', coil: 'LAMP_YB', contacts: [
          { label: '2DJ↑·LXJF7后', kind: 'front', on: s => s.DJ2_ok && !s.LXJ },
          { label: 'YXJ 7前/6前', kind: 'front', on: s => s.YXJ }
        ]}
      ],
      presets: [
        { label: '① H 红灯（常态）', set: { LXJ: false, ZXJ: false, TXJ: false, LUXJ: false, YXJ: false, DJ2_ok: true, DJ_ok: true } },
        { label: '② U 单黄（正线接车）', set: { LXJ: true, ZXJ: true, TXJ: false, LUXJ: false, YXJ: false, DJ2_ok: true, DJ_ok: true } },
        { label: '③ UU 双黄（侧线接车）', set: { LXJ: true, ZXJ: false, TXJ: false, LUXJ: false, YXJ: false, DJ2_ok: true, DJ_ok: true } },
        { label: '④ ⚠ UU 注入 2DJ↓（强制灭U1防升单黄!）', set: { LXJ: true, ZXJ: false, TXJ: false, LUXJ: false, YXJ: false, DJ2_ok: false, DJ_ok: true } },
        { label: '⑤ LU 绿黄（次架黄）', set: { LXJ: true, ZXJ: true, TXJ: false, LUXJ: true, YXJ: false, DJ2_ok: true, DJ_ok: true } },
        { label: '⑥ HB 引导（红+月白）', set: { LXJ: false, ZXJ: false, TXJ: false, LUXJ: false, YXJ: true, DJ2_ok: true, DJ_ok: true } }
      ],
      verdict: (s, rl) => {
        const lit = ['H','L','U1','U2','YB'].filter(k => rl['LAMP_' + k]);
        return lit.length ? `当前亮灯：【${lit.join(' + ')}】` + (s.LXJ && !s.DJ2_ok && (!s.ZXJ || s.LUXJ) ? '（🛡 2DJ↓ 已切断第1允许灯，严防信号升级！）' : '') : '✕ 所有允许灯光熄灭（2DJ↓防升级或 DJ↓ 双断丝安全降级！）';
      }
    },
    {
      id: '5.1.3', ch: 5, page: 73, engine: 'circuit', sub: 'ladder',
      title: '图 5.1.3 · 两方向出站兼调车信号机接口电路（主ZXJ↑ / 反ZXJ↓检3DJ↑ / 调DXJ↑）',
      summary: '严格按教材高分辨率核查（PDF p.73–74）：正向发车 `ZXJ↑` 由 `2LQJ/3LQJ` 选 `L/LU/U`；**反向发车 `ZXJ↓`** 必先经独立支路点亮方向表示器并使 **`3DJ↑`**，再经 `3DJ 1前` 点绿灯 L！',
      jump3d: { label: '🚦 进入 01 灯丝继电器图 5.1.3 模式', go: { mode: 'bench', type: 'filament', filamentSignalSystem: 'outDep', filamentOutAspect: 'L_REV', polarity: 1 } },
      rails: ['BX-30 (DJ / 2DJ / 3DJ)', '回线'],
      inputs: [
        { id: 'LXJ', label: 'LXJ↑ (列车发车)', def: true },
        { id: 'ZXJ', label: 'ZXJ↑ (主方向 / 断开=反向发车)', def: false },
        { id: 'LQJ2', label: '2LQJ↑ (前方≥2闭塞空闲)', def: true },
        { id: 'LQJ3', label: '3LQJ↑ (前方≥3闭塞空闲)', def: true },
        { id: 'DXJ', label: 'DXJ↑ (调车作业)', def: false },
        { id: 'DJ3_ok', label: '方向表示器灯丝完好 (3DJ↑)', def: true }
      ],
      rungs: [
        { id: 'ind', label: '反向方向表示器：3DJ → LXJF6前 → ZXJ1后 → B-BB → LXJF8前', coil: 'IND', contacts: [
          { label: 'LXJ↑·ZXJ1后', kind: 'front', on: s => s.LXJ && !s.ZXJ },
          { label: '表示器灯丝完好', kind: 'front', on: s => s.DJ3_ok }
        ]},
        { id: 'L', label: '绿灯 L：正向(ZXJ8前·2LQJ前·3LQJ前) ∥ 反向(ZXJ8后·3DJ1前)', coil: 'LAMP_L', contacts: [
          { label: 'LXJ4前', kind: 'front', on: s => s.LXJ },
          { label: '正向L ∥ 反向(ZXJ后·3DJ前)', kind: 'front', on: (s, rl) => (s.ZXJ && s.LQJ2) || (!s.ZXJ && rl.IND) }
        ]},
        { id: 'U', label: '黄灯 U：正向 ZXJ前 · (2LQJ后 ∥ 3LQJ后·2DJ)', coil: 'LAMP_U', contacts: [
          { label: 'LXJ4前·ZXJ8前', kind: 'front', on: s => s.LXJ && s.ZXJ },
          { label: '单黄/绿黄支路', kind: 'front', on: s => !s.LQJ2 || (s.LQJ2 && !s.LQJ3) }
        ]},
        { id: 'B', label: '调车白灯 B：LXJ4后 → DXJ2前 → BB', coil: 'LAMP_B', contacts: [
          { label: 'LXJ4后', kind: 'back', on: s => !s.LXJ },
          { label: 'DXJ2前', kind: 'front', on: s => s.DXJ }
        ]},
        { id: 'H', label: '常态红灯 H：LXJ4后 → DXJ2后 → HB', coil: 'LAMP_H', contacts: [
          { label: 'LXJ4后·DXJ2后', kind: 'back', on: s => !s.LXJ && !s.DXJ }
        ]}
      ],
      presets: [
        { label: '① 反向发车：ZXJ↓ → 先亮表示器 3DJ↑ → 再亮 L！', set: { LXJ: true, ZXJ: false, LQJ2: true, LQJ3: true, DXJ: false, DJ3_ok: true } },
        { label: '② ⚠ 反向表示器断丝 3DJ↓（严禁单独亮绿灯 L!）', set: { LXJ: true, ZXJ: false, LQJ2: true, LQJ3: true, DXJ: false, DJ3_ok: false } },
        { label: '③ 主方向 2 闭塞空闲：LU 绿黄', set: { LXJ: true, ZXJ: true, LQJ2: true, LQJ3: false, DXJ: false, DJ3_ok: true } },
        { label: '④ 调车作业：B 月白灯', set: { LXJ: false, ZXJ: false, LQJ2: false, LQJ3: false, DXJ: true, DJ3_ok: true } }
      ],
      verdict: (s, rl) => {
        const out = [];
        if (rl.LAMP_H) out.push('H 红灯');
        if (rl.LAMP_B) out.push('B 月白灯');
        if (rl.LAMP_L) out.push('L 绿灯');
        if (rl.LAMP_U) out.push('U 黄灯');
        if (rl.IND) out.push('方向表示器(3DJ↑)');
        return out.length ? `亮灯显示：【${out.join(' + ')}】` : '🛡 反向方向表示器断丝 (3DJ↓)，已可靠切断绿灯 L 防止误导发车方向！';
      }
    },
    {
      id: '5.1.4', ch: 5, page: 75, engine: 'circuit', sub: 'ladder',
      title: '图 5.1.4 · 调车信号机接口电路（BXG → DJ 5-6 → DXJ 3组 → B/A）',
      summary: '调车信号机采用单灯丝灯泡，隔离变压器 BXG 经 `RD1 → DJ(5-6) → DXJ 第 3 组转换接点` 切换蓝灯 A（后接点，常态禁止）与月白灯 B（前接点，允许调车），共用回线 BAH 经 RD2 回电源。',
      jump3d: { label: '🚦 进入 2.3 调车信号机 3D 建模', go: { mode: 'signal', signalType: 'shuntSig' } },
      rails: ['BXG 隔离电源', 'BAH 回线 (RD2)'],
      inputs: [
        { id: 'DXJ', label: 'DXJ↑ (开放调车白灯)', def: false },
        { id: 'lampOK', label: '单灯丝灯泡完好 (无断丝)', def: true }
      ],
      rungs: [
        { id: 'A', label: '蓝灯 A (常态禁止)：RD1 → DJ(5-6) → DXJ 3后 → AB → BAH', coil: 'LAMP_A', contacts: [
          { label: 'DJ(5-6)', kind: 'front', on: s => s.lampOK },
          { label: 'DXJ 3后', kind: 'back', on: s => !s.DXJ }
        ]},
        { id: 'B', label: '月白灯 B (允许调车)：RD1 → DJ(5-6) → DXJ 3前 → BB → BAH', coil: 'LAMP_B', contacts: [
          { label: 'DJ(5-6)', kind: 'front', on: s => s.lampOK },
          { label: 'DXJ 3前', kind: 'front', on: s => s.DXJ }
        ]}
      ],
      presets: [
        { label: '① 常态蓝灯 A（禁止调车越过）', set: { DXJ: false, lampOK: true } },
        { label: '② 调车允许月白灯 B（DXJ↑）', set: { DXJ: true, lampOK: true } },
        { label: '③ 单灯丝断丝（DJ↓ 灭灯报警）', set: { DXJ: false, lampOK: false } }
      ],
      verdict: (s, rl) => !s.lampOK ? '⚠ 单灯丝断丝 → DJ↓ 报警，按停车信号（蓝灯）严禁越过！' : rl.LAMP_B ? '○ 点亮月白灯 B（准许调车越过）' : '● 点亮蓝灯 A（常态禁止调车越过）'
    },
    {
      id: '5.2.1', ch: 5, page: 77, engine: 'circuit', sub: 'sequence',
      title: '图 5.2.1 · 四线制道岔控制过程（操作→1DQJ→2DQJ→电机→表示时序）',
      summary: '展示 ZD6 四线制单动道岔四级串行控制逻辑链，观察 1DQJ(缓放)、2DQJ(极性保持)、直流电机 M 与 DBJ/FBJ(偏极) 的严谨配合时序。',
      jump3d: { label: '🔧 进入 01 四线制道岔 3D 完整实验台', go: { mode: 'bench', type: 'turnoutLab' } },
      signals: ['FCJ(命令)', '1DQJ(125Ω)', '2DQJ(极性)', '1DQJ(0.44Ω)', '电机M', 'DBJ', 'FBJ'],
      steps: [
        { title: '阶段 0：定位密贴常态', active: ['DBJ'], desc: '道岔在定位，BB AC220V 经 X3、二极管 Z 半波整流驱动偏极 DBJ↑ 吸起，1DQJ↓ 落下。' },
        { title: '阶段 1：发操岔命令 → 1DQJ(3-4 125Ω)励磁吸起', active: ['FCJ(命令)', '1DQJ(125Ω)'], desc: '检 SJ81-82↑ 未锁闭，1DQJ 前圈励磁，断开 DBJ 表示电路。' },
        { title: '阶段 2：2DQJ 转极至反位（1DQJ 铜套缓放跨越）', active: ['FCJ(命令)', '1DQJ(125Ω)', '2DQJ(极性)'], desc: '1DQJ 3/4 前接点接通 2DQJ 反向转极，2DQJ 切开 1DQJ 3-4 启动支路瞬间，靠 1DQJ 铜套缓放维持不落！' },
        { title: '阶段 3：DZ220 经 1DQJ(1-2 0.44Ω)串电机 M 自闭转到底', active: ['2DQJ(极性)', '1DQJ(0.44Ω)', '电机M'], desc: '电机大电流自闭 1DQJ 1-2 线圈（已脱离 SJ 控制），内侧 B 爪先动由 3 排转 4 排备好反转！' },
        { title: '阶段 4：转换到位密贴 → A 爪断开电机 → FBJ↑ 吸起', active: ['2DQJ(极性)', 'FBJ'], desc: '外侧 A 爪由 1 排速动转 2 排切断电机，1DQJ↓ 复原，接通 X2 反位半波表示使 FBJ↑！' }
      ]
    },
    {
      id: '5.2.2', ch: 5, page: 79, engine: 'circuit', sub: 'ladder',
      title: '图 5.2.2 · 单动道岔的四线制控制电路（X1–X4 启动/自闭/表示求解）',
      summary: '严格对照图 5.2.2：启动经 `SJ 81-82 → 1DQJ(3-4) → 2DQJ 141-142/143 → FCJ/DCJ`；动作由 `DZ220 → RD3(5A) → 1DQJ(1-2) → X1/X2 → M → 05-06遮断 → X4` 电流自闭；表示由 `BB → X3 → 04-03/14-13/34-33 → Z → X1/X2 → DBJ/FBJ`！',
      jump3d: { label: '🔧 进入 01 四线制道岔 3D 实验室', go: { mode: 'bench', type: 'turnoutLab' } },
      rails: ['KZ / DZ220 / BB', 'KF / X4 / BB4'],
      inputs: [
        { id: 'sjUp', label: 'SJ 81-82 前接点闭合（道岔未锁闭）', def: true },
        { id: 'fcj', label: '操作命令 FCJ↑（向反位转换）', def: false },
        { id: 'motorRun', label: '动作中：转辙机电机 M 通流（未到位）', def: false },
        { id: 'lidClosed', label: '安全接点 05-06 闭合（机盖已盖好）', def: true },
        { id: 'atRev', label: '道岔已密贴反位（A爪转2排）', def: false },
        { id: 'wireCross', label: '⚡ 故障：X1/X2/X3 外线混线/挤岔', def: false, fault: true }
      ],
      rungs: [
        { id: 'dq1_start', label: '启动励磁：KZ → SJ81-82 → 1DQJ(3-4 125Ω) → FCJ → KF', coil: 'DQJ1_34', contacts: [
          { label: 'SJ 81-82↑', kind: 'front', on: s => s.sjUp },
          { label: 'FCJ 6前', kind: 'front', on: s => s.fcj && !s.atRev }
        ]},
        { id: 'dq1_hold', label: '电机自闭：DZ220 → RD3(5A) → 1DQJ(1-2 0.44Ω) → M → 05-06 → X4', coil: 'DQJ1_12', contacts: [
          { label: '动作通流 M', kind: 'front', on: s => s.motorRun && !s.atRev },
          { label: '遮断器 05-06', kind: 'front', on: s => s.lidClosed }
        ]},
        { id: 'dbj', label: '定位表示：BB → R → X3 → Z → X1 → 1DQJ后 → DBJ(JPXC)', coil: 'DBJ', contacts: [
          { label: '1DQJ↓·定位', kind: 'back', on: (s, rl) => !rl.DQJ1_34 && !rl.DQJ1_12 && !s.atRev },
          { label: '无混线/挤岔', kind: 'back', on: s => !s.wireCross }
        ]},
        { id: 'fbj', label: '反位表示：BB → R → X3 → Z → X2 → 1DQJ后 → FBJ(JPXC)', coil: 'FBJ', contacts: [
          { label: '1DQJ↓·反位', kind: 'front', on: (s, rl) => !rl.DQJ1_34 && !rl.DQJ1_12 && s.atRev },
          { label: '无混线/挤岔', kind: 'back', on: s => !s.wireCross }
        ]}
      ],
      presets: [
        { label: '① 定位密贴常态 (DBJ↑)', set: { sjUp: true, fcj: false, motorRun: false, lidClosed: true, atRev: false, wireCross: false } },
        { label: '② 锁闭态 SJ↓ 企图操岔（技术条件①禁动！）', set: { sjUp: false, fcj: true, motorRun: false, lidClosed: true, atRev: false, wireCross: false } },
        { label: '③ 启动后 SJ↓ 仍由 1DQJ 1-2 串电机自闭转到底！', set: { sjUp: false, fcj: false, motorRun: true, lidClosed: true, atRev: false, wireCross: false } },
        { label: '④ 反位密贴 (FBJ↑)', set: { sjUp: true, fcj: false, motorRun: false, lidClosed: true, atRev: true, wireCross: false } }
      ],
      verdict: (s, rl) => !s.lidClosed ? '🛡 机盖打开遮断器 05-06 断开，电机安全断电停机！' : `1DQJ启动=${rl.DQJ1_34 ? '↑' : '↓'} ｜ 1DQJ电机自闭=${rl.DQJ1_12 ? '↑(脱离SJ转到底)' : '↓'} ｜ DBJ=${rl.DBJ ? '↑' : '↓'} ｜ FBJ=${rl.FBJ ? '↑' : '↓'}`
    },
    {
      id: '5.2.3', ch: 5, page: 80, engine: 'circuit', sub: 'wave', waveType: 'clawKinematics',
      title: '图 5.2.3 · 道岔由定位转换至反位电机动作过程（内侧 B 爪先动 · 外侧 A 爪后动）',
      summary: '核心机械规律：**定位→反位时，内侧 B 爪先由 3 排移至 4 排**（断定位表示并备好反转电路）；到位后**外侧 A 爪速动由 1 排移至 2 排**（断反位电机并接通反位表示 FBJ↑）！',
      errata: '教材 PDF p.80 返定位段末句将定位表示误印为“反位表示电路”，按图 5.2.2/5.2.3 返定位应接通 DBJ 定位表示。',
      controls: [
        { id: 'progress', type: 'range', label: '拖动动作杆行程 (0%定位 → 15%B爪先动 → 100%A爪到位反位)', min: 0, max: 100, step: 5, def: 0 }
      ]
    },
    {
      id: '5.2.4', ch: 5, page: 83, engine: 'circuit', sub: 'ladder',
      title: '图 5.2.4 · 五线制道岔控制电路总图（S700K 三相 380V + X1–X5）',
      summary: 'S700K 三相交流五线制总控逻辑：增加 **DBQ 断相保护器**、**BHJ 保护继电器**与 **1DQJF**，AC 380V 经 X1–X5 换相驱三相异步电机，表示取消滤波电容改用 AC 110V 并联二极管半波电路！',
      jump3d: { label: '⚙ 进入 01 五线制三相道岔 3D 实验室', go: { mode: 'bench', type: 'fiveWireLab' } },
      rails: ['KZ / AC380V / BB110V', 'KF / X1–X5'],
      inputs: [
        { id: 'sjUp', label: 'SJ↑·DGJ↑ 未锁闭空闲', def: true },
        { id: 'cmd', label: 'FCJ↑ 发反位启动命令', def: true },
        { id: 'phaseOK', label: '三相 A/B/C 通流均衡 (DBQ 正常)', def: true },
        { id: 'kClosed', label: '遮断开关 K 闭合（机盖关闭）', def: true },
        { id: 'arrived', label: '转换到位密贴反位', def: false }
      ],
      rungs: [
        { id: 'dq1', label: '1DQJ(3-4启动) / 1DQJ(1-2 经 QDJ·BHJ 自闭)', coil: 'DQJ1', contacts: [
          { label: 'SJ·DGJ·FCJ ∥ BHJ自闭', kind: 'front', on: (s, rl) => (s.sjUp && s.cmd && !s.arrived) || (rl.BHJ && !s.arrived) }
        ]},
        { id: 'dq1f', label: '1DQJF 复示励磁：KZ → BHJ前 · 1DQJ3前 → 1DQJF', coil: 'DQJ1F', contacts: [
          { label: '1DQJ 3前', kind: 'front', on: (s, rl) => rl.DQJ1 },
          { label: 'BHJ↑ (未断相)', kind: 'front', on: s => s.phaseOK && s.kClosed }
        ]},
        { id: 'bhj', label: 'DBQ 断相保护检测三相通流 → 驱动 BHJ↑（缺相即落！）', coil: 'BHJ', contacts: [
          { label: 'A/B/C 三相通流', kind: 'front', on: s => s.phaseOK && s.kClosed && !s.arrived },
          { label: '1DQJ↑ 送三相电', kind: 'front', on: (s, rl) => rl.DQJ1 }
        ]},
        { id: 'fbj', label: '反位表示(图5.2.8)：BB110V → X3/X5 + Z并联 → FBJ↑', coil: 'FBJ', contacts: [
          { label: '1DQJ↓·1DQJF↓·到位', kind: 'front', on: (s, rl) => !rl.DQJ1 && !rl.DQJ1F && s.arrived },
          { label: '遮断开关 K 闭合', kind: 'front', on: s => s.kClosed }
        ]}
      ],
      presets: [
        { label: '① 正常三相启动转换（1DQJ/1DQJF/BHJ 全吸）', set: { sjUp: true, cmd: true, phaseOK: true, kClosed: true, arrived: false } },
        { label: '② ⚠ 注入 B 相断相（DBQ→BHJ↓ 立即停机保护电机！）', set: { sjUp: true, cmd: false, phaseOK: false, kClosed: true, arrived: false } },
        { label: '③ 到位反位密贴（切三相电 → FBJ↑）', set: { sjUp: true, cmd: false, phaseOK: true, kClosed: true, arrived: true } }
      ],
      verdict: (s, rl) => !s.phaseOK ? '🛡 DBQ 检测到缺相，BHJ↓ 立即切断 1DQJ/1DQJF 自闭，防止烧毁三相异步电机！' : `1DQJ=${rl.DQJ1 ? '↑' : '↓'} · 1DQJF=${rl.DQJ1F ? '↑' : '↓'} · BHJ=${rl.BHJ ? '↑' : '↓'} · FBJ=${rl.FBJ ? '↑' : '↓'}`
    },
    {
      id: '5.2.5', ch: 5, page: 84, engine: 'circuit', sub: 'ladder',
      title: '图 5.2.5 · 道岔启动继电器电路（1DQJ + 1DQJF + QDJ/BHJ 协同）',
      summary: '局部精析 S700K 启动级：1DQJ(3-4) 检 SJ/DGJ/2DQJ4组励磁，随后由 `QDJ前 · BHJ 3前` 构成 1DQJ(1-2) 自闭，并同步驱动 `1DQJF` 经 3/4 组接点使 `2DQJ` 转极！',
      rails: ['KZ / QDJ', 'KF'],
      inputs: [
        { id: 'sjDgj', label: 'SJ前 · DGJ前 闭合', def: true },
        { id: 'cmd', label: 'DCJ/FCJ 2前 命令', def: true },
        { id: 'qdj', label: 'QDJ前（切断继电器 13s/30s 未超时）', def: true },
        { id: 'bhj', label: 'BHJ 3前（DBQ 监测三相正常）', def: true }
      ],
      rungs: [
        { id: 'dq1', label: '1DQJ：启动(SJ·DGJ·FCJ) ∥ 自闭(QDJ前·BHJ3前·1DQJ1-2)', coil: 'DQJ1', contacts: [
          { label: '启动支路 ∥ QDJ·BHJ自闭', kind: 'front', on: (s, rl) => (s.sjDgj && s.cmd) || (rl.DQJ1 && s.qdj && s.bhj) }
        ]},
        { id: 'dq1f', label: '1DQJF：KZ → BHJ前 · 1DQJ3前 → 1DQJF → 驱 2DQJ 转极', coil: 'DQJ1F', contacts: [
          { label: 'BHJ前', kind: 'front', on: s => s.bhj },
          { label: '1DQJ 3前', kind: 'front', on: (s, rl) => rl.DQJ1 }
        ]}
      ],
      presets: [
        { label: '① 正常启动+自闭', set: { sjDgj: true, cmd: true, qdj: true, bhj: true } },
        { label: '② 堵转超时 QDJ↓（13s/30s 强制停转！）', set: { sjDgj: false, cmd: false, qdj: false, bhj: true } }
      ],
      verdict: (s, rl) => `1DQJ=${rl.DQJ1 ? '↑' : '↓'}，1DQJF=${rl.DQJ1F ? '↑(已供 2DQJ 转极电源)' : '↓'}`
    },
    {
      id: '5.2.6', ch: 5, page: 84, engine: 'circuit', sub: 'wave', waveType: 'dbqPhaseLoss',
      title: '图 5.2.6 · 断相保护继电器电路（DBQ 三相电流互感检测 + 13s/30s 定时）',
      summary: 'DBQ 并非检测电压，而是用**三只电流互感器实测 A/B/C 三相真实工作电流**！三相均通流才整流输出驱动 BHJ↑，任一相断线/开路或超时(13s/30s)立即切断 BHJ↓ 停机。',
      controls: [
        { id: 'phaseA', type: 'checkbox', label: 'A 相电流正常 (X1→W)', def: true },
        { id: 'phaseB', type: 'checkbox', label: 'B 相电流正常 (X4/X2→V/U)', def: true },
        { id: 'phaseC', type: 'checkbox', label: 'C 相电流正常 (X3/X5→U/V)', def: true },
        { id: 'timeout', type: 'checkbox', label: '达到 13s/30s 堵转保护定时', def: false }
      ]
    },
    {
      id: '5.2.7', ch: 5, page: 85, engine: 'circuit', sub: 'wave', waveType: 'threePhaseMotor',
      title: '图 5.2.7 · 三相交流转辙机动作电路（星接 U/V/W 换相旋转磁场物理仿真）',
      summary: 'A 相经 `X1` 恒接 W 相；**反位动作** B→X4→V、C→X3→U（顺时针旋转磁场）；**定位动作** 经 2DQJ 换相为 B→X2→U、C→X5→V（逆时针反转！）遮断开关 K 串在 U 相，开盖立停！',
      controls: [
        { id: 'dir', type: 'select', label: '选择 2DQJ 换相状态', def: 'rev', options: [
          ['rev', '反位动作 (A→W, B→V, C→U · 顺时针旋转)'],
          ['norm', '定位动作 (A→W, B→U, C→V · 换相逆时针反转!)'],
          ['stop', '到位停转 (1DQJ↓ 切断三相电)']
        ]},
        { id: 'kOpen', type: 'checkbox', label: '打开机盖：遮断开关 K 断开 U 相（缺相停机!）', def: false }
      ]
    },
    {
      id: '5.2.8', ch: 5, page: 86, engine: 'circuit', sub: 'wave', waveType: 's700kHalfWave',
      title: '图 5.2.8 · 三相交流转辙机表示电路（AC 110V 无电容并联二极管半波物理仿真）',
      summary: 'BB 次级 AC 110V，R1=1000Ω，R2=300Ω：**取消四线制电容 C，改将二极管 Z 并联于表示支路**！负半周经电机 V/W 绕组驱 DBJ↑，正半周经 Z+R2+U/W 绕组检验三相绕组与接点完好！',
      controls: [
        { id: 'pos', type: 'select', label: '道岔表示状态与故障测试', def: 'norm', options: [
          ['norm', '定位密贴（X2/X4 构通 → DBJ↑）'],
          ['rev', '反位密贴（X3/X5 构通 → FBJ↑）'],
          ['zOpen', '⚡ 故障：室外二极管 Z 断路（纯交流灌入 → DBJ↓安全!）'],
          ['wireCross', '⚡ 故障：外线混线（偏极无稳定直流分量 → DBJ↓安全!）']
        ]}
      ]
    },
    {
      id: '5.3.1', ch: 5, page: 87, engine: 'circuit', sub: 'wave', waveType: 'rectifierTrack50Hz',
      title: '图 5.3.1 · 交流连续半波整流式轨道电路（BG1-50 · 2.2Ω · BZ4 · JZXC-480）',
      summary: '非电气化区段送端 AC 220V 经 BG1-50 降压 + 2.2Ω/220W 限流送轨，受端经 BZ4 接入 JZXC-480(8、7端) 内部整流驱动。轮对分路或断轨均使轨道电压骤降、GJ 可靠落下！',
      jump3d: { label: '🚆 进入 02 轨道电路 3节复兴号 3D 分路仿真', go: { mode: 'track', type: 'rectifier' } },
      controls: [
        { id: 'shunt', type: 'checkbox', label: '模拟列车轮对低阻分路（0.06 Ω）', def: false },
        { id: 'railBreak', type: 'checkbox', label: '模拟钢轨折断（闭路断线防护）', def: false }
      ]
    },
    {
      id: '5.3.2', ch: 5, page: 88, engine: 'circuit', sub: 'ladder',
      title: '图 5.3.2 · 一送多受并联式轨道电路（(a)一送两受 / (b)一送三受串联检查）',
      summary: '道岔区段设 1 个送电端 BG1-50，主股与侧股分支各设独立受电端 BZ4 + 支 `DGJ₁/DGJ₂`；所有支继电器前接点**串联在主 DGJ 线圈回路中**，任一分支有车或跳线断折即判全区段占用！',
      jump3d: { label: '🚆 进入 02 一送两受 3D 分路仿真', go: { mode: 'track', type: 'rectifier', multi: true } },
      rails: ['BG1-50 送电端', '主 DGJ (JZXC-480)'],
      inputs: [
        { id: 'mainOcc', label: '主股道有车分路', def: false },
        { id: 'br1Occ', label: '分支 1 有车 / 跳线断折 (支 DGJ₁↓)', def: false },
        { id: 'br2Occ', label: '(b) 分支 2 有车 / 跳线断折 (支 DGJ₂↓)', def: false }
      ],
      rungs: [
        { id: 'dgj1', label: '分支 1 受电端：BZ4 → 支 DGJ₁', coil: 'DGJ1', contacts: [{ label: '分支1空闲无断线', kind: 'back', on: s => !s.br1Occ }] },
        { id: 'dgj2', label: '分支 2 受电端 (一送三受)：BZ4 → 支 DGJ₂', coil: 'DGJ2', contacts: [{ label: '分支2空闲无断线', kind: 'back', on: s => !s.br2Occ }] },
        { id: 'main', label: '主受电端：主股受电 · 支DGJ₁前 · 支DGJ₂前 → 主 DGJ(8-7)', coil: 'DGJ_MAIN', contacts: [
          { label: '主股空闲', kind: 'back', on: s => !s.mainOcc },
          { label: '支 DGJ₁ 前', kind: 'front', on: (s, rl) => rl.DGJ1 },
          { label: '支 DGJ₂ 前', kind: 'front', on: (s, rl) => rl.DGJ2 }
        ]}
      ],
      presets: [
        { label: '① 全分支空闲（主 DGJ↑）', set: { mainOcc: false, br1Occ: false, br2Occ: false } },
        { label: '② 仅分支 1 占车（支 DGJ₁↓ 切断主 DGJ↓!）', set: { mainOcc: false, br1Occ: true, br2Occ: false } },
        { label: '③ 仅分支 2 断线（支 DGJ₂↓ 切断主 DGJ↓!）', set: { mainOcc: false, br1Occ: false, br2Occ: true } }
      ],
      verdict: (s, rl) => rl.DGJ_MAIN ? '✓ 主股与全部道岔分支均空闲无断线 → 主 DGJ↑ 吸起！' : '🛡 检测到主股或分支占用/断线 → 主 DGJ↓ 可靠落下，严禁转换道岔与开放信号！'
    },
    {
      id: '5.3.3', ch: 5, page: 88, engine: 'circuit', sub: 'wave', waveType: 'phaseTorque25Hz',
      title: '图 5.3.3 · 一送两受 25 Hz 相敏轨道电路（BE25 扼流 + 相位差转矩物理仿真）',
      summary: '电气化区段 50 Hz 牵引回流经 BE25 中心抽头平衡回流，25 Hz 信号送轨道线圈 3-4，局部线圈 1-2 接 JZ110/JF110（并电容 C）。调节相位差观测电磁转矩 $T \\propto I_g I_l \\sin\\Delta\\varphi$：**90° 正向吸起、180° 反相倒转保护绝缘破损！**',
      jump3d: { label: '🚆 进入 02 25Hz 相敏轨道 3D 仿真', go: { mode: 'track', type: 'phase' } },
      controls: [
        { id: 'angle', type: 'range', label: '轨/局线圈相位差 Δφ（90°理想吸起 / 270°绝缘破损反相!）', min: 0, max: 360, step: 15, def: 90 },
        { id: 'freq50', type: 'checkbox', label: '叠加 50 Hz 电气化牵引干扰（验证 25 Hz 相敏天然抑制！）', def: true },
        { id: 'localOff', type: 'checkbox', label: '切断 25 Hz 局部电源 (1-2)', def: false }
      ]
    },

    // ==================== 第 6 章（11 幅：6.1.1 — 6.4.1） ====================
    {
      id: '6.1.1', ch: 6, page: 92, engine: 'circuit', sub: 'ladder',
      title: '图 6.1.1 · 站场型网路电路举例（1#、3# 换位双检选通 ⅠG/ⅡG/3G）',
      summary: '展示 6502 站场型网路灵魂：按站场地理拓扑串接 `AGJ前 · 1-3DGJ前`，在 1# 与 3# 分支**同时使用一表示继电器前接点与另一表示继电器后接点**（如 `1FBJ前·1DBJ后`）严格验证道岔位置！',
      rails: ['KF — XJ', 'ⅠG / ⅡG / 3G 分支'],
      inputs: [
        { id: 'agj', label: 'AGJ↑ · 1-3DGJ↑ (区段空闲)', def: true },
        { id: 'sw1', label: '1# 道岔定位 (1DBJ↑ · 1FBJ↓)', def: true },
        { id: 'sw3', label: '3# 道岔定位 (3DBJ↑ · 3FBJ↓)', def: true }
      ],
      rungs: [
        { id: 'g1', label: '选 1G 支路：AGJ前 · 1-3DGJ前 · 1FBJ前 · 1DBJ后 → 1G', coil: 'G1', contacts: [
          { label: 'AGJ·1-3DGJ前', kind: 'front', on: s => s.agj },
          { label: '1FBJ前·1DBJ后(1反)', kind: 'front', on: s => !s.sw1 }
        ]},
        { id: 'g2', label: '选 ⅡG 支路：AGJ前 · 1-3DGJ前 · 1DBJ前 · 3DBJ前 → ⅡG', coil: 'G2', contacts: [
          { label: 'AGJ·1-3DGJ前', kind: 'front', on: s => s.agj },
          { label: '1DBJ前(1定)', kind: 'front', on: s => s.sw1 },
          { label: '3DBJ前(3定)', kind: 'front', on: s => s.sw3 }
        ]},
        { id: 'g3', label: '选 3G 支路：AGJ前 · 1-3DGJ前 · 1DBJ前 · 3DBJ后 · 3FBJ前 → 3G', coil: 'G3', contacts: [
          { label: 'AGJ·1-3DGJ前', kind: 'front', on: s => s.agj },
          { label: '1DBJ前(1定)', kind: 'front', on: s => s.sw1 },
          { label: '3DBJ后·3FBJ前(3反)', kind: 'front', on: s => !s.sw3 }
        ]}
      ],
      presets: [
        { label: '① 1定 · 3定 → 唯一接通 ⅡG', set: { agj: true, sw1: true, sw3: true } },
        { label: '② 1定 · 3反 → 唯一接通 3G', set: { agj: true, sw1: true, sw3: false } },
        { label: '③ 1反 → 唯一接通 1G', set: { agj: true, sw1: false, sw3: true } }
      ],
      verdict: (s, rl) => `站场型网路唯一导通分支：${rl.G1 ? '1G' : rl.G2 ? 'ⅡG' : rl.G3 ? '3G' : '无(区段占用断开)'}（形同站场几何平面，天然互斥防串通！）`
    },
    {
      id: '6.2.1', ch: 6, page: 94, engine: 'circuit', sub: 'rack', rackType: 'system6502',
      title: '图 6.2.1 · 6502 电气集中联锁系统组成示意（室内外全设备交互）',
      summary: '点击各核心设备查看信号/供电路径：单元控制台 & 区段人工解锁盘 → 继电器组合架（核心 1–15 线联锁运算）→ 室内外分线盘 → 室外电缆 → 信号机/转辙机/轨道电路，由电源屏统一供交直流电源！'
    },
    {
      id: '6.2.2', ch: 6, page: 95, engine: 'circuit', sub: 'rack', rackType: 'console6502',
      title: '图 6.2.2 · 单元控制台盘面（可操作按钮与光带模拟盘）',
      summary: '按真实 6502 值班员操作规程点击盘面双按钮：先按始端 `XLA`、再按终端 `SⅠLA` 锁闭白光带并亮绿复示灯；可操作 `ZQA` 总取消、`ZRA` 总人解与 `YZA` 引导总锁闭！'
    },
    {
      id: '6.2.3', ch: 6, page: 95, engine: 'circuit', sub: 'rack', rackType: 'sgaPanel',
      title: '图 6.2.3 · 区段人工解锁按钮盘（破铅封 SGA + ZRA 双按钮实操）',
      summary: '用于分路不良遗留白光带的区段故障解锁（图 9.6.1）：必须人工确认区段无车（DGJF↑）且不在运行前方（QJJ↓），同时按下对应区段事故按钮 **SGA** 与 **总人解按钮 ZRA**！'
    },
    {
      id: '6.2.4', ch: 6, page: 96, engine: 'circuit', sub: 'rack', rackType: 'relayRack',
      title: '图 6.2.4 · 继电器组合架示意（11 层标准组合架交互透视）',
      summary: '6502 组合架共 11 层：第 1–10 层每层装设 1 个定型继电器组合（每组合含 10 槽继电器位），最顶部第 11 层为零层（电源端子与熔断器层）。点击任意层查看配线与槽位！'
    },
    {
      id: '6.2.5', ch: 6, page: 97, engine: 'circuit', sub: 'rack', rackType: 'powerScreen',
      title: '图 6.2.5 · 电源屏（双路主/副电源自动切换与多路交直流母线仿真）',
      summary: '两路独立外电网 AC 380V 输入，经自动倒机切换与隔离稳压输出 **DC 220V(道岔动作)、DC 24V(KZ/KF 继电逻辑)、AC 220V(信号点灯)、AC 380V(三相转辙机)、AC 24V(表示/轨道)**！'
    },
    {
      id: '6.3.1', ch: 6, page: 101, engine: 'circuit', sub: 'rack', rackType: 'comboWiring',
      title: '图 6.3.1 · 典型小站的下行咽喉组合连接图（12 种定型组合 + 1–15 线束）',
      summary: '将图 3.1.1 下行咽喉每架信号机、每组道岔与每个区段映射为标准定型组合（`LXZ/1LXF/YX/DX/DD/SDZ/SDF/Q/F`），点击任意组合模块高亮其接入的 `1–15` 条网路线束！'
    },
    {
      id: '6.3.2', ch: 6, page: 101, engine: 'circuit', sub: 'ladder',
      title: '图 6.3.2 · 进路按钮继电器电路（XLA → AJ 3-4 励磁与 1-2 自闭复原）',
      summary: '按压 XLA 使 `AJ(3-4)` 励磁，随后由 `KZ → XJ1后 → QJ6后 → FKJ2后 → JXJ6后 → AJ7前 → AJ(1-2) → KF` 自闭；一旦选路完成 `JXJ↑` 或取消 `QJ↑`，立即切断自闭自动复原！',
      rails: ['KZ', 'KF'],
      inputs: [
        { id: 'xla', label: '按压进站按钮 XLA（自复式）', def: false },
        { id: 'jxj', label: '选路已通过：JXJ 6组吸起（复原切 AJ!）', def: false },
        { id: 'fkj', label: 'FKJ 2组吸起', def: false },
        { id: 'qj', label: '取消继电器 QJ 6组吸起', def: false },
        { id: 'xj', label: '信号已开放 XJ 1组吸起', def: false }
      ],
      rungs: [
        { id: 'aj', label: 'AJ(3-4 按钮励磁) ∥ AJ(1-2 经 XJ后·QJ后·FKJ后·JXJ后·AJ7前自闭)', coil: 'AJ', slowRelease: 0.4, contacts: [
          { label: '按压 XLA', kind: 'btn', on: s => s.xla }
        ], altBranch: {
          label: '1-2 自闭保持链',
          contacts: [
            { label: 'XJ1后·QJ6后', kind: 'back', on: s => !s.xj && !s.qj },
            { label: 'FKJ2后·JXJ6后', kind: 'back', on: s => !s.fkj && !s.jxj },
            { label: 'AJ 7前自闭', kind: 'front', on: (s, rl) => rl.AJ }
          ]
        }}
      ],
      presets: [
        { label: '① 按压 XLA（AJ 3-4 励磁吸起）', set: { xla: true, jxj: false, fkj: false, qj: false, xj: false } },
        { label: '② 松开 XLA（靠 1-2 线圈自闭记录按钮！）', set: { xla: false, jxj: false, fkj: false, qj: false, xj: false } },
        { label: '③ 选路完成 JXJ↑（自动切断 AJ 复原↓）', set: { xla: false, jxj: true, fkj: false, qj: false, xj: false } }
      ],
      verdict: (s, rl) => rl.AJ ? '✓ AJ↑ 已记录按钮按压（松手仍自闭保持，等待后续选路完成自动复原）' : '○ AJ↓ 已复原/待机状态'
    },
    {
      id: '6.3.3', ch: 6, page: 102, engine: 'circuit', sub: 'ladder',
      title: '图 6.3.3 · 进路按钮继电器完整电路示例（D7A 与 D3AJ 互带关系）',
      summary: 'D7A 自复式按钮励磁 `D7AJ(3-4)`，自闭经 `KZ-列共-Q → D3AJ 4后 → D7AJ(1-2) → D7AJ6前 → D7JXJ6后 → D7FKJ3后 → D7QJ7后 → D7XJ7后 → KF`，体现差置信号机防同时误按！',
      rails: ['KZ-列共-Q', 'KF'],
      inputs: [
        { id: 'd7a', label: '按压 D7A 按钮', def: false },
        { id: 'd3aj', label: '对方差置 D3AJ↑（断开第4组后接点!）', def: false },
        { id: 'd7jxj', label: 'D7JXJ↑（选路通过自动复原）', def: false }
      ],
      rungs: [
        { id: 'd7aj', label: 'D7A→D7AJ(3-4) ∥ KZ-列共-Q→D3AJ4后→D7AJ(1-2)→D7AJ6前→JXJ/FKJ/QJ/XJ后', coil: 'D7AJ', contacts: [
          { label: '按压 D7A', kind: 'btn', on: s => s.d7a }
        ], altBranch: {
          label: 'D7AJ 1-2 自闭保持链',
          contacts: [
            { label: 'D3AJ 4后(互锁)', kind: 'back', on: s => !s.d3aj },
            { label: 'D7AJ 6前', kind: 'front', on: (s, rl) => rl.D7AJ },
            { label: 'D7JXJ6后', kind: 'back', on: s => !s.d7jxj }
          ]
        }}
      ],
      presets: [
        { label: '① 按 D7A 吸起', set: { d7a: true, d3aj: false, d7jxj: false } },
        { label: '② 松手保持自闭', set: { d7a: false, d3aj: false, d7jxj: false } },
        { label: '③ D7JXJ↑ 自动复原', set: { d7a: false, d3aj: false, d7jxj: true } }
      ],
      verdict: (s, rl) => `D7AJ=${rl.D7AJ ? '↑(已记录)' : '↓(复原)'}`
    },
    {
      id: '6.3.4', ch: 6, page: 102, engine: 'circuit', sub: 'ladder',
      title: '图 6.3.4 · KJ 电路的部分电路（跨 LXZ → Q → SDZ/SDF → DX 组合边界 7 线）',
      summary: '横跨 4 个组合虚框展示 7 线选排一致检查：终端供 KZ 经 `ZJ/FKJ`、沿途道岔 `1SJ前 · DBJ前 · DCJ前` 送至始端 `JXJ后 → KJ(3-4)`，吸起后经 `KJ8前` 与 `QJJ4后 ∥ 1LJ/2LJ前` 保持！',
      rails: ['终端 KZ (7线)', '始端 KF'],
      inputs: [
        { id: 'swMatch', label: '道岔 1/3 选排一致 (DCJ↑·DBJ↑)', def: true },
        { id: 'sjUp', label: '1SJ↑（尚未锁闭，处于7线选排阶段）', def: true },
        { id: 'jxjDown', label: '选路复原完毕 (JXJ↓ 后接点闭)', def: true },
        { id: 'locked', label: '进入锁闭保持阶段 (QJJ↑ 或 1LJ/2LJ↓)', def: false }
      ],
      rungs: [
        { id: 'kj', label: '7线励磁(ZJ/FKJ·1SJ前·DBJ·DCJ·JXJ后→KJ3-4) ∥ KJ1-2(QJJ/LJ保持)', coil: 'KJ', contacts: [
          { label: '1SJ↑(未锁)', kind: 'front', on: s => s.sjUp },
          { label: 'DCJ·DBJ 一致', kind: 'front', on: s => s.swMatch },
          { label: 'JXJ 后', kind: 'back', on: s => s.jxjDown }
        ], altBranch: {
          label: 'KJ 1-2 锁闭保持链',
          contacts: [
            { label: 'KJ 8前自闭', kind: 'front', on: (s, rl) => rl.KJ },
            { label: 'QJJ↑ / 1LJ↓ / 2LJ↓', kind: 'front', on: s => s.locked }
          ]
        }}
      ],
      presets: [
        { label: '① 选排一致 → 7 线励磁 KJ↑', set: { swMatch: true, sjUp: true, jxjDown: true, locked: false } },
        { label: '② 转入进路锁闭（1SJ↓ 切 7 线，靠 QJJ↑ 保持 KJ↑！）', set: { swMatch: true, sjUp: false, jxjDown: true, locked: true } },
        { label: '③ ⚠ 道岔失表示 DBJ↓（阻断 7 线，KJ 严禁吸起！）', set: { swMatch: false, sjUp: true, jxjDown: true, locked: false } }
      ],
      verdict: (s, rl) => rl.KJ ? '✓ KJ↑ 吸起：确认道岔选排一致，进入第 8 线联锁检查与锁闭阶段！' : '✕ KJ↓：道岔位置不符或进路已完全解锁复原。'
    },
    {
      id: '6.4.1', ch: 6, page: 104, engine: 'circuit', sub: 'rack', rackType: 'console6502',
      title: '图 6.4.1 · 某车站单元控制台盘面（①–⑧ 功能区全操作仿真）',
      summary: '标注教材 ① 列车按钮、② 调车按钮、③ 总定位/总反位、④ 单操、⑤ 单锁、⑥ 总取消/总人解、⑦ 引导按钮、⑧ 轨道光带与表示灯，直接点选盘面体验完整 6502 操作流程！'
    }
  ];

  root.FigDataCircuitA = CIRCUIT_FIGURES_A;
  if (typeof module !== 'undefined' && module.exports) module.exports = CIRCUIT_FIGURES_A;
})(typeof window !== 'undefined' ? window : globalThis);
