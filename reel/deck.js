/* deck.js — showreel 엔진 위에 발표용 슬라이드 덱을 얹는다.
 *
 * 슬라이드 한 장 = REEL 장면 하나. 장면들은 deck_order.js 순서대로 시간축에 이어 붙는다.
 *   DECK.slide({ id: 'p12', stops: [1.6, 3.4], exit: 0.45, bg: {...}, setup(el) {}, render(lt, ctx) {} })
 *     stops  : 장면 안 단계 시각(초). 마지막 stop = 완성 화면. 발표 모드는 장을 넘기면 마지막 stop 까지 멈추지 않고 재생한다
 *              (2026-11-04 발표자 지시: 한 장 안에서 추가 클릭 없이 모든 내용이 애니메이션과 함께 나온다). 중간 stop 은 단계 표시·검수용이다
 *     exit   : 마지막 stop 뒤 퇴장 애니메이션 길이(기본 0.5). 장면 길이 = 마지막 stop + exit
 *     bg     : 배경 파동 상태(DECK.BG 의 키 일부). 앞 장면 상태에서 0.9초 동안 바뀐다
 *   render(lt, ctx) 는 lt 의 순수 함수여야 한다(engine.js 규칙). 정지 중에도 흐르는 장식은 DECK.amb(ctx.t) 를 쓴다.
 *
 * 모드
 *   index.html?render=1          렌더러(render.mjs)가 쓰는 결정적 모드. amb(t) = t
 *   index.html                   showreel 미리보기 플레이어(스크럽)
 *   present.html → index.html?render=1&deck=1   발표 모드(클리커·키보드). amb(t) = 실제 경과 시간
 */
(function () {
  'use strict';
  const { clamp, lerp, prog, ease, h, css, rand, noise } = REEL;
  const params = new URLSearchParams(location.search);
  const MODE = params.has('deck') ? 'deck' : 'render';
  const defs = {};

  // 배경 파동 기본 상태(1920×1080 좌표)
  const BG = {
    yc: 820,        // 파동 중심선 높이
    tilt: -0.16,    // 오른쪽으로 갈수록 올라가는 기울기(px/px)
    amp: 120,       // 중심선 진폭
    k: 1.35,        // 중심선 파수(화면 폭 기준 주기 수)
    spread: 230,    // 다발 폭(꼬임 폭)
    k2: 0.9,        // 꼬임 파수
    lines: 64,      // 선 개수
    alpha: 0.9,     // 선 밝기
    glow: 0.55,     // 선 번짐
    speed: 0.16,    // 흐름 속도
    split: 0,       // 0 = 한 다발, 1 = parts 개 묶음으로 나뉨
    parts: 5,
    gap: 70,        // 묶음 사이 간격
    flat: 0,        // 1 = 진폭·꼬임이 사라지고 평행선(정렬된 데이터)
    dim: 0,         // 0~1 화면을 어둡게(글자 많은 장)
    hue: 0,         // -1 = 청색 쪽, 1 = 분홍 쪽
    streaks: 1,     // 빗금 빛줄기 밝기
    x0: 0,          // 파동 좌우 이동(px)
  };

  // 배경 상태 묶음: 슬라이드에서 bg: DECK.BGP.calm 처럼 쓰거나 Object.assign({}, DECK.BGP.split, { parts: 3 })로 바꿔 쓴다
  const BGP = {
    surge: { yc: 800, amp: 150, spread: 300, alpha: 1, glow: 0.8 },                      // 표지·간지·선언
    calm: { yc: 900, amp: 80, spread: 160, alpha: 0.7, dim: 0.25 },                      // 일반 장
    text: { yc: 940, amp: 60, spread: 120, alpha: 0.55, dim: 0.45, streaks: 0.5 },       // 글자·표가 많은 장
    split: { split: 1, parts: 5, gap: 46, yc: 860, amp: 40, spread: 90, flat: 0.6, alpha: 0.75, dim: 0.2 }, // 분할·병렬
    flat: { flat: 1, yc: 880, spread: 220, alpha: 0.6, dim: 0.3 },                       // 정렬된 행(로그·표)
  };
  const DECK = (window.DECK = {
    MODE, BG, BGP, defs,
    slide(def) {
      if (!def || !def.id) throw new Error('DECK.slide: id 가 없다');
      if (defs[def.id]) console.warn('[REEL] 슬라이드 id 중복:', def.id);
      defs[def.id] = def;
      return def;
    },
    // 정지 중에도 흐르는 장식용 시각. 렌더 모드에서는 전역 시각 t 그대로(결정적)
    amb(t) { return MODE === 'deck' && window.__amb != null ? window.__amb : t; },
    list: [],          // deck_finish.js 가 채운다: [{id, start, end, stops(절대), def}]
    bgAt: null,        // deck_finish.js 가 채운다: t → 배경 상태
  });

  // ── 배경: 그라디언트 + 빛 번짐 + 선 다발(캔버스) + 빛줄기 ──
  REEL.overlay(function (t) {
    const S = DECK.bgAt ? DECK.bgAt(t) : BG;
    const a = DECK.amb(t);
    drawBG(this, S, a, t);
  }.bind({}), {
    layer: 'back',
    setup(parent) {
      const o = this;
      const base = h('div', 'full', parent);
      css(base, { background: 'linear-gradient(118deg, #3a26c4 0%, #2a2bc0 22%, #1d1f95 48%, #15146b 72%, #0d0c45 100%)' });
      const glowA = h('div', 'a', parent);
      css(glowA, { left: '-260px', top: '-320px', width: '900px', height: '900px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,110,242,.55) 0%, rgba(190,70,255,.22) 32%, rgba(120,60,255,0) 66%)' });
      const glowB = h('div', 'a', parent);
      css(glowB, { left: '980px', top: '520px', width: '1300px', height: '900px', borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(60,80,255,.45), rgba(60,80,255,0))' });
      const cv = h('canvas', 'full', parent);
      cv.width = REEL.W; cv.height = REEL.H;
      css(cv, { width: REEL.W + 'px', height: REEL.H + 'px' });
      const dim = h('div', 'full', parent);
      css(dim, { background: 'linear-gradient(180deg, rgba(8,6,40,.9) 0%, rgba(8,6,40,.75) 55%, rgba(8,6,40,.35) 100%)', opacity: 0 });
      BGREF.base = base; BGREF.glowA = glowA; BGREF.glowB = glowB; BGREF.cv = cv; BGREF.ctx = cv.getContext('2d'); BGREF.dim = dim;
    },
  });
  const BGREF = {};

  function lineColor(u, hue, alpha) {
    // u: 0(아래쪽 선)~1(위쪽 선). 분홍→보라→청
    const k = clamp(u + hue * 0.35);
    const r = Math.round(lerp(255, 120, k)), g = Math.round(lerp(90, 120, k)), b = 255;
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  }

  function drawBG(_, S, a, t) {
    const c = BGREF.ctx; if (!c) return;
    const W = REEL.W, H = REEL.H;
    c.clearRect(0, 0, W, H);
    css(BGREF.dim, { opacity: S.dim.toFixed(3) });
    css(BGREF.glowA, { transform: `translate(${(noise(a * 0.05, 1) * 40).toFixed(1)}px, ${(noise(a * 0.05, 2) * 30).toFixed(1)}px)` });
    css(BGREF.glowB, { transform: `translate(${(noise(a * 0.04, 3) * 60).toFixed(1)}px, ${(noise(a * 0.04, 4) * 30).toFixed(1)}px)` });

    // 선 다발
    const N = Math.round(S.lines), ph = a * S.speed * Math.PI * 2;
    const steps = 120, flat = clamp(S.flat), sp = clamp(S.split);
    c.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++) {
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < N; i++) {
        const u = N > 1 ? i / (N - 1) : 0.5;      // 0~1
        const uc = u - 0.5;
        const grp = Math.min(S.parts - 1, Math.floor(u * S.parts));
        const goff = (grp - (S.parts - 1) / 2) * S.gap * sp;
        const al = S.alpha * (0.35 + 0.65 * Math.sin(Math.PI * u)) * (pass === 0 ? 0.11 * S.glow : 0.55);
        if (al < 0.004) continue;
        c.strokeStyle = lineColor(u, S.hue, al);
        c.lineWidth = pass === 0 ? 7 : 1.25;
        c.beginPath();
        for (let j = 0; j <= steps; j++) {
          const x = -80 + (W + 160) * (j / steps);
          const X = (x + S.x0) / W;
          const center = S.yc + S.tilt * (x - W / 2) + (1 - flat) * S.amp * Math.sin(Math.PI * 2 * S.k * X + ph * 0.6);
          const twist = Math.sin(Math.PI * 2 * S.k2 * X - ph + 1.2);
          const wid = lerp(S.spread * twist, S.spread * 0.55, flat);
          const y = center + uc * wid + goff + (1 - flat) * 6 * Math.sin(X * 9 + i * 0.4 + ph);
          if (j === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
      }
    }
    // 빛줄기(대각선으로 흐르는 짧은 선)와 점
    if (S.streaks > 0.01) {
      for (let i = 0; i < 9; i++) {
        const sp2 = 60 + rand(i, 3) * 90;
        const L = 2400;
        const d = ((rand(i, 1) * L + a * sp2) % L) - 300;
        const x = 1920 - d * 0.85 + rand(i, 2) * 900 - 450;
        const y = -100 + d * 0.62 + rand(i, 4) * 200;
        const len = 90 + rand(i, 5) * 180;
        const g = c.createLinearGradient(x, y, x + len * 0.8, y - len * 0.6);
        const al = 0.55 * S.streaks * (0.4 + 0.6 * rand(i, 6));
        g.addColorStop(0, `rgba(255,180,255,${al.toFixed(3)})`);
        g.addColorStop(1, 'rgba(160,120,255,0)');
        c.strokeStyle = g; c.lineWidth = 3 + rand(i, 7) * 6; c.lineCap = 'round';
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + len * 0.8, y - len * 0.6); c.stroke();
      }
      for (let i = 0; i < 16; i++) {
        const x = rand(i, 11) * W, y = rand(i, 12) * H;
        const tw = 0.5 + 0.5 * Math.sin(a * (0.6 + rand(i, 13)) + i);
        const r = 2 + rand(i, 14) * 3;
        const g = c.createRadialGradient(x, y, 0, x, y, r * 4);
        g.addColorStop(0, `rgba(255,140,255,${(0.65 * tw * S.streaks).toFixed(3)})`);
        g.addColorStop(1, 'rgba(255,140,255,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 4, 0, Math.PI * 2); c.fill();
      }
    }
    c.globalCompositeOperation = 'source-over';
  }

  // ── 발표 모드 컨트롤러 ──
  if (MODE === 'deck') {
    const wait = () => (window.__ready ? start() : setTimeout(wait, 50));
    addEventListener('load', () => setTimeout(wait, 50));
  }

  function start() {
    const wrap = document.getElementById('wrap');
    const W = REEL.W, H = REEL.H;
    const fit = () => {
      const k = Math.min(innerWidth / W, innerHeight / H);
      wrap.style.transform = `translate(${(innerWidth - W * k) / 2}px, ${(innerHeight - H * k) / 2}px) scale(${k})`;
    };
    fit(); addEventListener('resize', fit);
    document.body.style.cursor = 'none';

    // 전역 정지 지점: 장마다 하나(마지막 stop = 완성 화면). 장을 넘기면 앞 장 퇴장부터 이 장의 모든 단계까지 이어서 재생한다
    const stops = [];
    DECK.list.forEach((s, k) => stops.push({ k, j: 0, t: s.stops[s.stops.length - 1], id: s.id }));
    let cur = 0, playing = false, from = 0, to = 0, t0 = 0, black = false, hud = false, typed = '';
    const t00 = performance.now();

    const blackEl = h('div', '', document.body);
    css(blackEl, { position: 'fixed', inset: 0, background: '#000', opacity: 0, pointerEvents: 'none', zIndex: 40 });
    const hudEl = h('div', '', document.body);
    css(hudEl, { position: 'fixed', right: '14px', top: '10px', font: '600 15px/1.4 Menlo, monospace', color: '#fff',
      background: 'rgba(0,0,0,.55)', padding: '6px 10px', borderRadius: '6px', display: 'none', zIndex: 41 });

    const showHud = () => {
      const s = stops[cur];
      hudEl.style.display = hud || typed ? '' : 'none';
      hudEl.textContent = typed ? `이동: ${typed}` : `${s.k + 1} / ${DECK.list.length}  (${s.id}${playing ? ' · 재생 중' : ''})`;
    };
    // 주소에 현재 쪽 번호를 남긴다(?p=12). 새로 고치거나 주소를 공유하면 그 쪽으로 열린다
    let urlPage = -1;
    const syncUrl = () => {
      const n = stops[cur].k + 1;
      if (n === urlPage) return;
      urlPage = n;
      const q = new URLSearchParams(location.search);
      q.set('p', String(n));
      try { history.replaceState(null, '', location.pathname + '?' + q.toString()); }
      catch (e) { location.replace('#p=' + n); }        // file:// 등에서 막히면 주소 끝 #p=N 으로 남긴다
      document.title = `${n} / ${DECK.list.length} · ` + (document.title.replace(/^\d+ \/ \d+ · /, ''));
    };
    const go = i => { cur = clamp(i, 0, stops.length - 1); playing = false; window.__amb = (performance.now() - t00) / 1000; window.__seek(stops[cur].t); showHud(); syncUrl(); };
    const next = () => {
      if (playing) { go(cur); return; }               // 재생 중이면 바로 완성 화면으로
      if (cur >= stops.length - 1) return;
      from = stops[cur].t; cur += 1; to = stops[cur].t; t0 = performance.now(); playing = true; showHud(); syncUrl();
    };
    const prev = () => go(cur - 1);
    const jumpSlide = n => go(clamp(n - 1, 0, DECK.list.length - 1));

    window.__deckState = () => ({ cur, playing, slide: stops[cur].id, t: window.__t, to: stops[cur].t });
    const loop = now => {
      window.__amb = (now - t00) / 1000;
      if (playing) {
        const tt = from + (now - t0) / 1000;
        if (tt >= to) { playing = false; window.__seek(to); if (hud) showHud(); }
        else window.__seek(tt);
      } else {
        window.__seek(stops[cur].t);
      }
      requestAnimationFrame(loop);
    };

    addEventListener('keydown', e => {
      const k = e.key;
      if (/^[0-9]$/.test(k)) { typed += k; showHud(); return; }
      if (k === 'Enter' && typed) { jumpSlide(Number(typed)); typed = ''; showHud(); return; }
      if (k === 'Escape') { typed = ''; showHud(); return; }
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter', 'n'].includes(k)) { e.preventDefault(); next(); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace', 'p'].includes(k)) { e.preventDefault(); prev(); }
      else if (k === 'Home') go(0);
      else if (k === 'End') go(stops.length - 1);
      else if (k === 'b' || k === 'B' || k === '.') { black = !black; blackEl.style.opacity = black ? 1 : 0; }
      else if (k === 'f' || k === 'F') { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => null); else document.exitFullscreen(); }
      else if (k === 'h' || k === 'H') { hud = !hud; showHud(); }
    });
    addEventListener('mousedown', e => { if (e.button === 0) next(); else if (e.button === 2) prev(); });
    addEventListener('contextmenu', e => e.preventDefault());

    // 시작: ?p=12 이면 12번 장 완성 화면, 아니면 표지 등장 재생
    const hp = /p=(\d+)/.exec(location.hash);
    const p0 = Number(params.get('p') || (hp && hp[1]) || 0);
    if (p0 > 1) jumpSlide(p0);
    else { cur = 0; from = 0; to = stops[0].t; t0 = performance.now(); playing = true; syncUrl(); }
    requestAnimationFrame(loop);
  }
})();
