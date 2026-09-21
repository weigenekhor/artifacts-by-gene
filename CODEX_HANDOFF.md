# ARTIFACTS — continuous narrative rebuild

## Latest direction

The new user brief supersedes the sixteen-equal-app-interval design and the earlier no-crop request. It asks for a continuous origin story, approximately three to five major application demonstrations, an explorable sixteen-app environment and a dedicated reel of sharp software fragments. Do not restore the previous page structure. ARTIFACTS remains the main identity; Gene appears quietly at the end.

The current sequence is in `content/STORYBOARD.md` and `content/story.json`: repeated work → reusable method → one tool → accumulation → Papyrus comparison → TopoTracer measurements/interpolation → GaN temperature diagnosis → Metria context → all sixteen apps → real software. Every phase shares a persistent Three.js scene and instanced geometry. Real source functions are grounded in `content/apps.json`, Desktop screenshots and the 23-slide reference in ignored `.qa/reference-slides*`. The older slides describe fifteen apps; the current catalogue has sixteen.

## Repository

Local: `C:/Users/Gene/OneDrive/Documents/AppVerse/artifacts-by-gene`
Remote: https://github.com/weigenekhor/artifacts-by-gene
Branch: `experience/continuous-instruments`
Review: https://github.com/weigenekhor/artifacts-by-gene/pull/3

Use the authenticated GitHub connector to publish; shell git has no saved push identity. Verify local and remote trees before synchronizing history. Do not merge production without the user's instruction.

## Editing

`content/page.html`, `content/story.json`, `content/apps.json`, `js/experience.js`, `js/world.js`, `js/forms.js`, `js/contours.js`, `js/motion.js` and `styles.css` are sources. `node scripts/build.mjs` generates the committed static page, data module and script bundle. The controller exposes read-only QA state through `window.artifactsExperience` and supports `#app/<id>` deep links into the system view.

All sixteen original Desktop images are losslessly encoded under `assets/evidence`. Full captures remain uncropped in the modal; deliberate native crops now appear in the story and reel as requested. Papyrus is 1531 × 1002; the other fifteen are 1425 × 950. Do not substitute archive JPEG-derived previews. Never claim native 4K detail for these sources.

Native scroll owns progression. A single renderer owns camera, instanced pieces, surface and map. Motion tokens live in `js/motion.js`. No WebGL screenshot texture sampling. Portrait uses a separate map composition and one Expedition at a time. Reduced motion, SVG context fallback and a no-JavaScript catalogue are required paths.

## Preview and validation

Preview: http://127.0.0.1:8001/ (verify HTTP 200). Use a hidden Python static-server process rooted in this repository. See README and VALIDATION for tests. Reports/screenshots are ignored under `.qa/`.

Workflow motion is explanatory, not measured or simulated app output. Related-workflow connections do not assert runtime integrations. Physical mobile hardware, Safari and Firefox remain untested unless a later validation record says otherwise.
