# Design system — contained ARTIFACTS

## Sequence and identity

Minimal navigation → introduction and contained product → connected thinking cycle → canonical application collection → centered authorship → quiet ending.

Website palette: surface `#101113`, frame `#0b0d0f`, primary `#efede8`, secondary `#a5a6a4`, champagne `#c5b79e`, border `#2a2d2f`, focus `#b3cfc5`. Product palettes are scoped separately in `tokens.css`.

Website type is local Geist with Segoe UI fallback. Product home text is rendered by Qt with Segoe UI; browser chrome uses Segoe UI. Hero 39–68px, thinking heading 32–48px, collection heading 36–54px, gallery headings 19px/26px, body 13–17px. Editorial width caps at 1280px; gutters are 24–100px, 22px on mobile.

Exact supporting text: “A coherent system of tools for analysis, diagnosis, automation, and engineering workflows.”

## Product geometry and fidelity

The paired scene uses page gutters and a 1400px cap. Each native state occupies 67% of its width, with an 8cqw vertical offset. Continuous focus varies scale from .94 to 1, rotation by at most 1.1 degrees and translation by at most 20px. Below 760px windows occupy 86%; below 470px they occupy 92% with a larger vertical stagger so both remain visible.

Every size preserves 1229:820. The complete window scales through ResizeObserver (container units without JS). Logical dimensions: 44px titlebar, full-height 60→240px sidebar, 40px navigation rows, 240px information drawer, 21px status bar. Panels push the application area by 180/240/420px and use source-rendered reflow without shrinking cards. Sidebar meets the bottom window border. No greeting; bottom-right status always says Pentimento. Mobile receives a 44px-high information selector.

Sixteen native home variants cover both themes/modes and all panel layouts at 2× density. Background, full scrollable content, hotspot bounds and hover images come from the same HomeWidget. Preserve actual card titles, Expedition headings, icons, wafer and source geometry. The native wafer texture rotates once per 360 seconds beneath fixed native illumination. One active Legacy/Origin or Pentimento/Pentimento edition selects corresponding gallery captures. The surrounding website palette remains unchanged.

Hover/focus shows the native 372×565 ModuleDetailsPanel: title, Expedition, description, version, release, native animated strip and preview. Portal preserves readable source size, scales uniformly for narrow widths, and clamps inside the viewport. Short landscape screens scroll the panel internally rather than reducing text size. Escape, close control and pointer dismissal are available; touch uses the same information. Hero cards never launch screenshot pages. The separate public gallery retains its composition and original captures; edition selection chooses matching appearances.

## Thinking cycle

Three original SVG diagrams share structural geometry and a return path. They describe the entire ARTIFACTS approach, not three selected applications.

Framing: “Purpose-built from the work.” “ARTIFACTS does not begin with features. It begins with something in the work that should be better.” “Less repetition. More room for engineering judgment.” “Different problems, brought into one disciplined way of working.”

1. Start with the friction. Every tool begins with something in the work that should be better: a repeated task, a difficult comparison, a hidden dependency, or a decision carrying too much manual effort. Turn recurring reasoning into a system.
2. Make the repeatable explicit. Capture the checks that matter. Automate what does not need human attention. Preserve the context needed for the decisions that do. The work reveals what needs to improve next.
3. Refine through the work. Put the evidence, context, and next action where they can be understood together. Use the tool. Challenge it. Improve it as the process, data, and requirements change.

Do not restore numbered consulting-step labels or the rejected return caption. Diagrams are explanatory artwork, not fabricated application output.

## Collection and closing

Public collection follows canonical manifest order, with no public Expedition/theme filters. Two columns for standard apps. TopoTracer, Met Compiler, AIX Temp Diagnoser, AIX ΔT Assistant, Metria SPC and Data Lens receive full rows. An odd standard item uses a compact full-row composition with text beside its screenshot, avoiding an empty orphan cell. All apps retain complete imagery, names, purposes and navigation. On mobile, one column with equal usable controls.

All screenshots remain uncropped and high resolution. Captions describe the view rather than the theme. Authorship contains only BUILT BY / Gene / Wei Gene Khor / Email / LinkedIn. Centered, approximately 246px high on desktop (40% shorter), with Gene 52px desktop/42px mobile and a 22px vertical rule. Footer: real symbol and ARTIFACTS, “Built around real engineering work.”

## Motion and accessibility

Native scrolling; no locking. Product shifts at most 36px into center and briefly settles through sticky staging; intro recedes by at most 28px. Mobile/reduced motion stay in normal flow. Navigation 220ms OutCubic; information/content 240ms; source reflow resolves in 175ms. Hover reveal 160ms, dismissal delay 150ms. Native animated strip is loaded only for visible info and removed on dismissal/hidden tab.

A shared 18-second cycle aligns evidence, resolves checks, propagates a signal and revises a relationship. Continuous cursor proximity adds local path emphasis and at most 3px displacement; it never moves text. Closing credit: label 300ms; Gene 560ms/20px; identity 430ms/4px; rule 450ms; contacts 400ms/11px. Credit drifts up at most 10px and softens as footer enters. Arrows move 3px diagonally in 180ms. Gallery dwell 3.6 seconds, crossfade 300ms; existing pause rules remain. CSS handles meaningful idle motion; wafer and reasoning animations pause offscreen, in hidden tabs and under reduced motion. Damped pointer rAF stops after settling; geometry is not measured in its render pass.

The pointer is a small light arrow with dark edge and a restrained accent on actionable elements. Use native cursor URLs, no lagging overlay; text keeps its I-beam and system fallbacks remain available.

Below 760px galleries become one column; below 470px diagrams sit above captions. Preserve visible focus, labeled controls, Escape, swipe intent and vertical touch scroll. Reduced motion removes scroll translation, native animated strips and credits motion while retaining content/manual controls. No-JS shows the native homepage, gallery images/full-resolution links, cycle and closing.
