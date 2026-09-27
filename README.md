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

The approved opening remains unchanged. The wordless origin visits an obstructed route, an alignment mechanism and a report assembly. Each intervention remains in the same environment as the camera pulls back. A central material surface resolves into the real homepage and continues into the collection. These are interpretations of friction and improvement, not measured output or a claim that the applications exchange data. This revision is for visual review.

The uncropped homepage begins in front of the sixteen applications and recedes as they advance. Hovering or focusing an interface brings that specific app forward, turns it toward the viewer and reduces ambient movement. On touch, one tap presents the app and the next enters it. Leaving restores the arrangement smoothly.

All sixteen films have their own camera route, visual scale, material treatment and inspection composition. Physical trajectories, document fields, measurement surfaces, temporal gates and structural hierarchies explain verified operations. GaN Temp Diagnoser narrows recommended checks using process/clean context; it never asserts a confirmed cause. Complete captures and canonical app order remain intact. Metria's actual inspection rule continues into a four-beat epilogue using Gene's exact approved wording.

Read `ARTIFACTS_CREATIVE_DIRECTION.md` and `ARTIFACTS_EXPERIENCE_STORYBOARD.md` for governing direction and factual boundaries. One shared clock pauses ambient scenes offscreen. Mobile uses reduced spatial depth; reduced motion retains the narrative without pinned sequences.

Each application has an independently staged film, beginning and ending with its complete source interface. An outline highlights its relevant interface region using coordinates from the evidence audit; captures stay uncropped. Each signature operation is distinct: per-wafer reconstruction, recipe-based renewal, illustrative processed-wafer counts, interpolation, named XML correspondence, chart dispatch, report compilation, paired-context diagnosis, baseplate exchange, angular sampling windows, device-property comparison, status evidence, recent-population review, gated renewal, context-preserving report append and linked investigation. Native scrolling controls the sequences; optional replay runs for 23.2–28.5 seconds. A second keyboard-accessible range changes a task-specific inspection region. Diagrams illustrate relationships, not measured results or cross-application integration.

## Source files

- `content/page.html`: semantic page template and copy.
- `content/exhibition.json`: sixteen multi-phase demonstration narratives and source app IDs.
- `content/apps.json`: all sixteen verified apps, purposes, original source groups and asset provenance.
- `scripts/build.mjs`: static SVG generation, HTML rendering and script bundling.
- `js/experience.js`: shared clock, scroll progression, replay, app picker and image viewer.
- `js/hero.js`: later application assembly, direct hover/focus depth inspection, touch presentation and shared-element navigation.
- `js/genesis.js`: opening/origin timing, pointer inertia and narrative controls.
- `js/identity-field.js`: approved monumental typography and opening field; hands off after the opening.
- `js/origin-film.js`: wordless camera route, lighting evolution and persistent collection handoff.
- `js/films/environment.js`: the same physical mechanisms used by both origin and collection.
- `js/films/set.js`: material volumes, continuous ribbon geometry, wafers and terrain.
- `js/collection-layout.js`: size-aware asymmetric packing, four anchors and shared handoff positions.
- `js/films/studio.js` and `js/material-renderer.js`: camera projection, smooth normals, depth-tested materials and Canvas fallback.
- `content/films.json`: film pacing, statements and inspection controls.
- `js/instrument-film.js`: source-region registration, shared lifecycle and access controls.
- `js/films/`: time, field, document, reporting and physical choreography; `composition.js` owns each film's desktop/mobile safe regions.
- `js/papyrus-study.js` and `content/papyrus.json`: dedicated logical-comparison film and example correspondence.
- `films.css` and `papyrus.css`: responsive film stages and reduced-motion composition.
- `js/films/instruments.js`: illustrative processed-wafer totals, measurement surface, baseplate exchange and angular windows.
- `content/story.json`: accessible descriptions of the wordless origin; no early application examples.
- `js/epilogue.js` and `epilogue.css`: Metria rule handoff and four distinct typographic compositions.
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

Current lossless assets are under `assets/evidence/<app-id>/`, derived from `C:/Users/Gene/Desktop/Artifacts Images`. `detail.webp` is a deliberate native crop; `full.webp` preserves the entire capture. Fifteen sources, including the replacement Papyrus capture, are **1425 × 950**. Metria uses its populated **3840 × 2160** native capture. No upscaling, fabricated screens or generated application imagery is used. The replacement Papyrus image shows text comparison; its explanatory middle explicitly illustrates the separately verified XML identity mode.

Full captures are displayed in the later collection. Each film opens and closes with its complete source capture. Their layout preserves the image aspect ratio and provides an original-size viewer. Every app opens a fitted original with an actual-size option. The fifteen newer populated sources remain below native 4K; their pixels are preserved without upscaling. The seven older native 4K captures were reviewed: six are empty entry states, while Metria contains useful sample charts and is now used. See `assets/evidence/README.md` for the current capture checklist. Top-level catalogue quality flags describe archive files; `evidence.sourceQuality` describes the displayed capture.

```sh
node scripts/prepare-evidence.mjs /path/to/Artifacts-Images papyrus-reader
pnpm build
pnpm test:evidence
```

Review the crop rectangle in `scripts/prepare-evidence.mjs` when a source layout changes. `assets/evidence/audit.json` records hashes, source dimensions and crop coordinates.

## Verification

The current browser suites start their own static server under a GitHub Pages-style subpath. `pnpm test` checks all sixteen source returns, inspection controls, order, viewport smoke checks, reduced motion and accessibility. `pnpm test:continuity` checks the persistent homepage handoff, collection visibility, pin interaction and no-JavaScript access. `pnpm test:production` checks desktop/mobile geometry, canvas-label bounds and section exits, producing contact sheets in ignored `.qa/`.

```sh
pnpm build
pnpm test:assets
pnpm test:evidence
pnpm test
pnpm test:continuity
pnpm test:production
pnpm test:reports
pnpm test:cinema
pnpm test:collection
```

Tests default to installed Microsoft Edge; set `BROWSER_CHANNEL` for another installed Chromium channel. `test:cinema` sweeps film composition and canvas labels throughout progress, including alternate inspection states. See `VALIDATION.md` for actual coverage and limitations, and `ARTIFACTS_IMPLEMENTATION_REPORT.md` for the film-by-film implementation record.
