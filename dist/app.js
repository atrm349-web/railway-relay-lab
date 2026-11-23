(function () {
  'use strict';
  const $ = id => document.getElementById(id), L = window.RailwayLogic, S = window.RelaySources;
  const catalog = {
    contacts: { name: '前、后接点', en: 'CONTACTS', symbol: '⎍', kicker: '第 4.1.2 节 · 接点编号与常态', sub: '11(中) — 12(前) / 13(后) 联动转换，微距观察上下托片与先断后接',
      principle: ['<strong>释放（落下）时：</strong>中接点(11)与后接点(13)相接，下托片限制后接点下移位置，与前接点(12)分离。<strong>吸起时：</strong>拉杆绝缘推珠上推中接点(11)，先断开后接点(13)，再与前接点(12)相接并推动上托片产生接点压力。', '<strong>铁路“常态”严格定义（图4.1.7）：</strong>按对应信号设备通常状态确定且释放对应安全侧——DBJ、GJ、SJ、DJ 常态为吸起（标 ↑），XJ、1DQJ、FDGJ 常态为落下（标 ↓）。'],
      question: 'GJ 在区段正常空闲时吸起，此时后接点是接通的吗？', answer: '不是。GJ 虽处于铁路意义的“常态（吸起 ↑）”，但此时前接点(11-12)闭合、后接点(11-13)断开。“常态”绝不能直接等同于“失电落下”。', ref: '第 4.1.2 节，书内 47—49 页／PDF 57—59 页；图 4.1.6—4.1.7、表 4.1.3。' },
    neutral: { name: '无极继电器', en: 'NEUTRAL', symbol: '∩', kicker: 'AX 型安全继电器 · 结构示意', sub: '正向、反向电流都能使其吸起，失电靠重锤片重力返回',
      principle: ['电流流过双线圈（1-2 与 3-4 串接），在铁芯、极靴、气隙、衔铁与轭铁构成的闭合磁路中产生控制磁通 Φ。吸力克服重锤片重力后，衔铁吸向极靴（由非磁性止片保留剩磁气隙 δ₀），经拉杆带动 8 组前后接点同步转换。', '<strong>“无极”是不区分工作电流方向。</strong>正、反向通电时磁通方向相反，但极靴对衔铁均产生吸力。断电后残磁极小，重锤片重力强制衔铁释放落下。'],
      question: '把电源正负极对调，衔铁会被“推开”吗？', answer: '不会。在满足工作值的条件下，正向与反向电流都能使无极继电器吸起。断电后靠重锤片重力返回落下位置。', ref: '第 4.1.1 节，书内 44—46 页／PDF 54—56 页；图 4.1.1、4.1.3、表 4.1.4。' },
    slowRelease: { name: '无极缓放继电器', en: 'SLOW-RELEASE', symbol: '◒', kicker: 'JWXC-H340 · 阻尼铜套缓放', sub: '铁芯套装阻尼铜套（或外接RC），断电后感应涡流维持磁通延时落下',
      principle: ['<strong>缓放原理（表4.1.1—4.1.4）：</strong>在阻尼作用延缓磁通衰减（图形符号为线圈下半圆涂黑）。当线圈切断电源时，原磁通企图衰减，在阻尼铜套（及外接并联RC回路）中感应出较强涡流，阻碍磁通减小，使衔铁延时 ≥0.45—0.5 s 才释放落下。', '<strong>典型应用：</strong>6502 解锁电路中的<strong>反位轨道复示继电器 FDGJ</strong>（配合阻容缓放 3—4 s，防止列车轻车跳动瞬间分路不良导致区段提前误解锁）以及传递继电器 CJ。'],
      question: '无极缓放继电器在刚通电吸起时也会很慢吗？', answer: '主要体现为断电缓放。表 4.1.4 专门规定其“缓放时间不小于 0.45—0.5 s”，用于在电路状态转换交接期间保持前接点短暂闭合。', ref: '第 4.1.1、4.2.2、9.3 节，书内 45、48、50、53、173 页／PDF 55、58、60、63、183 页。' },
    heavySlow: { name: '加强缓放继电器', en: 'HEAVY SLOW-RELEASE', symbol: '◨', kicker: 'JWJXC-H125/0.44 · 图4.1.2命名示例', sub: '125Ω电压启动圈 + 0.44Ω大电流自闭圈 + 铜套缓放 + 2QJ加强灭弧接点',
      principle: ['<strong>教材图 4.1.2 命名标杆：</strong>“J”继电器、“W”无极、“J”加强接点、“X”信号、“C”插入、“H”缓放，“125/0.44”表示前圈 125 Ω（电压线圈）、后圈 0.44 Ω（低阻大电流线圈）。接点配置为 <strong>2QJ + 2H + 2QH</strong>。', '<strong>道岔 1DQJ 核心作用（第5.2.2节）：</strong>选岔或单操时先经 125 Ω 线圈励磁吸起；吸起后接通 2DQJ 转极，在 2DQJ 转换瞬间靠<strong>缓放特性</strong>维持不落；转辙机启动后转由与电机串联的 <strong>0.44 Ω 电流线圈自闭</strong>，保证道岔一经启动必转到底，到位开闭器断开后失磁落下。'],
      question: '为什么 1DQJ 的 1-2 后圈电阻只有 0.44 Ω 这么小？', answer: '因为 1-2 后圈（0.44 Ω）直接串联在直流电动转辙机的大电流动作回路（约 2 A）中（前圈 3-4 为 125 Ω 电压启动线圈）！若后圈电阻大则会分走电机工作电压；只有电机确有动作电流流过时 0.44 Ω 线圈才能维持 1DQJ 吸起，兼起监督电动机回路完好的作用。', ref: '第 4.1.1 节图 4.1.2、表 4.1.4（PDF 55、60 页）；第 5.2.2 节图 5.2.2（PDF 78—81 页）。' },
    differential: { name: '双异阻无极继电器', en: 'DIFFERENTIAL COIL', symbol: '⊖', kicker: 'JWXC-370/480 · 双圈分接电流整定', sub: '前圈 370 Ω / 后圈 480 Ω 独立分接，2QH + 2Q 接点配置',
      principle: ['<strong>表 4.1.4—4.1.5 释义标杆：</strong>型号分式“370/480”表示前圈（3-4端）电阻为 370 Ω、后圈（1-2端）电阻为 480 Ω，两线圈独立分接（表 4.1.2 图形符号为圆圈上下两条横线）。', '其电气特性按<strong>电流值（mA）</strong>整定：前圈工作值 ≤12 mA、释放值 ≥3.8 mA；后圈工作值 ≤11.5 mA、释放值 ≥3.6 mA。适用于两路不同阻抗支路的独立励磁与自闭保持。'],
      question: 'JWXC-1700 和 JWXC-370/480 的数字写法为什么一个写总数、一个写分数？', answer: '表 4.1.5 明确规定：当前、后两线圈阻值相同时（如 2×850 Ω），型号取二者之和（1700）；当前、后线圈阻值不同时，必须写成“前圈阻值/后圈阻值”的分数形式（370/480）。', ref: '第 4.1.1 节，书内 48、50—51 页／PDF 58、60—61 页；表 4.1.2、4.1.4、4.1.5。' },
    biased: { name: '偏极继电器', en: 'BIASED POLAR', symbol: '↗', kicker: '以 JPXC-1000 原理为例', sub: '极靴下设 L 形永久磁铁，规定 1 正 4 负才吸起',
      principle: ['在无极式磁系统极靴下部增设 L 形永久磁铁（上端 N、下端 S）。<strong>无电流时（图4.1.4a）：</strong>永磁磁通 Φ永 在左侧局部回路闭合，将衔铁牢靠吸向 N 极，保持后接点闭合。', '<strong>规定 1 正、4 负时（图4.1.4b）：</strong>线圈产生控制磁通 ΦK，在气隙处克服永磁吸力与机械力总和，衔铁吸向极靴。<strong>反极性（4 正 1 负）时：</strong>ΦK 与 Φ永 方向一致，使衔铁更牢靠吸向 N 极而不动作。广泛用作道岔定位/反位表示继电器 <strong>DBJ / FBJ</strong>。'],
      question: '偏极继电器反向通电后，会像极性保持继电器一样记住位置吗？', answer: '不会。JPXC-1000 只有通以 1 正 4 负电流才吸起；反极性和断电都处于落下状态。道岔表示电路（DBJ/FBJ）即利用其反映室外整流二极管半波极性。', ref: '第 4.1.1 节，书内 46 页／PDF 56 页；图 4.1.4、表 4.1.4；第 5.2.2 节 PDF 81 页。' },
    latching: { name: '极性保持继电器', en: 'POLAR LATCHING', symbol: '⇄', kicker: '有极继电器 · 断电保持', sub: 'JYJXC-220/220：2组加强定反位(2DFJ) + 2组普通定反位(2DF)',
      principle: ['<strong>1 进、4 出：</strong>转为定位（定位接点 111—112 接通）。<strong>4 进、1 出：</strong>转为反位（反位接点 111—113 接通）。永久磁铁（左 N 右 S）与轭铁相接，切断控制电流后由永磁保持磁通维持原状态不变。', '当故障—安全的安全侧定义为“故障后保持原状态不变”（如道岔二启动继电器 <strong>2DQJ</strong>）时采用此原则。表 4.1.3 规定极性接点编号为 111（中）、112（定位）、113（反位）。'],
      question: '先正向通电转至定位，然后断电，定位接点 111—112 会断开吗？', answer: '不会。正向通电把机构切到定位；断电后永久磁铁保持定位磁路，定位接点 111—112 仍接通；只有通入反向电流（4进1出）才转为反位。', ref: '第 4.1.1 节，书内 46—47、49—50 页／PDF 56—57、59—60 页；图 4.1.5、表 4.1.3—4.1.4。' },
    rectifier: { name: '整流式轨道继电器', en: 'RECTIFIER', symbol: '∿', kicker: '50 Hz 轨道电路 · JZXC-480', sub: 'JZXC-480：AC 18 V · 4QH + 2Q · 轨道电路图 5.3.1',
      principle: ['教材 50 Hz 交流轨道电路采用 JZXC-480 型交流整流式轨道继电器。受电端经 BZ₄ 中继变压器接入继电器 8、7 端，内部经整流元件将交流转换为单向脉动电流驱动 AX 电磁机构。', '表 4.1.4 规定其接点组数为 <strong>4QH + 2Q</strong>（4 组完整前后接点 + 2 组仅有前接点）。切到“02 · 轨道电路分路”，可观察列车轮对分路、断轨及图 5.3.2(a) 一送两受分支检查。'],
      question: '列车轮对分路后，是把轨道继电器直接“压下去”了吗？', answer: '不是机械压动。导电轮对在两根钢轨间形成低阻分路（远小于继电器阻抗），流经 GJ 的电流骤降到释放值以下，衔铁靠重锤片重力落下。', ref: '第 5.3.1 节，书内 77—78 页／PDF 87—88 页；图 5.3.1—5.3.2、表 4.1.4。' },
    filament: { name: '灯丝检查继电器', en: 'FILAMENT RELAY', symbol: '⊗', kicker: 'JZXC-H62（DJ） · 信号点灯监督', sub: '2×31Ω低阻线圈串联于 BX-30 点灯回路，监督主/副灯丝完好并具缓放特性',
      principle: ['<strong>表 4.1.4 与第 5.1.2 节（图5.1.2）：</strong>JZXC-H62（灯丝继电器 DJ）线圈电阻仅 2×31 Ω，串联在信号变压器 BX-30 一次侧点灯回路中，按电流大小工作，且带缓放特性（>0.15 s）。', '<strong>主副灯丝自动转换与红灯检查：</strong>当信号机主灯丝断丝时，灯丝转换继电器 DZJ 失磁落下，用其后接点自动接通副灯丝，DJ 靠缓放跨越转换瞬间保持吸起；若主、副灯丝均断丝，DJ 落下，立即将允许灯光降级关闭或阻止信号开放。'],
      question: '进站信号机开放黄灯前，为什么要先检查红灯灯丝继电器 DJ 吸起？', answer: '为了故障—安全（第 3.3.1 节、5.1.2 节）：若红灯主、副灯丝已双断丝，一旦列车压入进路关闭黄灯时将无法点亮红灯（出现信号机灭灯危及行车），因此红灯断丝时严禁开放允许信号。', ref: '第 4.1.1 节表 4.1.4（PDF 60 页）；第 5.1.1—5.1.2 节表 5.1.1、图 5.1.2（PDF 68—71 页）。' },
    timeRelay: { name: '半导体时间继电器', en: 'TIME-DELAY RELAY', symbol: '3′', kicker: 'JSBXC-850 · 附录2 / 表4.1.2', sub: '型号见PDF274，延时功能见第9.5节。机构与4组接点仅作功能示意，内部装配未核实',
      principle: ['<strong>教材第 4.1.1 节、表 4.1.1—4.1.2：</strong>当电路需要数十秒至数分钟的精确延时（用于规定的长延时）时，采用半导体时间继电器（图形符号在圆圈内标注“3′”）。', '<strong>第 3.3.3 / 9.5 节人工延时解锁应用：</strong>当列车已进入接近区段（接近锁闭 JYJ ↓）需办理总人工解锁时，先关闭防护信号机，再启动时间继电器计时（接车/正线发车延时 <strong>3 min</strong>［高铁 4 min］，侧线发车/调车延时 <strong>30 s</strong>），确认列车未冒进并停稳后方才解锁。'],
      question: '为什么“取消进路（总取消）”不需要时间继电器延时，而“总人工解锁”必须延时 3 min / 30 s？', answer: '因为取消进路适用于接近区段无车（预先锁闭 JYJ ↑）；而总人工解锁时接近区段已有列车驶近（接近锁闭 JYJ ↓），若关闭信号后立即解锁扳动道岔，列车可能因制动不及冒进信号造成脱轨冲突！', ref: '第 3.3.3 节（PDF 47—48 页）；第 4.1.1 节表 4.1.1—4.1.2（PDF 55、58 页）；第 9.5 节（PDF 200 页）。' },
    phase: { name: '25 Hz 相敏继电接口', en: '25 Hz PHASE-SENSITIVE', symbol: 'φ', kicker: '25 Hz 相敏轨道电路 · 图 5.3.3', sub: '轨道线圈 3—4 与局部线圈 1—2 双输入，附正交磁通翼片原理示意',
      principle: ['<strong>教材的二元输入（图5.3.3）：</strong>轨道线圈 3—4 接收经钢轨传输的 25 Hz 轨道信号（跨接防雷补偿器 Z、防护盒 HF），局部线圈 1—2 接室内 25 Hz 局部电源（并接电容 C）。电流、频率与规定相位差同时满足时 GJ 吸起。', '<strong>相敏鉴别原理：</strong>两路同频且满足理想相位差的交变磁通在感应翼片中产生正向电磁转矩，托起翼片带动前接点闭合；<strong>若绝缘节破损导致相邻反相电源侵入（相位反接 180°），则产生反向转矩将翼片压向后接点</strong>，可靠防护绝缘破损。'],
      question: '轨道空闲且两路 25 Hz 电源幅值正常，若把轨道线圈相位反接 180°，GJ 会吸起吗？', answer: '不会吸起，反而会产生反向转矩使机构更可靠地保持落下。这正是 25 Hz 相敏轨道电路利用相邻区段相位交叉实现绝缘节破损防护的核心原理。', ref: '第 5.3.2 节，书内 78—79 页／PDF 88—89 页；图 5.3.3。' },
    selfHold: { name: '自闭电路与防混线', en: 'SELF-HOLD & PROTECTION', symbol: '⏚', kicker: '第 4.2 & 4.3 节 · 图 4.2.2 / 4.3.1 / 4.3.2', sub: '启动电路(按钮A) + 自闭电路(AJ 11-12) + 共用电路(FUJ 11-13) + 远端供电位置法防混线',
      principle: ['<strong>教材第 4.2 节图 4.2.2 自闭电路三大组成：</strong>①<strong>启动电路</strong>（自复式按钮 A 的常开接点支路，仅在按压期间短时导通）；②<strong>自闭电路</strong>（并联在按钮两端的本继电器前接点 AJ 11-12，一旦吸起即实现自保持，松开按钮 A 仍维持励磁）；③<strong>共用电路</strong>（串联在干路上的复原继电器后接点 FUJ 11-13，当满足复原条件 FUJ ↑ 时切断 AJ 自闭回路使其落下）。', '<strong>教材第 4.3 节故障—安全两大铁律：</strong>①<strong>断线防护（图4.3.1 闭路原则）</strong>：工作时持续通电（吸起代表允许/非安全侧，落下代表安全侧），任何一处断线必使继电器失磁落下；②<strong>混线防护（图4.3.2 远端供电/位置法）</strong>：将电源（KZ/KF）与继电器（如 DBJ）分置在室外长电缆的两端——一旦电缆发生混线短路，只会把电源短路烧断熔丝，而绝不会使室内继电器错误吸起！'],
      question: '为什么自复式按钮 A 松手断开后，按钮继电器 AJ 还能继续保持吸起？怎样才能让它复原落下？', answer: '因为 AJ 吸起时闭合了自身前接点 AJ 11-12，与按钮 A 构成并联自闭支路（KZ → FUJ 11-13 → AJ 11-12 → AJ线圈 → KF）；只有当复原继电器 FUJ 励磁吸起（断开共用支路上的后接点 FUJ 11-13）或电源断线时，AJ 才失磁落下。', ref: '第 4.2.1 节（书内 51—52 页／PDF 61—62 页，图 4.2.2）；第 4.3.1—4.3.2 节（书内 54—55 页／PDF 64—65 页，图 4.3.1—4.3.2）；练习题第 4、5、27 题。' },
    turnoutLab: { name: '四线制道岔控制', en: '4-WIRE TURNOUT CIRCUIT', symbol: '⑂', kicker: '第 5.2.2 节 · 图 5.2.2–5.2.3', sub: '1DQJ(3-4 125Ω启动 / 铜套缓放 / 1-2 0.44Ω串电机) + 2DQJ(有极转极) + DBJ/FBJ(半波偏极表示) + 自动开闭器',
      principle: ['<strong>教材第 5.2.2 节（图5.2.2–5.2.3）动作电路 5 步逻辑：</strong>①定位稳态时自动开闭器第1、3排闭合（14-13、34-33、32-31 接通表示，11-12 备反位动作），BB Ⅱ次侧 AC 220 V 经室外二极管 Z 半波整流使偏极继电器 <strong>DBJ (JPXC-1000)</strong> 1正4负吸起；②操岔时检查 SJ81-82↑，<strong>1DQJ (JWJXC-H125/0.44)</strong> <strong>3-4 电压前圈（125 Ω）</strong>励磁吸起，切断表示电路并接通 <strong>2DQJ (JYJXC-220/220)</strong> 转极；③2DQJ 转极切断 3-4 线圈瞬间，1DQJ 靠<strong>阻尼铜套缓放（≥0.45 s）</strong>保持不落；④2DQJ 转至反位（111-113、121-123 闭合）后，直流电源 DZ220/DF220 经 <strong>1DQJ 1-2 低阻电流后圈（0.44 Ω）</strong>、X2、自动开闭器 11-12、<strong>电机 M</strong>、遮断器 05-06、X4 构成约 2 A 大电流动作自闭回路，脱离 SJ 控制一经启动必转到底！', '<strong>动接点组 B/A 先后动作与夹异物防护（图5.2.3，PDF p.78/80）：</strong>道岔刚一启动转换，<strong>内侧 B 动接点组先匀速由第 3 排转至第 4 排（断开 31-32，闭合 41-42）</strong>，提前为“尖轨夹异物受阻时把道岔操回定位”准备好 X1（41-42）反转通路；待尖轨密贴锁闭瞬间，<strong>外侧 A 动接点组速动（断开 11-12，闭合第 2 排 21-22/23-24）</strong>，切断电机动作回路使 1DQJ 缓放落下，并经 43-44/23-24/Z/21-22/X2 接通反位表示回路使 <strong>FBJ ↑</strong>。'],
      question: '当道岔向反位转换中途因尖轨与基本轨间夹异物受阻时，为什么值班员还能把道岔操纵回定位？', answer: '因为道岔刚一启动解锁，自动开闭器的内侧 B 动接点组就已经先匀速动作（断开 31-32、闭合 41-42），提前接通了 X1 线回转定位的准备通路！此时值班员在空转烧断反位熔丝 RD₂（3 A）前办理单操定位（使 2DQJ 转回定位），电流即可经 X1 → 41-42 → 电机反激磁绕组 → M → X4/RD₁ 使道岔退回定位。', ref: '第 5.2.1—5.2.2 节（书内 67—72 页／PDF 77—82 页，图 5.2.1—5.2.3、表 5.2.1）；练习题第 15 题。' },
    fiveWireLab: { name: '五线制三相道岔', en: '5-WIRE 3Φ TURNOUT', symbol: '3Φ', kicker: '第 5.2.3 节 · 图 5.2.4–5.2.8', sub: 'S700K 三相 AC 380V + DBQ 断相保护 + BHJ + 1DQJ/1DQJF + 并联表示 Z (取消电容 C)',
      principle: ['<strong>与四线制的核心差异（第5.2.3节，PDF p.82–86）：</strong>①采用三相 AC 380 V（RD₁~RD₃ 5A）驱动 S700K 交流电机；②室内增设 <strong>DBQ 断相保护器</strong>与<strong>保护继电器 BHJ</strong>——启动先经 1DQJ(3-4)↑ → 1DQJF↑ → 2DQJ 换相，三相通流经 DBQ 使 BHJ↑ 后方由 BHJ 第3组前接点与 QDJ↑ 构成 1DQJ 1-2 自闭，任意一相断线或超时（13s/30s）时 BHJ 立即落下切断三相电源；③<strong>2DQJ 换相控制转向</strong>：通过调换 B、C 两相相序（定位 W-U-V 顺时针 / 反位 W-V-U 逆时针）改变三相旋转磁场方向。', '<strong>表示电路与五条线分工（图5.2.7–5.2.8，PDF p.85–86）：</strong>五线制表示电路<strong>取消滤波电容 C</strong>，改为在室外电缆盒将<strong>二极管 Z 与保护电阻 R₂(300Ω/50W) 并联</strong>于表示支路中（定位经 X1/X2/X4，反位经 X1/X3/X5，正负两半周自感续流维持 DBJ/FBJ 吸起并串检三相电机绕组完好）！五线分工：X1 公共线，X2 反→定启动/定表交叉线，X3 定→反启动/反表交叉线，X4 定位启动/定表共用线，X5 反位启动/反表共用线。'],
      question: 'S700K 五线制道岔控制与表示电路相比四线制增加了什么核心保护元件？表示电路为什么要取消滤波电容 C？', answer: '①动作电路增设 DBQ（三相断相保护器）与 BHJ（保护继电器），一旦缺相 BHJ 立即落下切断电机动作自闭回路；②表示电路取消大容量电容 C 消除电容失效误吸隐患，改为把二极管 Z 与 R₂(300Ω/50W) 并联在 DBJ/FBJ 两端（正负半周自感续流维持吸起），同时串联流过室外三相电机两组绕组实现断线全监督。', ref: '第 5.2.3 节（书内 72—76 页／PDF 82—86 页，图 5.2.4—5.2.8、表 5.2.2）。' },
    cbiIoLab: { name: '计算机联锁安全 I/O', en: 'CBI FAIL-SAFE I/O', symbol: 'T⊓', kicker: '第 11.3 & 13.2 节 · 图 13.2.2–13.2.4', sub: '动态方波脉冲 → 光耦 U1 → 脉冲变压器 T(隔直传交) / 电荷泵 C1·C2 → 偏极 J↑',
      principle: ['<strong>为什么绝不能用普通高电平直接驱动继电器（第13.2.2节，PDF p.258–260）？</strong>计算机 CPU 发生硬件故障时，输出端口极可能“卡死在常高电平 1”。因此必须让软件周期性翻转输出<strong>动态方波脉冲</strong>，经光耦 <strong>U1</strong> 与<strong>脉冲变压器 T 隔直传交</strong>（图13.2.3），或经互补三极管 <strong>T1/T2 + 电容泵 C1·C2</strong>（图13.2.4）泵升整流后方能驱动 <strong>JPXC-1000 偏极继电器 J</strong> 吸起。', '<strong>静态不对称编码与动态采集（图13.2.2）：</strong>静态输入规定落下为 <code>1010</code>、吸起为 <code>0101</code>（双位反相冗余），其余全部 14 种组合（如 1100/1111/0000）均按非法故障导向安全侧！动态输入则发探测脉冲经现场接点回采校验。'],
      question: '若计算机联锁输出口因芯片死机永远卡死在“高电平 1”，脉冲变压器 T 隔离电路控制下的执行继电器 J 会保持吸起吗？', answer: '不会！高电平“1”对应直流稳态，初级磁通变化率 dΦ/dt = 0，脉冲变压器 T 隔直不传直流（同理互补三极管电容泵 C1/C2 无法周期充放电），次级电压迅速归零，偏极继电器 J 可靠释放落下导向安全侧。', ref: '第 11.3 节（PDF 224—225 页，图 11.3.2）；第 13.2 节（PDF 257—260 页，图 13.2.2—13.2.4）。' }
  };
  for (const [type, spec] of Object.entries(S.models)) {
    catalog[type].en = spec.model;
    if (!['contacts', 'selfHold', 'turnoutLab', 'fiveWireLab', 'cbiIoLab'].includes(type)) catalog[type].kicker = spec.model + ' · ' + spec.contacts;
  }

  const SIGNAL_CATALOG = {
    inStation: {
      name: '进站信号机', en: 'HOME SIGNAL · 5灯+引导', symbol: 'X',
      kicker: '第 2.3.1 / 2.3.3 节 · 表 p.26 第一行（高柱三机构 / 桥隧 b·c 型）',
      sub: '自上而下依次为 黄·绿·红·黄·月白；常态红灯，支持 H / U / UU / L / LU / USU / HB',
      principle: [
        '<strong>设置位置（第 2.3.1(1) 节，PDF p.21—22）：</strong>设于车站入口处外方最外方道岔尖轨不少于 50 m 处（一般采用高柱信号机），指示区间开来的列车能否进站。下行用 X、上行用 S，反向设 X_F/S_F（双线自闭区段可设于运行方向右侧）。',
        '<strong>机构与灯光排列（PDF p.24、26）：</strong>a 型高柱三机构由上机构(黄·绿)、中机构(红·黄)与下引导机构(月白)组成；桥隧采用 b 型矮双列或 c 型单柱五灯一体。作为线路所通过信号机时无引导显示、封月白灯。'
      ],
      question: '进站信号机共有 5 个灯位，自上而下的标准色序是什么？若夜间发生灯光全灭，行车上按什么处理？',
      answer: '自上而下依次为：黄、绿、红、黄、月白（PDF p.24）。遵循故障—安全原则（第 2.3 节），信号机灯光熄灭或显示不规范时一律视为停车信号（红灯 H）。',
      ref: '第 2.3.1(1) / 2.3.3(1)(5) 节，书内 10—16 页／PDF 20—26 页；第 5.1.2 节表 5.1.1（PDF 68—70 页）。'
    },
    distant: {
      name: '预告信号机', en: 'DISTANT SIGNAL · 2灯', symbol: 'Y',
      kicker: '第 2.3.1(3) / 2.3.3(2) 节 · 表 p.26 第二行（a 高柱 / b 矮型）',
      sub: '上绿 L · 下黄 U；设于非自动闭塞主体进站信号机前方 ≥800 m，常态亮黄灯',
      principle: [
        '<strong>预告功能（PDF p.21）：</strong>在非自动闭塞区段，为保证列车在主体进站信号机前有充足制动距离，在主体外方不少于 800 m 处设置预告信号机（在主体名之前冠 Y，如 YX）。',
        '<strong>常态点灯显示（PDF p.25）：</strong>常态为黄灯 U（预告主体进站处于关闭状态），主体进站开放后自动显示绿灯 L。桥梁隧道地段采用 b 型矮柱结构。'
      ],
      question: '为什么预告信号机“一个黄色灯光”不要求列车立即停车，而表示“主体信号机关闭”？',
      answer: '因为预告信号机距主体信号机 ≥800 m，平时（主体红灯 H）预告信号机亮黄灯 U 提醒司机前方进站处于关闭状态、须提前采取减速准备在进站外方停车；主体开放后预告转为绿灯 L。',
      ref: '第 2.3.1(3) / 2.3.3(2)(5) 节，书内 11、15—16 页／PDF 21、25—26 页。'
    },
    depFour: {
      name: '四显示自闭出站', en: '4-ASPECT DEP · 双机构+表示器', symbol: 'S4',
      kicker: '第 2.3.3(3.3) 节 · 表 p.26 第三行（含两发车方向 + 调车 + 表示器）',
      sub: 'a 型(绿红黄 + 绿月白) / b 型(4+2) + 进路表示器，支持 L / LU / U / LL / H / B',
      principle: [
        '<strong>多制式显示含义（PDF p.25）：</strong>红灯 H 不准发车；单黄 U 示前方 1 闭塞空闲；绿黄 LU（检 2DJ↑）示前方 2 闭塞空闲；单绿 L（2LQJ↑·3LQJ↑）示前方 3+ 闭塞空闲；双绿 LL 开往半自动闭塞或次要方向；月白 B 兼作调车。',
        '<strong>两个发车方向与表示器（第 2.3.1(2) 节 & 图 5.1.3）：</strong>当出站兼有两条线路方向（或正反方向）发车时加装发车方向表示器，向另一方向发车先检表示器 3DJ↑ 方准点亮允许信号。'
      ],
      question: '四显示自动闭塞区段的出站信号机点亮“一绿一黄 LU”与“双绿 LL”分别表示什么行车条件？',
      answer: '一绿一黄 LU 表示运行前方有两个闭塞分区空闲（需检查 2DJ↑ 吸起监督黄灯完好）；两个绿灯 LL 表示准许列车由车站出发，开往半自动闭塞、自动站间闭塞区间或次要发车方向。',
      ref: '第 2.3.1(2) / 2.3.3(3)(5) 节，PDF 21—26 页；第 5.1.2 节图 5.1.3（PDF 73—75 页）。'
    },
    depThree: {
      name: '三显示自闭出站', en: '3-ASPECT DEP · 图3.1.1 S₁/SⅡ/S3', symbol: 'S3',
      kicker: '第 2.3.3(3.2) 节 & 图 3.1.1 主力原型（高柱 SⅡ / 矮型 S₁·S3·S4）',
      sub: 'a 型高柱(2+2) / b 型矮柱(3+2 绿·空·黄 + 月白·红) + “右”向表示器',
      principle: [
        '<strong>正线高柱与站线矮型（第 2.3.1(2) 节，PDF p.21）：</strong>在图 3.1.1 示例车站中，正线出站 SⅡ 设高柱信号机，而站线 3G/IG/4G 为在不侵限界下尽量增大股道有效长，均设 b 型矮柱信号机（S₁、S₃、S₄）。',
        '<strong>表 3.2.2 联锁结合：</strong>由 IG/IIG/3G/4G 向北京方面 X 发车时开放绿灯 L 并点亮方向表示器“右”；若作调车起始点，DXJ↑ 点亮月白灯 B 并保留至越过。'
      ],
      question: '为什么站线到发线上的出站信号机（如 图3.1.1 中的 S₁、S₃、S₄）多用矮型，而正线 IIG 上 SⅡ 用高柱？',
      answer: '为满足建筑限界并最大限度保留站线有效长（第 2.3.1(2) 节 2(2)），站线股道间线间距窄故多设矮型 b 类；正线上视距要求远且可立柱，故设高柱（a 型）。',
      ref: '第 2.3.1(2) / 2.3.3(3.2)(5) 节，PDF 21—26 页；图 3.1.1 & 表 3.2.2（PDF 35、42—43 页）。'
    },
    depSemi: {
      name: '半自闭出站', en: 'SEMI-AUTO DEP · 2灯(绿红)', symbol: 'Sb',
      kicker: '第 2.3.3(3.1) 节 · 表 p.26 第五行（非自动闭塞区段）',
      sub: '上绿 L · 下红 H 两灯简洁机构（a 高柱 / b 矮型），常态红灯，须取得闭塞权 BS',
      principle: [
        '<strong>半自动闭塞发车原则（PDF p.25 & 31）：</strong>非自动闭塞区间不划分多级闭塞分区，无单黄显示；车站值班员只有与邻站办妥半自动闭塞手续取得发车权（联锁表“其他联锁：BS”）后，出站 LXJ↑ 方能由红转绿。',
        '<strong>简洁二灯位：</strong>不含调车机构时仅保留上绿下红两灯（如图 2.3.3(5) 第 5 行）；若须兼调车则须增设独立调车信号机构成双机构。'
      ],
      question: '联锁表“其他联锁”一栏在发车进路中填写“BS”代表什么约束？',
      answer: 'BS 代表“闭塞”条件（PDF p.31 & 表 3.2.2 第 5–8、13–16 条）：对于半自动/自动闭塞发车进路，必须办妥闭塞手续并检查离去区段空闲后才允许开放出站信号机。',
      ref: '第 2.3.3(3.1)(5) 节，PDF 25—26 页；第 3.2.1 节 PDF 31、42 页。'
    },
    shuntSig: {
      name: '调车信号机', en: 'SHUNT SIGNAL · D₁~D₈ (蓝/白)', symbol: 'D',
      kicker: '第 2.3.2 节 & 图 2.3.2 · 表 p.26 第六行（起始 / 阻拦 / 折返）',
      sub: '上月白 B · 下蓝 A（咽喉多用 b 型矮柱，牵出线用 a 型高柱）；常态亮蓝灯 A',
      principle: [
        '<strong>蓝灯与月白灯严格区分：</strong>常态下亮蓝灯 A，仅不准越过该信号机调车，<strong>对列车进路作业不起控制作用</strong>；办理调车进路 DXJ↑ 时亮月白灯 B 准许调车；装设平面溜放设备时月白闪光准许溜放。',
        '<strong>并置 / 差置 / 单置布置（图 2.3.2，PDF p.23—24）：</strong>设于无岔区段（不少于 50 m）两端背向并排称并置、分设两端的反向相向称差置（如图 3.1.1 的 D₃ 与 D₇ 分居 1/7G 两端，选排互借终端按钮），前后皆含道岔称单置（如 D₁、D₅）。'
      ],
      question: '在图 3.1.1 / 表 3.2.2 第 17 条办理 D₁→D₇ 调车进路时，为什么终端不按 D₇A 而按 D₃A？',
      answer: '因为 D₃ 与 D₇ 分居 1/7G 无岔区段两端构成差置调车信号机（§2.6.2(3) PDF p.32／书 22 页）：终端阻拦信号机为差置或并置信号机时，调车进路终端按钮须按与其背向的差置/并置按钮（即 D₃A）以明确区分调车方向与终端位置。',
      ref: '第 2.3.2 节，书内 12—16 页／PDF 22—26 页；图 2.3.2、图 3.1.1、表 3.2.2。'
    }
  };

  // 期末核心考点与故障实操闯关题库（对应全书第 1—13 章 12 大高频核心考点）
  const EXAM_BANK = [
    {
      title: '考点 1（练习题1 & 图4.1.7）｜继电器“常态”与“失电常开/常闭”辨析',
      question: '轨道继电器 GJ、定位表示继电器 DBJ、道岔锁闭继电器 SJ 在铁路信号规定中“常态”均为吸起（↑）。请问它们在常态下是后接点闭合还是前接点闭合？为什么？',
      answer: '在铁路规定常态（吸起 ↑）下，它们的【前接点 11-12 闭合、后接点 11-13 断开】！教材 4.1.2 节明确指出：“常开/常闭”仅指继电器完全失电时的接点状态；而铁路信号“常态”按所对应信号设备的通常状态（无车空闲、道岔定位、未锁闭）确定，且必须满足“释放（落下）对应安全侧”。',
      load: { mode: 'bench', type: 'contacts', polarity: 1, explode: 0 }
    },
    {
      title: '考点 2（练习题4 & 图4.2.2）｜自闭电路三大组成与 4 步工作时序',
      question: '在图 4.2.2(b) 自闭电路中，自复式按钮 A 按下使 AJ 吸起后，松开按钮 A 为什么 AJ 不会落下？若要使 AJ 复原落下，必须由哪个继电器动作？',
      answer: '因为 AJ 吸起时闭合了自身前接点 AJ(11-12)，构成了绕过按钮 A 的“自闭支路”（KZ → FUJ后接点11-13 → AJ前接点11-12 → AJ线圈 → KF）。只有当复原继电器 FUJ 励磁吸起、断开共用电路上的后接点 FUJ(11-13) 时，AJ 才会失磁复原落下。',
      load: { mode: 'bench', type: 'selfHold', shButton: false, shLatched: true, shFujPicked: false, shWireBreak: false, shCrossFault: 'none', explode: 0 }
    },
    {
      title: '考点 3（练习题5 & 图4.3.2）｜电缆混线防护：远端供电（位置法）原理',
      question: '对比图 4.3.2(a) 与图 4.3.2(b)：当室外长电缆两芯线发生混线（短路）故障时，为什么把电源 KZ/KF 移到室外转辙机侧（位置法）就能防止室内 DBJ 错误吸起？',
      answer: '图 4.3.2(a) 将电源与继电器同置室内，电缆混线会直接绕过室外开闭器接点把电源接通到 DBJ 线圈造成致命误吸起；图 4.3.2(b) 采用“远端供电（位置法）”，将电源与继电器分置在故障易发电缆的两端，混线时直接将电源正负极短路（烧断熔丝），使 DBJ 线圈失去电压而可靠落下！',
      load: { mode: 'bench', type: 'selfHold', shButton: false, shLatched: false, shFujPicked: false, shWireBreak: false, shCrossMethod: 'position', shCrossFault: 'active', shShuntLineBreak: false, explode: 0 }
    },
    {
      title: '考点 4（练习题15 & 图5.2.2）｜道岔 1DQJ 为何兼具 125Ω 圈、0.44Ω 圈与铜套缓放？',
      question: '在四线制道岔控制电路中，1DQJ (JWJXC-H125/0.44) 在 2DQJ 转极瞬间为什么不会落下？转辙机电机启动后，1DQJ 靠哪个线圈维持自闭？',
      answer: '①在 2DQJ 转极瞬间，1DQJ 的 3-4 启动前圈（125 Ω）回路被 2DQJ 第4组接点切断，此时全靠铁芯上的【紫铜阻尼铜套感应涡流缓放（≥0.45 s）】维持 1DQJ 不落；②2DQJ 转极完成后，直流电动机的动作大电流（约 2 A）流经与电机串联的【1DQJ 1-2 低阻电流后圈（0.44 Ω）】实现自闭，脱离 SJ 控制确保道岔一经启动必转到底。',
      load: { mode: 'bench', type: 'turnoutLab', toStage: 2, toObstacle: false, toLidOpen: false, explode: 0 }
    },
    {
      title: '考点 5（第5.2.2节 & 图5.2.3）｜道岔尖轨夹异物受阻与自动开闭器 B 爪超前转换',
      question: '当道岔由定位向反位转换中途因尖轨夹异物受阻时，电机发生什么现象？为什么此时能通过单操定位将道岔转回定位？',
      answer: '尖轨受阻时摩擦连接器空转，1DQJ(1-2 低阻后圈 0.44 Ω) 持续有大电流维持吸起，若 13~30 s 内不处理将烧断 3 A 熔丝 RD₂。因为道岔刚一解锁启动，自动开闭器的【B 爪已先行动作（断开 31-32，闭合 41-42）】准备好了 X1 线反转回定位的通路，所以值班员单操定位使 2DQJ 转回定位即可驱动电机反转退回定位！',
      load: { mode: 'bench', type: 'turnoutLab', toStage: 3, toObstacle: true, toLidOpen: false, explode: 0 }
    },
    {
      title: '考点 6（第5.1.2节 & 练习题24）｜进站信号机红灯断丝防护与防止自动重复开放',
      question: '进站信号机 X 已开放黄灯 U，若此时发生灯丝故障或道岔失表示使信号机降级关闭回红灯 H；当故障排除恢复正常后，信号机 X 会自动重新开放黄灯吗？为什么？',
      answer: '绝对不会自动重新开放！教材练习题 24 与第 7.6 节明确规定：信号开放后 FKJ 即复原落下（此时 KJ 仍自闭维持锁闭状态直到进路开始解锁），LXJ 靠自身前接点自闭；一旦因灯丝断丝（DJ↓）或道岔失表示导致 LXJ 失磁落下，自闭前接点即断开锁存。即便故障恢复，也必须由值班员重新按压始端按钮使 FKJ↑ 重新励磁才能再次开放信号！',
      load: { mode: 'station', stationRoute: 'IG', stationStage: 5, stationTrain: -26, lampFault: true, switchFault: false, cancelMode: 'none', explode: 0 }
    },
    {
      title: '考点 7（第3.3.3/9.5节 & 练习题18）｜取消进路（ZQA）与总人工解锁（ZRA 延时）对比',
      question: '当列车已经压入接近区段 X3JG（构成接近锁闭 JYJ ↓）时，值班员按压“总取消按钮 ZQA + 始端按钮 XLA”能解锁进路吗？正确做法是什么？',
      answer: '不能解锁！总取消（ZQA）检查 JYJ 前接点（接近区段无车），在接近锁闭（JYJ↓）时按压 ZQA 只能关闭信号机 X，进路仍保持锁闭（SJ↓）。正确做法是办理“总人工解锁（ZRA + XLA）”：先关闭信号机 X，同时启动时间继电器 JSBXC-850 计时【正线接车延时 3 min】，确认列车停稳未冒进后方才解锁。',
      load: { mode: 'station', stationRoute: 'IG', stationStage: 5, stationTrain: -10, lampFault: false, switchFault: false, cancelMode: 'zqa', explode: 0 }
    },
    {
      title: '考点 8（第6.4.4/9.3节）｜6502“三点检查”与 FDGJ 3s 缓放防提前解锁',
      question: '列车正在 7-11DG（11号道岔区段）上运行、尚未进入股道 IG 时，若 7-11DG 发生瞬间分路不良（11DGJ 短时误吸起），11 号道岔会提前错误解锁吗？',
      answer: '绝不会提前解锁！①根据 6502 进路解锁“三点检查”第三点，本区段 2LJ 吸起必须检查下一区段（IG）已被列车占用；此时列车尚未进入 IG，13 线不通，2LJ 保持落下；②此外 FDGJ（JWXC-H340 + RC）具有 3~4 s 断电缓放特性，瞬间分路不良期间 FDGJ 前接点不落，双重闭锁道岔严防车下扳动！',
      load: { mode: 'station', stationRoute: 'IG', stationStage: 5, stationTrain: 70, poorShunt: true, cancelMode: 'none', explode: 0 }
    },
    {
      title: '考点 9（第4.3.2节 & 图4.3.3–4.3.5）｜5 种防混线方法对比与“分路法”非故障安全缺陷',
      question: '教材第 4.3.2 节对比了位置法、极性法、双断法、独立电源法和分路法（等电位法）五种防混线方式。为什么“分路法（图4.3.5）”不满足完全故障—安全原则？',
      answer: '分路法平时靠闭合的局部防混分路线将 KJF 线圈短路；一旦【分路线自身发生断线】，平时无危险显现不受闭路监督；此时若长电缆再发生混线短路，电流便不再被分路线旁路而直接使 KJF 错误吸起！故仅在特定调车/辅助控制中使用。',
      load: { mode: 'bench', type: 'selfHold', shCrossMethod: 'shunt', shCrossFault: 'active', shShuntLineBreak: true, shButton: false, shLatched: false, explode: 0 }
    },
    {
      title: '考点 10（第5.2.3节 & 图5.2.4–5.2.8）｜S700K 五线制三相道岔与 BHJ 断相保护',
      question: '在 S700K 五线制三相交流道岔控制电路中，若三相动作电源任意一相发生断线（缺相），哪组元件第一时间动作切断电机？五线制表示电路与四线制有何关键不同？',
      answer: '①缺相时室内三相断相保护器 DBQ 无输出，保护继电器 BHJ 立即释放落下，切断 1DQJ/1DQJF 自闭回路防止三相电机缺相烧毁；②五线制表示电路取消了滤波电容 C，改为在 DBJ/FBJ 两端并联 R₂(300Ω/50W) 与整流二极管 Z，且串联检查室外三相电机绕组完好！',
      load: { mode: 'bench', type: 'fiveWireLab', fwStage: 3, fwPhaseLoss: true, fwLidOpen: false, explode: 0 }
    },
    {
      title: '考点 11（第9.6节 & 图9.6.1 / 8.4节）｜CJ 快吸慢放特性与 SGA+ZRA 区段故障解锁',
      question: '当列车完整出清进路后，若 7-11DG 因分路遗留白光带卡锁（CJ/2LJ↓ 未解），办理“区段故障解锁（SGA+ZRA）”前为什么必须先确认区段空闲且本区段 QJJ 已落下？',
      answer: '区故解（图 9.6.1）是越过“三点检查”的人工应急解锁：按压 SGA+ZRA 时，12/13 线通过并检 DGJF↑（证明轨道当前确实空闲 DGJ↑）与 QJJ↓（证明不在进路锁闭建立过程），先吸起 CJ(快吸↑) 再使 1LJ/2LJ/SJ↑；若车仍压区段（DGJ↓），区故解将被闭锁！',
      load: { mode: 'station', stationRoute: 'IG', stationStage: 5, stationTrain: 115, blindFault: 'stuckSection', cancelMode: 'none', stationNetView: 'line12_13', explode: 0 }
    },
    {
      title: '考点 12（第13.2.2节 & 图13.2.3–13.2.4）｜计算机联锁动态驱动与卡死常高“1”故障安全',
      question: '若计算机联锁 CPU 芯片失效导致某个控制输出口永远卡死在“高电平 1”，如何保证室外现场执行继电器 J (JPXC-1000) 绝不会保持误吸起？',
      answer: '硬件上强制采用“动态脉冲 → 交流隔离（脉冲变压器 T 或互补三极管电荷泵 C1·C2）→ 静态整流”驱动架构（图 13.2.3/13.2.4）。CPU 卡死常高电平“1”相当于直流稳态，脉冲变压器 dΦ/dt = 0 次级无感应电压（电容泵亦无周期充放电），J 可靠 0V 落下导向安全侧！',
      load: { mode: 'bench', type: 'cbiIoLab', cbiMode: 'pulseTrans', cbiCmd: true, cbiFault: 'stuckHigh', explode: 0 }
    }
  ];
  let currentQuizIndex = 0;

  // 原生 Web Audio 真实机械音效合成器（零外部音频依赖）
  let audioCtx = null;
  function playSound(kind) {
    const soundEl = $('sound');
    if (reduced || (soundEl && !soundEl.checked)) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      if (kind === 'clickUp' || kind === 'clickDown') {
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(kind === 'clickUp' ? 1180 : 620, now);
        osc.frequency.exponentialRampToValueAtTime(kind === 'clickUp' ? 380 : 175, now + .038);
        gain.gain.setValueAtTime(.14, now);
        gain.gain.exponentialRampToValueAtTime(.001, now + .042);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(now); osc.stop(now + .045);
      } else if (kind === 'bell') {
        for (const freq of [960, 1440]) {
          const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(.09, now);
          gain.gain.exponentialRampToValueAtTime(.001, now + .45);
          osc.connect(gain); gain.connect(audioCtx.destination);
          osc.start(now); osc.stop(now + .46);
        }
      } else if (kind === 'motor') {
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(135, now);
        osc.frequency.linearRampToValueAtTime(168, now + .18);
        gain.gain.setValueAtTime(.05, now);
        gain.gain.exponentialRampToValueAtTime(.001, now + .22);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(now); osc.stop(now + .24);
      }
    } catch (_) { /* ignore audio policy errors */ }
  }

  const parts = {
    coil: ['双线圈 (1-2 / 3-4)', '导线绕制在绝缘线轴上，通电产生磁动势。AX 型继电器铁芯上套有前圈(3-4)、后圈(1-2)两段线圈，可串联或分接使用。'],
    copperSleeve: ['紫铜阻尼铜套（缓放核心）', '模型以阻尼铜套表达缓放机理，各型号阻尼部件的具体形态与安装位置尚待装配图核实。断电瞬间磁通衰减在铜套内感应出闭合涡流，阻碍磁通变化，延缓释放。表4.1.4中JWXC-H340在24V下≥0.5s，JWJXC-H125/0.44在24V下>0.45s，JZXC-H62在表列点灯条件下>0.15s。外接RC的FDGJ应用另见第9章。'],
    timer: ['半导体延时功能 (3′)', '表4.1.2标注“3′”的时间继电器电子延时单元。通电后按定时回路计时，到达规定延时（如 30 s 或 3 min）后才驱动电磁执行机构吸起。'],
    core: ['电工纯铁铁芯', '为磁通提供低磁阻通路。安全型继电器采用残磁极小的电工纯铁，防止断电后因剩磁过大而粘连。'],
    yoke: ['L 形导磁轭铁', '右端与铁芯紧固连接，上端棱角支承衔铁转轴，与铁芯、极靴和衔铁共同构成闭合磁路。'],
    pole: ['极靴与非磁性止片 (δ₀)', '铁芯左端扩大的圆盘形极靴以增大气隙磁通面积；衔铁内侧装有非磁性止片（图4.1.3中的 δ₀），吸合时保留规定工作气隙，防止剩磁粘连。'],
    armature: ['衔铁（或感应翼片）', '将电磁吸力转换为机械角位移，经拉杆带动接点组。具体轴销与安装尺寸尚需厂家装配图核实。'],
    weight: ['重锤片（重力返回）', '悬挂于衔铁水平臂下方的配重铁片（图4.1.1b、4.1.3）。断电后依靠重锤片重力产生可靠返回力矩，强制拉开前接点并闭合后接点。'],
    rod: ['拉杆与绝缘推珠', '下端与衔铁右端拨叉铰接，杆身通过绝缘推珠卡入各组中接点簧片，将衔铁运动同步传递给各接点组，并保证各组接点彼此电气绝缘。'],
    front: ['前接点（或定位接点）及上托片', '吸起（或定位）稳态时与中接点闭合。上方配有图4.1.3所示的上托片，限定前接点初始位置并在吸合时提供规定接点压力。'],
    back: ['后接点（或反位接点）及下托片', '落下（或反位）稳态时与中接点闭合。下方配有图4.1.3所示的下托片。JZXC-480 的 2Q 组与 JWJXC-H125/0.44 的 2QJ 组无后接点。'],
    common: ['中接点（动接点簧片）', '随拉杆升降在前、后接点之间先断后接转换。普通接点编号 11(中)—12(前)—13(后)；极性保持接点编号 111(中)—112(定)—113(反)。'],
    contactBlock: ['接点支架', '固定各组静、动接点簧片。拆解时向右上独立分离，与背板及拉杆互不干涉。'],
    permanent: ['永久磁铁 (N—S)', 'JPXC-1000 在极靴下部设 L 形永久磁铁（图4.1.4，产生局部保持磁通 Φ永）；JYJXC-220/220 将永久磁铁（左N右S）与轭铁相接（图4.1.5，断电保持定位/反位）。'],
    rectifier: ['内部整流模块', 'JZXC-480 与 JZXC-H62 内部将输入的交流电整流为单向脉动直流供给电磁线圈。'],
    trackCoil: ['轨道线圈 3—4（含 Z、HF）', '图5.3.3中接收室外钢轨传来的 25 Hz 轨道信号；室内跨接防雷补偿器 Z 与 25 Hz 防护盒 HF。'],
    localCoil: ['局部线圈 1—2（含并接电容 C）', '图5.3.3中接室内独立 25 Hz 局部电源，并接电容 C 改善功率因数与移相特性。'],
    terminals: ['线圈端子 1—2—3—4', '对应图4.1.3—4.1.5的线圈引出端，随磁路组件整体移动。'],
    base: ['底座、插座背板与鉴别销', '支撑继电器并由右侧胶木背板引出插片与表4.1.4规定的专属鉴别销号码，防止不同型号继电器误插。'],
    cover: ['透明防尘外壳', '包覆继电器内部机构以便观察接点状态并防尘。'],
    pantograph: ['单臂受电弓', '绝缘子支承弓架，弓头碳滑板与接触线接触受流。模型可升降，需弓升、接触网有电、主断路器闭合才能提供牵引条件。机构形态为照片参考示意，弓网接触力和燃弧未建模。'],
    catenary: ['接触网接触线', '为电力动车组供电，受电弓弓头沿接触线滑动受流。此处显示接触线与弓头高度关系，供电开关可用于演示失去牵引后的惰行。'],
    train: ['CR400AF基础型外观参考', '在站场沙盘中模拟列车从接近区段 X3JG 顺序驶入 IAG → 1DG → 7-11DG → IG(正线)/3G(侧线) 的全过程。'],
    wheel: ['导电轮对（前轮／后轮）', '左右车轮与金属车轴构成低阻分路，将轨面电压短路使 DGJ 落下、FDGJ 吸起，驱动三点检查逐段解锁。'],
    rail: ['站场轨道区段（X3JG/IAG/1DG/7-11DG/IG/3G）', '绿条表示空闲未锁闭；青白条表示进路锁闭（白光带）；红条表示轮对分路占用（红光带）；琥珀条表示出清后 FDGJ 正在进行 3 s 缓放延时解锁。'],
    insulation: ['钢轨绝缘节', '划分站内各独立轨道区段（图3.1.1）。列车必须前轮越过下一区段绝缘节、后轮出清本区段绝缘节并经 3 s 缓放，本区段才解锁。'],
    signalX: ['进站/出站/调车色灯信号机群', '图 3.1.1 下行咽喉全部 10 架信号机（X、X_F、S₁/SⅡ/S₃/S₄、D₁/D₃/D₅/D₇）按第 2.3 节建模：常态亮红灯 H 或蓝灯 A；随进路条件开放 U / UU / L / B，压入内方首区段立即关闭（调车白灯保留至越过）。'],
    switchMachine: ['道岔群 (1/3、5/7、9、11) 与转辙控制继电器', '按照表 3.2.2 精确操动双动渡线 1/3、5/7 及单动 9、11：DCJ/FCJ↑ → 1DQJ(125Ω/0.44Ω)↑ → 2DQJ 转极 → 尖轨密贴到位后 DBJ/FBJ(JPXC-1000)↑。'],
    rackRelay: ['组合架继电器（6502联锁 LAJ/LJJ/FKJ/KJ/XJJ/QJJ/SJ/1LJ/2LJ）', '按教材第 6.4 节与第 7—9 章时序工作：1-6线选排(LAJ/LJJ/DCJ) → 7线选排一致(FKJ/KJ↑) → 8-9线锁闭(XJJ/QJJ↑ → SJ/1LJ/2LJ↓) → 11线开放信号(LXJ↑) → 12-13线三点检查解锁(1LJ↑ → 2LJ↑ → FDGJ缓放↓ → CJ↑ → QJJ↓ → SJ↑)。'],
    rackUnit: ['信号楼继电器组合架（图6.2.4）', '室内集中安装各类安全型继电器的定型组合架，实现室外设备采集驱动与室内联锁逻辑运算。'],
    foundation: ['钢筋混凝土基础座与法兰锚栓', '稳定固定信号机立柱或矮型铸铁箱体于线路两侧限界外侧。拖动“拆解”滑块时向下独立分离，方便观察法兰锚栓定位结构。'],
    mast: ['信号机钢管柱体 / 矮型立柱与抱箍', '高柱信号机采用冷镀锌钢管柱配铸铁抱箍，下部涂有黑白警示带；矮型信号机设双立柱底座以避开站线限界、扩大股道有效长。'],
    plate: ['信号机白底黑字编号铭牌', '规范命名标示（第2.3节）：下行进站 X、反向进站 X_F、预告 YX、出站 S₁/SⅡ/S₃/S₄、调车 D₁~D₈（下行单号）。'],
    transformer: ['XB 丝箱与灯丝转换变压器（图5.1.2/5.1.3）', '内置 BX-30 点灯变压器与转换回路端子；串联室内灯丝监督继电器 DJ，实现主灯丝断丝后自动转换副灯丝。'],
    ladder: ['背面钢制检修爬梯与护圈', '高柱信号机背面装配双纵梁防滑爬梯与顶部防坠安全围栏，供信号工登高擦拭透镜与更换双丝灯泡。'],
    shield: ['带银白反光镶边的黑色椭圆背板', '通过黑底椭圆盾牌与反光白边增强铁路信号显示昼夜识别度与对比度，消除背后背景光干扰。'],
    housing: ['分段铸铝灯机构壳体与封闭空位 ⊗', '多灯位信号机将机构分箱（如进站 a 型 2+2+1 三机构）；矮型 b 型中不使用的空槽（⊗）用实体交叉盲板严密封堵。'],
    hood: ['斜口防眩遮光檐（遮阳帽）', '长弧形内哑黑遮光檐伸出透镜前方并略微下斜，防止日光直射造成假显示（幻影）并集中有效视距。'],
    lens: ['外阶梯菲涅尔玻璃与有色滤色片', '内层高精度光学色片产生铁路标准色（红H/黄U/绿L/月白B/蓝A），外层同心阶梯菲涅尔透镜将光束聚成远距平行信号光柱。'],
    optics: ['抛物面镀铬反光碗', '位于信号灯泡后方的抛物面聚光反射碗，把灯泡后半球发射光线全部前向准直反射，大大提高信号穿透力。'],
    filament: ['双灯丝灯泡 H₁（主丝）与 H₂（副丝）', '铁路信号专用双灯丝灯泡：平时仅通电点亮主灯丝 H₁；主丝熔断时 DZJ 落下切换至副灯丝 H₂ 维持信号亮灯，确保红灯不灭。'],
    indicator: ['发车进路 / 方向表示器（图5.1.3 / 表3.2.2）', '当出站信号机有两个及以上发车方向时加装表示器（表 3.2.2 第 5–8 条亮“右”向指示）；开放前先检表示器灯丝 3DJ↑。']
  };

  const STAGE_NAMES = [
    '阶段 0 · 站场常态（区段空闲 DGJ↑ · 道岔解锁 SJ↑ · X 红灯 H）',
    '阶段 1 · 按压始终端按钮 XLA → S₁LA/S₃LA（LAJ↑ 自闭 · LJJ↑ 方向电源）',
    '阶段 2 · 5-6线选岔与道岔转换（DCJ/FCJ↑ → 1DQJ↑ → 2DQJ转极 → 转辙机动作）',
    '阶段 3 · 7线选排一致检查（道岔 DBJ/FBJ↑ → FKJ↑ → KJ↑ 始端记录）',
    '阶段 4 · 8-9线进路锁闭（XJJ↑ → QJJ↑ → SJ↓ 1LJ↓ 2LJ↓ · 控制台点白光带）',
    '阶段 5 · 11线开放信号与列车运行三点检查逐段解锁（LXJ↑ → 压入IAG关信号 → 逐段解锁）'
  ];

  const TURNOUT_STAGE_NAMES = [
    '阶段 0 · 定位稳态（第1/3排闭合 · 14-13/34-33/32-31 经 Z 半波整流 · DBJ↑ 1正4负吸起）',
    '阶段 1 · 操岔启动（SJ↑·FCJ↑ → 1DQJ 3-4前圈 125Ω 励磁↑ → 切断 DBJ → 接通 2DQJ）',
    '阶段 2 · 2DQJ转极瞬间（2DQJ第4组切断 1DQJ 3-4圈 · 靠紫铜阻尼铜套涡流缓放≥0.45s保持不落）',
    '阶段 3 · 电机M旋转转换（2DQJ反位 → 1DQJ 1-2后圈 0.44Ω 串电机M自闭 · 内侧B爪先匀速闭合41-42）',
    '阶段 4 · 反位密贴到位（外侧A爪速动断开11-12/闭合第2排21-22·23-24 → 1DQJ↓ → 反位表示 FBJ↑）'
  ];

  const FIVEWIRE_STAGE_NAMES = [
    '阶段 0 · 定位稳态（BB AC110V 经 X1/X2/X4 与室外并联 Z+R₂ · 取消电容 C · DBJ↑）',
    '阶段 1 · 一级启动（SJ↑·DGJ↑·FCJ↑ → 1DQJ 3-4励磁↑ → 经1DQJ前接点吸起 1DQJF↑）',
    '阶段 2 · 二级转极（1DQJF 驱动 2DQJ 换相 B/C 改为 W-V-U 逆时针 · 1DQJ 铜套缓放保持↑）',
    '阶段 3 · 三级自闭转换（三相 AC380V 经 X1/X3/X4 驱动 S700K → DBQ 输出使 BHJ↑ 自闭 1DQJ 1-2）',
    '阶段 4 · 反位密贴到位（第1排切断三相电流 → DBQ 失流 → BHJ↓ 断自闭 → X1/X3/X5 并联 Z+R₂ 使 FBJ↑）'
  ];

  let s = L.initial(), result = L.evaluate(s), pose = 0, branchPose = 0, timerProgress = 0, relayTiming = null, playing = false, stationAutoTimer = 0, shAutoStep = 0;
  let renderer, scene, camera, model, branchModel, track, selectionBox, selectedPart, labelAnchors = [];
  let yaw = .6, pitch = .4, distance = 11.7, panX = 0, panY = 0, lastFrame = performance.now(), orbitDirty = true;
  const target = { x: 0, y: 2, z: 0 }, raycaster = window.THREE ? new THREE.Raycaster() : null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let toastTimer, currentFigure = null, lastContactKey = '', lastRecordKey = '', elapsed = 0, lastTrainUI = 0, activePipDef = null;
  const timeline = [];
  const J = window.RailwayJourney;
  const COMPARISONS = {
    polarity: ['neutral', 'biased'], memory: ['neutral', 'latching'],
    release: ['neutral', 'slowRelease'], delay: ['slowRelease', 'timeRelay']
  };
  let comparisonKey = '', comparisonTiming = null, comparisonLatched = false, typeBeforeComparison = null;
  let contactFocus = false, contactStep = null, trainFocused = false, selectedSourceType = null;
  let blindStuckConfirmed = false;
  let pantographPose = 1;
  let trainMotion = { speed: 0 }, trainMotionB = { speed: 0 }, lastTimingFrame = performance.now();
  let stationSpeedScale = 0.35, pauseOnRelayChange = false, relayPauseTimer = 0;
  let sceneDirty = true, labelsDirty = true;
  let lastRelaySnap = null, recentRelayChanges = [], changedMatrixKeys = new Set();

  function collectRelaySnapshot(st) {
    if (!st || !st.relays) return null;
    const rl = st.relays, rt = st.routeSpec || { sig: 'X' };
    const snap = {
      __route: st.routeType,
      __stg: st.stg,
      LXJ: { v: rl.LXJ, m: 'LXJ', l: st.isShunt ? 'DXJ' : 'LXJ' },
      YXJ: { v: rl.YXJ, m: 'YXJ', l: 'YXJ(引导)' },
      SIG: { v: st.signals ? st.signals[rt.sig] : st.signalAspect, m: 'LXJ', l: `信号 ${rt.sig}` },
      JYJ: { v: rl.JYJ, m: 'JYJ', l: 'JYJ(接近)' },
      KJ: { v: rl.KJ, m: 'KJ', l: 'KJ(7线)' },
      FKJ: { v: rl.FKJ, m: 'FKJ', l: 'FKJ' },
      XJJ: { v: rl.XJJ, m: 'XJJ', l: 'XJJ(8线)' },
      GJJ: { v: rl.GJJ, m: 'ZCJ', l: 'GJJ' },
      ZCJ: { v: rl.ZCJ, m: 'ZCJ', l: 'ZCJ(照查)' },
      DJ: { v: rl.DJ, m: 'DJ', l: 'DJ(灯丝)' }
    };
    if (Array.isArray(st.controlledChain)) {
      for (const c of st.controlledChain) {
        snap[`${c.id}_DGJ`] = { v: !c.occ, m: 'DGJ', l: `${c.label}·DGJ` };
        snap[`${c.id}_QJJ`] = { v: c.qjj, m: 'QJJ', l: `${c.label}·QJJ` };
        snap[`${c.id}_LJ1`] = { v: c.l1, m: 'LJ1', l: `${c.label}·1LJ` };
        snap[`${c.id}_LJ2`] = { v: c.l2, m: 'LJ2', l: `${c.label}·2LJ` };
        snap[`${c.id}_FDGJ`] = { v: c.occ || c.slow, m: 'FDGJ', l: `${c.label}·FDGJ` };
        snap[`${c.id}_SJ`] = { v: c.unlocked && !c.occ, m: 'SJ', l: `${c.label}·SJ` };
      }
    }
    if (st.multiTrain && st.multiTrain.active && st.multiTrain.sigB) {
      snap.SIG_B = { v: st.signals ? st.signals[st.multiTrain.sigB] : st.multiTrain.sigAspectB, m: 'LXJ', l: `二车信号 ${st.multiTrain.sigB}` };
      snap.B_WAIT = { v: st.multiTrain.bCanLockNow, m: 'SJ', l: '二号车进路锁闭开放' };
      if (st.multiTrain.routeSpecB && st.secStates) {
        for (const cid of st.multiTrain.routeSpecB.ctrl || []) {
          const sec = st.secStates[cid];
          if (!sec) continue;
          const lbl = cid === '11DG' ? '7-11DG' : cid;
          snap[`B_${cid}_FDGJ`] = { v: !!(sec.occ || sec.slow), m: 'FDGJ', l: `二车${lbl}·FDGJ` };
          snap[`B_${cid}_SJ`] = { v: !!(sec.unlocked && !sec.occ), m: 'SJ', l: `二车${lbl}·SJ` };
        }
      }
    }
    return snap;
  }

  function recordRelayDiff(prevSnap, nextSt) {
    const nextSnap = collectRelaySnapshot(nextSt);
    if (!nextSnap) return [];
    if (!prevSnap || prevSnap.__route !== nextSnap.__route) {
      lastRelaySnap = nextSnap;
      recentRelayChanges = [];
      changedMatrixKeys = new Set();
      return [];
    }
    const changes = [];
    const mKeys = new Set();
    for (const [k, cur] of Object.entries(nextSnap)) {
      if (k.startsWith('__')) continue;
      const old = prevSnap[k];
      if (old && old.v !== cur.v) {
        const isBool = typeof cur.v === 'boolean';
        const fromStr = isBool ? (old.v ? '↑' : '↓') : String(old.v);
        const toStr = isBool ? (cur.v ? '↑' : '↓') : String(cur.v);
        changes.push({ key: k, mKey: cur.m, label: cur.l, text: `${cur.l} ${fromStr}➔${toStr}`, isDown: isBool ? !cur.v : ['H', 'A', 'DARK'].includes(cur.v) });
        mKeys.add(cur.m);
      }
    }
    lastRelaySnap = nextSnap;
    if (changes.length > 0) {
      recentRelayChanges = changes;
      changedMatrixKeys = mKeys;
    }
    return changes;
  }

  function renderRelayChangeBanner() {
    const el = $('relay-change-banner');
    if (!el) return;
    if (s.mode !== 'station') { el.hidden = true; return; }
    el.hidden = false;
    const pauseTag = relayPauseTimer > 0 ? `<span style="color:#ffcb6b;font-weight:700">⏸ 定格观察 (${relayPauseTimer.toFixed(1)}s)</span>` : '';
    if (recentRelayChanges.length > 0) {
      const chips = recentRelayChanges.slice(0, 7).map(c => `<span class="relay-change-chip${c.isDown ? ' down' : ''}">${c.text}</span>`).join('');
      el.innerHTML = `<strong style="color:var(--accent)">⚡ 刚变化的继电器/信号：</strong>${chips}${pauseTag}`;
    } else {
      el.innerHTML = `<span style="color:#9ec0d8">💡 提示：点击【<strong>⏭ 步进到下一继电器变化</strong>】可每次精准跑停在下一个继电器/信号机跳变瞬间，或调至 0.2× 极慢细看！</span>`;
    }
  }

  function computeStationMaxPos(st) {
    const mt = st && st.multiTrain;
    const isShuntA = !!(st && st.isShunt);
    const maxPosA = (mt && mt.active && mt.mode === 'track_occupied' && st.routeSpec.terminal === 'IG')
      ? (isShuntA ? 96 : 102)
      : (isShuntA ? 105 : 130);
    let maxPosB = mt && mt.routeSpecB && mt.routeSpecB.kind === 'shunt' ? 105 : 130;
    if (mt && mt.active && mt.mode === 'conflict_queue' && typeof mt.maxFollowB === 'number') {
      maxPosB = Math.min(maxPosB, mt.maxFollowB);
    }
    return { maxPosA, maxPosB };
  }

  function stepStationPhysics(curState, motionA, motionB, dt, pantoPoseVal, speedScale) {
    const ev = L.evaluate(curState).station;
    const direction = curState.stationDirection || 1;
    const sigOpen = ev.relays.LXJ || ev.relays.YXJ;
    const { maxPosA, maxPosB } = computeStationMaxPos(ev);
    const effState = { ...curState, pantograph: curState.pantograph !== false && pantoPoseVal > .98 };
    const atRedStopA = direction > 0 && curState.stationTrain >= -12 && curState.stationTrain < 0 && !sigOpen;
    const atEndA = direction > 0 ? curState.stationTrain >= maxPosA : curState.stationTrain <= -30;
    const canMoveA = !atRedStopA && !atEndA && (direction < 0 || curState.stationTrain >= 0 || sigOpen || curState.stationTrain < -12);
    const nextMotionA = L.advanceTrain(motionA, effState, dt, canMoveA);
    let positionA = curState.stationTrain + direction * nextMotionA.distance * speedScale;
    let hitRedStopA = false;
    if (direction > 0 && curState.stationTrain < 0 && !sigOpen && positionA >= -12) {
      positionA = Math.max(curState.stationTrain, -12);
      nextMotionA.speed = 0;
      hitRedStopA = curState.stationTrain < -12;
    }
    const nextTrainA = Math.max(-30, Math.min(maxPosA, positionA));
    if ((direction > 0 && nextTrainA >= maxPosA) || (direction < 0 && nextTrainA <= -30)) {
      nextMotionA.speed = 0;
    }
    const patch = { stationTrain: nextTrainA };

    let nextMotionB = motionB ? { ...motionB } : { speed: 0 };
    const mt = ev.multiTrain;
    if (mt && mt.active && mt.mode !== 'track_occupied') {
      const sigOpenB = mt.lxjB;
      const posB0 = mt.trainB ?? (curState.secondTrain ?? -26);
      const atRedStopB = posB0 >= -12 && posB0 < 0 && !sigOpenB;
      const atEndB = posB0 >= maxPosB;
      const canMoveB = !atRedStopB && !atEndB && (posB0 >= 0 || sigOpenB || posB0 < -12);
      nextMotionB = L.advanceTrain(nextMotionB, effState, dt, canMoveB);
      let posB = posB0 + nextMotionB.distance * speedScale;
      if (posB0 < 0 && !sigOpenB && posB >= -12) {
        posB = Math.max(posB0, -12);
        nextMotionB.speed = 0;
      }
      const nextTrainB = Math.max(-30, Math.min(maxPosB, posB));
      if (nextTrainB >= maxPosB) nextMotionB.speed = 0;
      patch.secondTrain = nextTrainB;
    }
    return { patch, motionA: nextMotionA, motionB: nextMotionB, hitRedStopA, maxPosA, maxPosB, sigOpen, canMoveA };
  }

  function stepToNextRelayChange() {
    playing = false;
    relayPauseTimer = 0;
    if (s.mode !== 'station') return;
    if (s.stationStage < 5) {
      set({ stationStage: s.stationStage + 1 });
      return;
    }
    const stInit = result.station;
    const mt = stInit && stInit.multiTrain;
    const direction = s.stationDirection || 1;
    const { maxPosA, maxPosB } = computeStationMaxPos(stInit);
    const hasIndependentTimer = !!(stInit.zraCounting || stInit.dg11Slow || stInit.dg1Slow || stInit.iagSlow || stInit.anySectionSlow || (stInit.guideActive && stInit.guideFirstSecFault && stInit.relays.YXJ));
    const endAInit = direction > 0 ? s.stationTrain >= maxPosA : s.stationTrain <= -30;
    const endBInit = !mt || !mt.active || mt.mode === 'track_occupied' || (mt.trainB ?? -26) >= maxPosB;
    if (direction > 0 && endAInit && endBInit && !hasIndependentTimer) {
      trainMotion = { speed: 0 }; trainMotionB = { speed: 0 };
      set({ stationStage: 5, stationTrain: -26, secondTrain: (L.MULTI_TRAIN_SCENARIOS && L.MULTI_TRAIN_SCENARIOS[s.multiTrainMode]?.initTrainB) ?? (s.multiTrainMode === 'track_occupied' ? 126 : -26), stationHistory: null, cancelMode: 'none', zraProgress: 0 });
      return;
    }

    const baseSnap = collectRelaySnapshot(stInit);
    let cur = s;
    let mA = { ...trainMotion }, mB = { ...trainMotionB };
    let pPose = pantographPose;
    const stepDt = 0.1;
    let found = [];
    let blockedReason = '';

    for (let step = 0; step < 600; step++) {
      pPose += Math.sign(Number(cur.pantograph) - pPose) * Math.min(Math.abs(Number(cur.pantograph) - pPose), stepDt / .8);
      const phys = stepStationPhysics(cur, mA, mB, stepDt, pPose, stationSpeedScale);
      mA = phys.motionA;
      mB = phys.motionB;
      const prevA = cur.stationTrain, prevB = cur.secondTrain;
      cur = L.update(cur, phys.patch);
      cur = L.advanceStation(cur, stepDt);
      const nextSt = L.evaluate(cur).station;
      found = recordRelayDiff(baseSnap, nextSt);
      if (found.length > 0) break;

      const timerRunning = !!(nextSt.zraCounting || nextSt.dg11Slow || nextSt.dg1Slow || nextSt.iagSlow || nextSt.anySectionSlow || (nextSt.guideActive && nextSt.guideFirstSecFault && nextSt.relays.YXJ) || (cur.stationHistory && Object.values(cur.stationHistory.sections).some(sec => sec.remaining > 0)) || (cur.secondHistory && Object.values(cur.secondHistory.sections).some(sec => sec.remaining > 0)));
      const movedA = Math.abs(cur.stationTrain - prevA) > 1e-6;
      const movedB = prevB !== undefined && Math.abs((cur.secondTrain ?? prevB) - prevB) > 1e-6;
      const pantoStillRaising = cur.pantograph && pPose < .98 && cur.catenaryPower && cur.mainBreaker && !cur.trainBrake;
      if (!movedA && !movedB && mA.speed === 0 && mB.speed === 0 && !timerRunning && !pantoStillRaising) {
        if (cur.trainBrake) blockedReason = '⚠ 已施加制动，列车保持静止（独立继电器计时仍会按仿真时间推进）';
        else if (!cur.pantograph || !cur.catenaryPower || !cur.mainBreaker) blockedReason = '⚠ 牵引供电未成立（受电弓降下 / 接触网断电 / 主断断开），静止列车无法自行启动';
        else if (!phys.sigOpen && direction > 0 && cur.stationTrain >= -12 && cur.stationTrain < 0) blockedReason = '🛑 防护信号机关闭，列车停于信号机外方，无法继续越过';
        break;
      }
      const { maxPosA: mAEnd, maxPosB: mBEnd } = computeStationMaxPos(nextSt);
      const allDoneA = (direction > 0 ? cur.stationTrain >= mAEnd : cur.stationTrain <= -30) || (direction > 0 && cur.stationTrain >= -12 && cur.stationTrain < 0 && !(nextSt.relays.LXJ || nextSt.relays.YXJ));
      const allDoneB = !nextSt.multiTrain.active || nextSt.multiTrain.mode === 'track_occupied' || (nextSt.multiTrain.trainB ?? 0) >= mBEnd || ((nextSt.multiTrain.trainB ?? 0) >= -12 && (nextSt.multiTrain.trainB ?? 0) < 0 && !nextSt.multiTrain.lxjB && allDoneA && nextSt.allCtrlUnlocked);
      if (allDoneA && allDoneB && !timerRunning && mA.speed === 0 && mB.speed === 0) break;
    }

    trainMotion = mA;
    trainMotionB = mB;
    pantographPose = pPose;
    s = cur;
    result = L.evaluate(s);
    sceneDirty = true; labelsDirty = true;
    if (model) model.setView(viewState());
    render();
    record();
    if (blockedReason && found.length === 0) toast(blockedReason);
  }
  function rightState() {
    const pair = COMPARISONS[comparisonKey];
    if (!pair) return null;
    const n = L.update({ ...s, type: pair[1], latched: comparisonLatched }, {});
    comparisonLatched = n.latched;
    return n;
  }
  function viewState() { return { ...s, contactFocus, pantographPosition: pantographPose }; }
  function applyScene(patch) {
    playing = false;
    if (patch.mode === 'station') {
      patch = {
        multiTrainMode: 'none',
        lampFault: false,
        switchFault: false,
        poorShunt: false,
        blindFault: 'none',
        guideMode: false,
        guideRouteLocked: false,
        secondHistory: null,
        guideManualConfirm: false,
        guideTotalLock: false,
        guideFirstSecFault: false,
        guideHoldElapsed: 0,
        hostileRoute: false,
        pantograph: true,
        catenaryPower: true,
        mainBreaker: true,
        trainBrake: false,
        signalFaultLocked: false,
        zraProgress: 0,
        cancelMode: 'none',
        stationDirection: 1,
        ...patch
      };
      const sceneState = { ...L.initial(), ...patch };
      const h = J.create({ ...sceneState, stationTrain: -26 });
      patch = { ...patch, stationHistory: J.advance(J.move(h, sceneState.stationTrain, sceneState.blindFault === 'stuckSection'), 3, sceneState.blindFault === 'stuckSection') };
    } else if (patch.mode === 'bench') {
      if (patch.type === 'selfHold') {
        patch = { shButton: false, shLatched: false, shFujPicked: false, shWireBreak: false, shCrossMethod: 'position', shCrossFault: 'none', shShuntLineBreak: false, ...patch };
      } else if (patch.type === 'turnoutLab') {
        patch = { toStage: 0, toObstacle: false, toLidOpen: false, toSjLocked: false, toIndFault: 'none', ...patch };
      } else if (patch.type === 'fiveWireLab') {
        patch = { fwStage: 0, fwPhaseLoss: false, fwLidOpen: false, ...patch };
      } else if (patch.type === 'cbiIoLab') {
        patch = { cbiMode: 'pulseTrans', cbiCmd: true, cbiFault: 'none', ...patch };
      }
    } else if (patch.mode === 'track') {
      patch = { power: true, railBreak: false, receiverBreak: false, multi: false, branchOccupied: false, localPower: true, frequency: 'correct', phase: 'correct', ...patch };
    } else if (patch.mode === 'signal') {
      patch = { signalFilament: 'main', signalIndicator: '', signalSecondFilamentFault: false, ...patch };
    } else if (patch.mode === 'figures') {
      patch = { figRouteIdx: null, figChapter: null, ...patch };
    }
    comparisonKey = ''; typeBeforeComparison = null; contactFocus = false; contactStep = null; trainFocused = false; blindStuckConfirmed = false;
    const is2dTarget = ['curriculum', 'cbi', 'figures'].includes(patch.mode);
    const needRebuild = !is2dTarget && (patch.mode !== s.mode
      || (patch.type && patch.type !== s.type)
      || (patch.mode === 'signal' && ((patch.signalType && patch.signalType !== s.signalType) || (patch.signalVariant && patch.signalVariant !== s.signalVariant))));
    set({ explode: 0, ...patch }, needRebuild);
  }


  function set(patch, rebuild = false) {
    const previous = s, prevResult = result;
    if (patch.mode && patch.mode !== 'bench') { comparisonKey = ''; typeBeforeComparison = null; }
    if (patch.blindFault === 'none' || (patch.stationRoute && patch.stationRoute !== s.stationRoute)) blindStuckConfirmed = false;
    if (patch.stationHistory === null || (patch.stationRoute && patch.stationRoute !== s.stationRoute) || patch.multiTrainMode || patch.secondRoute) { trainMotion = { speed: 0 }; trainMotionB = { speed: 0 }; }
    sceneDirty = true; labelsDirty = true;
    if ('polarity' in patch || 'filamentMode' in patch) { contactStep = null; lastTimingFrame = performance.now(); }
    if ((patch.mode && patch.mode !== s.mode) || (patch.type && patch.type !== s.type) || (s.mode === 'signal' && (('signalType' in patch && patch.signalType !== s.signalType) || ('signalVariant' in patch && patch.signalVariant !== s.signalVariant)))) {
      comparisonTiming = null; comparisonLatched = false; contactFocus = false; contactStep = null; trainFocused = false;
      lastTimingFrame = performance.now();
    }
    s = L.update(s, patch); result = L.evaluate(s);
    if (s.mode === 'station') {
      if (patch.stationHistory === null || patch.mode === 'station' || (patch.stationRoute && patch.stationRoute !== previous.stationRoute) || patch.multiTrainMode) {
        lastRelaySnap = collectRelaySnapshot(result.station);
        recentRelayChanges = [];
        changedMatrixKeys = new Set();
        relayPauseTimer = 0;
      } else {
        recordRelayDiff(lastRelaySnap, result.station);
      }
    } else {
      lastRelaySnap = null; recentRelayChanges = []; changedMatrixKeys = new Set(); relayPauseTimer = 0;
    }
    if (rebuild) { selectedPart = null; selectedSourceType = null; }
    if (prevResult && s.mode !== 'bench' && s.mode !== 'signal' && prevResult.picked !== result.picked) {
      playSound(result.picked ? 'clickUp' : 'clickDown');
    } else if (s.mode === 'signal' && prevResult.signal && result.signal && prevResult.signal.aspect !== result.signal.aspect) {
      playSound('clickUp');
    } else if (s.mode === 'station' && prevResult.station && result.station) {
      if (!prevResult.station.occX3JG && result.station.occX3JG) playSound('bell');
      else if (prevResult.station.signalAspect !== result.station.signalAspect || prevResult.station.stg !== result.station.stg) playSound('clickUp');
    } else if (s.type === 'selfHold' && prevResult.selfHold && result.selfHold) {
      if (prevResult.selfHold.ajPicked !== result.selfHold.ajPicked) playSound(result.selfHold.ajPicked ? 'clickUp' : 'clickDown');
      else if (prevResult.selfHold.fujPicked !== result.selfHold.fujPicked) playSound(result.selfHold.fujPicked ? 'clickUp' : 'clickDown');
    } else if (s.type === 'turnoutLab' && prevResult.turnout && result.turnout) {
      if (!prevResult.turnout.motorRunning && result.turnout.motorRunning) playSound('motor');
      else if (prevResult.turnout.dqj1Picked !== result.turnout.dqj1Picked || prevResult.turnout.dqj2Reverse !== result.turnout.dqj2Reverse || prevResult.turnout.dbjPicked !== result.turnout.dbjPicked || prevResult.turnout.fbjPicked !== result.turnout.fbjPicked) {
        playSound(result.turnout.dqj1Picked || result.turnout.dbjPicked || result.turnout.fbjPicked ? 'clickUp' : 'clickDown');
      }
    } else if (s.type === 'fiveWireLab' && prevResult.fiveWire && result.fiveWire) {
      if (!prevResult.fiveWire.motorRunning && result.fiveWire.motorRunning) playSound('motor');
      else if (prevResult.fiveWire.dqj1Picked !== result.fiveWire.dqj1Picked || prevResult.fiveWire.dqj2Reverse !== result.fiveWire.dqj2Reverse || prevResult.fiveWire.bhjPicked !== result.fiveWire.bhjPicked || prevResult.fiveWire.dbjPicked !== result.fiveWire.dbjPicked || prevResult.fiveWire.fbjPicked !== result.fiveWire.fbjPicked) {
        playSound(result.fiveWire.bhjPicked || result.fiveWire.dqj1Picked || result.fiveWire.dbjPicked || result.fiveWire.fbjPicked ? 'clickUp' : 'clickDown');
      }
    } else if (s.type === 'cbiIoLab' && prevResult.cbiIo && result.cbiIo && prevResult.cbiIo.relayPicked !== result.cbiIo.relayPicked) {
      playSound(result.cbiIo.relayPicked ? 'clickUp' : 'clickDown');
    }
    relayTiming = L.advanceRelay(relayTiming, s, 0);
    timerProgress = relayTiming.progress;
    if (previous.type !== s.type || previous.mode !== s.mode) pose = 0;
    if (rebuild && renderer) rebuildScene();
    if (model) model.setView(viewState());
    if (branchModel) branchModel.setView({ ...s, labels: !!comparisonKey });
    if (previous.type !== s.type || previous.mode !== s.mode || (s.mode === 'signal' && (previous.signalType !== s.signalType || previous.signalVariant !== s.signalVariant))) {
      if (s.mode !== 'station') hidePipBanner();
      autoMatchQuiz();
      selectedPart = null; selectedSourceType = null; renderPart();
    }
    render();
    record();
  }
  function downloadData(data, name, mime) {
    const url = URL.createObjectURL(new Blob([data], { type: mime }));
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function logControl(label, page) {
    if (!s.stationHistory) return;
    const h = J.clone(s.stationHistory); J.append(h, 'control', label, page);
    s = { ...s, stationHistory: h }; record();
  }
  function focusContacts(on) {
    if (!model || !model.contactCenter || comparisonKey || s.mode !== 'bench') return;
    contactFocus = on; trainFocused = false; contactStep = null;
    s = L.update(s, { explode: 0 }); model.setView(viewState());
    if (on) {
      [target.x, target.y, target.z] = model.contactCenter;
      yaw = .10; pitch = .14; distance = 3.3; panX = panY = 0; orbitDirty = true;
      selectedPart = selectedPart || 'common'; renderPart();
    } else preset('iso');
    renderStudy();
  }
  function focusTrain() {
    const train = s.mode === 'station' ? model && model.train : track && track.train;
    if (!train) return;
    scene.updateMatrixWorld(true);
    const p = train.getWorldPosition(new THREE.Vector3());
    target.x = s.mode === 'track' ? p.x - 1.76 : p.x; target.y = p.y + .75; target.z = p.z;
    $('model-caption').textContent = 'CR400AF-A 3 节编组复兴号动车组 · 弓网受流 / 轮对分路联动';
    yaw = .52; pitch = .28; distance = s.mode === 'track' ? 7.4 : 6; panX = panY = 0; orbitDirty = true;
  }
  function renderStudy() {
    const bench = s.mode === 'bench';
    const physical = bench && !!S.models[s.type].complete;
    $('contact-focus').hidden = !physical || !!comparisonKey;
    $('contact-focus').textContent = contactFocus ? '返回完整机构' : '接点局部放大';
    $('contact-focus').setAttribute('aria-pressed', String(contactFocus));
    $('contact-focus').classList.toggle('active', contactFocus);
    $('contact-steps').hidden = !contactFocus;
    document.querySelector('[data-contact-pose="0"]').textContent = s.type === 'latching' ? '反位接点闭合' : '后接点闭合';
    document.querySelector('[data-contact-pose="1"]').textContent = s.type === 'latching' ? '定位接点闭合' : '前接点闭合';
    $('comparison-control').hidden = !physical;
    $('comparison-pair').value = comparisonKey;
    $('comparison-readout').hidden = !comparisonKey;
    $('train-focus').hidden = !['station', 'track'].includes(s.mode);
    $('train-focus').textContent = trainFocused ? '返回全景视角' : '列车近景';
    $('train-focus').setAttribute('aria-pressed', String(trainFocused));
    $('train-focus').classList.toggle('active', trainFocused);
    $('export-journey').hidden = s.mode !== 'station';
    $('study-tools').hidden = $('contact-focus').hidden && $('comparison-control').hidden && $('train-focus').hidden && $('contact-steps').hidden && $('comparison-readout').hidden;
    if (comparisonKey) renderComparison();
  }
  function renderComparison() {
    if (!comparisonKey || s.mode !== 'bench') return;
    const right = rightState();
    const types = COMPARISONS[comparisonKey];
    const states = [s, right], poses = [pose, branchPose], timings = [relayTiming, comparisonTiming];
    $('comparison-readout').innerHTML = types.map((type, i) => {
      const c = { front: poses[i] > .94, back: poses[i] < .06 };
      const t = timings[i];
      const stage = t && t.held ? '断电缓放保持' : type === 'timeRelay' && t && t.progress < 1 && states[i].polarity ? `通电延时 ${Math.floor(t.progress * 180)}/180s` : c.front ? (type === 'latching' ? '定位保持' : '吸起') : c.back ? (type === 'latching' ? '反位保持' : '落下') : '转换中 · 两路断开';
      const armY = 65 - 40 * poses[i];
      const diagram = `<svg viewBox="0 0 240 90" role="img" aria-label="${S.models[type].model}接点同步示意"><path d="M15,45H70L120,${armY.toFixed(1)}" class="wire live"/><path data-contact-part="front" d="M120,25H220" class="wire${c.front ? ' live' : ''}"/><path data-contact-part="back" d="M120,65H220" class="wire${c.back ? ' live' : ''}"/><circle cx="120" cy="25" r="3" fill="${c.front ? '#7de0bd' : '#8194a7'}"/><circle cx="120" cy="65" r="3" fill="${c.back ? '#7de0bd' : '#8194a7'}"/><text x="133" y="17" fill="#c8d5df" font-size="11">${type === 'latching' ? '定位' : '前接点'}</text><text x="133" y="83" fill="#c8d5df" font-size="11">${type === 'latching' ? '反位' : '后接点'}</text></svg>`;
      return `<article data-source-type="${type}"><h3>${i ? '右' : '左'} · ${S.models[type].model}</h3><p>${stage}</p>${diagram}<p class="contact-state">${type === 'latching' ? '定位' : '前接点'} ${c.front ? '闭合' : '断开'} · ${type === 'latching' ? '反位' : '后接点'} ${c.back ? '闭合' : '断开'}</p></article>`;
    }).join('');
  }
  function renderPartSource() {
    if (s.mode === 'signal') {
      const binding = selectedPart ? S.signalPartBinding(s.signalType, selectedPart) : null;
      $('part-source').hidden = !binding;
      if (!binding) return;
      $('part-source-image').src = binding.image;
      $('part-source-note').textContent = S.signalModels[s.signalType].model + ' · ' + binding.note;
      const [x, y, w, h] = binding.rect;
      Object.assign($('part-source-region').style, { left: x * 100 + '%', top: y * 100 + '%', width: w * 100 + '%', height: h * 100 + '%' });
      return;
    }
    const sourceType = selectedSourceType || s.type;
    const binding = s.mode === 'bench' && selectedPart ? S.partBinding(sourceType, selectedPart) : null;
    $('part-source').hidden = !binding;
    if (!binding) return;
    $('part-source-image').src = binding.image;
    $('part-source-note').textContent = S.models[sourceType].model + ' · ' + binding.note;
    const [x, y, w, h] = binding.rect;
    Object.assign($('part-source-region').style, { left: x * 100 + '%', top: y * 100 + '%', width: w * 100 + '%', height: h * 100 + '%' });
  }
  function renderSourceLedger() {
    if (s.mode === 'signal') {
      const spec = S.signalModels[s.signalType];
      $('source-ledger').innerHTML = `<table><thead><tr><th>核对项目</th><th>教材依据</th><th>核实范围</th></tr></thead><tbody><tr><td>机构配置与灯位序</td><td>PDF 24–26 / 书 14–16</td><td>${spec.contacts}（严格匹配 p.26 图示）</td></tr><tr><td>点灯继电器与灯丝</td><td>PDF 68–75 / 表 5.1.1–5.1.5</td><td>BX-30 串 DJ(5-6) 监督与 DZJ↓ 自动转副丝</td></tr></tbody></table><p>灯柱高度、透镜直径与检修梯尺寸采用比例教学造型，实体零件待厂家装配图进一步校核。</p>`;
      return;
    }
    if (s.mode === 'track') {
      const is25 = s.type === 'phase';
      $('source-ledger').innerHTML = `<table><thead><tr><th>核对项目</th><th>教材依据</th><th>核实范围</th></tr></thead><tbody><tr><td>${is25 ? '25 Hz 相敏电路' : '50 Hz 半波整流电路'}</td><td>${is25 ? '图 5.3.3 · PDF 88–89' : '图 5.3.1–5.3.2 · PDF 87–88'}</td><td>${is25 ? 'BE₂₅/BG₂₅、Z·HF 跨轨道 3-4、电容 C 并局部 1-2' : 'BG₁-50、2.2Ω/220W、BZ₄ 接 JZXC-480 (8-7) 与一送两受 DGJ₁ 串联'}</td></tr><tr><td>3 节列车轮对分路</td><td>第 5.3 节 · 闭路检查</td><td>前轮压入 0% 即分路落 GJ↓，全部 3 节 6 转向架出清 (>140%) 恢复 GJ↑</td></tr></tbody></table><p>列车外观参考中国中车 CR400AF 基础型官方照片。</p>`;
      return;
    }
    if (s.mode !== 'bench') {
      $('source-ledger').innerHTML = '<p>站场布局严格依据图 3.1.1、表 3.2.2 全部 33 条进路（PDF 35、42–43 页），运行事件可逐项打开第9章原页。列车外观参考中国中车CR400AF基础型官方照片。</p><p><a href="https://www.crrcgc.cc/crrcgc/2026-05/09/article_2026050917102785945.html" target="_blank" rel="noopener">中国中车CR400AF产品页</a></p>';
      return;
    }
    const names = ['coil', 'armature', ...(s.type === 'latching' ? ['permanent'] : ['weight']), 'rod', 'front', 'common', 'back'];
    const rows = names.map(part => {
      const b = S.partBinding(s.type, part);
      return b ? `<tr><td>${parts[part][0].split('（')[0]}</td><td>PDF${b.page} / 书${b.page - 10}</td><td>功能关系有图，尺寸及具体装配待厂家资料核实</td></tr>` : '';
    }).join('');
    $('source-ledger').innerHTML = `<table><thead><tr><th>部件</th><th>教材依据</th><th>核实范围</th></tr></thead><tbody>${rows}</tbody></table><p>型号与接点配置另见表4.1.4。实物装配图尚未取得。绘制匝数、材料外观及安装比例为教学表达。</p><p>${S.physicalReferences.map(r => `${r.title} · ${r.scope}`).join('。')}</p>`;
  }
  function autoMatchQuiz() {
    let idx = 0;
    if (s.mode === 'station' || s.mode === 'signal') idx = 5;
    else if (s.type === 'selfHold') idx = 1;
    else if (s.type === 'turnoutLab') idx = 3;
    else if (s.type === 'fiveWireLab') idx = 9;
    else if (s.type === 'cbiIoLab') idx = 11;
    else if (s.type === 'timeRelay') idx = 6;
    else if (s.type === 'filament') idx = 5;
    else if (s.type === 'heavySlow') idx = 3;
    currentQuizIndex = idx;
    $('challenge-explanation').hidden = true;
    $('challenge-answer').textContent = '查看教材解析 →';
  }
  function renderQuiz() {
    const q = EXAM_BANK[currentQuizIndex];
    $('quiz-counter').textContent = `考点 ${currentQuizIndex + 1} / ${EXAM_BANK.length}`;
    $('quiz-title').textContent = q.title;
    $('challenge-question').textContent = q.question;
    $('challenge-explanation').textContent = q.answer;
  }
  function showPipBanner(def) {
    if (!def) return;
    activePipDef = def;
    const st = result.station;
    if (def.stationSignal) {
      const sigObj = def.stationSignal;
      const sigAsp = st && st.signals ? (st.signals[sigObj.key] || (sigObj.key.startsWith('D') ? 'A' : 'H')) : 'H';
      const sigSpec = L.SIGNAL_ASPECTS[sigObj.signalType];
      const aspInfo = sigAsp === 'DARK' ? '灭灯（DJ↓ 双断丝故障）' : (sigSpec && sigSpec[sigAsp] ? sigSpec[sigAsp].label : sigAsp);
      const inRoute = st && st.routeSpec && st.routeSpec.sig === sigObj.key;
      $('pip-title').textContent = `${sigObj.plate} · ${sigObj.desc}（当前：${aspInfo}）`;
      $('pip-meta').textContent = `${inRoute ? '【本进路主体信号机】' : '【当前未作为主体开放 · 常态防护】'} ｜ 表3.2.2 敌对检查：${st && st.routeSpec ? st.routeSpec.hostileRaw : '无'}`;
      $('pip-jump-relay').textContent = '🚦 进入第2.3节拆解此信号机';
      $('pip-jump-topic').hidden = true;
      $('pip-banner').hidden = false;
      return;
    }
    const rl = st ? st.relays : {};
    let liveOn = false;
    if (def.key === 'DCJ') liveOn = rl.DCJ || rl.FCJ;
    else if (def.key === 'DQJ2') liveOn = !rl.DQJ2;
    else liveOn = !!rl[def.key];
    const stateStr = def.key === 'DQJ2' ? (rl.DQJ2 ? '当前：反位 (111-113闭)' : '当前：定位 (111-112闭)') : (liveOn ? '当前：↑ 吸起 (11-12闭合)' : '当前：↓ 落下 (11-13闭合)');
    $('pip-title').textContent = `${def.code} · ${def.name}（${stateStr}）`;
    $('pip-meta').textContent = `实训硬件型号：${def.hwModel} ｜ 教材规定：${def.normal}`;
    $('pip-jump-relay').textContent = '🔍 微距拆解此继电器';
    $('pip-jump-topic').hidden = !def.topicType;
    if (def.topicType) {
      $('pip-jump-topic').textContent = def.topicType === 'turnoutLab' ? '📐 四线制道岔电路微距实验' : def.topicType === 'fiveWireLab' ? '📐 五线制三相道岔实验' : def.topicType === 'selfHold' ? '📐 自闭与5法防混线实验' : '📐 半导体时间继电器(3′)实验';
    }
    $('pip-banner').hidden = false;
  }
  function hidePipBanner() {
    activePipDef = null;
    if ($('pip-banner')) $('pip-banner').hidden = true;
  }
  function contacts() { return { frontClosed: pose > .94, backClosed: pose < .06, moving: Math.abs(pose - Number(relayTiming ? relayTiming.picked : result.picked)) > .005 }; }
  function statusRow(label, value, cls = '') { return `<div class="status-row"><dt>${label}</dt><dd class="${cls}">${value}</dd></div>`; }

  function renderStatus() {
    if (s.mode === 'curriculum' || s.mode === 'cbi') return;
    if (s.mode === 'signal') {
      const sig = result.signal, rls = sig.relays, modelSpec = S.signalModels[sig.type];
      const dark = sig.filament === 'broken';
      const downRed = !!sig.downgradedToRed;
      const permissive = !downRed && sig.aspect !== 'H' && sig.aspect !== 'A' && !(sig.type === 'distant' && sig.aspect === 'U');
      $('state-badge').textContent = dark ? '✕ 双断丝灭灯 · DJ↓ (按红灯停车)' : downRed ? '⚠ 2DJ↓ 强制降红 H (防信号升级!)' : `${sig.spec.label}`;
      $('state-badge').className = 'state-badge' + (!dark && permissive ? ' on' : dark || downRed || sig.aspect === 'HB' ? ' moving' : '');
      const relayTxt = Object.entries(rls).map(([k, v]) => `${k}:${v ? '↑' : '↓'}`).join(' · ');
      let rows = '';
      rows += statusRow('信号机类型', `${modelSpec.model}`, 'on');
      rows += statusRow('机构配置 (PDF p.26)', modelSpec.variantNames[sig.variant] || sig.variant, 'on');
      rows += statusRow('室外灯光显示', dark ? '✕ 熄灭（故障—安全按停车信号）' : downRed ? `🔴 H 红灯（原拟开 ${sig.intendedAspect} 被 2DJ↓ 降级!）` : sig.spec.label, (dark || downRed) ? 'warning' : permissive ? 'on' : '');
      rows += statusRow('第5.1节灯丝监督', sig.filament === 'main' ? (downRed ? '第2灯丝断 (2DJ↓) → 切断第1 允许灯!' : '主灯丝 H₁ 亮灯 (DJ↑ · DZJ↑)') : sig.filament === 'backup' ? '主丝断 → DZJ↓ 转副灯丝 H₂ (DJ↑)' : '主/副双断丝 (DJ↓ 切断点灯)', (sig.filament === 'broken' || sig.filament === 'backup' || downRed) ? 'warning' : 'on');
      rows += statusRow('控制继电器组合', relayTxt, (dark || downRed) ? 'warning' : 'on');
      if (['depFour', 'depThree'].includes(sig.type)) {
        rows += statusRow('发车方向表示器', sig.indicator === 'right' ? '● 点亮“右 →”（检3DJ↑）' : '○ 未点亮', sig.indicator === 'right' ? 'on' : '');
      }
      $('state-readout').innerHTML = rows;
      $('action-chain').textContent = dark
        ? 'BX-30 一次侧断流 → DJ 失磁落下 → 切断允许信号点灯回路（红灯防灭灯降级停车）'
        : downRed
          ? `第2允许灯丝断丝 → 2DJ↓ 切断第1灯(${sig.intendedAspect})励磁回路 → 强制改点红灯 H，严禁升级成单黄/单绿`
        : sig.filament === 'backup'
          ? '主灯丝 H₁ 断丝 → DZJ 落下切换 H₂ 副灯丝 → DJ 靠缓放保持吸起维持信号显示'
          : `第5.1节继电器组合 [${relayTxt}] → 对应色片/菲涅尔透镜亮灯`;
      $('state-reason').textContent = result.reasons.join('；');
      return;
    }
    if (s.mode === 'station') {
      const st = result.station, rl = st.relays, rt = st.routeSpec || { num: 1, title: st.routeType, sig: 'X', switchesRaw: '1/3、5/7、11', hostileRaw: '' };
      const aspectMap = {
        UU: '🟡🟡 双黄灯 UU（侧线接车）',
        U: '🟡 单黄灯 U（正线接车）',
        L: `🟢 绿灯 L（发车${st.indicatorOn ? ' + 右表示器' : ''}）`,
        B: '⚪ 月白灯 B（准许调车 · 整列越过信号机后关闭）',
        A: '🔵 蓝灯 A（调车禁止越过）',
        HB: '🔴⚪ 红+月白 HB（引导接车 ≤20km/h）',
        H: '🔴 红灯 H（禁止越过）',
        DARK: '✕ 熄灭（DJ↓ 双断丝故障）'
      };
      const dispAsp = (!rl.DJ && !rl.YXJ) ? 'DARK' : st.signalAspect;
      const aspectText = aspectMap[dispAsp] || '🔴 红灯 H（禁止越过）';
      const sigLit = ['U', 'UU', 'L', 'B', 'HB'].includes(dispAsp);
      $('state-badge').textContent = st.spadViolation ? '🚨 违章冒进红灯 H · 禁自动解锁' : st.zraBlocked ? '🔒 人工解锁计时中止' : st.zraCounting ? `⏳ 教材计时 ${Math.floor(s.zraProgress * st.zraSeconds)}/${st.zraSeconds} s · ×${s.slow ? 15 : 60}` : st.sgaUnlocked ? '✓ 区故解已解锁' : dispAsp === 'DARK' ? '✕ 信号灭灯 DJ↓' : st.guideActive ? (rl.YXJ ? (st.guideFirstSecFault ? `🚨 引导开放 ${rt.sig}:HB · 15s维持 ${st.guideHoldRemaining.toFixed(1)}s` : `🚨 引导信号开放 ${rt.sig}:HB`) : '🔒 引导进路锁闭(过车须ZRA)') : !sigLit ? (st.stg === 4 ? '🔒 已锁闭 · 待开放' : `🔴 信号关闭 ${dispAsp}`) : `🟢 信号开放 ${rt.sig}:${dispAsp}`;
      $('state-badge').className = 'state-badge' + (st.spadViolation || st.guideActive || st.stg === 4 || st.zraCounting || st.sgaBlocked || dispAsp === 'DARK' ? ' moving' : sigLit ? ' on' : '');
      const aSec = st.activeSec || { label: st.sgaTarget, DGJ: rl.DGJ, FDGJ: rl.FDGJ, QJJ: rl.QJJ, LJ1: rl.LJ1, LJ2: rl.LJ2, CJ: rl.CJ, SJ: rl.SJ, slow: st.dg11Slow, unlocked: st.dg11Unlocked };
      let rows = '';
      rows += statusRow('办理进路 (表3.2.2)', `第 ${rt.num} 条 · ${rt.title}`, 'on');
      if (st.multiTrain && st.multiTrain.active) {
        rows += statusRow('🚄 双车联锁与平行/排队', st.multiTrain.conflictReason, st.multiTrain.bWaitingForA || (st.multiTrain.mode === 'track_occupied' && !rl.LXJ && !rl.YXJ) ? 'warning' : 'on');
      }
      rows += statusRow(`防护信号机 ${rt.sig}`, aspectText, sigLit ? 'on' : 'warning');
      rows += statusRow('锁闭性质与迎面照查', `${st.guideActive ? '引导锁闭(不自动解锁 · 须ZRA)' : st.stg < 4 || st.manualUnlocked ? '进路未锁闭' : st.approachLocked ? '接近锁闭（JYJ↓）' : st.preLocked ? '预先锁闭（JYJ↑）' : '按区段锁闭'} · ZCJ:${rl.ZCJ ? '↑允许迎面' : '↓防迎面'}`, (st.approachLocked || st.guideActive || !rl.ZCJ) ? 'warning' : 'on');
      rows += statusRow(`道岔需求 (${rt.switchesRaw})`, st.swConverting ? '1DQJ↑ · 2DQJ转极 · 转换中' : (rl.DBJ || rl.FBJ) ? (st.swReverse ? '含反位道岔密贴 (FBJ ↑)' : '全定位密贴 (DBJ ↑)') : '⚠ 失去表示 (DBJ/FBJ ↓)', (rl.DBJ || rl.FBJ) ? 'on' : 'warning');
      rows += statusRow('选排与始端 (1-7线)', `LAJ:${rl.LAJ ? '↑' : '↓'} · ${st.isDep ? 'LFJ' : st.isShunt ? 'DFJ' : 'LJJ'}:${(st.isDep ? rl.LFJ : st.isShunt ? rl.DFJ : rl.LJJ) ? '↑' : '↓'} · FKJ:${rl.FKJ ? '↑' : '↓'} · KJ:${rl.KJ ? '↑' : '↓'}`, rl.KJ ? 'on' : '');
      rows += statusRow('检查与锁闭 (8-10线)', `XJJ:${rl.XJJ ? '↑' : '↓'} · QJJ(${aSec.label}):${aSec.QJJ ? '↑' : '↓'} · GJJ:${rl.GJJ ? '↑' : '↓'} · SJ(${aSec.label}):${aSec.SJ ? '↑(解锁)' : '↓(锁闭)'}`, !aSec.SJ ? 'warning' : 'on');
      rows += statusRow(st.isShunt ? '调车信号 (11线)' : '信号与引导 (11线)', `${st.isShunt ? 'DXJ/LXJ' : 'LXJ'}:${rl.LXJ ? '↑' : '↓'} · ${st.isShunt ? 'ZJ' : 'YXJ'}:${(st.isShunt ? rl.ZJ : rl.YXJ) ? '↑' : '↓'} · DJ:${rl.DJ ? '↑' : '↓'}${st.signalFaultLocked && !st.guideActive ? ' · 防重开锁存' : ''}`, (rl.LXJ || rl.YXJ) ? 'on' : st.signalFaultLocked ? 'warning' : '');
      rows += statusRow(`活跃区段 ${aSec.label} 三点检查`, `DGJ:${aSec.DGJ ? '↑' : '↓'} · FDGJ:${aSec.FDGJ ? (aSec.slow ? '⏳缓放中' : '↑') : '↓'} · 1LJ:${aSec.LJ1 ? '↑' : '↓'} · 2LJ:${aSec.LJ2 ? '↑' : '↓'} · CJ:${aSec.CJ ? '↑' : '↓'}`, aSec.slow ? 'warning' : aSec.unlocked ? 'on' : '');
      if (st.controlledChain && st.controlledChain.length > 1) {
        const chainTxt = st.controlledChain.map(c => `${c.label}[${c.occ ? '🔴占(DGJ↓·1LJ' + (c.l1 ? '↑' : '↓') + ')' : c.slow ? '⏳FDGJ缓放3s' : c.unlocked ? '🟢SJ↑已解' : '🔒锁(QJJ' + (c.qjj ? '↑' : '↓') + ')'}]`).join(' ➔ ');
        rows += statusRow('逐区段 Q 组合实时链', chainTxt, st.allCtrlUnlocked ? 'on' : 'warning');
      }
      if (st.history) {
        rows += statusRow('运行记录', st.history.reverse ? '倒退异常 · 正向自动解锁停止' : '按实际占用与出清事件推进', st.history.reverse ? 'warning' : 'on');
        for (const def of J.layout(st.routeType).filter(d => d.controlled)) {
          const r = st.history.sections[def.id];
          rows += statusRow(`${def.id} 解锁记录`, r.released ? '已解锁' : r.remaining > 0 ? `1LJ↑ · 2LJ↑ · FDGJ缓放 ${r.remaining.toFixed(1)}s` : `1LJ${r.first ? '↑' : '↓'} · 2LJ${r.second ? '↑' : '↓'}`, r.released ? 'on' : 'warning');
        }
      }
      $('state-readout').innerHTML = rows;
      $('action-chain').textContent = st.cancelMode === 'zqa'
        ? (st.zqaUnlocked ? 'ZQA · 预先锁闭，信号关闭且进路完整空闲 → 取消进路' : 'ZQA仅关闭信号 · 解锁条件未通过，进路继续锁闭')
        : st.cancelMode === 'zra'
          ? (st.zraBlocked ? '计时中止，进路须完整且空闲。恢复条件后重新办理 ZRA' : st.zraUnlocked && st.preLocked ? '预先锁闭 · 信号关闭且进路完整空闲，按取消方式立即解锁' : st.zraUnlocked ? `按下 ZRA+始端 → 关闭信号 → 时间继电器 JSBXC-850 ${st.zraSeconds === 30 ? '30 s' : '3 min'} 计时期满 → 安全解锁 (SJ↑)` : `按下 ZRA+始端 → 关闭信号 → 时间继电器 ${st.zraSeconds === 30 ? '30 s' : '3 min'} 延时计时 (${Math.round(s.zraProgress * 100)}%)`)
          : st.cancelMode === 'sga'
            ? (st.sgaUnlocked ? `图9.6.1 · ${st.sgaTarget} 空闲，操作前QJJ↓ → 仅本区段解锁` : `${st.sgaTarget} 区故解闭锁 · 本区段占用或操作前QJJ↑`)
            : (s.blindFault !== 'none' ? '🩺 盲测排故中：请综合继电器 ↑/↓ 与光带颜色判断故障来源并在下方提交！' : STAGE_NAMES[st.stg]);
      $('state-reason').textContent = s.blindFault !== 'none'
        ? '盲测提示已开启：系统已隐藏直接故障原因，请根据 11 个继电器吸起/落下与站场信号光带逻辑自行推理故障位置。'
        : result.reasons.length ? result.reasons.join('；') + '。' : '依据教材第 3.4 / 6.4 / 9.5–9.6 节：接车含股道，发车不含股道(S₁→X)，调车月白灯 B 保留；按三点检查与 FDGJ 3s 缓放逐段解锁。';
      if (activePipDef) showPipBanner(activePipDef);
      return;
    }
    if (s.type === 'selfHold') {
      const sh = result.selfHold;
      const mMap = {
        position: '位置法(远端供电 · 图4.3.2)',
        polarity: '极性法(1JBJ/2JBJ · 图4.3.3)',
        doubleBreak: '双断法(双极切断 · 图4.3.4)',
        isolatedPower: '独立电源法(无共回线隔离)',
        shunt: '分路法(KJF · 图4.3.5 非全故障安全)'
      };
      document.body.dataset.type = s.type; document.body.dataset.mode = s.mode;
      document.body.dataset.state = sh.ajPicked ? 'picked' : 'dropped';
      $('state-badge').textContent = sh.wrongMixEnergized ? '⚠ AJ 混线危险误吸起！' : sh.ajPicked ? (sh.buttonClosed ? '↑ AJ 按钮启动吸起' : '↑ AJ 自闭保持吸起') : '↓ AJ 落下（安全侧）';
      $('state-badge').className = 'state-badge' + (sh.ajPicked ? (sh.wrongMixEnergized ? ' moving' : ' on') : '');
      let rows = '';
      rows += statusRow('共用电路 (FUJ 11-13)', sh.wireBreak ? '✕ 供电线断线' : sh.fujPicked ? '断开（FUJ↑ 触发复原）' : '闭合导通（FUJ↓ 常态）', sh.commonLive ? 'on' : 'warning');
      rows += statusRow('启动支路 (自复按钮 A)', sh.buttonClosed ? '● 按下闭合（启动励磁）' : '○ 松开断开（弹簧自复）', sh.startBranchLive ? 'on' : '');
      rows += statusRow('自闭支路 (AJ 11-12)', sh.wrongMixEnergized ? '⚠ 混线旁路直接励磁（非正常自闭）' : (sh.ajPicked && sh.holdBranchLive ? '闭合导通（绕过按钮A自保持）' : '断开'), sh.wrongMixEnergized ? 'warning' : (sh.holdBranchLive ? 'on' : ''));
      rows += statusRow('当前防混线体制', mMap[sh.method] || mMap.position, sh.method === 'shunt' && sh.shuntBroken ? 'warning' : 'on');
      rows += statusRow('混线/故障结果', sh.crossFault === 'naive' ? '⚠ 图4.3.2a同端混线 → AJ 误吸起！' : (sh.crossFault === 'active' && sh.method === 'shunt' && sh.shuntBroken) ? '⚠ 分路线断线＋混线 → KJF 致命误吸！' : (sh.crossFault === 'active' || sh.crossFault === 'position') ? `🛡 ${mMap[sh.method]}可靠防护 → 无误吸` : '正常绝缘', sh.wrongMixEnergized ? 'warning' : 'on');
      rows += statusRow('按钮继电器 AJ/KJF', sh.ajPicked ? '↑ 吸起（11-12闭合）' : '↓ 落下（11-13闭合）', sh.ajPicked ? (sh.wrongMixEnergized ? 'warning' : 'on') : '');
      $('state-readout').innerHTML = rows;
      $('action-chain').textContent = result.reasons[0] || (sh.ajPicked ? 'AJ 吸起保持' : 'AJ 处于常态落下位置');
      $('state-reason').textContent = result.reasons.join('；') + '。';
      return;
    }
    if (s.type === 'turnoutLab') {
      const to = result.turnout;
      document.body.dataset.type = s.type; document.body.dataset.mode = s.mode;
      document.body.dataset.state = to.motorRunning ? 'moving' : (to.dbjPicked || to.fbjPicked) ? 'picked' : 'dropped';
      $('state-badge').textContent = to.sjLocked && (to.stg === 1 || to.stg === 2) ? '🔒 SJ↓ 锁闭禁动' : to.indFault !== 'none' ? '⚠ 表示故障 (DBJ↓·FBJ↓)' : (to.lidOpen && to.stg === 3) ? '⚠ 遮断器05-06断开·停机' : to.motorRunning ? (to.obstacle ? '⚠ 夹异物空转受阻' : to.sjLocked ? '⚙ 0.44Ω自闭脱离SJ继续转!' : '⚙ 电机旋转转换中') : to.fbjPicked ? '↑ 反位密贴 (FBJ↑)' : to.dbjPicked ? '↑ 定位密贴 (DBJ↑)' : '↕ 四线制转换中';
      $('state-badge').className = 'state-badge' + ((to.dbjPicked || to.fbjPicked) ? ' on' : ' moving');
      let rows = '';
      rows += statusRow('一启动 1DQJ (JWJXC-H125/0.44)', to.sjLocked && (to.stg === 1 || to.stg === 2) ? '↓ SJ↓切断3-4励磁 · 禁止启动' : to.dqj1SlowHold ? '⏳ 3-4断电 · 铜套涡流缓放保持中' : to.dqj1CurrentHold ? `↑ 1-2低阻圈(0.44Ω)串电机自闭${to.sjLocked ? '(脱离SJ!)' : ''}` : to.dqj1Picked ? '↑ 3-4电压圈(125Ω)启动吸起' : '↓ 常态落下(接通表示)', to.dqj1SlowHold || (to.sjLocked && to.stg <= 2) ? 'warning' : to.dqj1Picked ? 'on' : '');
      rows += statusRow('二启动 2DQJ (JYJXC-220/220)', to.dqj2Reverse ? '反位（111-113 / 121-123闭合）' : '定位（111-112 / 121-122闭合）', to.dqj2Reverse ? 'warning' : 'on');
      rows += statusRow('自动开闭器接点 (图5.2.3)', `1排(11-12):${to.k11_12 ? '通' : '断'} · 2排(21-22):${to.k21_22 ? '通' : '断'} · 3排(31-32):${to.k31_32 ? '通' : '断'} · 4排(41-42):${to.k41_42 ? '通' : '断'}`, 'on');
      rows += statusRow('直流电动机 M 与遮断器', to.lidOpen ? '✕ 遮断器05-06断开(机盖打开)' : to.motorRunning ? (to.obstacle ? '⚠ 尖轨受阻 · 摩擦空转(将烧RD₂)' : '⚙ 经 X2-X4 约2A大电流旋转中') : '静止', to.obstacle || to.lidOpen ? 'warning' : to.motorRunning ? 'on' : '');
      const indMsg = to.indFault === 'wireCross' ? '⚠ 外线混线(交流电) → DBJ↓·FBJ↓' : to.indFault === 'capShort' ? '⚠ 电容C击穿短路 → DBJ↓·FBJ↓' : to.indFault === 'capOpen' ? '⚠ 电容C断线无滤波 → 脉动颤动↓' : to.indFault === 'trailThrough' ? '🚨 挤岔(移位接触器断) → DBJ↓·FBJ↓' : to.dbjPicked ? 'DBJ ↑ 吸起（X1-X3半波1正4负）' : to.fbjPicked ? 'FBJ ↑ 吸起（X2-X3半波1正4负）' : 'DBJ ↓ · FBJ ↓（转换无表示）';
      rows += statusRow('定/反位表示 (JPXC-1000)', indMsg, (to.dbjPicked || to.fbjPicked) ? 'on' : 'warning');
      $('state-readout').innerHTML = rows;
      $('action-chain').textContent = TURNOUT_STAGE_NAMES[to.stg];
      $('state-reason').textContent = result.reasons.join('；') + '。';
      return;
    }
    if (s.type === 'fiveWireLab') {
      const fw = result.fiveWire;
      const tripFault = fw.stg >= 3 && (fw.phaseLoss || fw.lidOpen);
      document.body.dataset.type = s.type; document.body.dataset.mode = s.mode;
      document.body.dataset.state = fw.motorRunning ? 'moving' : (fw.dbjPicked || fw.fbjPicked) ? 'picked' : 'dropped';
      $('state-badge').textContent = fw.motorRunning ? '⚙ 三相380V运转中 (BHJ↑)' : tripFault ? (fw.lidOpen ? '⚠ 遮断开关K断开 · BHJ↓切断' : '⚠ 缺相保护 · BHJ立即↓切断') : fw.fbjPicked ? '↑ 反位表示 FBJ↑' : fw.dbjPicked ? '↑ 定位表示 DBJ↑' : '↕ 五线制转换中';
      $('state-badge').className = 'state-badge' + ((fw.dbjPicked || fw.fbjPicked) ? ' on' : ' moving');
      let rows = '';
      rows += statusRow('DBQ + 保护继电器 BHJ', tripFault ? (fw.lidOpen ? '⚠ K断开缺U相 · BHJ立即↓' : '⚠ 三相缺相 · BHJ立即↓') : fw.bhjPicked ? 'BHJ ↑ 吸起（三相电流平衡自闭）' : 'BHJ ↓ 常态（等待三相动作电流）', tripFault ? 'warning' : fw.bhjPicked ? 'on' : '');
      rows += statusRow('1DQJ / 1DQJF 一级启动', fw.dqj1Picked ? `1DQJ ↑ / 1DQJF ${fw.dqj1fPicked ? '↑' : '↓'}${fw.dqj1SlowHold ? ' (缓放转极)' : ''}` : '↓ 常态落下（接通五线表示）', fw.dqj1Picked ? 'on' : '');
      rows += statusRow('2DQJ 三相换相', fw.dqj2Reverse ? '反位换相（交换 B/C → W-V-U 逆时针）' : '定位相序（W-U-V 顺时针）', fw.dqj2Reverse ? 'warning' : 'on');
      rows += statusRow('S700K 三相电机 & 遮断开关 K', fw.lidOpen ? '✕ 机盖打开 · K 断开 U 相' : fw.motorRunning ? '⚙ AC 380V 驱动星接绕组转换' : '静止（表示电流串检绕组）', fw.lidOpen || (fw.phaseLoss && fw.stg >= 3) ? 'warning' : fw.motorRunning ? 'on' : '');
      rows += statusRow('并联表示电路 (无电容C)', fw.dbjPicked ? 'DBJ ↑（X1/X2/X4 经并联 Z+R₂ 自感维持）' : fw.fbjPicked ? 'FBJ ↑（X1/X3/X5 经并联 Z+R₂ 自感维持）' : '表示断开（DBJ↓ · FBJ↓）', (fw.dbjPicked || fw.fbjPicked) ? 'on' : 'warning');
      $('state-readout').innerHTML = rows;
      $('action-chain').textContent = FIVEWIRE_STAGE_NAMES[fw.stg];
      $('state-reason').textContent = result.reasons.join('；') + '。';
      return;
    }
    if (s.type === 'cbiIoLab') {
      const ci = result.cbiIo;
      const isIn = ci.mode === 'staticIn' || ci.mode === 'dynamicIn';
      const faultNames = { none: '正常脉冲与双位校核', stuckHigh: '⚠ CPU/端口卡死常高电平 1', stuckLow: '⚠ 输出/采集端口卡死常低 0', wireOpen: '⚠ 电路断线 / 电容开路', diodeShort: '⚠ 二极管 D1 击穿或编码损坏(1100)' };
      document.body.dataset.type = s.type; document.body.dataset.mode = s.mode;
      document.body.dataset.state = ci.relayPicked ? 'picked' : 'dropped';
      $('state-badge').textContent = ci.fault === 'stuckHigh' ? '🛡 卡死常高1 → 0V安全落下' : ci.relayPicked ? (isIn ? '✓ 安全编码/回采确认 ↑' : '↑ 执行继电器 J 吸起') : '↓ 安全侧落下（0V 失效防护）';
      $('state-badge').className = 'state-badge' + (ci.relayPicked ? ' on' : ci.fault !== 'none' ? ' moving' : '');
      let rows = '';
      rows += statusRow('安全 I/O 体制', { pulseTrans: '脉冲变压器 T 隔直传交（图13.2.3）', capPump: '互补三极管电容泵 C1·C2（图13.2.4）', staticIn: '静态不对称编码 1010/0101（图13.2.2a）', dynamicIn: '动态探测脉冲闭环回采（图13.2.2b）' }[ci.mode], 'on');
      rows += statusRow('软件命令 / 现场输入', ci.cmd ? '命令：吸起 (1) / 接点闭合' : '命令：落下 (0) / 接点断开', ci.cmd ? 'on' : '');
      rows += statusRow('故障注入状态', faultNames[ci.fault] || ci.fault, ci.fault === 'none' ? 'on' : 'warning');
      if (ci.mode === 'staticIn') rows += statusRow('不对称双位采样码', `${ci.inputCode} (${ci.inputValid ? '合法反相码' : '⚠ 非法故障码！'})`, ci.inputValid ? 'on' : 'warning');
      else rows += statusRow('硬件交流动态能量', ci.dynamicActive ? '∿ 连续动态方波存在 → 泵能有效' : '━ 稳态直流 / 断路 → 隔直阻断 0V', ci.dynamicActive ? 'on' : 'warning');
      rows += statusRow('物理执行/逻辑采信状态', ci.relayPicked ? (isIn ? '逻辑采信闭合 ↑ (1)' : 'J ↑ 吸起（输出有效）') : (isIn ? '逻辑安全判落下 ↓ (0)' : 'J ↓ 安全侧落下 (0V)'), ci.relayPicked ? 'on' : 'warning');
      $('state-readout').innerHTML = rows;
      $('action-chain').textContent = result.reasons[0] || '';
      $('state-reason').textContent = result.reasons.join('；') + '。';
      return;
    }
    const c = contacts(), type = s.type, inTrack = s.mode === 'track';
    const isLatch = type === 'latching';
    const isSlowType = ['slowRelease', 'heavySlow', 'filament'].includes(type);
    const slowDropping = isSlowType && !!(relayTiming && relayTiming.held);
    const delayCharging = type === 'timeRelay' && result.drive && pose < .94;
    const pickedText = isLatch ? '定位' : '吸起', droppedText = isLatch ? '反位' : '落下';
    $('state-badge').textContent = contactStep !== null ? (contactStep === .5 ? '机构暂停 · 前后接点均断开' : '机构逐步观察') : slowDropping ? '⏳ 铜套涡流缓放中' : delayCharging ? `⏳ 延时计时 ${Math.round(timerProgress * 100)}%` : c.moving ? '↕ 转换中' : (posPicked() ? '↑ ' + pickedText : '↓ ' + droppedText);
    $('state-badge').className = 'state-badge' + ((c.moving || slowDropping || delayCharging) ? ' moving' : posPicked() ? ' on' : '');
    document.body.dataset.state = c.moving ? 'moving' : posPicked() ? 'picked' : 'dropped';
    document.body.dataset.targetState = result.picked ? 'picked' : 'dropped';
    document.body.dataset.type = type; document.body.dataset.mode = s.mode;
    const driveText = result.drive ? (type === 'phase' ? '轨道3-4有输入' : ['rectifier', 'filament'].includes(type) ? '交流输入／内部整流' : s.polarity === 1 ? '1 正 · 4 负' : '4 正 · 1 负') : '无励磁输入';
    let rows = statusRow(type === 'phase' ? '轨道线圈 3—4' : '控制输入', driveText, result.drive ? 'on' : '');
    if (type === 'phase') rows += statusRow('局部线圈 1—2', s.localPower ? '有 25 Hz 电源' : '断电', s.localPower ? 'on' : '');
    if (type === 'filament') {
      rows += statusRow('信号机接口类型', s.filamentSignalSystem === 'outDep' ? '图5.1.3 两方向出站兼调车' : '图5.1.2 进站信号机', 'on');
      if (s.filamentSignalSystem === 'outDep') {
        const outLbl = { L: 'L 绿灯 (主方向 3+闭塞)', LU: 'LU 绿黄灯 (主方向 2闭塞)', U: 'U 单黄灯 (主方向 1闭塞)', L_REV: '反向发车 L+表示器 (ZXJ↓·3DJ↑)', B: 'B 月白灯 (调车作业)', H: 'H 红灯 (常态禁止)' }[s.filamentOutAspect] || s.filamentOutAspect;
        rows += statusRow('出站兼调车显示', outLbl, s.filamentMode === 'broken' ? 'warning' : 'on');
      }
      rows += statusRow('信号灯泡回路', s.filamentMode === 'main' ? '主灯丝完好导通' : s.filamentMode === 'backup' ? '主丝断 → DZJ↓转副灯丝' : '主、副灯丝均断丝', s.filamentMode === 'broken' ? 'warning' : 'on');
    }
    if (isSlowType) rows += statusRow('缓放演示时基', `${L.HOLD_SECONDS[type]} s · ${s.slow ? '时间放慢4倍' : '实际秒数'}（表4.1.4条件）`);
    if (type === 'timeRelay') rows += statusRow('教材延时演示', `180 s · 已计 ${Math.floor(timerProgress * 180)} s · 时间 ×${s.slow ? 15 : 60}`);
    rows += statusRow('机构状态', slowDropping ? '缓放维持中' : delayCharging ? '延时计时中' : c.moving ? '先断后接转换中' : posPicked() ? pickedText : droppedText, (c.moving || slowDropping || delayCharging) ? 'warning' : posPicked() ? 'on' : '');
    const frontLabel = isLatch ? '定位接点 111—112（2DQJ常态闭合）' : '前接点 11—12（失电常开）';
    const backLabel = isLatch ? '反位接点 111—113（2DQJ常态断开）' : '后接点 11—13（失电常闭）';
    rows += statusRow(frontLabel, c.frontClosed ? '闭合导通' : '断开', c.frontClosed ? 'on' : '');
    rows += statusRow(backLabel, c.backClosed ? '闭合导通' : '断开', c.backClosed ? 'on' : '');
    if (inTrack) rows += statusRow('区段检查目标', result.clear ? '空闲条件成立' : '不能证明空闲', result.clear ? 'on' : 'warning');
    if (inTrack && s.multi && type === 'rectifier') rows += statusRow('支 DGJ₁', result.branchPicked ? '吸起 · 前接点通' : '落下 · 前接点断', result.branchPicked ? 'on' : 'warning');
    $('state-readout').innerHTML = rows;
    let chain;
    if (inTrack) {
      if (result.picked) chain = type === 'phase' ? '轮对未分路且轨道3-4与局部1-2同频同相 → 正向电磁转矩 → GJ 吸起 → 前接点 11-12 接通' : '轮对未分路 → 受电条件满足 → GJ 吸起 → 前接点 11-12 接通';
      else if (result.shunt) chain = '轮对低阻分路 → 轨面电压骤降 → GJ 落下 → 前接点断开';
      else if (type === 'phase' && result.drive && !s.localPower) chain = '轨道3-4有输入但局部线圈1-2断电 → 缺少局部磁通不产生转矩 → GJ 落下 → 前接点断开（安全侧）';
      else if (type === 'phase' && result.drive && s.phase === 'reversed') chain = '相位反接 180° → 产生反向电磁转矩将翼片压落 → GJ 落下（防护绝缘破损）';
      else if (type === 'phase' && result.drive) chain = '25 Hz 频率或相位条件不符 → 无正向转矩 → GJ 落下 → 导向安全侧';
      else chain = '检测条件不满足 → GJ 落下 → 导向安全侧（不提供空闲条件）';
    }
    else if (slowDropping) chain = '切断线圈电源 → 铁芯阻尼铜套感应闭合涡流 → 阻碍磁通衰减 → 衔铁延时缓放落下';
    else if (delayCharging) chain = '控制电源接通 → 半导体时间继电器计时 → 达到规定延时后驱动执行机构吸起';
    else if (isLatch && !result.drive) chain = `控制电源断开 → 轭铁永久磁铁保持${result.picked ? '定位' : '反位'}磁路 → ${result.picked ? '定位接点 111-112' : '反位接点 111-113'} 保持闭合`;
    else if (type === 'biased' && s.polarity === -1) chain = '反极性电流 (4正1负) → 控制磁通 ΦK 与永磁 Φ永 同向叠加 → 衔铁更牢靠吸向 N 极 → 保持落下';
    else if (type === 'phase') {
      if (result.picked) chain = '轨道3-4与局部1-2同为 25 Hz 且相位差符合 → 正向电磁转矩 → 翼片上摆 → 前接点 11-12 接通';
      else if (result.drive && s.localPower && s.phase === 'reversed') chain = '相位反接 180° → 产生反向电磁转矩 → 翼片被压向后接点止档 → 可靠落下（防护绝缘破损）';
      else chain = '缺少两路电源或频率/相位不符 → 不产生正向转矩 → 翼片落下 → 后接点 11-13 接通';
    } else chain = posPicked() ? '线圈励磁 → 磁通克服重锤片重力 → 衔铁吸向极靴止片 → 拉杆推珠带动前接点闭合' : '励磁消失 → 重锤片重力返回 → 衔铁落下 → 后接点闭合';
    $('action-chain').textContent = chain;
    if (contactStep !== null) chain = '机构观察暂停于选定位置。恢复随供电动作可继续观察实际时序。';
    $('action-chain').textContent = chain;
    $('state-reason').textContent = result.reasons.length ? result.reasons.join('；') + '。' : inTrack ? '此处仅说明轨道空闲检查条件；信号开放仍须满足完整联锁条件。' : '通电代表满足工作值/转极值条件。';
  }
  function posPicked() { return pose > .94; }

  function render() {
    const currMode = s.mode === 'curriculum', cbiMode = s.mode === 'cbi', figMode = s.mode === 'figures', signalMode = s.mode === 'signal';
    const trackMode = s.mode === 'track', stationMode = s.mode === 'station', benchMode = s.mode === 'bench';
    $('curriculum-tab').classList.toggle('active', currMode);
    $('bench-tab').classList.toggle('active', benchMode);
    $('signal-tab').classList.toggle('active', signalMode);
    $('track-tab').classList.toggle('active', trackMode);
    $('station-tab').classList.toggle('active', stationMode);
    $('cbi-tab').classList.toggle('active', cbiMode);
    if ($('figures-tab')) $('figures-tab').classList.toggle('active', figMode);
    $('curriculum-tab').setAttribute('aria-pressed', String(currMode));
    $('bench-tab').setAttribute('aria-pressed', String(benchMode));
    $('signal-tab').setAttribute('aria-pressed', String(signalMode));
    $('track-tab').setAttribute('aria-pressed', String(trackMode));
    $('station-tab').setAttribute('aria-pressed', String(stationMode));
    $('cbi-tab').setAttribute('aria-pressed', String(cbiMode));
    if ($('figures-tab')) $('figures-tab').setAttribute('aria-pressed', String(figMode));

    const was3dHidden = $('workspace-3d').hidden;
    $('curriculum-lab').hidden = !currMode;
    $('cbi-lab').hidden = !cbiMode;
    if ($('figures-lab')) $('figures-lab').hidden = !figMode;
    $('workspace-3d').hidden = currMode || cbiMode || figMode;
    if (!figMode && window.FigureLab && window.FigureLab.pause) window.FigureLab.pause();

    if (currMode) {
      if (window.CurriculumHub) {
        window.CurriculumHub.render($('curriculum-lab'), {
          onOpenPage: openPage,
          onLaunch: patch => {
            playing = false;
            applyScene(patch);
          }
        });
      }
      return;
    }
    if (cbiMode) {
      if (window.CbiLab) {
        window.CbiLab.render($('cbi-lab'), s, {
          onUpdateState: patch => { s = L.update(s, patch); render(); },
          onOpenPage: openPage,
          onLaunch: patch => {
            playing = false;
            applyScene(patch);
          }
        });
      }
      return;
    }
    if (figMode) {
      if (window.FigureLab && $('figures-lab')) {
        window.FigureLab.render($('figures-lab'), s, {
          onOpenPage: openPage,
          onSelectFigure: id => { s = L.update(s, { figureId: id, figRouteIdx: null, figChapter: null }); render(); },
          onLaunch: patch => {
            playing = false;
            applyScene(patch);
          }
        });
      }
      return;
    }
    if (was3dHidden && renderer && $('viewport').clientWidth > 0 && $('viewport').clientHeight > 0) {
      const vw = $('viewport').clientWidth, vh = $('viewport').clientHeight;
      renderer.setSize(vw, vh); camera.aspect = vw / vh; camera.updateProjectionMatrix(); orbitDirty = true;
    }

    $('relay-list').hidden = signalMode;
    $('signal-list').hidden = !signalMode;
    $('lib-eyebrow').textContent = signalMode ? 'SECTION 2.3 · SIGNAL ASSEMBLIES' : 'RELAY & INTERFACE LABS';
    $('lib-title').textContent = signalMode ? '铁路信号机 3D 实验室' : '从接点到全站联锁';
    $('lib-intro').textContent = signalMode
      ? '严格依据第 2.3 节（PDF p.20–26）构建 6 类铁路信号机高柱/矮型实体，融合第 5.1 节灯丝与继电器电路，支持全拆解。'
      : '涵盖表4.1.1—4.1.4全部继电器、第4章自闭/5法防混线、第5章四线/五线制道岔与第13章安全驱采接口。';
    $('lib-note').innerHTML = signalMode
      ? '<span class="note-line"></span>我国铁路实行左侧行车制，信号机一般设于列车运行方向左侧；<br>信号熄灭或显示不规范时，均按停车信号办理（红灯 H）。'
      : '<span class="note-line"></span>常开、常闭说的是接点。<br>铁路“常态”按设备通常状态与安全侧确定（GJ、DBJ、SJ、DJ常态吸起↑；XJ、1DQJ、FDGJ常态落下↓）。';

    const cat = catalog[s.type];
    const sigCat = SIGNAL_CATALOG[s.signalType] || SIGNAL_CATALOG.inStation;
    const isSelfHold = benchMode && s.type === 'selfHold';
    const isTurnout = benchMode && s.type === 'turnoutLab';
    const isFiveWire = benchMode && s.type === 'fiveWireLab';
    const isCbiIo = benchMode && s.type === 'cbiIoLab';
    $('model-kicker').textContent = signalMode ? sigCat.kicker : stationMode ? '教材第 3 / 6 / 9 章 · 图 3.1.1 & 表 3.2.2 全站联锁' : trackMode ? (s.type === 'phase' ? '25 Hz 相敏轨道电路' : s.multi ? '50 Hz · 一送两受总检查' : '50 Hz 交流轨道电路') : cat.kicker;
    $('model-title').textContent = signalMode ? sigCat.name : stationMode ? '图 3.1.1 车站全作业 3D 联锁沙盘' : trackMode ? (s.multi && s.type === 'rectifier' ? '主 DGJ 与支 DGJ₁' : '轨道继电器 GJ') : cat.name;
    $('model-subtitle').textContent = signalMode ? sigCat.sub : stationMode ? '4 股道 3G/IG/IIG/4G · 10 架第 2.3 节 3D 信号机 · 表 3.2.2 全 33 条进路 · 组合架继电器联动（点击任意信号机或继电器拆解）' : trackMode ? '跟随列车前、后轮对，观察区段分路与故障如何转化为接点状态' : cat.sub;
    $('model-caption').textContent = signalMode ? `${S.signalModels[s.signalType].model} · 第2.3节结构拆解与第5.1节继电器联动` : stationMode ? '图3.1.1 上下行咽喉 + 表3.2.2 全33条进路 + 第2.3节信号机实景 + 组合架' : s.type === 'phase' ? '图5.3.3 二元二位接口 + 正交磁通翼片教学示意' : isSelfHold ? '图4.2.2 自闭电路 (FUJ+AJ+A) & 图4.3.2–4.3.5 五种防混线 3D 联动' : isTurnout ? '图5.2.2–5.2.3 单动道岔四线制 (1DQJ+2DQJ+DBJ/FBJ+ZD6自动开闭器/电机M)' : isFiveWire ? '图5.2.4–5.2.8 S700K 五线制三相交流道岔 (DBQ+BHJ+1DQJ/1DQJF+并联Z无电容C)' : isCbiIo ? '图11.3.2 / 13.2.3–13.2.4 计算机联锁动态驱采与脉冲变压器安全隔离 3D 联动' : (s.type === 'contacts' ? 'JWXC-1700 接点组微距 · 上/下托片与 11-12-13 转换' : S.models[s.type].model + ' · 教材原理与磁路复建');
    $('bench-controls').hidden = !benchMode || isSelfHold || isTurnout || isFiveWire || isCbiIo;
    $('signal-controls').hidden = !signalMode;
    $('selfhold-controls').hidden = !isSelfHold;
    $('turnout-controls').hidden = !isTurnout;
    $('fivewire-controls').hidden = !isFiveWire;
    $('cbiio-controls').hidden = !isCbiIo;
    $('track-controls').hidden = !trackMode;
    $('station-controls').hidden = !stationMode;
    $('phase-controls').hidden = !(benchMode || trackMode) || s.type !== 'phase';
    if (signalMode) {
      const sigSpec = S.signalModels[s.signalType];
      const curSig = result.signal;
      $('sig-variant-label').textContent = sigSpec.variantNames[curSig.variant] || '机构型式';
      $('signal-variants').innerHTML = sigSpec.variants.map(v => `<button data-sig-var="${v}" class="${v === curSig.variant ? 'active' : ''}">${sigSpec.variantNames[v]}</button>`).join('');
      const map = L.SIGNAL_ASPECTS[s.signalType];
      const activeAsp = curSig.intendedAspect || curSig.aspect;
      $('signal-aspects').innerHTML = Object.entries(map).map(([k, info]) => `<button data-sig-asp="${k}" class="${k === activeAsp ? 'active' : ''}">${info.label}</button>`).join('');
      $('signal-filament').value = s.signalFilament || 'main';
      const hasInd = ['depFour', 'depThree'].includes(s.signalType);
      $('signal-ind-wrap').hidden = !hasInd;
      $('signal-ind').checked = s.signalIndicator === 'right';
      const hasDualPermissive = ['UU', 'LU', 'USU', 'LL'].includes(activeAsp);
      if ($('signal-dj2-wrap')) $('signal-dj2-wrap').hidden = !hasDualPermissive;
      if ($('signal-dj2')) $('signal-dj2').checked = !!s.signalSecondFilamentFault;
      document.querySelectorAll('[data-sig-type]').forEach(b => { const act = b.dataset.sigType === s.signalType; b.classList.toggle('active', act); b.setAttribute('aria-pressed', String(act)); });
    }
    const isACType = ['rectifier', 'phase', 'filament'].includes(s.type);
    $('polarity-controls').hidden = isACType;
    $('ac-controls').hidden = !isACType;
    $('filament-controls').hidden = s.type !== 'filament';
    $('filament-sys').value = s.filamentSignalSystem;
    $('filament-mode').value = s.filamentMode;
    $('filament-out-wrap').hidden = s.filamentSignalSystem !== 'outDep';
    $('filament-out-aspect').value = s.filamentOutAspect;
    $('rectifier-waveforms').hidden = s.type !== 'rectifier';
    if (s.type === 'rectifier' && !stationMode) {
      const wave = (x0, half) => Array.from({ length: 101 }, (_, i) => {
        const v = Math.sin(i / 100 * Math.PI * 4);
        return `${i ? 'L' : 'M'}${(x0 + i * 2.5).toFixed(1)},${(46 - 16 * (result.drive ? (half ? Math.max(0, v) : v) : 0)).toFixed(1)}`;
      }).join('');
      $('rectifier-waveforms').innerHTML = `<svg viewBox="0 0 640 75" role="img" aria-label="交流正负交替，半波整流后仅保留单方向波形"><text x="18" y="15">8—7 端交流输入 · 示意</text><text x="354" y="15">内部半波整流后 · 示意</text><path d="M18,46H268M354,46H604" class="wave-axis"/><path d="${wave(18, false)}" class="wave-in"/><path d="${wave(354, true)}" class="wave-out"/></svg>`;
    }
    $('power-label').textContent = s.type === 'phase' ? '轨道线圈 3—4 交流电源（图5.3.3）' : s.type === 'filament' ? 'BX-30 信号点灯变压器电源（图5.1.2 / 5.1.3）' : '线圈电源 · ' + S.models[s.type].rated;
    $('power-hint').textContent = s.type === 'latching' ? '1进4出转定位，4进1出转反位；断电后永磁保持原位' : s.type === 'biased' ? '正向(1正4负)吸起；反向(4正1负)加强保持落下' : ['slowRelease', 'heavySlow'].includes(s.type) ? '先通电吸起，再点“断电”观察铜套涡流缓放落下过程' : s.type === 'timeRelay' ? '通电后先经电子计时充电，延时满后衔铁吸起' : '先通电吸起，再切断电源观察重锤片返回动作';
    document.querySelectorAll('[data-polarity]').forEach(b => { const active = Number(b.dataset.polarity) === s.polarity; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
    document.querySelectorAll('[data-ac]').forEach(b => { const active = !!Number(b.dataset.ac) === !!s.polarity; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
    document.querySelectorAll('[data-type]').forEach(b => { const active = !stationMode && !signalMode && b.dataset.type === s.type; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
    document.querySelectorAll('[data-route]').forEach(b => { const active = b.dataset.route === s.stationRoute; b.classList.toggle('active', active); });
    document.querySelectorAll('[data-stage]').forEach(b => { const active = Number(b.dataset.stage) === s.stationStage; b.classList.toggle('active', active); });
    document.querySelectorAll('[data-to-stage]').forEach(b => { const active = Number(b.dataset.toStage) === s.toStage; b.classList.toggle('active', active); });
    document.querySelectorAll('[data-fw-stage]').forEach(b => { const active = Number(b.dataset.fwStage) === s.fwStage; b.classList.toggle('active', active); });
    if (isSelfHold) {
      const shR = result.selfHold;
      $('sh-press-a').classList.toggle('active', s.shButton);
      $('sh-release-a').classList.toggle('active', !s.shButton);
      $('sh-play-demo').textContent = playing ? 'Ⅱ 暂停自闭演示' : '▶ 自动演示 4 步自闭全过程';
      $('sh-fuj').checked = s.shFujPicked;
      $('sh-wire-break').checked = s.shWireBreak;
      $('sh-cross-method').value = s.shCrossMethod;
      $('sh-cross-fault').value = s.shCrossFault;
      $('sh-shunt-wrap').hidden = s.shCrossMethod !== 'shunt';
      $('sh-shunt-break').checked = s.shShuntLineBreak;
      $('selfhold-step-label').textContent = shR.wireBreak ? '🛡 断线故障：共用电路断开，AJ 安全落下↓'
        : shR.wrongMixEnergized ? '⚠ 危险混线旁路：AJ/KJF 未经启动即误吸起↑！'
        : shR.crossFault === 'active' ? '🛡 混线防护生效：继电器安全保持落下↓'
        : s.shButton ? '步骤 1/4 · 按下自复按钮 A，启动支路导通 AJ↑'
        : s.shLatched ? '步骤 2/4 · 松开按钮 A，AJ 经 11-12 前接点自闭保持↑'
        : s.shFujPicked ? '步骤 3/4 · FUJ↑ 断开 11-13，AJ 失磁复原↓'
        : '常态落下 · 等待按压自复按钮 A';
    }
    if (isTurnout) {
      $('to-obstacle').checked = s.toObstacle;
      $('to-lid-open').checked = s.toLidOpen;
      if ($('to-sj-locked')) $('to-sj-locked').checked = !!s.toSjLocked;
      if ($('to-ind-fault')) $('to-ind-fault').value = s.toIndFault || 'none';
      $('turnout-stage-label').textContent = TURNOUT_STAGE_NAMES[s.toStage];
      $('play-turnout').textContent = playing ? 'Ⅱ 暂停转换' : '▶ 自动演示转换';
    }
    if (isFiveWire) {
      $('fw-phase-loss').checked = s.fwPhaseLoss;
      $('fw-lid-open').checked = s.fwLidOpen;
      $('fivewire-stage-label').textContent = FIVEWIRE_STAGE_NAMES[s.fwStage];
      $('play-fivewire').textContent = playing ? 'Ⅱ 暂停转换' : '▶ 自动演示转换';
    }
    if (isCbiIo) {
      $('cbi-io-mode').value = s.cbiMode;
      $('cbi-io-cmd').checked = s.cbiCmd;
      $('cbi-io-fault').value = s.cbiFault;
      $('cbiio-label').textContent = result.cbiIo.fault === 'stuckHigh' ? '⚠ CPU卡死常高电平 1 → T隔直/电容泵阻断 → J 安全落下' : result.cbiIo.relayPicked ? '✓ 动态脉冲/编码校核通过 → 安全侧输出有效 ↑' : '↓ 无动态脉冲或校验未通过 → 0V 安全落下';
    }
    if (stationMode) {
      $('btn-zqa').classList.toggle('active', s.cancelMode === 'zqa');
      $('btn-zra').classList.toggle('active', s.cancelMode === 'zra');
      $('btn-sga').classList.toggle('active', s.cancelMode === 'sga');
      const rt = J.resolveRoute(s.stationRoute);
      const stRender = result.station;
      if ($('btn-guide')) {
        $('btn-guide').classList.toggle('active', !!(stRender && stRender.relays.YXJ));
        $('btn-guide').disabled = rt.kind !== 'receive' || s.stationStage < 4;
      }
      if ($('guide-controls')) {
        const showGuideBar = rt.kind === 'receive' && s.stationStage >= 4;
        $('guide-controls').hidden = !showGuideBar;
        if (showGuideBar && stRender) {
          if ($('guide-manual-confirm')) $('guide-manual-confirm').checked = !!s.guideManualConfirm;
          if ($('btn-guide-totallock')) $('btn-guide-totallock').classList.toggle('active', !!s.guideTotalLock);
          if ($('guide-firstsec-fault')) $('guide-firstsec-fault').checked = !!s.guideFirstSecFault;
          if ($('hostile-route-fault')) $('hostile-route-fault').checked = !!s.hostileRoute;
          if ($('btn-guide-hold')) {
            const showHold = !!(stRender.guideActive && stRender.guideFirstSecFault && stRender.relays.YXJ);
            $('btn-guide-hold').hidden = !showHold;
            if (showHold) $('btn-guide-hold').textContent = `⏱ 维持引导开放 (${stRender.guideHoldRemaining.toFixed(1)}s/15s)`;
          }
          if ($('guide-status-hint')) {
            $('guide-status-hint').textContent = stRender.guideActive
              ? (stRender.relays.YXJ
                  ? (stRender.guideFirstSecFault ? `✓ 首区段故障 15s 维持中 (余 ${stRender.guideHoldRemaining.toFixed(1)}s)` : (stRender.guideTotalLockActive ? '✓ 已人工确认并办理咽喉总锁闭 · HB开放' : '✓ 引导进路锁闭 · HB开放'))
                  : '🔒 引导信号已关闭 · 引导进路保持锁闭，须办 ZRA 解锁')
              : (stRender.guideBlockReasons && stRender.guideBlockReasons.length ? `⚠ ${stRender.guideBlockReasons[0]}` : '✓ 主体红灯与锁闭条件满足，可办理 HB 引导');
          }
        }
      }
      $('station-net-view').value = s.stationNetView;
      $('blind-diag-bar').hidden = s.blindFault === 'none';
      if ($('station-route-322')) $('station-route-322').value = rt.code;
      if ($('station-lock-card')) {
        $('station-lock-card').innerHTML = `<span><strong>表3.2.2 第${rt.num}条</strong> ${rt.title}</span><span><strong>按钮:</strong> ${rt.buttons}</span><span><strong>信号:</strong> ${rt.sig}:${rt.aspect}${rt.indicator ? ' + ' + rt.indicator : ''}</span><span><strong>道岔:</strong> ${rt.switchesRaw}</span><span><strong>敌对:</strong> ${rt.hostileRaw}</span><span><strong>区段:</strong> ${rt.sectionsText}</span><span><strong>迎面/其他:</strong> ${rt.headOn}${rt.otherLock ? ' · ' + rt.otherLock : ''}</span>`;
      }
      const mt = result.station && result.station.multiTrain;
      document.querySelectorAll('#station-mt-pills [data-mt]').forEach(b => b.classList.toggle('active', b.dataset.mt === (s.multiTrainMode || 'none')));
      if ($('station-speed')) $('station-speed').value = String(stationSpeedScale);
      if ($('station-pause-change')) $('station-pause-change').checked = pauseOnRelayChange;
      if ($('station-multitrain-mode')) $('station-multitrain-mode').value = s.multiTrainMode || 'none';
      if ($('station-train-b-wrap')) $('station-train-b-wrap').hidden = !mt || !mt.active;
      if ($('station-route-b') && mt && mt.active) {
        $('station-route-b').value = mt.routeB || 'R14';
        $('station-route-b').disabled = s.multiTrainMode === 'track_occupied';
      }
      if ($('station-train-b') && mt && mt.active) $('station-train-b').value = mt.trainB ?? (s.secondTrain ?? -26);
      if ($('station-pos-b-label') && mt && mt.active) $('station-pos-b-label').textContent = (mt.trainB ?? (s.secondTrain ?? -26)).toFixed(1);
      if ($('station-multitrain-note')) {
        $('station-multitrain-note').hidden = !mt || !mt.active;
        if (mt && mt.active) {
          $('station-multitrain-note').innerHTML = `<span><strong>${mt.scenarioName}</strong></span><span>${mt.conflictReason}</span><span style="color:var(--muted)">${mt.scenarioNote}</span>`;
        }
      }
    }
    for (const [id, key] of [['labels', 'labels'], ['field', 'field'], ['cover', 'cover'], ['slow', 'slow'], ['power', 'power'], ['rail-break', 'railBreak'], ['receiver-break', 'receiverBreak'], ['multi', 'multi'], ['branch-occupied', 'branchOccupied'], ['local-power', 'localPower'], ['lamp-fault', 'lampFault'], ['switch-fault', 'switchFault'], ['poor-shunt', 'poorShunt']]) $(id).checked = s[key];
    renderRelayChangeBanner();
    const inBlind = stationMode && s.blindFault !== 'none';
    for (const id of ['lamp-fault', 'switch-fault', 'poor-shunt']) $(id).disabled = inBlind;
    $('frequency').value = s.frequency; $('phase').value = s.phase;
    $('explode-value').textContent = s.explode + '%'; $('explode').value = s.explode;
    $('multi-label').hidden = s.type !== 'rectifier';
    $('branch-occupied-label').hidden = s.type !== 'rectifier' || !s.multi;
    $('timeline-panel').hidden = !trackMode && !stationMode;
    $('principle').innerHTML = signalMode
      ? sigCat.principle.map(p => `<p>${p}</p>`).join('')
      : stationMode
        ? `<p><strong>教材第 3 / 6 / 8 / 9 章全作业联锁核心：</strong>①<strong>表 3.2.2 全 33 条进路</strong>严格区分接车（含股道）、发车（不含股道、检查 BS）、X_F 反向接发及调车（并置/差置背向按钮与专设终端按钮 SDZA）；②选排 1–7 线(KJ↑) → 8–9 线锁闭 → 11 线开放第 2.3 节信号机(LXJ↑) → 12–13 线三点检查解锁。</p><p><strong>三大解锁与故障处理：</strong>①预先锁闭(JYJ↑)用 <strong>ZQA 总取消</strong>，接近锁闭(JYJ↓)须用 <strong>ZRA 总人工解锁(3min/30s)</strong>；②分路遗留白光带(检 DGJ↑ 且 QJJ↓)按 <strong>SGA+ZRA 区故解（图9.6.1）</strong>；③<strong>CJ(8.4节)</strong> 兼有快吸慢放特性协助三点解锁。</p>`
        : cat.principle.map(p => `<p>${p}</p>`).join('');
    renderQuiz();
    $('reference').textContent = signalMode ? sigCat.ref : stationMode ? '第 2.3 / 2.6 / 3.1—3.4 节（PDF p.20—51）、第 6.4 节、第 8.4 / 9.5—9.6 节；图 3.1.1、表 3.2.2、图 9.6.1。' : cat.ref;
    $('model-boundary').textContent = signalMode ? S.signalModels[s.signalType].geometry : stationMode ? '站场拓扑、道岔编号、信号机配置与全部 33 条进路均严格对照图 3.1.1 与表 3.2.2。车体与加减速度采用教学缩放。' : S.models[s.type].geometry + ' 装配尺寸、材料、紧固件与安装位置尚未按厂家图核实，接点为展开观察排列。';
    $('actual-model').textContent = signalMode ? S.signalModels[s.signalType].model : stationMode ? '图 3.1.1 站场 + 第 2.3 节信号机 + 6502 组合架' : S.models[s.type].model;
    const spec = signalMode ? S.signalModels[s.signalType] : S.models[s.type];
    $('model-specs').innerHTML = signalMode
      ? statusRow('机构与灯位（PDF p.26）', spec.contacts, 'on') + statusRow('常态显示与规定', spec.freeContactState) + statusRow('第 5.1 节继电器常态', spec.railwayNormalState, 'on') + statusRow('全部许可显示及含义', spec.working) + statusRow('额定点灯 / 监督条件', spec.rated)
      : stationMode
        ? statusRow('常态吸起 ↑（平时11-12闭合）', 'GJ/DGJ · DBJ · DJ/DZJ · ZXJ(进站) · SJ · 1LJ/2LJ · CJ · ZCJ · JYJ', 'on') + statusRow('常态落下 ↓（平时11-13闭合）', 'XJ(LXJ/DXJ) · 2DJ · DCJ/FCJ · FBJ · 1DQJ · FDGJ · AJ/LJJ/LFJ/FKJ/KJ · XJJ/QJJ · ZJ') + statusRow('常态定位（平时111-112闭合）', '2DQJ（JYJXC-220/220 极性保持继电器）', 'warning') + statusRow('判断铁律（教材4.1.2节）', '常态与设备通常状态一致，释放(落下)必须对应安全侧')
        : statusRow('失电接点（常开/常闭）', spec.freeContactState) + statusRow('铁路规定常态（教材依据）', spec.railwayNormalState, 'on') + statusRow('接点配置', spec.contacts) + statusRow('线圈电阻', spec.resistance) + statusRow('额定值', spec.rated) + statusRow('工作／转极', spec.working) + statusRow('释放／保持', spec.release) + (spec.codingPins && spec.codingPins !== '本节未列' ? statusRow('鉴别销／符号', spec.codingPins) : '');
    const nonExport = !signalMode && (!!comparisonKey || ['phase', 'selfHold', 'turnoutLab', 'fiveWireLab', 'cbiIoLab'].includes(s.type) || stationMode);
    $('open-spec-table').hidden = nonExport;
    $('open-spec-table').textContent = signalMode ? '核对第2.3节机构总表 →' : '核对表4.1.4原页 →';
    $('export-model').disabled = nonExport;
    $('export-model').textContent = nonExport ? '沙盘／系统专题不导出单件GLB' : '↓ 导出 GLB 模型';
    $('cover').disabled = nonExport || signalMode;
    $('explode').disabled = false;
    $('field').disabled = stationMode || signalMode;
    renderStudy(); renderStatus(); renderCircuit(); renderPartList(); updateTrainLabel(); renderSource();
  }
  function updateTrainLabel() {
    if (s.mode === 'curriculum' || s.mode === 'cbi') return;
    if (s.mode === 'station') {
      $('station-train').value = s.stationTrain;
      $('station-direction').value = s.stationDirection || 1;
      $('station-position').textContent = `前轮对坐标 ${s.stationTrain.toFixed(1)} · ${playing ? (s.stationDirection < 0 ? '倒退' : '前进') : '暂停'} · ${(trainMotion.speed * stationSpeedScale).toFixed(1)} 坐标单位/s`;
      const traction = s.pantograph && pantographPose > .98 && s.catenaryPower && s.mainBreaker;
      $('main-breaker').disabled = !s.pantograph || !s.catenaryPower;
      $('traction-state').textContent = `${pantographPose > .98 ? '受电弓升起' : pantographPose < .02 ? '受电弓降下' : '受电弓升降中'} · ${traction ? '牵引供电条件成立' : '牵引供电中断'} · ${trainMotion.braking || s.trainBrake ? '制动' : '牵引/惰行'}。速度与加减速度为教学设定`;
      for (const [id, key] of [['pantograph','pantograph'],['catenary-power','catenaryPower'],['main-breaker','mainBreaker'],['train-brake','trainBrake']]) $(id).checked = s[key];
      $('station-stage-label').textContent = STAGE_NAMES[s.stationStage];
      const mtBtn = result.station && result.station.multiTrain;
      const { maxPosA: maxABtn, maxPosB: maxBBtn } = computeStationMaxPos(result.station);
      const bothEndedBtn = s.stationStage === 5 && s.stationDirection !== -1 && s.stationTrain >= maxABtn - 1 && (!mtBtn || !mtBtn.active || mtBtn.mode === 'track_occupied' || (mtBtn.trainB ?? -26) >= maxBBtn - 1);
      $('play-station').textContent = playing ? 'Ⅱ 暂停仿真' : bothEndedBtn ? '↻ 重新演示全流程' : '▶ 继续运行仿真';
      return;
    }
    $('train-position').value = s.front;
    $('train-position-label').textContent = s.front < 0 ? '头车前轮尚未进入区段' : s.front <= 100 ? `头车前轮：${Math.round(s.front)}% · 3 节列车轮对分路占用` : s.front <= 140 ? '头车已越过绝缘节，中/尾车轮对仍在区段内分路' : '3 节列车前、后轮对均已出清区段';
    $('play-train').textContent = playing ? 'Ⅱ 暂停运行' : s.front >= 165 ? '↻ 再次通过' : '▶ 列车通过';
  }
  function renderPartList() {
    if (s.mode === 'curriculum' || s.mode === 'cbi') return;
    const names = s.mode === 'signal'
      ? ['shield', 'housing', 'hood', 'lens', 'optics', 'filament', 'mast', 'foundation', 'plate', ...(result.signal.variant !== 'b' ? ['ladder', 'transformer'] : []), ...(['depFour', 'depThree'].includes(s.signalType) ? ['indicator'] : [])]
      : s.mode === 'station'
      ? ['signalX', 'switchMachine', 'rail', 'insulation', 'train', 'pantograph', 'catenary', 'wheel', 'rackRelay', 'copperSleeve']
      : s.type === 'phase'
        ? ['trackCoil', 'localCoil', 'armature', 'rod', 'front', 'back', 'common']
        : s.type === 'selfHold'
          ? ['coil', 'front', 'back', 'common', 'terminals', 'base']
          : ['turnoutLab', 'fiveWireLab'].includes(s.type)
            ? ['switchMachine', 'copperSleeve', 'permanent', 'rectifier', 'front', 'back', 'rail']
            : s.type === 'cbiIoLab'
              ? ['coil', 'permanent', 'armature', 'front', 'back', 'common', 'base']
              : ['coil', ...( ['slowRelease', 'heavySlow', 'filament'].includes(s.type) ? ['copperSleeve'] : []), ...(s.type === 'timeRelay' ? ['timer'] : []), 'core', 'pole', 'yoke', 'armature', ...(s.type === 'biased' || s.type === 'latching' ? ['permanent'] : ['weight']), ...(s.type === 'rectifier' || s.type === 'filament' ? ['rectifier'] : ['terminals']), 'rod', 'front', 'common', 'back'];
    $('part-list').innerHTML = names.map(k => `<button data-part="${k}" class="${selectedPart === k ? 'active' : ''}" aria-pressed="${selectedPart === k}">${parts[k][0].split('（')[0].split(' ')[0]}</button>`).join('');
  }
  function renderPart() {
    $('part-title').textContent = selectedPart && parts[selectedPart] ? parts[selectedPart][0] : '点击模型中的部件';
    $('part-description').textContent = selectedPart && parts[selectedPart] ? parts[selectedPart][1] : '点击三维部件或下方标签，查看教材原理与安全设计作用。';
    renderPartList(); renderPartSource();
    if (selectionBox) { scene.remove(selectionBox); selectionBox.geometry.dispose(); selectionBox.material.dispose(); selectionBox = null; }
    if (scene && selectedPart) { selectionBox = new THREE.Box3Helper(new THREE.Box3(), 0x7de0bd); scene.add(selectionBox); }
  }
  function renderSource() {
    const figs = s.mode === 'signal'
      ? (S.signalModels[s.signalType] ? S.signalModels[s.signalType].figures : ['2-3-5'])
      : s.mode === 'station'
      ? (s.cancelMode === 'sga' || s.blindFault === 'stuckSection' ? ['9-6-1', '8-3-2', '3-1-1', '3-2-2a', '3-2-2b'] : ['3-1-1', '8-3-2', '3-2-2a', '3-2-2b', '2-6-1', '9-6-1'])
      : s.mode === 'track'
        ? (s.type === 'phase' ? ['5-3-3'] : s.multi ? ['5-3-2', '5-3-1'] : ['5-3-1'])
        : s.type === 'selfHold'
          ? (['polarity', 'doubleBreak', 'shunt'].includes(s.shCrossMethod)
              ? [{ polarity: '4-3-3', doubleBreak: '4-3-4', shunt: '4-3-5' }[s.shCrossMethod], '4-2-2', '4-3-1', '4-3-2']
              : ['4-2-2', '4-3-1', '4-3-2', '4-3-3'])
          : s.type === 'filament' && s.filamentSignalSystem === 'outDep'
            ? ['5-1-3', '5-1-2']
            : S.models[s.type].figures;
    if (!figs.includes(currentFigure)) currentFigure = figs[0];
    const fig = S.figures[currentFigure];
    const figLblMap = { '2-3-t1': '表2.3.1', '2-3-5': '表2.3.3配置', '3-2-2a': '表3.2.2(上)', '3-2-2b': '表3.2.2(下)' };
    $('figure-tabs').innerHTML = figs.map(id => `<button data-figure="${id}" class="${id === currentFigure ? 'active' : ''}">${figLblMap[id] || ('图' + id.replaceAll('-', '.'))} · 书内${S.figures[id].book}页</button>`).join('');
    $('figure-image').src = `textbook/fig-${currentFigure}.jpg`;
    $('figure-image').alt = fig.title;
    $('figure-caption').textContent = `${fig.title}｜书内${fig.book}页／PDF第${fig.page}页。摘录自教材原页，点击可放大完整原页。`;
    let binding = '';
    if (s.mode === 'signal') binding = S.signalModels[s.signalType].geometry;
    else if (s.mode === 'station') binding = '教材第 2.3 / 2.6 / 3.1—3.4 / 6.4 / 8.4 / 9.5—9.6 节：涵盖图 3.1.1 完整上下行咽喉、表 3.2.2 全 33 条进路、第 2.3 节精美信号机、ZQA/ZRA/SGA(图9.6.1区故解) 与 1–15 线透视。';
    else if (s.type === 'selfHold') binding = '教材第 4.2.1 节图 4.2.2 与第 4.3 节图 4.3.1—4.3.5（PDF p.62–67）：自闭回路与五种防混线方法（位置法/极性法/双断法/独立电源法/分路法）逐项对比。';
    else if (s.type === 'turnoutLab') binding = '教材第 5.2.2 节图 5.2.1—5.2.3（PDF p.77—81）：单动道岔四线制 1DQJ/2DQJ/DBJ/FBJ 与自动开闭器 A/B 爪先后动作过程。';
    else if (s.type === 'fiveWireLab') binding = '教材第 5.2.3 节图 5.2.4—5.2.8（PDF p.82—86）：S700K 三相交流五线制道岔（DBQ+BHJ 断相保护、2DQJ 换相、并联整流 Z 与 R₂ 取消电容 C）。';
    else if (s.type === 'cbiIoLab') binding = '教材第 11.3 节图 11.3.2（PDF p.224）与第 13.2 节图 13.2.2—13.2.4（PDF p.257—260）：计算机联锁不对称采集与脉冲变压器/电容泵动态故障安全输出。';
    else if (s.mode === 'track' && s.type === 'rectifier') binding = s.multi ? '图5.3.2(a)：同一 BG₁-50 送电端并联向主股道受电端与道岔侧股分支受电端供电；支 DGJ₁ 前接点串入主 DGJ 励磁回路，任一分支分路或断线均使主 DGJ 落下。' : '图5.3.1：AC220 V → BG₁-50 → 2.2 Ω／220 W限流电阻 → 钢轨 → BZ₄（或BZ₅-A）→ JZXC-480 的 8、7 端。轮对分路或断轨均使 GJ 落下。';
    else if (s.type === 'phase') binding = '图5.3.3：轨道线圈 3—4（跨接防雷补偿器 Z、25 Hz 防护盒 HF）与局部线圈 1—2（并接电容 C）构成二元输入；两路 25 Hz 信号满足规定相位差时产生正向转矩吸起，反相时产生反向转矩可靠落下。';
    else if (s.type === 'latching') binding = '磁路依据图4.1.5（永久磁铁左N右S与轭铁相接）；JYJXC-220/220 参数依据表4.1.4，极性定/反位接点编号 111(中)/112(定)/113(反) 依据表4.1.3。';
    else binding = S.models[s.type].geometry + ' 已列教材页可供核对，功能示意的接点数量与布局不能用于实物接线。';
    $('figure-binding').textContent = binding;
    renderSourceLedger();
  }
  let currentModalPage = 1;
  function openPage(page) {
    currentModalPage = Math.max(1, Math.min(277, Number(page) || 1));
    $('original-title').textContent = `${currentModalPage <= 10 ? '扉页/目录' : '教材书内第' + (currentModalPage - 10) + '页'}／PDF第${currentModalPage}页`;
    if ($('orig-input')) $('orig-input').value = currentModalPage;
    if ($('orig-prev')) $('orig-prev').disabled = currentModalPage <= 1;
    if ($('orig-next')) $('orig-next').disabled = currentModalPage >= 277;
    $('original-image').src = `textbook/page-${String(currentModalPage).padStart(3, '0')}.jpg`;
    if (!$('original-dialog').open) $('original-dialog').showModal();
  }
  function svgWrap(content, height = 245) { return `<svg viewBox="0 0 640 ${height}" role="img" aria-label="同步原理图">${content}</svg>`; }
  function wire(d, live, extra = '') { return `<path d="${d}" class="wire${live ? ' live' : ''}" ${extra}/>`; }
  function dot(x, y, live) { return `<circle cx="${x}" cy="${y}" r="3.2" fill="${live ? '#7de0bd' : '#8194a7'}"/>`; }
  function lamp(x, y, on, text) { return `<circle cx="${x}" cy="${y}" r="12" fill="${on ? '#244e3e' : '#172231'}" stroke="${on ? '#7de0bd' : '#63778b'}" stroke-width="1.5"/><path d="M${x - 6},${y - 6}l12,12m-12,0l12,-12" stroke="${on ? '#7de0bd' : '#63778b'}"/><text x="${x + 16}" y="${y - 17}">${text}</text>`; }
  function flow(d, reverse = false) {
    const delay = -((performance.now() / 1000) % 1.5);
    return `<path d="${d}" class="current-flow" style="animation-delay:${delay.toFixed(3)}s;animation-direction:${reverse ? 'reverse' : 'normal'}"/>`;
  }
  function benchSwitchD() {
    const c = contacts(), switchY = (180 - pose * 60).toFixed(1);
    return `M265,150L${c.moving ? 335 : 345},${switchY}`;
  }
  function updateBenchSwitchInPlace() {
    const arm = $('bench-switch-arm');
    if (arm) arm.setAttribute('d', benchSwitchD());
  }

  // 专题 A 原理图：图 4.2.2(b) 自闭电路 & 图 4.3.1–4.3.5 五种防混线方法同步对比
  function renderSelfHoldCircuit() {
    const sh = result.selfHold;
    $('circuit-title').textContent = '图 4.2.2(b) 自闭电路 & 图 4.3.1–4.3.5 断线与五种电缆防混线体制对比';
    let g = `<text x="20" y="20">左：图 4.2.2(b) 典型自闭电路（共用电路 + 启动电路 + 自闭电路）</text>`;
    g += `<text x="488" y="20">右：第 4.3.2 节 5 种防混线方法原理与故障注入结果</text>`;

    g += `<circle cx="42" cy="115" r="11" class="circuit-symbol ${!sh.wireBreak ? 'live' : ''}"/><text x="42" y="119" text-anchor="middle" style="font-size:10px">KZ</text>`;
    g += wire('M53,115H92', !sh.wireBreak);
    if (sh.wireBreak) {
      g += `<path d="M92,115L118,96" stroke="#f3959f" stroke-width="2.5"/><text x="105" y="88" text-anchor="middle" style="fill:#f3959f;font-size:10px">✕ 断线</text>`;
    } else g += wire('M92,115H122', true);
    g += wire('M122,115H160', !sh.wireBreak);
    g += dot(160, 115, !sh.wireBreak) + dot(222, 115, sh.commonLive);
    g += wire(sh.fujPicked ? 'M160,115L215,93' : 'M160,115H222', sh.commonLive);
    g += `<text x="191" y="136" text-anchor="middle">FUJ 11-13</text><text x="191" y="151" text-anchor="middle" class="small-label">③共用(${sh.fujPicked ? '断开' : '常闭'})</text>`;
    g += wire('M222,115H248', sh.commonLive) + dot(248, 115, sh.commonLive);

    g += wire('M248,115V68H285', sh.commonLive);
    g += dot(285, 68, sh.commonLive) + dot(348, 68, sh.startBranchLive);
    g += wire(sh.buttonClosed ? 'M285,68H348' : 'M285,52H348', sh.startBranchLive);
    g += `<path d="M316,40v14" stroke="#7de0bd" stroke-width="2"/><path d="M306,40h20" stroke="#7de0bd" stroke-width="2.5"/>`;
    g += `<text x="316" y="33" text-anchor="middle">按钮 A (${sh.buttonClosed ? '按下' : '松开'})</text><text x="316" y="86" text-anchor="middle" class="small-label">①启动支路</text>`;
    g += wire('M348,68H375V115', sh.startBranchLive);

    g += wire('M248,115V165H285', sh.commonLive);
    g += dot(285, 165, sh.commonLive) + dot(348, 165, sh.holdBranchLive);
    g += wire(sh.ajPicked && sh.holdBranchLive ? 'M285,165H348' : 'M285,165L340,145', sh.holdBranchLive);
    g += `<text x="316" y="185" text-anchor="middle">AJ 11-12 前接点</text><text x="316" y="201" text-anchor="middle" class="small-label">②自闭支路</text>`;
    g += wire('M348,165H375V115', sh.holdBranchLive) + dot(375, 115, sh.ajPicked);

    g += wire('M375,115H395', sh.ajPicked);
    g += `<rect x="395" y="99" width="46" height="32" rx="4" class="circuit-symbol ${sh.ajPicked ? 'live' : ''}"/><text x="418" y="119" text-anchor="middle">AJ</text>`;
    g += wire('M441,115H460', sh.ajPicked);
    g += `<circle cx="468" cy="115" r="10" class="circuit-symbol ${sh.ajPicked ? 'live' : ''}"/><text x="468" y="119" text-anchor="middle" style="font-size:9px">KF</text>`;
    if (sh.startBranchLive) g += flow('M53,115H248V68H375V115H458');
    if (sh.holdBranchLive && !sh.wrongMixEnergized) g += flow('M53,115H248V165H375V115H458');
    if (sh.wrongMixEnergized) {
      g += `<path d="M53,115V212H385V115" fill="none" stroke="#f3959f" stroke-width="2.4" stroke-dasharray="5 3"/>`;
      g += `<text x="218" y="226" text-anchor="middle" style="fill:#f3959f;font-size:10px;font-weight:600">⚠ 危险混线旁路绕过控制接点直接励磁 AJ/KJF！</text>`;
    }

    g += `<path d="M480,28V225" stroke="#2c3e50" stroke-dasharray="4 4"/>`;
    const isNaive = sh.crossFault === 'naive';
    const isActive = sh.crossFault === 'active';
    const methodSpecs = {
      position: ['方法1 · 位置法(远端供电·图4.3.2)', '室内[线圈] ══电缆══ 室外[接点 + 电源 KZ/KF]', '混线直接短路电源烧熔丝，室内继电器 0V 可靠落下（完全故障—安全）'],
      polarity: ['方法2 · 极性法(反极性串偏极·图4.3.3)', '1JBJ(偏极+) 与 2JBJ(偏极-) 异极串联于两芯电缆 Q/H', 'Q线混入同极KZ维持原态；混入异极KF或短路熔断器时1JBJ/2JBJ双落导向安全'],
      doubleBreak: ['方法3 · 双断法(双极切断·图4.3.4)', '去线侧受控制接点切断 · 回线侧亦设独立控制接点切断', '单芯混线电源无法构成完整闭合回路，大幅降低危险侧误吸概率'],
      isolatedPower: ['方法4 · 独立电源法(电源隔离开)', '不同对象各配独立隔离变压器供电，禁止共用公共回线 KF', '防止异电源经公共回线串电造成跨回路混线误动作'],
      shunt: ['方法5 · 分路法/等电位(KJF·图4.3.5)', '平时靠分路接点将 KJF 线圈两端短接等电位（分路线自身不受查）', sh.shuntBroken ? '⚠ 警告：分路线已断线 + 电缆混线 → KJF 立即致命误吸！（非全故障安全）' : '若分路线完好，混线被分路线旁路；但若分路线先断线则失效！']
    };
    const ms = methodSpecs[sh.method] || methodSpecs.position;
    g += `<rect x="492" y="34" width="372" height="72" rx="5" fill="${isNaive ? '#2d1a20' : '#121b27'}" stroke="${isNaive ? '#f3959f' : '#35485a'}"/>`;
    g += `<text x="504" y="54" style="fill:${isNaive ? '#f3959f' : '#b8c5d4'};font-weight:600">反例对比：图4.3.2(a) 同端供电错误接法</text>`;
    g += `<text x="504" y="74" class="small-label">室内[KZ + 线圈 + KF] ══长电缆(混线)══ 室外[接点断开]</text>`;
    g += `<text x="504" y="94" style="fill:${isNaive ? '#f3959f' : '#92a6ba'}">${isNaive ? '⚠ 激活：混线绕过断开接点 → AJ 致命误吸起！' : '缺陷：电源与继电器同侧时，电缆两芯混线即误吸'}</text>`;

    const badShunt = isActive && sh.method === 'shunt' && sh.shuntBroken;
    g += `<rect x="492" y="116" width="372" height="100" rx="5" fill="${badShunt ? '#331c22' : isActive ? '#15332b' : '#121b27'}" stroke="${badShunt ? '#f3959f' : isActive ? '#7de0bd' : '#35485a'}"/>`;
    g += `<text x="504" y="138" style="fill:${badShunt ? '#f3959f' : '#7de0bd'};font-weight:600">${ms[0]}</text>`;
    g += `<text x="504" y="162" class="small-label">${ms[1]}</text>`;
    g += `<text x="504" y="186" class="small-label" style="fill:${badShunt ? '#f3959f' : '#c9ddec'}">${ms[2]}</text>`;
    g += `<text x="504" y="206" class="small-label">当前状态：${isActive ? (badShunt ? '⚠ 混线防护失效（误吸）' : '🛡 防护生效（J↓）') : '正常绝缘'}</text>`;

    $('circuit').innerHTML = `<svg viewBox="0 0 880 232" class="textbook-circuit" role="img" aria-label="图4.2.2自闭电路与五种防混线方式对比">${g}</svg>`;
    $('circuit-note').textContent = '对应第 4.2 & 4.3.2 节：右侧可在下拉框切换位置法/极性法/双断法/独立电源法/分路法；选“分路法”并勾选分路线断线即可直观看到其非完全故障—安全缺陷。';
  }

  // 专题 D 原理图：图 5.2.4–5.2.8 S700K 五线制三相交流道岔控制与表示电路
  function renderFiveWireCircuit() {
    const fw = result.fiveWire;
    $('circuit-title').textContent = '教材图 5.2.4–5.2.8 S700K 五线制三相交流道岔控制与表示（DBQ + BHJ + 2DQJ换相 + 并联 Z 无电容 C）';
    const act = fw.motorRunning;
    const ind = fw.dbjPicked || fw.fbjPicked;
    let g = `<text x="20" y="20">上半部：三相 AC 380V → DBQ断相保护器 → 1DQJ/1DQJF → 2DQJ三相换相 → X1~X5 → 遮断开关 K → S700K 三相电机</text>`;

    g += `<circle cx="44" cy="70" r="17" class="circuit-symbol ${act ? 'live' : ''}"/><text x="44" y="73" text-anchor="middle" style="font-size:8.5px">3Φ380</text>`;
    g += wire('M61,70H102', act);
    g += `<rect x="102" y="48" width="106" height="44" rx="4" class="circuit-symbol ${fw.bhjPicked ? 'live' : ''}"/>`;
    g += `<text x="155" y="66" text-anchor="middle" style="font-size:10px">DBQ 断相保护</text>`;
    const fwTrip = fw.stg >= 3 && (fw.phaseLoss || fw.lidOpen);
    g += `<text x="155" y="83" text-anchor="middle" style="fill:${fwTrip ? '#f3959f' : fw.bhjPicked ? '#7de0bd' : '#92a6ba'};font-size:10px">BHJ ${fwTrip ? (fw.lidOpen ? '断U相↓' : '缺相↓') : fw.bhjPicked ? '↑自闭' : '↓'}</text>`;
    g += wire('M208,70H244', fw.dqj1Picked);
    g += `<rect x="244" y="48" width="110" height="44" rx="4" class="circuit-symbol ${fw.dqj1Picked ? 'live' : ''}"/>`;
    g += `<text x="299" y="66" text-anchor="middle" style="font-size:10px">1DQJ / 1DQJF</text>`;
    g += `<text x="299" y="83" text-anchor="middle" class="small-label">${fw.dqj1SlowHold ? '铜套缓放' : fw.bhjPicked ? '1-2自闭↑' : fw.dqj1Picked ? '3-4启动↑' : '落下接通表示'}</text>`;
    g += wire('M354,70H392', fw.dqj1Picked);
    g += `<rect x="392" y="48" width="116" height="44" rx="4" class="circuit-symbol ${fw.dqj2Reverse ? 'live' : ''}"/>`;
    g += `<text x="450" y="66" text-anchor="middle" style="font-size:10px">2DQJ (${fw.dqj2Reverse ? '反位' : '定位'})</text>`;
    g += `<text x="450" y="83" text-anchor="middle" class="small-label">${fw.dqj2Reverse ? 'W-V-U 逆时针' : 'W-U-V 顺时针'}</text>`;
    g += wire('M508,60H602M508,70H602M508,80H602', act);
    g += `<text x="555" y="53" text-anchor="middle" class="small-label">X1~X5 (五线)</text>`;
    g += `<rect x="602" y="46" width="100" height="48" rx="4" class="circuit-symbol ${act && !fw.lidOpen ? 'live' : ''}"/>`;
    g += `<text x="652" y="65" text-anchor="middle" style="font-size:10px">遮断开关 K</text>`;
    g += `<text x="652" y="83" text-anchor="middle" style="fill:${fw.lidOpen ? '#f3959f' : '#92a6ba'};font-size:10px">${fw.lidOpen ? '✕ 机盖开(断U相)' : '闭合导通'}</text>`;
    g += wire('M702,70H744', act);
    g += `<circle cx="774" cy="70" r="22" class="circuit-symbol ${act ? 'live' : ''}"/><text x="774" y="68" text-anchor="middle">M 3Φ</text><text x="774" y="82" text-anchor="middle" style="font-size:9px">U-V-W</text>`;
    if (act) g += flow('M61,70H102M208,70H244M354,70H392M508,70H602M702,70H744');

    g += `<path d="M20,120H860" stroke="#263646" stroke-dasharray="4 4"/>`;
    g += `<text x="20" y="140">下半部：AC110V → R₁(1000Ω) → ${fw.dqj2Reverse ? 'X1/X3/X5' : 'X1/X2/X4'} → 串联检查室外电机 U/V/W 绕组 → 【并联 R₂(300Ω) + 二极管 Z（取消电容 C）】→ DBJ / FBJ</text>`;
    g += `<circle cx="48" cy="188" r="14" class="circuit-symbol ${ind ? 'live' : ''}"/><text x="48" y="192" text-anchor="middle">BB</text>`;
    g += wire('M62,188H116', ind);
    g += `<rect x="116" y="176" width="84" height="24" class="circuit-symbol ${ind ? 'live' : ''}"/><text x="158" y="192" text-anchor="middle" style="font-size:10px">R₁ 1000Ω</text>`;
    g += wire('M200,188H275', ind);
    g += `<rect x="275" y="168" width="165" height="40" rx="4" class="circuit-symbol ${ind ? 'live' : ''}"/>`;
    g += `<text x="357" y="185" text-anchor="middle" style="font-size:10px">串检 S700K U/V/W 绕组</text>`;
    g += `<text x="357" y="201" text-anchor="middle" class="small-label">${fw.dbjPicked ? 'X1-X2-X4 定位接点闭合' : fw.fbjPicked ? 'X1-X3-X5 反位接点闭合' : '转换中接点断开'}</text>`;
    g += wire('M440,188H515', ind);
    g += `<rect x="515" y="166" width="142" height="44" rx="4" class="circuit-symbol ${ind ? 'live' : ''}"/>`;
    g += `<text x="586" y="185" text-anchor="middle" style="font-size:10px">并联 R₂(300Ω) + Z</text>`;
    g += `<text x="586" y="201" text-anchor="middle" class="small-label">无滤波电容 C · 自感续流</text>`;
    g += wire('M657,188H705', ind);
    g += `<rect x="705" y="162" width="150" height="24" rx="4" class="circuit-symbol ${fw.dbjPicked ? 'live' : ''}"/><text x="780" y="178" text-anchor="middle" style="font-size:10px">DBJ ↑↓ : ${fw.dbjPicked ? '吸起 ↑' : '落下 ↓'}</text>`;
    g += `<rect x="705" y="194" width="150" height="24" rx="4" class="circuit-symbol ${fw.fbjPicked ? 'live' : ''}"/><text x="780" y="210" text-anchor="middle" style="font-size:10px">FBJ ↑↓ : ${fw.fbjPicked ? '吸起 ↑' : '落下 ↓'}</text>`;
    if (ind) g += flow('M62,188H116M200,188H275M440,188H515M657,188H705');

    $('circuit').innerHTML = `<svg viewBox="0 0 880 236" class="textbook-circuit" role="img" aria-label="图5.2.4至5.2.8五线制三相道岔控制与表示电路">${g}</svg>`;
    $('circuit-note').textContent = '对应第 5.2.3 节（PDF p.82–86）：先切到阶段 3 勾选“模拟缺相”看 BHJ 立即断开自闭；注意观察下半部表示电路与四线制最大区别（并联二极管 Z + R₂，彻底取消滤波电容 C）。';
  }

  // 专题 E 原理图：图 11.3.2 / 13.2.2–13.2.4 计算机联锁动态驱采与脉冲变压器隔直传交
  function renderCbiIoCircuit() {
    const ci = result.cbiIo;
    const isIn = ci.mode === 'staticIn' || ci.mode === 'dynamicIn';
    $('circuit-title').textContent = '教材图 11.3.2 & 13.2.2–13.2.4 计算机联锁动态驱动 / 不对称安全采集同步图';
    let g = '';
    if (isIn) {
      g += `<text x="20" y="20">${ci.mode === 'staticIn' ? '图13.2.2(a) 静态双位不对称编码采集 (落下=1010 · 吸起=0101 · 其余14码判故障)' : '图13.2.2(b) 动态探测脉冲闭环回采'}</text>`;
      g += `<rect x="35" y="65" width="160" height="58" rx="6" class="circuit-symbol ${ci.cmd ? 'live' : ''}"/>`;
      g += `<text x="115" y="90" text-anchor="middle">现场继电器前/后接点</text>`;
      g += `<text x="115" y="110" text-anchor="middle" class="small-label">${ci.cmd ? '吸起状态 (闭合)' : '落下状态 (断开)'}</text>`;
      const midOK = ci.mode === 'staticIn' ? ci.inputValid : ci.dynamicActive;
      g += wire('M195,94H310', midOK);
      g += `<rect x="310" y="65" width="220" height="58" rx="6" class="circuit-symbol ${midOK ? 'live' : ''}"/>`;
      g += `<text x="420" y="90" text-anchor="middle">${ci.mode === 'staticIn' ? `双位校验码：${ci.inputCode}` : (ci.dynamicActive ? '探测方波正常回采' : (!ci.cmd && ci.fault === 'none' ? '接点断开 · 无回采脉冲' : '✕ 探测脉冲卡死/断路'))}</text>`;
      g += `<text x="420" y="110" text-anchor="middle" style="fill:${midOK ? '#7de0bd' : (!ci.cmd && ci.fault === 'none' ? '#92a6ba' : '#f3959f')};font-size:10px">${midOK ? '✓ 通过故障安全编码/脉冲校验' : (!ci.cmd && ci.fault === 'none' ? '正常安全侧落下态' : '⚠ 编码违例/卡死 → 安全判 ↓')}</text>`;
      g += wire('M530,94H645', ci.relayPicked);
      g += `<rect x="645" y="65" width="195" height="58" rx="6" class="circuit-symbol ${ci.relayPicked ? 'live' : ''}"/>`;
      g += `<text x="742" y="90" text-anchor="middle">联锁逻辑采信状态</text>`;
      g += `<text x="742" y="110" text-anchor="middle">${ci.relayPicked ? '✓ 确认在吸起侧 (1)' : '↓ 导向安全侧落下 (0)'}</text>`;
      if (ci.relayPicked) g += flow('M195,94H310M530,94H645');
    } else {
      g += `<text x="20" y="20">${ci.mode === 'pulseTrans' ? '图13.2.3 动态输出：CPU脉冲 → 光耦 U1 → 脉冲变压器 T(隔直传交) → 驱动偏极 J' : '图13.2.4 动态输出：互补三极管 T1/T2 + 电容泵 C1·C2 驱动偏极 J'}</text>`;
      const cpuSig = ci.fault === 'stuckHigh' ? '━━━━━━ (卡死常高 1 · dΦ/dt=0)' : ci.fault === 'stuckLow' ? '______ (卡死常低 0)' : ci.cmd ? '⊓⊔⊓⊔⊓⊔ (5V 动态方波脉冲)' : (ci.mode === 'capPump' ? '━━━━━━ (无命令稳态高电平·非脉冲)' : '______ (命令落下 0)');
      g += `<rect x="28" y="64" width="218" height="62" rx="6" class="circuit-symbol ${ci.dynamicActive ? 'live' : ''}"/>`;
      g += `<text x="137" y="88" text-anchor="middle">CPU 输出引脚</text>`;
      g += `<text x="137" y="110" text-anchor="middle" style="fill:${ci.fault === 'stuckHigh' ? '#efb860' : ci.dynamicActive ? '#7de0bd' : '#92a6ba'};font-size:10px">${cpuSig}</text>`;
      g += wire('M246,95H322', ci.dynamicActive || ci.fault === 'stuckHigh');
      g += `<rect x="322" y="60" width="232" height="70" rx="6" class="circuit-symbol ${ci.dynamicActive ? 'live' : ''}"/>`;
      g += `<text x="438" y="85" text-anchor="middle">${ci.mode === 'pulseTrans' ? 'U1 光耦 + 脉冲变压器 T + 整流' : '互补三极管 T1/T2 + 电容泵 C1·C2'}</text>`;
      g += `<text x="438" y="109" text-anchor="middle" style="fill:${ci.dynamicActive ? '#7de0bd' : '#f3959f'};font-size:10px">${ci.dynamicActive ? '交流耦合通过 → 输出 24V' : ci.fault === 'stuckHigh' ? '🛡 隔直阻断稳态直流 → 0V！' : '无交流能量输入 → 0V'}</text>`;
      g += wire('M554,95H646', ci.relayPicked);
      g += `<rect x="646" y="64" width="205" height="62" rx="6" class="circuit-symbol ${ci.relayPicked ? 'live' : ''}"/>`;
      g += `<text x="748" y="89" text-anchor="middle">执行继电器 J (JPXC-1000)</text>`;
      g += `<text x="748" y="111" text-anchor="middle">${ci.relayPicked ? '↑ 吸起（安全输出有效）' : '↓ 0V 可靠落下（安全侧）'}</text>`;
      if (ci.relayPicked) g += flow('M246,95H322M554,95H646');
    }
    g += `<text x="28" y="176" class="small-label">提示：尝试把故障选为“⚠ 模拟 CPU 死机端口卡死在常高电平 1”，观察即使命令勾选着吸起，T 隔直 / 电容泵依然确保 J 安全落下！</text>`;
    $('circuit').innerHTML = `<svg viewBox="0 0 880 205" class="textbook-circuit" role="img" aria-label="计算机联锁动态驱采安全电路">${g}</svg>`;
    $('circuit-note').textContent = '对应第 11.3 & 13.2 节（PDF p.224、258–260）：芯片级错误绝不允许突破“动态→交流→静态”隔离障壁使继电器错误吸起。';
  }

  // 专题 B 原理图：图 5.2.2–5.2.3 单动道岔四线制控制与表示电路
  function renderTurnoutCircuit() {
    const to = result.turnout;
    $('circuit-title').textContent = '教材图 5.2.2–5.2.3 单动道岔四线制（X1/X2/X3/X4）启动、动作与半波整流表示电路';
    let g = `<text x="20" y="20">上半部：室内 1DQJ(125Ω启动/0.44Ω自闭) + 2DQJ(转极) → X1/X2/X4 → 室外自动开闭器(11-12/41-42) → 直流电机 M</text>`;

    // 1. 室内 1DQJ(3-4 125Ω 启动 / 1-2 0.44Ω 自闭) -> 2DQJ -> X1 / X2 -> 室外开闭器 -> 电机 M -> 05-06 -> X4
    const actLive = to.motorRunning;
    g += `<circle cx="42" cy="72" r="12" class="circuit-symbol ${actLive ? 'live' : ''}"/><text x="42" y="76" text-anchor="middle" style="font-size:9px">DZ</text>`;
    g += wire('M54,72H88', actLive);
    g += `<rect x="88" y="62" width="36" height="20" class="circuit-symbol ${!to.fuseBlown && actLive ? 'live' : ''}"/><text x="106" y="76" text-anchor="middle" style="font-size:10px">RD₃</text>`;
    g += wire('M124,72H148', actLive);
    // 1DQJ 线圈（带铜套缓放涂黑标记）
    g += `<rect x="148" y="56" width="96" height="32" rx="3" class="circuit-symbol ${to.dqj1Picked ? 'live' : ''}"/>`;
    g += `<rect x="148" y="74" width="96" height="14" fill="#6b4423" opacity=".7"/>`;
    g += `<text x="196" y="71" text-anchor="middle" style="font-size:10px">1DQJ (${to.dqj1SlowHold ? '铜套缓放' : to.dqj1CurrentHold ? '0.44Ω自闭' : to.dqj1Picked ? '125Ω启动' : '常态落下↓'})</text>`;
    g += wire('M244,72H275', to.dqj1Picked);
    // 2DQJ 极性保持接点 (111-112 定位 X1 / 111-113 反位 X2)
    g += `<rect x="275" y="52" width="78" height="40" rx="4" class="circuit-symbol ${to.dqj2Reverse ? 'live' : ''}"/>`;
    g += `<text x="314" y="69" text-anchor="middle" style="font-size:10px">2DQJ (${to.dqj2Reverse ? '反位' : '定位'})</text>`;
    g += `<text x="314" y="84" text-anchor="middle" class="small-label">${to.dqj2Reverse ? '111-113通 X2' : '111-112通 X1'}</text>`;

    // X1 与 X2 电缆线至室外自动开闭器
    g += wire('M353,62H455', !to.dqj2Reverse && to.dbjPicked);
    g += `<text x="404" y="56" text-anchor="middle" class="small-label">X1 (定表/回定)</text>`;
    g += wire('M353,82H455', actLive || to.fbjPicked);
    g += `<text x="404" y="98" text-anchor="middle" class="small-label">X2 (反动/反表)</text>`;

    // 自动开闭器 11-12(A爪控制) 与 41-42(B爪控制)
    g += `<rect x="455" y="44" width="132" height="56" rx="4" class="circuit-symbol ${actLive ? 'live' : ''}"/>`;
    g += `<text x="521" y="64" text-anchor="middle" style="font-size:10px">A爪 11-12:${to.k11_12 ? '通' : '断'} · 21-22:${to.k21_22 ? '通' : '断'}</text>`;
    g += `<text x="521" y="82" text-anchor="middle" style="font-size:10px">B爪 31-32:${to.k31_32 ? '通' : '断'} · 41-42:${to.k41_42 ? '通' : '断'}</text>`;
    g += `<text x="521" y="96" text-anchor="middle" class="small-label">图5.2.3 自动开闭器</text>`;

    // 电动机 M 与安全遮断器 05-06 -> X4 -> DF220
    g += wire('M587,72H635', actLive);
    g += `<circle cx="655" cy="72" r="18" class="circuit-symbol ${actLive ? 'live' : ''}"/><text x="655" y="76" text-anchor="middle">M</text>`;
    if (to.obstacle && to.motorRunning) g += `<text x="655" y="45" text-anchor="middle" style="fill:#f3959f;font-weight:600">⚠ 夹异物空转 (41-42已闭可操回定位)</text>`;
    g += wire('M673,72H712', actLive);
    g += dot(712, 72, actLive) + dot(756, 72, actLive && !to.lidOpen);
    g += wire(to.lidOpen ? 'M712,72L748,52' : 'M712,72H756', actLive && !to.lidOpen);
    g += `<text x="734" y="92" text-anchor="middle" class="small-label">遮断器05-06(${to.lidOpen ? '断' : '通'})</text>`;
    g += wire('M756,72H822', actLive);
    g += `<circle cx="834" cy="72" r="12" class="circuit-symbol ${actLive ? 'live' : ''}"/><text x="834" y="76" text-anchor="middle" style="font-size:9px">DF</text>`;
    g += `<text x="790" y="64" text-anchor="middle" class="small-label">X4 线</text>`;
    if (actLive) g += flow('M54,72H88M124,72H148M244,72H275M353,82H455M587,72H635M673,72H822');

    // 下半部：道岔半波整流表示电路（BB Ⅱ次侧 AC 220 V -> R -> X3 -> 自动开闭器 -> 整流二极管 Z -> DBJ/FBJ，PDF p.81）
    const indLive = to.dbjPicked || to.fbjPicked;
    g += `<path d="M20,122H860" stroke="#263646" stroke-dasharray="4 4"/>`;
    g += `<text x="20" y="142">下半部：表示变压器 BB Ⅱ次侧(AC 220 V) → 限流电阻 R → X3 线 → 室外二极管 Z 半波整流 → 偏极继电器 DBJ / FBJ (JPXC-1000，仅1正4负吸起)</text>`;
    g += `<circle cx="48" cy="190" r="14" class="circuit-symbol ${indLive ? 'live' : ''}"/><text x="48" y="194" text-anchor="middle">∿</text><text x="48" y="218" text-anchor="middle" class="small-label">BB 220V</text>`;
    g += wire('M62,190H108', indLive);
    g += `<rect x="108" y="181" width="42" height="18" class="circuit-symbol ${indLive ? 'live' : ''}"/><text x="129" y="194" text-anchor="middle" style="font-size:10px">R</text>`;
    g += wire('M150,190H255', indLive);
    g += `<text x="202" y="182" text-anchor="middle" class="small-label">X3 表示专用线</text>`;
    // 室外二极管 Z 半波整流分支
    g += `<rect x="255" y="168" width="185" height="44" rx="4" class="circuit-symbol ${indLive ? 'live' : ''}"/>`;
    g += `<path d="M270,182l12,8l-12,8Zm13,0v16" stroke="${to.indFault === 'wireCross' ? '#f3959f' : '#7de0bd'}" fill="none"/>`;
    g += `<text x="360" y="187" text-anchor="middle" style="font-size:10px">${to.indFault === 'wireCross' ? '⚠ 外线混线(Z失半波)' : to.indFault === 'trailThrough' ? '🚨 挤岔(01-02/03-04断)' : '室外整流堆 Z + 电容 C'}</text>`;
    g += `<text x="360" y="203" text-anchor="middle" class="small-label">${to.indFault === 'capShort' ? '⚠ 电容C击穿短接线圈' : to.indFault === 'capOpen' ? '⚠ 电容C引线断线(颤动)' : to.dbjPicked ? '经 14-13 · 34-33 · 32-31 闭合' : to.fbjPicked ? '经 43-44 · 23-24 · 21-22 闭合' : '转换中开闭器断开表示'}</text>`;
    g += wire('M440,190H525', indLive);
    // DBJ 与 FBJ 并联由 2DQJ 接点选择
    g += `<rect x="525" y="156" width="142" height="28" rx="4" class="circuit-symbol ${to.dbjPicked ? 'live' : ''}"/>`;
    g += `<text x="596" y="174" text-anchor="middle" style="font-size:10px">DBJ (JPXC-1000) ${to.dbjPicked ? '↑ 吸起' : '↓ 落下'}</text>`;
    g += `<rect x="525" y="196" width="142" height="28" rx="4" class="circuit-symbol ${to.fbjPicked ? 'live' : ''}"/>`;
    g += `<text x="596" y="214" text-anchor="middle" style="font-size:10px">FBJ (JPXC-1000) ${to.fbjPicked ? '↑ 吸起' : '↓ 落下'}</text>`;
    g += `<text x="772" y="182" text-anchor="middle" class="small-label">SJ81-82(${to.sjLocked ? '↓锁闭' : '↑解锁'}) · 1DQJ后(${!to.dqj1Picked ? '闭合' : '断开'})</text>`;
    g += `<text x="772" y="202" text-anchor="middle" class="small-label">${to.sjLocked && to.stg === 3 ? '✓ 0.44Ω自闭脱离SJ，继续转到底！' : '防护：混线交流/C短路/挤岔均导向↓'}</text>`;
    if (indLive) g += flow('M62,190H108M150,190H255M440,190H525');

    $('circuit').innerHTML = `<svg viewBox="0 0 880 238" class="textbook-circuit" role="img" aria-label="图5.2.2四线制道岔控制与表示电路">${g}</svg>`;
    $('circuit-note').textContent = '对应教材第 5.2.2 节图 5.2.2–5.2.3 及练习题第 15 题：点击阶段 0→4 观察 1DQJ 从 125Ω 启动圈 → 铜套缓放（跨接 2DQJ 转极瞬间）→ 0.44Ω 电流圈串电机自闭 → 到位 A 爪断开后 FBJ 半波吸起的完整时序。';
  }

  function stationTrainSvgPos(st, pos) {
    const rt = st.routeSpec || { code: 'R1', kind: 'receive', sig: 'X', switches: {}, approach: 'X3JG', terminal: 'IG' };
    const trackY = { '3G': 30, IG: 56, IIG: 92, '4G': 120 };
    const startY = rt.sig === 'XF' || rt.approach === 'S1LQG' || rt.approach === '3DG' ? 92 : (trackY[rt.approach] || 56);
    const endY = trackY[rt.terminal] || (rt.terminal === 'S1LQG' ? 92 : 56);
    const sw = rt.switches || {};
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const ramp = (x, a, b, ya, yb) => x <= a ? ya : x >= b ? yb : ya + (yb - ya) * (x - a) / (b - a);
    if (rt.kind === 'receive') {
      const t = clamp((pos + 26) / 146, 0, 1);
      const x = 48 + t * 762;
      let y = startY;
      if (sw.s1_3 === 'R' && x > 245) y = ramp(x, 245, 315, 56, 92);
      if (sw.s5_7 === 'R' && x > 395) y = ramp(x, 395, 470, 92, 56);
      if (rt.terminal === '3G' && x > 575) y = ramp(x, 575, 640, 56, 30);
      else if (rt.terminal === '4G' && x > 555) y = ramp(x, 555, 640, 92, 120);
      return { x, y };
    }
    if (rt.kind === 'depart') {
      const t = clamp((pos + 26) / 146, 0, 1);
      const x = 780 - t * 725;
      let y = startY;
      if (rt.approach === '3G' && x < 640) y = ramp(x, 640, 575, 30, 56);
      else if (rt.approach === '4G' && x < 640) y = ramp(x, 640, 555, 120, 92);
      if (sw.s5_7 === 'R' && x < 470) y = ramp(x, 470, 395, rt.sig === 'S1' || rt.sig === 'S3' ? 56 : 92, rt.sig === 'S1' || rt.sig === 'S3' ? 92 : 56);
      if (sw.s1_3 === 'R' && x < 315) y = ramp(x, 315, 245, 92, endY);
      return { x, y };
    }
    const sigX = { D1: 232, D3: 355, D5: 370, D7: 475, S3: 642, S1: 642, SII: 642, S4: 642 };
    const forward = ['D1', 'D5', 'D7'].includes(rt.sig);
    const sx = sigX[rt.sig] || 232;
    const x0 = forward ? sx - 68 : sx + 74;
    const x1 = forward
      ? (rt.terminal === '11DG' ? 520 : rt.terminal === '5-9DG' ? 460 : 750)
      : (rt.terminal === '1/7G' ? 405 : rt.terminal === 'IAG' ? 165 : 70);
    const t = clamp((pos + 26) / 130, 0, 1);
    const x = x0 + (x1 - x0) * t;
    let y = startY;
    if (forward) {
      if (sw.s1_3 === 'R' && x > 245) y = ramp(x, 245, 315, 56, 92);
      if (sw.s5_7 === 'R' && x > 395) y = ramp(x, 395, 470, 92, 56);
      if (rt.terminal === '3G' && x > 575) y = ramp(x, 575, 640, 56, 30);
      else if (rt.terminal === '4G' && x > 555) y = ramp(x, 555, 640, 92, 120);
    } else {
      if (rt.sig === 'S3' && x < 640) y = ramp(x, 640, 575, 30, 56);
      else if (rt.sig === 'S4' && x < 640) y = ramp(x, 640, 555, 120, 92);
      if (sw.s5_7 === 'R' && x < 470) y = ramp(x, 470, 395, 56, 92);
      if (sw.s1_3 === 'R' && x < 315) y = ramp(x, 315, 245, 92, 56);
    }
    return { x, y };
  }

  function renderStationCircuit() {
    const st = result.station, rl = st.relays;
    const rt = st.routeSpec || { num: 1, title: 'X → IG', sig: 'X', buttons: 'XLA、SⅠLA', switchesRaw: '1/3、5/7、11', switches: { s1_3: 'N', s5_7: 'N', s9: null, s11: 'N' }, otherLock: '' };
    const sw = st.switchesState || rt.switches || {};
    const secs = st.secStates || {};
    const sigs = st.signals || {};
    $('circuit-title').textContent = `图 3.1.1 下行咽喉站场平面（表 3.2.2 第 ${rt.num} 条）与 6502 1–15 线继电器状态`;

    const secColor = id => {
      const item = secs[id];
      if (!item) return '#5c8478';
      if (item.occ) return '#f3959f';
      if (item.slow) return '#efb860';
      if (item.inRoute && !item.unlocked) return '#92bdfa';
      return item.inRoute ? '#7de0bd' : '#568d7b';
    };
    const crossCol = (isRev, keySec) => {
      if (!isRev) return '#3b4d60';
      const item = secs[keySec];
      if (item && item.occ) return '#f3959f';
      if (item && item.slow) return '#efb860';
      return (item && item.inRoute && !item.unlocked) ? '#92bdfa' : '#7de0bd';
    };

    const seg = (x1, y1, x2, y2, color, lbl, lx, ly) => {
      let sOut = `<path d="M${x1},${y1}L${x2},${y2}" stroke="${color}" stroke-width="5.2" stroke-linecap="round"/>`;
      if (lbl) sOut += `<text x="${lx ?? ((x1 + x2) / 2)}" y="${ly ?? (y1 - 8)}" text-anchor="middle" class="small-label">${lbl}</text>`;
      return sOut;
    };

    let g = `<text x="20" y="13" style="fill:#9fd8eb">表3.2.2 第${rt.num}条：${rt.title}｜道岔：${rt.switchesRaw}${rt.otherLock ? '｜' + rt.otherLock : ''}</text>`;
    g += seg(20, 56, 120, 56, secColor('X3JG'), `X3JG(${rl.JYJ ? '预先' : '接近'})`, 70, 46);
    g += seg(120, 56, 235, 56, secColor('IAG'), 'IAG', 177, 46);
    g += seg(235, 56, 355, 56, secColor('1DG'), '1DG', 295, 46);
    g += seg(355, 56, 475, 56, secColor('1/7G'), '1/7G', 415, 46);
    g += seg(475, 56, 640, 56, secColor('11DG'), '7-11DG', 555, 46);
    g += seg(640, 56, 860, 56, secColor('IG'), `IG${st.isDep && rt.approach === 'IG' ? '(不含发车)' : '(正线)'}`, 750, 46);

    g += seg(20, 92, 235, 92, secColor('S1LQG'), 'S1LQG', 168, 82);
    g += seg(235, 92, 445, 92, secColor('3DG'), '3DG', 332, 82);
    g += seg(445, 92, 640, 92, secColor('5-9DG'), '5-9DG', 535, 82);
    g += seg(640, 92, 860, 92, secColor('IIG'), 'IIG (正线)', 750, 82);

    g += seg(640, 30, 860, 30, secColor('3G'), '3G (侧线)', 750, 21);
    g += seg(640, 120, 860, 120, secColor('4G'), '4G (侧线)', 750, 111);

    // 4 套道岔渡线（1/3、5/7 按图 2.5.1 渡线绝缘节分半段独立着色；9、11 同步区段色）
    g += seg(245, 56, 280, 74, crossCol(sw.s1_3 === 'R', '1DG'), '1/3', 292, 66);
    g += seg(280, 74, 315, 92, crossCol(sw.s1_3 === 'R', '3DG'));
    g += seg(395, 92, 432.5, 74, crossCol(sw.s5_7 === 'R', '5-9DG'), '5/7', 420, 66);
    g += seg(432.5, 74, 470, 56, crossCol(sw.s5_7 === 'R', '11DG'));
    g += seg(555, 92, 640, 120, crossCol(sw.s9 === 'R', '5-9DG'), '9', 588, 118);
    g += seg(575, 56, 640, 30, crossCol(sw.s11 === 'R', '11DG'), '11', 602, 37);
    g += `<path d="M275,78L285,70M427,70L438,78" stroke="#d5ad70" stroke-width="2.2"/>`;
    for (const [jx, jy] of [[120, 56], [235, 56], [355, 56], [475, 56], [640, 56], [120, 92], [235, 92], [445, 92], [640, 92], [640, 30], [640, 120]]) {
      g += `<path d="M${jx},${jy - 7}v14" stroke="#d5ad70" stroke-width="2"/>`;
    }

    // 全部 10 架第 2.3 节可点击信号机符号（点击呼出详情并一键跳转 2.3 节 3D 拆解）
    const sigNodes = [
      ['X', 118, 56, -12, 'X'], ['XF', 118, 92, 16, 'X_F'],
      ['D1', 232, 56, 16, 'D₁'], ['D3', 355, 56, 16, 'D₃'],
      ['D5', 370, 92, 16, 'D₅'], ['D7', 475, 56, 16, 'D₇'],
      ['S3', 642, 30, -11, 'S₃'], ['S1', 642, 56, -10, 'SⅠ'],
      ['SII', 642, 92, -10, 'SⅡ'], ['S4', 642, 120, 16, 'S₄']
    ];
    const aspColor = a => ({
      H: '#f35867', U: '#ffcb47', UU: '#ffcb47', L: '#4be38d',
      LU: '#8ef066', B: '#eef6ff', A: '#389bff', DARK: '#253140'
    }[a] || '#f35867');
    for (const [key, sx, sy, lyOff, lbl] of sigNodes) {
      const a = sigs[key] || (key.startsWith('D') ? 'A' : 'H');
      const col = aspColor(a);
      const isMain = rt.sig === key || (st.multiTrain && st.multiTrain.active && st.multiTrain.sigB === key);
      g += `<g class="svg-relay-box" data-signal-key="${key}">`;
      if (isMain) g += `<circle cx="${sx}" cy="${sy}" r="10.5" fill="none" stroke="${col}" stroke-width="1.2" opacity=".7"/>`;
      g += `<circle cx="${sx}" cy="${sy}" r="6" fill="${col}" stroke="#0d1826" stroke-width="1.5"/>`;
      if (a === 'UU') g += `<circle cx="${sx + 9}" cy="${sy}" r="4.5" fill="#ffcb47" stroke="#0d1826" stroke-width="1.2"/>`;
      if (a === 'HB') g += `<circle cx="${sx + 9}" cy="${sy}" r="4.5" fill="#eef7ff" stroke="#0d1826" stroke-width="1.2"/>`;
      if ((rt.sig === key && st.indicatorOn) || (st.multiTrain && st.multiTrain.active && st.multiTrain.sigB === key && st.multiTrain.indicatorOnB)) g += `<rect x="${sx + 8}" y="${sy - 6}" width="15" height="11" rx="2" fill="#17382c" stroke="#7de0bd"/><text x="${sx + 15.5}" y="${sy + 2.5}" text-anchor="middle" style="fill:#e8fff6;font-size:7.5px;font-weight:700">右</text>`;
      g += `<text x="${sx}" y="${sy + lyOff}" text-anchor="middle" class="small-label" style="${isMain ? 'fill:#eef7ff;font-weight:700' : ''}">${lbl}</text></g>`;
    }

    if (st.multiTrain && st.multiTrain.active) {
      g += `<text x="20" y="144" style="fill:${st.multiTrain.bWaitingForA || (st.multiTrain.mode === 'track_occupied' && !rl.LXJ && !rl.YXJ) ? '#efb860' : '#7de0bd'};font-weight:600">${st.multiTrain.conflictReason.slice(0, 82)}</text>`;
    } else if (st.cancelMode === 'zqa') {
      g += `<text x="20" y="144" style="fill:${st.zqaUnlocked ? '#7de0bd' : '#f3959f'};font-weight:600">${st.zqaUnlocked ? '✓ 总取消(ZQA)：预先锁闭(JYJ↑)且进路完整空闲，信号关闭并立即解锁' : st.approachLocked ? '⚠ 总取消(ZQA)：接近锁闭(JYJ↓)，仅关信号、严禁解锁进路！' : '⚠ 总取消(ZQA)：进路非完整空闲或道岔失表示，仅关信号、严禁解锁进路！'}</text>`;
    } else if (st.cancelMode === 'zra') {
      g += `<text x="20" y="144" style="fill:#efb860;font-weight:600">${st.zraBlocked ? '人工解锁计时中止 · 恢复完整空闲后重新办理' : st.zraUnlocked ? (st.preLocked ? '✓ 总人工解锁(ZRA)：预先锁闭且进路完整空闲，按取消方式已立即解锁' : `✓ 总人工解锁(ZRA)：${st.zraSeconds}s 延时满且进路完整空闲，已解锁`) : `⏳ 总人工解锁(ZRA)：信号已关闭，教材延时 ${st.zraSeconds}s (${Math.round(s.zraProgress * 100)}%)`}</text>`;
    } else if (st.cancelMode === 'sga') {
      g += `<text x="20" y="144" style="fill:${st.sgaUnlocked ? '#7de0bd' : '#f3959f'};font-weight:600">${st.sgaUnlocked ? `✓ 区故解 · 仅 ${st.sgaTarget} 解锁` : `${st.sgaTarget} 区故解闭锁 · 占用或QJJ↑`}</text>`;
    } else if (s.blindFault !== 'none') {
      g += `<text x="20" y="144" style="fill:#efb860;font-weight:600">🩺 盲测考题进行中：请分析下方继电器状态并在控制面板提交诊断！</text>`;
    } else if (st.signalFaultLocked && !s.lampFault && !s.switchFault) {
      g += `<text x="20" y="144" style="fill:#efb860;font-weight:600">🔒 防自动重复开放：故障虽恢复但 FKJ↓ 锁存，须点“重新开放信号”</text>`;
    } else {
      g += `<text x="20" y="144" class="small-label">光带图例：红=轮对占用 · 蓝白=进路锁闭 · 琥珀=FDGJ 3s缓放 · 绿=空闲（点击站内信号机或继电器卡片可拆解）</text>`;
    }

    const tPos = stationTrainSvgPos(st, s.stationTrain);
    if (st.stg >= 5 && tPos.x > 40 && tPos.x < 840) {
      g += `<rect x="${tPos.x - 28}" y="${tPos.y - 6.5}" width="56" height="12" rx="3" fill="#7de0bd" stroke="#0b221a" stroke-width="1.2" opacity=".92"/><text x="${tPos.x}" y="${tPos.y + 2.5}" text-anchor="middle" style="fill:#0b221a;font-size:8.5px;font-weight:700">${st.multiTrain && st.multiTrain.active ? '一号车 A' : '复兴号'}</text>`;
    }
    if (st.multiTrain && st.multiTrain.active && !st.multiTrain.hideDuplicateB && st.stg >= 5) {
      const rtB = J.resolveRoute(st.multiTrain.routeB || 'R14');
      const tPosB = stationTrainSvgPos({ routeSpec: rtB }, st.multiTrain.trainB);
      if (tPosB.x > 40 && tPosB.x < 840) {
        g += `<rect x="${tPosB.x - 28}" y="${tPosB.y - 6.5}" width="56" height="12" rx="3" fill="#efb860" stroke="#221808" stroke-width="1.2" opacity=".94"/><text x="${tPosB.x}" y="${tPosB.y + 2.5}" text-anchor="middle" style="fill:#1f1606;font-size:8.5px;font-weight:700">二号车 B</text>`;
      }
    }

    // 下半部：按 stationNetView 切换 18继电器矩阵 或 1-7 / 8-11 / 12-13 线网路透视图
    if (s.stationNetView === 'line1_7') {
      const use12 = sw.s5_7 === 'R'; // 1、2线选八字第一笔撇形双动 5/7 反位
      const use34 = sw.s1_3 === 'R'; // 3、4线选八字第二笔捺形双动 1/3 反位
      const n1 = rl.LAJ || rl.LJJ || rl.LFJ || rl.DFJ || st.stg >= 1;
      const n5 = rl.DCJ || rl.FCJ || rl.DQJ1 || st.stg >= 2;
      const n7 = rl.FKJ || rl.KJ || st.stg >= 3;
      g += `<text x="20" y="166" style="fill:#7de0bd;font-weight:600">6502 网路线透视 ①｜第7章 1—7 线：${use12 ? '1-2线(5/7撇反) → ' : ''}${use34 ? '3-4线(1/3捺反) → ' : ''}5-6线(定位/单动/JXJ) → 7线(KJ选排一致)</text>`;
      g += `<rect x="20" y="180" width="205" height="94" rx="6" class="circuit-symbol ${n1 ? 'live' : ''}"/>`;
      g += `<text x="32" y="202" style="font-weight:600">按钮 &amp; 方向 (AJ/FJ)</text>`;
      g += `<text x="32" y="222" class="small-label">LAJ:${rl.LAJ ? '↑' : '↓'} · ${st.isDep ? 'LFJ' : st.isShunt ? 'DJJ/DFJ' : 'LJJ'}:${(st.isDep ? rl.LFJ : st.isShunt ? rl.DFJ : rl.LJJ) ? '↑' : '↓'}</text>`;
      g += `<text x="32" y="241" class="small-label">按钮：${rt.buttons}</text>`;
      g += `<text x="32" y="260" class="small-label">供出 KZ/KF 方向条件电源</text>`;
      g += wire('M225,227H250', n5);
      g += `<rect x="250" y="180" width="205" height="94" rx="6" class="circuit-symbol ${(n5 && (use12 || use34)) ? 'live' : ''}"/>`;
      g += `<text x="262" y="202" style="font-weight:600">1—4 线：双动反位优先</text>`;
      g += `<text x="262" y="222" class="small-label">1-2线(撇5/7反): ${use12 ? '✓ 1FCJ→2FCJ↑' : '不经(5/7非反)'}</text>`;
      g += `<text x="262" y="241" class="small-label">3-4线(捺1/3反): ${use34 ? '✓ 1FCJ→2FCJ↑' : '不经(1/3非反)'}</text>`;
      g += `<text x="262" y="260" class="small-label">${(use12 || use34) ? '选出FCJ后接通5-6线' : '无双动反位，AJ直入5-6线'}</text>`;
      g += wire('M455,227H480', n5);
      g += `<rect x="480" y="180" width="185" height="94" rx="6" class="circuit-symbol ${n5 ? 'live' : ''}"/>`;
      g += `<text x="492" y="202" style="font-weight:600">5—6 线：自左向右传递</text>`;
      g += `<text x="492" y="222" class="small-label">DCJ:${rl.DCJ ? '↑' : '↓'} · FCJ:${rl.FCJ ? '↑' : '↓'} · JXJ↑↓</text>`;
      g += `<text x="492" y="241" class="small-label">串QJJ↓·CJ↑·DGJ↑·GJJ↓</text>`;
      g += `<text x="492" y="260" class="small-label">道岔：${rt.switchesRaw}</text>`;
      g += wire('M665,227H690', n7);
      g += `<rect x="690" y="180" width="170" height="94" rx="6" class="circuit-symbol ${n7 ? 'live' : ''}"/>`;
      g += `<text x="702" y="202" style="font-weight:600">7 线：KJ 选排一致</text>`;
      g += `<text x="702" y="222" class="small-label">FKJ:${rl.FKJ ? '↑' : '↓'} · KJ:${rl.KJ ? '↑' : '↓'}</text>`;
      g += `<text x="702" y="241" class="small-label">检 DBJ:${rl.DBJ ? '↑' : '↓'}/FBJ:${rl.FBJ ? '↑' : '↓'} + SJ↑</text>`;
      g += `<text x="702" y="260" class="small-label">${rl.KJ ? '✓ 选排一致，转入8线' : '等待道岔表示到位'}</text>`;
      g += `<text x="20" y="302" class="small-label">图7.2.1/7.9.3/7.10.1：先由 1–4 线选双动反位，再由 5–6 线自左向右选双动定位、单动定反位及 JXJ，最后 7 线检查 DCJ·DBJ(或FCJ·FBJ) 与 SJ↑ 吸起 KJ！</text>`;
      $('circuit').innerHTML = `<svg viewBox="0 0 880 330" class="textbook-circuit" role="img" aria-label="6502 1至7线网路透视图">${g}</svg>`;
      $('circuit-note').textContent = '1—7 线专司选排与一致性检查（可在【04 · 站场·联锁表·计算机联锁 → 7章·1-7线选排】中做6阶段单步方向电流实验）。';
      return;
    }
    if (s.stationNetView === 'line8_11') {
      g += `<text x="20" y="166" style="fill:#7de0bd;font-weight:600">6502 网路线透视 ②｜8—11 线：条件检查 · 进路锁闭 · 开放信号</text>`;
      g += `<rect x="20" y="182" width="250" height="95" rx="6" class="circuit-symbol ${rl.XJJ ? 'live' : ''}"/>`;
      g += `<text x="34" y="206" style="font-weight:600">8 线：XJJ (信号检查继电器)</text>`;
      g += `<text x="34" y="228" class="small-label">XJJ:${rl.XJJ ? '↑ 联锁全通过' : '↓ 未通'}</text>`;
      g += `<text x="34" y="248" class="small-label">检区段空闲、道岔位置、敌对信号未建</text>`;
      g += wire('M270,229H315', rl.QJJ);
      g += `<rect x="315" y="182" width="250" height="95" rx="6" class="circuit-symbol ${!rl.SJ ? 'live' : ''}"/>`;
      g += `<text x="329" y="206" style="font-weight:600">9—10 线：QJJ↑ → SJ / 1LJ / 2LJ↓</text>`;
      g += `<text x="329" y="228" class="small-label">QJJ:${rl.QJJ ? '↑' : '↓'} · SJ:${rl.SJ ? '↑解锁' : '↓锁闭'}</text>`;
      g += `<text x="329" y="248" class="small-label">道岔被锁闭于进路，点亮白光带</text>`;
      g += wire('M565,229H610', rl.LXJ || rl.YXJ);
      g += `<rect x="610" y="182" width="250" height="95" rx="6" class="circuit-symbol ${rl.LXJ || rl.YXJ ? 'live' : ''}"/>`;
      g += `<text x="624" y="206" style="font-weight:600">11 线：LXJ/DXJ/YXJ 开放信号</text>`;
      g += `<text x="624" y="228" class="small-label">${rl.YXJ ? 'YXJ:↑ 引导HB' : 'LXJ:' + (rl.LXJ ? '↑' : '↓')} · ZCJ:${rl.ZCJ ? '↑' : '↓防迎面'} · DJ:${rl.DJ ? '↑' : '↓'}</text>`;
      g += `<text x="624" y="248" class="small-label">${rl.YXJ ? 'YXJ↑点亮 HB (过车须ZRA解锁)' : '经 XJJ↑ + ZCJ/GJJ + DJ↑ 自闭'}</text>`;
      g += `<text x="20" y="308" class="small-label">提示：8线与11线独立检查道岔位置与红灯 DJ↑；任何瞬间断丝或失表示立即切断 LXJ！</text>`;
      $('circuit').innerHTML = `<svg viewBox="0 0 880 330" class="textbook-circuit" role="img" aria-label="6502 8至11线网路透视图">${g}</svg>`;
      $('circuit-note').textContent = '10 线建立进路锁闭（SJ↓），11 线建立信号自闭，接车一压 IAG 即关信号。';
      return;
    }
    if (s.stationNetView === 'line12_13') {
      g += `<text x="20" y="166" style="fill:#7de0bd;font-weight:600">6502 网路线透视 ③｜12—13 线：三点检查 · CJ 快吸慢放 · SGA+ZRA 区故解(图9.6.1)</text>`;
      g += `<rect x="20" y="182" width="265" height="98" rx="6" class="circuit-symbol ${rl.LJ1 ? 'live' : ''}"/>`;
      g += `<text x="34" y="206" style="font-weight:600">12 线：1LJ↑ 与 CJ 快吸慢放</text>`;
      g += `<text x="34" y="228" class="small-label">1LJ:${rl.LJ1 ? '↑' : '↓'} · CJ:${rl.CJ ? '↑(快吸↑/慢放)' : '↓'}</text>`;
      g += `<text x="34" y="248" class="small-label">检上一段解锁(SJ↑) + 本段被占用过(${st.sgaTarget}↓)</text>`;
      g += `<text x="34" y="266" class="small-label">CJ 第8.4节：传递解锁信号快吸慢放</text>`;
      g += wire('M285,231H318', rl.LJ2);
      g += `<rect x="318" y="182" width="265" height="98" rx="6" class="circuit-symbol ${rl.LJ2 ? 'live' : ''}"/>`;
      g += `<text x="332" y="206" style="font-weight:600">13 线：2LJ↑ 三点检查与 FDGJ 3s</text>`;
      g += `<text x="332" y="228" class="small-label">DGJ:${rl.DGJ ? '↑' : '↓'} · FDGJ:${rl.FDGJ ? (st.dg11Slow ? '⏳缓放' : '↑') : '↓'} · 2LJ:${rl.LJ2 ? '↑' : '↓'}</text>`;
      g += `<text x="332" y="248" class="small-label">本段曾占用(1LJ↑)+已出清(DGJ↑·FDGJ↓)</text>`;
      g += `<text x="332" y="266" class="small-label">+ 下一区段已占用 → 2LJ↑ → SJ↑解锁！</text>`;
      g += wire('M583,231H610', st.sgaUnlocked);
      g += `<rect x="610" y="182" width="250" height="98" rx="6" class="circuit-symbol ${st.sgaUnlocked ? 'live' : ''}"/>`;
      g += `<text x="624" y="206" style="font-weight:600">图9.6.1：SGA + ZRA 区故解</text>`;
      g += `<text x="624" y="228" class="small-label">条件：① DGJF↑ (确认空闲=${rl.DGJ ? '满足' : '阻塞!'})</text>`;
      g += `<text x="624" y="248" class="small-label">　　　② QJJ↓ (不在锁闭建立=${!rl.QJJ ? '满足' : '闭锁'})</text>`;
      g += `<text x="624" y="266" style="fill:${st.sgaUnlocked ? '#7de0bd' : '#efb860'}" class="small-label">结果：${st.sgaUnlocked ? '1LJ/2LJ/SJ↑ 应急解锁成功' : '平时走三点检查'}</text>`;
      $('circuit').innerHTML = `<svg viewBox="0 0 880 330" class="textbook-circuit" role="img" aria-label="6502 12至13线三点检查与区故解透视图">${g}</svg>`;
      $('circuit-note').textContent = '结合教材第 8.4 / 9.3 / 9.6 节：可注入盲测题 4（遗留白光带）后切换到此视图再点“区故解 SGA+ZRA”观察条件触发过程。';
      return;
    }

    // 默认 'matrix'：20 个核心联锁继电器实时状态矩阵（含第8.3节 ZCJ、第3.3.4节 YXJ 与随车动态活跃区段 activeSec）
    const aSec = st.activeSec || { label: st.sgaTarget, DGJ: rl.DGJ, FDGJ: rl.FDGJ, QJJ: rl.QJJ, LJ1: rl.LJ1, LJ2: rl.LJ2, CJ: rl.CJ, SJ: rl.SJ, slow: st.dg11Slow };
    g += `<text x="20" y="164">室内信号楼组合架 20 个核心继电器实时状态与【教材规定常态】（当前随车追踪区段：${aSec.label} · 点击卡片可拆解）</text>`;
    const boxes = [
      ['LAJ', 'LAJ 按钮', rl.LAJ, false, '常态↓(平时11-13闭)'],
      ['LJJ', st.isDep ? 'LFJ 发车方向' : st.isShunt ? 'DFJ 调车方向' : 'LJJ 接车方向', st.isDep ? rl.LFJ : st.isShunt ? rl.DFJ : rl.LJJ, false, '常态↓(平时11-13闭)'],
      ['DCJ', 'DCJ/FCJ 操岔', rl.DCJ || rl.FCJ, false, '常态↓(平时11-13闭)'],
      ['DQJ1', '1DQJ 一启动', rl.DQJ1, rl.DQJ1, '常态↓(平时11-13闭)'],
      ['DQJ2', '2DQJ 二启动', !rl.DQJ2, rl.DQJ2, '常态定位(111-112闭)'],
      ['DBJ', 'DBJ 定位表示', rl.DBJ, false, '常态↑(平时11-12闭)'],
      ['FBJ', 'FBJ 反位表示', rl.FBJ, false, '常态↓(平时11-13闭)'],
      ['FKJ', 'FKJ 辅助开始', rl.FKJ, false, '常态↓(平时11-13闭)'],
      ['KJ', 'KJ 7线选排', rl.KJ, false, '常态↓(平时11-13闭)'],
      ['XJJ', 'XJJ 8线检查', rl.XJJ, false, '常态↓(平时11-13闭)'],
      ['QJJ', `QJJ (${aSec.label})`, aSec.QJJ, false, '常态↓(平时11-13闭)'],
      ['SJ', `SJ (${aSec.label})`, aSec.SJ, !aSec.SJ, '常态↑(平时11-12闭)'],
      ['ZCJ', 'ZCJ 迎面照查', rl.ZCJ, !rl.ZCJ, '常态↑(锁闭↓防迎面)'],
      ['DJ', 'DJ 灯丝监督', rl.DJ, !rl.DJ, '常态↑(平时11-12闭)'],
      ['LXJ', st.isShunt ? 'DXJ 调车信号' : 'LXJ 列车信号', rl.LXJ, false, '常态↓(平时11-13闭)'],
      ['YXJ', 'YXJ 引导信号', rl.YXJ, !!st.guideActive, '常态↓(引导HB亮)'],
      ['DGJ', `${aSec.label}J 轨道`, aSec.DGJ, !aSec.DGJ, '常态↑(平时11-12闭)'],
      ['FDGJ', `FDGJ (${aSec.label})`, aSec.FDGJ, !!aSec.slow, '常态↓(平时11-13闭)'],
      ['LJ1', `1LJ (${aSec.label})`, aSec.LJ1, !aSec.LJ1, '常态↑(平时11-12闭)'],
      ['LJ2', `2LJ (${aSec.label})`, aSec.LJ2, !aSec.LJ2, '常态↑(平时11-12闭)']
    ];
    boxes.forEach(([key, title, on, warn, sub], idx) => {
      const col = idx % 5, row = Math.floor(idx / 5);
      const bx = 20 + col * 169, by = 178 + row * 64;
      const isChg = changedMatrixKeys.has(key);
      const stroke = isChg ? '#7de0bd' : warn ? '#efb860' : on ? '#7de0bd' : '#4a5d70';
      const fill = warn ? '#2d2418' : on ? '#15332b' : '#121b27';
      g += `<g class="svg-relay-box${isChg ? ' changed' : ''}" data-relay-key="${key}"><rect x="${bx}" y="${by}" width="161" height="54" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="${isChg ? '2.4' : '1.5'}"/>`;
      const stateGlyph = key === 'DQJ2' ? (on ? '定' : '反') : (on ? '↑' : '↓');
      g += `<text x="${bx + 9}" y="${by + 21}" style="fill:${warn ? '#efb860' : on ? '#7de0bd' : '#c0d0de'};font-weight:600;font-size:11px">${title} ${stateGlyph}${isChg ? ' ★' : ''}</text>`;
      g += `<text x="${bx + 9}" y="${by + 40}" class="small-label">${sub}</text></g>`;
    });
    $('circuit').innerHTML = `<svg viewBox="0 0 880 442" class="textbook-circuit" role="img" aria-label="车站全作业与20个联锁继电器同步状态矩阵">${g}</svg>`;
    $('circuit-note').textContent = '上方严格对照教材图 3.1.1 下行咽喉与表 3.2.2 全 33 条进路（点击信号机/继电器均可拆解），透视框可切换 1–13 线（含 ZCJ/GJJ、YXJ 引导及图 9.6.1 区故解）。';
  }

  function renderSignalCircuit() {
    const sig = result.signal, rls = sig.relays, spec = S.signalModels[sig.type];
    $('circuit-title').textContent = `${spec.model} · 第 2.3 节灯位 (${spec.variantNames[sig.variant]}) & 第 5.1 节点灯监督电路`;
    const mainOK = sig.filament === 'main';
    const backOK = sig.filament === 'backup';
    const anyLit = mainOK || backOK;
    const bxLive = anyLit;
    let g = `<text x="20" y="20">左：第 5.1 节 BX-30 一次侧串 DJ (JZXC-H62) 与 DZJ 主/副灯丝自动转换电路</text>`;
    g += `<text x="530" y="20">右：第 2.3 节机构实景灯位映射（PDF p.24–26）</text>`;

    // BX-30 变压器 + DJ 线圈串联回路
    g += `<circle cx="48" cy="108" r="14" class="circuit-symbol ${bxLive ? 'live' : ''}"/><text x="48" y="112" text-anchor="middle" style="font-size:10px">BX</text><text x="48" y="135" text-anchor="middle" class="small-label">BX-30</text>`;
    g += wire('M62,108H100', bxLive);
    g += `<rect x="100" y="90" width="112" height="36" rx="5" class="circuit-symbol ${rls.DJ ? 'live' : ''}" data-sig-part="filament" style="cursor:pointer"/>`;
    g += `<text x="156" y="106" text-anchor="middle" style="font-weight:600;font-size:11px">DJ (5-6 · 2×31Ω)</text><text x="156" y="121" text-anchor="middle" class="small-label">${rls.DJ ? '↑ 吸起监督' : '↓ 双丝断开'}</text>`;
    g += wire('M212,108H242', anyLit);

    // 5.1节组合继电器状态矩阵卡片（完整展示全部继电器，不截断 DZJ）
    const rNameMap = { LQJ2: '2LQJ', LQJ3: '3LQJ', DJ2: '2DJ', DJ3: '3DJ' };
    const chips = Object.entries(rls).map(([k, v]) => `${rNameMap[k] || k}:${v ? '↑' : '↓'}`);
    g += `<rect x="242" y="50" width="146" height="116" rx="6" class="circuit-symbol ${anyLit && !sig.downgradedToRed ? 'live' : ''}"/>`;
    g += `<text x="315" y="68" text-anchor="middle" style="font-weight:600">${sig.downgradedToRed ? '⚠ 2DJ↓ 防升级切断!' : '第 5.1 节继电器'}</text>`;
    chips.slice(0, 8).forEach((ch, idx) => {
      const colIdx = idx % 2, rowIdx = Math.floor(idx / 2);
      const isBadCut = sig.downgradedToRed && (ch.startsWith('2DJ') || ch.startsWith('LXJ'));
      g += `<text x="${278 + colIdx * 74}" y="${90 + rowIdx * 19}" text-anchor="middle" class="small-label" style="fill:${isBadCut ? '#f3959f' : ch.endsWith('↑') ? '#7de0bd' : '#9ab0c2'};font-weight:${ch.endsWith('↑') || isBadCut ? '600' : '400'}">${ch}</text>`;
    });

    // DZJ 主/副灯丝转换开关 + H1 / H2 双灯丝
    g += wire('M388,108H418', anyLit) + dot(418, 108, anyLit);
    g += wire(mainOK ? 'M418,108L452,72' : 'M418,108L452,144', anyLit);
    g += `<text x="434" y="42" text-anchor="middle" class="small-label">DZJ (${mainOK ? '↑主丝' : '↓副丝'})</text>`;

    // 主丝 H1
    g += wire('M452,72H492', mainOK);
    g += `<circle cx="508" cy="72" r="14" class="circuit-symbol ${mainOK ? 'live' : ''}" data-sig-part="filament" style="cursor:pointer"/>`;
    g += `<text x="508" y="76" text-anchor="middle" style="font-size:10px">${mainOK ? 'H₁' : '✕'}</text>`;
    g += `<text x="508" y="52" text-anchor="middle" class="small-label">主灯丝 ${mainOK ? '通电' : '断丝'}</text>`;

    // 副丝 H2
    g += wire('M452,144H492', backOK);
    g += `<circle cx="508" cy="144" r="14" class="circuit-symbol ${backOK ? 'live' : ''}" data-sig-part="filament" style="cursor:pointer"/>`;
    g += `<text x="508" y="148" text-anchor="middle" style="font-size:10px">${backOK ? 'H₂' : sig.filament === 'broken' ? '✕' : '备'}</text>`;
    g += `<text x="508" y="170" text-anchor="middle" class="small-label">副灯丝 ${backOK ? '代偿通电' : sig.filament === 'broken' ? '断丝' : '待命'}</text>`;

    // 右侧：第 2.3 节信号机机构真实灯位排列竖图（strict PDF p.24/26 color sequence）
    const stacks = {
      inStation: [['U1', '黄'], ['L', '绿'], ['H', '红'], ['U2', '黄'], ['B', '月白']],
      distant: [['L', '绿'], ['U1', '黄']],
      depFour: [['L', '绿'], ['H', '红'], ['U1', '黄'], ['L2', '绿'], ['B', '月白']],
      depThree: sig.variant === 'a'
        ? [['L', '绿'], ['H', '红'], ['U1', '黄'], ['B', '月白']]
        : [['L', '绿'], ['X', '空'], ['U1', '黄'], ['B', '月白'], ['H', '红']],
      depSemi: [['L', '绿'], ['H', '红']],
      shuntSig: [['B', '月白'], ['A', '蓝']]
    };
    const slotCols = { H: '#f35867', U1: '#ffcb47', U2: '#ffcb47', L: '#4be38d', L2: '#4be38d', B: '#eef7ff', A: '#389bff', X: '#1f2b38' };
    const activeSlots = new Set();
    const flashSlots = new Set();
    if (anyLit) {
      const a = sig.aspect;
      if (a === 'H') activeSlots.add('H');
      else if (a === 'U') activeSlots.add('U1');
      else if (a === 'UU') { activeSlots.add('U1'); activeSlots.add('U2'); }
      else if (a === 'L') activeSlots.add('L');
      else if (a === 'LU') { activeSlots.add('L'); activeSlots.add(sig.type === 'inStation' ? 'U2' : 'U1'); }
      else if (a === 'LL') { activeSlots.add('L'); activeSlots.add('L2'); }
      else if (a === 'USU') { activeSlots.add('U1'); activeSlots.add('U2'); flashSlots.add('U1'); }
      else if (a === 'HB') { activeSlots.add('H'); activeSlots.add('B'); }
      else if (a === 'B' || a === 'B_FLASH') { activeSlots.add('B'); if (a === 'B_FLASH') flashSlots.add('B'); }
      else if (a === 'A') activeSlots.add('A');
    }
    const stack = stacks[sig.type] || stacks.inStation;
    const rx = 678, sy0 = stack.length >= 5 ? 46 : stack.length === 4 ? 56 : 78;
    const hBox = stack.length * 32 + 16;
    g += `<rect x="${rx - 30}" y="${sy0 - 16}" width="60" height="${hBox}" rx="28" fill="#101822" stroke="#eef5fc" stroke-width="2" data-sig-part="lens" style="cursor:pointer"/>`;
    stack.forEach(([slot, cname], idx) => {
      const cy = sy0 + 10 + idx * 32;
      const on = activeSlots.has(slot);
      const isFl = flashSlots.has(slot);
      const col = on ? slotCols[slot] : '#1c2836';
      if (slot === 'X') {
        g += `<circle cx="${rx}" cy="${cy}" r="11" fill="#17222f" stroke="#536679"/><path d="M${rx - 5},${cy - 5}l10,10m-10,0l10,-10" stroke="#62788e"/>`;
      } else {
        g += `<circle cx="${rx}" cy="${cy}" r="11" fill="${col}" stroke="${on ? '#ffffff' : '#4a5e72'}" stroke-width="${on ? 2 : 1.2}"${isFl ? ' stroke-dasharray="3 2"' : ''}/>`;
      }
      g += `<text x="${rx + 40}" y="${cy + 4}" class="small-label" style="${on ? 'fill:#eef7ff;font-weight:700' : ''}">${cname}${on ? (isFl ? ' ✦闪' : ' ●亮') : ''}</text>`;
    });

    if (['depFour', 'depThree'].includes(sig.type)) {
      const indOn = sig.indicator === 'right' && anyLit && !['H', 'B', 'A'].includes(sig.aspect);
      g += `<g data-sig-part="indicator" style="cursor:pointer"><rect x="778" y="88" width="84" height="50" rx="6" class="circuit-symbol ${indOn ? 'live' : ''}"/>`;
      g += `<text x="820" y="109" text-anchor="middle" style="font-weight:700;fill:${indOn ? '#fff2b0' : '#788fa3'}">${indOn ? '右 →' : '表示器'}</text>`;
      g += `<text x="820" y="127" text-anchor="middle" class="small-label">${indOn ? '3DJ↑ 亮' : '未点亮'}</text></g>`;
    }

    g += `<text x="20" y="218" class="small-label">${sig.spec.meaning || ''}（${spec.variantNames[sig.variant]} · 拆解见透镜/反光碗/双灯丝/XB）</text>`;
    $('circuit').innerHTML = `<svg viewBox="0 0 880 236" class="textbook-circuit" role="img" aria-label="信号机点灯与第2.3节灯位电路图">${g}</svg>`;
    $('circuit-note').textContent = '红灯灭灯保护原则（第 5.1 节）：主灯丝断丝 → DZJ 落下切换 H₂ 副灯丝；双断丝 → DJ↓ 可靠切断允许信号，严防信号机灭灯。';
  }

  function renderCircuit() {
    if (s.mode === 'curriculum' || s.mode === 'cbi') return;
    if (s.mode === 'signal') { renderSignalCircuit(); return; }
    if (s.mode === 'station') { renderStationCircuit(); return; }
    if (s.type === 'selfHold') { renderSelfHoldCircuit(); return; }
    if (s.type === 'turnoutLab') { renderTurnoutCircuit(); return; }
    if (s.type === 'fiveWireLab') { renderFiveWireCircuit(); return; }
    if (s.type === 'cbiIoLab') { renderCbiIoCircuit(); return; }
    const c = contacts();
    if (s.type === 'phase') { renderPhaseCircuit(); return; }
    if (s.mode === 'track') { renderTrackCircuit(); return; }
    if (s.type === 'filament' && s.filamentSignalSystem === 'outDep') {
      const asp = s.filamentOutAspect;
      const drive = result.drive;
      const relays = {
        L: ['ZXJ↑ · LXJ↑ · 2LQJ↑ · 3LQJ↑ · DXJ↓', '#7de0bd', 'L 绿灯（主方向3+闭塞）'],
        LU: ['ZXJ↑ · LXJ↑ · 2LQJ↑ · 3LQJ↓ · 2DJ↑', '#a7eb78', 'LU 绿黄灯（主方向2闭塞）'],
        U: ['ZXJ↑ · LXJ↑ · 2LQJ↓ · 3LQJ↓ · DXJ↓', '#ffcb47', 'U 单黄灯（主方向1闭塞）'],
        L_REV: ['ZXJ↓ · LXJ↑/LXJF↑ → 先检3DJ↑ → L+表示器', '#7de0bd', '反向发车 L+表示器'],
        B: ['LXJ↓ · DXJ↑ · DJ↑（5-6 监督）', '#e7f2ff', 'B 月白灯（调车作业）'],
        H: ['LXJ↓ · DXJ↓ · DJ↑（常态红灯）', '#f3959f', 'H 红灯（禁止越过）']
      }[asp] || ['LXJ↓', '#f3959f', 'H 红灯'];
      $('circuit-title').textContent = '图 5.1.3 两方向出站兼调车信号机点灯编码与主/副灯丝 DJ 监督电路';
      let g = `<text x="20" y="20">控制电源：${drive ? '∿ AC 220V 供电正常' : '○ 电源断开'} ｜ 灯丝状态：${s.filamentMode === 'main' ? '主灯丝H₁(DJ↑)' : s.filamentMode === 'backup' ? '主丝断→DZJ↓副灯丝(DJ↑)' : '✕ 主副双断(DJ↓灭灯!)'}</text>`;
      g += `<circle cx="45" cy="75" r="14" class="circuit-symbol ${drive ? 'live' : ''}"/><text x="45" y="79" text-anchor="middle">∿</text>`;
      g += wire('M59,75H105', drive);
      g += `<rect x="105" y="55" width="102" height="40" rx="4" class="circuit-symbol ${result.picked ? 'live' : ''}"/><text x="156" y="79" text-anchor="middle">DJ(5-6) ${result.picked ? '↑' : '↓'}</text>`;
      g += wire('M207,75H255', drive);
      g += `<rect x="255" y="48" width="335" height="54" rx="5" class="circuit-symbol ${drive ? 'live' : ''}"/><text x="422" y="71" text-anchor="middle" style="font-weight:600">${relays[0]}</text><text x="422" y="90" text-anchor="middle" class="small-label">表5.1.4 / 图5.1.3 条件组合</text>`;
      g += wire('M590,75H655', drive && s.filamentMode !== 'broken');
      const sigColor = !drive || s.filamentMode === 'broken' ? '#2c3844' : relays[1];
      g += `<rect x="655" y="45" width="205" height="60" rx="6" fill="#101822" stroke="${sigColor}" stroke-width="2"/><circle cx="688" cy="75" r="15" fill="${sigColor}" stroke="#8fa4b5"/><text x="713" y="72" style="fill:${sigColor};font-weight:600;font-size:11px">${relays[2]}</text><text x="713" y="90" class="small-label">${drive ? (s.filamentMode === 'broken' ? '双断丝灭灯(需防红灯断)' : '点灯正常') : '未供电'}</text>`;
      g += `<text x="20" y="144" class="small-label">关键要点（表 5.1.4 / 图 5.1.3 / 书内 p.63–64）：主方向发车 ZXJ↑（L 检 2LQJ↑·3LQJ↑，LU 必先检 2DJ↑）；</text>`;
      g += `<text x="20" y="164" class="small-label">反向发车 ZXJ↓（必先点亮表示器检 3DJ↑ 再点绿灯 L）；调车作业 LXJ↓·DXJ↑ 亮月白灯 B；双灯丝均断时 DJ↓ 熄灭允许信号。</text>`;
      $('circuit').innerHTML = `<svg viewBox="0 0 880 185" class="textbook-circuit" role="img" aria-label="图5.1.3两方向出站兼调车点灯电路">${g}</svg>`;
      $('circuit-note').textContent = '切换上方“出站兼调车显示”下拉框，逐一验证主方向 ZXJ↑ (L/LU/U)、反向 ZXJ↓ (先检 3DJ↑ 亮 L+表示器) 与调车 B 灯的继电器组合条件。';
      return;
    }
    const isLatch = s.type === 'latching';
    const isSlow = ['slowRelease', 'heavySlow', 'filament'].includes(s.type);
    $('circuit-title').textContent = isLatch ? '线圈控制回路与极性定/反位接点电路（表4.1.3）' : s.type === 'filament' ? 'BX-30 信号点灯回路与 DJ 灯丝监督/主副丝转换电路（图5.1.2）' : s.type === 'heavySlow' ? '1DQJ 双异阻线圈（125Ω启动 + 0.44Ω串联电机M自闭）与接点回路' : '线圈控制回路与独立前/后接点电路（图4.1.6）';
    const ac = ['rectifier', 'filament'].includes(s.type);
    const drive = result.drive;
    const termStr = s.type === 'rectifier' ? '8 — 7' : s.type === 'filament' ? '5 — 6' : '1 — 4';
    let g = `<text x="20" y="15" class="small-label">${s.type === 'filament' ? '信号机点灯监督回路（BX-30 一次侧串联 JZXC-H62/DJ · 端子 5—6）' : s.type === 'heavySlow' ? '1DQJ 启动与电流自闭回路（前圈 3-4 125Ω / 后圈 1-2 0.44Ω 串电机 M）' : '控制回路（端子 ' + termStr + '）'}</text>`;
    const coilX = 282, coilW = 124, coilR = coilX + coilW;
    let rightWire = `M${coilR},35H580V74H60V55`;
    let rightFlow = `M${coilR + 4},35H580V74H60V59`;
    if (s.type === 'rectifier') {
      rightWire = `M${coilR},35H432M522,35H580V74H60V55`;
      rightFlow = `M${coilR + 4},35H430M524,35H580V74H60V59`;
    } else if (s.type === 'filament') {
      rightWire = `M${coilR},35H426M562,35H580V74H60V55`;
      rightFlow = `M${coilR + 4},35H424M564,35H580V74H60V59`;
    } else if (s.type === 'heavySlow') {
      rightWire = `M${coilR},35H472M498,35H580V74H60V55`;
      rightFlow = `M${coilR + 4},35H470M500,35H580V74H60V59`;
    }
    g += wire(`M73,35H190M250,35H${coilX}`, drive) + wire(rightWire, drive);
    g += `<circle class="circuit-symbol ${drive ? 'live' : ''}" cx="60" cy="42" r="13"/><text x="60" y="46" text-anchor="middle">${ac ? '∿' : s.polarity === -1 ? '−' : '＋'}</text>`;
    g += dot(190, 35, drive) + dot(250, 35, drive) + wire(drive ? 'M190,35H250' : 'M190,35L243,18', drive);
    g += `<rect class="circuit-symbol ${drive ? 'live' : ''}" x="${coilX}" y="22" width="${coilW}" height="26" rx="3"/>`;
    if (isSlow) g += `<rect x="${coilX}" y="36" width="${coilW}" height="12" fill="#6b4423" opacity=".65"/>`;
    g += `<text x="${coilX + coilW / 2}" y="39" text-anchor="middle" style="font-size:11px">${s.type === 'timeRelay' ? 'JSBXC-850 (3′)' : S.models[s.type].model.split('（')[0]}</text>`;
    if (s.type === 'rectifier') g += `<rect x="432" y="22" width="90" height="26" rx="3" class="circuit-symbol ${drive ? 'live' : ''}"/><text x="477" y="39" text-anchor="middle">半波整流</text>`;
    else if (s.type === 'filament') g += `<rect x="426" y="22" width="136" height="26" rx="3" class="circuit-symbol ${drive ? 'live' : ''}"/><text x="494" y="39" text-anchor="middle" style="font-size:10.5px">${s.filamentMode === 'main' ? '主灯丝 H₁ 导通' : s.filamentMode === 'backup' ? 'DZJ↓ 转副灯丝 H₂' : '✕ 主副丝双断'}</text>`;
    else if (s.type === 'heavySlow') g += `<circle cx="485" cy="35" r="13" class="circuit-symbol ${drive ? 'live' : ''}"/><text x="485" y="39" text-anchor="middle">M</text><text x="485" y="62" text-anchor="middle" class="small-label">转辙机电机</text>`;
    else if (s.type === 'slowRelease') g += `<text x="494" y="59" text-anchor="middle" class="small-label">铜套阻尼 + RC 缓放 ≥0.45s</text>`;
    else if (s.type === 'timeRelay') g += `<text x="494" y="59" text-anchor="middle" class="small-label">电子计时：${Math.round(timerProgress * 100)}%</text>`;
    if (drive) g += flow(`M78,35H188M252,35H${coilX - 2}${rightFlow}`, s.polarity === -1);
    g += `<text x="20" y="136" class="small-label">接点回路（与线圈电气隔离）</text>`;
    g += wire('M80,162V150H265M80,170V221H590V120H505M590,180H505', true);
    g += `<path d="M68,162h24m-19,8h14" stroke="#b9c8d3" stroke-width="2"/><text x="52" y="158">＋</text>`;
    g += `<g data-contact-part="front" class="circuit-contact ${selectedPart === 'front' ? 'selected' : ''}">${wire('M345,120H475', c.frontClosed)}<rect x="334" y="103" width="210" height="34" fill="transparent"/></g>`;
    g += `<g data-contact-part="back" class="circuit-contact ${selectedPart === 'back' ? 'selected' : ''}">${wire('M345,180H475', c.backClosed)}<rect x="334" y="164" width="210" height="34" fill="transparent"/></g>`;
    g += wire(benchSwitchD(), true, 'id="bench-switch-arm" data-contact-part="common"');
    g += dot(265, 150, true) + dot(345, 120, c.frontClosed) + dot(345, 180, c.backClosed);
    if (isLatch) {
      g += `<text x="248" y="172" class="small-label">111 中</text><text x="348" y="111" class="small-label">112 定位</text><text x="348" y="200" class="small-label">113 反位</text>`;
      g += lamp(490, 120, c.frontClosed, '定位接点负载') + lamp(490, 180, c.backClosed, '反位接点负载');
    } else {
      g += `<text x="255" y="172" class="small-label">11 中</text><text x="352" y="111" class="small-label">12 前</text><text x="352" y="200" class="small-label">13 后</text>`;
      g += lamp(490, 120, c.frontClosed, '前接点负载') + lamp(490, 180, c.backClosed, '后接点负载');
    }
    $('circuit').innerHTML = svgWrap(g, 245);
    $('circuit-note').textContent = isLatch ? '表4.1.3：极性保持继电器接点编号为 111(中)、112(定位)、113(反位)；控制线圈断电后，永磁体保持原接点闭合。' : isSlow ? '表4.1.2/4.1.4：缓放型继电器切断电源时，铁芯阻尼铜套内的感应涡流阻碍磁通衰减，前接点保持短暂闭合后再落下。' : '线圈回路与接点回路彼此独立。接点转换遵循“先断后接”。';
  }
  function transformer(x, y, upper, lower, name) {
    let top = `M${x - 30},${y}`, bottom = `M${x - 30},${y + 46}`;
    for (let i = 0; i < 3; i++) { top += 'q0,14,10,14q10,0,10,-14'; bottom += 'q0,-14,10,-14q10,0,10,14'; }
    return wire(top, upper) + wire(bottom, lower) + `<path d="M${x - 36},${y + 21}h72m-72,5h72" stroke="#91a8b9"/><text x="${x}" y="${y + 76}" text-anchor="middle">${name}</text>`;
  }
  function renderPhaseCircuit() {
    const inTrack = s.mode === 'track';
    const powerOn = inTrack ? s.power : !!s.polarity;
    const railBreak = inTrack && s.railBreak;
    const recvBreak = inTrack && s.receiverBreak;
    const shunt = inTrack && result.shunt;
    const trackOn = result.drive, localOn = s.localPower;
    const front = 190 + s.front * 3.6, rear = front - 144;
    const phaseAxles = [0, .21, .38, .62, .79, 1].map(k => front - k * 144);
    const inSecPhase = phaseAxles.filter(x => x >= 190 && x <= 550);
    const which = inSecPhase.length ? Math.min(...inSecPhase) : (s.front <= 100 ? front : rear);

    let g = `<text x="20" y="18">图5.3.3 一送两受 25 Hz 相敏轨道电路接口拓扑 · 轨道线圈 3-4 与局部线圈 1-2</text>`;
    g += wire('M80,50H488M508,50H740M80,80H740', false);
    if (!railBreak) g += wire('M488,50H508', false);
    if (powerOn) {
      const stopX = railBreak ? 488 : 620;
      const liveEnd = shunt && which < stopX ? which : stopX;
      g += wire(`M140,88V50H${liveEnd}`, true);
      if (shunt && (!railBreak || which < 488)) {
        g += wire(`M${which},50V80H180V88`, true) + flow(`M140,50H${which}V80H180`);
      } else if (trackOn) {
        g += wire('M180,88V80H660V88M620,50V88', true) + flow('M140,50H620V88');
      }
    }
    for (const x of [190, 550]) g += `<path d="M${x - 2},44v12m4,-12v12m-4,18v12m4,-12v12" stroke="#d5ad70" stroke-width="2"/>`;
    g += `<text x="370" y="39" text-anchor="middle" class="small-label">两根钢轨（25 Hz 信号传输路径）</text>`;
    if (inTrack) {
      const carSegs = [[front - 36, front + 12], [front - 102, front - 42], [front - 156, front - 108]];
      for (const [x0, x1] of carSegs) {
        const cx0 = Math.max(82, x0), cx1 = Math.min(738, x1);
        if (cx1 - cx0 > 4) g += `<rect x="${cx0.toFixed(1)}" y="54" width="${(cx1 - cx0).toFixed(1)}" height="22" rx="4" fill="#d6e3ea" fill-opacity=".18" stroke="#9ec4dc" stroke-width="1.2"/>`;
      }
      for (const x of phaseAxles) if (x > 90 && x < 730) {
        g += `<circle cx="${x.toFixed(1)}" cy="48" r="4.8" fill="#d6e3ea"/><circle cx="${x.toFixed(1)}" cy="82" r="4.8" fill="#d6e3ea"/><path d="M${x.toFixed(1)},48V82" stroke="#d6e3ea" stroke-width="2.5"/>`;
      }
    }
    if (shunt) g += `<text x="${Math.max(220, Math.min(500, which))}" y="100" style="fill:#7de0bd">⚡ 轮对分路</text>`;
    if (railBreak) g += `<text x="498" y="41" text-anchor="middle" style="fill:#f3959f">钢轨断路</text>`;

    const blocks = [[120, 88, 80, 40, 'BE₂₅ 送端'], [120, 155, 80, 42, 'BG₂₅ 送端'], [600, 88, 80, 40, 'BE₂₅ 受端'], [600, 155, 80, 42, 'BG₂₅ 受端']];
    for (const [x, y, w, h, t] of blocks) {
      const blkLive = x < 300 ? powerOn : (trackOn || (powerOn && !railBreak && !shunt && y === 88));
      g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="circuit-symbol ${blkLive ? 'live' : ''}"/><text x="${x + w / 2}" y="${y + 24}" text-anchor="middle">${t}</text>`;
    }
    g += wire('M140,128V155M180,128V155', powerOn) + wire('M620,128V155M660,128V155', trackOn || (powerOn && !railBreak && !shunt));
    g += `<text x="213" y="142">RD、Rₓ(4.4Ω)</text><text x="691" y="142">RD、Rₛ</text>`;
    g += wire('M140,197V270H144M176,270H180V197', powerOn);
    g += `<circle cx="160" cy="270" r="16" class="circuit-symbol ${powerOn ? 'live' : ''}"/><text x="160" y="275" text-anchor="middle">∿</text><text x="160" y="309" text-anchor="middle">GJZ₂₂₀ / GJF₂₂₀</text><text x="160" y="330" text-anchor="middle" class="small-label">25 Hz 轨道电源</text>`;

    const recvLeft = recvBreak ? 'M620,197V266M620,280V295' : 'M620,197V295';
    g += wire(recvLeft, trackOn) + wire('M660,197V295', trackOn);
    if (recvBreak) g += `<text x="535" y="277" style="fill:#f3959f">受电线断开</text>`;
    g += wire('M620,218H660M620,254H660', trackOn);
    g += `<rect x="627" y="207" width="26" height="20" class="circuit-symbol ${trackOn ? 'live' : ''}"/><text x="640" y="221" text-anchor="middle">Z</text><rect x="627" y="244" width="26" height="20" class="circuit-symbol ${trackOn ? 'live' : ''}"/><text x="640" y="258" text-anchor="middle">HF</text><text x="692" y="221">Z、HF 跨接轨道侧</text>`;
    g += `<rect x="600" y="295" width="80" height="72" rx="6" class="circuit-symbol ${result.picked ? 'live' : ''}"/><text x="640" y="317" text-anchor="middle">3　轨道　4</text><text x="640" y="348" text-anchor="middle">1　局部　2</text><text x="700" y="322">GJ · 二元二位</text><text x="700" y="346">${result.picked ? '↑ 吸起（空闲）' : (s.phase === 'reversed' && trackOn && localOn ? '↓ 反向转矩压落' : '↓ 落下')}</text>`;
    g += wire('M620,367V433H624M656,433H660V367', localOn) + wire('M620,397H633M647,397H660', localOn);
    g += `<path d="M633,386v22m14,-22v22" stroke="#91a8b9" stroke-width="2"/><text x="640" y="384" text-anchor="middle">C</text><circle cx="640" cy="433" r="16" class="circuit-symbol ${localOn ? 'live' : ''}"/><text x="640" y="438" text-anchor="middle">∿</text><text x="505" y="440" text-anchor="middle">JJZ₂₂₀ / JJF₁₁₀ · 25 Hz 局部电源</text>`;
    g += `<text x="20" y="385">轨道3-4输入：${trackOn ? '有信号' : '无信号'}　局部1-2电源：${localOn ? '正常' : '断开'}</text><text x="20" y="411">频率条件：${s.frequency === 'correct' ? '25 Hz 符合' : '频率不符'}　相位条件：${s.phase === 'correct' ? '理想相位差' : (s.phase === 'reversed' ? '相位反接 180°（反向转矩）' : '相位不符')}</text><text x="20" y="440">两路电源、25 Hz 频率与规定相位差同时满足，GJ 才吸起</text>`;
    $('circuit-title').textContent = '教材图5.3.3 · 25 Hz 相敏双输入与并联支路拓扑';
    $('circuit').innerHTML = `<svg viewBox="0 0 880 475" class="textbook-circuit" role="img" aria-label="按教材图5.3.3提取的轨道与局部双输入拓扑">${g}</svg>`;
    $('circuit-note').textContent = '图5.3.3中 Z（防雷补偿器）、HF（25 Hz 防护盒）跨接在轨道线圈 3-4 两端，电容 C 并接在局部线圈 1-2 两端；轮对分路、钢轨断路、受电线断开或频相不符均使 GJ 可靠落下。';
  }
  function renderTrackCircuit() {
    if (s.type === 'phase') { renderPhaseCircuit(); return; }
    const multi = s.multi, received = result.receiverAvailable, shunt = result.shunt;
    const front = 220 + s.front * 4.1, rear = front - 164;
    const trackAxles = [0, .21, .38, .62, .79, 1].map(k => front - k * 164);
    const inSecTrack = trackAxles.filter(x => x >= 220 && x <= 630);
    const which = inSecTrack.length ? Math.min(...inSecTrack) : (s.front <= 100 ? front : rear);
    let g = `<text x="20" y="18">${multi ? '图5.3.2(a) 一送两受并联式道岔区段总检查' : '图5.3.1 50 Hz 交流连续半波整流式轨道电路'} · 元件命名与端子按教材</text>`;

    g += wire('M65,64H597M613,64H835M65,108H835', false);
    g += wire('M70,175V64M130,175V108M710,64V175M770,108V175', false);
    if (!s.railBreak) g += wire('M597,64H613', false);

    if (s.power) {
      const end = s.railBreak ? 597 : 710;
      g += wire(`M70,175V64H148M192,64H${shunt && which < end ? which : end}`, true);
      if (shunt && (!s.railBreak || which < 597)) {
        g += wire(`M${which},64V108H130V175`, true) + flow(`M192,64H${which}V108H130`);
      } else if (received) {
        g += wire('M130,175V108H770V175M710,64V175', true) + flow('M192,64H710V175');
      }
    }
    g += `<rect x="148" y="56" width="44" height="16" class="circuit-symbol"/><text x="169" y="49" text-anchor="middle">2.2 Ω／220 W</text>`;
    for (const x of [220, 630]) g += `<path d="M${x - 2},58v12m4,-12v12m-4,32v12m4,-12v12" stroke="#d5ad70" stroke-width="2"/>`;
    g += `<text x="225" y="130" class="small-label">送端绝缘节</text><text x="605" y="130" class="small-label">受端绝缘节</text>`;

    if (multi) {
      const brLive = result.branchPicked;
      g += wire('M285,64L325,30H470M315,108L355,48H470', brLive);
      g += `<path d="M303,44l8,8m8,8l8,8" stroke="#d5ad70" stroke-width="2"/><text x="480" y="38" class="small-label">道岔分支轨线</text>`;
      if (s.branchOccupied) {
        g += `<circle cx="385" cy="29" r="5" fill="#f3959f"/><circle cx="385" cy="49" r="5" fill="#f3959f"/><path d="M385,29V49" stroke="#f3959f" stroke-width="3"/><text x="396" y="43" style="fill:#f3959f" class="small-label">分支轮对分路</text>`;
      }
      g += wire('M405,30V175M455,48V175', brLive) + transformer(430, 175, brLive, brLive, 'BZ₄ · 分支受端');
      g += wire('M405,221V310H408M452,310H455V221', brLive) + `<circle cx="430" cy="310" r="22" class="circuit-symbol ${brLive ? 'live' : ''}"/><path d="M420,301l15,9l-15,9Zm16,0v18" stroke="#b5c7d4" fill="none"/><text x="430" y="352" text-anchor="middle">支 DGJ₁ · JZXC-480</text><text x="430" y="373" text-anchor="middle">${brLive ? '↑ 吸起（DGJ₁前接点闭合）' : '↓ 落下（切断主DGJ回路）'}</text>`;
    }

    const trackCarSegs = [[front - 42, front + 14], [front - 116, front - 48], [front - 178, front - 122]];
    for (const [x0, x1] of trackCarSegs) {
      const cx0 = Math.max(67, x0), cx1 = Math.min(833, x1);
      if (cx1 - cx0 > 4) g += `<rect x="${cx0.toFixed(1)}" y="71" width="${(cx1 - cx0).toFixed(1)}" height="30" rx="5" fill="#d6e3ea" fill-opacity=".18" stroke="#9ec4dc" stroke-width="1.3"/>`;
    }
    for (const x of trackAxles) if (x > 70 && x < 830) {
      g += `<circle cx="${x.toFixed(1)}" cy="61" r="5.2" fill="#d6e3ea"/><circle cx="${x.toFixed(1)}" cy="111" r="5.2" fill="#d6e3ea"/><path d="M${x.toFixed(1)},61V111" stroke="#d6e3ea" stroke-width="2.6"/>`;
    }
    if (shunt) g += `<text x="${Math.max(305, Math.min(535, which))}" y="132" style="fill:#7de0bd">⚡ 轮对低阻分路</text>`;
    if (s.railBreak) g += `<text x="605" y="54" text-anchor="middle" style="fill:#f3959f">钢轨断路</text>`;

    g += transformer(100, 175, s.power, s.power, 'BG₁-50');
    g += wire('M70,221V310H84M116,310H130V221', s.power) + `<circle cx="100" cy="310" r="16" class="circuit-symbol ${s.power ? 'live' : ''}"/><text x="100" y="315" text-anchor="middle">∿</text><text x="100" y="350" text-anchor="middle">AC 220 V · 50 Hz</text><text x="100" y="371" text-anchor="middle" class="small-label">室内送电电源</text>`;
    g += transformer(740, 175, received, result.drive, 'BZ₄（或BZ₅-A）');
    const mainLeft = s.receiverBreak ? 'M710,221V235M710,248V260' : 'M710,221V260';
    g += wire(mainLeft, result.drive);
    if (multi) {
      g += wire(result.branchPicked ? 'M710,260V288' : 'M710,260L695,281', result.branchPicked) + dot(710, 260, result.branchPicked) + dot(710, 288, result.branchPicked) + wire('M710,288V310H718M762,310H770V221', result.drive);
      g += `<text x="642" y="278">DGJ₁前 ↑</text>`;
    } else {
      g += wire('M710,260V310H718M762,310H770V221', result.drive);
    }
    g += `<circle cx="740" cy="310" r="22" class="circuit-symbol ${result.picked ? 'live' : ''}"/><path d="M730,301l15,9l-15,9Zm16,0v18" stroke="#b5c7d4" fill="none"/><text x="698" y="305">8</text><text x="777" y="305">7</text><text x="740" y="352" text-anchor="middle">${multi ? '主 DGJ' : 'GJ'} · JZXC-480</text><text x="740" y="373" text-anchor="middle">${result.picked ? '↑ 吸起，空闲条件成立' : '↓ 落下，不能证明空闲'}</text>`;
    if (s.receiverBreak) g += `<text x="722" y="244" style="fill:#f3959f">受电线断开</text>`;

    $('circuit-title').textContent = multi ? '图5.3.2(a) · 一送两受道岔分支并联与 DGJ₁ 串联检查' : '图5.3.1 · 50 Hz 连续半波整流式轨道电路';
    $('circuit').innerHTML = `<svg viewBox="0 0 880 410" class="textbook-circuit" role="img" aria-label="教材50赫兹轨道电路">${g}</svg>`;
    $('circuit-note').textContent = (multi ? '图5.3.2(a)：一送多受道岔区段设一个送电端，主股道与侧股分支各设受电端；支 DGJ₁ 前接点串联在主 DGJ 线圈回路中，任一分支有车占用或断线均使主 DGJ 落下。' : '图5.3.1：送电端经 2.2 Ω/220 W 变阻器限流，受电端经 BZ₄ 接入 JZXC-480 的 8、7 端。采用闭路检查原则，断线或分路均导向安全侧（GJ 落下）。');
  }
  function record() {
    if (s.mode === 'station' && s.stationHistory) {
      const h = s.stationHistory;
      $('timeline').innerHTML = h.events.slice(-35).map(e => `<li data-kind="${e.kind}"><span>${e.time.toFixed(1)}s</span>${e.label}${e.page ? `<button data-history-page="${e.page}">教材原页</button>` : ''}</li>`).join('');
      $('journey-note').textContent = `已记录${h.events.length}项事件，显示最近35项。滑块连续经过边界，缓放按仿真秒数推进。${h.omitted ? `更早${h.omitted}项已移出本次缓存。` : ''}`;
      return;
    }
    if (s.mode === 'curriculum' || s.mode === 'cbi') return;
    if (s.mode === 'station') {
      const st = result.station;
      const key = `${st.routeType}/${st.stg}/${st.signalAspect}/${st.occX3JG}/${st.occIAG}/${st.occ1DG}/${st.occ11DG}/${st.occTrack}/${st.dg11Slow}/${st.dg11Unlocked}/${st.cancelMode}/${st.zraUnlocked}/${st.sgaUnlocked}/${result.reasons.join(',')}`;
      if (key === lastRecordKey) return;
      lastRecordKey = key;
      let label = STAGE_NAMES[st.stg].split('（')[0];
      if (st.cancelMode === 'zqa') {
        label = st.zqaUnlocked ? '按下 ZQA：预先锁闭(JYJ↑)且进路完整空闲，信号关闭并立即解锁全进路' : st.approachLocked ? '按下 ZQA：接近锁闭(JYJ↓)仅关闭信号，禁止解锁进路' : '按下 ZQA：进路非完整空闲/失表示，仅关闭信号、禁止解锁';
      } else if (st.cancelMode === 'zra') {
        label = st.zraBlocked ? '人工解锁计时中止，须恢复条件后重新办理' : st.zraUnlocked ? '总人工解锁(ZRA) 延时满，进路安全解锁 (SJ↑)' : '按下 ZRA：关闭信号，启动时间继电器延时解锁计时';
      } else if (st.cancelMode === 'sga') {
        label = st.sgaUnlocked ? `区故解 · 仅 ${st.sgaTarget} 解锁` : `区故解 · ${st.sgaTarget} 占用或操作前QJJ↑`;
      } else if (st.stg === 5) {
        if (st.isDep) {
          label = st.signalAspect === 'L' ? '11线 LXJ↑，出站信号机开放绿灯 L（出发股道不锁闭）' : st.occX3JG ? '发车列车驶出咽喉，区段逐段解锁完毕' : '发车列车压入内方咽喉区段，出站信号关闭并逐段解锁';
        } else if (st.isShunt) {
          label = st.signalAspect === 'B' ? '调车进路开放月白灯 B（保留至整列越过始端信号机）' : '整列越过始端调车信号机，白灯关闭转蓝灯 A';
        } else if (st.occTrack && st.dg11Unlocked) label = `列车停妥 ${st.route3G ? '3G' : 'IG'}，咽喉全部三点检查解锁完毕 (SJ↑)`;
        else if (st.dg11Slow) label = '7-11DG 出清，FDGJ 正在 3s 缓放延时解锁中';
        else if (st.occ11DG) label = '列车压入 7-11DG (11DGJ↓·1LJ↑)，前段已解锁';
        else if (st.occ1DG) label = '列车压入 1DG—1/7G，IAG 出清缓放解锁';
        else if (st.occIAG) label = '第一轮对压入 IAG → LXJ↓ 进站信号机 X 立即关闭回红灯 H';
        else if (st.occX3JG) label = '列车压入 X3JG 接近区段 → JYJ↓ 构成接近锁闭（接近电铃鸣响）';
        else label = `11线 LXJ↑，进站信号机 X 开放 ${st.signalAspect} 灯`;
      }
      timeline.push({ time: elapsed.toFixed(1) + 's', label }); if (timeline.length > 8) timeline.shift();
      $('timeline').innerHTML = timeline.map(e => `<li><span>${e.time}</span>${e.label}</li>`).join('');
      return;
    }
    if (s.mode !== 'track') return;
    const key = `${result.shunt}/${result.picked}/${result.reasons.join(',')}/${s.multi}/${s.branchOccupied}`;
    if (key === lastRecordKey) return;
    lastRecordKey = key;
    const label = result.picked ? '空闲条件成立，GJ 吸起' : (result.reasons.join('、') || '条件不符') + '，GJ 落下';
    timeline.push({ time: elapsed.toFixed(1) + 's', label }); if (timeline.length > 8) timeline.shift();
    $('timeline').innerHTML = timeline.map(e => `<li><span>${e.time}</span>${e.label}</li>`).join('');
  }
  function chooseType(type) {
    comparisonKey = ''; typeBeforeComparison = null; contactFocus = false; contactStep = null; trainFocused = false;
    playing = false;
    const stayTrack = s.mode === 'track' && ['rectifier', 'phase'].includes(type);
    set({ type, mode: stayTrack ? 'track' : 'bench', polarity: 0, latched: false, multi: false, explode: 0 }, true);
  }
  function chooseSignal(signalType, signalVariant) {
    playing = false; comparisonKey = ''; typeBeforeComparison = null; contactFocus = false; contactStep = null; trainFocused = false;
    const spec = S.signalModels[signalType] || S.signalModels.inStation;
    const nextVar = signalVariant && spec.variants.includes(signalVariant) ? signalVariant : spec.variants[0];
    const validAspects = Object.keys(L.SIGNAL_ASPECTS[signalType] || L.SIGNAL_ASPECTS.inStation);
    const curAsp = validAspects.includes(s.signalAspect) ? s.signalAspect : validAspects[0];
    set({ mode: 'signal', signalType, signalVariant: nextVar, signalAspect: curAsp, explode: 0 }, true);
  }

  const STATION_SIGNAL_META = {
    X: { key: 'X', signalType: 'inStation', variant: 'a', plate: 'X', desc: '进站信号机 X (5灯·高柱)' },
    XF: { key: 'XF', signalType: 'inStation', variant: 'a', plate: 'X_F', desc: '反向进站 X_F (5灯·高柱)' },
    D1: { key: 'D1', signalType: 'shuntSig', variant: 'b', plate: 'D₁', desc: 'D₁ 单置调车信号机' },
    D3: { key: 'D3', signalType: 'shuntSig', variant: 'b', plate: 'D₃', desc: 'D₃ 差置调车信号机' },
    D5: { key: 'D5', signalType: 'shuntSig', variant: 'b', plate: 'D₅', desc: 'D₅ 单置调车信号机' },
    D7: { key: 'D7', signalType: 'shuntSig', variant: 'b', plate: 'D₇', desc: 'D₇ 差置调车信号机' },
    S3: { key: 'S3', signalType: 'depThree', variant: 'b', plate: 'S₃', desc: 'S₃ 矮型出站兼调车' },
    S1: { key: 'S1', signalType: 'depThree', variant: 'b', plate: 'S₁', desc: 'S₁ 矮型出站兼调车' },
    SII: { key: 'SII', signalType: 'depThree', variant: 'a', plate: 'SⅡ', desc: 'SⅡ 高柱正线出站兼调车' },
    S4: { key: 'S4', signalType: 'depThree', variant: 'b', plate: 'S₄', desc: 'S₄ 矮型出站兼调车' }
  };

  const STATION_RELAY_DEFS = {
    LAJ: { key: 'LAJ', code: 'LAJ', name: '按钮继电器', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 平时11-13闭合' },
    LJJ: { key: 'LJJ', code: 'LJJ/LFJ/DFJ', name: '方向电源继电器', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 平时11-13闭合' },
    LFJ: { key: 'LFJ', code: 'LFJ', name: '列车发车方向继电器', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 平时11-13闭合' },
    DFJ: { key: 'DFJ', code: 'DFJ', name: '调车方向继电器', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 平时11-13闭合' },
    FKJ: { key: 'FKJ', code: 'FKJ', name: '辅助开始继电器', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 平时11-13闭合' },
    KJ: { key: 'KJ', code: 'KJ', name: '7线开始继电器', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 平时11-13闭合' },
    XJJ: { key: 'XJJ', code: 'XJJ', name: '8线信号检查继电器', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: null, normal: '常态↓ · 平时11-13闭合' },
    QJJ: { key: 'QJJ', code: 'QJJ', name: '9线区段检查继电器', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 平时11-13闭合' },
    DCJ: { key: 'DCJ', code: 'DCJ/FCJ', name: '道岔操纵继电器', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'turnoutLab', normal: '常态↓ · 平时11-13闭合' },
    DQJ1: { key: 'DQJ1', code: '1DQJ', name: '一启动继电器(缓放)', hwModel: 'JWJXC-H125/0.44', benchType: 'heavySlow', topicType: 'turnoutLab', normal: '常态↓ · 平时11-13闭合' },
    DQJ2: { key: 'DQJ2', code: '2DQJ', name: '二启动继电器(有极)', hwModel: 'JYJXC-220/220', benchType: 'latching', topicType: 'turnoutLab', normal: '常态定位 · 111-112闭合' },
    DBJ: { key: 'DBJ', code: 'DBJ', name: '定位表示继电器(偏极)', hwModel: 'JPXC-1000', benchType: 'biased', topicType: 'turnoutLab', normal: '常态↑ · 平时11-12闭合' },
    FBJ: { key: 'FBJ', code: 'FBJ', name: '反位表示继电器(偏极)', hwModel: 'JPXC-1000', benchType: 'biased', topicType: 'turnoutLab', normal: '常态↓ · 平时11-13闭合' },
    DJ: { key: 'DJ', code: 'DJ', name: '红灯丝监督继电器', hwModel: 'JZXC-H62', benchType: 'filament', topicType: null, normal: '常态↑ · 平时11-12闭合' },
    LXJ: { key: 'LXJ', code: 'LXJ/DXJ', name: '11线信号/调车信号继电器', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 平时11-13闭合' },
    ZJ: { key: 'ZJ', code: 'ZJ', name: '终端继电器(调车保留B灯)', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 平时11-13闭合' },
    SJ: { key: 'SJ', code: 'SJ', name: '道岔锁闭继电器', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'timeRelay', normal: '常态↑ · 平时11-12闭合' },
    DGJ: { key: 'DGJ', code: '11DGJ', name: '轨道继电器', hwModel: 'JZXC-480', benchType: 'rectifier', topicType: null, normal: '常态↑ · 平时11-12闭合' },
    FDGJ: { key: 'FDGJ', code: 'FDGJ', name: '反位轨道复示(3s缓放)', hwModel: 'JWXC-H340 + RC', benchType: 'slowRelease', topicType: null, normal: '常态↓ · 平时11-13闭合' },
    LJ1: { key: 'LJ1', code: '1LJ', name: '12线进路锁闭继电器', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: null, normal: '常态↑ · 平时11-12闭合' },
    LJ2: { key: 'LJ2', code: '2LJ', name: '13线进路锁闭继电器', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: null, normal: '常态↑ · 平时11-12闭合' },
    CJ: { key: 'CJ', code: 'CJ', name: '传递继电器(快吸慢放)', hwModel: 'JWXC-H340', benchType: 'slowRelease', topicType: null, normal: '常态↑ · 平时11-12闭合' },
    ZCJ: { key: 'ZCJ', code: 'ZCJ', name: '迎面敌对照查继电器(图8.3.2)', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↑ · 末端锁闭即↓防迎面' },
    YXJ: { key: 'YXJ', code: 'YXJ', name: '引导信号继电器(第3.3.4/5.1.2节)', hwModel: 'JWXC-1700', benchType: 'neutral', topicType: 'selfHold', normal: '常态↓ · 开放红+月白HB ≤20km/h' }
  };

  function setupEvents() {
    $('contact-focus').onclick = () => focusContacts(!contactFocus);
    $('train-focus').onclick = () => { trainFocused = !trainFocused; sceneDirty = true; labelsDirty = true; if (trainFocused) focusTrain(); else { preset('iso'); render(); } renderStudy(); };
    $('comparison-pair').onchange = e => {
      const nextKey = e.target.value;
      if (nextKey && !comparisonKey) typeBeforeComparison = s.type;
      comparisonKey = nextKey;
      contactFocus = false; contactStep = null; comparisonTiming = null; comparisonLatched = false; pose = branchPose = 0;
      const type = comparisonKey ? COMPARISONS[comparisonKey][0] : (typeBeforeComparison || s.type);
      if (!comparisonKey) typeBeforeComparison = null;
      set({ mode: 'bench', type, polarity: 0, latched: false, explode: 0 }, true);
    };
    document.querySelectorAll('[data-contact-pose]').forEach(b => { b.onclick = () => {
      contactStep = Number(b.dataset.contactPose); pose = contactStep;
      document.querySelectorAll('[data-contact-pose]').forEach(x => x.classList.toggle('active', x === b));
      $('contact-step-note').textContent = '机构逐步观察已暂停。线圈与机构位置分别显示，可恢复随供电动作。';
      renderStatus(); renderCircuit();
    }; });
    $('contact-live').onclick = () => { contactStep = null; $('contact-step-note').textContent = '随当前供电与缓放时序联动'; renderStatus(); };
    $('comparison-readout').onclick = e => {
      const contact = e.target.closest('[data-contact-part]');
      if (contact) { selectedPart = contact.dataset.contactPart; selectedSourceType = contact.closest('[data-source-type]').dataset.sourceType; renderPart(); }
    };
    $('part-source-open').onclick = () => {
      const binding = s.mode === 'signal'
        ? S.signalPartBinding(s.signalType, selectedPart)
        : S.partBinding(selectedSourceType || s.type, selectedPart);
      if (binding) openPage(binding.page);
    };
    $('station-direction').onchange = e => {
      if (trainMotion.speed > .05) { set({ trainBrake: true }); e.target.value = s.stationDirection; toast('先施加制动停车，再切换运行方向'); return; }
      set({ stationDirection: Number(e.target.value), trainBrake: false });
    };
    for (const [id, key] of [['pantograph','pantograph'],['catenary-power','catenaryPower'],['main-breaker','mainBreaker'],['train-brake','trainBrake']]) {
      $(id).onchange = e => { set({ [key]: e.target.checked }); logControl(`${key === 'pantograph' ? '受电弓' : key === 'catenaryPower' ? '接触网供电' : key === 'mainBreaker' ? '主断路器' : '制动'}${e.target.checked ? '接通/施加' : '断开/解除'}`); };
    }
    $('export-journey').onclick = () => {
      if (!s.stationHistory) return;
      downloadData(JSON.stringify({ schema: 'railway-journey-1', boundary: '单车教学运行，牵引制动采用示意参数', history: s.stationHistory }, null, 2), '铁路运行记录.json', 'application/json');
    };
    $('timeline').onclick = e => { const b = e.target.closest('[data-history-page]'); if (b) openPage(Number(b.dataset.historyPage)); };
    $('relay-list').innerHTML = Object.entries(catalog).map(([key, c]) => `<button data-type="${key}" class="relay-item" aria-pressed="false"><span class="relay-symbol" aria-hidden="true">${c.symbol}</span><span><strong>${c.name}</strong><small>${c.en}</small></span></button>`).join('');
    $('relay-list').addEventListener('click', e => { const b = e.target.closest('[data-type]'); if (b) chooseType(b.dataset.type); });
    $('signal-list').innerHTML = Object.entries(SIGNAL_CATALOG).map(([key, c]) => `<button data-sig-type="${key}" class="relay-item" aria-pressed="false"><span class="relay-symbol" aria-hidden="true">${c.symbol}</span><span><strong>${c.name}</strong><small>${c.en}</small></span></button>`).join('');
    $('signal-list').addEventListener('click', e => { const b = e.target.closest('[data-sig-type]'); if (b) chooseSignal(b.dataset.sigType); });
    $('curriculum-tab').onclick = () => { playing = false; set({ mode: 'curriculum' }, false); };
    $('bench-tab').onclick = () => { playing = false; set({ mode: 'bench', explode: 0 }, true); };
    $('signal-tab').onclick = () => { playing = false; set({ mode: 'signal', explode: 0 }, true); };
    $('track-tab').onclick = () => { playing = false; elapsed = 0; timeline.length = 0; lastRecordKey = ''; set({ mode: 'track', type: ['rectifier', 'phase'].includes(s.type) ? s.type : 'rectifier', front: -20, explode: 0 }, true); };
    $('station-tab').onclick = () => { playing = false; elapsed = 0; timeline.length = 0; lastRecordKey = ''; set({ mode: 'station', stationStage: 5, stationTrain: -26, stationHistory: null, stationDirection: 1, cancelMode: 'none', zraProgress: 0, explode: 0 }, true); };
    $('cbi-tab').onclick = () => { playing = false; set({ mode: 'cbi' }, false); };
    if ($('figures-tab')) $('figures-tab').onclick = () => { playing = false; set({ mode: 'figures', figRouteIdx: null, figChapter: null }, false); };
    $('signal-variants').addEventListener('click', e => { const b = e.target.closest('[data-sig-var]'); if (b) set({ signalVariant: b.dataset.sigVar }, true); });
    $('signal-aspects').addEventListener('click', e => { const b = e.target.closest('[data-sig-asp]'); if (b) set({ signalAspect: b.dataset.sigAsp }); });
    $('signal-filament').onchange = e => set({ signalFilament: e.target.value });
    $('signal-ind').onchange = e => set({ signalIndicator: e.target.checked ? 'right' : 'none' });
    if ($('signal-dj2')) $('signal-dj2').onchange = e => set({ signalSecondFilamentFault: e.target.checked });
    document.querySelectorAll('[data-polarity]').forEach(b => { b.onclick = () => set({ polarity: Number(b.dataset.polarity) }); });
    document.querySelectorAll('[data-ac]').forEach(b => { b.onclick = () => set({ polarity: Number(b.dataset.ac) }); });
    $('filament-sys').onchange = e => set({ filamentSignalSystem: e.target.value, polarity: e.target.value === 'outDep' && s.polarity === 0 ? 1 : s.polarity });
    $('filament-mode').onchange = e => set({ filamentMode: e.target.value });
    $('filament-out-aspect').onchange = e => set({ filamentOutAspect: e.target.value, polarity: s.polarity === 0 ? 1 : s.polarity });

    // 专题 A：自闭电路与 5 法断线/混线防护控制
    $('sh-press-a').onclick = () => { playing = false; set({ shButton: true, shFujPicked: false, shCrossFault: 'none' }); };
    $('sh-release-a').onclick = () => { playing = false; set({ shButton: false }); };
    $('sh-play-demo').onclick = () => {
      if (playing) { playing = false; render(); return; }
      shAutoStep = 0; stationAutoTimer = 0; playing = true;
      set({ shButton: false, shLatched: false, shFujPicked: false, shWireBreak: false, shCrossFault: 'none' });
    };
    $('sh-fuj').onchange = e => { playing = false; set({ shFujPicked: e.target.checked }); };
    $('sh-wire-break').onchange = e => { playing = false; set({ shWireBreak: e.target.checked }); };
    $('sh-cross-method').onchange = e => { playing = false; set({ shCrossMethod: e.target.value, shLatched: false, shButton: false }); };
    $('sh-cross-fault').onchange = e => { playing = false; set({ shCrossFault: e.target.value, shButton: false, shLatched: false }); };
    $('sh-shunt-break').onchange = e => { playing = false; set({ shShuntLineBreak: e.target.checked }); };

    // 专题 B：四线制道岔控制
    document.querySelectorAll('[data-to-stage]').forEach(b => {
      b.onclick = () => { playing = false; set({ toStage: Number(b.dataset.toStage) }); };
    });
    $('play-turnout').onclick = () => {
      if (!playing && s.toStage >= 4) { stationAutoTimer = 0; set({ toStage: 0 }); }
      playing = !playing; render();
    };
    $('to-obstacle').onchange = e => {
      playing = false;
      set({ toObstacle: e.target.checked, toStage: e.target.checked ? 3 : s.toStage });
    };
    $('to-lid-open').onchange = e => { playing = false; set({ toLidOpen: e.target.checked }); };
    if ($('to-sj-locked')) $('to-sj-locked').onchange = e => { playing = false; set({ toSjLocked: e.target.checked }); };
    if ($('to-ind-fault')) $('to-ind-fault').onchange = e => { playing = false; set({ toIndFault: e.target.value }); };

    // 专题 D：五线制三相道岔控制
    document.querySelectorAll('[data-fw-stage]').forEach(b => {
      b.onclick = () => { playing = false; set({ fwStage: Number(b.dataset.fwStage) }); };
    });
    $('play-fivewire').onclick = () => {
      if (!playing && s.fwStage >= 4) { stationAutoTimer = 0; set({ fwStage: 0 }); }
      playing = !playing; render();
    };
    $('fw-phase-loss').onchange = e => { playing = false; set({ fwPhaseLoss: e.target.checked }); };
    $('fw-lid-open').onchange = e => { playing = false; set({ fwLidOpen: e.target.checked }); };

    // 专题 E：计算机联锁安全 I/O
    $('cbi-io-mode').onchange = e => { playing = false; set({ cbiMode: e.target.value }); };
    $('cbi-io-cmd').onchange = e => { playing = false; set({ cbiCmd: e.target.checked }); };
    $('cbi-io-fault').onchange = e => { playing = false; set({ cbiFault: e.target.value }); };

    // 专题 C：车站沙盘全作业 + 表3.2.2 全 33 条进路 + ZQA / ZRA / SGA + 网路透视 + 盲测排故
    if ($('station-route-322') && J && J.ROUTES_3_2_2) {
      const grpLabels = {
        x_rec: '① X 正向接车进路 (第 1–4 条)',
        x_dep: '② 正向发车进路 + 右表示器 (第 5–8 条)',
        xf_rec: '③ XF 反方向接车进路 (第 9–12 条)',
        xf_dep: '④ 向 XF 反方向发车 (第 13–16 条)',
        shunt: '⑤ 下行咽喉全部调车进路 (第 17–33 条)'
      };
      const routeOptsHtml = Object.keys(grpLabels).map(gk => {
        const items = J.ROUTES_3_2_2.filter(r => r.group === gk);
        return `<optgroup label="${grpLabels[gk]}">${items.map(r => `<option value="${r.code}">第${String(r.num).padStart(2, '0')}条 · ${r.title} [${r.switchesRaw}]</option>`).join('')}</optgroup>`;
      }).join('');
      $('station-route-322').innerHTML = routeOptsHtml;
      if ($('station-route-b')) $('station-route-b').innerHTML = routeOptsHtml;
      $('station-route-322').onchange = e => {
        playing = false;
        set({ stationRoute: e.target.value, stationStage: 5, stationTrain: -26, stationHistory: null, stationDirection: 1, cancelMode: 'none', zraProgress: 0, blindFault: 'none', lampFault: false, switchFault: false, poorShunt: false, signalFaultLocked: false, guideMode: false });
      };
      if ($('station-multitrain-mode')) {
        const selectMtMode = modeVal => {
          playing = false;
          const sc = (L.MULTI_TRAIN_SCENARIOS && L.MULTI_TRAIN_SCENARIOS[modeVal]) || { routeA: null, routeB: 'R14', initTrainA: -26, initTrainB: -26 };
          const patch = {
            multiTrainMode: modeVal,
            stationStage: 5,
            stationTrain: sc.initTrainA ?? -26,
            secondRoute: sc.routeB || s.secondRoute || 'R14',
            secondTrain: sc.initTrainB ?? -26,
            stationHistory: null,
            stationDirection: 1,
            cancelMode: 'none',
            zraProgress: 0,
            blindFault: 'none',
            lampFault: false,
            switchFault: false,
            poorShunt: false,
            signalFaultLocked: false,
            guideMode: false
          };
          if (sc.routeA) patch.stationRoute = sc.routeA;
          set(patch);
        };
        $('station-multitrain-mode').onchange = e => selectMtMode(e.target.value);
        document.querySelectorAll('#station-mt-pills [data-mt]').forEach(b => {
          b.onclick = () => selectMtMode(b.dataset.mt);
        });
      }
      if ($('station-speed')) {
        $('station-speed').onchange = e => { stationSpeedScale = Number(e.target.value) || 0.35; render(); };
      }
      if ($('station-pause-change')) {
        $('station-pause-change').onchange = e => { pauseOnRelayChange = e.target.checked; if (!pauseOnRelayChange) relayPauseTimer = 0; renderRelayChangeBanner(); };
      }
      if ($('btn-next-relay')) {
        $('btn-next-relay').onclick = () => stepToNextRelayChange();
      }
      if ($('station-route-b')) {
        $('station-route-b').onchange = e => {
          playing = false;
          set({ multiTrainMode: s.multiTrainMode === 'none' ? 'custom' : s.multiTrainMode, secondRoute: e.target.value, secondTrain: -26, signalFaultLocked: false });
        };
      }
      if ($('station-train-b')) {
        $('station-train-b').oninput = e => {
          playing = false; trainMotionB.speed = 0;
          let val = Number(e.target.value);
          const mtNow = result.station && result.station.multiTrain;
          if (mtNow && mtNow.mode === 'conflict_queue' && mtNow.bWaitingForA && val > -12) {
            val = -12;
            $('station-train-b').value = String(val);
            toast('🔒 抵触排队等待中：一号车尚未解锁 7-11DG/道岔 5/7，D₅ 为蓝灯 A，二号车保持在信号机前 (-12) 候车！');
          } else if (mtNow && mtNow.mode === 'conflict_queue' && typeof mtNow.maxFollowB === 'number' && val > mtNow.maxFollowB) {
            val = mtNow.maxFollowB;
            $('station-train-b').value = String(val);
          }
          set({ secondTrain: val });
        };
      }
    }
    document.querySelectorAll('[data-route]').forEach(b => { b.onclick = () => { playing = false; set({ stationRoute: b.dataset.route, stationStage: 5, stationTrain: -26, stationHistory: null, stationDirection: 1, cancelMode: 'none', zraProgress: 0, blindFault: 'none', lampFault: false, switchFault: false, poorShunt: false, signalFaultLocked: false, guideMode: false }); }; });
    document.querySelectorAll('[data-stage]').forEach(b => {
      b.onclick = () => {
        playing = false;
        const stg = Number(b.dataset.stage);
        set({ stationStage: stg, stationTrain: stg < 5 ? -26 : s.stationTrain, cancelMode: 'none', zraProgress: 0, guideMode: stg < 4 ? false : s.guideMode });
      };
    });
    $('btn-zqa').onclick = () => {
      playing = false;
      set({ stationStage: 5, cancelMode: s.cancelMode === 'zqa' ? 'none' : 'zqa', zraProgress: 0 });
      logControl('操作总取消ZQA', 200);
      toast(result.station.zqaUnlocked ? '信号已关闭，预先锁闭进路经完整空闲检查后取消' : '总取消未满足解锁条件，进路继续锁闭');
    };
    $('btn-zra').onclick = () => {
      playing = false;
      const nextMode = s.cancelMode === 'zra' ? 'none' : 'zra';
      set({ stationStage: 5, cancelMode: nextMode, zraProgress: 0 });
      logControl(nextMode === 'zra' ? '办理总人工解锁ZRA' : '撤销本次ZRA请求', 200);
      if (nextMode === 'zra') toast(result.station.zraBlocked ? '进路检查未通过，计时中止。恢复条件后重新办理 ZRA' : '信号已关闭，持续检查进路完整、空闲后按教材规定延时解锁');
    };
    $('btn-sga').onclick = () => {
      playing = false;
      const nextMode = s.cancelMode === 'sga' ? 'none' : 'sga';
      set({ stationStage: 5, cancelMode: nextMode, zraProgress: 0 });
      logControl(nextMode === 'sga' ? '办理对应区段故障解锁SGA' : '撤销本次SGA请求', 211);
      if (nextMode === 'sga') {
        const stNow = result.station;
        const finishBlindStuck = !!(stNow && stNow.sgaUnlocked && s.blindFault === 'stuckSection' && blindStuckConfirmed);
        if (finishBlindStuck) {
          blindStuckConfirmed = false;
          set({ blindFault: 'none', lampFault: false, switchFault: false, poorShunt: false, signalFaultLocked: false });
        }
        toast(stNow && stNow.sgaUnlocked
          ? (finishBlindStuck ? '已办理 SGA+ZRA（图9.6.1）：检 DGJF↑ 且 QJJ↓，遗留锁闭区段已安全解锁，盲测排故完成！' : '已办理 SGA+ZRA（图9.6.1）：检 DGJF↑ 且 QJJ↓，遗留锁闭区段已安全解锁！')
          : '⚠ SGA+ZRA 区故解被闭锁：本区段占用或操作前 QJJ↑，严禁解锁！');
      }
    };
    $('btn-reopen').onclick = () => {
      playing = false;
      if (s.lampFault || s.switchFault || s.blindFault === 'lamp' || s.blindFault === 'switch') {
        toast('故障尚未排除（DJ↓ 或道岔失表示），严禁开放信号！请先取消故障或办理解锁/引导接车。');
        return;
      }
      const h = s.stationHistory;
      if (s.stationStage < 4 || s.stationTrain >= 0 || (h && (h.reverse || J.layout(h.route).filter(d => d.controlled).some(d => h.sections[d.id].released)))) {
        toast('进路尚未锁闭、已解锁或已有列车通过，请重新排列进路'); return;
      }
      set({ stationStage: 5, cancelMode: 'none', zraProgress: 0, signalFaultLocked: false, guideMode: false });
      toast(result.station.relays.LXJ ? '锁闭与检查条件成立，已重新开放信号' : '开放检查未通过，信号保持关闭');
    };
    if ($('btn-guide')) $('btn-guide').onclick = () => {
      playing = false;
      const rt = J.resolveRoute(s.stationRoute);
      if (rt.kind !== 'receive') { toast('仅接车进路 (X / X_F) 可办理引导接车 HB！'); return; }
      if (s.guideMode && result.station && result.station.relays.YXJ) {
        set({ guideMode: false, guideHoldElapsed: 0 });
        logControl('人工关闭引导信号 HB（进路保持引导锁闭直至 ZRA）', 49);
        toast('已人工关闭引导信号 HB；引导进路仍保持锁闭（PDF p.49），须办理总人工解锁 (ZRA) 解锁！');
        return;
      }
      const probe = L.evaluate(L.update(s, { stationStage: 5, cancelMode: 'none', guideMode: true, guideHoldElapsed: 0, zraProgress: 0 })).station;
      if (!probe.guideConditionsMet || !probe.relays.YXJ) {
        const why = (probe.guideBlockReasons && probe.guideBlockReasons.length)
          ? probe.guideBlockReasons.join('；')
          : '不满足引导信号开放条件（检查列车位置/主体红灯/敌对进路/锁闭）';
        logControl('尝试办理引导信号被拒：' + why, 49);
        toast('❌ 严禁开放引导信号 HB：' + why);
        return;
      }
      set({ stationStage: 5, cancelMode: 'none', guideMode: true, guideHoldElapsed: 0, zraProgress: 0 });
      logControl(`办理引导接车 YXJ↑ (HB${probe.guideTotalLockActive ? ' · 咽喉引导总锁闭' : ''}${probe.guideFirstSecFault ? ' · 首区段故障15s维持' : ''})`, 49);
      toast(probe.guideFirstSecFault
        ? '🚨 引导接车 HB 已开放（首区段故障 15 s 维持模式）：须在 15 s 内维持开放，过车后保持锁闭须办 ZRA！'
        : `🚨 引导接车 YXJ↑：${rt.sig} 点亮红+月白(HB ≤20km/h)；第一轮对压入首区段关信号，过车后保持锁闭须办 ZRA！`);
    };
    if ($('guide-manual-confirm')) $('guide-manual-confirm').onchange = e => {
      set({ guideManualConfirm: e.target.checked });
      if (e.target.checked) toast('✓ 已记录人工确认引导进路道岔位置正确；道岔失表示时还须办理【咽喉引导总锁闭 (YZA)】');
    };
    if ($('btn-guide-totallock')) $('btn-guide-totallock').onclick = () => {
      playing = false;
      const nextLock = !s.guideTotalLock;
      set({ guideTotalLock: nextLock });
      logControl(nextLock ? '办理咽喉引导总锁闭 YZA' : '解除咽喉引导总锁闭', 49);
      toast(nextLock ? '🔒 已办理咽喉引导总锁闭 (YZA)：全咽喉道岔全部锁闭，确认道岔位置与主体红灯后可按【引导接车 HB】！' : '已解除咽喉引导总锁闭（若引导信号已开放将立即关闭）。');
    };
    if ($('guide-firstsec-fault')) $('guide-firstsec-fault').onchange = e => {
      set({ guideFirstSecFault: e.target.checked, guideHoldElapsed: 0 });
    };
    if ($('btn-guide-hold')) $('btn-guide-hold').onclick = () => {
      set({ guideHoldElapsed: 0 });
      logControl('执行首区段故障 15s 维持引导开放操作', 49);
      toast('⏱ 已执行维持引导开放操作，15 s 维持计时重置！');
    };
    if ($('hostile-route-fault')) $('hostile-route-fault').onchange = e => {
      set({ hostileRoute: e.target.checked });
    };
    $('station-net-view').onchange = e => set({ stationNetView: e.target.value });
    $('btn-blind-fault').onclick = () => {
      playing = false;
      const pool = ['lamp', 'switch', 'poorShunt', 'stuckSection'].filter(x => x !== s.blindFault);
      const picked = pool[Math.floor(Math.random() * pool.length)];
      $('blind-guess').value = '';
      if (picked === 'lamp') applyScene({ mode: 'station', blindFault: 'lamp', stationRoute: 'IG', stationStage: 5, stationTrain: -26, lampFault: false, switchFault: false, poorShunt: false, cancelMode: 'none' });
      else if (picked === 'switch') applyScene({ mode: 'station', blindFault: 'switch', stationRoute: 'IG', stationStage: 5, stationTrain: -26, lampFault: false, switchFault: false, poorShunt: false, cancelMode: 'none' });
      else if (picked === 'poorShunt') applyScene({ mode: 'station', blindFault: 'poorShunt', stationRoute: 'IG', stationStage: 5, stationTrain: 70, lampFault: false, switchFault: false, poorShunt: false, cancelMode: 'none' });
      else applyScene({ mode: 'station', blindFault: 'stuckSection', stationRoute: 'IG', stationStage: 5, stationTrain: 115, lampFault: false, switchFault: false, poorShunt: false, cancelMode: 'none' });
      toast('🩺 已随机注入 1 项盲测故障，请通过继电器与站场光带判断原因！');
    };
    $('blind-submit').onclick = () => {
      const gVal = $('blind-guess').value;
      if (!gVal) { toast('请先选择一个诊断结论再提交！'); return; }
      if (gVal === s.blindFault) {
        const solved = s.blindFault;
        const alreadySga = solved === 'stuckSection' && result.station && result.station.sgaUnlocked;
        blindStuckConfirmed = solved === 'stuckSection' && !alreadySga;
        set({ blindFault: solved === 'stuckSection' && !alreadySga ? solved : 'none', lampFault: false, switchFault: false, poorShunt: false, signalFaultLocked: false });
        toast(solved === 'stuckSection'
          ? (alreadySga ? '🎉 诊断完全正确，且遗留锁闭区段已通过 SGA+ZRA 安全解锁！' : '🎉 诊断完全正确！这是遗留白光带卡锁，请点击下方【区故解 SGA+ZRA】解锁！')
          : '🎉 诊断完全正确！继电器链推导无误，系统已恢复正常状态。');
      } else {
        toast('⚠ 诊断还不准确：提示可检查 DJ、DBJ/FBJ、FDGJ 缓放与 DGJ↑/SJ↓ 的组合关系！');
      }
    };
    $('blind-clear').onclick = () => { blindStuckConfirmed = false; set({ blindFault: 'none', lampFault: false, switchFault: false, poorShunt: false, signalFaultLocked: false, cancelMode: 'none' }); };

    for (const [id, key] of [['labels', 'labels'], ['field', 'field'], ['cover', 'cover'], ['slow', 'slow'], ['power', 'power'], ['rail-break', 'railBreak'], ['receiver-break', 'receiverBreak'], ['multi', 'multi'], ['branch-occupied', 'branchOccupied'], ['local-power', 'localPower'], ['lamp-fault', 'lampFault'], ['switch-fault', 'switchFault'], ['poor-shunt', 'poorShunt']]) {
      $(id).onchange = e => set({ [key]: e.target.checked }, id === 'multi');
    }
    $('frequency').onchange = e => set({ frequency: e.target.value }); $('phase').onchange = e => set({ phase: e.target.value });
    $('explode').oninput = e => set({ explode: Number(e.target.value) });
    $('train-position').oninput = e => { playing = false; set({ front: Number(e.target.value) }); };
    $('play-train').onclick = () => { if (s.front >= 165) { elapsed = 0; timeline.length = 0; lastRecordKey = ''; set({ front: -20 }); } playing = !playing; updateTrainLabel(); };
    $('reset-train').onclick = () => { playing = false; elapsed = 0; timeline.length = 0; lastRecordKey = ''; set({ front: -20 }); };
    $('station-train').oninput = e => {
      playing = false; trainMotion.speed = 0;
      let val = Number(e.target.value);
      const stNow = result.station;
      if (stNow && stNow.trackOccupiedByB && !s.guideMode && s.stationTrain < 0 && val >= 0) {
        val = -2;
        $('station-train').value = String(val);
        toast('🛑 股道 IG 已停有二号车 B，进站信号机 X 为红灯 H 禁止越过！请先点击【引导接车 HB】或切换调车连挂(D₇→IG / D₅→IG)');
      }
      set({ stationStage: 5, stationTrain: val });
    };
    $('play-station').onclick = () => {
      const mt = result.station && result.station.multiTrain;
      const { maxPosA: maxA, maxPosB: maxB } = computeStationMaxPos(result.station);
      const bEnded = !mt || !mt.active || mt.mode === 'track_occupied' || (mt.trainB ?? -26) >= maxB - 1;
      if (!playing && s.stationDirection !== -1 && (s.stationStage === 5 && s.stationTrain >= maxA - 1 && bEnded)) {
        elapsed = 0; timeline.length = 0; lastRecordKey = ''; stationAutoTimer = 0;
        const sc = (L.MULTI_TRAIN_SCENARIOS && L.MULTI_TRAIN_SCENARIOS[s.multiTrainMode]) || {};
        set({ stationStage: 0, stationTrain: -26, secondTrain: sc.initTrainB ?? (s.multiTrainMode === 'track_occupied' ? 126 : -26), stationHistory: null, stationDirection: 1, cancelMode: 'none', zraProgress: 0, signalFaultLocked: false, guideMode: false, guideManualConfirm: false, guideTotalLock: false, guideFirstSecFault: false, guideHoldElapsed: 0, hostileRoute: false });
      }
      playing = !playing; logControl(playing ? '继续列车运行仿真' : '暂停列车位置，继电器缓放继续计时'); updateTrainLabel();
    };
    $('reset-station').onclick = () => {
      playing = false; elapsed = 0; timeline.length = 0; lastRecordKey = ''; stationAutoTimer = 0; trainMotion = { speed: 0 }; trainMotionB = { speed: 0 };
      const sc = (L.MULTI_TRAIN_SCENARIOS && L.MULTI_TRAIN_SCENARIOS[s.multiTrainMode]) || {};
      set({ stationStage: 5, stationTrain: -26, secondTrain: sc.initTrainB ?? (s.multiTrainMode === 'track_occupied' ? 126 : -26), stationHistory: null, stationDirection: 1, cancelMode: 'none', zraProgress: 0, signalFaultLocked: false, guideMode: false, guideManualConfirm: false, guideTotalLock: false, guideFirstSecFault: false, guideHoldElapsed: 0, hostileRoute: false });
    };

    // 组合架点击微距跳转浮窗与原理图矩阵点击
    $('pip-close').onclick = () => hidePipBanner();
    $('pip-jump-relay').onclick = () => {
      if (!activePipDef) return;
      if (activePipDef.stationSignal) {
        const sigObj = activePipDef.stationSignal;
        const asp = result.station && result.station.signals ? result.station.signals[sigObj.key] : null;
        const sigAsp = asp && asp !== 'DARK' && L.SIGNAL_ASPECTS[sigObj.signalType] && L.SIGNAL_ASPECTS[sigObj.signalType][asp] ? asp : undefined;
        hidePipBanner();
        chooseSignal(sigObj.signalType, sigObj.variant);
        if (sigAsp) set({ signalAspect: sigAsp });
        toast(`已进入【${SIGNAL_CATALOG[sigObj.signalType].name} · ${sigObj.plate}】第 2.3 节 3D 拆解实验台。`);
        return;
      }
      const targetType = activePipDef.benchType || 'neutral';
      const hwModel = activePipDef.hwModel;
      hidePipBanner();
      chooseType(targetType);
      toast(`已跳转至【${catalog[targetType].name} (${hwModel})】，可拖动“拆解”滑块微距观察内部结构。`);
    };
    $('pip-jump-topic').onclick = () => {
      if (!activePipDef || !activePipDef.topicType) return;
      const targetTopic = activePipDef.topicType;
      hidePipBanner();
      chooseType(targetTopic);
      toast(`已进入【${catalog[targetTopic].name}】3D 专题电路实验台。`);
    };
    $('circuit').addEventListener('click', e => {
      const contact = e.target.closest('[data-contact-part]');
      if (contact && s.mode === 'bench') {
        selectedPart = contact.dataset.contactPart; selectedSourceType = s.type;
        renderPart(); if (!comparisonKey) focusContacts(true); renderCircuit(); return;
      }
      const sigEl = e.target.closest('[data-signal-key]');
      if (sigEl && STATION_SIGNAL_META[sigEl.dataset.signalKey]) {
        showPipBanner({ stationSignal: STATION_SIGNAL_META[sigEl.dataset.signalKey] });
        return;
      }
      const sigPart = e.target.closest('[data-sig-part]');
      if (sigPart && s.mode === 'signal') {
        selectedPart = sigPart.dataset.sigPart; selectedSourceType = s.signalType;
        renderPart(); renderCircuit(); return;
      }
      const box = e.target.closest('[data-relay-key]');
      if (box && STATION_RELAY_DEFS[box.dataset.relayKey]) {
        showPipBanner(STATION_RELAY_DEFS[box.dataset.relayKey]);
      }
    });

    // 期末核心考点与排故闯关导航
    $('quiz-prev').onclick = () => {
      currentQuizIndex = (currentQuizIndex - 1 + EXAM_BANK.length) % EXAM_BANK.length;
      $('challenge-explanation').hidden = true; $('challenge-answer').textContent = '查看教材解析 →';
      renderQuiz();
    };
    $('quiz-next').onclick = () => {
      currentQuizIndex = (currentQuizIndex + 1) % EXAM_BANK.length;
      $('challenge-explanation').hidden = true; $('challenge-answer').textContent = '查看教材解析 →';
      renderQuiz();
    };
    $('quiz-load-scene').onclick = () => {
      playing = false;
      const q = EXAM_BANK[currentQuizIndex];
      const needRebuild = q.load.mode !== s.mode || (q.load.type && q.load.type !== s.type);
      applyScene(q.load);
      toast(`已载入【${q.title.split('｜')[0]}】对应的 3D 实验场景！`);
    };

    $('part-list').onclick = e => { const b = e.target.closest('[data-part]'); if (b) { selectedPart = b.dataset.part; selectedSourceType = s.type; renderPart(); if (s.mode === 'bench' && ['front', 'back', 'common'].includes(selectedPart) && !comparisonKey) focusContacts(true); } };
    $('figure-tabs').onclick = e => { const b = e.target.closest('[data-figure]'); if (b) { currentFigure = b.dataset.figure; renderSource(); } };
    $('open-source-page').onclick = $('figure-image-button').onclick = () => openPage(S.figures[currentFigure].page);
    $('open-spec-table').onclick = () => openPage(s.mode === 'signal' ? 26 : 60);
    if ($('orig-prev')) $('orig-prev').onclick = () => openPage(currentModalPage - 1);
    if ($('orig-next')) $('orig-next').onclick = () => openPage(currentModalPage + 1);
    if ($('orig-go')) $('orig-go').onclick = () => openPage(Number($('orig-input').value));
    if ($('orig-input')) $('orig-input').addEventListener('keydown', e => { if (e.key === 'Enter') openPage(Number($('orig-input').value)); });
    $('challenge-answer').onclick = () => { const open = $('challenge-explanation').hidden; $('challenge-explanation').hidden = !open; $('challenge-answer').textContent = open ? '收起解析 ↑' : '查看教材解析 →'; };
    for (const [b, d] of [['help-button', 'help-dialog'], ['source-button', 'source-dialog']]) $(b).onclick = () => $(d).showModal();
    document.querySelectorAll('.dialog-close').forEach(b => b.onclick = () => b.closest('dialog').close());
    document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) { const r = d.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close(); } }));
    document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { trainFocused = false; renderStudy(); preset(b.dataset.view); });
    $('home-view').onclick = () => { trainFocused = false; renderStudy(); preset('iso'); };
    $('export-model').onclick = () => {
      if (!model) return toast('三维引擎尚未就绪');
      try {
        const data = RelayModel.exportGLB(model.root), url = URL.createObjectURL(new Blob([data], { type: 'model/gltf-binary' }));
        const a = document.createElement('a'); a.href = url;
        a.download = s.mode === 'signal'
          ? `railway-signal-${s.signalType}-${result.signal.variant}-${result.signal.aspect}.glb`
          : `railway-${s.type}-${result.picked ? 'picked' : 'dropped'}.glb`;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
        toast('已导出当前机构姿态；教学尺寸，不含文字与交互程序。');
      } catch (e) { toast('模型导出失败：' + e.message); }
    };
  }
  function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').hidden = true, 4500); }
  function preset(view) {
    if (contactFocus && model && model.contactCenter) {
      [target.x, target.y, target.z] = model.contactCenter; yaw = view === 'side' ? .9 : .1; pitch = .14; distance = 3.3; panX = panY = 0; orbitDirty = true; return;
    }
    if (comparisonKey && s.mode === 'bench') {
      target.x = 0; target.y = 1.8; target.z = 0; yaw = .15; pitch = .30; distance = 17; panX = panY = 0; orbitDirty = true; return;
    }
    if (s.mode === 'signal') {
      const isDwarf = (model && model.variant === 'b') || s.signalVariant === 'b';
      target.x = 0; target.y = isDwarf ? 1.02 : 2.55; target.z = 0;
      if (view === 'front') { yaw = 0; pitch = .05; distance = isDwarf ? 6.2 : 11.0; }
      else if (view === 'side') { yaw = Math.PI / 2; pitch = .08; distance = isDwarf ? 6.6 : 11.4; }
      else { yaw = .44; pitch = .16; distance = isDwarf ? 6.6 : 11.4; }
    } else if (s.mode === 'station') {
      target.x = 0; target.y = 1.65; target.z = -.35;
      if (view === 'front') { yaw = 0; pitch = .16; distance = 35.0; }
      else if (view === 'side') { yaw = Math.PI / 2; pitch = .22; distance = 36.5; }
      else { yaw = .24; pitch = .38; distance = 35.8; }
    } else if (s.mode !== 'track' && ['selfHold', 'turnoutLab', 'fiveWireLab', 'cbiIoLab'].includes(s.type)) {
      target.x = 0; target.y = 1.45; target.z = 0;
      if (view === 'front') { yaw = 0; pitch = .12; distance = 13.8; }
      else if (view === 'side') { yaw = Math.PI / 2; pitch = .16; distance = 14.5; }
      else { yaw = .32; pitch = .38; distance = ['turnoutLab', 'fiveWireLab'].includes(s.type) ? 14.8 : 13.4; }
    } else if (s.mode !== 'track' && s.type === 'contacts' && view === 'iso') {
      target.x = .95; target.y = 3.05; target.z = .15;
      yaw = .42; pitch = .18; distance = 7.6;
    } else {
      target.x = 0; target.y = s.mode === 'track' ? 1.3 : 2.35; target.z = 0;
      if (view === 'front') { yaw = 0; pitch = .08; distance = 11.4; }
      else if (view === 'side') { yaw = Math.PI / 2; pitch = .12; distance = 12.2; }
      else { yaw = .55; pitch = .36; distance = s.mode === 'track' ? 17.6 : 13.0; }
    }
    panX = 0; panY = 0; orbitDirty = true; sceneDirty = true; labelsDirty = true;
    document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  }
  function rebuildScene() {
    if (model) { scene.remove(model.root); model.dispose(); }
    if (branchModel) { scene.remove(branchModel.root); branchModel.dispose(); branchModel = null; }
    if (track) { scene.remove(track.root); if (track.dispose) track.dispose(); track = null; }
    comparisonTiming = null; comparisonLatched = false; branchPose = 0;
    if (s.mode === 'signal') {
      model = RelayModel.createSignal(s.signalType, s.signalVariant);
      scene.add(model.root); model.setView(viewState());
    } else if (s.mode === 'station') {
      model = RelayModel.createStation();
      scene.add(model.root); model.setView(s);
    } else {
      model = RelayModel.createRelay(s.type, s.mode === 'track' ? (s.multi && s.type === 'rectifier' ? '主 DGJ' : '轨道继电器 GJ') : null);
      scene.add(model.root); model.setView(viewState());
      if (comparisonKey && s.mode === 'bench') {
        model.root.position.set(-2.8, 0, 0); model.root.scale.setScalar(.73);
        branchModel = RelayModel.createRelay(COMPARISONS[comparisonKey][1]);
        branchModel.root.position.set(2.8, 0, 0); branchModel.root.scale.setScalar(.73);
        scene.add(branchModel.root); branchModel.setView(s);
      }
      if (s.mode === 'track') {
        track = RelayModel.createTrack(); scene.add(track.root); model.root.position.set(1, .02, 1.2); model.root.scale.setScalar(.82);
        if (s.multi && s.type === 'rectifier') { branchModel = RelayModel.createRelay('rectifier', '支 DGJ₁'); branchModel.root.position.set(-4.2, .02, 1.5); branchModel.root.scale.setScalar(.52); scene.add(branchModel.root); branchModel.setView({ ...s, labels: false }); }
      }
    }
    buildLabels();
    preset('iso'); renderPart();
  }
  function buildLabels() {
    labelAnchors = []; $('label-texts').replaceChildren(); $('label-leaders').replaceChildren();
    for (const group of [model.root, ...(branchModel ? [branchModel.root] : [])]) group.traverse(anchor => {
      if (!anchor.userData.label) return;
      if (comparisonKey && !anchor.userData.label.includes('双线圈') && !anchor.userData.label.includes('永久磁铁') && !anchor.userData.label.includes('铜套')) return;
      const text = document.createElement('span'); text.className = 'model-label'; text.textContent = anchor.userData.label; $('label-texts').appendChild(text);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line'); $('label-leaders').appendChild(line);
      labelAnchors.push({ anchor, text, line, _bw: 0, _bh: 0 });
    });
    labelsDirty = true;
  }
  function updateLabels() {
    if (!labelsDirty && !orbitDirty && Math.abs(pose - (contactStep === null ? Number(relayTiming?.picked ?? 0) : contactStep)) < 1e-4) return;
    labelsDirty = false;
    const w = $('viewport').clientWidth, h = $('viewport').clientHeight, occupied = [];
    const sigKeep = s.mode === 'signal' && s.explode < 35 ? Math.min(92, w * .105) : 0;
    scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
    const visStates = labelAnchors.map(item => {
      let visible = true; for (let a = item.anchor; a; a = a.parent) if (!a.visible) visible = false;
      const p = item.anchor.getWorldPosition(new THREE.Vector3()).project(camera);
      visible = visible && !trainFocused && p.z > -1 && p.z < 1;
      item.text.hidden = !visible; item.line.toggleAttribute('hidden', !visible);
      return { item, visible, p };
    });
    const candidates = visStates.map(({ item, visible, p }) => {
      if (!visible) return null;
      if (!item._bw) { item._bw = item.text.offsetWidth; item._bh = item.text.offsetHeight; }
      const bw = item._bw || 40, bh = item._bh || 18;
      let lx = (p.x + 1) * w / 2;
      if (sigKeep > 0) {
        if (lx < w / 2) lx = Math.min(lx, w / 2 - sigKeep - bw / 2);
        else lx = Math.max(lx, w / 2 + sigKeep + bw / 2);
      }
      return {
        ...item, bw, bh,
        x: Math.max(8 + bw / 2, Math.min(w - 8 - bw / 2, lx)),
        y: Math.max(8 + bh / 2, Math.min(h - 8 - bh / 2, (1 - p.y) * h / 2))
      };
    }).filter(Boolean).sort((a, b) => a.y - b.y);
    for (const c of candidates) {
      for (let pass = 0; pass < 3; pass++) {
        for (const previous of occupied) {
          const ox = (c.bw + previous.bw) / 2 + 6 - Math.abs(c.x - previous.x);
          const oy = (c.bh + previous.bh) / 2 + 5 - Math.abs(c.y - previous.y);
          if (ox > 0 && oy > 0) {
            if (ox < oy * 1.15 && sigKeep === 0) {
              const dirX = c.x >= previous.x ? 1 : -1;
              c.x = Math.max(8 + c.bw / 2, Math.min(w - 8 - c.bw / 2, c.x + dirX * ox));
            } else {
              const downY = previous.y + (c.bh + previous.bh) / 2 + 5;
              const upY = previous.y - (c.bh + previous.bh) / 2 - 5;
              c.y = downY <= h - 8 - c.bh / 2 ? downY : Math.max(8 + c.bh / 2, upY);
            }
          }
        }
      }
      occupied.push(c); c.text.style.left = c.x + 'px'; c.text.style.top = c.y + 'px';
      const t = c.anchor.userData.labelTarget;
      if (t) {
        const p = c.anchor.parent.localToWorld(new THREE.Vector3(...t)).project(camera);
        c.line.style.display = ''; c.line.setAttribute('x1', (p.x + 1) * w / 2); c.line.setAttribute('y1', (1 - p.y) * h / 2); c.line.setAttribute('x2', c.x); c.line.setAttribute('y2', c.y);
      } else c.line.style.display = 'none';
    }
  }
  function init3D() {
    if (!window.THREE || !window.RelayModel) throw new Error('未找到本地 Three.js，请保留 vendor 文件夹并重新打开。');
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x101a27); scene.fog = new THREE.Fog(0x101a27, 56, 145);
    camera = new THREE.PerspectiveCamera(36, 1, .1, 200);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
    $('viewport').appendChild(renderer.domElement); renderer.domElement.setAttribute('aria-hidden', 'true');
    scene.add(new THREE.HemisphereLight(0xd8ecfc, 0x1e2c3a, 2.4));
    const key = new THREE.DirectionalLight(0xffecd6, 3.4); key.position.set(-4, 14, 10); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -32; key.shadow.camera.right = 32; key.shadow.camera.top = 18; key.shadow.camera.bottom = -16; key.shadow.normalBias = .02; scene.add(key);
    const rim = new THREE.DirectionalLight(0x88bfff, 2.6); rim.position.set(5, 6, -7); scene.add(rim);
    const fill = new THREE.DirectionalLight(0x9be5cc, 1.1); fill.position.set(-6, 3, -4); scene.add(fill);
    if (THREE.PMREMGenerator) {
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envScene = new THREE.Scene();
      envScene.background = new THREE.Color(0x162230);
      const lightBox = (w, h, x, y, z, col) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .2), new THREE.MeshBasicMaterial({ color: col })); m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m); };
      lightBox(14, 8, -8, 9, 8, 0xfff0dd);
      lightBox(12, 8, 9, 6, -8, 0x8cc4ff);
      lightBox(16, 16, 0, 13, 0, 0xd4e8f8);
      lightBox(10, 6, 0, -8, 6, 0x2c4256);
      scene.environment = pmrem.fromScene(envScene, .04).texture;
      pmrem.dispose();
    }
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x101a27, roughness: .95 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.25; ground.receiveShadow = true; scene.add(ground);
    const grid = new THREE.GridHelper(80, 80, 0x304455, 0x203343); grid.position.y = -.24; grid.material.transparent = true; grid.material.opacity = .23; scene.add(grid);
    new ResizeObserver(() => { const w = $('viewport').clientWidth, h = $('viewport').clientHeight; if (w <= 0 || h <= 0) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); orbitDirty = true; }).observe($('viewport'));
    rebuildScene();
    let pointer = null, last = null;
    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', e => { pointer = { x: e.clientX, y: e.clientY, id: e.pointerId }; last = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => { if (!pointer) return; const dx = e.clientX - last.x, dy = e.clientY - last.y; yaw -= dx * .007; pitch = Math.max(-.15, Math.min(1.3, pitch + dy * .005)); last = { x: e.clientX, y: e.clientY }; orbitDirty = true; });
    canvas.addEventListener('pointerup', e => { if (!pointer) return; const tap = Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) < 5; pointer = null; if (tap) pick(e); });
    canvas.addEventListener('pointercancel', () => { pointer = null; });
    canvas.addEventListener('wheel', e => { e.preventDefault(); distance = Math.max(contactFocus || trainFocused ? 1.3 : 5.5, Math.min(62, distance * Math.exp(e.deltaY * .001))); orbitDirty = true; }, { passive: false });
    $('viewport').addEventListener('keydown', e => {
      const actions = { ArrowLeft: () => yaw -= .12, ArrowRight: () => yaw += .12, ArrowUp: () => pitch = Math.min(1.3, pitch + .1), ArrowDown: () => pitch = Math.max(-.15, pitch - .1), '+': () => distance = Math.max(5.5, distance - .7), '=': () => distance = Math.max(5.5, distance - .7), '-': () => distance = Math.min(62, distance + .7) };
      if (actions[e.key]) { e.preventDefault(); actions[e.key](); orbitDirty = true; }
    });
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); $('model-error').hidden = false; $('model-error').textContent = '三维显示上下文已丢失，请刷新页面恢复。接点与状态说明仍可操作。'; });
    $('loading').hidden = true;
  }
  function pick(e) {
    const r = renderer.domElement.getBoundingClientRect(), v = new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    raycaster.setFromCamera(v, camera);
    const objects = [model.root, ...(branchModel ? [branchModel.root] : []), ...(track ? [track.root] : [])];
    const hits = raycaster.intersectObjects(objects, true).filter(o => o.object.isMesh && o.object.visible && o.object.userData.part && o.object.userData.part !== 'cover');
    if (hits.length) {
      selectedPart = hits[0].object.userData.part;
      let owner = hits[0].object;
      while (owner && !owner.userData.relayType) owner = owner.parent;
      selectedSourceType = owner ? owner.userData.relayType : s.type;
      renderPart();
      if (s.mode === 'bench' && ['front', 'common', 'back'].includes(selectedPart) && !comparisonKey) focusContacts(true);
      if (s.mode === 'station' && hits[0].object.userData.rackRelay) {
        showPipBanner(hits[0].object.userData.rackRelay);
      } else if (s.mode === 'station' && hits[0].object.userData.stationSignal) {
        showPipBanner({ stationSignal: hits[0].object.userData.stationSignal });
      }
    }
  }
  function frame(now) {
    const dt = Math.max(0, Math.min(.05, (now - lastFrame) / 1000)); lastFrame = now;
    const timingDt = Math.max(0, (now - lastTimingFrame) / 1000); lastTimingFrame = now;
    pantographPose += Math.sign(Number(s.pantograph) - pantographPose) * Math.min(Math.abs(Number(s.pantograph) - pantographPose), dt / .8);
    if (playing && s.mode === 'track') {
      elapsed += dt; const previous = result;
      s = L.update(s, { front: Math.min(165, s.front + dt * (s.slow ? 9 : 24)) }); result = L.evaluate(s);
      if (previous.shunt !== result.shunt || previous.picked !== result.picked) { renderStatus(); renderTrackCircuit(); record(); }
      if (now - lastTrainUI > 90) { updateTrainLabel(); renderTrackCircuit(); lastTrainUI = now; }
      if (s.front >= 165) { playing = false; updateTrainLabel(); }
    } else if (playing && s.mode === 'station') {
      elapsed += dt;
      if (s.stationStage < 5) {
        stationAutoTimer += dt;
        if (stationAutoTimer > (s.slow ? 2.2 : 1.35)) {
          stationAutoTimer = 0;
          set({ stationStage: s.stationStage + 1 });
        }
      } else if (relayPauseTimer > 0) {
        relayPauseTimer = Math.max(0, relayPauseTimer - dt);
        if (now - lastTrainUI > 95) { renderRelayChangeBanner(); lastTrainUI = now; }
      } else {
        const prevOccX3 = result.station && result.station.occX3JG;
        const direction = s.stationDirection || 1;
        const phys = stepStationPhysics(s, trainMotion, trainMotionB, dt, pantographPose, stationSpeedScale);
        trainMotion = phys.motionA;
        trainMotionB = phys.motionB;
        if (phys.hitRedStopA && result.station.trackOccupiedByB && !s.guideMode) {
          toast('🛑 股道 IG 已停有二号车 B，进站信号机 X 保持红灯 H，一号车已机外停车！请点击【引导接车 HB】或改选调车连挂(D₇→IG / D₅→IG)');
        }
        s = L.update(s, phys.patch);
        result = L.evaluate(s);
        sceneDirty = true;
        const chgs = recordRelayDiff(lastRelaySnap, result.station);
        if (chgs.length > 0 && pauseOnRelayChange) relayPauseTimer = 1.45;
        if (!prevOccX3 && result.station.occX3JG) playSound('bell');
        record();
        if (chgs.length > 0 || now - lastTrainUI > 95) { renderStatus(); renderStationCircuit(); renderRelayChangeBanner(); updateTrainLabel(); if ($('station-train-b') && result.station.multiTrain.active) { $('station-train-b').value = result.station.multiTrain.trainB; if ($('station-pos-b-label')) $('station-pos-b-label').textContent = result.station.multiTrain.trainB.toFixed(1); } lastTrainUI = now; }
        const mtAfter = result.station.multiTrain;
        const { maxPosA: mAEnd, maxPosB: mBEnd } = computeStationMaxPos(result.station);
        const sigOpenAfter = result.station.relays.LXJ || result.station.relays.YXJ;
        const aDone = (direction > 0 ? s.stationTrain >= mAEnd : s.stationTrain <= -30) || (direction > 0 && s.stationTrain >= -12 && !sigOpenAfter && s.stationTrain < 0);
        const bMoving = mtAfter && mtAfter.active && mtAfter.mode !== 'track_occupied';
        const bDone = !bMoving || (mtAfter.trainB ?? 0) >= mBEnd || ((mtAfter.trainB ?? 0) >= -12 && !mtAfter.lxjB && (mtAfter.trainB ?? 0) < 0 && aDone && result.station.allCtrlUnlocked);
        const slowPending = result.station.dg11Slow || result.station.dg1Slow || result.station.iagSlow || result.station.anySectionSlow;
        if (aDone && bDone && !slowPending) { playing = false; relayPauseTimer = 0; trainMotion.speed = 0; trainMotionB.speed = 0; render(); }
      }
    } else if (playing && s.mode === 'bench' && s.type === 'selfHold') {
      stationAutoTimer += dt;
      if (stationAutoTimer > (s.slow ? 1.8 : 1.15)) {
        stationAutoTimer = 0; shAutoStep++;
        if (shAutoStep === 1) set({ shButton: true, shFujPicked: false });
        else if (shAutoStep === 2) set({ shButton: false });
        else if (shAutoStep === 3) set({ shFujPicked: true });
        else { playing = false; set({ shFujPicked: false }); }
      }
    } else if (playing && s.mode === 'bench' && s.type === 'turnoutLab') {
      stationAutoTimer += dt;
      if (stationAutoTimer > (s.slow ? 1.7 : 1.05)) {
        stationAutoTimer = 0;
        if (s.toSjLocked && s.toStage <= 1) {
          if (s.toStage === 0) set({ toStage: 1 });
          playing = false; render();
          toast('🔒 道岔处于锁闭态 (SJ↓)，1DQJ 3-4 启动回路被切断，禁止启动转换！若要验证启动后脱离 SJ 继续转到底，请先转至阶段 3 再勾选 SJ↓。');
        } else if ((s.toObstacle || s.toLidOpen) && s.toStage >= 2) {
          if (s.toStage === 2) set({ toStage: 3 });
          playing = false; render();
          toast(s.toLidOpen ? '✕ 机盖已打开（遮断器 05-06 断开），动作电路被切断，无法继续转换到位！' : '⚠ 尖轨夹异物受阻空转（1DQJ 1-2 0.44Ω 保持吸起），道岔无法密贴反位！');
        } else if (s.toStage < 4) set({ toStage: s.toStage + 1 });
        else { playing = false; render(); }
      }
    } else if (playing && s.mode === 'bench' && s.type === 'fiveWireLab') {
      stationAutoTimer += dt;
      if (stationAutoTimer > (s.slow ? 1.7 : 1.05)) {
        stationAutoTimer = 0;
        if ((s.fwPhaseLoss || s.fwLidOpen) && s.fwStage >= 2) {
          if (s.fwStage === 2) set({ fwStage: 3 });
          playing = false; render();
          toast(s.fwLidOpen ? '✕ 遮断开关 K 已断开 U 相，DBQ 使 BHJ↓ 切断 1DQJ 自闭，停止转换！' : '⚠ 三相电源缺相，DBQ 断相保护使 BHJ↓ 立即切断 1DQJ/1DQJF 自闭，停止转换！');
        } else if (s.fwStage < 4) set({ fwStage: s.fwStage + 1 });
        else { playing = false; render(); }
      }
    }

    let stationHasSlow = false;
    if (s.mode === 'station') {
      const hasSlowA = !!(s.stationHistory && Object.values(s.stationHistory.sections).some(sec => sec.remaining > 0));
      const hasSlowB = !!(s.secondHistory && Object.values(s.secondHistory.sections).some(sec => sec.remaining > 0));
      stationHasSlow = hasSlowA || hasSlowB;
      const guideHoldTick = !!(result.station && result.station.guideActive && result.station.guideFirstSecFault && result.station.relays.YXJ);
      const needStationTick = playing || s.cancelMode === 'zra' || stationHasSlow || guideHoldTick;
      if (needStationTick && !(playing && relayPauseTimer > 0)) {
        const count = s.stationHistory ? s.stationHistory.events.length : 0;
        const before = s.zraProgress;
        s = L.advanceStation(s, timingDt);
        result = L.evaluate(s);
        const chgsT = recordRelayDiff(lastRelaySnap, result.station);
        if (chgsT.length > 0) sceneDirty = true;
        if (chgsT.length > 0 && playing && pauseOnRelayChange) relayPauseTimer = 1.45;
        if (before < 1 && s.zraProgress >= 1) playSound('clickUp');
        if (s.stationHistory && s.stationHistory.events.length !== count) record();
        if (chgsT.length > 0 || now - lastTrainUI > 95) {
          renderStatus(); renderStationCircuit(); renderRelayChangeBanner(); updateTrainLabel();
          if ($('btn-guide-hold') && result.station) {
            const showHold = !!(result.station.guideActive && result.station.guideFirstSecFault && result.station.relays.YXJ);
            $('btn-guide-hold').hidden = !showHold;
            if (showHold) $('btn-guide-hold').textContent = `⏱ 维持引导开放 (${result.station.guideHoldRemaining.toFixed(1)}s/15s)`;
          }
          lastTrainUI = now;
        }
      }
    }

    relayTiming = L.advanceRelay(relayTiming, s, timingDt);
    timerProgress = relayTiming.progress;
    const goal = contactStep === null ? Number(relayTiming.picked) : contactStep;
    const duration = s.slow ? .72 : .18;
    const step = reduced ? 1 : dt / duration;
    pose = contactStep === null ? pose + Math.sign(goal - pose) * Math.min(Math.abs(goal - pose), step) : contactStep;
    let branchResult = null, branchState = null;
    if (comparisonKey && s.mode === 'bench') {
      branchState = rightState(); branchResult = L.evaluate(branchState);
      comparisonTiming = L.advanceRelay(comparisonTiming, branchState, timingDt);
    }
    const bg = comparisonTiming && comparisonKey ? Number(comparisonTiming.picked) : Number(result.branchPicked);
    branchPose += Math.sign(bg - branchPose) * Math.min(Math.abs(bg - branchPose), step);
    const key = `${pose > .94}/${pose < .06}/${Math.abs(pose - goal) > .005}`;
    if (comparisonKey && now - lastTrainUI > 80) { renderComparison(); lastTrainUI = now; }
    if (key !== lastContactKey) { if (s.mode === 'bench' && lastContactKey && (pose > .94 || pose < .06)) playSound(pose > .94 ? 'clickUp' : 'clickDown'); lastContactKey = key; renderStatus(); if (s.mode === 'bench') renderCircuit(); }
    if (s.mode === 'bench' && (relayTiming.held || (s.type === 'timeRelay' && result.drive && timerProgress < 1)) && now - lastTrainUI > 80) { renderStatus(); renderCircuit(); lastTrainUI = now; }
    if (s.mode === 'bench' && pose > .06 && pose < .94) updateBenchSwitchInPlace();
    const pantoMoving = Math.abs(Number(s.pantograph) - pantographPose) > 1e-4;
    const stationIdle = s.mode === 'station' && !playing && !orbitDirty && !sceneDirty && !pantoMoving && !stationHasSlow && s.cancelMode !== 'zra';
    if (renderer && s.mode !== 'curriculum' && s.mode !== 'cbi' && !stationIdle) {
      if (orbitDirty) { const framedDistance = distance * Math.max(1, 1.45 / camera.aspect); camera.position.set(target.x + panX + Math.sin(yaw) * Math.cos(pitch) * framedDistance, target.y + panY + Math.sin(pitch) * framedDistance, target.z + Math.cos(yaw) * Math.cos(pitch) * framedDistance); camera.lookAt(target.x + panX, target.y + panY, target.z); labelsDirty = true; orbitDirty = false; }
      model.pose(pose, result, viewState(), reduced ? 0 : now / 1000);
      if (trainFocused) {
        const train = s.mode === 'station' ? model.train : track && track.train;
        if (train) {
          const p = train.getWorldPosition(new THREE.Vector3());
          const tx = s.mode === 'track' ? p.x - 1.76 : p.x;
          if (target.x !== tx || target.z !== p.z) { target.x = tx; target.z = p.z; orbitDirty = true; sceneDirty = true; }
        }
      }
      if (branchModel) branchModel.pose(branchPose, branchResult || { ...result, drive: result.branchPicked }, branchState || s, reduced ? 0 : now / 1000);
      if (track) track.set(s.front, result.clear, viewState());
      if (selectionBox && selectedPart) {
        const b = new THREE.Box3();
        for (const grp of [model.root, ...(branchModel ? [branchModel.root] : []), ...(track ? [track.root] : [])]) {
          grp.updateWorldMatrix(true, true);
          grp.traverseVisible(o => { if (o.isMesh && o.userData.part === selectedPart) b.expandByObject(o); });
        }
        selectionBox.visible = !b.isEmpty(); selectionBox.box.copy(b);
      }
      renderer.render(scene, camera); updateLabels(); sceneDirty = false;
    }
    requestAnimationFrame(frame);
  }
  setupEvents(); render();
  try { init3D(); } catch (e) { $('loading').hidden = true; $('model-error').hidden = false; $('model-error').textContent = '三维模型无法显示：' + e.message + '。可继续使用电路与状态面板。'; console.error(e); }
  requestAnimationFrame(frame);
  window.RelayLab = {
    getState: () => ({ ...s }), getResult: () => ({ ...result }), getPose: () => pose,
    select: chooseType, selectSignal: chooseSignal, set, openPage, exportCurrent: () => RelayModel.exportGLB(model.root),
    rendererInfo: () => renderer ? { geometries: renderer.info.memory.geometries, programs: renderer.info.programs.length, triangles: renderer.info.render.triangles } : null
  };
})();
