# Architecture

## Build

`scripts/build-native.mjs` reads `content/apps.json`, `content/home-layouts.json` and `content/panel-reference.json`, then writes `index.html`. Edit generators, not output. `scripts/native-ui.mjs` assembles source-rendered layers and chrome; `scripts/principles.mjs` owns the thinking cycle. `native-home.js` shares markup and viewport-safe panel positioning between build/runtime.

All URLs are relative for custom-domain and project-path GitHub Pages. Preserve CNAME, .nojekyll, robots and sitemap. The repository root is static deployable output; no runtime package, backend, Python or plotting engine is needed.

## Native reference pipeline

`scripts/export-home-layouts.py` imports actual HomeWidget read-only. Sixteen variants cover both themes/modes × closed/navigation/information/both panel states. Background, complete scrollable content and hover cards render at 2×, with source bounds in `content/home-layouts.json`.

`scripts/export-panel-reference.py` renders ModuleDetailsPanel under its actual pagesContainer QSS scope. Fifty theme/mode/tool variants include native motion strips and preview images. Geometry lives in `content/panel-reference.json`. Application Info uses the exact bounded construction block from Artifacts.py. Neither exporter runs processing widgets or changes source files.

Committed WebPs live in `assets/native/layouts/` and `assets/native/panels/`. Surrounding chrome uses source-styled browser controls; this is not a claim of pixel-identical OS decorations on every platform. The obsolete four-image home exporter and hero screenshot-launch system are removed.

## Runtime

- `state.js`: validated persisted product appearance/mode; only product attributes/controls change.
- `native-shell.js`: uniform scale, native panel push/reflow, hover/focus/touch information, decoded panel loads, stale-request protection and dismissal. Hero cards do not launch screenshots. Mobile has an information selector.
- `native-home.js`: source-coordinate markup and bounded panel placement.
- `gallery.js`: one instance per canonical app, decoded crossfades, a single autoplay owner, touch intent and native-dialog viewer. Independent of product mode/theme.
- `site-motion.js`: event-driven scroll handoffs and one-time cycle/closing-credit choreography. At most one queued scroll frame; nothing runs at rest.
- `site.js`: entry module.

`site.css` owns public design, `tokens.css` scopes product colors, and `shell.css` owns native panel geometry. Sharp is build-only; animated information strips load only while requested.

The generated `content/shells/` fragments, `scripts/complex-shells.mjs`, `native-layout.js`, `native-wafer.js` and `native-motion.js` have been removed. Do not bring back fabricated/default app interfaces or redundant geometry/motion runtimes.

## Verification and deployment

Build, syntax and eleven automated checks cover canonical order, screenshot dimensions, deployment paths, scoped state, swipe/autoplay, all native panel layouts, viewport-safe hover placement and requested copy. Browser review checks actual rendered composition, keyboard/touch behavior, reduced motion and no-JS.

Current review branch: `rebuild/contained-product`. Safety baseline `cc2c3fc`; previous contained `a706a60`, older fullscreen `5e518a7`. Publishing the review branch does not promote production. Local `.qa/` and `versions/` are ignored.
