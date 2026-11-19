/* =========================================================
   Виртуалды зертхана
   ========================================================= */
(function () {
const REAG = [
  { id: 'nail', n: 'Темір шеге', f: 'Fe', kind: 'nail' },
  { id: 'chalk', n: 'Бор (мел)', f: 'CaCO₃', kind: 'chalk' },
  { id: 'zn', n: 'Мырыш түйіршіктері', f: 'Zn', kind: 'gran', c: '#b8c4cc' },
  { id: 'mg', n: 'Магний таспасы', f: 'Mg', kind: 'ribbon' },
  { id: 'potato', n: 'Картоп тілімі', f: 'крахмал', kind: 'potato' },
  { id: 'soda', n: 'Ас содасы', f: 'NaHCO₃', kind: 'powder', c: '#ffffff' },
  { id: 'citric', n: 'Лимон қышқылы', f: 'C₆H₈O₇', kind: 'powder', c: '#fff7d6' },
  { id: 'hcl', n: 'Тұз қышқылы', f: 'HCl', kind: 'bottle', c: '#e8f6ff', hz: true },
  { id: 'vinegar', n: 'Сірке суы', f: 'CH₃COOH', kind: 'bottle', c: '#fdf6e3' },
  { id: 'cuso4', n: 'Мыс купоросы', f: 'CuSO₄', kind: 'bottle', c: '#1e90ff' },
  { id: 'naoh', n: 'Натрий гидроксиді', f: 'NaOH', kind: 'bottle', c: '#f4f9ff', hz: true },
  { id: 'phenol', n: 'Фенолфталеин', f: 'индикатор', kind: 'drop', c: '#ffffff' },
  { id: 'agno3', n: 'Күміс нитраты', f: 'AgNO₃', kind: 'bottle', c: '#f1f1f1', dark: true },
  { id: 'nacl', n: 'Ас тұзы ерітіндісі', f: 'NaCl', kind: 'bottle', c: '#eef7ff' },
  { id: 'water', n: 'Су', f: 'H₂O', kind: 'bottle', c: '#bfe6ff' },
  { id: 'h2o2', n: 'Сутек пероксиді', f: 'H₂O₂', kind: 'bottle', c: '#f0fbff', dark: true },
  { id: 'kmno4', n: 'Марганцовка', f: 'KMnO₄', kind: 'bottle', c: '#8e24aa' },
  { id: 'iodine', n: 'Йод ерітіндісі', f: 'I₂', kind: 'drop', c: '#8b4513' },
  { id: 'cabbage', n: 'Қызыл қырыққабат шырыны', f: 'антоциан', kind: 'bottle', c: '#7b3fa0' },
  { id: 'ki', n: 'Калий йодиді', f: 'KI', kind: 'bottle', c: '#fff8e0' },
  { id: 'soap', n: 'Сұйық сабын', f: 'ЖБЗ', kind: 'bottle', c: '#9fe8ff' },
  { id: 'glycerin', n: 'Глицерин', f: 'C₃H₅(OH)₃', kind: 'drop', c: '#f6fbff' },
  { id: 'sugar', n: 'Қант', f: 'C₁₂H₂₂O₁₁', kind: 'powder', c: '#ffffff' },
  { id: 'h2so4', n: 'Конц. күкірт қышқылы', f: 'H₂SO₄', kind: 'bottle', c: '#f7f2e0', hz: true },
];
const R = Object.fromEntries(REAG.map(r => [r.id, r]));
const RX = {
  'cuso4+nail': { n: 'Темір мысты ығыстырады', eq: 'Fe + CuSO₄ → FeSO₄ + Cu↓', fx: 'coat', col: '#4fb3a0', obs: 'Шеге бетінде қызыл-қоңыр мыс қабаты пайда болды, көк ерітінді жасылданды.', why: 'Темір мысқа қарағанда белсенді (металдардың активтілік қатары) — мыс иондарын ығыстырады.', link: '🇰🇿 Рудный темірі + Жезқазған мысы бір стаканда! Бұл — гидрометаллургияның негізі.' },
  'chalk+hcl': { n: 'Бор қышқылда ериді', eq: 'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑', fx: 'bubbles', col: '#eaf6ff', obs: 'Бор көпіршіп, біртіндеп кішірейеді. CO₂ газы бөлінеді.', why: 'Карбонаттар күшті қышқылмен әрекеттесіп, көмірқышқыл газын бөледі.', link: '🏔️ Бозжыраның ақ жартастары — дәл осы CaCO₃! Геологтар жынысқа HCl тамызып тексереді.' },
  'chalk+vinegar': { n: 'Бор мен сірке суы', eq: 'CaCO₃ + 2CH₃COOH → Ca(CH₃COO)₂ + H₂O + CO₂↑', fx: 'bubbles-slow', col: '#fbf4e2', obs: 'Баяу көпіршу байқалады.', why: 'Сірке қышқылы — әлсіз қышқыл, реакция баяу жүреді.', link: '🦷 Тіс эмалі де қышқылдан бұзылады — қышқыл сусындардан кейін ауызды шайыңыз!' },
  'soda+vinegar': { n: '«Вулкан» реакциясы', eq: 'NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂↑', fx: 'foam', col: '#fff8e8', obs: 'Қатты көбік пайда болып, стаканнан асып төгілді!', why: 'Гидрокарбонат пен қышқыл әрекеттесіп, көп CO₂ бөледі.', link: '🍞 Нан мен бауырсақ пісіргенде сода «сөндіріледі» — қамыр осы CO₂ көпіршіктерімен көтеріледі.' },
  'citric+soda': { n: 'Көпіршікті таблетка', eq: '3NaHCO₃ + C₆H₈O₇ → Na₃C₆H₅O₇ + 3H₂O + 3CO₂↑', fx: 'fizz', col: '#f4fbff', obs: 'Ысылдап көпіршіді (су қосылғанда).', why: 'Құрғақ күйде әрекеттеспейді, суда иондар пайда болғанда реакция басталады.', link: '💊 Көпіршікті С витамині таблеткасы осылай жасалады!' },
  'naoh+phenol': { n: 'Индикатор: сілті', eq: 'NaOH → Na⁺ + OH⁻ (фенолфталеин — таңқурай түсті)', fx: 'color', col: '#e0137a', obs: 'Ерітінді таңқурай-қызыл түске боялды!', why: 'Фенолфталеин pH > 8,2 сілтілік ортада түсін өзгертеді.', link: '🧼 Сабын ерітіндісі де сілтілі — фенолфталеинмен тексеріп көріңіз.' },
  'hcl+naoh': { n: 'Бейтараптану', eq: 'HCl + NaOH → NaCl + H₂O + Q', fx: 'heat', col: '#eef7ff', obs: 'Стакан жылынды. Ас тұзы мен су түзілді.', why: 'Қышқыл + негіз → тұз + су. Экзотермиялық реакция.', link: '🩺 Асқазандағы артық HCl-ды бейтараптайтын дәрілер (антацидтер) осы принциппен жұмыс істейді.' },
  'hcl+zn': { n: 'Мырыш + қышқыл → сутек', eq: 'Zn + 2HCl → ZnCl₂ + H₂↑', fx: 'bubbles', col: '#f2f9ff', obs: 'Түйіршіктер бетінен газ көпіршіктері бөлінді. Сіріңкені әкелсек — «поп!»', why: 'Мырыш сутектен белсенді — қышқылдан сутекті ығыстырады.', link: '🇰🇿 Риддер мырышы! Сутек — болашақтың таза отыны.' },
  'hcl+mg': { n: 'Магний белсенді әрекеттеседі', eq: 'Mg + 2HCl → MgCl₂ + H₂↑ + Q', fx: 'bubbles-fast', col: '#f2f9ff', obs: 'Өте тез көпіршу, таспа ерімей жатыр, стакан ысыды!', why: 'Магний мырыштан да белсенді металл.', link: '🇰🇿 Өскемен магнийі. Хлорофилл орталығы да Mg!' },
  'h2o2+kmno4': { n: 'Марганцовка + пероксид', eq: '2KMnO₄ + 3H₂O₂ → 2MnO₂↓ + 2KOH + 3O₂↑ + 2H₂O', fx: 'bubbles-precip', col: '#9a6b3a', pc: '#5a3a1a', obs: 'Күлгін түс жоғалып, қоңыр тұнба түзілді, оттек көпіршіктері бөлінді.', why: 'Тотығу-тотықсыздану реакциясы: Mn⁺⁷ → Mn⁺⁴, O⁻¹ → O⁰.', link: '🇰🇿 Жәйрем марганеці. Екеуі де антисептик — бірақ араластыруға болмайды!' },
  'agno3+nacl': { n: 'Хлорид-ионын анықтау', eq: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃', fx: 'precip', col: '#f4f4f4', pc: '#ffffff', obs: 'Ақ ірімшік тәрізді тұнба түзілді.', why: 'Ag⁺ + Cl⁻ → AgCl↓ — хлорид иондарына сапалық реакция.', link: '🌊 Арал мен Балқаш суындағы тұздылықты осылай анықтауға болады!' },
  'cuso4+naoh': { n: 'Мыс гидроксиді', eq: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄', fx: 'precip', col: '#cfe8ff', pc: '#2b7bd6', obs: 'Көгілдір іркілдек тұнба түзілді. (🔥 Қыздырып көріңіз!)', why: 'Ерімейтін негіз тұнбаға түседі — алмасу реакциясы.', link: '🎨 Мыс қосылыстары — Ясауи кесенесінің көгілдір тақталарындағы түстің бір көзі.' },
  'iodine+potato': { n: 'Крахмалға сапалық реакция', eq: 'Крахмал + I₂ → көк-күлгін кешен', fx: 'potato-blue', col: '#c8a46a', obs: 'Картоп тілімі қою көк-күлгін түске боялды!', why: 'Йод молекулалары крахмал спиралінің ішіне кіріп, түсті кешен түзеді.', link: '🥔 Биология: өсімдіктер глюкозаны крахмал түрінде сақтайды. Тағамдағы крахмалды осылай табамыз.' },
  'cabbage+vinegar': { n: 'Табиғи индикатор: қышқыл', eq: 'Антоциан + H⁺ → қызыл түс', fx: 'color', col: '#e0245e', obs: 'Күлгін шырын қызылға айналды!', why: 'Антоциан пигменті pH-қа байланысты түсін өзгертеді.', link: '🍇 Қаражидек, жүзім, қызыл қырыққабат — табиғи индикаторлар. Биология + химия!' },
  'cabbage+soda': { n: 'Табиғи индикатор: сілті', eq: 'Антоциан + OH⁻ → көк-жасыл түс', fx: 'color', col: '#1fa38a', obs: 'Шырын көк-жасыл түске боялды!', why: 'Әлсіз сілтілі ортада антоциан құрылымы өзгереді.', link: '🌸 Гортензия гүлінің түсі топырақтың pH-ына байланысты өзгереді!' },
  'hcl+nail': { n: 'Темір + тұз қышқылы', eq: 'Fe + 2HCl → FeCl₂ + H₂↑', fx: 'bubbles-slow', col: '#d8f0d0', obs: 'Шеге бетінде баяу көпіршу, ерітінді ақшыл-жасыл.', why: 'Темір мырыштан аз белсенді — реакция баяу.', link: '🏭 Металлургияда болатты тоттан тазарту үшін қышқылмен «өңдейді» (травление).' },
  'nail+water': { n: 'Тоттану (коррозия)', eq: '4Fe + 3O₂ + 6H₂O → 4Fe(OH)₃ (тот)', fx: 'rust', col: '#d9a066', obs: 'Уақыт өте келе шеге қоңыр-сары тотқа айналды (жеделдетілген көрініс).', why: 'Темір ылғал мен оттекпен баяу тотығады.', link: '🏜️ Шарын шатқалының қызыл түсі — табиғи «тот» Fe₂O₃! Хром қосылған болат тоттанбайды.' },
  'h2o2+ki': { n: '«Піл тіс пастасы»', eq: '2H₂O₂ →(KI) 2H₂O + O₂↑', fx: 'mega-foam', col: '#fff6d6', obs: 'Алып көбік бағанасы стаканнан атқылап шығып, үстелге төгілді! Көбік жылы.', why: 'Калий йодиді — катализатор: пероксидтің ыдырауын мыңдаған есе жылдамдатады. Бөлінген оттекті сабын көбікке айналдырады.', link: '🧪 Катализатор реакцияға қатысады, бірақ өзі жұмсалмайды. Мұнай өңдеуде, Теңіз зауыттарында да катализаторлар қолданылады.' },
  'glycerin+kmno4': { n: 'Өздігінен жану', eq: '14KMnO₄ + 4C₃H₅(OH)₃ → 7K₂CO₃ + 7Mn₂O₃ + 5CO₂ + 16H₂O', fx: 'selfire', col: '#4a1a5a', obs: 'Бірнеше секундтан кейін түтін шығып, кенеттен күлгін-қызғылт жалын пайда болды!', why: 'Марганцовка — күшті тотықтырғыш. Глицеринмен әрекеттескенде көп жылу бөлініп, қоспа өздігінен тұтанады.', link: '⚠️ Бұл тәжірибені тек мұғалім тартпа шкафта көрсетеді. Тотықтырғыштарды жанғыш заттардан бөлек сақтаймыз — Адал азамат ережесі!' },
  'h2so4+sugar': { n: '«Қант жыланы»', eq: 'C₁₂H₂₂O₁₁ →(H₂SO₄) 12C + 11H₂O', fx: 'snake', col: '#2a1a10', obs: 'Ақ қант қарайып, ісініп, стаканнан қара көмір «жылан» болып көтерілді! Бу шықты.', why: 'Концентрлі күкірт қышқылы суды тартып алады (сусыздандырғыш). Қанттан тек көміртек қалады, бөлінген бу оны көпіршітеді.', link: '🇰🇿 Күкірт қышқылы Теңіз күкіртінен алынады. Уран өндіруде де қолданылады!' },
  'fire+mg': { n: 'Магний жанады', eq: '2Mg + O₂ → 2MgO', fx: 'flash', col: '#bfe6ff', obs: 'Магний таспасы көзді қарықтыратын ақ жарықпен жанды! Ақ түтін — магний оксиді.', why: 'Магний оттекпен белсенді әрекеттесіп, көп жарық пен жылу бөледі. Жарқылға тікелей қарамаймыз!', link: '🎆 Отшашулардың ақ жарқылы — магний! Өскемен титан-магний комбинатында өндіріледі.' },
  'fire+h2': { n: 'Сутектің «поп» жарылысы', eq: '2H₂ + O₂ → 2H₂O', fx: 'pop', col: '#f2f9ff', obs: 'Сіріңкені жақындатқанда «ПОП!» деген дыбыспен шағын жарылыс болды!', why: 'Сутек пен ауадағы оттек қоспасы — «күркірегіш газ». Бұл сутекке сапалық реакция.', link: '🚀 Зымырандар сутекпен ұшады, ал өнімі — тек су! Таза энергия.' },
  'cuso4+fire': { n: 'Жасыл жалын', eq: 'Cu²⁺ иондары → жасыл жалын', fx: 'color-flame', fc: '#3dff8a', col: '#1e90ff', obs: 'Жалын әдемі көкшіл-жасыл түске боялды!', why: 'Қызған мыс иондарының электрондары белгілі түсті жарық шығарады. Бұл — жалын бойынша сапалық талдау.', link: '🎆 Отшашулардағы жасыл түс — мыс қосылыстары. Жезқазған мысы!' },
  'fire+nacl': { n: 'Сары жалын', eq: 'Na⁺ иондары → сары жалын', fx: 'color-flame', fc: '#ffd21a', col: '#eef7ff', obs: 'Жалын ашық сары-қызғылт сары түске боялды!', why: 'Натрий иондары жалынды сарыға бояйды. Көше шамдарының сары жарығы да натрий буынан.', link: '🧂 Арал маңының ас тұзы — NaCl. Жалынмен оны оңай анықтаймыз!' },
  'h2o2+potato': { n: 'Каталаза ферменті', eq: '2H₂O₂ → 2H₂O + O₂↑ (каталаза)', fx: 'foam', col: '#f4fbff', obs: 'Картоп бетінде ақ көбік пайда болды — оттек бөлінуде!', why: 'Тірі жасушадағы каталаза ферменті пероксидті жылдам ыдыратады.', link: '🧬 Биология: бауыр жасушаларында да каталаза бар — улы H₂O₂-ден қорғайды.' },
};
const NOPE = {
  'chalk+water': 'CaCO₃ суда іс жүзінде ерімейді — реакция жоқ.',
  'nacl+water': 'Тұз суда ериді — бұл физикалық құбылыс, жаңа зат түзілмейді.',
  'cuso4+water': 'Ерітінді сұйылды — түс ашықтады. Бұл химиялық реакция емес.',
  'hcl+water': 'Ереже: ҚЫШҚЫЛДЫ СУҒА құямыз, керісінше емес! Сұйылту — физикалық процесс.',
};
const key = (a, b) => [a, b].sort().join('+');
const PPE_FIRST = 'Алдымен халат, қорғаныс көзілдірігі және қолғапты киіңіз!';
const DRY = { n: 'Құрғақ ұнтақтар', obs: 'Құрғақ күйде ештеңе болмады... 🤔 Су қосып көріңіз!', eq: '—', why: 'Иондар тек ерітіндіде қозғалады.' };
const NOCH = { n: 'Көрінетін өзгеріс жоқ', obs: 'Бұл заттар арасында байқалатын реакция жүрмеді. Басқа комбинацияны байқап көріңіз!', eq: '—', why: 'Кеңес: металл + қышқыл, карбонат + қышқыл, индикатор + сілті немесе қышқыл.' };
const HEATB = { n: 'Мыс гидроксидінің ыдырауы', eq: 'Cu(OH)₂ →(t°) CuO + H₂O', obs: 'Көгілдір тұнба қара түсті мыс(II) оксидіне айналды!', why: 'Ерімейтін негіздер қыздырғанда ыдырайды.', link: '🔥 Бонус реакция! Қыздыру — реакцияның шарты.' };
const HEAT = { n: 'Қыздыру', obs: 'Ерітінді жылынды. Температура реакция жылдамдығын арттырады: әр 10°C сайын 2–4 есе.', eq: '—', why: '⚠️ Қыздырғанда пробирка аузын өзіңізге және көршіге бағыттамаңыз!' };
const NOFIRE = { n: 'Жанатын зат жоқ', obs: 'Стаканда жанатын немесе жалынды бояйтын зат жоқ.', eq: '—', why: 'Кеңес: магний таспасы, мырыш пен тұз қышқылы, мыс купоросы немесе ас тұзын салып көріңіз.' };
const EXTRA_SHOWS = [DRY, NOCH, HEATB, HEAT, NOFIRE];
const state = { items: [], liquid: null, level: 0, done: false, last: null };
const out = $('#labOut');

/* --- реактив суреттері --- */
function icon(r) {
  switch (r.kind) {
    case 'nail': return `<svg viewBox="0 0 60 60"><rect x="12" y="10" width="36" height="6" rx="2" fill="#8d99a6"/><path d="M27 16h6v30l-3 8-3-8z" fill="#a9b4bf" stroke="#6b7682"/></svg>`;
    case 'chalk': return `<svg viewBox="0 0 60 60"><rect x="10" y="22" width="40" height="14" rx="5" fill="#fafafa" stroke="#ccc" transform="rotate(-18 30 29)"/><circle cx="18" cy="36" r="2" fill="#ddd"/></svg>`;
    case 'gran': return `<svg viewBox="0 0 60 60">${[[20, 34], [32, 30], [26, 42], [40, 40], [36, 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${r.c}" stroke="#7d8a94"/><circle cx="${x - 2}" cy="${y - 2}" r="1.6" fill="#fff" opacity=".8"/>`).join('')}</svg>`;
    case 'ribbon': return `<svg viewBox="0 0 60 60"><path d="M8 40 Q20 10 30 30 T52 18" fill="none" stroke="#d8dde2" stroke-width="5" stroke-linecap="round"/><path d="M8 40 Q20 10 30 30 T52 18" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/></svg>`;
    case 'potato': return `<svg viewBox="0 0 60 60"><ellipse cx="30" cy="32" rx="20" ry="15" fill="#f1dca0" stroke="#b9975b" stroke-width="2"/><circle cx="24" cy="28" r="1.4" fill="#c9a96b"/><circle cx="36" cy="36" r="1.4" fill="#c9a96b"/></svg>`;
    case 'powder': return `<svg viewBox="0 0 60 60"><path d="M16 22h28l-3 30H19z" fill="rgba(255,255,255,.2)" stroke="#9be7ff"/><path d="M18 36h24l-1.6 15H19.6z" fill="${r.c}"/><rect x="14" y="16" width="32" height="7" rx="2" fill="#3fd8ff"/></svg>`;
    case 'drop': return `<svg viewBox="0 0 60 60"><rect x="22" y="22" width="16" height="30" rx="4" fill="rgba(255,255,255,.18)" stroke="#9be7ff"/><rect x="23" y="34" width="14" height="17" rx="3" fill="${r.c}"/><path d="M26 22v-8h8v8" fill="#333"/><ellipse cx="30" cy="11" rx="6" ry="5" fill="#e33"/></svg>`;
    default: return `<svg viewBox="0 0 60 60"><path d="M24 8h12v10l8 10v24a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V28l8-10z" fill="${r.dark ? 'rgba(90,60,20,.45)' : 'rgba(255,255,255,.18)'}" stroke="#9be7ff"/><path d="M17 34h26v18a3 3 0 0 1-3 3H20a3 3 0 0 1-3-3z" fill="${r.c}" opacity=".9"/><rect x="22" y="4" width="16" height="6" rx="2" fill="#555"/>${r.hz ? '<path d="M30 38l6 10H24z" fill="#ffb703" stroke="#000" stroke-width=".8"/><text x="30" y="47" font-size="7" text-anchor="middle" font-weight="900">!</text>' : ''}</svg>`;
  }
}
const shelf = $('#shelf');
shelf.innerHTML = REAG.map(r => `<div class="reag" draggable="true" data-r="${r.id}" title="${r.n}">${icon(r)}<b>${r.n}</b><small>${r.f}</small></div>`).join('');
$$('.reag', shelf).forEach(d => { d.ondragstart = e => e.dataTransfer.setData('text/plain', d.dataset.r); d.onclick = () => addItem(d.dataset.r); });
const bench = $('#bench');
bench.ondragover = e => { e.preventDefault(); bench.classList.add('drag-over'); };
bench.ondragleave = () => bench.classList.remove('drag-over');
bench.ondrop = e => { e.preventDefault(); bench.classList.remove('drag-over'); addItem(e.dataTransfer.getData('text/plain')); };

/* --- стакан --- */
const bk = $('#beakerSvg');
bk.innerHTML = `<defs><clipPath id="bkClip"><path d="M64,40 L64,288 Q64,306 82,306 L218,306 Q236,306 236,288 L236,40Z"/></clipPath>
  <linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".2" stop-color="#fff" stop-opacity=".05"/><stop offset=".85" stop-color="#fff" stop-opacity=".02"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient></defs>
  <ellipse cx="150" cy="316" rx="110" ry="10" fill="#000" opacity=".35"/>
  <g clip-path="url(#bkClip)">
    <rect id="bkLiq" x="60" y="310" width="180" height="0" style="fill:#bfe6ff;transition:fill 1.6s" opacity=".8"/>
    <rect id="bkLiqTop" x="60" y="310" width="180" height="5" fill="#fff" opacity=".25" />
    <rect id="bkPrec" x="60" y="306" width="180" height="0" fill="#fff"/>
    <g id="bkSolids"></g><g id="bkBub"></g>
  </g>
  <path d="M56,30 L64,40 L64,288 Q64,306 82,306 L218,306 Q236,306 236,288 L236,40 L244,30" fill="url(#glass)" stroke="#cfefff" stroke-width="3" stroke-linejoin="round"/>
  ${[100, 150, 200, 250].map((y, i) => `<line x1="64" x2="84" y1="${y}" y2="${y}" stroke="#cfefff" stroke-width="1.5" opacity=".6"/><text x="88" y="${y + 4}" font-size="10" fill="#cfefff" opacity=".7">${(4 - i) * 50} мл</text>`).join('')}
  <g id="bkSteam"></g><g id="bkFoam"></g>`;
const liq = $('#bkLiq'), liqTop = $('#bkLiqTop'), prec = $('#bkPrec'), solids = $('#bkSolids'), bub = $('#bkBub'), foam = $('#bkFoam'), steam = $('#bkSteam');
function setLevel(l) { const h = Math.min(220, l); liq.setAttribute('y', 306 - h); liq.setAttribute('height', h + 4); liqTop.setAttribute('y', 306 - h); }
function drawSolids() {
  solids.innerHTML = '';
  state.items.forEach((id, i) => { const r = R[id]; const x = 110 + i * 40;
    if (r.kind === 'nail') solids.innerHTML += `<g id="sNail" transform="translate(${x} 250) rotate(25)"><rect x="-14" y="-40" width="28" height="7" rx="2" fill="#8d99a6"/><path id="nailBody" d="M-4 -33h8v60l-4 10-4-10z" fill="#a9b4bf" stroke="#6b7682" style="transition:fill 3s"/></g>`;
    if (r.kind === 'chalk') solids.innerHTML += `<rect id="sChalk" x="${x - 30}" y="284" width="64" height="18" rx="6" fill="#fafafa" stroke="#ccc" style="transition:all 4s;transform-origin:${x}px 293px"/>`;
    if (r.kind === 'gran') solids.innerHTML += [[-14, 296], [0, 292], [14, 297], [6, 300], [-6, 300]].map(([dx, y]) => `<circle cx="${x + dx}" cy="${y}" r="7" fill="#b8c4cc" stroke="#7d8a94"/>`).join('');
    if (r.kind === 'ribbon') solids.innerHTML += `<path id="sMg" d="M${x - 30} 296 Q${x - 10} 270 ${x} 290 T${x + 34} 280" fill="none" stroke="#e5e9ec" stroke-width="6" stroke-linecap="round" style="transition:opacity 4s"/>`;
    if (r.kind === 'potato') solids.innerHTML += `<ellipse id="sPotato" cx="${x}" cy="290" rx="34" ry="14" fill="#f1dca0" stroke="#b9975b" stroke-width="2" style="transition:fill 2s"/>`;
    if (r.kind === 'powder') solids.innerHTML += `<path d="M${x - 30} 306 Q${x} 286 ${x + 30} 306Z" fill="${r.c}" opacity=".9"/>`;
  });
}
function bubbles(n = 40, speed = 1, color = '#fff') { for (let i = 0; i < n; i++) { const c = svgEl('circle', { cx: 80 + Math.random() * 140, cy: 300, r: 2 + Math.random() * 5, fill: 'none', stroke: color, 'stroke-width': 1.5, opacity: .9 }, bub);
  const top = 306 - Math.max(30, state.level); c.animate([{ transform: 'translateY(0)', opacity: .9 }, { transform: `translateY(${top - 300}px)`, opacity: .2 }], { duration: (1400 + Math.random() * 1600) / speed, delay: Math.random() * 3000 / speed, iterations: 3 }).onfinish = () => c.remove(); } }
function doFoam(col = '#fff') { const top = 306 - Math.max(30, state.level); for (let i = 0; i < 60; i++) { const c = svgEl('circle', { cx: 70 + Math.random() * 160, cy: top, r: 6 + Math.random() * 12, fill: col, opacity: .9 }, foam);
  c.animate([{ transform: 'translateY(0)', opacity: 0 }, { opacity: .95, offset: .2 }, { transform: `translateY(${-(top - 10) - Math.random() * 40}px)`, opacity: .9, offset: .7 }, { transform: `translateY(${-(top - 30)}px) translateX(${(Math.random() - .5) * 140}px)`, opacity: 0 }], { duration: 3200, delay: i * 30, easing: 'ease-out' }).onfinish = () => c.remove(); } }
function doSteam() { for (let i = 0; i < 14; i++) { const c = svgEl('circle', { cx: 100 + Math.random() * 100, cy: 30, r: 8 + Math.random() * 10, fill: '#fff', opacity: .3 }, steam);
  c.animate([{ transform: 'translateY(0) scale(.6)', opacity: .5 }, { transform: 'translateY(-40px) scale(1.6)', opacity: 0 }], { duration: 2200, delay: i * 150, iterations: 2 }).onfinish = () => c.remove(); } }

function addItem(id) {
  if (!S.ppe) { toast('🥽 Алдымен қорғаныс құралдарын киіңіз!'); Guide.say(PPE_FIRST); return; }
  if (state.items.length >= 3) { toast('Стакан толы — тазалаңыз 🧽'); return; }
  if (state.items.includes(id)) return;
  const r = R[id]; state.items.push(id);
  if (['bottle', 'drop'].includes(r.kind)) { state.level += r.kind === 'drop' ? 15 : 70; setLevel(state.level);
    if (!state.liquid) liq.style.fill = r.c; else if (r.kind !== 'drop') liq.style.fill = mix(liq.style.fill, r.c); }
  if (r.id === 'citric' || r.id === 'soda') { /* ұнтақ */ }
  drawSolids(); renderIn(); state.liquid = state.liquid || (['bottle', 'drop'].includes(r.kind) ? r.id : null);
  check(id);
}
function mix(a, b) { return b; }
function renderIn() { $('#inBeaker').innerHTML = state.items.map(id => `<span>${R[id].n} · <b>${R[id].f}</b></span>`).join(''); }
function check(newId) {
  for (const other of state.items) { if (other === newId) continue; const k = key(newId, other);
    // лимон + сода: суы бар болса ғана
    if (k === 'citric+soda' && !state.items.some(i => ['water', 'vinegar', 'cabbage'].includes(i)) && state.items.length === 2) { show(DRY, false); continue; }
    if (RX[k]) return react(k, RX[k]);
    if (k === 'soda+water' && state.items.includes('citric')) return react('citric+soda', RX['citric+soda']);
    if (k === 'citric+water' && state.items.includes('soda')) return react('citric+soda', RX['citric+soda']);
    if (NOPE[k]) return show({ n: 'Реакция жүрмеді', obs: NOPE[k], eq: '—', why: '' }, false);
  }
  if (state.items.length > 1) show(NOCH, false);
  else show({ n: R[newId].n + ' салынды', obs: 'Екінші затты қосыңыз.', eq: R[newId].f, why: '' }, false);
}
function react(k, rx) {
  state.last = k; liq.style.fill = rx.col;
  const fx = rx.fx;
  if (fx.startsWith('bubbles')) bubbles(fx === 'bubbles-fast' ? 70 : fx === 'bubbles-slow' ? 18 : 40, fx === 'bubbles-fast' ? 2 : fx === 'bubbles-slow' ? .6 : 1);
  if (fx === 'bubbles-fast') doSteam();
  if (fx === 'fizz') bubbles(80, 2.2);
  if (fx === 'foam') doFoam(k === 'h2o2+potato' ? '#fff' : '#fffbe8');
  if (k === 'soda+vinegar') megaFoam('#fff4d6', 2600);
  if (fx === 'mega-foam') { megaFoam(state.items.includes('soap') ? '#fff6c8' : '#fffbe8', state.items.includes('soap') ? 5200 : 3000); doSteam(); }
  if (fx === 'flash') { flameAt('#ffffff', 2600, 1.3); setTimeout(flash, 200); grayPuff(); const m = $('#sMg'); if (m) setTimeout(() => m.style.opacity = '0', 300); sfx('whoosh'); }
  if (fx === 'pop') { flameAt('#ffb347', 500, .9); flash(); popText('ПОП!'); shake(); sfx('pop'); }
  if (fx === 'color-flame') { flameAt(rx.fc, 3200, 1); sfx('whoosh'); }
  if (fx === 'selfire') { grayPuff(); setTimeout(() => { flameAt('#c24bff', 3500, 1.2); flash(); sfx('whoosh'); }, 1800); }
  if (fx === 'snake') { snake(); doSteam(); setTimeout(doSteam, 1500); }
  if (fx === 'heat') doSteam();
  if (fx.includes('precip')) { prec.setAttribute('fill', rx.pc); prec.setAttribute('height', 26); prec.setAttribute('y', 282); if (fx === 'bubbles-precip') bubbles(40, 1.2); }
  if (fx === 'coat') { const nb = $('#nailBody'); if (nb) setTimeout(() => nb.style.fill = '#b5562b', 100); }
  if (fx === 'rust') { const nb = $('#nailBody'); if (nb) setTimeout(() => nb.style.fill = '#a0522d', 100); liq.style.fill = '#d9a066'; }
  if (fx === 'potato-blue') { const p = $('#sPotato'); if (p) setTimeout(() => p.style.fill = '#2a1f5e', 100); }
  if (k === 'chalk+hcl' || k === 'chalk+vinegar') { const c = $('#sChalk'); if (c) setTimeout(() => { c.style.transform = 'scale(.35)'; c.style.opacity = k === 'chalk+hcl' ? '.3' : '.8'; }, 200); }
  if (k === 'hcl+mg') { const m = $('#sMg'); if (m) setTimeout(() => m.style.opacity = '0', 300); }
  show(rx, true);
  if (addTo('reactions', k)) { addXP(20, `Жаңа реакция: ${rx.n}`); renderJournal(); }
}
/* --- эффектілер --- */
function flash() { const d = document.createElement('div'); d.className = 'fx-flash'; document.body.appendChild(d); setTimeout(() => d.remove(), 750); }
function popText(t) { const d = document.createElement('div'); d.className = 'fx-pop'; d.textContent = t; bench.appendChild(d); setTimeout(() => d.remove(), 1000); }
function shake() { bench.classList.remove('shake'); void bench.offsetWidth; bench.classList.add('shake'); }
function flameAt(col, dur = 2500, s = 1) { const top = Math.min(40, 306 - Math.max(30, state.level)); const g = svgEl('g', { transform: `translate(150 ${top}) scale(${s})` }, steam);
  [[col, 1, 0], ['#ffd27a', .7, -8], ['#fff', .4, 6]].forEach(([c, k, dx], i) => { const p = svgEl('path', { d: `M${dx},0 C${dx - 26 * k},-24 ${dx - 14 * k},-62 ${dx},-${100 * k} C${dx + 14 * k},-62 ${dx + 26 * k},-24 ${dx},0Z`, fill: c, opacity: i ? .85 : .9, class: 'flm', style: `filter:drop-shadow(0 0 ${14 * k}px ${col});animation-delay:${i * .06}s` }, g); });
  g.animate([{ opacity: 0, transform: `translate(150px,${top}px) scale(.2)` }, { opacity: 1, transform: `translate(150px,${top}px) scale(${s})`, offset: .12 }, { opacity: 1, offset: .85 }, { opacity: 0, transform: `translate(150px,${top}px) scale(${s * .6})` }], { duration: dur }).onfinish = () => g.remove(); }
function grayPuff() { for (let i = 0; i < 18; i++) { const c = svgEl('circle', { cx: 120 + Math.random() * 60, cy: 40, r: 10 + Math.random() * 12, fill: '#e8e8e8', opacity: .5 }, steam);
  c.animate([{ transform: 'translate(0,0) scale(.5)', opacity: .7 }, { transform: `translate(${(Math.random() - .5) * 80}px,-90px) scale(2)`, opacity: 0 }], { duration: 2600, delay: i * 90 }).onfinish = () => c.remove(); } }
function megaFoam(col, dur) { const t0 = performance.now(); const iv = setInterval(() => { if (performance.now() - t0 > dur) return clearInterval(iv);
  for (let i = 0; i < 5; i++) { const side = Math.random() < .5 ? -1 : 1, c = svgEl('circle', { cx: 150 + (Math.random() - .5) * 60, cy: 300, r: 8 + Math.random() * 14, fill: col, opacity: .95 }, foam);
    const up = -300 - Math.random() * 60, out = side * (60 + Math.random() * 90);
    c.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${out * .2}px,${up}px)`, offset: .45 }, { transform: `translate(${out}px,${up + 40}px)`, offset: .6 }, { transform: `translate(${out * 1.2}px,30px)`, opacity: .9 }], { duration: 2400, easing: 'ease-out', fill: 'forwards' }).onfinish = () => setTimeout(() => c.remove(), 3000); } }, 60); }
function snake() { const top = 306 - Math.max(30, state.level); const g = svgEl('g', {}, foam); const p = svgEl('path', { d: 'M-34,0 C-40,-60 -20,-120 -30,-180 C-36,-240 -10,-280 0,-300 C10,-280 36,-240 30,-180 C20,-120 40,-60 34,0Z', fill: '#1d140e', stroke: '#3a2a1e', 'stroke-width': 3 }, g);
  for (let i = 0; i < 26; i++) svgEl('circle', { cx: (Math.random() - .5) * 50, cy: -Math.random() * 290, r: 2 + Math.random() * 4, fill: '#3a2a1e' }, g);
  g.animate([{ transform: `translate(150px,${top}px) scale(1,.02)` }, { transform: `translate(150px,${top}px) scale(1,1)` }], { duration: 5000, easing: 'ease-out', fill: 'forwards' }); }
let AC; function sfx(kind) { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const n = AC.sampleRate * (kind === 'pop' ? .35 : 1.2), b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, kind === 'pop' ? 6 : 2); const src = AC.createBufferSource(); src.buffer = b; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = kind === 'pop' ? 1800 : 700; const gn = AC.createGain(); gn.gain.value = kind === 'pop' ? .9 : .35; src.connect(f).connect(gn).connect(AC.destination); src.start(); } catch (e) {} }
function fire() {
  if (!state.items.length) return toast('Стакан бос');
  const has = id => state.items.includes(id);
  if (state.last === 'hcl+zn' || state.last === 'hcl+mg' || state.last === 'hcl+nail') return react('fire+h2', RX['fire+h2']);
  if (has('mg')) return react('fire+mg', RX['fire+mg']);
  if (has('cuso4')) return react('cuso4+fire', RX['cuso4+fire']);
  if (has('nacl')) return react('fire+nacl', RX['fire+nacl']);
  show(NOFIRE, false);
}
const labSay = rx => `${rx.n}. ${rx.obs} ${rx.why || ''} ${rx.link || ''}`;
function show(rx, ok) {
  Guide.say(labSay(rx), { display: `${ok ? '✅' : 'ℹ️'} <b>${rx.n}</b> — ${rx.obs}` });
  out.innerHTML = `<div style="animation:fadein .4s"><h3 style="color:${ok ? 'var(--green)' : 'var(--gold)'}">${ok ? '✅' : 'ℹ️'} ${rx.n}</h3>
   ${rx.eq && rx.eq !== '—' ? `<div class="eqbig">${rx.eq}</div>` : ''}
   <p style="font-size:14px"><b>👀 Бақылау:</b> ${rx.obs}</p>${rx.why ? `<p style="font-size:14px"><b>🧠 Түсіндірме:</b> ${rx.why}</p>` : ''}
   ${rx.link ? `<div class="quiz" style="border-style:solid;font-size:14px">${rx.link}</div>` : ''}</div>`;
}
function renderJournal() { $('#labCount').textContent = S.reactions.filter(k => RX[k]).length; $('#labTotal').textContent = Object.keys(RX).length; $('#labJournal').innerHTML = S.reactions.map(k => `<span>${RX[k] ? RX[k].n : k}</span>`).join(''); }
function clearBk() { state.items = []; state.liquid = null; state.level = 0; state.last = null; setLevel(0); liq.style.fill = '#bfe6ff'; prec.setAttribute('height', 0); prec.setAttribute('y', 306); solids.innerHTML = ''; bub.innerHTML = ''; foam.innerHTML = ''; renderIn(); out.innerHTML = '<p style="color:var(--muted)">Стакан таза. Жаңа тәжірибе бастаңыз!</p>'; }
$('#labClear').onclick = clearBk;
$('#labMix').onclick = () => { if (!state.items.length) return; bk.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0)' }], { duration: 600, iterations: 2 }); if (state.last) react(state.last, RX[state.last]); };
$('#labHeat').insertAdjacentHTML('afterend', '<button class="btn sm" id="labFire">🔥 Сіріңке әкелу</button>');
$('#labFire').onclick = () => { $('#labFire').classList.remove('pulse'); fire(); };
$('#labHeat').onclick = () => {
  if (!state.items.length) return toast('Стакан бос');
  doSteam();
  if (state.last === 'cuso4+naoh') { prec.setAttribute('fill', '#1a1a1a'); show(HEATB, true); addXP(10, 'Бонус реакция!'); return; }
  if (state.items.includes('nail') && state.items.includes('water')) return react('nail+water', RX['nail+water']);
  show(HEAT, false);
};
renderJournal();

/* --- эффектті тәжірибелер: кеңестер --- */
const TIPS = [
  { i: '🌋', n: 'Вулкан атқылауы', need: ['soda', 'vinegar'], k: 'soda+vinegar', steps: ['Стаканға ас содасын салыңыз', 'Үстіне сірке суын құйыңыз', 'Көбіктің атқылауын бақылаңыз'], safe: 'Сірке суы көзге тимесін — көзілдірік киіңіз.' },
  { i: '🐘', n: '«Піл тіс пастасы»', need: ['soap', 'h2o2', 'ki'], k: 'h2o2+ki', steps: ['Алдымен сұйық сабын құйыңыз', 'Сутек пероксидін қосыңыз', 'Соңында калий йодидін — катализаторды қосыңыз'], safe: 'Көбік жылы, пероксид теріні ағартады — қолғап киіңіз.' },
  { i: '💥', n: 'Сутектің «поп» жарылысы', need: ['zn', 'hcl'], fire: true, k: 'fire+h2', steps: ['Мырыш түйіршіктерін салыңыз', 'Тұз қышқылын құйыңыз — сутек бөлінеді', '«Сіріңке әкелу» батырмасын басыңыз'], safe: 'Сутек аз мөлшерде ғана! Бетті пробиркаға жақындатпаңыз.' },
  { i: '✨', n: 'Магний жанады', need: ['mg'], fire: true, k: 'fire+mg', steps: ['Магний таспасын салыңыз', '«Сіріңке әкелу» батырмасын басыңыз', 'Ақ жарқылды бақылаңыз'], safe: 'Жарқылға тікелей қарамаңыз — көзге зиян!' },
  { i: '🟢', n: 'Жасыл жалын', need: ['cuso4'], fire: true, k: 'cuso4+fire', steps: ['Мыс купоросын құйыңыз', 'Сіріңкені әкеліңіз', 'Жалын түсін бақылаңыз'], safe: 'Мыс тұздары улы — қолды жуыңыз.' },
  { i: '🟡', n: 'Сары жалын', need: ['nacl'], fire: true, k: 'fire+nacl', steps: ['Ас тұзы ерітіндісін құйыңыз', 'Сіріңкені әкеліңіз', 'Сары жалынды бақылаңыз'], safe: 'Жалыннан ұзын шашты, шарфты алыс ұстаңыз.' },
  { i: '🔥', n: 'Өздігінен жану', need: ['kmno4', 'glycerin'], k: 'glycerin+kmno4', steps: ['Марганцовка салыңыз', 'Бірнеше тамшы глицерин тамызыңыз', 'Күтіңіз… 2–3 секундтан кейін жалын!'], safe: 'Тек мұғалім тартпа шкафта көрсетеді!' },
  { i: '🐍', n: '«Қант жыланы»', need: ['sugar', 'h2so4'], k: 'h2so4+sugar', steps: ['Стаканға қант салыңыз', 'Концентрлі күкірт қышқылын құйыңыз', 'Қара көмір бағанасының өсуін бақылаңыз'], safe: 'Конц. қышқыл қатты күйдіреді — тек мұғалім, тартпа шкафта.' },
  { i: '🥔', n: 'Тірі көбік (фермент)', need: ['potato', 'h2o2'], k: 'h2o2+potato', steps: ['Картоп тілімін салыңыз', 'Сутек пероксидін құйыңыз', 'Ақ көбік — оттек бөлінуде'], safe: 'Пероксид көзге тимесін.' },
];
const tipSay = t => `${t.n}. ${t.steps.join('. ')}. ${t.safe}`;
const PREP_FIRE = 'Енді Сіріңке әкелу батырмасын басыңыз!';
function renderTips() { $('#labTips').innerHTML = TIPS.map((t, i) => `<div class="tip ${S.reactions.includes(t.k) ? 'done' : ''}"><div class="tip-h"><i>${t.i}</i><b>${t.n}</b>${S.reactions.includes(t.k) ? '✅' : ''}<button class="say" data-sayt="${encodeURIComponent(tipSay(t))}">🔊</button></div>
  <div class="need">${t.need.map(id => `<span>${R[id].n}</span>`).join('')}${t.fire ? '<span>🔥 Сіріңке</span>' : ''}</div><ol>${t.steps.map(x => `<li>${x}</li>`).join('')}</ol><div class="safe">⚠️ ${t.safe}</div>
  <div class="row"><button class="btn sm primary" data-tip="${i}">▶ Дайындау</button></div></div>`).join('');
  $$('[data-tip]').forEach(b => b.onclick = () => prep(TIPS[+b.dataset.tip])); }
function prep(t) { if (!S.ppe) { toast('🥽 Алдымен қорғаныс құралдарын киіңіз!'); Guide.say(PPE_FIRST); $('#bench').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
  clearBk(); $('#bench').scrollIntoView({ behavior: 'smooth', block: 'center' });
  t.need.forEach((id, i) => setTimeout(() => addItem(id), 700 + i * 900));
  if (t.fire) setTimeout(() => { $('#labFire').classList.add('pulse'); if (!t.need.includes('hcl')) Guide.say(PREP_FIRE); else setTimeout(() => Guide.say(PREP_FIRE), 3500); }, 900 + t.need.length * 900); }
renderTips(); const _rj = renderJournal; renderJournal = function () { _rj(); renderTips(); };

/* --- PPE --- */
const PPE = [['🥼', 'Халат', 1], ['🥽', 'Қорғаныс көзілдірігі', 1], ['🧤', 'Резеңке қолғап', 1], ['🩴', 'Ашық сандал', 0], ['🍔', 'Тамақ', 0], ['🎧', 'Құлаққап', 0], ['💄', 'Косметика', 0], ['🕶️', 'Күннен қорғайтын көзілдірік', 0], ['🧣', 'Ұзын шарф', 0]];
const got = new Set();
const PPE_NO = { 'Ашық сандал': '❌ Аяқ киім жабық болуы керек — қышқыл тамса, күйдіреді!', 'Тамақ': '❌ Зертханада тамақ ішуге қатаң тыйым салынады!', 'Құлаққап': '❌ Мұғалімнің нұсқауын естуіңіз керек!', 'Косметика': '❌ Косметика заттармен әрекеттесуі мүмкін.', 'Күннен қорғайтын көзілдірік': '❌ Бұл көзді шашыраудан қорғамайды — арнайы қорғаныс көзілдірігі керек!', 'Ұзын шарф': '❌ Ұзын шарф отқа немесе құралға ілінуі мүмкін!' };
const PPE_DONE = '🎉 Керемет! Зертхана ашылды. Енді заттарды стаканға салыңыз.';
function unlock() { $('#ppeLock').style.display = 'none'; }
if (S.ppe) unlock();
$('#ppeItems').innerHTML = PPE.map(([e, n, ok], i) => `<button data-pi="${i}"><span class="e">${e}</span>${n}</button>`).join('');
$$('#ppeItems button').forEach(b => b.onclick = () => { const [e, n, ok] = PPE[+b.dataset.pi]; const fb = $('#ppeFb');
  if (ok) { b.classList.add('ok'); got.add(n); if (n === 'Халат') $('#ppeCoat').setAttribute('fill', '#ffffff'); if (n.startsWith('Қорғаныс')) $('#ppeGog').setAttribute('opacity', 1); if (n.includes('қолғап')) { $('#ppeGl1').setAttribute('opacity', 1); $('#ppeGl2').setAttribute('opacity', 1); }
    fb.className = 'fb ok'; fb.textContent = `✅ ${n} — дұрыс! (${got.size}/3)`; Guide.say(`${n} — дұрыс!`);
    if (got.size === 3) { S.ppe = true; save(); addXP(30, 'Қауіпсіздік ережесі сақталды!'); fb.textContent = PPE_DONE; Guide.say(PPE_DONE); setTimeout(unlock, 900); } }
  else { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); fb.className = 'fb no';
    fb.textContent = PPE_NO[n]; Guide.say(PPE_NO[n]); } });
/* --- дауыс мәтіндері --- */
window.LAB_NARR = [PPE_FIRST, PPE_DONE, ...Object.values(PPE_NO), ...PPE.filter(p => p[2]).map(p => `${p[1]} — дұрыс!`), ...Object.values(RX).map(labSay), ...Object.values(NOPE).map(o => labSay({ n: 'Реакция жүрмеді', obs: o })), ...EXTRA_SHOWS.map(labSay), ...REAG.map(r => labSay({ n: r.n + ' салынды', obs: 'Екінші затты қосыңыз.' })), ...TIPS.map(tipSay), PREP_FIRE];
})();
