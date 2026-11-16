/* ═════════ META: picture cards, stickers, closet, lands, mailbox, pet, weekly content ═════════ */

/* ── picture cards: what the host holds up instead of talking ── */
const CARD = {
  wrap: (inner, extra) => `<span class="cd">${inner}${extra ? `<em>${extra}</em>` : ''}</span>`,
  color: (ci, extra) => CARD.wrap(`<i class="cc" style="background:${COLORS[ci]}"></i>`, extra),
  dot: (c, extra) => CARD.wrap(`<i class="cc round" style="background:${c}"></i>`, extra),
  num: (n, extra) => CARD.wrap(`<b class="cn">${n}</b>`, extra),
  letter: (l, extra) => CARD.wrap(`<b class="cn">${l}</b>`, extra),
  text: (t, extra) => CARD.wrap(`<b class="cn sm">${t}</b>`, extra),
  emoji: (e, extra) => CARD.wrap(`<b class="ce">${e}</b>`, extra),
  shape: (si, extra) => CARD.wrap(shapeSvg(si, TT.white, 'cs'), extra)
};
const today = () => new Date().toLocaleDateString('en-CA');
const daysPlayed = () => Object.keys(PROG.days || {}).length;

/* ── extra sprites: pets + baby ── */
Object.assign(EXTRA, {
  egg: { pal: { w: '#F2F2EE', K: '#FF5DA2', B: '#3B62FF' }, base: ['................', '................', '......wwww......', '.....wwwwww.....', '....wwwwwwww....', '....wwKwwwww....', '...wwwwwwwBww...', '...wwKwwwwwww...', '...wwwwwwBwww...', '...wwwwwwwwww...', '...wwwBwwwwww...', '....wwwwwwKw....', '....wwwwwwww....', '.....wwwwww.....', '................', '................'],
    ex: { crack: { 6: '...wwwwkwwwBww..', 7: '...wwKwkkwwwww..', 8: '...wwwwwkKwwww..' } } },
  blob: { pal: { T: '#1FC7B6', D: '#128f83', w: '#F2F2EE', k: '#111', K: '#FF5DA2' }, hat: [8, 3],
    base: ['................', '................', '................', '.....TTTTTT.....', '....TTTTTTTT....', '...TTTTTTTTTT...', '..TTwwTTTTwwTT..', '..TTwkTTTTwkTT..', '.TTTTTTTTTTTTTT.', '.TTTTTKTTKTTTTT.', '.TTTTTTkkTTTTTT.', 'TTTTTTTTTTTTTTTT', 'TTTTTTTTTTTTTTTT', '.TTTTTTTTTTTTTT.', '..DDDDDDDDDDDD..', '................'],
    ex: { blink: { 6: '..TTTTTTTTTTTT..', 7: '..TTkkTTTTkkTT..' }, happy: { 10: '.TTTTTkkkkTTTTT.' }, oops: { 10: '.TTTTTTkTTTTTTT.' }, sleep: { 6: '..TTTTTTTTTTTT..', 7: '..TTkkTTTTkkTT..', 10: '.TTTTTTTTTTTTTT.' } } },
  chick: { pal: { Y: '#FFD60A', O: '#FF8A1F', k: '#111' }, hat: [8, 1],
    base: ['................', '......YYYY......', '.....YYYYYY.....', '....YYYYYYYY....', '....YYkYYkYY....', '....YYYOOYYY....', '...YYYYOOYYYY...', '..YYYYYYYYYYYY..', '.YYYYYYYYYYYYYY.', '.YYYYYYYYYYYYYY.', '.YYYYYYYYYYYYYY.', '..YYYYYYYYYYYY..', '...YYYYYYYYYY...', '.....OO..OO.....', '.....OO..OO.....', '................'],
    ex: { blink: { 4: '....YYYYYYYY....' }, happy: { 6: '...YYYOkkOYYY...' }, sleep: { 4: '....YkkYYkkY....' } } },
  kit: { pal: { P: '#9B5DE5', w: '#F2F2EE', k: '#111', K: '#FF5DA2' }, hat: [8, 3],
    base: ['................', '..P..........P..', '..PP........PP..', '..PPPPPPPPPPPP..', '.PPPPPPPPPPPPPP.', '.PPwwPPPPPPwwPP.', '.PPwkPPPPPPwkPP.', '.PPPPPPKKPPPPPP.', '.PPPPPkPPkPPPPP.', '..PPPPPPPPPPPP..', '...PPPPPPPPPP...', '...PPPPPPPPPP..P', '...PPPPPPPPPP.P.', '...PPPPPPPPPPP..', '...PP..PP..PP...', '................'],
    ex: { blink: { 5: '.PPPPPPPPPPPPPP.', 6: '.PPkkPPPPPPkkPP.' }, happy: { 8: '.PPPPPkkkkPPPPP.' }, sleep: { 5: '.PPPPPPPPPPPPPP.', 6: '.PPkkPPPPPPkkPP.' } } },
  baby: { pal: { B: '#7fb0ff', S: '#F2C49B', k: '#111', K: '#FF9DB8', w: '#F2F2EE', T: '#3B62FF' }, hat: [8, 1],
    base: ['................', '.....BBBBBB.....', '....BBBBBBBB....', '...BBSSSSSSBB...', '...BSSSSSSSSB...', '...BSkSSSSkSB...', '...BSSSSSSSSB...', '...BSKSSSSKSB...', '...BSSSkkSSSB...', '...BBSSSSSSBB...', '..BBBBBBBBBBBB..', '..BwwwwwwwwwwB..', '..BwwwwwwwwwwB..', '..BBBBBBBBBBBB..', '...BB......BB...', '................'],
    ex: { blink: { 5: '...BSSSSSSSSB...' }, happy: { 8: '...BSSkkkkSSB...' }, talk: { 8: '...BSSkkkkSSB...' }, oops: { 6: '...BSTSSSSTSB...' }, sleep: { 5: '...BSkkSSkkSB...', 8: '...BSSSSSSSSB...' } } }
});

/* ═════════ STICKERS ═════════ */
PROG.stickers = PROG.stickers || {}; PROG.hats = PROG.hats || ['party', 'cap', 'flower']; PROG.outfit = PROG.outfit || {};
PROG.lands = PROG.lands || ['home']; PROG.newApps = PROG.newApps || []; PROG.days = PROG.days || {}; PROG.mail = PROG.mail || {}; PROG.res = PROG.res || {};
const STK_PAGES = Object.keys(THEMES);
const stickerCount = th => THEMES[th].set.filter(e => PROG.stickers[th + ':' + e]).length;
function rollSticker() {
  const wk = weekTheme(), pool = STK_PAGES.filter(k => !THEMES[k].seasonal || k === wk);
  const th = Math.random() < .45 ? wk : pick(pool), e = pick(THEMES[th].set);
  return { th, e, shiny: Math.random() < .08 };
}
function giveStickers(n = 3) {
  const got = [];
  for (let i = 0; i < n; i++) {
    const s = rollSticker(), k = s.th + ':' + s.e, had = PROG.stickers[k];
    PROG.stickers[k] = { n: (had ? had.n : 0) + 1, shiny: !!(s.shiny || (had && had.shiny)) }; s.isNew = !had; got.push(s);
    if (!had && stickerCount(s.th) === THEMES[s.th].set.length) { const h = THEMES[s.th].hat; if (h && !PROG.hats.includes(h)) { PROG.hats.push(h); s.hat = h; } }
  }
  saveProg(); return got;
}
function showPack(list, done) {
  const o = $('#pack'); o.innerHTML = `<div class="packCard"><div class="strip" style="--c:var(--tt-yellow)">★ STICKERS ★</div><div class="packRow"></div><div class="packHat"></div></div>`; o.classList.add('show');
  const row = $('.packRow', o);
  list.forEach((s, i) => setTimeout(() => { const d = mk('div', 'stk big' + (s.shiny ? ' shiny' : '') + (s.isNew ? ' new' : ''), `<b>${s.e}</b>`); d.style.setProperty('--c', [TT.green, TT.blue, TT.red, TT.yellow][i % 4]); row.appendChild(d); tone(PENTA[5 + i], .3, 'triangle', .18); if (s.shiny) SFX.chime(); }, 300 + i * 450));
  const hat = list.find(s => s.hat); if (hat) setTimeout(() => { $('.packHat', o).innerHTML = `${charHTML(PROG.buddy || 'robo', 'dance')}<span>🎩 NEW HAT!</span>`; PROG.outfit[PROG.buddy || 'robo'] = hat.hat; saveProg(); SFX.chime(); }, 300 + list.length * 450);
  let closed = false; const close = () => { if (closed) return; closed = true; o.classList.remove('show'); if (done) done(); };
  setTimeout(() => { o.onclick = close; }, 600 + list.length * 450); setTimeout(close, 4200 + list.length * 450);
}

/* ═════════ LANDS (the adventure map) ═════════ */
const LANDS = [
  { id: 'home', name: 'HOME', e: '🏠', c: TT.white, stars: 0, days: 0, apps: ['runner', 'rocket', 'fishing', 'fireworks', 'bubbles', 'paint', 'abc', 'count', 'shapes', 'memory', 'blocks', 'space', 'piano', 'drums', 'talk', 'draw', 'bowling', 'basketball', 'cook', 'keyparty'], at: [6, 84] },
  { id: 'jungle', name: "DINO'S JUNGLE", e: '🌴', c: TT.green, stars: 150, days: 3, apps: ['trucks', 'moles', 'zoo', 'flush', 'darts', 'gallery'], at: [20, 84] },
  { id: 'school', name: "HOOT'S SCHOOL", e: '🏫', c: TT.yellow, stars: 350, days: 6, apps: ['spell', 'mix', 'pattern', 'ispy', 'who', 'code', 'blaster'], at: [34, 84] },
  { id: 'stadium', name: 'BIG STADIUM', e: '🏟️', c: TT.green, stars: 600, days: 9, apps: ['soccer', 'duo', 'hide', 'skate'], at: [48, 84] },
  { id: 'golf', name: 'GOLF ISLAND', e: '⛳', c: TT.teal, stars: 900, days: 13, apps: ['minigolf', 'golf2', 'garage'], at: [62, 84] },
  { id: 'port', name: 'SPACE PORT', e: '🛸', c: TT.red, stars: 1250, days: 17, apps: ['drive', 'spin', 'kart', 'foxhunt'], at: [76, 84] },
  { id: 'beach', name: 'BEAT BEACH', e: '🏖️', c: TT.orange, stars: 1650, days: 22, apps: ['rhythm', 'beats', 'copy', 'band', 'sing'], at: [90, 84] },
  { id: 'lab', name: 'ROBO LAB', e: '🧪', c: TT.blue, stars: 2100, days: 27, apps: ['story', 'quiz', 'sayit', 'showme', 'lab'], at: [90, 52] },
  { id: 'studio', name: 'TV STUDIO', e: '🎬', c: TT.pink, stars: 2600, days: 33, apps: ['musicmaker', 'video', 'stickermaker', 'mischief'], at: [76, 52] },
  { id: 'cooktown', name: 'COOK TOWN', e: '🍰', c: TT.orange, stars: 3150, days: 40, apps: ['kitchen'], hat: 'chef', at: [62, 52] },
  { id: 'peak', name: 'SNOW PEAK', e: '🏔️', c: TT.white, stars: 3800, days: 48, apps: ['town', 'puzzles', 'colorhunt', 'mirror', 'snowboard'], hat: 'beanie', at: [48, 52] },
  { id: 'castle', name: 'RAINBOW CASTLE', e: '🏰', c: TT.pink, stars: 4500, days: 57, apps: ['fleet'], hat: 'crown', at: [34, 52] },
  { id: 'raceway', name: 'RACEWAY', e: '🏁', c: TT.red, stars: 5300, days: 67, apps: ['marble'], hat: 'helmet', at: [20, 52] },
  { id: 'moon', name: 'MOON BASE', e: '🌙', c: TT.purple, stars: 6200, days: 78, apps: [], hat: 'propeller', at: [6, 52] },
  { id: 'volcano', name: 'VOLCANO ISLAND', e: '🌋', c: TT.red, stars: 7200, days: 92, apps: [], hat: 'viking', at: [6, 20] },
  { id: 'sky', name: 'SKY CITY', e: '☁️', c: TT.teal, stars: 8300, days: 108, apps: [], hat: 'pirate', at: [22, 20] },
  { id: 'stars', name: 'STAR GARDEN', e: '✨', c: TT.yellow, stars: 9500, days: 125, apps: [], hat: 'grad', at: [38, 20] },
  { id: 'dream', name: 'DREAM WORLD', e: '🦄', c: TT.purple, stars: 11000, days: 145, apps: [], hat: 'bunny', at: [54, 20] },
  { id: 'candy', name: 'CANDY CLOUDS', e: '🍭', c: TT.pink, stars: 0, days: 0, secrets: 6, apps: ['disco'], hat: 'bow', at: [80, 18] }
];
const LBY = Object.fromEntries(LANDS.map(l => [l.id, l]));
const landOpen = l => PROG.lands.includes(l.id) || (l.secrets ? Object.keys(PROG.secrets || {}).length >= l.secrets : PROG.stars >= l.stars);
const landOf = id => LANDS.find(l => l.apps.includes(id));
const appUnlocked = id => cfg.unlockAll || !landOf(id) || landOpen(landOf(id));
function checkLands() {
  const fresh = LANDS.filter(l => !PROG.lands.includes(l.id) && landOpen(l));
  fresh.forEach(l => { PROG.lands.push(l.id); PROG.newApps.push(...l.apps); if (l.hat && !PROG.hats.includes(l.hat)) PROG.hats.push(l.hat); });
  if (fresh.length) saveProg(); return fresh;
}

/* ═════════ SECRETS (easter eggs) ═════════ */
const SECRETS = {
  konami: ['🕹️', 'SECRET CODE'], nameword: ['🔤', 'SECRET WORD'], disco: ['🪩', 'DISCO CLOCK'], ufo: ['🛸', 'UFO'], castorder: ['🎶', 'BAND ROLL CALL'], mash: ['⌨️', 'KEY SMASHER'],
  petlove: ['💖', 'BEST FRIEND'], turkey: ['🦃', 'TURKEY (3 STRIKES)'], holeinone: ['⛳', 'HOLE IN ONE'], rainbow: ['🌈', 'RAINBOW RACER'], chef: ['👨‍🍳', 'LITTLE CHEF'], bighelper: ['🫶', 'BIG HELPER']
};
PROG.secrets = PROG.secrets || {};
/* secrets found on the pre-release build keep counting under their new names */
[[KEY_PREFIX + 'word', 'nameword'], ['bigbrother', 'bighelper']].forEach(([a, b]) => { if (PROG.secrets[a]) { PROG.secrets[b] = PROG.secrets[b] || PROG.secrets[a]; delete PROG.secrets[a]; } });
let secretQ = [];
function secret(id) {
  if (!SECRETS[id] || PROG.secrets[id]) return; PROG.secrets[id] = today(); PROG.stars += 10; saveProg(); secretQ.push(id); if (secretQ.length === 1) showSecret();
}
function showSecret() {
  const id = secretQ[0]; if (!id) return; const o = $('#pack'); if (o.classList.contains('show')) { setTimeout(showSecret, 1500); return; }
  const [e, name] = SECRETS[id], n = Object.keys(PROG.secrets).length;
  o.innerHTML = `<div class="packCard secret"><div class="strip" style="--c:var(--tt-yellow)">🗝️ SECRET FOUND! 🗝️</div><div class="landBig">${e}</div><div class="landName">${name}</div><div class="secretCount">🗝️ ${n} / ${Object.keys(SECRETS).length} · ★ +10</div></div>`;
  o.classList.add('show'); [523, 784, 1047, 1568, 2093].forEach((f, i) => tone(f, .25, 'square', .05, i * .09)); SFX.chime(); $$('.starCount').forEach(s => s.textContent = PROG.stars);
  let closed = false; const close = () => { if (closed) return; closed = true; o.classList.remove('show'); o.onclick = null; secretQ.shift(); if (typeof renderTaskbar === 'function') renderTaskbar(); if (secretQ.length) setTimeout(showSecret, 400); };
  setTimeout(() => { o.onclick = close; }, 700); setTimeout(close, 4500);
}

/* ═════════ WEEKLY CONTENT (Claude makes it; built-ins fill in offline) ═════════ */
const LETTERS = {
  robo: ['Beep boop! I built a tower today. Can you build one too? 🧱', 'Robo found a shiny star! ⭐ Let\'s find more!', 'Beep! Did you know robots love music? 🎵'],
  dino: ['RAWR! I ran super fast today! 🏃 Can you run fast too?', 'Dino ate a BIG salad. 🥗 Crunch crunch!', 'Rawr! Let\'s stomp like dinosaurs! 🦖'],
  hoot: ['Hoo hoo! Can you count to five? 1 2 3 4 5 🖐️', 'Hoot read a book about the ocean. 🐳 So many fish!', 'Hoo! What color is the sky today? 🌤️'],
  foxy: ['Hi! I flew my rocket to the moon! 🚀🌙', 'Foxy found a seashell at the beach! 🐚', 'Let\'s explore! What can you find outside? 🔎']
};
function weekData() { try { const w = JSON.parse(localStorage.getItem(KEYS.week) || '{}'); if (w.key === weekNo() + lang) return w; } catch (e) {} return null; }
async function makeWeek() {
  if (weekData()) return; const th = THEMES[weekTheme()];
  try {
    if (!(await chatBackend())) return;
    const sys = `You create one week of content for a toddler app. The child is a bright ${AGE()} ${KIDW()} who speaks ${kidLangs()}. The week's theme is ${th.name.toLowerCase()} ${th.e}. Write in ${T().name}.
The cast: Robo (blue robot), Dino (silly green dinosaur), Hoot (wise yellow owl), Foxy (adventurous orange fox).
${KIDR()}
Reply with ONLY JSON:
{"story":{"title":"…","parts":["3–4 short sentences","…","…"]},
 "quiz":[{"q":"short spoken question","choices":["emoji","emoji","emoji"],"answer":0}, … 8 total],
 "letters":[{"from":"robo|dino|hoot|foxy","text":"1–2 sentence friendly note with one emoji"}, … 7 total],
 "missions":[{"icons":"2–4 emoji that show the task","text":"a real-world mini mission for today, e.g. find 3 red things"}, … 7 total]}`;
    const j = parseJSON(await chat([{ role: 'user', content: 'Make this week.' }], sys, 2500));
    if (j && j.quiz) localStorage.setItem(KEYS.week, JSON.stringify({ key: weekNo() + lang, theme: weekTheme(), ...j }));
  } catch (e) { console.warn('week', e); }
}
/* real-world missions, built in — shown as pictures */
function builtinMission(seed) {
  const c = seed % 7, n = 2 + seed % 3, th = THEMES[weekTheme()];
  const list = [
    { icons: `🔎 ${'🟥🟦🟩🟨🟧🟪🟥'[0] ? ['🟥', '🟦', '🟩', '🟨', '🟧', '🟪', '🟥'][c].repeat(n) : ''}`, text: `Find ${n} ${L.en.colors[[0, 4, 3, 2, 1, 5, 0][c]]} things!` },
    { icons: `🦘 ${'⬆️'.repeat(n + 2)}`, text: `Jump ${n + 2} times!` }, { icons: '🤗 ❤️', text: 'Give someone a big hug!' },
    { icons: '🧱 🧱 🧱 🏰', text: 'Build a tall tower!' }, { icons: `✏️ ${th.e}`, text: `Draw a picture of ${th.name.toLowerCase()}!` },
    { icons: '🦶 🔢', text: 'Count your toes!' }, { icons: '💃 🎵', text: 'Have a dance party!' }, { icons: '🧸 📦 ✨', text: 'Help put the toys away!' },
    { icons: '🔎 ⚪', text: 'Find something round!' }, { icons: '🐮 🔊', text: 'Make your loudest animal sound!' }, { icons: '🌳 👀', text: 'Look out the window. What do you see?' }, { icons: '🍎 🥕', text: 'Eat something crunchy!' }];
  return list[seed % list.length];
}
function todaysMail() {
  const d = new Date(), seed = Math.floor(d / 864e5), w = weekData(), dow = d.getDay(), kind = ['pack', 'mission', 'letter', 'mission', 'pack', 'letter', 'mission'][dow];
  if (kind === 'mission') return { kind, ...(w && w.missions && w.missions[dow % w.missions.length] || builtinMission(seed)) };
  if (kind === 'letter') { const l = w && w.letters && w.letters[dow % w.letters.length]; const from = l && CAST[l.from] ? l.from : CAST_IDS[seed % 4]; return { kind, from, text: l ? l.text : pick(LETTERS[from]) }; }
  return { kind };
}
const mailWaiting = () => PROG.mail.date !== today();

/* ═════════ SYSTEM APPS ═════════ */

/* MAP — the adventure map */
game('map', 'me', '🗺️', g => {
  const H = g.host(PROG.buddy || 'robo');
  g.stage.innerHTML = `<div class="map"><svg class="mapPath" viewBox="0 0 100 100" preserveAspectRatio="none"></svg><div class="mapNodes"></div><div class="mapPanel"></div></div>`;
  const map = $('.map', g.stage), nodes = $('.mapNodes', g.stage), panel = $('.mapPanel', g.stage), svg = $('.mapPath', g.stage);
  const pts = LANDS.filter(l => !l.secrets).map(l => l.at); svg.innerHTML = `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="#5a5a5a" stroke-width="4" stroke-dasharray="10 9" vector-effect="non-scaling-stroke"/>`;
  for (let i = 0; i < 60; i++) { const b = mk('i', 'terrain'); b.style.cssText = `left:${(i * 37) % 100}%;top:${(i * 53 + 7) % 92}%;background:${pick(['#0d3a1e', '#0b2240', '#1a1a1a', '#2a1a0a'])};width:${rand(2, 6)}vmin;height:${rand(2, 6)}vmin`; map.prepend(b); }
  let far = 0;
  LANDS.forEach((l, i) => {
    const open = landOpen(l); if (open && !l.secrets) far = i;
    const b = mk('button', 'land' + (open ? ' open' : '') + (l.secrets ? ' secretLand' : ''), `<span class="le">${open ? l.e : l.secrets ? '❓' : '🔒'}</span><span class="ln">${open ? l.name : l.secrets ? '🗝️ × ' + l.secrets : '★ ' + l.stars}</span>`);
    b.style.left = l.at[0] + '%'; b.style.top = l.at[1] + '%'; b.style.setProperty('--c', l.c);
    b.addEventListener('click', () => { SFX.tap(); if (!open) { H.mood('oops'); H.bubble(l.secrets ? `🗝️ ${Object.keys(PROG.secrets).length} / ${l.secrets}` : `🔒 ★ ${PROG.stars} / ${l.stars}`); retrigger(b, 'shake'); return; } showLand(l); walk(i); });
    nodes.appendChild(b);
  });
  const me = mk('div', 'mapMe', charHTML(PROG.buddy || 'robo', 'hop')); nodes.appendChild(me);
  const walk = i => { me.style.left = LANDS[i].at[0] + '%'; me.style.top = LANDS[i].at[1] + '%'; };
  walk(far);
  function showLand(l) {
    panel.innerHTML = `<div class="strip" style="--c:${l.c}"><span>${l.e} ${l.name}</span><span>★ ${l.stars}</span></div><div class="lpApps"></div>`;
    const box = $('.lpApps', panel), apps = l.id === 'home' ? l.apps : l.apps;
    apps.filter(id => GBY[id] && !isHidden(id)).forEach(id => { const a = mk('button', 'smApp', `<span class="ai">${GBY[id].icon}</span><span class="an">${gname(id)}</span>`); a.style.setProperty('--c', l.c); a.addEventListener('click', () => { SFX.tap(); openGame(id); }); box.appendChild(a); });
    if (!apps.length) box.innerHTML = `<div class="lpHat">${charHTML(PROG.buddy || 'robo', 'dance')}<span>🎩 ${l.hat ? 'NEW HAT!' : ''} · 🌟 STICKERS</span></div>`;
    panel.classList.add('on');
  }
  const next = LANDS.find(l => !landOpen(l) && !l.secrets);
  H.bubble(next ? `★ ${PROG.stars} / ${next.stars} → ${next.e}` : '★ ★ ★');
});

/* STICKERS — the album */
game('stickers', 'me', '🌟', g => {
  const H = g.host(PROG.buddy || 'robo'); let page = weekTheme();
  g.stage.innerHTML = `<div class="albumTabs"></div><div class="album card"><div class="strip"><span class="aname"></span><span class="acount"></span></div><div class="agrid"></div><div class="areward"></div></div>`;
  const tabs = $('.albumTabs', g.stage);
  const render = () => {
    tabs.innerHTML = ''; [...STK_PAGES, 'secrets', 'mine'].forEach(k => { const t = THEMES[k], b = mk('button', 'atab' + (k === page ? ' cur' : ''), k === 'mine' ? '🖍️' : k === 'secrets' ? '🗝️' : t.e); if (t && stickerCount(k) === t.set.length) b.classList.add('done'); b.addEventListener('click', () => { SFX.tap(); page = k; render(); }); tabs.appendChild(b); });
    const grid = $('.agrid', g.stage); grid.innerHTML = '';
    if (page === 'secrets') {
      const ks = Object.keys(SECRETS); $('.aname', g.stage).textContent = '🗝️ SECRETS'; $('.acount', g.stage).textContent = `${ks.filter(k => PROG.secrets[k]).length} / ${ks.length}`; $('.areward', g.stage).innerHTML = `<span>${landOpen(LBY.candy) ? '✔' : '🔒'}</span><b style="font-size:5vmin">🍭</b><span style="font-size:2.4vmin">× 6 🗝️</span>`;
      ks.forEach((k, i) => { const f = PROG.secrets[k], d = mk('button', 'stk' + (f ? ' shiny' : ' empty'), `<b>${f ? SECRETS[k][0] : '❓'}</b>`); d.style.setProperty('--c', [TT.green, TT.blue, TT.red, TT.yellow][i % 4]); d.addEventListener('click', () => { if (f) { retrigger(d, 'pop'); H.bubble(SECRETS[k][1]); } else retrigger(d, 'shake'); }); grid.appendChild(d); });
      return;
    }
    if (page === 'mine') {
      $('.aname', g.stage).textContent = '🖍️ MY STICKERS'; $('.acount', g.stage).textContent = ''; $('.areward', g.stage).innerHTML = '';
      IDB.all('media').then(list => { const mine = list.filter(([k, v]) => v && v.type === 'sticker').reverse(); if (!mine.length) grid.innerHTML = '<div class="aempty">🎨 → ⭐</div>'; mine.forEach(([k, v]) => { const d = mk('div', 'stk mine'); d.style.backgroundImage = `url(${v.url})`; grid.appendChild(d); }); });
      return;
    }
    const t = THEMES[page]; $('.aname', g.stage).textContent = `${t.e} ${t.name}`; $('.acount', g.stage).textContent = `${stickerCount(page)} / ${t.set.length}`;
    t.set.forEach((e, i) => { const s = PROG.stickers[page + ':' + e], d = mk('button', 'stk' + (s ? '' : ' empty') + (s && s.shiny ? ' shiny' : ''), `<b>${e}</b>${s && s.n > 1 ? `<i>×${s.n}</i>` : ''}`); d.style.setProperty('--c', [TT.green, TT.blue, TT.red, TT.yellow][i % 4]); d.addEventListener('click', () => { if (s) { retrigger(d, 'pop'); tone(PENTA[i % 10], .2, 'triangle', .15); H.mood('happy', 500); } else { retrigger(d, 'shake'); } }); grid.appendChild(d); });
    $('.areward', g.stage).innerHTML = t.hat ? `<span>${stickerCount(page) === t.set.length ? '✔' : '🔒'}</span>${charHTML(PROG.buddy || 'robo', '', t.hat)}` : '';
  };
  render(); H.bubble(`🌟 ${Object.keys(PROG.stickers).length}`);
});

/* CLOSET — dress up the cast */
game('closet', 'me', '🎩', g => {
  let who = PROG.buddy || 'robo'; const H = g.host(who);
  g.stage.innerHTML = `<div class="closet"><div class="model"></div><div class="closetR"><div class="who"></div><div class="hats"></div></div></div>`;
  const model = $('.model', g.stage), hats = $('.hats', g.stage), whoBox = $('.who', g.stage);
  const render = () => {
    model.innerHTML = charHTML(who, 'big'); whoBox.innerHTML = '';
    CAST_IDS.forEach(n => { const b = mk('button', 'whoBtn' + (n === who ? ' sel' : ''), charHTML(n)); b.addEventListener('click', () => { who = n; SFX.tap(); render(); }); whoBox.appendChild(b); });
    hats.innerHTML = '';
    [['auto', '🗓️'], ['none', '✖'], ...Object.keys(HATS).map(h => [h, null])].forEach(([h, ic]) => {
      const owned = ic || PROG.hats.includes(h), cur = (PROG.outfit[who] || 'auto') === h;
      const b = mk('button', 'hatBtn' + (cur ? ' sel' : '') + (owned ? '' : ' locked'), ic ? `<b>${ic}</b>` : owned ? spriteSVG(who, 'idle', h) : '<b>🔒</b>');
      b.addEventListener('click', () => { if (!owned) { retrigger(b, 'shake'); SFX.bad(); return; } if (h === 'auto') delete PROG.outfit[who]; else PROG.outfit[who] = h; saveProg(); SFX.good(); render(); moodFn($('.model .char', g.stage), 'happy'); });
      hats.appendChild(b);
    });
  };
  render(); H.bubble('🎩 👑 🧢');
});

/* MAILBOX — one surprise a day */
game('mailbox', 'me', '📬', g => {
  const H = g.host(PROG.buddy || 'robo'), m = todaysMail(), fresh = mailWaiting();
  g.stage.innerHTML = `<div class="mail"><button class="envelope${fresh ? ' fresh' : ''}"><span>${fresh ? '✉️' : '📭'}</span></button><div class="letter"></div></div>`;
  const env = $('.envelope', g.stage), letter = $('.letter', g.stage);
  const open = () => {
    if (env.classList.contains('opened')) return; env.classList.add('opened'); SFX.chime();
    const first = mailWaiting(); PROG.mail = { date: today(), done: PROG.mail.date === today() ? PROG.mail.done : false }; saveProg(); renderTaskbar();
    if (m.kind === 'pack') { letter.innerHTML = `<div class="lt">🎁</div>`; if (first) showPack(giveStickers(3)); else letter.innerHTML = '<div class="lt">🎁 ✔</div>'; H.happy(); return; }
    if (m.kind === 'letter') { letter.innerHTML = `<div class="lfrom">${charHTML(m.from, 'big')}</div><div class="ltext">${m.text}</div>`; const el = $('.lfrom .char', letter); say(m.text, lang, null, m.from, el); return; }
    letter.innerHTML = `<div class="lmission"><div class="li">${m.icons}</div><div class="ltext">${m.text}</div><button class="slab done">✔</button></div>`; H.say(m.text, 'happy', lang, true);
    const d = $('.done', letter); if (PROG.mail.done) d.classList.add('used');
    d.addEventListener('click', () => { if (PROG.mail.done) return; PROG.mail.done = true; saveProg(); d.classList.add('used'); g.star(3); SFX.chime(); H.happy(); petLove(1); });
  };
  env.addEventListener('click', open); if (!fresh) open();
});

/* PET — hatch it, feed it, play with it; grows over weeks */
PROG.pet = PROG.pet || null;
function petLove(n) { if (!PROG.pet) return; PROG.pet.hearts = clamp((PROG.pet.hearts || 3) + n, 0, 5); saveProg(); }
function petStage(p) { if (!p.species) return 'egg'; const d = (p.visits || []).length; return d >= 40 ? 'super' : d >= 7 ? 'big' : 'baby'; }
game('pet', 'me', '🥚', g => {
  const H = g.host(PROG.buddy || 'robo');
  if (!PROG.pet) PROG.pet = { taps: 0, hearts: 3, visits: [], last: Date.now() };
  const p = PROG.pet;
  const hrs = (Date.now() - (p.last || Date.now())) / 36e5; if (hrs > 8) p.hearts = Math.max(2, (p.hearts || 3) - Math.floor(hrs / 8)); p.last = Date.now();
  if (p.species && !p.visits.includes(today())) p.visits.push(today()); saveProg();
  g.stage.innerHTML = `<div class="petRoom"><div class="hearts"></div><div class="petBox"></div><div class="petFx"></div></div><div class="bbar petBar"></div>`;
  const box = $('.petBox', g.stage), hearts = $('.hearts', g.stage), fx = $('.petFx', g.stage), bar = $('.petBar', g.stage), room = $('.petRoom', g.stage);
  const draw = (ex = 'idle') => { const st = petStage(p), n = p.species || 'egg', sz = { egg: 26, baby: 22, big: 34, super: 38 }[st]; box.innerHTML = charHTML(n, 'pet', st === 'super' ? 'crown' : null); const el = $('.char', box); el.style.width = el.style.height = sz + 'vmin'; if (ex !== 'idle') { el._mood = ex; el._moodUntil = performance.now() + (ex === 'sleep' || ex === 'crack' ? 1e12 : 1400); el._ex = ex; el.innerHTML = elSVG(el, ex); } hearts.innerHTML = '❤️'.repeat(p.hearts || 0) + '🤍'.repeat(5 - (p.hearts || 0)); };
  const float = (e, n = 5) => { for (let i = 0; i < n; i++) { const s = mk('span', 'floaty', e); s.style.left = rand(30, 70) + '%'; s.style.animationDelay = (i * .12) + 's'; fx.appendChild(s); setTimeout(() => s.remove(), 1800); } };
  const act = (e, sound, ex = 'happy') => { if (!p.species) return; float(e); sound(); p.care = (p.care || 0) + 1; if (p.care >= 50) secret('petlove'); petLove(1); draw(ex); retrigger($('.char', box), 'hop'); g.star(1); setTimeout(() => draw(), 1400); };
  const actions = [['🍎', () => [523, 659, 784].forEach((f, i) => tone(f, .12, 'square', .05, i * .1))], ['🛁', () => noise(.6, .2, 'bandpass', 1200)], ['⚽', () => SFX.boing()], ['🎵', () => [392, 440, 494, 523].forEach((f, i) => tone(f, .25, 'triangle', .15, i * .2))], ['💤', null]];
  actions.forEach(([e, snd]) => { const b = mk('button', 'swatch big', e); b.addEventListener('click', () => {
    if (e === '💤') { room.classList.toggle('night'); draw(room.classList.contains('night') ? 'sleep' : 'idle'); if (room.classList.contains('night')) [523, 392, 330, 262].forEach((f, i) => tone(f, .6, 'sine', .08, i * .4)); return; }
    room.classList.remove('night'); act(e, snd); }); bar.appendChild(b); });
  g.on(box, 'click', () => {
    if (!p.species) { p.taps++; draw(p.taps > 2 ? 'crack' : 'idle'); retrigger($('.char', box), 'shake'); SFX.pop(1.3); if (p.taps >= 4) { p.species = pick(['blob', 'chick', 'kit']); p.visits = [today()]; p.born = today(); saveProg(); SFX.chime(); float('✨', 10); draw('happy'); H.happy(); } saveProg(); return; }
    act('❤️', () => SFX.boing());
  });
  draw(); H.bubble(p.species ? '❤️' : '🥚 👆👆👆');
});
