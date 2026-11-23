(function (root) {
  'use strict';
  const TRAIN_LENGTH = 16;
  const FDGJ_SECONDS = 3;

  // 严格对照教材表 3.2.2 下行咽喉联锁表（PDF p.42–43 / 书 p.32–33）全部 33 条进路
  const ROUTES_3_2_2 = [
    { num: 1, code: 'R1', alias: 'IG', group: 'x_rec', kind: 'receive', title: 'X → IG（正线接车）', buttons: 'XLA、SⅠLA', sig: 'X', aspect: 'U', indicator: '', switchesRaw: '1/3、5/7、11', switches: { s1_3: 'N', s5_7: 'N', s9: null, s11: 'N' }, hostileRaw: 'D₁、D₃、D₇、SⅠ', sectionsText: 'IAG、1DG、1/7G、7-11DG、IG', approach: 'X3JG', ctrl: ['IAG', '1DG', '11DG'], terminal: 'IG', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '列车 IG ｜ 调车 IG', otherLock: '' },
    { num: 2, code: 'R2', group: 'x_rec', kind: 'receive', title: 'X → IIG（经 1/3 反位侧接）', buttons: 'XLA、SⅡLA', sig: 'X', aspect: 'UU', indicator: '', switchesRaw: '(1/3)、5/7、9', switches: { s1_3: 'R', s5_7: 'N', s9: 'N', s11: null }, hostileRaw: 'D₁、D₅、SⅡ', sectionsText: 'IAG、1DG、3DG、5-9DG、IIG', approach: 'X3JG', ctrl: ['IAG', '1DG', '3DG', '5-9DG'], terminal: 'IIG', sgaId: '5-9DG', sgaLabel: '5-9DG', headOn: '列车 IIG ｜ 调车 IIG', otherLock: '' },
    { num: 3, code: 'R3', alias: '3G', group: 'x_rec', kind: 'receive', title: 'X → 3G（经 11 反位侧线接车）', buttons: 'XLA、S₃LA', sig: 'X', aspect: 'UU', indicator: '', switchesRaw: '1/3、5/7、(11)', switches: { s1_3: 'N', s5_7: 'N', s9: null, s11: 'R' }, hostileRaw: 'D₁、D₃、D₇、S₃', sectionsText: 'IAG、1DG、1/7G、7-11DG、3G', approach: 'X3JG', ctrl: ['IAG', '1DG', '11DG'], terminal: '3G', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '列车 3G ｜ 调车 3G', otherLock: '' },
    { num: 4, code: 'R4', group: 'x_rec', kind: 'receive', title: 'X → 4G（经 (1/3)、(9) 侧线接车）', buttons: 'XLA、S₄LA', sig: 'X', aspect: 'UU', indicator: '', switchesRaw: '(1/3)、5/7、(9)', switches: { s1_3: 'R', s5_7: 'N', s9: 'R', s11: null }, hostileRaw: 'D₁、D₅、S₄', sectionsText: 'IAG、1DG、3DG、5-9DG、4G', approach: 'X3JG', ctrl: ['IAG', '1DG', '3DG', '5-9DG'], terminal: '4G', sgaId: '5-9DG', sgaLabel: '5-9DG', headOn: '列车 4G ｜ 调车 4G', otherLock: '' },

    { num: 5, code: 'R5', alias: 'DEP', group: 'x_dep', kind: 'depart', trackClass: 'main', zraSeconds: 180, title: 'IG → X（正线Ⅰ道发车 + 右表示器）', buttons: 'SⅠLA、XLA', sig: 'S1', aspect: 'L', indicator: '右', switchesRaw: '11、5/7、1/3', switches: { s1_3: 'N', s5_7: 'N', s9: null, s11: 'N' }, hostileRaw: 'D₇、D₃、D₁、X', sectionsText: '7-11DG、1/7G、1DG、IAG（不含IG）', approach: 'IG', ctrl: ['11DG', '1DG', 'IAG'], terminal: 'X3JG', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '—', otherLock: 'BS' },
    { num: 6, code: 'R6', group: 'x_dep', kind: 'depart', trackClass: 'main', zraSeconds: 180, title: 'IIG → X（正线Ⅱ道经 (1/3) 发车 + 右表示器）', buttons: 'SⅡLA、XLA', sig: 'SII', aspect: 'L', indicator: '右', switchesRaw: '9、5/7、(1/3)', switches: { s1_3: 'R', s5_7: 'N', s9: 'N', s11: null }, hostileRaw: 'D₅、D₁、X', sectionsText: '5-9DG、3DG、1DG、IAG（不含IIG）', approach: 'IIG', ctrl: ['5-9DG', '3DG', '1DG', 'IAG'], terminal: 'X3JG', sgaId: '5-9DG', sgaLabel: '5-9DG', headOn: '—', otherLock: 'BS' },
    { num: 7, code: 'R7', group: 'x_dep', kind: 'depart', trackClass: 'siding', zraSeconds: 30, title: '3G → X（侧线 3G 经 (11) 发车 + 右表示器）', buttons: 'S₃LA、XLA', sig: 'S3', aspect: 'L', indicator: '右', switchesRaw: '1/3、5/7、(11)', switches: { s1_3: 'N', s5_7: 'N', s9: null, s11: 'R' }, hostileRaw: 'D₇、D₃、D₁、X', sectionsText: '7-11DG、1/7G、1DG、IAG（不含3G）', approach: '3G', ctrl: ['11DG', '1DG', 'IAG'], terminal: 'X3JG', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '—', otherLock: 'BS' },
    { num: 8, code: 'R8', group: 'x_dep', kind: 'depart', trackClass: 'siding', zraSeconds: 30, title: '4G → X（侧线 4G 经 (9)、(1/3) 发车 + 右表示器）', buttons: 'S₄LA、XLA', sig: 'S4', aspect: 'L', indicator: '右', switchesRaw: '(1/3)、5/7、(9)', switches: { s1_3: 'R', s5_7: 'N', s9: 'R', s11: null }, hostileRaw: 'D₅、D₁、X', sectionsText: '5-9DG、3DG、1DG、IAG（不含4G）', approach: '4G', ctrl: ['5-9DG', '3DG', '1DG', 'IAG'], terminal: 'X3JG', sgaId: '5-9DG', sgaLabel: '5-9DG', headOn: '—', otherLock: 'BS' },

    { num: 9, code: 'R9', group: 'xf_rec', kind: 'receive', title: 'XF → IG（反方向进站 · 防护道岔 1/3）', buttons: 'X_FLA、SⅠLA', sig: 'XF', aspect: 'UU', indicator: '', switchesRaw: '1/3、(5/7)、11', switches: { s1_3: 'N', s5_7: 'R', s9: null, s11: 'N' }, hostileRaw: 'D₅、SⅠ', sectionsText: '3DG、5-9DG、7-11DG、IG', approach: 'S1LQG', ctrl: ['3DG', '5-9DG', '11DG'], terminal: 'IG', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '列车 IG ｜ 调车 IG', otherLock: '' },
    { num: 10, code: 'R10', group: 'xf_rec', kind: 'receive', title: 'XF → IIG（反方向正线直进）', buttons: 'X_FLA、SⅡLA', sig: 'XF', aspect: 'U', indicator: '', switchesRaw: '1/3、5/7、9', switches: { s1_3: 'N', s5_7: 'N', s9: 'N', s11: null }, hostileRaw: 'D₅、SⅡ', sectionsText: '3DG、5-9DG、IIG', approach: 'S1LQG', ctrl: ['3DG', '5-9DG'], terminal: 'IIG', sgaId: '5-9DG', sgaLabel: '5-9DG', headOn: '列车 IIG ｜ 调车 IIG', otherLock: '' },
    { num: 11, code: 'R11', group: 'xf_rec', kind: 'receive', title: 'XF → 3G（反方向经 (5/7)、(11)）', buttons: 'X_FLA、S₃LA', sig: 'XF', aspect: 'UU', indicator: '', switchesRaw: '1/3、(5/7)、(11)', switches: { s1_3: 'N', s5_7: 'R', s9: null, s11: 'R' }, hostileRaw: 'D₅、S₃', sectionsText: '3DG、5-9DG、7-11DG、3G', approach: 'S1LQG', ctrl: ['3DG', '5-9DG', '11DG'], terminal: '3G', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '列车 3G ｜ 调车 3G', otherLock: '' },
    { num: 12, code: 'R12', group: 'xf_rec', kind: 'receive', title: 'XF → 4G（反方向经 (9) 进侧线）', buttons: 'X_FLA、S₄LA', sig: 'XF', aspect: 'UU', indicator: '', switchesRaw: '1/3、5/7、(9)', switches: { s1_3: 'N', s5_7: 'N', s9: 'R', s11: null }, hostileRaw: 'D₅、S₄', sectionsText: '3DG、5-9DG、4G', approach: 'S1LQG', ctrl: ['3DG', '5-9DG'], terminal: '4G', sgaId: '5-9DG', sgaLabel: '5-9DG', headOn: '列车 4G ｜ 调车 4G', otherLock: '' },

    { num: 13, code: 'R13', group: 'xf_dep', kind: 'depart', trackClass: 'main', zraSeconds: 180, title: 'IG → XF（正线Ⅰ道经 (5/7) 向北京发车）', buttons: 'SⅠLA、X_FLA', sig: 'S1', aspect: 'L', indicator: '', switchesRaw: '11、(5/7)、1/3', switches: { s1_3: 'N', s5_7: 'R', s9: null, s11: 'N' }, hostileRaw: 'D₅、XF', sectionsText: '7-11DG、5-9DG、3DG（L/LU/U）', approach: 'IG', ctrl: ['11DG', '5-9DG', '3DG'], terminal: 'S1LQG', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '—', otherLock: 'BS' },
    { num: 14, code: 'R14', group: 'xf_dep', kind: 'depart', trackClass: 'main', zraSeconds: 180, title: 'IIG → XF（正线Ⅱ道直出上行发车）', buttons: 'SⅡLA、X_FLA', sig: 'SII', aspect: 'L', indicator: '', switchesRaw: '9、5/7、1/3', switches: { s1_3: 'N', s5_7: 'N', s9: 'N', s11: null }, hostileRaw: 'D₅、XF', sectionsText: '5-9DG、3DG（L/LU/U）', approach: 'IIG', ctrl: ['5-9DG', '3DG'], terminal: 'S1LQG', sgaId: '5-9DG', sgaLabel: '5-9DG', headOn: '—', otherLock: 'BS' },
    { num: 15, code: 'R15', group: 'xf_dep', kind: 'depart', trackClass: 'siding', zraSeconds: 30, title: '3G → XF（侧线 3G 经 (11)、(5/7) 发车）', buttons: 'S₃LA、X_FLA', sig: 'S3', aspect: 'L', indicator: '', switchesRaw: '(11)、(5/7)、1/3', switches: { s1_3: 'N', s5_7: 'R', s9: null, s11: 'R' }, hostileRaw: 'D₅、XF', sectionsText: '7-11DG、5-9DG、3DG（L/LU/U）', approach: '3G', ctrl: ['11DG', '5-9DG', '3DG'], terminal: 'S1LQG', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '—', otherLock: 'BS' },
    { num: 16, code: 'R16', group: 'xf_dep', kind: 'depart', trackClass: 'siding', zraSeconds: 30, title: '4G → XF（侧线 4G 经 (9) 发车）', buttons: 'S₄LA、X_FLA', sig: 'S4', aspect: 'L', indicator: '', switchesRaw: '(9)、5/7、1/3', switches: { s1_3: 'N', s5_7: 'N', s9: 'R', s11: null }, hostileRaw: 'D₅、XF', sectionsText: '5-9DG、3DG（L/LU/U）', approach: '4G', ctrl: ['5-9DG', '3DG'], terminal: 'S1LQG', sgaId: '5-9DG', sgaLabel: '5-9DG', headOn: '—', otherLock: 'BS' },

    { num: 17, code: 'R17', alias: 'SHUNT', group: 'shunt', kind: 'shunt', title: 'D₁ → D₇（按差置背向按钮 D₃A）', buttons: 'D₁A、D₃A', sig: 'D1', aspect: 'B', indicator: '', switchesRaw: '1/3', switches: { s1_3: 'N', s5_7: null, s9: null, s11: null }, hostileRaw: 'X、D₃、<5/7>(SⅠ、S₃)', sectionsText: '1DG', approach: 'IAG', ctrl: ['1DG'], terminal: '11DG', sgaId: '1DG', sgaLabel: '1DG', headOn: '—', otherLock: '' },
    { num: 18, code: 'R18', group: 'shunt', kind: 'shunt', title: 'D₁ → D₅（经 (1/3) 渡线至 3DG）', buttons: 'D₁A、D₅A', sig: 'D1', aspect: 'B', indicator: '', switchesRaw: '(1/3)', switches: { s1_3: 'R', s5_7: null, s9: null, s11: null }, hostileRaw: 'X、SⅡ、S₄、<(5)>(S₁、S₃)', sectionsText: '1DG、3DG', approach: 'IAG', ctrl: ['1DG', '3DG'], terminal: '5-9DG', sgaId: '1DG', sgaLabel: '1DG', headOn: '—', otherLock: '' },
    { num: 19, code: 'R19', group: 'shunt', kind: 'shunt', title: 'D₃ → 向 D₁（回牵出/进站内方）', buttons: 'D₃A、D₁A', sig: 'D3', aspect: 'B', indicator: '', switchesRaw: '1/3', switches: { s1_3: 'N', s5_7: null, s9: null, s11: null }, hostileRaw: 'X、D₁、<5/7>(SⅠ、S₃)', sectionsText: '1DG', approach: '1/7G', ctrl: ['1DG'], terminal: 'IAG', sgaId: '1DG', sgaLabel: '1DG', headOn: '—', otherLock: '' },
    { num: 20, code: 'R20', group: 'shunt', kind: 'shunt', title: 'D₅ → IG（经 (5/7) 调车进股道）', buttons: 'D₅A、SⅠDA', sig: 'D5', aspect: 'B', indicator: '', switchesRaw: '(5/7)、11', switches: { s1_3: null, s5_7: 'R', s9: null, s11: 'N' }, hostileRaw: 'XF、SⅠ、<(3)>X', sectionsText: '5-9DG、7-11DG', approach: '3DG', ctrl: ['5-9DG', '11DG'], terminal: 'IG', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '列车 IG', otherLock: '' },
    { num: 21, code: 'R21', group: 'shunt', kind: 'shunt', title: 'D₅ → IIG（直向调车入 IIG）', buttons: 'D₅A、SⅡDA', sig: 'D5', aspect: 'B', indicator: '', switchesRaw: '5/7、9', switches: { s1_3: null, s5_7: 'N', s9: 'N', s11: null }, hostileRaw: 'XF、SⅡ、<(3)>X', sectionsText: '5-9DG', approach: '3DG', ctrl: ['5-9DG'], terminal: 'IIG', sgaId: '5-9DG', sgaLabel: '5-9DG', headOn: '列车 IIG', otherLock: '' },
    { num: 22, code: 'R22', group: 'shunt', kind: 'shunt', title: 'D₅ → 3G（经 (5/7)、(11)）', buttons: 'D₅A、S₃DA', sig: 'D5', aspect: 'B', indicator: '', switchesRaw: '(5/7)、(11)', switches: { s1_3: null, s5_7: 'R', s9: null, s11: 'R' }, hostileRaw: 'XF、S₃、<(3)>X', sectionsText: '5-9DG、7-11DG', approach: '3DG', ctrl: ['5-9DG', '11DG'], terminal: '3G', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '列车 3G', otherLock: '' },
    { num: 23, code: 'R23', group: 'shunt', kind: 'shunt', title: 'D₅ → 4G（经 (9) 进 4G）', buttons: 'D₅A、S₄DA', sig: 'D5', aspect: 'B', indicator: '', switchesRaw: '5/7、(9)', switches: { s1_3: null, s5_7: 'N', s9: 'R', s11: null }, hostileRaw: 'XF、S₄、<(3)>X', sectionsText: '5-9DG', approach: '3DG', ctrl: ['5-9DG'], terminal: '4G', sgaId: '5-9DG', sgaLabel: '5-9DG', headOn: '列车 4G', otherLock: '' },
    { num: 24, code: 'R24', group: 'shunt', kind: 'shunt', title: 'D₇ → IG（经 7-11DG 至正线）', buttons: 'D₇A、SⅠDA', sig: 'D7', aspect: 'B', indicator: '', switchesRaw: '5/7、11', switches: { s1_3: null, s5_7: 'N', s9: null, s11: 'N' }, hostileRaw: 'SⅠ、<1>X', sectionsText: '7-11DG', approach: '1/7G', ctrl: ['11DG'], terminal: 'IG', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '列车 IG', otherLock: '' },
    { num: 25, code: 'R25', group: 'shunt', kind: 'shunt', title: 'D₇ → 3G（经 (11) 至 3G）', buttons: 'D₇A、S₃DA', sig: 'D7', aspect: 'B', indicator: '', switchesRaw: '5/7、(11)', switches: { s1_3: null, s5_7: 'N', s9: null, s11: 'R' }, hostileRaw: 'S₃、<1>X', sectionsText: '7-11DG', approach: '1/7G', ctrl: ['11DG'], terminal: '3G', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '列车 3G', otherLock: '' },
    { num: 26, code: 'R26', group: 'shunt', kind: 'shunt', title: 'S₁ → D₃（终端按差置 D₇A）', buttons: 'S₁DA、D₇A', sig: 'S1', aspect: 'B', indicator: '', switchesRaw: '11、5/7', switches: { s1_3: null, s5_7: 'N', s9: null, s11: 'N' }, hostileRaw: 'D₇、<1>(D₁、X)', sectionsText: '7-11DG', approach: 'IG', ctrl: ['11DG'], terminal: '1/7G', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '—', otherLock: '' },
    { num: 27, code: 'R27', group: 'shunt', kind: 'shunt', title: 'S₁ → 向 XF（终端专设 SDZA）', buttons: 'S₁DA、SDZA', sig: 'S1', aspect: 'B', indicator: '', switchesRaw: '11、(5/7)、1/3', switches: { s1_3: 'N', s5_7: 'R', s9: null, s11: 'N' }, hostileRaw: 'D₅、XF', sectionsText: '7-11DG、5-9DG、3DG', approach: 'IG', ctrl: ['11DG', '5-9DG', '3DG'], terminal: 'S1LQG', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '—', otherLock: '' },
    { num: 28, code: 'R28', group: 'shunt', kind: 'shunt', title: 'S₃ → D₃（经 (11) 至 D₃）', buttons: 'S₃DA、D₇A', sig: 'S3', aspect: 'B', indicator: '', switchesRaw: '(11)、5/7', switches: { s1_3: null, s5_7: 'N', s9: null, s11: 'R' }, hostileRaw: 'D₇、<1>(D₁、X)', sectionsText: '7-11DG', approach: '3G', ctrl: ['11DG'], terminal: '1/7G', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '—', otherLock: '' },
    { num: 29, code: 'R29', group: 'shunt', kind: 'shunt', title: 'S₃ → 向 XF（经 (11)、(5/7)）', buttons: 'S₃DA、SDZA', sig: 'S3', aspect: 'B', indicator: '', switchesRaw: '(11)、(5/7)、1/3', switches: { s1_3: 'N', s5_7: 'R', s9: null, s11: 'R' }, hostileRaw: 'D₅、XF', sectionsText: '7-11DG、5-9DG、3DG', approach: '3G', ctrl: ['11DG', '5-9DG', '3DG'], terminal: 'S1LQG', sgaId: '11DG', sgaLabel: '7-11DG', headOn: '—', otherLock: '' },
    { num: 30, code: 'R30', group: 'shunt', kind: 'shunt', title: 'SⅡ → 向 D₁（经 (1/3) 折返线）', buttons: 'SⅡDA、D₁A', sig: 'SII', aspect: 'B', indicator: '', switchesRaw: '9、5/7、(1/3)', switches: { s1_3: 'R', s5_7: 'N', s9: 'N', s11: null }, hostileRaw: 'D₅、D₁、X', sectionsText: '5-9DG、3DG、1DG', approach: 'IIG', ctrl: ['5-9DG', '3DG', '1DG'], terminal: 'IAG', sgaId: '5-9DG', sgaLabel: '5-9DG', headOn: '—', otherLock: '' },
    { num: 31, code: 'R31', group: 'shunt', kind: 'shunt', title: 'SⅡ → 向 XF（沿 IIG 向西牵出）', buttons: 'SⅡDA、SDZA', sig: 'SII', aspect: 'B', indicator: '', switchesRaw: '9、5/7、1/3', switches: { s1_3: 'N', s5_7: 'N', s9: 'N', s11: null }, hostileRaw: 'D₅、XF', sectionsText: '5-9DG、3DG', approach: 'IIG', ctrl: ['5-9DG', '3DG'], terminal: 'S1LQG', sgaId: '5-9DG', sgaLabel: '5-9DG', headOn: '—', otherLock: '' },
    { num: 32, code: 'R32', group: 'shunt', kind: 'shunt', title: 'S₄ → 向 D₁（经 (9)、(1/3)）', buttons: 'S₄DA、D₁A', sig: 'S4', aspect: 'B', indicator: '', switchesRaw: '(9)、5/7、(1/3)', switches: { s1_3: 'R', s5_7: 'N', s9: 'R', s11: null }, hostileRaw: 'D₅、D₁、X', sectionsText: '5-9DG、3DG、1DG', approach: '4G', ctrl: ['5-9DG', '3DG', '1DG'], terminal: 'IAG', sgaId: '5-9DG', sgaLabel: '5-9DG', headOn: '—', otherLock: '' },
    { num: 33, code: 'R33', group: 'shunt', kind: 'shunt', title: 'S₄ → 向 XF（经 (9) 向 XF 牵出）', buttons: 'S₄DA、SDZA', sig: 'S4', aspect: 'B', indicator: '', switchesRaw: '(9)、5/7、1/3', switches: { s1_3: 'N', s5_7: 'N', s9: 'R', s11: null }, hostileRaw: 'D₅、XF', sectionsText: '5-9DG、3DG', approach: '4G', ctrl: ['5-9DG', '3DG'], terminal: 'S1LQG', sgaId: '5-9DG', sgaLabel: '5-9DG', headOn: '—', otherLock: '' }
  ];
  const ROUTE_BY_KEY = Object.create(null);
  for (const r of ROUTES_3_2_2) {
    ROUTE_BY_KEY[r.code] = r;
    if (r.alias) ROUTE_BY_KEY[r.alias] = r;
  }
  function resolveRoute(route) {
    return ROUTE_BY_KEY[route] || ROUTES_3_2_2[0];
  }

  function layout(route) {
    const r = resolveRoute(route);
    if (r.code === 'R5') return [
      { id: 'IG', start: -Infinity, end: 0 },
      { id: '11DG', start: 0, end: 28, controlled: true },
      { id: '1DG', start: 28, end: 62, controlled: true },
      { id: 'IAG', start: 62, end: 92, controlled: true },
      { id: 'X3JG', start: 92, end: Infinity }
    ];
    if (r.code === 'R17') return [
      { id: 'IAG', start: -Infinity, end: 0 },
      { id: '1DG', start: 0, end: 55, controlled: true },
      { id: '11DG', start: 55, end: 92 }
    ];
    if (r.code === 'R1' || r.code === 'R3') return [
      { id: 'X3JG', start: -15, end: 0 },
      { id: 'IAG', start: 0, end: 25, controlled: true },
      { id: '1DG', start: 25, end: 55, controlled: true },
      { id: '11DG', start: 55, end: 85, controlled: true },
      { id: r.code === 'R3' ? '3G' : 'IG', start: 85, end: 130 }
    ];
    const span = r.kind === 'shunt' ? 68 : 88;
    const step = span / r.ctrl.length;
    const defs = [{ id: r.approach, start: r.kind === 'receive' ? -15 : -Infinity, end: 0 }];
    for (let i = 0; i < r.ctrl.length; i++) {
      defs.push({ id: r.ctrl[i], start: Number((i * step).toFixed(2)), end: Number(((i + 1) * step).toFixed(2)), controlled: true });
    }
    defs.push({ id: r.terminal, start: span, end: r.kind === 'depart' ? Infinity : 130 });
    return defs;
  }

  function occupied(section, position) {
    return position >= section.start && position - TRAIN_LENGTH <= section.end;
  }
  function append(h, kind, label, page) {
    h.events.push({ time: Number(h.time.toFixed(3)), position: Number(h.position.toFixed(3)), kind, label, page });
    if (h.events.length > 300) { h.events.shift(); h.omitted++; }
  }
  function create(s) {
    const sections = {};
    const h = { route: s.stationRoute || 'IG', time: 0, position: s.stationTrain, reverse: false, approached: false, omitted: 0, sections, events: [] };
    for (const def of layout(h.route)) {
      const occ = occupied(def, h.position);
      sections[def.id] = { occupied: occ, entered: occ, qjj: !occ, first: false, second: false, remaining: 0, released: false };
    }
    h.approached = sections[layout(h.route)[0].id].occupied;
    append(h, 'start', '建立本次运行记录，初始位置之前的通过过程尚无记录', 185);
    return h;
  }
  function clone(h) {
    return { ...h, sections: Object.fromEntries(Object.entries(h.sections).map(([id, r]) => [id, { ...r }])), events: h.events.slice() };
  }
  function sample(h, position, dt, fault) {
    const defs = layout(h.route);
    const faultId = typeof fault === 'string' ? fault : (fault ? (resolveRoute(h.route).sgaId || '11DG') : null);
    h.time += dt;
    h.position = position;
    for (const def of defs) {
      const r = h.sections[def.id];
      const occ = occupied(def, position);
      if (occ !== r.occupied) {
        append(h, occ ? 'occupy' : 'clear', `${def.id} ${occ ? '轮对压入，轨道占用' : '最后轮对出清'}`, 183);
        if (occ && def.controlled) {
          r.entered = true;
          r.qjj = false;
          r.remaining = 0;
          r.released = false;
          append(h, 'relay', `${def.id} QJJ↓，记录实际占用`, 185);
        }
      }
      r.occupied = occ;
    }
    if (h.sections[defs[0].id].occupied) h.approached = true;
    for (let i = 1; i < defs.length - 1; i++) {
      const def = defs[i];
      if (!def.controlled) continue;
      const r = h.sections[def.id];
      const prev = h.sections[defs[i - 1].id];
      const next = h.sections[defs[i + 1].id];
      if (r.released || h.reverse) continue;
      const previousProved = !prev.occupied && (!defs[i - 1].controlled || (prev.first && prev.second));
      if (!r.first && r.occupied && previousProved) {
        r.first = true;
        append(h, 'relay', `${def.id} 1LJ↑，前一区段出清且本区段占用`, 185);
      }
      if (!r.second && r.first && !r.occupied && next.occupied && !(faultId === '__ALL__' || (faultId && def.id === faultId))) {
        r.second = true;
        r.remaining = FDGJ_SECONDS;
        append(h, 'relay', `${def.id} 2LJ↑，本区段出清且下一区段占用，FDGJ缓放3s`, 186);
      } else if (r.second && !r.occupied && r.remaining > 0) {
        r.remaining = Math.max(0, r.remaining - dt);
      }
      if (r.first && r.second && !r.occupied && r.remaining <= 1e-9) {
        r.remaining = 0;
        r.released = true;
        append(h, 'release', `${def.id} FDGJ↓，对应区段解锁`, 183);
      }
    }
  }
  function move(h, position, fault) {
    if (!Number.isFinite(position) || position < -30 || position > 146) throw new Error('车站列车位置越界');
    const n = clone(h);
    const delta = position - h.position;
    if (delta < -1e-6 && !n.reverse) {
      n.reverse = true;
      for (const r of Object.values(n.sections)) {
        if (!r.released) { r.first = false; r.second = false; r.remaining = 0; }
      }
      append(n, 'reverse', '检测到倒退，未完成的正向三点记录作废，自动解锁停止', 186);
    }
    // A slider move traverses every boundary, without inventing elapsed time.
    const steps = Math.max(1, Math.ceil(Math.abs(delta) / .5));
    for (let i = 1; i <= steps; i++) sample(n, h.position + delta * i / steps, 0, fault);
    return n;
  }
  function advance(h, dt, fault) {
    if (!Number.isFinite(dt) || dt < 0) throw new Error('时间步长非法');
    const n = clone(h);
    sample(n, n.position, dt, fault);
    return n;
  }
  function release(h, ids, kind) {
    const n = clone(h);
    for (const id of ids) {
      const r = n.sections[id];
      if (!r || r.occupied || r.released) continue;
      r.first = true; r.second = true; r.remaining = 0; r.released = true; r.qjj = false;
      append(n, 'release', `${id} ${kind}解锁`, kind === '区段故障' ? 211 : 200);
    }
    return n;
  }
  const api = { TRAIN_LENGTH, FDGJ_SECONDS, ROUTES_3_2_2, resolveRoute, layout, occupied, create, move, advance, release, append, clone };
  root.RailwayJourney = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
