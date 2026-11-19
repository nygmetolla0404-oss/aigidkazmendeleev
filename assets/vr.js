/* =========================================================
   VR-ПОРТАЛ: әр элемент/орын үшін виртуалды 3D әлем
   (карьер, шахта, ұңғымалық шаймалау, мұнай-газ, зауыт, тұзды көл, табиғи орындар)
   ========================================================= */
const VR = (() => {
  let R, scene, cam, ctl, root, clock, raf = 0, open_ = false, ok = null;
  let anims = [], spots = [], tags = [], fly = null, playGen = 0, curSpot = -1, cur = null, autoSpin = true;
  const $i = id => document.getElementById(id);
  const rnd = seed => { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  let r = rnd(1);

  /* ---------- жинақ (kit) ---------- */
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: .8 }, o));
  const mat = m => (m && m.isMaterial) ? m : M(m);
  function mesh(g, m, x = 0, y = 0, z = 0, p = root) { const o = new THREE.Mesh(g, mat(m)); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; p.add(o); return o; }
  const box = (w, h, d, c, x, y, z, p) => mesh(new THREE.BoxGeometry(w, h, d), c, x, y, z, p);
  const cyl = (rt, rb, h, c, x, y, z, p, seg = 12) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), c, x, y, z, p);
  const sph = (rad, c, x, y, z, p, d = 1) => mesh(new THREE.IcosahedronGeometry(rad, d), c, x, y, z, p);
  const grp = (x = 0, y = 0, z = 0, p = root) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  const glowM = (c, k = .9) => M(c, { emissive: c, emissiveIntensity: k, flatShading: false });
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const anim = f => anims.push(f);

  function ground(col, rad = 42, y = 0) { const g = new THREE.CylinderGeometry(rad, rad * 1.02, 2, 48, 1); const m = mesh(g, col, 0, y - 1, 0); m.castShadow = false; return m; }
  function water(x, z, rad, col = 0x2f8fe8, y = .05, sx = 1) { const m = mesh(new THREE.CircleGeometry(rad, 40), M(col, { roughness: .2, metalness: .2, transparent: true, opacity: .92, flatShading: false }), x, y, z); m.rotation.x = -Math.PI / 2; m.scale.x = sx; m.castShadow = false; return m; }
  function pine(x, z, s = 1, c = 0x2f7d3c) { const g = grp(x, 0, z); cyl(.08 * s, .12 * s, .6 * s, 0x6b4a2e, 0, .3 * s, 0, g, 5); mesh(new THREE.ConeGeometry(.55 * s, 1.5 * s, 6), c, 0, 1.2 * s, 0, g); mesh(new THREE.ConeGeometry(.42 * s, 1.1 * s, 6), c, 0, 1.8 * s, 0, g); return g; }
  function leafy(x, z, s = 1, c = 0x5fae4e) { const g = grp(x, 0, z); cyl(.08 * s, .12 * s, .8 * s, 0x6b4a2e, 0, .4 * s, 0, g, 5); sph(.6 * s, c, 0, 1.15 * s, 0, g, 0); return g; }
  function mountain(x, z, h, c = 0x8a6a4b, snow = false) { const rad = h * .75; const m = mesh(new THREE.ConeGeometry(rad, h, 7, 1), c, x, h / 2, z); m.rotation.y = r() * 6; if (snow) { const s = mesh(new THREE.ConeGeometry(rad * .38, h * .36, 7, 1), 0xffffff, x, h - h * .18 + .02, z); s.rotation.y = m.rotation.y; } return m; }
  function rock(x, z, s, c = 0x8d8a86, y = 0) { const m = sph(s, c, x, y + s * .5, z, root, 0); m.scale.y = .7 + r() * .6; m.rotation.set(r(), r() * 6, r()); return m; }
  function building(x, z, w, h, d, c = 0xdfe6f0, roof = 0x3a6fd8) { const g = grp(x, 0, z); box(w, h, d, c, 0, h / 2, 0, g); box(w + .1, .25, d + .1, roof, 0, h + .12, 0, g); for (let i = 0; i < Math.floor(w / 1.2); i++) box(.5, .4, .02, glowM(0xbfe4ff, .3), -w / 2 + .8 + i * 1.2, h * .6, d / 2 + .01, g); return g; }
  function chimney(x, z, h, col = 0xe9e9e9, smoke = 0xdddddd) { const g = grp(x, 0, z); cyl(.35, .55, h, col, 0, h / 2, 0, g); cyl(.37, .37, .5, 0xd23a2f, 0, h - .6, 0, g); anim((t, dt) => { if (r() < dt * 5) puff(x + (r() - .5) * .3, h + .2, z, smoke, .6 + r() * .4, 1.2, 4); }); return g; }
  function tank(x, z, rad, h, c = 0xe8edf3, liquid) { const g = grp(x, 0, z); cyl(rad, rad, h, c, 0, h / 2, 0, g, 16); if (liquid) { const l = cyl(rad * .92, rad * .92, .05, glowM(liquid, .4), 0, h + .01, 0, g, 16); anim(t => l.rotation.y = t); } return g; }
  function pipe(a, b, rad = .12, c = 0x8a96a8) { const d = b.clone().sub(a), L = d.length(); const m = mesh(new THREE.CylinderGeometry(rad, rad, L, 8), c); m.position.copy(a).add(b).multiplyScalar(.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return m; }
  function truck(col = 0xffc21a, load) { const g = grp(); box(1.6, .6, .9, col, 0, .55, 0, g); box(.6, .6, .9, col, .95, .75, 0, g); box(.3, .3, .8, glowM(0xbfe4ff, .2), 1.1, .9, 0, g); const bed = box(1.4, .45, .95, 0x6a6a6a, -.15, 1.05, 0, g); if (load) sph(.45, load, -.15, 1.35, 0, g, 0).scale.set(1.4, .6, 1);
    [[.75, .45], [-.55, .45], [.75, -.45], [-.55, -.45]].forEach(([x, z]) => { const w = cyl(.3, .3, .22, 0x1a1a22, x, .3, z, g, 10); w.rotation.x = Math.PI / 2; }); return g; }
  function excavator(x, y, z, col = 0xffc21a) { const g = grp(x, y, z); box(1.8, .5, 1.2, 0x333a46, 0, .25, 0, g); const top = grp(0, .5, 0, g); box(1.5, .8, 1.1, col, -.2, .45, 0, top); box(.5, .5, .5, glowM(0xbfe4ff, .2), .5, 1, .3, top);
    const boom = grp(.5, .7, 0, top); box(2.4, .25, .25, col, 1.1, 0, 0, boom); boom.rotation.z = .55; const arm = grp(2.3, 0, 0, boom); box(1.6, .2, .2, col, .7, 0, 0, arm); arm.rotation.z = -1.4; box(.5, .5, .6, 0x555b66, 1.5, -.1, 0, arm);
    anim(t => { top.rotation.y = Math.sin(t * .6) * 1.2; boom.rotation.z = .45 + Math.sin(t * 1.2) * .2; arm.rotation.z = -1.4 + Math.cos(t * 1.2) * .3; }); return g; }
  function drillRig(x, y, z, h = 4, col = 0x2f6fe8) { const g = grp(x, y, z); box(1.6, .5, 1, col, 0, .25, 0, g); box(.25, h, .25, 0xffc21a, .5, h / 2 + .5, 0, g); const bit = cyl(.08, .08, h * .8, 0xcfd6dd, .5, h * .45, .2, g, 6);
    anim((t, dt) => { bit.rotation.y += dt * 12; if (r() < dt * 6) puff(x + .5 + (r() - .5), y + .2, z + .2, 0xc9b08a, .35, .6, 1.4); }); return g; }
  function turbine(x, z, h = 6) { const g = grp(x, 0, z); cyl(.1, .18, h, 0xffffff, 0, h / 2, 0, g, 8); box(.35, .3, .7, 0xffffff, 0, h, -.1, g); const hub = grp(0, h, .3, g); for (let k = 0; k < 3; k++) { const p = grp(0, 0, 0, hub); p.rotation.z = k * 2.094; box(.12, 2.6, .04, 0xffffff, 0, 1.3, 0, p); } anim((t, dt) => hub.rotation.z += dt * 1.8); return g; }
  function solar(x, z, n = 4) { for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) { const p = box(1.6, .06, 1, M(0x1b3a8a, { metalness: .6, roughness: .25 }), x + i * 1.8, .8, z + j * 1.4); p.rotation.x = -.5; cyl(.05, .05, .8, 0x888888, x + i * 1.8, .4, z + j * 1.4); } }
  function pumpjack(x, z, ph = 0) { const g = grp(x, 0, z); box(2.6, .2, .8, 0x444b58, 0, .1, 0, g); box(.2, 1.6, .2, 0x555b66, 0, .9, .25, g); box(.2, 1.6, .2, 0x555b66, 0, .9, -.25, g);
    const beam = grp(0, 1.7, 0, g); box(2.8, .22, .22, 0x2f6fe8, 0, 0, 0, beam); box(.3, .7, .35, 0x2f6fe8, 1.45, -.2, 0, beam); anim(t => beam.rotation.z = Math.sin(t * 1.6 + ph) * .28); cyl(.05, .05, 1.2, 0x999999, 1.5, .7, 0, g, 6); return g; }
  function derrick(x, z, h = 9) { const g = grp(x, 0, z); const s = 1.4; [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => { const leg = pipe(V(x + a * s, 0, z + b * s), V(x + a * .25, h, z + b * .25), .07, 0xd9dde6); });
    for (let k = 1; k < 6; k++) { const y = k * h / 6, w = s - (s - .25) * (k / 6); box(w * 2, .06, .06, 0xd9dde6, 0, y, w, g); box(w * 2, .06, .06, 0xd9dde6, 0, y, -w, g); box(.06, .06, w * 2, 0xd9dde6, w, y, 0, g); box(.06, .06, w * 2, 0xd9dde6, -w, y, 0, g); }
    box(3.4, .5, 3.4, 0x5d6676, 0, .25, 0, g); const p = cyl(.1, .1, h * .9, 0x8a96a8, 0, h * .45, 0, g, 6); anim((t, dt) => p.rotation.y += dt * 6); return g; }
  function conveyor(a, b, oreCol) { pipe(a, b, .25, 0x3a3f4a); const n = 10, items = []; for (let i = 0; i < n; i++) items.push(sph(.22, oreCol, 0, 0, 0, root, 0));
    anim(t => items.forEach((o, i) => { const u = ((t * .12 + i / n) % 1); o.position.lerpVectors(a, b, u).y += .3; })); }
  function stockpile(x, z, rad, col) { return mesh(new THREE.ConeGeometry(rad, rad * .8, 9), col, x, rad * .4, z); }
  function ingots(x, z, col, n = 3) { const g = grp(x, 0, z); const m = M(col, { metalness: .85, roughness: .25, flatShading: false }); for (let k = 0; k < n; k++) for (let i = 0; i < 3; i++) { const b = box(.9, .3, .4, m, (i - 1) * .5 * (k % 2 ? 1 : 1), .15 + k * .3, 0, g); if (k % 2) { b.rotation.y = Math.PI / 2; b.position.set(0, .15 + k * .3, (i - 1) * .5); } else b.position.x = (i - 1) * .5; } return g; }
  function person(x, y, z, helm = 0xffc21a, p = root) { const g = grp(x, y, z, p); cyl(.13, .15, .55, 0xff7a1a, 0, .45, 0, g, 6); sph(.13, 0xf2c9a0, 0, .85, 0, g, 0); cyl(.15, .15, .08, helm, 0, .97, 0, g, 8); return g; }
  function strataTex(w, h, layers, paint) { const W = 1024, H = Math.round(1024 * h / w); const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
    let y0 = 0; layers.forEach(([col, th]) => { const hh = th / h * H; c.fillStyle = col; c.fillRect(0, y0, W, hh + 1); for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(0,0,0,${r() * .1})`; c.fillRect(r() * W, y0 + r() * hh, 3 + r() * 9, 2 + r() * 4); } y0 += hh; });
    const X = x => (x + w / 2) / w * W, Y = y => -y / h * H; if (paint) paint(c, X, Y, W / w); const t = new THREE.CanvasTexture(cv); t.anisotropy = 4; return t; }
  // жер кесіндісі (алдыңғы бет — қабаттар суреті)
  function block(w, h, d, top, layers, paint) { const front = strataTex(w, h, layers, paint), side = strataTex(d, h, layers);
    const mats = [M(0xffffff, { map: side }), M(0xffffff, { map: side }), M(top), M(0x554433), M(0xffffff, { map: front, flatShading: false }), M(0xffffff, { map: side })];
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); m.position.set(0, -h / 2, 0); m.receiveShadow = true; root.add(m); return m; }

  /* ---------- фон: аспан градиенті + алыстағы бұлдыр таулар ---------- */
  let skyTex, hillCol = 0xd8cdb0; const skyTint = c => { hillCol = c; };
  function skyTexture() { if (skyTex) return skyTex; const cv = document.createElement('canvas'); cv.width = 4; cv.height = 256; const c = cv.getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#4f86d4'); g.addColorStop(.42, '#a9c6e6'); g.addColorStop(.6, '#e9e2cf'); g.addColorStop(1, '#e9e2cf'); c.fillStyle = g; c.fillRect(0, 0, 4, 256);
    return skyTex = new THREE.CanvasTexture(cv); }
  function backdrop(green) { scene.background = skyTexture(); scene.fog.color.set(green ? 0xdfe7d6 : 0xe6dfcc);
    const col = green ? 0xb8c9a8 : 0xd9ccaa; for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2 + r() * .2, d = 88 + r() * 25, h = 7 + r() * 10;
      const m = mesh(new THREE.ConeGeometry(h * 1.1, h, 4 + (r() * 3 | 0), 1), M(col, { roughness: 1 }), Math.cos(a) * d, h / 2 - 18 + h * .9, Math.sin(a) * d); m.scale.y = 1.6; m.castShadow = m.receiveShadow = false; m.rotation.y = r() * 3; }
    const fl = mesh(new THREE.CircleGeometry(160, 32), M(green ? 0xc9d4b4 : 0xe3d8b8, { roughness: 1 }), 0, -18, 0); fl.rotation.x = -Math.PI / 2; fl.castShadow = false; }

  /* ---------- бөлшектер ---------- */
  let dotTex; function dot() { if (dotTex) return dotTex; const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'); const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.4, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); return dotTex = new THREE.CanvasTexture(cv); }
  let P = null;
  function makePool() { const N = 2400, g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3).fill(-999), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: .35, map: dot(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); pts.frustumCulled = false; root.add(pts);
    P = { pts, N, d: Array.from({ length: N }, () => ({ life: 0 })), i: 0 }; }
  function spark(x, y, z, vx, vy, vz, col, life = 1.5, g = 0, path) { const k = P.i++ % P.N, p = P.d[k]; const c = new THREE.Color(col); Object.assign(p, { x, y, z, vx, vy, vz, life, max: life, g, path, r: c.r, gg: c.g, b: c.b }); }
  function stepPool(dt) { const A = P.pts.geometry.attributes.position, C = P.pts.geometry.attributes.color;
    P.d.forEach((p, i) => { if (p.life <= 0) { A.setXYZ(i, 0, -999, 0); return; } p.life -= dt; const u = 1 - p.life / p.max;
      if (p.path) { const q = p.path(u); A.setXYZ(i, q.x, q.y, q.z); } else { p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; A.setXYZ(i, p.x, p.y, p.z); }
      const f = p.path ? 1 : Math.min(1, (1 - u) * 1.6); C.setXYZ(i, p.r * f, p.gg * f, p.b * f); }); A.needsUpdate = C.needsUpdate = true; }
  let puffs = [];
  function makePuffs() { puffs = []; const g = new THREE.IcosahedronGeometry(1, 0); for (let i = 0; i < 90; i++) { const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0, flatShading: true, depthWrite: false })); m.visible = false; root.add(m); puffs.push({ m, life: 0 }); } }
  let puffI = 0;
  function puff(x, y, z, col, s = .6, vy = 1, life = 3) { const p = puffs[puffI++ % puffs.length]; p.m.material.color.set(col); p.m.position.set(x, y, z); p.m.scale.setScalar(s); p.m.visible = true; Object.assign(p, { life, max: life, vy, s, vx: (r() - .5) * .4, vz: (r() - .5) * .4 }); }
  function stepPuffs(dt) { puffs.forEach(p => { if (p.life <= 0) { p.m.visible = false; return; } p.life -= dt; const u = 1 - p.life / p.max; p.m.position.y += p.vy * dt; p.m.position.x += p.vx * dt + dt * .3; p.m.position.z += p.vz * dt; p.m.scale.setScalar(p.s * (1 + u * 2)); p.m.material.opacity = .75 * (1 - u); }); }
  const flame = (x, y, z, col = 0xff8a1a, n = 2, spread = .3, vy = 3) => { for (let k = 0; k < n; k++) spark(x + (r() - .5) * spread, y, z + (r() - .5) * spread, (r() - .5) * .6, vy * (.6 + r() * .6), (r() - .5) * .6, r() < .4 ? 0xffe27a : col, .7 + r() * .4); };
  const bubbles = (x, y, z, w, d, col = 0xdff6ff, n = 1, h = 1) => { for (let k = 0; k < n; k++) spark(x + (r() - .5) * w, y, z + (r() - .5) * d, 0, h * (.8 + r() * .6), 0, col, .9 + r() * .5); };

  /* ---------- белгілер / нүктелер ---------- */
  function tag(text, pos) { const el = document.createElement('div'); el.className = 'vtag'; el.textContent = text; $i('vrSpots').appendChild(el); tags.push({ el, pos, text }); }
  function spot(i, title, text, pos) { const el = document.createElement('button'); el.className = 'vspot'; el.innerHTML = `<b>${i + 1}</b><span>${title}</span>`; el.onclick = e => { e.stopPropagation(); playGen++; focus(i); };
    $i('vrSpots').appendChild(el); const s = sph(.28, glowM(0xffd447, 1.2), pos.x, pos.y, pos.z, root, 1); anim(t => s.scale.setScalar(1 + Math.sin(t * 4 + i) * .25)); spots.push({ el, pos, title, text }); }
  const _v = new THREE.Vector3();
  function project() { const w = R.domElement.clientWidth, h = R.domElement.clientHeight;
    const put = (o, cls) => { _v.copy(o.pos).project(cam); if (_v.z > 1 || Math.abs(_v.x) > 1.05 || Math.abs(_v.y) > 1.05) { o.el.style.display = 'none'; return; } o.el.style.display = ''; o.el.style.transform = `translate(${(_v.x + 1) / 2 * w}px,${(1 - _v.y) / 2 * h}px) translate(-50%,${o.cube ? '0' : 'calc(-100% - 8px)'})`; };
    tags.forEach(o => o.hide ? (o.el.style.display = 'none') : put(o)); spots.forEach((o, i) => { put(o); o.el.classList.toggle('on', i === curSpot); }); }

  /* ---------- камера ---------- */
  function flyTo(target, pos, dur = 1400) { fly = { t0: performance.now(), dur, sT: ctl.target.clone(), sP: cam.position.clone(), T: target.clone(), Pp: pos.clone() }; }
  function stepFly() { if (!fly) return; let p = Math.min(1, (performance.now() - fly.t0) / fly.dur); p = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; ctl.target.lerpVectors(fly.sT, fly.T, p); cam.position.lerpVectors(fly.sP, fly.Pp, p); if (p >= 1) fly = null; }
  function focus(i) { const s = spots[i]; if (!s) return; curSpot = i; autoSpin = false; ctl.autoRotate = false;
    const dir = V(s.pos.x, 0, s.pos.z); if (dir.length() < 1) dir.set(1, 0, 1); dir.normalize(); const front = cur.front; const off = front ? V(dir.x * 3, 3, 10) : V(dir.x * 9 + 3, 5, dir.z * 9 + 6);
    flyTo(s.pos, s.pos.clone().add(off)); stepCard(); return Guide.say(s.text, { display: `<b>${i + 1}. ${s.title}</b> — ${s.text}`, keep: true }); }
  function stepCard() { const c = $i('vrStep'), s = spots[curSpot]; if (!s) { c.classList.remove('show'); return; }
    c.innerHTML = `<div class="vs-h"><span>${cur.kind !== 'place' ? 'Өндіру қадамы' : 'Зерттеу нүктесі'} ${curSpot + 1}/${spots.length}</span><button class="say" data-sayt="${encodeURIComponent(s.text)}">🔊</button></div><b>${s.title}</b><p>${s.text}</p>
      <div class="row"><button class="btn sm" id="vsPrev" ${curSpot ? '' : 'disabled'}>◀</button><button class="btn sm" id="vsAll">🎥 Жалпы көрініс</button><button class="btn sm primary" id="vsNext" ${curSpot < spots.length - 1 ? '' : 'disabled'}>▶</button></div>`;
    c.classList.add('show'); $i('vsPrev').onclick = () => { playGen++; focus(curSpot - 1); }; $i('vsNext').onclick = () => { playGen++; focus(curSpot + 1); }; $i('vsAll').onclick = () => { playGen++; overview(); }; }
  function overview() { curSpot = -1; stepCard(); flyTo(cur.view.t, cur.view.p); autoSpin = true; setTimeout(() => { if (autoSpin) ctl.autoRotate = true; }, 1500); }
  async function play() { const my = ++playGen; for (let i = 0; i < spots.length; i++) { if (my !== playGen || !open_) return; await focus(i); if (my !== playGen || !open_) return; await new Promise(res => setTimeout(res, 900)); } if (my === playGen) { addXP(10, 'VR-экскурсия аяқталды!'); overview(); } }

  /* ---------- VR ішіндегі дрон / электрокар экскурсиясы ---------- */
  let veh = null;
  function makeVehicle(type) { const g = grp();
    if (type === 'drone') { cyl(.55, .62, .25, M(0xf4f8ff, { flatShading: false, roughness: .3 }), 0, 0, 0, g, 20); mesh(new THREE.SphereGeometry(.34, 18, 10, 0, 6.3, 0, 1.6), M(0x1d4fd8, { flatShading: false, metalness: .3, roughness: .2 }), 0, .1, 0, g);
      g.userData.rot = []; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; const arm = box(1.1, .06, .1, 0x2a3240, Math.cos(a) * .7, .05, Math.sin(a) * .7, g); arm.rotation.y = -a; const rt = grp(Math.cos(a) * 1.25, .16, Math.sin(a) * 1.25, g); box(.9, .02, .1, 0x1b1f2a, 0, 0, 0, rt); g.userData.rot.push(rt); } }
    else { box(1.9, .42, .95, M(0xeaf4ff, { flatShading: false, roughness: .3, metalness: .2 }), 0, .42, 0, g); box(1.05, .38, .85, M(0x1f5fd0, { flatShading: false, roughness: .15, metalness: .4 }), -.1, .8, 0, g); box(.06, .1, .7, glowM(0xfff6b0, 1), .96, .45, 0, g); box(.4, .02, .4, glowM(0x2fd38a, .8), .5, .64, 0, g);
      [[.6, .48], [-.6, .48], [.6, -.48], [-.6, -.48]].forEach(([x, z]) => { const w = cyl(.22, .22, .16, 0x1a1a22, x, .22, z, g, 12); w.rotation.x = Math.PI / 2; }); }
    g.scale.setScalar(1.6); return g; }
  function vehPoint(type, p) { if (type === 'drone') return V(p.x, Math.max(p.y + 2.2, -12), p.z + (cur.front ? 2.5 : 2));
    if (cur.front) return V(p.x, .05, Math.min(p.z, 6)); return V(p.x, Math.min(0, Math.max(-6.6, p.y - 1.4)) + .05, p.z + 1.5); }
  async function excursion(type) {
    const my = ++playGen; Guide.stop(); curSpot = -1; stepCard(); autoSpin = false; ctl.autoRotate = false; fly = null;
    if (veh) { root.remove(veh); veh = null; } veh = makeVehicle(type); root.add(veh);
    const route = spots.map(s => vehPoint(type, s.pos)); if (!route.length) return;
    const start = route[0].clone().add(V(-8, type === 'drone' ? 4 : 0, 8)); veh.position.copy(start);
    fold(innerWidth < 700); toast(type === 'drone' ? '🚁 Дрон экскурсиясы басталды!' : '🚗 Электрокар экскурсиясы басталды — түтінсіз, CO₂-сіз!');
    const camOff = type === 'drone' ? V(0, 3.5, 9) : V(0, 3, 8);
    const move = (to) => new Promise(res => { const from = veh.position.clone(), d = from.distanceTo(to), dur = Math.max(.8, d / (type === 'drone' ? 7 : 5)); const t0 = performance.now();
      const dir = to.clone().sub(from); dir.y = 0; if (dir.lengthSq() > .001) veh.rotation.y = Math.atan2(-dir.z, dir.x) + (type === 'drone' ? 0 : 0);
      vehStep = dt => { if (my !== playGen) { vehStep = null; return res(); } const u = Math.min(1, (performance.now() - t0) / 1000 / dur), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        veh.position.lerpVectors(from, to, e); if (type === 'drone') { veh.position.y += Math.sin(u * Math.PI) * 2.5; veh.userData.rot.forEach((r2, i) => r2.rotation.y += dt * 30 * (i % 2 ? 1 : -1)); }
        cam.position.lerp(veh.position.clone().add(camOff), Math.min(1, dt * 2.5 + (u >= 1 ? .5 : 0))); ctl.target.lerp(veh.position, Math.min(1, dt * 4 + (u >= 1 ? .5 : 0)));
        if (u >= 1) { vehStep = null; res(); } }; });
    for (let i = 0; i < route.length; i++) { await move(route[i]); if (my !== playGen || !open_) return;
      curSpot = i; stepCard(); const s = spots[i]; await Guide.say(s.text, { display: `<b>${i + 1}. ${s.title}</b> — ${s.text}`, keep: true }); if (my !== playGen || !open_) return; await new Promise(r2 => setTimeout(r2, 600)); }
    if (my === playGen) { addXP(15, type === 'drone' ? 'VR дрон экскурсиясы аяқталды!' : 'VR электрокар экскурсиясы аяқталды!'); Guide.say(type === 'drone' ? VR_DONE.drone : VR_DONE.car); overview(); } }
  let vehStep = null;
  const VR_DONE = { drone: 'Дрон экскурсиясы аяқталды! Енді өндірістің барлық кезеңін көрдіңіз.', car: 'Электрокар экскурсиясы аяқталды! Электромобиль ауаны ластамайды, ал оның аккумуляторындағы литий, никель, кобальт пен марганец — Қазақстан элементтері.' };

  /* ---------- сахна үлгілері ---------- */
  const STEP_ANCH = {};
  function tplPit(c) {
    skyTint(0x9fd3ff);
    const pts = [new THREE.Vector2(0, -6.6)]; let rr = 3.5, y = -6.6; for (let k = 0; k < 6; k++) { pts.push(new THREE.Vector2(rr, y)); pts.push(new THREE.Vector2(rr + .2, y + 1.1)); rr += 2.2; y += 1.1; } pts.push(new THREE.Vector2(44, 0), new THREE.Vector2(44, -9));
    const g = new THREE.LatheGeometry(pts, 30); const top = new THREE.Color(c.gr || 0xc9a46c), ore = new THREE.Color(c.ore), cols = [], pa = g.attributes.position;
    for (let i = 0; i < pa.count; i++) { const yy = pa.getY(i); const u = Math.min(1, Math.max(0, -yy / 6.6)); const col = top.clone().lerp(ore, u * .85).offsetHSL(0, 0, (r() - .5) * .05); cols.push(col.r, col.g, col.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); const pit = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, side: THREE.DoubleSide })); pit.receiveShadow = true; root.add(pit);
    for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = r() * 3; const o = sph(.35 + r() * .4, M(c.ore, { emissive: c.ore, emissiveIntensity: .25 }), Math.cos(a) * d, -6.4, Math.sin(a) * d, root, 0); }
    excavator(1.5, -6.6, -1); tag('Экскаватор', V(1.5, -4, -1));
    const benchY = rad => { const q = (rad - 3.5) / 2.2; const k = Math.floor(q), f = q - k; return -6.6 + 1.1 * Math.max(0, Math.min(6, k + (f > .82 ? (f - .82) / .18 : 0))); };
    for (let k = 0; k < 3; k++) { const tr = truck(0xffc21a, k % 2 ? c.ore : null); tr.scale.setScalar(.9); anim(t => { const u = ((t * .035 + k / 3) % 1); const th = u * Math.PI * 3, rad = 4.6 + u * 12; const x = Math.cos(th) * rad, z = Math.sin(th) * rad; tr.position.set(x, benchY(rad), z); tr.rotation.y = -th - Math.PI / 2 + .3; }); }
    tag('Самосвал', V(-9, 1, 5));
    const da = 2.4, dR = 3.5 + 2.2 * 3 + 1.1; drillRig(Math.cos(da) * dR, -6.6 + 3.3, Math.sin(da) * dR); tag('Бұрғылау қондырғысы', V(Math.cos(da) * dR, 1.6, Math.sin(da) * dR));
    const ba = 4.2, bR = 3.5 + 2.2 * 2 + 1.1, bx = Math.cos(ba) * bR, bz = Math.sin(ba) * bR, by = -6.6 + 2.2;
    anim((t, dt) => { if ((t % 9) < dt) { for (let i = 0; i < 18; i++) puff(bx + (r() - .5) * 2, by + .3, bz + (r() - .5) * 2, 0xc9b08a, .5 + r() * .6, 1.5 + r(), 2.5); for (let i = 0; i < 40; i++) spark(bx, by + .5, bz, (r() - .5) * 6, 2 + r() * 4, (r() - .5) * 6, 0xffb347, .7, -9); } });
    tag('Жару (кен қопсыту)', V(bx, by + 2.5, bz));
    conveyor(V(10, -2.2, 6), V(22, 1.2, 10), c.ore); tag('Конвейер', V(16, 2.2, 8));
    building(25, 12, 6, 3.2, 4, 0xe6ebf2, 0x2f6fe8); chimney(28.5, 13.5, 7); stockpile(21, 15, 2, c.ore); tag('Байыту фабрикасы', V(25, 5, 12));
    const prod = ingots(19, 4, c.metal || 0xcfd6dd); tag(c.prod || 'Дайын өнім', V(19, 2, 4));
    ext(c, V(28, 0, 3)); STEP_ANCH.list = [V(Math.cos(da) * dR, -1.5, Math.sin(da) * dR), V(1.5, -3.6, -1), V(9, -3.3, -7), V(16, 1.8, 8), V(25, 4.2, 12), V(19, 1.6, 4), V(28, 3, 3)];
    return { t: V(8, -2, 3), p: V(28, 26, 42) };
  }
  function tplMine(c) {
    skyTint(0); const W = 38, H = 16, D = 16, F = D / 2, LV = [-4.5, -8.5, -12.5];
    block(W, H, D, c.gr || 0xd9c89a, [['#6b4a2a', .8], [c.soil || '#c9a46c', 3.2], ['#a8a090', 4], ['#6f6a62', 3.5], ['#4a4640', 4.5]], (g, X, Y, s) => {
      g.fillStyle = '#141210'; g.fillRect(X(-1.1), Y(0), 2.2 * s, Y(-13.6)); LV.forEach((yy, i) => g.fillRect(X(-13 + i * .8), Y(yy + .55), (27 - i * 1.2) * s, 1.1 * s));
      g.fillStyle = 'rgba(255,230,140,.9)'; LV.forEach(yy => { for (let x = -11; x < 13; x += 2.4) { g.beginPath(); g.arc(X(x), Y(yy + .25), 4, 0, 7); g.fill(); } }); });
    const z = F + .08;
    // кен линзалары (жарқыраған эллипсоидтар)
    const oreM = M(c.ore, { emissive: c.ore, emissiveIntensity: .25, flatShading: false, roughness: .5 });
    [[-13, -4.6], [13.5, -4.2], [-12.5, -8.7], [13, -8.3], [-12, -12.6], [13.2, -12.2], [7, -6.6], [-5, -10.6]].forEach(([x, y]) => { const l = mesh(new THREE.SphereGeometry(1, 16, 10), oreM, x, y, z + .05); l.scale.set(1.9, .45, .35); l.rotation.z = (r() - .5) * .5; });
    tag('Кен желісі', V(13.5, -3.2, z + .3));
    tag('Штрек', V(-7, -3.6, z + .3));
    tag('Оқпан', V(0, -1, z + .3));
    // клеть (лифт) және вагонеткалар
    const cage = box(1.6, 1.1, .3, 0xcfd6dd, 0, -2, z); anim(t => cage.position.y = -1.4 - (Math.sin(t * .45) * .5 + .5) * 11.4);
    LV.forEach((yy, j) => { for (let k = 0; k < 2; k++) { const cart = grp(0, yy - .2, z); box(1, .55, .3, 0x5d6676, 0, 0, 0, cart); sph(.3, c.ore, 0, .35, 0, cart, 0).scale.set(1.2, .7, .5);
      anim(t => { const u = ((t * .07 + k / 2 + j * .3) % 1); const side = k ? 1 : -1; cart.position.x = side * (12 - u * 10.5); }); } });
    tag('Вагонетка', V(6, -7.4, z + .3));
    person(-9, LV[2] - .45, z); person(9.5, LV[0] - .45, z); anim((t, dt) => { if (r() < dt * 25) spark(-11.5, LV[2], z + .2, (r() - .5) * 2, r() * 2, .2, 0xffd27a, .4, -6); });
    // копёр: көк торлы мұнара + екі қызыл дөңгелек
    const hf = grp(0, 0, 0); [-.6, .6].forEach(x => box(.16, 9, .16, 0x2a4fb8, x, 4.5, 0, hf)); for (let k = 0; k < 13; k++) box(1.3, .1, .1, 0x2a4fb8, 0, .6 + k * .66, 0, hf);
    [-.7, .7].forEach(x => { const w = mesh(new THREE.TorusGeometry(.75, .09, 6, 22), 0xd23a2f, x, 9.6, 0, hf); w.rotation.y = Math.PI / 2; anim((t, dt) => w.rotation.x += dt * 1.6); });
    tag('Копёр — шахта мұнарасы', V(0, 11.3, 0));
    const hb = grp(-6, 0, -1.5); box(3.2, 2.4, 2.6, 0xc0562f, 0, 1.2, 0, hb); box(3.4, .3, 2.8, 0x6f6f6f, 0, 2.55, 0, hb); tag('Көтергіш машина', V(-6, 3.6, -1.5));
    box(2, 1.6, 2, 0xb8bec6, 4.5, .8, -1.5); stockpile(9, -2.5, 2.6, 0x9a958c); tag('Кен үйіндісі', V(9, 3.4, -2.5));
    building(-13, -4, 5, 3, 4, 0xe6ebf2, 0x2f6fe8); chimney(-10, -6, 6); tag('Байыту фабрикасы', V(-13, 4.6, -4));
    ingots(14, 3, c.metal || 0xcfd6dd); tag(c.prod || 'Дайын өнім', V(14, 1.8, 3)); ext(c, V(-2, 0, -8));
    STEP_ANCH.list = [V(-11.5, LV[2] + .6, z + .3), V(-6, LV[1] + .6, z + .3), V(0, -7, z + .3), V(0, 9.5, 0), V(-13, 3.4, -4), V(14, 1.4, 3), V(-2, 3, -8)];
    STEP_ANCH.cube = V(-9, 9, 2);
    return { t: V(0, -2.5, 0), p: V(3, 8, 40), front: true };
  }
  function tplISR(c) {
    skyTint(0xb2dcff); const W = 38, H = 14, D = 18, F = D / 2, xs = [-14, -7, 0, 7, 14];
    block(W, H, D, 0xe0cc8e, [['#e6d29c', 2], ['#a8a08f', 3], ['#d8c27a', 4], ['#8f8578', 5]], (g, X, Y, s) => {
      g.fillStyle = 'rgba(160,220,60,.75)'; for (let i = 0; i < 500; i++) { g.beginPath(); g.arc(X(-19 + r() * 38), Y(-5.2 - r() * 3.6), 2 + r() * 4, 0, 7); g.fill(); }
      g.fillStyle = '#fff'; g.font = `bold ${s * .7}px Montserrat,Arial`; g.fillText('Құмды сулы қабат + уран', X(-18.5), Y(-8.5)); g.fillText('Саз (су өткізбейді)', X(-18.5), Y(-4.4)); g.fillText('Саз', X(-18.5), Y(-11)); });
    const z = F + .08;
    xs.forEach((x, i) => { const inj = i % 2 === 0; cyl(.16, .16, 9, inj ? 0x2f8fe8 : 0x2fd38a, x, -3.4, z, root, 8); cyl(.3, .3, 1, inj ? 0x2f8fe8 : 0x2fd38a, x, .5, z - .6, root, 8);
      for (let k = -1; k <= 1; k++) cyl(.18, .18, .7, inj ? 0x2f8fe8 : 0x2fd38a, x + (k ? .8 : 0), .35, (k * 4) - 2, root, 8); });
    tag('Айдау ұңғымасы (H₂SO₄)', V(-14, 2.2, z)); tag('Сору ұңғымасы', V(-7, 2.2, z)); tag('Сулы қабат', V(-3, -6.2, z + .2));
    anim((t, dt) => { if (r() < dt * 40) { const i = [0, 2, 4][Math.floor(r() * 3)]; const x = xs[i], tx = xs[Math.max(1, Math.min(3, i + (r() < .5 ? -1 : 1)))];
        spark(0, 0, 0, 0, 0, 0, 0x4fb3ff, 3, 0, u => u < .5 ? V(x, .6 - u * 2 * 7.6, z + .2) : V(x + (tx - x) * (u - .5) * 2 * .5, -7 + Math.sin(u * 20) * .3, z + .2));
        spark(0, 0, 0, 0, 0, 0, 0xd4ff3a, 3, 0, u => u < .5 ? V((x + tx) / 2 + (tx - (x + tx) / 2) * u * 2, -7 + Math.sin(u * 20) * .3, z + .2) : V(tx, -7 + (u - .5) * 2 * 7.6, z + .2)); } });
    // жер беті: құбырлар, цех, сары кек
    pipe(V(-14, .3, -6), V(14, .3, -6), .14); building(0, -10, 8, 3.5, 4, 0xe6ebf2, 0x2fd38a); for (let i = 0; i < 3; i++) tank(-6 + i * 2, -14, .8, 4, 0xe8edf3, 0x9fff4a);
    tag('Өңдеу цехы: ион алмасу', V(0, 5.5, -10)); for (let i = 0; i < 6; i++) cyl(.4, .4, .9, glowM(0xffd21a, .35), 9 + (i % 3) * .9, .45, -12 + (i / 3 | 0) * .9, root, 12); tag('«Сары кек» U₃O₈', V(10, 2, -12));
    drillRig(-14, 0, -2, 3.5); person(-10, 0, -3); ext(c, V(14, 0, -12));
    STEP_ANCH.list = [V(-14, 3, -2), V(-14, -3, z + .3), V(-3, -7, z + .3), V(7, -3, z + .3), V(0, 4.5, -10), V(10, 1.8, -12)];
    return { t: V(0, -3, 0), p: V(12, 6, 38), front: true };
  }
  function tplOil(c) {
    skyTint(0xbfe0ff); ground(0xe2cf98);
    derrick(-9, -4); tag('Бұрғылау мұнарасы', V(-9, 10.5, -4)); pumpjack(-2, 6, 0); pumpjack(4, 9, 1.2); pumpjack(-10, 9, 2.1); tag('Тербелмелі сорап', V(-2, 3.4, 6));
    pipe(V(-2, .3, 6), V(8, .3, 0)); pipe(V(-9, .3, -4), V(8, .3, 0));
    const fl = cyl(.25, .3, 10, 0xd23a2f, 16, 5, -10, root, 8); anim((t, dt) => { for (let k = 0; k < 3; k++) flame(16, 10.2, -10, 0xff6a1a, 1, .4, 4); }); tag('Алау (факел)', V(16, 12.5, -10));
    for (let i = 0; i < 4; i++) tank(6 + i * 2.2, -2, .7, 5 + (i % 2) * 2, 0xeef2f7); building(9, 4, 6, 3, 4); tag(c.plantTag || 'Газ өңдеу зауыты', V(9, 8, -1));
    ext(c, V(0, 0, 0)); STEP_ANCH.list = [V(-9, 6, -4), V(-2, 2.5, 6), V(9, 6, -1), V(16, 10, -10), V(8, 2.6, 13), V(-14, 3, 12), V(0, 3, -12)];
    return { t: V(2, 2, 0), p: V(26, 18, 30) };
  }
  function tplPlant(c) {
    skyTint(0xb8d9f5); ground(0x8f9a8a); box(60, .02, 2.4, 0x6b6f78, 0, .02, 13);
    for (let k = 0; k < 4; k++) { const w = grp(); box(2.4, 1, 1.2, 0x6b4a2e, 0, .8, 0, w); sph(.5, c.ore, 0, 1.4, 0, w, 0).scale.set(2, .6, 1); anim(t => { w.position.set(-26 + ((t * 2.2 + k * 2.8) % 22), 0, 13); }); }
    tag('Шикізат вагондары', V(-18, 2.5, 13)); building(-12, 4, 8, 5, 6, 0xe6ebf2, 0x7a8699); tag('Ұсақтау цехы', V(-12, 6.6, 4));
    building(2, -6, 12, 6, 7, 0xeef1f6, 0x2f6fe8); chimney(10, -9, 11); chimney(12.5, -9, 9); tag('Негізгі цех', V(2, 7.6, -6));
    ingots(14, 6, c.metal || 0xcfd6dd, 4); tag(c.prod || 'Дайын металл', V(14, 2.4, 6)); ext(c, V(0, 0, 4));
    STEP_ANCH.list = [V(-18, 2, 13), V(-12, 6, 4), c.a3 || V(0, 3, 4), c.a4 || V(10, 11, -9), V(14, 2, 6), V(2, 7, -6)];
    return { t: V(0, 1, 2), p: V(24, 16, 30) };
  }
  function tplSalt(c) {
    skyTint(0xc6e6ff); ground(0xd9c99a);
    const crust = mesh(new THREE.CircleGeometry(24, 40), M(0xf7f4ec, { roughness: .6 }), 0, .03, 0); crust.rotation.x = -Math.PI / 2;
    [[-10, -8, 0xff9ec0], [-2, -12, 0x8fe0e0], [7, -9, 0xffb3cc]].forEach(([x, z, col]) => { const p = box(7, .04, 4, M(col, { roughness: .2, metalness: .1 }), x, .07, z); }); tag('Тұзды ерітінді бассейндері', V(-2, 1.5, -10));
    const hv = grp(); box(3, 1, 1.6, 0x2f8fe8, 0, .9, 0, hv); box(1, .9, 1.4, 0xffc21a, 1.6, 1.4, 0, hv); cyl(.5, .5, 1.8, 0x555b66, -1.8, .5, 0, hv).rotation.x = Math.PI / 2;
    anim((t, dt) => { const x = Math.sin(t * .25) * 10; hv.position.set(x, 0, 4); hv.rotation.y = Math.cos(t * .25) > 0 ? 0 : Math.PI; if (r() < dt * 20) spark(x - 1.8, .5, 4, (r() - .5) * 2, 1 + r() * 2, (r() - .5) * 2, 0xffffff, .8, -5); }); tag('Тұз жинайтын комбайн', V(0, 3, 4));
    for (let i = 0; i < 4; i++) stockpile(14 + (i % 2) * 4, 8 + (i / 2 | 0) * 4, 1.8, c.ore || 0xffffff); tag('Тұз үйінділері', V(16, 3.5, 10));
    conveyor(V(6, .4, 6), V(13, 2, 8), c.ore || 0xffffff); building(-15, 10, 6, 3, 4); tag('Жуу-ұнтақтау цехы', V(-15, 5, 10));
    anim((t, dt) => { if (r() < dt * 3) puff(-4 + (r() - .5) * 12, .3, -10 + (r() - .5) * 4, 0xffffff, .3, .6, 2.5); });
    const sun = sph(2, glowM(0xffe27a, 1.2), -18, 16, -20, root, 1); tag('Күн — буландыру', V(-18, 13, -20));
    ext(c, V(-10, 0, 14)); STEP_ANCH.list = [V(-2, 1, -10), V(-18, 13, -20), V(0, 2.6, 4), V(10, 2.4, 7), V(16, 3, 10), V(-15, 4, 10)];
    return { t: V(0, 0, 0), p: V(24, 18, 28) };
  }
  function tplOffshore(c) {
    skyTint(0); const sea = mesh(new THREE.CircleGeometry(60, 48), M(0x2f7fc8, { roughness: .25, metalness: .2 }), 0, .02, 0); sea.rotation.x = -Math.PI / 2; sea.castShadow = false;
    // жасанды арал
    const isl = mesh(new THREE.CylinderGeometry(9, 10.5, 1.4, 8), 0xd9c99a, 0, .5, 0); for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; rock(Math.cos(a) * 10.4, Math.sin(a) * 10.4, .9 + r() * .4, 0x8d8a86, .2); }
    tag('Жасанды арал', V(-8, 2.8, 6));
    derrick(-3, -2, 9).position.y = 1.2; tag('Бұрғылау мұнарасы', V(-3, 11.8, -2));
    for (let i = 0; i < 3; i++) box(2.6, 2.2, 2.2, [0xe6ebf2, 0xffc21a, 0xd23a2f][i], 3 + i * 2.8, 2.3, 3); tag('Өңдеу модульдері', V(6, 4.6, 3));
    const fl = cyl(.22, .28, 8, 0xd23a2f, 6, 5, -5, root, 8); anim(() => { for (let k = 0; k < 3; k++) flame(6, 9.2, -5, 0xff6a1a, 1, .4, 4); }); tag('Алау (факел)', V(6, 11.5, -5));
    pipe(V(9, .8, 0), V(40, .3, 18), .3, 0x555b66); tag('Жағаға құбыр — Болашақ зауыты', V(24, 1.6, 10));
    // мұзға қарсы тосқауыл, мұз және итбалықтар
    for (let i = 0; i < 9; i++) box(1.6, 1.3, 1.6, 0xb8bec6, -18 + i * 2.2, .6, -16 + Math.sin(i) * .6); tag('Мұзға қарсы тосқауыл', V(-9, 2.6, -16));
    for (let i = 0; i < 6; i++) { const f = mesh(new THREE.CylinderGeometry(1.4 + r(), 1.6 + r(), .3, 6), 0xf4f8ff, -24 + i * 5 + r() * 2, .15, -24 - r() * 6); }
    for (let i = 0; i < 3; i++) { const sl = sph(.5, 0x8a8f99, -20 + i * 6, .6, -24, root, 1); sl.scale.set(1.6, .7, .8); } tag('Каспий итбалығы', V(-14, 2, -24));
    const boat = grp(); box(3, .8, 1.2, 0xffffff, 0, .4, 0, boat); box(1.2, .8, 1, 0x2f6fe8, -.4, 1.2, 0, boat); anim(t => { boat.position.set(Math.cos(t * .15) * 20, 0, Math.sin(t * .15) * 20); boat.rotation.y = -t * .15; });
    sulfurPile(30, 18);
    STEP_ANCH.list = [V(-3, 9, -2), V(6, 4, 3), V(6, 9, -5), V(24, 1.4, 10), V(30, 4.5, 18), V(-9, 2.2, -16)];
    return { t: V(4, 1, 2), p: V(30, 22, 36) };
  }
  function sulfurPile(x, z) { for (let k = 0; k < 4; k++) box(7 - k * 1.5, .9, 5 - k, glowM(0xffd21a, .25), x, .45 + k * .9, z); tag('Сары күкірт блоктары', V(x, 4.4, z)); }
  function tplExplore(c) {
    skyTint(0xb2dcff); ground(0xc9c47c); for (let i = 0; i < 3; i++) drillRig(-8 + i * 7, 0, -3 + (i % 2) * 4, 4); tag('Барлау бұрғысы', V(-8, 5.2, -3));
    for (let i = 0; i < 4; i++) { const tr = box(2, .2, 1, 0x8a6a4b, 4 + (i % 2) * 2.4, .4 + (i / 2 | 0) * .25, 8); for (let k = 0; k < 4; k++) cyl(.1, .1, 1.8, glowM(k % 2 ? c.ore : 0x9a9a9a, .2), 4 + (i % 2) * 2.4, .6 + (i / 2 | 0) * .25, 7.7 + k * .2).rotation.z = Math.PI / 2; }
    tag('Керн үлгілері', V(5, 2, 8)); const tent = mesh(new THREE.ConeGeometry(2.4, 2.4, 4), 0xff7a1a, -8, 1.2, 8); building(10, -6, 5, 2.6, 3, 0xffffff, 0x2fd38a); tag('Зертхана: талдау', V(10, 4, -6)); person(-4, 0, 6); person(7, 0, 6, 0xffffff);
    ext(c, V(0, 0, 0)); STEP_ANCH.list = [V(-8, 4, -3), V(5, 1.5, 8), V(10, 3.4, -6), V(-1, 4, 1)];
    return { t: V(0, 1, 2), p: V(22, 15, 26) };
  }
  /* қосымша нысандар */
  function ext(c, o) { (c.ext || []).forEach((e, i) => { const x = o.x + (i % 2 ? -1 : 1) * (4 + i * 2), z = o.z + (i % 2 ? 3 : -2) * (1 + i * .2);
    if (e === 'electro') { for (let k = 0; k < 4; k++) { box(1.4, .8, 1, 0x5d6676, x + k * 1.6, .4, z); box(1.2, .05, .8, glowM(c.liq || 0x9fdcff, .5), x + k * 1.6, .82, z); box(.1, .8, .6, 0x333, x + k * 1.6 - .3, 1.2, z); box(.1, .8, .6, 0xcd7f32, x + k * 1.6 + .3, 1.2, z); }
      anim((t, dt) => { if (r() < dt * 30) bubbles(x + Math.floor(r() * 4) * 1.6, .9, z, 1, .6, 0xe6f7ff, 1, .8); }); tag('Электролиз ванналары', V(x + 2.4, 2.6, z)); if (c.a3 === undefined) c.a3 = V(x + 2.4, 2, z); }
    if (e === 'furnace') { const f = cyl(1.4, 1.6, 2.6, 0x4a4f5a, x, 1.3, z, root, 10); cyl(1.2, 1.2, .1, glowM(0xff6a1a, 1.4), x, 2.62, z, root, 10); const ladle = grp(x + 2.6, 1.8, z); cyl(.6, .45, 1, 0x333a46, 0, 0, 0, ladle, 10); ladle.rotation.z = .6;
      anim((t, dt) => { flame(x, 2.7, z, 0xff4a1a, 1, 1.2, 2); if (r() < dt * 40) spark(x + 2.2, 2, z, -.5, -1, 0, 0xffa31a, 1, -6); }); tag('Пеш: балқыту', V(x, 4.4, z)); if (c.a4 === undefined) c.a4 = V(x, 3.5, z); }
    if (e === 'kroll') { cyl(1, 1, 5, 0x8a96a8, x, 2.5, z, root, 14); cyl(1.05, 1.05, 1.2, glowM(0xff7a1a, .8), x, .8, z, root, 14); sph(.7, 0x9aa3ad, x + 2.2, .5, z, root, 0).scale.y = .6; tag('Кролль реакторы: TiCl₄ + Mg', V(x, 6, z)); if (c.a3 === undefined) c.a3 = V(x, 4, z); }
    if (e === 'tanks') { for (let k = 0; k < 3; k++) tank(x + k * 2.2, z, .9, 2.4, 0xe8edf3, c.liq || 0x6fd3ff); tag('Шаймалау резервуарлары', V(x + 2.2, 3.8, z)); if (c.a3 === undefined) c.a3 = V(x + 2.2, 3, z); else if (c.a4 === undefined) c.a4 = V(x + 2.2, 3, z); }
    if (e === 'flotation') { for (let k = 0; k < 4; k++) box(1.6, 1, 1.6, 0x5d6676, x + k * 1.8, .5, z); anim((t, dt) => { if (r() < dt * 40) bubbles(x + Math.floor(r() * 4) * 1.8, 1.05, z, 1.2, 1.2, c.oreHex || 0xfff4c2, 1, .5); }); tag('Флотация: көбікке жабысу', V(x + 2.7, 2.6, z)); }
    if (e === 'magsep') { const d = cyl(.9, .9, 2.4, 0x7a8699, x, 1.2, z, root, 14); d.rotation.x = Math.PI / 2; anim((t, dt) => d.rotation.y += dt * 2); tag('Магниттік сепаратор', V(x, 3, z)); }
    if (e === 'smelter') { chimney(x, z, 10, 0xe9e9e9, 0xcfcfcf); tag('Мыс балқыту зауыты', V(x, 7, z)); }
    if (e === 'leach') { const h = mesh(new THREE.CylinderGeometry(3, 4.2, 1.6, 4), 0xb59a6a, x, .8, z); h.rotation.y = .78; anim((t, dt) => { if (r() < dt * 25) spark(x + (r() - .5) * 4, 2, z + (r() - .5) * 4, 0, -2, 0, 0x7fd0ff, .8); }); tag('Үйінділік шаймалау', V(x, 3, z)); }
    if (e === 'power') { for (let k = 0; k < 2; k++) { mesh(new THREE.CylinderGeometry(1.4, 2, 5, 16, 1, true), M(0xdfe3ea, { side: THREE.DoubleSide }), x + k * 4, 2.5, z); anim((t, dt) => { if (r() < dt * 4) puff(x + k * 4, 5.2, z, 0xffffff, 1, 1.5, 3.5); }); } chimney(x + 8, z, 12); tag('Екібастұз ГРЭС', V(x + 4, 7, z)); }
    if (e === 'sulfur') { for (let k = 0; k < 4; k++) box(7 - k * 1.5, .9, 5 - k * 1, glowM(0xffd21a, .25), 8, .45 + k * .9, 13); for (let k = 0; k < 2; k++) cyl(.6, .6, 6, 0xd9dde6, -6 + k * 2, 3, 12); tag('Сары күкірт блоктары', V(8, 4.5, 13)); tag('Клаус қондырғысы', V(-5, 7, 12)); }
    if (e === 'gasplant') { for (let k = 0; k < 3; k++) sph(1.3, 0xeef2f7, -12 + k * 3, 1.6, 12, root, 2); tag('Газ сфералары', V(-9, 4, 12)); }
    if (e === 'wind') { for (let k = 0; k < 3; k++) turbine(-18 + k * 4, -10 - k * 2, 7); tag('Жел электр станциясы', V(-14, 10, -12)); }
    if (e === 'solar') solar(-20, 4, 4);
    if (e === 'electrolyzer') { box(4, 2, 2, 0xffffff, 0, 1, -12); cyl(.4, .4, 2.5, 0x2fd38a, -1.4, 3, -12); cyl(.4, .4, 2.5, 0x2f8fe8, 1.4, 3, -12); anim((t, dt) => { if (r() < dt * 25) { spark(-1.4, 4.3, -12, (r() - .5) * .3, 1.5, (r() - .5) * .3, 0x7dffb0, 1.5); spark(1.4, 4.3, -12, (r() - .5) * .3, 1.5, (r() - .5) * .3, 0x7fd0ff, 1.5); } }); tag('Электролизер: 2H₂O → 2H₂ + O₂', V(0, 5.6, -12)); }
  }); }

  /* ---------- табиғи орындар ---------- */
  const forest = (n, cx, cz, rad, f = pine, avoid) => { for (let i = 0; i < n; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * rad, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (avoid && avoid(x, z)) continue; f(x, z, .8 + r() * .7); } };
  const PLACE_TPL = {
    burabay(c) { ground(0x6fae4e); water(-2, 2, 9, 0x2f7fd8); forest(140, 0, 0, 30, pine, (x, z) => Math.hypot(x + 2, z - 2) < 10.5); for (let i = 0; i < 6; i++) rock(-6 + i * 2.2, -12 + (i % 2) * 2, 1.3 + r(), 0x9a958e);
      const ok = grp(10, 0, -8); for (let k = 0; k < 5; k++) sph(1.8 - k * .25, 0x8d8a86, (r() - .5) * .6, 1.4 + k * 1.9, 0, ok, 0); tag('Оқжетпес — гранит (SiO₂, дала шпаты)', V(10, 11, -8));
      const zh = grp(-2, 0, 2); for (let k = 0; k < 3; k++) sph(.9 - k * .2, 0x9a958e, 0, .6 + k * 1, 0, zh, 0); tag('Жұмбақтас', V(-2, 4, 2));
      anim((t, dt) => { if (r() < dt * 30) spark(-25 + r() * 50, 2 + r() * 2, -25 + r() * 50, 0, .8, 0, 0xb6ffcf, 3); }); tag('O₂ және фитонцидтер', V(-14, 6, 10)); tag('Бурабай көлі', V(-2, 1.4, 8));
      return [V(10, 8, -8), V(-14, 4, 10), V(-2, 1.2, 8), V(4, 3, -14), V(-2, 3, 2)]; },
    korgalzhyn(c) { ground(0xb7c46e); water(0, 0, 14, 0x4aa8e8); for (let i = 0; i < 160; i++) { const a = r() * 6.28, d = 14 + r() * 3; cyl(.03, .03, 1.2 + r(), 0xa08a4a, Math.cos(a) * d, .6, Math.sin(a) * d, root, 3); }
      for (let i = 0; i < 26; i++) { const f = grp((r() - .5) * 14, .05, (r() - .5) * 10); sph(.32, 0xff7fb0, 0, 1.2, 0, f, 0).scale.set(1.4, .8, .8); cyl(.03, .03, 1, 0xff7fb0, 0, .55, 0, f, 3); cyl(.04, .04, .8, 0xff7fb0, .35, 1.6, 0, f, 3); sph(.1, 0xff9ec0, .4, 2, 0, f, 0); anim(t => f.rotation.y = Math.sin(t * .4 + i) * .5); }
      tag('Қызғылт фламинго — каротин', V(0, 3.4, 0)); tag('Теңіз көлі — тұзды су', V(8, 1, 8)); return [V(0, 2.5, 0), V(-6, 2, 4), V(5, 2, -5), V(10, 1, 8), V(-10, 1.5, -8)]; },
    alakol(c) { ground(0xd8c48a); water(0, -2, 15, 0x2fc4c8); for (let i = 0; i < 8; i++) mountain(-24 + i * 7, -24, 7 + r() * 5, 0x8a6a4b, true); for (let i = 0; i < 5; i++) { const u = grp(-10 + i * 5, 0, 14); cyl(.05, .05, 2, 0xffffff, 0, 1, 0, u, 4); mesh(new THREE.ConeGeometry(1, .5, 8), [0xff5d6c, 0x2f8fe8, 0xffd447][i % 3], 0, 2, 0, u); }
      tag('Алакөл — емдік тұзды су (Na⁺, Cl⁻, SO₄²⁻)', V(0, 2, -2)); tag('Жетісу Алатауы', V(0, 13, -24)); return [V(0, 1.5, -2), V(-10, 2, 14), V(5, 2, 10), V(0, 10, -24), V(12, 1.5, -6)]; },
    charyn(c) { ground(0xc98a4a); water(0, 0, 3, 0x2f9fe8, .06, 8); const cols = [0xc0562f, 0xd8763f, 0xb84a2a, 0xe0a060];
      for (let s of [-1, 1]) for (let i = 0; i < 18; i++) { const x = -26 + i * 3, h = 5 + r() * 6; for (let k = 0; k < 4; k++) box(2.8, h / 4, 3 + r() * 2, cols[k], x, h / 8 + k * h / 4, s * (6 + r() * 3)); }
      tag('Fe₂O₃ — қызыл түстің құпиясы', V(0, 12, -8)); tag('Шарын өзені', V(14, 1, 0)); const a = [V(0, 9, -7), V(-12, 1.5, 0), V(14, 1, 0), V(-16, 10, -8), V(10, 9, 8)]; a.view = { t: V(0, 3, 0), p: V(36, 13, 3) }; return a; },
    ileAlatau(c) { ground(0x7fae5a); for (let i = 0; i < 9; i++) mountain(-26 + i * 6.5, -16 - r() * 6, 10 + r() * 7, 0x7a6a5a, true); water(0, 4, 6, 0x37d3d0); forest(70, 0, 8, 22, pine, (x, z) => Math.hypot(x, z - 4) < 7);
      tag('Үлкен Алматы көлі — көгілдір түс', V(0, 1.5, 4)); tag('Мұздықтар — тұщы су қоры', V(-6, 16, -18)); return [V(0, 1.4, 4), V(-12, 2, 12), V(8, 2, 12), V(-6, 14, -18), V(12, 12, -18)]; },
    turkistan(c) { ground(0xe2cf98); const g = grp(); box(10, 5, 7, 0xd8c39a, 0, 2.5, 0, g); box(4, 8, 7.2, 0xcdb68a, -6, 4, 0, g); mesh(new THREE.SphereGeometry(2.6, 18, 10, 0, 6.3, 0, 1.6), M(0x2e8bd8, { flatShading: false, roughness: .3 }), 2, 5, 0, g); mesh(new THREE.SphereGeometry(1.8, 18, 10, 0, 6.3, 0, 1.6), M(0x3fa0e8, { flatShading: false, roughness: .3 }), -2.4, 5, 0, g);
      box(3, 3, .05, glowM(0x2e8bd8, .3), -6, 5, 3.62); for (let i = 0; i < 6; i++) leafy(-14 + i * 5.6, 12, 1.2, 0x6fae4e);
      tag('Көк плиткалар — Cu, Co қосылыстары', V(2, 9, 0)); tag('Кірпіш — күйдірілген саз (Al₂O₃·SiO₂)', V(-6, 9, 3)); return [V(2, 8.5, 0), V(-14, 2, 12), V(8, 2, 10), V(-6, 7, 4), V(4, 2, 6)]; },
    caspian(c) { ground(0xe2cf98); water(0, -14, 24, 0x1d6fe8, .06); const pl = grp(0, 0, -16); for (let k = 0; k < 4; k++) cyl(.3, .3, 4, 0x555b66, (k % 2 - .5) * 3, 2, ((k / 2 | 0) - .5) * 3, pl, 6); box(5, .6, 5, 0xd23a2f, 0, 4, 0, pl); derrick(0, -16, 6).position.y = 4.3;
      for (let i = 0; i < 5; i++) { const s = sph(.6, 0x8a8f99, -10 + i * 2.5, .4, 6 + r() * 2, root, 1); s.scale.set(1.6, .7, .8); }
      tag('Мұнай платформасы', V(0, 11, -16)); tag('Каспий итбалығы', V(-6, 1.6, 7)); return [V(0, 9, -16), V(-6, 1.4, 7), V(6, 1.5, 4), V(10, 1, -8), V(-12, 1.5, -6)]; },
    bozzhyra(c) { ground(0xe9dcb8); for (let i = 0; i < 14; i++) { const h = 6 + r() * 8, x = -22 + i * 3.4 + r(), z = -10 + (i % 3) * 3; mesh(new THREE.ConeGeometry(1.8 + r(), h, 5), 0xf7f3e6, x, h / 2, z); box(3, h * .5, 3, 0xe9d8b3, x, h * .25, z + 2); }
      tag('Ақ бор — CaCO₃ (ежелгі теңіз қалдығы)', V(0, 14, -8)); return [V(0, 10, -8), V(-12, 2, 8), V(10, 2, 8), V(-18, 8, -10), V(16, 8, -10)]; },
    altai(c) { ground(0x5fa04a); for (let i = 0; i < 10; i++) mountain(-28 + i * 6.2, -14 - r() * 8, 9 + r() * 8, 0x6a5a4c, r() < .6); forest(160, 0, 6, 26, pine); pipe(V(-28, .1, 4), V(28, .1, 8), .9, M(0x2f8fe8, { roughness: .2 }));
      building(12, 10, 5, 2.6, 3, 0xe6ebf2, 0xd23a2f); tag('Риддер: полиметалл (Zn, Pb, Cu, Ag, Au)', V(12, 5, 10)); tag('Ертіс өзені', V(-10, 1.4, 5)); return [V(12, 4, 10), V(-8, 3, 12), V(-10, 1.2, 5), V(0, 12, -16), V(16, 10, -16)]; },
    balkhash(c) { ground(0xd8c48a); water(-8, 0, 10, 0x2f7fd8, .05, 1.4); water(10, 0, 9, 0x2fc4b0, .06, 1.2); box(.5, .3, 6, 0xd8c48a, 1.5, .1, 0); chimney(18, 14, 11); building(14, 14, 6, 3, 4); tag('Батыс — тұщы су', V(-10, 1.4, 0)); tag('Шығыс — тұзды су', V(12, 1.4, 0)); tag('Балқаш мыс зауыты', V(16, 12.5, 14));
      return [V(1.5, 1.5, 0), V(-10, 1.2, 0), V(12, 1.2, 0), V(16, 10, 14), V(-6, 1.5, 12)]; },
    aral(c) { ground(0xd6c29a); const crust = mesh(new THREE.CircleGeometry(20, 40), M(0xf2efe6), 0, .03, 0); crust.rotation.x = -Math.PI / 2; water(10, -14, 8, 0x3f9fd8, .06);
      for (let i = 0; i < 4; i++) { const s = grp(-10 + i * 6, 0, -2 + (i % 2) * 6); box(5, 1.4, 1.6, 0x8a4a2a, 0, .9, 0, s); box(1.5, 1.4, 1.2, 0x7a3f22, -1, 2.2, 0, s); s.rotation.set(0, r() * 3, (r() - .5) * .4); }
      anim((t, dt) => { if (r() < dt * 8) puff(-20 + r() * 20, .4, -10 + r() * 20, 0xffffff, .4, .3, 3); }); tag('Кеме қаңқалары — құрғаған теңіз', V(-4, 4, 0)); tag('Тұзды шаң (NaCl, Na₂SO₄)', V(-10, 3, 10));
      return [V(-10, 2.5, 10), V(-4, 3, 0), V(10, 1.2, -14), V(6, 3, 6), V(-14, 3, -8)]; },
    baikonur(c) { ground(0xd9c99a); box(14, .6, 14, 0x8a96a8, 0, .3, 0); const rk = grp(0, .6, 0); cyl(.9, .9, 12, 0xffffff, 0, 6, 0, rk, 16); mesh(new THREE.ConeGeometry(.9, 2.6, 16), 0xffffff, 0, 13.3, 0, rk); for (let k = 0; k < 4; k++) mesh(new THREE.ConeGeometry(.5, 5, 10), 0xe8eef7, Math.cos(k * 1.57) * 1.3, 2.8, Math.sin(k * 1.57) * 1.3, rk);
      box(1, 16, 1, 0xd23a2f, 3, 8, 0); anim((t, dt) => { const u = t % 20; if (u > 12) { rk.position.y = .6 + Math.pow(u - 12, 2.2) * .5; for (let k = 0; k < 6; k++) flame(0, rk.position.y - .5, 0, 0xff6a1a, 1, 2, -6); if (r() < .4) puff((r() - .5) * 3, .8, (r() - .5) * 3, 0xffffff, 1, .8, 3); } else rk.position.y = .6; });
      tag('Отын: керосин + сұйық O₂', V(0, 16.5, 0)); tag('Ұшыру алаңы', V(6, 2, 6)); return [V(0, 10, 0), V(6, 1.6, 6), V(-6, 2, -6), V(3, 15, 0), V(-6, 2, 6)]; },
    altynEmel(c) { ground(0xd8b878); const dune = mesh(new THREE.SphereGeometry(10, 24, 12, 0, 6.3, 0, 1.2), M(0xf0c878, { flatShading: false }), 0, -3.6, -4); dune.scale.set(1.8, .9, 1);
      for (let i = 0; i < 7; i++) { const m = mountain(-24 + i * 8, -22, 6 + r() * 4, [0xe8e2d6, 0xd0603a, 0xe8b070][i % 3]); } anim((t, dt) => { if (r() < dt * 15) spark(-6 + r() * 12, 4, -4 + r() * 4, 2, .3, 0, 0xffe2a0, 1.5); });
      tag('Әнші бархан — кварц құмы (SiO₂)', V(0, 7, -4)); tag('Ақтау таулары — гипс, саз қабаттары', V(0, 9, -22)); return [V(0, 6, -4), V(-10, 1.5, 8), V(10, 1.5, 8), V(0, 8, -22), V(14, 2, -2)]; },
    astana(c) { ground(0x9cbf5a); box(60, .05, 3, 0x6b6f78, 0, .03, 6); const bt = grp(); cyl(.35, .7, 10, 0xffffff, 0, 5, 0, bt, 10); sph(1.3, M(0xffc83a, { flatShading: false, metalness: .2, roughness: .3, emissive: 0x6a4a00 }), 0, 11, 0, bt, 2);
      for (let i = 0; i < 8; i++) building(-20 + i * 5.5, -8 - (i % 2) * 3, 3, 4 + r() * 6, 3, 0xdfe8f5, 0x2f6fe8); mesh(new THREE.ConeGeometry(4, 9, 3), M(0xdff3ff, { transparent: true, opacity: .8 }), 14, 4.5, 8); forest(30, 0, 16, 10, leafy);
      tag('Бәйтерек', V(0, 13.2, 0)); tag('Хан Шатыр — ETFE полимері', V(14, 10, 8)); return [V(0, 11, 0), V(-10, 2, 16), V(14, 8, 8), V(-12, 8, -10), V(6, 2, 6)]; },
  };

  /* ---------- конфиг ---------- */
  const C = {
    U: { tpl: tplISR, ore: 0xc8e04a, prod: 'Сары кек' },
    Cr: { tpl: tplMine, ore: 0x2f3338, oreCss: '#9aa3ad', metal: 0xd9dde3, ext: ['furnace'], prod: 'Феррохром' },
    Fe: { tpl: tplPit, ore: 0x7a2f1a, metal: 0x8a8f99, ext: ['magsep', 'furnace'], prod: 'Темір кені жентегі' },
    Cu: { tpl: tplMine, ore: 0xd9783f, oreHex: 0x7dffb0, metal: 0xd9783f, ext: ['flotation', 'smelter', 'electro'], prod: 'Мыс катодтары' },
    Zn: { tpl: tplMine, ore: 0x9aa6b0, oreCss: '#cfe3ff', metal: 0xc8d0d8, ext: ['flotation', 'electro'], prod: 'Мырыш құймалары' },
    Pb: { tpl: tplMine, ore: 0x5d6470, oreCss: '#b8c4d4', metal: 0x7d8594, ext: ['flotation', 'furnace'], prod: 'Қорғасын құймалары' },
    Au: { tpl: tplPit, ore: 0x9a7a3a, metal: 0xffd447, ext: ['leach'], prod: 'Алтын құймалары' },
    Ag: { tpl: tplMine, ore: 0xb8bcc4, oreCss: '#ffffff', metal: 0xe8ecf2, ext: ['flotation'], prod: 'Күміс құймалары' },
    Mn: { tpl: tplPit, ore: 0x2c2a2e, metal: 0x9aa0a8, ext: ['furnace'], prod: 'Ферромарганец' },
    Al: { tpl: tplPit, ore: 0xb5502e, metal: 0xe1e6ec, ext: ['tanks', 'electro'], liq: 0xffd2b0, prod: 'Алюминий құймалары' },
    C: { tpl: tplPit, ore: 0x1d1d22, gr: 0xb79a6a, metal: 0x222228, ext: ['power'], prod: 'Көмір' },
    S: { tpl: tplOil, ext: ['sulfur'], plantTag: 'Газды H₂S-тен тазарту' },
    H: { tpl: tplOil, ext: ['gasplant', 'wind', 'solar', 'electrolyzer'], plantTag: 'Газ өңдеу зауыты' },
    P: { tpl: tplPit, ore: 0x7d7a70, metal: 0xffe27a, ext: ['furnace'], prod: 'Сары фосфор, тыңайтқыш' },
    Ti: { tpl: tplPlant, ore: 0x3a3f48, metal: 0xb8c0cc, ext: ['kroll', 'furnace'], prod: 'Титан губкасы' },
    Mg: { tpl: tplPlant, ore: 0xf2e2e2, metal: 0xdfe4ea, ext: ['electro', 'tanks'], prod: 'Магний құймалары' },
    Be: { tpl: tplPlant, ore: 0x9fd6b8, metal: 0xc8ccd2, ext: ['tanks', 'furnace'], liq: 0x9fffd0, prod: 'Бериллий' },
    Ta: { tpl: tplPlant, ore: 0x4a4f5a, metal: 0x9aa3b8, ext: ['tanks', 'furnace'], liq: 0xb0c8ff, prod: 'Тантал ұнтағы' },
    W: { tpl: tplPit, ore: 0x4a4f5a, metal: 0xaab2bd, ext: ['tanks'], prod: 'Вольфрам концентраты' },
    B: { tpl: tplSalt, ore: 0xf4f1e8, ext: ['tanks'], prod: 'Бор қышқылы' },
    Ni: { tpl: tplPlant, ore: 0x6a8f4a, metal: 0xc8ccd2, ext: ['tanks', 'furnace'], liq: 0x7dffb0, prod: 'Никель' },
    Co: { tpl: tplPlant, ore: 0x3a5fcd, metal: 0xb8c0d8, ext: ['tanks', 'electro'], liq: 0xff9ec0, prod: 'Кобальт' },
    Re: { tpl: tplMine, ore: 0x8a8f99, oreCss: '#7ee0ff', metal: 0xd0d6de, ext: ['flotation', 'tanks'], prod: 'Рений (мыстан қосымша)' },
    Si: { tpl: tplPlant, ore: 0xcfd6dd, metal: 0x8a96a8, ext: ['furnace', 'tanks'], prod: 'Ферросилиций' },
    Na: { tpl: tplSalt, ore: 0xffffff, prod: 'Ас тұзы' },
    K: { tpl: tplMine, ore: 0xe8a49a, oreCss: '#ffb3a6', metal: 0xffd2c8, soil: '#c8a070', ext: ['flotation'], prod: 'Калий тыңайтқышы' },
    Nd: { tpl: tplExplore, ore: 0xff8787 },
  };
  const MT = {
    pit: ['Ашық әдіс — карьер', 'Кен жер бетіне жақын жатқанда алып шұңқыр — карьер қазылады. Жынысты бұрғылап, жарады, экскаватор кенді самосвалға тиейді, ал самосвал оны спираль жолмен жоғары шығарады.'],
    mine: ['Жерасты әдісі — шахта', 'Кен терең жатса, жерге тік оқпан қазылады. Одан көлденең штректер кен желісіне дейін тартылады. Кенді вагонеткалар оқпанға жеткізеді, ал копёрдегі көтергіш оны жер бетіне шығарады.'],
    isr: ['Жерасты ұңғымалық шаймалау', 'Мұнда шахта да, карьер де қазылмайды. Айдау ұңғымаларымен жерге әлсіз қышқыл жіберіледі, ол уранды ерітеді, ал сору ұңғымалары ерітіндіні жер бетіне көтереді.'],
    oil: ['Ұңғыма және газды тазарту', 'Терең ұңғымалардан мұнай мен газ шығады. Зауытта газ күкіртсутектен тазартылады, ал одан Клаус әдісімен таза күкірт алынады.'],
    plant: ['Металлургиялық өңдеу', 'Кен концентраты зауытқа келеді. Оны ұсақтайды, қышқылда ерітеді, пеште балқытады немесе электролиз жасайды. Соңында таза металл алынады.'],
    salt: ['Тұзды көлден алу', 'Күн суды буландырады, көл түбінде тұз қабаты жиналады. Комбайн тұзды жинап, конвейермен үйінділерге апарады, кейін оны жуып, ұнтақтайды.'],
    offshore: ['Теңіздегі өндіру — жасанды арал', 'Таяз теңізде жасанды аралдар салынады. Олардан ұңғымалар бұрғыланып, мұнай мен газ құбырмен жағадағы зауытқа айдалады. Газдағы күкіртсутектен күкірт алынады.'],
    explore: ['Геологиялық барлау', 'Кен орнын өндіруден бұрын барлайды: ұңғымалар бұрғылап, керн үлгілерін алады және зертханада металдың мөлшерін анықтайды.'],
  };
  const TPLBY = { pit: tplPit, mine: tplMine, isr: tplISR, oil: tplOil, offshore: tplOffshore, plant: tplPlant, salt: tplSalt, explore: tplExplore };
  const TPLK = new Map([[tplPit, 'pit'], [tplMine, 'mine'], [tplISR, 'isr'], [tplOil, 'oil'], [tplPlant, 'plant'], [tplSalt, 'salt'], [tplExplore, 'explore']]);
  const DEP = {
    U: ['Шу-Сарысу уран кен орны', 'Әлемдегі ең ірі уран провинцияларының бірі. Уран құмды сулы қабатта жатыр, сондықтан оны шахтасыз, ұңғымалар арқылы ерітіп алады.', ['U']],
    Cr: ['Кемпірсай хромит кен орны', 'Әлемдегі ең бай хромит кендерінің бірі. Дон кен байыту комбинаты кенді терең шахталардан көтереді.', ['Cr', 'Ni', 'Co', 'Fe']],
    Fe: ['Соколов-Сарыбай темір кен орны', 'Рудный қаласы маңындағы алып карьерлер. Магнетит кені магнитпен байытылып, жентек болып балқытуға жіберіледі.', ['Fe', 'Mn']],
    Cu: ['Жезқазған мыс кен орны', 'Қазақстанның ең көне әрі ірі мыс кен орындарының бірі. Мыс кенінен күміс пен сирек металл рений де бөліп алынады. Кен орнын зерттеуге Қаныш Сәтбаев зор үлес қосқан.', ['Cu', 'Ag', 'Re', 'Pb', 'Zn'], 'Ұлытау облысы'],
    Zn: ['Риддер-Сокол полиметалл кен орны', 'Алтайдағы полиметалл кені: бір кеннің өзінде мырыш, қорғасын, мыс, күміс пен алтын бар. Кен шахтадан алынып, флотациямен бөлінеді.', ['Zn', 'Pb', 'Cu', 'Ag', 'Au']],
    Pb: ['Кентау-Ащысай қорғасын кен орындары', 'Қаратау жотасындағы қорғасын-мырыш кендері. Кен жер астынан шахта арқылы алынып, Шымкентте балқытылған.', ['Pb', 'Zn', 'Ag']],
    Au: ['Васильков алтын кен орны', 'Қазақстандағы ең ірі алтын кен орны. Алтын кеннің ішінде өте ұсақ түйіршік болып шашыраған, сондықтан оны ерітінді арқылы бөліп алады.', ['Au', 'Ag']],
    Ag: ['Риддер күміс-полиметалл кендері', 'Күміс жеке кен орнынан емес, полиметалл кендерінен қосымша өнім ретінде алынады.', ['Ag', 'Zn', 'Pb', 'Cu']],
    Mn: ['Жәйрем марганец кен орны', 'Қазақстан марганецінің негізгі көзі. Кен ашық карьерде қазылып, ферроқорытпа зауыттарына жіберіледі.', ['Mn', 'Fe', 'Pb', 'Zn']],
    Al: ['Торғай боксит кен орындары', 'Боксит — алюминий кені. Ол Павлодарда глиноземге айналып, электролиз арқылы алюминийге өңделеді.', ['Al', 'Fe']],
    C: ['Екібастұз көмір бассейні', 'Әлемдегі ең ірі көмір разрездерінің бірі — «Богатырь». Көмір ашық әдіспен қазылып, электр станцияларына жіберіледі.', ['C', 'S']],
    S: ['Теңіз мұнай-газ кен орны', 'Теңіз мұнайында күкіртсутек көп. Газды тазартқанда одан таза сары күкірт алынады, оның блоктары алып пирамидалардай.', ['S', 'H', 'C']],
    H: ['Қарашығанақ газ конденсат кен орны', 'Мұнда табиғи газ бен конденсат өндіріледі. Ал жел мен күн энергиясымен судан жасыл сутек алу жобалары дамып келеді.', ['H', 'S', 'C']],
    P: ['Қаратау фосфорит бассейні', 'Фосфорит карьерде қазылып, Таразда сары фосфор мен тыңайтқышқа өңделеді. Фосфор — өсімдіктердің негізгі қорегі.', ['P']],
    Ti: ['Өскемен титан-магний комбинаты', 'Әлемдегі губкалы титан өндіретін санаулы зауыттардың бірі. Титан Кролль әдісімен магний арқылы тотықсыздандырылады.', ['Ti', 'Mg']],
    Mg: ['Өскемен титан-магний комбинаты', 'Магний карналлиттен электролиз арқылы алынады және титан өндірісінде тотықсыздандырғыш ретінде жұмсалады.', ['Mg', 'Ti']],
    Be: ['Үлбі металлургия зауыты', 'Бериллий, тантал және уран отынын шығаратын бірегей зауыт. Металдар қышқылдарда ерітіліп, тазартылады.', ['Be', 'Ta', 'U']],
    Ta: ['Үлбі металлургия зауыты', 'Тантал — ең төзімді металдардың бірі. Оны концентраттан қышқылмен ерітіп, тазартып, ұнтақ түрінде алады.', ['Ta', 'Be', 'U']],
    W: ['Жоғарғы Қайрақты вольфрам кен орны', 'Әлемдегі ең ірі вольфрам кен орындарының бірі. Кен ашық карьерде қазылып, концентратқа байытылады.', ['W']],
    B: ['Индер бор кен орны', 'Индер тұз күмбезі мен көлінде бор минералдары кездеседі. Бор қышқылын химиялық өңдеу арқылы алады.', ['B', 'Na', 'K']],
    Ni: ['Кемпірсай никель-кобальт кен орны', 'Үгілу қабығындағы кендерден никель мен кобальт қышқылмен шаймалау арқылы алынады.', ['Ni', 'Co', 'Fe']],
    Co: ['Кемпірсай никель-кобальт кен орны', 'Кобальт никельмен бірге кездеседі. Ол электромобиль аккумуляторлары үшін өте маңызды.', ['Co', 'Ni', 'Fe']],
    Re: ['Жезқазған рений өндірісі', 'Рений — ең сирек металдардың бірі. Ол мыс кенін балқытқанда газдан қосымша өнім ретінде ұсталып қалады.', ['Re', 'Cu']],
    Si: ['Ақсу ферроқорытпа зауыты', 'Әлемдегі ең ірі ферроқорытпа зауыттарының бірі. Кварц пен темір электр пештерінде балқытылып, ферросилиций алынады.', ['Si', 'Fe', 'Cr', 'Mn']],
    Na: ['Арал маңы тұзды көлдері', 'Жақсықылыш көлінің түбінде қалың тұз қабаты бар. Тұз көлден жиналып, жуылып, йодталады.', ['Na']],
    K: ['Сатымола калий тұздары кен орны', 'Ежелгі теңіздің қалдығы — калий тұздары. Олар шахта арқылы алынып, тыңайтқышқа айналады.', ['K', 'Na', 'Mg']],
    Nd: ['Қарағанды сирек жер металдары кен орны', 'Жаңа ашылған сирек жер металдары кен орны. Қазір геологиялық барлау жүріп жатыр: бұрғылап, керн үлгілерін зертханада зерттейді.', ['Nd']],
  };
  function depInfo(kind, id, focusEl) {
    if (kind === 'dep') { const d = DEPO[id], s0 = focusEl && EL[focusEl] ? focusEl : d.main, e = EL[s0], m = MT[d.type] || MT.plant;
      return { name: d.name, region: d.region, desc: d.desc, els: d.els, method: m[0], mText: m[1], img: e.imgs[0], cap: `${e.name.split(' (')[0]} (${e.s}) — осы кен орнының ${s0 === d.main ? 'басты' : ''} элементі`.replace('  ', ' '), main: s0, cube: d.main }; }
    if (kind === 'el') { const e = EL[id], d = DEP[id] || [e.place, e.fact, [id]], m = MT[TPLK.get((C[id] || {}).tpl) || 'plant'];
      return { name: d[0], region: d[3] || e.region, desc: d[1], els: d[2], method: m[0], mText: m[1], img: e.imgs[0], cap: `${e.name.split(' (')[0]} (${e.s}) — осы кен орнының басты элементі`, main: id }; }
    const p = PL[id]; return { name: p.name, region: p.sub, desc: p.geo || p.bio, els: p.els || [], method: 'Химиялық құпиясы', mText: p.chem, img: p.imgs[0], cap: p.name, main: (p.els || []).find(s => EL[s]) };
  }
  const MATCH = [[/флотац/i, /Флотация/], [/электролиз|электролит/i, /Электролиз/], [/магнит/i, /Магниттік/], [/Кролль|TiCl/i, /Кролль/],
    [/балқыт|пеш|домна|қорыт|пиромет/i, /Пеш|балқыту|Кролль/], [/шайма|цианид|ерітіп|ерітінді|сорыл/i, /Шаймалау|Үйінділік|Сору|Сулы қабат/], [/айда|H₂SO₄|қышқыл/i, /Айдау|Шаймалау/],
    [/ұңғыма|бұрғыла/i, /Бұрғылау|Айдау|Барлау/], [/ұсақта|байыт|концентрат/i, /Байыту|Ұсақтау/], [/Клаус|күкіртсутек|H₂S/i, /Клаус|H₂S/], [/блок|сары күкірт/i, /күкірт блоктары/],
    [/сары кек|U₃O₈/i, /Сары кек|сары кек/], [/карьер|қазыл|шахта|жару|экскаватор/i, /Экскаватор|Штрек|Оқпан|Жару/], [/тасы|самосвал|вагонетка|көтер/i, /Самосвал|Вагонетка|Копёр/],
    [/буланд|күн/i, /Күн/], [/жина|комбайн/i, /комбайн/], [/керн|барлау/i, /Керн|Барлау/], [/талда|зертхана/i, /Зертхана/], [/газ/i, /Газ|сфера/], [/жел|сутек/i, /Электролизер|Жел/]];
  const introSay = d => `${d.name}. ${d.desc} ${d.method}. ${d.mText}`;
  const elSteps = e => e.mining.map((s, i) => ({ title: s.replace(/[:.].*$/, '').slice(0, 42), text: s }));
  const PL_TITLES = [['chem', '🧪 Химия'], ['bio', '🌿 Биология'], ['vit', '💊 Витаминдер'], ['geo', '🌍 География'], ['phys', '⚛️ Физика']];
  const plSteps = p => PL_TITLES.filter(([k]) => p[k]).map(([k, t]) => ({ title: t, text: p[k] }));

  /* ---------- оң жақ панель ---------- */
  let xrOK = false;
  function renderInfo(kind, id, d) {
    const b = $i('vrInfoBody'); const chip = s => EL[s] ? `<button class="vchip ${s === d.main ? 'on' : ''}" data-chip="${s}"><i style="background:${CAT[EL[s].cat].c}"></i><b>${s}</b>${EL[s].name.split(' (')[0]}</button>` : `<span class="vchip dim"><b>${s}</b></span>`;
    b.innerHTML = `${d.img ? `<figure class="vi-photo"><img src="${d.img[0]}" alt="${d.cap}" referrerpolicy="no-referrer" onerror="this.parentNode.style.display='none'"><figcaption>${d.cap}<small>Фото: Wikimedia Commons · ${d.img[1]}</small></figcaption></figure>` : ''}
      <h2 class="vi-name">${d.name}</h2><div class="vi-reg">📍 ${d.region}</div>
      <div class="vi-acts"><button class="btn sm gold" id="vrIntro">🔊 Гидті тыңдау</button><button class="btn sm" data-exc="drone">🚁 Дронмен экскурсия</button><button class="btn sm" data-exc="car">🚗 Электрокармен</button></div>
      <div class="vi-chips">${d.els.map(chip).join('')}</div>
      <p class="vi-desc">${d.desc} ${sayBtn(d.desc)}</p>
      <div class="vi-method"><h4>${kind !== 'place' ? '⛏' : '🧪'} ${d.method}</h4><p>${d.mText}</p>
        <div class="row"><button class="btn sm primary" id="vrPlay">▶ ${kind !== 'place' ? 'Өндіру процесін көрсету' : 'Барлық нүктелерді көрсету'}</button><button class="btn sm" id="vrXR" ${xrOK ? '' : 'hidden'}>👓 VR көзілдірігі</button></div></div>
      <details class="vi-pass" id="vrPassD"><summary>📘 <span id="vrPassT"></span></summary><div id="vrPassGo"></div><div id="vrPass"></div></details>`;
    $i('vrPlay').onclick = () => play(); $i('vrXR').onclick = enterXR;
    $i('vrIntro').onclick = () => { playGen++; Guide.say(introSay(d), { display: `<b>${d.name}</b> — ${d.desc}` }); };
    b.querySelectorAll('[data-exc]').forEach(x => x.onclick = () => excursion(x.dataset.exc));
    b.querySelectorAll('[data-chip]').forEach(x => x.onclick = () => { b.querySelectorAll('.vchip').forEach(y => y.classList.toggle('on', y === x)); passport(x.dataset.chip, true); });
    passport(kind === 'el' ? id : kind === 'dep' ? d.main : null, false); $i('vrPassD').open = true; b.scrollTop = 0; }
  function passport(s, openIt) { const box = $i('vrPass'), D = $i('vrPassD');
    if (s && EL[s]) { renderElement(EL[s], box, true); $i('vrPassT').textContent = `Элемент паспорты: ${EL[s].name.split(' (')[0]} (${s})`;
      $i('vrPassGo').innerHTML = cur && EL_DEP[s] && !(cur.kind === 'dep' && cur.id === EL_DEP[s]) ? `<button class="btn sm gold" id="vrGoEl">🌀 ${s} кен орнына VR-саяхат</button>` : '';
      const g = $i('vrGoEl'); if (g) g.onclick = () => go2('dep', EL_DEP[s], s); }
    else if (cur && cur.kind === 'place') { renderPlace(PL[cur.id], box, true); $i('vrPassT').textContent = 'Толық ақпарат: биология, витаминдер, география, физика'; $i('vrPassGo').innerHTML = ''; }
    box.querySelectorAll('.close').forEach(x => x.remove());
    if (openIt) { D.open = true; fold(false); setTimeout(() => D.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); if (s && EL[s]) Guide.say(elSay(EL[s])); } }
  function go2(kind, id, f) { const v = $i('vr'); v.classList.add('swap'); setTimeout(() => { open(kind, id, f); v.classList.remove('swap'); }, 320); }
  function nav(dir) { if (!cur) return; const list = cur.kind === 'dep' ? DEPOSITS.map(d => d.id) : cur.kind === 'el' ? ELEMENTS.map(e => e.s) : PLACES.map(p => p.id); const i = list.indexOf(cur.id); go2(cur.kind, list[(i + dir + list.length) % list.length]); }
  // сахнадағы элемент кубы
  let cubeObj = null;
  function sceneCube(s, pos) { if (!s || !EL[s] || typeof World === 'undefined' || !World.tileTex) return; const e = EL[s]; const t = World.tileTex(e);
    const m = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.4), new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .4, roughness: .35 })); m.position.copy(pos); m.castShadow = true; root.add(m);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot(), color: new THREE.Color(CAT[e.cat].c), transparent: true, opacity: .7, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.setScalar(7); halo.position.copy(pos); root.add(halo);
    anim(t => { m.rotation.y += .01; m.position.y = pos.y + Math.sin(t * 1.5) * .3; halo.position.y = m.position.y; });
    const el = document.createElement('button'); el.className = 'vcube'; el.innerHTML = `<b>${s}</b>${e.name.split(' (')[0]} — басып ашыңыз`; el.onclick = ev => { ev.stopPropagation(); cubeClick(); }; $i('vrSpots').appendChild(el);
    tags.push({ el, pos: pos.clone().add(V(0, -2, 0)), cube: true }); cubeObj = { m, s }; }
  function cubeClick() { if (!cubeObj) return; playGen++; $i('vrInfoBody').querySelectorAll('.vchip').forEach(y => y.classList.toggle('on', y.dataset.chip === cubeObj.s)); passport(cubeObj.s, true); }

  /* ---------- ашу / жабу ---------- */
  function init() { if (ok !== null) return ok; const cv = $i('vrCanvas');
    try { R = new THREE.WebGLRenderer({ canvas: cv, antialias: true }); } catch (e) { return ok = false; }
    R.setPixelRatio(Math.min(2, devicePixelRatio)); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene(); scene.background = new THREE.Color(0xa8d8ff); scene.fog = new THREE.Fog(0xa8d8ff, 60, 130);
    cam = new THREE.PerspectiveCamera(48, 1, .1, 400); ctl = new THREE.OrbitControls(cam, cv); ctl.enableDamping = true; ctl.dampingFactor = .08; ctl.maxPolarAngle = 1.5; ctl.minDistance = 4; ctl.maxDistance = 80; ctl.autoRotateSpeed = .5;
    ctl.addEventListener('start', () => { fly = null; autoSpin = false; ctl.autoRotate = false; playGen++; });
    scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x6a5a40, .7)); const sun = new THREE.DirectionalLight(0xfff1d6, .85); sun.position.set(-25, 40, 20); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 5, far: 120 }); sun.shadow.bias = -.0006; scene.add(sun);
    clock = new THREE.Clock(); addEventListener('resize', resize);
    // WebXR (VR көзілдірігі)
    if (navigator.xr && navigator.xr.isSessionSupported) navigator.xr.isSessionSupported('immersive-vr').then(s => { xrOK = !!s; const x = $i('vrXR'); if (x && s) x.hidden = false; }).catch(() => {});
    $i('vrBack').onclick = () => { close(); }; $i('vrFold').onclick = () => fold(); $i('vrPrev').onclick = () => nav(-1); $i('vrNext').onclick = () => nav(1);
    const ray = new THREE.Raycaster(), mv = new THREE.Vector2(); let dn = null;
    cv.addEventListener('pointerdown', e => dn = [e.clientX, e.clientY]);
    cv.addEventListener('pointerup', e => { if (!dn || !cubeObj || Math.hypot(e.clientX - dn[0], e.clientY - dn[1]) > 6) return; const rc = cv.getBoundingClientRect(); mv.set((e.clientX - rc.left) / rc.width * 2 - 1, -(e.clientY - rc.top) / rc.height * 2 + 1); ray.setFromCamera(mv, cam); if (ray.intersectObject(cubeObj.m).length) cubeClick(); });
    addEventListener('keydown', e => { if (!open_ || /INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) return; if (e.key === 'ArrowRight') nav(1); if (e.key === 'ArrowLeft') nav(-1); });
    return ok = true; }
  function resize() { if (!open_) return; const w = innerWidth, h = innerHeight; R.setSize(w, h, false); cam.aspect = w / h; const folded = $i('vr').classList.contains('folded'); const sh = (!folded && w > 700) ? Math.min(460, w * .42) / 2 : 0; if (sh) cam.setViewOffset(w, h, sh, 0, w, h); else cam.clearViewOffset(); cam.updateProjectionMatrix(); }
  function fold(v) { const vr = $i('vr'); const f = v === undefined ? !vr.classList.contains('folded') : v; vr.classList.toggle('folded', f); document.body.classList.toggle('vr-folded', f); $i('vrFold').innerHTML = f ? '▸ <span>Ақпарат</span>' : '◂'; $i('vrFold').title = f ? 'Ақпаратты ашу' : 'Ақпаратты жасыру'; try { localStorage.setItem('aigid_vrfold', f ? '1' : '0'); } catch (e) {} resize(); }
  function clear() { if (!root) return; scene.remove(root); root.traverse(o => { if (o.geometry) o.geometry.dispose(); const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; ms.forEach(m => { if (m.map && m.map !== dotTex) m.map.dispose(); m.dispose(); }); });
    root = null; anims = []; spots = []; veh = null; vehStep = null; tags = []; $i('vrSpots').innerHTML = ''; curSpot = -1; }
  function open(kind, id, focusEl) {
    if (!init()) return false; clear(); cubeObj = null; r = rnd(id.length * 977 + id.charCodeAt(0)); root = new THREE.Group(); scene.add(root); makePool(); makePuffs(); STEP_ANCH.cube = null;
    let view, steps, title, sub;
    if (kind === 'dep') { const d = DEPO[id], c = Object.assign({}, C[d.main] || {}); c.tpl = TPLBY[d.type] || tplPlant; if (d.ext) c.ext = d.ext; if (d.type === 'offshore') c.ext = []; STEP_ANCH.list = []; view = c.tpl(c); steps = elSteps(EL[d.main]); }
    else if (kind === 'el') { const e = EL[id], c = Object.assign({}, C[id] || { tpl: tplPlant }); STEP_ANCH.list = []; view = c.tpl(c); steps = elSteps(e); title = `${e.s} · ${e.name}`; sub = e.method; }
    else { const p = PL[id]; const f = PLACE_TPL[id]; STEP_ANCH.list = f ? f({}) : []; view = STEP_ANCH.list.view || { t: V(0, 2, 0), p: V(24, 16, 28) }; steps = plSteps(p); title = `${p.icon} ${p.name}`; sub = p.sub; }
    backdrop(kind === 'place' && !['aral', 'baikonur', 'bozzhyra', 'turkistan', 'caspian', 'altynEmel'].includes(id));
    const A = STEP_ANCH.list, used = new Set();
    steps.forEach((s, i) => { let pos = null;
      if (kind !== 'place') for (const [sr, tr] of MATCH) { if (!sr.test(s.text)) continue; const tg = tags.find(o => !o.cube && !used.has(o) && tr.test(o.text)); if (tg) { used.add(tg); tg.hide = true; pos = tg.pos.clone(); break; } }
      spot(i, s.title, s.text, pos || (A[i] || A[A.length - 1] || V(0, 3, 0)).clone()); });
    if (innerWidth < 700) view = { t: view.t, p: view.t.clone().add(view.p.clone().sub(view.t).multiplyScalar(1.8)), front: view.front };
    cur = { kind, id, view, front: view.front, focus: focusEl }; const dI = depInfo(kind, id, focusEl);
    $i('vrTitle').textContent = dI.name; $i('vrSub').textContent = `${dI.method} · ${dI.region}`;
    const cp = STEP_ANCH.cube || V(view.t.x - 10, 9, view.t.z - 2); sceneCube(dI.cube || dI.main, cp);
    const vEl = kind === 'el' ? id : kind === 'dep' ? dI.main : null; if (vEl && addTo('visited', vEl)) addXP(10, `${EL[vEl].name} элементі паспортқа қосылды!`); if (kind === 'place' && addTo('places', id)) addXP(8, `${PL[id].name} зерттелді!`);
    document.body.classList.add('vr-open'); $i('vr').classList.add('open'); open_ = true; resize();
    cam.position.copy(view.p).multiplyScalar(1.6); ctl.target.copy(view.t); flyTo(view.t, view.p, 1800); autoSpin = true; ctl.autoRotate = false; setTimeout(() => { if (autoSpin && open_) ctl.autoRotate = true; }, 2000);
    let f = false; try { f = localStorage.getItem('aigid_vrfold') === '1'; } catch (e) {} fold(f || innerWidth < 700);
    renderInfo(kind, id, dI); stepCard(); cancelAnimationFrame(raf); clock.getDelta(); loop();
    playGen++; Guide.stop(); toast('🔊 «Гидті тыңдау» батырмасымен түсіндірмені қосыңыз · 🚁 / 🚗 — экскурсия');
    return true; }
  function close() { if (!open_) return; open_ = false; playGen++; cancelAnimationFrame(raf); if (R.xr && R.xr.isPresenting) R.xr.getSession().end(); document.body.classList.remove('vr-open'); $i('vr').classList.remove('open'); Guide.stop(); setTimeout(() => { if (!open_) clear(); }, 50); }
  function loop() { if (!open_) return; raf = requestAnimationFrame(loop); frame(); }
  function frame() { const dt = Math.min(.05, clock.getDelta()), t = clock.elapsedTime; anims.forEach(f => f(t, dt)); if (vehStep) vehStep(dt); stepPool(dt); stepPuffs(dt); stepFly(); ctl.update(); R.render(scene, cam); project(); }
  async function enterXR() { try { const s = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor'] }); R.xr.enabled = true; R.xr.setReferenceSpaceType('local-floor'); await R.xr.setSession(s);
      root.scale.setScalar(.12); root.position.set(0, .9, -3); cancelAnimationFrame(raf); R.setAnimationLoop(frame);
      s.addEventListener('end', () => { R.setAnimationLoop(null); R.xr.enabled = false; if (root) { root.scale.setScalar(1); root.position.set(0, 0, 0); } if (open_) loop(); }); } catch (e) { toast('VR көзілдірігі табылмады'); } }
  // аудио жинау үшін
  window.VR_NARR = () => [VR_DONE.drone, VR_DONE.car, ...ELEMENTS.flatMap(e => e.mining), ...PLACES.flatMap(p => plSteps(p).map(s => s.text)), ...ELEMENTS.map(e => introSay(depInfo('el', e.s))), ...DEPOSITS.map(d => introSay(depInfo('dep', d.id))), ...DEPOSITS.map(d => d.desc), ...PLACES.map(p => introSay(depInfo('place', p.id))), ...ELEMENTS.map(e => (DEP[e.s] || [])[1]).filter(Boolean), ...PLACES.map(p => depInfo('place', p.id).desc)];
  return { open, close, get isOpen() { return open_; }, get ok() { return init(); } };
})();
