/* scenes_v3_5.js — 섹션 5 나누는 방식 P29~P37(스토리보드 v3)
   ZS 세 장(P30~P32)은 같은 에이전트 상자 모양을 이어 쓴다: P30에서 상자 5개가 펼쳐지고, P31에서 그 아래 네 상자가 가로 흐름 4칸으로 커지고,
   P32에서 '전' 상자 다섯이 오른쪽 '후' 구성(코드 파이프라인 + 단일 에이전트)으로 옮겨 간다.
   P37은 날짜 칸 5개가 동시에 처리 → 형식 검사에서 1칸 실패 → 결과 파일이 없는 그 칸만 다시 처리 → 코드가 병합하는 순서를 움직임으로 보여 준다. */
(function () {
  'use strict';
  const { clamp, lerp, prog, ease, h, s, css, rand, spring } = REEL;

  const COL = { cyan: '#6fe2ff', mint: '#73f5c6', amber: '#ffcb66', coral: '#ff7a8a', violet: '#8f45ff', lav: '#bea9ff', ink: '#f6f3ff' };
  const RGB = { cyan: [111, 226, 255], mint: [115, 245, 198], amber: [255, 203, 102], coral: [255, 122, 138], lav: [190, 169, 255] };
  const A = (hex, a) => UI.hexA(hex, a);
  const mix = (c1, c2, p, a = 1) => `rgba(${c1.map((v, i) => Math.round(lerp(v, c2[i], clamp(p)))).join(',')},${a})`;
  const SEC = { sec: '05', name: '나누는 방식' };
  const SRC_ZS = 'Sethuraman·Asokan(ZS Associates) · Why We Killed Our Multi-Agent Pipeline · 2026-07-02 · 자체 보고(주최 측 자막 확인)';

  const ICON = {
    bot: '<rect x="4" y="8" width="16" height="12" rx="3.5"/><path d="M12 4.5V8"/><circle cx="12" cy="3.6" r="1.1"/><circle cx="9" cy="14" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1.3" fill="currentColor" stroke="none"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M7 7l10 10M17 7L7 17"/>',
    code: '<path d="M8.5 7L3.5 12l5 5"/><path d="M15.5 7l5 5-5 5"/><path d="M13.5 5l-3 14"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 15.5h6"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    doc: '<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 11.5h6M9 15h4"/>',
    ret: '<path d="M9 7L4 12l5 5"/><path d="M4 12h11a5 5 0 0 1 0 10h-2"/>',
    spin: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4.5H15"/>',
  };
  const ico = (n, size, color, sw = 2) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex:none;color:${color}">${ICON[n]}</svg>`;

  function fullSvg(parent) {
    const v = s('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, parent);
    css(v, { position: 'absolute', left: '0', top: '0', overflow: 'visible' });
    return v;
  }
  function box(parent, x, y, w, hh, st, html, cls) {
    const d = h('div', cls || 'a', parent, html);
    const o = { left: x + 'px', top: y + 'px' };
    if (w != null) o.width = w + 'px';
    if (hh != null) o.height = hh + 'px';
    css(d, Object.assign(o, st || {}));
    return d;
  }
  const op = (el, v) => { el.style.opacity = clamp(v).toFixed(3); };
  function drawable(p) { p._L = p.getTotalLength(); p.style.strokeDasharray = p._L.toFixed(1); p.style.strokeDashoffset = p._L.toFixed(1); return p; }
  const draw = (p, v) => { p.style.strokeDashoffset = (p._L * (1 - clamp(v))).toFixed(1); };
  // 아래에서 솟는 등장 + 배수(흐리게 만들 때)
  function riseK(el, lt, t0, o = {}) {
    const p = prog(lt, t0, o.dur ?? 0.5, o.ease || ease.snap);
    css(el, { opacity: (p * (o.k ?? 1)).toFixed(3), transform: `translate(${((1 - p) * (o.x ?? 0)).toFixed(1)}px, ${((1 - p) * (o.y ?? 18)).toFixed(1)}px) scale(${lerp(o.from ?? 1, 1, p).toFixed(4)})` });
    return p;
  }
  function popK(el, lt, t0, o = {}) {
    const sp = spring(lt, t0, o.f ?? 2.6, o.z ?? 0.5), p = clamp((lt - t0) / 0.12);
    css(el, { opacity: (p * (o.k ?? 1)).toFixed(3), transform: `scale(${((o.from ?? 0.5) + (1 - (o.from ?? 0.5)) * sp).toFixed(4)})` });
    return p;
  }
  function chev(sv, x, y, color, size = 12) {
    return s('path', { d: `M${x - size},${y - size} L${x},${y} L${x - size},${y + size}`, fill: 'none', stroke: color, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sv);
  }

  const st = document.createElement('style');
  st.textContent = `
  .s5-ag { position: absolute; box-sizing: border-box; border-radius: 14px; border: 2px solid rgba(190,169,255,.6); background: rgba(40,30,150,.66);
           display: flex; align-items: center; justify-content: center; gap: 10px; font: 700 30px/1.3 var(--display); color: var(--ink);
           letter-spacing: -.02em; white-space: nowrap; text-align: center; }
  .s5-ag.orc { border-color: rgba(111,226,255,.75); background: rgba(111,226,255,.14); }
  .s5-ag.code { border-color: rgba(115,245,198,.85); background: rgba(115,245,198,.12); }
  .s5-ag.dash { border-style: dashed; background: rgba(40,30,150,.3); }
  .s5-lbl { position: absolute; font: 600 30px/1.3 var(--display); color: var(--ink); letter-spacing: -.015em; white-space: nowrap; }
  .s5-lbl .d { color: var(--ink2); font-weight: 500; }
  .s5-cell { position: absolute; box-sizing: border-box; border-radius: 14px; border: 2px solid rgba(190,169,255,.6); background: rgba(40,30,150,.66);
             padding: 18px 22px; overflow: hidden; }
  .s5-cell .tx { font: 700 30px/1.3 var(--display); color: var(--ink); letter-spacing: -.02em; }
  .s5-cell .ok { color: var(--mint); font-weight: 800; }
  .s5-cell .bad { color: var(--coral); font-weight: 800; }
  .s5-cell u { text-decoration: none; border-bottom: 3px solid rgba(255,203,102,0); padding-bottom: 1px; }
  .s5-pill { position: absolute; display: inline-flex; align-items: center; gap: 10px; padding: 7px 18px 8px; border-radius: 999px; white-space: nowrap;
             font: 700 30px/1 var(--display); letter-spacing: -.01em; }
  .s5-num { font-family: var(--num); font-weight: 900; letter-spacing: -.04em; font-variant-numeric: tabular-nums; line-height: 1; white-space: nowrap; }
  .s5-bar { position: absolute; border-radius: 6px; }
  .s5-rule { position: absolute; display: flex; align-items: center; gap: 18px; font: 600 32px/1.3 var(--display); color: var(--ink); letter-spacing: -.02em; white-space: nowrap; }
  .s5-rule i { flex: none; width: 10px; height: 34px; border-radius: 4px; background: var(--cyan); }
  .s5-chip { position: absolute; width: 30px; height: 30px; box-sizing: border-box; border-radius: 7px; background: rgba(255,122,138,.82); border: 2px solid #ff9aa6;
             display: grid; place-items: center; }
  .s5-chip .ok { position: absolute; right: -9px; top: -11px; width: 22px; height: 22px; border-radius: 50%; background: #0c0b3e; border: 2px solid #73f5c6; display: grid; place-items: center; }
  .s5-lane { position: absolute; box-sizing: border-box; border-radius: 8px; border: 2px solid rgba(190,169,255,.5); background: rgba(22,18,96,.7); overflow: hidden; }
  .s5-lane .f { position: absolute; left: 0; top: 0; bottom: 0; width: 0; background: rgba(111,226,255,.42); }
  .s5-lane .ic { position: absolute; left: 8px; top: 2px; }
  `;
  document.head.appendChild(st);

  // ───────── P29 · 간지 ─────────
  // 움직임: ② 칸에 체크가 찍히고 ③ 칸이 밝아진다
  DECK.slide({
    id: 'p29', stops: [3.4], exit: 0.5, bg: V3.DIV_BG,
    setup(el) {
      const R = this.R = UI.root(el);
      this.D = V3.divider(R, { num: '05', title: '나누는 방식', sub: '에이전트를 몇 개로, 작업을 무엇 단위로 나누나', active: 2, done: [0, 1] });
      this.ck = this.D.F.cells[1].querySelector('.v3-ck');
    },
    render(lt, ctx) {
      V3.dividerIn(this.D, lt);
      if (this.ck) {
        const sp = spring(lt, 1.85, 2.6, 0.45), p = clamp((lt - 1.85) / 0.1);
        css(this.ck, { opacity: p.toFixed(3), transform: `scale(${(0.2 + 0.8 * sp).toFixed(3)})`, transformOrigin: '50% 50%' });
      }
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P30 · ZS 1/3 사례 장면(시간축) · 구도 기 ─────────
  // 움직임: 첫 점에서 에이전트 상자 5개가 펼쳐지고, 둘째 점에서 신호·원인·조치·전망 네 칸이 위에서 내려와 한 묶음이 되고, 셋째 점에서 상자 다섯에 취소선이 그어진다
  const P30_BOX = { x0: 140, step: 212, y: 552, w: 200, h: 64 };
  DECK.slide({
    id: 'p30', stops: [1.6, 3.2, 4.6, 5.8], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: SRC_ZS }, SEC));
      this.sc = V3.story(this.hd, { name: 'ZS', k: 1, n: 3 });
      this.q = UI.ask(R, '분석가가 하던 네 단계에 에이전트를 하나씩 붙이면 어떻게 되나', { top: 106 });
      this.T = UI.title(R, 'ZS는 처방 변화 분석을/조율 에이전트 1개와 *분석 에이전트 4개*로 나눴다', { top: 146, size: 62 });
      this.c = UI.context(R, '제약사 영업 분석 회사 ZS. 처방 변화의 원인 분석과 영업 조치 제안', { top: 296 });
      const v = fullSvg(R), AY = 372;
      this.PX = [160, 1000, 1560];
      this.axis = drawable(s('path', { d: `M128,${AY} H1792`, stroke: A(COL.lav, 0.6), 'stroke-width': 3, fill: 'none' }, v));
      this.head = chev(v, 1796, AY, A(COL.lav, 0.8), 11);
      this.rings = this.PX.map(x => s('circle', { cx: x, cy: AY, r: 18, fill: 'none', stroke: COL.cyan, 'stroke-width': 2 }, v));
      this.dots = this.PX.map(x => s('circle', { cx: x, cy: AY, r: 0, fill: COL.cyan }, v));
      this.L1 = box(R, 146, 392, null, null, null, '분석 단계마다 에이전트 하나씩 <span class="d">+</span> 조율 에이전트', 's5-lbl');
      this.orc = box(R, 380, 456, 360, 58, null, `${ico('bot', 28, COL.cyan)}<span>조율 에이전트</span>`, 's5-ag orc');
      const names = ['신호 감지', '원인 위치', '원인 요인', '종합'];
      this.links = names.map((_, i) => {
        const cx = P30_BOX.x0 + i * P30_BOX.step + P30_BOX.w / 2;
        return drawable(s('path', { d: `M560,514 V533 H${cx} V${P30_BOX.y}`, stroke: A(COL.cyan, 0.6), 'stroke-width': 2.5, fill: 'none' }, v));
      });
      this.ags = names.map((n, i) => box(R, P30_BOX.x0 + i * P30_BOX.step, P30_BOX.y, P30_BOX.w, P30_BOX.h, null, n, 's5-ag'));
      // 취소선: 3px 산호색, 상자 글자 가운데 높이(svg 를 상자 위에 둔다)
      const v2 = fullSvg(R);
      this.strikes = [this.orc].concat(this.ags).map(b => {
        const x = parseFloat(b.style.left), y = parseFloat(b.style.top), w = parseFloat(b.style.width), hh = parseFloat(b.style.height);
        return drawable(s('path', { d: `M${x + 14},${y + hh / 2 + 1} H${x + w - 14}`, stroke: COL.coral, 'stroke-width': 3, 'stroke-linecap': 'round', fill: 'none' }, v2));
      });
      this.L2 = box(R, 986, 392, 540, null, { whiteSpace: 'normal' }, '결과물: 신호·원인·조치·전망을<br>한 묶음으로 보고', 's5-lbl');
      this.bundle = box(R, 990, 484, 516, 58, { boxSizing: 'border-box', borderRadius: '14px', border: `2px solid ${A(COL.cyan, 0.8)}`, background: A(COL.cyan, 0.08) }, '');
      this.parts = ['신호', '원인', '조치', '전망'].map((n, i) => box(R, 998 + i * 126, 490, 120, 46, { borderRadius: '9px' }, n, 's5-ag'));
      this.L3 = box(R, 1546, 392, null, null, null, '예시 답 검토<br><span style="color:var(--coral)">→ 구성 폐기</span>', 's5-lbl');
      // 용어 설명은 묶음 상자 아래 20px, 용어와 풀이 사이 8px(두 줄이 y 648 위에서 끝난다)
      this.term = UI.term(R, '조율 에이전트(오케스트레이터)', '네 에이전트에 일을 나눠 주고 서로 잇는 에이전트', { top: 562, left: 990, width: 810 });
      css(this.term, { flexDirection: 'column', gap: '8px' });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt); V3.storyIn(this.sc, lt, 0.2); UI.lineIn(this.q, lt, 0.05); UI.titleIn(this.T, lt, 0.15); UI.lineIn(this.c, lt, 0.95);
      const L = 1664, f1 = (this.PX[0] + 60 - 128) / L, f2 = (this.PX[1] + 60 - 128) / L;
      draw(this.axis, f1 * prog(lt, 1.6, 0.35, ease.outCubic) + (f2 - f1) * prog(lt, 3.2, 0.45, ease.inOutCubic) + (1 - f2) * prog(lt, 4.6, 0.4, ease.inOutCubic));
      op(this.head, prog(lt, 4.9, 0.2));
      const tp = [1.75, 3.6, 4.95];
      this.dots.forEach((d, i) => d.setAttribute('r', (11 * clamp(spring(lt, tp[i], 2.8, 0.45), 0, 1.4)).toFixed(2)));
      this.rings.forEach((r, i) => { const p = prog(lt, tp[i], 0.7, ease.outCubic); r.setAttribute('r', (12 + 22 * p).toFixed(1)); r.setAttribute('opacity', (p > 0 ? 0.9 * (1 - p) : 0).toFixed(3)); });
      const dim = lerp(1, 0.66, prog(lt, 5.25, 0.45));
      riseK(this.L1, lt, 1.85, { y: 14 });
      popK(this.orc, lt, 2.0, { from: 0.6, k: dim });
      this.links.forEach((l, i) => draw(l, prog(lt, 2.2 + i * 0.05, 0.35, ease.outCubic)));
      this.ags.forEach((b, i) => riseK(b, lt, 2.4 + i * 0.07, { y: 22, k: dim }));
      UI.lineIn(this.term, lt, 2.7);
      riseK(this.L2, lt, 3.7, { y: 14 });
      // 네 칸은 위쪽(라벨 줄)에서 내려와 묶인다 — 아래 용어 설명 줄 위를 지나지 않는다
      this.parts.forEach((p, i) => {
        const q = prog(lt, 3.85 + i * 0.06, 0.55, ease.outCubic), a = clamp((lt - 3.85 - i * 0.06) / 0.15);
        css(p, { opacity: a.toFixed(3), transform: `translate(${((1 - q) * (i - 1.5) * 40).toFixed(1)}px, ${((1 - q) * -30).toFixed(1)}px)` });
      });
      const pb = prog(lt, 4.3, 0.35, ease.snap);
      css(this.bundle, { opacity: pb.toFixed(3), transform: `scale(${lerp(1.06, 1, pb).toFixed(4)})` });
      riseK(this.L3, lt, 5.05, { y: 14 });
      this.strikes.forEach((p, i) => draw(p, prog(lt, 5.15 + i * 0.07, 0.3, ease.outCubic)));
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P31 · ZS 2/3 과정 도식 · 구도 라(도식 먼저, 제목은 결론으로 나중에) ─────────
  // 움직임: P30의 네 상자가 위로 올라와 흐름 4칸이 되고, 신호 점이 상자 가운데를 지나며 세 칸을 초록으로 켠 뒤 넷째 칸에서 붉게 멈춘다. '보험사' 표식 사이 선은 끊어진다
  const P31 = { y: 256, h: 90, xs: [120, 390, 660, 1300], ws: [230, 230, 560, 500] };
  DECK.slide({
    id: 'p31', stops: [0.9, 2.3, 4.4, 6.0], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: SRC_ZS }, SEC));
      this.sc = V3.story(this.hd, { name: 'ZS', k: 2, n: 3 });
      this.c = UI.context(R, 'ZS 발표에서 든 예시 답(한 지역의 처방 감소)', { top: 146 });
      const TY = P31.y + P31.h / 2;
      this.TY = TY; this.end = P31.xs[3] + 340;
      const v = fullSvg(R);   // 상자 아래 층: 흐름 선과 점(반투명 상자 너머로 보인다)
      this.track = drawable(s('path', { d: `M100,${TY} H${this.end}`, stroke: A(COL.lav, 0.55), 'stroke-width': 3, fill: 'none' }, v));
      this.dotU = s('circle', { cx: 100, cy: TY, r: 12, fill: COL.mint }, v);
      const names = ['신호 감지', '원인 위치', '원인 요인', '종합'];
      this.cells = names.map((n, i) => {
        const c = box(R, P31.xs[i], P31.y, P31.ws[i], P31.h, { display: 'flex', alignItems: 'center', padding: '0 22px' }, `<div class="tx">${n}</div>`, 's5-cell');
        c._tx = c.querySelector('.tx');
        return c;
      });
      this.desc = [
        // 줄 나눔 위치를 정해 둔다: 마지막 줄에 '(맞음)'·'않음)'만 남지 않게
        box(R, P31.xs[2], 360, P31.ws[2], null, { whiteSpace: 'normal' }, '<u>보험사</u>가 약의 급여(보험 적용)<br>등급을 낮춤<span style="color:var(--mint);font-weight:800">(맞음)</span>', 's5-lbl'),
        box(R, P31.xs[3], 360, P31.ws[3], null, { whiteSpace: 'normal' }, '영업 인력 추가 제안<br><span style="color:var(--coral);font-weight:800">(틀림: <u>보험사</u> 쪽을 보지 않음)</span>', 's5-lbl'),
      ];
      this.ins = this.desc.map(d => d.querySelector('u'));
      this.ins.forEach(u => css(u, { textDecoration: 'none', borderBottom: '3px solid rgba(255,203,102,0)' }));
      const vT = fullSvg(R);  // 상자 위 층: 칸 사이 화살표, 끊어진 선, 멈춘 점
      this.arrows = [370, 640, 1270].map(x => chev(vT, x + 6, TY, A(COL.lav, 0.9), 10));
      const LY = 380;
      // 끊긴 선 표식은 오른쪽 설명 글(x 1300)에서 20px 떨어져 끝난다
      this.cut1 = drawable(s('path', { d: `M1206,${LY} H1230`, stroke: COL.amber, 'stroke-width': 3.5, fill: 'none' }, vT));
      this.cutMark = s('path', { d: `M1236,${LY + 13} L1245,${LY - 13} M1250,${LY + 13} L1259,${LY - 13}`, stroke: COL.coral, 'stroke-width': 3.5, 'stroke-linecap': 'round', fill: 'none' }, vT);
      this.cut2 = s('path', { d: `M1264,${LY} H1280`, stroke: A(COL.amber, 0.45), 'stroke-width': 3.5, 'stroke-dasharray': '4 4', fill: 'none' }, vT);
      this.mark = box(R, 1240, 194, 560, 50, { boxSizing: 'border-box', borderRadius: '12px', border: `2.5px dashed ${COL.coral}`, background: A(COL.coral, 0.08),
        display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 30px/1 var(--display)', color: 'var(--ink)', letterSpacing: '-.02em', whiteSpace: 'nowrap' }, '결론 전체를 책임지는 에이전트 없음');
      this.markLine = drawable(s('path', { d: `M${P31.xs[3] + 250},244 V${P31.y}`, stroke: COL.coral, 'stroke-width': 2.5, fill: 'none' }, vT));
      this.ring = s('circle', { cx: this.end, cy: TY, r: 14, fill: 'none', stroke: COL.coral, 'stroke-width': 3 }, vT);
      this.dotT = s('circle', { cx: this.end, cy: TY, r: 12, fill: COL.coral }, vT);
      this.T = UI.title(R, '원인은 맞았지만 *조치가 틀렸다*/결론 전체를 책임지는 에이전트가 없었다', { top: 456, size: 62 });
      this.m = UI.meaning(R, '→ 각 단계가 맞아도 결론을 책임지는 자리가 비면 조치가 틀린다', { top: 604 });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt); V3.storyIn(this.sc, lt, 0.2); UI.lineIn(this.c, lt, 0.1);
      // ② P30 아래 줄 상자 자리에서 올라와 흐름 4칸이 된다
      const dotX = lerp(100, this.end, prog(lt, 2.4, 1.3, ease.inOutSine));
      const stopK = prog(lt, 3.7, 0.25, ease.snap);
      this.cells.forEach((c, i) => {
        const q = prog(lt, 0.95 + i * 0.07, 0.8, ease.swift), a = clamp((lt - 0.95 - i * 0.07) / 0.18);
        css(c, { left: lerp(P30_BOX.x0 + i * P30_BOX.step, P31.xs[i], q).toFixed(1) + 'px', top: lerp(P30_BOX.y, P31.y, q).toFixed(1) + 'px',
          width: lerp(P30_BOX.w, P31.ws[i], q).toFixed(1) + 'px', height: lerp(P30_BOX.h, P31.h, q).toFixed(1) + 'px', opacity: a.toFixed(3) });
        op(c._tx, prog(lt, 1.6 + i * 0.07, 0.4));
        if (i < 3) {
          const g = clamp((dotX - P31.xs[i] + 10) / 60);
          css(c, { borderColor: mix(RGB.lav, RGB.mint, g, lerp(0.6, 0.95, g)), background: mix([40, 30, 150], [20, 80, 90], g, 0.66) });
        } else {
          css(c, { borderColor: mix(RGB.lav, RGB.coral, stopK, lerp(0.6, 1, stopK)), background: mix([40, 30, 150], [110, 30, 80], stopK, 0.66),
            boxShadow: `0 0 ${(40 * stopK).toFixed(0)}px rgba(255,122,138,${(0.35 * stopK).toFixed(3)})` });
        }
      });
      this.desc.forEach((d, i) => riseK(d, lt, 1.9 + i * 0.12, { y: 12 }));
      draw(this.track, prog(lt, 1.7, 0.6, ease.outCubic));
      this.arrows.forEach((a, i) => op(a, prog(lt, 1.9 + i * 0.08, 0.3)));
      // ③ 점이 상자 가운데를 지나 넷째 칸에서 멈춘다
      const dv = clamp((lt - 2.35) / 0.12);
      this.dotU.setAttribute('cx', dotX.toFixed(1));
      this.dotU.setAttribute('r', (12 * dv * (1 - stopK)).toFixed(2));
      this.dotT.setAttribute('r', (12 * stopK * (1 + 0.15 * stopK)).toFixed(2));
      const rp = prog(lt, 3.7, 0.8, ease.outCubic);
      this.ring.setAttribute('r', (14 + 30 * rp).toFixed(1)); this.ring.setAttribute('opacity', (rp > 0 ? 1 - rp : 0).toFixed(3));
      const ip = [prog(lt, 3.1, 0.25), prog(lt, 3.75, 0.25)];
      this.ins.forEach((u, i) => { u.style.borderBottomColor = `rgba(255,203,102,${ip[i].toFixed(3)})`; u.style.color = ip[i] > 0.5 ? COL.amber : ''; });
      draw(this.cut1, prog(lt, 3.8, 0.25, ease.outCubic));
      op(this.cutMark, prog(lt, 4.0, 0.15));
      op(this.cut2, prog(lt, 4.05, 0.2) * 0.9);
      riseK(this.mark, lt, 3.85, { y: -14 });
      draw(this.markLine, prog(lt, 4.0, 0.25));
      // ④ 결론: 제목과 의미 줄
      UI.titleIn(this.T, lt, 4.45);
      UI.lineIn(this.m, lt, 5.4);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P32 · ZS 3/3 전후 변환 · 구도 기 ─────────
  // 움직임: '전' 조직도에서 신호 감지 칸이 오른쪽 코드 파이프라인 자리로 옮겨 가며 초록 코드 상자로 바뀌고, 남은 칸(조율·원인 위치·원인 요인·종합)은 단일 에이전트 하나로 합쳐진다
  const P32L = { orc: [216, 352, 300, 50], ags: [[120, 418, 236, 50], [380, 418, 236, 50], [120, 478, 236, 50], [380, 478, 236, 50]] };
  const P32R = { code: [700, 396, 350, 112], agent: [1100, 396, 260, 112], sub: [1410, 396, 390, 112] };
  DECK.slide({
    id: 'p32', stops: [1.5, 2.8, 4.8, 5.6], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: SRC_ZS }, SEC));
      this.sc = V3.story(this.hd, { name: 'ZS', k: 3, n: 3 });
      this.q = UI.ask(R, '그래서 어떻게 다시 만들었나', { top: 104 });
      this.T = UI.title(R, '신호 감지는 *코드 파이프라인*으로 옮기고/조사는 에이전트 하나가 맡게 했다', { top: 144, size: 62 });
      this.c = UI.context(R, '에이전트는 감지된 변화를 조사할 뿐 신호인지는 판단하지 않는다', { top: 294 });
      const v = fullSvg(R);
      this.pre = box(R, 120, 352, null, null, { color: 'var(--ink2)', border: `2px solid ${A(COL.lav, 0.6)}`, background: 'rgba(40,30,150,.4)' }, '전', 's5-pill');
      this.post = box(R, 700, 340, null, null, { color: '#0c0b3e', background: COL.mint }, '후', 's5-pill');
      const mk = (r, cls, html, st) => box(R, r[0], r[1], r[2], r[3], st || null, html, cls);
      const names = ['신호 감지', '원인 위치', '원인 요인', '종합'];
      this.lLinks = P32L.ags.slice(0, 2).map(r => drawable(s('path', { d: `M366,402 V410 H${r[0] + r[2] / 2} V418`, stroke: A(COL.cyan, 0.55), 'stroke-width': 2.5, fill: 'none' }, v)));
      this.lOrc = mk(P32L.orc, 's5-ag orc', `${ico('bot', 26, COL.cyan)}<span>조율</span>`);
      this.lAgs = P32L.ags.map((r, i) => mk(r, 's5-ag', `${ico('bot', 24, COL.lav)}<span>${names[i]}</span>`, { fontSize: '30px' }));
      this.cap = box(R, 120, 540, 496, null, { textAlign: 'center', fontSize: '32px', fontWeight: '700' }, '조율 1 + 분석 4', 's5-lbl');
      this.sep = drawable(s('path', { d: 'M656,356 V580', stroke: A(COL.lav, 0.4), 'stroke-width': 2, fill: 'none' }, v));
      this.sepChev = chev(v, 668, 452, A(COL.lav, 0.9), 13);
      this.code = mk(P32R.code, 's5-ag code', `${ico('code', 34, COL.mint)}<span>코드 파이프라인<br><span style="font-weight:500;color:var(--ink2)">(신호 감지)</span></span>`);
      this.agent = mk(P32R.agent, 's5-ag orc', `${ico('bot', 34, COL.cyan)}<span>단일 에이전트<br><span style="font-weight:500;color:var(--ink2)">(조사)</span></span>`);
      this.sub = mk(P32R.sub, 's5-ag dash', '<span>필요할 때 조사 에이전트가<br>부르는 보조 에이전트</span>');
      this.a1 = drawable(s('path', { d: 'M1056,452 H1092', stroke: A(COL.mint, 0.9), 'stroke-width': 3, fill: 'none' }, v));
      this.a1h = chev(v, 1094, 452, COL.mint, 10);
      this.a2 = s('path', { d: 'M1366,452 H1402', stroke: A(COL.lav, 0.8), 'stroke-width': 3, 'stroke-dasharray': '6 6', fill: 'none' }, v);
      this.a2h = chev(v, 1404, 452, A(COL.lav, 0.9), 10);
      // 옮겨 가는 상자: 0 = 신호 감지 → 코드 파이프라인, 나머지 → 단일 에이전트
      const src = [[P32L.ags[0], 0], [P32L.orc, -1], [P32L.ags[1], 1], [P32L.ags[2], 2], [P32L.ags[3], 3]];
      this.fly = src.map(([r, ni], i) => {
        const b = mk(r, 's5-ag' + (ni < 0 ? ' orc' : ''), `${ico('bot', 24, ni < 0 ? COL.cyan : COL.lav)}<span>${ni < 0 ? '조율' : names[ni]}</span>`, { fontSize: '30px', overflow: 'hidden' });
        b._r = r; b._to = i === 0 ? P32R.code : P32R.agent; b._lab = b.querySelector('span'); return b;
      });
      // 신호 점: 코드 파이프라인 입구에서 대부분 걸러지고 일부만 에이전트로 간다
      const v2 = fullSvg(R);
      this.sig = Array.from({ length: 16 }, (_, i) => {
        const pass = i % 5 === 2;
        return { el: s('circle', { cx: 0, cy: 0, r: 6, fill: pass ? COL.mint : COL.lav }, v2), pass, ph: i / 16 + rand(i, 3) * 0.03, y: pass ? 497 : 418 + rand(i, 7) * 64, stopX: 712 + rand(i, 9) * 30 };
      });
      this.term = UI.term(R, '코드 파이프라인', 'LLM 없이 코드로 짜 같은 입력에 늘 같은 결과를 내는 단계', { top: 528, left: 700, width: 1100 });
      this.m = UI.meaning(R, '→ 정해진 단계는 코드가 먼저, 판단은 한 에이전트가', { top: 592 });
      this.tag = box(R, 0, 590, null, null, { left: 'auto', right: '120px', color: COL.amber, border: `2px solid ${A(COL.amber, 0.75)}`, background: A(COL.amber, 0.1) }, '새 구성의 정확도·비용은 공개되지 않았다', 's5-pill');
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt); V3.storyIn(this.sc, lt, 0.2); UI.lineIn(this.q, lt, 0.05); UI.titleIn(this.T, lt, 0.15); UI.lineIn(this.c, lt, 0.9);
      // ② 전: 조직도
      riseK(this.pre, lt, 1.55, { y: 10 });
      const ghost = lerp(1, 0.5, prog(lt, 3.0, 0.5));
      popK(this.lOrc, lt, 1.65, { from: 0.6, k: ghost });
      this.lLinks.forEach((l, i) => { draw(l, prog(lt, 1.85 + i * 0.04, 0.3)); l.style.opacity = ghost.toFixed(3); });
      this.lAgs.forEach((b, i) => riseK(b, lt, 1.95 + i * 0.07, { y: 18, k: ghost }));
      const leave = prog(lt, 2.95, 0.35);
      [this.lOrc].concat(this.lAgs).forEach(b => { b.style.borderStyle = lt > 2.95 ? 'dashed' : 'solid'; Array.from(b.children).forEach(ch => { ch.style.opacity = lerp(1, 0.22, leave).toFixed(3); }); });
      riseK(this.cap, lt, 2.3, { y: 12 });
      // ③ 후: 신호 감지 칸이 먼저 코드 자리로, 나머지가 뒤따라 단일 에이전트로 합쳐진다
      draw(this.sep, prog(lt, 2.9, 0.4));
      op(this.sepChev, prog(lt, 3.1, 0.2));
      riseK(this.post, lt, 3.0, { y: 10 });
      this.fly.forEach((b, i) => {
        const t0 = i === 0 ? 2.95 : 3.35 + i * 0.07, q = prog(lt, t0, i === 0 ? 0.8 : 0.75, ease.swift);
        const fr = b._r, to = b._to;
        const vis = clamp((lt - t0) / 0.05) * (1 - prog(lt, (i === 0 ? 3.75 : 4.1) + i * 0.02, 0.22));
        css(b, { left: lerp(fr[0], to[0], q).toFixed(1) + 'px', top: lerp(fr[1], to[1], q).toFixed(1) + 'px', width: lerp(fr[2], to[2], q).toFixed(1) + 'px',
          height: lerp(fr[3], to[3], q).toFixed(1) + 'px', opacity: vis.toFixed(3) });
        if (i === 0) css(b, { borderColor: mix(RGB.lav, RGB.mint, q, 0.95), background: mix([40, 30, 150], [20, 90, 90], q, 0.7) });
      });
      riseK(this.code, lt, 3.72, { y: 0, from: 0.96, dur: 0.3 });
      riseK(this.agent, lt, 4.05, { y: 0, from: 0.96, dur: 0.3 });
      draw(this.a1, prog(lt, 4.1, 0.2)); op(this.a1h, prog(lt, 4.2, 0.12));
      op(this.a2, prog(lt, 4.3, 0.2)); op(this.a2h, prog(lt, 4.35, 0.15));
      const ps = prog(lt, 4.35, 0.45, ease.outBack);
      css(this.sub, { opacity: clamp((lt - 4.35) / 0.15).toFixed(3), transform: `translateX(${((1 - ps) * -60).toFixed(1)}px) scale(${lerp(0.7, 1, ps).toFixed(3)})` });
      UI.lineIn(this.term, lt, 4.45);
      const am = DECK.amb(ctx.t), sv = prog(lt, 4.1, 0.5);
      this.sig.forEach(d => {
        const u = ((am * 0.22 + d.ph) % 1 + 1) % 1;
        let x, a;
        if (d.pass) { x = 640 + u * 480; a = clamp((x - 650) / 30) * (1 - clamp((x - 1090) / 30)); }
        else { x = 640 + u * 300; const xx = Math.min(x, d.stopX); a = clamp((x - 650) / 30) * (1 - clamp((x - d.stopX) / 60)); x = xx; }
        d.el.setAttribute('cx', x.toFixed(1)); d.el.setAttribute('cy', d.y.toFixed(1));
        d.el.setAttribute('opacity', (a * sv * 0.95).toFixed(3));
      });
      // ④ 아래 줄과 의미 줄
      UI.lineIn(this.m, lt, 4.95);
      riseK(this.tag, lt, 5.1, { y: 14 });
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P33 · Rakuten 막대 비교 · 구도 가(왼쪽 글 칸, 오른쪽 도식) ─────────
  // 움직임: 통과 막대가 함께 차오르다 단일은 218에서 멈추고 5개 구성은 286까지 간다. 비용 막대는 단일 길이 눈금을 두 번 넘어 늘어난다
  const P33 = { bx: 1020, pw: 600, cw: 540, r1: [206, 284], r2: [458, 536], bh: 62 };
  DECK.slide({
    id: 'p33', stops: [1.5, 3.4, 5.2], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: 'Manoj 외(Rakuten India) · arXiv 2608.18740 · 2026-08-19 · 자체 평가(테스트 환경)' }, SEC));
      this.q = UI.ask(R, '나눠서 정확도가 오른 경우는 없나', { top: 110 });
      this.T = UI.title(R, '에이전트 5개 구성은/단일 에이전트보다/68건 더 풀었고/비용은 *2.7배*였다', { top: 152, size: 58, width: 680 });
      this.c = UI.context(R, 'Rakuten 분석 질의 300건(가상 데이터), GPT-4.1. 단일 에이전트는 5개 구성에서 입력 검증만 뺀 것', { top: 440, width: 680 });
      this.m = UI.meaning(R, '→ 정답은 68건 늘었고 비용은 2.7배. 이 비용을 낼지는 업무마다 다르다', { top: 546, width: 680 });
      css(this.m, { width: '680px', lineHeight: '1.4' });
      const row = (y, label) => box(R, 860, y, 150, P33.bh, { lineHeight: P33.bh + 'px' }, label, 's5-lbl');
      const bar = (y, st) => box(R, P33.bx, y, 0, P33.bh, st, '', 's5-bar');
      const num = (y, col, html) => box(R, 0, y + 6, null, null, { font: '900 50px/1 var(--num)', color: col, fontVariantNumeric: 'tabular-nums' }, html || '', 's5-lbl');
      // 위: 통과(300건 중)
      this.hL = box(R, 860, 140, null, null, { fontSize: '34px', fontWeight: '800' }, '통과 <span class="d" style="font-size:30px">(300건 중)</span>', 's5-lbl');
      this.rL = P33.r1.map((y, i) => row(y, i ? '단일' : '5개 구성'));
      this.trk = P33.r1.map(y => box(R, P33.bx, y, P33.pw, P33.bh, { borderRadius: '6px', background: 'rgba(190,169,255,.12)', border: '1.5px solid rgba(190,169,255,.25)', boxSizing: 'border-box' }, '', 's5-bar'));
      this.pA = bar(P33.r1[0], { background: 'linear-gradient(90deg, rgba(111,226,255,.55), rgba(111,226,255,.75))' });
      this.pAx = box(R, P33.bx + 218 * P33.pw / 300, P33.r1[0], 0, P33.bh, { background: COL.cyan, boxShadow: '0 0 26px rgba(111,226,255,.55)', borderRadius: '0 6px 6px 0' }, '', 's5-bar');
      this.pB = bar(P33.r1[1], { background: 'rgba(190,169,255,.6)' });
      this.vA = num(P33.r1[0], COL.cyan); this.vB = num(P33.r1[1], 'var(--ink)');
      [this.vA, this.vB].forEach(e => { e.style.left = (P33.bx + P33.pw + 16) + 'px'; });
      // 아래: 비용(질의당)
      this.hR = box(R, 860, 392, null, null, { fontSize: '34px', fontWeight: '800' }, '비용: <span class="d" style="font-size:30px">질의당</span>', 's5-lbl');
      this.rR = P33.r2.map((y, i) => row(y, i ? '단일' : '5개 구성'));
      this.cA = bar(P33.r2[0], { background: 'linear-gradient(90deg, rgba(255,203,102,.5), rgba(255,203,102,.85))' });
      this.cB = bar(P33.r2[1], { background: 'rgba(255,203,102,.55)' });
      const unit = P33.cw * 0.03 / 0.08;
      this.unit = unit;
      this.ticks = [1, 2].map(k => box(R, P33.bx + unit * k - 1.5, P33.r2[0] - 8, 3, P33.bh + 16, { background: 'rgba(246,243,255,.9)', borderRadius: '2px' }, '', 's5-bar'));
      this.wA = num(P33.r2[0], COL.amber, '0.08<span style="font:700 30px var(--display)">달러</span>');
      this.wB = num(P33.r2[1], 'var(--ink)', '0.03<span style="font:700 30px var(--display)">달러</span>');
      this.wB.style.left = (P33.bx + unit + 16) + 'px';
      const sv = fullSvg(R);
      this.axL = s('path', { d: `M${P33.bx},${P33.r1[0] - 12} V${P33.r1[1] + P33.bh + 12}`, stroke: A(COL.lav, 0.7), 'stroke-width': 2.5 }, sv);
      this.axR = s('path', { d: `M${P33.bx},${P33.r2[0] - 12} V${P33.r2[1] + P33.bh + 12}`, stroke: A(COL.lav, 0.7), 'stroke-width': 2.5 }, sv);
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt); UI.lineIn(this.q, lt, 0.05); UI.titleIn(this.T, lt, 0.15); UI.lineIn(this.c, lt, 0.95);
      riseK(this.hL, lt, 1.55, { y: 12 });
      this.rL.forEach((r, i) => riseK(r, lt, 1.65 + i * 0.06, { x: -16, y: 0 }));
      this.trk.forEach((t, i) => op(t, prog(lt, 1.7 + i * 0.05, 0.3)));
      op(this.axL, prog(lt, 1.6, 0.3));
      const v = 300 * prog(lt, 1.95, 1.25, ease.outCubic), PX = P33.pw / 300;
      const a = Math.min(286, v), b = Math.min(218, v);
      css(this.pA, { width: (Math.min(a, 218) * PX).toFixed(1) + 'px' });
      css(this.pAx, { width: (Math.max(0, a - 218) * PX).toFixed(1) + 'px' });
      css(this.pB, { width: (b * PX).toFixed(1) + 'px' });
      const vv = clamp((lt - 1.95) / 0.1);
      this.vA.textContent = Math.round(a) + '건'; this.vB.textContent = Math.round(b) + '건';
      op(this.vA, vv); op(this.vB, vv);
      riseK(this.hR, lt, 3.45, { y: 12 });
      this.rR.forEach((r, i) => riseK(r, lt, 3.5 + i * 0.06, { x: -16, y: 0 }));
      op(this.axR, prog(lt, 3.45, 0.3));
      const c = 0.08 * prog(lt, 3.65, 1.05, ease.inOutCubic), CX = P33.cw / 0.08, U = this.unit;
      css(this.cA, { width: (c * CX).toFixed(1) + 'px' });
      css(this.cB, { width: (Math.min(0.03, c) * CX).toFixed(1) + 'px' });
      this.ticks.forEach((t, k) => { const on = c * CX >= U * (k + 1) - 2; t.style.opacity = on ? '1' : '0'; t.style.transform = `scaleY(${on ? lerp(1.5, 1, clamp((c * CX - U * (k + 1)) / 40)).toFixed(3) : 0})`; });
      css(this.wA, { left: (P33.bx + c * CX + 16).toFixed(1) + 'px' });
      popK(this.wB, lt, 4.07, { from: 0.7 });
      popK(this.wA, lt, 4.7, { from: 0.7 });
      UI.lineIn(this.m, lt, 4.75);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P34 · Coordination Tax 큰 숫자 · 구도 나(큰 숫자 가운데) ─────────
  // 움직임: 왼쪽에서 두 기둥이 1배 점선까지 함께 오른 뒤 비용 기둥만 3.22까지 오르고, 가운데 큰 숫자가 같이 센다. 정답률 기둥은 점선에 머문다
  // floor 584·k 48: 비용 기둥(3.22배) 윗끝이 왼쪽 위 '비용' 라벨에서 떨어지고, 기둥 이름은 바닥선 아래에 둔다
  const P34 = { floor: 584, k: 48 };
  DECK.slide({
    id: 'p34', stops: [1.5, 3.6, 5.2], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: 'Zettl·Gosmar · The Coordination Tax · arXiv 2610.37700 · 2026-10-25 · 통제 실험(코딩 과제)' }, SEC));
      this.q = UI.ask(R, '역할을 나누면 늘 정확도가 오르나 — 코딩 과제 실험', { top: 104 });
      this.T = UI.title(R, '계획·코딩·검토로 나누자 비용은 *3.22배*가 됐고/정답률은 차이가 없었다', { top: 140, size: 56 });
      this.c = UI.context(R, '코딩 과제 135개(데이터 작업 아님), 구성 6종 중 계획자-코더-검토자, 3회씩, 기준 Opus 5.5 단독', { top: 278 });
      const v = fullSvg(R), base = P34.floor - P34.k;
      // 왼쪽 기둥 영역(x 128~420): 1배 점선은 이 영역 안에서 끝난다
      this.base = s('path', { d: `M128,${base} H412`, stroke: A(COL.mint, 0.9), 'stroke-width': 2.5, 'stroke-dasharray': '9 7', fill: 'none' }, v);
      this.bl = box(R, 424, base - 19, null, null, { font: '700 30px/1.2 var(--mono)', color: COL.mint }, '1배', 's5-lbl');
      this.colC = box(R, 140, P34.floor, 110, 0, { background: 'linear-gradient(180deg, rgba(111,226,255,.95), rgba(111,226,255,.35))', borderRadius: '8px 8px 0 0', boxShadow: '0 0 30px rgba(111,226,255,.35)', overflow: 'hidden' }, '', 's5-bar');
      this.colA = box(R, 274, P34.floor, 110, 0, { background: 'linear-gradient(180deg, rgba(115,245,198,.9), rgba(115,245,198,.35))', borderRadius: '8px 8px 0 0', overflow: 'hidden' }, '', 's5-bar');
      // 기둥 이름: 기둥 안 바닥선 위가 아니라 바닥선 아래 12px
      const colLab = (x, t, c) => box(R, x, P34.floor + 12, 110, null, { textAlign: 'center', font: '800 30px/1.2 var(--display)', color: c }, t, 's5-lbl');
      this.labC = colLab(140, '비용', COL.cyan);
      this.labA = colLab(274, '정답률', COL.mint);
      this.floorL = s('path', { d: `M128,${P34.floor} H400`, stroke: A(COL.lav, 0.7), 'stroke-width': 2.5 }, v);
      this.costL = box(R, 120, 326, 470, null, { whiteSpace: 'normal', lineHeight: '1.42' }, '<b style="font-size:34px">비용</b><br><span class="d">(단독 대비 계획자-코더-검토자)</span>', 's5-lbl');
      this.big = box(R, 600, 322, 720, null, { color: COL.cyan, fontSize: '250px', textAlign: 'center' }, '<span class="n">1.00</span><span style="font-size:116px;margin-left:8px">배</span>', 'a s5-num');
      this.bigN = this.big.querySelector('.n');
      this.r1 = box(R, 1340, 336, null, null, { display: 'flex', alignItems: 'baseline', gap: '16px' }, '<span class="d">시간</span><span class="s5-num" style="font-size:68px;color:var(--ink)">3.24배</span>', 's5-lbl');
      this.r2 = box(R, 1340, 424, null, null, { display: 'flex', alignItems: 'baseline', gap: '14px' }, '<span class="d">정답률 차이</span><span class="s5-num" style="font-size:68px;color:var(--mint)">-1.5%p</span>', 's5-lbl');
      this.r3 = box(R, 1340, 504, 460, null, { whiteSpace: 'normal', color: 'var(--ink2)', fontWeight: '500' }, '(통계적으로 의미 있는 차이 아님)', 's5-lbl');
      this.m = UI.meaning(R, '→ 역할을 나눈다고 정확도가 오르지는 않았다', { top: 592 });
      css(this.m, { width: '1680px', justifyContent: 'center' });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt); UI.lineIn(this.q, lt, 0.05); UI.titleIn(this.T, lt, 0.15); UI.lineIn(this.c, lt, 0.85);
      // ② 1배 점선 → 두 기둥이 1배까지 → 비용만 3.22까지, 숫자도 함께
      const bp = prog(lt, 1.5, 0.45, ease.outCubic);
      this.base.style.clipPath = `inset(0 ${((1 - bp) * 100).toFixed(1)}% 0 0)`; op(this.base, bp > 0 ? 1 : 0);
      riseK(this.bl, lt, 1.75, { x: -14, y: 0 });
      op(this.floorL, prog(lt, 1.5, 0.3));
      riseK(this.costL, lt, 1.6, { y: 12 });
      const one = prog(lt, 1.75, 0.45, ease.outCubic), up = prog(lt, 2.3, 1.15, ease.inOutCubic);
      const vC = one + 2.22 * up, vA = one;
      css(this.colC, { top: (P34.floor - P34.k * vC).toFixed(1) + 'px', height: (P34.k * vC).toFixed(1) + 'px' });
      css(this.colA, { top: (P34.floor - P34.k * vA).toFixed(1) + 'px', height: (P34.k * vA).toFixed(1) + 'px' });
      op(this.labC, prog(lt, 1.75, 0.3)); op(this.labA, prog(lt, 1.8, 0.3));
      this.bigN.textContent = (1 + 2.22 * up).toFixed(2);
      riseK(this.big, lt, 2.2, { y: 24, dur: 0.4 });
      // ③ 오른쪽 수치와 의미 줄
      riseK(this.r1, lt, 3.7, { x: 24, y: 0 });
      riseK(this.r2, lt, 3.95, { x: 24, y: 0 });
      riseK(this.r3, lt, 4.1, { x: 24, y: 0 });
      UI.lineIn(this.m, lt, 4.5);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P35 · Oracle AI 과정 도식 · 구도 라(도식 먼저, 제목은 결론으로 나중에) ─────────
  // 움직임: 틀린 답 15개가 검증 에이전트 아래 관문을 지나며 13개에 승인 표시가 찍혀 오른쪽에 쌓이고 2개만 되돌아간다(13/15 ≈ 87%). 그 뒤 제목이 결론으로 나온다
  // y·h: 두 줄 상자 글자와 테두리 사이 14px 이상. 아래 묶음(용어·반대 결과·제목·의미 줄) 간격을 넓히려고 칩 줄과 용어 줄을 올린다
  const P35 = { y: 196, h: 100, laneY: 316, gateX: 970, pileX: 1244, n: 15, back: [4, 10] };
  DECK.slide({
    id: 'p35', stops: [0.9, 2.2, 4.8, 6.6], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: 'Sourati 외(Oracle AI·USC) · Same Context, Different Agents · arXiv 2610.20959 · 2026-10-14 · 통제 실험' }, SEC));
      this.q = UI.ask(R, '검증 에이전트를 하나 더 붙이면 안전해지나', { top: 104 });
      this.c = UI.context(R, 'Oracle AI, 데이터 과제 1,514개·모델 7종. 답 전에 데이터를 직접 조회하는 모델 3종(점수는 정확도 점수)', { top: 142 });
      const v = fullSvg(R), Y = P35.y, H = P35.h;
      const docBadge = `<span style="position:absolute;right:-14px;top:-16px;width:40px;height:40px;border-radius:10px;background:#1a1d8c;border:2px solid ${COL.lav};display:grid;place-items:center">${ico('doc', 24, COL.lav)}</span>`;
      this.bA = box(R, 120, Y, 290, H, null, `${ico('bot', 30, COL.lav)}<span>답 에이전트</span>${docBadge}`, 's5-ag');
      this.bB = box(R, 470, Y, 230, H, { borderColor: A(COL.coral, 0.85), background: A(COL.coral, 0.16) }, `${ico('x', 26, COL.coral, 2.6)}<span>틀린 답</span>`, 's5-ag');
      this.bC = box(R, 760, Y, 420, H, { borderColor: A(COL.cyan, 0.8), background: A(COL.cyan, 0.12) },
        `${ico('bot', 30, COL.cyan)}<span>검증 에이전트<br><span style="font-weight:500;color:var(--ink2)">(같은 자료)</span></span>${docBadge}`, 's5-ag');
      this.docs = [this.bA, this.bC].map(b => b.lastElementChild);
      this.bD = box(R, 1240, Y, 560, H, { display: 'flex', alignItems: 'baseline', gap: '18px', paddingTop: '6px' },
        '<span>승인</span><span class="s5-num" style="font-size:88px;color:var(--coral)">87%</span>', 's5-lbl');
      this.arr = [[410, 470], [700, 760], [1180, 1240]].map(([a, b]) => ({ p: drawable(s('path', { d: `M${a + 6},${Y + H / 2} H${b - 8}`, stroke: A(COL.lav, 0.85), 'stroke-width': 3, fill: 'none' }, v)), hd: chev(v, b - 6, Y + H / 2, A(COL.lav, 0.95), 10) }));
      this.gate = drawable(s('path', { d: `M${P35.gateX},${Y + H + 4} V${P35.laneY + 34}`, stroke: COL.cyan, 'stroke-width': 3, fill: 'none' }, v));
      this.chips = Array.from({ length: P35.n }, (_, i) => {
        const c = box(R, 0, P35.laneY, null, null, null, `${ico('x', 18, '#3a0b20', 3)}<span class="ok">${ico('check', 14, COL.mint, 3.4)}</span>`, 's5-chip');
        c._ok = c.querySelector('.ok'); c._back = P35.back.includes(i);
        return c;
      });
      let k = 0, kb = 0;
      this.chips.forEach(c => { if (c._back) c._slot = kb++; else c._slot = k++; });
      this.term = UI.term(R, '검증 에이전트', '다른 에이전트의 답을 받아 승인하거나 되돌려 보내는 에이전트', { top: 358, left: 120, width: 1680 });
      this.rev = box(R, 120, 406, null, null, { color: 'var(--ink2)', borderLeft: `4px solid ${COL.amber}`, paddingLeft: '16px' }, '같은 실험, 데이터를 보지 않고 답하는 모델: 검증 에이전트를 붙이자 +23점, 비용 4배', 's5-lbl');
      this.T = UI.title(R, '검증 에이전트는 틀린 답의 *87%*를 승인했고/정확도는 5점 내려갔다', { top: 456, size: 62 });
      this.m = UI.meaning(R, '→ 같은 자료를 본 검증 에이전트는 같은 오류를 놓친다', { top: 606 });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt); UI.lineIn(this.q, lt, 0.05); UI.lineIn(this.c, lt, 0.2);
      [this.bA, this.bB, this.bC, this.bD].forEach((b, i) => riseK(b, lt, 0.95 + i * 0.22, { x: -24, y: 0 }));
      this.arr.forEach((a, i) => { draw(a.p, prog(lt, 1.1 + i * 0.22, 0.25)); op(a.hd, prog(lt, 1.25 + i * 0.22, 0.15)); });
      const dp = prog(lt, 1.8, 0.3);
      this.docs.forEach(d => css(d, { opacity: dp.toFixed(3), boxShadow: `0 0 ${(18 * dp).toFixed(0)}px rgba(190,169,255,${(0.6 * dp).toFixed(2)})` }));
      draw(this.gate, prog(lt, 1.95, 0.3));
      const S = 585, G = P35.gateX - 15;
      this.chips.forEach((c, i) => {
        const t0 = 2.3 + i * 0.11;
        const p1 = prog(lt, t0, 0.38, ease.inOutCubic), p2 = prog(lt, t0 + 0.42, 0.42, ease.inOutCubic);
        let x = lerp(S, G, p1);
        if (c._back) x = lerp(x, 790 + c._slot * 40, p2);
        else x = lerp(x, P35.pileX + c._slot * 42, p2);
        const vis = clamp((lt - t0) / 0.08);
        css(c, { left: x.toFixed(1) + 'px', top: P35.laneY + 'px', opacity: (vis * (c._back ? lerp(1, 0.6, p2) : 1)).toFixed(3) });
        const stamp = c._back ? 0 : clamp(spring(lt, t0 + 0.38, 3, 0.5), 0, 1.3);
        css(c._ok, { opacity: (c._back ? 0 : clamp((lt - t0 - 0.38) / 0.06)).toFixed(3), transform: `scale(${stamp.toFixed(3)})` });
        if (c._back) c.style.transform = `rotate(${(-12 * p2).toFixed(1)}deg)`;
      });
      UI.lineIn(this.term, lt, 2.6);
      // ④ 반대 결과 줄 → 제목(결론) → 의미 줄
      riseK(this.rev, lt, 4.85, { x: 20, y: 0 });
      UI.titleIn(this.T, lt, 5.0);
      UI.lineIn(this.m, lt, 5.95);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P36 · 규칙 5 · 구도 규칙-좌 ─────────
  // 움직임: '단일'(비용 3칸)과 '나눈 구성'(비용 8칸)의 눈금이 차고, 나눈 구성의 정확도 칸은 + / = / − 로 하나씩 켜진다. 그 뒤 나눈 구성 사이사이에 코드 상자가 끼워진다
  const P36 = { lx: 980, bx: 1130, cx: 1440, ax: 1662, rA: 308, rB: 374, rh: 52 };
  DECK.slide({
    id: 'p36', stops: [1.6, 3.6, 5.0, 5.8], exit: 0.5, bg: DECK.BGP.text,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: '발표자 제안 · 근거 Rakuten(2026-08-19) · Zettl·Gosmar(2026-10-25) · Oracle AI(2026-10-14) · 참고 ZS(2026-07-02) · Thomson Reuters(arXiv 2610.19999, 2026-10-14)' }, SEC));
      this.q = UI.ask(R, '나누면 비용이 늘고 정확도는 경우마다 달랐다.<br>그러면 나눌 때는 어떻게 나누나', { top: 96 });
      css(this.q, { lineHeight: '1.4' });
      this.RH = V3.ruleHead(R, { n: 5, text: '나누기 전에 *단일 구성과*/비교하고, 나눌 때는/코드 파이프라인/단계를 끼운다', top: 186 });
      const chip = (y, html) => box(R, 120, y, null, null, { gap: '14px', fontSize: '30px', fontWeight: '600', color: 'var(--ink2)', border: `2px solid ${A(COL.lav, 0.5)}`, background: 'rgba(40,30,150,.4)' }, html, 's5-pill');
      this.ch1 = chip(this.RH.bottom + 18, '<b style="color:var(--cyan)">근거:</b> 앞 세 실험(Rakuten·Coordination Tax·Oracle).');
      this.ch2 = chip(this.RH.bottom + 74, '<b style="color:var(--cyan)">참고:</b> ZS');
      // 오른쪽 칸
      this.r1 = box(R, P36.lx, 164, 820, null, { whiteSpace: 'normal', alignItems: 'flex-start', fontSize: '30px' }, '<i style="margin-top:3px"></i><span>단일 구성과 나눈 구성을 각각 두 번 이상 돌려 비교하고 나은 쪽을 쓴다</span>', 's5-rule');
      const v = fullSvg(R);
      this.hC = box(R, P36.cx, 262, null, null, { color: 'var(--ink2)', fontWeight: '500' }, '비용', 's5-lbl');
      this.hA = box(R, P36.ax, 262, null, null, { color: 'var(--ink2)', fontWeight: '500' }, '정확도', 's5-lbl');
      this.lA = box(R, P36.lx, P36.rA, 150, P36.rh, { lineHeight: P36.rh + 'px' }, '단일', 's5-lbl');
      this.lB = box(R, P36.lx, P36.rB, 150, P36.rh, { lineHeight: P36.rh + 'px' }, '나눈 구성', 's5-lbl');
      this.single = box(R, P36.bx, P36.rA, 52, P36.rh, null, ico('bot', 26, COL.cyan), 's5-ag orc');
      this.split = [0, 1, 2].map(i => box(R, P36.bx + i * 62, P36.rB, 52, P36.rh, null, ico('bot', 24, COL.lav), 's5-ag'));
      this.codes = [0, 1].map(i => box(R, P36.bx + 62 + i * 124, P36.rB, 52, P36.rh, null, ico('code', 26, COL.mint), 's5-ag code'));
      // 비용 칸 8개(단일 3칸, 나눈 구성 8칸)
      this.cost = [[P36.rA, 3], [P36.rB, 8]].map(([y, n]) => Array.from({ length: 8 }, (_, k) => ({
        el: s('rect', { x: P36.cx + k * 25, y: y + 8, width: 19, height: P36.rh - 16, rx: 3, fill: k < n ? COL.amber : 'none', stroke: A(COL.amber, 0.45), 'stroke-width': 1.5 }, v), on: k < n, k })));
      // 정확도: 단일은 기준(빈 칸), 나눈 구성은 + / = / −
      this.accA = box(R, P36.ax, P36.rA, 136, P36.rh, { boxSizing: 'border-box', borderRadius: '8px', border: `2px dashed ${A(COL.lav, 0.55)}` }, '', 'a');
      const sym = [['+', COL.mint], ['=', COL.lav], ['−', COL.coral]];
      this.accB = sym.map(([t, c], i) => box(R, P36.ax + i * 48, P36.rB, 40, P36.rh, { boxSizing: 'border-box', borderRadius: '8px', border: `2px solid ${c}`, background: A(c, 0.18),
        display: 'grid', placeItems: 'center', font: '800 34px/1 var(--display)', color: c }, t, 'a'));
      this.r2 = box(R, P36.lx, 450, 820, null, { fontSize: '30px' }, '<i style="background:var(--mint)"></i><span>정해진 단계(신호 감지 등)는 코드 파이프라인으로</span>', 's5-rule');
      this.card = box(R, P36.lx, 508, null, null, { boxSizing: 'border-box', borderRadius: '16px', border: `2px solid ${A(COL.cyan, 0.6)}`, background: 'rgba(22,18,96,.62)',
        padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '820px' },
        `<span style="font:700 28px/1.3 var(--display);color:var(--cyan)">하네스 구현 제안:</span><span style="font:600 30px/1.3 var(--display);color:var(--ink);letter-spacing:-.02em">단일 에이전트 결과를 먼저 남겨 비교 기준으로 쓴다</span>`);
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt); UI.lineIn(this.q, lt, 0.05); V3.ruleHeadIn(this.RH, lt, 0.15);
      riseK(this.ch1, lt, 1.1, { y: 12 }); riseK(this.ch2, lt, 1.2, { y: 12 });
      // ② 비교: 두 구성의 비용·정확도 눈금
      riseK(this.r1, lt, 1.65, { x: -20, y: 0 });
      riseK(this.hC, lt, 1.9, { y: 10 }); riseK(this.hA, lt, 1.95, { y: 10 });
      riseK(this.lA, lt, 1.9, { x: -14, y: 0 }); riseK(this.lB, lt, 1.96, { x: -14, y: 0 });
      popK(this.single, lt, 2.0, { from: 0.6 });
      const ins = prog(lt, 3.75, 0.6, ease.swift);
      this.split.forEach((b, i) => { popK(b, lt, 2.05 + i * 0.06, { from: 0.6 }); b.style.left = lerp(P36.bx + i * 62, P36.bx + i * 124, ins).toFixed(1) + 'px'; });
      this.cost.forEach((row, ri) => row.forEach(c => {
        const t = 2.3 + c.k * 0.09;
        const a = c.on ? prog(lt, t, 0.15) : prog(lt, 2.2, 0.2) * 0.6;
        c.el.setAttribute('opacity', a.toFixed(3));
      }));
      op(this.accA, prog(lt, 2.4, 0.3));
      this.accB.forEach((b, i) => popK(b, lt, 2.7 + i * 0.25, { from: 0.5 }));
      // ③ 나눌 때: 코드 상자가 사이사이에 끼워진다
      riseK(this.r2, lt, 3.65, { x: -20, y: 0 });
      this.codes.forEach((c, i) => {
        const p = prog(lt, 4.1 + i * 0.12, 0.45, ease.outBack), a = clamp((lt - 4.1 - i * 0.12) / 0.12);
        css(c, { opacity: a.toFixed(3), transform: `translateY(${((1 - p) * -46).toFixed(1)}px)` });
      });
      // ④ 구현 줄
      riseK(this.card, lt, 5.05, { x: 30, y: 0 });
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P37 · 규칙 6 분할·병합 · 구도 규칙-폭 ─────────
  // 움직임: 데이터 한 덩어리가 날짜 칸 5개(높이 40)로 갈라져 동시에 처리 → 형식 검사에서 한 칸이 산호색으로 걸림 → 결과 파일이 없는 그 칸만 다시 처리되어 초록 → 다섯 결과가 코드 상자로 모여 한 줄이 된다
  // 칸 높이 36: 위 제목·열 이름과 아래 두 줄(구현 줄·용어 줄) 사이를 14px 이상으로 벌리려고 칸을 줄였다
  const P37 = { ly: 354, lh: 36, lg: 4, fail: 2, S1: [120, 500], S2: [560, 900], S3: [960, 1290], S4: [1350, 1800], gate: 736 };
  const laneY = i => P37.ly + i * (P37.lh + P37.lg);
  DECK.slide({
    id: 'p37', stops: [1.5, 3.0, 4.3, 5.5, 6.8], exit: 0.5, bg: DECK.BGP.split,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: '발표자 제안 · revfactory/harness 2.1.0 워크플로 레시피(2026-09-26)' }, SEC));
      this.RH = V3.ruleHead(R, { n: 6, text: '작업은 *데이터 단위*로 나누고/결과는 정해진 형식으로 받아 코드가 병합한다', w: 1680, size: 56, top: 92 });
      this.c = UI.context(R, '앞 장은 에이전트를 나누는 기준, 이 장은 작업을 나누는 기준. 참고: 분산 처리의 분할·검사·병합 순서', { top: 99, left: 420, width: 1380 });
      const heads = ['날짜별 분할 5칸 동시 처리', '형식 검사: 1칸 실패', '실패한 칸만 다시', '코드가 병합'];
      const SX = [P37.S1, P37.S2, P37.S3, P37.S4];
      this.heads = heads.map((t, i) => box(R, SX[i][0], 306, null, null, { fontSize: '30px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' },
        `<span style="display:block;width:14px;height:28px;border-radius:4px;background:${i === 1 ? COL.coral : i === 3 ? COL.mint : COL.cyan}"></span>${t}`, 's5-lbl'));
      const v = fullSvg(R);
      const y0 = laneY(0), y4 = laneY(4) + P37.lh, my = (y0 + y4) / 2;
      this.my = my;
      this.blob = box(R, P37.S1[0], y0, P37.S1[1] - P37.S1[0], y4 - y0, { borderRadius: '10px', background: A(COL.lav, 0.22), border: `2px solid ${A(COL.lav, 0.6)}`, boxSizing: 'border-box' }, '', 's5-bar');
      this.lanes = [0, 1, 2, 3, 4].map(i => {
        const L = box(R, P37.S1[0], laneY(i), P37.S1[1] - P37.S1[0], P37.lh, null, `<span class="f"></span><span class="ic" style="top:3px">${ico('cal', 26, COL.cyan, 2.2)}</span><span class="ic" style="left:auto;right:10px;top:3px">${ico('spin', 26, COL.cyan, 2.4)}</span>`, 's5-lane');
        L._f = L.querySelector('.f'); L._spin = L.querySelectorAll('.ic')[1]; L._sp = 0.62 + rand(i, 11) * 0.2;
        return L;
      });
      this.gate = s('path', { d: `M${P37.gate},${y0 - 2} V${y4 + 2}`, stroke: COL.cyan, 'stroke-width': 4, 'stroke-dasharray': '7 6', fill: 'none' }, v);
      this.paths = [0, 1, 2, 3, 4].map(i => {
        const y = laneY(i) + P37.lh / 2;
        return {
          a: drawable(s('path', { d: `M${P37.S1[1] + 6},${y} H${P37.gate - 4}`, stroke: A(COL.lav, 0.5), 'stroke-width': 2.5, fill: 'none' }, v)),
          b: drawable(s('path', { d: `M${P37.gate + 4},${y} H${P37.S3[0] - 6}`, stroke: A(COL.lav, 0.5), 'stroke-width': 2.5, fill: 'none' }, v)),
          c: drawable(s('path', { d: `M${P37.S3[0] + 44},${y} H${P37.S3[1]}`, stroke: A(COL.mint, 0.45), 'stroke-width': 2.5, fill: 'none' }, v)),
          d: drawable(s('path', { d: `M${P37.S3[1] + 4},${y} C${P37.S4[0] - 20},${y} ${P37.S4[0] - 30},${(y + my) / 2} ${P37.S4[0] + 2},${(y + my) / 2}`, stroke: A(COL.mint, 0.6), 'stroke-width': 2.5, fill: 'none' }, v)),
        };
      });
      this.marks = [0, 1, 2, 3, 4].map(i => {
        const bad = i === P37.fail;
        return box(R, P37.gate - 16, laneY(i) + 2, 32, 32, { borderRadius: '50%', background: '#0c0b3e', border: `2.5px solid ${bad ? COL.coral : COL.mint}`, display: 'grid', placeItems: 'center', boxSizing: 'border-box' },
          ico(bad ? 'x' : 'check', 20, bad ? COL.coral : COL.mint, 3.2));
      });
      this.tok = [0, 1, 2, 3, 4].map(i => box(R, 0, laneY(i) + 6, 24, 24, { borderRadius: '6px', background: COL.cyan, boxShadow: '0 0 12px rgba(111,226,255,.6)' }, '', 's5-bar'));
      this.files = [0, 1, 2, 3, 4].map(i => box(R, P37.S3[0] + 4, laneY(i) + 2, 32, 32, { display: 'grid', placeItems: 'center' }, ico('file', 28, COL.mint, 2.2), 'a'));
      this.re = box(R, P37.S3[0] + 48, laneY(P37.fail), P37.S3[1] - P37.S3[0] - 48, P37.lh, null, `<span class="f" style="background:rgba(115,245,198,.5)"></span><span class="ic" style="left:auto;right:10px;top:3px">${ico('spin', 26, COL.mint, 2.4)}</span>`, 's5-lane');
      this.re._f = this.re.querySelector('.f'); this.re._spin = this.re.querySelector('.ic');
      this.code = box(R, P37.S4[0], y0, 200, y4 - y0, null, `${ico('code', 52, COL.mint)}`, 's5-ag code');
      this.outLine = box(R, P37.S4[0] + 236, my - 22, 0, 44, { borderRadius: '8px', background: `linear-gradient(90deg, ${COL.mint}, ${COL.cyan})`, boxShadow: '0 0 22px rgba(115,245,198,.5)' }, '', 's5-bar');
      this.outArrow = drawable(s('path', { d: `M${P37.S4[0] + 204},${my} H${P37.S4[0] + 228}`, stroke: COL.mint, 'stroke-width': 3, fill: 'none' }, v));
      this.segs = [1, 2, 3, 4].map(k => box(R, P37.S4[0] + 236 + k * 42.8, my - 22, 2, 44, { background: 'rgba(12,11,62,.55)' }, '', 's5-bar'));
      this.l1 = box(R, 120, 560, null, null, null,
        '결과 파일 없는 분할만 다시<span class="d">(제안)</span> <span class="d">·</span> 하네스 구현: 분할 실행<span style="font:600 28px var(--mono);color:#cfeeff">(pipeline)</span>·칸마다 에이전트<span style="font:600 28px var(--mono);color:#cfeeff">(agent)</span>·형식 검사<span style="font:600 28px var(--mono);color:#cfeeff">(schema)</span>', 's5-lbl');
      this.term = UI.term(R, '스키마(출력 형식)', '결과에 어떤 항목이 어떤 형식으로 있어야 하는지 정한 규격', { top: 610, left: 120, width: 1680 });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt); V3.ruleHeadIn(this.RH, lt, 0.08); UI.lineIn(this.c, lt, 0.9);
      const F = P37.fail;
      this.heads.forEach((hh, i) => riseK(hh, lt, [1.55, 3.05, 4.35, 5.55][i], { y: 12 }));
      // ② 분할과 동시 처리
      const sp = prog(lt, 1.85, 0.4, ease.outBack);
      css(this.blob, { opacity: (prog(lt, 1.55, 0.2) * (1 - prog(lt, 1.9, 0.2))).toFixed(3) });
      this.lanes.forEach((L, i) => {
        const a = clamp((lt - 1.85) / 0.08);
        const y = lerp(this.my - P37.lh / 2, laneY(i), sp);
        const pf = prog(lt, 2.2, L._sp, ease.inOutSine);
        const bad = prog(lt, 3.75, 0.2) * (i === F ? 1 : 0);
        css(L, { opacity: a.toFixed(3), top: y.toFixed(1) + 'px', borderColor: bad ? mix(RGB.lav, RGB.coral, bad, 0.9) : (pf >= 1 ? 'rgba(111,226,255,.7)' : 'rgba(190,169,255,.5)') });
        css(L._f, { width: (pf * 100).toFixed(1) + '%', background: i === F && bad ? 'rgba(255,122,138,.42)' : 'rgba(111,226,255,.42)' });
        css(L._spin, { opacity: ((pf > 0 && pf < 1 ? 1 : 0) * a).toFixed(2), transform: `rotate(${((lt - 2.2) * 540).toFixed(0)}deg)` });
      });
      // ③ 형식 검사
      const gp = prog(lt, 3.05, 0.3);
      this.gate.style.clipPath = `inset(0 0 ${((1 - gp) * 100).toFixed(1)}% 0)`; op(this.gate, gp > 0 ? 1 : 0);
      this.paths.forEach((p, i) => { draw(p.a, prog(lt, 3.1 + i * 0.03, 0.3)); draw(p.b, prog(lt, 3.85, 0.3) * (i === F ? 0 : 1) + prog(lt, 5.2, 0.25) * (i === F ? 1 : 0)); });
      this.marks.forEach((m, i) => popK(m, lt, 3.7 + i * 0.04, { from: 0.4 }));
      this.tok.forEach((t, i) => {
        const bad = i === F;
        const x0 = P37.S1[1] - 32, xg = P37.gate - 46, xs3 = P37.S3[1] - 32;
        let x = lerp(x0, xg, prog(lt, 3.2 + i * 0.03, 0.45, ease.inOutCubic));
        if (!bad) x = lerp(x, xs3, prog(lt, 3.95 + i * 0.03, 0.55, ease.inOutCubic));
        else x = lerp(x, xs3, prog(lt, 5.15, 0.3, ease.inOutCubic));
        const mq = prog(lt, 5.65 + i * 0.05, 0.4, ease.inOutCubic);
        const fx = lerp(x, P37.S4[0] + 88, mq), fy = lerp(laneY(i) + 6, this.my - 12, mq);
        const shake = bad && lt > 3.75 ? Math.sin((lt - 3.75) * 50) * 5 * (1 - prog(lt, 3.75, 0.35)) : 0;
        const badK = bad ? prog(lt, 3.75, 0.15) * (1 - prog(lt, 5.1, 0.15)) : 0;
        const vis = prog(lt, 3.15, 0.15) * (1 - prog(lt, 5.95 + i * 0.05, 0.12));
        css(t, { left: (fx + shake).toFixed(1) + 'px', top: fy.toFixed(1) + 'px', opacity: vis.toFixed(3),
          background: badK > 0.5 ? COL.coral : (lt > 3.9 ? COL.mint : COL.cyan), boxShadow: badK > 0.5 ? '0 0 14px rgba(255,122,138,.8)' : '0 0 12px rgba(115,245,198,.55)' });
      });
      UI.lineIn(this.term, lt, 3.85);
      // ④ 결과 파일이 있는 칸은 건너뛰고, 없는 칸만 다시 처리
      this.files.forEach((f, i) => {
        if (i === F) { popK(f, lt, 5.12, { from: 0.4 }); f.style.left = (P37.S3[1] - 40) + 'px'; }
        else popK(f, lt, 4.4 + i * 0.05, { from: 0.4 });
      });
      this.paths.forEach((p, i) => draw(p.c, i === F ? 0 : prog(lt, 4.55 + i * 0.04, 0.35)));
      const pr = prog(lt, 4.55, 0.55, ease.inOutSine);
      riseK(this.re, lt, 4.45, { x: -16, y: 0, dur: 0.3 });
      css(this.re._f, { width: (pr * 100).toFixed(1) + '%' });
      css(this.re, { borderColor: mix(RGB.coral, RGB.mint, prog(lt, 5.05, 0.2), 0.85) });
      css(this.re._spin, { opacity: pr > 0 && pr < 1 ? '1' : '0', transform: `rotate(${((lt - 4.55) * 540).toFixed(0)}deg)` });
      // ⑤ 코드가 병합 → 한 줄
      riseK(this.code, lt, 5.55, { y: 0, from: 0.9, dur: 0.35 });
      this.paths.forEach((p, i) => draw(p.d, prog(lt, 5.6 + i * 0.04, 0.35)));
      draw(this.outArrow, prog(lt, 6.05, 0.15));
      const ow = prog(lt, 6.1, 0.45, ease.outCubic);
      css(this.outLine, { width: (214 * ow).toFixed(1) + 'px' });
      this.segs.forEach((g, k) => op(g, ow > (k + 1) / 5 ? 1 : 0));
      riseK(this.l1, lt, 6.3, { y: 12 });
      UI.exit(this.R, lt, ctx);
    },
  });
})();
