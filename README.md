# Artifacts by Gene

An interactive exhibition of all **16 ARTIFACTS applications** at https://artifactsbygene.com. ARTIFACTS is the main identity; Gene appears as a quiet attribution.

Static HTML, CSS and JavaScript modules. No runtime dependencies, CDN, tracking, audio or scroll interception. The real ARTIFACTS symbol and self-hosted Geist font are included.

## Preview and GitHub Pages

Run `python -m http.server 8000` from this directory, then open `http://localhost:8000`.

Generated HTML is checked in. GitHub Pages can serve **main / root** directly, with no Actions build or package installation. The existing `CNAME` remains `artifactsbygene.com`. All local assets and modules use relative URLs; deployment under `/artifacts-by-gene/` is also tested. Merge the review branch only after review.

## The experience

- A skippable opening assembles the actual three-layer symbol and spatial title, lights the silicon surface, and reveals distant real application screens.
- Real UI regions organise behind “Complexity is a given. Clarity is engineered.”
- Sixteen screen planes assemble into a collection, with direct access to the four original Expeditions.
- A continuous camera stage presents every application. Screens approach from depth, settle frontally, expose an actual native-pixel detail, then separate into strips or columns as the next interface arrives. Each app has an individual pose and pacing in the catalogue.
- The full index, previous/next controls, sixteen-position rail, direct hashes and touch swipes let visitors bypass the scroll sequence.
- The inspector removes perspective and provides full interface, exact detail crop, available archive example, and native-pixel inspection.
- ARTIFACTS closes the story. “Built by Gene” is deliberately restrained.

The categories and names come from the desktop application's `LEGACY_HOME_GROUPS`, `TITLES` and `CARD_DESCRIPTIONS`. Monolith is an overlapping current collection, not a fifth exclusive category. No app names, capabilities or measurements were invented.

## Source files

| File                              | Responsibility                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `content/apps.json`               | Canonical sixteen-app content, capture provenance, dimensions, crop regions, poses and pacing. |
| `content/page.html`               | Semantic page template and restrained personal copy.                                           |
| `scripts/build.mjs`               | Generates `index.html` and `js/apps.js` from the same catalogue.                               |
| `styles.css`                      | Layout, typography, material treatment, mobile and static compositions.                        |
| `js/exhibition.js`                | Cached scene geometry, camera choreography, index, opening and inspector.                      |
| `js/motion.js`                    | Single sleeping frame scheduler, critically damped motion and preferences.                     |
| `js/surface.js`                   | Single-draw WebGL wafer and CSS fallback.                                                      |
| `assets/brand/`                   | Original ARTIFACTS vector symbols, preserved verbatim.                                         |
| `assets/artifacts/apps/<app-id>/` | Full-resolution capture, responsive derivative, thumbnail and exact crop.                      |

Edit the source catalogue/template, then run `node scripts/build.mjs`. Do not edit generated files directly. New CV or contact material belongs at the marked comment in the template.

## Image quality and updates

Seven primary captures are native **3840 × 2160**. Nine are **2048 × 1104 archives originally captured as JPEG**, subsequently exported as PNG. Lossless WebP prevents further loss but cannot recover those originals. They are explicitly flagged in the model and inspector.

Every full capture and detail crop is pixel-identical to its source. Full captures total **4.59 MiB**, loaded only around the active application. The 480px thumbnails are used only for distant overview planes. Screen width is capped against source resolution and device pixel ratio. The inspector never enlarges beyond source pixels.

See the complete [capture audit and exact recapture checklist](assets/artifacts/README.md).

To install a new native PNG capture (at least 2560px wide, preferably 3840px):

```sh
pnpm install --frozen-lockfile
node scripts/prepare-capture.mjs gan-temp-diagnoser /path/to/native-capture.png
# Review captureNote and the detail region in content/apps.json.
pnpm build
pnpm test:assets
```

The script writes lossless full-size and 1280px WebPs, an overview thumbnail, a native crop, dimensions and provenance hashes. It does not upscale. Capture at the intended display resolution; do not resize an old export to pass the size check.

## Motion, mobile and accessibility

Scroll is native. The atlas adds approximately 0.5–0.7 viewport per application, with immediate index navigation. The camera settles after a direct jump and yields immediately to further scrolling. Desktop pointer input is damped; touch users can swipe horizontally on the screen plane while retaining vertical scroll.

Mobile uses reduced perspective, a touch-sized index drawer and shorter compositions. Short landscape screens use an unpinned stage. OS reduced motion and the session motion toggle produce a deliberate, static single-app viewer with all sixteen entries accessible through the same index. Without JavaScript, all sixteen articles and original image links remain in normal document flow.

The scheduler sleeps after settling and when hidden. The wafer pauses offscreen; its canvas is capped at 1.1 million pixels on desktop and 420,000 on compact displays, with adaptive resolution and a compact 24Hz cap. Application images are DOM content, not WebGL textures.

## Validation

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm build
pnpm test:assets
pnpm test
```

Windows Edge: `$env:BROWSER_CHANNEL='msedge'; node tests/browser.mjs`.

See [VALIDATION.md](VALIDATION.md) for coverage, measured frame timing and limitations. `sharp`, Playwright and axe are development tools only.
