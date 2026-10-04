# Design system — contained ARTIFACTS

## Sequence and identity

Minimal navigation → introduction and contained product → connected thinking cycle → canonical application collection → centered authorship → quiet ending.

Website palette: surface `#101113`, frame `#0b0d0f`, primary `#efede8`, secondary `#a5a6a4`, champagne `#c5b79e`, border `#2a2d2f`, focus `#b3cfc5`. Product palettes are scoped separately in `tokens.css`.

Website type is local Geist with Segoe UI fallback. Product home text is rendered by Qt with Segoe UI; browser chrome uses Segoe UI. Hero 39–68px, thinking heading 32–48px, collection heading 36–54px, gallery headings 19px/26px, body 13–17px. Editorial width caps at 1280px; gutters are 24–100px, 22px on mobile.

Exact supporting text: “A coherent system of tools for analysis, diagnosis, automation, and engineering workflows.”

## Product geometry and fidelity

The hero uses one native product window with Pentimento mode and theme as the default. Legacy/Pentimento mode and Origin/Pentimento theme are independent controls; no second competing window is rendered. The product remains contained within page gutters, with a tiny pointer response, a slowly rotating wafer, and a drag gesture over the open field. The integrated controls support keyboard, pointer and touch.

Below 1100px, windows become staggered full compositions at 86% width; below 760px, 96%. Pointer-driven depth gives way to explicit selection and readable native information. No desktop overlap is squeezed into a mobile screen.

Every size preserves 1229:820. The complete window scales through ResizeObserver (container units without JS). Logical dimensions: 44px titlebar, full-height 60→240px sidebar, 40px navigation rows, 240px information drawer, 21px status bar. Panels push the application area by 180/240/420px and use source-rendered reflow without shrinking cards. Sidebar meets the bottom window border. No greeting; bottom-right status always says Pentimento. The top state label is a quiet mode label; touch uses the same bounded native details panel without a separate selector.

Sixteen native home variants cover both themes/modes and all panel layouts at 2× density. Background, full scrollable content, hotspot bounds and hover images come from the same HomeWidget. Preserve actual card titles, Expedition headings, icons, wafer and source geometry. The native wafer texture rotates once per 120 seconds beneath fixed native illumination. The selected visual theme selects corresponding gallery captures. The surrounding website palette remains unchanged.

Hover/focus shows the native 372×565 ModuleDetailsPanel: title, Expedition, description, version, release, native animated strip and preview. Portal preserves readable source size, scales uniformly for narrow widths, and clamps inside the viewport. Short landscape screens scroll the panel internally rather than reducing text size. Escape, close control and pointer dismissal are available; touch uses the same information. Hero cards never launch screenshot pages. The separate public gallery retains its composition and original captures; edition selection chooses matching appearances.

## Thinking cycle

Three original SVG diagrams share one measured signal path with black instrument surfaces, restrained graphite strokes and one coordinated transfer. They describe the entire ARTIFACTS approach, not three selected applications.

Framing: “Purpose-built from the work.” “ARTIFACTS does not begin with features. It begins with something in the work that should be better.” “Less repetition. More room for engineering judgment.” “Different problems, brought into one disciplined way of working.”

1. Start with the friction. Every tool begins with something that should work better: a repeated task, a difficult comparison, a hidden dependency, or a decision carrying too much manual effort. Turn recurring reasoning into a system.
2. Make the repeatable explicit. Capture the checks that matter. Automate what does not need human attention. Preserve the context needed for the decisions that do. The work reveals what needs to improve next.
3. Refine through the work. Put the evidence, context, and next action where they can be understood together. Use the tool. Challenge it. Improve it as the process, data, and requirements change.

Use small identifiers: 01 / FRICTION, 02 / STRUCTURE, 03 / REFINEMENT. Do not enlarge them into decorative process numbers or restore the rejected return caption. “Less repetition” is subordinate to “More room for engineering judgment.” The sentence introducing the relationship sits immediately above the visual system. Diagrams are explanatory artwork, not fabricated application output.

## Collection and closing

Public collection follows canonical manifest order, with no public Expedition/theme filters. Two columns for standard apps. TopoTracer, Met Compiler, AIX Temp Diagnoser, AIX ΔT Assistant, Metria SPC and Data Lens receive full rows. An odd standard item uses a compact full-row composition with text beside its screenshot, avoiding an empty orphan cell. All apps retain complete imagery, names, purposes and navigation. On mobile, one column with equal usable controls.

All screenshots remain uncropped and high resolution. Captions describe the view rather than the theme. Authorship is a cinematic closing credit: BUILT BY GENE, the two-line statement, Gene | artifactsbygene.com, Email and LinkedIn, with a masked ghosted ARTIFACTS interface behind it. Footer: real symbol and ARTIFACTS, “Built against inefficiency.”

## Motion and accessibility

Native scrolling; no locking. Product shifts at most 18px into center and briefly settles through sticky staging; intro recedes by at most 22px. Its lower structural line continues along the margin into the thinking spine as product contrast softens. Entry resolves environment, native states, detail and labels over 1.37 seconds using separate transform owners. Mobile/reduced motion stay in normal flow. Navigation 220ms OutCubic; information/content 240ms; source reflow resolves in 175ms. Hover reveal 160ms, dismissal delay 150ms. Native animated strip is loaded only for visible info and removed on dismissal/hidden tab.

A shared 11.3-second cycle aligns evidence, consolidates repeated paths, resolves checks, carries one packet through all three stages, and revises a relationship before resting. Continuous cursor proximity adds local path emphasis and at most 2px displacement; it never moves text. Closing credit: label 300ms; Gene 560ms/20px; identity 430ms/4px; rule 450ms; contacts 400ms/11px. Credit drifts up at most 10px and softens as footer enters. Arrows move 3px diagonally in 180ms. Gallery dwell 3.6 seconds, crossfade 300ms; existing pause rules remain. The shared JavaScript score handles meaningful idle motion; wafer and reasoning animations pause offscreen, in hidden tabs and under reduced motion. Damped pointer rAF stops after settling; geometry is not measured in its render pass.

The pointer is a small light arrow with dark edge and a restrained accent on actionable elements. Use native cursor URLs, no lagging overlay; text keeps its I-beam and system fallbacks remain available.

Below 760px galleries become one column; below 470px diagrams sit above captions. Preserve visible focus, labeled controls, Escape, swipe intent and vertical touch scroll. Reduced motion removes scroll translation, native animated strips and credits motion while retaining content/manual controls. No-JS shows the native homepage, gallery images/full-resolution links, image-body next-view navigation, explicit expansion, cycle and closing.
