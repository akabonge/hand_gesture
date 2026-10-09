# Architecture

Living document: update it in the same PR as any structural change.

## Overview

```
index.html ── importmap (three, @mediapipe/tasks-vision, served from /vendor)
  └─ src/main.js        input modes, gesture wiring, chapter flow, OLI, audio, UI
       ├─ src/story.js      ALL visitor-facing content (chapters, memories, music, scene)
       ├─ src/gestures.js   pure gesture math (unit-tested in Node)
       ├─ src/demo.js       ghost hand for ?demo and tests (MediaPipe-shaped landmarks)
       ├─ src/world.js      Three.js world: sky, particle hills, memory orbs, camera
       │    └─ src/setpieces.js   one "world" per chapter (cranes+wildlife, dance, river, …)
       └─ src/music.js      live-composed acoustic score (Web Audio, no recordings)
```

**Build:** `scripts/build.mjs` copies the app to `dist/`, vendors pinned Three.js and MediaPipe from `node_modules`, and caches the hand model into `dist/models/` (falls back to Google's CDN at runtime). No bundler: native ES modules + importmap.

**Deploy:** Vercel builds `main` (`vercel.json`): `npm ci --omit=dev && npm run build`, output `dist/`. `Permissions-Policy` allows camera/mic on this origin only. Immutable caching for `/vendor` and `/models`.

## Input pipeline

1. **Camera** → MediaPipe HandLandmarker (`numHands: 2`, VIDEO mode, GPU delegate with CPU fallback) → up to two 21-point hands per frame.
2. `handleHands()`:
   - two hands → `handsApart()` → `createSpreadDetector()` → open/close the **chapter map**
   - picks the **primary hand** (closest to the current pointer, for steady grabs) → `handleLandmarks()`
3. `handleLandmarks()` → pointer (thumb-index midpoint, mirrored), **pinch** with hysteresis (grab/release or pick on the map), **open palm** held 550 ms (wake), **snap arming** (thumb touches middle finger).
4. **Snap** = mic high-band (2.2–9 kHz) onset **and** armed within 600 ms. No mic → silent "flick" snap from pose alone.
5. **Voice (OLI)**: Web Speech API, continuous, keyword commands.
6. **Mouse/touch**: tap = wake, press-and-hold = grab, fast horizontal swipe (speed > 0.12 px/ms) = turn chapter, buttons for ← / Chapters / →.

All thresholds are ratios of hand size, so they work near and far from the camera.

## Rendering

- 3D: one WebGL renderer, additive point sprites, per-chapter colour lerp, set pieces swapped and disposed per chapter.
- Hand: 2D overlay canvas. A **human-shaped hand of light** (palm, tapered fingers, knuckles, nails) in the chapter colour, drawn opaque offscreen then composited translucent; the glow is a wider copy of the shapes. **Do not use canvas `shadowBlur` with `drawImage`** here: it left ghost hands in some rasterizers.
- UI: HTML/CSS layers (title, museum placard, captions, HUD, chapter map, boot sequence, title cards, letterbox, grain).

## Audio

- Narration: Alo's recorded clips (`public/assets/voice`), captions always shown.
- Score: `music.js` schedules notes 250 ms ahead (lookahead scheduler); instruments are synthesized (log xylophone, Karplus-Strong guitar, additive piano, church bells, organ, hand drums, rattle, finger snap, bass) through a generated convolution reverb. Ducks under narration.

## Testing

- `npm test`: gesture math, spread detector, story integrity (assets exist, 3–5 memories, valid music/scene, no em dashes).
- `npm run smoke` (Playwright): demo wake/grab/snap, all chapters in mouse mode with **layout checks** (orbs and placards never cover the title), two-hand spread → map → jump, **phone** (390×844 touch: tap, hold, next, swipe, map, no overflow), fake-camera boot.
- CI runs both on every push/PR and uploads screenshots.

## Privacy

Camera and microphone never leave the browser. Photos are re-encoded with EXIF/GPS stripped (`public/assets/photos`).
