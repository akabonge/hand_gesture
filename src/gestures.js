/* Pure gesture math. No DOM, no Three.js, so it runs in Node tests.
   Landmarks follow MediaPipe's 21-point hand model in normalized image
   coordinates (x to the right of the *camera image*, y down). */

export const WRIST = 0, THUMB_TIP = 4, INDEX_PIP = 6, INDEX_TIP = 8, MIDDLE_MCP = 9,
  MIDDLE_PIP = 10, MIDDLE_TIP = 12, RING_PIP = 14, RING_TIP = 16, PINKY_PIP = 18, PINKY_TIP = 20;

export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Wrist to middle-finger knuckle: a scale reference so thresholds work near and far. */
export const handSize = (lm) => dist(lm[WRIST], lm[MIDDLE_MCP]) || 0.1;

export const pinchRatio = (lm) => dist(lm[THUMB_TIP], lm[INDEX_TIP]) / handSize(lm);
export const snapRatio = (lm) => dist(lm[THUMB_TIP], lm[MIDDLE_TIP]) / handSize(lm);

/** Four fingers extended (tip farther from wrist than its middle joint) and thumb apart. */
export function isOpenPalm(lm) {
  const extended = [[INDEX_TIP, INDEX_PIP], [MIDDLE_TIP, MIDDLE_PIP], [RING_TIP, RING_PIP], [PINKY_TIP, PINKY_PIP]]
    .every(([tip, pip]) => dist(lm[tip], lm[WRIST]) > dist(lm[pip], lm[WRIST]) * 1.12);
  return extended && pinchRatio(lm) > 0.6;
}

/** Screen-space pointer (0..1): midpoint of thumb and index tips, mirrored like a selfie. */
export const pointerFrom = (lm) => ({ x: 1 - (lm[THUMB_TIP].x + lm[INDEX_TIP].x) / 2, y: (lm[THUMB_TIP].y + lm[INDEX_TIP].y) / 2 });

/** Pinch with hysteresis so the grab doesn't flicker at the threshold. */
export function createPinchTracker({ on = 0.32, off = 0.5 } = {}) {
  let pinching = false;
  return (ratio) => {
    let event = null;
    if (!pinching && ratio < on) { pinching = true; event = 'start'; }
    else if (pinching && ratio > off) { pinching = false; event = 'end'; }
    return { pinching, event };
  };
}

/** Mean magnitude of the 2.2-9 kHz band, where a finger snap's crack lives. */
export function highBandEnergy(freq, sampleRate, fftSize, lo = 2200, hi = 9000) {
  const binHz = sampleRate / fftSize;
  const a = Math.max(0, Math.floor(lo / binHz)), b = Math.min(freq.length, Math.floor(hi / binHz));
  if (b <= a) return 0;
  let e = 0;
  for (let i = a; i < b; i++) e += freq[i];
  return e / (b - a);
}

/**
 * Snap = sudden high-frequency burst AND (when a hand is tracked) the thumb touched the
 * middle finger within `poseWindow` ms before. Requiring both rejects keyboard clicks,
 * desk taps and claps. Without hand tracking, a much louder burst is required.
 */
export function createSnapDetector({ cooldown = 900, poseWindow = 600, floor = 70, ratio = 2.6, strictFloor = 110, strictRatio = 4 } = {}) {
  let avg = 0, last = -Infinity;
  return ({ energy, now, armedAt = -Infinity, requirePose = true }) => {
    const prev = avg;
    avg = avg * 0.95 + energy * 0.05;
    const onset = energy > Math.max(floor, prev * ratio);
    if (!onset || now - last < cooldown) return false;
    const poseOk = now - armedAt < poseWindow;
    const ok = requirePose ? poseOk : (poseOk || energy > Math.max(strictFloor, prev * strictRatio));
    if (ok) last = now;
    return ok;
  };
}

/**
 * Silent snap, used when there's no microphone: thumb holds against the middle finger,
 * then flicks apart quickly. Returns true on the frame the flick is recognized.
 */
export function createPoseSnap({ touch = 0.3, release = 0.65, minHold = 80, maxFlick = 260, cooldown = 900 } = {}) {
  let touchStart = -1, lastTouch = -Infinity, last = -Infinity;
  return (ratio, now) => {
    if (ratio < touch) {
      if (touchStart < 0) touchStart = now;
      lastTouch = now;
      return false;
    }
    const held = touchStart >= 0 ? lastTouch - touchStart : 0;
    const fired = touchStart >= 0 && ratio > release && held >= minHold && now - lastTouch <= maxFlick && now - last > cooldown;
    if (fired) last = now;
    if (fired || now - lastTouch > maxFlick) touchStart = -1;
    return fired;
  };
}

/** Distance between two hands' palm centres, in units of average hand size. */
export function handsApart(a, b) {
  return dist(a[MIDDLE_MCP], b[MIDDLE_MCP]) / ((handSize(a) + handSize(b)) / 2);
}

/**
 * Two-hand "spread": hands come together, then move apart quickly -> 'open'.
 * Apart, then brought together quickly -> 'close'.
 */
export function createSpreadDetector({ together = 2.2, apart = 4.5, window = 1100, cooldown = 1200 } = {}) {
  let togetherAt = -Infinity, apartAt = -Infinity, last = -Infinity;
  return (ratio, now) => {
    let event = null;
    if (ratio < together) {
      if (now - apartAt < window && now - last > cooldown) { event = 'close'; last = now; }
      togetherAt = now; apartAt = -Infinity;
    } else if (ratio > apart) {
      if (now - togetherAt < window && now - last > cooldown) { event = 'open'; last = now; }
      apartAt = now; togetherAt = -Infinity;
    }
    return event;
  };
}
