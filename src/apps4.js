/* ═════════ NEW APPS · part 4 — bedtime, family, baby, my TV, my games ═════════ */
const LULLABY = 'E:1 G:1 C\':2 B:1 A:1 G:2 E:1 F:1 G:2 C:1 D:1 E:2 E:1 G:1 C\':2 B:1 A:1 G:2 A:1 G:1 F:1 E:1 D:3';
function musicBox(g, notes = LULLABY, bpm = 60, loop = true) {
  const list = notes.split(' ').map(t => { const [n, d] = t.split(':'); return [noteF(n), +(d || 1)]; }); let i = 0, on = true;
  const step = () => { if (!on || !g.alive()) return; const [f, d] = list[i]; tone(f * 2, d * 60 / bpm * 1.2, 'sine', .07); tone(f * 4, .25, 'sine', .015); i++; if (i >= list.length) { if (!loop) { on = false; return; } i = 0; } g.after(d * 60000 / bpm, step); };
  step(); return { stop: () => { on = false; }, get on() { return on; } };
}
const sleepChar = el => { el._mood = 'blink'; el._moodUntil = Infinity; el._ex = 'blink'; el.innerHTML = spriteSVG(el.dataset.c, 'blink'); };

/* BEDTIME — say good night to the cast, light the stars, soft music box */
game('bedtime', 'me', '🌙', g => {
  const H = g.host('hoot'); let asleep = 0, mb = null, dim = 0;
  g.stage.classList.add('col'); g.stage.innerHTML = `<div class="night"><div class="nStars"></div><button class="moon">🌙</button><div class="beds"></div><div class="nDim"></div></div>`;
  const night = $('.night', g.stage), stars = $('.nStars', g.stage), beds = $('.beds', g.stage), moon = $('.moon', g.stage), dimEl = $('.nDim', g.stage);
  const GN = { en: n => `Good night, ${n}!`, es: n => `¡Buenas noches, ${n}!`, fr: n => `Bonne nuit, ${n} !`, pt: n => `Boa noite, ${n}!`, ja: n => `おやすみ、${n}！`, zh: n => `晚安，${n}！` }, GN0 = { en: 'Good night!', es: '¡Buenas noches!', fr: 'Bonne nuit !', pt: 'Boa noite!', ja: 'おやすみ！', zh: '晚安！' };
  CAST_IDS.forEach(n => { const b = mk('button', 'bed', `${charHTML(n)}<span class="blanket"></span><span class="zz"></span>`); b.addEventListener('click', () => { if (b.classList.contains('zzz')) return; b.classList.add('zzz'); sleepChar($('.char', b)); $('.zz', b).textContent = 'z z z'; [392, 330, 262].forEach((f, i) => tone(f * CAST[n].pitch, .4, 'sine', .08, i * .25)); say((GN[lang] || GN.en)(n.toUpperCase()), lang, null, n, $('.char', b)); asleep++; if (asleep === 4) g.after(1500, allAsleep); }); beds.appendChild(b); });
  g.on(night, 'pointerdown', e => { if (e.target.closest('.bed,.moon')) return; const r = night.getBoundingClientRect(), s = mk('i', 'nStar'); s.style.left = (e.clientX - r.left) / r.width * 100 + '%'; s.style.top = (e.clientY - r.top) / r.height * 100 + '%'; stars.appendChild(s); tone(PENTA[randi(5, 9)] * 2, .6, 'sine', .06); if (stars.children.length > 40) stars.firstChild.remove(); });
  moon.addEventListener('click', () => { moon.classList.toggle('glow'); moon.textContent = moon.classList.contains('glow') ? '🌕' : '🌙'; tone(1047, .8, 'sine', .06); });
  function allAsleep() { const n = KID_NAME(); H.say(n ? (GN[lang] || GN.en)(n) : (GN0[lang] || GN0.en), 'talk', lang); g.star(2); SFX.chime(); dim = .01; }
  g.loop(dt => { if (dim) { dim = Math.min(.7, dim + dt * .02); dimEl.style.opacity = dim; } });
  mb = musicBox(g); g.tool('🎵', b => { if (mb.on) { mb.stop(); b.classList.remove('sel'); } else { mb = musicBox(g); b.classList.add('sel'); } }).classList.add('sel');
  for (let i = 0; i < 18; i++) { const s = mk('i', 'nStar dim'); s.style.left = rand(2, 98) + '%'; s.style.top = rand(2, 50) + '%'; s.style.animationDelay = rand(0, 3) + 's'; stars.appendChild(s); }
  H.bubble('😴 👆');
});

/* FAMILY — photos the grown-ups added (kept on this laptop only) */
game('who', 'learn', '👪', g => {
  const H = g.host('foxy'); let photos = [], busy = false;
  g.stage.innerHTML = '<div class="whoBox"></div>'; const box = $('.whoBox', g.stage);
  const nameSay = p => { const clip = clipFor(p.name, lang) || clipFor(p.name, 'en'); if (clip) playURL(clip, H.el, null, sayTok); };
  function reveal() {
    const p = pick(photos), n = 9; busy = false;
    box.innerHTML = `<div class="tv whoTv"><div class="art" style="background-image:url(${p.url})"></div><div class="tiles">${'<i></i>'.repeat(n)}</div></div><div class="whoName"></div>`; let left = n;
    $$('.tiles i', box).forEach((t, i) => { t.style.background = COLORS[i % 7]; t.addEventListener('pointerdown', () => { if (t.classList.contains('off')) return; t.classList.add('off'); tone(PENTA[i % 10], .15, 'triangle', .14); if (--left === 0) { $('.whoName', box).textContent = p.name; $('.whoName', box).classList.add('pop'); SFX.chime(); H.happy(); g.star(1); nameSay(p); g.after(2600, () => { if (g.progress()) g.levelUp(); else reveal(); }); } }); });
    H.bubble('👆 👆 👆');
  }
  function find() {
    const opts = shuffle(photos).slice(0, Math.min(3, photos.length)), p = pick(opts); busy = false;
    box.innerHTML = `<div class="whoAsk">${p.name} ?</div><div class="whoRow"></div>`; nameSay(p); H.say(p.name + '?', 'talk', lang, 0, CARD.text(p.name, '🔎'));
    opts.forEach(o => { const b = mk('button', 'whoPic'); b.style.backgroundImage = `url(${o.url})`; b.addEventListener('click', () => { if (busy) return; if (o === p) { busy = true; b.classList.add('right'); SFX.good(); H.happy(); g.star(1); g.after(1800, () => { if (g.progress()) g.levelUp(); else find(); }); } else { retrigger(b, 'shake'); SFX.bad(); H.mood('oops'); } }); $('.whoRow', box).appendChild(b); });
  }
  IDB.all('photos').then(list => {
    if (!g.alive()) return; photos = list.map(([, v]) => v).filter(v => v && v.url);
    if (!photos.length) { box.innerHTML = `<div class="emptyNote"><b>📷 👨‍👩‍👦 ⚙️</b><span>Grown-ups: add family photos in settings (hold Hoot the owl on the home screen for 3 seconds).</span></div>`; return; }
    g.levels(photos.length >= 2 ? 2 : 1, lv => { g.meter(lv === 1 ? 4 : 5); lv === 1 ? reveal() : find(); });
  });
});

/* BABY — the helper corner: what does the baby need? (a grown-up can add the baby's name) */
game('baby', 'me', '👶', g => {
  const H = g.host('hoot'), nm = cfg.profile.baby || '';
  g.stage.innerHTML = `<div class="nursery"><div class="need"></div><div class="crib"><div class="babyBox">${charHTML('baby', 'big')}</div><span class="crName">${nm ? nm.toUpperCase() : '👶'}</span></div><div class="nFx"></div></div><div class="bbar babyBar"></div>`;
  const crib = $('.crib', g.stage), el = $('.babyBox .char', g.stage), need = $('.need', g.stage), fx = $('.nFx', g.stage), bar = $('.babyBar', g.stage);
  let want = null, cry = null, asleep = false, rock = 0;
  const float = (e, n = 4) => { for (let i = 0; i < n; i++) { const s = mk('span', 'floaty', e); s.style.left = rand(35, 65) + '%'; s.style.animationDelay = i * .15 + 's'; fx.appendChild(s); setTimeout(() => s.remove(), 1800); } };
  const giggle = () => [880, 988, 1175, 988].forEach((f, i) => tone(f, .1, 'sine', .08, i * .09));
  const ACTS = { '🍼': () => { [0, .25, .5].forEach(d => tone(300, .12, 'sine', .08, d)); float('🍼', 2); }, '🧸': () => { SFX.clatter(); float('🧸', 2); }, '🎵': () => musicBox(g, LULLABY.split(' ').slice(0, 8).join(' '), 80, false), '🙈': () => { crib.classList.add('peek'); g.after(1200, () => { crib.classList.remove('peek'); giggle(); float('😄', 3); }); }, '🛁': () => { noise(.8, .15, 'bandpass', 2000); float('🫧', 6); } };
  function ask() { if (!g.alive()) return; want = pick(Object.keys(ACTS)); need.innerHTML = `<span class="pop">${want}</span>`; need.classList.add('on'); if (want !== '🎵') { mood(el, 'oops', 1500); [520, 480, 520, 450].forEach((f, i) => tone(f, .2, 'triangle', .04, i * .22)); } }
  Object.keys(ACTS).forEach(e => { const b = mk('button', 'swatch big', e); b.addEventListener('click', () => {
    if (asleep) { asleep = false; el._mood = null; el._moodUntil = 0; }
    ACTS[e](); g.after(e === '🙈' ? 1300 : 300, () => { mood(el, 'happy', 1600); if (e !== '🙈') giggle(); });
    if (e === want) { want = null; need.classList.remove('on'); float('❤️', 5); g.star(1); H.happy(); if (g.progress()) g.after(1600, () => g.levelUp()); else { clearTimeout(cry); cry = g.after(rand(3500, 6000), ask); } }
  }); bar.appendChild(b); });
  /* rock the crib to sleep: drag side to side */
  let lastX = null;
  g.on(crib, 'pointerdown', e => { lastX = e.clientX; try { crib.setPointerCapture(e.pointerId); } catch (_) {} });
  g.on(crib, 'pointermove', e => { if (lastX == null) return; const dx = e.clientX - lastX; lastX = e.clientX; crib.style.transform = `rotate(${clamp(dx * .4, -6, 6)}deg)`; rock += Math.abs(dx); if (rock > 2500 && !asleep) { asleep = true; rock = 0; sleepChar(el); float('💤', 3); musicBox(g, LULLABY.split(' ').slice(0, 6).join(' '), 70, false); g.star(1); } });
  ['pointerup', 'pointercancel'].forEach(ev => g.on(crib, ev, () => { lastX = null; crib.style.transform = ''; }));
  g.levels(1, () => { g.meter(6); g.after(1500, ask); });
  H.bubble(nm ? `👶 ${nm.toUpperCase()} ❤️` : '👶 ❤️');
});

/* MY TV — a channel of everything the child made: paintings, photos, stickers, stories, Robo drawings */
async function allCreations() {
  const out = (await MEDIA.list(['paint', 'photo', 'sticker', 'story', 'video', 'song'])).map(([id, v]) => ({ id, ...v }));
  try { JSON.parse(localStorage.getItem(KEYS.drawings) || '[]').forEach((d, i) => out.push({ id: 'd' + i, type: 'drawing', svg: d.svg, label: d.s })); } catch (e) {}
  return out;
}
function postcard(item, imgEl) {
  const c = document.createElement('canvas'); c.width = 1200; c.height = 800; const x = c.getContext('2d');
  x.fillStyle = '#F2F2EE'; x.fillRect(0, 0, 1200, 800); x.fillStyle = '#000'; x.fillRect(30, 30, 1140, 740);
  [TT.green, TT.blue, TT.red, TT.yellow].forEach((col, i) => { x.fillStyle = col; x.fillRect(30 + i * 285, 740, 285, 30); });
  const iw = 700, ih = 525; x.fillStyle = item.type === 'paint' ? '#000' : '#fff'; x.fillRect(60, 110, iw, ih); if (imgEl) { const k = Math.min(iw / imgEl.width, ih / imgEl.height), w = imgEl.width * k, h = imgEl.height * k; x.drawImage(imgEl, 60 + (iw - w) / 2, 110 + (ih - h) / 2, w, h); }
  x.fillStyle = TT.yellow; x.font = "700 48px 'i2 Pixel', monospace"; x.fillText(`${osTitle()} · POSTCARD`, 60, 85);
  x.fillStyle = '#F2F2EE'; x.font = "700 56px 'i2 Pixel', monospace"; x.fillText('LOVE,', 800, 300); x.fillText(KID_NAME() ? KID_NAME().toUpperCase() : '♥', 800, 370);
  x.font = "28px 'IBM Plex Sans', sans-serif"; x.fillStyle = '#9C9C96'; x.fillText(new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }), 800, 420);
  if (item.text) { x.fillStyle = '#F2F2EE'; x.font = "24px 'IBM Plex Sans', sans-serif"; const words = item.text.split(' '); let line = '', y = 470; for (const w of words) { if (x.measureText(line + w).width > 340) { x.fillText(line, 800, y); y += 32; line = ''; if (y > 680) break; } line += w + ' '; } if (y <= 680) x.fillText(line, 800, y); }
  return c.toDataURL('image/png');
}
game('tv', 'me', '📺', g => {
  const H = g.host(PROG.buddy || 'robo'); let items = [], i = 0, auto = true;
  g.stage.innerHTML = `<div class="tv chTv"><div class="art chArt"></div><div class="chBar"><span class="chN"></span><span class="chD"></span></div></div><div class="bbar chBtns"></div>`;
  const art = $('.chArt', g.stage), chN = $('.chN', g.stage), chD = $('.chD', g.stage), btns = $('.chBtns', g.stage);
  const cur = () => items[i];
  async function show() {
    const it = cur(); if (!it) return; art.className = 'art chArt ' + it.type; art.innerHTML = ''; retrigger(art, 'chFlip'); noise(.15, .08, 'highpass', 3000);
    chN.textContent = `CH ${String(i + 1).padStart(2, '0')} / ${items.length}`; chD.textContent = it.date || '';
    if (it.svg) { const s = safeSVG(it.svg); if (s) art.appendChild(s); }
    else if (it.type === 'story') { art.innerHTML = `<div class="chStory">${it.img ? `<img src="${it.img}">` : ''}${it.svgArt || ''}<p></p></div>`; $('p', art).textContent = it.title ? it.title : ''; }
    else if (it.type === 'video' && it.blob) { const u = URL.createObjectURL(it.blob), v = mk('video'); v.src = u; v.controls = true; v.autoplay = true; v.playsInline = true; v.className = 'chVid'; v.onended = () => { auto = true; }; auto = false; art.appendChild(v); }
    else if (it.type === 'song' && it.blob) { const u = URL.createObjectURL(it.blob); art.innerHTML = `<div class="chSong"><b>🎛️</b><audio controls autoplay src="${u}"></audio></div>`; auto = false; }
    else art.innerHTML = `<img src="${it.url}" class="${it.type === 'sticker' ? 'stkImg' : ''}">`;
  }
  const go = d => { if (!items.length) return; i = (i + d + items.length) % items.length; SFX.tap(); show(); };
  const B = (ic, fn) => { const b = mk('button', 'swatch big', ic); b.addEventListener('click', fn); btns.appendChild(b); return b; };
  B('◀', () => { auto = false; go(-1); }); B('▶', () => { auto = false; go(1); });
  const ab = B('⏯️', () => { auto = !auto; ab.classList.toggle('sel', auto); }); ab.classList.add('sel');
  btns.appendChild(mk('span', 'gap'));
  B('🔊', () => { const it = cur(); if (it && it.type === 'story' && it.text) H.say(it.text, 'talk', lang, true); });
  B('⭐', async () => { const it = cur(); if (!it || !(it.type === 'paint' || it.type === 'photo')) { retrigger(btns, 'shake'); return; } const url = await makeStickerFrom(it.url, it.type === 'paint' ? 'dark' : 'none'); if (url) { await MEDIA.add('sticker', { url, label: '🖍️' }); SFX.chime(); H.happy(); g.star(1); const fl = mk('div', 'stkFly pop'); fl.style.backgroundImage = `url(${url})`; g.stage.appendChild(fl); g.after(1600, () => fl.remove()); } });
  B('📮', async () => { const it = cur(); if (!it) return; let im = null; try { im = it.svg ? await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(it.svg.replace('<svg', '<svg width="800" height="600"'))) : it.url || it.img ? await loadImg(it.url || it.img) : null; } catch (e) {} downloadURL(postcard(it, im), `postcard-${today()}.png`); SFX.chime(); H.happy(); });
  g.every(5000, () => { if (auto && items.length > 1) go(1); });
  allCreations().then(list => { if (!g.alive()) return; items = list; if (!items.length) { art.innerHTML = '<div class="drawWait">📺<span>🎨 📸 🖍️ ✨ → 📺</span></div>'; return; } show(); });
  H.bubble('📺 ✨');
});

/* MY GAMES — HTML games a grown-up imported (e.g. a golf game made at home) */
game('myapps', 'me', '🕹️', g => {
  const H = g.host('robo'); g.stage.innerHTML = '<div class="myApps"></div>'; const box = $('.myApps', g.stage);
  const SHIM = `<script>try{localStorage.getItem('x')}catch(e){const m={};const S={getItem:k=>k in m?m[k]:null,setItem:(k,v)=>{m[k]=String(v)},removeItem:k=>{delete m[k]},clear:()=>{for(const k in m)delete m[k]},key:i=>Object.keys(m)[i]||null,get length(){return Object.keys(m).length}};try{Object.defineProperty(window,'localStorage',{value:S,configurable:true});Object.defineProperty(window,'sessionStorage',{value:S,configurable:true})}catch(_){}}<\/script>`;
  const run = a => { g.stage.classList.add('col'); g.stage.innerHTML = ''; const f = mk('iframe', 'myFrame'); f.setAttribute('sandbox', 'allow-scripts allow-pointer-lock'); f.srcdoc = SHIM + a.html; g.stage.appendChild(f); setTimeout(() => f.focus(), 300); g.star(1); };
  IDB.all('apps').then(list => {
    if (!g.alive()) return;
    if (!list.length) { box.innerHTML = `<div class="emptyNote"><b>🕹️ ⚙️</b><span>Grown-ups: import your own HTML games in settings (hold Hoot the owl on the home screen for 3 seconds).</span></div>`; return; }
    list.forEach(([, a]) => { const b = mk('button', 'smApp', `<span class="ai">${a.icon || '🎮'}</span><span class="an">${a.name}</span>`); b.style.setProperty('--c', TT.purple); b.addEventListener('click', () => { SFX.tap(); run(a); }); box.appendChild(b); });
  });
  H.bubble('🕹️');
});
