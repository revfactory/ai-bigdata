/* deck_finish.js — deck_order.js 순서대로 슬라이드를 시간축에 이어 붙이고 REEL 장면으로 등록한다.
 * 아직 만들지 않은 슬라이드는 자리 표시 장면을 넣는다. 이 파일은 scenes_*.js 뒤에 불러온다. */
(function () {
  'use strict';
  const { clamp, prog, ease, h, css } = REEL;
  const order = window.DECK_ORDER || [];
  const titles = window.DECK_TITLES || {};
  const BG = DECK.BG;
  let t = 0;
  const bgKeys = [];   // [start, 상태]

  order.forEach((id, k) => {
    let def = DECK.defs[id];
    if (!def) {
      def = {
        id, stops: [0.8], exit: 0.3, placeholder: true,
        setup(el) {
          this.box = h('div', 'a', el);
          css(this.box, { left: '120px', top: '200px', font: '800 64px/1.2 Pretendard', color: '#fff', opacity: 0.85 });
          this.box.innerHTML = `<span style="font:700 34px JetBrains Mono;color:#6fe2ff">${id.toUpperCase()} · 제작 전</span><br>${(titles[id] || '').replace(/\//g, '<br>')}`;
        },
        render(lt) { css(this.box, { opacity: (0.85 * prog(lt, 0, 0.3)).toFixed(3) }); },
      };
      DECK.defs[id] = def;
    }
    const stops = def.stops && def.stops.length ? def.stops.slice() : [1.5];
    const exit = def.exit ?? 0.5;
    const dur = stops[stops.length - 1] + exit;
    def.start = t; def.end = t + dur; def.dur = dur; def.index = k;
    DECK.list.push({ id, start: t, end: t + dur, stops: stops.map(s => t + s), def });
    const prevBg = bgKeys.length ? bgKeys[bgKeys.length - 1][1] : BG;
    const st = Object.assign({}, def.bgInherit === false ? BG : (def.bg ? BG : prevBg), def.bg || {});
    bgKeys.push([t, st]);
    // 한 장의 오류가 덱 전체를 멈추지 않도록 감싼다(오류는 렌더 로그에 남는다)
    if (!def._wrapped) {
      const su = def.setup, re = def.render;
      def.setup = function (el) { try { return su && su.call(this, el); } catch (e) { console.error('[REEL] setup 오류 ' + id + ': ' + (e && e.stack || e)); } };
      let warned = false;
      def.render = function (lt, ctx) { try { return re && re.call(this, lt, ctx); } catch (e) { if (!warned) { warned = true; console.error('[REEL] render 오류 ' + id + ': ' + (e && e.stack || e)); } } };
      def._wrapped = true;
    }
    REEL.scene(def);
    t += dur;
  });
  for (const id of Object.keys(DECK.defs)) if (!order.includes(id)) console.warn('[REEL] deck_order.js 에 없는 슬라이드:', id);

  // 배경 상태: 장면 시작 후 0.9초 동안 앞 상태에서 보간
  const keys = Object.keys(BG);
  DECK.bgAt = tt => {
    let i = 0;
    while (i + 1 < bgKeys.length && bgKeys[i + 1][0] <= tt) i++;
    const [t1, s1] = bgKeys[i];
    const s0 = i > 0 ? bgKeys[i - 1][1] : s1;
    const p = ease.inOutCubic(clamp((tt - t1) / 0.9));
    const o = {};
    for (const k of keys) o[k] = s0[k] + (s1[k] - s0[k]) * p;
    o.parts = s1.parts;
    return o;
  };

  // 쪽 번호: 오른쪽 아래, 표지(1쪽)에는 표시하지 않는다. 렌더·PDF·발표 모드에 모두 나온다
  const total = DECK.list.length;
  const pageAt = tt => { let i = 0; while (i + 1 < DECK.list.length && DECK.list[i + 1].start <= tt) i++; return i; };
  REEL.overlay(function (tt) {
    const i = pageAt(tt);
    if (i === this.last) return;
    this.last = i;
    this.el.style.display = i === 0 ? 'none' : '';
    this.cur.textContent = String(i + 1);
  }, {
    layer: 'top',
    setup(parent) {
      const o = this;
      o.el = h('div', 'u-pageno', parent);
      o.cur = h('b', '', o.el);
      h('span', '', o.el, ' / ' + total);
    },
  });
  DECK.pageAt = pageAt;

  REEL.config({ duration: Math.max(1, t), fps: 30, width: 1920, height: 1080 });
  window.__deckMeta = DECK.list.map(s => ({ id: s.id, start: +s.start.toFixed(4), end: +s.end.toFixed(4), stops: s.stops.map(x => +x.toFixed(4)), placeholder: !!s.def.placeholder }));
})();
