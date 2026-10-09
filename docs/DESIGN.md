# Design

## Principles
1. **A film, a museum and a conversation.** Every chapter is its own world with its own colour, music and set piece. Memories are exhibits with placards. OLI answers when spoken to.
2. **The person, not the résumé.** Work sits beside Uganda, Buganda food and dance, faith, soccer, movies and music.
3. **Bodies first, fallbacks always.** Hands and voice are the main controls; mouse, touch and keyboard always work.
4. **Readable over dazzling.** Orbs stay below the title; the title dims while a placard is open; captions dim behind placards. Tests enforce this.
5. **Kind and inclusive.** The hand is made of light in the chapter colour (no skin tone). Copy is plain, warm, first person.
6. **Honest content.** Facts come from Alo's published sites or verified sources. No song lyrics, no copyrighted characters or artwork, no cartoon GIFs; names and facts with links instead.

## Chapter worlds
| # | Chapter | World | Score |
|---|---|---|---|
| 1 | Roots | cranes over the hills, elephants, giraffes and kob on the horizon | amadinda-style |
| 2 | A Taste of Home | fire circle, Bakisimba dancers, drums | amadinda + drums |
| 3 | The Crossing | Rappahannock river, plane trail | guitar |
| 4 | Hands That Build | 12 Habitat homes rising | piano |
| 5 | Open Doors | doors opening | guitar |
| 6 | The Builder | neural-network sky | piano |
| 7 | Off the Clock | night soccer pitch, floodlights | guitar |
| 8 | What Moves Me | spotlights, mirror ball, notes | finger-snap groove |
| 9 | Faith | stained-glass rose window, candles | hymn |
| 10 | The Road Ahead | flight paths to Spain, Italy, Europe | guitar |
| 11 | One Day at a Time | dawn, chapter constellation | bells |

## Type and colour
Fraunces (display/serif) + IBM Plex Mono (HUD). Each chapter defines sky, ground, accent and sun colours; the accent drives UI, hand and HUD.

## Decision log
- 2026-10-09: Static ES modules + importmap, vendored libs (no bundler) for simplicity and same-origin loading.
- 2026-10-09: Snap = sound + pose, to reject keyboard clicks.
- 2026-10-09: Two-hand gesture limited to one job (chapter map); everything else stays one-handed.
- 2026-10-09: Live-synthesized score instead of recordings (no licensing); "amadinda-style", not a copy of traditional pieces.
- 2026-10-09: Hand rendered as chapter-coloured light, not a skin tone.

## Roadmap (candidates)
- Real hand test pass and threshold tuning on Alo's laptop and a phone.
- Photo-real chapter worlds from Gaussian splats (e.g. World Labs Marble export, Spark renderer for Three.js).
- OLI conversation: Claude as the narrator brain, grounded in story.js, with Alo's voice.
- Custom domain (story.aialo.io), analytics, a "share your favourite exhibit" card.
- Performance: move particle hills to a vertex shader; WebGPU renderer when stable for this stack.
