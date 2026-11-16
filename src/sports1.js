/* ═════════ SPORTS 1 · 3D, PS2-feel — bowling 2.0, basketball, darts, penalty kicks ═════════ */
const SPR_TEX = {};
function castTex(n, ex = 'idle') { const k = n + ex + (hatFor(n) || ''); return SPR_TEX[k] || (SPR_TEX[k] = spriteTexture(n, ex)); }
function castSprite(n, h = 1.6, ex = 'idle') { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: castTex(n, ex), transparent: true, alphaTest: .1 })); s.scale.set(h * .8, h, 1); s.center.set(.5, 0); s.userData.h = h; return s; }
function stageLights(scene, o = {}) { scene.add(new THREE.HemisphereLight(0xffffff, o.ground || 0x223344, o.hemi ?? .9)); const d = new THREE.DirectionalLight(0xffffff, o.sun ?? .7); d.position.set(4, 10, 6); scene.add(d); return d; }
function crowd(scene, spots, h = 1.2) { return spots.map(([x, z], i) => { const s = castSprite(CAST_IDS[i % 4], h); s.position.set(x, 0, z); s.userData.ph = Math.random() * 6; scene.add(s); return s; }); }
function cheer(fans, t, on) { fans.forEach(f => { f.position.y = on ? Math.abs(Math.sin(t * 9 + f.userData.ph)) * .5 : Math.abs(Math.sin(t * 2 + f.userData.ph)) * .05; }); }
function confettiDOM(g, n = 40) { const box = mk('div', 'confetti3'); for (let i = 0; i < n; i++) { const c = mk('i'); c.style.cssText = `left:${rand(0, 100)}%;background:${pick(COLORS)};animation-delay:${rand(0, .5).toFixed(2)}s;animation-duration:${rand(1.2, 2.2).toFixed(2)}s`; box.appendChild(c); } g.stage.appendChild(box); setTimeout(() => box.remove(), 2800); }
function pickerBar(g, opts) {
  const bar = mk('div', 'bbar sportBar'); g.stage.appendChild(bar);
  opts.forEach((grp, gi) => { if (gi) bar.appendChild(mk('span', 'gap')); grp.items.forEach((it, i) => { const b = mk('button', 'swatch' + (grp.sel() === i ? ' sel' : ''), it.html); if (it.bg) b.style.background = it.bg; b.dataset.g = gi; b.addEventListener('click', e => { e.stopPropagation(); b.blur(); grp.pick(i); $$(`.swatch[data-g="${gi}"]`, bar).forEach(x => x.classList.toggle('sel', x === b)); SFX.tap(); }); bar.appendChild(b); }); });
  return bar;
}
const BALL_COLS = [TT.blue, TT.red, TT.green, TT.purple, TT.orange, TT.pink, '#111111'];

/* BOWLING 2.0 — real frames, strikes and spares, 6 lanes that get harder */
game('bowling', '3d', '🎳', g => {
  const H = g.host('dino'), V = g.three({ fov: 50 }), { scene, cam } = V, label = overlayLabel(g);
  scene.background = new THREE.Color('#06061a'); stageLights(scene, { ground: 0x222244, hemi: .85 });
  const laneMat = new THREE.MeshLambertMaterial({ map: canvasTex(64, 512, (c, w, h) => { c.fillStyle = '#d9a066'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 6) { c.fillStyle = x % 12 ? '#cf9558' : '#e0ad74'; c.fillRect(x, 0, 6, h); } c.fillStyle = '#3B62FF'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(12 + i * 10, 330); c.lineTo(17 + i * 10, 315); c.lineTo(22 + i * 10, 330); c.fill(); } }) });
  const lane = new THREE.Mesh(new THREE.BoxGeometry(3, .2, 19), laneMat); lane.position.set(0, -.1, -.5); scene.add(lane);
  const bumpers = []; [-1.65, 1.65].forEach(x => { const b = new THREE.Mesh(new THREE.BoxGeometry(.25, .35, 19), new THREE.MeshLambertMaterial({ color: TT.yellow })); b.position.set(x, .1, -.5); scene.add(b); bumpers.push(b); const gut = new THREE.Mesh(new THREE.BoxGeometry(.35, .1, 19), new THREE.MeshLambertMaterial({ color: '#222' })); gut.position.set(x, -.12, -.5); scene.add(gut); });
  const neon = [-1.5, 1.5].map(x => { const m = new THREE.Mesh(new THREE.BoxGeometry(.06, .06, 19), new THREE.MeshBasicMaterial({ color: TT.pink })); m.position.set(x, .03, -.5); scene.add(m); return m; });
  const back = new THREE.Mesh(new THREE.BoxGeometry(5, 3, .3), new THREE.MeshLambertMaterial({ color: '#111' })); back.position.set(0, 1.3, -10.2); scene.add(back);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.2), new THREE.MeshBasicMaterial({ map: canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); [TT.green, TT.blue, TT.red, TT.yellow].forEach((col, i) => { c.fillStyle = col; c.fillRect(i * w / 4, h - 18, w / 4, 18); }); c.fillStyle = TT.white; c.font = `bold 70px ${PXF}`; c.textAlign = 'center'; c.fillText(`${(BRAND().short || MINIOS.short).toUpperCase()} BOWL`, w / 2, 82); }) }));
  sign.position.set(0, 2.2, -10.0); scene.add(sign);
  const fans = crowd(scene, [[-3.6, -4], [-4.6, -6.5], [3.6, -4], [4.6, -6.5]], 1.5);
  const prof = [[0, 0], [.12, 0], [.17, .15], [.19, .35], [.13, .62], [.08, .75], [.1, .88], [.1, .98], [.06, 1.05], [0, 1.08]].map(([x, y]) => new THREE.Vector2(x, y));
  const pinGeo = new THREE.LatheGeometry(prof, 20), pinMat = new THREE.MeshLambertMaterial({ color: TT.white }), goldMat = new THREE.MeshStandardMaterial({ color: '#FFC83D', metalness: .7, roughness: .25, emissive: '#5a3a00' }), stripeMat = new THREE.MeshLambertMaterial({ color: TT.red }), stripeGeo = new THREE.CylinderGeometry(.085, .085, .05, 16);
  const ballMat = new THREE.MeshStandardMaterial({ color: PROG.bowlBall || TT.blue, roughness: .25, metalness: .2 });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.32, 32, 20), ballMat); scene.add(ball);
  const holes = new THREE.Group(); [[0, .16], [.09, .12], [-.09, .12]].forEach(([x, y]) => { const d = new THREE.Mesh(new THREE.CircleGeometry(.04, 10), new THREE.MeshBasicMaterial({ color: '#000' })); d.position.set(x, y + .1, .31); holes.add(d); }); ball.add(holes);
  let bowlerN = PROG.bowler || PROG.buddy || 'dino', bowler = castSprite(bowlerN, 1.2); bowler.position.set(-1.9, 0, 6.4); scene.add(bowler);
  const blocker = castSprite('foxy', 1.3); blocker.position.set(0, 0, -1.6); scene.add(blocker);
  const sb = mk('div', 'bowlScore'); g.stage.appendChild(sb);
  const p2N = () => CAST_IDS[(CAST_IDS.indexOf(bowlerN) + 2) % 4], pName = p => p ? P2.name() : P2.me(); let p2upd = () => {};
  const setBowler = n => { scene.remove(bowler); bowler = castSprite(n, 1.2); bowler.position.set(-1.9, 0, 6.4); scene.add(bowler); };
  pickerBar(g, [{ items: [{ html: '👤' }, { html: '👥' }], sel: () => PROG.bowl2p ? 1 : 0, pick: i => { PROG.bowl2p = !!i; saveProg(); NP = i ? 2 : 1; p2upd(); newGame(); } },
    { items: CAST_IDS.map(n => ({ html: charHTML(n) })), sel: () => CAST_IDS.indexOf(bowlerN), pick: i => { bowlerN = CAST_IDS[i]; PROG.bowler = bowlerN; saveProg(); setBowler(cp ? p2N() : bowlerN); drawScore(); } },
    { items: BALL_COLS.map(c => ({ html: '', bg: c })), sel: () => Math.max(0, BALL_COLS.indexOf(PROG.bowlBall || TT.blue)), pick: i => { ballMat.color.set(BALL_COLS[i]); PROG.bowlBall = BALL_COLS[i]; saveProg(); } }]);
  const LV = { 1: { bump: 1, target: 15, wob: 0 }, 2: { target: 20, wob: .035 }, 3: { block: 1, target: 20, wob: .04 }, 4: { spin: 1, diamond: 1, target: 25, wob: .05 }, 5: { cosmic: 1, slide: 1, spin: 1, target: 25, wob: .05 }, 6: { gold: 1, spin: 1, block: 1, target: 30, wob: .06 } };
  const FR = 5;
  let L = LV[1], NP = PROG.bowl2p ? 2 : 1, FP = [[], []], cp = 0, frames = FP[0], frame = 0, rollN = 0, state = 'aim', bv = new THREE.Vector2(), timer = 0, spin = 0, streak = 0, rackX = 0, t = 0, pins = [], party = 0;
  p2upd = p2Tool(g, () => NP > 1, () => drawScore());
  function rack() {
    pins.forEach(p => scene.remove(p.m)); pins = [];
    const rows = L.diamond ? [1, 2, 4, 2, 1] : [1, 2, 3, 4];
    rows.forEach((cnt, row) => { for (let i = 0; i < cnt; i++) {
      const gold = L.gold && row === 0, m = new THREE.Group(), body = new THREE.Mesh(pinGeo, gold ? goldMat : pinMat), st = new THREE.Mesh(stripeGeo, stripeMat); st.position.y = .74; m.add(body, st);
      const x = (i - (cnt - 1) / 2) * .62, z = -6.2 - row * .55; m.position.set(x, 0, z); scene.add(m);
      pins.push({ m, x, z, x0: x, vx: 0, vz: 0, tilt: 0, ax: new THREE.Vector3(1, 0, 0), down: false, gone: false, gold });
    } });
  }
  const resetBall = () => { ball.position.set(0, .32, 7); ball.visible = true; ball.userData.gutter = false; spin = 0; state = 'aim'; label(''); };
  const fscore = f => f.r.reduce((a, b) => a + b, 0) + (f.r[0] === 10 ? 10 : f.r.length > 1 && f.r[0] + f.r[1] === 10 ? 5 : 0);
  const total = (p = cp) => FP[p].filter(f => f.done).reduce((a, f) => a + fscore(f), 0);
  function drawScore() { sb.innerHTML = ''; for (let p = 0; p < NP; p++) { const row = mk('div', 'bowlRow' + (NP > 1 && p === cp ? ' turn' : ''), (NP > 1 ? `<span class="bwho">${charHTML(p ? p2N() : bowlerN)}<i>${pName(p)}</i></span>` : '') + rowHTML(p)); sb.appendChild(row); } }
  function rowHTML(p) {
    const frames = FP[p];
    return Array.from({ length: FR }, (_, i) => { const f = frames[i], r = f ? f.r : []; const a = r[0] === 10 ? 'X' : r[0] != null ? (r[0] || '–') : ''; const b = r[0] === 10 ? '' : r[1] != null ? (r[0] + r[1] === 10 ? '/' : (r[1] || '–')) : ''; return `<div class="bf${i === frame && p === cp ? ' cur' : ''}"><i>${a}</i><i>${b}</i><b>${f && f.done ? fscore(f) : ''}</b></div>`; }).join('')
      + `<div class="bf tot"><b>${total(p)}</b><small>${NP > 1 ? (p ? 'P2' : 'P1') : '★' + L.target}</small></div>`;
  }
  function newGame() { FP = [[], []]; cp = 0; frames = FP[0]; frame = 0; rollN = 0; streak = 0; setBowler(bowlerN); rack(); resetBall(); drawScore(); if (NP > 1) label(pName(0).toUpperCase()); }
  function roll(dirX, speed, sp) { if (state !== 'aim') return; dirX += rand(-1, 1) * (L.wob || 0); bv.set(clamp(dirX, -.22, .22) * speed, -speed); spin = L.spin ? sp : 0; state = 'roll'; timer = 0; noise(1.6, .18, 'lowpass', 180); bowler.position.z = 6; }
  let down = null;
  g.on(V.el, 'pointerdown', e => { down = { x: e.clientX, y: e.clientY, pts: [[e.clientX, e.clientY]] }; });
  g.on(V.el, 'pointermove', e => { if (down) down.pts.push([e.clientX, e.clientY]); });
  g.on(V.el, 'pointerup', e => {
    if (!down) return; const d = down; down = null; const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.hypot(dx, dy) < 22) { const h = V.hit(e, [lane]); if (!h.length) return roll(0, 13, 0); const p = h[0].point; return roll((p.x - ball.position.x) / Math.max(4, ball.position.z - p.z), 13, 0); }
    if (dy > -20) return;
    const mid = d.pts[Math.floor(d.pts.length / 2)], curve = (mid[0] - (d.x + dx * .5)) / Math.max(60, -dy);
    roll(dx / -dy * .6, clamp(-dy / 22, 9, 17), clamp(-curve * 4, -1, 1));
  });
  g.key = e => { if (e.key === ' ' || e.key === 'Enter') roll(rand(-.03, .03), 13, 0); if (e.key === 'ArrowLeft' && state === 'aim') ball.position.x = clamp(ball.position.x - .2, -1.2, 1.2); if (e.key === 'ArrowRight' && state === 'aim') ball.position.x = clamp(ball.position.x + .2, -1.2, 1.2); };
  function strikeFx() { party = 2.2; confettiDOM(g, 50); [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .2, 'square', .06, i * .08)); DRUM.crash(); pins.forEach(p => { if (!p.gone) { p.vx += rand(-3, 3); p.vz -= rand(1, 3); } }); }
  function settle() {
    state = 'done'; const newly = pins.filter(p => p.down && !p.gone).length, f = frames[frame] || (frames[frame] = { r: [], done: false }); f.r.push(newly);
    const strike = rollN === 0 && newly === pins.length, spare = rollN === 1 && f.r[0] + newly === pins.length, frameDone = strike || rollN === 1;
    if (newly) g.star(Math.max(1, Math.round(newly / 2)));
    if (pins.some(p => p.gold && p.down && !p.gone)) g.star(2);
    if (strike) { streak++; label(T().strike.toUpperCase() + '!'); strikeFx(); g.star(3); H.happy(); if (streak >= 3) secret('turkey'); say(T().strike, lang, null, 'dino', H.el); }
    else if (spare) { label('SPARE!'); g.star(2); H.happy(); confettiDOM(g, 20); SFX.chime(); }
    else { label(newly ? String(newly) : '0'); newly ? (SFX.good(), H.happy()) : (SFX.bad(), H.mood('oops')); say(newly ? `${cap(numWord(newly))}!` : T().again, lang, null, 'dino', H.el); }
    if (frameDone) { f.done = true; if (!strike) streak = 0; }
    drawScore();
    g.after(strike ? 2600 : 2100, () => {
      if (!g.alive()) return;
      if (!frameDone) { rollN = 1; pins.forEach(p => { if (p.down) { p.gone = true; p.m.visible = false; } }); resetBall(); return; }
      if (NP > 1 && cp === 0) cp = 1; else { cp = 0; frame++; } frames = FP[cp]; rollN = 0; drawScore();
      if (NP > 1 && frame >= FR) { const a = total(0), b = total(1), w = a === b ? -1 : a > b ? 0 : 1; label(w < 0 ? '🤝 TIE!' : `🏆 ${pName(w).toUpperCase()}!`); confettiDOM(g, 60); party = 3; SFX.chime(); H.happy(); g.star(3); g.after(4000, newGame); return; }
      if (NP > 1) { setBowler(cp ? p2N() : bowlerN); rack(); resetBall(); label(pName(cp).toUpperCase()); return; }
      if (frame >= FR) { const tot = total(); label(`★ ${tot}`); if (tot >= L.target) { SFX.chime(); party = 2; g.after(1500, () => { if (g.progress()) g.levelUp(); }); } else { H.mood('oops'); g.after(2400, newGame); } return; }
      rack(); resetBall();
    });
  }
  g.levels(6, lv => {
    L = LV[lv]; bumpers.forEach(b => b.visible = !!L.bump); blocker.visible = !!L.block; neon.forEach(n => n.visible = !!L.cosmic);
    scene.background.set(L.cosmic ? '#000000' : '#06061a'); laneMat.emissive = new THREE.Color(L.cosmic ? '#2a0a40' : '#000000');
    g.meter(1); newGame(); H.bubble(`🎳 ★${L.target}`);
  });
  g.loop(dt => {
    t += dt; party = Math.max(0, party - dt); cheer(fans, t, party > 0);
    bowler.position.z = lerp(bowler.position.z, 6.4, dt * 3);
    if (L.block) blocker.position.x = Math.sin(t * 1.3) * 1.05;
    if (L.slide && state === 'aim' && rollN === 0) { rackX = Math.sin(t * .9) * .55; pins.forEach(p => { if (!p.down) { p.x = p.x0 + rackX; p.m.position.x = p.x; } }); }
    if (L.cosmic) neon.forEach((n, i) => n.material.color.setHSL((t * .2 + i * .5) % 1, 1, .55));
    if (state === 'roll' || state === 'settle') {
      const sub = 4, h = dt / sub;
      for (let s = 0; s < sub; s++) {
        if (ball.visible) {
          if (spin && ball.position.z < 4) bv.x += spin * 3.4 * h;
          ball.position.x += bv.x * h; ball.position.z += bv.y * h;
          if (Math.abs(ball.position.x) > 1.2) { if (L.bump) { ball.position.x = Math.sign(ball.position.x) * 1.2; bv.x *= -.6; spin = 0; } else if (!ball.userData.gutter) { ball.position.x = Math.sign(ball.position.x) * 1.62; ball.position.y = .18; bv.x = 0; spin = 0; ball.userData.gutter = true; } }
          if (L.block && blocker.visible && Math.abs(ball.position.z - blocker.position.z) < .3 && Math.abs(ball.position.x - blocker.position.x) < .55 && bv.y < 0) { bv.x = Math.sign(ball.position.x - blocker.position.x || 1) * 3.5; bv.y *= .75; ball.position.z = blocker.position.z - .31; SFX.boing(); }
          if (!ball.userData.gutter) for (const p of pins) { if (p.gone) continue; const dx = p.x - ball.position.x, dz = p.z - ball.position.z, d = Math.hypot(dx, dz); if (d < .5 && d > 0) { const nx = dx / d, nz = dz / d, dot = Math.max(0, bv.x * nx + bv.y * nz); p.vx += nx * (dot * 1.05 + 1.5); p.vz += nz * (dot * 1.05 + 1.5); if (!p.down) { p.down = true; SFX.clatter(); } bv.x -= nx * dot * .3; bv.y -= nz * dot * .3; p.x = ball.position.x + nx * .5; p.z = ball.position.z + nz * .5; } }
          ball.rotation.x += bv.y * h / .32; ball.rotation.z -= bv.x * h / .32;
          if (ball.position.z < -9.6) { ball.visible = false; state = 'settle'; timer = 0; }
        }
        for (let i = 0; i < pins.length; i++) { const a = pins[i]; if (a.gone) continue; for (let j = i + 1; j < pins.length; j++) {
          const b = pins[j]; if (b.gone) continue; const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
          if (d < .36 && d > 0) { const nx = dx / d, nz = dz / d, rv = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz; if (rv > 0) { a.vx -= nx * rv * .9; a.vz -= nz * rv * .9; b.vx += nx * rv * .9; b.vz += nz * rv * .9; if (!b.down && rv > .4) b.down = true; if (!a.down && rv > .4) a.down = true; } const o = (.36 - d) / 2; a.x -= nx * o; a.z -= nz * o; b.x += nx * o; b.z += nz * o; }
        } }
        for (const p of pins) { if (p.gone) continue; p.x += p.vx * h; p.z += p.vz * h; const k = Math.exp(-2.4 * h); p.vx *= k; p.vz *= k; p.x = clamp(p.x, -1.3, 1.3); }
      }
      for (const p of pins) { if (p.gone) continue; if (p.down) { const sp = Math.hypot(p.vx, p.vz); if (sp > .05) p.ax.set(p.vz / sp, 0, -p.vx / sp); p.tilt = lerp(p.tilt, Math.PI / 2, Math.min(1, dt * 7)); } p.m.position.set(p.x, p.tilt > .1 ? .12 * Math.sin(p.tilt) : 0, p.z); p.m.quaternion.setFromAxisAngle(p.ax, p.tilt); }
      timer += dt;
      if (state === 'settle' && timer > 1.6) settle();
      if (state === 'roll' && timer > 6) { state = 'settle'; ball.visible = false; timer = 0; }
    }
    const follow = ball.visible && state === 'roll' ? clamp(ball.position.z + 4.5, 0, 10.5) : 10.5;
    cam.position.lerp(new THREE.Vector3(0, 2.3, follow), Math.min(1, dt * 2)); cam.lookAt(0, .2, cam.position.z - 10);
    V.render();
  });
});

/* BASKETBALL — tap the hoop (or swipe up) to shoot; the hoop gets farther and starts moving */
game('basketball', '3d', '🏀', g => {
  const H = g.host('foxy'), V = g.three({ fov: 55 }), { scene, cam } = V, label = overlayLabel(g);
  scene.background = new THREE.Color('#0a0a1e'); stageLights(scene, { hemi: .95 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 20), new THREE.MeshLambertMaterial({ map: canvasTex(256, 320, (c, w, h) => { c.fillStyle = '#c98a4b'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 8) { c.fillStyle = x % 16 ? '#c28344' : '#d29457'; c.fillRect(x, 0, 8, h); } c.strokeStyle = '#fff'; c.lineWidth = 3; c.fillStyle = 'rgba(59,98,255,.55)'; c.fillRect(w / 2 - 34, 0, 68, 90); c.strokeRect(w / 2 - 34, 0, 68, 90); c.beginPath(); c.arc(w / 2, 90, 34, 0, Math.PI); c.stroke(); c.beginPath(); c.arc(w / 2, 10, 120, .1, Math.PI - .1); c.stroke(); }) }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = -4; scene.add(floor);
  const hoop = new THREE.Group(); scene.add(hoop);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, 3.4), new THREE.MeshLambertMaterial({ color: '#888' })); pole.position.set(0, 1.7, -.95); hoop.add(pole);
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.05, .06), new THREE.MeshLambertMaterial({ map: canvasTex(256, 150, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.strokeStyle = TT.red; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); c.strokeRect(w / 2 - 40, h - 70, 80, 56); }) })); board.position.set(0, 3.4, -.58); hoop.add(board);
  const R = .45, TUBE = .035, RB = .24, G = 9.8;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R, TUBE, 8, 32), new THREE.MeshLambertMaterial({ color: TT.orange })); rim.rotation.x = Math.PI / 2; rim.position.set(0, 3, 0); hoop.add(rim);
  const net = new THREE.Mesh(new THREE.CylinderGeometry(R, .28, .5, 14, 3, true), new THREE.MeshBasicMaterial({ color: '#fff', wireframe: true })); net.position.set(0, 2.75, 0); hoop.add(net);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(RB, 24, 16), new THREE.MeshLambertMaterial({ map: canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#e8732a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#111'; c.lineWidth = 3; [w / 4, w / 2, w * 3 / 4].forEach(x => { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }); c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke(); }) })); scene.add(ball);
  const shooter = castSprite(PROG.buddy || 'foxy', 1.3); shooter.position.set(-2.1, 0, 1.6); scene.add(shooter);
  const defender = castSprite('dino', 1.5); scene.add(defender);
  const fans = crowd(scene, [[-5, -8], [-3.5, -8.5], [3.5, -8.5], [5, -8], [-6, -6], [6, -6]], 1.4);
  const aimPlane = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.MeshBasicMaterial()); aimPlane.visible = false; scene.add(aimPlane);
  cam.position.set(0, 1.9, 6); cam.lookAt(0, 2.5, -3);
  const LV = { 1: { z: -2.2, mag: .85 }, 2: { z: -3.6, mag: .6 }, 3: { z: -3.6, mag: .45, slide: 1 }, 4: { z: -4.6, mag: .4, timer: 30 }, 5: { z: -4, mag: .4, slide: 1, bob: 1, def: 1 } };
  let L = LV[1], v = new THREE.Vector3(), state = 'ready', scored = false, flyT = 0, t = 0, tsc = 1, slow = 0, party = 0, left = 0, clank = 0, netK = 0;
  const rimC = () => new THREE.Vector3(hoop.position.x, hoop.position.y + 3, hoop.position.z);
  const ready = () => { ball.position.set(0, 1.25, 3.3); v.set(0, 0, 0); state = 'ready'; scored = false; };
  function shoot(aim) {
    if (state !== 'ready') return; const rc = rimC(), T_ = aim.clone().lerp(rc, L.mag); T_.y = Math.max(T_.y, rc.y - .3) + .12;
    const P = ball.position.clone(), d = P.distanceTo(T_), tt = .7 + d * .07;
    v.set((T_.x - P.x) / tt, (T_.y - P.y) / tt + .5 * G * tt, (T_.z - P.z) / tt); state = 'fly'; flyT = 0; SFX.whoosh(); shooter.position.y = .4;
  }
  let down = null;
  g.on(V.el, 'pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
  g.on(V.el, 'pointerup', e => {
    if (!down) return; const dx = e.clientX - down.x, dy = e.clientY - down.y; down = null; aimPlane.position.copy(rimC()); aimPlane.position.y = 2;
    if (Math.hypot(dx, dy) < 22) { const h = V.hit(e, [aimPlane]); if (h.length) shoot(h[0].point); return; }
    if (dy < -20) { const r = V.el.getBoundingClientRect(), rc = rimC(); shoot(new THREE.Vector3(rc.x + dx / r.width * 4, rc.y + (-dy / r.height - .4) * 3, rc.z)); }
  });
  g.key = e => { if (e.key === ' ' || e.key === 'Enter') shoot(rimC().add(new THREE.Vector3(rand(-.3, .3), rand(-.2, .3), 0))); };
  function made() {
    scored = true; netK = 1; const swish = clank === 0; label(swish ? 'SWISH!' : '🏀 ✔'); slow = .7; party = 2; confettiDOM(g, swish ? 40 : 20); SFX.chime(); H.happy(); g.star(swish ? 3 : 2);
    noise(.4, .15, 'highpass', 3000);
    g.after(1600, () => { if (!g.alive()) return; if (g.progress()) g.levelUp(); });
  }
  g.levels(5, lv => { L = LV[lv]; hoop.position.set(0, 0, L.z); defender.visible = !!L.def; left = L.timer || 0; g.meter(5); ready(); label(''); H.bubble('👆 🏀'); });
  g.loop(dt => {
    t += dt; slow = Math.max(0, slow - dt); tsc = slow > 0 ? .35 : 1; party = Math.max(0, party - dt); cheer(fans, t, party > 0); netK = Math.max(0, netK - dt * 2);
    net.scale.y = 1 + Math.sin(netK * 12) * netK * .4; shooter.position.y = lerp(shooter.position.y, 0, dt * 4);
    if (L.slide) hoop.position.x = Math.sin(t * .8) * 1.6; if (L.bob) hoop.position.y = Math.sin(t * 1.1) * .4;
    if (L.def) { defender.position.set(Math.sin(t * 1.4) * 1.2, Math.abs(Math.sin(t * 2.2)) * .9, -.9); }
    if (L.timer && state !== 'over') { left -= dt; label(`⏱ ${Math.max(0, Math.ceil(left))}`); if (left <= 0) { state = 'over'; H.mood('oops'); SFX.bad(); g.after(1500, () => { if (g.alive()) { left = L.timer; g.meter(5); ready(); } }); } }
    if (state === 'fly') {
      const sub = 6, h = dt * tsc / sub, rc = rimC();
      for (let s = 0; s < sub; s++) {
        const py = ball.position.y; v.y -= G * h; ball.position.addScaledVector(v, h);
        const dx = ball.position.x - rc.x, dz = ball.position.z - rc.z, r = Math.hypot(dx, dz) || 1e-6, q = new THREE.Vector3(rc.x + dx / r * R, rc.y, rc.z + dz / r * R), diff = ball.position.clone().sub(q), dist = diff.length();
        if (dist < RB + TUBE) { const n = diff.divideScalar(dist), vn = v.dot(n); if (vn < 0) { v.addScaledVector(n, -1.55 * vn); clank++; tone(520, .08, 'square', .05); } ball.position.copy(q).addScaledVector(n, RB + TUBE); }
        const bz = rc.z - .55; if (v.z < 0 && ball.position.z - RB < bz + .03 && ball.position.z > bz - .25 && Math.abs(ball.position.x - rc.x) < .9 && ball.position.y > rc.y - .15 && ball.position.y < rc.y + .95) { v.z = -v.z * .6; ball.position.z = bz + .03 + RB; noise(.06, .2, 'lowpass', 500); clank++; }
        if (!scored && py >= rc.y && ball.position.y < rc.y && Math.hypot(ball.position.x - rc.x, ball.position.z - rc.z) < R - RB * .25) made();
        if (L.def && Math.abs(ball.position.z - defender.position.z) < .3 && Math.abs(ball.position.x - defender.position.x) < .5 && ball.position.y < defender.position.y + 1.5 && v.z < 0) { v.z = 2.5; v.y = Math.abs(v.y) * .5 + 1; SFX.boing(); }
        if (ball.position.y < RB) { ball.position.y = RB; if (v.y < -1) noise(.05, .15, 'lowpass', 300); v.y = -v.y * .62; v.x *= .8; v.z *= .8; }
      }
      ball.rotation.x -= dt * 8; flyT += dt * tsc;
      if (flyT > 2.8) { if (!scored) H.mood('oops'); clank = 0; if (state === 'fly') ready(); }
    }
    V.render();
  });
});

/* DARTS — the aim wobbles; tap to throw. Colours, balloons, numbers, bull's-eye */
game('darts', '3d', '🎯', g => {
  const H = g.host('hoot'), V = g.three({ fov: 45 }), { scene, cam } = V, label = overlayLabel(g);
  scene.background = new THREE.Color('#120a06'); stageLights(scene, { hemi: .85 });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), new THREE.MeshLambertMaterial({ map: canvasTex(256, 144, (c, w, h) => { c.fillStyle = '#3a1d10'; c.fillRect(0, 0, w, h); c.fillStyle = '#4a2716'; for (let y = 0; y < h; y += 12) for (let x = (y / 12) % 2 ? -12 : 0; x < w; x += 24) c.fillRect(x + 1, y + 1, 22, 10); }) })); wall.position.set(0, 2, -6.3); scene.add(wall);
  const BR = 1.25, board = new THREE.Group(); board.position.set(0, 1.8, -6.1); scene.add(board);
  const WCOL = i => COLORS[i % 7];
  const face = new THREE.Mesh(new THREE.CircleGeometry(BR, 64), new THREE.MeshLambertMaterial({ map: canvasTex(512, 512, (c, w) => {
    const cx = w / 2, R2 = w / 2 - 6, step = Math.PI * 2 / 10; c.fillStyle = '#111'; c.beginPath(); c.arc(cx, cx, w / 2, 0, 7); c.fill();
    for (let i = 0; i < 10; i++) { const a0 = -Math.PI / 2 + (i - .5) * step; c.fillStyle = WCOL(i); c.beginPath(); c.moveTo(cx, cx); c.arc(cx, cx, R2 * .82, a0, a0 + step); c.fill(); c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.moveTo(cx, cx); c.arc(cx, cx, R2 * .55, a0, a0 + step); c.arc(cx, cx, R2 * .45, a0 + step, a0, true); c.fill(); const am = a0 + step / 2; c.fillStyle = '#fff'; c.font = `bold 44px ${PXF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(i + 1, cx + Math.cos(am) * R2 * .92, cx + Math.sin(am) * R2 * .92); }
    c.fillStyle = TT.green; c.beginPath(); c.arc(cx, cx, R2 * .14, 0, 7); c.fill(); c.fillStyle = TT.red; c.beginPath(); c.arc(cx, cx, R2 * .06, 0, 7); c.fill();
  }) })); board.add(face);
  const rimM = new THREE.Mesh(new THREE.TorusGeometry(BR, .05, 8, 48), new THREE.MeshLambertMaterial({ color: '#222' })); board.add(rimM);
  const ret = new THREE.Group(); ret.add(new THREE.Mesh(new THREE.RingGeometry(.09, .13, 24), new THREE.MeshBasicMaterial({ color: '#fff' }))); ret.add(new THREE.Mesh(new THREE.CircleGeometry(.025, 10), new THREE.MeshBasicMaterial({ color: '#fff' }))); ret.position.z = .06; board.add(ret);
  const thrower = castSprite(PROG.buddy || 'hoot', 1.3); thrower.position.set(-2.6, -.2, -1.4); scene.add(thrower);
  cam.position.set(0, 1.8, 3.2); cam.lookAt(0, 1.8, -6);
  let L = 1, target = null, darts = [], balloons = [], flying = null, t = 0, busy = false, party = 0;
  const AMP = { 1: .55, 2: .5, 3: .45, 4: .5, 5: .35 }, SPD = { 1: .8, 2: 1, 3: 1.1, 4: 1.2, 5: 1.5 };
  function makeDart(col) { const d = new THREE.Group(); const sh = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .32, 8), new THREE.MeshLambertMaterial({ color: '#ddd' })); sh.rotation.x = Math.PI / 2; const tip = new THREE.Mesh(new THREE.ConeGeometry(.025, .1, 8), new THREE.MeshLambertMaterial({ color: '#999' })); tip.rotation.x = -Math.PI / 2; tip.position.z = -.2; d.add(sh, tip); [0, 1, 2].forEach(k => { const f = new THREE.Mesh(new THREE.BoxGeometry(.005, .1, .1), new THREE.MeshLambertMaterial({ color: col })); f.position.z = .14; f.rotation.z = k * Math.PI * 2 / 3; f.position.x = Math.sin(k * 2.09) * .03; f.position.y = Math.cos(k * 2.09) * .03; d.add(f); }); scene.add(d); return d; }
  function spawnBalloons() { balloons.forEach(b => board.remove(b.m)); balloons = shuffle([0, 1, 2, 3, 4, 5, 6]).slice(0, 6).map((c, i) => { const a = i / 6 * Math.PI * 2 + rand(-.2, .2), r = rand(.45, .9), m = new THREE.Mesh(new THREE.SphereGeometry(.2, 16, 12), new THREE.MeshLambertMaterial({ color: COLORS[c] })); m.scale.y = 1.2; m.position.set(Math.cos(a) * r, Math.sin(a) * r, .2); board.add(m); return { m, c, x: m.position.x, y: m.position.y }; }); }
  function ask() {
    busy = false;
    if (L === 1) { H.bubble('🎯 👆'); target = null; }
    else if (L === 2) { target = randi(0, 6); H.say(cap(T().colors[target]) + '!', 'talk', lang, 0, CARD.color(target, '🎯')); }
    else if (L === 3) { if (!balloons.length) spawnBalloons(); target = pick(balloons).c; H.say(cap(T().colors[target]) + '!', 'talk', lang, 0, CARD.wrap(`<b class="ce" style="color:${COLORS[target]}">🎈</b>`, '🎯')); }
    else if (L === 4) { target = randi(1, 10); H.say(T().findNum(target), 'talk', lang, 0, CARD.num(target, '🎯')); }
    else { target = 'bull'; H.say('', 'talk', lang, 0, CARD.wrap(`<i class="cc round" style="background:${TT.red};box-shadow:0 0 0 1.4vmin ${TT.green}"></i>`, '🎯')); }
  }
  function throwDart() {
    if (flying || busy) return; const err = .03 + L * .012;
    const tgt = new THREE.Vector3(ret.position.x + rand(-err, err), ret.position.y + rand(-err, err), 0); board.localToWorld(tgt);
    const d = makeDart(pick([TT.red, TT.blue, TT.green, TT.yellow])), from = new THREE.Vector3(.6, 1.2, 2.2); d.position.copy(from);
    flying = { d, from, tgt, u: 0, local: new THREE.Vector3(ret.position.x, ret.position.y, 0) }; SFX.whoosh(); thrower.position.y = .3;
  }
  function land(f) {
    flying = null; darts.push(f.d); if (darts.length > 4) scene.remove(darts.shift()); noise(.05, .25, 'lowpass', 700);
    const x = f.local.x, y = f.local.y, r = Math.hypot(x, y) / BR; let ok = false, pts = 0;
    const ac = Math.atan2(-y, x), step = Math.PI * 2 / 10, wedge = ((Math.round((ac + Math.PI / 2) / step) % 10) + 10) % 10;
    if (r <= 1) {
      pts = r < .06 ? 50 : r < .14 ? 25 : wedge + 1; if (r > .45 && r < .55) pts *= 2;
      if (L === 1) ok = true;
      else if (L === 2) ok = WCOL(wedge) === COLORS[target] && r >= .14;
      else if (L === 4) ok = wedge + 1 === target && r >= .14;
      else if (L === 5) ok = r < .3;
    }
    if (L === 3) { const b = balloons.find(b => Math.hypot(b.x - x, b.y - y) < .24); if (b) { board.remove(b.m); balloons = balloons.filter(z => z !== b); SFX.pop(); ok = b.c === target; } }
    label(r <= 1 ? String(pts) : '✖');
    if (ok) { busy = true; SFX.good(); H.happy(); g.star(r < .14 ? 3 : 1); party = 1.2; if (r < .06) { confettiDOM(g, 40); label('BULLSEYE!'); } g.after(1300, () => { if (!g.alive()) return; if (g.progress()) g.levelUp(); else ask(); }); }
    else { H.mood('oops'); tone(250, .15, 'triangle', .1); if (L === 3 && !balloons.length) { spawnBalloons(); ask(); } else if (L === 3 && !balloons.some(b => b.c === target)) ask(); }
  }
  g.on(V.el, 'pointerdown', () => throwDart());
  g.key = e => { if (e.key === ' ' || e.key === 'Enter') throwDart(); };
  g.levels(5, lv => { L = lv; darts.forEach(d => scene.remove(d)); darts = []; balloons.forEach(b => board.remove(b.m)); balloons = []; board.position.x = 0; g.meter(lv === 5 ? 3 : 5); label(''); ask(); });
  g.loop(dt => {
    t += dt; party = Math.max(0, party - dt); thrower.position.y = lerp(thrower.position.y, party > 0 ? Math.abs(Math.sin(t * 9)) * .4 : -.2, dt * 5);
    const a = AMP[L], s = SPD[L]; ret.position.x = Math.sin(t * 1.3 * s) * a; ret.position.y = Math.sin(t * 1.7 * s + 1) * a * .8;
    if (L >= 4) board.position.x = Math.sin(t * .6) * (L === 5 ? 1.2 : .8);
    balloons.forEach((b, i) => { b.m.position.y = b.y + Math.sin(t * 2 + i) * .03; });
    if (flying) { const f = flying; f.u = Math.min(1, f.u + dt / .38); f.d.position.lerpVectors(f.from, f.tgt, f.u); f.d.position.y += Math.sin(f.u * Math.PI) * .35; f.d.position.z += .1; f.d.lookAt(f.tgt.x, f.tgt.y, f.tgt.z - 5); if (f.u >= 1) { const w = f.tgt.clone(); f.d.position.copy(w); f.d.position.z += .12; board.worldToLocal(w); f.local.copy(w); board.attach(f.d); land(f); } }
    V.render();
  });
});

/* PENALTY KICKS — tap where in the goal to shoot; the keeper gets better */
game('soccer', '3d', '⚽', g => {
  const H = g.host('dino'), V = g.three({ fov: 50 }), { scene, cam } = V, label = overlayLabel(g), night = DAYPART() === 'night';
  scene.background = new THREE.Color(night ? '#0a1030' : '#7fc8ff'); stageLights(scene, { hemi: night ? .7 : 1 });
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(30, 34), new THREE.MeshLambertMaterial({ map: canvasTex(256, 290, (c, w, h) => { for (let y = 0; y < h; y += 24) { c.fillStyle = (y / 24) % 2 ? '#2fa84f' : '#36b85a'; c.fillRect(0, y, w, 24); } c.strokeStyle = '#fff'; c.lineWidth = 3; c.strokeRect(w / 2 - 60, 20, 120, 60); c.strokeRect(w / 2 - 30, 20, 60, 24); c.beginPath(); c.arc(w / 2, 110, 3, 0, 7); c.stroke(); }) })); pitch.rotation.x = -Math.PI / 2; pitch.position.z = -6; scene.add(pitch);
  const GZ = -9, GW = 2.6, GH = 1.9, white = new THREE.MeshLambertMaterial({ color: '#fff' });
  [-GW, GW].forEach(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, GH), white); p.position.set(x, GH / 2, GZ); scene.add(p); }); const bar = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, GW * 2), white); bar.rotation.z = Math.PI / 2; bar.position.set(0, GH, GZ); scene.add(bar);
  const netM = new THREE.Mesh(new THREE.PlaneGeometry(GW * 2, GH, 16, 6), new THREE.MeshBasicMaterial({ color: '#fff', wireframe: true, transparent: true, opacity: .6 })); netM.position.set(0, GH / 2, GZ - 1); scene.add(netM);
  const stands = new THREE.Mesh(new THREE.BoxGeometry(24, 3, 1), new THREE.MeshLambertMaterial({ map: canvasTex(256, 32, (c, w, h) => { c.fillStyle = '#222'; c.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { c.fillStyle = pick(COLORS); c.fillRect(rand(0, w), rand(0, h), 2, 2); } }) })); stands.position.set(0, 1.5, -14); scene.add(stands);
  const fans = crowd(scene, [[-6, -12], [-4.5, -12.5], [4.5, -12.5], [6, -12]], 1.4);
  const keeper = castSprite('foxy', 1.7); keeper.position.set(0, 0, GZ + .1); scene.add(keeper);
  const kicker = castSprite(PROG.buddy || 'dino', 1.4); kicker.position.set(-1.9, 0, .4); scene.add(kicker);
  const wallP = [0, 1, 2].map(i => { const s = castSprite(CAST_IDS[(i + 1) % 4], 1.5); scene.add(s); return s; });
  const panels = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(.32, .45, 24), new THREE.MeshBasicMaterial({ color: TT.yellow, side: THREE.DoubleSide })); m.position.z = GZ + .05; scene.add(m); return m; });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.22, 24, 16), new THREE.MeshLambertMaterial({ map: canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc((i * 37) % w, (i * 23) % h, 7, 0, 7); c.fill(); } }) })); scene.add(ball);
  const aimPlane = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), new THREE.MeshBasicMaterial()); aimPlane.visible = false; aimPlane.position.set(0, 2, GZ); scene.add(aimPlane);
  cam.position.set(0, 1.6, 5.5); cam.lookAt(0, 1, GZ);
  const LV = { 1: { reach: .6, spd: 1.5, delay: .45 }, 2: { reach: .85, spd: 3.5, delay: .25 }, 3: { reach: .8, spd: 3, delay: .3, panels: 1 }, 4: { reach: .95, spd: 4.5, delay: .2, wall: 1 } };
  let L = LV[1], lv = 1, v = new THREE.Vector3(), state = 'ready', t = 0, ft = 0, goalX = 0, slow = 0, party = 0, crossed = false;
  const G = 9.8;
  function ready() { ball.position.set(0, .22, 1.8); v.set(0, 0, 0); state = 'ready'; crossed = false; keeper.position.x = 0; goalX = 0; label('');
    if (L.panels) { const corners = shuffle([[-1.9, 1.35], [1.9, 1.35], [-1.9, .5], [1.9, .5]]).slice(0, 2); panels.forEach((p, i) => { p.visible = true; p.position.x = corners[i][0]; p.position.y = corners[i][1]; }); } else panels.forEach(p => p.visible = false);
    const wx = rand(-1, 1); wallP.forEach((s, i) => { s.visible = !!L.wall; s.position.set(wx + (i - 1) * .75, 0, -3.5); }); }
  function kick(T_) { if (state !== 'ready') return; const P = ball.position.clone(), tt = L.wall ? 1.05 : .8; v.set((T_.x - P.x) / tt, (T_.y - P.y) / tt + .5 * G * tt, (T_.z - P.z) / tt); state = 'fly'; ft = 0; SFX.bump(); kicker.position.z = -.1;
    g.after(L.delay * 1000, () => { goalX = clamp(T_.x + rand(-1, 1) * (1.6 - lv * .3), -GW + .3, GW - .3); }); }
  g.on(V.el, 'pointerdown', e => { if (state !== 'ready') return; const h = V.hit(e, [aimPlane]); if (h.length) { const p = h[0].point; kick(new THREE.Vector3(p.x, clamp(p.y, .2, 3), GZ)); } });
  g.key = e => { if (e.key === ' ' || e.key === 'Enter') kick(new THREE.Vector3(rand(-2.2, 2.2), rand(.3, 1.6), GZ)); };
  const end = (goal, msg) => { state = 'done'; label(msg); if (goal) { SFX.chime(); confettiDOM(g, 40); party = 2.4; slow = .8; g.star(2); H.happy(); netM.scale.z = 1; } else { H.mood('oops'); SFX.bad(); }
    g.after(2000, () => { if (!g.alive()) return; if (goal && g.progress()) g.levelUp(); else ready(); }); };
  g.levels(4, n => { lv = n; L = LV[n]; g.meter(5); ready(); H.bubble('👆 🥅'); });
  g.loop(dt => {
    t += dt; slow = Math.max(0, slow - dt); party = Math.max(0, party - dt); cheer(fans, t, party > 0); const k = slow > 0 ? .35 : 1;
    kicker.position.z = lerp(kicker.position.z, .4, dt * 3);
    if (state === 'ready') keeper.position.x = Math.sin(t * 1.5) * .5;
    else keeper.position.x = lerp(keeper.position.x, goalX, Math.min(1, dt * L.spd));
    keeper.position.y = state === 'fly' && Math.abs(keeper.position.x - goalX) > .2 ? .25 : 0;
    if (state === 'fly') {
      const h = dt * k; v.y -= G * h; ball.position.addScaledVector(v, h); ball.rotation.x -= dt * 10;
      if (ball.position.y < .22) { ball.position.y = .22; v.y = -v.y * .5; }
      if (L.wall && Math.abs(ball.position.z + 3.5) < .25 && v.z < 0) { const hitW = wallP.find(s => Math.abs(s.position.x - ball.position.x) < .4 && ball.position.y < 1.45); if (hitW) { v.z = 3; v.y = 2; SFX.boing(); end(false, '🧱'); } }
      if (!crossed && ball.position.z <= GZ + .15 && state === 'fly') {
        crossed = true; const inMouth = Math.abs(ball.position.x) < GW - .1 && ball.position.y < GH - .05, saved = inMouth && Math.abs(ball.position.x - keeper.position.x) < L.reach && ball.position.y < 1.75;
        if (saved) { v.z = 4; v.x *= -.3; v.y = 2; end(false, '🧤'); }
        else if (!inMouth) end(false, '✖');
        else if (L.panels) { const p = panels.find(p => Math.hypot(p.position.x - ball.position.x, p.position.y - ball.position.y) < .5); end(!!p, p ? 'GOAL!' : '✖'); if (p) p.visible = false; }
        else end(true, 'GOAL!');
      }
      if (ball.position.z < GZ - .9) { ball.position.z = GZ - .9; v.set(0, v.y, 0); }
      ft += dt;
    }
    netM.scale.z = lerp(netM.scale.z, 1, dt * 3); netM.position.z = GZ - 1 - (party > 1.8 ? .3 : 0);
    V.render();
  });
});
