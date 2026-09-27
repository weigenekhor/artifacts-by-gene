# Validation — cinematic rebuild candidate

27 September 2026. These results apply to the complete rebuild on `experience/software-exhibition`; they do not certify Gene's visual approval.

## Verified

- Static build succeeds. The approved opening renderer and hero markup are unchanged. Gene's wording remains exact; only its presentation changed.
- Both image suites pass: all sixteen source hashes, full-image decoded pixels, native detail pixels, dimensions and catalogue entries. The Papyrus import recipe and pane coordinates match the current Desktop source.
- Browser suite: all sixteen complete opening/return images, canonical order, keyboard inspection, alternate controls, original viewer/Escape, exact Gene copy and all sixteen reduced-motion starting/result states pass. No console, page or resource errors were recorded.
- Responsive smoke coverage: 320×568, 390×844, 844×390, 1024×1366, 1366×768, 1440×900, 1920×1080, 2560×1440 and 3840×2160. Full sixteen-film review applies to 1440×900 and 390×844; other sizes exercise representative layouts.
- Full-progress sweep: all sixteen films at 201 positions on desktop/mobile, plus alternate inspection samples, with no detected text collision or clipping after the AIX label repair.
- Dedicated GaN Met Compiler / LT Report Compiler sweep: 201 positions at 1440, 1280 and 390 widths, with no detected label collision or clipping.
- Production geometry checks: all sixteen films at five states at desktop/mobile, plus physical departures, with no detected overlap, overflow, clipped labels or active exiting controls.
- Collection: 64 focused layouts across desktop, portrait, narrow portrait and landscape pass; two-tap touch entry passes.
- Continuity: one persistent homepage surface, no early application exposure, sixteen no-JavaScript source links and Metria pin handoff pass.
- Mobile reduced-motion axe A/AA check returns zero reported violations. Automated testing does not replace assistive-technology testing.

## Visual review

The local review set contains 197 captures: twelve origin states per primary size, collection rest/focus and desktop hover, five states for all sixteen films, and four Gene beats per size. Open `.qa/cinema-complete/index.html` through the local server. Contact sheets and individual scenes were inspected; revisions corrected sparse framing, a temporary empty SPC interval, a featureless origin base, ribbon seams, AIX label collisions and small XML framing.

Screenshots document composition; they cannot establish cinematic pacing or user comprehension. The candidate remains subject to Gene's visual review.

## Performance and limits

A local headless Edge sample used this laptop's RTX 4060 via ANGLE/D3D11. Each of sixteen film middles was swept for three seconds at 1440×900. All had median frame intervals near 16.7 ms. Some heavier scenes had 95th-percentile intervals around 33–50 ms; this is not a locked 60 fps guarantee. WaferCount originally measured around 50 ms median and was corrected by consolidating hidden stack faces and replacing mesh shadows with shader shadows. The final reduced-mesh recheck retained a 16.7 ms median for WaferCount, TopoTracer and Metria. A settled film recorded zero callbacks over the 550 ms idle sample.

Fifteen populated captures are 1425×950. Metria is 3840×2160. Pixels are preserved, not upscaled into supposed 4K imagery. The original-size viewer remains available. Papyrus's real text-mode capture and its separately identified XML comparison interpretation are intentionally distinguished.

Mobile is emulated. Physical iOS/Android devices, Safari, Firefox and assistive technologies were not tested. Illustrative values are not live equipment results; diagnostics do not prove a physical cause; cross-scene continuity does not claim app integration.

## Reproduce

`pnpm build`, `pnpm test`, `pnpm test:assets`, `pnpm test:evidence`, `pnpm test:continuity`, `pnpm test:collection`, `pnpm test:production`, `pnpm test:reports`, `pnpm test:cinema`.

Tests serve the site under a GitHub Pages-style subpath. Generated HTML/JavaScript are static and require no server runtime. Production has not been changed.
