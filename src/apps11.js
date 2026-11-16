/* ═════════ NEW APPS · part 11 — MARBLE RUN ═════════ */
/*MRUN<*/
/* the marble engine: pure maths, no DOM, so it can be simulated anywhere.
   World units = board cells (12 × 8). Pieces sit on the grid; each is a few capsules (line segments with thickness) or a round bumper. */
const MRUN = (() => {
  const COLS = 12, ROWS = 8, R = .15, G = 11, TH = .055;
  /* segment rows: [ax, ay, bx, by, bounce, note?] in piece-local cells; f = 1 mirrors left↔right */
  const DEF = {
    ramp:   { w: 2, segs: [[.06, .3, 1.94, .6, .2], [.06, -.32, .06, .3, .1]] },
    long:   { w: 3, segs: [[.06, .26, 2.94, .66, .2], [.06, -.32, .06, .26, .1]] },
    steep:  { w: 1, segs: [[.06, .02, .94, .72, .2], [.06, -.32, .06, .02, .1]] },
    xylo:   { w: 2, segs: [[.04, -.32, .04, .14, .1], [.04, .14, .38, .2, .45, 0], [.52, .34, .86, .4, .45, 1], [1, .54, 1.34, .6, .45, 2], [1.48, .74, 1.94, .8, .45, 3]] },
    funnel: { w: 2, segs: [[.02, 0, .76, .7, .25], [1.98, 0, 1.24, .7, .25]] },
    bell:   { w: 1, circ: [.5, .48, .2, .55] },
    tramp:  { w: 2, segs: [[.2, .62, 1.8, .82, .85]] },
    spin:   { w: 1, deco: true },
    cup:    { w: 2, segs: [[.1, .02, .18, .94, .1], [.18, .94, 1.82, .94, .1], [1.82, .94, 1.9, .02, .1]], goal: true }
  };
  function build(pieces) {
    const segs = [], cups = [], spins = [];
    pieces.forEach((p, i) => {
      const d = DEF[p.k], fx = X => p.f ? d.w - X : X;
      (d.segs || []).forEach(s => segs.push({ ax: p.c + fx(s[0]), ay: p.r + s[1], bx: p.c + fx(s[2]), by: p.r + s[3], e: s[4], note: s[5], k: p.k, pi: i }));
      if (d.circ) { const [cx, cy, rad, e] = d.circ; segs.push({ ax: p.c + fx(cx), ay: p.r + cy, bx: p.c + fx(cx), by: p.r + cy, rad, e, k: p.k, pi: i }); }
      if (d.goal) cups.push({ x0: p.c + .18, x1: p.c + 1.82, y0: p.r + .2, y1: p.r + .94, pi: i, n: 0 });
      if (d.deco) spins.push({ x: p.c + .5, y: p.r + .5, pi: i, a: 0, w: 0 });
    });
    segs.push({ ax: 0, ay: ROWS, bx: COLS, by: ROWS, e: .2, k: 'floor' }, { ax: 0, ay: -3, bx: 0, by: ROWS, e: .3, k: 'wall' }, { ax: COLS, ay: -3, bx: COLS, by: ROWS, e: .3, k: 'wall' });
    segs.forEach(s => { const rr = (s.rad || TH) + R; s.dx = s.bx - s.ax; s.dy = s.by - s.ay; s.l2 = s.dx * s.dx + s.dy * s.dy;
      s.x0 = Math.min(s.ax, s.bx) - rr; s.x1 = Math.max(s.ax, s.bx) + rr; s.y0 = Math.min(s.ay, s.by) - rr; s.y1 = Math.max(s.ay, s.by) + rr; });
    return { segs, cups, spins, marbles: [] };
  }
  /* which cells a piece covers (all pieces are one row tall) */
  const cells = p => Array.from({ length: DEF[p.k].w }, (_, i) => [p.c + i, p.r]);
  const fits = (p, pieces, skip) => cells(p).every(([c, r]) => c >= 0 && c < COLS && r >= 1 && r < ROWS && !pieces.some(q => q !== skip && cells(q).some(([a, b]) => a === c && b === r)));
  function drop(W, x, col) { const m = { x, y: .35, vx: (Math.random() - .5) * .05, vy: 0, a: Math.random() * 6, col, rest: 0, floor: 0, fade: 1, t: 0, cd: 0 }; W.marbles.push(m); return m; }
  function step(W, dt, on) {
    const M = W.marbles, n = Math.max(1, Math.ceil(dt / .004)), h = dt / n;
    for (let s = 0; s < n; s++) {
      for (const m of M) {
        if (m.cup) continue;
        m.vy += G * h; m.x += m.vx * h; m.y += m.vy * h; m.touch = 0;
        for (const g of W.segs) {
          if (m.x < g.x0 || m.x > g.x1 || m.y < g.y0 || m.y > g.y1) continue;
          let t = g.l2 ? ((m.x - g.ax) * g.dx + (m.y - g.ay) * g.dy) / g.l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
          let nx = m.x - (g.ax + g.dx * t), ny = m.y - (g.ay + g.dy * t); const d2 = nx * nx + ny * ny, rr = R + (g.rad || TH);
          if (d2 >= rr * rr) continue;
          const d = Math.sqrt(d2) || 1e-6; nx /= d; ny /= d; m.x += nx * (rr - d); m.y += ny * (rr - d); m.touch = 1;
          const vn = m.vx * nx + m.vy * ny;
          if (vn < 0) { const e = -vn < .6 ? 0 : g.e; m.vx -= (1 + e) * vn * nx; m.vy -= (1 + e) * vn * ny; if (-vn > .8 && m.cd <= 0 && on) { m.cd = .06; on('hit', m, g, -vn); } }
        }
        if (m.touch) { const k = Math.exp((m.y > ROWS - .3 ? -3 : -.4) * h); m.vx *= k; m.vy *= k; m.a += m.vx / R * h; } else m.a += m.vx / R * h * .3;
        m.cd -= h;
      }
      for (let i = 0; i < M.length; i++) for (let j = i + 1; j < M.length; j++) {
        const a = M[i], b = M[j]; if (a.cup && b.cup) continue;
        let nx = b.x - a.x, ny = b.y - a.y; const d2 = nx * nx + ny * ny; if (d2 >= 4 * R * R || d2 === 0) continue;
        const d = Math.sqrt(d2); nx /= d; ny /= d; const p = (2 * R - d) / 2, ia = a.cup ? 0 : 1, ib = b.cup ? 0 : 1, k = ia + ib || 1;
        a.x -= nx * p * 2 * ia / k; a.y -= ny * p * 2 * ia / k; b.x += nx * p * 2 * ib / k; b.y += ny * p * 2 * ib / k;
        const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (vn < 0) { const j2 = -(1.5) * vn / k; if (ia) { a.vx -= j2 * nx; a.vy -= j2 * ny; } if (ib) { b.vx += j2 * nx; b.vy += j2 * ny; } if (-vn > 1.2 && on && a.cd <= 0) { a.cd = .06; on('click', a, null, -vn); } }
      }
    }
    for (const m of M) {
      m.t += dt; const sp2 = m.vx * m.vx + m.vy * m.vy;
      if (!m.cup) for (const c of W.cups) if (m.x > c.x0 && m.x < c.x1 && m.y > c.y0 && m.y < c.y1 + .1) { if (sp2 < .6) { m.rest += dt; if (m.rest > .2) { m.cup = c; m.vx = m.vy = 0; c.n++; on && on('cup', m, c); break; } } else m.rest = 0; }
      if (!m.cup && m.y < ROWS - .5) { if (sp2 < .01) { m.jam = (m.jam || 0) + dt; if (m.jam > 1.2) { m.jam = 0; m.nudge = (m.nudge || 0) + 1; m.vx += (Math.random() < .5 ? -1 : 1) * .9; m.vy -= .6; if (m.nudge > 3) m.fade -= .01; } } else m.jam = 0; }   // never let a marble jam the run
      if (m.fade < 1 && !m.cup && m.y < ROWS - .5) m.fade -= dt * 1.5;
      if (m.cup) { m.ct = (m.ct || 0) + dt; if (m.ct > .7) m.fade -= dt * 2; }
      else if (m.y > ROWS - .5 && sp2 < .3) { m.floor += dt; if (m.floor > 1.8) m.fade -= dt * 1.5; }
      if (m.fade <= 0 || m.y > ROWS + 2 || m.t > 40) m.gone = true;
    }
    W.marbles = M.filter(m => !m.gone);
    for (const sp of W.spins) { for (const m of W.marbles) { const dx = m.x - sp.x, dy = m.y - sp.y; if (dx * dx + dy * dy < .5) sp.w += (m.vx * Math.sign(-dy || 1) - m.vy * Math.sign(dx || 1)) * dt * 6; } sp.w *= Math.exp(-dt * .7); sp.a += sp.w * dt; }
  }
  return { COLS, ROWS, R, DEF, build, cells, fits, drop, step };
})();
/*>MRUN*/
Object.entries({ marble: ['Marble Run', 'Carrera de Canicas', 'Circuit à Billes', 'Pista de Bolinhas', 'ビー玉コロコロ', '弹珠轨道'] })
  .forEach(([id, a]) => LANG6.forEach((k, i) => { if (L[k]) L[k].games[id] = a[i]; }));

/* courses: [piece, col, row, flip]; every one was run through the engine until each marble lands in a cup */
const MR_C = {
  A: { hop: [3], p: [['ramp', 3, 1, 0], ['ramp', 4, 2, 0], ['xylo', 6, 3, 0], ['bell', 8, 3, 0], ['ramp', 7, 4, 1], ['ramp', 5, 5, 0], ['funnel', 7, 6, 0], ['cup', 7, 7, 0], ['spin', 5, 4, 0], ['spin', 10, 6, 0], ['spin', 1, 3, 0]] },
  B: { hop: [10], p: [['ramp', 9, 1, 1], ['ramp', 8, 2, 1], ['long', 5, 3, 1], ['bell', 4, 3, 0], ['ramp', 4, 4, 0], ['funnel', 6, 5, 0], ['tramp', 6, 6, 0], ['cup', 8, 7, 0], ['spin', 2, 5, 0], ['spin', 10, 4, 0]] },
  C: { hop: [1], p: [['xylo', 1, 1, 0], ['long', 2, 2, 0], ['xylo', 4, 3, 0], ['long', 5, 4, 0], ['spin', 9, 4, 0], ['ramp', 8, 5, 1], ['funnel', 7, 6, 0], ['cup', 7, 7, 0], ['spin', 10, 2, 0], ['spin', 3, 5, 0]] },
  D: { hop: [1, 10], p: [['ramp', 1, 1, 0], ['ramp', 2, 2, 0], ['xylo', 4, 3, 0], ['ramp', 10, 1, 1], ['ramp', 9, 2, 1], ['xylo', 7, 3, 1], ['funnel', 5, 4, 0], ['tramp', 5, 5, 0], ['funnel', 7, 6, 0], ['cup', 7, 7, 0], ['spin', 1, 5, 0], ['spin', 10, 5, 0], ['spin', 3, 5, 0]] },
  E: { hop: [1, 10], p: [['xylo', 1, 1, 0], ['ramp', 2, 2, 0], ['ramp', 3, 3, 1], ['ramp', 2, 4, 0], ['funnel', 3, 5, 0], ['cup', 3, 7, 0], ['ramp', 10, 1, 1], ['long', 7, 2, 1], ['ramp', 6, 3, 0], ['steep', 8, 4, 0], ['funnel', 9, 5, 0], ['cup', 9, 7, 0], ['bell', 6, 2, 0], ['spin', 5, 5, 0], ['spin', 0, 3, 0]] }
};
MR_C.Er = { hop: [10], p: MR_C.E.p.slice(6) };
/* fix-it puzzles: [course, the missing piece, what's in the tray]; each fails without the piece and works with it */
const MR_PZ = [['A', ['ramp', 5, 5, 0], ['ramp']], ['B', ['ramp', 4, 4, 0], ['ramp', 'bell']], ['C', ['ramp', 8, 5, 1], ['tramp', 'ramp']], ['B', ['tramp', 6, 6, 0], ['ramp', 'tramp']],
  ['Er', ['steep', 8, 4, 0], ['steep', 'funnel']], ['B', ['funnel', 6, 5, 0], ['funnel', 'bell']], ['C', ['funnel', 7, 6, 0], ['funnel', 'ramp']], ['D', ['tramp', 5, 5, 0], ['tramp', 'steep']]];
const MR_WATCH = { 1: ['A', 'C', 'B'], 2: ['D', 'E'] };
const MR_TRAY = ['ramp', 'long', 'steep', 'xylo', 'funnel', 'bell', 'tramp', 'spin', 'cup'];
const MR_SYM = { funnel: 1, bell: 1, cup: 1, spin: 1 };
const MR_MCOL = ['#ff4d4d', '#3b8cff', '#22d36b', '#ffd60a', '#ff8a1f', '#b06cff', '#ff5da2', '#1fc7b6', '#f2f2ee'];

/* MARBLE RUN — Lv 1–2: tap to drop marbles and watch them ring bells, play the xylophone and bounce into the jar.
   Lv 3: fix the run (drag the missing piece into the gap; a glowing hint after two misses — tap it to place it).
   Lv 4: build your own on the pegboard (drag pieces in, tap to flip, drag back to the tray to remove; saved). */
game('marble', 'play', '🎢', g => {
  const H = g.host('dino'); g.stage.classList.add('col'); const wrap = mk('div', 'paintWrap'); g.stage.appendChild(wrap);
  const C = g.canvas(wrap), x = C.ctx, P = new Particles(), { COLS, ROWS, R, DEF } = MRUN;
  const ST = PROG.marble || (PROG.marble = { pz: 0, n: 0, build: null });
  const PAL = [TT.red, TT.blue, TT.green, TT.yellow, TT.orange, TT.purple, TT.pink, TT.teal];
  let mode = 'watch', hops = [], pieces = [], W = null, t = 0, pz = null, tray = [], drag = null, fails = 0, hint = false, solved = false, round = 0;
  let fx = {}, hopFx = {}, rings = [], lastStar = -9, sndT = 0, sndN = 0, demoT = 0, bg = null, bgKey = '';
  const later = (ms, fn) => { const r = round; g.after(ms, () => { if (r === round) fn(); }); };
  const mkP = ([k, c, r, f], i, fixed) => ({ k, c, r, f: f || 0, fixed, col: PAL[i % PAL.length] });
  function rebuild() {
    const old = W; W = MRUN.build(pieces); fx = {};
    if (old) { W.marbles = old.marbles; W.spins.forEach(s => { const o = old.spins.find(q => Math.abs(q.x - s.x) < .01 && Math.abs(q.y - s.y) < .01); if (o) { s.a = o.a; s.w = o.w; } }); }
  }
  function load(c) { hops = c.hop.slice(); pieces = c.p.map((p, i) => mkP(p, i, true)); tray = []; W = null; rebuild(); }
  function loadPz() {
    const [ck, sol, tr] = MR_PZ[ST.pz % MR_PZ.length], base = MR_C[ck];
    load({ hop: base.hop, p: base.p.filter(p => p.join() !== sol.join()) });
    pz = { k: sol[0], c: sol[1], r: sol[2], f: sol[3] }; tray = tr.map(k => ({ k, f: k === sol[0] ? sol[3] : 0 }));
    fails = 0; hint = false; solved = false; H.bubble('🧩 👆');
  }
  function start(n) {
    round++; drag = null; hint = false; fails = 0; solved = false; pz = null; P.a = []; rings = [];
    if (n <= 2) { mode = 'watch'; const pool = MR_WATCH[n]; load(MR_C[pool[(ST.n = (ST.n || 0) + 1) % pool.length]]); saveProg(); g.meter(n === 1 ? 8 : 10); H.bubble('👆 🔵'); demoT = 1; }
    else if (n === 3) { mode = 'fix'; loadPz(); g.meter(5); }
    else { mode = 'build'; hops = [1, 10]; pieces = (ST.build || [['cup', 5, 7, 0]]).map((p, i) => mkP(p, i, false)); tray = MR_TRAY.map(k => ({ k, f: 0 })); W = null; rebuild(); g.meter(0); H.bubble('🛠 🔵'); }
    trash.style.display = mode === 'build' ? '' : 'none';
  }
  const saveBuild = () => { if (mode === 'build') { ST.build = pieces.map(p => [p.k, p.c, p.r, p.f]); saveProg(); } };
  const trash = g.tool('🗑', () => { if (mode !== 'build') return; pieces = [mkP(['cup', 5, 7, 0], 0, false)]; W.marbles = []; rebuild(); saveBuild(); SFX.whoosh(); });

  /* ── sound: wood clacks, xylophone, bells, boing; capped so a pile of marbles stays pleasant ── */
  const snd = f => { const now = performance.now(); if (now - sndT > 1000) { sndT = now; sndN = 0; } if (++sndN > 26) return; f(); };
  function onEv(ev, m, s, v) {
    if (ev === 'hit') {
      const vol = clamp(v / 5, .2, 1), k = s.k;
      if (k === 'xylo') snd(() => tone(PENTA[3 + s.note * 2], .45, 'triangle', .15 * vol));
      else if (k === 'bell') { snd(() => DRUM.bell(PENTA[5 + s.pi % 4])); fx[s.pi] = { t: 1 }; const [px, py] = toPx(s.ax, s.ay); rings.push({ x: px, y: py, t: 0 }); }
      else if (k === 'tramp') { snd(() => sweep(170, 520, .2, 'sine', .2 * vol)); fx[s.pi] = { t: 1 }; }
      else if (k === 'floor') snd(() => noise(.06, .1 * vol, 'lowpass', 500));
      else snd(() => { tone(rand(1100, 1500), .035, 'triangle', .07 * vol); noise(.02, .05 * vol, 'highpass', 3000); });
    } else if (ev === 'click') snd(() => tone(2500 + rand(-250, 250), .03, 'sine', .05));
    else if (ev === 'cup') { snd(() => { tone(1568, .12, 'sine', .11); tone(2093, .2, 'sine', .08, .06); }); onCup(m); }
  }
  function onCup(m) {
    const [px, py] = toPx(m.x, m.y), u = lay().u; P.burst(px, py, [TT.yellow, TT.white, m.col], 14, u * 3, { g: u * 4 });
    if (mode === 'watch') { g.star(1, ...FX(C, px, py)); H.happy(); if (g.progress()) { mode = 'done'; confettiDOM(g, 60); SFX.chime(); later(1400, () => g.levelUp()); } }
    else if (mode === 'fix' && !solved) { solved = true; hint = false; g.star(2, ...FX(C, px, py)); H.happy(); confettiDOM(g, 50); SFX.chime(); H.bubble('🧩 ✔'); ST.pz = (ST.pz || 0) + 1; saveProg(); const done = g.progress(); later(2600, () => { if (done) g.levelUp(); else loadPz(); }); }
    else if (mode === 'build') { if (t - lastStar > 2) { lastStar = t; g.star(1, ...FX(C, px, py)); } H.happy(); }
  }
  function dropAt(bx) {
    if (!W || !hops.length) return; if (W.marbles.filter(m => !m.cup).length >= 22) { tone(196, .08, 'triangle', .06); return; }
    const h = hops.reduce((a, b) => Math.abs(b + .5 - bx) < Math.abs(a + .5 - bx) ? b : a), m = MRUN.drop(W, h + .5 + rand(-.05, .05), pick(MR_MCOL));
    m.y = .55; SFX.pop(1.4); hopFx[h] = 1; demoT = 0;
  }

  /* ── layout: the pegboard (12 × 8 cells) plus a tray on the right (wide screens) or underneath (tall ones) ── */
  function lay() {
    const Wc = C.w, Hc = C.h, n = tray.length, land = Wc / Hc >= 1.15; let u, tw = 0, th = 0, tcols = 1, per = n;
    if (n && land) { tcols = n > 4 ? 2 : 1; tw = tcols * 1.5 + .3; u = Math.min(Hc / ROWS, Wc / (COLS + tw)) * .97; }
    else if (n) { per = n > 5 ? Math.ceil(n / 2) : n; th = Math.ceil(n / per) * 1.2 + .3; u = Math.min(Wc / COLS, Hc / (ROWS + th)) * .97; }
    else u = Math.min(Hc / ROWS, Wc / COLS) * .97;
    const bw = COLS * u, bh = ROWS * u, x0 = (Wc - bw - tw * u) / 2, y0 = (Hc - bh - th * u) / 2, Lo = { u, x0, y0, bw, bh, slots: [], tray: null };
    if (n && land) { const tx = x0 + bw + .3 * u, rows = Math.ceil(n / tcols), sh = Math.min(1.6 * u, bh / rows); for (let i = 0; i < n; i++) Lo.slots.push({ x: tx + (i % tcols) * 1.5 * u, y: y0 + Math.floor(i / tcols) * sh, w: 1.4 * u, h: sh - .12 * u }); Lo.tray = { x: tx, y: y0, w: tcols * 1.5 * u, h: rows * sh }; }
    else if (n) { const ty = y0 + bh + .3 * u, sw = bw / per; for (let i = 0; i < n; i++) Lo.slots.push({ x: x0 + (i % per) * sw, y: ty + Math.floor(i / per) * 1.2 * u, w: sw - .12 * u, h: 1.1 * u }); Lo.tray = { x: x0, y: ty, w: bw, h: th * u - .3 * u }; }
    return Lo;
  }
  let LO = null; const toPx = (bx, by) => { const Lo = LO || lay(); return [Lo.x0 + bx * Lo.u, Lo.y0 + by * Lo.u]; };

  /* ── drawing ── */
  function board(Lo) {   // the wooden pegboard, cached
    const key = `${Lo.u.toFixed(2)}|${C.dpr}`; if (bg && bgKey === key) return bg; bgKey = key;
    const c = document.createElement('canvas'), d = C.dpr, u = Lo.u; c.width = Math.ceil(Lo.bw * d); c.height = Math.ceil(Lo.bh * d); const b = c.getContext('2d'); b.scale(d, d);
    const gr = b.createLinearGradient(0, 0, 0, Lo.bh); gr.addColorStop(0, '#d9a467'); gr.addColorStop(1, '#b37a42'); b.fillStyle = gr; b.fillRect(0, 0, Lo.bw, Lo.bh);
    let s = 7; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    b.strokeStyle = 'rgba(110,60,20,.18)'; b.lineWidth = Math.max(1, u * .02);
    for (let i = 0; i < 46; i++) { const y = rnd() * Lo.bh, a = rnd() * u * .3; b.beginPath(); b.moveTo(0, y); for (let xx = 0; xx <= Lo.bw + u; xx += u * .5) b.lineTo(xx, y + Math.sin(xx / u * 1.3 + i) * a); b.stroke(); }
    b.fillStyle = 'rgba(90,45,10,.35)'; for (let i = 1; i < 4; i++) b.fillRect(i * 3 * u - 1, 0, 2, Lo.bh);
    b.fillStyle = 'rgba(60,30,8,.55)'; for (let r = 1; r < ROWS; r++) for (let q = 1; q < COLS; q++) { b.beginPath(); b.arc(q * u, r * u, u * .045, 0, 7); b.fill(); }
    b.fillStyle = 'rgba(0,0,0,.18)'; b.fillRect(0, 0, Lo.bw, u * .9); b.fillStyle = '#6b3d1f'; b.fillRect(0, u * .9, Lo.bw, u * .06);
    b.strokeStyle = '#5a3216'; b.lineWidth = u * .12; b.strokeRect(0, 0, Lo.bw, Lo.bh);
    return bg = c;
  }
  const line = (a, b, c, d, w, col) => { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); };
  const peg = (px, py, u) => { x.fillStyle = '#f2f2ee'; x.beginPath(); x.arc(px, py, u * .045, 0, 7); x.fill(); x.fillStyle = '#555'; x.beginPath(); x.arc(px, py, u * .018, 0, 7); x.fill(); };
  /* one piece; Lo gives the scale + origin (the board, or a tray slot); i = its index for bell/tramp/spinner animation */
  function drawPiece(p, Lo, i = -1, alpha = 1, tint) {
    const d = DEF[p.k], u = Lo.u, X = v => Lo.x0 + (p.c + (p.f ? d.w - v : v)) * u, Y = v => Lo.y0 + (p.r + v) * u, col = tint || p.col || TT.blue, f = (fx[i] || {}).t || 0;
    x.save(); x.globalAlpha = alpha; x.lineCap = 'round'; x.lineJoin = 'round';
    if (p.k === 'ramp' || p.k === 'long' || p.k === 'steep') {
      const [s0, s1] = d.segs; [[.05, 'rgba(0,0,0,.25)']].forEach(([o, c]) => { line(X(s0[0]) + o * u, Y(s0[1]) + o * u, X(s0[2]) + o * u, Y(s0[3]) + o * u, u * .15, c); line(X(s1[0]) + o * u, Y(s1[1]) + o * u, X(s1[2]) + o * u, Y(s1[3]) + o * u, u * .13, c); });
      line(X(s1[0]), Y(s1[1]), X(s1[2]), Y(s1[3]), u * .13, col); line(X(s0[0]), Y(s0[1]), X(s0[2]), Y(s0[3]), u * .15, col);
      line(X(s0[0]), Y(s0[1]) - u * .035, X(s0[2]), Y(s0[3]) - u * .035, u * .035, 'rgba(255,255,255,.4)');
      [.2, .8].forEach(k => peg(lerp(X(s0[0]), X(s0[2]), k), lerp(Y(s0[1]), Y(s0[3]), k) + u * .02, u));
    } else if (p.k === 'xylo') {
      const bars = [TT.red, TT.orange, TT.yellow, TT.green]; d.segs.forEach((s, j) => {
        line(X(s[0]) + u * .04, Y(s[1]) + u * .05, X(s[2]) + u * .04, Y(s[3]) + u * .05, u * .13, 'rgba(0,0,0,.25)');
        line(X(s[0]), Y(s[1]), X(s[2]), Y(s[3]), u * .13, j ? (tint || bars[j - 1]) : (tint || '#7a4a26'));
        if (j) { peg(X(s[0]) + (p.f ? -1 : 1) * u * .06, Y(s[1]), u); peg(X(s[2]) - (p.f ? -1 : 1) * u * .06, Y(s[3]), u); } });
    } else if (p.k === 'funnel') {
      const [a, b] = d.segs; x.fillStyle = tint || 'rgba(31,199,182,.28)'; x.beginPath(); x.moveTo(X(a[0]), Y(a[1])); x.lineTo(X(a[2]), Y(a[3])); x.lineTo(X(b[2]), Y(b[3])); x.lineTo(X(b[0]), Y(b[1])); x.fill();
      d.segs.forEach(s => { line(X(s[0]) + u * .04, Y(s[1]) + u * .05, X(s[2]) + u * .04, Y(s[3]) + u * .05, u * .14, 'rgba(0,0,0,.25)'); line(X(s[0]), Y(s[1]), X(s[2]), Y(s[3]), u * .14, tint || TT.teal); peg(X(s[0]), Y(s[1]) + u * .05, u); });
    } else if (p.k === 'bell') {
      const [cx0, cy0, rr] = d.circ, cx = X(cx0), cy = Y(cy0), r = rr * u * 1.15, sw = Math.sin(t * 22) * f * .45;
      line(cx, Y(0) + u * .02, cx, cy - r * .95, u * .04, '#6b4a2a'); peg(cx, Y(0) + u * .06, u);
      x.translate(cx, cy - r); x.rotate(sw); x.translate(0, r);
      const gr = x.createLinearGradient(-r, 0, r, 0); gr.addColorStop(0, '#b8860b'); gr.addColorStop(.4, '#ffe27a'); gr.addColorStop(1, '#c99a1a');
      x.fillStyle = tint || gr; x.beginPath(); x.moveTo(-r * 1.05, r * .55); x.quadraticCurveTo(-r * .9, -r * .2, -r * .45, -r * .75); x.quadraticCurveTo(0, -r * 1.05, r * .45, -r * .75); x.quadraticCurveTo(r * .9, -r * .2, r * 1.05, r * .55); x.closePath(); x.fill();
      x.fillStyle = tint || '#a87808'; x.fillRect(-r * 1.1, r * .5, r * 2.2, r * .16); x.fillStyle = '#5a3a08'; x.beginPath(); x.arc(Math.sin(t * 22 + 1) * f * r * .3, r * .78, r * .16, 0, 7); x.fill();
    } else if (p.k === 'tramp') {
      const s = d.segs[0], sag = Math.sin(t * 34) * f * u * .12, mx = (X(s[0]) + X(s[2])) / 2, my = (Y(s[1]) + Y(s[3])) / 2 + sag;
      [[s[0], s[1]], [s[2], s[3]]].forEach(([a, b]) => line(X(a), Y(b), X(a), Y(.98), u * .08, tint || col));
      x.strokeStyle = tint || '#1a1a1a'; x.lineWidth = u * .09; x.beginPath(); x.moveTo(X(s[0]), Y(s[1])); x.quadraticCurveTo(mx, my + sag, X(s[2]), Y(s[3])); x.stroke();
      [[s[0], s[1]], [s[2], s[3]]].forEach(([a, b]) => { x.fillStyle = tint || col; x.beginPath(); x.arc(X(a), Y(b), u * .08, 0, 7); x.fill(); });
    } else if (p.k === 'spin') {
      const sp = W && i >= 0 ? W.spins.find(q => q.pi === i) : null, a = sp ? sp.a : t, cx = X(.5), cy = Y(.5), r = u * .36;
      line(cx, cy, cx, Y(.98), u * .07, '#6b4a2a');
      [TT.red, TT.yellow, TT.blue, TT.green].forEach((c, j) => { const an = a + j * Math.PI / 2; x.fillStyle = tint || c; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); x.lineTo(cx + Math.cos(an + .9) * r * .7, cy + Math.sin(an + .9) * r * .7); x.closePath(); x.fill(); });
      peg(cx, cy, u);
    } else if (p.k === 'cup') {
      const [a, b, c] = d.segs; x.fillStyle = tint || 'rgba(200,235,255,.22)'; x.beginPath(); x.moveTo(X(a[0]), Y(a[1])); x.lineTo(X(b[0]), Y(b[1])); x.lineTo(X(c[0]), Y(c[1])); x.lineTo(X(c[2]), Y(c[3])); x.closePath(); x.fill();
      d.segs.forEach(s => line(X(s[0]), Y(s[1]), X(s[2]), Y(s[3]), u * .11, tint || 'rgba(255,255,255,.9)'));
      line(X(.3), Y(.25), X(.3), Y(.75), u * .05, 'rgba(255,255,255,.35)');
      const cu = W && i >= 0 ? W.cups.find(q => q.pi === i) : null;
      if (cu && cu.n && !tint) { x.fillStyle = 'rgba(255,255,255,.75)'; x.font = `bold ${u * .42}px ${PXF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(cu.n, X(1), Y(.62)); }
    }
    x.restore();
  }
  function drawMarble(m, Lo) {
    const [px, py] = toPx(m.x, m.y), r = R * Lo.u; x.save(); x.globalAlpha = clamp(m.fade, 0, 1);
    x.fillStyle = m.col; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); x.clip();
    x.translate(px, py); x.rotate(m.a); x.fillStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.ellipse(0, 0, r * 1.1, r * .28, .5, 0, 7); x.fill(); x.rotate(-m.a); x.translate(-px, -py);
    const gr = x.createRadialGradient(px - r * .4, py - r * .45, r * .05, px, py, r * 1.05); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.3, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.45)');
    x.fillStyle = gr; x.fillRect(px - r, py - r, r * 2, r * 2); x.restore();
  }
  function drawHopper(h, Lo) {
    const u = Lo.u, cx = Lo.x0 + (h + .5) * u, top = Lo.y0 + .06 * u, bot = Lo.y0 + .6 * u, k = hopFx[h] || 0;
    x.save(); x.translate(cx, top); x.scale(1 + k * .1, 1 - k * .08); x.translate(-cx, -top);
    x.fillStyle = '#2b2b2b'; x.beginPath(); x.moveTo(cx - .5 * u, top); x.lineTo(cx + .5 * u, top); x.lineTo(cx + .2 * u, bot); x.lineTo(cx - .2 * u, bot); x.closePath(); x.fill();
    x.fillStyle = TT.yellow; x.fillRect(cx - .5 * u, top, u, .08 * u);
    [[-.18, .2, 0], [.18, .2, 3], [0, .36, 6]].forEach(([dx, dy, ci]) => { x.fillStyle = MR_MCOL[(ci + h) % MR_MCOL.length]; x.beginPath(); x.arc(cx + dx * u, top + dy * u, R * u * .9, 0, 7); x.fill(); });
    x.restore();
    if (mode !== 'build' && W && !W.marbles.length) { x.globalAlpha = .55 + .45 * Math.sin(t * 6); x.fillStyle = TT.white; x.beginPath(); x.moveTo(cx - .16 * u, bot + .08 * u); x.lineTo(cx + .16 * u, bot + .08 * u); x.lineTo(cx, bot + .3 * u); x.fill(); x.globalAlpha = 1; }
  }
  function drawTray(Lo) {
    tray.forEach((tp, i) => {
      const s = Lo.slots[i]; if (!s) return; const d = DEF[tp.k];
      x.fillStyle = 'rgba(217,164,103,.55)'; x.fillRect(s.x, s.y, s.w, s.h); x.strokeStyle = 'rgba(255,255,255,.3)'; x.lineWidth = 1; x.strokeRect(s.x + .5, s.y + .5, s.w - 1, s.h - 1);
      const su = Math.min(s.w * .86 / d.w, s.h * .68); drawPiece({ k: tp.k, c: 0, r: 0, f: tp.f, col: PAL[i % PAL.length] }, { u: su, x0: s.x + (s.w - d.w * su) / 2, y0: s.y + (s.h - su) / 2 + su * .16 });
    });
  }
  const snapOf = (d, Lo) => { const bx = (d.px - Lo.x0) / Lo.u, by = (d.py - Lo.y0) / Lo.u; if (bx < 0 || bx >= COLS || by < 0 || by >= ROWS) return null; return { k: d.k, c: Math.round(bx - d.gx), r: Math.floor(by - d.gy + .5), f: d.f }; };
  const inTray = (d, Lo) => Lo.tray && d.px >= Lo.tray.x - 6 && d.px <= Lo.tray.x + Lo.tray.w + 6 && d.py >= Lo.tray.y - 6 && d.py <= Lo.tray.y + Lo.tray.h + 6;

  /* ── input ── */
  const pieceAt = (bx, by) => pieces.findIndex(p => !p.fixed && MRUN.cells(p).some(([c, r]) => c === Math.floor(bx) && r === Math.floor(by)));
  g.on(C.cv, 'pointerdown', e => {
    if (g.paused() || drag) return; const Lo = lay(), q = C.pos(e), bx = (q.x - Lo.x0) / Lo.u, by = (q.y - Lo.y0) / Lo.u;
    try { C.cv.setPointerCapture(e.pointerId); } catch (_) {}
    const si = Lo.slots.findIndex(s => q.x >= s.x && q.x <= s.x + s.w && q.y >= s.y && q.y <= s.y + s.h);
    if (si >= 0) { const tp = tray[si]; drag = { k: tp.k, f: tp.f, gx: DEF[tp.k].w / 2, gy: .5, from: null, id: e.pointerId, px: q.x, py: q.y, moved: true }; SFX.tap(); return; }
    if (bx < 0 || bx >= COLS || by < 0 || by >= ROWS) return;
    if (mode === 'fix' || mode === 'build') {
      const i = pieceAt(bx, by); if (i >= 0) { const p = pieces[i]; drag = { k: p.k, f: p.f, gx: bx - p.c, gy: by - p.r, from: p, id: e.pointerId, px: q.x, py: q.y, sx: q.x, sy: q.y, moved: false }; return; }
      if (hint && pz && !solved && MRUN.cells(pz).some(([c, r]) => c === Math.floor(bx) && r === Math.floor(by)) && MRUN.fits(pz, pieces)) { pieces.push({ ...pz, fixed: false, col: TT.yellow }); rebuild(); hint = false; SFX.good(); return; }
    }
    dropAt(bx);
  });
  g.on(C.cv, 'pointermove', e => { if (!drag || e.pointerId !== drag.id) return; const q = C.pos(e); drag.px = q.x; drag.py = q.y; if (!drag.moved && Math.hypot(q.x - drag.sx, q.y - drag.sy) > 10) drag.moved = true; });
  const finish = e => {
    if (!drag || (e && e.pointerId !== drag.id)) return; const d = drag, Lo = lay(); drag = null;
    if (d.from && !d.moved) { if (!MR_SYM[d.k]) { d.from.f = d.from.f ? 0 : 1; rebuild(); tone(700, .07, 'triangle', .1); tone(900, .07, 'triangle', .08, .05); saveBuild(); } else dropAt(d.from.c + DEF[d.k].w / 2 - .5); return; }
    const cand = snapOf(d, Lo);
    if (!cand || inTray(d, Lo)) { if (d.from) { pieces.splice(pieces.indexOf(d.from), 1); rebuild(); SFX.whoosh(); saveBuild(); } return; }
    if (MRUN.fits(cand, pieces, d.from)) { if (d.from) Object.assign(d.from, cand); else pieces.push({ ...cand, fixed: false, col: pick(PAL) }); rebuild(); hint = false; tone(380, .06, 'square', .05); noise(.04, .12, 'bandpass', 1600, 0, 2); saveBuild(); }
    else SFX.bad();
  };
  g.on(C.cv, 'pointerup', finish); g.on(C.cv, 'pointercancel', () => { drag = null; });
  g.key = e => { if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault && e.preventDefault(); dropAt(hops[(t * 2 | 0) % Math.max(1, hops.length)] + .5); } };

  g.levels(4, start);
  g.loop(dt => {
    t += dt; const Lo = LO = lay(), u = Lo.u, Wc = C.w, Hc = C.h; if (u < 4) return;
    if (W) MRUN.step(W, dt, onEv);
    if (demoT > 0 && (demoT -= dt) <= 0 && mode === 'watch' && W && !W.marbles.length) dropAt(hops[0] + .5);
    if (mode === 'fix' && !solved && W) W.marbles.forEach(m => { if (!m.failed && m.floor > .3) { m.failed = true; if (++fails >= 2 && !hint) { hint = true; H.bubble('💡 👆'); tone(1319, .3, 'sine', .08); } } });
    for (const k in fx) fx[k].t = Math.max(0, fx[k].t - dt * 1.5); for (const k in hopFx) hopFx[k] = Math.max(0, hopFx[k] - dt * 5);
    x.fillStyle = '#05060f'; x.fillRect(0, 0, Wc, Hc);
    x.drawImage(board(Lo), Lo.x0, Lo.y0, Lo.bw, Lo.bh);
    if (drag && mode === 'build') { x.fillStyle = 'rgba(255,255,255,.07)'; for (let r = 1; r < ROWS; r++) for (let q = 0; q < COLS; q++) if ((q + r) % 2) x.fillRect(Lo.x0 + q * u, Lo.y0 + r * u, u, u); }
    hops.forEach(h => drawHopper(h, Lo));
    pieces.forEach((p, i) => { if (!p.fixed && mode !== 'watch') { x.fillStyle = 'rgba(255,255,255,.1)'; MRUN.cells(p).forEach(([c, r]) => x.fillRect(Lo.x0 + c * u + 1, Lo.y0 + r * u + 1, u - 2, u - 2)); } if (p.k !== 'cup' && p !== (drag && drag.from)) drawPiece(p, Lo, i); });
    if (W) W.marbles.forEach(m => drawMarble(m, Lo));
    pieces.forEach((p, i) => { if (p.k === 'cup' && p !== (drag && drag.from)) drawPiece(p, Lo, i); });
    if (hint && pz && !solved) { const a = .35 + .3 * Math.sin(t * 6); drawPiece({ ...pz, col: TT.yellow }, Lo, -1, a); x.font = `${u * .6}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('👆', Lo.x0 + (pz.c + DEF[pz.k].w / 2) * u, Lo.y0 + (pz.r + 1.3 + Math.sin(t * 5) * .1) * u); }
    rings = rings.filter(r => (r.t += dt) < .8); rings.forEach(r => { x.strokeStyle = `rgba(255,226,122,${(1 - r.t / .8).toFixed(2)})`; x.lineWidth = u * .05; x.beginPath(); x.arc(r.x, r.y, u * (.25 + r.t * .6), 0, 7); x.stroke(); });
    if (tray.length) drawTray(Lo);
    if (drag) { const cand = snapOf(drag, Lo), ok = cand && !inTray(drag, Lo) && MRUN.fits(cand, pieces, drag.from);
      if (cand && !inTray(drag, Lo)) drawPiece(cand, Lo, -1, .6, ok ? null : 'rgba(255,61,61,.8)');
      if (!cand || inTray(drag, Lo)) { const d = DEF[drag.k]; drawPiece({ k: drag.k, c: 0, r: 0, f: drag.f, col: TT.white }, { u, x0: drag.px - drag.gx * u, y0: drag.py - drag.gy * u }, -1, .7); } }
    P.update(dt); P.draw(x);
  });
});
GBY.marble.mash = true;
