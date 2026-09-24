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

The opening is a spatial field of working routes, with a highlighted route that persists into the origin story. One canvas and camera turn the same geometry from a dimensional system into a rough attempt, construction guides, retained method, revision loops and ordered software structure. Five concise stages replace the previous six-scene explanation. The combined sequence is shorter and contains no app screenshots or repeated identity reveal. The diagrams are illustrative, not measured data.

The complete sixteen-plane application assembly appears after the story. Bounded rotation and damped pointer proximity change depth, orientation and lighting. From there, the sixteen individual studies unfold in canonical order. The duplicate post-study capture archive and catalogue have been removed. Full captures remain available in each study and through the homepage viewer. Gene closes with his latest approved “Three years. Sixteen applications.” account verbatim and direct email/LinkedIn links. The global pause button is removed; reduced-motion support and per-application replay remain.

Read `ARTIFACTS_CREATIVE_DIRECTION.md` and `ARTIFACTS_EXPERIENCE_STORYBOARD.md` for governing direction and factual boundaries. One shared clock pauses ambient scenes offscreen. Mobile and reduced motion retain the entire narrative without pinning.

Every app has seven states from its source interface through activation, decomposition, analysis, transformation, resolution and its own closure. Native scrolling controls the sequences; optional replay runs for 17–18.8 seconds. A second keyboard-accessible range selects a task-specific inspection region. Diagrams illustrate relationships, not measured results or cross-application integration.

## Source files

- `content/page.html`: semantic page template and copy.
- `content/exhibition.json`: sixteen multi-phase demonstration narratives and source app IDs.
- `content/apps.json`: all sixteen verified apps, purposes, original source groups and asset provenance.
- `scripts/build.mjs`: static SVG generation, HTML rendering and script bundling.
- `js/contours.js`: build-time equal-height contour extraction for an illustrative field.
- `js/experience.js`: shared clock, scroll progression, replay, app picker and image viewer.
- `js/hero.js`: later application assembly, damped expansion, bounded rotation and shared-element navigation.
- `js/genesis.js`: shared camera, projected logic field and five-stage construction choreography.
- `js/baseplate-exchange.js`: paired AIX baseplate swaps with retained identities and fixed seats.
- `content/story.json`: five-stage construction narrative, without application examples.
- `js/hero-interaction.js`: drag, keyboard, separation and reset controls.
- `content/homepage.json`: the optional homepage capture.
- `js/inspection.js`: contextual inspection notes and geometry tracking for all sixteen studies.
- `js/analysis.js`: application-specific spatial inspection and recomposition.
- `js/instruments.js`: app-specific route markers, contour layers and inspection choreography.
- `entry.css`: application assembly, study typography and baseplate exchange.
- `genesis.css`: continuous opening/origin, responsive staging and approved creator closing.
- `artifact.css`: current Artifact, interface passage and responsive study composition.
- `experience.css`: entry composition, study camera, image fitting and picker.
- `styles.css` and `studies.css`: visual design, extended study pacing, responsive composition and reduced motion.
- `scripts/study-visuals.mjs` and `js/studies.js`: app-specific diagrams and their shared phase choreography.

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

The construction pass has build/runtime checks and desktop, mobile portrait/landscape and reduced-motion visual review. Focused checks confirm all sixteen app studies remain, approved Gene copy matches exactly, opening/story imagery is screenshot-free, keyboard camera and story navigation work, and the shared clock becomes idle offscreen. A 90-frame local Edge headless sample at 1440 × 900 reported 16.7 ms median and 16.9 ms p95 frame intervals; this is a local sample, not a cross-device performance guarantee. Full validation remains deferred until visual approval. The existing browser suite and prior VALIDATION.md results predate the new combined opening/origin.

```sh
pnpm test:evidence
pnpm test:assets
pnpm test
```

The browser suite defaults to installed Microsoft Edge. Set `BROWSER_CHANNEL` to another installed Chromium channel if needed. Tests cover all sixteen scroll states and image viewers, study controls, keyboard navigation, direct links, mobile layouts, reduced motion, no-JavaScript content, accessibility and local frame timing. See `VALIDATION.md` for results and limits. QA outputs are ignored under `.qa/`.
