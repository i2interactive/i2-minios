/* ═════════ THE CAST — 16×16 pixel characters ═════════ */
const CAST = {
  robo: { pitch: 1, color: TT.blue,
    pal: { B: '#3B62FF', D: '#2643C8', Y: '#FFD60A', R: '#FF3D3D', w: '#F2F2EE', k: '#111' },
    base: ['.......RR.......', '.......ww.......', '..BBBBBBBBBBBB..', '.BBBBBBBBBBBBBB.', 'YBBwwwBBBBwwwBBY', 'YBBwkwBBBBwkwBBY', 'YBBwwwBBBBwwwBBY', '.BBBBBBBBBBBBBB.',
      '.BBBBYYYYYYBBBB.', '..DDDDDDDDDDDD..', '....DDDDDDDD....', '...BBBBBBBBBB...', '..BBBBYYYYBBBB..', '..BBBBBBBBBBBB..', '...ww......ww...', '...ww......ww...'],
    ex: { blink: { 4: 'YBBBBBBBBBBBBBBY', 5: 'YBBwwwBBBBwwwBBY', 6: 'YBBBBBBBBBBBBBBY' }, happy: { 8: '.BBBYkkkkkkYBBB.' }, talk: { 8: '.BBBBYkkkkYBBBB.' },
      oops: { 5: 'YBBwwwBBBBwwwBBY', 6: 'YBBwkwBBBBwkwBBY', 8: '.BBBBBYYYYBBBBB.' }, run1: { 14: '..ww........ww..', 15: '..ww........ww..' }, run2: { 14: '....ww....ww....', 15: '....ww....ww....' } } },
  dino: { pitch: .8, color: TT.green,
    pal: { G: '#19D36B', H: '#0F8A45', L: '#B8F5C8', Y: '#FFD60A', R: '#FF3D3D', w: '#F2F2EE', k: '#111' },
    base: ['.........GGGGG..', '........GGGGGGG.', '........GwwGGGGG', '........GwkGGGGG', '........GGGGGGGG', '........GGGkkkkk', '...Y....GGGGGGG.', '..YGY..GGGGG....',
      '.YGGGGGGGGGGG...', 'GGGGGGGLLLGGG...', 'GG.GGGLLLLGGHH..', '...GGGLLLLGG....', '....GGGGGGGG....', '....GG...GG.....', '....GG...GG.....', '...HHH..HHH.....'],
    ex: { blink: { 2: '........GGGGGGGG', 3: '........GkkGGGGG' }, happy: { 5: '........GGGGkkkk', 6: '...Y....GGGkRRk.' }, talk: { 5: '........GGGGkkkk', 6: '...Y....GGGkRRk.' },
      oops: { 5: '........GGGGGkkk' }, run1: { 13: '...GG.....GG....', 14: '...GG.....GG....', 15: '..HHH....HHH....' }, run2: { 13: '.....GG.GG......', 14: '.....GG.GG......', 15: '....HHH.HHH.....' } } },
  hoot: { pitch: 1.2, color: TT.yellow,
    pal: { Y: '#FFD60A', O: '#FF8A1F', L: '#FFF3C4', w: '#F2F2EE', k: '#111', R: '#FF3D3D' },
    base: ['..O..........O..', '..OO........OO..', '..YYYYYYYYYYYY..', '.YwwwwYYYYwwwwY.', '.YwkkwYYYYwkkwY.', '.YwkkwYYYYwkkwY.', '.YwwwwYOOYwwwwY.', '.YYYYYYOOYYYYYY.',
      '.YYLLLLLLLLLLYY.', 'YYYLLLLLLLLLLYYY', 'YYYLLLLLLLLLLYYY', '.YYLLLLLLLLLLYY.', '..YYLLLLLLLLYY..', '...YYYYYYYYYY...', '....OO....OO....', '................'],
    ex: { blink: { 3: '.YYYYYYYYYYYYYY.', 4: '.YkkkkYYYYkkkkY.', 5: '.YYYYYYYYYYYYYY.', 6: '.YYYYYYOOYYYYYY.' }, happy: { 7: '.YYYYYOkkOYYYYY.' }, talk: { 7: '.YYYYYOkkOYYYYY.' },
      oops: { 4: '.YwwwwYYYYwwwwY.', 6: '.YwkkwYOOYwkkwY.' }, run1: { 14: '...OO......OO...' }, run2: { 14: '.....OO..OO.....' } } },
  foxy: { pitch: 1.35, color: TT.red,
    pal: { O: '#FF8A1F', D: '#C45A0E', w: '#F2F2EE', k: '#111' },
    base: ['.OO..........OO.', '.OOO........OOO.', '.OkOO......OOkO.', '.OOOOOOOOOOOOOO.', 'OOOOOOOOOOOOOOOO', 'OOOkkOOOOOOkkOOO', 'OOOkkOOOOOOkkOOO', 'OwwwOOOOOOOOwwwO',
      '.wwwwwOkkOwwwww.', '..wwwwwwwwwwww..', '...wwwwwwwwww...', '....OOOOOOOO....', '...OOOwwwwOOO...', '..OOOwwwwwwOOOww', '..OOOwwwwwwOOOOw', '..kk..kk..kk....'],
    ex: { blink: { 5: 'OOOOOOOOOOOOOOOO', 6: 'OOOkkOOOOOOkkOOO' }, happy: { 9: '..wwwwwkkwwwww..' }, talk: { 9: '..wwwwwkkwwwww..' },
      oops: { 9: '..wwwwwwkwwwww..' }, run1: { 15: '.kk...kk..kk....' }, run2: { 15: '...kk..kk...kk..' } } }
};
const CAST_IDS = Object.keys(CAST);
const EXTRA = {};                      // other sprites (pets, baby…) registered later with the same format
const sprDef = n => CAST[n] || EXTRA[n];

/* ── hats: pixel art drawn above/over the head; bottom row sits on the anchor row ── */
const HAT_PAL = { R: '#FF3D3D', Y: '#FFD60A', B: '#3B62FF', G: '#19D36B', P: '#9B5DE5', w: '#F2F2EE', k: '#111', O: '#FF8A1F', N: '#8B5A3C', K: '#FF5DA2', T: '#1FC7B6' };
const HATS = {
  party: ['...w...', '..RRR..', '.RYRYR.', 'RRYRYRR'],
  santa: ['......ww', '.RRRRR..', 'RRRRRRR.', 'wwwwwwww'],
  witch: ['...PP....', '...PPP...', '..PPPPP..', '..PYYYP..', 'PPPPPPPPP'],
  beanie: ['...ww...', '..BBBB..', '.BBBBBB.', 'wwwwwwww'],
  crown: ['Y..Y..Y', 'YY.Y.YY', 'YYYYYYY', 'YRYBYRY'],
  cap: ['.RRRR...', 'RRwRRR..', 'RRRRRRRR'],
  flower: ['.K.K.', 'KKYKK', '.KKK.', '..G..'],
  chef: ['.wwwww.', 'wwwwwww', 'wwwwwww', '.kkkkk.'],
  cowboy: ['...NNNNN...', '...NkkkN...', 'NNNNNNNNNNN'],
  pirate: ['..kkkkk..', '.kkkwkkk.', 'kkkkkkkkk'],
  bunny: ['w.....w', 'wK...Kw', 'wK...Kw', 'ww...ww'],
  propeller: ['RRR.BBB', '...Y...', '..GGG..', '.GYGYG.'],
  helmet: ['..TTTTT..', '.TTwwwTT.', 'TTTTTTTTT'],
  bow: ['KK...KK', 'KKKwKKK', 'KK...KK'],
  viking: ['w.......w', 'w.NNNNN.w', '.NNYYYNN.', 'NNNNNNNNN'],
  grad: ['kkkkkkkkk', '...kkk.Y.', '...kkk.Y.']
};
const HAT_ANCHOR = { robo: [8, 2], dino: [11, 0], hoot: [8, 2], foxy: [8, 3] };
let hatFor = n => null;                 // replaced by the closet/season system
const SPR_SVG = {}, SPR_IMG = {};
function spriteSVG(n, ex = 'idle', hat) {
  if (hat === undefined) hat = hatFor(n);
  const key = n + ex + (hat || ''); if (SPR_SVG[key]) return SPR_SVG[key];
  const c = sprDef(n), rows = c.base.slice(), p = c.ex[ex] || (ex === 'talk' ? c.ex.happy : null); if (p) for (const k in p) rows[+k] = p[k];
  const run = (row, y, pal, x0 = 0) => { let r = '', x = 0; while (x < row.length) { const ch = row[x]; if (ch === '.' || !pal[ch]) { x++; continue; } let e = x; while (e < row.length && row[e] === ch) e++; r += `<rect x="${x + x0}" y="${y}" width="${e - x}" height="1.02" fill="${pal[ch]}"/>`; x = e; } return r; };
  let r = rows.map((row, y) => run(row, y, c.pal)).join('');
  if (hat && HATS[hat]) { const h = HATS[hat], [cx, by] = (c.hat || HAT_ANCHOR[n] || [8, 2]), x0 = cx - Math.floor(h[0].length / 2); h.forEach((row, i) => r += run(row, by - h.length + 1 + i, HAT_PAL, x0)); }
  return SPR_SVG[key] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -4 16 20" width="160" height="200" shape-rendering="crispEdges">${r}</svg>`;
}
function spriteImg(n, ex = 'idle') { const hat = hatFor(n), key = n + ex + (hat || ''); if (SPR_IMG[key]) return SPR_IMG[key]; const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(spriteSVG(n, ex, hat)); return SPR_IMG[key] = im; }
const preloadSprites = () => CAST_IDS.forEach(n => ['idle', 'blink', 'happy', 'talk', 'oops', 'run1', 'run2'].forEach(ex => spriteImg(n, ex)));
/* draw on a canvas: (x, y) = bottom-centre; size = body height */
function drawSprite(ctx, n, ex, x, y, size, o = {}) {
  const im = spriteImg(n, ex); if (!im.complete || !im.naturalWidth) return;
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); if (o.flip) ctx.scale(-1, 1); if (o.sy) ctx.scale(1, o.sy);
  ctx.drawImage(im, -size / 2, -size * 1.25, size, size * 1.25); ctx.restore();
}
const charHTML = (n, cls = '', hat) => `<div class="char ${cls}" data-c="${n}"${hat !== undefined ? ` data-hat="${hat || ''}"` : ''}>${spriteSVG(n, 'idle', hat)}</div>`;
const elSVG = (el, ex) => spriteSVG(el.dataset.c, ex, el.dataset.hat !== undefined ? (el.dataset.hat || null) : undefined);
function mood(el, ex, ms = 1200) { if (!el || !el.dataset.c) return; el._mood = ex; el._moodUntil = performance.now() + ms; el._ex = ex; el.innerHTML = elSVG(el, ex); retrigger(el, ex === 'oops' ? 'shake' : 'hop'); }
setInterval(() => {
  const now = performance.now();
  $$('.char').forEach(el => {
    if (!el.dataset.c || !el.isConnected || el.offsetParent === null) return;
    let ex = 'idle';
    if (el._mood && now < el._moodUntil) ex = el._mood;
    else if (el.classList.contains('speaking')) ex = (el._t = !el._t) ? 'talk' : 'idle';
    else if (el.classList.contains('dance')) ex = (el._t = !el._t) ? 'run1' : 'run2';
    else if (Math.random() < .03) ex = 'blink';
    if (el._ex !== ex) { el._ex = ex; el.innerHTML = elSVG(el, ex); }
  });
}, 150);

/* ═════════ MORE WORDS ═════════ */
const L2 = {
  en: { popColor: c => `Pop the ${c} bubbles!`, catchColor: c => `Catch the ${c} fish!`, findNum: n => `Find number ${n}!`, makeColor: c => `Can you make ${c}?`,
    shapesA: ['the circle', 'the square', 'the triangle', 'the star', 'the heart'], findShape: s => `Find ${s}!`, levelUp: n => `Level ${n}!`, deliver: c => `Take it to the ${c} house!`,
    whereIs: p => `Where is ${p}?`, whatShape: 'What shape is it?', build: 'Build it!', draw: 'What should I draw?', colorIt: 'Color it in!', sayIt: 'Say something!', showMe: 'Show me something!', shadows: 'Match the shadows!', super: 'Super star!',
    castHi: { robo: "Beep boop! I'm Robo!", dino: "Rawr! I'm Dino! I love to run!", hoot: "Hoo hoo! I'm Hoot! Let's learn!", foxy: "Hi! I'm Foxy! Let's go exploring!" } },
  es: { popColor: c => `¡Revienta las burbujas de color ${c}!`, catchColor: c => `¡Atrapa el pez de color ${c}!`, findNum: n => `¡Busca el número ${n}!`, makeColor: c => `¿Puedes hacer ${c}?`,
    shapesA: ['el círculo', 'el cuadrado', 'el triángulo', 'la estrella', 'el corazón'], findShape: s => `¡Busca ${s}!`, levelUp: n => `¡Nivel ${n}!`, deliver: c => `¡Llévalo a la casa de color ${c}!`,
    whereIs: p => `¿Dónde está ${p}?`, whatShape: '¿Qué forma tiene?', build: '¡Constrúyelo!', draw: '¿Qué dibujo?', colorIt: '¡Píntalo!', sayIt: '¡Di algo!', showMe: '¡Enséñame algo!', shadows: '¡Busca su sombra!', super: '¡Súper estrella!',
    castHi: { robo: '¡Bip bup! ¡Soy Robo!', dino: '¡Grrr! ¡Soy Dino! ¡Me encanta correr!', hoot: '¡Uh uh! ¡Soy Hoot! ¡Vamos a aprender!', foxy: '¡Hola! ¡Soy Foxy! ¡Vamos a explorar!' } },
  fr: { popColor: c => `Éclate les bulles de couleur ${c} !`, catchColor: c => `Attrape le poisson de couleur ${c} !`, findNum: n => `Trouve le numéro ${n} !`, makeColor: c => `Tu peux faire du ${c} ?`,
    shapesA: ['le cercle', 'le carré', 'le triangle', "l'étoile", 'le cœur'], findShape: s => `Trouve ${s} !`, levelUp: n => `Niveau ${n} !`, deliver: c => `Apporte-le à la maison de couleur ${c} !`,
    whereIs: p => `Où est ${p} ?`, whatShape: 'Quelle forme ?', build: 'Construis-le !', draw: 'Je dessine quoi ?', colorIt: 'Colorie-le !', sayIt: 'Dis quelque chose !', showMe: 'Montre-moi quelque chose !', shadows: 'Trouve les ombres !', super: 'Super étoile !',
    castHi: { robo: 'Bip boup ! Je suis Robo !', dino: "Rrraah ! Je suis Dino ! J'adore courir !", hoot: 'Hou hou ! Je suis Hoot ! On apprend ?', foxy: 'Salut ! Je suis Foxy ! On explore ?' } },
  pt: { popColor: c => `Estoure as bolhas de cor ${c}!`, catchColor: c => `Pegue o peixe de cor ${c}!`, findNum: n => `Ache o número ${n}!`, makeColor: c => `Você consegue fazer ${c}?`,
    shapesA: ['o círculo', 'o quadrado', 'o triângulo', 'a estrela', 'o coração'], findShape: s => `Ache ${s}!`, levelUp: n => `Nível ${n}!`, deliver: c => `Leve até a casa de cor ${c}!`,
    whereIs: p => `Cadê ${p}?`, whatShape: 'Que forma é essa?', build: 'Construa!', draw: 'O que eu desenho?', colorIt: 'Pinte!', sayIt: 'Fale alguma coisa!', showMe: 'Me mostra alguma coisa!', shadows: 'Ache as sombras!', super: 'Super estrela!',
    castHi: { robo: 'Bip bop! Eu sou o Robo!', dino: 'Rawr! Eu sou o Dino! Adoro correr!', hoot: 'Uhu! Eu sou o Hoot! Vamos aprender!', foxy: 'Oi! Eu sou a Foxy! Vamos explorar!' } },
  ja: { popColor: c => `${c}の あわを わってね！`, catchColor: c => `${c}の さかなを つって！`, findNum: n => `${n}を さがして！`, makeColor: c => `${c}を つくれるかな？`,
    shapesA: ['まる', 'しかく', 'さんかく', 'ほし', 'ハート'], findShape: s => `${s}を さがして！`, levelUp: n => `レベル${n}！`, deliver: c => `${c}の おうちに とどけてね！`,
    whereIs: p => `${p}は どこ？`, whatShape: 'なんの かたち？', build: 'つくってみよう！', draw: 'なにを かこうか？', colorIt: 'いろを ぬってね！', sayIt: 'なにか いってみて！', showMe: 'なにか みせて！', shadows: 'かげに あわせてね！', super: 'スーパースター！',
    castHi: { robo: 'ピポパポ！ ロボだよ！', dino: 'ガオー！ ディノだよ！ はしるの だいすき！', hoot: 'ホーホー！ フートだよ！ いっしょに まなぼう！', foxy: 'やあ！ フォクシーだよ！ たんけんに いこう！' } },
  zh: { popColor: c => `戳破${c}的泡泡！`, catchColor: c => `钓${c}的鱼！`, findNum: n => `找数字${n}！`, makeColor: c => `你能调出${c}吗？`,
    shapesA: ['圆形', '正方形', '三角形', '星星', '爱心'], findShape: s => `找${s}！`, levelUp: n => `第${n}关！`, deliver: c => `送到${c}的房子！`,
    whereIs: p => `${p}在哪里？`, whatShape: '这是什么形状？', build: '来搭吧！', draw: '我画什么呢？', colorIt: '来涂颜色吧！', sayIt: '说点什么吧！', showMe: '给我看看吧！', shadows: '把它们放进影子里！', super: '超级明星！',
    castHi: { robo: '哔哔！我是Robo！', dino: '嗷呜！我是Dino！我最爱跑步！', hoot: '咕咕！我是Hoot！我们来学习吧！', foxy: '嗨！我是Foxy！我们去探险吧！' } }
};
Object.keys(L2).forEach(k => Object.assign(L[k], L2[k]));
Object.assign(L.en.games, { quiz: 'Quiz', draw: 'Robo Draws', sayit: 'Say It', showme: 'Show Me' });
Object.assign(L.es.games, { quiz: 'Preguntas', draw: 'Robo Dibuja', sayit: '¡Dilo!', showme: 'Enséñame' });
Object.assign(L.fr.games, { quiz: 'Quiz', draw: 'Robo Dessine', sayit: 'Dis-le', showme: 'Montre-moi' });
Object.assign(L.pt.games, { quiz: 'Quiz', draw: 'Robo Desenha', sayit: 'Fale!', showme: 'Me Mostra' });
Object.assign(L.ja.games, { quiz: 'クイズ', draw: 'ロボのえ', sayit: 'いってみて', showme: 'みせて' });
Object.assign(L.zh.games, { quiz: '问答', draw: '机器人画画', sayit: '说说看', showme: '给我看' });

/* ═════════ PROGRESS ═════════ */
let PROG = { stars: 0, games: {}, buddy: 'robo', plays: {} };
try { PROG = { ...PROG, ...JSON.parse(localStorage.getItem(KEYS.prog) || '{}') }; } catch (e) {}
/* the pre-release build's link-cable fields are gone; drop them so they don't ride along in backups */
['dadCodes', 'dadLevelDay', 'dadHiDay', 'linkUsed'].forEach(k => delete PROG[k]);
const saveProg = () => { try { localStorage.setItem(KEYS.prog, JSON.stringify(PROG)); } catch (e) {} };
const gstat = id => PROG.games[id] || (PROG.games[id] = { lvl: 1, max: 1 });

/* ═════════ SAFE SVG (for Robo Draws) ═════════ */
const SVG_OK = new Set(['svg', 'g', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path']);
function safeSVG(raw) {
  const m = (raw || '').match(/<svg[\s\S]*<\/svg>/i); if (!m) return null;
  const doc = new DOMParser().parseFromString(m[0], 'text/html'), svg = doc.querySelector('svg');
  if (!svg || svg.namespaceURI !== 'http://www.w3.org/2000/svg') return null;
  const clean = el => {
    [...el.children].forEach(c => { if (!SVG_OK.has(c.nodeName.toLowerCase())) c.remove(); else clean(c); });
    [...el.attributes].forEach(a => { const n = a.name.toLowerCase(), v = a.value; if (n.startsWith('on') || n.includes('href') || n === 'style' || /url\s*\(|javascript:/i.test(v)) el.removeAttribute(a.name); });
  };
  clean(svg); if (!svg.getAttribute('viewBox')) svg.setAttribute('viewBox', '0 0 400 300'); svg.removeAttribute('width'); svg.removeAttribute('height');
  return document.importNode(svg, true);
}
