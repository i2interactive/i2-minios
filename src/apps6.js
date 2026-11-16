/* ═════════ NEW APPS · part 6 — key party, disco, names for everything new ═════════ */
Object.entries({
  basketball: ['Basketball', 'Básquet', 'Basket', 'Basquete', 'バスケ', '篮球'], darts: ['Darts', 'Dardos', 'Fléchettes', 'Dardos', 'ダーツ', '飞镖'],
  soccer: ['Penalty Kicks', 'Penaltis', 'Penalty', 'Pênaltis', 'PK', '点球'], minigolf: ['Mini Golf', 'Minigolf', 'Mini-golf', 'Minigolfe', 'ミニゴルフ', '迷你高尔夫'],
  flush: ['Flush Launch', 'Lanzainodoro', 'Chasse d’eau', 'Descarga!', 'トイレ発射', '冲水发射'], kart: ['Kart Racing', 'Carreras', 'Karting', 'Kart', 'カート', '卡丁车'],
  snowboard: ['Snowboard', 'Snowboard', 'Snowboard', 'Snowboard', 'スノボ', '滑雪板'], musicmaker: ['Music Maker', 'Hacer Música', 'Studio Musique', 'Fazer Música', 'おんがく工房', '音乐工厂'],
  video: ['Video Editor', 'Editor de Video', 'Montage Vidéo', 'Editor de Vídeo', 'ビデオへんしゅう', '视频剪辑'], cook: ['Cook With Me', 'Cocina Conmigo', 'Cuisine avec moi', 'Cozinhe Comigo', 'いっしょにりょうり', '一起做饭'],
  code: ['Code', 'Programar', 'Code', 'Programar', 'プログラミング', '编程'], helper: ['Baby Helper', 'Ayudar al Bebé', 'Aider Bébé', 'Ajudar o Bebê', 'あかちゃんのおせわ', '照顾宝宝'],
  keyparty: ['Key Party', 'Fiesta de Teclas', 'Fête du Clavier', 'Festa do Teclado', 'キーパーティー', '键盘派对'], disco: ['Disco', 'Disco', 'Disco', 'Discoteca', 'ディスコ', '迪斯科']
}).forEach(([id, a]) => LANG6.forEach((k, i) => { if (L[k]) L[k].games[id] = a[i]; }));

/* KEY PARTY — made for slapping the keyboard: every key makes a big letter, a shape, a sound */
game('keyparty', 'play', '⌨️', g => {
  const H = g.host('robo'); g.stage.classList.add('col'); const room = mk('div', 'kparty'); g.stage.appendChild(room);
  const SH = ['⭐', '❤️', '🔵', '🟩', '🔺', '🌙', '☀️', '🌈', '🎈', '🐶', '🐱', '🦖', '🚗', '🚀', '🐳', '🍎'];
  let n = 0;
  const pop = (ch, x, y) => {
    const isLetter = /^[a-z0-9]$/i.test(ch), el = mk('div', 'kpItem', isLetter ? ch.toUpperCase() : pick(SH));
    el.style.left = (x ?? rand(8, 92)) + '%'; el.style.top = (y ?? rand(10, 85)) + '%'; el.style.color = pick(COLORS); el.style.setProperty('--r', rand(-25, 25) + 'deg'); if (!isLetter) el.classList.add('emo');
    room.appendChild(el); setTimeout(() => el.remove(), 2200); while (room.children.length > 40) room.firstChild.remove();
    const code = isLetter ? ch.toUpperCase().charCodeAt(0) : randi(0, 30); tone(PENTA[code % 10] * (code % 3 === 0 ? 2 : 1), .3, 'triangle', .12);
    if (isLetter && /[A-Z]/i.test(ch)) { const clip = clipFor(ch.toUpperCase(), 'en'); if (clip) playURL(clip, null, null, sayTok); }
    if (++n % 12 === 0) { const c = mk('div', 'kpCast', charHTML(pick(CAST_IDS), 'dance')); c.style.left = rand(10, 80) + '%'; room.appendChild(c); setTimeout(() => c.remove(), 1800); g.star(1); }
  };
  g.key = e => { e.preventDefault(); pop(e.key.length === 1 ? e.key : '•'); };
  g.on(room, 'pointerdown', e => { const r = room.getBoundingClientRect(); pop('•', (e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100); });
  H.bubble('⌨️ 👋');
});
GBY.keyparty.mash = true;

/* DISCO — a secret party: lights, the whole cast dancing, tap the floor */
game('disco', 'play', '🪩', g => {
  const H = g.host('foxy'); g.stage.classList.add('col');
  g.stage.innerHTML = `<div class="disco"><div class="dBall">🪩</div><div class="dCast">${CAST_IDS.map(n => charHTML(n, 'dance')).join('')}</div><div class="dFloor"></div></div><div class="bbar dBar"></div>`;
  const floor = $('.dFloor', g.stage), bar = $('.dBar', g.stage), disco = $('.disco', g.stage); let S = BAND[2], freeze = false;
  for (let i = 0; i < 40; i++) { const t = mk('button', 'dTile'); t.addEventListener('pointerdown', () => { t.style.background = pick(COLORS); tone(PENTA[i % 10] * 2, .2, 'square', .05); setTimeout(() => t.style.background = '', 600); }); floor.appendChild(t); }
  BAND.forEach((b, i) => { const x = mk('button', 'swatch big', b.e); x.addEventListener('click', () => { S = b; seq.bpm = b.bpm; SFX.tap(); }); bar.appendChild(x); });
  const fz = mk('button', 'swatch big', '🧊'); fz.addEventListener('click', () => { freeze = !freeze; fz.classList.toggle('sel', freeze); }); bar.appendChild(fz);
  let stopped = false;
  const seq = sequencer(g, S.bpm, 4, (step, d) => {
    if (stopped) return; const s16 = step % 16, b = Math.floor(step / 16) % 4, [root, mn] = S.ch[b];
    if (S.k.includes(s16)) DRUM.kick(d); if (S.s.includes(s16)) DRUM.snare(d); if (S.h.includes(s16)) DRUM.hat(d);
    S.bass.forEach(([st, off]) => { if (st === s16) tone(sf(root - 24 + off), .22, 'sawtooth', .06, d); });
    if (S.keys.includes(s16)) [root, root + (mn ? 3 : 4), root + 7].forEach(n => tone(sf(n), S.keyLen, 'triangle', .03, d));
    if (s16 % 2 === 0) { const n = S.mel[b][s16 / 2]; if (n != null) tone(sf(n), .25, 'triangle', .07, d); }
    if (s16 % 4 === 0) setTimeout(() => { if (!g.alive()) return; disco.style.setProperty('--h', (step * 37) % 360); $$('.dTile', floor).forEach(t => { if (Math.random() < .25) { t.classList.add('lit'); setTimeout(() => t.classList.remove('lit'), 250); } }); }, d * 1000);
  });
  seq.start();
  g.every(4500, () => { if (!freeze) return; stopped = true; $$('.dCast .char', g.stage).forEach(c => c.classList.remove('dance')); H.bubble('🧊 !'); g.after(rand(1500, 2800), () => { stopped = false; $$('.dCast .char', g.stage).forEach(c => c.classList.add('dance')); g.star(1); }); });
  g.dispose(() => seq.stop());
  H.bubble('🪩 🕺');
});
