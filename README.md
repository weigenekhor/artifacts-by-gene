# ARTIFACTS

An interactive engineering narrative at https://artifactsbygene.com. The real ARTIFACTS identity leads; personal attribution appears once in the footer.

## Run and deploy

```sh
python -m http.server 8001 --bind 127.0.0.1
```

Open http://127.0.0.1:8001 while that server is running. A refused connection means the local server has stopped; GitHub Pages does not depend on it.

The site is static HTML, CSS and ES modules, with **no runtime dependencies**. Generated files are committed. GitHub Pages can serve `main / root` directly, without a build service. `CNAME` remains `artifactsbygene.com`; asset URLs also work below `/artifacts-by-gene/`. The redesign is isolated on `experience/engineering-in-motion` for review before merging.

## The narrative

One persistent WebGL environment moves through material, friction, execution, tools, four functional lenses, the full ecosystem and a quiet conclusion. Native scroll advances the camera and morphs shared ribbon geometry. The opening is skippable and never blocks navigation.

**Engineering is complex. Execution shouldn't be.**

The 16 actual app names and purposes come from the existing catalogue, cross-checked against the reference presentation. Observe, Compare, Diagnose and Coordinate are editorial workflow lenses. The four original Expeditions remain the catalogue categories and define the connections in the ecosystem.

Each application has a distinct procedural interpretation of its function: histories, topography, comparisons, diagnostic paths, zones, schedules, compilation or monitoring. **These are labelled synthetic conceptual illustrations, not process simulations, application outputs or production measurements.** The form controls change the illustration only. No internal reference-slide values or paths are published.

Select an instrument in the ecosystem, use the complete text index, or jump directly with `#app-<id>`. Keyboard users can move between nodes with arrow keys, use native controls and close the index with Escape. The index traps focus and returns it to its opener.

## Source structure

| Source              | Responsibility                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `content/apps.json` | All 16 apps, verified purposes, original categories, workflow lenses, concepts, relationships and archived capture provenance. |
| `content/page.html` | Semantic narrative and metadata template.                                                                                      |
| `scripts/build.mjs` | Generates `index.html`, public `js/apps.js` and 21 static SVG fallback diagrams.                                               |
| `js/geometry.js`    | Pure synthetic geometry functions; shared topology permits continuous morphing.                                                |
| `js/world.js`       | One WebGL draw call, material shader, camera, pointer inertia, projection, context recovery and render budgets.                |
| `js/exhibition.js`  | Scene choreography, app selection, direct links and accessible directory.                                                      |
| `js/motion.js`      | Sleeping frame scheduler and motion preferences.                                                                               |
| `js/tokens.js`      | Art direction, camera poses, render limits and timing.                                                                         |
| `styles.css`        | Desktop, portrait, short-screen, reduced-motion and static layouts.                                                            |
| `assets/brand/`     | Original ARTIFACTS vectors.                                                                                                    |
| `CODEX_HANDOFF.md`  | Current implementation status and continuation notes.                                                                          |

Edit the sources, then run `node scripts/build.mjs`. Generated output must stay committed. The reference presentation and local QA images remain outside the published source.

## Motion and resilience

- Pixel ratio capped at 1.5; drawing-buffer budgets of 1.5 million desktop / 520,000 mobile pixels, with adaptive downscaling under sustained slow frames.
- 20,640 desktop / 10,368 mobile vertices and one indexed draw per rendered frame. Mobile acquisition sweep capped at 24 fps; interaction remains responsive to the shared clock.
- Camera and pointer settle with damping. Static views stop rendering; hidden pages pause the scheduler and the final scene sleeps.
- Short screens use a flowing composition instead of staged sticky scenes.
- OS reduced motion and the session motion toggle retain readable compositions and every app interaction.
- Missing WebGL, missing derivative support or context loss exposes generated SVG diagrams. Restoring the context rebuilds buffers and shaders.
- With JavaScript disabled, semantic content, diagrams and the complete 16-app directory remain available.

## Validate

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test:geometry
pnpm test:assets
pnpm exec playwright install chromium
pnpm test
```

On Windows with Edge already installed, set `$env:BROWSER_CHANNEL='msedge'` before `pnpm test` instead of installing Chromium. The browser suite starts its own temporary HTTP server and saves ignored evidence to `.qa/`. See [VALIDATION.md](VALIDATION.md) for results and limitations.

## Preserved software captures

Original screenshots and their lossless derivatives remain in `assets/artifacts/apps/` as an archive; the new narrative does not request them. Seven are native 3840 × 2160; nine are 2048 × 1104 JPEG-derived sources. They have not been falsely upscaled. Their provenance and optional recapture instructions remain in [the capture audit](assets/artifacts/README.md). Replacing those archived images is not required to use the current procedural experience.
