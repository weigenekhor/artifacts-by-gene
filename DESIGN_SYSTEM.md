# Design system — contained ARTIFACTS

## Sequence and identity

Minimal navigation → introduction and contained product → connected thinking cycle → canonical application collection → centered authorship → quiet ending.

Website palette: surface `#101113`, frame `#0b0d0f`, primary `#efede8`, secondary `#a5a6a4`, champagne `#c5b79e`, border `#2a2d2f`, focus `#b3cfc5`. Product palettes are scoped separately in `tokens.css`.

Website type is local Geist with Segoe UI fallback. Product home text is rendered by Qt with Segoe UI; browser chrome uses Segoe UI. Hero 39–68px, thinking heading 32–48px, collection heading 36–54px, gallery headings 19px/26px, body 13–17px. Editorial width caps at 1280px; gutters are 24–100px, 22px on mobile.

Exact supporting text: “A coherent system of tools for analysis, diagnosis, automation, and engineering workflows.”

## Product geometry and fidelity

The product is another 10% narrower: 66.42% capped at 1166.4px; below 1100px, calc(81% - 51.84px); below 760px, calc(81% - 19.44px).

Every size preserves 1229:820. The complete window scales through ResizeObserver (container units without JS). Logical dimensions: 44px titlebar, full-height 60→240px sidebar, 40px navigation rows, 240px information drawer, 21px status bar. Panels push the application area by 180/240/420px and use source-rendered reflow without shrinking cards. Sidebar meets the bottom window border. No greeting; bottom-right status always says Pentimento. Mobile receives a 44px-high information selector.

Sixteen native home variants cover both themes/modes and all panel layouts at 2× density. Background, full scrollable content, hotspot bounds and hover images come from the same HomeWidget. Preserve actual card titles, Expedition headings, icons, wafer and source geometry. Theme/mode affects only the product.

Hover/focus shows the native 372×565 ModuleDetailsPanel: title, Expedition, description, version, release, native animated strip and preview. Portal preserves readable source size, scales uniformly for narrow widths, and clamps inside the viewport. Short landscape screens scroll the panel internally rather than reducing text size. Escape, close control and pointer dismissal are available; touch uses the same information. Hero cards never launch screenshot pages. The separate public gallery remains unchanged.

## Thinking cycle

Three original SVG diagrams share structural geometry and a return path. They describe the entire ARTIFACTS approach, not three selected applications.

Heading: “Less repetition. More room for engineering judgment.”

1. Start with the real problem. Every tool begins inside the work: a recurring task, an unclear comparison, or a process that asks too much of memory.
2. Keep the useful reasoning. Make repeatable checks explicit. Automate the repeated steps. Leave more room for the work that needs judgment.
3. Put clarity to work. Bring evidence, context, and the next action into view. Use the tool, question it, and refine it as the work changes.

Return: “Real use sets the next brief.” Diagrams are explanatory artwork, not fabricated output.

## Collection and closing

Public collection follows canonical manifest order, with no public Expedition/theme filters. Two columns for standard apps. TopoTracer, Met Compiler, AIX Temp Diagnoser, AIX ΔT Assistant, Metria SPC and Data Lens receive full rows. An odd standard item uses a compact full-row composition with text beside its screenshot, avoiding an empty orphan cell. All apps retain complete imagery, names, purposes and navigation. On mobile, one column with equal usable controls.

All screenshots remain uncropped and high resolution. Captions describe the view rather than the theme. Authorship contains only BUILT BY / Gene / Wei Gene Khor / Email / LinkedIn. Centered, approximately 246px high on desktop (40% shorter), with Gene 52px desktop/42px mobile and a 22px vertical rule. Footer: real symbol and ARTIFACTS, “Built around real engineering work.”

## Motion and accessibility

Native scrolling; no locking. Product shifts at most 36px into center and briefly settles through sticky staging; intro recedes by at most 28px. Mobile/reduced motion stay in normal flow. Navigation 220ms OutCubic; information/content 240ms; source reflow resolves in 175ms. Hover reveal 160ms, dismissal delay 150ms. Native animated strip is loaded only for visible info and removed on dismissal/hidden tab.

Cycle strokes draw sequentially over 850ms with 220ms stagger. Closing credit: label 300ms; Gene 560ms/20px; identity 430ms/4px; rule 450ms; contacts 400ms/11px. Credit drifts up at most 10px and softens as footer enters. Arrows move 3px diagonally in 180ms. Gallery dwell 3.6 seconds, crossfade 300ms; existing pause rules remain. No perpetual decoration/render loop.

The pointer is a small light arrow with dark edge and a restrained accent on actionable elements. Use native cursor URLs, no lagging overlay; text keeps its I-beam and system fallbacks remain available.

Below 760px galleries become one column; below 470px diagrams sit above captions. Preserve visible focus, labeled controls, Escape, swipe intent and vertical touch scroll. Reduced motion removes scroll translation, native animated strips and credits motion while retaining content/manual controls. No-JS shows the native homepage, gallery images/full-resolution links, cycle and closing.
