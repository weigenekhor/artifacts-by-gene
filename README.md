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

The hero's structural routes become recurring observations, align around a reference, acquire retained checks and open a shared frame. The origin contains no application screenshots. Its final frame becomes the real homepage in the later collection, with text clearing before the handoff. Diagrams are illustrative, not measured output.

The uncropped homepage begins in front of the sixteen applications. On scroll it recedes as the apps advance, maintaining bounded rotation and pointer response. All sixteen studies now use app-specific projected geometry with depth-tested materials: event sequences, chamber stacks, recipe pairs, report assembly, diagnostics, baseplate exchanges, zone mapping and chart inspection. TopoTracer uses interpolated surface colour and a matching section profile. GaN Temp Diagnoser relates process/clean observations to recommended checks, without fabricating measured values or a confirmed diagnosis. Full captures, app order and Gene's approved closing remain intact.

Read `ARTIFACTS_CREATIVE_DIRECTION.md` and `ARTIFACTS_EXPERIENCE_STORYBOARD.md` for governing direction and factual boundaries. One shared clock pauses ambient scenes offscreen. Mobile uses reduced spatial depth; reduced motion retains the narrative without pinned sequences.

Every app has seven states from its source interface through activation, decomposition, analysis, transformation, resolution and its own closure. Native scrolling controls the sequences; optional replay runs for 17–18.8 seconds. A second keyboard-accessible range selects a task-specific inspection region. Diagrams illustrate relationships, not measured results or cross-application integration.

## Source files

- `content/page.html`: semantic page template and copy.
- `content/exhibition.json`: sixteen multi-phase demonstration narratives and source app IDs.
- `content/apps.json`: all sixteen verified apps, purposes, original source groups and asset provenance.
- `scripts/build.mjs`: static SVG generation, HTML rendering and script bundling.
- `js/contours.js`: equal-height contour extraction for an illustrative field.
- `js/experience.js`: shared clock, scroll progression, replay, app picker and image viewer.
- `js/hero.js`: later application assembly, damped expansion, bounded rotation and shared-element navigation.
- `js/genesis.js`: shared clock, projected logic field and the opening-to-evidence handoff.
- `js/origin-field.js`: routes, observations, retained structure and collection aperture.
- `js/space.js` and `js/material-renderer.js`: shared projection, depth-tested materials and Canvas fallback.
- `js/spatial-studies.js`: fifteen app-specific spatial studies.
- `js/diagnostic-study.js`: process/clean observation map and recommended checks.
- `js/topography.js`: shaded circular height field, contours and matching interactive section profile.
- `content/story.json`: five-stage construction narrative, without application examples.
- `js/hero-interaction.js`: drag, keyboard, separation and reset controls.
- `content/homepage.json`: the central homepage capture and its full-image viewer.
- `entry.css`: application assembly, study typography and baseplate exchange.
- `genesis.css`: continuous opening/origin, responsive staging and approved creator closing.
- `artifact.css`: current Artifact, interface passage and responsive study composition.
- `experience.css`: entry composition, study camera, image fitting and picker.
- `styles.css` and `studies.css`: visual design, extended study pacing, responsive composition and reduced motion.
- `js/studies.js`: shared phase choreography, inspection and camera state.

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

This pass includes a build, focused runtime review of all sixteen desktop studies, the collection depth reversal, story handoff, representative mobile scenes and reduced motion. Those checks reported no console/page errors. A short local headless Edge sample measured approximately 16.7ms median frame intervals in the hero and during TopoTracer replay; this is not cross-device GPU profiling or a performance guarantee. Broad validation remains deferred until visual approval. Existing browser-suite and VALIDATION.md results predate this redesign.

```sh
pnpm test:evidence
pnpm test:assets
pnpm test
```

The browser suite defaults to installed Microsoft Edge. Set `BROWSER_CHANNEL` to another installed Chromium channel if needed. Tests cover all sixteen scroll states and image viewers, study controls, keyboard navigation, direct links, mobile layouts, reduced motion, no-JavaScript content, accessibility and local frame timing. See `VALIDATION.md` for results and limits. QA outputs are ignored under `.qa/`.
