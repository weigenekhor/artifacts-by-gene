# Validation

Verified in headless Microsoft Edge on 18 September 2026.

- WebGL shader compiles and renders the hero surface.
- All four project selectors update content and selected state correctly.
- Arrow-key project selection, Home/End handling, and tab focus are implemented.
- Project notes show the active system. Escape closes the native dialog and restores focus to its trigger.
- No horizontal document overflow at 320, 375, 390, 768, 1024, 1440, and 1920 pixels.
- Desktop and mobile hero, system section, full mobile layout, and social preview visually inspected.
- Reduced-motion mode disables smooth scrolling and animated reveals; the shader renders a still frame.
- Without JavaScript, the main editorial content and CSS hero surface remain available.
- Simulated WebGL context loss restores the CSS surface.
- Instrumented draw calls confirm animation on desktop, zero ongoing draws offscreen, correct resume on return, and zero ongoing draws in reduced-motion and mobile modes.
- No page exceptions or failed page resources during the interaction checks.
- axe-core 4.10.3 reported zero WCAG 2 A/AA and WCAG 2.1 A/AA violations with motion disabled for a stable contrast scan. Automated checks do not replace manual assistive-technology testing.

The surface renderer is capped at 60 Hz on desktop, pauses offscreen and in hidden tabs, caps pixel density, and renders a static mobile view. Frame-rate targets have not been benchmarked on physical desktop or mobile devices.

The implementation targets `main` in `https://github.com/weigenekhor/artifacts-by-gene`. The repository's original history and `CNAME` are preserved. Repository updates use the authenticated GitHub connection rather than command-line Git credentials. GitHub Pages serves the repository's static files; deployment status is checked separately after the repository update.
