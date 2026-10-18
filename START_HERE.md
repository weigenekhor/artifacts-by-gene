# Start here — ARTIFACTS public website

## Responsive hero — 18 October 2026

The desktop hero above 1100 CSS pixels retains its existing measured sheet, scaling, chrome and artwork. At 1100px and below, the same shell renders at readable CSS-pixel size. Homepage cards reuse crops of the existing native card sheet and reflow by Expedition. No replacement icons, application screenshots, sample data or desktop source changes are introduced.

Navigation and Application Info become mutually exclusive overlay drawers on compact screens. Native app layouts retain their exported geometry inside a scrollable workspace. Phone title-bar controls and appearance/notification menus fit the contained product window; browser pinch zoom remains available. The gallery and surrounding website remain unchanged.

Implementation: responsive-hero.css, native-home.js, native-shell.js and the normal HTML build. Focused regression coverage verifies app ownership, order, artwork crops and preserved desktop coordinates across every exported home variant. Verified in the browser at 320px and 390px phone widths, 768px tablet portrait and 1024px tablet landscape. Checked both editions, all three appearances, theme dropdown, notifications, mutually exclusive compact drawers and opening a native app layout. No horizontal page overflow was found. Fixed the notification header at 320px so the close button remains visible. Desktop native geometry, fonts, colours, materials and radii match the pre-change production version for the ten measured shell/card/control selectors, both closed and with both panels expanded. Browser console had no warnings or errors. All 32 tests pass. Evidence: outputs/hero-responsive-20261018 in the parent workspace. Actual iOS Safari hardware was not available; browser viewport checks do not replace device testing.


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
