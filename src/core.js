'use strict';
/* ═════════ i2 miniOS — core ═════════ */
const MINIOS = { name: 'i2 miniOS', short: 'miniOS', version: '1.0', by: 'i2 interactive', url: 'https://i2interactive.com/' };
/* where we're running: the kiosk laptop (file:// or ?kiosk) vs. a normal browser tab or an <iframe> on the web */
const EMBEDDED = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
const KIOSK = !EMBEDDED && (location.protocol === 'file:' || /(^|[?&#])kiosk(=1|\b)/.test(location.search + location.hash));
/* Storage names are frozen from the pre-release build so a device that updates keeps every star, sticker and recording.
   They are never shown to anyone. Do not rename them. */
const KEY_PREFIX = 'otto';
const KEYS = { cfg: KEY_PREFIX + 'Cfg', prog: KEY_PREFIX + 'Prog', town: KEY_PREFIX + 'Town', song: KEY_PREFIX + 'Song', drawings: KEY_PREFIX + 'Drawings', week: KEY_PREFIX + 'Week', daily: KEY_PREFIX + 'Daily',
  idb: KEY_PREFIX + 'OS', legacyBackup: KEY_PREFIX, legacyBrandPack: KEY_PREFIX + 'Brand' };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pick = a => a[Math.floor(Math.random() * a.length)];
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
function retrigger(e, cls) { if (!e) return; e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls); }
function mk(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
const PXF = "'i2 Pixel','Courier New',monospace";

const TT = { green: '#19D36B', blue: '#3B62FF', red: '#FF3D3D', yellow: '#FFD60A', white: '#F2F2EE', orange: '#FF8A1F', purple: '#9B5DE5', pink: '#FF5DA2', teal: '#1FC7B6', brown: '#8B5A3C' };
const COLORS = [TT.red, TT.orange, TT.yellow, TT.green, TT.blue, TT.purple, TT.pink];
const PENTA = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
const ANIMAL_EMOJI = ['🐮', '🐶', '🐱', '🦆', '🐷', '🐑', '🦁', '🐸', '🐴', '🦉'];
const THING_EMOJI = ['🐱', '🐶', '🦖', '🚗', '🚀', '🐟', '🌸', '🐴'];
const THING_EN = ['cat', 'dog', 'dinosaur', 'car', 'rocket', 'fish', 'flower', 'horse'];
const PLACE_EMOJI = ['🏖️', '🌙', '🌲', '🏰', '🌊'];
const PLACE_EN = ['the beach', 'the moon', 'the forest', 'a castle', 'the ocean'];
const OBJ_EMOJI = ['⚽', '🎂', '🎈', '💎'];
const OBJ_EN = ['a ball', 'a cake', 'a balloon', 'a treasure'];
const HEROES = [2, 1, 0, 7];

/* ═════════ LANGUAGES ═════════ */
const L = {
 en: { name: 'English', bcp: 'en-US', index: 'INDEX', home: 'HOME',
  cats: { play: 'PLAY', learn: 'LEARN', '3d': '3D', music: 'MUSIC', robo: 'ROBO' },
  games: { runner: 'Run', rocket: 'Rocket', trucks: 'Trucks', fishing: 'Fishing', fireworks: 'Fireworks', bubbles: 'Bubbles', moles: 'Pop-Up', paint: 'Paint', abc: 'ABC', spell: 'Spell', count: 'Count', shapes: 'Shapes', mix: 'Mix Colors', memory: 'Memory', pattern: 'Patterns', ispy: 'I Spy', space: 'Space', blocks: 'Blocks', drive: 'Drive', bowling: 'Bowling', spin: 'Spin', piano: 'Piano', drums: 'Drums', rhythm: 'Rhythm', beats: 'Beat Maker', copy: 'Copy Me', talk: 'Talk', story: 'Stories', riddle: 'Riddles' },
  colors: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'],
  animals: [['cow', 'moo'], ['dog', 'woof woof'], ['cat', 'meow'], ['duck', 'quack quack'], ['pig', 'oink oink'], ['sheep', 'baa'], ['lion', 'roar'], ['frog', 'ribbit'], ['horse', 'neigh'], ['owl', 'hoo hoo']],
  says: (a, s) => `The ${a} says ${s}!`, findWhere: a => `Where is the ${a}?`,
  things: ['cat', 'dog', 'dinosaur', 'car', 'rocket', 'fish', 'flower', 'horse'],
  places: ['the beach', 'the moon', 'the forest', 'a castle', 'the ocean'], objects: ['a ball', 'a cake', 'a balloon', 'a treasure'],
  nums: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'], plus: 'plus', howMany: 'How many?',
  yes: ['Yes!', 'Great job!', 'You got it!', 'Nice!'], again: 'Try again!', hi: "Hi {name}! Let's play!", hiAnon: "Hi there! Let's play!",
  mix: (a, b, c) => `${cap(a)} and ${b} make ${c}!`, next: 'What comes next?', pairs: 'Find the pairs!', shapesHome: 'Put each shape in its home!',
  watch: 'Watch!', yourTurn: 'Your turn!', strike: 'Strike!', riddleHi: 'Here is a riddle!',
  shapes: ['circle', 'square', 'triangle', 'star', 'heart'],
  planets: ['the Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'],
  solids: ['cube', 'sphere', 'cone', 'cylinder', 'pyramid'],
  talkHi: 'Tap the microphone and talk to me!', listening: "I'm listening!", thinking: 'Hmm, let me think...',
  needSetup: 'Ask a grown-up to turn on my robot brain!', oops: 'Oops! My robot brain got sleepy. Try again!',
  hero: 'WHO?', where: 'WHERE?', what: 'WHAT?', storyHi: 'Pick a friend, a place, and a thing!', theEnd: 'The end!' },
 es: { name: 'Español', bcp: 'es-MX', index: 'ÍNDICE', home: 'INICIO',
  cats: { play: 'JUGAR', learn: 'APRENDER', '3d': '3D', music: 'MÚSICA', robo: 'ROBO' },
  games: { runner: 'Correr', rocket: 'Cohete', trucks: 'Camiones', fishing: 'Pesca', fireworks: 'Fuegos', bubbles: 'Burbujas', moles: 'Topos', paint: 'Pintar', abc: 'ABC', spell: 'Deletrear', count: 'Contar', shapes: 'Formas', mix: 'Mezclar', memory: 'Memoria', pattern: 'Patrones', ispy: 'Veo Veo', space: 'Espacio', blocks: 'Bloques', drive: 'Manejar', bowling: 'Boliche', spin: 'Girar', piano: 'Piano', drums: 'Tambores', rhythm: 'Ritmo', beats: 'Crea Ritmos', copy: 'Imítame', talk: 'Hablar', story: 'Cuentos', riddle: 'Adivinanzas' },
  colors: ['rojo', 'naranja', 'amarillo', 'verde', 'azul', 'morado', 'rosa'],
  animals: [['la vaca', 'muuu'], ['el perro', 'guau guau'], ['el gato', 'miau'], ['el pato', 'cuac cuac'], ['el cerdito', 'oinc oinc'], ['la oveja', 'beee'], ['el león', 'grrr'], ['la rana', 'croac croac'], ['el caballo', 'iiiii'], ['el búho', 'uuu uuu']],
  says: (a, s) => `¡${cap(a)} hace ${s}!`, findWhere: a => `¿Dónde está ${a}?`,
  things: ['gato', 'perro', 'dinosaurio', 'carro', 'cohete', 'pez', 'flor', 'caballo'],
  places: ['la playa', 'la luna', 'el bosque', 'un castillo', 'el mar'], objects: ['una pelota', 'un pastel', 'un globo', 'un tesoro'],
  nums: ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'], plus: 'más', howMany: '¿Cuántos hay?',
  yes: ['¡Sí!', '¡Muy bien!', '¡Lo lograste!'], again: '¡Otra vez!', hi: '¡Hola {name}! ¡Vamos a jugar!', hiAnon: '¡Hola! ¡Vamos a jugar!',
  mix: (a, b, c) => `¡${cap(a)} y ${b} hacen ${c}!`, next: '¿Qué sigue?', pairs: '¡Encuentra las parejas!', shapesHome: '¡Pon cada forma en su casita!',
  watch: '¡Mira!', yourTurn: '¡Te toca!', strike: '¡Strike!', riddleHi: '¡Una adivinanza!',
  shapes: ['círculo', 'cuadrado', 'triángulo', 'estrella', 'corazón'],
  planets: ['el Sol', 'Mercurio', 'Venus', 'la Tierra', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Neptuno'],
  solids: ['cubo', 'esfera', 'cono', 'cilindro', 'pirámide'],
  talkHi: '¡Toca el micrófono y háblame!', listening: '¡Te escucho!', thinking: 'Mmm, déjame pensar...',
  needSetup: '¡Pídele a un adulto que encienda mi cerebro de robot!', oops: '¡Ups! Mi cerebro de robot tiene sueño. ¡Otra vez!',
  hero: '¿QUIÉN?', where: '¿DÓNDE?', what: '¿QUÉ?', storyHi: '¡Escoge un amigo, un lugar y una cosa!', theEnd: '¡Fin!' },
 fr: { name: 'Français', bcp: 'fr-FR', index: 'INDEX', home: 'ACCUEIL',
  cats: { play: 'JOUER', learn: 'APPRENDRE', '3d': '3D', music: 'MUSIQUE', robo: 'ROBO' },
  games: { runner: 'Course', rocket: 'Fusée', trucks: 'Camions', fishing: 'Pêche', fireworks: 'Feux', bubbles: 'Bulles', moles: 'Taupes', paint: 'Dessin', abc: 'ABC', spell: 'Épeler', count: 'Compter', shapes: 'Formes', mix: 'Mélanger', memory: 'Mémoire', pattern: 'Suites', ispy: 'Cherche', space: 'Espace', blocks: 'Blocs', drive: 'Conduire', bowling: 'Bowling', spin: 'Tourner', piano: 'Piano', drums: 'Tambours', rhythm: 'Rythme', beats: 'Boîte à rythmes', copy: 'Imite-moi', talk: 'Parler', story: 'Histoires', riddle: 'Devinettes' },
  colors: ['rouge', 'orange', 'jaune', 'vert', 'bleu', 'violet', 'rose'],
  animals: [['la vache', 'meuh'], ['le chien', 'ouaf ouaf'], ['le chat', 'miaou'], ['le canard', 'coin coin'], ['le cochon', 'groin groin'], ['le mouton', 'bêêê'], ['le lion', 'grrr'], ['la grenouille', 'croâ croâ'], ['le cheval', 'hiiii'], ['le hibou', 'hou hou']],
  says: (a, s) => `${cap(a)} fait ${s} !`, findWhere: a => `Où est ${a} ?`,
  things: ['chat', 'chien', 'dinosaure', 'voiture', 'fusée', 'poisson', 'fleur', 'cheval'],
  places: ['la plage', 'la lune', 'la forêt', 'un château', 'la mer'], objects: ['une balle', 'un gâteau', 'un ballon', 'un trésor'],
  nums: ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'], plus: 'plus', howMany: 'Combien il y en a ?',
  yes: ['Oui !', 'Bravo !', 'Super !'], again: 'Essaie encore !', hi: 'Salut {name} ! On joue ?', hiAnon: 'Salut ! On joue ?',
  mix: (a, b, c) => `${cap(a)} et ${b}, ça fait ${c} !`, next: 'Et après ?', pairs: 'Trouve les paires !', shapesHome: 'Range chaque forme dans sa maison !',
  watch: 'Regarde !', yourTurn: 'À toi !', strike: 'Strike !', riddleHi: 'Une devinette !',
  shapes: ['cercle', 'carré', 'triangle', 'étoile', 'cœur'],
  planets: ['le Soleil', 'Mercure', 'Vénus', 'la Terre', 'Mars', 'Jupiter', 'Saturne', 'Uranus', 'Neptune'],
  solids: ['cube', 'sphère', 'cône', 'cylindre', 'pyramide'],
  talkHi: 'Appuie sur le micro et parle-moi !', listening: 'Je t’écoute !', thinking: 'Hmm, je réfléchis...',
  needSetup: 'Demande à un grand d’allumer mon cerveau de robot !', oops: 'Oups ! Essaie encore !',
  hero: 'QUI ?', where: 'OÙ ?', what: 'QUOI ?', storyHi: 'Choisis un ami, un endroit et une chose !', theEnd: 'Fin !' },
 pt: { name: 'Português', bcp: 'pt-BR', index: 'ÍNDICE', home: 'INÍCIO',
  cats: { play: 'BRINCAR', learn: 'APRENDER', '3d': '3D', music: 'MÚSICA', robo: 'ROBÔ' },
  games: { runner: 'Correr', rocket: 'Foguete', trucks: 'Caminhões', fishing: 'Pescaria', fireworks: 'Fogos', bubbles: 'Bolhas', moles: 'Toupeiras', paint: 'Pintar', abc: 'ABC', spell: 'Soletrar', count: 'Contar', shapes: 'Formas', mix: 'Misturar', memory: 'Memória', pattern: 'Padrões', ispy: 'Cadê?', space: 'Espaço', blocks: 'Blocos', drive: 'Dirigir', bowling: 'Boliche', spin: 'Girar', piano: 'Piano', drums: 'Tambores', rhythm: 'Ritmo', beats: 'Batidas', copy: 'Me Imite', talk: 'Conversar', story: 'Histórias', riddle: 'Adivinhas' },
  colors: ['vermelho', 'laranja', 'amarelo', 'verde', 'azul', 'roxo', 'rosa'],
  animals: [['a vaca', 'muuu'], ['o cachorro', 'au au'], ['o gato', 'miau'], ['o pato', 'quá quá'], ['o porquinho', 'óinc óinc'], ['a ovelha', 'méééé'], ['o leão', 'grrr'], ['o sapo', 'croac croac'], ['o cavalo', 'hiiii'], ['a coruja', 'uhu uhu']],
  says: (a, s) => `${cap(a)} faz ${s}!`, findWhere: a => `Cadê ${a}?`,
  things: ['gato', 'cachorro', 'dinossauro', 'carro', 'foguete', 'peixe', 'flor', 'cavalo'],
  places: ['a praia', 'a lua', 'a floresta', 'um castelo', 'o mar'], objects: ['uma bola', 'um bolo', 'um balão', 'um tesouro'],
  nums: ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'], plus: 'mais', howMany: 'Quantos tem?',
  yes: ['Isso!', 'Muito bem!', 'Você conseguiu!'], again: 'Tenta de novo!', hi: 'Oi {name}! Vamos brincar!', hiAnon: 'Oi! Vamos brincar!',
  mix: (a, b, c) => `${cap(a)} e ${b} fazem ${c}!`, next: 'O que vem depois?', pairs: 'Ache os pares!', shapesHome: 'Coloque cada forma na sua casinha!',
  watch: 'Olha!', yourTurn: 'Sua vez!', strike: 'Strike!', riddleHi: 'Uma adivinha!',
  shapes: ['círculo', 'quadrado', 'triângulo', 'estrela', 'coração'],
  planets: ['o Sol', 'Mercúrio', 'Vênus', 'a Terra', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Netuno'],
  solids: ['cubo', 'esfera', 'cone', 'cilindro', 'pirâmide'],
  talkHi: 'Toque no microfone e fale comigo!', listening: 'Estou ouvindo!', thinking: 'Hmm, deixa eu pensar...',
  needSetup: 'Peça para um adulto ligar meu cérebro de robô!', oops: 'Opa! Tenta de novo!',
  hero: 'QUEM?', where: 'ONDE?', what: 'O QUÊ?', storyHi: 'Escolha um amigo, um lugar e uma coisa!', theEnd: 'Fim!' },
 ja: { name: '日本語', bcp: 'ja-JP', index: 'もくじ', home: 'ホーム',
  cats: { play: 'あそぶ', learn: 'まなぶ', '3d': '3D', music: 'おんがく', robo: 'ロボ' },
  games: { runner: 'はしる', rocket: 'ロケット', trucks: 'トラック', fishing: 'さかなつり', fireworks: 'はなび', bubbles: 'あわあわ', moles: 'もぐら', paint: 'おえかき', abc: 'ABC', spell: 'スペル', count: 'かぞえる', shapes: 'かたち', mix: 'いろまぜ', memory: 'メモリー', pattern: 'パターン', ispy: 'みつけて', space: 'うちゅう', blocks: 'ブロック', drive: 'ドライブ', bowling: 'ボウリング', spin: 'くるくる', piano: 'ピアノ', drums: 'たいこ', rhythm: 'リズム', beats: 'ビート', copy: 'まねっこ', talk: 'おしゃべり', story: 'おはなし', riddle: 'なぞなぞ' },
  colors: ['あか', 'オレンジ', 'きいろ', 'みどり', 'あお', 'むらさき', 'ピンク'],
  animals: [['うしさん', 'モーモー'], ['いぬさん', 'ワンワン'], ['ねこさん', 'ニャーニャー'], ['あひるさん', 'ガーガー'], ['ぶたさん', 'ブーブー'], ['ひつじさん', 'メェー'], ['ライオンさん', 'ガオー'], ['かえるさん', 'ケロケロ'], ['うまさん', 'ヒヒーン'], ['ふくろうさん', 'ホーホー']],
  says: (a, s) => `${a}は ${s}！`, findWhere: a => `${a}は どこ？`,
  things: ['ねこ', 'いぬ', 'きょうりゅう', 'くるま', 'ロケット', 'おさかな', 'おはな', 'うま'],
  places: ['ビーチ', 'おつきさま', 'もり', 'おしろ', 'うみ'], objects: ['ボール', 'ケーキ', 'ふうせん', 'たからもの'],
  nums: ['ぜろ', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう', 'じゅう'], plus: 'たす', howMany: 'いくつ あるかな？',
  yes: ['そう！', 'すごいね！', 'できたね！'], again: 'もういっかい！', hi: '{name}、あそぼう！', hiAnon: 'こんにちは！ あそぼう！',
  mix: (a, b, c) => `${a}と ${b}で ${c}！`, next: 'つぎは なにかな？', pairs: 'おなじ カードを さがそう！', shapesHome: 'かたちを おうちに いれてね！',
  watch: 'みててね！', yourTurn: 'やってみて！', strike: 'ストライク！', riddleHi: 'なぞなぞだよ！',
  shapes: ['まる', 'しかく', 'さんかく', 'ほし', 'ハート'],
  planets: ['たいよう', 'すいせい', 'きんせい', 'ちきゅう', 'かせい', 'もくせい', 'どせい', 'てんのうせい', 'かいおうせい'],
  solids: ['りっぽうたい', 'きゅう', 'えんすい', 'えんちゅう', 'ピラミッド'],
  talkHi: 'マイクを おして はなしてね！', listening: 'きいてるよ！', thinking: 'うーん、かんがえるね…',
  needSetup: 'おとなの ひとに ロボットの あたまを つけて もらってね！', oops: 'あれれ？ もういっかい やってみて！',
  hero: 'だれ？', where: 'どこ？', what: 'なに？', storyHi: 'ともだちと ばしょと ものを えらんでね！', theEnd: 'おしまい！' },
 zh: { name: '中文', bcp: 'zh-CN', index: '目录', home: '首页',
  cats: { play: '玩', learn: '学', '3d': '3D', music: '音乐', robo: '机器人' },
  games: { runner: '奔跑', rocket: '火箭', trucks: '卡车', fishing: '钓鱼', fireworks: '烟花', bubbles: '泡泡', moles: '打地鼠', paint: '画画', abc: 'ABC', spell: '拼写', count: '数数', shapes: '形状', mix: '混色', memory: '记忆', pattern: '规律', ispy: '找一找', space: '太空', blocks: '积木', drive: '开车', bowling: '保龄球', spin: '转一转', piano: '钢琴', drums: '打鼓', rhythm: '节奏', beats: '节拍', copy: '跟我做', talk: '聊天', story: '故事', riddle: '猜谜' },
  colors: ['红色', '橙色', '黄色', '绿色', '蓝色', '紫色', '粉色'],
  animals: [['奶牛', '哞哞'], ['小狗', '汪汪'], ['小猫', '喵喵'], ['小鸭子', '嘎嘎'], ['小猪', '哼哼'], ['小绵羊', '咩咩'], ['狮子', '嗷呜'], ['青蛙', '呱呱'], ['小马', '咴咴'], ['猫头鹰', '咕咕']],
  says: (a, s) => `${a}说：${s}！`, findWhere: a => `${a}在哪里？`,
  things: ['小猫', '小狗', '恐龙', '汽车', '火箭', '小鱼', '花', '小马'],
  places: ['海滩', '月亮', '森林', '城堡', '大海'], objects: ['球', '蛋糕', '气球', '宝藏'],
  nums: ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'], plus: '加', howMany: '有几个？',
  yes: ['对啦！', '真棒！', '你做到了！'], again: '再试一次！', hi: '你好{name}！我们来玩吧！', hiAnon: '你好！我们来玩吧！',
  mix: (a, b, c) => `${a}和${b}变成${c}！`, next: '下一个是什么？', pairs: '找出一样的！', shapesHome: '把形状放回家！',
  watch: '看我！', yourTurn: '轮到你了！', strike: '全中！', riddleHi: '猜谜语！',
  shapes: ['圆形', '正方形', '三角形', '星星', '爱心'],
  planets: ['太阳', '水星', '金星', '地球', '火星', '木星', '土星', '天王星', '海王星'],
  solids: ['正方体', '球体', '圆锥', '圆柱', '金字塔'],
  talkHi: '按一下话筒，跟我说话吧！', listening: '我在听哦！', thinking: '嗯，让我想一想……',
  needSetup: '请大人帮我打开机器人大脑吧！', oops: '哎呀，再试一次吧！',
  hero: '谁？', where: '哪里？', what: '什么？', storyHi: '选一个朋友、一个地方和一个东西吧！', theEnd: '讲完啦！' }
};

/* ═════════ SETTINGS ═════════ */
const DEFAULTS = { lang2: 'es', voices: {}, mode: 'auto', voiceMode: 'apps', perf: false, unlockAll: false, limitMin: 0, bedtime: '', 
  tts: { provider: 'browser', openaiModel: 'gpt-4o-mini-tts', elevenKey: '', elevenVoice: '', elevenModel: 'eleven_flash_v2_5', elevenVoices: {}, openaiVoices: {} },
  brand: { osName: MINIOS.name, short: MINIOS.short, theme: 'teletext', logo: '', cast: {} }, hidden: [], bgm: { on: true, vol: .35, where: 'desk', shuffle: true, builtin: true },
  profile: { name: '', kidWord: 'child', birthday: '', favAnimal: '', favColor: '', favVehicle: '', favFood: '', loves: '', family: '', baby: '' },
  comfy: { port: '8188', workflow: '' }, art: 'brain', artModel: 'claude-haiku-5-5', deskStyle: 'calm',
  home: { ip: '', port: '1234', model: '' },
  cloud: { provider: 'anthropic', model: '', claudeKey: '', openaiKey: '' } };
function loadCfg() {
  let s = {}; try { s = JSON.parse(localStorage.getItem(KEYS.cfg) || '{}'); } catch (e) {}
  /* settings saved by the pre-release build: move the old built-in name to the new one, and the baby's name to its new field */
  if (s.brand && new RegExp(`^${KEY_PREFIX}( os)?$`, 'i').test(s.brand.osName || '') && new RegExp(`^${KEY_PREFIX}$`, 'i').test(s.brand.short || '')) { s.brand.osName = MINIOS.name; s.brand.short = MINIOS.short; }
  if (s.profile && s.profile.brother && !s.profile.baby) s.profile.baby = s.profile.brother;
  if (s.profile) delete s.profile.brother;
  return { ...DEFAULTS, ...s, voices: { ...(s.voices || {}) }, home: { ...DEFAULTS.home, ...(s.home || {}) }, cloud: { ...DEFAULTS.cloud, ...(s.cloud || {}) },
    tts: { ...DEFAULTS.tts, ...(s.tts || {}) }, brand: { ...DEFAULTS.brand, ...(s.brand || {}) }, bgm: { ...DEFAULTS.bgm, ...(s.bgm || {}) }, profile: { ...DEFAULTS.profile, ...(s.profile || {}) }, comfy: { ...DEFAULTS.comfy, ...(s.comfy || {}) } };
}
let cfg = loadCfg();
function saveCfg() { try { localStorage.setItem(KEYS.cfg, JSON.stringify(cfg)); } catch (e) {} }
let lang = 'en';
const T = () => L[lang];
const numWord = n => (T().nums[n] != null ? T().nums[n] : String(n));

/* ═════════ SOUND ═════════ */
let AC = null, MASTER = null, NOISE = null;
function audio() {
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      MASTER = AC.createDynamicsCompressor(); MASTER.threshold.value = -12; MASTER.knee.value = 12; MASTER.ratio.value = 5; MASTER.connect(AC.destination);
      NOISE = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const d = NOISE.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (AC.state === 'suspended') AC.resume();
  } catch (e) {}
  return AC;
}
function tone(f, d = .35, type = 'sine', v = .22, delay = 0) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + Math.max(0, delay), o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(MASTER); o.start(t); o.stop(t + d + .05);
}
function sweep(f1, f2, d, type = 'triangle', v = .25, delay = 0) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + Math.max(0, delay), o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d + .04);
  o.connect(g); g.connect(MASTER); o.start(t); o.stop(t + d + .08);
}
function noise(d = .2, v = .3, type = 'highpass', freq = 1000, delay = 0, q = 1) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + Math.max(0, delay), s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = NOISE; f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  s.connect(f); f.connect(g); g.connect(MASTER); s.start(t, Math.random() * .5); s.stop(t + d + .05);
}
const SFX = {
  tap: () => { tone(660, .1, 'triangle', .14); tone(990, .1, 'triangle', .1, .05); },
  pop: (p = 1) => sweep(900 * p, 160 * p, .12, 'triangle', .3),
  coin: () => { tone(988, .08, 'square', .07); tone(1319, .25, 'square', .07, .07); },
  jump: () => sweep(280, 720, .16, 'square', .06),
  bump: () => { sweep(220, 90, .18, 'triangle', .3); noise(.08, .2, 'lowpass', 600); },
  good: () => [660, 880, 1320].forEach((f, i) => tone(f, .18, 'triangle', .17, i * .07)),
  bad: () => tone(170, .22, 'triangle', .18),
  chime: () => [784, 1047, 1319, 1568].forEach((f, i) => tone(f, .55, 'sine', .14, i * .08)),
  boom: (v = 1) => { noise(.9, .45 * v, 'lowpass', 500); sweep(120, 40, .5, 'sine', .45 * v); },
  crackle: () => { for (let i = 0; i < 12; i++) noise(.03, .1, 'highpass', 4000, .3 + Math.random() * .8); },
  honk: () => { tone(330, .4, 'square', .06); tone(415, .4, 'square', .06); },
  boing: () => sweep(200, 620, .25, 'sine', .25),
  whoosh: () => noise(.45, .2, 'bandpass', 900, 0, .7),
  clatter: () => { for (let i = 0; i < 4; i++) noise(.06, .2, 'bandpass', 2200 + i * 500, i * .03, 3); }
};
const DRUM = {
  kick: (d = 0) => sweep(160, 42, .32, 'sine', .9, d),
  snare: (d = 0) => { noise(.16, .42, 'highpass', 1500, d); tone(190, .1, 'triangle', .22, d); },
  hat: (d = 0) => noise(.05, .2, 'highpass', 7500, d),
  clap: (d = 0) => { [0, .012, .024].forEach(o => noise(.05, .32, 'bandpass', 1400, d + o, 1.5)); noise(.18, .22, 'bandpass', 1400, d + .035, 1.5); },
  tom: (d = 0) => sweep(230, 95, .32, 'sine', .6, d),
  crash: (d = 0) => noise(1.1, .22, 'highpass', 4500, d),
  bell: (f, d = 0) => { tone(f, .6, 'sine', .17, d); tone(f * 2.01, .3, 'sine', .05, d); }
};
/* sample-accurate step sequencer on the audio clock */
function sequencer(g, bpm, perBeat, onStep) {
  const s = { bpm, step: 0, next: 0, on: false };
  s.start = () => { audio(); if (!AC) return; s.on = true; s.step = 0; s.next = AC.currentTime + .08; };
  s.stop = () => { s.on = false; };
  s.stepDur = () => 60 / s.bpm / perBeat;
  g.every(25, () => {
    if (!s.on || !AC) return;
    while (s.next < AC.currentTime + .12) { onStep(s.step, s.next - AC.currentTime, s.next); s.step++; s.next += s.stepDur(); }
  });
  return s;
}

/* ═════════ VOICE ═════════ */
function voiceScore(v, bcp) {
  let s = 0;
  if (/Natural|Online/i.test(v.name)) s += 100;
  if (/Google/i.test(v.name)) s += 60;
  if (v.lang.toLowerCase() === bcp.toLowerCase()) s += 15;
  if (/Ana|Jenny|Aria|Emma|Ava|Dalia|Denise|Francisca|Nanami|Xiaoxiao/i.test(v.name)) s += 10;
  if (/David|Zira|Mark|Hazel|George|Susan|Helena|Sabina|Hortense|Maria|Haruka|Huihui/i.test(v.name) && !/Natural|Online/i.test(v.name)) s -= 40;
  return s;
}
function voicesFor(code) {
  if (!('speechSynthesis' in window)) return [];
  const bcp = L[code].bcp;
  return speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith(code)).sort((a, b) => voiceScore(b, bcp) - voiceScore(a, bcp));
}
function voiceFor(code) { const vs = voicesFor(code), saved = cfg.voices[code]; return (saved && vs.find(v => v.name === saved)) || vs[0] || null; }
if ('speechSynthesis' in window) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => {}; }
/* say() and hush() live in sys.js (voice manager) */

/* ═════════ ROBOT BRAIN: LM Studio (home PC) + cloud ═════════ */
let homeCache = { t: 0, ok: false }, lastBrain = '';
function homeBase() {
  let h = (cfg.home.ip || '').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!h) return '';
  if (!/:\d+$/.test(h)) h += ':' + (String(cfg.home.port || '1234').trim() || '1234');
  return 'http://' + h + '/v1';
}
async function probeHome(force) {
  const base = homeBase(); if (!base) return false;
  if (!force && Date.now() - homeCache.t < 30000) return homeCache.ok;
  let ok = false; try { const r = await withTimeout(fetch(base + '/models'), 2500); ok = r.ok; } catch (e) {}
  homeCache = { t: Date.now(), ok }; return ok;
}
const cloudReady = () => cfg.cloud.provider === 'anthropic' ? !!cfg.cloud.claudeKey : !!cfg.cloud.openaiKey;
async function chatBackend() {
  if (cfg.mode !== 'cloud' && await probeHome()) return 'home';
  if (cfg.mode !== 'home' && cloudReady()) return 'cloud';
  return null;
}
const stripThink = s => (s || '').replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/^[\s\S]*<\/think>/i, '').trim();
const cleanReply = s => (s || '').replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/^[\s\S]*<\/think>/i, '').replace(/[*_#`]/g, '').trim();
/* messages: {role, content, image?} — image is a data: URL, converted per backend */
const toOai = m => m.image ? { role: m.role, content: [{ type: 'text', text: m.content }, { type: 'image_url', image_url: { url: m.image } }] } : { role: m.role, content: m.content };
const toAnt = m => m.image ? { role: m.role, content: [{ type: 'image', source: { type: 'base64', media_type: m.image.slice(5, m.image.indexOf(';')), data: m.image.split(',')[1] } }, { type: 'text', text: m.content }] } : { role: m.role, content: m.content };
async function oaiChat(base, key, model, messages, system, maxTokens, raw) {
  const headers = { 'Content-Type': 'application/json' }; if (key) headers.Authorization = 'Bearer ' + key;
  const body = { messages: [{ role: 'system', content: system }, ...messages.map(toOai)], max_tokens: maxTokens, temperature: .8 };
  if (model) body.model = model;
  const r = await withTimeout(fetch(base + '/chat/completions', { method: 'POST', headers, body: JSON.stringify(body) }), 90000);
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || j.error || ('HTTP ' + r.status));
  const out = (raw ? stripThink : cleanReply)(j.choices?.[0]?.message?.content);
  if (!out) throw new Error('The model replied with nothing (a "thinking" model may have used up its tokens). Try a non-reasoning model.');
  return out;
}
/* one direct call to the Claude Messages API (key stays in this browser) */
async function claudeCall(model, messages, system, maxTokens, raw) {
  if (!cfg.cloud.claudeKey) throw new Error('Add a Claude API key in Grown-Ups → Robot brain.');
  const r = await withTimeout(fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': cfg.cloud.claudeKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: messages.map(toAnt) }) }), 90000);
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || ('HTTP ' + r.status));
  return (raw ? stripThink : cleanReply)(j.content.map(c => c.text || '').join(''));
}
async function chat(messages, system, maxTokens = 300, opt = {}) {
  const b = await chatBackend(); if (!b) throw new Error('nobackend'); lastBrain = b; if (typeof castSwap === 'function') system = castSwap(system);
  if (b === 'home') {
    const base = homeBase(); let model = cfg.home.model;
    if (!model) { try { const m = await (await fetch(base + '/models')).json(); model = m.data?.[0]?.id; } catch (e) {} }
    return oaiChat(base, '', model, messages, system, Math.max(maxTokens, 1024), opt.raw);
  }
  if (cfg.cloud.provider === 'anthropic') return claudeCall(cfg.cloud.model || 'claude-haiku-5-5', messages, system, maxTokens, opt.raw);
  return oaiChat('https://api.openai.com/v1', cfg.cloud.openaiKey, cfg.cloud.model || 'gpt-4o-mini', messages, system, maxTokens, opt.raw);
}
const KID_RULES = `- Only gentle, happy, age-appropriate content. Nothing scary, violent, sad, grown-up or unsafe.
- Never ask for personal details, never suggest going anywhere or keeping secrets from their grown-ups.
- If the child seems hurt, scared or upset, tell them to go find a grown-up right now.`;
function kidLangs() { return cfg.lang2 !== 'none' && L[cfg.lang2] ? `English and ${L[cfg.lang2].name}` : 'English'; }

/* ═════════ GAME CONTEXT ═════════ */
function makeCtx(stage, tools) {
  const ac = new AbortController(), timers = [], disp = []; let raf = 0, alive = true;
  const g = {
    stage, tools, key: null, alive: () => alive,
    on(t, ev, fn, opt) { t.addEventListener(ev, fn, { ...(opt || {}), signal: ac.signal }); },
    after(ms, fn) { const id = setTimeout(() => { if (alive) fn(); }, ms); timers.push(id); return id; },
    every(ms, fn) { const id = setInterval(() => { if (alive) fn(); }, ms); timers.push(id); return id; },
    loop(fn) {
      let last = performance.now();
      const step = now => { if (!alive) return; const dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now; try { fn(dt, now / 1000); } catch (e) { console.error(e); } raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    },
    dispose(fn) { disp.push(fn); },
    tool(html, fn, cls) { const b = mk('button', 'gtool ' + (cls || ''), html); b.addEventListener('click', e => { SFX.tap(); fn(b, e); }, { signal: ac.signal }); tools.appendChild(b); return b; },
    canvas(parent = stage) {
      const cv = mk('canvas', 'gcv'); parent.appendChild(cv); const ctx = cv.getContext('2d');
      const C = { cv, ctx, w: 1, h: 1, dpr: 1, onResize: null };
      const fit = () => {
        const r = parent.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
        const w = Math.max(1, r.width), h = Math.max(1, r.height);
        if (Math.abs(w - C.w) < 1 && Math.abs(h - C.h) < 1 && cv.width) return;
        C.w = w; C.h = h; C.dpr = d; cv.width = Math.round(w * d); cv.height = Math.round(h * d); ctx.setTransform(d, 0, 0, d, 0, 0);
        if (C.onResize) C.onResize();
      };
      C.fit = fit; fit(); const ro = new ResizeObserver(fit); ro.observe(parent); g.dispose(() => ro.disconnect());
      C.pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
      return C;
    },
    three(opts = {}) {
      const r = new THREE.WebGLRenderer({ antialias: true });
      r.setPixelRatio(cfg.perf ? .85 : Math.min(1.5, window.devicePixelRatio || 1));
      r.domElement.className = 'gcv'; stage.appendChild(r.domElement);
      const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(opts.fov || 50, 1, .1, opts.far || 1000);
      const fit = () => { const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight); r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
      fit(); const ro = new ResizeObserver(fit); ro.observe(stage);
      g.dispose(() => { ro.disconnect(); scene.traverse(o => { o.geometry?.dispose?.(); const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach(x => { x.map?.dispose?.(); x.dispose?.(); }); }); r.dispose(); try { r.forceContextLoss(); } catch (e) {} });
      const ray = new THREE.Raycaster();
      const hit = (e, objs) => { const b = r.domElement.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1), cam); return ray.intersectObjects(objs, true); };
      return { r, scene, cam, el: r.domElement, hit, render: () => r.render(scene, cam) };
    },
    end() { alive = false; ac.abort(); timers.forEach(t => { clearTimeout(t); clearInterval(t); }); cancelAnimationFrame(raf); disp.forEach(f => { try { f(); } catch (e) {} }); }
  };
  return g;
}
/* drag-to-orbit camera with tap detection */
function orbit(g, cam, dom, o = {}) {
  const s = { az: o.az ?? 0, el: o.el ?? .5, dist: o.dist ?? 20, target: o.target || new THREE.Vector3(), minEl: o.minEl ?? .05, maxEl: o.maxEl ?? 1.45, minD: o.minD ?? 3, maxD: o.maxD ?? 80 };
  let down = null, moved = false;
  g.on(dom, 'pointerdown', e => { down = { x: e.clientX, y: e.clientY, az: s.az, el: s.el }; moved = false; try { dom.setPointerCapture(e.pointerId); } catch (_) {} });
  g.on(dom, 'pointermove', e => {
    if (!down) return; const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (!moved && Math.hypot(dx, dy) > 14) moved = true;
    if (moved && !o.noDrag) { s.az = down.az - dx * .008; s.el = clamp(down.el + dy * .006, s.minEl, s.maxEl); }
  });
  g.on(dom, 'pointerup', e => { if (down && !moved && o.onTap) o.onTap(e); if (down && moved && o.onSwipe) o.onSwipe(e, e.clientX - down.x, e.clientY - down.y); down = null; });
  g.on(dom, 'pointercancel', () => { down = null; });
  g.on(dom, 'wheel', e => { s.dist = clamp(s.dist * (1 + Math.sign(e.deltaY) * .1), s.minD, s.maxD); }, { passive: true });
  s.apply = () => { const t = s.target; cam.position.set(t.x + s.dist * Math.cos(s.el) * Math.sin(s.az), t.y + s.dist * Math.sin(s.el), t.z + s.dist * Math.cos(s.el) * Math.cos(s.az)); cam.lookAt(t); };
  s.dragging = () => !!down && moved;
  return s;
}

/* ═════════ 2D DRAWING KIT ═════════ */
class Particles {
  constructor() { this.a = []; }
  burst(x, y, color, n = 12, sp = 300, o = {}) {
    for (let i = 0; i < n; i++) {
      const ang = o.ang != null ? o.ang + rand(-o.spread, o.spread) : Math.random() * Math.PI * 2, s = sp * (o.exact ? 1 : (.3 + Math.random() * .7)), life = o.life || rand(.5, 1);
      this.a.push({ x, y, vx: Math.cos(ang) * s + (o.vx || 0), vy: Math.sin(ang) * s - (o.up || 0), life, max: life, color: Array.isArray(color) ? pick(color) : color, size: o.size || rand(3, 7), g: o.g ?? 600, drag: o.drag ?? 1.5 });
    }
  }
  update(dt) { for (const p of this.a) { const k = Math.exp(-p.drag * dt); p.vx *= k; p.vy *= k; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; } this.a = this.a.filter(p => p.life > 0); }
  draw(ctx) { for (const p of this.a) { ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.max * 1.4)); ctx.fillStyle = p.color; ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); } ctx.globalAlpha = 1; }
}
function starPath(ctx, x, y, r, rot = -Math.PI / 2) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * .45 : r, a = rot + i * Math.PI / 5; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); }
function drawRobo(ctx, x, y, s, t, o = {}) {
  const u = s / 12; ctx.save(); ctx.translate(x, y); if (o.tilt) ctx.rotate(o.tilt); if (o.flip) ctx.scale(-1, 1);
  const run = o.run ? Math.sin(t * 18) : 0;
  ctx.fillStyle = TT.white;
  if (!o.noLegs) { ctx.fillRect(-2.2 * u, -2.2 * u - (run > 0 ? run * u : 0), 1.4 * u, 2.2 * u); ctx.fillRect(.8 * u, -2.2 * u + (run < 0 ? run * u : 0), 1.4 * u, 2.2 * u); }
  ctx.fillStyle = '#2643C8'; ctx.fillRect(-3 * u, -5.6 * u, 6 * u, 3.6 * u);
  ctx.fillStyle = TT.yellow; ctx.fillRect(-1 * u, -4.8 * u, 2 * u, 1.4 * u);
  const hy = -10.2 * u - (o.run ? Math.abs(run) * .4 * u : 0);
  ctx.fillStyle = TT.blue; ctx.fillRect(-3.6 * u, hy, 7.2 * u, 4.6 * u);
  ctx.fillStyle = TT.yellow; ctx.fillRect(-4.3 * u, hy + 1.4 * u, .7 * u, 1.8 * u); ctx.fillRect(3.6 * u, hy + 1.4 * u, .7 * u, 1.8 * u);
  const blink = (t % 4) < .12, eh = blink ? .3 * u : 1.7 * u;
  ctx.fillStyle = TT.white; ctx.fillRect(-2.5 * u, hy + 1.1 * u + (1.7 * u - eh) / 2, 1.7 * u, eh); ctx.fillRect(.8 * u, hy + 1.1 * u + (1.7 * u - eh) / 2, 1.7 * u, eh);
  if (!blink) { ctx.fillStyle = '#000'; const lk = (o.look || 0) * .35 * u; ctx.fillRect(-1.9 * u + lk, hy + 1.6 * u, .75 * u, .75 * u); ctx.fillRect(1.35 * u + lk, hy + 1.6 * u, .75 * u, .75 * u); }
  ctx.fillStyle = TT.yellow; ctx.fillRect(-1.4 * u, hy + 3.3 * u, 2.8 * u, o.happy ? .9 * u : .5 * u);
  ctx.fillStyle = TT.white; ctx.fillRect(-.3 * u, hy - 1.4 * u, .6 * u, 1.4 * u);
  ctx.fillStyle = (t % 1) < .5 ? TT.red : TT.yellow; ctx.fillRect(-.75 * u, hy - 2.3 * u, 1.5 * u, 1 * u);
  ctx.restore();
}
function hud(ctx, w, h, n, icon = 'star') {
  const s = Math.max(22, h * .06); ctx.save(); ctx.font = `700 ${s}px ${PXF}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
  const txt = String(n), tw = ctx.measureText(txt).width;
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(w - tw - s * 2.6, s * .35, tw + s * 2.25, s * 1.4);
  ctx.fillStyle = TT.white; ctx.fillText(txt, w - s * .7, s * 1.05);
  if (icon === 'star') { starPath(ctx, w - tw - s * 1.6, s * 1.05, s * .5); ctx.fillStyle = TT.yellow; ctx.fill(); }
  else { ctx.font = `${s}px sans-serif`; ctx.fillText(icon, w - tw - s * 1.1, s * 1.1); }
  ctx.restore();
}
/* SVG shapes (100×100) shared by Shapes, Patterns, Spin buttons */
function starPoints(cx, cy, r, ri) { const p = []; for (let i = 0; i < 10; i++) { const rr = i % 2 ? ri : r, a = -Math.PI / 2 + i * Math.PI / 5; p.push((cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1)); } return p.join(' '); }
const SHAPE_SVG = [
  c => `<circle cx="50" cy="50" r="42" fill="${c}"/>`,
  c => `<rect x="10" y="10" width="80" height="80" fill="${c}"/>`,
  c => `<polygon points="50,6 94,90 6,90" fill="${c}"/>`,
  c => `<polygon points="${starPoints(50, 54, 46, 20)}" fill="${c}"/>`,
  c => `<path d="M50 90 C 18 66, 4 46, 17 25 C 29 7, 47 13, 50 30 C 53 13, 71 7, 83 25 C 96 46, 82 66, 50 90 Z" fill="${c}"/>`
];
const shapeSvg = (i, c, cls = '') => `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true">${SHAPE_SVG[i](c)}</svg>`;
