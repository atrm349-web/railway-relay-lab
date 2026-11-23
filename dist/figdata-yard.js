(function (root) {
  'use strict';

  // 全书 34 幅站场平面、闭塞区间、道岔定位、绝缘节、进路范围与联锁沙盘动态物理仿真数据
  // 严格对照岳强《车站信号自动控制》（第二版）及逐图核查记录
  const YARD_FIGURES = [
    // ==================== 第 1 章 ====================
    {
      id: '1.1.1', ch: 1, page: 12, engine: 'yard',
      title: '图 1.1.1 · 某站站场实景（多股道咽喉设备映射仿真）',
      summary: '将实景站场映射为“进站信号机—咽喉道岔群—轨道电路区段—到发股道—出站信号机”完整联锁拓扑；点击任意进路按钮发车，观察信号开放、光带锁闭与列车轮对占用。',
      jump3d: { label: '🚉 进入 03 站场 3D 联锁沙盘', go: { mode: 'station' } },
      tracks: [
        { id: 't_main1', pts: [[30, 140], [850, 140]], sec: 'IG', name: 'ⅠG 正线', labelPos: [560, 126], kind: 'main' },
        { id: 't_main2', pts: [[30, 200], [850, 200]], sec: 'IIG', name: 'ⅡG 正线', labelPos: [560, 218], kind: 'main' },
        { id: 't_s3', pts: [[260, 140], [320, 82], [720, 82], [780, 140]], sec: '3G', name: '3G 侧线', labelPos: [560, 68], kind: 'siding' },
        { id: 't_s4', pts: [[260, 200], [320, 258], [720, 258], [780, 200]], sec: '4G', name: '4G 侧线', labelPos: [560, 276], kind: 'siding' },
        { id: 't_x1', pts: [[160, 140], [220, 200]], sec: '1DG', kind: 'branch' }
      ],
      sections: [
        { id: 'X3JG', x1: 30, x2: 120, y: 140, label: '接近区段' },
        { id: '1DG', x1: 120, x2: 260, y: 140, label: '咽喉1DG' },
        { id: '3DG', x1: 260, x2: 390, y: 140, label: '咽喉3DG' },
        { id: 'IG', x1: 390, x2: 720, y: 140 },
        { id: '3G', x1: 320, x2: 720, y: 82 },
        { id: 'IIG', x1: 390, x2: 720, y: 200 },
        { id: '4G', x1: 320, x2: 720, y: 258 }
      ],
      switches: [
        { id: '1/3', x: 160, y: 140, dir: 'R', branchDy: 60, defPos: 'N', label: '1/3#' },
        { id: '5', x: 260, y: 140, dir: 'R', branchDy: -58, defPos: 'N', label: '5#' },
        { id: '7', x: 260, y: 200, dir: 'R', branchDy: 58, defPos: 'N', label: '7#' }
      ],
      insulations: [{ x: 120, y: 140 }, { x: 255, y: 140 }, { x: 390, y: 140 }, { x: 720, y: 140 }, { x: 390, y: 200 }, { x: 720, y: 200 }],
      signals: [
        { id: 'X', x: 120, y: 122, dir: 'R', type: 'home', defAspect: 'H' },
        { id: 'SⅠ', x: 720, y: 122, dir: 'L', type: 'dep', defAspect: 'H' },
        { id: 'S3', x: 720, y: 64, dir: 'L', type: 'dep', defAspect: 'H' },
        { id: 'XⅠ', x: 390, y: 158, dir: 'R', type: 'dep', defAspect: 'H' }
      ],
      routes: [
        { id: 'r1', name: '① 下行正线接车 X → ⅠG (U)', signal: 'X', aspect: 'U', reqSw: { '1/3': 'N', '5': 'N' }, secs: ['1DG', '3DG', 'IG'], path: [[40, 140], [660, 140]], desc: '道岔全定位锁闭，开放单黄 U，列车驶入 ⅠG 停车并逐段解锁。' },
        { id: 'r2', name: '② 下行侧线接车 X → 3G (UU)', signal: 'X', aspect: 'UU', reqSw: { '1/3': 'N', '5': 'R' }, secs: ['1DG', '3DG', '3G'], path: [[40, 140], [260, 140], [320, 82], [660, 82]], desc: '5# 转换反位锁闭，开放双黄 UU 限速侧向接入 3G 股道。' },
        { id: 'r3', name: '③ 下行通过进路 X → ⅠG → 区间 (L)', signal: 'X', aspect: 'L', reqSw: { '1/3': 'N', '5': 'N' }, secs: ['1DG', '3DG', 'IG'], path: [[40, 140], [830, 140]], desc: '出站与进站连开绿灯 L，列车按规定速度正线直通。' }
      ]
    },

    // ==================== 第 2 章 ====================
    {
      id: '2.1.1', ch: 2, page: 15, engine: 'yard', physicsMode: 'autoblock',
      title: '图 2.1.1 · 车站与站间自动闭塞分区（四显示动态追踪仿真）',
      summary: '站间划分为多个自动闭塞分区；当列车沿区间运行占用前方分区时，后方通过信号机严格按物理占用实时升级显示：红 H(0空闲) → 单黄 U(1空闲) → 绿黄 LU(2空闲) → 绿 L(3+空闲)。',
      tracks: [
        { id: 't_ab', pts: [[30, 165], [850, 165]], kind: 'main' },
        { id: 't_a', pts: [[55, 165], [90, 120], [160, 120], [195, 165]], kind: 'siding', name: '甲站', labelPos: [125, 106] },
        { id: 't_b', pts: [[690, 165], [725, 120], [795, 120], [830, 165]], kind: 'siding', name: '乙站', labelPos: [760, 106] }
      ],
      sections: [
        { id: 'A站', x1: 50, x2: 205, y: 165, label: '甲站站界内' },
        { id: '1G', x1: 205, x2: 325, y: 165, label: '1闭塞分区' },
        { id: '2G', x1: 325, x2: 445, y: 165, label: '2闭塞分区' },
        { id: '3G', x1: 445, x2: 565, y: 165, label: '3闭塞分区' },
        { id: '4G', x1: 565, x2: 685, y: 165, label: '4闭塞分区' },
        { id: 'B站', x1: 685, x2: 835, y: 165, label: '乙站站界内' }
      ],
      switches: [],
      insulations: [{ x: 205, y: 165 }, { x: 325, y: 165 }, { x: 445, y: 165 }, { x: 565, y: 165 }, { x: 685, y: 165 }],
      signals: [
        { id: 'S甲', x: 205, y: 145, dir: 'R', type: 'block', defAspect: 'L', secIdx: 1 },
        { id: '1#', x: 325, y: 145, dir: 'R', type: 'block', defAspect: 'L', secIdx: 2 },
        { id: '3#', x: 445, y: 145, dir: 'R', type: 'block', defAspect: 'L', secIdx: 3 },
        { id: '5#', x: 565, y: 145, dir: 'R', type: 'block', defAspect: 'L', secIdx: 4 },
        { id: 'X乙', x: 685, y: 145, dir: 'R', type: 'block', defAspect: 'U', secIdx: 5 }
      ],
      markers: [
        { x: 205, y: 210, kind: 'label', text: '← 甲站站界 | 站间自动闭塞区间 (四显示) | 乙站站界 →' }
      ],
      routes: [
        { id: 'r1', name: '▶ 发车运行：观察四显示闭塞分区实时追踪升级', signal: 'S甲', aspect: 'L', reqSw: {}, secs: ['1G', '2G', '3G', '4G', 'B站'], path: [[80, 165], [810, 165]], desc: '列车依次压入 1G→2G→3G→4G→乙站，观察每架信号机由红(H)→黄(U)→绿黄(LU)→绿(L)自动升级！' }
      ]
    },
    {
      id: '2.1.2', ch: 2, page: 15, engine: 'yard', physicsMode: 'autoblock',
      title: '图 2.1.2 · 车站与所间区间（线路所分割区间行车仿真）',
      summary: '在两个车站之间加设线路所（或辅助所）以缩短区间长度、提高通过能力；车站与线路所之间的线路称为“所间区间”，由线路所通过信号机防护。',
      tracks: [
        { id: 't_main', pts: [[30, 165], [850, 165]], kind: 'main' },
        { id: 't_a', pts: [[50, 165], [85, 118], [175, 118], [210, 165]], kind: 'siding', name: '甲站', labelPos: [130, 104] },
        { id: 't_b', pts: [[670, 165], [705, 118], [795, 118], [830, 165]], kind: 'siding', name: '乙站', labelPos: [750, 104] }
      ],
      sections: [
        { id: '甲站', x1: 45, x2: 220, y: 165, label: '甲站' },
        { id: '所间1', x1: 220, x2: 440, y: 165, label: '所间区间 ①' },
        { id: '所间2', x1: 440, x2: 660, y: 165, label: '所间区间 ②' },
        { id: '乙站', x1: 660, x2: 835, y: 165, label: '乙站' }
      ],
      switches: [],
      insulations: [{ x: 220, y: 165 }, { x: 440, y: 165 }, { x: 660, y: 165 }],
      signals: [
        { id: 'S甲', x: 220, y: 145, dir: 'R', type: 'block', defAspect: 'L', secIdx: 1 },
        { id: '线路所', x: 440, y: 145, dir: 'R', type: 'block', defAspect: 'L', secIdx: 2 },
        { id: 'X乙', x: 660, y: 145, dir: 'R', type: 'block', defAspect: 'U', secIdx: 3 }
      ],
      markers: [
        { x: 440, y: 102, kind: 'label', text: '线路所 / 辅助所（分割长区间）' },
        { x: 330, y: 205, kind: 'label', text: '← 所间区间 ① →' },
        { x: 550, y: 205, kind: 'label', text: '← 所间区间 ② →' }
      ],
      routes: [
        { id: 'r1', name: '▶ 列车通过所间区间 ① → 线路所 → 所间区间 ②', signal: 'S甲', aspect: 'L', reqSw: {}, secs: ['所间1', '所间2', '乙站'], path: [[80, 165], [790, 165]], desc: '列车出清所间区间①越过线路所信号机后，甲站即可续发后续列车，区段通过能力翻倍。' }
      ]
    },
    {
      id: '2.1.3', ch: 2, page: 16, engine: 'yard',
      title: '图 2.1.3 · 两种典型的中间站站场（横列式 vs 纵列式会让越行仿真）',
      summary: '中间站主要办理列车会让、越行及少量客货运业务。(a) 横列式到发线并列对称，布置紧凑；(b) 纵列式到发线沿行车方向错开配置，便于大站越行并减少咽喉干扰。',
      tracks: [
        { id: 't_top_main', pts: [[40, 110], [840, 110]], kind: 'main', name: '(a) 横列式正线 ⅠG', labelPos: [440, 96] },
        { id: 't_top_s1', pts: [[180, 110], [240, 62], [640, 62], [700, 110]], kind: 'siding', name: '3G 侧线', labelPos: [440, 48] },
        { id: 't_top_s2', pts: [[180, 110], [240, 152], [640, 152], [700, 110]], kind: 'siding', name: '4G 侧线', labelPos: [440, 168] },
        { id: 't_bot_main', pts: [[40, 248], [840, 248]], kind: 'main', name: '(b) 纵列式正线 ⅠG', labelPos: [440, 234] },
        { id: 't_bot_s1', pts: [[110, 248], [160, 206], [470, 206], [520, 248]], kind: 'siding', name: '上行到发线 3G', labelPos: [315, 194] },
        { id: 't_bot_s2', pts: [[360, 248], [410, 286], [720, 286], [770, 248]], kind: 'siding', name: '下行到发线 4G', labelPos: [565, 276] }
      ],
      sections: [
        { id: '横ⅠG', x1: 240, x2: 640, y: 110 }, { id: '横3G', x1: 240, x2: 640, y: 62 },
        { id: '纵ⅠG', x1: 160, x2: 720, y: 248 }, { id: '纵4G', x1: 410, x2: 720, y: 290 }
      ],
      switches: [
        { id: '1', x: 180, y: 110, dir: 'R', branchDy: -48, defPos: 'N', label: '1#' },
        { id: '2', x: 360, y: 248, dir: 'R', branchDy: 42, defPos: 'N', label: '2#' }
      ],
      insulations: [{ x: 150, y: 110 }, { x: 730, y: 110 }, { x: 90, y: 248 }, { x: 790, y: 248 }],
      signals: [
        { id: 'X横', x: 140, y: 92, dir: 'R', type: 'home', defAspect: 'H' },
        { id: 'X纵', x: 90, y: 230, dir: 'R', type: 'home', defAspect: 'H' }
      ],
      routes: [
        { id: 'r1', name: '① 横列式：慢车侧停 3G 待避', signal: 'X横', aspect: 'UU', reqSw: { '1': 'R' }, secs: ['横3G'], path: [[60, 110], [180, 110], [240, 62], [580, 62]], desc: '横列式中间站：慢车经 1# 反位入 3G 停车待避，快车由 ⅠG 正线通过。' },
        { id: 'r2', name: '② 横列式：快车正线 ⅠG 越行通过', signal: 'X横', aspect: 'L', reqSw: { '1': 'N' }, secs: ['横ⅠG'], path: [[60, 110], [810, 110]], desc: '横列式正线直通越行。' },
        { id: 'r3', name: '③ 纵列式：下行车入纵列 4G 停靠', signal: 'X纵', aspect: 'UU', reqSw: { '2': 'R' }, secs: ['纵4G'], path: [[60, 248], [360, 248], [410, 290], [670, 290]], desc: '纵列式到发线顺行错开，缩短列车停站后启动出站距离。' }
      ]
    },
    {
      id: '2.1.4', ch: 2, page: 17, engine: 'yard',
      title: '图 2.1.4 · 区段站站场（客场·货场·机务段·牵出线作业仿真）',
      summary: '区段站设客运设备（旅客到发线）、货运到发场、调车场（少量解体/编组）、机务段（更换机车/整备）及专用牵出线，是铁路区段分界与机车换挂枢纽。',
      tracks: [
        { id: 't_m1', pts: [[30, 110], [850, 110]], kind: 'main', name: '客运到发场 ⅠG/ⅡG', labelPos: [440, 94] },
        { id: 't_p2', pts: [[160, 110], [210, 68], [670, 68], [720, 110]], kind: 'siding', name: '客站台线 3G', labelPos: [440, 54] },
        { id: 't_f1', pts: [[130, 110], [210, 175], [670, 175], [750, 110]], kind: 'siding', name: '货物列车到发场', labelPos: [440, 161] },
        { id: 't_y1', pts: [[250, 175], [310, 228], [640, 228], [700, 175]], kind: 'siding', name: '调车场（摘挂解体）', labelPos: [475, 214] },
        { id: 't_lead', pts: [[640, 228], [840, 228]], kind: 'branch', name: '牵出线', labelPos: [765, 214] },
        { id: 't_loco', pts: [[180, 175], [235, 278], [420, 278]], kind: 'safety', name: '机务段/机车整备线', labelPos: [325, 294] }
      ],
      sections: [
        { id: '客站台', x1: 210, x2: 670, y: 68 },
        { id: '客场', x1: 210, x2: 670, y: 110 },
        { id: '货场', x1: 210, x2: 670, y: 175 },
        { id: '调车场', x1: 310, x2: 640, y: 228 },
        { id: '机务线', x1: 235, x2: 420, y: 278 }
      ],
      switches: [
        { id: '1', x: 130, y: 110, dir: 'R', branchDy: 65, defPos: 'N', label: '1#' },
        { id: '3', x: 160, y: 110, dir: 'R', branchDy: -42, defPos: 'N', label: '3#' },
        { id: '5', x: 180, y: 175, dir: 'R', branchDy: 103, defPos: 'N', label: '5#' },
        { id: '7', x: 250, y: 175, dir: 'R', branchDy: 53, defPos: 'N', label: '7#' }
      ],
      insulations: [{ x: 100, y: 110 }, { x: 760, y: 110 }],
      signals: [
        { id: 'X', x: 100, y: 92, dir: 'R', type: 'home', defAspect: 'H' },
        { id: 'D机', x: 235, y: 260, dir: 'L', type: 'shunt', defAspect: 'A' }
      ],
      routes: [
        { id: 'r1', name: '① 旅客列车进客场站台停靠 (UU)', signal: 'X', aspect: 'UU', reqSw: { '1': 'N', '3': 'R' }, secs: ['客站台'], path: [[40, 110], [160, 110], [210, 68], [610, 68]], desc: '客车直接经定位 1#、反位 3# 接入客站台线，不干扰货场作业。' },
        { id: 'r2', name: '② 货物列车进货场换挂机车 (UU)', signal: 'X', aspect: 'UU', reqSw: { '1': 'R', '5': 'N', '7': 'N' }, secs: ['货场'], path: [[40, 110], [130, 110], [210, 175], [610, 175]], desc: '货列接入货运到发场进行技术检查与更换机车/乘务组。' },
        { id: 'r3', name: '③ 整备机车由机务段出段挂车 (B)', signal: 'D机', aspect: 'B', reqSw: { '5': 'R', '7': 'N' }, secs: ['机务线', '货场'], path: [[390, 278], [235, 278], [180, 175], [460, 175]], trainKind: 'shunt', desc: '单机经机务段出入段线调车挂接货列。' }
      ]
    },
    {
      id: '2.1.5', ch: 2, page: 17, engine: 'yard', physicsMode: 'hump',
      title: '图 2.1.5 · 编组站站场（到达场→驼峰重力溜放解体→调车场→出发场）',
      summary: '编组站是铁路网“货物列车制造工厂”，由到达场、驼峰、调车场和出发场组成。演示车列推上驼峰峰顶摘钩后，车组靠重力加速度自动沿坡道溜放并按分路道岔进入指定编组股道！',
      tracks: [
        { id: 't_arr1', pts: [[30, 130], [210, 130], [260, 165]], kind: 'siding', name: '到达场', labelPos: [110, 115] },
        { id: 't_arr2', pts: [[30, 180], [210, 180], [260, 165]], kind: 'siding' },
        { id: 't_hump', pts: [[260, 165], [340, 132], [410, 165]], kind: 'slope', name: '▲ 驼峰峰顶', labelPos: [340, 156] },
        { id: 't_c1', pts: [[410, 165], [485, 86], [665, 86], [730, 165]], kind: 'siding', name: '调车场 1道', labelPos: [575, 72] },
        { id: 't_c2', pts: [[410, 165], [485, 140], [665, 140], [730, 165]], kind: 'siding', name: '调车场 2道', labelPos: [575, 126] },
        { id: 't_c3', pts: [[410, 165], [485, 194], [665, 194], [730, 165]], kind: 'siding', name: '调车场 3道', labelPos: [575, 180] },
        { id: 't_c4', pts: [[410, 165], [485, 248], [665, 248], [730, 165]], kind: 'siding', name: '调车场 4道', labelPos: [575, 264] },
        { id: 't_dep', pts: [[730, 165], [855, 165]], kind: 'main', name: '出发场 →', labelPos: [800, 148] }
      ],
      sections: [
        { id: '到达', x1: 30, x2: 210, y: 130 },
        { id: '到达2', x1: 30, x2: 210, y: 180 },
        { id: '峰顶', x1: 260, x2: 410, y: 148, pts: [[260, 165], [340, 132], [410, 165]] },
        { id: '调1', x1: 485, x2: 665, y: 86 },
        { id: '调2', x1: 485, x2: 665, y: 140 },
        { id: '调3', x1: 485, x2: 665, y: 194 },
        { id: '调4', x1: 485, x2: 665, y: 248 },
        { id: '出发', x1: 730, x2: 855, y: 165 }
      ],
      switches: [
        { id: '分1', x: 410, y: 165, dir: 'R', branchDy: -79, defPos: 'N', label: '峰下分岔', labelDy: -16 },
        { id: '分2', x: 455, y: 208, dir: 'R', branchDy: 40, defPos: 'N', label: '股道分岔', labelDy: 24 }
      ],
      insulations: [{ x: 260, y: 165 }, { x: 410, y: 165 }, { x: 730, y: 165 }],
      signals: [
        { id: '驼峰', x: 340, y: 112, dir: 'R', type: 'shunt', defAspect: 'L' },
        { id: '出2', x: 665, y: 122, dir: 'R', type: 'shunt', defAspect: 'A' }
      ],
      markers: [
        { x: 260, y: 288, kind: 'hump', text: '推送上峰 → 峰顶摘钩 → 重力溜放 + 减速器调速' }
      ],
      routes: [
        { id: 'r1', name: '① 驼峰溜放解体至 调车场 1道（北向货车组）', signal: '驼峰', aspect: 'L', reqSw: { '分1': 'R' }, secs: ['到达', '峰顶', '调1'], path: [[60, 130], [210, 130], [260, 165], [340, 132], [410, 165], [485, 86], [640, 86]], trainKind: 'freight', desc: '推送至驼峰峰顶后靠重力坡加速溜放，经减速器调速安全连挂至调车场 1 道。' },
        { id: 'r2', name: '② 驼峰溜放解体至 调车场 4道（南向货车组）', signal: '驼峰', aspect: 'U', reqSw: { '分1': 'N', '分2': 'R' }, secs: ['到达2', '峰顶', '调4'], path: [[60, 180], [210, 180], [260, 165], [340, 132], [410, 165], [485, 248], [640, 248]], trainKind: 'freight', desc: '分路道岔自动转换至 4 道，车组溜放入 4 道集结编组。' },
        { id: 'r3', name: '③ 编组完成由调车场 2道 牵出至出发场发车', signal: '出2', aspect: 'B', reqSw: { '分1': 'N', '分2': 'N' }, secs: ['调2', '出发'], path: [[500, 140], [665, 140], [730, 165], [840, 165]], desc: '完成集结编组、列检与试风后，由调车场 2 道开放出2信号经牵出转入出发场发往区间。' }
      ]
    },
    {
      id: '2.1.6', ch: 2, page: 18, engine: 'yard',
      title: '图 2.1.6 · 安全线（防护侧面冲突的隔开设备仿真）',
      summary: '安全线为防止列车或机车车辆进入另一列车进路发生侧面冲突而设置（有效长一般不少于 50 m）。衔接到发线/岔线的道岔常态**定位必开通安全线**，失控车列自动被导入车挡！',
      tracks: [
        { id: 't_main', pts: [[30, 130], [850, 130]], kind: 'main', name: '正线 / 接发车进路', labelPos: [560, 112] },
        { id: 't_side', pts: [[180, 220], [500, 220], [600, 130]], kind: 'siding', name: '站线 / 货场岔线', labelPos: [260, 240] },
        { id: 't_safe', pts: [[500, 220], [740, 220]], kind: 'safety', name: '安全线（≥ 50 m · 尽头车挡）', labelPos: [625, 240] }
      ],
      sections: [
        { id: '正线', x1: 30, x2: 850, y: 130 },
        { id: '岔线', x1: 180, x2: 500, y: 220 },
        { id: '安全线', x1: 518, x2: 740, y: 220 }
      ],
      switches: [
        { id: '4', x: 500, y: 220, dir: 'R', branchDy: -90, defPos: 'N', label: '4# (定位通安全线!)' }
      ],
      insulations: [{ x: 470, y: 220 }, { x: 600, y: 130 }],
      signals: [
        { id: 'D4', x: 470, y: 202, dir: 'R', type: 'shunt', defAspect: 'A' },
        { id: 'X', x: 140, y: 112, dir: 'R', type: 'home', defAspect: 'L' }
      ],
      markers: [
        { x: 740, y: 220, kind: 'buffer', text: '车挡' }
      ],
      routes: [
        { id: 'r1', name: '① 岔线车辆溜逸：4#定位自动导入安全线防护！', signal: 'D4', aspect: 'A', reqSw: { '4': 'N' }, secs: ['岔线', '安全线'], path: [[200, 220], [705, 220]], trainKind: 'runaway', desc: '4# 道岔常态定位开通安全线；即使岔线车辆冒进蓝灯或溜逸，也被强行导入尽头安全线，严防撞击正线列车！' },
        { id: 'r2', name: '② 办理出岔调车：确认正线无车后 4# 转反位', signal: 'D4', aspect: 'B', reqSw: { '4': 'R' }, secs: ['岔线', '正线'], path: [[200, 220], [500, 220], [600, 130], [820, 130]], trainKind: 'shunt', desc: '正线空闲且未建进路时，方可将 4# 转反位并开放 D4 月白灯驶入正线。' }
      ]
    },
    {
      id: '2.1.7', ch: 2, page: 18, engine: 'yard', physicsMode: 'catchSlope',
      title: '图 2.1.7 · 避难线（长大下坡道失控列车上坡减速制动物理仿真）',
      summary: '在长大下坡道车站入口前设置陡峭上坡的避难线，道岔常态定位指向避难线。调节坡度与初速，观察失控列车冲入避难线后按真实动力学 $a = -g\\sin\\theta - \\mu g$ 减速停稳！',
      controls: [
        { id: 'v0', type: 'range', label: '失控进线初速度 (km/h)', min: 40, max: 120, step: 10, def: 80 },
        { id: 'grade', type: 'range', label: '避难线上坡坡度 (‰)', min: 30, max: 100, step: 10, def: 60 }
      ],
      tracks: [
        { id: 't_down', pts: [[30, 150], [340, 210], [840, 210]], kind: 'main', name: '长大下坡道 → 车站正线', labelPos: [600, 232] },
        { id: 't_catch', pts: [[340, 210], [780, 72]], kind: 'safety', name: '陡上坡避难线（砂石阻滞+重力制动）', labelPos: [560, 102] }
      ],
      sections: [
        { id: '坡道', x1: 30, y1: 150, x2: 340, y2: 210, y: 180 },
        { id: '避难线', x1: 375, y1: 199, x2: 780, y2: 72, y: 136 },
        { id: '正线', x1: 375, y1: 210, x2: 840, y2: 210, y: 210 }
      ],
      switches: [
        { id: '避1', x: 340, y: 210, dir: 'R', branchDy: -138, defPos: 'N', label: '避难线道岔(定位通上坡)' }
      ],
      insulations: [{ x: 310, y: 204 }],
      signals: [
        { id: 'X', x: 300, y: 182, dir: 'R', type: 'home', defAspect: 'H' }
      ],
      markers: [
        { x: 780, y: 72, kind: 'buffer', text: '砂石阻车挡' },
        { x: 160, y: 148, kind: 'slope', text: '下坡道 ↘' }
      ],
      routes: [
        { id: 'r1', name: '▶ 制动失灵列车冲入上坡避难线（动力学实时制动）', signal: 'X', aspect: 'H', reqSw: { '避1': 'N' }, secs: ['坡道', '避难线'], path: [[40, 152], [340, 210], [740, 84]], trainKind: 'runaway', desc: '道岔常态定位开通避难线！失控列车沿陡上坡受重力分力与砂阻急速减速停稳，避免冲入车站造成重大事故。' },
        { id: 'r2', name: '② 正常受控列车进站：道岔转反位入正线', signal: 'X', aspect: 'U', reqSw: { '避1': 'R' }, secs: ['坡道', '正线'], path: [[40, 152], [340, 210], [780, 210]], desc: '确认列车制动正常受控后，将道岔操至反位并开放进站黄灯接入车站。' }
      ]
    },
    {
      id: '2.1.8', ch: 2, page: 18, engine: 'yard',
      title: '图 2.1.8 · 上下行咽喉区示意（双咽喉对称作业仿真）',
      summary: '车站两端道岔集中的区段称为咽喉区。按列车运行方向划分下行咽喉（进站端，奇数编号）与上行咽喉（偶数编号），两咽喉需严格执行迎面照查防止向同一股道迎面接车。',
      tracks: [
        { id: 't_m1', pts: [[30, 145], [850, 145]], kind: 'main', name: 'ⅠG 正线', labelPos: [440, 130] },
        { id: 't_m2', pts: [[30, 195], [850, 195]], kind: 'main', name: 'ⅡG 正线', labelPos: [440, 212] },
        { id: 't_3g', pts: [[210, 145], [260, 95], [620, 95], [670, 145]], kind: 'siding', name: '3G', labelPos: [440, 82] },
        { id: 't_4g', pts: [[210, 195], [260, 245], [620, 245], [670, 195]], kind: 'siding', name: '4G', labelPos: [440, 262] },
        { id: 't_x1', pts: [[130, 145], [190, 195]], kind: 'branch' },
        { id: 't_x2', pts: [[690, 145], [750, 195]], kind: 'branch' }
      ],
      sections: [
        { id: '下行咽喉', x1: 90, x2: 260, y: 145, label: '下行咽喉区(奇)' },
        { id: 'IG', x1: 260, x2: 620, y: 145 },
        { id: 'IIG', x1: 260, x2: 620, y: 195 },
        { id: '上行咽喉', x1: 620, x2: 790, y: 195, label: '上行咽喉区(偶)' }
      ],
      switches: [
        { id: '1/3', x: 130, y: 145, dir: 'R', branchDy: 50, defPos: 'N', label: '1/3' },
        { id: '5', x: 210, y: 145, dir: 'R', branchDy: -50, defPos: 'N', label: '5' },
        { id: '6', x: 670, y: 145, dir: 'L', branchDy: -50, defPos: 'N', label: '6' },
        { id: '2/4', x: 750, y: 195, dir: 'L', branchDy: -50, defPos: 'N', label: '2/4' }
      ],
      insulations: [{ x: 90, y: 145 }, { x: 260, y: 145 }, { x: 620, y: 145 }, { x: 790, y: 195 }],
      signals: [
        { id: 'X', x: 90, y: 127, dir: 'R', type: 'home', defAspect: 'H' },
        { id: 'S', x: 790, y: 213, dir: 'L', type: 'home', defAspect: 'H' }
      ],
      markers: [
        { x: 175, y: 50, kind: 'label', text: '◀ 下行咽喉区（道岔奇数）' },
        { x: 705, y: 50, kind: 'label', text: '上行咽喉区（道岔偶数） ▶' }
      ],
      routes: [
        { id: 'r1', name: '① 下行咽喉接车 X → ⅠG', signal: 'X', aspect: 'U', reqSw: { '1/3': 'N', '5': 'N' }, secs: ['下行咽喉', 'IG'], path: [[35, 145], [580, 145]], desc: '经下行咽喉（奇数道岔）进入正线 ⅠG。' },
        { id: 'r2', name: '② 上行咽喉接车 S → ⅡG', signal: 'S', aspect: 'U', reqSw: { '2/4': 'N', '6': 'N' }, secs: ['上行咽喉', 'IIG'], path: [[845, 195], [300, 195]], desc: '经上行咽喉（偶数道岔）进入正线 ⅡG，与下行正线互不干扰可平行办理。' }
      ]
    },
    {
      id: '2.1.9', ch: 2, page: 19, engine: 'yard', physicsMode: 'foulingCalc',
      title: '图 2.1.9 · 警冲标及其布置与股道有效长实时测算仿真',
      summary: '警冲标设在两会合线路线间距离为 4 m 的中间（距两线中心各 2000 mm，曲线地段加宽 Δ）。拖动列车尾端位置并调节曲线半径加宽量，实时判别是否侵限与股道有效长边界！',
      controls: [
        { id: 'tailPos', type: 'range', label: '停放车列尾部位置（相对警冲标 m）', min: -30, max: 30, step: 2, def: -10 },
        { id: 'delta', type: 'range', label: '曲线建筑限界加宽 Δ (mm)', min: 0, max: 200, step: 20, def: 0 }
      ],
      tracks: [
        { id: 't_m', pts: [[40, 195], [840, 195]], kind: 'main', name: '直股线路（主线）', labelPos: [620, 215] },
        { id: 't_b', pts: [[160, 195], [430, 105], [840, 105]], kind: 'siding', name: '侧股线路（股道有效长测算）', labelPos: [650, 88] }
      ],
      sections: [
        { id: '岔区', x1: 120, x2: 390, y: 195 },
        { id: '侧股', x1: 430, x2: 780, y: 105 }
      ],
      switches: [{ id: '1', x: 160, y: 195, dir: 'R', branchDy: -90, defPos: 'N', label: '1# 尖轨尖端' }],
      insulations: [{ x: 350, y: 132, kind: 'normal', label: '绝缘节 (≥3.5m)' }],
      signals: [
        { id: 'X', x: 120, y: 177, dir: 'R', type: 'home', defAspect: 'H' },
        { id: 'S3', x: 780, y: 88, dir: 'L', type: 'dep', defAspect: 'H' }
      ],
      markers: [
        { x: 390, y: 150, kind: 'fouling', text: '警冲标 (两线距4m / 中心各2000+Δ)' }
      ],
      routes: [
        { id: 'r1', name: '▶ 直股通过列车检验警冲标安全限界', signal: 'X', aspect: 'L', reqSw: { '1': 'N' }, secs: ['岔区'], path: [[50, 195], [820, 195]], desc: '侧股停留车位于警冲标内方（≤ 0 m）时，直股进路 X 开放绿灯 L；一旦越过警冲标（> 0 m），联锁强制封锁 X 红灯 H！' }
      ]
    },
    {
      id: '2.2.1', ch: 2, page: 20, engine: 'yard',
      title: '图 2.2.1 · 主、次要发车方向（信号显示与进路表示器联动）',
      summary: '当车站咽喉连接两条不同方向线路时，需明确区分主要发车方向（通常直向，亮单绿 L）与次要发车方向（通常侧向分歧，亮双绿 LL 或单绿 L + 白色进路方向表示器）。',
      jump3d: { label: '🚦 进入 2.3 四显示出站信号机 3D 模型', go: { mode: 'signal', signalType: 'depFour', signalAspect: 'LL' } },
      tracks: [
        { id: 't_main', pts: [[40, 175], [840, 175]], kind: 'main', name: '主要发车方向（干线正线 → L）', labelPos: [670, 195] },
        { id: 't_sub', pts: [[420, 175], [520, 95], [840, 95]], kind: 'siding', name: '次要发车方向（支线分歧 → LL / 表示器）', labelPos: [675, 78] }
      ],
      sections: [
        { id: 'IG', x1: 60, x2: 330, y: 175, label: '站内股道 ⅠG' },
        { id: '主方向', x1: 330, x2: 830, y: 175 },
        { id: '次方向', x1: 438, x2: 830, y: 95, pts: [[438, 161], [520, 95], [830, 95]] }
      ],
      switches: [{ id: '11', x: 420, y: 175, dir: 'R', branchDy: -80, defPos: 'N', label: '11# 分歧道岔' }],
      insulations: [{ x: 330, y: 175 }],
      signals: [{ id: 'XⅠ', x: 330, y: 155, dir: 'R', type: 'dep', defAspect: 'H' }],
      routes: [
        { id: 'r1', name: '① 向主要方向发车（11#定位 · 亮绿灯 L · ZXJ↑）', signal: 'XⅠ', aspect: 'L', reqSw: { '11': 'N' }, secs: ['IG', '主方向'], path: [[90, 175], [810, 175]], desc: '主要发车方向：道岔直向定位，ZXJ↑，出站信号机亮绿灯 L。' },
        { id: 'r2', name: '② 向次要方向发车（11#反位 · 亮双绿 LL / L+表示器 · ZXJ↓）', signal: 'XⅠ', aspect: 'LL', reqSw: { '11': 'R' }, secs: ['IG', '次方向'], path: [[90, 175], [420, 175], [520, 95], [810, 95]], desc: '次要发车方向：道岔反位，ZXJ↓，按图 5.1.3 需先检方向表示器 3DJ↑ 再开放允许灯光（或四显示亮 LL）。' }
      ]
    },
    {
      id: '2.3.1', ch: 2, page: 21, engine: 'yard',
      title: '图 2.3.1 · 典型小站下行咽喉信号机布置',
      summary: '典型小站下行咽喉完整信号机布置：进站 X/X_F（高柱）、调车 D1/D3/D5/D7（矮柱）、正线出站 SⅠ/SⅡ（高柱或站线矮柱）与侧线出站 S3/S4（矮柱不侵限），点击任意进路联动！',
      jump3d: { label: '🚉 直达 03 下行咽喉 3D 沙盘', go: { mode: 'station' } },
      tracks: [
        { id: 't_ig', pts: [[30, 140], [850, 140]], kind: 'main', name: 'ⅠG (正线)', labelPos: [780, 126] },
        { id: 't_iig', pts: [[30, 200], [850, 200]], kind: 'main', name: 'ⅡG (正线)', labelPos: [780, 218] },
        { id: 't_3g', pts: [[560, 140], [630, 82], [850, 82]], kind: 'siding', name: '3G (侧线)', labelPos: [780, 68] },
        { id: 't_4g', pts: [[560, 200], [630, 258], [850, 258]], kind: 'siding', name: '4G (侧线)', labelPos: [780, 276] },
        { id: 't_c13', pts: [[240, 140], [320, 200]], kind: 'branch' },
        { id: 't_c57', pts: [[470, 140], [390, 200]], kind: 'branch' }
      ],
      sections: [
        { id: 'IAG', x1: 110, x2: 205, y: 140, label: 'IAG' },
        { id: '1DG', x1: 205, x2: 335, y: 140, label: '1DG' },
        { id: '1/7G', x1: 335, x2: 430, y: 140, label: '1/7G' },
        { id: '7-11DG', x1: 430, x2: 660, y: 140, label: '7-11DG' },
        { id: 'IG', x1: 660, x2: 850, y: 140 },
        { id: '3G', x1: 660, x2: 850, y: 82 }
      ],
      switches: [
        { id: '1/3', x: 240, y: 140, dir: 'R', branchDy: 60, defPos: 'N', label: '1/3' },
        { id: '5/7', x: 470, y: 140, dir: 'L', branchDy: 60, defPos: 'N', label: '5/7' },
        { id: '11', x: 560, y: 140, dir: 'R', branchDy: -58, defPos: 'N', label: '11' },
        { id: '9', x: 560, y: 200, dir: 'R', branchDy: 58, defPos: 'N', label: '9' }
      ],
      insulations: [{ x: 110, y: 140 }, { x: 205, y: 140 }, { x: 335, y: 140 }, { x: 430, y: 140 }, { x: 660, y: 140 }, { x: 660, y: 82 }],
      signals: [
        { id: 'X', x: 110, y: 120, dir: 'R', type: 'home', defAspect: 'H' },
        { id: 'X_F', x: 110, y: 218, dir: 'R', type: 'home', defAspect: 'H' },
        { id: 'D1', x: 205, y: 158, dir: 'R', type: 'shunt', defAspect: 'A' },
        { id: 'D3', x: 335, y: 158, dir: 'L', type: 'shunt', defAspect: 'A' },
        { id: 'D7', x: 430, y: 158, dir: 'R', type: 'shunt', defAspect: 'A' },
        { id: 'D5', x: 355, y: 218, dir: 'R', type: 'shunt', defAspect: 'A' },
        { id: 'S3', x: 660, y: 64, dir: 'L', type: 'dep', defAspect: 'H' },
        { id: 'SⅠ', x: 660, y: 120, dir: 'L', type: 'dep', defAspect: 'H' },
        { id: 'SⅡ', x: 660, y: 182, dir: 'L', type: 'dep', defAspect: 'H' },
        { id: 'S4', x: 660, y: 240, dir: 'L', type: 'dep', defAspect: 'H' }
      ],
      routes: [
        { id: 'r1', name: '① X → ⅠG 正线接车 (U)', signal: 'X', aspect: 'U', reqSw: { '1/3': 'N', '5/7': 'N', '11': 'N' }, secs: ['IAG', '1DG', '1/7G', '7-11DG', 'IG'], path: [[40, 140], [820, 140]], desc: '经下行咽喉全定位进入 ⅠG。' },
        { id: 'r2', name: '② X → 3G 侧线接车 (UU)', signal: 'X', aspect: 'UU', reqSw: { '1/3': 'N', '5/7': 'N', '11': 'R' }, secs: ['IAG', '1DG', '1/7G', '7-11DG', '3G'], path: [[40, 140], [560, 140], [630, 82], [820, 82]], desc: '11# 反位，开放双黄 UU 入 3G。' },
        { id: 'r3', name: '③ D7 → ⅠG 调车作业 (B)', signal: 'D7', aspect: 'B', reqSw: { '5/7': 'N', '11': 'N' }, secs: ['7-11DG', 'IG'], path: [[380, 140], [810, 140]], trainKind: 'shunt', desc: '差置调车信号机 D7 开放月白灯 B 调车入 ⅠG。' }
      ]
    },
    {
      id: '2.3.2', ch: 2, page: 23, engine: 'yard',
      title: '图 2.3.2 · 调车信号机布置（单置 D21 · 差置 D11/D15 · 并置 D7/D9 · 折返 25#）',
      summary: '完整演示教材图 2.3.2 调车信号机的四种作用（阻拦/起止/折返）：同一架单置调车信号机 D21 在 1G→ⅡG 牵出时作“阻拦信号机”，而在 23DG→D15 时作“起始信号机”！',
      tracks: [
        { id: 't_1g', pts: [[40, 120], [600, 120], [680, 175], [840, 175]], kind: 'main', name: '1G → 牵出线', labelPos: [140, 105] },
        { id: 't_2g', pts: [[40, 210], [580, 210], [650, 175], [680, 175]], kind: 'main', name: 'ⅡG', labelPos: [140, 228] },
        { id: 't_mid', pts: [[280, 120], [360, 210]], kind: 'branch' },
        { id: 't_sub', pts: [[440, 120], [510, 210]], kind: 'branch' }
      ],
      sections: [
        { id: '1G', x1: 40, x2: 240, y: 120 },
        { id: '7-9DG', x1: 240, x2: 390, y: 120, label: '并置 D7/D9' },
        { id: '11-15DG', x1: 390, x2: 560, y: 120, label: '差置 D11/D15' },
        { id: '23DG', x1: 650, x2: 730, y: 175, label: '23DG/25#' },
        { id: '牵出线', x1: 730, x2: 840, y: 175 },
        { id: 'ⅡG', x1: 40, x2: 520, y: 210 }
      ],
      switches: [
        { id: '25', x: 680, y: 175, dir: 'L', branchDy: -55, defPos: 'N', label: '25#折返道岔' }
      ],
      insulations: [{ x: 240, y: 120 }, { x: 390, y: 120 }, { x: 560, y: 120 }, { x: 730, y: 175 }],
      signals: [
        { id: 'D7', x: 240, y: 102, dir: 'L', type: 'shunt', defAspect: 'A' },
        { id: 'D9', x: 256, y: 138, dir: 'R', type: 'shunt', defAspect: 'A' },
        { id: 'D11', x: 390, y: 102, dir: 'L', type: 'shunt', defAspect: 'A' },
        { id: 'D15', x: 540, y: 138, dir: 'R', type: 'shunt', defAspect: 'A' },
        { id: 'D21', x: 730, y: 155, dir: 'L', type: 'shunt', defAspect: 'A' }
      ],
      routes: [
        { id: 'r1', name: '① 1G 牵出至 23DG（D21 蓝灯阻拦，防越入牵出尽头）', signal: 'D15', aspect: 'B', reqSw: { '25': 'N' }, secs: ['1G', '7-9DG', '11-15DG', '23DG'], path: [[120, 120], [600, 120], [680, 175], [715, 175]], trainKind: 'shunt', desc: '1G 车列向右牵出经 25# 折返道岔停于 D21 前方，此时单置 D21 作阻拦信号机（保持蓝灯 A）。' },
        { id: 'r2', name: '② 折返由 D21 → ⅡG（同一 D21 变为起始信号机开白灯 B）', signal: 'D21', aspect: 'B', reqSw: { '25': 'R' }, secs: ['牵出线', '23DG', 'ⅡG'], path: [[795, 175], [650, 175], [580, 210], [160, 210]], trainKind: 'shunt', desc: '25# 转反位后，同一架 D21 变为折返调车起始信号机并开放月白灯 B，调车列自牵出线越过 D21 转入 ⅡG！' }
      ]
    },
    {
      id: '2.4.1', ch: 2, page: 27, engine: 'yard', physicsMode: 'turnoutZoom',
      title: '图 2.4.1 · 单开道岔机械构造与尖轨密贴动作仿真',
      summary: '单开道岔由转辙器（基本轨+尖轨+转辙机）、连接部分（直/弯合拢轨）和辙叉及护轨（辙叉心+翼轨+护轮轨）三部分组成。点击切换道岔定位/反位并运行列车观察轮缘导向！',
      jump3d: { label: '🔧 进入 01 四线制道岔控制 3D 实验台', go: { mode: 'bench', type: 'turnoutLab' } },
      tracks: [
        { id: 't_main', pts: [[40, 185], [840, 185]], kind: 'main', name: '直基本轨 → 直合拢轨 → 辙叉心(直)', labelPos: [440, 210] },
        { id: 't_div', pts: [[230, 185], [510, 125], [840, 95]], kind: 'siding', name: '曲尖轨 → 导曲线 → 翼轨/护轮轨(曲)', labelPos: [560, 82] }
      ],
      sections: [{ id: '1DG', x1: 100, x2: 780, y: 185, label: '单开道岔区段 1DG' }],
      switches: [{ id: '1', x: 230, y: 185, dir: 'R', branchDy: -60, defPos: 'N', label: '尖轨密贴点(转辙器)' }],
      insulations: [{ x: 100, y: 185 }, { x: 780, y: 185 }, { x: 780, y: 100 }],
      signals: [{ id: 'X', x: 100, y: 165, dir: 'R', type: 'home', defAspect: 'U' }],
      markers: [
        { x: 240, y: 242, kind: 'label', text: '① 转辙器（基本轨+尖轨）' },
        { x: 460, y: 242, kind: 'label', text: '② 连接部分（导曲线）' },
        { x: 670, y: 242, kind: 'label', text: '③ 辙叉心 + 翼轨 + 护轮轨' }
      ],
      routes: [
        { id: 'r1', name: '① 定位（尖轨左密贴）→ 列车直向高速通过', signal: 'X', aspect: 'L', reqSw: { '1': 'N' }, secs: ['1DG'], path: [[60, 185], [820, 185]], desc: '曲尖轨密贴左基本轨、直尖轨斥离，车轮沿直股顺畅通过，护轮轨防止轮缘撞击辙叉心尖。' },
        { id: 'r2', name: '② 反位（尖轨右密贴）→ 列车经导曲线侧向通过', signal: 'X', aspect: 'UU', reqSw: { '1': 'R' }, secs: ['1DG'], path: [[60, 185], [230, 185], [510, 125], [820, 96]], desc: '直尖轨斥离、曲尖轨密贴右基本轨，导向车轮限速转入侧股。' }
      ]
    },
    {
      id: '2.4.2', ch: 2, page: 27, engine: 'yard',
      title: '图 2.4.2 · 对向与顺向道岔（运行方向相对性仿真）',
      summary: '同一组道岔的对向与顺向完全取决于列车运行方向：由尖轨向辙叉心运行为**对向道岔**（必须先密贴锁闭，严防四开脱轨）；由辙叉心向尖轨运行为**顺向道岔**（未对通将发生挤岔）。',
      tracks: [
        { id: 't_m', pts: [[40, 175], [840, 175]], kind: 'main', name: '直股线路', labelPos: [680, 195] },
        { id: 't_s', pts: [[380, 175], [540, 105], [840, 105]], kind: 'siding', name: '侧股线路', labelPos: [680, 90] }
      ],
      sections: [{ id: '1DG', x1: 160, x2: 720, y: 175 }],
      switches: [{ id: '1', x: 380, y: 175, dir: 'R', branchDy: -70, defPos: 'N', label: '1# 道岔' }],
      insulations: [{ x: 160, y: 175 }, { x: 720, y: 175 }],
      signals: [
        { id: '左→右', x: 160, y: 155, dir: 'R', type: 'home', defAspect: 'U' },
        { id: '右→左', x: 720, y: 195, dir: 'L', type: 'dep', defAspect: 'L' }
      ],
      routes: [
        { id: 'r1', name: '① 左 → 右（对向经过 1#：先碰尖轨，决定去向）', signal: '左→右', aspect: 'UU', reqSw: { '1': 'R' }, secs: ['1DG'], path: [[60, 175], [380, 175], [540, 105], [810, 105]], desc: '列车先遇尖轨后遇辙叉——对向道岔！进路必须锁闭 1# 密贴，否则可能“骑马”脱轨。' },
        { id: 'r2', name: '② 右 → 左（顺向经过 1#：先碰辙叉，严防挤岔）', signal: '右→左', aspect: 'L', reqSw: { '1': 'N' }, secs: ['1DG'], path: [[810, 175], [60, 175]], desc: '列车由辙叉心驶向尖轨——顺向道岔！若 1# 在反位强行压入将顶开移位接触器引发挤岔报警。' }
      ]
    },
    {
      id: '2.4.3', ch: 2, page: 27, engine: 'yard',
      title: '图 2.4.3 · 单动与双动道岔（1/3、2/4 渡线同步联动仿真）',
      summary: '单动道岔（如 7#、8#）单独操纵；连接两平行线路渡线的两端道岔（如 1/3#、2/4#）编为双动道岔，由同一组命令同步转换（同定位平行直通、同反位跨线渡过）。',
      tracks: [
        { id: 't_u', pts: [[40, 130], [840, 130]], kind: 'main', name: '下行线', labelPos: [440, 114] },
        { id: 't_d', pts: [[40, 200], [840, 200]], kind: 'main', name: '上行线', labelPos: [440, 218] },
        { id: 't_x1', pts: [[180, 130], [270, 200]], kind: 'branch', name: '双动渡线 1/3', labelPos: [255, 165] },
        { id: 't_x2', pts: [[560, 200], [650, 130]], kind: 'branch', name: '双动渡线 2/4', labelPos: [625, 165] },
        { id: 't_s7', pts: [[360, 130], [430, 72], [580, 72]], kind: 'siding', name: '单动 7# 支线', labelPos: [510, 58] },
        { id: 't_s8', pts: [[360, 200], [430, 258], [580, 258]], kind: 'siding', name: '单动 8# 支线', labelPos: [510, 274] }
      ],
      sections: [
        { id: '1-3DG', x1: 140, x2: 310, y: 130 },
        { id: '7DG', x1: 310, x2: 490, y: 130 },
        { id: '2-4DG', x1: 520, x2: 700, y: 200 }
      ],
      switches: [
        { id: '1/3', x: 180, y: 130, dir: 'R', branchDy: 70, defPos: 'N', label: '1/3 双动' },
        { id: '7', x: 360, y: 130, dir: 'R', branchDy: -58, defPos: 'N', label: '7 单动' },
        { id: '8', x: 360, y: 200, dir: 'R', branchDy: 58, defPos: 'N', label: '8 单动' },
        { id: '2/4', x: 650, y: 130, dir: 'L', branchDy: 70, defPos: 'N', label: '2/4 双动' }
      ],
      insulations: [{ x: 140, y: 130 }, { x: 310, y: 130 }, { x: 520, y: 200 }, { x: 700, y: 130 }],
      signals: [{ id: 'X', x: 140, y: 112, dir: 'R', type: 'home', defAspect: 'H' }],
      routes: [
        { id: 'r1', name: '① 双动 1/3 同反位跨渡线至上行线', signal: 'X', aspect: 'UU', reqSw: { '1/3': 'R', '7': 'N', '8': 'N' }, secs: ['1-3DG'], path: [[50, 130], [180, 130], [270, 200], [820, 200]], desc: '双动 1/3 同时转换至反位（1 动完转 3），构通平行线渡线。' },
        { id: 'r2', name: '② 单动 7# 反位入侧支线（1/3 定位）', signal: 'X', aspect: 'UU', reqSw: { '1/3': 'N', '7': 'R' }, secs: ['1-3DG', '7DG'], path: [[50, 130], [360, 130], [430, 72], [560, 72]], desc: '单动 7# 独立转反位，不影响双动 1/3 与单动 8#。' }
      ]
    },
    {
      id: '2.4.4', ch: 2, page: 28, engine: 'yard',
      title: '图 2.4.4 · 单线车站道岔定位位置（防迎面相撞安全定位规则）',
      summary: '单线车站上下行共用区间单线！为防两咽喉同时接车进同一股道迎面相撞，规定**由两端分别开通不同股道为定位**：左端 1# 弯股定位通 3G，右端 2# 直股定位通 ⅡG（破除“定位=直股”误区）！',
      tracks: [
        { id: 't_m', pts: [[40, 185], [840, 185]], kind: 'main', name: 'ⅡG（右端 2# 直股定位）', labelPos: [440, 205] },
        { id: 't_s', pts: [[210, 185], [290, 115], [590, 115], [670, 185]], kind: 'siding', name: '3G（左端 1# 弯股定位!）', labelPos: [440, 98] }
      ],
      sections: [
        { id: '1DG', x1: 150, x2: 300, y: 185 },
        { id: '3G', x1: 300, x2: 580, y: 115 },
        { id: 'IIG', x1: 300, x2: 580, y: 185 },
        { id: '2DG', x1: 580, x2: 730, y: 185 }
      ],
      switches: [
        { id: '1', x: 210, y: 185, dir: 'R', branchDy: -70, defPos: 'R', label: '1# (定位通曲股3G!)' },
        { id: '2', x: 670, y: 185, dir: 'L', branchDy: -70, defPos: 'N', label: '2# (定位通直股ⅡG)' }
      ],
      insulations: [{ x: 150, y: 185 }, { x: 730, y: 185 }],
      signals: [
        { id: 'X', x: 150, y: 165, dir: 'R', type: 'home', defAspect: 'H' },
        { id: 'S', x: 730, y: 205, dir: 'L', type: 'home', defAspect: 'H' }
      ],
      routes: [
        { id: 'r1', name: '① 下行按定位接车：1# 弯股定位入 3G', signal: 'X', aspect: 'UU', reqSw: { '1': 'R' }, secs: ['1DG', '3G'], path: [[50, 185], [210, 185], [290, 115], [560, 115]], desc: '即使未操道岔，1# 常态定位也引向 3G，与右端来车自动错开股道！' },
        { id: 'r2', name: '② 上行按定位接车：2# 直股定位入 ⅡG', signal: 'S', aspect: 'U', reqSw: { '2': 'N' }, secs: ['2DG', 'IIG'], path: [[830, 185], [320, 185]], desc: '右端 2# 定位通直股 ⅡG，单线站两端定位分入不同股道，天然防迎面冲突。' }
      ]
    },
    {
      id: '2.4.5', ch: 2, page: 28, engine: 'yard',
      title: '图 2.4.5 · 安全线、避难线道岔定位位置（安全优先铁律）',
      summary: '引向安全线、避难线的道岔，一律规定以**开通安全线或避难线的位置为定位**，无论直股还是弯股，均以最高安全等级隔开正线与侧线作业。',
      tracks: [
        { id: 't_m', pts: [[40, 145], [840, 145]], kind: 'main', name: '正线 / 到发线', labelPos: [560, 128] },
        { id: 't_b', pts: [[160, 225], [470, 225], [560, 145]], kind: 'siding', name: '专用线 / 货线', labelPos: [250, 244] },
        { id: 't_safe', pts: [[470, 225], [760, 225]], kind: 'safety', name: '安全线 / 避难线（道岔定位方向！）', labelPos: [620, 244] }
      ],
      sections: [{ id: '专用线', x1: 160, x2: 470, y: 225 }, { id: '安全线', x1: 470, x2: 760, y: 225 }],
      switches: [{ id: '6', x: 470, y: 225, dir: 'R', branchDy: -80, defPos: 'N', label: '6# (定位→安全线)' }],
      insulations: [{ x: 440, y: 225 }],
      signals: [{ id: 'D6', x: 440, y: 207, dir: 'R', type: 'shunt', defAspect: 'A' }],
      markers: [{ x: 760, y: 225, kind: 'buffer', text: '尽头车挡' }],
      routes: [
        { id: 'r1', name: '① 定位态：自动导入安全线/避难线隔开防护', signal: 'D6', aspect: 'A', reqSw: { '6': 'N' }, secs: ['专用线', '安全线'], path: [[190, 225], [725, 225]], trainKind: 'runaway', desc: '作业完毕后 6# 必复归定位通安全线，防止溜车侵入正线。' },
        { id: 'r2', name: '② 反位态：经联锁准许转出至到发线', signal: 'D6', aspect: 'B', reqSw: { '6': 'R' }, secs: ['专用线'], path: [[190, 225], [470, 225], [560, 145], [800, 145]], trainKind: 'shunt', desc: '仅在允许取送车时转反位。' }
      ]
    },
    {
      id: '2.4.6', ch: 2, page: 28, engine: 'yard',
      title: '图 2.4.6 · 双线车站道岔定位位置与奇偶编号规则',
      summary: '双线车站各正线上的道岔以**开通各自正线位置为定位**（高效直通），且由站外向站内顺序编号：**下行到达端编奇数（1、3、5、7…），上行到达端编偶数（2、4、6、8…）**！',
      tracks: [
        { id: 't_1', pts: [[30, 140], [850, 140]], kind: 'main', name: '下行正线 ⅠG (道岔定位直通)', labelPos: [440, 124] },
        { id: 't_2', pts: [[30, 200], [850, 200]], kind: 'main', name: '上行正线 ⅡG (道岔定位直通)', labelPos: [440, 220] },
        { id: 't_3', pts: [[240, 140], [295, 86], [585, 86], [640, 140]], kind: 'siding', name: '3G', labelPos: [440, 72] },
        { id: 't_4', pts: [[240, 200], [295, 254], [585, 254], [640, 200]], kind: 'siding', name: '4G', labelPos: [440, 270] },
        { id: 't_x1', pts: [[140, 140], [210, 200]], kind: 'branch' },
        { id: 't_x2', pts: [[670, 200], [740, 140]], kind: 'branch' }
      ],
      sections: [{ id: 'IG', x1: 295, x2: 585, y: 140 }, { id: 'IIG', x1: 295, x2: 585, y: 200 }],
      switches: [
        { id: '1/3', x: 140, y: 140, dir: 'R', branchDy: 60, defPos: 'N', label: '1/3(奇)' },
        { id: '5', x: 240, y: 140, dir: 'R', branchDy: -54, defPos: 'N', label: '5(奇)' },
        { id: '7', x: 240, y: 200, dir: 'R', branchDy: 54, defPos: 'N', label: '7(奇)' },
        { id: '6', x: 640, y: 140, dir: 'L', branchDy: -54, defPos: 'N', label: '6(偶)' },
        { id: '8', x: 640, y: 200, dir: 'L', branchDy: 54, defPos: 'N', label: '8(偶)' },
        { id: '2/4', x: 740, y: 140, dir: 'L', branchDy: 60, defPos: 'N', label: '2/4(偶)' }
      ],
      insulations: [{ x: 100, y: 140 }, { x: 780, y: 200 }],
      signals: [
        { id: 'X', x: 100, y: 122, dir: 'R', type: 'home', defAspect: 'L' },
        { id: 'S', x: 780, y: 218, dir: 'L', type: 'home', defAspect: 'L' }
      ],
      routes: [
        { id: 'r1', name: '① 下行正线定位直通 ⅠG（1/3、5、6、2/4 全定位）', signal: 'X', aspect: 'L', reqSw: { '1/3': 'N', '5': 'N', '6': 'N', '2/4': 'N' }, secs: ['IG'], path: [[40, 140], [840, 140]], desc: '下行正线直通高效通过，下行咽喉均为奇数编号（1/3、5、7）。' },
        { id: 'r2', name: '② 上行正线定位直通 ⅡG（2/4、8、7、1/3 全定位）', signal: 'S', aspect: 'L', reqSw: { '2/4': 'N', '8': 'N', '7': 'N', '1/3': 'N' }, secs: ['IIG'], path: [[840, 200], [40, 200]], desc: '上行正线反向直通，上行咽喉均为偶数编号（2/4、6、8）。' }
      ]
    },
    {
      id: '2.4.7', ch: 2, page: 28, engine: 'yard',
      title: '图 2.4.7 · 侧线上道岔定位位置的确定',
      summary: '其他非正线（侧线/站线）上的道岔，无安全线限制时一律以**开通引向主要股道或作业量较大的方向为定位**，减少扳道次数并提高平行进路利用率。',
      tracks: [
        { id: 't_m', pts: [[40, 120], [840, 120]], kind: 'main', name: '正线 ⅠG', labelPos: [600, 105] },
        { id: 't_3', pts: [[180, 120], [270, 185], [760, 185]], kind: 'siding', name: '3G（主要到发侧线 · 9#定位）', labelPos: [580, 170] },
        { id: 't_5', pts: [[420, 185], [510, 245], [760, 245]], kind: 'siding', name: '5G（次要货线/存车线 · 9#反位）', labelPos: [610, 262] }
      ],
      sections: [{ id: '3G', x1: 270, x2: 760, y: 185 }, { id: '5G', x1: 510, x2: 760, y: 245 }],
      switches: [
        { id: '5', x: 180, y: 120, dir: 'R', branchDy: 65, defPos: 'N', label: '5# (定位通ⅠG)', labelDy: 24 },
        { id: '9', x: 420, y: 185, dir: 'R', branchDy: 60, defPos: 'N', label: '9# (定位通主要侧线3G)' }
      ],
      insulations: [{ x: 140, y: 120 }, { x: 380, y: 185 }],
      signals: [{ id: 'X', x: 140, y: 102, dir: 'R', type: 'home', defAspect: 'H' }],
      routes: [
        { id: 'r1', name: '① 接入主要侧线 3G（5#反、9#定位）', signal: 'X', aspect: 'UU', reqSw: { '5': 'R', '9': 'N' }, secs: ['3G'], path: [[50, 120], [180, 120], [270, 185], [720, 185]], desc: '侧线上 9# 以直通主要到发线 3G 为定位。' },
        { id: 'r2', name: '② 转入次要货线 5G（5#反、9#反位）', signal: 'X', aspect: 'UU', reqSw: { '5': 'R', '9': 'R' }, secs: ['5G'], path: [[50, 120], [180, 120], [270, 185], [420, 185], [510, 245], [720, 245]], desc: '进次要存车线 5G 时操 9# 反位。' }
      ]
    },
    {
      id: '2.5.1', ch: 2, page: 29, engine: 'yard',
      title: '图 2.5.1 · 轨道电路划分（普通绝缘·单边绝缘·超限绝缘与双动渡线特例）',
      summary: '有信号机处必设绝缘节，轨道电路一般不超过 3 组道岔。**1# 与 7# 之间绝缘距警冲标 < 3.5 m 为超限绝缘（画圆圈 ○）**；而双动渡线中间绝缘虽 < 3.5 m，因两端同步动作**不作超限绝缘处理**！',
      controls: [
        { id: 'occ7', type: 'checkbox', label: '模拟 7DG 侧股占用车辆（检验 1/7 超限绝缘侵限制约）', def: false },
        { id: 'doubleCross', type: 'checkbox', label: '渡线 1/3 为双动道岔（取消渡线超限判定特例）', def: true }
      ],
      tracks: [
        { id: 't_m', pts: [[40, 145], [840, 145]], kind: 'main', name: '主干线区段', labelPos: [710, 130] },
        { id: 't_b1', pts: [[200, 145], [290, 215], [840, 215]], kind: 'siding', name: '1/3 双动渡线 / 支线', labelPos: [710, 232] },
        { id: 't_b7', pts: [[430, 145], [520, 82], [780, 82]], kind: 'siding', name: '7DG 分歧侧线', labelPos: [650, 68] }
      ],
      sections: [
        { id: '1DG', x1: 120, x2: 390, y: 145, label: '1DG' },
        { id: '7DG', x1: 390, x2: 650, y: 145, label: '7DG' },
        { id: '7侧', x1: 520, x2: 760, y: 82 }
      ],
      switches: [
        { id: '1/3', x: 200, y: 145, dir: 'R', branchDy: 70, defPos: 'N', label: '1/3 双动' },
        { id: '7', x: 430, y: 145, dir: 'R', branchDy: -63, defPos: 'N', label: '7# 道岔', labelDy: 24 }
      ],
      insulations: [
        { x: 120, y: 145, kind: 'normal', label: '普通绝缘' },
        { x: 245, y: 180, kind: 'single', label: '渡线绝缘' },
        { x: 382, y: 145, kind: 'fouling', label: '超限绝缘 ○ (<3.5m)', labelDy: -22 }
      ],
      signals: [{ id: 'X', x: 120, y: 125, dir: 'R', type: 'home', defAspect: 'H' }],
      routes: [
        { id: 'r1', name: '▶ 测试办理主线进路（校验 1/7 超限绝缘与渡线特例）', signal: 'X', aspect: 'U', reqSw: { '1/3': 'N', '7': 'N' }, conflictCtrl: 'occ7', secs: ['1DG', '7DG'], path: [[45, 145], [810, 145]], desc: '当勾选“7DG 侧股占用”时，因 1/7 间为超限绝缘（<3.5 m），邻线车列可能侵限，主进路被安全封锁！' }
      ]
    },
    {
      id: '2.5.2', ch: 2, page: 30, engine: 'yard',
      title: '图 2.5.2 · 车站轨道电路区段的命名（AG / DG / WG 交互解析）',
      summary: '进站内方无岔区段称 **IAG/ⅡAG**；道岔区段以所含道岔号命名（如 **1DG、5-9DG**）；两信号机间无岔区段以两端道岔或信号机号加 **WG/G** 命名（如 **1/19WG、1/7G**）。',
      tracks: [
        { id: 't_1', pts: [[40, 140], [840, 140]], kind: 'main' },
        { id: 't_2', pts: [[40, 210], [840, 210]], kind: 'main' },
        { id: 't_x', pts: [[260, 140], [340, 210]], kind: 'branch' },
        { id: 't_y', pts: [[560, 140], [640, 82], [840, 82]], kind: 'siding' }
      ],
      sections: [
        { id: 'IAG', x1: 90, x2: 205, y: 140, label: 'IAG (进站内方无岔)' },
        { id: '1DG', x1: 205, x2: 360, y: 140, label: '1DG (含1#道岔)' },
        { id: '1/19WG', x1: 360, x2: 520, y: 140, label: '1/19WG (岔间无岔)' },
        { id: '19DG', x1: 520, x2: 690, y: 140, label: '19DG (含19#道岔)' },
        { id: 'IG', x1: 690, x2: 840, y: 140, label: 'ⅠG (股道区段)' },
        { id: 'IIAG', x1: 90, x2: 205, y: 210, label: 'ⅡAG' }
      ],
      switches: [
        { id: '1/3', x: 260, y: 140, dir: 'R', branchDy: 70, defPos: 'N', label: '1/3' },
        { id: '19', x: 560, y: 140, dir: 'R', branchDy: -58, defPos: 'N', label: '19' }
      ],
      insulations: [{ x: 90, y: 140 }, { x: 205, y: 140 }, { x: 360, y: 140 }, { x: 520, y: 140 }, { x: 690, y: 140 }],
      signals: [
        { id: 'X', x: 90, y: 120, dir: 'R', type: 'home', defAspect: 'H' },
        { id: 'D1', x: 205, y: 158, dir: 'R', type: 'shunt', defAspect: 'A' },
        { id: 'SⅠ', x: 690, y: 120, dir: 'L', type: 'dep', defAspect: 'H' }
      ],
      routes: [
        { id: 'r1', name: '▶ 列车逐段压过：实时高亮 IAG → 1DG → 1/19WG → 19DG → ⅠG', signal: 'X', aspect: 'U', reqSw: { '1/3': 'N', '19': 'N' }, secs: ['IAG', '1DG', '1/19WG', '19DG', 'IG'], path: [[45, 140], [820, 140]], desc: '依次经过进站内方无岔区段(AG)、道岔区段(DG)、岔间无岔区段(WG)与正线股道(ⅠG)。' }
      ]
    },
    {
      id: '2.5.3', ch: 2, page: 30, engine: 'yard',
      title: '图 2.5.3 · 车站股道区段的命名（罗马数字正线 vs 阿拉伯数字站线）',
      summary: '正线股道用罗马数字 **ⅠG、ⅡG** 命名；站线（到发侧线/调车线）从站舍侧起（或双线从正线外侧对称）用阿拉伯数字 **3G、4G、5G、6G** 命名。',
      tracks: [
        { id: 't_5', pts: [[180, 140], [240, 56], [640, 56], [700, 140]], kind: 'siding', name: '5G（站线·阿拉伯）', labelPos: [440, 44] },
        { id: 't_3', pts: [[180, 140], [240, 98], [640, 98], [700, 140]], kind: 'siding', name: '3G（站线·阿拉伯）', labelPos: [440, 86] },
        { id: 't_1', pts: [[40, 140], [840, 140]], kind: 'main', name: 'ⅠG（下行正线·罗马数字）', labelPos: [440, 128] },
        { id: 't_2', pts: [[40, 195], [840, 195]], kind: 'main', name: 'ⅡG（上行正线·罗马数字）', labelPos: [440, 212] },
        { id: 't_4', pts: [[180, 195], [240, 240], [640, 240], [700, 195]], kind: 'siding', name: '4G（站线·阿拉伯）', labelPos: [440, 256] },
        { id: 't_6', pts: [[180, 195], [240, 282], [640, 282], [700, 195]], kind: 'siding', name: '6G（站线·阿拉伯）', labelPos: [440, 298] }
      ],
      sections: [
        { id: '5G', x1: 240, x2: 640, y: 56 }, { id: '3G', x1: 240, x2: 640, y: 98 },
        { id: 'IG', x1: 240, x2: 640, y: 140 }, { id: 'IIG', x1: 240, x2: 640, y: 195 },
        { id: '4G', x1: 240, x2: 640, y: 240 }, { id: '6G', x1: 240, x2: 640, y: 282 }
      ],
      switches: [{ id: '1', x: 180, y: 140, dir: 'R', branchDy: -42, defPos: 'N', label: '1#' }],
      insulations: [{ x: 240, y: 140 }, { x: 640, y: 140 }],
      signals: [{ id: 'X', x: 100, y: 122, dir: 'R', type: 'home', defAspect: 'H' }],
      routes: [
        { id: 'r1', name: '① 接入正线 ⅠG（罗马数字）', signal: 'X', aspect: 'U', reqSw: { '1': 'N' }, secs: ['IG'], path: [[50, 140], [610, 140]], desc: '正线股道一律采用罗马数字（ⅠG、ⅡG）。' },
        { id: 'r2', name: '② 接入站线 3G（阿拉伯数字）', signal: 'X', aspect: 'UU', reqSw: { '1': 'R' }, secs: ['3G'], path: [[50, 140], [180, 140], [240, 98], [610, 98]], desc: '站线股道按规范采用阿拉伯数字（单侧顺编或正线两侧奇偶分编 3G/4G/5G/6G）。' }
      ]
    },
    {
      id: '2.6.1', ch: 2, page: 31, engine: 'yard',
      title: '图 2.6.1 · 进路的范围（接车·发车·通过·调车精确起止边界实测）',
      summary: '考试极易混点！**接车进路含股道**（进站 X → 反向出站 XⅠ）；**发车进路不含出发股道**（出站 SⅠ → 进站 X 内方）；**通过进路含正线股道**；**调车进路**按终到股道/车挡/反方向信号机界定！',
      tracks: [
        { id: 't_m', pts: [[40, 165], [840, 165]], kind: 'main' },
        { id: 't_end', pts: [[670, 165], [740, 235], [820, 235]], kind: 'safety', name: '尽头牵出线（车挡）', labelPos: [755, 254] }
      ],
      sections: [
        { id: '咽喉1', x1: 110, x2: 330, y: 165, label: '下行咽喉区' },
        { id: '1G', x1: 330, x2: 610, y: 165, label: '1G 股道' },
        { id: '咽喉2', x1: 610, x2: 790, y: 165, label: '上行咽喉区' }
      ],
      switches: [{ id: '10', x: 670, y: 165, dir: 'R', branchDy: 70, defPos: 'N', label: '10#' }],
      insulations: [{ x: 110, y: 165 }, { x: 220, y: 165 }, { x: 330, y: 165 }, { x: 610, y: 165 }, { x: 790, y: 165 }],
      signals: [
        { id: 'X', x: 110, y: 145, dir: 'R', type: 'home', defAspect: 'H' },
        { id: 'D1', x: 220, y: 185, dir: 'R', type: 'shunt', defAspect: 'A' },
        { id: 'S1', x: 330, y: 145, dir: 'L', type: 'dep', defAspect: 'H' },
        { id: 'X1', x: 610, y: 185, dir: 'R', type: 'dep', defAspect: 'H' },
        { id: 'D4', x: 740, y: 215, dir: 'R', type: 'shunt', defAspect: 'A' }
      ],
      markers: [{ x: 820, y: 235, kind: 'buffer', text: '车挡' }],
      routes: [
        { id: 'r1', name: '① 接车进路 X → 1G（起 X，终 X1，【包含】股道 1G）', signal: 'X', aspect: 'U', reqSw: { '10': 'N' }, secs: ['咽喉1', '1G'], path: [[50, 165], [585, 165]], desc: '接车进路范围：自进站信号机 X 起至接车股道另一端反向出站信号机 X1 止，必须检查股道 1G 空闲！' },
        { id: 'r2', name: '② 发车进路 S1 → X（起 S1，终 X，【不含】股道 1G）', signal: 'S1', aspect: 'L', reqSw: { '10': 'N' }, secs: ['咽喉1'], path: [[440, 165], [50, 165]], desc: '发车进路范围：自出站信号机 S1 起至站界标/进站信号机 X 止，不检查出发股道 1G（因为本车正停在 1G 上）！' },
        { id: 'r3', name: '③ 通过进路 X → 1G → 区间（含正线 1G 与两端咽喉）', signal: 'X', aspect: 'L', reqSw: { '10': 'N' }, secs: ['咽喉1', '1G', '咽喉2'], path: [[50, 165], [830, 165]], desc: '通过进路 = 接车进路 + 同向发车进路，包含正线股道 1G。' },
        { id: 'r4', name: '④ 调车进路 X1 → D4 尽头线（终至尽头车挡）', signal: 'X1', aspect: 'B', reqSw: { '10': 'R' }, secs: ['咽喉2'], path: [[550, 165], [670, 165], [740, 235], [800, 235]], trainKind: 'shunt', desc: '向尽头线调车时进路终端延伸至车挡；D1→1G 终端至 X1，S1→D1 终端至 X（PDF p.31–32）。' }
      ]
    },

    // ==================== 第 3 章 ====================
    {
      id: '3.1.1', ch: 3, page: 35, engine: 'yard',
      title: '图 3.1.1 · 示例车站信号平面图（全站双咽喉完整联锁 · 含习题 c3-12 & c3-13）',
      summary: '完整复原教材核心站场图 3.1.1 左下行咽喉 + 中间股道(3G/ⅠG/ⅡG/4G) + 右上行咽喉！直接支持实操 **课后习题 c3-12（上行接车 S → 4G）** 与 **课后习题 c3-13（由 3G 向 D₂ 调车发车）**，以及全站双咽喉迎面照查！',
      errata: '教材原书 PDF p.51 首段误把 X→ⅠG 写成双黄（实际为单黄 U），PDF p.52 折返例按钮 S3DA/S4DA 及 11# 位置前后有笔误，本仿真均严格按表 3.2.2 与图 3.1.1 正确联锁关系执行。',
      jump3d: { label: '🚉 进入 03 下行咽喉 3D 全景沙盘（33条进路）', go: { mode: 'station' } },
      tracks: [
        { id: 't_ig', pts: [[25, 140], [855, 140]], kind: 'main', name: 'ⅠG (正线)', labelPos: [440, 128] },
        { id: 't_iig', pts: [[25, 195], [855, 195]], kind: 'main', name: 'ⅡG (正线)', labelPos: [440, 211] },
        { id: 't_3g', pts: [[280, 140], [330, 86], [550, 86], [600, 140]], kind: 'siding', name: '3G (侧线)', labelPos: [440, 74] },
        { id: 't_4g', pts: [[280, 195], [330, 250], [550, 250], [600, 195]], kind: 'siding', name: '4G (侧线)', labelPos: [440, 266] },
        { id: 't_13', pts: [[130, 140], [180, 195]], kind: 'branch' },
        { id: 't_57', pts: [[245, 140], [200, 195]], kind: 'branch' },
        { id: 't_68', pts: [[635, 195], [685, 140]], kind: 'branch' },
        { id: 't_24', pts: [[755, 195], [705, 140]], kind: 'branch' }
      ],
      sections: [
        { id: 'IAG', x1: 70, x2: 115, y: 140 },
        { id: '1DG', x1: 115, x2: 190, y: 140 },
        { id: '7-11DG', x1: 190, x2: 345, y: 140 },
        { id: '3G', x1: 345, x2: 535, y: 86 },
        { id: 'IG', x1: 345, x2: 535, y: 140 },
        { id: 'IIG', x1: 345, x2: 535, y: 195 },
        { id: '4G', x1: 345, x2: 535, y: 250 },
        { id: '6-10DG', x1: 535, x2: 695, y: 140 },
        { id: '4-2DG', x1: 695, x2: 745, y: 162, pts: [[695, 140], [705, 140], [744, 183]] },
        { id: '8-12DG', x1: 535, x2: 645, y: 195 },
        { id: '2/8G', x1: 645, x2: 730, y: 195 },
        { id: '2DG', x1: 730, x2: 785, y: 195 },
        { id: 'ⅡBG', x1: 794, x2: 832, y: 195 }
      ],
      switches: [
        { id: '1/3', x: 130, y: 140, dir: 'R', branchDy: 55, defPos: 'N', label: '1/3' },
        { id: '5/7', x: 245, y: 140, dir: 'L', branchDy: 55, defPos: 'N', label: '5/7' },
        { id: '11', x: 280, y: 140, dir: 'R', branchDy: -54, defPos: 'N', label: '11', labelDy: -16 },
        { id: '9', x: 280, y: 195, dir: 'R', branchDy: 55, defPos: 'N', label: '9', labelDy: 24 },
        { id: '10', x: 600, y: 140, dir: 'L', branchDy: -54, defPos: 'N', label: '10', labelDy: -16 },
        { id: '12', x: 600, y: 195, dir: 'L', branchDy: 55, defPos: 'N', label: '12', labelDy: 24 },
        { id: '6/8', x: 635, y: 195, dir: 'R', branchDy: -55, defPos: 'N', label: '6/8', labelDy: 24 },
        { id: '2/4', x: 755, y: 195, dir: 'L', branchDy: -55, defPos: 'N', label: '2/4', labelDy: 24 }
      ],
      insulations: [
        { x: 70, y: 140 }, { x: 345, y: 140 }, { x: 345, y: 195 }, { x: 535, y: 140 }, { x: 535, y: 195 },
        { x: 645, y: 195 }, { x: 695, y: 140 }, { x: 730, y: 195 }, { x: 785, y: 195 }, { x: 832, y: 195 }
      ],
      signals: [
        { id: 'X', x: 70, y: 122, dir: 'R', type: 'home', defAspect: 'H' },
        { id: 'S3', x: 345, y: 68, dir: 'L', type: 'dep', defAspect: 'H' },
        { id: 'SⅠ', x: 345, y: 122, dir: 'L', type: 'dep', defAspect: 'H' },
        { id: 'X3', x: 535, y: 102, dir: 'R', type: 'dep', defAspect: 'H' },
        { id: 'XⅠ', x: 535, y: 156, dir: 'R', type: 'dep', defAspect: 'H' },
        { id: 'XⅡ', x: 535, y: 211, dir: 'R', type: 'dep', defAspect: 'H' },
        { id: 'X4', x: 535, y: 266, dir: 'R', type: 'dep', defAspect: 'H' },
        { id: 'D2', x: 785, y: 177, dir: 'L', type: 'shunt', defAspect: 'A' },
        { id: 'S', x: 832, y: 214, dir: 'L', type: 'home', defAspect: 'H' }
      ],
      routes: [
        { id: 'r_c3_12', name: '★ 习题 c3-12：上行接车 S → 4G (UU 侧线全流程)', signal: 'S', aspect: 'UU', reqSw: { '2/4': 'N', '6/8': 'N', '12': 'R' }, secs: ['ⅡBG', '2DG', '2/8G', '8-12DG', '4G'], path: [[850, 195], [600, 195], [550, 250], [375, 250]], desc: '按第3章习题12：按 SLA+X4LA → 选 2/4定、6/8定、12反 → 检查敌对(X4/D2/S4照查)与区段空闲 → 锁闭并开放 S 双黄 UU → 首轮压入 ⅡBG 关闭 S → 经三点检查逐段解锁至 4G 停稳！' },
        { id: 'r_c3_13', name: '★ 习题 c3-13：由 3G 向 D₂ 调车发车 (X3DA → D2A)', signal: 'X3', aspect: 'B', reqSw: { '10': 'R', '6/8': 'N', '2/4': 'R' }, secs: ['6-10DG', '4-2DG', '2DG'], path: [[470, 86], [550, 86], [600, 140], [705, 140], [755, 195], [782, 195]], trainKind: 'shunt', desc: '严格按图 3.1.1（PDF p.35）实操第3章习题13：按 X3DA+D2A → 选 10反、6/8定、2/4反跨渡线通向下行外方 D₂ → 锁闭进路并开放 X3 月白灯 B → 整列越过 X3 后关闭白灯，逐段三点解锁停于 D₂ 内方！' },
        { id: 'r_down_ig', name: '③ 下行正线接车 X → ⅠG (表3.2.2 第1条 · U)', signal: 'X', aspect: 'U', reqSw: { '1/3': 'N', '5/7': 'N', '11': 'N' }, secs: ['IAG', '1DG', '7-11DG', 'IG'], path: [[35, 140], [495, 140]], desc: '按表 3.2.2 第 1 条：1/3、5/7、11 全定位锁闭，开放单黄 U 接入 ⅠG。' },
        { id: 'r_up_iig', name: '④ 上行正线接车 S → ⅡG (U)', signal: 'S', aspect: 'U', reqSw: { '2/4': 'N', '6/8': 'N', '12': 'N' }, secs: ['ⅡBG', '2DG', '2/8G', '8-12DG', 'IIG'], path: [[850, 195], [385, 195]], desc: '上行正线全定位接车至 ⅡG，与下行接 ⅠG 互为平行进路。' }
      ]
    },
    {
      id: '3.1.2', ch: 3, page: 36, engine: 'yard',
      title: '图 3.1.2 · 侵限绝缘节处的敌对进路（D11 处 108 定位条件侵限仿真）',
      summary: 'D11 旁绝缘节为超限绝缘（距警冲标 < 3.5 m）。即使 D9 → D17 与 105-108DG 无共同轨道区段，但当 **108 定位且 105-108DG 占用** 时，两进路立即构成**条件敌对**，联锁阻止 D9 开放！',
      controls: [
        { id: 'occ105', type: 'checkbox', label: '模拟 105-108DG 有车停留/占用（触发侵限敌对！）', def: true }
      ],
      tracks: [
        { id: 't_main', pts: [[40, 190], [840, 190]], kind: 'main', name: 'D9 → D17 调车进路', labelPos: [560, 212] },
        { id: 't_b', pts: [[240, 190], [370, 110], [760, 110]], kind: 'siding', name: '105-108DG 邻线区段', labelPos: [580, 92] }
      ],
      sections: [
        { id: '主进路', x1: 140, x2: 720, y: 190 },
        { id: '105-108DG', x1: 370, x2: 720, y: 110, label: '105-108DG' }
      ],
      switches: [
        { id: '108', x: 240, y: 190, dir: 'R', branchDy: -80, defPos: 'N', label: '108# 道岔' }
      ],
      insulations: [
        { x: 140, y: 190 }, { x: 350, y: 122, kind: 'fouling', label: 'D11 侵限绝缘 ○ (<3.5m)' }
      ],
      signals: [
        { id: 'D9', x: 140, y: 172, dir: 'R', type: 'shunt', defAspect: 'A' },
        { id: 'D11', x: 350, y: 92, dir: 'L', type: 'shunt', defAspect: 'A' },
        { id: 'D17', x: 720, y: 172, dir: 'L', type: 'shunt', defAspect: 'A' }
      ],
      routes: [
        { id: 'r1', name: '▶ 试办 D9 → D17（勾选/取消 105-108DG 占用观察条件侵限拦截）', signal: 'D9', aspect: 'B', reqSw: { '108': 'N' }, conflictCtrl: 'occ105', secs: ['主进路'], path: [[60, 190], [700, 190]], trainKind: 'shunt', desc: '勾选 105-108DG 占用时，虽无共用区段，仍因 <108>105-108DG 侵限条件将 D9 锁闭于蓝灯 A；取消占用后方可开放 B！' }
      ]
    },
    {
      id: '3.1.3', ch: 3, page: 37, engine: 'yard',
      title: '图 3.1.3 · 防护道岔举例（4/6 防护锁闭于安全线方向）',
      summary: '在联锁表中防护道岔用方括号 `[4/6]` 标示。办理 3G 接发车进路时，即使进路本身不经过 4/6# 道岔，联锁也必须将 4/6# 自动带动并锁闭于开通安全线的定位，防侧面冲突！',
      tracks: [
        { id: 't_3g', pts: [[40, 130], [840, 130]], kind: 'main', name: '3G 接发车进路', labelPos: [560, 114] },
        { id: 't_s', pts: [[180, 220], [450, 220], [540, 130]], kind: 'siding', name: '邻线货场线', labelPos: [250, 240] },
        { id: 't_safe', pts: [[450, 220], [740, 220]], kind: 'safety', name: '安全线（防护道岔 [4/6] 锁闭方向）', labelPos: [610, 240] }
      ],
      sections: [{ id: '3G进路', x1: 120, x2: 780, y: 130 }],
      switches: [{ id: '4/6', x: 450, y: 220, dir: 'R', branchDy: -90, defPos: 'N', label: '[4/6] 防护道岔' }],
      insulations: [{ x: 120, y: 130 }, { x: 420, y: 220 }],
      signals: [
        { id: 'X', x: 120, y: 112, dir: 'R', type: 'home', defAspect: 'H' },
        { id: 'D4', x: 420, y: 202, dir: 'R', type: 'shunt', defAspect: 'A' }
      ],
      markers: [{ x: 740, y: 220, kind: 'buffer', text: '车挡' }],
      routes: [
        { id: 'r1', name: '▶ 办理 3G 接车：自动检查并锁闭防护道岔 [4/6] 于定位！', signal: 'X', aspect: 'UU', reqSw: { '4/6': 'N' }, secs: ['3G进路'], path: [[50, 130], [800, 130]], desc: '即使进路不压 4/6#，选路时也强制将 [4/6] 扳至定位通安全线并锁闭，严禁货线车辆侧面冲出！' }
      ]
    },
    {
      id: '3.1.4', ch: 3, page: 38, engine: 'yard',
      title: '图 3.1.4 · 交叉渡线处道岔举例（防护 [6/8] 与带动 {14/16} 联锁仿真）',
      summary: '联锁表符号区分：**防护道岔 `[6/8]`** 必须严格锁闭并检查表示（2/4 反位时防交叉渡线侧面冲突）；**带动道岔 `{14/16}`**（10 反位时带动定位）不锁闭且不检查表示，仅提高后续平行效率！',
      tracks: [
        { id: 't_u', pts: [[40, 125], [840, 125]], kind: 'main', name: '下行线', labelPos: [760, 110] },
        { id: 't_d', pts: [[40, 210], [840, 210]], kind: 'main', name: '上行线', labelPos: [760, 228] },
        { id: 't_24', pts: [[180, 125], [320, 210]], kind: 'branch', name: '2/4 渡线', labelPos: [215, 172] },
        { id: 't_68', pts: [[180, 210], [320, 125]], kind: 'branch', name: '6/8 交叉渡线', labelPos: [305, 172] },
        { id: 't_10', pts: [[470, 210], [560, 268], [740, 268]], kind: 'siding', name: '10# 侧线', labelPos: [650, 284] },
        { id: 't_1416', pts: [[560, 125], [660, 210]], kind: 'branch', name: '14/16 带动渡线', labelPos: [645, 165] }
      ],
      sections: [
        { id: '交叉区', x1: 140, x2: 370, y: 125 },
        { id: '10DG', x1: 430, x2: 720, y: 210 }
      ],
      switches: [
        { id: '2/4', x: 180, y: 125, dir: 'R', branchDy: 85, defPos: 'N', label: '2/4' },
        { id: '6/8', x: 180, y: 210, dir: 'R', branchDy: -85, defPos: 'N', label: '[6/8]防护' },
        { id: '10', x: 470, y: 210, dir: 'R', branchDy: 58, defPos: 'N', label: '10#' },
        { id: '14/16', x: 560, y: 125, dir: 'R', branchDy: 85, defPos: 'N', label: '{14/16}带动' }
      ],
      insulations: [{ x: 140, y: 125 }, { x: 430, y: 210 }],
      signals: [
        { id: 'D2', x: 140, y: 107, dir: 'R', type: 'shunt', defAspect: 'A' },
        { id: 'D10', x: 430, y: 192, dir: 'R', type: 'shunt', defAspect: 'A' }
      ],
      routes: [
        { id: 'r1', name: '① 经 (2/4) 反位：强制防护锁闭 [6/8] 于定位！', signal: 'D2', aspect: 'B', reqSw: { '2/4': 'R', '6/8': 'N' }, secs: ['交叉区'], path: [[60, 125], [180, 125], [320, 210], [420, 210]], trainKind: 'shunt', desc: '交叉渡线 (2/4) 反位时，必须将交叉另一边 [6/8] 防护锁闭于定位，防菱形交叉撞车！' },
        { id: 'r2', name: '② 经 (10) 反位：带动 {14/16} 转定位（仅带动不锁闭）', signal: 'D10', aspect: 'B', reqSw: { '10': 'R', '14/16': 'N' }, secs: ['10DG'], path: [[400, 210], [470, 210], [560, 268], [720, 268]], trainKind: 'shunt', desc: '带动道岔 {14/16} 被带动至定位以利接通平行作业，但若 {14/16} 失表示不影响本进路开放。' }
      ]
    },
    {
      id: '3.2.1', ch: 3, page: 41, engine: 'yard',
      title: '图 3.2.1 · 侵限区段制约关系（<12>12DG 条件侵限动态检验）',
      summary: '联锁表“检查轨道区段”栏中用尖括号 `<12>12DG` 表示条件侵限：仅当 **12# 在定位** 时才检查 **12DG 空闲**；若 12# 扳至反位，则 12DG 与本进路不再构成侵限制约！',
      controls: [
        { id: 'occ12', type: 'checkbox', label: '模拟 12DG 区段占用有车', def: true }
      ],
      tracks: [
        { id: 't_m', pts: [[40, 190], [840, 190]], kind: 'main', name: '本进路主轨线', labelPos: [620, 212] },
        { id: 't_12', pts: [[340, 190], [440, 115], [760, 115]], kind: 'siding', name: '12DG（12定位时与主轨构成侵限）', labelPos: [590, 98] },
        { id: 't_12r', pts: [[440, 115], [530, 62], [760, 62]], kind: 'siding', name: '12反位岔线（不侵限）', labelPos: [645, 48] }
      ],
      sections: [
        { id: '主区', x1: 140, x2: 720, y: 190 },
        { id: '12DG', x1: 440, x2: 740, y: 115 }
      ],
      switches: [{ id: '12', x: 440, y: 115, dir: 'R', branchDy: -53, defPos: 'N', label: '12# 道岔' }],
      insulations: [{ x: 140, y: 190 }, { x: 405, y: 140, kind: 'fouling', label: '侵限绝缘 ○' }],
      signals: [{ id: 'D1', x: 140, y: 172, dir: 'R', type: 'shunt', defAspect: 'A' }],
      routes: [
        { id: 'r1', name: '① 12#定位 + 12DG 占用 → 条件侵限 <12>12DG 阻断信号！', signal: 'D1', aspect: 'B', reqSw: { '12': 'N' }, conflictCtrl: 'occ12', secs: ['主区'], path: [[60, 190], [780, 190]], trainKind: 'shunt', desc: '12# 定位时若勾选 12DG 占用，立即触发条件侵限阻断 D1 保持蓝灯；取消占用即可放行！' },
        { id: 'r2', name: '② 将 12# 转反位：即使 12DG 占用也解除侵限制约！', signal: 'D1', aspect: 'B', reqSw: { '12': 'R' }, secs: ['主区'], path: [[60, 190], [780, 190]], trainKind: 'shunt', desc: '12# 转反位后车列被隔开至外侧股道，不再满足“<12>定位”条件，D1 允许正常开放！' }
      ]
    },
    {
      id: '3.3.2', ch: 3, page: 50, engine: 'yard',
      title: '图 3.3.2 · 到发线出岔车站示意图（16# 分歧道岔与 D16/D18/D20 联锁）',
      summary: '为利用站内空间而在到发线中部引出岔线（16# 分歧道岔），构成“到发线出岔”。接车至 14G/16G 时必须将 16# 定位锁闭并敌对 D16/D18/D20；由 16G 经 16# 出岔调车须照查两端咽喉！',
      tracks: [
        { id: 't_main', pts: [[40, 130], [840, 130]], kind: 'main', name: '正线 ⅠG', labelPos: [440, 114] },
        { id: 't_14g', pts: [[140, 130], [210, 195], [680, 195], [750, 130]], kind: 'siding', name: '14G 到发线（中段出岔）', labelPos: [310, 180] },
        { id: 't_16g', pts: [[420, 195], [510, 260], [790, 260]], kind: 'siding', name: '16G 专用岔线', labelPos: [650, 276] }
      ],
      sections: [
        { id: '咽喉', x1: 90, x2: 220, y: 130 },
        { id: '14G', x1: 220, x2: 670, y: 195, label: '14G 到发线' },
        { id: '16DG', x1: 438, x2: 760, y: 260, pts: [[438, 208], [510, 260], [760, 260]], label: '16# 出岔区段' }
      ],
      switches: [
        { id: '2', x: 140, y: 130, dir: 'R', branchDy: 65, defPos: 'N', label: '2#' },
        { id: '16', x: 420, y: 195, dir: 'R', branchDy: 65, defPos: 'N', label: '16# 到发线出岔', labelDy: 24 }
      ],
      insulations: [{ x: 90, y: 130 }, { x: 220, y: 195 }, { x: 380, y: 195 }, { x: 520, y: 260 }, { x: 670, y: 195 }],
      signals: [
        { id: 'X', x: 90, y: 112, dir: 'R', type: 'home', defAspect: 'H' },
        { id: 'D16', x: 380, y: 177, dir: 'R', type: 'shunt', defAspect: 'A' },
        { id: 'D18', x: 520, y: 242, dir: 'L', type: 'shunt', defAspect: 'A' },
        { id: 'D20', x: 670, y: 177, dir: 'L', type: 'dep', defAspect: 'H' }
      ],
      routes: [
        { id: 'r1', name: '① 接车至 14G：锁闭 16# 定位并敌对 D16/D18', signal: 'X', aspect: 'UU', reqSw: { '2': 'R', '16': 'N' }, secs: ['咽喉', '14G'], path: [[45, 130], [140, 130], [210, 195], [645, 195]], desc: '列车接进 14G 时，必须将中部出岔 16# 锁闭于定位，严禁 16G 调车（D18 蓝灯封锁）。' },
        { id: 'r2', name: '② 到发线出岔调车：D16 → 16G（16# 反位）', signal: 'D16', aspect: 'B', reqSw: { '16': 'R' }, secs: ['16DG'], path: [[280, 195], [420, 195], [510, 260], [740, 260]], trainKind: 'shunt', desc: '确认两端无向 14G 的列车接车进路后，方可将 16# 转反位并开放 D16 办理出岔取送车！' }
      ]
    },

    // ==================== 第 8 / 9 / 12 章站场图 ====================
    {
      id: '8.3.1', ch: 8, page: 149, engine: 'yard',
      title: '图 8.3.1 · 存在照查关系的站场局部（双咽喉 ZCJ 迎面互锁仿真）',
      summary: '每一股道左右两咽喉均存在迎面敌对关系（如 `S3/X3`、`SⅠ/XⅠ`、`SⅡ/XⅡ`、`S4/X4`）。办理左端进路使本端 `ZCJ↓`，立即切断右端 8/9/11 线电源，严防迎面相撞！',
      controls: [
        { id: 'leftBuilt', type: 'checkbox', label: '左咽喉已建接车至 ⅠG（左端 ZCJ↓ 切断右端 XⅠ 照查！）', def: true }
      ],
      tracks: [
        { id: 't_3', pts: [[160, 82], [720, 82]], kind: 'siding', name: '3G (S3 ↔ X3 照查)', labelPos: [440, 68] },
        { id: 't_1', pts: [[60, 140], [820, 140]], kind: 'main', name: 'ⅠG (SⅠ ↔ XⅠ 照查)', labelPos: [440, 126] },
        { id: 't_2', pts: [[60, 198], [820, 198]], kind: 'main', name: 'ⅡG (SⅡ ↔ XⅡ 照查)', labelPos: [440, 214] },
        { id: 't_4', pts: [[160, 256], [720, 256]], kind: 'siding', name: '4G (S4 ↔ X4 照查)', labelPos: [440, 272] }
      ],
      sections: [{ id: 'IG', x1: 210, x2: 670, y: 140 }],
      switches: [],
      insulations: [{ x: 210, y: 140 }, { x: 670, y: 140 }],
      signals: [
        { id: 'S3', x: 210, y: 68, dir: 'L', type: 'dep', defAspect: 'H' },
        { id: 'X3', x: 670, y: 96, dir: 'R', type: 'dep', defAspect: 'H' },
        { id: 'SⅠ', x: 210, y: 122, dir: 'L', type: 'dep', defAspect: 'H' },
        { id: 'XⅠ', x: 670, y: 158, dir: 'R', type: 'dep', defAspect: 'H' },
        { id: 'S', x: 800, y: 158, dir: 'L', type: 'home', defAspect: 'H' }
      ],
      routes: [
        { id: 'r1', name: '▶ 试办右咽喉迎面接车至 ⅠG（受左端 ZCJ↓ 照查拦截！）', signal: 'S', aspect: 'U', reqSw: {}, conflictCtrl: 'leftBuilt', secs: ['IG'], path: [[815, 140], [260, 140]], desc: '勾选左咽喉已建接车至 ⅠG 时，左咽喉 ZCJ↓ 切断右端照查电路，右咽喉禁止向 ⅠG 迎面接车！取消勾选即可正常接车。' }
      ]
    },
    {
      id: '9.4.1', ch: 9, page: 190, engine: 'yard',
      title: '图 9.4.1 · 进路解锁采用的典型线路（三点检查逐段解锁物理时序）',
      summary: '下行列车经 `IAG → 1DG → 1/7G → 7-11DG → ⅠG`：每个 Q 组合区段依次满足 **① 前段出清已解 → ② 本段曾占后清(1LJ↑·FDGJ 3s缓放) → ③ 后段已占(2LJ↑)** 方使 `SJ↑` 逐段解锁！',
      jump3d: { label: '🚉 进入 03 沙盘看 12-13 线实时透视', go: { mode: 'station' } },
      tracks: [
        { id: 't_m', pts: [[30, 165], [850, 165]], kind: 'main' },
        { id: 't_13', pts: [[260, 165], [330, 225]], kind: 'branch' },
        { id: 't_57', pts: [[510, 165], [440, 225]], kind: 'branch' },
        { id: 't_11', pts: [[610, 165], [680, 105], [820, 105]], kind: 'siding', name: '3G', labelPos: [760, 92] }
      ],
      sections: [
        { id: 'IAG', x1: 110, x2: 200, y: 165, label: 'IAG(无Q)' },
        { id: '1DG', x1: 200, x2: 350, y: 165, label: '1DG(Q1)' },
        { id: '1/7G', x1: 350, x2: 470, y: 165, label: '1/7G(Q2)' },
        { id: '7-11DG', x1: 470, x2: 680, y: 165, label: '7-11DG(Q3)' },
        { id: 'IG', x1: 680, x2: 840, y: 165, label: 'ⅠG股道' }
      ],
      switches: [
        { id: '1/3', x: 260, y: 165, dir: 'R', branchDy: 60, defPos: 'N', label: '1/3' },
        { id: '5/7', x: 510, y: 165, dir: 'L', branchDy: 60, defPos: 'N', label: '5/7' },
        { id: '11', x: 610, y: 165, dir: 'R', branchDy: -60, defPos: 'N', label: '11' }
      ],
      insulations: [{ x: 110, y: 165 }, { x: 200, y: 165 }, { x: 350, y: 165 }, { x: 470, y: 165 }, { x: 680, y: 165 }],
      signals: [{ id: 'X', x: 110, y: 145, dir: 'R', type: 'home', defAspect: 'H' }],
      routes: [
        { id: 'r1', name: '▶ 启动列车运行：观察 1DG → 1/7G → 7-11DG 逐段红占→琥珀缓放→绿解', signal: 'X', aspect: 'U', reqSw: { '1/3': 'N', '5/7': 'N', '11': 'N' }, secs: ['IAG', '1DG', '1/7G', '7-11DG', 'IG'], path: [[40, 165], [820, 165]], desc: '列车压入 IAG 瞬间关闭 X；每出清一个 Q 组合区段，经 FDGJ 缓放及下一区段占用确认后逐段恢复绿灯空闲！' }
      ]
    },
    {
      id: '9.4.3', ch: 9, page: 194, engine: 'yard',
      title: '图 9.4.3 · 调车接车进路示意图（D1→D5 逐段解锁与允许留车边界）',
      summary: '调车车列由 D1 经 `IAG → 1DG(1/3反) → 3DG → 5-9DG` 驶向 D5。调车信号机在**整列越过 D1（或外方留车条件下第一段出清）**后关闭，允许留车的边界区段按教材采用两点/一点检查！',
      tracks: [
        { id: 't_u', pts: [[40, 130], [840, 130]], kind: 'main', name: '上干线', labelPos: [760, 114] },
        { id: 't_d', pts: [[40, 205], [840, 205]], kind: 'main', name: '下干线 (3DG → 5-9DG)', labelPos: [740, 224] },
        { id: 't_13', pts: [[240, 130], [340, 205]], kind: 'branch' }
      ],
      sections: [
        { id: 'IAG', x1: 110, x2: 195, y: 130, label: 'IAG' },
        { id: '1DG', x1: 195, x2: 335, y: 130, label: '1DG' },
        { id: '3DG', x1: 335, x2: 500, y: 205, label: '3DG' },
        { id: '5-9DG', x1: 500, x2: 720, y: 205, label: '5-9DG' }
      ],
      switches: [{ id: '1/3', x: 240, y: 130, dir: 'R', branchDy: 75, defPos: 'R', label: '1/3 反位' }],
      insulations: [{ x: 110, y: 130 }, { x: 195, y: 130 }, { x: 345, y: 205 }, { x: 500, y: 205 }, { x: 720, y: 205 }],
      signals: [
        { id: 'D1', x: 195, y: 112, dir: 'R', type: 'shunt', defAspect: 'A' },
        { id: 'D5', x: 500, y: 223, dir: 'L', type: 'shunt', defAspect: 'A' }
      ],
      routes: [
        { id: 'r1', name: '▶ 调车运行 D1 → D5（1/3 反位 · 逐段追踪解锁）', signal: 'D1', aspect: 'B', reqSw: { '1/3': 'R' }, secs: ['1DG', '3DG', '5-9DG'], path: [[90, 130], [240, 130], [340, 205], [690, 205]], trainKind: 'shunt', desc: '整列完全越过 D1 后白灯转蓝灯，车列依次通过 1DG → 3DG → 5-9DG 实现调车分段解锁。' }
      ]
    },
    {
      id: '12.4.1', ch: 12, page: 241, engine: 'yard',
      title: '图 12.4.1 · 第12章计算机联锁示例站场（1G → D3 数据驱动跑车仿真）',
      summary: '教材第 12 章静态/动态数据结构核心站场：交叉渡线 `1/3、5/7、9、11/13` 连接 `1G/ⅢG/2G` 及 `13DG` 侵限关系。内置 PDF p.245 原例 **`1G → D3`（9反、3/5定、检 9DG/3-5DG 及 `<13>13DG`）**！',
      errata: '教材原书 PDF p.242 表 12.4.4 多处印刷“空闲时，进路不能建立”与正文矛盾，本仿真严格按正确逻辑“区段空闲且未被征用才可建立”执行。',
      controls: [
        { id: 'occ13', type: 'checkbox', label: '模拟 13DG 占用（校验 <13>13DG 侵限条件！）', def: false }
      ],
      tracks: [
        { id: 't_1g', pts: [[40, 110], [840, 110]], kind: 'main', name: '1G', labelPos: [760, 96] },
        { id: 't_3g', pts: [[40, 180], [840, 180]], kind: 'main', name: 'ⅢG', labelPos: [760, 166] },
        { id: 't_2g', pts: [[280, 180], [360, 248], [840, 248]], kind: 'siding', name: '2G', labelPos: [760, 266] },
        { id: 't_x13', pts: [[180, 110], [290, 180]], kind: 'branch' },
        { id: 't_x57', pts: [[180, 180], [290, 110]], kind: 'branch' },
        { id: 't_9', pts: [[460, 180], [540, 110]], kind: 'branch' },
        { id: 't_1113', pts: [[560, 180], [640, 248]], kind: 'branch' }
      ],
      sections: [
        { id: '3-5DG', x1: 140, x2: 340, y: 180, label: '3-5DG' },
        { id: '9DG', x1: 340, x2: 560, y: 180, label: '9DG' },
        { id: '13DG', x1: 560, x2: 730, y: 248, label: '13DG' },
        { id: '1G', x1: 560, x2: 830, y: 110 }
      ],
      switches: [
        { id: '1/3', x: 180, y: 110, dir: 'R', branchDy: 70, defPos: 'N', label: '1/3' },
        { id: '5/7', x: 180, y: 180, dir: 'R', branchDy: -70, defPos: 'N', label: '5/7' },
        { id: '9', x: 460, y: 180, dir: 'R', branchDy: -70, defPos: 'N', label: '9#' },
        { id: '11/13', x: 560, y: 180, dir: 'R', branchDy: 68, defPos: 'N', label: '11/13' }
      ],
      insulations: [{ x: 140, y: 180 }, { x: 340, y: 180 }, { x: 560, y: 180 }, { x: 560, y: 110 }, { x: 590, y: 210, kind: 'fouling', label: '<13>13DG' }],
      signals: [
        { id: 'D3', x: 140, y: 198, dir: 'R', type: 'shunt', defAspect: 'A' },
        { id: 'S1', x: 560, y: 92, dir: 'L', type: 'dep', defAspect: 'H' }
      ],
      routes: [
        { id: 'r1', name: '★ 教材 PDF p.245 实例：1G → D3（9反、3/5定、查 9DG/3-5DG + <13>13DG）', signal: 'S1', aspect: 'B', reqSw: { '9': 'R', '1/3': 'N', '5/7': 'N', '11/13': 'N' }, conflictCtrl: 'occ13', secs: ['9DG', '3-5DG'], path: [[730, 110], [540, 110], [460, 180], [90, 180]], trainKind: 'shunt', desc: '完全对应教材 12.4.4 节联锁表数据项：静态只读数据查 RequiredSwitches=[9反,3/5定]、Sections=[9DG,3-5DG]、条件侵限 <13>13DG！' }
      ]
    }
  ];

  root.FigDataYard = YARD_FIGURES;
  if (typeof module !== 'undefined' && module.exports) module.exports = YARD_FIGURES;
})(typeof window !== 'undefined' ? window : globalThis);
