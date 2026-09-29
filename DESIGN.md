# ARTIFACTS — Visual Design System

Version 2.2 · 29 September 2026 · A body of engineering software

## 1. Authority

This is the single authoritative visual specification. Read it completely before frontend work. A later explicit user instruction overrides this file. Verified software facts and original screenshots remain factual sources, never material to invent around. Older creative directions, storyboards, film systems and rejected compositions are historical only.

This system supersedes the editorial mosaic, featured app sizes, numbered friction list and new-tab screenshot links. Applications now have equal visual importance within four chapters. There are no application films, simulated interfaces, Canvas, WebGL, app-specific animations or decorative 3D. TopoTracer has no exception.

The real application screenshots are the work. The website supplies narrative, chapter hierarchy, restrained hover enlargement, an in-page viewer and surface continuity. Do not copy another studio's identity, assets or exact interactions.

## 2. Narrative architecture

Hero → Why it exists → Expedition I / ALTUS → Expedition II / INTERSTICE → Expedition III / GaN EPI → Expedition IV / PLANETFALL → Gene → End.

The hero introduces one real software environment. Origin establishes unnecessary engineering friction and the decision to build. Four chapters reveal different classes of work in the suite's actual order. Metria closes the software exhibition. Gene ends the page with personal context and no imagery.

Keep the four chapters distinct; use two equal gallery columns inside each on desktop. No masonry, featured sizes or offsets. Do not put screenshots into Origin or Gene. There are seventeen persistent images: one homepage and sixteen applications. The viewer creates one selected full-resolution image on demand.

## 3. Assets and content authority

- Identity: ARTIFACTS. Browser title: Artifacts by Gene.
- Canonical domain: https://artifactsbygene.com/.
- Symbol: assets/brand/artifacts-symbol.svg. Preserve the real geometry. Ink and warm-white single-colour uses are allowed.
- Font: assets/fonts/Geist-Latin.woff2, with OFL licence retained.
- Authoritative source folder: C:\Users\Gene\Desktop\Artifacts Images.
- Application facts and order: content/apps.json.
- Chapter names and order: content/expeditions.json.
- Homepage mapping: content/homepage.json.
- Import provenance: content/source-manifest.json.

Rescan the source folder before an imagery update. Match every image visually and by filename. Never assume repository derivatives are latest. Report ambiguous or missing identities; never substitute another app or generate an interface.

scripts/import-captures.mjs reads originals without modifying them. It writes lossless full-size WebP and smaller 768/1120/1536/2240px responsive derivatives, plus a 2880px homepage derivative, records dimensions, modification times, byte sizes, source SHA-256 and decoded-pixel SHA-256, and removes only obsolete generated width variants. Run the build afterward.

The 28 September refresh contains sixteen 5700 × 3800 application sources and one 11392 × 7600 homepage. These are the supplied file dimensions, not a claim about how they were captured. All originals remain untouched. Full-size lossless WebP preserves decoded pixels; normal browsing uses the smaller responsive set. Only opening a viewer requests the full original. Content hashes in image URLs invalidate stale browser caches. Met Compiler is the current name; its stable gan-met-compiler ID and original source filename are retained for compatibility.

## 4. Surface and type tokens

| Token | Value | Purpose |
| --- | --- | --- |
| canvas | #F7F6F2 | Warm mineral opening and ALTUS |
| paper | #FCFCFA | Near-white INTERSTICE |
| media | #ECECE7 | Deeper neutral PLANETFALL and image fallback |
| ink | #17191C | Origin, GaN opening, Gene and end |
| graphite | #25282C | Reserved dark utility surface |
| text | #17191C | Primary on light |
| muted | #565B61 | Secondary on light |
| white | #F7F6F2 | Primary on dark |
| soft | #BFC3C9 | Secondary on dark |
| accent | #8B4726 | Links and focus on light |
| accent-dark | #D49A73 | Links and focus on dark |
| line | #D6D8D6 | Light boundary |
| line-dark | #3C4248 | Dark boundary |

Screenshots retain native colours. No grading, desaturation, filters, glow, fog, gradients, fake chrome, hardware frames or glass panels. Surface changes belong to narrative chapters, not individual applications.

Use Geist, system-ui, Segoe UI, sans-serif with font synthesis disabled. Use 400, 500 and 600 only. Text is live HTML. No text masks, line clamps, fixed-height copy boxes or fitting transforms.

| Role | Desktop | Tablet | Mobile | Weight / leading |
| --- | --- | --- | --- | --- |
| ARTIFACTS identity | clamp(112px,11.6vw,184px) | clamp(80px,12vw,128px) | clamp(52px,13.8vw,104px) | 500 / 1 |
| Origin display | clamp(64px,6.7vw,112px) | clamp(48px,7.5vw,80px) | clamp(44px,10.6vw,76px) | 500 / 1.08 |
| Expedition name | clamp(48px,4.5vw,72px) | clamp(48px,4.5vw,72px) | 40px | 500 / 1.08 |
| Resolution / Gene opening | 64px; 56px laptop | 48px | clamp(36px,9.6vw,42px) | 500 / 1.12 |
| App name | 26px; 24px laptop | 24px | 24px | 500 / 1.25 |
| Body | 20px | 18px | 18px | 400 / 1.55 |
| Application value | 18px | 18px | 18px | 400 / 1.55 |
| Navigation / contact | 16px | 16px | 16px | 400–500 / 1.5 |
| Chapter label / app number | 14px | 14px | 14px | 400–500 / 1.5 |

Use rem equivalents. Hero tracking -.065em, chapter titles -.055em, general headings -.04em, app names -.02em. Chapter metadata may use .055em tracking; paragraphs must not. Hero narrative copy uses 28–40px desktop, 28px tablet and 24px mobile. Every app name uses the same app scale. Origin uses the large display scale for its first response; its resolution uses the quieter shared section scale so real software enters the same viewport sooner.

Headings wrap naturally and may balance. Keep body measure near 50ch. Do not make all meaningful copy huge. Below 360px the wordmark becomes 48px; preserve body readability.

## 5. Shared grid and responsiveness

Inner container: max 1440px, centred, excluding gutters. Gutters:
- ≥1440px: 64px.
- 1024–1439px: 48px.
- 768–1023px: 32px.
- <768px: 20px.
- <360px: 16px.

Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px.
Spacing follows narrative weight. Origin retains 128/96/80/64px breathing room at its opening; the resolution uses 64–96px above and 32px below (48/24px mobile). ALTUS begins just 32px later (24px mobile). Other software chapters use 96px above /80px below on large desktop, 80/64px laptop, 64/64px tablet and 56/56px mobile. Chapter headings hand to software after 40px, or 32px mobile. Do not stack repeated 128px spacers or add minimum viewport heights outside the optional short desktop hero.

Desktop applications use two equal columns with 48px gaps (40px laptop) and 64px between rows. The unpaired final app spans the grid, is centered and has width calc((100% - gap)/2), exactly matching a normal column. This rule applies to all four chapters, without special emphasis or enlargement. Below 1024px use one column in canonical order, with 64px between apps on tablet and 48px on mobile. All app headers have a shared minimum height; screenshots use an equal 3:2 outer stage with object-fit:contain. No essential UI is cropped, stretched or recoloured.

All grid children have min-width:0. Text and links wrap. Never conceal a layout defect with body overflow-x:hidden. Focus and text ancestors must not clip. Browser zoom and 320px width must remain coherent.

## 6. Header and hero

Opaque, in-flow header: real symbol + ARTIFACTS, with Story / Applications / Gene links. Header minimum height is 80px desktop, 72px below 1024px. Below 768px retain Applications beside the brand; other chapters remain in natural flow. No floating controls or overlapping fixed header.

Hero hierarchy:
1. ARTIFACTS.
2. Built from the work itself.
3. Software that moves engineering forward.

Use one latest homepage. No card pile, planes, particles, extra claims, metrics, decorative object or pointer-follow behavior.

On sufficiently tall desktop screens (≥1024px wide, ≥700px high), progressively enhance to a 165svh section with a 100svh sticky stage. Native scroll moves through:
- A large partial interface entering from the right beneath the identity.
- ARTIFACTS remains fully visible through 56% of the reveal. From 35%, a restrained .76–1 scale and up to 24px of upward retreat make room for the software. Supporting copy recedes first; it never takes the wordmark’s position.
- Identity recedes from 56–76%, only after software and identity have coexisted. The whole interface arrives by 78%.
- The same capture moving left and revealing its whole environment.
- From 64–100%, the warm surface continuously interpolates into Origin ink while the interface persists. Text colour also interpolates continuously, without a threshold switch; required copy has receded before surface and text luminance cross.

A single image is anchored to its top-left corner, translating and scaling from a cropped environment into a complete capture. Its layout width is measured only on resize; scroll changes transforms, not image width. No decorative perspective or independently moving layers.

The reveal uses responsive derivatives from the latest homepage, displayed at no more than 1425 CSS pixels. The final image is capped at 1024px and additionally constrained by viewport height. The image aperture alone may clip; text is outside it. The software is never split, recoloured, simulated or animated internally.

There is no scroll lock, snap, wheel interception or time-based autoplay. The hero lasts 165vh total, not hundreds of extra viewports. On tablet, mobile, short windows, reduced motion and no JavaScript, use the full frontal interface in an intentionally composed natural-flow opening. All three identity lines remain available.

## 7. Origin: one problem, then another

Entirely typographic. No screenshots, application names, diagrams, cards, lists, fake evidence or films. The old numbered friction treatment is removed.

Begin with the established premise on ink:
Engineering is difficult enough.
Some difficulty belongs to the work.
Some doesn’t.

The response develops through four beats:
1. One problem became a tool.
2. Then another.
3. There was no masterplan. Just work that kept revealing where it could be better.
4. Tool by tool, ARTIFACTS took shape.

These are narrative beats, never a visible numbered sequence. Preserve the words; adapt line breaks. One problem begins large and left-aligned; Then another shifts the composition right. The supporting thought sits quieter and farther right. Go directly from the supporting thought on ink to the resolution on warm mineral, then into ALTUS. There is no intervening conviction section. The resolution uses the shared section scale, not another monumental display. Its final line, the compact ALTUS introduction and the first real screenshots should coexist in a desktop viewport.

Use native flow, scale and lateral movement to change emphasis as the page advances. No text masks or invisible pre-reveal copy. No pinning of story text, artificial scroll distances, paragraphs replacing each other, or simultaneous competing statements. On mobile bring offsets to 8% and reduce lateral travel. The static and reduced-motion composition must read as a complete story.

## 8. Four application chapters

Every chapter opens with its precise marker, name and one factual 3–7-word descriptor. Descriptor: 16px regular, secondary colour, max44ch, 12px beneath the title. No paragraph or marketing line. Names use the quieter Expedition scale, not the hero/Origin display scale. Current verified descriptors:
- ALTUS: Lot history, equipment checks and usage.
- INTERSTICE: Wafer mapping, recipe comparison, chart access.
- GaN EPI: Metrology, diagnosis, reactor geometry and configuration.
- PLANETFALL: SPC, equipment scheduling and reporting.

Keep common typography and alignment while changing surface rhythm. Screenshot hierarchy stays equal.

| Number | Name | Chapter |
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

Chapter markers are 03 / EXPEDITION I through 06 / EXPEDITION IV. The current brief explicitly restores these real suite group names.

ALTUS uses warm mineral. INTERSTICE uses near-white. GaN EPI uses ink with warm-white headings and soft-grey captions; its image stages remain neutral. PLANETFALL uses deeper mineral. No app receives its own colour theme or special size.

Each semantic article contains number + name, screenshot, one verified value line. No paragraphs, category pills, enclosing cards, fake chrome, heavy borders or labels telling users to view an image. Ownership must be unmistakable. Use a 3:2 outer stage and contain the entire real screenshot. Intrinsic image dimensions and responsive source sizes remain factual.

On a fine pointer with hover capability, only the screenshot stage grows to 1.03 scale over 480ms using cubic-bezier(.16,1,.3,1), returning with the same easing. App number, title and value line stay untransformed and sharp. A very soft image-stage shadow supplies depth, without a card shell or elevated article. No layout dimensions change; neighbouring units stay still. No rotation, cursor tracking, app movies or synthetic touch hover. Do not clip the enlarged unit or its focus outline. Reduced motion removes transforms and transitions.

Screenshot hover uses the small 24px diagonal arrow in assets/cursors/open-image.svg, with its hotspot at the arrow tip and a native pointer fallback. Warm-white and ink strokes remain legible across the real interfaces. No magnifying-glass cursor, oversized cursor, trail or JavaScript cursor tracking. Disabled controls retain the default cursor.

Clicking an image opens the in-page native dialog; no new tab or navigation. Its accessible name identifies the application. Use a 92% ink overlay and a centered full-resolution image, contained within 92vw desktop /96vw mobile and up to 88dvh, reserving space for a reachable 44px-minimum Close control. Never exceed the raster’s native dimensions. No fake frame or large caption panel.

Opening takes 320ms and closing 180ms with the shared easing; backdrop opacity changes and image scale moves .985 to 1. Reduced motion is immediate with no scale. Close, Escape and the backdrop dismiss; clicking the image does not. Background is inert, focus stays inside, body scrolling is disabled, and closing restores the same scroll position and trigger focus. Load only the selected original, retaining its gallery image while decoding. Announce loading/failure accessibly. Without JavaScript the whole static gallery remains visible and its disabled viewer controls do not navigate or enter the tab order.

Canonical names, order, verified facts, source filenames and image provenance live in content/apps.json. Do not introduce per-app presentation roles or maximum widths. Keep Met Compiler’s stable ID to preserve old fragment links.

## 9. Motion and performance

Use native scroll and one small dependency-free chapter-motion.js enhancement.
- Response damping: 65ms time constant, no overshoot.
- Chapter easing: cubic-bezier(.16,1,.3,1).
- Microinteraction colour: 180ms.
- No mouse-follow effects.
- Origin: restrained .94–1 scale, up to 48px horizontal movement and 24px context travel. Mobile travel is 12–16px. Each beat settles before it becomes the primary reading area.
- Chapter heading travel: 24px desktop, 16px mobile.
- Screenshot stages may settle upward by 20px desktop /16px mobile as they enter, completing by 70% of viewport height. They never fade, crop essential UI or animate internally. The same settle applies across all sixteen apps; no per-app movies.
- Chapter surfaces change as real section boundaries pass through the viewport. Shorter chapter padding, the last centered work, the next heading and the next capture provide continuity without another pinned scene.
- Gene never participates in motion.

All content renders immediately. No reveal observer hides material before a threshold. Cache geometry; do not read layout per frame. RAF runs only in response to scroll/resize and while settling, then stops. Cancel when hidden or reduced motion is requested. Re-measure after font load and viewport changes. No heavy renderer, library or runtime dependency.

With reduced motion, show the complete static composition, disable transforms/transitions and use instant anchor scrolling. Without JavaScript, all images, copy, navigation and contact links remain readable and usable; the viewer is an optional enhancement.

Only imagery may be cropped by motion. Never mask headings, body, contacts or keyboard outlines. No blur transitions.

## 10. Gene and ending

Image-free ink chapter. One left-aligned editorial block begins 16% into the desktop container, using up to 1040px. Tablet/mobile use the full container. No empty decorative column.

Preserve this exact text and punctuation:

> I spent my entire life improving processes.
>
> ARTIFACTS began when I realised engineering itself was one of them.
>
> What repeated, I automated.  
> What stood in the way, I rebuilt.
>
> ARTIFACTS is the evidence that I never accepted the way things were as the way they had to stay.

Opening: shared section scale, max19ch. Body: shared 20px desktop /18px tablet-mobile, max50ch. The action pair remains regular weight400. Opening gap48px desktop /32px mobile; paragraphs32px desktop /24px mobile; conclusion40px desktop /32px mobile. Top padding112px desktop,80px tablet,64px mobile. No masks, motion, pinning, extra biography or closing slogan.

Continue the same ink surface into Gene / email / LinkedIn / Back to top. Closing row follows by48px desktop/tablet,32px mobile. Gene, email, LinkedIn and Back to top stay together with 32px horizontal gaps; never push Back to top to the far edge with auto margins. Desktop wraps naturally; mobile stacks with a quiet extra 8px before Back to top. Bottom padding is64px desktop,80px tablet and48px mobile. All contact links have44px minimum hit height. End in stillness.

## 11. Accessibility and deployment

- One h1; section h2s; Origin response and application h3s.
- Semantic main, sections, articles, figures, nav and footer.
- Keyboard skip link and native links. Minimum44px interactive hit areas.
- Visible2px copper focus,4px offset; light copper on ink.
- Factual image alternatives; symbol is decorative alongside its accessible brand name.
- Normal text contrast at least4.5:1, large text3:1. No washed-out required metadata.
- 200% zoom and320px layout reflow. Never clip text or use fixed copy heights.
- Local font with swap, intrinsic image dimensions, responsive sources, lazy loading below fold.
- Static HTML, CSS, JS and relative asset paths; GitHub Pages needs no server-side runtime.
- Preserve CNAME, .nojekyll, canonical URL, favicon, Open Graph and title.
- CSS/JS content fingerprints prevent mixed cached revisions.

## 12. Implementation and acceptance

Edit content/page.html, content/apps.json, content/expeditions.json, styles.css, chapter-motion.js and image-viewer.js. Run pnpm build to regenerate index.html. pnpm test verifies app/chapter order, approved copy, lossless source integrity and the motion lifecycle.

Review actual rendered captures at 1920, 1440, 1280, 834 and 390px. Include hero first/mid/final, Origin premise/response/resolution, every Expedition, final Metria, Gene and mobile compositions. Check equal stages, hover layout stability, all viewer close paths, image clicks, focus restoration, scroll preservation, mobile viewer fit, reduced/static fallback, keyboard and320px reflow. Do not approve composition from tests alone.

History remains recoverable in Git; the previous clean hero is commit3054923. The previous mosaic edition is preserved at b3b41b0. Do not restore rejected films, collection renderers, mosaic roles or competing direction documents. Do not delete original user screenshots.

Quality comes from scale, sequencing, readable ownership and continuity—not a count of effects. Evaluate the static page first.
