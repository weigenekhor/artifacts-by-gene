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

The opening is an original WebGL2 silicon object: sixteen instanced layers with procedural surface detail, bevel lighting, pointer response and scroll-driven separation. It uses no screenshot textures and has a CSS fallback. A short origin passage leads into sixteen purpose-built demonstrations in the original application order. Native scroll moves each study forward; a keyboard-accessible range control lets visitors examine the transformation directly.

The complete collection follows. All sixteen applications advance sequentially with scrolling. The rail, arrows, horizontal touch gestures and direct links provide optional shortcuts. The final index preserves the original four collections and opens every real interface. Creator attribution stays quiet.

See `content/STORYBOARD.md` for the story and factual boundaries. The previous full-page WebGL timeline remains removed. A single instanced draw call handles the new hero, with capped/adaptive resolution and rendering paused offscreen. Study perspective is handled by CSS; SVG geometry is generated at build time. All sixteen studies have staggered assembly, task-specific inspection details and optional 14.5–17.5 second replay.

## Source files

- `content/page.html`: semantic page template and copy.
- `content/exhibition.json`: sixteen three-stage demonstration narratives and source app IDs.
- `content/apps.json`: all sixteen verified apps, purposes, original source groups and asset provenance.
- `scripts/build.mjs`: static SVG generation, HTML rendering and script bundling.
- `js/contours.js`: build-time equal-height contour extraction for an illustrative field.
- `js/experience.js`: shared clock, scroll progression, replay, app picker, archive and image viewer.
- `js/hero.js`: procedural silicon geometry and lighting.
- `js/instruments.js`: app-specific route markers, contour layers and inspection choreography.
- `experience.css`: entry composition, study camera, image fitting and picker.
- `styles.css` and `studies.css`: visual design, extended study pacing, responsive composition and reduced motion.
- `scripts/study-visuals.mjs` and `js/studies.js`: app-specific diagrams and their shared three-stage choreography.

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
