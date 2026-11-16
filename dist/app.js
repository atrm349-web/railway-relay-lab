(function () {
  'use strict';
  const $ = id => document.getElementById(id), L = window.RailwayLogic;
  const catalog = {
    contacts: { name: '前、后接点', en: 'CONTACTS', symbol: '⎍', kicker: '先认识电控开关', sub: '一台继电器，可以同时带有前接点和后接点',
      principle: ['<strong>释放时：</strong>中接点与后接点相接，和前接点分离。<strong>吸起时：</strong>中接点转而与前接点相接，和后接点分离。', '普通单稳态继电器的中—前接点可对应常开接点，中—后接点可对应常闭接点。<strong>铁路“常态”另有含义：</strong>按设备通常工作状态确定，并不等同于断电。'],
      question: 'GJ 在区段正常空闲时吸起，此时后接点是接通的吗？', answer: '不是。GJ 虽然处于铁路意义的常态，但机械状态是吸起：前接点接通、后接点断开。“常态”不能直接当成“失电”。', ref: '第 4.1.2 节，书内 47—49 页／PDF 57—59 页；图 4.1.6—4.1.7。' },
    neutral: { name: '无极继电器', en: 'NEUTRAL', symbol: '∩', kicker: 'AX 型安全继电器 · 结构示意', sub: '正向、反向电流都能使其吸起',
      principle: ['电流流过线圈，在铁芯、轭铁与衔铁构成的磁路中产生磁通。吸力足够时，衔铁运动，经拉杆带动接点转换。', '<strong>“无极”是不区分工作电流方向。</strong>换向后磁通方向改变，但衔铁仍受到吸力。断电后磁通减小，重锤片的重力使机构返回落下位置。'],
      question: '把电源正负极对调，衔铁会被“推开”吗？', answer: '不会。在满足工作值的条件下，正向与反向电流都能使无极继电器吸起。这里用“通电”代表满足动作条件，不模拟具体吸起电压。', ref: '第 4.1.1 节，书内 44—46 页／PDF 54—56 页；图 4.1.1、4.1.3。' },
    biased: { name: '偏极继电器', en: 'BIASED POLAR', symbol: '↗', kicker: '以 JPXC-1000 原理为例', sub: '只有规定极性的电流才能使其吸起',
      principle: ['在无极式磁系统基础上加入永久磁铁。没有线圈电流时，永久磁通配合机械作用使机构处于落下位置。', '<strong>规定 1 正、4 负时：</strong>控制磁通达到条件，克服保持落下的作用，衔铁吸动。<strong>反极性时：</strong>磁通加强保持落下的作用，继电器不吸起。'],
      question: '偏极继电器反向通电后，会像极性保持继电器一样记住位置吗？', answer: '不会。此处 JPXC-1000 的规定极性才使它吸起；反极性和断电都保持／返回落下。极性保持继电器才用不同电流方向切换位置并在断电后保持。', ref: '第 4.1.1 节，书内 46 页／PDF 56 页；图 4.1.4。' },
    latching: { name: '极性保持继电器', en: 'POLAR LATCHING', symbol: '⇄', kicker: '有极继电器 · 断电保持', sub: '电流方向改变位置，永久磁铁保存位置',
      principle: ['<strong>1 进、4 出：</strong>转为定位（前接点接通）。<strong>4 进、1 出：</strong>转为反位（后接点接通）。永久磁铁使机构在切断控制电流后保持原位置。', '它不遵循普通单稳态继电器的“断电就落下”。教材说明，当安全侧要求故障后保持原状态时，可采用这种特殊的保持原则。初始反位是本教学实验的设定。'],
      question: '先正向通电，然后断电，前接点会断开吗？', answer: '不会。正向通电把机构切到定位；断电后永久磁铁保持定位，前接点仍接通。再通入反向电流，才转为反位。注意：这不是靠持续供电的自闭电路。', ref: '第 4.1.1 节，书内 46—47 页／PDF 56—57 页；图 4.1.5。' },
    rectifier: { name: '整流式继电器', en: 'RECTIFIER', symbol: '∿', kicker: '50 Hz 轨道电路 · JZXC-480', sub: '交流经过整流，驱动继电器磁系统',
      principle: ['教材的 50 Hz 交流轨道电路采用 JZXC-480 型交流整流式轨道继电器。受电端通过中继变压器接入轨道继电器。', '这里把整流部分画为<strong>半波整流等效模块</strong>，帮助观察交流输入与单向励磁之间的关系，不代表完整内部接线。切到轨道运行，可观察轮对分路使 GJ 落下。'],
      question: '列车轮对分路后，是把轨道继电器直接“压下去”了吗？', answer: '不是机械压动。轮对在两轨之间形成低阻分路，使流经轨道继电器的电流减小；低于释放条件后，继电器机构落下，前接点断开。', ref: '第 5.3.1 节，书内 77—78 页／PDF 87—88 页；图 5.3.1—5.3.2。' },
    phase: { name: '二元二位继电器', en: '25 Hz PHASE-SENSITIVE', symbol: 'φ', kicker: '25 Hz 相敏轨道电路 · 原理示意', sub: '轨道与局部两路电源，电流、频率和相位共同决定动作',
      principle: ['<strong>“二元”：</strong>轨道线圈和局部线圈分别接受交流电源。教材规定：电源电流、频率与相位满足条件时，GJ 吸起；轮对分路或条件不符时落下。', '<strong>补充原理示意：</strong>双交流磁系统在铝翼中产生感应作用，形成与相位关系有关的转矩，带动机构和接点。这里不计算转矩、真实磁场或规定相角。'],
      question: '轨道仍空闲，轨道电源也正常；只断开局部电源，能继续证明空闲吗？', answer: '不能。在这个相敏检测场景中，两路电源与规定的频率、相位条件都需要满足。局部电源断开，GJ 落下；落下表示不能证明空闲，原因可能是占用，也可能是故障。', ref: '第 5.3.2 节，书内 78—79 页／PDF 88—89 页；图 5.3.3。' }
  };
  const parts = {
    coil: ['线圈', '导线绕成线圈，电流流过时产生磁动势。模型中的两段线圈用于表现 AX 型继电器的双线圈结构；匝数与尺寸为示意。'],
    core: ['铁芯', '为磁通提供易于通过的路径。通电形成磁通；无极安全型继电器采用低残磁材料，以利于失电后释放。'],
    yoke: ['轭铁', '连接磁路各部分，使铁芯、衔铁之间形成磁通回路。磁路上的气隙会影响吸力。模型不计算磁阻或吸力值。'],
    pole: ['极靴与气隙', '极靴附近的气隙是磁路的一部分，衔铁动作会改变气隙。吸力达到动作条件后，衔铁带动机构转换。'],
    armature: ['衔铁', '将磁作用转换成机械运动。它经拉杆驱动接点组。模型夸大了转角与间隙，便于观察。'],
    weight: ['重锤片', '为普通重力返回式继电器提供返回作用。断电后，当磁吸力不足以维持时，机构返回落下。极性保持型还必须考虑永久磁铁的保持作用。'],
    rod: ['拉杆', '在磁系统和接点组之间传递机械运动；与电气接点回路没有导电连接作用。拆解时部件分离仅便于观察。'],
    front: ['前接点', '吸起稳态时，中接点与前接点接通；落下时断开。同一继电器的多组前接点由同一机构联动。'],
    back: ['后接点', '落下稳态时，中接点与后接点接通；吸起时断开。不能因为 GJ 常态吸起，就把后接点理解成常态闭合。'],
    common: ['中接点', '随机构动作，在前、后接点之间转换。以第 1 组为例，中、前、后分别编号 11、12、13。动画采用先断后接示意。'],
    contactBlock: ['接点组', '将一个衔铁的动作分配到多组电路。线圈与接点电路电气隔离，同一继电器的接点可画在不同图中，但代号相同。'],
    permanent: ['永久磁铁', '偏极型利用永久磁通选择工作电流方向；极性保持型利用它在切断控制电流后保持原位置。两者的动作规则不同。'],
    rectifier: ['整流等效模块', '把交流转换为单向励磁，帮助理解整流式轨道继电器。本模块为教学等效，不是 JZXC-480 完整内部结构复刻。'],
    trackCoil: ['轨道线圈', '接收由钢轨路径传来的轨道信号。列车轮对分路会使受电条件改变，继电器不再满足吸起条件。'],
    localCoil: ['局部线圈', '接收独立的局部交流电源，作为相敏动作所需的另一输入。仅有轨道信号并不足以满足二元二位继电器的动作条件。'],
    vane: ['铝翼', '补充原理示意：铝翼在交流电磁系统中产生感应电流与电磁转矩，驱动机构。该内部示意不对应教材给定的具体产品尺寸。'],
    terminals: ['线圈端子', '用于连接控制电源。无极继电器的两独立线圈可串联或分别使用；本模型把它们作为一个控制输入演示。'],
    base: ['底座', '支撑磁系统与接点系统；紧固件、外形尺寸及绝缘间距均为教学示意。'],
    cover: ['透明外壳', '用于观察封装内的部件位置。这里保留透明效果，便于理解机构，并不表示实际材料与尺寸。'],
    train: ['列车与轮对', '车体是观察位置的参照；真正使轨道电路分路的是左右车轮和导电车轴构成的轮对。'],
    wheel: ['导电轮对', '轮对在两轨间形成低阻分路，流经 GJ 的电流减小。模型忽略轮轨接触电阻、道床漏泄和真实电流值。'],
    rail: ['钢轨路径', '两根钢轨构成轨道信号的传输路径。本模型中的断路是理想单路径断开，不能推广为所有实际断轨的检测结论。'],
    insulation: ['区段绝缘边界', '将相邻区段分开。教材还要求相邻轨道电路采用极性交叉或规定的相位配置，防护绝缘破损；本模型未模拟绝缘破损。']
  };
  let s = L.initial(), result = L.evaluate(s), pose = 0, branchPose = 0, playing = false;
  let renderer, scene, camera, model, branchModel, track, selectionBox, selectedPart;
  let yaw = .6, pitch = .4, distance = 11.7, panX = 0, panY = 0, lastFrame = performance.now(), orbitDirty = true;
  const target = { x: 0, y: 2, z: 0 }, raycaster = window.THREE ? new THREE.Raycaster() : null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let toastTimer, lastContactKey = '', lastRecordKey = '', elapsed = 0, lastTrainUI = 0;
  const timeline = [];

  function set(patch, rebuild = false) {
    const previous = s; s = L.update(s, patch); result = L.evaluate(s);
    if (rebuild && renderer) rebuildScene();
    if (model) model.setView(s);
    if (branchModel) branchModel.setView({ ...s, labels: false });
    if (previous.type !== s.type || previous.mode !== s.mode) {
      $('challenge-explanation').hidden = true; $('challenge-answer').textContent = '查看解释 →';
      selectedPart = null; renderPart();
    }
    render();
    record();
  }
  function contacts() { return { frontClosed: pose > .94, backClosed: pose < .06, moving: Math.abs(pose - Number(result.picked)) > .005 }; }
  function statusRow(label, value, cls = '') { return `<div class="status-row"><dt>${label}</dt><dd class="${cls}">${value}</dd></div>`; }
  function renderStatus() {
    const c = contacts(), type = s.type, cat = catalog[type], inTrack = s.mode === 'track';
    const isLatch = type === 'latching';
    const pickedText = isLatch ? '定位' : '吸起', droppedText = isLatch ? '反位' : '落下';
    $('state-badge').textContent = c.moving ? '↕ 转换中' : (result.picked ? '↑ ' + pickedText : '↓ ' + droppedText);
    $('state-badge').className = 'state-badge' + (c.moving ? ' moving' : result.picked ? ' on' : '');
    document.body.dataset.state = c.moving ? 'moving' : result.picked ? 'picked' : 'dropped';
    document.body.dataset.targetState = result.picked ? 'picked' : 'dropped';
    document.body.dataset.type = type; document.body.dataset.mode = s.mode;
    const driveText = result.drive ? (type === 'phase' ? '轨道侧有输入' : type === 'rectifier' ? '交流输入／整流' : s.polarity === 1 ? '1 正 · 4 负' : '4 正 · 1 负') : '无励磁输入';
    let rows = statusRow(type === 'phase' ? '轨道线圈' : '控制输入', driveText, result.drive ? 'on' : '');
    if (type === 'phase') rows += statusRow('局部线圈', s.localPower ? '有电源' : '断电', s.localPower ? 'on' : '');
    rows += statusRow('机构状态', c.moving ? '转换中' : result.picked ? pickedText : droppedText, c.moving ? 'warning' : result.picked ? 'on' : '');
    rows += statusRow('前接点 11—12', c.frontClosed ? '接通' : '断开', c.frontClosed ? 'on' : '');
    rows += statusRow('后接点 11—13', c.backClosed ? '接通' : '断开', c.backClosed ? 'on' : '');
    if (inTrack) rows += statusRow('区段检查目标', result.clear ? '空闲条件成立' : '不能证明空闲', result.clear ? 'on' : 'warning');
    if (inTrack && s.multi && type === 'rectifier') rows += statusRow('支 DGJ₁', result.branchPicked ? '吸起 · 前接点通' : '落下 · 前接点断', result.branchPicked ? 'on' : 'warning');
    $('state-readout').innerHTML = rows;
    let chain;
    if (inTrack) chain = result.picked ? '轮对未分路 → 受电条件满足 → GJ 吸起 → 前接点接通' : (result.shunt ? '轮对分路 → 受电不足 → GJ 落下 → 前接点断开' : '检测条件不满足 → GJ 落下 → 不提供空闲条件');
    else if (isLatch && !result.drive) chain = '控制电源断开 → 永久磁铁保持 → 接点位置不变';
    else if (type === 'biased' && s.polarity === -1) chain = '反极性电流 → 加强保持落下的作用 → 前接点断开';
    else if (type === 'phase') chain = result.picked ? '两路电源 + 频率、相位符合 → 动作转矩 → 前接点通' : '缺少所需条件 → 不产生规定的动作效果 → 前接点断';
    else chain = result.picked ? '线圈励磁 → 磁吸力 → 衔铁动作 → 拉杆带动前接点闭合' : '励磁消失 → 返回作用 → 衔铁落下 → 后接点闭合';
    $('action-chain').textContent = chain;
    $('state-reason').textContent = result.reasons.length ? result.reasons.join('；') + '。' : inTrack ? '此处仅说明轨道空闲条件；信号开放还须检查完整联锁条件。' : '通电表示已达到动作条件，模型不计算实际工作电流。';
    if (c.moving) $('state-reason').textContent += ' 动画转换期间接点先断后接，图中同步显示实际示意位置。';
  }
  function render() {
    const cat = catalog[s.type], trackMode = s.mode === 'track';
    $('model-kicker').textContent = trackMode ? (s.type === 'phase' ? '25 Hz 相敏轨道电路' : s.multi ? '50 Hz · 一送两受总检查' : '50 Hz 交流轨道电路') : cat.kicker;
    $('model-title').textContent = trackMode ? (s.multi && s.type === 'rectifier' ? '主 DGJ 与支 DGJ₁' : '轨道继电器 GJ') : cat.name;
    $('model-subtitle').textContent = trackMode ? '跟随列车轮对，观察区段状态如何变成接点状态' : cat.sub;
    $('model-caption').textContent = s.type === 'phase' ? '双电磁系统 · 补充原理示意' : 'AX 机构 · 核心部件教学示意';
    $('bench-tab').classList.toggle('active', !trackMode); $('track-tab').classList.toggle('active', trackMode);
    $('bench-tab').setAttribute('aria-pressed', String(!trackMode)); $('track-tab').setAttribute('aria-pressed', String(trackMode));
    $('bench-controls').hidden = trackMode; $('track-controls').hidden = !trackMode;
    $('phase-controls').hidden = s.type !== 'phase';
    $('polarity-controls').hidden = ['rectifier', 'phase'].includes(s.type);
    $('ac-controls').hidden = !['rectifier', 'phase'].includes(s.type);
    $('rectifier-waveforms').hidden = s.type !== 'rectifier';
    if (s.type === 'rectifier') {
      const wave = (x0, half) => Array.from({ length: 101 }, (_, i) => {
        const v = Math.sin(i / 100 * Math.PI * 4);
        return `${i ? 'L' : 'M'}${(x0 + i * 2.5).toFixed(1)},${(46 - 16 * (result.drive ? (half ? Math.max(0, v) : v) : 0)).toFixed(1)}`;
      }).join('');
      $('rectifier-waveforms').innerHTML = `<svg viewBox="0 0 640 75" role="img" aria-label="交流正负交替，半波整流后仅保留单方向波形，波形为定性示意"><text x="18" y="15">交流输入 · 示意</text><text x="354" y="15">半波整流后 · 示意</text><path d="M18,46H268M354,46H604" class="wave-axis"/><path d="${wave(18, false)}" class="wave-in"/><path d="${wave(354, true)}" class="wave-out"/></svg>`;
    }
    $('power-label').textContent = s.type === 'phase' ? '轨道线圈交流电源' : s.type === 'rectifier' ? '交流输入' : '线圈电源';
    $('power-hint').textContent = s.type === 'latching' ? '断电后保持；反向通电才能改变位置' : s.type === 'biased' ? '正向：1 正 4 负；反向：4 正 1 负' : '先通电，再切断电源观察返回动作';
    document.querySelectorAll('[data-polarity]').forEach(b => { const active = Number(b.dataset.polarity) === s.polarity; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
    document.querySelectorAll('[data-ac]').forEach(b => { const active = !!Number(b.dataset.ac) === !!s.polarity; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
    document.querySelectorAll('[data-type]').forEach(b => { const active = b.dataset.type === s.type; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
    for (const [id, key] of [['labels', 'labels'], ['field', 'field'], ['cover', 'cover'], ['slow', 'slow'], ['power', 'power'], ['rail-break', 'railBreak'], ['receiver-break', 'receiverBreak'], ['multi', 'multi'], ['branch-occupied', 'branchOccupied'], ['local-power', 'localPower']]) $(id).checked = s[key];
    $('frequency').value = s.frequency; $('phase').value = s.phase;
    $('explode-value').textContent = s.explode + '%'; $('explode').value = s.explode;
    $('multi-label').hidden = s.type !== 'rectifier';
    $('branch-occupied-label').hidden = s.type !== 'rectifier' || !s.multi;
    $('timeline-panel').hidden = !trackMode;
    $('principle').innerHTML = cat.principle.map(p => `<p>${p}</p>`).join('');
    $('challenge-question').textContent = cat.question; $('challenge-explanation').textContent = cat.answer;
    $('reference').textContent = cat.ref;
    $('model-boundary').textContent = s.type === 'phase' ? '教材给出接口与动作条件；双电磁系统与铝翼为补充原理示意，不对应具体产品内部构造。' : '机构与动作按教材原理简化；尺寸、匝数、间隙及动作时间不代表实际产品。';
    renderStatus(); renderCircuit(); renderPartList(); updateTrainLabel();
  }
  function updateTrainLabel() {
    $('train-position').value = s.front;
    $('train-position-label').textContent = s.front < 0 ? '前轮尚未进入区段' : s.front <= 100 ? `前轮：${Math.round(s.front)}% · 区段被占用` : s.front <= 118 ? '前轮已出区段，后轮仍分路' : '全部轮对已离开区段';
    $('play-train').textContent = playing ? 'Ⅱ 暂停运行' : s.front >= 145 ? '↻ 再次通过' : '▶ 列车通过';
  }
  function renderPartList() {
    const names = s.type === 'phase' ? ['trackCoil', 'localCoil', 'vane', 'front', 'common', 'back'] : ['coil', 'core', 'armature', ...(s.type === 'biased' || s.type === 'latching' ? ['permanent'] : ['weight']), 'rod', 'front', 'back'];
    $('part-list').innerHTML = names.map(k => `<button data-part="${k}" class="${selectedPart === k ? 'active' : ''}" aria-pressed="${selectedPart === k}">${parts[k][0]}</button>`).join('');
  }
  function renderPart() {
    $('part-title').textContent = selectedPart && parts[selectedPart] ? parts[selectedPart][0] : '点击模型中的部件';
    $('part-description').textContent = selectedPart && parts[selectedPart] ? parts[selectedPart][1] : '从线圈开始，看看电流如何变成接点的机械动作。';
    renderPartList();
    if (selectionBox) { scene.remove(selectionBox); selectionBox.geometry.dispose(); selectionBox.material.dispose(); selectionBox = null; }
    if (scene && selectedPart) { selectionBox = new THREE.Box3Helper(new THREE.Box3(), 0x7de0bd); scene.add(selectionBox); }
  }
  function svgWrap(content, height = 245) { return `<svg viewBox="0 0 640 ${height}" role="img" aria-label="${s.mode === 'track' ? '轨道电路、轮对分路与轨道继电器状态' : '控制线圈与独立接点电路，接点随三维机构同步转换'}">${content}</svg>`; }
  function wire(d, live, extra = '') { return `<path d="${d}" class="wire${live ? ' live' : ''}" ${extra}/>`; }
  function dot(x, y, live) { return `<circle cx="${x}" cy="${y}" r="3.2" fill="${live ? '#7de0bd' : '#8194a7'}"/>`; }
  function lamp(x, y, on, text) { return `<circle cx="${x}" cy="${y}" r="12" fill="${on ? '#244e3e' : '#172231'}" stroke="${on ? '#7de0bd' : '#63778b'}" stroke-width="1.5"/><path d="M${x - 6},${y - 6}l12,12m-12,0l12,-12" stroke="${on ? '#7de0bd' : '#63778b'}"/><text x="${x + 16}" y="${y - 17}">${text}</text>`; }
  function flow(d, reverse = false) { return `<path d="${d}" class="current-flow" style="animation-direction:${reverse ? 'reverse' : 'normal'}"/>`; }
  function renderCircuit() {
    const c = contacts();
    if (s.mode === 'track') { renderTrackCircuit(); return; }
    $('circuit-title').textContent = '线圈与独立接点电路';
    const ac = s.type === 'rectifier' || s.type === 'phase';
    const drive = result.drive, switchY = 180 - pose * 60;
    let g = `<text x="20" y="15" class="small-label">控制回路</text>`;
    g += wire('M60,35H190M250,35H310M380,35H580V70H60V51', drive);
    g += `<circle class="circuit-symbol ${drive ? 'live' : ''}" cx="60" cy="42" r="13"/><text x="60" y="46" text-anchor="middle">${ac ? '∿' : s.polarity === -1 ? '−' : '＋'}</text>`;
    g += dot(190, 35, drive) + dot(250, 35, drive) + wire(drive ? 'M190,35H250' : 'M190,35L243,18', drive);
    g += `<rect class="circuit-symbol ${drive ? 'live' : ''}" x="310" y="22" width="70" height="26" rx="3"/><text x="345" y="39" text-anchor="middle">${s.type === 'phase' ? '轨道线圈' : '线圈'}</text>`;
    if (s.type === 'rectifier') g += `<rect x="422" y="22" width="90" height="26" rx="3" class="circuit-symbol ${drive ? 'live' : ''}"/><text x="467" y="39" text-anchor="middle">半波整流</text>`;
    // 整流模块放在轨道输入与线圈之间；文字的阅读顺序不代表实际端子位置。
    if (drive) g += flow('M78,35H188M252,35H307M515,35H580V70H60V57', s.polarity === -1);
    if (s.type === 'phase') g += `<text x="20" y="95" class="small-label">局部回路</text>${wire('M140,90H310M380,90H580V108H140V90', s.localPower)}<rect x="310" y="78" width="70" height="24" rx="3" class="circuit-symbol ${s.localPower ? 'live' : ''}"/><text x="345" y="94" text-anchor="middle">局部线圈</text><text x="146" y="83" class="small-label">独立交流电源</text><g transform="translate(0 25)">`;
    g += `<text x="20" y="136" class="small-label">接点回路</text>`;
    g += wire('M80,162V150H265M80,170V221H590V120H505M590,180H505', true);
    g += `<path d="M68,162h24m-19,8h14" stroke="#b9c8d3" stroke-width="2"/><text x="52" y="158">＋</text>`;
    g += wire('M345,120H475', c.frontClosed) + wire('M345,180H475', c.backClosed);
    g += wire(`M265,150L${c.moving ? 335 : 345},${switchY}`, true);
    g += dot(265, 150, true) + dot(345, 120, c.frontClosed) + dot(345, 180, c.backClosed);
    g += `<text x="259" y="172" class="small-label">11 中</text><text x="355" y="111" class="small-label">12 前</text><text x="355" y="200" class="small-label">13 后</text>`;
    g += lamp(490, 120, c.frontClosed, '前接点负载') + lamp(490, 180, c.backClosed, '后接点负载');
    if (s.type === 'phase') g += '</g>';
    $('circuit').innerHTML = svgWrap(g, s.type === 'phase' ? 270 : 245);
    $('circuit-note').textContent = s.type === 'latching' ? '接点回路有独立电源：控制线圈断电，负载仍可能经保持位置的接点通电。' : '线圈回路与接点回路电气隔离。图中负载用于观察通断，不代表真实信号灯接线。' + (ac ? '流动点只标识有电流的路径，不表示交流瞬时方向。' : '');
  }
  function renderTrackCircuit() {
    $('circuit-title').textContent = s.type === 'phase' ? '25 Hz 相敏 · 检测条件示意' : s.multi ? '一送两受 · 总检查示意' : '轨道电路 · 轮对分路示意';
    const shunt = result.shunt, received = result.receiverAvailable, xFront = 110 + s.front * 3.9, xRear = xFront - 70.2;
    const wheel = s.front <= 100 ? xFront : xRear;
    let g = `<text x="22" y="22" class="small-label">送电端</text><text x="520" y="22" class="small-label">受电端</text><text x="113" y="43" class="small-label">绝缘边界</text><text x="445" y="43" class="small-label">绝缘边界</text>`;
    g += wire('M60,70H293M309,70H560M60,120H560', false);
    if (!s.railBreak) g += wire('M293,70H309', false);
    if (s.power) {
      let end = s.railBreak ? 293 : shunt ? Math.max(110, Math.min(500, wheel)) : 560;
      if (shunt && wheel < 293) end = wheel;
      g += wire(`M60,70H${end}`, true);
      if (shunt && (!s.railBreak || wheel < 293)) g += wire(`M60,120H${wheel}V70`, true);
      else if (received) g += wire('M60,120H560', true);
      if (shunt && (!s.railBreak || wheel < 293)) g += flow(`M60,70H${wheel}V120H60`);
      else if (received) g += flow('M60,70H560M560,120H60');
    }
    for (const x of [110, 500]) g += `<path d="M${x - 2},63v14m4,-14v14m-4,36v14m4,-14v14" stroke="#d5ad70" stroke-width="2"/>`;
    g += wire('M60,70V81M60,109V120', s.power) + `<circle cx="60" cy="95" r="14" class="circuit-symbol ${s.power ? 'live' : ''}"/><text x="60" y="100" text-anchor="middle">∿</text>`;
    g += wire(s.receiverBreak ? 'M560,70V76M560,86V120' : 'M560,70V120', received);
    g += `<rect x="540" y="81" width="40" height="27" rx="3" class="circuit-symbol ${received ? 'live' : ''}"/><text x="560" y="99" text-anchor="middle">受电</text>`;
    for (const x of [xFront, xRear]) if (x > 5 && x < 630) g += `<circle cx="${x}" cy="65" r="7" fill="#d0dde4"/><circle cx="${x}" cy="125" r="7" fill="#d0dde4"/><path d="M${x},65V125" stroke="#d0dde4" stroke-width="4"/>`;
    if (shunt) g += `<text x="${Math.min(470, Math.max(130, wheel + 10))}" y="154" fill="#7de0bd">轮对低阻分路</text>`;
    if (s.railBreak) g += `<text x="300" y="66" text-anchor="middle" style="fill:#f3959f">×</text><text x="280" y="92" class="small-label">断路</text>`;
    if (s.receiverBreak) g += `<text x="586" y="80" style="fill:#f3959f">断线</text>`;
    const total = result.picked;
    g += `<rect x="435" y="174" width="62" height="28" rx="4" class="circuit-symbol ${total ? 'live' : ''}"/><text x="466" y="192" text-anchor="middle">${s.multi && s.type === 'rectifier' ? '主 DGJ' : 'GJ'}</text>`;
    if (s.type === 'rectifier' && s.multi) {
      g += `<text x="20" y="191" class="small-label">主受电条件</text>${wire('M100,188H205M275,188H435M497,188H595', total)}${dot(205, 188, result.branchPicked)}${dot(275, 188, result.branchPicked)}${wire(result.branchPicked ? 'M205,188H275' : 'M205,188L265,170', result.branchPicked)}<text x="201" y="213" class="small-label">支 DGJ₁ 前接点</text>`;
      g += `<text x="20" y="237" class="small-label">分支 ${result.branchPicked ? '空闲 → 支 DGJ₁ 吸起' : '占用／失电 → 支 DGJ₁ 落下'}；主 DGJ 还须同时满足本受电条件</text>`;
    } else if (s.type === 'phase') {
      g += `<text x="20" y="187" class="small-label">轨道输入 ${received ? '✓' : '×'}　局部输入 ${s.localPower ? '✓' : '×'}</text><text x="20" y="211" class="small-label">频率 ${s.frequency === 'correct' ? '✓' : '×'}　相位 ${s.phase === 'correct' ? '✓' : '×'}　→　共同检查</text>`;
    } else g += `<text x="20" y="193" class="small-label">钢轨传输 → 中继变压 → 整流与励磁 → GJ</text>`;
    g += `<text x="510" y="193" style="fill:${total ? '#7de0bd' : '#f3959f'}">${total ? '空闲条件成立' : '不能证明空闲'}</text>`;
    $('circuit').innerHTML = svgWrap(g, s.multi && s.type === 'rectifier' ? 250 : 232);
    $('circuit-note').textContent = '此图省略变压器、阻抗与防护器件，只解释检测逻辑。流动点标识有电流的路径，不表示交流瞬时方向。红色区段表示“占用或故障”；GJ 不单独决定信号开放。';
  }
  function record() {
    if (s.mode !== 'track') return;
    const key = `${result.shunt}/${result.picked}/${result.reasons.join(',')}/${s.multi}/${s.branchOccupied}`;
    if (key === lastRecordKey) return;
    lastRecordKey = key;
    const label = result.picked ? '空闲条件成立，GJ 目标吸起' : (result.reasons.join('、') || '条件不符') + '，GJ 目标落下';
    timeline.push({ time: elapsed.toFixed(1) + 's', label }); if (timeline.length > 8) timeline.shift();
    $('timeline').innerHTML = timeline.map(e => `<li><span>${e.time}</span>${e.label}</li>`).join('');
  }
  function chooseType(type) {
    playing = false;
    const stayTrack = s.mode === 'track' && ['rectifier', 'phase'].includes(type);
    set({ type, mode: stayTrack ? 'track' : 'bench', polarity: 0, latched: false, multi: false, explode: 0 }, true);
  }
  function setupEvents() {
    $('relay-list').innerHTML = Object.entries(catalog).map(([key, c]) => `<button data-type="${key}" class="relay-item" aria-pressed="false"><span class="relay-symbol" aria-hidden="true">${c.symbol}</span><span><strong>${c.name}</strong><small>${c.en}</small></span></button>`).join('');
    $('relay-list').addEventListener('click', e => { const b = e.target.closest('[data-type]'); if (b) chooseType(b.dataset.type); });
    $('bench-tab').onclick = () => { playing = false; set({ mode: 'bench' }, true); };
    $('track-tab').onclick = () => { playing = false; elapsed = 0; timeline.length = 0; lastRecordKey = ''; set({ mode: 'track', type: ['rectifier', 'phase'].includes(s.type) ? s.type : 'rectifier', front: -20, explode: 0 }, true); };
    document.querySelectorAll('[data-polarity]').forEach(b => { b.onclick = () => set({ polarity: Number(b.dataset.polarity) }); });
    document.querySelectorAll('[data-ac]').forEach(b => { b.onclick = () => set({ polarity: Number(b.dataset.ac) }); });
    for (const [id, key] of [['labels', 'labels'], ['field', 'field'], ['cover', 'cover'], ['slow', 'slow'], ['power', 'power'], ['rail-break', 'railBreak'], ['receiver-break', 'receiverBreak'], ['multi', 'multi'], ['branch-occupied', 'branchOccupied'], ['local-power', 'localPower']]) {
      $(id).onchange = e => set({ [key]: e.target.checked }, id === 'multi');
    }
    $('frequency').onchange = e => set({ frequency: e.target.value }); $('phase').onchange = e => set({ phase: e.target.value });
    $('explode').oninput = e => set({ explode: Number(e.target.value) });
    $('train-position').oninput = e => { playing = false; set({ front: Number(e.target.value) }); };
    $('play-train').onclick = () => { if (s.front >= 145) { elapsed = 0; timeline.length = 0; lastRecordKey = ''; set({ front: -20 }); } playing = !playing; updateTrainLabel(); };
    $('reset-train').onclick = () => { playing = false; elapsed = 0; timeline.length = 0; lastRecordKey = ''; set({ front: -20 }); };
    $('part-list').onclick = e => { const b = e.target.closest('[data-part]'); if (b) { selectedPart = b.dataset.part; renderPart(); } };
    $('challenge-answer').onclick = () => { const open = $('challenge-explanation').hidden; $('challenge-explanation').hidden = !open; $('challenge-answer').textContent = open ? '收起解释 ↑' : '查看解释 →'; };
    for (const [b, d] of [['help-button', 'help-dialog'], ['source-button', 'source-dialog']]) $(b).onclick = () => $(d).showModal();
    document.querySelectorAll('.dialog-close').forEach(b => b.onclick = () => b.closest('dialog').close());
    document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) { const r = d.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close(); } }));
    document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => preset(b.dataset.view));
    $('home-view').onclick = () => preset('iso');
    $('export-model').onclick = () => {
      if (!model) return toast('三维引擎尚未就绪');
      try {
        const data = RelayModel.exportGLB(model.root), url = URL.createObjectURL(new Blob([data], { type: 'model/gltf-binary' }));
        const a = document.createElement('a'); a.href = url; a.download = `railway-${s.type}-${result.picked ? 'picked' : 'dropped'}.glb`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
        toast('已导出当前机构姿态；教学尺寸，不含文字与交互程序。');
      } catch (e) { toast('模型导出失败：' + e.message); }
    };
  }
  function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').hidden = true, 4500); }
  function preset(view) {
    if (view === 'front') { yaw = 0; pitch = .08; distance = 10.5; }
    else if (view === 'side') { yaw = Math.PI / 2; pitch = .12; distance = 11.5; }
    else { yaw = .6; pitch = .4; distance = s.mode === 'track' ? 15.5 : 11.7; }
    panX = 0; panY = 0; orbitDirty = true;
    document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  }
  function rebuildScene() {
    if (model) { scene.remove(model.root); model.dispose(); }
    if (branchModel) { scene.remove(branchModel.root); branchModel.dispose(); branchModel = null; }
    if (track) { scene.remove(track.root); const gs = new Set(), ms = new Set(); track.root.traverse(o => { if (o.geometry) gs.add(o.geometry); if (o.material) ms.add(o.material); }); gs.forEach(g => g.dispose()); ms.forEach(m => m.dispose()); track = null; }
    model = RelayModel.createRelay(s.type, s.mode === 'track' ? (s.multi && s.type === 'rectifier' ? '主 DGJ' : '轨道继电器 GJ') : null); scene.add(model.root); model.setView(s);
    if (s.mode === 'track') {
      track = RelayModel.createTrack(); scene.add(track.root); model.root.position.set(1, .02, 1.2); model.root.scale.setScalar(.82);
      if (s.multi && s.type === 'rectifier') { branchModel = RelayModel.createRelay('rectifier', '支 DGJ₁'); branchModel.root.position.set(-4.2, .02, 1.5); branchModel.root.scale.setScalar(.52); scene.add(branchModel.root); branchModel.setView({ ...s, labels: false }); }
    }
    target.y = s.mode === 'track' ? 1.3 : 2;
    preset('iso'); renderPart();
  }
  function init3D() {
    if (!window.THREE || !window.RelayModel) throw new Error('未找到本地 Three.js，请保留 vendor 文件夹并重新打开。');
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x101a27); scene.fog = new THREE.Fog(0x101a27, 24, 52);
    camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
    $('viewport').appendChild(renderer.domElement); renderer.domElement.setAttribute('aria-hidden', 'true');
    scene.add(new THREE.HemisphereLight(0xd3eafa, 0x263442, 2.8));
    const key = new THREE.DirectionalLight(0xffe8d2, 3.2); key.position.set(-3, 9, 7); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -10; key.shadow.camera.right = 10; key.shadow.camera.top = 10; key.shadow.camera.bottom = -8; key.shadow.normalBias = .025; scene.add(key);
    const rim = new THREE.DirectionalLight(0x81baff, 2.5); rim.position.set(3, 5, -6); scene.add(rim);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0x101a27, roughness: .95 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.25; ground.receiveShadow = true; scene.add(ground);
    const grid = new THREE.GridHelper(36, 36, 0x304455, 0x203343); grid.position.y = -.24; grid.material.transparent = true; grid.material.opacity = .23; scene.add(grid);
    new ResizeObserver(() => { const w = $('viewport').clientWidth, h = $('viewport').clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); orbitDirty = true; }).observe($('viewport'));
    rebuildScene();
    let pointer = null, last = null;
    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', e => { pointer = { x: e.clientX, y: e.clientY, id: e.pointerId }; last = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => { if (!pointer) return; const dx = e.clientX - last.x, dy = e.clientY - last.y; yaw -= dx * .007; pitch = Math.max(-.15, Math.min(1.3, pitch + dy * .005)); last = { x: e.clientX, y: e.clientY }; orbitDirty = true; });
    canvas.addEventListener('pointerup', e => { if (!pointer) return; const tap = Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) < 5; pointer = null; if (tap) pick(e); });
    canvas.addEventListener('pointercancel', () => { pointer = null; });
    canvas.addEventListener('wheel', e => { e.preventDefault(); distance = Math.max(6, Math.min(26, distance * Math.exp(e.deltaY * .001))); orbitDirty = true; }, { passive: false });
    $('viewport').addEventListener('keydown', e => {
      const actions = { ArrowLeft: () => yaw -= .12, ArrowRight: () => yaw += .12, ArrowUp: () => pitch = Math.min(1.3, pitch + .1), ArrowDown: () => pitch = Math.max(-.15, pitch - .1), '+': () => distance = Math.max(6, distance - .7), '=': () => distance = Math.max(6, distance - .7), '-': () => distance = Math.min(26, distance + .7) };
      if (actions[e.key]) { e.preventDefault(); actions[e.key](); orbitDirty = true; }
    });
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); $('model-error').hidden = false; $('model-error').textContent = '三维显示上下文已丢失，请刷新页面恢复。接点与状态说明仍可操作。'; });
    $('loading').hidden = true;
  }
  function pick(e) {
    const r = renderer.domElement.getBoundingClientRect(), v = new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    raycaster.setFromCamera(v, camera);
    const objects = [model.root, ...(track ? [track.root] : [])];
    const hits = raycaster.intersectObjects(objects, true).filter(o => o.object.isMesh && o.object.visible && o.object.userData.part && o.object.userData.part !== 'cover');
    if (hits.length) { selectedPart = hits[0].object.userData.part; renderPart(); }
  }
  function frame(now) {
    const dt = Math.min(.05, (now - lastFrame) / 1000); lastFrame = now;
    if (playing && s.mode === 'track') {
      elapsed += dt; const previous = result;
      s = L.update(s, { front: Math.min(145, s.front + dt * (s.slow ? 9 : 24)) }); result = L.evaluate(s);
      if (previous.shunt !== result.shunt || previous.picked !== result.picked) { renderStatus(); renderTrackCircuit(); record(); }
      if (now - lastTrainUI > 90) { updateTrainLabel(); renderTrackCircuit(); lastTrainUI = now; }
      if (s.front >= 145) { playing = false; updateTrainLabel(); }
    }
    const goal = Number(result.picked), step = reduced ? 1 : dt / (s.slow ? 2 : .38);
    pose += Math.sign(goal - pose) * Math.min(Math.abs(goal - pose), step);
    const bg = Number(result.branchPicked); branchPose += Math.sign(bg - branchPose) * Math.min(Math.abs(bg - branchPose), step);
    const key = `${pose > .94}/${pose < .06}/${Math.abs(pose - goal) > .005}`;
    if (key !== lastContactKey) { lastContactKey = key; renderStatus(); if (s.mode === 'bench') renderCircuit(); }
    if (s.mode === 'bench' && pose > .06 && pose < .94) renderCircuit();
    if (renderer) {
      if (orbitDirty) { const framedDistance = distance * Math.max(1, 1.45 / camera.aspect); camera.position.set(target.x + panX + Math.sin(yaw) * Math.cos(pitch) * framedDistance, target.y + panY + Math.sin(pitch) * framedDistance, target.z + Math.cos(yaw) * Math.cos(pitch) * framedDistance); camera.lookAt(target.x + panX, target.y + panY, target.z); orbitDirty = false; }
      model.pose(pose, result, s, reduced ? 0 : now / 1000);
      if (branchModel) branchModel.pose(branchPose, { ...result, drive: result.branchPicked }, s, reduced ? 0 : now / 1000);
      if (track) track.set(s.front, result.clear);
      if (selectionBox && selectedPart) { const b = new THREE.Box3(); model.root.updateWorldMatrix(true, true); model.root.traverse(o => { if (o.isMesh && o.userData.part === selectedPart) b.expandByObject(o); }); selectionBox.visible = !b.isEmpty(); selectionBox.box.copy(b); }
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }
  setupEvents(); render();
  try { init3D(); } catch (e) { $('loading').hidden = true; $('model-error').hidden = false; $('model-error').textContent = '三维模型无法显示：' + e.message + '。可继续使用电路与状态面板。'; console.error(e); }
  requestAnimationFrame(frame);
  // 用于离线自检与模型导出；无联网接口，不读取用户数据。
  window.RelayLab = { getState: () => ({ ...s }), getResult: () => ({ ...result }), getPose: () => pose,
    select: chooseType, set, exportCurrent: () => RelayModel.exportGLB(model.root),
    rendererInfo: () => renderer ? { geometries: renderer.info.memory.geometries, programs: renderer.info.programs.length, triangles: renderer.info.render.triangles } : null };
})();
