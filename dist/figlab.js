(function (root) {
  'use strict';

  function formatProse(str) {
    if (!str) return '';
    return String(str)
      .replace(/\$F\s*\\propto\s*\\Phi\^2\$/g, '<em>F ∝ Φ²</em>')
      .replace(/\$a\s*=\s*-g\\sin\\theta\s*-\s*\\mu g\$/g, '<em>a = −g·sinθ − μg</em>')
      .replace(/\$i\(t\)=I_0 e\^\{-t\/\(\(R\+R_c\)C\)\}\$/g, '<em>i(t) = I₀·e<sup>−t/((R+R<sub>c</sub>)C)</sup></em>')
      .replace(/\$T\s*\\propto\s*I_g I_l \\sin\\Delta\\varphi\$/g, '<em>T ∝ I<sub>g</sub>I<sub>l</sub>·sin(Δφ)</em>')
      .replace(/\$e\s*=\s*-N\\frac\{d\\Phi\}\{dt\}\$/g, '<em>e = −N·(dΦ/dt)</em>')
      .replace(/\$\\frac\{d\\Phi\}\{dt\}=0\$/g, '<em>dΦ/dt = 0</em>')
      .replace(/\$\\delta_0\$/g, '<em>δ₀</em>')
      .replace(/\$K_a\$/g, '<em>K<sub>a</sub></em>')
      .replace(/\$K_r\s*=\s*U_\{释放\}\/U_\{工作\}\$/g, '<em>K<sub>r</sub> = U<sub>释放</sub>/U<sub>工作</sub></em>')
      .replace(/\$\\ge\s*0\.45\\text\{–\}0\.5\\text\{\s*s\}\$/g, '≥ 0.45–0.5 s')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="fig-code">$1</code>');
  }

  // 合并全书 168 幅教材插图数据（34 站场 + 43 第4-6章电路 + 60 第7-13章电路 + 31 系统/流程/冗余 = 168）
  function getAllFigures() {
    return [
      ...(root.FigDataYard || []),
      ...(root.FigDataCircuitA || []),
      ...(root.FigDataCircuitB || []),
      ...(root.FigDataSys || [])
    ].sort((a, b) => {
      const pa = a.id.split('.').map(Number);
      const pb = b.id.split('.').map(Number);
      for (let i = 0; i < 3; i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
      return 0;
    });
  }

  const labState = {
    chFilter: 'all',
    engFilter: 'all',
    search: '',
    currentId: '3.1.1',
    showOriginal: true,
    // 每个图的独立交互状态缓存
    figStates: {},
    // 动画循环管理
    rafId: 0,
    lastTs: 0,
    animT: 0,
    container: null,
    callbacks: null
  };

  function getFigState(fig) {
    if (!labState.figStates[fig.id]) {
      const st = {
        // yard
        routeIdx: 0,
        playing: false,
        trainT: 0, // 0..1 along route
        speed: 0,
        switches: {},
        clearedAt: {}, // secId -> animT when cleared (for 3s FDGJ)
        // circuit ladder
        inputs: {},
        relays: {},
        relayDecay: {},
        // sequence / flowchart
        stepIdx: 0,
        seqPlaying: false,
        seqTimer: 0,
        // generic controls
        ctrl: {},
        // rack / hmi / redundancy
        rackSel: 0,
        consoleRoute: false,
        consoleYza: false,
        powerMainFail: false,
        powerBackupFail: false,
        redFaults: {},
        redMode: 'a',
        ringCut: {}
      };
      if (fig.switches) fig.switches.forEach(sw => { st.switches[sw.id] = sw.defPos || 'N'; });
      if (fig.engine === 'yard' && fig.routes && fig.routes[0] && fig.routes[0].reqSw) {
        Object.entries(fig.routes[0].reqSw).forEach(([k, v]) => { st.switches[k] = v; });
      }
      if (fig.inputs) fig.inputs.forEach(inp => { st.inputs[inp.id] = inp.def; });
      if (fig.controls) fig.controls.forEach(c => { st.ctrl[c.id] = c.def; });
      if (fig.sub === 'wave' && fig.waveType === 'rcDecay') {
        st.rcLevel = st.ctrl.aj ? 1 : 0;
        st.rcTimer = 0;
      }
      if (fig.sub === 'wave' && fig.waveType === 'chargePump') {
        st.c2Volt = 1;
      }
      labState.figStates[fig.id] = st;
      if (fig.sub === 'ladder') solveLadder(fig, st, 0);
    }
    return labState.figStates[fig.id];
  }

  // ==================== 1. 继电电路真实不动点迭代求解器 ====================
  function evalRungEnergized(r, inp, relays) {
    const mainOn = r.parallelContacts
      ? r.parallelContacts.some(c => c.on(inp, relays))
      : (r.contacts || []).every(c => c.on(inp, relays));
    const altOn = r.altBranch ? r.altBranch.contacts.every(c => c.on(inp, relays)) : false;
    return mainOn || altOn;
  }

  function solveLadder(fig, st, dt) {
    const inp = st.inputs;
    const effDt = inp.stepMode ? 0 : dt;
    const rungs = fig.rungs || [];
    // 先做 5 轮不动点迭代（处理自闭反馈与链式传递），迭代内绝不重复扣减缓放时间
    const next = { ...st.relays };
    const rungEnergized = {};
    for (let iter = 0; iter < 5; iter++) {
      for (const r of rungs) {
        const energized = evalRungEnergized(r, inp, next);
        rungEnergized[r.coil] = energized;
        if (energized) {
          next[r.coil] = true;
        } else if (r.slowRelease && (st.relayDecay[r.coil] || 0) > 0) {
          next[r.coil] = true;
        } else {
          next[r.coil] = false;
        }
      }
    }
    // 迭代收敛后，每帧严格按真实时间步长 effDt 更新一次缓放倒计时
    for (const r of rungs) {
      if (rungEnergized[r.coil]) {
        st.relayDecay[r.coil] = r.slowRelease || 0;
        next[r.coil] = true;
      } else if (r.slowRelease && (st.relayDecay[r.coil] || 0) > 0) {
        if (effDt > 0) st.relayDecay[r.coil] = Math.max(0, st.relayDecay[r.coil] - effDt);
        next[r.coil] = st.relayDecay[r.coil] > 0;
      } else {
        st.relayDecay[r.coil] = 0;
        next[r.coil] = false;
      }
    }
    st.relays = next;
  }

  // ==================== 2. 站场路径几何与物理运动辅助 ====================
  function polylineLength(pts) {
    let L = 0;
    for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return L || 1;
  }
  function samplePolyline(pts, dist) {
    const total = polylineLength(pts);
    // 允许 dist < 0 时沿始端轨道切线向后自然延展，杜绝三节车厢在起点叠压穿模
    if (dist < 0 && pts.length >= 2) {
      const dx = pts[1][0] - pts[0][0], dy = pts[1][1] - pts[0][1];
      const seg = Math.hypot(dx, dy) || 1;
      const ang = Math.atan2(dy, dx) * 180 / Math.PI;
      return { x: pts[0][0] + (dx / seg) * dist, y: pts[0][1] + (dy / seg) * dist, ang };
    }
    const d = Math.max(0, Math.min(total, dist));
    let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) || 1;
      if (acc + seg >= d || i === pts.length - 1) {
        const u = Math.max(0, Math.min(1, (d - acc) / seg));
        const x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u;
        const y = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u;
        const ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) * 180 / Math.PI;
        return { x, y, ang };
      }
      acc += seg;
    }
    return { x: pts[0][0], y: pts[0][1], ang: 0 };
  }
  function ptToSegDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
    if (!l2) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }
  function distToSection(px, py, sec) {
    if (sec.pts && sec.pts.length >= 2) {
      let best = Infinity;
      for (let i = 1; i < sec.pts.length; i++) {
        best = Math.min(best, ptToSegDist(px, py, sec.pts[i - 1][0], sec.pts[i - 1][1], sec.pts[i][0], sec.pts[i][1]));
      }
      return best;
    }
    const sy1 = typeof sec.y1 === 'number' ? sec.y1 : sec.y;
    const sy2 = typeof sec.y2 === 'number' ? sec.y2 : sec.y;
    return ptToSegDist(px, py, sec.x1, sy1, sec.x2, sy2);
  }
  function projectDistOnPolyline(pts, px, py) {
    let bestD = Infinity, bestAlong = 0, acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const x1 = pts[i - 1][0], y1 = pts[i - 1][1], x2 = pts[i][0], y2 = pts[i][1];
      const dx = x2 - x1, dy = y2 - y1, seg = Math.hypot(dx, dy) || 1;
      const u = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (seg * seg)));
      const d = Math.hypot(px - (x1 + u * dx), py - (y1 + u * dy));
      if (d < bestD) { bestD = d; bestAlong = acc + u * seg; }
      acc += seg;
    }
    return bestAlong;
  }

  function catchSlopeKinematics(st) {
    const v0km = Number(st.ctrl.v0 ?? 80);
    const v0 = v0km / 3.6;
    const grade = Number(st.ctrl.grade ?? 60);
    const a = 9.81 * (grade / 1000 + 0.025); // 重力坡度分力 + 砂石滚动阻滞
    const stopDist = (v0 * v0) / (2 * a);
    const rampLenM = 450; // 避难线上坡有效制动长度 450 m
    const rampStartT = 0.42;
    const onCatch = (st.switches['避1'] || 'N') === 'N';
    const rampFrac = onCatch ? Math.max(0, (st.trainT - rampStartT) / (1 - rampStartT)) : 0;
    const sCur = rampFrac * rampLenM;
    const curV = onCatch && st.trainT > rampStartT
      ? 3.6 * Math.sqrt(Math.max(0, v0 * v0 - 2 * a * sCur))
      : v0km;
    const stopT = Math.min(1, rampStartT + (stopDist / rampLenM) * (1 - rampStartT));
    return { v0km, grade, a, stopDist, curV, stopT, rampLenM, rampStartT, onCatch };
  }

  function evaluateYard(fig, st) {
    const rt = (fig.routes && fig.routes[st.routeIdx]) || null;
    const pts = rt ? rt.path : [[50, 165], [800, 165]];
    const totalLen = polylineLength(pts);
    const carLen = 28;
    const carPitch = carLen + 3;
    const trainSpan = carLen + carPitch * 2; // 3 节编组总长 (90px)
    const headDist = st.trainT * totalLen;
    const cars = [0, 1, 2].map(idx => {
      const center = headDist - idx * carPitch - carLen / 2;
      return samplePolyline(pts, center);
    });
    const headPt = samplePolyline(pts, headDist);
    const tailPt = samplePolyline(pts, headDist - trainSpan);
    const wheelPts = [headPt, cars[0], cars[1], cars[2], tailPt];

    // 敌对与道岔一致性检查
    let conflictMsg = '';
    if (rt && rt.conflictCtrl && st.ctrl[rt.conflictCtrl]) {
      conflictMsg = '🛡 联锁条件拦截：敌对/侵限/照查条件触发，信号强制保持禁止显示，严禁发车！';
    }
    if (!conflictMsg && fig.physicsMode === 'foulingCalc' && Number(st.ctrl.tailPos ?? -10) > 0) {
      conflictMsg = '🛡 警冲标侵限拦截：侧股停留车尾越过警冲标，直股信号 X 强制保持红灯 H，严禁通过！';
    }
    if (!conflictMsg && rt && rt.reqSw) {
      for (const [swId, reqPos] of Object.entries(rt.reqSw)) {
        if ((st.switches[swId] || 'N') !== reqPos) {
          conflictMsg = `🛡 道岔 ${swId}# 当前在${st.switches[swId] === 'R' ? '反位' : '定位'}，与进路要求(${reqPos === 'R' ? '反位' : '定位'})不符，信号保持禁止！`;
          break;
        }
      }
    }

    // 计算每个轨道区段占用状态（按轮对至轨道区段精确几何距离 < 10px 判定，绝不串扰邻线）
    const secStates = {};
    const routeSecs = new Set((rt && rt.secs) || []);
    const isAutoBlock = fig.physicsMode === 'autoblock';
    for (const sec of (fig.sections || [])) {
      const occ = st.trainT > 0.005 && wheelPts.some(wp => distToSection(wp.x, wp.y, sec) < 10);
      if (occ) {
        secStates[sec.id] = 'occ';
        st.clearedAt[sec.id] = -1; // 正在占用
      } else if (!isAutoBlock && st.clearedAt[sec.id] === -1) {
        st.clearedAt[sec.id] = labState.animT;
        secStates[sec.id] = 'slow';
      } else if (!isAutoBlock && st.clearedAt[sec.id] >= 0 && (labState.animT - st.clearedAt[sec.id]) < 3.0) {
        secStates[sec.id] = 'slow';
      } else if (routeSecs.has(sec.id) && !conflictMsg && st.trainT < 0.96 && st.clearedAt[sec.id] === undefined) {
        secStates[sec.id] = 'locked';
      } else {
        secStates[sec.id] = 'free';
      }
    }

    // 信号机灯光计算（按路径投影距离精确判定列车首轮/调车整列越过信号机）
    const sigAspects = {};
    for (const sig of (fig.signals || [])) {
      let asp = sig.defAspect || 'H';
      if (isAutoBlock && typeof sig.secIdx === 'number') {
        const secs = fig.sections || [];
        let clearAhead = 0;
        for (let k = sig.secIdx; k < secs.length; k++) {
          if (secStates[secs[k].id] === 'occ') break;
          clearAhead++;
        }
        asp = clearAhead === 0 ? 'H' : clearAhead === 1 ? 'U' : clearAhead === 2 ? 'LU' : 'L';
      } else if (rt && sig.id === rt.signal) {
        if (conflictMsg) asp = sig.type === 'shunt' ? 'A' : 'H';
        else {
          const sigAlong = projectDistOnPolyline(pts, sig.x, sig.y);
          const pastSig = rt.trainKind === 'shunt'
            ? (headDist - trainSpan) > sigAlong + 8
            : headDist > sigAlong + 6;
          asp = (st.trainT > 0.02 && pastSig) ? (sig.type === 'shunt' ? 'A' : 'H') : rt.aspect;
        }
      }
      sigAspects[sig.id] = asp;
    }

    return { rt, cars, headPt, tailPt, secStates, sigAspects, conflictMsg, totalLen };
  }

  function aspectColor(asp) {
    return {
      H: '#ff5268', U: '#ffcb47', UU: '#ffcb47', L: '#3ce8a4', LU: '#7de0bd',
      LL: '#3ce8a4', B: '#eaf4ff', A: '#4998ff', HB: '#ff5268'
    }[asp] || '#ff5268';
  }

  // ==================== 3. 引擎 A：站场 SVG 渲染器 ====================
  function renderYardSvg(fig, st) {
    const ev = evaluateYard(fig, st);
    let g = '';
    // 站场背景网格微纹
    g += `<rect x="0" y="0" width="880" height="330" rx="8" fill="#0c141d"/>`;
    g += `<text x="16" y="22" style="fill:#9cc0d6;font-size:11.5px;font-weight:600">${fig.title} ｜ PDF p.${fig.page}</text>`;

    // 渲染基础轨道线
    for (const tr of (fig.tracks || [])) {
      const d = tr.pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
      const stroke = tr.kind === 'safety' ? '#6c4949' : tr.kind === 'slope' ? '#6e5a38' : '#32485c';
      g += `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${tr.kind === 'main' ? 5 : 4}" stroke-linecap="round" stroke-linejoin="round"/>`;
      if (tr.name && tr.labelPos) {
        g += `<text x="${tr.labelPos[0]}" y="${tr.labelPos[1]}" text-anchor="middle" style="fill:#8db0c7;font-size:10.5px">${tr.name}</text>`;
      }
    }

    // 渲染轨道区段光带（红占 / 琥珀FDGJ缓放 / 蓝白锁闭 / 绿空闲；支持折线 pts 与斜坡 y1→y2）
    for (const sec of (fig.sections || [])) {
      const mode = ev.secStates[sec.id] || 'free';
      const col = mode === 'occ' ? '#ff5268' : mode === 'slow' ? '#f5b041' : mode === 'locked' ? '#70c8ff' : '#2d7a5e';
      if (sec.pts && sec.pts.length >= 2) {
        const pd = sec.pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
        g += `<path d="${pd}" fill="none" stroke="${col}" stroke-width="${mode === 'free' ? 3 : 5.5}" stroke-linecap="round" stroke-linejoin="round"/>`;
        if (sec.label) {
          const midP = sec.pts[Math.floor(sec.pts.length / 2)];
          g += `<text x="${midP[0]}" y="${midP[1] - 9}" text-anchor="middle" style="fill:${mode === 'occ' ? '#ff9aa8' : mode === 'slow' ? '#ffd07d' : '#a7cadf'};font-size:9.5px">${sec.label}</text>`;
        }
      } else {
        const sy1 = typeof sec.y1 === 'number' ? sec.y1 : sec.y;
        const sy2 = typeof sec.y2 === 'number' ? sec.y2 : sec.y;
        g += `<line x1="${sec.x1 + 3}" y1="${sy1}" x2="${sec.x2 - 3}" y2="${sy2}" stroke="${col}" stroke-width="${mode === 'free' ? 3 : 5.5}" stroke-linecap="round"/>`;
        if (sec.label) {
          g += `<text x="${(sec.x1 + sec.x2) / 2}" y="${(sy1 + sy2) / 2 - 9}" text-anchor="middle" style="fill:${mode === 'occ' ? '#ff9aa8' : mode === 'slow' ? '#ffd07d' : '#a7cadf'};font-size:9.5px">${sec.label}</text>`;
        }
      }
    }

    // 渲染绝缘节（普通 / 单边 / 超限圆圈○；图 2.5.1 双动渡线特例实时响应 doubleCross）
    for (const ins of (fig.insulations || [])) {
      g += `<line x1="${ins.x}" y1="${ins.y - 8}" x2="${ins.x}" y2="${ins.y + 8}" stroke="#d5ad70" stroke-width="2.2"/>`;
      const dblBecomesFouling = fig.id === '2.5.1' && ins.kind === 'single' && st.ctrl.doubleCross === false;
      if (ins.kind === 'fouling' || dblBecomesFouling) {
        g += `<circle cx="${ins.x}" cy="${ins.y}" r="10" fill="none" stroke="#ff6b7a" stroke-width="2"/>`;
      }
      if (ins.label) {
        const ly = ins.y + (typeof ins.labelDy === 'number' ? ins.labelDy : 22);
        const lblText = dblBecomesFouling ? '非双动→超限 ○!' : ins.label;
        g += `<text x="${ins.x}" y="${ly}" text-anchor="middle" style="fill:${dblBecomesFouling ? '#ff8b99' : '#f0c47a'};font-size:9.5px">${lblText}</text>`;
      }
    }

    // 渲染可点击道岔（尖轨动画 + 定/反位标记）
    for (const sw of (fig.switches || [])) {
      const pos = st.switches[sw.id] || 'N';
      const isRev = pos === 'R';
      const dx = sw.dir === 'R' ? 28 : -28;
      const dy = isRev ? (sw.branchDy > 0 ? 18 : -18) : 0;
      const lblDy = typeof sw.labelDy === 'number' ? sw.labelDy : (sw.branchDy > 0 ? -24 : 23);
      g += `<g data-yard-sw="${sw.id}" style="cursor:pointer">`;
      g += `<circle cx="${sw.x}" cy="${sw.y}" r="10" fill="#132230" stroke="${isRev ? '#ffcb47' : '#7de0bd'}" stroke-width="2"/>`;
      g += `<line x1="${sw.x}" y1="${sw.y}" x2="${sw.x + dx}" y2="${sw.y + dy}" stroke="${isRev ? '#ffcb47' : '#7de0bd'}" stroke-width="3.2" stroke-linecap="round"/>`;
      g += `<text x="${sw.x}" y="${sw.y + lblDy}" text-anchor="middle" style="fill:${isRev ? '#ffcb47' : '#9ee5ca'};font-size:9.5px;font-weight:600">${sw.label}(${isRev ? '反' : '定'})</text>`;
      g += `</g>`;
    }

    // 渲染标记（警冲标 / 车挡 / 驼峰 / 文本）
    for (const m of (fig.markers || [])) {
      if (m.kind === 'fouling') {
        const violated = fig.physicsMode === 'foulingCalc' && Number(st.ctrl.tailPos || 0) > 0;
        g += `<circle cx="${m.x}" cy="${m.y}" r="6" fill="${violated ? '#ff5268' : '#ffcb47'}" stroke="#fff" stroke-width="1.5"/>`;
        g += `<text x="${m.x}" y="${m.y - 12}" text-anchor="middle" style="fill:${violated ? '#ff8b99' : '#ffcb47'};font-size:10px;font-weight:600">${m.text}</text>`;
      } else if (m.kind === 'buffer') {
        g += `<rect x="${m.x - 4}" y="${m.y - 11}" width="8" height="22" rx="2" fill="#e05c6c"/>`;
        g += `<text x="${m.x}" y="${m.y - 16}" text-anchor="middle" style="fill:#f3959f;font-size:9.5px">${m.text}</text>`;
      } else {
        g += `<text x="${m.x}" y="${m.y}" text-anchor="middle" style="fill:#9cc0d6;font-size:10.5px">${m.text}</text>`;
      }
    }

    // 特殊物理可视化：图 2.1.9 警冲标停留车尾滑块位置
    if (fig.physicsMode === 'foulingCalc') {
      const tailOff = Number(st.ctrl.tailPos ?? -10);
      const delta = Number(st.ctrl.delta ?? 0);
      const carTailX = 430 - tailOff * 4;
      const violated = tailOff > 0;
      g += `<rect x="${Math.max(330, carTailX)}" y="97" width="130" height="16" rx="4" fill="${violated ? '#ff5268' : '#7de0bd'}" stroke="#fff" stroke-width="1.2"/>`;
      g += `<text x="${Math.max(330, carTailX) + 65}" y="108" text-anchor="middle" style="fill:#0b131c;font-size:9.5px;font-weight:700">停留车尾 (${tailOff > 0 ? '侵限 +' + tailOff + 'm!' : '安全 ' + tailOff + 'm'})</text>`;
      g += `<text x="16" y="308" style="fill:${violated ? '#ff8b99' : '#7de0bd'};font-size:11px;font-weight:600">最小安全距每线中心 = ${2000 + delta} mm（直股2000 + 曲线加宽Δ=${delta}mm） ｜ 判定：${violated ? '⚠ 越过警冲标侵限！直股严禁接发车！' : '✓ 停于警冲标内方，满足有效长安全限界！'}</text>`;
    }

    // 特殊物理可视化：图 2.1.7 避难线动力学速度与制动距离公式（与动画完全同源！）
    if (fig.physicsMode === 'catchSlope') {
      const kin = catchSlopeKinematics(st);
      const overBuf = kin.onCatch && kin.stopDist > kin.rampLenM;
      g += `<text x="16" y="308" style="fill:${overBuf ? '#ff9aa8' : '#7de0bd'};font-size:11px">动力学模型：初速 v₀=${kin.v0km} km/h · 坡度 i=${kin.grade}‰ · 减速度 a=${kin.a.toFixed(2)} m/s² → 理论制动距离 s=${kin.stopDist.toFixed(0)} m ｜ 当前车速：${kin.curV.toFixed(1)} km/h${overBuf ? ' (⚠ 超坡长需砂堆缓冲!)' : ''}</text>`;
    }

    // 特殊提示：图 2.5.1 双动渡线特例开关实时反馈
    if (fig.id === '2.5.1') {
      const isDbl = st.ctrl.doubleCross !== false;
      g += `<text x="16" y="308" style="fill:${isDbl ? '#7de0bd' : '#ff9aa8'};font-size:10.5px;font-weight:600">${isDbl ? '✓ 1/3 双动渡线特例生效：两端同步动作，渡线间绝缘不作超限绝缘处理（仅 1/7 标 ○ 超限）' : '⚠ 取消双动联动：1/3 渡线中间绝缘(<3.5m)同样变为超限绝缘 ○，须额外增设条件侵限联锁！'}</text>`;
    }

    // 渲染信号机（柱+灯盘+多灯示）
    for (const sig of (fig.signals || [])) {
      const asp = ev.sigAspects[sig.id] || sig.defAspect || 'H';
      const c1 = aspectColor(asp);
      const isDouble = ['UU', 'LU', 'LL', 'HB'].includes(asp);
      const c2 = asp === 'LU' ? '#ffcb47' : asp === 'HB' ? '#eaf4ff' : c1;
      g += `<g>`;
      g += `<circle cx="${sig.x}" cy="${sig.y}" r="7" fill="${c1}" stroke="#d9e8f5" stroke-width="1.2"/>`;
      if (isDouble) {
        g += `<circle cx="${sig.x + (sig.dir === 'R' ? 13 : -13)}" cy="${sig.y}" r="6" fill="${c2}" stroke="#d9e8f5" stroke-width="1.2"/>`;
      }
      g += `<text x="${sig.x}" y="${sig.y - 11}" text-anchor="middle" style="fill:#e8f3ff;font-size:9.5px;font-weight:600">${sig.id}:${asp}</text>`;
      g += `</g>`;
    }

    // 渲染 3 节编组仿真列车
    if (ev.rt) {
      const trainColor = ev.rt.trainKind === 'runaway' ? '#ff6b7a' : ev.rt.trainKind === 'freight' ? '#d9a45b' : ev.rt.trainKind === 'shunt' ? '#6ec1ff' : '#eaf5ff';
      for (let i = 2; i >= 0; i--) {
        const c = ev.cars[i];
        g += `<g transform="translate(${c.x.toFixed(1)},${c.y.toFixed(1)}) rotate(${c.ang.toFixed(1)})">`;
        g += `<rect x="-14" y="-6.5" width="28" height="13" rx="${i === 0 ? 5 : 2}" fill="${trainColor}" stroke="#102030" stroke-width="1.2"/>`;
        if (i === 0) g += `<line x1="2" y1="-4" x2="12" y2="-4" stroke="#e03a4b" stroke-width="2"/><line x1="2" y1="4" x2="12" y2="4" stroke="#e03a4b" stroke-width="2"/>`;
        g += `</g>`;
      }
    }

    // 底部图例条（避开特殊物理计算文字）
    if (!['foulingCalc', 'catchSlope'].includes(fig.physicsMode) && fig.id !== '2.5.1') {
      g += `<text x="16" y="314" style="fill:#7f9fb5;font-size:10px">光带图例：■ 红=轮对分路占用(DGJ↓)  ■ 琥珀=FDGJ 3s缓放  ■ 蓝白=进路锁闭(SJ↓)  ■ 绿=空闲(DGJ↑) ｜ 可直接点击图中任意道岔(定/反)交互试验</text>`;
    }
    return `<svg viewBox="0 0 880 330" class="fig-svg" role="img" aria-label="${fig.title}">${g}</svg>`;
  }

  // ==================== 4. 引擎 B：继电电路/波形/时序/设备架 SVG 渲染器 ====================
  function renderLadderSvg(fig, st) {
    const rungs = fig.rungs || [];
    const H = Math.max(210, 92 + rungs.length * 74);
    const [leftRail, rightRail] = fig.rails || ['KZ (+24V)', 'KF (0V)'];
    let g = `<rect x="0" y="0" width="880" height="${H}" rx="8" fill="#0c141d"/>`;
    g += `<text x="16" y="22" style="fill:#9cc0d6;font-size:11.5px;font-weight:600">${fig.title} ｜ PDF p.${fig.page}</text>`;

    // 左右母线
    g += `<line x1="56" y1="42" x2="56" y2="${H - 22}" stroke="#5ec9a1" stroke-width="3"/>`;
    g += `<line x1="824" y1="42" x2="824" y2="${H - 22}" stroke="#6c90ad" stroke-width="3"/>`;
    g += `<text x="16" y="36" text-anchor="start" style="fill:#7de0bd;font-size:10px;font-weight:700">${leftRail}</text>`;
    g += `<text x="864" y="36" text-anchor="end" style="fill:#9cc0d6;font-size:10px;font-weight:700">${rightRail}</text>`;

    const dashOff = -((labState.animT * 36) % 24);
    rungs.forEach((r, idx) => {
      const y = 78 + idx * 74;
      const coilOn = !!st.relays[r.coil];
      const contacts = r.parallelContacts || r.contacts || [];
      const isPar = !!r.parallelContacts;

      // 支路标题
      g += `<text x="68" y="${y - 22}" style="fill:#9cc0d6;font-size:10px">${r.label}</text>`;

      // 支路主线
      const wireCol = coilOn ? '#4ee3a8' : '#3a5166';
      g += `<line x1="56" y1="${y}" x2="670" y2="${y}" stroke="${wireCol}" stroke-width="${coilOn ? 2.6 : 1.8}" ${coilOn ? `stroke-dasharray="8 4" stroke-dashoffset="${dashOff.toFixed(1)}"` : ''}/>`;
      g += `<line x1="774" y1="${y}" x2="824" y2="${y}" stroke="${wireCol}" stroke-width="${coilOn ? 2.6 : 1.8}"/>`;

      // 绘制接点/元件符号
      const n = Math.max(1, contacts.length);
      const span = 570;
      const step = span / n;
      contacts.forEach((c, ci) => {
        const cx = 76 + step * (ci + 0.5);
        const cOn = !!c.on(st.inputs, st.relays);
        const boxW = Math.min(138, Math.max(88, step - 16));
        const bx = cx - boxW / 2;
        const fill = c.kind === 'fault' && cOn ? '#3f1c24' : cOn ? '#133128' : '#15212d';
        const stroke = c.kind === 'fault' && cOn ? '#ff6b7a' : cOn ? '#5ce0ae' : '#4a647a';
        const sym = c.kind === 'diode' ? '▷|' : c.kind === 'back' ? '⫠' : c.kind === 'btn' ? '⏺' : isPar ? '∥' : '⫟';
        g += `<rect x="${bx}" y="${y - 14}" width="${boxW}" height="28" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`;
        g += `<text x="${cx}" y="${y + 3}" text-anchor="middle" style="fill:${cOn ? '#e8fff6' : '#8aa6bb'};font-size:9.5px;font-weight:600">${sym} ${c.label}</text>`;
      });

      // 若有自闭/备用支路，绘下方小支路
      if (r.altBranch) {
        const altOn = r.altBranch.contacts.every(c => c.on(st.inputs, st.relays));
        const ay = y + 26;
        g += `<path d="M90,${y} V${ay} H640 V${y}" fill="none" stroke="${altOn ? '#70c8ff' : '#32485c'}" stroke-width="${altOn ? 2 : 1.3}" stroke-dasharray="${altOn ? '6 3' : '3 3'}"/>`;
        g += `<text x="365" y="${ay + 12}" text-anchor="middle" style="fill:${altOn ? '#8cd8ff' : '#6c889e'};font-size:9px">自闭/并联支路：${r.altBranch.contacts.map(c => c.label + (c.on(st.inputs, st.relays) ? '✓' : '✕')).join(' · ')}</text>`;
      }

      // 线圈方框
      const decayLeft = st.relayDecay[r.coil] || 0;
      const energizedNow = evalRungEnergized(r, st.inputs, st.relays);
      const cFill = coilOn ? '#14382d' : '#16222e';
      const cStroke = coilOn ? '#4ee3a8' : '#4a647a';
      g += `<rect x="670" y="${y - 18}" width="104" height="36" rx="5" fill="${cFill}" stroke="${cStroke}" stroke-width="2"/>`;
      g += `<text x="722" y="${y - 1}" text-anchor="middle" style="fill:${coilOn ? '#7de0bd' : '#9cc0d6'};font-size:10.5px;font-weight:700">${r.coil}</text>`;
      g += `<text x="722" y="${y + 12}" text-anchor="middle" style="fill:${coilOn ? '#c8ffea' : '#738fa6'};font-size:9px">${coilOn ? (decayLeft > 0 && !energizedNow ? `⏳缓放 ${decayLeft.toFixed(1)}s` : '↑ 吸起导通') : '↓ 落下断开'}</text>`;
    });

    return `<svg viewBox="0 0 880 ${H}" class="fig-svg" role="img" aria-label="${fig.title}">${g}</svg>`;
  }

  function renderSequenceSvg(fig, st) {
    const steps = fig.steps || [];
    const sigs = fig.signals || [];
    const cur = Math.min(steps.length - 1, Math.max(0, st.stepIdx));
    const H = 138 + sigs.length * 34;
    let g = `<rect x="0" y="0" width="880" height="${H}" rx="8" fill="#0c141d"/>`;
    g += `<text x="16" y="22" style="fill:#9cc0d6;font-size:11.5px;font-weight:600">${fig.title} ｜ 时序波形与因果推演</text>`;

    // 顶部阶段框
    const boxW = Math.floor(830 / Math.max(1, steps.length)) - 8;
    steps.forEach((sp, i) => {
      const bx = 22 + i * (boxW + 8);
      const isCur = i === cur, isDone = i < cur;
      g += `<g data-seq-step="${i}" style="cursor:pointer">`;
      g += `<rect x="${bx}" y="36" width="${boxW}" height="42" rx="5" fill="${isCur ? '#163c30' : isDone ? '#142836' : '#131d28'}" stroke="${isCur ? '#4ee3a8' : isDone ? '#5aa9d6' : '#354b5e'}" stroke-width="${isCur ? 2 : 1.3}"/>`;
      g += `<text x="${bx + boxW / 2}" y="53" text-anchor="middle" style="fill:${isCur ? '#7de0bd' : '#cfe3f2'};font-size:9.5px;font-weight:700">阶段 ${i + 1}</text>`;
      const shortT = sp.title.replace(/^[①②③④⑤⑥]\s*|^阶段\s*\d+[：:\s]*/, '').slice(0, Math.max(6, Math.floor(boxW / 11)));
      g += `<text x="${bx + boxW / 2}" y="69" text-anchor="middle" style="fill:#92b2c8;font-size:8.5px">${shortT}</text>`;
      g += `</g>`;
    });

    // 多通道数字逻辑时序波形图
    const waveX0 = 152, waveW = 700, colW = waveW / Math.max(1, steps.length);
    g += `<rect x="${waveX0 + cur * colW}" y="92" width="${colW}" height="${sigs.length * 34 + 14}" fill="rgba(78,227,168,0.08)"/>`;
    sigs.forEach((sigName, si) => {
      const yBase = 122 + si * 34;
      g += `<text x="142" y="${yBase - 2}" text-anchor="end" style="fill:#bcd4e6;font-size:10px;font-weight:600">${sigName}</text>`;
      g += `<line x1="${waveX0}" y1="${yBase + 6}" x2="${waveX0 + waveW}" y2="${yBase + 6}" stroke="#1d2d3d" stroke-width="1"/>`;
      let pathD = '';
      let prevHi = false;
      for (let k = 0; k <= cur; k++) {
        const hi = (steps[k].active || []).includes(sigName);
        const x1 = waveX0 + k * colW;
        const x2 = x1 + colW;
        const y = hi ? yBase - 12 : yBase + 4;
        if (k === 0) pathD += `M${x1},${y} H${x2}`;
        else {
          if (hi !== prevHi) pathD += ` V${y}`;
          pathD += ` H${x2}`;
        }
        prevHi = hi;
      }
      g += `<path d="${pathD}" fill="none" stroke="${prevHi ? '#4ee3a8' : '#70b3e0'}" stroke-width="2.4"/>`;
    });

    // 当前阶段底部详细说明
    g += `<text x="20" y="${H - 12}" style="fill:#7de0bd;font-size:10.5px;font-weight:600">当前【${steps[cur].title}】：${steps[cur].desc}</text>`;
    return `<svg viewBox="0 0 880 ${H}" class="fig-svg" role="img" aria-label="${fig.title}">${g}</svg>`;
  }

  function renderWaveSvg(fig, st) {
    const t = labState.animT;
    const wt = fig.waveType;
    let g = `<rect x="0" y="0" width="880" height="310" rx="8" fill="#0c141d"/>`;
    g += `<text x="16" y="22" style="fill:#9cc0d6;font-size:11.5px;font-weight:600">${fig.title} ｜ 物理规律实时仿真</text>`;

    if (wt === 'magneticFlux') {
      const kind = fig.relayKind;
      const v = kind === 'latching'
        ? (st.ctrl.pulse === 'pos' ? 24 : st.ctrl.pulse === 'neg' ? -24 : 0)
        : Number(st.ctrl.volt ?? 24);
      if (kind === 'latching' && v !== 0) st.latchPos = v > 0 ? 'N' : 'R';
      const rawPicked = kind === 'neutral' ? Math.abs(v) >= 16 : kind === 'biased' ? v >= 16 : (st.latchPos || 'N') === 'N';
      const weightStuck = (kind === 'neutral' || kind === 'biased') && !!st.ctrl.weightBroken && !rawPicked && st.lastPicked !== false;
      const picked = rawPicked || weightStuck;
      if (rawPicked) st.lastPicked = true;
      else if (!st.ctrl.weightBroken) st.lastPicked = false;
      const fluxDir = v > 0 ? 1 : v < 0 ? -1 : 0;
      const dashOff = -((t * 40 * (fluxDir || 1)) % 24);
      // 铁芯 + 轭铁 + 线圈 + 衔铁 + 重锤/永磁
      g += `<path d="M120,220 V90 H320" fill="none" stroke="#6d869c" stroke-width="18" stroke-linecap="square"/>`;
      g += `<rect x="155" y="64" width="120" height="52" rx="6" fill="${v !== 0 ? '#5c3b1e' : '#2a221c'}" stroke="#d9934a" stroke-width="2"/>`;
      g += `<text x="215" y="94" text-anchor="middle" style="fill:#ffd69e;font-size:11px;font-weight:700">线圈 1-2/3-4 (${v >= 0 ? '+' : ''}${v}V)</text>`;
      if (kind !== 'neutral') {
        g += `<rect x="92" y="140" width="56" height="60" rx="4" fill="#3b1d2e" stroke="#e86f99" stroke-width="2"/>`;
        g += `<text x="120" y="164" text-anchor="middle" style="fill:#ff9ec0;font-size:10px;font-weight:700">永磁 N</text>`;
        g += `<text x="120" y="186" text-anchor="middle" style="fill:#7fb8ff;font-size:10px;font-weight:700">永磁 S</text>`;
      }
      // 磁通闭合动画
      if (v !== 0 || kind === 'latching') {
        g += `<rect x="120" y="90" width="220" height="130" fill="none" stroke="${picked ? '#4ee3a8' : '#ff6b7a'}" stroke-width="2.5" stroke-dasharray="10 6" stroke-dashoffset="${dashOff.toFixed(1)}"/>`;
      }
      // 衔铁与重锤片
      const ang = picked ? 0 : 18;
      g += `<g transform="translate(340,220) rotate(${ang})">`;
      g += `<rect x="-8" y="-135" width="16" height="135" rx="3" fill="#9fb8cc" stroke="#fff" stroke-width="1"/>`;
      if (kind === 'neutral' || kind === 'biased') {
        const hasW = !st.ctrl.weightBroken;
        g += `<rect x="8" y="-75" width="38" height="24" rx="3" fill="${hasW ? '#d4a657' : '#3a3a3a'}" stroke="#ffe1a3"/>`;
        g += `<text x="27" y="-60" text-anchor="middle" style="fill:#111;font-size:9px;font-weight:700">${hasW ? '重锤G' : '无重力'}</text>`;
      }
      g += `</g>`;
      // 右侧物理力学柱状图
      const Fe = kind === 'neutral' ? Math.pow(v / 24, 2) * 100 : kind === 'biased' ? (v > 0 ? Math.pow(v / 24, 2) * 100 : 0) : 85;
      const Fg = st.ctrl.weightBroken ? 0 : 45;
      g += `<rect x="460" y="56" width="390" height="200" rx="8" fill="#101b27" stroke="#2c4154"/>`;
      g += `<text x="480" y="84" style="fill:#cfe4f5;font-size:12px;font-weight:700">电磁力学判据 (F ∝ Φ²)</text>`;
      g += `<text x="480" y="114" style="fill:#7de0bd;font-size:10.5px">有效电磁吸力 F_e：${Fe.toFixed(0)}%</text>`;
      g += `<rect x="480" y="122" width="${Math.max(4, Fe * 3.3)}" height="16" rx="3" fill="#4ee3a8"/>`;
      g += `<text x="480" y="164" style="fill:#f0c47a;font-size:10.5px">重锤片返回重力 G：${Fg}%</text>`;
      g += `<rect x="480" y="172" width="${Math.max(4, Fg * 3.3)}" height="16" rx="3" fill="#f0c47a"/>`;
      g += `<text x="480" y="220" style="fill:${weightStuck ? '#ff6b7a' : picked ? '#7de0bd' : '#ff9aa8'};font-size:11.5px;font-weight:700">当前状态：${kind === 'latching' ? (picked ? '定位保持 (111-112闭)' : '反位保持 (111-113闭)') : weightStuck ? '⚠ 失电卡滞吸起位！(无重力违反故障-安全)' : (picked ? '↑ 吸起（F_e > G，前接点 11-12 闭）' : '↓ 落下（重力返还，后接点 11-13 闭）')}</text>`;
      g += `<text x="16" y="294" style="fill:#8db0c7;font-size:10.5px">${kind === 'biased' ? '偏极铁律：1正4负磁通叠加吸起；4正1负磁通抵消且永磁加强落下！' : kind === 'latching' ? '极性保持铁律：断电后靠永磁保持最后转极位置（2DQJ 记忆道岔位置）。' : '安全型继电器铁律：失电必靠重锤片重力强制可靠落下（故障—安全）！'}</text>`;
    } else if (wt === 'namingDecoder') {
      const code = st.ctrl.modelPreset || 'JWJXC-H125/0.44';
      const MAP = {
        'JWJXC-H125/0.44': [['J','继电器'],['W','无极'],['J','加强接点'],['X','信号'],['C','插入式'],['H','铜套缓放'],['125/0.44','前125Ω启动/后0.44Ω串电机自闭']],
        'JWXC-1700': [['J','继电器'],['W','无极'],['X','信号'],['C','插入式'],['1700','总电阻 2×850=1700Ω · 8QH']],
        'JWXC-H340': [['J','继电器'],['W','无极'],['X','信号'],['C','插入式'],['H','缓放(≥0.45s)'],['340','线圈电阻 340Ω']],
        'JPXC-1000': [['J','继电器'],['P','偏极(鉴别极性)'],['X','信号'],['C','插入式'],['1000','2×500=1000Ω (DBJ/FBJ)']],
        'JYJXC-220/220': [['J','继电器'],['Y','有极/极性保持'],['J','加强接点'],['X','信号'],['C','插入式'],['220/220','双220Ω线圈 (2DQJ)']],
        'JZXC-480': [['J','继电器'],['Z','交流整流式'],['X','信号'],['C','插入式'],['480','2×240=480Ω (50Hz GJ)']],
        'JZXC-H62': [['J','继电器'],['Z','交流整流式'],['X','信号'],['C','插入式'],['H','缓放(>0.15s)'],['62','2×31Ω 串点灯回路 (DJ)']],
        'JSBXC-850': [['J','继电器'],['S','时间(3′)'],['B','半导体延时'],['X','信号'],['C','插入式'],['850','线圈 850Ω (3min/30s 人解)']]
      };
      const parts = MAP[code] || MAP['JWJXC-H125/0.44'];
      const w = Math.floor(810 / parts.length) - 8;
      parts.forEach(([k, v], i) => {
        const bx = 34 + i * (w + 8);
        g += `<rect x="${bx}" y="70" width="${w}" height="64" rx="8" fill="#152b3b" stroke="#4ee3a8" stroke-width="2"/>`;
        g += `<text x="${bx + w / 2}" y="110" text-anchor="middle" style="fill:#7de0bd;font-size:${k.length > 4 ? 13 : 20}px;font-weight:800">${k}</text>`;
        g += `<line x1="${bx + w / 2}" y1="134" x2="${bx + w / 2}" y2="176" stroke="#5aa9d6" stroke-width="1.8"/>`;
        g += `<rect x="${bx}" y="176" width="${w}" height="62" rx="6" fill="#111d2a" stroke="#3c5a73"/>`;
        const l1 = v.slice(0, Math.max(5, Math.floor(w / 12))), l2 = v.slice(l1.length);
        g += `<text x="${bx + w / 2}" y="${l2 ? 202 : 211}" text-anchor="middle" style="fill:#e0f2ff;font-size:10.5px;font-weight:600">${l1}</text>`;
        if (l2) g += `<text x="${bx + w / 2}" y="220" text-anchor="middle" style="fill:#9cc0d6;font-size:9.5px">${l2}</text>`;
      });
      g += `<text x="440" y="282" text-anchor="middle" style="fill:#7de0bd;font-size:12px;font-weight:700">当前解码型号：${code}（严格对照表 4.1.1 & 表 4.1.4，PDF p.55 / 60）</text>`;
    } else if (wt === 'contactBreakMake') {
      const p = Number(st.ctrl.pose ?? 0);
      const isBack = p <= 30, isFront = p >= 70;
      const tipY = 195 - (p / 100) * 90;
      g += `<line x1="120" y1="150" x2="290" y2="150" stroke="#7de0bd" stroke-width="4"/>`;
      g += `<circle cx="290" cy="150" r="6" fill="#7de0bd"/>`;
      g += `<text x="200" y="136" text-anchor="middle" style="fill:#e8f6ff;font-size:12px;font-weight:700">中接点 21 (动片)</text>`;
      g += `<line x1="290" y1="150" x2="490" y2="${tipY.toFixed(1)}" stroke="${isFront ? '#4ee3a8' : isBack ? '#70c8ff' : '#ffcb47'}" stroke-width="5" stroke-linecap="round"/>`;
      // 前接点 22 (上)
      g += `<circle cx="500" cy="105" r="8" fill="${isFront ? '#4ee3a8' : '#2a3d4f'}" stroke="#7de0bd" stroke-width="2"/>`;
      g += `<line x1="508" y1="105" x2="740" y2="105" stroke="${isFront ? '#4ee3a8' : '#3a5268'}" stroke-width="3" ${isFront ? '' : 'stroke-dasharray="6 4"'}/>`;
      g += `<text x="625" y="92" text-anchor="middle" style="fill:${isFront ? '#7de0bd' : '#8aa5b8'};font-size:11.5px;font-weight:700">前接点 22 (失电常开 · ${isFront ? '实线接通!' : '虚线断开'})</text>`;
      // 后接点 23 (下)
      g += `<circle cx="500" cy="195" r="8" fill="${isBack ? '#70c8ff' : '#2a3d4f'}" stroke="#70c8ff" stroke-width="2"/>`;
      g += `<line x1="508" y1="195" x2="740" y2="195" stroke="${isBack ? '#70c8ff' : '#3a5268'}" stroke-width="3" ${isBack ? '' : 'stroke-dasharray="6 4"'}/>`;
      g += `<text x="625" y="218" text-anchor="middle" style="fill:${isBack ? '#8cd8ff' : '#8aa5b8'};font-size:11.5px;font-weight:700">后接点 23 (失电常闭 · ${isBack ? '实线接通!' : '虚线断开'})</text>`;
      g += `<text x="440" y="280" text-anchor="middle" style="fill:${!isFront && !isBack ? '#ffcb47' : '#7de0bd'};font-size:12.5px;font-weight:700">${isBack ? '● 落下位：21—23 实线导通，21—22 虚线断开' : isFront ? '● 吸起位：21—22 实线导通，21—23 虚线断开' : '⚡ 先断后接悬空区 (行程 ' + p + '%)：21—22 与 21—23 同时断开，严防短接！'}</text>`;
    } else if (wt === 'normalStateCompare') {
      const m = st.ctrl.state || 'normal';
      const items = [
        { name: 'GJ (轨道继电器)', norm: '常态吸起 ↑', up: m !== 'trainOcc', note: '空闲吸起；占车/断轨落下' },
        { name: 'DBJ (定位表示)', norm: '常态吸起 ↑', up: true, note: '定位密贴吸起；四开/反位落下' },
        { name: 'XJ (信号继电器)', norm: '常态落下 ↓', up: m === 'routeOpen', note: '平时红灯落下；开放允许吸起' }
      ];
      items.forEach((it, i) => {
        const bx = 36 + i * 276;
        g += `<rect x="${bx}" y="58" width="256" height="196" rx="8" fill="#111d2a" stroke="${it.up ? '#4ee3a8' : '#70c8ff'}" stroke-width="2"/>`;
        g += `<text x="${bx + 128}" y="88" text-anchor="middle" style="fill:#eef7ff;font-size:13px;font-weight:700">${it.name}</text>`;
        g += `<text x="${bx + 128}" y="110" text-anchor="middle" style="fill:#ffcb47;font-size:10.5px">${it.norm}</text>`;
        g += `<circle cx="${bx + 128}" cy="154" r="24" fill="${it.up ? '#153c2f' : '#182b3d'}" stroke="${it.up ? '#4ee3a8' : '#70c8ff'}" stroke-width="2.5"/>`;
        g += `<text x="${bx + 128}" y="159" text-anchor="middle" style="fill:${it.up ? '#7de0bd' : '#8cd8ff'};font-size:14px;font-weight:800">${it.up ? '↑ 吸' : '↓ 落'}</text>`;
        g += `<text x="${bx + 128}" y="206" text-anchor="middle" style="fill:#cde2f2;font-size:10.5px">${it.up ? '前接点实线 ━━ / 后接点虚线 ┄' : '后接点实线 ━━ / 前接点虚线 ┄'}</text>`;
        g += `<text x="${bx + 128}" y="232" text-anchor="middle" style="fill:#8aa8be;font-size:9.5px">${it.note}</text>`;
      });
    } else if (wt === 'rcDecay') {
      const R = Number(st.ctrl.R ?? 51), C = Number(st.ctrl.C ?? 1000);
      const Rcoil = 1700; // 典型等效线圈阻抗缩放成教学时间常数
      const tau = ((R + 400) * C) / 150000; // 51Ω/1000μF -> ~3.0s，51Ω/200μF -> ~0.6-1.0s
      const dropThresh = 0.25;
      const tDrop = -tau * Math.log(dropThresh);
      const on = !!st.ctrl.aj;
      const lvl = on ? 1 : Math.exp(-(st.rcTimer || 0) / Math.max(0.15, tau));
      const picked = lvl >= dropThresh;
      // 绘制指数曲线坐标系
      const ox = 70, oy = 240, pw = 520, ph = 170;
      g += `<rect x="${ox}" y="${oy - ph}" width="${pw}" height="${ph}" fill="#101a25" stroke="#2c4154"/>`;
      const yTh = oy - dropThresh * ph;
      g += `<line x1="${ox}" y1="${yTh.toFixed(1)}" x2="${ox + pw}" y2="${yTh.toFixed(1)}" stroke="#ff6b7a" stroke-width="1.5" stroke-dasharray="6 4"/>`;
      g += `<text x="${ox + pw - 6}" y="${yTh - 6}" text-anchor="end" style="fill:#ff8b99;font-size:10px">释放电流阈值 I_drop (25%)</text>`;
      let d = '';
      for (let i = 0; i <= 80; i++) {
        const tm = (i / 80) * 6;
        const val = Math.exp(-tm / Math.max(0.15, tau));
        const px = ox + (i / 80) * pw, py = oy - val * ph;
        d += `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
      }
      g += `<path d="${d}" fill="none" stroke="#4ee3a8" stroke-width="2.6"/>`;
      // 当前放电点
      const curTm = on ? 0 : Math.min(6, st.rcTimer || 0);
      const cx = ox + (curTm / 6) * pw, cy = oy - lvl * ph;
      g += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="6" fill="${picked ? '#ffcb47' : '#ff5268'}" stroke="#fff" stroke-width="1.5"/>`;
      g += `<text x="${ox}" y="${oy + 18}" style="fill:#8db0c7;font-size:10px">t = 0s (断电瞬间)</text>`;
      g += `<text x="${ox + pw}" y="${oy + 18}" text-anchor="end" style="fill:#8db0c7;font-size:10px">t = 6.0s</text>`;
      // 右侧数据框
      g += `<rect x="615" y="70" width="240" height="170" rx="8" fill="#101b27" stroke="${picked ? '#4ee3a8' : '#506b82'}" stroke-width="2"/>`;
      g += `<text x="632" y="100" style="fill:#eef7ff;font-size:12px;font-weight:700">RC 充放电实时物理态</text>`;
      g += `<text x="632" y="128" style="fill:#9cc0d6;font-size:11px">R = ${R} Ω ｜ C = ${C} μF</text>`;
      g += `<text x="632" y="152" style="fill:#7de0bd;font-size:11px">理论缓放时间：${tDrop.toFixed(2)} s</text>`;
      g += `<text x="632" y="176" style="fill:#ffcb47;font-size:11px">当前线圈电流：${(lvl * 100).toFixed(0)}%</text>`;
      g += `<text x="632" y="212" style="fill:${picked ? '#4ee3a8' : '#ff8b99'};font-size:13px;font-weight:800">继电器：${on ? '↑ 通电吸起(充电满)' : picked ? '⏳ 断电缓放保持↑' : '↓ 释放落下'}</text>`;
      g += `<text x="16" y="294" style="fill:#8db0c7;font-size:10.5px">物理公式：i(t) = I₀ · e^(-t/τ)；取消上方供电勾选立即实时观察电容放电缓放落下过程！</text>`;
      void Rcoil;
    } else if (wt === 'clawKinematics') {
      const p = Number(st.ctrl.progress ?? 0);
      const bMoved = p >= 15, aMoved = p >= 95;
      // 4 排静接点
      [1, 2, 3, 4].forEach((row, i) => {
        const rx = 140 + i * 165;
        const active = (row === 1 && !aMoved) || (row === 2 && aMoved) || (row === 3 && !bMoved) || (row === 4 && bMoved);
        g += `<rect x="${rx}" y="70" width="120" height="72" rx="6" fill="${active ? '#14382d' : '#131e2a'}" stroke="${active ? '#4ee3a8' : '#3a5166'}" stroke-width="2"/>`;
        g += `<text x="${rx + 60}" y="98" text-anchor="middle" style="fill:#eef7ff;font-size:12px;font-weight:700">第 ${row} 排接点</text>`;
        g += `<text x="${rx + 60}" y="122" text-anchor="middle" style="fill:${active ? '#7de0bd' : '#7b95ab'};font-size:10px">${row === 1 ? '反位动作/A定位' : row === 2 ? '反位表示 FBJ' : row === 3 ? '定位表示 DBJ' : '定位回转/B反位'}</text>`;
      });
      // A 爪与 B 爪滑块
      const ax = aMoved ? 365 : 200, bx = bMoved ? 695 : 530;
      g += `<rect x="${ax - 44}" y="168" width="88" height="34" rx="5" fill="#70c8ff" stroke="#fff"/><text x="${ax}" y="189" text-anchor="middle" style="fill:#0b131c;font-size:11px;font-weight:800">外侧 A 爪</text>`;
      g += `<rect x="${bx - 44}" y="168" width="88" height="34" rx="5" fill="#ffcb47" stroke="#fff"/><text x="${bx}" y="189" text-anchor="middle" style="fill:#0b131c;font-size:11px;font-weight:800">内侧 B 爪</text>`;
      g += `<text x="440" y="242" text-anchor="middle" style="fill:#7de0bd;font-size:12.5px;font-weight:700">${p < 15 ? '① 定位密贴：A在第1排 · B在第3排（DBJ↑）' : p < 95 ? '② 转换中 (' + p + '%)：【内侧 B 爪已先由 3 排转 4 排】备好反转！A 仍在 1 排维持电机旋转！' : '③ 反位到位 (100%)：【外侧 A 爪速动由 1 排转 2 排】断电机并通 FBJ↑！'}</text>`;
      g += `<text x="16" y="292" style="fill:#8db0c7;font-size:10.5px">铁律口诀：内侧 B 爪先动（刚起步即断原表示、备好回转），外侧 A 爪后动（转换密贴才切断电机、通新表示）！</text>`;
    } else if (wt === 'dbqPhaseLoss' || wt === 'threePhaseMotor') {
      const isMotor = wt === 'threePhaseMotor';
      const phA = isMotor ? st.ctrl.dir !== 'stop' : !!st.ctrl.phaseA;
      const phB = isMotor ? st.ctrl.dir !== 'stop' : !!st.ctrl.phaseB;
      const phC = isMotor ? (st.ctrl.dir !== 'stop' && !st.ctrl.kOpen) : !!st.ctrl.phaseC;
      const allOk = phA && phB && phC && !st.ctrl.timeout;
      const revDir = isMotor && st.ctrl.dir === 'norm' ? -1 : 1;
      // 三相波形示波器
      const ox = 50, oy = 165, pw = 450;
      g += `<rect x="${ox}" y="62" width="${pw}" height="200" rx="6" fill="#101a25" stroke="#2c4154"/>`;
      [[phA, 0, '#ff6b7a', 'A相(W)'], [phB, revDir * 2.094, '#ffcb47', isMotor ? (revDir > 0 ? 'B相→X4→V' : 'B相→X2→U') : 'B相'], [phC, revDir * 4.188, '#4ee3a8', isMotor ? (revDir > 0 ? 'C相→X3→U(K)' : 'C相→X5→V') : 'C相']].forEach(([on, ph, col, lbl], idx) => {
        let d = '';
        for (let i = 0; i <= 90; i++) {
          const x = ox + 10 + (i / 90) * (pw - 20);
          const y = oy - (on ? Math.sin(i * 0.18 - t * 6 + ph) * 58 : 0);
          d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
        }
        g += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${on ? 2.4 : 1.5}" ${on ? '' : 'stroke-dasharray="4 4"'}/>`;
        g += `<text x="${ox + 16 + idx * 145}" y="82" style="fill:${col};font-size:10px;font-weight:700">${lbl}:${on ? '通流' : '✕断相!'}</text>`;
      });
      // 右侧旋转磁场矢量图 / DBQ 判决
      const cx = 685, cy = 162, R = 68;
      g += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#101b27" stroke="${allOk ? '#4ee3a8' : '#ff6b7a'}" stroke-width="2.5"/>`;
      const ang = allOk ? t * 4.5 * revDir : 0;
      g += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(ang) * (R - 12)).toFixed(1)}" y2="${(cy + Math.sin(ang) * (R - 12)).toFixed(1)}" stroke="${allOk ? '#4ee3a8' : '#ff6b7a'}" stroke-width="4" stroke-linecap="round"/>`;
      g += `<circle cx="${cx}" cy="${cy}" r="5" fill="#fff"/>`;
      g += `<text x="${cx}" y="82" text-anchor="middle" style="fill:${allOk ? '#7de0bd' : '#ff8b99'};font-size:11.5px;font-weight:700">${isMotor ? (allOk ? (revDir > 0 ? '↻ 顺时针旋转(反位)' : '↺ 换相逆时针(定位)') : '⏹ 停转(断相/到位)') : (allOk ? '✓ 三相平衡 → BHJ↑' : '🛡 断相/超时 → BHJ↓停机!')}</text>`;
      g += `<text x="16" y="292" style="fill:#8db0c7;font-size:10.5px">${isMotor ? '物理原理：交换 B/C 两相接至定子 U/V 绕组即反转旋转磁场方向；遮断开关 K 串在 U 相，开盖立停！' : '物理原理：DBQ 通过三只互感器实测三相真实电流（非电压），缺任一相或超 13s/30s 立即切 BHJ↓！'}</text>`;
    } else if (wt === 's700kHalfWave' || wt === 'rectifierTrack50Hz' || wt === 'fourTermCapFilter') {
      const ox = 50, oy = 170, pw = 510;
      g += `<rect x="${ox}" y="62" width="${pw}" height="200" rx="6" fill="#101a25" stroke="#2c4154"/>`;
      g += `<line x1="${ox}" y1="${oy}" x2="${ox + pw}" y2="${oy}" stroke="#2b4154" stroke-width="1"/>`;
      let statusTxt = '', ok = true;
      let dIn = '', dOut = '';
      for (let i = 0; i <= 100; i++) {
        const x = ox + 10 + (i / 100) * (pw - 20);
        const sVal = Math.sin(i * 0.25 - t * 6);
        dIn += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(oy - sVal * 62).toFixed(1)}`;
        let outV = 0;
        if (wt === 's700kHalfWave') {
          const pos = st.ctrl.pos || 'norm';
          ok = pos === 'norm' || pos === 'rev';
          outV = pos === 'norm' ? (sVal < 0 ? sVal * 55 : sVal * 15) : pos === 'rev' ? (sVal > 0 ? sVal * 55 : sVal * 15) : pos === 'zOpen' ? sVal * 55 : 0;
          statusTxt = pos === 'norm' ? '✓ 定位：负半周驱 DBJ↑，正半周经 Z+R2 查绕组' : pos === 'rev' ? '✓ 反位：正半周驱 FBJ↑，负半周经 Z+R2 查绕组' : '🛡 故障：无单向直流分量 → 偏极 DBJ/FBJ↓ 导向安全！';
        } else if (wt === 'rectifierTrack50Hz') {
          ok = !st.ctrl.shunt && !st.ctrl.railBreak;
          outV = ok ? Math.max(0, sVal) * 62 : (st.ctrl.shunt ? Math.max(0, sVal) * 8 : 0);
          statusTxt = ok ? '✓ 区段空闲：半波脉动直流驱动 JZXC-480(8-7) 吸起 ↑' : st.ctrl.shunt ? '🔴 列车轮对分路：轨压骤降 → GJ↓ 落下！' : '🛡 钢轨折断：受端失压 → GJ↓ 导向安全！';
        } else {
          const isFour = (st.ctrl.capType || 'four') === 'four';
          const openF = !!st.ctrl.openFault;
          ok = !openF || isFour;
          outV = !openF ? 52 : isFour ? 0 : Math.abs(sVal) * 58;
          statusTxt = !openF ? '✓ 滤波电容正常：输出平稳直流' : isFour ? '🛡 四头穿心电容开路 → 串联通道断开，输出物理归零 0V（故障-安全！）' : '⚠ 普通二端电容开路 → 仍向负载输出全波脉动直流（非故障-安全隐患！）';
        }
        dOut += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(oy - outV).toFixed(1)}`;
      }
      g += `<path d="${dIn}" fill="none" stroke="#476c8a" stroke-width="1.5" stroke-dasharray="4 4"/>`;
      g += `<path d="${dOut}" fill="none" stroke="${ok ? '#4ee3a8' : '#ff6b7a'}" stroke-width="2.8"/>`;
      g += `<rect x="586" y="74" width="268" height="176" rx="8" fill="#101b27" stroke="${ok ? '#4ee3a8' : '#ff6b7a'}" stroke-width="2"/>`;
      g += `<text x="602" y="108" style="fill:#9cc0d6;font-size:11px">虚线：输入交流电源波形</text>`;
      g += `<text x="602" y="132" style="fill:${ok ? '#7de0bd' : '#ff8b99'};font-size:11px;font-weight:700">实线：负载/继电器实际波形</text>`;
      g += `<text x="16" y="292" style="fill:${ok ? '#7de0bd' : '#ff8b99'};font-size:11px;font-weight:700">${statusTxt}</text>`;
    } else if (wt === 'phaseTorque25Hz') {
      const deg = Number(st.ctrl.angle ?? 90);
      const rad = (deg * Math.PI) / 180;
      const localOn = !st.ctrl.localOff;
      const torque = localOn ? Math.sin(rad) : 0; // 90° => +1.0, 270° => -1.0
      const picked = torque > 0.55;
      const ox = 50, oy = 165, pw = 490;
      g += `<rect x="${ox}" y="62" width="${pw}" height="200" rx="6" fill="#101a25" stroke="#2c4154"/>`;
      let dL = '', dT = '', d50 = '';
      for (let i = 0; i <= 100; i++) {
        const x = ox + 10 + (i / 100) * (pw - 20);
        const w25 = i * 0.16 - t * 4;
        dL += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(oy - (localOn ? Math.sin(w25) * 52 : 0)).toFixed(1)}`;
        dT += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(oy - Math.sin(w25 + rad) * 52).toFixed(1)}`;
        if (st.ctrl.freq50) d50 += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(oy - Math.sin(w25 * 2) * 24).toFixed(1)}`;
      }
      if (d50) g += `<path d="${d50}" fill="none" stroke="#ff6b7a" stroke-width="1.2" stroke-dasharray="3 3"/>`;
      g += `<path d="${dL}" fill="none" stroke="#70c8ff" stroke-width="2.2"/>`;
      g += `<path d="${dT}" fill="none" stroke="#4ee3a8" stroke-width="2.4"/>`;
      g += `<text x="64" y="82" style="fill:#70c8ff;font-size:10px">蓝：局部25Hz(1-2)</text><text x="190" y="82" style="fill:#4ee3a8;font-size:10px">绿：轨道25Hz(3-4 · Δφ=${deg}°)</text>`;
      if (st.ctrl.freq50) g += `<text x="370" y="82" style="fill:#ff8b99;font-size:10px">红虚：50Hz牵引(平均转矩=0!)</text>`;
      // 右侧转矩表
      g += `<rect x="570" y="72" width="282" height="180" rx="8" fill="#101b27" stroke="${picked ? '#4ee3a8' : '#ff6b7a'}" stroke-width="2"/>`;
      g += `<text x="711" y="102" text-anchor="middle" style="fill:#eef7ff;font-size:12px;font-weight:700">二元二位翼片电磁转矩 T ∝ sin(Δφ)</text>`;
      const barW = Math.abs(torque) * 110;
      g += `<line x1="711" y1="126" x2="711" y2="176" stroke="#8aa8be" stroke-width="2"/>`;
      g += `<rect x="${torque >= 0 ? 711 : 711 - barW}" y="138" width="${barW.toFixed(1)}" height="24" rx="3" fill="${torque > 0.55 ? '#4ee3a8' : torque < -0.1 ? '#ff5268' : '#ffcb47'}"/>`;
      g += `<text x="711" y="204" text-anchor="middle" style="fill:${picked ? '#7de0bd' : '#ff8b99'};font-size:12px;font-weight:700">${!localOn ? '↓ 局部电源断 → T = 0' : picked ? `↑ 正向转矩 +${(torque * 100).toFixed(0)}% → GJ 吸起！` : torque < -0.1 ? `🛡 反向转矩 ${(torque * 100).toFixed(0)}% → 绝缘破损保护 GJ↓！` : `↓ 转矩不足 (${(torque * 100).toFixed(0)}%) → GJ 落下！`}</text>`;
      g += `<text x="16" y="292" style="fill:#8db0c7;font-size:10.5px">物理证明：50 Hz 干扰与 25 Hz 局部线圈频率不同，周期积分平均转矩严格为 0；相邻极性交叉 180° 反相产生负转矩压向后接点！</text>`;
    } else if (wt === 'snjFlasher') {
      const on = !!st.ctrl.ctxj;
      const period = 1.2 * (Number(st.ctrl.rcScale ?? 100) / 100);
      const flashHi = on && ((t % period) < period * 0.5);
      g += `<rect x="70" y="76" width="210" height="72" rx="8" fill="${on ? '#14382d' : '#131e2a'}" stroke="${on ? '#4ee3a8' : '#3a5166'}" stroke-width="2"/>`;
      g += `<text x="175" y="108" text-anchor="middle" style="fill:#eef7ff;font-size:12px;font-weight:700">CTXJ (侧线 18# 通过)</text>`;
      g += `<text x="175" y="130" text-anchor="middle" style="fill:${on ? '#7de0bd' : '#7b95ab'};font-size:10.5px">${on ? '↑ 吸起 (11FBJ·10FBJ·LXJ)' : '↓ 落下'}</text>`;
      g += `<line x1="280" y1="112" x2="360" y2="112" stroke="${on ? '#4ee3a8' : '#3a5166'}" stroke-width="2.5"/>`;
      g += `<rect x="360" y="76" width="220" height="72" rx="8" fill="${flashHi ? '#3c3114' : '#131e2a'}" stroke="${flashHi ? '#ffcb47' : '#3a5166'}" stroke-width="2"/>`;
      g += `<text x="470" y="106" text-anchor="middle" style="fill:#ffe28a;font-size:12px;font-weight:700">SNJ 闪光继电器 (C1/R1/R2)</text>`;
      g += `<text x="470" y="128" text-anchor="middle" style="fill:${flashHi ? '#ffcb47' : '#8aa5b8'};font-size:10.5px">${on ? (flashHi ? '✦ 脉冲吸起 (SNJ↑)' : '○ RC缓放回落 (SNJ↓)') : '待机停止'}</text>`;
      // 进站信号机灯位预览 USU
      g += `<rect x="650" y="56" width="160" height="190" rx="14" fill="#101822" stroke="#536b82" stroke-width="2"/>`;
      g += `<circle cx="705" cy="94" r="16" fill="${flashHi ? '#ffcb47' : '#2a2414'}" stroke="#8aa5b8"/><text x="755" y="99" style="fill:#ffcb47;font-size:11px;font-weight:700">U1 ${on ? '✦闪' : '灭'}</text>`;
      g += `<circle cx="705" cy="142" r="16" fill="#1b2632" stroke="#4a647a"/><text x="755" y="147" style="fill:#6c889e;font-size:10.5px">L / H</text>`;
      g += `<circle cx="705" cy="190" r="16" fill="${on ? '#ffcb47' : '#2a2414'}" stroke="#8aa5b8"/><text x="755" y="195" style="fill:#ffcb47;font-size:11px;font-weight:700">U2 ${on ? '●稳亮' : '灭'}</text>`;
      g += `<text x="16" y="292" style="fill:#8db0c7;font-size:10.5px">自激原理：CTXJ 1前 → SNJ 5后接通线圈充 C1，SNJ↑ 后 5后断开靠 C1/R1/R2 缓放再回落，形成周期 ${period.toFixed(2)}s 稳定闪光！</text>`;
    } else if (wt === 'optocoupler4') {
      const subM = st.ctrl.subMode || 'a';
      const jUp = !!st.ctrl.jUp;
      const flt = st.ctrl.ocFault || 'none';
      if (subM === 'a') {
        const bits = [0, 1, 2, 3].map(idx => {
          const inv = idx % 2 === 0; // OC1/OC3 反相上拉，OC2/OC4 同相下拉！
          if (flt === `oc${idx + 1}_open`) return inv ? '1' : '0';
          if (flt === `oc${idx + 1}_short`) return inv ? '0' : '1';
          return inv ? (jUp ? '0' : '1') : (jUp ? '1' : '0');
        });
        const code = bits.join('');
        const legal = code === '0101' || code === '1010';
        bits.forEach((b, i) => {
          const bx = 55 + i * 200;
          const inv = i % 2 === 0;
          const isBad = flt.startsWith(`oc${i + 1}_`);
          g += `<rect x="${bx}" y="70" width="174" height="128" rx="8" fill="${isBad ? '#3f1c24' : '#111d2a'}" stroke="${isBad ? '#ff6b7a' : '#4ee3a8'}" stroke-width="2"/>`;
          g += `<text x="${bx + 87}" y="96" text-anchor="middle" style="fill:#eef7ff;font-size:13px;font-weight:700">OC${i + 1}（端口${['①','②','③','④'][i]}）</text>`;
          g += `<text x="${bx + 87}" y="118" text-anchor="middle" style="fill:#9cc0d6;font-size:10px">${inv ? '集电极上拉反相 (开1/短0)' : '射极下拉同相 (开0/短1)'}</text>`;
          g += `<text x="${bx + 87}" y="158" text-anchor="middle" style="fill:${isBad ? '#ff8b99' : '#7de0bd'};font-size:26px;font-weight:800">${b}</text>`;
          g += `<text x="${bx + 87}" y="182" text-anchor="middle" style="fill:#8aa8be;font-size:9.5px">${isBad ? '⚡ 已注入故障!' : '工作正常'}</text>`;
        });
        g += `<text x="440" y="242" text-anchor="middle" style="fill:${legal ? '#7de0bd' : '#ff8b99'};font-size:14px;font-weight:800">采集码 ①②③④ = 【${code}】 → ${code === '0101' ? '🟢 合法吸起码 (J↑)' : code === '1010' ? '🔵 合法落下码 (J↓)' : '🛡 检出非法故障码！导向安全判 J↓！'}</text>`;
        g += `<text x="16" y="292" style="fill:#8db0c7;font-size:10.5px">硬件精髓：OC1/OC3 反相与 OC2/OC4 射极同相交替排列，任意单光耦开路或短路均立即破坏 1010/0101 互补对称！</text>`;
      } else {
        // (b) 动态双光耦脉冲采集
        const pulseOut = jUp && flt === 'none';
        const ox = 50, oy1 = 128, oy2 = 222, pw = 780;
        let d1 = '', d2 = '';
        for (let i = 0; i <= 120; i++) {
          const x = ox + (i / 120) * pw;
          const sq = Math.sin(i * 0.45 - t * 8) > 0 ? 1 : 0;
          d1 += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(oy1 - sq * 36).toFixed(1)}`;
          d2 += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(oy2 - (pulseOut ? sq * 36 : 0)).toFixed(1)}`;
        }
        g += `<text x="54" y="76" style="fill:#70c8ff;font-size:11px;font-weight:700">计算机送出动态采样脉冲 → R1 → OC1 → 现场 J 前接点 → OC2 回读：</text>`;
        g += `<path d="${d1}" fill="none" stroke="#70c8ff" stroke-width="2.4"/>`;
        g += `<text x="54" y="172" style="fill:${pulseOut ? '#4ee3a8' : '#ff8b99'};font-size:11px;font-weight:700">回读输入端口波形：${pulseOut ? '✓ 收到同步匹配动态脉冲 → 判定现场 J↑ 闭合！' : '🛡 无匹配脉冲（J↓ 或光耦故障卡死）→ 导向安全判 J↓！'}</text>`;
        g += `<path d="${d2}" fill="none" stroke="${pulseOut ? '#4ee3a8' : '#ff6b7a'}" stroke-width="2.6"/>`;
      }
    } else if (wt === 'pulseTransformer' || wt === 'chargePump') {
      const m = st.ctrl.cpuMode || 'pulse';
      const isOk = m === 'pulse';
      const ox = 50, oy1 = 122, oy2 = 228, pw = 540;
      g += `<rect x="${ox}" y="58" width="${pw}" height="205" rx="6" fill="#101a25" stroke="#2c4154"/>`;
      let d1 = '', d2 = '';
      for (let i = 0; i <= 100; i++) {
        const x = ox + 10 + (i / 100) * (pw - 20);
        const sq = m === 'stuck1' ? 1 : m === 'stuck0' ? 0 : (Math.sin(i * 0.42 - t * 8) > 0 ? 1 : 0);
        d1 += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(oy1 - sq * 40).toFixed(1)}`;
        const v2 = isOk ? (wt === 'chargePump' ? 38 + Math.sin(i * 0.42 - t * 8) * 5 : 42) : 0;
        d2 += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(oy2 - v2).toFixed(1)}`;
      }
      g += `<text x="64" y="76" style="fill:#70c8ff;font-size:10.5px;font-weight:700">上轨：联锁 CPU 输出口 (${m === 'pulse' ? '动态交变方波' : m === 'stuck1' ? '⚡死机卡死常高1!' : m === 'stuck0' ? '⚡停机常低0' : '故障态'})</text>`;
      g += `<path d="${d1}" fill="none" stroke="#70c8ff" stroke-width="2.4"/>`;
      g += `<text x="64" y="176" style="fill:${isOk ? '#4ee3a8' : '#ff8b99'};font-size:10.5px;font-weight:700">下轨：${wt === 'pulseTransformer' ? '变压器次级整流后驱动 J 电压' : '电荷泵储能电容 C2 驱动偏极 J 电压'}</text>`;
      g += `<path d="${d2}" fill="none" stroke="${isOk ? '#4ee3a8' : '#ff6b7a'}" stroke-width="2.6"/>`;
      g += `<rect x="615" y="70" width="240" height="182" rx="8" fill="#101b27" stroke="${isOk ? '#4ee3a8' : '#ff6b7a'}" stroke-width="2"/>`;
      g += `<text x="735" y="112" text-anchor="middle" style="fill:#eef7ff;font-size:13px;font-weight:700">执行安全继电器 J</text>`;
      g += `<text x="735" y="156" text-anchor="middle" style="fill:${isOk ? '#4ee3a8' : '#ff8b99'};font-size:22px;font-weight:800">${isOk ? '↑ 吸起' : '↓ 落下'}</text>`;
      g += `<text x="735" y="196" text-anchor="middle" style="fill:#9cc0d6;font-size:10.5px">${isOk ? '持续交流泵能维持输出' : '直流/故障下能量立即归零!'}</text>`;
      g += `<text x="735" y="220" text-anchor="middle" style="fill:#7de0bd;font-size:10px">${wt === 'pulseTransformer' ? '物理铁律：e = -N·dΦ/dt' : '低充 C1 ⇄ 高经 D2 泵 C2'}</text>`;
    }

    return `<svg viewBox="0 0 880 310" class="fig-svg" role="img" aria-label="${fig.title}">${g}</svg>`;
  }

  function renderRackSvg(fig, st) {
    const rt = fig.rackType;
    let g = `<rect x="0" y="0" width="880" height="310" rx="8" fill="#0c141d"/>`;
    g += `<text x="16" y="22" style="fill:#9cc0d6;font-size:11.5px;font-weight:600">${fig.title} ｜ 交互设备仿真</text>`;

    if (rt === 'console6502' || rt === 'sgaPanel') {
      const lit = !!st.consoleRoute;
      const yza = !!st.consoleYza;
      g += `<rect x="40" y="42" width="800" height="156" rx="10" fill="#131e28" stroke="#3c566d" stroke-width="2"/>`;
      // 模拟站场光带
      const bandCol = yza ? '#ffcb47' : lit ? '#eaf5ff' : '#2d4558';
      g += `<line x1="90" y1="120" x2="790" y2="120" stroke="${bandCol}" stroke-width="${lit || yza ? 6 : 4}" stroke-linecap="round"/>`;
      g += `<line x1="480" y1="120" x2="550" y2="76" stroke="#32485c" stroke-width="4"/><line x1="550" y1="76" x2="770" y2="76" stroke="#32485c" stroke-width="4"/>`;
      g += `<circle cx="150" cy="100" r="9" fill="${lit ? '#4ee3a8' : '#ff5268'}" stroke="#fff"/><text x="150" y="84" text-anchor="middle" style="fill:#eef7ff;font-size:10px">X 复示灯</text>`;
      g += `<text x="310" y="106" text-anchor="middle" style="fill:#9cc0d6;font-size:10px">1DG · 1/7G · 7-11DG ${lit ? '(白光带锁闭!)' : yza ? '(引导总锁闭!)' : '(空闲灭灯)'}</text>`;
      g += `<text x="680" y="106" text-anchor="middle" style="fill:#9cc0d6;font-size:10px">ⅠG 正线股道</text>`;
      // 可点击按钮
      const btns = rt === 'sgaPanel'
        ? [['sga_go', '🔓 按压 SGA + ZRA 破铅封区故解', '#1d3c30', '#4ee3a8'], ['sga_lock', '🔒 模拟分路遗留白光带', '#3b2e16', '#ffcb47']]
        : [['btn_route', '🟢 按 XLA + SⅠLA 办接车进路', '#153a2e', '#4ee3a8'], ['btn_zqa', '⏹ 按 ZQA 总取消', '#192b3d', '#70c8ff'], ['btn_yza', '⚠ 按 YZA 引导总锁闭', '#3d2c15', '#ffcb47']];
      btns.forEach(([bid, lbl, fl, sk], idx) => {
        const bx = 56 + idx * 265;
        g += `<g data-rack-btn="${bid}" style="cursor:pointer"><rect x="${bx}" y="220" width="246" height="44" rx="7" fill="${fl}" stroke="${sk}" stroke-width="1.8"/><text x="${bx + 123}" y="246" text-anchor="middle" style="fill:#eef7ff;font-size:11.5px;font-weight:700">${lbl}</text></g>`;
      });
      g += `<text x="16" y="294" style="fill:#7de0bd;font-size:10.5px">控制台实时状态：${yza ? '⚠ 全咽喉引导总锁闭中（YZSJ↓，全咽喉道岔锁闭）' : lit ? '✓ 已建立 X→ⅠG 进路：白光带点亮、X 绿复示灯亮！' : '○ 常态待机（点击上方按钮实操 6502 控制台）'}</text>`;
    } else if (rt === 'relayRack') {
      const layers = ['零层(11层)：电源端子与熔断器', '10层：F 方向组合', '9层：DY 电源/时间组合', '8层：LXZ 进站主组合', '7层：1LXF 进站辅组合', '6层：YX 引导信号组合', '5层：DX 调车组合', '4层：Q 区段组合(7-11DG)', '3层：DD 单动道岔组合(11#)', '2层：SDZ 双动主组合(1/3)', '1层：SDF 双动辅组合(1/3)'];
      layers.forEach((lbl, i) => {
        const y = 38 + i * 23;
        const sel = st.rackSel === i;
        g += `<g data-rack-sel="${i}" style="cursor:pointer"><rect x="46" y="${y}" width="370" height="20" rx="3" fill="${sel ? '#174033' : i === 0 ? '#2b2414' : '#131e2a'}" stroke="${sel ? '#4ee3a8' : '#354b5e'}"/>`;
        g += `<text x="58" y="${y + 14}" style="fill:${sel ? '#7de0bd' : '#cfe3f2'};font-size:10px;font-weight:${sel ? 700 : 400}">${lbl}</text></g>`;
      });
      g += `<rect x="448" y="42" width="396" height="248" rx="8" fill="#101b27" stroke="#4ee3a8" stroke-width="1.8"/>`;
      g += `<text x="468" y="76" style="fill:#7de0bd;font-size:13px;font-weight:700">当前选中层：${layers[st.rackSel] || layers[0]}</text>`;
      g += `<text x="468" y="112" style="fill:#cfe3f2;font-size:11px">• 6502 组合架标准结构：共 11 层</text>`;
      g += `<text x="468" y="138" style="fill:#cfe3f2;font-size:11px">• 第 1–10 层：每层配置 1 套定型组合 (0–9 槽)</text>`;
      g += `<text x="468" y="164" style="fill:#cfe3f2;font-size:11px">• 第 11 层 (零层)：集中布置熔断器与外线端子</text>`;
      g += `<text x="468" y="198" style="fill:#9cc0d6;font-size:10.5px">点击左侧任意组合架层即可逐层查验定型组合用途！</text>`;
    } else if (rt === 'powerScreen') {
      const mOk = !st.powerMainFail, bOk = !st.powerBackupFail;
      const anyOk = mOk || bOk;
      g += `<g data-rack-btn="pwr_m" style="cursor:pointer"><rect x="40" y="54" width="175" height="68" rx="7" fill="${mOk ? '#14382d' : '#3f1c24'}" stroke="${mOk ? '#4ee3a8' : '#ff6b7a'}" stroke-width="2"/><text x="127" y="84" text-anchor="middle" style="fill:#eef7ff;font-size:11.5px;font-weight:700">Ⅰ路主电源 AC380V</text><text x="127" y="106" text-anchor="middle" style="fill:${mOk ? '#7de0bd' : '#ff8b99'};font-size:10px">${mOk ? '✓ 正常供电(点击模拟断电)' : '✕ 断电故障!'}</text></g>`;
      g += `<g data-rack-btn="pwr_b" style="cursor:pointer"><rect x="40" y="156" width="175" height="68" rx="7" fill="${bOk ? '#14382d' : '#3f1c24'}" stroke="${bOk ? '#4ee3a8' : '#ff6b7a'}" stroke-width="2"/><text x="127" y="186" text-anchor="middle" style="fill:#eef7ff;font-size:11.5px;font-weight:700">Ⅱ路副电源 AC380V</text><text x="127" y="208" text-anchor="middle" style="fill:${bOk ? '#7de0bd' : '#ff8b99'};font-size:10px">${bOk ? '✓ 热备正常(点击模拟断电)' : '✕ 断电故障!'}</text></g>`;
      g += `<rect x="275" y="96" width="170" height="86" rx="8" fill="${anyOk ? '#152b3b' : '#3f1c24'}" stroke="${anyOk ? '#70c8ff' : '#ff6b7a'}" stroke-width="2"/><text x="360" y="132" text-anchor="middle" style="fill:#eef7ff;font-size:11.5px;font-weight:700">双路自动切换 + 稳压</text><text x="360" y="156" text-anchor="middle" style="fill:#7de0bd;font-size:10px">${mOk ? '当前由 Ⅰ路主供' : bOk ? '⚡ 自动切至 Ⅱ路副供!' : '✕ 双路全失电!'}</text>`;
      [['DC 220V (ZD6 直流转辙机)', 48], ['AC 380V (S700K 三相转辙机)', 94], ['DC 24V (KZ/KF 继电逻辑)', 140], ['AC 220V (信号机点灯 BX-30)', 186], ['AC 24V/110V (轨道/表示)', 232]].forEach(([nm, yy]) => {
        g += `<line x1="445" y1="139" x2="520" y2="${yy + 18}" stroke="${anyOk ? '#4ee3a8' : '#3a5166'}" stroke-width="2"/>`;
        g += `<rect x="520" y="${yy}" width="320" height="36" rx="5" fill="${anyOk ? '#133128' : '#28181e'}" stroke="${anyOk ? '#4ee3a8' : '#ff6b7a'}"/><text x="536" y="${yy + 22}" style="fill:${anyOk ? '#e8fff6' : '#ff8b99'};font-size:11px;font-weight:600">${anyOk ? '✓ ' : '✕ '}${nm}</text>`;
      });
    } else {
      // system6502 / comboWiring
      const items = rt === 'comboWiring'
        ? [['LXZ + 1LXF + YX', '进站信号 X / X_F'], ['Q 区段组合', '1DG / 1/7G / 7-11DG'], ['SDZ + SDF', '双动道岔 1/3 · 5/7'], ['DD 单动组合', '单动道岔 9 / 11'], ['DX / DXF', '调车 D1 / D3 / D5 / D7'], ['F + DY', '咽喉共用方向与电源']]
        : [['单元控制台', '双按钮操作与站场光带'], ['区段人工解锁盘', 'SGA+ZRA 破铅封区故解'], ['继电器组合架', '1–15 线全站联锁逻辑'], ['室内外分线盘', '防雷隔离接入室外电缆'], ['电源屏', '双路交直流稳压供电'], ['室外三大设备', '信号机 / 转辙机 / 轨道']];
      items.forEach(([t1, t2], i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const bx = 42 + col * 274, by = 54 + row * 116;
        const sel = st.rackSel === i;
        g += `<g data-rack-sel="${i}" style="cursor:pointer"><rect x="${bx}" y="${by}" width="250" height="88" rx="8" fill="${sel ? '#163c30' : '#121d29'}" stroke="${sel ? '#4ee3a8' : '#3e5a72'}" stroke-width="2"/>`;
        g += `<text x="${bx + 125}" y="${by + 36}" text-anchor="middle" style="fill:#eef7ff;font-size:13px;font-weight:700">${t1}</text>`;
        g += `<text x="${bx + 125}" y="${by + 62}" text-anchor="middle" style="fill:#9cc0d6;font-size:10.5px">${t2}</text></g>`;
      });
      g += `<text x="16" y="294" style="fill:#7de0bd;font-size:10.5px">已选模块：【${items[st.rackSel % items.length][0]}】— ${items[st.rackSel % items.length][1]}（全部通过 1–15 条站场型网路线束并联贯通！）</text>`;
    }

    return `<svg viewBox="0 0 880 310" class="fig-svg" role="img" aria-label="${fig.title}">${g}</svg>`;
  }

  // ==================== 5. 引擎 C：系统架构 / 可执行流程图 / HMI / 冗余容错 SVG 渲染器 ====================
  function renderArchSvg(fig, st) {
    let g = `<rect x="0" y="0" width="880" height="320" rx="8" fill="#0c141d"/>`;
    g += `<text x="16" y="20" style="fill:#9cc0d6;font-size:11px;font-weight:600">${fig.title} ｜ PDF p.${fig.page}</text>`;
    const nodeMap = {};
    (fig.nodes || []).forEach(n => { nodeMap[n.id] = n; });
    const dashOff = -((labState.animT * 34) % 24);

    // 绘制连线与数据包流动
    for (const lk of (fig.links || [])) {
      const a = nodeMap[lk.from], b = nodeMap[lk.to];
      if (!a || !b) continue;
      const on = lk.activeWhen ? lk.activeWhen(st.ctrl) : true;
      const ax = a.x + a.w / 2, ay = a.y + a.h / 2;
      const bx = b.x + b.w / 2, by = b.y + b.h / 2;
      g += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${on ? '#4ee3a8' : '#ff5268'}" stroke-width="${on ? 2.6 : 1.8}" stroke-dasharray="${on ? '8 5' : '3 5'}" stroke-dashoffset="${on ? dashOff.toFixed(1) : 0}"/>`;
      const lbl = typeof lk.label === 'function' ? lk.label(st.ctrl) : lk.label;
      if (lbl) {
        const mx = (ax + bx) / 2, my = (ay + by) / 2 - 6;
        g += `<rect x="${mx - 44}" y="${my - 11}" width="88" height="16" rx="3" fill="#0d1620"/><text x="${mx}" y="${my + 1}" text-anchor="middle" style="fill:${on ? '#a3f0d3' : '#ff9aa8'};font-size:9px">${lbl}</text>`;
      }
    }

    // 绘制模块节点
    for (const n of (fig.nodes || [])) {
      const fault = n.faultKey && st.ctrl[n.faultKey];
      const fill = fault ? '#3f1c24' : n.role === 'core' ? '#132d28' : n.role === 'ui' ? '#142436' : n.role === 'field' ? '#1a241e' : '#17222e';
      const stroke = fault ? '#ff6b7a' : n.role === 'core' ? '#4ee3a8' : n.role === 'ui' ? '#70c8ff' : '#58768f';
      const title = typeof n.title === 'function' ? n.title(st.ctrl) : n.title;
      const sub = typeof n.sub === 'function' ? n.sub(st.ctrl) : (n.sub || '');
      g += `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
      const tLines = title.split('\n');
      tLines.forEach((tl, ti) => {
        g += `<text x="${n.x + n.w / 2}" y="${n.y + 21 + ti * 14}" text-anchor="middle" style="fill:#eef7ff;font-size:11px;font-weight:700">${tl}</text>`;
      });
      const sLines = sub.split('\n');
      const sStart = n.y + 24 + tLines.length * 14;
      sLines.forEach((sl, si) => {
        if (sStart + si * 13 < n.y + n.h - 4) {
          g += `<text x="${n.x + n.w / 2}" y="${sStart + si * 13}" text-anchor="middle" style="fill:${fault ? '#ff9aa8' : '#9cc0d6'};font-size:9.5px">${sl}</text>`;
        }
      });
    }
    return `<svg viewBox="0 0 880 320" class="fig-svg" role="img" aria-label="${fig.title}">${g}</svg>`;
  }

  function renderFlowchartSvg(fig, st) {
    const tr = fig.trace ? fig.trace(st.ctrl) : [];
    const curIdx = Math.min(tr.length - 1, Math.max(0, st.stepIdx));
    const visited = new Set(tr.slice(0, curIdx + 1));
    const curNodeId = tr[curIdx];
    const nodeMap = {};
    (fig.nodes || []).forEach(n => { nodeMap[n.id] = n; });

    let g = `<rect x="0" y="0" width="880" height="315" rx="8" fill="#0c141d"/>`;
    g += `<text x="16" y="20" style="fill:#9cc0d6;font-size:11px;font-weight:600">${fig.title} ｜ 软件可执行流程图（步骤 ${curIdx + 1}/${tr.length}）</text>`;

    // 绘制边（按连续执行对 (tr[k] -> tr[k+1]) 严格匹配）
    const activePairs = new Set();
    for (let k = 0; k < curIdx; k++) activePairs.add(`${tr[k]}->${tr[k + 1]}`);
    for (const e of (fig.edges || [])) {
      const a = nodeMap[e.from], b = nodeMap[e.to];
      if (!a || !b) continue;
      const inPath = activePairs.has(`${e.from}->${e.to}`);
      const ax = a.x + a.w / 2, ay = a.y + a.h / 2;
      const bx = b.x + b.w / 2, by = b.y + b.h / 2;
      g += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${inPath ? '#4ee3a8' : '#354b5e'}" stroke-width="${inPath ? 3 : 1.6}"/>`;
      if (e.label) {
        const mx = (ax + bx) / 2, my = (ay + by) / 2 - 5;
        g += `<rect x="${mx - 28}" y="${my - 10}" width="56" height="14" rx="3" fill="#0c141d"/><text x="${mx}" y="${my + 1}" text-anchor="middle" style="fill:${inPath ? '#7de0bd' : '#8aa5b8'};font-size:9px;font-weight:700">${e.label}</text>`;
      }
    }

    // 绘制流程图节点（过程矩形 / 菱形判断 / 终止圆角）
    for (const n of (fig.nodes || [])) {
      const isCur = n.id === curNodeId, isVis = visited.has(n.id);
      const fill = n.kind === 'fail' && isVis ? '#441d25' : isCur ? '#164133' : isVis ? '#142a38' : '#121c27';
      const stroke = n.kind === 'fail' && isVis ? '#ff6b7a' : isCur ? '#4ee3a8' : isVis ? '#70c8ff' : '#3c5469';
      if (n.kind === 'dec') {
        const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
        g += `<polygon points="${cx},${n.y - 4} ${n.x + n.w + 4},${cy} ${cx},${n.y + n.h + 4} ${n.x - 4},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="${isCur ? 2.4 : 1.6}"/>`;
      } else {
        g += `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${n.kind === 'end' || n.kind === 'fail' ? 18 : 6}" fill="${fill}" stroke="${stroke}" stroke-width="${isCur ? 2.4 : 1.6}"/>`;
      }
      g += `<text x="${n.x + n.w / 2}" y="${n.y + n.h / 2 - 3}" text-anchor="middle" style="fill:#eef7ff;font-size:10.5px;font-weight:700">${n.title}</text>`;
      if (n.sub) g += `<text x="${n.x + n.w / 2}" y="${n.y + n.h / 2 + 13}" text-anchor="middle" style="fill:#9cc0d6;font-size:9px">${n.sub}</text>`;
    }
    const cn = nodeMap[curNodeId];
    g += `<text x="16" y="302" style="fill:#7de0bd;font-size:10.5px;font-weight:600">当前执行节点：【${cn ? cn.title : ''}】${cn && cn.sub ? ' — ' + cn.sub : ''}（切换上方判断条件复选框，验证不同软件分支走向！）</text>`;
    return `<svg viewBox="0 0 880 315" class="fig-svg" role="img" aria-label="${fig.title}">${g}</svg>`;
  }

  function renderHmiSvg(fig, st) {
    const lit = !!st.consoleRoute;
    const locked = !!st.consoleYza;
    const nowStr = new Date().toTimeString().slice(0, 8);
    let g = `<rect x="0" y="0" width="880" height="315" rx="8" fill="#080e15" stroke="#2c445a"/>`;
    // 顶部报警与状态栏
    g += `<rect x="12" y="10" width="856" height="36" rx="4" fill="#101d2b" stroke="#2f4a63"/>`;
    g += `<text x="24" y="33" style="fill:#7de0bd;font-size:11px;font-weight:700">① 顶部状态/报警栏：Ⅰ系主用同步 · Ⅱ系热备正常 ｜ 报警：${locked ? '⚠ 11# 道岔已单锁' : '无故障报警'}</text>`;
    g += `<text x="854" y="33" text-anchor="end" style="fill:#ffcb47;font-size:11px;font-family:monospace">${nowStr}</text>`;
    // 中央站场显示区
    g += `<rect x="12" y="54" width="856" height="192" rx="4" fill="#0b131c" stroke="#2c445a"/>`;
    g += `<text x="24" y="74" style="fill:#6c8ca3;font-size:10px">② 中央站场图形显示与鼠标点击操作区（示例站场 X → ⅠG / 3G）</text>`;
    g += `<line x1="70" y1="150" x2="810" y2="150" stroke="${lit ? '#eef7ff' : '#355068'}" stroke-width="${lit ? 5.5 : 4}"/>`;
    g += `<line x1="480" y1="150" x2="550" y2="104" stroke="#355068" stroke-width="4"/><line x1="550" y1="104" x2="790" y2="104" stroke="#355068" stroke-width="4"/>`;
    g += `<circle cx="150" cy="130" r="8" fill="${lit ? '#ffcb47' : '#ff5268'}" stroke="#fff"/><text x="150" y="114" text-anchor="middle" style="fill:#eef7ff;font-size:10px">X(${lit ? 'U' : 'H'})</text>`;
    g += `<text x="330" y="138" text-anchor="middle" style="fill:#9cc0d6;font-size:10px">1DG · 1/7G · 7-11DG</text><text x="680" y="138" text-anchor="middle" style="fill:#9cc0d6;font-size:10px">ⅠG 正线</text>`;
    g += `<text x="680" y="96" text-anchor="middle" style="fill:#9cc0d6;font-size:10px">3G 侧线</text>`;
    if (locked) g += `<circle cx="480" cy="150" r="14" fill="none" stroke="#ffcb47" stroke-width="2.5"/><text x="480" y="178" text-anchor="middle" style="fill:#ffcb47;font-size:10px">11# 单锁</text>`;
    // 底部功能按钮栏
    g += `<rect x="12" y="254" width="856" height="50" rx="4" fill="#101d2b" stroke="#2f4a63"/>`;
    g += `<text x="24" y="272" style="fill:#8aa8be;font-size:9.5px">③ 底部辅助按钮、提示与时钟栏：</text>`;
    [['btn_route', '办理 X→ⅠG 接车'], ['btn_zqa', '总取消 ZQA'], ['btn_yza', '道岔单锁/解锁']].forEach(([bid, lbl], idx) => {
      const bx = 210 + idx * 195;
      g += `<g data-rack-btn="${bid}" style="cursor:pointer"><rect x="${bx}" y="264" width="176" height="30" rx="5" fill="#183247" stroke="#5aa9d6"/><text x="${bx + 88}" y="283" text-anchor="middle" style="fill:#eef7ff;font-size:10.5px;font-weight:700">${lbl}</text></g>`;
    });
    return `<svg viewBox="0 0 880 315" class="fig-svg" role="img" aria-label="${fig.title}">${g}</svg>`;
  }

  function renderRedundancySvg(fig, st) {
    const rt = fig.redType;
    const f = st.redFaults;
    let g = `<rect x="0" y="0" width="880" height="315" rx="8" fill="#0c141d"/>`;
    g += `<text x="16" y="22" style="fill:#9cc0d6;font-size:11.5px;font-weight:600">${fig.title} ｜ 点击任意单元/光纤链路注入故障</text>`;
    let verdict = '';

    if (rt === 'dualRing') {
      const modeB = st.redMode === 'b';
      const cutTop = !!st.ringCut.top, cutBot = !!st.ringCut.bot;
      const alive = !(cutTop && cutBot);
      const nodes = [{ id: '控显', x: 160, y: 155 }, { id: '联锁Ⅰ', x: 440, y: 68 }, { id: 'ET终端', x: 720, y: 155 }, { id: '联锁Ⅱ', x: 440, y: 242 }];
      // 外环(工作环)与内环(备用/反向自愈环)
      g += `<ellipse cx="440" cy="155" rx="280" ry="88" fill="none" stroke="${cutTop ? '#ff5268' : '#4ee3a8'}" stroke-width="3.5" ${cutTop ? 'stroke-dasharray="6 6"' : ''}/>`;
      g += `<ellipse cx="440" cy="155" rx="242" ry="64" fill="none" stroke="${cutBot ? '#ff5268' : modeB ? '#70c8ff' : '#d5ad70'}" stroke-width="2.5" stroke-dasharray="${cutBot ? '4 6' : '8 4'}"/>`;
      nodes.forEach(n => {
        g += `<rect x="${n.x - 52}" y="${n.y - 20}" width="104" height="40" rx="7" fill="#142838" stroke="#7de0bd" stroke-width="2"/><text x="${n.x}" y="${n.y + 4}" text-anchor="middle" style="fill:#eef7ff;font-size:11px;font-weight:700">${n.id}</text>`;
      });
      g += `<g data-ring-cut="top" style="cursor:pointer"><rect x="520" y="42" width="160" height="24" rx="4" fill="${cutTop ? '#441d25' : '#132d25'}" stroke="${cutTop ? '#ff6b7a' : '#4ee3a8'}"/><text x="600" y="58" text-anchor="middle" style="fill:#fff;font-size:9.5px">${cutTop ? '✕ 外环光纤已断(点恢复)' : '点击切断外环光纤'}</text></g>`;
      g += `<g data-ring-cut="bot" style="cursor:pointer"><rect x="520" y="246" width="160" height="24" rx="4" fill="${cutBot ? '#441d25' : '#142636'}" stroke="${cutBot ? '#ff6b7a' : '#70c8ff'}"/><text x="600" y="262" text-anchor="middle" style="fill:#fff;font-size:9.5px">${cutBot ? '✕ 内环光纤已断(点恢复)' : '点击切断内环光纤'}</text></g>`;
      verdict = alive
        ? (cutTop || cutBot ? (modeB ? '✓ 双工作反向自愈环：断点两侧自动环回绕行，全站零丢包！' : '✓ 一备一用双环：自动倒机切至备用环维持通信！') : '✓ 双环光纤链路全通，冗余监测正常！')
        : '🛡 双环全断：通信超时中断，联锁自动导向安全关闭信号！';
    } else if (rt === 'dualBus') {
      const cutA = !!st.ringCut.a, cutB = !!st.ringCut.b;
      const alive = !(cutA && cutB);
      g += `<g data-ring-cut="a" style="cursor:pointer"><line x1="60" y1="88" x2="820" y2="88" stroke="${cutA ? '#ff5268' : '#4ee3a8'}" stroke-width="4" ${cutA ? 'stroke-dasharray="8 6"' : ''}/><text x="440" y="76" text-anchor="middle" style="fill:${cutA ? '#ff8b99' : '#7de0bd'};font-size:11px;font-weight:700">容错局域网 总线 A（${cutA ? '✕ 断线故障！点击恢复' : '✓ 正常 · 点击注入断线'}）</text></g>`;
      g += `<g data-ring-cut="b" style="cursor:pointer"><line x1="60" y1="226" x2="820" y2="226" stroke="${cutB ? '#ff5268' : '#70c8ff'}" stroke-width="4" ${cutB ? 'stroke-dasharray="8 6"' : ''}/><text x="440" y="250" text-anchor="middle" style="fill:${cutB ? '#ff8b99' : '#8cd8ff'};font-size:11px;font-weight:700">容错局域网 总线 B（${cutB ? '✕ 断线故障！点击恢复' : '✓ 正常 · 点击注入断线'}）</text></g>`;
      ['控显机 A/B', '联锁主机 Ⅰ', '联锁主机 Ⅱ', '电务维护机'].forEach((nm, i) => {
        const bx = 95 + i * 195;
        g += `<line x1="${bx + 60}" y1="88" x2="${bx + 60}" y2="132" stroke="${cutA ? '#553038' : '#4ee3a8'}" stroke-width="2"/>`;
        g += `<line x1="${bx + 60}" y1="184" x2="${bx + 60}" y2="226" stroke="${cutB ? '#553038' : '#70c8ff'}" stroke-width="2"/>`;
        g += `<rect x="${bx}" y="132" width="120" height="52" rx="7" fill="#142536" stroke="#7de0bd" stroke-width="2"/><text x="${bx + 60}" y="162" text-anchor="middle" style="fill:#eef7ff;font-size:11px;font-weight:700">${nm}</text>`;
      });
      verdict = alive ? (cutA || cutB ? '✓ 单总线断线自动由冗余总线承载全部报文，零中断！' : '✓ 双总线 A/B 并行热备通信正常！') : '🛡 A/B 双总线同时断开，安全层超时保护立即启动！';
    } else {
      // 通用可点击节点冗余表决可视化（hotStandby / tmr / twoOfTwo / hotStandbyFull / jd1a / twoByTwoOfTwo / ds6k5b）
      let units = [], outOk = false, outMsg = '';
      if (rt === 'hotStandby' || rt === 'hotStandbyFull' || rt === 'jd1a') {
        units = [
          { id: 'A', label: rt === 'jd1a' ? 'JD-1A 联锁主系 A\n(动态驱采+回读)' : '主用联锁机 A\n(独立检测)', x: 60, y: 60, w: 230, h: 80 },
          { id: 'B', label: rt === 'jd1a' ? 'JD-1A 联锁备系 B\n(同步热备)' : '热备联锁机 B\n(同步运算)', x: 60, y: 170, w: 230, h: 80 },
          { id: 'SW', label: '安全倒机切换单元\n(仅主系输出至 J)', x: 370, y: 115, w: 200, h: 80 }
        ];
        const aOk = !f.A, bOk = !f.B, swOk = !f.SW;
        outOk = swOk && (aOk || bOk);
        outMsg = !swOk ? '✕ 切换单元故障 → 安全切断!' : aOk ? '🟢 A 机主用输出（B 机热备）' : bOk ? '🟡 A 机故障 → 无扰切至 B 机主用！' : '🛡 双机全故障 → 切断输出导向安全！';
      } else if (rt === 'tmr') {
        units = [
          { id: 'A', label: '计算通道 A', x: 60, y: 46, w: 200, h: 56 },
          { id: 'B', label: '计算通道 B', x: 60, y: 122, w: 200, h: 56 },
          { id: 'C', label: '计算通道 C', x: 60, y: 198, w: 200, h: 56 },
          { id: 'V', label: '故障-安全三取二表决器\n(2oo3 Majority Voter)', x: 340, y: 110, w: 225, h: 82 }
        ];
        const cnt = (!f.A ? 1 : 0) + (!f.B ? 1 : 0) + (!f.C ? 1 : 0);
        outOk = !f.V && cnt >= 2;
        outMsg = f.V ? '✕ 表决器故障 → 安全切断!' : cnt === 3 ? '🟢 3/3 一致 → 完美输出' : cnt === 2 ? '🟡 2/3 多数一致 → 自动屏蔽故障机零切换运行！' : '🛡 ≥2 机故障 → 无法达成二致，立即安全停机！';
      } else if (rt === 'twoOfTwo') {
        units = [
          { id: 'A', label: 'CPU A (同输入)', x: 60, y: 62, w: 210, h: 74 },
          { id: 'B', label: 'CPU B (同输入)', x: 60, y: 170, w: 210, h: 74 },
          { id: 'CMP', label: '故障-安全二取二比较器\n(逐比特严格一致)', x: 350, y: 114, w: 220, h: 80 }
        ];
        outOk = !f.A && !f.B && !f.CMP;
        outMsg = outOk ? '🟢 双 CPU 严格一致 → 允许安全输出' : '🛡 二取二比较失配！立即切断输出（极致故障—安全，单系无冗余可用性）！';
      } else {
        // twoByTwoOfTwo / ds6k5b
        units = [
          { id: 'IA', label: rt === 'ds6k5b' ? 'Ⅰ系 F486 CPU-A' : 'Ⅰ系 CPU-A (内2oo2)', x: 50, y: 46, w: 190, h: 50 },
          { id: 'IB', label: rt === 'ds6k5b' ? 'Ⅰ系 F486 CPU-B' : 'Ⅰ系 CPU-B (内2oo2)', x: 50, y: 104, w: 190, h: 50 },
          { id: 'IIA', label: rt === 'ds6k5b' ? 'Ⅱ系 F486 CPU-A' : 'Ⅱ系 CPU-A (热备2oo2)', x: 50, y: 172, w: 190, h: 50 },
          { id: 'IIB', label: rt === 'ds6k5b' ? 'Ⅱ系 F486 CPU-B' : 'Ⅱ系 CPU-B (热备2oo2)', x: 50, y: 230, w: 190, h: 50 },
          { id: 'ET', label: rt === 'ds6k5b' ? '125M 光纤 → ET 五机架 PIO\n(FSCPU 双CPU静态驱采)' : '双系热备输出汇合\n(并联/双采双驱执行)', x: 325, y: 114, w: 245, h: 86 }
        ];
        const s1 = !f.IA && !f.IB, s2 = !f.IIA && !f.IIB;
        outOk = !f.ET && (s1 || s2);
        outMsg = f.ET ? '✕ 电子终端 ET 故障 → 安全切断!' : (s1 && s2) ? '🟢 双系内二取二全同步（最高安全 + 最高可用！）' : (s1 || s2) ? `🟡 ${s1 ? 'Ⅱ系' : 'Ⅰ系'} 脱机，另一系二取二无缝接管运行！` : '🛡 两系均失二取二一致 → 彻底切断驱动导向安全！';
      }
      // 连接总线（左通道 → 中间表决/切换/ET → 右安全输出）
      const midU = units[units.length - 1];
      if (midU) {
        units.slice(0, -1).forEach(u => {
          const ok = !f[u.id];
          g += `<line x1="${u.x + u.w}" y1="${u.y + u.h / 2}" x2="${midU.x}" y2="${midU.y + midU.h / 2}" stroke="${ok ? '#4ee3a8' : '#5e2b35'}" stroke-width="${ok ? 2.2 : 1.5}" ${ok ? '' : 'stroke-dasharray="5 4"'}/>`;
        });
        g += `<line x1="${midU.x + midU.w}" y1="${midU.y + midU.h / 2}" x2="615" y2="155" stroke="${outOk ? '#4ee3a8' : '#ff6b7a'}" stroke-width="3"/>`;
      }
      units.forEach(u => {
        const bad = !!f[u.id];
        g += `<g data-red-unit="${u.id}" style="cursor:pointer"><rect x="${u.x}" y="${u.y}" width="${u.w}" height="${u.h}" rx="7" fill="${bad ? '#441d25' : '#133027'}" stroke="${bad ? '#ff6b7a' : '#4ee3a8'}" stroke-width="2"/>`;
        u.label.split('\n').forEach((ln, li) => {
          g += `<text x="${u.x + u.w / 2}" y="${u.y + 24 + li * 16}" text-anchor="middle" style="fill:${bad ? '#ff9aa8' : '#eef7ff'};font-size:11px;font-weight:700">${ln}</text>`;
        });
        g += `<text x="${u.x + u.w / 2}" y="${u.y + u.h - 8}" text-anchor="middle" style="fill:${bad ? '#ff6b7a' : '#7de0bd'};font-size:9px">${bad ? '✕ 故障(点恢复)' : '✓ 正常(点注故)'}</text></g>`;
      });
      // 输出安全判据框
      g += `<rect x="615" y="96" width="235" height="118" rx="8" fill="${outOk ? '#133128' : '#3f1c24'}" stroke="${outOk ? '#4ee3a8' : '#ff6b7a'}" stroke-width="2.2"/>`;
      g += `<text x="732" y="132" text-anchor="middle" style="fill:#eef7ff;font-size:12.5px;font-weight:700">安全输出与继电器 J</text>`;
      g += `<text x="732" y="172" text-anchor="middle" style="fill:${outOk ? '#4ee3a8' : '#ff8b99'};font-size:18px;font-weight:800">${outOk ? '✓ 允许安全输出' : '✕ 切断导向安全'}</text>`;
      verdict = outMsg;
    }

    g += `<text x="16" y="302" style="fill:#7de0bd;font-size:10.5px;font-weight:600">${verdict}</text>`;
    return `<svg viewBox="0 0 880 315" class="fig-svg" role="img" aria-label="${fig.title}">${g}</svg>`;
  }

  function renderFigureCanvas(fig, st) {
    if (fig.engine === 'yard') return renderYardSvg(fig, st);
    if (fig.engine === 'circuit') {
      if (fig.sub === 'ladder') return renderLadderSvg(fig, st);
      if (fig.sub === 'sequence') return renderSequenceSvg(fig, st);
      if (fig.sub === 'wave') return renderWaveSvg(fig, st);
      if (fig.sub === 'rack') return renderRackSvg(fig, st);
    }
    if (fig.engine === 'sys') {
      if (fig.sub === 'arch') return renderArchSvg(fig, st);
      if (fig.sub === 'flowchart') return renderFlowchartSvg(fig, st);
      if (fig.sub === 'hmi') return renderHmiSvg(fig, st);
      if (fig.sub === 'redundancy') return renderRedundancySvg(fig, st);
    }
    return '';
  }

  // ==================== 6. 动画帧循环（仅在 05 标签页可见时运行） ====================
  function stepAnimation(ts) {
    if (!labState.container || labState.container.hidden) { labState.rafId = 0; return; }
    const dt = labState.lastTs ? Math.min(0.05, (ts - labState.lastTs) / 1000) : 0.016;
    labState.lastTs = ts;
    labState.animT += dt;

    const figs = getAllFigures();
    const fig = figs.find(f => f.id === labState.currentId) || figs[0];
    if (fig) {
      const st = getFigState(fig);
      let needCanvasRedraw = false;

      if (fig.engine === 'yard' && st.playing) {
        const ev = evaluateYard(fig, st);
        if (ev.conflictMsg) {
          st.playing = false;
        } else {
          // 物理动力学速度：避难线上坡减速（与 curV 同源） / 驼峰下坡加速 / 常规匀速
          let rate = 0.14;
          if (fig.physicsMode === 'catchSlope') {
            const kin = catchSlopeKinematics(st);
            if (kin.onCatch && st.trainT >= kin.rampStartT) {
              if (st.trainT >= kin.stopT - 0.002) {
                st.trainT = kin.stopT;
                st.playing = false;
                rate = 0;
              } else {
                rate = Math.max(0.025, 0.16 * (kin.curV / 80));
              }
            } else {
              rate = Math.max(0.08, 0.16 * (kin.v0km / 80));
            }
          } else if (fig.physicsMode === 'hump' && st.trainT > 0.35 && st.trainT < 0.72) {
            rate = 0.24; // 驼峰溜放重力加速段
          }
          if (rate > 0) st.trainT = Math.min(1, st.trainT + dt * rate);
          if (st.trainT >= 1) st.playing = false;
        }
        needCanvasRedraw = true;
      } else if (fig.engine === 'yard' && Object.values(st.clearedAt).some(t0 => t0 >= 0 && (labState.animT - t0) < 3.2)) {
        needCanvasRedraw = true;
      } else if (fig.engine === 'circuit' && fig.sub === 'ladder') {
        solveLadder(fig, st, dt);
        needCanvasRedraw = true; // 流动电流虚线 + 缓放倒计时
      } else if (fig.engine === 'circuit' && fig.sub === 'wave') {
        if (fig.waveType === 'rcDecay') {
          if (st.ctrl.aj) st.rcTimer = 0;
          else st.rcTimer = Math.min(6, (st.rcTimer || 0) + dt);
        }
        needCanvasRedraw = true;
      } else if ((fig.sub === 'sequence' || fig.sub === 'flowchart') && st.seqPlaying) {
        st.seqTimer += dt;
        if (st.seqTimer >= 1.1) {
          st.seqTimer = 0;
          const maxLen = fig.sub === 'sequence' ? (fig.steps || []).length : (fig.trace ? fig.trace(st.ctrl).length : 1);
          if (st.stepIdx < maxLen - 1) st.stepIdx++;
          else st.seqPlaying = false;
          needCanvasRedraw = true;
        }
      } else if (fig.engine === 'sys' && fig.sub === 'arch') {
        needCanvasRedraw = true; // 数据包流动虚线
      }

      if (needCanvasRedraw) {
        const slot = labState.container.querySelector('#fig-canvas-slot');
        if (slot) {
          slot.innerHTML = renderFigureCanvas(fig, st);
          bindCanvasDirectClicks(slot, fig, st);
        }
        if (fig.engine === 'yard') {
          const ySld = labState.container.querySelector('#fig-yard-slider');
          if (ySld) ySld.value = String(Math.round(st.trainT * 100));
          const yPlay = labState.container.querySelector('#fig-yard-play');
          if (yPlay) yPlay.textContent = st.playing ? 'Ⅱ 暂停列车' : (st.trainT >= 0.99 ? '↻ 重新发车演示' : '▶ 发车动态运行');
        }
        if (fig.sub === 'sequence' || fig.sub === 'flowchart') {
          const maxLen = fig.sub === 'sequence' ? (fig.steps || []).length : (fig.trace ? fig.trace(st.ctrl).length : 1);
          const sqPlay = labState.container.querySelector('#fig-seq-play');
          if (sqPlay) sqPlay.textContent = st.seqPlaying ? 'Ⅱ 暂停推演' : '▶ 自动逐步推演';
          const sqNext = labState.container.querySelector('#fig-seq-next');
          if (sqNext) sqNext.textContent = `▶ 下一步 (${Math.min(st.stepIdx + 1, maxLen)}/${maxLen})`;
        }
        const vEl = labState.container.querySelector('#fig-verdict-box');
        if (vEl && fig.verdict) {
          vEl.textContent = fig.engine === 'circuit' && fig.sub === 'ladder' ? fig.verdict(st.inputs, st.relays) : fig.verdict(st.ctrl);
        }
      }
    }
    labState.rafId = root.requestAnimationFrame ? root.requestAnimationFrame(stepAnimation) : 0;
  }

  function ensureRaf() {
    if (!labState.rafId && root.requestAnimationFrame && labState.container && !labState.container.hidden) {
      labState.lastTs = 0;
      labState.rafId = root.requestAnimationFrame(stepAnimation);
    }
  }

  function pause() {
    if (labState.rafId && root.cancelAnimationFrame) root.cancelAnimationFrame(labState.rafId);
    labState.rafId = 0;
  }

  function bindCanvasDirectClicks(slot, fig, st) {
    slot.querySelectorAll('[data-yard-sw]').forEach(el => {
      el.onclick = () => {
        const id = el.dataset.yardSw;
        st.switches[id] = (st.switches[id] || 'N') === 'N' ? 'R' : 'N';
        render(labState.container, { figureId: fig.id }, labState.callbacks);
      };
    });
    slot.querySelectorAll('[data-seq-step]').forEach(el => {
      el.onclick = () => {
        st.seqPlaying = false;
        st.stepIdx = Number(el.dataset.seqStep);
        render(labState.container, { figureId: fig.id }, labState.callbacks);
      };
    });
    slot.querySelectorAll('[data-rack-sel]').forEach(el => {
      el.onclick = () => {
        st.rackSel = Number(el.dataset.rackSel);
        render(labState.container, { figureId: fig.id }, labState.callbacks);
      };
    });
    slot.querySelectorAll('[data-rack-btn]').forEach(el => {
      el.onclick = () => {
        const act = el.dataset.rackBtn;
        if (act === 'btn_route' || act === 'sga_lock') { st.consoleRoute = true; st.consoleYza = false; }
        else if (act === 'btn_zqa' || act === 'sga_go') { st.consoleRoute = false; st.consoleYza = false; }
        else if (act === 'btn_yza') { st.consoleYza = !st.consoleYza; }
        else if (act === 'pwr_m') { st.powerMainFail = !st.powerMainFail; }
        else if (act === 'pwr_b') { st.powerBackupFail = !st.powerBackupFail; }
        render(labState.container, { figureId: fig.id }, labState.callbacks);
      };
    });
    slot.querySelectorAll('[data-red-unit]').forEach(el => {
      el.onclick = () => {
        const u = el.dataset.redUnit;
        st.redFaults[u] = !st.redFaults[u];
        render(labState.container, { figureId: fig.id }, labState.callbacks);
      };
    });
    slot.querySelectorAll('[data-ring-cut]').forEach(el => {
      el.onclick = () => {
        const k = el.dataset.ringCut;
        st.ringCut[k] = !st.ringCut[k];
        render(labState.container, { figureId: fig.id }, labState.callbacks);
      };
    });
  }

  // ==================== 7. 主页面渲染器 ====================
  function render(container, appState, callbacks) {
    if (!container) return;
    labState.container = container;
    labState.callbacks = callbacks || {};
    const allFigs = getAllFigures();
    if (appState && appState.figChapter) {
      labState.chFilter = String(appState.figChapter);
      labState.engFilter = 'all';
      labState.search = '';
      if (!appState.figureId) {
        const firstChFig = allFigs.find(f => f.ch === Number(appState.figChapter));
        if (firstChFig) labState.currentId = firstChFig.id;
      }
    }
    if (appState && appState.figureId && allFigs.some(f => f.id === appState.figureId)) {
      labState.currentId = appState.figureId;
    }
    const fig = allFigs.find(f => f.id === labState.currentId) || allFigs[0];
    if (!fig) return;
    const st = getFigState(fig);
    if (appState && typeof appState.figRouteIdx === 'number' && fig.engine === 'yard' && fig.routes && fig.routes[appState.figRouteIdx]) {
      st.routeIdx = appState.figRouteIdx;
      st.trainT = 0; st.playing = false; st.clearedAt = {};
      const rt = fig.routes[st.routeIdx];
      if (rt && rt.reqSw) Object.entries(rt.reqSw).forEach(([k, v]) => { st.switches[k] = v; });
    }
    if (fig.sub === 'ladder') solveLadder(fig, st, 0);

    // 过滤目录列表
    const kw = labState.search.trim().toLowerCase();
    const filtered = allFigs.filter(f => {
      if (labState.chFilter !== 'all' && f.ch !== Number(labState.chFilter)) return false;
      if (labState.engFilter !== 'all' && f.engine !== labState.engFilter) return false;
      if (kw && !(f.id.includes(kw) || f.title.toLowerCase().includes(kw) || f.summary.toLowerCase().includes(kw))) return false;
      return true;
    });
    const curGlobalIdx = allFigs.findIndex(f => f.id === fig.id);
    const prevFig = allFigs[(curGlobalIdx - 1 + allFigs.length) % allFigs.length];
    const nextFig = allFigs[(curGlobalIdx + 1) % allFigs.length];

    // 查找关联课后习题
    const relatedQs = (root.TextbookCurriculum && root.TextbookCurriculum.QUESTIONS || []).filter(q =>
      (q.go && q.go.figureId === fig.id) || (q.figId === fig.id) || q.q.includes(fig.id) || q.a.includes(fig.id)
    ).slice(0, 6);

    // 构建控制面板 HTML
    let controlsHtml = '';
    if (fig.engine === 'yard') {
      const ev = evaluateYard(fig, st);
      controlsHtml += `<div class="cbi-subtabs" style="margin-bottom:8px">${(fig.routes || []).map((r, i) => `<button class="cbi-subtab${st.routeIdx === i ? ' active' : ''}" data-yard-route="${i}">${r.name}</button>`).join('')}</div>`;
      controlsHtml += `<div class="cbi-controls-row" style="margin-bottom:8px">
        <button class="primary-button" id="fig-yard-play">${st.playing ? 'Ⅱ 暂停列车' : (st.trainT >= 0.99 ? '↻ 重新发车演示' : '▶ 发车动态运行')}</button>
        <button class="quiet-button" id="fig-yard-step">⏭ 单步推进</button>
        <button class="quiet-button" id="fig-yard-reset">↺ 复原进路</button>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:#9cc0d6">位置滑块 <input id="fig-yard-slider" type="range" min="0" max="100" value="${Math.round(st.trainT * 100)}"></label>
      </div>`;
      if (ev.conflictMsg) controlsHtml += `<div class="fig-alert err">${ev.conflictMsg}</div>`;
      else if (ev.rt) controlsHtml += `<div class="fig-alert ok">${ev.rt.desc}</div>`;
    }
    if (fig.engine === 'circuit' && fig.sub === 'ladder') {
      if (fig.presets && fig.presets.length) {
        controlsHtml += `<div class="cbi-subtabs" style="margin-bottom:8px">${fig.presets.map((p, i) => `<button class="cbi-subtab" data-lad-preset="${i}">${p.label}</button>`).join('')}</div>`;
      }
      controlsHtml += `<div class="fig-inputs-grid">${(fig.inputs || []).map(inp => {
        if (inp.type === 'select') {
          return `<label class="fig-ctrl-sel">${inp.label}：<select data-lad-sel="${inp.id}">${inp.options.map(([v, l]) => `<option value="${v}" ${st.inputs[inp.id] === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
        }
        return `<label class="inline-check${inp.fault ? ' fig-fault-chk' : ''}"><input type="checkbox" data-lad-chk="${inp.id}" ${st.inputs[inp.id] ? 'checked' : ''}>${inp.label}</label>`;
      }).join('')}</div>`;
      if (fig.verdict) controlsHtml += `<div id="fig-verdict-box" class="fig-alert ok">${fig.verdict(st.inputs, st.relays)}</div>`;
    }
    if (fig.sub === 'sequence' || fig.sub === 'flowchart') {
      const maxLen = fig.sub === 'sequence' ? (fig.steps || []).length : (fig.trace ? fig.trace(st.ctrl).length : 1);
      controlsHtml += `<div class="cbi-controls-row" style="margin-bottom:8px">
        <button class="primary-button" id="fig-seq-play">${st.seqPlaying ? 'Ⅱ 暂停推演' : '▶ 自动逐步推演'}</button>
        <button class="quiet-button" id="fig-seq-prev">◀ 上一步</button>
        <button class="quiet-button" id="fig-seq-next">▶ 下一步 (${Math.min(st.stepIdx + 1, maxLen)}/${maxLen})</button>
        <button class="quiet-button" id="fig-seq-reset">↺ 重置</button>
      </div>`;
    }
    if (fig.sub === 'redundancy' && fig.redType === 'dualRing') {
      controlsHtml += `<div class="cbi-subtabs" style="margin-bottom:8px">
        <button class="cbi-subtab${st.redMode !== 'b' ? ' active' : ''}" data-red-mode="a">(a) 一备一用双环网</button>
        <button class="cbi-subtab${st.redMode === 'b' ? ' active' : ''}" data-red-mode="b">(b) 双工作反向自愈环网</button>
      </div>`;
    }
    if (fig.controls && fig.controls.length) {
      controlsHtml += `<div class="fig-inputs-grid" style="margin-top:6px">${fig.controls.map(c => {
        if (c.type === 'checkbox') return `<label class="inline-check"><input type="checkbox" data-fig-chk="${c.id}" ${st.ctrl[c.id] ? 'checked' : ''}>${c.label}</label>`;
        if (c.type === 'select') return `<label class="fig-ctrl-sel">${c.label}：<select data-fig-sel="${c.id}">${c.options.map(([v, l]) => `<option value="${v}" ${st.ctrl[c.id] === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
        if (c.type === 'range') return `<label class="fig-ctrl-rng">${c.label}：<strong>${st.ctrl[c.id]}</strong> <input type="range" data-fig-rng="${c.id}" min="${c.min}" max="${c.max}" step="${c.step || 1}" value="${st.ctrl[c.id]}"></label>`;
        return '';
      }).join('')}</div>`;
    }
    if (fig.engine === 'sys' && fig.sub === 'arch' && fig.verdict) {
      controlsHtml += `<div id="fig-verdict-box" class="fig-alert ok">${fig.verdict(st.ctrl)}</div>`;
    }

    const paddedPage = String(fig.page).padStart(3, '0');
    const yardCnt = allFigs.filter(f => f.engine === 'yard').length;
    const cirCnt = allFigs.filter(f => f.engine === 'circuit').length;
    const sysCnt = allFigs.filter(f => f.engine === 'sys').length;

    container.innerHTML = `
      <div class="figlab-wrap">
        <div class="figlab-head">
          <div>
            <div class="section-eyebrow">COMPLETE 168 TEXTBOOK FIGURES INTERACTIVE SIMULATOR · CHAPTERS 1–13</div>
            <h2>《车站信号自动控制》全书全部 ${allFigs.length} 幅插图实时交互仿真馆</h2>
            <p class="hub-sub">站场/道岔/闭塞动态物理引擎 (${yardCnt} 图) ＋ 继电接点/波形/6502网路求解器 (${cirCnt} 图) ＋ 系统架构/可执行软件流程/冗余容错 (${sysCnt} 图) ＝ 100% 全书无遗漏</p>
          </div>
          <div class="figlab-nav-btns">
            <button class="quiet-button" id="fig-prev-btn">◀ 上一图 (${prevFig.id})</button>
            <button class="primary-button" id="fig-next-btn">下一图 (${nextFig.id}) ▶</button>
          </div>
        </div>

        <div class="figlab-grid">
          <aside class="figlab-sidebar">
            <input id="fig-search" type="search" value="${labState.search.replace(/"/g, '&quot;')}" placeholder="搜图号或内容，如 3.1.1 / 7.9.3 / 光耦…" />
            <div class="figlab-chips">
              <button class="fig-chip${labState.engFilter === 'all' ? ' active' : ''}" data-eng-f="all">全${allFigs.length}</button>
              <button class="fig-chip${labState.engFilter === 'yard' ? ' active' : ''}" data-eng-f="yard">站场${yardCnt}</button>
              <button class="fig-chip${labState.engFilter === 'circuit' ? ' active' : ''}" data-eng-f="circuit">电路${cirCnt}</button>
              <button class="fig-chip${labState.engFilter === 'sys' ? ' active' : ''}" data-eng-f="sys">系统${sysCnt}</button>
            </div>
            <select id="fig-ch-filter" class="fig-ch-select">
              <option value="all" ${labState.chFilter === 'all' ? 'selected' : ''}>全部 13 章 (${allFigs.length} 幅插图)</option>
              ${Array.from({ length: 13 }, (_, i) => i + 1).map(ch => {
                const cnt = allFigs.filter(f => f.ch === ch).length;
                return `<option value="${ch}" ${Number(labState.chFilter) === ch ? 'selected' : ''}>第 ${ch} 章 (${cnt} 幅图)</option>`;
              }).join('')}
            </select>
            <div class="figlab-list" id="fig-list">
              ${filtered.map(f => `
                <button class="fig-item${f.id === fig.id ? ' active' : ''}" data-fig-id="${f.id}">
                  <span class="fig-item-id">图 ${f.id}</span>
                  <span class="fig-item-title">${f.title.replace(/^图\s*[\d.]+\s*·\s*/, '').split('（')[0]}</span>
                  <span class="fig-item-pg">p.${f.page}</span>
                </button>
              `).join('')}
            </div>
          </aside>

          <div class="figlab-main">
            <div class="cbi-card">
              <div class="cbi-card-head">
                <div>
                  <span class="hub-ch-meta">第 ${fig.ch} 章 · PDF 第 ${fig.page} 页（书内约第 ${Math.max(1, fig.page - 10)} 页）· 引擎：${fig.engine === 'yard' ? '站场物理仿真' : fig.engine === 'circuit' ? '继电/波形求解器' : '系统/可执行流程'}</span>
                  <h3>${fig.title}</h3>
                </div>
                <div class="hub-q-btns">
                  ${fig.jump3d ? `<button class="primary-button" id="fig-jump-3d">${fig.jump3d.label}</button>` : ''}
                  <button class="quiet-button" id="fig-toggle-orig">${labState.showOriginal ? '隐藏原书对照' : '📖 展开原书对照'}</button>
                  <button class="quiet-button" data-open-page="${fig.page}">🔍 放大原页 PDF p.${fig.page}</button>
                </div>
              </div>
              <p class="cbi-note" style="margin-bottom:10px">${formatProse(fig.summary)}</p>
              ${fig.errata ? `<div class="fig-alert warn">📌 原书核查边界/勘误提示：${formatProse(fig.errata)}</div>` : ''}
              <div id="fig-canvas-slot" class="fig-canvas-slot">${renderFigureCanvas(fig, st)}</div>
              <div class="fig-controls-box">${controlsHtml}</div>
            </div>

            ${relatedQs.length ? `
              <div class="cbi-card" style="margin-top:12px">
                <div class="cbi-card-head"><h3>📝 与图 ${fig.id} 直接关联的课后复习思考题</h3></div>
                <div class="fig-rel-qs">
                  ${relatedQs.map(q => `<div class="fig-rel-q"><strong>第${q.ch}章 第${q.num}题：</strong>${q.q}<p class="cbi-note" style="margin-top:4px">${formatProse(q.a)}</p></div>`).join('')}
                </div>
              </div>
            ` : ''}

            ${labState.showOriginal ? `
              <div class="cbi-card" style="margin-top:12px">
                <div class="cbi-card-head">
                  <h3>📖 教材原图对照（PDF 第 ${fig.page} 页扫描原页）</h3>
                  <button class="text-button" data-open-page="${fig.page}">全屏高清查看原页 →</button>
                </div>
                <div class="fig-orig-img-wrap">
                  <img src="textbook/page-${paddedPage}.jpg" alt="教材第${fig.page}页原图" loading="lazy" />
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // 绑定所有事件
    const canvasSlot = container.querySelector('#fig-canvas-slot');
    if (canvasSlot) bindCanvasDirectClicks(canvasSlot, fig, st);

    const selectFig = id => {
      labState.currentId = id;
      if (callbacks && callbacks.onSelectFigure) callbacks.onSelectFigure(id);
      else render(container, { figureId: id }, callbacks);
    };
    container.querySelectorAll('[data-fig-id]').forEach(b => { b.onclick = () => selectFig(b.dataset.figId); });
    const prevBtn = container.querySelector('#fig-prev-btn');
    if (prevBtn) prevBtn.onclick = () => selectFig(prevFig.id);
    const nextBtn = container.querySelector('#fig-next-btn');
    if (nextBtn) nextBtn.onclick = () => selectFig(nextFig.id);
    container.querySelectorAll('[data-open-page]').forEach(b => { b.onclick = () => callbacks && callbacks.onOpenPage && callbacks.onOpenPage(Number(b.dataset.openPage)); });
    const j3d = container.querySelector('#fig-jump-3d');
    if (j3d && fig.jump3d) j3d.onclick = () => callbacks && callbacks.onLaunch && callbacks.onLaunch(fig.jump3d.go);
    const togOrig = container.querySelector('#fig-toggle-orig');
    if (togOrig) togOrig.onclick = () => { labState.showOriginal = !labState.showOriginal; render(container, { figureId: fig.id }, callbacks); };

    container.querySelectorAll('[data-eng-f]').forEach(b => { b.onclick = () => { labState.engFilter = b.dataset.engF; render(container, { figureId: fig.id }, callbacks); }; });
    const chSel = container.querySelector('#fig-ch-filter');
    if (chSel) chSel.onchange = e => { labState.chFilter = e.target.value; render(container, { figureId: fig.id }, callbacks); };
    const sInp = container.querySelector('#fig-search');
    if (sInp) {
      let composing = false;
      sInp.oncompositionstart = () => { composing = true; };
      sInp.oncompositionend = e => {
        composing = false;
        labState.search = e.target.value;
        const pos = sInp.selectionStart || 0;
        render(container, { figureId: fig.id }, callbacks);
        const nxt = container.querySelector('#fig-search');
        if (nxt) { nxt.focus(); try { nxt.setSelectionRange(pos, pos); } catch (_) {} }
      };
      sInp.oninput = e => {
        labState.search = e.target.value;
        if (composing || e.isComposing) return;
        const pos = sInp.selectionStart || 0;
        render(container, { figureId: fig.id }, callbacks);
        const nxt = container.querySelector('#fig-search');
        if (nxt) { nxt.focus(); try { nxt.setSelectionRange(pos, pos); } catch (_) {} }
      };
    }

    // 原位局部刷新画布与判决（拖动滑块时绝不销毁滑块 DOM 导致脱手）
    function refreshCanvasInPlace() {
      const slot = container.querySelector('#fig-canvas-slot');
      if (slot) {
        slot.innerHTML = renderFigureCanvas(fig, st);
        bindCanvasDirectClicks(slot, fig, st);
      }
      const vEl = container.querySelector('#fig-verdict-box');
      if (vEl && fig.verdict) {
        vEl.textContent = fig.engine === 'circuit' && fig.sub === 'ladder' ? fig.verdict(st.inputs, st.relays) : fig.verdict(st.ctrl);
      }
      if (fig.engine === 'yard') {
        const ev = evaluateYard(fig, st);
        const alertEl = container.querySelector('.fig-controls-box .fig-alert');
        if (alertEl) {
          alertEl.className = `fig-alert ${ev.conflictMsg ? 'err' : 'ok'}`;
          alertEl.textContent = ev.conflictMsg || (ev.rt ? ev.rt.desc : '');
        }
      }
    }

    // 站场控制绑定
    container.querySelectorAll('[data-yard-route]').forEach(b => {
      b.onclick = () => {
        st.routeIdx = Number(b.dataset.yardRoute);
        st.trainT = 0; st.playing = false; st.clearedAt = {};
        if (fig.switches) fig.switches.forEach(sw => { st.switches[sw.id] = sw.defPos || 'N'; });
        const rt = fig.routes[st.routeIdx];
        if (rt && rt.reqSw) Object.entries(rt.reqSw).forEach(([k, v]) => { st.switches[k] = v; });
        render(container, { figureId: fig.id }, callbacks);
      };
    });
    const yPlay = container.querySelector('#fig-yard-play');
    if (yPlay) yPlay.onclick = () => {
      const ev = evaluateYard(fig, st);
      if (ev.conflictMsg) { st.playing = false; render(container, { figureId: fig.id }, callbacks); return; }
      if (st.trainT >= 0.99 || (fig.physicsMode === 'catchSlope' && st.trainT >= catchSlopeKinematics(st).stopT - 0.005)) {
        st.trainT = 0; st.clearedAt = {};
      }
      st.playing = !st.playing;
      render(container, { figureId: fig.id }, callbacks);
    };
    const yStep = container.querySelector('#fig-yard-step');
    if (yStep) yStep.onclick = () => {
      const ev = evaluateYard(fig, st);
      st.playing = false;
      if (ev.conflictMsg) { render(container, { figureId: fig.id }, callbacks); return; }
      const cap = fig.physicsMode === 'catchSlope' && catchSlopeKinematics(st).onCatch ? catchSlopeKinematics(st).stopT : 1;
      st.trainT = Math.min(cap, st.trainT + 0.12);
      render(container, { figureId: fig.id }, callbacks);
    };
    const yReset = container.querySelector('#fig-yard-reset');
    if (yReset) yReset.onclick = () => {
      st.playing = false; st.trainT = 0; st.clearedAt = {};
      if (fig.switches) fig.switches.forEach(sw => { st.switches[sw.id] = sw.defPos || 'N'; });
      const rt = fig.routes && fig.routes[st.routeIdx];
      if (rt && rt.reqSw) Object.entries(rt.reqSw).forEach(([k, v]) => { st.switches[k] = v; });
      render(container, { figureId: fig.id }, callbacks);
    };
    const ySld = container.querySelector('#fig-yard-slider');
    if (ySld) ySld.oninput = e => {
      const ev = evaluateYard(fig, st);
      st.playing = false;
      if (ev.conflictMsg) { e.target.value = String(Math.round(st.trainT * 100)); return; }
      const nextT = Number(e.target.value) / 100;
      if (nextT < st.trainT) st.clearedAt = {};
      st.trainT = nextT;
      const playEl = container.querySelector('#fig-yard-play');
      if (playEl) playEl.textContent = st.trainT >= 0.99 ? '↻ 重新发车演示' : '▶ 发车动态运行';
      refreshCanvasInPlace();
    };

    // 继电电路控制绑定
    container.querySelectorAll('[data-lad-preset]').forEach(b => {
      b.onclick = () => {
        const pr = fig.presets[Number(b.dataset.ladPreset)];
        if (pr && pr.set) { Object.assign(st.inputs, pr.set); solveLadder(fig, st, 0); }
        render(container, { figureId: fig.id }, callbacks);
      };
    });
    container.querySelectorAll('[data-lad-chk]').forEach(el => {
      el.onchange = e => { st.inputs[el.dataset.ladChk] = e.target.checked; solveLadder(fig, st, 0); render(container, { figureId: fig.id }, callbacks); };
    });
    container.querySelectorAll('[data-lad-sel]').forEach(el => {
      el.onchange = e => { st.inputs[el.dataset.ladSel] = e.target.value; solveLadder(fig, st, 0); render(container, { figureId: fig.id }, callbacks); };
    });

    // 时序/流程图控制绑定
    const sqPlay = container.querySelector('#fig-seq-play');
    if (sqPlay) sqPlay.onclick = () => {
      const maxLen = fig.sub === 'sequence' ? (fig.steps || []).length : (fig.trace ? fig.trace(st.ctrl).length : 1);
      if (st.stepIdx >= maxLen - 1) st.stepIdx = 0;
      st.seqPlaying = !st.seqPlaying; st.seqTimer = 0;
      render(container, { figureId: fig.id }, callbacks);
    };
    const sqPrev = container.querySelector('#fig-seq-prev');
    if (sqPrev) sqPrev.onclick = () => { st.seqPlaying = false; st.stepIdx = Math.max(0, st.stepIdx - 1); render(container, { figureId: fig.id }, callbacks); };
    const sqNext = container.querySelector('#fig-seq-next');
    if (sqNext) sqNext.onclick = () => {
      const maxLen = fig.sub === 'sequence' ? (fig.steps || []).length : (fig.trace ? fig.trace(st.ctrl).length : 1);
      st.seqPlaying = false; st.stepIdx = Math.min(maxLen - 1, st.stepIdx + 1);
      render(container, { figureId: fig.id }, callbacks);
    };
    const sqRes = container.querySelector('#fig-seq-reset');
    if (sqRes) sqRes.onclick = () => { st.seqPlaying = false; st.stepIdx = 0; render(container, { figureId: fig.id }, callbacks); };

    // 通用控制绑定（checkbox / select / range / red-mode）
    container.querySelectorAll('[data-fig-chk]').forEach(el => {
      el.onchange = e => {
        st.ctrl[el.dataset.figChk] = e.target.checked;
        if (fig.sub === 'flowchart') st.stepIdx = 0;
        render(container, { figureId: fig.id }, callbacks);
      };
    });
    container.querySelectorAll('[data-fig-sel]').forEach(el => {
      el.onchange = e => { st.ctrl[el.dataset.figSel] = e.target.value; render(container, { figureId: fig.id }, callbacks); };
    });
    container.querySelectorAll('[data-fig-rng]').forEach(el => {
      el.oninput = e => {
        st.ctrl[el.dataset.figRng] = Number(e.target.value);
        const valEl = el.parentElement && el.parentElement.querySelector('strong');
        if (valEl) valEl.textContent = String(st.ctrl[el.dataset.figRng]);
        refreshCanvasInPlace();
      };
    });
    container.querySelectorAll('[data-red-mode]').forEach(el => {
      el.onclick = () => { st.redMode = el.dataset.redMode; render(container, { figureId: fig.id }, callbacks); };
    });

    ensureRaf();
  }

  root.FigureLab = { getAllFigures, render, pause, solveLadder, evaluateYard, renderFigureCanvas, getFigState };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.FigureLab;
})(typeof window !== 'undefined' ? window : globalThis);
