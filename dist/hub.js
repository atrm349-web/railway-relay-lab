(function (root) {
  'use strict';
  const STORAGE_KEY = 'railway_lab_mastery_v1';
  const viewState = {
    tab: 'roadmap', // 'roadmap' | 'questions' | 'glossary'
    qChapter: 'all',
    qFilter: 'all', // 'all' | 'todo' | 'review' | 'mastered'
    search: '',
    expandedAnswers: new Set(),
    mastery: loadMastery()
  };

  function loadMastery() {
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (_) { /* ignore storage errors */ }
    return {};
  }
  function saveMastery() {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(viewState.mastery));
    } catch (_) { /* ignore */ }
  }
  function setQuestionStatus(id, status) {
    if (viewState.mastery[id] === status) delete viewState.mastery[id];
    else viewState.mastery[id] = status;
    saveMastery();
  }
  function getStats(questions) {
    let mastered = 0, review = 0;
    for (const q of questions) {
      if (viewState.mastery[q.id] === 'mastered') mastered++;
      else if (viewState.mastery[q.id] === 'review') review++;
    }
    return { total: questions.length, mastered, review, pct: Math.round((mastered / Math.max(1, questions.length)) * 100) };
  }

  function render(container, callbacks) {
    if (!container || !root.TextbookCurriculum) return;
    const { CHAPTERS, QUESTIONS, GLOSSARY, ANOMALIES } = root.TextbookCurriculum;
    const stats = getStats(QUESTIONS);

    const headerHtml = `
      <div class="hub-top">
        <div>
          <div class="section-eyebrow">COMPLETE TEXTBOOK CLOSED-LOOP SYSTEM · CHAPTERS 1–13</div>
          <h2>《车站信号自动控制（第二版）》全书 13 章闭合学习工作台</h2>
          <p class="hub-sub">学原理(3D拆解) → 做实验(全书 168 幅插图交互仿真) → 查原页(277页离线图库) → 刷 127 道全书课后习题（100% 可模拟）</p>
        </div>
        <div class="hub-progress-card">
          <div class="hub-progress-row">
            <strong>全书 127 题掌握度：${stats.mastered} / ${stats.total} (${stats.pct}%)</strong>
            <span>待复习：${stats.review} 题</span>
          </div>
          <div class="hub-bar"><div class="hub-bar-fill" style="width:${stats.pct}%"></div></div>
          <div class="hub-tools-inline">
            <input id="hub-page-jump" type="number" min="1" max="277" placeholder="输入PDF页码 (1–277)" />
            <button id="hub-page-go" class="primary-button">📖 打开原书页</button>
          </div>
        </div>
      </div>
      <div class="cbi-subtabs" style="margin-bottom:14px">
        <button class="cbi-subtab${viewState.tab === 'roadmap' ? ' active' : ''}" data-hub-tab="roadmap">📚 1–13 章学习路径（${CHAPTERS.reduce((a, c) => a + c.sections.length, 0)}节全景）</button>
        <button class="cbi-subtab${viewState.tab === 'questions' ? ' active' : ''}" data-hub-tab="questions">📝 127 道复习思考题闭环库（含原页+实验联动）</button>
        <button class="cbi-subtab${viewState.tab === 'glossary' ? ' active' : ''}" data-hub-tab="glossary">🔍 核心术语对比 &amp; 原书疑点边界</button>
      </div>
    `;

    let bodyHtml = '';
    if (viewState.tab === 'roadmap') {
      const parts = ['第一篇 车站信号基础', '第二篇 6502 电气集中联锁', '第三篇 计算机联锁'];
      bodyHtml = parts.map(partName => {
        const chs = CHAPTERS.filter(c => c.part === partName);
        return `
          <div class="hub-part-group">
            <h3 class="hub-part-title">${partName}</h3>
            <div class="hub-ch-grid">
              ${chs.map(ch => {
                const chQs = QUESTIONS.filter(q => q.ch === ch.id);
                const chMastered = chQs.filter(q => viewState.mastery[q.id] === 'mastered').length;
                return `
                  <article class="cbi-card hub-ch-card">
                    <div class="cbi-card-head">
                      <div>
                        <span class="hub-ch-meta">书内第 ${ch.bookPages} 页 · PDF ${ch.pdfPages[0]}–${ch.pdfPages[1]}</span>
                        <h3>${ch.title}</h3>
                      </div>
                      <span class="hub-badge">${chMastered}/${chQs.length} 题掌握</span>
                    </div>
                    <p class="hub-q-core">${ch.coreQuestion}</p>
                    <ul class="hub-sec-list">${ch.sections.map(sec => `<li>${sec}</li>`).join('')}</ul>
                    <div class="hub-ch-actions">
                      ${ch.actions.map((act, idx) => act.go
                        ? `<button class="primary-button" data-ch-go="${ch.id}:${idx}">${act.label}</button>`
                        : `<button class="quiet-button" data-open-page="${act.page}">${act.label}</button>`
                      ).join('')}
                      <button class="quiet-button" data-ch-figs="${ch.id}">📐 本章插图仿真 →</button>
                      <button class="quiet-button" data-ch-qs="${ch.id}">📝 本章 ${chQs.length} 道思考题 →</button>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');
    } else if (viewState.tab === 'questions') {
      const kw = viewState.search.trim().toLowerCase();
      const filtered = QUESTIONS.filter(q => {
        if (viewState.qChapter !== 'all' && q.ch !== Number(viewState.qChapter)) return false;
        const st = viewState.mastery[q.id] || 'todo';
        if (viewState.qFilter !== 'all' && st !== viewState.qFilter) return false;
        if (kw && !(q.q.toLowerCase().includes(kw) || q.a.toLowerCase().includes(kw))) return false;
        return true;
      });
      bodyHtml = `
        <div class="cbi-card" style="margin-bottom:14px">
          <div class="hub-q-filters">
            <label>按章节筛选
              <select id="hub-q-ch">
                <option value="all" ${viewState.qChapter === 'all' ? 'selected' : ''}>全部 13 章（共 ${QUESTIONS.length} 题）</option>
                ${CHAPTERS.map(c => `<option value="${c.id}" ${Number(viewState.qChapter) === c.id ? 'selected' : ''}>${c.title}</option>`).join('')}
              </select>
            </label>
            <label>掌握状态
              <select id="hub-q-status">
                <option value="all" ${viewState.qFilter === 'all' ? 'selected' : ''}>全部状态</option>
                <option value="todo" ${viewState.qFilter === 'todo' ? 'selected' : ''}>未做/待学</option>
                <option value="review" ${viewState.qFilter === 'review' ? 'selected' : ''}>标记待复习</option>
                <option value="mastered" ${viewState.qFilter === 'mastered' ? 'selected' : ''}>已掌握</option>
              </select>
            </label>
            <label>关键词搜索
              <input id="hub-q-search" type="search" value="${viewState.search.replace(/"/g, '&quot;')}" placeholder="如：三点检查、混线、2DQJ、脉冲变压器…" />
            </label>
            <button id="hub-q-reset" class="quiet-button">重置进度</button>
          </div>
        </div>
        <div class="hub-q-list">
          ${filtered.length ? filtered.map(q => {
            const st = viewState.mastery[q.id] || 'todo';
            const open = viewState.expandedAnswers.has(q.id);
            return `
              <article class="cbi-card hub-q-item ${st}">
                <div class="hub-q-head">
                  <span class="hub-q-tag">第 ${q.ch} 章 · 第 ${q.num} 题（PDF p.${q.page}）</span>
                  <div class="hub-q-btns">
                    <button class="quiet-button" data-open-page="${q.pageRef || q.page}">📄 查看原书</button>
                    ${q.go ? `<button class="primary-button" data-q-go="${q.id}">⚡ 载入对应实验</button>` : ''}
                    ${q.figId && !(q.go && q.go.mode === 'figures') ? `<button class="quiet-button" data-q-fig="${q.figId}">📐 图 ${q.figId} 仿真</button>` : ''}
                    <button class="quiet-button ${st === 'review' ? 'is-review' : ''}" data-q-mark="${q.id}:review">↻ 待复习</button>
                    <button class="quiet-button ${st === 'mastered' ? 'is-mastered' : ''}" data-q-mark="${q.id}:mastered">✓ 已吃透</button>
                  </div>
                </div>
                <p class="hub-q-title">${q.q}</p>
                <button class="text-button" data-q-toggle="${q.id}">${open ? '收起教材解答 ↑' : '📖 查看教材依据参考解答 →'}</button>
                ${open ? `<div class="hub-q-ans">${q.a
                  .replace(/\$\\delta_0\$/g, '<em>δ₀</em>')
                  .replace(/\$K_a\$/g, '<em>K<sub>a</sub></em>')
                  .replace(/\$K_r\s*=\s*U_\{释放\}\/U_\{工作\}\$/g, '<em>K<sub>r</sub> = U<sub>释放</sub>/U<sub>工作</sub></em>')
                  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                  .replace(/`([^`]+)`/g, '<code class="fig-code">$1</code>')}</div>` : ''}
              </article>
            `;
          }).join('') : '<p class="cbi-note">当前筛选条件下暂无匹配题目，可切换“全部章节”或清空关键词。</p>'}
        </div>
      `;
    } else {
      bodyHtml = `
        <div class="cbi-grid-2">
          <div class="cbi-card">
            <h3>高频易混核心术语对照（点击页码看原书）</h3>
            <div class="hub-glossary-list">
              ${GLOSSARY.map(g => `
                <div class="hub-gloss-item">
                  <div class="hub-gloss-head">
                    <strong>${g.term}</strong>
                    <button class="text-button" data-open-page="${g.page}">📄 PDF p.${g.page}</button>
                  </div>
                  <p>${g.note}</p>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="cbi-card">
            <h3>教材原版图文差异与核查边界（绝不隐瞒或凭空脑补）</h3>
            <p class="cbi-note" style="margin-bottom:10px">以下为本项目逐页审计原书 277 页扫描件与文本后真实登记的原书局限或前后差异，学习遇此页时可对照课堂标准核对：</p>
            <div class="hub-glossary-list">
              ${ANOMALIES.map(a => `
                <div class="hub-gloss-item">
                  <strong>${a.page}</strong>
                  <p>${a.note}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `<div class="hub-wrap">${headerHtml}${bodyHtml}</div>`;

    // 事件绑定
    container.querySelectorAll('[data-hub-tab]').forEach(b => {
      b.onclick = () => { viewState.tab = b.dataset.hubTab; render(container, callbacks); };
    });
    container.querySelectorAll('[data-open-page]').forEach(b => {
      b.onclick = () => callbacks.onOpenPage(Number(b.dataset.openPage));
    });
    const jBtn = container.querySelector('#hub-page-go');
    const jInp = container.querySelector('#hub-page-jump');
    if (jBtn && jInp) {
      const go = () => {
        const p = Math.max(1, Math.min(277, Math.round(Number(jInp.value) || 1)));
        callbacks.onOpenPage(p);
      };
      jBtn.onclick = go;
      jInp.onkeydown = e => { if (e.key === 'Enter') go(); };
    }
    container.querySelectorAll('[data-ch-go]').forEach(b => {
      b.onclick = () => {
        const [cid, idx] = b.dataset.chGo.split(':').map(Number);
        const ch = CHAPTERS.find(c => c.id === cid);
        if (ch && ch.actions[idx] && ch.actions[idx].go) callbacks.onLaunch(ch.actions[idx].go);
      };
    });
    container.querySelectorAll('[data-ch-figs]').forEach(b => {
      b.onclick = () => callbacks.onLaunch({ mode: 'figures', figChapter: Number(b.dataset.chFigs), figureId: null, figRouteIdx: null });
    });
    container.querySelectorAll('[data-ch-qs]').forEach(b => {
      b.onclick = () => { viewState.tab = 'questions'; viewState.qChapter = b.dataset.chQs; viewState.qFilter = 'all'; render(container, callbacks); };
    });

    const chSel = container.querySelector('#hub-q-ch');
    if (chSel) chSel.onchange = e => { viewState.qChapter = e.target.value; render(container, callbacks); };
    const stSel = container.querySelector('#hub-q-status');
    if (stSel) stSel.onchange = e => { viewState.qFilter = e.target.value; render(container, callbacks); };
    const sInp = container.querySelector('#hub-q-search');
    if (sInp) {
      let composing = false;
      sInp.oncompositionstart = () => { composing = true; };
      sInp.oncompositionend = e => {
        composing = false;
        viewState.search = e.target.value;
        const pos = sInp.selectionStart || 0;
        render(container, callbacks);
        const nextInp = container.querySelector('#hub-q-search');
        if (nextInp) { nextInp.focus(); try { nextInp.setSelectionRange(pos, pos); } catch (_) {} }
      };
      sInp.oninput = e => {
        viewState.search = e.target.value;
        if (composing || e.isComposing) return;
        const pos = sInp.selectionStart || 0;
        render(container, callbacks);
        const nextInp = container.querySelector('#hub-q-search');
        if (nextInp) { nextInp.focus(); try { nextInp.setSelectionRange(pos, pos); } catch (_) {} }
      };
    }
    const rstBtn = container.querySelector('#hub-q-reset');
    if (rstBtn) rstBtn.onclick = () => { viewState.mastery = {}; saveMastery(); render(container, callbacks); };
    container.querySelectorAll('[data-q-toggle]').forEach(b => {
      b.onclick = () => {
        const id = b.dataset.qToggle;
        if (viewState.expandedAnswers.has(id)) viewState.expandedAnswers.delete(id);
        else viewState.expandedAnswers.add(id);
        render(container, callbacks);
      };
    });
    container.querySelectorAll('[data-q-mark]').forEach(b => {
      b.onclick = () => {
        const [id, st] = b.dataset.qMark.split(':');
        setQuestionStatus(id, st);
        render(container, callbacks);
      };
    });
    container.querySelectorAll('[data-q-go]').forEach(b => {
      b.onclick = () => {
        const q = QUESTIONS.find(x => x.id === b.dataset.qGo);
        if (q && q.go) callbacks.onLaunch(q.go);
      };
    });
    container.querySelectorAll('[data-q-fig]').forEach(b => {
      b.onclick = () => callbacks.onLaunch({ mode: 'figures', figureId: b.dataset.qFig, figRouteIdx: null, figChapter: null });
    });
  }

  const api = { render, viewState };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CurriculumHub = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
