/* ui.js — 슬라이드 공용 부품. 모든 장이 같은 머리말·제목 움직임·출처 위치·퇴장을 쓰도록 한다.
 *
 * 화면 규칙(행사장 LED 하단 약 40%가 앞줄 청중에 가린다)
 *   읽어야 하는 글자·숫자·도식 핵심은 y 648 위(UI.SAFE)에 둔다. 아래쪽은 배경 파동과 보조 정보만.
 *
 * 쓰는 법(장면 setup/render 안)
 *   const R = UI.root(el);                                 // 장면 내용 컨테이너(퇴장 변형이 여기에 걸린다)
 *   this.hd = UI.header(R, { sec: '04', name: '방향 ①', src: '출처 줄' });
 *   this.T  = UI.title(R, '첫 줄/둘째 줄의 *강조어*', { top: 132, size: 80 });
 *   render(lt, ctx) { UI.headerIn(this.hd, lt); UI.titleIn(this.T, lt, 0.1); UI.exit(R, lt, ctx); }
 *
 * v2 문구 부품(스토리보드 v2의 화면 항목과 1:1)
 *   UI.ask(R, '이어지는 질문')            제목 위 한 줄(Q 표시)       → UI.lineIn(el, lt, t0)
 *   UI.context(R, '맥락 줄', {top})       누가·무엇을·어떤 조건, 숫자의 정의
 *   UI.meaning(R, '→ 의미 줄', {top})     그래서 무엇을 뜻하는지
 *   UI.term(R, '용어', '한 줄 정의', {top, left})
 */
(function () {
  'use strict';
  const { clamp, lerp, prog, stagger, ease, h, s, css, spring } = REEL;
  const params = new URLSearchParams(location.search);
  const SAFE = { x0: 120, x1: 1800, y0: 120, y1: 648 };

  function root(el) {
    const r = h('div', 'full', el);
    if (params.has('guides')) h('div', 'u-guide', el);
    return r;
  }

  function header(parent, o = {}) {
    const sec = h('div', 'u-sec', parent, `<b>${o.sec || ''}</b><i></i><span>${o.name || ''}</span>`);
    let src = null;
    if (o.src) {
      const txt = String(o.src)
        .replace(/(\d{4}-\d{2}(?:-\d{2})?(?:\/\d{4}-\d{2}(?:-\d{2})?)?)/g, '<span style="white-space:nowrap">$1</span>')   // 날짜 중간 줄바꿈 방지
        .replace(/(검증 전|판매사 실험|자사 측정|자체 평가)/g, '<em>$1</em>');
      src = h('div', 'u-src', parent, txt);
    }
    if (!o.sec && !o.name) sec.style.display = 'none';
    return { sec, src };
  }
  function headerIn(hd, lt, t0 = 0) {
    const p = prog(lt, t0, 0.5, ease.snap);
    css(hd.sec, { opacity: p.toFixed(3), transform: `translateX(${((1 - p) * -24).toFixed(1)}px)` });
    if (hd.src) {
      const q = prog(lt, t0 + 0.35, 0.6, ease.snap);
      css(hd.src, { opacity: q.toFixed(3), transform: `translateY(${((1 - q) * -10).toFixed(1)}px)` });
    }
  }

  // 제목: '/' 줄바꿈, *강조* 는 하늘색. 글자마다 마스크 안에서 솟으며 가는 획에서 굵은 획으로 바뀐다
  function title(parent, text, o = {}) {
    const el = h('div', 'u-title', parent);
    css(el, { top: (o.top ?? 132) + 'px', left: (o.left ?? 120) + 'px', fontSize: (o.size ?? 80) + 'px',
      width: (o.width ?? 1640) + 'px', textAlign: o.align || 'left' });
    if (o.color) el.style.color = o.color;
    const lines = [];
    const chars = [];
    String(text).split('/').forEach(lineText => {
      const ln = h('span', 'ln', el);
      const lc = [];
      let hl = false;
      for (const part of lineText.trim().split(/(\*)/)) {
        if (part === '*') { hl = !hl; continue; }
        for (const ch of [...part]) {
          if (ch === ' ') { ln.appendChild(document.createTextNode(' ')); continue; }
          const m = h('span', '', ln);
          m.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding:.10em .02em .16em;margin:-.10em -.02em -.16em';
          const c = h('span', hl ? 'hl' : '', m, ch);
          c.style.display = 'inline-block';
          lc.push(c); chars.push(c);
        }
      }
      lines.push({ el: ln, chars: lc });
    });
    return { el, lines, chars, w: o.weight ?? 860 };
  }
  function titleIn(T, lt, t0 = 0.08, o = {}) {
    const each = o.each ?? 0.026, dur = o.dur ?? 0.62, lineGap = o.lineGap ?? 0.14;
    let n = 0;
    T.lines.forEach((L, li) => {
      L.chars.forEach((c, i) => {
        const p = stagger(lt, t0 + li * lineGap, each, dur, i, ease.snap);
        const w = Math.round(lerp(o.from ?? 260, T.w, prog(lt, t0 + li * lineGap + i * each + 0.12, dur * 1.1, ease.outCubic)));
        c.style.transform = `translateY(${((1 - p) * 115).toFixed(1)}%)`;
        c.style.opacity = p > 0.001 ? '1' : '0';
        c.style.fontWeight = String(w);
        n++;
      });
    });
  }

  // 장면 퇴장: 마지막 exit 초 동안 위로 밀리며 흐려진다
  function exit(r, lt, ctx, o = {}) {
    const ex = Math.max(0.15, (ctx && ctx.dur ? (DECK.defs[r.closest('section')?.id]?.exit ?? 0.5) : 0.5));
    const p = prog(lt, ctx.dur - ex, ex - 0.06, ease.exit);
    if (p <= 0) { if (r.style.opacity !== '1') css(r, { opacity: '1', transform: 'none', filter: 'none' }); return 0; }
    css(r, { opacity: (1 - p).toFixed(3), transform: `translateY(${(-(o.lift ?? 60) * p).toFixed(1)}px) scale(${(1 - 0.03 * p).toFixed(4)})`,
      filter: `blur(${(10 * p).toFixed(1)}px)` });
    return p;
  }

  function chip(parent, text, o = {}) {
    const el = h('div', 'u-chip', parent, text);
    css(el, { position: 'absolute', left: (o.x ?? 0) + 'px', top: (o.y ?? 0) + 'px' });
    if (o.color) css(el, { borderColor: o.color, background: hexA(o.color, 0.14) });
    if (o.size) el.style.fontSize = o.size + 'px';
    return el;
  }
  function card(parent, o = {}) {
    const el = h('div', 'u-card', parent);
    css(el, { left: (o.x ?? 0) + 'px', top: (o.y ?? 0) + 'px', width: (o.w ?? 400) + 'px', height: (o.h ?? 200) + 'px' });
    if (o.accent) css(el, { borderColor: hexA(o.accent, 0.6), boxShadow: `0 30px 80px rgba(4,2,40,.45), 0 0 40px ${hexA(o.accent, 0.18)}, inset 0 1px 0 rgba(255,255,255,.08)` });
    return el;
  }
  function hexA(hex, a) {
    if (!hex || hex[0] !== '#') return hex;
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  // 코드 상자: 줄 단위 문자열 배열 또는 여러 줄 문자열. lang: 'js' | 'md' | 'text'
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function hl(line, lang) {
    let s = esc(line);
    if (lang === 'text') return s;
    if (/^\s*(\/\/|#(?!#)|<!--)/.test(line) && lang !== 'md') return `<span class="c">${s}</span>`;
    const com = s.match(/\s(\/\/.*)$/);
    let tail = '';
    if (com) { tail = `<span class="c">${com[1]}</span>`; s = s.slice(0, s.length - com[1].length); }
    s = s.replace(/(&quot;|"|`)([^"`]*?)(\1)/g, '<span class="s">$1$2$3</span>');
    if (lang === 'js') {
      s = s.replace(/\b(const|let|await|return|async|function|new|if)\b/g, '<span class="k">$1</span>');
      s = s.replace(/\b(pipeline|agent|parallel|phase|log|filter|flatMap)\b(?=\()/g, '<span class="f">$1</span>');
      s = s.replace(/\b(\d[\d_]*)\b/g, '<span class="n">$1</span>');
    } else if (lang === 'md') {
      s = s.replace(/^(\s*)(##.*)$/, '$1<span class="k">$2</span>');
      s = s.replace(/^(\s*)(---)$/, '$1<span class="c">$2</span>');
      s = s.replace(/^(\s*)([a-z_]+)(:)/, '$1<span class="f">$2</span>$3');
    }
    return s + tail;
  }
  function code(parent, src, o = {}) {
    const lines = Array.isArray(src) ? src : String(src).replace(/^\n/, '').split('\n');
    const el = h('div', 'u-code', parent);
    css(el, { left: (o.x ?? 0) + 'px', top: (o.y ?? 0) + 'px' });
    if (o.w) el.style.width = o.w + 'px';
    if (o.size) el.style.fontSize = o.size + 'px';
    const L = lines.map(t => { const d = h('span', 'ln', el, hl(t, o.lang || 'js') || ' '); return d; });
    return { el, lines: L };
  }
  function codeIn(C, lt, t0 = 0.3, each = 0.09) {
    const p = prog(lt, t0 - 0.25, 0.5, ease.snap);
    css(C.el, { opacity: p.toFixed(3), transform: `translateY(${((1 - p) * 30).toFixed(1)}px)` });
    C.lines.forEach((ln, i) => {
      const q = prog(lt, t0 + i * each, 0.4, ease.snap);
      css(ln, { opacity: q.toFixed(3), transform: `translateX(${((1 - q) * -18).toFixed(1)}px)`, clipPath: `inset(0 ${((1 - q) * 100).toFixed(1)}% 0 0)` });
    });
  }

  // 숫자 카운트(작은 값은 굴리지 않고 한 번에 찍는다)
  function countTo(el, lt, t0, dur, to, o = {}) {
    const p = prog(lt, t0, dur, ease.outQuart);
    el.textContent = (o.prefix || '') + REEL.count(p, to, { decimals: o.decimals || 0 }) + (o.suffix || '');
    return p;
  }

  // 요소 하나 등장(아래에서 솟고 흐림 → 선명). 반환값 = 진행률
  function rise(el, lt, t0, o = {}) {
    const p = prog(lt, t0, o.dur ?? 0.55, o.ease || ease.snap);
    css(el, { opacity: p.toFixed(3), transform: `translate(${((1 - p) * (o.x ?? 0)).toFixed(1)}px, ${((1 - p) * (o.y ?? 40)).toFixed(1)}px) scale(${lerp(o.from ?? 1, 1, p).toFixed(4)})`,
      filter: p < 0.98 && (o.blur ?? 8) ? `blur(${((1 - p) * (o.blur ?? 8)).toFixed(1)}px)` : 'none' });
    return p;
  }
  // 튀어나오는 등장(칩·아이콘)
  function pop(el, lt, t0, o = {}) {
    const sp = spring(lt, t0, o.f ?? 2.4, o.z ?? 0.5);
    const p = clamp((lt - t0) / 0.12);
    css(el, { opacity: p.toFixed(3), transform: `scale(${(o.from ?? 0.6) + (1 - (o.from ?? 0.6)) * sp})` });
    return p;
  }

  // 섹션 간지(전 섹션 공통 모양): 큰 섹션 번호가 외곽선으로 그려진 뒤 채워지고, 오른쪽에 섹션 제목·부제
  let divN = 0;
  function divider(parent, o = {}) {
    const id = 'udg' + (divN++);
    const svg = s('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, parent);
    svg.style.position = 'absolute';
    const defs = s('defs', {}, svg);
    const lg = s('linearGradient', { id, x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    s('stop', { offset: '0%', 'stop-color': '#ff6ef2' }, lg); s('stop', { offset: '100%', 'stop-color': '#6fe2ff' }, lg);
    const attrs = { x: 96, y: 560, 'font-family': 'Pretendard', 'font-weight': 900, 'font-size': 470, 'letter-spacing': -30 };
    const numS = s('text', Object.assign({ fill: 'none', stroke: `url(#${id})`, 'stroke-width': 3 }, attrs), svg);
    const numF = s('text', Object.assign({ fill: `url(#${id})` }, attrs), svg);
    numS.textContent = numF.textContent = o.num || '00';
    const lab = h('div', 'a', parent, `<span style="font:700 26px JetBrains Mono;color:var(--cyan);letter-spacing:.08em">SECTION ${o.num || ''}</span>`);
    css(lab, { left: '720px', top: '196px' });
    const T = title(parent, o.title || '', { top: 248, left: 716, size: o.size ?? 96, width: 1100 });
    let sub = null;
    const autoTop = Math.round(248 + T.lines.length * (o.size ?? 96) * 1.14 + 40);   // 제목 줄 수에 맞춰 부제 위치
    if (o.sub) { sub = h('div', 'a', parent, o.sub); css(sub, { left: '722px', top: (o.subTop ?? autoTop) + 'px', width: '1080px', font: '500 38px/1.35 Pretendard', color: 'var(--ink2)', letterSpacing: '-.02em' }); }
    return { numS, numF, lab, T, sub };
  }
  function dividerIn(D, lt) {
    const L = 5200, d = prog(lt, 0, 1.4, ease.inOutCubic);
    css(D.numS, { strokeDasharray: `${L}`, strokeDashoffset: `${(L * (1 - d)).toFixed(0)}`, opacity: (1 - prog(lt, 1.2, 0.6)).toFixed(3) });
    const f = prog(lt, 0.9, 0.8, ease.snap);
    css(D.numF, { opacity: (f * 0.92).toFixed(3), transform: `translateY(${((1 - f) * 30).toFixed(1)}px)` });
    rise(D.lab, lt, 0.4, { x: -30, y: 0 });
    titleIn(D.T, lt, 0.55);
    if (D.sub) rise(D.sub, lt, 1.3, { y: 24 });
  }

  // 표: cols = [{ w, align, mono }], head = [...], rows = [[...]], 행 높이 rowH. 셀 글자는 HTML 허용
  function table(parent, o = {}) {
    const el = h('div', 'a', parent);
    css(el, { left: (o.x ?? 120) + 'px', top: (o.y ?? 260) + 'px', width: o.cols.reduce((a, c) => a + c.w, 0) + 'px' });
    const size = o.size ?? 28, rowH = o.rowH ?? Math.round(size * 1.75);
    const mk = (cells, cls) => {
      const r = h('div', '', el);
      css(r, { display: 'flex', height: rowH + 'px', alignItems: 'center', borderBottom: '1px solid rgba(190,170,255,.22)', position: 'relative' });
      cells.forEach((c, i) => {
        const col = o.cols[i] || { w: 200 };
        const d = h('div', '', r, c == null ? '' : String(c));
        css(d, { width: col.w + 'px', padding: '0 14px', boxSizing: 'border-box', textAlign: col.align || 'left', whiteSpace: 'nowrap', overflow: 'hidden',
          font: `${cls === 'head' ? 600 : 500} ${cls === 'head' ? Math.round(size * 0.82) : size}px/1.2 ${col.mono ? 'var(--mono)' : 'Pretendard'}`,
          color: cls === 'head' ? 'var(--dim)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' });
      });
      return r;
    };
    const head = o.head ? mk(o.head, 'head') : null;
    const rows = (o.rows || []).map(r => mk(r, 'row'));
    return { el, head, rows, rowH };
  }
  // from~to 행을 t0부터 each 간격으로 위에서 내려오며 나타나게 한다
  function tableIn(T, lt, t0 = 0.3, each = 0.07, from = 0, to = T.rows.length - 1) {
    if (T.head && from === 0) rise(T.head, lt, t0 - 0.2, { y: -12, blur: 0 });   // 머리줄은 첫 범위에서만 등장
    T.rows.forEach((r, i) => {
      if (i < from || i > to) return;
      const p = prog(lt, t0 + (i - from) * each, 0.45, ease.snap);
      css(r, { opacity: p.toFixed(3), transform: `translateY(${((1 - p) * -14).toFixed(1)}px)`, clipPath: `inset(0 ${((1 - p) * 100).toFixed(1)}% 0 0)` });
    });
  }
  // 행 강조 막대(합계 행 등)
  function rowMark(T, i, color = '#6fe2ff') {
    const m = h('div', '', T.rows[i]);
    css(m, { position: 'absolute', inset: '0', background: hexA(color, 0.14), borderLeft: `4px solid ${color}`, zIndex: -1 });
    return m;
  }

  // ── v2 문구 부품: 이어지는 질문 · 맥락 줄 · 의미 줄 · 용어 설명 ──
  // 기본 위치(1080 기준): 질문 top 116 → 제목 top 160·64px(2줄이면 약 306까지) → 맥락 줄 top 322 → 핵심 요소 410~580 → 의미 줄 top 592
  // 위치는 장마다 옵션으로 바꾼다. 모든 글자는 y 648 위에 둔다.
  function ask(parent, text, o = {}) {
    const el = h('div', 'u-ask', parent, `<b>Q</b><span>${text}</span>`);
    // 2026-11-06: 제목과의 간격을 넓히려고 모든 질문 줄을 6px 올린다(머리글은 16px 올림)
    css(el, { top: ((o.top ?? 116) - 6) + 'px', left: (o.left ?? 120) + 'px' });
    return el;
  }
  function context(parent, text, o = {}) {
    const el = h('div', 'u-ctx', parent, text);
    css(el, { top: (o.top ?? 322) + 'px', left: (o.left ?? 120) + 'px', width: (o.width ?? 1680) + 'px' });
    if (o.size) el.style.fontSize = o.size + 'px';
    return el;
  }
  function meaning(parent, text, o = {}) {
    const body = String(text).replace(/^→\s*/, '');
    const el = h('div', 'u-mean', parent, `<i>→</i><span>${body}</span>`);
    css(el, { top: (o.top ?? 592) + 'px', left: (o.left ?? 120) + 'px', maxWidth: (o.width ?? 1680) + 'px' });
    if (o.size) el.style.fontSize = o.size + 'px';
    return el;
  }
  function term(parent, word, def, o = {}) {
    const el = h('div', 'u-term', parent, `<b>${word}</b><span>${def}</span>`);
    css(el, { top: (o.top ?? 0) + 'px', left: (o.left ?? 120) + 'px', maxWidth: (o.width ?? 820) + 'px' });
    return el;
  }
  // 위 부품의 공용 등장(아래에서 살짝 올라오며 선명해진다)
  function lineIn(el, lt, t0, o = {}) { return rise(el, lt, t0, Object.assign({ dur: 0.55, y: 16 }, o)); }

  window.UI = { SAFE, root, header, headerIn, title, titleIn, exit, chip, card, code, codeIn, countTo, rise, pop, hexA, divider, dividerIn, table, tableIn, rowMark, ask, context, meaning, term, lineIn };
})();
