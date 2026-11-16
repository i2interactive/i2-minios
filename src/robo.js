/* ═════════ ROBO — the AI channel (LM Studio / Claude) ═════════ */
const SR_ = window.SpeechRecognition || window.webkitSpeechRecognition;
const brainTag = () => lastBrain === 'home' ? '● HOME PC' : lastBrain === 'cloud' ? '● CLOUD' : '●';
const aiFail = (err, H) => { const m = err && err.message === 'nobackend' ? T().needSetup : T().oops; console.warn(err); if (H) { H.mood('oops'); H.say(m); } else say(m); return m; };
/* one-shot speech recognition: returns a controller; cb(text) on a final result */
function listen(g, btn, cb, code = lang) {
  if (!SR_) { say(T().needSetup); return; }
  if (btn._rec) { try { btn._rec.stop(); } catch (e) {} return; }
  hush(); const rec = new SR_(); rec.lang = L[code].bcp; rec.interimResults = true; rec.continuous = false; let fin = '';
  btn._rec = rec; btn.classList.add('listening'); tone(880, .1, 'sine', .14);
  rec.onresult = e => { let t = ''; for (const r of e.results) t += r[0].transcript; if (btn._heard) btn._heard(t); if (e.results[e.results.length - 1].isFinal) fin = t; };
  rec.onerror = e => { if (/not-allowed/.test(e.error) && btn._heard) btn._heard('🎤 ✖'); };
  rec.onend = () => { btn._rec = null; btn.classList.remove('listening'); if (fin.trim() && g.alive()) cb(fin.trim()); };
  try { rec.start(); } catch (e) { btn._rec = null; btn.classList.remove('listening'); }
  g.dispose(() => { try { rec.abort(); } catch (e) {} });
}
const parseJSON = raw => { try { return JSON.parse(raw.match(/\{[\s\S]*\}/)[0]); } catch (e) { return null; } };

/* TALK — pick a friend and talk */
const PERSONA = {
  robo: 'You are Robo, a friendly, curious blue robot. You love building things, beeps and boops, and wondering how things work.',
  dino: 'You are Dino, a silly, bouncy green dinosaur. You love running, jumping, roaring and silly jokes. You sometimes say "Rawr!".',
  hoot: 'You are Hoot, a gentle, wise yellow owl teacher. You love letters, numbers and colors, and you like asking tiny quiz questions like "Can you count to three with me?".',
  foxy: 'You are Foxy, an adventurous orange fox explorer. You love space, oceans, animals and amazing true facts for little kids.'
};
game('talk', 'robo', '💬', g => {
  let who = PROG.buddy || 'robo', H = g.host(who), hist = [], busy = false;
  g.stage.innerHTML = `<div class="who"></div><div class="talkCard card"><div class="strip"><span class="tname"></span><span class="src">●</span></div><div class="answer"></div></div><div class="heard"></div><button class="mic">🎤</button>`;
  const whoBox = $('.who', g.stage), ans = $('.answer', g.stage), heard = $('.heard', g.stage), mic = $('.mic', g.stage);
  const pickWho = n => { who = n; H = g.host(n); hist = []; $$('.whoBtn', whoBox).forEach(b => b.classList.toggle('sel', b.dataset.n === n)); $('.tname', g.stage).textContent = n.toUpperCase(); $('.talkCard', g.stage).style.setProperty('--c', CAST[n].color); ans.textContent = L[lang].castHi[n]; H.say(L[lang].castHi[n]); };
  CAST_IDS.forEach(n => { const b = mk('button', 'whoBtn', charHTML(n)); b.dataset.n = n; b.addEventListener('click', () => { SFX.tap(); pickWho(n); }); whoBox.appendChild(b); });
  const system = () => `${PERSONA[who]} You are talking out loud with ${KID()}, a bright ${AGE()} ${KIDW()} who speaks ${kidLangs()}.
- ${KID()} is using ${T().name} right now. Reply in the language ${KIDP().s} just spoke; if ${KIDP().s} switches, switch with ${KIDP().o}.
- 1 or 2 short sentences with simple words. No lists, emoji or markdown — your words are read aloud.
- Stay in character. Be warm and playful. Often end with one simple question back to ${KIDP().o}.
- Speech-to-text can mishear a toddler. If it doesn't make sense, guess kindly or ask ${KIDP().o} to say it again.
- It's fine to say you don't know. Don't make things up.
${KIDR()}`;
  mic._heard = t => heard.textContent = '🧒 ' + t;
  async function ask(text) {
    busy = true; document.body.classList.add('busy'); mic.classList.add('thinking'); hist.push({ role: 'user', content: text }); hist = hist.slice(-12); if (hist[0].role !== 'user') hist.shift();
    try { const r = await chat(hist, system(), 160); if (!g.alive()) return; hist.push({ role: 'assistant', content: r }); ans.textContent = r; retrigger(ans, 'pop'); H.say(r, 'talk', lang, true); $('.src', g.stage).textContent = brainTag(); }
    catch (err) { hist.pop(); if (g.alive()) ans.textContent = aiFail(err, H); }
    busy = false; document.body.classList.remove('busy'); mic.classList.remove('thinking');
  }
  g.on(mic, 'click', () => { if (!busy) listen(g, mic, ask); });
  g.key = e => { if (e.key === ' ') { e.preventDefault(); mic.click(); } };
  g.dispose(() => document.body.classList.remove('busy'));
  pickWho(who);
});

/* ROBO DRAWS — say or pick something, Robo draws it, then the child colors it in */
const DRAW_IDEAS = [['🦖', 'a happy dinosaur'], ['🚀', 'a rocket flying to the moon'], ['🐶', 'a puppy playing with a ball'], ['🏠', 'a cozy house with a garden'], ['🌈', 'a rainbow over hills'], ['🚒', 'a fire truck'], ['🐳', 'a whale in the ocean'], ['🍕', 'a pizza party'], ['🦁', 'a friendly lion'], ['🚂', 'a train on a track'], ['🐢', 'a turtle at the beach'], ['🎂', 'a birthday cake'], ['🦉', 'an owl in a tree'], ['🚜', 'a tractor on a farm']];
async function roboDraw(subject) {
  const sys = `You are an illustrator for a toddler's coloring app. Draw exactly what is asked as a simple, cute, friendly picture.
Output ONLY one <svg> element with viewBox="0 0 400 300" and nothing else.
Use 15 to 45 simple shapes (rect, circle, ellipse, polygon, path, line). Bold flat fill colors, thick dark outlines (stroke="#111" stroke-width="4"), a simple background (sky and ground or water).
The main subject must be big and centered. No text, no gradients, no filters, no images, no scripts, no style or class attributes.`;
  const raw = await artChat([{ role: 'user', content: 'Draw: ' + subject }], sys, 3500);
  const svg = safeSVG(raw); if (!svg) throw new Error('The picture did not come back right. Try again!'); return svg;
}
/* DRAWINGS BY CLAUDE — Grown-Ups → Drawings. When on, Robo Draws, story pictures and Sticker Maker ask Claude directly
   (it draws SVG vector art; Claude doesn't make photos). Otherwise drawings use the normal robot brain. */
const artClaude = () => cfg.art === 'claude' && !!cfg.cloud.claudeKey;
const artChat = (messages, sys, max) => artClaude() ? claudeCall(cfg.artModel || 'claude-haiku-5-5', messages, typeof castSwap === 'function' ? castSwap(sys) : sys, max + (/haiku/.test(cfg.artModel || 'haiku') ? 0 : 1500), true) : chat(messages, sys, max, { raw: true });
async function claudeSticker(desc) {
  const sys = `You make stickers for a toddler's sticker book. Output ONLY one <svg> element with viewBox="0 0 300 300" and nothing else.
Draw ONE cute, friendly subject, big and centered, using 12 to 40 simple shapes (rect, circle, ellipse, polygon, path, line). Bold flat colors, thick dark outlines (stroke="#111" stroke-width="5"), happy face if it has one.
NO background at all (transparent). No text, no gradients, no filters, no images, no scripts, no style or class attributes.`;
  const svg = safeSVG(await claudeCall(cfg.artModel || 'claude-haiku-5-5', [{ role: 'user', content: 'Sticker: ' + desc }], sys, /haiku/.test(cfg.artModel || 'haiku') ? 3000 : 4500, true));
  if (!svg) throw new Error('no svg'); return svgToPng(svg, 512);
}
async function svgToPng(svg, size = 512) {
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); svg.setAttribute('width', size); svg.setAttribute('height', size);
  const im = await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.outerHTML)), c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d'); x.drawImage(im, 0, 0, size, size); return c.toDataURL('image/png');
}
function revealSVG(g, svg, holder) {
  holder.innerHTML = ''; holder.appendChild(svg); const parts = $$('*', svg).filter(e => e.nodeName !== 'g');
  parts.forEach(e => e.style.opacity = 0); parts.forEach((e, i) => g.after(120 + i * 70, () => { e.style.transition = 'opacity .25s'; e.style.opacity = 1; if (i % 3 === 0) tone(PENTA[i % 10], .08, 'triangle', .05); }));
  return parts.length * 70 + 300;
}
game('draw', 'robo', '🖍️', g => {
  const H = g.host('robo');
  g.stage.innerHTML = `<div class="drawTop"><div class="ideas"></div><button class="mic small">🎤</button></div><div class="drawMain"><div class="tv drawTv"><div class="art"></div></div><div class="gallery"></div></div><div class="bbar palette"></div>`;
  const ideas = $('.ideas', g.stage), art = $('.art', g.stage), gal = $('.gallery', g.stage), pal = $('.palette', g.stage), mic = $('.mic', g.stage);
  let color = TT.red, busy = false, cur = null;
  let saved = []; try { saved = JSON.parse(localStorage.getItem(KEYS.drawings) || '[]'); } catch (e) {}
  const store = () => { try { localStorage.setItem(KEYS.drawings, JSON.stringify(saved.slice(0, 8))); } catch (e) {} };
  const renderGallery = () => { gal.innerHTML = ''; saved.slice(0, 8).forEach((s, i) => { const b = mk('button', 'thumb', s.svg); b.addEventListener('click', () => { SFX.tap(); const el = safeSVG(s.svg); if (el) { cur = i; art.innerHTML = ''; art.appendChild(el); } }); gal.appendChild(b); }); };
  [...THEMES[weekTheme()].set.slice(0, 2).map(e => [e, 'a cute, happy ' + e + ' (draw what this emoji shows)']), ...shuffle(DRAW_IDEAS).slice(0, 4)].forEach(([em, sub]) => { const b = mk('button', 'idea', em); b.addEventListener('click', () => make(sub, em)); ideas.appendChild(b); });
  [...COLORS, TT.white, '#8B5A3C', '#111111'].forEach((c, i) => { const b = mk('button', 'swatch' + (i === 0 ? ' sel' : '')); b.style.background = c; b.addEventListener('click', () => { color = c; $$('.swatch', pal).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); SFX.tap(); }); pal.appendChild(b); });
  g.on(art, 'click', e => { const el = e.target; if (busy || !el.closest || !el.closest('svg') || el.nodeName === 'svg' || el.getAttribute('fill') === 'none') return; el.setAttribute('fill', color); tone(PENTA[randi(3, 9)], .12, 'triangle', .14); retrigger(el, 'fillpop'); if (cur != null && saved[cur]) { saved[cur].svg = art.innerHTML; store(); } });
  async function make(subject, em) {
    if (busy) return; busy = true; document.body.classList.add('busy'); art.innerHTML = `<div class="drawWait">${em || '🎨'}<span>${T().thinking}</span></div>`; H.say(T().thinking);
    try { const svg = await roboDraw(subject); if (!g.alive()) return; const clean = svg.outerHTML; const ms = revealSVG(g, svg, art); saved.unshift({ svg: clean, s: subject }); cur = 0; store(); g.after(ms, () => { renderGallery(); H.happy(); H.say(L[lang].colorIt); g.star(1); }); }
    catch (err) { if (g.alive()) art.innerHTML = `<div class="drawWait">⚠<span>${aiFail(err, H)}</span></div>`; }
    busy = false; document.body.classList.remove('busy');
  }
  mic._heard = t => { art.innerHTML = `<div class="drawWait">🎤<span>${t}</span></div>`; };
  g.on(mic, 'click', () => { if (!busy) listen(g, mic, t => make(t, '🎤')); });
  g.dispose(() => document.body.classList.remove('busy'));
  renderGallery(); art.innerHTML = `<div class="drawWait">${charHTML('robo', 'big')}<span>${L[lang].draw}</span></div>`; H.say(L[lang].draw);
});

/* STORIES — the cast stars in a story; the child chooses what happens; Robo draws the ending */
game('story', 'robo', '📖', g => {
  const H = g.host('hoot');
  g.stage.innerHTML = `<div class="storyPick">
    <div class="pickCard"><div class="strip" style="--c:var(--tt-green)">${T().hero}</div><div class="pickRow r0"></div></div>
    <div class="pickCard"><div class="strip" style="--c:var(--tt-blue);--ink:var(--tt-white)">${T().where}</div><div class="pickRow r1"></div></div>
    <div class="pickCard"><div class="strip" style="--c:var(--tt-red)">${T().what}</div><div class="pickRow r2"></div></div>
    <button class="slab goBtn">📖 ▶</button></div>
    <div class="storyRead"><div class="card storyCard"><div class="strip"><span class="part">PART 1</span><span class="src">i2 · STORY</span></div><div class="storyBody"><div class="storyText"></div><div class="storyArt"></div></div></div><div class="storyChoices"></div></div>`;
  const st = { sel: [null, null, null], hist: [], round: 0, busy: false, text: '' };
  const go = $('.goBtn', g.stage);
  const heroes = CAST_IDS.map(n => ({ html: charHTML(n), name: () => n === 'foxy' ? 'Foxy the fox' : n === 'hoot' ? 'Hoot the owl' : n === 'dino' ? 'Dino the dinosaur' : 'Robo the robot', say: () => n.toUpperCase() }));
  const lists = [heroes, PLACE_EMOJI.map((e, i) => ({ html: e, name: () => PLACE_EN[i], say: () => T().places[i] })), OBJ_EMOJI.map((e, i) => ({ html: e, name: () => OBJ_EN[i], say: () => T().objects[i] }))];
  lists.forEach((list, k) => { const row = $('.r' + k, g.stage); list.forEach((it, i) => { const b = mk('button', 'tBtn', it.html); b.addEventListener('click', () => { $$('.tBtn', row).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); st.sel[k] = i; tone(PENTA[4 + k], .12, 'triangle', .15); say(cap(it.say()) + '!'); go.classList.toggle('ready', st.sel.every(x => x !== null)); }); row.appendChild(b); }); });
  const system = () => `You tell short, cozy, funny stories out loud to ${KID()}, a bright ${AGE()} ${KIDW()}. Write in ${T().name}.
The cast: Robo (a blue robot), Dino (a silly green dinosaur), Hoot (a wise yellow owl) and Foxy (an adventurous orange fox). ${KID()} is always in the story as the hero's best friend.
Use very simple words. ${KIDR()}
Reply with ONLY a JSON object: {"text":"...","choices":[{"emoji":"🍦","label":"..."},{"emoji":"🚀","label":"..."}]}
"text" is 3 or 4 short sentences that end by asking ${KID()} what should happen next, using the two choices. Labels are 1–3 words in ${T().name}; each emoji is one emoji.
When asked to finish, write a happy 2–3 sentence ending and use "choices": [].`;
  const mode = m => g.stage.classList.toggle('reading', m === 'read');
  async function step(msg) {
    st.busy = true; document.body.classList.add('busy'); mode('read');
    const txt = $('.storyText', g.stage), box = $('.storyChoices', g.stage), artEl = $('.storyArt', g.stage);
    txt.textContent = '💭 ' + T().thinking; box.innerHTML = ''; artEl.innerHTML = ''; artEl.classList.remove('on'); $('.part', g.stage).textContent = 'PART ' + (st.round + 1); H.say(T().thinking);
    st.hist.push({ role: 'user', content: msg });
    try {
      const raw = await chat(st.hist, system(), 450); if (!g.alive()) return; st.hist.push({ role: 'assistant', content: raw });
      const j = parseJSON(raw) || { text: raw.replace(/[{}"]/g, ''), choices: [] }; const choices = Array.isArray(j.choices) ? j.choices.slice(0, 2) : [];
      st.text += ' ' + j.text; txt.textContent = j.text; retrigger(txt, 'pop'); H.say(j.text, 'talk', lang, true); $('.src', g.stage).textContent = brainTag();
      if (choices.length === 2) choices.forEach(c => { const b = mk('button', 'choice', '<span class="e"></span><span></span>'); b.children[0].textContent = c.emoji || '✨'; b.children[1].textContent = c.label || ''; b.addEventListener('click', () => { if (st.busy) return; SFX.tap(); st.round++; step(st.round >= 2 ? `${KID()} picked: "${c.label}". Now finish the story with a happy ending.` : `${KID()} picked: "${c.label}". Keep going.`); }); box.appendChild(b); });
      else {
        $('.part', g.stage).textContent = T().theEnd; g.star(3); H.happy();
        const title = st.sel.every(v => v != null) ? `${CAST_IDS[st.sel[0]].toUpperCase()} ${PLACE_EMOJI[st.sel[1]]} ${OBJ_EMOJI[st.sel[2]]}` : '📖';
        st.mid = null; MEDIA.add('story', { title, text: st.text.trim() }).then(id => st.mid = id);
        const attach = async extra => { if (!st.mid) return; const v = await IDB.get('media', st.mid); if (v) IDB.set('media', st.mid, { ...v, ...extra }); };
        const d = mk('button', 'choice', '<span class="e">🎨</span>'); d.addEventListener('click', async () => { if (st.busy) return; st.busy = true; d.remove(); artEl.classList.add('on'); artEl.innerHTML = `<div class="drawWait">🎨</div>`;
          if (comfyOn()) { try { const url = await comfyMake(`gentle children's picture book illustration, soft warm colors, cute and friendly, simple rounded shapes, cozy, happy, for toddlers. Characters: a small blue robot, a silly green dinosaur, a yellow owl, an orange fox. Scene: ${st.text.slice(-400)}`, 768); const small = await loadImg(url).then(im => shrinkCanvas(im, 640)); if (g.alive()) { artEl.innerHTML = `<img src="${small}" class="pop">`; attach({ img: small }); } st.busy = false; return; } catch (e) { console.warn(e); } }
          try { const svg = await roboDraw('the last scene of this story: ' + st.text.slice(-500)); if (g.alive()) { attach({ svgArt: svg.outerHTML }); revealSVG(g, svg, artEl); } } catch (err) { if (g.alive()) artEl.innerHTML = `<div class="drawWait">⚠</div>`; } st.busy = false; });
        const r = mk('button', 'choice end', '<span class="e">↺</span>'); r.addEventListener('click', reset); box.append(d, r);
      }
    } catch (err) { st.hist.pop(); if (!g.alive()) return; txt.textContent = aiFail(err, H); const b = mk('button', 'choice end', '<span class="e">↺</span>'); b.addEventListener('click', reset); box.appendChild(b); }
    st.busy = false; document.body.classList.remove('busy');
  }
  function reset() { st.sel = [null, null, null]; st.hist = []; st.round = 0; st.text = ''; $$('.storyPick .tBtn', g.stage).forEach(x => x.classList.remove('sel')); go.classList.remove('ready'); mode('pick'); H.say(T().storyHi); }
  go.addEventListener('click', () => { if (st.sel.some(x => x === null)) { H.say(T().storyHi); return; } if (st.busy) return; step(`Start a new story. Hero: ${lists[0][st.sel[0]].name()}. Place: ${lists[1][st.sel[1]].name()}. Important thing: ${lists[2][st.sel[2]].name()}.`); });
  const wk = weekData();
  if (wk && wk.story && Array.isArray(wk.story.parts) && wk.story.parts.length) {
    const wb = mk('button', 'slab goBtn ready weekStory', `⭐ ${(THEMES[wk.theme] || {}).e || '📖'}`); $('.storyPick', g.stage).appendChild(wb);
    wb.addEventListener('click', () => { if (st.busy) return; mode('read'); let k = 0; const txt = $('.storyText', g.stage), box = $('.storyChoices', g.stage);
      const part = () => { $('.part', g.stage).textContent = (wk.story.title || '').toUpperCase().slice(0, 40); txt.textContent = wk.story.parts[k]; retrigger(txt, 'pop'); H.say(wk.story.parts[k], 'talk', lang, true); box.innerHTML = '';
        const nb = mk('button', 'choice', `<span class="e">${k < wk.story.parts.length - 1 ? '▶' : '↺'}</span>`); nb.addEventListener('click', () => { SFX.tap(); if (k < wk.story.parts.length - 1) { k++; part(); } else { g.star(2); reset(); } }); box.appendChild(nb); };
      part(); });
  }
  g.dispose(() => document.body.classList.remove('busy'));
  reset();
});

/* QUIZ — pick a topic; Hoot asks five picture questions; levels make it trickier */
const QUIZ_TOPICS = [['🐾', 'animals'], ['🚀', 'space'], ['🚒', 'trucks, cars and things that go'], ['🍎', 'food'], ['🌊', 'the ocean'], ['🦕', 'dinosaurs'], ['🌦️', 'weather'], ['🎨', 'colors and shapes']];
const QUIZ_FALLBACK = [
  { q: 'Who says moo?', choices: ['🐮', '🐶', '🐸'], answer: 0 }, { q: 'What shines in the sky in the day?', choices: ['🌙', '☀️', '⭐'], answer: 1 }, { q: 'What goes vroom vroom?', choices: ['🚗', '🐟', '🎈'], answer: 0 },
  { q: 'Who swims in the water?', choices: ['🐴', '🦉', '🐟'], answer: 2 }, { q: 'What do you kick at the park?', choices: ['⚽', '🍎', '🧸'], answer: 0 }, { q: 'Who hops and says ribbit?', choices: ['🐷', '🐸', '🐑'], answer: 1 },
  { q: 'What is cold and sweet?', choices: ['🍦', '🔥', '🚀'], answer: 0 }, { q: 'What flies to the moon?', choices: ['🚲', '🚀', '🐢'], answer: 1 }];
game('quiz', 'robo', '❓', g => {
  const H = g.host('hoot');
  g.stage.innerHTML = `<div class="topics"></div><div class="quizRun"><div class="card storyCard"><div class="strip"><span class="qn">1/5</span><span class="src">●</span></div><div class="storyText"></div></div><div class="riddleChoices"></div></div>`;
  const topics = $('.topics', g.stage), txt = $('.storyText', g.stage), box = $('.riddleChoices', g.stage);
  let qs = [], qi = 0, busy = false, offline = false;
  QUIZ_TOPICS.forEach(([em, name]) => { const b = mk('button', 'topic', em); b.addEventListener('click', () => start(name)); topics.appendChild(b); });
  const wk = weekData(); if (wk && Array.isArray(wk.quiz) && wk.quiz.length) { const b = mk('button', 'topic week', (THEMES[wk.theme] || {}).e || '⭐'); b.addEventListener('click', () => { if (busy) return; const list = wk.quiz.filter(q => q && q.q && Array.isArray(q.choices) && q.choices.length >= 2).map(q => ({ q: String(q.q), choices: q.choices.slice(0, 3).map(String), answer: clamp(+q.answer || 0, 0, Math.min(2, q.choices.length - 1)) })); if (!list.length) return; offline = false; show('run'); qs = shuffle(list).slice(0, 5); qi = 0; g.meter(qs.length); $('.src', g.stage).textContent = '★ THIS WEEK'; ask(); }); topics.prepend(b); }
  const DIFF = ['very easy: which animal makes a sound, colors, big and small, what we eat', 'easy: where animals live, what they eat, what things are used for', 'a little tricky: counting small groups, opposites, simple why questions, fun true facts'];
  const system = () => `You are Hoot, a gentle owl who makes picture quizzes for ${KID()}, a bright ${AGE()}. Write in ${T().name}.
Difficulty: ${DIFF[g.lvl() - 1]}. ${KIDR()}
Reply with ONLY JSON: {"questions":[{"q":"one short spoken question","choices":["emoji","emoji","emoji"],"answer":0}, … 5 questions]}
Each choice is ONE common emoji; exactly one is right; "answer" is its index. Mix up which position is right.`;
  const show = mode => g.stage.classList.toggle('running', mode === 'run');
  async function start(topic) {
    if (busy) return; busy = true; document.body.classList.add('busy'); show('run'); box.innerHTML = ''; txt.textContent = '💭 ' + T().thinking; H.say(T().thinking);
    let list = null;
    try { const raw = await chat([{ role: 'user', content: `Topic: ${topic}.` }], system(), 900); const j = parseJSON(raw); list = (j && Array.isArray(j.questions) ? j.questions : []).filter(q => q && q.q && Array.isArray(q.choices) && q.choices.length >= 2).map(q => ({ q: String(q.q), choices: q.choices.slice(0, 3).map(String), answer: clamp(+q.answer || 0, 0, Math.min(2, q.choices.length - 1)) })); $('.src', g.stage).textContent = brainTag(); }
    catch (e) { console.warn(e); }
    if (!g.alive()) return;
    offline = !list || !list.length; if (offline) { list = shuffle(QUIZ_FALLBACK).slice(0, 5); $('.src', g.stage).textContent = 'OFFLINE'; }
    qs = list.slice(0, 5); qi = 0; g.meter(qs.length); busy = false; document.body.classList.remove('busy'); ask();
  }
  function ask() {
    const q = qs[qi]; $('.qn', g.stage).textContent = `${qi + 1}/${qs.length}`; txt.textContent = q.q; retrigger(txt, 'pop'); H.say(q.q, 'talk', offline ? 'en' : lang);
    box.innerHTML = ''; q.choices.forEach((em, i) => { const b = mk('button', 'rchoice', em); b.addEventListener('click', () => answer(i, b)); box.appendChild(b); });
  }
  function answer(i, b) {
    if (busy) return; const q = qs[qi];
    if (i === q.answer) { busy = true; b.classList.add('right'); SFX.chime(); H.happy(); g.star(1); say(pick(T().yes), lang, null, 'hoot', H.el); const done = g.progress(); g.after(2000, () => { busy = false; qi++; if (done || qi >= qs.length) { show('pick'); g.levelUp(); } else ask(); }); }
    else { SFX.bad(); H.mood('oops'); retrigger(b, 'shake'); }
  }
  g.tool('🔊', () => { if (qs[qi] && g.stage.classList.contains('running')) H.say(qs[qi].q, 'talk', offline ? 'en' : lang); });
  g.levels(3, () => { show('pick'); g.meter(5); H.bubble('🐾 🚀 🚒 🍎'); });
  g.dispose(() => document.body.classList.remove('busy'));
});

/* SAY IT — say something, hear it in both languages */
game('sayit', 'robo', '🗣️', g => {
  const H = g.host('hoot'); const two = cfg.lang2 !== 'none' && L[cfg.lang2];
  g.stage.innerHTML = `<div class="sayEmoji">🗣️</div><div class="sayCards"><button class="sayCard en"><b>EN</b><span></span></button><button class="sayCard l2"><b>${two ? cfg.lang2.toUpperCase() : '—'}</b><span></span></button></div><div class="heard"></div><button class="mic">🎤</button>`;
  const en = $('.sayCard.en span', g.stage), l2 = $('.sayCard.l2 span', g.stage), heard = $('.heard', g.stage), mic = $('.mic', g.stage), emo = $('.sayEmoji', g.stage);
  g.on($('.sayCard.en', g.stage), 'click', () => en.textContent && say(en.textContent, 'en', null, 'hoot', H.el));
  g.on($('.sayCard.l2', g.stage), 'click', () => two && l2.textContent && say(l2.textContent, cfg.lang2, null, 'hoot', H.el));
  mic._heard = t => heard.textContent = '🧒 ' + t;
  async function go(text) {
    if (!two) { H.say('Pick a second language in the grown-up settings!', 'talk', 'en'); return; }
    document.body.classList.add('busy'); mic.classList.add('thinking');
    const sys = `${KID()}, a ${AGE()} who speaks English and ${L[cfg.lang2].name}, said something. Turn it into one short, simple, correct sentence in English and the same sentence in ${L[cfg.lang2].name}, the way a kind parent would say it. ${KIDR()}
Reply with ONLY JSON: {"emoji":"one emoji","en":"...","other":"..."}`;
    try {
      const j = parseJSON(await chat([{ role: 'user', content: text }], sys, 200)); if (!g.alive()) return; if (!j) throw new Error('bad');
      emo.textContent = j.emoji || '✨'; en.textContent = j.en || ''; l2.textContent = j.other || ''; retrigger(emo, 'pop'); g.star(1); H.mood('happy', 800);
      say(j.en, 'en', () => g.after(250, () => say(j.other, cfg.lang2, null, 'hoot', H.el)), 'hoot', H.el);
    } catch (err) { if (g.alive()) aiFail(err, H); }
    document.body.classList.remove('busy'); mic.classList.remove('thinking');
  }
  g.on(mic, 'click', () => listen(g, mic, go));
  g.key = e => { if (e.key === ' ') { e.preventDefault(); mic.click(); } };
  g.dispose(() => document.body.classList.remove('busy'));
  H.say(L[lang].sayIt);
});

/* SHOW ME — hold something up to the camera; Robo tells you about it */
game('showme', 'robo', '📷', g => {
  const H = g.host('robo');
  g.stage.innerHTML = `<div class="tv camTv"><video playsinline muted></video><canvas class="snap"></canvas><div class="camMsg"></div></div><div class="showRow"><div class="card talkCard"><div class="strip"><span>ROBO</span><span class="src">●</span></div><div class="answer"></div></div><button class="shutter">📸</button></div>`;
  const video = $('video', g.stage), snap = $('.snap', g.stage), ans = $('.answer', g.stage), shutter = $('.shutter', g.stage), msg = $('.camMsg', g.stage);
  let stream = null, busy = false, hist = [];
  (async () => {
    try { stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false }); if (!g.alive()) { stream.getTracks().forEach(t => t.stop()); return; } video.srcObject = stream; await video.play(); }
    catch (e) { msg.textContent = '📷 ✖ — a grown-up needs to allow the camera.'; msg.classList.add('on'); }
  })();
  g.dispose(() => { if (stream) stream.getTracks().forEach(t => t.stop()); document.body.classList.remove('busy'); });
  const sys = `You are Robo, a friendly robot. ${KID()}, a bright ${AGE()} who speaks ${kidLangs()}, is holding something up to the camera to show you. Reply in ${T().name}.
Say what it is in 1 or 2 short, excited sentences, then ask ${KIDP().o} one simple question about it. If you can't tell, make a kind guess.
If you see a person, just say a warm hello — don't describe their face or body. No emoji or markdown; your words are read aloud. ${KIDR()}`;
  async function shoot() {
    if (busy || !stream) return; busy = true; document.body.classList.add('busy');
    const w = 512, h = Math.round(512 * (video.videoHeight || 480) / (video.videoWidth || 640)); snap.width = w; snap.height = h; snap.getContext('2d').drawImage(video, 0, 0, w, h); snap.classList.add('on');
    noise(.12, .3, 'highpass', 3000); retrigger(g.stage.querySelector('.camTv'), 'flash'); ans.textContent = '💭 ' + T().thinking;
    try {
      const img = snap.toDataURL('image/jpeg', .72);
      const r = await chat([{ role: 'user', content: 'What am I showing you?', image: img }], sys, 160); if (!g.alive()) return;
      ans.textContent = r; retrigger(ans, 'pop'); H.say(r, 'happy', lang, true); g.star(1); $('.src', g.stage).textContent = brainTag();
    } catch (err) { if (g.alive()) ans.textContent = /image|vision|multimodal/i.test(err.message) ? '📷 This robot brain can\'t see pictures. Try the Claude cloud brain.' : aiFail(err, H); }
    busy = false; document.body.classList.remove('busy'); g.after(2500, () => snap.classList.remove('on'));
  }
  g.on(shutter, 'click', shoot); g.key = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); shoot(); } };
  ans.textContent = L[lang].showMe; H.say(L[lang].showMe);
});
