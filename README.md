# Artifacts by Gene

A personal engineering software showcase for **https://artifactsbygene.com**.

Plain HTML, CSS, and JavaScript. No build step, framework, CDN, analytics, or runtime dependencies. Geist is self-hosted under the SIL Open Font License; the license is included in `assets/fonts/OFL.txt`.

## Local preview

Run `python -m http.server 8000` from the repository root and open http://localhost:8000. Any static HTTP server works.

## GitHub Pages

This repository is designed for branch-based GitHub Pages publishing. In **Settings → Pages**, choose **Deploy from a branch**, **main**, and **/ (root)**. Merging the website changes into main makes them available to the configured Pages deployment. No build command is needed.

The existing `CNAME` is preserved and specifies `artifactsbygene.com`. Keep the domain's existing DNS configuration. Enable HTTPS in Pages settings once GitHub has provisioned the certificate. Relative asset paths also work at the repository's default GitHub Pages address.

## Content to finish

- **Project profiles:** the `systems` object in `js/systems.js` contains clearly marked placeholder descriptions. Replace them with verified descriptions, interface captures, technical notes, and actual project links. Keep the initial GaN profile in `index.html` synchronized for visitors without JavaScript.
- **Project artwork:** current SVG plots are explicitly labeled conceptual, not live data. Replace them with approved interface captures when available.
- **About and approach:** editorial draft copy in `index.html` is marked for approval or replacement. No employers, dates, achievements, metrics, or unverified capabilities have been added.
- **Experience / CV / contact:** add when ready. No fake contact links or unavailable downloads are exposed.
- **Evolution:** intentionally undated until verified project history is available.
- **Brand:** the temporary geometric A mark appears in the header and `assets/favicon.svg`.
- **Social preview:** `assets/social-preview.png` is the 1200 × 630 sharing image referenced by Open Graph metadata.

## Interaction and performance

The hero uses a custom WebGL shader with one triangle and an analytic wafer slab. Reflected strip lighting, a shaded bevel, subtle die variation, and restrained interference give the object depth. Orientation and lighting follow the pointer with separate critically damped responses. The wafer rotates slowly even without interaction.

`js/motion.js` owns the shared frame clock, easing, timing, media preferences, entrance, native-scroll parallax, and small magnetic arrow responses. `js/surface.js` owns WebGL. `js/systems.js` owns project selection, interruptible SVG interpolation, the four conceptual visual studies, and the project dialog. `motion.css` holds the interaction layer, while `styles.css` retains the editorial layout. `script.js` initializes the modules. No GSAP, Three.js, or runtime dependencies are used.

Rendering stops offscreen and in hidden tabs. Desktop rendering targets 60 Hz with at most 1.1 million shader pixels; mobile targets 24 Hz with at most 420,000 pixels. Sustained slow frames reduce render resolution. Mobile retains the title reveal, section transitions, rotating material, and touch project selection. The CSS surface remains available if WebGL fails, and WebGL can recover after context restoration.

The **Motion on/off** control pauses nonessential animation and remembers the choice for the session. An operating-system reduced-motion preference takes precedence. Reduced-motion mode removes spatial transitions and continuous rendering while retaining immediate, clear project state changes. The first title entrance lasts approximately 1.3 seconds; repeat visits in the same session shorten it. There is no loading gate and navigation remains available throughout.

Project visuals illustrate thermal profiles, reference deviations, zone distributions, and workflow structure. They are explicitly conceptual and contain no real measurements. Hover after a short dwell, click, touch, arrows, Home, and End select a system. Keyboard focus takes precedence over hover selection. The native cursor is retained. Notes use a native modal dialog with Escape dismissal and focus restoration.

## Run the browser checks

The website needs no package installation to run. The optional test suite uses development dependencies only:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm test
```

The test starts its own local static server and saves screenshots and a JSON report in the ignored `.qa/` directory. To use an installed Edge browser, set `BROWSER_CHANNEL=msedge` before running the test. It covers responsive layouts, actual chart interpolation, rapid selection, keyboard and touch input, pause/resume, reduced motion, accessibility, and WebGL fallback/recovery, and records a warmed desktop frame sample.

See `VALIDATION.md` for checks and their limitations.
