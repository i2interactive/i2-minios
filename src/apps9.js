/* ═════════ NEW APPS · part 9 — edutainment: Number Blaster, TV Sleuth, World Detective ═════════ */
VOICE_APPS.add('foxhunt');
function numChoices(ans, n, lo, hi) {
  const set = new Set([ans]); let guard = 0;
  while (set.size < n && guard++ < 200) { const v = clamp(ans + randi(-3, 3), lo, hi); set.add(v); }
  for (let v = lo; set.size < n && v <= hi; v++) set.add(v);
  return shuffle([...set]);
}

/* NUMBER BLASTER — a space-math shooter in the spirit of the 90s classics. Zap the asteroid with the right answer.
   Levels: count to 3 → count to 5 → find the number → add pictures → add & take away → number patterns */
game('blaster', 'learn', '🚀', g => {
  const H = g.host('robo'); g.stage.classList.add('col'); const wrap = mk('div', 'paintWrap'); g.stage.appendChild(wrap);
  const C = g.canvas(wrap), x = C.ctx, P = new Particles();
  const ITEMS = ['🍎', '⭐', '🐟', '🚗', '🎈', '🐞', '🍓', '⚽', '🌸', '🐥', '🦕', '🍪'];
  const MINUS = { en: 'minus', es: 'menos', fr: 'moins', pt: 'menos', ja: 'ひく', zh: '减' };
  let L = 1, q = null, rocks = [], beam = null, t = 0, warp = 0, shipX = .5, shipT = .5, lock = false;
  const stars = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), z: rand(.2, 1) }));
  function makeQ() {
    const e = pick(ITEMS);
    if (L === 1) { const a = randi(1, 3); return { kind: 'count', a, e, ans: a, ch: [1, 2, 3] }; }
    if (L === 2) { const a = randi(1, 5); return { kind: 'count', a, e, ans: a, ch: numChoices(a, 3, 1, 5) }; }
    if (L === 3) { const a = randi(1, 10); return { kind: 'num', a, ans: a, ch: numChoices(a, 4, 1, 10) }; }
    if (L === 4) { const a = randi(1, 3), b = randi(1, 5 - a); return { kind: 'add', a, b, e, ans: a + b, ch: numChoices(a + b, 3, 1, 6) }; }
    if (L === 5) { if (Math.random() < .55) { const a = randi(1, 6), b = randi(1, 10 - a); return { kind: 'eq', a, b, op: '+', ans: a + b, ch: numChoices(a + b, 4, 1, 10) }; } const a = randi(3, 10), b = randi(1, a - 1); return { kind: 'eq', a, b, op: '−', ans: a - b, ch: numChoices(a - b, 4, 0, 10) }; }
    const st = randi(1, 6), step = pick([1, 1, 2]), back = Math.random() < .3, seq = [0, 1, 2, 3].map(i => back ? st + (3 - i) * step : st + i * step), hole = randi(1, 2);
    return { kind: 'seq', seq, hole, ans: seq[hole], ch: numChoices(seq[hole], 4, 0, 14) };
  }
  function prompt() {
    if (!q) return; const tr = T();
    const text = q.kind === 'count' ? tr.howMany : q.kind === 'num' ? numWord(q.a) : q.kind === 'add' ? `${numWord(q.a)} ${tr.plus} ${numWord(q.b)}?` : q.kind === 'eq' ? `${numWord(q.a)} ${q.op === '+' ? tr.plus : LX(MINUS)} ${numWord(q.b)}?` : tr.next;
    H.say(text, 'talk', lang, true);
  }
  function newQ() {
    q = makeQ(); lock = false; const n = q.ch.length;
    rocks = q.ch.map((v, i) => { const r = .075 + (n === 3 ? .01 : 0); const pts = Array.from({ length: 10 }, (_, k) => { const a = k / 10 * Math.PI * 2; return [Math.cos(a) * rand(.82, 1.08), Math.sin(a) * rand(.82, 1.08)]; });
      return { v, x: (i + .5) / n * .8 + .1 + rand(-.03, .03), y: rand(.36, .52), ph: rand(0, 6), r, pts, rot: rand(0, 6), spin: rand(-.6, .6), col: pick(['#7a5a44', '#5d4e7a', '#4e6a7a', '#7a4e5d']), wrong: false, dead: false, wob: 0, craters: Array.from({ length: 3 }, () => [rand(-.5, .5), rand(-.5, .5), rand(.12, .22)]) }; });
    prompt();
  }
  function zap(rk) {
    if (lock || rk.dead || rk.wrong) return; shipT = rk.x; beam = { x1: rk.x, y1: rk.y, t: .22 }; sweep(1400, 300, .18, 'square', .05);
    if (rk.v === q.ans) {
      lock = true; rk.dead = true; P.burst(rk.x * C.w, rk.y * C.h, [TT.yellow, TT.orange, TT.white, '#b08a6a'], 46, 520, { g: 0 }); SFX.boom(.5); g.star(1); H.happy(); say(numWord(rk.v));
      g.after(900, () => { if (g.progress()) g.levelUp(); else { warp = .7; sweep(200, 1200, .6, 'sine', .08); g.after(650, newQ); } });
    } else { rk.wrong = true; rk.wob = .5; SFX.bad(); H.mood('oops'); }
  }
  g.on(C.cv, 'pointerdown', e => { const p = C.pos(e); let best = null, bd = 1e9; rocks.forEach(rk => { if (rk.dead || rk.wrong) return; const d = Math.hypot(rk.x * C.w - p.x, rk.y * C.h - p.y); if (d < bd) { bd = d; best = rk; } }); const R = Math.min(C.w, C.h); if (best && bd < best.r * R * 1.6) zap(best); });
  g.key = e => { const k = e.key === '0' && q && q.ans === 10 ? 10 : +e.key; if (!isNaN(k) && e.key !== ' ') { const rk = rocks.find(r => r.v === k && !r.dead && !r.wrong); if (rk) zap(rk); } if (e.key === ' ' || e.key === 'Enter') prompt(); };
  g.levels(6, lv => { L = lv; g.meter(lv <= 2 ? 6 : 8); newQ(); });
  function drawQ(W, Hh) {
    const ph = Hh * .22, pw = Math.min(W * .9, ph * 4.2), px = (W - pw) / 2, py = Hh * .03;
    x.fillStyle = 'rgba(5,8,30,.85)'; x.fillRect(px, py, pw, ph); x.strokeStyle = TT.green; x.lineWidth = 3; x.strokeRect(px, py, pw, ph);
    x.fillStyle = TT.green; x.font = `bold ${ph * .12}px ${PXF}`; x.textAlign = 'left'; x.textBaseline = 'top'; x.fillText('▶ MISSION', px + 8, py + 6);
    const cx = W / 2, cy = py + ph * .58; x.textAlign = 'center'; x.textBaseline = 'middle';
    const emo = (e, n, s, x0) => { x.font = `${s}px sans-serif`; for (let i = 0; i < n; i++) x.fillText(e, x0 + i * s * 1.1, cy); };
    if (q.kind === 'count') { const s = Math.min(ph * .55, pw * .8 / (q.a * 1.1)); emo(q.e, q.a, s, cx - (q.a - 1) * s * .55); }
    else if (q.kind === 'num') { const s = ph * .16, cols = Math.min(5, q.a); for (let i = 0; i < q.a; i++) { const cxx = cx - pw * .2 + (i % 5 - (cols - 1) / 2) * s * 2.2, cyy = cy + (q.a > 5 ? (i < 5 ? -1 : 1) * s * 1.2 : 0); x.fillStyle = TT.yellow; x.beginPath(); x.arc(cxx, cyy, s * .8, 0, 7); x.fill(); } x.font = `bold ${ph * .32}px ${PXF}`; x.fillStyle = TT.white; x.fillText(numWord(q.a).toUpperCase(), cx + pw * .22, cy); }
    else if (q.kind === 'add') { const s = Math.min(ph * .45, pw * .8 / ((q.a + q.b + 1.5) * 1.1)), tot = (q.a + q.b + 1.4) * s * 1.1, x0 = cx - tot / 2 + s * .55; emo(q.e, q.a, s, x0); x.font = `bold ${s}px ${PXF}`; x.fillStyle = TT.yellow; x.fillText('+', x0 + (q.a + .2) * s * 1.1, cy); emo(q.e, q.b, s, x0 + (q.a + 1.4) * s * 1.1); }
    else if (q.kind === 'eq') { x.font = `bold ${ph * .5}px ${PXF}`; x.fillStyle = TT.white; x.fillText(`${q.a} ${q.op} ${q.b} = ?`, cx, cy); }
    else { const s = ph * .45; q.seq.forEach((v, i) => { const xx = cx + (i - 1.5) * s * 1.8; if (i === q.hole) { x.strokeStyle = TT.yellow; x.lineWidth = 4; x.strokeRect(xx - s * .6, cy - s * .6, s * 1.2, s * 1.2); x.fillStyle = TT.yellow; x.font = `bold ${s * .8}px ${PXF}`; x.fillText('?', xx, cy); } else { x.fillStyle = TT.white; x.font = `bold ${s}px ${PXF}`; x.fillText(v, xx, cy); } }); }
  }
  g.loop(dt => {
    t += dt; const W = C.w, Hh = C.h, R = Math.min(W, Hh); warp = Math.max(0, warp - dt);
    x.fillStyle = '#03030c'; x.fillRect(0, 0, W, Hh);
    stars.forEach(s => { s.y += dt * s.z * (.03 + warp * 2.2); if (s.y > 1) { s.y -= 1; s.x = Math.random(); } x.fillStyle = s.z > .7 ? TT.white : '#6a74b8'; const len = warp > 0 ? s.z * 40 * warp : 0; x.fillRect(s.x * W, s.y * Hh - len, s.z * 2.5, s.z * 2.5 + len); });
    x.globalAlpha = .9; x.fillStyle = '#ff8a1f'; x.beginPath(); x.arc(W * .88, Hh * .78, R * .09, 0, 7); x.fill(); x.fillStyle = '#c45a0a'; x.beginPath(); x.ellipse(W * .88, Hh * .78, R * .16, R * .03, -.3, 0, 7); x.strokeStyle = '#ffd60a'; x.lineWidth = 3; x.stroke(); x.globalAlpha = 1;
    rocks.forEach(rk => {
      if (rk.dead) return; rk.rot += rk.spin * dt; rk.wob = Math.max(0, rk.wob - dt); const bx = rk.x * W + Math.sin(t * .8 + rk.ph) * W * .012 + Math.sin(rk.wob * 40) * rk.wob * 20, by = rk.y * Hh + Math.cos(t * .6 + rk.ph) * Hh * .015, r = rk.r * R * 1.25;
      x.save(); x.translate(bx, by); x.globalAlpha = rk.wrong ? .3 : 1; x.rotate(rk.rot); x.fillStyle = rk.col; x.beginPath(); rk.pts.forEach(([px, py], i) => i ? x.lineTo(px * r, py * r) : x.moveTo(px * r, py * r)); x.closePath(); x.fill(); x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 3; x.stroke();
      x.fillStyle = 'rgba(0,0,0,.22)'; rk.craters.forEach(([cx2, cy2, cr]) => { x.beginPath(); x.arc(cx2 * r, cy2 * r, cr * r, 0, 7); x.fill(); }); x.rotate(-rk.rot);
      x.font = `bold ${r * 1.05}px ${PXF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = r * .14; x.strokeStyle = '#000'; x.strokeText(rk.v, 0, r * .05); x.fillStyle = TT.white; x.fillText(rk.v, 0, r * .05); x.restore(); x.globalAlpha = 1;
    });
    shipX = lerp(shipX, shipT, Math.min(1, dt * 8)); const sx = shipX * W, sy = Hh * .9, s = R * .07;
    if (beam) { beam.t -= dt; x.strokeStyle = TT.green; x.lineWidth = 8 * (beam.t / .22 + .2); x.shadowColor = TT.green; x.shadowBlur = 20; x.beginPath(); x.moveTo(sx, sy - s * 1.2); x.lineTo(beam.x1 * W, beam.y1 * Hh); x.stroke(); x.shadowBlur = 0; if (beam.t <= 0) beam = null; }
    x.fillStyle = (t * 20 | 0) % 2 ? TT.orange : TT.yellow; x.beginPath(); x.moveTo(sx - s * .4, sy + s * .5); x.lineTo(sx, sy + s * (1.1 + Math.random() * .4)); x.lineTo(sx + s * .4, sy + s * .5); x.fill();
    x.fillStyle = TT.blue; x.beginPath(); x.moveTo(sx, sy - s * 1.4); x.lineTo(sx + s * 1.1, sy + s * .6); x.lineTo(sx - s * 1.1, sy + s * .6); x.closePath(); x.fill(); x.fillStyle = TT.red; x.fillRect(sx - s * 1.3, sy + s * .1, s * .4, s * .6); x.fillRect(sx + s * .9, sy + s * .1, s * .4, s * .6);
    x.fillStyle = 'rgba(160,220,255,.45)'; x.beginPath(); x.arc(sx, sy - s * .15, s * .55, 0, 7); x.fill(); drawSprite(x, 'robo', lock ? 'happy' : 'idle', sx, sy + s * .25, s * .8);
    if (q) drawQ(W, Hh);
    P.update(dt); P.draw(x);
  });
});

/* TV SLEUTH — a cheeky friend is hiding somewhere in the TV station. Solve a quick puzzle in each room to get a clue,
   cross rooms off, and catch them in the last room left. (A toddler take on the 90s "find the villain" math games.) */
game('mischief', 'learn', '📺', g => {
  const H = g.host('robo');
  const ROOMS = [{ e: '📰', n: 'NEWS', c: TT.blue, it: '📄' }, { e: '🎨', n: 'CARTOONS', c: TT.pink, it: '🖍️' }, { e: '☀️', n: 'WEATHER', c: TT.yellow, it: '☁️' }, { e: '🎵', n: 'MUSIC', c: TT.purple, it: '🎵' }, { e: '🍳', n: 'COOKING', c: TT.orange, it: '🥚' }, { e: '⚽', n: 'SPORTS', c: TT.green, it: '⚽' }];
  const LV = { 1: { rooms: 3, kind: 'count', max: 3, cases: 2 }, 2: { rooms: 4, kind: 'count', max: 5, cases: 2 }, 3: { rooms: 5, kind: 'more', max: 6, cases: 3 }, 4: { rooms: 6, kind: 'add', max: 6, cases: 3 }, 5: { rooms: 6, kind: 'mix', max: 8, cases: 3 } };
  g.stage.innerHTML = `<div class="ms"><div class="msTop"><span class="msHider"></span><span class="msTxt"></span></div><div class="msMap"></div><div class="msRoom"></div></div>`;
  const top = $('.msTop', g.stage), hid = $('.msHider', g.stage), txt = $('.msTxt', g.stage), map = $('.msMap', g.stage), roomEl = $('.msRoom', g.stage);
  let L = 1, rooms = [], hider = 'dino', at = 0, busy = false;
  const left = () => rooms.filter(r => !r.x);
  function newCase() {
    const c = LV[L]; rooms = shuffle(ROOMS).slice(0, c.rooms).map(r => ({ ...r, x: false })); at = randi(0, rooms.length - 1); hider = pick(CAST_IDS.filter(n => n !== 'robo')); busy = false;
    hid.innerHTML = charHTML(hider, 'silhouette'); roomEl.classList.remove('on'); renderMap(); H.say('', 'talk', lang, true, `<div class="cd">${charHTML(hider, 'silhouette')}<span class="ce">❓</span><span class="ce">📺</span></div>`);
  }
  function renderMap() {
    map.innerHTML = ''; map.style.setProperty('--n', rooms.length === 4 ? 4 : Math.min(3, rooms.length)); const one = left().length === 1;
    txt.textContent = one ? '👉 ❓' : '🔎 ' + '📺'.repeat(left().length);
    rooms.forEach((r, i) => { const b = mk('button', 'msDoor' + (r.x ? ' x' : '') + (one && !r.x ? ' glow' : ''), `<b>${r.e}</b><span>${r.n}</span>${r.x ? '<i>✖</i>' : ''}`); b.style.setProperty('--c', r.c); b.addEventListener('click', () => door(i, b)); map.appendChild(b); });
  }
  function door(i, b) {
    if (busy) return; const r = rooms[i]; if (r.x) { SFX.bad(); retrigger(b, 'shake'); return; }
    SFX.tap(); if (left().length === 1) { reveal(i); return; } openRoom(i);
  }
  function puzzle(kind) {
    const c = LV[L], k = kind === 'mix' ? pick(['count', 'more', 'add']) : kind, r = rooms[cur];
    if (k === 'count') { const n = randi(1, c.max); return { k, n, ans: n, html: `<div class="msItems">${Array.from({ length: n }, () => `<span style="--r:${rand(-20, 20).toFixed(0)}deg">${r.it}</span>`).join('')}</div>`, ch: numChoices(n, 3, 1, Math.max(3, c.max)) }; }
    if (k === 'add') { const a = randi(1, 3), b = randi(1, 3); return { k, ans: a + b, html: `<div class="msItems"><span>${r.it.repeat(a)}</span><b>+</b><span>${r.it.repeat(b)}</span></div>`, ch: numChoices(a + b, 3, 1, 7) }; }
    let a = randi(1, c.max), b = randi(1, c.max); while (b === a) b = randi(1, c.max); return { k: 'more', a, b, ans: a > b ? 0 : 1 };
  }
  let cur = 0, pz = null;
  function openRoom(i) {
    busy = true; cur = i; const r = rooms[i]; roomEl.style.setProperty('--c', r.c); roomEl.classList.add('on'); roomEl.innerHTML = '<div class="static"></div>'; noise(.45, .12, 'highpass', 3000);
    g.after(500, () => {
      pz = puzzle(LV[L].kind);
      if (pz.k === 'more') {
        roomEl.innerHTML = `<div class="msBack">${r.e}</div><div class="msQ">⬅ ➕ ➡</div><div class="msMore"><button class="slab mmA">${r.it.repeat(pz.a)}</button><button class="slab mmB">${r.it.repeat(pz.b)}</button></div>`;
        [$('.mmA', roomEl), $('.mmB', roomEl)].forEach((btn, k) => btn.addEventListener('click', () => answer(k === pz.ans, btn)));
        H.say(LX({ en: 'Which has more?', es: '¿Cuál tiene más?', fr: 'Lequel en a plus ?', pt: 'Qual tem mais?', ja: 'どっちがおおい？', zh: '哪边多？' }), 'talk', lang, true);
      } else {
        roomEl.innerHTML = `<div class="msBack">${r.e}</div>${pz.html}<div class="msAns">${pz.ch.map(v => `<button class="slab" data-v="${v}">${v}</button>`).join('')}</div>`;
        $$('.msAns button', roomEl).forEach(btn => btn.addEventListener('click', () => answer(+btn.dataset.v === pz.ans, btn)));
        H.say(T().howMany, 'talk', lang, true);
      }
    });
  }
  function answer(ok, btn) {
    if (!ok) { SFX.bad(); retrigger(btn, 'shake'); H.mood('oops'); return; }
    SFX.good(); g.star(1); say(numWord(pz.k === 'more' ? (pz.ans ? pz.b : pz.a) : pz.ans));
    if (cur === at) { roomEl.classList.remove('on'); reveal(at); return; }
    const r = rooms[cur]; r.x = true; const others = rooms.filter((q, i) => !q.x && i !== at); let extra = null; if (others.length >= 1 && left().length > 2) { extra = pick(others); extra.x = true; }
    H.happy(); roomEl.innerHTML = `<div class="msClue"><b>${r.e}</b><i>✖</i>${extra ? `<b>${extra.e}</b><i>✖</i>` : ''}</div>`;
    H.say(LX({ en: 'Not here!', es: '¡Aquí no!', fr: 'Pas ici !', pt: 'Aqui não!', ja: 'ここじゃない！', zh: '不在这里！' }), 'talk', lang, true, `<div class="cd"><span class="ce">${r.e}</span><em>✖</em>${extra ? `<span class="ce">${extra.e}</span><em>✖</em>` : ''}</div>`);
    g.after(1700, () => { roomEl.classList.remove('on'); busy = false; renderMap(); });
  }
  function reveal(i) {
    busy = true; const b = map.children[i]; b.classList.add('open'); b.innerHTML = charHTML(hider, 'dance') + '<span>!!!</span>'; hid.innerHTML = charHTML(hider); mood($('.char', b), 'happy', 2000);
    [392, 523, 659, 784, 1047].forEach((f, k) => tone(f, .2, 'square', .06, k * .08)); confettiDOM(g, 50); say(T().castHi[hider] || '!', lang, null, hider, $('.char', b)); g.star(3); H.happy();
    g.after(2600, () => { if (!g.alive()) return; if (g.progress()) g.levelUp(); else newCase(); });
  }
  g.levels(5, lv => { L = lv; g.meter(LV[lv].cases); newCase(); });
});

/* WORLD DETECTIVE — Foxy took the Golden Teddy and is hopping around the world! Read the picture clues
   (landmarks, flags, animals, how people say hello), fly after her, and find where she's hiding. */
const WORLD_POLY = [
  [[-168, 66], [-162, 70], [-140, 70], [-125, 70], [-95, 72], [-80, 73], [-62, 66], [-55, 52], [-66, 45], [-70, 42], [-76, 35], [-81, 31], [-80, 25], [-82, 27], [-84, 30], [-90, 29], [-97, 27], [-97, 21], [-92, 18], [-87, 21], [-88, 16], [-83, 10], [-78, 8], [-80, 7], [-86, 12], [-92, 14], [-105, 20], [-110, 24], [-115, 30], [-118, 34], [-124, 40], [-124, 48], [-132, 55], [-140, 60], [-150, 60], [-158, 57], [-165, 62]],
  [[-73, 78], [-60, 82], [-30, 83], [-20, 75], [-22, 70], [-42, 60], [-50, 64], [-55, 70], [-65, 76]],
  [[-78, 8], [-72, 12], [-62, 10], [-50, 0], [-35, -5], [-38, -13], [-40, -22], [-48, -26], [-53, -34], [-58, -38], [-65, -42], [-68, -50], [-70, -55], [-75, -50], [-74, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -5], [-80, 0]],
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [10, 58], [5, 62], [15, 69], [25, 71], [40, 68], [60, 70], [80, 73], [100, 77], [120, 73], [140, 72], [160, 70], [180, 68], [180, 65], [170, 60], [162, 58], [156, 51], [150, 59], [140, 55], [135, 44], [130, 42], [127, 38], [122, 40], [120, 32], [122, 30], [118, 24], [110, 20], [108, 12], [105, 9], [100, 13], [100, 4], [104, 1], [98, 8], [97, 17], [92, 22], [88, 22], [80, 15], [78, 8], [73, 18], [67, 25], [57, 25], [56, 27], [52, 24], [56, 18], [52, 15], [44, 12], [40, 16], [35, 28], [34, 32], [36, 36], [30, 36], [27, 37], [26, 40], [23, 40], [22, 37], [20, 40], [18, 40], [12, 44], [16, 38], [12, 38], [10, 44], [3, 43], [-2, 37]],
  [[-17, 21], [-17, 15], [-12, 8], [-8, 4], [5, 5], [9, 4], [10, -2], [13, -10], [12, -17], [15, -27], [18, -34], [26, -34], [33, -27], [35, -20], [40, -15], [40, -5], [43, 2], [51, 12], [44, 11], [38, 18], [33, 28], [32, 31], [20, 32], [10, 37], [-1, 36], [-6, 36], [-10, 30]],
  [[114, -22], [122, -17], [130, -12], [137, -12], [142, -11], [145, -15], [150, -23], [153, -28], [150, -37], [144, -39], [138, -35], [132, -32], [124, -34], [115, -34], [113, -26]],
  [[-180, -70], [180, -70], [180, -90], [-180, -90]],
  [[130, 31], [135, 34], [140, 35], [142, 40], [141, 45], [144, 44], [140, 38], [136, 36], [132, 33]],
  [[-5, 50], [1, 51], [2, 53], [-1, 55], [-3, 58], [-6, 58], [-5, 55], [-3, 54], [-5, 52]],
  [[95, 5], [106, -6], [104, -5], [98, 1]], [[109, 1], [117, 7], [119, 1], [116, -4], [110, -3]], [[106, -6], [115, -8], [114, -7]],
  [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]], [[167, -46], [174, -41], [178, -38], [173, -35], [172, -41], [166, -45]], [[-24, 64], [-14, 64], [-14, 66.5], [-22, 66.5]],
  [[131, -1], [141, -3], [150, -10], [141, -9], [132, -4]]
];
let WORLD_GRID = null;
function worldGrid(W = 96, H = 48) {
  if (WORLD_GRID) return WORLD_GRID; const grid = new Uint8Array(W * H);
  const inside = (px, py, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) c = !c; } return c; };
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) { const lon = -180 + (c + .5) * 360 / W, lat = 90 - (r + .5) * 180 / H; if (WORLD_POLY.some(p => inside(lon, lat, p))) grid[r * W + c] = 1; }
  return WORLD_GRID = { W, H, grid };
}
function flagSVG(id) {
  const v3 = (a, b, c) => `<rect width="10" height="20" fill="${a}"/><rect x="10" width="10" height="20" fill="${b}"/><rect x="20" width="10" height="20" fill="${c}"/>`;
  const h3 = (a, b, c) => `<rect width="30" height="7" fill="${a}"/><rect y="6.67" width="30" height="6.67" fill="${b}"/><rect y="13.33" width="30" height="6.67" fill="${c}"/>`;
  const uj = `<rect width="30" height="20" fill="#012169"/><path d="M0,0L30,20M30,0L0,20" stroke="#fff" stroke-width="4"/><path d="M0,0L30,20M30,0L0,20" stroke="#C8102E" stroke-width="1.4"/><path d="M15,0V20M0,10H30" stroke="#fff" stroke-width="6"/><path d="M15,0V20M0,10H30" stroke="#C8102E" stroke-width="3.4"/>`;
  const F = {
    fr: v3('#0055A4', '#fff', '#EF4135'), it: v3('#009246', '#fff', '#CE2B37'), mx: v3('#006847', '#fff', '#CE1126') + '<circle cx="15" cy="10" r="2.4" fill="#8B5A2B"/>',
    jp: '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#BC002D"/>',
    eg: h3('#CE1126', '#fff', '#000') + '<circle cx="15" cy="10" r="1.8" fill="#C09300"/>', nl: h3('#AE1C28', '#fff', '#21468B'),
    in: h3('#FF9933', '#fff', '#138808') + '<circle cx="15" cy="10" r="2.4" fill="none" stroke="#000080" stroke-width=".7"/>',
    gb: uj, au: `<rect width="30" height="20" fill="#012169"/><svg width="15" height="10" viewBox="0 0 30 20">${uj}</svg><polygon points="${starPoints(7.5, 15, 2.6, 1.1)}" fill="#fff"/>${[[22, 4], [25, 9], [20, 11], [23, 16]].map(([a, b]) => `<polygon points="${starPoints(a, b, 1.4, .6)}" fill="#fff"/>`).join('')}`,
    us: Array.from({ length: 13 }, (_, i) => `<rect y="${(i * 20 / 13).toFixed(2)}" width="30" height="${(20 / 13 + .05).toFixed(2)}" fill="${i % 2 ? '#fff' : '#B22234'}"/>`).join('') + `<rect width="12" height="10.8" fill="#3C3B6E"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${1.6 + (i % 4) * 2.9}" cy="${1.8 + Math.floor(i / 4) * 3.4}" r=".6" fill="#fff"/>`).join('')}`,
    cn: `<rect width="30" height="20" fill="#DE2910"/><polygon points="${starPoints(5, 5, 3, 1.2)}" fill="#FFDE00"/>${[[10, 2], [12, 4], [12, 7], [10, 9]].map(([a, b]) => `<polygon points="${starPoints(a, b, 1, .4)}" fill="#FFDE00"/>`).join('')}`,
    br: '<rect width="30" height="20" fill="#009C3B"/><polygon points="15,2 28,10 15,18 2,10" fill="#FFDF00"/><circle cx="15" cy="10" r="4.4" fill="#002776"/>',
    ke: '<rect width="30" height="20" fill="#006600"/><rect width="30" height="6" fill="#000"/><rect y="6" width="30" height="8" fill="#fff"/><rect y="7" width="30" height="6" fill="#BB0000"/><ellipse cx="15" cy="10" rx="2.6" ry="5.5" fill="#BB0000" stroke="#000" stroke-width=".8"/>',
    is: '<rect width="30" height="20" fill="#02529C"/><path d="M10,0V20M0,10H30" stroke="#fff" stroke-width="5"/><path d="M10,0V20M0,10H30" stroke="#DC1E35" stroke-width="2.5"/>',
    ca: `<rect width="30" height="20" fill="#fff"/><rect width="7.5" height="20" fill="#D80621"/><rect x="22.5" width="7.5" height="20" fill="#D80621"/><polygon points="${starPoints(15, 10.4, 4.6, 2.2)}" fill="#D80621"/>`,
    kr: '<rect width="30" height="20" fill="#fff"/><path d="M10,10a5,5 0 0 1 10,0z" fill="#CD2E3A"/><path d="M10,10a5,5 0 0 0 10,0z" fill="#0047A0"/>' + [[4, 4, 35], [26, 4, -35], [4, 16, -35], [26, 16, 35]].map(([a, b, r]) => `<g transform="rotate(${r} ${a} ${b})"><rect x="${a - 2}" y="${b - 1.6}" width="4" height=".8" fill="#000"/><rect x="${a - 2}" y="${b - .4}" width="4" height=".8" fill="#000"/><rect x="${a - 2}" y="${b + .8}" width="4" height=".8" fill="#000"/></g>`).join(''),
    aq: '<rect width="30" height="20" fill="#3A7DCE"/><circle cx="15" cy="10" r="5.5" fill="#fff"/>'
  };
  return `<svg class="flg" viewBox="0 0 30 20" preserveAspectRatio="none">${F[id] || F.aq}</svg>`;
}
const CITIES = [
  { id: 'paris', n: 'PARIS', lon: 2.3, lat: 48.9, flag: 'fr', lm: '🗼', an: '🐓', th: '🥐', hi: ['Bonjour !', 'fr'] },
  { id: 'tokyo', n: 'TOKYO', lon: 139.7, lat: 35.7, flag: 'jp', lm: '🗻', an: '🐒', th: '🍣', hi: ['こんにちは！', 'ja'] },
  { id: 'mexico', n: 'MÉXICO', lon: -99.1, lat: 19.4, flag: 'mx', lm: '🌵', an: '🦅', th: '🌮', hi: ['¡Hola!', 'es'] },
  { id: 'cairo', n: 'CAIRO', lon: 31.2, lat: 30.0, flag: 'eg', lm: '🏜️', an: '🐫', th: '⛵', hi: ['Marhaba!', 'ar'] },
  { id: 'sydney', n: 'SYDNEY', lon: 151.2, lat: -33.9, flag: 'au', lm: '🏄', an: '🦘', th: '🪃', hi: ["G'day!", 'en'] },
  { id: 'rio', n: 'RIO', lon: -43.2, lat: -22.9, flag: 'br', lm: '🏖️', an: '🦜', th: '⚽', hi: ['Olá!', 'pt'] },
  { id: 'beijing', n: 'BEIJING', lon: 116.4, lat: 39.9, flag: 'cn', lm: '🏮', an: '🐼', th: '🥟', hi: ['你好！', 'zh'] },
  { id: 'newyork', n: 'NEW YORK', lon: -74, lat: 40.7, flag: 'us', lm: '🗽', an: '🐿️', th: '🚕', hi: ['Hello!', 'en'] },
  { id: 'london', n: 'LONDON', lon: -.1, lat: 51.5, flag: 'gb', lm: '💂', an: '🦢', th: '☂️', hi: ['Hello there!', 'en'] },
  { id: 'nairobi', n: 'NAIROBI', lon: 36.8, lat: -1.3, flag: 'ke', lm: '🦒', an: '🦁', th: '🥁', hi: ['Jambo!', 'sw'] },
  { id: 'rome', n: 'ROME', lon: 12.5, lat: 41.9, flag: 'it', lm: '🏛️', an: '🐺', th: '🍝', hi: ['Ciao!', 'it'] },
  { id: 'mumbai', n: 'MUMBAI', lon: 72.9, lat: 19.1, flag: 'in', lm: '🛺', an: '🐘', th: '🍛', hi: ['Namaste!', 'hi'] },
  { id: 'reykjavik', n: 'ICELAND', lon: -21.9, lat: 64.1, flag: 'is', lm: '🌋', an: '🐋', th: '🧊', hi: ['Halló!', 'is'] },
  { id: 'amsterdam', n: 'AMSTERDAM', lon: 4.9, lat: 52.4, flag: 'nl', lm: '🌷', an: '🐄', th: '🚲', hi: ['Hallo!', 'nl'] },
  { id: 'toronto', n: 'CANADA', lon: -79.4, lat: 43.7, flag: 'ca', lm: '🍁', an: '🦫', th: '🏒', hi: ['Hello! Bonjour!', 'en'] },
  { id: 'seoul', n: 'SEOUL', lon: 127, lat: 37.6, flag: 'kr', lm: '🏯', an: '🐯', th: '🥢', hi: ['안녕하세요!', 'ko'] },
  { id: 'pole', n: 'ANTARCTICA', lon: 30, lat: -76, flag: 'aq', lm: '🧊', an: '🐧', th: '❄️', hi: ['Squawk squawk!', 'en'] }
];
const DETECTIVE_RANKS = [[0, 'ROOKIE'], [2, 'GUMSHOE'], [5, 'DETECTIVE'], [9, 'SUPER SLEUTH'], [14, 'CHIEF']];
const detRank = n => [...DETECTIVE_RANKS].reverse().find(r => n >= r[0])[1];
function sayHello(text, code, who, el) {
  if (L[code]) { say(text, code, null, who, el); return; }
  if (cfg.voiceMode === 'off' || !(cfg.voiceMode === 'all' || VOICE_APP)) return;
  if (ttsReady()) { say(text, 'en', null, who, el); return; }
  if (!('speechSynthesis' in window)) return; stopVoice();
  const u = new SpeechSynthesisUtterance(text), v = speechSynthesis.getVoices().find(x => x.lang.toLowerCase().startsWith(code)); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = code; u.rate = .9; speechSynthesis.speak(u);
}
game('foxhunt', 'learn', '🔎', g => {
  const H = g.host('hoot');
  g.stage.innerHTML = `<div class="fh"><div class="fhMap"><span class="fhRank"></span></div><div class="fhPanel"></div></div>`;
  const mapBox = $('.fhMap', g.stage), panel = $('.fhPanel', g.stage), rankEl = $('.fhRank', g.stage), C = g.canvas(mapBox), x = C.ctx;
  const LV = { 1: { stops: 2, ch: 2, clue: ['lm', 'flag'] }, 2: { stops: 3, ch: 3, clue: ['lm', 'an'] }, 3: { stops: 3, ch: 3, clue: ['an', 'th', 'hi'] }, 4: { stops: 4, ch: 3, clue: ['flag', 'hi'] }, 5: { stops: 5, ch: 4, clue: ['one', 'hi'] } };
  let L = 1, route = [], idx = 0, fly = null, t = 0, mapImg = null, foxGlimpse = 0, visited = [];
  const proj = (lon, lat) => { const mw = Math.min(C.w, C.h * 2), mh = mw / 2, ox = (C.w - mw) / 2, oy = (C.h - mh) / 2; return [ox + (lon + 180) / 360 * mw, oy + (90 - lat) / 180 * mh]; };
  function bakeMap() {
    const { W, H: GH, grid } = worldGrid(), cv = document.createElement('canvas'); cv.width = Math.max(1, C.w * C.dpr); cv.height = Math.max(1, C.h * C.dpr); const c = cv.getContext('2d'); c.scale(C.dpr, C.dpr);
    const mw = Math.min(C.w, C.h * 2), mh = mw / 2, ox = (C.w - mw) / 2, oy = (C.h - mh) / 2, cw = mw / W, chh = mh / GH;
    c.fillStyle = '#000'; c.fillRect(0, 0, C.w, C.h); c.fillStyle = '#071a3a'; c.fillRect(ox, oy, mw, mh);
    for (let r = 0; r < GH; r++) for (let q = 0; q < W; q++) { if (grid[r * W + q]) { c.fillStyle = r > GH * .86 ? '#dfe9ff' : (r + q) % 7 === 0 ? '#14b85d' : TT.green; c.fillRect(ox + q * cw + .5, oy + r * chh + .5, cw - 1, chh - 1); } }
    c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(ox + i * mw / 6, oy); c.lineTo(ox + i * mw / 6, oy + mh); c.stroke(); } for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(ox, oy + i * mh / 4); c.lineTo(ox + mw, oy + i * mh / 4); c.stroke(); }
    mapImg = cv;
  }
  C.onResize = bakeMap; bakeMap();
  const chip = (k, cty) => k === 'flag' ? `<span class="fhChip">${flagSVG(cty.flag)}</span>` : k === 'hi' ? `<button class="fhChip hi">💬 <b>${cty.hi[0]}</b></button>` : `<span class="fhChip">${cty[k]}</span>`;
  function newCase() {
    const c = LV[L]; route = shuffle(CITIES).slice(0, c.stops + 1); idx = 0; visited = [route[0]]; fly = null; foxGlimpse = 0;
    const solved = PROG.detCases || 0; rankEl.textContent = '🔎 ' + detRank(solved);
    panel.innerHTML = `<div class="fhBrief"><div class="fhChief">${charHTML('hoot')}</div><div class="pcard big">${charHTML('foxy')}<b>💨</b><b class="gold">🧸</b></div><button class="slab fhGo">▶</button></div>`;
    H.say(LX({ en: 'Foxy took the golden teddy! Follow the clues!', es: '¡Foxy se llevó el osito dorado! ¡Sigue las pistas!', fr: 'Foxy a pris le nounours doré ! Suis les indices !', pt: 'A Foxy pegou o ursinho dourado! Siga as pistas!', ja: 'フォクシーがきんのくまをもっていったよ！', zh: '狐狸拿走了金色小熊！跟着线索走！' }).replace('Foxy', castName('foxy')), 'talk');
    $('.fhGo', panel).addEventListener('click', () => { SFX.tap(); stop(); });
  }
  function stop() {
    const c = LV[L], here = route[idx], last = idx === route.length - 1; if (last) return hide();
    const next = route[idx + 1], witness = pick(CAST_IDS.filter(n => n !== 'foxy')), kinds = c.clue.map(k => k === 'one' ? pick(['lm', 'an', 'th', 'flag']) : k);
    const opts = shuffle([next, ...shuffle(CITIES.filter(q => !route.includes(q))).slice(0, c.ch - 1)]);
    panel.innerHTML = `<div class="fhCity">${flagSVG(here.flag)}<b>${here.n}</b><span>${here.lm}</span></div>
      <div class="fhWit">${charHTML(witness)}<div class="fhClue">${kinds.map(k => chip(k, next)).join('')}</div></div>
      <div class="fhDest">${opts.map((o, i) => `<button class="fhCard" data-i="${i}">${flagSVG(o.flag)}<span class="lm">${o.lm}</span><b>${o.n}</b></button>`).join('')}</div>`;
    const wel = $('.fhWit .char', panel); mood(wel, 'happy', 900);
    const hi = $('.fhChip.hi', panel); if (hi) { hi.addEventListener('click', () => sayHello(next.hi[0], next.hi[1], witness, wel)); g.after(500, () => sayHello(next.hi[0], next.hi[1], witness, wel)); }
    $$('.fhCard', panel).forEach(b => b.addEventListener('click', () => {
      if (fly) return; const o = opts[+b.dataset.i];
      if (o !== next) { SFX.bad(); retrigger(b, 'shake'); b.classList.add('nope'); H.mood('oops'); return; }
      SFX.good(); g.star(1); H.happy(); $$('.fhCard', panel).forEach(q => q.disabled = true); b.classList.add('pick'); fly = { a: here, b: next, t: 0 }; SFX.whoosh();
    }));
  }
  function arrive() { idx++; visited.push(route[idx]); fly = null; foxGlimpse = 1.6; tone(523, .1, 'square', .05); tone(784, .15, 'square', .05, .1); stop(); }
  function hide() {
    const here = route[idx], spots = shuffle([here.lm, here.th, pick(['🌳', '🏠', '📦', '🚗', '🛖', '🪨'])]), at = randi(0, 2), fakes = shuffle(['🐈', '🐦', '🐿️', '🐢', '🦔']);
    panel.innerHTML = `<div class="fhCity">${flagSVG(here.flag)}<b>${here.n}</b><span>${here.an}</span></div><div class="fhHide">${spots.map((s, i) => `<button class="fhSpot" data-i="${i}"><b>${s}</b></button>`).join('')}</div>`;
    H.say(LX({ en: 'Foxy is hiding here! Where?', es: '¡Foxy se esconde aquí! ¿Dónde?', fr: 'Foxy se cache ici ! Où ?', pt: 'A Foxy está escondida aqui! Onde?', ja: 'ここにかくれてる！どこかな？', zh: '狐狸藏在这里！在哪儿？' }).replace('Foxy', castName('foxy')), 'talk');
    $$('.fhSpot', panel).forEach((b, i) => b.addEventListener('click', () => {
      if (b.classList.contains('done')) return;
      if (i !== at) { b.classList.add('done'); b.innerHTML = `<b>${fakes[i]}</b>`; SFX.boing(); return; }
      b.classList.add('done', 'got'); b.innerHTML = charHTML('foxy', 'dance') + '<b class="gold">🧸</b>'; $$('.fhSpot', panel).forEach(q => q.disabled = true);
      const before = detRank(PROG.detCases || 0); PROG.detCases = (PROG.detCases || 0) + 1; saveProg(); const after = detRank(PROG.detCases);
      confettiDOM(g, 60); SFX.chime(); g.star(3); H.happy(); say(T().castHi.foxy, lang, null, 'foxy', $('.char', b)); rankEl.textContent = '🔎 ' + after;
      if (after !== before) g.after(1200, () => { H.bubble(`🎖️ ${after}!`); [523, 659, 784, 1047].forEach((f, k) => tone(f, .25, 'square', .06, k * .12)); });
      g.after(3000, () => { if (!g.alive()) return; if (g.progress()) g.levelUp(); else newCase(); });
    }));
  }
  g.levels(5, lv => { L = lv; g.meter(lv <= 2 ? 2 : 3); newCase(); });
  g.loop(dt => {
    t += dt; if (!mapImg) return; x.drawImage(mapImg, 0, 0, C.w, C.h); const R = Math.min(C.w, C.h * 2);
    x.setLineDash([4, 4]); x.strokeStyle = TT.yellow; x.lineWidth = 2; x.beginPath(); visited.forEach((c, i) => { const [px, py] = proj(c.lon, c.lat); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); x.setLineDash([]);
    visited.forEach((c, i) => { const [px, py] = proj(c.lon, c.lat), cur = i === visited.length - 1 && !fly; x.fillStyle = cur ? ((t * 3 | 0) % 2 ? TT.red : TT.white) : TT.yellow; const s = R * (cur ? .016 : .011); x.fillRect(px - s, py - s, s * 2, s * 2); if (cur) { x.font = `bold ${R * .022}px ${PXF}`; x.fillStyle = TT.white; x.textAlign = 'center'; x.fillText(c.n, px, py - s * 2.2); } });
    if (foxGlimpse > 0) { foxGlimpse -= dt; const c = visited[visited.length - 1], [px, py] = proj(c.lon, c.lat); x.globalAlpha = Math.min(1, foxGlimpse); drawSprite(x, 'foxy', 'run1', px + (1.6 - foxGlimpse) * R * .06, py + R * .02, R * .05, { flip: false }); x.globalAlpha = 1; }
    if (fly) {
      fly.t = Math.min(1, fly.t + dt / 1.7); const [ax, ay] = proj(fly.a.lon, fly.a.lat), [bx, by] = proj(fly.b.lon, fly.b.lat), u = fly.t, e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      const mx = (ax + bx) / 2, my = (ay + by) / 2 - Math.hypot(bx - ax, by - ay) * .25, qx = (1 - e) * (1 - e) * ax + 2 * (1 - e) * e * mx + e * e * bx, qy = (1 - e) * (1 - e) * ay + 2 * (1 - e) * e * my + e * e * by;
      const tx = 2 * (1 - e) * (mx - ax) + 2 * e * (bx - mx), ty = 2 * (1 - e) * (my - ay) + 2 * e * (by - my);
      x.strokeStyle = 'rgba(255,255,255,.6)'; x.setLineDash([2, 5]); x.beginPath(); x.moveTo(ax, ay); x.quadraticCurveTo(mx, my, bx, by); x.stroke(); x.setLineDash([]);
      x.save(); x.translate(qx, qy); x.rotate(Math.atan2(ty, tx) + Math.PI / 4); x.font = `${R * .05}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('✈️', 0, 0); x.restore();
      if (fly.t >= 1) arrive();
    }
  });
});
