# ARTIFACTS — sequential software exhibition

## Current direction

The latest correction is implemented in v8: remove the Papyrus-specific opening example, tell the ecosystem's wider story, replace Papyrus with the new Desktop capture, and make workflow motion the primary app visual. Screenshots are small, optional supporting evidence. All sixteen applications still advance on scroll. Do not restore the recipe-comparison introduction, oversized screenshots, logo extrusion, click-required exploration, cropped images or network map.

## Repository and review

Repository: https://github.com/weigenekhor/artifacts-by-gene
Local: C:/Users/Gene/OneDrive/Documents/AppVerse/artifacts-by-gene
Branch: experience/continuous-instruments
Review: https://github.com/weigenekhor/artifacts-by-gene/pull/3
Production main remains 8882080a37215432cf419026d632fa2e845cdbac until an authorized merge.

The GitHub connector publishes branch changes; shell git has no saved push credentials. Compare the complete local/remote tree before synchronizing local history. Never overwrite unrelated changes.

## Implementation

Four opening beats: measured surface, repetitive inputs, reusable method, a body of tools. The structure form resolves sixteen streams into four ordered groups, anticipating the original Expeditions. Native scroll then drives app 1 through 16, with readable hold intervals. Large workflow geometry progresses from inputs to results across each app interval; optional controls remain. Small full screenshots sit beneath the copy with a larger viewer available. Geometry relocates into the study area using FLIP at the handoff. Screens rest without transforms. A four-Expedition index follows; creator attribution is quiet.

Source files: content/page.html, content/apps.json, js/experience.js, js/forms.js, js/world.js and styles.css. Build with node scripts/build.mjs or pnpm build; index.html, js/apps.js and script.js are generated. The controller has a 0–19 scroll clock and preserves the active app when the viewport changes. Header height is reserved in sticky layout and the header is opaque.

All sixteen current application captures are full.webp under assets/evidence. These are decoded-pixel-identical to the supplied Desktop PNGs. Updated Papyrus Reader is 1531 × 1002; the other fifteen are 1425 × 950. No crop or invented image is displayed. Existing archives remain intact. The preparation script accepts an optional app ID and preserves editorial content when refreshing images.

## Validation and preview

The current full browser suite passed: sixteen scroll-driven apps and motion controls, eleven viewport/DPR combinations, six accessibility scans, keyboard/deep links, orientation changes, image viewer, header clearance, reduced motion, no WebGL, no JavaScript and zero console/resource errors. Image-fidelity suites and a fresh comparison to Desktop originals passed. See VALIDATION.md for measured performance and limits.

Preview: http://127.0.0.1:8001/ — verify HTTP 200 before handing over. A hidden Python static server serves the repository. No runtime CDN, API key, framework server or deployment build service is needed.

Physical mobile hardware, Safari and Firefox remain untested. Geometric studies are illustrative. Production should remain unchanged until the user instructs a merge.
