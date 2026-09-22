# Current ARTIFACTS redesign

The user rejected the continuous-instruments version and requested a complete rebuild. Current branch: `experience/software-exhibition`, based on `d5b2be6`. The old renderer, instance forms, camera tokens and story timeline were removed. Do not restore them or the old 14-station controller.

The new source of truth is README and `content/STORYBOARD.md`. Sources are `content/page.html`, `content/exhibition.json`, `content/apps.json`, `scripts/build.mjs`, `js/experience.js`, `js/contours.js` and `styles.css`. Build with `node scripts/build.mjs`. The site remains ordinary static files for GitHub Pages.

All sixteen apps remain in the scroll-driven archive and original Expedition index. The four demonstrations have range controls and real software details. Every app opens its original full capture. Papyrus uses the current 1531 × 1002 source; the others are 1425 × 950. Lossless image audits are retained.

Preview: http://127.0.0.1:8001/. Verify the server before sharing it. QA is ignored under `.qa/`; latest suite is `tests/browser.mjs` with report `.qa/validation-v10.json`. Use the authenticated GitHub connector for publication and verify Git tree equality before synchronizing the local branch. Do not merge production without instruction.
