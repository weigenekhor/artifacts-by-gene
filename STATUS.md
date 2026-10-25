# Implementation status

## Desktop notification panel parity — 25 October 2026

Website notification centre now follows the current desktop header, 512px panel geometry, 20px centred new-count chip, bell/bell-off vectors, compact On/Off control before read-all, divider/tabs, notification-specific theme materials, card spacing and bottom-right read/delete actions. Removed the old checkbox, demonstration row and reset/status footer. Sample content remains explicitly identified in the accessible description; the website does not monitor equipment. Card action menus support read/dismiss/delete and keyboard navigation. Reminder actions are stacked as in desktop. Off preference and reminder mutes persist; Off hides unread badges, and muted reminders are retired from the list.

Validation: 59 automated tests, 33 JavaScript syntax checks and the native build pass. Browser checks cover all three theme palettes, normal/Off icons and badges, preference persistence across reload, read/unread filtering, reminder mute, long export-path wrapping, menus with arrow keys/Escape, delete-all/empty state and Legacy mode. Export-path content measured 59px tall without horizontal overflow. Navigation/info CSS remains equal to the prior baseline after excluding notification rules; desktop source and gallery assets were not modified. Physical multi-monitor/DPI testing was not performed.

## Metria Plot outline — 25 October 2026

The Plot button now uses one continuous SVG outline instead of Qt's independently drawn border strips/corner arcs, removing visible joins at scaled hero sizes. Native colours, 4px outer rounding, 108 × 34 geometry, text and surrounding layout are retained across all twelve variants. The exporter derives this outline from the desktop button stylesheet; desktop files are unchanged.

Validation: 55 website tests, 32 JavaScript syntax checks and the native build pass. A structural comparison confirms only the twelve Plot chrome fields changed in the layout manifest. Before/after SVG renders were inspected at 100%, 125%, 150% and 200%, alongside native Qt button captures. Evidence: `../outputs/metria-border-20261025/`. Browser control remains disabled, so composed live browser rendering is unverified.

## Hero hover movies — 25 October 2026

Replaced 69 continuously animated hover strips with denser samples of the same desktop painter: 112 frames at 16 ms, unchanged 1792 ms loops and 2x pixel dimensions. Preserved all 12 intentionally discrete/static mapped strips. Four shared phases per asset are compared with the baseline; continuous samples have less than 2/255 channel RMS difference (lossy re-encoding), preserved assets are byte-identical. No motion interpolation, artwork redesign, CSS geometry or loop-speed changes.

Playback now attaches the prepared image itself, with a two-entry cache, cancellation of evicted pending loads, stale-hover protection, retryable failures and cleanup on hidden-document, theme and reduced-motion changes. Nearby cards warm on demand. All 54 tests pass; 32 JavaScript module syntax checks and native build pass. Native comparison contact sheets were inspected. Browser control is disabled in Work settings; encoded 62.5 fps is verified, actual browser delivery is not. The mapped movie payload grows from 16.69 MB to approximately 25.16 MB across the catalogue, loaded on demand rather than all at once. Desktop source, static panel screenshots and gallery assets are untouched.

## Panel transition efficiency — 25 October 2026

Preserved all visual rules, transition durations and exported layout assets. Workspace DOM nodes are reused across the four panel arrangements, with a bounded current-app/current-theme cache, cancellable idle preparation and a lazy fallback. Hidden home cards are not rebuilt while an app is displayed; home navigation restores the correct full layout. Temporary compositor hints are removed after motion.

Validation: 48 tests pass; 30 JavaScript modules pass syntax checking; native build succeeds. Tests cover cache identity/bounds, theme/app changes, cancellation, stale fetches, low idle budgets, skipping preparation during motion, no-idle fallback, and byte-identical homepage markup for all 24 variants. Existing CSS appearance is checked against the pre-change baseline. Benchmark: all 19 apps, 80 arrangements each, four initial builds and zero repeated builds. `scripts/benchmark-panel-layouts.mjs` reproduces the serialization/cache comparison; this is not DOM/layout/paint/FPS profiling. Browser access remains disabled in Work settings, preventing physical animation and GPU/memory verification. Desktop source is untouched.

## Desktop control fidelity — 25 October 2026

Refreshed all native layouts from the current desktop in the isolated export harness. Retained rounded button clipping, native frames for icon/arrow buttons, left/right caption alignment and escaped ampersands. All 1,656 button instances retain native artwork; geometry comparison across all 228 variants found no changes to widget bounds, class or hierarchy.

MET Compiler and Telemetry renamed viewports are now identified by Qt ownership. 180 scroll areas use a single browser scroller; MET's footer is outside the scroll area. Browser rails use the desktop theme's 22px allocation, 10px handle, 6px side insets, 5px track ends, 1px thumb ends and theme-specific normal/hover/pressed colours. Overflowing home sheets reserve the rail without moving the existing content.

Validation: 44 tests pass, 27 modules pass syntax checks, native build succeeds. Source Qt Metria Plot button captures were inspected in all three themes. Browser control is disabled in Work settings; final rendered browser fidelity, wheel, drag and keyboard interaction still need a browser check. Existing desktop source and gallery images remain unchanged. Evidence: `../outputs/website-fidelity-20261025/`.

## Single functional scrollbar — 25 October 2026

The renderer assigns scrolling to each Qt scroll area, makes its inner viewport transparent to overflow and hides only that area's exported static rails. A desktop-sized browser rail occupies the existing gutter. The surface layer fits the client box so it cannot manufacture horizontal overflow. Genuine horizontal overflow remains accessible.

40 tests pass, including 156 exported scroll areas and Data Lens gutter geometry in every theme/sidebar variant. 27 syntax checks and the native build pass. Initial browser inspection verified the duplicate rails; final browser validation is limited because local browser access was disabled mid-task. Desktop source and preview captures are unchanged.

## Native hero border correction — 25 October 2026

The preview refresh is published at commit `3b24be7`. This follow-up removes duplicate borders/backgrounds from the HTML renderer where Qt SVG chrome already owns them. All current gallery and hero assets are preserved. Ordinary controls without exported paint keep their CSS borders.

Validation: 38 website tests pass; all 228 app/theme/sidebar variants are covered by the new paint-ownership regression. Native build and 27 module syntax checks pass. Browser review confirms the corrected MET Compiler outline in Tenebrismo and Pentimento. Evidence: `../outputs/notification-border-arrow-20261025/website-met-borders.png`. This release follows the existing GitHub Pages deployment.

## Current preview refresh — 24 October 2026

Completed locally: all 114 identified stale captures replaced, nine additional MET Compiler frames added, 24 reusable report captures preserved; total 147 captures in all three themes. The 732 mapped gallery files decode successfully and match current provenance. Native high-DPI lossless masters are archived on Desktop. All 24 home layouts, 324 card images, 81 hover panels, two mobile hero sizes and 228 empty-state HTML layouts were refreshed. The notification showcase includes persistent global enable and bubbler mute controls; title dots are removed.

Verification: 37 website tests pass, 27 modules pass syntax checks, build succeeds, four desktop home/preview/glyph test modules pass, and all 438 snapshotted desktop code files remain unchanged. Native contact-sheet review covers all installed frames. Browser visual verification is blocked by disabled local browser access in Work settings. Not deployed. Full report: `C:/Users/Gene/Desktop/ARTIFACTS Preview Refresh 2026-10-24/REFRESH_REPORT.md`.

## Current application screenshots — 20 October 2026

Refreshed all 138 gallery captures (19 applications, three appearances) from the current Desktop/Artifacts application. The scenes and capture types match the previous gallery. Images were enlarged with the installed Upscayl 2.15.0 engine and upscayl-lite-4x model, then encoded as full-resolution and responsive WebP assets. Canonical screenshot hashes and provenance are recorded in content/apps.json and content/capture-source-manifest.json. The desktop preview assets were updated separately; desktop application code remains unchanged.

Validation: all 690 website images decoded, 34 tests passed, and 26 JavaScript modules passed syntax checks. Native captures and installed desktop previews were visually inspected. A fresh composed browser check was unavailable because browser control was disabled in Work settings. The website runtime, layout, hero and styles are unchanged by this refresh.

## Gene entrance correction — 19 October 2026

The credit previously appeared before the observer reached its 40% threshold, then vanished into its entrance animation. The JavaScript-enabled initial state is now hidden until the entrance is prepared. An early entry observer reveals it once and disconnects; revisiting never replays. Reduced-motion CSS and runtime show the credit immediately. Typography, content, layout and existing animation keyframes remain unchanged.

Validation: 34 tests and 26 module syntax checks pass. Browser verified initial hidden state, entry, repeated navigation and phone rendering at 390px, plus desktop rendering. No desktop application files changed.

## Static mobile hero and responsive spacing — 19 October 2026

Phones and tablets at 1100 CSS pixels and below now show a noninteractive image of the actual Tenebrismo/Pentimento desktop homepage. The 1229x820 and 2458x1640 WebP files in assets/hero preserve the exact desktop window aspect ratio, including title bar, navigation and footer. The fullscreen viewer and its controls are removed. The desktop hero remains interactive and its styling is unchanged. No desktop application files were modified.

The thinking figures and galleries use one spacious column at these widths. Each SVG is bounded inside its drawing area, with a 40 CSS pixel gap from its viewport bottom to the caption heading. This prevents Figure 03 from overlapping text. Mobile heading, paragraph and author spacing adapt without horizontal page overflow.

All favicon routes, including legacy assets/favicon.svg, now use the actual desktop ARTIFACTS icon. Favicon URLs are stable for crawler discovery. Google search can retain its previously indexed icon until it recrawls; deployment cannot force that cache to refresh.

Validation: 32 tests passed and 25 JavaScript modules passed syntax checks. Browser rendering checked at 320, 390, 768, 1024 and 1440 CSS pixels. Phone/tablet hero proportions and all three figure gaps were measured; desktop navigation/info expansion and theme switching were exercised. Physical iOS/Android devices were not available. Evidence: ../outputs/hero-responsive-20261018/phone-static-hero.png and phone-figure-spacing.png.

This supersedes the historical mobile viewer notes below.

## Browser icon — 18 October 2026

Browser favicon now uses an exact copy of the desktop ARTIFACTS icon.ico. The 32px, 48px and 256px PNGs are extracted directly from that ICO; the 180px Apple touch icon is resized from its 256px entry. The generated page declares all formats with content hashes for cache updates. Root favicon.ico supports clients that request the conventional location. Existing in-page branding and UI remain unchanged. Authoritative source: C:/Users/Gene/Desktop/Artifacts/icon.ico (used by Artifacts.py contrast_safe_window_icon).


## Mobile window viewer — 18 October 2026

The rejected compact card-grid redesign has been removed. Phones and tablets (1100 CSS pixels and below) show the complete original ARTIFACTS window in its native proportions. Explore ARTIFACTS opens the same live DOM window in a full-screen dialog, with Fit, 100%, zoom controls, drag/pinch navigation and separate Move view / Use app modes. Closing restores the original page, focus, scroll behavior, theme and application state. Rotation refits the view; returning to desktop width closes the viewer. Desktop styling and geometry remain unchanged.

Implementation: product-viewer.js, viewer-geometry.js and responsive-hero.css. Original native-home.js composition and native-shell.js panel behavior are restored; fullscreen hover popovers are suppressed. Existing gallery assets and actual source-exported application layouts remain intact. No desktop application files are changed.

Validation: all 35 tests pass and 27 JavaScript modules pass syntax checks. Browser checks covered 320/390px phones, 768px tablet portrait, 844x390 landscape and 1440px desktop; both editions, all three themes, application navigation, notifications, both expanded side panels, zoom, actual drag-to-pan, close/reopen state retention and Escape. Eight desktop selectors have identical computed geometry, fonts, colours and radii to the published desktop design at matching viewport sizes. No browser warnings/errors were observed. Pinch logic is regression-tested; actual iOS/Android hardware was not available. Screenshots: ../outputs/hero-responsive-20261018/phone-window-viewer-page.png.

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
