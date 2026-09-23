# Current ARTIFACTS redesign

The user rejected the continuous-instruments version and requested a complete rebuild. Current branch: `experience/software-exhibition`, based on `d5b2be6`. The old renderer, instance forms, camera tokens and story timeline were removed. Do not restore them or the old 14-station controller.

Read root `AGENTS.md` and `ARTIFACTS_CREATIVE_DIRECTION.md` completely before visual work. The user has approved this direction: refine rather than restart. Sources are `content/page.html`, `content/exhibition.json`, `content/apps.json`, `scripts/build.mjs`, `js/experience.js`, `js/contours.js` and `styles.css`. Build with `node scripts/build.mjs`. The site remains ordinary static files for GitHub Pages.

All sixteen apps remain in the scroll-driven archive and original collection index. All sixteen longer three-stage demonstrations have range controls and real software details. Every app opens its original full capture. Papyrus uses the current 1531 × 1002 source; the others are 1425 × 950. Lossless image audits are retained.

Preview: http://127.0.0.1:8001/. Verify the server before sharing it. QA is ignored under `.qa/`; latest suite is `tests/browser.mjs` with report `.qa/validation-v10.json`. Use the authenticated GitHub connector for publication and verify Git tree equality before synchronizing the local branch. Do not merge production without instruction.

Latest visual pass: app-specific SVG choreography lives in `scripts/study-visuals.mjs`, shared phase progression in `js/studies.js`, and extended pacing/light chapters in `studies.css`. Metria has aligned traces and a moving shared inspection window. All existing image/media files are preserved unchanged. Only build/runtime basics and focused desktop/mobile visual review were performed; defer full QA and cleanup until the user finalizes the visual version.

Current refinement: a procedural WebGL2 layered-silicon hero replaces the screenshot hero (`js/hero.js`, CSS fallback). All sixteen studies now have additional staggered/path-following/inspection choreography (`js/instruments.js`), camera direction, timed replay and an in-place app picker. Small study evidence uses full uncropped captures with corrected sizing. Existing assets remain untouched. Ending: “The work keeps moving. So do the tools.” Build and focused runtime/visual checks passed; comprehensive QA remains deferred.
