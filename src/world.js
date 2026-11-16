/* ═════════ WORLD: seasons, holidays, time of day, weekly themes ═════════ */
const THEMES = {
  ocean: { e: '🐳', name: 'OCEAN', set: ['🐳', '🐙', '🦀', '🐠', '🦈', '🐬', '🐚', '🦑', '🐢', '⚓', '🏝️', '🌊'], hat: 'pirate' },
  dinos: { e: '🦕', name: 'DINOSAURS', set: ['🦕', '🦖', '🥚', '🌋', '🌿', '🦴', '🐊', '🦎', '🪨', '🌴', '☄️', '🐢'], hat: 'cowboy' },
  space: { e: '🚀', name: 'SPACE', set: ['🚀', '🪐', '🌙', '⭐', '👽', '☄️', '🛸', '🌍', '☀️', '🔭', '🧑‍🚀', '🌌'], hat: 'helmet' },
  farm: { e: '🐮', name: 'FARM', set: ['🐮', '🐷', '🐔', '🐑', '🐴', '🚜', '🌽', '🥕', '🐣', '🦆', '🍎', '🌻'], hat: 'cowboy' },
  trucks: { e: '🚒', name: 'THINGS THAT GO', set: ['🚒', '🚓', '🚑', '🚜', '🚚', '🚌', '🚂', '🚗', '🏎️', '🚁', '✈️', '🚲'], hat: 'cap' },
  bugs: { e: '🐞', name: 'BUGS', set: ['🐞', '🐝', '🦋', '🐛', '🐜', '🕷️', '🐌', '🌸', '🍃', '🌼', '🐸', '🌳'], hat: 'flower' },
  weather: { e: '🌈', name: 'WEATHER', set: ['☀️', '🌧️', '⛈️', '🌈', '❄️', '🌬️', '☁️', '🌪️', '☔', '⛄', '🌤️', '💧'], hat: 'beanie' },
  jungle: { e: '🦁', name: 'JUNGLE', set: ['🦁', '🐯', '🐒', '🦜', '🐘', '🦒', '🦓', '🐍', '🐊', '🍌', '🌴', '🦛'], hat: 'propeller' },
  food: { e: '🍕', name: 'YUMMY FOOD', set: ['🍕', '🍎', '🍌', '🍓', '🥕', '🍉', '🧀', '🍞', '🥦', '🍪', '🍦', '🥚'], hat: 'chef' },
  music: { e: '🎸', name: 'MUSIC', set: ['🎸', '🥁', '🎹', '🎺', '🎻', '🎷', '🎤', '🎵', '🪇', '🔔', '📯', '🪘'], hat: 'propeller' },
  castle: { e: '🏰', name: 'CASTLES', set: ['🏰', '👑', '🐉', '🛡️', '🗝️', '🦄', '🧙', '🧚', '💎', '🐸', '🌟', '🪄'], hat: 'crown' },
  arctic: { e: '🐧', name: 'ICE & SNOW', set: ['🐧', '🐻‍❄️', '🦭', '❄️', '⛄', '🧊', '🐋', '🦊', '🎿', '🛷', '🧤', '🏔️'], hat: 'beanie' },
  sports: { e: '⚽', name: 'SPORTS', set: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🥅', '🏆', '🛹', '🏄', '🚴'], hat: 'cap' },
  garden: { e: '🌻', name: 'GARDEN', set: ['🌻', '🌷', '🌱', '🐝', '🦋', '🐌', '🍅', '🥕', '🪱', '💧', '🌳', '🍓'], hat: 'flower' },
  city: { e: '🏙️', name: 'THE CITY', set: ['🏙️', '🚕', '🚦', '🏢', '🚇', '🏪', '🚌', '🚒', '🚓', '🏥', '🌉', '🎡'], hat: 'cap' },
  beach: { e: '🏖️', name: 'THE BEACH', set: ['🏖️', '🦀', '🐚', '🌊', '🏄', '🍉', '😎', '⛱️', '🪣', '🐬', '⛵', '🦩'], hat: 'cap' },
  spooky: { e: '🎃', name: 'SPOOKY', set: ['🎃', '👻', '🦇', '🕷️', '🍬', '🧙', '🌙', '🐈‍⬛', '🍭', '🕸️', '🦉', '🍂'], hat: 'witch', seasonal: true },
  holidays: { e: '🎄', name: 'WINTER HOLIDAYS', set: ['🎄', '⛄', '🎁', '❄️', '🦌', '🔔', '🧦', '🍪', '🕯️', '⭐', '🧣', '🛷'], hat: 'santa', seasonal: true },
  love: { e: '💗', name: 'HEARTS', set: ['💗', '🌹', '💌', '🍫', '🧸', '🐻', '🌷', '🍓', '🎀', '💐', '🦢', '🐝'], hat: 'bow', seasonal: true },
  spring: { e: '🐣', name: 'SPRING', set: ['🐣', '🐰', '🥚', '🌷', '🌸', '🐥', '🦋', '🌈', '🧺', '🥕', '🐑', '🌼'], hat: 'bunny', seasonal: true }
};
const THEME_ROTATION = ['ocean', 'dinos', 'space', 'farm', 'trucks', 'bugs', 'weather', 'jungle', 'food', 'music', 'castle', 'arctic', 'sports', 'garden', 'city', 'beach'];
const weekNo = (d = new Date()) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return t.getUTCFullYear() * 100 + Math.ceil(((t - y0) / 864e5 + 1) / 7); };
const md = d => (d.getMonth() + 1) * 100 + d.getDate();

/* special days → hat, effect, banner, forced theme */
function EVENT(d = new Date()) {
  const m = md(d);
  if (isBirthday()) return { id: 'birthday', hat: 'party', fx: 'confetti', banner: '🎂 HAPPY BIRTHDAY!' };
  const b = P().birthday; if (b) { const bd = new Date(b + 'T12:00'); bd.setFullYear(d.getFullYear()); const days = Math.ceil((bd - d) / 864e5); if (days > 0 && days <= 7) return { id: 'bdsoon', fx: 'confetti', banner: `🎂 ${days} ${days === 1 ? 'SLEEP' : 'SLEEPS'}!` }; }
  if (m >= 1231 || m <= 102) return { id: 'newyear', hat: 'party', fx: 'confetti', banner: '🎆 HAPPY NEW YEAR!' };
  if (m >= 1201) return { id: 'holidays', hat: 'santa', fx: 'snow', banner: '🎄 WINTER HOLIDAYS', theme: 'holidays' };
  if (m >= 1015 && m <= 1031) return { id: 'halloween', hat: 'witch', fx: 'bats', banner: m === 1031 ? '🎃 HAPPY HALLOWEEN!' : '🎃 SPOOKY SEASON', theme: 'spooky' };
  if (m >= 1120 && m <= 1130) return { id: 'thanks', hat: 'chef', fx: 'leaves', banner: '🥧 THANK YOU WEEK' };
  if (m >= 210 && m <= 214) return { id: 'love', hat: 'bow', fx: 'hearts', banner: '💗 HEARTS DAY', theme: 'love' };
  if (m >= 401 && m <= 410) return { id: 'spring', hat: 'bunny', fx: 'petals', banner: '🐣 SPRING!', theme: 'spring' };
  if (m >= 701 && m <= 704) return { id: 'july', hat: 'cap', fx: 'confetti', banner: '🎆 SUMMER FIREWORKS' };
  return null;
}
function SEASON(d = new Date()) { const mo = d.getMonth(); return mo <= 1 || mo === 11 ? { id: 'winter', fx: 'snow', hat: 'beanie' } : mo <= 4 ? { id: 'spring', fx: 'petals' } : mo <= 7 ? { id: 'summer', fx: 'sun', hat: 'cap' } : { id: 'fall', fx: 'leaves' }; }
function DAYPART(d = new Date()) { const h = d.getHours(); return h < 6 || h >= 20 ? 'night' : h < 11 ? 'morning' : h < 17 ? 'day' : 'evening'; }
function weekTheme() { const ev = EVENT(); if (ev && ev.theme) return ev.theme; return THEME_ROTATION[weekNo() % THEME_ROTATION.length]; }

/* hats: closet choice wins, otherwise the holiday/season hat */
hatFor = n => {
  const o = PROG.outfit && PROG.outfit[n]; if (o === 'none') return null; if (o) return o;
  const ev = EVENT(); return ev && ev.hat ? ev.hat : null;
};

/* ── ambient effects canvas behind the desktop ── */
function startFX(canvas) {
  const ctx = canvas.getContext('2d'); let parts = [], kind = '', raf = 0, last = performance.now();
  const fit = () => { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; };
  fit(); new ResizeObserver(fit).observe(canvas);
  const spawn = () => {
    const W = canvas.width, H = canvas.height;
    const base = { x: Math.random() * W, y: -20, vx: rand(-15, 15), vy: rand(20, 50), r: rand(3, 7), a: Math.random() * 6, va: rand(-2, 2) };
    if (kind === 'snow') return { ...base, c: '#ffffff', vy: rand(18, 40) };
    if (kind === 'leaves') return { ...base, c: pick(['#FF8A1F', '#FF3D3D', '#FFD60A', '#8B5A3C']), r: rand(5, 9) };
    if (kind === 'petals') return { ...base, c: pick(['#FF5DA2', '#ffd1e6', '#ffffff']), r: rand(4, 7) };
    if (kind === 'hearts') return { ...base, c: pick(['#FF5DA2', '#FF3D3D']), r: rand(6, 10), heart: true };
    if (kind === 'confetti') return { ...base, c: pick(COLORS), vy: rand(40, 90), r: rand(4, 7) };
    if (kind === 'bats') return { x: -20, y: rand(.05, .5) * H, vx: rand(40, 90), vy: 0, r: rand(8, 13), a: 0, va: 0, c: '#000', bat: true, ph: Math.random() * 6 };
    if (kind === 'sun') return { x: rand(0, W), y: H + 10, vx: 0, vy: -rand(10, 25), r: rand(2, 4), a: 0, va: 0, c: 'rgba(255,214,10,.5)' };
    return null;
  };
  const step = now => {
    const dt = Math.min(.05, (now - last) / 1000); last = now; const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (kind && !cfg.perf && parts.length < (kind === 'bats' ? 6 : 60) && Math.random() < (kind === 'bats' ? .01 : .3)) { const p = spawn(); if (p) parts.push(p); }
    for (const p of parts) {
      p.x += (p.vx + (p.bat ? 0 : Math.sin(now / 900 + p.a) * 12)) * dt; p.y += (p.vy + (p.bat ? Math.sin(now / 200 + p.ph) * 30 : 0)) * dt; p.a += p.va * dt;
      ctx.fillStyle = p.c;
      if (p.heart) { ctx.font = `${p.r * 2}px sans-serif`; ctx.fillText('♥', p.x, p.y); }
      else if (p.bat) { const f = Math.sin(now / 80 + p.ph) > 0; ctx.fillStyle = '#2a2a2a'; ctx.fillRect(p.x - p.r * .3, p.y - p.r * .3, p.r * .6, p.r * .6); ctx.fillRect(p.x - p.r, p.y - (f ? p.r * .6 : 0), p.r * .7, p.r * .3); ctx.fillRect(p.x + p.r * .3, p.y - (f ? p.r * .6 : 0), p.r * .7, p.r * .3); }
      else { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * (kind === 'confetti' ? .5 : 1)); ctx.restore(); }
    }
    parts = parts.filter(p => p.y < H + 30 && p.y > -40 && p.x < W + 40);
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return { set: k => { if (k !== kind) { kind = k; parts = []; } } };
}
