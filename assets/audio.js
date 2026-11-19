/* =========================================================
   Аудиогид: алдын ала дайындалған қазақша MP3 (kk-KZ-AigulNeural)
   Кілт = тазаланған мәтіннің FNV-1a 32-бит хэші
   ========================================================= */
window.AUDIO_KEYS = window.AUDIO_KEYS || {};
const SYM_KK = {H:'сутек',He:'гелий',Li:'литий',Be:'бериллий',B:'бор',C:'көміртек',N:'азот',O:'оттек',F:'фтор',Na:'натрий',Mg:'магний',Al:'алюминий',Si:'кремний',P:'фосфор',S:'күкірт',Cl:'хлор',K:'калий',Ca:'кальций',Ti:'титан',V:'ванадий',Cr:'хром',Mn:'марганец',Fe:'темір',Co:'кобальт',Ni:'никель',Cu:'мыс',Zn:'мырыш',Ga:'галлий',Se:'селен',Ag:'күміс',Cd:'кадмий',Sn:'қалайы',I:'йод',Ba:'барий',Nd:'неодим',Ta:'тантал',W:'вольфрам',Re:'рений',Os:'осмий',Pt:'платина',Au:'алтын',Hg:'сынап',Pb:'қорғасын',U:'уран',Rn:'радон',Mo:'молибден',Nb:'ниобий'};
const WORDS = { AI: 'эй-ай', XP: 'тәжірибе ұпайы', TEDx: 'тедэкс', PISA: 'пиза', Boeing: 'Боинг', Natural: '', Earth: '', Wikimedia: 'Уикимедиа', Commons: '', YouTube: 'Ютуб', WhatsApp: 'Уатсап', Telegram: 'Телеграм', QR: 'кью-ар', STEM: 'стем', NdFeB: 'неодим магниттері', DNA: '', WebGL: '', 'U-235': 'уран-235', 'Co-60': 'кобальт-60', 'K-40': 'калий-40', 'Os-187': 'осмий-187' };
const FORM = { H2O: 'су', CO2: 'көмірқышқыл газы', CO: 'иіс газы', NaCl: 'ас тұзы', H2SO4: 'күкірт қышқылы', HCl: 'тұз қышқылы', CaCO3: 'кальций карбонаты', CH4: 'метан', NH3: 'аммиак', SO2: 'күкірт диоксиді', O3: 'озон', O2: 'оттек', H2: 'сутек', N2: 'азот', Cl2: 'хлор', NaOH: 'натрий гидроксиді', CuSO4: 'мыс купоросы', KMnO4: 'калий перманганаты', H2O2: 'сутек пероксиді', Fe2O3: 'темір оксиді', Fe3O4: 'магнетит', TiO2: 'титан диоксиді', UO2: 'уран диоксиді', H2S: 'күкіртсутек', NH4NO3: 'аммиак селитрасы', KCl: 'калий хлориді', MgCl2: 'магний хлориді', NaHCO3: 'ас содасы', CH3COOH: 'сірке қышқылы', C2H5OH: 'этанол', AgNO3: 'күміс нитраты', AgCl: 'күміс хлориді', MnO2: 'марганец диоксиді', SiO2: 'кварц', Al2O3: 'глинозем', CaSO4: 'гипс', NaClO: 'хлорлы ақартқыш', Na2SO4: 'натрий сульфаты', I2: 'йод', FeCr2O4: 'хромит', CuFeS2: 'халькопирит', ZnS: 'сфалерит', PbS: 'галенит', FeTiO3: 'ильменит', U3O8: 'уран тотығы', Cu2S: 'мыс сульфиді' };
const KEYS_KK = { W: 'Дабл-ю', S: 'Эс', A: 'Эй', D: 'Ди', F: 'Эф' };
function speechText(t) {
  let s = String(t).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
  s = s.replace(/\bpH\b/g, 'пэ-аш').replace(/E\s*=\s*mc²/g, 'Е равно эм-це квадрат').replace(/\b[\w-]+\.js\b/g, ' ').replace(/\(\s*[A-Z][a-z]?\s*\)/g, ' ').replace(/\(\s*[a-z][a-z\s.]+\)/g, ' ');
  s = s.replace(/\bEnter\b/g, 'Энтер').replace(/\bShift\b/g, 'Шифт').replace(/\bSpace\b/g, 'бос орын');
  s = s.replace(/\b([WSADF])\b(?=\s*(?:мен|—|-|пернес|,|\/))/g, (m, k) => KEYS_KK[k]).replace(/(мен|және|,|\/)\s*\b([WSADF])\b/g, (m, p, k) => p + ' ' + KEYS_KK[k]);
  s = s.replace(/[^.;:!?\n«»()]*[→⇌⟶][^.;:!?\n«»()]*/g, ' ');           // теңдеулер оқылмайды
  s = s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, ' '); // эмодзи
  s = s.replace(/(\d)\s*°C/g, '$1 градус').replace(/°C/g, ' градус').replace(/(\d)\s*%/g, '$1 пайыз').replace(/[≈~]/g, ' шамамен ');
  s = s.replace(/О(?=[₀-₉])/g, 'O');
  s = s.replace(/[A-Z][A-Za-z]*(?:[-–]?\d+)?[A-Za-z0-9₀-₉⁰-⁹⁺⁻·\[\]]*/g, tok => {
    if (WORDS[tok] !== undefined) return WORDS[tok];
    const plain = tok.replace(/[₀-₉]/g, d => '₀₁₂₃₄₅₆₇₈₉'.indexOf(d)).replace(/[⁰-⁹⁺⁻]+$/, '');
    if (FORM[plain]) return FORM[plain];
    const bare = plain.replace(/\d+$/, '');
    if (SYM_KK[bare] && /^[A-Z][a-z]?\d*$/.test(plain)) return SYM_KK[bare];
    return ' ';
  });
  s = s.replace(/\b[a-z]{2,}\b/g, ' ').replace(/[₀-₉⁰-⁹⁺⁻↑↓]/g, '').replace(/\(\s*[,;·]*\s*\)/g, ' ').replace(/\s+([,.;:!?)])/g, '$1').replace(/\(\s+/g, '(').replace(/([,;:])\1+/g, '$1');
  s = s.replace(/\s*—\s*\./g, '.').replace(/\s{2,}/g, ' ').replace(/^[\s,.;:—-]+/, '').trim();
  return s;
}
function h32(str) { const b = new TextEncoder().encode(str); let h = 0x811c9dc5; for (let i = 0; i < b.length; i++) { h ^= b[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }

const Guide = (() => {
  let on = true; try { on = localStorage.getItem('aigid_voice') !== '0'; } catch (e) {}
  let cur = null, curRes = null, timer = null, paused = false, gen = 0;
  const bar = () => document.getElementById('subtitle');
  function show(text) { const b = bar(); if (!b) return; b.querySelector('.st-text').innerHTML = text; b.classList.add('show'); b.classList.remove('paused'); paused = false; }
  const all = new Set();
  function stop() { gen++; all.forEach(x => { x.onended = null; x.onerror = null; try { x.pause(); } catch (e) {} }); all.clear(); cur = null; clearTimeout(timer); if (curRes) { const r = curRes; curRes = null; r(); } }
  function say(text, opt = {}) {
    stop(); const st = speechText(text); const key = h32(st);
    if (!opt.silentBar) show(opt.display || text);
    return new Promise(res => {
      curRes = res;
      const finish = () => { if (curRes === res) { curRes = null; res(); } if (!opt.keep) setTimeout(() => { if (!cur && !curRes) bar()?.classList.remove('show'); }, 2500); };
      if (on && window.AUDIO_KEYS[key]) {
        const my = gen, a = new Audio(`assets/audio/${key}.mp3`); cur = a; all.add(a);
        const fail = () => { if (my !== gen) return; all.delete(a); cur = null; timer = setTimeout(finish, Math.min(9000, st.length * 55)); };
        a.onended = () => { if (my !== gen) return; all.delete(a); cur = null; finish(); }; a.onerror = fail;
        a.play().then(() => { if (my !== gen) { a.pause(); return; } window.__voicePlayed = true; }).catch(fail);
      } else timer = setTimeout(finish, Math.min(9000, 1500 + st.length * 45));
    });
  }
  function toggle(v) { on = v === undefined ? !on : v; try { localStorage.setItem('aigid_voice', on ? '1' : '0'); } catch (e) {} if (!on && cur) cur.pause(); document.querySelectorAll('.voice-btn').forEach(b => { b.classList.toggle('off', !on); b.title = on ? 'Дыбыс қосулы' : 'Дыбыс өшірулі'; }); return on; }
  function pause() { const b = bar(); if (!cur) return; if (paused) { cur.play(); paused = false; b.classList.remove('paused'); } else { cur.pause(); paused = true; b.classList.add('paused'); } }
  function hide() { stop(); bar()?.classList.remove('show'); }
  return { say, stop, toggle, pause, hide, get on() { return on; } };
})();
