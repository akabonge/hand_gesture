/* One cinematic set piece per chapter. Each builder returns { group, update(dt, t, wake) }.
   wake (0..1) is how far the chapter has "woken up": set pieces rise / brighten with it. */
import * as THREE from 'three';

const add = THREE.AdditiveBlending;
let _dot;
/** Soft round sprite so points render as glowing dots, not squares. */
function dot() {
  if (_dot) return _dot;
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const g = c.getContext('2d'), r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,.6)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 32, 32);
  return (_dot = new THREE.CanvasTexture(c));
}
const pointsMat = (color, size, extra = {}) => new THREE.PointsMaterial({ color, size, map: dot(), transparent: true, blending: add, depthWrite: false, ...extra });
const lineMat = (color, opacity = 0.8) => new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: add, depthWrite: false });


/* ---- Ugandan wildlife, Minecraft-style: blocky 3D animals built from lit boxes ---- */
const voxMats = new Map();
const voxMat = (color) => { if (!voxMats.has(color)) voxMats.set(color, new THREE.MeshLambertMaterial({ color, flatShading: true, fog: false })); return voxMats.get(color); };
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
function box(parent, color, [w, h, d], [x, y, z], rotZ = 0) {
  const m = new THREE.Mesh(boxGeo, voxMat(color));
  m.scale.set(w, h, d); m.position.set(x, y, z); m.rotation.z = rotZ;
  parent.add(m); return m;
}
/** A leg that swings from the hip: pivot at (x, hipY, z), box hangs down by len. */
function voxLeg(parent, color, x, hipY, z, len, w, legs, hoof) {
  const pivot = new THREE.Group(); pivot.position.set(x, hipY, z);
  box(pivot, color, [w, len, w], [0, -len / 2, 0]);
  if (hoof) box(pivot, hoof, [w * 1.05, w * 0.6, w * 1.05], [0, -len + w * 0.3, 0]);
  parent.add(pivot); legs.push(pivot);
}

function voxAnimal(kind) {
  const g = new THREE.Group(), legs = [];
  if (kind === 'elephant') {
    const c = 0x8c8c94, dk = 0x6e6e78;
    box(g, c, [3.4, 2.3, 2.1], [0, 3.1, 0]);
    box(g, c, [1.5, 1.5, 1.6], [2.2, 3.6, 0]);
    box(g, dk, [0.25, 1.7, 1.2], [1.6, 3.6, 1.05]); box(g, dk, [0.25, 1.7, 1.2], [1.6, 3.6, -1.05]); // ears
    box(g, c, [0.5, 1.2, 0.5], [3.05, 2.7, 0]); box(g, c, [0.45, 1.0, 0.45], [3.15, 1.7, 0]);      // trunk
    box(g, 0xf4efe4, [0.7, 0.18, 0.18], [3.0, 2.9, 0.45]); box(g, 0xf4efe4, [0.7, 0.18, 0.18], [3.0, 2.9, -0.45]); // tusks
    box(g, dk, [0.15, 0.9, 0.15], [-1.75, 2.9, 0], 0.3);                                           // tail
    for (const [x, z] of [[-1.1, 0.6], [-1.1, -0.6], [1.1, 0.6], [1.1, -0.6]]) voxLeg(g, c, x, 2.0, z, 2.0, 0.75, legs, dk);
  } else if (kind === 'giraffe') {
    const c = 0xe0ad4f, spot = 0x8a4b1e;
    box(g, c, [2.3, 1.2, 1.0], [0, 3.6, 0]);
    box(g, c, [0.55, 3.2, 0.55], [1.15, 5.4, 0], -0.32);                                           // neck
    box(g, c, [1.0, 0.55, 0.55], [1.85, 7.0, 0]);                                                   // head
    box(g, spot, [0.12, 0.35, 0.12], [1.6, 7.45, 0.15]); box(g, spot, [0.12, 0.35, 0.12], [1.6, 7.45, -0.15]); // ossicones
    for (const [x, y] of [[-0.7, 3.8], [0.1, 3.4], [0.7, 3.9], [-0.2, 4.0]]) { box(g, spot, [0.4, 0.35, 0.05], [x, y, 0.52]); box(g, spot, [0.4, 0.35, 0.05], [x, y, -0.52]); }
    for (const y of [4.6, 5.4, 6.1]) { box(g, spot, [0.25, 0.3, 0.05], [1.15 + (y - 5.4) * 0.33, y, 0.29]); }
    box(g, spot, [0.12, 0.8, 0.12], [-1.2, 3.3, 0], 0.4);
    for (const [x, z] of [[-0.8, 0.32], [-0.8, -0.32], [0.8, 0.32], [0.8, -0.32]]) voxLeg(g, c, x, 3.05, z, 3.0, 0.3, legs, spot);
  } else if (kind === 'lion') {
    const c = 0xd6a457, mane = 0x7a4718;
    box(g, c, [2.2, 1.0, 1.0], [0, 1.9, 0]);
    box(g, mane, [1.0, 1.4, 1.4], [1.15, 2.3, 0]);
    box(g, c, [0.8, 0.8, 0.8], [1.6, 2.3, 0]);
    box(g, 0x3a2410, [0.25, 0.2, 0.3], [2.05, 2.15, 0]);                                          // nose
    box(g, c, [0.12, 0.9, 0.12], [-1.3, 2.0, 0], 0.7); box(g, mane, [0.25, 0.25, 0.25], [-1.6, 1.6, 0]); // tail
    for (const [x, z] of [[-0.8, 0.32], [-0.8, -0.32], [0.75, 0.32], [0.75, -0.32]]) voxLeg(g, c, x, 1.45, z, 1.4, 0.32, legs);
  } else { // Uganda kob: the antelope on Uganda's coat of arms
    const c = 0xb8642a, belly = 0xf2e6d2, horn = 0x2a1a10;
    box(g, c, [1.7, 0.8, 0.65], [0, 2.1, 0]);
    box(g, belly, [1.4, 0.2, 0.62], [0, 1.72, 0]);
    box(g, c, [0.32, 1.0, 0.32], [0.85, 2.7, 0], -0.4);
    box(g, c, [0.65, 0.38, 0.38], [1.25, 3.2, 0]);
    box(g, horn, [0.08, 0.8, 0.08], [1.05, 3.75, 0.12], 0.25); box(g, horn, [0.08, 0.8, 0.08], [1.05, 3.75, -0.12], 0.25);
    for (const [x, z] of [[-0.6, 0.22], [-0.6, -0.22], [0.6, 0.22], [0.6, -0.22]]) voxLeg(g, c, x, 1.75, z, 1.75, 0.16, legs, horn);
  }
  g.userData.legs = legs;
  return g;
}

function wildlife() {
  const group = new THREE.Group(), herd = [];
  group.add(new THREE.HemisphereLight(0xfff0dc, 0x5a3820, 2.2));
  const sun = new THREE.DirectionalLight(0xffd2a8, 2.4); sun.position.set(-30, 40, 60); group.add(sun);
  const kinds = [['elephant', 1.15, 1.0], ['giraffe', 1.0, 1.5], ['kob', 1.0, 2.4], ['lion', 1.0, 1.9], ['kob', 0.9, 2.3], ['elephant', 0.9, 1.1], ['giraffe', 0.85, 1.4]];
  kinds.forEach(([k, sc, speed], i) => {
    const a = voxAnimal(k);
    a.scale.setScalar(sc * 1.9);
    a.position.set(-75 + i * 24 + Math.random() * 5, -6.6, -22 - (i % 3) * 6);
    a.userData.speed = speed; a.userData.phase = Math.random() * 6;
    group.add(a); herd.push(a);
  });
  return {
    group,
    update(dt, t, wake) {
      for (const a of herd) {
        const v = a.userData.speed * (0.45 + wake * 0.55);
        a.position.x += dt * v;
        if (a.position.x > 85) a.position.x = -85;
        const step = t * v * 1.6 + a.userData.phase;
        a.userData.legs.forEach((l, k) => { l.rotation.z = Math.sin(step + (k === 0 || k === 3 ? 0 : Math.PI)) * 0.35; });
        a.position.y = -6.6 + Math.abs(Math.sin(step)) * 0.1;
      }
    },
  };
}

/** Kampala: grey crowned cranes over the hills, with blocky elephants, giraffes, kob and a lion walking below. */
function cranes(accent) {
  const group = new THREE.Group(), birds = [];
  for (let i = 0; i < 16; i++) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(15), 3));
    const bird = new THREE.Line(geo, lineMat(i === 0 ? 0xffffff : accent, 0.9));
    // V formation
    const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1;
    bird.userData = { ox: -row * 2.6, oy: row * 0.5 * side * 0 + (Math.random() - 0.5) * 0.4, oz: side * row * 2.2, phase: Math.random() * 6, size: 0.9 + Math.random() * 0.3 };
    group.add(bird); birds.push(bird);
  }
  group.position.set(-70, 16, -55);
  const flock = group, scene = new THREE.Group(), herd = wildlife();
  scene.add(flock, herd.group);
  return {
    group: scene,
    update(dt, t, wake) {
      herd.update(dt, t, wake);
      group.position.x += dt * 6.5;
      if (group.position.x > 80) group.position.x = -80;
      group.position.y = 15 + Math.sin(t * 0.3) * 1.5;
      for (const b of birds) {
        const u = b.userData, f = Math.sin(t * 4 + u.phase) * 0.7, s = u.size, p = b.geometry.attributes.position.array;
        // left wing tip, elbow, body, elbow, right wing tip
        const pts = [[-1.6, f * 0.9, -0.2], [-0.7, f * 0.35 + 0.15, 0], [0, 0, 0], [0.7, f * 0.35 + 0.15, 0], [1.6, f * 0.9, -0.2]];
        pts.forEach(([x, y, z], k) => { p[k * 3] = u.ox + z * s; p[k * 3 + 1] = u.oy + y * s; p[k * 3 + 2] = u.oz + x * s; });
        b.geometry.attributes.position.needsUpdate = true;
        b.material.opacity = 0.25 + wake * 0.7;
      }
    },
  };
}

/** Fredericksburg: the Rappahannock flowing through, and a plane drawing the 23-hour crossing. */
function river(accent) {
  const group = new THREE.Group(), N = 3200, pos = new Float32Array(N * 3), seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) seeds[i] = Math.random();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = pointsMat(accent, 0.32, { opacity: 0.8 });
  group.add(new THREE.Points(geo, mat));
  const plane = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const trailGeo = new THREE.BufferGeometry(), TN = 120, trail = new Float32Array(TN * 3);
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trail, 3));
  const trailLine = new THREE.Line(trailGeo, lineMat(0xffffff, 0.5));
  group.add(plane, trailLine);
  const arc = (u) => new THREE.Vector3(70 - u * 140, 10 + Math.sin(u * Math.PI) * 12, -70 + u * 20);
  return {
    group,
    update(dt, t, wake) {
      for (let i = 0; i < N; i++) {
        const u = (seeds[i] + t * 0.018) % 1, z = 4 - u * 110;
        const x = Math.sin(z * 0.045) * 16 + Math.sin(z * 0.11) * 4 + (seeds[(i * 7) % N] - 0.5) * 5;
        pos[i * 3] = x; pos[i * 3 + 1] = -5.2 + Math.sin(t * 2 + i) * 0.08; pos[i * 3 + 2] = z;
      }
      geo.attributes.position.needsUpdate = true;
      mat.opacity = 0.25 + wake * 0.6;
      const u = (t * 0.045) % 1;
      plane.position.copy(arc(u));
      for (let k = 0; k < TN; k++) { const p = arc(Math.max(0, u - k * 0.004)); trail[k * 3] = p.x; trail[k * 3 + 1] = p.y; trail[k * 3 + 2] = p.z; }
      trailGeo.attributes.position.needsUpdate = true;
      trailLine.material.opacity = 0.15 + wake * 0.5;
    },
  };
}

/** Habitat: twelve wireframe homes rising from the ground, one at a time. */
function houses(accent) {
  const group = new THREE.Group(), homes = [];
  const box = new THREE.EdgesGeometry(new THREE.BoxGeometry(3, 2.2, 2.6));
  const roofShape = new THREE.BufferGeometry();
  roofShape.setAttribute('position', new THREE.Float32BufferAttribute([
    -1.6, 1.1, -1.4, 0, 2.4, -1.4, 0, 2.4, -1.4, 1.6, 1.1, -1.4, -1.6, 1.1, 1.4, 0, 2.4, 1.4, 0, 2.4, 1.4, 1.6, 1.1, 1.4, 0, 2.4, -1.4, 0, 2.4, 1.4], 3));
  for (let i = 0; i < 12; i++) {
    const h = new THREE.Group();
    h.add(new THREE.LineSegments(box, lineMat(accent, 0.9)), new THREE.LineSegments(roofShape, lineMat(0xffffff, 0.9)));
    const col = i % 6, row = Math.floor(i / 6);
    h.position.set((col - 2.5) * 9 + (row ? 4 : 0), -4.2, -22 - row * 12 - Math.abs(col - 2.5) * 2);
    h.rotation.y = (Math.random() - 0.5) * 0.6;
    h.scale.set(1, 0.001, 1);
    h.userData.delay = i * 0.12;
    group.add(h); homes.push(h);
  }
  return {
    group,
    update(dt, t, wake) {
      for (const h of homes) {
        const target = Math.min(1, Math.max(0.001, (wake - h.userData.delay * 0.5) * 1.6));
        h.scale.y += (target - h.scale.y) * (1 - Math.exp(-dt * 3));
      }
    },
  };
}

/** Open doors: glowing doorframes down a path; each opens as the chapter wakes. */
function doors(accent) {
  const group = new THREE.Group(), list = [];
  const frame = new THREE.EdgesGeometry(new THREE.BoxGeometry(3.2, 6, 0.3));
  for (let i = 0; i < 5; i++) {
    const d = new THREE.Group();
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(3, 5.8), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, blending: add, depthWrite: false, side: THREE.DoubleSide }));
    const pivot = new THREE.Group(); pivot.position.x = -1.5;
    const panel = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3, 5.8, 0.1)), lineMat(0xffffff, 0.7));
    panel.position.x = 1.5; pivot.add(panel);
    d.add(new THREE.LineSegments(frame, lineMat(accent, 0.95)), glow, pivot);
    d.position.set(Math.sin(i * 1.3) * 8, -2.2, -14 - i * 13);
    d.userData = { glow, pivot, delay: i * 0.15 };
    group.add(d); list.push(d);
  }
  return {
    group,
    update(dt, t, wake) {
      for (const d of list) {
        const open = Math.min(1, Math.max(0, (wake - d.userData.delay) * 1.5));
        d.userData.pivot.rotation.y = -open * 1.25;
        d.userData.glow.material.opacity = open * (0.45 + 0.15 * Math.sin(t * 2 + d.position.z));
      }
    },
  };
}

/** The builder: a neural-network constellation with signals travelling along its edges. */
function network(accent) {
  const group = new THREE.Group(), N = 46, nodes = [];
  for (let i = 0; i < N; i++) nodes.push(new THREE.Vector3((Math.random() - 0.5) * 70, 6 + Math.random() * 22, -30 - Math.random() * 50));
  const edges = [];
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (nodes[i].distanceTo(nodes[j]) < 15) edges.push([i, j]);
  const ep = new Float32Array(edges.length * 6);
  edges.forEach(([a, b], k) => { nodes[a].toArray(ep, k * 6); nodes[b].toArray(ep, k * 6 + 3); });
  const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(ep, 3));
  const lines = new THREE.LineSegments(eg, lineMat(accent, 0.3));
  const ng = new THREE.BufferGeometry().setFromPoints(nodes);
  const pts = new THREE.Points(ng, pointsMat(0xffffff, 1.1));
  const P = 40, pulsePos = new Float32Array(P * 3), pulses = [];
  for (let i = 0; i < P; i++) pulses.push({ e: Math.floor(Math.random() * edges.length), u: Math.random(), v: 0.3 + Math.random() * 0.6 });
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
  const pulsePts = new THREE.Points(pg, pointsMat(accent, 1.4));
  group.add(lines, pts, pulsePts);
  const tmp = new THREE.Vector3();
  return {
    group,
    update(dt, t, wake) {
      lines.material.opacity = 0.08 + wake * 0.35;
      pulsePts.material.opacity = wake;
      if (!edges.length) return;
      pulses.forEach((p, i) => {
        p.u += dt * p.v;
        if (p.u > 1) { p.u = 0; p.e = Math.floor(Math.random() * edges.length); }
        const [a, b] = edges[p.e];
        tmp.lerpVectors(nodes[a], nodes[b], p.u).toArray(pulsePos, i * 3);
      });
      pg.attributes.position.needsUpdate = true;
      group.rotation.y = Math.sin(t * 0.05) * 0.08;
    },
  };
}

/** Today: a starfield that gives way to sunrise, with the six chapters as a constellation. */
function dawn(accent) {
  const group = new THREE.Group(), N = 1800, sp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const th = Math.random() * Math.PI * 2, ph = Math.random() * 0.45 * Math.PI;
    sp[i * 3] = Math.cos(th) * Math.cos(ph) * 150; sp[i * 3 + 1] = Math.sin(ph) * 150 + 4; sp[i * 3 + 2] = -Math.abs(Math.sin(th) * Math.cos(ph) * 150);
  }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, pointsMat(0xffffff, 0.9, { fog: false }));
  const C = [[-24, 22], [-14, 27], [-4, 23], [6, 29], [16, 24], [25, 30]].map(([x, y]) => new THREE.Vector3(x, y, -60));
  const cl = new THREE.Line(new THREE.BufferGeometry().setFromPoints(C), lineMat(accent, 0.6));
  const cp = new THREE.Points(new THREE.BufferGeometry().setFromPoints(C), pointsMat(accent, 3));
  group.add(stars, cl, cp);
  return {
    group,
    update(dt, t, wake) {
      stars.material.opacity = 0.9 - wake * 0.55;
      cl.material.opacity = 0.2 + wake * 0.6;
      cp.material.size = 2.8 + Math.sin(t * 2) * 0.5;
      group.rotation.y = t * 0.004;
    },
  };
}


/** Canvas text as a camera-facing sprite (place names, music notes). */
function textSprite(text, color = '#ffffff', size = 64, font = 'Georgia, serif') {
  const c = document.createElement('canvas'), g = c.getContext('2d');
  g.font = `${size}px ${font}`;
  const w = Math.ceil(g.measureText(text).width) + 20;
  c.width = w; c.height = size * 1.4;
  g.font = `${size}px ${font}`; g.fillStyle = color; g.textBaseline = 'middle'; g.fillText(text, 10, c.height / 2);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  sp.scale.set(w / size * 2, c.height / size * 2, 1);
  return sp;
}

/** Buganda: a fire circle with Bakisimba dancers (stylized silhouettes) and drums. */
function dance(accent) {
  const group = new THREE.Group(), dancers = [];
  const FN = 600, fp = new Float32Array(FN * 3), fs = new Float32Array(FN);
  for (let i = 0; i < FN; i++) fs[i] = Math.random();
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fp, 3));
  const fire = new THREE.Points(fg, pointsMat(0xffa040, 0.9));
  fire.position.set(0, -4.5, -26);
  group.add(fire);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot(), color: 0xff7a2a, transparent: true, blending: add, depthWrite: false, opacity: 0.6 }));
  glow.scale.set(30, 30, 1); glow.position.set(0, -2, -26); group.add(glow);
  const mat = lineMat(accent, 0.95);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2, r = 11;
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(22 * 3), 3));
    const fig = new THREE.LineSegments(geo, mat);
    fig.position.set(Math.cos(a) * r, -4.6, -26 + Math.sin(a) * r * 0.6);
    fig.userData = { phase: i * 0.7, a };
    group.add(fig); dancers.push(fig);
  }
  for (let k = 0; k < 3; k++) {
    const drum = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.9 - k * 0.15, 0.7 - k * 0.1, 1.6 - k * 0.3, 12)), lineMat(0xffffff, 0.6));
    drum.position.set(-18 + k * 2.2, -4.2, -16); group.add(drum);
  }
  const head = (cx, cy) => { const pts = []; for (let k = 0; k < 6; k++) { const a1 = k / 6 * Math.PI * 2, a2 = (k + 1) / 6 * Math.PI * 2; pts.push([cx + Math.cos(a1) * 0.35, cy + Math.sin(a1) * 0.35], [cx + Math.cos(a2) * 0.35, cy + Math.sin(a2) * 0.35]); } return pts; };
  return {
    group,
    update(dt, t, wake) {
      for (let i = 0; i < FN; i++) {
        const u = (fs[i] + t * 0.6) % 1, a = fs[(i * 13) % FN] * Math.PI * 2, r = (1 - u) * 1.6 * fs[(i * 7) % FN];
        fp[i * 3] = Math.cos(a) * r; fp[i * 3 + 1] = u * 5; fp[i * 3 + 2] = Math.sin(a) * r;
      }
      fg.attributes.position.needsUpdate = true;
      fire.material.opacity = 0.35 + wake * 0.6; glow.material.opacity = 0.25 + wake * 0.5 + Math.sin(t * 9) * 0.04;
      const beat = t * (0.8 + wake * 1.4);
      for (const d of dancers) {
        const ph = beat * Math.PI * 2 + d.userData.phase, hip = Math.sin(ph) * 0.35 * (0.3 + wake), arm = Math.sin(ph + 1) * 0.5;
        const P = [
          [0 + hip, 0, -0.5, -1.6], [0 + hip, 0, 0.5, -1.6],          // legs
          [0, 1.5, 0 + hip, 0],                                         // spine (shoulders to hips)
          [0, 1.3, -0.9, 0.6 + arm], [0, 1.3, 0.9, 0.6 - arm],         // arms
          ...head(0, 2.0).map(([x, y], k, arr) => (k % 2 ? null : [x, y, arr[k + 1][0], arr[k + 1][1]])).filter(Boolean),
        ];
        const pa = d.geometry.attributes.position.array; pa.fill(0);
        P.forEach(([x1, y1, x2, y2], k) => { pa.set([x1, y1 + 1.6, 0, x2, y2 + 1.6, 0], k * 6); });
        d.geometry.attributes.position.needsUpdate = true;
        d.position.x = Math.cos(d.userData.a + t * 0.08) * 11; d.position.z = -26 + Math.sin(d.userData.a + t * 0.08) * 6.6;
        d.material.opacity = 0.3 + wake * 0.65;
      }
    },
  };
}

/** Off the clock: a night soccer pitch under floodlights, a ball looping between players' spots. */
function pitch(accent) {
  const group = new THREE.Group(), L = [];
  const seg = (x1, z1, x2, z2) => L.push(x1, 0, z1, x2, 0, z2);
  const W = 34, Z0 = -8, Z1 = -70, ZM = (Z0 + Z1) / 2;
  seg(-W, Z0, W, Z0); seg(W, Z0, W, Z1); seg(W, Z1, -W, Z1); seg(-W, Z1, -W, Z0); seg(-W, ZM, W, ZM);
  for (let k = 0; k < 48; k++) { const a1 = k / 48 * Math.PI * 2, a2 = (k + 1) / 48 * Math.PI * 2; seg(Math.cos(a1) * 7, ZM + Math.sin(a1) * 7, Math.cos(a2) * 7, ZM + Math.sin(a2) * 7); }
  for (const z of [Z0, Z1]) { const d = z === Z0 ? -1 : 1; seg(-14, z, -14, z + d * -9); seg(-14, z + d * -9, 14, z + d * -9); seg(14, z + d * -9, 14, z); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(L, 3));
  const lines = new THREE.LineSegments(lg, lineMat(0xffffff, 0.7)); lines.position.y = -4.6; group.add(lines);
  for (const [x, z] of [[-W - 4, Z0 - 2], [W + 4, Z0 - 2], [-W - 4, Z1 + 2], [W + 4, Z1 + 2]]) {
    const pole = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, -4.6, z), new THREE.Vector3(x, 16, z)]), lineMat(0xffffff, 0.5));
    const lamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot(), color: 0xffffff, transparent: true, blending: add, depthWrite: false }));
    lamp.scale.set(10, 10, 1); lamp.position.set(x, 16, z); group.add(pole, lamp);
  }
  const ball = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.8, 1)), lineMat(0xffffff, 1));
  group.add(ball);
  const spots = [[-12, -20], [10, -30], [-6, -48], [14, -56], [0, -38]];
  return {
    group,
    update(dt, t, wake) {
      const k = Math.floor(t / 1.6) % spots.length, u = (t / 1.6) % 1;
      const [x1, z1] = spots[k], [x2, z2] = spots[(k + 1) % spots.length];
      ball.position.set(x1 + (x2 - x1) * u, -3.8 + Math.sin(u * Math.PI) * 6, z1 + (z2 - z1) * u);
      ball.rotation.x += dt * 6; ball.rotation.z += dt * 3;
      lines.material.opacity = 0.2 + wake * 0.6;
    },
  };
}

/** Music: sweeping spotlights, a mirror ball and floating notes. */
function stage(accent) {
  const group = new THREE.Group(), cones = [], notes = [];
  [0xffd36b, 0xff6bd5, 0x7fd8ff, 0xffffff, 0xffd36b].forEach((c, i) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(5, 34, 24, 1, true), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.08, blending: add, depthWrite: false, side: THREE.DoubleSide }));
    cone.geometry.translate(0, -17, 0);
    const pivot = new THREE.Group(); pivot.position.set((i - 2) * 14, 26, -40); pivot.add(cone);
    pivot.userData.phase = i * 1.3; group.add(pivot); cones.push(pivot);
  });
  const ballMesh = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.4, 2)), lineMat(0xffffff, 0.7));
  ballMesh.position.set(0, 20, -40); group.add(ballMesh);
  for (let i = 0; i < 14; i++) {
    const n = textSprite(i % 2 ? '♪' : '♫', '#' + new THREE.Color(accent).getHexString(), 64);
    n.position.set((Math.random() - 0.5) * 60, Math.random() * 20 - 2, -20 - Math.random() * 30);
    n.userData = { v: 0.6 + Math.random() * 0.8, sway: Math.random() * 6 };
    group.add(n); notes.push(n);
  }
  return {
    group,
    update(dt, t, wake) {
      cones.forEach((p) => { p.rotation.z = Math.sin(t * 0.7 + p.userData.phase) * 0.45; p.rotation.x = Math.cos(t * 0.5 + p.userData.phase) * 0.2; p.children[0].material.opacity = 0.03 + wake * 0.1; });
      ballMesh.rotation.y += dt * 0.6;
      notes.forEach((n) => { n.position.y += dt * n.userData.v; n.position.x += Math.sin(t + n.userData.sway) * dt * 0.6; if (n.position.y > 24) n.position.y = -4; n.material.opacity = 0.2 + wake * 0.7; });
    },
  };
}

/** Faith: a stained-glass rose window pouring coloured light, and candles. */
function cathedral(accent) {
  const group = new THREE.Group(), panes = [];
  const jewels = [0xc0392b, 0x2e5eaa, 0xf1c40f, 0x27ae60, 0x8e44ad, 0xe67e22];
  const cx = 0, cy = 16, cz = -70;
  for (let ring = 0; ring < 2; ring++) {
    const n = ring ? 16 : 8, r0 = ring ? 5 : 1.2, r1 = ring ? 11 : 5;
    for (let k = 0; k < n; k++) {
      const geo = new THREE.RingGeometry(r0 + 0.15, r1 - 0.15, 6, 1, (k / n) * Math.PI * 2 + 0.02, (Math.PI * 2) / n - 0.04);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: jewels[(k + ring * 3) % jewels.length], transparent: true, opacity: 0.6, blending: add, depthWrite: false, side: THREE.DoubleSide }));
      m.position.set(cx, cy, cz); group.add(m); panes.push(m);
    }
  }
  const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CircleGeometry(11.4, 48)), lineMat(accent, 0.9)); frame.position.set(cx, cy, cz); group.add(frame);
  const rays = [];
  for (let i = 0; i < 6; i++) {
    const g = new THREE.PlaneGeometry(4, 60);
    const ray = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: jewels[i], transparent: true, opacity: 0.05, blending: add, depthWrite: false, side: THREE.DoubleSide }));
    ray.position.set(-8 + i * 3.2, cy - 22, cz + 26); ray.rotation.x = -0.75; ray.rotation.z = (i - 2.5) * 0.06;
    group.add(ray); rays.push(ray);
  }
  const C = 24, cp = new Float32Array(C * 3);
  for (let i = 0; i < C; i++) { cp[i * 3] = (i % 12 - 5.5) * 3; cp[i * 3 + 1] = -3.6; cp[i * 3 + 2] = -18 - Math.floor(i / 12) * 6; }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.BufferAttribute(cp, 3));
  const candles = new THREE.Points(cg, pointsMat(0xffd27a, 1.3));
  group.add(candles);
  return {
    group,
    update(dt, t, wake) {
      panes.forEach((m, i) => { m.material.opacity = (0.25 + wake * 0.55) * (0.85 + 0.15 * Math.sin(t * 0.8 + i)); });
      rays.forEach((r, i) => { r.material.opacity = (0.02 + wake * 0.07) * (0.7 + 0.3 * Math.sin(t * 0.5 + i)); });
      candles.material.size = 1.1 + Math.sin(t * 11) * 0.12 + Math.sin(t * 7.3) * 0.1;
      candles.material.opacity = 0.4 + wake * 0.6;
    },
  };
}

/** The road ahead: flight paths from home to Spain, Italy and across Europe. */
function journey(accent) {
  const group = new THREE.Group(), trails = [];
  const home = new THREE.Vector3(-34, 4, -30);
  const places = [['Spain', -6, 12, -55], ['Italy', 10, 16, -60], ['Europe', 26, 20, -64]];
  const hl = textSprite('Fredericksburg', '#ffffff', 48); hl.position.copy(home).add(new THREE.Vector3(0, 2.2, 0)); group.add(hl);
  for (const [name, x, y, z] of places) {
    const to = new THREE.Vector3(x, y, z), mid = home.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 14, 0));
    const curve = new THREE.QuadraticBezierCurve3(home, mid, to);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), lineMat(accent, 0.35));
    const label = textSprite(name, '#' + new THREE.Color(accent).getHexString(), 64); label.position.copy(to).add(new THREE.Vector3(0, 2.6, 0));
    const pin = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot(), color: accent, transparent: true, blending: add, depthWrite: false })); pin.scale.set(5, 5, 1); pin.position.copy(to);
    const dotsGeo = new THREE.BufferGeometry(); dotsGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(8 * 3), 3));
    const movers = new THREE.Points(dotsGeo, pointsMat(0xffffff, 1));
    group.add(line, label, pin, movers); trails.push({ curve, line, label, pin, movers });
  }
  return {
    group,
    update(dt, t, wake) {
      trails.forEach((tr, i) => {
        const a = tr.movers.geometry.attributes.position.array;
        for (let k = 0; k < 8; k++) tr.curve.getPoint(((t * 0.12 + k / 8 + i * 0.1) % 1)).toArray(a, k * 3);
        tr.movers.geometry.attributes.position.needsUpdate = true;
        tr.line.material.opacity = 0.1 + wake * 0.5; tr.label.material.opacity = 0.3 + wake * 0.7;
        tr.pin.scale.setScalar(4 + Math.sin(t * 2 + i) * 0.8);
      });
    },
  };
}

export const SET_PIECES = { cranes, dance, river, houses, doors, network, pitch, stage, cathedral, journey, dawn };

export function buildSetPiece(name, accent) {
  const make = SET_PIECES[name];
  return make ? make(accent) : null;
}

/** Free GPU memory when a set piece leaves the stage. */
export function disposeSetPiece(piece) {
  piece?.group.traverse((n) => { n.geometry?.dispose(); n.material?.dispose(); });
}
