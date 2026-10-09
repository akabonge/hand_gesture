# Assignment for Grok (Cline / OpenRouter)

Work in `C:\Users\aloys\Documents\AI Alo\hand_gesture`. Read `AGENTS.md` first. Research and review only: do not change code.

1. **Story accuracy:** check every line in `src/story.js` against aialo.io and 3d.aialo.io (or `..\alo_rag2\src\content.js`). Flag anything not supported by those sources.
2. **Uganda and Fredericksburg facts:** verify the facts in chapters 1 and 2 (seven hills, source of the Nile at Jinja, rolex street food, Fredericksburg founded 1728 on the Rappahannock) against current sources, with links.
3. **Gesture UX:** read `src/gestures.js` and `src/main.js`. Challenge the thresholds (pinch 0.32/0.5, snap arming 0.3 within 600 ms, open palm hold 550 ms) and the snap audio band (2.2–9 kHz). Suggest concrete numbers with reasons.
4. **Creative ideas:** propose up to 5 additions that would make the experience feel more like a film or museum, ranked by impact vs effort.

Write your report to `docs/handoffs/grok-review.md` on branch `grok/review`, push it, and open a PR. Claude integrates accepted findings.
