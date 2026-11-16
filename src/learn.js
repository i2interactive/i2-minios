/* ═════════ LEARN — Hoot's classroom ═════════ */
const ABC = { A: ['apple', '🍎'], B: ['ball', '⚽'], C: ['cat', '🐱'], D: ['dog', '🐶'], E: ['elephant', '🐘'], F: ['fish', '🐟'], G: ['grapes', '🍇'], H: ['horse', '🐴'],
  I: ['ice cream', '🍦'], J: ['juice', '🧃'], K: ['kite', '🪁'], L: ['lion', '🦁'], M: ['moon', '🌙'], N: ['nose', '👃'], O: ['octopus', '🐙'], P: ['pig', '🐷'],
  Q: ['queen', '👸'], R: ['rainbow', '🌈'], S: ['sun', '☀️'], T: ['train', '🚂'], U: ['umbrella', '☂️'], V: ['volcano', '🌋'], W: ['whale', '🐳'], X: ['xylophone', '🎶'], Y: ['yo-yo', '🪀'], Z: ['zebra', '🦓'] };
const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/* ABC — explore → find the key → what does it start with? */
game('abc', 'learn', '🔤', g => {
  const H = g.host('hoot');
  g.stage.innerHTML = `<div class="abcStage"><div class="abcChar"></div><div class="abcPic"><div class="abcEmoji"></div><div class="abcWord"></div></div></div><div class="abcChoices"></div><div class="hint"></div>`;
  const LC = [TT.green, TT.blue, TT.red, TT.yellow, TT.white]; let i = -1, target = null, seen = new Set(), busy = false;
  const c = $('.abcChar', g.stage), em = $('.abcEmoji', g.stage), wd = $('.abcWord', g.stage), ch = $('.abcChoices', g.stage), hint = $('.hint', g.stage);
  const show = k => {
    c.textContent = k; c.style.color = pick(LC);
    if (/[0-9]/.test(k)) { const n = +k; em.classList.toggle('stars', n > 0); em.innerHTML = n ? Array(n).fill('<span>⭐</span>').join('') : '🍩'; wd.textContent = numWord(n); say(numWord(n) + '!'); }
    else { const [w, e] = ABC[k]; em.classList.remove('stars'); em.textContent = e; wd.textContent = w; say(`${k}. ${k} is for ${w}!`, 'en', null, 'hoot', H.el); }
    [c, em, wd].forEach(x => retrigger(x, 'pop')); tone(PENTA[randi(3, 9)], .15, 'triangle', .15);
    if (g.lvl() === 1 && !seen.has(k)) { seen.add(k); g.star(1); if (g.progress()) g.levelUp(); }
  };
  const choices = (right, pool) => { ch.innerHTML = ''; shuffle([right, ...shuffle(pool.filter(x => x !== right)).slice(0, 3)]).forEach(l => { const b = mk('button', 'slab ltile', l); b.addEventListener('click', () => answer(l, b)); ch.appendChild(b); }); };
  function round() {
    busy = false; const lv = g.lvl(); ch.innerHTML = '';
    if (lv === 2) { target = pick(AZ); c.textContent = '?'; c.style.color = TT.yellow; em.textContent = '⌨️'; wd.textContent = ''; choices(target, AZ); H.say(`Press ${target}!`, 'talk', 'en', 0, CARD.letter(target, '⌨️')); }
    if (lv === 3) { target = pick(AZ.filter(l => !'XQ'.includes(l))); const [w, e] = ABC[target]; c.textContent = '?'; c.style.color = TT.yellow; em.textContent = e; wd.textContent = w.replace(/^./, '_'); choices(target, AZ); H.say(`What does ${w} start with?`, 'talk', 'en', 0, CARD.emoji(e, '→ ?')); }
  }
  function answer(l, b) {
    if (busy) return; const lv = g.lvl();
    if (lv === 1) { show(l); return; }
    if (l === target) { busy = true; c.textContent = l; retrigger(c, 'pop'); if (lv === 3) wd.textContent = ABC[l][0]; b && b.classList.add('right'); SFX.good(); H.happy(); g.star(1); say(lv === 3 ? `${l}! ${ABC[l][0]}!` : `${l}!`, 'en'); if (g.progress()) g.levelUp(); else g.after(1600, round); }
    else { SFX.bad(); H.mood('oops'); b && retrigger(b, 'shake'); say(l, 'en'); }
  }
  const start = lv => { g.meter(lv === 1 ? 10 : 8); hint.textContent = lv === 1 ? '⌨ ✓ · 👆 ✓' : ''; if (lv === 1) { ch.innerHTML = ''; show('A'); } else round(); };
  g.levels(3, start);
  g.on(g.stage, 'click', e => { if (g.lvl() === 1 && !e.target.closest('.ltile')) { i = (i + 1) % 26; show(AZ[i]); } });
  g.key = e => { const k = e.key.length === 1 ? e.key.toUpperCase() : ''; if (/^[A-Z0-9]$/.test(k)) { e.preventDefault(); g.lvl() === 1 ? show(k) : /[A-Z]/.test(k) && answer(k, $$('.ltile', ch).find(b => b.textContent === k)); } };
});

/* SPELL — 3 letters → 4-5 letters → more decoys, no hints */
const WORDS = {
  1: [['CAT', '🐱'], ['DOG', '🐶'], ['SUN', '☀️'], ['BUS', '🚌'], ['PIG', '🐷'], ['HAT', '🎩'], ['BEE', '🐝'], ['COW', '🐮'], ['FOX', '🦊'], ['EGG', '🥚'], ['OWL', '🦉'], ['ANT', '🐜'], ['BED', '🛏️'], ['CAR', '🚗'], ['MAP', '🗺️'], ['CUP', '🥤']],
  2: [['FISH', '🐟'], ['DUCK', '🦆'], ['FROG', '🐸'], ['STAR', '⭐'], ['MOON', '🌙'], ['CAKE', '🎂'], ['BALL', '⚽'], ['BOAT', '⛵'], ['TREE', '🌳'], ['BEAR', '🐻'], ['LION', '🦁'], ['BIRD', '🐦'], ['TRAIN', '🚂'], ['HORSE', '🐴'], ['APPLE', '🍎'], ['ROBOT', '🤖']],
  3: [['TRUCK', '🚚'], ['SNAKE', '🐍'], ['PIZZA', '🍕'], ['TIGER', '🐯'], ['ZEBRA', '🦓'], ['HOUSE', '🏠'], ['SHARK', '🦈'], ['CLOUD', '☁️'], ['ROCKET', '🚀'], ['TURTLE', '🐢'], ['BANANA', '🍌'], ['MONKEY', '🐵']]
};
game('spell', 'learn', '✏️', g => {
  const H = g.host('hoot');
  g.stage.innerHTML = `<div class="spellPic"></div><div class="slots"></div><div class="letterTiles"></div>`;
  const sp = { word: '', idx: 0, wrong: 0, busy: false };
  function next() {
    const lv = g.lvl(); let w; do { w = pick(WORDS[lv]); } while (w[0] === sp.word);
    sp.word = w[0]; sp.idx = 0; sp.wrong = 0; sp.busy = false;
    const pic = $('.spellPic', g.stage); pic.textContent = w[1]; retrigger(pic, 'pop');
    $('.slots', g.stage).innerHTML = sp.word.split('').map((_, i) => `<div class="slot${i === 0 ? ' next' : ''}"></div>`).join('');
    const letters = new Set(sp.word.split('')), want = lv === 3 ? 10 : Math.min(sp.word.length + 3, 8); while (letters.size < want) letters.add(pick(AZ));
    const box = $('.letterTiles', g.stage); box.innerHTML = '';
    shuffle([...letters]).forEach(ch => { const b = mk('button', 'slab ltile', ch); b.dataset.l = ch; b.addEventListener('click', () => input(ch)); box.appendChild(b); });
    H.say(`Can you spell ${sp.word.toLowerCase()}?`, 'talk', 'en', 0, CARD.emoji(w[1], '✏️'));
  }
  function input(ch) {
    if (sp.busy || !sp.word) return; const slots = $$('.slot', g.stage);
    if (ch === sp.word[sp.idx]) {
      const s = slots[sp.idx]; s.textContent = ch; s.classList.remove('next'); s.classList.add('filled'); retrigger(s, 'pop');
      $$('.ltile', g.stage).forEach(b => b.classList.remove('hintGlow')); tone(PENTA[Math.min(9, 3 + sp.idx)], .18, 'triangle', .2); sp.idx++; sp.wrong = 0;
      if (sp.idx < sp.word.length) { slots[sp.idx].classList.add('next'); say(ch, 'en'); return; }
      sp.busy = true; SFX.chime(); H.happy(); g.star(1); say(`${sp.word.split('').join(', ')}. ${sp.word.toLowerCase()}!`, 'en', null, 'hoot', H.el);
      g.after(3400, () => { if (g.progress()) g.levelUp(); else next(); });
    } else {
      SFX.bad(); H.mood('oops'); retrigger($('.slots', g.stage), 'shake'); sp.wrong++;
      if (sp.wrong >= 2 && g.lvl() < 3) { const need = sp.word[sp.idx]; $$('.ltile', g.stage).forEach(b => b.classList.toggle('hintGlow', b.dataset.l === need)); say(`Look for ${need}!`, 'en'); }
    }
  }
  g.levels(3, lv => { g.meter(5); sp.word = ''; next(); });
  g.key = e => { const k = e.key.length === 1 ? e.key.toUpperCase() : ''; if (/^[A-Z]$/.test(k)) { e.preventDefault(); input(k); } };
});

/* COUNT — count to 5 → to 10 → adding → taking away. Tap each one to count it. */
const COUNT_ITEMS = ['🍎', '🐥', '⭐', '🚗', '🐟', '🌸', '🍓', '🎈', '🦖', '🍪', '🐞', '🚀'];
game('count', 'learn', '🔢', g => {
  const H = g.host('hoot');
  g.stage.innerHTML = `<div class="countItems"></div><div class="countChoices"></div>`;
  let answer = 0, busy = false, tapped = 0;
  function next() {
    busy = false; tapped = 0; const lv = g.lvl();
    const em = pick(COUNT_ITEMS), box = $('.countItems', g.stage); box.innerHTML = '';
    const group = n => { const d = mk('div', 'group'); for (let i = 0; i < n; i++) { const s = mk('button', 'citem', em); s.addEventListener('click', () => tapItem(s)); d.appendChild(s); } return d; };
    if (lv <= 2) { answer = lv === 1 ? randi(1, 5) : randi(5, 10); box.appendChild(group(answer)); H.say(T().howMany, 'talk', lang, 0, CARD.emoji(em, '?')); }
    else if (lv === 3) { const a = randi(1, 5), b = randi(1, 4); answer = a + b; box.append(group(a), mk('div', 'plusSign', '+'), group(b)); H.say(`${numWord(a)} ${T().plus} ${numWord(b)}?`, 'talk', lang, 0, CARD.text(`${a} + ${b}`)); }
    else {
      const a = randi(3, 7), k = randi(1, Math.min(3, a - 1)); answer = a - k; const gr = group(a); box.appendChild(gr);
      H.say(numWord(a) + '…');
      g.after(1500, () => { [...gr.children].slice(-k).forEach((s, i) => { s.classList.add('flyaway'); s.style.animationDelay = (i * .15) + 's'; s.disabled = true; }); sweep(400, 1200, .5, 'sine', .1); g.after(1200, () => H.say(T().howMany)); });
    }
    retrigger(box, 'pop');
    const opts = new Set([answer]); while (opts.size < 3) { const o = answer + pick([-2, -1, 1, 2, 3]); if (o >= 1 && o <= 12) opts.add(o); }
    const ch = $('.countChoices', g.stage); ch.innerHTML = '';
    shuffle([...opts]).forEach(n => { const b = mk('button', 'slab nbtn', n); b.addEventListener('click', () => choose(n, b)); ch.appendChild(b); });
  }
  function tapItem(s) { if (s.dataset.n || busy || s.classList.contains('flyaway')) return; tapped++; s.dataset.n = tapped; s.classList.add('counted'); tone(PENTA[Math.min(9, tapped)], .2, 'triangle', .18); say(numWord(tapped)); }
  function choose(n, btn) {
    if (busy) return; btn = btn || $$('.nbtn', g.stage).find(b => +b.textContent === n);
    if (n === answer) { busy = true; SFX.chime(); H.happy(); g.star(1); if (btn) { btn.classList.add('right'); retrigger(btn, 'pop'); } say(`${cap(numWord(n))}! ${pick(T().yes)}`, lang, null, 'hoot', H.el); g.after(2400, () => { if (g.progress()) g.levelUp(); else next(); }); }
    else { SFX.bad(); H.mood('oops'); if (btn) retrigger(btn, 'shake'); say(T().again); }
  }
  g.levels(4, () => { g.meter(5); next(); });
  g.key = e => { if (/^[0-9]$/.test(e.key)) choose(+e.key === 0 ? 10 : +e.key); };
});

/* SHAPES — color shapes → white shapes, turned → animal shadows */
game('shapes', 'learn', '🔺', g => {
  const H = g.host('hoot');
  g.stage.innerHTML = `<div class="holes"></div><div class="pieces"></div>`;
  let placed = 0;
  function round() {
    placed = 0; const lv = g.lvl(), holes = $('.holes', g.stage), pieces = $('.pieces', g.stage); holes.innerHTML = ''; pieces.innerHTML = '';
    const items = lv === 3 ? shuffle([...Array(10).keys()]).slice(0, 5).map(i => ({ id: 'a' + i, hole: `<div class="shadow">${ANIMAL_EMOJI[i]}</div>`, piece: `<div class="apiece">${ANIMAL_EMOJI[i]}</div>`, name: T().animals[i][0] }))
      : [0, 1, 2, 3, 4].map(si => ({ id: 's' + si, hole: shapeSvg(si, 'none', 'outline'), piece: shapeSvg(si, lv === 2 ? TT.white : COLORS[[0, 2, 3, 4, 6][si]]), name: T().shapes[si] }));
    shuffle(items).forEach(it => { const h = mk('div', 'hole', it.hole); h.dataset.s = it.id; holes.appendChild(h); });
    shuffle(items).forEach((it, k) => {
      const p = mk('div', 'piece', it.piece); p.dataset.s = it.id; p.dataset.name = it.name; p.dataset.x = (12 + k * 19 + rand(-3, 3)).toFixed(1); p.dataset.y = rand(58, 80).toFixed(1);
      p.style.left = p.dataset.x + '%'; p.style.top = p.dataset.y + '%'; p.style.setProperty('--r', (lv === 2 ? rand(-40, 40) : rand(-12, 12)) + 'deg'); drag(p); pieces.appendChild(p);
    });
    H.say(lv === 3 ? T().shadows : T().shapesHome, 'talk', lang, 0, CARD.emoji(lv === 3 ? '👤' : '🔺', '→ ⬚'));
  }
  function drag(p) {
    let st = null;
    const move = e => { if (!st) return; p.style.left = ((e.clientX - st.r.left) / st.r.width * 100) + '%'; p.style.top = ((e.clientY - st.r.top) / st.r.height * 100) + '%'; };
    g.on(p, 'pointerdown', e => { if (p.classList.contains('done')) return; e.preventDefault(); try { p.setPointerCapture(e.pointerId); } catch (_) {} st = { r: g.stage.getBoundingClientRect() }; p.classList.add('drag'); p.style.transition = 'none'; move(e); tone(PENTA[randi(2, 7)], .12, 'triangle', .12); });
    g.on(p, 'pointermove', move);
    const drop = e => {
      if (!st) return; st = null; p.classList.remove('drag'); p.style.transition = '';
      const hole = $$('.hole', g.stage).find(h => { const b = h.getBoundingClientRect(); return e.clientX > b.left - 20 && e.clientX < b.right + 20 && e.clientY > b.top - 20 && e.clientY < b.bottom + 20; });
      if (hole && hole.dataset.s === p.dataset.s && !hole.classList.contains('full')) {
        const b = hole.getBoundingClientRect(), r = g.stage.getBoundingClientRect();
        p.style.left = ((b.left + b.width / 2 - r.left) / r.width * 100) + '%'; p.style.top = ((b.top + b.height / 2 - r.top) / r.height * 100) + '%';
        p.classList.add('done'); hole.classList.add('full'); SFX.good(); H.mood('happy', 600); say(cap(p.dataset.name) + '!'); placed++;
        if (placed === 5) { g.star(2); g.after(900, () => { SFX.chime(); H.happy(pick(T().yes)); }); g.after(3000, () => { if (g.progress()) g.levelUp(); else round(); }); }
      } else { if (hole) { SFX.bad(); H.mood('oops'); } p.style.left = p.dataset.x + '%'; p.style.top = p.dataset.y + '%'; }
    };
    g.on(p, 'pointerup', drop); g.on(p, 'pointercancel', drop);
  }
  g.levels(3, () => { g.meter(2); round(); });
});

/* MIX COLORS — free mixing → make the color I ask → with white too */
game('mix', 'learn', '🧪', g => {
  const H = g.host('hoot');
  const W = 7; const NAMEW = { en: 'white', es: 'blanco', fr: 'blanc', pt: 'branco', ja: 'しろ', zh: '白色' };
  const RES = { '0,0': 0, '2,2': 2, '4,4': 4, '0,2': 1, '2,4': 3, '0,4': 5, '0,7': 6, '7,7': 7 };
  const colorOf = i => i === W ? TT.white : COLORS[i], nameOf = i => i === W ? NAMEW[lang] : T().colors[i];
  g.stage.innerHTML = `<div class="mixEq"><span class="eq a"></span><b>+</b><span class="eq b"></span><b>=</b><span class="eq c">?</span></div><div class="bowl"><div class="paint"></div></div><div class="pots"></div>`;
  let poured = [], busy = false, target = null;
  const pots = $('.pots', g.stage), bowl = $('.paint', g.stage);
  const chip = (el, ci) => { el.style.background = ci == null ? '' : colorOf(ci); el.textContent = ci == null ? (el.classList.contains('c') ? (target != null ? '' : '?') : '') : ''; if (el.classList.contains('c') && ci == null && target != null) el.style.background = colorOf(target); };
  function reset() { poured = []; busy = false; bowl.style.background = '#111'; bowl.style.transform = 'scale(.2)'; $$('.eq', g.stage).forEach(e => chip(e, null)); }
  function ask() { if (g.lvl() === 1) { target = null; reset(); return; } target = pick(g.lvl() === 3 ? [1, 3, 5, 6] : [1, 3, 5]); reset(); H.say(L[lang].makeColor(T().colors[target]), 'talk', lang, 0, CARD.color(target, '🧪')); }
  function buildPots() { pots.innerHTML = ''; (g.lvl() === 3 ? [0, 2, 4, W] : [0, 2, 4]).forEach((ci, k) => { const b = mk('button', 'pot', `<i style="background:${colorOf(ci)}"></i>`); b.addEventListener('click', () => pour(ci, b)); pots.appendChild(b); }); }
  function pour(ci, b) {
    if (busy) return; retrigger(b, 'pop');
    const drop = mk('div', 'drop'); drop.style.background = colorOf(ci); const r = g.stage.getBoundingClientRect(), pb = b.getBoundingClientRect(), bb = bowl.getBoundingClientRect();
    drop.style.left = (pb.left + pb.width / 2 - r.left) + 'px'; drop.style.top = (pb.top - r.top) + 'px'; g.stage.appendChild(drop);
    requestAnimationFrame(() => { drop.style.left = (bb.left + bb.width / 2 - r.left) + 'px'; drop.style.top = (bb.top + bb.height / 2 - r.top) + 'px'; drop.style.transform = 'translate(-50%,-50%) scale(1.6)'; });
    g.after(520, () => drop.remove()); sweep(500, 200, .3, 'sine', .15); poured.push(ci);
    chip($(poured.length === 1 ? '.eq.a' : '.eq.b', g.stage), ci); say(cap(nameOf(ci)));
    if (poured.length === 1) g.after(450, () => { bowl.style.background = colorOf(ci); bowl.style.transform = 'scale(.6)'; });
    if (poured.length === 2) {
      busy = true; const key = poured.slice().sort((a, b) => a - b).join(','), res = RES[key];
      g.after(600, () => {
        if (res == null) { bowl.style.background = '#c9c9c4'; bowl.style.transform = 'scale(1)'; SFX.bad(); H.mood('oops'); say(T().again); g.after(2600, () => target == null ? reset() : ask()); return; }
        bowl.style.background = colorOf(res); bowl.style.transform = 'scale(1)'; bowl.classList.add('swirl'); g.after(900, () => bowl.classList.remove('swirl'));
        const c = $('.eq.c', g.stage); c.style.background = colorOf(res); c.textContent = '';
        const [a, b2] = poured.map(nameOf); const line = poured[0] === poured[1] ? cap(nameOf(res)) + '!' : T().mix(a, b2, nameOf(res));
        if (target == null || res === target) { SFX.chime(); H.happy(); g.star(1); say(line, lang, null, 'hoot', H.el); g.after(3800, () => { if (g.progress()) g.levelUp(); else target == null ? reset() : ask(); }); }
        else { SFX.bad(); H.mood('oops'); say(line, lang, () => say(T().again)); g.after(4200, () => { reset(); }); }
      });
    }
  }
  g.levels(3, lv => { g.meter(6); buildPots(); lv === 1 ? (target = null, reset(), H.bubble('🔴 + 🟡 = ?')) : g.after(300, ask); });
  g.key = e => { const i = '1234'.indexOf(e.key); const b = pots.children[i]; if (b) b.click(); };
});

/* MEMORY — 3 → 4 → 6 → 8 pairs */
game('memory', 'learn', '🃏', g => {
  const H = g.host('hoot'); const LV = [[3, 3], [4, 4], [6, 4], [8, 4]]; let open = [], lock = false, found = 0, tries = 0;
  function deal() {
    const [pairs, cols] = LV[g.lvl() - 1]; found = 0; open = []; lock = false; tries = 0;
    const ids = shuffle([...Array(10).keys()]).slice(0, pairs), deck = shuffle([...ids, ...ids]);
    g.stage.innerHTML = ''; const grid = mk('div', 'mgrid'); grid.style.setProperty('--cols', cols); grid.style.setProperty('--rows', Math.ceil(deck.length / cols)); g.stage.appendChild(grid);
    deck.forEach(id => { const c = mk('button', 'mcard', `<div class="mi"><div class="mf mback"><b>?</b><span class="bars4"><i></i><i></i><i></i><i></i></span></div><div class="mf mface">${ANIMAL_EMOJI[id]}</div></div>`); c.dataset.id = id; c.addEventListener('click', () => flip(c)); grid.appendChild(c); });
    H.say(T().pairs, 'talk', lang, 0, CARD.emoji('🃏', '= 🃏'));
  }
  function flip(c) {
    if (lock || c.classList.contains('up')) return; c.classList.add('up'); tone(PENTA[randi(2, 7)], .15, 'triangle', .15); open.push(c);
    if (open.length < 2) return; const [a, b] = open; open = []; tries++;
    if (a.dataset.id === b.dataset.id) { found++; g.after(350, () => { a.classList.add('got'); b.classList.add('got'); SFX.good(); H.mood('happy', 700); g.star(1); say(cap(T().animals[+a.dataset.id][0]) + '!'); }); if (found === LV[g.lvl() - 1][0]) g.after(1500, () => { SFX.chime(); H.happy(pick(T().yes)); g.progress(); g.after(1800, () => g.levelUp()); }); }
    else { lock = true; g.after(1000, () => { a.classList.remove('up'); b.classList.remove('up'); lock = false; }); }
  }
  g.levels(4, () => { g.meter(1); deal(); });
});

/* PATTERNS — AB → AAB/ABB → ABC → a gap in the middle */
game('pattern', 'learn', '🔁', g => {
  const H = g.host('hoot');
  g.stage.innerHTML = `<div class="pRow"></div><div class="pChoices"></div>`;
  let busy = false, answer = null;
  const TYPES = [['A', 'B'], ['A', 'A', 'B'], ['A', 'B', 'B'], ['A', 'B', 'C']];
  const tok = (t, cls = '') => `<div class="ptok ${cls}">${shapeSvg(t.s, COLORS[t.c])}</div>`, same = (a, b) => a.s === b.s && a.c === b.c;
  function round() {
    busy = false; const lv = g.lvl();
    const type = lv === 1 ? TYPES[0] : lv === 2 ? pick(TYPES.slice(0, 3)) : pick(TYPES);
    const cs = shuffle([0, 2, 3, 4, 6]), ss = shuffle([0, 1, 2, 3, 4]);
    const unit = { A: { s: lv === 1 ? 0 : ss[0], c: cs[0] }, B: { s: lv === 1 ? 0 : ss[1], c: cs[1] }, C: { s: ss[2], c: cs[2] } };
    const seq = []; while (seq.length < 7) type.forEach(k => seq.push(unit[k]));
    const gap = lv === 4 ? randi(2, 5) : 6; answer = seq[gap];
    const row = $('.pRow', g.stage); row.innerHTML = seq.slice(0, 7).map((t, i) => i === gap ? `<div class="ptok q">?</div>` : tok(t)).join('');
    const pool = [unit.A, unit.B, unit.C, { s: ss[3], c: cs[3] }].filter((t, i, a) => a.findIndex(x => same(x, t)) === i);
    const opts = shuffle([answer, ...shuffle(pool.filter(t => !same(t, answer))).slice(0, 2)]);
    const ch = $('.pChoices', g.stage); ch.innerHTML = '';
    opts.forEach(t => { const b = mk('button', 'pbtn', tok(t)); b.addEventListener('click', () => choose(t, b)); ch.appendChild(b); });
    $$('.ptok', row).forEach((el, i) => { el.style.animationDelay = (i * .08) + 's'; el.classList.add('pop'); });
    H.say(T().next, 'talk', lang, 0, CARD.emoji('❓'));
  }
  function choose(t, b) {
    if (busy) return;
    if (same(t, answer)) { busy = true; const q = $('.ptok.q', g.stage); q.classList.remove('q'); q.innerHTML = shapeSvg(t.s, COLORS[t.c]); retrigger(q, 'pop'); $$('.pRow .ptok', g.stage).forEach((el, i) => g.after(i * 110, () => { tone(PENTA[i + 2], .2, 'triangle', .18); retrigger(el, 'bump'); })); H.happy(); g.star(1); g.after(900, () => say(pick(T().yes), lang, null, 'hoot', H.el)); g.after(2400, () => { if (g.progress()) g.levelUp(); else round(); }); }
    else { SFX.bad(); H.mood('oops'); retrigger(b, 'shake'); }
  }
  g.levels(4, () => { g.meter(4); round(); });
  g.key = e => { const i = '123'.indexOf(e.key); const b = $$('.pbtn', g.stage)[i]; if (b) b.click(); };
});

/* I SPY — find the animal → find the shape → how many? */
game('ispy', 'learn', '🔎', g => {
  const H = g.host('foxy'); let target = -1, busy = false, ask = '';
  const scene = mk('div', 'spyScene'), ch = mk('div', 'spyChoices'); g.stage.append(scene, ch);
  g.tool('🔊', () => ask && say(ask, lang, null, 'foxy', H.el));
  const place = (n, cols) => { const rows = Math.ceil(n / cols); return shuffle([...Array(cols * rows).keys()]).slice(0, n).map(c => [(c % cols + .5) / cols * 100 + rand(-4, 4), (Math.floor(c / cols) + .5) / rows * 100 + rand(-5, 5)]); };
  function round() {
    busy = false; scene.innerHTML = ''; ch.innerHTML = ''; const lv = g.lvl();
    if (lv === 1) {
      const ids = shuffle([...Array(10).keys()]).slice(0, 9); place(9, 5).forEach(([x, y], k) => { const b = mk('button', 'spy', ANIMAL_EMOJI[ids[k]]); b.dataset.id = ids[k]; Object.assign(b.style, { left: x + '%', top: y + '%', fontSize: rand(9, 13) + 'vmin' }); b.style.setProperty('--r', rand(-18, 18) + 'deg'); b.addEventListener('click', () => tap(b)); scene.appendChild(b); });
      target = pick(ids); ask = T().findWhere(T().animals[target][0]);
    } else if (lv === 2) {
      const pts = place(10, 5), shapes = shuffle([0, 1, 2, 3, 4, 0, 1, 2, 3, 4]);
      pts.forEach(([x, y], k) => { const b = mk('button', 'spy shp', shapeSvg(shapes[k], pick(COLORS))); b.dataset.id = shapes[k]; Object.assign(b.style, { left: x + '%', top: y + '%', width: rand(9, 13) + 'vmin' }); b.style.setProperty('--r', rand(-25, 25) + 'deg'); b.addEventListener('click', () => tap(b)); scene.appendChild(b); });
      target = randi(0, 4); ask = L[lang].findShape(L[lang].shapesA[target]);
    } else {
      target = randi(0, 9); const n = randi(2, 6), others = shuffle([...Array(10).keys()].filter(i => i !== target)).slice(0, 3), list = shuffle([...Array(n).fill(target), ...Array(9 - n).fill(0).map(() => pick(others))]);
      place(list.length, 5).forEach(([x, y], k) => { const b = mk('button', 'spy', ANIMAL_EMOJI[list[k]]); b.dataset.id = list[k]; Object.assign(b.style, { left: x + '%', top: y + '%', fontSize: rand(8, 11) + 'vmin' }); b.style.setProperty('--r', rand(-18, 18) + 'deg'); b.addEventListener('click', () => { if (+b.dataset.id === target && !b.dataset.n) { b.dataset.n = 1; b.classList.add('counted'); tone(PENTA[$$('.spy.counted', scene).length + 2], .2, 'triangle', .18); say(numWord($$('.spy.counted', scene).length)); } }); scene.appendChild(b); });
      ch.innerHTML = `<div class="spyAsk">${ANIMAL_EMOJI[target]} ?</div>`;
      shuffle([n, n + 1, n - 1]).forEach(v => { const b = mk('button', 'slab nbtn', v); b.addEventListener('click', () => { if (busy) return; if (v === n) win(b); else { SFX.bad(); H.mood('oops'); retrigger(b, 'shake'); } }); ch.appendChild(b); });
      ask = `${T().howMany} ${ANIMAL_EMOJI[target]}`; H.say(T().howMany, 'talk', lang, 0, CARD.emoji(ANIMAL_EMOJI[target], '?')); return;
    }
    H.say(ask, 'talk', lang, 0, g.lvl() === 1 ? CARD.emoji(ANIMAL_EMOJI[target], '🔎') : CARD.shape(target));
  }
  function win(b) { busy = true; b.classList.add('found'); SFX.good(); H.happy(); g.star(1); if (g.lvl() === 1) { const [a, s] = T().animals[target]; say(T().says(a, s), lang, null, 'foxy', H.el); } else say(pick(T().yes), lang, null, 'foxy', H.el); g.after(2400, () => { if (g.progress()) g.levelUp(); else round(); }); }
  function tap(b) { if (busy) return; if (+b.dataset.id === target) win(b); else { retrigger(b, 'shake'); H.mood('oops'); g.lvl() === 1 ? say(cap(T().animals[+b.dataset.id][0])) : say(cap(T().shapes[+b.dataset.id])); } }
  g.levels(3, () => { g.meter(5); round(); });
});
