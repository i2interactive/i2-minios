/* ═════════ NEW APPS · part 7 — multiplayer: air hockey, match-up ═════════ */
Object.entries({ hockey: ['Air Hockey', 'Hockey de Aire', 'Air Hockey', 'Hóquei de Mesa', 'エアホッケー', '桌上冰球'], matchup: ['Match-Up', 'Parejas', 'Paires', 'Pares', 'ペアさがし', '配对对战'] })
  .forEach(([id, a]) => LANG6.forEach((k, i) => { if (L[k]) L[k].games[id] = a[i]; }));

/* AIR HOCKEY — kid vs Robo, or two players on one screen (each side touches their half; keys W/A/S/D and arrows) */
game('hockey', 'play', '🏒', g => {
  const H = g.host('robo'); g.stage.classList.add('col'); const wrap = mk('div', 'paintWrap'); g.stage.appendChild(wrap);
  const C = g.canvas(wrap), x = C.ctx, P = new Particles(); let two = !!PROG.hockey2p, lv = 1, sc = [0, 0], over = false, flash = 0, t = 0;
  const pad = [{ x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0 }, { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0 }], puck = { x: 0, y: 0, vx: 0, vy: 0 }, keys = {};
  const F = () => { const m = Math.min(C.w, C.h) * .05; return { l: m, r: C.w - m, t: m, b: C.h - m, cx: C.w / 2, cy: C.h / 2, gh: (C.h - 2 * m) * .36 }; };
  const R = () => Math.min(C.w, C.h) * .075, PR = () => Math.min(C.w, C.h) * .04;
  const AI = { 1: 180, 2: 290, 3: 400, 4: 520 };
  function serve(toward) { const f = F(); puck.x = f.cx; puck.y = f.cy; puck.vx = 0; puck.vy = 0; if (toward != null) { puck.vx = (toward ? 1 : -1) * 60; puck.vy = rand(-40, 40); } pad[0].x = pad[0].tx = f.l + (f.r - f.l) * .15; pad[1].x = pad[1].tx = f.r - (f.r - f.l) * .15; pad[0].y = pad[0].ty = pad[1].y = pad[1].ty = f.cy; }
  function reset() { sc = [0, 0]; over = false; serve(null); H.bubble(two ? '👫 🏒' : '🏒 vs 🤖'); }
  let p2upd = () => {}; const tb = g.tool(two ? '👫' : '🤖', b => { two = !two; PROG.hockey2p = two; saveProg(); b.textContent = two ? '👫' : '🤖'; p2upd(); reset(); }); p2upd = p2Tool(g, () => two);
  const ptrs = new Map();
  const aimAt = e => { const p = C.pos(e), side = p.x < C.w / 2 ? 0 : 1; if (side === 1 && !two) return; pad[side].tx = p.x; pad[side].ty = p.y; ptrs.set(e.pointerId, side); };
  g.on(C.cv, 'pointerdown', e => { try { C.cv.setPointerCapture(e.pointerId); } catch (_) {} aimAt(e); });
  g.on(C.cv, 'pointermove', e => { if (ptrs.has(e.pointerId) || e.pointerType === 'mouse') aimAt(e); });
  ['pointerup', 'pointercancel'].forEach(ev => g.on(C.cv, ev, e => ptrs.delete(e.pointerId)));
  g.key = e => { keys[e.key.toLowerCase()] = 1; e.preventDefault && e.preventDefault(); };
  g.on(document, 'keyup', e => { keys[e.key.toLowerCase()] = 0; });
  C.onResize = () => serve(null);
  g.levels(4, n => { lv = n; g.meter(1); reset(); });
  g.loop(dt => {
    t += dt; const f = F(), r = R(), pr = PR(), W = C.w, Hh = C.h; flash = Math.max(0, flash - dt);
    /* keyboard */
    const kb = (side, up, dn, lf, rt) => { const s = 520 * dt; if (keys[up]) pad[side].ty -= s; if (keys[dn]) pad[side].ty += s; if (keys[lf]) pad[side].tx -= s; if (keys[rt]) pad[side].tx += s; };
    kb(0, 'w', 's', 'a', 'd'); if (two) kb(1, 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'); else kb(0, 'arrowup', 'arrowdown', 'arrowleft', 'arrowright');
    /* robo */
    if (!two && !over) { const p = pad[1], home = f.r - (f.r - f.l) * .15; if (puck.x > f.cx - r) { p.tx = puck.x + r * .6; p.ty = puck.y; } else { p.tx = home; p.ty = f.cy + (puck.y - f.cy) * .5; } const sp = AI[lv] * dt, dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy); if (d > sp) { p.tx = p.x + dx / d * sp; p.ty = p.y + dy / d * sp; } }
    pad.forEach((p, i) => { const minX = i ? f.cx + r : f.l + r, maxX = i ? f.r - r : f.cx - r; p.tx = clamp(p.tx, minX, maxX); p.ty = clamp(p.ty, f.t + r, f.b - r); const nx = lerp(p.x, p.tx, Math.min(1, dt * 18)), ny = lerp(p.y, p.ty, Math.min(1, dt * 18)); p.vx = (nx - p.x) / Math.max(dt, 1e-3); p.vy = (ny - p.y) / Math.max(dt, 1e-3); p.x = nx; p.y = ny; });
    if (!over) {
      const sub = 4, h = dt / sub;
      for (let s = 0; s < sub; s++) {
        puck.x += puck.vx * h; puck.y += puck.vy * h; const k = Math.exp(-.35 * h); puck.vx *= k; puck.vy *= k;
        if (puck.y < f.t + pr) { puck.y = f.t + pr; puck.vy = Math.abs(puck.vy) * .9; tone(300, .04, 'square', .03); }
        if (puck.y > f.b - pr) { puck.y = f.b - pr; puck.vy = -Math.abs(puck.vy) * .9; tone(300, .04, 'square', .03); }
        const inGoal = Math.abs(puck.y - f.cy) < f.gh / 2;
        if (puck.x < f.l + pr && !inGoal) { puck.x = f.l + pr; puck.vx = Math.abs(puck.vx) * .9; }
        if (puck.x > f.r - pr && !inGoal) { puck.x = f.r - pr; puck.vx = -Math.abs(puck.vx) * .9; }
        if (puck.x < f.l - pr || puck.x > f.r + pr) { const who = puck.x < f.l ? 1 : 0; sc[who]++; flash = .8; SFX.chime(); P.burst(puck.x < f.l ? f.l : f.r, puck.y, who ? [TT.red, TT.yellow] : [TT.blue, TT.green], 40, 500); if (who === 0) { g.star(1); H.mood('oops', 600); } else H.happy();
          if (sc[who] >= 5) { over = true; const kidWon = who === 0; confettiDOM(g, 60); if (two) { H.bubble(`🏆 ${who ? P2.name() : P2.me()}`); g.after(3500, reset); } else if (kidWon) { g.star(3); g.after(2000, () => { if (g.progress()) g.levelUp(); }); } else { H.bubble('🤖 🏆'); g.after(3000, reset); } }
          else serve(who === 0 ? 1 : 0); break; }
        pad.forEach(p => { const dx = puck.x - p.x, dy = puck.y - p.y, d = Math.hypot(dx, dy); if (d < r + pr && d > 0) { const nx = dx / d, ny = dy / d, rvx = puck.vx - p.vx, rvy = puck.vy - p.vy, vn = rvx * nx + rvy * ny; if (vn < 0) { puck.vx -= 1.9 * vn * nx; puck.vy -= 1.9 * vn * ny; tone(520, .05, 'triangle', .1); } puck.x = p.x + nx * (r + pr); puck.y = p.y + ny * (r + pr); } });
        const sp = Math.hypot(puck.vx, puck.vy), mx = Math.min(C.w, C.h) * 2.2; if (sp > mx) { puck.vx *= mx / sp; puck.vy *= mx / sp; }
      }
    }
    /* draw */
    x.fillStyle = '#05060f'; x.fillRect(0, 0, W, Hh);
    x.fillStyle = '#0c1430'; x.fillRect(f.l, f.t, f.r - f.l, f.b - f.t);
    x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 3; x.beginPath(); x.moveTo(f.cx, f.t); x.lineTo(f.cx, f.b); x.stroke(); x.beginPath(); x.arc(f.cx, f.cy, r * 1.6, 0, 7); x.stroke();
    x.lineWidth = 6; x.strokeStyle = TT.white; x.strokeRect(f.l, f.t, f.r - f.l, f.b - f.t);
    [[f.l, TT.blue], [f.r, TT.red]].forEach(([gx, col]) => { x.strokeStyle = col; x.lineWidth = 10; x.beginPath(); x.moveTo(gx, f.cy - f.gh / 2); x.lineTo(gx, f.cy + f.gh / 2); x.stroke(); });
    x.font = `bold ${Hh * .16}px ${PXF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = flash > 0 ? TT.yellow : 'rgba(255,255,255,.18)'; x.fillText(sc[0], f.cx - (f.r - f.l) * .22, f.cy); x.fillText(sc[1], f.cx + (f.r - f.l) * .22, f.cy);
    if (two) { x.font = `bold ${Hh * .045}px ${PXF}`; x.fillStyle = TT.blue; x.fillText(P2.me().toUpperCase(), f.cx - (f.r - f.l) * .22, f.t + Hh * .06); x.fillStyle = TT.red; x.fillText(P2.name().toUpperCase(), f.cx + (f.r - f.l) * .22, f.t + Hh * .06); }
    pad.forEach((p, i) => { const col = i ? TT.red : TT.blue; x.fillStyle = col; x.shadowColor = col; x.shadowBlur = 20; x.beginPath(); x.arc(p.x, p.y, r, 0, 7); x.fill(); x.shadowBlur = 0; x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(p.x, p.y, r * .45, 0, 7); x.fill(); });
    const me = PROG.buddy || 'foxy', im = spriteImg(two ? (me === 'dino' ? 'foxy' : 'dino') : (me === 'robo' ? 'hoot' : 'robo'), 'idle'), im0 = spriteImg(PROG.buddy || 'foxy', 'idle'); x.imageSmoothingEnabled = false; if (im0.complete) x.drawImage(im0, pad[0].x - r * .55, pad[0].y - r * .7, r * 1.1, r * 1.37); if (im.complete) x.drawImage(im, pad[1].x - r * .55, pad[1].y - r * .7, r * 1.1, r * 1.37);
    x.fillStyle = TT.yellow; x.shadowColor = TT.yellow; x.shadowBlur = 16; x.beginPath(); x.arc(puck.x, puck.y, pr, 0, 7); x.fill(); x.shadowBlur = 0;
    P.update(dt); P.draw(x);
  });
});

/* MATCH-UP — memory pairs, taking turns: you vs Robo, or you vs a grown-up */
game('matchup', 'play', '🎴', g => {
  const H = g.host('hoot'); let two = !!PROG.match2p, cards = [], open = [], turn = 0, sc = [0, 0], busy = false, seen = new Map(), lv = 1;
  g.stage.innerHTML = `<div class="mu"><div class="muSide p0"></div><div class="muGrid"></div><div class="muSide p1"></div></div>`;
  const grid = $('.muGrid', g.stage), sides = [$('.muSide.p0', g.stage), $('.muSide.p1', g.stage)];
  let p2upd = () => {}; const tb = g.tool(two ? '👫' : '🤖', b => { two = !two; PROG.match2p = two; saveProg(); b.textContent = two ? '👫' : '🤖'; p2upd(); deal(); }); p2upd = p2Tool(g, () => two, () => renderSides());
  const SIZES = { 1: [4, 3], 2: [4, 4], 3: [5, 4] };
  const renderSides = () => sides.forEach((s, i) => { s.innerHTML = `${charHTML(i ? (two ? ((PROG.buddy || 'foxy') === 'dino' ? 'foxy' : 'dino') : ((PROG.buddy || 'foxy') === 'robo' ? 'hoot' : 'robo')) : (PROG.buddy || 'foxy'))}${two ? `<i class="muName">${i ? P2.name() : P2.me()}</i>` : ''}<b>${sc[i]}</b>`; s.classList.toggle('turn', i === turn); });
  function deal() {
    const [c, r] = SIZES[lv], n = c * r / 2, set = shuffle(THEMES[weekTheme()].set).slice(0, n);
    cards = shuffle([...set, ...set]).map((e, i) => ({ e, i, up: false, got: false })); open = []; turn = 0; sc = [0, 0]; busy = false; seen = new Map();
    grid.style.setProperty('--c', c); grid.innerHTML = '';
    cards.forEach(cd => { const b = mk('button', 'muCard', `<span class="mb">?</span><span class="mf">${cd.e}</span>`); cd.el = b; b.addEventListener('click', () => { if (busy || (turn === 1 && !two)) return; flip(cd); }); grid.appendChild(b); });
    renderSides(); H.bubble(two ? '👫 🎴' : '🎴 vs 🤖');
  }
  function flip(cd) {
    if (cd.up || cd.got || open.length >= 2) return; cd.up = true; cd.el.classList.add('up'); tone(PENTA[cd.e.codePointAt(0) % 10], .12, 'triangle', .12); seen.set(cd.i, cd.e); open.push(cd);
    if (open.length < 2) return; busy = true; const [a, b] = open;
    if (a.e === b.e) { g.after(500, () => { a.got = b.got = true; a.el.classList.add('got', turn ? 'p1' : 'p0'); b.el.classList.add('got', turn ? 'p1' : 'p0'); sc[turn]++; open = []; busy = false; SFX.good(); if (turn === 0) { g.star(1); H.happy(); } renderSides(); check(); if (!cards.every(c => c.got) && turn === 1 && !two) g.after(700, robo); }); }
    else g.after(1100, () => { a.up = b.up = false; a.el.classList.remove('up'); b.el.classList.remove('up'); open = []; turn = 1 - turn; busy = false; renderSides(); if (turn === 1 && !two) g.after(700, robo); });
  }
  function robo() {
    if (!g.alive() || turn !== 1 || two) return; const mem = { 1: .35, 2: .55, 3: .75 }[lv], left = cards.filter(c => !c.got && !c.up);
    let pairKnown = null; if (Math.random() < mem) { const byE = {}; left.forEach(c => { if (seen.has(c.i)) (byE[c.e] = byE[c.e] || []).push(c); }); pairKnown = Object.values(byE).find(v => v.length >= 2); }
    const first = pairKnown ? pairKnown[0] : pick(left); flip(first);
    g.after(800, () => { if (!g.alive()) return; const rest = cards.filter(c => !c.got && !c.up); let second = pairKnown ? pairKnown[1] : null; if (!second && Math.random() < mem) second = rest.find(c => c.e === first.e && seen.has(c.i)); flip(second || pick(rest)); });
  }
  function check() {
    if (!cards.every(c => c.got)) return; const w = sc[0] === sc[1] ? -1 : sc[0] > sc[1] ? 0 : 1; confettiDOM(g, 50); SFX.chime();
    if (two) { H.bubble(w < 0 ? '🤝' : `🏆 ${w ? P2.name() : P2.me()}`); g.after(3500, deal); }
    else if (w === 0 || w < 0) { g.star(3); H.happy(); g.after(2000, () => { if (g.progress()) g.levelUp(); else deal(); }); }
    else { H.bubble('🤖 🏆'); g.after(3000, deal); }
  }
  g.levels(3, n => { lv = n; g.meter(1); deal(); });
});
