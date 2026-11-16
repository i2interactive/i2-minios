/* ═════════ NEW APPS · part 8 — skate park, splash gallery ═════════ */
Object.entries({
  skate: ['Skate Park', 'Skatepark', 'Skatepark', 'Pista de Skate', 'スケートパーク', '滑板公园'],
  gallery: ['Splash Gallery', 'Feria de Agua', 'Stand Splash', 'Barraca de Água', 'みずでっぽう', '水枪游戏'],
  blaster: ['Number Blaster', 'Números Galácticos', 'Blaster des Nombres', 'Blaster de Números', 'かずブラスター', '数字太空战'],
  foxhunt: ['World Detective', 'Detective Mundial', 'Détective du Monde', 'Detetive do Mundo', 'せかいたんてい', '环球侦探'],
  mischief: ['TV Sleuth', 'Detective TV', 'Détective TV', 'Detetive da TV', 'テレビたんてい', '电视侦探'],
  golf2: ['Pirate Golf', 'Golf Pirata', 'Golf Pirate', 'Golfe Pirata', 'かいぞくゴルフ', '海盗高尔夫']
}).forEach(([id, a]) => LANG6.forEach((k, i) => { if (L[k]) L[k].games[id] = a[i]; }));
const LX = o => o[lang] || o.en;
Object.assign(SECRETS, { skate: ['🛹', 'S-K-A-T-E'], goldduck: ['🦆', 'GOLDEN DUCK'], corner: ['📺', 'PERFECT CORNER'] });

/* ── tiny 3D spark pool shared by the new 3D games ── */
function sparkPool(scene, n = 40, col = TT.yellow) {
  const geo = new THREE.BoxGeometry(.06, .06, .06), mat = new THREE.MeshBasicMaterial({ color: col }), list = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(geo, mat); m.visible = false; scene.add(m); list.push({ m, v: new THREE.Vector3(), life: 0 }); }
  let k = 0;
  return {
    emit(x, y, z, cnt = 3, sp = 3, up = 2) { for (let i = 0; i < cnt; i++) { const p = list[k++ % n]; p.m.position.set(x, y, z); p.v.set(rand(-sp, sp), rand(0, up) + up * .3, rand(-sp, sp) * .4); p.life = rand(.25, .55); p.m.visible = true; } },
    update(dt, dz = 0) { list.forEach(p => { if (p.life <= 0) return; p.life -= dt; p.v.y -= 12 * dt; p.m.position.addScaledVector(p.v, dt); p.m.position.z += dz; if (p.life <= 0) p.m.visible = false; }); }
  };
}

/* SKATE PARK — auto-rolling street park. ◀ ▶ to steer, ⬆ to ollie, tap in the air for flip tricks.
   Each level has a goal like a 1999 skate game: spell S-K-A-T-E, grind rails, land tricks, find the hidden tapes. */
game('skate', '3d', '🛹', g => {
  const me = PROG.buddy || 'robo', H = g.host(me), V = g.three({ fov: 60, far: 220 }), { scene, cam } = V, label = overlayLabel(g);
  const hudEl = mk('div', 'skHud'); g.stage.appendChild(hudEl);
  const lb = mk('button', 'ovbtn kartL', '◀'), rb = mk('button', 'ovbtn kartR', '▶'), jb = mk('button', 'ovbtn skJump', '⬆'); g.stage.append(lb, rb, jb);
  const LANES = [-2.6, 0, 2.6], WORD = 'SKATE', TRICKS = ['OLLIE!', 'KICKFLIP!', 'HEELFLIP!', '360 FLIP!', 'McTWIST!', 'THE 900!!'];
  const LV = {
    1: { sp: 8, goal: 'letters', n: 5, cone: 0, rail: 0, ramp: .25, tape: 0 },
    2: { sp: 9, goal: 'grind', n: 5, cone: .08, rail: .4, ramp: .1, tape: 0 },
    3: { sp: 10, goal: 'tricks', n: 6, cone: .15, rail: .15, ramp: .4, tape: 0 },
    4: { sp: 11, goal: 'tapes', n: 6, cone: .22, rail: .2, ramp: .2, tape: .3 },
    5: { sp: 12.5, goal: 'letters', n: 5, cone: .28, rail: .25, ramp: .25, tape: 0, night: 1 }
  };
  const GOAL_ICON = { letters: 'S·K·A·T·E', grind: '🛤️', tricks: '🤸', tapes: '📼' };
  let L = 1, steer = 0, keyS = 0, px = 0, vx = 0, y = 0, vy = 0, air = false, fromRamp = false, flips = 0, flipA = 0, flipT = 0, grind = null, crash = 0, speed = 8, t = 0, score = 0, got = '', coins = 0, goalN = 0, objs = [], spawnZ = 0, letterOut = false, sinceLetter = 99;

  /* the street */
  stageLights(scene, { hemi: 1, ground: 0x555555 });
  const gtex = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#a3a3a3'; c.fillRect(0, 0, w, h); for (let i = 0; i < 600; i++) { const v = randi(110, 190); c.fillStyle = `rgba(${v},${v},${v},.35)`; c.fillRect(rand(0, w), rand(0, h), 2, 2); } c.fillStyle = '#7d7d7d'; c.fillRect(0, 0, w, 3); c.fillRect(0, 0, 3, h); });
  gtex.wrapS = gtex.wrapT = THREE.RepeatWrapping; gtex.repeat.set(3, 70);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(10, 260), new THREE.MeshLambertMaterial({ map: gtex })); road.rotation.x = -Math.PI / 2; road.position.z = -110; scene.add(road);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(90, 260), new THREE.MeshLambertMaterial({ color: '#2e7d43' })); grass.rotation.x = -Math.PI / 2; grass.position.set(0, -.02, -110); scene.add(grass);
  const grafTex = i => canvasTex(256, 96, (c, w, h) => {
    c.fillStyle = ['#2b2b38', '#38302b', '#2b3830', '#382b36'][i % 4]; c.fillRect(0, 0, w, h);
    for (let k = 0; k < 7; k++) { c.fillStyle = pick(COLORS); c.globalAlpha = .8; c.beginPath(); c.ellipse(rand(20, w - 20), rand(20, h - 20), rand(15, 45), rand(8, 25), rand(0, 3), 0, 7); c.fill(); } c.globalAlpha = 1;
    const word = [(BRAND().short || MINIOS.short).toUpperCase(), 'SKATE', 'RAD!', 'WOW!'][i % 4]; c.font = `bold 46px ${PXF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 7; c.strokeStyle = '#000'; c.strokeText(word, w / 2, h / 2 + 4); c.fillStyle = [TT.yellow, TT.white, TT.pink, TT.green][i % 4]; c.fillText(word, w / 2, h / 2 + 4);
  });
  const grafs = [0, 1, 2, 3].map(grafTex), plain = new THREE.MeshLambertMaterial({ color: '#2a2a33' }), deco = [], bulbs = [];
  [-1, 1].forEach(sd => { for (let i = 0; i < 12; i++) {
    const mats = [plain, plain, plain, plain, plain, plain]; mats[sd < 0 ? 0 : 1] = new THREE.MeshLambertMaterial({ map: grafs[(i + (sd > 0 ? 2 : 0)) % 4] });
    const w = new THREE.Mesh(new THREE.BoxGeometry(.4, 2, 7.4), mats); w.position.set(sd * 6.2, 1, -i * 9); scene.add(w); deco.push(w);
    if (i % 2 === 0) { const lamp = new THREE.Group(), pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 3.4), new THREE.MeshLambertMaterial({ color: '#333' })); pole.position.y = 1.7; const bulb = new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 8), new THREE.MeshBasicMaterial({ color: '#fff3b0' })); bulb.position.set(-sd * .4, 3.4, 0); lamp.add(pole, bulb); lamp.position.set(sd * 5.4, 0, -i * 9 - 4.5); scene.add(lamp); deco.push(lamp); bulbs.push(bulb); }
  } });
  /* the skater */
  const rider = new THREE.Group(), deck = new THREE.Group(); deck.position.y = .15; rider.add(deck);
  const deckMat = new THREE.MeshLambertMaterial({ map: canvasTex(32, 128, (c, w, h) => { c.fillStyle = TT.red; c.fillRect(0, 0, w, h); c.fillStyle = TT.yellow; c.fillRect(0, h * .42, w, h * .16); c.fillStyle = '#111'; c.fillRect(0, 0, w, 7); c.fillRect(0, h - 7, w, 7); }) });
  deck.add(new THREE.Mesh(new THREE.BoxGeometry(.56, .06, 1.4), deckMat));
  [[-.2, -.46], [.2, -.46], [-.2, .46], [.2, .46]].forEach(([x, z]) => { const wh = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .08, 10), new THREE.MeshLambertMaterial({ color: '#f2f2ee' })); wh.rotation.z = Math.PI / 2; wh.position.set(x, -.08, z); deck.add(wh); });
  const spr = castSprite(me, 1.5); spr.position.y = .2; rider.add(spr); scene.add(rider);
  const sparks = sparkPool(scene, 50);

  /* things on the street */
  const texCache = {};
  const signTex = (k, draw) => texCache[k] || (texCache[k] = canvasTex(128, 128, draw));
  const letterTex = ch => signTex('L' + ch, (c, w, h) => { c.fillStyle = TT.yellow; c.fillRect(0, 0, w, h); c.fillStyle = '#000'; c.fillRect(8, 8, w - 16, h - 16); c.fillStyle = TT.yellow; c.font = `bold 92px ${PXF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, w / 2, h / 2 + 6); });
  const tapeTex = () => signTex('tape', (c, w, h) => { c.fillStyle = '#111'; c.fillRect(6, 26, w - 12, h - 52); c.fillStyle = TT.white; c.fillRect(20, 40, w - 40, 26); c.fillStyle = '#111'; c.beginPath(); c.arc(42, 53, 9, 0, 7); c.arc(86, 53, 9, 0, 7); c.fill(); c.fillStyle = TT.red; c.fillRect(20, 76, w - 40, 14); c.fillStyle = TT.yellow; c.font = `bold 14px ${PXF}`; c.textAlign = 'center'; c.fillText('SECRET TAPE', w / 2, 88); });
  const coinGeo = new THREE.CylinderGeometry(.24, .24, .06, 16), coinMat = new THREE.MeshStandardMaterial({ color: '#FFC83D', metalness: .6, roughness: .3, emissive: '#5a3a00' });
  function add(k, x, z, m, extra) { m.position.x = x; m.position.z = z; scene.add(m); const o = { k, x, z, m, ...extra }; objs.push(o); return o; }
  function spawnLetter(z) { const ch = WORD[got.length], m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, .12), new THREE.MeshBasicMaterial({ map: letterTex(ch) })); m.position.y = 1.1; letterOut = true; sinceLetter = 0; return add('letter', pick(LANES), z, m, { ch }); }
  function spawn(z) {
    const c = LV[L], x = pick(LANES), r = Math.random();
    if (c.goal === 'letters' && !letterOut && got.length < 5 && sinceLetter > 20) return spawnLetter(z);
    if (c.tape && r < c.tape) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: tapeTex(), transparent: true, side: THREE.DoubleSide })); m.position.y = Math.random() < .5 ? 1.0 : 2.2; return add('tape', x, z, m); }
    if (r < c.rail) { const len = 7, grp = new THREE.Group(), bar = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, len, 10), new THREE.MeshStandardMaterial({ color: TT.yellow, metalness: .7, roughness: .3 })); bar.rotation.x = Math.PI / 2; bar.position.y = .6; grp.add(bar); [-len / 2 + .4, 0, len / 2 - .4].forEach(pz => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .6), new THREE.MeshLambertMaterial({ color: '#444' })); p.position.set(0, .3, pz); grp.add(p); }); return add('rail', x, z - len / 2, grp, { len }); }
    if (r < c.rail + c.ramp) { const grp = new THREE.Group(), ramp = new THREE.Mesh(new THREE.BoxGeometry(1.9, .12, 2.2), new THREE.MeshLambertMaterial({ map: signTex('ramp', (cx, w, h) => { cx.fillStyle = TT.blue; cx.fillRect(0, 0, w, h); cx.fillStyle = TT.yellow; for (let i = 0; i < 4; i++) { cx.beginPath(); cx.moveTo(w / 2 - 30, 100 - i * 26); cx.lineTo(w / 2, 80 - i * 26); cx.lineTo(w / 2 + 30, 100 - i * 26); cx.lineTo(w / 2 + 30, 110 - i * 26); cx.lineTo(w / 2, 90 - i * 26); cx.lineTo(w / 2 - 30, 110 - i * 26); cx.fill(); } }) })); ramp.rotation.x = .32; ramp.position.y = .34; const side = new THREE.Mesh(new THREE.BoxGeometry(1.9, .5, .2), new THREE.MeshLambertMaterial({ color: '#333' })); side.position.set(0, .25, -1.02); grp.add(ramp, side); return add('ramp', x, z, grp); }
    if (r < c.rail + c.ramp + c.cone) { const grp = new THREE.Group(), cone = new THREE.Mesh(new THREE.ConeGeometry(.28, .7, 14), new THREE.MeshLambertMaterial({ color: TT.orange })); cone.position.y = .35; const band = new THREE.Mesh(new THREE.CylinderGeometry(.17, .21, .1, 14), new THREE.MeshLambertMaterial({ color: '#fff' })); band.position.y = .38; grp.add(cone, band); return add('cone', x, z, grp); }
    for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(coinGeo, coinMat); m.rotation.x = Math.PI / 2; m.position.y = .7; add('coin', x, z - i * 1.4, m); }
  }
  function renderHud() {
    const c = LV[L], letters = WORD.split('').map((ch, i) => `<i class="${i < got.length ? 'on' : ''}">${ch}</i>`).join('');
    hudEl.innerHTML = `<b>${String(score).padStart(6, '0')}</b><span class="skGoal">${c.goal === 'letters' ? letters : `${GOAL_ICON[c.goal]} ${goalN}/${c.n}`}</span>`;
  }
  function reset() {
    objs.forEach(o => scene.remove(o.m)); objs = []; px = 0; vx = 0; y = 0; vy = 0; air = false; grind = null; crash = 0; got = ''; goalN = 0; letterOut = false; sinceLetter = 99; flips = 0; flipA = flipT = 0;
    const c = LV[L]; speed = c.sp; for (let z = -14; z > -100; z -= rand(8, 12)) spawn(z); spawnZ = -100;
    const sky = c.night ? '#0b0b24' : '#8fd3ff'; scene.background = new THREE.Color(sky); scene.fog = new THREE.Fog(sky, 35, 120);
    bulbs.forEach(b => b.material.color.set(c.night ? '#fff3b0' : '#cfcfcf')); renderHud();
  }
  /* controls */
  const ollie = () => {
    if (crash > 0) return;
    if (grind) { grind = null; air = true; vy = 6.5; SFX.jump(); return; }
    if (!air) { air = true; vy = 7.4; SFX.jump(); noise(.05, .12, 'lowpass', 900); return; }
    flipT += Math.PI * 2; flips++; tone(520 + flips * 120, .08, 'square', .05);
  };
  const hold = (el, v) => { g.on(el, 'pointerdown', e => { e.stopPropagation(); steer = v; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => g.on(el, ev, () => { if (steer === v) steer = 0; })); };
  hold(lb, -1); hold(rb, 1); g.on(jb, 'pointerdown', e => { e.stopPropagation(); ollie(); });
  g.on(V.el, 'pointerdown', e => { const r = V.el.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width; if (air || grind) { ollie(); return; } if (fx < .33) steer = -1; else if (fx > .67) steer = 1; else ollie(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => g.on(V.el, ev, () => { steer = 0; }));
  g.key = e => { if (e.key === 'ArrowLeft') keyS = -1; if (e.key === 'ArrowRight') keyS = 1; if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Enter') && !e.repeat) ollie(); };
  g.on(document, 'keyup', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') keyS = 0; });

  const goal = () => { goalN++; renderHud(); if (g.progress()) g.after(700, () => g.levelUp()); };
  const pts = (n, txt) => { score += n; if (txt) label(txt); renderHud(); };
  function land() {
    y = 0; vy = 0; air = false; flipA = flipT = Math.round(flipT / (Math.PI * 2)) * Math.PI * 2;
    const n = flips + (fromRamp ? 1 : 0);
    if (n > 0) { pts(100 * n * n, TRICKS[Math.min(n, TRICKS.length - 1)]); SFX.good(); if (n >= 2 || fromRamp) g.star(1); if (fromRamp && LV[L].goal === 'tricks') goal(); H.happy(); }
    else noise(.06, .14, 'lowpass', 700);
    flips = 0; fromRamp = false;
  }
  g.levels(5, lv => { L = lv; g.meter(LV[lv].n); reset(); H.bubble(`◀ ⬆ ▶  ${GOAL_ICON[LV[lv].goal]}`); });
  g.loop(dt => {
    t += dt; const c = LV[L], st = steer || keyS;
    if (crash > 0) { crash -= dt; speed = Math.max(3, speed - dt * 18); deck.rotation.y = Math.sin(crash * 18) * .6; } else { deck.rotation.y = lerp(deck.rotation.y, 0, dt * 8); speed = lerp(speed, c.sp, dt * .6); }
    if (grind) { px = lerp(px, grind.x, Math.min(1, dt * 12)); vx = 0; y = .64; sparks.emit(px + rand(-.2, .2), .6, .4, 2, 2.5, 1.5); if ((t * 20 | 0) % 2) noise(.03, .06, 'highpass', 5000); }
    else { vx = lerp(vx, st * 7, dt * 5); px = clamp(px + vx * dt, -3.8, 3.8); }
    if (air) { vy -= 22 * dt; y += vy * dt; if (y <= 0) land(); }
    flipA = flipT > flipA ? Math.min(flipT, flipA + dt * 16) : flipT; deck.rotation.z = flipA;
    const dz = speed * dt; sinceLetter += dz;
    objs.forEach(o => { o.z += dz; o.m.position.z = o.z; if (o.k === 'coin') o.m.rotation.z += dt * 4; if (o.k === 'letter') o.m.rotation.y = Math.sin(t * 3) * .6; if (o.k === 'tape') o.m.rotation.y += dt * 2.5; });
    deco.forEach(d => { d.position.z += dz; if (d.position.z > 9) d.position.z -= 108; });
    gtex.offset.y += dz / (260 / 70);
    for (const o of objs) {
      if (o.done) continue; const dx = Math.abs(px - o.x);
      if (o.k === 'coin' && Math.abs(o.z) < .6 && dx < .9 && y < 1.6) { o.done = true; scene.remove(o.m); coins++; SFX.coin(); pts(10); if (coins % 10 === 0) g.star(1); }
      if (o.k === 'letter' && Math.abs(o.z) < .7 && dx < 1.1) { o.done = true; scene.remove(o.m); letterOut = false; got += o.ch; SFX.chime(); pts(500, o.ch + '!'); g.star(1); renderHud(); goalN = got.length; if (g.progress()) { secret('skate'); label('S-K-A-T-E!'); g.after(900, () => g.levelUp()); } }
      if (o.k === 'tape' && Math.abs(o.z) < .7 && dx < 1.1 && Math.abs(y + 1 - o.m.position.y) < .95) { o.done = true; scene.remove(o.m); SFX.chime(); pts(750, '📼 SECRET TAPE!'); g.star(2); goal(); }
      if (o.k === 'ramp' && !air && !grind && o.z > -1 && o.z < .8 && dx < 1.1) { o.done = true; air = true; fromRamp = true; vy = 10.8; sweep(300, 900, .35, 'triangle', .1); pts(50, 'BIG AIR!'); }
      if (o.k === 'cone' && Math.abs(o.z) < .35 && dx < .55) { o.done = true; if (y < .5 && !grind && crash <= 0) { crash = .9; SFX.bump(); H.mood('oops'); label('BAIL!'); o.m.rotation.z = 1.4; o.m.position.y = .1; } else if (air) pts(50, 'OLLIE!'); }
      if (o.k === 'rail') {
        const near = o.z + o.len / 2, far = o.z - o.len / 2;
        if (!o.used && !grind && near > -.2 && far < 0 && dx < .9) {
          const ok = (air && y > .3) || (!air && L <= 2);
          if (ok) { o.used = true; grind = o; air = false; flips = 0; fromRamp = false; tone(220, .12, 'sawtooth', .05); label('50-50 GRIND!'); }
          else if (!air && dx < .45 && crash <= 0) { o.used = true; crash = .7; SFX.bump(); H.mood('oops'); label('BAIL!'); }
        }
        if (grind === o && far >= 0) { o.done = true; grind = null; air = true; vy = 5; pts(250, 'GRIND!'); SFX.good(); g.star(1); if (LV[L].goal === 'grind') goal(); }
      }
    }
    objs = objs.filter(o => { if (o.z - (o.len || 0) > 10) { scene.remove(o.m); if (o.k === 'letter' && !o.done) letterOut = false; return false; } if (o.done && (o.k === 'coin' || o.k === 'letter' || o.k === 'tape')) return false; return true; });
    spawnZ += dz; while (spawnZ > -110) { spawnZ -= rand(8, 12) * (L >= 4 ? .85 : 1); spawn(spawnZ); }
    sparks.update(dt);
    rider.position.set(px, y, 0); rider.rotation.z = lerp(rider.rotation.z, -st * .18, dt * 6);
    spr.material.map = castTex(me, crash > 0 ? 'oops' : air || grind ? 'happy' : 'idle'); spr.position.y = .2 + (air || grind ? 0 : Math.abs(Math.sin(t * 6)) * .03);
    cam.position.lerp(new THREE.Vector3(px * .55, 3.3 + y * .35, 6.6), Math.min(1, dt * 4)); cam.lookAt(px * .55, .9 + y * .3, -8);
    V.render();
  });
});

/* SPLASH GALLERY — a carnival water-squirter booth: ducks on rails, balloons, pop-up friends, a can pyramid, and a rare golden duck */
game('gallery', '3d', '🎯', g => {
  const H = g.host('dino'), V = g.three({ fov: 50 }), { scene, cam } = V, label = overlayLabel(g);
  cam.position.set(0, 1.9, 7.6); cam.lookAt(0, 1.55, 0); stageLights(scene, { hemi: 1, ground: 0x332211 });
  const reticle = mk('div', 'reticle'); g.stage.appendChild(reticle); g.stage.classList.add('noCursor');
  const LV = {
    1: { rows: [{ y: 1.2, z: 0, sp: 1.0, dir: 1 }], n: 8 },
    2: { rows: [{ y: 1.2, z: 0, sp: 1.3, dir: 1 }, { y: 2.3, z: -.6, sp: 1.1, dir: -1 }], balloons: 1, n: 12 },
    3: { rows: [{ y: 1.2, z: 0, sp: 1.6, dir: 1 }, { y: 2.3, z: -.6, sp: 1.4, dir: -1 }], pops: 1, gold: .08, n: 14 },
    4: { rows: [{ y: 1.2, z: 0, sp: 1.8, dir: -1 }, { y: 2.3, z: -.6, sp: 1.6, dir: 1 }], pops: 1, cans: 1, balloons: 1, gold: .1, n: 16 },
    5: { rows: [{ y: 1.1, z: 0, sp: 2.2, dir: 1 }, { y: 2.0, z: -.5, sp: 1.8, dir: -1 }, { y: 2.9, z: -1, sp: 2.4, dir: 1 }], pops: 1, cans: 1, balloons: 1, gold: .12, n: 20, night: 1 }
  };
  /* the booth */
  const back = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), new THREE.MeshLambertMaterial({ map: canvasTex(512, 256, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1a1050'); gr.addColorStop(1, '#3b1a6b'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { c.fillStyle = pick([TT.yellow, TT.white, TT.pink]); starPath(c, rand(0, w), rand(0, h * .7), rand(2, 6)); c.fill(); }
    c.font = `bold 40px ${PXF}`; c.textAlign = 'center'; c.fillStyle = TT.yellow; c.strokeStyle = '#000'; c.lineWidth = 6; c.strokeText('★ SPLASH GALLERY ★', w / 2, 48); c.fillText('★ SPLASH GALLERY ★', w / 2, 48);
  }) })); back.position.set(0, 2.4, -1.6); scene.add(back);
  const stripe = canvasTex(256, 32, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#fff' : TT.red; c.fillRect(i * 16, 0, 16, h); } });
  const awn = new THREE.Mesh(new THREE.BoxGeometry(10.4, .9, .2), new THREE.MeshLambertMaterial({ map: stripe })); awn.position.set(0, 4.6, 2.4); awn.rotation.x = -.35; scene.add(awn);
  const scallops = []; for (let i = 0; i < 13; i++) { const s = new THREE.Mesh(new THREE.CircleGeometry(.4, 12, 0, Math.PI), new THREE.MeshLambertMaterial({ color: i % 2 ? '#fff' : TT.red, side: THREE.DoubleSide })); s.rotation.z = Math.PI; s.position.set(-4.8 + i * .8, 4.18, 2.58); scene.add(s); scallops.push(s); }
  const postMat = new THREE.MeshLambertMaterial({ map: stripe }); [-5, 5].forEach(x => { const p = new THREE.Mesh(new THREE.BoxGeometry(.5, 5, .5), postMat); p.position.set(x, 2.3, 2.4); scene.add(p); const side = new THREE.Mesh(new THREE.BoxGeometry(.2, 5, 4.2), new THREE.MeshLambertMaterial({ color: '#5a1a1a' })); side.position.set(x, 2.3, .3); scene.add(side); });
  const counter = new THREE.Mesh(new THREE.BoxGeometry(10, 1, .9), new THREE.MeshLambertMaterial({ map: canvasTex(256, 32, (c, w, h) => { c.fillStyle = TT.blue; c.fillRect(0, 0, w, h); c.fillStyle = TT.yellow; for (let i = 0; i < 10; i++) { starPath(c, 14 + i * 26, h / 2, 8); c.fill(); } }) })); counter.position.set(0, .5, 2.6); scene.add(counter);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 12), new THREE.MeshLambertMaterial({ color: '#2a1a10' })); floor.rotation.x = -Math.PI / 2; floor.position.z = 1; scene.add(floor);
  const bulbs = []; for (let i = 0; i < 18; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff3b0' })); const u = i / 17; b.position.set(-4.7 + u * 9.4, 3.95, 2.5); scene.add(b); bulbs.push(b); }
  const sq = new THREE.Group(), nozzle = new THREE.Mesh(new THREE.CylinderGeometry(.08, .14, .9, 12), new THREE.MeshLambertMaterial({ color: TT.green })); nozzle.rotation.x = Math.PI / 2; sq.add(nozzle); const tank = new THREE.Mesh(new THREE.SphereGeometry(.28, 14, 10), new THREE.MeshLambertMaterial({ color: TT.yellow })); tank.position.set(0, .18, .4); sq.add(tank); sq.scale.setScalar(.7); sq.position.set(0, .8, 5.5); scene.add(sq);
  /* targets */
  const duckTex = gold => canvasTex(128, 128, (c, w, h) => {
    const body = gold ? '#FFC83D' : '#FFD60A', dark = gold ? '#c98a00' : '#e0a800';
    c.fillStyle = body; c.beginPath(); c.ellipse(64, 86, 46, 30, 0, 0, 7); c.fill(); c.beginPath(); c.arc(82, 46, 24, 0, 7); c.fill();
    c.fillStyle = dark; c.beginPath(); c.ellipse(52, 84, 22, 13, -.3, 0, 7); c.fill();
    c.fillStyle = TT.orange; c.beginPath(); c.moveTo(100, 46); c.lineTo(124, 52); c.lineTo(100, 58); c.fill();
    c.fillStyle = '#000'; c.beginPath(); c.arc(88, 40, 4.5, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(89.5, 38.5, 1.5, 0, 7); c.fill();
    c.strokeStyle = TT.red; c.lineWidth = 5; c.beginPath(); c.arc(64, 90, 14, 0, 7); c.stroke(); c.fillStyle = TT.red; c.beginPath(); c.arc(64, 90, 5, 0, 7); c.fill();
    if (gold) { c.fillStyle = '#fff'; [[30, 30], [110, 20], [20, 70]].forEach(([x, y]) => { starPath(c, x, y, 8); c.fill(); }); }
  });
  const DUCK = duckTex(false), GOLD = duckTex(true), waveTex = canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#1f6fe0'; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 4) c.lineTo(x, 16 + Math.sin(x / 16) * 9); c.lineTo(w, h); c.fill(); c.strokeStyle = '#9fd0ff'; c.lineWidth = 4; c.beginPath(); for (let x = 0; x <= w; x += 4) c.lineTo(x, 16 + Math.sin(x / 16) * 9); c.stroke(); });
  waveTex.wrapS = THREE.RepeatWrapping; waveTex.repeat.set(3, 1);
  let rows = [], balloons = [], pops = [], cans = [], drops = [], L = 1, t = 0, popT = 2, combo = 0, canGrp = null;
  const targets = () => [...rows.flatMap(r => r.ducks.filter(d => d.up).map(d => d.mesh)), ...balloons.filter(b => !b.hit).map(b => b.mesh), ...pops.filter(p => p.up > .7 && !p.hit).map(p => p.spr), ...cans.filter(c => !c.hit).map(c => c.mesh)];
  const clear = () => { rows.forEach(r => scene.remove(r.grp)); balloons.forEach(b => scene.remove(b.mesh, b.str)); pops.forEach(p => scene.remove(p.spr)); cans.forEach(c => scene.remove(c.mesh)); if (canGrp) scene.remove(canGrp); rows = []; balloons = []; pops = []; cans = []; canGrp = null; };
  function makeDuck(row, x) {
    const piv = new THREE.Group(), gold = Math.random() < (LV[L].gold || 0), mesh = new THREE.Mesh(new THREE.PlaneGeometry(.95, .95), new THREE.MeshBasicMaterial({ map: gold ? GOLD : DUCK, transparent: true, alphaTest: .2, side: THREE.DoubleSide })); mesh.position.y = .45; piv.add(mesh); piv.position.x = x; row.grp.add(piv);
    const d = { piv, mesh, up: true, rot: 0, gold, x, row }; mesh.userData.t = { kind: 'duck', d }; return d;
  }
  function build() {
    clear(); const c = LV[L];
    c.rows.forEach(rc => {
      const grp = new THREE.Group(); grp.position.set(0, rc.y, rc.z); scene.add(grp); const row = { ...rc, grp, ducks: [] };
      const rail = new THREE.Mesh(new THREE.BoxGeometry(10, .08, .1), new THREE.MeshLambertMaterial({ color: '#888' })); grp.add(rail);
      for (let i = 0; i < 7; i++) row.ducks.push(makeDuck(row, -4.8 + i * 1.6));
      const wave = new THREE.Mesh(new THREE.PlaneGeometry(10, .55), new THREE.MeshBasicMaterial({ map: waveTex, transparent: true })); wave.position.set(0, .05, .12); grp.add(wave); row.wave = wave; rows.push(row);
    });
    if (c.balloons) for (let i = 0; i < 4; i++) spawnBalloon(rand(-3.6, 3.6), rand(.5, 3.5));
    if (c.pops) [-3, -1, 1, 3].forEach(x => { const who = pick(CAST_IDS.filter(n => n !== 'dino')), spr = castSprite(who, 1.1); spr.position.set(x, -1.1, 1.9); scene.add(spr); const p = { spr, who, up: 0, want: 0, hit: false, x }; spr.userData.t = { kind: 'pop', p }; pops.push(p); });
    if (c.cans) buildCans();
    scene.background = new THREE.Color(c.night ? '#05030f' : '#2a1650'); renderBulbs();
  }
  function buildCans() {
    if (canGrp) scene.remove(canGrp); canGrp = new THREE.Group(); scene.add(canGrp); cans = [];
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.8, .08, .5), new THREE.MeshLambertMaterial({ color: '#8B5A3C' })); const sy = rows.length > 2 ? 3.95 : 3.15; shelf.position.set(3.4, sy, -.9); canGrp.add(shelf);
    const canTex = canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#ddd'; c.fillRect(0, 0, w, h); c.fillStyle = TT.red; c.fillRect(0, 18, w, 28); c.fillStyle = TT.yellow; c.font = `bold 18px ${PXF}`; c.textAlign = 'center'; c.fillText('POP', w / 2, 39); });
    [[0, 0], [1, 0], [2, 0], [.5, 1], [1.5, 1], [1, 2]].forEach(([i, j]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .36, 14), new THREE.MeshStandardMaterial({ map: canTex, metalness: .4, roughness: .4 })); m.position.set(3.4 - .38 + i * .38, sy + .22 + j * .37, -.9); canGrp.add(m); const cn = { mesh: m, hit: false, v: new THREE.Vector3(), spin: 0 }; m.userData.t = { kind: 'can', cn }; cans.push(cn); });
  }
  function spawnBalloon(x, y) { const col = pick([TT.red, TT.blue, TT.green, TT.pink, TT.purple, TT.orange]), mesh = new THREE.Mesh(new THREE.SphereGeometry(.3, 14, 12), new THREE.MeshLambertMaterial({ color: col })); mesh.scale.y = 1.2; mesh.position.set(x, y, -.9); const str = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .7), new THREE.MeshBasicMaterial({ color: '#ddd' })); str.position.set(x, y - .7, -.9); scene.add(mesh, str); const b = { mesh, str, hit: false, col, ph: rand(0, 6) }; mesh.userData.t = { kind: 'balloon', b }; balloons.push(b); }
  function renderBulbs() { bulbs.forEach((b, i) => b.material.color.set(((i + Math.floor(t * 4)) % 3 === 0) ? TT.yellow : LV[L].night ? '#ffb3d9' : '#fff3b0')); }
  /* aim + squirt */
  let aimX = 0, aimY = 0;
  const moveReticle = (x, y) => { const r = g.stage.getBoundingClientRect(); aimX = clamp(x, r.left, r.right); aimY = clamp(y, r.top, r.bottom); reticle.style.left = (aimX - r.left) + 'px'; reticle.style.top = (aimY - r.top) + 'px'; reticle.classList.add('on'); };
  function screenOf(obj) { const v = new THREE.Vector3(); obj.getWorldPosition(v); if (obj.isSprite) v.y += (obj.userData.h || 1) * .5; v.project(cam); const b = V.el.getBoundingClientRect(); return { x: b.left + (v.x + 1) / 2 * b.width, y: b.top + (1 - v.y) / 2 * b.height }; }
  function fire(cx, cy) {
    const e = { clientX: cx, clientY: cy }, list = targets(); let hit = V.hit(e, list)[0], obj = hit && hit.object, pt = hit && hit.point;
    if (!obj) { let best = null, bd = Math.min(V.el.clientWidth, V.el.clientHeight) * (L <= 2 ? .1 : .07); list.forEach(o => { const s = screenOf(o), d = Math.hypot(s.x - cx, s.y - cy); if (d < bd) { bd = d; best = o; } }); if (best) { obj = best; pt = new THREE.Vector3(); best.getWorldPosition(pt); } }
    if (!pt) { const b = V.el.getBoundingClientRect(), ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2((cx - b.left) / b.width * 2 - 1, -(cy - b.top) / b.height * 2 + 1), cam); pt = ray.ray.at(8, new THREE.Vector3()); }
    const start = new THREE.Vector3(0, .75, 5.1), m = new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 8), new THREE.MeshBasicMaterial({ color: '#7fd8ff', transparent: true, opacity: .85 })); m.position.copy(start); scene.add(m);
    drops.push({ m, start, end: pt.clone(), t: 0, dur: .22 + start.distanceTo(pt) * .015, obj }); noise(.12, .14, 'bandpass', 1800, 0, 2); sq.lookAt(pt);
  }
  function splash(p, col = '#7fd8ff') { for (let i = 0; i < 8; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(.04, 6, 4), new THREE.MeshBasicMaterial({ color: col })); d.position.copy(p); scene.add(d); drops.push({ m: d, v: new THREE.Vector3(rand(-2, 2), rand(1, 3), rand(-.5, 1.5)), life: .5 }); } }
  function scored(n, sx, sy) { combo++; g.star(n, sx, sy); H.happy(); if (combo % 5 === 0) { label(`🔥 ${combo}!`); SFX.chime(); } if (g.progress()) { label('WINNER! 🧸'); confettiDOM(g, 50); g.after(1200, () => g.levelUp()); } }
  function resolve(dp) {
    const tgt = dp.obj && dp.obj.userData.t, s = screenOf(dp.m); splash(dp.end);
    if (!tgt) { noise(.08, .08, 'lowpass', 800); combo = 0; return; }
    if (tgt.kind === 'duck' && tgt.d.up) { const d = tgt.d; d.up = false; tone(d.gold ? 1200 : 700, .08, 'square', .06); sweep(900, 500, .15, 'triangle', .12, .05); if (d.gold) { secret('goldduck'); label('✨ GOLDEN DUCK! ✨'); scored(5, s.x, s.y); } else scored(1, s.x, s.y); }
    else if (tgt.kind === 'balloon' && !tgt.b.hit) { const b = tgt.b; b.hit = true; SFX.pop(); splash(b.mesh.position, b.col); scene.remove(b.mesh, b.str); scored(1, s.x, s.y); g.after(1500, () => { balloons = balloons.filter(x => x !== b); if (LV[L].balloons) spawnBalloon(rand(-3.6, 3.6), -.5); }); }
    else if (tgt.kind === 'pop' && !tgt.p.hit) { const p = tgt.p; p.hit = true; p.spr.material.map = castTex(p.who, 'happy'); SFX.boing(); scored(1, s.x, s.y); g.after(500, () => { p.want = 0; }); }
    else if (tgt.kind === 'can' && !tgt.cn.hit) { const cn = tgt.cn; cn.hit = true; cn.v.set(rand(-1.5, 1.5), rand(2, 3.5), rand(-2.5, -1)); cn.spin = rand(-8, 8); SFX.clatter(); scored(1, s.x, s.y); if (cans.every(c => c.hit)) { label('🥫 ALL DOWN! +3'); g.star(3); g.after(2200, () => { if (LV[L].cans && g.alive()) buildCans(); }); } }
  }
  g.on(g.stage, 'pointermove', e => moveReticle(e.clientX, e.clientY));
  g.on(V.el, 'pointerdown', e => { moveReticle(e.clientX, e.clientY); fire(e.clientX, e.clientY); });
  g.key = e => {
    const r = g.stage.getBoundingClientRect(), st = r.width * .04; if (!aimX) { aimX = r.left + r.width / 2; aimY = r.top + r.height / 2; }
    if (e.key === 'ArrowLeft') moveReticle(aimX - st, aimY); if (e.key === 'ArrowRight') moveReticle(aimX + st, aimY); if (e.key === 'ArrowUp') moveReticle(aimX, aimY - st); if (e.key === 'ArrowDown') moveReticle(aimX, aimY + st);
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { if (!reticle.classList.contains('on')) moveReticle(aimX, aimY); fire(aimX, aimY); }
  };
  g.levels(5, lv => { L = lv; combo = 0; g.meter(LV[lv].n); build(); H.bubble('💦 🦆'); });
  g.loop(dt => {
    t += dt; if ((t * 4 | 0) !== ((t - dt) * 4 | 0)) renderBulbs();
    rows.forEach(r => { r.wave.material.map.offset.x = (t * .15 * r.dir) % 1; r.ducks.forEach(d => {
      d.x += r.sp * r.dir * dt; if (d.x > 5.6) { d.x -= 11.2; d.up = true; } if (d.x < -5.6) { d.x += 11.2; d.up = true; }
      if (d.x > 5.2 || d.x < -5.2) { const gold = Math.random() < (LV[L].gold || 0); if (gold !== d.gold) { d.gold = gold; d.mesh.material.map = gold ? GOLD : DUCK; } }
      d.piv.position.x = d.x; d.piv.position.y = Math.sin(t * 5 + d.x) * .04; d.rot = lerp(d.rot, d.up ? 0 : -Math.PI / 2, Math.min(1, dt * 10)); d.piv.rotation.x = d.rot; }); });
    balloons.forEach(b => { if (b.hit) return; b.mesh.position.y += dt * .35; b.mesh.position.x += Math.sin(t + b.ph) * dt * .2; b.str.position.set(b.mesh.position.x, b.mesh.position.y - .7, -.9); if (b.mesh.position.y > 4.2) { b.mesh.position.y = -.4; } });
    if (LV[L].pops) { popT -= dt; if (popT <= 0) { popT = rand(1.4, 2.6) - L * .15; const p = pick(pops.filter(q => q.want === 0)); if (p) { p.want = 1; p.hit = false; p.who = pick(CAST_IDS.filter(n => n !== 'dino')); p.spr.material.map = castTex(p.who); g.after(1800 - L * 120, () => { p.want = 0; }); } } }
    pops.forEach(p => { p.up = lerp(p.up, p.want, Math.min(1, dt * 9)); p.spr.position.y = -1.1 + p.up * 2.15; });
    cans.forEach(c => { if (!c.hit) return; c.v.y -= 9 * dt; c.mesh.position.addScaledVector(c.v, dt); c.mesh.rotation.z += c.spin * dt; if (c.mesh.position.y < -2) c.mesh.visible = false; });
    drops = drops.filter(d => {
      if (d.v) { d.life -= dt; d.v.y -= 9 * dt; d.m.position.addScaledVector(d.v, dt); if (d.life <= 0) { scene.remove(d.m); return false; } return true; }
      d.t += dt; const u = Math.min(1, d.t / d.dur); d.m.position.lerpVectors(d.start, d.end, u); d.m.position.y += Math.sin(u * Math.PI) * .5;
      if (u >= 1) { scene.remove(d.m); resolve(d); return false; } return true;
    });
    V.render();
  });
});
