# Architecture

## Panel fidelity and motion refinement — 17 October 2026

The current desktop Application Info drawer is 218 logical pixels wide, with a 44-pixel header. The website now uses that width, a visible Application Info header and close button, and a title/status bar that begins after the expanded navigation and information columns. Native home and application layouts were re-exported for the 218/398-pixel information/combined offsets. Existing desktop code and user preferences remain unchanged.

The hero introduction now reads “ARTIFACTS / 19 APPLICATIONS BUILT AGAINST INEFFICIENCY”. The three thinking studies use a coordinated six-second cycle with stronger layer separation, outward block travel, staggered sheet movement and brighter silver strokes. Figure 3 ends with “Make each iteration earn its place in the work.” Reduced-motion and offscreen pausing remain supported.

Browser access initially opened the local page but subsequently reported disabled, including after the user re-enabled it. Updated composed browser rendering has not yet been visually verified; automated validation and publishing status are recorded in STATUS.md.


## Current instruction — desktop layouts only (17 October 2026)

Application demos are removed. Clicking an app opens its actual unpopulated desktop widget layout, exported directly from the current ARTIFACTS MainWindow and rendered as HTML with native vector control details. All 19 apps have three themes and four sidebar widths. There are no application screenshots, invented sample results or processing actions. Existing native buttons such as Load Example are visible but presentation-only. See [DESKTOP_LAYOUTS.md](DESKTOP_LAYOUTS.md).

This supersedes all historical demo/walkthrough directions below. Their source, fixtures and screenshot workspaces have been removed; Git preserves them. The homepage, public gallery, title bar and original grey website atmosphere are preserved. Browser visual verification remains pending due to the local-URL security policy; do not claim pixel identity or deploy as visually verified.

## Historical notes (superseded where they conflict)

## Current correction — live app demos (17 October 2026)

The latest user request rejects static app screenshots and supersedes the recorded-walkthrough approach below. All 19 hero apps now use local HTML controls, actual sample records and SVG results. See [LIVE_DEMOS.md](LIVE_DEMOS.md) for implementation, coverage, tests and explicit limitations. Homepage labels use regular single-line native typography; expedition headings and title-bar labels cannot wrap. The original website atmosphere and enlarged heading remain.

The recorded workspace images are archived, not loaded by the interactive runtime. Final browser rendering is pending because the browser security policy rejected local-URL access. Do not describe this as pixel-verified or publish it as fully reviewed.


## Native walkthrough correction — 17 October 2026

The former generated sample model is removed. scripts/export-demo-scenes.py runs the real desktop widgets inside the existing offline fixture harness and exports 2× lossless views plus native control bounds into assets/native/workspaces/ and content/workspaces/. scripts/import-topopro-scene.mjs crops the verified GPU-rendered TopoPro capture because software Qt cannot render WebGL. Original captures and desktop source remain untouched.

The normal build first runs scripts/build-demo-manifest.mjs, which publishes only supported source-measured controls and validated scene links. demo-model.js selects recorded states; demo-view.js layers accessible controls over their native geometry; demo-workspace.js manages independent app state, menus, asynchronous image loading, theme changes, history and Home. Actual compiler outputs are in assets/samples/. Runtime loads only the active view. The homepage and gallery pipeline remain separate.

This supersedes previous generic-demo claims. It does not implement live desktop calculations, file uploads, database access, equipment connections, arbitrary chart gestures or every desktop control.


## Current three-theme integration

Hero clarity refinement: homepage content/hover exports now use 4× lossless rendering and 4× native glyph pixmaps. Only one 2D uniform scale applies to the UI; perspective and nested GPU promotion no longer resample it. The independent wafer animation remains. `notification-centre.js` owns an isolated, resettable sample feed and accessible title-bar popover; there is no notification network or persistence integration.

The current catalogue contains 19 applications, 138 captures, 24 native home layouts and 81 native information panels. The default is Tenebrismo appearance with Pentimento edition. `state.js` migrates old appearance keys and keeps edition and appearance independent.

`appearance-menu.js` owns the Suture picker, its below-button menu, keyboard movement and dismissal. `application-age.js` computes local calendar years/months and schedules bounded refreshes across midnight, clock changes and resumed pages. `content/info-reference.json` supplies the actual desktop panel geometry for the live age value and contact links. Both exporters use `desktop-export-style.py` to reproduce desktop stylesheet routing without changing desktop files.

The pre-refresh baseline is preserved at tag `review/before-three-themes-20261017`. Older two-theme counts below describe the earlier implementation.

## Build

`scripts/build-native.mjs` reads `content/apps.json`, `content/home-layouts.json` and `content/panel-reference.json`, then writes `index.html`. Edit generators, not output. `scripts/native-ui.mjs` assembles source-rendered layers and chrome; `scripts/principles.mjs` owns the thinking cycle. `native-home.js` shares markup and viewport-safe panel positioning between build/runtime.

All URLs are relative for custom-domain and project-path GitHub Pages. Preserve CNAME, .nojekyll, robots and sitemap. The repository root is static deployable output; no runtime package, backend, Python or plotting engine is needed.

## Native reference pipeline

`scripts/export-home-layouts.py` imports actual HomeWidget read-only. Sixteen variants cover both themes/modes × closed/navigation/information/both panel states. Complete scrollable content and hover cards render at 2×, with source bounds in `content/home-layouts.json`. The renderer exports its native tonal field, fixed lighting and prepared wafer texture separately. CSS rotates only the wafer using the native pivot and geometry. Old baked-wafer background images are removed.

`scripts/export-panel-reference.py` renders ModuleDetailsPanel under its actual pagesContainer QSS scope. Fifty theme/mode/tool variants include native motion strips and preview images. Geometry lives in `content/panel-reference.json`. Application Info uses the exact bounded construction block from Artifacts.py. Neither exporter runs processing widgets or changes source files.

Committed WebPs live in `assets/native/layouts/` and `assets/native/panels/`. Surrounding chrome uses source-styled browser controls; this is not a claim of pixel-identical OS decorations on every platform. The obsolete four-image home exporter and hero screenshot-launch system are removed.

## Runtime

- `state.js`: validated persisted mode and theme controls remain independent; the selected theme chooses matching gallery captures without changing the public palette or membership.
- `native-shell.js`: uniform scale, native panel push/reflow, hover/focus/touch information, prepared bounded-LRU panel loads, decoded motion-strip caching, stale-request protection and dismissal. Hero cards do not launch screenshots. The separate mobile information selector has been removed; touch uses the same bounded native panel.
- `native-home.js`: source-coordinate markup and bounded panel placement.
- `gallery.js`: one instance per canonical app, decoded crossfades, a single autoplay owner, image-body next-view navigation, per-app gallery positions, touch intent and native-dialog viewer; only the dedicated expand control opens the dialog. Capture subsets follow the shared edition. Offscreen cards load the correct theme when reached; stale-theme imagery is hidden until the replacement has decoded.
- `site-motion.js`: event-driven scroll handoffs and closing credits. `experience-motion.js`: one retained continuous hero focus, damped reasoning proximity, a resize-measured SVG signal path, sequential graphic resolution and visibility/reduced-motion coordination. Pointer sampling stops once settled; callbacks never rebuild the native grid. Narrow screens use explicit state selection. Event/observer lifetimes are cleaned up on document disposal. `panel-cache.js`: bounded decoded-image reuse and coalesced pending loads. No pointer movement rebuilds the native grid.
- `site.js`: entry module.

`site.css` owns public design, `tokens.css` scopes product colors, `shell.css` owns native geometry/wafer rotation, and `thinking.css` owns the shared reasoning timeline. Sharp is build-only; animated information strips load only while requested.

The generated `content/shells/` fragments, `scripts/complex-shells.mjs`, `native-layout.js`, `native-wafer.js` and `native-motion.js` have been removed. Do not bring back fabricated/default app interfaces or redundant geometry/motion runtimes.

## Verification and deployment

Build, syntax and automated checks cover canonical order, screenshot dimensions, deployment paths, edition/capture coherence, swipe/autoplay, all native panel layouts, viewport-safe hover placement and requested copy. Browser review checks actual rendered composition, keyboard/touch behavior, reduced motion and no-JS.

Current review branch: `rebuild/contained-product`. Safety baseline for this pass: `60b50b8`, tagged `review/two-states-60b50b8`; earlier native `51750c3`, capture `cc2c3fc` and contained `a706a60` remain in Git. Publishing the review branch does not promote production. Local `.qa/` and `versions/` are ignored.
