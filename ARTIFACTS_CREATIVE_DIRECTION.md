# ARTIFACTS WEBSITE — CREATIVE DIRECTION

## Latest approved direction and priorities

These instructions incorporate Gene's latest feedback and govern how the specification below is applied. They supersede older directions that restricted rich demonstrations to a few applications.

- Preserve the direction of the first three current demonstrations: Papyrus Reader, TopoTracer and GaN Temp Diagnoser. Gene likes these. Enrich their motion and develop the same level of purposeful treatment across the complete collection.
- Give **Metria SPC a substantive motion demonstration**, with a clear progression that explains its work. A static screenshot or a few drifting interface layers is not sufficient.
- Give **all 16 applications longer, richer, individually designed motion sequences**. Every application needs a meaningful beginning, development, result and readable inspection interval. Do not limit this treatment to featured apps while leaving the others as screenshots.
- Longer means more explanatory development and deliberate pacing, not slower playback of the same simple effect, repeated loops or excessive scroll distance. Preserve direct navigation and user control.
- Build each sequence around what that real application does. Use actual interface details as evidence alongside explanatory motion. Never invent features, measurements, results or software output.
- Present applications in **the sequence used inside ARTIFACTS**, listed below. This order applies to the main application journey, collection navigation and index. It supersedes the current featured-demo order.
- **Do not use “Expeditions” in the website's visitor-facing copy, labels or navigation.** Existing source metadata may remain for provenance; it does not dictate presentation labels.
- **Keep the changes between dark and light backgrounds.** The black-to-white/light transitions are an approved strength. Use them to shape rhythm, contrast and chapter transitions while preserving the restrained ARTIFACTS identity.
- ARTIFACTS remains the main character. Keep the real brand symbol in the top brand area; do not make the logo the starting object for every motion sequence. Keep creator attribution understated.

### Canonical application sequence

This order is verified against the repository's current application catalogue (`content/apps.json`, ascending `index`), which records the in-application sequence. Update it only when the actual application order changes or Gene explicitly directs otherwise.

1. Altus LotViewer
2. Altus ANKO Viewer
3. Altus WaferCount
4. TopoTracer
5. Papyrus Reader
6. SPC Pathfinder
7. GaN Met Compiler
8. GaN Temp Diagnoser
9. AIX ΔT Assistant
10. LT Zone Assistant
11. GaN XML Assistant
12. Magus SPC (GaN)
13. Magus SPC (Legacy)
14. ANKO Helper
15. LT Report Compiler
16. Metria SPC

### Iteration workflow and Codex usage

During visual exploration, prioritize showing the evolving design and motion. Keep work focused and avoid unnecessary tool calls, repeated broad audits, redundant screenshots or full test-suite runs after every visual adjustment. Gene has explicitly asked to conserve Codex usage.

Defer comprehensive checking until a version is finalized for validation. This changes the timing of the quality gate, not the final accessibility, responsiveness, performance or reliability requirements. Fix obvious defects encountered during implementation without turning every draft into a full validation cycle.

### Scope of this documentation task

Create this file, verify its contents, and stop. Do not implement the motion expansion, change the website, run browser checks or publish changes as part of this documentation-only request. Website implementation resumes only after Gene's next prompt.

## QUALITY REFERENCE

The quality benchmark is:

https://lusion.co/

Do not copy Lusion's branding, assets, layouts, text, individual scenes, proprietary code, or visual identity.

Instead match its level of:

* cinematic storytelling
* motion sophistication
* spatial continuity
* WebGL integration
* camera choreography
* transitions
* visual polish
* interaction quality
* art direction
* technical execution

The finished ARTIFACTS website must not feel like a normal landing page with animations attached.

It must feel like one continuous directed digital experience.

## CORE IDENTITY

ARTIFACTS is an internal semiconductor engineering software ecosystem consisting of 16 real engineering applications.

The website must communicate:

* precision
* engineering authority
* systems thinking
* semiconductor technology
* computational engineering
* interconnected tools
* purpose-built software
* technical maturity

It must not look like:

* SaaS template
* AI startup
* gaming website
* crypto website
* cyberpunk UI
* generic developer portfolio
* dashboard template
* agency landing page

## CENTRAL VISUAL LANGUAGE

The visual world must come from ARTIFACTS itself.

Use:

* actual application interfaces
* plots
* process data
* engineering diagrams
* wafers
* reactor concepts
* parameter fields
* coordinate systems
* grids
* computational layers
* semiconductor visual structures

Avoid meaningless decorative Three.js objects.

Do not use random:

* spheres
* cubes
* toruses
* particles
* glowing blobs
* abstract ribbons
* star fields

unless they have a clear conceptual role.

## REAL APPLICATION ASSETS

Real ARTIFACTS screenshots and visual snippets exist at:

C:\Users\Gene\Desktop\Artifacts Images

Inspect and use them wherever accessible.

They are not decorative screenshots.

They must become major parts of the visual storytelling.

Some interfaces should:

* exist as planes in 3D space
* move toward the camera
* become full-screen
* reveal engineering information
* break into visual layers
* transition into other applications or concepts

All 16 applications must eventually appear.

Do not represent all 16 as identical cards.

## STORY STRUCTURE

Think in cinematic chapters rather than rectangular webpage sections.

Conceptual progression:

01 — ENTRY
ARTIFACTS appears.

02 — ENTER THE SYSTEM
The camera moves into the system rather than simply scrolling past a hero.

03 — COMPLEXITY
Show the engineering complexity ARTIFACTS exists to solve.

04 — TOOLS EMERGE
Applications begin forming from that engineering environment.

05 — REAL ARTIFACTS
Actual application interfaces become dominant.

06 — CONNECTED SYSTEM
Applications are shown as parts of one engineering workflow.

07 — DEEP DIVES
Important applications receive immersive demonstrations.

08 — ECOSYSTEM
Reveal all 16 applications.

09 — RESOLUTION
The experience resolves back into the ARTIFACTS identity.

These must not feel like nine independent HTML sections.

Transitions are more important than section boundaries.

## SCROLL BEHAVIOUR

Scrolling should drive a master visual timeline.

Use scroll progress to control:

* camera position
* camera target
* camera rotation
* object positions
* interface depth
* scene lighting
* typography
* clipping
* masking
* scaling
* UI assembly/disassembly
* transitions

Avoid isolated reveal animations.

Animations should overlap and transition continuously.

Do not rely mainly on:

* fadeIn
* slideUp
* simple parallax
* basic rotate-on-scroll
* endless floating

## MOTION

Motion must have:

* weight
* inertia
* anticipation
* settling
* deliberate easing
* continuity

Some moments should be highly animated.

Other moments should deliberately become quiet so users can inspect a real ARTIFACTS interface.

Premium motion requires contrast and restraint.

## HERO

The hero must not resemble a normal website hero.

ARTIFACTS should exist inside a designed spatial environment.

The first interaction should establish:

* depth
* precision
* confidence
* technical sophistication

The central visual should be meaningful and derived from ARTIFACTS.

Pointer movement may create subtle:

* camera response
* layer separation
* perspective changes
* lighting changes

When scrolling begins, the camera should move INTO the visual system.

The hero should transform into the next scene instead of disappearing.

## TYPOGRAPHY

Typography must be restrained.

Avoid:

* excessive giant text
* huge paragraphs
* meaningless marketing copy
* fake futuristic technical wording

Avoid phrases such as:

* Engineering the future
* Built for tomorrow
* Unlocking innovation
* Where technology meets precision
* Redefining possibilities

Copy should be:

* short
* specific
* technical
* intelligent
* intriguing

## VISUAL DESIGN

Use:

* strong composition
* disciplined spacing
* controlled negative space
* excellent alignment
* few type styles
* restrained colour palette
* clear hierarchy

Avoid:

* excessive glassmorphism
* neon borders everywhere
* gradient abuse
* repeated rounded cards
* fake terminals
* decorative complexity

## TECHNOLOGY

Inspect the current repository before changing architecture.

Use the existing framework where sensible.

Potentially use:

* Three.js
* React Three Fiber
* GSAP
* ScrollTrigger
* custom shaders

only when they improve the result.

The ideal control architecture is:

normalized scroll progress
→ master experience timeline
→ camera state
→ WebGL scene state
→ DOM state
→ typography state

Avoid dozens of disconnected scroll handlers.

## 3D QUALITY

If WebGL is used, it must have production-level quality.

Focus on:

* strong art direction
* camera framing
* controlled lighting
* materials
* depth
* shadows
* antialiasing
* subtle post-processing where useful
* high-quality textures
* high-resolution assets

Three.js tutorial aesthetics are unacceptable.

## RESPONSIVENESS

Desktop is the flagship experience.

Mobile should have a deliberately simplified version of the same storytelling.

Do not simply squeeze the desktop experience into mobile.

Respect prefers-reduced-motion.

## PERFORMANCE

Use:

* lazy loading
* optimized textures
* compressed assets
* code splitting
* adaptive DPR
* efficient render loops
* sensible geometry complexity
* instancing where appropriate

Do not sacrifice usability for visual spectacle.

## QUALITY GATE

Before considering any major scene complete, compare its quality against the reference standard.

Check:

1. Does this feel custom-built for ARTIFACTS?
2. Is the visual concept meaningful?
3. Is the motion sophisticated rather than decorative?
4. Does scrolling control choreography?
5. Are transitions continuous?
6. Are real ARTIFACTS interfaces prominent?
7. Is the composition polished?
8. Does the scene avoid generic SaaS design?
9. Does the 3D actually communicate something?
10. Would this hold attention without relying on marketing copy?

If several answers are no, the work is not finished.

## IMPORTANT IMPLEMENTATION RULE

Never treat this document as optional inspiration.

ARTIFACTS_CREATIVE_DIRECTION.md is the governing design specification for every future website modification.

Before performing any major ARTIFACTS frontend task, read this file completely.

When another instruction conflicts with it, follow the newer explicit user instruction, otherwise follow this document.
