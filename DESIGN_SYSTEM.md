# Design system — contained ARTIFACTS

## Sequence and identity

Minimal navigation → introduction and contained product → connected thinking cycle → canonical application collection → centered authorship → quiet ending.

Website palette: surface `#101113`, frame `#0b0d0f`, primary `#efede8`, secondary `#a5a6a4`, champagne `#c5b79e`, border `#2a2d2f`, focus `#b3cfc5`. Product palettes are scoped separately in `tokens.css`.

Website type is local Geist with Segoe UI fallback. Product home text is rendered by Qt with Segoe UI; browser chrome uses Segoe UI. Hero 39–68px, thinking heading 32–48px, collection heading 36–54px, gallery headings 19px/26px, body 13–17px. Editorial width caps at 1280px; gutters are 24–100px, 22px on mobile.

Exact supporting text: “A coherent system of tools for analysis, diagnosis, automation, and engineering workflows.”

## Product geometry and fidelity

The product is 10% narrower than the preceding version: 73.8% capped at 1296px; below 1100px, calc(90% - 57.6px); below 760px, calc(90% - 21.6px).

Every size preserves the same 1229:820 window aspect. The complete logical window scales through ResizeObserver. Inside it: 44px title bar, 60px rail, source-rendered 1161×750 home and 21px status bar. No height cap, responsive card rearrangement, stretching or screenshot crop. Smaller mobile screens receive a separate 44px-high app selector.

Four home images come from the actual desktop HomeWidget at 2× density, with 1× derivatives. Hotspot positions and hover images are exported from the same native render. Preserve the actual card titles, Expedition headings, icons, wafer and source geometry. Theme/mode controls affect only the product.

Selecting an app replaces the entire interior with its real supplied screenshot. A separate toolbar provides Home, capture count and previous/next controls. Screenshots use contain and may letterbox; never crop or add fake processing controls. Theme preference selects matching captures when available, with a fallback to the full set. User-facing captions never announce Origin or Pentimento.

## Thinking cycle

Three original SVG diagrams share structural geometry and a return path. They describe the entire ARTIFACTS approach, not three selected applications.

Heading: “Good tools begin with understanding. They improve through use.”

1. Understand the work. Start with the problem, its context, and what a useful result needs to be.
2. Build the better way. Turn that understanding into software that removes friction and keeps the reasoning clear.
3. Refine through use. Put it to work. Keep what proves useful, improve what gets in the way, and bring that learning to the next problem.

Return: “Use informs the next iteration.” Diagrams are explanatory artwork, not fabricated output.

## Collection and closing

Public collection follows canonical manifest order, with no public Expedition/theme filters. Two columns for standard apps. TopoTracer, Met Compiler, AIX Temp Diagnoser, AIX ΔT Assistant, Metria SPC and Data Lens receive full rows. An odd standard item uses a compact full-row composition with text beside its screenshot, avoiding an empty orphan cell. All apps retain complete imagery, names, purposes and navigation. On mobile, one column with equal usable controls.

All screenshots remain uncropped and high resolution. Captions describe the view rather than the theme. Authorship is a centered “The person behind ARTIFACTS” credit: Gene, Wei Gene Khor, Email and LinkedIn. Gene is 60px desktop/48px mobile. No biography, label wall or oversized billboard. Footer: real symbol and ARTIFACTS, “Built around real engineering work.”

## Motion and accessibility

Native scrolling; no locking. One-time page entries 640ms; diagram strokes 1100ms. Gallery dwell 3.6 seconds and decoded-image crossfade 300ms. Only the central visible gallery runs. Hover, focus, hidden tabs, modal, offscreen and reduced-motion pause it. No perpetual decoration/render loop.

The pointer is a small light arrow with dark edge and a restrained accent on actionable elements. Use native cursor URLs, no lagging overlay; text keeps its I-beam and system fallbacks remain available.

Below 760px, galleries become one column and figures adapt. Below 470px, diagrams sit above captions. Label controls, preserve visible focus, Escape/arrow image-viewer navigation, swipe intent and vertical touch scroll. Reduced motion stops entrances/autoplay while retaining manual controls. No-JS shows the actual homepage fallback, gallery images/full-resolution links, cycle and closing.
