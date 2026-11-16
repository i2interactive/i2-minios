/* ═════════ SYSTEM: storage, voice manager, profile ═════════ */

/* IndexedDB for the big stuff: voice clips, photos, drawings, cached speech, imported apps */
const IDB = (() => {
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open(KEYS.idb, 1);
    r.onupgradeneeded = () => { const d = r.result; ['clips', 'tts', 'photos', 'media', 'apps', 'kv'].forEach(n => { if (!d.objectStoreNames.contains(n)) d.createObjectStore(n); }); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const tx = (store, mode, fn) => open().then(d => new Promise((res, rej) => { const t = d.transaction(store, mode), req = fn(t.objectStore(store)); t.oncomplete = () => res(req && req.result); t.onerror = () => rej(t.error); }));
  return {
    get: (s, k) => tx(s, 'readonly', st => st.get(k)).catch(() => undefined),
    set: (s, k, v) => tx(s, 'readwrite', st => st.put(v, k)),
    del: (s, k) => tx(s, 'readwrite', st => st.delete(k)),
    clear: s => tx(s, 'readwrite', st => st.clear()),
    all: s => open().then(d => new Promise(res => { const out = [], r = d.transaction(s).objectStore(s).openCursor(); r.onsuccess = () => { const c = r.result; if (c) { out.push([c.key, c.value]); c.continue(); } else res(out); }; r.onerror = () => res(out); })).catch(() => [])
  };
})();
const blobToDataURL = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
const dataURLToBlob = async u => (await fetch(u)).blob();

/* ── profile ── */
const P = () => cfg.profile;
const KID_NAME = () => String(cfg.profile.name || '').trim();          // '' until a grown-up sets it
const KID = () => KID_NAME() || 'the child';                              // for the robot brain
const kidName = (fallback = 'Friend') => KID_NAME() || fallback;          // for things the child sees
/* 2-player names: player 1 is the kid; player 2 cycles through the grown-up's list (tap the 👤 button in a 2P game) */
const P2 = {
  list: () => (cfg.profile.p2names || '').split(',').map(s => s.trim()).filter(Boolean),
  name: () => { const l = P2.list(); return l.length ? l[(PROG.p2i || 0) % l.length] : 'P2'; },
  next: () => { PROG.p2i = ((PROG.p2i || 0) + 1) % Math.max(1, P2.list().length); saveProg(); },
  me: () => (cfg.profile.name || '').trim() || 'P1'
};
function p2Tool(g, isOn, onChange) {
  const b = g.tool('👤 ' + P2.name(), btn => { P2.next(); btn.textContent = '👤 ' + P2.name(); if (onChange) onChange(); }, 'p2tool');
  const upd = () => { b.style.display = isOn() ? '' : 'none'; b.textContent = '👤 ' + P2.name(); }; upd(); return upd;
}
const KIDW = () => ({ boy: 'boy', girl: 'girl' })[cfg.profile.kidWord] || 'child';
/* pronouns for the robot brain, from Grown-Ups → About the child (default: they/them) */
const KIDP = () => ({ boy: { s: 'he', o: 'him', p: 'his' }, girl: { s: 'she', o: 'her', p: 'her' } })[cfg.profile.kidWord] || { s: 'they', o: 'them', p: 'their' };
function ageMonths() { const b = P().birthday; if (!b) return 30; const d = new Date(b + 'T12:00'), n = new Date(); return (n.getFullYear() - d.getFullYear()) * 12 + n.getMonth() - d.getMonth() - (n.getDate() < d.getDate() ? 1 : 0); }
function AGE() { const m = ageMonths(), y = Math.floor(m / 12), r = m % 12; return r >= 9 ? `almost-${y + 1}-year-old` : r >= 5 ? `${y}½-year-old` : `${y}-year-old`; }
function KIDR() {
  const p = P(), likes = [p.favAnimal && `favorite animal: ${p.favAnimal}`, p.favColor && `favorite color: ${p.favColor}`, p.favVehicle && `loves ${p.favVehicle}`, p.favFood && `favorite food: ${p.favFood}`, p.loves && `also loves: ${p.loves}`, p.baby && `has a baby in the family named ${p.baby}`].filter(Boolean).join('; ');
  return `${KID_RULES}${likes ? `\n- About the child (weave in lightly, not every time): ${likes}.` : ''}`;
}
const isBirthday = () => { const b = P().birthday; if (!b) return false; const d = new Date(b + 'T12:00'), n = new Date(); return d.getMonth() === n.getMonth() && d.getDate() === n.getDate(); };

/* ═════════ VOICE MANAGER ═════════
   cfg.voiceMode: 'off' | 'apps' (only voice apps talk) | 'all'.
   Family recordings always win. Outside voice apps, a sentence plays the family clip for its key word
   (e.g. "Pop the red bubbles!" → the "red" clip) or stays quiet and lets the picture card do the work. */
let VOICE_APP = false, speakingEl = null, curAudio = null, sayTok = 0;
const CLIPS = {};          // `${code}|${phrase}` → object URL
const normP = s => String(s || '').toLowerCase().replace(/[¡!¿?.,:;…"“”'’()]/g, ' ').replace(/\s+/g, ' ').trim();
async function loadClips() { (await IDB.all('clips')).forEach(([k, blob]) => { if (CLIPS[k]) URL.revokeObjectURL(CLIPS[k]); CLIPS[k] = URL.createObjectURL(blob); }); }
loadClips();
function clipFor(text, code, keyword) {
  const n = normP(text); if (CLIPS[code + '|' + n]) return CLIPS[code + '|' + n];
  if (!keyword) return null;
  let best = null, bl = 0;
  for (const k in CLIPS) { const [c, ph] = [k.slice(0, k.indexOf('|')), k.slice(k.indexOf('|') + 1)]; if (c !== code || ph.length <= bl) continue; if ((' ' + n + ' ').includes(' ' + ph + ' ')) { best = CLIPS[k]; bl = ph.length; } }
  return best;
}
function speakStart(el) { speakingEl = el || null; document.body.classList.add('talking'); if (el) el.classList.add('speaking'); }
function speakEnd(el) { document.body.classList.remove('talking'); if (el) el.classList.remove('speaking'); }
function playURL(url, el, onend, tok) {
  const a = new Audio(url); curAudio = a; speakStart(el);
  const fin = () => { speakEnd(el); if (tok === sayTok && onend) onend(); };
  a.onended = fin; a.onerror = fin; a.play().catch(fin);
}
function stopVoice() { sayTok++; try { speechSynthesis.cancel(); } catch (e) {} if (curAudio) { try { curAudio.pause(); } catch (e) {} curAudio = null; } speakEnd(speakingEl); }
function hush() { stopVoice(); }
function browserSay(text, code, onend, who, el, tok) {
  if (!('speechSynthesis' in window)) { if (onend) onend(); return; }
  const u = new SpeechSynthesisUtterance(text), v = voiceFor(code);
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = L[code].bcp;
  u.rate = v && /Natural|Online|Google/i.test(v.name) ? 1 : .95; if (who && CAST[who]) u.pitch = CAST[who].pitch;
  u.onstart = () => speakStart(el); u.onend = () => { speakEnd(el); if (tok === sayTok && onend) onend(); }; u.onerror = () => speakEnd(el);
  speechSynthesis.speak(u);
}
/* cloud text-to-speech (OpenAI or ElevenLabs), cached forever in IndexedDB */
const TTS_VOICE = { robo: 'alloy', dino: 'ash', hoot: 'sage', foxy: 'coral', narrator: 'nova' };
const TTS_STYLE = { robo: 'a friendly, curious cartoon robot', dino: 'a silly, warm, bouncy cartoon dinosaur', hoot: 'a gentle, kind, wise owl teacher', foxy: 'an excited, adventurous cartoon fox', narrator: 'a warm, cozy storyteller' };
const ttsReady = () => (cfg.tts.provider === 'openai' && cfg.cloud.openaiKey) || (cfg.tts.provider === 'eleven' && cfg.tts.elevenKey);
const OAI_VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer', 'verse'];
const TTS_WHO = ['robo', 'dino', 'hoot', 'foxy', 'narrator'];
const oaiVoice = w => (cfg.tts.openaiVoices || {})[w] || TTS_VOICE[w];
const elVoice = w => ((cfg.tts.elevenVoices || {})[w] || '').trim() || (cfg.tts.elevenVoice || '').trim() || '21m00Tcm4TlvDq8ikWAM';
async function ttsBlob(text, who) {
  const w = CAST[who] ? who : 'narrator', key = `${cfg.tts.provider}|${cfg.tts.provider === 'openai' ? oaiVoice(w) + cfg.tts.openaiModel : elVoice(w) + (cfg.tts.elevenModel || '')}|${text}`;
  const hit = await IDB.get('tts', key); if (hit) return hit;
  let r;
  if (cfg.tts.provider === 'openai') {
    const body = { model: cfg.tts.openaiModel || 'gpt-4o-mini-tts', voice: oaiVoice(w), input: text, response_format: 'mp3' };
    if (/4o/.test(body.model)) body.instructions = `Speak as ${TTS_STYLE[w]} talking to a toddler: bright, warm, playful, clear and not too fast.`;
    r = await withTimeout(fetch('https://api.openai.com/v1/audio/speech', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.cloud.openaiKey }, body: JSON.stringify(body) }), 20000);
  } else {
    r = await withTimeout(fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elVoice(w)}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'xi-api-key': cfg.tts.elevenKey, Accept: 'audio/mpeg' }, body: JSON.stringify({ text, model_id: cfg.tts.elevenModel || 'eleven_flash_v2_5', voice_settings: { stability: .45, similarity_boost: .8, style: .35, use_speaker_boost: true } }) }), 20000);
  }
  if (!r.ok) throw new Error('TTS ' + r.status + ' ' + (await r.text()).slice(0, 120));
  const b = await r.blob(); IDB.set('tts', key, b); return b;
}
/* say(text, code, onend, who, el, force) — force = treat as a voice app line */
function say(text, code = lang, onend, who, el, force) {
  stopVoice(); const tok = sayTok;
  const done = () => { if (tok === sayTok && onend) setTimeout(onend, 0); };
  if (!text || cfg.voiceMode === 'off') { if (onend) setTimeout(() => tok === sayTok && onend(), 250); return; }
  const allow = cfg.voiceMode === 'all' || VOICE_APP || force;
  const clip = clipFor(text, code, !allow);
  if (clip) return playURL(clip, el, onend, tok);
  if (!allow) { if (onend) setTimeout(() => tok === sayTok && onend(), 250); return; }
  if (ttsReady() && navigator.onLine !== false) {
    ttsBlob(text, who).then(b => { if (tok !== sayTok) return; const u = URL.createObjectURL(b); playURL(u, el, () => { URL.revokeObjectURL(u); done(); }, tok); })
      .catch(e => { console.warn(e); if (tok === sayTok) browserSay(text, code, onend, who, el, tok); });
    return;
  }
  browserSay(text, code, onend, who, el, tok);
}

/* ── family voice booth: the phrase list per language ── */
function boothPhrases(code) {
  const t = L[code], out = [];
  const add = (group, list) => list.forEach(p => out.push({ group, p }));
  add('Praise', [...t.yes, t.again, t.super || '']);
  add('Questions', [t.howMany, t.next, t.pairs, t.watch, t.yourTurn, t.shapesHome, t.shadows || '']);
  add('Numbers', t.nums.slice(1));
  add('Colors', t.colors);
  add('Animals', t.animals.map(a => a[0]));
  add('Shapes', t.shapes);
  add('Hello', [t.hi]);
  if (code === 'en') add('Letters', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
  const fam = (P().family || '').split(',').map(s => s.trim()).filter(Boolean); if (fam.length) add('Family', fam);
  return out.filter(x => x.p);
}

/* ── perf mode ── */
const applyPerf = () => document.body.classList.toggle('perf', !!cfg.perf);
