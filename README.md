# ARTIFACTS

A personal body of engineering software at https://artifactsbygene.com. The redesign is on `experience/continuous-instruments`, reviewed in [PR #3](https://github.com/weigenekhor/artifacts-by-gene/pull/3). Production changes only after merge.

## Run

```sh
python -m http.server 8001 --bind 127.0.0.1
```

Open http://127.0.0.1:8001 while that process is running. The deployed website is ordinary static files. GitHub Pages uses `main / root`; preserve `CNAME`. No runtime CDN, API keys or remote fonts are used. Asset URLs are relative and tested under `/artifacts-by-gene/`.

## The continuous story

Some engineering problems should only be solved once. Repeated work becomes a reusable method; one tool becomes many, then ARTIFACTS. Four applications carry the detailed demonstrations: Papyrus Reader, TopoTracer, GaN Temp Diagnoser and Metria SPC. Each has explanatory motion grounded by a small original software fragment. The final camera withdrawal reveals all sixteen applications in their original four Expeditions. A separate software reel gives access to every capture.

This is a replacement for the previous sixteen identical scroll intervals. See `content/STORYBOARD.md` for the transition chain, source interpretation and reference review.

One persistent Three.js environment contains reusable instanced instrument geometry, a spatial measurement surface, height-based contours, camera states and relationship paths. Native scroll supplies one clock. Typography, evidence and interaction follow that clock. There is no scroll interception or forced playback. Geometry is illustrative; it is not a simulation, live app output or a measured dataset.

## Content and implementation

```sh
pnpm install --frozen-lockfile
pnpm build
```

- `content/story.json`: narrative, four featured demonstrations and their source app IDs.
- `content/apps.json`: all sixteen verified names, purposes, original Expeditions, related workflows and capture provenance.
- `content/page.html`: semantic template, navigation and image viewer.
- `js/motion.js`: timing tokens and shared interpolation.
- `js/forms.js`: persistent instance roles across the narrative and map.
- `js/contours.js`: deterministic equal-height contour extraction for the illustrative surface.
- `js/world.js`: camera choreography, instancing, lighting, material surface, map projection and SVG fallback.
- `js/experience.js`: native-scroll progression, typography, keyboard/touch navigation, lifecycle, app focus and image reel.
- `styles.css`: desktop, portrait and short-landscape compositions.
- `scripts/build.mjs`: generates `index.html`, `js/apps.js` and bundled `script.js`.

Three.js and its used addons are bundled locally with esbuild. All other dependencies are build/QA tools. Third-party licenses are retained in `assets/licenses/` and `assets/fonts/`.

## Actual software images

The supplied folder is `C:/Users/Gene/Desktop/Artifacts Images`. Its homepage and sixteen application images were inspected along with the older 23-slide reference material. The slides contain fifteen apps; the current catalogue contains sixteen.

Current lossless files are under `assets/evidence/<app-id>/`. `detail.webp` is a deliberate crop from the source PNG; `full.webp` preserves the entire interface. Papyrus Reader uses the updated **1531 × 1002** capture; the other fifteen application captures are **1425 × 950**. These are native originals, not claimed 4K captures. No AI images or fabricated application screens are used.

The narrative loads only the active detail. The reel loads its current and neighboring details. The modal loads a full image on request, fits it initially and offers actual-size inspection. The image pipeline records source hashes and crop rectangles in `assets/evidence/audit.json`. Source pixels remain unchanged by lossless encoding. Older assets under `assets/artifacts/apps/` are retained as an independent archive.

```sh
node scripts/prepare-evidence.mjs /path/to/Artifacts-Images
# Replace one app while preserving editorial content and other images:
node scripts/prepare-evidence.mjs /path/to/Artifacts-Images papyrus-reader
pnpm build
pnpm test:evidence
```

If a source layout changes, review its crop rectangle in `scripts/prepare-evidence.mjs`. Larger inspection views require a larger native source; no upscaling pipeline manufactures detail.

## Access and performance

Navigation and app controls are keyboard accessible. The real-software reel supports touch swipes and a native select. Portrait uses one Expedition at a time, with all four directly selectable; desktop shows all sixteen instruments together. Motion can be paused and OS reduced motion uses settled compositions. The header reserves its own opaque band.

The renderer uses one scheduled loop and sleeps when settled, outside the viewport or in a hidden tab. Instances share geometry/materials. DPR is capped at 2 on desktop, 1.5 on portrait, with a further 3.2-million-pixel drawing-buffer budget. No screenshot textures are uploaded to WebGL. The contour graph is computed once; its height follows the surface growth. Context loss switches to the SVG fallback. Without JavaScript the narrative and complete linked catalogue remain available.

## Verify

```sh
pnpm build
pnpm test:evidence
pnpm test:assets
pnpm test
```

The browser suite defaults to installed Microsoft Edge. Set `BROWSER_CHANNEL` to another installed Chromium channel if needed. It checks story progression, all sixteen apps and images, the reel/viewer, keyboard links, responsive layouts, reduced motion, SVG/no-JavaScript fallback, accessibility and local frame timing. QA images and reports are ignored under `.qa/`. See `VALIDATION.md` for actual results and limits.
