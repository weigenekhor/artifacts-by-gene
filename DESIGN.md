# ARTIFACTS — Software exhibition
Version 3 · 30 September 2026

## Authority
This is the governing visual specification. The explicit 30 September rebuild brief supersedes the static two-column gallery system. Original screenshots and verified facts remain authoritative. Historical versions are recoverable in Git; do not restore old film simulations or static-gallery constraints.

## Content
17 applications, 35 real application captures, one real homepage, four canonical Expeditions.
Source: C:\Users\Gene\Desktop\Artifacts Images.
Identity: assets/brand/artifacts-symbol.svg. Font: local Geist, with its licence.
Browser title: Artifacts by Gene. Canonical URL: https://artifactsbygene.com/.
Keep the GaN names used by the supplied captures; preserve historic fragment IDs.
Never generate or redraw application interfaces. Never imply a screenshot transition is an actual interaction.

| Number | Name | Expedition |
| --- | --- | --- |
| 01 | Altus LotViewer | ALTUS |
| 02 | Altus ANKO Viewer | ALTUS |
| 03 | Altus WaferCount | ALTUS |
| 04 | TopoTracer | INTERSTICE |
| 05 | Papyrus Reader | INTERSTICE |
| 06 | SPC Pathfinder | INTERSTICE |
| 07 | Met Compiler | GaN EPI |
| 08 | GaN Temp Diagnoser | GaN EPI |
| 09 | AIX ΔT Assistant | GaN EPI |
| 10 | LT Zone Assistant | GaN EPI |
| 11 | GaN XML Assistant | GaN EPI |
| 12 | Magus SPC (GaN) | PLANETFALL |
| 13 | Magus SPC (Legacy) | PLANETFALL |
| 14 | ANKO Helper | PLANETFALL |
| 15 | LT Report Compiler | PLANETFALL |
| 16 | Metria SPC | PLANETFALL |
| 17 | Data Lens | PLANETFALL |

## Sequence and hierarchy
Hero → Interactive index → Why ARTIFACTS exists → Four application Expeditions → Gene → End.
Software is the visual material. The site directs the camera. No fabricated dashboards, hardware frames, particles, circuit backgrounds, invented metrics, decorative WebGL or simulated application actions.

### Hero
Monumental live ARTIFACTS typography. Exact statement: “Built from the work itself.”
The real homepage is the primary plane. LotViewer and Data Lens are subordinate planes, not equally sized cards.
On desktop native scroll brings the homepage toward a frontal view, opens the spatial arrangement, withdraws the identity, and shifts the surface into the warm index.
Pointer response is limited, inertial and event-driven. No idle orbit or continuous animation.

### Index
“17 applications · 4 Expeditions.” Canonical grouped list at left and real preview at right.
Pointer/focus previews the interface with its number, name, group and factual value line. Links jump to that tool.
A fixed, opaque header supplies context and a native-dialog index from anywhere in the journey. No custom cursor.

### Origin
Engineering is difficult enough. Some difficulty belongs to the work. Some doesn’t.
One problem became a tool. Then another. ARTIFACTS took shape.
Desktop: a shared sticky stage. First one real interface enters, then others; the environment resolves into the actual homepage. Compose clean silhouettes and preserve readable copy; no text clipping.
The final dark-to-mineral surface transition hands into ALTUS.
Small screens and reduced motion use an interleaved sequence of statements and complete images. No tall empty pinned mobile story.
The approved September brief explicitly permits real software in Origin.

### Applications
One camera renderer, driven by content/cinematography.json.
Each Expedition has one sticky stage on desktop. Its applications advance through native scroll; they share space briefly during handoffs.
Single-capture apps receive full view → meaningful detail → broader context. Multiple captures are sequenced from real imagery.
Metadata supplies entry direction, duration, image index, short factual caption, and normalized focus bounds.
Focus scale is bounded at 1.75. Full image proportions are native; no forced 3:2 letterboxes. Different report aspect ratios retain their native dimensions.
ALTUS: ordered lateral/rising entry, mineral surface, operational detail.
INTERSTICE: comparative focus and changing viewpoints, light paper surface.
GaN EPI: darker, tightly framed diagnostic and configuration evidence.
PLANETFALL: review → report → equipment comparison → Data Lens. Data Lens is the longer, larger final stage using all three captures.
Desktop shot controls permit direct inspection of a beat. All image buttons open the selected full-resolution source.
Mobile/tablet: natural vertical progression, uncropped interfaces, native horizontal capture sequences with swipe and next/previous controls. No forced page scrolling.
Reduced motion uses the same readable natural-flow alternative.

### Gene
Quiet, image-free and unanimated. Preserve exact copy:
“I spent my entire life improving processes.”
“ARTIFACTS began when I realised engineering itself was one of them.”
“What repeated, I automated.”
“What stood in the way, I rebuilt.”
“ARTIFACTS is the evidence that I never accepted the way things were as the way they had to stay.”
The action pair remains normal weight. Quiet “by Gene”, email, LinkedIn. No generic biography, title-card labels or invented personal history.

## Design system
- Ink #101416; deep diagnostic #090c0e; warm index #eeeae3.
- ALTUS #e6e7de; INTERSTICE #f5f3ed; PLANETFALL #171e20.
- Light text #f0ede7; supporting dark-surface text #b0b7b7; warm accent #d9a780.
- Local Geist 400/500/600, no font synthesis. Live text throughout.
- Max content width 1600px; fluid 4.45vw gutters bounded 24–80px. Tablet 32px; phone 20px; below 360px 16px.
- Monumental identity only at the opening. Chapter names are larger than app names; application descriptions stay quieter than imagery.
- 44px controls. Copper focus, preserved outlines. No full-page overflow suppression to disguise layout problems.
- Native scroll, no wheel interception. Easing cubic-bezier(.22,.68,.15,1), 72ms bounded damping.

## Engineering
- content/page.html, content/apps.json, content/expeditions.json, content/homepage.json produce complete static HTML.
- content/cinematography.json controls the camera; motion-math.js supplies tested normalized interpolation.
- experience.js owns native-scroll enhancement, responsive lifecycle, index and touch capture navigation.
- image-viewer.js owns on-demand original decoding, stale request protection, fit/zoom, native modal focus and restoration.
- No runtime framework or WebGL. Old chapter-motion.js and gallery.js are removed.
- Cache geometry on layout changes; no per-frame layout reads. Render only near active scenes. Stop RAF at rest, on hidden documents and for reduced motion.
- Use responsive sources for normal viewing, originals only on explicit inspection.
- Native image dimensions, loading priorities and provenance remain factual.
- Capture source names, hashes, dimensions and order are maintained in the existing manifest and importer.
- Never edit source PNGs. Never upscale derivatives or generate substitute interfaces.
- No JavaScript: all 17 articles, captures, copy and anchor links remain in natural flow; optional viewer buttons are disabled.
- Static relative paths, CNAME and .nojekyll preserve GitHub Pages compatibility.

## Review
Inspect first/middle/final hero, Origin construction/handoff, all app handoffs, full framing and detail framing, Data Lens, Gene, index and zoom.
Widths: 1920, 1440, 1280, 1024, 834, 768, 430, 390, 375, 320.
Check native touch, keyboard navigation, reduced motion, no JavaScript, source ownership and runtime errors.
Do not claim untested browser engines or a measured frame rate.

