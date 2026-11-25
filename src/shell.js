/* ═════════ i2 miniOS — desktop, taskbar, start menu, windows, grown-ups ═════════ */
const CATS = [
  { id: 'play', c: TT.green, ink: '#000', pg: 200, icon: '🕹️' },
  { id: 'learn', c: TT.blue, ink: TT.white, pg: 300, icon: '🔤' },
  { id: '3d', c: TT.red, ink: '#000', pg: 400, icon: '🧊' },
  { id: 'music', c: TT.yellow, ink: '#000', pg: 500, icon: '🥁' },
  { id: 'make', c: TT.pink, ink: '#000', pg: 600, icon: '🎨' },
  { id: 'robo', c: TT.white, ink: '#000', pg: 700, icon: '🤖' },
  { id: 'me', c: TT.purple, ink: TT.white, pg: 800, icon: '🌟' }
];
const CBY = Object.fromEntries(CATS.map(c => [c.id, c]));
CATS.forEach(c => GAMES.filter(gm => gm.cat === c.id).forEach((gm, i) => gm.pg = c.pg + i + 1));
const DEFAULT_FAVS = ['runner', 'talk', 'blocks', 'count', 'piano', 'draw'];
const V5_NEW = ['zoo', 'garage', 'hide', 'band', 'sing', 'lab', 'puzzles', 'kitchen', 'colorhunt', 'mirror', 'town', 'duo', 'stickermaker', 'who', 'map', 'stickers', 'closet', 'mailbox', 'pet', 'baby', 'tv', 'bedtime', 'myapps'];
let view = 'desk', gctx = null, startCat = 'play';
const moodFn = mood;
const gname = id => T().games[id] || id;

/* ── first run on v5: keep everything a returning player already had ── */
if (!PROG.v5) {
  PROG.v5 = 1; const veteran = PROG.stars > 0 || Object.keys(PROG.plays || {}).length > 0;
  if (veteran) LANDS.slice(0, 6).forEach(l => { if (!PROG.lands.includes(l.id)) PROG.lands.push(l.id); });
  checkLands(); PROG.newApps = V5_NEW.filter(id => GBY[id] && appUnlocked(id) && !['map', 'stickers', 'closet', 'mailbox', 'pet'].includes(id)).slice(0, 8); saveProg();
}
/* ── v6: bigger star + day requirements; keep only worlds the child really plays in ── */
const V6_NEW = ['bowling', 'basketball', 'darts', 'soccer', 'minigolf', 'flush', 'kart', 'snowboard', 'musicmaker', 'video', 'cook', 'code', 'helper', 'keyparty'];
if (!PROG.v6) {
  PROG.v6 = 1; const keep = LANDS.filter(l => !l.secrets && l.apps.some(a => (PROG.plays[a] || 0) >= 5)).map(l => l.id);
  PROG.lands = [...new Set(['home', ...keep])]; checkLands(); PROG.newApps = V6_NEW.filter(id => GBY[id] && appUnlocked(id)); saveProg();
}
/* ── v8: new games sit wherever their world is ── */
const V8_NEW = ['skate', 'gallery', 'blaster', 'mischief', 'foxhunt', 'golf2'];
if (!PROG.v8) { PROG.v8 = 1; PROG.newApps = [...new Set([...V8_NEW.filter(id => GBY[id] && appUnlocked(id)), ...PROG.newApps])]; saveProg(); }
/* ── v9: Splash Fleet joins Rainbow Castle; if that world is already open, flag it as new ── */
if (!PROG.v9) { PROG.v9 = 1; if (GBY.fleet && appUnlocked('fleet') && !PROG.newApps.includes('fleet')) PROG.newApps.unshift('fleet'); saveProg(); }
/* ── v10: Marble Run joins the Raceway; if that world is already open, flag it as new ── */
if (!PROG.v10) { PROG.v10 = 1; if (GBY.marble && appUnlocked('marble') && !PROG.newApps.includes('marble')) PROG.newApps.unshift('marble'); saveProg(); }
const dayRec = () => { const k = today(); return PROG.days[k] || (PROG.days[k] = { m: 0, s: 0, apps: {} }); };

function tick() {
  const d = new Date(), p = n => String(n).padStart(2, '0'); $$('.tt-clock').forEach(c => c.textContent = `${p(d.getHours())}:${p(d.getMinutes())}`); const big = $('#deskTime'); if (big) big.textContent = `${p(d.getHours())}:${p(d.getMinutes())}`;
  document.body.dataset.daypart = DAYPART(d);
}
tick(); setInterval(tick, 5000);
const favs = () => { const pl = Object.entries(PROG.plays || {}).sort((a, b) => b[1] - a[1]).map(x => x[0]).filter(id => GBY[id] && appUnlocked(id) && GBY[id].cat !== 'me' && !isHidden(id)); return [...new Set([...pl, ...DEFAULT_FAVS])]; };
function deskApps() {
  const fresh = PROG.newApps.filter(id => GBY[id] && appUnlocked(id)).slice(0, 2), wk = weekNo();
  const pool = GAMES.filter(gm => appUnlocked(gm.id) && gm.cat !== 'me' && !isHidden(gm.id) && !fresh.includes(gm.id)), feat = pool.length ? [pool[(wk * 7) % pool.length].id, pool[(wk * 7 + 11) % pool.length].id] : [];
  return [...new Set([...fresh, ...feat, ...favs()])].slice(0, calmDesk() ? 4 : 6);
}

/* ── taskbar ── */
function renderTaskbar() {
  const apps = $('#tbApps'); apps.innerHTML = '';
  (PROG.recent || []).filter(id => GBY[id]).slice(0, 5).forEach(id => { const b = mk('button', 'tbApp' + (view === id ? ' cur' : ''), GBY[id].icon); b.title = gname(id); b.style.setProperty('--c', CBY[GBY[id].cat].c); b.addEventListener('click', () => { SFX.tap(); openGame(id); }); apps.appendChild(b); });
  $('#tbBuddy').innerHTML = charHTML(PROG.buddy || 'robo');
  $$('.starCount').forEach(e => e.textContent = PROG.stars);
  $('#startBtn').classList.toggle('mail', mailWaiting());
  const lb = $('#langBtn');
  if (cfg.lang2 === 'none' || !L[cfg.lang2]) { lb.style.display = 'none'; lang = 'en'; } else { lb.style.display = 'flex'; lb.innerHTML = `<span class="${lang === 'en' ? 'on' : ''}">EN</span><span class="${lang !== 'en' ? 'on' : ''}">${cfg.lang2.toUpperCase()}</span>`; }
}
$('#langBtn').addEventListener('click', () => { lang = lang === 'en' ? cfg.lang2 : 'en'; SFX.tap(); say(T().hi); renderAll(); });
$('#tbMusic').addEventListener('click', () => { SFX.tap(); bgmNext(); });
$('#tbBuddy').addEventListener('click', () => { const n = PROG.buddy || 'robo'; moodFn($('#tbBuddy .char'), 'happy'); say(L[lang].castHi[n], lang, null, n, $('#tbBuddy .char')); });

/* ── start menu ── */
function renderStart() {
  const tabs = $('#smTabs'); tabs.innerHTML = '';
  CATS.forEach(c => { const nw = GAMES.some(gm => gm.cat === c.id && PROG.newApps.includes(gm.id) && appUnlocked(gm.id)); const b = mk('button', 'smTab' + (c.id === startCat ? ' cur' : '') + (nw ? ' hasNew' : ''), `<span class="e">${c.icon}</span><span>${T().cats[c.id]}</span>`); b.style.setProperty('--c', c.c); b.style.setProperty('--ink', c.ink); b.addEventListener('click', () => { SFX.tap(); startCat = c.id; renderStart(); }); tabs.appendChild(b); });
  const grid = $('#smGrid'); grid.innerHTML = ''; grid.style.setProperty('--c', CBY[startCat].c);
  GAMES.filter(gm => gm.cat === startCat && !isHidden(gm.id)).forEach(gm => {
    const st = PROG.games[gm.id], lock = !appUnlocked(gm.id), land = landOf(gm.id), isNew = PROG.newApps.includes(gm.id) && !lock;
    const lv = st && st.n > 1 ? `<i class="lv">${Array.from({ length: st.n }, (_, i) => `<b class="${i < st.max ? 'on' : ''}"></b>`).join('')}</i>` : '';
    const b = mk('button', 'smApp' + (lock ? ' locked' : '') + (isNew ? ' new' : ''), `<span class="ai">${lock ? '🔒' : gm.icon}</span><span class="an">${lock ? `${land.e} ★${land.stars}` : gname(gm.id)}</span>${lock ? '' : lv}`);
    b.addEventListener('click', () => { if (lock) { SFX.bad(); retrigger(b, 'shake'); return; } SFX.tap(); openGame(gm.id); }); grid.appendChild(b);
  });
  renderWidgets('#smWidgets'); grid.scrollTop = 0; requestAnimationFrame(smMoreCheck);
  $('#smUser').innerHTML = `${charHTML(PROG.buddy || 'robo')}<span class="un">${escHTML(kidName().toUpperCase())}</span><span class="us">★ <b class="starCount">${PROG.stars}</b></span>`;
  $('#smHead').textContent = `P${CBY[startCat].pg} · ${T().cats[startCat]}`;
}
function toggleStart(on) { const sm = $('#startMenu'); on = on ?? !sm.classList.contains('show'); if (on) { renderStart(); SFX.tap(); } sm.classList.toggle('show', on); $('#startBtn').classList.toggle('on', on); }
const closeStart = () => toggleStart(false);
$('#startBtn').addEventListener('click', () => toggleStart());
$('#scrim').addEventListener('click', closeStart);
function holdButton(el, ms, fn) { let t = null; el.addEventListener('pointerdown', () => { el.classList.add('holding'); t = setTimeout(() => { el.classList.remove('holding'); fn(); }, ms); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => el.addEventListener(ev, () => { clearTimeout(t); el.classList.remove('holding'); })); }
/* grown-up gate: long-press Hoot on the desktop (a ring fills after 0.8 s; the boot screen tells grown-ups how), then a times-table question */
function grownUpGate(onPass) {
  const o = $('#gate'), a = randi(6, 9), b = randi(6, 9); let typed = '', t = null;
  const close = () => { o.classList.remove('show'); clearTimeout(t); };
  $('.gateQ', o).textContent = `${a} × ${b} = ?`; $('.gateA', o).textContent = '';
  const keys = $('.gateKeys', o); keys.innerHTML = '';
  [...'789456123', '✖', '0', 'OK'].forEach(k => { const btn = mk('button', k === 'OK' ? 'ok' : '', k); btn.addEventListener('click', () => {
    if (k === '✖') { close(); return; }
    if (k === 'OK') { if (+typed === a * b) { close(); onPass(); } else { retrigger($('.gateBox', o), 'shake'); SFX.bad(); setTimeout(close, 450); } return; }
    if (typed.length < 3) { typed += k; $('.gateA', o).textContent = typed; } }); keys.appendChild(btn); });
  o.onclick = e => { if (e.target === o) close(); };
  o.classList.add('show'); t = setTimeout(close, 20000);
}
function secretHold(el, ms, fn) {
  let t = null, raf = 0, t0 = 0; el._skipClick = false;
  // Nov 25: after 0.8 s a ring starts filling round the button (no cue before that, so a quick tap stays a plain tap)
  const stop = () => { clearTimeout(t); cancelAnimationFrame(raf); el.classList.remove('holding'); el.style.removeProperty('--hp'); };
  const ring = () => { const p = (performance.now() - t0 - 800) / (ms - 800); if (p > 0) { el.classList.add('holding'); el.style.setProperty('--hp', Math.min(1, p).toFixed(3)); } if (p < 1) raf = requestAnimationFrame(ring); };
  el.addEventListener('pointerdown', () => { stop(); t0 = performance.now(); raf = requestAnimationFrame(ring); t = setTimeout(() => { stop(); el._skipClick = true; fn(); }, ms); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => el.addEventListener(ev, stop));
  el.addEventListener('click', e => { if (el._skipClick) { el._skipClick = false; e.stopImmediatePropagation(); } }, true);
}

/* ── desktop ── */
let DESKFX = null;
/* calm home screen (default): clock, a few favourite apps and the friends. Mail, map, pet and stickers live in the Start menu */
const calmDesk = () => (cfg.deskStyle || 'calm') === 'calm';
function applyDeskStyle() { document.body.classList.toggle('calm', calmDesk()); }
applyDeskStyle();
function renderDesk() {
  const ic = $('#deskIcons'); ic.innerHTML = '';
  deskApps().forEach(id => { const gm = GBY[id], b = mk('button', 'dIcon' + (PROG.newApps.includes(id) ? ' new' : ''), `<span class="ai">${gm.icon}</span><span class="an">${gname(id)}</span>`); b.style.setProperty('--c', CBY[gm.cat].c); b.addEventListener('click', () => { SFX.tap(); openGame(id); }); ic.appendChild(b); });
  const cast = $('#cast'); cast.innerHTML = '';
  CAST_IDS.forEach(n => { const b = mk('button', 'castMember' + (n === PROG.buddy ? ' buddy' : ''), charHTML(n) + `<span>${castName(n).toUpperCase()}</span>`); if (n === 'hoot') secretHold(b, 3000, () => grownUpGate(openGP));
    b.addEventListener('click', () => { castSeq(n); PROG.buddy = n; saveProg(); $$('.castMember', cast).forEach(x => x.classList.toggle('buddy', x === b)); const el = $('.char', b); moodFn(el, 'happy'); say(L[lang].castHi[n], lang, null, n, el); deskBubble(L[lang].castHi[n]); renderTaskbar(); renderWidgets(); }); cast.appendChild(b); });
  const d = new Date(); $('#deskDate').textContent = d.toLocaleDateString(L[lang].bcp, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
  const ev = EVENT(), th = THEMES[weekTheme()], dp = `<button class="dpBtn">${{ morning: '🌅', day: '☀️', evening: '🌇', night: '🌙' }[DAYPART()]}</button>`;
  $('#deskBanner').innerHTML = ev ? `<span>${dp}</span><b>${ev.banner}</b>` : `<span>${dp}</span><b>${th.e} ${th.name}</b><i>★ THIS WEEK</i>`;
  $('#deskBanner').style.setProperty('--c', ev ? TT.yellow : TT.white);
  if (DESKFX) DESKFX.set(cfg.perf || calmDesk() ? '' : (ev && ev.fx) || SEASON().fx);
  renderWidgets();
  const fresh = checkLands(); if (fresh.length) setTimeout(() => landParty(fresh), 600);
}
function renderWidgets(sel = '#widgets') {
  const w = $(sel); if (!w) return; w.innerHTML = ''; const next = LANDS.find(l => !landOpen(l) && !l.secrets), prev = [...LANDS].reverse().find(l => landOpen(l) && !l.secrets) || LANDS[0];
  const total = Object.values(THEMES).reduce((a, t) => a + t.set.length, 0), have = Object.keys(PROG.stickers).length, p = PROG.pet;
  const W = (id, html, cls = '') => { const b = mk('button', 'wdg ' + cls, html); b.addEventListener('click', () => { SFX.tap(); openGame(id); }); w.appendChild(b); return b; };
  W('mailbox', `<span class="wi">${mailWaiting() ? '✉️' : '📭'}</span><span class="wl">${gname('mailbox')}</span>`, mailWaiting() ? 'alert' : '');
  W('map', `<span class="wi">${next ? next.e : '🏆'}</span><span class="wbar"><i style="width:${next ? clamp((PROG.stars - prev.stars) / (next.stars - prev.stars) * 100, 4, 100) : 100}%"></i></span><span class="wl">★ ${next ? next.stars : PROG.stars}</span>`);
  W('pet', `<span class="wi">${p && p.species ? charHTML(p.species, '', petStage(p) === 'super' ? 'crown' : null) : '🥚'}</span><span class="wl">${p && p.species ? '❤️'.repeat(Math.max(1, Math.min(3, Math.ceil((p.hearts || 0) / 2)))) : gname('pet')}</span>`, p && p.species ? '' : 'alert');
  W('stickers', `<span class="wi">🌟</span><span class="wl">${have} / ${total}</span>`);
}
const deskBubble = (html, hold) => { const b = $('#deskBubble'); b.innerHTML = html; b.classList.add('on'); retrigger(b, 'pop'); clearTimeout(b._t); if (!hold) b._t = setTimeout(() => b.classList.remove('on'), 6000); };
/* word of the day — Claude makes it when a brain is on; otherwise a built-in pair */
async function daily(speak) {
  const key = new Date().toDateString() + lang + cfg.lang2; let d = null;
  try { const c = JSON.parse(localStorage.getItem(KEYS.daily) || '{}'); if (c.key === key) d = c.d; } catch (e) {}
  if (!d) {
    const i = randi(0, 9); d = { emoji: ANIMAL_EMOJI[i], en: L.en.animals[i][0], other: cfg.lang2 !== 'none' && L[cfg.lang2] ? L[cfg.lang2].animals[i][0] : '', fact: '' };
    try {
      if (await chatBackend()) {
        const j = parseJSON(await chat([{ role: 'user', content: `Today is ${new Date().toDateString()}. This week's theme is ${THEMES[weekTheme()].name.toLowerCase()}. Make today's word.` }], `You make a "word of the day" for a bright ${AGE()} who speaks ${kidLangs()}. Pick one fun, concrete word (an animal, food, vehicle, thing in nature…), ideally fitting this week's theme, with a common emoji.
Reply with ONLY JSON: {"emoji":"…","en":"English word","other":"${cfg.lang2 !== 'none' && L[cfg.lang2] ? 'the word in ' + L[cfg.lang2].name + ' (with article if natural)' : ''}","fact":"one short, true, amazing fact about it in ${T().name}, 12 words max"}. ${KIDR()}`, 200));
        if (j && j.en) d = { emoji: j.emoji || '✨', en: j.en, other: j.other || '', fact: j.fact || '' };
      }
    } catch (e) {}
    try { localStorage.setItem(KEYS.daily, JSON.stringify({ key, d })); } catch (e) {}
  }
  if (view !== 'desk') return;
  deskBubble(`<b class="dw">${d.emoji} ${String(d.en).toUpperCase()}${d.other ? ' · ' + String(d.other).toUpperCase() : ''}</b>${d.fact ? `<span>${d.fact}</span>` : ''}`, true);
  if (speak) { const n = PROG.buddy || 'robo', el = $(`#cast .castMember.buddy .char`); say(d.en + '!', 'en', () => { if (d.other) say(d.other + '!', cfg.lang2, null, n, el); }, n, el); }
}

/* ── windows ── */
function showScreen(id) { $$('.screen').forEach(s => s.classList.toggle('active', s.id === id)); }
function endGame() { if (gctx) { gctx.end(); gctx = null; } hush(); VOICE_APP = false; $('#gtools').innerHTML = ''; $('#wLevels').innerHTML = ''; $('#wMeter').innerHTML = ''; $('#wBubble').classList.remove('on'); $('#celebrate').classList.remove('show'); $('#pack').classList.remove('show'); document.body.classList.remove('busy'); }
function openDesk() { closeStart(); endGame(); view = 'desk'; showScreen('desk'); renderDesk(); renderTaskbar(); }
function openGame(id, o = {}) {
  const gm = GBY[id]; if (!gm) return; if (!appUnlocked(id)) { SFX.bad(); return; } if (lockReason()) { showLock(lockReason()); return; }
  closeStart(); endGame(); const c = CBY[gm.cat]; view = id; VOICE_APP = VOICE_APPS.has(id);
  const win = $('#win'); win.style.setProperty('--c', c.c); win.style.setProperty('--ink', c.ink);
  $('#wIcon').textContent = gm.icon; $('#wTitle').textContent = gname(id); $('#wPg').textContent = 'P' + gm.pg;
  const old = $('#gstage'), stage = mk('div', 'gstage g-' + id); stage.id = 'gstage'; old.replaceWith(stage);
  showScreen('win'); audio(); if (DESKFX) DESKFX.set('');
  PROG.plays[id] = (PROG.plays[id] || 0) + 1; PROG.recent = [id, ...(PROG.recent || []).filter(x => x !== id)].slice(0, 5); PROG.newApps = PROG.newApps.filter(x => x !== id); const dr = dayRec(); dr.apps[id] = (dr.apps[id] || 0) + 1; saveProg(); renderTaskbar();
  gctx = makeCtx(stage, $('#gtools')); gctx.from = o.from || null; extendCtx(gctx, gm);
  try { gm.init(gctx); } catch (e) { console.error(e); stage.innerHTML = `<div class="gerr">⚠ ${e.message}</div>`; }
}
function renderAll() { if (view === 'desk') renderDesk(); else if (GBY[view]) { $('#wTitle').textContent = gname(view); } renderTaskbar(); if ($('#startMenu').classList.contains('show')) renderStart(); }
$('#wClose').addEventListener('click', () => { SFX.tap(); const from = gctx && gctx.from; if (from && view !== from) openGame(from); else openDesk(); });

/* the game toolkit: levels, meter, stars, host character, picture cards, celebrations, gentle difficulty */
function extendCtx(g, gm) {
  const st = gstat(gm.id); let n = 0, cur = 1, onLvl = null, meter = { total: 0, n: 0 }, paused = false, miss = 0, levelMiss = 0;
  const res = PROG.res[gm.id] || (PROG.res[gm.id] = { ok: 0, miss: 0 });
  g.lvl = () => cur; g.paused = () => paused;
  const pipsEl = $('#wLevels'), meterEl = $('#wMeter');
  function renderPips() { pipsEl.innerHTML = ''; if (n < 2) return; for (let i = 1; i <= n; i++) { const b = mk('button', 'pip' + (i === cur ? ' cur' : '') + (i <= st.max ? ' open' : ''), i); b.addEventListener('click', () => { if (i <= st.max && i !== cur) { SFX.tap(); setLevel(i); } }); pipsEl.appendChild(b); } }
  function setLevel(i) { cur = i; st.lvl = i; miss = 0; levelMiss = 0; saveProg(); renderPips(); if (onLvl) onLvl(i); }
  function renderMeter() { meterEl.style.display = meter.total ? '' : 'none'; const cells = Math.min(meter.total, 12), f = Math.floor(meter.n / meter.total * cells + 1e-9); meterEl.innerHTML = Array.from({ length: cells }, (_, i) => `<i class="${i < f ? 'on' : ''}"></i>`).join(''); }
  g.levels = (count, fn) => {
    n = count; onLvl = fn; st.n = count;
    if (!st.seen) { st.seen = 1; if (ageMonths() >= 40 && count >= 3 && (st.max || 1) < 2) { st.lvl = 2; st.max = 2; } }
    cur = clamp(st.lvl || 1, 1, count); st.max = Math.max(st.max || 1, cur); saveProg(); renderPips(); fn(cur); return cur;
  };
  g.meter = total => { meter = { total, n: 0 }; renderMeter(); };
  g.progress = (k = 1) => { if (!meter.total) return false; const was = meter.n; meter.n = Math.min(meter.total, meter.n + k); renderMeter(); if (meter.n > was) retrigger(meterEl, 'bump'); return meter.n >= meter.total; };
  g.meterSet = f => { if (!meter.total) return; meter.n = Math.round(clamp(f, 0, 1) * meter.total); renderMeter(); };
  g.star = (k = 1, x, y) => {
    PROG.stars += k; dayRec().s += k; saveProg(); $$('.starCount').forEach(e => e.textContent = PROG.stars);
    const tgt = $('#wHost .hstars'); if (tgt) retrigger(tgt, 'bump');
    if (x != null && tgt) { const r = tgt.getBoundingClientRect(), s = mk('div', 'flystar', '★'); s.style.left = x + 'px'; s.style.top = y + 'px'; document.body.appendChild(s); requestAnimationFrame(() => { s.style.left = (r.left + r.width / 2) + 'px'; s.style.top = (r.top + r.height / 2) + 'px'; s.style.transform = 'translate(-50%,-50%) scale(.5)'; }); setTimeout(() => s.remove(), 650); }
  };
  g.levelUp = () => {
    if (paused) return; paused = true; const top = cur >= n, next = top ? cur : cur + 1, perfect = levelMiss === 0;
    if (!top) { st.max = Math.max(st.max, next); st.lvl = next; saveProg(); }
    g.star(top ? 5 : 3); if (perfect) g.star(2);
    const resume = () => { paused = false; if (g.alive()) setLevel(next); };
    celebrate(top ? L[lang].super : L[lang].levelUp(next), top, () => { if (!g.alive()) return; showPack(giveStickers(top ? 3 : 2), () => { const lands = checkLands(); if (lands.length && g.alive()) landParty(lands, resume); else resume(); }); }, perfect);
  };
  let bubT = null; const bub = $('#wBubble');
  const bubble = (text, card) => {
    bub.innerHTML = ''; if (card) bub.insertAdjacentHTML('beforeend', card); if (text) bub.appendChild(mk('span', 'bt')).textContent = text;
    bub.classList.toggle('hasCard', !!card); bub.classList.toggle('on', !!(text || card)); retrigger(bub, 'pop'); clearTimeout(bubT);
    if (!card) bubT = setTimeout(() => bub.classList.remove('on'), Math.max(2600, String(text).length * 75));
  };
  g.dispose(() => clearTimeout(bubT));
  const hit = () => { res.ok++; miss = 0; }, oops = () => { res.miss++; miss++; levelMiss++; if (miss >= 6 && cur > 1 && !paused) { miss = 0; g.after(1200, () => { if (!paused && g.alive()) { tone(392, .2, 'triangle', .12); tone(330, .3, 'triangle', .12, .15); setLevel(cur - 1); } }); } };
  g.host = name => {
    const box = $('#wHost'); box.innerHTML = charHTML(name, 'hostChar') + `<span class="hstars">★ <b class="starCount">${PROG.stars}</b></span>`;
    const el = $('.char', box);
    return { el, name,
      say(text, ex = 'talk', code = lang, noBubble, card) { if (!noBubble || card) bubble(noBubble ? '' : text, card); if (text) say(text, code, null, name, el); },
      bubble: t => bubble(t), mood(ex, ms) { if (ex === 'oops') oops(); moodFn(el, ex, ms); },
      happy(text) { hit(); moodFn(el, 'happy', 1300); if (text) this.say(text); } };
  };
  g.host(PROG.buddy || 'robo');
}
function celebrate(text, top, done, perfect) {
  const c = $('#celebrate'); $('#celText').textContent = text; $('#celCast').innerHTML = CAST_IDS.map(n => charHTML(n, 'dance')).join(''); $('.celCard .strip', c).textContent = perfect ? '★ PERFECT ★' : '★ ★ ★';
  $('#celConfetti').innerHTML = Array.from({ length: cfg.perf ? 14 : 40 }, () => `<i style="left:${rand(0, 100)}%;background:${pick([TT.green, TT.blue, TT.red, TT.yellow, TT.white])};animation-delay:${rand(0, .8).toFixed(2)}s;animation-duration:${rand(1.4, 2.4).toFixed(2)}s"></i>`).join('');
  c.classList.toggle('top', !!top); c.classList.add('show'); [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, .25, 'square', .06, i * .11)); g_celDone = () => { c.classList.remove('show'); done(); };
  say(text); clearTimeout(c._t); c._t = setTimeout(() => g_celDone && (g_celDone(), g_celDone = null), 2800);
}
let g_celDone = null;
$('#celebrate').addEventListener('click', () => { if (g_celDone) { const f = g_celDone; g_celDone = null; clearTimeout($('#celebrate')._t); f(); } });
function landParty(lands, done) {
  const o = $('#pack'), l = lands[lands.length - 1];
  o.innerHTML = `<div class="packCard land"><div class="strip" style="--c:${l.c}">★ NEW LAND ★</div><div class="landBig">${l.e}</div><div class="landName">${l.name}</div><div class="packRow">${l.apps.filter(a => GBY[a]).map(a => `<span class="stk big"><b>${GBY[a].icon}</b></span>`).join('')}${l.hat ? `<span class="stk big hat">${spriteSVG(PROG.buddy || 'robo', 'happy', l.hat)}</span>` : ''}</div></div>`;
  o.classList.add('show'); [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, .3, 'square', .06, i * .12)); SFX.chime();
  let closed = false; const close = () => { if (closed) return; closed = true; o.classList.remove('show'); o.onclick = null; renderTaskbar(); if (done) done(); };
  setTimeout(() => { o.onclick = close; }, 800); setTimeout(close, 5000);
}

/* ═════════ TIME LIMITS + BEDTIME ═════════ */
let unlockUntil = 0;
function lockReason() {
  if (Date.now() < unlockUntil) return null;
  if (cfg.limitMin > 0 && dayRec().m >= cfg.limitMin) return 'limit';
  if (cfg.bedtime) { const [bh, bm] = cfg.bedtime.split(':').map(Number), [wh, wm] = (cfg.wake || '06:30').split(':').map(Number), d = new Date(), m = d.getHours() * 60 + d.getMinutes(), b = bh * 60 + bm, w = wh * 60 + wm; if (b > w ? (m >= b || m < w) : (m >= b && m < w)) return 'bed'; }
  return null;
}
function showLock(why) {
  const o = $('#lock'); if (o.classList.contains('show')) return; openDesk(); o.classList.add('show');
  $('#lockMsg').innerHTML = why === 'bed' ? '😴 💤 🌙' : '⏰ ✔ 👋'; $('#lockCast').innerHTML = CAST_IDS.map(n => charHTML(n)).join(''); $$('#lockCast .char').forEach(sleepChar);
  $('#lockStars').innerHTML = Array.from({ length: 30 }, () => `<i style="left:${rand(1, 99)}%;top:${rand(1, 60)}%;animation-delay:${rand(0, 3).toFixed(1)}s"></i>`).join('');
  [659, 523, 440, 392, 330, 262].forEach((f, i) => tone(f, .7, 'sine', .07, i * .45));
}
holdButton($('#lockMoon'), 3000, () => grownUpGate(() => { unlockUntil = Date.now() + 30 * 60000; $('#lock').classList.remove('show'); SFX.chime(); }));
setInterval(() => {
  if (document.visibilityState !== 'visible' || $('#boot') || $('#lock').classList.contains('show')) return;
  dayRec().m += .5; saveProg();
  const why = lockReason(); if (why) { showLock(why); return; }
  if (cfg.limitMin > 0 && cfg.limitMin - dayRec().m === 2 && view !== 'desk') { const b = $('#wBubble'); b.innerHTML = '<span class="bt">⏰ 2</span>'; b.classList.add('on'); }
}, 30000);

/* ═════════ FULL SCREEN (kiosk-only features degrade quietly in a normal tab or an iframe) ═════════ */
const canFull = () => { try { return !!(document.fullscreenEnabled && document.documentElement.requestFullscreen); } catch (e) { return false; } };
function goFull() { if (!canFull() || document.fullscreenElement) return; try { const p = document.documentElement.requestFullscreen(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
function leaveFull() { try { if (document.fullscreenElement && document.exitFullscreen) { const p = document.exitFullscreen(); if (p && p.catch) p.catch(() => {}); } } catch (e) {} }
{ const fb = $('#tbFull'); if (fb && !KIOSK && canFull()) { fb.style.display = ''; fb.addEventListener('click', () => { SFX.tap(); document.fullscreenElement ? leaveFull() : goFull(); }); document.addEventListener('fullscreenchange', () => fb.classList.toggle('on', !!document.fullscreenElement)); } }
document.body.classList.toggle('kiosk', KIOSK); document.body.classList.toggle('web', !KIOSK); document.body.classList.toggle('embedded', EMBEDDED);
/* first run on a fresh device: a grown-up can type the child's name on the start-up screen (optional) */
{ const fr = $('#bootFirst'); if (fr && !KID_NAME() && !Object.keys(PROG.plays || {}).length) fr.style.display = ''; }

/* ═════════ BOOT ═════════ */
(async function bootLog() {
  const log = $('#bootLog'); let i = 0;
  const line = (k, v, off) => { const d = mk('div', 'boot-line', '<span></span><b></b>'); d.style.animationDelay = (i++ * .2) + 's'; d.children[0].textContent = k; d.children[1].textContent = v; d.children[1].classList.toggle('off', !!off); log.appendChild(d); return d; };
  const ev = EVENT(), th = THEMES[weekTheme()];
  line(osTitle(), 'v' + MINIOS.version); line('APPS', String(GAMES.length)); line('LANDS', `${PROG.lands.length} / ${LANDS.length}`); line('STARS', '★ ' + PROG.stars);
  line(ev ? 'TODAY' : 'THIS WEEK', ev ? ev.banner : `${th.e} ${th.name}`);
  const brain = line('ROBOT BRAIN', '…', true); let b = null; try { b = await chatBackend(); } catch (e) {}
  brain.children[1].textContent = b === 'home' ? 'HOME PC' : b === 'cloud' ? 'CLOUD' : 'OFF'; brain.children[1].classList.toggle('off', !b);
})();
$('#bootGo').addEventListener('pointerdown', () => {
  const bt = $('#boot'); bt.classList.add('out'); setTimeout(() => bt.remove(), 700);
  BGM.started = true; setInterval(() => bgmTick(view), 100);
  audio(); dayRec(); saveProg(); openDesk(); SFX.chime(); daily(true); makeWeek().then(() => { if (view === 'desk') renderDesk(); });
  if (isBirthday() && PROG.bday !== today()) { PROG.bday = today(); saveProg(); setTimeout(() => showPack(giveStickers(5)), 1200); }
  const why = lockReason(); if (why) setTimeout(() => showLock(why), 900);
  const nm = $('#bootName'); if (nm && nm.value.trim()) { cfg.profile.name = nm.value.trim().slice(0, 24); saveCfg(); applyBrand(); renderAll(); }
  if (KIOSK) goFull();
});

/* ═════════ GROWN-UP PANEL ═════════ */
let boothCode = 'en';
const PF = ['name', 'birthday', 'favAnimal', 'favColor', 'favVehicle', 'favFood', 'loves', 'family', 'baby', 'p2names'];
function openGP() {
  $('#gpLang').value = cfg.lang2; $$('#gpMode button').forEach(b => b.classList.toggle('on', b.dataset.v === cfg.mode)); $$('#gpVoiceMode button').forEach(b => b.classList.toggle('on', b.dataset.v === cfg.voiceMode));
  $('#gpIp').value = cfg.home.ip; $('#gpPort').value = cfg.home.port; $('#gpLocalModel').value = cfg.home.model;
  $('#gpCloudProv').value = cfg.cloud.provider; $('#gpCloudModel').value = cfg.cloud.model; $('#gpClaudeKey').value = cfg.cloud.claudeKey; $('#gpOpenaiKey').value = cfg.cloud.openaiKey;
  $('#gpTtsProv').value = cfg.tts.provider; $('#gpTtsModel').value = cfg.tts.openaiModel; $('#gpElevenKey').value = cfg.tts.elevenKey; $('#gpElevenVoice').value = cfg.tts.elevenVoice;
  PF.forEach(k => $('#pf_' + k).value = cfg.profile[k] || '');
  $('#gpLimit').value = cfg.limitMin || 0; $('#gpBed').value = cfg.bedtime || ''; $('#gpWake').value = cfg.wake || '06:30'; $('#gpPerf').checked = !!cfg.perf; $$('#gpKbd button').forEach(b => b.classList.toggle('on', b.dataset.v === (cfg.kbd || 'lock'))); $('#gpUnlock').checked = !!cfg.unlockAll;
  $$('#gpArt button').forEach(b => b.classList.toggle('on', b.dataset.v === (cfg.art || 'brain'))); $('#gpArtModel').value = cfg.artModel || 'claude-haiku-5-5'; $('#gpArtStatus').innerHTML = '';
  $('#gpComfyModel').value = cfg.comfy.model || 'off'; $('#gpComfyHost').value = cfg.comfy.host || ''; $('#gpComfyPort').value = cfg.comfy.port || '8188'; $('#gpComfyZ').value = cfg.comfy.zModel || ''; $('#gpComfyZClip').value = cfg.comfy.zClip || ''; $('#gpComfyK').value = cfg.comfy.kModel || ''; $('#gpComfyFlow').value = cfg.comfy.workflow || '';
  $('#gpStatus').textContent = ''; $('#gpComfyStatus').textContent = '';
  $('#gpStars').textContent = `★ ${PROG.stars} · ${Object.values(PROG.games).reduce((a, s) => a + (s.max || 1) - 1, 0)} levels · ${PROG.lands.length}/${LANDS.length} lands · ${Object.keys(PROG.stickers).length} stickers · ${daysPlayed()} days`;
  renderVoices(); renderBooth(); renderPhotos(); renderMyApps(); renderWeek(); renderBrandGP(); renderSaverGP(); renderWallGP(); renderAboutGP(); $$('#gpDesk button').forEach(b => b.classList.toggle('on', b.dataset.v === (cfg.deskStyle || 'calm'))); $('#gp').classList.add('show'); $('#gp .gpBox').scrollTop = 0;
}
function readGP() {
  cfg.lang2 = $('#gpLang').value;
  cfg.home.ip = $('#gpIp').value.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''); cfg.home.port = $('#gpPort').value.trim() || '1234'; cfg.home.model = $('#gpLocalModel').value.trim();
  cfg.cloud.provider = $('#gpCloudProv').value; cfg.cloud.model = $('#gpCloudModel').value.trim(); cfg.cloud.claudeKey = $('#gpClaudeKey').value.trim(); cfg.cloud.openaiKey = $('#gpOpenaiKey').value.trim();
  cfg.tts.provider = $('#gpTtsProv').value; cfg.tts.openaiModel = $('#gpTtsModel').value.trim() || 'gpt-4o-mini-tts'; cfg.tts.elevenKey = $('#gpElevenKey').value.trim(); cfg.tts.elevenVoice = $('#gpElevenVoice').value.trim();
  PF.forEach(k => cfg.profile[k] = $('#pf_' + k).value.trim());
  cfg.limitMin = Math.max(0, +$('#gpLimit').value || 0); cfg.bedtime = $('#gpBed').value; cfg.wake = $('#gpWake').value || '06:30'; cfg.perf = $('#gpPerf').checked; cfg.unlockAll = $('#gpUnlock').checked;
  cfg.artModel = $('#gpArtModel').value;
  Object.assign(cfg.comfy, { model: $('#gpComfyModel').value, host: $('#gpComfyHost').value.trim(), port: $('#gpComfyPort').value.trim() || '8188', zModel: $('#gpComfyZ').value.trim(), zClip: $('#gpComfyZClip').value.trim(), kModel: $('#gpComfyK').value.trim(), workflow: $('#gpComfyFlow').value.trim() });
  readBrandGP(); homeCache.t = 0; saveCfg(); applyPerf(); if (cfg.lang2 === 'none' || (lang !== 'en' && lang !== cfg.lang2)) lang = 'en'; renderAll(); renderVoices();
}
$$('#gp input:not([type=file]),#gp select,#gp textarea').forEach(el => { if (!el.closest('#booth,#gpPhotoList,#gpAppList')) el.addEventListener('change', readGP); });
$$('#gpMode button').forEach(b => b.addEventListener('click', () => { cfg.mode = b.dataset.v; saveCfg(); homeCache.t = 0; $$('#gpMode button').forEach(x => x.classList.toggle('on', x === b)); }));
$$('#gpDesk button').forEach(b => b.addEventListener('click', () => { cfg.deskStyle = b.dataset.v; saveCfg(); $$('#gpDesk button').forEach(x => x.classList.toggle('on', x === b)); applyDeskStyle(); renderDesk(); renderTaskbar(); }));
$$('#gpKbd button').forEach(b => b.addEventListener('click', () => { cfg.kbd = b.dataset.v; saveCfg(); $$('#gpKbd button').forEach(x => x.classList.toggle('on', x === b)); lockKeys(); }));
$('#gpExit').addEventListener('click', () => {
  const b = $('#gpExit'); if (!b.dataset.arm) { b.dataset.arm = 1; b.textContent = 'TAP AGAIN TO CLOSE ' + osTitle(); setTimeout(() => { delete b.dataset.arm; b.textContent = 'EXIT TO WINDOWS'; }, 4000); return; }
  downloadURL(URL.createObjectURL(new Blob(['exit'], { type: 'text/plain' })), 'i2minios-exit.txt'); b.textContent = 'CLOSING… (IF IT STAYS OPEN: ALT+F4)';
  try { navigator.keyboard && navigator.keyboard.unlock(); } catch (e) {} setTimeout(() => { leaveFull(); try { window.close(); } catch (e) {} }, 1500);
});
$$('#gpVoiceMode button').forEach(b => b.addEventListener('click', () => { cfg.voiceMode = b.dataset.v; saveCfg(); $$('#gpVoiceMode button').forEach(x => x.classList.toggle('on', x === b)); }));
function renderVoices() {
  const box = $('#gpVoices'); box.innerHTML = ''; const codes = ['en']; if (cfg.lang2 !== 'none' && L[cfg.lang2]) codes.push(cfg.lang2);
  codes.forEach(code => {
    box.appendChild(mk('div', 'vHead', L[code].name)); const list = mk('div', 'vlist'); box.appendChild(list); const vs = voicesFor(code), cur = voiceFor(code);
    if (!vs.length) { list.innerHTML = '<p style="padding:8px">No voices for this language. Windows: Settings → Time & language → Speech → Add voices.</p>'; return; }
    vs.forEach(v => { const b = mk('button', 'vItem' + (cur && v.name === cur.name ? ' cur' : '')); b.textContent = `${v.name} · ${v.lang}${v.localService ? '' : ' · online'}`; b.addEventListener('click', () => { cfg.voices[code] = v.name; saveCfg(); $$('.vItem', list).forEach(x => x.classList.remove('cur')); b.classList.add('cur'); say(L[code].hi, code, null, null, null, true); }); list.appendChild(b); });
  });
}
$('#gpTtsTest').addEventListener('click', () => { readGP(); const s = $('#gpTtsStatus'); s.textContent = ttsReady() ? 'Asking the cloud voice… (saved after the first time)' : 'Using the Windows/Edge voice.'; say(L[lang].castHi.robo, lang, () => { s.textContent += ' ✔'; }, 'robo', null, true); });

/* family voice booth */
let REC = null;
function renderBooth() {
  const seg = $('#boothLang'), codes = ['en', ...(cfg.lang2 !== 'none' && L[cfg.lang2] ? [cfg.lang2] : [])]; if (!codes.includes(boothCode)) boothCode = 'en';
  seg.innerHTML = ''; codes.forEach(c => { const b = mk('button', c === boothCode ? 'on' : '', L[c].name.toUpperCase()); b.addEventListener('click', () => { boothCode = c; renderBooth(); }); seg.appendChild(b); });
  const box = $('#booth'); box.innerHTML = ''; let grp = '', have = 0;
  const custom = (cfg.customPhrases || {})[boothCode] || [];
  [...boothPhrases(boothCode), ...custom.map(p => ({ group: 'Yours', p }))].forEach(({ group, p }) => {
    if (group !== grp) { grp = group; box.appendChild(mk('div', 'vHead', group)); }
    const key = boothCode + '|' + normP(p), has = !!CLIPS[key]; if (has) have++;
    const row = mk('div', 'bRow' + (has ? ' has' : ''), `<span class="bp"></span><button class="gpBtn rec">●</button><button class="gpBtn play">▶</button><button class="gpBtn del">✖</button>`); $('.bp', row).textContent = p;
    $('.rec', row).addEventListener('click', e => recordClip(key, e.currentTarget)); $('.play', row).addEventListener('click', () => { if (CLIPS[key]) new Audio(CLIPS[key]).play(); });
    $('.del', row).addEventListener('click', async () => { await IDB.del('clips', key); if (CLIPS[key]) { URL.revokeObjectURL(CLIPS[key]); delete CLIPS[key]; } if (group === 'Yours') { cfg.customPhrases[boothCode] = custom.filter(x => x !== p); saveCfg(); } renderBooth(); });
    box.appendChild(row);
  });
  $('#boothCount').textContent = `${have} recorded`;
}
async function recordClip(key, btn) {
  if (REC) { REC.stop(); return; }
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }), mr = new MediaRecorder(s), chunks = [];
    mr.ondataavailable = e => chunks.push(e.data);
    mr.onstop = async () => { s.getTracks().forEach(t => t.stop()); REC = null; btn.classList.remove('on'); const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' }); await IDB.set('clips', key, blob); await loadClips(); renderBooth(); new Audio(CLIPS[key]).play(); };
    REC = mr; mr.start(); btn.classList.add('on'); setTimeout(() => mr.state === 'recording' && mr.stop(), 4000);
  } catch (e) { $('#boothCount').textContent = 'Microphone blocked: ' + e.message; }
}
$('#boothAdd').addEventListener('click', () => { const v = $('#boothCustom').value.trim(); if (!v) return; cfg.customPhrases = cfg.customPhrases || {}; (cfg.customPhrases[boothCode] = cfg.customPhrases[boothCode] || []).push(v); saveCfg(); $('#boothCustom').value = ''; renderBooth(); });

/* family photos */
async function renderPhotos() {
  const box = $('#gpPhotoList'); box.innerHTML = '';
  (await IDB.all('photos')).forEach(([k, v]) => { const d = mk('div', 'ph', `<img src="${v.url}"><input value=""><button class="gpBtn del">✖</button>`); $('input', d).value = v.name || ''; $('input', d).addEventListener('change', e => IDB.set('photos', k, { ...v, name: e.target.value.trim() })); $('.del', d).addEventListener('click', async () => { await IDB.del('photos', k); renderPhotos(); }); box.appendChild(d); });
}
$('#gpPhotos').addEventListener('change', async e => { for (const f of e.target.files) { const url = await blobToDataURL(f), im = await loadImg(url).catch(() => null); if (!im) continue; await IDB.set('photos', 'p' + Date.now().toString(36) + randi(10, 99), { name: f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '), url: shrinkCanvas(im, 720) }); } e.target.value = ''; renderPhotos(); });

/* imported HTML games */
async function renderMyApps() {
  const box = $('#gpAppList'); box.innerHTML = '';
  (await IDB.all('apps')).forEach(([k, a]) => { const d = mk('div', 'ph app', `<input class="ico" maxlength="4"><input class="nm"><button class="gpBtn del">✖</button>`); $('.ico', d).value = a.icon || '🎮'; $('.nm', d).value = a.name; const save = () => IDB.set('apps', k, { ...a, icon: $('.ico', d).value || '🎮', name: $('.nm', d).value || a.name }); $('.ico', d).addEventListener('change', save); $('.nm', d).addEventListener('change', save); $('.del', d).addEventListener('click', async () => { await IDB.del('apps', k); renderMyApps(); }); box.appendChild(d); });
}
$('#gpApp').addEventListener('change', async e => { for (const f of e.target.files) { const html = await f.text(), t = (html.match(/<title>([^<]*)<\/title>/i) || [])[1]; await IDB.set('apps', 'a' + Date.now().toString(36), { name: (t || f.name.replace(/\.[^.]+$/, '')).trim().slice(0, 24), icon: '🎮', html }); } e.target.value = ''; renderMyApps(); });

/* about: version + credit */
function renderAboutGP() {
  const a = $('#gpAbout'); if (!a) return;
  a.innerHTML = `<div class="abMark">${i2MarkSVG()}</div><div class="abText"><b>${escHTML(MINIOS.name)} ${escHTML(MINIOS.version)}</b><span>${GAMES.length} apps · ${KIOSK ? 'kiosk laptop' : EMBEDDED ? 'web edition (embedded)' : 'web edition'} · offline-first</span><span>by <a href="${MINIOS.url}" target="_blank" rel="noopener noreferrer">i2 interactive</a> · MIT license</span></div>`;
  $$('.kioskOnly').forEach(e => e.style.display = KIOSK ? '' : 'none');
}

/* ComfyUI test */
$$('#gpArt button').forEach(b => b.addEventListener('click', () => { cfg.art = b.dataset.v; saveCfg(); $$('#gpArt button').forEach(x => x.classList.toggle('on', x === b)); }));
$('#gpArtTest').addEventListener('click', async () => {
  readGP(); const s = $('#gpArtStatus'); s.className = '';
  if (!cfg.cloud.claudeKey) { s.className = 'err'; s.textContent = '✖ Add a Claude API key in the Robot brain section first.'; return; }
  s.textContent = 'Asking Claude for a test drawing…'; const t0 = performance.now();
  try { const raw = await claudeCall(cfg.artModel, [{ role: 'user', content: 'Draw: a happy little robot waving' }], 'Output ONLY one <svg> element with viewBox="0 0 400 300": a cute simple flat-color picture with thick dark outlines. No text.', 3500, true); const svg = safeSVG(raw); if (!svg) throw new Error('the drawing came back broken'); s.innerHTML = `✔ Claude drew this in ${((performance.now() - t0) / 1000).toFixed(1)} s:<div class="artPrev"></div>`; $('.artPrev', s).appendChild(svg); }
  catch (e) { s.className = 'err'; s.textContent = '✖ ' + e.message; }
});
$('#gpComfyTest').addEventListener('click', async () => {
  readGP(); const s = $('#gpComfyStatus'); s.className = ''; const base = comfyBase();
  if (!comfyOn()) { s.textContent = 'Pick a model and enter the PC address first.'; return; }
  s.textContent = `Checking ${base} …`;
  try { const r = await withTimeout(fetch(base + '/system_stats'), 5000); const j = await r.json(); s.textContent = `✔ Reached ComfyUI (${(j.devices || [])[0] ? j.devices[0].name : 'ok'}). Making a test sticker…`; const url = await comfyMake('cute kawaii die-cut sticker, thick white border, a happy yellow duck, plain white background', 512, t => s.textContent = `✔ Reached ComfyUI. Making a test sticker… ${Math.round(t)} s`); s.innerHTML = '✔ Works! <img class="comfyTest" src="' + url + '">'; }
  catch (e) { s.className = 'err'; s.textContent = `✖ ${e.message}. Check: ComfyUI started with --listen --enable-cors-header "*", same Wi-Fi, firewall allows port ${cfg.comfy.port || 8188} on Private networks, and the model files exist.`; }
});

/* this week: stats, highlight card, storybook */
function weekStats() {
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toLocaleDateString('en-CA'); }), recs = days.map(k => PROG.days[k]).filter(Boolean), apps = {};
  recs.forEach(r => Object.entries(r.apps || {}).forEach(([k, v]) => apps[k] = (apps[k] || 0) + v));
  return { days: recs.length, mins: Math.round(recs.reduce((a, r) => a + (r.m || 0), 0)), stars: recs.reduce((a, r) => a + (r.s || 0), 0), top: Object.entries(apps).sort((a, b) => b[1] - a[1]).slice(0, 4).map(x => x[0]).filter(id => GBY[id]) };
}
function renderWeek() { const w = weekStats(); $('#gpWeek').innerHTML = `<p><b>${w.days}</b> days played · <b>${w.mins}</b> min · <b>★ ${w.stars}</b> stars · favourites: ${w.top.map(id => GBY[id].icon + ' ' + gname(id)).join(', ') || '—'}</p>`; }
$('#gpCard').addEventListener('click', async () => {
  const w = weekStats(), c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, 1080, 1350); [TT.green, TT.blue, TT.red, TT.yellow].forEach((col, i) => { x.fillStyle = col; x.fillRect(i * 270, 0, 270, 18); x.fillRect(i * 270, 1332, 270, 18); });
  x.fillStyle = TT.white; x.font = "700 92px 'i2 Pixel', monospace"; x.fillText('THIS WEEK', 60, 150); x.fillStyle = TT.yellow; x.font = "700 48px 'i2 Pixel', monospace"; x.fillText(KID_NAME() ? `${KID_NAME().toUpperCase()} · ${osTitle()}` : osTitle(), 60, 220);
  x.fillStyle = TT.dim || '#9C9C96'; x.font = "30px 'IBM Plex Sans', sans-serif"; x.fillText(new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }), 60, 270);
  [[`★ ${w.stars}`, 'STARS', TT.yellow], [`${w.days}`, 'DAYS PLAYED', TT.green], [`${Object.keys(PROG.stickers).length}`, 'STICKERS', TT.pink], [`${PROG.lands.length}/${LANDS.length}`, 'LANDS', TT.blue]].forEach(([v, l, col], i) => { const bx = 60 + (i % 2) * 490, by = 320 + Math.floor(i / 2) * 230; x.strokeStyle = '#3a3a3a'; x.lineWidth = 3; x.strokeRect(bx, by, 470, 200); x.fillStyle = col; x.fillRect(bx, by, 470, 14); x.font = "700 96px 'i2 Pixel', monospace"; x.fillText(v, bx + 30, by + 130); x.fillStyle = '#9C9C96'; x.font = "28px 'i2 Pixel', monospace"; x.fillText(l, bx + 30, by + 178); });
  x.fillStyle = TT.white; x.font = "700 40px 'i2 Pixel', monospace"; x.fillText('FAVOURITES', 60, 850); x.font = '110px sans-serif'; w.top.forEach((id, i) => x.fillText(GBY[id].icon, 60 + i * 170, 990));
  const art = (await MEDIA.list(['paint', 'photo', 'sticker']))[0]; if (art) { try { const im = await loadImg(art[1].url), k = Math.min(380 / im.width, 300 / im.height); x.drawImage(im, 1020 - im.width * k, 1050 + (300 - im.height * k) / 2, im.width * k, im.height * k); } catch (e) {} }
  try { const im = await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(spriteSVG(PROG.buddy || 'robo', 'happy'))); x.imageSmoothingEnabled = false; x.drawImage(im, 60, 1040, 240, 300); } catch (e) {}
  downloadURL(c.toDataURL('image/png'), `i2minios-week-${today()}.png`);
});
$('#gpBook').addEventListener('click', async () => {
  const stories = (await MEDIA.list(['story'])).map(([, v]) => v).reverse(); const name = KID_NAME(), title = name ? `${name}'s Storybook` : 'My Storybook';
  const esc = s => String(s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const pages = stories.map(s => `<section><h2>${esc(s.title)}</h2>${s.img ? `<img src="${s.img}">` : s.svgArt ? s.svgArt : ''}<p>${esc(s.text)}</p><small>${esc(s.date)}</small></section>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><title>${esc(title)}</title><style>body{font:22px/1.5 Georgia,serif;margin:0;color:#111}section{page-break-after:always;padding:48px;min-height:90vh;display:flex;flex-direction:column;gap:20px}h1{font:700 64px system-ui;text-align:center;margin-top:30vh}h2{font:700 34px system-ui;margin:0}img,svg{max-width:100%;max-height:55vh;object-fit:contain;border-radius:12px}small{color:#777}.cover{page-break-after:always;text-align:center}</style><div class="cover"><h1>${esc(title)}</h1><p>${stories.length} stories · ${esc(osTitle())}</p></div>${pages || '<p>No stories yet — finish a story in the Stories app.</p>'}`;
  downloadURL(URL.createObjectURL(new Blob([html], { type: 'text/html' })), `${(name || 'my').replace(/[^\p{L}\p{N}]+/gu, '-')}-storybook.html`);
});

/* backup + restore — API keys are always blanked out of the file */
const BACKUP_LS = [KEYS.drawings, KEYS.town, KEYS.week, KEYS.song];
$('#gpBackup').addEventListener('click', async () => {
  const c = JSON.parse(JSON.stringify(cfg)); c.cloud.claudeKey = c.cloud.openaiKey = ''; c.tts.elevenKey = '';
  const out = { i2minios: 6, date: new Date().toISOString(), cfg: c, prog: PROG, ls: {}, idb: {} };
  BACKUP_LS.forEach(k => out.ls[k] = localStorage.getItem(k));
  for (const s of ['clips', 'photos', 'media', 'apps']) out.idb[s] = await Promise.all((await IDB.all(s)).map(async ([k, v]) => [k, v instanceof Blob ? { __blob: await blobToDataURL(v) } : v]));
  downloadURL(URL.createObjectURL(new Blob([JSON.stringify(out)], { type: 'application/json' })), `i2minios-backup-${today()}.json`); $('#gpBackupStatus').textContent = '✔ Backup downloaded (API keys are not included).';
});
$('#gpRestore').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return; const st = $('#gpBackupStatus');
  try {
    const j = JSON.parse(await f.text()); if (!j || !(j.i2minios || j[KEYS.legacyBackup]) || !j.cfg || !j.prog) throw new Error('not an i2 miniOS backup');
    const keep = { ...cfg.cloud }, keepT = cfg.tts.elevenKey; localStorage.setItem(KEYS.cfg, JSON.stringify({ ...j.cfg, cloud: { ...j.cfg.cloud, claudeKey: keep.claudeKey, openaiKey: keep.openaiKey }, tts: { ...j.cfg.tts, elevenKey: keepT } }));
    localStorage.setItem(KEYS.prog, JSON.stringify(j.prog)); Object.entries(j.ls || {}).forEach(([k, v]) => BACKUP_LS.includes(k) && typeof v === 'string' && localStorage.setItem(k, v));
    for (const [s, rows] of Object.entries(j.idb || {})) { await IDB.clear(s); for (const [k, v] of rows) await IDB.set(s, k, v && v.__blob ? await dataURLToBlob(v.__blob) : v); }
    st.textContent = '✔ Restored. Restarting…'; setTimeout(() => location.reload(), 900);
  } catch (err) { st.textContent = '✖ ' + err.message; }
});

$('#gpDone').addEventListener('click', () => { readGP(); $('#gp').classList.remove('show'); renderAll(); });
$('#gpReset').addEventListener('click', () => { if ($('#gpReset').dataset.arm) { PROG = { stars: 0, games: {}, buddy: PROG.buddy, plays: {}, recent: [], v5: 1, stickers: {}, hats: ['party', 'cap', 'flower'], outfit: {}, lands: ['home'], newApps: [], days: {}, mail: {}, res: {}, pet: null }; saveProg(); try { localStorage.removeItem(KEYS.drawings); } catch (e) {} $('#gpReset').textContent = 'PROGRESS RESET ✓'; delete $('#gpReset').dataset.arm; renderAll(); } else { $('#gpReset').dataset.arm = 1; $('#gpReset').textContent = 'TAP AGAIN TO RESET STARS, LEVELS, STICKERS, LANDS + PET'; } });
$('#gpTest').addEventListener('click', async () => {
  readGP(); const s = $('#gpStatus'); s.className = ''; const out = [];
  const put = (ln, bad) => { out.push(ln); s.textContent = out.join('\n'); if (bad) s.className = 'err'; };
  if (cfg.mode !== 'cloud') {
    const base = homeBase();
    if (!base) put('HOME PC: no address entered.', cfg.mode === 'home');
    else { put(`HOME PC: checking ${base}/models …`); try { const r = await withTimeout(fetch(base + '/models'), 4000); const j = await r.json(); put(`✔ Reached LM Studio. Models: ${(j.data || []).map(m => m.id).slice(0, 4).join(', ') || '(none — load one)'}`); homeCache = { t: Date.now(), ok: true }; } catch (e) { put(`✖ Can't reach it. Check: server running, "Serve on Local Network" ON, "Enable CORS" ON, firewall allows LM Studio on Private networks, same Wi-Fi. (${e.message})`, true); homeCache = { t: Date.now(), ok: false }; } }
  }
  if (cfg.mode !== 'home') put(cloudReady() ? `CLOUD: ${cfg.cloud.provider === 'anthropic' ? 'Claude' : 'OpenAI'} key entered.` : 'CLOUD: no key entered.');
  try { const b = await chatBackend(); if (!b) { put('✖ No robot brain available right now.', true); return; } put(`Asking ${b === 'home' ? 'your home PC' : 'the cloud'} to say hi …`); const t0 = performance.now(); const r = await chat([{ role: 'user', content: `Say hi to ${KID()} in one short sentence.` }], 'You are Robo, a friendly robot talking to a toddler. One short sentence.', 60); put(`✔ Talking works (${((performance.now() - t0) / 1000).toFixed(1)} s): "${r}"`); say(r, lang, null, 'robo', null, true); localStorage.removeItem(KEYS.week); makeWeek(); }
  catch (e) { put('✖ ' + e.message, true); }
});

/* ═════════ KEYBOARD + KIOSK HYGIENE ═════════ */
/* Toddler keyboard lock (default): system shortcuts are swallowed, Esc/Win do nothing, fast slapping turns
   into a harmless light show instead of reaching the game. Ctrl+Shift+O = grown-up question. */
const KB = { t: [], all: [], until: 0, buf: [] };
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
function sparkle(key) {
  const host = $('#sparkles'); if (host.children.length > 30) host.firstChild.remove();
  const ch = key && key.length === 1 && /\S/.test(key) ? key.toUpperCase() : pick(['★', '●', '▲', '■', '♥']), s = mk('i', 'ksp', ch);
  s.style.left = rand(5, 95) + '%'; s.style.top = rand(10, 85) + '%'; s.style.color = pick(COLORS); host.appendChild(s); setTimeout(() => s.remove(), 1200);
  tone(PENTA[(ch.charCodeAt(0) || 0) % 10] * 2, .12, 'triangle', .05);
}
/* Keyboard Lock only exists in Chromium, only works full screen and never inside an iframe; everywhere else this quietly does nothing */
function lockKeys() { const kb = navigator.keyboard; if (cfg.kbd === 'free') { try { kb && kb.unlock && kb.unlock(); } catch (e) {} return; } try { if (document.fullscreenElement && !EMBEDDED && kb && kb.lock) { const p = kb.lock(); if (p && p.catch) p.catch(() => {}); } } catch (e) {} }
document.addEventListener('fullscreenchange', lockKeys);
document.addEventListener('keydown', e => {
  if (e.target.closest && (e.target.closest('#gp') || e.target.tagName === 'IFRAME')) return;
  const lock = cfg.kbd !== 'free';
  if ((e.key === ' ' || e.key === 'Enter') && e.target.tagName === 'BUTTON' && !$('#gate').classList.contains('show')) { e.preventDefault(); e.target.blur(); }
  if (e.ctrlKey && e.shiftKey && /^o$/i.test(e.key)) { e.preventDefault(); grownUpGate(openGP); return; }
  if ($('#gate').classList.contains('show')) { if (/^\d$/.test(e.key)) { const b = $$('.gateKeys button').find(x => x.textContent === e.key); if (b) b.click(); } else if (e.key === 'Enter') $('.gateKeys .ok').click(); e.preventDefault(); return; }
  if (lock) { if (e.ctrlKey || e.altKey || e.metaKey || /^F\d+$/.test(e.key) || ['Tab', 'Escape', 'Meta', 'OS', 'ContextMenu', 'Backspace', 'BrowserBack', 'BrowserForward', 'BrowserHome'].includes(e.key)) e.preventDefault(); }
  else if ((e.ctrlKey || e.metaKey) && /^[+\-=0pPsSoOfFnNtTwWrR]$/.test(e.key)) e.preventDefault();
  /* easter eggs */
  KB.buf.push(e.key); KB.buf = KB.buf.slice(-10);
  if (KB.buf.join(',').toLowerCase() === KONAMI.join(',').toLowerCase()) { secret('konami'); PROG.crt = !PROG.crt; saveProg(); document.body.classList.toggle('crt', !!PROG.crt); }
  if (KB.buf.slice(-4).join('').toUpperCase() === (BRAND().short || MINIOS.short).toUpperCase().slice(0, 4).padEnd(4, '#')) { secret('nameword'); if (view === 'desk') partyTime(); }
  /* mash detection */
  const now = performance.now(), wants = GBY[view] && GBY[view].mash;
  KB.t = KB.t.filter(x => now - x < 1200); if (!e.repeat) KB.t.push(now); KB.all = KB.all.filter(x => now - x < 4000); if (!e.repeat) KB.all.push(now);
  if (KB.all.length >= 35) secret('mash');
  if (lock && !wants && KB.t.length >= 7) KB.until = now + 1500;
  if (lock && !wants && (now < KB.until || view === 'desk')) { sparkle(e.key); return; }
  if (!lock) {
    if (e.key === 'Escape') { if ($('#startMenu').classList.contains('show')) closeStart(); else if (view !== 'desk') openDesk(); return; }
    if (e.key === 'Meta' || e.key === 'OS') { toggleStart(); return; }
  }
  if (view !== 'desk' && gctx && gctx.key && !$('#startMenu').classList.contains('show')) { if (e.repeat && !/^Arrow/.test(e.key)) return; gctx.key(e); }
});
/* desktop easter eggs */
let castLog = [];
function castSeq(n) { const now = Date.now(); castLog = [...castLog.filter(c => now - c.t < 5000), { n, t: now }].slice(-4); if (castLog.map(c => c.n).join() === CAST_IDS.join()) { castLog = []; [523, 659, 784, 1047].forEach((f, i) => tone(f, .25, 'square', .06, i * .15)); secret('castorder'); } }
function partyTime() { $$('#cast .char').forEach(c => c.classList.add('dance')); [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, .2, 'square', .05, i * .12)); document.body.classList.add('discoMode'); setTimeout(() => { document.body.classList.remove('discoMode'); $$('#cast .char').forEach(c => c.classList.remove('dance')); }, 8000); }
{ let taps = []; $('#deskTime').addEventListener('click', () => { const now = Date.now(); taps = [...taps.filter(t => now - t < 3000), now]; tone(880, .05, 'square', .04); if (taps.length >= 7) { taps = []; secret('disco'); partyTime(); } }); }
{ let taps = []; $('#deskBanner').addEventListener('click', e => { if (!e.target.closest('.dpBtn')) return; const now = Date.now(); taps = [...taps.filter(t => now - t < 4000), now]; tone(660, .05, 'sine', .05); if (taps.length >= 5) { taps = []; const u = mk('div', 'ufo', '🛸'); $('#desk').appendChild(u); sweep(300, 1200, 1.5, 'sine', .08); setTimeout(() => u.remove(), 4200); secret('ufo'); } }); }
document.body.classList.toggle('crt', !!PROG.crt);
document.addEventListener('contextmenu', e => { if (!e.target.closest('#gp')) e.preventDefault(); });
['dragstart', 'gesturestart'].forEach(t => document.addEventListener(t, e => e.preventDefault()));
document.addEventListener('selectstart', e => { const el = e.target.nodeType === 3 ? e.target.parentElement : e.target; if (!el || !el.closest('#gp')) e.preventDefault(); });
window.addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
applyPerf(); preloadSprites(); DESKFX = startFX($('#fx'));
/* kiosk laptop only: if F11/Esc ever drops full screen, the next tap puts it back (skipped while grown-ups are in settings).
   In a normal tab or an <iframe> on the web, full screen is only ever entered from the ⛶ button. */
if (KIOSK) document.addEventListener('pointerdown', e => { if (document.fullscreenElement || e.target.closest('#gp,#gate') || $('#boot')) return; if (window.innerHeight < screen.height - 4) goFull(); }, true);
/* ask the browser to never evict the child's progress, stickers, recordings and photos */
try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}
openDesk();

/* ▼ button + scroll check for the start menu grid */
function smMoreCheck() { const g = $('#smGrid'), m = $('#smMore'); if (!g || !m) return; m.classList.toggle('on', g.scrollHeight - g.clientHeight - g.scrollTop > 8); }
$('#smGrid') && $('#smGrid').addEventListener('scroll', smMoreCheck); window.addEventListener('resize', () => requestAnimationFrame(smMoreCheck));
$('#smMore') && $('#smMore').addEventListener('click', e => { e.stopPropagation(); SFX.tap(); const g = $('#smGrid'); g.scrollBy({ top: g.clientHeight * .8, behavior: 'smooth' }); });
