# Exhibition validation

Verified 18 September 2026 in Microsoft Edge / Chromium on Windows. The browser used hardware graphics on an NVIDIA GeForce RTX 4060 Laptop GPU. These are local browser measurements, not a guarantee for every device or production network.

Run `pnpm test` (or `$env:BROWSER_CHANNEL='msedge'; node tests/browser.mjs`). The suite starts a static server automatically. Screenshots and machine-readable results are written to ignored `.qa/`.

## Viewport and visual review

Passed 2560 × 1440, 1920 × 1080, 1440 × 900, 1366 × 768, 1024 × 1366, 390 × 844, 320 × 740, and 844 × 390. No horizontal document overflow at any chapter. Hero type fits all viewports. Each application has reserved image dimensions and accessible inspection links.

Reviewed each application at approach, readable and detail states. Refined the screen-to-heading and screen-to-footer clearances, ecosystem fan scale, mobile fan spacing, macro completion timing, alternating compositions, hero title colour, and short-landscape layout after browser renders. Short landscape uses unpinned document flow; portrait retains shortened staging.

## Functional and accessibility checks

- All five original application captures load; each complete → detail transition changes the spatial transform and reveals the correct macro.
- The inspector displays the 2048px capture, fits/zooms, closes with Escape, and restores the initiating link's focus. Native image links remain available without JavaScript and with modified clicks.
- Mouse orientation uses a damped response. Mobile tap inspection and zoom work in touch emulation.
- Complexity traces genuinely interpolate into ordered paths.
- Chapter links, application links, next links, and back-to-surface are native anchors; no scrolling is intercepted.
- axe-core 4.10.3: zero WCAG 2 A/AA and WCAG 2.1 AA violations in desktop, image inspector, mobile and reduced-motion scans.
- Live reduced-motion changes remove staging distances and preserve a complete static composition. Session pause persists across reloads. The motion button respects the OS setting.
- WebGL context loss produces the CSS fallback; restoration recovers the renderer. Forced WebGL unavailability and JavaScript-disabled content are covered.
- Relative assets also load when served beneath `/artifacts-by-gene/`.
- Zero page exceptions, console errors or HTTP asset failures during the main suite.

## Rendering measurements

At 1440 × 900, a 2.5-second warm hero sample produced **151 frames**, **16.7 ms median**, **16.8 ms p95**, and **zero long tasks**. Instrumented draws stopped when the hero left the viewport and when motion was paused.

A supplementary 1920 × 1080 scroll sample measured **16.7 ms median / 16.8 ms p95** for both the trace-organisation scene and AIX's camera/detail transition, with no long tasks. The suite's accumulated layout-shift score was approximately **0.00000003**.

Shader work is limited to one triangle and one draw, at most 1.1 million desktop pixels or 420,000 compact pixels. Compact rendering targets 24 Hz; software presentation uses CSS perspective. Original interface WebPs total about 615 KiB, with smaller responsive alternatives. No external runtime requests or dependency bundles are required.

## Coverage limits

Mobile and tablet checks use Chromium viewport/touch emulation, not physical iOS/Android devices. Safari/Firefox, screen-reader sessions, constrained mobile hardware and remote-network loading should receive a follow-up check before broader release. Existing exported screenshots retain their original raster text and pointer; the asset README specifies optional higher-resolution replacements.

Production remains unchanged until the pull request is merged. `CNAME`, `.nojekyll`, canonical URL and the existing branch-based GitHub Pages arrangement are preserved.
