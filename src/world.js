/* The 3D world: particle hills, gradient sky, sun, floating dust and memory orbs. */
import * as THREE from 'three';
import { buildSetPiece, disposeSetPiece } from './setpieces.js';

// Memory orbs float low, below the chapter title band (which fills the top ~40% of the screen).
// Spread evenly across the screen for 3 to 5 memories.
function orbHome(i, n) {
  const u = n === 1 ? 0 : i / (n - 1) - 0.5;          // -0.5 .. 0.5
  return new THREE.Vector3(u * (n > 3 ? 34 : 28), -0.6 - Math.cos(u * Math.PI) * 1.6, -2 + Math.cos(u * Math.PI) * 6 - 3);
}

export class World {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
    this.camera.position.set(0, 6, 34);
    this.fog = new THREE.FogExp2(0x000000, 0.018);
    this.scene.fog = this.fog;
    this.colors = { sky0: new THREE.Color(), sky1: new THREE.Color(), ground: new THREE.Color(), accent: new THREE.Color(), sun: new THREE.Color() };
    this.target = { sky0: new THREE.Color(), sky1: new THREE.Color(), ground: new THREE.Color(), accent: new THREE.Color(), sun: new THREE.Color() };
    this.orbs = [];
    this.grabbed = null;
    this._v = new THREE.Vector3();
    this._buildSky();
    this._buildHills();
    this._buildDust();
    this.orbGroup = new THREE.Group();
    this.scene.add(this.orbGroup);
  }

  _buildSky() {
    this.skyU = { top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() }, glow: { value: new THREE.Color() }, wake: { value: 0 } };
    this.scene.add(new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false, uniforms: this.skyU,
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `uniform vec3 top; uniform vec3 bottom; uniform vec3 glow; uniform float wake; varying vec3 vP;
        void main(){ float h = clamp(vP.y*1.6+.25,0.,1.);
          vec3 c = mix(bottom, top, h);
          float g = exp(-pow(length(vec2(vP.x*1.2, vP.y-0.05))*3.2, 2.)) * (0.25 + wake*0.9);
          c += glow*g;
          gl_FragColor = vec4(c*(0.55+wake*0.55),1.); }`,
    })));
    this.sunMat = new THREE.SpriteMaterial({ map: glowTex(), color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    this.sun = new THREE.Sprite(this.sunMat);
    this.sun.scale.set(70, 70, 1);
    this.sun.position.set(0, -6, -150);
    this.scene.add(this.sun);
  }

  _buildHills() {
    const small = innerWidth < 700;
    const GX = small ? 110 : 170, GZ = small ? 80 : 110;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(GX * GZ * 3);
    this.hillBase = new Float32Array(GX * GZ * 3);
    for (let i = 0; i < GX; i++) for (let j = 0; j < GZ; j++) {
      const k = (i * GZ + j) * 3;
      const x = (i / GX - 0.5) * 190 + (Math.random() - 0.5) * 0.6;
      const z = -j * (137 / GZ) + 18 + (Math.random() - 0.5) * 0.6;
      pos[k] = this.hillBase[k] = x;
      pos[k + 2] = this.hillBase[k + 2] = z;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.hills = geo;
    this.hillMat = new THREE.PointsMaterial({ size: small ? 0.3 : 0.22, color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, map: dotTex() });
    this.scene.add(new THREE.Points(geo, this.hillMat));
  }

  _buildDust() {
    const N = 1400, geo = new THREE.BufferGeometry(), p = new Float32Array(N * 3);
    this.dustSpeed = new Float32Array(N);
    for (let i = 0; i < N; i++) { p[i * 3] = (Math.random() - 0.5) * 120; p[i * 3 + 1] = Math.random() * 40 - 4; p[i * 3 + 2] = -Math.random() * 120 + 20; this.dustSpeed[i] = Math.random(); }
    geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
    this.dust = geo;
    this.dustMat = new THREE.PointsMaterial({ size: 0.35, color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, map: dotTex() });
    this.scene.add(new THREE.Points(geo, this.dustMat));
  }

  setChapter(chapter, instant) {
    this.target.sky0.set(chapter.sky[0]); this.target.sky1.set(chapter.sky[1]);
    this.target.ground.set(chapter.ground); this.target.accent.set(chapter.accent); this.target.sun.set(chapter.sun);
    if (instant) for (const k in this.target) this.colors[k].copy(this.target[k]);
    this.grabbed = null;
    this._buildOrbs(chapter);
    if (this.piece) { this.scene.remove(this.piece.group); disposeSetPiece(this.piece); }
    this.piece = buildSetPiece(chapter.scene, chapter.accent);
    if (this.piece) this.scene.add(this.piece.group);
  }

  _buildOrbs(chapter) {
    for (const o of this.orbs) o.traverse((n) => { n.geometry?.dispose(); n.material?.dispose(); });
    this.orbGroup.clear();
    this.orbs = [];
    const acc = new THREE.Color(chapter.accent);
    chapter.memories.forEach((mem, i) => {
      const g = new THREE.Group();
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 2), new THREE.MeshBasicMaterial({ color: acc.clone().lerp(new THREE.Color(0xffffff), 0.55) }));
      const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 1), new THREE.MeshBasicMaterial({ color: acc, wireframe: true, transparent: true, opacity: 0.35 }));
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: acc, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
      halo.scale.set(9, 9, 1);
      const ring = new THREE.Mesh(new THREE.RingGeometry(2.4, 2.5, 64), new THREE.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
      g.add(halo, shell, core, ring);
      const home = orbHome(i, chapter.memories.length);
      g.position.copy(home);
      g.scale.setScalar(0.001);
      g.userData = { i, mem, home: home.clone(), target: home.clone(), shell, ring, halo, collected: false, seed: Math.random() * 10 };
      this.orbGroup.add(g);
      this.orbs.push(g);
    });
  }

  /** Screen position in CSS pixels. */
  screenOf(obj) {
    obj.getWorldPosition(this._v).project(this.camera);
    return { x: ((this._v.x + 1) / 2) * innerWidth, y: ((1 - this._v.y) / 2) * innerHeight };
  }

  /** Nearest orb to a screen point (CSS px) within radius, or null. */
  pick(px, py, radius) {
    let best = null, bd = radius;
    for (const o of this.orbs) { const s = this.screenOf(o); const d = Math.hypot(s.x - px, s.y - py); if (d < bd) { bd = d; best = o; } }
    return best;
  }

  release() {
    if (!this.grabbed) return;
    this.grabbed.userData.target.copy(this.grabbed.userData.home);
    this.grabbed = null;
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.baseFov = w < 700 ? 68 : 55;
    this.camera.fov = this.baseFov;
    this.camera.updateProjectionMatrix();
  }

  /** s: { wake 0..1, awake, transition 0..1, pointer {x,y,seen}, smooth {x,y} } */
  update(s, dt, t) {
    const c = this.colors;
    const k = 1 - Math.exp(-dt * 2.2);
    for (const key in this.target) c[key].lerp(this.target[key], k);
    this.skyU.top.value.copy(c.sky0); this.skyU.bottom.value.copy(c.sky1); this.skyU.glow.value.copy(c.sun); this.skyU.wake.value = s.wake;
    this.fog.color.copy(c.sky1).multiplyScalar(0.5 + s.wake * 0.3);
    this.hillMat.color.copy(c.ground).multiplyScalar(0.55 + s.wake * 0.75);
    this.dustMat.color.copy(c.accent); this.dustMat.opacity = 0.25 + s.wake * 0.45;
    this.sunMat.color.copy(c.sun); this.sunMat.opacity = 0.25 + s.wake * 0.75;
    this.sun.position.y = -14 + s.wake * 16;
    this.renderer.setClearColor(c.sky1);

    if (!s.reducedMotion || !this._hillsDrawn) {
      const pa = this.hills.attributes.position.array, hb = this.hillBase, amp = 0.6 + s.wake * 0.4;
      for (let i = 0; i < pa.length; i += 3) pa[i + 1] = hillHeight(hb[i], hb[i + 2], s.reducedMotion ? 0 : t) * amp;
      this.hills.attributes.position.needsUpdate = true;
      this._hillsDrawn = true;
    }
    if (!s.reducedMotion) {
      const dp = this.dust.attributes.position.array;
      for (let i = 0; i < this.dustSpeed.length; i++) { dp[i * 3 + 1] += dt * (0.3 + this.dustSpeed[i] * 0.6); if (dp[i * 3 + 1] > 36) dp[i * 3 + 1] = -4; }
      this.dust.attributes.position.needsUpdate = true;
    }

    this.piece?.update(s.reducedMotion ? 0 : dt, s.reducedMotion ? 0 : t, s.wake);

    // Camera drifts toward where the hand points.
    const cam = this.camera;
    const lx = s.pointer.seen ? s.smooth.x - 0.5 : 0, ly = s.pointer.seen ? s.smooth.y - 0.5 : 0;
    const ck = 1 - Math.exp(-dt * 1.5);
    cam.position.x += (lx * 10 - cam.position.x) * ck;
    cam.position.y += (6 - ly * 4 - cam.position.y) * ck;
    cam.position.z = 34 - s.transition * 26;
    cam.fov += (this.baseFov + s.transition * 30 - cam.fov) * 0.2;
    cam.updateProjectionMatrix();
    cam.lookAt(0, 3, -10);

    for (const o of this.orbs) {
      const u = o.userData, held = this.grabbed === o;
      if (held) {
        const dir = this._v.set(s.smooth.x * 2 - 1, -(s.smooth.y * 2 - 1), 0.5).unproject(cam).sub(cam.position).normalize();
        u.target.copy(cam.position).addScaledVector(dir, 21);
      }
      o.position.lerp(u.target, 1 - Math.exp(-dt * (held ? 8 : 2.5)));
      if (!s.reducedMotion) o.position.y += Math.sin(t * 1.1 + u.seed) * 0.006;
      const sc = held ? 1.1 : s.awake ? 1 : 0.55;
      o.scale.setScalar(o.scale.x + (sc - o.scale.x) * (1 - Math.exp(-dt * 4)));
      if (!s.reducedMotion) { u.shell.rotation.x += dt * 0.4; u.shell.rotation.y += dt * 0.55; }
      u.ring.lookAt(cam.position);
      u.ring.material.opacity = u.collected ? 0.95 : 0.35 + 0.2 * Math.sin(t * 2 + u.seed);
      u.halo.material.opacity = (held ? 1 : 0.55 + 0.3 * Math.sin(t * 1.6 + u.seed)) * (0.4 + s.wake * 0.6);
    }
    this.renderer.render(this.scene, cam);
  }
}

function hillHeight(x, z, t) {
  return 2.2 * Math.sin(x * 0.07 + 0.5) * Math.cos(z * 0.05) + 3.4 * Math.sin(x * 0.025 + z * 0.03) + 1.1 * Math.sin(x * 0.18 + t * 0.25) * Math.sin(z * 0.12 + t * 0.2) - 6;
}

let _glow, _dot;
function radialTexture(size, stops) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d'), r = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, a] of stops) r.addColorStop(o, `rgba(255,255,255,${a})`);
  g.fillStyle = r; g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
function glowTex() { return (_glow ||= radialTexture(128, [[0, 1], [0.2, 0.55], [0.5, 0.12], [1, 0]])); }
function dotTex() { return (_dot ||= radialTexture(32, [[0, 1], [0.4, 0.6], [1, 0]])); }
