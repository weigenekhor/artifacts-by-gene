# ARTIFACTS — Visual Design System

Version 2.0 · 28 September 2026 · A body of engineering software

## 1. Authority

This is the single authoritative visual specification. Read it completely before frontend work. A later explicit user instruction overrides this file. Verified software facts and original screenshots remain factual sources, never material to invent around. Older creative directions, storyboards, film systems and rejected compositions are historical only.

This system supersedes the equal sixteen-item grid, fixed 3:2 media stages, noninteractive screenshot rule and earlier hero compositions. There are no application films, simulated interfaces, Canvas, WebGL, app-specific animations or decorative 3D. TopoTracer has no exception.

The real application screenshots are the work. The website supplies narrative, editorial hierarchy, image entrances and surface continuity. Do not copy another studio's identity, assets or exact interactions.

## 2. Narrative architecture

Hero → Why it exists → Expedition I / ALTUS → Expedition II / INTERSTICE → Expedition III / GaN EPI → Expedition IV / PLANETFALL → Gene → End.

The hero introduces one real software environment. Origin establishes unnecessary engineering friction and the decision to build. Four chapters reveal different classes of work in the suite's actual order. Metria closes the software exhibition. Gene ends the page with personal context and no imagery.

Do not return to a single equal-column catalogue or scatter applications into random masonry. Do not put screenshots into Origin or Gene. There are exactly seventeen images: one homepage and sixteen applications.

## 3. Assets and content authority

- Identity: ARTIFACTS. Browser title: Artifacts by Gene.
- Canonical domain: https://artifactsbygene.com/.
- Symbol: assets/brand/artifacts-symbol.svg. Preserve the real geometry. Ink and warm-white single-colour uses are allowed.
- Font: assets/fonts/Geist-Latin.woff2, with OFL licence retained.
- Authoritative source folder: C:\Users\Gene\Desktop\Artifacts Images.
- Application facts and order: content/apps.json.
- Chapter names, order and introductory sentences: content/expeditions.json.
- Homepage mapping: content/homepage.json.
- Import provenance: content/source-manifest.json.

Rescan the source folder before an imagery update. Match every image visually and by filename. Never assume repository derivatives are latest. Report ambiguous or missing identities; never substitute another app or generate an interface.

scripts/import-captures.mjs reads originals without modifying them. It writes lossless full-size WebP and smaller 768/1120px responsive derivatives, records dimensions, modification times, byte sizes, source SHA-256 and decoded-pixel SHA-256, and removes only obsolete generated width variants. Run the build afterward.

All seventeen current sources are 1425 × 950. This is their actual capture size, not 4K or Retina evidence. Never enlarge derivatives to claim otherwise. Full-resolution opening preserves all available source detail. Homepage and GaN Met Compiler were refreshed from the 28 September sources in this pass.

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
| Chapter / Origin display | clamp(64px,6.7vw,112px) | clamp(48px,7.5vw,80px) | clamp(44px,10.6vw,76px) | 500 / 1.08 |
| Resolution / Gene opening | 64px; 56px laptop | 48px | clamp(36px,9.6vw,42px) | 500 / 1.12 |
| App name | 26px; 24px laptop | 24px | 24px | 500 / 1.25 |
| Body | 20px | 18px | 18px | 400 / 1.55 |
| Application value | 18px | 18px | 18px | 400 / 1.55 |
| Navigation / contact | 16px | 16px | 16px | 400–500 / 1.5 |
| Chapter label / app number | 14px | 14px | 14px | 400–500 / 1.5 |

Use rem equivalents. Hero tracking -.065em, chapter titles -.055em, general headings -.04em, app names -.02em. Chapter metadata may use .055em tracking; paragraphs must not. Origin friction uses 24–36px. Hero narrative fact uses 28–40px desktop, 28px tablet, 24px mobile. Spatial-feature app names may use 32px desktop; Metria's final name uses 40px desktop / 28px mobile.

Headings wrap naturally and may balance. Keep body measure near 50ch, chapter thoughts 28–30ch. Do not make all meaningful copy huge. Below 360px the wordmark becomes 48px; preserve body readability.

## 5. Shared grid and responsiveness

Inner container: max 1440px, centred, excluding gutters. Gutters:
- ≥1440px: 64px.
- 1024–1439px: 48px.
- 768–1023px: 32px.
- <768px: 20px.
- <360px: 16px.

Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px.
Section spacing: 128px large desktop, 96px laptop, 80px tablet, 64px mobile. Do not stack arbitrary extra spacers. Content, rather than a minimum viewport height, controls all chapters except the optional short desktop hero.

Desktop applications use a twelve-column editorial grid with 48px gaps (40px laptop). Not every row uses all columns. Differences in width, offset and paired grouping are deliberate. Below 1024px, the application sequence is one column in canonical order; all desktop offsets disappear. Mobile gaps between apps are 48px, tablet 64px. Full interfaces fill available width. No horizontal film rail or tiny two-column remnants.

All grid children have min-width:0. Text and links wrap. Never conceal a layout defect with body overflow-x:hidden. Focus and text ancestors must not clip. Browser zoom and 320px width must remain coherent.

## 6. Header and hero

Opaque, in-flow header: real symbol + ARTIFACTS, with Story / Applications / Gene links. Header minimum height is 80px desktop, 72px below 1024px. Below 768px retain Applications beside the brand; other chapters remain in natural flow. No floating controls or overlapping fixed header.

Hero hierarchy:
1. ARTIFACTS.
2. Three years. Sixteen applications.
3. Software that moves engineering forward.

Use one latest homepage. No card pile, planes, particles, extra claims, metrics, decorative object or pointer-follow behavior.

On sufficiently tall desktop screens (≥1024px wide, ≥700px high), progressively enhance to a 165svh section with a 100svh sticky stage. Native scroll moves through:
- A large partial interface entering from the right beneath the identity.
- The identity yielding before the narrative fact moves upward.
- The same capture moving left and revealing its whole environment.
- The warm surrounding surface transitioning into Origin ink while the interface persists.

The reveal uses the original 1425px source at most. The final image is capped at 1024px and additionally constrained by viewport height. The image aperture alone may clip; text is outside it. The software is never split, recoloured, simulated or animated internally.

There is no scroll lock, snap, wheel interception or time-based autoplay. The hero lasts 165vh total, not hundreds of extra viewports. On tablet, mobile, short windows, reduced motion and no JavaScript, use the full frontal interface in an intentionally composed natural-flow opening. All three identity lines remain available.

## 7. Origin: three editorial beats

Entirely typographic. No app names, screenshots, diagrams, fake evidence, films or abstract reasoning-retention story.

Beat one:
Engineering is difficult enough.
Some difficulty belongs to the work.
Some doesn’t.

The first statement has substantial presence; the two qualifying sentences sit lower and offset on desktop, becoming naturally stacked on mobile.

Beat two makes the friction concrete:
- Reconstructing a lot’s history. Event by event.
- Finding the right SPC chart. Level by level.
- Rebuilding an engineering report. Again.
- Working out the next equipment check. From the last one.
- Comparing reactor configurations. Node by node.

Use a readable editorial list, restrained separators and a quiet side note. No cards or icons. The lines settle as they enter; no word-by-word animation or opacity gate.

Beat three:
I built what was missing.
Different problems demanded different tools.

Then resolve on the warm surface:
The work became a body of software.

The warm field continues directly into ALTUS. Do not repeat the Gene action pair here. Do not add a manifesto, second catalogue or long explanation.

## 8. Four application chapters

Every chapter opens with its precise marker, name and one verified short sentence. Keep common typography and alignment while changing screenshot hierarchy and surface rhythm.

| Number | Name | Chapter | Role |
| --- | --- | --- | --- |
| 01 | Altus LotViewer | ALTUS | Large centred anchor |
| 02 | Altus ANKO Viewer | ALTUS | Wider left support |
| 03 | Altus WaferCount | ALTUS | Smaller, lower right support |
| 04 | TopoTracer | INTERSTICE | Wide image with side label |
| 05 | Papyrus Reader | INTERSTICE | Large right-aligned comparison |
| 06 | SPC Pathfinder | INTERSTICE | Restrained left-aligned view |
| 07 | GaN Met Compiler | GaN EPI | Anchor crossing ink into warm surface |
| 08 | GaN Temp Diagnoser | GaN EPI | Wider diagnostic view |
| 09 | AIX ΔT Assistant | GaN EPI | Paired arrangement view |
| 10 | LT Zone Assistant | GaN EPI | Spatial mapping support |
| 11 | GaN XML Assistant | GaN EPI | Wider configuration support |
| 12 | Magus SPC (GaN) | PLANETFALL | Wide chart with side label |
| 13 | Magus SPC (Legacy) | PLANETFALL | Large right-aligned review |
| 14 | ANKO Helper | PLANETFALL | Wider scheduling support |
| 15 | LT Report Compiler | PLANETFALL | Smaller report support |
| 16 | Metria SPC | PLANETFALL | Large final software image |

Chapter markers are 03 / EXPEDITION I through 06 / EXPEDITION IV. The current brief explicitly restores these real suite group names.

ALTUS uses warm mineral. INTERSTICE uses near-white. GaN opens in ink, with the compiler capture crossing into the warm software field. PLANETFALL uses a deeper neutral and ends with Metria. Do not add unrelated accent themes.

Use one semantic article per app, in canonical DOM order:
number + name → real screenshot → one verified value line.
No enclosing card border, radius or shadow; no feature list or paragraph. A side-label composition may place the value beside its own image visually, without separating ownership.

Screenshot dimensions come from capture metadata, never a universal stage ratio. Every current app uses its complete capture: width:100%, height:auto. No crop is currently warranted. A future crop requires explicit factual justification and a full-resolution link. Do not cut essential labels or controls.

All sixteen images link directly to their lossless full-resolution capture in a new tab with an accessible name and visible keyboard focus. There is no modal, app movie or hover animation. An understated outward arrow indicates access. Do not add catalogue instruction paragraphs.

App presentation role and maximum design width live in content/apps.json. The build derives responsive sizes from this data. Do not hand-author competing app order, image identity or microcopy in generated HTML.

## 9. Motion and performance

Use native scroll and one small dependency-free chapter-motion.js enhancement.
- Response damping: 65ms time constant, no overshoot.
- Chapter easing: cubic-bezier(.16,1,.3,1).
- Microinteraction colour: 180ms.
- No mouse-follow effects.
- Origin/chapter heading travel: 24–32px desktop, 12–16px mobile.
- Only the first screenshot in each chapter receives a gentle 32px entrance and .98→1 scale.
- Supporting screenshots are still. Do not stagger sixteen apps.
- Gene never participates in motion.

All content renders immediately. No reveal observer hides material before a threshold. Cache geometry; do not read layout per frame. RAF runs only in response to scroll/resize and while settling, then stops. Cancel when hidden or reduced motion is requested. Re-measure after font load and viewport changes. No heavy renderer, library or runtime dependency.

With reduced motion, show the complete static composition, disable transforms/transitions and use instant anchor scrolling. Without JavaScript, all images, content and links remain usable.

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

Continue the same ink surface into Gene / email / LinkedIn / Back to top. Closing row follows by56px desktop,48px tablet,40px mobile. Desktop wraps naturally; mobile stacks. All contact links have44px minimum hit height. End in stillness.

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

Edit content/page.html, content/apps.json, content/expeditions.json, styles.css and chapter-motion.js. Run pnpm build to regenerate index.html. pnpm test verifies app/chapter order, approved copy, lossless source integrity and the motion lifecycle.

Review actual rendered captures at1920,1440,1280,834 and390px. Include hero first/mid/final, Origin premise/friction/resolution, every Expedition, final Metria, Gene and mobile compositions. Check reduced/static fallback, keyboard and320px reflow. Do not approve composition from tests alone.

History remains recoverable in Git; the previous clean hero is commit3054923. Do not restore rejected films, collection renderers, obsolete grid styles or competing direction documents. Do not delete original user screenshots.

Quality comes from scale, sequencing, readable ownership and continuity—not a count of effects. Evaluate the static page first.
