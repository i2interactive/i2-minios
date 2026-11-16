/* ═════════ BRANDING (white-label) + BACKGROUND MUSIC + HIDDEN APPS ═════════ */
GBY.hockey.mash = true;
const BRAND = () => cfg.brand;
const isHidden = id => (cfg.hidden || []).includes(id);
const CAST_DEF = { robo: 'Robo', dino: 'Dino', hoot: 'Hoot', foxy: 'Foxy' };
const castName = n => ((cfg.brand.cast || {})[n] || '').trim() || CAST_DEF[n] || n;
const castSwap = s => String(s).replace(/\b(Robo|Dino|Hoot|Foxy)\b/g, m => castName(m.toLowerCase()));
const THEME_PRESETS = {
  teletext: null,
  pastel: { green: '#7fd8a8', blue: '#8fa8ff', red: '#ff9a9a', yellow: '#ffe08a', white: '#fff7f0' },
  ocean: { green: '#2ec4b6', blue: '#3a86ff', red: '#ff6b6b', yellow: '#ffd166', white: '#eaf6ff' },
  candy: { green: '#00f5d4', blue: '#9b5de5', red: '#ff5da2', yellow: '#fee440', white: '#fff0fa' },
  forest: { green: '#6ab04c', blue: '#4a90a4', red: '#e17055', yellow: '#f9ca24', white: '#f4f1e8' },
  mono: { green: '#d0d0d0', blue: '#9a9a9a', red: '#ffffff', yellow: '#e6e6e6', white: '#f2f2f2' }
};
/* ── the i2 miniOS wordmark: i2 interactive's big dot-matrix "i2" with "miniOS" in small dots underneath ──
   drawn as dots (SVG or canvas), so it needs no extra font */
const DOT_GLYPHS = {
  I2: ['.X.', '...', 'XX.', '.X.', '.X.', '.X.', 'XXX'],
  2: ['.XXX.', 'X...X', '....X', '...X.', '..X..', '.X...', 'XXXXX'],
  m: ['.....', '.....', 'XX.X.', 'X.X.X', 'X.X.X', 'X.X.X', 'X.X.X'],
  n: ['.....', '.....', 'XXXX.', 'X...X', 'X...X', 'X...X', 'X...X'],
  i: ['..X..', '.....', '.XX..', '..X..', '..X..', '..X..', '.XXX.'],
  O: ['.XXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
  S: ['.XXXX', 'X....', 'X....', '.XXX.', '....X', '....X', 'XXXX.']
};
/* dots in mark units: the big "i2" is 10 × 7; the word sits one unit below and spans the same width */
function i2MarkDots(word = 'miniOS') {
  const big = [], small = []; let x0 = 0;
  [['I2', 0], ['2', 5]].forEach(([g, ox]) => DOT_GLYPHS[g].forEach((row, y) => [...row].forEach((c, x) => { if (c === 'X') big.push({ x: ox + x + .5, y: y + .5, r: .44 }); })));
  const glyphs = [...word].map(ch => DOT_GLYPHS[ch]).filter(Boolean), cols = glyphs.length * 6 - 1, s = cols ? 10 / cols : 0;
  glyphs.forEach((gl, i) => gl.forEach((row, y) => [...row].forEach((c, x) => { if (c === 'X') small.push({ x: (i * 6 + x + .5) * s, y: 8 + (y + .5) * s, r: .42 * s }); })));
  return { big, small, w: 10, h: glyphs.length ? 8 + 7 * s : 7 };
}
function i2MarkSVG(o = {}) {
  const d = i2MarkDots(o.word ?? 'miniOS'), c = (a, f) => a.map(p => `<circle cx="${p.x.toFixed(3)}" cy="${p.y.toFixed(3)}" r="${p.r.toFixed(3)}" fill="${f}"/>`).join('');
  return `<svg class="i2mark ${o.cls || ''}" viewBox="-.2 -.2 ${d.w + .4} ${(d.h + .4).toFixed(3)}" role="img" aria-label="i2 miniOS">${c(d.big, o.c1 || 'currentColor')}${c(d.small, o.c2 || 'var(--tt-yellow)')}</svg>`;
}
function i2MarkCanvas(x, X, Y, wpx, o = {}) {   // (X, Y) = top-left; returns height drawn
  const d = i2MarkDots(o.word ?? 'miniOS'), k = wpx / d.w;
  [[d.big, o.c1 || '#fff'], [d.small, o.c2 || TT.yellow]].forEach(([a, f]) => { x.fillStyle = f; a.forEach(p => { x.beginPath(); x.arc(X + p.x * k, Y + p.y * k, p.r * k, 0, Math.PI * 2); x.fill(); }); });
  return d.h * k;
}
const isStockBrand = () => !BRAND().logo && (BRAND().osName || MINIOS.name).trim() === MINIOS.name;
/* the OS name as it should be printed: the stock name keeps its lowercase "i2", a family's own name goes teletext-uppercase */
const osTitle = () => { const n = (BRAND().osName || MINIOS.name).trim(); return n === MINIOS.name ? n : n.toUpperCase(); };

/* greetings: "{name}" is filled from Grown-Ups → About the child; with no name set the plain greeting is used */
const HI0 = {}, HIA = {}, CH0 = {};
LANG6.forEach(k => { if (L[k]) { HI0[k] = L[k].hi; HIA[k] = L[k].hiAnon || L[k].hi.replace(/\s*\{name\}/, ''); CH0[k] = { ...L[k].castHi }; } });
function applyBrand() {
  const b = BRAND(), nm = KID_NAME();
  document.title = (b.osName || MINIOS.name).trim();
  LANG6.forEach(k => { if (!L[k]) return; L[k].hi = nm ? HI0[k].replace('{name}', nm) : HIA[k]; Object.keys(CH0[k]).forEach(n => L[k].castHi[n] = castSwap(CH0[k][n])); });
  const logo = $('.boot-logo');
  if (logo) { if (b.logo) logo.innerHTML = `<img src="${b.logo}" alt="">`; else if (isStockBrand()) logo.innerHTML = i2MarkSVG(); else logo.textContent = osTitle(); logo.classList.toggle('mark', isStockBrand()); }
  /* the Start button reads "miniOS" (or the family's own short name), in every language and theme */
  const sb = $('#startBtn .sbName'); if (sb) { const t = (b.short || MINIOS.short).trim(); sb.textContent = t; sb.parentElement.setAttribute('aria-label', t); sb.classList.toggle('long', t.length > 6); }
  const h2 = $('.smTop h2'); if (h2) h2.textContent = osTitle();
  const root = document.documentElement.style, pre = THEME_PRESETS[b.theme];
  ['green', 'blue', 'red', 'yellow', 'white'].forEach(c => pre ? root.setProperty('--tt-' + c, pre[c]) : root.removeProperty('--tt-' + c));
}
function escHTML(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

/* ── background music: grown-ups upload tracks; plays on the home screen (or everywhere), ducks under voices ── */
const NO_BGM = new Set(['piano', 'drums', 'rhythm', 'beats', 'copy', 'band', 'sing', 'musicmaker', 'disco', 'video', 'keyparty', 'bedtime', 'tv', 'talk', 'sayit', 'showme', 'myapps', 'draw', 'story']);
const BGM = { el: new Audio(), list: [], i: -1, started: false };
BGM.el.addEventListener('ended', () => bgmNext());
async function bgmLoad() {
  BGM.list.forEach(t => URL.revokeObjectURL(t.url));
  BGM.list = (await IDB.all('kv')).filter(([k, v]) => String(k).startsWith('bgm:') && v && v.blob).map(([k, v]) => ({ k, name: v.name, url: URL.createObjectURL(v.blob) }));
  if (cfg.bgm.builtin !== false && typeof BGM_BUILTIN !== 'undefined') BGM_BUILTIN.forEach((t, i) => { try { const b = atob(t.d), u = new Uint8Array(b.length); for (let j = 0; j < b.length; j++) u[j] = b.charCodeAt(j); BGM.list.push({ k: 'builtin:' + i, name: t.name, url: URL.createObjectURL(new Blob([u], { type: 'audio/mpeg' })), builtin: 1 }); } catch (e) {} });
  BGM.i = -1; BGM.el.removeAttribute('src'); const tb = $('#tbMusic'); if (tb) tb.style.display = BGM.list.length ? '' : 'none';
}
function bgmNext() { if (!BGM.list.length) return; BGM.i = cfg.bgm.shuffle && BGM.list.length > 2 ? (BGM.i + randi(1, BGM.list.length - 1)) % BGM.list.length : (BGM.i + 1) % BGM.list.length; BGM.el.src = BGM.list[BGM.i].url; BGM.el.play().catch(() => {}); }
function bgmWanted(view) {
  if (!cfg.bgm.on || !BGM.list.length || !BGM.started || document.hidden) return 0;
  if ($('#lock') && $('#lock').classList.contains('show')) return 0;
  if (view === 'desk') return cfg.bgm.vol;
  return cfg.bgm.where === 'all' && !NO_BGM.has(view) ? cfg.bgm.vol * .55 : 0;
}
function bgmTick(view) {
  let want = bgmWanted(view); if (document.body.classList.contains('talking')) want *= .25; const el = BGM.el;
  if (want > 0 && el.paused) { if (!el.src) bgmNext(); else el.play().catch(() => {}); }
  el.volume = clamp(el.volume + clamp(want - el.volume, -.03, .03), 0, 1);
  if (want === 0 && el.volume < .02 && !el.paused) el.pause();
}
bgmLoad();
applyBrand();

/* ── grown-up panel: branding, per-character voices, background music, app list ── */
function renderBrandGP() {
  const b = BRAND(); $('#br_osName').value = b.osName || ''; $('#br_short').value = b.short || ''; $('#br_theme').value = b.theme || 'teletext';
  CAST_IDS.forEach(n => $('#br_cast_' + n).value = (b.cast || {})[n] || ''); $('#pf_kidWord').value = cfg.profile.kidWord || 'child';
  $('#gpElevenModel').value = cfg.tts.elevenModel || 'eleven_flash_v2_5';
  const cv = $('#gpCharVoices'); cv.innerHTML = '';
  TTS_WHO.forEach(w => { const row = mk('div', 'cvRow', `<span class="cvWho">${w === 'narrator' ? '<b>📖</b>' : charHTML(w)}<i>${w === 'narrator' ? 'NARRATOR' : castName(w).toUpperCase()}</i></span><input class="cvEl" placeholder="ElevenLabs voice ID"><select class="cvOai">${OAI_VOICES.map(v => `<option>${v}</option>`).join('')}</select><button class="gpBtn cvTest">▶</button>`);
    $('.cvEl', row).value = (cfg.tts.elevenVoices || {})[w] || ''; $('.cvOai', row).value = oaiVoice(w);
    [$('.cvEl', row), $('.cvOai', row)].forEach(el => el.addEventListener('change', () => { cfg.tts.elevenVoices = { ...(cfg.tts.elevenVoices || {}), [w]: $('.cvEl', row).value.trim() }; cfg.tts.openaiVoices = { ...(cfg.tts.openaiVoices || {}), [w]: $('.cvOai', row).value }; saveCfg(); }));
    $('.cvTest', row).addEventListener('click', () => { const line = w === 'narrator' ? 'Once upon a time, there was a happy little star.' : castSwap(L.en.castHi[w] || 'Hi!'); $('#gpTtsStatus').textContent = ttsReady() ? 'Asking the cloud voice…' : 'Pick OpenAI or ElevenLabs above and add a key to hear cloud voices.'; say(line, 'en', () => { $('#gpTtsStatus').textContent += ' ✔'; }, w === 'narrator' ? null : w, null, true); });
    cv.appendChild(row); });
  $$('#gpBgmOn button').forEach(x => x.classList.toggle('on', (x.dataset.v === '1') === !!cfg.bgm.on)); $$('#gpBgmWhere button').forEach(x => x.classList.toggle('on', x.dataset.v === cfg.bgm.where));
  $('#gpBgmVol').value = cfg.bgm.vol; $('#gpBgmShuffle').checked = !!cfg.bgm.shuffle; if ($('#gpBgmBuiltin')) $('#gpBgmBuiltin').checked = cfg.bgm.builtin !== false; renderBgmList();
  const ap = $('#gpApps'); ap.innerHTML = '';
  GAMES.forEach(gm => { const l = mk('label', 'appChk', `<input type="checkbox"> ${gm.icon} ${gname(gm.id)}`); const c = $('input', l); c.checked = !isHidden(gm.id); c.addEventListener('change', () => { const h = new Set(cfg.hidden || []); c.checked ? h.delete(gm.id) : h.add(gm.id); cfg.hidden = [...h]; saveCfg(); }); ap.appendChild(l); });
}
function readBrandGP() {
  const b = cfg.brand; b.osName = $('#br_osName').value.trim() || MINIOS.name; b.short = $('#br_short').value.trim() || MINIOS.short; b.theme = $('#br_theme').value;
  b.cast = Object.fromEntries(CAST_IDS.map(n => [n, $('#br_cast_' + n).value.trim()])); cfg.profile.kidWord = $('#pf_kidWord').value;
  cfg.tts.elevenModel = $('#gpElevenModel').value; cfg.bgm.vol = +$('#gpBgmVol').value; cfg.bgm.shuffle = $('#gpBgmShuffle').checked;
  applyBrand();
}
async function renderBgmList() {
  const box = $('#gpBgmList'); box.innerHTML = ''; const rows = (await IDB.all('kv')).filter(([k]) => String(k).startsWith('bgm:'));
  if (!rows.length) box.innerHTML = '<p>No music yet.</p>';
  rows.forEach(([k, v]) => { const d = mk('div', 'ph', `<span class="bgmName"></span><button class="gpBtn play">▶</button><button class="gpBtn del">✖</button>`); $('.bgmName', d).textContent = '🎵 ' + v.name;
    $('.play', d).addEventListener('click', () => { const t = BGM.list.find(x => x.k === k); if (t) { BGM.i = BGM.list.indexOf(t) - 1; bgmNext(); } });
    $('.del', d).addEventListener('click', async () => { await IDB.del('kv', k); await bgmLoad(); renderBgmList(); }); box.appendChild(d); });
}
$$('#gpBgmOn button').forEach(x => x.addEventListener('click', () => { cfg.bgm.on = x.dataset.v === '1'; saveCfg(); $$('#gpBgmOn button').forEach(y => y.classList.toggle('on', y === x)); }));
$$('#gpBgmWhere button').forEach(x => x.addEventListener('click', () => { cfg.bgm.where = x.dataset.v; saveCfg(); $$('#gpBgmWhere button').forEach(y => y.classList.toggle('on', y === x)); }));
if ($('#gpBgmBuiltin')) $('#gpBgmBuiltin').addEventListener('change', async () => { cfg.bgm.builtin = $('#gpBgmBuiltin').checked; saveCfg(); await bgmLoad(); });
/* download this computer as one offline file (only when served from a website) */
const OFFLINE_OK = /^https?:$/.test(location.protocol);
async function minisaveOffline(st) {
  try { if (st) st.textContent = 'Preparing the offline file…'; const r = await fetch(location.pathname, { cache: 'force-cache' }); if (!r.ok) throw new Error(r.status);
    downloadURL(URL.createObjectURL(await r.blob()), 'i2minios.html'); if (st) st.textContent = '✔ Saved i2minios.html — open it in Chrome or Edge on any computer, no internet needed.'; }
  catch (e) { if (st) st.textContent = '✖ Could not download: ' + e.message; }
}
if ($('#gpOffline')) { $('#gpOfflineRow').hidden = !OFFLINE_OK; $('#gpOffline').addEventListener('click', () => minisaveOffline($('#gpOfflineStatus'))); }
if (OFFLINE_OK && /^#download/.test(location.hash)) { history.replaceState(null, '', location.pathname + location.search); setTimeout(() => minisaveOffline(null), 600); }
$('#gpBgmVol').addEventListener('input', () => { cfg.bgm.vol = +$('#gpBgmVol').value; saveCfg(); });
$('#gpBgmFiles').addEventListener('change', async e => { for (const f of e.target.files) await IDB.set('kv', 'bgm:' + Date.now().toString(36) + randi(10, 99), { name: f.name.replace(/\.[^.]+$/, ''), blob: f }); e.target.value = ''; await bgmLoad(); renderBgmList(); });
$('#br_logo').addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; const im = await loadImg(await blobToDataURL(f)).catch(() => null); if (!im) return; cfg.brand.logo = shrinkCanvas(im, 600, 'image/png'); saveCfg(); applyBrand(); e.target.value = ''; });
$('#br_logoClear').addEventListener('click', () => { cfg.brand.logo = ''; saveCfg(); applyBrand(); });
$('#gpTtsClear').addEventListener('click', async () => { await IDB.clear('tts'); $('#gpTtsStatus').textContent = '✔ Saved voice lines cleared. They will be fetched again with the new voices.'; });
$('#br_export').addEventListener('click', () => { const pack = { i2miniosBrand: 1, brand: cfg.brand, hidden: cfg.hidden || [], bgm: { ...cfg.bgm }, voiceMode: cfg.voiceMode, lang2: cfg.lang2, tts: { provider: cfg.tts.provider, elevenModel: cfg.tts.elevenModel, elevenVoices: cfg.tts.elevenVoices, openaiVoices: cfg.tts.openaiVoices } }; downloadURL(URL.createObjectURL(new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' })), `${(cfg.brand.short || MINIOS.short).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brand-pack.json`); });
$('#br_import').addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; try { const j = JSON.parse(await f.text()); if (!j.i2miniosBrand && !j[KEYS.legacyBrandPack]) throw new Error('not a brand pack'); cfg.brand = { ...cfg.brand, ...j.brand }; if (j.hidden) cfg.hidden = j.hidden; if (j.bgm) cfg.bgm = { ...cfg.bgm, ...j.bgm }; if (j.voiceMode) cfg.voiceMode = j.voiceMode; if (j.lang2) cfg.lang2 = j.lang2; if (j.tts) cfg.tts = { ...cfg.tts, ...j.tts }; saveCfg(); applyBrand(); renderBrandGP(); } catch (err) { $('#gpBackupStatus').textContent = '✖ ' + err.message; } e.target.value = ''; });
