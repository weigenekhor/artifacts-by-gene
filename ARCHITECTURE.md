# Architecture

## Static build

`scripts/build-native.mjs` reads `content/apps.json`, writes `index.html` and one `content/shells/<id>.html` fragment per app. Fragment URLs include content hashes. The initial page contains the home UI and no app workspaces. Edit generators, not generated files.

`scripts/native-ui.mjs` and `scripts/complex-shells.mjs` generate default interfaces. `scripts/principles.mjs` owns original principle figures/copy. All generated URLs are relative for custom-domain and project-path GitHub Pages hosting. Keep `CNAME`, `.nojekyll`, robots and sitemap.

## Runtime boundaries

- `state.js`: validated, persisted product theme/mode. Only `.app-shell` attributes and internal controls change. Never mutate root theme, public collection or viewer.
- `native-shell.js`: source navigation, hover details, app loading, local interface controls and focus. Fetch a fragment only when chosen, cache its promise/DOM, ignore superseded requests and permit retries after errors. Apps remain inside the same frame.
- `native-layout.js`: source-derived card sizing and columns, observed against actual product dimensions.
- `native-wafer.js`: source background with compositor rotation; pause by visibility/state/media query.
- `native-motion.js`: source-derived preview motifs inside the metadata panel, not app films.
- `gallery.js`: one instance per canonical app, decoded-image transitions, one autoplay owner, swipe intent and native dialog viewer. It has no product mode/theme dependency.
- `site-motion.js`: one-time page/diagram entries through IntersectionObserver and Web Animations. No persistent animation loop.
- `site.js`: small ES-module entry point.

Website tokens and layout are in `site.css`. Product colors are scoped in `tokens.css`, product structure in `shell.css`. Responsive product rules use container queries. No runtime package, backend, Python or plotting engine; Sharp is an asset-build dependency only.

## Verification and deployment

`pnpm build`, `pnpm lint` and `pnpm test` build output, syntax-check modules and verify canonical membership, screenshot dimensions, paths, scoped state and gallery interaction rules. Browser checks additionally exercise lazy loading, focus, modes, themes, resizing and composition.

The repository root is deployable static output. Publishing this review branch does not promote production. The previous fullscreen implementation is preserved at `5e518a7`; earlier exhibition code at `5126a14`. Local `.qa/` and `versions/` are ignored and are not current specifications.
