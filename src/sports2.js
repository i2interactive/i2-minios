/* ═════════ SPORTS 2 — mini golf, flush launch, kart racing, snowboard ═════════ */

/* MINI GOLF — 9 holes. Drag back from anywhere and let go (slingshot), or just tap where to hit */
const GOLF = [
  { par: 2, map: ['.H.', '...', '...', '...', '.S.'] },
  { par: 3, map: ['H....', '.....', '...##', '...##', '.S.##'] },
  { par: 2, map: ['.H.', '...', '.O.', '...', '.S.'] },
  { par: 3, map: ['##.H', '##..', '#...', '....', '..##', 'S.##'] },
  { par: 3, map: ['..H..', '.....', '..W..', '.....', '..S..'] },
  { par: 3, map: ['.S#H.', '..#..', '..#..', '.....', '.....'] },
  { par: 3, map: ['..H..', '.....', 'MMMMM', '.....', '..S..'] },
  { par: 3, map: ['.H.O.', 'O...O', '..O..', 'O...O', '..S..'] },
  { par: 4, map: ['#.H.#', '.....', 'MMMMM', '..W..', 'O...O', '..S..'] }
];
const GOLF2 = [
  { par: 2, map: ['.H.', '...', '.^.', '...', '.S.'] },
  { par: 2, map: ['..H..', '~~.~~', '~~.~~', '.....', '..S..'] },
  { par: 2, map: ['H.#.T', '..#..', '..#..', '..#..', 'T.#.S'] },
  { par: 3, map: ['..H..', '.U.U.', '..U..', '.U.U.', '..S..'] },
  { par: 3, map: ['~~H~~', '~...~', '~.~.~', '~...~', '~~S~~'] },
  { par: 4, map: ['H.<<<', '####^', '>>>>^', '^####', '^S...'] },
  { par: 3, map: ['..H..', '.....', 'MMMMM', '~~.~~', '..S..'] },
  { par: 3, map: ['T.U.H', '.....', 'U.U.U', '.....', 'S.U.T'] },
  { par: 4, map: ['~.H.~', '~.W.~', '~...~', 'U^.^U', '~...~', '~.S.~'] }
];
const GOLF_TH = {
  island: { icon: '⛳', bg: '#0b1a2e', sea: '#1d5fa0', sand: '#e8d39a', tiles: ['#2fa84f', '#36b85a'], wall: '#8B5A3C', top: '#f2e2c4', ground: 0x335533 },
  pirate: { icon: '🏴‍☠️', bg: '#2b1446', sea: '#0f3d6e', sand: '#d9b46a', tiles: ['#2f8f55', '#3a9d61'], wall: '#4a2e1a', top: '#c9a26a', ground: 0x443322, palms: 1, fog: '#2b1446' }
};
game('minigolf', '3d', '⛳', g => golfGame(g, GOLF, GOLF_TH.island));
game('golf2', '3d', '🏴‍☠️', g => golfGame(g, GOLF2, GOLF_TH.pirate));
/* the shared course engine. Tiles: . fairway  # gap  S start  H hole  O post  W windmill  M mover  ~ water  ^ > < v boost arrows  T teleport tubes (a pair)  U bumper */
function golfGame(g, HOLES, TH) {
  const H = g.host(PROG.buddy || 'robo'), V = g.three({ fov: 45 }), { scene, cam } = V, label = overlayLabel(g);
  scene.background = new THREE.Color(TH.bg); stageLights(scene, { hemi: 1, ground: TH.ground });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshLambertMaterial({ color: TH.sea })); sea.rotation.x = -Math.PI / 2; sea.position.y = -.3; scene.add(sea);
  const C = 1.3, BR = .12; let CUP = .21;
  let course = null, walls = [], posts = [], bumpers = [], tps = [], tpCool = null, cellAt = () => '.', spinner = null, mover = null, cup = new THREE.Vector2(), ball = null, bv = new THREE.Vector2(), bp = new THREE.Vector2(), strokes = 0, state = 'aim', t = 0, hole = null, golfer = null, aim = null, sinkT = 0, ctr = new THREE.Vector3(), span = 6;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); ground.rotation.x = -Math.PI / 2; ground.position.y = .06; ground.visible = false; scene.add(ground);
  function build(n) {
    if (course) scene.remove(course); course = new THREE.Group(); scene.add(course); walls = []; posts = []; bumpers = []; tps = []; tpCool = null; spinner = null; mover = null;
    hole = HOLES[n - 1]; CUP = n <= 4 ? .3 : .24; const m = hole.map, rows = m.length, cols = m[0].length, fair = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols && m[r][c] !== '#';
    const X = c => (c - (cols - 1) / 2) * C, Z = r => (r - (rows - 1) / 2) * C; span = Math.max(rows, cols) * C;
    const wallMat = new THREE.MeshLambertMaterial({ color: TH.wall }), topMat = new THREE.MeshLambertMaterial({ color: TH.top });
    cellAt = (x, z) => { const c = Math.round(x / C + (cols - 1) / 2), r = Math.round(z / C + (rows - 1) / 2); return r >= 0 && c >= 0 && r < rows && c < cols ? m[r][c] : '#'; };
    const island = new THREE.Mesh(new THREE.BoxGeometry(cols * C + 1.6, .3, rows * C + 1.6), new THREE.MeshLambertMaterial({ color: TH.sand })); island.position.y = -.2; course.add(island);
    if (TH.palms) golfDeco(course, cols * C, rows * C);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (!fair(r, c)) continue; const x = X(c), z = Z(r), ch = m[r][c];
      const tile = ch === '~' ? new THREE.Mesh(new THREE.BoxGeometry(C, .06, C), golfWater()) : new THREE.Mesh(new THREE.BoxGeometry(C, .1, C), '^><v'.includes(ch) ? golfArrow(ch) : new THREE.MeshLambertMaterial({ color: TH.tiles[(r + c) % 2] })); tile.position.set(x, ch === '~' ? -.03 : 0, z); course.add(tile);
      if (ch === 'T') { const ring = new THREE.Mesh(new THREE.TorusGeometry(.32, .07, 8, 20), new THREE.MeshLambertMaterial({ color: TT.purple, emissive: '#3a1060' })); ring.rotation.x = Math.PI / 2; ring.position.set(x, .1, z); const disc = new THREE.Mesh(new THREE.CircleGeometry(.3, 20), new THREE.MeshBasicMaterial({ color: '#1a0a33' })); disc.rotation.x = -Math.PI / 2; disc.position.set(x, .058, z); ring.userData.spin = 1; course.add(ring, disc); tps.push({ x, z }); }
      if (ch === 'U') { const b = new THREE.Mesh(new THREE.CylinderGeometry(.26, .3, .3, 20), new THREE.MeshLambertMaterial({ color: TT.red, emissive: '#400' })); b.position.set(x, .2, z); const cap = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, .06, 20), new THREE.MeshBasicMaterial({ color: '#fff' })); cap.position.y = .17; b.add(cap); course.add(b); bumpers.push({ x, z, r: .27, mesh: b, flash: 0 }); }
      const edge = (x1, z1, x2, z2) => { walls.push({ x1: Math.min(x1, x2), z1: Math.min(z1, z2), x2: Math.max(x1, x2), z2: Math.max(z1, z2) }); const w = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x2 - x1) + .1, .28, Math.abs(z2 - z1) + .1), wallMat); w.position.set((x1 + x2) / 2, .14, (z1 + z2) / 2); course.add(w); const tp = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x2 - x1) + .12, .03, Math.abs(z2 - z1) + .12), topMat); tp.position.set(w.position.x, .29, w.position.z); course.add(tp); };
      const h = C / 2;
      if (!fair(r - 1, c)) edge(x - h, z - h, x + h, z - h); if (!fair(r + 1, c)) edge(x - h, z + h, x + h, z + h);
      if (!fair(r, c - 1)) edge(x - h, z - h, x - h, z + h); if (!fair(r, c + 1)) edge(x + h, z - h, x + h, z + h);
      if (ch === 'S') bp.set(x, z);
      if (ch === 'H') { cup.set(x, z); const hcol = new THREE.Mesh(new THREE.CircleGeometry(CUP, 24), new THREE.MeshBasicMaterial({ color: '#000' })); hcol.rotation.x = -Math.PI / 2; hcol.position.set(x, .056, z); course.add(hcol); const pole = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 1.2), new THREE.MeshLambertMaterial({ color: '#eee' })); pole.position.set(x, .6, z); course.add(pole); const flag = new THREE.Mesh(new THREE.PlaneGeometry(.45, .3), new THREE.MeshBasicMaterial({ color: TT.red, side: THREE.DoubleSide })); flag.position.set(x + .23, 1.05, z); flag.userData.flag = 1; course.add(flag); }
      if (ch === 'O') { posts.push({ x, z, r: .24 }); const p = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .4, 20), new THREE.MeshLambertMaterial({ color: pick([TT.red, TT.blue, TT.yellow, TT.purple]) })); p.position.set(x, .2, z); course.add(p); }
      if (ch === 'W') { spinner = { x, z, a: 0, L: .62, g: new THREE.Group() }; const mat = new THREE.MeshLambertMaterial({ color: TT.red }); [0, 1].forEach(k => { const b = new THREE.Mesh(new THREE.BoxGeometry(1.24, .22, .1), k ? new THREE.MeshLambertMaterial({ color: TT.yellow }) : mat); b.rotation.y = k * Math.PI / 2; b.position.y = .17; spinner.g.add(b); }); const hub = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, .5), new THREE.MeshLambertMaterial({ color: '#fff' })); hub.position.y = .25; spinner.g.add(hub); spinner.g.position.set(x, 0, z); course.add(spinner.g); }
      if (ch === 'M' && !mover) { let c0 = c, c1 = c; while (c1 + 1 < cols && m[r][c1 + 1] === 'M') c1++; mover = { z, xa: X(c0) + .2, xb: X(c1) - .2, x: 0, w: .55, d: .25, vx: 0, mesh: new THREE.Mesh(new THREE.BoxGeometry(1.1, .3, .5), new THREE.MeshLambertMaterial({ color: TT.blue })) }; mover.mesh.position.set(0, .2, z); course.add(mover.mesh); }
    }
    ball = new THREE.Mesh(new THREE.SphereGeometry(BR, 20, 14), new THREE.MeshStandardMaterial({ color: '#fff', roughness: .3 })); course.add(ball);
    golfer = castSprite(PROG.buddy || 'robo', .9); course.add(golfer);
    aim = new THREE.Group(); const dots = []; for (let i = 0; i < 8; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(.045, 8, 6), new THREE.MeshBasicMaterial({ color: TT.yellow })); aim.add(d); dots.push(d); } aim.userData.dots = dots; aim.visible = false; course.add(aim);
    bv.set(0, 0); strokes = 0; state = 'aim'; sinkT = 0; ctr.set(0, 0, 0); placeBall(); label(`${TH.icon} ${n} · PAR ${hole.par}`);
  }
  const placeBall = () => { ball.position.set(bp.x, .06 + BR, bp.y); ball.visible = true; golfer.position.set(bp.x - .45, .05, bp.y + .1); golfer.visible = true; };
  function shoot(dx, dz, pow) { if (state !== 'aim') return; const l = Math.hypot(dx, dz) || 1; const sp = clamp(pow, .8, 9); bv.set(dx / l * sp, dz / l * sp); strokes++; state = 'roll'; aim.visible = false; golfer.visible = false; tone(330 + sp * 30, .08, 'triangle', .12); noise(.05, .15, 'highpass', 2500); label(`${strokes}`); }
  const groundPt = e => { const h = V.hit(e, [ground]); return h.length ? h[0].point : null; };
  /* FLICK (default): swipe the way you want the ball to go — fast or long swipe = harder hit. Tap = roll toward the tap.
     PULL (🏹 tool): drag back and let go, like classic golf games. */
  let drag = null, pull = !!PROG.golfPull;
  const pullBtn = g.tool(pull ? '🏹' : '👆', b => { pull = !pull; PROG.golfPull = pull; saveProg(); b.textContent = pull ? '🏹' : '👆'; H.bubble(pull ? '🏹 ←' : '👆 →'); });
  const showAim = (dx, dz, pow) => { const l = Math.hypot(dx, dz) || 1; aim.visible = true; aim.userData.dots.forEach((d, i) => d.position.set(ball.position.x + dx / l * (i + 1) * Math.min(pow, 9) * .05, .2, ball.position.z + dz / l * (i + 1) * Math.min(pow, 9) * .05)); };
  const dragShot = (d, p, ms) => { let dx = p.x - d.p.x, dz = p.z - d.p.z; if (pull) { dx = -dx; dz = -dz; } const len = Math.hypot(dx, dz), speedBonus = pull ? 1 : clamp(220 / Math.max(80, ms), .8, 1.8); return { dx, dz, pow: len * (pull ? 3.2 : 2.6) * speedBonus + (pull ? 0 : .8) }; };
  g.on(V.el, 'pointerdown', e => { if (state !== 'aim') return; const p = groundPt(e); drag = { p, x: e.clientX, y: e.clientY, cur: p, t: performance.now() }; });
  g.on(V.el, 'pointermove', e => { if (!drag) return; const p = groundPt(e); if (!p || !drag.p) return; drag.cur = p; if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 14) { const s = dragShot(drag, p, performance.now() - drag.t); showAim(s.dx, s.dz, s.pow); } });
  g.on(V.el, 'pointerup', e => {
    if (!drag) return; const d = drag; drag = null; aim.visible = false; if (!d.p) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 14) { const dx = d.p.x - ball.position.x, dz = d.p.z - ball.position.z; shoot(dx, dz, Math.hypot(dx, dz) * 1.7 + .6); return; }
    const s = dragShot(d, d.cur, performance.now() - d.t); shoot(s.dx, s.dz, s.pow);
  });
  g.key = e => { if (e.key === ' ' || e.key === 'Enter') { const dx = cup.x - ball.position.x, dz = cup.y - ball.position.z; shoot(dx, dz, Math.hypot(dx, dz) * 1.5 + .5); } };
  function segHit(px, pz, ax, az, bx, bz, vx = 0, vz = 0) {
    const abx = bx - ax, abz = bz - az, l2 = abx * abx + abz * abz, u = clamp(((px - ax) * abx + (pz - az) * abz) / (l2 || 1), 0, 1), qx = ax + abx * u, qz = az + abz * u, dx = px - qx, dz = pz - qz, d = Math.hypot(dx, dz);
    if (d >= BR || d === 0) return false; const nx = dx / d, nz = dz / d, rvx = bv.x - vx, rvz = bv.y - vz, vn = rvx * nx + rvz * nz;
    if (vn < 0) { bv.x -= 1.75 * vn * nx; bv.y -= 1.75 * vn * nz; } ball.position.x = qx + nx * BR; ball.position.z = qz + nz * BR; return vn < -.4;
  }
  g.levels(9, n => { g.meter(1); build(n); H.bubble('👆 ⛳'); });
  g.loop(dt => {
    t += dt;
    if (spinner) { spinner.a += dt * 1.6; spinner.g.rotation.y = -spinner.a; }
    if (mover) { const nx = lerp(mover.xa, mover.xb, (Math.sin(t * 1.1) + 1) / 2); mover.vx = (nx - mover.x) / Math.max(dt, 1e-3); mover.x = nx; mover.mesh.position.x = nx; }
    course && course.children.forEach(o => { if (o.userData.flag) o.rotation.y = Math.sin(t * 3) * .3; if (o.userData.spin) o.rotation.z += dt * 3; });
    bumpers.forEach(b => { b.flash = Math.max(0, b.flash - dt); const k = 1 + b.flash * 1.2; b.mesh.scale.set(k, 1, k); b.mesh.material.emissive.set(b.flash > 0 ? '#ff8' : '#400'); });
    if (state === 'roll') {
      const sub = 6, h = dt / sub;
      for (let s = 0; s < sub; s++) {
        ball.position.x += bv.x * h; ball.position.z += bv.y * h;
        let bonk = false;
        for (const w of walls) bonk = segHit(ball.position.x, ball.position.z, w.x1, w.z1, w.x2, w.z2) || bonk;
        for (const p of posts) { const dx = ball.position.x - p.x, dz = ball.position.z - p.z, d = Math.hypot(dx, dz); if (d < p.r + BR && d > 0) { const nx = dx / d, nz = dz / d, vn = bv.x * nx + bv.y * nz; if (vn < 0) { bv.x -= 2.1 * vn * nx; bv.y -= 2.1 * vn * nz; SFX.boing(); } ball.position.x = p.x + nx * (p.r + BR); ball.position.z = p.z + nz * (p.r + BR); } }
        for (const b of bumpers) { const dx = ball.position.x - b.x, dz = ball.position.z - b.z, d = Math.hypot(dx, dz); if (d < b.r + BR && d > 0) { const nx = dx / d, nz = dz / d, vn = bv.x * nx + bv.y * nz; if (vn < 0) { bv.x -= 2 * vn * nx; bv.y -= 2 * vn * nz; const sp2 = Math.hypot(bv.x, bv.y), want = Math.max(sp2 * 1.15, 3.6); bv.multiplyScalar(want / (sp2 || 1)); b.flash = .25; tone(880, .06, 'square', .06); tone(1320, .08, 'square', .05, .04); } ball.position.x = b.x + nx * (b.r + BR); ball.position.z = b.z + nz * (b.r + BR); } }
        const cell = cellAt(ball.position.x, ball.position.z);
        if (cell === '~') { state = 'splash'; bv.set(0, 0); ball.visible = false; label('💦 SPLASH!'); noise(.5, .25, 'lowpass', 1200); sweep(500, 150, .4, 'sine', .15); g.after(900, () => { if (state === 'splash') { state = 'aim'; placeBall(); label(`${strokes}`); } }); break; }
        const BD = { '^': [0, -1], 'v': [0, 1], '<': [-1, 0], '>': [1, 0] }[cell]; if (BD) { bv.x += BD[0] * 16 * h; bv.y += BD[1] * 16 * h; const sp3 = Math.hypot(bv.x, bv.y); if (sp3 > 6.5) bv.multiplyScalar(6.5 / sp3); if (Math.random() < .05) tone(1200 + rand(0, 400), .03, 'square', .02); }
        if (tpCool && Math.hypot(ball.position.x - tpCool.x, ball.position.z - tpCool.z) > .55) tpCool = null;
        if (!tpCool && tps.length === 2) for (const [i, p] of tps.entries()) { if (Math.hypot(ball.position.x - p.x, ball.position.z - p.z) < .3) { const o = tps[1 - i]; ball.position.x = o.x; ball.position.z = o.z; tpCool = o; sweep(300, 1400, .3, 'sine', .12); const sp4 = Math.hypot(bv.x, bv.y); if (sp4 < 2) bv.multiplyScalar(2 / (sp4 || 1)); break; } }
        if (spinner) for (const k of [0, 1]) { const a = spinner.a + k * Math.PI / 2, cx = Math.cos(a) * spinner.L, cz = Math.sin(a) * spinner.L, rx = ball.position.x - spinner.x, rz = ball.position.z - spinner.z; if (segHit(ball.position.x, ball.position.z, spinner.x - cx, spinner.z - cz, spinner.x + cx, spinner.z + cz, -rz * 1.6, rx * 1.6)) tone(300, .06, 'square', .05); }
        if (mover) { const mx = clamp(ball.position.x, mover.x - mover.w, mover.x + mover.w), mz = clamp(ball.position.z, mover.z - mover.d, mover.z + mover.d), dx = ball.position.x - mx, dz = ball.position.z - mz, d = Math.hypot(dx, dz); if (d < BR && d > 0) { const nx = dx / d, nz = dz / d, vn = (bv.x - mover.vx) * nx + bv.y * nz; if (vn < 0) { bv.x -= 1.8 * vn * nx; bv.y -= 1.8 * vn * nz; SFX.bump(); } ball.position.x = mx + nx * BR; ball.position.z = mz + nz * BR; } }
        if (bonk) tone(200, .05, 'triangle', .08);
        const sp = Math.hypot(bv.x, bv.y), dc = Math.hypot(ball.position.x - cup.x, ball.position.z - cup.y);
        if (dc < CUP && sp < 4.6) { state = 'sink'; sinkT = 0; bv.set(0, 0); break; }
        if (dc < .6 && sp < 3.2) { bv.x += (cup.x - ball.position.x) / dc * 2.4 * h; bv.y += (cup.y - ball.position.z) / dc * 2.4 * h; }
        if (dc < CUP * .8 && sp >= 4.6) { bv.x += (ball.position.x - cup.x) * 3; bv.y += (ball.position.z - cup.y) * 3; }
        const k = Math.exp(-1.15 * h), dec = Math.max(0, sp - .5 * h) / (sp || 1); bv.multiplyScalar(k * dec);
        if (Math.hypot(bv.x, bv.y) < .06) { bv.set(0, 0); state = 'aim'; bp.set(ball.position.x, ball.position.z); golfer.position.set(bp.x - .45, .05, bp.y + .1); golfer.visible = true; if (strokes >= hole.par + 3) { label('🤝 GIMME!'); state = 'gimme'; g.after(700, () => { if (state === 'gimme') { state = 'roll'; const dx = cup.x - ball.position.x, dz = cup.y - ball.position.z, l = Math.hypot(dx, dz) || 1; bv.set(dx / l * Math.min(4, l * 1.6 + 1), dz / l * Math.min(4, l * 1.6 + 1)); } }); } break; }
      }
      ball.rotation.x += bv.y * dt / BR; ball.rotation.z -= bv.x * dt / BR;
    }
    if (state === 'sink') {
      sinkT += dt; ball.position.x = lerp(ball.position.x, cup.x, dt * 10); ball.position.z = lerp(ball.position.z, cup.y, dt * 10); ball.position.y = .18 - Math.min(.3, sinkT * .8);
      if (sinkT > .45 && state === 'sink') {
        state = 'done'; ball.visible = false; const ace = strokes === 1, good = strokes <= hole.par;
        label(ace ? 'HOLE IN ONE!' : good ? (strokes < hole.par ? 'BIRDIE!' : 'PAR!') : `⛳ ${strokes}`); SFX.chime(); confettiDOM(g, ace ? 60 : 25); H.happy(); g.star(ace ? 5 : good ? 3 : 1); if (ace) secret('holeinone');
        g.after(1800, () => { if (g.alive() && g.progress()) g.levelUp(); });
      }
    }
    const want = new THREE.Vector3(state === 'roll' ? ball.position.x * .4 : 0, span * 1.25 + 2, (state === 'roll' ? ball.position.z * .4 : 0) + span * .75 + 1.5);
    cam.position.lerp(want, Math.min(1, dt * 2)); ctr.lerp(new THREE.Vector3(state === 'roll' ? ball.position.x * .4 : 0, 0, state === 'roll' ? ball.position.z * .4 : 0), Math.min(1, dt * 2)); cam.lookAt(ctr);
    V.render();
  });
}
const golfWater = () => new THREE.MeshLambertMaterial({ color: '#1f7fe0', emissive: '#041a40' });
const GOLF_ARROW = {};
function golfArrow(ch) {
  if (GOLF_ARROW[ch]) return GOLF_ARROW[ch];
  const rot = { '^': 0, '>': Math.PI / 2, 'v': Math.PI, '<': -Math.PI / 2 }[ch];
  return GOLF_ARROW[ch] = new THREE.MeshLambertMaterial({ map: canvasTex(64, 64, (c, w, h) => { c.fillStyle = TT.orange; c.fillRect(0, 0, w, h); c.translate(w / 2, h / 2); c.rotate(rot); c.fillStyle = '#fff'; for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(-18, 6 - i * 18); c.lineTo(0, -12 - i * 18 + 18); c.lineTo(18, 6 - i * 18); c.lineTo(18, 14 - i * 18); c.lineTo(0, -4 - i * 18 + 18); c.lineTo(-18, 14 - i * 18); c.fill(); } }) });
}
/* palm trees, a treasure chest and a pirate flag around the pirate course */
function golfDeco(grp, w, d) {
  const trunkMat = new THREE.MeshLambertMaterial({ color: '#8B5A3C' }), leafMat = new THREE.MeshLambertMaterial({ color: '#1f9a4a', side: THREE.DoubleSide });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], i) => {
    const p = new THREE.Group(), tr = new THREE.Mesh(new THREE.CylinderGeometry(.08, .12, 1.8, 8), trunkMat); tr.position.y = .9; tr.rotation.z = sx * .12; p.add(tr);
    for (let k = 0; k < 5; k++) { const lf = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .3), leafMat); lf.position.set(Math.cos(k * 1.26) * .45, 1.8, Math.sin(k * 1.26) * .45); lf.rotation.y = -k * 1.26; lf.rotation.z = -.4; p.add(lf); }
    p.position.set(sx * (w / 2 + .5), -.05, sz * (d / 2 + .4)); grp.add(p);
  });
  const chest = new THREE.Group(), box = new THREE.Mesh(new THREE.BoxGeometry(.6, .35, .4), new THREE.MeshLambertMaterial({ color: '#7a4a22' })), lid = new THREE.Mesh(new THREE.BoxGeometry(.62, .12, .42), new THREE.MeshLambertMaterial({ color: '#5a3416' })), gold = new THREE.Mesh(new THREE.BoxGeometry(.5, .06, .3), new THREE.MeshStandardMaterial({ color: '#FFC83D', metalness: .7, roughness: .3, emissive: '#5a3a00' }));
  box.position.y = .18; lid.position.set(0, .42, -.12); lid.rotation.x = -.6; gold.position.y = .37; chest.add(box, lid, gold); chest.position.set(w / 2 + .5, -.05, 0); grp.add(chest);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 2.2), new THREE.MeshLambertMaterial({ color: '#ddd' })); pole.position.set(-w / 2 - .5, 1.05, 0); grp.add(pole);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(.8, .5), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: canvasTex(64, 40, (c, fw, fh) => { c.fillStyle = '#111'; c.fillRect(0, 0, fw, fh); c.fillStyle = '#fff'; c.beginPath(); c.arc(32, 16, 8, 0, 7); c.fill(); c.fillRect(27, 20, 10, 6); c.fillStyle = '#111'; c.fillRect(28, 13, 3, 3); c.fillRect(33, 13, 3, 3); c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(18, 26); c.lineTo(46, 36); c.moveTo(46, 26); c.lineTo(18, 36); c.stroke(); }) }));
  flag.position.set(-w / 2 - .1, 1.9, 0); flag.userData.flag = 1; grp.add(flag);
}

/* FLUSH LAUNCH — hold the handle to power up, let go: whoosh! Land it in the target */
const FLUSH_ITEMS = ['🦆', '🧸', '🐟', '💩', '🚀', '🧦'];
game('flush', 'play', '🚽', g => {
  const H = g.host('dino'); g.stage.classList.add('col'); const wrap = mk('div', 'paintWrap'); g.stage.appendChild(wrap);
  const Cv = g.canvas(wrap), x = Cv.ctx, P = new Particles();
  let item = PROG.flushItem || '🦆', L = 1, state = 'ready', power = 0, pdir = 1, ang = .9, adir = 1, it = null, camX = 0, t = 0, wind = 0, target = null, stars = [], clouds = [], got = 0;
  const bar = pickerBar(g, [{ items: FLUSH_ITEMS.map(e => ({ html: e })), sel: () => FLUSH_ITEMS.indexOf(item), pick: i => { item = FLUSH_ITEMS[i]; PROG.flushItem = item; saveProg(); } }]);
  const btn = mk('button', 'ovbtn flushBtn', '🚽'); bar.appendChild(btn);
  const LV = { 1: { tx: 10, tw: 4.5, ty: 0, kind: '🛁' }, 2: { tx: 16, tw: 2.4, ty: 0, kind: '🪣' }, 3: { tx: 22, tw: 4, ty: 0, kind: '🏊', wind: 1, sweep: 1 }, 4: { tx: 25, tw: 3, ty: 0, kind: '🦆', clouds: 1, sweep: 1 }, 5: { tx: 30, tw: 3, ty: 0, kind: '⛵', move: 1, wind: 1, sweep: 1 }, 6: { tx: 20, tw: 3, ty: 11, kind: '🌙', sweep: 1 } };
  function setup() {
    const c = LV[L]; state = 'ready'; power = 0; it = null; camX = 0; got = 0; wind = c.wind ? rand(-3, 3) : 0; ang = c.sweep ? .9 : .87;
    target = { x: c.tx, w: c.tw, y: c.ty, kind: c.kind, x0: c.tx };
    stars = Array.from({ length: 6 }, (_, i) => ({ x: 4 + i * (c.tx - 2) / 6, y: 3 + Math.sin(i) * 2 + (c.ty ? i * 1.4 : 2), got: false }));
    clouds = c.clouds ? [0, 1, 2].map(i => ({ x: 8 + i * 6, y: 5 + (i % 2) * 3, r: 1.3 })) : [];
  }
  const start = () => { if (state !== 'ready') return; state = 'charge'; power = 0; pdir = 1; noise(.3, .1, 'bandpass', 900); };
  const release = () => {
    if (state !== 'charge') return; state = 'fly'; const sp = 7 + power * 15;
    it = { x: .3, y: 1.4, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, rot: 0, bounces: 0 };
    noise(1.1, .3, 'bandpass', 500, 0, 2); sweep(200, 900, .5, 'sine', .2); [0, .15, .3].forEach(d => tone(140, .2, 'sine', .15, d));
  };
  ['pointerdown'].forEach(ev => { g.on(Cv.cv, ev, start); g.on(btn, ev, e => { e.stopPropagation(); start(); }); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => { g.on(Cv.cv, ev, release); g.on(btn, ev, release); });
  g.key = e => { if (e.key === ' ' || e.key === 'Enter') start(); };
  g.on(document, 'keyup', e => { if (e.key === ' ' || e.key === 'Enter') release(); });
  g.levels(6, lv => { L = lv; g.meter(3); setup(); H.bubble('👇 🚽 💦'); });
  const done = ok => {
    state = 'done';
    if (ok) { SFX.chime(); noise(.5, .25, 'highpass', 1500); P.burst(sx(it.x), sy(it.y), ['#9fd8ff', '#fff', TT.blue], 40, 400); H.happy(); g.star(2 + got); confettiDOM(g, 25); }
    else { H.mood('oops'); SFX.bad(); }
    g.after(1800, () => { if (!g.alive()) return; if (ok && g.progress()) g.levelUp(); else setup(); });
  };
  let S = 30; const sx = X => (X - camX) * S + Cv.w * .12, sy = Y => Cv.h * .82 - Y * S;
  g.loop(dt => {
    t += dt; const W = Cv.w, Hh = Cv.h; S = Hh / 15; const c = LV[L];
    if (c.move) target.x = target.x0 + Math.sin(t * .8) * 4;
    if (state === 'ready' && c.sweep) { ang += adir * dt * .9; if (ang > 1.25 || ang < .45) adir *= -1; }
    if (state === 'charge') { power += pdir * dt * .8; if (power >= 1 || power <= 0) pdir *= -1; power = clamp(power, 0, 1); if (Math.random() < .3) tone(200 + power * 400, .05, 'sine', .03); }
    if (state === 'fly' && it) {
      it.vy -= 9.8 * dt; it.vx += wind * dt * .6; it.x += it.vx * dt; it.y += it.vy * dt; it.rot += dt * 8;
      stars.forEach(s => { if (!s.got && Math.hypot(s.x - it.x, s.y - it.y) < 1.1) { s.got = true; got = Math.min(3, got + 1); SFX.coin(); P.burst(sx(s.x), sy(s.y), [TT.yellow, '#fff'], 12, 200); } });
      clouds.forEach(cl => { const dx = it.x - cl.x, dy = it.y - cl.y, d = Math.hypot(dx, dy); if (d < cl.r + .4) { const nx = dx / d, ny = dy / d, vn = it.vx * nx + it.vy * ny; if (vn < 0) { it.vx -= 1.6 * vn * nx; it.vy -= 1.6 * vn * ny; SFX.boing(); } } });
      if (Math.random() < .6) P.burst(sx(it.x), sy(it.y), ['#9fd8ff', '#fff'], 1, 40, { g: 300, life: .5, size: 5 });
      const ty = target.y, inX = Math.abs(it.x - target.x) < target.w / 2;
      if (it.vy < 0 && it.y <= ty + .9 && it.y > ty - .3 && inX) done(true);
      else if (it.y <= 0 && !(ty > 0 && inX)) { it.y = 0; it.vy = -it.vy * .45; it.vx *= .6; it.bounces++; SFX.bump(); if (it.bounces > 2 || Math.abs(it.vx) < .5) done(false); }
      else if (it.x > target.x + 25 || it.x < -5) done(false);
      camX = lerp(camX, Math.max(0, it.x - 8), Math.min(1, dt * 3));
    } else if (state !== 'done') camX = lerp(camX, 0, Math.min(1, dt * 2));
    /* draw */
    const sky = x.createLinearGradient(0, 0, 0, Hh); sky.addColorStop(0, L === 6 ? '#05061a' : '#2a6fdb'); sky.addColorStop(1, L === 6 ? '#1a2050' : '#9fd8ff'); x.fillStyle = sky; x.fillRect(0, 0, W, Hh);
    for (let i = 0; i < 8; i++) { const cx = ((i * 260 - camX * S * .3) % (W + 300) + W + 300) % (W + 300) - 150; x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.ellipse(cx, Hh * (.15 + (i % 3) * .08), 70, 22, 0, 0, 7); x.fill(); }
    x.fillStyle = '#2fa84f'; x.fillRect(0, sy(0), W, Hh - sy(0)); x.fillStyle = '#25863f'; x.fillRect(0, sy(0), W, 6);
    const bx = sx(-1.5); x.fillStyle = '#dfe9ff'; x.fillRect(bx - S * 3, sy(5), S * 4.6, sy(0) - sy(5)); x.strokeStyle = '#b8c8e8'; for (let gx = 0; gx < 5; gx++) for (let gy = 0; gy < 5; gy++) x.strokeRect(bx - S * 3 + gx * S * .92, sy(5) + gy * S, S * .92, S);
    /* toilet */
    const tx = sx(0); x.fillStyle = '#fff'; x.strokeStyle = '#111'; x.lineWidth = 3;
    x.beginPath(); x.roundRect(tx - S * 1.4, sy(3.2), S * .9, S * 1.6, 6); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(tx - S * 1.1, sy(1.4)); x.lineTo(tx + S * .9, sy(1.4)); x.quadraticCurveTo(tx + S * .7, sy(.3), tx, sy(.3)); x.lineTo(tx - S * .5, sy(0)); x.lineTo(tx - S * .7, sy(0)); x.quadraticCurveTo(tx - S * 1.1, sy(.6), tx - S * 1.1, sy(1.4)); x.fill(); x.stroke();
    x.fillStyle = '#9fd8ff'; x.beginPath(); x.ellipse(tx - S * .1, sy(1.4), S * .85, S * .2, 0, 0, 7); x.fill(); x.stroke();
    const hl = state === 'charge' ? .5 : 0; x.fillStyle = '#ccc'; x.save(); x.translate(tx - S * .55, sy(2.8)); x.rotate(hl); x.fillRect(0, -4, S * .45, 8); x.restore();
    if (state === 'charge') { x.strokeStyle = 'rgba(59,98,255,.8)'; x.lineWidth = 4; for (let k = 0; k < 3; k++) { x.beginPath(); x.ellipse(tx - S * .1, sy(1.4), S * .7 * (1 - k * .25), S * .14 * (1 - k * .25), 0, t * 12 + k, t * 12 + k + 4); x.stroke(); } }
    if (state === 'ready' || state === 'charge') { x.fillStyle = '#fff'; for (let i = 1; i < 8; i++) { const sp = 7 + (state === 'charge' ? power : .5) * 15, tt = i * .12, px = Math.cos(ang) * sp * tt, py = 1.4 + Math.sin(ang) * sp * tt - 4.9 * tt * tt; x.globalAlpha = 1 - i / 9; x.beginPath(); x.arc(sx(px), sy(py), 4, 0, 7); x.fill(); } x.globalAlpha = 1; x.font = `${S * 1.2}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(item, tx - S * .1, sy(1.75)); }
    /* power meter */
    if (state === 'charge') { x.fillStyle = '#000'; x.fillRect(tx + S * 1.4, sy(4.2), S * .5, S * 3); x.fillStyle = power > .8 ? TT.red : power > .5 ? TT.yellow : TT.green; x.fillRect(tx + S * 1.4, sy(4.2) + S * 3 * (1 - power), S * .5, S * 3 * power); }
    /* target */
    const gx = sx(target.x), gy = sy(target.y); x.font = `${S * target.w * .8}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'bottom';
    if (target.y > 0) { x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.ellipse(gx, gy + S * .2, S * target.w * .7, S * .6, 0, 0, 7); x.fill(); }
    x.fillText(target.kind, gx, gy + S * .3); x.strokeStyle = TT.yellow; x.lineWidth = 3; x.setLineDash([6, 6]); x.strokeRect(gx - target.w / 2 * S, gy - S * 1.2, target.w * S, S * 1.2); x.setLineDash([]);
    stars.forEach(s => { if (s.got) return; x.font = `${S * .9}px sans-serif`; x.textBaseline = 'middle'; x.fillText('⭐', sx(s.x), sy(s.y) + Math.sin(t * 3 + s.x) * 4); });
    clouds.forEach(cl => { x.fillStyle = '#fff'; x.beginPath(); x.ellipse(sx(cl.x), sy(cl.y), cl.r * S * 1.3, cl.r * S * .8, 0, 0, 7); x.fill(); x.fillStyle = '#000'; x.fillRect(sx(cl.x) - 8, sy(cl.y) - 4, 4, 4); x.fillRect(sx(cl.x) + 4, sy(cl.y) - 4, 4, 4); });
    if (wind) { x.fillStyle = '#fff'; x.font = `bold ${S * .6}px ${PXF}`; x.textAlign = 'left'; x.fillText(`💨 ${wind > 0 ? '→' : '←'}`.repeat(1) + ' ' + Math.abs(wind).toFixed(1), 16, 30); }
    if (it && state !== 'ready') { x.save(); x.translate(sx(it.x), sy(it.y)); x.rotate(it.rot); x.font = `${S * 1.2}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(item, 0, 0); x.restore(); }
    P.update(dt); P.draw(x);
  });
});

/* KART RACING — 5 tracks; hold left/right to steer, it goes by itself; boost pads and stars */
const TRACKS = [
  { name: 'GREEN LOOP', w: 9, laps: 2, ai: .72, n: 1, pts: [[0, 0, 40], [30, 0, 30], [40, 0, 0], [30, 0, -30], [0, 0, -40], [-30, 0, -30], [-40, 0, 0], [-30, 0, 30]], sky: '#7fc8ff', ground: '#3bb35a' },
  { name: 'TWISTY WOODS', w: 8, laps: 2, ai: .82, n: 2, pts: [[0, 0, 40], [25, 0, 35], [35, 0, 15], [20, 0, 0], [35, 0, -15], [25, 0, -38], [0, 0, -30], [-15, 0, -40], [-35, 0, -25], [-25, 0, 0], [-38, 0, 20], [-20, 0, 38]], sky: '#9fd8ff', ground: '#2a8a45' },
  { name: 'BUMPY HILLS', w: 8, laps: 3, ai: .88, n: 3, pts: [[0, 0, 45], [30, 4, 35], [45, 0, 5], [30, 6, -30], [0, 2, -45], [-30, 7, -30], [-45, 0, 0], [-30, 3, 35]], sky: '#ffc58a', ground: '#4cae4c' },
  { name: 'CITY LIGHTS', w: 8, laps: 3, ai: .93, n: 3, pts: [[0, 0, 40], [35, 0, 40], [40, 0, 10], [15, 0, 5], [15, 0, -20], [40, 0, -25], [35, 0, -45], [-10, 0, -40], [-40, 0, -35], [-35, 0, 0], [-15, 0, 10], [-40, 0, 35]], sky: '#05061a', ground: '#1a1a2a', night: 1 },
  { name: 'SKY RIBBON', w: 6.5, laps: 3, ai: .92, n: 3, pts: [[0, 2, 45], [30, 6, 30], [45, 10, 0], [30, 5, -30], [0, 1, -45], [-30, 8, -30], [-45, 4, 0], [-30, 9, 30]], sky: '#000010', ground: null, rainbow: 1 }
];
game('kart', '3d', '🏎️', g => {
  const H = g.host(PROG.buddy || 'robo'), V = g.three({ fov: 65, far: 600 }), { scene, cam } = V, label = overlayLabel(g);
  stageLights(scene, { hemi: 1 }); const hud = mk('div', 'kartHud'); g.stage.appendChild(hud);
  const mini = mk('canvas', 'kartMini'); mini.width = 150; mini.height = 150; g.stage.appendChild(mini); const mx = mini.getContext('2d');
  const lb = mk('button', 'ovbtn kartL', '◀'), rb = mk('button', 'ovbtn kartR', '▶'); g.stage.append(lb, rb);
  let steer = 0, keyS = 0, world = null, curve = null, len = 1, N = 600, P = [], T_ = [], Nn = [], tr = null, me = null, ais = [], items = [], pads = [], state = 'count', cd = 3.5, t = 0, finishT = 0, boost = 0, place = 1;
  const hold = (el, v) => { g.on(el, 'pointerdown', e => { e.stopPropagation(); steer = v; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => g.on(el, ev, () => { if (steer === v) steer = 0; })); };
  hold(lb, -1); hold(rb, 1);
  g.on(V.el, 'pointerdown', e => { const r = V.el.getBoundingClientRect(); steer = e.clientX < r.left + r.width / 2 ? -1 : 1; });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => g.on(V.el, ev, () => { steer = 0; }));
  g.key = e => { if (e.key === 'ArrowLeft') keyS = -1; if (e.key === 'ArrowRight') keyS = 1; };
  g.on(document, 'keyup', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') keyS = 0; });
  function kartMesh(n, col) {
    const k = new THREE.Group(), body = new THREE.Mesh(new THREE.BoxGeometry(1.4, .45, 2.2), new THREE.MeshLambertMaterial({ color: col })); body.position.y = .45; k.add(body);
    const nose = new THREE.Mesh(new THREE.BoxGeometry(1.1, .3, .6), new THREE.MeshLambertMaterial({ color: '#111' })); nose.position.set(0, .35, -1.25); k.add(nose);
    const wm = new THREE.MeshLambertMaterial({ color: '#111' }); [[-.75, -.75], [.75, -.75], [-.75, .75], [.75, .75]].forEach(([wx, wz]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, .3, 12), wm); w.rotation.z = Math.PI / 2; w.position.set(wx, .32, wz); k.add(w); });
    const d = castSprite(n, 1.25); d.position.set(0, .55, .25); k.add(d); scene.add(k); return k;
  }
  function build(lv) {
    if (world) scene.remove(world); world = new THREE.Group(); scene.add(world); tr = TRACKS[lv - 1];
    scene.background = new THREE.Color(tr.sky); scene.fog = new THREE.Fog(tr.sky, 60, 220);
    curve = new THREE.CatmullRomCurve3(tr.pts.map(p => new THREE.Vector3(p[0] * 1.6, p[1], p[2] * 1.6)), true, 'catmullrom', .5); len = curve.getLength();
    P = []; T_ = []; Nn = []; const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < N; i++) { const u = i / N, p = curve.getPointAt(u), tg = curve.getTangentAt(u); P.push(p); T_.push(tg); Nn.push(new THREE.Vector3().crossVectors(tg, up).normalize()); }
    const road = (w, y, colFn, mat) => { const pos = [], col = [], idx = []; for (let i = 0; i <= N; i++) { const k = i % N, a = P[k].clone().addScaledVector(Nn[k], -w / 2), b = P[k].clone().addScaledVector(Nn[k], w / 2); pos.push(a.x, a.y + y, a.z, b.x, b.y + y, b.z); const c = new THREE.Color(colFn(i)); col.push(c.r, c.g, c.b, c.r, c.g, c.b); if (i < N) { const j = i * 2; idx.push(j, j + 2, j + 1, j + 1, j + 2, j + 3); } } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat || new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })); world.add(m); return m; };
    road(tr.w + 1.6, .02, i => (Math.floor(i / 6) % 2 ? TT.red : '#ffffff'));
    road(tr.w, .05, i => tr.rainbow ? new THREE.Color().setHSL((i / N * 6) % 1, .9, .55).getHex() : (i < 6 ? (i % 2 ? '#fff' : '#111') : (Math.floor(i / 4) % 2 ? '#3a3a3a' : '#404040')));
    road(.25, .07, i => (Math.floor(i / 5) % 2 ? '#ffffff' : (tr.rainbow ? '#ffffff' : '#404040')));
    if (tr.ground) { const gr = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshLambertMaterial({ color: tr.ground })); gr.rotation.x = -Math.PI / 2; gr.position.y = -.05; world.add(gr); }
    else { const sg = new THREE.BufferGeometry(), sp = []; for (let i = 0; i < 800; i++) sp.push(rand(-250, 250), rand(-60, 120), rand(-250, 250)); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); world.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#fff', size: 1.2 }))); }
    for (let i = 0; i < (tr.night ? 70 : 120); i++) { const k = randi(0, N - 1), side = pick([-1, 1]), off = tr.w / 2 + rand(4, 22), p = P[k].clone().addScaledVector(Nn[k], side * off); if (tr.rainbow) continue; if (tr.night) { const b = new THREE.Mesh(new THREE.BoxGeometry(rand(3, 6), rand(6, 22), rand(3, 6)), new THREE.MeshLambertMaterial({ color: pick(['#222244', '#332244', '#223344']), emissive: pick(['#222200', '#110022', '#002222']) })); b.position.set(p.x, b.geometry.parameters.height / 2, p.z); world.add(b); } else { const tree = new THREE.Group(), trunk = new THREE.Mesh(new THREE.CylinderGeometry(.3, .4, 2), new THREE.MeshLambertMaterial({ color: '#8B5A3C' })); trunk.position.y = 1; const top = new THREE.Mesh(new THREE.ConeGeometry(2, 4.5, 8), new THREE.MeshLambertMaterial({ color: pick(['#19D36B', '#0F8A45', '#2fbf71']) })); top.position.y = 4; tree.add(trunk, top); tree.position.set(p.x, p.y, p.z); world.add(tree); } }
    const arch = new THREE.Mesh(new THREE.BoxGeometry(tr.w + 3, 1.2, .4), new THREE.MeshBasicMaterial({ map: canvasTex(256, 32, (c, w, h) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? '#fff' : '#111'; c.fillRect(i * 16, j * 16, 16, 16); } }) })); arch.position.copy(P[0]).add(new THREE.Vector3(0, 5, 0)); arch.lookAt(P[0].clone().add(T_[0]).add(new THREE.Vector3(0, 5, 0))); world.add(arch);
    [-1, 1].forEach(sd => { const post = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, 5.5), new THREE.MeshLambertMaterial({ color: '#ddd' })); post.position.copy(P[0]).addScaledVector(Nn[0], sd * (tr.w / 2 + 1.3)); post.position.y += 2.75; world.add(post); });
    pads = []; for (let i = 1; i < 5; i++) { const s = len * (i / 5 + .07), k = Math.floor(s / len * N) % N, off = rand(-tr.w / 4, tr.w / 4), m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.6), new THREE.MeshBasicMaterial({ map: canvasTex(64, 64, (c, w, h) => { c.fillStyle = TT.yellow; c.fillRect(0, 0, w, h); c.fillStyle = TT.orange; for (let j = 0; j < 2; j++) { c.beginPath(); c.moveTo(8, 50 - j * 24); c.lineTo(32, 30 - j * 24); c.lineTo(56, 50 - j * 24); c.lineTo(56, 40 - j * 24); c.lineTo(32, 20 - j * 24); c.lineTo(8, 40 - j * 24); c.fill(); } }) })); m.position.copy(P[k]).addScaledVector(Nn[k], off); m.position.y += .09; m.rotation.x = -Math.PI / 2; m.rotation.z = Math.atan2(T_[k].x, T_[k].z) + Math.PI; world.add(m); pads.push({ s, off }); }
    items = []; for (let i = 0; i < 22; i++) { const s = rand(.05, .98) * len, off = rand(-tr.w / 2 + 1, tr.w / 2 - 1), m = new THREE.Mesh(new THREE.OctahedronGeometry(.55), new THREE.MeshLambertMaterial({ color: TT.yellow, emissive: '#553300' })); world.add(m); items.push({ s, off, m, got: false }); }
    ais.forEach(a => scene.remove(a.k)); if (me) scene.remove(me.k);
    me = { s: 0, off: tr.w * .2, sp: 0, k: kartMesh(PROG.buddy || 'robo', TT.red), lap: 0 };
    const rivals = CAST_IDS.filter(c => c !== (PROG.buddy || 'robo')).slice(0, tr.n);
    ais = rivals.map((n, i) => ({ s: -(i + 1) * 3.5, off: (i % 2 ? -1 : 1) * tr.w * .2, sp: 0, k: kartMesh(n, [TT.blue, TT.green, TT.purple][i]), base: tr.ai * rand(.96, 1.04), ph: rand(0, 6), n }));
    me.s = -1.5; state = 'count'; cd = 3.5; finishT = 0; boost = 0; label('');
    // minimap bounds
    let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9; P.forEach(p => { mnx = Math.min(mnx, p.x); mxx = Math.max(mxx, p.x); mnz = Math.min(mnz, p.z); mxz = Math.max(mxz, p.z); }); world.userData.b = { mnx, mxx, mnz, mxz };
  }
  const at = (s, off, out) => { const u = ((s % len) + len) % len / len * N, i = Math.floor(u) % N, j = (i + 1) % N, f = u - Math.floor(u); out.p = P[i].clone().lerp(P[j], f).addScaledVector(Nn[i], off); out.t = T_[i].clone().lerp(T_[j], f).normalize(); out.n = Nn[i]; return out; };
  const place3 = (k, s, off, tilt) => { const o = at(s, off, {}); k.position.copy(o.p); k.lookAt(o.p.clone().sub(o.t)); k.rotateY(tilt || 0); };
  g.levels(5, lv => { g.meter(1); build(lv); H.bubble(`🏁 ${TRACKS[lv - 1].name}`); });
  g.loop(dt => {
    t += dt; const MAX = 27, st = steer || keyS;
    if (state === 'count') { const before = Math.ceil(cd); cd -= dt; const now = Math.ceil(cd); if (now !== before && now > 0) { label(String(now)); tone(440, .15, 'square', .08); } if (cd <= 0) { state = 'race'; label('GO!'); tone(880, .4, 'square', .08); g.after(800, () => label('')); } }
    if (state === 'race' || state === 'done') {
      const off = Math.abs(me.off) > tr.w / 2 - .4, top = (boost > 0 ? 38 : off ? 12 : MAX) * (state === 'done' ? .4 : 1);
      me.sp = me.sp < top ? Math.min(top, me.sp + 14 * dt) : Math.max(top, me.sp - 20 * dt); boost = Math.max(0, boost - dt);
      me.off = clamp(me.off + st * dt * (5 + me.sp * .22), -tr.w / 2 - 3, tr.w / 2 + 3); me.s += me.sp * dt;
      pads.forEach(p => { const ds = ((me.s - p.s) % len + len) % len; if (ds < 1.3 && Math.abs(me.off - p.off) < 1.6 && boost < .5) { boost = 1.3; sweep(300, 900, .4, 'sawtooth', .05); } });
      items.forEach(it => { if (it.got) return; const ds = Math.abs(((me.s - it.s) % len + len + len / 2) % len - len / 2); if (ds < 1.4 && Math.abs(me.off - it.off) < 1.4) { it.got = true; it.m.visible = false; SFX.coin(); g.star(1); boost = Math.max(boost, .5); } });
      ais.forEach(a => { const gap = me.s - a.s, band = clamp(1 + gap * .006, .85, 1.25); const tgt = MAX * a.base * band * (state === 'done' ? 1 : 1); a.sp = Math.min(tgt, a.sp + 12 * dt); a.s += a.sp * dt; a.off = Math.sin(t * .5 + a.ph) * tr.w * .28; });
      [me, ...ais].forEach((a, i, arr) => arr.slice(i + 1).forEach(b => { if (Math.abs(a.s - b.s) < 2 && Math.abs(a.off - b.off) < 1.4) { const d = Math.sign(a.off - b.off) || 1; a.off += d * .1; b.off -= d * .1; if (a === me || b === me) { if (Math.random() < .1) SFX.bump(); } } }));
      const lap = Math.floor(me.s / len); if (lap > me.lap && state === 'race') { me.lap = lap; if (lap < tr.laps) { label(lap === tr.laps - 1 ? 'FINAL LAP!' : `LAP ${lap + 1}`); SFX.chime(); g.after(1200, () => label('')); } }
      place = 1 + ais.filter(a => a.s > me.s).length;
      if (state === 'race' && me.s >= len * tr.laps) {
        state = 'done'; const medals = ['🥇', '🥈', '🥉', '4']; label(`${medals[place - 1]} ${place === 1 ? 'WINNER!' : ''}`); confettiDOM(g, place === 1 ? 60 : 20);
        place <= 3 ? (SFX.chime(), H.happy()) : (H.mood('oops'), SFX.bad()); g.star([5, 3, 2, 1][place - 1]); if (place === 1 && g.lvl() === 5) secret('rainbow');
        g.after(3000, () => { if (!g.alive()) return; if (place <= 3 && g.progress()) g.levelUp(); else build(g.lvl()); });
      }
    }
    place3(me.k, me.s, me.off, -st * .25); me.k.position.y += Math.sin(t * 30) * .02 * (me.sp / MAX); ais.forEach(a => place3(a.k, a.s, a.off, 0));
    items.forEach(it => { if (!it.got) { const o = at(it.s, it.off, {}); it.m.position.copy(o.p); it.m.position.y += 1 + Math.sin(t * 3 + it.s) * .2; it.m.rotation.y += dt * 2; } });
    const o = at(me.s, me.off * .6, {}), camPos = o.p.clone().addScaledVector(o.t, -7.5).add(new THREE.Vector3(0, 3.2, 0));
    cam.position.lerp(camPos, Math.min(1, dt * 5)); cam.lookAt(o.p.clone().addScaledVector(o.t, 6).add(new THREE.Vector3(0, 1, 0)));
    cam.fov = 65 + (boost > 0 ? 10 : 0); cam.updateProjectionMatrix();
    hud.innerHTML = `<b>${['🥇', '🥈', '🥉', '4TH'][place - 1]}</b><span>LAP ${Math.min(tr.laps, me.lap + 1)}/${tr.laps}</span>${boost > 0 ? '<i>BOOST!</i>' : ''}`;
    const b = world.userData.b, sc = 130 / Math.max(b.mxx - b.mnx, b.mxz - b.mnz), mpx = p => [10 + (p.x - b.mnx) * sc, 10 + (p.z - b.mnz) * sc];
    mx.clearRect(0, 0, 150, 150); mx.strokeStyle = 'rgba(255,255,255,.7)'; mx.lineWidth = 4; mx.beginPath(); P.forEach((p, i) => { if (i % 6) return; const [a, c] = mpx(p); i ? mx.lineTo(a, c) : mx.moveTo(a, c); }); mx.closePath(); mx.stroke();
    [...ais, me].forEach((a, i, arr) => { const [a1, c1] = mpx(at(a.s, 0, {}).p); mx.fillStyle = a === me ? TT.red : [TT.blue, TT.green, TT.purple][i]; mx.beginPath(); mx.arc(a1, c1, a === me ? 6 : 4, 0, 7); mx.fill(); });
    V.render();
  });
});

/* SNOWBOARD — ride down the mountain, steer through the gates, hit the jumps */
game('snowboard', '3d', '🏂', g => {
  const H = g.host(PROG.buddy || 'foxy'), V = g.three({ fov: 60, far: 200 }), { scene, cam } = V, label = overlayLabel(g);
  const lb = mk('button', 'ovbtn kartL', '◀'), rb = mk('button', 'ovbtn kartR', '▶'); g.stage.append(lb, rb);
  let steer = 0, keyS = 0, px = 0, vx = 0, speed = 10, dist = 0, objs = [], t = 0, air = 0, airV = 0, spin = 0, crash = 0, spawnZ = 0, snow = null, L = 1, gatesHit = 0;
  const hold = (el, v) => { g.on(el, 'pointerdown', e => { e.stopPropagation(); steer = v; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => g.on(el, ev, () => { if (steer === v) steer = 0; })); };
  hold(lb, -1); hold(rb, 1);
  g.on(V.el, 'pointerdown', e => { if (air > 0) { spin += Math.PI * 2; tone(660, .1, 'square', .05); return; } const r = V.el.getBoundingClientRect(); steer = e.clientX < r.left + r.width / 2 ? -1 : 1; });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => g.on(V.el, ev, () => { steer = 0; }));
  g.key = e => { if (e.key === 'ArrowLeft') keyS = -1; if (e.key === 'ArrowRight') keyS = 1; if (e.key === ' ' && air > 0) spin += Math.PI * 2; };
  g.on(document, 'keyup', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') keyS = 0; });
  const LV = { 1: { sp: 10, tree: 0, ramp: 0, gates: 10 }, 2: { sp: 12, tree: .35, ramp: 0, gates: 10 }, 3: { sp: 13, tree: .3, ramp: .25, gates: 12 }, 4: { sp: 16, tree: .5, ramp: .25, gates: 12 }, 5: { sp: 17, tree: .5, ramp: .3, gates: 15, night: 1 } };
  const slope = new THREE.Mesh(new THREE.PlaneGeometry(40, 260), new THREE.MeshLambertMaterial({ map: canvasTex(64, 256, (c, w, h) => { c.fillStyle = '#f4f8ff'; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { c.fillStyle = 'rgba(160,190,230,.35)'; c.fillRect(rand(0, w), rand(0, h), rand(2, 10), 1); } }) })); slope.material.map.wrapS = slope.material.map.wrapT = THREE.RepeatWrapping; slope.material.map.repeat.set(2, 8); slope.rotation.x = -Math.PI / 2; slope.position.z = -100; scene.add(slope);
  const rider = new THREE.Group(), board = new THREE.Mesh(new THREE.BoxGeometry(.5, .08, 1.6), new THREE.MeshLambertMaterial({ color: TT.red })); board.position.y = .05; rider.add(board); const spr = castSprite(PROG.buddy || 'foxy', 1.4); spr.position.y = .08; rider.add(spr); scene.add(rider);
  const fence = []; [-11, 11].forEach(sx => { for (let i = 0; i < 12; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 1), new THREE.MeshLambertMaterial({ color: TT.orange })); p.position.set(sx, .5, -i * 10); scene.add(p); fence.push(p); } });
  function spawn(z) {
    const c = LV[L], r = Math.random();
    if (r < .45) { const gx = rand(-6, 6), wdt = L <= 2 ? 3.6 : 2.6, col = pick([TT.red, TT.blue]), grp = new THREE.Group(); [-1, 1].forEach(sd => { const pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 1.6), new THREE.MeshLambertMaterial({ color: col })); pole.position.set(sd * wdt / 2, .8, 0); const fl = new THREE.Mesh(new THREE.PlaneGeometry(.5, .4), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })); fl.position.set(sd * wdt / 2 + sd * .25, 1.4, 0); grp.add(pole, fl); }); grp.position.set(gx, 0, z); scene.add(grp); objs.push({ k: 'gate', x: gx, w: wdt, m: grp, z }); return; }
    if (r < .45 + c.ramp) { const m = new THREE.Mesh(new THREE.BoxGeometry(2.6, .7, 2.2), new THREE.MeshLambertMaterial({ color: '#cfe0ff' })); m.rotation.x = .3; m.position.set(rand(-6, 6), .2, z); scene.add(m); objs.push({ k: 'ramp', x: m.position.x, m, z }); return; }
    if (Math.random() < c.tree) { const tr = new THREE.Group(), top = new THREE.Mesh(new THREE.ConeGeometry(1, 2.8, 8), new THREE.MeshLambertMaterial({ color: '#0F8A45' })); top.position.y = 1.8; const cap = new THREE.Mesh(new THREE.ConeGeometry(.6, 1, 8), new THREE.MeshLambertMaterial({ color: '#fff' })); cap.position.y = 2.9; const tk = new THREE.Mesh(new THREE.CylinderGeometry(.15, .2, .8), new THREE.MeshLambertMaterial({ color: '#8B5A3C' })); tk.position.y = .4; tr.add(top, cap, tk); tr.position.set(rand(-8, 8), 0, z); scene.add(tr); objs.push({ k: 'tree', x: tr.position.x, m: tr, z }); return; }
    const sm = new THREE.Group(); [[.5, .5], [.35, 1.25], [.25, 1.8]].forEach(([r2, y]) => { const b = new THREE.Mesh(new THREE.SphereGeometry(r2, 12, 10), new THREE.MeshLambertMaterial({ color: '#fff' })); b.position.y = y; sm.add(b); }); const nose = new THREE.Mesh(new THREE.ConeGeometry(.06, .3, 6), new THREE.MeshLambertMaterial({ color: TT.orange })); nose.rotation.x = Math.PI / 2; nose.position.set(0, 1.8, .3); sm.add(nose); sm.position.set(rand(-8, 8), 0, z); scene.add(sm); objs.push({ k: 'snowman', x: sm.position.x, m: sm, z });
  }
  function reset() { objs.forEach(o => scene.remove(o.m)); objs = []; px = 0; vx = 0; dist = 0; air = 0; crash = 0; gatesHit = 0; const c = LV[L]; speed = c.sp; for (let z = -15; z > -90; z -= rand(7, 11)) spawn(z); spawnZ = -90;
    scene.background = new THREE.Color(c.night ? '#0a1030' : '#bfe3ff'); scene.fog = new THREE.Fog(c.night ? '#0a1030' : '#bfe3ff', 30, 110);
    if (snow) { scene.remove(snow); snow = null; } if (c.night) { const sg = new THREE.BufferGeometry(), sp = []; for (let i = 0; i < 600; i++) sp.push(rand(-20, 20), rand(0, 15), rand(-80, 10)); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); snow = new THREE.Points(sg, new THREE.PointsMaterial({ color: '#fff', size: .15 })); scene.add(snow); } }
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8899bb, 1));
  g.levels(5, lv => { L = lv; g.meter(LV[lv].gates); reset(); H.bubble('◀ ▶ 🏂'); });
  g.loop(dt => {
    t += dt; const st = steer || keyS, c = LV[L];
    if (crash > 0) { crash -= dt; rider.rotation.z = Math.sin(crash * 20) * .5; speed = Math.max(3, speed - dt * 20); } else { rider.rotation.z = lerp(rider.rotation.z, -st * .35, dt * 6); speed = lerp(speed, c.sp, dt * .5); }
    vx = lerp(vx, st * 9, dt * 4); px = clamp(px + vx * dt, -10, 10);
    if (air > 0) { air -= dt; airV -= 18 * dt; rider.position.y = Math.max(0, rider.position.y + airV * dt); spin = Math.max(0, spin - dt * 12); rider.rotation.y = spin; if (air <= 0) { rider.position.y = 0; rider.rotation.y = 0; if (spin > .5) { crash = .6; SFX.bump(); } else if (rider.userData.trick) { label('TRICK!'); g.star(2); SFX.chime(); } rider.userData.trick = false; } else if (spin > Math.PI) rider.userData.trick = true; }
    const dz = speed * dt; dist += dz;
    objs.forEach(o => { o.z += dz; o.m.position.z = o.z; });
    fence.forEach(f => { f.position.z += dz; if (f.position.z > 8) f.position.z -= 120; });
    slope.material.map.offset.y += dz / 32;
    if (snow) { snow.position.z = (snow.position.z + dz * .3) % 20; snow.position.y = -((t * 2) % 15); }
    objs.forEach(o => {
      if (o.done || o.z < -.5 || o.z > .6) return; o.done = true;
      if (o.k === 'gate') { if (Math.abs(px - o.x) < o.w / 2) { SFX.coin(); g.star(1); gatesHit++; if (g.progress()) g.after(500, () => g.levelUp()); } else tone(200, .1, 'triangle', .06); }
      if (o.k === 'ramp' && Math.abs(px - o.x) < 1.4 && air <= 0) { air = 1; airV = 9; sweep(300, 700, .3, 'triangle', .1); }
      if ((o.k === 'tree' || o.k === 'snowman') && Math.abs(px - o.x) < (o.k === 'tree' ? .9 : .7) && rider.position.y < 1 && crash <= 0) { crash = 1; SFX.bump(); H.mood('oops'); if (o.k === 'snowman') { scene.remove(o.m); noise(.4, .2, 'highpass', 2000); } }
    });
    objs = objs.filter(o => { if (o.z > 10) { scene.remove(o.m); return false; } return true; });
    spawnZ += dz; while (spawnZ > -100) { spawnZ -= rand(6, 10) * (L >= 4 ? .8 : 1); spawn(spawnZ); }
    rider.position.x = px; spr.material.map = castTex(PROG.buddy || 'foxy', crash > 0 ? 'oops' : air > 0 ? 'happy' : 'idle');
    cam.position.lerp(new THREE.Vector3(px * .6, 3.4 + rider.position.y * .3, 6.5), Math.min(1, dt * 4)); cam.lookAt(px * .6, .6, -8);
    V.render();
  });
});
