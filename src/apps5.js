/* ═════════ NEW APPS · part 5 — music maker, video editor, cook with me, code, baby helper ═════════ */
function audioTap() { audio(); if (!AC) return null; const dest = AC.createMediaStreamDestination(); MASTER.connect(dest); return dest; }
function playBuffer(buf, delay = 0, vol = 1) { if (!AC || !buf) return; const s = AC.createBufferSource(), gn = AC.createGain(); gn.gain.value = vol; s.buffer = buf; s.connect(gn); gn.connect(MASTER); s.start(AC.currentTime + Math.max(0, delay)); }

/* MUSIC MAKER — stack riffs on 5 tracks like an old-school music generator; record your own voice */
const MM_TRACKS = [
  { id: 'drums', e: '🥁', c: TT.green, riffs: [
    { e: '🟢', k: [0, 8], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] }, { e: '🔷', k: [0, 6, 8], s: [4, 12], h: [0, 4, 8, 12] }, { e: '🔺', k: [0, 4, 8, 12], s: [4, 12], h: [2, 6, 10, 14] },
    { e: '⭐', k: [0, 10], s: [4, 12], c: [12], h: [0, 1, 2, 3, 4, 6, 8, 9, 10, 11, 12, 14] }, { e: '💥', k: [0, 3, 6, 10], s: [4, 12, 14], h: [0, 2, 4, 6, 8, 10, 12, 14] }, { e: '🌀', t: [8, 10, 12, 14], s: [4], k: [0] },
    { e: '👏', k: [0, 8], c: [4, 12], h: [2, 6, 10, 14] }, { e: '🐢', k: [0], s: [8], h: [0, 4, 8, 12] }] },
  { id: 'bass', e: '🎸', c: TT.blue, riffs: [
    { e: '🟢', n: [[0, 0], [8, 0]] }, { e: '🔷', n: [[0, 0], [4, 0], [8, 7], [12, 5]] }, { e: '🔺', n: [[0, 0], [2, 12], [4, 0], [6, 12], [8, 0], [10, 12], [12, 0], [14, 12]] }, { e: '⭐', n: [[0, 5], [8, 7]] },
    { e: '💥', n: [[0, 9], [6, 9], [8, 7], [12, 5]] }, { e: '🌀', n: [[0, 0], [3, 3], [6, 5], [10, 7], [12, 10]] }, { e: '👏', n: [[0, 7], [4, 7], [8, 5], [12, 4]] }, { e: '🐢', n: [[0, 0]] }] },
  { id: 'keys', e: '🎹', c: TT.red, riffs: [
    { e: '🟢', ch: 0, r: [0] }, { e: '🔷', ch: 5, r: [0] }, { e: '🔺', ch: 7, r: [0] }, { e: '⭐', ch: 9, m: 1, r: [0] },
    { e: '💥', ch: 0, r: [0, 3, 6, 10, 12] }, { e: '🌀', ch: 5, r: [2, 6, 10, 14] }, { e: '👏', ch: 7, arp: 1 }, { e: '🐢', ch: 9, m: 1, arp: 1 }] },
  { id: 'lead', e: '🎺', c: TT.yellow, riffs: [
    { e: '🟢', n: [[0, 12], [4, 16], [8, 19], [12, 16]] }, { e: '🔷', n: [[0, 19], [2, 21], [4, 19], [8, 16], [12, 14]] }, { e: '🔺', n: [[0, 24], [4, 21], [6, 19], [8, 16], [12, 12]] }, { e: '⭐', n: [[0, 16], [2, 16], [4, 19], [6, 21], [8, 19]] },
    { e: '💥', n: [[0, 12], [1, 14], [2, 16], [3, 19], [4, 21], [8, 24]] }, { e: '🌀', n: [[0, 21], [4, 19], [8, 16], [10, 14], [12, 12]] }, { e: '👏', n: [[0, 14], [4, 14], [6, 16], [8, 19], [14, 16]] }, { e: '🐢', n: [[0, 12], [8, 7]] }] },
  { id: 'fx', e: '🎤', c: TT.pink, riffs: [{ e: '📯' }, { e: '🚨' }, { e: '👾' }, { e: '🌊' }] }
];
const FX_SND = { '📯': (d) => { [0, .05].forEach(o => tone(466, .5, 'sawtooth', .05, d + o)); tone(587, .5, 'sawtooth', .04, d); }, '🚨': (d) => { for (let i = 0; i < 4; i++) { tone(880, .12, 'square', .04, d + i * .25); tone(660, .12, 'square', .04, d + i * .25 + .12); } }, '👾': (d) => { for (let i = 0; i < 6; i++) sweep(1200, 200, .08, 'square', .05, d + i * .09); }, '🌊': (d) => noise(1.4, .2, 'bandpass', 700, d, .6) };
game('musicmaker', 'music', '🎛️', g => {
  const H = g.host('robo'); const BARS = 16;
  let song = null; try { song = JSON.parse(localStorage.getItem(KEYS.song) || 'null'); } catch (e) {}
  if (!song || !song.grid) song = { bpm: 110, grid: MM_TRACKS.map(() => Array(BARS).fill(-1)), mute: [0, 0, 0, 0, 0] };
  const save = () => { try { localStorage.setItem(KEYS.song, JSON.stringify(song)); } catch (e) {} };
  let track = 0, sel = [0, 0, 0, 0, 0], vox = [], playing = false, bar = 0;
  g.stage.innerHTML = `<div class="mm"><div class="mmTop"></div><div class="mmBody"><div class="mmHeads"></div><div class="mmGrid" style="--bars:${BARS}"></div></div><div class="mmPal"></div></div>`;
  const top = $('.mmTop', g.stage), heads = $('.mmHeads', g.stage), grid = $('.mmGrid', g.stage), pal = $('.mmPal', g.stage);
  const riffsOf = ti => ti === 4 ? [...MM_TRACKS[4].riffs, ...vox.map((v, i) => ({ e: '🗣️', vox: i }))] : MM_TRACKS[ti].riffs;
  function playRiff(ti, ri, d = 0, step = -1) {
    const r = riffsOf(ti)[ri]; if (!r) return; const sd = 60 / song.bpm / 4, at = st => d + st * sd;
    const each = (arr, fn) => (arr || []).forEach(st => { if (step < 0) fn(at(st)); else if (st === step) fn(d); });
    if (ti === 0) { each(r.k, x => DRUM.kick(x)); each(r.s, x => DRUM.snare(x)); each(r.h, x => DRUM.hat(x)); each(r.c, x => DRUM.clap(x)); each(r.t, x => DRUM.tom(x)); }
    if (ti === 1 || ti === 3) (r.n || []).forEach(([st, n]) => { const go = x => { if (ti === 1) { tone(sf(n - 24), .22, 'sawtooth', .07, x); tone(sf(n - 12), .18, 'sine', .08, x); } else { tone(sf(n), .25, 'square', .045, x); tone(sf(n + 12), .15, 'sine', .03, x); } }; if (step < 0) go(at(st)); else if (st === step) go(d); });
    if (ti === 2) { const ch = [r.ch, r.ch + (r.m ? 3 : 4), r.ch + 7]; if (r.arp) { for (let st = 0; st < 16; st += 2) { if (step >= 0 && st !== step) continue; tone(sf(ch[(st / 2) % 3] + 12), .18, 'triangle', .06, step < 0 ? at(st) : d); } } else each(r.r, x => ch.forEach(n => tone(sf(n), r.r.length > 1 ? .18 : 1.6, 'triangle', .045, x))); }
    if (ti === 4 && (step <= 0)) { if (r.vox != null) playBuffer(vox[r.vox], d, 1.2); else FX_SND[r.e](d); }
  }
  function renderTop() {
    top.innerHTML = ''; const B = (h, fn, cls = '') => { const b = mk('button', 'gtool ' + cls, h); b.addEventListener('click', fn); top.appendChild(b); return b; };
    B(playing ? '⏹' : '▶', () => { playing ? stop() : start(); }, 'big');
    B(song.bpm < 100 ? '🐢' : song.bpm > 120 ? '🐇' : '🚶', () => { song.bpm = song.bpm < 100 ? 110 : song.bpm < 120 ? 128 : 90; seq.bpm = song.bpm; save(); renderTop(); });
    const rec = B('🎤 ●', () => recordVox(rec)); B('🎲', () => { MM_TRACKS.forEach((tr, ti) => { const r = randi(0, Math.min(3, tr.riffs.length - 1)); for (let b = 0; b < 8; b++) song.grid[ti][b] = ti === 4 ? (b % 4 === 0 ? randi(0, 3) : -1) : (b < (ti === 3 ? 4 : 0) ? -1 : (r + (b % 4 === 3 ? 1 : 0)) % tr.riffs.length); }); save(); renderGrid(); SFX.chime(); });
    B('📼', () => exportSong()); const clr = B('🗑️', () => { if (!clr.dataset.arm) { clr.dataset.arm = 1; clr.textContent = '🗑️?'; g.after(2500, () => { delete clr.dataset.arm; clr.textContent = '🗑️'; }); return; } song.grid = MM_TRACKS.map(() => Array(BARS).fill(-1)); save(); renderGrid(); SFX.whoosh(); });
  }
  function renderHeads() { heads.innerHTML = ''; MM_TRACKS.forEach((tr, ti) => { const b = mk('button', 'mmHead' + (ti === track ? ' sel' : '') + (song.mute[ti] ? ' mute' : ''), `<span>${tr.e}</span><i>${song.mute[ti] ? '🔇' : '🔊'}</i>`); b.style.setProperty('--c', tr.c); b.addEventListener('click', e => { if (e.target.tagName === 'I') { song.mute[ti] = song.mute[ti] ? 0 : 1; save(); } else track = ti; renderHeads(); renderPal(); }); heads.appendChild(b); }); }
  function renderGrid() {
    grid.innerHTML = ''; MM_TRACKS.forEach((tr, ti) => { for (let b = 0; b < BARS; b++) { const v = song.grid[ti][b], r = v >= 0 ? riffsOf(ti)[v] : null, c = mk('button', 'mmCell' + (r ? ' on' : '') + (b % 4 === 0 ? ' bar' : ''), r ? r.e : ''); c.style.setProperty('--c', tr.c); c.dataset.b = b;
      c.addEventListener('click', () => { if (ti !== track) { track = ti; renderHeads(); renderPal(); } const cur = song.grid[ti][b]; song.grid[ti][b] = cur === sel[ti] ? -1 : sel[ti]; save(); renderGrid(); if (song.grid[ti][b] >= 0 && !playing) playRiff(ti, sel[ti]); else tone(200, .05, 'triangle', .06); });
      grid.appendChild(c); } });
  }
  function renderPal() { pal.innerHTML = ''; pal.style.setProperty('--c', MM_TRACKS[track].c); riffsOf(track).forEach((r, i) => { const b = mk('button', 'mmRiff' + (i === sel[track] ? ' sel' : ''), r.e); b.addEventListener('click', () => { sel[track] = i; renderPal(); if (!playing) playRiff(track, i); }); pal.appendChild(b); }); }
  const songLen = () => { let last = 0; song.grid.forEach(row => row.forEach((v, b) => { if (v >= 0) last = Math.max(last, b + 1); })); return Math.max(4, Math.ceil(last / 4) * 4); };
  const seq = sequencer(g, song.bpm, 4, (step, d) => {
    const len = songLen(), b = Math.floor(step / 16) % len, s16 = step % 16;
    MM_TRACKS.forEach((tr, ti) => { const v = song.grid[ti][b]; if (v >= 0 && !song.mute[ti]) playRiff(ti, v, d, s16); });
    if (s16 === 0) setTimeout(() => { if (!g.alive()) return; bar = b; $$('.mmCell', grid).forEach(c => c.classList.toggle('now', +c.dataset.b === b)); }, d * 1000);
  });
  const start = () => { playing = true; seq.start(); renderTop(); $$('.kCast .char', g.stage).forEach(c => c.classList.add('dance')); };
  const stop = () => { playing = false; seq.stop(); renderTop(); $$('.mmCell', grid).forEach(c => c.classList.remove('now')); };
  async function recordVox(btn) {
    if (btn._rec) { btn._rec.stop(); return; }
    try { const s = await navigator.mediaDevices.getUserMedia({ audio: true }), mr = new MediaRecorder(s), ch = []; mr.ondataavailable = e => ch.push(e.data);
      mr.onstop = async () => { s.getTracks().forEach(x => x.stop()); btn._rec = null; btn.classList.remove('rec'); try { const buf = await AC.decodeAudioData(await new Blob(ch).arrayBuffer()); vox.push(buf); if (vox.length > 4) vox.shift(); track = 4; sel[4] = riffsOf(4).length - 1; renderHeads(); renderPal(); playBuffer(buf); g.star(1); } catch (e) { console.warn(e); } };
      audio(); btn._rec = mr; mr.start(); btn.classList.add('rec'); setTimeout(() => mr.state === 'recording' && mr.stop(), 3000);
    } catch (e) { H.mood('oops'); }
  }
  async function exportSong() {
    const dest = audioTap(); if (!dest) return; stop(); const len = songLen(), dur = len * 4 * 60 / song.bpm + .5, mr = new MediaRecorder(dest.stream), ch = [];
    mr.ondataavailable = e => ch.push(e.data); mr.onstop = async () => { try { MASTER.disconnect(dest); } catch (e) {} const blob = new Blob(ch, { type: mr.mimeType || 'audio/webm' }); await MEDIA.add('song', { blob, label: '🎛️' }); SFX.chime(); H.happy(); g.star(3); H.bubble('📺 ✔'); };
    mr.start(); start(); H.bubble('📼 ● REC'); g.after(dur * 1000, () => { if (mr.state === 'recording') mr.stop(); stop(); });
  }
  g.dispose(() => { try { seq.stop(); } catch (e) {} });
  renderTop(); renderHeads(); renderGrid(); renderPal(); H.bubble('👆 🎛️ ▶');
});

/* VIDEO EDITOR — clips in the bin, drop them on the timeline, add looks + transitions + music, export to My TV */
const VE_BUILTIN = [
  { id: 'dance', e: '💃', draw: (x, w, h, t) => { x.fillStyle = `hsl(${(t * 60) % 360} 70% 35%)`; x.fillRect(0, 0, w, h); CAST_IDS.forEach((n, i) => { const im = spriteImg(n, Math.floor(t * 4 + i) % 2 ? 'run1' : 'run2'); if (im.complete) { x.imageSmoothingEnabled = false; const s = h * .4; x.drawImage(im, w * (.15 + i * .2) - s * .4, h * .8 - s - Math.abs(Math.sin(t * 6 + i)) * h * .08, s * .8, s); } }); } },
  { id: 'fireworks', e: '🎆', draw: (x, w, h, t) => { x.fillStyle = '#05061a'; x.fillRect(0, 0, w, h); for (let k = 0; k < 4; k++) { const p = (t * .7 + k * .25) % 1, cx = w * (.2 + k * .2), cy = h * (.25 + (k % 2) * .15); x.fillStyle = COLORS[k * 2 % 7]; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28, r = p * h * .25; x.globalAlpha = 1 - p; x.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r + p * p * 30, 5, 5); } x.globalAlpha = 1; } } },
  { id: 'rainbow', e: '🌈', draw: (x, w, h, t) => { COLORS.forEach((c, i) => { x.fillStyle = c; x.fillRect(0, (i / 7) * h + Math.sin(t * 3 + i) * 6, w, h / 7 + 2); }); } },
  { id: 'space', e: '🚀', draw: (x, w, h, t) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; for (let i = 0; i < 60; i++) x.fillRect(((i * 97 - t * 80 * (1 + i % 3)) % w + w) % w, (i * 53) % h, 2, 2); x.font = `${h * .3}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('🚀', w * .3 + Math.sin(t) * 20, h * .5 + Math.cos(t * 2) * 10); x.fillText('🪐', w * .75, h * .35); } },
  { id: 'ocean', e: '🐳', draw: (x, w, h, t) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a6fdb'); gr.addColorStop(1, '#06204a'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.font = `${h * .2}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; ['🐳', '🐠', '🐙', '🐟'].forEach((e, i) => x.fillText(e, ((w * (i * .3) + t * 60 * (i % 2 ? -1 : 1)) % (w + 100) + w + 100) % (w + 100) - 50, h * (.25 + i * .18))); } },
  { id: 'title', e: '🔤', draw: (x, w, h, t) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); [TT.green, TT.blue, TT.red, TT.yellow].forEach((c, i) => { x.fillStyle = c; x.fillRect(i * w / 4, h - 12, w / 4, 12); }); x.fillStyle = TT.white; x.font = `bold ${h * .18}px ${PXF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(KID_NAME() ? KID_NAME().toUpperCase() + ' TV' : 'MY TV', w / 2, h * .45 - Math.max(0, 1 - t) * 40); x.font = `${h * .12}px sans-serif`; x.fillText('🎬', w / 2, h * .7); } },
  { id: 'end', e: '🔚', draw: (x, w, h, t) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.fillStyle = TT.yellow; x.font = `bold ${h * .2}px ${PXF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.globalAlpha = Math.min(1, t); x.fillText('THE END', w / 2, h / 2); x.globalAlpha = 1; } }
];
const VE_LOOKS = ['🙂', '⚫', '🌈', '👾', '🔍', '🫨'], VE_TRANS = ['✂️', '🌫️', '➡️', '🌀'];
game('video', 'make', '🎬', g => {
  const H = g.host('hoot'); let bin = [], tl = [], selI = -1, playing = false, pt = 0, music = 0, rec = null;
  g.stage.innerHTML = `<div class="ve"><div class="veBin"></div><div class="veMain"><div class="tv veMon"><canvas width="640" height="360"></canvas><span class="veTime"></span></div><div class="veTools"></div></div></div><div class="veTL"></div>`;
  const binEl = $('.veBin', g.stage), cv = $('.veMon canvas', g.stage), x = cv.getContext('2d'), tools = $('.veTools', g.stage), tlEl = $('.veTL', g.stage), timeEl = $('.veTime', g.stage);
  const W = 640, Hh = 360, dur = c => c.len || 2, total = () => tl.reduce((a, c) => a + dur(c), 0);
  function drawClip(c, lt, alpha = 1) {
    x.save(); x.globalAlpha = alpha;
    const look = c.look || 0, zoom = look === 4 ? 1 + lt * .15 : 1, shake = look === 5 ? [Math.sin(lt * 40) * 6, Math.cos(lt * 33) * 6] : [0, 0];
    x.translate(W / 2 + shake[0], Hh / 2 + shake[1]); x.scale(zoom, zoom); x.translate(-W / 2, -Hh / 2);
    if (c.b) c.b.draw(x, W, Hh, lt); else if (c.img && c.img.complete) { const k = Math.max(W / c.img.width, Hh / c.img.height), iw = c.img.width * k, ih = c.img.height * k; x.fillStyle = '#000'; x.fillRect(0, 0, W, Hh); x.drawImage(c.img, (W - iw) / 2, (Hh - ih) / 2, iw, ih); }
    x.restore();
    if (look === 1 || look === 2 || look === 3) { const d = x.getImageData(0, 0, W, Hh), p = d.data; for (let i = 0; i < p.length; i += 4) { if (look === 1) { const l = p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11; p[i] = p[i + 1] = p[i + 2] = l; } else if (look === 2) { const hsh = ((i / 4) % W) / W * 360 + lt * 100; p[i] = (p[i] + 128 * (1 + Math.sin(hsh / 57))) / 2; p[i + 2] = (p[i + 2] + 128 * (1 + Math.cos(hsh / 57))) / 2; } else { p[i] = Math.round(p[i] / 85) * 85; p[i + 1] = Math.round(p[i + 1] / 85) * 85; p[i + 2] = Math.round(p[i + 2] / 85) * 85; } } x.putImageData(d, 0, 0); if (look === 3) { x.imageSmoothingEnabled = false; x.drawImage(cv, 0, 0, W / 10, Hh / 10); x.drawImage(cv, 0, 0, W / 10, Hh / 10, 0, 0, W, Hh); } }
  }
  function frame(t) {
    x.fillStyle = '#000'; x.fillRect(0, 0, W, Hh); if (!tl.length) { x.fillStyle = '#333'; x.font = `bold 40px ${PXF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('🎞️ → 🎬', W / 2, Hh / 2); return; }
    let a = 0; for (let i = 0; i < tl.length; i++) { const c = tl[i], d = dur(c); if (t < a + d || i === tl.length - 1) { const lt = t - a; drawClip(c, lt); const nx = tl[i + 1], tr = c.trans || 0, rem = d - lt;
      if (nx && tr && rem < .5) { const k = 1 - rem / .5; if (tr === 1) drawClip(nx, 0, k); else if (tr === 2) { x.save(); x.beginPath(); x.rect(0, 0, W * k, Hh); x.clip(); drawClip(nx, 0); x.restore(); } else if (tr === 3) { x.save(); x.translate(W / 2, Hh / 2); x.rotate((1 - k) * 3); x.scale(k, k); x.translate(-W / 2, -Hh / 2); drawClip(nx, 0); x.restore(); } }
      break; } a += d; }
    timeEl.textContent = `${t.toFixed(1)} / ${total().toFixed(1)}s`;
  }
  function renderBin() { binEl.innerHTML = ''; bin.forEach(c => { const b = mk('button', 'veClip', c.b ? `<b>${c.b.e}</b>` : ''); if (c.url) b.style.backgroundImage = `url(${c.url})`; b.addEventListener('click', () => { if (tl.length >= 10) { retrigger(tlEl, 'shake'); return; } tl.push({ ...c, look: 0, trans: tl.length ? 1 : 0, len: 2 }); selI = tl.length - 1; SFX.pop(); renderTL(); }); binEl.appendChild(b); }); }
  function renderTL() {
    tlEl.innerHTML = ''; tl.forEach((c, i) => { const b = mk('button', 'veSlot' + (i === selI ? ' sel' : ''), `${c.b ? `<b>${c.b.e}</b>` : ''}<i>${VE_LOOKS[c.look]}${c.trans ? VE_TRANS[c.trans] : ''}</i>`); b.style.flexGrow = dur(c); if (c.url) b.style.backgroundImage = `url(${c.url})`; b.addEventListener('click', () => { selI = i; renderTL(); renderTools(); pt = tl.slice(0, i).reduce((a, z) => a + dur(z), 0); frame(pt); }); tlEl.appendChild(b); });
    const mu = mk('div', 'veMusic', ['🔇', '🎈', '🏝️', '🪩', '🌙'][music]); tlEl.appendChild(mu); renderTools(); frame(pt);
  }
  function renderTools() {
    tools.innerHTML = ''; const B = (h, fn, cls = '') => { const b = mk('button', 'gtool ' + cls, h); b.addEventListener('click', () => { fn(); SFX.tap(); }); tools.appendChild(b); return b; };
    B(playing ? '⏹' : '▶', () => playing ? stopPlay() : play(), 'big');
    const c = tl[selI];
    if (c) { B(VE_LOOKS[c.look], () => { c.look = (c.look + 1) % VE_LOOKS.length; renderTL(); }); B(c.trans ? VE_TRANS[c.trans] : '✂️', () => { c.trans = (c.trans + 1) % VE_TRANS.length; renderTL(); }); B(`⏱${c.len}`, () => { c.len = c.len >= 4 ? 1 : c.len + 1; renderTL(); }); B('◀', () => { if (selI > 0) { [tl[selI - 1], tl[selI]] = [tl[selI], tl[selI - 1]]; selI--; renderTL(); } }); B('🗑️', () => { tl.splice(selI, 1); selI = Math.min(selI, tl.length - 1); renderTL(); }); }
    B(['🔇', '🎈', '🏝️', '🪩', '🌙'][music], () => { music = (music + 1) % 5; renderTL(); });
    B('🎞️ ⬇', () => exportVideo());
  }
  let seq = null; const t0 = { v: 0 };
  function play() { if (!tl.length) return; playing = true; pt = 0; t0.v = performance.now(); if (music) { const S = BAND[music - 1]; seq = seq || sequencer(g, S.bpm, 4, musicStep); seq.bpm = S.bpm; seq.start(); } renderTools(); }
  function stopPlay() { playing = false; if (seq) seq.stop(); renderTools(); if (rec && rec.state === 'recording') rec.stop(); }
  function musicStep(step, d) { if (!music) return; const S = BAND[music - 1], s16 = step % 16, b = Math.floor(step / 16) % 4, [root, mn] = S.ch[b]; if (S.k.includes(s16)) DRUM.kick(d); if (S.s.includes(s16)) DRUM.snare(d); if (S.h.includes(s16)) DRUM.hat(d); S.bass.forEach(([st, off]) => { if (st === s16) tone(sf(root - 24 + off), .22, 'sawtooth', .06, d); }); if (S.keys.includes(s16)) [root, root + (mn ? 3 : 4), root + 7].forEach(n => tone(sf(n), S.keyLen, 'triangle', .03, d)); }
  function exportVideo() {
    if (!tl.length || !cv.captureStream || !window.MediaRecorder) return; const dest = audioTap(), vs = cv.captureStream(30), stream = new MediaStream([...vs.getVideoTracks(), ...(dest ? dest.stream.getAudioTracks() : [])]);
    let mt = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m)) || ''; rec = new MediaRecorder(stream, mt ? { mimeType: mt } : {}); const ch = [];
    rec.ondataavailable = e => ch.push(e.data); rec.onstop = async () => { try { MASTER.disconnect(dest); } catch (e) {} const blob = new Blob(ch, { type: 'video/webm' }); await MEDIA.add('video', { blob, label: '🎬' }); SFX.chime(); H.happy(); g.star(3); confettiDOM(g, 30); H.bubble('📺 ✔'); rec = null; };
    rec.start(); play(); H.bubble('🎬 ● REC');
  }
  g.loop(() => { if (!playing) return; pt = (performance.now() - t0.v) / 1000; if (pt >= total()) { pt = total() - .001; frame(pt); stopPlay(); return; } frame(pt); });
  (async () => {
    const mine = (await MEDIA.list(['photo', 'paint', 'sticker'])).slice(0, 14);
    bin = [VE_BUILTIN[5], ...VE_BUILTIN.slice(0, 5), VE_BUILTIN[6]].map(b => ({ b }));
    for (const [, v] of mine) { const img = new Image(); img.src = v.url; bin.push({ img, url: v.url }); }
    if (!g.alive()) return; renderBin(); renderTL(); H.bubble('🎞️ → 🎬');
  })();
  g.dispose(() => { if (seq) seq.stop(); });
});

/* COOK WITH ME — real recipes to make together, step by step */
const COOK = [
  { e: '🥞', name: 'Banana Pancakes', ing: [['🍌', '1 ripe banana'], ['🥚', '2 eggs'], ['🫐', 'berries for the top']], steps: [
    ['🧒', '🍌', 'Peel the banana and put it in a bowl.'], ['🧒', '🍴', 'Squish it with a fork until it is mushy.'], ['🧒👨', '🥚', 'Crack in 2 eggs (grown-up helps).'], ['🧒', '🥄', 'Stir, stir, stir!'],
    ['👨', '🔥', 'Grown-up cooks small pancakes in a pan, about 2 minutes each side.', 120], ['🧒', '🫐', 'Put berries on top. Blow on it — it is hot!']] },
  { e: '🍓', name: 'Fruit Salad', ing: [['🍓', 'strawberries'], ['🍌', 'a banana'], ['🫐', 'blueberries'], ['🍊', 'an orange']], steps: [
    ['🧒', '💧', 'Wash the fruit in cool water.'], ['👨', '🔪', 'Grown-up cuts the fruit into small pieces.'], ['🧒', '🥣', 'Put all the fruit in a big bowl.'], ['🧒', '🍊', 'Squeeze the orange juice on top.'], ['🧒', '🥄', 'Gently mix. Count the colors!'], ['🧒👨', '😋', 'Share it with your family!']] },
  { e: '🥣', name: 'Yogurt Parfait', ing: [['🥛', 'yogurt'], ['🥣', 'granola or cereal'], ['🫐', 'berries']], steps: [
    ['🧒', '🥛', 'Spoon yogurt into a cup.'], ['🧒', '🥣', 'Sprinkle granola on top.'], ['🧒', '🫐', 'Add berries.'], ['🧒', '🔁', 'Do it again: yogurt, granola, berries!'], ['🧒', '😋', 'Look at the layers. Now eat it!']] },
  { e: '🥤', name: 'Smoothie', ing: [['🍌', '1 banana'], ['🍓', 'a handful of berries'], ['🥛', '1 cup milk or yogurt']], steps: [
    ['🧒', '🍌', 'Break the banana into pieces and drop them in the blender.'], ['🧒', '🍓', 'Add the berries.'], ['🧒👨', '🥛', 'Pour in the milk (grown-up holds the cup).'], ['👨', '🌀', 'Grown-up puts the lid on and blends for 30 seconds. LOUD!', 30], ['🧒👨', '🥤', 'Pour it in cups and say cheers!']] },
  { e: '🐜', name: 'Ants on a Log', ing: [['🥬', 'celery sticks'], ['🥜', 'peanut or sunflower butter'], ['🍇', 'raisins']], steps: [
    ['👨', '🔪', 'Grown-up washes and cuts the celery into logs.'], ['🧒', '🧈', 'Spread the butter in the log with a butter knife.'], ['🧒', '🐜', 'Put 5 raisin ants on each log. Count them: 1, 2, 3, 4, 5!'], ['🧒', '😋', 'Crunch!']] },
  { e: '🍕', name: 'Mini Pizzas', ing: [['🍞', 'English muffins or pita'], ['🍅', 'pizza sauce'], ['🧀', 'shredded cheese'], ['🫑', 'toppings you like']], steps: [
    ['👨', '🔥', 'Grown-up turns the oven on to 400°F (200°C).'], ['🧒', '🍅', 'Spread sauce on each muffin.'], ['🧒', '🧀', 'Sprinkle the cheese.'], ['🧒', '🫑', 'Add toppings. Make a face!'], ['👨', '🔥', 'Grown-up bakes them for about 8 minutes.', 480], ['🧒👨', '😋', 'Let them cool, then eat!']] }
];
game('cook', 'make', '👩‍🍳', g => {
  const H = g.host('hoot'); let R = null, si = -1, timer = null;
  g.stage.innerHTML = '<div class="cook"></div>'; const box = $('.cook', g.stage);
  const WHO = { '🧒': 'YOU', '👨': 'GROWN-UP', '🧒👨': 'TOGETHER' };
  function pickScreen() { R = null; si = -1; box.innerHTML = '<div class="topics cookPick"></div>'; COOK.forEach(r => { const b = mk('button', 'topic', r.e); b.title = r.name; b.addEventListener('click', () => { R = r; SFX.tap(); ingredients(); }); $('.cookPick', box).appendChild(b); }); H.bubble('👩‍🍳 👆'); }
  function ingredients() {
    box.innerHTML = `<div class="cookHead"><b>${R.e}</b><span>${R.name.toUpperCase()}</span></div><div class="cookIng"></div><button class="slab goBtn">▶</button>`; let have = 0;
    R.ing.forEach(([e, txt]) => { const b = mk('button', 'ingCard', `<b>${e}</b><span>${txt}</span>`); b.addEventListener('click', () => { if (b.classList.contains('got')) return; b.classList.add('got'); have++; tone(PENTA[have + 3], .15, 'triangle', .15); if (have === R.ing.length) $('.goBtn', box).classList.add('ready'); }); $('.cookIng', box).appendChild(b); });
    $('.goBtn', box).addEventListener('click', () => { si = 0; step(); }); H.say(`${R.name}! Let's get everything.`, 'talk', 'en');
  }
  function step() {
    clearInterval(timer); const [who, e, txt, secs] = R.steps[si];
    box.innerHTML = `<div class="cookStep"><div class="who w${who.length > 2 ? 3 : who === '👨' ? 2 : 1}">${who} ${WHO[who]}</div><div class="stepE pop">${e}</div><div class="stepT"></div><div class="stepN">${si + 1} / ${R.steps.length}</div><div class="cookBtns"></div></div>`;
    $('.stepT', box).textContent = txt; H.say(txt, 'talk', 'en', true);
    const btns = $('.cookBtns', box);
    if (secs) { const tb = mk('button', 'slab timerBtn', `⏱ ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`); let left = secs; tb.addEventListener('click', () => { if (timer) return; tb.classList.add('on'); timer = setInterval(() => { left--; tb.textContent = `⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; if (left <= 0) { clearInterval(timer); timer = null; tb.textContent = '⏱ ✔'; [784, 988, 1175, 784, 988, 1175].forEach((f, i) => tone(f, .2, 'square', .06, i * .2)); } }, 1000); }); btns.appendChild(tb); }
    const back = mk('button', 'slab', '◀'); back.addEventListener('click', () => { if (si > 0) { si--; step(); } else ingredients(); }); btns.appendChild(back);
    const ok = mk('button', 'slab okBtn', '✔'); ok.addEventListener('click', () => { SFX.good(); if (si < R.steps.length - 1) { si++; step(); } else done(); }); btns.appendChild(ok);
  }
  function done() { clearInterval(timer); box.innerHTML = `<div class="cookDone"><b class="pop">${R.e}</b><span>YUM!</span><div class="cookBtns"><button class="slab snap">📸</button><button class="slab again">↺</button></div></div>`; confettiDOM(g, 40); SFX.chime(); H.happy(); g.star(5); PROG.cooked = (PROG.cooked || 0) + 1; saveProg(); if (PROG.cooked >= 3) secret('chef');
    $('.again', box).addEventListener('click', pickScreen);
    $('.snap', box).addEventListener('click', async () => { const v = mk('video'); v.muted = true; v.playsInline = true; const s = await openCam(g, v); if (!s) return; await sleep(600); const c = document.createElement('canvas'); c.width = 480; c.height = 360; const cx = c.getContext('2d'); cx.translate(480, 0); cx.scale(-1, 1); cx.drawImage(v, 0, 0, 480, 360); s.getTracks().forEach(t => t.stop()); await MEDIA.add('photo', { url: c.toDataURL('image/jpeg', .85), label: R.e }); SFX.crackle(); $('.snap', box).textContent = '✔'; }); }
  g.dispose(() => clearInterval(timer));
  pickScreen();
});

/* CODE — program Robo with arrow blocks to reach the star. Later: ×2 blocks and jumps */
const CODE_LV = [
  { max: 3, map: ['R.*'] },
  { max: 3, map: ['*', '.', '.', 'R'] },
  { max: 3, map: ['..*', 'R..'] },
  { max: 4, map: ['...', 'R#*'] },
  { max: 5, map: ['..#*', '..#.', 'R...'] },
  { max: 3, x2: 1, map: ['R....*'] },
  { max: 4, x2: 1, map: ['....*', '.....', '.....', 'R....'] },
  { max: 6, x2: 1, map: ['*#...', '.#.#.', '...#R'] },
  { max: 3, jump: 1, map: ['R#*'] },
  { max: 5, jump: 1, x2: 1, map: ['R..#..*'] },
  { max: 6, jump: 1, x2: 1, map: ['*....', '###.#', '.....', 'R.#..'] },
  { max: 7, jump: 1, x2: 1, map: ['R.#....', '#.#.##.', '..#..#*'] }
];
game('code', 'learn', '🧑‍💻', g => {
  const H = g.host('robo'); let lv = null, prog = [], busy = false, me = { x: 0, y: 0, d: 1 }, goal = {}, dirLast = 1;
  g.stage.innerHTML = `<div class="code"><div class="cBoard"></div><div class="cSide"><div class="cProg"></div><div class="cPal"></div><div class="cRun"></div></div></div>`;
  const board = $('.cBoard', g.stage), progEl = $('.cProg', g.stage), pal = $('.cPal', g.stage), run = $('.cRun', g.stage);
  const DIRS = { '⬆': [0, -1], '➡': [1, 0], '⬇': [0, 1], '⬅': [-1, 0] };
  function setup(i) {
    lv = CODE_LV[i - 1]; prog = []; busy = false; const m = lv.map, rows = m.length, cols = m[0].length;
    board.style.setProperty('--cols', cols); board.style.setProperty('--rows', rows); board.innerHTML = '';
    m.forEach((row, y) => [...row].forEach((ch, x) => { const c = mk('div', 'cCell' + (ch === '#' ? ' rock' : ''), ch === '#' ? '🪨' : ch === '*' ? '⭐' : ''); board.appendChild(c); if (ch === 'R') { me = { x, y, x0: x, y0: y }; } if (ch === '*') goal = { x, y }; }));
    const bot = mk('div', 'cBot', charHTML('robo')); board.appendChild(bot); place();
    pal.innerHTML = ''; [...Object.keys(DIRS), ...(lv.x2 ? ['×2'] : []), ...(lv.jump ? ['🦘'] : [])].forEach(k => { const b = mk('button', 'cBlock' + (k === '×2' ? ' x2' : k === '🦘' ? ' jump' : ''), k); b.addEventListener('click', () => add(k)); pal.appendChild(b); });
    run.innerHTML = ''; const go = mk('button', 'slab cGo', '▶'); go.addEventListener('click', exec); const clr = mk('button', 'slab', '↺'); clr.addEventListener('click', () => { if (busy) return; prog = []; renderProg(); reset(); }); run.append(clr, go);
    renderProg(); H.say('', 'talk', lang, 0, CARD.wrap('<b class="ce">🤖</b><b class="ce sm">→</b><b class="ce">⭐</b>'));
  }
  const place = () => { const b = $('.cBot', board), m = lv.map; b.style.left = (me.x + .5) / m[0].length * 100 + '%'; b.style.top = (me.y + .5) / m.length * 100 + '%'; };
  const reset = () => { me.x = me.x0; me.y = me.y0; place(); $$('.cCell', board).forEach(c => c.classList.remove('trail')); };
  function add(k) { if (busy) return; if (k === '×2') { const last = prog[prog.length - 1]; if (!last) return retrigger(progEl, 'shake'); last.n = Math.min(8, last.n * 2); } else { if (prog.length >= lv.max) { retrigger(progEl, 'shake'); SFX.bad(); return; } prog.push({ k, n: 1 }); } tone(PENTA[prog.length + 2], .1, 'triangle', .14); renderProg(); }
  function renderProg() { progEl.innerHTML = ''; for (let i = 0; i < lv.max; i++) { const p = prog[i], b = mk('button', 'cSlot' + (p ? ' on' : ''), p ? `${p.k}${p.n > 1 ? `<i>×${p.n}</i>` : ''}` : ''); if (p) b.addEventListener('click', () => { if (busy) return; prog.splice(i, 1); renderProg(); }); progEl.appendChild(b); } }
  async function exec() {
    if (busy || !prog.length) return; busy = true; reset(); dirLast = 1; const steps = []; prog.forEach((p, i) => { for (let k = 0; k < p.n; k++) steps.push([p.k, i]); });
    const m = lv.map, free = (x, y) => y >= 0 && x >= 0 && y < m.length && x < m[0].length && m[y][x] !== '#';
    for (const [k, pi] of steps) {
      $$('.cSlot', progEl).forEach((s, i) => s.classList.toggle('run', i === pi)); await sleep(380); if (!g.alive()) return;
      let [dx, dy] = k === '🦘' ? DIRS[Object.keys(DIRS)[dirLast]] : DIRS[k]; if (k !== '🦘') dirLast = Object.keys(DIRS).indexOf(k);
      const n = k === '🦘' ? 2 : 1, nx = me.x + dx * n, ny = me.y + dy * n;
      if (!free(nx, ny)) { SFX.bump(); moodFn($('.cBot .char', board), 'oops'); H.mood('oops'); retrigger($('.cBot', board), 'shake'); await sleep(700); reset(); busy = false; $$('.cSlot', progEl).forEach(s => s.classList.remove('run')); return; }
      if (k === '🦘') { SFX.jump(); $('.cBot', board).classList.add('hop2'); setTimeout(() => $('.cBot', board) && $('.cBot', board).classList.remove('hop2'), 400); } else tone(440 + steps.indexOf(k) * 20, .08, 'square', .05);
      board.children[me.y * m[0].length + me.x].classList.add('trail'); me.x = nx; me.y = ny; place();
      if (me.x === goal.x && me.y === goal.y) break;
    }
    await sleep(400); $$('.cSlot', progEl).forEach(s => s.classList.remove('run'));
    if (me.x === goal.x && me.y === goal.y) { SFX.chime(); H.happy(); g.star(prog.length <= lv.max ? 3 : 1); confettiDOM(g, 25); g.after(1300, () => { busy = false; if (g.progress()) g.levelUp(); }); }
    else { H.mood('oops'); tone(250, .2, 'triangle', .1); await sleep(600); reset(); busy = false; }
  }
  g.levels(CODE_LV.length, i => { g.meter(1); setup(i); });
});

/* BABY HELPER — how to help a baby: gentle hands, what does baby need, quiet time, helper jobs */
const NEEDS = [{ show: '😢🍼', ok: '🍼', no: ['🥁', '⚽'] }, { show: '😪', ok: '🎵', no: ['📯', '🚗'] }, { show: '🥶', ok: '🧣', no: ['🍦', '💧'] }, { show: '😢💩', ok: '👨', no: ['🧸', '🍪'] }, { show: '😢', ok: '🤗', no: ['📯', '🥁'] }, { show: '🥱🧸', ok: '🧸', no: ['🔨', '🎺'] }];
game('helper', 'me', '🫶', g => {
  const H = g.host('hoot'), nm = (cfg.profile.baby || '').toUpperCase(); let busy = false;
  g.stage.innerHTML = `<div class="helper"><div class="hTop"></div><div class="hBaby">${charHTML('baby', 'big')}<span class="hName">${nm || '👶'}</span></div><div class="hFx"></div><div class="hRow"></div></div>`;
  const top = $('.hTop', g.stage), baby = $('.hBaby', g.stage), el = $('.char', baby), row = $('.hRow', g.stage), fx = $('.hFx', g.stage);
  const float = (e, n = 4) => { for (let i = 0; i < n; i++) { const s = mk('span', 'floaty', e); s.style.left = rand(35, 65) + '%'; s.style.animationDelay = i * .12 + 's'; fx.appendChild(s); setTimeout(() => s.remove(), 1800); } };
  const giggle = () => [880, 988, 1175, 988].forEach((f, i) => tone(f, .1, 'sine', .08, i * .09)), cry = () => [520, 480, 520, 450].forEach((f, i) => tone(f, .2, 'triangle', .05, i * .22));
  const win = () => { busy = true; mood(el, 'happy', 1600); giggle(); float('❤️', 5); SFX.good(); H.happy(); g.star(1); g.after(1500, () => { busy = false; if (g.progress()) { if (g.lvl() === 4) secret('bighelper'); g.levelUp(); } else round(); }); };
  let gentle = 0, last = null;
  function round() {
    row.innerHTML = ''; top.innerHTML = ''; const lv = g.lvl(); baby.classList.remove('sleeping'); el._mood = null; el._moodUntil = 0;
    if (lv === 1) { top.innerHTML = '<span class="hCard">🤲 ✨</span>'; H.say('Gentle hands. Pet the baby softly.', 'talk', 'en', 0, CARD.wrap('<b class="ce">🤲</b>', '🐢')); gentle = 0; }
    else if (lv === 2) { const n = pick(NEEDS); top.innerHTML = `<span class="hCard think">${n.show}</span>`; mood(el, 'oops', 1500); cry(); shuffle([n.ok, ...n.no]).forEach(c => { const b = mk('button', 'slab hOpt', c); b.addEventListener('click', () => { if (busy) return; if (c === n.ok) { if (c === '👨') float('👨', 2); win(); } else { retrigger(b, 'shake'); SFX.bad(); H.mood('oops'); cry(); } }); row.appendChild(b); }); }
    else if (lv === 3) { baby.classList.add('sleeping'); el._mood = 'sleep'; el._moodUntil = 1e15; el.innerHTML = spriteSVG('baby', 'sleep'); top.innerHTML = '<span class="hCard">😴 🤫</span>'; const quiet = pick([['📚', '🧩', '🖍️'], ['🧸', '📚', '🧩']]), loud = shuffle(['🥁', '📯', '🎺', '🔔']).slice(0, 2); shuffle([pick(quiet), ...loud]).forEach(c => { const b = mk('button', 'slab hOpt', c); b.addEventListener('click', () => { if (busy) return; if (!loud.includes(c)) { busy = true; tone(392, .4, 'sine', .05); float('💤', 3); SFX.good(); H.happy(); g.star(1); g.after(1500, () => { busy = false; if (g.progress()) g.levelUp(); else round(); }); } else { ({ '🥁': () => DRUM.tom(), '📯': () => SFX.honk(), '🎺': () => tone(466, .4, 'sawtooth', .06), '🔔': () => DRUM.bell(1047) })[c](); el._mood = 'oops'; el._moodUntil = performance.now() + 1500; cry(); H.mood('oops'); setTimeout(() => { if (g.alive() && g.lvl() === 3) { el._mood = 'sleep'; el._moodUntil = 1e15; } }, 1500); } }); row.appendChild(b); }); }
    else { const items = ['🧷', '🧣', '🧸', '🍼', '🧦', '📕'], want = pick(items); top.innerHTML = `<span class="hCard">👉 ${want}</span>`; H.say('', 'talk', lang, 0, CARD.emoji(want, '❓')); shuffle(items).forEach(c => { const b = mk('button', 'slab hOpt sm', c); b.addEventListener('click', () => { if (busy) return; if (c === want) { b.classList.add('right'); win(); } else { retrigger(b, 'shake'); SFX.bad(); } }); row.appendChild(b); }); }
  }
  g.on(baby, 'pointerdown', e => { last = { x: e.clientX, y: e.clientY, t: performance.now() }; if (g.lvl() === 1 && !busy) { try { baby.setPointerCapture(e.pointerId); } catch (_) {} } });
  g.on(baby, 'pointermove', e => {
    if (!last || g.lvl() !== 1 || busy) return; const now = performance.now(), d = Math.hypot(e.clientX - last.x, e.clientY - last.y), sp = d / Math.max(1, now - last.t); last = { x: e.clientX, y: e.clientY, t: now };
    if (sp > 2.2) { gentle = Math.max(0, gentle - 40); if (!el._mood || el._mood !== 'oops') { mood(el, 'oops', 900); cry(); top.innerHTML = '<span class="hCard">🐢 🤲</span>'; } }
    else { gentle += d; if (Math.random() < .08) { float('✨', 1); tone(PENTA[randi(5, 9)], .15, 'sine', .05); } if (gentle > 1400) { gentle = 0; win(); } }
  });
  ['pointerup', 'pointercancel'].forEach(ev => g.on(baby, ev, () => { last = null; }));
  g.on(baby, 'click', () => { if (g.lvl() === 1 && !busy && !last) { mood(el, 'oops', 700); } });
  g.levels(4, () => { g.meter(4); round(); });
});
