/* scenes_v3_2.js — 섹션 2 현재 시점 P08~P12 (스토리보드 v3, 2차 구도)
 * p08 간지: 다른 간지와 같은 기본 배치. 도표 위 왼쪽에 '현재 시점 · 자료 4건' 라벨
 * p09 구도 가: 왼쪽 글 칸, 오른쪽 10×10 격자. 100칸 중 62칸이 차례로 차고, 앞 25칸이 진한 색으로 바뀐다(25%는 62% 안에 들어 있다)
 * p10 구도 나: 49가 화면 가운데에서 올라가 멈춘 뒤, 아래 양쪽 두 갈래 선을 따라 24·25로 나뉘어 숫자 양옆 라벨에 붙는다
 * p11 구도 라: 막대가 먼저 나온다. 8.4% 막대가 멈춘 끝에서 기준선이 내려오고, 23.5%·33.8% 막대가 그 선을 넘은 뒤 제목이 결론으로 나온다
 * p12 구도 가R: 오른쪽 글 칸, 왼쪽 높이 400px 통 세 개(통 높이 전체 = 앱 1,723개). 앞 두 통이 높이 차고 세 번째 통만 낮게 멈춘 뒤 테두리가 강조된다
 * 화면 글자는 스토리보드 「(화면)」 항목(04d 수정 반영)만 쓴다. 읽을 내용은 모두 y 648 위.
 */
(function () {
  'use strict';
  const { clamp, lerp, prog, ease, h, s, css } = REEL;

  // ── 이 파일 공용 도구 ──
  const f1 = v => v.toFixed(1), f3 = v => v.toFixed(3);
  function svgRoot(parent) {
    const v = s('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, parent);
    css(v, { position: 'absolute', left: '0', top: '0', overflow: 'visible' });
    return v;
  }
  function box(parent, html, o) { const e = h('div', 'a', parent, html); css(e, o || {}); return e; }
  function drawable(el) { const L = el.getTotalLength(); el.style.strokeDasharray = `${f1(L)} ${f1(L + 2)}`; el._L = L; return el; }
  function draw(el, p) { el.style.strokeDashoffset = f1(el._L * (1 - clamp(p))); el.style.opacity = p > 0.001 ? '1' : '0'; }
  function mix(a, b, p) { return a.map((v, i) => lerp(v, b[i], p)); }
  function rgba(c) { return `rgba(${c[0].toFixed(0)},${c[1].toFixed(0)},${c[2].toFixed(0)},${c[3].toFixed(3)})`; }
  // 3차 베지어 위의 점
  function bez(P, t) {
    const u = 1 - t;
    return [0, 1].map(k => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]);
  }

  const BG_TXT = Object.assign({}, DECK.BGP.calm, { yc: 960, amp: 70, spread: 150, dim: 0.42 });
  const SEC = { sec: '02', name: '현재 시점' };
  // 1단계 공통: 머리말 → 질문 → 제목 → 맥락 줄
  function intro(S, lt) {
    UI.headerIn(S.hd, lt);
    UI.lineIn(S.q, lt, 0.05);
    UI.titleIn(S.T, lt, 0.2);
    if (S.c) UI.lineIn(S.c, lt, 0.95);
  }

  // ───────────────── P08 간지 · 02 현재 시점 ─────────────────
  DECK.slide({
    id: 'p08', stops: [3.2], exit: 0.5, bg: V3.DIV_BG,
    setup(el) {
      const R = this.R = UI.root(el);
      this.D = V3.divider(R, { num: '02', title: '2026년 11월', sub: '에이전트를 만들고 운영하는 조직은 얼마나 되나', active: -1 });
      this.lab = box(R, '현재 시점 · 자료 4건', { left: '120px', top: '400px', font: '700 30px/1.2 Pretendard', color: 'var(--cyan)', letterSpacing: '-.01em', whiteSpace: 'nowrap' });
    },
    render(lt, ctx) {
      V3.dividerIn(this.D, lt);
      UI.rise(this.lab, lt, 1.1, { x: -24, y: 0, blur: 4 });
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────────────── P09 구도 가 · 단위 그림 62% 중 25% ─────────────────
  // 오른쪽 칸 10×10 격자: 62칸이 왼쪽 위부터 차례로 차고, 앞 25칸이 진해진다. 라벨 숫자는 찬 칸 수를 센다
  DECK.slide({
    id: 'p09', stops: [1.9, 3.5, 5.3], exit: 0.5, bg: BG_TXT,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: 'KPMG US · Q3 2026 AI Pulse Survey 보도자료 · 2026-09-24 · 설문(경영진 314명)' }, SEC));
      this.q = UI.ask(R, '에이전트를 만드는 기업은 얼마나 되나', { top: 110 });
      this.T = UI.title(R, '미국 대기업 경영진/314명 중 *62%*가 에이전트를/구축·배포·개발 중이라고 답했다', { top: 150, size: 56, width: 680 });
      this.c = UI.context(R, 'KPMG 미국 Q3 조사(2026-07~08), 매출 10억 달러 이상 기업. 세 답을 합친 값', { top: 366, width: 680 });
      this.m = UI.meaning(R, '→ 넷 중 하나는 여러 에이전트로 나눈 구성을 시도한다', { top: 556, width: 680, size: 30 });
      const G = this.G = { x: 860, y: 132, cols: 10, pitch: 42, cell: 36 };
      this.cells = [];
      for (let i = 0; i < 100; i++) {
        const r = Math.floor(i / G.cols), c = i % G.cols;
        const o = box(R, '', { left: (G.x + c * G.pitch) + 'px', top: (G.y + r * G.pitch) + 'px', width: G.cell + 'px', height: G.cell + 'px',
          borderRadius: '7px', boxSizing: 'border-box', border: '2px solid rgba(190,170,255,.34)' });
        const f = h('div', '', o);
        css(f, { position: 'absolute', inset: '-2px', borderRadius: '7px' });
        this.cells.push({ o, f });
      }
      // 오른쪽 라벨 2개(칸 색과 같은 견본 사각형)
      const TX = 'font:600 30px/1.3 Pretendard;color:var(--ink);letter-spacing:-.02em;display:flex;align-items:center;gap:12px;white-space:nowrap';
      const SW = c => `<i style="display:block;width:28px;height:28px;border-radius:6px;flex:none;background:${c}"></i>`;
      this.la = box(R, `<div style="${TX}">${SW('rgba(111,226,255,.40)')}개발·구축·배포 중 응답의 합</div><b class="u-num">0%</b>`, { left: '1336px', top: '128px', width: '464px' });
      this.lb = box(R, `<div style="${TX}">${SW('#6fe2ff')}전체 314명 중</div><b class="u-num">0%</b><div style="${TX}">멀티에이전트 개발·구현 중</div>`, { left: '1336px', top: '324px', width: '464px' });
      // 라벨과 큰 숫자 사이, 큰 숫자와 아래 줄 사이를 띄운다(보이는 간격 30px 안팎)
      [this.la, this.lb].forEach(e => css(e.querySelector('b'), { display: 'block', fontSize: '112px', color: 'var(--cyan)', margin: '13px 0 14px' }));
      this.term = UI.term(R, '멀티에이전트', '역할을 나눈 에이전트 여러 개가 결과를 주고받으며<br>한 작업을 처리하는 구성', { top: 566, left: 860, width: 940 });
    },
    render(lt, ctx) {
      intro(this, lt);
      const E = [190, 170, 255, 0.34], C = [111, 226, 255, 0.62], CD = [111, 226, 255, 1];
      const FL = [111, 226, 255, 0.40], FD = [111, 226, 255, 1];
      let nA = 0, nB = 0;
      this.cells.forEach((k, i) => {
        // ① 빈 칸 100개가 먼저 깔린다
        k.o.style.opacity = f3(prog(lt, 0.9 + i * 0.007, 0.3, ease.outCubic));
        // ② 62칸이 차례로 찬다
        const f = i < 62 ? prog(lt, 2.0 + i * 0.019, 0.24, ease.snap) : 0;
        // ③ 앞 25칸이 진해진다
        const d = i < 25 ? prog(lt, 3.62 + i * 0.03, 0.26, ease.snap) : 0;
        if (f > 0.5) nA++;
        if (d > 0.5) nB++;
        k.o.style.borderColor = rgba(mix(mix(E, C, f), CD, d));
        css(k.f, { opacity: f3(f), background: rgba(mix(FL, FD, d)), transform: `scale(${lerp(0.35, 1, f).toFixed(3)})`,
          boxShadow: d > 0 ? `0 0 ${f1(14 * d)}px rgba(111,226,255,${f3(0.45 * d)})` : 'none' });
      });
      UI.rise(this.la, lt, 2.0, { x: -24, y: 0, blur: 4 });
      this.la.querySelector('b').textContent = nA + '%';
      UI.rise(this.lb, lt, 3.62, { x: -24, y: 0, blur: 4 });
      this.lb.querySelector('b').textContent = nB + '%';
      UI.lineIn(this.term, lt, 4.35);
      UI.lineIn(this.m, lt, 4.7);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────────────── P10 구도 나 · 49% = 24% + 25% ─────────────────
  // 49가 가운데에서 올라가 멈춘 뒤, 숫자 아래 점에서 선이 양쪽 아래로 갈라지고 24%·25%가 그 선을 따라 숫자 양옆 라벨 자리로 간다
  const P10_O = [960, 556];
  const P10_END = [[726, 522], [1194, 522]];
  DECK.slide({
    id: 'p10', stops: [1.9, 3.5, 5.3], exit: 0.5, bg: BG_TXT,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: 'KPMG International · Global AI Pulse Q2 2026 · 2026-06-24 · <span style="white-space:nowrap">설문(응답자 자기 보고)</span>' }, SEC));
      this.q = UI.ask(R, '만든 에이전트는 계속 늘었나 — 앞 장보다 먼저 한 다른 조사', { top: 104 });
      this.T = UI.title(R, '기업 리더 2,145명 중 *49%*가 비용이 가치를 넘겨/에이전트 배포를 줄이거나 미루거나 멈췄다고 답했다', { top: 140, size: 56 });
      this.c = UI.context(R, '다른 조사: KPMG 국제 조사(2026-04~05), 20개국 기업 리더 2,145명', { top: 278 });
      this.num = box(R, '<span class="v">0</span><span style="font-size:.46em;margin-left:.04em">%</span>', { left: '0px', top: '312px', width: '1920px', textAlign: 'center', whiteSpace: 'nowrap' });
      this.num.className = 'a u-num';
      css(this.num, { fontSize: '250px', color: 'var(--amber)', transformOrigin: '50% 50%' });
      this.v = this.num.querySelector('.v');
      const sv = svgRoot(R);
      this.paths = P10_END.map((E, i) => {
        const sg = i === 0 ? -1 : 1;
        const P = [P10_O, [P10_O[0] + sg * 20, 600], [E[0] - sg * 90, 566], E];
        const p = s('path', { d: `M${P[0]} C${P[1]} ${P[2]} ${P[3]}`, fill: 'none', stroke: 'rgba(255,203,102,.85)', 'stroke-width': 3, 'stroke-linecap': 'round' }, sv);
        drawable(p); p._P = P;
        return p;
      });
      this.dot = s('circle', { cx: P10_O[0], cy: P10_O[1], r: 7, fill: '#ffcb66' }, sv);
      // 왼쪽 묶음은 오른쪽 끝을 x 716에, 오른쪽 묶음은 왼쪽 끝을 x 1204에 맞춘다
      const tok = (i, n, txt) => {
        const L = i === 0;
        const pos = L ? { left: '216px', width: '500px', textAlign: 'right' } : { left: '1204px', width: '500px', textAlign: 'left' };
        const t = box(R, `<span class="u-num">${n}<span style="font-size:.5em;margin-left:.03em">%</span></span>`, Object.assign({ top: '462px', whiteSpace: 'nowrap',
          fontSize: '116px', color: 'var(--amber)', transformOrigin: L ? '100% 50%' : '0% 50%', lineHeight: '1' }, pos));
        const l = box(R, txt, Object.assign({ top: '408px', font: '700 36px/1.2 Pretendard', color: 'var(--ink)', letterSpacing: '-.025em', whiteSpace: 'nowrap' }, pos));
        return { t, l, E: P10_END[i] };
      };
      this.toks = [tok(0, 24, '응답자 중 배포를 줄임'), tok(1, 25, '응답자 중 미루거나 멈춤')];
      this.m = UI.meaning(R, '→ 만드는 일보다 비용이 효과를 넘지 않게 하는 일이 과제가 됐다', { top: 594, size: 30 });
      css(this.m, { left: '0px', width: '1920px', maxWidth: '1920px', justifyContent: 'center' });
    },
    render(lt, ctx) {
      intro(this, lt);
      // ② 49가 0에서 올라가 멈춘다
      UI.rise(this.num, lt, 1.95, { y: 30, blur: 6 });
      UI.countTo(this.v, lt, 1.95, 1.3, 49);
      // ③ 갈라지는 순간 49가 살짝 눌렸다 돌아온다
      const k = prog(lt, 3.55, 0.18, ease.outCubic) * (1 - prog(lt, 3.73, 0.4, ease.outCubic));
      this.num.style.transform += ` scale(${(1 - 0.035 * k).toFixed(4)})`;
      this.dot.setAttribute('opacity', f3(prog(lt, 3.5, 0.15)));
      this.paths.forEach((p, i) => draw(p, prog(lt, 3.55 + i * 0.08, 0.6, ease.inOutCubic)));
      this.toks.forEach((T, i) => {
        const q = prog(lt, 3.62 + i * 0.1, 0.78, ease.swift);
        const pt = bez(this.paths[i]._P, q);
        const dx = pt[0] - T.E[0], dy = pt[1] - T.E[1];
        css(T.t, { opacity: f3(clamp(q * 3)), transform: `translate(${f1(dx)}px, ${f1(dy)}px) scale(${lerp(0.42, 1, q).toFixed(3)})` });
        UI.rise(T.l, lt, 4.25 + i * 0.1, { y: 14, blur: 4 });
      });
      UI.lineIn(this.m, lt, 4.75);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────────────── P11 구도 라 · 8.4% < 23.5% < 33.8% ─────────────────
  // 막대가 먼저 나온다. 8.4% 막대가 멈춘 끝에서 기준선이 내려오고, 아래 두 막대가 그 선을 넘어간다(넘은 부분은 더 밝다). 그 뒤 제목이 결론으로 나온다
  const P11 = { x0: 330, px: 32, top: 208, pitch: 80, bh: 56 };
  DECK.slide({
    id: 'p11', stops: [1.3, 3.0, 6.0], exit: 0.5, bg: BG_TXT,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: 'IT Brief(The Modern Data Company 설문) · AI agents outpace trust in enterprise data · 2026-08-20 · 업체 설문 중간 결과' }, SEC));
      this.q = UI.ask(R, '에이전트에 넣을 데이터는 준비됐나', { top: 104 });
      this.c = UI.context(R, '데이터 관리 업체 설문 중간 결과, 66개국 실무자 540건 이상', { top: 146 });
      const G = P11, gx = G.x0 + 8.4 * G.px;
      this.axis = box(R, '', { left: (G.x0 - 3) + 'px', top: (G.top - 12) + 'px', width: '3px', height: (G.pitch * 2 + G.bh + 24) + 'px', background: 'rgba(246,243,255,.75)', transformOrigin: '50% 0%' });
      this.ax = box(R, '같은 응답자', { left: '120px', top: (G.top + G.pitch + G.bh / 2 - 19) + 'px', width: (G.x0 - 140) + 'px', textAlign: 'right', font: '700 30px/1.25 Pretendard', color: 'var(--ink2)', whiteSpace: 'nowrap' });
      const rows = [
        { v: 8.4, lab: '데이터가 운영에 쓸 만큼 믿을 만하다', col: '#ffcb66', bg: '#ffcb66' },
        { v: 23.5, lab: '에이전트 운영 중', col: '#6fe2ff', bg: `linear-gradient(90deg, rgba(111,226,255,.42) 0 ${gx - G.x0}px, #6fe2ff ${gx - G.x0}px)` },
        { v: 33.8, lab: '시범 운영 중', col: '#6fe2ff', bg: `linear-gradient(90deg, rgba(111,226,255,.30) 0 ${gx - G.x0}px, rgba(111,226,255,.78) ${gx - G.x0}px)` },
      ];
      this.rows = rows.map((r, i) => {
        const y = G.top + i * G.pitch;
        const bar = box(R, '', { left: G.x0 + 'px', top: y + 'px', height: G.bh + 'px', width: '0px', borderRadius: '0 10px 10px 0', background: r.bg });
        const g = box(R, `<b class="u-num">0.0%</b><span>${r.lab}</span>`, { left: G.x0 + 'px', top: y + 'px', height: G.bh + 'px', display: 'flex', alignItems: 'center', gap: '16px', whiteSpace: 'nowrap' });
        css(g.querySelector('b'), { fontSize: '48px', color: r.col });
        const sp = g.querySelector('span');
        css(sp, { font: '600 30px/1.2 Pretendard', color: 'var(--ink)', letterSpacing: '-.02em' });
        return Object.assign({ bar, g, b: g.querySelector('b'), sp }, r);
      });
      this.guide = box(R, '', { left: (gx - 1) + 'px', top: (G.top - 8) + 'px', width: '0px', height: (G.pitch * 2 + G.bh + 16) + 'px', borderLeft: '3px dashed rgba(255,203,102,.95)' });
      // 결론으로 나오는 제목과 의미 줄
      this.T = UI.title(R, '데이터를 믿는다는 응답 8.4%보다/에이전트를 운영 중이라는 응답 *23.5%*가 많았다', { top: 450, size: 62 });
      this.m = UI.meaning(R, '→ 에이전트 운영 중 응답(23.5%)이 데이터를 믿는다는 응답(8.4%)의 약 2.8배다', { top: 604, size: 30 });
    },
    render(lt, ctx) {
      const G = P11;
      UI.headerIn(this.hd, lt);
      UI.lineIn(this.q, lt, 0.05);
      UI.lineIn(this.c, lt, 0.25);
      const pa = prog(lt, 0.55, 0.5, ease.outCubic);
      css(this.axis, { opacity: f3(pa), transform: `scaleY(${pa.toFixed(3)})` });
      UI.rise(this.ax, lt, 0.7, { x: -20, y: 0, blur: 4 });
      const T0 = [1.4, 3.1, 3.24];
      this.rows.forEach((r, i) => {
        const q = prog(lt, T0[i], i === 0 ? 0.85 : 1.0, ease.outQuart);
        const w = r.v * G.px * q;
        css(r.bar, { width: f1(w) + 'px' });
        css(r.g, { opacity: f3(clamp(q * 4)), transform: `translateX(${f1(w + 18)}px)` });
        r.b.textContent = (r.v * q).toFixed(1) + '%';
        r.sp.style.opacity = f3(prog(lt, T0[i] + (i === 0 ? 0.6 : 0.75), 0.4));
        // 기준선을 넘은 막대는 끝이 빛난다
        if (i > 0) r.bar.style.boxShadow = w > 8.4 * G.px ? `0 0 ${f1(24 * q)}px rgba(111,226,255,${f3(0.35 * q)})` : 'none';
      });
      // ② 끝: 8.4% 끝에서 기준선이 아래로 내려온다
      const pg = prog(lt, 2.4, 0.45, ease.inOutCubic);
      css(this.guide, { opacity: pg > 0 ? '1' : '0', clipPath: `inset(0 -4px ${f1((1 - pg) * 100)}% -4px)` });
      // ③ 끝: 움직임이 끝난 뒤 제목과 의미 줄
      UI.titleIn(this.T, lt, 4.35);
      UI.lineIn(this.m, lt, 5.45);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────────────── P12 구도 가R · 앱 1,723개 중 ─────────────────
  // 왼쪽 도식 칸: 높이 400px 통 세 개(통 높이 전체 = 앱 1,723개). 앞 두 통이 높이 찬 뒤 세 번째 통만 낮게 멈추고 테두리가 호박색으로 강조된다
  const P12 = { cx: [340, 630, 920], bw: 170, y0: 200, y1: 600 };
  DECK.slide({
    id: 'p12', stops: [1.9, 3.5, 5.3], exit: 0.5, bg: BG_TXT,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({ src: 'Majeed 외(NYU 아부다비) · An Empirical Study of MCP Applications · arXiv\u00a02607.25635 · 2026-07-28 · 공개 저장소 분석' }, SEC));
      // 오른쪽 글 칸(x 1120~1800). 출처 줄이 두 줄이라 질문 줄을 y 124로 내린다
      this.q = UI.ask(R, '도구를 붙인 에이전트는 실행 전에 멈춰 묻나', { top: 124, left: 1120 });
      this.T = UI.title(R, '공개 MCP 앱 1,723개 중/도구 실행 전 승인 단계를/둔 앱은 *37.2%*였다', { top: 164, left: 1120, size: 56, width: 680 });
      this.c = UI.context(R, 'NYU 아부다비, MCP 규격으로 도구를 연결한 GitHub 공개 앱 1,723개를 LLM으로 분류', { top: 380, left: 1120, width: 680 });
      this.term = UI.term(R, 'MCP', '에이전트에 외부 도구를 연결하는 공통 규격', { top: 476, left: 1120, width: 680 });
      this.m = UI.meaning(R, '→ 앱의 90.8%는 로그를 남긴다. 그 기록으로 무엇을 확인할지는 「실행 기록으로 검증」에서 다룬다', { top: 558, left: 1120, width: 680, size: 30 });
      const G = P12, H = G.y1 - G.y0;
      // 세로축: 위 끝 = 앱 1,723개
      const sv = svgRoot(R);
      const ax = 140;
      this.axis = s('path', { d: `M${ax + 12} ${G.y0} H${ax} V${G.y1} H${ax + 12}`, fill: 'none', stroke: 'rgba(246,243,255,.7)', 'stroke-width': 2.5 }, sv);
      drawable(this.axis);
      this.top = s('line', { x1: ax, y1: G.y0, x2: G.cx[2] + G.bw / 2 + 16, y2: G.y0, stroke: 'rgba(246,243,255,.35)', 'stroke-width': 2, 'stroke-dasharray': '6 8' }, sv);
      this.axl = box(R, '앱 1,723개 중', { left: '120px', top: '102px', font: '700 30px/1.25 Pretendard', color: 'var(--ink)', whiteSpace: 'nowrap' });
      const data = [
        { v: 90.8, lab: '로그 기능 있음' },
        { v: 77.2, lab: '도구별 켜기·끄기' },
        { v: 37.2, lab: '실행 전 사용자 승인' },
      ];
      this.bars = data.map((d, i) => {
        const cx = G.cx[i];
        const tr = box(R, '', { left: (cx - G.bw / 2) + 'px', top: G.y0 + 'px', width: G.bw + 'px', height: H + 'px', boxSizing: 'border-box',
          border: '2px solid rgba(190,170,255,.5)', borderRadius: '14px', overflow: 'hidden', background: 'rgba(22,18,96,.35)' });
        const fl = h('div', '', tr);
        css(fl, { position: 'absolute', left: '0', right: '0', bottom: '0', height: '0px', background: 'linear-gradient(180deg, #8ff0ff 0%, #6fe2ff 30%, rgba(111,226,255,.72) 100%)' });
        // 값은 채움 맨 위 안쪽에 진한 글자로 탄다
        const val = h('div', 'u-num', tr, '0.0%');
        css(val, { position: 'absolute', left: '0', right: '0', bottom: '0px', textAlign: 'center', fontSize: '44px', color: '#0c0b3e', whiteSpace: 'nowrap' });
        const lb = box(R, d.lab, { left: (cx - 150) + 'px', top: (G.y0 - 48) + 'px', width: '300px', textAlign: 'center', font: '600 30px/1.2 Pretendard', color: 'var(--ink)', letterSpacing: '-.02em', whiteSpace: 'nowrap' });
        return Object.assign({ tr, fl, lb, val, H }, d);
      });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      UI.lineIn(this.q, lt, 0.05);
      UI.titleIn(this.T, lt, 0.2);
      UI.lineIn(this.c, lt, 0.95);
      draw(this.axis, prog(lt, 0.7, 0.5, ease.inOutCubic));
      this.top.setAttribute('opacity', f3(prog(lt, 1.0, 0.4) * 0.9));
      UI.rise(this.axl, lt, 0.75, { x: -20, y: 0, blur: 4 });
      UI.lineIn(this.term, lt, 1.3);
      const T0 = [2.0, 2.18, 3.6];
      this.bars.forEach((b, i) => {
        UI.rise(b.tr, lt, 0.6 + i * 0.08, { y: 24, blur: 0 });
        UI.rise(b.lb, lt, 0.7 + i * 0.08, { y: 12, blur: 4 });
        const q = prog(lt, T0[i], i < 2 ? 1.05 : 0.7, ease.outQuart);
        const fh = b.H * b.v / 100 * q;
        css(b.fl, { height: f1(fh) + 'px' });
        css(b.val, { bottom: f1(fh - 56) + 'px', opacity: f3(clamp(q * 4)) });
        b.val.textContent = (b.v * q).toFixed(1) + '%';
      });
      // ③ 끝: 세 번째 통만 낮게 멈춘 것을 테두리로 강조
      const e = prog(lt, 4.3, 0.45, ease.snap);
      const B3 = this.bars[2];
      B3.tr.style.borderColor = rgba(mix([190, 170, 255, 0.5], [255, 203, 102, 1], e));
      B3.tr.style.borderWidth = (2 + 1.5 * e).toFixed(2) + 'px';
      B3.tr.style.boxShadow = e > 0 ? `0 0 ${f1(30 * e)}px rgba(255,203,102,${f3(0.4 * e)})` : 'none';
      B3.lb.style.color = rgba(mix([246, 243, 255, 1], [255, 203, 102, 1], e));
      UI.lineIn(this.m, lt, 4.75);
      UI.exit(this.R, lt, ctx);
    },
  });
})();
