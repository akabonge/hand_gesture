import { STORY } from './story.js';
import { World } from './world.js';
import { demoFrame } from './demo.js';
import { createMusic } from './music.js';
import { memoryImage } from './art.js';
import {
  pinchRatio, snapRatio, isOpenPalm, pointerFrom, createPinchTracker,
  highBandEnergy, createSnapDetector, createPoseSnap,
} from './gestures.js';

const VISION_VERSION = '0.10.14';
const MODEL_LOCAL = './models/hand_landmarker.task';
const MODEL_REMOTE = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const PALM_HOLD_MS = 550;
const SNAP_ARM_RATIO = 0.3;

/* ---------------------------------------------------------------- DOM */
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const DEMO = params.has('demo');
const START_CH = Math.min(STORY.length - 1, Math.max(0, (parseInt(params.get('ch'), 10) || 1) - 1));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const el = {
  intro: $('intro'), err: $('err'), title: $('title'), kicker: $('t-kicker'), h1: $('t-h1'), line: $('t-line'),
  card: $('card'), cardK: $('c-k'), cardH: $('c-h'), cardP: $('c-p'), cardImg: $('c-img'),
  hint: $('hint'), flash: $('flash'), caption: $('caption'), chapNum: $('chap-num'), chapName: $('chap-name'),
  progress: $('progress'), memCount: $('mem-count'), chipCam: $('chip-cam'), chipMic: $('chip-mic'),
  chipGesture: $('chip-gesture'), gestureTxt: $('gesture-txt'), btnSound: $('btn-sound'), btnPreview: $('btn-preview'),
  video: $('cam'), handCanvas: $('hand'), status: $('sr-status'), cardMeta: $('c-meta'),
  chapmap: $('chapmap'), mapNodes: $('map-nodes'),
  boot: $('boot'), bootLog: $('boot-log'), titleCard: $('titlecard'), tcNum: $('tc-num'), tcName: $('tc-name'), chipOli: $('chip-oli'),
};
STORY.forEach(() => el.progress.appendChild(document.createElement('i')));

/* -------------------------------------------------------------- STATE */
const S = {
  ch: START_CH, awake: false, wake: 0, transition: 0, mode: null, camFailed: false,
  pointer: { x: 0.5, y: 0.5, seen: false }, smooth: { x: 0.5, y: 0.5 },
  pinching: false, palmSince: 0, armedAt: -Infinity, collected: 0, landmarks: null,
  sound: !DEMO, preview: true, reducedMotion,
};
const world = new World($('scene'));
const pinchTracker = createPinchTracker();
const snapDetector = createSnapDetector();
const poseSnap = createPoseSnap();

/* ------------------------------------------------------------ CHAPTERS */
function setChapter(ch, instant = false) {
  S.ch = ch; S.awake = false; S.collected = 0; S.palmSince = 0;
  world.release();
  const c = STORY[ch];
  world.setChapter(c, instant);
  document.documentElement.style.setProperty('--accent', '#' + world.target.accent.getHexString());
  el.chapNum.textContent = `Chapter ${String(ch + 1).padStart(2, '0')} / ${String(STORY.length).padStart(2, '0')}`;
  el.chapName.textContent = c.name;
  [...el.progress.children].forEach((n, i) => n.classList.toggle('on', i <= ch));
  el.kicker.textContent = c.kicker; el.h1.innerHTML = c.title; el.line.textContent = c.line;
  el.title.classList.remove('show'); el.card.classList.remove('show'); el.caption.classList.remove('show');
  document.body.classList.remove('reading'); $('c-links').textContent = '';
  stopVoice();
  pad.setChapter(ch);
  if (!instant) showTitleCard(ch);
  updateMemCount();
  hint(S.mode === 'mouse' ? 'Press <b>W</b> or click to <span>wake the world</span>' : 'Open your palm to <span>wake the world</span>');
  announce(`Chapter ${ch + 1}: ${c.name}`);
}

function wakeUp() {
  if (S.awake) return;
  S.awake = true;
  el.title.classList.add('show');
  sfx('wake');
  playVoice(STORY[S.ch].voice, STORY[S.ch].caption);
  hint(S.mode === 'mouse' ? 'Click &amp; hold a light to <span>grab a memory</span>' : 'Pinch a glowing light to <span>grab a memory</span>');
  announce(STORY[S.ch].line);
}

function goTo(index) {
  if (index === S.ch) { closeMap(); return; }
  goChapter(index - S.ch);
}

function goChapter(delta) {
  // Wall-clock lock (not the animation value) so slow devices can't get stuck.
  if (performance.now() - (S.lastTurn || -1e9) < 700) return;
  S.lastTurn = performance.now();
  closeMap();
  el.flash.classList.remove('go'); void el.flash.offsetWidth; el.flash.classList.add('go');
  sfx('snap');
  S.transition = 1;
  setTimeout(() => setChapter((S.ch + delta + STORY.length) % STORY.length), 260);
}

function showTitleCard(ch) {
  el.tcNum.textContent = `Chapter ${String(ch + 1).padStart(2, '0')}`;
  el.tcName.textContent = STORY[ch].name;
  document.body.classList.add('cinema');
  el.titleCard.classList.remove('show'); void el.titleCard.offsetWidth; el.titleCard.classList.add('show');
  clearTimeout(showTitleCard.timer);
  showTitleCard.timer = setTimeout(() => { el.titleCard.classList.remove('show'); document.body.classList.remove('cinema'); }, 2100);
}

function updateMemCount() { el.memCount.textContent = `Memories ${S.collected} / ${STORY[S.ch].memories.length}`; }
function hint(html) { el.hint.innerHTML = html; }
function announce(text) { el.status.textContent = text; }

/* -------------------------------------------------------------- GRAB */
let cardTimer = 0;
function tryGrab() {
  if (!S.awake || world.grabbed) return;
  const best = world.pick(S.pointer.x * innerWidth, S.pointer.y * innerHeight, Math.max(120, innerWidth * 0.1));
  if (!best) return;
  world.grabbed = best;
  sfx('grab');
  const u = best.userData, m = u.mem;
  el.cardK.textContent = `Exhibit ${S.ch + 1}.${u.i + 1} · ${STORY[S.ch].name}`;
  el.cardMeta.textContent = m.meta || '';
  el.cardH.textContent = m.t; el.cardP.textContent = m.p;
  clearTimeout(cardTimer);
  const nav = $('c-links'); nav.textContent = '';
  for (const [label, href] of m.links || []) {
    const a = document.createElement('a'); a.href = href; a.target = '_blank'; a.rel = 'noopener'; a.textContent = label; nav.appendChild(a);
  }
  const pic = memoryImage(m, '#' + world.target.accent.getHexString());
  if (pic) { el.cardImg.src = pic; el.cardImg.alt = m.t; el.cardImg.hidden = false; } else { el.cardImg.hidden = true; el.cardImg.removeAttribute('src'); }
  el.card.classList.add('show');
  document.body.classList.add('reading');
  announce(`${m.t}. ${m.p}`);
  if (m.voice) playVoice(m.voice, null);
  if (!u.collected) { u.collected = true; S.collected++; updateMemCount(); }
}

function releaseGrab() {
  if (!world.grabbed) return;
  world.release();
  // The placard stays a few seconds after letting go, so its links can be clicked.
  clearTimeout(cardTimer);
  cardTimer = setTimeout(() => { if (!world.grabbed) { el.card.classList.remove('show'); document.body.classList.remove('reading'); } }, 7000);
  if (S.collected >= STORY[S.ch].memories.length) {
    hint(S.mode === 'mouse' ? 'Press <b>Space</b> to turn the chapter' : '<span>Snap your fingers</span> to turn the chapter');
  }
}

/* ------------------------------------------------------- CHAPTER MAP */
// Opened with the Chapters button, the C key or by saying "map". Pinch a chapter to jump there.
STORY.forEach((c, i) => {
  const b = document.createElement('button');
  b.className = 'map-node';
  b.innerHTML = `<i></i><span>${String(i + 1).padStart(2, '0')}</span><b></b>`;
  b.querySelector('b').textContent = c.name;
  b.style.setProperty('--c', '#' + new THREE_COLOR(c.accent));
  const a = Math.PI * (0.92 - (i / (STORY.length - 1)) * 0.84);
  b.style.left = `${50 + Math.cos(a) * 40}%`;
  b.style.top = `${78 - Math.sin(a) * 52 + (i % 2) * 6}%`;
  b.onclick = () => goTo(i);
  el.mapNodes.appendChild(b);
});
function THREE_COLOR(hex) { return hex.toString(16).padStart(6, '0'); }
function openMap() {
  if (S.mapOpen) return;
  S.mapOpen = true; el.chapmap.classList.add('show');
  [...el.mapNodes.children].forEach((n, i) => n.classList.toggle('here', i === S.ch));
  sfx('wake'); announce('Chapter map open. Point and pinch a chapter, or say close.');
}
function closeMap() {
  if (!S.mapOpen) return;
  S.mapOpen = false; el.chapmap.classList.remove('show');
  [...el.mapNodes.children].forEach((n) => n.classList.remove('hover'));
}
$('map-close').onclick = closeMap;
function mapHover() {
  if (!S.mapOpen) return -1;
  let best = -1, bd = Math.max(70, innerWidth * 0.07);
  [...el.mapNodes.children].forEach((n, i) => {
    const r = n.querySelector('i').getBoundingClientRect(), d = Math.hypot(r.x + r.width / 2 - S.smooth.x * innerWidth, r.y + r.height / 2 - S.smooth.y * innerHeight);
    if (d < bd) { bd = d; best = i; }
  });
  [...el.mapNodes.children].forEach((n, i) => n.classList.toggle('hover', i === best));
  return best;
}

/** One hand drives everything (MediaPipe is set to track a single hand). */
function handleHands(hands, now) {
  handleLandmarks(hands[0] || null, now);
}

/* ----------------------------------------------------------- GESTURES */
function handleLandmarks(lm, now) {
  S.landmarks = lm;
  if (!lm) {
    S.pointer.seen = false; S.palmSince = 0;
    setGesture('No hand', false);
    if (S.pinching) { S.pinching = false; releaseGrab(); }
    return;
  }
  Object.assign(S.pointer, pointerFrom(lm), { seen: true });
  const pr = pinchRatio(lm), sr = snapRatio(lm);
  const pinch = pinchTracker(pr);
  S.pinching = pinch.pinching;
  if (pinch.event === 'start') { if (S.mapOpen) { const i = mapHover(); if (i >= 0) goTo(i); } else tryGrab(); }
  if (pinch.event === 'end') releaseGrab();

  const open = isOpenPalm(lm);
  if (open && !S.pinching) {
    if (!S.palmSince) S.palmSince = now;
    if (now - S.palmSince > PALM_HOLD_MS) wakeUp();
  } else S.palmSince = 0;

  if (sr < SNAP_ARM_RATIO) S.armedAt = now;
  // No microphone: fall back to a silent "flick" snap read from the hand pose alone.
  if (S.mode === 'camera' && !analyser && poseSnap(sr, now)) goChapter(1);

  setGesture(S.pinching ? 'Pinch' : sr < SNAP_ARM_RATIO ? 'Snap ready' : open ? 'Open palm' : 'Hand', S.pinching || sr < SNAP_ARM_RATIO);
}

function setGesture(text, hot) {
  el.gestureTxt.textContent = text;
  el.chipGesture.classList.toggle('live', text !== 'No hand');
  el.chipGesture.classList.toggle('hot', !!hot);
}

/* ------------------------------------------------------ MICROPHONE SNAP */
let analyser = null, freq = null;
function listenForSnap(now) {
  if (!analyser) return;
  analyser.getByteFrequencyData(freq);
  const energy = highBandEnergy(freq, analyser.context.sampleRate, analyser.fftSize);
  if (snapDetector({ energy, now, armedAt: S.armedAt, requirePose: !!landmarker })) goChapter(1);
}

/* ------------------------------------------------------------ CAMERA */
let landmarker = null, lastVideoTime = -1;
async function startCamera() {
  S.mode = 'camera';
  document.body.classList.add('mode-camera');
  el.intro.classList.add('gone');
  hint('Loading hand tracking\u2026');
  unlockAudio();
  boot.start();
  boot.line('OLI \u00b7 story system v1 \u00b7 initializing');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: false });
    el.video.srcObject = stream;
    await el.video.play();
    el.chipCam.classList.add('live');
    document.body.classList.toggle('preview', S.preview);
    boot.line('camera', 'online');
  } catch (e) {
    boot.line('camera', 'unavailable', true); boot.end(600);
    return fallBackToMouse(`Camera unavailable (${e.name || e.message}).`);
  }
  // The microphone is optional: without it, the silent flick-snap is used.
  try {
    const mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const src = audioCtx.createMediaStreamSource(mic);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024; analyser.smoothingTimeConstant = 0;
    freq = new Uint8Array(analyser.frequencyBinCount);
    src.connect(analyser);
    el.chipMic.classList.add('live');
    boot.line('microphone', 'listening for snaps');
    startVoiceCommands();
  } catch {
    el.chipMic.title = 'Microphone off: flick your thumb off your middle finger to snap';
    boot.line('microphone', 'off \u00b7 flick-to-snap enabled', true);
  }

  try {
    boot.line('hand model', 'loading\u2026');
    landmarker = await createLandmarker();
    boot.line('hand model', '21-point tracking online');
    boot.line('Welcome. Raise your open hand.', null);
    boot.end(1800);
    hint('Open your palm to <span>wake the world</span>');
  } catch (e) {
    console.error(e);
    boot.line('hand model', 'failed', true); boot.end(800);
    fallBackToMouse('Hand tracking could not load on this device.');
  }
}

async function createLandmarker() {
  const vision = await import('@mediapipe/tasks-vision');
  const files = await vision.FilesetResolver.forVisionTasks(new URL('./vendor/tasks-vision/wasm', location.href).href);
  let model = MODEL_REMOTE;
  try { const r = await fetch(MODEL_LOCAL, { method: 'HEAD' }); if (r.ok) model = MODEL_LOCAL; } catch { /* use remote */ }
  const opts = (delegate) => ({
    baseOptions: { modelAssetPath: model, delegate },
    runningMode: 'VIDEO', numHands: 1, minHandDetectionConfidence: 0.6, minHandPresenceConfidence: 0.5, minTrackingConfidence: 0.5,
  });
  try { return await vision.HandLandmarker.createFromOptions(files, opts('GPU')); }
  catch { return await vision.HandLandmarker.createFromOptions(files, opts('CPU')); }
}

function pollCamera(now) {
  if (!landmarker || el.video.readyState < 2 || el.video.currentTime === lastVideoTime) return;
  lastVideoTime = el.video.currentTime;
  const r = landmarker.detectForVideo(el.video, now);
  handleHands(r.landmarks || [], now);
}

function fallBackToMouse(message) {
  S.camFailed = true;
  el.err.textContent = message + ' Switched to mouse mode.';
  el.intro.classList.remove('gone');
  startMouse(true);
}

/* ------------------------------------------------------------- MOUSE */
function startMouse(keepIntro = false) {
  S.mode = 'mouse';
  document.body.classList.remove('mode-camera'); document.body.classList.add('mode-mouse');
  unlockAudio();
  pad.setChapter(S.ch);
  if (keepIntro) setTimeout(() => el.intro.classList.add('gone'), 2200); else el.intro.classList.add('gone');
  hint('Press <b>W</b> or click to <span>wake the world</span>');
}
addEventListener('pointermove', (e) => { if (S.mode !== 'mouse') return; S.pointer.x = e.clientX / innerWidth; S.pointer.y = e.clientY / innerHeight; S.pointer.seen = true; });
let downAt = null;
addEventListener('pointerdown', (e) => {
  if (S.mode !== 'mouse' || e.target.closest('button, a, #chapmap, #c-links')) return;
  S.pointer.x = e.clientX / innerWidth; S.pointer.y = e.clientY / innerHeight; S.pointer.seen = true;
  downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
  if (!S.awake) { wakeUp(); return; }
  S.pinching = true; S.smooth.x = S.pointer.x; S.smooth.y = S.pointer.y;
  tryGrab(); setGesture('Pinch', true);
});
addEventListener('pointerup', (e) => {
  if (S.mode !== 'mouse') return;
  // A quick horizontal swipe on empty space turns the chapter (phones and trackpads).
  // On touch, a fast fling counts as a swipe even if it started on a memory.
  if (downAt && (!world.grabbed || e.pointerType === 'touch')) {
    const dx = e.clientX - downAt.x, dy = e.clientY - downAt.y;
    const speed = Math.abs(dx) / Math.max(1, performance.now() - downAt.t); // px per ms
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5 && speed > 0.12) goChapter(dx < 0 ? 1 : -1);
  }
  downAt = null;
  S.pinching = false; releaseGrab(); setGesture('Hand', false);
});
addEventListener('keydown', (e) => {
  if (!S.mode) return;
  if (e.code === 'KeyW') wakeUp();
  else if (e.code === 'Space' || e.code === 'ArrowRight') { e.preventDefault(); goChapter(1); }
  else if (e.code === 'ArrowLeft') goChapter(-1);
  else if (e.code === 'KeyM') toggleSound();
  else if (e.code === 'KeyP') togglePreview();
  else if (e.code === 'KeyC') (S.mapOpen ? closeMap : openMap)();
  else if (e.code === 'Escape') closeMap();
});
$('btn-cam').onclick = startCamera;
$('btn-mouse').onclick = () => startMouse(false);
el.btnSound.onclick = toggleSound;
el.btnPreview.onclick = togglePreview;
$('btn-next').onclick = () => { if (!S.awake) wakeUp(); else goChapter(1); };
$('btn-prev').onclick = () => goChapter(-1);
$('btn-map').onclick = () => (S.mapOpen ? closeMap : openMap)();

function toggleSound() {
  S.sound = !S.sound;
  if (S.sound) { unlockAudio(); pad.setChapter(S.ch); }
  el.btnSound.setAttribute('aria-pressed', String(S.sound));
  el.btnSound.textContent = S.sound ? 'Sound on' : 'Sound off';
  if (!S.sound) stopVoice();
  pad.level();
}
function togglePreview() {
  S.preview = !S.preview;
  el.btnPreview.setAttribute('aria-pressed', String(S.preview));
  document.body.classList.toggle('preview', S.preview && S.mode === 'camera');
}

/* ------------------------------------------------------- VOICE + SFX */
let audioCtx = null;
const voice = new Audio();
voice.preload = 'none';
function unlockAudio() {
  if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { /* no audio */ } }
  audioCtx?.resume?.();
}
function playVoice(src, caption) {
  if (caption) { el.caption.textContent = caption; el.caption.classList.add('show'); }
  if (!src || !S.sound) return;
  voice.src = src;
  voice.currentTime = 0;
  voice.play().catch(() => { /* autoplay blocked: captions still show */ });
}
function stopVoice() { voice.pause(); }
voice.addEventListener('ended', () => { pad.level(); setTimeout(() => el.caption.classList.remove('show'), 1500); });
voice.addEventListener('play', () => pad.level());

function sfx(kind) {
  if (!audioCtx || !S.sound) return;
  const t = audioCtx.currentTime, o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  const f = { wake: [220, 440, 1.6], grab: [660, 990, 0.35], snap: [1200, 180, 0.5] }[kind];
  o.type = kind === 'snap' ? 'triangle' : 'sine';
  o.frequency.setValueAtTime(f[0], t); o.frequency.exponentialRampToValueAtTime(f[1], t + f[2] * 0.6);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(voice.paused ? 0.1 : 0.04, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + f[2]);
  o.start(t); o.stop(t + f[2] + 0.05);
}

/* ------------------------------------------------- OLI BOOT SEQUENCE */
const boot = {
  start() { el.bootLog.innerHTML = ''; el.boot.classList.add('show'); document.body.classList.add('cinema'); },
  line(label, value, warn = false) {
    const row = document.createElement('div');
    row.className = 'boot-row' + (warn ? ' warn' : '') + (value === null ? ' hero' : '');
    const a = document.createElement('span'); a.textContent = label; row.appendChild(a);
    if (value) { const b = document.createElement('b'); b.textContent = value; row.appendChild(b); }
    el.bootLog.appendChild(row);
    while (el.bootLog.children.length > 7) el.bootLog.firstChild.remove();
  },
  end(delay) { setTimeout(() => { el.boot.classList.remove('show'); document.body.classList.remove('cinema'); }, delay); },
};

/* ------------------------------------------- LIVE ACOUSTIC SCORE */
// Composed in the browser per chapter (see src/music.js and `music` in story.js).
const score = createMusic();
const pad = {
  setChapter(ch) {
    if (!audioCtx) return;
    score.play(audioCtx, STORY[ch].music || 'piano');
    this.level();
  },
  level() {
    if (!audioCtx) return;
    const on = S.sound && S.mode;
    score.setLevel(on ? (voice.paused ? 0.55 : 0.18) : 0);
  },
};

/* ------------------------------------------------ OLI VOICE COMMANDS */
const COMMANDS = [
  [/\b(map|chapters|show chapters)\b/, () => openMap()],
  [/\b(close|close map)\b/, () => closeMap()],
  [/\b(next|forward|continue|go on)\b/, () => goChapter(1)],
  [/\b(back|previous)\b/, () => goChapter(-1)],
  [/\b(wake|oli otya|hello|hi oli|hey oli|start)\b/, () => wakeUp()],
  [/\b(mute|quiet|silence)\b/, () => { if (S.sound) toggleSound(); }],
  [/\b(sound on|unmute)\b/, () => { if (!S.sound) toggleSound(); }],
  [/\b(where am i|what chapter)\b/, () => say(`Chapter ${S.ch + 1}. ${STORY[S.ch].name}. ${STORY[S.ch].line}`)],
  [/\b(thank you|thanks|webale)\b/, () => say('Webale kujja. Thank you for coming.')],
];
function startVoiceCommands() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { boot.line('voice commands', 'not supported in this browser', true); return; }
  const rec = new SR();
  rec.continuous = true; rec.interimResults = false; rec.lang = 'en-US';
  rec.onresult = (e) => {
    const text = e.results[e.results.length - 1][0].transcript.toLowerCase().trim();
    const hit = COMMANDS.find(([re]) => re.test(text));
    if (hit) { flashOli(text); hit[1](); }
  };
  rec.onend = () => { if (!rec.stopped) setTimeout(() => { try { rec.start(); } catch { /* already running */ } }, 400); };
  rec.onerror = (e) => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') rec.stopped = true; };
  try { rec.start(); el.chipOli.classList.add('live'); boot.line('voice commands', 'say \u201cnext\u201d, \u201cback\u201d, \u201coli otya\u201d'); } catch { /* ignore */ }
}
function flashOli(text) {
  const label = el.chipOli.querySelector('.label');
  el.chipOli.classList.add('hot');
  label.textContent = `\u201c${text.slice(0, 22)}\u201d`;
  clearTimeout(flashOli.t);
  flashOli.t = setTimeout(() => { el.chipOli.classList.remove('hot'); label.textContent = 'OLI'; }, 1800);
}
function say(text) {
  el.caption.textContent = text; el.caption.classList.add('show');
  setTimeout(() => el.caption.classList.remove('show'), 4000);
  if (!S.sound || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text); u.rate = 1; u.pitch = 0.95;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}

/* -------------------------------------------------------------- DEMO */
const demoFired = new Set();
function runDemo(now, clock) {
  // Uses the frame clock (paused while the tab is hidden) so the script never skips steps.
  const t = clock;
  const loop = Math.floor(t / 22);
  const { landmarks, snapKey } = demoFrame(t, (i) => {
    const o = world.orbs[i]; if (!o) return null;
    const p = world.screenOf(o); return [p.x / innerWidth, p.y / innerHeight];
  }, innerWidth / innerHeight);
  handleHands([landmarks], now);
  if (snapKey !== null) { const key = `${loop}:${snapKey}`; if (!demoFired.has(key)) { demoFired.add(key); goChapter(1); } }
}

/* ----------------------------------------------------- HAND OVERLAY */
const hx = el.handCanvas.getContext('2d');
let dpr = 1;
function drawHand(now) {
  const W = el.handCanvas.width, H = el.handCanvas.height;
  // Re-assigning the size fully resets the canvas. (clearRect left ghost hands behind after
  // shadowed drawImage calls in some GPU/software rasterizers.)
  el.handCanvas.width = W;
  const acc = '#' + world.colors.accent.getHexString();
  if (S.mode === 'mouse') {
    if (!S.pointer.seen) return;
    hx.strokeStyle = acc; hx.lineWidth = 1.5 * dpr;
    hx.beginPath(); hx.arc(S.smooth.x * W, S.smooth.y * H, (S.pinching ? 10 : 18) * dpr, 0, 7); hx.stroke();
    return;
  }
  const lm = S.landmarks; if (!lm) return;
  const P = lm.map((p) => ({ x: (1 - p.x) * W, y: p.y * H }));
  // Glowing skeleton hand (the original design): bones, joints, accent fingertips.
  hx.save();
  hx.shadowColor = acc; hx.shadowBlur = 14 * dpr;
  hx.strokeStyle = 'rgba(255,255,255,.6)'; hx.lineWidth = 1.8 * dpr; hx.lineCap = 'round';
  hx.beginPath(); for (const [a, b] of BONES) { hx.moveTo(P[a].x, P[a].y); hx.lineTo(P[b].x, P[b].y); } hx.stroke();
  for (let i = 0; i < 21; i++) {
    const tip = i % 4 === 0 && i > 0;
    hx.fillStyle = tip ? acc : 'rgba(255,255,255,.9)';
    hx.beginPath(); hx.arc(P[i].x, P[i].y, (tip ? 4.4 : 2.8) * dpr, 0, 7); hx.fill();
  }
  hx.restore();
  hx.save();
  hx.lineCap = 'round';
  hx.strokeStyle = acc; hx.lineWidth = (S.pinching ? 2.4 : 1.2) * dpr;
  hx.beginPath(); hx.arc(S.smooth.x * W, S.smooth.y * H, (S.pinching ? 9 : 22) * dpr, 0, 7); hx.stroke();
  drawHud(P[9].x, P[9].y, now, acc, lm);
  if (S.palmSince && !S.awake) {
    const p = Math.min(1, (now - S.palmSince) / PALM_HOLD_MS);
    hx.lineWidth = 3 * dpr;
    hx.beginPath(); hx.arc(P[9].x, P[9].y, 34 * dpr, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); hx.stroke();
  }
  hx.restore();
}

const BONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]];

/** Holographic HUD around the palm: rotating arcs, ticks and a live readout. */
function drawHud(cx, cy, now, acc, lm) {
  const r = 58 * dpr, spin = reducedMotion ? 0 : now / 1400;
  hx.save();
  hx.shadowBlur = 0; hx.globalAlpha = 0.75; hx.strokeStyle = acc; hx.fillStyle = acc;
  hx.lineWidth = 1 * dpr;
  for (let k = 0; k < 3; k++) { const a = spin + k * (Math.PI * 2 / 3); hx.beginPath(); hx.arc(cx, cy, r, a, a + 1.4); hx.stroke(); }
  hx.globalAlpha = 0.45;
  for (let k = 0; k < 4; k++) { const a = -spin * 1.6 + k * (Math.PI / 2); hx.beginPath(); hx.arc(cx, cy, r + 10 * dpr, a, a + 0.5); hx.stroke(); }
  hx.globalAlpha = 0.6;
  for (let k = 0; k < 24; k++) {
    const a = k * (Math.PI / 12) + spin * 0.3, r1 = r - 6 * dpr, r2 = r - (k % 6 ? 2 : 0) * dpr;
    hx.beginPath(); hx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); hx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); hx.stroke();
  }
  if (innerWidth < 700) { hx.restore(); return; } // no readout on phones: not enough room
  hx.globalAlpha = 0.9;
  hx.font = `${10 * dpr}px "IBM Plex Mono", ui-monospace, monospace`;
  const flip = cx > hx.canvas.width * 0.7;
  const lx = flip ? cx - r - 130 * dpr : cx + r + 18 * dpr, ly = cy - 14 * dpr;
  hx.beginPath(); hx.moveTo(cx + (flip ? -1 : 1) * r * 0.72, cy - r * 0.72); hx.lineTo(lx + (flip ? 112 : -6) * dpr, ly - 4 * dpr); hx.lineTo(lx + (flip ? 0 : 98) * dpr, ly - 4 * dpr); hx.stroke();
  hx.fillText(`X ${S.smooth.x.toFixed(2)}  Y ${S.smooth.y.toFixed(2)}`, lx, ly + 10 * dpr);
  hx.fillText(`PINCH ${Math.max(0, 1 - pinchRatio(lm)).toFixed(2)}  ${S.awake ? 'AWAKE' : 'STANDBY'}`, lx, ly + 24 * dpr);
  hx.restore();
}

/* -------------------------------------------------------------- LOOP */
function resize() {
  world.resize();
  dpr = Math.min(devicePixelRatio, 2);
  el.handCanvas.width = innerWidth * dpr; el.handCanvas.height = innerHeight * dpr;
}
addEventListener('resize', resize);
resize();

let last = performance.now(), t = 0;
function frame(now) {
  const dt = Math.max(0, Math.min((now - last) / 1000, 0.05)); last = now; t += dt;
  if (DEMO) runDemo(now, t); else pollCamera(now);
  listenForSnap(now);
  const k = 1 - Math.exp(-dt * 18);
  S.smooth.x += (S.pointer.x - S.smooth.x) * k; S.smooth.y += (S.pointer.y - S.smooth.y) * k;
  S.wake += ((S.awake ? 1 : 0) - S.wake) * (1 - Math.exp(-dt * 1.4));
  S.transition = Math.max(0, S.transition - dt * 1.3);
  world.update(S, dt, t);
  if (world.grabbed) placeCard();
  drawHand(now);
  requestAnimationFrame(frame);
}

function placeCard() {
  // The placard sits below the chapter title (which also dims while reading), beside the held
  // memory. If it can't fit under the title, its picture shrinks.
  const s = world.screenOf(world.grabbed), w = el.card.offsetWidth;
  const titleBottom = el.line.getBoundingClientRect().bottom + 14, floor = innerHeight - 96;
  el.card.classList.toggle('compact', el.card.offsetHeight > floor - titleBottom && !el.card.classList.contains('compact') ? true : el.card.classList.contains('compact') && floor - titleBottom < 520);
  const h = el.card.offsetHeight;
  let x = s.x + 70;
  if (x + w > innerWidth - 16) x = s.x - w - 70;
  const top = Math.max(titleBottom, Math.min(floor - h, s.y - h / 2));
  el.card.style.left = Math.max(16, Math.min(innerWidth - w - 16, x)) + 'px';
  el.card.style.top = Math.max(Math.min(top, floor - h), 70) + 'px';
}

/* -------------------------------------------------------------- BOOT */
setChapter(S.ch, true);
if (DEMO) {
  S.mode = 'demo';
  el.intro.classList.add('gone');
  el.chipCam.classList.add('live');
  toggleSound(); toggleSound(); // sync button label (demo starts muted)
}
window.__handGesture = { S, world, STORY, handleHands, openMap }; // for tests and debugging
requestAnimationFrame(frame);
