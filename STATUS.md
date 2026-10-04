# Implementation status

## Two connected states

The hero presents the actual native Legacy/Origin and Pentimento/Pentimento home surfaces together. Damped cursor proximity transfers emphasis through restrained scale, position and orientation. Explicit state controls support touch and keyboard. Both windows preserve 1229:820 geometry and the existing source-matched navigation/information panels. Mobile uses a deeper vertical stagger so both remain visible.

One active edition controls matching gallery captures. All 17 applications remain in canonical order. There are 58 source captures: 29 per theme. Multi-view slideshows stay within the selected theme. The public palette, gallery layout, closing credit and footer are preserved.

The real desktop wafer texture rotates at the source rate of one degree per second. Its pivot, material, native tonal field and fixed lighting are exported from WaferRotationSurface. No full-frame image rotates. Rotation phase survives panel reflow. Old baked-wafer backgrounds have been removed.

Thinking now uses the exact approved framing and three statements. One shared 18-second SVG cycle aligns evidence, retains checks, passes a signal into use, and feeds a revision back into the structure. Continuous proximity adds focus and small depth response without moving the copy. The numbered process treatment and rejected return caption are absent.

## Performance and interaction

Native information previously decoded a new full panel on every entry. The new bounded cache coalesces loads, prepares nearby panels and reuses decoded elements. Pointer movement does not rebuild the home grid. Source geometry drives predictive preparation; layout reads are outside the proximity interpolation pass.

In the local browser sample, the first uncached panel update took approximately 21 ms; subsequent prepared updates took 0.4-0.6 ms. The same handler serves focus and pointer inspection. Instrumentation observed zero home-grid mutations during these changes. A 240-frame sample had approximately 16.7 ms frame intervals and no recorded long tasks. These are measurements on this development machine, not a physical-device or GPU guarantee. Profiling fixtures remain ignored under `.qa/`.

Meaningful CSS animation pauses offscreen, when the tab is hidden, and for reduced motion. Pointer interpolation stops after settling. There is no continuously redrawn canvas, WebGL scene, React runtime or image-based application launch in the hero.

## Verification

- Build and syntax checks pass. Twelve tests cover ordered app ownership, all capture derivatives, relative Pages paths, shared edition coherence, decoded-cache reuse/eviction, swipe/autoplay, native geometry, information assets, viewport placement and unchanged creator content.
- Native focus/inspection, Escape, sidebar expansion, direct pointer transfer between editions, reasoning proximity, touch selection and gallery theme propagation were exercised in the browser.
- Rendered review: 1440px, 1280px, 1024px tablet, 390px portrait and 844px landscape. The 2560x1440 composition was inspected with a central capture. Measured layouts have no document overflow; short information panels scroll internally.
- Reduced-motion fixture retains static relationships and manual controls, with autoplay and continuous motion disabled. No-JavaScript fixture retains both native states and all 58 full-resolution capture links.
- 694 local asset/module URLs returned HTTP 200. No console errors or warnings were observed. Runtime modules total approximately 33.4 KB; generated HTML approximately 153 KB. No external runtime dependency is added.
- Review captures are in ignored `.qa/native-review/`, with filenames prefixed `two-states-`.

## Preservation and boundaries

Review branch: `rebuild/contained-product`. The immediately preceding implementation is recoverable at `51750c3` and tag `review/native-handoff-51750c3`. Earlier work remains in Git. This pass does not promote production.

No desktop code or original screenshot was changed. No required source asset was missing. The exports use the desktop renderer; browser chrome and viewport-safe placement remain deliberate web adaptations. The website does not execute engineering processing. GitHub Pages stays static, with CNAME unchanged.
