/* scenes_v3_7.js — 섹션 7 정리 P47~P49 (스토리보드 v3). P50(질문)은 메인 관리라 만들지 않는다
 * p47 정리: 구성 도표 「설계 네 칸」이 섹션 순서(① → ② → ③ → ④)로 하나씩 켜지며 칸마다 결론 두 줄이 채워진다
 * p48·p49 참고 자료: 배포 PDF에서 찾아보는 정지 화면(두 열, y 648 아래까지 쓴다. 오른쪽 아래 쪽 번호 자리는 비운다)
 */
(function () {
  'use strict';
  const { clamp, lerp, prog, ease, h, css } = REEL;
  const f1 = v => v.toFixed(1), f3 = v => v.toFixed(3);
  function box(parent, html, o) { const e = h('div', 'a', parent, html); css(e, o || {}); return e; }
  function mix(a, b, p) { return a.map((v, i) => lerp(v, b[i], p)); }
  function rgba(c) { return `rgba(${c[0].toFixed(0)},${c[1].toFixed(0)},${c[2].toFixed(0)},${c[3].toFixed(3)})`; }

  const style = document.createElement('style');
  style.textContent = `
    .s7-ref > div { padding: 7px 0 8px; border-top: 1px solid rgba(190,170,255,.24); word-break: keep-all; }
    .s7-ref b { color: #f6f3ff; font-weight: 700; }
    .s7-ref .d { color: rgba(222,214,255,.66); white-space: nowrap; }
    .s7-ref .nw { white-space: nowrap; }
  `;
  document.head.appendChild(style);

  // ───────────────── P47 정리 · 설계 네 칸에 결론 채움 ─────────────────
  // 도입(P07)에서 이름만 있던 도표가 다시 그려진 뒤, 섹션 순서대로 한 칸씩 켜지고 결론 두 줄이 들어간다
  const P47_ON = [1.55, 2.65, 3.75, 4.85];
  DECK.slide({
    id: 'p47', stops: [1.4, 2.5, 3.6, 4.7, 6.0], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, { sec: '07', name: '정리', src: '발표자 제안(revfactory/harness 2.1.0 기준)' });
      this.T = UI.title(R, '에이전트가 데이터 작업을 맡을 때/결과에 영향을 준 것은 *LLM 바깥의 네 가지*였다', { top: 128, size: 64 });
      // 칸 결론 세 줄(28px, 줄 간격 1.35). ④ 띠는 가로로 길어 한 줄로 둔다. 칸 높이 196: 마지막 줄과 칸 아래 테두리 사이 약 20px
      this.F = V3.frame(R, {
        x: 120, y: 294, w: 1680, active: -1, cellH: 196, bandH: 64, vgap: 20, fillSize: 28,
        fills: ['사람이 쓰고<br>데이터 모델과 함께 고친다.<br>목록부터 차례로 읽는다', '늘 같은 단계는 코드,<br>집계는 DB·시맨틱 레이어', '단일 에이전트와 먼저 비교,<br>정해진 단계는 코드,<br>작업은 데이터 단위', '평가 질문 먼저, 답과 기록을 함께 채점, 여러 번 돌린다'],
      });
      this.F.fl.slice(0, 3).forEach(e => { e.style.lineHeight = '1.35'; });
      this.m = UI.meaning(R, '→ LLM을 바꾸지 않고 적용한다', { top: 596, size: 30 });
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      UI.titleIn(this.T, lt, 0.1);
      // ① 네 칸이 꺼진 상태로 그려진다. 결론 글은 칸이 켜지는 시각에 맞춰 나온다
      V3.frameIn(this.F, lt, 0.35, { fillAt: P47_ON[0] + 0.1 - 0.35, fillEach: 1.1 });
      this.F.parts.forEach((p, i) => {
        const q = prog(lt, P47_ON[i], 0.45, ease.snap);
        const bump = prog(lt, P47_ON[i], 0.18, ease.outCubic) * (1 - prog(lt, P47_ON[i] + 0.18, 0.45, ease.inOutCubic));
        if (i < 3) {
          p.style.borderColor = rgba(mix([190, 170, 255, 0.34], [111, 226, 255, 0.95], q));
          p.style.background = rgba(mix([22, 18, 96, 0.48], [111, 226, 255, 0.15], q));
          p.style.boxShadow = q > 0 ? `0 0 ${f1(20 + 30 * bump)}px rgba(111,226,255,${f3(0.18 * q + 0.22 * bump)})` : 'none';
          if (lt > 1.2) p.style.transform = `scale(${(1 + 0.022 * bump).toFixed(4)})`;
        } else {
          p.style.borderColor = rgba(mix([115, 245, 198, 0.42], [115, 245, 198, 0.98], q));
          p.style.background = rgba(mix([16, 60, 70, 0.30], [115, 245, 198, 0.16], q));
          p.style.boxShadow = q > 0 ? `0 0 ${f1(20 + 30 * bump)}px rgba(115,245,198,${f3(0.18 * q + 0.22 * bump)})` : 'none';
        }
      });
      UI.lineIn(this.m, lt, 5.4);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────────────── P48·P49 참고 자료 ─────────────────
  const BG_LIST = Object.assign({}, DECK.BGP.text, { streaks: 0.25, dim: 0.55 });
  function fmtRef(t) {
    return t
      .replace(/^(.+?)( · )/, '<b>$1</b>$2')
      .replace(/(\d{4}-\d{2}-\d{2}(?:\/\d{2})?)/g, '<span class="d">$1</span>')
      .replace(/(arXiv \d{4}\.\d{5})/g, '<span class="nw">$1</span>');
  }
  // 제목 끝의 쪽 표시 "(1/2)"를 작고 흐리게 붙인다(제목과 같은 등장 움직임)
  function titleTail(T, text) {
    const L = T.lines[T.lines.length - 1];
    L.el.appendChild(document.createTextNode(' '));
    for (const ch of [...text]) {
      const m = h('span', '', L.el);
      m.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding:.10em .02em .16em;margin:-.10em -.02em -.16em';
      const c = h('span', '', m, ch);
      css(c, { display: 'inline-block', fontSize: '.62em', color: 'rgba(222,214,255,.6)', verticalAlign: 'baseline' });
      L.chars.push(c); T.chars.push(c);
    }
  }
  function refs(o) {
    DECK.slide({
      id: o.id, stops: [1.4], exit: 0.5, bg: BG_LIST,
      setup(el) {
        const R = this.R = UI.root(el);
        this.hd = UI.header(R, { sec: '07', name: '정리' });
        this.T = UI.title(R, '이 발표의 근거는 2026년 6월 이후/공개된 다음 자료에서 가져왔다', { top: 140, size: 64 });
        titleTail(this.T, o.page);
        this.wrap = box(R, '', { left: '120px', top: '324px', width: '1680px', font: '500 24px/1.36 Pretendard', color: 'rgba(238,232,255,.88)', letterSpacing: '-.005em' });
        const grid = h('div', '', this.wrap);
        css(grid, { display: 'grid', gridTemplateColumns: '816px 816px', columnGap: '48px', alignItems: 'start' });
        this.items = [];
        [o.left, o.right].forEach(list => {
          const col = h('div', 's7-ref', grid);
          list.forEach(t => this.items.push(h('div', '', col, fmtRef(t))));
        });
        if (o.foot) {
          const f = h('div', 's7-ref', this.wrap, `<div>${o.foot.replace(/^([^:]+:)/, '<b>$1</b>')}</div>`);
          css(f, { marginTop: '12px' });
          this.items.push(f);
        }
      },
      render(lt, ctx) {
        UI.headerIn(this.hd, lt);
        UI.titleIn(this.T, lt, 0.05, { each: 0.02, dur: 0.5 });
        this.items.forEach((e, i) => {
          const p = prog(lt, 0.35 + i * 0.04, 0.45, ease.snap);
          css(e, { opacity: f3(p), transform: `translateY(${f1((1 - p) * 10)}px)` });
        });
        UI.exit(this.R, lt, ctx);
      },
    });
  }
  refs({
    id: 'p48', page: '(1/2)',
    left: [
      'Anthropic 데이터팀 · How Anthropic enables self-service data analytics with Claude · 2026-06-03',
      'KPMG International · Global AI Pulse Q2 2026 · 2026-06-24',
      "Sethuraman·Asokan(ZS Associates) · Why We Killed Our Multi-Agent Pipeline · AI Engineer World's Fair · 2026-07-02",
      "Sait Izmit(Snowflake) · Building GTM AI Agents: Lessons from Deploying to 6,000 Users · AI Engineer World's Fair · 2026-07-02",
      'Majeed 외(NYU 아부다비) · An Empirical Study of MCP Applications · arXiv 2607.25635 · 2026-07-28',
      'Zhu·Pu(East China Normal University) · TelemetrySuffBench · arXiv 2608.07899 · 2026-08-08',
    ],
    right: [
      'Manoj 외(Rakuten India) · A Multi-Agent Platform for Automated Enterprise Analytics and Insight Generation · arXiv 2608.18740 · 2026-08-19',
      'The Modern Data Company 설문(Business Wire·IT Brief) · 2026-08-19/20',
      'MCP 공식 블로그(Soria Parra·Delimarsky) · The New MCP Roadmap · 2026-08-22',
      'Kolli 외(Thumbtack) · Evaluating Enterprise Analytics Agents: An End-to-End, Trace-Backed Methodology · arXiv 2609.09182 · 2026-08-28',
      'Necula(Alexandru Ioan Cuza University) · Can Coding Agents Reproduce Official Statistics? · arXiv 2609.22222 · 2026-09-02',
    ],
  });
  refs({
    id: 'p49', page: '(2/2)',
    left: [
      '데브시스터즈(박현기) · 쿼리가 아니라 정의를 고치기로 했습니다: Databricks Metric View 도입기 · 2026-09-18',
      'KPMG US · Q3 2026 AI Pulse Survey · 2026-09-24',
      'Sehanobish 외(Kensho) · From Benchmarks to Production: A Text-to-SQL System for Complex Financial Data · arXiv 2610.03524 · 2026-10-02',
      '웹케시 발표(ZDNet Korea, 남혁우) · 2026-10-07',
      'Bansal 외(Thomson Reuters) · A Strong Harness Narrows the Model Gap · arXiv 2610.19999 · 2026-10-14',
      'Sourati 외(Oracle AI·USC) · Same Context, Different Agents · arXiv 2610.20959 · 2026-10-14',
    ],
    right: [
      'dbt Developer Blog(Lin·Noonan·Ferguson) · Inside the dbt Wizard harness · 2026-10-14',
      '토스(김문수) · 실행은 도메인별로, 문맥은 한 레포에 · 2026-10-16',
      'CJ올리브영 사례(AWS 기술 블로그) · CJ올리브영의 AI 기반 운영 이슈 분석과 일일 점검 자동화 · 2026-10-16',
      'Zettl·Gosmar · The Coordination Tax · arXiv 2610.37700 · 2026-10-25',
      'dbt Developer Blog(Alex Noonan) · Do coding agents still need dbt skills? · 2026-10-30',
    ],
    foot: '발표자 자료: revfactory/harness 2.1.0(2026-09-26)',
  });
})();
