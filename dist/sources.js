(function (root) {
  'use strict';
  // 型号参数、功能原理与装配细节的依据分别见各项。几何尺寸及安装位置未经厂家图核实。
  const models = {
    contacts: {
      model: 'JWXC-1700', category: '无极继电器的接点与常态', contacts: '8QH（11中·12前·13后）',
      complete: 8, frontOnly: 0, backOnly: 0, reinforced: 0, codingPins: '11, 51',
      resistance: '2 × 850 Ω', rated: 'DC 24 V', working: '正向 ≤16.8 V；反向 ≤18.4 V', release: '≥3.4 V',
      freeContactState: '失电自由态：前接点(11-12)常开断开 · 后接点(11-13)常闭闭合',
      railwayNormalState: '按用途定常态（图4.1.7）：作 GJ/SJ/1LJ/2LJ/CJ/ZCJ/JYJ 时常态吸起 ↑（平时 11-12 闭合、11-13 断开）；作 XJ(LXJ/DXJ)/AJ/DCJ/FCJ/KJ/XJJ/QJJ 时常态落下 ↓（平时 11-13 闭合、11-12 断开）',
      figures: ['4-1-6', '4-1-7', '4-1-3', '4-1-1'], pages: [54, 55, 57, 58, 59, 60],
      geometry: '聚焦图4.1.3、4.1.6、4.1.7及表4.1.3：展示上/下托片、中/前/后接点（11/12/13）先断后接转换，严格区分电工“常开/常闭”与铁路“常态（↑或↓）”。'
    },
    neutral: {
      model: 'JWXC-1700', category: '无极继电器', contacts: '8QH',
      complete: 8, frontOnly: 0, backOnly: 0, reinforced: 0, codingPins: '11, 51',
      resistance: '2 × 850 Ω', rated: 'DC 24 V', working: '正向 ≤16.8 V；反向 ≤18.4 V', release: '≥3.4 V',
      freeContactState: '失电自由态：前接点(11-12)常开断开 · 后接点(11-13)常闭闭合',
      railwayNormalState: '铁路常态依所代表设备常态与安全侧确定（表7.1.1/8.1.1/9.2.1）：如 SJ、1LJ、2LJ、CJ、ZCJ、JYJ 常态为吸起 ↑（平时前接点11-12闭合）；AJ、LJJ、JXJ、FKJ、KJ、XJJ、QJJ、LXJ、DXJ 常态为落下 ↓（平时后接点11-13闭合）',
      figures: ['4-1-1', '4-1-3', '4-1-7'], pages: [54, 55, 56, 58, 60],
      geometry: '图4.1.1、4.1.3提供线圈、磁路、衔铁与接点关系，表4.1.4提供8QH配置。模型按功能展开，重锤层数、材料、螺母与拉杆形状未经装配图核实。'
    },
    slowRelease: {
      model: 'JWXC-H340', category: '无极缓放继电器', contacts: '8QH',
      complete: 8, frontOnly: 0, backOnly: 0, reinforced: 0, codingPins: '12, 52',
      resistance: '2 × 170 Ω', rated: 'DC 24 V', working: '正向 ≤11.5 V；反向 ≤12.6 V', release: '≥2.3 V；缓放 ≥0.45—0.5 s',
      freeContactState: '失电自由态：前接点(11-12)常开断开 · 后接点(11-13)常闭闭合',
      railwayNormalState: '作反位轨道复示继电器 FDGJ 时：常态为落下 ↓（表8.1.1/9.2.1，平时后接点 11-13 闭合、前接点 11-12 断开；区段锁闭后占用时吸起，出清后缓放 3—4 s 落下）',
      figures: ['4-1-2', '4-2-4', '4-1-3'], pages: [55, 58, 60, 62, 63, 91, 134, 172],
      geometry: '按表4.1.4展示8QH与缓放参数，阻尼部件仅作功能示意。槽形、厚度、具体安装位置未经实物资料核实。24V演示取0.5s，18V表列下限为0.45s。'
    },
    heavySlow: {
      model: 'JWJXC-H125/0.44', category: '加强接点无极缓放继电器', contacts: '2QJ + 2H + 2QH',
      complete: 2, frontOnly: 2, backOnly: 2, reinforced: 2, codingPins: '15, 55',
      resistance: '前圈 125 Ω / 后圈 0.44 Ω', rated: 'DC 24 V / 2 A', working: '≤12 V（反向 ≤14.4 V）', release: '≥2.5 V；缓放 >0.35—0.45 s',
      freeContactState: '失电自由态：2QJ与2QH的前接点常开断开 · 2H与2QH的后接点常闭闭合',
      railwayNormalState: '作道岔一启动继电器 1DQJ 时：常态为落下 ↓（表5.2.1，PDF p.77：平时道岔不转，后接点 11-13 闭合以接通道岔表示电路，加强前接点断开；转岔时励磁吸起）',
      figures: ['4-1-2', '5-2-1', '5-2-3'], pages: [55, 58, 60, 77, 78, 79, 80, 81],
      geometry: '图4.1.2与表4.1.4给出125Ω/0.44Ω及2QJ+2H+2QH。线材形状、阻尼套与灭弧部件位置作功能示意，未核实厂家装配。24V缓放演示取0.46s，表列要求大于0.45s。'
    },
    differential: {
      model: 'JWXC-370/480', category: '双异阻无极继电器', contacts: '2QH + 2Q',
      complete: 2, frontOnly: 2, backOnly: 0, reinforced: 0, codingPins: '22, 52',
      resistance: '前圈 370 Ω / 后圈 480 Ω', rated: '前 18 mA / 后 17.2 mA', working: '前 ≤12 mA / 后 ≤11.5 mA', release: '前 ≥3.8 mA / 后 ≥3.6 mA',
      freeContactState: '失电自由态：4组前接点(2QH+2Q)常开断开 · 2组后接点(2QH)常闭闭合',
      railwayNormalState: '铁路常态依具体监督支路定义：失电时后接点(11-13)闭合、前接点(11-12)断开；通入 ≥12 mA / 11.5 mA 工作电流吸起时前接点闭合',
      figures: ['4-1-2', '4-1-3'], pages: [55, 60, 61],
      geometry: '按表4.1.4及表4.1.5复建：前圈370 Ω与后圈480 Ω独立分接引出、按电流值(mA)整定，接点配置为2组完整前后接点(2QH)加2组单前接点(2Q)。'
    },
    biased: {
      model: 'JPXC-1000', category: '偏极继电器', contacts: '8QH',
      complete: 8, frontOnly: 0, backOnly: 0, reinforced: 0, codingPins: '14, 51',
      resistance: '2 × 500 Ω', rated: 'DC 24 V', working: '≤16 V；1正4负才吸起', release: '≥4 V；反向200 V不吸（表列）',
      freeContactState: '失电或反极性态：L形永磁铁吸住衔铁，前接点(11-12)常开断开 · 后接点(11-13)常闭闭合',
      railwayNormalState: '作道岔定位表示继电器 DBJ 时：常态为吸起 ↑（图4.1.7a、表5.2.1：道岔常态在定位，平时 1正4负通电使前接点 11-12 闭合、后接点 11-13 断开）；作反位表示继电器 FBJ 时：常态为落下 ↓（平时后接点 11-13 闭合、前接点 11-12 断开）',
      figures: ['4-1-4', '4-1-7', '5-2-1'], pages: [56, 58, 60, 77, 81],
      geometry: '磁系统按图4.1.4：极靴下方一体L形永久磁铁（上N红、下S蓝）构成局部永磁保持回路 Φ永，与线圈控制磁通 ΦK 区分建模；接点按表4.1.4为8QH。'
    },
    latching: {
      model: 'JYJXC-220/220', category: '极性保持加强接点继电器', contacts: '2DFJ + 2DF',
      complete: 4, frontOnly: 0, backOnly: 0, reinforced: 2, codingPins: '15, 54',
      resistance: '220 Ω / 220 Ω', rated: 'DC 24 V', working: '转极值 10—16 V（表列）', release: '断电保持定位/反位（表中保持力数字暂不用于仿真）',
      freeContactState: '双稳态永磁保持：无单稳态“常开/常闭”之分；定位时定位接点(111-112)闭合，反位时反位接点(111-113)闭合',
      railwayNormalState: '作道岔二启动继电器 2DQJ 时：常态为“定位”（表4.1.3、表5.2.1，PDF p.59、77：平时线圈无电，由永磁铁保持在定位状态，定位接点 111—112 平常闭合导通，反位接点 111—113 平常断开）',
      figures: ['4-1-5', '5-2-1', '5-2-3'], pages: [56, 57, 59, 60, 77, 80, 81],
      geometry: '磁路依据通用图4.1.5，具体型号参数与2DFJ+2DF来自表4.1.4。接点111中/112定/113反见表4.1.3。加强接点附件形状与位置未经厂家装配图核实。'
    },
    rectifier: {
      model: 'JZXC-480', category: '交流整流式轨道继电器', contacts: '4QH + 2Q',
      complete: 4, frontOnly: 2, backOnly: 0, reinforced: 0, codingPins: '13, 55',
      resistance: '2 × 240 Ω', rated: 'AC 18 V', working: '≤AC 8.5 V', release: '表4.1.4为≥AC 4.3 V（续表4.8 V）',
      freeContactState: '失电自由态：6组前接点(4QH+2Q)常开断开 · 4组后接点(4QH)常闭闭合',
      railwayNormalState: '作轨道继电器 GJ / DGJ 时：常态为吸起 ↑（第4.1.2节例2、图4.1.7b、第5.3.1节，PDF p.57—58、87：轨道区段平时无车空闲，GJ 持续受电吸起，平时全部前接点 11-12 闭合导通、后接点 11-13 断开；列车分路或断轨时落下导向安全侧）',
      figures: ['5-3-1', '5-3-2', '4-1-7'], pages: [57, 58, 60, 61, 87, 88],
      geometry: '表4.1.4给出4QH+2Q，图5.3.1给出整流式接口。接点按功能展开，教材未提供内部整流器装配位置，模型不设置该部件实体。'
    },
    filament: {
      model: 'JZXC-H62（DJ）', category: '整流式灯丝检查缓放继电器', contacts: '4QH',
      complete: 4, frontOnly: 0, backOnly: 0, reinforced: 0, codingPins: '13, 53',
      resistance: '2 × 31 Ω（低阻电流型）', rated: '与 BX-30 变压器配合', working: '冷丝吸合 (12V 15W) < AC 110 V', release: '断丝释放 (12V 25W) > AC 240 V；缓放 >0.15 s',
      freeContactState: '失电自由态：前接点(11-12)常开断开 · 后接点(11-13)常闭闭合',
      railwayNormalState: '作 1灯丝继电器 DJ 及灯丝转换继电器 DZJ 时：常态为吸起 ↑（表5.1.1，PDF p.68：信号机常态点亮禁止灯光 H 且主灯丝完好，DJ、DZJ 平时持续吸起，前接点 11-12 平常闭合、后接点 11-13 断开）；作 2灯丝继电器 2DJ 时：常态为落下 ↓（平时第二灯位灭灯，后接点 11-13 闭合）',
      figures: ['5-1-2', '5-1-3', '4-1-2'], pages: [58, 59, 60, 68, 69, 71, 72, 73, 74],
      geometry: '表4.1.4给出2×31Ω、4QH及缓放大于0.15s，图5.1.2给出点灯监督关系。阻尼部件仅作功能示意，内部整流器位置未载。演示缓放取0.16s。'
    },
    timeRelay: {
      model: 'JSBXC-850（3′）', category: '半导体时间继电器', contacts: '功能示意4组转换接点（型号配置未核实）',
      complete: 4, frontOnly: 0, backOnly: 0, reinforced: 0, codingPins: '表4.1.2符号 3′',
      resistance: '本项未核实', rated: '本项未核实', working: '通电经规定延时后吸起', release: '断电立即释放复原',
      freeContactState: '失电自由态：前接点(11-12)常开断开 · 后接点(11-13)常闭闭合',
      railwayNormalState: '在人工延时解锁电路中：常态为落下 ↓（表9.2.1，PDF p.172、200：平时不办理人工解锁，时间继电器失电落下，后接点 11-13 平常闭合、前接点 11-12 平常断开；办理总人解 ZRA 时启动计时）',
      figures: ['4-2-4', '4-1-2'], pages: [47, 48, 55, 58, 63, 172, 200, 274],
      geometry: 'JSBXC-850型号见附录2续表（书264/PDF274），延时功能见第9.5节，符号见表4.1.2。当前通用机构与4组接点为功能示意，数量及内部装配未核实，已移除推测的电路板和电容位置。'
    },
    phase: {
      model: '二元二位轨道继电器（GJ）', category: '25 Hz 相敏轨道继电接口', contacts: '教材本节未列总数（示意11-12-13）',
      complete: 0, frontOnly: 0, backOnly: 0, reinforced: 0, codingPins: '本节未列',
      resistance: '本节未列', rated: '按图5.3.3的轨道3-4／局部1-2接口', working: '电流、25 Hz频率、规定相位差同时符合', release: '分路、失电或频相不符落下（反相产生反向转矩）',
      freeContactState: '失电自由态：翼片靠重锤返回落下，前接点(11-12)常开断开 · 后接点(11-13)常闭闭合',
      railwayNormalState: '作 25 Hz 相敏轨道电路 GJ 时：常态为吸起 ↑（第5.3.2节，PDF p.88—89：区段平时空闲，轨道线圈3-4与局部线圈1-2同时满足25 Hz频率与理想相位差，GJ 常态吸起，前接点 11-12 平常闭合导通、后接点 11-13 平常断开）',
      figures: ['5-3-3', '4-1-7'], pages: [58, 88, 89],
      geometry: '左侧按图5.3.3还原轨道3-4（并接Z、HF）与局部1-2（并接C）接口；右侧为补充原理示意，未绑定具体型号及装配图，翼片、磁极、接点形状与位置不作实物依据。'
    },
    selfHold: {
      model: 'AJ + FUJ（图4.2.2）', category: '第4.2/4.3节 自闭电路与断线/混线防护', contacts: '启动支路 + AJ前接点(11-12)自闭支路 + FUJ后接点(11-13)共用支路',
      complete: 0, frontOnly: 0, backOnly: 0, reinforced: 0, codingPins: '教材图4.2.2 / 图4.3.1—4.3.2',
      resistance: 'AJ (JWXC-1700) + FUJ (JWXC-1700)', rated: 'KZ / KF (DC 24 V)', working: '按下自复按钮 A 启动 → 松手后经 AJ11-12 自闭保持', release: 'FUJ 吸起断开 11-13 或共用线断线时立即失磁落下',
      freeContactState: '自复按钮 A：平时常开断开，按下闭合、松手自动弹起断开',
      railwayNormalState: 'AJ 与 FUJ 常态均为落下 ↓（平时 AJ 前接点 11-12 断开，FUJ 后接点 11-13 闭合导通）',
      figures: ['4-2-2', '4-3-1', '4-3-2', '4-3-3', '4-3-4', '4-3-5'], pages: [62, 63, 64, 65, 66],
      geometry: '同台建立 FUJ（共用条件）、自复按钮 A（启动支路）与 AJ（自闭记录）3D 双继电器联动实验台，完整复现教材图 4.2.2(b) 四步时序及图 4.3.1—4.3.5 断线与五种混线防护（位置法/极性法/双断法/独立电源/分路法）对比。'
    },
    turnoutLab: {
      model: '1DQJ + 2DQJ + DBJ/FBJ（图5.2.2）', category: '第5.2.2节 四线制道岔控制与表示电路', contacts: '1DQJ(JWJXC-H) + 2DQJ(JYJXC) + DBJ/FBJ(JPXC) + 自动开闭器(1~4排)',
      complete: 0, frontOnly: 0, backOnly: 0, reinforced: 0, codingPins: '教材图5.2.1—5.2.3 / 表5.2.1',
      resistance: '1DQJ(125Ω/0.44Ω) · 2DQJ(220Ω/220Ω) · DBJ/FBJ(2×500Ω)', rated: '动作 DC 220 V / 表示 BB Ⅱ次侧 AC 220 V 半波整流（PDF p.81）', working: 'DCJ/FCJ↑ → 1DQJ(3-4 125Ω)↑ → 2DQJ转极 → 1DQJ(1-2 0.44Ω)串电机M自闭转到底 → 1DQJ↓ → DBJ/FBJ↑', release: '1DQJ 靠阻尼铜套缓放跨越 2DQJ 转极瞬间不断电',
      freeContactState: '自动开闭器(图5.2.3)：定位时第1/3排闭合(11-12反动/13-14·31-32·33-34定表)；启动时B爪先匀速转第4排(41-42)；反位时A爪速动转第2排(21-22·23-24·43-44反表)',
      railwayNormalState: '表5.2.1规定常态：SJ 吸起 ↑、DBJ 吸起 ↑、2DQJ 定位（111-112闭合）；DCJ/FCJ 落下 ↓、FBJ 落下 ↓、1DQJ 落下 ↓（11-13闭合接通表示电路）',
      figures: ['5-2-1', '5-2-3'], pages: [77, 78, 79, 80, 81, 82],
      geometry: '同台建立 1DQJ、2DQJ、DBJ/FBJ 三台真实继电器与 ZD6 转辙机自动开闭器（A/B速动爪、4排动静接点）、串激电机 M、整流二极管 Z 的 3D 联动微距实验台。'
    },
    fiveWireLab: {
      model: 'DBQ + BHJ + 1DQJ/1DQJF + S700K（图5.2.4）', category: '第5.2.3节 五线制三相交流道岔控制与表示电路', contacts: 'DBQ三相断相保护 + BHJ + 1DQJ/1DQJF + 2DQJ + DBJ/FBJ + X1~X5五线',
      complete: 0, frontOnly: 0, backOnly: 0, reinforced: 0, codingPins: '教材图5.2.4—5.2.8 / 表5.2.2',
      resistance: '1DQJ · 1DQJF · BHJ(JWXC) · 2DQJ · DBJ/FBJ(并接Z+R2)', rated: '动作三相 AC 380 V (RD₁~RD₃ 5A) / 表示 BB Ⅱ次侧 AC 110 V + R₁ 1000Ω/25W', working: 'DCJ/FCJ↑ → 1DQJ↑ → 1DQJF↑ → 2DQJ换相 → 三相通流DBQ使BHJ↑自闭1DQJ 1-2 → 电机W-V-U/W-U-V转到底 → 断相BHJ↓ → 1DQJ/1DQJF↓ → DBJ/FBJ↑', release: '缺相/超时(13s/30s)或遮断开关K断开时 BHJ 落下切断自闭；表示串联检查三相电机绕组完好',
      freeContactState: '五线职责(PDF p.86)：X1公共线、X2反→定共用、X3定→反共用、X4定位启动表示共用、X5反位启动表示共用',
      railwayNormalState: '表5.2.2常态：QDJ 吸起 ↑、DBJ 吸起 ↑、2DQJ 定位；BHJ 落下 ↓、1DQJ/1DQJF 落下 ↓（与四线制最大差异：五线表示 Z 与 DBJ 并联、取消电容 C，用正负两半周并检查电机线圈）',
      figures: ['5-2-4', '5-2-7', '5-2-8'], pages: [82, 83, 84, 85, 86],
      geometry: '同台建立室内 DBQ 断相保护器、BHJ、1DQJ、1DQJF、2DQJ、DBJ/FBJ 与室外 S700K 三相交流转辙机(U/V/W星接绕组、K遮断开关、并联二极管 Z 与 R2) 3D 联动实验台。'
    },
    cbiIoLab: {
      model: '计算机联锁动态驱采与脉冲变压器（图11.3.2 / 13.2.3—13.2.4）', category: '第11.3 & 13.2节 计算机联锁安全 I/O 硬件隔离接口', contacts: '静态1010/0101采集 · 动态闭合采集 · 脉冲变压器T+DR · 互补泵C1/C2驱动偏极J',
      complete: 0, frontOnly: 0, backOnly: 0, reinforced: 0, codingPins: '教材图11.3.2 / 图13.2.2—13.2.4',
      resistance: 'U1 光电隔离 + 脉冲变压器 T(隔直传交) / T1-T2 电容电荷泵', rated: 'CPU 5 V 动态方波驱动 → 接口 24 V/30 V 驱动偏极继电器 J', working: 'CPU 输出连续交替脉冲序列时，U1 交替开关使 T 次级整流或 C1/C2 泵能维持偏极 J ↑', release: 'CPU 死机“卡死常高 1”或“常低 0”时，T 隔直无输出或 C2 耗尽 → J 可靠 0 V 落下导向安全侧',
      freeContactState: '静态不对称安全编码(图13.2.2a)：落下=1010、吸起=0101，其余全部14种代码均按非法故障安全侧处理',
      railwayNormalState: '故障—安全铁律（PDF p.258—260）：计算机自身芯片可能失效，绝不能用普通高电平直接驱继电器，必须经“动态脉冲→交流隔离→静态直流转换”仅动态有能时 J 才吸起',
      figures: ['11-3-2', '13-2-3', '13-2-4'], pages: [224, 225, 258, 259, 260],
      geometry: '左侧展示嵌入式联锁 CPU 与光电隔离/脉冲变压器/电容泵电路板，右侧驱动真实的 JPXC-1000 偏极安全继电器，实时演示软件发脉冲吸起与“CPU卡死高电平1”时继电器可靠落下。'
    }
  };
  const figures = {
    '2-3-t1': { page: 20, book: 10, title: '表2.3.1 信号显示的图形符号与文字符号（H/U/L/B/A/空位/稳光/闪光）' },
    '2-3-1': { page: 21, book: 11, title: '图2.3.1 典型小站下行咽喉信号机布置（高柱 X/X_F/SⅡ · 矮型 S1/S3/S4/D1–D7）' },
    '2-3-2': { page: 23, book: 13, title: '图2.3.2 调车信号机布置（起始、阻拦、折返与并置/差置/单置）' },
    '2-3-5': { page: 26, book: 16, title: '第2.3.3节(5) 六类信号机机构与灯光配置总表（a高柱 / b桥隧矮型 / c一体柱）' },
    '2-4-4': { page: 28, book: 18, title: '图2.4.4—2.4.7 单线车站、安全线/避难线、双线车站及侧线道岔定位位置' },
    '2-5-1': { page: 29, book: 19, title: '图2.5.1 轨道电路划分与普通/单边/超限绝缘节' },
    '2-6-1': { page: 31, book: 21, title: '图2.6.1 接车、发车、通过与调车进路的范围示意' },
    '3-1-1': { page: 35, book: 25, title: '图3.1.1 示例车站信号平面图（完整上下行咽喉与4股道）' },
    '3-2-2a': { page: 42, book: 32, title: '表3.2.2 联锁表（下行咽喉 · 1–16号列车进路）' },
    '3-2-2b': { page: 43, book: 33, title: '表3.2.2 续表（下行咽喉 · 17–33号调车进路）' },
    '4-1-1': { page: 54, book: 44, title: '图4.1.1 AX型安全继电器：JWXC-1700外观与内部结构' },
    '4-1-2': { page: 55, book: 45, title: '表4.1.1 继电器类型字母含义与图4.1.2 JWJXC-H125/0.44命名释义' },
    '4-1-3': { page: 55, book: 45, title: '图4.1.3 无极继电器的磁路结构（含上/下托片与1-2-3-4端子）' },
    '4-1-4': { page: 56, book: 46, title: '图4.1.4 JPXC-1000偏极继电器的磁路结构（Φ永与ΦK）' },
    '4-1-5': { page: 57, book: 47, title: '图4.1.5 极性保持继电器磁路结构图' },
    '4-1-6': { page: 57, book: 47, title: '图4.1.6 AJ前、中、后接点示意图（工程图与原理图）' },
    '4-1-7': { page: 58, book: 48, title: '图4.1.7 DBJ、GJ（常态吸起↑）与XJ（常态落下↓）线圈及接点表示图' },
    '4-2-2': { page: 62, book: 52, title: '图4.2.2 自闭电路结构（共用电路、启动电路、自闭电路与 AJ/FUJ）' },
    '4-2-4': { page: 63, book: 53, title: '图4.2.4—4.2.5 时序逻辑、自闭电路与继电器励磁接通路径' },
    '4-3-1': { page: 64, book: 54, title: '图4.3.1 典型的断线防护电路（SJ锁闭电路与开路/闭路式轨道电路对比）' },
    '4-3-2': { page: 65, book: 55, title: '图4.3.2 远端供电法（位置法）混线防护电路对比' },
    '4-3-3': { page: 65, book: 55, title: '图4.3.3 极性法混线防护电路（1JBJ/2JBJ极性相反串联）' },
    '4-3-4': { page: 66, book: 56, title: '图4.3.4 双断法混线防护电路（去线Q与回线H双极控条件）' },
    '4-3-5': { page: 66, book: 56, title: '图4.3.5 分路法混线防护电路（KJF分路线，分路线断线不被检查）' },
    '5-1-2': { page: 68, book: 58, title: '表5.1.1—5.1.2 进站信号机接口继电器（LXJ/ZXJ/DJ/2DJ/DZJ）与常态' },
    '5-1-3': { page: 73, book: 63, title: '图5.1.3 两方向出站兼调车信号机接口电路（2LQJ/3LQJ/ZXJ/表示器）' },
    '5-1-4': { page: 75, book: 65, title: '图5.1.4 & 表5.1.5 调车信号机接口电路（DXJ↑白灯B / DJ↑监督）' },
    '5-2-1': { page: 77, book: 67, title: '表5.2.1—图5.2.1 四线制道岔控制继电器（DCJ/FCJ/SJ/1DQJ/2DQJ/DBJ/FBJ）与常态' },
    '5-2-2': { page: 79, book: 69, title: '图5.2.2 单动道岔的四线制控制电路（X1/X2/X3/X4启动与半波表示）' },
    '5-2-3': { page: 80, book: 70, title: '图5.2.3 道岔由定位转换至反位时自动开闭器(11-12/21-22/31-32/41-42)与电机动作过程' },
    '5-2-4': { page: 83, book: 73, title: '图5.2.4 五线制道岔控制电路总图（DBQ/BHJ/1DQJ/1DQJF/2DQJ/S700K）' },
    '5-2-7': { page: 85, book: 75, title: '图5.2.7 三相交流转辙机动作电路（X1~X5 两相换相与遮断开关 K）' },
    '5-2-8': { page: 86, book: 76, title: '图5.2.8 三相交流转辙机表示电路（并联二极管 Z + R1/R2 + 电机线圈检查）' },
    '5-3-1': { page: 87, book: 77, title: '图5.3.1 交流连续半波整流式轨道电路（GJ常态吸起↑）' },
    '5-3-2': { page: 88, book: 78, title: '图5.3.2 一送多受并联式轨道电路' },
    '5-3-3': { page: 88, book: 78, title: '图5.3.3 一送两受的25 Hz相敏轨道电路（GJ常态吸起↑）' },
    '6-3-1': { page: 101, book: 91, title: '图6.3.1 典型小站下行咽喉 12 种定型组合与 1–15 线连接图' },
    '7-2-1': { page: 110, book: 100, title: '图7.2.1 下行接车至 IG 列车进路的选排时序逻辑' },
    '7-9-1': { page: 132, book: 122, title: '图7.9.1 1、2线选岔网路（八字第一笔撇形双动反位）' },
    '7-9-3': { page: 134, book: 124, title: '图7.9.3 5、6线选岔电路（D7→IG实例：QJJ↓·CJ↑·DGJ↑·GJJ↓）' },
    '7-10-1': { page: 137, book: 127, title: '图7.10.1 开始继电器 KJ 工作电路（7线选排一致检查与自闭）' },
    '8-3-2': { page: 149, book: 139, title: '图8.3.1—8.3.2 迎面敌对照查继电器 ZCJ 电路（GJJ↑ + SJ↓）' },
    '9-6-1': { page: 211, book: 201, title: '图9.6.1 区段故障解锁电路（ZRA+SGA + DGJF↑无车 + QJJ↓防前方误解锁）' },
    '11-3-2': { page: 224, book: 214, title: '图11.3.2 计算机联锁继电器驱采电路（采集回线/驱动回线）' },
    '13-1-1': { page: 254, book: 244, title: '图13.1.1—13.1.2 双机热备动态冗余与三取二静态表决结构' },
    '13-2-2': { page: 259, book: 249, title: '图13.2.2 故障—安全输入电路（(a) 4光耦1010/0101静态编码与 (b) 动态脉冲环回）' },
    '13-2-3': { page: 260, book: 250, title: '图13.2.3 采用脉冲变压器的动态故障—安全输出电路' },
    '13-2-4': { page: 260, book: 250, title: '图13.2.4 采用互补三极管与电容泵的动/静态转换输出电路' },
    '13-4-1': { page: 268, book: 258, title: '图13.4.1 典型的二乘二取二模式计算机联锁系统（系内二取二+双系热备）' }
  };
  const neutralRegions = {
    coil: [.16, .44, .49, .20], core: [.08, .49, .62, .13], pole: [0, .42, .13, .25],
    yoke: [.10, .37, .61, .12], armature: [0, .31, .47, .12], weight: [.15, .34, .40, .08],
    rod: [.23, .06, .13, .33], front: [.30, .08, .61, .08],
    common: [.30, .15, .61, .07], back: [.30, .21, .61, .08]
  };
  function partBinding(type, part) {
    if (!models[type] || !models[type].complete) return null;
    if (['front', 'back', 'common'].includes(part) && (type === 'biased' || type === 'latching' || type === 'timeRelay')) {
      return { image: 'textbook/page-059.jpg', page: 59, rect: type === 'latching' ? [.48, .12, .42, .20] : [.07, .12, .41, .20],
        note: '表4.1.3 · 书内49页，按接点功能对应。具体型号各组编号以实物接线图为准。' };
    }
    if (type === 'biased' && ['coil', 'core', 'pole', 'yoke', 'armature', 'permanent'].includes(part)) {
      return { image: 'textbook/fig-4-1-4.jpg', page: 56, rect: part === 'permanent' ? [.07, .43, .12, .30] : [.04, .16, .45, .56], note: '图4.1.4 · 书内46页，偏极磁路与L形永久磁铁。' };
    }
    if (type === 'latching' && ['coil', 'core', 'pole', 'yoke', 'armature', 'permanent'].includes(part)) {
      return { image: 'textbook/fig-4-1-5.jpg', page: 57, rect: part === 'permanent' ? [.06, .29, .25, .20] : [.02, .28, .40, .52], note: '图4.1.5 · 书内47页，通用极性保持磁路。具体型号的装配尺寸未载。' };
    }
    if (part === 'copperSleeve' || part === 'timer' || part === 'rectifier' || part === 'terminals') {
      const page = part === 'timer' ? 274 : 60;
      return { image: `textbook/page-${String(page).padStart(3, '0')}.jpg`, page,
        rect: part === 'timer' ? [.07, .29, .85, .11] : [.10, .17, .83, .58],
        note: part === 'timer' ? '附录2续表 · 书内264页列有JSBXC-850。内部机构与接点数量仍为功能示意。' : '表4.1.4 · 书内50页给出型号、电气参数和缓放时间。部件安装位置、尺寸未载。' };
    }
    const rect = neutralRegions[part];
    if (!rect) return null;
    return { image: 'textbook/fig-4-1-3.jpg', page: 55, rect,
      note: '图4.1.3 · 书内45页，无极磁路与接点传动关系。几何采用展开教学比例。' };
  }
  const signalModels = {
    inStation: {
      model: '进站信号机 X / X_F',
      category: '第 2.3.1 / 2.3.3 节 · 接车进路防护（高柱三机构 / 桥隧 b·c 型）',
      contacts: '5灯位（自上而下：黄 · 绿 · 红 · 黄 · 月白）+ 引导信号机构',
      resistance: '常态点亮禁止灯光 红灯 H（故障灭灯按停车信号办理）',
      rated: 'AC 220V / BX-30 灯丝变压器 + DJ(JZXC-H62)主丝断丝自动转副丝',
      working: 'H红 · U单黄(正线) · UU双黄(侧线) · L绿(通过) · LU绿黄 · USU黄闪黄(18#道岔) · HB引导',
      release: '第5.1节继电器：LXJ↑开放 · ZXJ↑正线 · TXJ↑通过 · 2DJ↑双黄 · YXJ↑引导',
      freeContactState: '常态灯光：H 红灯（LXJ ↓ · DJ ↑ · 平时亮主灯丝 H₁）',
      railwayNormalState: '表5.1.1(PDF p.68)：平时主灯丝亮 H 时 1DJ↑、DZJ↑、2DJ↓、LXJ↓、ZXJ↓、YXJ↓',
      variants: ['a', 'b', 'c'],
      variantNames: { a: 'a型 · 高柱三机构(2+2+1)', b: 'b型 · 桥隧矮型双列(4+3)', c: 'c型 · 桥隧高架五灯一体' },
      aspects: ['H', 'U', 'UU', 'L', 'LU', 'USU', 'HB'],
      figures: ['2-3-5', '2-3-1', '5-1-2', '2-3-t1'],
      pages: [21, 24, 25, 26, 68, 69],
      rowRect: [.06, .04, .88, .17],
      geometry: '按第2.3.3节(5)与图2.3.1构建：含梯形混凝土基座、钢管柱身、背面检修梯、XB丝箱、椭圆防眩背板、遮檐、菲涅尔透镜与H₁/H₂双灯丝机构；作线路所通过信号机时封月白灯。尺寸采用教学装配比例。'
    },
    distant: {
      model: '预告信号机 YX',
      category: '第 2.3.1(3) / 2.3.3(2) 节 · 进站主体状态预告（非自闭 ≥800 m）',
      contacts: '2灯位（上绿 · 下黄，a型高柱 / b型桥隧矮型）',
      resistance: '常态点灯，平时预告主体进站信号机处于关闭状态（亮黄灯 U）',
      rated: '与主体进站信号机 ≥800 m 制动距离设于列车运行方向左侧',
      working: 'U黄灯：主体进站信号机在关闭状态 ｜ L绿灯：主体进站信号机在开放状态',
      release: '依据主体进站 LXJ / ZXJ 状态复示切换绿灯与黄灯',
      freeContactState: '常态灯光：U 黄灯（主体关闭提示提前减速）',
      railwayNormalState: '第2.3.3(2)节(PDF p.25–26)：常态点灯，U表示主体关闭、L表示主体开放',
      variants: ['a', 'b'],
      variantNames: { a: 'a型 · 高柱双灯机构', b: 'b型 · 桥隧矮型双灯' },
      aspects: ['U', 'L'],
      figures: ['2-3-5', '2-3-t1', '2-3-1'],
      pages: [21, 25, 26],
      rowRect: [.06, .21, .88, .15],
      geometry: '按第2.3.3节(5)第2行构建：高柱 a 型（绿上黄下配爬梯、X圆形Y字号牌）或桥隧矮型 b 型。尺寸与细部紧固件为教学示意。'
    },
    depFour: {
      model: '四显示自闭出站信号机',
      category: '第 2.3.1(2) / 2.3.3(3) 节 · 两方向发车兼调车 + 进路表示器',
      contacts: 'a型高柱双机构(绿·红·黄 + 绿·月白) / b型矮型双柱(4+2) + 表示器',
      resistance: '常态点亮禁止灯光 红灯 H，指示车站向区间发车及调车',
      rated: '图5.1.3 两方向出站接口：2LQJ/3LQJ/2DJ/ZXJ/LXJ/DXJ 编码控制',
      working: 'H红 · U单黄(1空闲) · LU绿黄(2空闲) · L绿(3+空闲) · LL双绿(半自闭/次要) · B月白(调车)',
      release: '可带发车进路/方向表示器；向另一方向发车须检表示器灯丝 3DJ↑',
      freeContactState: '常态灯光：H 红灯（LXJ ↓ · DXJ ↓ · 1DJ ↑）',
      railwayNormalState: '表5.1.2 / 图5.1.3(PDF p.73)：常态红灯；两个发车方向加进路表示器',
      variants: ['a', 'b'],
      variantNames: { a: 'a型 · 高柱双机构(3+2+表示器)', b: 'b型 · 矮型双柱(4+2+表示器)' },
      aspects: ['H', 'U', 'LU', 'L', 'LL', 'B'],
      figures: ['2-3-5', '5-1-3', '2-3-t1'],
      pages: [21, 22, 25, 26, 73, 74],
      rowRect: [.06, .36, .88, .16],
      geometry: '按第2.3.3节(5)第3行与图5.1.3构建：双机构(绿红黄+绿月白)及底座方向表示器盒，矮型 b 型左列[绿·空位⊗·绿·黄]、右列[月白·红]。'
    },
    depThree: {
      model: '三显示自闭出站信号机（SⅠ/SⅡ/S3/S4）',
      category: '第 2.3.3(3.2) 节 & 图 3.1.1 车站发车兼调车主力原型',
      contacts: 'a型高柱(2+2：绿红+黄月白) / b型矮型双柱(3+2：绿空黄 + 月白红)',
      resistance: '常态点亮红灯 H，图3.1.1 正线 IIG 设高柱 SⅡ，站线设矮型 S₁/S3/S4',
      rated: 'SⅠ/SⅡ/S3/S4 向北京方面 X 发车亮 L+右表示器，向 X_F 发车亮 L/LU/U',
      working: 'H红 · U单黄(1分区空闲) · L绿(2+分区空闲) · LL双绿(开往半自闭) · B月白(调车)',
      release: '站线上大都采用 b 型矮柱尽量增大股道有效长，正线上采用高柱 SⅡ',
      freeContactState: '常态灯光：H 红灯（发车 LXJ↓ · 调车 DXJ↓）',
      railwayNormalState: '第2.3.1(2)节 & 表3.2.2：正线高柱 SⅡ、到发线矮型 S₁/S3/S4，附表示器“右”',
      variants: ['a', 'b'],
      variantNames: { a: 'a型 · 高柱(2+2 · SⅡ原型)', b: 'b型 · 矮型(3+2 · S₁/S3/S4原型)' },
      aspects: ['H', 'U', 'L', 'LL', 'B'],
      figures: ['2-3-5', '2-3-1', '3-1-1', '5-1-3'],
      pages: [21, 25, 26, 35, 42],
      rowRect: [.06, .52, .88, .16],
      geometry: '严格按图3.1.1与p.26第4行：高柱 SⅡ 与矮型 S₁(左长列 绿·空位·黄，右短列 月白·红，附方向表示器)。'
    },
    depSemi: {
      model: '半自闭出站信号机',
      category: '第 2.3.3(3.1) 节 · 非自动闭塞区段出站防护',
      contacts: '2灯位（上绿 L · 下红 H；a型高柱 / b型矮型）',
      resistance: '常态点灯红灯 H，非自动闭塞区段不检查闭塞分区数',
      rated: '需取得半自动闭塞发车权（BS）方能开放绿灯 L',
      working: 'H红灯(禁止发车) · L绿灯(准许发车) · 副方向可扩展双绿或兼调车',
      release: '办理半自动闭塞复原或列车压入发车咽喉后信号自动关闭',
      freeContactState: '常态灯光：H 红灯（无发车闭塞权，LXJ↓）',
      railwayNormalState: '第2.3.3(5)第5行(PDF p.25–26)：常态点灯，用于非自动闭塞区段',
      variants: ['a', 'b'],
      variantNames: { a: 'a型 · 高柱两灯(绿·红)', b: 'b型 · 矮型两灯(绿·红)' },
      aspects: ['H', 'L'],
      figures: ['2-3-5', '2-3-t1', '5-1-3'],
      pages: [25, 26, 73],
      rowRect: [.06, .68, .88, .15],
      geometry: '按p.26第5行构建：简洁两灯机构(上绿下红)，含高柱爬梯 a 型与站线矮柱 b 型对照。'
    },
    shuntSig: {
      model: '调车信号机（D₁—D₈）',
      category: '第 2.3.2 节 · 起始 / 阻拦 / 折返 · 并置 / 差置 / 单置',
      contacts: '2灯位（上月白 B · 下蓝 A；a型高柱牵出线 / b型矮型咽喉区）',
      resistance: '常态点灯蓝灯 A（阻拦调车车列，对列车作业不起控制作用）',
      rated: 'DXJ↑ + ZJ(调车白灯保留图8.8.2) → 月白灯 B；平面溜放支持月白闪光',
      working: 'A蓝灯(禁止调车越过) · B月白灯(准许调车) · B_FLASH月白闪(准许平面溜放)',
      release: '调车车列完全越过信号机出清或外方留车时延迟关闭回蓝灯 A',
      freeContactState: '常态灯光：A 蓝灯（DXJ↓，注意：蓝灯对调车禁止，对列车无效）',
      railwayNormalState: '第2.3.2 & 8.8节：平时蓝灯；D₁/D₅单置、D₃/D₇差置、并置按背向终端按钮',
      variants: ['b', 'a'],
      variantNames: { b: 'b型 · 矮型咽喉调车(D₁~D₈)', a: 'a型 · 高柱牵出/专用线调车' },
      aspects: ['A', 'B', 'B_FLASH'],
      figures: ['2-3-5', '5-1-4', '2-3-2', '2-3-1', '3-1-1'],
      pages: [22, 23, 24, 26, 35, 75],
      rowRect: [.06, .83, .88, .15],
      geometry: '按p.26第6行与图2.3.2、图5.1.4构建：站内喉区常设矮型铸铁箱 b 型（上月白下蓝），牵出/机走线高柱 a 型带检修爬梯，DXJ控制白/蓝灯、DJ监督灯丝。'
    }
  };
  function signalPartBinding(type, part) {
    const spec = signalModels[type];
    if (!spec) return null;
    if (part === 'filament' || part === 'transformer') {
      if (type === 'shuntSig') {
        return {
          image: 'textbook/fig-5-1-4.jpg',
          page: 75,
          rect: [.04, .18, .35, .78],
          note: '图5.1.4 / 表5.1.5（书内65页）：DXJ 控制调车白灯/蓝灯，DJ 串联监督灯丝，采用位置法防混线。'
        };
      }
      const dep = ['depFour', 'depThree', 'depSemi'].includes(type);
      return {
        image: dep ? 'textbook/fig-5-1-3.jpg' : 'textbook/fig-5-1-2.jpg',
        page: dep ? 73 : 68,
        rect: [.06, .18, .86, .64],
        note: dep ? '图5.1.3 / 表5.1.2：出站信号灯丝监督(DJ/2DJ/3DJ)与双丝自动转换回路。' : '图5.1.2 / 表5.1.1：BX-30 变压器一次侧串 DJ 监督主/副灯丝（兼2DJ防升级），主丝断转 DZJ↓ 副丝。'
      };
    }
    return {
      image: 'textbook/fig-2-3-5.jpg',
      page: 26,
      rect: spec.rowRect,
      note: `第2.3.3节(5)（PDF 26 / 书16页）· ${spec.model} 机构与灯光配置对照；外围装配比例为教学模型。`
    };
  }
  const physicalReferences = [
    { title: '南通信号 JWXC-1700 产品说明', url: 'https://www.ntxhgs.com/prodetail/3.html', scope: '检索摘要支持重力恒定、止片与低剩磁磁路，原站本轮返回502，装配照片未核实' },
    { title: '中国中车 CR400AF基础型产品页', url: 'https://www.crrcgc.cc/crrcgc/2026-05/09/article_2026050917102785945.html', scope: '已查看官方照片，列车曲面、驾驶窗、红银涂装作外观参考，教学车体缩短' }
  ];
  root.RelaySources = { models, signalModels, figures, partBinding, signalPartBinding, physicalReferences };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.RelaySources;
})(globalThis);
