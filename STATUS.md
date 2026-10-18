# Implementation status

## Responsive hero — 18 October 2026

The desktop hero above 1100 CSS pixels retains its existing measured sheet, scaling, chrome and artwork. At 1100px and below, the same shell renders at readable CSS-pixel size. Homepage cards reuse crops of the existing native card sheet and reflow by Expedition. No replacement icons, application screenshots, sample data or desktop source changes are introduced.

Navigation and Application Info become mutually exclusive overlay drawers on compact screens. Native app layouts retain their exported geometry inside a scrollable workspace. Phone title-bar controls and appearance/notification menus fit the contained product window; browser pinch zoom remains available. The gallery and surrounding website remain unchanged.

Implementation: responsive-hero.css, native-home.js, native-shell.js and the normal HTML build. Focused regression coverage verifies app ownership, order, artwork crops and preserved desktop coordinates across every exported home variant. Verified in the browser at 320px and 390px phone widths, 768px tablet portrait and 1024px tablet landscape. Checked both editions, all three appearances, theme dropdown, notifications, mutually exclusive compact drawers and opening a native app layout. No horizontal page overflow was found. Fixed the notification header at 320px so the close button remains visible. Desktop native geometry, fonts, colours, materials and radii match the pre-change production version for the ten measured shell/card/control selectors, both closed and with both panels expanded. Browser console had no warnings or errors. All 32 tests pass. Evidence: outputs/hero-responsive-20261018 in the parent workspace. Actual iOS Safari hardware was not available; browser viewport checks do not replace device testing.


## Housekeeping compatibility publication — 18 October 2026

Updated desktop export and catalogue scripts for the reorganized ARTIFACTS source
folders. The native exporters use the lightweight widgets initializer; the wafer
exporter imports its required shared color helper. Source documentation now points
to the current desktop folder. Existing public layouts, assets and appearance are
unchanged. A fresh native build still produces 19 applications, six Expeditions
and 138 screenshots; all 30 website tests pass. Exporter startup and temporary
wafer rendering were verified during the preceding housekeeping audit.

Publication targets the existing GitHub Pages `main` branch and custom domain,
as requested. The visual version already published at `edb2f8a` is preserved.

## Glyph motion and consistent opening — 18 October 2026

Every new website load starts in Tenebrismo, regardless of previously saved website appearance. Theme switching still works during the current visit and remains independent of edition selection. Desktop preference persistence is unchanged.

The closing lines are shorter, single-line and bottom-aligned: “Turn repetition into a system.”, “Let the work guide what comes next.”, and “Keep improving through the work.” Their type scales within narrow cards without truncation.

Thinking motion is confined to existing glyph geometry. The wafer is nested inside the top slab, complete blocks separate and reassemble at their original anchors, and whole sheets lift and return in sequence. Face highlights follow the existing polygons. Detached signal paths, extra edges and check marks have been removed. Every loop returns to the original geometry; visibility pausing and reduced motion remain.

Validation: 30 tests pass, including fresh-load theme behavior, all gallery assets, animation timing/cleanup, original-shape restoration, and absence of detached decorations. All 24 JavaScript modules pass syntax checks. Browser verification remains unavailable: the supported browser reports local access disabled even after the user enabled it. Final rendered visual quality is not claimed as verified.


## Release refinement — 17 October 2026

Updated the hero introduction exactly as requested; increased the three thinking studies' motion and graphite/silver contrast, shortened the synchronized cycle to six seconds, and added the third closing sentence. Kept reduced-motion, visibility pausing and animation cleanup.

Matched the actual desktop sidebar structure: 218-pixel Application Info width, visible 44-pixel header, close action, live typography and bottom metadata/links. Title bar and status bar now start after the expanded columns. Re-exported homepage and unpopulated application layouts for the corrected widths, retaining all apps and themes. Asset/runtime URLs invalidate the old geometry. No desktop source or existing screenshot gallery was changed.

Validation: all 29 tests pass, all 24 JavaScript modules pass syntax checks, and all 19 applications export with no unsupported controls. Regression checks cover the complete catalogue and screenshot assets, theme persistence, navigation, native layout widths, notifications, dropdown stability, timeline bounds/synchronization, reduced motion, copy and header structure. Publication is to the existing GitHub Pages main branch and artifactsbygene.com, as explicitly requested by the user.

Visual verification limit: the preview opened successfully before edits, but the supported browser subsequently reported local access disabled even after the user re-enabled it. Final composed browser appearance and animation have not been visually verified. No alternate browser or rendering workaround was used, and pixel identity is not claimed.


## Current instruction — desktop layouts only (17 October 2026)

Application demos are removed. Clicking an app opens its actual unpopulated desktop widget layout, exported directly from the current ARTIFACTS MainWindow and rendered as HTML with native vector control details. All 19 apps have three themes and four sidebar widths. There are no application screenshots, invented sample results or processing actions. Existing native buttons such as Load Example are visible but presentation-only. See [DESKTOP_LAYOUTS.md](DESKTOP_LAYOUTS.md).

This supersedes all historical demo/walkthrough directions below. Their source, fixtures and screenshot workspaces have been removed; Git preserves them. The homepage, public gallery, title bar and original grey website atmosphere are preserved. Browser visual verification remains pending due to the local-URL security policy; do not claim pixel identity or deploy as visually verified.

## Historical notes (superseded where they conflict)

## Current correction — live app demos (17 October 2026)

The latest user request rejects static app screenshots and supersedes the recorded-walkthrough approach below. All 19 hero apps now use local HTML controls, actual sample records and SVG results. See [LIVE_DEMOS.md](LIVE_DEMOS.md) for implementation, coverage, tests and explicit limitations. Homepage labels use regular single-line native typography; expedition headings and title-bar labels cannot wrap. The original website atmosphere and enlarged heading remain.

The recorded workspace images are archived, not loaded by the interactive runtime. Final browser rendering is pending because the browser security policy rejected local-URL access. Do not describe this as pixel-verified or publish it as fully reviewed.


## Native walkthrough correction and restored hero — 17 October 2026

The rejected generic demo engine is removed. All 19 apps now open source-rendered native walkthroughs using ARTIFACTS built-in examples and approved test files: 134 recorded views per appearance, 402 themed views total. Actual native controls select recorded app modes, filters, chart parameters, assignment slot counts, measurement zones and report views. Actual compiled Met and LayTec sample workbooks can be downloaded. This is a bounded recorded walkthrough, not a browser port: arbitrary file processing, text editing, plot gestures and unrecorded desktop controls are not implemented. See NATIVE_WALKTHROUGHS.md for per-app coverage.

Restored the original grey atmospheric background and shadow from 0a692cc. Increased the ARTIFACTS hero heading's size and weight, with separate responsive sizing. Homepage and Application Info text remain live, and the existing 138-image gallery remains intact.

Validation: build and syntax checks pass; all 28 tests pass. New checks cover all themed native views, 2× image density, source-measured control bounds and destinations, meaningful app-specific transitions, independent app state, stale image races, Home navigation and exact restoration of the background CSS. Inspected all 19 initial native views across all three appearances, plus report and chart samples. TopoPro uses the verified GPU-rendered desktop master because the offscreen exporter cannot render WebGL. Some Qt exporter processes encountered a Windows teardown fault after writing their complete output; every published image and metadata record was subsequently decoded and validated.

Restarted the hidden local preview on port 8001. HTTP checks passed for the page, demo modules/styles, all 402 view assets and the two output workbooks (411 requests). Browser automation still reports local browser use disabled in Work settings; final composed desktop/mobile browser review remains unverified. No production deployment was made. Desktop application source and original capture masters were not changed.

Changed files: demo-model.js, demo-view.js, demo-workspace.js, demo.css, native-shell.js, site.js, site.css, shell.css, scripts/build-native.mjs, scripts/build-demo-manifest.mjs, scripts/export-demo-scenes.py, scripts/import-topopro-scene.mjs, tests/demos.test.mjs, generated index.html, content/native-demos.json, content/workspaces/*, assets/native/workspaces/*, assets/samples/*, START_HERE.md, ARCHITECTURE.md, DESIGN_SYSTEM.md, NATIVE_WALKTHROUGHS.md and this status record. Earlier generic-demo claims below are historical and superseded.


## Live text and 19 interactive sample workspaces — 17 October 2026

Implemented the user's approved interactive-sample scope on the review branch. Home cards and sidebar entries open all 19 apps. Each workspace has source-informed views, selectable sample inputs, actions, reset/clear, data/statistics and CSV export. Data and visualizations are deterministic local examples, clearly marked as samples; these are not production engineering calculations. Theme changes preserve the current workspace. Edition changes return Home, and each app's sample state is retained for the current page session.

Application Info, home card labels, expedition headings and hover-panel text are now live DOM typography. The desktop exporter records exact label bounds and removes text from the underlying raster surfaces. All 24 home layouts and 81 detail-panel geometries remain unchanged. Native card art remains high density. Browser zoom replaces compositor scaling where supported, and the main UI plane no longer uses a 3D scroll translation. The bright grey hero surround is replaced with a restrained graphite field.

Validation: build, syntax and 26 tests pass. New tests cover all app/view/filter combinations, finite chart coordinates, deterministic samples, isolated state, run/clear/reset, statistics, export content and workspace event wiring. Native layer images were inspected separately, and existing screenshot, theme, dropdown, notification and age regressions still pass. Local HTTP preview is running on port 8001.

Remaining limitation: browser access reports “Local browser use is disabled in Work settings.” The new DOM composition and demos have not been visually exercised in a browser; final desktop/mobile/DPI inspection remains pending. No production deployment has been made. The existing gallery and all 138 screenshot captures remain intact.

Changed file groups: `demo-model.js`, `demo-view.js`, `demo-workspace.js`, `demo.css`, `native-home.js`, `native-shell.js`, `shell.css`, `site.js`; native build/export scripts; generated home/panel reference JSON and raster layers; `index.html`; tests, package test command and project documentation. Desktop application code and capture masters were not modified.

## Hero clarity and notification demonstration — 17 October 2026

The native homepage content and hover layers are rendered at 4× density with lossless WebP, including high-density glyphs drawn from the desktop vector code. The export keeps the existing logical card bounds. Nested 3D texture promotion and pointer perspective were removed from the UI plane; wafer rotation, dragging, navigation, theme changes and page transitions remain. Scroll translation is aligned to device pixels. Updated URLs invalidate the older low-density hero assets.

The title-bar bell now opens a theme-aware notification centre with three explicitly labelled samples. All/unread filters, mark-as-read, mark-all-read, individual deletion, delete-all, reset, Escape, outside dismissal and keyboard focus restoration are supported locally. It does not access desktop monitoring data, send notifications, or persist fake alerts.

Build, syntax and 20 tests pass for this change, including native output density and notification state/interaction tests. Rendered homepage layers were inspected over an opaque background. Browser visual verification remains blocked by the Work browser-access setting; the notification panel and final composited hero have not yet been visually reviewed in-browser. Production remains unchanged.

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
