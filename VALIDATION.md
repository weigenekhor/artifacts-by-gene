# Validation — continuous ARTIFACTS narrative

Validated on 21 September 2026 using Playwright and installed Microsoft Edge in headless mode. The suite serves the committed static files under a GitHub Pages-style `/artifacts-by-gene/` subpath.

## Story and interaction

- All fourteen story stations passed. Four applications carry the demonstrations; all sixteen appear in the explorable environment and real-software reel.
- Native scrolling advances the complete origin story and demonstrations without app selection. The environment and reel offer optional exploration after the narrative.
- Every app's name, purpose, full capture and intrinsic image dimensions were checked. Reel selection loaded the correct native crop for all sixteen apps.
- Keyboard arrows, direct app links, resize continuity, full-image viewing, actual-size viewing, Escape dismissal and return focus passed.
- Eight representative story states were checked at every viewport below. No horizontal overflow, header collisions, proof/footer collisions or desktop copy/proof overlaps. All four Expedition selections were checked for overlapping app hit areas.
- Six axe WCAG A/AA scans returned **zero violations**: opening, environment, image viewer, software reel, mobile and reduced motion.
- Reduced motion, the forced no-WebGL SVG fallback and the complete no-JavaScript catalogue passed.
- **Zero console errors/warnings, page exceptions or failed resource responses.**

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

Visual review covered all fourteen desktop states, representative mobile states and a recorded continuous scroll sweep. Refinements addressed overlapping transition typography, surface lighting, equal-height contours, compact camera continuity, projected app hit areas and short-landscape spacing. Using `overflow: clip` prevents focus or fragment navigation from scrolling the stage internally and displacing its content under the header.

## Local performance sample

A 360-frame native-scroll sweep at 1920 × 1080 after initialization:

- Median frame interval: **16.7 ms**.
- 95th percentile: **16.8 ms**.
- Observed long tasks: **0**.
- Renderer callbacks during the subsequent idle interval: **0**.
- Final environment: **3 draw calls, 57,600 triangles**.

The local bundle is 538,487 bytes / 139,975 bytes gzip. One persistent renderer owns the scene. Geometry is instanced, contours are computed once, and expensive geometry updates are gated by changes. Rendering sleeps when settled, offscreen or hidden. DPR is capped at 2 on desktop and 1.5 on compact screens, with a 3.2-million-pixel drawing-buffer budget. No software screenshots are uploaded as WebGL textures. Narrative and reel details load on demand; complete captures load when opened.

## Image provenance

Both committed image-fidelity suites passed. A fresh decoded-pixel comparison against all sixteen current Desktop PNGs confirmed exact equality with the full lossless WebP captures. The updated Papyrus Reader source is **1531 × 1002**; the other fifteen are **1425 × 950**. These are original captures, not native 4K assets.

The latest brief requests deliberate detail crops. Every displayed crop is checked against its recorded rectangle in the original source. Combined detail payload is **489 KiB**. All complete originals remain available in the image viewer, including an actual-size mode. Brand and favicon checks passed. No generated or fabricated software images are used.

## Reproduce

Run `pnpm build`, `pnpm test:evidence`, `pnpm test:assets` and `pnpm test`. Set `BROWSER_CHANNEL` to an installed Chromium-based browser if needed; the suite defaults to `msedge`.

The machine-readable report and screenshots are in ignored `.qa/validation-v9.json` and `.qa/v9-*.png`. Continuous-scroll review recordings are under `.qa/film-v9/`.

## Limits

Frame timing is a local headless-browser sample, not a guarantee for every GPU. Mobile sizes use emulation; physical mobile hardware, Safari and Firefox have not been tested. Automated accessibility checks do not replace assistive-technology testing. Motion illustrates software concepts; it is not live application output or an engineering simulation. Connections in the environment describe related workflows, not asserted runtime integrations.
