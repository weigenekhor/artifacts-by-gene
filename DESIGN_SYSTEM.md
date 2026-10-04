# Design system — contained ARTIFACTS

## Sequence

Minimal navigation → introduction and contained interactive product → three principles → unique application collection → compact authorship → quiet ending.

Navigation is the real mark and ARTIFACTS, with Applications and About links. No public mode or theme control. Hero copy describes applications built around real problems, workflows and decisions. The product sits below it, with a separate Continue to explore cue.

## Website identity

Fixed near-black `#101113`, frame `#0b0d0f`, primary `#efede8`, secondary `#a5a6a4`, champagne `#c5b79e`, border `#2a2d2f`, focus `#b3cfc5`. Teal is restricted to explanatory linework/focus. These variables live in `site.css`; real product palettes live in `tokens.css` under `.app-shell[data-theme]`.

Website type uses the locally licensed Geist variable face, with Segoe UI fallback. Product type remains Segoe UI. Hero type is 39–68px, principle statement 32–48px, collection heading 36–54px, gallery headings 19px/26px, body 13–17px. Avoid a new billboard at the end.

The editorial container caps at 1280px. Product width is 82% capped at 1440px, aspect 8:5, height capped at 900px. Its controls do not scale with viewport pixels. At intermediate widths the product gets 32px side margins. At mobile it gets 12px side margins and a deliberately reflowed 640px interface. The surrounding page always remains visible as a webpage.

## Product fidelity

Source: desktop `widgets/home_page.py`, `Artifacts.py`, `widgets/artifacts_style.py`, `edition_theme.py`, navigation assets and individual widgets. Default-state references are in `Artifacts Images/Empty` (the brief's older `Empty Apps` path is obsolete).

Source metrics: 44px titlebar, 60px collapsed rail, 40px nav rows, 21px status bar, 12px card gaps, 27px category label + 10px gap and 16px category separation. Card dimensions and column fitting use the source's reserve-space calculation and 148px minimum normal width, with height in the source 132:168 proportion. Pentimento allows four columns; Legacy six, constrained by available product width. Mobile uses two compact cards. Both source themes retain their own palette.

The wafer uses the actual desktop contour/material and geometry. It drifts at the source's 1°/second, pausing offscreen, when an app is open, in a hidden tab or for reduced motion. No rendering loop is needed. Mouse dragging is optional; touch scrolling is preserved.

## Principles and collection

Three original SVG figures show a dedicated operation, compressed repeated handoffs, and evidence aligned for comparison. These are explanatory diagrams, never fake engineering results. One statement and three concise descriptions; no biography or origin film.

The collection follows canonical manifest order with no headings/filters for Expeditions. Base layout is two columns. `featured` gives a small selected subset a full row: currently Met Compiler, Metria SPC and Data Lens, whose multi-input or analytical workspaces warrant more space. Screenshots remain whole with contain; all capture variants belong to the same app. Do not style apps by filename.

Authorship contains Developed by, Gene (Wei Gene Khor), email and LinkedIn in one compact composition. End with small ARTIFACTS and the exact line: “Built around real engineering work.” No campaign follows it.

## Motion and access

Native scrolling; no locking. Product/page entries settle once in 640ms, original diagram paths resolve in 1100ms, app opening uses 220ms, internal theme changes 220ms, gallery images crossfade in 420ms. Gallery dwell is 6.5s; only the central visible image advances. Hover, focus, hidden tabs, modal, offscreen and reduced-motion pause it. No perpetual website decoration.

Below 760px, one-column galleries and adapted principle figures; below 470px, diagrams sit above their captions. Product breakpoints use its container width, not the outer viewport. Maintain labelled controls, keyboard focus, Escape/arrow viewer navigation, touch swipe intent and unobstructed vertical scrolling. Reduced motion removes entrances/autoplay without removing functionality. No-JS retains the collection, full-resolution links, principles and closing.
