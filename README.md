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

The opening presents sixteen actual interfaces on aligned depth registers, with three foreground anchors and quieter supporting planes. Direct manipulation or scroll opens the assembly into a slowly rotating spatial collection. Ambient motion runs only while the hero is visible and pauses for hovered/focused interfaces or reduced motion. App links retain the shared-element handoff. A five-stage chapter shows recurring tasks becoming methods, software and an accumulated collection. Six concrete situations then explain the evidence, response and tools involved in real engineering work. A signed personal note closes the exhibition.

The complete collection follows, beginning with the uncropped ARTIFACTS homepage and then all sixteen applications in order. All seventeen captures fit fully inside their frames as scrolling advances them. The rail, arrows, horizontal touch gestures and direct links provide optional shortcuts. The final index preserves the original four collections and opens every real interface. Creator attribution stays quiet.

Read `ARTIFACTS_CREATIVE_DIRECTION.md` and `ARTIFACTS_EXPERIENCE_STORYBOARD.md` for the governing story and factual boundaries. The hero skips identical frames. Full-resolution application captures remain in the DOM viewer.

Every app has seven states from its source interface through activation, decomposition, analysis, transformation, resolution and its own closure. Native scrolling controls the sequences; optional replay runs for 17–18.8 seconds. A second keyboard-accessible range selects a task-specific inspection region. Diagrams illustrate relationships, not measured results or cross-application integration.

## Source files

- `content/page.html`: semantic page template and copy.
- `content/exhibition.json`: sixteen multi-phase demonstration narratives and source app IDs.
- `content/apps.json`: all sixteen verified apps, purposes, original source groups and asset provenance.
- `scripts/build.mjs`: static SVG generation, HTML rendering and script bundling.
- `js/contours.js`: build-time equal-height contour extraction for an illustrative field.
- `js/experience.js`: shared clock, scroll progression, replay, app picker, archive and image viewer.
- `js/hero.js`: ordered interface assembly, bounded ambient rotation and shared-element navigation.
- `content/story.json`: five-stage narrative, sixteen method mappings and six task contexts.
- `js/method-story.js`: scroll-driven method chapter and direct stage navigation.
- `js/hero-interaction.js`: drag, keyboard, separation and reset controls.
- `content/homepage.json`: the homepage capture preceding the sixteen apps.
- `js/inspection.js`: contextual inspection notes and geometry tracking for all sixteen studies.
- `js/analysis.js`: application-specific spatial inspection and recomposition.
- `js/instruments.js`: app-specific route markers, contour layers and inspection choreography.
- `entry.css`: application assembly, method narrative, task contexts and signed creator note.
- `artifact.css`: current Artifact, interface passage and responsive study composition.
- `experience.css`: entry composition, study camera, image fitting and picker.
- `styles.css` and `studies.css`: visual design, extended study pacing, responsive composition and reduced motion.
- `scripts/study-visuals.mjs` and `js/studies.js`: app-specific diagrams and their shared phase choreography.

Generated files: `index.html`, `js/apps.js`, `script.js`. Edit their sources and rebuild.

## Actual software images

Current lossless assets are under `assets/evidence/<app-id>/`, derived from `C:/Users/Gene/Desktop/Artifacts Images`. `detail.webp` is a deliberate native crop; `full.webp` preserves the entire capture. Papyrus uses the updated **1531 × 1002** source. The other fifteen captures are **1425 × 950**. No upscaling, fabricated screens or generated application imagery is used.

Full captures are displayed in the opening and collection. Small uncropped full captures accompany every conceptual demonstration. Their layout preserves the image aspect ratio and provides an original-size viewer. Every app opens a fitted original with an actual-size option. The original-resolution limit remains: these sources are not native 4K screenshots. The archive assets under `assets/artifacts/apps/` are preserved but not used by the exhibition.

```sh
node scripts/prepare-evidence.mjs /path/to/Artifacts-Images papyrus-reader
pnpm build
pnpm test:evidence
```

Review the crop rectangle in `scripts/prepare-evidence.mjs` when a source layout changes. `assets/evidence/audit.json` records hashes, source dimensions and crop coordinates.

## Verification

The latest sixteen-study visual pass has basic build/runtime checks and a focused desktop/mobile visual review only. The existing full suite and v10 results below predate this expansion; full validation is deferred until visual approval.

```sh
pnpm test:evidence
pnpm test:assets
pnpm test
```

The browser suite defaults to installed Microsoft Edge. Set `BROWSER_CHANNEL` to another installed Chromium channel if needed. Tests cover all sixteen scroll states and image viewers, study controls, keyboard navigation, direct links, mobile layouts, reduced motion, no-JavaScript content, accessibility and local frame timing. See `VALIDATION.md` for results and limits. QA outputs are ignored under `.qa/`.
