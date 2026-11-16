/* ═════════ GAME REGISTRY ═════════ */
const GAMES = [], GBY = {};
function game(id, cat, icon, init) { const gm = { id, cat, icon, init }; GAMES.push(gm); GBY[id] = gm; }
const FX = (C, x, y) => { const r = C.cv.getBoundingClientRect(); return [r.left + x, r.top + y]; };

/* ═════════ PLAY ═════════ */

/* RUN — Dino runs through three worlds; stars fill the meter */
game('runner', 'play', '🦖', g => {
  const H = g.host('dino'), C = g.canvas(), P = new Particles();
  const LV = [
    { speed: .30, goal: 12, grav: 4, sky: ['#2c4fe0', '#9cc8ff'], grass: TT.green, dirt: '#5a3a1e', far: '#3d5bd6', obs: ['crate', 'cone'], gap: [1.9, 3] },
    { speed: .36, goal: 15, grav: 4, sky: ['#000', '#16246a'], grass: TT.green, dirt: '#3a2614', far: '#0d1748', obs: ['crate', 'cone', 'crate2'], gap: [1.5, 2.6] },
    { speed: .42, goal: 18, grav: 2.7, sky: ['#000', '#2a0f4a'], grass: '#bdbdb5', dirt: '#55554f', far: '#1b1030', obs: ['rock', 'crate', 'rock2'], gap: [1.3, 2.3] }];
  let V, t = 0, dist = 0, nextObs = 2, nextStar = .6, obs = [], stars = [];
  const R = { y: 0, vy: 0, jumps: 0, hurt: 0 };
  const far = Array.from({ length: 26 }, (_, i) => ({ x: i / 26 * 1.6, w: rand(.035, .07), h: rand(.16, .42) }));
  const start = lv => { V = LV[lv - 1]; obs = []; stars = []; nextObs = 2; g.meter(V.goal); H.bubble('👆 ⤴'); };
  g.levels(3, start);
  const jump = () => { if (R.jumps < 2) { R.vy = -C.h * (R.jumps ? 1.25 : 1.5) * Math.sqrt(V.grav / 4); R.jumps++; SFX.jump(); } };
  g.on(C.cv, 'pointerdown', jump);
  g.key = e => { if (e.key === ' ' || e.key === 'ArrowUp' || e.key.length === 1) { e.preventDefault(); jump(); } };
  function obstacle(ctx, o, ground, s) {
    if (o.k === 'cone') { const cw = s * .5, ch = s * .55; ctx.fillStyle = TT.orange; ctx.beginPath(); ctx.moveTo(o.x, ground - ch); ctx.lineTo(o.x + cw / 2, ground); ctx.lineTo(o.x - cw / 2, ground); ctx.fill(); ctx.fillStyle = TT.white; ctx.fillRect(o.x - cw * .28, ground - ch * .5, cw * .56, ch * .14); }
    else if (o.k.startsWith('rock')) { const n = o.k === 'rock2' ? 2 : 1, b = s * .5; ctx.fillStyle = '#7a6f8a'; for (let i = 0; i < n; i++) { ctx.fillRect(o.x - b * .5 + i * b * .3, ground - b * (i + 1) * .8, b, b * .8); } ctx.fillStyle = '#5a4f6a'; ctx.fillRect(o.x - b * .2, ground - b * .55, b * .25, b * .2); }
    else { const n = o.k === 'crate2' ? 2 : 1, b = s * .46; for (let i = 0; i < n; i++) { const y = ground - b * (i + 1); ctx.fillStyle = '#b5773b'; ctx.fillRect(o.x - b / 2, y, b, b); ctx.strokeStyle = '#6e4420'; ctx.lineWidth = b * .1; ctx.strokeRect(o.x - b / 2 + b * .05, y + b * .05, b * .9, b * .9); ctx.beginPath(); ctx.moveTo(o.x - b * .4, y + b * .1); ctx.lineTo(o.x + b * .4, y + b * .9); ctx.stroke(); } }
  }
  g.loop(dt => {
    if (g.paused()) return;
    const w = C.w, h = C.h, ctx = C.ctx, ground = h * .8, s = h * .17, rx = w * .22;
    t += dt; const speed = w * V.speed * (R.hurt > 0 ? .5 : 1); dist += speed * dt;
    R.vy += h * V.grav * dt; R.y += R.vy * dt;
    if (R.y > 0) { if (R.vy > h * .6) P.burst(rx, ground, V.dirt, 6, h * .25, { life: .35, up: h * .2 }); R.y = 0; R.vy = 0; R.jumps = 0; }
    R.hurt = Math.max(0, R.hurt - dt);
    if ((nextObs -= dt) <= 0) { obs.push({ x: w + s, k: pick(V.obs), hit: false }); nextObs = rand(...V.gap); }
    if ((nextStar -= dt) <= 0) { const n = randi(2, 5), hy = pick([0, .55, 1.1]); for (let i = 0; i < n; i++) stars.push({ x: w + s * 2 + i * s * .8, y: hy }); nextStar = rand(1.3, 2.3); }
    obs.forEach(o => o.x -= speed * dt); stars.forEach(o => o.x -= speed * dt);
    const foot = ground + R.y, mid = foot - s * .5;
    for (const o of obs) { const oh = /2/.test(o.k) ? s * .9 : s * .5; if (!o.hit && Math.abs(o.x - rx) < s * .42 && foot > ground - oh + s * .06) { o.hit = true; R.hurt = .7; SFX.bump(); H.mood('oops'); P.burst(o.x, ground - oh, [TT.orange, TT.white], 14, h * .7); } }
    for (const o of stars) { const sy = ground - s * .6 - o.y * s; if (!o.got && Math.abs(o.x - rx) < s * .5 && Math.abs(sy - mid) < s * .75) { o.got = true; SFX.coin(); P.burst(o.x, sy, [TT.yellow, TT.white], 12, h * .5, { g: 200 }); g.star(1, ...FX(C, o.x, sy)); if (g.progress()) g.levelUp(); } }
    obs = obs.filter(o => o.x > -s * 2); stars = stars.filter(o => !o.got && o.x > -s);
    P.update(dt);
    const sky = ctx.createLinearGradient(0, 0, 0, ground); sky.addColorStop(0, V.sky[0]); sky.addColorStop(1, V.sky[1]); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    const lv = g.lvl();
    if (lv === 1) { ctx.fillStyle = TT.yellow; ctx.fillRect(w * .8, h * .08, h * .12, h * .12); for (let i = 0; i < 5; i++) { const cx = ((i * .3 * w - dist * .05) % (w * 1.5) + w * 1.5) % (w * 1.5) - w * .2; ctx.fillStyle = '#fff'; ctx.fillRect(cx, h * (.1 + i % 2 * .08), h * .2, h * .05); } }
    else if (lv === 2) { ctx.fillStyle = TT.white; ctx.fillRect(w * .78, h * .1, h * .12, h * .12); }
    else { ctx.fillStyle = TT.blue; ctx.beginPath(); ctx.arc(w * .8, h * .18, h * .09, 0, 7); ctx.fill(); ctx.fillStyle = TT.green; ctx.fillRect(w * .8 - h * .04, h * .14, h * .05, h * .04); for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect((i * 97 % 100) / 100 * w, (i * 41 % 60) / 100 * h, 2, 2); } }
    const span = w * 1.6;
    for (const b of far) {
      const bx = ((b.x * w - dist * .12) % span + span) % span - w * .1, bh = b.h * h * (lv === 2 ? 1 : .55), bw = b.w * w;
      ctx.fillStyle = V.far;
      if (lv === 2) { ctx.fillRect(bx, ground - bh, bw, bh); ctx.fillStyle = 'rgba(255,214,10,.6)'; for (let yy = ground - bh + h * .025; yy < ground - h * .04; yy += h * .045) for (let xx = bx + bw * .15; xx < bx + bw * .8; xx += bw * .33) if (((xx * 3 + yy * 7) | 0) % 3 === 0) ctx.fillRect(xx, yy, bw * .15, h * .014); }
      else { ctx.beginPath(); ctx.moveTo(bx - bw, ground); ctx.lineTo(bx + bw * .5, ground - bh); ctx.lineTo(bx + bw * 2, ground); ctx.fill(); }
    }
    ctx.fillStyle = V.grass; ctx.fillRect(0, ground, w, h * .03); ctx.fillStyle = V.dirt; ctx.fillRect(0, ground + h * .03, w, h);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; const tile = h * .08; for (let x = -(dist % (tile * 2)); x < w; x += tile * 2) ctx.fillRect(x, ground + h * .08, tile, h * .03);
    for (const o of stars) { const sy = ground - s * .6 - o.y * s; ctx.save(); ctx.translate(o.x, sy); ctx.scale(Math.max(.15, Math.abs(Math.cos(t * 3 + o.x * .01))), 1); starPath(ctx, 0, 0, s * .26); ctx.fillStyle = TT.yellow; ctx.fill(); ctx.restore(); }
    for (const o of obs) obstacle(ctx, o, ground, s);
    if (!(R.hurt > 0 && ((t * 14) | 0) % 2)) drawSprite(ctx, 'dino', R.hurt > 0 ? 'oops' : R.y < 0 ? 'happy' : ((t * 9) | 0) % 2 ? 'run1' : 'run2', rx, foot + s * .02, s * 1.1, { rot: R.y < 0 ? -.12 : 0 });
    P.draw(ctx);
  });
});

/* ROCKET — Foxy flies: stars, then number rings, then letter rings */
game('rocket', 'play', '🚀', g => {
  const H = g.host('foxy'), C = g.canvas(), P = new Particles();
  let ry = .5, ty = .5, t = 0, items = [], next = .4, spin = 0, target = null;
  const field = Array.from({ length: 150 }, () => ({ x: Math.random(), y: Math.random(), z: rand(.15, 1) }));
  const LETTERS = 'ABCDEFGHIJKLMNOPRSTUW';
  let planet = { x: 1.3, y: .3, r: .22, c: TT.purple, ring: true };
  const pool = () => g.lvl() === 2 ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : LETTERS.split('');
  const ask = () => { if (g.lvl() === 1) return; target = pick(pool()); g.lvl() === 2 ? H.say(L[lang].findNum(target), 'talk', lang, 0, CARD.num(target)) : H.say(`Find the letter ${target}!`, 'talk', 'en', 0, CARD.letter(target)); };
  const start = lv => { items = []; g.meter(lv === 1 ? 15 : 6); target = null; if (lv > 1) g.after(600, ask); else H.bubble('👆 ↕'); };
  g.levels(3, start);
  const setY = e => { ty = clamp(C.pos(e).y / C.h, .08, .92); };
  g.on(C.cv, 'pointerdown', setY); g.on(C.cv, 'pointermove', e => { if (e.buttons || e.pointerType === 'mouse') setY(e); });
  g.key = e => { if (e.key === 'ArrowUp') ty = clamp(ty - .12, .08, .92); if (e.key === 'ArrowDown') ty = clamp(ty + .12, .08, .92); };
  g.loop(dt => {
    if (g.paused()) return;
    const w = C.w, h = C.h, ctx = C.ctx, s = h * .085, rx = w * .22, speed = w * .28, lv = g.lvl();
    t += dt; const prev = ry; ry += (ty - ry) * Math.min(1, dt * 4.5); const vy = (ry - prev) / Math.max(dt, .001);
    spin = Math.max(0, spin - dt * 1.6);
    if ((next -= dt) <= 0) {
      if (lv === 1) { const k = pick(['stars', 'stars', 'rock']), y0 = rand(.15, .85); if (k === 'stars') for (let i = 0; i < 6; i++) items.push({ k: 'star', x: w + s + i * s * 1.1, y: clamp(y0 + Math.sin(i * .9) * .12, .1, .9) }); else items.push({ k: 'rock', x: w + s * 2, y: y0, r: rand(.6, 1.1), rot: 0 }); next = rand(1.1, 2); }
      else if (target != null) { const ys = shuffle([.22, .5, .78]), labs = shuffle([target, ...shuffle(pool().filter(x => x !== target)).slice(0, 2)]); labs.forEach((lab, i) => items.push({ k: 'ring', x: w + s * 2 + i * s * .2, y: ys[i], lab })); next = 3.6; }
      else next = .5;
    }
    const ryp = ry * h;
    for (const it of items) {
      it.x -= speed * dt; const iy = it.y * h;
      if (it.k === 'star' && !it.got && Math.hypot(it.x - rx, iy - ryp) < s * 1.1) { it.got = true; SFX.coin(); P.burst(it.x, iy, [TT.yellow, TT.white], 10, h * .4, { g: 0 }); g.star(1, ...FX(C, it.x, iy)); if (g.progress()) g.levelUp(); }
      if (it.k === 'ring' && !it.done && Math.abs(it.x - rx) < s * .4 && Math.abs(iy - ryp) < h * .12) {
        it.done = true;
        if (it.lab === target) { SFX.chime(); P.burst(it.x, iy, COLORS, 30, h * .6, { g: 0 }); g.star(1, ...FX(C, it.x, iy)); H.happy(); items.filter(x => x.k === 'ring').forEach(x => x.done = true); target = null; if (g.progress()) g.levelUp(); else g.after(900, ask); }
        else { H.mood('oops'); SFX.bad(); typeof it.lab === 'number' ? say(numWord(it.lab)) : say(it.lab, 'en'); }
      }
      if (it.k === 'rock' && !it.hit && Math.hypot(it.x - rx, iy - ryp) < s * (.8 + it.r * .6)) { it.hit = true; spin = 1; SFX.bump(); H.mood('oops'); P.burst(it.x, iy, ['#8a8a8a', TT.white], 18, h * .6, { g: 0 }); }
      if (it.k === 'rock') it.rot += dt;
    }
    if (lv > 1 && target != null && items.filter(x => x.k === 'ring' && x.x > -s).length === 0) next = Math.min(next, .3);
    items = items.filter(it => it.x > -s * 3 && !it.got && !it.hit);
    P.a.push({ x: rx - s * 1.3, y: ryp + rand(-s * .15, s * .15), vx: -speed * rand(.6, 1), vy: rand(-30, 30), life: .4, max: .4, color: pick([TT.yellow, TT.orange, TT.red]), size: rand(4, 9), g: 0, drag: 1 });
    P.update(dt);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    for (const f of field) { f.x -= dt * .12 * f.z; if (f.x < 0) f.x += 1; ctx.fillStyle = `rgba(242,242,238,${f.z})`; const ss = f.z * 3; ctx.fillRect(f.x * w, f.y * h, ss * (1 + f.z * 2), ss); }
    planet.x -= dt * .015; if (planet.x < -.4) planet = { x: 1.4, y: rand(.2, .8), r: rand(.12, .28), c: pick([TT.purple, TT.red, TT.blue, TT.orange, TT.teal]), ring: Math.random() < .5 };
    const px = planet.x * w, py = planet.y * h, pr = planet.r * h;
    ctx.fillStyle = planet.c; ctx.beginPath(); ctx.arc(px, py, pr, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.arc(px + pr * .35, py + pr * .2, pr * .9, 0, 7); ctx.fill();
    if (planet.ring) { ctx.strokeStyle = 'rgba(242,242,238,.7)'; ctx.lineWidth = pr * .12; ctx.beginPath(); ctx.ellipse(px, py, pr * 1.7, pr * .35, -.3, 0, 7); ctx.stroke(); }
    for (const it of items) {
      const iy = it.y * h;
      if (it.k === 'star') { starPath(ctx, it.x, iy, s * .42, t * 2); ctx.fillStyle = TT.yellow; ctx.fill(); }
      else if (it.k === 'ring') { ctx.lineWidth = s * .28; ctx.strokeStyle = it.done ? '#333' : [TT.green, TT.blue, TT.red, TT.yellow][String(it.lab).charCodeAt(0) % 4]; ctx.beginPath(); ctx.ellipse(it.x, iy, s * .6, h * .12, 0, 0, 7); ctx.stroke(); ctx.fillStyle = it.done ? '#333' : TT.white; ctx.font = `700 ${h * .1}px ${PXF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(it.lab, it.x + s * 1.3, iy); }
      else { ctx.save(); ctx.translate(it.x, iy); ctx.rotate(it.rot); const rr = s * it.r; ctx.fillStyle = '#6f6a66'; ctx.fillRect(-rr, -rr * .8, rr * 2, rr * 1.6); ctx.fillRect(-rr * .7, -rr, rr * 1.4, rr * 2); ctx.restore(); }
    }
    P.draw(ctx);
    ctx.save(); ctx.translate(rx, ryp); ctx.rotate(clamp(vy / h * .4, -.5, .5) + spin * Math.PI * 2);
    const L_ = s * 2.6, H_ = s * 1.05;
    ctx.fillStyle = TT.red; ctx.beginPath(); ctx.moveTo(-L_ * .45, -H_ * .5); ctx.lineTo(-L_ * .7, -H_ * 1.1); ctx.lineTo(-L_ * .2, -H_ * .5); ctx.fill(); ctx.beginPath(); ctx.moveTo(-L_ * .45, H_ * .5); ctx.lineTo(-L_ * .7, H_ * 1.1); ctx.lineTo(-L_ * .2, H_ * .5); ctx.fill();
    ctx.fillStyle = TT.white; ctx.fillRect(-L_ * .5, -H_ * .5, L_ * .75, H_);
    ctx.fillStyle = TT.red; ctx.beginPath(); ctx.moveTo(L_ * .25, -H_ * .5); ctx.lineTo(L_ * .55, 0); ctx.lineTo(L_ * .25, H_ * .5); ctx.fill();
    ctx.fillStyle = '#9fd3ff'; ctx.fillRect(-L_ * .1, -H_ * .42, H_ * .84, H_ * .84);
    drawSprite(ctx, 'foxy', spin > 0 ? 'oops' : 'idle', -L_ * .1 + H_ * .42, H_ * .4, H_ * .8);
    const fl = 1 + Math.sin(t * 40) * .25; ctx.fillStyle = TT.yellow; ctx.beginPath(); ctx.moveTo(-L_ * .5, -H_ * .3); ctx.lineTo(-L_ * .5 - s * .9 * fl, 0); ctx.lineTo(-L_ * .5, H_ * .3); ctx.fill();
    ctx.restore();
  });
});

/* TRUCKS — Robo drives to the finish flag; three tracks */
game('trucks', 'play', '🚚', g => {
  const H = g.host('robo'), C = g.canvas(), P = new Particles();
  const LV = [{ amp: .55, dist: 14 }, { amp: 1, dist: 22 }, { amp: 1.25, dist: 28, night: true }];
  let V, wx = 0, v = 0, gas = false, t = 0, wheelRot = 0, starsList = [], nextStarX = 1.5, finished = false;
  const ter = X => .66 + (Math.sin(X * 1.6) * .085 + Math.sin(X * 4.3 + 1.3) * .04 + Math.sin(X * 10 + .5) * .01) * V.amp - (X < 1 ? 0 : 0);
  const hash = k => { const x = Math.sin(k * 127.1) * 43758.5453; return x - Math.floor(x); };
  const start = lv => { V = LV[lv - 1]; wx = 0; v = 0; starsList = []; nextStarX = 1.5; finished = false; g.meter(10); H.bubble('👆 ▶ 🏁'); };
  g.levels(3, start);
  const honk = mk('button', 'ovbtn honk', '📯'), go = mk('button', 'ovbtn gobtn', '▶'); g.stage.append(honk, go);
  g.on(honk, 'pointerdown', e => { e.stopPropagation(); SFX.honk(); H.mood('happy', 600); });
  const press = on => e => { if (e.target === honk) return; gas = on; };
  g.on(C.cv, 'pointerdown', press(true)); g.on(go, 'pointerdown', press(true));
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => { g.on(C.cv, ev, press(false)); g.on(go, ev, press(false)); });
  g.key = e => { if (e.key === 'h' || e.key === 'H') SFX.honk(); };
  const down = new Set(); g.on(document, 'keydown', e => down.add(e.key)); g.on(document, 'keyup', e => down.delete(e.key));
  audio(); let eng = null;
  if (AC) { const o = AC.createOscillator(), f = AC.createBiquadFilter(), gn = AC.createGain(); o.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 260; gn.gain.value = .03; o.connect(f); f.connect(gn); gn.connect(MASTER); o.start(); eng = { o }; g.dispose(() => { try { o.stop(); } catch (e) {} }); }
  g.loop(dt => {
    const w = C.w, h = C.h, ctx = C.ctx; t += dt;
    const fwd = !finished && !g.paused() && (gas || down.has('ArrowRight') || down.has(' ')), back = down.has('ArrowLeft');
    const slope = (ter(wx + .01) - ter(wx - .01)) / .02;
    v += ((fwd ? 1.15 : 0) - (back ? .8 : 0) + slope * 1.1) * dt; if (!fwd && !back) v *= Math.exp(-(finished ? 3 : .9) * dt);
    v = clamp(v, -.5, 1.2); wx += v * dt; if (wx < 0) { wx = 0; v = Math.max(0, v); }
    wheelRot += v * dt / .07;
    if (eng) eng.o.frequency.setTargetAtTime(48 + Math.abs(v) * 70 + (fwd ? 18 : 0), AC.currentTime, .1);
    g.meterSet(Math.min(1, wx / V.dist));
    if (!finished && wx >= V.dist) { finished = true; SFX.chime(); P.burst((V.dist - wx + .32 * w / h) * h, ter(V.dist) * h - h * .2, COLORS, 50, h * .8); g.star(3); g.after(1200, () => g.levelUp()); }
    while (nextStarX < wx + 3 && nextStarX < V.dist - .5) { starsList.push({ X: nextStarX }); nextStarX += rand(.8, 1.6); }
    const L2_ = .17, yL = ter(wx - L2_), yR = ter(wx + L2_), ang = Math.atan2((yR - yL) * h, 2 * L2_ * h);
    const camX = wx - .32 * w / h, sx = X => (X - camX) * h;
    for (const st of starsList) if (!st.got && Math.abs(st.X - wx) < .14) { st.got = true; SFX.coin(); const y = (ter(st.X) - .2) * h; P.burst(sx(st.X), y, [TT.yellow, TT.white], 12, h * .4, { g: 200 }); g.star(1, ...FX(C, sx(st.X), y)); }
    starsList = starsList.filter(st => !st.got && st.X > camX - .5);
    if (fwd && v > .15 && Math.random() < .6) P.burst(sx(wx - L2_), ter(wx - L2_) * h, ['#7a5530', '#a87a4a'], 1, h * .25, { ang: Math.PI * 1.15, spread: .4, life: .5 });
    P.update(dt);
    const sky = ctx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, V.night ? '#000' : '#2c4fe0'); sky.addColorStop(1, V.night ? '#14204f' : '#9cc8ff'); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    if (V.night) { ctx.fillStyle = TT.white; ctx.fillRect(w * .8, h * .08, h * .11, h * .11); for (let i = 0; i < 50; i++) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect((i * 97 % 100) / 100 * w, (i * 37 % 50) / 100 * h, 2, 2); } }
    else { ctx.fillStyle = TT.yellow; ctx.fillRect(w * .8, h * .08, h * .13, h * .13); for (let i = 0; i < 6; i++) { const cx = ((i * .37 * w - camX * h * .1) % (w * 1.4) + w * 1.4) % (w * 1.4) - w * .2, cy = h * (.1 + (i % 3) * .07); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(cx, cy, h * .2, h * .05); ctx.fillRect(cx + h * .04, cy - h * .03, h * .11, h * .04); } }
    ctx.fillStyle = V.night ? '#1b2457' : '#5868c8'; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w; x += 8) { const X = x / h + camX * .3; ctx.lineTo(x, h * (.5 + Math.sin(X * 2.3) * .07 + Math.sin(X * 5.1) * .03)); } ctx.lineTo(w, h); ctx.fill();
    for (let k = Math.floor(camX / .55) - 1; k < Math.floor((camX + w / h) / .55) + 2; k++) { if (hash(k) < .45) continue; const X = k * .55 + hash(k + 9) * .3, x = sx(X), y = ter(X) * h, th = h * (.12 + hash(k + 3) * .08); ctx.fillStyle = '#5a3a1e'; ctx.fillRect(x - h * .012, y - th * .4, h * .024, th * .4); ctx.fillStyle = V.night ? '#0b4a24' : '#14833f'; ctx.beginPath(); ctx.moveTo(x, y - th); ctx.lineTo(x + th * .3, y - th * .3); ctx.lineTo(x - th * .3, y - th * .3); ctx.fill(); }
    ctx.fillStyle = V.night ? '#2a1b0e' : '#4a2f18'; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 6; x += 6) ctx.lineTo(x, ter(camX + x / h) * h); ctx.lineTo(w, h); ctx.fill();
    ctx.strokeStyle = V.night ? '#0f8a45' : TT.green; ctx.lineWidth = h * .025; ctx.beginPath(); for (let x = 0; x <= w + 6; x += 6) ctx.lineTo(x, ter(camX + x / h) * h + h * .01); ctx.stroke();
    { const fx = sx(V.dist), fy = ter(V.dist) * h; ctx.fillStyle = TT.white; ctx.fillRect(fx, fy - h * .3, h * .012, h * .3); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { ctx.fillStyle = (r + c) % 2 ? '#000' : TT.white; ctx.fillRect(fx + h * .012 + c * h * .03, fy - h * .3 + r * h * .03, h * .03, h * .03); } }
    for (const st of starsList) { const x = sx(st.X), y = (ter(st.X) - .2) * h; ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(.15, Math.abs(Math.cos(t * 3 + st.X))), 1); starPath(ctx, 0, 0, h * .04); ctx.fillStyle = TT.yellow; ctx.fill(); ctx.restore(); }
    const r = h * .07, cx = sx(wx), cy = (yL + yR) / 2 * h - r;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    const bw = 2 * L2_ * h + r * 1.6;
    if (V.night) { ctx.fillStyle = 'rgba(255,214,10,.18)'; ctx.beginPath(); ctx.moveTo(bw * .5, -r * 1.3); ctx.lineTo(bw * 2.4, -r * 3); ctx.lineTo(bw * 2.4, r * 1.5); ctx.fill(); }
    ctx.fillStyle = TT.blue; ctx.fillRect(-bw / 2, -r * 2.3, bw * .58, r * 1.7); ctx.fillStyle = '#2643C8'; ctx.fillRect(-bw / 2, -r * 2.3, bw * .58, r * .3);
    ctx.fillStyle = TT.red; ctx.fillRect(bw * .08, -r * 3.1, bw * .42, r * 2.5); ctx.fillStyle = '#9fd3ff'; ctx.fillRect(bw * .18, -r * 2.9, bw * .3, r * 1.2);
    drawSprite(ctx, 'robo', finished ? 'happy' : fwd ? 'talk' : 'idle', bw * .33, -r * 1.65, r * 1.4);
    ctx.fillStyle = TT.yellow; ctx.fillRect(bw * .46, -r * 1.5, r * .3, r * .4);
    ctx.restore();
    for (const sg of [-1, 1]) { const X = wx + sg * L2_, x = sx(X), y = ter(X) * h - r; ctx.save(); ctx.translate(x, y); ctx.rotate(wheelRot); ctx.fillStyle = '#151515'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.fillStyle = '#9a9a9a'; ctx.fillRect(-r * .45, -r * .12, r * .9, r * .24); ctx.fillRect(-r * .12, -r * .45, r * .24, r * .9); ctx.restore(); }
    P.draw(ctx);
  });
});

/* FISHING — Hoot: any fish → the color I say → the number I say */
game('fishing', 'play', '🎣', g => {
  const H = g.host('hoot'), C = g.canvas(), P = new Particles();
  let t = 0, fish = [], hook = null, target = null;
  const weeds = Array.from({ length: 14 }, () => ({ x: Math.random(), h: rand(.08, .2), p: Math.random() * 6 }));
  const W = () => C.h * .24;
  const spawn = anywhere => { const dir = Math.random() < .5 ? 1 : -1, lv = g.lvl(); let ci = randi(0, 6), n = randi(1, 9); if (target != null && Math.random() < .35) { if (lv === 2) ci = target; if (lv === 3) n = target; } fish.push({ x: anywhere ? rand(.1, .9) * C.w : (dir > 0 ? -80 : C.w + 80), y: rand(W() + C.h * .14, C.h * .86), dir, sp: rand(.05, .11) * C.w, ci, n, s: rand(.055, .08) * C.h, ph: Math.random() * 6 }); };
  const ask = () => { const lv = g.lvl(); if (lv === 2) { target = randi(0, 6); H.say(L[lang].catchColor(T().colors[target]), 'talk', lang, 0, CARD.color(target, '🐟')); } else if (lv === 3) { target = randi(1, 9); H.say(L[lang].findNum(target), 'talk', lang, 0, CARD.num(target, '🐟')); } else target = null; };
  const start = lv => { fish = []; for (let i = 0; i < 7; i++) spawn(true); g.meter(lv === 1 ? 8 : 6); if (lv > 1) g.after(500, ask); else H.bubble('👆 🐟'); };
  g.levels(3, start);
  const right = f => g.lvl() === 1 || (g.lvl() === 2 ? f.ci === target : f.n === target);
  const catchFish = f => { hook = { f, t: 0, x0: f.x, y0: f.y }; f.hooked = true; SFX.boing(); };
  g.on(C.cv, 'pointerdown', e => {
    if (hook || g.paused()) return; const p = C.pos(e); let best = null, bd = 1e9;
    for (const f of fish) { const d = Math.hypot(f.x - p.x, f.y - p.y); if (!f.hooked && d < f.s * 1.8 && d < bd) { bd = d; best = f; } }
    if (best) catchFish(best); else if (p.y > W()) { P.burst(p.x, p.y, 'rgba(255,255,255,.7)', 8, C.h * .15, { g: -250, life: .7 }); SFX.pop(1.4); }
  });
  function drawFish(ctx, f) {
    const s = f.s, wag = Math.sin(t * 9 + f.ph) * .35;
    ctx.save(); ctx.translate(f.x, f.y); ctx.scale(f.dir, 1); if (f.hooked) ctx.rotate(-1.2 + Math.sin(t * 20) * .2);
    ctx.fillStyle = COLORS[f.ci]; ctx.beginPath(); ctx.moveTo(-s * .9, 0); ctx.lineTo(-s * 1.6, -s * .55 + wag * s * .3); ctx.lineTo(-s * 1.6, s * .55 + wag * s * .3); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, s * 1.05, s * .62, 0, 0, 7); ctx.fill();
    ctx.fillStyle = TT.white; ctx.beginPath(); ctx.arc(s * .5, -s * .12, s * .2, 0, 7); ctx.fill(); ctx.fillStyle = '#000'; ctx.fillRect(s * .52, -s * .18, s * .12, s * .12);
    if (g.lvl() === 3) { ctx.scale(f.dir, 1); ctx.fillStyle = '#000'; ctx.font = `700 ${s * .9}px ${PXF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.n, f.dir * -s * .15, s * .05); }
    ctx.restore();
  }
  g.loop(dt => {
    const w = C.w, h = C.h, ctx = C.ctx, wl = W(); t += dt;
    const boatX = w * .5, tipX = boatX + h * .2, tipY = wl - h * .16;
    for (const f of fish) if (!f.hooked) { f.x += f.dir * f.sp * dt; f.y += Math.sin(t * 1.5 + f.ph) * h * .02 * dt; }
    fish = fish.filter(f => f.hooked || (f.x > -120 && f.x < w + 120)); while (fish.length < 7) spawn(false);
    if (hook) {
      hook.t += dt; const f = hook.f;
      if (hook.t > .3) { const k = Math.min(1, (hook.t - .3) / .9), e = k * k * (3 - 2 * k); f.x = lerp(hook.x0, tipX, e); f.y = lerp(hook.y0, tipY + h * .05, e); }
      if (hook.t > 1.35) {
        const ok = right(f); fish = fish.filter(x => x !== f); hook = null;
        if (ok) { P.burst(boatX - h * .08, wl - h * .06, [COLORS[f.ci], TT.white], 18, h * .5); SFX.good(); H.happy(); g.star(1, ...FX(C, boatX, wl)); if (g.lvl() === 1) say(cap(T().colors[f.ci]) + '!'); if (g.progress()) g.levelUp(); else if (g.lvl() > 1) g.after(1300, ask); }
        else { H.mood('oops'); SFX.bad(); say(g.lvl() === 2 ? cap(T().colors[f.ci]) + '?' : numWord(f.n) + '?'); P.burst(tipX, wl, 'rgba(255,255,255,.7)', 10, h * .3, { g: 300 }); }
      }
    }
    P.update(dt);
    const sky = ctx.createLinearGradient(0, 0, 0, wl); sky.addColorStop(0, TT.blue); sky.addColorStop(1, '#8fb8ff'); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, wl);
    ctx.fillStyle = TT.yellow; ctx.fillRect(w * .1, h * .05, h * .1, h * .1);
    const sea = ctx.createLinearGradient(0, wl, 0, h); sea.addColorStop(0, '#1a4fd6'); sea.addColorStop(1, '#020a2c'); ctx.fillStyle = sea; ctx.fillRect(0, wl, w, h - wl);
    ctx.fillStyle = '#c9a25a'; ctx.fillRect(0, h * .94, w, h * .06);
    for (const wd of weeds) { ctx.strokeStyle = '#1aa860'; ctx.lineWidth = h * .018; ctx.beginPath(); const bx = wd.x * w; ctx.moveTo(bx, h * .95); for (let k = 1; k <= 6; k++) ctx.lineTo(bx + Math.sin(t * 1.5 + wd.p + k * .6) * h * .015, h * .95 - wd.h * h * k / 6); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,.25)'; for (let x = 0; x < w; x += h * .08) ctx.fillRect(x + Math.sin(t * 2 + x) * 4, wl - 2, h * .04, 3);
    for (const f of fish) drawFish(ctx, f);
    P.draw(ctx);
    const by = wl + Math.sin(t * 2) * 3;
    ctx.fillStyle = '#7a4a22'; ctx.beginPath(); ctx.moveTo(boatX - h * .2, by - h * .05); ctx.lineTo(boatX + h * .2, by - h * .05); ctx.lineTo(boatX + h * .15, by + h * .03); ctx.lineTo(boatX - h * .15, by + h * .03); ctx.fill();
    ctx.fillStyle = TT.red; ctx.fillRect(boatX - h * .2, by - h * .06, h * .4, h * .015);
    drawSprite(ctx, 'hoot', hook ? 'happy' : 'idle', boatX - h * .03, by - h * .045, h * .17);
    ctx.strokeStyle = '#222'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(boatX + h * .04, by - h * .09); ctx.lineTo(tipX, tipY); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tipX, tipY);
    if (hook) { const f = hook.f, k = Math.min(1, hook.t / .3); if (hook.t <= .3) ctx.lineTo(lerp(tipX, hook.x0, k), lerp(tipY, hook.y0, k)); else ctx.lineTo(f.x, f.y); } else ctx.lineTo(tipX, wl + h * .05);
    ctx.stroke();
  });
});

/* FIREWORKS — a toy: pick the color and the shape, tap the sky */
game('fireworks', 'play', '🎆', g => {
  const H = g.host('foxy'), C = g.canvas(), P = new Particles();
  let shells = [], idle = 0, auto = 0, color = null, shape = 'burst';
  const sky = Array.from({ length: 26 }, () => ({ x: Math.random(), w: rand(.025, .05), h: rand(.06, .22) }));
  C.onResize = () => { C.ctx.fillStyle = '#000'; C.ctx.fillRect(0, 0, C.w, C.h); }; C.onResize();
  const bar = mk('div', 'bbar'); g.stage.appendChild(bar);
  const sel = (b, grp) => { $$('.swatch.' + grp, bar).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); };
  [null, ...COLORS].forEach((c, i) => { const b = mk('button', 'swatch col' + (i === 0 ? ' sel' : '')); b.style.background = c || 'conic-gradient(#FF3D3D,#FFD60A,#19D36B,#3B62FF,#9B5DE5,#FF3D3D)'; b.addEventListener('click', () => { color = c; sel(b, 'col'); SFX.tap(); if (c) say(cap(T().colors[COLORS.indexOf(c)])); }); bar.appendChild(b); });
  bar.appendChild(mk('span', 'gap'));
  [['burst', '✺'], ['ring', '◯'], ['heart', shapeSvg(4, TT.white, 'ico')], ['star', shapeSvg(3, TT.white, 'ico')]].forEach(([k, ic], i) => { const b = mk('button', 'swatch shp' + (i === 0 ? ' sel' : ''), ic); b.addEventListener('click', () => { shape = k; sel(b, 'shp'); SFX.tap(); }); bar.appendChild(b); });
  const launch = (tx, ty, auto) => { shells.push({ x0: clamp(tx + rand(-60, 60), 20, C.w - 20), tx, ty, t: 0, dur: rand(.7, 1), c: color || pick(COLORS), c2: pick(COLORS), type: auto ? pick(['burst', 'ring', 'heart', 'star', 'willow']) : shape }); sweep(300, 1100, .6, 'sine', .04); if (!auto) { idle = 0; H.mood('happy', 500); } };
  g.on(C.cv, 'pointerdown', e => { const p = C.pos(e); launch(p.x, Math.min(p.y, C.h * .7)); });
  g.key = e => { if (e.key.length === 1 || e.key === ' ' || e.key === 'Enter') launch(rand(.15, .85) * C.w, rand(.15, .5) * C.h); };
  function explode(s) {
    const sp = C.h * .4, add = (vx, vy, color, life, gr, drag, size) => P.a.push({ x: s.tx, y: s.ty, vx, vy, life, max: life, color, size, g: gr, drag });
    const param = (n, fn) => { for (let i = 0; i < n; i++) { const [x, y] = fn(i / n * Math.PI * 2); add(x * sp, y * sp, s.c, 1.7, 60, 1.6, 5); } };
    if (s.type === 'ring') param(56, a => [Math.cos(a), Math.sin(a)]);
    else if (s.type === 'heart') param(64, a => [16 * Math.sin(a) ** 3 / 17, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 17]);
    else if (s.type === 'star') param(70, a => { const k = Math.floor(a / (Math.PI * 2) * 10), f = a / (Math.PI * 2) * 10 - k, r0 = k % 2 ? .45 : 1, r1 = k % 2 ? 1 : .45, r = lerp(r0, r1, f), an = -Math.PI / 2 + a; return [Math.cos(an) * r, Math.sin(an) * r]; });
    else if (s.type === 'willow') { for (let i = 0; i < 70; i++) { const a = Math.random() * 7, v = sp * rand(.4, 1); add(Math.cos(a) * v, Math.sin(a) * v, '#ffcf6b', 2.6, 70, 2.2, 3.5); } SFX.crackle(); }
    else for (let i = 0; i < 80; i++) { const a = Math.random() * 7, v = sp * rand(.3, 1); add(Math.cos(a) * v, Math.sin(a) * v, i % 3 ? s.c : s.c2, rand(1.1, 1.8), 110, 1.3, rand(3, 6)); }
    SFX.boom(rand(.7, 1));
  }
  g.loop(dt => {
    const w = C.w, h = C.h, ctx = C.ctx; idle += dt;
    if (idle > 6) { auto -= dt; if (auto <= 0) { launch(rand(.15, .85) * w, rand(.15, .45) * h, true); auto = rand(.9, 1.6); } }
    for (const s of shells) { s.t += dt; const k = Math.min(1, s.t / s.dur), e = 1 - (1 - k) ** 2; s.x = lerp(s.x0, s.tx, e); s.y = lerp(h, s.ty, e); P.a.push({ x: s.x, y: s.y, vx: rand(-20, 20), vy: rand(20, 60), life: .35, max: .35, color: '#ffd9a0', size: 3, g: 0, drag: 1 }); if (k >= 1) { s.done = true; explode(s); } }
    shells = shells.filter(s => !s.done); P.update(dt);
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(0,0,10,.24)'; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter'; P.draw(ctx); for (const s of shells) { ctx.fillStyle = '#fff'; ctx.fillRect(s.x - 3, s.y - 3, 6, 6); }
    ctx.globalCompositeOperation = 'source-over';
    const base = h - (C.h * .12);
    for (const b of sky) { const bx = b.x * w, bh = b.h * h, bw = b.w * w; ctx.fillStyle = '#05060f'; ctx.fillRect(bx, base - bh, bw, bh + h); ctx.fillStyle = 'rgba(255,214,10,.55)'; for (let y = base - bh + 8; y < base - 8; y += 16) for (let x = bx + 5; x < bx + bw - 6; x += 12) if (((x * 3 + y * 5) | 0) % 4 === 0) ctx.fillRect(x, y, 5, 6); }
  });
});

/* BUBBLES — Hoot: pop any → pop the color → pop 1..10 in order → pop A..J in order */
game('bubbles', 'play', '🫧', g => {
  const H = g.host('hoot'), C = g.canvas(), P = new Particles();
  let bs = [], t = 0, next = 0, target = null, seqI = 0;
  const SEQ = { 3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4: 'ABCDEFGHIJ'.split('') };
  const label = () => { const lv = g.lvl(); if (lv < 3) return null; const s = SEQ[lv]; return Math.random() < .45 && !bs.some(b => b.lab === s[seqI]) ? s[seqI] : pick(s.slice(Math.max(0, seqI - 2), seqI + 4)); };
  const spawn = (x, y, r, ci) => bs.push({ x: x ?? rand(.08, .92) * C.w, y: y ?? C.h + C.h * .15, r: r ?? C.h * (g.lvl() >= 3 ? rand(.075, .1) : Math.random() < .2 ? .12 : rand(.05, .09)), ci: ci ?? (g.lvl() === 2 && Math.random() < .4 ? target : randi(0, 6)), lab: label(), vy: C.h * rand(.07, .12), ph: Math.random() * 6 });
  const ask = () => { const lv = g.lvl(); if (lv === 2) { target = randi(0, 6); H.say(L[lang].popColor(T().colors[target]), 'talk', lang, 0, CARD.color(target, '🫧')); } else if (lv >= 3) { const v = SEQ[lv][seqI]; typeof v === 'number' ? H.say(L[lang].findNum(v), 'talk', lang, 0, CARD.num(v)) : H.say(`Find the letter ${v}!`, 'talk', 'en', 0, CARD.letter(v)); } };
  const start = lv => { bs = []; seqI = 0; target = null; g.meter(lv === 1 ? 15 : 10); if (lv > 1) g.after(400, ask); else H.bubble('👆 🫧'); };
  g.levels(4, start);
  g.on(C.cv, 'pointerdown', e => { const p = C.pos(e); for (let i = bs.length - 1; i >= 0; i--) { const b = bs[i]; if (Math.hypot(b.x - p.x, b.y - p.y) < b.r * 1.1) { pop(b); return; } } });
  g.key = e => { const k = e.key.toUpperCase(); const b = bs.find(b => b.lab != null && String(b.lab) === k) || (e.key === ' ' && bs[0]); if (b) pop(b); };
  function pop(b) {
    const lv = g.lvl(); bs = bs.filter(x => x !== b); SFX.pop(clamp(C.h * .08 / b.r, .6, 1.6));
    P.burst(b.x, b.y, [COLORS[b.ci], TT.white], 18, b.r * 4, { g: 300, life: .6 });
    let ok = lv === 1 || (lv === 2 && b.ci === target) || (lv >= 3 && b.lab === SEQ[lv][seqI]);
    if (lv === 1) say(cap(T().colors[b.ci]) + '!');
    if (lv >= 3 && b.lab != null) typeof b.lab === 'number' ? say(numWord(b.lab)) : say(b.lab, 'en');
    if (ok) { g.star(1, ...FX(C, b.x, b.y)); H.mood('happy', 500); if (lv >= 3) seqI++; if (g.progress()) g.levelUp(); else if (lv === 2 && Math.random() < .3) g.after(700, ask); else if (lv >= 3) g.after(900, ask); }
    else if (lv === 2) { H.mood('oops'); g.after(500, () => say(cap(T().colors[b.ci]) + '?')); }
    else if (lv >= 3) H.mood('oops');
    if (lv === 1 && b.r > C.h * .11) for (let i = 0; i < 3; i++) spawn(b.x + rand(-b.r, b.r) * .5, b.y + rand(-b.r, b.r) * .5, b.r * .45, randi(0, 6));
  }
  g.loop(dt => {
    const w = C.w, h = C.h, ctx = C.ctx; t += dt;
    if (!g.paused() && (next -= dt) <= 0 && bs.length < (g.lvl() >= 3 ? 8 : 10)) { spawn(); next = rand(.5, 1.1); }
    for (const b of bs) { b.y -= b.vy * dt; b.x += Math.sin(t * 1.4 + b.ph) * h * .03 * dt; }
    bs = bs.filter(b => b.y > -b.r * 2); P.update(dt);
    const bg = ctx.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#062a3a'); bg.addColorStop(1, '#000'); ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    for (const b of bs) {
      const sq = 1 + Math.sin(t * 3 + b.ph) * .04; ctx.save(); ctx.translate(b.x, b.y); ctx.scale(sq, 2 - sq);
      const gr = ctx.createRadialGradient(-b.r * .3, -b.r * .35, b.r * .05, 0, 0, b.r); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.25, COLORS[b.ci] + 'aa'); gr.addColorStop(1, COLORS[b.ci] + '55');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, b.r, 0, 7); ctx.fill(); ctx.strokeStyle = COLORS[b.ci]; ctx.lineWidth = Math.max(2, b.r * .06); ctx.stroke();
      if (b.lab != null) { ctx.fillStyle = TT.white; ctx.font = `700 ${b.r * 1.05}px ${PXF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.strokeText(b.lab, 0, b.r * .06); ctx.fillText(b.lab, 0, b.r * .06); }
      ctx.restore();
    }
    P.draw(ctx);
  });
});

/* POP-UP — Foxy: bop the moles → leave the bunnies → bop the number */
game('moles', 'play', '🐹', g => {
  const H = g.host('foxy'), C = g.canvas(), P = new Particles();
  let holes = [], t = 0, next = .5, upTime = 1.7, target = null;
  const layout = () => { const w = C.w, h = C.h, cols = 3, rows = 2; holes = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) holes.push({ cx: w * (c + .5) / cols, cy: h * (.42 + r * .36), rw: Math.min(w / cols * .3, h * .13), st: 'down', p: 0, timer: 0, hat: pick(COLORS), kind: 'mole', n: 1 }); };
  C.onResize = layout; layout();
  const ask = () => { target = randi(1, 9); H.say(L[lang].findNum(target), 'talk', lang, 0, CARD.num(target, '🐹')); };
  const start = lv => { holes.forEach(hl => { hl.st = 'down'; hl.p = 0; }); upTime = lv === 1 ? 1.7 : 1.4; g.meter(lv === 3 ? 8 : 15); if (lv === 3) g.after(400, ask); else H.bubble(lv === 2 ? '🐹 ✔ · 🐰 ✖' : '👆 🐹'); };
  g.levels(3, start);
  const bonk = hl => {
    const lv = g.lvl(); hl.st = 'bonk'; hl.timer = .35; SFX.boing();
    const ok = hl.kind === 'mole' && (lv < 3 || hl.n === target);
    if (ok) { P.burst(hl.cx, hl.cy - hl.rw * 1.2, [TT.yellow, TT.white], 14, C.h * .45, { g: 400 }); g.star(1, ...FX(C, hl.cx, hl.cy - hl.rw)); H.mood('happy', 500); upTime = Math.max(lv === 1 ? 1 : .85, upTime - .03); if (g.progress()) g.levelUp(); else if (lv === 3) g.after(800, ask); }
    else { H.mood('oops'); SFX.bad(); if (hl.kind === 'bunny') say('Hey!', 'en'); else say(numWord(hl.n) + '?'); }
  };
  g.on(C.cv, 'pointerdown', e => { const p = C.pos(e); for (const hl of holes) if ((hl.st === 'up' || hl.st === 'rising') && hl.p > .35 && Math.abs(p.x - hl.cx) < hl.rw * 1.1 && p.y < hl.cy + hl.rw * .4 && p.y > hl.cy - hl.rw * 2.4) { bonk(hl); return; } });
  g.key = e => { const i = '123456'.indexOf(e.key); if (i >= 0 && holes[i] && (holes[i].st === 'up' || holes[i].st === 'rising')) bonk(holes[i]); };
  g.loop(dt => {
    const w = C.w, h = C.h, ctx = C.ctx, lv = g.lvl(); t += dt;
    if (!g.paused() && (next -= dt) <= 0) { const free = holes.filter(x => x.st === 'down'); if (free.length) { const hl = pick(free); hl.st = 'rising'; hl.hat = pick(COLORS); hl.kind = lv === 2 && Math.random() < .35 ? 'bunny' : 'mole'; hl.n = lv === 3 && target != null && Math.random() < .4 ? target : randi(1, 9); } next = rand(.5, 1.1); }
    for (const hl of holes) {
      if (hl.st === 'rising') { hl.p = Math.min(1, hl.p + dt * 6); if (hl.p >= 1) { hl.st = 'up'; hl.timer = upTime * (lv === 3 ? 1.6 : 1); } }
      else if (hl.st === 'up') { if ((hl.timer -= dt) <= 0) hl.st = 'falling'; }
      else if (hl.st === 'bonk') { if ((hl.timer -= dt) <= 0) hl.st = 'falling'; }
      else if (hl.st === 'falling') { hl.p = Math.max(0, hl.p - dt * 5); if (hl.p <= 0) hl.st = 'down'; }
    }
    P.update(dt);
    const bg = ctx.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#0d5e2c'); bg.addColorStop(1, '#063018'); ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    for (const hl of holes) {
      const { cx, cy, rw } = hl;
      ctx.fillStyle = '#1b0f06'; ctx.beginPath(); ctx.ellipse(cx, cy, rw * 1.15, rw * .38, 0, 0, 7); ctx.fill();
      if (hl.p > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(cx - rw * 2, cy - rw * 3.2, rw * 4, rw * 3.2); ctx.clip();
        const e = hl.p * hl.p * (3 - 2 * hl.p), top = cy + rw * .4 - e * rw * 2.1, sq = hl.st === 'bonk' ? .75 : 1;
        ctx.translate(cx, cy + rw * .4); ctx.scale(1, sq); ctx.translate(-cx, -(cy + rw * .4));
        const bunny = hl.kind === 'bunny';
        ctx.fillStyle = bunny ? '#f2f2ee' : '#8B5A3C';
        if (bunny) { ctx.fillRect(cx - rw * .45, top - rw * .7, rw * .25, rw * .8); ctx.fillRect(cx + rw * .2, top - rw * .7, rw * .25, rw * .8); ctx.fillStyle = TT.pink; ctx.fillRect(cx - rw * .4, top - rw * .6, rw * .15, rw * .6); ctx.fillRect(cx + rw * .25, top - rw * .6, rw * .15, rw * .6); ctx.fillStyle = '#f2f2ee'; }
        ctx.beginPath(); ctx.moveTo(cx - rw * .8, cy + rw * .5); ctx.lineTo(cx - rw * .8, top + rw * .7); ctx.arc(cx, top + rw * .7, rw * .8, Math.PI, 0); ctx.lineTo(cx + rw * .8, cy + rw * .5); ctx.fill();
        ctx.fillStyle = bunny ? '#ffffff' : '#c99a72'; ctx.beginPath(); ctx.ellipse(cx, top + rw * 1.25, rw * .5, rw * .42, 0, 0, 7); ctx.fill();
        if (!bunny) { ctx.fillStyle = hl.hat; ctx.fillRect(cx - rw * .55, top - rw * .05, rw * 1.1, rw * .25); ctx.fillRect(cx - rw * .35, top - rw * .35, rw * .7, rw * .35); }
        if (hl.st === 'bonk') { ctx.strokeStyle = '#000'; ctx.lineWidth = rw * .08; for (const ex of [-.3, .3]) { ctx.beginPath(); ctx.moveTo(cx + ex * rw - rw * .1, top + rw * .55); ctx.lineTo(cx + ex * rw + rw * .1, top + rw * .75); ctx.moveTo(cx + ex * rw + rw * .1, top + rw * .55); ctx.lineTo(cx + ex * rw - rw * .1, top + rw * .75); ctx.stroke(); } }
        else { ctx.fillStyle = '#fff'; ctx.fillRect(cx - rw * .42, top + rw * .52, rw * .24, rw * .26); ctx.fillRect(cx + rw * .18, top + rw * .52, rw * .24, rw * .26); ctx.fillStyle = '#000'; ctx.fillRect(cx - rw * .34, top + rw * .6, rw * .12, rw * .14); ctx.fillRect(cx + rw * .26, top + rw * .6, rw * .12, rw * .14); }
        ctx.fillStyle = TT.pink; ctx.fillRect(cx - rw * .14, top + rw * .98, rw * .28, rw * .18);
        if (lv === 3 && !bunny) { ctx.fillStyle = TT.white; ctx.fillRect(cx - rw * .5, top + rw * 1.45, rw, rw * .7); ctx.fillStyle = '#000'; ctx.font = `700 ${rw * .6}px ${PXF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(hl.n, cx, top + rw * 1.82); }
        ctx.restore();
      }
      ctx.fillStyle = '#3b2412'; ctx.beginPath(); ctx.ellipse(cx, cy + rw * .3, rw * 1.25, rw * .3, 0, 0, Math.PI); ctx.fill();
    }
    P.draw(ctx);
  });
});

/* PAINT — free neon painting, or trace letters and numbers */
game('paint', 'play', '🎨', g => {
  const H = g.host('robo');
  g.stage.classList.add('col');
  const wrap = mk('div', 'paintWrap'), bar = mk('div', 'bbar'); g.stage.append(wrap, bar);
  const C = g.canvas(wrap), ctx = C.ctx, guide = mk('canvas', 'gcv guide'); wrap.appendChild(guide);
  let tool = { type: 'color', value: TT.blue }, size = 1, mirror = false, hue = 0, snapshot = null, trace = null, pts = [];
  const TRACE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''); let ti = 0;
  C.onResize = () => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, C.w, C.h); if (snapshot) ctx.drawImage(snapshot, 0, 0, C.w, C.h); if (trace) drawGuide(); };
  const keep = () => { const c = document.createElement('canvas'); c.width = C.cv.width; c.height = C.cv.height; c.getContext('2d').drawImage(C.cv, 0, 0); snapshot = c; };
  const clear = () => { snapshot = null; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, C.w, C.h); };
  function drawGuide() {
    const d = C.dpr; guide.width = C.cv.width; guide.height = C.cv.height; const gc = guide.getContext('2d'); gc.setTransform(d, 0, 0, d, 0, 0); gc.clearRect(0, 0, C.w, C.h);
    if (!trace) return; const fs = C.h * .82;
    gc.font = `700 ${fs}px ${PXF}`; gc.textAlign = 'center'; gc.textBaseline = 'middle'; gc.setLineDash([10, 10]); gc.lineWidth = 4; gc.strokeStyle = 'rgba(242,242,238,.55)'; gc.strokeText(trace, C.w / 2, C.h * .52); gc.fillStyle = 'rgba(242,242,238,.06)'; gc.fillText(trace, C.w / 2, C.h * .52);
    const m = document.createElement('canvas'); m.width = Math.ceil(C.w); m.height = Math.ceil(C.h); const mc = m.getContext('2d'); mc.font = gc.font; mc.textAlign = 'center'; mc.textBaseline = 'middle'; mc.fillText(trace, C.w / 2, C.h * .52);
    const data = mc.getImageData(0, 0, m.width, m.height).data, step = Math.max(8, C.h * .03); pts = [];
    for (let y = 0; y < m.height; y += step) for (let x = 0; x < m.width; x += step) if (data[(Math.floor(y) * m.width + Math.floor(x)) * 4 + 3] > 128) pts.push([x, y]);
  }
  function check() {
    if (!trace || !pts.length) return; const img = ctx.getImageData(0, 0, C.cv.width, C.cv.height).data, W_ = C.cv.width, d = C.dpr;
    let hit = 0; for (const [x, y] of pts) { const i = (Math.floor(y * d) * W_ + Math.floor(x * d)) * 4; if (img[i] + img[i + 1] + img[i + 2] > 90) hit++; }
    if (hit / pts.length > .68) { const done = trace; trace = null; drawGuide(); SFX.chime(); H.happy(); g.star(2); say(`${done}! ${pick(L.en.yes)}`, 'en'); g.after(2200, () => { ti = (ti + 1) % TRACE.length; setTrace(); }); }
  }
  const setTrace = () => { clear(); trace = TRACE[ti]; drawGuide(); H.say(`Trace the ${trace}!`, 'talk', 'en', 0, CARD.letter(trace, '✎')); };
  const btn = (html, cls, fn, sel) => { const b = mk('button', 'swatch ' + (cls || '') + (sel ? ' sel' : ''), html); g.on(b, 'click', () => { fn(b); SFX.tap(); }); bar.appendChild(b); return b; };
  const pickTool = (b, t) => { $$('.swatch.tool', bar).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); tool = t; };
  [...COLORS, TT.white].forEach(c => { const b = btn('', 'tool', b => pickTool(b, { type: 'color', value: c }), c === TT.blue); b.style.background = c; });
  { const b = btn('', 'tool', b => pickTool(b, { type: 'rainbow' })); b.style.background = 'conic-gradient(#FF3D3D,#FFD60A,#19D36B,#3B62FF,#9B5DE5,#FF3D3D)'; }
  bar.appendChild(mk('span', 'gap'));
  [3, 4, 0].forEach(si => btn(shapeSvg(si, TT.white, 'ico'), 'tool', b => pickTool(b, { type: 'stamp', shape: si })));
  bar.appendChild(mk('span', 'gap'));
  const sizes = [.5, 1, 2]; btn('<i class="dot"></i>', '', b => { size = sizes[(sizes.indexOf(size) + 1) % 3]; b.firstChild.style.transform = `scale(${size})`; });
  btn('<b>⧉</b>', '', b => { mirror = !mirror; b.classList.toggle('sel', mirror); });
  btn('🗑️', '', () => { clear(); SFX.whoosh(); });
  const mode = g.tool('✎ FREE', b => { if (trace != null || b.dataset.m === 't') { trace = null; b.dataset.m = ''; b.textContent = '✎ FREE'; drawGuide(); clear(); } else { b.dataset.m = 't'; b.textContent = 'A TRACE'; setTrace(); } });
  const col = () => tool.type === 'rainbow' ? `hsl(${hue = (hue + 4) % 360} 95% 58%)` : tool.value || TT.white;
  const brush = () => Math.max(8, Math.min(C.w, C.h) * (trace ? .045 : .03)) * size;
  const each = (x, y, fn) => { fn(x, y); if (mirror) { fn(C.w - x, y); fn(x, C.h - y); fn(C.w - x, C.h - y); } };
  const act = new Map(); let sc = 0;
  g.on(C.cv, 'pointerdown', e => {
    const p = C.pos(e);
    if (tool.type === 'stamp') { const c = COLORS[sc++ % COLORS.length], r = brush() * 2.6; each(p.x, p.y, (x, y) => { ctx.save(); ctx.translate(x - r, y - r); ctx.scale(r / 50, r / 50); ctx.shadowBlur = 20; ctx.shadowColor = c; ctx.fillStyle = c; ctx.fill(new Path2D(svgPath(tool.shape))); ctx.restore(); }); tone(PENTA[randi(3, 9)], .2, 'triangle', .15); keep(); return; }
    try { C.cv.setPointerCapture(e.pointerId); } catch (_) {}
    act.set(e.pointerId, p); const c = col(); each(p.x, p.y, (x, y) => { ctx.shadowBlur = brush() * .6; ctx.shadowColor = c; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, brush() / 2, 0, 7); ctx.fill(); });
  });
  g.on(C.cv, 'pointermove', e => {
    if (!act.has(e.pointerId)) return; const a = act.get(e.pointerId), p = C.pos(e), c = col();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = brush(); ctx.strokeStyle = c; ctx.shadowBlur = brush() * .6; ctx.shadowColor = c;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    if (mirror) [[C.w - a.x, a.y, C.w - p.x, p.y], [a.x, C.h - a.y, p.x, C.h - p.y], [C.w - a.x, C.h - a.y, C.w - p.x, C.h - p.y]].forEach(([x1, y1, x2, y2]) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); });
    act.set(e.pointerId, p);
  });
  ['pointerup', 'pointercancel'].forEach(ev => g.on(C.cv, ev, e => { if (act.delete(e.pointerId)) { keep(); check(); } }));
  g.key = e => { if (trace && e.key.toUpperCase() === trace) { ctx.fillStyle = TT.yellow; } };
  g.tool('💾', b => { const url = shrinkCanvas(C.cv, 800); MEDIA.add('paint', { url }).then(() => { SFX.chime(); H.happy(); g.star(1); retrigger(b, 'bump'); }); });
  C.onResize(); H.bubble('🎨 ✎');
});
function svgPath(i) { return ['M50 8 A42 42 0 1 1 49.9 8 Z', 'M10 10 H90 V90 H10 Z', 'M50 6 L94 90 L6 90 Z', 'M' + starPoints(50, 54, 46, 20).replace(/ /g, ' L') + ' Z', 'M50 90 C 18 66, 4 46, 17 25 C 29 7, 47 13, 50 30 C 53 13, 71 7, 83 25 C 96 46, 82 66, 50 90 Z'][i]; }
