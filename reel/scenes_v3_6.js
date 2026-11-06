/* scenes_v3_6.js — 스토리보드 v3 섹션 6 「실행 기록으로 검증」 P38~P46 (2차: 구도 다양화·문구 반영) */
(function () {
  'use strict';
  const { clamp, lerp, prog, ease, h, s, css, spring, rand } = REEL;

  // ── 이 파일 안에서만 쓰는 도우미 ──
  const SEC = { sec: '06', name: '실행 기록으로 검증' };
  const SRC = {
    dbt1: 'dbt Developer Blog(Lin·Noonan·Ferguson) · Inside the dbt Wizard harness · 2026-10-14 · 판매사 글(개인 플랫폼 7개월 기록)',
    tt: 'Kolli 외(Thumbtack) · Evaluating Enterprise Analytics Agents: An End-to-End, Trace-Backed Methodology · arXiv 2609.09182 · 2026-08-28 · 자체 평가(논문)',
    sf: 'Sait Izmit(Snowflake) · Building GTM AI Agents: Lessons from Deploying to 6,000 Users · 2026-07-02 · 판매사 자체 사례(주최 측 자막 확인)',
    dbt2: 'dbt Developer Blog(Alex Noonan) · Do coding agents still need dbt skills? · 2026-10-30 · 판매사 개념 검증(대부분 조건당 1회)',
    tel: 'Zhu·Pu(East China Normal University) · TelemetrySuffBench · arXiv 2608.07899 · 2026-08-08 · 가상 오류 기록 실험',
    r7: '발표자 제안 · 근거 Snowflake(2026-07-02) · Thumbtack(2026-08-28) · revfactory/harness 2.1.0',
    r8: '발표자 제안 · 근거 TelemetrySuffBench(2026-08-08) · dbt 블로그(2026-10-30) · revfactory/harness 2.1.0(harness:evolve는 실제 기능. 기록 표와 입력 확장은 발표자 제안)',
  };
  function head(R, src) {
    const hd = UI.header(R, Object.assign({ src }, SEC));
    // 출처 줄은 ' · ' 사이에서 줄을 바꾼다. 긴 조각(논문 제목 등)은 그 안에서 줄을 바꿀 수 있게 둔다
    if (hd.src) hd.src.innerHTML = hd.src.innerHTML.split(' · ').map(t => t.replace(/<[^>]+>/g, '').length <= 44 ? `<span style="white-space:nowrap">${t}</span>` : t).join(' · ');
    return hd;
  }
  const svgLayer = parent => {
    const v = s('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, parent);
    css(v, { position: 'absolute', left: '0px', top: '0px', overflow: 'visible' });
    return v;
  };
  const prepPath = p => { const L = p.getTotalLength(); p._L = L; p.style.strokeDasharray = `${L} ${L + 4}`; p.style.strokeDashoffset = String(L); return p; };
  const drawPath = (p, k) => { p.style.strokeDashoffset = (p._L * (1 - clamp(k))).toFixed(2); p.style.opacity = k > 0.001 ? '1' : '0'; };
  const div = (parent, st, html) => { const d = h('div', 'a', parent, html); css(d, st); return d; };
  const txt = (parent, x, y, html, st = {}) => div(parent, Object.assign({ left: x + 'px', top: y + 'px', font: '600 30px/1.34 Pretendard', color: 'var(--ink)', whiteSpace: 'nowrap', letterSpacing: '-.015em' }, st), html);
  const MONO = { font: '600 30px/1.2 var(--mono)', letterSpacing: '0' };
  const exampleChip = (parent, x, y, o = {}) => div(parent, Object.assign({ left: x + 'px', top: y + 'px', font: '700 28px/1 Pretendard', color: 'var(--amber)', padding: '6px 14px 7px',
    border: '1.5px solid rgba(255,203,102,.7)', borderRadius: '8px', background: 'rgba(255,203,102,.10)', whiteSpace: 'nowrap' }, o), '설명용 예시');
  // 채점 표시(체크·엑스)
  const MARK = {
    ok: '<svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="15" fill="rgba(115,245,198,.16)" stroke="#73f5c6" stroke-width="2.2"/><path d="M10 17.5l4.8 4.8 9.4-10" fill="none" stroke="#73f5c6" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    no: '<svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="15" fill="rgba(255,122,138,.16)" stroke="#ff7a8a" stroke-width="2.2"/><path d="M11.5 11.5l11 11M22.5 11.5l-11 11" fill="none" stroke="#ff7a8a" stroke-width="3.2" stroke-linecap="round"/></svg>',
  };
  const popIn = (el, lt, t0, from = 0.4) => {
    const sp = spring(lt, t0, 2.6, 0.52), q = clamp((lt - t0) / 0.1);
    css(el, { opacity: q.toFixed(3), transform: `scale(${(from + (1 - from) * sp).toFixed(4)})` });
    return q;
  };

  // ───────── P38 섹션 6 간지 ─────────
  DECK.slide({
    id: 'p38', stops: [3.2], exit: 0.5, bg: V3.DIV_BG,
    setup(el) {
      const R = this.R = UI.root(el);
      this.D = V3.divider(R, { num: '06', title: '실행 기록으로 검증', sub: '설계가 맞았는지를 답만이 아니라 실행 기록으로도 확인한다', active: 3, done: [0, 1, 2] });
      this.ck3 = this.D.F.cells[2].querySelector('.v3-ck');   // ③ 칸 체크는 칸이 들어온 뒤 따로 찍힌다
      if (this.ck3) this.ck3.style.transformOrigin = '50% 50%';
    },
    render(lt, ctx) {
      V3.dividerIn(this.D, lt);
      if (this.ck3) popIn(this.ck3, lt, 1.95, 0.2);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P39 dbt 1/2 · 구도 라(도식 먼저) — 7개월 시간축 위에 실행이 쌓이고 PR이 CI를 통과한 뒤 제목이 나온다 ─────────
  DECK.slide({
    id: 'p39', stops: [2.0, 3.3, 4.7, 6.5], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = head(R, SRC.dbt1);
      this.story = V3.story(this.hd, { name: 'dbt', k: 1, n: 2 });
      this.q = UI.ask(R, '에이전트가 쓴 코드가 CI를 통과했다면 숫자도 맞나', { top: 110 });
      this.c = UI.context(R, 'dbt(데이터 변환 도구) Labs 직원 1명의 개인 트레이딩 데이터 플랫폼, 7개월 기록', { top: 148 });

      // 라벨 3개(시간축 위)
      const B = 'color:var(--cyan);font:800 36px/1 Pretendard;font-variant-numeric:tabular-nums;letter-spacing:-.02em';
      // 줄 간격 1.75(30px 기준 52px): 36px 숫자가 든 두 줄이 붙어 보이지 않게
      const LST = (c) => ({ paddingLeft: '18px', borderLeft: `3px solid ${c}`, lineHeight: '1.75' });
      this.L = [
        txt(R, 120, 194, `자산 <b style="${B}">239</b>개(dbt 변환 모델 <b style="${B}">174</b>개)<br>품질 검사 <b style="${B}">1,114</b>개`, LST('rgba(111,226,255,.7)')),
        txt(R, 790, 194, `파이프라인 실행 <b class="n1" style="${B}">0</b>회<br>병합 PR <b class="n2" style="${B}">0</b>개`, LST('rgba(170,160,255,.85)')),
        txt(R, 1270, 194, `dbt 사례: 에이전트 PR 첫 CI 통과<br><b style="${B};color:var(--mint)">약 90%</b>`, LST('rgba(115,245,198,.85)')),
      ];
      this.n1 = this.L[1].querySelector('.n1'); this.n2 = this.L[1].querySelector('.n2');

      // 시간축(2026-03-01 → 10-03)
      const AX0 = 330, AX1 = 1690, AY = 432;
      Object.assign(this, { AX0, AX1, AY });
      const V = svgLayer(R);
      this.axis = prepPath(s('path', { d: `M${AX0} ${AY} H${AX1}`, stroke: 'rgba(238,232,255,.85)', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, V));
      this.d0 = txt(R, 120, AY - 19, '2026-03-01', Object.assign({ color: 'var(--ink2)' }, MONO));
      this.d1 = txt(R, 1706, AY - 19, '10-03', Object.assign({ color: 'var(--ink2)' }, MONO));
      // 실행 눈금(실행이 쌓이는 모습, 높이는 장식용)
      this.ticks = [];
      const NT = 136;
      for (let i = 0; i < NT; i++) {
        const x = AX0 + 5 + i * ((AX1 - AX0 - 10) / (NT - 1));
        const hh = (14 + rand(i, 7) * 40 + rand(i, 11) * 12) * 0.85;   // 가장 긴 눈금 56px: 위 PR 네모와 닿지 않게
        const r = s('rect', { x: (x - 2).toFixed(1), y: AY - 4, width: 4, height: 0, rx: 1.5, fill: 'rgba(176,166,255,.72)' }, V);
        this.ticks.push({ r, hh });
      }
      // PR 네모(시간 위치에 놓이고, CI 선이 지나가면 통과·실패가 정해진다)
      this.prs = [];
      const NP = 40, FAIL = [6, 17, 29, 36];
      for (let i = 0; i < NP; i++) {
        const x = AX0 + 12 + (i + 0.5) * ((AX1 - AX0 - 24) / NP) + (rand(i, 3) - 0.5) * 12;
        const r = s('rect', { x: (x - 7).toFixed(1), y: 348, width: 14, height: 14, rx: 3, fill: 'none', stroke: 'rgba(222,214,255,.6)', 'stroke-width': 1.6 }, V);
        r.style.transformBox = 'fill-box'; r.style.transformOrigin = '50% 50%';
        this.prs.push({ r, x, fail: FAIL.includes(i) });
      }
      this.head = s('line', { x1: AX0, y1: 342, x2: AX0, y2: AY, stroke: '#73f5c6', 'stroke-width': 2.5 }, V);
      this.tag = div(R, { left: '0px', top: '304px', font: '700 30px/1 var(--mono)', color: '#0c0b3e', background: 'var(--mint)', borderRadius: '6px', padding: '4px 10px 3px', whiteSpace: 'nowrap' }, 'CI');

      // 결론 제목(움직임이 끝난 뒤)과 용어 설명
      this.T = UI.title(R, '에이전트가 코드 대부분을 쓴 개인 데이터 플랫폼에서/에이전트 PR 대부분이 *첫 CI를 통과*했다', { top: 466, size: 60 });
      this.term = UI.term(R, 'CI', '코드를 바꿀 때마다 자동으로 시험을 돌려 기준 미달이면 합치지 못하게 하는 절차', { top: 610, left: 120, width: 1680 });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      V3.storyIn(this.story, lt, 0.2);
      UI.lineIn(this.q, lt, 0.05);
      UI.lineIn(this.c, lt, 0.3);
      // ① 시간축과 라벨 1
      drawPath(this.axis, prog(lt, 0.6, 0.75, ease.swift));
      UI.rise(this.d0, lt, 0.6, { x: -24, y: 0 });
      UI.rise(this.d1, lt, 1.2, { x: 24, y: 0 });
      UI.rise(this.L[0], lt, 1.15, { y: 18 });
      // ② 실행 눈금이 왼쪽부터 쌓이고 라벨 2의 숫자가 따라 오른다
      UI.rise(this.L[1], lt, 2.0, { y: 18 });
      const sw = prog(lt, 2.05, 1.1, ease.inOutSine) * (this.ticks.length + 6);
      this.ticks.forEach((t, i) => {
        const k = ease.outCubic(clamp((sw - i) / 6));
        const hh = t.hh * k;
        t.r.setAttribute('height', hh.toFixed(1)); t.r.setAttribute('y', (this.AY - 4 - hh).toFixed(1));
      });
      const pc = prog(lt, 2.1, 1.15, ease.outQuart);
      this.n1.textContent = REEL.count(pc, 24388);
      this.n2.textContent = REEL.count(pc, 405);
      // ③ PR이 놓이고 CI 선이 시간축을 따라 지나가며 통과(민트)·실패(산호)를 정한다
      UI.rise(this.L[2], lt, 3.35, { y: 18 });
      const T0 = 3.6, TD = 0.95;
      const hp = clamp((lt - T0) / TD);
      const hx = lerp(this.AX0, this.AX1, hp);
      const hv = prog(lt, T0 - 0.15, 0.2);
      this.head.setAttribute('x1', hx.toFixed(1)); this.head.setAttribute('x2', hx.toFixed(1));
      this.head.setAttribute('opacity', hv.toFixed(3));
      css(this.tag, { left: (hx - 22).toFixed(1) + 'px', opacity: hv.toFixed(3) });
      const span = this.AX1 - this.AX0;
      this.prs.forEach(p => {
        const a = prog(lt, 3.35 + (p.x - this.AX0) / span * 0.3, 0.25);
        const tp = T0 + (p.x - this.AX0) / span * TD;
        const done = lt >= tp;
        const k = done ? spring(lt, tp, 2.8, 0.45) : 0;
        p.r.setAttribute('opacity', a.toFixed(3));
        p.r.setAttribute('fill', done ? (p.fail ? '#ff7a8a' : '#73f5c6') : 'none');
        p.r.setAttribute('stroke', done ? (p.fail ? '#ff7a8a' : '#73f5c6') : 'rgba(222,214,255,.6)');
        p.r.style.transform = done ? `scale(${(0.6 + 0.4 * k).toFixed(3)})` : 'none';
      });
      // ④ 움직임이 끝난 뒤 결론 제목과 용어 설명
      UI.titleIn(this.T, lt, 4.75, { each: 0.018 });
      UI.lineIn(this.term, lt, 5.7);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P40 dbt 2/2 · 구도 기 — 같은 눈금에서 1일과 65일 ─────────
  DECK.slide({
    id: 'p40', stops: [1.5, 2.6, 4.6, 5.6], exit: 0.5, bg: DECK.BGP.text,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = head(R, SRC.dbt1);
      this.story = V3.story(this.hd, { name: 'dbt', k: 2, n: 2 });
      this.T = UI.title(R, '오류가 나는 결함은 1일 만에 찾았고/틀린 숫자만 내는 결함은 *65일* 걸렸다', { top: 132, size: 64 });
      this.c = UI.context(R, '같은 기록의 결함 표본(크기 비공개). 발견까지 걸린 날의 중앙값', { top: 290 });
      this.term = UI.term(R, '중앙값', '값을 순서대로 늘어놓았을 때 한가운데 값', { top: 356, left: 1120, width: 680 });

      const D0 = 120, D65 = 1760, PX = (D65 - D0) / 65;
      Object.assign(this, { D0, D65, PX });
      const NB = 'font:800 40px/1 Pretendard;font-variant-numeric:tabular-nums;letter-spacing:-.02em';
      this.l1 = txt(R, 120, 350, `오류를 내는 결함: 중앙값 <b class="n" style="${NB};color:var(--coral)">1일</b>`, { font: '700 32px/1.3 Pretendard' });
      this.l1n = this.l1.querySelector('.n');
      this.l2 = txt(R, 120, 452, `오류 없이 틀린 결함: 중앙값 <b class="n" style="${NB};color:var(--coral)">0일</b>`, { font: '700 32px/1.3 Pretendard' });
      this.l2n = this.l2.querySelector('.n');

      const V = svgLayer(R);
      const row = (y, days) => {
        const o = { y };
        o.base = prepPath(s('path', { d: `M${D0} ${y} H${D65}`, stroke: 'rgba(222,214,255,.30)', 'stroke-width': 2, fill: 'none' }, V));
        o.ticks = [];
        for (let d = 0; d <= days; d++) {
          const tall = d % 7 === 0;
          o.ticks.push(s('line', { x1: D0 + d * PX, y1: y - (tall ? 13 : 8), x2: D0 + d * PX, y2: y + (tall ? 13 : 8), stroke: 'rgba(238,232,255,.55)', 'stroke-width': tall ? 2 : 1.4, opacity: 0 }, V));
        }
        o.trail = s('rect', { x: D0, y: y - 5, width: 0, height: 10, rx: 4, fill: 'rgba(255,203,102,.85)' }, V);
        o.mk = s('path', { d: 'M0 -16 L16 0 L0 16 L-16 0 Z', fill: '#ff7a8a', stroke: '#fff', 'stroke-width': 1.5, opacity: 0 }, V);
        o.hd = s('line', { x1: D0, y1: y - 22, x2: D0, y2: y + 22, stroke: 'rgba(255,203,102,.95)', 'stroke-width': 2.5, opacity: 0 }, V);
        return o;
      };
      this.r1 = row(424, 1);
      this.r2 = row(526, 65);

      this.aux = txt(R, 120, 554, '가장 큰 비용을 낸 결함(기준 비공개)은 CI와 코드 리뷰를 통과했다', { color: 'var(--ink2)', paddingLeft: '18px', borderLeft: '3px solid rgba(255,122,138,.8)' });
      this.m = UI.meaning(R, '→ CI와 코드 리뷰는 오류 없이 틀린 숫자를 걸러내지 못했고, 발견까지 중앙값 65일이 걸렸다', { top: 604 });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      V3.storyIn(this.story, lt, 0.2);
      UI.titleIn(this.T, lt, 0.1);
      UI.lineIn(this.c, lt, 0.8);
      UI.lineIn(this.term, lt, 1.0);
      const play = (o, t0, days, dur, lbl) => {
        drawPath(o.base, prog(lt, t0, 0.35, ease.outCubic));
        const hp = clamp((lt - t0 - 0.3) / dur);
        const dd = (days === 1 ? ease.outCubic(hp) : ease.inOutSine(hp)) * days;
        const hx = this.D0 + dd * this.PX;
        o.ticks.forEach((tk, d) => tk.setAttribute('opacity', (lt > t0 + 0.3 && d <= dd + 0.001 ? 1 : 0).toString()));
        o.trail.setAttribute('width', Math.max(0, hx - this.D0).toFixed(1));
        o.trail.setAttribute('opacity', lt > t0 + 0.3 ? '1' : '0');
        const run = lt > t0 + 0.3 && hp < 1;
        o.hd.setAttribute('x1', hx.toFixed(1)); o.hd.setAttribute('x2', hx.toFixed(1)); o.hd.setAttribute('opacity', run ? '1' : '0');
        const tm = t0 + 0.3 + dur;
        const sp = lt >= tm ? spring(lt, tm, 2.6, 0.45) : 0;
        o.mk.setAttribute('opacity', lt >= tm ? '1' : '0');
        o.mk.setAttribute('transform', `translate(${(this.D0 + days * this.PX).toFixed(1)} ${o.y}) scale(${(0.3 + 0.7 * sp).toFixed(3)})`);
        if (lbl) lbl.textContent = Math.round(dd) + '일';
        return tm;
      };
      // ② 위 줄: 하루 눈금에서 곧바로 표시가 뜬다
      UI.lineIn(this.l1, lt, 1.55);
      const t1 = play(this.r1, 1.6, 1, 0.3, null);
      css(this.l1n, { opacity: lt >= t1 ? '1' : '0' });
      // ③ 아래 줄: 날짜 눈금이 65까지 흐른 뒤에야 표시가 뜬다
      UI.lineIn(this.l2, lt, 2.62);
      play(this.r2, 2.65, 65, 1.5, this.l2n);
      // ④ 아래 한 줄과 의미 줄
      UI.lineIn(this.aux, lt, 4.65);
      UI.lineIn(this.m, lt, 5.0);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P41 Thumbtack · 구도 가(왼쪽 글 칸) — 같은 질문 세 번, 기록 줄에서 고른 테이블이 갈라진다 ─────────
  DECK.slide({
    id: 'p41', stops: [1.8, 3.1, 4.6, 5.8], exit: 0.5, bg: DECK.BGP.flat,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = head(R, SRC.tt);
      // 왼쪽 글 칸(x 120~800)
      this.q = UI.ask(R, '답만 채점하면 무엇이 안 보이나', { top: 110 });
      this.T = UI.title(R, '설정 B(더 강한 모델 설정)는/답을 거부하지 않았지만/50문항 중 *41문항*에서 실행마다/고른 테이블이 달랐다', { top: 150, size: 56, width: 700 });
      const tb = Math.round(150 + 4 * 56 * 1.14 + 24);
      this.c = UI.context(R, 'Thumbtack(미국 생활 서비스 중개) 사내 분석 에이전트, 질문 50개 × 설정 A·B × 3회', { top: tb, width: 680 });
      this.m = UI.meaning(R, '→ 답만 채점하면 안 보이던 것이 기록에 보였다', { top: 566, width: 680, size: 30 });

      // 오른쪽 도식 칸(x 860~1800): 위 기록 줄 3개, 아래 수치 3줄
      const OX = 860;
      this.chip = exampleChip(R, OX, 140);
      const RY = [200, 284, 368], NAMES = ['테이블 A', '테이블 B', '테이블 C'];
      const PILL = [[OX + 130, 62], [OX + 630, 80], [OX + 724, 56]], ANS = [OX + 794, 120];
      this.CX0 = OX + 120; this.CX1 = OX + 935;
      this.rows = RY.map((y, i) => {
        const o = { y };
        o.lab = txt(R, OX, y + 9, `실행 ${i + 1}`, Object.assign({ color: 'var(--ink2)' }, MONO));
        o.pills = PILL.map(([x, w]) => div(R, { left: x + 'px', top: (y + 16) + 'px', width: w + 'px', height: '22px', borderRadius: '11px', background: 'rgba(200,190,255,.38)' }));
        o.cell = div(R, { left: (OX + 210) + 'px', top: y + 'px', width: '360px', height: '54px', boxSizing: 'border-box', borderRadius: '10px', border: '2px solid rgba(190,170,255,.45)',
          background: 'rgba(22,18,96,.55)', display: 'flex', alignItems: 'center', gap: '18px', padding: '0 18px', whiteSpace: 'nowrap' },
          `<span style="font:600 30px/1 Pretendard;color:var(--ink2)">고른 테이블</span><span class="v" style="font:700 30px/1 var(--mono);color:var(--ink)">${NAMES[i]}</span>`);
        o.v = o.cell.querySelector('.v');
        o.cellX = OX + 210;
        o.ans = div(R, { left: ANS[0] + 'px', top: (y + 14) + 'px', width: ANS[1] + 'px', height: '26px', borderRadius: '13px', background: 'rgba(115,245,198,.75)' });
        o.cur = div(R, { left: '0px', top: (y - 4) + 'px', width: '3px', height: '62px', background: 'var(--cyan)', borderRadius: '2px' });
        return o;
      });
      const badge = (x, y, ch, col) => div(R, { left: (x - 17) + 'px', top: (y - 17) + 'px', width: '34px', height: '34px', borderRadius: '50%', boxSizing: 'border-box',
        border: `2px solid ${col}`, background: '#1a1660', color: col, font: '800 26px/30px Pretendard', textAlign: 'center' }, ch);
      // ≠ 표시는 고른 테이블 칸 오른쪽 12px 바깥(두 줄 사이), = 표시는 답 칸 사이 가운데(위아래 답 칸과 12px)
      this.neq = [0, 1].map(i => badge(OX + 210 + 360 + 12 + 17, RY[i] + 69, '≠', 'var(--coral)'));
      this.eq = [0, 1].map(i => badge(ANS[0] + ANS[1] / 2, RY[i] + 69, '=', 'var(--mint)'));

      this.sep = div(R, { left: OX + 'px', top: '444px', width: '940px', height: '2px', background: 'rgba(190,170,255,.35)', transformOrigin: '0 50%' });
      const N = (v, c) => `<span style="font:800 40px/1 Pretendard;font-variant-numeric:tabular-nums;letter-spacing:-.02em;color:${c}">${v}</span>`;
      const AB = (t) => `<span style="font:700 30px/1 Pretendard;color:var(--ink2);margin:0 14px 0 0">${t}</span>`;
      const ARR = '<span style="font:700 30px/1 Pretendard;color:var(--dim);margin:0 14px">→</span>';
      const row2 = (l, v) => `<span style="font:600 30px/1 Pretendard;color:var(--ink)">${l}</span><span style="display:flex;align-items:baseline">${v}</span>`;
      const NY = [462, 520, 578];
      this.nums = [
        div(R, { left: OX + 'px', top: NY[0] + 'px', width: '940px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', whiteSpace: 'nowrap' },
          row2('답 거부 실행:', AB('A') + N('73%', 'var(--ink2)') + ARR + AB('B') + N('0%', 'var(--mint)'))),
        div(R, { left: OX + 'px', top: NY[1] + 'px', width: '940px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', whiteSpace: 'nowrap' },
          row2('실제 데이터로 답한 실행:', AB('A') + N('21%', 'var(--ink2)') + ARR + AB('B') + N('73%', 'var(--mint)'))),
        txt(R, OX, NY[2] + 4, 'B 실행 150개 중 <b style="font:800 34px/1 Pretendard;color:var(--amber)">24개(16%)</b> 도구 호출 한도 소진'),
      ];
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      UI.lineIn(this.q, lt, 0.05);
      UI.titleIn(this.T, lt, 0.2, { each: 0.022, lineGap: 0.12 });
      UI.lineIn(this.c, lt, 1.0);
      UI.lineIn(this.chip, lt, 1.2);
      // ②③ 기록 줄이 한 줄씩 재생된다(왼쪽에서 오른쪽으로 단계가 켜진다)
      const T0 = [1.85, 3.15, 3.5];
      const X0 = this.CX0, XW = this.CX1 - this.CX0;
      this.rows.forEach((o, i) => {
        const t0 = T0[i], dur = 0.85;
        UI.rise(o.lab, lt, t0, { x: -16, y: 0, blur: 0, dur: 0.35 });
        const cp = clamp((lt - t0 - 0.1) / dur);
        css(o.cur, { left: (X0 + cp * XW).toFixed(1) + 'px', opacity: (lt > t0 + 0.1 && cp < 1 ? 1 : 0).toFixed(2) });
        const on = (x) => prog(lt, t0 + 0.1 + clamp((x - X0) / XW) * dur, 0.2);
        o.pills.forEach(p => { const k = on(parseFloat(p.style.left)); css(p, { opacity: k.toFixed(3), transform: `scaleX(${(0.4 + 0.6 * k).toFixed(3)})`, transformOrigin: '0 50%' }); });
        const kc = on(o.cellX);
        css(o.cell, { opacity: kc.toFixed(3), transform: `translateX(${((1 - kc) * -12).toFixed(1)}px)` });
        css(o.v, { opacity: prog(lt, t0 + 0.1 + 0.4 * dur, 0.2).toFixed(3) });
        const ka = on(parseFloat(o.ans.style.left));
        css(o.ans, { opacity: ka.toFixed(3), transform: `scaleX(${(0.4 + 0.6 * ka).toFixed(3)})`, transformOrigin: '0 50%' });
      });
      // ③ 끝: 고른 테이블 칸이 서로 다르다는 표시, 답 칸은 같아 보인다는 표시
      const mk = prog(lt, 4.2, 0.3);
      this.rows.forEach(o => {
        css(o.cell, { borderColor: mk > 0.01 ? `rgba(255,122,138,${(0.45 + 0.5 * mk).toFixed(2)})` : 'rgba(190,170,255,.45)' });
        o.v.style.color = mk > 0.5 ? 'var(--coral)' : 'var(--ink)';
      });
      this.neq.forEach((b, i) => popIn(b, lt, 4.2 + i * 0.08));
      this.eq.forEach((b, i) => popIn(b, lt, 4.32 + i * 0.08));
      // ④ 아래 수치와 의미 줄
      css(this.sep, { transform: `scaleX(${prog(lt, 4.6, 0.4, ease.swift).toFixed(3)})` });
      this.nums.forEach((n, i) => UI.rise(n, lt, 4.7 + i * 0.16, { x: 24, y: 0 }));
      UI.lineIn(this.m, lt, 5.25);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P42 Snowflake · 구도 나(큰 숫자 중앙) — 질문이 적히고, 질문 순서대로 채점된다 ─────────
  DECK.slide({
    id: 'p42', stops: [1.6, 3.1, 4.5, 5.4], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = head(R, SRC.sf);
      this.q = UI.ask(R, '그러면 무엇부터 준비하나', { top: 104 });
      this.T = UI.title(R, 'Snowflake 담당자는 영업 에이전트를 써 보기 전에/*평가 질문 150개*를 적고 첫 실행 정확도 50%를 확인했다', { top: 140, size: 56 });
      this.c = UI.context(R, 'Snowflake Sait Izmit, 사용자 6,000명 사내 영업 에이전트. 채점 기준 비공개', { top: 278 });

      // 가운데 줄: [영업 질문] 150개 [격자] 50% [첫 실행 정확도]
      const row = div(R, { left: '120px', top: '316px', width: '1680px', height: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', whiteSpace: 'nowrap' });
      const LB = 'font:700 34px/1.4 Pretendard;color:var(--ink2);text-align:right';
      const NB = (c) => `font:900 240px/1 Pretendard;font-variant-numeric:tabular-nums;letter-spacing:-.05em;color:${c}`;
      this.la = h('div', '', row, `<div style="${LB}">영업<br>질문</div>`);
      this.na = h('div', '', row, `<span class="n" style="${NB('var(--cyan)')};display:inline-block;width:1.92em;text-align:right">0</span><span style="font:800 64px/1 Pretendard;color:var(--cyan);margin-left:16px">개</span>`);
      this.nan = this.na.querySelector('.n');
      const CW = 16, GAP = 4, COLS = 15, ROWS = 10;
      this.grid = h('div', '', row);
      css(this.grid, { position: 'relative', width: (COLS * (CW + GAP) - GAP) + 'px', height: (ROWS * (CW + GAP) - GAP) + 'px', flex: 'none' });
      this.cells = [];
      for (let i = 0; i < COLS * ROWS; i++) {
        const c = i % COLS, r = Math.floor(i / COLS);
        const d = h('div', '', this.grid);
        css(d, { position: 'absolute', left: (c * (CW + GAP)) + 'px', top: (r * (CW + GAP)) + 'px', width: CW + 'px', height: CW + 'px', boxSizing: 'border-box', borderRadius: '3px', border: '1.5px solid rgba(200,190,255,.32)' });
        this.cells.push(d);
      }
      // 맞힌 75칸(절반)을 정해 둔다(설명용 배치)
      const order = this.cells.map((_, i) => i).sort((a, b) => rand(a, 42) - rand(b, 42));
      this.ok = new Set(order.slice(0, 75));
      this.nb = h('div', '', row, `<span style="${NB('var(--mint)')}">50%</span>`);
      this.lb = h('div', '', row, `<div style="${LB};text-align:left">첫 실행<br>정확도</div>`);

      this.aux = div(R, { left: '120px', top: '552px', width: '1680px', textAlign: 'center', font: '600 30px/1.34 Pretendard', color: 'var(--ink2)', whiteSpace: 'nowrap' }, '그 뒤 원칙: 질문 100종을 70%로 맞히기보다 50종을 95%로 맞힌다');
      this.m = UI.meaning(R, '→ 질문을 먼저 적었기에 50%가 보였다', { top: 598, size: 30 });
      css(this.m, { left: '0px', width: '1920px', maxWidth: '1920px', justifyContent: 'center' });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      UI.lineIn(this.q, lt, 0.05);
      UI.titleIn(this.T, lt, 0.2, { each: 0.02 });
      UI.lineIn(this.c, lt, 1.0);
      // ② 빈 격자가 깔리고 질문이 순서대로 적히며 150까지 센다
      const g = prog(lt, 1.6, 0.3);
      const FILL0 = 1.75, EACH = 0.0085;
      // ③ 질문 순서대로 채점되며 맞힌 칸은 민트, 틀린 칸은 산호
      const G0 = 3.15, GE = 0.0068;
      this.cells.forEach((c, i) => {
        const f = prog(lt, FILL0 + i * EACH, 0.12);
        const gk = prog(lt, G0 + i * GE, 0.15);
        let bg = 'transparent', bd = `rgba(200,190,255,${(0.32 * g).toFixed(3)})`;
        if (f > 0) { bg = `rgba(238,232,255,${(0.5 * f).toFixed(3)})`; bd = `rgba(238,232,255,${(0.32 + 0.4 * f).toFixed(3)})`; }
        if (gk > 0) {
          bg = this.ok.has(i) ? `rgba(115,245,198,${lerp(0.5, 0.95, gk).toFixed(3)})` : `rgba(255,122,138,${lerp(0.5, 0.45, gk).toFixed(3)})`;
          bd = this.ok.has(i) ? 'rgba(115,245,198,.95)' : 'rgba(255,122,138,.7)';
        }
        css(c, { background: bg, borderColor: bd });
      });
      css(this.grid, { opacity: g.toFixed(3) });
      UI.rise(this.la, lt, 1.65, { x: -20, y: 0 });
      UI.rise(this.na, lt, 1.7, { y: 20 });
      this.nan.textContent = String(Math.round(150 * prog(lt, FILL0, 150 * EACH + 0.1, ease.linear)));
      const sp = lt >= 4.25 ? spring(lt, 4.25, 2.4, 0.5) : 0;
      css(this.nb, { opacity: (lt >= 4.25 ? clamp((lt - 4.25) / 0.1) : 0).toFixed(3), transform: `scale(${(0.6 + 0.4 * sp).toFixed(3)})` });
      UI.rise(this.lb, lt, 4.35, { x: 20, y: 0 });
      // ④ 보조와 의미 줄
      UI.lineIn(this.aux, lt, 4.55);
      UI.lineIn(this.m, lt, 4.85);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P43 dbt 실험 · 구도 가R(오른쪽 글 칸) — 같은 조건 세 번, 세로 막대 3개와 점수의 폭 ─────────
  DECK.slide({
    id: 'p43', stops: [1.8, 3.1, 4.8, 5.8], exit: 0.5, bg: Object.assign({}, DECK.BGP.split, { parts: 3 }),
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = head(R, SRC.dbt2);
      // 오른쪽 글 칸(x 1120~1800)
      const TX = 1120;
      this.q = UI.ask(R, '한 번 측정하면 믿어도 되나', { top: 132, left: TX });
      this.T = UI.title(R, '같은 조건을 세 번/돌리자 점수가/*61%, 100%, 67%*로 달랐다', { top: 172, left: TX, size: 56, width: 680 });
      this.c = UI.context(R, 'dbt 블로그 글쓴이(Alex Noonan)의 소규모 실험. Sonnet 5.5 + 스킬, 작업 12건을 3회', { top: Math.round(172 + 3 * 56 * 1.14 + 24), left: TX, width: 680 });
      this.aux = txt(R, TX, 486, '저자: 실행 간 차이가 스킬 효과보다 크다', { color: 'var(--amber)' });
      this.m = UI.meaning(R, '→ 한 번 돌린 결과로는 설계 변경의 효과를 말할 수 없다', { top: 556, left: TX, width: 680, size: 30 });

      // 왼쪽 도식 칸(x 120~1060): 세로 막대 3개
      this.axl = txt(R, 120, 118, '작업 12건의 결과 행을 정답과 비교해 맞은 비율', { color: 'var(--ink2)' });
      const BASE = 596, TOP = 240, H = BASE - TOP, SC = [61, 100, 67], CX = [330, 600, 870], BW = 150;
      Object.assign(this, { BASE, TOP, H, SC });
      // 점수 폭(61%~100%) 띠
      const y61 = BASE - 0.61 * H;
      this.band = div(R, { left: '120px', top: TOP + 'px', width: '940px', height: (y61 - TOP) + 'px', background: 'rgba(255,203,102,.10)', boxSizing: 'border-box',
        borderTop: '2px dashed rgba(255,203,102,.85)', borderBottom: '2px dashed rgba(255,203,102,.85)', transformOrigin: '0 50%' });
      const V = svgLayer(R);
      this.brk = prepPath(s('path', { d: `M1046 ${TOP} H1062 V${y61} H1046`, stroke: '#ffcb66', 'stroke-width': 3, fill: 'none' }, V));
      this.base = prepPath(s('path', { d: `M120 ${BASE} H1060`, stroke: 'rgba(238,232,255,.85)', 'stroke-width': 3, fill: 'none' }, V));
      const ch = (H - 11 * 4) / 12;
      this.bars = CX.map((cx, i) => {
        const o = {};
        o.track = div(R, { left: (cx - BW / 2) + 'px', top: TOP + 'px', width: BW + 'px', height: H + 'px', boxSizing: 'border-box', borderRadius: '6px', border: '1.5px solid rgba(190,170,255,.28)' });
        o.bar = div(R, { left: (cx - BW / 2 + 30) + 'px', top: TOP + 'px', width: (BW - 30) + 'px', height: H + 'px', borderRadius: '4px', transformOrigin: '50% 100%',
          background: 'linear-gradient(0deg, rgba(111,226,255,.55), #6fe2ff)', clipPath: `inset(${(100 - SC[i])}% 0 0 0)` });
        // 작업 12건(기록 칸): 막대 왼쪽 세로 줄, 아래에서 위로 재생된다
        o.tasks = Array.from({ length: 12 }, (_, k) => div(R, { left: (cx - BW / 2 + 6) + 'px', top: (BASE - (k + 1) * (ch + 4) + 4) + 'px', width: '18px', height: ch + 'px', borderRadius: '3px', background: 'rgba(222,214,255,.6)' }));
        // 점수는 세 막대 모두 점선 범위 띠 위쪽 한 줄에 둔다(띠·막대 끝과 겹치지 않게)
        o.sc = div(R, { left: (cx - 120) + 'px', width: '240px', textAlign: 'center', top: (TOP - 68) + 'px', font: '900 52px/1 Pretendard', color: SC[i] === 100 ? 'var(--mint)' : 'var(--cyan)',
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-.03em', whiteSpace: 'nowrap', transformOrigin: '50% 100%' }, `${SC[i]}%`);
        o.lab = div(R, { left: (cx - 120) + 'px', width: '240px', textAlign: 'center', top: (BASE + 8) + 'px', color: 'var(--ink)', whiteSpace: 'nowrap', font: MONO.font }, `실행 ${i + 1}`);
        return o;
      });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      UI.lineIn(this.q, lt, 0.05);
      UI.titleIn(this.T, lt, 0.2, { each: 0.024, lineGap: 0.12 });
      UI.lineIn(this.c, lt, 1.0);
      UI.lineIn(this.axl, lt, 0.4);
      drawPath(this.base, prog(lt, 0.5, 0.5, ease.swift));
      // ②③ 실행 1, 실행 2·3이 차례로 재생된다: 작업 12칸이 아래에서 위로 켜지고, 막대가 점수까지 자라고, 위에 점수가 찍힌다
      const T0 = [1.85, 3.15, 3.55];
      this.bars.forEach((o, i) => {
        const t0 = T0[i], dur = 0.8;
        css(o.track, { opacity: prog(lt, t0 - 0.1, 0.3).toFixed(3) });
        UI.rise(o.lab, lt, t0 - 0.1, { y: 10, blur: 0, dur: 0.35 });
        o.tasks.forEach((tk, k) => {
          const on = prog(lt, t0 + (k + 0.5) / 12 * dur, 0.15);
          css(tk, { opacity: (on * 0.95).toFixed(3) });
        });
        const gb = prog(lt, t0 + 0.3, dur * 0.85, ease.outCubic);
        css(o.bar, { transform: `scaleY(${gb.toFixed(4)})`, opacity: gb > 0.001 ? '1' : '0' });
        const ts = t0 + 0.1 + dur;
        const sp = lt >= ts ? spring(lt, ts, 2.6, 0.5) : 0;
        css(o.sc, { opacity: (lt >= ts ? clamp((lt - ts) / 0.1) : 0).toFixed(3), transform: `scale(${(0.5 + 0.5 * sp).toFixed(3)})` });
      });
      // ③ 끝: 세 점수 사이의 폭(61%~100%)이 표시된다
      const bp = prog(lt, 4.4, 0.4, ease.swift);
      css(this.band, { opacity: bp.toFixed(3), transform: `scaleX(${bp.toFixed(3)})` });
      drawPath(this.brk, prog(lt, 4.45, 0.35, ease.outCubic));
      // ④ 보조와 의미 줄
      UI.lineIn(this.aux, lt, 4.85);
      UI.lineIn(this.m, lt, 5.2);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P44 TelemetrySuffBench · 구도 라(도식 먼저) — 전체 폭 막대 두 개, 그 뒤 결론 제목 ─────────
  DECK.slide({
    id: 'p44', stops: [1.2, 2.4, 3.4, 5.4], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = head(R, SRC.tel);
      this.q = UI.ask(R, '기록에 무엇을 담아야 하나', { top: 104 });
      this.c = UI.context(R, '중국 화둥사범대학, 오류를 넣은 가상 기록을 모델 5종에 주고 실패 단계 맞히기', { top: 146 });
      this.axl = txt(R, 120, 200, '실패 시작 단계를 첫 답으로 맞힌 비율', { color: 'var(--ink2)' });
      this.term = UI.term(R, 'OpenTelemetry', '서비스 실행 기록을 남기는 업계 공통 규격. 생성형 AI용 항목은 개발 중', { top: 198, left: 1000, width: 800 });

      const X0 = 120, W = 1680;
      Object.assign(this, { X0, W });
      const NB = (c) => `font:900 44px/1 Pretendard;font-variant-numeric:tabular-nums;letter-spacing:-.03em;color:${c};margin:0 18px 0 18px`;
      this.l1 = div(R, { left: '120px', top: '254px', display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap', font: '700 30px/1.2 Pretendard', color: 'var(--ink)' },
        `전체 기록(결정 내용 포함)<span style="${NB('var(--cyan)')}">33.8~97.2%</span><span style="font:500 30px/1.2 Pretendard;color:var(--ink2)">(모델별)</span>`);
      this.l2 = div(R, { left: '120px', top: '356px', display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap', font: '700 30px/1.2 Pretendard', color: 'var(--ink)' },
        `표준 항목만<span style="${NB('var(--coral)')}">0.5% 이하</span>`);
      this.aux = div(R, { right: '120px', top: '358px', display: 'flex', alignItems: 'center', gap: '12px', font: '600 30px/1.34 Pretendard', color: 'var(--ink)', whiteSpace: 'nowrap' },
        `${MARK.ok}${MARK.ok}<span>실패 유무는 둘 다 거의 다 맞힘</span>`);
      const V = svgLayer(R);
      const defs = s('defs', {}, V);
      const pat = s('pattern', { id: 'p44h', width: 12, height: 12, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      s('rect', { width: 6, height: 12, fill: 'rgba(111,226,255,.55)' }, pat);
      // 100% 자리(빈 칸)
      this.tr = [[306, 40], [406, 36]].map(([y, hh]) => s('rect', { x: X0, y, width: W, height: hh, rx: 6, fill: 'rgba(190,170,255,.06)', stroke: 'rgba(222,214,255,.28)', 'stroke-width': 1.5, 'stroke-dasharray': '6 6', opacity: 0 }, V));
      // 막대 1: 33.8%까지 채움, 97.2%까지 범위(빗금)
      this.b1 = s('rect', { x: X0, y: 306, width: 0, height: 40, rx: 4, fill: '#6fe2ff' }, V);
      this.b1r = s('rect', { x: X0 + 0.338 * W, y: 306, width: 0, height: 40, fill: 'url(#p44h)', stroke: '#6fe2ff', 'stroke-width': 2 }, V);
      this.b1t = [0.338, 0.972].map(v => s('line', { x1: X0 + v * W, x2: X0 + v * W, y1: 302, y2: 350, stroke: '#fff', 'stroke-width': 2.5, opacity: 0 }, V));
      // 막대 2: 0.5% 이하 — 출발선에 붙은 채 멈춘다
      this.b2 = s('rect', { x: X0, y: 406, width: 0, height: 36, rx: 3, fill: '#ff7a8a' }, V);
      // 출발선은 막대 두 개 높이에만 긋는다(사이에 놓인 '표준 항목만' 글자와 위 '전체 기록' 글자를 지나지 않게)
      this.start = s('path', { d: `M${X0} 304 V350 M${X0} 406 V446`, stroke: 'rgba(238,232,255,.9)', 'stroke-width': 3, fill: 'none' }, V);

      this.T = UI.title(R, 'OpenTelemetry 표준 항목만 남긴 실행 기록으로는/실패가 시작된 단계를 *거의 찾지 못했다*', { top: 466, size: 60 });
      this.m = UI.meaning(R, '→ 에이전트가 무엇을 읽고 결정했는지 남겨야 원인 단계를 찾는다', { top: 610, size: 30 });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      UI.lineIn(this.q, lt, 0.05);
      UI.lineIn(this.c, lt, 0.25);
      UI.lineIn(this.axl, lt, 0.5);
      UI.lineIn(this.term, lt, 0.7);
      css(this.start, { opacity: prog(lt, 0.8, 0.3).toFixed(3) });
      this.tr.forEach((r, i) => r.setAttribute('opacity', prog(lt, 0.9 + i * 0.1, 0.3).toFixed(3)));
      // ② 첫 막대: 33.8%까지 차오르고 97.2%까지 범위가 펼쳐진다
      UI.rise(this.l1, lt, 1.25, { x: -20, y: 0 });
      const a = prog(lt, 1.35, 0.5, ease.swift) * 0.338;
      this.b1.setAttribute('width', (a * this.W).toFixed(1));
      const r = prog(lt, 1.85, 0.5, ease.outCubic) * (0.972 - 0.338);
      this.b1r.setAttribute('width', (r * this.W).toFixed(1));
      this.b1r.setAttribute('opacity', r > 0.001 ? '1' : '0');
      this.b1t[0].setAttribute('opacity', prog(lt, 1.8, 0.15).toFixed(3));
      this.b1t[1].setAttribute('opacity', prog(lt, 2.3, 0.15).toFixed(3));
      // ③ 둘째 막대: 나아가려다 출발선에 붙은 채 멈춘다
      UI.rise(this.l2, lt, 2.45, { x: -20, y: 0 });
      const tr = lt < 2.55 ? 0 : Math.max(0, Math.sin(clamp((lt - 2.55) / 0.45) * Math.PI)) * 26 * (1 - clamp((lt - 2.55) / 0.6)) + 8 * prog(lt, 2.55, 0.2);
      this.b2.setAttribute('width', tr.toFixed(1));
      UI.rise(this.aux, lt, 3.0, { x: 20, y: 0 });
      // ④ 결론 제목과 의미 줄
      UI.titleIn(this.T, lt, 3.45, { each: 0.02 });
      UI.lineIn(this.m, lt, 4.9);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P45 규칙 7 · 규칙-좌 — 질문 카드가 놓이고, 질문마다 답 줄과 기록 줄이 함께 채점된다 ─────────
  DECK.slide({
    id: 'p45', stops: [1.6, 2.8, 4.4, 5.4], exit: 0.5, bg: DECK.BGP.text,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = head(R, SRC.r7);
      this.RH = V3.ruleHead(R, { n: 7, text: '사용하기 전에/평가 질문을 적고,/답과 함께/*실행 기록*을 채점한다' });
      this.ev = div(R, { left: '120px', top: (this.RH.bottom + 22) + 'px', width: '800px', boxSizing: 'border-box', padding: '10px 18px 12px', borderRadius: '12px',
        border: '1.5px solid rgba(190,170,255,.45)', background: 'rgba(22,18,96,.45)', font: '500 30px/1.4 Pretendard', color: 'var(--ink2)', letterSpacing: '-.015em' },
        '근거: Snowflake 150개·50% · Thumbtack: 50문항 중 41문항에서 실행마다 고른 테이블이 다름');

      // 오른쪽 칸(x 980~1800)
      const QX = [1368, 1464, 1560, 1656, 1752];
      this.QX = QX;
      this.cards = QX.map((x, i) => {
        const c = div(R, { left: (x - 42) + 'px', top: '146px', width: '84px', height: '74px', borderRadius: '10px', boxSizing: 'border-box', border: '1.5px solid rgba(190,170,255,.5)', background: 'rgba(22,18,96,.6)' },
          `<i style="position:absolute;left:10px;top:12px;width:10px;height:10px;border-radius:50%;background:var(--cyan)"></i>` +
          [0, 1, 2].map(k => `<i style="position:absolute;left:${k ? 10 : 26}px;top:${12 + k * 18}px;width:${k ? 44 + rand(i * 3 + k, 9) * 20 : 40}px;height:8px;border-radius:4px;background:rgba(238,232,255,.6)"></i>`).join(''));
        return c;
      });
      this.chip = exampleChip(R, 980, 168);
      this.fA = div(R, { left: '966px', top: '244px', width: '840px', height: '58px', borderRadius: '12px', boxSizing: 'border-box', border: '2px solid rgba(115,245,198,.6)', background: 'rgba(115,245,198,.06)' });
      this.fB = div(R, { left: '966px', top: '314px', width: '840px', height: '176px', borderRadius: '12px', boxSizing: 'border-box', border: '2px solid rgba(111,226,255,.6)', background: 'rgba(111,226,255,.05)' });
      this.hA = txt(R, 984, 253, '답: 정답 여부');
      this.hB = txt(R, 984, 324, '기록:');
      const BY = [324, 380, 436];
      this.subs = ['고른 테이블', '호출 횟수', '한도 초과'].map((t, j) => txt(R, 1068, BY[j], t, { color: 'var(--ink2)' }));
      // 채점 표시(설명용 배치): 질문 5개 × (답 1줄 + 기록 3줄)
      const PAT = [[1, 1, 1, 1], [1, 1, 1, 0], [0, 0, 1, 1], [1, 0, 1, 1], [1, 1, 1, 1]];
      const MY = [256].concat(BY.map(y => y + 3));
      this.marks = QX.map((x, i) => MY.map((y, j) => div(R, { left: (x - 17) + 'px', top: y + 'px', width: '34px', height: '34px', transformOrigin: '50% 50%' }, PAT[i][j] ? MARK.ok : MARK.no)));
      this.impl = div(R, { left: '980px', top: '510px', width: '820px', font: '500 30px/1.4 Pretendard', color: 'var(--ink)', letterSpacing: '-.015em' },
        `<b style="color:var(--cyan);font-weight:700">하네스 구현:</b> 단계마다 결과를 파일로 남기고, 사실 확인은 검증 에이전트 여럿이 원 출처를 따로 읽어 과반이 '확인됨'으로 판정한 것만 통과`);
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      V3.ruleHeadIn(this.RH, lt, 0.1);
      UI.lineIn(this.ev, lt, 1.2);
      // ② 평가 질문 카드가 왼쪽부터 놓인다
      this.cards.forEach((c, i) => UI.rise(c, lt, 1.6 + i * 0.14, { y: -22, blur: 0, dur: 0.4 }));
      // ③ 답 줄과 기록 줄이 함께 생기고, 질문마다 두 줄이 위에서 아래로 채점된다
      const fa = prog(lt, 2.8, 0.4, ease.swift), fb = prog(lt, 2.92, 0.4, ease.swift);
      css(this.fA, { opacity: fa.toFixed(3), clipPath: `inset(0 ${((1 - fa) * 100).toFixed(1)}% 0 0)` });
      css(this.fB, { opacity: fb.toFixed(3), clipPath: `inset(0 ${((1 - fb) * 100).toFixed(1)}% 0 0)` });
      UI.rise(this.hA, lt, 2.85, { x: -14, y: 0, blur: 0 });
      UI.rise(this.hB, lt, 2.95, { x: -14, y: 0, blur: 0 });
      this.subs.forEach((e, j) => UI.rise(e, lt, 3.0 + j * 0.06, { x: -14, y: 0, blur: 0 }));
      UI.lineIn(this.chip, lt, 3.1, { y: 0 });
      this.marks.forEach((col, i) => col.forEach((m, j) => popIn(m, lt, 3.2 + i * 0.2 + j * 0.05)));
      // ④ 하네스 구현 줄
      UI.rise(this.impl, lt, 4.45, { y: 16 });
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P46 규칙 8 · 규칙-폭 — 기록 표의 같은 실패가 세 번 쌓여 하네스 개선 기능으로 넘어간다 ─────────
  DECK.slide({
    id: 'p46', stops: [1.6, 2.4, 3.4, 5.8], exit: 0.5, bg: DECK.BGP.flat,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = head(R, SRC.r8);
      this.RH = V3.ruleHead(R, { n: 8, text: '읽은 문서·테이블·쿼리·버전을 남기고/같은 결과가 여러 번 실행에서 반복될 때 *설계를 바꾼다*', w: 1680, size: 56 });
      this.c = UI.context(R, '근거: 표준 항목만 남긴 기록은 실패 단계 정답 0.5% 이하 · 같은 조건 세 번 61·100·67%', { top: this.RH.bottom + 6 });
      this.chip = exampleChip(R, 0, this.RH.bottom + 8, { left: 'auto', right: '120px' });

      const COLS = [{ w: 190, mono: true }, { w: 150 }, { w: 200, mono: true }, { w: 200 }, { w: 320, mono: true }, { w: 170 }, { w: 160, mono: true }, { w: 290 }];
      const TY = 392;
      this.TB = UI.table(R, { x: 120, y: TY, size: 30, rowH: 56, cols: COLS,
        head: ['날짜', '과제', '스킬 버전', '읽은 문서', '조회한 테이블', '성공', '토큰', '오류'],
        rows: [['11-03', '매출', 'v2', '정의 A', 'sales_daily', '예', '18k', '없음'], ['11-04', '매출', 'v3', '정의 A', 'sales_raw', '아니요', '51k', '상한 초과']] });
      this.TB.head.style.borderBottom = '2px solid rgba(111,226,255,.6)';
      this.heads = [...this.TB.head.children];
      this.heads.forEach(c => { c.style.fontSize = '28px'; c.style.fontFamily = 'Pretendard'; });
      this.mark = UI.rowMark(this.TB, 1, '#ff7a8a');
      this.bad = this.TB.rows[1].children[7];
      const BX = 120 + 1680 - 290, BY = TY + 56 * 2;
      this.box = div(R, { left: (BX + 4) + 'px', top: (BY + 2) + 'px', width: '282px', height: '52px', borderRadius: '10px', border: '3px solid var(--coral)', boxSizing: 'border-box' });
      // 화살표: 「상한 초과」 칸 → 아래 줄
      const AX = BX + 145, AY0 = BY + 58, AY1 = 618, AXE = 966;
      Object.assign(this, { AX, AY0, AY1, AXE });
      const V = svgLayer(R);
      this.arr = prepPath(s('path', { d: `M${AX} ${AY0} V${AY1} H${AXE}`, stroke: '#ff7a8a', 'stroke-width': 3.5, fill: 'none', 'stroke-linejoin': 'round' }, V));
      this.ah = s('path', { d: `M${AXE + 14} ${AY1 - 12} L${AXE - 4} ${AY1} L${AXE + 14} ${AY1 + 12}`, stroke: '#ff7a8a', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, V);
      // 같은 실패가 쌓일 때마다 화살표를 따라 내려가는 점
      this.dot = s('circle', { cx: AX, cy: AY0, r: 10, fill: '#ff7a8a', stroke: '#fff', 'stroke-width': 2, opacity: 0 }, V);
      this.low = div(R, { left: '120px', top: '598px', whiteSpace: 'nowrap', font: '700 32px/1.3 Pretendard', color: 'var(--ink)' },
        '같은 실패 <b class="n" style="display:inline-block;color:var(--coral);font-weight:900;min-width:20px;text-align:center">1</b>회 이상 <span style="color:var(--coral)">→</span> 하네스 개선 기능(evolve)에 넣는다<span style="color:var(--ink2);font-weight:500">(제안)</span>');
      this.lowN = this.low.querySelector('.n');
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      V3.ruleHeadIn(this.RH, lt, 0.1);
      UI.lineIn(this.c, lt, 0.95);
      UI.lineIn(this.chip, lt, 1.15, { y: 0 });
      // ② 열 이름 8개가 하나씩 놓인다
      UI.tableIn(this.TB, lt, 2.5, 0.3, 0, 1);
      css(this.TB.head, { opacity: '1', transform: 'none', filter: 'none' });
      this.TB.head.style.borderBottomColor = `rgba(111,226,255,${(0.6 * prog(lt, 1.6, 0.5)).toFixed(3)})`;
      this.heads.forEach((c, i) => UI.rise(c, lt, 1.62 + i * 0.08, { y: -18, blur: 0, dur: 0.38 }));
      // ③ 예시 행 2개(위 tableIn) · ④ 둘째 행 「상한 초과」가 산호색으로 바뀐다
      const hk = prog(lt, 3.45, 0.35);
      this.mark.style.opacity = hk.toFixed(3);
      this.bad.style.color = hk > 0.5 ? 'var(--coral)' : 'var(--ink)';
      this.bad.style.fontWeight = hk > 0.5 ? '700' : '500';
      const bs = lt >= 3.55 ? spring(lt, 3.55, 2.4, 0.5) : 0;
      css(this.box, { opacity: (lt >= 3.55 ? clamp((lt - 3.55) / 0.1) : 0).toFixed(3), transform: `scale(${(1.08 - 0.08 * bs).toFixed(4)})` });
      drawPath(this.arr, prog(lt, 3.75, 0.45, ease.inOutSine));
      this.ah.setAttribute('opacity', prog(lt, 4.15, 0.12).toFixed(3));
      // 점이 화살표를 세 번 따라 내려갈 때마다 「같은 실패 N회」가 1·2·3으로 오른다
      const L1 = this.AY1 - this.AY0, L = L1 + (this.AX - this.AXE);
      const LAP = [4.25, 4.75, 5.25], LD = 0.42;
      let n = 0, dv = 0, px = this.AX, py = this.AY0;
      LAP.forEach(t0 => {
        if (lt >= t0 + LD) n++;
        if (lt >= t0 && lt < t0 + LD) {
          const d = ease.inOutSine((lt - t0) / LD) * L;
          dv = 1;
          if (d <= L1) { px = this.AX; py = this.AY0 + d; } else { px = this.AX - (d - L1); py = this.AY1; }
        }
      });
      this.dot.setAttribute('cx', px.toFixed(1)); this.dot.setAttribute('cy', py.toFixed(1)); this.dot.setAttribute('opacity', String(dv));
      UI.rise(this.low, lt, LAP[0] + LD - 0.05, { x: -20, y: 0, dur: 0.35 });
      this.lowN.textContent = String(Math.max(1, n));
      const lastHit = LAP.map(t => t + LD).filter(t => lt >= t).pop();
      const pk = lastHit != null ? spring(lt, lastHit, 3, 0.45) : 1;
      this.lowN.style.transform = `scale(${(1.35 - 0.35 * pk).toFixed(3)})`;
      UI.exit(this.R, lt, ctx);
    },
  });
})();
