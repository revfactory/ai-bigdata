/* ui_v3.js — 스토리보드 v3 공용 부품: 「구성 도표」와 v3 섹션 간지.
 *
 * 발표 전체가 같은 네 이름을 같은 순서로 쓴다.
 *   ① 데이터 정의  ② 계산 위치  ③ 나누는 방식  + ④ 실행 기록으로 검증(앞 세 칸 모두를 확인하므로 아래 띠로 둔다)
 *
 * 쓰는 법(장면 setup/render 안)
 *   this.F = V3.frame(R, { x: 120, y: 420, w: 1680, active: 1, fills: ['…', '…', '…', '…'] });
 *   render(lt) { V3.frameIn(this.F, lt, 0.4); }                       // 칸이 차례로 그려지고, active 칸이 켜지고, fills 글이 나온다
 *   옵션: active = -1(모두 같은 밝기) | 0~3, done = 완료 칸 번호 배열(체크 표시, 예 [0, 1]), fills = 칸마다 한 줄(없으면 null), cellH, bandH, nameSize, fillSize
 *         frameIn 옵션: { activeAt, fillAt, fillEach } — 켜짐·채움 시각(초, t0 기준)
 *
 *   this.D = V3.divider(R, { num: '03', title: '데이터 정의', sub: '부제 한 줄', active: 0, done: [] });   // 섹션 4 간지라면 active: 1, done: [0]
 *   render(lt) { V3.dividerIn(this.D, lt); }                           // 큰 번호 → 제목·부제 → 구성 도표(이 섹션 칸이 켜짐)
 *
 * 모든 요소는 y 648 위에 놓인다(간지 도표 끝 약 y 626).
 */
(function () {
  'use strict';
  const { clamp, lerp, prog, ease, h, s, css } = REEL;
  const NAMES = ['데이터 정의', '계산 위치', '나누는 방식', '실행 기록으로 검증'];
  const MARK = ['1', '2', '3', '4'];   // 원 안 숫자 글리프는 본문 서체에서 작게 그려져 원 테두리 + 숫자로 그린다

  const st = document.createElement('style');
  st.textContent = `
  .v3-cell { position: absolute; box-sizing: border-box; border-radius: 18px; border: 2px solid rgba(190,170,255,.34);
             background: rgba(22,18,96,.48); padding: 16px 24px 0; overflow: hidden; }
  .v3-cell .nm { display: flex; align-items: baseline; gap: 12px; white-space: nowrap;
                 font: 800 34px/1.15 var(--display); color: var(--ink); letter-spacing: -.025em; }
  .v3-cell .nm i { font-style: normal; align-self: center; flex: none; display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 2.5px solid var(--cyan); box-sizing: border-box; font: 700 22px/1 'JetBrains Mono'; color: var(--cyan); }
  .v3-cell .fl { display: block; margin-top: 10px; font: 500 27px/1.32 var(--display); color: var(--ink2); letter-spacing: -.012em; }
  .v3-cell.on { border-color: rgba(111,226,255,.95); background: rgba(111,226,255,.15); }
  .v3-band { position: absolute; box-sizing: border-box; border-radius: 16px; border: 2px solid rgba(115,245,198,.42);
             background: rgba(16,60,70,.30); display: flex; align-items: center; gap: 22px; padding: 0 24px; white-space: nowrap; overflow: hidden; }
  .v3-band .nm { font: 800 32px/1 var(--display); color: var(--ink); letter-spacing: -.02em; }
  .v3-band .nm { display: flex; align-items: center; }
  .v3-band .nm i { font-style: normal; flex: none; display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 2.5px solid var(--mint); box-sizing: border-box; font: 700 22px/1 'JetBrains Mono'; color: var(--mint); margin-right: 14px; }
  .v3-band .fl { font: 500 27px/1.2 var(--display); color: var(--ink2); letter-spacing: -.012em; overflow: hidden; text-overflow: ellipsis; }
  .v3-band.on { border-color: rgba(115,245,198,.98); background: rgba(115,245,198,.16); }
  .v3-cell.done { border-color: rgba(111,226,255,.55); background: rgba(111,226,255,.07); }
  .v3-ck { display: inline-block; width: 30px; height: 30px; margin-left: 4px; vertical-align: -4px; }
  `;
  document.head.appendChild(st);

  function frame(parent, o = {}) {
    const x = o.x ?? 120, y = o.y ?? 420, W = o.w ?? 1680, gap = o.gap ?? 28;
    const fills = o.fills || [null, null, null, null];
    const hasFill = fills.some(Boolean);
    const cellH = o.cellH ?? (hasFill ? 132 : 84), bandH = o.bandH ?? 66, vgap = o.vgap ?? 26;
    const cw = (W - gap * 2) / 3;
    const box = h('div', 'a', parent);
    css(box, { left: '0px', top: '0px' });
    // 세 칸에서 아래 띠로 내려가는 연결선(④가 앞 세 칸 모두를 확인한다는 뜻)
    const svg = s('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, box);
    css(svg, { position: 'absolute', left: '0px', top: '0px', overflow: 'visible' });
    const links = [0, 1, 2].map(i => {
      const cx = x + i * (cw + gap) + cw / 2;
      return s('line', { x1: cx, y1: y + cellH, x2: cx, y2: y + cellH + vgap, stroke: 'rgba(115,245,198,.65)', 'stroke-width': 2.5, 'stroke-dasharray': '5 6' }, svg);
    });
    const done = o.done || [];
    const CK = '<svg class="v3-ck" viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" fill="rgba(115,245,198,.18)" stroke="#73f5c6" stroke-width="2"/><path d="M8.5 15.5l4.2 4.2 8.8-9" fill="none" stroke="#73f5c6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const cells = [0, 1, 2].map(i => {
      const c = h('div', 'v3-cell' + (done.includes(i) ? ' done' : ''), box,
        `<div class="nm"><i>${MARK[i]}</i>${NAMES[i]}${done.includes(i) ? CK : ''}</div>` + (fills[i] ? `<span class="fl">${fills[i]}</span>` : ''));
      css(c, { left: (x + i * (cw + gap)).toFixed(0) + 'px', top: y + 'px', width: cw.toFixed(0) + 'px', height: cellH + 'px' });
      if (o.nameSize) c.querySelector('.nm').style.fontSize = o.nameSize + 'px';
      if (o.fillSize && fills[i]) c.querySelector('.fl').style.fontSize = o.fillSize + 'px';
      if (!hasFill) c.style.paddingTop = Math.max(8, (cellH - 40) / 2) + 'px';
      return c;
    });
    const band = h('div', 'v3-band', box,
      `<div class="nm"><i>${MARK[3]}</i>${NAMES[3]}</div>` + (fills[3] ? `<span class="fl">${fills[3]}</span>` : ''));
    css(band, { left: x + 'px', top: (y + cellH + vgap) + 'px', width: W + 'px', height: bandH + 'px' });
    if (o.nameSize) band.querySelector('.nm').style.fontSize = (o.nameSize - 2) + 'px';
    if (o.fillSize && fills[3]) band.querySelector('.fl').style.fontSize = o.fillSize + 'px';
    const parts = cells.concat([band]);
    const fl = parts.map(p => p.querySelector('.fl'));
    return { box, cells, band, parts, links, fl, done, active: o.active ?? -1, bottom: y + cellH + vgap + bandH };
  }

  // t0부터: 칸 ①②③이 차례로 솟고 → 연결선이 내려가고 → ④ 띠가 왼쪽에서 펼쳐지고 → active 칸이 켜지고 → 채움 글이 나온다
  function frameIn(F, lt, t0 = 0.3, o = {}) {
    F.cells.forEach((c, i) => {
      const p = prog(lt, t0 + i * 0.12, 0.55, ease.snap);
      css(c, { transform: `translateY(${((1 - p) * 26).toFixed(1)}px)` });
      c.style.opacity = p.toFixed(3);
    });
    F.links.forEach((l, i) => {
      const p = prog(lt, t0 + 0.42 + i * 0.06, 0.35, ease.outCubic);
      l.setAttribute('opacity', p.toFixed(3));
    });
    const pb = prog(lt, t0 + 0.55, 0.6, ease.snap);
    css(F.band, { opacity: pb.toFixed(3), clipPath: `inset(0 ${((1 - pb) * 100).toFixed(1)}% 0 0)` });
    const a = F.active;
    const pa = a >= 0 ? prog(lt, t0 + (o.activeAt ?? 0.9), 0.5, ease.snap) : 0;
    F.parts.forEach((p, i) => {
      const on = i === a;
      p.classList.toggle('on', on && pa > 0.02);
      if (a >= 0 && !on) {
        const base = parseFloat(p.style.opacity || '1');
        p.style.opacity = (base * lerp(1, F.done.includes(i) ? 0.78 : 0.42, pa)).toFixed(3);
      }
      if (on) {
        const glow = a === 3 ? '115,245,198' : '111,226,255';
        p.style.boxShadow = `0 0 ${(46 * pa).toFixed(0)}px rgba(${glow},${(0.35 * pa).toFixed(3)})`;
      }
    });
    F.fl.forEach((f, i) => {
      if (!f) return;
      const q = prog(lt, t0 + (o.fillAt ?? 1.0) + i * (o.fillEach ?? 0.22), 0.5, ease.snap);
      css(f, { opacity: q.toFixed(3), transform: `translateX(${((1 - q) * -14).toFixed(1)}px)` });
    });
  }

  // v3 섹션 간지: 왼쪽 큰 번호(외곽선 → 채움), 오른쪽 섹션 표시·제목·부제, 아래 구성 도표(이 섹션 칸이 켜짐)
  let dn = 0;
  function divider(parent, o = {}) {
    const id = 'v3dg' + (dn++);
    const svg = s('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, parent);
    svg.style.position = 'absolute';
    const defs = s('defs', {}, svg);
    const lg = s('linearGradient', { id, x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    s('stop', { offset: '0%', 'stop-color': '#ff6ef2' }, lg); s('stop', { offset: '100%', 'stop-color': '#6fe2ff' }, lg);
    const attrs = { x: 104, y: 372, 'font-family': 'Pretendard', 'font-weight': 900, 'font-size': 300, 'letter-spacing': -18 };
    const numS = s('text', Object.assign({ fill: 'none', stroke: `url(#${id})`, 'stroke-width': 2.5 }, attrs), svg);
    const numF = s('text', Object.assign({ fill: `url(#${id})` }, attrs), svg);
    numS.textContent = numF.textContent = o.num || '00';
    const lab = h('div', 'a', parent, `<span style="font:700 24px JetBrains Mono;color:var(--cyan);letter-spacing:.08em">SECTION ${o.num || ''}</span>`);
    css(lab, { left: '640px', top: '128px' });
    const T = UI.title(parent, o.title || '', { top: 170, left: 636, size: o.size ?? 84, width: 1180 });
    let sub = null;
    const subTop = Math.round(170 + T.lines.length * (o.size ?? 84) * 1.14 + 22);
    if (o.sub) { sub = h('div', 'a', parent, o.sub); css(sub, { left: '640px', top: (o.subTop ?? subTop) + 'px', width: '1160px', font: '500 34px/1.35 Pretendard', color: 'var(--ink2)', letterSpacing: '-.02em' }); }
    const F = frame(parent, { x: 120, y: o.frameY ?? 448, w: 1680, active: o.active ?? -1, done: o.done || [], cellH: 84, bandH: 62, vgap: 22 });
    return { numS, numF, lab, T, sub, F };
  }
  function dividerIn(D, lt) {
    const L = 3600, d = prog(lt, 0, 1.2, ease.inOutCubic);
    css(D.numS, { strokeDasharray: `${L}`, strokeDashoffset: `${(L * (1 - d)).toFixed(0)}`, opacity: (1 - prog(lt, 1.1, 0.5)).toFixed(3) });
    const f = prog(lt, 0.8, 0.7, ease.snap);
    css(D.numF, { opacity: (f * 0.92).toFixed(3), transform: `translateY(${((1 - f) * 24).toFixed(1)}px)` });
    UI.rise(D.lab, lt, 0.3, { x: -30, y: 0 });
    UI.titleIn(D.T, lt, 0.45);
    if (D.sub) UI.rise(D.sub, lt, 1.0, { y: 20 });
    frameIn(D.F, lt, 1.2, { activeAt: 0.85 });
  }


  // ── 사례 표시(2차): 같은 회사 이야기가 여러 장에 이어질 때 머리말 줄의 섹션 이름 오른쪽에 붙는 칩 ──
  //   const hd = UI.header(R, {...}); this.chip = V3.story(hd, { name: '웹케시', k: 1, n: 3 });   // k = 이 장이 몇 번째(1부터), n = 전체 장 수
  //   render: V3.storyIn(this.chip, lt, 0.2)
  // 위치는 섹션 이름 바로 오른쪽(머리말 줄 y 64 안), 글자 28px. 회사마다 색 하나.
  const STORY_COL = { '데브시스터즈': '#ff6ef2', 'Kensho': '#6fe2ff', 'Anthropic 데이터팀': '#b9a6ff', '웹케시': '#ffcb66', 'ZS': '#73f5c6', 'dbt': '#ff9a6b' };
  const st2 = document.createElement('style');
  st2.textContent = `
  .v3-story { display: inline-flex; align-items: center; gap: 12px; margin-left: 26px; padding: 6px 18px 7px 16px; border-radius: 999px;
              border: 2px solid var(--sc); background: color-mix(in srgb, var(--sc) 14%, transparent);
              font: 700 28px/1 var(--display); color: var(--ink); white-space: nowrap; letter-spacing: -.01em; }
  .v3-story .d { display: flex; gap: 7px; }
  .v3-story .d i { display: block; width: 13px; height: 13px; border-radius: 50%; box-sizing: border-box; border: 2px solid var(--sc); }
  .v3-story .d i.on { background: var(--sc); }
  .v3-story .d i.cur { background: var(--sc); box-shadow: 0 0 10px var(--sc); }
  .v3-rule { position: absolute; display: flex; align-items: baseline; gap: 18px; white-space: nowrap; }
  .v3-rule b { font: 800 46px/1 var(--display); letter-spacing: -.02em;
               background: linear-gradient(90deg, #ff8bf0, #8fd8ff); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .v3-rule span { font: 700 22px/1 'JetBrains Mono'; color: var(--cyan); letter-spacing: .08em; }
  `;
  document.head.appendChild(st2);
  function story(hd, o = {}) {
    const n = o.n ?? 3, k = o.k ?? 1;
    const col = o.color || STORY_COL[o.name] || '#ffcb66';
    const dots = Array.from({ length: n }, (_, i) => `<i class="${i < k - 1 ? 'on' : i === k - 1 ? 'cur' : ''}"></i>`).join('');
    const host = hd && hd.sec ? hd.sec : hd;
    const el = h('span', 'v3-story', host, `<span>${o.name || ''}</span><span class="d">${dots}</span>`);
    el.style.setProperty('--sc', col);
    el.style.position = 'relative';
    return el;
  }
  function storyIn(el, lt, t0 = 0.2) {
    const p = prog(lt, t0, 0.5, ease.snap);
    css(el, { opacity: p.toFixed(3), transform: `translateX(${((1 - p) * -16).toFixed(1)}px)` });
  }

  // ── 규칙 장 머리(2차): 규칙 8장(P19·P20·P27·P28·P36·P37·P45·P46)이 같은 형식을 쓴다 ──
  //   왼쪽 칸에 "규칙 N" 표시 + 규칙 문장(제목 부품, 기본 54px). 오른쪽 칸(x 980~1800)은 장마다 도식·근거.
  //   this.RH = V3.ruleHead(R, { n: 3, text: '결과가 늘 같아야 하는/단계는 에이전트 대신/코드가 맡는다' });
  //   render: V3.ruleHeadIn(this.RH, lt, 0.1)   → RH.bottom 은 문장 아래 끝 y
  //   o: n, text('/' 줄바꿈, *강조*), x=120, top=118, w=800, size=54. 전체 폭이 필요한 장(P37)은 w·top을 바꿔 쓴다.
  function ruleHead(parent, o = {}) {
    const x = o.x ?? 120, top = o.top ?? 118, size = o.size ?? 54;
    const lab = h('div', 'v3-rule', parent, `<b>규칙 ${o.n}</b><span>RULE ${String(o.n).padStart(2, '0')}</span>`);
    css(lab, { left: x + 'px', top: top + 'px' });
    const T = UI.title(parent, o.text || '', { top: top + 66, left: x, width: o.w ?? 800, size });
    const bottom = Math.round(top + 66 + T.lines.length * size * 1.18);
    return { lab, T, bottom };
  }
  function ruleHeadIn(RH, lt, t0 = 0.1) {
    UI.rise(RH.lab, lt, t0, { x: -24, y: 0 });
    UI.titleIn(RH.T, lt, t0 + 0.2);
  }

  // 간지 배경: 곡선 다발이 구성 도표(y 448~610) 아래에 머물게 한다(2차, 독립 검토 지적)
  const DIV_BG = Object.assign({}, (window.DECK && DECK.BGP && DECK.BGP.surge) || {}, { yc: 905, amp: 70, spread: 150 });

  window.V3 = { NAMES, frame, frameIn, divider, dividerIn, story, storyIn, ruleHead, ruleHeadIn, DIV_BG, STORY_COL };
})();
