# Architecture

## Build

`scripts/build-native.mjs` reads `content/apps.json` and `content/home-reference.json` and writes `index.html`. Edit the generators rather than generated HTML. `scripts/native-ui.mjs` assembles source-rendered home layers, semantic hotspots and chrome; `scripts/principles.mjs` owns the thinking cycle.

All URLs are relative for custom-domain and project-path GitHub Pages. Preserve CNAME, .nojekyll, robots and sitemap. The repository root is static deployable output; no runtime package, backend, Python or plotting engine is needed.

## Native reference pipeline

`scripts/export-home-reference.py` imports only the actual HomeWidget from the desktop source and renders four theme/mode states offscreen with PySide6. It records card bounds into `content/home-reference.json`, with 2× home/hover PNG intermediates under ignored `.qa/home-export/`. It never imports processing widgets or edits desktop source/captures.

`scripts/prepare-home-assets.mjs` converts these into committed WebPs under `assets/native/home/`. Native content is rasterized by its actual renderer, not approximated using CSS. Surrounding chrome uses browser controls styled from source; this is not a claim that HTML window decorations render pixel-identically to Qt on every OS.

## Runtime

- `state.js`: validated persisted product appearance/mode; only product attributes/controls change.
- `native-shell.js`: uniform frame scaling, native hotspots/navigation/details, and actual screenshot views. Decode images on selection, cache requests, ignore superseded loads and show recoverable errors. Return Home restores focus. Mobile has a separate selector.
- `gallery.js`: one instance per canonical app, decoded crossfades, a single autoplay owner, touch intent and native-dialog viewer. Independent of product mode/theme.
- `site-motion.js`: one-time entries/stroke drawing through IntersectionObserver and Web Animations; no persistent loop.
- `site.js`: entry module.

`site.css` owns the public design, `tokens.css` scopes product colors, and `shell.css` owns fixed product geometry and capture toolbar. Sharp is a build dependency only.

The generated `content/shells/` fragments, `scripts/complex-shells.mjs`, `native-layout.js`, `native-wafer.js` and `native-motion.js` have been removed. Do not bring back fabricated/default app interfaces or redundant geometry/motion runtimes.

## Verification and deployment

Build, syntax and eight automated checks cover canonical order, screenshot dimensions, deployment paths, scoped state, swipe/autoplay rules, native home mappings and requested feature/copy invariants. Browser review verifies composition, navigation, image ownership, responsive aspect, reduced motion and no-JS.

Current review branch: `rebuild/contained-product`. Previous work is recoverable at `a706a60`, older fullscreen `5e518a7`, earlier exhibition `5126a14`. Publishing a review branch does not promote production. Local `.qa/` and `versions/` are ignored.
