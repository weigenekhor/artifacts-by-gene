# Start here — ARTIFACTS public website

## Panel transition efficiency — 25 October 2026

Navigation and Application Info keep their original geometry, colours, artwork and 220/240ms motion. Each open app retains at most four prepared layout nodes for its current theme; idle preparation pauses during panel motion. Theme/app changes and closing release these nodes. Repeated toggles reuse them rather than reconstructing the widgets. Hidden homepage cards are no longer rebuilt behind an app; its visible background still updates. Temporary compositor hints end with the transition.

48 tests pass, 30 modules pass syntax checking, and the native build succeeds. All 24 homepage markup outputs and existing CSS appearance rules match the pre-change baseline. The reproducible `node scripts/benchmark-panel-layouts.mjs` comparison covers all 19 apps: 80 repeated arrangements become four initial builds and zero repeat builds per app. This measures serialization/cache work, not browser FPS. Browser access remains disabled in Work settings, so rendered motion and GPU/memory behaviour remain unverified. Evidence: `../outputs/website-panel-motion-20261025/`.

## Desktop control fidelity — 25 October 2026

Scrollbar normal/hover/pressed colours and geometry now come from the desktop's shared theme rules. The exporter identifies scroll viewports by Qt ownership, including MET Compiler's `dashboardViewport` and Telemetry's `telemetryViewport`. All 180 exported scroll areas have one functioning browser scroll owner; the MET footer remains outside its scroller.

Native button artwork retains rounded clipping and caption alignment. Icons/arrows are exported separately so they cannot discard the native frame, and literal ampersands survive Qt mnemonic removal. All 1,656 button instances have native artwork. All 19 applications were re-exported and compared: no widget position, size, class or hierarchy changes. Home gutters reserve the full desktop rail without artificial horizontal overflow.

44 website tests, 27 module syntax checks and the native build pass. Native Qt captures confirm Metria Plot's original shape in all three themes. Browser access is disabled, so final composed browser appearance and input interactions are not claimed visually verified. This supersedes the scrollbar limitations described below; physical browser verification remains pending.

## Single functional scrollbar — 25 October 2026

Qt scroll areas now use one browser scrolling container in the space allocated by the desktop. Their exported static scrollbar images are hidden; the inner viewport no longer adds another browser rail. Decorative surfaces fit the client area, preventing a spurious horizontal scrollbar. Content dimensions, real overflow and keyboard scrolling are preserved. This covers 156 scroll areas across the 228 variants, including Data Lens.

Validation: 40 website tests and 27 syntax checks pass. The initial browser inspection confirmed the duplicate-rail cause and removal. Browser access was then disabled in Work settings, so the final gutter/surface correction has static regression coverage but no final browser visual confirmation.

## Native hero border correction — 25 October 2026

The 24 October preview refresh was published in commit `3b24be7`. Its gallery and hero assets remain in place. The current correction removes duplicate CSS surface/border paint only where an exported Qt vector already paints that widget. Native borders and ordinary CSS-only containers remain unchanged.

Validation: 38 tests pass, including coverage of all 228 application/theme/sidebar variants; 27 modules pass syntax checking and the native build succeeds. Browser checks confirm MET Compiler cards retain their native outlines without a second CSS frame in Tenebrismo and Pentimento. See `STATUS.md` for the current release record. This supersedes the earlier refresh's local-only and browser-unavailable status below.

## Current preview refresh — 24 October 2026

The local gallery now has 147 captures: 114 refreshed existing views, nine additional MET Compiler views across the three themes, and 24 retained report-only images audited as reusable. Current Plessey inputs, completed compilation and populated XRD search results precede the supported HV example. All 19 apps retain complete theme sequences.

Current native high-DPI Qt captures and lossless masters replace the stale screenshot sources. Homepage card/glyph layers, all 81 hover panels, both mobile hero sizes and all 228 source-exported empty-state layouts have been refreshed. The hover exporter now matches its screenshot cache to its 2× output density. The local notification showcase reflects the global preference and bubbler mute controls without unread title dots. Actual application pages remain presentation-only empty-state HTML layouts.

Validation: 37 website tests, 27 module syntax checks and full decoding/hash checks for all 732 gallery files pass. Desktop preview/glyph tests pass; 438 desktop code files are hash-unchanged. Fresh composed browser review remains unavailable because local browser control is disabled in Work settings. This refresh is local and has not been deployed. Source provenance: `content/capture-source-manifest.json`; detailed evidence: `C:/Users/Gene/Desktop/ARTIFACTS Preview Refresh 2026-10-24/REFRESH_REPORT.md`.

## Gene entrance correction — 19 October 2026

The credit previously appeared before the observer reached its 40% threshold, then vanished into its entrance animation. The JavaScript-enabled initial state is now hidden until the entrance is prepared. An early entry observer reveals it once and disconnects; revisiting never replays. Reduced-motion CSS and runtime show the credit immediately. Typography, content, layout and existing animation keyframes remain unchanged.

Validation: 34 tests and 26 module syntax checks pass. Browser verified initial hidden state, entry, repeated navigation and phone rendering at 390px, plus desktop rendering. No desktop application files changed.

## Static mobile hero and responsive spacing — 19 October 2026

Phones and tablets at 1100 CSS pixels and below now show a noninteractive image of the actual Tenebrismo/Pentimento desktop homepage. The 1229x820 and 2458x1640 WebP files in assets/hero preserve the exact desktop window aspect ratio, including title bar, navigation and footer. The fullscreen viewer and its controls are removed. The desktop hero remains interactive and its styling is unchanged. No desktop application files were modified.

The thinking figures and galleries use one spacious column at these widths. Each SVG is bounded inside its drawing area, with a 40 CSS pixel gap from its viewport bottom to the caption heading. This prevents Figure 03 from overlapping text. Mobile heading, paragraph and author spacing adapt without horizontal page overflow.

All favicon routes, including legacy assets/favicon.svg, now use the actual desktop ARTIFACTS icon. Favicon URLs are stable for crawler discovery. Google search can retain its previously indexed icon until it recrawls; deployment cannot force that cache to refresh.

Validation: 32 tests passed and 25 JavaScript modules passed syntax checks. Browser rendering checked at 320, 390, 768, 1024 and 1440 CSS pixels. Phone/tablet hero proportions and all three figure gaps were measured; desktop navigation/info expansion and theme switching were exercised. Physical iOS/Android devices were not available. Evidence: ../outputs/hero-responsive-20261018/phone-static-hero.png and phone-figure-spacing.png.

This supersedes the historical mobile viewer notes below.

## Mobile window viewer — 18 October 2026

The rejected compact card-grid redesign has been removed. Phones and tablets (1100 CSS pixels and below) show the complete original ARTIFACTS window in its native proportions. Explore ARTIFACTS opens the same live DOM window in a full-screen dialog, with Fit, 100%, zoom controls, drag/pinch navigation and separate Move view / Use app modes. Closing restores the original page, focus, scroll behavior, theme and application state. Rotation refits the view; returning to desktop width closes the viewer. Desktop styling and geometry remain unchanged.

Implementation: product-viewer.js, viewer-geometry.js and responsive-hero.css. Original native-home.js composition and native-shell.js panel behavior are restored; fullscreen hover popovers are suppressed. Existing gallery assets and actual source-exported application layouts remain intact. No desktop application files are changed.

Validation: all 35 tests pass and 27 JavaScript modules pass syntax checks. Browser checks covered 320/390px phones, 768px tablet portrait, 844x390 landscape and 1440px desktop; both editions, all three themes, application navigation, notifications, both expanded side panels, zoom, actual drag-to-pan, close/reopen state retention and Escape. Eight desktop selectors have identical computed geometry, fonts, colours and radii to the published desktop design at matching viewport sizes. No browser warnings/errors were observed. Pinch logic is regression-tested; actual iOS/Android hardware was not available. Screenshots: ../outputs/hero-responsive-20261018/phone-window-viewer-page.png.

## Glyph motion and consistent opening — 18 October 2026

Every new website load starts in Tenebrismo, regardless of previously saved website appearance. Theme switching still works during the current visit and remains independent of edition selection. Desktop preference persistence is unchanged.

The closing lines are shorter, single-line and bottom-aligned: “Turn repetition into a system.”, “Let the work guide what comes next.”, and “Keep improving through the work.” Their type scales within narrow cards without truncation.

Thinking motion is confined to existing glyph geometry. The wafer is nested inside the top slab, complete blocks separate and reassemble at their original anchors, and whole sheets lift and return in sequence. Face highlights follow the existing polygons. Detached signal paths, extra edges and check marks have been removed. Every loop returns to the original geometry; visibility pausing and reduced motion remain.

Validation: 30 tests pass, including fresh-load theme behavior, all gallery assets, animation timing/cleanup, original-shape restoration, and absence of detached decorations. All 24 JavaScript modules pass syntax checks. Browser verification remains unavailable: the supported browser reports local access disabled even after the user enabled it. Final rendered visual quality is not claimed as verified.


## Panel fidelity and motion refinement — 17 October 2026

The current desktop Application Info drawer is 218 logical pixels wide, with a 44-pixel header. The website now uses that width, a visible Application Info header and close button, and a title/status bar that begins after the expanded navigation and information columns. Native home and application layouts were re-exported for the 218/398-pixel information/combined offsets. Existing desktop code and user preferences remain unchanged.

The hero introduction now reads “ARTIFACTS / 19 APPLICATIONS BUILT AGAINST INEFFICIENCY”. The three thinking studies use a coordinated six-second cycle with stronger layer separation, outward block travel, staggered sheet movement and brighter silver strokes. Figure 3 ends with “Make each iteration earn its place in the work.” Reduced-motion and offscreen pausing remain supported.

Browser access initially opened the local page but subsequently reported disabled, including after the user re-enabled it. Updated composed browser rendering has not yet been visually verified; automated validation and publishing status are recorded in STATUS.md.


## Current instruction — desktop layouts only (17 October 2026)

Application demos are removed. Clicking an app opens its actual unpopulated desktop widget layout, exported directly from the current ARTIFACTS MainWindow and rendered as HTML with native vector control details. All 19 apps have three themes and four sidebar widths. There are no application screenshots, invented sample results or processing actions. Existing native buttons such as Load Example are visible but presentation-only. See [DESKTOP_LAYOUTS.md](DESKTOP_LAYOUTS.md).

This supersedes all historical demo/walkthrough directions below. Their source, fixtures and screenshot workspaces have been removed; Git preserves them. The homepage, public gallery, title bar and original grey website atmosphere are preserved. Browser visual verification remains pending due to the local-URL security policy; do not claim pixel identity or deploy as visually verified.

## Historical notes (superseded where they conflict)

## Current correction — live app demos (17 October 2026)

The latest user request rejects static app screenshots and supersedes the recorded-walkthrough approach below. All 19 hero apps now use local HTML controls, actual sample records and SVG results. See [LIVE_DEMOS.md](LIVE_DEMOS.md) for implementation, coverage, tests and explicit limitations. Homepage labels use regular single-line native typography; expedition headings and title-bar labels cannot wrap. The original website atmosphere and enlarged heading remain.

The recorded workspace images are archived, not loaded by the interactive runtime. Final browser rendering is pending because the browser security policy rejected local-URL access. Do not describe this as pixel-verified or publish it as fully reviewed.


## Native sample correction — 17 October 2026

The user rejected the earlier generic app simulations. Those generated forms, arbitrary measurements and SVG results have been removed. Each of the 19 applications now opens a recorded native walkthrough rendered by the real ARTIFACTS widget with built-in examples or approved Desktop test files. Measured hotspots replay supported native states, including actual charts, assignments, diagnosis cases and reports. These are finite recorded walkthroughs, not browser ports of the desktop applications. Unrecorded controls do not process data. See NATIVE_WALKTHROUGHS.md for coverage and limitations.

The original grey atmospheric backdrop and shadow from 0a692cc are restored. The ARTIFACTS heading is larger and more prominent. Live homepage, Application Info and panel typography remain. These decisions supersede the generic-demo and plain-graphite notes below.


## Live typography and interactive samples — 17 October 2026

The latest user request supersedes the older inspection-only hero rule. Every home card and application navigation item now opens a local sample workspace. All 19 registered apps have mode-specific demonstrations, working filters/actions, data/statistics, reset/clear and sample CSV export. Desktop processing algorithms are not ported: the visible “Interactive demo · Sample data” label identifies these illustrative workflows.

Home labels, expedition headings, Application Info and hover-panel copy now use live browser text. Native card surfaces and glyphs retain the measured desktop geometry. The outer website background is quiet graphite. Native 2D browser zoom is preferred over texture-scaled text where supported; the fallback preserves the original window proportions. See STATUS.md for verification limits.

## Current refresh — 17 October 2026

The product showcase now follows the latest desktop registry: 19 unique applications, including Aperture SPC and Telemetry, and three appearances: Imprimatura, Tenebrismo and Pentimento. Tenebrismo is the first-visit default; valid saved appearances take precedence, with old Origin preferences migrated to Imprimatura.

The native Suture picker replaces the old two-swatch selector. Twenty-four homepage layouts cover all theme/edition/panel combinations, and 81 application panels use the current desktop renderer. Application Info uses the refined graphite panel, with AGE updated from the local calendar in years and months.

The gallery contains 138 populated captures: 46 views per theme. Masters are the completed Upscayl 4× files in the Desktop ARTIFACTS Preview Refresh folder. The public palette, thinking chapter, authorship, navigation and gallery behavior retain their approved design. The pre-refresh version is preserved at `0a692cc`, tagged `review/before-three-themes-20261017`.

This section supersedes older two-theme and 17-app counts below. See STATUS.md for current verification and publication status.

This is the authoritative website direction. The preceding implementation is preserved at `cc2c3fc` and local tag `review/native-captures-cc2c3fc`. Older contained/fullscreen versions remain in Git. The immediate prior native handoff is preserved at `51750c3` and tag `review/native-handoff-51750c3`. The latest two-state brief supersedes the former independent product/gallery theme rule. Do not restore generated app forms.

## Current experience

- A restrained introduction leads into one native ARTIFACTS window. Legacy/Pentimento mode and Origin/Pentimento visual theme can be combined independently. Linear informed page composition only; no copied branding or assets.
- Home content is rendered offline from actual HomeWidget in 16 appearance/mode/panel states. Browser controls overlay exact source card positions.
- Hero cards show native information on hover/focus; touch uses the same bounded panel through the same interaction surface. Cards never open screenshot pages. Sidebar and Application Info push content right and use the desktop's native reflow. The complete 1229:820 window scales uniformly.
- The uniformly scaled window responds through cursor proximity, a subtle wafer rotation, and direct mode/theme controls. The composition settles into a centered product scene through native scrolling. Bottom-right status always says Pentimento, independently of the selected mode.
- The selected visual theme chooses matching application captures in the gallery and viewer. The website itself retains its graphite/warm-neutral identity; application ownership and order never change.
- The connected graphics remain alive through a shared friction → retained checks → feedback cycle, with continuous proximity emphasis. Exact approved copy lives in `scripts/principles.mjs`.
- Every canonical app appears once in the public gallery. Six receive wide emphasis; all retain names and purpose. The active theme selects its complete capture set in source order; no-JS offers links to every original view.
- Authorship is a restrained closing credit: BUILT BY GENE, the two-line statement, Gene | artifactsbygene.com, Email and LinkedIn, with a masked ghosted ARTIFACTS interface behind it.
- No WebGL, decorative 3D, generated engineering results or recreated default app pages. Cursor styling uses a small native arrow asset, never a trailing overlay.

## Read next

1. [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md): composition, type, palette, responsive behavior and motion.
2. [ARCHITECTURE.md](ARCHITECTURE.md): scoped product state, native home assets, capture views and deployment.
3. [CONTENT_AND_APPS.md](CONTENT_AND_APPS.md): sources, order, screenshot ownership and asset updates.
4. [STATUS.md](STATUS.md): verification and boundaries.

The latest explicit user request overrides these documents. Desktop source governs product fidelity; `content/apps.json` is the normalized application model.

## Run

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm lint
pnpm test
pnpm serve
```

Preview: http://127.0.0.1:8001/ . The generated HTML, ES modules and committed assets deploy directly to GitHub Pages. Desktop/Python sources are not needed for normal builds. Review branch: `rebuild/contained-product`.
