/* ═════════ home-screen wallpapers · 90s screensaver ═════════ */
const WALLS = [['', 'TELETEXT'], ['clouds', 'CLOUDS'], ['space', 'DEEP SPACE'], ['grid', 'CYBER GRID'], ['jungle', 'JUNGLE'], ['bubbles', 'BUBBLES'], ['checker', 'CHECKERS'], ['sunset', 'SUNSET']];
function applyWall() { document.body.dataset.wall = PROG.wall || ''; }
applyWall();
function renderWallGP() { const box = $('#gpWalls'); box.innerHTML = ''; WALLS.forEach(([id, n]) => { const b = mk('button', 'gpWall' + ((PROG.wall || '') === id ? ' on' : ''), `<span class="wallPrev" data-wall="${id}"></span><i>${n}</i>`); b.addEventListener('click', () => { PROG.wall = id; saveProg(); applyWall(); $$('.gpWall', box).forEach(x => x.classList.toggle('on', x === b)); }); box.appendChild(b); }); }

/* ═════════ SCREENSAVER — after a few quiet minutes on the home screen ═════════ */
const SAVER = { on: false, last: Date.now(), el: null, n: 0 };
function saverWake(e) { SAVER.last = Date.now(); if (SAVER.on) { stopSaver(); if (e && e.type === 'pointerdown') { e.stopPropagation(); e.preventDefault(); } } }
['pointerdown', 'keydown', 'wheel'].forEach(ev => window.addEventListener(ev, saverWake, { capture: true }));
window.addEventListener('pointermove', e => { if (Math.abs(e.movementX) + Math.abs(e.movementY) > 6) saverWake(e); }, { capture: true });
function stopSaver() { SAVER.on = false; if (SAVER.el) { cancelAnimationFrame(SAVER.raf); SAVER.el.remove(); SAVER.el = null; } }
function startSaver(mode) {
  if (SAVER.on) return; SAVER.on = true; const el = mk('div', 'saver'), cv = mk('canvas'); el.appendChild(cv); document.body.appendChild(el); SAVER.el = el;
  const x = cv.getContext('2d'), fit = () => { cv.width = innerWidth; cv.height = innerHeight; }; fit();
  mode = mode || ['logo', 'fly', 'pipes'][SAVER.n++ % 3]; let last = performance.now(), t = 0;
  const W = () => cv.width, Hh = () => cv.height, name = osTitle(), stock = isStockBrand();
  /* bouncing logo */
  const lg = { x: 50, y: 60, vx: 140, vy: 110, w: 0, h: 0, c: 0, flash: 0 };
  /* flying friends */
  const fl = Array.from({ length: 12 }, () => ({ x: rand(0, 1.4), y: rand(-.4, 1), s: rand(.6, 1.2), n: pick(CAST_IDS), ph: rand(0, 6) })), st = Array.from({ length: 160 }, () => ({ x: rand(-1, 1), y: rand(-1, 1), z: rand(.1, 1) }));
  /* pipes */
  const cell = () => Math.max(24, Math.min(W(), Hh()) / 18); let pipe = null, pipes = 0, pipeT = 0;
  const newPipe = () => { const c = cell(); pipe = { x: randi(1, (W() / c | 0) - 2), y: randi(1, (Hh() / c | 0) - 2), d: randi(0, 3), col: pick(COLORS), n: 0 }; pipes++; };
  x.fillStyle = '#000'; x.fillRect(0, 0, W(), Hh());
  const frame = now => {
    if (!SAVER.on) return; const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; if (cv.width !== innerWidth || cv.height !== innerHeight) fit();
    if (mode === 'logo') {
      x.fillStyle = '#000'; x.fillRect(0, 0, W(), Hh()); const fs = Math.max(30, Math.min(W(), Hh()) * .08); x.font = `bold ${fs}px ${PXF}`; if (stock) { lg.w = fs * 4.2; lg.h = fs * 4.4; } else { lg.w = x.measureText(name).width + fs; lg.h = fs * 1.8; }
      lg.x += lg.vx * dt; lg.y += lg.vy * dt; let hx = false, hy = false;
      if (lg.x < 0) { lg.x = 0; lg.vx = Math.abs(lg.vx); hx = true; } if (lg.x + lg.w > W()) { lg.x = W() - lg.w; lg.vx = -Math.abs(lg.vx); hx = true; }
      if (lg.y < 0) { lg.y = 0; lg.vy = Math.abs(lg.vy); hy = true; } if (lg.y + lg.h > Hh()) { lg.y = Hh() - lg.h; lg.vy = -Math.abs(lg.vy); hy = true; }
      if (hx || hy) { lg.c++; tone(300 + lg.c % 5 * 80, .05, 'square', .02); }
      const nearCorner = (lg.x < 6 || lg.x + lg.w > W() - 6) && (lg.y < 6 || lg.y + lg.h > Hh() - 6);
      if ((hx || hy) && nearCorner) { lg.flash = 2.5; secret('corner'); [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .2, 'square', .05, i * .08)); }
      lg.flash = Math.max(0, lg.flash - dt); const col = [TT.green, TT.blue, TT.red, TT.yellow, TT.pink, TT.white][lg.c % 6];
      x.fillStyle = col; x.fillRect(lg.x, lg.y, lg.w, lg.h); x.fillStyle = '#000'; x.textAlign = 'center'; x.textBaseline = 'middle';
      if (stock) { const mw = lg.w * .72, mh = mw * i2MarkDots().h / 10; i2MarkCanvas(x, lg.x + (lg.w - mw) / 2, lg.y + (lg.h - mh) / 2, mw, { c1: '#000', c2: '#000' }); } else x.fillText(name, lg.x + lg.w / 2, lg.y + lg.h / 2);
      if (lg.flash > 0) { for (let i = 0; i < 30; i++) { x.fillStyle = pick(COLORS); x.fillRect(rand(0, W()), rand(0, Hh()), 8, 8); } x.font = `bold ${fs * 1.3}px ${PXF}`; x.fillStyle = TT.yellow; x.fillText('★ CORNER! ★', W() / 2, Hh() / 2); }
    } else if (mode === 'fly') {
      x.fillStyle = '#000'; x.fillRect(0, 0, W(), Hh()); const cx = W() / 2, cy = Hh() / 2;
      st.forEach(s => { s.z -= dt * .25; if (s.z <= .05) { s.z = 1; s.x = rand(-1, 1); s.y = rand(-1, 1); } const px = cx + s.x / s.z * cx * .5, py = cy + s.y / s.z * cy * .5, sz = (1 - s.z) * 4; x.fillStyle = '#fff'; x.fillRect(px, py, sz, sz); });
      const S = Math.min(W(), Hh()) * .12;
      fl.forEach(f => { f.x -= dt * .08 * f.s; f.y += dt * .05 * f.s; if (f.x < -.2 || f.y > 1.2) { f.x = rand(1, 1.4); f.y = rand(-.5, .5); f.n = pick(CAST_IDS); } const px = f.x * W(), py = f.y * Hh(), flap = Math.sin(t * 10 + f.ph);
        x.fillStyle = '#fff'; x.fillRect(px - S * .55, py - S * .75 - flap * S * .2, S * .35, S * .15 + Math.abs(flap) * S * .2); x.fillRect(px + S * .2, py - S * .75 - flap * S * .2, S * .35, S * .15 + Math.abs(flap) * S * .2); drawSprite(x, f.n, 'happy', px, py, S * f.s * .8); });
    } else {
      const c = cell(); if (!pipe) newPipe(); pipeT += dt;
      while (pipeT > .03) { pipeT -= .03; const [dx, dy] = [[1, 0], [0, 1], [-1, 0], [0, -1]][pipe.d], nx = pipe.x + dx, ny = pipe.y + dy, x0 = pipe.x * c + c / 2, y0 = pipe.y * c + c / 2;
        x.strokeStyle = pipe.col; x.lineWidth = c * .45; x.lineCap = 'round'; x.beginPath(); x.moveTo(x0, y0); x.lineTo(nx * c + c / 2, ny * c + c / 2); x.stroke(); x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = c * .1; x.beginPath(); x.moveTo(x0 - c * .08, y0 - c * .08); x.lineTo(nx * c + c / 2 - c * .08, ny * c + c / 2 - c * .08); x.stroke();
        pipe.x = nx; pipe.y = ny; pipe.n++; if (Math.random() < .2) { pipe.d = (pipe.d + pick([1, 3])) % 4; x.fillStyle = pipe.col; x.beginPath(); x.arc(nx * c + c / 2, ny * c + c / 2, c * .32, 0, 7); x.fill(); }
        if (pipe.x < 1 || pipe.y < 1 || pipe.x > W() / c - 2 || pipe.y > Hh() / c - 2 || pipe.n > 60) { newPipe(); if (pipes > 14) { pipes = 0; x.fillStyle = '#000'; x.fillRect(0, 0, W(), Hh()); } } }
    }
    SAVER.raf = requestAnimationFrame(frame);
  };
  SAVER.raf = requestAnimationFrame(frame);
}
setInterval(() => {
  const min = cfg.saver ?? 3; if (SAVER.on || !min || typeof view === 'undefined' || view !== 'desk' || $('#boot') || document.visibilityState !== 'visible') return;
  if ($('#lock').classList.contains('show') || $('#gp').classList.contains('show') || $('#startMenu').classList.contains('show') || $('#pack').classList.contains('show') || $('#gate.show')) return;
  if (Date.now() - SAVER.last > min * 60000) startSaver();
}, 4000);
function renderSaverGP() { $$('#gpSaver button').forEach(b => b.classList.toggle('on', +b.dataset.v === (cfg.saver ?? 3))); }
$$('#gpSaver button').forEach(b => b.addEventListener('click', () => { cfg.saver = +b.dataset.v; saveCfg(); renderSaverGP(); }));
$('#gpSaverTry').addEventListener('click', () => { $('#gp').classList.remove('show'); setTimeout(() => startSaver(), 300); });
