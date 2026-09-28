# Validation — cinematic application gallery

28 September 2026. Continues the current experience/ee65f20-rebuild implementation from b6d8ed7. Production has not been merged or deployed. Earlier local review archives remain available.

## Completed checks

- Static build passes. CNAME, relative assets and GitHub Pages deployment are retained. Browser tests also serve the site under /artifacts-by-gene/ to check repository-relative paths.
- The approved identity-field.js hero and topography.js core are unchanged.
- All sixteen gallery entries appear in the actual application order. Two columns on desktop; one on mobile. No forced sequential film sections remain in the main document.
- Final browser suite passes: one-shot desktop hover and keyboard previews, held final frame, graceful return to poster, one centered mobile preview, all sixteen detail dialogs and original images, nested Escape/focus return, reduced motion, and real-image links without JavaScript. No runtime or resource errors reported.
- Automated axe checks report no violations for the desktop gallery, mobile gallery and reduced-motion detail view. This is not a complete assistive-technology audit.
- Final preview suite captures all sixteen resting, development and decisive states at 1440, 1280 and 390 pixels: 144 images. No reported canvas text collisions, clipped labels or runtime/resource errors.
- Detailed films were sampled through 0–100% at five-percent increments, at 1440×900, 1280×800 and 390×844. Initial review found intermediate WaferCount, XML and ANKO Helper label problems; those were corrected. Nine affected films then passed the complete progress sampling. The final LotViewer, Diagnoser and Met Compiler refinements also passed complete progress sampling at all three widths.
- Fresh origin, homepage handoff, gallery and Gene captures were reviewed at those three widths, alongside individual preview frames and contact sheets. Review prompted changes to phone compositions, retained-history depth, the diagnostic symptom curve, source-plot crossfades and text placement.
- The homepage uses one DOM element throughout forward and reverse travel. After resolving, its measured opacity remains 1. Its position and dimensions are identical immediately before and after the owner transfer at 1440×900. No disappear/reappear stage remains.
- Full source-capture fidelity checks pass for all sixteen apps. Papyrus now uses the current recipe-text capture. Its pixels and dimensions are verified against the source. No screenshot is fabricated or upscaled.
- AIX assignment verification passes all 120 permutations. The illustrative fixture retains five physical plates through two swaps, with span 16 → 8 → 0 °C; these are synthetic demonstration values, not a production-equipment result.

## Local performance observation

An isolated headless Edge run at 1440×900 recorded 492 frames during the AIX gallery preview: median interval 16.7 ms, 95th percentile 16.9 ms, no long tasks. Rapid origin travel recorded median 16.7 ms and 95th percentile 17.5 ms after reducing redundant profile tessellation. Resting Gene produced zero shared-render frames over 600 ms. These local observations do not guarantee 60 FPS on every device.

## Reproduce

Run the static server on 127.0.0.1:8001, then:

```sh
pnpm build
pnpm test
pnpm test:previews
pnpm test:production
pnpm test:assets
pnpm test:evidence
pnpm test:assignment
```

Tracked tests live in tests/. Local review captures and results remain ignored under .qa/, including browser-results.json, preview-results.json, production-results.json and gallery-performance.json. Focused production runs overwrite production-results.json; it is not a cumulative report.

## Remaining review limits

The visual revision needs Gene's approval. Tests establish behavior and sampled geometry, not artistic quality. Physical-device testing, Safari/Firefox, screen-reader use and sustained performance on the user's hardware remain unverified.

Fifteen current source captures are 1425×950; Metria is 3840×2160. The smaller originals remain honest at native size, but cannot supply native-resolution fullscreen 4K text. Higher-resolution source captures are needed for that use case. Procedural motion is DPR-aware and does not share this raster limitation.
