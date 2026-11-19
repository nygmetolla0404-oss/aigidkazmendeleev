/* =========================================================
   3D тапсырмалар, трейлерлер, педагогикалық идея
   ========================================================= */
function showTask(t) { $$('[data-task]').forEach(b => b.classList.toggle('active', b.dataset.task === t)); $$('.task-pane').forEach(p => p.classList.toggle('on', p.id === 'task-' + t)); if (t === 'mol') { Mol.start(); Guide.say(MOL_ASK); } }
$$('[data-task]').forEach(b => b.onclick = () => showTask(b.dataset.task));
const norm = s => String(s).toLowerCase().replace(/[₀-₉]/g, d => '₀₁₂₃₄₅₆₇₈₉'.indexOf(d)).replace(/[\s%,кгмлгр.]/g, '').replace(/[^a-z0-9а-яәіңғүұқөһ]/g, '');

/* ========== ФУНКЦИОНАЛДЫҚ САУАТТЫЛЫҚ ========== */
const FS = [
 { id: 'water', ic: '🥤', tag: 'Оқу сауаттылығы + Математика', t: 'Минералды су затбелгісі',
   p: `Қазақстанның оңтүстігіндегі минералды су көзінен алынған судың затбелгісі (оқу мысалы):<div class="label-card"><b>💧 Минералды емдік-асханалық су</b><table><tr><td>Гидрокарбонаттар HCO₃⁻</td><td>700 мг/л</td></tr><tr><td>Натрий Na⁺</td><td>250 мг/л</td></tr><tr><td>Кальций Ca²⁺</td><td>60 мг/л</td></tr><tr><td>Магний Mg²⁺</td><td>30 мг/л</td></tr><tr><td>Жалпы минералдылығы</td><td>1,2 г/л</td></tr></table></div><b>0,5 л бөтелкеде неше мг магний бар?</b>`,
   num: [15, 15], back: '30 мг/л × 0,5 л = <b>15 мг Mg²⁺</b>. Магний — хлорофилл мен 300-ден астам ферменттің құрамында. Бірақ натрийдің көптігіне назар аударыңыз: қан қысымы жоғары адамдарға шектеу қажет! <br>🔗 Биология + Математика + Химия' },
 { id: 'fert', ic: '🌾', tag: 'Математикалық сауаттылық', t: 'Тыңайтқыштағы азот',
   p: 'Фермер Солтүстік Қазақстандағы бидай алқабына дронмен <b>аммиак селитрасын NH₄NO₃</b> шашады. Ar(N)=14, Ar(H)=1, Ar(O)=16.<br><br><b>Тыңайтқыштағы азоттың массалық үлесін (%) есептеңіз.</b>',
   num: [34.5, 35.5], back: 'M(NH₄NO₃) = 80 г/моль; ω(N) = 28/80 = <b>35%</b>. Демек 100 кг тыңайтқышта 35 кг азот бар. Норманы есептеп шашу — ақшаны да, табиғатты да үнемдейді! <br>🔗 Химия + Ауыл шаруашылығы + Экология' },
 { id: 'co2', ic: '🚗', tag: 'Жаратылыстану сауаттылығы', t: 'Астанадан Бурабайға дейін',
   p: 'Астана — Бурабай арақашықтығы ~250 км. Бензин көлігі 100 км-ге 7 л жұмсайды, 1 л бензин жанғанда ~2,3 кг CO₂ бөлінеді.<br><br><b>Бір бағытта қанша кг CO₂ бөлінеді?</b>',
   num: [39, 41.5], back: '250/100 × 7 л = 17,5 л; 17,5 × 2,3 = <b>≈ 40 кг CO₂</b>. Бір ересек қарағай жылына шамамен 20–25 кг CO₂ сіңіреді — бір сапарды «өтеу» үшін 2 ағаш бір жыл жұмыс істейді! <br>🔗 Химия + Биология + География' },
 { id: 'aral', ic: '🌊', tag: 'Математика + Экология', t: 'Арал суының тұзы',
   p: 'Кіші Арал суының 1 литрінде шамамен 12 г тұз бар деп алайық. Оқушылар 5 л суды толық буландырды.<br><br><b>Ыдыста неше грамм тұз қалады?</b>',
   num: [60, 60], back: '12 г/л × 5 л = <b>60 г тұз</b>. Арал тартылған кезде дәл осылай тұз концентрациясы артып, балықтар жойылды. Көкарал бөгеті суды сақтап, тұздылықты азайтты. <br>🔗 Химия + География + Экология' },
 { id: 'iron', ic: '🍎', tag: 'Денсаулық сауаттылығы', t: 'Темір тапшылығы',
   p: 'Оқушыға тәулігіне шамамен <b>10 мг темір</b> қажет. 100 г пісірілген жасымықта ~3 мг темір бар.<br><br><b>Тәуліктік норманы тек жасымықтан алу үшін шамамен неше грамм керек?</b>',
   opts: ['100 г', '≈ 330 г', '1 кг'], a: 1, back: '10 / 3 × 100 ≈ <b>330 г</b>. Сондықтан тамақ әртүрлі болуы керек: ет, бауыр, жасымық, анар. Ал С витамині (алма, итмұрын) темірдің сіңуін арттырады! Рудный темірі мен қанымыздағы темір — бір элемент. <br>🔗 Химия + Биология' },
 { id: 'bleach', ic: '🧴', tag: 'Тұрмыстық қауіпсіздік', t: 'Тазалағыштарды араластыру',
   p: 'Анасы ваннаны тезірек тазалау үшін хлорлы ақартқышты (NaClO) қышқылды тазартқышпен (HCl бар) араластырмақшы.<br><br><b>Бұлай істеуге бола ма?</b>',
   opts: ['Иә, күштірек тазалайды', 'Жоқ, улы хлор газы бөлінеді', 'Маңызды емес'], a: 1, back: '<span class="eq">NaClO + 2HCl → NaCl + Cl₂↑ + H₂O</span><br>Хлор Cl₂ — тыныс жолдарын күйдіретін улы газ! Тұрмыстық химияның затбелгісін міндетті түрде оқу керек. <br>🔗 Химия + ОБЖ + Денсаулық' },
 { id: 'battery', ic: '🔋', tag: 'Экологиялық сауаттылық', t: 'Ескі батарея',
   p: 'Үйде 10 ескі батарея жиналды. Олардың құрамында Zn, Mn, Ni, Cd, Li бар.<br><br><b>Не істеу керек?</b>',
   opts: ['Қоқыс жәшігіне тастау', 'Арнайы жинау пунктіне апару', 'Жерге көму'], a: 1, back: 'Бір батарея ~20 м² жерді ауыр металдармен ластауы мүмкін. Қайта өңдеуде мырыш, марганец, никель қайта алынады — бұл <b>айналмалы экономика</b>. ТДМ 12: жауапты тұтыну. <br>🔗 Химия + Экология + Адал азамат' },
];
const fsFront = c => `${c.t}. ${c.p.replace(/<table[\s\S]*?<\/table>/, '')}`;
const fsBack = c => `Дұрыс! ${c.back}`;
function buildFS() {
  $('#fsCards').innerHTML = FS.map((c, i) => `<div class="flip ${S.fs.includes(c.id) ? 'flipped' : ''}" data-fs="${i}"><div class="inner">
   <div class="face"><div class="ic">${c.ic}</div><span class="tag">${c.tag}</span><h3>${c.t} ${sayBtn(fsFront(c))}</h3><div class="grow"><p>${c.p}</p></div>
     ${c.num ? `<div class="ans-row"><input placeholder="Жауап (сан)" inputmode="decimal"><button class="btn sm primary">Тексеру</button></div>` : `<div class="opts">${c.opts.map((o, j) => `<button data-o="${j}">${o}</button>`).join('')}</div>`}
     <div class="fb"></div></div>
   <div class="face back"><div class="ic">✅</div><span class="tag">Дұрыс! Түсіндірме</span><h3>${c.t}</h3><p class="grow">${c.back}</p><button class="btn sm" data-again>↺ Қайта көру</button></div></div></div>`).join('');
  $$('#fsCards .flip').forEach(card => { const c = FS[+card.dataset.fs]; const fb = $('.fb', card);
    const win = () => { card.classList.add('flipped'); Guide.say(fsBack(c)); if (addTo('fs', c.id)) addXP(20, 'Функционалдық сауаттылық!'); };
    if (c.num) { const inp = $('input', card); const chk = () => { const v = parseFloat(inp.value.replace(',', '.')); if (v >= c.num[0] && v <= c.num[1]) win(); else { fb.className = 'fb no'; fb.textContent = isNaN(v) ? 'Сан енгізіңіз' : '❌ Қайта есептеп көріңіз. Бірліктерге назар аударыңыз!'; if (!isNaN(v)) Guide.say(FS_RETRY); } };
      $('.ans-row button', card).onclick = chk; inp.onkeydown = e => e.key === 'Enter' && chk(); }
    else $$('[data-o]', card).forEach(b => b.onclick = () => { if (+b.dataset.o === c.a) { b.classList.add('ok'); setTimeout(win, 400); } else { b.classList.add('no'); fb.className = 'fb no'; fb.textContent = '❌ Ойланып көріңіз...'; Guide.say(VO.wrongAns); } });
    $('[data-again]', card).onclick = () => card.classList.remove('flipped');
    card.addEventListener('pointermove', e => { if (card.classList.contains('flipped')) return; const r = card.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; $('.inner', card).style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`; });
    card.addEventListener('pointerleave', () => { $('.inner', card).style.transform = ''; });
  });
}
buildFS();

/* ========== АДАЛ АЗАМАТ ========== */
const ADAL = [
 { face: 'rotateX(-20deg) rotateY(0deg)', t: '🧪 Тәжірибе нәтижесі оқулықтағыдай шықпады. Ертең есеп тапсыру керек.', o: ['Сандарды «дұрыс» етіп өзгертіп жазамын', 'Нақты нәтижені жазып, қателіктің себебін талдаймын', 'Досымның есебін көшіремін'], a: 1, sdg: 'ТДМ 16 · Адалдық', why: 'Ғылымда деректі бұрмалау — ең ауыр бұзушылық. Күтпеген нәтиже — жаңалықтың бастауы болуы мүмкін! Адал зерттеуші қателікті жасырмайды, түсіндіреді.' },
 { face: 'rotateX(-20deg) rotateY(-90deg)', t: '🏭 Практикадан өтіп жүрген зауытыңыз қалдық суды тазартпай көлге төгетінін байқадыңыз.', o: ['Үндемеймін, менің ісім емес', 'Дәлелдерді жинап, басшылыққа және экологиялық инспекцияға заң аясында хабарлаймын', 'Әлеуметтік желіде тексерілмеген айып жазамын'], a: 1, sdg: 'ТДМ 6 · Таза су', why: 'Ауыр металдар (Cu²⁺, Zn²⁺, Pb²⁺) балықта жиналып, қоректік тізбек арқылы адамға жетеді. Адал азамат заң жолымен, дәлелмен әрекет етеді.' },
 { face: 'rotateX(-20deg) rotateY(-180deg)', t: '🚁 Фермер: «Тыңайтқышты нормадан екі есе көп шаш, өнім де екі есе болады!»', o: ['Келісемін, ол — тапсырыс беруші', 'Нормаға сай шашамын және артық азоттың зиянын түсіндіремін', 'Жартысын шашып, ақшаның бәрін аламын'], a: 1, sdg: 'ТДМ 15 · Құрлықтағы тіршілік', why: 'Артық нитраттар жерасты суына түседі, көлдерде эвтрофикация тудырады. Өнім екі есе өспейді — өсімдіктің сіңіру шегі бар. Ал жартысын шашу — алаяқтық!' },
 { face: 'rotateX(-20deg) rotateY(-270deg)', t: '🛒 Дүкенде: «100% химиясыз таза өнім!» деген жарнама.', o: ['Сенемін, қымбат болса да аламын', 'Затбелгіні оқимын: кез келген зат химиялық элементтерден тұрады — жарнаманы сыни бағалаймын'], a: 1, sdg: 'ТДМ 12 · Жауапты тұтыну', why: 'Су да, витамин де — химиялық зат! Маңыздысы — құрамы мен мөлшері. Функционалдық сауатты азамат маркетингке емес, фактіге сенеді.' },
 { face: 'rotateX(70deg) rotateY(0deg)', t: '🔋 Үйде ескі батареялар мен сынапты шам жиналды.', o: ['Қоқыс жәшігіне тастаймын', 'Арнайы жинау пунктіне апарамын', 'Ауладағы жерге көмемін'], a: 1, sdg: 'ТДМ 12 · Жауапты тұтыну', why: 'Сынап Hg және кадмий Cd — улы. Қайта өңдеу металдарды қайтарады. Бұл — айналмалы экономика.' },
 { face: 'rotateX(-110deg) rotateY(0deg)', t: '🤖 Олимпиадада AI-дан дайын жауапты көшіріп алуға мүмкіндік бар.', o: ['Көшіремін, ешкім білмейді', 'AI-ды тек түсіну үшін қолданамын, жауапты өзім шығарамын'], a: 1, sdg: 'ТДМ 4 · Сапалы білім', why: 'AI — көмекші, алдаудың құралы емес. Адал азамат — ешкім көрмесе де адал болатын адам.' },
 { face: 'rotateX(-20deg) rotateY(45deg)', t: '💧 Зертханада ыдыс жуғанда су крандан үздіксіз ағып тұр, реактивтер артық алынып тасталуда.', o: ['Мектептікі ғой, маңызды емес', 'Суды үнемдеймін, реактивті қажет мөлшерде ғана аламын'], a: 1, sdg: 'ТДМ 6 · Таза су', why: 'Қазақстан — су тапшылығы бар өңір. «Жасыл химия» қағидасы: қалдықты азайту, ресурсты үнемдеу.' },
];
let adalI = 0;
function buildAdal() {
  const box = $('#adalBox'); const cube = $('#adalCube'); const d = ADAL[adalI];
  cube.classList.add('paused'); cube.style.transform = d.face;
  box.innerHTML = `<span class="chip">Дилемма ${adalI + 1}/${ADAL.length} · ${d.sdg}</span><h3 style="margin:12px 0">${d.t} ${sayBtn(d.t)}</h3><div class="opts">${d.o.map((o, i) => `<button data-ao="${i}">${o}</button>`).join('')}</div><div class="fb" id="adalFb"></div>
   <div class="row" style="margin-top:10px"><button class="btn sm" id="adalPrev">◀</button><button class="btn sm" id="adalNext">Келесі ▶</button></div>`;
  $$('[data-ao]', box).forEach(b => b.onclick = () => { const ok = +b.dataset.ao === d.a; b.classList.add(ok ? 'ok' : 'no'); const fb = $('#adalFb');
    fb.className = 'fb ' + (ok ? 'ok' : 'no'); fb.innerHTML = (ok ? '✅ Адал таңдау! ' : '⚠️ Ойланып көріңіз. ') + d.why; Guide.say((ok ? 'Адал таңдау! ' : 'Ойланып көріңіз. ') + d.why);
    if (ok && addTo('adal', adalI)) { addXP(20, 'Адал азамат!'); updAdal(); } });
  $('#adalPrev').onclick = () => { adalI = (adalI - 1 + ADAL.length) % ADAL.length; buildAdal(); };
  $('#adalNext').onclick = () => { adalI = (adalI + 1) % ADAL.length; buildAdal(); };
}
function updAdal() { const p = Math.round(S.adal.length / ADAL.length * 100); $('#adalScore').textContent = p + '%'; $('#adalMeter').style.width = p + '%'; }
buildAdal(); updAdal();

/* ========== 3D МОЛЕКУЛАЛАР (Three.js) ========== */
const CPK = { H: [0xffffff, .32], C: [0x404040, .5], O: [0xff2d2d, .48], N: [0x3050f8, .48], S: [0xffd123, .6], Na: [0xab5cf2, .45], Cl: [0x1ff01f, .62] };
const MOLS = [
 { f: 'H2O', n: 'Су', ans: ['h2o'], kz: 'Балқаш, Алакөл, Ертіс... Судың бұрыштық пішіні (104,5°) оны полюсті етеді — сондықтан ол тұзды ерітеді.', atoms: [['O', 0, .2, 0], ['H', .76, -.39, 0], ['H', -.76, -.39, 0]], bonds: [[0, 1], [0, 2]] },
 { f: 'CO2', n: 'Көмірқышқыл газы', ans: ['co2'], kz: 'Екібастұз ЖЭС-тері көмір жағудан бөледі. Сызықтық молекула (180°). Бор + қышқыл реакциясында да түзіледі.', atoms: [['C', 0, 0, 0], ['O', -1.16, 0, 0], ['O', 1.16, 0, 0]], bonds: [[0, 1, 2], [0, 2, 2]] },
 { f: 'CH4', n: 'Метан', ans: ['ch4'], kz: 'Қарашығанақ табиғи газының негізгі құрамы. Тетраэдр пішіні (109,5°).', atoms: [['C', 0, 0, 0], ['H', .63, .63, .63], ['H', .63, -.63, -.63], ['H', -.63, .63, -.63], ['H', -.63, -.63, .63]], bonds: [[0, 1], [0, 2], [0, 3], [0, 4]] },
 { f: 'NH3', n: 'Аммиак', ans: ['nh3'], kz: 'Азот тыңайтқыштарының негізі («ҚазАзот», Ақтау). Үшбұрышты пирамида.', atoms: [['N', 0, .3, 0], ['H', .94, -.08, 0], ['H', -.47, -.08, .81], ['H', -.47, -.08, -.81]], bonds: [[0, 1], [0, 2], [0, 3]] },
 { f: 'SO2', n: 'Күкірт диоксиді', ans: ['so2'], kz: 'Балқаш мыс зауытының шығарындысы — қышқыл жаңбырдың себебі. Қазір күкірт қышқылын алуға пайдаланылады.', atoms: [['S', 0, .3, 0], ['O', 1.23, -.43, 0], ['O', -1.23, -.43, 0]], bonds: [[0, 1, 2], [0, 2, 2]] },
 { f: 'O3', n: 'Озон', ans: ['o3'], kz: 'Бурабайдың қарағайлы ауасында аз мөлшерде түзіледі. Стратосферадағы озон қабаты ультракүлгін сәуледен қорғайды.', atoms: [['O', 0, .3, 0], ['O', 1.09, -.37, 0], ['O', -1.09, -.37, 0]], bonds: [[0, 1, 2], [0, 2]] },
 { f: 'NaCl', n: 'Ас тұзының кристалдық торы', ans: ['nacl'], kz: 'Арал маңы «Аралтұз» және тұзды көлдер. Иондық кристалл: әр Na⁺ ионын 6 Cl⁻ қоршайды.', lattice: true },
 { f: 'C2H5OH', n: 'Этанол', ans: ['c2h5oh', 'c2h6o', 'ch3ch2oh'], kz: 'Медицинада антисептик. Тұтанғыш! Ағзаға зиянды — Адал азамат сау өмір салтын таңдайды.', atoms: [['C', -.75, 0, 0], ['C', .75, 0, 0], ['O', 1.3, 1.2, 0], ['H', 2.2, 1.2, 0], ['H', -1.15, 1, 0], ['H', -1.15, -.5, .87], ['H', -1.15, -.5, -.87], ['H', 1.15, -.5, .87], ['H', 1.15, -.5, -.87]], bonds: [[0, 1], [1, 2], [2, 3], [0, 4], [0, 5], [0, 6], [1, 7], [1, 8]] },
];
const molSay = m => `Дұрыс! ${m.n}. ${m.kz}`;
const Mol = { i: 0, started: false,
  start() { if (this.started || !window.THREE) { if (!window.THREE) $('#molPanel').innerHTML = '⚠️ 3D кітапхана жүктелмеді. Интернет байланысын тексеріңіз.'; return; } this.started = true;
    const cv = $('#molCanvas'); let r; try { r = this.r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (err) { $('#molPanel').innerHTML = '⚠️ Бұл құрылғыда WebGL (3D графика) қолжетімсіз. Басқа браузерде ашып көріңіз.'; return; } r.setPixelRatio(Math.min(2, devicePixelRatio));
    const sc = this.sc = new THREE.Scene(); const cam = this.cam = new THREE.PerspectiveCamera(45, 1, .1, 100); cam.position.set(0, 0, 6);
    sc.add(new THREE.AmbientLight(0xffffff, .55)); const dl = new THREE.DirectionalLight(0xffffff, .9); dl.position.set(3, 4, 5); sc.add(dl); const dl2 = new THREE.PointLight(0x3fd8ff, .8); dl2.position.set(-4, -2, 3); sc.add(dl2);
    this.grp = new THREE.Group(); sc.add(this.grp);
    let drag = null, vel = { x: 0, y: .006 };
    cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; this.grp.rotation.y += dx * .01; this.grp.rotation.x += dy * .01; vel = { x: dy * .0008, y: dx * .0008 }; drag = { x: e.clientX, y: e.clientY }; });
    cv.addEventListener('pointerup', () => drag = null);
    cv.addEventListener('wheel', e => { e.preventDefault(); cam.position.z = Math.max(3, Math.min(14, cam.position.z + e.deltaY * .005)); }, { passive: false });
    const resize = () => { const w = cv.clientWidth, h = cv.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }; addEventListener('resize', resize); resize();
    const loop = () => { if (!drag) { this.grp.rotation.y += vel.y; this.grp.rotation.x += vel.x; vel.x *= .98; if (Math.abs(vel.y) < .004) vel.y = .004; } r.render(sc, cam); requestAnimationFrame(loop); }; loop();
    this.show(0); },
  build(m) { const g = this.grp; while (g.children.length) g.remove(g.children[0]);
    const sph = (el, x, y, z) => { const [c, rad] = CPK[el]; const me = new THREE.Mesh(new THREE.SphereGeometry(rad, 32, 24), new THREE.MeshStandardMaterial({ color: c, roughness: .35, metalness: .1, emissive: c, emissiveIntensity: .08 })); me.position.set(x, y, z); g.add(me); };
    const bond = (a, b, off = 0) => { const v1 = new THREE.Vector3(...a), v2 = new THREE.Vector3(...b); const dir = v2.clone().sub(v1); const len = dir.length();
      const cy = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, len, 16), new THREE.MeshStandardMaterial({ color: 0xcfd8e3, roughness: .5 }));
      cy.position.copy(v1.clone().add(v2).multiplyScalar(.5)); cy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      if (off) { const perp = new THREE.Vector3(0, 0, 1).cross(dir).normalize().multiplyScalar(off); cy.position.add(perp); } g.add(cy); };
    if (m.lattice) { const s = 1.1; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) { sph((i + j + k) % 2 === 0 ? 'Cl' : 'Na', i * s, j * s, k * s);
        if (i < 1) bond([i * s, j * s, k * s], [(i + 1) * s, j * s, k * s]); if (j < 1) bond([i * s, j * s, k * s], [i * s, (j + 1) * s, k * s]); if (k < 1) bond([i * s, j * s, k * s], [i * s, j * s, (k + 1) * s]); } return; }
    m.atoms.forEach(([el, x, y, z]) => sph(el, x, y, z));
    m.bonds.forEach(([a, b, order]) => { const A = m.atoms[a].slice(1), B = m.atoms[b].slice(1); if (order === 2) { bond(A, B, .1); bond(A, B, -.1); } else bond(A, B); }); },
  show(i) { this.i = (i + MOLS.length) % MOLS.length; const m = MOLS[this.i]; this.build(m); const solved = S.mol.includes(m.f);
    const legend = [...new Set(m.lattice ? ['Na', 'Cl'] : m.atoms.map(a => a[0]))].map(e => `<span class="chip"><i style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#${CPK[e][0].toString(16).padStart(6, '0')}"></i>${e}</span>`).join(' ');
    $('#molPanel').innerHTML = `<span class="chip">Молекула ${this.i + 1}/${MOLS.length} · Тану: ${S.mol.length}/${MOLS.length}</span>
      <h3 style="margin:12px 0 6px">🧊 Бұл қандай зат?</h3><p style="font-size:14px;color:var(--muted);margin:0 0 8px">Модельді тышқанмен айналдырыңыз, дөңгелекпен жақындатыңыз. Атомдарды санап, формуланы жазыңыз.</p>
      <div class="row">${legend}</div>
      <div class="ans-row" style="margin-top:12px"><input id="molIn" placeholder="Формула (латын әріпімен)"><button class="btn sm primary" id="molChk">Тексеру</button></div><div class="fb" id="molFb"></div>
      <div id="molInfo">${solved ? this.info(m) : ''}</div>
      <div class="row" style="margin-top:12px"><button class="btn sm" id="molPrev">◀</button><button class="btn sm" id="molHint">💡 Кеңес</button><button class="btn sm" id="molNext">▶</button></div>`;
    const chk = () => { const v = norm($('#molIn').value); if (m.ans.includes(v)) { $('#molFb').className = 'fb ok'; $('#molFb').textContent = '✅ Дұрыс!'; $('#molInfo').innerHTML = this.info(m); Guide.say(molSay(m)); if (addTo('mol', m.f)) addXP(20, `3D: ${m.n}`); } else { $('#molFb').className = 'fb no'; $('#molFb').textContent = '❌ Атомдарды қайта санаңыз.'; } };
    $('#molChk').onclick = chk; $('#molIn').onkeydown = e => e.key === 'Enter' && chk();
    $('#molPrev').onclick = () => this.show(this.i - 1); $('#molNext').onclick = () => this.show(this.i + 1);
    $('#molHint').onclick = () => { $('#molFb').className = 'fb'; $('#molFb').textContent = `💡 Атау: «${m.n}»`; }; },
  info(m) { return `<div class="quiz" style="border-style:solid;margin-top:12px"><b>${m.n} — <span class="eq">${m.f.replace(/(\d)/g, '<sub>$1</sub>')}</span></b><br><span style="font-size:14px">🇰🇿 ${m.kz}</span></div>`; },
};

/* ========== ҚАУІПТІ ТАП ========== */
const HZ = [
 { x: 150, y: 250, r: 44, t: '🍔 Зертханада тамақ ішуге болмайды — реактив тағамға түсуі мүмкін!' },
 { x: 330, y: 120, r: 34, t: '❓ Затбелгісіз ыдыс! Әр реактивтің атауы мен қауіп белгісі болуы керек.' },
 { x: 470, y: 230, r: 40, t: '👃 Затты тікелей иіскемейді — қолмен желпіп, иісін өзіңізге бағыттайсыз.' },
 { x: 640, y: 210, r: 42, t: '⚠️ Суды қышқылға құюға болмайды! Ереже: ҚЫШҚЫЛДЫ СУҒА жіңішке ағынмен құямыз.' },
 { x: 790, y: 250, r: 40, t: '🔥 Спиртовка жанында қағаз жатыр — өрт қаупі! Жанғыш заттарды алыс ұстаңыз.' },
 { x: 560, y: 470, r: 40, t: '🔪 Еденде сынған шыны. Арнайы қалақпен жинап, контейнерге салу керек.' },
 { x: 790, y: 150, r: 36, t: '🥽 Қыздыру кезінде қорғаныс көзілдірігі жоқ! Көзді шашыраудан қорғау міндетті.' },
 { x: 140, y: 460, r: 44, t: '⚡ Су шалшығы электр розеткасының жанында — тоқ соғу қаупі!' },
];
function buildHZ() {
  const s = $('#hzScene');
  const person = (x, y, shirt, goggles) => `<g transform="translate(${x} ${y})"><rect x="-26" y="10" width="52" height="80" rx="18" fill="${shirt}"/><circle cy="-10" r="24" fill="#f2c9a0"/><path d="M-24 -18 q24 -26 48 0 q-6 -16 -24 -18 q-18 2 -24 18z" fill="#3a2a1a"/>${goggles ? '<rect x="-18" y="-18" width="36" height="12" rx="6" fill="none" stroke="#3fd8ff" stroke-width="3"/>' : ''}<circle cx="-8" cy="-10" r="2.5" fill="#222"/><circle cx="8" cy="-10" r="2.5" fill="#222"/></g>`;
  s.innerHTML = `<defs><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c3b7a"/><stop offset="1" stop-color="#0d2456"/></linearGradient></defs>
  <rect width="900" height="520" fill="url(#wall)"/><rect y="400" width="900" height="120" fill="#3b4a66"/>
  ${Array.from({ length: 12 }, (_, i) => `<line x1="${i * 80}" y1="400" x2="${i * 80 - 60}" y2="520" stroke="#2c3a54"/>`).join('')}
  <rect x="240" y="60" width="200" height="12" fill="#6b4a2a"/><rect x="240" y="140" width="200" height="12" fill="#6b4a2a"/>
  ${[260, 290, 360, 400].map((x, i) => `<rect x="${x}" y="${20 + (i % 2) * 6}" width="22" height="${40 - (i % 2) * 6}" rx="4" fill="${['#ff6b6b', '#4dabf7', '#63e6be', '#ffd43b'][i]}" opacity=".85"/><rect x="${x + 2}" y="38" width="18" height="10" fill="#fff"/>`).join('')}
  <path d="M318 100 h24 v8 l10 22 h-44 l10 -22z" fill="#ccc" opacity=".9"/><text x="330" y="128" font-size="16" text-anchor="middle" fill="#222" font-weight="900">???</text>
  ${[380, 410].map(x => `<rect x="${x}" y="98" width="20" height="40" rx="4" fill="#9be7ff" opacity=".7"/><rect x="${x + 2}" y="112" width="16" height="10" fill="#fff"/>`).join('')}
  <rect x="40" y="300" width="820" height="22" fill="#8a5a32"/><rect x="60" y="322" width="16" height="80" fill="#6b4a2a"/><rect x="820" y="322" width="16" height="80" fill="#6b4a2a"/>
  ${person(150, 200, '#ffffff', true)}<g><path d="M120 262 h50 q4 0 4 4 v6 h-58 v-6 q0 -4 4 -4z" fill="#e0a050"/><rect x="118" y="272" width="56" height="8" fill="#6b3" /><rect x="118" y="280" width="56" height="8" rx="3" fill="#c87533"/></g>
  ${person(470, 200, '#ffffff', true)}<path d="M450 262 l40 0 l-8 -40 h-24z" fill="#bfe6ff" opacity=".8"/><path d="M462 222 q8 -30 16 -50" stroke="#a0ffa0" stroke-width="3" fill="none" stroke-dasharray="4 4"/>
  <g transform="translate(640 200)"><rect x="-40" y="40" width="34" height="56" rx="6" fill="#bfe6ff" opacity=".85"/><text x="-23" y="74" font-size="11" text-anchor="middle" font-weight="800">H₂O</text>
   <path d="M-10 40 q20 -30 34 10" stroke="#bfe6ff" stroke-width="5" fill="none"/><rect x="14" y="50" width="38" height="50" rx="6" fill="#ffe08a" opacity=".85"/><text x="33" y="80" font-size="10" text-anchor="middle" font-weight="800">H₂SO₄</text></g>
  ${person(790, 140, '#ffffff', false)}
  <g transform="translate(790 270)"><rect x="-14" y="10" width="28" height="22" rx="4" fill="#ddd"/><path d="M0 10 q-10 -18 0 -34 q10 16 0 34z" fill="#ffb703"/><path d="M0 6 q-5 -10 0 -20 q5 10 0 20z" fill="#ff6b00"/>
   <rect x="22" y="14" width="50" height="16" fill="#fff" transform="rotate(-8)"/><line x1="26" y1="20" x2="64" y2="14" stroke="#999"/></g>
  <g transform="translate(560 470)">${[[-20, 0, 20], [0, -8, -30], [18, 4, 50], [-4, 10, 110]].map(([x, y, a]) => `<path d="M${x} ${y} l14 -4 l-6 12z" fill="#cfefff" opacity=".85" transform="rotate(${a} ${x} ${y})"/>`).join('')}</g>
  <g transform="translate(140 460)"><ellipse cx="0" cy="10" rx="60" ry="14" fill="#4dabf7" opacity=".6"/><rect x="-80" y="-60" width="30" height="40" rx="4" fill="#eee"/><circle cx="-70" cy="-45" r="3" fill="#333"/><circle cx="-60" cy="-45" r="3" fill="#333"/><path d="M-65 -20 q20 30 40 20" stroke="#222" stroke-width="3" fill="none"/></g>
  ${HZ.map((h, i) => `<g class="hz ${S.hz.includes(i) ? 'found' : ''}" data-hz="${i}"><circle class="mark" cx="${h.x}" cy="${h.y}" r="${h.r}" fill="transparent" stroke="transparent"/></g>`).join('')}`;
  $('#hzCount').textContent = S.hz.length;
  $$('.hz', s).forEach(g => g.onclick = () => { const i = +g.dataset.hz; g.classList.add('found'); $('#hzFb').innerHTML = HZ[i].t; Guide.say(HZ[i].t);
    if (addTo('hz', i)) { addXP(10, 'Қауіп табылды!'); $('#hzCount').textContent = S.hz.length; if (S.hz.length === HZ.length) toast('🦺 Барлық қауіп табылды! Сіз — қауіпсіздік инспекторысыз!'); } });
  s.addEventListener('click', e => { if (!e.target.closest('.hz')) { $('#hzFb').textContent = '🔍 Мұнда қауіп жоқ сияқты... Мұқият қараңыз!'; } });
}
buildHZ();
$('#ppeWriteBtn').onclick = () => { const v = $('#ppeWrite').value.toLowerCase(); const has = [/халат|халат/, /көзілдір|очк|көзәйнек/, /қолғап|перчат/].map(r => r.test(v)); const n = has.filter(Boolean).length; const fb = $('#ppeWriteFb');
  if (n === 3) { fb.className = 'fb ok'; fb.textContent = '✅ ' + PPEW_OK; Guide.say(PPEW_OK); if (addTo('fs', 'ppeWrite')) addXP(15, 'Қорғаныс құралдары!'); }
  else { fb.className = 'fb no'; fb.textContent = `Табылғаны: ${n}/3. ` + PPEW_NO; Guide.say(PPEW_NO); } };

/* ========== ТРЕЙЛЕРЛЕР ========== */
const TRAILERS = [
 { t: 'Қазақстан — Менделеев кестесінің елі', s: 'Кіріспе трейлер', slides: [
   [IMG.belukha, 'Қазақстан', 'Жер қойнауында Менделеев кестесінің 99 элементі анықталған, 70-інің қоры барланған.', ''],
   [IMG.kengir, 'Мыс', 'Жезқазған — қола дәуірінен бергі мыс өлкесі', 'Cu'],
   [IMG.U, 'Уран', 'Әлемдегі №1 уран өндіруші', '₉₂U'],
   [IMG.Au, 'Алтын', 'Көкшетаудан Алтайға дейін', '₇₉Au'],
   [IMG.burabay, 'AI-ГИД', 'Химия әлеміне саяхатқа дайынсыз ба?', 'Химия = өмір'] ] },
 { t: 'Уран елі', s: 'Физика + Химия', slides: [
   [IMG.uraninite, 'Уранинит', 'Шу-Сарысу бассейнінің құмды қабаттарында', 'UO₂'],
   [IMG.isl, 'Шаймалау', 'Шахтасыз, карьерсіз — ұңғымалар арқылы', 'UO₃ + H₂SO₄ → UO₂SO₄ + H₂O'],
   [IMG.npp, 'Энергия', '1 кг уран ≈ 2500 тонна көмір', 'E = mc²'],
   [IMG.syrdarya, 'Жауапкершілік', 'Радиациялық қауіпсіздік — бәрінен маңызды', ''] ] },
 { t: 'Фламинго құпиясы', s: 'Биология + Химия', slides: [
   [IMG.korgalzhyn, 'Қорғалжын', 'Әлемдегі ең солтүстіктегі фламинго мекені', ''],
   [IMG.artemia, 'Артемия', 'Кішкентай шаян — каротиноидтарға бай', ''],
   [IMG.flamingo, 'Қызғылт түс', 'Пигмент қоректік тізбек арқылы жетеді', 'C₄₀H₅₂O₄ — астаксантин'],
   [IMG.steppe, 'Сарыарқа', 'ЮНЕСКО әлемдік мұрасы', ''] ] },
 { t: 'Мыс жолы: кеннен сымға дейін', s: 'Металлургия', slides: [
   [IMG.chalcopyrite, 'Халькопирит', 'Мыс кенінің негізгі минералы', 'CuFeS₂'],
   [IMG.aktogay, 'Ақтоғай', 'Алып карьер', ''],
   [IMG.flotation, 'Флотация', 'Көбікпен минералдарды бөлу', ''],
   [IMG.balkhashSmelter, 'Балқаш', 'Мыс балқыту және SO₂ проблемасы', '2CuFeS₂ + 4O₂ → Cu₂S + 2FeO + 3SO₂'],
   [IMG.Cu, 'Электр', 'Сымдар, электромобиль, күн панелі', 'Cu'] ] },
 { t: 'Арал сабағы', s: 'Адал азамат + Экология', slides: [
   [IMG.aral, 'Арал теңізі', '1960 жылдан бастап су азая бастады', ''],
   [IMG.halite, 'Тұз', 'Тұздылық 10 есеге өсті', 'NaCl'],
   [IMG.saiga, 'Табиғат', 'Ақбөкен, балықтар — экожүйе бір тізбек', ''],
   [IMG.syrdarya, 'Үміт', 'Көкарал бөгеті Кіші Аралды құтқарды', 'Адал азамат = жауапты азамат'] ] },
 { t: 'Ғарыш химиясы: Байқоңыр', s: 'Физика + Химия', slides: [
   [IMG.baikonur, 'Байқоңыр', 'Әлемдегі алғашқы ғарыш айлағы', ''],
   [IMG.H, 'Отын', 'Тотығу-тотықсыздану — зымыранның қозғаушы күші', 'C₁₂H₂₆ + O₂ → CO₂ + H₂O'],
   [IMG.jwst, 'Бериллий', 'Өскемен бериллийі ғарыш телескоптарында', 'Be'],
   [IMG.Ti, 'Титан', 'Жеңіл әрі берік', 'TiCl₄ + 2Mg → Ti + 2MgCl₂'] ] },
 { t: 'Шарын: тастағы химия', s: 'География + Химия', slides: [
   [IMG.charyn, 'Шарын', '12 млн жыл бойғы эрозия', ''],
   [IMG.hematite, 'Гематит', 'Қызыл түстің құпиясы', 'Fe₂O₃'],
   [IMG.bozzhyra, 'Бозжыра', 'Ежелгі мұхит түбі', 'CaCO₃'],
   [IMG.dune, 'Әнші бархан', 'Кварц құмының «әні»', 'SiO₂'] ] },
];
$('#trailerGrid').innerHTML = TRAILERS.map((t, i) => `<div class="trailer" data-tr="${i}"><img src="${t.slides[0][0]}" alt="" loading="lazy" referrerpolicy="no-referrer"><div class="play"></div><div class="cap"><b>🎬 ${t.t}</b><small>${t.s} · ${t.slides.length * 5} сек</small></div></div>`).join('');
$$('[data-tr]').forEach(d => d.onclick = () => playTrailer(+d.dataset.tr));
$('#ytLinks').innerHTML = [['Химиялық реакциялар тәжірибе', '🧪 Реакциялар'], ['Қазатомпром уран өндіру', '☢️ Уран өндіру'], ['Жезқазған мыс', '🟠 Жезқазған мысы'], ['Корғалжын фламинго', '🦩 Қорғалжын'], ['Арал теңізі экология', '🌊 Арал'], ['техника безопасности в кабинете химии', '🦺 Қауіпсіздік']].map(([q, n]) => `<a class="btn sm" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q)}">▶️ ${n}</a>`).join('');
let pl = { t: null, i: 0, paused: false };
function playTrailer(n) {
  const tr = TRAILERS[n]; const p = $('#player'); p.classList.add('open'); document.body.style.overflow = 'hidden';
  p.innerHTML = `<div class="stage">${tr.slides.map(([img, h, txt, f], i) => `<div class="slide" data-i="${i}"><img src="${img}" alt="" referrerpolicy="no-referrer"><div class="vign"></div><div class="txt"><h2>${h}</h2><p>${txt}</p>${f ? `<span class="formula">${f}</span>` : ''}</div></div>`).join('')}</div>
   <div class="bars">${tr.slides.map(() => '<i><b></b></i>').join('')}</div>
   <div class="pctl"><button class="btn sm" id="plPause">⏸</button><button class="btn sm" id="plVoice">${Guide.on ? '🔊' : '🔇'}</button><button class="btn sm" id="plClose">✕</button></div>
   <div class="brand">AI-ГИД · ${tr.t}</div>`;
  pl = { t: null, i: -1, paused: false, n };
  const next = () => { pl.i++; if (pl.i >= tr.slides.length) { addXP(5, 'Трейлер көрілді'); return closePlayer(); }
    $$('.slide', p).forEach((s, i) => { s.classList.toggle('on', i === pl.i); if (i === pl.i) { const im = $('img', s); im.style.animation = 'none'; void im.offsetWidth; im.style.animation = ''; } });
    $$('.bars i b', p).forEach((b, i) => { b.style.transition = 'none'; b.style.width = i < pl.i ? '100%' : '0'; if (i === pl.i) { void b.offsetWidth; b.style.transition = 'width 5s linear'; b.style.width = '100%'; } });
    const [, h, txt] = tr.slides[pl.i]; const myI = pl.i; const t0 = Date.now(); Guide.say(h + '. ' + txt, { silentBar: true }).then(() => { if (pl.i === myI && !pl.paused && $('#player').classList.contains('open')) pl.t = setTimeout(next, Math.max(400, 5000 - (Date.now() - t0))); }); };
  next();
  $('#plClose').onclick = closePlayer;
  $('#plVoice').onclick = () => { const on = Guide.toggle(); $('#plVoice').textContent = on ? '🔊' : '🔇'; };
  $('#plPause').onclick = () => { pl.paused = !pl.paused; $('#plPause').textContent = pl.paused ? '▶' : '⏸'; if (pl.paused) { clearTimeout(pl.t); Guide.stop(); $$('.bars i b', p).forEach(b => { const w = getComputedStyle(b).width; b.style.transition = 'none'; b.style.width = w; }); } else { pl.i--; next(); } };
}
function closePlayer() { clearTimeout(pl.t); const p = $('#player'); if (!p.classList.contains('open')) return; p.classList.remove('open'); p.innerHTML = ''; document.body.style.overflow = ''; Guide.stop(); }
window.closePlayer = closePlayer;

/* ========== ПЕДАГОГИКАЛЫҚ ИДЕЯ ========== */
const ANN_KK = `«AI-ГИД: Қазақстанның химия әлеміне саяхат» — химия пәнін биология, география, физика және экологиямен ықпалдастыруға арналған интерактивті цифрлық білім беру платформасы. Платформаның негізі — нақты географиялық шекаралары бар 3D Қазақстан картасы: онда елімізде өндірілетін 26 химиялық элемент кен орындарымен және 14 табиғи-туристік нысан орналасқан. Әр нысан «портал» арқылы ашылып, элементтің кен орнын, өндіру әдісін, реакция теңдеулерін, қолданылуын және пәнаралық байланыстарын (тірі ағзадағы рөлі, витаминдер, физикалық қасиеттері, экологиялық салдары) нақты фотосуреттермен көрсетеді. AI-гид оқушыны саяхат маршрутымен (AI-гид, дрон, электрокар режимдері) жүргізіп, сұрақтарға жауап береді. Платформада виртуалды зертхана (18 реакция, қауіпсіздік ережелері), Д.И. Менделеевтің интерактивті кестесі, функционалдық сауаттылық пен «Адал азамат» құндылықтарына негізделген 3D тапсырмалар, 3D молекулалар, «Химиялық экспедиция» квесті мен видеотрейлерлер бар. Идея оқушының танымдық қызығушылығын, функционалдық сауаттылығын, экологиялық жауапкершілігі мен адалдығын қалыптастыруға бағытталған және кез келген мектепте интернет пен браузер арқылы тегін қолдануға, басқа пәндерге бейімдеуге болады.`;
const ANN_RU = `«AI-ГИД: Путешествие в мир химии Казахстана» — интерактивная цифровая образовательная платформа для интеграции химии с биологией, географией, физикой и экологией. Основа платформы — 3D-карта Казахстана с реальными географическими границами, на которой размещены 26 химических элементов, добываемых в стране, с месторождениями, и 14 природно-туристических объектов. Каждый объект открывается через «портал» и показывает с реальными фотографиями месторождение элемента, способ добычи, уравнения реакций, применение и межпредметные связи (роль в живом организме, витамины, физические свойства, экологические последствия). AI-гид сопровождает ученика по маршруту (режимы AI-гида, дрона и электромобиля) и отвечает на вопросы. На платформе есть виртуальная лаборатория (18 реакций, правила безопасности), интерактивная таблица Д.И. Менделеева, 3D-задания на функциональную грамотность и ценности «Адал азамат», 3D-модели молекул, квест «Химическая экспедиция» и видеотрейлеры. Идея направлена на формирование познавательного интереса, функциональной грамотности, экологической ответственности и честности учащихся; платформа бесплатно используется в любой школе через браузер и легко адаптируется под другие предметы.`;
$('#pedRoot').innerHTML = `
<div class="ped-grid">
 <div class="panel ped-card" data-say><h3><span class="n">1</span>Өзектілігі</h3><ul>
  <li>«Білім туралы» ҚР Заңы және <b>ҚР мектепке дейінгі, орта, техникалық және кәсіптік білім беруді дамытудың 2023–2029 жылдарға арналған тұжырымдамасы</b> цифрлық, функционалдық және пәнаралық құзыреттерді дамытуды талап етеді.</li>
  <li>Оқушылар химияны жиі «жаттанды формулалар» деп қабылдап, оның өз еліндегі кен орындарымен, табиғатпен, денсаулықпен байланысын көрмейді.</li>
  <li>PISA үлгісіндегі функционалдық сауаттылық тапсырмалары мен «Адал азамат» құндылықтарын пәнге кіріктіру қажеттігі.</li>
  <li>Жасанды интеллект пен 3D технологиялар — оқушыларға таныс, қызықты тіл.</li></ul></div>
 <div class="panel ped-card" data-say><h3><span class="n">2</span>Мақсаты</h3><p>AI-гид пен интерактивті 3D Қазақстан картасы арқылы химияны жаратылыстану пәндерімен (биология, география, физика, экология) ықпалдастырып, оқушылардың <b>танымдық қызығушылығын, функционалдық сауаттылығын және «Адал азамат» құндылықтарын</b> қалыптастыру; озық тәжірибені педагогтер қауымдастығына тарату.</p></div>
 <div class="panel ped-card" data-say><h3><span class="n">3</span>Міндеттері</h3><ul>
  <li>Қазақстанның химиялық элементтері мен кен орындары туралы нақты, көрнекі ақпарат беру;</li>
  <li>әр тақырыпта химияның биология, география, физика, экологиямен байланысын ашу;</li>
  <li>виртуалды зертханада қауіпсіз тәжірибе жасау дағдысын дамыту;</li>
  <li>өмірлік жағдаяттарға негізделген функционалдық сауаттылық тапсырмаларын шешуге үйрету;</li>
  <li>адалдық, экологиялық жауапкершілік, тұрақты даму құндылықтарын тәрбиелеу;</li>
  <li>геймификация (квест, XP, марапаттар) арқылы оқу мотивациясын арттыру;</li>
  <li>платформаны әріптестерге тарату және бейімдеу әдістемесін ұсыну.</li></ul></div>
</div>

<h3 style="text-align:center;margin:40px 0 18px;font-size:24px">🎯 Қандай мәселелерді шешеді?</h3>
<div class="problems">
 ${[['Химия өмірден алшақ, абстрактілі', 'Нақты картада 26 элемент пен кен орны: «Сенің смартфоныңда Өскемен танталы бар»'],
    ['Пәнаралық байланыс жүйесіз', 'Әр порталда 4 пән: биология (витаминдер, ағза), география, физика, экология'],
    ['Зертхана жабдығы мен реактивтердің тапшылығы, қауіпсіздік', 'Виртуалды зертхана: 18 реакция, шеге, бор, ерітінділер — нақты көрініспен, қауіпсіз'],
    ['Функционалдық сауаттылық тапсырмаларының аздығы', '3D тапсырмалар: затбелгі оқу, тыңайтқыш, CO₂, тұздылық, тұрмыстық химия'],
    ['Оқу мотивациясының төмендігі', 'AI-гид, дрон мен электрокар экскурсиясы, квест, XP, марапаттар, трейлерлер'],
    ['Құндылықтарды пәнге кіріктіру қиындығы', '«Адал азамат» дилеммалары + ТДМ (тұрақты даму мақсаттары)'],
    ['Оқушылардың әртүрлі қарқыны', 'Өз қарқынымен жұмыс, дауыспен оқу, кеңестер, қайталау мүмкіндігі']].map(([p, s]) => `<div class="prob" data-say><div class="p"><b style="color:#ff9aa5">Мәселе</b>${p}</div><div class="s"><b style="color:var(--green)">Шешім</b>${s}</div></div>`).join('')}
</div>

<div class="ped-grid" style="margin-top:30px">
 <div class="panel ped-card" data-say><h3><span class="n">4</span>Жаңалығы</h3><ul>
  <li>Қазақстан кен орындарына <b>«портал» арқылы саяхат</b> — география мен химияның бірегей синтезі;</li>
  <li>AI-гидтің үш режимі: гид, <b>дрон</b> (пайдалы заттарды шашу симуляциясы), <b>эко-электрокар</b> (CO₂ есебі);</li>
  <li>химия + функционалдық сауаттылық + «Адал азамат» — бір платформада;</li>
  <li>нақты деректер: Natural Earth шекаралары, Wikimedia Commons фотолары;</li>
  <li>тегін, орнатуды қажет етпейді, кез келген құрылғыда жұмыс істейді.</li></ul></div>
 <div class="panel ped-card" data-say><h3><span class="n">5</span>Сабақта қолдану (45 мин үлгісі)</h3><div class="timeline">
  <div><b>0–5 мин.</b> Қызығушылықты ояту: тақырыптық трейлер</div>
  <div><b>5–20 мин.</b> Топтық жұмыс: әр топ бір порталды зерттеп, пәнаралық байланысты таныстырады</div>
  <div><b>20–30 мин.</b> Виртуалды зертхана: реакцияны бақылау, теңдеу жазу</div>
  <div><b>30–40 мин.</b> ФС немесе 3D молекула тапсырмасы</div>
  <div><b>40–45 мин.</b> Рефлексия: «Адал азамат» дилеммасы, XP нәтижесі</div></div></div>
 <div class="panel ped-card" data-say><h3><span class="n">6</span>Күтілетін нәтижелер</h3><ul>
  <li><b>Оқушы:</b> элементтерді кен орнымен, ағзадағы рөлімен байланыстырады; теңдеу жазады; өмірлік есеп шығарады; адал әрі экологиялық жауапты шешім қабылдайды.</li>
  <li><b>Мұғалім:</b> дайын цифрлық ресурс, сабақ уақытын үнемдеу, оқушы прогресін (XP, миссиялар) бақылау.</li>
  <li><b>Мектеп:</b> STEM мен цифрлық білім беру ортасының дамуы, пәнаралық әдістемелік бірлестіктің жұмысы.</li></ul></div>
</div>

<h3 style="text-align:center;margin:40px 0 18px;font-size:24px">🤝 Тәжірибені әріптестермен қалай бөлісуге болады?</h3>
<div class="share-grid">
 ${[['🔗', 'Сайт сілтемесі мен QR-код', 'Платформа бір сілтеме арқылы ашылады — WhatsApp/Telegram әдістемелік топтарына, мектеп сайтына жариялау'],
    ['🎓', 'Шеберлік сыныбы', 'Аудандық/облыстық әдістемелік бірлестіктерде, «Ұстаз» семинарларында көрсету'],
    ['💻', 'Онлайн вебинар', 'Мұғалімдерге платформамен жұмыс және сабаққа кіріктіру бойынша вебинар'],
    ['📘', 'Әдістемелік нұсқаулық', 'Сабақ жоспарлары, тапсырмалар банкі, бағалау критерийлері'],
    ['🧩', 'Ашық үлгі — бейімдеу', 'Деректер бөлек файлда (data.js): биология, география мұғалімдері өз нысандарын қоса алады'],
    ['🏫', 'Ашық сабақ', 'Әріптестер үшін ашық сабақ пен сабақтан тыс STEM-апталық'],
    ['📰', 'Басылым мен конференция', 'Педагогикалық журналдарда мақала, ғылыми-практикалық конференцияларда баяндама'],
    ['🌐', 'Кәсіби қауымдастық', 'Химия мұғалімдерінің желілік қауымдастығы: тапсырмалармен алмасу']].map(([e, t, d]) => `<div class="share" data-say><div class="e">${e}</div><b>${t}</b><p style="font-size:13px;color:var(--muted);margin:6px 0 0">${d}</p></div>`).join('')}
</div>

<div class="ped-grid" style="margin-top:30px">
 <div class="panel ped-card" style="grid-column:1/-1"><h3><span class="n">7</span>Фестивальдің бағалау өлшемшарттарына сәйкестік</h3>
  <div style="overflow-x:auto"><table class="crit"><tr><th>Өлшемшарт (Ереже, 16-тармақ)</th><th>Жобадағы көрінісі</th></tr>
  <tr><td><b>1. Мақсаттары мен міндеттері</b><br><small>өзектілігі, зерттелуі, автордың қызығушылығы</small></td><td>Мемлекеттік құжаттарға сүйенген өзектілік; нақты мақсат пен 7 міндет; автордың химия мұғалімі ретіндегі тәжірибесінен туған идея.</td></tr>
  <tr><td><b>2. Мазмұны</b><br><small>ақпараттың дұрыстығы, таңдалуы, көрнекілік, практикалық қажеттілік</small></td><td>Ашық ғылыми дереккөздер (Natural Earth, Wikimedia); 26 элемент, 14 нысан, 18 реакция; 3D карта, фото, трейлерлер; сабақта бірден қолдануға дайын.</td></tr>
  <tr><td><b>3. Сөйлеуді дұрыс ұйымдастыру</b><br><small>бірізділік, бөліктердің бірлігі, қорытынды</small></td><td>TEDx 7 минуттық құрылым: ілгек → мәселе → шешім демонстрациясы → нәтиже → тарату → қорытынды.</td></tr>
  <tr><td><b>4. Тиімділікті бағалау</b><br><small>аудиторияға жағымдылығы, түсініктілігі</small></td><td>Жанды демонстрация: портал ашу, дрон шашу, зертхана реакциясы; аудиторияның өзі сұрақ қоя алатын AI-гид.</td></tr>
  <tr><td><b>5. Жеке жетістіктер</b><br><small>аудиториямен байланыс, жаңа пікір</small></td><td>Залға интерактив: QR арқылы квестке қосылу, «Адал азамат» дилеммасына дауыс беру; жаңа идея — «химия арқылы туған елді тану».</td></tr></table></div></div>
 <div class="panel ped-card" data-say><h3><span class="n">8</span>TEDx баяндама жоспары (7 мин)</h3><div class="timeline">
  <div><b>0:00–0:45</b> Ілгек: «Сіздің қалтаңызда Өскемен танталы бар екенін білесіз бе?»</div>
  <div><b>0:45–1:45</b> Мәселе: химия — өмірден алшақ, пәндер бөлек</div>
  <div><b>1:45–3:30</b> Шешім: 3D карта, портал, AI-гид, дрон мен электрокар</div>
  <div><b>3:30–4:45</b> Зертхана, функционалдық сауаттылық, «Адал азамат»</div>
  <div><b>4:45–5:45</b> Нәтижелер: оқушылардың қызығушылығы мен жетістіктері</div>
  <div><b>5:45–6:30</b> Тарату: сілтеме, QR, шеберлік сыныбы</div>
  <div><b>6:30–7:00</b> Қорытынды: «Химия — туған жерді танудың кілті»</div></div></div>
 <div class="panel ped-card" data-say><h3><span class="n">9</span>Тиімділікті өлшеу</h3><ul>
  <li>Диагностикалық алдын ала және қорытынды тест;</li>
  <li>платформадағы прогресс: XP, миссиялар, ашылған реакциялар;</li>
  <li>оқушылар мен ата-аналар сауалнамасы, рефлексия парағы;</li>
  <li>ФС тапсырмаларын орындау сапасының динамикасы;</li>
  <li>әріптестердің кері байланысы (ашық сабақ, вебинар).</li></ul></div>
 <div class="panel ped-card" data-say><h3><span class="n">10</span>Негізгі ой</h3><p data-say style="font-size:17px;line-height:1.6"><b>Химия — туған жерді танудың кілті.</b> Оқушы кен орнын, көлді, орманды химия көзімен көрсе, білім өмірмен байланысады, ал адалдық пен жауапкершілік — әдетке айналады.</p></div>
</div>

<h3 style="text-align:center;margin:40px 0 18px;font-size:24px">📄 Аннотация</h3>
<div class="annot">
 <div class="panel"><div class="row" style="justify-content:space-between"><b>🇰🇿 Қазақ тілінде</b><button class="btn sm" id="annSay">🔊 Тыңдау</button><button class="btn sm" data-copy="kk">📋 Көшіру</button></div><p>${ANN_KK}</p></div>
 <div class="panel"><div class="row" style="justify-content:space-between"><b>🇷🇺 На русском языке</b><button class="btn sm" data-copy="ru">📋 Копировать</button></div><p>${ANN_RU}</p></div>
</div>`;
$$('[data-copy]').forEach(b => b.onclick = () => { const t = b.dataset.copy === 'kk' ? ANN_KK : ANN_RU; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('📋 Көшірілді!')).catch(() => toast('Мәтінді қолмен белгілеп көшіріңіз')); });

const FS_RETRY = 'Қайта есептеп көріңіз. Бірліктерге назар аударыңыз!';
const MOL_ASK = 'Бұл қандай зат? Модельді айналдырып, атомдарды санаңыз және формуланы латын әріпімен жазыңыз.';
const PPEW_OK = 'Керемет: халат, қорғаныс көзілдірігі және қолғап!';
const PPEW_NO = 'Тағы ойланыңыз: денені, көзді және қолды не қорғайды?';
$('#annSay').onclick = () => Guide.say(ANN_KK);
window.TASK_NARR = [FS_RETRY, MOL_ASK, PPEW_OK, PPEW_NO, ANN_KK, ...FS.flatMap(c => [fsFront(c), fsBack(c)]), ...ADAL.flatMap(d => [d.t, 'Адал таңдау! ' + d.why, 'Ойланып көріңіз. ' + d.why]), ...MOLS.map(molSay), ...HZ.map(h => h.t), ...TRAILERS.flatMap(t => t.slides.map(([, h, txt]) => h + '. ' + txt))];
