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

The approved opening makes ARTIFACTS typography the spatial surface. It is preserved in this pass. Its field continues into the revised three-statement Starting Over origin: fragmented evidence, a reconstructed task, an archive, repeated reasoning, retained structure and software. Material surfaces advance through the light environment and construct sixteen positions before any application screenshots appear. Those positions receive the real interfaces in the collection. Diagrams are illustrative, not measured output.

The uncropped homepage begins in front of the sixteen applications and recedes as they advance. Hovering or focusing an interface brings that specific app forward, turns it toward the viewer and reduces ambient movement. On touch, one tap presents the app and the next enters it. Leaving restores the arrangement smoothly.

All sixteen studies show input, operation and result through task-specific demonstrations. Timeline alignment, recipe comparison, report assembly and signal review use clear two-dimensional relationships; TopoTracer's height field and AIX's baseplate exchange retain three-dimensional materials. GaN Temp Diagnoser relates process/clean observations to possible checks without fabricating measured values or a confirmed diagnosis. Full captures, app order and Gene's approved closing remain intact.

Read `ARTIFACTS_CREATIVE_DIRECTION.md` and `ARTIFACTS_EXPERIENCE_STORYBOARD.md` for governing direction and factual boundaries. One shared clock pauses ambient scenes offscreen. Mobile uses reduced spatial depth; reduced motion retains the narrative without pinned sequences.

Each application has an independently staged film, beginning and ending with its complete source interface. An outline highlights its relevant interface region using coordinates from the evidence audit; captures stay uncropped. Each signature operation is distinct: ordering, synchronization, event counting, interpolation, logical matching, search narrowing, compilation, diagnostic narrowing, physical exchange, spatial mapping, hierarchy collapse, review attention, normalization or temporal priority. Native scrolling controls the sequences; optional replay runs for 23.2–28.5 seconds. A second keyboard-accessible range changes a task-specific inspection region. Diagrams illustrate relationships, not measured results or cross-application integration.

## Source files

- `content/page.html`: semantic page template and copy.
- `content/exhibition.json`: sixteen multi-phase demonstration narratives and source app IDs.
- `content/apps.json`: all sixteen verified apps, purposes, original source groups and asset provenance.
- `scripts/build.mjs`: static SVG generation, HTML rendering and script bundling.
- `js/contours.js`: equal-height contour extraction for an illustrative field.
- `js/experience.js`: shared clock, scroll progression, replay, app picker and image viewer.
- `js/hero.js`: later application assembly, direct hover/focus depth inspection, touch presentation and shared-element navigation.
- `js/genesis.js`: opening/origin timing, pointer inertia and narrative controls.
- `js/identity-field.js`: approved monumental typography and opening field; hands off after the opening.
- `js/starting-over.js`: editorial evidence, reconstruction, recurrence, retention and collection handoff.
- `js/collection-layout.js`: common spatial positions and lighting for the origin handoff and application collection.
- `js/space.js` and `js/material-renderer.js`: shared projection, depth-tested materials and Canvas fallback.
- `content/films.json`: film pacing, statements and inspection controls.
- `js/instrument-film.js`: source-region registration, shared lifecycle and access controls.
- `js/films/`: individual time, field, reporting and physical choreography, with shared drawing primitives.
- `js/papyrus-study.js` and `content/papyrus.json`: dedicated logical-comparison film and example correspondence.
- `films.css` and `papyrus.css`: responsive film stages and reduced-motion composition.
- `js/topography.js`: shaded circular height field, contours and matching interactive section profile.
- `content/story.json`: Starting Over narrative, without application examples.
- `js/hero-interaction.js`: drag, keyboard, separation and reset controls.
- `content/homepage.json`: the central homepage capture and its full-image viewer.
- `entry.css`: application assembly, study typography and baseplate exchange.
- `genesis.css`: continuous opening/origin, responsive staging and approved creator closing.
- `artifact.css`: current Artifact, interface passage and responsive study composition.
- `experience.css`: entry composition, image fitting and picker.
- `styles.css` and `studies.css`: visual design, extended study pacing, responsive composition and reduced motion.
- `js/studies.js`: dispatches application films to their renderers.

Generated files: `index.html`, `js/apps.js`, `script.js`. Edit their sources and rebuild.

## Actual software images

Current lossless assets are under `assets/evidence/<app-id>/`, derived from `C:/Users/Gene/Desktop/Artifacts Images`. `detail.webp` is a deliberate native crop; `full.webp` preserves the entire capture. Papyrus uses the updated **1531 × 1002** source. Fourteen are **1425 × 950**. Metria uses its populated **3840 × 2160** native capture. No upscaling, fabricated screens or generated application imagery is used.

Full captures are displayed in the later collection. Each film opens and closes with its complete source capture. Their layout preserves the image aspect ratio and provides an original-size viewer. Every app opens a fitted original with an actual-size option. The fifteen newer populated sources remain below native 4K; their pixels are preserved without upscaling. The seven older native 4K captures were reviewed: six are empty entry states, while Metria contains useful sample charts and is now used. See `assets/evidence/README.md` for the current capture checklist. Top-level catalogue quality flags describe archive files; `evidence.sourceQuality` describes the displayed capture.

```sh
node scripts/prepare-evidence.mjs /path/to/Artifacts-Images papyrus-reader
pnpm build
pnpm test:evidence
```

Review the crop rectangle in `scripts/prepare-evidence.mjs` when a source layout changes. `assets/evidence/audit.json` records hashes, source dimensions and crop coordinates.

## Verification

`pnpm test:production` runs the focused desktop/mobile geometry, canvas-label collision and section-exit checks, writing contact sheets to `.qa/`. The current application films also receive focused browser checks for canonical order, source-image return, inspection controls, responsive layouts, reduced motion and runtime errors. Comprehensive cross-device validation remains deferred until visual approval. The older browser suite and VALIDATION.md predate this film architecture and must be updated before treating them as release gates.

```sh
pnpm test:evidence
pnpm test:assets
pnpm test
```

The browser suite defaults to installed Microsoft Edge. Set `BROWSER_CHANNEL` to another installed Chromium channel if needed. The legacy browser tests describe earlier states; they are not evidence of validation for the current films. QA outputs are ignored under `.qa/`.
