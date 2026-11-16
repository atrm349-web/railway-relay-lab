(function (root) {
  'use strict';
  const TYPES = ['contacts', 'neutral', 'biased', 'latching', 'rectifier', 'phase'];
  function initial() {
    return { type: 'neutral', mode: 'bench', polarity: 0, latched: false,
      localPower: true, frequency: 'correct', phase: 'correct',
      front: -20, power: true, railBreak: false, receiverBreak: false,
      multi: false, branchOccupied: false, explode: 0, cover: false,
      labels: true, slow: false, field: true };
  }
  function occupied(front) {
    // front 是前轮位置，后轮比前轮落后区段长度的 18%。
    return front >= 0 && front - 18 <= 100;
  }
  function evaluate(s) {
    if (!TYPES.includes(s.type)) throw new Error('未知继电器类型');
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
    } else if (!drive && s.type !== 'latching') reasons.push('控制电源断开');
    if (s.type === 'phase' && drive) {
      if (!s.localPower) reasons.push('局部电源断开');
      if (s.frequency !== 'correct') reasons.push('频率条件不符');
      if (s.phase !== 'correct') reasons.push(s.phase === 'reversed' ? '相位反接' : '相位条件不符');
    }
    if (!onTrack && s.type === 'biased' && s.polarity === -1) reasons.push('反极性不能吸起');
    if (!onTrack && s.type === 'latching' && !drive) reasons.push('断电，永久磁铁保持上次位置');
    return { picked, frontClosed: picked, backClosed: !picked, drive,
      branchPicked, receiverAvailable, shunt, localEnergized: s.type === 'phase' && s.localPower,
      clear: onTrack ? picked : null, reasons };
  }
  function update(s, patch) {
    const n = { ...s, ...patch };
    if (![-1, 0, 1].includes(n.polarity)) throw new Error('电源极性非法');
    if (!Number.isFinite(n.front) || n.front < -25 || n.front > 145) throw new Error('列车位置越界');
    if (n.type === 'latching' && n.mode === 'bench' && n.polarity !== 0) n.latched = n.polarity === 1;
    return n;
  }
  const api = { TYPES, initial, occupied, evaluate, update };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RailwayLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
