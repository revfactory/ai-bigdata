/* scenes_v3_1.js — 섹션 1 도입 P03~P07 (스토리보드 v3, 2차 수정). P01·P02는 메인 관리라 여기 없다.
 * P03 [기]   시간축: 재생 위치 표시가 눈금을 따라 이동하며 사건 세 개를 놓고, 셋째 사건 아래 막대 두 개가 같이 차다가 에이전트 쪽만 더 간다
 * P04 [라]   도식 먼저: 칸 다섯 개 아래 레일로 점이 흐르다 「정제 기준을 스스로 정함」 밑에서 멈춰 산호색이 되고, 회색 점만 끝까지 간다. 제목은 그 뒤에
 * P05 [가]   왼쪽 글 칸 + 오른쪽 점 흐름: 점 100개가 「실행됨」 선에서 1개만 빠지고, 「정답」 선에서는 45개만 통과한다
 * P06 [기]   화살표 띠: 분홍·하늘색 점 두 개가 둘째 칸에서 멈추고, 뒤 칸들은 민트로 차오른 뒤 「실행 성공」
 * P07 [도표] 앞 장 띠의 둘째 칸이 구성 도표 「① 데이터 정의」 칸 자리로 옮겨 가고, ②③, ④가 차례로 놓인다(칸마다 정의 한 줄)
 * 화면 글자는 스토리보드 「(화면)」 항목만 쓴다. 읽을 내용은 모두 y 648 위.
 */
(function () {
  'use strict';
  const { clamp, lerp, prog, ease, h, s, css, spring, kf, rand } = REEL;
  const f1 = v => v.toFixed(1), f3 = v => v.toFixed(3);
  const HD = { sec: '01', name: '도입' };
  const SRC_DEV = '데브시스터즈 기술 블로그(박현기) · Databricks Metric View 도입기 · 2026-09-18 · 자체 글';
  const SRC_KENSHO = 'Sehanobish 외(Kensho) · arXiv 2610.03524 · 2026-10-02 · 자체 평가(논문)';
  const C = { cyan: '#6fe2ff', mint: '#73f5c6', coral: '#ff7a8a', amber: '#ffcb66', pink: '#ff6ef2', ink: '#f6f3ff' };
  const A = (hex, a) => UI.hexA(hex, a);

  function svgRoot(parent) {
    const v = s('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, parent);
    css(v, { position: 'absolute', left: '0', top: '0', overflow: 'visible' });
    return v;
  }
  function box(parent, html, o) { const e = h('div', 'a', parent, html); css(e, o || {}); return e; }
  function attr(e, o) { for (const k in o) e.setAttribute(k, typeof o[k] === 'number' ? +o[k].toFixed(3) : o[k]); }
  function mixHex(a, b, p) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const c = [16, 8, 0].map(sh => Math.round(lerp((pa >> sh) & 255, (pb >> sh) & 255, clamp(p))));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }
  // 글자 많은 장의 배경: 선 다발을 내리고 조금 어둡게
  const BG_FLOW = Object.assign({}, DECK.BGP.calm, { yc: 950, amp: 70, spread: 140, dim: 0.34 });

  // P06·P07이 같은 띠 좌표를 쓴다(P07에서 둘째 칸이 이 자리에서 출발한다). 높이 106: 둘째 칸 두 줄의 위아래 여백 14px 이상
  const BAND = { y0: 344, y1: 450, d: 26, segs: [[120, 350], [358, 850], [858, 1170], [1178, 1490], [1498, 1800]] };
  function chevPts(x0, x1, y0, y1, dl, dr) {
    const ym = (y0 + y1) / 2;
    return `${f1(x0)},${f1(y0)} ${f1(x1)},${f1(y0)} ${f1(x1 + dr)},${f1(ym)} ${f1(x1)},${f1(y1)} ${f1(x0)},${f1(y1)} ${f1(x0 + dl)},${f1(ym)}`;
  }
  function segPts(i) {
    const [x0, x1] = BAND.segs[i];
    return chevPts(x0, x1, BAND.y0, BAND.y1, i > 0 ? BAND.d : 0, i < 4 ? BAND.d : 0);
  }

  // ───────────────── P03 · 데브시스터즈 1/3 — 시간축 [기] ─────────────────
  // 재생 위치 표시가 시간 눈금을 따라 이동하며 사건을 하나씩 놓는다. 셋째 사건 아래에서 대시보드·에이전트 막대가 같이 차다가 에이전트 쪽만 더 간다
  DECK.slide({
    id: 'p03', stops: [1.7, 3.4, 6.0], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: SRC_DEV }, HD));
      this.chip = V3.story(this.hd, { name: '데브시스터즈', k: 1, n: 3 });
      this.q = UI.ask(R, '대시보드 숫자와 에이전트가 말한 숫자가 다르면 어느 쪽을 믿어야 하나', { top: 122 });
      this.T = UI.title(R, '게임 회사의 분석 에이전트는/승률을 대시보드와 *조금 다르게* 답했다', { top: 168, size: 68 });
      this.c = UI.context(R, '데브시스터즈(게임 회사) 데이터 조직, 신규 게임 출시 직후의 사내 분석 에이전트', { top: 334 });

      const sv = svgRoot(R);
      const AY = this.AY = 420;
      this.PX = [150, 720, 1290];
      this.axisBase = s('line', { x1: 120, y1: AY, x2: 1786, y2: AY, stroke: 'rgba(200,185,255,.34)', 'stroke-width': 2, 'stroke-dasharray': '3 9' }, sv);
      this.axisTip = s('path', { d: `M1772,${AY - 10} L1792,${AY} L1772,${AY + 10}`, fill: 'none', stroke: 'rgba(200,185,255,.55)', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sv);
      this.axis = s('line', { x1: 120, y1: AY, x2: 120, y2: AY, stroke: C.cyan, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, sv);
      this.ticks = [];
      for (let x = 180; x < 1770; x += 60) this.ticks.push(s('line', { x1: x, y1: AY - 6, x2: x, y2: AY + 6, stroke: 'rgba(200,185,255,.35)', 'stroke-width': 1.5 }, sv));
      this.dots = this.PX.map((x, i) => {
        const g = s('g', { transform: `translate(${x},${AY})` }, sv);
        const halo = s('circle', { r: 16, fill: 'none', stroke: i === 2 ? C.amber : C.cyan, 'stroke-width': 2, opacity: 0 }, g);
        s('circle', { r: 15, fill: '#120f52', stroke: i === 2 ? C.amber : C.cyan, 'stroke-width': 3.5 }, g);
        s('circle', { r: 6, fill: i === 2 ? C.amber : C.cyan }, g);
        return { g, halo };
      });
      this.head = s('g', {}, sv);
      s('line', { x1: 0, y1: -30, x2: 0, y2: 24, stroke: C.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, this.head);
      s('path', { d: 'M-9,-42 L9,-42 L0,-30 Z', fill: C.ink }, this.head);

      const L = ';font:600 30px/1.32 Pretendard;letter-spacing:-.015em;color:var(--ink);word-break:keep-all';
      this.lab = [
        box(R, '신규 게임 출시, 대시보드와 에이전트가 같은 지표를 계산', { left: '134px', top: '448px', width: '520px' }),
        box(R, '<span style="color:var(--dim)">질문:</span> 지난주 승률 상위 10개 쿠키(게임\u00a0캐릭터)', { left: '704px', top: '448px', width: '520px' }),
        box(R, '상위 순서는 맞았지만 <span style="color:var(--amber)">승률 숫자가 대시보드와 조금씩 달랐다</span>', { left: '1274px', top: '448px', width: '526px' }),
      ];
      this.lab.forEach(e => { e.style.cssText += L; });

      // 비교 상자(x 1280~1800, y 538~644): 대시보드 막대 / 에이전트 답 막대. 값은 원문에 없어 숫자를 쓰지 않는다. 글자와 테두리 사이 16px 이상
      this.cmp = box(R, '', { left: '1280px', top: '538px', width: '520px', height: '106px', boxSizing: 'border-box', borderRadius: '16px',
        background: 'rgba(22,18,96,.66)', border: '1.5px solid rgba(190,170,255,.4)' });
      this.TW = 296;                     // 막대 자리 폭(x 1484~1780)
      this.rows = ['대시보드', '에이전트 답'].map((nm, k) => {
        const y = 15 + k * 44;
        box(this.cmp, nm, { left: '18px', top: y + 'px', font: '700 30px/36px Pretendard', color: k ? 'var(--amber)' : 'var(--ink)', letterSpacing: '-.02em', whiteSpace: 'nowrap' });
        box(this.cmp, '', { left: '204px', top: (y + 7) + 'px', width: this.TW + 'px', height: '22px', borderRadius: '6px', background: 'rgba(190,170,255,.14)' });
        const b = box(this.cmp, '', { left: '204px', top: (y + 7) + 'px', width: '0px', height: '22px', borderRadius: '6px', background: 'rgba(246,243,255,.82)' });
        const d = k ? box(this.cmp, '', { left: '204px', top: (y + 7) + 'px', width: '0px', height: '22px', borderRadius: '0 6px 6px 0', background: C.amber }) : null;
        return { b, d };
      });
      // 대시보드 막대 끝 위치를 두 줄에 걸쳐 잇는 점선
      this.refL = box(this.cmp, '', { left: '0px', top: '17px', width: '0px', height: '76px', borderLeft: '2px dashed rgba(246,243,255,.7)' });

      this.term = UI.term(R, '에이전트', '목표를 받아 도구(SQL 실행 등)를 스스로 골라 여러 단계로 일하는 LLM 프로그램', { top: 576, left: 120, width: 1120 });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      V3.storyIn(this.chip, lt, 0.2);
      UI.lineIn(this.q, lt, 0.05);
      UI.titleIn(this.T, lt, 0.2);
      UI.lineIn(this.c, lt, 0.95);
      const PX = this.PX, AY = this.AY;

      const pb = prog(lt, 1.05, 0.6, ease.outCubic);
      css(this.axisBase, { opacity: f3(pb), strokeDashoffset: f1((1 - pb) * 60) });
      this.axisTip.style.opacity = f3(pb);
      this.ticks.forEach((t, i) => { t.style.opacity = f3(prog(lt, 1.1 + i * 0.012, 0.3)); });
      const hx = kf(lt, [[1.7, 120], [2.15, PX[0], ease.outCubic], [2.4, PX[0]], [2.95, PX[1], ease.inOutCubic], [3.45, PX[1]], [4.05, PX[2], ease.inOutCubic]]);
      attr(this.axis, { x2: hx });
      this.axis.style.opacity = f3(prog(lt, 1.7, 0.2));
      attr(this.head, { transform: `translate(${f1(hx)},${AY})` });
      this.head.style.opacity = f3(prog(lt, 1.6, 0.3) * (1 - 0.55 * prog(lt, 4.3, 0.5)));

      const arrive = [2.15, 2.95, 4.05];
      this.dots.forEach((d, i) => {
        const sp = spring(lt, arrive[i] - 0.04, 2.6, 0.45);
        const vis = lt >= arrive[i] - 0.04 ? 1 : 0;
        attr(d.g, { transform: `translate(${PX[i]},${AY}) scale(${f3(Math.max(0.001, sp))})` });
        d.g.style.opacity = String(vis);
        const r = prog(lt, arrive[i], 0.7, ease.outCubic);
        attr(d.halo, { r: 16 + 26 * r, opacity: vis * (1 - r) * 0.8 });
        UI.rise(this.lab[i], lt, arrive[i] + 0.06, { y: 18, dur: 0.5 });
      });
      UI.lineIn(this.term, lt, 3.05);

      // 비교 상자: 두 막대가 같은 속도로 같은 길이까지 차고 → 대시보드는 멈추고 에이전트 막대만 조금 더 간다(더 간 부분은 호박색)
      UI.rise(this.cmp, lt, 4.25, { y: 24, dur: 0.5, blur: 0 });
      const BASE = 0.72, AG = 0.81;
      const g = prog(lt, 4.55, 0.85, ease.outCubic);
      this.rows.forEach(r => { r.b.style.width = f1(BASE * this.TW * g) + 'px'; });
      const gx = prog(lt, 5.45, 0.45, ease.outCubic);
      const ag = this.rows[1].d;
      css(ag, { left: f1(204 + BASE * this.TW - 2) + 'px', width: f1((AG - BASE) * this.TW * gx + (gx > 0 ? 2 : 0)) + 'px', opacity: gx > 0.001 ? '1' : '0' });
      css(this.refL, { left: f1(204 + BASE * this.TW - 1) + 'px', opacity: f3(prog(lt, 5.4, 0.3) * 0.9) });

      const a = DECK.amb(ctx.t), gate = prog(lt, 5.8, 0.5);
      const ph2 = (a * 0.55) % 1;
      if (lt > arrive[2] + 0.7) attr(this.dots[2].halo, { r: 16 + 16 * ph2, opacity: gate * (1 - ph2) * 0.55 });

      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────────────── P04 · 데브시스터즈 2/3 — 원인 [라: 도식 먼저] ─────────────────
  // 칸 다섯 개 아래 레일을 따라 점이 흐른다. 「정제 기준을 스스로 정함」 칸 밑에서 멈춰 산호색이 되고(정의가 에이전트에게 맡겨지는 단계),
  // 그 뒤는 회색 점이 통과해 승률 숫자 칸에 닿는다. 제목은 점이 멈춘 뒤 결론으로 나온다
  DECK.slide({
    id: 'p04', stops: [0.9, 2.0, 4.2, 6.1], exit: 0.5, bg: BG_FLOW,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: SRC_DEV }, HD));
      this.chip = V3.story(this.hd, { name: '데브시스터즈', k: 2, n: 3 });
      this.c = UI.context(R, '같은 사례(데브시스터즈). 이탈한 사용자를 뺄지, 표본이 몇 건 이상이어야 셀지가 요청마다 달라졌다', { top: 122 });

      const W = [220, 290, 400, 360, 290], G = 30, Y = 186, H = 120;
      const names = ['질문', '에이전트', '정제 기준을<br>스스로 정함', '원천 로그 조회', '승률 숫자'];
      let x = 120;
      this.cx = [];
      this.cards = names.map((nm, i) => {
        const e = box(R, nm, { left: x + 'px', top: Y + 'px', width: W[i] + 'px', height: H + 'px', boxSizing: 'border-box', borderRadius: '18px',
          border: '2px solid rgba(190,170,255,.36)', background: 'rgba(22,18,96,.58)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', font: '700 38px/1.32 Pretendard', letterSpacing: '-.025em', color: 'var(--ink)', whiteSpace: 'nowrap' });
        this.cx.push(x + W[i] / 2);
        x += W[i] + G;
        return e;
      });
      const RY = this.RY = 346;
      const sv = svgRoot(R);
      this.stems = this.cx.map(cx => s('line', { x1: cx, y1: Y + H, x2: cx, y2: RY, stroke: 'rgba(200,185,255,.45)', 'stroke-width': 2 }, sv));
      this.rail = s('line', { x1: this.cx[0], y1: RY, x2: 1780, y2: RY, stroke: 'rgba(200,185,255,.4)', 'stroke-width': 3, 'stroke-linecap': 'round' }, sv);
      this.railTip = s('path', { d: `M1770,${RY - 9} L1788,${RY} L1770,${RY + 9}`, fill: 'none', stroke: 'rgba(200,185,255,.55)', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sv);
      this.lit = s('line', { x1: this.cx[0], y1: RY, x2: this.cx[0], y2: RY, stroke: C.cyan, 'stroke-width': 4, 'stroke-linecap': 'round' }, sv);
      this.litGray = s('line', { x1: this.cx[2], y1: RY, x2: this.cx[2], y2: RY, stroke: 'rgba(220,214,240,.6)', 'stroke-width': 4, 'stroke-linecap': 'round' }, sv);
      this.nodes = this.cx.map(cx => s('circle', { cx, cy: RY, r: 7, fill: '#15125a', stroke: 'rgba(200,185,255,.6)', 'stroke-width': 2.5 }, sv));
      this.pulse = s('circle', { cx: this.cx[2], cy: RY, r: 12, fill: 'none', stroke: C.coral, 'stroke-width': 2.5, opacity: 0 }, sv);
      this.glow = s('circle', { cx: this.cx[0], cy: RY, r: 22, fill: A(C.cyan, 0.22), opacity: 0 }, sv);
      this.dot = s('circle', { cx: this.cx[0], cy: RY, r: 11, fill: C.cyan, opacity: 0 }, sv);
      this.gray = s('circle', { cx: this.cx[2], cy: RY, r: 9, fill: 'rgba(225,220,245,.85)', opacity: 0 }, sv);
      this.loop = [0, 1, 2].map(() => s('circle', { cx: 0, cy: RY, r: 6, fill: 'rgba(225,220,245,.75)', opacity: 0 }, sv));
      this.qLine = s('line', { x1: this.cx[2], y1: RY + 12, x2: this.cx[2], y2: RY + 24, stroke: C.coral, 'stroke-width': 2.5, opacity: 0 }, sv);
      this.quote = box(R, '“분석 에이전트가 지표를 매번 스스로 정의했습니다”', { left: (this.cx[2] - 450) + 'px', top: '374px', width: '900px', textAlign: 'center',
        font: '600 32px/1.3 Pretendard', color: 'var(--ink)', letterSpacing: '-.015em', whiteSpace: 'nowrap' });
      // 결론: 제목과 의미 줄은 도식 아래(움직임이 끝난 뒤)
      this.T = UI.title(R, '에이전트가 정제되지 않은 로그를 읽고/*정제 기준*을 매번 스스로 정했다', { top: 440, size: 62 });
      this.m = UI.meaning(R, '→ 정의를 에이전트가 정하면 숫자가 대시보드와 어긋났다', { top: 604, size: 30 });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      V3.storyIn(this.chip, lt, 0.2);
      UI.lineIn(this.c, lt, 0.2);
      const cx = this.cx, RY = this.RY;

      // ② 칸 다섯 개가 왼쪽부터 놓이고 레일이 그어진다
      this.cards.forEach((e, i) => UI.rise(e, lt, 0.9 + i * 0.09, { y: 26, dur: 0.5, blur: 4 }));
      const pr = prog(lt, 1.1, 0.7, ease.outCubic);
      attr(this.rail, { x2: lerp(cx[0], 1780, pr) });
      this.rail.style.opacity = f3(prog(lt, 1.1, 0.15));
      this.railTip.style.opacity = f3(prog(lt, 1.7, 0.2));
      this.stems.forEach((st, i) => { st.style.opacity = f3(prog(lt, 1.15 + i * 0.09, 0.3)); });
      this.nodes.forEach((n, i) => { n.style.opacity = f3(prog(lt, 1.2 + i * 0.09, 0.3)); });

      // ③ 점이 흐른다: 질문 → 에이전트(통과) → 셋째 칸 밑에서 넘쳤다 되돌아와 멈춤
      const T0 = 2.15, T1 = 2.6, T2 = 3.2;
      const x = kf(lt, [[T0, cx[0]], [T1, cx[1], ease.inOutSine], [T2, cx[2], ease.outBack]]);
      const red = prog(lt, T2 - 0.05, 0.3, ease.outCubic);
      const col = mixHex(C.cyan, C.coral, red);
      const on = lt >= T0 - 0.1 ? 1 : 0;
      attr(this.dot, { cx: x, fill: col }); this.dot.style.opacity = f3(on * prog(lt, T0 - 0.1, 0.15));
      attr(this.glow, { cx: x, fill: red > 0.5 ? A(C.coral, 0.25) : A(C.cyan, 0.22) }); this.glow.style.opacity = f3(on * prog(lt, T0 - 0.1, 0.15));
      attr(this.lit, { x2: lt < T0 ? cx[0] : Math.min(x, cx[2]), stroke: col });
      const pass1 = prog(lt, T1 - 0.08, 0.2) * (1 - 0.5 * prog(lt, T1 + 0.35, 0.4));
      css(this.cards[0], { borderColor: A(C.cyan, 0.36 + 0.3 * prog(lt, T0 - 0.1, 0.2) * (1 - 0.6 * prog(lt, T0 + 0.3, 0.4))) });
      css(this.cards[1], { borderColor: `rgba(111,226,255,${f3(0.36 + 0.55 * pass1)})` });
      css(this.cards[2], { borderColor: red > 0.01 ? A(C.coral, 0.4 + 0.55 * red) : 'rgba(190,170,255,.36)',
        background: `rgba(${Math.round(lerp(22, 120, red))},${Math.round(lerp(18, 30, red))},${Math.round(lerp(96, 90, red))},.58)`,
        boxShadow: `0 0 ${f1(40 * red)}px ${A(C.coral, 0.35 * red)}` });
      attr(this.nodes[2], { stroke: red > 0.01 ? C.coral : 'rgba(200,185,255,.6)' });
      const rp = prog(lt, T2, 0.8, ease.outCubic);
      attr(this.pulse, { r: 12 + 30 * rp, opacity: (lt >= T2 ? 1 : 0) * (1 - rp) * 0.9 });

      // 회색 점이 원천 로그 조회 → 승률 숫자로 그대로 통과한다
      const G0 = 3.5, G1 = 4.1;
      const gx = kf(lt, [[G0, cx[2]], [G1, cx[4], ease.inOutSine]]);
      attr(this.gray, { cx: gx });
      this.gray.style.opacity = f3(prog(lt, G0 - 0.05, 0.15) * (1 - 0.6 * prog(lt, G1 + 0.1, 0.4)));
      attr(this.litGray, { x2: lt < G0 ? cx[2] : gx });
      this.litGray.style.opacity = lt < G0 ? '0' : '1';
      const g3 = prog(lt, lerp(G0, G1, 0.45), 0.25), g4 = prog(lt, G1 - 0.05, 0.25);
      css(this.cards[3], { borderColor: `rgba(225,220,245,${f3(0.36 + 0.3 * g3)})` });
      css(this.cards[4], { borderColor: `rgba(240,236,255,${f3(0.36 + 0.5 * g4)})`, background: `rgba(${Math.round(lerp(22, 52, g4))},${Math.round(lerp(18, 46, g4))},${Math.round(lerp(96, 140, g4))},.62)` });
      this.qLine.style.opacity = f3(prog(lt, 3.35, 0.25));
      UI.rise(this.quote, lt, 3.4, { y: 14, dur: 0.5 });

      // 정지 중: 산호색 점이 제자리에서 맥박, 회색 작은 점은 셋째 칸 뒤 레일을 계속 지나간다
      const a = DECK.amb(ctx.t), gate = prog(lt, 4.3, 0.6);
      const ph = (a * 0.8) % 1;
      if (lt > T2 + 0.8) attr(this.pulse, { r: 12 + 14 * ph, opacity: gate * (1 - ph) * 0.6 });
      this.loop.forEach((d, k) => {
        const p = (a * 0.32 + k / 3) % 1;
        attr(d, { cx: lerp(cx[2] + 18, cx[4], p) });
        d.style.opacity = f3(gate * Math.sin(Math.PI * p) * 0.75);
      });

      // ④ 결론: 제목 → 의미 줄
      UI.titleIn(this.T, lt, 4.3);
      UI.lineIn(this.m, lt, 5.5);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────────────── P05 · Kensho — 실행됨과 정답 [가: 왼쪽 글 칸] ─────────────────
  // 점 100개(설명용 예시)가 왼쪽 묶음에서 오른쪽으로 흐른다. 첫 통과선 「실행됨」에서 1개만 회색으로 떨어지고 99개가 지나간다.
  // 둘째 통과선 「정답」에서는 45개만 지나 오른쪽 끝 민트 묶음이 되고, 나머지 54개는 선 앞에 산호색 묶음으로 멈춘다.
  // 99%·50% 큰 숫자는 각 통과선 위쪽에서 통과가 끝날 때 고정된다
  DECK.slide({
    id: 'p05', stops: [1.8, 3.7, 5.6, 6.5], exit: 0.5, bg: DECK.BGP.text,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: SRC_KENSHO }, HD));
      this.chip = V3.story(this.hd, { name: 'Kensho', k: 1, n: 1 });
      // 왼쪽 글 칸(x 120~800)
      this.q = UI.ask(R, '한 회사의 일인가, 흔한 일인가', { top: 110 });
      this.T = UI.title(R, '금융 DB에서 생성된/SQL은 99% 실행됐지만/정답은 *절반에 못 미쳤다*', { top: 150, size: 58, width: 680 });
      this.c = UI.context(R, '금융 AI 회사 Kensho 운영 DB의 실제 질문 359개. 질문을 SQL로 바꾸는 방법 7종, 같은 LLM', { top: 374, width: 680 });
      this.term = UI.term(R, 'SQL', '데이터베이스 질의 언어', { top: 500, left: 120, width: 680 });
      this.m = UI.meaning(R, '→ 실행이 됐다는 것과 답이 맞다는 것은 다른 일이다', { top: 580, width: 680, size: 30 });

      // 오른쪽 도식(x 860~1800): 큰 숫자(y 108~260) → 통과선 이름(y 278) → 통과선(y 320~548)과 점 100개 → 아래 줄(y 580)
      const G1 = this.G1 = 1300, G2 = this.G2 = 1610, GY0 = this.GY0 = 320, GY1 = this.GY1 = 548;
      // 「설명용 예시」는 점 묶음 오른쪽 아래(민트 묶음 끝 x 1789에 오른쪽 맞춤)
      this.ex = box(R, '설명용 예시', { left: '1489px', top: '516px', width: '300px', textAlign: 'right', font: '600 28px/1.2 Pretendard', color: 'var(--dim)', letterSpacing: '-.01em', whiteSpace: 'nowrap' });
      this.gl = [['실행됨', G1], ['정답', G2]].map(([t, gx]) => box(R, t, { left: (gx - 120) + 'px', top: '278px', width: '240px', textAlign: 'center',
        font: '700 30px/1.2 Pretendard', color: 'var(--ink)', letterSpacing: '-.02em', whiteSpace: 'nowrap' }));
      const sv = svgRoot(R);
      this.gates = [G1, G2].map(gx => s('line', { x1: gx, y1: GY0, x2: gx, y2: GY1, stroke: 'rgba(230,224,255,.55)', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, sv));
      // 점 100개: 10×10 대기 → 통과선 1 뒤 → 최종 자리(통과 45개는 오른쪽 끝 7열, 멈춘 54개는 통과선 2 앞 9열×6줄)
      const DROP = 45, NPASS = 45;
      const ids = [...Array(100).keys()].filter(i => i !== DROP).sort((a, b) => rand(a, 7) - rand(b, 7));
      const pass = new Set(ids.slice(0, NPASS));
      const order = [...Array(100).keys()].sort((a, b) => (Math.floor(b / 10) - Math.floor(a / 10)) || (a - b));   // 앞 열(오른쪽)이 먼저 도착
      let nF = 0, nP = 0;
      this.P = [];
      order.forEach(i => {
        const r = i % 10, c = Math.floor(i / 10);
        const y = 330 + r * 22, x0 = 880 + c * 24, xm = x0 + 440;
        let xf, yf = y, kind;
        if (i === DROP) { kind = 'drop'; xf = G1 - 12; }
        else if (pass.has(i)) { kind = 'pass'; xf = 1782 - Math.floor(nP / 7) * 22; yf = 363 + (nP % 7) * 22; nP++; }
        else { kind = 'fail'; xf = G2 - 30 - Math.floor(nF / 6) * 24; yf = 374 + (nF % 6) * 22; nF++; }
        const e = s('circle', { cx: x0, cy: y, r: 7, fill: C.ink }, sv);
        this.P.push({ i, r, c, y, yf, x0, xm, xf, kind, el: e });
      });
      // 큰 숫자(통과선 위쪽, 통과가 끝나면 고정). 숫자 오른쪽에 「이상/미만」과 라벨을 위아래로 둔다:
      // 「%」 끝(x+226)에서 24px 띄우고, 「이상」과 라벨 사이 20px, 라벨 두 줄은 줄 간격 1.35
      const big = (x, num, color, word, label) => {
        const n = box(R, num + '<span style="font-size:.44em;font-weight:800;margin-left:.03em">%</span>', { left: x + 'px', top: '108px', font: '900 136px/1 Pretendard', color, letterSpacing: '-.05em', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' });
        const w = box(R, word, { left: (x + 250) + 'px', top: '122px', font: '800 42px/1 Pretendard', color, letterSpacing: '-.03em', whiteSpace: 'nowrap' });
        const lb = box(R, label, { left: (x + 250) + 'px', top: '180px', font: '600 30px/1.35 Pretendard', color: 'var(--ink)', letterSpacing: '-.02em', whiteSpace: 'nowrap' });
        return { n, w, lb };
      };
      this.B1 = big(1020, '99', C.mint, '이상', '실행된<br>SQL');
      this.B2 = big(1420, '50', C.coral, '미만', '정답률<br>(7종 모두)');
      this.bot = box(R, '틀린 답 중 잘못된 ID(대상을 가리키는 번호)가 든 비율: 방법별 <span style="color:var(--coral);font-weight:800">64~96%</span>', {
        left: '860px', top: '580px', width: '940px', font: '600 30px/1.28 Pretendard', color: 'var(--ink)', letterSpacing: '-.015em', wordBreak: 'keep-all' });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      V3.storyIn(this.chip, lt, 0.2);
      UI.lineIn(this.q, lt, 0.05);
      UI.titleIn(this.T, lt, 0.2);
      UI.lineIn(this.c, lt, 1.0);
      UI.lineIn(this.term, lt, 1.2);

      // 통과선과 대기 점이 깔린다
      UI.lineIn(this.ex, lt, 0.9);
      this.gl.forEach((g, k) => UI.rise(g, lt, 1.0 + k * 0.12, { y: -12, dur: 0.45 }));
      this.gates.forEach((g, k) => {
        const p = prog(lt, 1.0 + k * 0.12, 0.5, ease.outCubic);
        attr(g, { y2: lerp(this.GY0, this.GY1, p) });
        g.style.opacity = p > 0.001 ? '1' : '0';
      });
      const G1 = this.G1, G2 = this.G2;
      this.P.forEach(p => {
        const appear = prog(lt, 0.9 + p.r * 0.02 + p.c * 0.025, 0.35);
        // 1차 이동: 대기 → 통과선 1 뒤(떨어지는 점은 선 앞에서 멈춘 뒤 아래로 떨어진다)
        const dA = 1.95 + (9 - p.c) * 0.06 + p.r * 0.012;
        const a1 = prog(lt, dA, 0.8, ease.inOutSine);
        // 2차 이동: 통과선 1 뒤 → 최종 자리
        const dB = 3.8 + (9 - p.c) * 0.05 + p.r * 0.01;
        const b1 = prog(lt, dB, 0.95, p.kind === 'fail' ? ease.outCubic : ease.inOutSine);
        let x, y = p.y, col = C.ink, op = appear;
        if (p.kind === 'drop') {
          x = lerp(p.x0, p.xf, a1);
          const fall = prog(lt, dA + 0.8, 0.5, ease.inCubic);
          y = lerp(p.y, 556, fall);
          col = mixHex('#f6f3ff', '#7d7896', prog(lt, dA + 0.75, 0.3));
          op = appear * (1 - 0.3 * fall);
        } else {
          x = lerp(lerp(p.x0, p.xm, a1), p.xf, b1);
          y = lerp(p.y, p.yf, b1);
          if (p.kind === 'fail') col = mixHex('#f6f3ff', C.coral, prog(lt, dB + 0.7, 0.3));
          else col = mixHex('#f6f3ff', C.mint, clamp((x - G2) / 50));
        }
        attr(p.el, { cx: x, cy: y, fill: col });
        p.el.style.opacity = f3(op);
      });
      // 점이 지나가는 동안 통과선이 밝아진다
      const actA = prog(lt, 2.1, 0.3) * (1 - prog(lt, 3.3, 0.4));
      const actB = prog(lt, 4.0, 0.3) * (1 - prog(lt, 5.2, 0.4));
      attr(this.gates[0], { stroke: actA > 0.01 ? A(C.mint, 0.55 + 0.4 * actA) : 'rgba(230,224,255,.55)' });
      attr(this.gates[1], { stroke: actB > 0.01 ? A(C.coral, 0.55 + 0.4 * actB) : (lt > 5 ? A(C.coral, 0.75) : 'rgba(230,224,255,.55)') });

      // 큰 숫자: 통과가 끝난 뒤 고정
      UI.pop(this.B1.n, lt, 3.35, { from: 0.8 });
      UI.rise(this.B1.w, lt, 3.45, { x: -14, y: 0, dur: 0.4 });
      UI.rise(this.B1.lb, lt, 3.5, { x: -14, y: 0, dur: 0.4 });
      UI.pop(this.B2.n, lt, 5.2, { from: 0.8 });
      UI.rise(this.B2.w, lt, 5.3, { x: -14, y: 0, dur: 0.4 });
      UI.rise(this.B2.lb, lt, 5.35, { x: -14, y: 0, dur: 0.4 });

      // ④ 아래 줄과 의미 줄
      UI.lineIn(this.bot, lt, 5.6);
      UI.lineIn(this.m, lt, 5.85);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────────────── P06 · 두 사례의 오류 자리 [기] ─────────────────
  // 이어 붙은 화살표 띠 위로 분홍(데브시스터즈)·하늘색(Kensho) 점이 함께 출발해 둘째 칸에서 멈추고, 바로 아래로 표식이 내려온다.
  // 셋째~다섯째 칸은 왼쪽부터 민트로 차오르고 오른쪽 끝에 「실행 성공」이 뜬다
  DECK.slide({
    id: 'p06', stops: [1.5, 2.6, 4.9, 5.9], exit: 0.5, bg: Object.assign({}, DECK.BGP.flat, { yc: 920, dim: 0.34 }),
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: '데브시스터즈(2026-09-18) · Kensho(arXiv 2610.03524, 2026-10-02) · 앞 장 자료 종합' }, HD));
      this.T = UI.title(R, '두 사례 모두 SQL 문법은 맞았고/에이전트가 *스스로 고른 정제 기준과 ID*가 틀렸다', { top: 132, size: 64 });
      this.c = UI.context(R, '질문이 답이 되기까지 다섯 단계 중 두 사례 모두 둘째 단계에서 틀렸고, 뒤 단계는 정상이었다', { top: 292 });

      const sv = svgRoot(R);
      const ym = (BAND.y0 + BAND.y1) / 2;
      const names = ['질문', null, 'SQL 작성', 'DB 실행', '답'];
      this.segs = BAND.segs.map((sg, i) => {
        const g = s('g', {}, sv);
        const poly = s('polygon', { points: segPts(i), fill: 'rgba(22,18,96,.62)', stroke: 'rgba(190,170,255,.42)', 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
        const fillP = s('polygon', { points: segPts(i), fill: A(C.mint, 0.2), stroke: A(C.mint, 0.9), 'stroke-width': 2.5, 'stroke-linejoin': 'round', opacity: 0 }, g);
        const cxm = (sg[0] + sg[1]) / 2 + (i > 0 ? BAND.d / 2 : 0) + (i < 4 ? BAND.d / 4 : 0);
        const ta = { x: cxm, 'text-anchor': 'middle', fill: C.ink, 'font-family': 'Pretendard', 'letter-spacing': -0.6 };
        if (names[i]) {
          const tx = s('text', Object.assign({ y: ym + 11, 'font-weight': 700, 'font-size': 32 }, ta), g);
          tx.textContent = names[i];
        } else {
          // 둘째 칸: 두 줄(기준선 사이 44px, 줄 간격 약 1.4)
          const t1 = s('text', Object.assign({ y: ym - 12, 'font-weight': 700, 'font-size': 31 }, ta), g);
          t1.textContent = '데이터 정의 읽기';
          const t2 = s('text', Object.assign({ y: ym + 32, 'font-weight': 500, 'font-size': 30, fill: 'rgba(238,232,255,.86)' }, ta), g);
          t2.textContent = '(없으면 에이전트가 추측)';
        }
        return { g, poly, fillP, x0: sg[0], x1: sg[1] + (i < 4 ? BAND.d : 0) };
      });
      this.clips = this.segs.map((sg, i) => {
        const id = 'p06c' + i;
        const cp = s('clipPath', { id }, sv);
        const r = s('rect', { x: sg.x0 - 2, y: BAND.y0 - 4, width: 0, height: BAND.y1 - BAND.y0 + 8 }, cp);
        sg.fillP.setAttribute('clip-path', `url(#${id})`);
        return r;
      });
      // 두 점: 분홍은 위 칸줄에서 둘째 칸 글자 왼쪽에, 하늘색은 아래 칸줄에서 글자 오른쪽에 멈춘다
      this.lanes = [{ y: 362, col: C.pink, stop: 395, start: 150 }, { y: 436, col: C.cyan, stop: 818, start: 176 }];
      this.dots = this.lanes.map(l => ({
        halo: s('circle', { cx: l.start, cy: l.y, r: 9, fill: 'none', stroke: l.col, 'stroke-width': 2, opacity: 0 }, sv),
        tail: s('line', { x1: l.start, y1: l.y, x2: l.start, y2: l.y, stroke: l.col, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }, sv),
        c: s('circle', { cx: l.start, cy: l.y, r: 8, fill: l.col, opacity: 0 }, sv),
      }));
      // 점에서 바로 아래 표식으로 내려가는 선
      this.links = [
        s('line', { x1: 395, y1: 372, x2: 395, y2: 468, stroke: C.pink, 'stroke-width': 2.5 }, sv),
        s('line', { x1: 818, y1: 446, x2: 818, y2: 468, stroke: C.cyan, 'stroke-width': 2.5 }, sv),
      ];
      this.links.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = `${f1(L)} ${f1(L + 2)}`; p._L = L; });
      const chip = (txt, col, left) => box(R, txt, { left: left + 'px', top: '466px', padding: '6px 18px 7px', borderRadius: '12px', border: `2px solid ${A(col, 0.8)}`,
        background: A(col, 0.14), font: '600 30px/1.2 Pretendard', color: 'var(--ink)', letterSpacing: '-.02em', whiteSpace: 'nowrap' });
      this.chips = [chip('정제 기준(데브시스터즈)', C.pink, 360), chip('질문 속 이름을 잘못된 ID로 바꿈(Kensho)', C.cyan, 783)];
      this.ok = box(R, '<svg width="34" height="34" viewBox="0 0 34 34" style="vertical-align:-6px;margin-right:10px"><circle cx="17" cy="17" r="15" fill="rgba(115,245,198,.18)" stroke="#73f5c6" stroke-width="2.5"/><path d="M10 17.5l4.6 4.6 9.4-9.6" fill="none" stroke="#73f5c6" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>실행 성공', {
        left: '1580px', top: '470px', width: '220px', textAlign: 'right', font: '700 32px/1.2 Pretendard', color: 'var(--mint)', letterSpacing: '-.02em', whiteSpace: 'nowrap' });
      this.term = UI.term(R, 'LLM 바깥', '모델을 바꾸지 않고 설계할 수 있는 부분: 읽는 정의, 계산을 맡는 코드·DB, 에이전트 구성, 실행 기록', { top: 540, left: 120, width: 1680 });
      this.m = UI.meaning(R, '→ 그래서 LLM 바깥을 설계한다', { top: 594 });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      UI.titleIn(this.T, lt, 0.1);
      UI.lineIn(this.c, lt, 0.85);

      this.segs.forEach((sg, i) => {
        const p = prog(lt, 1.5 + i * 0.1, 0.45, ease.snap);
        sg.g.style.opacity = f3(p);
        attr(sg.g, { transform: `translate(${f1((1 - p) * -40)},0)` });
      });

      const T0 = 2.7, ARR = [3.45, 3.65];
      const stopP = Math.max(prog(lt, ARR[0], 0.3), prog(lt, ARR[1], 0.3));
      this.lanes.forEach((l, k) => {
        const D = this.dots[k];
        const x = kf(lt, [[T0 + k * 0.08, l.start], [ARR[k], l.stop, ease.outBack]]);
        const vis = prog(lt, T0 - 0.1 + k * 0.08, 0.2);
        attr(D.c, { cx: x }); D.c.style.opacity = f3(vis);
        const v = lt > T0 && lt < ARR[k] ? 1 : 0;
        attr(D.tail, { x1: Math.max(l.start, x - 60), x2: x }); D.tail.style.opacity = f3(v * 0.5 * vis);
        attr(D.halo, { cx: x });
        const r = prog(lt, ARR[k], 0.7, ease.outCubic);
        attr(D.halo, { r: 9 + 22 * r, opacity: (lt >= ARR[k] ? 1 : 0) * (1 - r) * 0.9 });
        const lp = prog(lt, ARR[k] + 0.12, 0.35, ease.outCubic);
        const P = this.links[k];
        P.style.strokeDashoffset = f1(P._L * (1 - lp)); P.style.opacity = lp > 0.001 ? '1' : '0';
        UI.rise(this.chips[k], lt, ARR[k] + 0.35, { y: -12, dur: 0.45 });
      });
      const s1 = this.segs[1];
      attr(s1.poly, { stroke: stopP > 0.01 ? A(C.coral, 0.45 + 0.5 * stopP) : 'rgba(190,170,255,.42)', fill: `rgba(${Math.round(lerp(22, 110, stopP))},${Math.round(lerp(18, 28, stopP))},${Math.round(lerp(96, 92, stopP))},.62)` });

      const M0 = 4.0;
      [2, 3, 4].forEach((i, k) => {
        const sg = this.segs[i];
        const p = prog(lt, M0 + k * 0.2, 0.4, ease.inOutSine);
        attr(this.clips[i], { width: f1((sg.x1 - sg.x0 + 6) * p) });
        sg.fillP.style.opacity = p > 0.001 ? '1' : '0';
      });
      UI.pop(this.ok, lt, M0 + 0.72, { from: 0.7 });

      const a = DECK.amb(ctx.t), gate = prog(lt, 5.0, 0.6);
      [2, 3, 4].forEach((i, k) => {
        const w = 0.5 + 0.5 * Math.sin(2 * Math.PI * (a * 0.45 - k * 0.22));
        this.segs[i].fillP.setAttribute('fill', A(C.mint, 0.2 + 0.08 * w * gate));
      });
      this.dots.forEach((D, k) => {
        if (lt < ARR[k] + 0.75) return;
        const ph = (a * 0.6 + k * 0.5) % 1;
        attr(D.halo, { r: 9 + 12 * ph, opacity: gate * (1 - ph) * 0.6 });
      });

      UI.lineIn(this.m, lt, 4.95);
      UI.lineIn(this.term, lt, 5.25);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────────────── P07 · 구성 도표 처음 등장 ─────────────────
  // 앞 장 띠가 흐려지고 둘째 칸만 남아 「① 데이터 정의」 칸 자리로 옮겨 간다. 그 오른쪽에 ②, ③이 놓이고, 셋 아래로 ④ 띠가 펼쳐진다.
  // 칸마다 정의 한 줄이 칸이 놓인 직후 나온다. 머리글 「다음: …」은 ④ 띠 아래 오른쪽 끝에 마지막으로
  DECK.slide({
    id: 'p07', stops: [1.6, 3.2, 4.3, 5.0], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: '발표자 제안' }, HD));
      this.q = UI.ask(R, 'LLM 바깥에서 무엇을 설계하나', { top: 112 });
      this.T = UI.title(R, '*데이터 정의*, 계산 위치, 나누는 방식을 설계하고/실행 기록으로 검증한다', { top: 150, size: 62 });
      // 용어 설명은 ④ 띠 바로 아래 왼쪽, 「다음: …」은 같은 줄 오른쪽 끝
      this.term = UI.term(R, '실행 기록', '에이전트가 무엇을 읽고 어떤 도구를 몇 번 불러 어떤 답을 냈는지 남긴 기록', { top: 582, left: 120, width: 1160 });
      this.pre = box(R, '<i style="display:inline-block;width:6px;height:28px;border-radius:3px;background:var(--amber);vertical-align:-5px;margin-right:14px"></i>다음: 2026년 11월 현황', {
        left: '1300px', top: '582px', width: '500px', textAlign: 'right', font: '700 30px/1.2 Pretendard', color: 'var(--amber)', letterSpacing: '-.015em', whiteSpace: 'nowrap' });

      const sv = svgRoot(R);
      this.ghost = BAND.segs.map((sg, i) => s('polygon', { points: segPts(i), fill: i === 1 ? 'rgba(110,28,92,.62)' : 'rgba(22,18,96,.5)',
        stroke: i === 1 ? A(C.coral, 0.95) : 'rgba(190,170,255,.36)', 'stroke-width': i === 1 ? 2.5 : 2, 'stroke-linejoin': 'round' }, sv));

      // 칸 높이 158: 둘째 칸 두 줄 정의의 아래 여백 14px 이상
      this.FY = 318; this.CH = 158;
      this.F = V3.frame(R, { x: 120, y: this.FY, w: 1680, active: -1, cellH: this.CH, bandH: 64, vgap: 20, fillSize: 30,
        fills: ['에이전트가 읽는 테이블·지표 설명', '날짜 해석·집계를 어디서 하나<br>(에이전트·코드·DB)', '에이전트와 작업을 어떤 기준으로 나누나', '답과 기록을 함께 채점하고 여러 번 돌린다'] });
      this.cw = (1680 - 28 * 2) / 3;
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      UI.lineIn(this.q, lt, 0.05);
      UI.titleIn(this.T, lt, 0.2);

      // 앞 장 띠의 잔상: 둘째 칸 말고는 흐려지며 줄어든다
      this.ghost.forEach((g, i) => {
        if (i === 1) return;
        const p = prog(lt, 0.35 + Math.abs(i - 1) * 0.06, 0.6, ease.inOutCubic);
        g.style.opacity = f3(0.55 * (1 - p));
        const [x0, x1] = BAND.segs[i], cx = (x0 + x1) / 2, cy = (BAND.y0 + BAND.y1) / 2;
        attr(g, { transform: `translate(${f1(cx)},${f1(cy)}) scale(${f3(1 - 0.12 * p)}) translate(${f1(-cx)},${f1(-cy)})` });
      });
      // 둘째 칸이 ① 칸 자리로 옮겨 가며 화살표 모양이 직사각형이 되고, 산호색이 꺼짐 상태 색으로 바뀐다
      const [sx0, sx1] = BAND.segs[1];
      const mv = prog(lt, 0.9, 1.0, ease.inOutCubic);
      const tx0 = 120, tx1 = 120 + this.cw, ty0 = this.FY, ty1 = this.FY + this.CH;
      const d = BAND.d * (1 - mv);
      const gs = this.ghost[1];
      attr(gs, { points: chevPts(lerp(sx0, tx0, mv), lerp(sx1, tx1, mv), lerp(BAND.y0, ty0, mv), lerp(BAND.y1, ty1, mv), d, d) });
      const cool = prog(lt, 1.3, 0.6);
      attr(gs, { stroke: `rgba(${Math.round(lerp(255, 190, cool))},${Math.round(lerp(122, 170, cool))},${Math.round(lerp(138, 255, cool))},${f3(lerp(0.95, 0.4, cool))})`,
        fill: `rgba(${Math.round(lerp(110, 22, cool))},${Math.round(lerp(28, 18, cool))},${Math.round(lerp(92, 96, cool))},.55)` });
      gs.style.opacity = f3(1 - prog(lt, 1.85, 0.3));

      // 칸 ①(잔상과 겹치며 나타남) → ② → ③이 오른쪽으로 차례로, 칸마다 정의 한 줄
      const F = this.F;
      const cellT = [1.75, 2.3, 2.8];
      F.cells.forEach((c, i) => {
        const p = prog(lt, cellT[i], i === 0 ? 0.35 : 0.55, ease.snap);
        c.style.opacity = f3(p);
        css(c, { transform: i === 0 ? 'none' : `translateX(${f1((1 - p) * -70)}px)` });
        const q = prog(lt, cellT[i] + 0.3, 0.45, ease.snap);
        css(F.fl[i], { opacity: f3(q), transform: `translateX(${f1((1 - q) * -14)}px)` });
      });
      // 세 칸에서 연결선이 내려가고 ④ 띠가 왼쪽부터 펼쳐진다. 용어 설명이 같이 나온다
      F.links.forEach((l, i) => { l.setAttribute('opacity', f3(prog(lt, 3.25 + i * 0.07, 0.3, ease.outCubic))); });
      const pb = prog(lt, 3.4, 0.65, ease.snap);
      css(F.band, { opacity: f3(pb), clipPath: `inset(0 ${f1((1 - pb) * 100)}% 0 0)` });
      const q4 = prog(lt, 3.8, 0.45, ease.snap);
      css(F.fl[3], { opacity: f3(q4), transform: `translateX(${f1((1 - q4) * -14)}px)` });
      UI.lineIn(this.term, lt, 3.7);
      // 다음 섹션 머리글: 도표 오른쪽 아래
      UI.rise(this.pre, lt, 4.4, { x: 24, y: 0, dur: 0.5 });

      UI.exit(this.R, lt, ctx);
    },
  });
})();
