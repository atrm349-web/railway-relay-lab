(function (root) {
  'use strict';

  // 第 1、3.3.1、10、11、12、13 章共 31 幅系统架构、可执行软件流程图、HMI 界面、容错通信与冗余表决仿真
  // 严格对照岳强《车站信号自动控制》（第二版）及 audit/电路接点逐图核查.md
  const SYS_FIGURES = [
    // ==================== 第 1 章（2 幅） ====================
    {
      id: '1.1.2', ch: 1, page: 12, engine: 'sys', sub: 'arch',
      title: '图 1.1.2 · 车站信号系统组成（室内控制层 ↔ 联锁机构 ↔ 室外三类设备闭环）',
      summary: '车站信号系统形成严格闭环：值班员在控制台下发命令 → 联锁机构检查联锁条件 → 驱动室外信号机/转辙机，同时持续采集室外轨道电路/道岔/灯丝反馈回传控制台表示！',
      controls: [
        { id: 'cmd', type: 'select', label: '下发站场作业命令观测闭环信号流', def: 'route', options: [
          ['route', '① 办理进路：控制台→联锁→转岔+开信号→回传表示'],
          ['occ', '② 列车压入占用：轨道电路GJ↓→联锁→关闭信号+红光带'],
          ['fault', '③ 室外道岔故障：失表示回采→联锁拒绝开放信号（故障-安全）']
        ]}
      ],
      nodes: [
        { id: 'hmi', x: 40, y: 120, w: 170, h: 86, title: '室内控制台 / 上位机', sub: '按钮操作 · 光带与表示', role: 'ui' },
        { id: 'il', x: 300, y: 110, w: 200, h: 106, title: '核心联锁机构', sub: '6502 继电网络 / 计算机联锁\n功能安全 + 故障-安全', role: 'core' },
        { id: 'sig', x: 620, y: 34, w: 215, h: 66, title: '室外 · 色灯信号机', sub: '控制点灯 ⇄ 灯丝状态反馈', role: 'field' },
        { id: 'sw', x: 620, y: 130, w: 215, h: 66, title: '室外 · 电动转辙机', sub: '驱动转换 ⇄ 密贴表示反馈', role: 'field' },
        { id: 'trk', x: 620, y: 226, w: 215, h: 66, title: '室外 · 轨道电路', sub: '轮对分路/断轨 → 空闲回采', role: 'field' }
      ],
      links: [
        { from: 'hmi', to: 'il', label: '操作命令 ⇄ 站场表示', bi: true, activeWhen: () => true },
        { from: 'il', to: 'sig', label: '点灯驱动 ⇄ DJ反馈', bi: true, activeWhen: s => s.cmd !== 'fault' },
        { from: 'il', to: 'sw', label: '操岔驱动 ⇄ DBJ/FBJ', bi: true, activeWhen: () => true },
        { from: 'trk', to: 'il', label: '区段占用状态 (单向采)', bi: false, activeWhen: () => true }
      ],
      verdict: s => s.cmd === 'route' ? '✓ 完整正向控制闭环：控制台→联锁核心→道岔密贴→开放信号→回显白光带与绿复示！' : s.cmd === 'occ' ? '🔴 列车占用反馈闭环：轨道电路 GJ↓ → 联锁立即切断信号驱动并点亮红光带！' : '🛡 故障反馈闭环：转辙机失表示回传联锁核心，联锁禁止开放信号（故障—安全）！'
    },
    {
      id: '1.1.3', ch: 1, page: 14, engine: 'sys', sub: 'arch',
      title: '图 1.1.3 · 不同时期的联锁系统（机械联锁 → 6502 电气集中 → 计算机联锁演进对比）',
      summary: '切换三代联锁体制，对比联锁实现载体（机械连杆握柄 / 继电器 1–15 线硬连线 / 冗余安全计算机软件）、安全机制与演进趋势（高可靠、全电子化、网络化）。',
      controls: [
        { id: 'gen', type: 'select', label: '切换联锁发展代际', def: 'cbi', options: [
          ['mech', '(a) 机械联锁系统（钢丝/导杆握柄机械锁闭）'],
          ['6502', '(b) 6502 电气集中联锁（AX 安全继电器 1–15 线硬连线）'],
          ['cbi', '(c) 计算机联锁系统（二乘二取二/三取二软件运算 + 故障-安全 I/O）']
        ]}
      ],
      nodes: [
        { id: 'op', x: 40, y: 120, w: 195, h: 90, title: '值班员操作方式', sub: s => s.gen === 'mech' ? '人工扳动机械握柄' : s.gen === '6502' ? '单元控制台双按钮' : '双控显鼠标/屏幕操作', role: 'ui' },
        { id: 'core', x: 315, y: 108, w: 235, h: 114, title: '联锁逻辑核心', sub: s => s.gen === 'mech' ? '机械锁闭块/导杆几何互锁' : s.gen === '6502' ? '组合架 12 种定型继电器\n1–15 线重力型故障-安全' : '冗余安全主机(热备/2×2oo2)\n实时联锁软件 + 安全协议', role: 'core' },
        { id: 'out', x: 630, y: 120, w: 210, h: 90, title: '室外驱动执行', sub: s => s.gen === 'mech' ? '机械臂板信号/钢丝拉岔' : s.gen === '6502' ? '继电接口直驱色灯/转辙机' : '安全驱采 I/O 或全电子模块', role: 'field' }
      ],
      links: [
        { from: 'op', to: 'core', label: '命令输入', bi: true, activeWhen: () => true },
        { from: 'core', to: 'out', label: '联锁执行', bi: true, activeWhen: () => true }
      ],
      verdict: s => s.gen === 'mech' ? '第一代机械联锁：依靠机械连杆物理互锁，作业半径短、劳动强度大。' : s.gen === '6502' ? '第二代 6502 电气集中：依靠 AX 安全继电器重力落下保障故障-安全，奠定全套 1–15 线联锁逻辑！' : '第三代计算机联锁：冗余容错安全计算机取代中间庞大继电网络，向全电子化与 CTC/TCC 融合发展！'
    },

    // ==================== 第 3 章（1 幅） ====================
    {
      id: '3.3.1', ch: 3, page: 44, engine: 'sys', sub: 'flowchart',
      title: '图 3.3.1 · 进路控制过程（进路建立 → 信号保持 → 自动/人工解除全生命周期状态机）',
      summary: '严格按教材 PDF p.44（书内 34 页）：进路控制全周期分为 **① 进路建立**（选排→锁闭→开放）、**② 信号保持** 与 **③ 进路解除**（自动逐段/一次解锁 或 人工取消/延时/区故解）。',
      controls: [
        { id: 'normalPass', type: 'checkbox', label: '列车正常通过进路（取消勾选则演练人工解除分支！）', def: true },
        { id: 'approached', type: 'checkbox', label: '人工解除时：列车已进入接近区段（接近锁闭 → 须 ZRA 延时!）', def: false }
      ],
      nodes: [
        { id: 's1', x: 35, y: 40, w: 150, h: 52, kind: 'proc', title: '1. 进路选排', sub: '选岔·转岔·选排一致' },
        { id: 's2', x: 225, y: 40, w: 150, h: 52, kind: 'proc', title: '2. 进路锁闭', sub: '查空闲/敌对/照查→SJ↓' },
        { id: 's3', x: 415, y: 40, w: 150, h: 52, kind: 'proc', title: '3. 开放信号', sub: '检DJ↑·点亮允许灯光' },
        { id: 's4', x: 615, y: 40, w: 195, h: 52, kind: 'proc', title: '4. 信号开放保持', sub: '持续监督空闲/道岔/灯丝' },
        { id: 'd1', x: 370, y: 130, w: 185, h: 54, kind: 'dec', title: '列车正常驶入通过？', sub: '自动解锁 vs 人工解除' },
        { id: 'a1', x: 80, y: 224, w: 220, h: 62, kind: 'end', title: '自动模式解除', sub: '关闭信号 → 三点检查逐段/一次解锁' },
        { id: 'm1', x: 345, y: 224, w: 220, h: 62, kind: 'end', title: '人工：总取消 (ZQA)', sub: '预先锁闭 JYJ↑ → 关信号立即解锁' },
        { id: 'm2', x: 605, y: 224, w: 235, h: 62, kind: 'end', title: '人工：总人解(3min/30s)/区故解', sub: '接近锁闭 JYJ↓ 延时 或 SGA+ZRA' }
      ],
      edges: [
        { from: 's1', to: 's2' }, { from: 's2', to: 's3' }, { from: 's3', to: 's4' }, { from: 's4', to: 'd1' },
        { from: 'd1', to: 'a1', label: '是(自动)' },
        { from: 'd1', to: 'm1', label: '否·预先' },
        { from: 'd1', to: 'm2', label: '否·接近/故障' }
      ],
      trace: s => s.normalPass ? ['s1', 's2', 's3', 's4', 'd1', 'a1'] : s.approached ? ['s1', 's2', 's3', 's4', 'd1', 'm2'] : ['s1', 's2', 's3', 's4', 'd1', 'm1']
    },

    // ==================== 第 10 章（2 幅） ====================
    {
      id: '10.2.1', ch: 10, page: 215, engine: 'sys', sub: 'arch',
      title: '图 10.2.1 · 计算机联锁的层次结构（四层架构与安全职责划分仿真）',
      summary: '严格按教材四层划分：① 人机交互层（不承担安全防护，重高可用）↔ ② 联锁运算层（核心故障—安全主机）↔ ③ 输入/输出接口层（故障—安全驱采隔离）↔ ④ 室外设备层；另设维护机记录回放！',
      controls: [
        { id: 'hmiFail', type: 'checkbox', label: '⚡ 模拟上位机死机故障（检验为何不影响底层联锁安全！）', def: false },
        { id: 'ioFail', type: 'checkbox', label: '⚡ 模拟安全 I/O 故障（联锁安全输出立即切断导向安全！）', def: false }
      ],
      nodes: [
        { id: 'l1', x: 50, y: 24, w: 480, h: 52, title: '① 人机交互层（控显机 / 操作表示机）', sub: '命令输入与显示，【不承担安全防护职责】', role: 'ui', faultKey: 'hmiFail' },
        { id: 'maint', x: 585, y: 24, w: 245, h: 52, title: '电务维护机 / 监测', sub: '日志记录、故障回放与诊断', role: 'aux' },
        { id: 'l2', x: 50, y: 102, w: 780, h: 54, title: '② 联锁运算层（冗余安全计算机主机：热备 / 二乘二取二 / 三取二）', sub: '承担全部联锁条件运算与故障—安全决策', role: 'core' },
        { id: 'l3', x: 50, y: 182, w: 780, h: 54, title: '③ 输入 / 输出接口层（故障—安全动态采集板 / 驱动板 / 电子终端）', sub: '强弱电隔离 + 故障—安全脉冲转换', role: 'core', faultKey: 'ioFail' },
        { id: 'l4', x: 50, y: 260, w: 780, h: 50, title: '④ 室外设备层（色灯信号机 · 电动转辙机 · 轨道电路）', sub: '现场物理行车控制与状态产生', role: 'field' }
      ],
      links: [
        { from: 'l1', to: 'l2', label: '操作/表示', bi: true, activeWhen: s => !s.hmiFail },
        { from: 'maint', to: 'l2', label: '监测记录', bi: false, activeWhen: () => true },
        { from: 'l2', to: 'l3', label: '安全控制/采集', bi: true, activeWhen: s => !s.ioFail },
        { from: 'l3', to: 'l4', label: '室外接口', bi: true, activeWhen: s => !s.ioFail }
      ],
      verdict: s => s.ioFail ? '🛡 安全 I/O 层故障：立即切断所有危险侧驱动输出，已开放信号自动关闭红灯！' : s.hmiFail ? '✓ 上位机死机仅影响人工操作界面，联锁运算层与安全 I/O 仍维持原有锁闭防护，绝不危及行车安全！' : '✓ 四层双向闭环运行正常！'
    },
    {
      id: '10.3.1', ch: 10, page: 217, engine: 'sys', sub: 'arch',
      title: '图 10.3.1 · 三种典型的计算机联锁系统层次结构（(a)/(b)/(c) I/O 构建对比）',
      summary: '一键切换对比三种 I/O 层构建方式：(a) 并行总线 + 无 CPU 安全板 + 继电接口；(b) 串行安全总线 + 智能电子终端(ET) + 继电接口；(c) 串行总线 + 全电子强电执行单元直控室外设备！',
      controls: [
        { id: 'archType', type: 'select', label: '切换图 10.3.1 三种典型构建模式', def: 'b', options: [
          ['a', '(a) 并行总线 + 无 CPU 安全 I/O 板 + 继电接口（如 JD-1A）'],
          ['b', '(b) 串行安全总线 + 智能 I/O 电子终端(ET) + 继电接口（如 DS6-K5B）'],
          ['c', '(c) 串行安全总线 + 全电子安全执行单元直控室外（取消接口继电器！）']
        ]}
      ],
      nodes: [
        { id: 'host', x: 50, y: 112, w: 195, h: 92, title: '联锁主机', sub: '安全运算核心', role: 'core' },
        { id: 'bus', x: 295, y: 112, w: 225, h: 92, title: s => s.archType === 'a' ? '并行 I/O 扩展总线' : '高速串行安全总线/光纤', sub: s => s.archType === 'a' ? '无 CPU 安全驱采板\n(距离近、抗干扰受限)' : s.archType === 'b' ? '带 CPU 智能电子终端 ET\n(支持远程分布式控站)' : '全电子安全通信总线\n(免继电器组合架!)', role: 'core' },
        { id: 'ifc', x: 575, y: 48, w: 255, h: 80, title: s => s.archType === 'c' ? '全电子强电执行单元' : '继电接口电路组合架', sub: s => s.archType === 'c' ? '直接输出强电点亮信号/驱转辙机' : '保留 LXJ/DJ/1DQJ/DBJ/GJ 物理继电器', role: 'aux' },
        { id: 'fld', x: 575, y: 185, w: 255, h: 74, title: '室外信号机 / 转辙机 / 轨道', sub: '现场执行与监测', role: 'field' }
      ],
      links: [
        { from: 'host', to: 'bus', label: s => s.archType === 'a' ? '并行总线' : '安全串行协议', bi: true, activeWhen: () => true },
        { from: 'bus', to: 'ifc', label: '驱采接口', bi: true, activeWhen: () => true },
        { from: 'ifc', to: 'fld', label: '室外电缆', bi: true, activeWhen: () => true }
      ],
      verdict: s => s.archType === 'a' ? '(a) 并行总线+无CPU安全板：结构简单直接，但机柜距离受并行总线限制。' : s.archType === 'b' ? '(b) 串行总线+智能ET+继电接口：当前高铁与干线主流架构（如 K5B/EI32），支持远端分控！' : '(c) 全电子计算机联锁：彻底省去接口继电器与庞大组合架，直接强电驱动并实时诊断灯丝/电流波形！'
    },

    // ==================== 第 11 章硬件系统（3 幅：11.1.1, 11.2.1, 11.3.1） ====================
    {
      id: '11.1.1', ch: 11, page: 219, engine: 'sys', sub: 'arch',
      title: '图 11.1.1 · 人机交互计算机系统组成（工控主板与三大外联通信卡仿真）',
      summary: '上位机（操作表示机）核心硬件：工控主板、磁盘、声卡(接近/挤岔语音报警)、显卡(双屏站场显示)、通信卡1(联 CTC 调度集中)、通信卡2(联下位联锁机)、网卡(联电务维护机)！',
      controls: [
        { id: 'ctcFail', type: 'checkbox', label: '⚡ 模拟通信卡 1 断链（失去 CTC 远控，转车站自律/非常站控）', def: false },
        { id: 'ilFail', type: 'checkbox', label: '⚡ 模拟通信卡 2 断链（与联锁机中断，站场灰显报警！）', def: false }
      ],
      nodes: [
        { id: 'mb', x: 280, y: 100, w: 260, h: 110, title: '上位机工控主板 (CPU/内存)', sub: '磁盘(站场数据) · 显卡(双屏) · 声卡(报警)', role: 'ui' },
        { id: 'ctc', x: 40, y: 36, w: 185, h: 66, title: '通信卡 1 → CTC', sub: '接收列车计划/远控命令', role: 'aux', faultKey: 'ctcFail' },
        { id: 'ilc', x: 40, y: 186, w: 185, h: 66, title: '通信卡 2 ↔ 联锁机', sub: '下发按钮命令/收站场码', role: 'core', faultKey: 'ilFail' },
        { id: 'mnt', x: 610, y: 118, w: 225, h: 74, title: '以太网卡 → 维护监测机', sub: '记录站场操作与报警日志', role: 'aux' }
      ],
      links: [
        { from: 'ctc', to: 'mb', label: 'CTC通道', bi: true, activeWhen: s => !s.ctcFail },
        { from: 'ilc', to: 'mb', label: '联锁通道', bi: true, activeWhen: s => !s.ilFail },
        { from: 'mb', to: 'mnt', label: '维护日志网', bi: false, activeWhen: () => true }
      ],
      verdict: s => s.ilFail ? '⚠ 通信卡 2 与联锁机中断！操作界面弹出红字报警并禁止发令，自动切换至另一套控显备机！' : s.ctcFail ? '⚠ CTC 通道中断：车站转为本地人工操作，联锁系统本身正常！' : '✓ 上位机三大外部接口（CTC / 联锁机 / 维护机）全链路畅通！'
    },
    {
      id: '11.2.1', ch: 11, page: 221, engine: 'sys', sub: 'arch',
      title: '图 11.2.1 · 嵌入式计算机联锁系统硬件配置图（主处理单元 + 双通信/双 I/O 扩展）',
      summary: '嵌入式联锁运算层高可靠紧凑背板配置：冗余电源模块 + 嵌入式联锁主处理板（CPU/安全内存/同步比对）+ 双通信接口板（联控显/TCC/相邻站）+ 双 I/O 总线扩展板！',
      controls: [
        { id: 'commB', type: 'checkbox', label: '⚡ 模拟通信板 1 故障（自动无缝切至通信板 2）', def: false },
        { id: 'ioB', type: 'checkbox', label: '⚡ 模拟 I/O 扩展板 1 故障（切至扩展板 2 保不间断）', def: false }
      ],
      nodes: [
        { id: 'pwr', x: 35, y: 40, w: 165, h: 230, title: '双路冗余\n电源模块', sub: 'DC 24V → 5V/3.3V\n防雷滤波隔离', role: 'aux' },
        { id: 'cpu', x: 245, y: 40, w: 235, h: 230, title: '嵌入式联锁主机板\n(主处理单元)', sub: '实时嵌入式 OS\n联锁安全逻辑核心\n故障-安全时钟看门狗', role: 'core' },
        { id: 'c1', x: 565, y: 34, w: 270, h: 52, title: '通信板 1 (主)', sub: '联控显 / CTC / TCC', role: 'ui', faultKey: 'commB' },
        { id: 'c2', x: 565, y: 96, w: 270, h: 52, title: '通信板 2 (热备)', sub: '冗余双网通信备份', role: 'ui' },
        { id: 'i1', x: 565, y: 158, w: 270, h: 52, title: 'I/O 扩展板 1 (主)', sub: '安全驱动/采集总线 A', role: 'field', faultKey: 'ioB' },
        { id: 'i2', x: 565, y: 220, w: 270, h: 52, title: 'I/O 扩展板 2 (热备)', sub: '安全驱动/采集总线 B', role: 'field' }
      ],
      links: [
        { from: 'pwr', to: 'cpu', label: '稳压供电', bi: false, activeWhen: () => true },
        { from: 'cpu', to: 'c1', label: '背板', bi: true, activeWhen: s => !s.commB },
        { from: 'cpu', to: 'c2', label: '冗余', bi: true, activeWhen: () => true },
        { from: 'cpu', to: 'i1', label: 'I/O A', bi: true, activeWhen: s => !s.ioB },
        { from: 'cpu', to: 'i2', label: 'I/O B', bi: true, activeWhen: () => true }
      ],
      verdict: s => (s.commB || s.ioB) ? '✓ 冗余扩展板接管运行！系统单板故障不降级不停车，同时向维护机上报换板报警。' : '✓ 嵌入式硬件全板卡双冗余同步运行中。'
    },
    {
      id: '11.3.1', ch: 11, page: 222, engine: 'sys', sub: 'arch',
      title: '图 11.3.1 · 计算机联锁系统各层次接口关系示意（全链路采/驱映射）',
      summary: '追踪计算机联锁从主机经安全 I/O 到室外三大设备的完整电气映射：输入采 `DJ/DXJ、DBJ/FBJ、GJ` 接点；输出驱 `DXJ/LXJ` 与 `DCJ/FCJ/SJ`；室外分别对应 `A/B/H`、四线 `X1–X4` 与轨道 `Q/H`！',
      controls: [
        { id: 'branch', type: 'select', label: '高亮追踪指定室外设备驱采通道', def: 'all', options: [
          ['all', '全部通道并显（信号 + 道岔 + 轨道）'],
          ['sig', '仅追踪信号机通道（驱 DXJ/LXJ · 采 DJ/DXJ · 室外 A/B/H）'],
          ['sw', '仅追踪道岔通道（驱 SJ/DCJ/FCJ · 采 DBJ/FBJ · 室外 X1–X4）'],
          ['trk', '仅追踪轨道通道（无驱动 · 纯采集 GJ · 室外 Q/H）']
        ]}
      ],
      nodes: [
        { id: 'cbi', x: 35, y: 110, w: 170, h: 100, title: '联锁安全主机\n+ 驱采接口板', sub: '故障-安全动态 I/O', role: 'core' },
        { id: 'r_sig', x: 295, y: 30, w: 220, h: 66, title: '信号继电接口', sub: '驱 DXJ/LXJ ｜ 采 DJ/DXJ', role: 'aux' },
        { id: 'r_sw', x: 295, y: 126, w: 220, h: 66, title: '道岔继电接口 (DD)', sub: '驱 SJ/DCJ/FCJ ｜ 采 DBJ/FBJ', role: 'aux' },
        { id: 'r_trk', x: 295, y: 222, w: 220, h: 66, title: '轨道继电接口 (GJ)', sub: '仅采集 GJ 前接点状态', role: 'aux' },
        { id: 'f_sig', x: 615, y: 30, w: 220, h: 66, title: '室外信号机', sub: '点灯电缆 A / B / H', role: 'field' },
        { id: 'f_sw', x: 615, y: 126, w: 220, h: 66, title: '室外电动转辙机', sub: '四线 X1–X4 / 五线 X1–X5', role: 'field' },
        { id: 'f_trk', x: 615, y: 222, w: 220, h: 66, title: '室外钢轨区段', sub: '轨道引接线 Q / H', role: 'field' }
      ],
      links: [
        { from: 'cbi', to: 'r_sig', label: '驱+采', bi: true, activeWhen: s => s.branch === 'all' || s.branch === 'sig' },
        { from: 'r_sig', to: 'f_sig', label: 'A/B/H', bi: true, activeWhen: s => s.branch === 'all' || s.branch === 'sig' },
        { from: 'cbi', to: 'r_sw', label: '驱+采', bi: true, activeWhen: s => s.branch === 'all' || s.branch === 'sw' },
        { from: 'r_sw', to: 'f_sw', label: 'X1–X4', bi: true, activeWhen: s => s.branch === 'all' || s.branch === 'sw' },
        { from: 'r_trk', to: 'cbi', label: '仅采集', bi: false, activeWhen: s => s.branch === 'all' || s.branch === 'trk' },
        { from: 'f_trk', to: 'r_trk', label: 'Q/H', bi: false, activeWhen: s => s.branch === 'all' || s.branch === 'trk' }
      ],
      verdict: s => `当前追踪：【${s.branch === 'all' ? '全站三类室外设备双向驱采闭环' : s.branch === 'sig' ? '信号机双向驱采 (A/B/H)' : s.branch === 'sw' ? '转辙机双向驱采 (X1–X4)' : '轨道电路纯安全采集 (Q/H → GJ)'}】`
    },

    // ==================== 第 12 章软件系统、HMI 与 9 大可执行流程图（13 幅：12.1.1–12.5.1，12.4.1 已在 yard） ====================
    {
      id: '12.1.1', ch: 12, page: 227, engine: 'sys', sub: 'arch',
      title: '图 12.1.1 · 计算机联锁系统软件结构（操作表示 · 联锁逻辑 · 驱采监控三层软件）',
      summary: '软件体系划分为三层：① 操作表示软件（站场绘制/按钮编码/语音报警）↔ ② 核心联锁软件（静态站场数据+动态标志+进路/道岔/信号模块）↔ ③ 驱采与通信底层软件！',
      controls: [
        { id: 'flow', type: 'select', label: '触发软件层间消息交互演示', def: 'btn', options: [
          ['btn', '① 操作下发：点击站场按钮 → 联锁选排运算 → 写驱动输出缓冲区'],
          ['poll', '② 周期采显：周期读采集码 → 更新物理/逻辑状态 → 刷新站场光带']
        ]}
      ],
      nodes: [
        { id: 'ui', x: 60, y: 28, w: 760, h: 66, title: '操作表示软件（上位机层）', sub: '图形绘制 · 按钮逻辑识别 · 语音/弹窗报警 · 历史回放', role: 'ui' },
        { id: 'il', x: 60, y: 126, w: 760, h: 74, title: '核心联锁运算软件（安全核心层 · 多样化编码/防篡改）', sub: '只读静态数据(ROM) + 实时动态状态表 + 进路/道岔/信号/区段/闭塞功能模块', role: 'core' },
        { id: 'io', x: 60, y: 232, w: 760, h: 66, title: '驱采接口与安全通信软件（底层硬件抽象层）', sub: '周期读取 0101/1010 采集码 · 输出动态安全脉冲 · RSSP 安全通信协议栈', role: 'field' }
      ],
      links: [
        { from: 'ui', to: 'il', label: '按钮命令 / 表示帧', bi: true, activeWhen: () => true },
        { from: 'il', to: 'io', label: '驱动码 / 采集码', bi: true, activeWhen: () => true }
      ],
      verdict: s => s.flow === 'btn' ? '⬇ 自上而下控制流：按钮操作帧 → 联锁安全核校验通过 → 写入驱动缓冲区控制现场！' : '⬆ 自下而上采集刷新流：底层周期读现场状态 → 联锁刷新动态标志 → 推送上位机重绘光带！'
    },
    {
      id: '12.1.2', ch: 12, page: 228, engine: 'sys', sub: 'hmi', hmiMode: 'layout',
      title: '图 12.1.2 · 联锁上位机界面总体布局示意（三区规范布局交互演示）',
      summary: '铁路规范规定联锁上位机界面必分为三大功能区：**顶部状态与报警信息栏**（联锁主备系状态/挤岔断丝报警）、**中央站场平面显示与操作区**、**底部辅助功能按钮与时钟提示栏**！'
    },
    {
      id: '12.1.3', ch: 12, page: 229, engine: 'sys', sub: 'hmi', hmiMode: 'live',
      title: '图 12.1.3 · 一种联锁上位机软件界面（可点选办进路/单操/总取消实操仿真）',
      summary: '完整微型联锁上位机实操界面：直接点击站场上的始端/终端按钮办理进路、观察白光带锁闭与允许信号点亮，并可点击底部“总取消 / 总人解 / 道岔单锁”操作按钮！'
    },
    {
      id: '12.2.1', ch: 12, page: 232, engine: 'sys', sub: 'flowchart',
      title: '图 12.2.1 · 选择进路流程（可执行软件流程图）',
      summary: '联锁软件收到始终端按钮对后，检索静态联锁表：若存在对应合法进路则选出并建立动态进路控制数据结构，置“选路成功”；否则立即报警退出！',
      controls: [
        { id: 'exists', type: 'checkbox', label: '静态联锁表中【存在】该始终端对应进路', def: true }
      ],
      nodes: [
        { id: 'n0', x: 30, y: 125, w: 145, h: 52, kind: 'proc', title: '收到始终端按钮', sub: 'BtnPair{start,end}' },
        { id: 'n1', x: 220, y: 120, w: 185, h: 62, kind: 'dec', title: '查表：进路存在？', sub: '遍历只读静态进路表' },
        { id: 'n2', x: 460, y: 50, w: 175, h: 56, kind: 'proc', title: '选出目标进路', sub: '建立动态进路数据结构' },
        { id: 'n3', x: 680, y: 50, w: 165, h: 56, kind: 'end', title: '置【选择成功】', sub: '转入确认进路模块' },
        { id: 'n4', x: 480, y: 200, w: 230, h: 56, kind: 'fail', title: '非法按钮对 → 置失败退出', sub: '上位机语音提示“无此进路”' }
      ],
      edges: [
        { from: 'n0', to: 'n1' },
        { from: 'n1', to: 'n2', label: '是' }, { from: 'n2', to: 'n3' },
        { from: 'n1', to: 'n4', label: '否' }
      ],
      trace: s => s.exists ? ['n0', 'n1', 'n2', 'n3'] : ['n0', 'n1', 'n4']
    },
    {
      id: '12.2.2', ch: 12, page: 232, engine: 'sys', sub: 'flowchart',
      title: '图 12.2.2 · 确认进路流程（核查敌对/区段空闲/道岔可用性）',
      summary: '在正式征用设备前，全面核查进路中所有轨道区段空闲未锁、敌对信号未开放、沿途道岔未被单锁/封锁于相反位置，全部可用方置“确认成功”！',
      errata: '教材 PDF p.232 图 12.2.2 与图 12.2.3 流程图顺序与正文二三步叙述略有前后互换，本仿真完整支持单步验证两流程逻辑。',
      controls: [
        { id: 'avail', type: 'checkbox', label: '全部区段空闲、无敌对进路、道岔可操/可用', def: true }
      ],
      nodes: [
        { id: 'n0', x: 35, y: 125, w: 155, h: 52, kind: 'proc', title: '进路已选出', sub: '读取道岔/区段/敌对表' },
        { id: 'n1', x: 235, y: 118, w: 205, h: 66, kind: 'dec', title: '联锁条件全部可用？', sub: '区段空闲·无敌对·道岔可转' },
        { id: 'n2', x: 500, y: 55, w: 165, h: 54, kind: 'proc', title: '确认进路合法', sub: '记录待征用设备集合' },
        { id: 'n3', x: 700, y: 55, w: 145, h: 54, kind: 'end', title: '置【确认成功】', sub: '进入征用流程' },
        { id: 'n4', x: 500, y: 200, w: 260, h: 56, kind: 'fail', title: '条件不满足 → 清除进路退出', sub: '返回占用/敌对/单锁告警' }
      ],
      edges: [
        { from: 'n0', to: 'n1' },
        { from: 'n1', to: 'n2', label: '是' }, { from: 'n2', to: 'n3' },
        { from: 'n1', to: 'n4', label: '否' }
      ],
      trace: s => s.avail ? ['n0', 'n1', 'n2', 'n3'] : ['n0', 'n1', 'n4']
    },
    {
      id: '12.2.3', ch: 12, page: 232, engine: 'sys', sub: 'flowchart',
      title: '图 12.2.3 · 进路（含设备）征用流程（防止两并发操作争抢同一道岔/区段）',
      summary: '在道岔尚未转换到位锁闭前，必须先对进路内全部区段、道岔及信号置软件“征用标志 Reserved”，防止另一条并发进路同时征用导致冲突！',
      controls: [
        { id: 'freeRes', type: 'checkbox', label: '所需全部设备当前【未被其他进路征用/锁闭】', def: true }
      ],
      nodes: [
        { id: 'n0', x: 35, y: 125, w: 150, h: 52, kind: 'proc', title: '发起设备征用', sub: '检查 Reserved 标志' },
        { id: 'n1', x: 230, y: 118, w: 205, h: 66, kind: 'dec', title: '所有设备均未征用？', sub: '互斥资源检查' },
        { id: 'n2', x: 495, y: 55, w: 170, h: 54, kind: 'proc', title: '置设备【征用标志】', sub: '保护转岔期不被抢占' },
        { id: 'n3', x: 700, y: 55, w: 145, h: 54, kind: 'end', title: '置【征用成功】', sub: '转入转动道岔模块' },
        { id: 'n4', x: 495, y: 200, w: 265, h: 56, kind: 'fail', title: '存在冲突征用 → 放弃征用退出', sub: '严防并发竞态冲突！' }
      ],
      edges: [
        { from: 'n0', to: 'n1' },
        { from: 'n1', to: 'n2', label: '是' }, { from: 'n2', to: 'n3' },
        { from: 'n1', to: 'n4', label: '否' }
      ],
      trace: s => s.freeRes ? ['n0', 'n1', 'n2', 'n3'] : ['n0', 'n1', 'n4']
    },
    {
      id: '12.2.4', ch: 12, page: 233, engine: 'sys', sub: 'flowchart',
      title: '图 12.2.4 · 转动道岔流程（位置已符直通 / 可转→发命令→转换到位校验）',
      summary: '严格按图 12.2.4 三重分支判断：① 道岔已在要求位置直接成功；② 否则检可否转换（未锁/区段空闲）；③ 发出转岔驱动命令并监测密贴表示，到位成功、超时/卡阻失败退出！',
      controls: [
        { id: 'match', type: 'checkbox', label: '判断①：道岔当前物理位置已符合进路要求', def: false },
        { id: 'canTurn', type: 'checkbox', label: '判断②：道岔可转换（区段空闲·未单锁/未锁闭）', def: true },
        { id: 'done', type: 'checkbox', label: '判断③：发命令后在规定时限内密贴到位（DBJ/FBJ↑）', def: true }
      ],
      nodes: [
        { id: 'n0', x: 25, y: 120, w: 155, h: 58, kind: 'dec', title: '① 位置已符合？', sub: '核对 DBJ/FBJ' },
        { id: 'n1', x: 225, y: 120, w: 155, h: 58, kind: 'dec', title: '② 允许转换？', sub: 'SJ↑ · DGJ↑' },
        { id: 'n2', x: 425, y: 120, w: 150, h: 58, kind: 'proc', title: '发转岔命令', sub: '驱 DCJ/FCJ' },
        { id: 'n3', x: 615, y: 120, w: 150, h: 58, kind: 'dec', title: '③ 转换到位？', sub: '13s/30s 限时' },
        { id: 'ok', x: 635, y: 24, w: 195, h: 50, kind: 'end', title: '置【转岔成功】', sub: '转入进路锁闭模块' },
        { id: 'fl', x: 350, y: 232, w: 320, h: 50, kind: 'fail', title: '不可转或转换超时 → 清除征用并失败退出', sub: '上报挤岔/空转告警' }
      ],
      edges: [
        { from: 'n0', to: 'ok', label: '是' }, { from: 'n0', to: 'n1', label: '否' },
        { from: 'n1', to: 'n2', label: '是' }, { from: 'n1', to: 'fl', label: '否' },
        { from: 'n2', to: 'n3' },
        { from: 'n3', to: 'ok', label: '是' }, { from: 'n3', to: 'fl', label: '否(超时)' }
      ],
      trace: s => s.match ? ['n0', 'ok'] : !s.canTurn ? ['n0', 'n1', 'fl'] : s.done ? ['n0', 'n1', 'n2', 'n3', 'ok'] : ['n0', 'n1', 'n2', 'n3', 'fl']
    },
    {
      id: '12.2.5', ch: 12, page: 234, engine: 'sys', sub: 'flowchart',
      title: '图 12.2.5 · 锁闭进路流程（含迎面照查：锁岔锁区段并清征用 / 失败释放征用）',
      summary: '所有道岔转换到位后，再次总查空闲、道岔位置一致、敌对未建及对方咽喉照查：满足则置软件与物理锁闭（锁岔锁区段）并**清除临时征用标志**；不满足则必须清理征用防止死锁！',
      controls: [
        { id: 'lockOk', type: 'checkbox', label: '全部锁闭与迎面照查条件满足', def: true }
      ],
      nodes: [
        { id: 'n0', x: 35, y: 125, w: 150, h: 52, kind: 'proc', title: '进入锁闭模块', sub: '道岔已到位' },
        { id: 'n1', x: 225, y: 118, w: 195, h: 66, kind: 'dec', title: '满足锁闭与照查？', sub: '空闲·密贴·无敌对·ZCJ↑' },
        { id: 'n2', x: 475, y: 50, w: 185, h: 56, kind: 'proc', title: '锁闭道岔与区段', sub: '置 Locked · 切 SJ↓ · 清征用' },
        { id: 'n3', x: 695, y: 50, w: 150, h: 56, kind: 'end', title: '置【锁闭成功】', sub: '点亮白光带→开信号' },
        { id: 'n4', x: 475, y: 200, w: 295, h: 56, kind: 'fail', title: '不满足 → 清除全部征用标志并失败退出！', sub: '防设备永久挂起死锁' }
      ],
      edges: [
        { from: 'n0', to: 'n1' },
        { from: 'n1', to: 'n2', label: '是' }, { from: 'n2', to: 'n3' },
        { from: 'n1', to: 'n4', label: '否' }
      ],
      trace: s => s.lockOk ? ['n0', 'n1', 'n2', 'n3'] : ['n0', 'n1', 'n4']
    },
    {
      id: '12.2.6', ch: 12, page: 234, engine: 'sys', sub: 'flowchart',
      title: '图 12.2.6 · 信号开放功能模块的流程（条件检查 → 驱动开放 → 回采确认）',
      summary: '严格按图 12.2.6：先复核开放条件（锁闭完整、区段空闲、灯丝 DJ↑、超限/照查满足）→ 输出动态信号驱动命令 → **通过采集板回采确认信号已正确开放**，防驱而不吸！',
      controls: [
        { id: 'openCond', type: 'checkbox', label: '① 信号开放全部联锁条件满足（含 DJ↑）', def: true },
        { id: 'fbOk', type: 'checkbox', label: '② 驱采回采确认：室外信号已按预期显示开放', def: true }
      ],
      nodes: [
        { id: 'n0', x: 25, y: 120, w: 165, h: 60, kind: 'dec', title: '① 满足开放条件？', sub: '已锁·空闲·DJ↑·照查' },
        { id: 'n1', x: 245, y: 122, w: 160, h: 56, kind: 'proc', title: '输出开放驱动命令', sub: '安全动态驱 LXJ/DXJ' },
        { id: 'n2', x: 455, y: 120, w: 175, h: 60, kind: 'dec', title: '② 回采确认正确？', sub: '核对采集码 0101' },
        { id: 'ok', x: 675, y: 45, w: 170, h: 54, kind: 'end', title: '置【信号开放成功】', sub: '置 SigOpened 标志!' },
        { id: 'fl', x: 410, y: 228, w: 320, h: 52, kind: 'fail', title: '撤除驱动 → 保持红/蓝灯并上报故障！', sub: '禁止无确认开放' }
      ],
      edges: [
        { from: 'n0', to: 'n1', label: '是' }, { from: 'n0', to: 'fl', label: '否' },
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'ok', label: '是' }, { from: 'n2', to: 'fl', label: '否(不一致)' }
      ],
      trace: s => !s.openCond ? ['n0', 'fl'] : s.fbOk ? ['n0', 'n1', 'n2', 'ok'] : ['n0', 'n1', 'n2', 'fl']
    },
    {
      id: '12.2.7', ch: 12, page: 236, engine: 'sys', sub: 'flowchart',
      title: '图 12.2.7 · 信号关闭模块的流程（异常/取消/人解即关 vs 车列驶入关闭条件）',
      summary: '信号关闭模块持续监控两类事件：① 一旦发生设备故障（灯丝断/挤岔/侵限）、取消或人工关闭命令，**无条件立即撤除驱动关闭信号**；② 否则判断车列是否驶入满足关闭时机（列车首轮压入 / 调车整列越过）！',
      controls: [
        { id: 'abn', type: 'checkbox', label: '① 发生故障异常 或 人工取消/人解命令', def: false },
        { id: 'entered', type: 'checkbox', label: '② 列车首轮压入（或调车整列越过信号机）', def: true }
      ],
      nodes: [
        { id: 'n0', x: 30, y: 120, w: 180, h: 62, kind: 'dec', title: '① 故障/取消/人关？', sub: '最高安全优先级' },
        { id: 'n1', x: 265, y: 120, w: 195, h: 62, kind: 'dec', title: '② 满足车列驶入关闭？', sub: '列车压入 / 调车越尽' },
        { id: 'cls', x: 525, y: 50, w: 305, h: 60, kind: 'end', title: '立即撤除信号驱动 → 关闭红/蓝灯！', sub: '禁止故障恢复后自动重复开放！' },
        { id: 'keep', x: 525, y: 204, w: 305, h: 56, kind: 'proc', title: '维持信号开放保持状态', sub: '下一扫描周期继续监控' }
      ],
      edges: [
        { from: 'n0', to: 'cls', label: '是(立即关!)' }, { from: 'n0', to: 'n1', label: '否' },
        { from: 'n1', to: 'cls', label: '是(正常关)' }, { from: 'n1', to: 'keep', label: '否' }
      ],
      trace: s => s.abn ? ['n0', 'cls'] : s.entered ? ['n0', 'n1', 'cls'] : ['n0', 'n1', 'keep']
    },
    {
      id: '12.2.8', ch: 12, page: 236, engine: 'sys', sub: 'flowchart',
      title: '图 12.2.8 · 典型分段解锁进路流程（先关信号 → 首段两点/其余三点 → 末段清进路）',
      summary: '严格按图 12.2.8：仅在确认信号已关闭后启动解锁判定——首段无前驱可采用两点检查，其余中间段严格采用**三点检查（前解+本占清3s+后占）**，逐段解锁直至末段解毕清除整条进路记录！',
      controls: [
        { id: 'sigClosed', type: 'checkbox', label: '① 防护信号已可靠关闭（必要前置！）', def: true },
        { id: 'pt3Ok', type: 'checkbox', label: '② 当前区段满足三点（或首段两点）出清条件', def: true },
        { id: 'isLast', type: 'checkbox', label: '③ 本段为进路最后一个锁闭区段', def: true }
      ],
      nodes: [
        { id: 'n0', x: 25, y: 120, w: 155, h: 58, kind: 'dec', title: '① 信号已关闭？', sub: '防带车解锁' },
        { id: 'n1', x: 225, y: 120, w: 175, h: 58, kind: 'dec', title: '② 满足三点/两点？', sub: '含 3s 出清确认' },
        { id: 'n2', x: 445, y: 122, w: 145, h: 54, kind: 'proc', title: '解锁本区段', sub: '清锁闭·灭白光带' },
        { id: 'n3', x: 635, y: 120, w: 140, h: 58, kind: 'dec', title: '③ 末段？', sub: '全出清判别' },
        { id: 'end', x: 620, y: 24, w: 220, h: 50, kind: 'end', title: '清除进路数据结构！', sub: '恢复迎面照查，全解锁' },
        { id: 'wait', x: 240, y: 232, w: 360, h: 50, kind: 'proc', title: '保持剩余区段锁闭（等待下周期扫描）', sub: '不满足绝不提前解锁' }
      ],
      edges: [
        { from: 'n0', to: 'n1', label: '是' }, { from: 'n0', to: 'wait', label: '否' },
        { from: 'n1', to: 'n2', label: '是' }, { from: 'n1', to: 'wait', label: '否' },
        { from: 'n2', to: 'n3' },
        { from: 'n3', to: 'end', label: '是' }, { from: 'n3', to: 'wait', label: '否(续监下段)' }
      ],
      trace: s => !s.sigClosed ? ['n0', 'wait'] : !s.pt3Ok ? ['n0', 'n1', 'wait'] : s.isLast ? ['n0', 'n1', 'n2', 'n3', 'end'] : ['n0', 'n1', 'n2', 'n3', 'wait']
    },
    {
      id: '12.2.9', ch: 12, page: 237, engine: 'sys', sub: 'flowchart',
      title: '图 12.2.9 · 取消进路的流程（先关信号并回采确认 → 查取消条件 → 全解锁清进路）',
      summary: '严格体现“先关信号后解锁”安全铁律：收到取消命令后先发出关信号驱动并回采确认红/蓝灯，再查接近区段空闲（预先锁闭）与进路内无车，全部满足方一次性解锁全部区段与道岔！',
      controls: [
        { id: 'closed', type: 'checkbox', label: '① 已关闭信号并经回采确认灯灭/红灯', def: true },
        { id: 'canCancel', type: 'checkbox', label: '② 满足取消条件（接近区段空闲 · 进路内无车）', def: true }
      ],
      nodes: [
        { id: 'n0', x: 25, y: 122, w: 145, h: 54, kind: 'proc', title: '收到取消命令', sub: '立即发关信号令' },
        { id: 'n1', x: 215, y: 120, w: 165, h: 58, kind: 'dec', title: '① 确认信号已关？', sub: '回采红/蓝灯' },
        { id: 'n2', x: 425, y: 120, w: 175, h: 58, kind: 'dec', title: '② 满足取消条件？', sub: '接近空·全段空' },
        { id: 'ok', x: 645, y: 50, w: 200, h: 56, kind: 'end', title: '全部解锁并清除进路！', sub: '恢复 SJ↑ 与照查' },
        { id: 'fl', x: 430, y: 224, w: 325, h: 54, kind: 'fail', title: '取消失败！保持进路锁闭', sub: '接近有车须改办总人工延时解锁(3min/30s)' }
      ],
      edges: [
        { from: 'n0', to: 'n1' },
        { from: 'n1', to: 'n2', label: '是' }, { from: 'n1', to: 'fl', label: '否' },
        { from: 'n2', to: 'ok', label: '是' }, { from: 'n2', to: 'fl', label: '否' }
      ],
      trace: s => !s.closed ? ['n0', 'n1', 'fl'] : s.canCancel ? ['n0', 'n1', 'n2', 'ok'] : ['n0', 'n1', 'n2', 'fl']
    },
    {
      id: '12.5.1', ch: 12, page: 251, engine: 'sys', sub: 'arch',
      title: '图 12.5.1 · 联锁软件的主程序结构（实时固定周期循环扫描仿真）',
      summary: '计算机联锁采用固定周期（典型 100–250 ms）无阻塞主循环：`初始化自检 → 读操作输入与现场采集 → 依次执行 信号/道岔/区段/闭塞 联锁逻辑运算 → 安全输出驱动 + 发表示帧与 TCC/CTC 通信 → 下一周期`！',
      controls: [
        { id: 'phase', type: 'select', label: '单步/观察当前扫描周期阶段', def: 'all', options: [
          ['all', '↻ 全周期实时循环动画（采集 → 运算 → 输出）'],
          ['in', '阶段 ①：读上位机操作帧 + 周期安全采集码'],
          ['calc', '阶段 ②：执行道岔/区段/进路/信号/闭塞联锁运算'],
          ['out', '阶段 ③：安全动态输出驱动 + 回传表示与外联通信']
        ]}
      ],
      nodes: [
        { id: 'in', x: 45, y: 112, w: 205, h: 92, title: '① 输入处理模块', sub: '操作命令解析\n现场 0101/1010 采集读入', role: 'ui' },
        { id: 'calc', x: 315, y: 50, w: 250, h: 215, title: '② 联锁逻辑运算核心', sub: '• 轨道区段状态更新\n• 道岔转换与锁闭模块\n• 进路选排/锁闭/解锁\n• 信号开放/关闭/闭塞逻辑', role: 'core' },
        { id: 'out', x: 630, y: 112, w: 210, h: 92, title: '③ 输出与通信模块', sub: '安全驱动命令输出\n站场表示/CTC/TCC 报文', role: 'field' }
      ],
      links: [
        { from: 'in', to: 'calc', label: '状态快照', bi: false, activeWhen: s => s.phase === 'all' || s.phase === 'in' || s.phase === 'calc' },
        { from: 'calc', to: 'out', label: '安全输出', bi: false, activeWhen: s => s.phase === 'all' || s.phase === 'calc' || s.phase === 'out' },
        { from: 'out', to: 'in', label: '固定周期闭环 (≈200ms)', bi: false, activeWhen: s => s.phase === 'all' }
      ],
      verdict: s => `实时周期主程序：【${s.phase === 'all' ? '输入采样 → 确定性联锁运算 → 安全输出 → 循环往复（保证最坏响应时间确定！）' : '当前聚焦阶段 ' + s.phase}】`
    },

    // ==================== 第 13 章冗余容错与系统配置（10 幅：13.1.1–13.4.2，13.2.1–4 已在 circuit-b） ====================
    {
      id: '13.1.1', ch: 13, page: 254, engine: 'sys', sub: 'redundancy', redType: 'hotStandby',
      title: '图 13.1.1 · 双机热备结构示意（主备独立检测 + 安全倒机切换）',
      summary: 'A/B 两套联锁主机同步运算，仅主机输出控制现场；一旦故障检测单元发现主机故障，切换单元瞬间将控制权无扰切换至同步热备机；若两机均故障则彻底切断输出导向安全！'
    },
    {
      id: '13.1.2', ch: 13, page: 254, engine: 'sys', sub: 'redundancy', redType: 'tmr',
      title: '图 13.1.2 · 三取二结构示意（3 路并行运算 + 2oo3 多数表决器）',
      summary: 'A、B、C 三套独立主机并行处理同一输入，经故障—安全三取二（2oo3）表决器输出：任一单机故障自动被其余两机表决屏蔽，系统**零切换时间不间断运行**；两机故障立即安全停机！'
    },
    {
      id: '13.1.3', ch: 13, page: 257, engine: 'sys', sub: 'redundancy', redType: 'dualRing',
      title: '图 13.1.3 · 双环网的两种结构（(a)一备一用环 vs (b)双工作反向自愈环断纤仿真！）',
      summary: '点击切断任意一段光纤链路！观察 (a) 备用环接管 vs (b) 双向工作反向环自动在断点两侧**环回自愈**，保持全部节点间安全通信不中断！'
    },
    {
      id: '13.1.4', ch: 13, page: 257, engine: 'sys', sub: 'redundancy', redType: 'dualBus',
      title: '图 13.1.4 · 容错局域网的结构（双总线 A/B 网并行收发断线容错）',
      summary: '站内各子系统（控显、联锁、维护、监测）均配置双网卡同时接入独立 A/B 双局域网总线：任一总线断开或单交换机宕机，另一总线无缝承载全部安全报文！'
    },
    {
      id: '13.2.5', ch: 13, page: 261, engine: 'sys', sub: 'redundancy', redType: 'twoOfTwo',
      title: '图 13.2.5 · 二取二表决结构示意（双 CPU 同输入严格同步比较器）',
      summary: '单系二取二（2oo2）强调极致**故障—安全**：CPU A 与 CPU B 接收完全相同的采集输入，经安全比较器逐比特一致方允许驱动输出；只要任一 CPU 算错或死机，立即切断输出（牺牲可用性换安全）！'
    },
    {
      id: '13.2.6', ch: 13, page: 263, engine: 'sys', sub: 'arch',
      title: '图 13.2.6 · 安全通信系统的功能层次示意（CBI ↔ TCC 三层协议 + RSSP-I/II）',
      summary: '联锁 CBI 与列控中心 TCC 间通过非安全封闭传输网络交换关键行车信息，必须在应用层与传输层之间插入**安全通信层（RSSP-I/II：序列号防重放 + 时标防延迟 + 安全 CRC/MAC 防篡改）**！',
      controls: [
        { id: 'tamper', type: 'checkbox', label: '⚡ 模拟信道电磁干扰篡改 1 bit（检验安全层 CRC 拦截！）', def: false },
        { id: 'replay', type: 'checkbox', label: '⚡ 模拟报文延迟/重放攻击（检验序列号与时标拦截！）', def: false }
      ],
      nodes: [
        { id: 'c_app', x: 50, y: 30, w: 230, h: 52, title: 'CBI 应用层', sub: '进路/信号授权信息', role: 'ui' },
        { id: 'c_sec', x: 50, y: 102, w: 230, h: 56, title: 'CBI 安全层 (RSSP-I/II)', sub: '加序列号·时标·安全校验码', role: 'core' },
        { id: 'c_com', x: 50, y: 178, w: 230, h: 50, title: 'CBI 通信传输层', sub: 'UDP/TCP 封包', role: 'aux' },
        { id: 't_app', x: 600, y: 30, w: 230, h: 52, title: 'TCC 列控应用层', sub: '生成轨道电路编码/MA', role: 'ui' },
        { id: 't_sec', x: 600, y: 102, w: 230, h: 56, title: 'TCC 安全层 (RSSP 校验)', sub: '校验 CRC + 序时窗，错即丢弃!', role: 'core', faultKey: 'tamper' },
        { id: 't_com', x: 600, y: 178, w: 230, h: 50, title: 'TCC 通信传输层', sub: '拆包上送安全层', role: 'aux' },
        { id: 'net', x: 180, y: 252, w: 520, h: 48, title: '封闭传输系统（工业以太网 / 光纤冗余通道）', sub: '非安全传输媒介，可能出现误码/丢包/延迟/乱序', role: 'field' }
      ],
      links: [
        { from: 'c_app', to: 'c_sec', label: '明文', bi: true, activeWhen: () => true },
        { from: 'c_sec', to: 'c_com', label: '安全帧', bi: true, activeWhen: () => true },
        { from: 'c_com', to: 'net', label: '发包', bi: true, activeWhen: () => true },
        { from: 'net', to: 't_com', label: '收包', bi: true, activeWhen: () => true },
        { from: 't_com', to: 't_sec', label: '待验帧', bi: true, activeWhen: () => true },
        { from: 't_sec', to: 't_app', label: '仅放行合法安全帧!', bi: true, activeWhen: s => !s.tamper && !s.replay }
      ],
      verdict: s => s.tamper ? '🛡 RSSP 安全层检测到 CRC 校验不匹配！立即丢弃篡改帧，超时触发 TCC 导向最严限制码（HU/H）！' : s.replay ? '🛡 RSSP 安全层检测到序列号过期/重放！拒绝接收并导向安全侧！' : '✓ CBI ↔ TCC 安全通信三层校验全通过，安全报文实时同步！'
    },
    {
      id: '13.3.1', ch: 13, page: 264, engine: 'sys', sub: 'redundancy', redType: 'hotStandbyFull',
      title: '图 13.3.1 · 典型的双机热备模式的计算机联锁系统（(a)共享人机 vs (b)独立人机）',
      summary: '对比两种双机热备工程实现：(a) 共享人机切换单元；(b) 双套独立控显机；两套联锁机各自独立采集输出，由物理安全切换继电器选择主系输出到室外执行继电器 J！'
    },
    {
      id: '13.3.2', ch: 13, page: 265, engine: 'sys', sub: 'redundancy', redType: 'jd1a',
      title: '图 13.3.2 · JD-1A 型计算机联锁系统体系结构图（全机柜故障注入与倒机仿真）',
      summary: '复现我国经典 JD-1A 型双机热备全套架构：双操作表示机 + 维护监测网 + 双通信网 → A/B 两联锁总线控制器 → 各自动态驱采与回读检测板 → 防雷接口柜 → 6502 组合架！'
    },
    {
      id: '13.4.1', ch: 13, page: 268, engine: 'sys', sub: 'redundancy', redType: 'twoByTwoOfTwo',
      title: '图 13.4.1 · 典型的二乘二取二模式的计算机联锁系统（(a)并联输出 vs (b)独立双采双驱）',
      summary: '结合高安全（系内 2oo2）与高可用（双系热备）：对比 (a) 共输入且两驱采系并联输出（两系均须接主系令）与 (b) 两组接点独立采集、两组线圈独立驱动！'
    },
    {
      id: '13.4.2', ch: 13, page: 269, engine: 'sys', sub: 'redundancy', redType: 'ds6k5b',
      title: '图 13.4.2 · DS6-K5B 型计算机联锁系统配置示意（双控显无倒机 · 光分路 · ET 五机架）',
      summary: '完整复现我国高铁主力 DS6-K5B 配置：控显 A/B 并联无倒机 → 光分路器 → I/II 系二乘二取二联锁机 (F486-4I) → 125M 光纤 LAN → ET 五机架 PIO 电子终端 (FSCPU 静态驱采) + 双路 UPS！'
    }
  ];

  root.FigDataSys = SYS_FIGURES;
  if (typeof module !== 'undefined' && module.exports) module.exports = SYS_FIGURES;
})(typeof window !== 'undefined' ? window : globalThis);
