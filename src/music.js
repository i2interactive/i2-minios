/* ═════════ MUSIC ═════════ */
const KEYF = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];
const KEYC = [TT.red, TT.orange, TT.yellow, TT.green, TT.teal, TT.blue, TT.purple, TT.pink];
const SONGS = {
  twinkle: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0, 4, 4, 3, 3, 2, 2, 1, 4, 4, 3, 3, 2, 2, 1, 0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0],
  mary: [2, 1, 0, 1, 2, 2, 2, 1, 1, 1, 2, 4, 4, 2, 1, 0, 1, 2, 2, 2, 2, 1, 1, 2, 1, 0]
};

/* PIANO — free play, or follow the glowing key to play a song */
game('piano', 'music', '🎹', g => {
  const H = g.host('dino');
  const keys = mk('div', 'keys'); g.stage.appendChild(keys); const KL = 'ASDFGHJK'; let song = null, pos = 0, echo = null, echoLen = 2, inp = [], busy = false;
  const els = KEYF.map((f, i) => { const k = mk('div', 'key', KL[i]); k.style.setProperty('--k', KEYC[i]); keys.appendChild(k); return k; });
  const play = i => {
    tone(KEYF[i], .9, 'triangle', .28); tone(KEYF[i] * 2, .5, 'sine', .05);
    const k = els[i]; k.classList.add('down'); clearTimeout(k._t); k._t = setTimeout(() => k.classList.remove('down'), 160);
    const n = mk('div', 'note', pick(['♪', '♫', '♬'])), r = k.getBoundingClientRect(), sr = g.stage.getBoundingClientRect();
    n.style.left = (r.left - sr.left + r.width / 2) + 'px'; n.style.top = (r.top - sr.top + r.height * .45) + 'px'; g.stage.appendChild(n); setTimeout(() => n.remove(), 1200);
    if (song) { if (i === SONGS[song][pos]) { pos++; if (pos % 7 === 0) g.star(1); if (pos >= SONGS[song].length) { pos = 0; g.after(300, () => { SFX.chime(); H.happy(pick(T().yes)); g.star(3); }); } } guide(); }
    if (echo && !busy) { inp.push(i); const k = inp.length - 1; if (inp[k] !== echo[k]) { busy = true; H.mood('oops'); g.after(700, () => SFX.bad()); g.after(1500, playEcho); } else if (inp.length === echo.length) { busy = true; g.star(1); H.happy(); g.after(500, SFX.good); echoLen = Math.min(6, echoLen + 1); g.after(1600, () => { echo = Array.from({ length: echoLen }, () => randi(0, 7)); playEcho(); }); } }
  };
  function playEcho() { if (song !== 'echo') return; busy = true; inp = []; H.say(T().watch, 'talk', lang, 0, CARD.emoji('👀')); echo.forEach((n, k) => g.after(900 + k * 520, () => { tone(KEYF[n], .5, 'triangle', .26); els[n].classList.add('down', 'guide'); setTimeout(() => els[n].classList.remove('down', 'guide'), 380); })); g.after(900 + echo.length * 520, () => { busy = false; H.say(T().yourTurn, 'talk', lang, 0, CARD.emoji('👉')); }); }
  const guide = () => els.forEach((k, i) => k.classList.toggle('guide', !!SONGS[song] && SONGS[song][pos] === i));
  els.forEach((k, i) => { g.on(k, 'pointerdown', e => { try { k.releasePointerCapture(e.pointerId); } catch (_) {} play(i); }); g.on(k, 'pointerenter', e => { if (e.buttons) play(i); }); });
  const modes = [null, 'twinkle', 'mary', 'echo'], labels = ['♪ FREE', '★ TWINKLE', '★ MARY', '⟲ ECHO'];
  g.tool('♪ FREE', b => { const m = (modes.indexOf(song) + 1) % 4; song = modes[m]; pos = 0; echo = null; busy = false; b.textContent = labels[m]; guide(); if (song === 'echo') { echoLen = 2; echo = Array.from({ length: echoLen }, () => randi(0, 7)); playEcho(); } });
  H.bubble('🎹 ⟲');
  g.key = e => { const i = KL.indexOf(e.key.toUpperCase()); if (i >= 0 && !e.repeat) play(i); };
});

/* DRUMS — six pads, plus a groove to drum along with */
game('drums', 'music', '🥁', g => {
  const H = g.host('dino');
  const PADS = [['BOOM', DRUM.kick, TT.red, 'A'], ['TAP', DRUM.snare, TT.yellow, 'S'], ['TSS', DRUM.hat, TT.green, 'D'], ['CLAP', DRUM.clap, TT.blue, 'F'], ['TOM', DRUM.tom, TT.orange, 'G'], ['CRASH', DRUM.crash, TT.purple, 'H']];
  const grid = mk('div', 'pads'); g.stage.appendChild(grid);
  const els = PADS.map(([n, f, c, k], i) => { const p = mk('button', 'pad', `<b>${n}</b><small>${k}</small>`); p.style.setProperty('--c', c); g.on(p, 'pointerdown', () => hit(i)); grid.appendChild(p); return p; });
  let hits = 0; function hit(i, d = 0) { if (!d) { PADS[i][1](); if (++hits % 12 === 0) { g.star(1); H.mood('happy', 500); } } setTimeout(() => retrigger(els[i], 'hitpad'), d * 1000); }
  const seq = sequencer(g, 96, 2, (step, d) => { const s = step % 8; if (s === 0 || s === 4) { DRUM.kick(d); hit(0, d); } if (s === 2 || s === 6) { DRUM.snare(d); hit(1, d); } DRUM.hat(d); });
  g.tool('▶ BEAT', b => { if (seq.on) { seq.stop(); b.textContent = '▶ BEAT'; H.el.classList.remove('dance'); } else { seq.start(); b.textContent = '■ STOP'; H.el.classList.add('dance'); } });
  H.bubble('🥁 ▶');
  g.key = e => { const i = 'ASDFGH'.indexOf(e.key.toUpperCase()); if (i >= 0 && !e.repeat) hit(i); };
});

/* RHYTHM — notes fall in four lanes, tap the lane when the note reaches the line */
game('rhythm', 'music', '🎵', g => {
  const H = g.host('foxy');
  const C = g.canvas(), P = new Particles(), LC = [TT.green, TT.blue, TT.red, TT.yellow], LF = [392, 523.25, 659.25, 783.99];
  let notes = [], score = 0, combo = 0, flash = [0, 0, 0, 0], msg = null; let travel = 1.6, BPM = 76;
  audio();
  const seq = sequencer(g, BPM, 2, (step, d, at) => {
    const s = step % 16;
    if (s % 4 === 0) DRUM.kick(d); if (s % 4 === 2) DRUM.snare(d); DRUM.hat(d);
    if (s % 2 === 0) tone([130.81, 130.81, 174.61, 196][Math.floor(s / 4)], .3, 'triangle', .12, d);
    const dens = score < 8 ? .55 : score < 25 ? .7 : .8;
    if (s % 2 === 0 && step > 3 && Math.random() < dens) notes.push({ lane: randi(0, 3), at: at + travel, hit: false });
    else if (score > 25 && Math.random() < .15) notes.push({ lane: randi(0, 3), at: at + travel, hit: false });
  });
  g.levels(3, lv => { BPM = [76, 90, 104][lv - 1]; seq.bpm = BPM; travel = [1.7, 1.5, 1.3][lv - 1]; notes = []; score = 0; g.meter([20, 25, 30][lv - 1]); if (!seq.on) seq.start(); H.el.classList.add('dance'); });
  function press(l) {
    if (!AC) return; const now = AC.currentTime; flash[l] = 1;
    const n = notes.filter(n => n.lane === l && !n.hit).sort((a, b) => Math.abs(a.at - now) - Math.abs(b.at - now))[0];
    if (n && Math.abs(n.at - now) < .24) { n.hit = true; score++; combo++; tone(LF[l], .35, 'triangle', .26); tone(LF[l] * 2, .2, 'sine', .06); const x = (l + .5) * C.w / 4, y = C.h * .82; P.burst(x, y, [LC[l], TT.white], 18, C.h * .5, { g: 300 }); msg = { t: .6, text: combo >= 5 ? `×${combo}` : '★' }; g.star(1, ...FX(C, x, y)); if (g.progress()) { seq.stop(); notes = []; g.levelUp(); } }
    else { tone(LF[l], .2, 'triangle', .08); combo = 0; }
  }
  g.on(C.cv, 'pointerdown', e => press(clamp(Math.floor(C.pos(e).x / C.w * 4), 0, 3)));
  g.key = e => { const i = ['d', 'f', 'j', 'k'].indexOf(e.key.toLowerCase()); const j = ['ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight'].indexOf(e.key); const k = i >= 0 ? i : j; if (k >= 0 && !e.repeat) press(k); };
  g.loop(dt => {
    const w = C.w, h = C.h, ctx = C.ctx, now = AC ? AC.currentTime : 0, hy = h * .82, lw = w / 4;
    notes = notes.filter(n => now - n.at < .6 && !(n.hit && now > n.at + .05));
    P.update(dt); flash = flash.map(f => Math.max(0, f - dt * 4)); if (msg && (msg.t -= dt) <= 0) msg = null;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    for (let l = 0; l < 4; l++) { const x = l * lw; ctx.fillStyle = l % 2 ? '#070707' : '#0c0c0c'; ctx.fillRect(x, 0, lw, h); ctx.fillStyle = LC[l]; ctx.globalAlpha = .1 + flash[l] * .35; ctx.fillRect(x, 0, lw, h); ctx.globalAlpha = 1; }
    const bd = 60 / BPM, ph = now % bd;
    ctx.fillStyle = 'rgba(242,242,238,.08)'; for (let k = 0; k < 6; k++) { const y = hy - ((k * bd + (bd - ph)) / travel) * hy; if (y > 0 && y < hy) ctx.fillRect(0, y, w, 2); }
    for (const n of notes) {
      const y = hy - (n.at - now) / travel * hy, x = n.lane * lw + lw / 2, s = Math.min(lw * .32, h * .07);
      if (y < -s) continue; ctx.globalAlpha = now > n.at + .24 && !n.hit ? .3 : 1;
      ctx.fillStyle = LC[n.lane]; ctx.fillRect(x - s, y - s * .55, s * 2, s * 1.1); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(x - s, y - s * .55, s * 2, s * .2); ctx.globalAlpha = 1;
    }
    for (let l = 0; l < 4; l++) { const x = l * lw + lw / 2, s = Math.min(lw * .36, h * .08); ctx.strokeStyle = LC[l]; ctx.lineWidth = 5; ctx.strokeRect(x - s, hy - s * .6, s * 2, s * 1.2); ctx.fillStyle = LC[l]; ctx.globalAlpha = .25 + flash[l] * .75; ctx.fillRect(x - s, hy - s * .6, s * 2, s * 1.2); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.font = `700 ${s * .7}px ${PXF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('DFJK'[l], x, hy); }
    P.draw(ctx);
    if (msg) { ctx.font = `700 ${h * .1}px ${PXF}`; ctx.fillStyle = TT.yellow; ctx.textAlign = 'center'; ctx.globalAlpha = Math.min(1, msg.t * 3); ctx.fillText(msg.text, w / 2, h * .35); ctx.globalAlpha = 1; }
  });
});

/* BEAT MAKER — 8-step sequencer */
game('beats', 'music', '🎛️', g => {
  const H = g.host('robo');
  const ROWS = [['BOOM', TT.red, d => DRUM.kick(d)], ['TAP', TT.yellow, d => DRUM.snare(d)], ['TSS', TT.green, d => DRUM.hat(d)], ['CLAP', TT.blue, d => DRUM.clap(d)], ['BELL', TT.purple, (d, s) => DRUM.bell(PENTA[[5, 4, 2, 4, 5, 7, 5, 2][s]] , d)]];
  const pat = [[1, 0, 0, 0, 1, 0, 0, 0], [0, 0, 1, 0, 0, 0, 1, 0], [1, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 1, 0, 0, 1, 0]];
  const grid = mk('div', 'seqGrid'); g.stage.appendChild(grid); const cells = [];
  ROWS.forEach(([n, c], r) => {
    const lab = mk('div', 'seqLab', n); lab.style.color = c; grid.appendChild(lab); cells[r] = [];
    for (let s = 0; s < 8; s++) { const b = mk('button', 'cell' + (pat[r][s] ? ' on' : '') + (s % 4 === 0 ? ' bar' : '')); b.style.setProperty('--c', c); b.addEventListener('pointerdown', () => { pat[r][s] ^= 1; b.classList.toggle('on', !!pat[r][s]); if (pat[r][s]) ROWS[r][2](0, s); }); grid.appendChild(b); cells[r][s] = b; }
  });
  const seq = sequencer(g, 100, 2, (step, d) => {
    const s = step % 8; ROWS.forEach((row, r) => { if (pat[r][s]) row[2](d, s); });
    setTimeout(() => { cells.forEach(rc => rc.forEach((c, k) => c.classList.toggle('play', k === s))); }, d * 1000);
  });
  seq.start(); H.el.classList.add('dance');
  g.tool('■', b => { if (seq.on) { seq.stop(); b.textContent = '▶'; H.el.classList.remove('dance'); cells.forEach(rc => rc.forEach(c => c.classList.remove('play'))); } else { seq.start(); b.textContent = '■'; H.el.classList.add('dance'); } });
  g.tool('🐢', b => { seq.bpm = seq.bpm === 100 ? 72 : seq.bpm === 72 ? 128 : 100; b.textContent = seq.bpm === 72 ? '🐢' : seq.bpm === 128 ? '🐇' : '🚶'; });
  g.tool('🎲', () => { pat.forEach((row, r) => row.forEach((_, s) => { row[s] = Math.random() < [.35, .25, .7, .15, .3][r] ? 1 : 0; cells[r][s].classList.toggle('on', !!row[s]); })); });
  g.tool('↺', () => { pat.forEach((row, r) => row.forEach((_, s) => { row[s] = 0; cells[r][s].classList.remove('on'); })); });
});

/* COPY ME — Simon: watch the robot, then play it back */
game('copy', 'music', '🟩', g => {
  const H = g.host('robo'); let goal = 3;
  const COLS = [TT.green, TT.blue, TT.red, TT.yellow], F = [392, 523.25, 659.25, 783.99];
  g.stage.innerHTML = `<div class="simon">${charHTML('robo','big')}<div class="simonN">1</div></div>`;
  const grid = mk('div', 'simonPads'); g.stage.prepend(grid);
  const pads = COLS.map((c, i) => { const p = mk('button', 'spad'); p.style.setProperty('--c', c); g.on(p, 'pointerdown', () => press(i)); grid.appendChild(p); return p; });
  let seqL = [], inp = 0, mode = 'watch', rounds = 0;
  const light = (i, ms = 380) => { pads[i].classList.add('lit'); tone(F[i], ms / 1000 + .1, 'triangle', .26); setTimeout(() => pads[i].classList.remove('lit'), ms); };
  function show() {
    mode = 'watch'; inp = 0; document.body.classList.add('busy'); $('.simonN', g.stage).textContent = seqL.length;
    if (rounds < 3) H.say(T().watch, 'talk', lang, 0, CARD.emoji('👀'));
    seqL.forEach((i, k) => g.after(900 + k * 620, () => light(i)));
    g.after(900 + seqL.length * 620, () => { mode = 'input'; document.body.classList.remove('busy'); if (rounds < 3) H.say(T().yourTurn, 'talk', lang, 0, CARD.emoji('👉')); });
  }
  function press(i) {
    if (mode !== 'input') return; light(i, 250);
    if (i === seqL[inp]) { inp++; if (inp === seqL.length) { mode = 'wait'; rounds++; g.after(400, SFX.good); H.mood('happy', 600); g.star(1); g.progress(); if (seqL.length >= goal) { g.after(900, () => g.levelUp()); } else { seqL.push(randi(0, 3)); g.after(1300, show); } } }
    else { mode = 'wait'; SFX.bad(); H.mood('oops'); retrigger(grid, 'shake'); H.say(T().again); g.after(1500, show); }
  }
  g.key = e => { const i = ['ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown'].indexOf(e.key); const j = '1234'.indexOf(e.key); const k = j >= 0 ? j : i; if (k >= 0) press(k); };
  g.dispose(() => document.body.classList.remove('busy'));
  g.levels(3, lv => { goal = [3, 5, 7][lv - 1]; g.meter(goal); rounds = 0; seqL = [randi(0, 3)]; show(); });
});
