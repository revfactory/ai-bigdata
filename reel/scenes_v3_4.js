/* 섹션 4 장면(v3) — 계산 위치 P21~P28
 * 공용 부품: UI(ui.js), V3(ui_v3.js). 이 파일 안 보조 함수: box(흐름 상자), arrow(화살표), stripGeo(12칸 달력 띠)
 * 사례 표시: V3.story — 웹케시 P22~P24(k1~3 n3), 데브시스터즈 P25(k3 n3)
 * 2차 구도: P22 기, P23 라, P24 가, P25 기(전/후 위아래), P26 가R, P27·P28 규칙-좌
 */
(function () {
  'use strict';
  const { clamp, lerp, prog, ease, h, s, css, spring, rand, noise, kf } = REEL;
  const SEC = { sec: '04', name: '계산 위치' };
  const SRC_WK = 'ZDNet Korea(남혁우) · 웹케시 은행용 에이전트 기사 · 2026-10-07 · 회사 발표를 옮긴 기사';
  const C = { cyan: '#6fe2ff', mint: '#73f5c6', amber: '#ffcb66', coral: '#ff7a8a', pink: '#ff6ef2', violet: '#8f45ff', ink: '#f6f3ff' };

  const st = document.createElement('style');
  st.textContent = `
  .s4-box { position:absolute; box-sizing:border-box; border-radius:16px; border:2px solid rgba(190,170,255,.45);
            background:rgba(22,18,96,.62); display:flex; align-items:center; justify-content:center; text-align:center;
            font:700 30px/1.15 var(--display); color:var(--ink); letter-spacing:-.02em; padding:0 14px; white-space:nowrap; }
  .s4-box.cy { border-color:rgba(111,226,255,.85); background:rgba(111,226,255,.13); }
  .s4-box.mi { border-color:rgba(115,245,198,.85); background:rgba(115,245,198,.12); }
  .s4-box.co { border-color:rgba(255,122,138,.9); background:rgba(255,122,138,.14); }
  .s4-box.pk { border-color:rgba(255,110,242,.8); background:rgba(214,76,255,.16); }
  .s4-chip { position:absolute; box-sizing:border-box; height:46px; padding:0 16px; border-radius:12px; display:flex; align-items:center; justify-content:center;
             font:700 30px/1 var(--display); letter-spacing:-.02em; white-space:nowrap; border:2px solid; }
  .s4-lab { position:absolute; font:800 30px/1 var(--display); color:var(--ink); letter-spacing:-.02em; white-space:nowrap; }
  .s4-txt { position:absolute; font:600 30px/1.36 var(--display); color:var(--ink); letter-spacing:-.018em; }
  .s4-mark { position:absolute; font:600 28px/1 var(--display); color:var(--amber); border:1.5px solid rgba(255,203,102,.6);
             border-radius:8px; padding:5px 10px 6px; white-space:nowrap; }
  .s4-mono { font-family:var(--mono); }
  `;
  document.head.appendChild(st);

  // ── 보조 함수 ──
  function ask(R, text, top) { const el = UI.ask(R, text, { top }); el.style.fontSize = '30px'; return el; }
  function ctxLine(R, text, top, o = {}) { const el = UI.context(R, text, Object.assign({ top }, o)); el.style.fontSize = (o.size || 30) + 'px'; return el; }
  function box(R, x, y, w, hh, html, cls = '') { const el = h('div', 's4-box ' + cls, R, html); css(el, { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px' }); return el; }
  function chip(R, x, y, text, col) {
    const el = h('div', 's4-chip', R, text);
    css(el, { left: x + 'px', top: y + 'px', color: col, borderColor: col, background: UI.hexA(col, 0.14) });
    return el;
  }
  function lab(R, x, y, html, o = {}) { const el = h('div', 's4-lab', R, html); css(el, Object.assign({ left: x + 'px', top: y + 'px' }, o)); return el; }
  function txt(R, x, y, w, html, o = {}) { const el = h('div', 's4-txt', R, html); css(el, Object.assign({ left: x + 'px', top: y + 'px', width: w + 'px' }, o)); return el; }
  function svgLayer(R) { const v = s('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, R); css(v, { position: 'absolute', left: '0px', top: '0px', overflow: 'visible' }); return v; }
  function arrow(svg, x1, y1, x2, y2, col = 'rgba(200,190,255,.7)', w = 3) {
    const g = s('g', {}, svg);
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
    const ln = s('line', { x1, y1, x2: x2 - ux * 8, y2: y2 - uy * 8, stroke: col, 'stroke-width': w, 'stroke-linecap': 'round' }, g);
    ln.style.strokeDasharray = L;
    const hd = s('path', { d: 'M0,0 L-15,-8.5 L-15,8.5 Z', fill: col, transform: `translate(${x2},${y2}) rotate(${(Math.atan2(uy, ux) * 180 / Math.PI).toFixed(1)})` }, g);
    return { g, ln, hd, L };
  }
  function arrowIn(A, lt, t0, dur = 0.35) {
    const p = prog(lt, t0, dur, ease.outCubic);
    A.ln.style.strokeDashoffset = (A.L * (1 - p)).toFixed(1);
    A.hd.setAttribute('opacity', clamp((p - 0.8) / 0.2).toFixed(3));
    return p;
  }
  // 12칸 달력 띠(분기마다 간격): 칸 좌표 계산
  function stripGeo(x0, cw, gap, qgap) { return m => x0 + Math.floor((m - 1) / 3) * (3 * cw + 2 * gap + qgap) + ((m - 1) % 3) * (cw + gap); }
  function show(el, p) { el.style.opacity = p.toFixed(3); }

  // ════════════════ P21 · 간지 ════════════════
  DECK.slide({
    id: 'p21', stops: [3.0], exit: 0.5, bg: V3.DIV_BG,
    setup(el) {
      const R = this.R = UI.root(el);
      this.D = V3.divider(R, { num: '04', title: '계산 위치', sub: '날짜 해석과 집계를 에이전트가 할지 코드와 DB에 맡길지', active: 1, done: [0] });
      const ck = this.ck = this.D.F.cells[0].querySelector('.v3-ck');
      if (ck) {
        this.ckPath = ck.querySelector('path'); this.ckCirc = ck.querySelector('circle');
        this.ckPath.style.strokeDasharray = '22'; ck.style.transformOrigin = '50% 50%';
      }
    },
    render(lt, ctx) {
      V3.dividerIn(this.D, lt);
      // ① 칸에 체크가 찍힌 뒤(1.55~2.0) ② 칸이 켜진다(frameIn activeAt 2.05)
      if (this.ck) {
        const sp = spring(lt, 1.55, 2.6, 0.5), p = clamp((lt - 1.55) / 0.12);
        css(this.ck, { opacity: p.toFixed(3), transform: `scale(${lerp(0.3, 1, sp).toFixed(3)})` });
        this.ckPath.style.strokeDashoffset = (22 * (1 - prog(lt, 1.7, 0.35, ease.outCubic))).toFixed(1);
      }
      UI.exit(this.R, lt, ctx);
    },
  });

  // 글 칸 안에서 줄바꿈되는 질문 줄(가·가R 구도)
  function askBox(R, text, top, left, width) {
    const el = UI.ask(R, text, { top, left });
    css(el, { fontSize: '30px', whiteSpace: 'normal', width: width + 'px', alignItems: 'flex-start', lineHeight: '1.3' });
    const b = el.querySelector('b'); if (b) css(b, { flex: 'none', marginTop: '4px' });
    return el;
  }

  // ════════════════ P22 · 사례 장면(웹케시 1/3) — 구도 기 ════════════════
  DECK.slide({
    id: 'p22', stops: [1.5, 2.5, 4.6, 5.5], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: SRC_WK }, SEC));
      this.st = V3.story(this.hd, { name: '웹케시', k: 1, n: 3 });
      this.q = ask(R, "'2분기 실적'을 물으면 에이전트는 어느 기간을 계산하나", 112);
      this.T = UI.title(R, "은행용 에이전트는 초기 테스트에서/*'2분기 실적'*의 날짜 범위부터 틀렸다", { top: 156, size: 66 });
      this.cx = ctxLine(R, '웹케시(기업·금융기관용 금융 소프트웨어 회사). 은행장·본부장과 영업점 지점장 130여 명이 쓰는 에이전트(기사)', 314, { size: 28 });
      const sv = this.sv = svgLayer(R);
      const TY = this.TY = 394;
      this.base = s('line', { x1: 120, y1: TY, x2: 1800, y2: TY, stroke: 'rgba(190,170,255,.30)', 'stroke-width': 3 }, sv);
      this.base.style.strokeDasharray = 1680;
      this.pl = s('line', { x1: 120, y1: TY, x2: 120, y2: TY, stroke: C.cyan, 'stroke-width': 4, 'stroke-linecap': 'round' }, sv);
      this.DX = [150, 760, 1560];
      const DC = [C.cyan, C.coral, C.amber];
      this.dots = this.DX.map((x, i) => {
        const g = s('g', { transform: `translate(${x},${TY})` }, sv);
        s('circle', { r: 22, fill: UI.hexA(DC[i], 0.18) }, g); s('circle', { r: 11, fill: DC[i] }, g);
        return g;
      });
      this.t1 = txt(R, 136, 424, 600, '전에는 요청서 작성부터 보고서까지<br>8단계였던 일을 질문 하나로');
      this.t2 = txt(R, 746, 424, 580, "<span style=\"color:var(--coral)\">'2분기 실적'</span> → 잘못된 날짜 범위,<br>근거 없는 증감률");
      this.t3 = txt(R, 1340, 424, 440, '은행 업무에 사용할<br>수 없는 수준', { fontWeight: 800, color: 'var(--amber)', textAlign: 'center' });
      // 8단계 → 질문 1개: 작은 칸 8개가 한 칸으로 모인다
      this.sq = [];
      for (let i = 0; i < 8; i++) {
        const q = h('div', 'a', R); css(q, { left: (140 + i * 46) + 'px', top: '536px', width: '36px', height: '36px', borderRadius: '8px',
          border: '2px solid rgba(111,226,255,.7)', background: 'rgba(111,226,255,.14)', boxSizing: 'border-box' });
        this.sq.push(q);
      }
      this.q1 = lab(R, 200, 539, '질문 1개', { color: 'var(--cyan)' });
      // 달력 띠(설명용): 12칸 56×52, x 640~1400. 실제 2분기(4~6) 점선, 에이전트가 쓴 범위(5~7) 산호색
      const cw = 56, gap = 4, qg = 56 / 3, x0 = 640, cy = 528;
      const X = stripGeo(x0, cw, gap, qg);
      this.cells = [];
      for (let m = 1; m <= 12; m++) {
        const c = h('div', 'a s4-mono', R, String(m));
        css(c, { left: X(m).toFixed(1) + 'px', top: cy + 'px', width: cw + 'px', height: '52px', borderRadius: '8px', boxSizing: 'border-box',
          border: '1.5px solid rgba(190,170,255,.5)', background: 'rgba(22,18,96,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: '600 30px/1 var(--mono)', color: 'var(--ink2)', letterSpacing: '-.04em' });
        this.cells.push(c);
      }
      this.q2 = h('div', 'a', R); css(this.q2, { left: (X(4) - 6).toFixed(1) + 'px', top: (cy - 6) + 'px', width: (X(6) + cw - X(4) + 12).toFixed(1) + 'px', height: '64px',
        borderRadius: '12px', border: '2.5px dashed rgba(115,245,198,.9)', boxSizing: 'border-box' });
      this.bad = h('div', 'a', R); css(this.bad, { left: X(5).toFixed(1) + 'px', top: cy + 'px', width: (X(7) + cw - X(5)).toFixed(1) + 'px', height: '52px', borderRadius: '8px',
        background: 'rgba(255,122,138,.30)', border: '2.5px solid rgba(255,122,138,.95)', boxSizing: 'border-box', transformOrigin: '0 50%' });
      this.badMid = (X(5) + X(7) + cw) / 2;
      this.chipQ = chip(R, 0, 0, "'2분기'", C.coral);
      css(this.chipQ, { height: '42px', padding: '0 12px', fontSize: '28px' });
      this.chipEnd = { x: this.badMid - 52, y: 602 };
      this.mk = h('div', 's4-mark', R, '설명용 예시'); css(this.mk, { left: '1418px', top: (cy + 9) + 'px' });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt); V3.storyIn(this.st, lt, 0.3);
      UI.lineIn(this.q, lt, 0.05); UI.titleIn(this.T, lt, 0.2); UI.lineIn(this.cx, lt, 0.85);
      this.base.style.strokeDashoffset = (1680 * (1 - prog(lt, 0.9, 0.6, ease.outCubic))).toFixed(0);
      const px = kf(lt, [[1.45, 120], [1.75, this.DX[0], ease.outCubic], [2.5, this.DX[0]], [2.95, this.DX[1], ease.inOutCubic], [4.6, this.DX[1]], [5.0, this.DX[2], ease.inOutCubic], [5.4, 1800, ease.outCubic]]);
      this.pl.setAttribute('x2', px.toFixed(1)); this.pl.setAttribute('opacity', lt > 1.45 ? 1 : 0);
      const dt = [1.6, 2.85, 4.92];
      this.dots.forEach((g, i) => {
        const sp = spring(lt, dt[i], 2.6, 0.5), p = clamp((lt - dt[i]) / 0.1);
        g.setAttribute('transform', `translate(${this.DX[i]},${this.TY}) scale(${(lerp(0.2, 1, sp)).toFixed(3)})`); g.setAttribute('opacity', p.toFixed(3));
      });
      UI.rise(this.t1, lt, 1.68, { y: 18 }); UI.rise(this.t2, lt, 2.95, { y: 18 }); UI.rise(this.t3, lt, 5.0, { y: 18 });
      const mg = prog(lt, 2.0, 0.45, ease.inOutCubic);
      this.sq.forEach((q, i) => {
        const a = prog(lt, 1.78 + i * 0.03, 0.3, ease.snap);
        css(q, { opacity: (a * (i === 0 ? 1 : 1 - mg * 0.999)).toFixed(3), transform: `translateX(${(-i * 46 * mg).toFixed(1)}px) scale(${(i === 0 ? 1 + 0.25 * mg : 1).toFixed(3)})` });
        if (i === 0) css(q, { background: `rgba(111,226,255,${(0.14 + 0.4 * mg).toFixed(3)})` });
      });
      UI.rise(this.q1, lt, 2.35, { x: -12, y: 0, blur: 0 });
      this.cells.forEach((c, i) => { const p = prog(lt, 3.05 + i * 0.03, 0.35, ease.snap); css(c, { opacity: p.toFixed(3), transform: `translateY(${((1 - p) * 14).toFixed(1)}px)` }); });
      show(this.q2, prog(lt, 3.45, 0.35));
      const fp = prog(lt, 3.6, 0.6, ease.inOutCubic);
      const sx = 746 + 2, sy = 424 - 1;
      const x = lerp(sx, this.chipEnd.x, fp), y = lerp(sy, this.chipEnd.y, fp) - Math.sin(fp * Math.PI) * 40;
      css(this.chipQ, { left: x.toFixed(1) + 'px', top: y.toFixed(1) + 'px', opacity: clamp((lt - 3.55) / 0.08).toFixed(3) });
      const bp = prog(lt, 4.05, 0.4, ease.snap);
      css(this.bad, { opacity: bp.toFixed(3), transform: `scaleX(${bp.toFixed(3)})` });
      UI.rise(this.mk, lt, 4.25, { y: 10, blur: 0 });
      UI.exit(this.R, lt, ctx);
    },
  });

  // ════════════════ P23 · 전후 변환(웹케시 2/3) — 구도 라: 도식 먼저, 제목은 움직임 뒤 ════════════════
  DECK.slide({
    id: 'p23', stops: [0.6, 1.9, 3.3, 5.0], exit: 0.5, bg: DECK.BGP.text,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: SRC_WK }, SEC));
      this.st = V3.story(this.hd, { name: '웹케시', k: 2, n: 3 });
      this.cx = ctxLine(R, '업무 용어 317개를 DB 컬럼 879개에 연결, 계산 방식 128개는 규칙으로 정의. 적용 뒤 정확도는 기사에 없다', 120, { size: 28 });
      const sv = this.sv = svgLayer(R);
      const Y1 = 190, Y2 = 292, H = 76;
      this.l1 = lab(R, 120, Y1 + 23, '전', { color: 'var(--ink2)' });
      this.l2 = lab(R, 120, Y2 + 23, '후', { color: 'var(--mint)' });
      this.slot1 = box(R, 380, Y1, 490, H, '<span style="margin-left:126px">에이전트 해석</span>', 'pk');
      this.a11 = arrow(sv, 308, Y1 + 38, 372, Y1 + 38);
      this.a12 = arrow(sv, 878, Y1 + 38, 938, Y1 + 38);
      this.rg1 = box(R, 946, Y1, 500, H, '<span style="flex:1;text-align:left">범위가 매번 다름</span>', '');
      this.slot2 = box(R, 380, Y2, 490, H, '<span style="margin-left:126px">규칙 엔진(규칙 32개)</span>', 'cy');
      this.a22 = arrow(sv, 878, Y2 + 38, 938, Y2 + 38, 'rgba(115,245,198,.8)');
      this.rg2 = box(R, 946, Y2, 500, H, '<span style="flex:1;text-align:left">범위 고정</span>', 'mi');
      this.a23 = arrow(sv, 1454, Y2 + 38, 1504, Y2 + 38, 'rgba(115,245,198,.8)');
      this.calc = box(R, 1512, Y2, 288, H, '에이전트가 계산', 'pk');
      const mkStrip = (parent) => {
        const w = h('div', 'a', parent); css(w, { right: '18px', top: '22px', width: '201px', height: '30px' });
        const X = stripGeo(0, 13, 3, 7), cs = [];
        for (let m = 1; m <= 12; m++) { const c = h('div', 'a', w); css(c, { left: X(m) + 'px', top: '0px', width: '13px', height: '30px', borderRadius: '3px', background: 'rgba(190,170,255,.25)' }); cs.push(c); }
        return { w, cs };
      };
      this.st1 = mkStrip(this.rg1); this.st2 = mkStrip(this.rg2);
      this.qc = chip(R, 192, Y1 + 15, "'2분기'", C.amber); css(this.qc, { height: '46px', width: '110px', padding: '0' });
      this.qStart = { x: 192, y: Y1 + 15 }; this.qMid = { x: 394, y: Y1 + 15 }; this.qEnd = { x: 394, y: Y2 + 15 };
      this.ghost = h('div', 'a', R); css(this.ghost, { left: '394px', top: (Y1 + 15) + 'px', width: '110px', height: '46px', borderRadius: '12px', border: '2px dashed rgba(255,110,242,.7)', boxSizing: 'border-box' });
      const by = Y2 + H;
      this.back = s('path', { d: `M 450 ${by + 4} C 450 ${by + 46}, 290 ${by + 46}, 250 ${by + 8}`, fill: 'none', stroke: C.amber, 'stroke-width': 3, 'stroke-dasharray': '7 7' }, sv);
      this.backHd = s('path', { d: 'M0,0 L-14,-8 L-14,8 Z', fill: C.amber, transform: `translate(246,${by + 5}) rotate(-140)` }, sv);
      this.ask2 = lab(R, 500, by + 24, '모호하면 되묻는다', { color: 'var(--amber)' });
      this.tm = UI.term(R, '규칙 엔진', '미리 적어 둔 조건에 따라 같은 입력에 늘 같은 결과를 내는 코드', { top: by + 22, left: 860, width: 940 });
      this.T = UI.title(R, '날짜 해석은 *규칙 32개*로 고정하고/계산식 생성과 계산은 에이전트가 맡았다', { top: 452, size: 62 });
      this.mn = UI.meaning(R, '→ 늘 같아야 하는 단계를 규칙으로 옮겼다', { top: 606, size: 30 });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt); V3.storyIn(this.st, lt, 0.3);
      UI.lineIn(this.cx, lt, 0.1);
      const a = DECK.amb(ctx.t);
      // ② 전 흐름: '2분기' → 에이전트 해석 → 범위가 매번 다름(띠가 계속 흔들린다)
      UI.rise(this.l1, lt, 0.6, { x: -16, y: 0, blur: 0 });
      arrowIn(this.a11, lt, 0.8); UI.rise(this.slot1, lt, 0.75, { y: 16 }); arrowIn(this.a12, lt, 0.95); UI.rise(this.rg1, lt, 1.05, { y: 16 });
      const p1 = prog(lt, 1.25, 0.45, ease.inOutCubic), p2 = prog(lt, 1.95, 0.55, ease.inOutCubic);
      let qx = lerp(this.qStart.x, this.qMid.x, p1), qy = lerp(this.qStart.y, this.qEnd.y, p2);
      qx += Math.sin(p2 * Math.PI) * -26;
      css(this.qc, { left: qx.toFixed(1) + 'px', top: qy.toFixed(1) + 'px', opacity: prog(lt, 0.65, 0.3).toFixed(3) });
      const toMint = prog(lt, 2.35, 0.3);
      const cc = [255, 203, 102].map((v, i) => Math.round(lerp(v, [115, 245, 198][i], toMint)));
      css(this.qc, { color: `rgb(${cc})`, borderColor: `rgb(${cc})`, background: `rgba(${cc},.14)` });
      const jit = lt > 1.6 ? clamp(Math.round(3 + 2.2 * noise(a * 1.6, 3)), 0, 9) : -1;
      this.st1.cs.forEach((c, i) => { c.style.background = (jit >= 0 && i >= jit && i < jit + 3) ? 'rgba(255,122,138,.95)' : 'rgba(190,170,255,.25)'; });
      const on2 = prog(lt, 2.7, 0.3);
      this.st2.cs.forEach((c, i) => { c.style.background = (i >= 3 && i < 6 && on2 > 0) ? `rgba(115,245,198,${(0.95 * on2).toFixed(2)})` : 'rgba(190,170,255,.25)'; });
      // ③ 후 흐름: 칩이 규칙 엔진 칸으로 내려가고 범위가 고정된다. 전 흐름은 0.6까지만 흐려진다
      UI.rise(this.l2, lt, 1.95, { x: -16, y: 0, blur: 0 });
      UI.rise(this.slot2, lt, 1.95, { y: 16 }); arrowIn(this.a22, lt, 2.5); UI.rise(this.rg2, lt, 2.55, { y: 16 });
      arrowIn(this.a23, lt, 2.8); UI.rise(this.calc, lt, 2.9, { y: 16 });
      const dim = prog(lt, 2.4, 0.5);
      [this.slot1, this.rg1].forEach(e => { e.style.opacity = (parseFloat(e.style.opacity || 1) * lerp(1, 0.62, dim)).toFixed(3); });
      [this.a11.g, this.a12.g].forEach(g => g.setAttribute('opacity', lerp(1, 0.62, dim).toFixed(3)));
      this.ghost.style.opacity = (prog(lt, 2.0, 0.3) * 0.8).toFixed(3);
      // ④ 되묻기 · 용어 → 제목(결론) → 의미 줄
      const bp = prog(lt, 3.3, 0.45, ease.outCubic);
      this.back.setAttribute('opacity', bp > 0 ? 1 : 0);
      this.back.style.clipPath = `inset(0 0 0 ${((1 - bp) * 100).toFixed(1)}%)`;
      this.backHd.setAttribute('opacity', clamp((bp - 0.85) / 0.15).toFixed(3));
      UI.rise(this.ask2, lt, 3.4, { x: -14, y: 0 });
      UI.lineIn(this.tm, lt, 3.55);
      UI.titleIn(this.T, lt, 3.7, { each: 0.022 });
      UI.lineIn(this.mn, lt, 4.5);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ════════════════ P24 · 위치 비교(웹케시 3/3) — 구도 가: 왼쪽 글 칸, 오른쪽 세로 DB ════════════════
  DECK.slide({
    id: 'p24', stops: [1.4, 3.2, 4.6, 5.6], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: SRC_WK }, SEC));
      this.st = V3.story(this.hd, { name: '웹케시', k: 3, n: 3 });
      // 왼쪽 글 칸 x 120~800
      this.q = ask(R, '하루 2,400만 건이 적재되는 테이블은 어디서 계산하나', 110);
      this.T = UI.title(R, '하루 2,400만 건이 적재되는/테이블에 옵티마이저 힌트를/넣자 조회가 20분에서/*5초*가 됐다', { top: 158, size: 56, width: 700 });
      this.cx = ctxLine(R, '같은 사례. SQL에 테이블별 옵티마이저 힌트를 자동으로 넣었다', 428, { size: 28, width: 680 });
      this.tm = UI.term(R, '옵티마이저 힌트', '데이터베이스에 실행 방법을 지정하는 SQL 주석', { top: 512, left: 120, width: 740 });
      this.mn = UI.meaning(R, '→ 데이터는 두고 질의를 보낸다', { top: 596, size: 30 });
      // 오른쪽 도식 x 860~1800: 가운데 세로 DB, 왼쪽 아래 에이전트(원본 행), 오른쪽 위 에이전트(질의)
      const sv = this.sv = svgLayer(R);
      const g = this.db = s('g', {}, sv);
      const cx = 1265, top = 168, bot = 528, rx = 125, ry = 28;
      this.dbGlow = s('ellipse', { cx, cy: 350, rx: 170, ry: 230, fill: 'rgba(111,226,255,.16)', opacity: 0 }, sv);
      sv.appendChild(g);
      s('path', { d: `M ${cx - rx} ${top} L ${cx - rx} ${bot} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bot} L ${cx + rx} ${top}`, fill: 'rgba(111,226,255,.12)', stroke: C.cyan, 'stroke-width': 2.5 }, g);
      for (let y = top + 34; y < bot; y += 22) s('path', { d: `M ${cx - rx} ${y} A ${rx} ${ry} 0 0 0 ${cx + rx} ${y}`, fill: 'none', stroke: 'rgba(111,226,255,.22)', 'stroke-width': 1.3 }, g);
      s('ellipse', { cx, cy: top, rx, ry, fill: 'rgba(30,40,140,.95)', stroke: C.cyan, 'stroke-width': 2.5 }, g);
      const dbt = s('text', { x: cx, y: 300, 'text-anchor': 'middle', 'font-family': 'Pretendard', 'font-weight': 900, 'font-size': 52, fill: C.ink }, g); dbt.textContent = 'DB';
      this.dbL = h('div', 'a', R, '하루 약<br>2,400만 건<br>적재'); css(this.dbL, { left: (cx - 120) + 'px', top: '320px', width: '240px', textAlign: 'center', font: '700 30px/1.36 var(--display)', color: 'var(--ink)' });
      // 왼쪽 아래: 설명용 그림 라벨 + 에이전트 상자
      this.lL = h('div', 'a', R, '<span style="color:var(--amber)">설명용 그림:</span><br>원본 행을<br>에이전트로 가져오는<br>방식(측정값 없음)');
      css(this.lL, { left: '870px', top: '150px', width: '270px', font: '700 28px/1.36 var(--display)', color: 'var(--ink)', letterSpacing: '-.02em' });
      const mkAgent = (x, y, w, hh) => {
        const b = h('div', 'a', R); css(b, { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px', borderRadius: '18px', boxSizing: 'border-box',
          border: '2px solid rgba(255,110,242,.75)', background: 'rgba(214,76,255,.12)' });
        const t = h('div', 'a', b, '에이전트'); css(t, { left: '16px', top: '12px', font: '800 30px/1 var(--display)', color: 'var(--ink)', letterSpacing: '-.02em' });
        const inp = h('div', 'a', b); css(inp, { left: '14px', top: '54px', width: (w - 28) + 'px', height: (hh - 68) + 'px', borderRadius: '10px', border: '1.5px dashed rgba(220,200,255,.45)', boxSizing: 'border-box', overflow: 'hidden' });
        return { b, t, inp };
      };
      this.AL = mkAgent(868, 452, 262, 174);
      this.AR = mkAgent(1560, 130, 240, 150);
      this.stack = [];
      for (let i = 0; i < 17; i++) { const r = h('div', 'a', this.AL.inp); css(r, { left: '8px', bottom: (4 + i * 5.6) + 'px', width: (180 + rand(i, 4) * 36) + 'px', height: '3.5px', borderRadius: '2px', background: i < 14 ? 'rgba(255,140,240,.85)' : 'rgba(255,122,138,.95)' }); this.stack.push(r); }
      // 오른쪽 위: 질의 칩·결과 한 줄 + 라벨 + 20분 → 5초
      this.res = h('div', 'a', R);
      css(this.res, { left: '0px', top: '0px', width: '150px', height: '26px', borderRadius: '6px', border: '2px solid var(--mint)', background: 'rgba(115,245,198,.22)', boxSizing: 'border-box' });
      for (let i = 1; i < 4; i++) { const d = h('div', 'a', this.res); css(d, { left: (i * 36.5) + 'px', top: '3px', width: '1.5px', height: '16px', background: 'rgba(115,245,198,.8)' }); }
      this.sql = chip(R, 0, 0, 'SQL', C.cyan); css(this.sql, { height: '40px', fontFamily: 'var(--mono)', fontSize: '26px', padding: '0 12px' });
      this.lane = s('line', { x1: cx + rx + 4, y1: 205, x2: 1556, y2: 205, stroke: 'rgba(111,226,255,.4)', 'stroke-width': 2, 'stroke-dasharray': '6 8' }, sv);
      this.lR = h('div', 'a', R, '질의를 DB로 보내고<br>집계 결과만 받기'); css(this.lR, { left: '1400px', top: '310px', width: '400px', textAlign: 'right', font: '800 30px/1.36 var(--display)', color: 'var(--cyan)', letterSpacing: '-.02em' });
      this.num = h('div', 'a', R,
        `<span style="position:relative;color:var(--dim)">20분<i style="position:absolute;left:-4px;right:-4px;top:52%;height:4px;background:var(--coral);transform-origin:0 50%"></i></span>` +
        `<span style="color:var(--ink2);margin:0 14px;font-weight:700">→</span><span class="n5" style="color:var(--cyan);display:inline-block">5초</span>`);
      css(this.num, { left: '1400px', top: '410px', width: '400px', textAlign: 'right', font: '900 64px/1 var(--num)', letterSpacing: '-.03em', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' });
      this.strike = this.num.querySelector('i'); this.n5 = this.num.querySelector('.n5');
      // 원본 행 흐름(캔버스): DB 왼쪽 벽 → 아래 왼쪽 에이전트 상자
      const cv = this.cv = h('canvas', 'a', R); cv.width = 1920; cv.height = 1080; css(cv, { left: '0px', top: '0px', width: '1920px', height: '1080px' });
      this.g2 = cv.getContext('2d');
      this.geo = { cx, rx };
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt); V3.storyIn(this.st, lt, 0.3);
      UI.lineIn(this.q, lt, 0.05); UI.titleIn(this.T, lt, 0.2, { each: 0.02 }); UI.lineIn(this.cx, lt, 0.9);
      const pd = prog(lt, 0.8, 0.6, ease.snap);
      this.db.setAttribute('opacity', pd.toFixed(3)); this.db.setAttribute('transform', `translate(0 ${((1 - pd) * 24).toFixed(1)})`);
      UI.rise(this.dbL, lt, 1.0, { y: 10, blur: 0 });
      UI.rise(this.AL.b, lt, 1.0, { x: -20, y: 0 }); UI.rise(this.AR.b, lt, 1.1, { x: 20, y: 0 });
      // ② 원본 행이 DB에서 아래 왼쪽 에이전트로 쏟아져 입력 칸을 채운다(정지 뒤에도 흐른다)
      UI.rise(this.lL, lt, 1.4, { x: -18, y: 0 });
      const a = DECK.amb(ctx.t);
      const g = this.g2; g.clearRect(0, 0, 1920, 1080);
      const front = prog(lt, 1.5, 0.8, ease.linear);
      if (lt > 1.5) {
        for (let k = 0; k < 160; k++) {
          const sp = 0.55 + rand(k, 2) * 0.45;
          const ph = (rand(k, 1) + a * sp * 0.8) % 1;
          if (ph > front) continue;
          const x0 = this.geo.cx - this.geo.rx - 4, y0 = 330 + rand(k, 3) * 150;
          const x1 = 900 + rand(k, 7) * 200, y1 = 466;
          const e = ph * ph * 0.4 + ph * 0.6;
          const x = lerp(x0, x1, ph), y = lerp(y0, y1, e) + Math.sin(ph * 5 + k) * 2;
          const al = clamp(ph / 0.08) * clamp((1 - ph) / 0.12) * 0.85;
          g.fillStyle = `rgba(255,${120 + Math.round(rand(k, 5) * 60)},240,${al.toFixed(3)})`;
          g.fillRect(x, y, 24 + rand(k, 6) * 20, 4);
        }
      }
      const fill = prog(lt, 1.9, 1.2, ease.inOutQuad);
      this.stack.forEach((r, i) => { r.style.opacity = clamp(fill * this.stack.length - i).toFixed(3); });
      const full = prog(lt, 2.95, 0.3);
      this.AL.inp.style.borderColor = `rgba(${Math.round(lerp(220, 255, full))},${Math.round(lerp(200, 122, full))},${Math.round(lerp(255, 138, full))},${lerp(0.45, 0.95, full).toFixed(2)})`;
      this.AL.inp.style.borderStyle = full > 0.5 ? 'solid' : 'dashed';
      // ③ 질의 한 줄이 위 오른쪽에서 DB로 가고, 결과 한 줄만 돌아온다
      UI.rise(this.lR, lt, 3.2, { x: 18, y: 0 });
      this.lane.setAttribute('opacity', prog(lt, 3.25, 0.3).toFixed(3));
      const qp = prog(lt, 3.35, 0.55, ease.inOutCubic);
      css(this.sql, { left: lerp(1572, 1394, qp).toFixed(1) + 'px', top: '186px', opacity: (clamp((lt - 3.3) / 0.1) * (1 - prog(lt, 3.88, 0.12))).toFixed(3) });
      const gl = Math.max(0, Math.min(prog(lt, 3.88, 0.15), 1 - prog(lt, 4.05, 0.3)));
      this.dbGlow.setAttribute('opacity', (gl * 0.9).toFixed(3));
      const rp = prog(lt, 4.02, 0.5, ease.inOutCubic);
      const rx = lerp(1394, 1580, rp), ry = lerp(192, 236, prog(lt, 4.38, 0.18, ease.outCubic));
      css(this.res, { left: rx.toFixed(1) + 'px', top: ry.toFixed(1) + 'px', opacity: clamp((lt - 4.0) / 0.08).toFixed(3) });
      // ④ 20분 → 5초, 용어, 의미 줄
      UI.rise(this.num, lt, 4.6, { y: 14 });
      css(this.strike, { transform: `scaleX(${prog(lt, 4.85, 0.3, ease.outCubic).toFixed(3)})` });
      css(this.n5, { transform: `scale(${lt < 4.95 ? 1 : (1 + 0.18 * (1 - spring(lt, 4.95, 2.6, 0.45))).toFixed(3)})` });
      UI.lineIn(this.tm, lt, 3.6); UI.lineIn(this.mn, lt, 5.05);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ════════════════ P25 · 전후 변환(데브시스터즈 3/3) — 구도 기: 전/후 위아래 두 줄 ════════════════
  DECK.slide({
    id: 'p25', stops: [1.4, 3.0, 4.4, 6.0], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: '데브시스터즈 기술 블로그(박현기) · Databricks Metric View 도입기 · 2026-09-18 · 자체 측정' }, SEC));
      this.st = V3.story(this.hd, { name: '데브시스터즈', k: 3, n: 3 });
      this.q = ask(R, '처음에 본 데브시스터즈의 승률 차이는 어떻게 고쳤나', 112);
      this.T = UI.title(R, '승률 계산을 에이전트에서 *시맨틱 레이어*로 옮기자/대시보드와 같은 값이 나오고 토큰·비용은 약 절반이 됐다', { top: 154, size: 60 });
      // 맥락 줄 한 줄, 그 아래 줄에 용어 설명(두 줄을 쌓으려고 흐름 상자 높이를 60으로 줄였다)
      this.cx = ctxLine(R, '정제는 별도 레이어에서 끝내고, 승률 정의를 Databricks Metric View에 두었다', 298, { size: 28 });
      this.tm = UI.term(R, '시맨틱 레이어', '지표의 계산식·조건을 한곳에 정의해 두고 그 정의로 값을 내주는 층', { top: 344, left: 120, width: 1680 });
      const sv = this.sv = svgLayer(R);
      const Y1 = 400, Y2 = 480, H = 60, M1 = Y1 + H / 2, M2 = Y2 + H / 2;
      this.lb = lab(R, 120, Y1 + 15, '전', { color: 'var(--ink2)' });
      this.la = lab(R, 120, Y2 + 15, '후', { color: 'var(--mint)' });
      // 전: 에이전트 → 원천 로그 → 정제 기준 스스로 → 승률 (P04와 같은 산호색 멈춤 칸)
      this.L = [box(R, 180, Y1, 220, H, '에이전트', 'pk'), box(R, 460, Y1, 300, H, '원천 로그'), box(R, 820, Y1, 380, H, '정제 기준 스스로'), box(R, 1260, Y1, 240, H, '승률')];
      this.LA = [arrow(sv, 404, M1, 454, M1), arrow(sv, 764, M1, 814, M1), arrow(sv, 1204, M1, 1254, M1)];
      // X 표시는 '정제 기준 스스로' 칸 안 오른쪽에 둔다(칸 테두리를 덮지 않게). 칸 글자는 왼쪽으로 옮겨 X와 띄운다
      css(this.L[2], { paddingRight: '60px' });
      this.X = h('div', 'a', R, '<svg width="50" height="50" viewBox="0 0 56 56"><path d="M12 12 L44 44 M44 12 L12 44" stroke="#ff7a8a" stroke-width="7" stroke-linecap="round"/></svg>');
      css(this.X, { left: '1138px', top: (Y1 + (H - 50) / 2) + 'px', width: '50px', height: '50px' });
      // 후: 에이전트 → Metric View(시맨틱 레이어) 정의 호출 → 대시보드와 같은 승률
      this.Ra = box(R, 180, Y2, 220, H, '에이전트', 'pk');
      this.Rm = box(R, 460, Y2, 740, H, 'Metric View(시맨틱 레이어) 정의 호출', 'mi');
      this.Rw = box(R, 1260, Y2, 380, H, '대시보드와 같은 승률', 'mi');
      this.RA = [arrow(sv, 404, M2, 454, M2, 'rgba(115,245,198,.85)'), arrow(sv, 1204, M2, 1254, M2, 'rgba(115,245,198,.85)')];
      this.dot = s('circle', { r: 9, fill: C.cyan, cy: Y1 - 11, cx: 290 }, sv);
      // 수치 줄
      const BY = 562;
      this.bl = lab(R, 120, BY + 4, '같은 질문 세트:', { font: '700 28px/1 var(--display)', color: 'var(--ink2)' });
      const mkBar = (x, label, lw, w, end) => {
        const l = lab(R, x, BY + 2, label, { font: '700 30px/1 var(--display)' });
        const tx0 = x + lw;
        const tr = h('div', 'a', R); css(tr, { left: tx0 + 'px', top: BY + 'px', width: w + 'px', height: '34px', borderRadius: '8px', border: '1.5px dashed rgba(190,170,255,.55)', boxSizing: 'border-box' });
        const b = h('div', 'a', R); css(b, { left: tx0 + 'px', top: BY + 'px', width: w + 'px', height: '34px', borderRadius: '8px', background: 'linear-gradient(90deg, rgba(111,226,255,.9), rgba(115,245,198,.9))', transformOrigin: '0 50%' });
        const e = lab(R, tx0 + w + 18, BY + 2, end, { color: 'var(--cyan)', font: '800 30px/1 var(--display)' });
        return { l, tr, b, e };
      };
      this.B1 = mkBar(320, '토큰(LLM 글자 단위)·비용', 327, 230, '약 절반');
      this.B2 = mkBar(1050, '답까지 응답 횟수', 214, 200, '30% 감소');
      this.mn = UI.meaning(R, '→ 숫자를 셀 기준이 하나가 됐다. 정확도 측정값은 공개되지 않았다', { top: 608, size: 30 });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt); V3.storyIn(this.st, lt, 0.3);
      UI.lineIn(this.q, lt, 0.05); UI.titleIn(this.T, lt, 0.2, { each: 0.02 }); UI.lineIn(this.cx, lt, 0.8); UI.lineIn(this.tm, lt, 0.95);
      // ② 전 흐름: 점이 흐르다 '정제 기준 스스로'에서 산호색으로 멈추고, X가 붙는다
      UI.rise(this.lb, lt, 1.42, { x: -14, y: 0, blur: 0 });
      this.L.forEach((b, i) => UI.rise(b, lt, 1.5 + i * 0.1, { y: 16 }));
      this.LA.forEach((A, i) => arrowIn(A, lt, 1.62 + i * 0.1, 0.3));
      const dx = kf(lt, [[2.0, 290], [2.3, 610, ease.inOutCubic], [2.55, 1010, ease.inOutCubic]]);
      this.dot.setAttribute('cx', dx.toFixed(1));
      this.dot.setAttribute('fill', lt > 2.5 ? C.coral : C.cyan);
      this.dot.setAttribute('opacity', (clamp((lt - 1.95) / 0.1) * (1 - prog(lt, 2.9, 0.3))).toFixed(3));
      const ref = this.L[2];
      const coral = prog(lt, 2.52, 0.25);
      ref.style.borderColor = `rgba(${Math.round(lerp(190, 255, coral))},${Math.round(lerp(170, 122, coral))},${Math.round(lerp(255, 138, coral))},${lerp(0.45, 0.95, coral).toFixed(2)})`;
      ref.style.background = `rgba(255,122,138,${(0.16 * coral).toFixed(3)})`;
      const xs = spring(lt, 2.7, 2.6, 0.5);
      css(this.X, { opacity: clamp((lt - 2.7) / 0.08).toFixed(3), transform: `scale(${lerp(1.8, 1, xs).toFixed(3)})` });
      // ③ 그 칸은 0.6으로 흐려지고(지운 칸), 후 흐름에서 Metric View 칸이 에이전트와 승률 사이로 들어온다
      const out = prog(lt, 3.0, 0.5, ease.inOutCubic);
      if (out > 0) css(ref, { opacity: lerp(1, 0.62, out).toFixed(3), borderStyle: out > 0.5 ? 'dashed' : 'solid', filter: 'none', transform: 'none' });
      UI.rise(this.la, lt, 3.05, { x: -14, y: 0, blur: 0 });
      UI.rise(this.Ra, lt, 3.1, { y: 16 }); UI.rise(this.Rw, lt, 3.2, { y: 16 });
      const mp = prog(lt, 3.4, 0.55, ease.outBack);
      css(this.Rm, { opacity: clamp((lt - 3.4) / 0.15).toFixed(3), transform: `translateY(${((1 - mp) * -60).toFixed(1)}px)` });
      this.RA.forEach((A, i) => arrowIn(A, lt, 3.85 + i * 0.12, 0.3));
      // ④ 같은 질문 세트: 막대가 처음 길이에서 약 절반, 70%로 줄어든다
      UI.rise(this.bl, lt, 4.4, { x: -14, y: 0, blur: 0 });
      [this.B1, this.B2].forEach((B, i) => {
        UI.rise(B.l, lt, 4.45 + i * 0.1, { y: 10, blur: 0 });
        const tin = prog(lt, 4.5 + i * 0.1, 0.35, ease.snap);
        B.tr.style.opacity = tin.toFixed(3);
        const sh = prog(lt, 4.95 + i * 0.12, 0.8, ease.inOutCubic);
        css(B.b, { opacity: tin.toFixed(3), transform: `scaleX(${(tin * lerp(1, i === 0 ? 0.5 : 0.7, sh)).toFixed(3)})` });
        UI.rise(B.e, lt, 5.55 + i * 0.1, { x: -10, y: 0, blur: 0 });
      });
      UI.lineIn(this.mn, lt, 5.6);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ════════════════ P26 · 과정 도식(CJ올리브영) — 구도 가R: 4단계 세로, 잠금 칩이 내려간다 ════════════════
  DECK.slide({
    id: 'p26', stops: [1.4, 2.6, 5.0, 6.2], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: 'AWS 기술 블로그(CJ올리브영 개발자 공동 작성) · CJ올리브영 운영 이슈 분석 자동화 · 2026-10-16 · 사용 기업 측정·AWS 게재' }, SEC));
      // 오른쪽 글 칸 x 1120~1800
      this.q = askBox(R, '계산과 해석을 한 에이전트 안에서 나눌 수 있나', 116, 1120, 680);
      this.T = UI.title(R, '계산과 판정은 *코드*가,/해석은 LLM이 맡자/장애 분석이 1~2일에서/약 5분이 됐다', { top: 200, left: 1120, size: 58, width: 680 });
      this.cx = ctxLine(R, 'CJ올리브영 글로벌 프로모션 운영 조직. 소요 시간만 비교', 478, { size: 28, left: 1120, width: 680 });
      this.mn = UI.meaning(R, '→ 시간은 줄었지만 답의 정확도는 재지 않았다', { top: 566, left: 1120, width: 680, size: 30 });
      // 왼쪽 도식 x 120~1060: 4단 세로
      const sv = this.sv = svgLayer(R);
      const TOP = [110, 244, 378, 512], H = 110, X0 = 120, W = 940;
      this.TOP = TOP;
      // 담당자 칸(마지막)은 두 줄 수치가 들어가므로 14px 더 높다
      const stage = (i, head, cls) => {
        const b = box(R, X0, TOP[i], W, i === 3 ? H + 14 : H, '', cls);
        css(b, { alignItems: 'flex-start', justifyContent: 'flex-start', padding: '16px 22px', flexDirection: 'column', textAlign: 'left' });
        h('div', '', b, head);
        return b;
      };
      this.c = [
        stage(0, '장애', 'co'),
        stage(1, '<span style="color:var(--cyan)">코드:</span> 집계·이상 여부 판정', 'cy'),
        stage(2, '<span style="color:#ff9cf6">LLM:</span> 해석·보고<span style="font-weight:600;color:var(--ink2)">(계산값 변경 불가)</span>', 'pk'),
        stage(3, '담당자', ''),
      ];
      this.A = [0, 1, 2].map(i => arrow(sv, 300, TOP[i] + H + 2, 300, TOP[i + 1] - 4));
      this.alarm = s('circle', { cx: 920, cy: TOP[0] + 55, r: 12, fill: C.coral }, sv);
      this.ring = s('circle', { cx: 920, cy: TOP[0] + 55, r: 12, fill: 'none', stroke: C.coral, 'stroke-width': 2.5 }, sv);
      const vc = this.vc = h('div', 'a', R);
      css(vc, { left: '0px', top: '0px', width: '128px', height: '56px', borderRadius: '12px', boxSizing: 'border-box', border: '2.5px solid rgba(111,226,255,.9)', background: 'rgba(12,16,70,.92)' });
      this.bars = [0, 1, 2].map(i => { const b = h('div', 'a', vc); css(b, { left: (14 + i * 20) + 'px', bottom: '9px', width: '14px', height: '30px', borderRadius: '2px', background: C.cyan, transformOrigin: '50% 100%' }); return b; });
      const lk = this.lock = h('div', 'a', vc,
        '<svg width="34" height="38" viewBox="0 0 34 38"><path d="M9 17 V11 a8 8 0 0 1 16 0 V17" fill="none" stroke="#73f5c6" stroke-width="3.2" stroke-linecap="round"/><rect x="4" y="16" width="26" height="19" rx="4" fill="rgba(115,245,198,.25)" stroke="#73f5c6" stroke-width="3"/></svg>');
      css(lk, { left: '82px', top: '7px', width: '34px', height: '38px' });
      this.vg = vc.cloneNode(true); R.appendChild(this.vg);
      css(this.vg, { left: '880px', top: (TOP[1] + 40) + 'px', opacity: '0', borderColor: 'rgba(115,245,198,.6)' });
      this.vg.querySelectorAll('div').forEach((d, i) => { if (i < 3) css(d, { transform: `scaleY(${[0.55, 0.85, 0.7][i]})`, background: C.mint }); });
      this.CHX = 880;
      // LLM 단 문장 줄(글자 없는 줄)
      this.sent = [0, 1].map(i => { const l = h('div', 'a', R); css(l, { left: '144px', top: (TOP[2] + 66 + i * 20) + 'px', width: [560, 440][i] + 'px', height: '9px', borderRadius: '5px', background: 'rgba(255,190,250,.7)', transformOrigin: '0 50%' }); return l; });
      // 담당자 단: 수치
      this.num = h('div', 'a', R,
        `<div style="font:700 30px/1 var(--display);color:var(--dim);position:relative;display:inline-block">담당자 직접 분석 1~2일<i style="position:absolute;left:-4px;right:-4px;top:54%;height:3px;background:var(--coral);transform-origin:0 50%"></i></div>` +
        `<div style="margin-top:18px;font:900 46px/1 var(--num);color:var(--cyan);letter-spacing:-.03em"><span style="color:var(--ink2);margin-right:12px">→</span><span class="n" style="display:inline-block">에이전트 약 5분</span></div>`);
      css(this.num, { left: '300px', top: (TOP[3] + 16) + 'px', whiteSpace: 'nowrap' });
      this.strike = this.num.querySelector('i'); this.n = this.num.querySelector('.n');
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      UI.lineIn(this.q, lt, 0.05); UI.titleIn(this.T, lt, 0.2, { each: 0.022 }); UI.lineIn(this.cx, lt, 0.9);
      const TOP = this.TOP;
      this.c.forEach((b, i) => UI.rise(b, lt, 1.4 + i * 0.13, { y: -18 }));
      this.A.forEach((A, i) => arrowIn(A, lt, 1.7 + i * 0.13, 0.25));
      // ③ 장애 점 → 코드 단(막대가 흔들리다 고정, 자물쇠) → LLM 단(문장 줄만 생김) → 담당자 단
      const ap = clamp((lt - 2.6) / 0.1);
      this.alarm.setAttribute('opacity', (ap * (1 - 0.6 * prog(lt, 2.95, 0.15))).toFixed(3));
      const rr = ((lt - 2.6) % 0.6) / 0.6;
      this.ring.setAttribute('r', (12 + rr * 26).toFixed(1)); this.ring.setAttribute('opacity', (lt > 2.6 && lt < 3.0 ? (1 - rr) : 0).toFixed(3));
      const vy = kf(lt, [[2.85, TOP[0] + 27], [3.25, TOP[1] + 40, ease.inOutCubic], [3.95, TOP[1] + 40], [4.35, TOP[2] + 40, ease.inOutCubic], [4.6, TOP[2] + 40], [4.95, TOP[3] + 40, ease.inOutCubic]]);
      css(this.vc, { left: this.CHX + 'px', top: vy.toFixed(1) + 'px', opacity: clamp((lt - 2.85) / 0.12).toFixed(3) });
      this.vg.style.opacity = (0.5 * prog(lt, 3.95, 0.3)).toFixed(3);
      const lockP = prog(lt, 3.6, 0.25, ease.snap);
      this.bars.forEach((b, i) => {
        const jit = lt < 3.62 ? 0.25 + 0.75 * Math.abs(noise(lt * 9 + i * 3.1, i + 2)) : [0.55, 0.85, 0.7][i];
        css(b, { transform: `scaleY(${jit.toFixed(3)})`, background: lockP > 0.5 ? C.mint : C.cyan });
      });
      css(this.lock, { opacity: lockP.toFixed(3), transform: `scale(${lerp(0.5, 1, spring(lt, 3.6, 2.6, 0.5)).toFixed(3)})` });
      this.vc.style.borderColor = lockP > 0.5 ? 'rgba(115,245,198,.95)' : 'rgba(111,226,255,.9)';
      this.sent.forEach((l, i) => { const p = prog(lt, 4.25 + i * 0.12, 0.3, ease.outCubic); css(l, { opacity: (p > 0 ? 1 : 0).toFixed(3), transform: `scaleX(${p.toFixed(3)})` }); });
      const hi = Math.max(0, Math.min(prog(lt, 3.6, 0.15), 1 - prog(lt, 3.8, 0.5)));
      this.c[1].style.boxShadow = `0 0 ${(36 * hi).toFixed(0)}px rgba(111,226,255,${(0.45 * hi).toFixed(3)})`;
      // ④ 수치·의미
      UI.rise(this.num, lt, 5.0, { x: -16, y: 0 });
      css(this.strike, { transform: `scaleX(${prog(lt, 5.25, 0.3, ease.outCubic).toFixed(3)})` });
      css(this.n, { transform: `scale(${lt < 5.35 ? 1 : (1 + 0.12 * (1 - spring(lt, 5.35, 2.6, 0.45))).toFixed(3)})`, transformOrigin: '0 50%' });
      UI.lineIn(this.mn, lt, 5.45);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ════════════════ P27 · 규칙 3 — 규칙-좌: 왼쪽 규칙 머리·근거, 오른쪽 두 열 ════════════════
  DECK.slide({
    id: 'p27', stops: [1.4, 3.0, 4.0, 5.2], exit: 0.5, bg: DECK.BGP.text,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: '발표자 제안 · 근거 웹케시(2026-10-07) · CJ올리브영(2026-10-16)' }, SEC));
      this.RH = V3.ruleHead(R, { n: 3, text: '결과가 늘 같아야 하는/단계는 에이전트 대신/*코드*가 맡는다' });
      // 근거 칩(맥락 줄 문구를 칩으로 나눔)
      const y0 = this.RH.bottom + 20;
      this.ev = h('div', 'a', R,
        '<div style="font:700 28px/1 var(--display);color:var(--dim);margin-bottom:20px">근거:</div>' +
        '<div class="c">웹케시(날짜 해석 → 규칙 32개),</div>' +
        '<div class="c">CJ올리브영(집계·판정 → 코드).</div>' +
        '<div style="font:700 30px/1.2 var(--display);color:var(--amber);margin-top:14px">집계는 규칙 4</div>');
      css(this.ev, { left: '120px', top: y0 + 'px', width: '800px' });
      this.ev.querySelectorAll('.c').forEach(c => css(c, { display: 'inline-block', margin: '0 12px 14px 0', padding: '9px 18px 10px', borderRadius: '999px',
        border: '1.5px solid rgba(111,226,255,.55)', background: 'rgba(111,226,255,.10)', font: '600 30px/1 var(--display)', color: 'var(--ink)', whiteSpace: 'nowrap' }));
      this.evParts = Array.from(this.ev.children);
      // 오른쪽 칸 x 980~1800: 코드 열 · 에이전트 열
      const PY = 118, PH = 300;
      const panel = (x, w, head, col) => {
        const p = h('div', 'a', R); css(p, { left: x + 'px', top: PY + 'px', width: w + 'px', height: PH + 'px', borderRadius: '20px', boxSizing: 'border-box',
          border: `2px solid ${UI.hexA(col, 0.6)}`, background: UI.hexA(col, 0.07) });
        const t = h('div', 'a', p, head); css(t, { left: '24px', top: '18px', font: '800 34px/1 var(--display)', color: col, letterSpacing: '-.02em' });
        return p;
      };
      this.PL = panel(980, 395, '코드', C.cyan);
      this.PR = panel(1405, 395, '에이전트', '#ff9cf6');
      this.slot = (px, i) => ({ x: px + 24, y: PY + 76 + i * 72 });
      this.tasks = ['날짜 해석', '단위 환산', '합계 검사'].map(t => box(R, 0, 0, 347, 58, t, ''));
      this.keep = ['결과 읽기', '해석', '가설'].map((t, i) => { const p = this.slot(1405, i); return box(R, p.x, p.y, 347, 58, t, 'pk'); });
      const sv = this.sv = svgLayer(R);
      this.call = s('path', { d: 'M 1600 420 C 1600 470, 1180 470, 1180 424', fill: 'none', stroke: C.amber, 'stroke-width': 3, 'stroke-dasharray': '8 8' }, sv);
      this.callHd = s('path', { d: 'M0,0 L-14,-8 L-14,8 Z', fill: C.amber, transform: 'translate(1180,422) rotate(-90)' }, sv);
      this.impl = h('div', 'a', R, '<b style="color:var(--amber);font-weight:800">하네스 구현:</b> 계산 코드는 스킬의 <span style="font:600 30px/1 var(--mono);color:var(--cyan)">scripts</span> 폴더에 두고, 에이전트는 실행해 결과만 받는다');
      css(this.impl, { left: '980px', top: '494px', width: '820px', font: '600 30px/1.36 var(--display)', color: 'var(--ink)', letterSpacing: '-.02em' });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      V3.ruleHeadIn(this.RH, lt, 0.1);
      this.evParts.forEach((e, i) => UI.rise(e, lt, 0.9 + i * 0.12, { x: -16, y: 0, blur: 0 }));
      UI.rise(this.PL, lt, 0.95, { y: 20 }); UI.rise(this.PR, lt, 1.05, { y: 20 });
      // ① 끝: 작업 상자 셋이 에이전트 열에 놓인다 → ② 하나씩 코드 열로 넘어간다
      this.tasks.forEach((b, i) => {
        const from = this.slot(1405, i), to = this.slot(980, i);
        const ap = prog(lt, 1.1 + i * 0.05, 0.3, ease.snap);
        const mv = prog(lt, 1.55 + i * 0.35, 0.6, ease.inOutCubic);
        const x = lerp(from.x, to.x, mv), y = lerp(from.y, to.y, mv) - Math.sin(mv * Math.PI) * 40;
        css(b, { left: x.toFixed(1) + 'px', top: y.toFixed(1) + 'px', opacity: ap.toFixed(3) });
        const cy = prog(lt, 1.55 + i * 0.35 + 0.45, 0.2);
        b.style.borderColor = `rgba(${Math.round(lerp(190, 111, cy))},${Math.round(lerp(170, 226, cy))},255,${lerp(0.45, 0.9, cy).toFixed(2)})`;
        b.style.background = `rgba(${Math.round(lerp(22, 111, cy))},${Math.round(lerp(18, 226, cy))},${Math.round(lerp(96, 255, cy))},${lerp(0.62, 0.14, cy).toFixed(2)})`;
      });
      // ③ 에이전트 열에 남는 것
      this.keep.forEach((b, i) => UI.rise(b, lt, 3.0 + i * 0.15, { y: 0, from: 0.85 }));
      // ④ 호출 화살표 + 하네스 구현 줄
      const cp = prog(lt, 4.0, 0.55, ease.inOutCubic);
      this.call.style.clipPath = `inset(0 0 0 ${((1 - cp) * 100).toFixed(1)}%)`;
      this.call.setAttribute('opacity', cp > 0 ? 1 : 0);
      this.callHd.setAttribute('opacity', clamp((cp - 0.85) / 0.15).toFixed(3));
      UI.rise(this.impl, lt, 4.35, { y: 14 });
      UI.exit(this.R, lt, ctx);
    },
  });

  // ════════════════ P28 · 규칙 4 — 규칙-좌: 왼쪽 규칙 머리·근거, 오른쪽 정의 파일 카드와 행 묶음 차단 ════════════════
  DECK.slide({
    id: 'p28', stops: [1.4, 2.3, 3.9, 5.6], exit: 0.5, bg: DECK.BGP.text,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: '발표자 제안 · 근거 토스(2026-10-16) · 데브시스터즈(2026-09-18) · 웹케시(2026-10-07) · revfactory/harness 2.1.0 에이전트 정의 형식(2026-09-26)' }, SEC));
      this.RH = V3.ruleHead(R, { n: 4, text: '계산은 *데이터 시스템*에서/하고 에이전트는/집계 결과만 읽는다', top: 128 });
      const y0 = this.RH.bottom + 22;
      this.cx = ctxLine(R, '데이터 시스템 = DB·시맨틱 레이어.<br>근거: 토스 계산 질문 11개(8문항과 다른 묶음),<br>시맨틱 레이어 SQL 실행 → 9개 정답', y0, { size: 28, width: 820 });
      this.bar = h('div', 'a', R); css(this.bar, { left: '120px', top: (y0 + 136) + 'px', width: '6px', height: '82px', borderRadius: '3px', background: C.cyan, transformOrigin: '50% 0' });
      this.rule = txt(R, 144, y0 + 132, 800, '원본 행을 읽지 않는다. 계산식은 시맨틱 레이어<br>정의 호출, 결과 행 수 상한', { font: '700 30px/1.36 var(--display)' });
      // 오른쪽: 정의 파일 카드(설명용 예시)
      const cd = this.card = h('div', 'a', R);
      css(cd, { left: '980px', top: '118px', width: '820px', height: '232px', borderRadius: '18px', boxSizing: 'border-box', border: '1.5px solid rgba(150,130,255,.45)', background: 'rgba(8,6,40,.86)', overflow: 'hidden' });
      const tb = h('div', 'a', cd); css(tb, { left: '0px', top: '0px', right: '0px', height: '44px', background: 'rgba(150,130,255,.12)', borderBottom: '1px solid rgba(150,130,255,.3)' });
      [0, 1, 2].forEach(i => { const d = h('div', 'a', tb); css(d, { left: (18 + i * 22) + 'px', top: '16px', width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(200,190,255,.4)' }); });
      this.mk = h('div', 's4-mark', cd, '설명용 예시'); css(this.mk, { right: '10px', top: '4px', fontSize: '28px', padding: '3px 10px 4px' });
      this.ph = [];
      [460, 540].forEach((w, i) => { const l = h('div', 'a', cd); css(l, { left: '30px', top: (56 + i * 14) + 'px', width: w + 'px', height: '9px', borderRadius: '5px', background: 'rgba(200,190,255,.22)' }); this.ph.push(l); });
      // 코드 세 줄은 한 글 묶음(줄 간격 1.45). 줄마다 inline-block이라 한 줄씩 쓰이는 움직임은 그대로다
      const CT = 86, LH = 43.5;
      this.codeBox = h('div', 'a s4-mono', cd);
      css(this.codeBox, { left: '30px', top: CT + 'px', font: `600 30px/${LH}px var(--mono)`, color: '#e9e4ff', whiteSpace: 'nowrap', letterSpacing: '-.01em' });
      this.code = [
        '<span style="color:#ff8ef5">## 실행 제약</span>',
        '<span style="color:var(--dim)">-</span> SELECT만',
        '<span style="color:var(--dim)">-</span> <span style="color:#ffd27a">1,000</span>행 이하',
      ].map((html, i) => {
        if (i) this.codeBox.appendChild(document.createElement('br'));
        const c = h('span', '', this.codeBox, html); c.style.display = 'inline-block'; return c;
      });
      // 줄마다 글자 중심 - 16(커서 높이 32의 절반): 커서·강조 상자 위치 기준
      this.lineY = [0, 1, 2].map(i => Math.round(CT + i * LH + LH / 2 - 16));
      this.hl = h('div', 'a', cd); css(this.hl, { left: '16px', top: (this.lineY[2] - 7) + 'px', width: '330px', height: '46px', borderRadius: '8px', border: '2px solid rgba(255,122,138,.9)', boxSizing: 'border-box', opacity: '0' });
      this.caret = h('div', 'a', cd); css(this.caret, { left: '0px', top: '0px', width: '14px', height: '32px', background: C.cyan });
      // 아래: DB → (1,000행 이하 문) → 에이전트. 원본 행 묶음은 막히고 집계 한 줄만 지난다
      const sv = this.sv = svgLayer(R);
      const FY = 434;
      const db = this.db = s('g', {}, sv);
      s('path', { d: `M 990 ${FY - 50} L 990 ${FY + 50} A 54 14 0 0 0 1098 ${FY + 50} L 1098 ${FY - 50}`, fill: 'rgba(111,226,255,.12)', stroke: C.cyan, 'stroke-width': 2.5 }, db);
      s('ellipse', { cx: 1044, cy: FY - 50, rx: 54, ry: 14, fill: 'rgba(30,40,140,.95)', stroke: C.cyan, 'stroke-width': 2.5 }, db);
      const dt = s('text', { x: 1044, y: FY + 18, 'text-anchor': 'middle', 'font-family': 'Pretendard', 'font-weight': 900, 'font-size': 34, fill: C.ink }, db); dt.textContent = 'DB';
      this.gate = s('line', { x1: 1470, y1: FY - 60, x2: 1470, y2: FY + 60, stroke: C.coral, 'stroke-width': 5, 'stroke-linecap': 'round' }, sv);
      this.gateL = h('div', 'a s4-mono', R, '1,000행 이하'); css(this.gateL, { left: '1470px', top: (FY + 76) + 'px', transform: 'translateX(-50%)', font: '600 28px/1 var(--mono)', color: 'var(--coral)', whiteSpace: 'nowrap' });
      this.ag = box(R, 1580, FY - 50, 220, 100, '에이전트', 'pk'); css(this.ag, { alignItems: 'flex-start', paddingTop: '14px' });
      this.rows = [];
      for (let i = 0; i < 9; i++) { const r = h('div', 'a', R); css(r, { left: '0px', top: '0px', width: '150px', height: '8px', borderRadius: '3px', background: 'rgba(255,140,240,.85)' }); this.rows.push(r); }
      this.res = h('div', 'a', R);
      css(this.res, { left: '0px', top: '0px', width: '120px', height: '24px', borderRadius: '6px', border: '2px solid var(--mint)', background: 'rgba(115,245,198,.25)', boxSizing: 'border-box' });
      this.FY = FY;
      this.ref = txt(R, 980, 552, 820, '<span style="color:var(--dim)">참고:</span> 데브시스터즈 토큰·비용 약 절반 · 웹케시 DB 안에서 조회(힌트로 20분 → 5초)', { color: 'var(--ink2)', font: '600 30px/1.36 var(--display)' });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      V3.ruleHeadIn(this.RH, lt, 0.1); UI.lineIn(this.cx, lt, 0.85);
      UI.rise(this.card, lt, 0.9, { x: 30, y: 0 });
      // ② 규칙 줄
      const bp = prog(lt, 1.4, 0.45, ease.snap);
      css(this.bar, { transform: `scaleY(${bp.toFixed(3)})`, opacity: bp > 0 ? '1' : '0' });
      UI.rise(this.rule, lt, 1.5, { x: -20, y: 0 });
      // ③ 카드에 「실행 제약」 세 줄이 한 줄씩 쓰인다
      let caretX = -100, caretY = 0, caretOn = 0;
      this.code.forEach((c, i) => {
        const t0 = 2.35 + i * 0.5;
        const p = prog(lt, t0, 0.4, ease.linear);
        css(c, { clipPath: `inset(-6px ${((1 - p) * 100).toFixed(1)}% -6px 0)`, opacity: p > 0 ? '1' : '0' });
        if (lt >= t0 && lt < t0 + 0.5) { caretOn = 1; caretX = 30 + c.offsetWidth * p + 4; caretY = this.lineY[i]; }
      });
      css(this.caret, { left: caretX.toFixed(1) + 'px', top: caretY + 'px', opacity: (caretOn ? 0.85 : 0).toFixed(2) });
      // ④ 원본 행 묶음이 에이전트 쪽으로 가다 「1,000행 이하」에서 막히고, 집계 한 줄만 지난다
      const FY = this.FY;
      const st = prog(lt, 3.9, 0.15);
      this.db.setAttribute('opacity', prog(lt, 3.9, 0.3).toFixed(3));
      this.gate.setAttribute('opacity', prog(lt, 3.95, 0.25).toFixed(3));
      UI.rise(this.gateL, lt, 4.0, { y: 8, blur: 0 }); this.gateL.style.transform = 'translateX(-50%) ' + this.gateL.style.transform;
      UI.rise(this.ag, lt, 4.0, { x: 16, y: 0 });
      this.rows.forEach((r, i) => {
        const mv = prog(lt, 4.15 + i * 0.03, 0.55, ease.inOutCubic);
        const x = lerp(1104, 1308 - (i % 3) * 8, mv), y = FY - 46 + i * 11;
        const shake = lt > 4.7 && lt < 5.0 ? Math.sin((lt - 4.7) * 60 + i) * 3 * (1 - (lt - 4.7) / 0.3) : 0;
        const hit = prog(lt, 4.68, 0.2);
        css(r, { left: (x + shake).toFixed(1) + 'px', top: y + 'px', opacity: (st * clamp((lt - 4.15) / 0.1)).toFixed(3),
          background: `rgba(255,${Math.round(lerp(140, 122, hit))},${Math.round(lerp(240, 138, hit))},.85)` });
      });
      const rp = prog(lt, 4.85, 0.6, ease.inOutCubic);
      css(this.res, { left: lerp(1330, 1630, rp).toFixed(1) + 'px', top: (FY + 12) + 'px', opacity: clamp((lt - 4.85) / 0.1).toFixed(3) });
      this.hl.style.opacity = (Math.max(0, Math.min(prog(lt, 4.68, 0.15), 1 - 0.5 * prog(lt, 5.1, 0.4)))).toFixed(3);
      UI.rise(this.ref, lt, 5.1, { y: 14 });
      UI.exit(this.R, lt, ctx);
    },
  });
})();
