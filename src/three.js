/* ═════════ 3D ═════════ */
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return new THREE.CanvasTexture(c); }
function overlayLabel(g) { const el = mk('div', 'olabel'); g.stage.appendChild(el); return txt => { el.textContent = txt || ''; el.classList.toggle('on', !!txt); if (txt) retrigger(el, 'pop'); }; }

/* SPACE — the solar system; tap a planet or a button to fly to it */
game('space', '3d', '🪐', g => {
  const H = g.host('robo'); let qT = -1; const seen = new Set();
  const V = g.three({ fov: 55, far: 4000 }), { scene, cam } = V;
  scene.background = new THREE.Color('#000004');
  scene.add(new THREE.AmbientLight(0xffffff, .3)); scene.add(new THREE.PointLight(0xffffff, 1.7, 0, 0));
  { const geo = new THREE.BufferGeometry(), pos = new Float32Array(2500 * 3); for (let i = 0; i < 2500; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(rand(700, 1500)); pos.set([v.x, v.y, v.z], i * 3); } geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.7, sizeAttenuation: false }))); }
  const earthTex = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#1f5fd6'; c.fillRect(0, 0, w, h); c.fillStyle = '#2fae4f'; for (let i = 0; i < 16; i++) { c.beginPath(); c.ellipse(rand(0, w), rand(18, h - 18), rand(8, 30), rand(5, 18), rand(0, 3), 0, 7); c.fill(); } c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(0, 0, w, 9); c.fillRect(0, h - 9, w, 9); c.fillStyle = 'rgba(255,255,255,.4)'; for (let i = 0; i < 12; i++) c.fillRect(rand(0, w), rand(10, h - 10), rand(20, 50), 3); });
  const jupTex = canvasTex(64, 128, (c, w, h) => { const b = ['#d9a066', '#b07a4a', '#f2d2a0', '#c88b55', '#e8c08a', '#9c6a40']; for (let y = 0; y < h; y += 8) { c.fillStyle = b[(y / 8) % b.length]; c.fillRect(0, y, w, 8); } c.fillStyle = '#b5482a'; c.beginPath(); c.ellipse(40, 80, 9, 5, 0, 0, 7); c.fill(); });
  const PL = [{ r: 2.6, d: 0, sp: 0, c: '#FFD60A' }, { r: .35, d: 5, sp: 1.6, c: '#a39e96' }, { r: .55, d: 7, sp: 1.2, c: '#e8c27a' }, { r: .6, d: 9.3, sp: 1, tex: earthTex }, { r: .45, d: 11.6, sp: .8, c: '#d4532b' },
    { r: 1.5, d: 15.2, sp: .45, tex: jupTex }, { r: 1.25, d: 19.4, sp: .35, c: '#e3c98a', ring: true }, { r: .9, d: 23, sp: .25, c: '#8fdde6' }, { r: .88, d: 26.2, sp: .2, c: '#3B62FF' }];
  const meshes = [], pivots = [];
  PL.forEach((p, i) => {
    const geo = new THREE.SphereGeometry(p.r, 40, 28);
    const mat = i === 0 ? new THREE.MeshBasicMaterial({ color: p.c }) : new THREE.MeshLambertMaterial(p.tex ? { map: p.tex } : { color: p.c });
    const m = new THREE.Mesh(geo, mat); m.userData.i = i;
    const pv = new THREE.Object3D(); pv.rotation.y = rand(0, 7); pv.add(m); m.position.x = p.d; scene.add(pv); meshes.push(m); pivots.push(pv);
    if (p.d) { const pts = []; for (let k = 0; k <= 96; k++) { const a = k / 96 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * p.d, 0, Math.sin(a) * p.d)); } scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x2a2a2a }))); }
    if (p.ring) { const rg = new THREE.Mesh(new THREE.RingGeometry(p.r * 1.4, p.r * 2.3, 64), new THREE.MeshBasicMaterial({ color: '#cdb27a', side: THREE.DoubleSide, transparent: true, opacity: .75 })); rg.rotation.x = -Math.PI / 2 + .35; m.add(rg); }
  });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 128, (c, w) => { const gr = c.createRadialGradient(64, 64, 10, 64, 64, 64); gr.addColorStop(0, 'rgba(255,214,10,.9)'); gr.addColorStop(.4, 'rgba(255,140,30,.35)'); gr.addColorStop(1, 'rgba(255,100,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); }), blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.set(13, 13, 1); scene.add(glow);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(.16, 16, 12), new THREE.MeshLambertMaterial({ color: '#cfcfcf' })); meshes[3].add(moon);
  const label = overlayLabel(g);
  let focus = -1;
  const O = orbit(g, cam, V.el, { az: .4, el: .55, dist: 46, minD: 2, maxD: 90, onTap: e => { const hit = V.hit(e, meshes); focusOn(hit.length ? hit[0].object.userData.i ?? hit[0].object.parent.userData.i : -1); } });
  const bar = mk('div', 'bbar planets'); g.stage.appendChild(bar);
  PL.forEach((p, i) => { const b = mk('button', 'pdot'); b.style.background = i === 3 ? 'radial-gradient(circle at 35% 35%,#2fae4f 0 30%,#1f5fd6 31%)' : i === 5 ? 'repeating-linear-gradient(#d9a066 0 6px,#b07a4a 6px 12px)' : p.c; b.style.setProperty('--s', (.6 + Math.sqrt(p.r) * .5).toFixed(2)); b.addEventListener('click', () => focusOn(i)); bar.appendChild(b); });
  function focusOn(i) {
    focus = i; $$('.pdot', bar).forEach((b, k) => b.classList.toggle('sel', k === i));
    if (i < 0) { label(''); return; }
    SFX.whoosh(); const name = T().planets[i]; label(name.toUpperCase()); say(cap(name) + '!', lang, null, 'robo', H.el);
    if (g.lvl() === 1) { if (!seen.has(i)) { seen.add(i); g.star(1); if (g.progress()) g.after(1600, () => g.levelUp()); } }
    else if (qT >= 0) { if (i === qT) { H.happy(); SFX.chime(); g.star(1); qT = -1; if (g.progress()) g.after(1600, () => g.levelUp()); else g.after(2400, ask); } else H.mood('oops'); }
  }
  const ask = () => { qT = randi(0, 8); focus = -1; label(''); $$('.pdot', bar).forEach(b => b.classList.remove('sel')); H.say(L[lang].whereIs(T().planets[qT]), 'talk', lang, 0, CARD.dot(PL[qT].c || (qT === 3 ? '#1f5fd6' : '#d9a066'), '🔎')); };
  g.levels(2, lv => { seen.clear(); qT = -1; g.meter(6); focus = -1; label(''); if (lv === 2) g.after(700, ask); else H.bubble('👆 🪐'); });
  g.key = e => { if (/^[0-8]$/.test(e.key)) focusOn(+e.key); if (e.key === 'Escape' || e.key === ' ') focusOn(-1); };
  const wp = new THREE.Vector3();
  g.loop(dt => {
    PL.forEach((p, i) => { pivots[i].rotation.y += p.sp * dt * .12; meshes[i].rotation.y += dt * .4; });
    moon.position.set(Math.cos(performance.now() / 900) * 1.1, 0, Math.sin(performance.now() / 900) * 1.1);
    if (focus >= 0) { meshes[focus].getWorldPosition(wp); O.target.lerp(wp, Math.min(1, dt * 3)); O.dist = lerp(O.dist, PL[focus].r * 5.5 + 2, Math.min(1, dt * 2)); }
    else { O.target.lerp(new THREE.Vector3(), Math.min(1, dt * 2)); O.dist = lerp(O.dist, 46, Math.min(1, dt * 1.2)); if (!O.dragging()) O.az += dt * .04; }
    O.apply(); V.render();
  });
});

/* BLOCKS — tap to build in 3D, drag to look around */
game('blocks', '3d', '🧱', g => {
  const H = g.host('robo');
  const V = g.three({ fov: 45 }), { scene, cam } = V;
  scene.background = new THREE.Color('#05081a');
  scene.add(new THREE.HemisphereLight(0xffffff, 0x334466, .9)); const dl = new THREE.DirectionalLight(0xffffff, .6); dl.position.set(8, 14, 6); scene.add(dl);
  const N = 12, base = new THREE.Mesh(new THREE.BoxGeometry(N, .4, N), new THREE.MeshLambertMaterial({ color: '#1a7a3c' })); base.position.y = -.2; scene.add(base);
  const grid = new THREE.GridHelper(N, N, 0x0f4d24, 0x0f4d24); grid.position.y = .002; scene.add(grid);
  const geo = new THREE.BoxGeometry(1, 1, 1), edges = new THREE.EdgesGeometry(geo), mats = {}, lineMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: .35 });
  const matFor = c => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c }));
  const blocks = new Map(); let anims = [], color = TT.red, erase = false;
  const wpos = (cx, cy, cz) => new THREE.Vector3(cx - N / 2 + .5, cy + .5, cz - N / 2 + .5);
  function add(cx, cy, cz, c, quiet) {
    const k = `${cx},${cy},${cz}`; if (blocks.has(k) || cx < 0 || cz < 0 || cx >= N || cz >= N || cy < 0 || cy > 14) return;
    const m = new THREE.Mesh(geo, matFor(c)); m.add(new THREE.LineSegments(edges, lineMat)); const p = wpos(cx, cy, cz);
    m.position.set(p.x, p.y + 3, p.z); m.userData = { k, cx, cy, cz }; scene.add(m); blocks.set(k, m); anims.push({ m, t: 0, y1: p.y, kind: 'drop' });
    if (!quiet) { tone(PENTA[cy % PENTA.length], .25, 'triangle', .18, .18); noise(.06, .15, 'lowpass', 400, .3); }
    const gh = ghosts.get(k);
    if (gh) {
      if (g.lvl() === 3 && gh.userData.c !== c) { g.after(450, () => { remove(m); H.mood('oops'); SFX.bad(); }); return; }
      scene.remove(gh); ghosts.delete(k); H.mood('happy', 400);
      if (!ghosts.size) { g.star(2); SFX.chime(); H.happy(pick(T().yes)); g.after(2400, () => { if (g.progress()) g.levelUp(); else blueprint(); }); }
    }
  }
  const ghosts = new Map(), ghostEdge = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .7 });
  const BP = [[[0,0,0],[0,1,0],[0,2,0]], [[0,0,0],[1,0,0],[2,0,0],[0,1,0],[1,1,0],[2,1,0]], [[0,0,0],[1,0,0],[1,1,0],[2,0,0],[2,1,0],[2,2,0]], [[0,0,0],[2,0,0],[0,1,0],[1,1,0],[2,1,0]],
    [[1,0,1],[0,0,1],[2,0,1],[1,0,0],[1,0,2],[1,1,1],[1,2,1]], [[0,0,0],[1,0,0],[0,0,1],[1,0,1],[0,1,0],[1,1,0],[0,1,1],[1,1,1]], [[0,0,0],[0,1,0],[0,2,0],[1,2,0],[2,2,0],[2,1,0],[2,0,0]]];
  let bpI = 0;
  function clearAll() { [...blocks.values()].forEach(m => { scene.remove(m); }); blocks.clear(); ghosts.forEach(gh => scene.remove(gh)); ghosts.clear(); }
  function blueprint() {
    clearAll(); const bp = BP[bpI++ % BP.length], cols = shuffle(COLORS);
    bp.forEach(([x, y, z], i) => { const cx = 4 + x, cy = y, cz = 5 + z, c = g.lvl() === 3 ? cols[(x + z * 2 + y) % 4] : TT.white, p = wpos(cx, cy, cz);
      const gh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .25, depthWrite: false })); gh.add(new THREE.LineSegments(edges, ghostEdge)); gh.position.copy(p); gh.userData.c = c; scene.add(gh); ghosts.set(`${cx},${cy},${cz}`, gh); });
    H.say(L[lang].build, 'talk', lang, 0, CARD.emoji('🧱', '👻'));
  }
  function remove(m) { blocks.delete(m.userData.k); anims.push({ m, t: 0, kind: 'pop' }); SFX.pop(); }

  const O = orbit(g, cam, V.el, { az: .7, el: .62, dist: 21, target: new THREE.Vector3(0, 1, 0), minEl: .15, maxEl: 1.35, minD: 8, maxD: 40, onTap: e => {
    const hit = V.hit(e, [base, ...blocks.values()]).find(h => h.object === base || h.object.userData.k); if (!hit) return;
    const o = hit.object;
    if (o === base) { if (erase) return; add(Math.floor(hit.point.x + N / 2), 0, Math.floor(hit.point.z + N / 2), color); return; }
    if (erase) { remove(o); return; }
    const n = hit.face.normal; add(o.userData.cx + Math.round(n.x), o.userData.cy + Math.round(n.y), o.userData.cz + Math.round(n.z), color);
  } });
  const bar = mk('div', 'bbar'); g.stage.appendChild(bar);
  const sel = b => { $$('.swatch', bar).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); };
  [...COLORS, TT.white, '#222222'].forEach(c => { const b = mk('button', 'swatch' + (c === color ? ' sel' : '')); b.style.background = c; b.addEventListener('click', () => { color = c; erase = false; sel(b); SFX.tap(); }); bar.appendChild(b); });
  bar.appendChild(mk('span', 'gap'));
  const er = mk('button', 'swatch', '🧽'); er.addEventListener('click', () => { erase = true; sel(er); SFX.tap(); }); bar.appendChild(er);
  const cl = mk('button', 'swatch', '🗑️'); cl.addEventListener('click', () => { [...blocks.values()].forEach(m => remove(m)); SFX.whoosh(); }); bar.appendChild(cl);
  g.levels(3, lv => { clearAll(); if (lv === 1) { g.meter(0); [[5, 0, 5, TT.red], [6, 0, 5, TT.yellow], [5, 1, 5, TT.blue]].forEach(([a, b, c, d]) => add(a, b, c, d, true)); H.bubble('👆 🧱'); } else { g.meter(4); blueprint(); } });
  g.loop(dt => {
    anims = anims.filter(a => {
      a.t += dt;
      if (a.kind === 'drop') { const k = Math.min(1, a.t / .4), b = k < 1 ? 1 - Math.abs(Math.cos(k * Math.PI * 1.5)) * (1 - k) : 1; a.m.position.y = lerp(a.y1 + 3, a.y1, Math.min(1, k * 1.3)) + (k < 1 ? (1 - b) * .15 : 0); return k < 1; }
      const s = Math.max(.001, 1 - a.t / .25); a.m.scale.setScalar(s); if (s <= .001) { scene.remove(a.m); return false; } return true;
    });
    O.apply(); V.render();
  });
});

/* DRIVE — tap the ground to drive there; collect stars */
game('drive', '3d', '🚗', g => {
  const H = g.host('foxy'); const houses = []; let pkg = -1, pkgMesh = null, wrongT = 0;
  const V = g.three({ fov: 55, far: 400 }), { scene, cam } = V;
  scene.background = new THREE.Color('#7ec8ff'); scene.fog = new THREE.Fog('#7ec8ff', 40, 110);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a6a30, .9)); const sun = new THREE.DirectionalLight(0xffffff, .7); sun.position.set(20, 40, 10); scene.add(sun);
  const R = 38, ground = new THREE.Mesh(new THREE.CircleGeometry(R + 30, 64), new THREE.MeshLambertMaterial({ color: '#2fa84f' })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const road = new THREE.Mesh(new THREE.RingGeometry(16, 20, 72), new THREE.MeshLambertMaterial({ color: '#444' })); road.rotation.x = -Math.PI / 2; road.position.y = .02; scene.add(road);
  for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2, d = new THREE.Mesh(new THREE.PlaneGeometry(.3, 1.3), new THREE.MeshBasicMaterial({ color: TT.yellow })); d.rotation.x = -Math.PI / 2; d.rotation.z = -a; d.position.set(Math.cos(a) * 18, .03, Math.sin(a) * 18); scene.add(d); }
  const solids = [];
  const tree = (x, z) => { const t = new THREE.Group(); const tr = new THREE.Mesh(new THREE.CylinderGeometry(.18, .25, 1, 8), new THREE.MeshLambertMaterial({ color: '#6b4220' })); tr.position.y = .5; const top = new THREE.Mesh(new THREE.ConeGeometry(1, 2.2, 8), new THREE.MeshLambertMaterial({ color: pick(['#167a36', '#1e9a44', '#0f6a2c']) })); top.position.y = 2; t.add(tr, top); t.position.set(x, 0, z); scene.add(t); solids.push({ x, z, r: .8 }); };
  const house = (x, z, ci) => { const hz = new THREE.Group(), c = COLORS[ci]; houses.push({ x, z, ci }); const b = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2, 2.6), new THREE.MeshLambertMaterial({ color: c })); b.position.y = 1; const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.6, 4), new THREE.MeshLambertMaterial({ color: '#7a2a1a' })); roof.position.y = 2.8; roof.rotation.y = Math.PI / 4; const door = new THREE.Mesh(new THREE.BoxGeometry(.6, 1, .05), new THREE.MeshLambertMaterial({ color: '#3a2412' })); door.position.set(0, .5, 1.31); hz.add(b, roof, door); hz.position.set(x, 0, z); hz.rotation.y = Math.atan2(-x, -z); scene.add(hz); solids.push({ x, z, r: 2 }); };
  const free = (x, z, r) => { const d = Math.hypot(x, z); return d < R - 2 && (d < 14 || d > 22) && Math.hypot(x, z - 0) > 6 && solids.every(s => Math.hypot(s.x - x, s.z - z) > s.r + r); };
  for (let i = 0; i < 7; i++) { for (let k = 0; k < 60; k++) { const a = i / 7 * Math.PI * 2 + rand(-.3, .3), d = rand(24, R - 4), x = Math.cos(a) * d, z = Math.sin(a) * d; if (free(x, z, 3)) { house(x, z, i); break; } } }
  for (let i = 0; i < 46; i++) { for (let k = 0; k < 30; k++) { const x = rand(-R, R), z = rand(-R, R); if (free(x, z, 1.2)) { tree(x, z); break; } } }
  const starShape = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? .3 : .7, a = i / 10 * Math.PI * 2 + Math.PI / 2; i ? starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: .2, bevelEnabled: false }); starGeo.center();
  const starMat = new THREE.MeshLambertMaterial({ color: TT.yellow, emissive: '#806000' });
  const stars = []; const placeStar = s => { for (let k = 0; k < 50; k++) { const x = rand(-R + 3, R - 3), z = rand(-R + 3, R - 3); if (Math.hypot(x, z) < R - 3 && solids.every(o => Math.hypot(o.x - x, o.z - z) > o.r + 1)) { s.position.set(x, 1.2, z); return; } } };
  for (let i = 0; i < 10; i++) { const s = new THREE.Mesh(starGeo, starMat); placeStar(s); scene.add(s); stars.push(s); }
  const car = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, .55, 2.3), new THREE.MeshLambertMaterial({ color: TT.red })); body.position.y = .55;
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.15, .55, 1.1), new THREE.MeshLambertMaterial({ color: TT.white })); cab.position.set(0, 1.05, -.2);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.6, .45, .45), new THREE.MeshLambertMaterial({ color: TT.blue })); head.position.set(0, 1.55, -.2);
  const eyeM = new THREE.MeshBasicMaterial({ color: TT.white }); [-.13, .13].forEach(x => { const e = new THREE.Mesh(new THREE.BoxGeometry(.12, .12, .02), eyeM); e.position.set(x, 1.6, .03); car.add(e); });
  const bulb = new THREE.Mesh(new THREE.BoxGeometry(.14, .14, .14), new THREE.MeshBasicMaterial({ color: TT.red })); bulb.position.set(0, 1.92, -.2);
  [-.4, .4].forEach(x => { const l = new THREE.Mesh(new THREE.BoxGeometry(.25, .15, .05), new THREE.MeshBasicMaterial({ color: TT.yellow })); l.position.set(x, .6, 1.16); car.add(l); });
  const wheels = []; [[-.72, .7], [.72, .7], [-.72, -.75], [.72, -.75]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, .25, 16), new THREE.MeshLambertMaterial({ color: '#111' })); w.rotation.z = Math.PI / 2; w.position.set(x, .32, z); car.add(w); wheels.push(w); });
  car.add(body, cab, head, bulb); car.position.set(0, 0, 18); scene.add(car);
  const marker = new THREE.Mesh(new THREE.RingGeometry(.6, .9, 24), new THREE.MeshBasicMaterial({ color: TT.yellow, transparent: true, opacity: .9 })); marker.rotation.x = -Math.PI / 2; marker.visible = false; scene.add(marker);
  let heading = Math.PI / 2, v = 0, target = null, holding = false;
  pkgMesh = new THREE.Mesh(new THREE.BoxGeometry(.8, .6, .8), new THREE.MeshLambertMaterial({ color: TT.white })); pkgMesh.position.set(0, 1.25, -1.1); car.add(pkgMesh);
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(.82, .62, .12), new THREE.MeshLambertMaterial({ color: TT.white })); pkgMesh.add(ribbon);
  const newPkg = () => { pkg = pick(houses.filter(h => h.ci !== pkg)).ci; pkgMesh.material.color.set(COLORS[pkg]); pkgMesh.visible = true; H.say(L[lang].deliver(T().colors[pkg]), 'talk', lang, 0, CARD.color(pkg, '📦 → 🏠')); };
  g.levels(2, lv => { g.meter(lv === 1 ? 10 : 5); stars.forEach(s => s.visible = lv === 1); pkgMesh.visible = false; pkg = -1; if (lv === 2) g.after(500, newPkg); else H.bubble('👆 ⭐'); });
  const honk = mk('button', 'ovbtn honk', '📯'); g.stage.appendChild(honk); g.on(honk, 'pointerdown', e => { e.stopPropagation(); SFX.honk(); });
  const setTarget = e => { const h = V.hit(e, [ground, road]); if (h.length) { target = h[0].point.clone(); target.y = 0; marker.position.set(target.x, .05, target.z); marker.visible = true; } };
  g.on(V.el, 'pointerdown', e => { holding = true; setTarget(e); });
  g.on(V.el, 'pointermove', e => { if (holding) setTarget(e); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => g.on(V.el, ev, () => holding = false));
  const keys = new Set(); g.on(document, 'keydown', e => { keys.add(e.key); if (e.key === 'h') SFX.honk(); }); g.on(document, 'keyup', e => keys.delete(e.key));
  const camPos = new THREE.Vector3(0, 6, 26); let t = 0;
  g.loop(dt => {
    t += dt; let want = 0;
    const kb = keys.has('ArrowUp') || keys.has('ArrowDown') || keys.has('ArrowLeft') || keys.has('ArrowRight');
    if (kb) { target = null; marker.visible = false; if (keys.has('ArrowLeft')) heading += 2.2 * dt; if (keys.has('ArrowRight')) heading -= 2.2 * dt; want = keys.has('ArrowUp') ? 11 : keys.has('ArrowDown') ? -5 : 0; }
    else if (target) {
      const dx = target.x - car.position.x, dz = target.z - car.position.z, d = Math.hypot(dx, dz);
      if (d < 1.2) { target = null; marker.visible = false; }
      else { let diff = Math.atan2(dx, dz) - heading; diff = Math.atan2(Math.sin(diff), Math.cos(diff)); heading += clamp(diff, -2.6 * dt, 2.6 * dt); want = Math.abs(diff) > 1.6 ? 4 : Math.min(12, 3 + d * .8); }
    }
    v = lerp(v, want, Math.min(1, dt * 2.2));
    car.position.x += Math.sin(heading) * v * dt; car.position.z += Math.cos(heading) * v * dt;
    const dc = Math.hypot(car.position.x, car.position.z); if (dc > R) { car.position.multiplyScalar(R / dc); v *= .5; }
    for (const s of solids) { const dx = car.position.x - s.x, dz = car.position.z - s.z, d = Math.hypot(dx, dz), m = s.r + .9; if (d < m) { car.position.x = s.x + dx / d * m; car.position.z = s.z + dz / d * m; if (Math.abs(v) > 3) SFX.bump(); v *= .3; } }
    car.rotation.y = heading; wheels.forEach(w => w.rotation.x += v * dt / .32);
    body.position.y = .55 + Math.abs(Math.sin(t * 14)) * .03 * Math.min(1, Math.abs(v) / 6);
    bulb.material.color.set((t % 1) < .5 ? TT.red : TT.yellow);
    for (const s of stars) { if (!s.visible) continue; s.rotation.y += dt * 2; s.position.y = 1.2 + Math.sin(t * 2 + s.position.x) * .2; if (Math.hypot(s.position.x - car.position.x, s.position.z - car.position.z) < 1.6) { SFX.coin(); g.star(1); H.mood('happy', 500); placeStar(s); if (g.progress()) g.levelUp(); } }
    wrongT -= dt;
    if (g.lvl() === 2 && pkg >= 0 && pkgMesh.visible) for (const hs of houses) { const d = Math.hypot(hs.x - car.position.x, hs.z - car.position.z); if (d < 4.2) { if (hs.ci === pkg) { pkgMesh.visible = false; SFX.chime(); H.happy(); g.star(2); if (g.progress()) g.levelUp(); else g.after(1600, newPkg); break; } else if (wrongT <= 0) { wrongT = 3; H.mood('oops'); say(cap(T().colors[hs.ci]) + '?'); } } }
    marker.material.opacity = .5 + Math.sin(t * 6) * .4;
    const fwd = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading));
    camPos.lerp(car.position.clone().addScaledVector(fwd, -9).add(new THREE.Vector3(0, 6, 0)), Math.min(1, dt * 2.5));
    for (const s of solids) { const dx = camPos.x - s.x, dz = camPos.z - s.z, d = Math.hypot(dx, dz), m = s.r + 1.6; if (d < m && d > 0) { camPos.x = s.x + dx / d * m; camPos.z = s.z + dz / d * m; } }
    cam.position.copy(camPos); cam.lookAt(car.position.clone().addScaledVector(fwd, 3).add(new THREE.Vector3(0, 1, 0)));
    V.render();
  });
});

/* SPIN — 3D shapes: drag to spin, tap to change color, buttons switch shape */
game('spin', '3d', '🧊', g => {
  const H = g.host('robo'); const tried = new Set(); let quiz = null;
  const OBJ = [['🎲', 0], ['📦', 0], ['🧊', 0], ['⚽', 1], ['🏀', 1], ['🌍', 1], ['🍊', 1], ['🍦', 2], ['🥫', 3], ['🔋', 3], ['🥁', 3], ['🕯️', 3]];
  const V = g.three({ fov: 40 }), { scene, cam } = V;
  scene.background = new THREE.Color('#000');
  scene.add(new THREE.AmbientLight(0xffffff, .35));
  const key = new THREE.DirectionalLight(0xffffff, .9); key.position.set(4, 6, 8); scene.add(key);
  const rimB = new THREE.PointLight(TT.blue, 1.2, 30); rimB.position.set(-8, 2, -4); scene.add(rimB);
  const rimR = new THREE.PointLight(TT.red, 1, 30); rimR.position.set(8, -3, -4); scene.add(rimR);
  cam.position.set(0, 1.2, 10); cam.lookAt(0, 0, 0);
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, .25, 48), new THREE.MeshLambertMaterial({ color: '#141414' })); plat.position.y = -2.4; scene.add(plat);
  const ringCols = [TT.green, TT.blue, TT.red, TT.yellow]; ringCols.forEach((c, i) => { const seg = new THREE.Mesh(new THREE.TorusGeometry(3.3, .06, 6, 24, Math.PI / 2), new THREE.MeshBasicMaterial({ color: c })); seg.rotation.x = Math.PI / 2; seg.rotation.z = i * Math.PI / 2; seg.position.y = -2.27; scene.add(seg); });
  const GEOS = [() => new THREE.BoxGeometry(2.4, 2.4, 2.4), () => new THREE.SphereGeometry(1.6, 48, 32), () => new THREE.ConeGeometry(1.5, 2.8, 48), () => new THREE.CylinderGeometry(1.3, 1.3, 2.6, 48), () => { const gg = new THREE.ConeGeometry(1.8, 2.6, 4); gg.rotateY(Math.PI / 4); return gg; }];
  let mesh = null, si = 0, ci = 4, rx = .4, ry = .6, vx = 0, vy = .6, pop = 0;
  const mat = new THREE.MeshStandardMaterial({ color: COLORS[ci], roughness: .4, metalness: .1, flatShading: false });
  const label = overlayLabel(g);
  function setShape(i, speak = true) {
    si = i; if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); }
    mesh = new THREE.Mesh(GEOS[i](), mat); mat.flatShading = i === 0 || i === 4; mat.needsUpdate = true;
    if (i === 0 || i === 4) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5 })));
    scene.add(mesh); pop = 1; $$('.sbtn', bar).forEach((b, k) => b.classList.toggle('sel', k === i));
    if (speak && !quiz) { label(T().solids[i].toUpperCase()); say(cap(T().solids[i]) + '!', lang, null, 'robo', H.el); tone(PENTA[i + 3], .3, 'triangle', .2); }
    if (speak && g.lvl() === 1 && !tried.has(i)) { tried.add(i); g.star(1); if (g.progress()) g.after(1400, () => g.levelUp()); }
  }
  const card = mk('div', 'quizObj'); g.stage.appendChild(card);
  const askQ = () => { quiz = pick(OBJ.filter(o => !quiz || o[0] !== quiz[0])); card.textContent = quiz[0]; card.classList.add('on'); retrigger(card, 'pop'); label(''); H.say(L[lang].whatShape, 'talk', lang, 0, CARD.emoji(quiz[0], '?')); };
  const answerQ = i => { if (!quiz) return; if (i === quiz[1]) { const q = quiz; quiz = null; setShape(i, false); label(T().solids[i].toUpperCase()); SFX.chime(); H.happy(); g.star(1); say(cap(T().solids[i]) + '!', lang, null, 'robo', H.el); g.after(2200, () => { if (g.progress()) { card.classList.remove('on'); g.levelUp(); } else askQ(); }); } else { SFX.bad(); H.mood('oops'); say(cap(T().solids[i]) + '?'); } };
  const ICON = ['<polygon points="50,8 90,30 90,72 50,94 10,72 10,30" fill="#F2F2EE"/><polyline points="10,30 50,52 90,30" fill="none" stroke="#000" stroke-width="4"/><line x1="50" y1="52" x2="50" y2="94" stroke="#000" stroke-width="4"/>',
    '<circle cx="50" cy="50" r="42" fill="#F2F2EE"/>', '<polygon points="50,6 88,82 12,82" fill="#F2F2EE"/><ellipse cx="50" cy="82" rx="38" ry="10" fill="#F2F2EE"/>',
    '<rect x="16" y="18" width="68" height="64" fill="#F2F2EE"/><ellipse cx="50" cy="18" rx="34" ry="10" fill="#cfcfc8"/><ellipse cx="50" cy="82" rx="34" ry="10" fill="#F2F2EE"/>',
    '<polygon points="50,6 92,80 50,94 8,80" fill="#F2F2EE"/><line x1="50" y1="6" x2="50" y2="94" stroke="#000" stroke-width="4"/>'];
  const bar = mk('div', 'bbar'); g.stage.appendChild(bar);
  ICON.forEach((ic, i) => { const b = mk('button', 'swatch sbtn', `<svg viewBox="0 0 100 100">${ic}</svg>`); b.addEventListener('click', () => quiz ? answerQ(i) : setShape(i)); bar.appendChild(b); });
  let down = null;
  g.on(V.el, 'pointerdown', e => { down = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: false }; });
  g.on(V.el, 'pointermove', e => { if (!down) return; const dx = e.clientX - down.lx, dy = e.clientY - down.ly; down.lx = e.clientX; down.ly = e.clientY; if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10) down.moved = true; vy = dx * .3; vx = dy * .3; });
  g.on(V.el, 'pointerup', () => { if (down && !down.moved) { ci = (ci + 1) % COLORS.length; mat.color.set(COLORS[ci]); pop = 1; SFX.boing(); label(T().colors[ci].toUpperCase()); say(cap(T().colors[ci]) + '!'); } down = null; });
  g.key = e => { if (/^[1-5]$/.test(e.key)) setShape(+e.key - 1); if (e.key === ' ') { ci = (ci + 1) % COLORS.length; mat.color.set(COLORS[ci]); pop = 1; } };
  const cubes = []; for (let i = 0; i < 18; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(.18, .18, .18), new THREE.MeshBasicMaterial({ color: pick([TT.green, TT.blue, TT.red, TT.yellow, TT.white]) })); c.userData = { a: rand(0, 7), r: rand(4, 6), y: rand(-1.5, 2.5), s: rand(.2, .5) }; scene.add(c); cubes.push(c); }
  setShape(0, false);
  g.levels(2, lv => { tried.clear(); quiz = null; card.classList.remove('on'); g.meter(lv === 1 ? 5 : 6); if (lv === 2) g.after(500, askQ); else H.bubble('👆 🧊'); });
  g.loop(dt => {
    rx += vx * dt; ry += vy * dt; vx *= Math.exp(-1.5 * dt); vy = lerp(vy, down ? vy : .5, Math.min(1, dt * .8));
    pop = Math.max(0, pop - dt * 2.5); const s = 1 + Math.sin(pop * Math.PI) * .18;
    mesh.rotation.set(rx, ry, 0); mesh.scale.setScalar(s); mesh.position.y = Math.sin(performance.now() / 700) * .12;
    cubes.forEach(c => { c.userData.a += dt * c.userData.s; c.position.set(Math.cos(c.userData.a) * c.userData.r, c.userData.y, Math.sin(c.userData.a) * c.userData.r - 1); c.rotation.x += dt; c.rotation.y += dt; });
    V.render();
  });
});
