# Validation — the complete ARTIFACTS journey

Validated on 20 September 2026 with Playwright and installed Microsoft Edge in headless mode. The suite serves the static site under a GitHub Pages-style repository subpath.

## Behavior and accessibility

- All sixteen apps appear in order through scrolling alone. Every app's complete 1425 × 950 image, 3:2 presentation and settled, untransformed viewing plane passed.
- Every retained study control produces a visible geometric change. Previous/next, reverse scrolling, keyboard arrows, index jumps, mobile selection and direct app links passed.
- Resizing between portrait, landscape and desktop preserves the current application.
- Full-image viewing, actual-size viewing, Escape dismissal and return focus passed.
- All four opening beats and representative apps including the final app were checked at every viewport below. No page overflow, screenshot/header collisions or portrait text/image overlaps.
- The header remains opaque and topmost during the exit to the index. The motion opening contains no logo image.
- Six axe WCAG A/AA scans: **zero violations** (opening, study, viewer, index, mobile and reduced motion).
- Reduced motion, no-WebGL SVG studies and the complete no-JavaScript catalogue passed.
- **Zero console warnings/errors, page exceptions or failed resource responses.**

## Viewports

| Viewport    | DPR |
| ----------- | --- |
| 3840 × 2160 | 1   |
| 2560 × 1440 | 1   |
| 1920 × 1080 | 1   |
| 1440 × 900  | 2   |
| 1366 × 768  | 1   |
| 1024 × 1366 | 1   |
| 430 × 932   | 2   |
| 390 × 844   | 3   |
| 320 × 740   | 2   |
| 844 × 390   | 2   |
| 667 × 375   | 2   |

Visual review covered all sixteen desktop application compositions, the original seventeen supplied images, opening beats, mobile portrait/landscape, the viewer, index and exit. Refinements included more concise narrative, a continuous relocation of the geometry into the application study, a corrected last-scene endpoint, touch-sized mobile selection, landscape image clearance and a persistent accessible study label.

## Local performance sample

A 360-frame native-scroll sweep at 1920 × 1080 after initialization:

- Median frame interval: **16.7 ms**.
- 95th percentile: **16.8 ms**.
- Observed long tasks: **0**.
- Renderer callbacks in the subsequent idle interval: **0**.
- Final study: **1 draw call(s), 20,480 triangles**.

The local JavaScript bundle is 524,502 bytes / 135,416 bytes gzip. No screenshot textures are uploaded to WebGL. The renderer caps device pixel ratio and drawing-buffer size, prewarms shaders and sleeps when settled or offscreen. Only active/neighboring full images are requested as the sequence approaches them.

## Image provenance

Both committed image-fidelity suites passed. A fresh comparison against all sixteen PNGs in the supplied Desktop folder confirmed that each displayed full WebP has exactly the same decoded pixels. Archived detail crops and older screenshots are retained but are not used in the current experience. Brand and favicon original-path tests passed.

All supplied application images are 1425 × 950. The site does not manufacture additional detail or claim that these are native 4K captures. The complete image is visible by default; the larger viewer offers its original resolution.

## Reproduce

Run `pnpm build`, `pnpm test:evidence`, `pnpm test:assets` and `pnpm test`. Set `BROWSER_CHANNEL` to an installed Chromium-based browser if needed (the suite defaults to msedge).

The machine-readable report and screenshots are in ignored `.qa/validation-v7.json` and `.qa/v7-*.png`.

## Limits

Frame timing is a local headless-browser sample, not a guarantee for every GPU. Mobile sizes use emulation; physical mobile hardware, Safari and Firefox have not been tested. Workflow studies illustrate the software's purpose, not measured application output.
