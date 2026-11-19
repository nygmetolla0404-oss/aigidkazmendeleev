/* =========================================================
   AI-ГИД — негізгі логика: навигация, порталдар, кесте, квест, чат
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const K = 40, COS = Math.cos(48 * Math.PI / 180);
const P = (lon, lat) => [(lon - 45.5) * K * COS, (56 - lat) * K];
const EL = Object.fromEntries(ELEMENTS.map(e => [e.s, e]));
const PL = Object.fromEntries(PLACES.map(p => [p.id, p]));
const EN = {U:'Uranium',Cr:'Chromium',Fe:'Iron',Cu:'Copper',Zn:'Zinc',Pb:'Lead',Au:'Gold',Ag:'Silver',Mn:'Manganese',Al:'Aluminium',C:'Coal',S:'Sulfur',H:'Hydrogen',P:'Phosphorus',Ti:'Titanium',Mg:'Magnesium',Be:'Beryllium',Ta:'Tantalum',W:'Tungsten',B:'Boron',Ni:'Nickel',Co:'Cobalt',Re:'Rhenium',Si:'Silicon',Na:'Halite',K:'Potassium',Nd:'Neodymium'};
const RU = {U:'уран',Cr:'хром',Fe:'железо желез темір',Cu:'медь мед',Zn:'цинк мырыш',Pb:'свинец свинц қорғасын',Au:'золото золот алтын',Ag:'серебро серебр күміс',Mn:'марганец',Al:'алюмини',C:'уголь углерод көмір',S:'сера күкірт',H:'водород сутек',P:'фосфор',Ti:'титан',Mg:'магни',Be:'берилли',Ta:'тантал',W:'вольфрам',B:'бор',Ni:'никел',Co:'кобальт',Re:'рени',Si:'кремни',Na:'натри соль тұз',K:'калий',Nd:'неодим'};
const CITIES = [['Астана',71.43,51.17,1],['Алматы',76.89,43.24,1],['Шымкент',69.6,42.32,1],['Қарағанды',73.1,49.8],['Ақтөбе',57.2,50.28],['Атырау',51.92,47.1],['Ақтау',51.2,43.65],['Өскемен',82.6,49.95],['Павлодар',76.95,52.29],['Қостанай',63.62,53.21],['Орал',51.37,51.23],['Қызылорда',65.5,44.85],['Тараз',71.37,42.9],['Семей',80.23,50.41],['Петропавл',69.15,54.87],['Көкшетау',69.4,53.28],['Талдықорған',78.37,45.02],['Жезқазған',67.71,47.78],['Түркістан',68.25,43.3],['Қонаев',77.07,43.87]];
const ROBOT = '<svg viewBox="0 0 48 48"><rect x="10" y="14" width="28" height="22" rx="8" fill="#e9f3ff"/><rect x="14" y="19" width="20" height="11" rx="5" fill="#1a3a9a"/><circle cx="19.5" cy="24.5" r="2.6" fill="#7ef0ff"/><circle cx="28.5" cy="24.5" r="2.6" fill="#7ef0ff"/><path d="M24 14V8" stroke="#e9f3ff" stroke-width="2.5"/><circle cx="24" cy="7" r="2.6" fill="#ffd447"/></svg>';

/* ========== ДАУЫС МӘТІНДЕРІ ========== */
const VO = {
  welcome: 'Сәлеметсіз бе, құрметті зерттеуші! Мен — сіздің AI-гидіңізбін. Біз бірге дронмен ұшып, электромобильмен жүріп, Қазақстанның кен орындары мен табиғатын химия көзімен зерттейміз. Белгіні басыңыз — портал ашылады.',
  drone: 'Дрон режимі. W мен S пернелері — алға және артқа, A мен D — бұрылу, бос орын мен Shift — биіктік. Нысанға жақындап, Enter басыңыз. Сары аймақтың үстінде F пернесімен пайдалы заттарды шаша аласыз.',
  car: 'Электромобиль режимі. W — газ, S — тежеу, A мен D — руль. Электромобиль түтін шығармайды. Жасыл станцияда тоқтасаңыз, батарея толады. Нысан жанында Enter басыңыз.',
  tourDone: 'Керемет! Саяхат аяқталды. Енді зертханаға барып, реакция жасап көрейік!',
  droneDone: 'Жарайсыз! Дронмен бес нысанды таптыңыз. Дрон экскурсиясы аяқталды.',
  carDone: 'Тамаша! Электромобильмен бес жүз шақырым жол жүрдіңіз. Ауаға зиян келтірмей саяхаттадыңыз!',
  batLow: 'Батарея таусылды! Ең жақын жасыл зарядтау станциясына жетіңіз.',
  pickItem: 'Алдымен контейнерден пайдалы затты таңдаңыз.',
  sprayEmpty: 'Зат бос жерге шашылды. Сары аймаққа жақындаңыз.',
  right: 'Дұрыс! Жарайсыз!', wrongAns: 'Қайта ойланып көріңіз.', voiceOn: 'Аудиогид қосылды.',
  itemSel: d => `${d.name} таңдалды. Енді сары аймаққа ұшып, F пернесін басыңыз.`,
  good: d => `Дұрыс! ${d.name}. ${d.eff}`,
  over: d => `Норма асты! ${d.warn} Адал азамат мөлшерді сақтайды.`,
  wrong: d => `${d.name} бұл аймаққа сәйкес емес. Басқа аймақты таңдаңыз.`,
};
const SEC_SAY = {
  map: 'Бұл — үш өлшемді Қазақстан картасы. Тінтуірмен айналдырып, белгілерді басыңыз. Сол жақтағы панельден дронды, электромобильді немесе AI-турды таңдаңыз.',
  table: 'Менделеевтің периодтық жүйесі. Сары белгісі бар элементтер Қазақстанда өндіріледі. Кез келген элементті басыңыз.',
  lab: 'Виртуалды зертханаға қош келдіңіз! Алдымен халат, қорғаныс көзілдірігі және қолғапты киіңіз. Содан кейін заттарды стаканға салып, реакцияны бақылаңыз.',
  tasks: 'Үш өлшемді тапсырмалар: функционалдық сауаттылық, Адал азамат дилеммалары, молекулалар және зертханадағы қауіптерді табу.',
  quest: 'Химиялық экспедиция квесті. Порталдарды ашып, элементтерді жинаңыз және марапаттар алыңыз.',
  trailers: 'Видеотрейлерлер. Кез келген трейлерді басып, толық экранда көріңіз.',
  idea: 'Педагогикалық идея: өзектілігі, мақсаты, міндеттері, шешетін мәселелері және әріптестермен тәжірибе бөлісу жолдары.',
  author: 'Жоба авторы — Абдихалилова Мохинур Абдимуталовна, Айша бибі атындағы жалпы білім беретін мектептің химия пәні мұғалімі.',
};
const elSay = e => `${e.name}. ${e.place}. ${e.rank}. ${e.fact}`;
const plSay = p => `${p.name} — ${p.sub}. ${p.chem}`;
const ptSay = e => `${e.n}. Реттік нөмірі ${e.z}. ${KZ_EXTRA[e.s] ? 'Қазақстанда: ' + KZ_EXTRA[e.s] + '.' : 'Бұл элемент Қазақстанда өнеркәсіптік көлемде өндірілмейді.'}`;
const sayBtn = t => `<button class="say" data-sayt="${encodeURIComponent(t)}" title="Тыңдау">🔊</button>`;
document.addEventListener('click', e => { const b = e.target.closest('[data-sayt]'); if (b) { e.stopPropagation(); Guide.say(decodeURIComponent(b.dataset.sayt)); } });

/* ========== STATE ========== */
const S = (() => { let d = {}; try { d = JSON.parse(localStorage.getItem('aigid_v1') || '{}'); } catch (e) {}
  return Object.assign({ xp: 0, visited: [], tours: {}, spray: 0, reactions: [], ppe: false, fs: [], adal: [], mol: [], hz: [], quiz: [], places: [] }, d); })();
function save() { try { localStorage.setItem('aigid_v1', JSON.stringify(S)); } catch (e) {} refreshQuest(); }
function addXP(n, msg) { S.xp += n; $('#xpVal').textContent = S.xp; save(); if (msg) toast(`+${n} 💎 · ${msg}`); }
function addTo(key, v) { if (!S[key].includes(v)) { S[key].push(v); save(); return true; } return false; }
let toastT; function toast(t) { const el = $('#toast'); el.innerHTML = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600); }
const speak = t => Guide.say(t);

/* ========== НАВИГАЦИЯ ========== */
let curPage = 'home';
function go(name, quiet) {
  curPage = name; closeModal(); window.closePlayer && window.closePlayer();
  document.body.classList.toggle('home', name === 'home');
  document.body.classList.toggle('page-open', !['home', 'map'].includes(name));
  $$('.page').forEach(p => p.classList.toggle('on', p.id === 'pg-' + name));
  $$('#nav [data-go]').forEach(b => b.classList.toggle('on', b.dataset.go === name));
  const pg = $('#pg-' + name); if (pg) pg.scrollTop = 0;
  if (name === 'tasks' && $('#task-mol').classList.contains('on')) Mol.start();
  if (!quiet && SEC_SAY[name]) Guide.say(SEC_SAY[name]);
}
document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });

/* ========== PORTAL FX ========== */
function portalFx(cx, cy, color = '#3fd8ff') { return new Promise(res => {
  const wrap = $('#portalFx'), cv = $('#portalCanvas'); wrap.style.display = 'block'; const dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const parts = Array.from({ length: 220 }, () => ({ a: Math.random() * 6.28, r: Math.random() * 40, s: .02 + Math.random() * .05, sz: 1 + Math.random() * 3 }));
  const t0 = performance.now(); const D = 1700, OPEN = .62; let opened = false;
  const fr = now => { const p = Math.max(0, Math.min(1, (now - t0) / D)); c.clearRect(0, 0, innerWidth, innerHeight);
    const q = Math.min(1, p / OPEN); const fade = p > OPEN ? Math.max(0, 1 - (p - OPEN) / (1 - OPEN)) : 1; c.globalAlpha = fade;
    const R = Math.max(innerWidth, innerHeight) * Math.pow(q, 2.2) * 1.3;
    c.fillStyle = `rgba(2,6,22,${Math.min(1, q * 1.6)})`; c.fillRect(0, 0, innerWidth, innerHeight);
    const gr = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(30, R)); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.25, color); gr.addColorStop(.6, 'rgba(47,123,255,.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gr; c.beginPath(); c.arc(cx, cy, Math.max(30, R), 0, 7); c.fill();
    for (let k = 0; k < 5; k++) { c.strokeStyle = k % 2 ? color : '#ffd447'; c.lineWidth = 3; c.globalAlpha = .7 * fade; c.beginPath(); c.ellipse(cx, cy, 30 + k * 26 + q * 300, (30 + k * 26 + q * 300) * .38, now / 300 * (k % 2 ? 1 : -1) + k, 0, 6.28); c.stroke(); }
    c.globalAlpha = fade; parts.forEach(o => { o.a += o.s * 3; o.r += 2 + q * 14; c.fillStyle = Math.random() > .5 ? '#fff' : color; c.fillRect(cx + Math.cos(o.a) * o.r, cy + Math.sin(o.a) * o.r * .6, o.sz, o.sz); });
    if (!opened && p >= OPEN) { opened = true; res(); }
    if (p < 1) requestAnimationFrame(fr); else { c.clearRect(0, 0, innerWidth, innerHeight); wrap.style.display = 'none'; } };
  requestAnimationFrame(fr); setTimeout(() => { if (!opened) { opened = true; res(); } }, D * OPEN + 250); setTimeout(() => { wrap.style.display = 'none'; }, D + 600); }); }
async function openPortal(type, id, ev) {
  const x = ev && ev.clientX ? ev.clientX : innerWidth / 2, y = ev && ev.clientY ? ev.clientY : innerHeight / 2;
  const color = type === 'dep' ? CAT[EL[DEPO[id].main].cat].c : type === 'el' ? CAT[EL[id].cat].c : type === 'pt' ? (CAT[ptBySym[id]?.cat]?.c || '#3fd8ff') : '#3fd8ff';
  Guide.stop(); await portalFx(x, y, color);
  if (type === 'pt' && EL[id]) type = 'el';
  if (type === 'dep' && !(typeof VR !== 'undefined' && VR.ok)) { type = 'el'; id = DEPO[id].main; }
  if (type !== 'pt' && typeof VR !== 'undefined' && VR.ok) {
    closeModal(); $('#modalBox').innerHTML = ''; if (type === 'el' && EL_DEP[id]) VR.open('dep', EL_DEP[id], id); else VR.open(type, id); return;
  }
  if (type === 'el') renderElement(EL[id]); else if (type === 'place') renderPlace(PL[id]); else renderPtElement(id);
  $('#modal').classList.add('open'); $('#modal').scrollTop = 0;
}
function closeModal() { if (typeof VR !== 'undefined' && VR.isOpen) { VR.close(); } if (!$('#modal').classList.contains('open')) return; $('#modal').classList.remove('open'); Guide.stop(); }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); window.closePlayer && window.closePlayer(); } });
const gallery = imgs => `<div class="gallery">${imgs.slice(0, 3).map(([u, c]) => `<figure><img src="${u}" alt="${c}" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.style.display='none'"><figcaption>📷 ${c}</figcaption></figure>`).join('')}</div>
  ${imgs.length > 3 ? `<div class="more-photos">${imgs.slice(3).map(([u, c]) => `<img src="${u}" alt="${c}" title="${c}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`).join('')}</div>` : ''}`;
function tabsUI(root) { $$('.tabs button', root).forEach(b => b.onclick = () => { $$('.tabs button', root).forEach(x => x.classList.toggle('on', x === b)); $$('.tabpane', root).forEach(p => p.classList.toggle('on', p.dataset.p === b.dataset.p)); }); }
function renderElement(e, box = $('#modalBox'), quiet) {
  const col = CAT[e.cat].c;
  if (addTo('visited', e.s)) addXP(10, `${e.name} элементі паспортқа қосылды!`);
  const yt = encodeURIComponent(`${e.name} кен орны Қазақстан`);
  box.innerHTML = `<button class="close" onclick="closeModal()">✕</button>
  <div class="el-head"><div class="el-tile" style="color:${col}"><span class="z">${e.z}</span><span class="s">${e.s}</span><span class="m">${e.mass}</span></div>
    <div style="flex:1;min-width:240px"><span class="chip" style="color:${col};border-color:${col}">${CAT[e.cat].n}</span><h2 style="margin-top:8px">${e.name} ${sayBtn(elSay(e))}</h2>
    <div>📍 <b>${e.place}</b><br><span style="color:var(--muted)">${e.region}</span></div><div class="badge-rank">🏆 ${e.rank}</div></div></div>
  ${gallery(e.imgs)}
  <div class="tabs"><button class="on" data-p="dep">⛏️ Кен орны және өндіру</button><button data-p="use">🏭 Қолданылуы</button><button data-p="int">🔗 Пәнаралық байланыс</button><button data-p="fact">✨ Қызықты дерек</button><button data-p="quiz">❓ AI-гид сұрағы</button></div>
  <div class="tabpane on" data-p="dep"><p><b>Минерал / кен:</b> <span class="eq">${e.mineral}</span></p><p><b>Әдіс:</b> ${e.method}</p><div class="steps">${e.mining.map(s => `<div>${s}</div>`).join('')}</div></div>
  <div class="tabpane" data-p="use"><div class="inter">${e.uses.map((u, i) => `<div class="card"><h4>${['🔧', '⚡', '🧴', '🚀'][i] || '•'} ${u}</h4></div>`).join('')}</div></div>
  <div class="tabpane" data-p="int"><div class="inter">
    <div class="card"><h4>🌿 Биология және денсаулық ${sayBtn(e.bio)}</h4>${e.bio}</div><div class="card"><h4>🌍 География ${sayBtn(e.geo)}</h4>${e.geo}</div>
    <div class="card"><h4>⚛️ Физика ${sayBtn(e.phys)}</h4>${e.phys}</div><div class="card"><h4>♻️ Экология · Адал азамат ${sayBtn(e.eco)}</h4>${e.eco}</div></div></div>
  <div class="tabpane" data-p="fact"><div class="quiz" style="border-style:solid">💡 ${e.fact}</div>
    <div class="row" style="margin-top:14px"><a class="btn sm" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${yt}">▶️ YouTube видеолары</a>
    <a class="btn sm" target="_blank" rel="noopener" href="https://kk.wikipedia.org/wiki/${encodeURIComponent(e.name.split(' ')[0])}">📚 Уикипедия</a></div></div>
  <div class="tabpane" data-p="quiz"><div class="quiz"><b>🤖 ${e.q.t}</b> ${sayBtn(e.q.t)}<div>${e.q.o.map((o, i) => `<button class="btn sm" data-a="${i}">${o}</button>`).join('')}</div><div class="fb" id="qfb"></div></div></div>
  <div class="row" style="margin-top:18px;justify-content:space-between">
    <button class="btn sm" id="morePh">🌐 Интернеттен тағы суреттер</button><button class="btn primary sm" id="showMap">🗺️ Картадан көрсету</button></div>
  <div class="more-photos" id="moreBox"></div>`;
  tabsUI(box);
  $$('[data-a]', box).forEach(b => b.onclick = () => { const ok = +b.dataset.a === e.q.a; b.classList.add(ok ? 'ok' : 'no');
    $('#qfb', box).className = 'fb ' + (ok ? 'ok' : 'no'); $('#qfb', box).textContent = ok ? '✅ Дұрыс! Жарайсыз!' : '❌ Қайта ойланып көріңіз. Кеңес: «Пәнаралық байланыс» бөлімін оқыңыз.';
    Guide.say(ok ? VO.right : VO.wrongAns); if (ok && addTo('quiz', e.s)) addXP(15, 'Сұраққа дұрыс жауап!'); });
  $('#showMap').onclick = () => { closeModal(); go('map', true); World.flyToEl(e.s); };
  $('#morePh').onclick = () => commonsSearch(`${EN[e.s]} Kazakhstan`, $('#moreBox'), EN[e.s] + ' mineral');
  if (!quiet) Guide.say(elSay(e));
}
function renderPlace(p, box = $('#modalBox'), quiet) {
  if (addTo('places', p.id)) addXP(8, `${p.name} зерттелді!`);
  box.innerHTML = `<button class="close" onclick="closeModal()">✕</button>
  <div class="el-head"><div class="el-tile" style="color:#3fd8ff;justify-content:center;align-items:center"><span class="s" style="font-size:60px">${p.icon}</span></div>
   <div style="flex:1;min-width:240px"><span class="chip">Табиғи / туристік нысан</span><h2 style="margin-top:8px">${p.name} ${sayBtn(plSay(p))}</h2><div style="color:var(--muted)">${p.sub}</div>
   <div class="row" style="margin-top:10px">Байланысты элементтер: ${p.els.map(s => EL[s] ? `<button class="btn sm" data-goel="${s}" style="border-color:${CAT[EL[s].cat].c}">${s}</button>` : `<span class="chip">${s}</span>`).join('')}</div></div></div>
  ${gallery(p.imgs)}
  <div class="inter">
    <div class="card" style="grid-column:1/-1;border-color:var(--cyan);background:rgba(63,216,255,.08)"><h4>🧪 Химия (негізгі)</h4>${p.chem}</div>
    <div class="card"><h4>🌿 Биология: өсімдіктер мен жануарлар ${sayBtn(p.bio)}</h4>${p.bio}</div>
    <div class="card"><h4>💊 Витаминдер мен денсаулық ${sayBtn(p.vit)}</h4>${p.vit}</div>
    <div class="card"><h4>🌍 География ${sayBtn(p.geo)}</h4>${p.geo}</div>
    <div class="card"><h4>⚛️ Физика ${sayBtn(p.phys)}</h4>${p.phys}</div></div>
  <div class="row" style="margin-top:18px"><button class="btn sm" id="morePh">🌐 Интернеттен тағы суреттер</button>
    <a class="btn sm" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(p.name + ' Қазақстан')}">▶️ YouTube видео</a>
    <button class="btn primary sm" id="showMap">🗺️ Картадан көрсету</button></div>
  <div class="more-photos" id="moreBox"></div>`;
  $$('[data-goel]', box).forEach(b => b.onclick = ev => openPortal('el', b.dataset.goel, ev));
  $('#showMap').onclick = () => { closeModal(); go('map', true); World.flyToPlace(p.id); };
  const q = { astana: 'Astana city', burabay: 'Burabay', korgalzhyn: 'Korgalzhyn', alakol: 'Alakol', charyn: 'Charyn Canyon', ileAlatau: 'Ile-Alatau', turkistan: 'Turkistan Yasawi', caspian: 'Caspian Sea Kazakhstan', bozzhyra: 'Bozzhyra', altai: 'Kazakhstan Altai', balkhash: 'Lake Balkhash', aral: 'Aral Sea', baikonur: 'Baikonur', altynEmel: 'Altyn-Emel' }[p.id];
  $('#morePh').onclick = () => commonsSearch(q, $('#moreBox'));
  if (!quiet) Guide.say(plSay(p));
}
async function commonsSearch(q, box, alt) {
  box.innerHTML = '<span style="color:var(--muted)">⏳ Wikimedia Commons-тан іздеп жатырмын...</span>';
  const one = async qq => { const u = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ action: 'query', generator: 'search', gsrsearch: qq + ' filetype:bitmap', gsrnamespace: 6, gsrlimit: 12, prop: 'imageinfo', iiprop: 'url', iiurlwidth: 400, format: 'json', origin: '*' });
    const d = await (await fetch(u)).json(); return Object.values(d.query?.pages || {}).map(p => [p.imageinfo?.[0]?.thumburl, p.title.replace('File:', '')]).filter(x => x[0]); };
  try { let res = await one(q); if (res.length < 3 && alt) res = res.concat(await one(alt));
    box.innerHTML = res.length ? res.map(([u, t]) => `<a href="${u}" target="_blank" rel="noopener"><img src="${u}" title="${t}" alt="${t}" loading="lazy"></a>`).join('') : 'Сурет табылмады.';
  } catch (err) { box.innerHTML = '⚠️ Интернет байланысын тексеріңіз.'; }
}

/* ========== ПЕРИОДТЫҚ КЕСТЕ ========== */
const PT = PT_RAW.split(',').map((r, i) => { const [s, n, m, cat] = r.split('|'); return { s, n, m, cat, z: i + 1 }; });
const ptBySym = Object.fromEntries(PT.map(e => [e.s, e]));
const BIO = ['H', 'C', 'N', 'O', 'Na', 'Mg', 'P', 'S', 'Cl', 'K', 'Ca', 'Cr', 'Mn', 'Fe', 'Co', 'Cu', 'Zn', 'Se', 'Mo', 'I', 'F'];
function ptPos(z) {
  if (z === 1) return [1, 1]; if (z === 2) return [1, 18]; if (z <= 4) return [2, z - 2]; if (z <= 10) return [2, z + 8];
  if (z <= 12) return [3, z - 10]; if (z <= 18) return [3, z]; if (z <= 36) return [4, z - 18]; if (z <= 54) return [5, z - 36];
  if (z <= 56) return [6, z - 54]; if (z <= 71) return [9, z - 54]; if (z <= 86) return [6, z - 68];
  if (z <= 88) return [7, z - 86]; if (z <= 103) return [10, z - 86]; return [7, z - 100]; }
function buildPT() {
  const g = $('#ptGrid'); g.innerHTML = '';
  PT.forEach(e => { const [r, c] = ptPos(e.z); const col = CAT[e.cat].c; const kz = !!EL[e.s], kzx = !!KZ_EXTRA[e.s];
    const d = document.createElement('div'); d.className = 'c' + (kz ? ' kz' : '') + (kzx ? ' kz kzx' : ''); d.dataset.s = e.s;
    d.style.gridRow = r; d.style.gridColumn = c; d.style.color = col; d.style.borderColor = col + '66';
    d.innerHTML = `<span style="font-size:9px;color:${col}">${e.z}</span><span class="sy" style="color:#fff">${e.s}</span><span class="nm">${e.n}</span>`;
    d.onclick = ev => openPortal(kz ? 'el' : 'pt', e.s, ev); g.appendChild(d); });
  const sp = document.createElement('div'); sp.style.cssText = 'grid-row:8;grid-column:1/19;height:10px'; g.appendChild(sp);
  [[9, 'Лантаноидтар'], [10, 'Актиноидтар']].forEach(([r, t]) => { const d = document.createElement('div'); d.style.cssText = `grid-row:${r};grid-column:1/3;font-size:11px;color:var(--muted);display:flex;align-items:center;justify-content:flex-end;padding-right:6px`; d.textContent = t; g.appendChild(d); });
  $('#ptLegend').innerHTML = Object.values(CAT).map(c => `<span><i style="background:${c.c}"></i>${c.n}</span>`).join('') + '<span><i style="background:var(--gold)"></i>KZ — картада, кен орны бар</span><span><i style="border:1px solid var(--gold)"></i>KZ — қосымша өнім / барлану</span>';
  $$('[data-ptf]').forEach(b => b.onclick = () => { $$('[data-ptf]').forEach(x => x.classList.toggle('on', x === b)); const f = b.dataset.ptf;
    $$('#ptGrid .c').forEach(c => { const s = c.dataset.s; const show = f === 'all' || (f === 'kz' && (EL[s] || KZ_EXTRA[s])) || (f === 'bio' && BIO.includes(s)); c.style.opacity = show ? '' : '.12'; c.style.boxShadow = (f === 'bio' && BIO.includes(s)) ? '0 0 14px #4ef0a0' : ''; }); });
}
async function renderPtElement(s) {
  const e = ptBySym[s]; const col = CAT[e.cat].c; const box = $('#modalBox'); const [row] = ptPos(e.z);
  box.innerHTML = `<button class="close" onclick="closeModal()">✕</button>
   <div class="el-head"><div class="el-tile" style="color:${col}"><span class="z">${e.z}</span><span class="s">${e.s}</span><span class="m">${e.m}</span></div>
   <div style="flex:1;min-width:240px"><span class="chip" style="color:${col};border-color:${col}">${CAT[e.cat].n}</span><h2 style="margin-top:8px">${e.n} ${sayBtn(ptSay(e))}</h2>
   <div>Реттік нөмірі: <b>${e.z}</b> · Атомдық массасы: <b>${e.m}</b> · Период: <b>${row >= 9 ? row - 3 : row}</b></div>
   ${KZ_EXTRA[s] ? `<div class="badge-rank">🇰🇿 Қазақстанда: ${KZ_EXTRA[s]}</div>` : '<div class="badge-rank" style="background:rgba(255,255,255,.05);border-color:var(--line);color:var(--muted)">Бұл элемент Қазақстанда өнеркәсіптік көлемде өндірілмейді.</div>'}
   ${BIO.includes(s) ? '<div class="badge-rank" style="background:rgba(78,240,160,.1);border-color:rgba(78,240,160,.5);color:#bfffe0">🌿 Тірі ағзаға қажетті (биогенді) элемент</div>' : ''}</div></div>
   <div id="wikiBox" style="color:var(--muted)">⏳ Уикипедиядан ақпарат жүктеліп жатыр...</div>
   <div class="row" style="margin-top:14px"><button class="btn sm" id="morePh">🌐 Тағы суреттер</button></div><div class="more-photos" id="moreBox"></div>`;
  $('#morePh').onclick = () => commonsSearch(PT_EN[e.z - 1] + ' element', $('#moreBox'));
  Guide.say(ptSay(e));
  const tryWiki = async (lang, title) => { const r = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`); if (!r.ok) throw 0; return r.json(); };
  let d; try { d = await tryWiki('kk', e.n); } catch (x) { try { d = await tryWiki('en', PT_EN[e.z - 1]); } catch (y) {} }
  const wb = $('#wikiBox'); if (!wb) return;
  wb.innerHTML = d ? `<div class="inter" style="grid-template-columns:${d.thumbnail ? '240px 1fr' : '1fr'}">${d.thumbnail ? `<img src="${d.thumbnail.source}" style="width:100%;border-radius:14px;border:1px solid var(--line)" referrerpolicy="no-referrer">` : ''}<div class="card" style="color:var(--text)">${d.extract_html || d.extract}<p><a href="${d.content_urls?.desktop?.page}" target="_blank" rel="noopener">Толығырақ →</a></p></div></div>` : 'Ақпарат жүктелмеді (интернет байланысын тексеріңіз).';
}
const PT_EN = 'Hydrogen Helium Lithium Beryllium Boron Carbon Nitrogen Oxygen Fluorine Neon Sodium Magnesium Aluminium Silicon Phosphorus Sulfur Chlorine Argon Potassium Calcium Scandium Titanium Vanadium Chromium Manganese Iron Cobalt Nickel Copper Zinc Gallium Germanium Arsenic Selenium Bromine Krypton Rubidium Strontium Yttrium Zirconium Niobium Molybdenum Technetium Ruthenium Rhodium Palladium Silver Cadmium Indium Tin Antimony Tellurium Iodine Xenon Caesium Barium Lanthanum Cerium Praseodymium Neodymium Promethium Samarium Europium Gadolinium Terbium Dysprosium Holmium Erbium Thulium Ytterbium Lutetium Hafnium Tantalum Tungsten Rhenium Osmium Iridium Platinum Gold Mercury Thallium Lead Bismuth Polonium Astatine Radon Francium Radium Actinium Thorium Protactinium Uranium Neptunium Plutonium Americium Curium Berkelium Californium Einsteinium Fermium Mendelevium Nobelium Lawrencium Rutherfordium Dubnium Seaborgium Bohrium Hassium Meitnerium Darmstadtium Roentgenium Copernicium Nihonium Flerovium Moscovium Livermorium Tennessine Oganesson'.split(' ');

/* ========== КВЕСТ ========== */
const MISSIONS = [
  ['5 элемент порталын ашу', () => S.visited.length >= 5],
  ['AI-тур саяхатын аяқтау', () => S.tours.guide],
  ['Дронмен 5 нысанды табу', () => S.tours.drone],
  ['Электромобильмен 500 км жүру', () => S.tours.car],
  ['Дронмен 3 рет дұрыс шашу', () => S.spray >= 3],
  ['Қорғаныс құралдарын дұрыс кию', () => S.ppe],
  ['Зертханада 5 реакция ашу', () => S.reactions.length >= 5],
  ['Функционалдық сауаттылықтың 4 тапсырмасы', () => S.fs.length >= 4],
  ['«Адал азамат» 5 дилеммасы', () => S.adal.length >= 5],
  ['4 молекуланы 3D-да тану', () => S.mol.length >= 4],
  ['Зертханадағы 8 қауіпті табу', () => S.hz.length >= 8],
  ['5 табиғи нысанды зерттеу', () => S.places.length >= 5],
];
const BADGES = [
  ['🧭', 'Жас зерттеуші', 'Алғашқы портал', () => S.visited.length >= 1],
  ['☢️', 'Уран білгірі', 'Уран порталы', () => S.visited.includes('U')],
  ['🚁', 'Эко-ұшқыш', 'Дронмен 3 шашу', () => S.spray >= 3],
  ['🚗', 'Жасыл жүргізуші', 'Электромобиль 500 км', () => S.tours.car],
  ['⚗️', 'Зертхана шебері', '10 реакция', () => S.reactions.length >= 10],
  ['🦺', 'Қауіпсіздік инспекторы', '8 қауіп табылды', () => S.hz.length >= 8],
  ['📊', 'Функционалды сауатты', 'Барлық ФС тапсырма', () => S.fs.length >= 6],
  ['⚖️', 'Адал азамат', 'Барлық дилемма', () => S.adal.length >= 6],
  ['🧊', '3D химик', '6 молекула', () => S.mol.length >= 6],
  ['🗺️', 'Ұлы саяхатшы', '26 элементтің бәрі', () => S.visited.length >= ELEMENTS.length],
  ['🧠', 'Білімпаз', '10 сұраққа дұрыс жауап', () => S.quiz.length >= 10],
  ['👑', 'Химия елшісі', '1000 ұпай', () => S.xp >= 1000],
];
const badgeSay = b => `Құттықтаймын! Жаңа марапат: ${b[1]}!`;
let prevBadges = null;
function refreshQuest() {
  $('#xpVal').textContent = S.xp; const m = $('#missions'); if (!m) return;
  m.innerHTML = MISSIONS.map(([t, f]) => `<div class="mission ${f() ? 'done' : ''}"><span class="ck">${f() ? '✓' : ''}</span>${t}</div>`).join('');
  $('#passport').innerHTML = ELEMENTS.map(e => `<div class="${S.visited.includes(e.s) ? 'got' : ''}" style="${S.visited.includes(e.s) ? `color:${CAT[e.cat].c}` : ''}" data-ps="${e.s}" title="${e.name}">${e.s}</div>`).join('');
  $('#passCount').textContent = S.visited.length;
  $$('[data-ps]').forEach(d => d.onclick = ev => openPortal('el', d.dataset.ps, ev));
  const got = BADGES.map(b => b[3]());
  $('#badges').innerHTML = BADGES.map((b, i) => `<div class="badge ${got[i] ? 'got' : ''}"><div class="e">${b[0]}</div><b>${b[1]}</b><small>${b[2]}</small></div>`).join('');
  if (prevBadges) got.forEach((g, i) => { if (g && !prevBadges[i]) setTimeout(() => { toast(`🏅 Жаңа марапат: ${BADGES[i][0]} ${BADGES[i][1]}!`); Guide.say(badgeSay(BADGES[i])); }, 2500); });
  prevBadges = got;
}
$('#xpBadge').onclick = () => go('quest');
$('#resetBtn').onclick = () => { if (confirm('Барлық прогресті тазалау керек пе?')) { try { localStorage.removeItem('aigid_v1'); } catch (e) {} location.reload(); } };
$('#certBtn').onclick = () => { const name = prompt('Оқушының аты-жөні:'); if (!name) return; const done = MISSIONS.filter(m => m[1]()).length; const bs = BADGES.filter(b => b[3]()).map(b => b[0] + ' ' + b[1]).join(', ') || '—';
  const w = open('', '_blank'); if (!w) return toast('Қалқымалы терезеге рұқсат беріңіз');
  w.document.write(`<!doctype html><meta charset="utf-8"><title>Сертификат</title><body style="font-family:Montserrat,Arial;background:#eef4ff;display:grid;place-items:center;min-height:100vh;margin:0"><div style="width:800px;max-width:95vw;padding:50px;border:10px double #2f7bff;background:#fff;text-align:center;border-radius:20px">
  <div style="font-size:60px">🏆</div><h1 style="color:#0b2a7a;margin:0">СЕРТИФИКАТ</h1><p style="font-size:18px">«AI-ГИД: Қазақстанның химия әлеміне саяхат» квесті</p><h2 style="font-size:32px;color:#b8860b">${name.replace(/</g, '')}</h2>
  <p style="font-size:16px">«Химиялық экспедиция» квестінің <b>${done}/${MISSIONS.length}</b> миссиясын орындап, <b>${S.xp} ұпай</b> жинады.</p><p>Марапаттар: ${bs}</p><p>Жиналған элементтер: <b>${S.visited.length}/${ELEMENTS.length}</b></p>
  <p style="margin-top:40px;color:#555">Жетекші: химия пәні мұғалімі Абдихалилова М.А. · ${new Date().toLocaleDateString('kk-KZ')}</p><button onclick="print()" style="padding:10px 20px;font-size:16px">🖨️ Басып шығару</button></div></body>`); };

/* ========== AI-ГИД ЧАТ ========== */
const chat = { box: $('#aiMsgs') };
function botSay(html, acts = [], voice) { const d = document.createElement('div'); d.className = 'msg bot'; d.innerHTML = html + (acts.length ? `<div class="acts">${acts.map((a, i) => `<button class="btn sm" data-act="${i}">${a[0]}</button>`).join('')}</div>` : '');
  chat.box.appendChild(d); $$('[data-act]', d).forEach(b => b.onclick = ev => acts[+b.dataset.act][1](ev)); chat.box.scrollTop = 1e6; Guide.say(voice || html, { silentBar: true }); }
function meSay(t) { const d = document.createElement('div'); d.className = 'msg me'; d.textContent = t; chat.box.appendChild(d); chat.box.scrollTop = 1e6; }
const goP = id => () => go(id);
const KB = [
  [/витамин|дәрумен/, 'Витаминдер мен элементтер байланысы: B₁₂ витаминінің орталығы — кобальт. Хлорофилл орталығы — магний. Гемоглобинде — темір, ал С витамині темірдің сіңуін арттырады. Қалқанша безге — йод, сүйекке — кальций мен фосфор қажет.', () => [['Co порталы', ev => openPortal('el', 'Co', ev)], ['Mg порталы', ev => openPortal('el', 'Mg', ev)]]],
  [/фламинго|қызғылт|розов/, 'Фламинго қызғылт болып туылмайды! Олар артемия шаянын жейді, ал артемия каротиноидтарға бай балдырлармен қоректенеді. Пигмент қауырсынға жиналады. Бұл — Қорғалжындағы химия мен биология!', () => [['Қорғалжын порталы', ev => openPortal('place', 'korgalzhyn', ev)]]],
  [/қауіпсіз|халат|көзілдірік|қолғап|безопас/, 'Зертхана ережесі: халат, қорғаныс көзілдірігі және қолғап міндетті! Қышқылды суға құямыз, керісінше емес. Заттың дәмін татпаймыз, иісін қолмен желпіп білеміз.', () => [['Қауіпті тап', () => { go('tasks', true); showTask('safe'); }], ['Зертхана', goP('lab')]]],
  [/дрон|шаш|тыңайт|удобр/, 'Дрон режимінде тыңайтқыштар, микроэлементтер, әк және оттек шашуға болады. Дұрыс зат — дұрыс аймаққа! Нормадан асырмаңыз.', () => [['🚁 Дрон', () => { go('map', true); World.setMode('drone'); }]]],
  [/электрокар|электромобил|машин|көлік|авто/, 'Электромобиль тікелей көмірқышқыл газын шығармайды. Бірақ ток көмір электр станциясынан алынса, жанама шығарынды бар. Батареясында литий, никель, кобальт, марганец бар, ал қозғалтқыш магнитінде — неодим. Бәрі Қазақстан элементтері!', () => [['🚗 Электромобиль', () => { go('map', true); World.setMode('car'); }]]],
  [/зертхана|реакци|тәжірибе|лаборат/, 'Виртуалды зертханада он сегіз реакция бар: шеге мен мыс купоросы, бор мен тұз қышқылы, сода мен сірке суы, крахмал мен йод және тағы басқалар.', () => [['Зертханаға өту', goP('lab')]]],
  [/менделеев|кесте|таблиц/, 'Периодтық кестеде жүз он сегіз элемент бар. Сары белгісі бар элементтер Қазақстанда өндіріледі.', () => [['Кестеге өту', goP('table')]]],
  [/адал|тұрақты даму|экология/, 'Адал азамат бөлімінде химиялық дилеммалар бар: деректі бұрмалау, қалдықты көлге төгу, тыңайтқыш нормасы. Арал теңізі — үлкен экологиялық сабақ.', () => [['Адал азамат', () => { go('tasks', true); showTask('adal'); }]]],
  [/функционал|сауатт|грамот|есеп/, 'Функционалдық сауаттылық тапсырмалары: минералды су затбелгісі, тыңайтқыш есебі, көмірқышқыл газы есебі, тұздылық және тұрмыстық химия. Карточкаларды аударыңыз!', () => [['Тапсырмаларға', () => { go('tasks', true); showTask('fs'); }]]],
  [/саяхат|бастау|маршрут|тур|экскурс/, 'Саяхат режимін таңдаңыз: AI-тур, дрон немесе электромобиль.', () => [['🤖 AI-тур', () => { go('map', true); World.setMode('tour'); }], ['🚁 Дрон', () => { go('map', true); World.setMode('drone'); }], ['🚗 Электромобиль', () => { go('map', true); World.setMode('car'); }]]],
  [/трейлер|видео|кино/, 'Трейлерлер бөлімінде жеті қысқа фильм бар.', () => [['Трейлерлер', goP('trailers')]]],
  [/автор|мұғалім|учител/, 'Жоба авторы — Абдихалилова Мохинур Абдимуталовна, Айша бибі атындағы жалпы білім беретін мектептің химия пәні мұғалімі.', () => [['Автор туралы', goP('author')]]],
  [/сәлем|привет|салам|hello/, 'Сәлем! Мен — AI-гидпін. Қай элемент немесе жер туралы білгіңіз келеді? Мысалы: уран, алтын қайда, Шарын неге қызыл?', () => []],
];
const DEFAULT_ANS = 'Қызық сұрақ! Мен Қазақстанның элементтері мен табиғи орындарын жақсы білемін. Элементтің атын, мысалы мыс, уран немесе титан, не жердің атын, мысалы Бурабай немесе Балқаш деп жазыңыз.';
const CHAT_HI = 'Сәлем! Мен — AI-гидпін. Сізбен бірге Қазақстанның химия әлеміне саяхат жасаймын. Не білгіңіз келеді?';
function answer(q) {
  const t = q.toLowerCase().trim(); if (!t) return;
  const kb = KB.find(([re]) => re.test(t));
  if (kb && /витамин|дәрумен|фламинго|қауіпсіз|дрон|электро|зертхана|кесте|адал|функционал/.test(t)) return botSay(kb[1], kb[2]());
  const e = ELEMENTS.find(e => { const nm = e.name.toLowerCase().split(/[ (]/)[0]; return t.includes(nm.slice(0, Math.max(3, nm.length - 1))) || RU[e.s].split(' ').some(w => w.length > 2 && t.includes(w)); });
  const p = PLACES.find(p => t.includes(p.name.toLowerCase().slice(0, 5)) || (p.id === 'charyn' && /шарын|чарын/.test(t)) || (p.id === 'caspian' && /каспи/.test(t)) || (p.id === 'aral' && /арал/.test(t)));
  if (p) return botSay(`${p.icon} <b>${p.name}</b> — ${p.sub}.<br>🧪 ${p.chem}`, [['🌀 Порталды ашу', ev => openPortal('place', p.id, ev)], ['🗺️ Картадан', () => { go('map', true); World.flyToPlace(p.id); }]], plSay(p));
  if (e) return botSay(`<b style="color:${CAT[e.cat].c}">${e.s} — ${e.name}</b><br>📍 ${e.place} (${e.region})<br>⛏️ ${e.method}<br>🏆 ${e.rank}<br>💡 ${e.fact}`, [['🌀 Порталды ашу', ev => openPortal('el', e.s, ev)], ['🗺️ Картадан көрсету', () => { go('map', true); World.flyToEl(e.s); }]], elSay(e));
  if (kb) return botSay(kb[1], kb[2]());
  botSay(DEFAULT_ANS, [['🤖 AI-тур', () => { go('map', true); World.setMode('tour'); }], ['⚗️ Зертхана', goP('lab')]]);
}
function initChat() {
  $$('.robot.sm').forEach(r => r.innerHTML = ROBOT);
  $('#aiFab').onclick = () => { $('#aiChat').classList.toggle('open'); if (!chat.started) { chat.started = true; botSay(CHAT_HI, [['🤖 Саяхатты бастау', () => { go('map', true); World.setMode('tour'); }], ['🧪 Уран қайда?', () => { meSay('Уран қайда?'); answer('уран'); }]]); } };
  $('#aiClose').onclick = () => $('#aiChat').classList.remove('open');
  const send = () => { const v = $('#aiIn').value; if (!v.trim()) return; meSay(v); $('#aiIn').value = ''; setTimeout(() => answer(v), 300); };
  $('#aiSend').onclick = send; $('#aiIn').onkeydown = e => e.key === 'Enter' && send();
  const quick = ['Уран қайда?', 'Фламинго неге қызғылт?', 'Витаминдер', 'Дрон не шашады?', 'Қауіпсіздік ережесі', 'Шарын неге қызыл?', 'Электромобиль', 'Алтын'];
  $('#aiQuick').innerHTML = quick.map(q => `<button>${q}</button>`).join('');
  $$('#aiQuick button').forEach(b => b.onclick = () => { meSay(b.textContent); setTimeout(() => answer(b.textContent), 300); });
}

/* ========== data-say батырмалары ========== */
const normTxt = el => { const c = el.cloneNode(true); c.querySelectorAll('.say').forEach(b => b.remove()); c.querySelectorAll('*').forEach(n => n.append(' ')); return c.textContent.replace(/\s+([,.;:!?])/g, '$1').replace(/\s+/g, ' ').trim(); };
function dataSay() { $$('[data-say]').forEach(el => { if (el.dataset.sayDone) return; el.dataset.sayDone = 1; const t = normTxt(el); el.dataset.sayText = t; const b = document.createElement('button'); b.className = 'say'; b.title = 'Тыңдау'; b.textContent = '🔊'; b.onclick = e => { e.stopPropagation(); Guide.say(t); }; el.appendChild(b); }); }

/* ========== ДАУЫС МӘТІНДЕРІН ЖИНАУ (MP3 генерациясы үшін) ========== */
function collectNarration() {
  const T = [];
  Object.values(VO).forEach(v => typeof v === 'string' ? T.push(v) : DRONE_ITEMS.forEach(d => T.push(v(d))));
  T.push(...Object.values(SEC_SAY), ...TOUR.map(s => s.say), CHAT_HI, DEFAULT_ANS, ...KB.map(k => k[1]));
  ELEMENTS.forEach(e => T.push(elSay(e), e.bio, e.geo, e.phys, e.eco, e.q.t));
  PLACES.forEach(p => T.push(plSay(p), p.bio, p.vit, p.geo, p.phys));
  PT.forEach(e => { if (!EL[e.s]) T.push(ptSay(e)); });
  BADGES.forEach(b => T.push(badgeSay(b)));
  T.push(...(window.LAB_NARR || []), ...(window.TASK_NARR || []), ...(window.VR_NARR ? VR_NARR() : []));
  $$('[data-say]').forEach(el => T.push(el.dataset.sayText || normTxt(el)));
  const seen = {}, out = [];
  T.forEach(t => { const s = speechText(t); if (s.length < 2) return; const k = h32(s); if (!seen[k]) { seen[k] = 1; out.push({ k, s }); } });
  return out;
}

/* ========== ІСКЕ ҚОСУ ========== */
function boot() {
  buildPT(); initChat(); refreshQuest(); dataSay();
  Guide.toggle(Guide.on);
  $('#voiceBtn').onclick = () => { const on = Guide.toggle(); toast(on ? '🔊 Аудиогид қосылды' : '🔇 Аудиогид өшірілді'); if (on) Guide.say(VO.voiceOn); };
  $('#eyeBtn').onclick = () => { const on = World.toggleLabels(); $('#eyeBtn').classList.toggle('off', !on); };
  $('#wpToggle').onclick = () => $('#wpanel').classList.toggle('collapsed');
  $('#pageClose').onclick = () => go('map', true);
  $('#startBtn').onclick = () => { go('map', true); World.setMode('tour'); };
  $$('[data-start]').forEach(b => b.onclick = () => { go('map', true); World.setMode(b.dataset.start); });
  let ok = false; try { ok = !!(window.THREE && THREE.OrbitControls && World.init()); } catch (err) { console.error(err); }
  if (!ok) document.body.classList.add('no-webgl');
  if (location.hash === '#collect') { const pre = document.createElement('pre'); pre.id = 'narr'; pre.textContent = JSON.stringify(collectNarration()); document.body.appendChild(pre); return; }
  setTimeout(() => { if (curPage === 'home') Guide.say(VO.welcome); }, 900);
  addEventListener('pointerdown', () => { if (curPage === 'home' && !window.__voicePlayed) setTimeout(() => curPage === 'home' && Guide.say(VO.welcome), 50); }, { once: true });
}
