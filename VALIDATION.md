# Motion and interaction validation

Verified in Microsoft Edge (Chromium), 18 September 2026. Run `pnpm test` to reproduce the browser checks; the test server starts automatically. Reports and screenshots are written to the ignored `.qa/` directory.

## Layout and interaction

- Visually inspected 1920 × 1080, 1440 × 900, 1366 × 768, 834 × 1112, 390 × 844, and 320 × 740 layouts. No horizontal document overflow; the full title fits each viewport.
- Refined letter-mask clearance, wafer material variation, tablet wafer framing, zone-marker alignment, and mobile technical labels after the first render pass.
- Section reveals are triggered by the position of each composed group. Keyboard focus exposes a pending group immediately.
- All four projects have distinct representative visuals. Intermediary SVG paths differ from both their starting and final paths, verifying actual interpolation.
- Rapid project changes settle correctly. Arrow keys, Home, End, click, and emulated mobile touch are tested. Hover selection yields to active keyboard focus.
- Modal content follows the active project. Escape closes it and restores focus to its trigger.
- Back to surface uses native anchor navigation. No wheel interception, scroll locks, or artificial loading gate.

## Accessibility and resilience

- axe-core 4.10.3 reports no WCAG 2 A/AA or WCAG 2.1 A/AA violations in desktop or mobile scans with reduced motion enabled. Automated scans are supplemented by keyboard checks; screen-reader testing remains a useful manual check.
- Reduced-motion preference changes are handled while the page is open. Nonessential animation and smooth scrolling stop, project changes are immediate, and the Motion control reflects the system preference.
- The Motion on/off control pauses the continuous renderer and remembers the choice for the session.
- No-JavaScript editorial content and the CSS wafer remain visible. Project controls still function when WebGL is unavailable.
- Forced WebGL context loss restores the CSS fallback. Context restoration recreates the renderer.
- No uncaught page errors or missing resources in the browser suite.

## Performance

A warmed three-second desktop hero sample on an NVIDIA GeForce RTX 4060 Laptop GPU recorded approximately 60 frames/second, a 16.7 ms median frame interval, a 16.8 ms 95th-percentile interval, no long tasks during the sample, and zero measured cumulative layout shift in the run. These are local Chromium measurements, not a guarantee for every browser or device.

Separate three-second scroll and repeated-project-transition samples also recorded 16.7 ms median and 16.8 ms 95th-percentile frame intervals with no long tasks. The compact renderer produced 49 draws over two seconds, consistent with its 24 Hz target. A simulated visibility-change event stopped all draws and rendering resumed after visibility was restored. Hover selection and keyboard priority were checked separately.

The wafer uses one triangle and one draw call, with no texture downloads, meshes, or ray-marching loop. Desktop shader resolution is capped at 1.1 million pixels; compact layouts at 420,000 pixels. Desktop targets 60 Hz and compact layouts 24 Hz. Sustained slow frames reduce rendering resolution. Rendering stops when the surface is offscreen, the document is hidden, motion is paused, or reduced motion is requested. Offscreen pause, user pause, preference changes, and context recovery are covered by automated checks.

Physical iOS/Safari, Android battery behavior, and lower-end GPU performance have not been measured. Visually review the title entrance, pointer-delayed wafer lighting, the hero-to-ecosystem scroll, and rapid system changes on your everyday devices.

## Review and deployment

This motion update is prepared in `weigenekhor/artifacts-by-gene` for review against `main`. The existing custom domain and GitHub Pages configuration are preserved. The site still deploys as static files with no build step and no runtime packages. Playwright and axe-core are development-only dependencies for the reproducible browser checks.
