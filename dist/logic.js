(function (root) {
  'use strict';
  const J = typeof module !== 'undefined' && module.exports ? require('./journey.js') : root.RailwayJourney;
  const TYPES = [
    'contacts', 'neutral', 'slowRelease', 'heavySlow', 'differential',
    'biased', 'latching', 'rectifier', 'filament', 'timeRelay', 'phase',
    'selfHold', 'turnoutLab', 'fiveWireLab', 'cbiIoLab'
  ];
  const SIGNAL_TYPES = ['inStation', 'distant', 'depFour', 'depThree', 'depSemi', 'shuntSig'];
  const SIGNAL_ASPECTS = {
    inStation: {
      H: { label: 'H · 红灯（常态禁止）', lit: ['H'], relays: { LXJ: false, ZXJ: false, TXJ: false, YXJ: false, DJ2: false }, meaning: '不准列车越过该信号机。' },
      U: { label: 'U · 单黄（正线接车）', lit: ['U1'], relays: { LXJ: true, ZXJ: true, TXJ: false, YXJ: false, DJ2: false }, meaning: '准许列车按限速经道岔直向位置进入站内正线准备停车（表3.2.2 第1条）。' },
      UU: { label: 'UU · 双黄（侧线接车）', lit: ['U1', 'U2'], relays: { LXJ: true, ZXJ: false, TXJ: false, YXJ: false, DJ2: true }, meaning: '准许列车按限速经道岔侧向位置进入站内股道停车（表3.2.2 第2–4条）。' },
      L: { label: 'L · 绿灯（正线通过）', lit: ['L'], relays: { LXJ: true, ZXJ: true, TXJ: true, YXJ: false, DJ2: false }, meaning: '准许列车按规定速度经道岔直向位置进入或通过车站。' },
      LU: { label: 'LU · 绿黄（次架黄灯）', lit: ['L', 'U2'], relays: { LXJ: true, ZXJ: true, TXJ: false, LUXJ: true, DJ2: true }, meaning: '准许列车经直向进站，指示下一架信号机往直向开放一个黄色灯光。' },
      USU: { label: 'USU · 黄闪黄（18#道岔）', lit: ['U1', 'U2'], flash: ['U1'], relays: { LXJ: true, ZXJ: false, CTXJ: true, SNJ: true, DJ2: true }, meaning: '准许列车经18号及以上道岔侧向进站越过已开放的下一架信号机。' },
      HB: { label: 'HB · 红+月白（引导接车）', lit: ['H', 'B'], relays: { LXJ: false, ZXJ: false, YXJ: true, DJ2: true }, meaning: '信号机故障或向非接车线接车时办理引导，列车不超过 20 km/h 进站。' }
    },
    distant: {
      U: { label: 'U · 黄灯（主体关闭）', lit: ['U'], relays: { YGJ: false }, meaning: '主体进站信号机在关闭状态，预告司机提前减速准备停车。' },
      L: { label: 'L · 绿灯（主体开放）', lit: ['L'], relays: { YGJ: true }, meaning: '主体进站信号机处于开放状态（设于非自闭进站前方 ≥800 m）。' }
    },
    depFour: {
      H: { label: 'H · 红灯（常态禁止）', lit: ['H'], relays: { LXJ: false, ZXJ: false, DXJ: false, LQJ2: false, LQJ3: false }, meaning: '不准列车由车站出发。' },
      U: { label: 'U · 单黄（1闭塞空闲）', lit: ['U'], relays: { LXJ: true, ZXJ: true, DXJ: false, LQJ2: false, LQJ3: false }, meaning: '准许列车由车站出发，表示运行前方有一个闭塞分区空闲。' },
      LU: { label: 'LU · 绿黄（2闭塞空闲）', lit: ['L1', 'U'], relays: { LXJ: true, ZXJ: true, DXJ: false, LQJ2: true, LQJ3: false, DJ2: true }, meaning: '准许列车由车站出发，表示运行前方有两个闭塞分区空闲（检 2DJ↑）。' },
      L: { label: 'L · 绿灯（3+闭塞空闲）', lit: ['L1'], relays: { LXJ: true, ZXJ: true, DXJ: false, LQJ2: true, LQJ3: true }, meaning: '准许列车由车站出发，表示运行前方至少有三个闭塞分区空闲。' },
      LL: { label: 'LL · 双绿（半自闭/次要方向）', lit: ['L1', 'L2'], relays: { LXJ: true, ZXJ: false, DXJ: false, DJ2: true }, meaning: '准许列车由车站出发，开往半自动闭塞、自动站间闭塞或次要方向。' },
      B: { label: 'B · 月白（兼作调车）', lit: ['B'], relays: { LXJ: false, DXJ: true }, meaning: '兼作调车信号机时，准许越过该信号机调车。' }
    },
    depThree: {
      H: { label: 'H · 红灯（常态禁止）', lit: ['H'], relays: { LXJ: false, DXJ: false }, meaning: '不准列车越过该信号机。' },
      U: { label: 'U · 单黄（1闭塞空闲）', lit: ['U'], relays: { LXJ: true, DXJ: false }, meaning: '准许列车由车站出发，表示前方有 1 个闭塞分区空闲。' },
      L: { label: 'L · 绿灯（2+闭塞空闲）', lit: ['L'], relays: { LXJ: true, ZXJ: true, DXJ: false }, meaning: '准许列车出发，表示前方至少 2 个闭塞分区空闲（表3.2.2 SⅠ~S4 亮 L+右）。' },
      B: { label: 'B · 月白（兼作调车）', lit: ['B'], relays: { LXJ: false, DXJ: true }, meaning: '兼作调车信号机时准许调车（表3.2.2 第26–33条 SⅠ~S4）。' }
    },
    depSemi: {
      H: { label: 'H · 红灯（常态禁止）', lit: ['H'], relays: { LXJ: false }, meaning: '未取得半自动闭塞发车权，不准发车。' },
      L: { label: 'L · 绿灯（准许发车）', lit: ['L'], relays: { LXJ: true }, meaning: '用于非自动闭塞区段，取得发车权后开放绿灯准许出发。' }
    },
    shuntSig: {
      A: { label: 'A · 蓝灯（常态禁止调车）', lit: ['A'], relays: { DXJ: false, ZJ: false }, meaning: '不准越过该信号机调车（注意：蓝灯对列车作业不起控制作用）。' },
      B: { label: 'B · 月白（准许调车）', lit: ['B'], relays: { DXJ: true, ZJ: true }, meaning: '准许越过该信号机调车，保留至车列完全越过为止。' },
      B_FLASH: { label: 'B闪 · 月白闪光（平面溜放）', lit: ['B'], flash: ['B'], relays: { DXJ: true, ZJ: true }, meaning: '装有平面溜放调车区集中联锁设备时，准许溜放调车。' }
    }
  };
  function evaluateSignal(s) {
    const st = SIGNAL_TYPES.includes(s.signalType) ? s.signalType : 'inStation';
    const map = SIGNAL_ASPECTS[st];
    const aspect = map[s.signalAspect] ? s.signalAspect : Object.keys(map)[0];
    const spec = map[aspect];
    const variant = (st === 'inStation' ? ['a', 'b', 'c'] : ['a', 'b']).includes(s.signalVariant)
      ? s.signalVariant
      : (st === 'shuntSig' ? 'b' : 'a');
    const broken = s.signalFilament === 'broken';
    const backup = s.signalFilament === 'backup';
    const secondOut = !!s.signalSecondFilamentFault && ['UU', 'LU', 'USU', 'LL'].includes(aspect);
    const DJ = !broken;
    const DZJ = !backup && !broken;
    const DJ2 = !broken && !secondOut;
    const downgradedToRed = !broken && secondOut;
    const effectiveAspect = downgradedToRed ? 'H' : aspect;
    const lit = broken ? [] : (downgradedToRed ? ['H'] : spec.lit);
    const flash = broken || downgradedToRed ? [] : (spec.flash || []);
    const showIndicator = !broken && !downgradedToRed && ['depFour', 'depThree'].includes(st) && s.signalIndicator === 'right' && !['H', 'B'].includes(aspect);
    const reasons = [];
    if (broken) reasons.push('主、副灯丝均断丝 → 灯丝继电器 DJ↓ 断开电路 → 信号灯光熄灭！按故障—安全原则必须视为停车信号（红灯防灭灯禁止开放）。');
    else if (downgradedToRed) {
      reasons.push(`第 5.1.2 节(3) 防信号升级保护：${aspect} 需第 1 灯回路串联 2DJ↑ 监督第 2 允许灯位；第 2 灯丝断丝 → 2DJ↓ 切断 LXJ，强制降级改点红灯 H，严禁升级成单黄/单绿！`);
    } else {
      if (backup) reasons.push('主灯丝 H₁ 断丝 → 灯丝转换继电器 DZJ 失磁落下，后接点自动转接副灯丝 H₂（DJ 靠缓放保持 ↑ 不灭灯）。');
      reasons.push(spec.meaning);
      if (showIndicator) reasons.push('进路/方向表示器同时点亮白色“右”向指示，向司机预告向北京方面发车方向（需先检 3DJ↑）。');
    }
    const relayOut = { ...spec.relays, DJ, DZJ };
    if (showIndicator && st === 'depFour') {
      relayOut.ZXJ = false;
      relayOut.DJ3 = true;
    }
    if (downgradedToRed) {
      relayOut.LXJ = false;
      if ('ZXJ' in relayOut) relayOut.ZXJ = false;
      relayOut.DJ2 = false;
    } else if ('DJ2' in relayOut) {
      relayOut.DJ2 = DJ2;
    }
    return {
      picked: DJ && !downgradedToRed && (aspect !== 'H' && aspect !== 'A' && !(st === 'distant' && aspect === 'U')),
      frontClosed: DJ && !downgradedToRed, backClosed: !DJ || downgradedToRed, drive: DJ,
      signal: {
        type: st, variant, aspect: effectiveAspect, intendedAspect: aspect, spec, lit, flash,
        downgradedToRed,
        filament: broken ? 'broken' : backup ? 'backup' : 'main',
        indicator: showIndicator ? 'right' : '',
        relays: relayOut
      },
      reasons
    };
  }

  function initial() {
    return {
      type: 'neutral', mode: 'bench', polarity: 0, latched: false,
      localPower: true, frequency: 'correct', phase: 'correct',
      front: -20, power: true, railBreak: false, receiverBreak: false,
      multi: false, branchOccupied: false, explode: 0, cover: false,
      labels: true, slow: false, field: true, sound: true,
      filamentMode: 'main',
      filamentSignalSystem: 'inStation',
      filamentOutAspect: 'L',
      // 专题A：图4.2.2 自闭电路与图4.3.1—4.3.5 断线与五种混线防护
      shButton: false,
      shFujPicked: false,
      shWireBreak: false,
      shCrossMethod: 'position',
      shCrossFault: 'none',
      shShuntLineBreak: false,
      shLatched: false,
      // 专题B：图5.2.2—5.2.3 四线制道岔控制与表示电路状态
      toStage: 0,
      toObstacle: false,
      toLidOpen: false,
      toSjLocked: false,
      toIndFault: 'none',
      // 专题D：图5.2.4—5.2.8 五线制三相交流道岔控制与表示电路
      fwStage: 0,
      fwPhaseLoss: false,
      fwLidOpen: false,
      // 专题E：图11.3.2 & 图13.2.2—13.2.4 计算机联锁安全 I/O 硬件隔离接口
      cbiMode: 'pulseTrans',
      cbiCmd: true,
      cbiFault: 'none',
      cbiPulsePhase: 'auto',
      // 专题C：03 车站全作业联锁沙盘（接车 IG/3G、发车 DEP、调车 SHUNT + ZQA/ZRA/SGA + 15线透视）
      pantograph: true, catenaryPower: true, mainBreaker: true, trainBrake: false, stationDirection: 1,
      stationHistory: null,
      secondHistory: null,
      stationRoute: 'IG',
      stationStage: 5,
      stationTrain: -26,
      lampFault: false,
      switchFault: false,
      poorShunt: false,
      cancelMode: 'none',
      zraProgress: 0,
      zraInterrupted: false,
      signalFaultLocked: false,
      stationNetView: 'matrix',
      blindFault: 'none',
      guideMode: false,
      guideRouteLocked: false,
      guideManualConfirm: false,
      guideTotalLock: false,
      guideFirstSecFault: false,
      guideHoldElapsed: 0,
      hostileRoute: false,
      multiTrainMode: 'none',
      secondRoute: 'R14',
      secondTrain: -26,
      // 第 2.3 节 信号机三维结构、机构灯光配置与第 5.1 节继电器结合
      signalType: 'inStation',
      signalVariant: 'a',
      signalAspect: 'H',
      signalFilament: 'main',
      signalSecondFilamentFault: false,
      signalIndicator: '',
      // 专题F：04 站场规则·联锁表·计算机联锁实验室子页签
      cbiTab: 'yardRules',
      // 专题G：05 全书 168 幅教材插图实时交互仿真馆
      figureId: '3.1.1',
      figRouteIdx: null,
      figChapter: null
    };
  }
  function occupied(front) {
    return front >= 0 && front - 40 <= 100;
  }
  function evaluateSelfHold(s) {
    const fujPicked = !!s.shFujPicked;
    const fujBackClosed = !fujPicked;
    const wireBreak = !!s.shWireBreak;
    const method = s.shCrossMethod || 'position';
    const crossFault = s.shCrossFault || 'none';
    const crossActive = crossFault !== 'none';
    const buttonClosed = !!s.shButton;
    const shuntBroken = !!s.shShuntLineBreak;

    const effectivePosition = crossFault === 'position' || (crossFault === 'active' && method === 'position');
    const commonLive = !wireBreak && fujBackClosed && !effectivePosition;
    let wrongMixEnergized = false;
    if (!wireBreak) {
      if (crossFault === 'naive') wrongMixEnergized = true;
      else if (crossActive) {
        if (method === 'shunt' && shuntBroken) wrongMixEnergized = true;
      }
    }
    const ajPicked = wrongMixEnergized || (commonLive && (buttonClosed || !!s.shLatched));
    const startBranchLive = commonLive && buttonClosed;
    const holdBranchLive = commonLive && ajPicked;
    const polaritySecondPicked = method === 'polarity' && crossFault === 'none' && commonLive && !ajPicked;

    const reasons = [];
    if (wireBreak) reasons.push('共用供电导线断线 → 闭路条件破坏，AJ 立即失磁落下（符合图4.3.1断线防护故障—安全原则）');
    if (crossFault === 'naive') reasons.push('图4.3.2(a) 电源与继电器同在室内：室外电缆混线绕过开关，导致继电器错误无条件吸起（危险！）');
    else if (effectivePosition) reasons.push('图4.3.2(b) 远端供电（位置法）：电源与继电器分设在混线点两侧，电缆混线将电源短路熔断，继电器可靠落下');
    else if (crossActive && method === 'polarity') reasons.push('图4.3.3 极性法：两偏极继电器 1JBJ/2JBJ 极性相反串联；若去线Q混入同极KZ维持原态、混入异极KF或短路熔断器则双落导向安全侧');
    else if (crossActive && method === 'doubleBreak') reasons.push('图4.3.4(b) 双断法：去线 Q 与回线 H 均串接控制条件接点，单条 Q 线混线无法闭合回路（仅降低危险侧故障率，仍需注意双线同混）');
    else if (crossActive && method === 'isolatedPower') reasons.push('第4.3.2(4) 独立电源法（电源隔离法）：各继电器无公共回线，任意两条跨线混线均不能构成错误闭合回路');
    else if (method === 'shunt') {
      if (shuntBroken && crossActive) reasons.push('⚠ 图4.3.5 分路法隐患暴露：因平时 KJF 分路线自身断线得不到闭路检查，一旦 Q 线混入外部电源即发生危险误吸起！故分路法非故障—安全电路');
      else if (shuntBroken) reasons.push('图4.3.5 分路法警告：分路线当前已断线但系统【无任何报警检查手段】，一旦混入电源即失守！');
      else if (crossActive) reasons.push('图4.3.5 分路法(分路线暂完好)：KJ后接点把Q/H短接使线圈等电位暂不误吸；但教材明确指出分路线断线不受检查，不属于故障—安全');
    }
    if (fujPicked) reasons.push('FUJ 励磁吸起 → 共用支路 FUJ 后接点(11-13)断开，切断 AJ 自闭保持电路');
    if (commonLive && !buttonClosed && ajPicked && !wrongMixEnergized) reasons.push('自复按钮 A 已松开复原，AJ 经自身前接点(11-12)构成的自闭支路继续保持吸起');
    if (startBranchLive) reasons.push('自复按钮 A 按下闭合，电流经启动支路使 AJ 励磁吸起，同时闭合 AJ 前接点(11-12)');
    if (!ajPicked && !reasons.length) reasons.push('自复按钮 A 未按下且 AJ 前接点(11-12)断开，启动支路与自闭支路均开路，AJ 保持落下');
    return {
      picked: ajPicked, frontClosed: ajPicked, backClosed: !ajPicked, drive: ajPicked,
      selfHold: {
        ajPicked, fujPicked, fujBackClosed, buttonClosed, commonLive, startBranchLive,
        holdBranchLive, wireBreak, crossFault, method, shuntBroken, polaritySecondPicked, wrongMixEnergized
      },
      reasons
    };
  }
  function evaluateTurnout(s) {
    const stg = s.toStage || 0;
    const lidOpen = !!s.toLidOpen;
    const obstacle = !!s.toObstacle;
    const sjLocked = !!s.toSjLocked;
    const indFault = s.toIndFault || 'none';
    const indFaultActive = indFault !== 'none';
    const trailThrough = indFault === 'trailThrough';
    // PDF p.82（书72页）：尖轨夹异物受阻空转时，自动开闭器 A 爪未切换，1DQJ 1-2(0.44Ω) 不能落下、电机持续空转直至烧断 RD₂
    const jammedRunning = obstacle && stg >= 3 && !lidOpen;
    const dqj1Picked = ((stg === 1 && !sjLocked) || (stg === 2 && !sjLocked) || (stg === 3 && !lidOpen) || jammedRunning);
    const dqj1SlowHold = stg === 2 && !sjLocked;
    const dqj1CurrentHold = (stg === 3 && !lidOpen) || jammedRunning;
    const dqj2Reverse = stg >= 2 && !(stg === 2 && sjLocked);
    const motorRunning = (stg === 3 && !lidOpen) || jammedRunning;
    // 图5.2.2（PDF p.79）：遮断器 05-06 仅串接在 X4 动作回线中，不串接在静态表示回路中；故到位后打开机盖不影响静态表示（但动作中打开立即断电停机）
    const dbjPicked = stg === 0 && !indFaultActive;
    const fbjPicked = stg === 4 && !obstacle && !indFaultActive;
    // PDF p.82：挤岔时自动开闭器 A、B 两组动接点均被顶至中间位置断开，且移位接触器 01-02/03-04 断开
    const k11_12 = !trailThrough && (stg < 4 || obstacle);
    const k21_22 = !trailThrough && stg === 4 && !obstacle;
    const k31_32 = !trailThrough && stg <= 2;
    const k41_42 = !trailThrough && stg >= 3;
    const tonguePos = trailThrough ? .5 : stg <= 2 ? 0 : (stg === 3 || obstacle) ? .55 : 1;
    const fuseBlown = false;
    const reasons = [];
    if (lidOpen) reasons.push('转辙机遮断器 05-06 断开（打开机盖检修）→ 立即切断 X4 动作回线与 1DQJ 0.44Ω 自闭回路，禁止电机转动（图5.2.2）');
    if (sjLocked && (stg === 1 || stg === 2)) reasons.push('道岔区段锁闭/进路锁闭（SJ↓ 或 DGJ↓）：1DQJ 3-4 启动励磁回路被 SJ81-82 前接点切断，严禁道岔启动转换（满足 5.2.1 技术条件(1)(2)）');
    if (sjLocked && stg === 3 && motorRunning) reasons.push('技术条件(3)验证（PDF p.76/p.81）：道岔启动后列车驶入使 SJ↓，因 1DQJ 1-2 低阻线圈(0.44Ω)与电机 M 串联自闭已脱离 SJ 控制，道岔继续转换到底不停转！');
    if (indFault === 'wireCross') reasons.push('表示外线混线故障（PDF p.82）：室外整流二极管 Z 被短接，交流电直接流入偏极继电器 JPXC-1000 → DBJ↓、FBJ↓ 绝不错误吸起');
    else if (indFault === 'capShort') reasons.push('滤波电容 C 击穿短路故障（PDF p.82）：表示继电器线圈被电容 C 短路旁路 → DBJ↓、FBJ↓ 可靠落下');
    else if (indFault === 'capOpen') reasons.push('滤波电容 C 引线断线故障（PDF p.82）：失去半波放电续流滤波作用，DBJ/FBJ 发生脉动颤动不能稳定吸起');
    else if (trailThrough) reasons.push('挤岔故障（PDF p.82）：自动开闭器 A、B 两组动接点均被表示杆顶至中间位置全断开，且移位接触器 01-02/03-04 断开 → DBJ↓ 且 FBJ↓ 双落报警');
    if (obstacle && stg >= 3) reasons.push(lidOpen ? '尖轨夹异物受阻且机盖已打开（05-06断开），电机停转、1DQJ 落下，仍无法密贴反位（FBJ↓）' : '尖轨夹异物受阻空转（PDF p.82）：A 爪无法切换到第2排，1DQJ(1-2 0.44Ω) 不能落下、电机持续空转（13~30s 将烧断反位熔丝 RD₂，FBJ↓）；因 B 爪已提前闭合 41-42，可单操定位经 X1/RD₁ 退回定位');
    if (stg === 0 && !indFaultActive) reasons.push('道岔定位密贴（图5.2.2/PDF p.81）：1DQJ ↓、2DQJ 定位，经 BB(AC220V)→R→X3→04-03→14-13→34-33→二极管Z→32-31→X1 使偏极 DBJ ↑');
    if (stg === 1 && !sjLocked) reasons.push('发出反位操岔命令：FCJ ↑，检查 SJ81-82 ↑，1DQJ 经 3-4 电压前圈(125Ω)励磁吸起，切断表示电路（DBJ ↓）');
    if (stg === 2 && !sjLocked) reasons.push('1DQJ 前接点接通 2DQJ 2-1 反位线圈使其转极至反位(111-113闭合)；2DQJ 第4组接点切断 1DQJ 3-4 线圈瞬间，1DQJ 靠铁芯紫铜阻尼铜套缓放保持吸起');
    if (stg === 3 && motorRunning && !obstacle && !sjLocked) reasons.push('电机 M 启动旋转带动尖轨：1DQJ 转由串联在电机回路中的 1-2 低阻电流后圈(0.44Ω)自闭；内侧 B 动接点组先匀速由第3排转至第4排(闭合 41-42 准备回转定位通路)');
    if (stg === 4 && !obstacle && !indFaultActive) reasons.push('道岔转换到底并密贴反位：外侧 A 动接点组速动断开 11-12、接通第2排(21-22/23-24)，切断电机电源 → 1DQJ 缓放落下 → 经 43-44/23-24/Z/21-22/X2 接通反位表示使 FBJ ↑');
    return {
      picked: dbjPicked || fbjPicked || dqj1Picked,
      frontClosed: dqj1Picked, backClosed: !dqj1Picked, drive: dqj1Picked,
      turnout: { stg, dqj1Picked, dqj1SlowHold, dqj1CurrentHold, dqj2Reverse, motorRunning, dbjPicked, fbjPicked, k11_12, k21_22, k31_32, k41_42, tonguePos, lidOpen, obstacle, sjLocked, indFault, fuseBlown },
      reasons
    };
  }
  function evaluateFiveWire(s) {
    const stg = s.fwStage || 0;
    const phaseLoss = !!s.fwPhaseLoss;
    const lidOpen = !!s.fwLidOpen;
    const activePhaseOK = !phaseLoss && !lidOpen;
    // 图5.2.5（PDF p.84）：阶段1 室内直流使 1DQJ 3-4 励磁↑ → 经 1DQJ 第3组前接点立即吸起 1DQJF↑；阶段2 1DQJF 驱动 2DQJ 换相（1DQJ 铜套缓放）；阶段3 接通三相 AC 380V 经 DBQ 使 BHJ↑ 构成 1DQJ 1-2 自闭（缺相或遮断开关 K 断开时 BHJ 立即↓切断自闭！）
    const bhjPicked = stg === 3 && activePhaseOK;
    const dqj1Picked = stg === 1 || stg === 2 || bhjPicked;
    const dqj1SlowHold = stg === 2;
    const dqj1fPicked = dqj1Picked;
    const dqj2Reverse = stg >= 2;
    const motorRunning = bhjPicked;
    const dbjPicked = stg === 0;
    const fbjPicked = stg === 4 && activePhaseOK;
    const tonguePos = stg <= 2 ? 0 : stg === 3 ? .55 : (activePhaseOK ? 1 : .55);
    const reasons = [];
    if (lidOpen && stg >= 3) reasons.push(`遮断开关 K 断开（图5.2.7 串在 U 相动作回路）→ 缺 U 相电流 → DBQ 立即使 BHJ ↓ 断开 1DQJ 1-2 自闭与 1DQJF，保障检修安全${stg === 4 ? '（尖轨未能转换到位，FBJ 保持落下）' : ''}`);
    else if (lidOpen) reasons.push('已打开检修机盖（遮断开关 K 断开串在 U 相动作回路），进入阶段 3 动作时将因缺 U 相导致 BHJ↓ 禁止转换');
    else if (phaseLoss && stg >= 3) reasons.push(`三相电源缺相故障 → DBQ 断相保护器失三相通流 → BHJ 立即落下切断 1DQJ 1-2 自闭与 1DQJF，防止 S700K 三相电机缺相烧毁${stg === 4 ? '（尖轨未能转换到位，FBJ 保持落下）' : ''}`);
    else if (phaseLoss) reasons.push('已预设三相电源缺相故障（进入阶段 3 接入三相 AC 380V 时，DBQ 将立即使 BHJ↓ 切断动作自闭回路）');
    if (stg === 0) reasons.push('定位稳态（图5.2.8/PDF p.86）：1DQJ/1DQJF↓、2DQJ定位，BB(AC110V)负半周经 R₁→DBJ(4-1)→X4→11-12→电机V/W→X1 励磁；正半周经 X2→33-34/15-16→并联 Z+R₂(300Ω/50W)→36-35→电机U/W→X1，DBJ 靠自感电动势维持吸起（取消电容C）');
    if (stg === 1) reasons.push('一级启动（图5.2.5/PDF p.84）：检查 SJ↑ 与 DGJ↑，FCJ↑ 使 1DQJ 3-4 线圈励磁↑，随即经 1DQJ 第3组前接点接通 1DQJF↑ 准备转极');
    if (stg === 2) reasons.push('二级转极（图5.2.5）：1DQJF 第3/4组前接点驱动 2DQJ 转至反位，交换 B、C 两相序（由 W-U-V 改为 W-V-U 逆时针旋转）；转极瞬间 1DQJ 靠阻尼铜套缓放保持↑');
    if (stg === 3 && motorRunning) reasons.push('三级自闭运转（图5.2.7）：三相 AC 380V 经 RD₁~RD₃(5A)→DBQ→X1/X3/X4 驱动 S700K（W-V-U），DBQ 感应三相平衡电流使 BHJ↑，经 QDJ↑ 与 BHJ 第3组前接点构成 1DQJ 1-2 自闭（含 13s/30s 定时保护）');
    if (stg === 4 && activePhaseOK) reasons.push('反位密贴到位（图5.2.7—5.2.8）：第1排接点断开三相电流 → DBQ 使 BHJ↓ → 1DQJ/1DQJF 落下 → 经 X1/X3/X5（正半周 FBJ 励磁、负半周并联 Z+R₂ 续流）并串检三相电机绕组完好使 FBJ ↑');
    return {
      picked: dbjPicked || fbjPicked || dqj1Picked,
      frontClosed: dqj1Picked, backClosed: !dqj1Picked, drive: dqj1Picked,
      fiveWire: { stg, phaseLoss, lidOpen, bhjPicked, dqj1Picked, dqj1SlowHold, dqj1fPicked, dqj2Reverse, motorRunning, dbjPicked, fbjPicked, tonguePos },
      reasons
    };
  }
  function evaluateCbiIo(s) {
    const mode = s.cbiMode || 'pulseTrans';
    const cmd = !!s.cbiCmd;
    const fault = s.cbiFault || 'none';
    const faulted = fault !== 'none';

    let relayPicked = false, dynamicActive = false, inputCode = '0101', inputValid = true;
    if (mode === 'pulseTrans' || mode === 'capPump') {
      dynamicActive = cmd && !faulted;
      relayPicked = dynamicActive;
      inputValid = !faulted;
    } else if (mode === 'staticIn') {
      if (fault === 'stuckHigh') { inputCode = '1111 (非法码)'; inputValid = false; }
      else if (fault === 'stuckLow' || fault === 'wireOpen') { inputCode = '0000 (非法码)'; inputValid = false; }
      else if (fault === 'diodeShort') { inputCode = '1100 (非法码)'; inputValid = false; }
      else inputCode = cmd ? '0101 (有效吸起)' : '1010 (有效落下)';
      relayPicked = cmd && inputValid;
    } else {
      dynamicActive = cmd && !faulted;
      inputValid = !faulted;
      relayPicked = dynamicActive;
      inputCode = dynamicActive ? '动态脉冲回采匹配' : (!cmd && !faulted ? '接点断开·无回采脉冲（安全落下）' : '✕ 故障/卡死·无有效回采脉冲（安全判落下）');
    }

    const reasons = [];
    if (fault === 'stuckHigh') {
      reasons.push(mode === 'pulseTrans'
        ? '模拟 CPU 输出故障“卡死在常高电平 1”：光耦 U1 长期固定导通形成直流稳态，脉冲变压器 T 初级磁通不再变化（dΦ/dt=0）无法向次级感应能量 → 偏极继电器 J 可靠失磁落下至 0 V 安全侧！'
        : mode === 'capPump'
          ? '模拟 CPU 卡死在常高电平 1：U1 长期导通导致 T1 截止、T2 持续导通，电容 C1 得不到低电平时段的充电补能，储能电容 C2 电压很快跌破释放值 → 偏极继电器 J 失磁落下导向安全侧！'
          : '静态/动态输入检测到常高卡死（如编码 1111 或稳态无周期脉冲），系统拒绝采信并一律强制判定为安全落下状态！');
    } else if (fault === 'stuckLow' || fault === 'wireOpen') {
      reasons.push('电路断线或卡死常低电平 0：无交变驱动能量或回采脉冲中断 → 继电器可靠落下或采集锁定安全侧');
    } else if (fault === 'diodeShort') {
      reasons.push(mode === 'capPump'
        ? '即使二极管 D1 反向击穿，由于执行继电器 J 为偏极型继电器（JPXC-1000），反向/交流分量绝不会使其故障吸起（图13.2.4原文结论，PDF p.260）'
        : '器件短路破坏不对称编码/整流条件 → 非法编码(1100)或变压器次级失单向驱动 → 导向安全侧');
    } else if (cmd) {
      reasons.push(mode === 'pulseTrans'
        ? '联锁 CPU 输出动态 5V 脉冲串 → U1 交替开关驱动 24V 脉冲变压器 T → 次级 DR 全波整流后维持物理安全型继电器 J ↑'
        : mode === 'capPump'
          ? '脉冲低半周 U1 截止/T1 导通充 C1（C2 放电维持 J）；脉冲高半周 U1 导通/T2 导通由 C1 泵能至 C2 并向偏极继电器 J 供电维持 J ↑'
          : `安全采集接口读回有效编码/回采脉冲（${inputCode}），联锁运算层安全采信`);
    } else {
      reasons.push(mode === 'capPump'
        ? '图13.2.4 无控制命令输出时：计算机 I/O 接口送出稳态高电平（非脉冲），C1 无充电电流、C2 无电压，偏极继电器 J 处于安全释放状态 ↓'
        : '联锁主机未下发吸起指令（停止脉冲或现场接点断开 1010）：继电器/逻辑处于安全释放位置 ↓');
    }
    return {
      picked: relayPicked, frontClosed: relayPicked, backClosed: !relayPicked, drive: dynamicActive || (mode === 'staticIn' && relayPicked),
      cbiIo: { mode, cmd, fault, relayPicked, dynamicActive, inputCode, inputValid },
      reasons
    };
  }

  const ALL_YARD_SECTIONS = ['X3JG', 'S1LQG', 'IAG', '1DG', '1/7G', '3DG', '5-9DG', '11DG', 'IG', 'IIG', '3G', '4G'];
  const ALL_THROAT_SIGNALS = ['X', 'XF', 'S1', 'SII', 'S3', 'S4', 'D1', 'D3', 'D5', 'D7'];

  // 教材第 2.5.2 / 3.1.1–3.1.2 / 3.3.4 / 8–9 章 多列车同时运行与联锁冲突/平行作业标准场景
  const MULTI_TRAIN_SCENARIOS = {
    none: { id: 'none', name: '单列车独立运行（默认）', routeA: null, routeB: null, note: '单列复兴号按所选表 3.2.2 进路独立运行，逐区段实时驱动 Q 组合继电器链。' },
    parallel_rec_dep: {
      id: 'parallel_rec_dep',
      name: '① 平行作业：Ⅰ道接车 (X→IG) ∥ Ⅱ道向X_F发车 (SⅡ→X_F)',
      routeA: 'R1', routeB: 'R14', initTrainA: -26, initTrainB: -26,
      note: '教材第 2.5.2 & 3.1.1 节：双动渡线 1/3、5/7 均定位且渡线设绝缘节，上通道(IAG-1DG-7-11DG-IG)与下通道(IIG-5-9DG-3DG-S1LQG)完全平行隔离，X:U 与 SⅡ:L 同时开放、两列动车组相向平行运行！'
    },
    parallel_dual_rec: {
      id: 'parallel_dual_rec',
      name: '② 平行作业：双线同向同时接车 (X→IG ∥ X_F→IIG)',
      routeA: 'R1', routeB: 'R10', initTrainA: -26, initTrainB: -26,
      note: '教材表 3.2.2 第 1 条与第 10 条：1/3、5/7 均在定位构成平行防护，进站信号机 X(U) 与反方向进站信号机 X_F(U) 同时开放，两列列车并排同时接车进站！'
    },
    parallel_shunt: {
      id: 'parallel_shunt',
      name: '③ 带动/绝缘隔离平行调车：左端 D₁→D₅(1/3反) ∥ 右端 D₇→IG(5/7定)',
      routeA: 'R18', routeB: 'R24', initTrainA: -20, initTrainB: -20,
      note: '教材图 2.5.1 & 第 3.1.2 节带动道岔：因道岔 1 与 7 间设 1/7G 绝缘节且 5/7 保持定位，左端经 (1/3) 反位转 3DG 与右端 D₇ 经 5/7 定位入 IG 互不侵限，D₁:B 与 D₇:B 同时开放！'
    },
    conflict_queue: {
      id: 'conflict_queue',
      name: '④ 抵触排队与分段解锁：一号车 X→IG 先行 ➔ 二号车 D₅→IG 待解锁即放行',
      routeA: 'R1', routeB: 'R20', initTrainA: -26, initTrainB: -16,
      note: '教材第 3.1.1 & 9.4 节：二号车 D₅→IG 需 (5/7) 反位及 7-11DG，在一号车未出清解锁前被联锁闭锁（D₅ 保持蓝灯 A 停车等待）；一号车驶入 IG 解锁咽喉瞬间，5/7 自动转反位、D₅:B 开放放行二号车！'
    },
    track_occupied: {
      id: 'track_occupied',
      name: '⑤ 股道已停二号车：列车接车禁开正常信号(可办HB引导) vs 调车连挂允许开放白灯 B',
      routeA: 'R1', routeB: 'R1', initTrainA: -26, initTrainB: 126,
      note: '教材第 3.1.1(3) 节(PDF p.36) & 第 3.3.4 节：正线 IG 已停有二号车(IG_DGJ↓)时，列车接车 X→IG 因股道占用严禁开放正常黄灯 U（可点【引导接车 HB】限速进站）；若切换一号车为调车进路 D₇→IG(第24条) 或 D₅→IG(第20条)，则即使股道占用仍允许开放月白灯 B 进入股道连挂！'
    },
    custom: {
      id: 'custom',
      name: '⑥ 自定义双车联锁实验（自由任选一号车与二号车 33 条进路）',
      routeA: null, routeB: 'R14', initTrainA: -26, initTrainB: -26,
      note: '可任意搭配表 3.2.2 的 33 条进路作为一号车 A 与二号车 B，联锁引擎自动实时判定两车是“平行同时开放”还是“道岔/区段/迎面冲突闭锁等待分段解锁”！'
    }
  };

  function evaluateStation(s) {
    const rType = s.stationRoute || 'IG';
    const routeSpec = J.resolveRoute(rType);
    const history = s.stationHistory && s.stationHistory.route === rType ? s.stationHistory : null;
    const isClassic4 = ['IG', '3G', 'DEP', 'SHUNT', 'R1', 'R3', 'R5', 'R17'].includes(rType);
    const route3G = routeSpec.code === 'R3';
    const isDep = routeSpec.kind === 'depart';
    const isShunt = routeSpec.kind === 'shunt';
    const hasReverseSwitch = Object.values(routeSpec.switches).includes('R');
    const stg = s.stationStage;
    const f = s.stationTrain, r = f - 16;

    const activeLampFault = s.lampFault || s.blindFault === 'lamp';
    const activeSwitchFault = s.switchFault || s.blindFault === 'switch';
    const activePoorShunt = s.poorShunt || s.blindFault === 'poorShunt';
    const activeStuckSection = s.blindFault === 'stuckSection';

    let occX3JG = false, occIAG = false, occ1DG = false, rawOcc11DG = false, shunt11DG = false, occTrack = false;
    let iag1LJ = stg < 4, iag2LJ = stg < 4, iagSlow = false, iagUnlocked = stg < 4;
    let dg1_1LJ = stg < 4, dg1_2LJ = stg < 4, dg1Slow = false, dg1Unlocked = stg < 4;
    let dg11_1LJ = stg < 4, dg11_2LJ = stg < 4, dg11Slow = false, dg11Unlocked = stg < 4;

    let preLocked = false, approachLocked = false;
    let zqaUnlocked = false, zqaBlockedByApproach = false, zraCounting = false, zraUnlocked = false, sgaUnlocked = false, sgaBlocked = false;

    const layoutDefs = J.layout(rType);
    const sgaSectionId = routeSpec.sgaId || (isShunt ? '1DG' : '11DG');
    const sgaTarget = routeSpec.sgaLabel || (isShunt ? '1DG' : '7-11DG');

    // 每个区段的细粒度状态对象，供全站 3D 光带（12 区段）直接消费
    const secStates = {};
    for (const id of ALL_YARD_SECTIONS) {
      secStates[id] = { occ: false, unlocked: true, slow: false, inRoute: false };
    }

    const occByA = new Set();
    if (isClassic4 && isDep) {
      occTrack = stg >= 4 && f <= 16;
      rawOcc11DG = stg >= 5 && f >= 0 && r <= 28;
      shunt11DG = rawOcc11DG && !(activePoorShunt && f >= 10 && f < 26);
      occ1DG = stg >= 5 && f >= 28 && r <= 62;
      occIAG = stg >= 5 && f >= 62 && r <= 92;
      occX3JG = stg >= 5 && f >= 92;
      if (occTrack) occByA.add('IG');
      if (rawOcc11DG) occByA.add('11DG');
      if (occ1DG) occByA.add('1DG');
      if (occIAG) occByA.add('IAG');
      if (occX3JG) occByA.add('X3JG');
      if ((rawOcc11DG && f >= 20) || (occ1DG && r <= 36)) occByA.add('1/7G');
      approachLocked = stg >= 4 && occTrack && f < 0;
      preLocked = stg >= 4 && !approachLocked && f < 0;
    } else if (isClassic4 && isShunt) {
      occIAG = stg >= 4 && f <= 16;
      occ1DG = stg >= 5 && f >= 0 && r <= 55;
      rawOcc11DG = stg >= 5 && f >= 55 && r <= 92;
      shunt11DG = rawOcc11DG;
      if (occIAG) occByA.add('IAG');
      if (occ1DG) occByA.add('1DG');
      if (rawOcc11DG) occByA.add('11DG');
      approachLocked = stg >= 4 && occIAG && f < 0;
      preLocked = stg >= 4 && !approachLocked && f < 0;
    } else if (isClassic4) {
      occX3JG = stg >= 5 && f >= -15 && r <= 0;
      occIAG = stg >= 5 && f >= 0 && r <= 25;
      occ1DG = stg >= 5 && f >= 25 && r <= 55;
      rawOcc11DG = stg >= 5 && f >= 55 && r <= 85;
      shunt11DG = rawOcc11DG && !(activePoorShunt && f >= 62 && f < 83);
      occTrack = stg >= 5 && f >= 85 && r <= 130;
      if (occX3JG) occByA.add('X3JG');
      if (occIAG) occByA.add('IAG');
      if (occ1DG) occByA.add('1DG');
      if ((occ1DG && f > 42) || (rawOcc11DG && f < 66)) occByA.add('1/7G');
      if (rawOcc11DG) occByA.add('11DG');
      if (occTrack) occByA.add(route3G ? '3G' : 'IG');

      preLocked = stg >= 4 && !occX3JG && f < 0;
      approachLocked = stg >= 4 && occX3JG && f < 0;
    } else {
      // 通用表 3.2.2 其余 29 条进路按 layoutDefs 边界精确求值
      const appOcc = stg >= (isDep || isShunt ? 4 : 5) && J.occupied(layoutDefs[0], f);
      if (appOcc) occByA.add(layoutDefs[0].id);
      secStates[layoutDefs[0].id].occ = appOcc;
      for (let i = 1; i < layoutDefs.length; i++) {
        const d = layoutDefs[i];
        if (stg >= 5 && J.occupied(d, f)) occByA.add(d.id);
      }
      if (routeSpec.sectionsText.includes('1/7G') && ((occByA.has('11DG') && f >= 16) || (occByA.has('1DG') && r <= 42))) {
        occByA.add('1/7G');
      }
      approachLocked = stg >= 4 && appOcc && f < 0;
      preLocked = stg >= 4 && !approachLocked && f < 0;
      occX3JG = layoutDefs[0].id === 'X3JG' ? appOcc : false;
      occTrack = (isDep && appOcc) || (routeSpec.kind === 'receive' && J.occupied(layoutDefs[layoutDefs.length - 1], f) && stg >= 5);
    }

    if (history && history.approached && f < 0 && stg >= 4) { approachLocked = true; preLocked = false; }

    // 预求一号车 A 的自动解锁基线（不含手工解锁，供双车占用与抵触排队优先判定，消除循环依赖）
    const aBaseUnlockedMap = {};
    for (const d of layoutDefs.slice(1, -1)) {
      if (stg < 4) aBaseUnlockedMap[d.id] = true;
      else if (history && history.sections[d.id]) aBaseUnlockedMap[d.id] = !s.guideRouteLocked && !!history.sections[d.id].released;
      else if (s.guideRouteLocked) aBaseUnlockedMap[d.id] = false;
      else if (isClassic4 && isDep) aBaseUnlockedMap[d.id] = stg === 5 && r > d.end + 6;
      else if (isClassic4 && isShunt) aBaseUnlockedMap[d.id] = stg === 5 && r > d.end + 6;
      else if (isClassic4) aBaseUnlockedMap[d.id] = stg === 5 && r > d.end + 6 && !(activeStuckSection && d.id === sgaSectionId);
      else aBaseUnlockedMap[d.id] = stg === 5 && r > d.end + 6 && !(activeStuckSection && d.id === sgaSectionId);
    }
    const aBaseLockedSet = new Set();
    if (stg >= 4) {
      for (const d of layoutDefs.slice(1)) {
        const isUnl = d.controlled ? !!aBaseUnlockedMap[d.id] : (routeSpec.kind !== 'receive');
        if (!isUnl || occByA.has(d.id)) aBaseLockedSet.add(d.id);
      }
    }

    // 先确定二号车 B 的实际物理占用（即使 B 进路被联锁拒绝，其停放/占用的区段仍必须参与 A 信号与解锁判定！）
    const mtMode = s.multiTrainMode || 'none';
    const mtSpec = MULTI_TRAIN_SCENARIOS[mtMode] || MULTI_TRAIN_SCENARIOS.none;
    const depFromOccupiedIG = mtMode === 'track_occupied' && routeSpec.approach === 'IG';
    const occByB = new Set();
    let routeSpecB = null, layoutDefsB = null;
    const rawTrainB = mtMode === 'track_occupied' ? (s.secondTrain ?? 126) : (s.secondTrain ?? -26);
    let effTrainB = rawTrainB;
    let maxFollowB = 130;
    let bQueueBlockedByA = false;
    let bRouteConflictsA = false;

    if (mtMode === 'track_occupied') {
      if (!depFromOccupiedIG) occByB.add('IG');
    } else if (mtMode !== 'none') {
      routeSpecB = J.resolveRoute(s.secondRoute || 'R14');
      layoutDefsB = J.layout(routeSpecB.code);
      maxFollowB = routeSpecB.kind === 'shunt' ? 105 : 130;

      // 判定 B 与 A 是否存在道岔/区段/信号/股道敌对关系
      const swLockedByABase = {
        s1_3: aBaseLockedSet.has('1DG') || aBaseLockedSet.has('3DG'),
        s5_7: aBaseLockedSet.has('11DG') || aBaseLockedSet.has('5-9DG'),
        s9: aBaseLockedSet.has('5-9DG'),
        s11: aBaseLockedSet.has('11DG')
      };
      let baseSwConflict = false, baseSecConflict = false, staticSwConflict = false, staticSecConflict = false;
      for (const swKey of ['s1_3', 's5_7', 's9', 's11']) {
        const reqA = routeSpec.switches[swKey];
        const reqB = routeSpecB.switches[swKey];
        if (reqA && reqB && reqA !== reqB) {
          staticSwConflict = true;
          if (swLockedByABase[swKey]) baseSwConflict = true;
        }
      }
      const aCtrlSet = new Set(layoutDefs.filter(d => d.controlled).map(d => d.id));
      for (const dB of layoutDefsB.slice(1)) {
        if (dB.controlled && aCtrlSet.has(dB.id)) staticSecConflict = true;
        if (aBaseLockedSet.has(dB.id)) {
          if (routeSpecB.kind === 'shunt' && dB.id === routeSpecB.terminal && ['IG', 'IIG', '3G', '4G'].includes(dB.id)) continue;
          baseSecConflict = true;
        }
      }
      const opposingTrackConflict = routeSpec.kind === 'receive' && (routeSpecB.terminal === routeSpec.terminal || routeSpecB.approach === routeSpec.terminal);
      bRouteConflictsA = staticSwConflict || staticSecConflict || (routeSpecB.sig === routeSpec.sig) || opposingTrackConflict;
      const baseSameSig = routeSpecB.sig === routeSpec.sig && aBaseLockedSet.size > 0;
      bQueueBlockedByA = stg >= 4 && (baseSwConflict || baseSecConflict || baseSameSig);

      // ④ 抵触排队：B 未获许可时保持在始端信号机前候车(-12)；许可后若与 A 同在终端 IG，按 4.95 模型间距平滑跟进，确保 3D/读数/占用完全统一
      if (mtMode === 'conflict_queue') {
        if (bQueueBlockedByA) {
          effTrainB = Math.min(rawTrainB, -12);
        } else {
          if (routeSpec.terminal === 'IG' && routeSpecB.terminal === 'IG' && f >= 85) {
            const xA_ig = 4.2 + Math.min(1, Math.max(0, (f - 85) / 40)) * 9.6;
            const maxXB = xA_ig - 4.95;
            if (maxXB >= 4.2) {
              maxFollowB = Number(Math.min(105, 68 + ((maxXB - 4.2) / 7.2) * 37).toFixed(2));
            } else {
              maxFollowB = Number(Math.max(34, 68 - ((4.2 - maxXB) / 5.6) * 34).toFixed(2));
            }
          }
          effTrainB = Math.min(rawTrainB, maxFollowB);
        }
      }

      // 按二号车实际走行位置 effTrainB 计算其全部物理占用区段（包括始端接近/出发股道、受控区段及终端股道）
      const appDefB = layoutDefsB[0];
      if (stg >= 4 && J.occupied(appDefB, effTrainB)) {
        occByB.add(appDefB.id);
      }
      for (let i = 1; i < layoutDefsB.length; i++) {
        const dB = layoutDefsB[i];
        if (stg >= 5 && J.occupied(dB, effTrainB)) {
          occByB.add(dB.id);
        }
      }
      if (routeSpecB.sectionsText.includes('1/7G') && stg >= 5 && ((occByB.has('11DG') && effTrainB >= 16) || (occByB.has('1DG') && effTrainB - 16 <= 42))) {
        occByB.add('1/7G');
      }
    }

    // 检查一号车 A 进路空闲：严格区分接车(含终端股道)、发车(不含出发股道)、调车(允许终端股道连挂占车)，同时纳入 A 与 B 占用！
    const firstCtrl = layoutDefs.find(d => d.controlled);
    const firstSecFaultActive = !!(s.guideFirstSecFault && routeSpec.kind === 'receive' && stg >= 4 && firstCtrl);
    const checkedRouteIds = layoutDefs.filter(d => d.controlled).map(d => d.id);
    if (routeSpec.sectionsText.includes('1/7G') && !checkedRouteIds.includes('1/7G')) checkedRouteIds.push('1/7G');
    if (routeSpec.kind === 'receive' && routeSpec.terminal && !checkedRouteIds.includes(routeSpec.terminal)) {
      checkedRouteIds.push(routeSpec.terminal);
    }
    const routeClearOfA = checkedRouteIds.every(id => !occByA.has(id));
    const routeClearOfB = checkedRouteIds.every(id => !occByB.has(id));
    const routeClear = routeClearOfA && routeClearOfB && !firstSecFaultActive;
    const trackOccupiedByB = routeSpec.kind === 'receive' && occByB.has(routeSpec.terminal);

    // 教材 PDF p.49 / 书 p.39 引导信号开放 4 项技术条件 & 敌对进路判定
    const swConverting = stg === 2 && hasReverseSwitch;
    const swReverse = stg >= 2 && hasReverseSwitch;
    const DBJ = !activeSwitchFault && !swConverting && !swReverse;
    const FBJ = !activeSwitchFault && !swConverting && swReverse;
    const swOK = hasReverseSwitch ? FBJ : DBJ;
    const DJ = !activeLampFault;
    const bAlreadyEstablishedHostile = !!(mtMode !== 'none' && mtMode !== 'track_occupied' && bRouteConflictsA && !bQueueBlockedByA && stg >= 4 && effTrainB < 88);
    const hostileRouteActive = !!(s.hostileRoute || bAlreadyEstablishedHostile);

    const guideEligible = routeSpec.kind === 'receive' && stg >= 4;
    const guideRedLampOK = DJ; // 条件④：主体信号机红灯显示（DJ↓ 灭灯严禁开放 HB）
    const guideNoHostileOK = !hostileRouteActive; // 条件②：未建立敌对进路
    const guideManualConfirmed = !!s.guideManualConfirm;
    const guideTotalLockOn = !!(s.guideTotalLock && guideEligible);
    const guideSwitchAndLockOK = activeSwitchFault
      ? (guideManualConfirmed && guideTotalLockOn) // 道岔失表示须人工确认 + 咽喉引导总锁闭
      : (stg >= 4 && (swOK || guideTotalLockOn)); // 正常锁闭或引导总锁闭
    const guideBlockReasons = [];
    if (!guideEligible) guideBlockReasons.push('仅接车进路（阶段 4/5）可办理引导接车');
    if (!guideRedLampOK) guideBlockReasons.push('主体信号机红灯不可用（DJ↓ 灭灯），严禁开放引导信号 HB（PDF p.49 条件④）');
    if (!guideNoHostileOK) guideBlockReasons.push('存在已建立的敌对进路，严禁开放引导信号 HB（PDF p.49 条件②）');
    if (!guideSwitchAndLockOK) guideBlockReasons.push('道岔失表示：必须先人工确认道岔位置正确并办理咽喉引导总锁闭 (YZA)，方可开放 HB（PDF p.49 条件①③）');
    const guideConditionsMet = guideEligible && guideRedLampOK && guideNoHostileOK && guideSwitchAndLockOK;
    const guideSignalCanOpen = !!(s.guideMode && guideConditionsMet);
    // PDF p.49 (4)：一旦按引导进路建立/开放引导，引导进路锁闭记忆即锁存；途中灯丝双断(DJ↓)、道岔失表示、敌对或人工关信号仅关闭 YXJ/HB，进路严禁自动逐段解锁，必须待办理 ZRA 一次性解锁！
    const guideLocked = !!(guideEligible && (guideSignalCanOpen || s.guideRouteLocked));

    const routeIntact = stg >= 4 && !activeSwitchFault;
    const guideThroatClear = layoutDefs.filter(d => d.controlled).every(d => (stg < 5 || !J.occupied(d, f)) && !occByB.has(d.id));
    const guideClear = guideLocked && guideThroatClear && (f < 0 || f >= 88);
    const cancelSafe = guideLocked ? guideClear : (routeClear && routeIntact && f < 0);
    const zraEligible = cancelSafe && (approachLocked || guideLocked) && !s.zraInterrupted;
    // §9.5.1 (PDF p.200) & 图9.5.8 (PDF p.209)：接车与正线(IG/IIG)发车 3 min (180 s)，站线/侧线(3G/4G)发车与调车 30 s
    const isSidingDep = isDep && !['IG', 'IIG'].includes(routeSpec.approach);
    const zraSeconds = (isShunt || isSidingDep) ? 30 : 180;
    zqaUnlocked = s.cancelMode === 'zqa' && !guideLocked && preLocked && cancelSafe;
    zqaBlockedByApproach = s.cancelMode === 'zqa' && approachLocked;
    zraCounting = s.cancelMode === 'zra' && zraEligible && s.zraProgress < 1;
    zraUnlocked = s.cancelMode === 'zra' && cancelSafe && !s.zraInterrupted &&
      ((!guideLocked && preLocked) || ((approachLocked || guideLocked) && s.zraProgress >= 1));
    const zraBlocked = s.cancelMode === 'zra' && !zraCounting && !zraUnlocked;

    const targetRecord = history && history.sections[sgaSectionId];
    const targetDef = layoutDefs.find(d => d.id === sgaSectionId);
    const targetStaticOcc = (isClassic4
      ? (isShunt ? occ1DG : rawOcc11DG)
      : (stg >= 5 && !!targetDef && J.occupied(targetDef, f))) || occByB.has(sgaSectionId);
    const sgaQjj = targetRecord
      ? targetRecord.qjj
      : (isClassic4
          ? (stg >= 4 && !(isDep || isShunt ? f >= 0 : f >= 55 && r > 61))
          : (stg >= 4 && !(targetDef && f >= targetDef.start && r > targetDef.end + 6)));
    const sgaClear = !targetStaticOcc;
    sgaUnlocked = s.cancelMode === 'sga' && stg >= 4 && sgaClear && !sgaQjj;
    sgaBlocked = s.cancelMode === 'sga' && !sgaUnlocked;
    const guideActive = !!(guideLocked && !zraUnlocked);
    const guideTotalLockActive = !!(guideTotalLockOn && guideActive);
    const guideHoldElapsed = Math.max(0, Number(s.guideHoldElapsed) || 0);
    const guideHoldRemaining = firstSecFaultActive ? Math.max(0, 15 - guideHoldElapsed) : 0;
    const man = zqaUnlocked || zraUnlocked;

    if (isClassic4 && isDep) {
      dg11_1LJ = stg < 4 || man || sgaUnlocked ? true : (stg === 5 && f >= 0);
      dg11_2LJ = stg < 4 || man || sgaUnlocked ? true : (stg === 5 && dg11_1LJ && f >= 28 && r > 28);
      dg11Slow = !man && !sgaUnlocked && stg === 5 && ((r > 28 && r <= 34) || (activePoorShunt && f >= 10 && f < 26));
      dg11Unlocked = stg < 4 || man || sgaUnlocked || (stg === 5 && r > 34);

      dg1_1LJ = stg < 4 || man ? true : (stg === 5 && dg11Unlocked && f >= 28);
      dg1_2LJ = stg < 4 || man ? true : (stg === 5 && dg1_1LJ && f >= 62 && r > 62);
      dg1Slow = !man && stg === 5 && r > 62 && r <= 68;
      dg1Unlocked = stg < 4 || man || (stg === 5 && r > 68);

      iag1LJ = stg < 4 || man ? true : (stg === 5 && dg1Unlocked && f >= 62);
      iag2LJ = stg < 4 || man ? true : (stg === 5 && iag1LJ && f >= 92 && r > 92);
      iagSlow = !man && stg === 5 && r > 92 && r <= 98;
      iagUnlocked = stg < 4 || man || (stg === 5 && r > 98);
    } else if (isClassic4 && isShunt) {
      dg1_1LJ = stg < 4 || man || sgaUnlocked ? true : (stg === 5 && f >= 0);
      dg1_2LJ = stg < 4 || man || sgaUnlocked ? true : (stg === 5 && dg1_1LJ && f >= 55 && r > 55);
      dg1Slow = !man && !sgaUnlocked && stg === 5 && r > 55 && r <= 61;
      dg1Unlocked = stg < 4 || man || sgaUnlocked || (stg === 5 && r > 61);

      iag1LJ = true; iag2LJ = true; iagUnlocked = true;
      dg11_1LJ = stg < 4 || man || (stg === 5 && dg1Unlocked && f >= 55);
      dg11_2LJ = stg < 4 || man || (stg === 5 && dg11_1LJ && r > 92);
      dg11Slow = !man && stg === 5 && r > 92 && r <= 98;
      dg11Unlocked = stg < 4 || man || (stg === 5 && r > 98);
    } else if (isClassic4) {
      iag1LJ = stg < 4 || man ? true : (stg === 5 && f >= 0);
      iag2LJ = stg < 4 || man ? true : (stg === 5 && f >= 25 && r > 25);
      iagSlow = !man && stg === 5 && r > 25 && r <= 31;
      iagUnlocked = stg < 4 || man || (stg === 5 && r > 31);

      dg1_1LJ = stg < 4 || man ? true : (stg === 5 && iagUnlocked && f >= 25);
      dg1_2LJ = stg < 4 || man ? true : (stg === 5 && dg1_1LJ && f >= 55 && r > 55);
      dg1Slow = !man && stg === 5 && r > 55 && r <= 61;
      dg1Unlocked = stg < 4 || man || (stg === 5 && r > 61);

      dg11_1LJ = stg < 4 || man || sgaUnlocked ? true : (stg === 5 && dg1Unlocked && f >= 55);
      dg11_2LJ = stg < 4 || man || sgaUnlocked ? true : (!activeStuckSection && stg === 5 && dg11_1LJ && f >= 85 && r > 85);
      dg11Slow = !man && !sgaUnlocked && !activeStuckSection && stg === 5 && ((r > 85 && r <= 91) || (activePoorShunt && f >= 62 && f < 83));
      dg11Unlocked = stg < 4 || man || sgaUnlocked || (!activeStuckSection && stg === 5 && r > 91);
    }

    if (isClassic4 && history && stg >= 4) {
      const records = history.sections;
      const ia = records.IAG, d1 = records['1DG'], d11 = records['11DG'];
      iag1LJ = isShunt || ia.first || man;
      iag2LJ = isShunt || ia.second || man;
      iagSlow = !isShunt && ia.remaining > 0 && !man;
      iagUnlocked = isShunt || ia.released || man;
      dg1_1LJ = d1.first || man || (isShunt && sgaUnlocked);
      dg1_2LJ = d1.second || man || (isShunt && sgaUnlocked);
      dg1Slow = d1.remaining > 0 && !man && !(isShunt && sgaUnlocked);
      dg1Unlocked = d1.released || man || (isShunt && sgaUnlocked);
      dg11_1LJ = d11.first || man || (!isShunt && sgaUnlocked);
      dg11_2LJ = d11.second || man || (!isShunt && sgaUnlocked);
      dg11Slow = d11.remaining > 0 && !man && !sgaUnlocked;
      dg11Unlocked = d11.released || man || (!isShunt && sgaUnlocked);
    } else if (!isClassic4) {
      // 通用 29 条进路各区段实时状态求解（统一记录 l1/l2/qjj/slow/unlocked）
      let prevUnlocked = true;
      for (let i = 1; i < layoutDefs.length - 1; i++) {
        const d = layoutDefs[i];
        const isFaultTgt = d.id === sgaSectionId;
        const rawOcc = stg >= 5 && J.occupied(d, f);
        const poor = activePoorShunt && isFaultTgt && f >= d.start + 4 && f < d.end - 2;
        const rec = history && stg >= 4 && history.sections[d.id];
        let l1, l2, qjjVal, slow, unlocked;
        if (rec) {
          l1 = guideActive ? false : (rec.first || man || (isFaultTgt && sgaUnlocked));
          l2 = guideActive ? false : (rec.second || man || (isFaultTgt && sgaUnlocked));
          qjjVal = guideActive ? false : rec.qjj;
          slow = guideActive ? false : (rec.remaining > 0 && !man && !(isFaultTgt && sgaUnlocked));
          unlocked = guideActive ? false : (rec.released || man || (isFaultTgt && sgaUnlocked));
        } else {
          l1 = stg < 4 || man || (isFaultTgt && sgaUnlocked) ? true : (!guideActive && stg === 5 && prevUnlocked && f >= d.start);
          l2 = stg < 4 || man || (isFaultTgt && sgaUnlocked) ? true : (!guideActive && !(activeStuckSection && isFaultTgt) && stg === 5 && l1 && f >= d.end && r > d.end);
          qjjVal = !guideActive && stg >= 4 && !man && !(isFaultTgt && sgaUnlocked) && (f < d.start || (!l1 && !l2));
          slow = !guideActive && !man && !(isFaultTgt && sgaUnlocked) && !(activeStuckSection && isFaultTgt) && stg === 5 && ((r > d.end && r <= d.end + 6) || poor);
          unlocked = stg < 4 || man || (isFaultTgt && sgaUnlocked) || (!guideActive && !(activeStuckSection && isFaultTgt) && stg === 5 && r > d.end + 6);
        }
        secStates[d.id] = { occ: rawOcc, l1, l2, qjj: qjjVal, unlocked, slow, inRoute: true };
        prevUnlocked = unlocked;
      }
      const termDef = layoutDefs[layoutDefs.length - 1];
      const termOcc = stg >= 5 && J.occupied(termDef, f);
      if (secStates[termDef.id]) {
        secStates[termDef.id].occ = termOcc;
        secStates[termDef.id].inRoute = routeSpec.kind === 'receive';
        secStates[termDef.id].unlocked = routeSpec.kind !== 'receive' || stg < 4 || zraUnlocked || (!guideActive && zqaUnlocked);
      }
    }

    if (guideActive && isClassic4 && !zraUnlocked) {
      iag1LJ = iag2LJ = dg1_1LJ = dg1_2LJ = dg11_1LJ = dg11_2LJ = false;
      iagSlow = dg1Slow = dg11Slow = false;
      iagUnlocked = dg1Unlocked = dg11Unlocked = false;
    }

    if (isClassic4) {
      const hSec = history && stg >= 4 ? history.sections : null;
      const iagQjj = !guideActive && stg >= 4 && !iagUnlocked && (hSec && hSec.IAG ? hSec.IAG.qjj : (!occIAG && (isDep ? f < 62 : f < 0)));
      const dg1Qjj = !guideActive && stg >= 4 && !dg1Unlocked && (hSec && hSec['1DG'] ? hSec['1DG'].qjj : (!occ1DG && (isDep ? f < 28 : isShunt ? f < 0 : f < 25)));
      const dg11Qjj = !guideActive && stg >= 4 && !dg11Unlocked && (hSec && hSec['11DG'] ? hSec['11DG'].qjj : (!rawOcc11DG && (isDep ? f < 0 : f < 55)));
      secStates.X3JG = { occ: occX3JG, unlocked: true, slow: false, inRoute: false };
      secStates.IAG = { occ: occIAG, l1: iag1LJ, l2: iag2LJ, qjj: iagQjj, unlocked: iagUnlocked, slow: iagSlow, inRoute: !isShunt };
      secStates['1DG'] = { occ: occ1DG, l1: dg1_1LJ, l2: dg1_2LJ, qjj: dg1Qjj, unlocked: dg1Unlocked, slow: dg1Slow, inRoute: true };
      secStates['11DG'] = { occ: rawOcc11DG, l1: dg11_1LJ, l2: dg11_2LJ, qjj: dg11Qjj, unlocked: dg11Unlocked, slow: dg11Slow, inRoute: !isShunt };
      secStates['1/7G'] = {
        occ: isDep ? ((rawOcc11DG && f >= 20) || (occ1DG && r <= 36)) : ((occ1DG && f > 42) || (rawOcc11DG && f < 66)),
        unlocked: isShunt ? true : (dg1Unlocked && dg11Unlocked),
        slow: !isShunt && (isDep ? (dg11Slow || dg1Slow) : dg1Slow),
        inRoute: !isShunt
      };
      const trkKey = route3G ? '3G' : 'IG';
      secStates[trkKey] = {
        occ: occTrack,
        unlocked: isDep || isShunt || stg < 4 || zraUnlocked || (!guideActive && zqaUnlocked),
        slow: false,
        inRoute: !isDep && !isShunt
      };
    } else {
      // 通用进路涉及 1DG 与 11DG 的同时，若有 1/7G 经过（R7, R28 等），同步标注 1/7G 光带
      if (routeSpec.sectionsText.includes('1/7G')) {
        secStates['1/7G'] = {
          occ: (secStates['11DG'].occ && f >= 16) || (secStates['1DG'].occ && r <= 42),
          unlocked: secStates['11DG'].unlocked && secStates['1DG'].unlocked,
          slow: secStates['11DG'].slow || secStates['1DG'].slow,
          inRoute: true
        };
      }
    }

    // 应用咽喉引导总锁闭（PDF p.49：锁闭该咽喉全部道岔）及内方首区段故障指示
    if (guideTotalLockActive) {
      for (const id of ['IAG', '1DG', '1/7G', '3DG', '5-9DG', '11DG']) {
        if (secStates[id]) secStates[id].unlocked = false;
      }
      iagUnlocked = dg1Unlocked = dg11Unlocked = false;
    }
    if (firstSecFaultActive && firstCtrl && secStates[firstCtrl.id]) {
      secStates[firstCtrl.id].occ = true;
    }
    // 合并二号车 B 物理占用到全站光带（即便 B 进路被联锁拒绝，其占用区段仍保留！）
    for (const id of occByB) {
      if (secStates[id]) secStates[id].occ = true;
    }
    if (mtMode === 'track_occupied' && !depFromOccupiedIG) {
      secStates.IG.occ = true;
      secStates.IG.unlocked = false;
      occTrack = occTrack || routeSpec.terminal === 'IG';
    } else if (routeSpec.kind === 'receive' && occByB.has(routeSpec.terminal)) {
      occTrack = true;
    }

    const lastCtrl = [...layoutDefs].reverse().find(d => d.controlled);
    const targetSecSt = secStates[sgaSectionId] || { occ: targetStaticOcc, l1: false, l2: false, qjj: false, unlocked: true, slow: false };
    const firstSecSt = firstCtrl ? secStates[firstCtrl.id] : targetSecSt;

    // 构建整条进路所有可控区段（IAG → 1DG → 7-11DG 等）的实时三点检查状态链，并定位当前列车所在/正在缓放的活跃区段 activeSec
    const ctrlDefs = layoutDefs.filter(d => d.controlled);
    const controlledChain = ctrlDefs.map(d => {
      const stItem = secStates[d.id] || { occ: false, l1: false, l2: false, qjj: false, unlocked: true, slow: false };
      return {
        id: d.id,
        label: d.id === '11DG' ? '7-11DG' : d.id,
        occ: !!stItem.occ,
        qjj: !!stItem.qjj,
        l1: !!stItem.l1,
        l2: !!stItem.l2,
        slow: !!stItem.slow,
        unlocked: !!stItem.unlocked
      };
    });
    let chosenActive = controlledChain.find(c => c.id === sgaSectionId) || controlledChain[controlledChain.length - 1];
    if (s.cancelMode !== 'sga' && s.blindFault === 'none' && stg === 5 && f >= 0 && controlledChain.length > 0) {
      const occOrSlow = [...controlledChain].reverse().find(c => c.occ || c.slow);
      const nextLocked = controlledChain.find(c => !c.unlocked);
      chosenActive = occOrSlow || nextLocked || controlledChain[controlledChain.length - 1];
    }

    const manualUnlocked = zqaUnlocked || zraUnlocked;

    const switchesState = {};
    for (const swKey of ['s1_3', 's5_7', 's9', 's11']) {
      const req = routeSpec.switches[swKey];
      if (!req) switchesState[swKey] = 'N';
      else if (stg < 2) switchesState[swKey] = 'N';
      else if (stg === 2 && req === 'R') switchesState[swKey] = 'MOV';
      else switchesState[swKey] = req;
    }

    // 股道已占车且未办引导接车(HB)时，若车列强行越过关闭的红灯 X/XF(f >= 0)，属违章冒进信号：严禁咽喉自动解锁，强制保持锁闭直至 ZRA！
    // 注意：若为抵触排队(conflict_queue)中一号车 A 合法先入空股道解锁咽喉后，二号车 B 随后调车连挂入股道，不属 A 冒进！
    const aAlreadyClearedThroat = layoutDefs.filter(d => d.controlled).every(d => !!aBaseUnlockedMap[d.id]);
    const spadViolation = !!(trackOccupiedByB && !guideActive && stg >= 5 && f >= 0 && !zraUnlocked && (mtMode === 'track_occupied' || !aAlreadyClearedThroat));
    if (spadViolation) {
      iag1LJ = iag2LJ = dg1_1LJ = dg1_2LJ = dg11_1LJ = dg11_2LJ = false;
      iagSlow = dg1Slow = dg11Slow = false;
      iagUnlocked = dg1Unlocked = dg11Unlocked = false;
      for (const d of ctrlDefs) {
        if (secStates[d.id]) {
          secStates[d.id].l1 = false; secStates[d.id].l2 = false;
          secStates[d.id].slow = false; secStates[d.id].unlocked = false;
        }
      }
      if (secStates['1/7G'] && secStates['1/7G'].inRoute) {
        secStates['1/7G'].unlocked = false; secStates['1/7G'].slow = false;
      }
      for (const c of controlledChain) { c.l1 = false; c.l2 = false; c.slow = false; c.unlocked = false; }
    }

    const LAJ = stg === 1 || stg === 2;
    const LJJ = (stg === 1 || stg === 2) && !isDep && !isShunt;
    const LFJ = (stg === 1 || stg === 2) && isDep;
    const DFJ = (stg === 1 || stg === 2) && isShunt;
    const DCJ = (stg === 2 || stg === 3) && !hasReverseSwitch;
    const FCJ = (stg === 2 || stg === 3) && hasReverseSwitch;
    const DQJ1 = swConverting;
    const DQJ2 = swReverse;
    const FKJ = stg === 3 || stg === 4;
    const ZJ = isShunt && stg >= 2 && !(isClassic4 ? (isShunt ? dg1Unlocked : dg11Unlocked) : firstSecSt.unlocked);
    const KJ = stg >= 3 && (stg === 3 ? swOK : !firstSecSt.unlocked) && !manualUnlocked;
    const XJJ = !guideActive && !trackOccupiedByB && routeClear && !hostileRouteActive && (stg === 4 || (stg === 5 && f < 0 && s.cancelMode === 'none' && !s.signalFaultLocked)) && swOK;
    const QJJ = !guideActive && stg >= 4 && (targetRecord ? targetRecord.qjj : (isClassic4 ? !(isShunt ? dg1_1LJ : dg11_1LJ) : !!targetSecSt.qjj)) && !manualUnlocked;
    const SJ = !guideActive && !guideTotalLockActive && (isClassic4 ? (isShunt ? dg1Unlocked && !secStates['1DG'].occ : dg11Unlocked && !secStates['11DG'].occ) : (targetSecSt.unlocked && !targetSecSt.occ));
    const JYJ = !approachLocked && !occX3JG && !secStates[layoutDefs[0].id].occ;
    const ZXJ = routeSpec.aspect === 'U' || routeSpec.aspect.startsWith('L');
    const ZQJ = s.cancelMode === 'zqa';
    const ZRJ = s.cancelMode === 'zra' || s.cancelMode === 'sga';
    const allCtrlUnlocked = layoutDefs.filter(d => d.controlled).every(d => secStates[d.id] && secStates[d.id].unlocked);
    const GJJ = routeSpec.kind !== 'shunt' && stg >= 4 && (!allCtrlUnlocked || guideActive) && !manualUnlocked;
    const ZCJ = !GJJ; // 第8.3节图8.3.2：常态↑，末端道岔锁闭后 GJJ↑·SJ↓ 使 ZCJ↓ 防止迎面敌对

    const routeLocked = !history || layoutDefs.filter(d => d.controlled).every(d => !history.sections[d.id].released);
    // §9.4.2 (PDF p.191 / 书 p.181)：调车信号以整列越过始端信号机(r > 0)为正常关灯条件，与内方区段出清/三点解锁区分
    const shuntKeepOpen = isShunt && stg === 5 && r <= 0 && routeClearOfB && (f >= 0 || routeClearOfA) && !hostileRouteActive && swOK && DJ && s.cancelMode === 'none' && !s.signalFaultLocked;
    const trainKeepOpen = !isShunt && !guideActive && !trackOccupiedByB && routeClear && !hostileRouteActive && stg === 5 && f < 0 && swOK && DJ && s.cancelMode === 'none' && !s.signalFaultLocked;
    const LXJ = routeLocked && (trainKeepOpen || shuntKeepOpen);
    // PDF p.49 (3)：正常首区段在第一轮对压入(f >= 0)关闭；首区段故障时须 15 s 内维持开放，否则关闭；条件破坏时立即关闭 YXJ（同时保留 guideRouteLocked 锁闭记忆）
    const YXJ = guideSignalCanOpen && !zraUnlocked && stg === 5 && s.cancelMode === 'none' && (firstSecFaultActive ? (guideHoldElapsed < 15 && f < 88) : (f < 0));
    const DJ2 = LXJ && routeSpec.aspect === 'UU';
    const openAsp = routeSpec.aspect === 'L/LU/U' ? 'L' : routeSpec.aspect;
    const closedAsp = routeSpec.sig.startsWith('D') ? 'A' : 'H';
    const signalAspect = isShunt ? (LXJ ? 'B' : closedAsp) : (YXJ ? 'HB' : (LXJ ? openAsp : closedAsp));

    // 计算图 3.1.1 下行咽喉全部 10 架信号机实时显示状态
    const signals = {};
    for (const sigKey of ALL_THROAT_SIGNALS) {
      signals[sigKey] = sigKey.startsWith('D') ? 'A' : 'H';
    }
    if (LXJ || YXJ) signals[routeSpec.sig] = signalAspect;
    else if (!DJ) signals[routeSpec.sig] = 'DARK';
    if (s.hostileRoute) {
      const hostileSigKey = routeSpec.kind === 'receive'
        ? ({ IG: 'S1', IIG: 'SII', '3G': 'S3', '4G': 'S4' }[routeSpec.terminal] || 'S1')
        : (routeSpec.sig === 'X' ? 'D1' : 'X');
      if (hostileSigKey !== routeSpec.sig) {
        signals[hostileSigKey] = hostileSigKey.startsWith('D') ? 'B' : (hostileSigKey.startsWith('S') ? 'L' : 'U');
      }
    }

    // 处理二号列车 B 的进路锁闭、道岔兼容、信号开放与区段三点检查
    let multiTrain = {
      active: mtMode !== 'none',
      mode: mtMode,
      scenarioName: mtSpec.name,
      scenarioNote: mtSpec.note,
      routeB: s.secondRoute || 'R14',
      trainB: effTrainB,
      rawTrainB,
      maxFollowB,
      sigB: '',
      sigAspectB: 'H',
      lxjB: false,
      bCanLockNow: false,
      bWaitingForA: false,
      conflictReason: '',
      indicatorOnB: false,
      allUnlockedB: true
    };
    if (mtMode === 'track_occupied') {
      multiTrain.routeB = 'R1';
      multiTrain.trainB = s.secondTrain ?? 126;
      multiTrain.rawTrainB = multiTrain.trainB;
      multiTrain.sigB = 'S1';
      multiTrain.sigAspectB = 'H';
      multiTrain.bCanLockNow = true;
      multiTrain.hideDuplicateB = depFromOccupiedIG;
      multiTrain.conflictReason = depFromOccupiedIG
        ? `✓ 教材第3.1.1节：发车/由股道调车进路不含出发股道 IG，原停留在 IG 的车列即为本次 ${routeSpec.sig} 发车车列，开放信号后驶离股道！`
        : spadViolation
          ? '🚨 违章冒进红灯 H！股道 IG 已停有二号车 B 且未办理【引导接车 HB】，严禁越过关闭信号 X，咽喉区段保持锁闭(SJ↓)，请复位或办理总人工解锁 ZRA！'
          : trackOccupiedByB
            ? (guideActive
                ? (YXJ ? '🚨 IG 虽停有二号车 B，已办 YXJ↑ 引导接车 HB（≤20km/h 进站停车）' : '🚨 引导接车车列已低速驶入 IG 停于二号车 B 后方（YXJ↓），引导咽喉区段按第3.3.4节保持锁闭(SJ↓)，请点击【总人工解锁 ZRA】完成解锁！')
                : '❌ 股道 IG 已停有二号车 B（IG_DGJ↓）：列车接车进路严禁开放正常信号 X（保持红灯 H）！可点击【引导接车 HB】或改选调车连挂进路(D₇→IG / D₅→IG)')
            : (isShunt && routeSpec.terminal === 'IG'
                ? (f >= 84 ? '✓ 调车连挂完成：一号车已按月白灯 B 进入占车股道 IG 停于二号车 B 后方，咽喉区段已解锁(SJ↑)！' : '✓ 教材第3.1.1(3)节(PDF p.36)：调车进路终端为股道 IG 时，即使 IG 停有二号车 B，调车信号机照常开放月白灯 B 进入股道连挂！')
                : '二号车 B 停留在 IG 股道，与当前进路互不冲突');
    } else if (mtMode !== 'none') {
      const fB = effTrainB, rB = fB - 16;
      const lockedByA = new Set();
      if (guideTotalLockActive) {
        for (const id of ['IAG', '1DG', '1/7G', '3DG', '5-9DG', '11DG']) lockedByA.add(id);
      } else {
        for (const d of layoutDefs.slice(1)) {
          const stItem = secStates[d.id];
          const aStillHolds = stg >= 4 && !manualUnlocked && stItem && (!stItem.unlocked || occByA.has(d.id));
          if (aStillHolds) lockedByA.add(d.id);
        }
      }
      const swLockedByA = {
        s1_3: lockedByA.has('1DG') || lockedByA.has('3DG'),
        s5_7: lockedByA.has('11DG') || lockedByA.has('5-9DG'),
        s9: lockedByA.has('5-9DG'),
        s11: lockedByA.has('11DG')
      };
      const swConflicts = [];
      for (const swKey of ['s1_3', 's5_7', 's9', 's11']) {
        const reqA = routeSpec.switches[swKey];
        const reqB = routeSpecB.switches[swKey];
        if (reqA && reqB && reqA !== reqB && swLockedByA[swKey]) {
          swConflicts.push(swKey.replace('s', '').replace('_', '/'));
        }
      }
      const secConflicts = [];
      for (const dB of layoutDefsB.slice(1)) {
        if (lockedByA.has(dB.id)) {
          if (routeSpecB.kind === 'shunt' && dB.id === routeSpecB.terminal && ['IG', 'IIG', '3G', '4G'].includes(dB.id)) continue;
          secConflicts.push(dB.id === '11DG' ? '7-11DG' : dB.id);
        }
      }
      const sameSig = routeSpecB.sig === routeSpec.sig && lockedByA.size > 0;
      const hasConflict = swConflicts.length > 0 || secConflicts.length > 0 || sameSig || guideTotalLockActive;
      const bCanLockNow = stg >= 4 && !hasConflict;
      const closedAspB = routeSpecB.sig.startsWith('D') ? 'A' : 'H';
      const openAspB = routeSpecB.aspect === 'L/LU/U' ? 'L' : routeSpecB.aspect;
      let lxjB = false, allUnlockedB = true;

      const historyB = s.secondHistory && s.secondHistory.route === routeSpecB.code ? s.secondHistory : null;
      if (bCanLockNow) {
        for (const swKey of ['s1_3', 's5_7', 's9', 's11']) {
          const reqB = routeSpecB.switches[swKey];
          if (reqB && !swLockedByA[swKey]) switchesState[swKey] = reqB;
        }
        let prevUnlB = true;
        for (let i = 1; i < layoutDefsB.length - 1; i++) {
          const d = layoutDefsB[i];
          const occB = stg === 5 && J.occupied(d, fB);
          const recB = historyB && stg >= 4 ? historyB.sections[d.id] : null;
          let l1B, l2B, qjjB, slowB, unlB;
          if (recB) {
            // 与一号车统一使用 RailwayJourney 时间驱动三点检查 + 3s FDGJ 缓放（PDF p.192 / 书 p.182），严禁按走行距离伪造缓放
            l1B = !!recB.first;
            l2B = !!recB.second;
            qjjB = !!recB.qjj;
            slowB = recB.remaining > 0;
            unlB = !!recB.released;
          } else {
            l1B = stg === 5 && prevUnlB && fB >= d.start;
            l2B = stg === 5 && l1B && fB >= d.end && rB > d.end;
            qjjB = stg >= 4 && !l1B && !l2B && !(stg === 5 && rB > d.end);
            slowB = false;
            unlB = stg === 5 && rB > d.end;
          }
          const prevSec = secStates[d.id] || { occ: false, unlocked: true, slow: false, inRoute: false };
          const aStillUsing = prevSec.inRoute && !prevSec.unlocked;
          secStates[d.id] = {
            occ: prevSec.occ || occB,
            l1: aStillUsing ? prevSec.l1 : l1B,
            l2: aStillUsing ? prevSec.l2 : l2B,
            qjj: aStillUsing ? prevSec.qjj : qjjB,
            unlocked: (prevSec.inRoute ? prevSec.unlocked : true) && unlB,
            slow: prevSec.slow || slowB,
            inRoute: true
          };
          if (!unlB) allUnlockedB = false;
          prevUnlB = unlB;
        }
        const termB = layoutDefsB[layoutDefsB.length - 1];
        if (secStates[termB.id]) {
          secStates[termB.id].occ = secStates[termB.id].occ || (stg === 5 && J.occupied(termB, fB));
          if (routeSpecB.kind === 'receive') secStates[termB.id].inRoute = true;
        }
        // §9.4.2 (PDF p.191)：B 车调车信号亦在整列越过始端信号机(rB > 0)后关闭
        lxjB = stg === 5 && (routeSpecB.kind === 'shunt' ? rB <= 0 : fB < 0) && DJ && !activeSwitchFault && !guideTotalLockActive;
      } else {
        allUnlockedB = false;
      }

      const sigAspectB = routeSpecB.kind === 'shunt' ? (lxjB ? 'B' : closedAspB) : (lxjB ? openAspB : closedAspB);
      if (routeSpecB.sig !== routeSpec.sig || !LXJ) {
        signals[routeSpecB.sig] = sigAspectB;
      }
      const bothFinished = allCtrlUnlocked && allUnlockedB && !LXJ && !lxjB && f >= 85 && fB >= 68;
      let reasonTxt;
      if (!bCanLockNow) {
        reasonTxt = `🔒 二号车 [${routeSpecB.title}] 被联锁闭锁等待：${swConflicts.length ? '道岔 ' + swConflicts.join('、') + ' 被一号车锁闭于相反位置' : ''}${secConflicts.length ? (swConflicts.length ? '，且' : '') + '区段 ' + secConflicts.join('、') + ' 正被一号车征用/锁闭' : ''}${sameSig ? '同一始端信号机占用' : ''}${guideTotalLockActive ? '咽喉处于引导总锁闭' : ''} → ${routeSpecB.sig} 保持 ${closedAspB}，待一号车分段解锁后立即自动开放！`;
      } else if (bothFinished) {
        reasonTxt = mtMode === 'conflict_queue'
          ? `✓ 抵触排队与分段解锁演示完成：一号车入 IG 解锁咽喉后，二号车自动转 (5/7) 反位、开放 D₅:B 跟进连挂进入 IG，全部咽喉区段已安全解锁 (SJ↑)！`
          : `✓ 双车联锁演示完成：一号车与二号车均已安全通过咽喉到达终端，进路信号已关闭 (${routeSpec.sig}:${signalAspect}、${routeSpecB.sig}:${sigAspectB}) 且区段全解锁！`;
      } else if (mtMode === 'conflict_queue') {
        reasonTxt = `🟢 一号车已出清解锁咽喉！联锁自动将道岔 5/7 转至反位 (FBJ↑) 并开放 ${routeSpecB.sig}:${sigAspectB}，放行二号车 [${routeSpecB.title}] 跟进连挂！`;
      } else {
        reasonTxt = `🟢 双车联锁通过：一号车 [${routeSpec.title}] 与 二号车 [${routeSpecB.title}] 道岔位置相容且区段无冲突，允许平行/接续同时运行（${routeSpec.sig}:${signalAspect} ∥ ${routeSpecB.sig}:${sigAspectB}）`;
      }
      multiTrain = {
        active: true,
        mode: mtMode,
        scenarioName: mtSpec.name,
        scenarioNote: mtSpec.note,
        routeB: routeSpecB.code,
        routeSpecB,
        trainB: fB,
        rawTrainB,
        maxFollowB,
        sigB: routeSpecB.sig,
        sigAspectB,
        lxjB,
        bCanLockNow,
        bWaitingForA: !bCanLockNow,
        conflictReason: reasonTxt,
        indicatorOnB: !!(lxjB && routeSpecB.indicator),
        allUnlockedB
      };

      // 当一号车已完成咽喉解锁而二号车正在跟进运行（如 ④ 抵触排队 Phase 2），同步实时继电器链与活跃区段追踪二号车所在咽喉！
      if (bCanLockNow && allCtrlUnlocked && !allUnlockedB) {
        const ctrlB = layoutDefsB.filter(d => d.controlled).map(d => {
          const stItem = secStates[d.id] || { occ: false, l1: false, l2: false, qjj: false, unlocked: true, slow: false };
          return { id: d.id, label: d.id === '11DG' ? '7-11DG' : d.id, occ: !!stItem.occ, qjj: !!stItem.qjj, l1: !!stItem.l1, l2: !!stItem.l2, slow: !!stItem.slow, unlocked: !!stItem.unlocked };
        });
        if (ctrlB.length > 0) {
          controlledChain.length = 0;
          ctrlB.forEach(item => controlledChain.push(item));
          const occOrSlowB = [...ctrlB].reverse().find(c => c.occ || c.slow);
          const nextLockedB = ctrlB.find(c => !c.unlocked);
          chosenActive = occOrSlowB || nextLockedB || ctrlB[ctrlB.length - 1];
        }
      }
    }

    // 多列车转出反位道岔（如 ④ 抵触排队释放后 5/7 自动转反位）时，同步室内道岔表示继电器 DBJ / FBJ / 2DQJ
    const effSwReverse = swReverse || Object.values(switchesState).includes('R');
    const effDBJ = !activeSwitchFault && !swConverting && !effSwReverse;
    const effFBJ = !activeSwitchFault && !swConverting && effSwReverse;
    const effDQJ2 = DQJ2 || effSwReverse;

    const DGJ = isClassic4
      ? (isShunt ? !secStates['1DG'].occ : !(secStates['11DG'].occ && !(activePoorShunt && f >= 62 && f < 83 && !occByB.has('11DG'))))
      : !targetSecSt.occ;
    const FDGJ = isClassic4 ? (isShunt ? secStates['1DG'].occ || dg1Slow : !DGJ || dg11Slow) : (targetSecSt.occ || targetSecSt.slow);
    const CJ = !guideActive && !spadViolation && (isClassic4 ? (isShunt ? dg1Unlocked || dg1Slow : dg11Unlocked || (stg === 5 && r > 91 && r <= 96)) : (targetSecSt.unlocked || targetSecSt.slow));

    const activeSec = {
      id: chosenActive ? chosenActive.id : sgaSectionId,
      label: chosenActive ? chosenActive.label : sgaTarget,
      occ: chosenActive ? chosenActive.occ : !DGJ,
      DGJ: chosenActive ? (!chosenActive.occ && !(activePoorShunt && chosenActive.id === sgaSectionId)) : DGJ,
      FDGJ: chosenActive ? (chosenActive.occ || chosenActive.slow) : FDGJ,
      QJJ: !guideActive && !spadViolation && stg >= 4 && (chosenActive ? chosenActive.qjj : QJJ) && !manualUnlocked,
      LJ1: (guideActive || spadViolation) && !zraUnlocked ? false : (chosenActive ? chosenActive.l1 : false),
      LJ2: (guideActive || spadViolation) && !zraUnlocked ? false : (chosenActive ? chosenActive.l2 : false),
      CJ: !guideActive && !spadViolation && (chosenActive ? (chosenActive.unlocked || chosenActive.slow) : CJ),
      SJ: !guideActive && !guideTotalLockActive && !spadViolation && (chosenActive ? (chosenActive.unlocked && !chosenActive.occ) : SJ),
      slow: chosenActive ? chosenActive.slow : false,
      unlocked: !spadViolation && !guideTotalLockActive && (chosenActive ? chosenActive.unlocked : true)
    };

    const anySectionSlow = Object.values(secStates).some(stItem => stItem.slow);
    const reasons = [];
    if (spadViolation) reasons.push('🚨 违章冒进关闭信号：IG 股道已被二号车占用且未办理引导接车(HB)，严禁越过红灯 X 并禁止自动解锁(SJ↓)！');
    if (s.guideMode && !guideConditionsMet && !zraUnlocked) {
      reasons.push(`❌ 禁止开放引导信号 HB：${guideBlockReasons.join('；')}`);
    } else if (guideActive && YXJ) {
      reasons.push(firstSecFaultActive
        ? `第3.3.4节引导接车(YXJ↑ · 首区段故障 15 s 维持模式)：剩余维持时间 ${guideHoldRemaining.toFixed(1)} s，须在 15 s 内维持开放否则引导信号自动关闭（PDF p.49）`
        : `第3.3.4节引导接车(YXJ↑${guideTotalLockActive ? ' · 咽喉引导总锁闭' : ''})：检查主体红灯(DJ↑)、无敌对进路及${guideTotalLockActive ? '人工确认+全咽喉道岔总锁闭' : '道岔位置与进路锁闭'}后开放红+月白(HB) ≤20km/h；第一轮对压入内方首区段立即关闭！`);
    } else if (guideActive) {
      reasons.push(firstSecFaultActive && guideHoldElapsed >= 15
        ? '引导信号因内方首区段故障超过 15 s 未维持而关闭(YXJ↓ · PDF p.49)，引导进路保持锁闭(SJ↓)，须办理总人工解锁(ZRA)一次性解锁！'
        : '引导进路锁闭中(PDF p.49)：引导信号已关闭(YXJ↓)，但列车通过引导进路不按三点检查自动解锁(SJ↓保持)，须由值班员办理总人工解锁(ZRA)一次性解锁！');
    }
    if (hostileRouteActive) reasons.push('⚠ 存在已建立的敌对进路：禁止开放本进路正常信号或引导信号（PDF p.49 条件②）');
    if (firstSecFaultActive && !guideActive) reasons.push(`⚠ 内方第一轨道区段 ${firstCtrl.id} 故障红光带：正常信号无法开放；可办理引导接车(HB)并在 15 s 内维持开放（PDF p.49）`);
    if (history && history.reverse) reasons.push('已记录倒退，未完成的正向三点检查作废，自动解锁停止。须确认区段空闲并按规定办理解锁。');
    if (zqaUnlocked) reasons.push('办理总取消(ZQA)：接近区段空闲(JYJ↑ 预先锁闭)且进路完整空闲，关闭信号机并依靠 CJ 快动特性由远及近一次解除进路锁闭(SJ↑)');
    if (zqaBlockedByApproach) reasons.push('⚠ 接近区段占用(JYJ↓ 接近锁闭)！ZQA 只能关闭信号，严禁直接解锁！请改办总人工解锁(ZRA)延时');
    else if (s.cancelMode === 'zqa' && !zqaUnlocked) reasons.push('⚠ 进路非完整空闲（如终端股道/受控区段被占或道岔失表示）：按 §9.5.1 (PDF p.200) ZQA 只能关闭信号，严禁解锁！');
    if (zraCounting) reasons.push(`信号已关闭，持续检查进路完整且空闲。教材延时 ${zraSeconds} s（${zraSeconds === 30 ? (isShunt ? '调车进路' : '侧线发车进路') : (isDep ? '正线发车进路' : '列车接车进路')}），已计 ${Math.floor(s.zraProgress * zraSeconds)} s。演示时间 ×${s.slow ? 15 : 60}`);
    if (zraBlocked) reasons.push('人工解锁计时已中止。检查进路占用、道岔表示及接近锁闭条件，恢复条件后重新办理 ZRA');
    if (zraUnlocked && (approachLocked || guideLocked)) reasons.push(`总人工解锁延时（${zraSeconds} s）届满且进路空闲：确认车列未冒进，一次性解锁(SJ↑)`);
    if (sgaUnlocked) reasons.push(`图9.6.1 区段故障解锁仅释放 ${sgaTarget}。本区段空闲且操作前 QJJ↓，CJ 励磁后使对应 1LJ、2LJ、SJ 吸起。双人确认属现场手续，本演示仅检查模拟条件`);
    if (sgaBlocked) reasons.push('❌ 禁止区段故障解锁(SGA)：区段尚有车占用（DGJF↓）或属车列运行前方 QJJ↑ 保锁状态！按图9.6.1坚决锁闭');
    if (activeLampFault) reasons.push('主/副灯丝双断丝（DJ ↓），切断 11 线 LXJ/DXJ，主体红灯不可用（同时禁止开放 HB）');
    else if (activeSwitchFault) reasons.push('咽喉道岔失去表示（DBJ/FBJ ↓），切断 8 线与 11 线，信号立即关闭');
    else if (s.signalFaultLocked && stg === 5 && f < 0) reasons.push('信号关闭后保持防自动重开锁存。恢复检查条件后须重新办理开放，已解锁或已通过的进路须重新排列');
    if (activeStuckSection && !sgaUnlocked && stg === 5 && r > 91) reasons.push(`⚠ ${sgaTarget} 发生分路遗留/白光带不解锁故障（SJ↓ 锁闭），需确认无车后按规程办理区段故障解锁(SGA+ZRA)`);
    if (activePoorShunt && !isShunt && (isClassic4 ? ((rType !== 'DEP' && f >= 62 && f < 83) || (isDep && f >= 10 && f < 26)) : (f >= (targetDef ? targetDef.start + 4 : 50) && f < (targetDef ? targetDef.end - 2 : 80)))) reasons.push(`发生瞬间分路不良(${sgaTarget} 短时误吸)，但 2LJ 缺下一段占用条件且 FDGJ 3-4s 缓放阻止提前解锁！`);
    if (isDep && stg === 5 && f >= 0 && f < 28) reasons.push(`出站发车作业：列车压入内方咽喉区段，出站信号机 ${routeSpec.sig} 立即关闭回红灯 H（发车进路不含出发股道）`);
    if (isShunt && stg === 5 && f >= 0 && r <= 0 && LXJ) reasons.push(`调车白灯保留（§9.4.2 PDF p.191）：车头虽压入 ${layoutDefs[1].id}，因车尾尚未越过始端信号机(r=${r.toFixed(1)}≤0)，${routeSpec.sig} 维持月白灯 B 直至整列越过信号机后才关闭`);
    if (!isDep && !isShunt && stg === 5 && f >= 0 && f < 25) reasons.push(`第一轮对压入内方首区段 ${layoutDefs[1].id}，进站信号机 ${routeSpec.sig} 立即关闭回红灯 H`);

    if (multiTrain.active && multiTrain.conflictReason) reasons.unshift(multiTrain.conflictReason);

    const lj1Val = (guideActive || spadViolation) && !zraUnlocked ? false : (isClassic4 ? (isShunt ? dg1_1LJ : dg11_1LJ) : !!targetSecSt.l1);
    const lj2Val = (guideActive || spadViolation) && !zraUnlocked ? false : (isClassic4 ? (isShunt ? dg1_2LJ : dg11_2LJ) : !!targetSecSt.l2);
    const effGJJ = GJJ || spadViolation;
    const effZCJ = !effGJJ;
    const effSJ = !spadViolation && !guideTotalLockActive && SJ;

    return {
      picked: LXJ || YXJ, frontClosed: LXJ || YXJ, backClosed: !(LXJ || YXJ), drive: LXJ || YXJ,
      station: {
        history, routeType: rType, routeSpec, switchesState, secStates, signals,
        controlledChain, activeSec, multiTrain, allCtrlUnlocked, anySectionSlow,
        indicatorOn: !!(LXJ && routeSpec.indicator), sgaSectionId,
        route3G, isDep, isShunt, isSidingDep, stg, signalAspect, swReverse: effSwReverse, swConverting,
        guideEligible, guideConditionsMet, guideSignalCanOpen, guideRouteLocked: guideLocked, guideActive, guideBlockReasons,
        guideManualConfirmed, guideTotalLockActive, guideFirstSecFault: firstSecFaultActive,
        guideHoldElapsed, guideHoldRemaining, hostileRouteActive,
        trackOccupiedByB, spadViolation,
        occX3JG, occIAG, occ1DG, occ11DG: rawOcc11DG, shunt11DG, occTrack,
        iagUnlocked, dg1Unlocked, dg11Unlocked,
        iagSlow, dg1Slow: isClassic4 ? dg1Slow : anySectionSlow, dg11Slow: isClassic4 ? dg11Slow : anySectionSlow,
        cancelMode: s.cancelMode, signalFaultLocked: !!s.signalFaultLocked,
        preLocked, approachLocked, zqaUnlocked, zqaBlockedByApproach, zraCounting, zraUnlocked, zraBlocked, zraEligible, zraSeconds, routeClear, routeIntact, sgaTarget, sgaQjj, sgaUnlocked, sgaBlocked, manualUnlocked,
        relays: {
          LAJ, LJJ, LFJ, DFJ, DCJ, FCJ, DQJ1, DQJ2: effDQJ2, DBJ: effDBJ, FBJ: effFBJ,
          FKJ, ZJ, KJ, XJJ, QJJ, SJ: effSJ, JYJ, LXJ, YXJ, ZXJ, DJ, DJ2,
          GJJ: effGJJ, ZCJ: effZCJ, DGJ, FDGJ, LJ1: lj1Val, LJ2: lj2Val, CJ, ZQJ, ZRJ
        }
      },
      reasons
    };
  }

  function evaluate(s) {
    if (s.mode === 'signal') return evaluateSignal(s);
    if (!TYPES.includes(s.type)) throw new Error('未知继电器类型');
    if (s.mode === 'station') return evaluateStation(s);
    if (s.type === 'selfHold' && s.mode === 'bench') return evaluateSelfHold(s);
    if (s.type === 'turnoutLab' && s.mode === 'bench') return evaluateTurnout(s);
    if (s.type === 'fiveWireLab' && s.mode === 'bench') return evaluateFiveWire(s);
    if (s.type === 'cbiIoLab' && s.mode === 'bench') return evaluateCbiIo(s);

    let drive = s.polarity !== 0;
    let picked = false;
    let branchPicked = false;
    let receiverAvailable = false;
    const onTrack = s.mode === 'track';
    const shunt = occupied(s.front);
    const phaseOK = s.localPower && s.frequency === 'correct' && s.phase === 'correct';
    if (onTrack) {
      if (!['rectifier', 'phase'].includes(s.type)) throw new Error('轨道场景仅支持整流式与相敏式');
      receiverAvailable = s.power && !s.railBreak && !s.receiverBreak && !shunt;
      drive = receiverAvailable;
      branchPicked = s.power && !s.branchOccupied;
      picked = drive && (s.type !== 'phase' || phaseOK);
      if (s.type === 'rectifier' && s.multi) { drive = drive && branchPicked; picked = drive; }
    } else {
      switch (s.type) {
        case 'biased': picked = s.polarity === 1; break;
        case 'latching': picked = s.polarity === 0 ? s.latched : s.polarity === 1; break;
        case 'phase': picked = drive && phaseOK; break;
        case 'filament':
          drive = s.polarity !== 0 && s.filamentMode !== 'broken';
          picked = drive;
          break;
        default: picked = drive;
      }
    }
    const reasons = [];
    if (onTrack) {
      if (shunt) reasons.push('轮对分路');
      if (!s.power) reasons.push('送电电源断开');
      if (s.railBreak) reasons.push('钢轨导电路径断开');
      if (s.receiverBreak) reasons.push('受电连接线断开');
      if (s.type === 'rectifier' && s.multi && !branchPicked) reasons.push('分支 DGJ₁ 前接点断开');
    } else if (!drive && s.type !== 'latching') {
      if (s.type === 'filament' && s.polarity !== 0 && s.filamentMode === 'broken') reasons.push('主、副灯丝均断丝，点灯回路开路，DJ 失磁落下');
      else reasons.push('控制电源断开');
    }
    if (s.type === 'filament' && drive && s.filamentMode === 'backup') {
      reasons.push('主灯丝断丝 → DZJ 落下自动转换接通副灯丝，DJ 维持吸起');
    }
    if (s.type === 'filament' && s.filamentSignalSystem === 'outDep') {
      const aspNames = { L: '主方向 3+ 闭塞分区空闲 → ZXJ↑·LXJ↑·2LQJ↑·3LQJ↑ → 绿灯 L', LU: '主方向 2 闭塞分区空闲 → ZXJ↑·LXJ↑·2LQJ↑·3LQJ↓·2DJ↑ → 绿黄灯 LU', U: '主方向 1 分区空闲 → ZXJ↑·LXJ↑·2LQJ↓ → 单黄灯 U', L_REV: '反向发车 → ZXJ↓·LXJ↑/LXJF↑ 先检表示器 3DJ↑ 再亮绿灯 L+方向表示器', B: '出站兼调车 → LXJ↓·DXJ↑ → 调车月白灯 B', H: '平时 LXJ↓·DXJ↓ → 红灯 H 定位防护' };
      reasons.push('图5.1.3 两方向出站兼调车接口：' + (aspNames[s.filamentOutAspect] || ''));
    }
    if (s.type === 'phase' && drive) {
      if (!s.localPower) reasons.push('局部电源断开');
      if (s.frequency !== 'correct') reasons.push('频率条件不符');
      if (s.phase !== 'correct') reasons.push(s.phase === 'reversed' ? '相位反接' : '相位条件不符');
    }
    if (!onTrack && s.type === 'biased' && s.polarity === -1) reasons.push('反极性不能吸起');
    if (!onTrack && s.type === 'latching' && !drive) reasons.push('断电，永久磁铁保持上次位置');
    return {
      picked, frontClosed: picked, backClosed: !picked, drive,
      branchPicked, receiverAvailable, shunt, localEnergized: s.type === 'phase' && s.localPower,
      clear: onTrack ? picked : null, reasons
    };
  }
  function update(s, patch) {
    const n = { ...s, ...patch };
    if (![-1, 0, 1].includes(n.polarity)) throw new Error('电源极性非法');
    if (!Number.isFinite(n.front) || n.front < -25 || n.front > 165) throw new Error('列车位置越界');
    if (n.pantograph === false || n.catenaryPower === false) n.mainBreaker = false;
    if (n.stationRoute !== s.stationRoute || n.stationStage < 4) {
      if (!('guideMode' in patch)) n.guideMode = false;
      if (!('guideRouteLocked' in patch)) n.guideRouteLocked = false;
      if (!('guideManualConfirm' in patch)) n.guideManualConfirm = false;
      if (!('guideTotalLock' in patch)) n.guideTotalLock = false;
      if (!('guideFirstSecFault' in patch)) n.guideFirstSecFault = false;
      if (!('guideHoldElapsed' in patch)) n.guideHoldElapsed = 0;
      if (!('hostileRoute' in patch)) n.hostileRoute = false;
    }
    if ('stationHistory' in patch && patch.stationHistory === null && !('guideRouteLocked' in patch)) {
      n.guideRouteLocked = false;
    }
    if (s.cancelMode === 'zra' && patch.cancelMode === 'none' && !('guideRouteLocked' in patch)) {
      const prevStZra = s.mode === 'station' ? evaluateStation(s).station : null;
      if (prevStZra && prevStZra.zraUnlocked) {
        n.guideRouteLocked = false;
        n.guideMode = false;
      }
    }
    if (n.guideMode && !s.guideMode && !('guideHoldElapsed' in patch)) n.guideHoldElapsed = 0;
    if (!n.guideFirstSecFault && !('guideHoldElapsed' in patch)) n.guideHoldElapsed = 0;
    if (n.type === 'latching' && n.mode === 'bench' && n.polarity !== 0) n.latched = n.polarity === 1;
    if (n.type === 'selfHold' && n.mode === 'bench') {
      const method = n.shCrossMethod || 'position';
      const crossActive = n.shCrossFault && n.shCrossFault !== 'none';
      const effPos = n.shCrossFault === 'position' || (n.shCrossFault === 'active' && method === 'position');
      const commonOK = !n.shWireBreak && !n.shFujPicked && !effPos;
      const wrongMix = !n.shWireBreak && (n.shCrossFault === 'naive' || (crossActive && method === 'shunt' && n.shShuntLineBreak));
      n.shLatched = wrongMix || (commonOK && (n.shButton || n.shLatched));
    }
    if (n.mode === 'station' && n.stationStage >= 4) {
      const stPre = evaluateStation({ ...n, stationHistory: null, secondHistory: null }).station;
      // PDF p.49 (3)/(4)：一旦满足条件建立/开放引导，即锁存 guideRouteLocked 记忆；若后续出现灯丝/道岔/敌对等破坏条件，立即撤回开放命令 guideMode（防止故障恢复后自动重开），但保留 guideRouteLocked 禁止自动解锁直到办理 ZRA！
      if (stPre.guideSignalCanOpen && !stPre.zraUnlocked) {
        n.guideRouteLocked = true;
      } else if (n.guideMode && !stPre.guideConditionsMet && !('guideMode' in patch)) {
        n.guideMode = false;
      }
      const guideLockHold = !!(stPre.guideEligible && (stPre.guideSignalCanOpen || n.guideRouteLocked) && !stPre.zraUnlocked);
      const fault = guideLockHold ? '__ALL__' : (n.blindFault === 'stuckSection');
      const suppliedHistory = patch.stationHistory && patch.stationHistory.route === n.stationRoute && patch.stationHistory.position === n.stationTrain;
      if (!suppliedHistory && (!n.stationHistory || s.mode !== 'station' || s.stationStage < 4 || n.stationHistory.route !== n.stationRoute)) {
        n.stationHistory = J.create(n);
      } else if (n.stationTrain !== n.stationHistory.position) {
        n.stationHistory = J.move(n.stationHistory, n.stationTrain, fault);
      }
      for (const [key, label] of [
        ['lampFault', '灯丝双断'],
        ['switchFault', '道岔失表示'],
        ['poorShunt', '瞬间分路不良'],
        ['guideMode', '引导接车'],
        ['guideManualConfirm', '人工确认道岔位置'],
        ['guideTotalLock', '咽喉引导总锁闭'],
        ['guideFirstSecFault', '内方首区段故障'],
        ['hostileRoute', '敌对进路']
      ]) {
        if (n[key] !== s[key]) {
          n.stationHistory = J.clone(n.stationHistory);
          J.append(n.stationHistory, 'fault', `${label}${n[key] ? '办理/注入' : '取消/恢复'}`, key.startsWith('guide') || key === 'hostileRoute' ? 49 : 200);
        }
      }
      // 同步维护二号车 B 的时间驱动运行历史 secondHistory（统一三点检查 + 3 s FDGJ 缓放）
      const mtModeNow = n.multiTrainMode || 'none';
      if (mtModeNow !== 'none' && mtModeNow !== 'track_occupied') {
        const stForB = evaluateStation(n).station;
        const mtB = stForB.multiTrain;
        const routeB = mtB.routeB;
        const effTrainB = mtB.trainB;
        const suppliedB = patch.secondHistory && patch.secondHistory.route === routeB && patch.secondHistory.position === effTrainB;
        const resetB = ('stationHistory' in patch && patch.stationHistory === null && !('secondHistory' in patch))
          || ('secondHistory' in patch && patch.secondHistory === null);
        if (!suppliedB && (resetB || !n.secondHistory || s.mode !== 'station' || s.stationStage < 4 || s.multiTrainMode !== n.multiTrainMode || n.secondHistory.route !== routeB)) {
          n.secondHistory = J.create({ stationRoute: routeB, stationTrain: effTrainB });
        } else if (!mtB.bCanLockNow) {
          n.secondHistory = J.create({ stationRoute: routeB, stationTrain: effTrainB });
        } else if (!suppliedB && effTrainB !== n.secondHistory.position) {
          n.secondHistory = J.move(n.secondHistory, effTrainB, false);
        }
      } else {
        n.secondHistory = null;
      }
    } else if (n.mode === 'station') {
      n.stationHistory = null;
      n.secondHistory = null;
    }
    if (n.cancelMode !== 'zra' || s.cancelMode !== 'zra' || n.stationRoute !== s.stationRoute || n.stationStage !== s.stationStage) {
      n.zraProgress = 0;
      n.zraInterrupted = false;
    } else if (n.mode === 'station') {
      const st = evaluateStation(n).station;
      // 延时期间持续检查进路完整且空闲（含双车占车及引导咽喉空闲）；任一条件破坏立即中止计时！
      if (!st.zraEligible && !st.zraUnlocked) {
        n.zraProgress = 0;
        n.zraInterrupted = true;
      }
    }
    if (n.mode === 'station' && n.cancelMode !== 'none') n.signalFaultLocked = true;
    if (n.stationHistory && n.stationHistory.reverse) n.signalFaultLocked = true;
    if (n.mode === 'station' && n.stationStage === 5 && n.stationTrain < 0 && (n.lampFault || n.switchFault || n.blindFault === 'lamp' || n.blindFault === 'switch')) {
      n.signalFaultLocked = true;
    }
    if (n.mode === 'signal') {
      const map = SIGNAL_ASPECTS[n.signalType] || SIGNAL_ASPECTS.inStation;
      if (!SIGNAL_TYPES.includes(n.signalType)) n.signalType = 'inStation';
      if (!map[n.signalAspect]) n.signalAspect = Object.keys(map)[0];
      const allowedVars = n.signalType === 'inStation' ? ['a', 'b', 'c'] : ['a', 'b'];
      if (!allowedVars.includes(n.signalVariant)) n.signalVariant = n.signalType === 'shuntSig' ? 'b' : 'a';
    }
    if (n.mode === 'station' && n.stationHistory) {
      const st = evaluateStation(n).station;
      if (st.zqaUnlocked || st.zraUnlocked) {
        const ids = J.layout(n.stationRoute).filter(d => d.controlled).map(d => d.id);
        n.stationHistory = J.release(n.stationHistory, ids, st.zqaUnlocked ? '取消进路' : '人工延时');
      } else if (st.sgaUnlocked) {
        n.stationHistory = J.release(n.stationHistory, [st.sgaSectionId || (st.isShunt ? '1DG' : '11DG')], '区段故障');
      }
    }
    return n;
  }
  function advanceStation(s, dt) {
    if (!Number.isFinite(dt) || dt < 0) throw new Error('时间步长非法');
    if (s.mode !== 'station') return s;
    const stNow = evaluateStation(s).station;
    const stepDt = dt / (s.slow ? 4 : 1);
    if (s.stationHistory) s = update(s, { stationHistory: J.advance(s.stationHistory, stepDt, stNow.guideActive && !stNow.zraUnlocked ? '__ALL__' : (s.blindFault === 'stuckSection')) });
    if (s.secondHistory && stNow.multiTrain && stNow.multiTrain.active && stNow.multiTrain.bCanLockNow) {
      s = update(s, { secondHistory: J.advance(s.secondHistory, stepDt, false) });
    }
    // PDF p.49 (3)③：信号机内方第一轨道区段故障时，引导信号维持开放计时 15 s
    if (stNow.guideActive && stNow.guideFirstSecFault && stNow.relays.YXJ) {
      const nextHold = Math.min(15, (s.guideHoldElapsed || 0) + stepDt);
      s = update(s, { guideHoldElapsed: nextHold });
    }
    if (s.cancelMode !== 'zra') return s;
    const st = evaluateStation(s).station;
    if (!st.zraEligible) return update(s, { zraProgress: 0 });
    return update(s, { zraProgress: Math.min(1, s.zraProgress + dt * (s.slow ? 15 : 60) / st.zraSeconds) });
  }

  // 表4.1.4 at rated conditions. Values above strict lower bounds are demonstration choices.
  const HOLD_SECONDS = { slowRelease: .5, heavySlow: .46, filament: .16 };
  function advanceRelay(previous, s, dt) {
    if (!Number.isFinite(dt) || dt < 0) throw new Error('时间步长非法');
    const key = s.mode + '/' + s.type;
    const t = previous && previous.key === key ? previous : { key, picked: false, elapsed: 0 };
    const demand = evaluate(s).picked;
    if (s.mode !== 'bench') return { key, picked: demand, elapsed: 0, held: false, progress: 0 };
    if (s.type === 'timeRelay') {
      const elapsed = demand ? Math.min(180, t.elapsed + dt * (s.slow ? 15 : 60)) : 0;
      return { key, picked: demand && elapsed >= 180, elapsed, held: false, progress: elapsed / 180 };
    }
    const hold = HOLD_SECONDS[s.type] || 0;
    if (demand) return { key, picked: true, elapsed: 0, held: false, progress: 0 };
    const elapsed = t.elapsed + dt / (s.slow ? 4 : 1);
    const held = !!hold && t.picked && elapsed < hold;
    return { key, picked: held, elapsed, held, progress: 0 };
  }
  function advanceTrain(motion, s, dt, signalOpen = true) {
    if (!Number.isFinite(dt) || dt < 0) throw new Error('时间步长非法');
    const traction = s.pantograph !== false && s.catenaryPower !== false && s.mainBreaker !== false;
    const braking = !!s.trainBrake || !signalOpen;
    const before = motion ? motion.speed : 0;
    const acceleration = braking ? -8 : traction ? 4 : -.3;
    const elapsed = dt / (s.slow ? 4 : 1);
    const speed = Math.max(0, Math.min(18, before + acceleration * elapsed));
    const acceleratingTime = acceleration > 0 ? Math.min(elapsed, Math.max(0, 18 - before) / acceleration) : Math.min(elapsed, before / -acceleration);
    const distance = before * acceleratingTime + .5 * acceleration * acceleratingTime * acceleratingTime + speed * (elapsed - acceleratingTime);
    return { speed, distance, traction, braking };
  }
  const api = {
    advanceTrain, HOLD_SECONDS, advanceRelay, advanceStation, TYPES, SIGNAL_TYPES, SIGNAL_ASPECTS,
    ROUTES_3_2_2: J ? J.ROUTES_3_2_2 : [], MULTI_TRAIN_SCENARIOS, initial, occupied, evaluate, evaluateSignal, evaluateSelfHold,
    evaluateTurnout, evaluateFiveWire, evaluateCbiIo, evaluateStation, update
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RailwayLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
