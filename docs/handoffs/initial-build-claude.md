# Initial build (Claude)

**What:** first release of Alo: Chapters as a standalone project, grown from the single-file prototype in `AI Alo/alo-chapters`.

- Story rebuilt from aialo.io / 3d.aialo.io content (`alo_rag2/src/content.js`): 6 chapters, 18 museum-style exhibits, Alo's recorded narration (tour clips, "Oli otya", "Webale kujja"), photos.
- Cinematic layer: per-chapter set pieces, title cards, letterbox, film grain, synthesized ambient score.
- OLI assistant: boot sequence, palm HUD, voice commands (Web Speech API, Chrome/Edge).
- Gesture core split into `src/gestures.js` with unit tests; mic optional (silent flick-snap fallback); GPU→CPU fallback for MediaPipe; libraries vendored from npm at build time.
- Codex was out of credits, so Claude did implementation, testing and the push.

**Checks run (sandbox, software WebGL):** `npm run check`, 13 unit tests, `npm run build`, browser smoke (demo wake/grab/snap, mouse walk-through of all 6 chapters, fake-camera boot, phone layout). The hand model CDN is blocked in the sandbox, so real hand tracking was **not** verified there.

**Open:** verify real webcam tracking and snap sensitivity on Alo's laptop; tune thresholds; Grok review of copy and gesture UX; physical phone check.
