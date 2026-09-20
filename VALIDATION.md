# Validation — workflow-first ARTIFACTS

Validated on 20 September 2026 with Playwright and installed Microsoft Edge in headless mode. The suite serves the static site under a GitHub Pages-style repository subpath.

## Behavior and accessibility

- All sixteen apps appear in order through scrolling alone. Every complete image retains its source dimensions and aspect ratio, without cropping or a transform at rest.
- The opening story describes recurring work, reusable methods and a body of tools. No Papyrus-specific comparison appears in the opening narrative.
- Workflow geometry occupies more than twice the screenshot area in every desktop app composition. Scroll advances a workflow from its starting point to its result; every optional study control also changes the geometry.
- Previous/next, reverse scrolling, keyboard arrows, index jumps, mobile selection, direct app links and orientation changes passed.
- Full-image viewing, actual-size viewing, Escape dismissal and return focus passed.
- Four opening beats and representative apps including the last app were checked at every viewport below. No horizontal overflow, header collisions, screenshot/navigation collisions or app copy/screenshot overlaps.
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

Visual review covered the replacement story beat, the transition to the application sequence, desktop workflow compositions, the new Papyrus capture, and mobile portrait/landscape. Refinement reduced chapter-two typography to clear its geometry and adjusted the short-desktop composition after testing detected a copy/screenshot overlap at 1366 × 768.

## Local performance sample

A 360-frame native-scroll sweep at 1920 × 1080 after initialization:

- Median frame interval: **16.7 ms**.
- 95th percentile: **16.8 ms**.
- Observed long tasks: **0**.
- Renderer callbacks in the subsequent idle interval: **0**.
- Final study: **1 draw call(s), 20,480 triangles**.

The local JavaScript bundle is 524,850 bytes / 135,586 bytes gzip. No screenshot textures are uploaded to WebGL. The renderer caps device pixel ratio and drawing-buffer size and sleeps when settled or offscreen. Full captures load only for active/neighboring applications.

## Image provenance

Both committed image-fidelity suites passed. A fresh comparison against all sixteen PNGs in the supplied Desktop folder confirmed that each displayed full WebP has exactly the same decoded pixels. The replacement Papyrus Reader source is **1531 × 1002**; the other fifteen are **1425 × 950**. These are original captures, not native 4K images.

Archived crops and older screenshots remain in the repository but are not displayed. The small supporting images preserve each entire interface; the optional viewer offers original-resolution inspection. Brand and favicon checks passed. The image pipeline now accepts an individual app ID while preserving editorial text and the other captures.

## Reproduce

Run `pnpm build`, `pnpm test:evidence`, `pnpm test:assets` and `pnpm test`. Set `BROWSER_CHANNEL` to an installed Chromium-based browser if needed (the suite defaults to msedge).

The machine-readable report and screenshots are in ignored `.qa/validation-v8.json` and `.qa/v8-*.png`.

## Limits

Frame timing is a local headless-browser sample, not a guarantee for every GPU. Mobile sizes use emulation; physical mobile hardware, Safari and Firefox have not been tested. Workflow studies illustrate the software's purpose; they are not live app output or engineering simulations.
