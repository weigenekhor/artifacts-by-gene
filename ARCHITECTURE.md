# Architecture

## Build

`scripts/build-native.mjs` reads `content/apps.json`, `content/home-layouts.json` and `content/panel-reference.json`, then writes `index.html`. Edit generators, not output. `scripts/native-ui.mjs` assembles source-rendered layers and chrome; `scripts/principles.mjs` owns the thinking cycle. `native-home.js` shares markup and viewport-safe panel positioning between build/runtime.

All URLs are relative for custom-domain and project-path GitHub Pages. Preserve CNAME, .nojekyll, robots and sitemap. The repository root is static deployable output; no runtime package, backend, Python or plotting engine is needed.

## Native reference pipeline

`scripts/export-home-layouts.py` imports actual HomeWidget read-only. Sixteen variants cover both themes/modes × closed/navigation/information/both panel states. Complete scrollable content and hover cards render at 2×, with source bounds in `content/home-layouts.json`. The renderer exports its native tonal field, fixed lighting and prepared wafer texture separately. CSS rotates only the wafer using the native pivot and geometry. Old baked-wafer background images are removed.

`scripts/export-panel-reference.py` renders ModuleDetailsPanel under its actual pagesContainer QSS scope. Fifty theme/mode/tool variants include native motion strips and preview images. Geometry lives in `content/panel-reference.json`. Application Info uses the exact bounded construction block from Artifacts.py. Neither exporter runs processing widgets or changes source files.

Committed WebPs live in `assets/native/layouts/` and `assets/native/panels/`. Surrounding chrome uses source-styled browser controls; this is not a claim of pixel-identical OS decorations on every platform. The obsolete four-image home exporter and hero screenshot-launch system are removed.

## Runtime

- `state.js`: one validated persisted edition pairs Legacy/Origin and Pentimento/Pentimento; it selects matching gallery captures without changing the public palette or membership.
- `native-shell.js`: uniform scale, native panel push/reflow, hover/focus/touch information, prepared bounded-LRU panel loads, stale-request protection and dismissal. Hero cards do not launch screenshots. Mobile has an information selector.
- `native-home.js`: source-coordinate markup and bounded panel placement.
- `gallery.js`: one instance per canonical app, decoded crossfades, a single autoplay owner, touch intent and native-dialog viewer. Capture subsets follow the shared edition. Offscreen cards load the correct theme when reached; stale-theme imagery is hidden until the replacement has decoded.
- `site-motion.js`: event-driven scroll handoffs and closing credits. `experience-motion.js`: one retained continuous hero focus, damped reasoning proximity, a resize-measured SVG signal path, sequential graphic resolution and visibility/reduced-motion coordination. Pointer sampling stops once settled; callbacks never rebuild the native grid. Narrow screens use explicit state selection. Event/observer lifetimes are cleaned up on document disposal. `panel-cache.js`: bounded decoded-image reuse and coalesced pending loads. No pointer movement rebuilds the native grid.
- `site.js`: entry module.

`site.css` owns public design, `tokens.css` scopes product colors, `shell.css` owns native geometry/wafer rotation, and `thinking.css` owns the shared reasoning timeline. Sharp is build-only; animated information strips load only while requested.

The generated `content/shells/` fragments, `scripts/complex-shells.mjs`, `native-layout.js`, `native-wafer.js` and `native-motion.js` have been removed. Do not bring back fabricated/default app interfaces or redundant geometry/motion runtimes.

## Verification and deployment

Build, syntax and automated checks cover canonical order, screenshot dimensions, deployment paths, edition/capture coherence, swipe/autoplay, all native panel layouts, viewport-safe hover placement and requested copy. Browser review checks actual rendered composition, keyboard/touch behavior, reduced motion and no-JS.

Current review branch: `rebuild/contained-product`. Safety baseline for this pass: `60b50b8`, tagged `review/two-states-60b50b8`; earlier native `51750c3`, capture `cc2c3fc` and contained `a706a60` remain in Git. Publishing the review branch does not promote production. Local `.qa/` and `versions/` are ignored.
