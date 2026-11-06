/* scenes_main.js — 메인이 만드는 장: 스타일 프레임, 표지, 발표자 소개, 마지막 장 */
(function () {
  'use strict';
  const { clamp, lerp, prog, stagger, ease, h, s, css, spring, rand, noise, kf } = REEL;

  // ───────── sf1 표지 ─────────
  // 주최·주관 로고 묶음: 배경을 뺀 로고(COSS는 흰 부분을 비운 반전형, 숙명은 검정 → 흰색 반전형)를 보라색 배경 위에 바로 놓는다
  function credits(R, o) {
    const box = h('div', 'a', R);
    css(box, Object.assign({ top: '50px', height: '84px', display: 'flex', alignItems: 'center', gap: '0px' }, o));
    const item = (lab, src, hgt) => {
      const g = h('div', '', box); css(g, { display: 'flex', alignItems: 'center', gap: '18px' });
      const l = h('span', '', g, lab); css(l, { font: '600 24px/1 Pretendard', color: 'var(--dim)', letterSpacing: '.02em' });
      const im = REEL.img(src); g.appendChild(im); css(im, { height: hgt + 'px', width: 'auto', display: 'block' });
      return g;
    };
    const a = item('주최', '../assets/img/logo_coss_t.png', 80);
    const bar = h('div', '', box); css(bar, { width: '1.5px', height: '56px', margin: '0 34px', background: 'rgba(222,214,255,.32)' });
    const b = item('주관', '../assets/img/logo_sookmyung_w.png', 54);
    return { box, parts: [a, bar, b] };
  }
  DECK.slide({
    id: 'p01', stops: [3.2], exit: 0.6,
    bg: { yc: 930, amp: 130, spread: 300, k: 1.1, k2: 0.75, alpha: 1, glow: 0.8, tilt: -0.24 },
    setup(el) {
      const R = this.R = UI.root(el);
      this.ev = h('div', 'a', R, '2026 AI·빅데이터 인사이트 컨퍼런스');
      css(this.ev, { left: '120px', top: '78px', font: '600 30px/1 Pretendard', color: 'var(--ink2)', letterSpacing: '-.01em' });
      this.ag = UI.chip(R, '<b style="font:700 22px JetBrains Mono;color:#6fe2ff">AGENDA 02</b> 플랫폼', { x: 650, y: 66, size: 24 });
      this.cr = credits(R, { right: '120px' });
      this.T = UI.title(R, 'AI 에이전트로/*다시 설계하는* 빅데이터 활용', { top: 178, size: 118, weight: 900 });
      this.T.el.style.lineHeight = '1.12';
      this.sub = h('div', 'a', R, '데이터 정의·계산 위치·나누는 방식을 설계하고, 실행 기록으로 검증한다');
      css(this.sub, { left: '124px', top: '472px', font: '500 33px/1.3 Pretendard', color: 'var(--ink2)', letterSpacing: '-.02em' });
      this.when = h('div', 'a', R, '2026. 11. 6.(금) 15:00 · 포포인츠 바이 쉐라톤 조선 서울역 20층');
      css(this.when, { left: '124px', top: '540px', font: '500 26px/1 Pretendard', color: 'var(--dim)' });
      this.who = h('div', 'a', R, '<div style="font:800 54px/1 Pretendard;letter-spacing:-.03em">황민호</div><div style="margin-top:14px;font:500 28px/1.35 Pretendard;color:var(--ink2)">카카오 AI Studio FDE 수석<br>『하네스 엔지니어링 with 클로드 코드』 저자</div>');
      css(this.who, { right: '120px', top: '466px', textAlign: 'right' });
      // 등장 빛 쓸기(대각선)
      this.sweep = h('div', 'full', el);
      css(this.sweep, { background: 'linear-gradient(115deg, rgba(5,4,28,0) 0%, rgba(5,4,28,0) 40%, rgba(255,140,250,.5) 46%, rgba(5,4,28,1) 54%, rgba(5,4,28,1) 100%)', backgroundSize: '300% 100%' });
    },
    render(lt, ctx) {
      const sw = prog(lt, 0, 1.3, ease.inOutCubic);
      css(this.sweep, { backgroundPosition: `${lerp(100, 0, sw)}% 0`, opacity: (1 - prog(lt, 1.15, 0.3)).toFixed(3) });
      UI.rise(this.ev, lt, 0.5, { y: -16 });
      UI.pop(this.ag, lt, 0.75);
      this.cr.parts.forEach((b, i) => UI.rise(b, lt, 0.9 + i * 0.1, { y: -18 }));
      UI.titleIn(this.T, lt, 0.55, { each: 0.034, dur: 0.75, lineGap: 0.2 });
      UI.rise(this.sub, lt, 1.75, { y: 24 });
      UI.rise(this.who, lt, 2.0, { x: 40, y: 0 });
      UI.rise(this.when, lt, 2.25, { y: 16 });
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P02 발표자 소개: 기존 발표(2026-10-08) 2쪽 이미지의 내용을 덱 형식으로 다시 정리 ─────────
  DECK.slide({
    id: 'p02', stops: [3.4], exit: 0.5,
    bg: { yc: 905, amp: 90, spread: 200, alpha: 0.75, dim: 0.25 },
    setup(el) {
      const R = this.R = UI.root(el);
      // 왼쪽: 이름 · 한 줄 소개 · 인용
      this.tag = h('div', 'a', R, 'PRESENTER');
      css(this.tag, { left: '122px', top: '64px', font: '700 24px/1 JetBrains Mono', letterSpacing: '.32em', color: 'var(--cyan)' });
      this.T = UI.title(R, '황민호', { top: 104, size: 112 });
      this.id = h('div', 'a', R, 'robin.hwang');
      css(this.id, { left: '476px', top: '168px', font: '500 34px/1 JetBrains Mono', color: 'var(--dim)' });
      this.role = h('div', 'a', R, 'AI가 일할 환경을 설계하는 사람');
      css(this.role, { left: '122px', top: '250px', font: '600 36px/1 Pretendard', letterSpacing: '-.02em', color: 'var(--ink)' });
      this.qm = h('div', 'a', R, '“');
      css(this.qm, { left: '112px', top: '300px', font: '900 120px/1 Pretendard', color: 'var(--violet)' });
      this.q = ['프롬프트가 아니라,', '<span class="qhl">시스템</span>을 만듭니다.'].map((tx, i) => {
        const d = h('div', 'a', R, tx);
        css(d, { left: '190px', top: (322 + i * 62) + 'px', font: '800 46px/1.2 Pretendard', letterSpacing: '-.03em', color: 'var(--ink)', whiteSpace: 'nowrap' });
        return d;
      });
      const hl = this.q[1].querySelector('.qhl'); css(hl, { color: 'var(--cyan)', position: 'relative', display: 'inline-block' });
      this.ul = h('span', '', hl); css(this.ul, { position: 'absolute', left: '0', right: '0', bottom: '-4px', height: '4px', borderRadius: '2px', background: 'var(--cyan)', transformOrigin: '0 50%' });

      // 오른쪽: 주요 활동 5개(아이콘 선 그리기)
      this.actHd = h('div', 'a', R, '주요 활동');
      css(this.actHd, { left: '980px', top: '60px', font: '700 28px/1 Pretendard', color: 'var(--cyan)' });
      this.actLine = h('div', 'a', R); css(this.actLine, { left: '1110px', top: '74px', width: '690px', height: '2px', background: 'linear-gradient(90deg, rgba(111,226,255,.6), rgba(111,226,255,0))', transformOrigin: '0 50%' });
      const ICON = {
        book: 'M5 9h11a4 4 0 0 1 4 4v20a3 3 0 0 0-3-3H5zM35 9H24a4 4 0 0 0-4 4v20a3 3 0 0 1 3-3h12z',
        people: 'M14 16a5 5 0 1 0 0-.01M27 16a5 5 0 1 0 0-.01M4 33a10 9 0 0 1 20 0M17 33a10 9 0 0 1 20 0',
        code: 'M13 11l-9 9 9 9M27 11l9 9-9 9M23 7l-6 26',
        doc: 'M9 4h15l8 8v24H9zM24 4v8h8M14 19h13M14 25h13M14 31h8',
        bulb: 'M20 5a10 10 0 0 1 6 18v5H14v-5A10 10 0 0 1 20 5zM15 32h10M16 36h8',
      };
      const acts = [
        ['book', '저서', '『하네스 엔지니어링 with 클로드 코드』', '한빛미디어 · 2026'],
        ['people', '교육·강연', '카카오 그룹 · 대학 · 정부 · 기업', 'AI 실습형 강의 다수'],
        ['code', '오픈소스', 'revfactory/harness', null],
        ['doc', '연구·리서치', '멀티에이전트 · AI 정책 · Frontier 모델 분석', null],
        ['bulb', '커뮤니티', 'today-ai-news', '평일 08~20시 매 2시간 갱신'],
      ];
      // 줄마다 본문 줄의 top(MY). 본문과 아래 줄 사이 47px(보이는 간격 14px 이상), 항목 사이 보이는 간격 18px 이상
      const MY = [102, 191, 284, 334, 384];
      this.acts = acts.map(([ic, lab, main, sub], i) => {
        const y = MY[i] - (sub ? 2 : 15);
        const row = h('div', 'a', R); css(row, { left: '980px', top: y + 'px', width: '820px', height: sub ? '76px' : '64px' });
        const sv = s('svg', { width: 40, height: 40, viewBox: '0 0 40 40' }, row);
        css(sv, { position: 'absolute', left: '0', top: '12px', overflow: 'visible' });
        const p = s('path', { d: ICON[ic], fill: 'none', stroke: '#6fe2ff', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, sv);
        const l = h('div', 'a', row, lab); css(l, { left: '60px', top: sub ? '6px' : '18px', font: '700 28px/1 Pretendard', color: 'var(--ink2)' });
        const m = h('div', 'a', row, main); css(m, { left: '230px', top: sub ? '2px' : '15px', font: `${ic === 'code' ? '600 30px/1 JetBrains Mono' : '600 30px/1.15 Pretendard'}`, color: 'var(--ink)', whiteSpace: 'nowrap', letterSpacing: '-.01em' });
        let star = null;
        if (ic === 'code') { star = h('div', 'a', row, ''); css(star, { left: '590px', top: '13px', font: '800 32px/1 Pretendard', color: 'var(--amber)', whiteSpace: 'nowrap' }); }
        if (sub) { const sb = h('div', 'a', row, sub); css(sb, { left: '230px', top: '49px', font: '500 26px/1 Pretendard', color: 'var(--dim)', whiteSpace: 'nowrap' }); }
        return { row, p, star };
      });

      // 아래: 주요 경력 타임라인
      this.carHd = h('div', 'a', R, '주요 경력');
      css(this.carHd, { left: '122px', top: '520px', font: '700 28px/1 Pretendard', color: 'var(--cyan)' });
      this.tl = h('div', 'a', R); css(this.tl, { left: '290px', top: '533px', width: '1510px', height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg, rgba(190,170,255,.35), rgba(111,226,255,.9))', transformOrigin: '0 50%' });
      const car = [
        ['2009', 'WIPRO', '자동 SQL DBMS 테스트'],
        ['2010', 'KISTI', '문장 패턴분석 · 온톨로지'],
        ['2013', 'DAUM', '클라우드 서비스 · 검색'],
        ['현재', 'KAKAO', '광고 · OLIVE · AI Studio'],
      ];
      this.xs = [330, 700, 1070, 1440];
      this.car = car.map(([yr, org, desc], i) => {
        const x = this.xs[i], now = i === 3;
        const dot = h('div', 'a', R); css(dot, { left: (x - 11) + 'px', top: '523px', width: '22px', height: '22px', borderRadius: '50%', background: now ? 'var(--cyan)' : '#2a2580', border: `3px solid ${now ? '#c8f6ff' : 'rgba(190,170,255,.8)'}`, boxSizing: 'border-box', boxShadow: now ? '0 0 24px rgba(111,226,255,.8)' : 'none' });
        const ring = now ? h('div', 'a', R) : null;
        if (ring) css(ring, { left: (x - 11) + 'px', top: '523px', width: '22px', height: '22px', borderRadius: '50%', border: '2px solid var(--cyan)', boxSizing: 'border-box', opacity: '0' });
        const y = h('div', 'a', R, yr); css(y, { left: (x - 2) + 'px', top: '480px', font: `700 30px/1 ${now ? 'Pretendard' : 'JetBrains Mono'}`, color: now ? 'var(--cyan)' : 'var(--dim)' });
        const o = h('div', 'a', R, now ? `${org}<span style="margin-left:14px;padding:4px 12px 5px;border-radius:999px;border:1.5px solid rgba(111,226,255,.6);background:rgba(111,226,255,.14);font:600 24px/1 Pretendard;vertical-align:4px">AI Studio FDE 수석</span>` : org);
        css(o, { left: (x - 2) + 'px', top: '559px', font: '800 32px/1 Pretendard', letterSpacing: '.01em', color: now ? 'var(--ink)' : 'var(--ink2)', whiteSpace: 'nowrap' });
        const d = h('div', 'a', R, desc); css(d, { left: (x - 2) + 'px', top: '607px', font: '500 28px/1 Pretendard', color: 'var(--ink2)', whiteSpace: 'nowrap' });
        return { dot, ring, y, o, d, x };
      });
    },
    render(lt, ctx) {
      UI.rise(this.tag, lt, 0.05, { y: -12, blur: 0 });
      UI.titleIn(this.T, lt, 0.15, { each: 0.09, dur: 0.7 });
      const sp = prog(lt, 0.55, 0.7);
      this.id.textContent = REEL.scramble('robin.hwang', sp, lt, 7);
      css(this.id, { opacity: Math.min(1, sp * 4).toFixed(3) });
      UI.rise(this.role, lt, 0.7, { y: 20 });
      UI.rise(this.qm, lt, 0.95, { y: 30, from: 0.6 });
      this.q.forEach((d, i) => UI.rise(d, lt, 1.05 + i * 0.16, { y: 26 }));
      css(this.ul, { transform: `scaleX(${prog(lt, 1.55, 0.45, ease.swift).toFixed(4)})` });
      // 주요 활동
      UI.rise(this.actHd, lt, 0.8, { x: -20, y: 0 });
      css(this.actLine, { transform: `scaleX(${prog(lt, 0.9, 0.7, ease.swift).toFixed(4)})` });
      this.acts.forEach((a, i) => {
        const t0 = 1.0 + i * 0.17;
        a.p.setAttribute('stroke-dashoffset', (1 - prog(lt, t0, 0.6, ease.inOutCubic)).toFixed(4));
        UI.rise(a.row, lt, t0 + 0.05, { x: 30, y: 0 });
        if (a.star) {
          const c = prog(lt, t0 + 0.3, 0.9, ease.outQuart);
          a.star.textContent = '★ ' + (9.3 * c).toFixed(1) + 'k';  // 발표자 지정 값(2026-11-04): GitHub 스타 9.3k
          css(a.star, { opacity: Math.min(1, c * 5).toFixed(3) });
        }
      });
      // 경력 타임라인: 선이 그어지며 지점이 차례로 켜진다
      const lp = prog(lt, 1.7, 1.1, ease.inOutCubic);
      css(this.tl, { transform: `scaleX(${lp.toFixed(4)})` });
      UI.rise(this.carHd, lt, 1.6, { x: -20, y: 0 });
      this.car.forEach((c, i) => {
        const reach = 1.7 + 1.1 * ((c.x - 290) / 1510) * 0.9;
        UI.pop(c.dot, lt, reach, { from: 0.2 });
        UI.rise(c.y, lt, reach + 0.05, { y: 12 });
        UI.rise(c.o, lt, reach + 0.1, { y: -14 });
        UI.rise(c.d, lt, reach + 0.18, { y: -10 });
        if (c.ring) {   // 현재 지점: 멈춘 동안에도 고리가 천천히 퍼진다
          const a = DECK.amb(ctx.t) - ctx.t + lt;
          const ph = lt < reach + 0.3 ? 0 : ((a - reach - 0.3) % 1.8) / 1.8;
          css(c.ring, { opacity: (lt < reach + 0.3 ? 0 : 0.8 * (1 - ph)).toFixed(3), transform: `scale(${(1 + ph * 1.8).toFixed(3)})` });
        }
      });
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P80 마무리: 질문을 받겠습니다 ─────────
  DECK.slide({
    id: 'p80', stops: [2.6], exit: 0.6,
    bg: { yc: 930, amp: 130, spread: 300, k: 1.1, k2: 0.75, alpha: 1, glow: 0.8, tilt: -0.24 },
    setup(el) {
      const R = this.R = UI.root(el);
      this.T = UI.title(R, '질문을 *받겠습니다*', { top: 250, size: 150, weight: 900 });
      this.gh = h('div', 'a', R, '<span style="font:600 26px JetBrains Mono;color:var(--cyan)">github.com/</span><span style="font:700 40px JetBrains Mono">revfactory/harness</span>');
      css(this.gh, { left: '126px', top: '470px' });
      this.who = h('div', 'a', R, '<div style="font:800 54px/1 Pretendard;letter-spacing:-.03em">황민호</div>');
      css(this.who, { right: '120px', top: '476px', textAlign: 'right' });
      this.cr = credits(R, { left: '120px' });
      this.ev = h('div', 'a', R, '2026 AI·빅데이터 인사이트 컨퍼런스 · Agenda 02');
      css(this.ev, { right: '120px', top: '78px', font: '600 28px/1 Pretendard', color: 'var(--ink2)' });
      this.line = h('div', 'a', R); css(this.line, { left: '126px', top: '440px', width: '1670px', height: '2px', background: 'linear-gradient(90deg, var(--cyan), rgba(111,226,255,0))', transformOrigin: '0 50%' });
    },
    render(lt, ctx) {
      this.cr.parts.forEach((b, i) => UI.rise(b, lt, 0.2 + i * 0.1, { y: -18 }));
      UI.rise(this.ev, lt, 0.45, { y: -14 });
      UI.titleIn(this.T, lt, 0.4, { each: 0.05, dur: 0.8 });
      css(this.line, { transform: `scaleX(${prog(lt, 1.2, 0.9, ease.swift).toFixed(4)})` });
      UI.rise(this.gh, lt, 1.5, { x: -30, y: 0 });
      UI.rise(this.who, lt, 1.75, { x: 30, y: 0 });
      UI.exit(this.R, lt, ctx);
    },
  });
})();
