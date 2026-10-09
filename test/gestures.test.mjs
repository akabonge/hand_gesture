import test from 'node:test';
import assert from 'node:assert/strict';
import { synthHand } from '../src/demo.js';
import { pinchRatio, snapRatio, isOpenPalm, pointerFrom, createPinchTracker, createSnapDetector, createPoseSnap, highBandEnergy } from '../src/gestures.js';

test('open hand reads as an open palm, not a pinch or snap', () => {
  const lm = synthHand(0.5, 0.7);
  assert.equal(lm.length, 21);
  assert.ok(isOpenPalm(lm));
  assert.ok(pinchRatio(lm) > 0.6);
  assert.ok(snapRatio(lm) > 0.3);
});

test('pinch pose is detected and is not an open palm', () => {
  const lm = synthHand(0.5, 0.7, 1, 0);
  assert.ok(pinchRatio(lm) < 0.32);
  assert.ok(!isOpenPalm(lm));
});

test('snap pose touches thumb to middle finger', () => {
  assert.ok(snapRatio(synthHand(0.5, 0.7, 0, 1)) < 0.3);
});

test('thresholds are scale-invariant (hand near vs far from camera)', () => {
  for (const scale of [0.25, 0.5, 0.9]) {
    assert.ok(isOpenPalm(synthHand(0.5, 0.7, 0, 0, scale)));
    assert.ok(pinchRatio(synthHand(0.5, 0.7, 1, 0, scale)) < 0.32);
  }
});

test('pointer is mirrored like a selfie', () => {
  const p = pointerFrom(synthHand(0.3, 0.7));
  assert.ok(p.x > 0.15 && p.x < 0.35, `x=${p.x}`);
});

test('pinch tracker has hysteresis', () => {
  const track = createPinchTracker();
  assert.equal(track(0.9).event, null);
  assert.equal(track(0.3).event, 'start');
  assert.equal(track(0.4).pinching, true); // between thresholds: still pinching
  assert.equal(track(0.55).event, 'end');
});

test('snap detector needs the pose when a hand is tracked', () => {
  const det = createSnapDetector();
  for (let t = 0; t < 1000; t += 16) det({ energy: 20, now: t, requirePose: true });
  assert.equal(det({ energy: 150, now: 1100, armedAt: -Infinity, requirePose: true }), false, 'keyboard click without pose');
  assert.equal(det({ energy: 150, now: 2200, armedAt: 2000, requirePose: true }), true, 'real snap');
  assert.equal(det({ energy: 150, now: 2400, armedAt: 2300, requirePose: true }), false, 'cooldown');
});

test('snap detector without tracking demands a louder burst', () => {
  const det = createSnapDetector();
  for (let t = 0; t < 1000; t += 16) det({ energy: 30, now: t, requirePose: false });
  assert.equal(det({ energy: 90, now: 1100, requirePose: false }), false);
  assert.equal(det({ energy: 160, now: 2200, requirePose: false }), true);
});

test('silent flick-snap: hold touch, then flick apart', () => {
  const flick = createPoseSnap();
  assert.equal(flick(0.2, 0), false);
  assert.equal(flick(0.2, 120), false);
  assert.equal(flick(0.9, 200), true);
  assert.equal(flick(0.9, 220), false);
  const slow = createPoseSnap();
  slow(0.2, 0); slow(0.2, 100);
  assert.equal(slow(0.9, 800), false, 'too slow to be a flick');
});

test('high-band energy averages the 2.2-9 kHz bins', () => {
  const freq = new Uint8Array(512).fill(10);
  for (let i = 52; i < 209; i++) freq[i] = 200; // ~2.2-9 kHz at 48 kHz / 1024
  assert.ok(highBandEnergy(freq, 48000, 1024) > 190);
});
