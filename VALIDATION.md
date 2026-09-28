# Validation — definitive cinematic revision

28 September 2026. This revision continues the current `experience/ee65f20-rebuild` branch from local commit `69f697e`. It does not reset the implementation to an archive. Production has not been merged or deployed.

## Completed checks

- `pnpm build`: static output built successfully. Relative asset paths, CNAME and GitHub Pages compatibility are retained.
- The approved `identity-field.js` and `topography.js` files are unchanged. Papyrus retains its paired-comparison choreography.
- `pnpm test:assets` and `pnpm test:evidence`: all sixteen full captures retain source hashes, dimensions and decoded pixels. The full-capture payload is 4.59 MiB. No screenshots were fabricated or upscaled.
- `pnpm test:production`: all sixteen films sampled at 0–100% in five-percent increments at 1440 × 900, 1280 × 800 and 390 × 844: 1,008 states, no reported runtime/resource errors, canvas-label collisions, clipped canvas labels, overlapping visual/inspection/transport rows or horizontal page overflow. Subsequent refinements received the same complete progress sampling for the six affected films.
- Five review captures per film at each width: full interface, development, decisive state, inspection and full interface return. The 240 captures and contact sheets were visually inspected; several label, contrast, phone composition and intermediate-state problems were fixed during this pass.
- Origin, staged collection and Gene: 54 additional captures across the three primary widths. The homepage retains the same DOM identity forward and backward. Its maximum measured handoff position/size change was below 0.2 CSS pixels at 1440 × 900, 1280 × 800, 390 × 844 and 844 × 390. A short-landscape minimum-height mismatch was found and corrected.
- Additional representative layouts checked at 3840 × 2160, 2560 × 1440, 1920 × 1080, 1366 × 768, 1024 × 768 and 844 × 390.
- Keyboard collection opening/rotation/reset and Metria's narrow/wide interval respond correctly. Reduced motion presents origin stills, full source captures and the Gene text in reading order. Short-height Gene layouts also use natural document flow.
- `pnpm test:assignment`: all 120 possible AIX assignments checked. The labelled synthetic fixture retains five physical plates through two exchanges and reaches the optimal illustrative span progression 16 → 8 → 0 °C. This is not a production-equipment result.

## Local timing observation

An isolated headless Edge run at 1440 × 900 sampled 180 animation frames through each region. Median frame interval was 16.7 ms; 95th-percentile intervals were 17.3 ms for origin travel, 16.9 ms for the collection handoff and 17.2 ms for LotViewer. The resting closing produced zero additional shared-render frames over 1.2 seconds. Origin frustum culling avoids building GPU payloads for geometry outside the view. These measurements describe this local run, not every browser or device.

## Reproduce

Run the site on `127.0.0.1:8001`, then:

```sh
pnpm build
pnpm test:production
pnpm test:evidence
pnpm test:assets
pnpm test:assignment
```

Primary geometry tests and assertions are tracked under `tests/`. Local review scripts, captures and results remain under ignored `.qa/`, including `full-production-results.json`, `focused-production-results.json`, `refinement-production-results.json`, `handoff-continuity.json`, `performance-results.json` and `review/`. The older `pnpm test` suite targets an obsolete archive interface and is not presented as passing for this version.

## Review limits

The silent-film, poster-frame and differentiation review informed this revision; those are art-direction judgments, not automated certifications. This build still needs Gene's visual approval. Physical-device testing, Safari/Firefox, assistive-technology review and sustained performance on the user's hardware remain unverified. Preserve all saved versions for direct comparison.
