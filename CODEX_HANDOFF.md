# ARTIFACTS — engineering in motion

## Objective

Replace the screenshot exhibition with a continuous, original engineering narrative: friction → systematic execution → specialised tools → complete ecosystem. Use the real logo. Use ARTIFACTS as the identity and “by Gene” once, quietly. Core line: “Engineering is complex. Execution shouldn't be.” Synthetic conceptual visuals must not imply real measurements or simulated app results.

## Current branch

experience/engineering-in-motion, starting from e796f982 (previous 16-app review branch). Production main is unchanged. Create a separate PR for this direction.

## Source review completed

- Inspected current static HTML/CSS/ES modules, generator, 16-app canonical model, image folders, original vectors, Pages/CNAME and existing motion.
- Found and inspected all 23 slides of the reference presentation (including visual-only slides), extracted text and rendered contact sheets in ignored .qa/.
- The presentation is an older 15-app snapshot. Current repository's 16-app catalogue wins.
- Verified functions: event/timestamp parsing; wafer usage aggregation; topography; logical recipe alignment independent of order; chart access; metrology compilation; guided thermal diagnosis; temperature-based arrangement instructions; configuration comparison; SPC overview; maintenance schedules.
- No slide metrics, proprietary parameters, paths, actual process limits or identifying data will be used in public visuals.

## Architecture decisions

- Retain static Pages output, self-hosted font, exact brand vectors, canonical 16-app model and optional original captures.
- Rebuild the page, CSS, exhibition controller and primary renderer.
- One persistent procedural WebGL environment with shared geometry and continuous state morphs; semantic HTML overlays and native scrolling. No screenshot planes as primary content.
- Narrative chapters group work into Observe, Compare, Diagnose and Coordinate. These are editorial workflow lenses, not invented original app categories. Real Expedition categories remain in the app index.
- All 16 functions have individual procedural states, accessible through a spatial ecosystem and complete text index.
- Central design/camera/motion tokens. Capped/adaptive rendering, sleeping scheduler, static fallback and deliberate reduced-motion story.

## Completed scenes

All ten narrative states and the complete 16-app procedural explorer are implemented. The real logo opens the story. No screenshot requests in the primary experience. Geometry morphs continuously between material, friction, alignment, tools, topology, comparison, diagnosis, monitoring, ecosystem and final layers. App selection, contextual controls, indexed directory, keyboard support, fallback diagrams and reduced-motion layout are wired.

## Incomplete scenes

No missing scene. Browser, geometry and source-integrity testing completed.

## Files modified

content/apps.json, content/page.html, scripts/build.mjs, index.html, styles.css, script.js, js/apps.js, js/exhibition.js, js/motion.js; new js/tokens.js, js/geometry.js, js/world.js, assets/concepts/\*.svg.

## Dependencies added

None. Aim to keep the renderer dependency-free.

## Known issues / performance

No failing checks remain from the completed browser suite. Local Edge frame samples: hero median 16.7 ms / p95 16.9 ms; continuous scroll median 16.7 ms / p95 16.8 ms, zero sampled long tasks. Mobile idle acquisition is intentionally capped at 24 fps. Physical mobile, Safari and Firefox remain untested. Archived screenshot limitations do not affect this procedural runtime.

## Remaining tasks

Implementation and validation are complete. Review the dedicated branch/PR before deciding whether to merge. Physical mobile, Safari and Firefox checks remain optional follow-up validation. The local preview is available at http://127.0.0.1:8001/ while its server is running.

## Exact next action

Review experience/engineering-in-motion. Preserve production main until the user authorizes merging. README.md and VALIDATION.md describe the new experience and measured results.

## Iteration notes

Inspected all ten scenes and mobile views. Refined brightness, rounded material edges, Expedition connections, morph continuity, cached layout reads, mobile control density and orbit spacing. Corrected portrait tablet lens framing and responsive geometry cache keys. All 16 concepts are distinct. Context restoration now re-enables the derivative extension before compiling shaders. All eleven viewport sizes, six axe scans, 16 selections, reduced motion, no-WebGL/no-JS and paused/final sleeping passed. Evidence is in ignored .qa/validation-v4.json and .qa/performance-v4.json.
