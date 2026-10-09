/* Scripted "ghost hand" for ?demo previews and automated tests.
   It produces MediaPipe-shaped landmarks, so the real gesture code runs on it. */

// Open right hand, wrist at origin, image coords (y down), roughly unit hand length.
export const TEMPLATE = [[0, 0], [-0.08, -0.05], [-0.14, -0.1], [-0.18, -0.15], [-0.21, -0.2], [-0.06, -0.2], [-0.07, -0.29], [-0.075, -0.35], [-0.08, -0.4],
  [0, -0.21], [0, -0.31], [0, -0.38], [0, -0.44], [0.05, -0.2], [0.06, -0.29], [0.065, -0.35], [0.07, -0.4], [0.1, -0.17], [0.12, -0.24], [0.13, -0.29], [0.14, -0.33]];

const mix = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

/** wx, wy: wrist position on *screen* (0..1). Returns un-mirrored MediaPipe-style landmarks. */
export function synthHand(wx, wy, pinch = 0, snap = 0, scale = 0.5, aspect = 16 / 9) {
  const p = TEMPLATE.map(([x, y]) => ({ x: (x * scale) / aspect, y: y * scale }));
  if (pinch > 0) {
    const m = mix(p[4], p[8], 0.5);
    p[4] = mix(p[4], m, pinch); p[8] = mix(p[8], m, pinch); p[7] = mix(p[7], m, pinch * 0.5); p[3] = mix(p[3], m, pinch * 0.4);
  }
  if (snap > 0) {
    const m = mix(p[4], p[12], 0.55);
    p[4] = mix(p[4], m, snap); p[12] = mix(p[12], m, snap); p[11] = mix(p[11], m, snap * 0.5);
    for (const i of [16, 15, 20, 19]) p[i] = mix(p[i], p[0], snap * 0.45);
  }
  return p.map((q) => ({ x: 1 - (wx + q.x), y: wy + q.y, z: 0 }));
}

// [time s, pointer target ([x,y] or 'o0'..'o2' = memory orb), pinch 0..1, snap 0..1]
export const TIMELINE = [
  [0, [1.1, 0.75], 0, 0], [1.2, [0.58, 0.6], 0, 0], [2.6, [0.58, 0.6], 0, 0],
  [3.6, 'o0', 0, 0], [4.0, 'o0', 1, 0], [5.3, [0.38, 0.5], 1, 0], [6.6, [0.38, 0.5], 1, 0], [7.0, [0.42, 0.55], 0, 0],
  [8.2, 'o2', 0, 0], [8.6, 'o2', 1, 0], [10.2, [0.66, 0.5], 1, 0], [10.6, [0.62, 0.58], 0, 0],
  [11.6, [0.56, 0.62], 0, 0], [12.2, [0.56, 0.62], 0, 1], [12.5, [0.56, 0.6], 0, 0],
  [13.6, [0.56, 0.6], 0, 0], [15.2, [0.56, 0.6], 0, 0], [16.2, 'o1', 0, 0], [16.6, 'o1', 1, 0], [18.4, [0.46, 0.48], 1, 0], [18.8, [0.48, 0.52], 0, 0],
  [19.8, [0.56, 0.62], 0, 0], [20.4, [0.56, 0.62], 0, 1], [20.7, [0.58, 0.64], 0, 0], [22, [1.1, 0.75], 0, 0],
];
export const DEMO_LENGTH = 22;

const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/**
 * @param t seconds into the loop
 * @param resolveOrb (index) => [x,y] screen position of that orb, or null
 * @returns { landmarks, snapKey } : snapKey is set while a scripted snap segment is active
 */
export function demoFrame(t, resolveOrb, aspect) {
  t = ((t % DEMO_LENGTH) + DEMO_LENGTH) % DEMO_LENGTH;
  let a = TIMELINE[0], b = TIMELINE[TIMELINE.length - 1];
  for (let i = 0; i < TIMELINE.length - 1; i++) if (t >= TIMELINE[i][0] && t < TIMELINE[i + 1][0]) { a = TIMELINE[i]; b = TIMELINE[i + 1]; break; }
  const res = (k) => (typeof k === 'string' ? resolveOrb(+k[1]) || [0.5, 0.5] : k);
  const pa = res(a[1]), pb = res(b[1]);
  const u = ease((t - a[0]) / Math.max(0.001, b[0] - a[0]));
  const px = pa[0] + (pb[0] - pa[0]) * u, py = pa[1] + (pb[1] - pa[1]) * u;
  const pinch = a[2] + (b[2] - a[2]) * u, snap = a[3] + (b[3] - a[3]) * u;
  // Place the wrist so the pinch point (between thumb and index tips) lands on the target.
  const probe = synthHand(0, 0, pinch, snap, 0.5, aspect);
  const offX = (1 - probe[4].x + 1 - probe[8].x) / 2, offY = (probe[4].y + probe[8].y) / 2;
  return { landmarks: synthHand(px - offX, py - offY, pinch, snap, 0.5, aspect), snapKey: a[3] === 1 ? a[0] : null };
}
