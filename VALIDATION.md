# Validation — exact cinematic films

28 September 2026. Continues the current experience/ee65f20-rebuild from c67e1f2. This revision is local; the existing GitHub PR has not been updated because CLI authentication and the GitHub connection are unavailable. Production and historical review archives are unchanged.

## Completed checks

- Static build passes. GitHub Pages output, CNAME and relative assets are retained. The browser suite also serves the site under /artifacts-by-gene/.
- The approved hero, origin, homepage handoff, TopoTracer core and Gene source files are unchanged.
- Sixteen entries retain the real order. Every card rests on its full source screenshot. Desktop plays only on hover/focus, once, then holds; leaving restores the screenshot. Mobile plays one centered card. Previews last 5.0–5.3 seconds.
- Browser checks pass for all sixteen detail films and original images, keyboard focus, Escape/focus return, reduced motion and no-JavaScript image access. No runtime or resource errors. Axe reports zero violations in the desktop gallery, mobile gallery and reduced-motion detail sample; this is not a complete assistive-technology audit.
- Preview captures cover real rest, development and decisive frames at 1440, 1280 and 390 pixels. Canvas label bounds and text collisions are checked. Five-beat contact sheets additionally cover all fifteen new films, with manual review of depth, physical events and final composition.
- Detailed films were sampled every five percent at 1440×900, 1280×800 and 390×844, with zero reported geometry or runtime issues. A focused rerun covers films changed in the final framing pass. Label/object placement also received visual review; automated text checks alone cannot establish this.
- The homepage remains one DOM element. Forward/reverse samples after its resolution retain opacity 1. No duplicate reveal was introduced.
- All sixteen source hashes, decoded pixels, native crops and derivative paths pass. Papyrus retains the current recipe-text source; it is not presented as XML node matching. No capture is fabricated or upscaled.
- AIX checks cover all 120 illustrative assignment permutations, correct final slot identities after both exchanges and physical clearance sampled every 0.01 seconds. Its synthetic fixture demonstrates span 16 → 8 → 0 °C; this is not a production-equipment result.

## Local performance observation

The first isolated AIX run showed a 33.4 ms 95th-percentile frame interval. Reducing redundant radial geometry in that film improved the next isolated headless Edge run at 1440×900 to median 16.7 ms, 95th percentile 16.9 ms, 486 sampled frames and no long tasks. The 8.4-second observation includes entry, active playback and the held frame. Rapid origin travel recorded median 16.7 ms and 95th percentile 17 ms. The resting closing section produced zero shared-render frames over 600 ms. These are local observations, not a guarantee on every device.

## Reproduce

Start the static server on 127.0.0.1:8001, then run:

```sh
pnpm build
pnpm test
pnpm test:previews
pnpm test:production
pnpm test:assets
pnpm test:evidence
pnpm test:assignment
```

Tracked checks are in tests/. Local images and results are ignored under .qa/, including browser-results.json, preview-results.json, production-results.json, film-sequence-*.png and gallery-performance.json. Focused production runs replace their result file; they are not cumulative.

## Review limits

The visual revision awaits Gene's review. Tests establish sampled behavior and geometry, not artistic approval. Physical devices, Safari/Firefox, screen readers and sustained performance on the user's hardware remain unverified.

Fifteen source captures are 1425×950; Metria is 3840×2160. The smaller originals cannot provide native-resolution fullscreen 4K UI text. Higher-resolution source captures are required for that use case. Procedural films are DPR-aware and do not share this raster limitation. All procedural measurements and equipment geometry are illustrative.
