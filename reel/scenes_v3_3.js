/* scenes_v3_3.js — 섹션 3 데이터 정의 P13~P20(스토리보드 v3) */
(function () {
  'use strict';
  const { clamp, lerp, prog, ease, h, s, css, rand, kf } = REEL;
  const SEC = { sec: '03', name: '데이터 정의' };
  const SRC_A = 'Anthropic 데이터팀 · How Anthropic enables self-service data analytics with Claude · 2026-06-03 · 판매사 자체 측정';
  const C = { cyan: '#6fe2ff', mint: '#73f5c6', coral: '#ff7a8a', amber: '#ffcb66', pink: '#ff6ef2', ink: '#f6f3ff', line: 'rgba(190,170,255,.45)' };

  // 위치·글꼴을 정한 글자 상자
  const tx = (R, html, o) => {
    const d = h('div', 'a', R, html);
    css(d, Object.assign({ left: o.x + 'px', top: o.y + 'px', font: o.font || '600 30px/1.3 var(--display)', color: o.color || 'var(--ink)', letterSpacing: '-.012em' },
      o.w ? { width: o.w + 'px' } : { whiteSpace: 'nowrap' }, o.css || {}));
    return d;
  };
  // 머리말: 출처 줄 항목마다 줄바꿈하지 않게 묶는다(글자는 그대로)
  const hdr = (R, src) => {
    const hd = UI.header(R, Object.assign({ src }, SEC));
    if (hd.src) {
      const parts = hd.src.innerHTML.split(' · ');
      hd.src.innerHTML = parts.map((p, i) => `<span style="white-space:nowrap">${p}${i < parts.length - 1 ? ' ·' : ''}</span>`).join(' ');
    }
    return hd;
  };
  const svgRoot = R => { const v = s('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, R); css(v, { position: 'absolute', left: '0px', top: '0px', overflow: 'visible' }); return v; };
  const op = (el, p) => { el.style.opacity = clamp(p).toFixed(3); };
  const sop = (el, p) => el.setAttribute('opacity', clamp(p).toFixed(3));

  // 문서 아이콘(스킬 문서): 접힌 모서리 + 줄 3개
  const docIcon = (parent, w = 34, hh = 44, color = C.mint) => {
    const g = s('g', {}, parent);
    s('path', { d: `M0,0 H${w - 11} L${w},11 V${hh} H0 Z`, fill: 'rgba(12,11,62,.85)', stroke: color, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    s('path', { d: `M${w - 11},0 V11 H${w}`, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    [16, 24, 32].forEach((y, i) => s('line', { x1: 6, y1: y, x2: w - (i === 2 ? 14 : 7), y2: y, stroke: color, 'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: 0.8 }, g));
    return g;
  };
  // 깃발 아이콘(코드 리뷰 훅 표시)
  const flagIcon = (parent, color = C.coral) => {
    const g = s('g', {}, parent);
    s('line', { x1: 2, y1: 0, x2: 2, y2: 30, stroke: color, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    s('path', { d: 'M3,1 L22,6 L3,13 Z', fill: color }, g);
    return g;
  };
  // 규칙 장 꼬리표(근거·참고·하네스)
  const tag = (txt, col) => `<b style="display:inline-block;font:800 28px/1 var(--display);color:#0c0b3e;background:${col};border-radius:8px;padding:7px 12px 6px;margin-right:16px;vertical-align:2px;letter-spacing:0">${txt}</b>`;
  const mono = t => `<span style="font-family:var(--mono);font-size:.92em;color:var(--cyan)">${t}</span>`;

  /* ───────── P13 · 간지 ───────── */
  DECK.slide({
    id: 'p13', stops: [3.2], exit: 0.5, bg: V3.DIV_BG,
    setup(el) {
      const R = this.R = UI.root(el);
      this.D = V3.divider(R, { num: '03', title: '데이터 정의', sub: '에이전트가 읽을 정의를 누가 쓰고 언제 고치나', active: 0 });
    },
    render(lt, ctx) { V3.dividerIn(this.D, lt); UI.exit(this.R, lt, ctx); },
  });

  /* ───────── P14 · 사례 장면: 시간 표시가 사건 3개를 차례로 지나고, 셋째 점에서 스킬 문서가 붙으며 막대가 21%에서 95%로 바뀐다 ───────── */
  DECK.slide({
    id: 'p14', stops: [2.0, 3.8, 5.6], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = hdr(R, SRC_A); this.chip = V3.story(this.hd, { name: 'Anthropic 데이터팀', k: 1, n: 3 });
      this.ask = UI.ask(R, '회사 테이블 설명을 적어 주면 달라지나', { top: 112 });
      this.T = UI.title(R, 'Anthropic 데이터팀은 회사 지식 스킬 없이는/자체 평가 정확도 *21%*를 넘지 못했다', { top: 156, size: 68 });
      this.ctx = UI.context(R, '사내 직원의 업무 분석 질문에 Claude 에이전트가 답하게 한 팀. 문항 수 비공개', { top: 326 });
      const v = this.svg = svgRoot(R);
      const AX = this.AX = 456; const X = this.X = [140, 680, 1220];
      this.axis = s('line', { x1: 120, y1: AX, x2: 120, y2: AX, stroke: C.line, 'stroke-width': 3 }, v);
      this.arrow = s('path', { d: `M1772,${AX - 11} L1792,${AX} L1772,${AX + 11}`, fill: 'none', stroke: C.line, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, v);
      this.lit = s('line', { x1: X[0], y1: AX, x2: X[0], y2: AX, stroke: C.cyan, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.85 }, v);
      const cols = [C.cyan, C.coral, C.mint];
      this.nodes = X.map((x, i) => {
        const g = s('g', { transform: `translate(${x},${AX})` }, v);
        s('circle', { r: 24, fill: UI.hexA(cols[i], 0.16) }, g);
        s('circle', { r: 11, fill: cols[i], stroke: '#0c0b3e', 'stroke-width': 3 }, g);
        return g;
      });
      // 시간 표시(시간축 위를 지나가는 세로 막대)
      this.agent = s('g', {}, v);
      s('rect', { x: -3, y: -26, width: 6, height: 52, rx: 3, fill: C.ink, opacity: 0.85 }, this.agent);
      // 셋째 점에 붙는 스킬 문서
      this.doc = s('g', {}, v); docIcon(this.doc, 34, 44, C.mint);
      // 사건 라벨
      this.L1 = tx(R, '사내 분석 질문을 에이전트에 맡김', { x: X[0], y: 494 });
      this.L2 = tx(R, '스킬 없음: 자체 평가', { x: X[1], y: 494 });
      this.N2 = tx(R, '<span style="font-size:72px">21%</span><span style="font-size:32px;font-weight:700"> 이하</span>', { x: X[1] - 4, y: 550, font: '900 72px/1 var(--num)', color: 'var(--coral)', css: { letterSpacing: '-.03em' } });
      this.L3 = tx(R, '회사 테이블·지표 정의를 적은 스킬 추가:', { x: X[2], y: 494 });
      this.N3 = tx(R, '<span style="font-size:72px">95%</span><span style="font-size:32px;font-weight:700"> 이상</span>', { x: X[2] - 4, y: 550, font: '900 72px/1 var(--num)', color: 'var(--mint)', css: { letterSpacing: '-.03em' } });
      // 정확도 막대: 둘째 점 막대(21%)와, 둘째 점에서 셋째 점으로 옮겨 가며 차오르는 막대
      const GW = this.GW = 400, GY = 630;
      this.g2 = s('g', { transform: `translate(${X[1]},${GY})` }, v);
      s('rect', { width: GW, height: 12, rx: 6, fill: 'rgba(190,170,255,.18)' }, this.g2);
      s('rect', { width: GW * 0.21, height: 12, rx: 6, fill: C.coral }, this.g2);
      this.g3 = s('g', {}, v);
      s('rect', { width: GW, height: 12, rx: 6, fill: 'rgba(190,170,255,.18)' }, this.g3);
      this.g3f = s('rect', { width: GW * 0.21, height: 12, rx: 6, fill: C.coral }, this.g3);
      this.GY = GY;
      // 용어 줄은 맥락 줄 바로 아래(시간축 위)에 둔다: 라벨·숫자·막대가 세로로 넉넉히 들어가도록
      this.term = UI.term(R, '스킬', '에이전트가 작업 전에 읽는 절차·참고 문서 묶음(SKILL.md 파일)', { top: 376, left: 120, width: 1680 });
    },
    render(lt, ctx) {
      const { X, AX } = this;
      UI.headerIn(this.hd, lt); V3.storyIn(this.chip, lt, 0.2);
      UI.lineIn(this.ask, lt, 0.1); UI.titleIn(this.T, lt, 0.28); UI.lineIn(this.ctx, lt, 1.2);
      // 시간축이 왼쪽에서 그어진다
      const pa = prog(lt, 1.0, 0.9, ease.outCubic);
      this.axis.setAttribute('x2', lerp(120, 1790, pa).toFixed(1)); sop(this.arrow, prog(lt, 1.75, 0.2));
      // 시간 표시가 점1 → 점2 → 점3 으로 이동
      const mx = kf(lt, [[2.55, X[0]], [3.1, X[1], ease.swift], [3.95, X[1]], [4.6, X[2], ease.swift]]);
      const ma = prog(lt, 2.0, 0.3);
      this.agent.setAttribute('transform', `translate(${mx.toFixed(1)},${AX}) scale(${lerp(0.4, 1, ease.outBack(clamp(ma))).toFixed(3)})`); sop(this.agent, ma);
      this.lit.setAttribute('x2', mx.toFixed(1)); sop(this.lit, ma * 0.85);
      [2.1, 3.1, 4.6].forEach((t0, i) => {
        const p = prog(lt, t0, 0.45, ease.outBack);
        this.nodes[i].setAttribute('transform', `translate(${X[i]},${AX}) scale(${(0.2 + 0.8 * p).toFixed(3)})`); sop(this.nodes[i], prog(lt, t0, 0.12));
      });
      UI.rise(this.L1, lt, 2.2, { y: 18, blur: 0 });
      UI.rise(this.L2, lt, 3.15, { y: 18, blur: 0 }); UI.rise(this.N2, lt, 3.3, { y: 24, blur: 0 });
      // 둘째 점 막대: 21%까지 차오름
      const p2 = prog(lt, 3.3, 0.5, ease.outCubic);
      sop(this.g2, prog(lt, 3.3, 0.15)); this.g2.lastChild.setAttribute('width', (this.GW * 0.21 * p2).toFixed(1));
      // 옮겨 가는 막대: 시간 표시와 함께 오른쪽으로, 셋째 점에서 95%로 차오르며 색이 바뀐다
      const gx = kf(lt, [[3.95, X[1]], [4.6, X[2], ease.swift]]);
      sop(this.g3, prog(lt, 3.9, 0.12));
      this.g3.setAttribute('transform', `translate(${gx.toFixed(1)},${this.GY})`);
      const pf = prog(lt, 4.85, 0.6, ease.inOutCubic);
      this.g3f.setAttribute('width', (this.GW * lerp(0.21, 0.95, pf)).toFixed(1));
      this.g3f.setAttribute('fill', pf < 0.5 ? C.coral : C.mint); sop(this.g3f, pf < 0.5 ? 1 - pf * 0.6 : 0.4 + pf * 0.6);
      // 스킬 문서가 셋째 점 위로 내려와 붙는다
      const pd = prog(lt, 4.45, 0.45, ease.outBack);
      this.doc.setAttribute('transform', `translate(${X[2] - 17},${(AX - 74 - (1 - pd) * 50).toFixed(1)})`); sop(this.doc, prog(lt, 4.45, 0.15));
      UI.rise(this.L3, lt, 4.65, { y: 18, blur: 0 }); UI.rise(this.N3, lt, 5.1, { y: 24, blur: 0 });
      UI.lineIn(this.term, lt, 4.75);
      UI.exit(this.R, lt, ctx);
    },
  });

  /* ───────── P15 · 시간축(도식 먼저): 공개 직후 95%에서 한 달 눈금을 따라 선이 내려가 65%에 닿은 뒤 제목이 결론으로 나온다 ───────── */
  DECK.slide({
    id: 'p15', stops: [1.4, 2.4, 6.3], exit: 0.5, bg: Object.assign({}, DECK.BGP.calm, { hue: -0.5, amp: 50 }),
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = hdr(R, SRC_A); this.chip = V3.story(this.hd, { name: 'Anthropic 데이터팀', k: 2, n: 3 });
      this.ctx = UI.context(R, '같은 팀 사내 평가셋. 데이터 모델이 매일 바뀌어 문서가 몇 주 안에 실제와 어긋났다', { top: 116 });
      const P0 = this.P0 = [640, 256], P1 = this.P1 = [1300, 372], AY = this.AY = 410;
      const v = svgRoot(R);
      // 공개 후 경과 눈금(31개: 공개일 + 한 달)
      this.base = s('line', { x1: P0[0], y1: AY, x2: P0[0], y2: AY, stroke: C.line, 'stroke-width': 2.5 }, v);
      this.ticks = Array.from({ length: 31 }, (_, i) => {
        const x = lerp(P0[0], P1[0], i / 30);
        return s('line', { x1: x, y1: AY, x2: x, y2: AY + (i % 7 === 0 ? 16 : 9), stroke: C.line, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, v);
      });
      this.guide = s('line', { x1: P0[0], y1: P0[1], x2: P1[0], y2: P0[1], stroke: 'rgba(111,226,255,.45)', 'stroke-width': 2, 'stroke-dasharray': '6 9' }, v);
      this.drop = s('line', { x1: P1[0], y1: P0[1], x2: P1[0], y2: P1[1], stroke: C.coral, 'stroke-width': 3, 'stroke-dasharray': '5 7' }, v);
      this.cur = s('line', { x1: 0, y1: 0, x2: 0, y2: AY, stroke: 'rgba(246,243,255,.35)', 'stroke-width': 2 }, v);
      const gid = 'p15g2';
      const lg = s('linearGradient', { id: gid, x1: P0[0], y1: 0, x2: P1[0], y2: 0, gradientUnits: 'userSpaceOnUse' }, s('defs', {}, v));
      s('stop', { offset: '0%', 'stop-color': C.cyan }, lg); s('stop', { offset: '100%', 'stop-color': C.coral }, lg);
      this.path = s('line', { x1: P0[0], y1: P0[1], x2: P0[0], y2: P0[1], stroke: `url(#${gid})`, 'stroke-width': 6, 'stroke-linecap': 'round' }, v);
      this.p0 = s('g', {}, v);
      s('circle', { r: 26, fill: 'rgba(111,226,255,.18)' }, this.p0); s('circle', { r: 12, fill: C.cyan, stroke: '#0c0b3e', 'stroke-width': 3 }, this.p0);
      this.p1 = s('g', {}, v);
      s('circle', { r: 26, fill: 'rgba(255,122,138,.2)' }, this.p1); s('circle', { r: 12, fill: C.coral, stroke: '#0c0b3e', 'stroke-width': 3 }, this.p1);
      this.doc = s('g', {}, v); docIcon(this.doc, 34, 44, C.cyan);
      this.yl = tx(R, '사내 평가셋 정확도', { x: 120, y: 180, color: 'var(--dim)' });
      this.l0 = tx(R, '사내 공개 직후', { x: 120, y: 230 });
      this.n0 = tx(R, '<span style="font-size:46px;font-weight:800">약 </span>95%', { x: 116, y: 284, font: '900 104px/1 var(--num)', color: 'var(--cyan)', css: { letterSpacing: '-.04em' } });
      this.l1 = tx(R, '한 달 뒤', { x: 1350, y: 230 });
      this.n1 = tx(R, '<span style="font-size:46px;font-weight:800">약 </span>65%', { x: 1346, y: 284, font: '900 104px/1 var(--num)', color: 'var(--coral)', css: { letterSpacing: '-.04em' } });
      this.xl = tx(R, '공개 후 경과', { x: 1350, y: 406, color: 'var(--dim)' });
      // 용어 줄은 맥락 줄 오른쪽 같은 줄에 둔다(맥락 줄의 '데이터 모델'을 바로 풀이). 왼쪽 칸은 라벨과 큰 숫자만 남긴다
      this.term = UI.term(R, '데이터 모델', '테이블 구조와 관계를 정한 설계', { top: 117, left: 1040, width: 760 });
      this.T = UI.title(R, '스킬 문서를 한 달 고치지 않자/정확도가 약 95%에서 *약 65%*로 내려갔다', { top: 452, size: 62 });
      this.mean = UI.meaning(R, '→ 데이터 모델이 바뀌면 정의 문서도 같이 고쳐야 정확도가 유지된다', { top: 606, left: 120, size: 30 });
    },
    render(lt, ctx) {
      const { P0, P1, AY } = this;
      UI.headerIn(this.hd, lt); V3.storyIn(this.chip, lt, 0.2);
      UI.lineIn(this.ctx, lt, 0.15);
      const pb = prog(lt, 0.45, 0.7, ease.outCubic);
      this.base.setAttribute('x2', lerp(P0[0], P1[0], pb).toFixed(1));
      UI.lineIn(this.yl, lt, 0.6); UI.lineIn(this.xl, lt, 0.75); UI.lineIn(this.term, lt, 0.9);
      const q0 = prog(lt, 1.45, 0.45, ease.outBack);
      this.p0.setAttribute('transform', `translate(${P0[0]},${P0[1]}) scale(${(0.2 + 0.8 * q0).toFixed(3)})`); sop(this.p0, prog(lt, 1.45, 0.12));
      UI.rise(this.l0, lt, 1.5, { y: 16, blur: 0 }); UI.rise(this.n0, lt, 1.6, { y: 26, blur: 0 });
      sop(this.guide, prog(lt, 2.0, 0.4) * 0.9);
      // 한 달: 커서가 눈금을 따라 이동하고 선이 따라 내려간다. 문서 아이콘은 모양 그대로 같이 이동
      const u = prog(lt, 2.5, 1.6, ease.inOutSine);
      const cx = lerp(P0[0], P1[0], u), cy = lerp(P0[1], P1[1], u);
      this.path.setAttribute('x2', cx.toFixed(1)); this.path.setAttribute('y2', cy.toFixed(1)); sop(this.path, prog(lt, 2.45, 0.1));
      this.cur.setAttribute('x1', cx.toFixed(1)); this.cur.setAttribute('x2', cx.toFixed(1)); this.cur.setAttribute('y1', (cy + 20).toFixed(1));
      sop(this.cur, prog(lt, 2.45, 0.2) * (1 - prog(lt, 4.15, 0.3)));
      this.ticks.forEach((tk, i) => {
        const on = u >= i / 30 - 1e-6 && lt >= 2.5;
        tk.setAttribute('stroke', on ? lerpCol(i / 30) : C.line);
        sop(tk, prog(lt, 0.5 + i * 0.02, 0.2));
      });
      const da = prog(lt, 1.85, 0.4, ease.snap);
      this.doc.setAttribute('transform', `translate(${(cx - 17).toFixed(1)},${(cy - 78 - (1 - da) * 20).toFixed(1)})`); sop(this.doc, da);
      const q1 = prog(lt, 4.1, 0.45, ease.outBack);
      this.p1.setAttribute('transform', `translate(${P1[0]},${P1[1]}) scale(${(0.2 + 0.8 * q1).toFixed(3)})`); sop(this.p1, prog(lt, 4.1, 0.12));
      const qd = prog(lt, 4.15, 0.4, ease.outCubic);
      this.drop.setAttribute('y2', lerp(P0[1], P1[1], qd).toFixed(1)); sop(this.drop, prog(lt, 4.15, 0.1));
      UI.rise(this.l1, lt, 4.2, { y: 16, blur: 0 }); UI.rise(this.n1, lt, 4.25, { y: 26, blur: 0 });
      // 결론: 제목이 마지막에 나온다
      UI.titleIn(this.T, lt, 4.5);
      UI.lineIn(this.mean, lt, 5.75);
      UI.exit(this.R, lt, ctx);
    },
  });
  function lerpCol(u) {
    const a = [111, 226, 255], b = [255, 122, 138];
    return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], u))).join(',')})`;
  }

  /* ───────── P16 · 전후 변환(좌우): '전' PR 화면이 오른쪽으로 옮겨 가며 빈 칸에 스킬 수정 줄이 들어와 한 묶음이 된다 ───────── */
  DECK.slide({
    id: 'p16', stops: [1.9, 3.3, 5.0, 6.0], exit: 0.5, bg: DECK.BGP.text,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = hdr(R, SRC_A); this.chip = V3.story(this.hd, { name: 'Anthropic 데이터팀', k: 3, n: 3 });
      this.T = UI.title(R, '데이터 모델을 고치는 PR의 *약 90%*에/스킬 수정이 같이 들어가게 됐다', { top: 128, size: 68 });
      this.ctx = UI.context(R, '스킬 문서를 데이터 모델 코드와 같은 저장소에 두고 코드 리뷰에서 함께 확인한다', { top: 296 });
      this.term = UI.term(R, 'PR', '코드 변경을 검토받아 합치는 요청(pull request)', { top: 344, left: 120, width: 1680 });
      const CY = 398, CH = 140, CW = 760, LX = 120, RX = 1040;
      Object.assign(this, { CY, CH, CW, LX, RX });
      const mkCard = (x, label, after) => {
        const c = UI.card(R, { x, y: CY, w: CW, h: CH });
        const lab = tx(c, label, { x: 30, y: 30, font: '800 48px/1 var(--display)', color: after ? 'var(--mint)' : 'var(--ink)' });
        const v = s('svg', { width: CW, height: CH, viewBox: `0 0 ${CW} ${CH}` }, c); css(v, { position: 'absolute', left: '0px', top: '0px', overflow: 'visible' });
        const pr = s('g', { transform: 'translate(36,96)', fill: 'none', stroke: after ? C.mint : 'rgba(246,243,255,.7)', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, v);
        s('circle', { cx: 4, cy: 4, r: 4 }, pr); s('circle', { cx: 4, cy: 26, r: 4 }, pr); s('circle', { cx: 26, cy: 26, r: 4 }, pr);
        s('path', { d: 'M4,8 V22 M26,22 V14 Q26,4 16,4 H10' }, pr);
        s('line', { x1: 104, y1: 14, x2: 104, y2: CH - 14, stroke: 'rgba(190,170,255,.25)', 'stroke-width': 2 }, v);
        const r1 = tx(c, '<span style="color:var(--cyan);font-family:var(--mono);margin-right:12px">◆</span>데이터 모델 변경 1건', { x: 130, y: 24 });
        return { c, lab, v, r1 };
      };
      this.A = mkCard(LX, '전', false);
      this.B = mkCard(RX, '후', true);
      this.Aband = h('div', 'a', this.A.c); css(this.Aband, { left: '118px', top: '76px', width: '622px', height: '48px', borderRadius: '10px', background: 'rgba(255,122,138,.18)', border: '1.5px solid rgba(255,122,138,.6)' });
      this.A2 = tx(this.A.c, '스킬 문서 변경 없음', { x: 130, y: 82, color: '#ffc2ca' });
      this.Aflag = s('g', {}, this.A.v); flagIcon(this.Aflag);
      this.Bband = h('div', 'a', this.B.c); css(this.Bband, { left: '118px', top: '76px', width: '622px', height: '48px', borderRadius: '10px', background: 'rgba(255,122,138,.18)', border: '1.5px solid rgba(255,122,138,.6)' });
      this.Bmask = h('div', 'a', this.B.c); css(this.Bmask, { left: '118px', top: '74px', width: '622px', height: '54px', overflow: 'hidden' });
      this.B2 = tx(this.Bmask, '<span style="color:var(--mint);font-family:var(--mono);margin-right:12px">+</span>스킬 문서 수정 1건', { x: 12, y: 8, color: 'var(--ink)' });
      this.Bdoc = s('g', {}, this.B.v); docIcon(this.Bdoc, 26, 34, C.mint);
      this.bundle = s('rect', { x: 116, y: 12, width: 628, height: CH - 24, rx: 12, fill: 'rgba(115,245,198,.07)', stroke: C.mint, 'stroke-width': 2.5, 'stroke-dasharray': '8 7' }, this.B.v);
      this.bundle.parentNode.insertBefore(this.bundle, this.bundle.parentNode.firstChild);
      const v = svgRoot(R);
      this.arr = s('path', { d: `M906,${CY + CH / 2} H1016 M1000,${CY + CH / 2 - 12} L1018,${CY + CH / 2} L1000,${CY + CH / 2 + 12}`, fill: 'none', stroke: C.mint, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, v);
      this.hook = h('div', 'a', R); css(this.hook, { left: '120px', top: '556px', display: 'flex', alignItems: 'center', gap: '16px', whiteSpace: 'nowrap' });
      const fv = s('svg', { width: 26, height: 32, viewBox: '0 0 26 32' }, this.hook); flagIcon(fv);
      tx(this.hook, '보고용 모델만 바꾼 PR은 코드 리뷰 때 자동 검사가 표시', { x: 0, y: 0, css: { position: 'static' } });
      this.mean = UI.meaning(R, '→ 정의 문서도 데이터 모델 코드와 같은 PR·리뷰 절차로 고친다', { top: 604, left: 120 });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt); V3.storyIn(this.chip, lt, 0.2);
      UI.titleIn(this.T, lt, 0.12); UI.lineIn(this.ctx, lt, 1.05); UI.lineIn(this.term, lt, 1.3);
      UI.rise(this.A.c, lt, 1.95, { y: 30, blur: 0 });
      UI.rise(this.A.r1, lt, 2.15, { x: -16, y: 0, blur: 0 }); UI.rise(this.A2, lt, 2.3, { x: -16, y: 0, blur: 0 });
      const pr = prog(lt, 2.7, 0.35, ease.snap);
      css(this.Aband, { opacity: pr.toFixed(3), clipPath: `inset(0 ${((1 - pr) * 100).toFixed(1)}% 0 0)` });
      const pf = prog(lt, 3.0, 0.35, ease.outBack);
      this.Aflag.setAttribute('transform', `translate(700,${(84 - (1 - pf) * 14).toFixed(1)})`); sop(this.Aflag, prog(lt, 3.0, 0.1));
      // 같은 화면이 오른쪽으로 옮겨 간다
      const mv = prog(lt, 3.4, 0.8, ease.swift);
      css(this.B.c, { opacity: prog(lt, 3.35, 0.1).toFixed(3), transform: `translate(${((1 - mv) * (this.LX - this.RX)).toFixed(1)}px, ${(-Math.sin(mv * Math.PI) * 18).toFixed(1)}px)` });
      op(this.A.c, prog(lt, 1.95, 0.55) * lerp(1, 0.6, prog(lt, 3.5, 0.6)));
      op(this.B.lab, prog(lt, 3.9, 0.3));
      // 빈 붉은 칸이 사라지고 스킬 수정 줄이 아래에서 올라와 들어온다
      const pin = prog(lt, 4.25, 0.45, ease.snap);
      op(this.Bband, 1 - prog(lt, 4.2, 0.3));
      css(this.B2, { transform: `translateY(${((1 - pin) * 52).toFixed(1)}px)` }); op(this.B2, pin);
      const pdc = prog(lt, 4.35, 0.4, ease.outBack);
      this.Bdoc.setAttribute('transform', `translate(700,${(82 + (1 - pdc) * 30).toFixed(1)})`); sop(this.Bdoc, prog(lt, 4.35, 0.12));
      const pb = prog(lt, 4.5, 0.45, ease.outCubic);
      this.bundle.setAttribute('stroke-dashoffset', ((1 - pb) * 80).toFixed(1)); sop(this.bundle, pb);
      sop(this.arr, prog(lt, 4.1, 0.35));
      UI.rise(this.hook, lt, 5.05, { y: 16, blur: 0 });
      UI.lineIn(this.mean, lt, 5.35);
      UI.exit(this.R, lt, ctx);
    },
  });

  /* ───────── P17 · 전후 변환(위아래, 오른쪽 글 칸): '전' 8칸이 아래로 복사돼 내려오고, 훑기 선이 지나가며 4칸이 더 채워진다 ───────── */
  DECK.slide({
    id: 'p17', stops: [1.9, 3.3, 5.3, 6.0], exit: 0.5, bg: Object.assign({}, DECK.BGP.split, { parts: 8, gap: 30 }),
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = hdr(R, '토스 기술 블로그(김문수) · 실행은 도메인별로, 문맥은 한 레포에 · 2026-10-16 · 자체 측정(해커톤, 문항 8~9개)');
      // 오른쪽 글 칸(x 1120~1800)
      this.ask = UI.ask(R, '정의를 더하면 챗봇이 고르는 테이블이 달라지나', { top: 126, left: 1120 });
      this.T = UI.title(R, '지식베이스에 지표 정의를/넣자 챗봇이 맞는 테이블을/고른 문항이 8개 중/2개에서 *6개*가 됐다', { top: 170, left: 1120, width: 680, size: 56 });
      this.ctx = UI.context(R, '토스 데이터 웨어하우스팀의 분석 챗봇(에이전트), 5시간 해커톤. 정의를 보지 않은 사람의 질문 8개', { top: 438, left: 1120, width: 680 });
      this.mean = UI.meaning(R, '→ 문항 8개뿐이지만 Anthropic과 같은 방향이다', { top: 578, left: 1120, width: 680, size: 30 });
      // 왼쪽 도식(x 120~1060)
      const X0 = 120, W = 105, G = 14, YB = 188, YA = 376, H = 88;
      Object.assign(this, { X0, W, G, YB, YA, H });
      const mkRow = (y) => Array.from({ length: 8 }, (_, i) => {
        const c = h('div', 'a', R);
        css(c, { left: (X0 + i * (W + G)) + 'px', top: y + 'px', width: W + 'px', height: H + 'px', borderRadius: '12px', boxSizing: 'border-box',
          border: '2px solid rgba(190,170,255,.45)', background: 'rgba(22,18,96,.45)', overflow: 'hidden' });
        const f = h('div', 'a', c); css(f, { left: '0px', right: '0px', bottom: '0px', height: '100%', transformOrigin: '50% 100%' });
        return { c, f };
      });
      this.rb = mkRow(YB); this.ra = mkRow(YA);
      this.rb.forEach((k, i) => css(k.f, { background: i < 2 ? 'rgba(111,226,255,.55)' : 'transparent' }));
      this.ra.forEach((k, i) => css(k.f, { background: i < 2 ? 'rgba(111,226,255,.55)' : i < 6 ? 'rgba(115,245,198,.6)' : 'transparent' }));
      this.lb = tx(R, '전', { x: 122, y: YB - 64, font: '800 44px/1 var(--display)' });
      this.la = tx(R, '후', { x: 122, y: YA - 64, font: '800 44px/1 var(--display)', color: 'var(--mint)' });
      const RE = { x: 560, w: 500, css: { textAlign: 'right', whiteSpace: 'nowrap' } };
      this.nb = tx(R, '<span style="font:600 30px/1 var(--display);color:var(--ink2);margin-right:18px;letter-spacing:-.01em">맞는 테이블</span>2/8', Object.assign({ y: YB - 74, font: '900 64px/1 var(--num)', color: 'var(--cyan)' }, RE));
      this.na = tx(R, '6/8', Object.assign({ y: YA - 74, font: '900 64px/1 var(--num)', color: 'var(--mint)' }, RE));
      this.aux = tx(R, '설명형 질문(계산이 아닌 설명을 묻는 질문) 9개: 정답 2개 → 7개', { x: 120, y: 488, color: 'var(--ink)' });
      this.term = UI.term(R, '지식베이스', '챗봇이 답하기 전에 찾아 읽는 문서 모음(앞 장의 스킬과 같은 역할)', { top: 552, left: 120, width: 940 });
      this.scan = h('div', 'a', R); css(this.scan, { top: (YA - 10) + 'px', height: (H + 20) + 'px', width: '6px', borderRadius: '3px', background: 'var(--mint)', boxShadow: '0 0 22px rgba(115,245,198,.9)' });
    },
    render(lt, ctx) {
      const { X0, W, G, YB, YA } = this;
      UI.headerIn(this.hd, lt); UI.lineIn(this.ask, lt, 0.1); UI.titleIn(this.T, lt, 0.25);
      UI.lineIn(this.ctx, lt, 1.2); UI.lineIn(this.term, lt, 1.4);
      UI.rise(this.lb, lt, 1.95, { x: -16, y: 0, blur: 0 });
      this.rb.forEach((k, i) => {
        const p = prog(lt, 2.0 + i * 0.05, 0.4, ease.snap);
        css(k.c, { opacity: p.toFixed(3), transform: `scale(${lerp(0.7, 1, p).toFixed(3)})` });
        k.f.style.transform = `scaleY(${prog(lt, 2.55 + i * 0.12, 0.4, ease.outCubic).toFixed(3)})`;
      });
      UI.rise(this.nb, lt, 2.85, { y: 18, blur: 0 });
      // 같은 8칸이 아래 줄로 복사돼 내려온다(채운 2칸 포함)
      UI.rise(this.la, lt, 3.4, { x: -16, y: 0, blur: 0 });
      this.ra.forEach((k, i) => {
        const p = prog(lt, 3.4 + i * 0.05, 0.55, ease.outBack);
        css(k.c, { opacity: prog(lt, 3.4 + i * 0.05, 0.08).toFixed(3), transform: `translateY(${((1 - p) * (YB - YA)).toFixed(1)}px)` });
      });
      // 훑기 선이 지나가며 3~6번째 칸이 채워진다
      const u = prog(lt, 4.15, 0.9, ease.inOutSine);
      const sx = lerp(X0 - 14, X0 + 8 * (W + G), u);
      css(this.scan, { left: sx.toFixed(1) + 'px', opacity: (prog(lt, 4.1, 0.1) * (1 - prog(lt, 5.0, 0.15))).toFixed(3) });
      this.ra.forEach((k, i) => {
        if (i < 2) { k.f.style.transform = 'scaleY(1)'; return; }
        const cx = X0 + i * (W + G) + W / 2;
        const passed = i < 6 && lt >= 4.15 && sx >= cx;
        const q = i < 6 ? prog(lt, 4.15 + 0.9 * ((i + 0.5) / 8), 0.3, ease.outCubic) : 0;
        k.f.style.transform = `scaleY(${(passed ? q : 0).toFixed(3)})`;
        k.c.style.borderColor = passed ? 'rgba(115,245,198,.85)' : 'rgba(190,170,255,.45)';
      });
      const pn = prog(lt, 5.05, 0.4, ease.outBack);
      css(this.na, { opacity: prog(lt, 5.05, 0.1).toFixed(3), transform: `scale(${lerp(0.6, 1, pn).toFixed(3)})`, transformOrigin: '100% 50%' });
      UI.rise(this.aux, lt, 5.15, { y: 14, blur: 0 });
      UI.lineIn(this.mean, lt, 5.4);
      UI.exit(this.R, lt, ctx);
    },
  });

  /* ───────── P18 · 과정 도식(도식 먼저): 점 71개가 상자 아래 길로 흐름을 통과한 뒤 46개가 붉어지고, 메타데이터 카드가 붙은 흐름은 69개 중 23개. 제목은 마지막 ───────── */
  DECK.slide({
    id: 'p18', stops: [1.0, 1.9, 3.9, 6.9], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = hdr(R, 'Necula(Alexandru Ioan Cuza University) · arXiv 2609.22222 · 2026-09-02 · 통제 실험(단독 저자, 과제 30개)');
      this.ask = UI.ask(R, '정의가 없으면 어떻게 틀리나', { top: 104 });
      this.ctx = UI.context(R, 'Eurostat(EU 통계청) 질의 30개, Claude Sonnet 5, 조건마다 3회(90번)', { top: 146 });
      const BX = [120, 350, 580, 810], BW = 190, BY = 210, BH = 76, LANE = 312;
      Object.assign(this, { BX, BW, BY, BH, LANE });
      const v = this.v = svgRoot(R);
      this.links = [0, 1, 2].map(i => s('path', { d: `M${BX[i] + BW + 6},${BY + BH / 2} H${BX[i + 1] - 8} M${BX[i + 1] - 18},${BY + BH / 2 - 8} L${BX[i + 1] - 8},${BY + BH / 2} L${BX[i + 1] - 18},${BY + BH / 2 + 8}`, fill: 'none', stroke: C.line, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, v));
      // 점이 지나는 길(상자 아래)
      this.lane = s('path', { d: `M${BX[0] + BW / 2},${BY + BH} V${LANE} H${BX[3] + BW / 2} V${BY + BH}`, fill: 'none', stroke: 'rgba(190,170,255,.28)', 'stroke-width': 2, 'stroke-dasharray': '4 7' }, v);
      this.boxes = ['질의', '에이전트', '데이터 조회', '숫자'].map((t, i) => {
        const b = h('div', 'a', R, t);
        css(b, { left: BX[i] + 'px', top: BY + 'px', width: BW + 'px', height: BH + 'px', boxSizing: 'border-box', borderRadius: '16px', border: '2px solid rgba(190,170,255,.5)',
          background: 'rgba(22,18,96,.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 30px/1 var(--display)', color: 'var(--ink)', whiteSpace: 'nowrap' });
        return b;
      });
      // '에이전트' 칸: 글자를 왼쪽으로 옮겨 오른쪽에 붙는 문서 아이콘과 띄운다
      css(this.boxes[1], { paddingRight: '46px' });
      this.ok = s('g', {}, v);
      s('circle', { r: 17, fill: '#0c0b3e', stroke: C.mint, 'stroke-width': 2.5 }, this.ok);
      s('path', { d: 'M-8,0 L-2,6 L8,-6', fill: 'none', stroke: C.mint, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, this.ok);
      this.card = s('g', {}, v); docIcon(this.card, 26, 34, C.amber);
      this.term = UI.term(R, '메타데이터', '데이터 자체가 아니라 각 열의 의미·단위·구조를 적은 설명', { top: 352, left: 120, width: 900 });
      const GX = 1060, COLS = 24, PIT = 24;
      this.la = tx(R, '메타데이터 없음: 답까지 나온 <b style="color:var(--coral)">71번 중 46번(64.8%)</b>', { x: GX, y: 168 });
      this.lb = tx(R, '메타데이터 제공: <b style="color:var(--mint)">69번 중 23번(33.3%)</b>', { x: GX, y: 304 });
      const mk = (n, bad, gy, salt) => {
        const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => rand(a, salt) - rand(b, salt));
        const badSet = new Set(order.slice(0, bad));
        return Array.from({ length: n }, (_, i) => ({
          c: s('circle', { r: 8, fill: C.ink }, v),
          gx: GX + 10 + (i % COLS) * PIT, gy: gy + 10 + Math.floor(i / COLS) * PIT,
          bad: badSet.has(i), rk: order.indexOf(i), jy: (rand(i, salt + 3) - 0.5) * 16,
        }));
      };
      this.da = mk(71, 46, 216, 11);
      this.db = mk(69, 23, 352, 29);
      this.T = UI.title(R, '메타데이터 없이 답까지 나온 실행의 *64.8%*가/오류 신호 없이 틀린 답이었다', { top: 452, size: 62 });
      this.mean = UI.meaning(R, '→ 메타데이터가 없으면 오류 없이 그럴듯한 틀린 숫자가 나온다', { top: 604, left: 120, size: 30 });
    },
    // 점 하나: '질의' 아래에서 출발해 상자 아래 길을 지나 '숫자' 아래에 닿고, 격자 자리로 옮겨 간다
    dots(D, lt, T0, Tred, n, down = false) {
      const { BX, BW, LANE } = this;
      const x0 = BX[0] + BW / 2, x1 = BX[3] + BW / 2;
      D.forEach((d, i) => {
        const t0 = T0 + i * (0.55 / n);
        const u = prog(lt, t0, 0.55, ease.linear);
        const w = prog(lt, t0 + 0.55, 0.34, ease.inOutCubic);
        let x = lerp(x0, x1, u), y = LANE + d.jy * Math.sin(u * Math.PI);
        if (w > 0) {
          // 아래 격자로 갈 때는 먼저 내려간 뒤 오른쪽으로 가서 라벨 글자 위를 지나지 않는다
          x = lerp(x1, d.gx, down ? ease.inCubic(w) : w);
          y = down ? lerp(LANE, d.gy, ease.outCubic(w)) : lerp(LANE, d.gy, w) + Math.sin(w * Math.PI) * 18;
        }
        d.c.setAttribute('cx', x.toFixed(1)); d.c.setAttribute('cy', y.toFixed(1));
        sop(d.c, prog(lt, t0, 0.06));
        const red = d.bad ? prog(lt, Tred + (d.rk / n) * 0.35, 0.18) : 0;
        d.c.setAttribute('fill', red > 0.5 ? C.coral : w >= 1 ? C.mint : C.ink);
        d.c.setAttribute('r', (8 + (red > 0 && red < 1 ? Math.sin(red * Math.PI) * 3 : 0)).toFixed(2));
      });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt); UI.lineIn(this.ask, lt, 0.1); UI.lineIn(this.ctx, lt, 0.3);
      this.boxes.forEach((b, i) => UI.rise(b, lt, 1.0 + i * 0.14, { x: -24, y: 0, blur: 0 }));
      this.links.forEach((l, i) => sop(l, prog(lt, 1.15 + i * 0.14, 0.25)));
      sop(this.lane, prog(lt, 1.5, 0.3));
      UI.lineIn(this.term, lt, 1.45);
      // 첫 흐름: 71개
      UI.rise(this.la, lt, 1.9, { y: 14, blur: 0 });
      this.dots(this.da, lt, 1.95, 3.3, 71);
      const pk = prog(lt, 2.6, 0.35, ease.outBack);
      this.ok.setAttribute('transform', `translate(${this.BX[3] + this.BW - 8},${this.BY - 8}) scale(${pk.toFixed(3)})`); sop(this.ok, prog(lt, 2.6, 0.1));
      // 메타데이터 카드가 에이전트 칸에 붙고, 둘째 흐름: 69개
      const pc = prog(lt, 3.95, 0.45, ease.outBack);
      this.card.setAttribute('transform', `translate(${this.BX[1] + this.BW - 44},${(this.BY + 21 - (1 - pc) * 40).toFixed(1)})`); sop(this.card, prog(lt, 3.95, 0.12));
      css(this.boxes[1], { borderColor: lt >= 4.1 ? 'rgba(255,203,102,.9)' : 'rgba(190,170,255,.5)' });
      UI.rise(this.lb, lt, 4.1, { y: 14, blur: 0 });
      this.dots(this.db, lt, 4.2, 5.3, 69, true);
      // 결론: 제목과 의미 줄
      UI.titleIn(this.T, lt, 5.35);
      UI.lineIn(this.mean, lt, 6.35);
      UI.exit(this.R, lt, ctx);
    },
  });

  /* ───────── P19 · 규칙-좌: 왼쪽 규칙 문장과 근거·참고, 오른쪽 저장소 도식에서 데이터 모델 코드와 정의 문서가 한 변경으로 함께 바뀐다 ───────── */
  DECK.slide({
    id: 'p19', stops: [1.6, 3.4, 4.2, 5.2], exit: 0.5, bg: DECK.BGP.text,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = hdr(R, '발표자 제안 · 근거 데브시스터즈(2026-09-18)·Anthropic 데이터팀(2026-06-03, 판매사 자체 측정) · 참고 토스(2026-10-16)');
      this.RH = V3.ruleHead(R, { n: 1, text: '에이전트가 읽을 데이터 정의는/사람이 쓰고 데이터 모델과/*함께 고친다*' });
      const y0 = this.RH.bottom + 24;
      this.ev = tx(R, tag('근거', C.mint) + '에이전트가 기준을 정하자 대시보드와 다른 숫자(데브시스터즈) · 정의를 모델과 함께 고침(Anthropic PR <b style="font:900 34px/1 var(--num);color:var(--cyan);letter-spacing:-.02em;white-space:nowrap">약 90%</b>)', { x: 120, y: y0, w: 800, font: '600 30px/1.64 var(--display)' });
      this.ref = tx(R, tag('참고', C.amber) + '토스 8문항 중 2개 → 6개', { x: 120, y: 536 });
      // 오른쪽 칸(x 980~1800)
      this.cap = tx(R, '정의 문서는 데이터 모델 코드와<br>한 저장소에, 함께 고친다', { x: 980, y: 118, w: 820, font: '800 36px/1.36 var(--display)', css: { letterSpacing: '-.025em' } });
      const v = svgRoot(R);
      const RX = 980, RY = 244, RW = 820, RHh = 196;
      this.repo = s('rect', { x: RX, y: RY, width: RW, height: RHh, rx: 18, fill: 'rgba(22,18,96,.5)', stroke: 'rgba(190,170,255,.5)', 'stroke-width': 2 }, v);
      // 저장소 표시(폴더 모양)
      this.fold = s('path', { d: `M${RX + 20},${RY - 14} h34 l8,8 h30 v18 h-72 Z`, fill: 'rgba(190,170,255,.35)', stroke: 'rgba(190,170,255,.7)', 'stroke-width': 2 }, v);
      const mkFile = (x, label, col) => {
        const d = h('div', 'a', R);
        css(d, { left: x + 'px', top: (RY + 22) + 'px', width: '370px', height: '152px', boxSizing: 'border-box', borderRadius: '14px', border: `2px solid ${UI.hexA(col, 0.6)}`, background: 'rgba(12,11,62,.6)' });
        tx(d, label, { x: 20, y: 14, font: '700 30px/1 var(--display)', color: col });
        const bars = [0, 1, 2].map(k => { const b = h('div', 'a', d); css(b, { left: '20px', top: (68 + k * 24) + 'px', width: [300, 240, 270][k] + 'px', height: '7px', borderRadius: '4px', background: 'rgba(190,170,255,.3)' }); return b; });
        return { d, bars };
      };
      this.fA = mkFile(RX + 24, '데이터 모델 코드', C.cyan);
      this.fB = mkFile(RX + 426, '정의 문서', C.mint);
      // 한 번의 변경(두 파일을 함께 지나는 선)
      this.sweep = h('div', 'a', R); css(this.sweep, { top: (RY + 14) + 'px', height: '168px', width: '6px', borderRadius: '3px', background: 'var(--mint)', boxShadow: '0 0 20px rgba(115,245,198,.9)' });
      this.brace = s('path', { d: `M${RX + 40},${RY + RHh + 8} v10 H${RX + RW - 40} v-10 M${RX + RW / 2},${RY + RHh + 18} v10`, fill: 'none', stroke: C.mint, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, v);
      this.bL = this.brace.getTotalLength(); this.brace.style.strokeDasharray = this.bL;
      this.impl = tx(R, tag('하네스 구현', C.cyan) + `정의 문서는 스킬의 ${mono('references')} 폴더에, ${mono('SKILL.md')}에는 읽을 문서와 순서만`, { x: 980, y: 490, w: 820, font: '600 30px/1.42 var(--display)' });
      this.term = UI.term(R, 'revfactory/harness', '발표자가 만든 에이전트 팀 구성 플러그인(Claude Code용). 이 발표의 "하네스 구현"은 이 플러그인을 뜻한다', { top: 604, left: 120, width: 1680 });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt); V3.ruleHeadIn(this.RH, lt, 0.1);
      UI.rise(this.ev, lt, 1.7, { x: -20, y: 0, blur: 0 });
      UI.rise(this.cap, lt, 1.85, { y: 16, blur: 0 });
      const pr = prog(lt, 2.0, 0.45, ease.snap);
      sop(this.repo, pr); sop(this.fold, pr);
      [this.fA, this.fB].forEach((f, i) => UI.rise(f.d, lt, 2.1 + i * 0.12, { y: 20, blur: 0 }));
      // 한 변경이 두 파일을 함께 지나고, 지난 자리의 줄이 바뀐다
      const u = prog(lt, 2.55, 0.6, ease.inOutSine);
      const sx = lerp(1000, 1780, u);
      css(this.sweep, { left: sx.toFixed(1) + 'px', opacity: (prog(lt, 2.5, 0.08) * (1 - prog(lt, 3.15, 0.15))).toFixed(3) });
      [this.fA, this.fB].forEach((f, i) => {
        const fx = 1004 + i * 402;
        f.bars.forEach((b, k) => { const on = lt >= 2.55 && sx >= fx + 20 + k * 30; b.style.background = on ? 'rgba(115,245,198,.75)' : 'rgba(190,170,255,.3)'; });
      });
      this.brace.style.strokeDashoffset = (this.bL * (1 - prog(lt, 3.0, 0.35, ease.outCubic))).toFixed(1);
      const b90 = this.ev.querySelector('b:last-of-type');
      if (b90) { const g = prog(lt, 2.2, 0.5) * (1 - prog(lt, 2.8, 0.6)); b90.style.textShadow = g > 0.01 ? `0 0 ${(24 * g).toFixed(0)}px rgba(111,226,255,${(0.8 * g).toFixed(2)})` : 'none'; }
      UI.rise(this.ref, lt, 3.45, { x: -20, y: 0, blur: 0 });
      UI.rise(this.impl, lt, 4.25, { x: 24, y: 0, blur: 0 });
      UI.lineIn(this.term, lt, 4.6);
      UI.exit(this.R, lt, ctx);
    },
  });

  /* ───────── P20 · 규칙-폭: 카드마다 호출 점이 상한 칸을 한 칸씩 채우고, 5칸이 차면 산호색 테두리로 멈춘 뒤 다음 카드로 넘어간다 ───────── */
  DECK.slide({
    id: 'p20', stops: [1.4, 2.4, 5.5, 6.2], exit: 0.5, bg: Object.assign({}, DECK.BGP.split, { parts: 4 }),
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = hdr(R, '발표자 제안 · 참고 MCP 로드맵(2026-08-22) · Thumbtack(arXiv 2609.09182, 2026-08-28)');
      this.RH = V3.ruleHead(R, { n: 2, text: '테이블 목록부터 차례로 읽고/탐색 단계마다 도구 호출 *상한*을 둔다', w: 1680, size: 56 });
      this.ctx = UI.context(R, '발표자 제안. 직접 비교한 연구는 없다. 뒤에 볼 Thumbtack 사례에서는 실행의 16%가 도구 호출 한도를 다 썼다', { top: this.RH.bottom + 6 });
      const SX = [120, 549, 978, 1407], SW = 393, SY = 380, SH = 150, PS = 24, PG = 10;
      Object.assign(this, { SX, SW, SY, SH, PS, PG });
      const names = ['테이블 목록', '열 설명·계산식', '표본 몇 행', '전체 쿼리'];
      const grids = [[1, 4, 0.5], [3, 4, 0.75], [4, 3, 1], [7, 6, 1]];
      const v = svgRoot(R);
      this.arrows = [0, 1, 2].map(i => s('path', { d: `M${SX[i] + SW + 10},${SY + SH / 2 - 12} L${SX[i] + SW + 24},${SY + SH / 2} L${SX[i] + SW + 10},${SY + SH / 2 + 12}`, fill: 'none', stroke: C.line, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, v));
      this.st = names.map((t, i) => {
        const c = h('div', 'a', R);
        css(c, { left: SX[i] + 'px', top: SY + 'px', width: SW + 'px', height: SH + 'px', boxSizing: 'border-box', borderRadius: '18px', border: '2.5px solid rgba(190,170,255,.4)', background: 'rgba(22,18,96,.5)' });
        tx(c, `<span style="color:var(--cyan);margin-right:10px">${i + 1}단계</span>${t}`, { x: 22, y: 20, font: '800 30px/1.1 var(--display)' });
        const gv = s('svg', { width: 130, height: 64, viewBox: '0 0 130 76' }, c); css(gv, { position: 'absolute', right: '20px', bottom: '20px' });
        const [cols, rows, wf] = grids[i];
        const cw = (130 / 7) * wf, ch = 76 / 6;
        for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) s('rect', { x: k * (130 / 7), y: r * ch, width: (i === 0 ? 120 : cw - 3), height: ch - 3, rx: 2, fill: 'rgba(111,226,255,.55)' }, gv);
        const pips = Array.from({ length: 5 }, (_, k) => {
          const p = h('div', 'a', c); css(p, { left: (22 + k * (PS + PG)) + 'px', top: '98px', width: PS + 'px', height: PS + 'px', borderRadius: '6px', boxSizing: 'border-box', border: '2.5px solid var(--amber)', background: 'transparent' });
          return p;
        });
        return { c, gv, pips };
      });
      // 호출 점과 지나는 자리(카드마다 상한 칸 5개)
      this.dot = s('circle', { r: 8, fill: C.cyan }, v);
      this.T1 = 2.5; this.D = 0.75;
      const fx = [], fy = [];
      SX.forEach((x, i) => { for (let k = 0; k < 5; k++) { const te = this.T1 + i * this.D + k * 0.12; fx.push([te, x + 22 + k * (PS + PG) + PS / 2]); fy.push([te, SY + 98 + PS / 2]); } });
      fx.unshift([this.T1 - 0.25, SX[0] + 30]); fy.unshift([this.T1 - 0.25, SY + 60]);
      this.fx = fx.map((f, j) => j ? [f[0], f[1], ease.inOutCubic] : f); this.fy = fy.map((f, j) => j ? [f[0], f[1], ease.inOutCubic] : f);
      this.cap = h('div', 'a', R); css(this.cap, { left: '120px', top: '546px', display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' });
      for (let k = 0; k < 5; k++) { const p = h('i', '', this.cap); css(p, { display: 'block', width: '20px', height: '20px', borderRadius: '5px', boxSizing: 'border-box', border: '2.5px solid var(--amber)' }); }
      tx(this.cap, '상한 예: 5회(발표자 제안)', { x: 0, y: 0, css: { position: 'static', marginLeft: '8px' }, color: 'var(--amber)' });
      this.impl = tx(R, tag('하네스 구현', C.cyan) + '처음엔 스킬 이름과 한 줄 설명만 읽고, 필요한 스킬의 본문만 이어 읽는다', { x: 120, y: 602 });
    },
    render(lt, ctx) {
      const { SX, SY, T1, D } = this;
      UI.headerIn(this.hd, lt); V3.ruleHeadIn(this.RH, lt, 0.1); UI.lineIn(this.ctx, lt, 1.0);
      // 네 단이 왼쪽부터 놓인다
      this.st.forEach((k, i) => {
        const p = prog(lt, 1.45 + i * 0.18, 0.45, ease.snap);
        const full = lt >= T1 + i * D + 4 * 0.12 + 0.08;
        const active = lt >= T1 + i * D - 0.25 && !full;
        css(k.c, { opacity: p.toFixed(3), transform: `translateY(${((1 - p) * 22).toFixed(1)}px)`,
          borderColor: full ? 'rgba(255,122,138,.95)' : active ? 'rgba(111,226,255,.9)' : 'rgba(190,170,255,.4)',
          background: full ? 'rgba(255,122,138,.10)' : active ? 'rgba(111,226,255,.10)' : 'rgba(22,18,96,.5)' });
        sop(k.gv, prog(lt, 1.6 + i * 0.18, 0.3));
        k.pips.forEach((pp, j) => {
          const te = T1 + i * D + j * 0.12;
          const f = prog(lt, te, 0.1);
          pp.style.background = full ? 'rgba(255,122,138,.85)' : f > 0 ? `rgba(111,226,255,${(0.85 * f).toFixed(3)})` : 'transparent';
          pp.style.borderColor = full ? 'var(--coral)' : 'var(--amber)';
          pp.style.transform = `scale(${(1 + Math.sin(clamp(f) * Math.PI) * 0.25).toFixed(3)})`;
        });
        if (i < 3) sop(this.arrows[i], prog(lt, 1.7 + i * 0.18, 0.25));
      });
      // 호출 점: 칸에서 칸으로, 카드가 다 차면 다음 카드로
      const tEnd = T1 + 3 * D + 4 * 0.12;
      this.dot.setAttribute('cx', kf(lt, this.fx).toFixed(1)); this.dot.setAttribute('cy', (kf(lt, this.fy) - 18).toFixed(1));
      sop(this.dot, prog(lt, T1 - 0.3, 0.12) * (1 - prog(lt, tEnd + 0.05, 0.2)));
      UI.rise(this.cap, lt, 2.45, { x: -20, y: 0, blur: 0 });
      UI.rise(this.impl, lt, 5.55, { x: -30, y: 0, blur: 0 });
      UI.exit(this.R, lt, ctx);
    },
  });
})();
