# ARTIFACTS — software exhibition

Personal engineering software at https://artifactsbygene.com. The current redesign lives on `experience/software-exhibition`. It does not change production until reviewed and merged into `main`.

## Preview and build

```sh
pnpm install --frozen-lockfile
pnpm build
python -m http.server 8001 --bind 127.0.0.1
```

Open http://127.0.0.1:8001 while the server runs. GitHub Pages serves committed static files from `main / root`; keep `CNAME`. All asset paths are relative. There are no runtime CDN requests, API keys, remote fonts or WebGL requirements.

## Design

The opening makes ARTIFACTS typography the spatial surface. Its computational field continues into the origin, becoming recurring observations, retained checks and a visibly refined method. The origin constructs sixteen positions before any application screenshots appear. Those same positions receive the real interfaces in the collection. Diagrams are illustrative, not measured output.

The uncropped homepage begins in front of the sixteen applications and recedes as they advance. Hovering or focusing an interface brings that specific app forward, turns it toward the viewer and reduces ambient movement. On touch, one tap presents the app and the next enters it. Leaving restores the arrangement smoothly.

All sixteen studies show input, operation and result through task-specific demonstrations. Timeline alignment, recipe comparison, report assembly and signal review use clear two-dimensional relationships; TopoTracer's height field and AIX's baseplate exchange retain three-dimensional materials. GaN Temp Diagnoser relates process/clean observations to possible checks without fabricating measured values or a confirmed diagnosis. Full captures, app order and Gene's approved closing remain intact.

Read `ARTIFACTS_CREATIVE_DIRECTION.md` and `ARTIFACTS_EXPERIENCE_STORYBOARD.md` for governing direction and factual boundaries. One shared clock pauses ambient scenes offscreen. Mobile uses reduced spatial depth; reduced motion retains the narrative without pinned sequences.

Every app has seven individually named states, beginning and ending with its complete source interface. There is no shared screenshot-slicing routine. Native scrolling controls the sequences; optional replay runs for 17–18.8 seconds. A second keyboard-accessible range changes a task-specific inspection region. Diagrams illustrate relationships, not measured results or cross-application integration.

## Source files

- `content/page.html`: semantic page template and copy.
- `content/exhibition.json`: sixteen multi-phase demonstration narratives and source app IDs.
- `content/apps.json`: all sixteen verified apps, purposes, original source groups and asset provenance.
- `scripts/build.mjs`: static SVG generation, HTML rendering and script bundling.
- `js/contours.js`: equal-height contour extraction for an illustrative field.
- `js/experience.js`: shared clock, scroll progression, replay, app picker and image viewer.
- `js/hero.js`: later application assembly, direct hover/focus depth inspection, touch presentation and shared-element navigation.
- `js/genesis.js`: opening/origin timing, pointer inertia and narrative controls.
- `js/identity-field.js`: monumental typography, continuous evidence field, retained method and constructed collection frames.
- `js/collection-layout.js`: common spatial positions for the origin handoff and application collection.
- `js/space.js` and `js/material-renderer.js`: shared projection, depth-tested materials and Canvas fallback.
- `js/function-studies.js`: fifteen task-specific input/operation/result demonstrations, including the diagnostic map and baseplate exchange.
- `js/topography.js`: shaded circular height field, contours and matching interactive section profile.
- `content/story.json`: five-stage construction narrative, without application examples.
- `js/hero-interaction.js`: drag, keyboard, separation and reset controls.
- `content/homepage.json`: the central homepage capture and its full-image viewer.
- `entry.css`: application assembly, study typography and baseplate exchange.
- `genesis.css`: continuous opening/origin, responsive staging and approved creator closing.
- `artifact.css`: current Artifact, interface passage and responsive study composition.
- `experience.css`: entry composition, image fitting and picker.
- `styles.css` and `studies.css`: visual design, extended study pacing, responsive composition and reduced motion.
- `js/studies.js`: source-to-demonstration handoff, individual phases and inspection state.

Generated files: `index.html`, `js/apps.js`, `script.js`. Edit their sources and rebuild.

## Actual software images

Current lossless assets are under `assets/evidence/<app-id>/`, derived from `C:/Users/Gene/Desktop/Artifacts Images`. `detail.webp` is a deliberate native crop; `full.webp` preserves the entire capture. Papyrus uses the updated **1531 × 1002** source. The other fifteen captures are **1425 × 950**. No upscaling, fabricated screens or generated application imagery is used.

Full captures are displayed in the later collection. Small uncropped full captures accompany every conceptual demonstration. Their layout preserves the image aspect ratio and provides an original-size viewer. Every app opens a fitted original with an actual-size option. The original-resolution limit remains: these sources are not native 4K screenshots. The archive assets under `assets/artifacts/apps/` are preserved but not used by the exhibition.

```sh
node scripts/prepare-evidence.mjs /path/to/Artifacts-Images papyrus-reader
pnpm build
pnpm test:evidence
```

Review the crop rectangle in `scripts/prepare-evidence.mjs` when a source layout changes. `assets/evidence/audit.json` records hashes, source dimensions and crop coordinates.

## Verification

This pass includes a build, focused runtime review of all sixteen desktop studies, collection hover/focus depth changes, the story handoff, touch entry, representative mobile scenes and reduced motion. These checks reported no page errors; all full captures loaded. Asset and pixel-fidelity checks pass. A short local headless Edge hero sample measured 16.7ms median and 17.4ms p95 frame intervals; this is not cross-device GPU profiling or a performance guarantee. Broad validation remains deferred until visual approval. Existing browser-suite and VALIDATION.md results predate this redesign.

```sh
pnpm test:evidence
pnpm test:assets
pnpm test
```

The browser suite defaults to installed Microsoft Edge. Set `BROWSER_CHANNEL` to another installed Chromium channel if needed. Tests cover all sixteen scroll states and image viewers, study controls, keyboard navigation, direct links, mobile layouts, reduced motion, no-JavaScript content, accessibility and local frame timing. See `VALIDATION.md` for results and limits. QA outputs are ignored under `.qa/`.
