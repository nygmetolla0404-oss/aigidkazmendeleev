/* =========================================================
   3D ӘЛЕМ: Қазақстан аралы, режимдер (Шолу / Дрон / Электромобиль / Авто-тур)
   ========================================================= */
const World = (() => {
  const W2 = (lon, lat) => { const [x, y] = P(lon, lat); return [(x - 575) * 0.1, (y - 320) * 0.1]; };
  const KM_PER_UNIT = 27.8;
  const SHORT = { U: 'Шу-Сарысу · уран', Cr: 'Хромтау · хром', Fe: 'Рудный · темір', Cu: 'Жезқазған · мыс', Zn: 'Риддер · мырыш', Pb: 'Кентау · қорғасын', Au: 'Васильков · алтын', Ag: 'Алтай · күміс', Mn: 'Жәйрем · марганец', Al: 'Павлодар · алюминий', C: 'Екібастұз · көмір', S: 'Теңіз · күкірт', H: 'Қарашығанақ · газ', P: 'Жаңатас · фосфор', Ti: 'Өскемен · титан', Mg: 'Өскемен · магний', Be: 'Үлбі · бериллий', Ta: 'Үлбі · тантал', W: 'Қайрақты · вольфрам', B: 'Индер · бор', Ni: 'Кемпірсай · никель', Co: 'Кемпірсай · кобальт', Re: 'Жезқазған · рений', Si: 'Ақсу · кремний', Na: 'Арал · ас тұзы', K: 'Сатымола · калий', Nd: 'Қарағанды · неодим' };
  const ICON = { mount: '<path d="M3 19 9.5 8l3.5 6 2-3 6 8z"/>', cam: '<rect x="3" y="7" width="18" height="12" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 7l1.5-2.5h5L16 7"/>', leaf: '<path d="M5 19C5 10 11 5 20 4c-1 9-6 15-15 15z"/><path d="M5 19 13 11"/>', rocket: '<path d="M12 3c3 2 4 6 4 10l-4 3-4-3c0-4 1-8 4-10z"/><circle cx="12" cy="10" r="1.6"/><path d="M8 13l-3 4h4M16 13l3 4h-4"/>', drop: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>', city: '<path d="M4 20V9l5-3v14M9 20V4l6 3v13M15 20v-9l5 2v7M3 20h18"/>', warn: '<path d="M12 4 21 20H3z"/><path d="M12 10v5M12 17.5v.5"/>', dome: '<path d="M5 20v-7a7 7 0 0 1 14 0v7z"/><path d="M12 6V3M3 20h18"/>', wind: '<path d="M12 12v9M12 12 7 4M12 12l8 2M12 12l-7 5"/>' };
  const PL_ICON = { astana: 'city', burabay: 'leaf', korgalzhyn: 'leaf', alakol: 'drop', charyn: 'mount', ileAlatau: 'mount', turkistan: 'dome', caspian: 'drop', bozzhyra: 'cam', altai: 'mount', balkhash: 'drop', aral: 'warn', baikonur: 'rocket', altynEmel: 'cam' };
  const svgI = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`;
  let R, scene, cam, ctl, clock, water, waterBase, poly, labels = [], markers = [], rotors = [], turbines = [], clouds = [], parts, partData = [], zoneRings = [];
  let mode = 'overview', drone, car, keys = {}, ready = false, labelsOn = true, raf;
  const st = { drone: { x: 0, y: 6, z: 0, yaw: 0, v: 0, vy: 0 }, car: { x: 0, z: 0, yaw: 0, v: 0, km: 0, bat: 100, charging: false }, near: null, droneSeen: new Set(), item: null, tourI: -1, tourAuto: false, flyT: null };

  /* ---------- пішін ---------- */
  function ringsOf(d) { return d.split('M').filter(Boolean).map(r => r.replace(/Z/g, '').split('L').map(p => p.split(',').map(Number)).filter(p => p.length === 2 && !isNaN(p[0]))); }
  function inPoly(x, z) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; }
  function rnd(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function groundTexture() {
    const cv = document.createElement('canvas'); cv.width = 2048; cv.height = 1024; const c = cv.getContext('2d');
    c.fillStyle = '#d9c99a'; c.fillRect(0, 0, 2048, 1024); c.scale(2048 / 1150, 1024 / 640);
    const kz = new Path2D(GEO.kz); c.save(); c.clip(kz);
    const g = c.createLinearGradient(0, 30, 0, 620); g.addColorStop(0, '#5fb04a'); g.addColorStop(.3, '#93c25a'); g.addColorStop(.5, '#c6c879'); g.addColorStop(.68, '#dcc98c'); g.addColorStop(1, '#e2cf98');
    c.fillStyle = g; c.fillRect(0, 0, 1150, 640);
    const blob = (lon, lat, rx, ry, col, a) => { const [x, y] = P(lon, lat); const gr = c.createRadialGradient(x, y, 0, x, y, rx); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = a; c.fillStyle = gr; c.save(); c.translate(x, y); c.scale(1, ry / rx); c.translate(-x, -y); c.beginPath(); c.arc(x, y, rx, 0, 7); c.fill(); c.restore(); c.globalAlpha = 1; };
    blob(70.3, 53.1, 70, 40, '#4f9e45', .8); blob(64, 54, 90, 30, '#5aa94a', .6); blob(84.5, 49.6, 90, 70, '#4f9a48', .8); blob(80, 51, 70, 40, '#68ad52', .6);
    blob(77, 43.6, 120, 30, '#8cc265', .7); blob(69.6, 42.7, 60, 25, '#9cc76c', .6);
    blob(64.5, 44, 130, 50, '#f1e2b4', .9); blob(72.5, 44.8, 110, 34, '#f0dfae', .8); blob(55.5, 44.5, 90, 60, '#eedcb0', .8); blob(50.5, 46.8, 70, 50, '#efe0b5', .7); blob(68, 46, 70, 40, '#ead8a2', .5);
    blob(74, 49, 120, 50, '#bcc97c', .45); blob(53.4, 43.5, 30, 20, '#f7f1e2', .9);
    const r = rnd(3); for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(${r() > .5 ? '60,110,40' : '160,140,90'},${.05 + r() * .08})`; c.fillRect(r() * 1150, r() * 640, 1 + r() * 3, 1 + r() * 3); }
    // жолдар
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.4; c.setLineDash([5, 4]);
    const city = Object.fromEntries(CITIES.map(([n, lo, la]) => [n, P(lo, la)]));
    [['Астана', 'Көкшетау'], ['Көкшетау', 'Петропавл'], ['Астана', 'Қарағанды'], ['Қарағанды', 'Жезқазған'], ['Қарағанды', 'Алматы'], ['Астана', 'Павлодар'], ['Павлодар', 'Семей'], ['Семей', 'Өскемен'], ['Алматы', 'Талдықорған'], ['Талдықорған', 'Өскемен'], ['Алматы', 'Тараз'], ['Тараз', 'Шымкент'], ['Шымкент', 'Түркістан'], ['Түркістан', 'Қызылорда'], ['Қызылорда', 'Ақтөбе'], ['Ақтөбе', 'Орал'], ['Орал', 'Атырау'], ['Атырау', 'Ақтау'], ['Ақтөбе', 'Қостанай'], ['Қостанай', 'Астана'], ['Жезқазған', 'Қызылорда']].forEach(([a, b]) => { c.beginPath(); c.moveTo(...city[a]); c.lineTo(...city[b]); c.stroke(); });
    c.setLineDash([]); c.restore();
    c.fillStyle = '#3b97ec'; c.strokeStyle = '#bfeaff'; c.lineWidth = 1.2; const lk = new Path2D(GEO.lakes); c.fill(lk); c.stroke(lk);
    c.save(); c.clip(kz); c.strokeStyle = '#4aa8f2'; c.lineWidth = 2.2; c.lineCap = 'round'; c.stroke(new Path2D(GEO.rivers)); c.restore();
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.stroke(kz);
    const t = new THREE.CanvasTexture(cv); t.anisotropy = 4; return t;
  }
  function cliffTexture() { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 128; const c = cv.getContext('2d');
    ['#c99a5b', '#b98a4e', '#d8ab6a', '#a87843', '#c4935a', '#9b6c3c'].forEach((col, i) => { c.fillStyle = col; c.fillRect(0, i * 22, 64, 22); });
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }

  function buildIsland() {
    const rs = ringsOf(GEO.kz).sort((a, b) => b.length - a.length);
    poly = rs[0].map(([x, y]) => [(x - 575) * .1, (y - 320) * .1]);
    const shape = new THREE.Shape(poly.map(([x, z]) => new THREE.Vector2(x, -z)));
    const D = 3.2;
    const uv = {
      generateTopUV(g, v, a, b, c) { return [a, b, c].map(i => new THREE.Vector2(.5 + v[i * 3] / 115, .5 + v[i * 3 + 1] / 64)); },
      generateSideWallUV(g, v, a, b, c, d) { const f = i => new THREE.Vector2((v[i * 3] + v[i * 3 + 1]) * .12, v[i * 3 + 2] / D); return [f(a), f(b), f(c), f(d)]; }
    };
    const geo = new THREE.ExtrudeGeometry(shape, { depth: D, bevelEnabled: false, UVGenerator: uv, steps: 1 });
    const mats = [new THREE.MeshStandardMaterial({ map: groundTexture(), roughness: .95 }), new THREE.MeshStandardMaterial({ map: cliffTexture(), roughness: 1, flatShading: true })];
    const m = new THREE.Mesh(geo, mats); m.rotation.x = -Math.PI / 2; m.position.y = -D; m.receiveShadow = true; scene.add(m);
  }
  function buildWater() {
    const g = new THREE.PlaneGeometry(700, 700, 110, 110); g.rotateX(-Math.PI / 2);
    water = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x1d6fe8, roughness: .3, metalness: .15, flatShading: true }));
    water.position.y = -1.5; scene.add(water); waterBase = Float32Array.from(g.attributes.position.array);
  }
  /* ---------- ағаштар, таулар ---------- */
  function instanced(geo, mat, list) { const im = new THREE.InstancedMesh(geo, mat, list.length); const o = new THREE.Object3D(), col = new THREE.Color();
    list.forEach((t, i) => { o.position.set(t.x, t.y || 0, t.z); o.rotation.set(0, t.r || 0, 0); o.scale.setScalar(t.s || 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); if (t.c) im.setColorAt(i, col.set(t.c)); });
    im.castShadow = true; im.receiveShadow = true; scene.add(im); return im; }
  function buildFlora() {
    const r = rnd(11), pines = [], rounds = [], shrubs = [];
    const clear = [...CITIES.map(c => W2(c[1], c[2])), ...DEPOSITS.map(d => W2(d.lon, d.lat)), ...ELEMENTS.map(e => { const [x, z] = W2(e.lon, e.lat); return [x + (e.dx || 0) * .1, z + (e.dy || 0) * .1]; }), ...PLACES.map(p => W2(p.lon, p.lat)), W2(73.3, 51.75)];
    const isClear = (x, z) => clear.some(([cx, cz]) => (x - cx) ** 2 + (z - cz) ** 2 < 4.4);
    const near = (lon, lat, x, z, rad) => { const [cx, cz] = W2(lon, lat); return Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (rad * rad)); };
    for (let i = 0; i < 26000 && pines.length + rounds.length + shrubs.length < 3600; i++) {
      const x = -58 + r() * 116, z = -32 + r() * 64; if (!inPoly(x, z) || isClear(x, z)) continue;
      const lat = 56 - (z * 10 + 320) / 40;
      const forest = near(70.3, 53.1, x, z, 3.6) * .95 + near(84.6, 49.6, x, z, 7) * .9 + near(81.5, 51, x, z, 5) * .5 + near(64.5, 53.8, x, z, 6) * .35 + (lat > 53.3 ? .25 : 0);
      const garden = near(77, 43.4, x, z, 6) * .75 + near(69.8, 42.5, x, z, 4) * .5 + near(80, 45, x, z, 3.5) * .4;
      const desert = (lat < 46 ? .35 : 0) + near(64.5, 44, x, z, 9) * .3;
      const p = r(); const s = .7 + r() * .7, rot = r() * 6;
      if (p < forest) (r() < .7 ? pines : rounds).push({ x, z, s, r: rot, c: r() < .7 ? (r() < .5 ? '#2f7d3c' : '#3c8f45') : '#5fae4e' });
      else if (p < forest + garden) rounds.push({ x, z, s, r: rot, c: r() < .5 ? '#59a845' : '#7cbf55' });
      else if (p < forest + garden + desert * .55) shrubs.push({ x, z, s: s * .8, r: rot, c: r() < .5 ? '#8aa66a' : '#a3b37a' });
      else if (r() < .03) rounds.push({ x, z, s: s * .8, r: rot, c: '#7fb85a' });
    }
    const crown = new THREE.ConeGeometry(.42, 1.35, 6); crown.translate(0, 1.05, 0);
    const trunk = new THREE.CylinderGeometry(.07, .1, .45, 5); trunk.translate(0, .22, 0);
    const ball = new THREE.IcosahedronGeometry(.48, 0); ball.translate(0, .82, 0);
    const bush = new THREE.IcosahedronGeometry(.3, 0); bush.translate(0, .2, 0);
    const leafMat = new THREE.MeshStandardMaterial({ flatShading: true, roughness: .9 }), wood = new THREE.MeshStandardMaterial({ color: 0x7a5434, flatShading: true });
    instanced(crown, leafMat, pines); instanced(trunk, wood, pines.concat(rounds)); instanced(ball, leafMat.clone(), rounds); instanced(bush, leafMat.clone(), shrubs);
  }
  function buildMountains() {
    const r = rnd(5), ms = [];
    const range = (lon, lat, n, dlo, dla, h0, h1, snow, col = '#8a6a4b') => { for (let i = 0; i < n; i++) { const [x, z] = W2(lon + (r() - .5) * dlo, lat + (r() - .5) * dla); ms.push({ x, z, h: (h0 + r() * (h1 - h0)) * .62, snow, col }); } };
    range(85.2, 49.3, 26, 3.2, 1.2, 2.6, 6, true); range(82.6, 47.2, 9, 3, .5, 1.8, 3, true); range(79.8, 45.1, 14, 3, 1, 2.2, 4.6, true);
    range(76.9, 43.1, 18, 5, .45, 2.8, 5.2, true); range(70.4, 42.4, 7, 2, .4, 2, 3.2, true); range(69.2, 43.7, 9, 2.5, 1, 1, 1.8, false);
    range(67.2, 48.5, 6, 1.5, .8, .9, 1.5, false, '#9a7b55'); range(75, 49.2, 22, 7, 2, .5, 1.1, false, '#93a066'); range(58.6, 48.6, 6, 1.4, 1.5, .7, 1.2, false, '#9a7b55');
    const [kx, kz] = W2(80.1, 42.55); ms.push({ x: kx, z: kz, h: 5, snow: true });
    const rock = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 1, vertexColors: false });
    ms.forEach(m => { const rad = m.h * (.6 + r() * .3); const g = new THREE.ConeGeometry(rad, m.h, 6 + (r() * 2 | 0), 1); g.translate(0, m.h / 2, 0);
      const mesh = new THREE.Mesh(g, rock.clone()); mesh.material.color.set(m.col || '#8a6a4b'); mesh.position.set(m.x, 0, m.z); mesh.rotation.y = r() * 6; mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh);
      if (m.snow) { const hs = m.h * .4; const s = new THREE.Mesh(new THREE.ConeGeometry(rad * .4 * 1.03, hs, mesh.geometry.parameters.radialSegments, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true })); s.position.set(m.x, m.h - hs / 2 + .01, m.z); s.rotation.y = mesh.rotation.y; scene.add(s); } });
    // Шарын қызыл жартастары, Бозжыра ақ шыңдары, Маңғыстау үстірттері
    const box = (lon, lat, w, h, d, col, n, spread) => { for (let i = 0; i < n; i++) { const [x, z] = W2(lon + (r() - .5) * spread, lat + (r() - .5) * spread * .5); const b = new THREE.Mesh(new THREE.BoxGeometry(w * (.6 + r() * .8), h * (.6 + r() * .8), d * (.6 + r() * .8)), new THREE.MeshStandardMaterial({ color: col, flatShading: true })); b.position.set(x, b.geometry.parameters.height / 2, z); b.rotation.y = r() * 3; b.castShadow = true; scene.add(b); } };
    box(79.1, 43.35, .8, 1.6, .8, 0xc0562f, 10, 1.4); box(54.07, 43.4, .5, 2.2, .5, 0xf3efe2, 8, 1.2); box(52.8, 44.3, 2.2, .8, 1.6, 0xe9d8b3, 7, 3);
  }
  /* ---------- нысандар ---------- */
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: .7 }, o));
  function at(lon, lat, obj) { const [x, z] = W2(lon, lat); obj.position.set(x, 0, z); obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(obj); return obj; }
  function mesh(g, m, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; }
  function buildLandmarks() {
    // Бәйтерек
    let g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(.12, .22, 3.4, 8), M(0xffffff), 0, 1.7, 0)); for (let i = 0; i < 6; i++) { const b = mesh(new THREE.CylinderGeometry(.03, .05, 1.2, 4), M(0xffffff), Math.cos(i) * .25, 3.2, Math.sin(i) * .25); b.rotation.z = Math.cos(i) * .4; b.rotation.x = Math.sin(i) * .4; g.add(b); }
    g.add(mesh(new THREE.SphereGeometry(.38, 16, 12), M(0xffc83a, { metalness: .1, roughness: .35, flatShading: false, emissive: 0x6a4a00 }), 0, 3.85, 0)); at(71.43, 51.17, g);
    // Байқоңыр зымыраны
    g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(2.4, .15, 2.4), M(0x8aa0c8), 0, .07, 0)); g.add(mesh(new THREE.CylinderGeometry(.22, .22, 3, 12), M(0xffffff), 0, 1.65, 0)); g.add(mesh(new THREE.ConeGeometry(.22, .7, 12), M(0xffffff), 0, 3.5, 0));
    for (let i = 0; i < 4; i++) g.add(mesh(new THREE.ConeGeometry(.12, 1.1, 6), M(0xe8eef7), Math.cos(i * 1.57) * .3, .75, Math.sin(i * 1.57) * .3));
    const tw = mesh(new THREE.BoxGeometry(.25, 3.8, .25), M(0xd2462f), .55, 1.9, 0); g.add(tw); at(63.31, 45.96, g);
    // Теңіз мұнай мұнарасы + тербелмелі сорап
    g = new THREE.Group(); const der = new THREE.Mesh(new THREE.CylinderGeometry(.08, .55, 2.8, 4, 1, true), M(0xd9dde6, { wireframe: true })); der.position.y = 1.4; g.add(der);
    const pj = new THREE.Group(); pj.add(mesh(new THREE.BoxGeometry(1.1, .12, .12), M(0x333a46), 0, .9, 0)); pj.add(mesh(new THREE.BoxGeometry(.12, .9, .12), M(0x555), 0, .45, 0)); pj.position.x = 1.3; g.add(pj); g.userData.pump = pj.children[0]; turbines.push({ pump: pj.children[0] });
    g.add(mesh(new THREE.CylinderGeometry(.45, .45, .7, 12), M(0xf2f2f2), -1.2, .35, .4)); at(53.38, 46.15, g);
    // Жезқазған карьері + экскаватор
    g = new THREE.Group(); for (let i = 0; i < 4; i++) g.add(mesh(new THREE.CylinderGeometry(1.6 - i * .35, 1.6 - i * .35, .05, 18), M([0x9c7b5c, 0x8b6a4e, 0x7a5c44, 0x6a5040][i]), 0, .03 + i * .01, 0));
    const ex = new THREE.Group(); ex.add(mesh(new THREE.BoxGeometry(.6, .35, .4), M(0xffc21a), 0, .3, 0)); const arm = mesh(new THREE.BoxGeometry(.9, .1, .1), M(0xffc21a), .55, .55, 0); arm.rotation.z = .5; ex.add(arm); ex.position.set(2, 0, .5); g.add(ex); at(67.71, 47.78, g);
    // Ерейментау жел станциясы
    for (let i = 0; i < 4; i++) { g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(.05, .09, 2.6, 6), M(0xffffff), 0, 1.3, 0)); g.add(mesh(new THREE.BoxGeometry(.18, .16, .4), M(0xffffff), 0, 2.6, -.05)); const hub = new THREE.Group(); hub.position.set(0, 2.6, .17);
      for (let k = 0; k < 3; k++) { const b = mesh(new THREE.BoxGeometry(.06, 1.2, .02), M(0xffffff), 0, .6, 0); const p = new THREE.Group(); p.rotation.z = k * 2.094; p.add(b); hub.add(p); } g.add(hub); turbines.push({ hub }); at(73.1 + i * .45, 51.65 + (i % 2) * .25, g); }
    // Түркістан кесенесі
    g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(1.6, .9, 1.1), M(0xd8c39a), 0, .45, 0)); g.add(mesh(new THREE.SphereGeometry(.42, 12, 8, 0, 6.3, 0, 1.6), M(0x2e8bd8), .3, .9, 0)); g.add(mesh(new THREE.SphereGeometry(.3, 12, 8, 0, 6.3, 0, 1.6), M(0x2e8bd8), -.45, .9, 0)); g.add(mesh(new THREE.BoxGeometry(.6, 1.4, 1.15), M(0xcdb68a), -.7, .7, 0)); at(68.27, 43.3, g);
    // Фламинго
    g = new THREE.Group(); const fr = rnd(9); for (let i = 0; i < 14; i++) { const f = new THREE.Group(); f.add(mesh(new THREE.SphereGeometry(.14, 6, 5), M(0xff7fb0), 0, .5, 0)); f.add(mesh(new THREE.CylinderGeometry(.015, .015, .4, 3), M(0xff7fb0), 0, .25, 0)); f.add(mesh(new THREE.CylinderGeometry(.02, .02, .3, 3), M(0xff7fb0), .1, .7, 0)); f.position.set((fr() - .5) * 2.5, 0, (fr() - .5) * 1.5); g.add(f); }
    g.add(mesh(new THREE.CylinderGeometry(1.8, 1.8, .03, 20), M(0x5ab3f0), 0, .02, 0)); at(69.2, 50.4, g);
    // Уран ұңғымалары
    g = new THREE.Group(); for (let i = 0; i < 9; i++) g.add(mesh(new THREE.CylinderGeometry(.08, .08, .5, 6), M(0xeef3f8), (i % 3 - 1) * .6, .25, ((i / 3 | 0) - 1) * .6)); at(68.4, 45.0, g);
    // Екібастұз ЖЭС мұржасы
    g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(.18, .3, 4, 10), M(0xe9e9e9), 0, 2, 0)); g.add(mesh(new THREE.CylinderGeometry(.19, .19, .3, 10), M(0xd23a2f), 0, 3.6, 0)); at(75.6, 51.85, g);
    // Зарядтау станциялары
    CHARGERS.forEach(([n, lo, la]) => { const c = new THREE.Group(); c.add(mesh(new THREE.BoxGeometry(.35, .7, .25), M(0x2fd38a, { emissive: 0x0b6b3e }), 0, .35, 0)); c.add(mesh(new THREE.CylinderGeometry(.6, .6, .02, 16), M(0x4ef0a0, { transparent: true, opacity: .45 }), 0, .02, 0)); at(lo + .25, la - .2, c); });
  }
  const CHARGERS = ['Астана', 'Алматы', 'Шымкент', 'Қарағанды', 'Ақтөбе', 'Атырау', 'Өскемен', 'Павлодар', 'Қостанай', 'Қызылорда', 'Тараз', 'Жезқазған', 'Түркістан', 'Ақтау', 'Орал', 'Семей', 'Көкшетау', 'Петропавл', 'Талдықорған'].map(n => CITIES.find(c => c[0] === n));
  function buildClouds() { const r = rnd(21), mat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, transparent: true, opacity: .92 });
    for (let i = 0; i < 16; i++) { const g = new THREE.Group(); for (let k = 0; k < 4; k++) { const s = mesh(new THREE.IcosahedronGeometry(1 + r() * 1.3, 0), mat, k * 1.5 - 2, r() * .6, (r() - .5) * 1.2); s.scale.y = .6; g.add(s); } g.position.set(-80 + r() * 160, 16 + r() * 8, -45 + r() * 80); g.userData.v = .3 + r() * .5; scene.add(g); clouds.push(g); } }

  /* ---------- белгілер ---------- */
  /* элемент плиткасының текстурасы (Менделеев кестесіндегідей) */
  function tileTex(e) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d'); const col = CAT[e.cat].c;
    const g = c.createLinearGradient(0, 0, 256, 256); g.addColorStop(0, '#ffffff'); g.addColorStop(.18, col); g.addColorStop(1, col);
    c.fillStyle = g; c.fillRect(0, 0, 256, 256);
    c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 12; c.strokeRect(6, 6, 244, 244);
    c.strokeStyle = 'rgba(10,26,74,.35)'; c.lineWidth = 3; c.strokeRect(16, 16, 224, 224);
    c.fillStyle = '#0a1a4a'; c.textBaseline = 'alphabetic';
    c.font = '800 34px Inter, Arial, sans-serif'; c.textAlign = 'left'; c.fillText(e.z, 26, 54);
    c.font = '600 22px Inter, Arial, sans-serif'; c.textAlign = 'right'; c.fillText(e.mass, 232, 50);
    c.textAlign = 'center'; c.font = `900 ${e.s.length > 1 ? 118 : 132}px Inter, Arial, sans-serif`; c.fillText(e.s, 128, 168);
    c.font = '700 26px Inter, Arial, sans-serif'; c.fillText(e.name.split(' (')[0], 128, 222);
    const t = new THREE.CanvasTexture(cv); t.anisotropy = 4; return t;
  }
  let glowTex; function glow() { if (glowTex) return glowTex; const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d');
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128);
    return glowTex = new THREE.CanvasTexture(cv); }
  const cubes = [], ELPOS = {}; let hoverL = null;
  const CUBE_Y = 4.6, CUBE_S = 3.2;
  function buildMarkers() {
    const lay = document.getElementById('labels'); lay.innerHTML = '';
    const add = (type, id, x, z, html, cls, beamH = 2.6) => { const b = mesh(new THREE.CylinderGeometry(.07, .07, beamH, 6, 1, true), new THREE.MeshBasicMaterial({ color: cls === 'el' ? 0xffffff : cls === 'lab' ? 0x7dffb0 : 0x8fe3ff, transparent: true, opacity: .55 }), x, beamH / 2, z); scene.add(b);
      const ring = mesh(new THREE.RingGeometry(.35, .5, 20), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .7, side: THREE.DoubleSide }), x, .04, z); ring.rotation.x = -Math.PI / 2; scene.add(ring);
      const el = document.createElement('button'); el.className = 'lbl ' + cls; el.innerHTML = html;
      lay.appendChild(el); const L = { el, pos: new THREE.Vector3(x, beamH + .6, z), type, id, name: el.textContent.trim(), w: 0, ring };
      el.onclick = ev => { ev.stopPropagation(); activate(L, ev); }; el.onmouseenter = () => hoverL = L; el.onmouseleave = () => { if (hoverL === L) hoverL = null; };
      L.beam = b; L.beamH = beamH; labels.push(L); markers.push(L); return L; };
    // кен орындары — басты элементтің жарқыраған кубы + басқа элементтердің шағын кубтары
    const placed = [];
    const elObj = sy => EL[sy] || (typeof ptBySym !== 'undefined' && ptBySym[sy] ? { s: sy, z: ptBySym[sy].z, mass: ptBySym[sy].m, name: ptBySym[sy].n, cat: ptBySym[sy].cat } : null);
    DEPOSITS.forEach((d, i) => { const [bx, bz] = W2(d.lon, d.lat); let x = bx, z = bz;
      for (let k = 1; k < 14 && placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 3.9); k++) { const a = k * 2.2 + i, r = 3.8 + k * .3; x = bx + Math.cos(a) * r; z = bz + Math.sin(a) * r; }
      placed.push([x, z]); const e = EL[d.main]; const col = new THREE.Color(CAT[e.cat].c);
      const L = add('dep', d.id, x, z, `<i class="sym" style="background:${CAT[e.cat].c}">${d.main}</i><span>${d.short}</span>`, 'el', CUBE_Y);
      L.pos.y = CUBE_Y + CUBE_S * .9 + .5;
      const tex = tileTex(e); const cube = mesh(new THREE.BoxGeometry(CUBE_S, CUBE_S, CUBE_S), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: .38, roughness: .35, metalness: .05 }), x, CUBE_Y, z);
      cube.castShadow = true; cube.rotation.y = i * .7; cube.userData.L = L; scene.add(cube);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: col, transparent: true, opacity: .75, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.setScalar(7.5); halo.position.set(x, CUBE_Y, z); scene.add(halo);
      // шағын кубтар орбитада
      L.minis = d.els.filter(sy => sy !== d.main).map(elObj).filter(Boolean).slice(0, 4).map((o, k) => { const t = tileTex(o); const m = mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .35, roughness: .4 }), x, CUBE_Y, z); m.userData.L = L; scene.add(m); cubes.push(m); m.userData.mini = k; return m; });
      L.cube = cube; L.halo = halo; L.ph = i * .9; L.boost = 0; L.ring.material.color.copy(col); cubes.push(cube);
      if (!ELPOS[d.main]) ELPOS[d.main] = [x, z]; d.els.forEach(sy => { if (EL_DEP[sy] === d.id) ELPOS[sy] = [x, z]; }); });
    ELEMENTS.forEach(e => { if (!ELPOS[e.s]) { const [x, z] = W2(e.lon, e.lat); ELPOS[e.s] = [x, z]; } });
    PLACES.forEach(p => { const [x, z] = W2(p.lon, p.lat); add('place', p.id, x, z, `<i class="ic">${svgI(PL_ICON[p.id] || 'cam')}</i><span>${p.name}</span>`, 'pl'); });
    // Зертхана ғимараты (Астана маңы)
    { const [lx, lz] = W2(70.55, 51.55); const g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(2.2, 1, 1.4), M(0xf4f7ff), 0, .5, 0)); g.add(mesh(new THREE.BoxGeometry(2.24, .35, 1.44), M(0x3a7bff, { metalness: .4, roughness: .2 }), 0, .6, 0));
      g.add(mesh(new THREE.SphereGeometry(.55, 16, 12), M(0x7dffb0, { flatShading: false, transparent: true, opacity: .85, emissive: 0x1aa860 }), 0, 1.55, 0)); g.add(mesh(new THREE.CylinderGeometry(.16, .16, .55, 12), M(0xdfefff, { transparent: true, opacity: .7 }), 0, 2.2, 0));
      g.position.set(lx, 0, lz); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(g);
      const L = add('lab', 'lab', lx, lz, `<i class="ic">🧪</i><span>Зертхана · тәжірибелер</span>`, 'lab', 3); g.traverse(o => { if (o.isMesh) { o.userData.L = L; cubes.push(o); } }); }
    // қалалар — күңгірт таблеткалар
    CITIES.forEach(([n, lo, la]) => { const [x, z] = W2(lo, la); const el = document.createElement('div'); el.className = 'lbl city'; el.innerHTML = `<span>${n}</span>`; lay.appendChild(el); labels.push({ el, pos: new THREE.Vector3(x, .6, z), deco: true, city: true, w: 0 }); });
    const [ex, ez] = W2(73.3, 51.75); const L = document.createElement('div'); L.className = 'lbl deco'; L.innerHTML = `<i class="ic">${svgI('wind')}</i><span>Ерейментау жел станциясы</span>`; lay.appendChild(L); labels.push({ el: L, pos: new THREE.Vector3(ex, 3.6, ez), deco: true, w: 0 });
    // Дрон шашу аймақтары
    DRONE_ZONES.forEach(zn => { const [x, z] = W2(zn.lon, zn.lat); const ring = mesh(new THREE.TorusGeometry(3, .08, 6, 40), new THREE.MeshBasicMaterial({ color: 0xffd447 }), x, .15, z); ring.rotation.x = -Math.PI / 2; ring.visible = false; scene.add(ring);
      const el = document.createElement('div'); el.className = 'lbl zone'; el.innerHTML = `<i class="ic">${zn.icon}</i><span>${zn.name.split('(')[0]}</span>`; el.style.display = 'none'; lay.appendChild(el);
      const Z = { el, pos: new THREE.Vector3(x, 1.4, z), zone: zn, ring, w: 0 }; labels.push(Z); zoneRings.push(Z); });
  }
  const _v = new THREE.Vector3();
  function updateLabels() {
    const w = R.domElement.clientWidth, h = R.domElement.clientHeight, placed = [];
    const camPos = cam.position, focus = mode === 'drone' ? drone.position : mode === 'car' ? car.position : null;
    const pri = L => (L === st.near || L === hoverL ? 0 : L.city ? 2 : 1);
    const list = labels.map(L => { L.d = L.pos.distanceTo(camPos); return L; }).sort((a, b) => pri(a) - pri(b) || a.d - b.d);
    list.forEach(L => {
      const isZone = !!L.zone; if (isZone && !(mode === 'drone')) { L.el.style.display = 'none'; return; }
      if (!labelsOn && !isZone && L !== st.near) { L.el.style.display = 'none'; return; }
      if (focus && L.pos.distanceTo(focus) > 34 && L !== st.near) { L.el.style.display = 'none'; return; }
      _v.copy(L.pos).project(cam); if (_v.z > 1 || Math.abs(_v.x) > 1.1 || Math.abs(_v.y) > 1.1) { L.el.style.display = 'none'; return; }
      const x = (_v.x + 1) / 2 * w, y = (1 - _v.y) / 2 * h;
      if (!L.w) { L.el.style.display = ''; L.w = L.el.offsetWidth || 120; }
      if (L.city && L.d > 120) { L.el.style.display = 'none'; return; }
      const r = { x: x - L.w / 2, y: y - 38, w: L.w, h: 36 };
      const hit = placed.some(p => r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + r.h > p.y);
      if (hit && L !== st.near) { L.el.style.display = 'none'; return; }
      placed.push(r); L.el.style.display = ''; L.el.style.transform = `translate(${r.x}px,${r.y}px)`; L.el.classList.toggle('near', L === st.near); L.el.style.zIndex = 1000 - Math.round(L.d);
    });
  }

  /* ---------- көліктер ---------- */
  function buildDrone() { const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(.55, .62, .25, 20), M(0xf4f8ff, { flatShading: false, roughness: .3 })));
    g.add(mesh(new THREE.SphereGeometry(.34, 20, 12, 0, 6.3, 0, 1.6), M(0x1d4fd8, { flatShading: false, metalness: .3, roughness: .2 }), 0, .1, 0));
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; const arm = mesh(new THREE.BoxGeometry(1.1, .06, .1), M(0x2a3240), Math.cos(a) * .7, .05, Math.sin(a) * .7); arm.rotation.y = -a; g.add(arm);
      const rot = new THREE.Group(); rot.position.set(Math.cos(a) * 1.25, .16, Math.sin(a) * 1.25); rot.add(mesh(new THREE.BoxGeometry(.9, .02, .1), M(0x1b1f2a))); rot.add(mesh(new THREE.CylinderGeometry(.42, .42, .01, 20), new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: .25 }))); g.add(rot); rotors.push(rot);
      g.add(mesh(new THREE.CylinderGeometry(.03, .03, .3, 4), M(0x1b1f2a), Math.cos(a) * .45, -.2, Math.sin(a) * .45)); }
    g.add(mesh(new THREE.BoxGeometry(.25, .12, .25), M(0xffd447), 0, -.2, 0));
    g.traverse(o => o.castShadow = true); g.scale.setScalar(.9); g.visible = false; scene.add(g); return g; }
  function buildCar() { const g = new THREE.Group(); const body = new THREE.Group(); g.add(body);
    body.add(mesh(new THREE.BoxGeometry(1.9, .42, .95), M(0xeaf4ff, { flatShading: false, roughness: .3, metalness: .2 }), 0, .42, 0));
    body.add(mesh(new THREE.BoxGeometry(1.05, .38, .85), M(0x1f5fd0, { flatShading: false, roughness: .15, metalness: .4 }), -.1, .8, 0));
    body.add(mesh(new THREE.BoxGeometry(.06, .1, .7), M(0xfff6b0, { emissive: 0xffe680 }), .96, .45, 0));
    body.add(mesh(new THREE.BoxGeometry(.4, .02, .4), M(0x2fd38a, { emissive: 0x0b6b3e }), .5, .64, 0));
    g.userData.wheels = []; [[.6, .48], [-.6, .48], [.6, -.48], [-.6, -.48]].forEach(([x, z]) => { const w = mesh(new THREE.CylinderGeometry(.22, .22, .16, 14), M(0x1a1a22), x, .22, z); w.rotation.x = Math.PI / 2; g.add(w); g.userData.wheels.push(w); });
    g.traverse(o => o.castShadow = true); g.visible = false; scene.add(g); return g; }

  /* ---------- бөлшектер (шашу) ---------- */
  function buildParticles() { const N = 400; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    parts = new THREE.Points(g, new THREE.PointsMaterial({ size: .22, vertexColors: true, transparent: true, opacity: .9 })); scene.add(parts); for (let i = 0; i < N; i++) partData.push({ life: 0 }); }
  function emit(pos, color, n = 160) { const c = new THREE.Color(color); const P_ = parts.geometry.attributes.position, C = parts.geometry.attributes.color; let k = 0;
    for (let i = 0; i < partData.length && k < n; i++) { const p = partData[i]; if (p.life > 0) continue; k++; p.life = 1.4 + Math.random(); p.x = pos.x + (Math.random() - .5) * .6; p.y = pos.y - .3; p.z = pos.z + (Math.random() - .5) * .6; p.vx = (Math.random() - .5) * 3; p.vz = (Math.random() - .5) * 3; p.vy = -Math.random() * 2; C.setXYZ(i, c.r, c.g, c.b); }
    C.needsUpdate = true; }
  function stepParticles(dt) { const A = parts.geometry.attributes.position; partData.forEach((p, i) => { if (p.life > 0) { p.life -= dt; p.vy -= 6 * dt; p.x += p.vx * dt; p.y = Math.max(.05, p.y + p.vy * dt); p.z += p.vz * dt; A.setXYZ(i, p.x, p.y, p.z); } else A.setXYZ(i, 0, -50, 0); }); A.needsUpdate = true; }

  /* ---------- басқару ---------- */
  const typing = () => /INPUT|TEXTAREA/.test(document.activeElement?.tagName || '');
  const blocked = () => document.body.classList.contains('page-open') || document.body.classList.contains('vr-open') || document.getElementById('modal').classList.contains('open');
  addEventListener('keydown', e => { if (typing() || blocked()) return; const k = e.code; keys[k] = true;
    if ((mode === 'drone' || mode === 'car') && ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) e.preventDefault();
    if (k === 'Enter' && st.near && (mode === 'drone' || mode === 'car')) enterNear();
    if (k === 'KeyF' && mode === 'drone') sprayNow(); });
  addEventListener('keyup', e => { keys[e.code] = false; });
  const inp = { f: () => (keys.KeyW || keys.ArrowUp || keys.t_up ? 1 : 0) - (keys.KeyS || keys.ArrowDown || keys.t_down ? 1 : 0), t: () => (keys.KeyA || keys.ArrowLeft || keys.t_left ? 1 : 0) - (keys.KeyD || keys.ArrowRight || keys.t_right ? 1 : 0), u: () => (keys.Space || keys.t_rise ? 1 : 0) - (keys.ShiftLeft || keys.ShiftRight || keys.t_fall ? 1 : 0) };
  function enterNear() { const L = st.near; if (!L) return; if (L.zone) return sprayNow(); activate(L, { clientX: innerWidth / 2, clientY: innerHeight / 2 }); }
  /* белгіні/кубты басу: куб үлкейіп айналады → портал */
  function activate(L, ev) {
    if (L.type === 'lab') { go('lab'); return; }
    if (L.cube) { L.pop = performance.now(); L.popDur = 650; const pt = ev && ev.clientX ? { clientX: ev.clientX, clientY: ev.clientY } : null; setTimeout(() => openPortal(L.type, L.id, pt), 480); }
    else openPortal(L.type, L.id, ev);
  }
  const ray = new THREE.Raycaster(), _m = new THREE.Vector2();
  function pick(ev) { const r = R.domElement.getBoundingClientRect(); _m.set((ev.clientX - r.left) / r.width * 2 - 1, -(ev.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(_m, cam); const h = ray.intersectObjects(cubes, false)[0]; return h ? h.object.userData.L : null; }
  let drv = 0, lastNow = 0;
  function cubeAnim(t, now) {
    const dtc = Math.min(.2, (now - (lastNow || now)) / 1000); lastNow = now; drv += (((mode === 'drone' || mode === 'car') ? 1 : 0) - drv) * Math.min(1, dtc * 4); const base = 1 - drv * .72, yB = CUBE_Y - drv * 2.6;
    cubes.forEach(c => { const L = c.userData.L; if (c.userData.mini !== undefined && L && L.cube) { const k = c.userData.mini, n = L.minis.length, a = t * .6 + k / n * 6.283, s2 = (1 + L.boost) * base; c.scale.setScalar(base); c.position.set(L.cube.position.x + Math.cos(a) * 2.6 * s2, L.cube.position.y - 1.2 * base + Math.sin(t * 2 + k) * .25 * base, L.cube.position.z + Math.sin(a) * 2.6 * s2); c.rotation.y += .02; return; }
      if (!L || !L.cube || L.cube !== c) return;
      let target = (L === hoverL || L === st.near) ? (drv > .5 ? .25 : .5) : 0, spin = 0;
      if (L.pop) { const p = (now - L.pop) / L.popDur; if (p < 1) { target = 1; spin = (L.popDur > 1000 ? .04 : .25); } else L.pop = 0; }
      L.boost += (target - L.boost) * .15; const s = (1 + L.boost) * base;
      c.scale.setScalar(s); c.rotation.y += .006 + spin; c.position.y = yB + (Math.sin(t * 1.6 + L.ph) * .3 + L.boost * 1.6) * base;
      if (L.beam) { const bh = Math.max(.3, yB - CUBE_S * s * .5); L.beam.scale.y = bh / L.beamH; L.beam.position.y = bh / 2; }
      L.halo.position.y = c.position.y; L.halo.scale.setScalar(7.5 * s * (1 + Math.sin(t * 2.4 + L.ph) * .08)); L.halo.material.opacity = .55 + L.boost * .4;
      c.material.emissiveIntensity = .38 + L.boost * .4; L.pos.y = c.position.y + CUBE_S * .75 * s + .3;
      const rs = 1.8 + (Math.sin(t * 3 + L.ph) + 1) * .35; L.ring.scale.setScalar(rs); L.ring.material.opacity = .9 - (rs - 1.8) * .8; });
  }
  function findNear(pos, rad) { let best = null, bd = rad; markers.forEach(L => { const d = Math.hypot(L.pos.x - pos.x, L.pos.z - pos.z); if (d < bd) { bd = d; best = L; } });
    if (mode === 'drone') zoneRings.forEach(Z => { const d = Math.hypot(Z.pos.x - pos.x, Z.pos.z - pos.z); if (d < 3.4 && (!best || d < bd)) { bd = d; best = Z; } }); return best; }

  function stepDrone(dt) { const s = st.drone; const f = inp.f(), t = inp.t(), u = inp.u();
    s.v += ((f * 16) - s.v) * Math.min(1, dt * 2.5); s.yaw += t * 1.9 * dt; s.vy += ((u * 7) - s.vy) * Math.min(1, dt * 4);
    const nx = s.x + Math.sin(s.yaw) * s.v * dt, nz = s.z + Math.cos(s.yaw) * s.v * dt; if (Math.abs(nx) < 85 && Math.abs(nz) < 55) { s.x = nx; s.z = nz; }
    s.y = Math.max(2.2, Math.min(32, s.y + s.vy * dt));
    drone.position.set(s.x, s.y + Math.sin(clock.elapsedTime * 3) * .08, s.z); drone.rotation.set(-s.v * .012 * Math.cos(0), s.yaw, t * .18); drone.rotation.order = 'YXZ'; drone.rotation.x = s.v * .014;
    rotors.forEach((r, i) => r.rotation.y += dt * (30 + Math.abs(s.v) * 2) * (i % 2 ? 1 : -1));
    chase(s.x, s.y, s.z, s.yaw, 11, 5.5, dt);
    const n = findNear(drone.position, 4.5); if (n !== st.near) { st.near = n; panelNear(); if (n && !n.zone && n.id && !st.droneSeen.has(n.id)) { st.droneSeen.add(n.id); if (st.droneSeen.size >= 5 && !S.tours.drone) { S.tours.drone = true; save(); addXP(50, 'Дрон экскурсиясы аяқталды!'); Guide.say(VO.droneDone); } } } }
  function stepCar(dt) { const s = st.car; const f = inp.f(), t = inp.t();
    const max = s.bat > 0 ? 10 : 1.2; if (f > 0) s.v += 9 * dt; else if (f < 0) s.v -= (s.v > 0 ? 16 : 6) * dt; else s.v -= Math.sign(s.v) * Math.min(Math.abs(s.v), 5 * dt);
    s.v = Math.max(-3, Math.min(max, s.v)); s.yaw += t * dt * Math.min(1, Math.abs(s.v) / 3) * 1.8 * Math.sign(s.v || 1);
    const nx = s.x + Math.sin(s.yaw) * s.v * dt, nz = s.z + Math.cos(s.yaw) * s.v * dt;
    if (inPoly(nx, nz)) { s.x = nx; s.z = nz; const dk = Math.abs(s.v * dt) * KM_PER_UNIT; s.km += dk; s.bat = Math.max(0, s.bat - dk / 450 * 100); if (s.km >= 500 && !S.tours.car) { S.tours.car = true; save(); addXP(50, 'Электромобиль: 500 км!'); Guide.say(VO.carDone); } }
    else if (Math.abs(s.v) > .5) { s.v = 0; toast('🌊 Жағалау! Әрі қарай — теңіз.'); }
    car.position.set(s.x, 0, s.z); car.rotation.y = s.yaw - Math.PI / 2; car.userData.wheels.forEach(w => w.rotation.y += s.v * dt * 4);
    // зарядтау
    const ch = CHARGERS.some(([, lo, la]) => { const [x, z] = W2(lo + .25, la - .2); return Math.hypot(x - s.x, z - s.z) < 2.2; });
    s.charging = ch && Math.abs(s.v) < 1 && s.bat < 100; if (s.charging) s.bat = Math.min(100, s.bat + 30 * dt);
    chase(s.x, 0, s.z, s.yaw, 8, 4.4, dt);
    const n = findNear(car.position, 4); if (n !== st.near) { st.near = n; panelNear(); }
    dash(); }
  const _t = new THREE.Vector3(), _l = new THREE.Vector3();
  function chase(x, y, z, yaw, back, up, dt) { _t.set(x - Math.sin(yaw) * back, y + up, z - Math.cos(yaw) * back); cam.position.lerp(_t, Math.min(1, dt * 3)); _l.set(x + Math.sin(yaw) * 4, y + .5, z + Math.cos(yaw) * 4); cam.lookAt(_l); }

  /* ---------- режимдер ---------- */
  function setMode(m) {
    mode = m; st.near = null; Guide.stop(); clearTimeout(st.flyT);
    document.querySelectorAll('[data-wmode]').forEach(b => b.classList.toggle('on', b.dataset.wmode === m));
    drone.visible = m === 'drone'; car.visible = m === 'car'; zoneRings.forEach(Z => Z.ring.visible = m === 'drone');
    ctl.enabled = m === 'overview' || m === 'tour';
    document.body.classList.toggle('drive', m === 'drone' || m === 'car');
    if (m === 'drone') { const [x, z] = W2(71.43, 51.17); Object.assign(st.drone, { x, z: z + 3, y: 6, yaw: Math.PI, v: 0 }); cam.position.set(x, 11.5, z + 14); cam.lookAt(x, 6, z - 1); Guide.say(VO.drone); }
    if (m === 'car') { const [x, z] = W2(71.43, 51.17); Object.assign(st.car, { x: x + 1.5, z: z + 1.5, yaw: Math.PI, v: 0 }); cam.position.set(x + 1.5, 3.6, z + 10); cam.lookAt(x + 1.5, .5, z - 2.5); Guide.say(VO.car); }
    if (m === 'overview') { flyTo(new THREE.Vector3(0, 0, 4), new THREE.Vector3(0, 62, 70)); }
    if (m === 'tour') { st.tourI = -1; st.tourAuto = true; tourNext(1); }
    panel();
  }
  function flyTo(target, camPos, dur = 1600) { const t0 = performance.now(), sT = ctl.target.clone(), sP = cam.position.clone();
    const step = now => { let p = Math.min(1, (now - t0) / dur); p = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; ctl.target.lerpVectors(sT, target, p); cam.position.lerpVectors(sP, camPos, p); if (p < 1 && (mode === 'tour' || mode === 'overview')) requestAnimationFrame(step); };
    requestAnimationFrame(step); }
  function stopPos(s) { if (s.t === 'el') { const [x, z] = ELPOS[s.id]; return new THREE.Vector3(x, 0, z); } const p = PL[s.id]; const [x, z] = W2(p.lon, p.lat); return new THREE.Vector3(x, 0, z); }
  async function tourNext(dir) {
    const ni = st.tourI + dir; if (ni < 0) return; if (ni >= TOUR.length) { S.tours.guide = true; save(); addXP(50, 'AI-гид саяхаты аяқталды!'); Guide.say(VO.tourDone); st.tourAuto = false; panel(); return; }
    st.tourI = ni; const s = TOUR[ni]; const p = stopPos(s); flyTo(p, new THREE.Vector3(p.x + 6, 16, p.z + 18)); panel();
    const my = ni; await Guide.say(s.say, { keep: true });
    if (mode === 'tour' && st.tourAuto && st.tourI === my) st.flyT = setTimeout(() => mode === 'tour' && st.tourAuto && st.tourI === my && tourNext(1), 1200);
  }
  /* ---------- панель ---------- */
  const pn = () => document.getElementById('wpBody');
  function panel() { const b = pn(); if (!b) return;
    if (mode === 'overview') b.innerHTML = `<p class="hint">Тінтуірмен картаны айналдырыңыз, белгіні басып порталға кіріңіз. Дрон немесе электромобильді таңдап, Қазақстанды аралаңыз!</p>`;
    if (mode === 'drone') b.innerHTML = `<p class="hint">Дрон: <kbd>W</kbd>/<kbd>S</kbd> — алға/артқа, <kbd>A</kbd>/<kbd>D</kbd> — бұрылу, <kbd>Space</kbd>/<kbd>Shift</kbd> — биіктік. Нысанға жақындап, <kbd>Enter</kbd> басыңыз.</p>
      <div id="nearBox"></div><div class="mini-t">💧 Пайдалы заттар контейнері <small>(<kbd>F</kbd> — сары аймақта шашу)</small></div>
      <div class="ditems">${DRONE_ITEMS.map(d => `<button data-di="${d.id}" class="${st.item === d.id ? 'on' : ''}" title="${d.name}"><i style="background:${d.color}"></i>${d.name}</button>`).join('')}</div><div id="sprayOut"></div>
      <div class="tele"><span>Биіктік <b id="tAlt">0</b> м</span><span>Жылд. <b id="tSpd">0</b> км/сағ</span><span>Табылды <b>${st.droneSeen.size}</b>/5</span></div>`;
    if (mode === 'car') b.innerHTML = `<p class="hint">Электромобиль: <kbd>W</kbd> — газ, <kbd>S</kbd> — тежеу/артқа, <kbd>A</kbd>/<kbd>D</kbd> — руль. Жасыл станцияда тоқтасаңыз — батарея толады. Нысан жанында <kbd>Enter</kbd>.</p><div id="nearBox"></div><div id="dash"></div>`;
    if (mode === 'tour') { const s = TOUR[Math.max(0, st.tourI)]; b.innerHTML = `<div class="tour-h">🤖 AI-гид саяхаты <span>${st.tourI + 1}/${TOUR.length}</span></div><div class="bar"><i style="width:${(st.tourI + 1) / TOUR.length * 100}%"></i></div>
      <div class="row"><button class="btn sm" id="tPrev">◀</button><button class="btn sm primary" id="tOpen">🌀 Портал: ${s.t === 'el' ? SHORT[s.id] : PL[s.id].name}</button><button class="btn sm" id="tNext">▶</button></div>
      <div class="row"><button class="btn sm ${st.tourAuto ? 'on' : ''}" id="tAuto">${st.tourAuto ? '⏸ Авто' : '▶ Авто'}</button></div>`;
      $('#tPrev').onclick = () => { st.tourAuto = false; tourNext(-1); }; $('#tNext').onclick = () => { st.tourAuto = false; tourNext(1); };
      $('#tOpen').onclick = ev => { st.tourAuto = false; openPortal(s.t === 'el' ? 'el' : 'place', s.id, ev); }; $('#tAuto').onclick = () => { st.tourAuto = !st.tourAuto; panel(); if (st.tourAuto) tourNext(1); }; }
    b.querySelectorAll('[data-di]').forEach(x => x.onclick = () => { st.item = x.dataset.di; panel(); const d = DRONE_ITEMS.find(i => i.id === st.item); Guide.say(VO.itemSel(d)); });
    panelNear(); }
  function panelNear() { const n = document.getElementById('nearBox'); if (!n) return; const L = st.near;
    n.innerHTML = L ? (L.zone ? `<button class="enter" id="enterBtn">💧 Шашу: ${L.zone.name.split('(')[0]} <kbd>F</kbd></button>` : `<button class="enter" id="enterBtn">🌀 Кіру: ${L.name} <kbd>Enter</kbd></button>`) : '<div class="enter dim">Жақын маңда нысан жоқ — ұшып/жүріп көріңіз</div>';
    const eb = document.getElementById('enterBtn'); if (eb) eb.onclick = enterNear; }
  function dash() { const d = document.getElementById('dash'); if (!d || (clock.elapsedTime * 10 | 0) % 3) return; const s = st.car;
    const petrol = s.km * .161, evGrid = s.km * .17 * .65, evGreen = s.km * .17 * .03;
    d.innerHTML = `<div class="tele"><span>Жылд. <b>${Math.abs(s.v * 12).toFixed(0)}</b> км/сағ</span><span>Жол <b>${s.km.toFixed(0)}</b> км</span><span>🔋 <b>${s.bat.toFixed(0)}%</b>${s.charging ? ' ⚡' : ''}</span></div>
     <div class="bar"><i style="width:${s.bat}%;background:${s.bat < 20 ? '#ff5d6c' : ''}"></i></div>
     <table class="co2"><tr><td>⛽ Бензин көлігі</td><td><b class="r">${petrol.toFixed(0)}</b> кг CO₂</td></tr><tr><td>🔌 Электрокар (көмір ЖЭС)</td><td><b class="y">${evGrid.toFixed(0)}</b> кг</td></tr><tr><td>☀️ Электрокар (күн/жел)</td><td><b class="g">${evGreen.toFixed(0)}</b> кг</td></tr></table>
     ${s.bat <= 0 ? '<p class="warn">⚠️ Батарея таусылды! Ең жақын жасыл станцияға жетіңіз.</p>' : ''}<p class="tiny">Батарея: Li, Ni, Co, Mn · қозғалтқыш магниті: Nd — бәрі Қазақстан элементтері!</p>`;
    if (s.bat <= 0 && !st.batWarned) { st.batWarned = true; Guide.say(VO.batLow); } if (s.bat > 5) st.batWarned = false; }
  function sprayNow() {
    const L = st.near; if (!st.item) { Guide.say(VO.pickItem); return; }
    const d = DRONE_ITEMS.find(i => i.id === st.item); emit(drone.position, d.color);
    if (!L || !L.zone) { out(`💨 ${d.name} бос жерге шашылды. Сары аймаққа жақындаңыз!`); Guide.say(VO.sprayEmpty); return; }
    const z = L.zone, zs = zoneState[z.id]; const key = z.id + d.id; sprayCount[key] = (sprayCount[key] || 0) + 1;
    let html, say;
    if (d.target === z.id) { if (sprayCount[key] > 2) { zs.h = Math.max(0, zs.h - 15); html = `⚠️ <b>Норма асты!</b> ${d.warn}`; say = VO.over(d); }
      else { zs.h = Math.min(100, zs.h + 25); zs.pH = Math.min(7.4, zs.pH + (d.id === 'Ca' ? .8 : .25)); html = `✅ <b>${d.name} → ${z.name}</b><br>${d.eff}<br><span class="eq">${d.eq}</span>`; say = VO.good(d); S.spray++; addXP(15, 'Дрон дұрыс шашты!'); } }
    else { zs.h = Math.max(0, zs.h - 5); html = `❌ ${d.name} бұл аймаққа сәйкес емес. Кеңес: ${DRONE_ZONES.find(q => q.id === d.target).name}.`; say = VO.wrong(d); }
    out(html + `<div class="tele"><span>pH <b>${zs.pH.toFixed(1)}</b></span><span>Экожүйе <b>${zs.h}%</b></span></div>`); Guide.say(say, { display: html.replace(/<span class="eq">.*?<\/span>/, '') }); save();
  }
  function out(h) { const o = document.getElementById('sprayOut'); if (o) o.innerHTML = `<div class="sout">${h}</div>`; }
  const zoneState = { field: { pH: 5.6, h: 45 }, forest: { pH: 6.0, h: 40 }, lake: { pH: 5.8, h: 35 }, garden: { pH: 6.3, h: 50 }, steppe: { pH: 7.5, h: 25 } }, sprayCount = {};

  /* ---------- мобильді батырмалар ---------- */
  function touchPad() { document.querySelectorAll('[data-t]').forEach(b => { const k = 't_' + b.dataset.t; const on = e => { e.preventDefault(); keys[k] = true; }, off = () => keys[k] = false;
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off); });
    const e = document.getElementById('tEnter'); if (e) e.onclick = () => mode === 'drone' && st.near?.zone ? sprayNow() : enterNear(); const f = document.getElementById('tSpray'); if (f) f.onclick = sprayNow; }

  /* ---------- цикл ---------- */
  function loop() { raf = requestAnimationFrame(loop); const dt = Math.min(.05, clock.getDelta()); const t = clock.elapsedTime;
    if (document.body.classList.contains('page-open') || document.body.classList.contains('vr-open') || document.hidden) return;
    cubeAnim(t, performance.now());
    const a = water.geometry.attributes.position; if ((t * 30 | 0) % 2 === 0) { for (let i = 0; i < a.count; i++) { const x = waterBase[i * 3], z = waterBase[i * 3 + 2]; a.array[i * 3 + 1] = Math.sin(x * .18 + t * 1.2) * .22 + Math.cos(z * .21 + t * .9) * .18; } a.needsUpdate = true; water.geometry.computeVertexNormals(); }
    turbines.forEach(o => { if (o.hub) o.hub.rotation.z += dt * 2.2; if (o.pump) o.pump.rotation.z = Math.sin(t * 2) * .3; });
    clouds.forEach(c => { c.position.x += c.userData.v * dt; if (c.position.x > 90) c.position.x = -90; });
    if (mode === 'drone') { stepDrone(dt); const al = document.getElementById('tAlt'), sp = document.getElementById('tSpd'); if (al) { al.textContent = (st.drone.y * 20).toFixed(0); sp.textContent = Math.abs(st.drone.v * 9).toFixed(0); } }
    else if (mode === 'car') stepCar(dt); else { if (document.body.classList.contains('home')) { ctl.autoRotate = true; } else ctl.autoRotate = false; ctl.update(); }
    zoneRings.forEach(Z => { if (Z.ring.visible) Z.ring.rotation.z += dt * .5; });
    stepParticles(dt); R.render(scene, cam); updateLabels(); }

  function init() {
    const cv = document.getElementById('world');
    try { R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { document.body.classList.add('no-webgl'); return false; }
    R.setPixelRatio(Math.min(2, devicePixelRatio)); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xa9d4ff, 110, 260);
    cam = new THREE.PerspectiveCamera(42, 1, .1, 600); cam.position.set(0, 62, 70);
    ctl = new THREE.OrbitControls(cam, cv); ctl.target.set(0, 0, 4); ctl.enableDamping = true; ctl.dampingFactor = .08; ctl.maxPolarAngle = 1.32; ctl.minDistance = 12; ctl.maxDistance = 150; ctl.autoRotateSpeed = .35; ctl.screenSpacePanning = false;
    scene.add(new THREE.HemisphereLight(0xdff0ff, 0x5d7f45, .55));
    const sun = new THREE.DirectionalLight(0xfff1d6, .9); sun.position.set(-40, 70, 40); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 45, bottom: -45, near: 10, far: 200 }); sun.shadow.bias = -.0008; scene.add(sun);
    clock = new THREE.Clock();
    buildWater(); buildIsland(); buildFlora(); buildMountains(); buildLandmarks(); buildClouds(); buildMarkers(); buildParticles(); drone = buildDrone(); car = buildCar();
    const rs = () => { const w = innerWidth, h = innerHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); labels.forEach(L => L.w = 0); }; addEventListener('resize', rs); rs();
    document.querySelectorAll('[data-wmode]').forEach(b => b.onclick = () => { setMode(b.dataset.wmode); });
    // кубқа апару/басу (сүйреу емес)
    let down = null, lastMove = 0;
    cv.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
    cv.addEventListener('pointerup', e => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; down = null; const L = pick(e); if (L) activate(L, e); });
    cv.addEventListener('pointermove', e => { const now = performance.now(); if (now - lastMove < 60 || e.buttons) return; lastMove = now; const L = pick(e); if (L !== hoverL) { hoverL = L; cv.style.cursor = L ? 'pointer' : ''; } });
    touchPad(); panel(); ready = true; loop(); return true; }
  return { init, setMode, get mode() { return mode; }, toggleLabels() { labelsOn = !labelsOn; return labelsOn; }, flyToEl(s) { if (!ready) return; if (mode !== 'overview') setMode('overview'); const [x, z] = ELPOS[s]; const L = markers.find(m => m.id === EL_DEP[s] && m.cube); setTimeout(() => { flyTo(new THREE.Vector3(x, 2, z), new THREE.Vector3(x + 5, 15, z + 16)); if (L) { L.pop = performance.now() + 900; L.popDur = 3000; } }, 50); },
    tileTex, flyToPlace(id) { if (!ready) return; if (mode !== 'overview') setMode('overview'); const p = PL[id]; const [x, z] = W2(p.lon, p.lat); setTimeout(() => flyTo(new THREE.Vector3(x, 0, z), new THREE.Vector3(x + 5, 14, z + 16)), 50); }, SHORT };
})();
