# Exhibition validation

Verified 18 September 2026 in Microsoft Edge / Chromium on Windows, using hardware graphics on an NVIDIA GeForce RTX 4060 Laptop GPU. These are local browser measurements, not a guarantee for every device or network. Safari, Firefox and physical mobile hardware have not been tested.

## Catalogue and source fidelity

- All **16** names, desktop source keys and four original Expedition groups match the real application catalogue.
- Real ARTIFACTS vectors appear in navigation, opening and closing/footer; the favicon retains the original symbol paths.
- Seven native 3840 × 2160 primaries; nine 2048 × 1104 JPEG-derived archive primaries remain explicitly flagged for native recapture.
- Every full WebP was compared against its decoded original source: pixel-identical. Each detail is an exact crop. Encoded and decoded SHA-256 hashes are checked by `pnpm test:assets`.
- All full-resolution primary images total **4.59 MiB**. The opening requests **zero** large hero captures. Only the active screen and neighbours load as needed.
- The display and inspector respect source dimensions and device pixel ratio. No fake HD upscales or CSS magnification of low-resolution details.

## Viewports and visual refinement

Passed 2560 × 1440, 1920 × 1080, 1440 × 900, 1366 × 768, 1024 × 1366, 3840 × 2160, 1440 × 900 at DPR 2, 390 × 844 at DPR 3, and 844 × 390 at DPR 2.

No horizontal document overflow. Screen planes retain clearance above captions/navigation at every tested size. All sixteen app selections were checked at desktop; representative archive, native-entry and native-chart screens were checked at every size. All sixteen are also traversed with reduced motion enabled.

Visual review covered the opening, complexity composition, ecosystem assembly, approach/split transitions, frontal inspection, extracted details, mobile and landscape. Refinements included native-pixel sizing, image/control clearance, camera settling interrupted by scroll, transition separation, Expedition navigation, and reducing the creator treatment to 22px desktop / 20px mobile.

## Interaction and accessibility

- Sixteen-item index, counter, active marker, previous/next, direct hashes, Home/End and arrow-key navigation.
- Mobile drawer open/close, Escape and horizontal touch swipe; vertical scrolling remains native.
- Inspector full interface, exact detail and archive alternative; fit/native pixels; Escape and focus restoration.
- Zero axe-core WCAG 2 A/AA / WCAG 2.1 AA violations in hero, atlas, inspector, mobile and reduced-motion scans.
- Reduced motion uses an unpinned static viewer with all sixteen choices. Short landscape retains accessible controls without a sticky trap.
- JavaScript disabled: all sixteen semantic articles, lazy images and original links are present in normal flow.
- Forced WebGL unavailability retains the CSS wafer and working catalogue.
- GitHub Pages subpath `/artifacts-by-gene/` loads correctly; relative images, font and modules resolve.
- Zero browser exceptions, console errors or HTTP failures during the suite.

## Measured rendering

A warm 1440 × 900 hero sample of 180 intervals measured **16.7ms median / 16.8ms p95**, approximately **60fps**.

A 1920 × 1080 continuous atlas scroll sample of 240 intervals measured **16.7ms median / 16.8ms p95**, with **zero long tasks** during that sample. Instrumented WebGL draw calls stayed at **zero while the hero was offscreen**. The shader's existing pixel caps, hidden-page pause and adaptive resolution remain in place.

The complete functional/accessibility run includes a few long tasks from initial loading and test instrumentation; the warm samples above are not an end-to-end loading benchmark. No claim is made about measured power consumption or physical mobile GPU performance.

## Reproduction

`pnpm install --frozen-lockfile`, `pnpm build`, `pnpm test:assets`, then `pnpm test`. Install Playwright Chromium once, or on Windows run `$env:BROWSER_CHANNEL='msedge'; node tests/browser.mjs`.

The browser suite starts its own local server and writes screenshots/results to ignored `.qa/`. Asset tests validate committed pixels without needing the private desktop source tree. [The capture checklist](assets/artifacts/README.md) documents the remaining source-image work.
