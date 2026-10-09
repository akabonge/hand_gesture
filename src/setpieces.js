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

/** Kampala: a flock of grey crowned cranes gliding over the hills. */
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
  return {
    group,
    update(dt, t, wake) {
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

export const SET_PIECES = { cranes, river, houses, doors, network, dawn };

export function buildSetPiece(name, accent) {
  const make = SET_PIECES[name];
  return make ? make(accent) : null;
}

/** Free GPU memory when a set piece leaves the stage. */
export function disposeSetPiece(piece) {
  piece?.group.traverse((n) => { n.geometry?.dispose(); n.material?.dispose(); });
}
