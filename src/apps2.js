/* ═════════ NEW APPS · part 2 — zoo, science, puzzles, color hunt, silly mirror ═════════ */

/* ZOO — visit, feed, and find where animals live */
const ZOO_FOOD = [['🐒', '🍌'], ['🐰', '🥕'], ['🐼', '🎋'], ['🐭', '🧀'], ['🐶', '🦴'], ['🐝', '🌻'], ['🐿️', '🌰'], ['🐧', '🐟'], ['🐮', '🌾'], ['🐻', '🍯'], ['🐔', '🌽'], ['🐴', '🍎']];
const ZOO_HOME = [['🌊', '#0b2a55', ['🐳', '🐙', '🦀', '🐬', '🦈', '🐠']], ['🌴', '#0d3a1e', ['🐒', '🦜', '🐯', '🐍', '🦍', '🦥']], ['🧊', '#cfe8ff', ['🐧', '🐻‍❄️', '🦭']], ['🚜', '#4a3a12', ['🐮', '🐷', '🐔', '🐑', '🐴']], ['🌲', '#123a22', ['🦉', '🦊', '🐻', '🦌', '🦔']], ['🏜️', '#6b4a1a', ['🐫', '🦂', '🦎']]];
const ANIMAL_TUNE = e => { const h = [...e].reduce((a, c) => a + c.codePointAt(0), 0); return [0, 1, 2].map(i => PENTA[(h >> (i * 2)) % 10]); };
game('zoo', 'play', '🦒', g => {
  const H = g.host('foxy'); let busy = false, target = null, seen = new Set();
  g.stage.innerHTML = `<div class="zooAsk"></div><div class="zoo"></div><div class="zooChoices"></div>`;
  const zoo = $('.zoo', g.stage), ask = $('.zooAsk', g.stage), ch = $('.zooChoices', g.stage);
  const hop = (b, e) => { retrigger(b, 'hop'); ANIMAL_TUNE(e).forEach((f, i) => tone(f, .14, 'square', .05, i * .1)); };
  const pen = (e, bg) => { const b = mk('button', 'pen'); b.innerHTML = `<span class="an">${e}</span>`; if (bg) b.style.background = bg; zoo.appendChild(b); return b; };
  function round() {
    busy = false; zoo.innerHTML = ''; ch.innerHTML = ''; ask.innerHTML = ''; const lv = g.lvl();
    if (lv === 1) {
      const list = shuffle(ZOO_HOME.flatMap(h => h[2].map(a => [a, h[1]]))).slice(0, 8);
      list.forEach(([e, bg]) => { const b = pen(e, bg); b.addEventListener('click', () => { hop(b, e); const fx = mk('span', 'zfx', pick(['❤️', '✨', '🎵', '💤', '😄'])); b.appendChild(fx); setTimeout(() => fx.remove(), 1000); if (!seen.has(e)) { seen.add(e); g.star(1); b.classList.add('seen'); if (g.progress()) g.after(900, () => g.levelUp()); } }); });
      H.bubble('👆 🦒'); return;
    }
    if (lv === 2) {
      const opts = shuffle(ZOO_FOOD).slice(0, 4); target = pick(opts);
      ask.innerHTML = `<span class="food pop">${target[1]}</span>`; H.say('', 'talk', lang, 0, CARD.emoji(target[1], '❓'));
      opts.forEach(o => { const b = pen(o[0]); b.addEventListener('click', () => { if (busy) return; if (o === target) { busy = true; b.classList.add('seen'); hop(b, o[0]); const f = mk('span', 'zfx eat', target[1]); b.appendChild(f); SFX.good(); H.happy(); g.star(1); g.after(1500, () => { if (g.progress()) g.levelUp(); else round(); }); } else { SFX.bad(); retrigger(b, 'shake'); H.mood('oops'); } }); });
      return;
    }
    const homes = shuffle(ZOO_HOME).slice(0, 3), home = pick(homes), a = pick(home[2]); target = home;
    ask.innerHTML = `<span class="food pop">${a}</span>`; H.say('', 'talk', lang, 0, CARD.emoji(a, '🏠?'));
    homes.forEach(h => { const b = mk('button', 'habitat', h[0]); b.style.background = h[1]; b.addEventListener('click', () => { if (busy) return; if (h === target) { busy = true; b.innerHTML = `${h[0]}<span class="an hop">${a}</span>`; hop(b, a); SFX.good(); H.happy(); g.star(1); g.after(1500, () => { if (g.progress()) g.levelUp(); else round(); }); } else { SFX.bad(); retrigger(b, 'shake'); H.mood('oops'); } }); ch.appendChild(b); });
  }
  g.levels(3, lv => { seen.clear(); g.meter(lv === 1 ? 8 : 6); round(); });
});

/* SCIENCE LAB — predict, then watch what happens */
const SINK = [['🪨', 1], ['🦆', 0], ['🍎', 0], ['🔑', 1], ['🪵', 0], ['🪙', 1], ['🎈', 0], ['⚓', 1], ['🧽', 0], ['🥄', 1], ['🏐', 0], ['🔩', 1], ['🍃', 0], ['🧱', 1]];
const MAGNET = [['🔩', 1], ['📎', 1], ['🔑', 1], ['🥄', 1], ['🪙', 1], ['🧸', 0], ['🍌', 0], ['✏️', 0], ['🧦', 0], ['🍪', 0], ['🎈', 0], ['📘', 0]];
const TEMP = [['🍦', 0], ['⛄', 0], ['🧊', 0], ['🐧', 0], ['❄️', 0], ['🥶', 0], ['☕', 1], ['🔥', 1], ['☀️', 1], ['🌶️', 1], ['🍲', 1], ['🌋', 1]];
game('lab', 'learn', '🔬', g => {
  const H = g.host('hoot'); let busy = false, item = null, plant = 0, water = 0;
  g.stage.innerHTML = `<div class="labTop"></div><div class="labMain"></div><div class="labBtns"></div>`;
  const top = $('.labTop', g.stage), main = $('.labMain', g.stage), btns = $('.labBtns', g.stage);
  const next = () => g.after(1700, () => { if (g.progress()) g.levelUp(); else round(); });
  function round() {
    busy = false; top.innerHTML = ''; main.innerHTML = ''; btns.innerHTML = ''; const lv = g.lvl();
    if (lv === 1) {
      item = pick(SINK); main.innerHTML = `<div class="tank"><div class="water"></div><span class="obj">${item[0]}</span></div>`; const obj = $('.obj', main);
      H.say('', 'talk', lang, 0, CARD.wrap(`<b class="ce">${item[0]}</b><b class="ce sm">⬇ ⬆</b>`));
      [['⬇', 1], ['⬆', 0]].forEach(([ic, v]) => { const b = mk('button', 'slab nbtn', ic); b.addEventListener('click', () => { if (busy) return; busy = true; obj.classList.add(item[1] ? 'sink' : 'float'); noise(.5, .25, 'lowpass', 900, .35); g.after(1200, () => { if (v === item[1]) { b.classList.add('right'); SFX.good(); H.happy(); g.star(1); } else { H.mood('oops'); tone(330, .3, 'triangle', .12); } next(); }); }); btns.appendChild(b); });
    } else if (lv === 2) {
      const metal = pick(MAGNET.filter(m => m[1])), others = shuffle(MAGNET.filter(m => !m[1])).slice(0, 2), list = shuffle([metal, ...others]);
      top.innerHTML = '<span class="magnet">🧲</span>'; H.say('', 'talk', lang, 0, CARD.emoji('🧲', '?'));
      list.forEach(m => { const b = mk('button', 'labItem', m[0]); b.addEventListener('click', () => { if (busy) return; if (m[1]) { busy = true; b.classList.add('stick'); DRUM.bell(1568); SFX.good(); H.happy(); g.star(1); next(); } else { retrigger(b, 'shake'); tone(200, .15, 'triangle', .12); H.mood('oops'); } }); main.appendChild(b); });
    } else if (lv === 3) {
      item = pick(TEMP); top.innerHTML = `<span class="obj big pop">${item[0]}</span>`; H.say('', 'talk', lang, 0, CARD.wrap(`<b class="ce">${item[0]}</b><b class="ce sm">❄️ 🔥</b>`));
      [['❄️', 0, '#0b2a55'], ['🔥', 1, '#4a1508']].forEach(([ic, v, bg]) => { const b = mk('button', 'bin', ic); b.style.background = bg; b.addEventListener('click', () => { if (busy) return; if (v === item[1]) { busy = true; b.innerHTML = `${ic}<span class="in">${item[0]}</span>`; top.innerHTML = ''; SFX.good(); H.happy(); g.star(1); next(); } else { retrigger(b, 'shake'); SFX.bad(); H.mood('oops'); } }); main.appendChild(b); });
    } else {
      plant = 0; water = 0; const STG = ['🟫', '🌱', '🌿', '🪴', '🌷', '🌻'];
      main.innerHTML = `<div class="sky"><span class="sun">☀️</span></div><div class="pot"><span class="plant">${STG[0]}</span></div>`; const pl = $('.plant', main), sky = $('.sky', main);
      H.say('', 'talk', lang, 0, CARD.wrap('<b class="ce sm">💧 ☀️</b>', '🌻'));
      let need = 'water';
      const grow = () => { plant++; pl.textContent = STG[plant]; retrigger(pl, 'pop'); tone(PENTA[plant + 3], .25, 'triangle', .16); if (plant >= 5) { busy = true; SFX.chime(); H.happy(); g.star(3); g.after(1800, () => { if (g.progress()) g.levelUp(); else round(); }); } };
      [['💧', 'water'], ['☀️', 'sun']].forEach(([ic, k]) => { const b = mk('button', 'slab nbtn', ic); b.addEventListener('click', () => { if (busy) return; const fx = mk('span', 'labFx', k === 'water' ? '💧💧💧' : '✨'); main.appendChild(fx); setTimeout(() => fx.remove(), 900); if (k === 'sun') { sky.classList.add('shine'); setTimeout(() => sky.classList.remove('shine'), 900); }
        if (k === need) { need = need === 'water' ? 'sun' : 'water'; water = 0; grow(); } else { water++; if (k === 'water' && water >= 2) { pl.parentElement.classList.add('puddle'); setTimeout(() => pl.parentElement.classList.remove('puddle'), 1200); } H.bubble(need === 'water' ? '💧' : '☀️'); tone(260, .2, 'triangle', .1); } }); btns.appendChild(b); });
    }
  }
  g.levels(4, lv => { g.meter(lv === 4 ? 2 : 6); round(); });
});

/* PUZZLES — jigsaws, then mazes */
function puzzlePicture(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), th = THEMES[weekTheme()], col = pick(COLORS);
  const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, col); gr.addColorStop(1, '#000'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(rand(0, w), rand(0, h), rand(30, 90), 0, 7); x.fill(); }
  x.textAlign = 'center'; x.textBaseline = 'middle';
  shuffle(th.set).slice(0, 5).forEach((e, i) => { x.font = `${h * .16}px sans-serif`; x.fillText(e, w * (.12 + (i % 5) * .19), h * (i % 2 ? .2 : .82)); });
  const n = pick(CAST_IDS), im = spriteImg(n, 'happy'); try { x.imageSmoothingEnabled = false; x.drawImage(im, w * .3, h * .18, h * .52, h * .65); } catch (e) {}
  x.font = `${h * .3}px sans-serif`; x.fillText(th.e, w * .78, h * .5);
  return c.toDataURL('image/jpeg', .9);
}
function mazeGen(cw, ch) {
  const walls = Array.from({ length: cw * ch }, () => [1, 1, 1, 1]), seen = new Set([0]), stack = [0];
  while (stack.length) { const c = stack[stack.length - 1], x = c % cw, y = (c / cw) | 0; const n = [[0, -1, 0, 2], [1, 0, 1, 3], [0, 1, 2, 0], [-1, 0, 3, 1]].map(([dx, dy, a, b]) => [x + dx, y + dy, a, b]).filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < cw && ny < ch && !seen.has(ny * cw + nx)); if (!n.length) { stack.pop(); continue; } const [nx, ny, a, b] = pick(n), ni = ny * cw + nx; walls[c][a] = 0; walls[ni][b] = 0; seen.add(ni); stack.push(ni); }
  return walls;
}
game('puzzles', 'learn', '🧩', g => {
  const H = g.host('hoot'); g.stage.innerHTML = '<div class="pzl"></div>'; const box = $('.pzl', g.stage);
  const SIZES = { 1: [2, 2], 2: [3, 2], 3: [3, 3], 4: [5, 4], 5: [7, 5], 6: [9, 6] };
  function jigsaw(cols, rows) {
    const W = 600, Hh = 420, url = puzzlePicture(W, Hh);
    box.style.cssText = `--cols:${cols};--rows:${rows}`; box.innerHTML = `<div class="jBoard" style="background-image:url(${url})"></div><div class="jTray"></div>`;
    const board = $('.jBoard', box), tray = $('.jTray', box); let placed = 0;
    for (let i = 0; i < cols * rows; i++) board.appendChild(mk('div', 'jSlot'));
    shuffle([...Array(cols * rows).keys()]).forEach(i => {
      const p = mk('div', 'jPiece'), cx = i % cols, cy = (i / cols) | 0;
      p.style.backgroundImage = `url(${url})`; p.style.backgroundSize = `${cols * 100}% ${rows * 100}%`; p.style.backgroundPosition = `${cols > 1 ? cx / (cols - 1) * 100 : 0}% ${rows > 1 ? cy / (rows - 1) * 100 : 0}%`; p.style.setProperty('--r', rand(-12, 12) + 'deg'); tray.appendChild(p);
      let d = null;
      p.addEventListener('pointerdown', e => { if (p.classList.contains('done')) return; const r = p.getBoundingClientRect(); d = { ox: e.clientX - r.left, oy: e.clientY - r.top, w: r.width, h: r.height }; p.classList.add('drag'); document.body.appendChild(p); Object.assign(p.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); try { p.setPointerCapture(e.pointerId); } catch (_) {} tone(500, .05, 'triangle', .1); });
      p.addEventListener('pointermove', e => { if (!d) return; p.style.left = (e.clientX - d.ox) + 'px'; p.style.top = (e.clientY - d.oy) + 'px'; });
      const drop = e => {
        if (!d) return; const slot = board.children[i].getBoundingClientRect(), pr = p.getBoundingClientRect(); d = null; p.classList.remove('drag');
        if (Math.hypot(pr.left + pr.width / 2 - slot.left - slot.width / 2, pr.top + pr.height / 2 - slot.top - slot.height / 2) < slot.width * .55) {
          p.removeAttribute('style'); p.style.backgroundImage = `url(${url})`; p.style.backgroundSize = `${cols * 100}% ${rows * 100}%`; p.style.backgroundPosition = `${cols > 1 ? cx / (cols - 1) * 100 : 0}% ${rows > 1 ? cy / (rows - 1) * 100 : 0}%`;
          p.classList.add('done'); board.children[i].appendChild(p); SFX.coin(); placed++;
          if (placed === cols * rows) { board.classList.add('whole'); SFX.chime(); H.happy(); g.star(2); g.after(1600, () => { if (g.progress()) g.levelUp(); else round(); }); }
        } else { p.removeAttribute('style'); p.style.backgroundImage = `url(${url})`; p.style.backgroundSize = `${cols * 100}% ${rows * 100}%`; p.style.backgroundPosition = `${cols > 1 ? cx / (cols - 1) * 100 : 0}% ${rows > 1 ? cy / (rows - 1) * 100 : 0}%`; p.style.setProperty('--r', rand(-12, 12) + 'deg'); tray.appendChild(p); H.mood('oops', 500); }
      };
      p.addEventListener('pointerup', drop); p.addEventListener('pointercancel', drop);
      g.dispose(() => p.remove());
    });
    H.bubble('🧩');
  }
  function maze(cw, ch) {
    box.style.cssText = '';
    const walls = mazeGen(cw, ch); let me = 0; const goal = cw * ch - 1;
    box.innerHTML = `<div class="maze" style="--mw:${cw};--mh:${ch}"><svg viewBox="0 0 ${cw} ${ch}" preserveAspectRatio="none"></svg><div class="mGoal">⭐</div><div class="mMe">${charHTML(PROG.buddy || 'robo')}</div></div>`;
    const mz = $('.maze', box), svg = $('svg', mz), meEl = $('.mMe', mz), goalEl = $('.mGoal', mz);
    let lines = ''; walls.forEach((w, i) => { const x = i % cw, y = (i / cw) | 0; if (w[0]) lines += `M${x} ${y}h1`; if (w[3]) lines += `M${x} ${y}v1`; if (x === cw - 1 && w[1]) lines += `M${x + 1} ${y}v1`; if (y === ch - 1 && w[2]) lines += `M${x} ${y + 1}h1`; });
    svg.innerHTML = `<path d="${lines}" stroke="${pick([TT.blue, TT.green, TT.red, TT.yellow])}" stroke-width=".14" stroke-linecap="square" fill="none"/>`;
    const pos = (el, i) => { el.style.left = ((i % cw) + .5) / cw * 100 + '%'; el.style.top = (((i / cw) | 0) + .5) / ch * 100 + '%'; };
    pos(goalEl, goal); pos(meEl, me); const trail = [];
    const move = to => {
      const x = me % cw, y = (me / cw) | 0, tx = to % cw, ty = (to / cw) | 0, d = tx - x === 1 && ty === y ? 1 : tx - x === -1 && ty === y ? 3 : ty - y === 1 && tx === x ? 2 : ty - y === -1 && tx === x ? 0 : -1;
      if (d < 0 || walls[me][d]) return false; const dot = mk('i', 'mDot'); pos(dot, me); mz.insertBefore(dot, goalEl); trail.push(dot); me = to; pos(meEl, me); tone(PENTA[(x + y) % 10], .06, 'triangle', .08);
      if (me === goal) { SFX.chime(); H.happy(); g.star(2); moodFn($('.char', meEl), 'happy', 1500); g.after(1500, () => { if (g.progress()) g.levelUp(); else round(); }); }
      return true;
    };
    let drag = false;
    const cellAt = e => { const r = mz.getBoundingClientRect(), cx = Math.floor((e.clientX - r.left) / r.width * cw), cy = Math.floor((e.clientY - r.top) / r.height * ch); return cx >= 0 && cy >= 0 && cx < cw && cy < ch ? cy * cw + cx : -1; };
    g.on(mz, 'pointerdown', e => { drag = true; try { mz.setPointerCapture(e.pointerId); } catch (_) {} });
    const toward = c => { for (let k = 0; k < 4 && me !== c && me !== goal; k++) { const dx = (c % cw) - (me % cw), dy = ((c / cw) | 0) - ((me / cw) | 0), opts = Math.abs(dx) >= Math.abs(dy) ? [[Math.sign(dx), 0], [0, Math.sign(dy)]] : [[0, Math.sign(dy)], [Math.sign(dx), 0]]; let ok = false; for (const [ax, ay] of opts) { if ((ax || ay) && move(me + ax + ay * cw)) { ok = true; break; } } if (!ok) break; } };
    g.on(mz, 'pointermove', e => { if (!drag || me === goal) return; const c = cellAt(e); if (c >= 0 && c !== me) toward(c); });
    ['pointerup', 'pointercancel'].forEach(ev => g.on(mz, ev, () => { drag = false; }));
    g.key = e => { const k = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cw, ArrowUp: -cw }[e.key]; if (k && me !== goal) move(me + k); };
    H.bubble('👆 ⭐');
  }
  const round = () => { g.key = null; const [a, b] = SIZES[g.lvl()]; g.lvl() <= 3 ? jigsaw(a, b) : maze(a, b); };
  g.levels(6, lv => { g.meter(3); round(); });
});

/* camera helper — local only; nothing is sent anywhere */
async function openCam(g, video, msg) {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false });
    if (!g.alive()) { s.getTracks().forEach(t => t.stop()); return null; }
    video.srcObject = s; await video.play().catch(() => {}); g.dispose(() => s.getTracks().forEach(t => t.stop())); return s;
  } catch (e) { if (msg) { msg.textContent = '📷 ✖'; msg.classList.add('on'); } return null; }
}
const rgb2hsv = (r, g_, b) => { r /= 255; g_ /= 255; b /= 255; const mx = Math.max(r, g_, b), mn = Math.min(r, g_, b), d = mx - mn; let h = 0; if (d) h = mx === r ? ((g_ - b) / d) % 6 : mx === g_ ? (b - r) / d + 2 : (r - g_) / d + 4; return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx]; };
const hueName = (h, s, v) => { if (v < .22 || s < .28) return -1; if (h < 14 || h >= 340) return 0; if (h < 40) return 1; if (h < 70) return 2; if (h < 170) return 3; if (h < 255) return 4; if (h < 295) return 5; return 6; };

/* COLOR HUNT — find something that colour and hold it up to the camera */
game('colorhunt', 'make', '🔍', g => {
  const H = g.host('foxy'); let target = 0, hold = 0, busy = false;
  g.stage.innerHTML = `<div class="tv camTv hunt"><video playsinline muted></video><div class="reticle"><i></i></div><div class="camMsg"></div></div><div class="huntSide"><div class="huntCard"></div><div class="huntRing"><i></i></div><div class="huntGot"></div></div>`;
  const video = $('video', g.stage), ret = $('.reticle', g.stage), ring = $('.huntRing i', g.stage), card = $('.huntCard', g.stage), got = $('.huntGot', g.stage), tv = $('.camTv', g.stage);
  const cv = document.createElement('canvas'); cv.width = 32; cv.height = 32; const cx = cv.getContext('2d', { willReadFrequently: true });
  const pool = () => g.lvl() === 1 ? [0, 2, 3, 4] : [0, 1, 2, 3, 4, 5, 6];
  const ask = () => { busy = false; hold = 0; target = pick(pool().filter(c => c !== target)); card.innerHTML = `<i style="background:${COLORS[target]}"></i>`; retrigger(card, 'pop'); H.say(cap(T().colors[target]) + '!', 'talk', lang, 0, CARD.color(target, '🔍')); };
  openCam(g, video, $('.camMsg', g.stage)).then(s => { if (s) ask(); });
  g.loop(dt => {
    if (!video.videoWidth || busy) return;
    const vw = video.videoWidth, vh = video.videoHeight, sz = Math.min(vw, vh) * .22; cx.drawImage(video, vw / 2 - sz / 2, vh / 2 - sz / 2, sz, sz, 0, 0, 32, 32);
    const d = cx.getImageData(0, 0, 32, 32).data; let r = 0, gg = 0, b = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; } const n = d.length / 4; r /= n; gg /= n; b /= n;
    const [h, s, v] = rgb2hsv(r, gg, b), seen = hueName(h, s, v); ret.style.setProperty('--seen', `rgb(${r | 0},${gg | 0},${b | 0})`);
    hold = seen === target ? hold + dt : Math.max(0, hold - dt * 2); ring.style.width = Math.min(100, hold / .9 * 100) + '%';
    if (hold > .9) {
      busy = true; tv.classList.remove('flash'); void tv.offsetWidth; tv.classList.add('flash'); SFX.chime(); H.happy(); g.star(1);
      const snap = document.createElement('canvas'); snap.width = 240; snap.height = 180; const sx = snap.getContext('2d'); sx.translate(240, 0); sx.scale(-1, 1); sx.drawImage(video, 0, 0, 240, 180); const url = snap.toDataURL('image/jpeg', .8);
      MEDIA.add('photo', { url, label: COLORS[target], src: 'hunt' }); const t = mk('div', 'huntThumb pop'); t.style.backgroundImage = `url(${url})`; t.style.borderColor = COLORS[target]; got.prepend(t); while (got.children.length > 4) got.lastChild.remove();
      g.after(1600, () => { if (g.progress()) g.levelUp(); else ask(); });
    }
  });
  g.levels(2, lv => { g.meter(lv === 1 ? 4 : 6); if (video.srcObject) ask(); });
});

/* SILLY MIRROR — camera effects + stamp stickers + snapshots (local only) */
game('mirror', 'make', '🪞', g => {
  const H = g.host('dino'); let fx = 0, stamp = null, t = 0;
  g.stage.innerHTML = `<div class="tv camTv mirror"><video playsinline muted></video><canvas class="mcv"></canvas><div class="stamps"></div><div class="camMsg"></div></div><div class="bbar mBar"></div>`;
  const video = $('video', g.stage), cv = $('.mcv', g.stage), x = cv.getContext('2d', { willReadFrequently: true }), stamps = $('.stamps', g.stage), bar = $('.mBar', g.stage), tv = $('.camTv', g.stage);
  const small = document.createElement('canvas'), sx = small.getContext('2d', { willReadFrequently: true });
  const FX = ['🙂', '👾', '🌈', '❄️', '🌊', '🔥', '🫥'];
  FX.forEach((e, i) => { const b = mk('button', 'swatch' + (i === 0 ? ' sel' : ''), e); b.dataset.fx = i; b.addEventListener('click', () => { fx = i; stamp = null; $$('.swatch', bar).forEach(z => z.classList.toggle('sel', z === b)); SFX.boing(); }); bar.appendChild(b); });
  bar.appendChild(mk('span', 'gap'));
  ['🎩', '👑', '🕶️', '🥸', '🐱', '⭐', '❤️'].forEach(e => { const b = mk('button', 'swatch', e); b.addEventListener('click', () => { stamp = e; $$('.swatch', bar).forEach(z => z.classList.toggle('sel', z === b)); SFX.tap(); }); bar.appendChild(b); });
  bar.appendChild(mk('span', 'gap'));
  const snapB = mk('button', 'swatch go', '📸'); bar.appendChild(snapB);
  g.on(tv, 'pointerdown', e => {
    if (e.target.classList.contains('stampEl')) { const el = e.target, r = tv.getBoundingClientRect(); try { el.setPointerCapture(e.pointerId); } catch (_) {} const mv = ev => { el.style.left = (ev.clientX - r.left) / r.width * 100 + '%'; el.style.top = (ev.clientY - r.top) / r.height * 100 + '%'; }; el.onpointermove = mv; el.onpointerup = () => { el.onpointermove = null; }; return; }
    if (!stamp) { fx = (fx + 1) % FX.length; $$('.swatch', bar).forEach(z => z.classList.toggle('sel', +z.dataset.fx === fx)); SFX.boing(); return; }
    const r = tv.getBoundingClientRect(), s = mk('span', 'stampEl pop', stamp); s.style.left = (e.clientX - r.left) / r.width * 100 + '%'; s.style.top = (e.clientY - r.top) / r.height * 100 + '%'; stamps.appendChild(s); tone(PENTA[randi(4, 9)], .12, 'triangle', .15); if (stamps.children.length > 12) stamps.firstChild.remove();
  });
  snapB.addEventListener('click', () => {
    if (!video.videoWidth) return; tv.classList.remove('flash'); void tv.offsetWidth; tv.classList.add('flash'); SFX.crackle();
    const o = document.createElement('canvas'); o.width = 480; o.height = 360; const ox = o.getContext('2d'); ox.drawImage(cv, 0, 0, 480, 360);
    const r = tv.getBoundingClientRect(); ox.textAlign = 'center'; ox.textBaseline = 'middle'; $$('.stampEl', stamps).forEach(s => { const sr = s.getBoundingClientRect(); ox.font = `${sr.height / r.height * 360 * .9}px sans-serif`; ox.fillText(s.textContent, (sr.left + sr.width / 2 - r.left) / r.width * 480, (sr.top + sr.height / 2 - r.top) / r.height * 360); });
    MEDIA.add('photo', { url: o.toDataURL('image/jpeg', .85), src: 'mirror' }); g.star(1); H.happy();
  });
  openCam(g, video, $('.camMsg', g.stage));
  const PAL = [[0, 0, 0], [242, 242, 238], [255, 61, 61], [25, 211, 107], [59, 98, 255], [255, 214, 10], [155, 93, 229], [31, 199, 182]];
  g.loop(dt => {
    t += dt; if (!video.videoWidth) return; const W = cv.width = 480, Hh = cv.height = 360;
    x.save(); x.translate(W, 0); x.scale(-1, 1);
    if (fx === 1) { small.width = 64; small.height = 48; sx.drawImage(video, 0, 0, 64, 48); const d = sx.getImageData(0, 0, 64, 48), p = d.data; for (let i = 0; i < p.length; i += 4) { let best = 0, bd = 1e9; PAL.forEach((c, k) => { const dd = (p[i] - c[0]) ** 2 + (p[i + 1] - c[1]) ** 2 + (p[i + 2] - c[2]) ** 2; if (dd < bd) { bd = dd; best = k; } }); [p[i], p[i + 1], p[i + 2]] = PAL[best]; } sx.putImageData(d, 0, 0); x.imageSmoothingEnabled = false; x.drawImage(small, 0, 0, W, Hh); }
    else if (fx === 3) { const vw = video.videoWidth, vh = video.videoHeight; small.width = W / 2; small.height = Hh / 2; sx.save(); sx.translate(W / 2, 0); sx.scale(-1, 1); sx.drawImage(video, vw / 2, vh * .15, vw / 2, vh / 2, 0, 0, W / 2, Hh / 2); sx.restore(); x.restore(); x.save(); x.drawImage(small, 0, 0); x.setTransform(-1, 0, 0, 1, W, 0); x.drawImage(small, 0, 0); x.setTransform(1, 0, 0, -1, 0, Hh); x.drawImage(small, 0, 0); x.setTransform(-1, 0, 0, -1, W, Hh); x.drawImage(small, 0, 0); }
    else if (fx === 4) { for (let y = 0; y < Hh; y += 6) { const off = Math.sin(y / 22 + t * 4) * 18; x.drawImage(video, 0, y / Hh * video.videoHeight, video.videoWidth, 6 / Hh * video.videoHeight, off, y, W, 6); } }
    else if (fx === 6) { x.drawImage(video, 0, 0, video.videoWidth / 2, video.videoHeight, 0, 0, W / 2, Hh); x.translate(W, 0); x.scale(-1, 1); x.drawImage(video, 0, 0, video.videoWidth / 2, video.videoHeight, 0, 0, W / 2, Hh); }
    else x.drawImage(video, 0, 0, W, Hh);
    x.restore();
    if (fx === 2) { x.globalCompositeOperation = 'color'; const gr = x.createLinearGradient(0, 0, W, Hh); for (let i = 0; i < 7; i++) gr.addColorStop(i / 6, `hsl(${(t * 80 + i * 50) % 360} 90% 50%)`); x.fillStyle = gr; x.fillRect(0, 0, W, Hh); x.globalCompositeOperation = 'source-over'; }
    if (fx === 5) { const d = x.getImageData(0, 0, W, Hh), p = d.data; for (let i = 0; i < p.length; i += 4) { const l = (p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11) / 255; p[i] = Math.min(255, l * 2 * 255); p[i + 1] = Math.max(0, (l - .35) * 2 * 255); p[i + 2] = Math.max(0, (.5 - l) * 2 * 200); } x.putImageData(d, 0, 0); }
  });
  H.bubble('👆 🪞 📸');
});
