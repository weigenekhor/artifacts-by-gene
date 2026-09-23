# Validation — ARTIFACTS software exhibition

**Latest visual refinement (The Artifact, 23 September):** build passed; focused browser review found no page/console errors. Reviewed closed/open/inside/through hero states, all sixteen desktop study compositions and representative mobile hero, diagnostic, zone and Metria views. All sixteen hero textures loaded. Mobile samples had no horizontal overflow. Existing media files were preserved. Full validation, hardware performance profiling and broad accessibility checks remain deferred until visual approval. Earlier results below are historical, not certification of the current renderer.

**Scope:** the results below record v10, before the sixteen-study expansion. The current visual pass has a successful build and basic runtime check across all sixteen studies, with no reported page/resource errors. Full validation of this expansion is deferred until visual approval.

Validated on 22 September 2026 using Playwright and installed Microsoft Edge in headless mode. Tests serve the static files under a GitHub Pages-style `/artifacts-by-gene/` subpath.

## Functional checks

- All sixteen applications advance through native scrolling and display the correct name, purpose and complete source capture.
- All sixteen full-image dialogs preserve intrinsic source dimensions; Escape and return focus passed. Papyrus actual-size inspection renders at its native 1531-pixel width.
- Archive rail, previous/next controls, keyboard arrows and direct app links passed.
- All four study range controls update their visual progression. Native scrolling resumes progression after manual inspection.
- Reduced motion retains settled diagrams and the full collection. With JavaScript disabled, all sixteen screenshots and linked index entries remain available.
- Four full-document axe WCAG A/AA scans passed with **zero violations**: desktop, viewer, mobile and reduced motion.
- **Zero console warnings/errors, page exceptions or failed resource responses.**

## Screen sizes

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

Each viewport passed four demonstration compositions and four representative archive states. Checks cover horizontal overflow, copy/visual/control collisions, archive header clearance and screenshot/navigation clearance. Visual review included opening, origin, all four demonstrations, collection and mobile portrait/landscape. Refinement corrected long headline wrapping, small-text contrast, screenshot composition, header transparency and a redundant diagram caption.

A recorded continuous-scroll review is saved under ignored `.qa/film-v10/`. Additional checks confirm that resizing from desktop to portrait preserves the active application, and that the new viewing interval holds the active capture straight-on. The archive transition leaves readable pauses between movements.

## Performance

A local 360-frame scroll sweep at 1920 × 1080 recorded **16.7 ms median**, **16.8 ms p95**, **zero long tasks**, and **zero idle animation callbacks** after settling. This is a local sample, not a device-wide FPS guarantee.

The previous Three.js renderer and dependency were removed. The current browser bundle is approximately **14.5 kB / 4.9 kB gzip**. The contour graphic is generated at build time; CSS provides perspective. Native DOM images preserve the original captures, with lazy loading below the fold. The controller sleeps at rest and while the document is hidden.

## Image fidelity

Both image suites passed. Full lossless WebP images and detail crops preserve source pixels and recorded dimensions. The current Papyrus capture is **1531 × 1002**; the remaining fifteen are **1425 × 950**. Complete originals remain available in the viewer. Crops are deliberate source fragments, and no screenshots are generated, retouched or artificially upscaled. The original ARTIFACTS symbol and matching favicon are retained.

## Reproduce and limits

Run `pnpm build`, `pnpm test:evidence`, `pnpm test:assets` and `pnpm test`. The browser suite defaults to `msedge`; `BROWSER_CHANNEL` can select another installed Chromium channel. Reports and images are in ignored `.qa/validation-v10.json` and `.qa/v10-*.png`.

Mobile checks are emulated; physical devices, Safari and Firefox have not been tested. Automated accessibility checks do not replace assistive-technology review. Concept motion explains an application's purpose; it does not represent measured outputs or a live engineering simulation. Native image resolution limits remain; these captures are not 4K source material.
