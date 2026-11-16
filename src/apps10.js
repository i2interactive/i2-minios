/* ═════════ NEW APPS · part 10 — SPLASH FLEET (find the hidden boats) ═════════ */
Object.entries({ fleet: ['Splash Fleet', 'Flota Chapuzón', 'Flotte Plouf', 'Frota Splash', 'ふねさがし', '寻船大作战'] })
  .forEach(([id, a]) => LANG6.forEach((k, i) => { if (L[k]) L[k].games[id] = a[i]; }));

/* SPLASH FLEET — the classic hidden-boats grid game, for little hands.
   Lv 1: just find Robo's 3 boats (5×5, a twinkle hint after a few misses).
   Lv 2–4: take turns with Robo (6×6 → 8×8, more boats, Robo gets sharper). A hit = go again.
   👫 two players on one screen: a cover card hides the boards between turns. Tap, or arrows + Space. */
game('fleet', 'play', '🚢', g => {
  const H = g.host('robo'); g.stage.classList.add('col'); const wrap = mk('div', 'paintWrap'); g.stage.appendChild(wrap);
  const C = g.canvas(wrap), x = C.ctx, P = new Particles();
  const LV = {
    1: { n: 5, ships: [2, 2, 1], solo: true, hint: 3 },
    2: { n: 6, ships: [3, 2, 2], ai: .3, mercy: .45, hint: 4 },
    3: { n: 7, ships: [4, 3, 2, 2], ai: .7, mercy: .2, abc: true },
    4: { n: 8, ships: [5, 4, 3, 3, 2], ai: 1, mercy: 0, abc: true, smart: true }
  };
  const BOATC = [TT.red, TT.yellow, TT.green, TT.orange, TT.pink];
  let two = !!PROG.fleet2p, lv = 1, V = LV[1], N = 5, solo = true, fl = [null, null], turn = 0, phase = 'aim', coverWho = 0, won = -1;
  let round = 0, t = 0, missRun = 0, hint = null, balls = [], aim = null, fired = [0, 0];
  const cur = { x: 2, y: 2, on: false };
  const later = (ms, fn) => { const r = round; g.after(ms, () => { if (r === round) fn(); }); };   // timers die with their round
  const me = () => PROG.buddy || 'foxy';
  const spr = i => i === 0 ? me() : two ? (me() === 'dino' ? 'foxy' : 'dino') : (me() === 'robo' ? 'hoot' : 'robo');
  const pname = i => i ? P2.name() : P2.me();

  /* ── fleets ── */
  function mkFleet(n, sizes) {
    for (let tries = 0; tries < 400; tries++) {
      const grid = Array.from({ length: n }, () => Array(n).fill(-1)), boats = [], gap = tries < 300; let ok = true;
      sizes.forEach((s, i) => {
        if (!ok) return; let placed = false;
        for (let k = 0; k < 200 && !placed; k++) {
          const d = randi(0, 1), bx = randi(0, n - (d ? 1 : s)), by = randi(0, n - (d ? s : 1)), cells = [];
          for (let j = 0; j < s; j++) cells.push([bx + (d ? 0 : j), by + (d ? j : 0)]);
          const free = cells.every(([cx, cy]) => { for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) { if (!gap && (ox || oy)) continue; const v = grid[cy + oy] && grid[cy + oy][cx + ox]; if (v != null && v >= 0) return false; } return true; });
          if (!free) continue;
          cells.forEach(([cx, cy]) => grid[cy][cx] = boats.length);
          boats.push({ n: s, d, x: bx, y: by, cells, hits: 0, found: false, col: BOATC[i % BOATC.length], bob: rand(0, 6), glow: 0 }); placed = true;
        }
        if (!placed) ok = false;
      });
      if (ok) return { n, grid, boats, shots: Array.from({ length: n }, () => Array(n).fill(0)), left: boats.length };
    }
    throw new Error('fleet');
  }
  const shotsOn = f => f.shots.some(r => r.some(v => v));

  /* ── layout: big sea = the one you shoot at; small sea = your own boats; panel = whose turn + boats left ── */
  function lay() {
    const W = C.w, Hh = C.h, pad = Math.max(8, Math.min(W, Hh) * .035), m = V.abc ? .08 : 0;
    if (solo) { const top = Hh * .15, S = Math.min(Hh - top - pad, W - pad * 2); return { big: { x: (W - S) / 2, y: top + (Hh - top - pad - S) / 2, s: S }, tray: { x: pad, y: pad * .4, w: W - pad * 2, h: top - pad * .8 } }; }
    if (W / Hh >= 1.2) {
      const S = Math.min(Hh - pad * 2, W * .6) * (1 - m), big = { x: W - pad - S, y: (Hh - S) / 2 + S * m * .5, s: S };
      const room = big.x - pad * 2 - S * m, s = Math.max(10, Math.min(room, Hh * .52)), small = { x: pad + (room - s) / 2, y: Hh - pad - s, s };
      return { big, small, panel: { x: pad, y: pad, w: room, h: small.y - pad * 2 } };
    }
    const S = Math.min(W - pad * 2, Hh * .6) * (1 - m), big = { x: (W - S) / 2 + S * m * .5, y: pad + S * m, s: S };
    const s = Math.max(10, Math.min(Hh - big.y - S - pad * 2, (W - pad * 3) * .5)), small = { x: pad, y: big.y + S + pad, s };
    return { big, small, panel: { x: small.x + s + pad, y: small.y, w: W - small.x - s - pad * 2, h: s } };
  }
  const viewer = () => two ? turn : 0;
  const tgtIdx = () => solo ? 1 : 1 - viewer();
  const boardOf = (k, Lo) => k === tgtIdx() ? Lo.big : Lo.small;

  /* ── a round ── */
  function deal() {
    round++; V = LV[lv]; N = V.n; solo = !!V.solo && !two; fl = [mkFleet(N, V.ships), mkFleet(N, V.ships)];
    turn = 0; won = -1; missRun = 0; hint = null; balls = []; aim = null; fired = [0, 0]; cur.x = cur.y = N >> 1;
    g.meter(two ? 0 : V.ships.length);
    if (two) { phase = 'cover'; coverWho = 0; } else phase = 'aim';
    H.bubble(solo ? '🔎 🚢' : two ? '👫 🚢' : '🚢 vs 🤖'); updTools();
  }
  function endCover() { if (phase !== 'cover') return; turn = coverWho; phase = 'aim'; SFX.tap(); H.bubble('👆 🚢'); updTools(); }

  function fire(cx, cy) {
    const k = tgtIdx(), f = fl[k]; if (cx < 0 || cy < 0 || cx >= f.n || cy >= f.n) return;
    if (f.shots[cy][cx]) { tone(196, .12, 'triangle', .1); return; }
    shoot(two ? turn : 0, cx, cy);
  }
  function shoot(p, cx, cy) {
    phase = 'fly'; fired[p]++; hint = null; updTools();
    balls.push({ k: 1 - p, cx, cy, u: 0, p, up: p === viewer() || solo });
    sweep(320, 760, .22, 'sine', .12);
  }
  function land(b) {
    const f = fl[b.k], Lo = lay(), B = boardOf(b.k, Lo), c = B.s / f.n, px = B.x + (b.cx + .5) * c, py = B.y + (b.cy + .5) * c, v = f.grid[b.cy][b.cx];
    let res = 'miss', bd = null;
    if (v < 0) {
      f.shots[b.cy][b.cx] = 1; noise(.35, .28, 'bandpass', 1100, 0, .8); sweep(700, 220, .2, 'sine', .1);
      P.burst(px, py, ['#9fd8ff', '#ffffff', '#5aa8ff'], 18, c * 3.2, { up: c * 2.5, g: c * 12, life: .6 });
    } else {
      f.shots[b.cy][b.cx] = 2; bd = f.boats[v]; bd.hits++; res = 'hit'; SFX.pop(1.2);
      P.burst(px, py, [TT.yellow, TT.orange, TT.white], 22, c * 4.5, { g: c * 8 });
      if (bd.hits >= bd.n) { bd.found = true; bd.glow = 1.4; f.left--; res = 'found'; later(250, () => { SFX.honk(); SFX.chime(); }); const [mx, my] = bd.cells[bd.cells.length >> 1]; P.burst(B.x + (mx + .5) * c, B.y + (my + .5) * c, COLORS, 40, c * 6, { g: c * 6 }); }
    }
    after(b.p, res, px, py);
  }
  function after(p, res, px, py) {
    const human = two || p === 0, f = fl[1 - p];
    if (human) {
      if (res === 'miss') { missRun++; H.bubble('💦'); }
      else { missRun = 0; if (!two) { g.star(1, ...FX(C, px, py)); H.happy(); } H.bubble(res === 'found' ? '🚢 ✔ ⭐' : '⭐ 👆'); if (res === 'found' && !two) g.progress(); }
      if (f.left === 0) return win(p);
      if (res !== 'miss') { phase = 'aim'; return; }
      if (solo) { phase = 'aim'; giveHint(); return; }
      if (two) { phase = 'wait'; later(1100, () => { phase = 'cover'; coverWho = 1 - p; }); return; }
      phase = 'wait'; giveHint(); later(750, roboTurn); return;
    }
    /* Robo's shot */
    if (f.left === 0) return win(1);
    if (res === 'miss') later(550, () => { phase = 'aim'; turn = 0; H.bubble('👆'); updTools(); });
    else { H.bubble(res === 'found' ? '🤖 🚢 ✔' : '🤖 ⭐'); later(850, roboTurn); }
  }
  function giveHint() {
    if (!V.hint || two || missRun < V.hint) return; const f = fl[1], spots = [];
    f.boats.forEach(bd => { if (!bd.found) bd.cells.forEach(([cx, cy]) => { if (!f.shots[cy][cx]) spots.push([cx, cy]); }); });
    if (spots.length) { const [hx, hy] = pick(spots); hint = { x: hx, y: hy, t: 3 }; missRun = 0; later(300, () => tone(1319, .3, 'sine', .08)); }
  }

  /* ── Robo ── */
  function roboPick(f) {
    const n = f.n, open = [], live = [], isOpen = (a, b) => a >= 0 && b >= 0 && a < n && b < n && !f.shots[b][a];
    for (let y = 0; y < n; y++) for (let xx = 0; xx < n; xx++) { if (!f.shots[y][xx]) open.push([xx, y]); else if (f.shots[y][xx] === 2 && !f.boats[f.grid[y][xx]].found) live.push([xx, y]); }
    if (live.length && Math.random() < V.ai) {
      const cand = [], isLive = (a, b) => live.some(([p, q]) => p === a && q === b);
      live.forEach(([hx, hy]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        if (isLive(hx - dx, hy - dy)) { let ex = hx + dx, ey = hy + dy; while (isLive(ex, ey)) { ex += dx; ey += dy; } if (isOpen(ex, ey)) cand.push({ p: [ex, ey], w: 3 }); }
        else if (isOpen(hx + dx, hy + dy)) cand.push({ p: [hx + dx, hy + dy], w: 1 });
      }));
      if (cand.length) { const best = Math.max(...cand.map(c => c.w)); return pick(V.smart ? cand.filter(c => c.w === best) : cand).p; }
    }
    if (V.mercy && Math.random() < V.mercy) { const water = open.filter(([a, b]) => f.grid[b][a] < 0); if (water.length) return pick(water); }
    if (V.smart) { const par = open.filter(([a, b]) => (a + b) % 2 === 0); if (par.length) return pick(par); }
    return pick(open);
  }
  function roboTurn() {
    if (!g.alive() || won >= 0 || two) return; turn = 1; phase = 'robo'; updTools();
    const f = fl[0], [tx, ty] = roboPick(f); aim = { x0: randi(0, f.n - 1), y0: randi(0, f.n - 1), tx, ty, u: 0 };
    H.bubble('🤖 🎯'); [0, .15, .3].forEach(d => tone(880, .05, 'square', .04, d));
    later(900, () => { aim = null; if (g.alive() && won < 0) shoot(1, tx, ty); });
  }

  function win(p) {
    phase = 'over'; won = p; balls = []; aim = null; updTools(); confettiDOM(g, 60); SFX.chime();
    if (two) { H.bubble(`🏆 ${pname(p)}`); later(4200, deal); }
    else if (p === 0) { g.star(2); H.happy(); later(1800, () => { if (g.alive()) g.levelUp(); }); }
    else { H.mood('oops', 900); H.bubble('🤖 🏆'); later(4500, deal); }
  }

  /* ── tools: 🤖/👫, player-2 name, 🔀 move my boats (before the first shot) ── */
  let p2upd = () => {};
  g.tool(two ? '👫' : '🤖', b => { two = !two; PROG.fleet2p = two; saveProg(); b.textContent = two ? '👫' : '🤖'; p2upd(); deal(); });
  p2upd = p2Tool(g, () => two);
  const shuf = g.tool('🔀 🚢', () => { if (!canShuffle()) return; fl[viewer()] = mkFleet(N, V.ships); SFX.whoosh(); const Lo = lay(); if (Lo.small) P.burst(Lo.small.x + Lo.small.s / 2, Lo.small.y + Lo.small.s / 2, ['#9fd8ff', '#ffffff'], 24, Lo.small.s * 1.2); });
  const canShuffle = () => !solo && phase === 'aim' && !fired[viewer()] && fl[viewer()] && !shotsOn(fl[viewer()]);
  let shufShown = null; function updTools() { const s = canShuffle(); if (s !== shufShown) { shufShown = s; shuf.style.display = s ? '' : 'none'; } }

  /* ── input ── */
  g.on(C.cv, 'pointerdown', e => {
    if (phase === 'cover') { endCover(); return; }
    if (phase !== 'aim') return;
    const p = C.pos(e), B = lay().big, c = B.s / N; cur.on = false;
    fire(Math.floor((p.x - B.x) / c), Math.floor((p.y - B.y) / c));
  });
  g.key = e => {
    const k = e.key, stop = () => e.preventDefault && e.preventDefault();
    if (phase === 'cover') { if (k === ' ' || k === 'Enter') { stop(); endCover(); } return; }
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
    if (d) { stop(); if (!cur.on) { cur.on = true; return; } cur.x = clamp(cur.x + d[0], 0, N - 1); cur.y = clamp(cur.y + d[1], 0, N - 1); tone(520, .04, 'triangle', .06); return; }
    if (k === ' ' || k === 'Enter') { stop(); if (phase === 'aim') { if (!cur.on) { cur.on = true; return; } fire(cur.x, cur.y); } }
  };

  /* ── drawing ── */
  function hullPath(L, c) {
    const w = c * .62, y0 = (c - w) / 2, y1 = y0 + w, m = c * .1, bow = Math.min(c * .55, L * .32), r = w * .3;
    x.beginPath(); x.moveTo(m + r, y0); x.lineTo(L - m - bow, y0); x.quadraticCurveTo(L - m - bow * .15, y0, L - m, c / 2);
    x.quadraticCurveTo(L - m - bow * .15, y1, L - m - bow, y1); x.lineTo(m + r, y1); x.quadraticCurveTo(m, y1, m, y1 - r); x.lineTo(m, y0 + r); x.quadraticCurveTo(m, y0, m + r, y0); x.closePath();
    return { w, y0, y1, m, bow };
  }
  /* top-down cartoon boat on a strip of n cells; (px, py) = its top-left cell corner; d = 1 → bow points down */
  function drawBoat(px, py, c, n, d, col, alpha = 1, bob = 0, moving = true) {
    const L = n * c; x.save(); x.globalAlpha = alpha; x.translate(px, py); if (d) { x.translate(c, 0); x.rotate(Math.PI / 2); }
    if (moving) x.translate(Math.sin(t * 1.7 + bob) * c * .03, Math.sin(t * 2.4 + bob) * c * .025);
    if (moving) { x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = Math.max(1, c * .03); const ph = (t * 1.5 + bob) % 1; for (let i = 0; i < 2; i++) { const k = (ph + i * .5) % 1, wx = c * .1 - k * c * .3; x.globalAlpha = alpha * (1 - k) * .8; x.beginPath(); x.moveTo(wx, c * .5 - c * (.18 + k * .15)); x.lineTo(wx - c * .04, c * .5); x.lineTo(wx, c * .5 + c * (.18 + k * .15)); x.stroke(); } x.globalAlpha = alpha; }
    const h = hullPath(L, c); x.fillStyle = col; x.fill(); x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = Math.max(1, c * .045); x.stroke();
    x.fillStyle = 'rgba(255,255,255,.22)'; x.fillRect(h.m + c * .12, h.y0 + c * .08, Math.max(0, L - h.m * 2 - h.bow * .7 - c * .12), h.w - c * .16);
    if (n === 1) {
      x.strokeStyle = '#6b3d1f'; x.lineWidth = Math.max(1.5, c * .06); x.beginPath(); x.moveTo(c * .45, h.y0 - c * .1); x.lineTo(c * .45, h.y1 + c * .1); x.stroke();
      x.fillStyle = '#6b3d1f'; x.fillRect(c * .38, c * .5 - c * .05, c * .16, c * .1);
    } else {
      const cw = Math.min(L * .36, c * 1.3), cx0 = h.m + c * .2, ch = h.w * .52, cy0 = c / 2 - ch / 2;
      x.fillStyle = TT.white; x.fillRect(cx0, cy0, cw, ch); x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = Math.max(1, c * .03); x.strokeRect(cx0, cy0, cw, ch);
      x.fillStyle = '#2a6df4'; const nw = Math.max(1, Math.floor(cw / (c * .22))); for (let i = 0; i < nw; i++) x.fillRect(cx0 + (cw / nw) * (i + .5) - c * .045, c / 2 - c * .045, c * .09, c * .09);
      let fx = cx0 + cw + c * .2;
      if (n >= 3) { x.fillStyle = '#f2f2ee'; x.beginPath(); x.arc(fx, c / 2, c * .13, 0, 7); x.fill(); x.fillStyle = '#1a1a1a'; x.beginPath(); x.arc(fx, c / 2, c * .07, 0, 7); x.fill();
        if (moving) { x.fillStyle = 'rgba(255,255,255,.55)'; const k = (t * .8 + bob) % 1; x.globalAlpha = alpha * (1 - k) * .7; x.beginPath(); x.arc(fx - k * c * .5, c / 2 - k * c * .1, c * (.06 + k * .08), 0, 7); x.fill(); x.globalAlpha = alpha; }
        fx += c * .25; }
      if (n >= 4) { const cargo = [TT.blue, TT.yellow, TT.red, TT.green, TT.purple]; const end = L - h.m - h.bow * .9; let i = 0; for (let cx1 = fx; cx1 + c * .3 <= end; cx1 += c * .36, i++) { x.fillStyle = cargo[i % cargo.length]; x.fillRect(cx1, c / 2 - h.w * .3, c * .3, h.w * .6); x.strokeStyle = 'rgba(0,0,0,.35)'; x.strokeRect(cx1, c / 2 - h.w * .3, c * .3, h.w * .6); } }
      x.fillStyle = TT.white; x.beginPath(); x.moveTo(L - h.m - h.bow * .55, c / 2); x.lineTo(L - h.m - h.bow * .55 - c * .16, c / 2 - c * .08); x.lineTo(L - h.m - h.bow * .55 - c * .16, c / 2 + c * .08); x.fill();
    }
    x.restore();
  }
  function marker(cx, cy, c, kind) {
    const X = cx + c / 2, Y = cy + c / 2;
    if (kind === 1) { x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = Math.max(1.5, c * .06); x.beginPath(); x.arc(X, Y, c * .2, 0, 7); x.stroke(); x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.arc(X, Y, c * .06, 0, 7); x.fill(); }
    else if (kind === 3) { starPath(x, X, Y, c * .15, t * .8); x.fillStyle = TT.yellow; x.fill(); x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = Math.max(1, c * .025); x.stroke(); }   // a found boat keeps small stars so it stays visible
    else { x.fillStyle = TT.orange; x.shadowColor = TT.orange; x.shadowBlur = c * .3; x.beginPath(); x.arc(X, Y, c * .3, 0, 7); x.fill(); x.shadowBlur = 0; starPath(x, X, Y, c * .22, t * .8); x.fillStyle = TT.yellow; x.fill(); }
  }
  function drawSea(B, f, own, target) {
    const n = f.n, c = B.s / n, gr = x.createLinearGradient(0, B.y, 0, B.y + B.s);
    gr.addColorStop(0, own ? '#1a3d9e' : '#1d56e0'); gr.addColorStop(1, own ? '#0b1f5c' : '#0a2a8a'); x.fillStyle = gr; x.fillRect(B.x, B.y, B.s, B.s);
    x.strokeStyle = 'rgba(255,255,255,.13)'; x.lineWidth = Math.max(1, c * .04);
    for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) { const wx = B.x + q * c + c * .3, wy = B.y + r * c + c * .55 + Math.sin(t * 2 + q * 1.3 + r) * c * .05; x.beginPath(); x.moveTo(wx, wy); x.quadraticCurveTo(wx + c * .1, wy - c * .08, wx + c * .2, wy); x.quadraticCurveTo(wx + c * .3, wy + c * .08, wx + c * .4, wy); x.stroke(); }
    x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = 1; x.beginPath(); for (let i = 1; i < n; i++) { x.moveTo(B.x + i * c, B.y); x.lineTo(B.x + i * c, B.y + B.s); x.moveTo(B.x, B.y + i * c); x.lineTo(B.x + B.s, B.y + i * c); } x.stroke();
    if (target && V.abc) { x.fillStyle = 'rgba(255,255,255,.6)'; x.font = `bold ${c * .3}px ${PXF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; for (let i = 0; i < n; i++) { x.fillText('ABCDEFGH'[i], B.x + (i + .5) * c, B.y - c * .25); x.fillText(i + 1, B.x - c * .25, B.y + (i + .5) * c); } }
    x.save(); x.beginPath(); x.rect(B.x, B.y, B.s, B.s); x.clip();
    f.boats.forEach(bd => {
      const show = own || bd.found || won >= 0; if (!show) return;
      const dim = own && bd.found ? .4 : !own && !bd.found ? .5 : 1;
      drawBoat(B.x + bd.x * c, B.y + bd.y * c, c, bd.n, bd.d, bd.col, dim, bd.bob, !(own && bd.found));
      if (bd.glow > 0 && !own) { x.strokeStyle = TT.yellow; x.globalAlpha = Math.min(1, bd.glow); x.lineWidth = c * .08; const w = bd.d ? c : bd.n * c, h = bd.d ? bd.n * c : c; x.strokeRect(B.x + bd.x * c + c * .04, B.y + bd.y * c + c * .04, w - c * .08, h - c * .08); x.globalAlpha = 1; }
    });
    for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) if (f.shots[r][q]) marker(B.x + q * c, B.y + r * c, c, f.shots[r][q] === 2 && f.boats[f.grid[r][q]].found ? 3 : f.shots[r][q]);
    x.restore();
    if (target && hint) { const a = .5 + .5 * Math.sin(t * 9); x.globalAlpha = .4 + .6 * a; starPath(x, B.x + (hint.x + .5) * c, B.y + (hint.y + .5) * c, c * (.18 + .1 * a), t * 2); x.fillStyle = TT.white; x.fill(); x.globalAlpha = 1; }
    if (target && cur.on && phase === 'aim') { x.strokeStyle = TT.yellow; x.lineWidth = Math.max(2, c * .07); x.setLineDash([c * .14, c * .1]); x.lineDashOffset = -t * 30; x.strokeRect(B.x + cur.x * c + 2, B.y + cur.y * c + 2, c - 4, c - 4); x.setLineDash([]); }
    x.lineWidth = Math.max(2, B.s * .008); x.strokeStyle = target ? TT.white : 'rgba(255,255,255,.6)'; x.strokeRect(B.x, B.y, B.s, B.s);
  }
  function drawTray(R, f) {   // solo: the boats still to find
    const tot = f.boats.reduce((a, b) => a + b.n, 0) + f.boats.length - 1, c = Math.min(R.h * .8, R.w / (tot + 1)); let px = R.x + (R.w - tot * c) / 2;
    f.boats.forEach(bd => { drawBoat(px, R.y + (R.h - c) / 2, c, bd.n, 0, bd.found ? bd.col : '#3a4a6a', bd.found ? 1 : .8, bd.bob, bd.found); if (bd.found) { x.fillStyle = TT.green; x.font = `bold ${c * .5}px ${PXF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('✔', px + bd.n * c / 2, R.y + R.h / 2 - c * .55); } px += (bd.n + 1) * c; });
  }
  function drawPanel(R) {
    if (R.w < 30 || R.h < 30) return;
    const act = phase === 'cover' ? -1 : turn, colW = R.w / 2;
    [0, 1].forEach(i => {
      const cx = R.x + colW * (i + .5), sz = Math.min(R.h * .42, colW * .55), on = i === act && won < 0, by = R.y + R.h * .55 - (on ? Math.abs(Math.sin(t * 6)) * sz * .08 : 0);
      if (on) { x.fillStyle = 'rgba(255,214,10,.14)'; x.fillRect(R.x + colW * i + 4, R.y, colW - 8, R.h); x.fillStyle = TT.yellow; x.beginPath(); x.moveTo(cx - sz * .14, by - sz * 1.38); x.lineTo(cx + sz * .14, by - sz * 1.38); x.lineTo(cx, by - sz * 1.22); x.fill(); }
      drawSprite(x, spr(i), won === i ? 'happy' : won >= 0 ? 'oops' : on ? (((t * 3) | 0) % 2 ? 'happy' : 'idle') : 'idle', cx, by, sz);
      x.fillStyle = i ? TT.red : TT.blue; x.font = `bold ${Math.max(10, sz * .2)}px ${PXF}`; x.textAlign = 'center'; x.textBaseline = 'top';
      if (two) x.fillText(pname(i).toUpperCase().slice(0, 10), cx, by + sz * .06);
      const f = fl[i], bc = Math.min(colW * .8 / (f.boats.length * 1.15), R.h * .09), y0 = R.y + R.h - bc * 1.2;
      f.boats.forEach((bd, j) => { const bx = cx - f.boats.length * bc * 1.15 / 2 + j * bc * 1.15; x.globalAlpha = bd.found ? .25 : 1; x.fillStyle = bd.col; x.fillRect(bx, y0, bc, bc); x.globalAlpha = 1; if (bd.found) { x.strokeStyle = TT.white; x.lineWidth = 2; x.beginPath(); x.moveTo(bx, y0); x.lineTo(bx + bc, y0 + bc); x.stroke(); } });
    });
  }
  function drawCover() {
    const W = C.w, Hh = C.h; x.fillStyle = '#05060f'; x.fillRect(0, 0, W, Hh);
    x.fillStyle = coverWho ? TT.red : TT.blue; x.fillRect(0, Hh * .12, W, Hh * .02); x.fillRect(0, Hh * .86, W, Hh * .02);
    const sz = Hh * .34; drawSprite(x, spr(coverWho), ((t * 3) | 0) % 2 ? 'happy' : 'idle', W / 2, Hh * .58 - Math.abs(Math.sin(t * 4)) * sz * .05, sz);
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = TT.white; x.font = `bold ${Hh * .08}px ${PXF}`; x.fillText(pname(coverWho).toUpperCase(), W / 2, Hh * .69);
    x.fillStyle = TT.yellow; x.font = `bold ${Hh * .07}px ${PXF}`; x.globalAlpha = .6 + .4 * Math.sin(t * 5); x.fillText('👆 🚢', W / 2, Hh * .79); x.globalAlpha = 1;
  }

  g.levels(4, n => { lv = n; deal(); });
  g.loop(dt => {
    t += dt; P.update(dt); if (hint && (hint.t -= dt) <= 0) hint = null;
    const W = C.w, Hh = C.h; x.fillStyle = '#05060f'; x.fillRect(0, 0, W, Hh);
    const Lo = lay(); if (Lo.big.s < 30) return;
    fl.forEach(f => f && f.boats.forEach(bd => { bd.glow = Math.max(0, bd.glow - dt); }));
    drawSea(Lo.big, fl[tgtIdx()], false, true);
    if (!solo) drawSea(Lo.small, fl[viewer()], true, false);
    if (solo) drawTray(Lo.tray, fl[1]); else drawPanel(Lo.panel);
    if (aim && Lo.small) { aim.u = Math.min(1, aim.u + dt / .75); const e = 1 - Math.pow(1 - aim.u, 3), c = Lo.small.s / N, ax = Lo.small.x + (lerp(aim.x0, aim.tx, e) + .5) * c, ay = Lo.small.y + (lerp(aim.y0, aim.ty, e) + .5) * c;
      x.strokeStyle = TT.red; x.lineWidth = Math.max(2, c * .07); x.beginPath(); x.arc(ax, ay, c * .32, 0, 7); x.moveTo(ax - c * .45, ay); x.lineTo(ax + c * .45, ay); x.moveTo(ax, ay - c * .45); x.lineTo(ax, ay + c * .45); x.stroke(); }
    balls = balls.filter(b => {
      b.u += dt / .55; const B = boardOf(b.k, Lo), c = B.s / N, tx = B.x + (b.cx + .5) * c, ty = B.y + (b.cy + .5) * c, fx = B.x + B.s / 2, fy = b.up ? Hh + c : -c;
      if (b.u >= 1) { land(b); return false; }
      const u = b.u, bx = lerp(fx, tx, u), byy = lerp(fy, ty, u) - Math.sin(Math.PI * u) * B.s * .35, r = c * .2 * (1 + Math.sin(Math.PI * u) * .7);
      x.fillStyle = 'rgba(0,0,0,.3)'; x.beginPath(); x.arc(lerp(fx, tx, u), lerp(fy, ty, u), r * .6, 0, 7); x.fill();
      x.fillStyle = '#7fd3ff'; x.beginPath(); x.arc(bx, byy, r, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.arc(bx - r * .3, byy - r * .3, r * .3, 0, 7); x.fill();
      return true;
    });
    P.draw(x);
    if (phase === 'cover') drawCover();
    updTools();
  });
});
GBY.fleet.mash = true;   // arrow-key steering shouldn't trip the key-mash guard
