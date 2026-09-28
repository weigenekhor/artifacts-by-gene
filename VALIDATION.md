# Validation — direct ee65f20 rebuild

28 September 2026. These checks apply to experience/ee65f20-rebuild, which starts directly at ee65f20d04458564dfe35c049de6df04469b6a19. The older reports described different website architectures and have been replaced here to avoid confusing them with current results.

## Completed

- Static build passes. Relative files remain compatible with GitHub Pages; CNAME, source images, logo, favicon and font assets are unchanged.
- The identity-field, hero-interaction and collection-layout source files are unchanged from ee65f20. No later experimental implementation commits were imported.
- Sixteen full captures and their existing derivatives pass hash, dimension and decoded-pixel checks.
- All sixteen films checked at 1440 × 900 and 390 × 844, at three intermediate progress values. No runtime/resource errors, canvas text collisions, clipped canvas labels, overlapping visual/inspection/transport regions or page overflow were reported. Film departure hides and disables its controls before the next study takes over.
- Additional representative film layouts checked at 3840 × 2160, 2560 × 1440, 1920 × 1080, 1366 × 768, 1024 × 768 and 844 × 390.
- Origin handoff checked forwards and backwards. Exactly one homepage DOM element is retained and remains visible across both scene parents.
- Reduced-motion origin stills and the full original capture remain visible; the reduced composition has no horizontal overflow.
- The AIX demonstration is synthetic. An independent fixture test checks all 120 assignments, verifies two two-plate exchanges and confirms the illustrative span progression 16 → 8 → 0 °C. This is not a claim about production equipment.

## Reproduce

Run the local server on 127.0.0.1:8001, then:

```sh
pnpm build
pnpm test:production
pnpm test:evidence
pnpm test:assets
pnpm test:assignment
```

The additional viewport/handoff review outputs are under ignored .qa/. Browser checks use installed Edge with Playwright. The legacy pnpm test suite targets an obsolete archive interface and is not presented as passing for this version.

## Limits

This is a review build. Passing geometry and runtime checks does not establish artistic approval. Physical mobile devices, Safari/Firefox, assistive-technology review and sustained performance on the user's hardware remain unverified. No blanket 60 FPS or full accessibility certification is claimed. Preserve the saved ee65f20 preview for comparison.
