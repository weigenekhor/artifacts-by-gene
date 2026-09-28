# ARTIFACTS — engineering software exhibition

Personal engineering work at https://artifactsbygene.com. Current review branch: experience/ee65f20-rebuild. Production changes only after review and merge.

## Run and deploy

```sh
pnpm install --frozen-lockfile
pnpm build
python -m http.server 8001 --bind 127.0.0.1
```

Open http://127.0.0.1:8001 while the server runs. GitHub Pages serves committed static files from main/root. Preserve CNAME. Asset URLs are relative, with no runtime CDN, backend or remote fonts. WebGL material rendering has a Canvas fallback.

## Experience and source

Approved interactive hero → almost-wordless origin → continuous real homepage reveal → sixteen large gallery previews → optional detailed films → exact personal closing.

Desktop gallery previews play once on hover/focus. Mobile plays the centered visible card. Every card rests on the complete real screenshot. Hover/focus opens a 5.0–5.3 second film on a warm light stage, holds, then returns to that screenshot on leave. The main document has no forced sixteen-film scroll sequence. Click/Enter opens a film with full real interface, playback, inspection and an original-size image viewer. Escape returns to the card. Reduced motion keeps the real captures still and a readable story.

- content/page.html: page template and approved words.
- content/gallery.json: cues, accents and preview durations.
- content/apps.json and exhibition.json: verified catalogue and real order.
- content/films.json: detail statements, timing and inspection semantics.
- content/story.json: approved origin lines and accessible descriptions.
- js/gallery.js: real-screenshot rest state, nearby prewarming, hover/focus/mobile active state and one-shot preview.
- js/experience.js: shared clock, dialogs, navigation and source viewer.
- js/genesis.js and origin-construction.js: origin clock, material scene and single homepage handoff.
- js/identity-field.js and topography.js: protected hero and TopoTracer.
- js/instrument-film.js and films/: detail lifecycle and physical films in history-worlds.js, document-worlds.js, hardware-worlds.js and measurement-worlds.js. stage.js supplies lighting and geometry primitives.
- js/space.js and material-renderer.js: projection, material light, one shared GPU target and fallback.
- js/epilogue.js: exact Gene copy in held spatial compositions.
- gallery.css: main gallery and detail overlay; films.css: film safe rows and closing.
- scripts/build.mjs: builds index.html, js/apps.js and script.js. Edit sources, then rebuild.

Read ARTIFACTS_CREATIVE_DIRECTION.md and ARTIFACTS_EXPERIENCE_STORYBOARD.md before visual edits. ARTIFACTS_MOTION_REVIEW.md records each application's meaning and factual boundaries.

## Real imagery

Current full captures are lossless WebP under assets/evidence/<app-id>/. Fifteen are 1425×950, including the current recipe-text Papyrus screenshot. Metria uses a populated 3840×2160 capture. Full frames preserve pixels and aspect ratio. The detail crop is used for source-region registration, not presented as a fabricated app.

Original PNGs are in C:/Users/Gene/Desktop/Artifacts Images. To replace one capture:

```sh
node scripts/prepare-evidence.mjs /path/to/source-folder papyrus-reader
pnpm build
pnpm test:evidence
```

Review the crop region when the layout changes. Higher-resolution populated captures are still needed for native fullscreen 4K inspection of the fifteen smaller sources; do not upscale them. See assets/evidence/README.md. Procedural films are resolution-independent and do not imply live reactor output.

## Checks

```sh
pnpm test
pnpm test:previews
pnpm test:production
pnpm test:assets
pnpm test:evidence
pnpm test:assignment
```

Browser checks use installed Edge by default. Production geometry checks expect the local server on 8001. Review captures/results are ignored under .qa/. VALIDATION.md records actual outcomes; passing tests does not equal artistic approval or guarantee performance on every device.

Historical /versions/<commit>/ URLs are immutable local review archives. A query parameter on the root URL does not save a version. Keep previous archives when making a new one.
