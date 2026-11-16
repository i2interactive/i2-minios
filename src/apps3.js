/* ═════════ NEW APPS · part 3 — band, sing, hide & seek, two players ═════════ */
const sf = n => 261.63 * 2 ** (n / 12);

/* BAND — the cast is a band; tap them to join in */
const BAND = [
  { e: '🎈', bpm: 104, ch: [[0, 0], [7, 0], [9, 1], [5, 0]], k: [0, 8], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], bass: [[0, 0], [6, 0], [8, 7], [12, 0]], keys: [4, 12], keyLen: .2,
    mel: [[12, null, 16, null, 19, 16, 14, 12], [11, null, 14, null, 19, null, 14, null], [12, null, 16, null, 21, 19, 16, null], [17, null, 16, 14, 12, null, null, null]] },
  { e: '🏝️', bpm: 84, ch: [[0, 0], [5, 0], [7, 0], [5, 0]], k: [8], s: [8], h: [2, 6, 10, 14], bass: [[0, 0], [3, 0], [6, 7], [10, 12], [12, 7]], keys: [4, 12], keyLen: .12,
    mel: [[16, null, 16, 19, null, 16, 14, 12], [17, null, 17, 21, null, 17, 16, 14], [19, null, 19, 23, null, 19, 17, 14], [17, 16, 14, 12, null, null, null, null]] },
  { e: '🪩', bpm: 116, ch: [[9, 1], [5, 0], [0, 0], [7, 0]], k: [0, 4, 8, 12], s: [4, 12], h: [2, 6, 10, 14], bass: [[0, 0], [2, 12], [4, 0], [6, 12], [8, 0], [10, 12], [12, 0], [14, 12]], keys: [2, 6, 10, 14], keyLen: .12,
    mel: [[21, null, 24, 21, null, 19, 16, null], [17, null, 21, 17, null, 16, 12, null], [16, null, 19, 16, null, 14, 12, null], [14, null, 19, null, 23, null, 19, null]] },
  { e: '🌙', bpm: 72, ch: [[5, 0], [0, 0], [2, 1], [0, 0]], k: [0], s: [], h: [8], bass: [[0, 0], [8, 7]], keys: [0, 4, 8, 12], keyLen: .5,
    mel: [[17, null, null, null, 21, null, null, null], [16, null, 19, null, 24, null, null, null], [14, null, 17, null, 21, null, null, null], [16, null, null, null, 12, null, null, null]] }
];
game('band', 'music', '🎸', g => {
  const H = g.host('foxy'), on = { dino: false, hoot: false, foxy: false, robo: false }, INST = { dino: '🥁', hoot: '🎻', foxy: '🎹', robo: '🎺' };
  let S = BAND[0], bars = 0, full = 0;
  g.stage.innerHTML = `<div class="bandStage"><div class="lights"></div><div class="members"></div></div><div class="bbar bandBar"></div>`;
  const mem = $('.members', g.stage), lights = $('.lights', g.stage), stage = $('.bandStage', g.stage), bar = $('.bandBar', g.stage);
  ['dino', 'hoot', 'foxy', 'robo'].forEach((n, i) => { const b = mk('button', 'member', `<span class="spot"></span>${charHTML(n)}<span class="inst">${INST[n]}</span>`); b.style.setProperty('--c', [TT.green, TT.yellow, TT.red, TT.blue][i]); b.addEventListener('click', () => { on[n] = !on[n]; b.classList.toggle('on', on[n]); $('.char', b).classList.toggle('dance', on[n]); tone(on[n] ? 660 : 330, .1, 'triangle', .14); if (!seq.on) seq.start(); }); mem.appendChild(b); });
  const clap = mk('button', 'swatch big', '👏'); clap.addEventListener('click', () => { DRUM.clap(); retrigger(stage, 'flashB'); }); bar.appendChild(clap);
  const cym = mk('button', 'swatch big', '💥'); cym.addEventListener('click', () => DRUM.crash()); bar.appendChild(cym);
  const all = mk('button', 'swatch big', '⭐'); all.addEventListener('click', () => { const v = !Object.values(on).every(Boolean); $$('.member', mem).forEach((b, i) => { const n = ['dino', 'hoot', 'foxy', 'robo'][i]; on[n] = v; b.classList.toggle('on', v); $('.char', b).classList.toggle('dance', v); }); if (!seq.on) seq.start(); }); bar.appendChild(all);
  const seq = sequencer(g, S.bpm, 4, (step, d) => {
    const s16 = step % 16, b = Math.floor(step / 16) % 4, [root, minor] = S.ch[b], chord = [root, root + (minor ? 3 : 4), root + 7];
    if (on.dino) { if (S.k.includes(s16)) DRUM.kick(d); if (S.s.includes(s16)) DRUM.snare(d); if (S.h.includes(s16)) DRUM.hat(d); if (step % 64 === 0 && step) DRUM.crash(d); }
    if (on.hoot) S.bass.forEach(([st, off]) => { if (st === s16) tone(sf(root - 24 + off), .22, 'sawtooth', .07, d); });
    if (on.foxy && S.keys.includes(s16)) chord.forEach(n => tone(sf(n), S.keyLen, 'square', .025, d));
    if (on.robo && s16 % 2 === 0) { const n = S.mel[b][s16 / 2]; if (n != null) { tone(sf(n), .28, 'triangle', .1, d); tone(sf(n + 12), .14, 'sine', .03, d); } }
    if (s16 % 4 === 0) setTimeout(() => { if (!g.alive()) return; lights.style.setProperty('--h', (step * 23) % 360); retrigger(lights, 'beat'); }, d * 1000);
    if (s16 === 15) { const n = Object.values(on).filter(Boolean).length; if (n >= 2) { bars++; if (g.progress()) { g.after(400, () => g.levelUp()); } } if (n === 4 && ++full % 4 === 0) setTimeout(() => g.alive() && g.star(1), d * 1000); }
  });
  g.levels(4, lv => { S = BAND[lv - 1]; seq.bpm = S.bpm; bars = 0; g.meter(12); H.bubble(S.e + ' 👆🎸'); });
});

/* SING — classic (public-domain) sing-alongs with a bouncing star */
const NI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const noteF = s => { const m = s.match(/^([A-G])(#?)([',]*)$/); if (!m) return 0; let n = NI[m[1]] + (m[2] ? 1 : 0); for (const c of m[3]) n += c === "'" ? 12 : -12; return sf(n); };
function songLines(id) {
  const nm = kidName('friend'), ns = (nm.match(/^([^aeiouy]*[aeiouy]+[^aeiouy]?)([^aeiouy]*[aeiouy].*)$/i) || [0, nm]).slice(1).filter(Boolean);
  const S = {
    twinkle: [['Twin-kle, twin-kle, lit-tle star', 'C C G G A A G:2', '⭐'], ['How I won-der what you are', 'F F E E D D C:2', '🤔'], ['Up a-bove the world so high', 'G G F F E E D:2', '☁️'], ['Like a dia-mond in the sky', 'G G F F E E D:2', '💎'], ['Twin-kle, twin-kle, lit-tle star', 'C C G G A A G:2', '⭐'], ['How I won-der what you are', 'F F E E D D C:2', '🌙']],
    estrellita: [['Es-tre-lli-ta, ¿dón-de_es-tás?', 'C C G G A A G:2', '⭐'], ['Me pre-gun-to qué se-rás', 'F F E E D D C:2', '🤔'], ['En el cie-lo_y en el mar', 'G G F F E E D:2', '🌊'], ['Un dia-man-te de ver-dad', 'G G F F E E D:2', '💎'], ['Es-tre-lli-ta, ¿dón-de_es-tás?', 'C C G G A A G:2', '⭐'], ['Me pre-gun-to qué se-rás', 'F F E E D D C:2', '🌙']],
    mary: [['Ma-ry had a lit-tle lamb', 'E D C D E E E:2', '👧'], ['Lit-tle lamb, lit-tle lamb', 'D D D:2 E G G:2', '🐑'], ['Ma-ry had a lit-tle lamb', 'E D C D E E E:2', '👧'], ['Its fleece was white as snow', 'E D D E D C:3', '❄️']],
    row: [['Row, row, row your boat', 'C:1.5 C:1.5 C D:.5 E:1.5', '🚣'], ['Gent-ly down the stream', 'E D:.5 E F:.5 G:3', '🌊'], ['Mer-ri-ly, mer-ri-ly, mer-ri-ly, mer-ri-ly', "C':.5 C':.5 C':.5 G:.5 G:.5 G:.5 E:.5 E:.5 E:.5 C:.5 C:.5 C:.5", '😄'], ['Life is but a dream', 'G F:.5 E D:.5 C:3', '💭']],
    spider: [['The it-sy bit-sy spi-der climbed up the wa-ter spout', 'G, C C C D E E E D C D E C:2', '🕷️'], ['Down came the rain and washed the spi-der out', 'E E F G G F E F G E:2', '🌧️'], ['Out came the sun and dried up all the rain', 'C C D E E D C D E C:2', '☀️'], ['And the it-sy bit-sy spi-der climbed up the spout a-gain', 'G, G, C C C D E E E D C D E C:2', '🕷️']],
    sleeping: [['Are you sleep-ing,', 'C D E C', '😴'], ['are you sleep-ing,', 'C D E C', '😴'], ['Bro-ther John?', 'E F G:2', '🧒'], ['Bro-ther John?', 'E F G:2', '🧒'], ['Morn-ing bells are ring-ing,', 'G:.5 A:.5 G:.5 F:.5 E C', '🔔'], ['morn-ing bells are ring-ing,', 'G:.5 A:.5 G:.5 F:.5 E C', '🔔'], ['Ding, dang, dong!', 'C G, C:2', '🛎️'], ['Ding, dang, dong!', 'C G, C:2', '🛎️']],
    martinillo: [['Mar-ti-ni-llo,', 'C D E C', '😴'], ['Mar-ti-ni-llo,', 'C D E C', '😴'], ['¿dón-de_es-tás?', 'E F G:2', '🔎'], ['¿dón-de_es-tás?', 'E F G:2', '🔎'], ['To-ca la cam-pa-na,', 'G:.5 A:.5 G:.5 F:.5 E C', '🔔'], ['to-ca la cam-pa-na,', 'G:.5 A:.5 G:.5 F:.5 E C', '🔔'], ['din, don, dan.', 'C G, C:2', '🛎️'], ['din, don, dan.', 'C G, C:2', '🛎️']],
    birthday: [['Hap-py birth-day to you', 'G,:.75 G,:.25 A, G, C B,:2', '🎂'], ['Hap-py birth-day to you', 'G,:.75 G,:.25 A, G, D C:2', '🎁'], [`Hap-py birth-day dear ${ns.join('-')}`, `G,:.75 G,:.25 G E C ${ns.length > 1 ? 'B, A,:2' : 'B,:3'}`, '🎈'], ['Hap-py birth-day to you', 'F:.75 F:.25 E C D C:3', '🎉']]
  };
  if (id === 'farm') { const out = []; [['cow', 'moo', '🐮'], ['pig', 'oink', '🐷'], ['duck', 'quack', '🦆'], ['sheep', 'baa', '🐑'], ['dog', 'woof', '🐶']].forEach(([a, s, e]) => out.push(['Old Mac-Don-ald had a farm', 'G G G D E E D:2', '🧑‍🌾'], ['E-I-E-I-O', 'B B A A G:3', '🎶'], [`And on that farm he had a ${a}`, 'D:.5 G G G D E E D:2', e], ['E-I-E-I-O', 'B B A A G:3', '🎶'], [`With a ${s} ${s} here`, 'D:.5 D:.5 G G G:2', e], [`And a ${s} ${s} there`, 'D:.5 D:.5 G G G:2', e], [`Here a ${s}, there a ${s}`, 'G:.5 G:.5 G G:.5 G:.5 G', e], [`Ev-ery-where a ${s} ${s}`, 'G:.5 G:.5 G:.5 G:.5 G G', e], ['Old Mac-Don-ald had a farm', 'G G G D E E D:2', '🧑‍🌾'], ['E-I-E-I-O', 'B B A A G:3', '🎶'])); return out; }
  return S[id];
}
const SING_LIST = [['twinkle', '⭐', 'en'], ['estrellita', '🌟', 'es'], ['farm', '🐮', 'en'], ['row', '🚣', 'en'], ['spider', '🕷️', 'en'], ['mary', '🐑', 'en'], ['sleeping', '🔔', 'en'], ['martinillo', '🛎️', 'es'], ['birthday', '🎂', 'en']];
game('sing', 'music', '🎤', g => {
  const H = g.host('hoot'); let tempo = 1, playing = 0;
  g.stage.innerHTML = `<div class="songs"></div><div class="karaoke"><div class="kPic"></div><div class="kLine"></div><div class="kNext"></div></div><div class="kCast">${CAST_IDS.map(n => charHTML(n)).join('')}</div>`;
  const list = $('.songs', g.stage), pic = $('.kPic', g.stage), line = $('.kLine', g.stage), nextL = $('.kNext', g.stage);
  const songs = SING_LIST.filter(s => s[2] === 'en' || s[2] === cfg.lang2);
  songs.forEach(([id, e]) => { const b = mk('button', 'topic', e); b.addEventListener('click', () => play(id)); list.appendChild(b); });
  const syl = txt => txt.split(' ').map(w => w.split('-'));
  function show(l, n) {
    pic.textContent = l[2]; retrigger(pic, 'pop'); let k = 0;
    line.innerHTML = syl(l[0]).map(w => `<span class="w">${w.map(s => `<span class="s" data-k="${k++}">${s.replace(/_/g, ' ')}</span>`).join('')}</span>`).join(' ');
    nextL.textContent = n ? n[0].replace(/-/g, '').replace(/_/g, ' ') : '';
  }
  function play(id) {
    const my = ++playing, lines = songLines(id); g.stage.classList.add('singing'); $$('.kCast .char', g.stage).forEach(c => c.classList.add('dance')); let li = 0;
    const beat = () => 60 / (96 * tempo);
    const doLine = () => {
      if (my !== playing || !g.alive()) return; if (li >= lines.length) { g.stage.classList.remove('singing'); $$('.kCast .char', g.stage).forEach(c => c.classList.remove('dance')); SFX.chime(); g.star(2); H.happy(); return; }
      const l = lines[li], notes = l[1].split(' ').map(t => { const [nn, d] = t.split(':'); return [noteF(nn), +(d || 1)]; }); show(l, lines[li + 1]); let at = 0;
      notes.forEach(([f, d], k) => { g.after(at * 1000, () => { if (my !== playing) return; tone(f, d * beat() * .92, 'triangle', .15); tone(f * 2, d * beat() * .4, 'sine', .04); if (k % 2 === 0) tone(f / 2, beat() * .5, 'sine', .08); $$('.kLine .s', g.stage).forEach(s => s.classList.toggle('on', +s.dataset.k === k)); $$('.kLine .s', g.stage).forEach(s => { if (+s.dataset.k < k) s.classList.add('done'); }); }); at += d * beat(); });
      li++; g.after(at * 1000 + beat() * 500, doLine);
    };
    g.after(300, doLine);
  }
  g.tool('🐢', b => { tempo = tempo === 1 ? .75 : tempo === .75 ? 1.25 : 1; b.textContent = tempo < 1 ? '🐢' : tempo > 1 ? '🐇' : '🚶'; });
  g.tool('⏹', () => { playing++; g.stage.classList.remove('singing'); $$('.kCast .char', g.stage).forEach(c => c.classList.remove('dance')); });
  H.bubble('🎤 🎶');
});

/* HIDE & SEEK 3D — friends hide under things; tap to look */
function spriteTexture(n, ex = 'idle') { const tex = new THREE.Texture(); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(spriteSVG(n, ex))).then(im => { const c = document.createElement('canvas'); c.width = 64; c.height = 80; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(im, 0, 0, 64, 80); tex.image = c; tex.needsUpdate = true; }); return tex; }
function emojiTexture(e) { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.font = '100px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 64, 72); const t = new THREE.CanvasTexture(c); return t; }
game('hide', '3d', '🙈', g => {
  const H = g.host(PROG.buddy || 'robo'), V = g.three({ fov: 45 }), { scene, cam } = V; let boxes = [], friends = [], found = 0, busy = false;
  const night = DAYPART() === 'night' || DAYPART() === 'evening';
  scene.background = new THREE.Color(night ? '#0a1030' : '#7fc8ff'); scene.add(new THREE.HemisphereLight(0xffffff, 0x335533, night ? .55 : .9)); const sun = new THREE.DirectionalLight(0xffffff, night ? .4 : .8); sun.position.set(5, 10, 6); scene.add(sun);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(14, 48), new THREE.MeshLambertMaterial({ color: night ? '#1d4a2a' : '#3bb35a' })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283, t = new THREE.Group(); const tr = new THREE.Mesh(new THREE.CylinderGeometry(.2, .25, 1.2), new THREE.MeshLambertMaterial({ color: '#8B5A3C' })); tr.position.y = .6; const top = new THREE.Mesh(new THREE.ConeGeometry(1, 2.2, 8), new THREE.MeshLambertMaterial({ color: pick(['#19D36B', '#0F8A45', '#2fbf71']) })); top.position.y = 2.1; t.add(tr, top); t.position.set(Math.cos(a) * 12, 0, Math.sin(a) * 12); scene.add(t); }
  const MAKERS = [
    () => { const gr = new THREE.Group(); [[0, .7, 0, .9], [-.6, .5, .2, .7], [.6, .5, .1, .7]].forEach(([x, y, z, r]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), new THREE.MeshLambertMaterial({ color: '#1f9d55' })); m.position.set(x, y, z); gr.add(m); }); return gr; },
    () => { const m = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), new THREE.MeshLambertMaterial({ color: '#b07a3c' })); m.position.y = .8; m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: '#5a3a1a' }))); const gr = new THREE.Group(); gr.add(m); return gr; },
    () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.8, .8, 1.7, 16), new THREE.MeshLambertMaterial({ color: TT.red })); m.position.y = .85; const gr = new THREE.Group(); gr.add(m); return gr; },
    () => { const gr = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.3, 1.6), new THREE.MeshLambertMaterial({ color: TT.yellow })); b.position.y = .65; const r = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1, 4), new THREE.MeshLambertMaterial({ color: TT.red })); r.position.y = 1.8; r.rotation.y = Math.PI / 4; gr.add(b, r); return gr; },
    () => { const m = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2, 6), new THREE.MeshLambertMaterial({ color: TT.blue })); m.position.y = 1; const gr = new THREE.Group(); gr.add(m); return gr; },
    () => { const gr = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshLambertMaterial({ color: pick([TT.purple, TT.pink, TT.teal]) })); b.position.y = .75; const rb = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.55, .25), new THREE.MeshLambertMaterial({ color: TT.yellow })); rb.position.y = .75; const rb2 = rb.clone(); rb2.rotation.y = Math.PI / 2; gr.add(b, rb, rb2); return gr; },
    () => { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1), new THREE.MeshLambertMaterial({ color: '#8a8a8a', flatShading: true })); m.position.y = .7; m.scale.y = .8; const gr = new THREE.Group(); gr.add(m); return gr; }
  ];
  const O = orbit(g, cam, V.el, { dist: 15, el: .55, minEl: .25, maxEl: 1.2, minD: 9, maxD: 20, onTap: e => tap(e) });
  const LV = { 1: [4, 1, true], 2: [5, 1, false], 3: [6, 2, false], 4: [8, 3, false] };
  function round() {
    boxes.forEach(b => scene.remove(b)); friends.forEach(f => scene.remove(f.spr)); boxes = []; friends = []; found = 0; busy = false;
    const [n, nf, peek] = LV[g.lvl()], who = shuffle(CAST_IDS.filter(c => c !== (PROG.buddy || 'robo'))).slice(0, nf), slots = shuffle([...Array(n).keys()]);
    for (let i = 0; i < n; i++) { const a = i / n * 6.283 + .3, r = n > 5 ? 5.2 : 4.2, b = pick(MAKERS)(); b.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); b.userData = { i, lift: 0, wob: 0 }; scene.add(b); boxes.push(b); }
    who.forEach((c, k) => { const box = boxes[slots[k]], spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: spriteTexture(c, 'idle'), transparent: true })); spr.scale.set(1.5, 1.875, 1); spr.position.set(box.position.x, peek ? 1.55 : .9, box.position.z); spr.visible = peek; scene.add(spr); friends.push({ c, spr, box, found: false, jump: 0 }); });
    H.say('', 'talk', lang, 0, CARD.wrap(who.map(c => `<span class="char">${spriteSVG(c)}</span>`).join(''), '🔎'));
  }
  function tap(e) {
    if (busy) return; const hit = V.hit(e, boxes); if (!hit.length) return; let o = hit[0].object; while (o.parent && !boxes.includes(o)) o = o.parent; const box = o; if (box.userData.lift > 0) return;
    box.userData.lift = 1; const f = friends.find(f => f.box === box && !f.found);
    if (f) { f.found = true; f.spr.visible = true; f.spr.material.map = spriteTexture(f.c, 'happy'); f.jump = 1; found++; SFX.good(); [523, 659, 784].forEach((q, i) => tone(q * CAST[f.c].pitch, .15, 'square', .05, i * .08)); g.star(1); H.happy();
      if (found === friends.length) { busy = true; SFX.chime(); g.after(1800, () => { if (g.progress()) g.levelUp(); else round(); }); } }
    else { SFX.boing(); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTexture(pick(['🦋', '🐸', '🍎', '🐞', '🐭', '🎈', '🐌'])), transparent: true })); s.position.set(box.position.x, 1, box.position.z); s.scale.set(1.2, 1.2, 1); s.userData.t = 0; scene.add(s); const tick = () => { s.userData.t += .03; s.position.y = 1 + s.userData.t * 3; s.material.opacity = 1 - s.userData.t; if (s.userData.t < 1 && g.alive()) requestAnimationFrame(tick); else scene.remove(s); }; tick(); H.mood('oops', 500); }
  }
  g.loop((dt, t) => {
    boxes.forEach(b => { const u = b.userData; if (u.lift > 0) { u.lift = Math.max(0, u.lift - dt * .7); const k = Math.sin(Math.min(1, (1 - u.lift) * 1.6) * Math.PI); b.position.y = k * 2.2; b.rotation.z = k * .35; } });
    friends.forEach(f => { if (f.found) { f.jump = Math.max(0, f.jump - dt); f.spr.position.y = .9 + Math.abs(Math.sin(t * 5)) * .4 + f.jump; } else if (f.spr.visible) f.spr.position.y = 1.55 + Math.sin(t * 2) * .08; });
    if (!O.dragging()) O.az += dt * .05; O.apply(); V.render();
  });
  g.levels(4, () => { g.meter(3); round(); });
});

/* TWO PLAYERS — race, snap, pop (kid vs grown-up, or two kids) */
game('duo', 'play', '👫', g => {
  const H = g.host('robo'); let helpR = true;
  g.stage.classList.add('col'); g.stage.innerHTML = `<div class="duo"><div class="duoSide L"></div><div class="duoMid"></div><div class="duoSide R"></div></div>`;
  const Ls = $('.duoSide.L', g.stage), Rs = $('.duoSide.R', g.stage), mid = $('.duoMid', g.stage);
  const who = [PROG.buddy || 'robo', (PROG.buddy || 'robo') === 'dino' ? 'foxy' : 'dino'];
  const winFx = side => { const el = side ? Rs : Ls; el.classList.add('win'); SFX.chime(); g.star(2); [Ls, Rs].forEach(s => s.querySelectorAll('.char').forEach(c => c.classList.add('dance'))); g.after(2600, () => { [Ls, Rs].forEach(s => s.classList.remove('win')); g.lvl() < 3 && g.progress() ? g.levelUp() : start(); }); };
  g.tool('⚖️', b => { helpR = !helpR; b.classList.toggle('sel', helpR); }).classList.add('sel');
  function race() {
    let pos = [0, 0], done = false;
    mid.innerHTML = `<div class="track"><div class="lane"><span class="runner">${charHTML(who[0])}</span></div><div class="lane"><span class="runner">${charHTML(who[1])}</span></div><span class="flag">🏁</span></div>`;
    [Ls, Rs].forEach((s, i) => { s.innerHTML = `<button class="bigTap">${i ? '🔴' : '🔵'}</button>`; const b = $('.bigTap', s); b.addEventListener('pointerdown', () => { if (done) return; pos[i] = Math.min(100, pos[i] + (i === 1 && helpR ? 2.3 : 4)); tone(i ? 440 : 523, .06, 'square', .05); const r = $$('.runner', mid)[i]; r.style.left = pos[i] * .86 + '%'; moodFn($('.char', r), 'run' + (1 + Math.round(pos[i]) % 2), 200); if (pos[i] >= 100) { done = true; winFx(i); } }); });
  }
  function snap() {
    let sc = [0, 0], target = 0, lock = false;
    const deal = () => { lock = false; target = randi(0, 6); mid.innerHTML = `<div class="snapCard pop" style="background:${COLORS[target]}"></div><div class="score">${sc[0]} · ${sc[1]}</div>`; [Ls, Rs].forEach((s, i) => { s.innerHTML = ''; shuffle([target, ...shuffle([0, 1, 2, 3, 4, 5, 6].filter(c => c !== target)).slice(0, 2)]).forEach(c => { const b = mk('button', 'snapBtn'); b.style.background = COLORS[c]; b.addEventListener('pointerdown', () => { if (lock) return; if (c === target) { lock = true; sc[i]++; b.classList.add('right'); SFX.good(); if (sc[i] >= 5) winFx(i); else g.after(900, deal); } else { retrigger(b, 'shake'); SFX.bad(); } }); s.appendChild(b); }); }); };
    deal();
  }
  function pop() {
    let sc = [0, 0], left = 30, on = true; mid.innerHTML = `<div class="score big">${sc[0]} · ${sc[1]}</div><div class="timer">30</div>`;
    [Ls, Rs].forEach(s => { s.innerHTML = ''; });
    const spawn = () => { if (!on) return; [Ls, Rs].forEach((s, i) => { const b = mk('button', 'dBub'); b.style.left = rand(8, 80) + '%'; b.style.setProperty('--c', pick(COLORS)); b.style.animationDuration = rand(3, 5) + 's'; b.addEventListener('pointerdown', () => { if (!on) return; sc[i]++; SFX.pop(rand(.8, 1.4)); b.remove(); $('.score', mid).textContent = `${sc[0]} · ${sc[1]}`; }); b.addEventListener('animationend', () => b.remove()); s.appendChild(b); }); };
    const iv = g.every(650, spawn), tm = g.every(1000, () => { left--; const t = $('.timer', mid); if (t) t.textContent = left; if (left <= 0) { on = false; clearInterval(iv); clearInterval(tm); winFx(sc[1] > sc[0] ? 1 : 0); } });
  }
  const start = () => [race, snap, pop][g.lvl() - 1]();
  g.levels(3, () => { g.meter(2); start(); });
});
