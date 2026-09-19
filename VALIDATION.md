# Engineering narrative — validation

Verified 19 September 2026 in headless Microsoft Edge / Chromium on this Windows machine. Browser emulation is not physical mobile testing. Safari, Firefox and physical touch/trackpad hardware have not been tested. Frame intervals below measure this local run, not universal device performance or GPU utilisation.

## Functional and visual checks

- All ten narrative scenes inspected; all 16 apps select the expected identity, purpose and distinct geometry.
- Real ARTIFACTS vectors retained in navigation, opening, footer and favicon. Visible personal attribution occurs once. Superseded philosophy text removed.
- Full index, focus trap, Escape return, ecosystem arrow navigation, chapter switching, range inputs, motion toggle and touch selection passed.
- Motion toggle preserves the current chapter. Paused and final scenes stop drawing after settling.
- Reduced motion preserves content and app selection; no-WebGL uses matching diagrams; no-JavaScript exposes all 16 directory entries.
- Zero page/console errors and zero failed resource requests in the browser suite. Root and repository-subpath URLs tested. No software screenshot requests in the new experience.
- Automated axe WCAG A/AA checks: zero violations for opening, ecosystem, focused app, directory, mobile and reduced-motion views. This is not a full manual accessibility certification.

## Viewports

All ten scenes checked for document overflow at 3840 × 2160, 1440 × 900 (DPR 2), 2560 × 1440, 1920 × 1080, 1440 × 900, 1366 × 768, 1024 × 1366, 430 × 932 (DPR 2), 390 × 844 (DPR 3), 320 × 740 (DPR 2), and 844 × 390 (DPR 2). All 16 ecosystem nodes remain horizontally reachable. Screenshots inspected at desktop, portrait tablet, mobile portrait and landscape.

Refinements after inspection: portrait camera scale, mobile orbit spacing, compact controls, restrained surface lighting, continuous morph boundaries, chapter position after motion preference changes, separate monitoring geometries, and extension reinitialisation after WebGL context restoration.

## Performance and recovery

- Hero: 180 animation-frame samples, median **16.7 ms**, p95 **16.9 ms**.
- Continuous native scrolling: 240 samples at 1920 × 1080, median **16.7 ms**, p95 **16.8 ms**, no observed long tasks in that interval.
- Desktop drawing buffer: 1633 × 919 for that sample, respecting the 1.5-million-pixel budget.
- Forced WebGL context loss enters SVG fallback; explicit context restoration returns to WebGL.
- These measurements support smooth rendering here. They do not claim every mobile GPU sustains 60 fps; mobile idle acquisition deliberately runs at up to 24 fps.

## Geometry and source integrity

`pnpm test:geometry` validates finite positions/metadata and index bounds for 21 concepts, desktop/mobile topology and three control values. All 16 app concepts have distinct geometry. Relationships resolve to real apps in their stated editorial workflow; every concept has a generated static fallback.

`pnpm test:assets` still verifies all archived screenshot hashes, original decoded pixels, exact native crops, derivative dimensions and logo paths. No archive source is upscaled or used as fabricated HD imagery.

`pnpm build` generates 16 apps, four workflow lenses and 21 fallback diagrams. The site ships as static files with the existing custom-domain CNAME. The reference deck, internal values, local QA files and development dependencies are not required by the public runtime.

## Review boundaries

Production `main` is unchanged. This is a new design direction for review on `experience/engineering-in-motion`; the earlier screenshot-based PR remains separate. A human visual review in the intended target browsers is still useful before merging. No screenshot recapture or additional content is needed to review this version.
