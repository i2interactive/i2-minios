/* ═════════ NEW APPS · part 1 — names, media, town, garage, kitchen, sticker maker ═════════ */
const LANG6 = ['en', 'es', 'fr', 'pt', 'ja', 'zh'];
const APP_NAMES = {
  map: ['Map', 'Mapa', 'Carte', 'Mapa', 'ちず', '地图'], stickers: ['Stickers', 'Estampas', 'Autocollants', 'Figurinhas', 'シール', '贴纸'],
  closet: ['Dress Up', 'Disfraces', 'Déguise', 'Fantasias', 'きせかえ', '换装'], mailbox: ['Mail', 'Correo', 'Courrier', 'Correio', 'ゆうびん', '信箱'],
  pet: ['My Pet', 'Mascota', 'Mon Animal', 'Bichinho', 'ペット', '宠物'], town: ['Town', 'Pueblo', 'Village', 'Cidade', 'まち', '小镇'],
  garage: ['Garage', 'Taller', 'Garage', 'Oficina', 'ガレージ', '车库'], zoo: ['Zoo', 'Zoológico', 'Zoo', 'Zoológico', 'どうぶつえん', '动物园'],
  lab: ['Science', 'Ciencia', 'Science', 'Ciência', 'じっけん', '科学'], puzzles: ['Puzzles', 'Rompecabezas', 'Puzzles', 'Quebra-cabeça', 'パズル', '拼图'],
  kitchen: ['Kitchen', 'Cocina', 'Cuisine', 'Cozinha', 'キッチン', '厨房'], colorhunt: ['Color Hunt', 'Caza Colores', 'Chasse Couleurs', 'Caça Cores', 'いろさがし', '找颜色'],
  mirror: ['Silly Mirror', 'Espejo', 'Miroir', 'Espelho', 'かがみ', '魔镜'], band: ['Band', 'Banda', 'Groupe', 'Banda', 'バンド', '乐队'],
  sing: ['Sing', 'Cantar', 'Chanter', 'Cantar', 'うた', '唱歌'], hide: ['Hide & Seek', 'Escondidas', 'Cache-cache', 'Esconde', 'かくれんぼ', '捉迷藏'],
  duo: ['Two Players', 'Dos Jugadores', 'À Deux', 'Dois Jogadores', 'ふたりで', '双人'], bedtime: ['Bedtime', 'A Dormir', 'Dodo', 'Hora de Dormir', 'おやすみ', '睡觉啦'],
  who: ['Family', 'Familia', 'Famille', 'Família', 'かぞく', '家人'], baby: ['Baby', 'Bebé', 'Bébé', 'Bebê', 'あかちゃん', '宝宝'],
  tv: ['My TV', 'Mi Tele', 'Ma Télé', 'Minha TV', 'テレビ', '我的电视'], myapps: ['My Games', 'Mis Juegos', 'Mes Jeux', 'Meus Jogos', 'ゲーム', '我的游戏'],
  stickermaker: ['Sticker Maker', 'Hacer Estampas', 'Fabrique', 'Fábrica', 'シールこうじょう', '贴纸工厂']
};
Object.entries(APP_NAMES).forEach(([id, a]) => LANG6.forEach((k, i) => { if (L[k]) L[k].games[id] = a[i]; }));
[['make', ['MAKE', 'CREAR', 'CRÉER', 'CRIAR', 'つくる', '创作']], ['me', ['MY WORLD', 'MI MUNDO', 'MON MONDE', 'MEU MUNDO', 'じぶんのせかい', '我的世界']]].forEach(([c, a]) => LANG6.forEach((k, i) => { if (L[k]) L[k].cats[c] = a[i]; }));
GBY.paint.cat = 'make'; GBY.draw.cat = 'make';
const VOICE_APPS = new Set(['talk', 'story', 'quiz', 'sayit', 'showme', 'draw', 'mailbox', 'bedtime', 'tv', 'sing', 'baby']);

/* ── the child's creations live in IndexedDB (local only) ── */
const MEDIA = {
  add: async (type, data) => { const id = Date.now().toString(36).padStart(9, '0') + randi(100, 999); await IDB.set('media', id, { type, date: today(), ...data }); return id; },
  list: async types => (await IDB.all('media')).filter(([, v]) => v && (!types || types.includes(v.type))).sort((a, b) => a[0] < b[0] ? 1 : -1)
};
function shrinkCanvas(src, maxW = 640, type = 'image/jpeg', q = .85) {
  const k = Math.min(1, maxW / src.width), c = document.createElement('canvas'); c.width = Math.round(src.width * k); c.height = Math.round(src.height * k);
  const x = c.getContext('2d'); if (type === 'image/jpeg') { x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height); } x.drawImage(src, 0, 0, c.width, c.height); return c.toDataURL(type, q);
}
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
/* turn a picture into a die-cut sticker: drop the dark/white background, crop, add a white outline */
async function makeStickerFrom(url, bg = 'dark') {
  const im = await loadImg(url), W = 360, k = Math.min(W / im.width, W / im.height), w = Math.round(im.width * k), h = Math.round(im.height * k);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(im, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h), p = d.data; let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let i = 0; i < p.length; i += 4) {
    const s = p[i] + p[i + 1] + p[i + 2], off = bg === 'dark' ? s < 70 : s > 715;
    if (off) p[i + 3] = 0; else { const j = i / 4, px = j % w, py = (j / w) | 0; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; }
  }
  if (x1 <= x0 || y1 <= y0) return null;
  x.putImageData(d, 0, 0);
  const pad = 14, cw = x1 - x0 + pad * 2, ch = y1 - y0 + pad * 2, out = document.createElement('canvas'); out.width = cw; out.height = ch; const o = out.getContext('2d');
  const sil = document.createElement('canvas'); sil.width = cw; sil.height = ch; const s = sil.getContext('2d'); s.drawImage(c, x0, y0, x1 - x0 + 1, y1 - y0 + 1, pad, pad, x1 - x0 + 1, y1 - y0 + 1); s.globalCompositeOperation = 'source-in'; s.fillStyle = '#fff'; s.fillRect(0, 0, cw, ch);
  for (let a = 0; a < 16; a++) o.drawImage(sil, Math.cos(a / 16 * 6.283) * 7, Math.sin(a / 16 * 6.283) * 7);
  o.drawImage(c, x0, y0, x1 - x0 + 1, y1 - y0 + 1, pad, pad, x1 - x0 + 1, y1 - y0 + 1);
  return out.toDataURL('image/png');
}
function downloadURL(url, name) { const a = mk('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 100); }

/* ═════════ TOWN — build roads and buildings; cars drive by themselves ═════════ */
game('town', 'make', '🏘️', g => {
  const H = g.host('robo'), COLS = 14, ROWS = 8; g.stage.classList.add('col');
  let st = null; try { st = JSON.parse(localStorage.getItem(KEYS.town) || 'null'); } catch (e) {}
  if (!st || st.c !== COLS) { st = { c: COLS, cells: Array(COLS * ROWS).fill(''), placed: 0 }; for (let x = 2; x <= 11; x++) { st.cells[2 * COLS + x] = st.cells[5 * COLS + x] = 'road'; } for (let y = 2; y <= 5; y++) { st.cells[y * COLS + 2] = st.cells[y * COLS + 11] = 'road'; } st.cells[1 * COLS + 4] = '🏠'; st.cells[3 * COLS + 6] = '🌳'; st.cells[6 * COLS + 8] = '🏫'; }
  const save = () => { try { localStorage.setItem(KEYS.town, JSON.stringify(st)); } catch (e) {} };
  g.stage.innerHTML = `<div class="town"><div class="tgrid" style="--cols:${COLS};--rows:${ROWS}"></div><div class="tmovers"></div></div><div class="bbar townBar"></div>`;
  const town = $('.town', g.stage), grid = $('.tgrid', g.stage), movers = $('.tmovers', g.stage), bar = $('.townBar', g.stage);
  const STAMPS = ['road', '🏠', '🏡', '🏢', '🏫', '🏥', '🏪', '🚒', '🏰', '🌳', '🌲', '🌷', '⛲', '🎡', '🐶', 'erase'];
  let tool = 'road';
  STAMPS.forEach((s, i) => { const b = mk('button', 'swatch' + (s === tool ? ' sel' : ''), s === 'road' ? '<i class="roadIco"></i>' : s === 'erase' ? '🧽' : s); b.addEventListener('click', () => { tool = s; $$('.swatch', bar).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); SFX.tap(); }); bar.appendChild(b); });
  const cells = []; for (let i = 0; i < COLS * ROWS; i++) { const c = mk('div', 'tc'); c.dataset.i = i; grid.appendChild(c); cells.push(c); }
  const isRoad = i => i >= 0 && i < COLS * ROWS && st.cells[i] === 'road';
  const nb = i => { const x = i % COLS, y = (i / COLS) | 0, o = []; if (y > 0) o.push(i - COLS); if (x < COLS - 1) o.push(i + 1); if (y < ROWS - 1) o.push(i + COLS); if (x > 0) o.push(i - 1); return o; };
  function paintCell(i) {
    const v = st.cells[i], c = cells[i]; c.className = 'tc'; c.textContent = '';
    if (v === 'road') { const x = i % COLS; c.classList.add('road'); if (isRoad(i - COLS) && i >= COLS) c.classList.add('rn'); if (isRoad(i + COLS)) c.classList.add('rs'); if (x < COLS - 1 && isRoad(i + 1)) c.classList.add('re'); if (x > 0 && isRoad(i - 1)) c.classList.add('rw'); }
    else if (v) { c.textContent = v; c.classList.add('bld'); }
  }
  const paintAll = () => cells.forEach((_, i) => paintCell(i));
  let lastI = -1;
  function put(i) {
    if (i === lastI) return; lastI = i; const cur = st.cells[i];
    if (tool !== 'erase' && cur === tool && tool !== 'road') { poke(i); return; }
    const v = tool === 'erase' ? '' : tool; if (cur === v) return;
    st.cells[i] = v; [i, ...nb(i)].forEach(paintCell); retrigger(cells[i], 'pop');
    if (v === 'road') noise(.05, .1, 'lowpass', 400); else if (v) tone(PENTA[randi(2, 8)], .14, 'triangle', .15); else SFX.whoosh();
    if (v) { st.placed = (st.placed || 0) + 1; if (st.placed % 10 === 0) { g.star(1); H.happy(); } }
    cars.forEach(c => { if (!isRoad(c.i)) { c.el.remove(); c.dead = true; } }); cars = cars.filter(c => !c.dead); save();
  }
  function poke(i) {
    const v = st.cells[i], c = cells[i]; retrigger(c, 'hop');
    const fx = { '🏫': () => [0, .25, .5].forEach(d => DRUM.bell(1047, d)), '🏥': () => [0, .3, .6].forEach(d => { tone(880, .25, 'square', .05, d); tone(660, .25, 'square', .05, d + .15); }), '🚒': () => sweep(500, 900, .8, 'square', .06), '⛲': () => noise(.8, .15, 'bandpass', 2400), '🐶': () => [0, .2].forEach(d => sweep(500, 300, .12, 'square', .08, d)), '🎡': () => [0, 1, 2, 3, 4].forEach(k => tone(PENTA[k + 3], .2, 'triangle', .12, k * .1)) }[v];
    (fx || (() => tone(PENTA[randi(3, 8)], .2, 'sine', .15)))();
    const s = mk('span', 'tpuff', { '🌳': '🐦', '🌲': '🐿️', '🌷': '🦋', '🏠': '💡', '🏡': '💡', '🏪': '🛒', '🏰': '👑', '⛲': '💧', '🎡': '🎉', '🐶': '🦴' }[v] || '✨');
    s.style.left = ((i % COLS) + .5) / COLS * 100 + '%'; s.style.top = (((i / COLS) | 0) + .2) / ROWS * 100 + '%'; movers.appendChild(s); setTimeout(() => s.remove(), 1400);
  }
  const at = e => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.classList.contains('tc') ? +el.dataset.i : -1; };
  let painting = false;
  g.on(grid, 'pointerdown', e => { const i = at(e); if (i < 0) return; painting = true; lastI = -1; try { grid.setPointerCapture(e.pointerId); } catch (_) {} put(i); });
  g.on(grid, 'pointermove', e => { if (!painting || (tool !== 'road' && tool !== 'erase')) return; const i = at(e); if (i >= 0) put(i); });
  ['pointerup', 'pointercancel'].forEach(ev => g.on(grid, ev, () => { painting = false; }));
  /* cars */
  const CARS = ['🚗', '🚕', '🚌', '🚓', '🚑', '🚒', '🚚', '🚜', '🏎️'];
  let cars = [];
  const place = (c, anim) => { const x = c.i % COLS, y = (c.i / COLS) | 0; c.el.style.transition = anim ? 'left .7s linear, top .7s linear' : 'none'; c.el.style.left = (x + .5) / COLS * 100 + '%'; c.el.style.top = (y + .5) / ROWS * 100 + '%'; };
  g.every(720, () => {
    const roads = st.cells.map((v, i) => v === 'road' ? i : -1).filter(i => i >= 0), want = Math.min(8, Math.floor(roads.length / 5));
    if (cars.length < want && roads.length) { const c = { i: pick(roads), prev: -1, el: mk('button', 'tcar', pick(CARS)) }; c.el.addEventListener('pointerdown', ev => { ev.stopPropagation(); SFX.honk(); retrigger(c.el, 'hop'); }); movers.appendChild(c.el); place(c); cars.push(c); }
    if (cars.length > want) { const c = cars.pop(); c.el.remove(); }
    cars.forEach(c => { const opts = nb(c.i).filter(isRoad), fwd = opts.filter(j => j !== c.prev), to = fwd.length ? pick(fwd) : opts[0]; if (to == null) return; const dx = (to % COLS) - (c.i % COLS); if (dx) c.el.classList.toggle('flip', dx > 0); c.prev = c.i; c.i = to; place(c, true); });
  });
  g.tool('🌙', b => { town.classList.toggle('night'); b.textContent = town.classList.contains('night') ? '☀️' : '🌙'; town.classList.contains('night') ? [523, 392, 330].forEach((f, i) => tone(f, .4, 'sine', .1, i * .2)) : SFX.chime(); });
  const clr = g.tool('🗑️', b => { if (!b.dataset.arm) { b.dataset.arm = 1; b.textContent = '🗑️?'; g.after(2500, () => { delete b.dataset.arm; b.textContent = '🗑️'; }); return; } st.cells.fill(''); paintAll(); cars.forEach(c => c.el.remove()); cars = []; save(); SFX.whoosh(); delete b.dataset.arm; b.textContent = '🗑️'; });
  paintAll(); H.say('', 'talk', lang, 0, CARD.wrap('<i class="roadIco big"></i>', '🚗'));
});

/* ═════════ GARAGE — build a vehicle, then take it for a drive ═════════ */
function drawVehicle(x, v, cx, gy, L, t, o = {}) {
  const wr = L * [.1, .14, .21][v.wheels], lift = v.wheels === 2 ? L * .1 : 0, by = gy - wr - lift, col = COLORS[v.color] || TT.red;
  const rr = (X, Y, W, H, r = 6) => { x.beginPath(); x.roundRect(X, Y, W, H, r); x.fill(); x.stroke(); };
  x.save(); x.translate(cx, gy); if (o.tilt) x.rotate(o.tilt); x.translate(-cx, -gy);
  x.lineWidth = Math.max(2, L * .02); x.strokeStyle = '#111'; x.lineJoin = 'round';
  const l = cx - L / 2, glass = '#9fd8ff';
  if (v.wheels === 2) { x.fillStyle = '#555'; x.fillRect(l + L * .18, by - 4, L * .64, lift + 8); }
  x.fillStyle = col;
  if (v.body === 0) { rr(l, by - L * .22, L, L * .22, L * .06); x.beginPath(); x.moveTo(l + L * .22, by - L * .22); x.lineTo(l + L * .32, by - L * .4); x.lineTo(l + L * .7, by - L * .4); x.lineTo(l + L * .8, by - L * .22); x.closePath(); x.fill(); x.stroke(); x.fillStyle = glass; x.beginPath(); x.moveTo(l + L * .3, by - L * .24); x.lineTo(l + L * .36, by - L * .36); x.lineTo(l + L * .5, by - L * .36); x.lineTo(l + L * .5, by - L * .24); x.closePath(); x.fill(); x.beginPath(); x.moveTo(l + L * .54, by - L * .24); x.lineTo(l + L * .54, by - L * .36); x.lineTo(l + L * .67, by - L * .36); x.lineTo(l + L * .74, by - L * .24); x.closePath(); x.fill(); }
  else if (v.body === 1) { rr(l, by - L * .42, L * .62, L * .42, 4); x.fillStyle = col; rr(l + L * .64, by - L * .32, L * .36, L * .32, L * .05); x.fillStyle = glass; x.fillRect(l + L * .74, by - L * .28, L * .2, L * .12); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(l + L * .04, by - L * .36, L * .54, L * .05); }
  else if (v.body === 2) { rr(l, by - L * .46, L, L * .46, L * .06); x.fillStyle = glass; for (let i = 0; i < 5; i++) x.fillRect(l + L * (.06 + i * .17), by - L * .4, L * .13, L * .14); x.fillStyle = '#111'; x.fillRect(l, by - L * .14, L, L * .03); }
  else if (v.body === 3) { x.beginPath(); x.moveTo(l, by); x.lineTo(l, by - L * .16); x.lineTo(l + L * .4, by - L * .26); x.lineTo(l + L * .62, by - L * .26); x.lineTo(l + L, by - L * .1); x.lineTo(l + L, by); x.closePath(); x.fill(); x.stroke(); x.fillStyle = '#111'; x.fillRect(l - L * .02, by - L * .3, L * .14, L * .05); x.fillRect(l + L * .03, by - L * .27, L * .03, L * .1); x.fillStyle = glass; x.beginPath(); x.moveTo(l + L * .44, by - L * .25); x.lineTo(l + L * .6, by - L * .25); x.lineTo(l + L * .72, by - L * .17); x.lineTo(l + L * .44, by - L * .17); x.closePath(); x.fill(); x.fillStyle = '#fff'; x.font = `700 ${L * .1}px ${PXF}`; x.fillText('1', l + L * .22, by - L * .06); }
  else { rr(l + L * .1, by - L * .26, L * .8, L * .26, L * .13); x.beginPath(); x.moveTo(l + L * .1, by - L * .2); x.lineTo(l - L * .04, by - L * .38); x.lineTo(l + L * .22, by - L * .24); x.fill(); x.stroke(); x.fillStyle = glass; x.beginPath(); x.arc(l + L * .62, by - L * .2, L * .08, 0, 7); x.fill(); x.stroke(); const fl = (Math.sin(t * 30) + 1) * .5; x.fillStyle = TT.yellow; x.beginPath(); x.moveTo(l + L * .1, by - L * .2); x.lineTo(l - L * (.14 + fl * .1), by - L * .13); x.lineTo(l + L * .1, by - L * .06); x.fill(); x.fillStyle = TT.orange; x.beginPath(); x.moveTo(l + L * .1, by - L * .17); x.lineTo(l - L * (.06 + fl * .05), by - L * .13); x.lineTo(l + L * .1, by - L * .09); x.fill(); }
  const top = by - [L * .4, L * .42, L * .46, L * .26, L * .3][v.body];
  if (v.top === 1) { const on = Math.floor(t * 4) % 2; x.fillStyle = on ? TT.red : TT.blue; x.fillRect(cx - L * .1, top - L * .07, L * .1, L * .07); x.fillStyle = on ? TT.blue : TT.red; x.fillRect(cx, top - L * .07, L * .1, L * .07); if (o.glow) { x.fillStyle = on ? 'rgba(255,61,61,.25)' : 'rgba(59,98,255,.25)'; x.beginPath(); x.arc(cx, top, L * .3, 0, 7); x.fill(); } }
  if (v.top === 2) { x.fillStyle = '#ccc'; x.fillRect(l + L * .05, top - L * .06, L * .8, L * .05); for (let i = 0; i < 7; i++) x.fillRect(l + L * (.08 + i * .11), top - L * .1, L * .025, L * .1); }
  if (v.top === 3) { x.fillStyle = '#eee'; x.fillRect(l + L * .12, top - L * .32, L * .02, L * .32); x.fillStyle = COLORS[(v.color + 3) % 7]; x.beginPath(); x.moveTo(l + L * .14, top - L * .32); for (let i = 0; i <= 6; i++) x.lineTo(l + L * (.14 + i * .03), top - L * .32 + Math.sin(t * 8 + i) * L * .015); x.lineTo(l + L * .32, top - L * .2); for (let i = 6; i >= 0; i--) x.lineTo(l + L * (.14 + i * .03), top - L * .2 + Math.sin(t * 8 + i) * L * .015); x.fill(); }
  if (v.top === 4) { const ey = by - L * .15, ex = l + L * .82; [[0, '#fff'], [L * .1, '#fff']].forEach(([dx]) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(ex - dx, ey, L * .045, 0, 7); x.fill(); x.stroke(); x.fillStyle = '#111'; x.beginPath(); x.arc(ex - dx + Math.sin(t * 3) * L * .01, ey + L * .01, L * .02, 0, 7); x.fill(); }); x.beginPath(); x.arc(ex - L * .05, by - L * .08, L * .03, .2, Math.PI - .2); x.stroke(); }
  [l + L * .2, l + L * .8].forEach(wx => { x.save(); x.translate(wx, gy - wr); x.rotate(o.spin || 0); x.fillStyle = '#1a1a1a'; x.beginPath(); x.arc(0, 0, wr, 0, 7); x.fill(); x.fillStyle = '#9a9a9a'; x.beginPath(); x.arc(0, 0, wr * .45, 0, 7); x.fill(); x.fillStyle = '#1a1a1a'; x.fillRect(-wr * .08, -wr * .45, wr * .16, wr * .9); if (v.wheels === 2) { x.strokeStyle = '#333'; x.lineWidth = wr * .12; for (let k = 0; k < 10; k++) { x.rotate(.628); x.beginPath(); x.moveTo(wr * .85, 0); x.lineTo(wr * 1.02, 0); x.stroke(); } } x.restore(); });
  x.restore();
}
game('garage', 'make', '🔧', g => {
  const H = g.host('robo'); g.stage.classList.add('col');
  const v = Object.assign({ body: 0, color: 0, wheels: 0, top: 0 }, PROG.car || {});
  const wrap = mk('div', 'paintWrap'), bar = mk('div', 'bbar'), parts = mk('div', 'gParts'); g.stage.append(wrap, bar); wrap.appendChild(parts);
  const C = g.canvas(wrap), x = C.ctx; let mode = 'build', part = 0, t = 0, pop = 0;
  const PARTS = [['🚘', 'body', ['🚗', '🚚', '🚌', '🏎️', '🚀']], ['🎨', 'color', COLORS], ['⚙️', 'wheels', ['•', '●', '⬤']], ['🎌', 'top', ['✖', '🚨', '🪜', '🚩', '👀']]];
  const save = () => { PROG.car = { ...v }; saveProg(); };
  function renderBar() {
    bar.innerHTML = ''; parts.innerHTML = '';
    if (mode === 'drive') { const back = mk('button', 'swatch', '🔧'); back.addEventListener('click', () => { SFX.tap(); setMode('build'); }); const honk = mk('button', 'swatch big', '📯'); honk.addEventListener('click', () => { SFX.honk(); pop = 1; }); bar.append(back, honk); return; }
    PARTS.forEach(([ic], i) => { const b = mk('button', 'swatch' + (i === part ? ' sel' : ''), ic); b.addEventListener('click', () => { part = i; SFX.tap(); renderBar(); }); parts.appendChild(b); });
    const [, key, opts] = PARTS[part];
    opts.forEach((o, i) => { const b = mk('button', 'swatch' + (v[key] === i ? ' sel' : ''), key === 'color' ? '' : o); if (key === 'color') b.style.background = o; b.addEventListener('click', () => { v[key] = i; save(); pop = 1; tone(PENTA[i + 3], .15, 'triangle', .18); renderBar(); }); bar.appendChild(b); });
    bar.appendChild(mk('span', 'gap')); const go = mk('button', 'swatch go', 'GO'); go.addEventListener('click', () => { SFX.honk(); setMode('drive'); }); bar.appendChild(go);
  }
  /* drive */
  let dx = 0, sp = 0, hold = 0, ang = 0, collected = 0, items = [], bumps = [], finish = 0;
  const ground = X => C.h * .74 - Math.sin(X * .004) * C.h * .05 - Math.sin(X * .011 + 1) * C.h * .025 - bumps.reduce((a, b) => a + Math.max(0, 1 - Math.abs(X - b) / 70) * C.h * .05, 0);
  function setMode(m) {
    mode = m; renderBar(); wrap.classList.toggle('driving', m === 'drive');
    if (m === 'drive') { dx = 0; sp = 0; collected = 0; finish = 3200; bumps = Array.from({ length: 10 }, (_, i) => 400 + i * 280 + rand(-60, 60)); items = Array.from({ length: 14 }, (_, i) => ({ x: 300 + i * 210, y: rand(.15, .3), got: false, e: i % 4 === 3 ? pick(THEMES[weekTheme()].set) : '⭐' })); H.bubble('👉 ▶'); }
    else H.bubble('🚘 🎨 ⚙️ 🎌');
  }
  g.on(C.cv, 'pointerdown', e => { if (mode === 'drive') { hold = C.pos(e).x > C.w * .35 ? 1 : -1; } else { pop = 1; SFX.honk(); } });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => g.on(C.cv, ev, () => { hold = 0; }));
  g.key = e => { if (e.key === 'ArrowRight' || e.key === ' ') hold = 1; if (e.key === 'ArrowLeft') hold = -1; };
  g.on(document, 'keyup', () => { hold = 0; });
  const P = new Particles();
  g.loop(dt => {
    t += dt; pop = Math.max(0, pop - dt * 3); const W = C.w, Hh = C.h, Lc = Math.min(W * .34, Hh * .55);
    x.fillStyle = '#000'; x.fillRect(0, 0, W, Hh);
    if (mode === 'build') {
      x.fillStyle = '#0b0b0b'; x.fillRect(0, Hh * .72, W, Hh * .28); for (let i = 0; i < 4; i++) { x.fillStyle = [TT.green, TT.blue, TT.red, TT.yellow][i]; x.fillRect(W * (.2 + i * .15), Hh * .72, W * .15, 4); }
      const s = 1 + Math.sin(pop * Math.PI) * .08; x.save(); x.translate(W / 2, Hh * .72); x.scale(s, s); x.translate(-W / 2, -Hh * .72); drawVehicle(x, v, W / 2, Hh * .72, Lc, t, { glow: true }); x.restore();
      x.fillStyle = '#2a2a2a'; x.font = `${Hh * .08}px sans-serif`; x.textAlign = 'center'; ['🔧', '🔩', '🛞'].forEach((e, i) => x.fillText(e, W * (.12 + i * .38), Hh * .9));
      return;
    }
    const acc = hold > 0 ? 340 : hold < 0 ? -420 : -90; sp = clamp(sp + acc * dt, 0, 520); dx += sp * dt;
    const L = Lc * .55, carX = W * .3, w0 = dx + carX;
    x.fillStyle = '#05060a'; x.fillRect(0, 0, W, Hh);
    for (let i = 0; i < 40; i++) { const sx = ((i * 197 - dx * .1) % W + W) % W; x.fillStyle = '#333'; x.fillRect(sx, (i * 71) % (Hh * .5), 2, 2); }
    x.fillStyle = '#0e1d14'; x.beginPath(); x.moveTo(0, Hh); for (let X = 0; X <= W; X += 16) x.lineTo(X, Hh * .55 - Math.sin((X + dx * .3) * .006) * Hh * .08); x.lineTo(W, Hh); x.fill();
    x.fillStyle = '#151515'; x.beginPath(); x.moveTo(0, Hh); for (let X = 0; X <= W; X += 8) x.lineTo(X, ground(X + dx)); x.lineTo(W, Hh); x.fill();
    x.strokeStyle = TT.yellow; x.lineWidth = 3; x.setLineDash([18, 18]); x.lineDashOffset = dx; x.beginPath(); for (let X = 0; X <= W; X += 8) x.lineTo(X, ground(X + dx) + Hh * .05); x.stroke(); x.setLineDash([]);
    const fx = finish - dx; if (fx < W + 50) { x.fillStyle = '#fff'; x.fillRect(fx, ground(finish) - Hh * .3, 6, Hh * .3); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { x.fillStyle = (r + c) % 2 ? '#fff' : '#111'; x.fillRect(fx + 6 + c * 12, ground(finish) - Hh * .3 + r * 12, 12, 12); } }
    items.forEach(it => { if (it.got) return; const sx = it.x - dx; if (sx < -50 || sx > W + 50) return; const sy = ground(it.x) - Hh * it.y - L * .3; x.font = `${Hh * .07}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(it.e, sx, sy + Math.sin(t * 3 + it.x) * 6); if (Math.abs(sx - carX) < L * .5 && Math.abs(sy - (ground(w0) - L * .3)) < Hh * .25) { it.got = true; collected++; SFX.coin(); P.burst(sx, sy, [TT.yellow, TT.white], 14, 260); if (collected % 3 === 0) g.star(1, sx + C.cv.getBoundingClientRect().left, sy + C.cv.getBoundingClientRect().top); } });
    const gA = ground(w0 - L * .3), gB = ground(w0 + L * .3), tilt = Math.atan2(gB - gA, L * .6); ang = lerp(ang, tilt, Math.min(1, dt * 8));
    const bounce = Math.abs(Math.sin(t * 14)) * Math.min(1, sp / 400) * 3;
    drawVehicle(x, v, carX, (gA + gB) / 2 - bounce, L, t, { tilt: ang, spin: dx / (L * .12), glow: true });
    if (sp > 300 && Math.random() < .5) P.burst(carX - L * .55, (gA + gB) / 2 - 6, '#555', 1, 60, { g: -40, life: .6, size: 8 });
    P.update(dt); P.draw(x);
    if (mode === 'drive' && dx >= finish - carX) { mode = 'done'; hold = 0; SFX.chime(); H.happy(); g.star(3); P.burst(carX, Hh * .4, COLORS, 50, 500); g.after(1800, () => { if (g.alive()) setMode('build'); }); }
  });
  renderBar(); H.bubble('🚘 🎨 ⚙️ 🎌');
});

/* ═════════ KITCHEN — cook for the cast ═════════ */
const RECIPES = [
  { e: '🍕', base: 'pizza', ing: ['🍅', '🧀', '🍄', '🫑', '🍍', '🫒', '🌽', '🥦'], act: '🔥' },
  { e: '🎂', base: 'cake', ing: ['🍓', '🫐', '🍒', '🍫', '🍬', '🍌', '⭐', '🕯️'], act: '🕯️' },
  { e: '🥤', base: 'cup', ing: ['🍓', '🍌', '🫐', '🥭', '🍍', '🥝', '🥛', '🍑'], act: '🌀' },
  { e: '🥪', base: 'bread', ing: ['🥬', '🍅', '🧀', '🥒', '🥚', '🍗', '🥑', '🥕'], act: '🍞' }
];
const FRUITCOL = { '🍓': '#FF3D3D', '🍌': '#FFD60A', '🫐': '#3B62FF', '🥭': '#FF8A1F', '🍍': '#FFD60A', '🥝': '#19D36B', '🥛': '#F2F2EE', '🍑': '#FF9D6E' };
game('kitchen', 'make', '🍳', g => {
  let H = g.host(PROG.buddy || 'robo');
  g.stage.innerHTML = `<div class="kTop"><div class="recipes"></div><div class="order"></div></div><div class="kMain"><div class="kBase"><div class="kFood"></div><div class="kFx"></div></div><div class="kGuest"></div></div><div class="bbar kBar"></div>`;
  const rbox = $('.recipes', g.stage), order = $('.order', g.stage), base = $('.kBase', g.stage), food = $('.kFood', g.stage), fxl = $('.kFx', g.stage), guest = $('.kGuest', g.stage), bar = $('.kBar', g.stage);
  let R = RECIPES[0], added = [], want = null, phase = 'add', who = 'dino';
  RECIPES.forEach((r, i) => { const b = mk('button', 'tBtn', r.e); b.addEventListener('click', () => { SFX.tap(); setRecipe(i); }); rbox.appendChild(b); });
  function setRecipe(i) {
    R = RECIPES[i]; added = []; phase = 'add'; food.innerHTML = ''; base.className = 'kBase ' + R.base; $$('.recipes .tBtn', g.stage).forEach((b, k) => b.classList.toggle('sel', k === i));
    bar.innerHTML = ''; R.ing.forEach(e => { const b = mk('button', 'swatch big', e); b.addEventListener('click', () => add(e, b)); bar.appendChild(b); });
    bar.appendChild(mk('span', 'gap')); const go = mk('button', 'swatch go', R.act); go.addEventListener('click', cook); bar.appendChild(go);
    who = pick(CAST_IDS); guest.innerHTML = charHTML(who, 'big');
    if (g.lvl() >= 2) { const kinds = shuffle(R.ing.filter(e => e !== '🕯️' || R.base === 'cake')).slice(0, g.lvl() === 2 ? 2 : 3); want = {}; kinds.forEach(k => want[k] = randi(1, g.lvl() === 2 ? 2 : 4)); renderOrder(); H = g.host(who); H.say('', 'talk', lang, 0, CARD.wrap(Object.entries(want).map(([k, n]) => `<b class="ce sm">${k.repeat(n)}</b>`).join(''), R.e)); }
    else { want = null; order.innerHTML = ''; H = g.host(who); H.bubble(R.e + ' ?'); }
  }
  const count = e => added.filter(a => a === e).length;
  function renderOrder() { order.innerHTML = want ? `<div class="ticket">${charHTML(who)}${Object.entries(want).map(([k, n]) => `<span class="${count(k) >= n ? 'ok' : ''}">${k}<b>${count(k)}/${n}</b></span>`).join('')}</div>` : ''; }
  function add(e, b) {
    if (phase !== 'add') return;
    if (want && (!want[e] || count(e) >= want[e])) { SFX.bad(); retrigger(b, 'shake'); moodFn($('.char', guest), 'oops'); return; }
    if (added.length >= 24) return; added.push(e);
    const s = mk('span', 'kIng', e), r = R.base === 'cup' ? [rand(25, 75), rand(30, 80)] : R.base === 'cake' ? [rand(18, 82), rand(8, 30)] : R.base === 'bread' ? [rand(20, 80), rand(35, 60)] : (() => { const a = rand(0, 6.28), d = rand(0, 32); return [50 + Math.cos(a) * d, 50 + Math.sin(a) * d]; })();
    s.style.left = r[0] + '%'; s.style.top = r[1] + '%'; s.style.setProperty('--r', rand(-30, 30) + 'deg'); food.appendChild(s);
    tone(PENTA[randi(3, 9)], .12, 'triangle', .16); SFX.pop(1.2);
    if (want) { renderOrder(); if (Object.entries(want).every(([k, n]) => count(k) >= n)) { SFX.good(); g.after(400, cook); } }
  }
  function cook() {
    if (phase !== 'add' || !added.length) { if (!added.length) retrigger(bar.lastChild, 'shake'); return; }
    if (want && !Object.entries(want).every(([k, n]) => count(k) >= n)) { SFX.bad(); retrigger(order, 'shake'); return; }
    phase = 'cook'; base.classList.add('cooking');
    if (R.base === 'pizza') { fxl.innerHTML = '<div class="oven"></div>'; noise(1.6, .12, 'lowpass', 300); }
    if (R.base === 'cake') { $$('.kIng', food).forEach(s => { if (s.textContent === '🕯️') s.classList.add('lit'); }); [392, 392, 440, 392, 523, 494].forEach((f, i) => tone(f, .3, 'triangle', .12, i * .3)); }
    if (R.base === 'cup') { const cols = added.map(e => FRUITCOL[e] || '#fff'); const avg = cols.reduce((a, c) => { const n = parseInt(c.slice(1), 16); return [a[0] + (n >> 16), a[1] + (n >> 8 & 255), a[2] + (n & 255)]; }, [0, 0, 0]).map(v => Math.round(v / cols.length)); food.classList.add('blend'); base.style.setProperty('--juice', `rgb(${avg})`); noise(1.6, .2, 'bandpass', 600, 0, 2); }
    if (R.base === 'bread') { fxl.innerHTML = '<div class="topBread"></div>'; SFX.bump(); }
    g.after(1800, serve);
  }
  function serve() {
    phase = 'eat'; const el = $('.char', guest); guest.classList.add('eating'); let n = 0;
    const bite = () => { if (!g.alive()) return; const s = $$('.kIng', food).pop(); if (s) s.remove(); moodFn(el, n % 2 ? 'talk' : 'happy', 300); tone(200 + n * 20, .08, 'square', .06); n++; if (n < 6) g.after(260, bite); else done(); };
    g.after(200, bite);
    const done = () => { guest.classList.remove('eating'); base.classList.remove('cooking'); food.classList.remove('blend'); fxl.innerHTML = ''; food.innerHTML = ''; moodFn(el, 'happy', 1500); SFX.chime(); g.star(want ? 2 : 1); const up = g.progress(); g.after(1200, () => { if (!g.alive()) return; if (up) g.levelUp(); else setRecipe(RECIPES.indexOf(R)); }); };
  }
  g.levels(3, lv => { g.meter(lv === 1 ? 4 : 4); setRecipe(randi(0, 3)); });
});

/* ═════════ STICKER MAKER — local ComfyUI (Z-Image Turbo or FLUX Krea) from a fixed kid-safe template ═════════ */
const SM_THINGS = [['🦖', 'dinosaur'], ['🐶', 'puppy'], ['🐱', 'kitten'], ['🐳', 'whale'], ['🚀', 'rocket'], ['🚒', 'fire truck'], ['🚂', 'train'], ['🦄', 'unicorn'], ['🐙', 'octopus'], ['🦁', 'lion'], ['🐢', 'turtle'], ['🍕', 'pizza'], ['🍦', 'ice cream cone'], ['🌈', 'rainbow'], ['🏰', 'castle'], ['🐝', 'bee'], ['🦉', 'owl'], ['🦊', 'fox'], ['🤖', 'robot'], ['🚜', 'tractor'], ['🐧', 'penguin'], ['🦋', 'butterfly'], ['🌻', 'sunflower'], ['🐘', 'elephant']];
const SM_STYLES = [['🫧', 'cute kawaii die-cut sticker, thick white border, flat bright colors, simple rounded shapes, big friendly eyes, smiling'], ['👾', 'cute pixel art sticker, 16-bit style, thick white border, bright colors, simple, smiling'], ['🖍️', 'cute crayon drawing sticker, like a child drew it, thick white border, bright colors, simple, smiling']];
const SM_NEG = 'scary, creepy, dark, horror, angry, sad, violence, weapon, blood, realistic photo, text, letters, words, watermark, signature, nsfw, ugly, deformed, extra limbs';
const COMFY_FLOWS = {
  zimage: s => ({
    '1': { class_type: 'UNETLoader', inputs: { unet_name: cfg.comfy.zModel || 'z_image_turbo_bf16.safetensors', weight_dtype: 'default' } },
    '2': { class_type: 'CLIPLoader', inputs: { clip_name: cfg.comfy.zClip || 'qwen_3_4b.safetensors', type: 'lumina2', device: 'default' } },
    '3': { class_type: 'VAELoader', inputs: { vae_name: cfg.comfy.vae || 'ae.safetensors' } },
    '4': { class_type: 'ModelSamplingAuraFlow', inputs: { model: ['1', 0], shift: 3 } },
    '5': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: s.prompt } },
    '6': { class_type: 'ConditioningZeroOut', inputs: { conditioning: ['5', 0] } },
    '7': { class_type: 'EmptySD3LatentImage', inputs: { width: s.size, height: s.size, batch_size: 1 } },
    '8': { class_type: 'KSampler', inputs: { model: ['4', 0], positive: ['5', 0], negative: ['6', 0], latent_image: ['7', 0], seed: s.seed, steps: 8, cfg: 1, sampler_name: 'res_multistep', scheduler: 'simple', denoise: 1 } },
    '9': { class_type: 'VAEDecode', inputs: { samples: ['8', 0], vae: ['3', 0] } },
    '10': { class_type: 'SaveImage', inputs: { images: ['9', 0], filename_prefix: 'i2minios' } } }),
  krea: s => ({
    '1': { class_type: 'UNETLoader', inputs: { unet_name: cfg.comfy.kModel || 'flux1-krea-dev_fp8_scaled.safetensors', weight_dtype: 'default' } },
    '2': { class_type: 'DualCLIPLoader', inputs: { clip_name1: 'clip_l.safetensors', clip_name2: cfg.comfy.kT5 || 't5xxl_fp8_e4m3fn_scaled.safetensors', type: 'flux', device: 'default' } },
    '3': { class_type: 'VAELoader', inputs: { vae_name: cfg.comfy.vae || 'ae.safetensors' } },
    '5': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: s.prompt } },
    '11': { class_type: 'FluxGuidance', inputs: { conditioning: ['5', 0], guidance: 4.5 } },
    '6': { class_type: 'ConditioningZeroOut', inputs: { conditioning: ['5', 0] } },
    '7': { class_type: 'EmptySD3LatentImage', inputs: { width: s.size, height: s.size, batch_size: 1 } },
    '8': { class_type: 'KSampler', inputs: { model: ['1', 0], positive: ['11', 0], negative: ['6', 0], latent_image: ['7', 0], seed: s.seed, steps: 20, cfg: 1, sampler_name: 'euler', scheduler: 'simple', denoise: 1 } },
    '9': { class_type: 'VAEDecode', inputs: { samples: ['8', 0], vae: ['3', 0] } },
    '10': { class_type: 'SaveImage', inputs: { images: ['9', 0], filename_prefix: 'i2minios' } } })
};
const comfyBase = () => { const h = (cfg.comfy.host || cfg.home.ip || '').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''); return h ? `http://${h}:${cfg.comfy.port || 8188}` : ''; };
const comfyOn = () => cfg.comfy.model && cfg.comfy.model !== 'off' && !!comfyBase();
async function comfyMake(prompt, size = 768, onTick) {
  const base = comfyBase(); if (!base) throw new Error('no ComfyUI address');
  const s = { prompt, neg: SM_NEG, seed: randi(1, 2 ** 31), size };
  let flow;
  if (cfg.comfy.model === 'custom') { const raw = (cfg.comfy.workflow || '').replace(/%PROMPT%/g, JSON.stringify(prompt).slice(1, -1)).replace(/%NEG%/g, SM_NEG).replace(/"%SEED%"|%SEED%/g, s.seed).replace(/"%SIZE%"|%SIZE%/g, size); flow = JSON.parse(raw); }
  else flow = (COMFY_FLOWS[cfg.comfy.model] || COMFY_FLOWS.zimage)(s);
  const r = await withTimeout(fetch(base + '/prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: flow, client_id: 'i2minios' }) }), 8000);
  if (!r.ok) throw new Error('ComfyUI ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const id = (await r.json()).prompt_id; const t0 = Date.now();
  while (Date.now() - t0 < 180000) {
    await sleep(1200); if (onTick) onTick((Date.now() - t0) / 1000);
    const h = await (await fetch(base + '/history/' + id)).json(), job = h[id];
    if (job && job.outputs) { for (const k in job.outputs) { const im = (job.outputs[k].images || [])[0]; if (im) { const b = await (await fetch(`${base}/view?filename=${encodeURIComponent(im.filename)}&subfolder=${encodeURIComponent(im.subfolder || '')}&type=${im.type || 'output'}`)).blob(); return blobToDataURL(b); } } }
    if (job && job.status && job.status.status_str === 'error') throw new Error('ComfyUI workflow error');
  }
  throw new Error('ComfyUI took too long');
}
/* offline sticker: the emoji, big, on a colour blob — always works */
function localSticker(emoji, ci, style) {
  const c = document.createElement('canvas'); c.width = c.height = 360; const x = c.getContext('2d'), col = ci === 7 ? null : COLORS[ci];
  const blob = () => { x.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * 6.283, r = 150 + Math.sin(a * 3) * 8; x.lineTo(180 + Math.cos(a) * r, 180 + Math.sin(a) * r); } x.closePath(); };
  x.fillStyle = '#fff'; blob(); x.fill(); x.save(); x.scale(.9, .9); x.translate(20, 20); blob(); x.restore();
  if (col) x.fillStyle = col; else { const gr = x.createLinearGradient(0, 0, 360, 360); COLORS.forEach((cc, i) => gr.addColorStop(i / 6, cc)); x.fillStyle = gr; }
  x.save(); x.translate(180, 180); x.scale(.88, .88); x.translate(-180, -180); blob(); x.fill(); x.restore();
  if (style === 1) { const s = document.createElement('canvas'); s.width = s.height = 28; const sx = s.getContext('2d'); sx.font = '22px sans-serif'; sx.textAlign = 'center'; sx.textBaseline = 'middle'; sx.fillText(emoji, 14, 15); x.imageSmoothingEnabled = false; x.drawImage(s, 60, 60, 240, 240); }
  else { x.font = '200px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; if (style === 2) { x.globalAlpha = .5; x.fillText(emoji, 186, 196); x.globalAlpha = 1; } x.fillText(emoji, 180, 192); }
  return c.toDataURL('image/png');
}
game('stickermaker', 'make', '✨', g => {
  const H = g.host('robo'), favs = [cfg.profile.favAnimal, cfg.profile.favVehicle].filter(Boolean);
  const things = shuffle(SM_THINGS).slice(0, 10); THEMES[weekTheme()].set.slice(0, 2).forEach(e => { if (!things.find(t => t[0] === e)) things.unshift([e, 'cute ' + e]); });
  g.stage.innerHTML = `<div class="smk"><div class="smkPick"><div class="pickCard"><div class="strip" style="--c:var(--tt-green)">1</div><div class="pickRow r0"></div></div><div class="pickCard"><div class="strip" style="--c:var(--tt-blue);--ink:#fff">2</div><div class="pickRow r1"></div></div><div class="pickCard"><div class="strip" style="--c:var(--tt-red)">3</div><div class="pickRow r2"></div></div></div><div class="smkOut"><div class="machine"><div class="mScreen"></div><div class="mGears">⚙️⚙️</div></div><button class="slab goBtn">✨ ▶</button></div></div>`;
  const sel = [0, randi(0, 6), 0], go = $('.goBtn', g.stage), scr = $('.mScreen', g.stage), mach = $('.machine', g.stage);
  const row = (k, list, html) => { const r = $('.r' + k, g.stage); list.forEach((it, i) => { const b = mk('button', 'tBtn' + (sel[k] === i ? ' sel' : ''), html(it, i)); b.addEventListener('click', () => { sel[k] = i; $$('.tBtn', r).forEach(x => x.classList.toggle('sel', x === b)); tone(PENTA[3 + k * 2], .12, 'triangle', .15); preview(); }); r.appendChild(b); }); };
  row(0, things, t => t[0]); row(1, [...COLORS, 'rainbow'], (c, i) => `<i class="cdot" style="background:${c === 'rainbow' ? 'conic-gradient(#FF3D3D,#FFD60A,#19D36B,#3B62FF,#9B5DE5,#FF3D3D)' : c}"></i>`); row(2, SM_STYLES, s => s[0]);
  const preview = () => { scr.innerHTML = `<span class="pv">${things[sel[0]][0]}</span>`; scr.style.setProperty('--c', sel[1] === 7 ? TT.white : COLORS[sel[1]]); };
  let busy = false;
  go.addEventListener('click', async () => {
    if (busy) return; busy = true; mach.classList.add('working'); document.body.classList.add('busy'); SFX.whoosh();
    const [em, name] = things[sel[0]], colName = sel[1] === 7 ? 'rainbow colored' : L.en.colors[sel[1]];
    const prompt = `${SM_STYLES[sel[2]][1]}, a happy ${colName} ${name}, centered, isolated on a plain white background, wholesome, made for toddlers`;
    let url = null, src = 'local';
    if (comfyOn()) { try { scr.innerHTML = '<span class="pv dots">● ● ●</span>'; url = await comfyMake(prompt, +(cfg.comfy.size || 768), s => { const d = $('.dots', scr); if (d) d.textContent = '●'.repeat(1 + Math.floor(s) % 3); }); src = 'comfy'; } catch (e) { console.warn(e); url = null; } }
    if (!url && artClaude() && g.alive()) { try { scr.innerHTML = '<span class="pv dots">● ● ●</span>'; url = await claudeSticker(`a happy ${colName} ${name}, in the style of: ${SM_STYLES[sel[2]][1]}`); src = 'claude'; } catch (e) { console.warn(e); url = null; } }
    if (!g.alive()) return;
    if (!url) { await sleep(900); url = localSticker(em, sel[1], sel[2]); }
    else if (src === 'comfy') { const cut = await makeStickerFrom(url, 'light').catch(() => null); if (cut) url = cut; }
    const small = await loadImg(url).then(im => shrinkCanvas(im, 360, 'image/png')).catch(() => url);
    await MEDIA.add('sticker', { url: small, label: em, src });
    scr.innerHTML = `<img class="made pop" src="${small}">`; mach.classList.remove('working'); document.body.classList.remove('busy');
    SFX.chime(); H.happy(); g.star(2); busy = false;
  });
  g.dispose(() => document.body.classList.remove('busy'));
  preview(); H.bubble(comfyOn() ? '✨ 🖥️' : artClaude() ? '✨ 🎨' : '✨');
});
