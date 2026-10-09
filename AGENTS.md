# Alo: Chapters, agent guide

Standalone project (not part of `alo_rag2`). User instructions from Alo take precedence over this file.

## Roles
- **Claude (Opus):** UX, architecture, cross-agent review. While Codex is out of credits, Claude also implements, tests and pushes.
- **Codex:** scoped implementation, integration and verification when available.
- **Grok (Cline / OpenRouter):** research current sources, challenge assumptions, review claims and gesture UX. Research and review first; code only when assigned.

## Rules
- Work on a branch (`claude/<task>`, `codex/<task>`, `grok/<task>`) and open a PR. `main` deploys to production on Vercel.
- Public copy lives in `src/story.js` and must match Alo's published sites (aialo.io, 3d.aialo.io). No unpublished employer details (e.g. internal Flatter/PersonaOPPs specifics), no immigration topics, no em dashes.
- Never commit secrets. This site needs none.
- Before committing: `npm run check && npm test && npm run build && npm run smoke`. Say plainly which checks you actually ran.
- Leave a handoff in `docs/handoffs/<topic>-<agent>.md`: what changed, checks run, open issues, branch/PR.

## Map
- `src/story.js` content · `src/gestures.js` pure gesture math (unit-tested) · `src/demo.js` ghost hand
- `src/world.js` Three.js world · `src/setpieces.js` per-chapter set pieces · `src/main.js` input, OLI assistant, audio, UI
- `scripts/build.mjs` build to `dist/` · `scripts/serve.mjs` local server · `test/` unit + browser smoke tests
