# Implementation status

## Current refresh — 17 October 2026

Implemented locally against the current desktop source and the completed Upscayl capture archive:

- 19 applications, including Aperture SPC and Telemetry; current registry names, metadata and Expedition membership.
- Imprimatura, Tenebrismo and Pentimento, independent of Legacy/Pentimento edition. Tenebrismo is the default; saved preferences and old Origin/void keys are handled.
- Current Suture dropdown, theme-aware edition switch, notification glyph and normalized native sidebar icons.
- 24 source-rendered home layouts, 81 native application panels and three refined Application Info drawers. AGE updates from the local date in years/months with no days.
- 138 ordered screenshots, with four responsive sizes and full 4× dimensions per view. All source hashes match the untouched lossless Desktop masters. Active screenshot assets total approximately 294.6 MB; only responsive images load during normal browsing.
- Existing public design, thinking chapter, authorship, gallery controls, motion and no-JavaScript fallbacks retained.

Validation: build and JavaScript syntax checks pass; all 18 tests pass. Tests cover all capture assets and dimensions, local links, all theme/edition memberships, panel geometry, saved-theme migration, local calendar age, stable dropdown interaction, keyboard dismissal, gallery navigation, reduced motion and cache behavior. Native exported panel images were inspected directly.

Browser review is partially complete: the current desktop render was inspected in Imprimatura and Tenebrismo; edition switching, the stable appearance dropdown, and Application Info opening with the correct local AGE were exercised. Browser console inspection returned no warnings or errors during those checks. Full gallery, Pentimento appearance, persistence and mobile visual checks remain pending.

Browser access then became unavailable again, including after the user re-enabled access and the browser connection was reset. The tool reports “Local browser use is disabled in Work settings.” The local preview is reachable at http://127.0.0.1:8001/ (HTTP 200). Implementation commit `afed694` has been pushed to `rebuild/contained-product`; production `main` remains at `0a692cc`. Do not interpret earlier visual-review results below as verification of this new revision. The live website has not been changed by this refresh.

The previous website is preserved at `0a692cc`, tag `review/before-three-themes-20261017`. Desktop source and capture masters were not modified. Older assets remain recoverable and have not been removed.

Changed implementation files: `state.js`, `native-shell.js`, `appearance-menu.js`, `application-age.js`, `gallery.js`, `site.js`, `tokens.css`, `shell.css`, the catalogue and reference JSON files in `content/`, generated `index.html`, native and screenshot assets, build/import/export/audit scripts, and `tests/native.test.mjs`. Project documentation records the new workflow.

The sections below describe historical validation of the previous published website.

## Continuous native system

The hero has been recomposed around two readable native states. At desktop the windows occupy 53% of a shared 1800px field, with limited overlap over the wafer. The Pentimento identifier sits on the clear outer edge. The previous bottom edition selector is gone.

One normalized, damped horizontal focus drives both states: scale, position, subtle Y perspective, contrast, integrated labels, native light and low-opacity environment. Pointer exit retains the last focus. Stacking stays fixed, avoiding a midpoint pop. A dominant edition selects corresponding gallery captures through the existing shared state. Keyboard and touch can select either integrated identifier. Below 1100px, the pair becomes staggered vertically with explicit native information access.

The native wafer makes one revolution per 120 seconds beneath its fixed source illumination. Entry resolves atmosphere, native states, details and identifiers over 1.37 seconds. Separate wrappers own entry, proximity and scroll transforms so animations do not fight. No canvas, WebGL, frontend framework or new runtime dependency was added.

## Thinking and handoff

The hero's lower structural line continues down the margin into the thinking spine as product presence recedes. The opening remains calm. The outcome has greater emphasis than “Less repetition”; the relationship sentence sits beside the beginning of the visual system.

Three retained line-art drawings now share one 11.3-second score and one measured travelling packet. Evidence aligns, repeated paths consolidate, checks resolve, the output responds, a relationship adjusts, and the system rests before another pass. The large U-shaped return path is removed. Identifiers are small: 01 / FRICTION, 02 / STRUCTURE, 03 / REFINEMENT. Approved copy is retained, including the revised first description. A grid sizing correction keeps all three SVGs exactly aligned with the spine.

Pointer proximity subtly emphasizes local relationships without moving text. Meaningful motion pauses offscreen and in hidden documents. Reduced motion presents stable native states and resolved diagrams. Mobile uses a vertical relationship and stacked captions.

## Verification

- Build, syntax and twelve existing behavioral/asset tests pass.
- All 694 referenced local URLs respond successfully. The gallery still contains 17 canonical applications and 58 original capture derivatives, with no membership/order change.
- Reviewed actual renders at 2560×1440, 2560×1600, 1920×1080, 1440px, 1280px, 1024px and 390px. No document overflow was observed. Both native windows preserve their original aspect ratio. Tablet window width increased from approximately 500px to 750px during refinement.
- Exercised continuous pointer focus transfer, native keyboard inspection, Escape dismissal, independent mode/theme and capture changes and touch details. Mobile details remained fully inside the viewport without a separate application-information selector.
- A local 240-frame profile recorded a 16.7ms median and 17.4ms 95th percentile. Cached native information updates took 0.3–0.5ms with zero home-grid mutations. One 84ms task occurred during initial loading; no interaction long task was recorded in that sample. This is local browser evidence, not a hardware-wide 60fps guarantee.
- Reduced-motion fixture runs the actual reduced-motion stylesheet rules and matching JavaScript state. No-JavaScript fixture has no scripts and retains all 58 full-resolution capture links. Review fixtures and captures remain ignored under `.qa/native-review/`, prefixed `continuous-`.
- Browser review recorded no runtime errors. Runtime modules total approximately 38.4KB, with no external runtime libraries.

## Preservation

Review branch: `rebuild/contained-product`. The previous version is preserved at `60b50b8` and tag `review/two-states-60b50b8`. Older versions remain in Git. Production is not promoted by this pass.

Gallery image navigation is now separate from expansion: clicking a multi-image capture advances and wraps per app; only the explicit expand control opens the viewer, and each app retains its own position. Unrelated creator copy, footer and source metadata are preserved. Desktop source and original screenshots were not changed. No source asset was missing. GitHub Pages remains a static deployment with unchanged CNAME and relative asset paths.
