/* scenes_v3_8.js — 질문 장(P50) 뒤 부록 P51~P58 (2026-11-06 발표자 요청으로 추가)
 * p51 harness GitHub 소개, p52~p58 YouTube 영상 장(발표자 채널 Robin)
 * 영상 장 동작
 *   - 렌더 모드(스틸·PDF): 로컬 썸네일(../assets/img/yt/{id}.jpg)만 보인다
 *   - 발표 모드(?deck=1, http·https): 그 장이 현재 장일 때만 YouTube 플레이어(iframe)를 붙이고, 다른 장으로 가면 지운다(소리가 남지 않도록)
 *   - 발표 모드(file://): 플레이어가 오류 153을 내므로 썸네일 클릭·V 키로 YouTube 새 탭을 연다
 *   - 영상을 눌러 재생한 뒤에도 키보드·클리커로 장을 넘길 수 있도록, 포커스가 플레이어로 가면 덱으로 되돌린다
 *   - V 키: 현재 장 영상 재생·일시정지(YouTube iframe API 메시지)
 *   - 영상 아래 주소를 누르면 YouTube 새 탭으로 연다(파일로 연 덱에서 플레이어가 막힐 때 쓰는 대안)
 */
(function () {
  'use strict';
  const { h, css } = REEL;
  const DECK_MODE = new URLSearchParams(location.search).has('deck');
  const box = (parent, html, st) => { const e = h('div', 'a', parent, html); css(e, st || {}); return e; };
  const SEC = { sec: '08', name: '부록' };

  // ───────── P51 harness GitHub 소개 ─────────
  DECK.slide({
    id: 'p51', stops: [1.4, 2.4, 3.4], exit: 0.5, bg: DECK.BGP.calm,
    setup(el) {
      const R = this.R = UI.root(el);
      this.hd = UI.header(R, Object.assign({}, SEC, { src: 'github.com/revfactory/harness · README(v2.1.0)·GitHub API · 2026-11-06 기준' }));
      this.T = UI.title(R, '하네스는 한 문장 요청으로/*에이전트 팀과 스킬*을 만드는 Claude Code 플러그인이다', { top: 128, size: 64 });
      this.c = UI.context(R, 'revfactory/harness · 스타 9,328 · 포크 1,341 · 팀 구조 6가지 · 실행 방식 3가지 · 버전 2.1.0 · Apache-2.0 (2026-11-06 GitHub 기준)', { top: 286 });

      const CT = 350, CH = 290;
      const card = (x, w, title) => {
        const o = {};
        o.box = box(R, '', { left: x + 'px', top: CT + 'px', width: w + 'px', height: CH + 'px', boxSizing: 'border-box', borderRadius: '20px',
          background: 'rgba(22,18,96,.55)', border: '1.5px solid rgba(190,170,255,.35)' });
        o.head = box(R, title, { left: (x + 30) + 'px', top: (CT + 22) + 'px', font: '700 30px/1.2 Pretendard', color: 'var(--ink)', letterSpacing: '-.015em', whiteSpace: 'nowrap' });
        return o;
      };
      const ARROW = (x) => box(R, '→', { left: x + 'px', top: (CT + CH / 2 - 24) + 'px', width: '60px', textAlign: 'center', font: '700 40px/1 Pretendard', color: 'var(--cyan)' });

      // ① 입력 한 문장
      this.c1 = card(120, 400, '입력 한 문장');
      this.c1.body = box(R,
        '<div style="font:800 44px/1.2 Pretendard;color:var(--cyan);letter-spacing:-.02em">하네스 구성해줘</div>' +
        '<div style="margin-top:22px;font:600 28px/1.4 Pretendard;color:var(--ink2);letter-spacing:-.012em">분야를 설명하면<br>그 분야의 에이전트 팀과<br>스킬로 바꾼다</div>',
        { left: '150px', top: (CT + 84) + 'px', width: '340px' });
      this.a1 = ARROW(520);
      // ② 설계 단계
      this.c2 = card(580, 520, '설계 단계');
      const steps = ['① 도메인 분석', '② 팀 구조·실행 방식 설계', '③ 에이전트 정의·스킬 생성', '④ 오케스트레이션·검증', '⑤ 사용 후 회고 <span style="font-family:var(--mono);color:var(--cyan)">/harness:evolve</span>'];
      this.c2.rows = steps.map((t, i) => box(R, t, { left: '610px', top: (CT + 74 + i * 44) + 'px', font: '600 28px/1.3 Pretendard', color: 'var(--ink2)', letterSpacing: '-.012em', whiteSpace: 'nowrap' }));
      this.a2 = ARROW(1100);
      // ③ 만드는 파일
      this.c3 = card(1160, 640, '만드는 파일');
      const files = [['.claude/agents/', '에이전트 정의(누가)'], ['.claude/skills/', '스킬과 실행 순서'], ['CLAUDE.md', '호출 규칙·변경 이력']];
      this.c3.rows = files.map(([p, d], i) => box(R,
        `<span style="font:600 28px/1.3 var(--mono);color:var(--cyan)">${p}</span><span style="font:600 28px/1.3 Pretendard;color:var(--ink2);letter-spacing:-.012em">${d}</span>`,
        { left: '1190px', top: (CT + 84 + i * 62) + 'px', width: '580px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', whiteSpace: 'nowrap' }));
    },
    render(lt, ctx) {
      UI.headerIn(this.hd, lt);
      UI.titleIn(this.T, lt, 0.1, { each: 0.016 });
      UI.lineIn(this.c, lt, 0.9);
      const show = (o, t0, parts) => {
        UI.rise(o.box, lt, t0, { y: 24, blur: 0 });
        UI.lineIn(o.head, lt, t0 + 0.1);
        parts.forEach((p, i) => UI.rise(p, lt, t0 + 0.25 + i * 0.1, { x: 16, y: 0 }));
      };
      show(this.c1, 1.0, [this.c1.body]);
      UI.rise(this.a1, lt, 1.5, { x: -14, y: 0, blur: 0 });
      show(this.c2, 1.55, this.c2.rows);
      UI.rise(this.a2, lt, 2.5, { x: -14, y: 0, blur: 0 });
      show(this.c3, 2.55, this.c3.rows);
      UI.exit(this.R, lt, ctx);
    },
  });

  // ───────── P52~P58 영상 장 ─────────
  const VIDEOS = [
    { id: 'p52', vid: 'jZc5uUHXXaE', start: 110, title: '바이브 코딩은 *언제?*', yt: 'KAIST CAIO 과정 11기 : 하네스엔지니어링 2회차 실습' },
    { id: 'p53', vid: 'jZc5uUHXXaE', start: 560, title: '클로드 코드의/*에이전트*', yt: 'KAIST CAIO 과정 11기 : 하네스엔지니어링 2회차 실습' },
    { id: 'p54', vid: 'okXQATdnMRw', start: 0, title: '*특허 하네스* 소개', yt: '특허 하네스 소개' },
    { id: 'p55', vid: 'L4mgDfWdd4Y', start: 0, title: '*드라마 극본* 하네스', yt: '드라마 극본 하네스' },
    { id: 'p56', vid: 'N9pLuDpQavA', start: 0, title: '*언리얼 아이돌* 티저', yt: '언리얼 아이돌 (Unreal idol) teaser' },
    { id: 'p57', vid: '2ig06B9xw9Q', start: 0, title: 'AI로 하는 UX 개선/*키오스크*', yt: 'AI로 개선하는 UX' },
    { id: 'p58', vid: 'lzsA2_9lUeE', start: 0, title: 'AI로 하는 UX 개선/*지하철 전광판*', yt: '지하철 안내판 UX 개선' },
  ];
  const fmt = s => s > 0 ? `${Math.floor(s / 60)}분 ${s % 60 ? (s % 60) + '초' : ''}`.trim() + '부터 재생' : '처음부터 재생';
  const watchUrl = v => `https://www.youtube.com/watch?v=${v.vid}${v.start ? '&t=' + v.start + 's' : ''}`;
  const shortUrl = v => `youtu.be/${v.vid}${v.start ? '?t=' + v.start : ''}`;
  const PLAY = '<svg width="120" height="84" viewBox="0 0 120 84"><rect width="120" height="84" rx="20" fill="rgba(255,0,0,.88)"/><path d="M48 24 L82 42 L48 60 Z" fill="#fff"/></svg>';
  const players = {};   // id → { frame, ifr, v }

  VIDEOS.forEach(v => {
    DECK.slide({
      id: v.id, stops: [1.2], exit: 0.4, bg: DECK.BGP.calm,
      setup(el) {
        const R = this.R = UI.root(el);
        this.hd = UI.header(R, Object.assign({}, SEC, { name: '부록 · 영상', src: `YouTube · Robin 채널 · ${v.yt}` }));
        // 왼쪽 영상 칸(x 120~920, y 196~646): 읽을 내용은 y 648 위
        this.frame = box(R, '', { left: '120px', top: '196px', width: '800px', height: '450px', borderRadius: '18px', overflow: 'hidden', background: '#000',
          border: '1.5px solid rgba(190,170,255,.45)', boxShadow: '0 30px 80px rgba(4,2,40,.5)' });
        this.thumb = h('img', '', this.frame);
        this.thumb.src = `../assets/img/yt/${v.vid}.jpg`;
        css(this.thumb, { position: 'absolute', left: '0px', top: '0px', width: '100%', height: '100%', objectFit: 'cover' });
        this.play = box(this.frame, PLAY, { left: '340px', top: '183px' });
        // 오른쪽 글 칸(x 980~1800)
        const lines = v.title.split('/').length;
        this.T = UI.title(R, v.title, { top: 196, left: 980, size: 64, width: 820 });
        const my = Math.round(196 + lines * 64 * 1.14 + 30);
        this.meta = box(R,
          `<div style="font:700 30px/1.35 Pretendard;color:var(--ink);letter-spacing:-.015em">${v.yt}</div>` +
          `<div style="margin-top:12px;font:600 28px/1.35 Pretendard;color:var(--ink2)">Robin 채널 · ${fmt(v.start)}</div>`,
          { left: '980px', top: my + 'px', width: '820px' });
        this.link = h('a', 'a', R, `<span style="font:600 28px/1 var(--mono);color:var(--cyan)">${shortUrl(v)}</span> <span style="font:600 28px/1 Pretendard;color:var(--dim)">↗</span>`);
        this.link.href = watchUrl(v); this.link.target = '_blank'; this.link.rel = 'noopener';
        css(this.link, { left: '980px', top: '606px', textDecoration: 'none', whiteSpace: 'nowrap' });
        // 주소를 눌러도 덱이 다음 장으로 넘어가지 않게 한다(deck.js 는 window mousedown 으로 넘긴다)
        this.link.addEventListener('mousedown', e => e.stopPropagation());
        players[v.id] = { frame: this.frame, ifr: null, v };
      },
      render(lt, ctx) {
        UI.headerIn(this.hd, lt);
        UI.rise(this.frame, lt, 0.1, { y: 24, blur: 0 });
        UI.titleIn(this.T, lt, 0.2, { each: 0.03 });
        UI.lineIn(this.meta, lt, 0.6);
        UI.lineIn(this.link, lt, 0.75);
        UI.exit(this.R, lt, ctx);
      },
    });
  });

  if (!DECK_MODE) return;

  // 파일(file://)로 연 덱은 리퍼러가 없어 YouTube 플레이어가 「오류 153」을 낸다(2026-11-06 확인).
  // 이때는 플레이어를 붙이지 않고, 썸네일을 누르거나 V 키를 누르면 YouTube 새 탭에서 그 시각부터 연다.
  if (location.protocol === 'file:') {
    Object.keys(players).forEach(id => {
      const p = players[id];
      css(p.frame, { cursor: 'pointer' });
      p.frame.addEventListener('mousedown', e => e.stopPropagation());
      p.frame.addEventListener('click', () => window.open(watchUrl(p.v), '_blank', 'noopener'));
    });
    addEventListener('keydown', e => {
      if (e.key !== 'v' && e.key !== 'V' || !window.__deckState) return;
      const p = players[window.__deckState().slide];
      if (p) window.open(watchUrl(p.v), '_blank', 'noopener');
    });
    return;
  }

  // 발표 모드: 현재 장의 영상만 플레이어를 붙인다
  const attach = p => {
    if (p.ifr) return;
    const f = document.createElement('iframe');
    f.src = `https://www.youtube.com/embed/${p.v.vid}?start=${p.v.start}&rel=0&playsinline=1&enablejsapi=1`;
    f.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    css(f, { position: 'absolute', left: '0px', top: '0px', width: '100%', height: '100%', border: '0', zIndex: 2 });
    p.frame.appendChild(f);
    p.ifr = f;
  };
  const state = {};
  const detach = p => { if (p.ifr) { p.ifr.remove(); p.ifr = null; state[p.v.id] = false; } };
  let last = null;
  setInterval(() => {
    if (!window.__deckState) return;
    let cur;
    try { cur = window.__deckState().slide; } catch (e) { return; }
    if (cur === last) return;
    last = cur;
    Object.keys(players).forEach(id => (id === cur ? attach(players[id]) : detach(players[id])));
  }, 200);
  // 플레이어를 눌러 포커스가 iframe 으로 가면 덱으로 되돌린다(클리커·키보드 넘김 유지)
  addEventListener('blur', () => setTimeout(() => {
    const a = document.activeElement;
    if (a && a.tagName === 'IFRAME') { a.blur(); window.focus(); }
  }, 300));
  // V 키: 현재 장 영상 재생·일시정지
  addEventListener('keydown', e => {
    if (e.key !== 'v' && e.key !== 'V') return;
    const p = last && players[last];
    if (!p || !p.ifr) return;
    state[last] = !state[last];
    p.ifr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: state[last] ? 'playVideo' : 'pauseVideo', args: [] }), '*');
  });
})();
