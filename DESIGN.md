# ARTIFACTS — Visual Design System

Version 1.6 · 28 September 2026 · Closer hero composition

## 1. Authority and scope

This is the **single authoritative visual design system** for ARTIFACTS. Read it completely before visual implementation. An explicit later user instruction takes precedence; otherwise apply this order:

1. This `DESIGN.md`.
2. The clean rebuild and subsequent cinematic refinement briefs.
3. Verified application content and source captures.
4. Legacy documentation, for historical context only.

Older creative direction, storyboards, CSS and animation code do not override this file. Their instructions to preserve a hero, origin renderer, TopoTracer film, gallery choreography or masked Gene sequence are superseded. Verified software facts must never be changed to suit a visual concept.

Structural reference: [VoltAgent's Apple design analysis](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/apple/DESIGN.md). Adopt its discipline of hierarchy, spacing, work-first presentation, restrained chrome and clear surface changes. The tokens, composition and identity below are specific to ARTIFACTS. Do not import Apple's branding, blue actions, proprietary fonts, retail layouts or component catalogue.

**Current scope: a real-screenshot exhibition with fluid chapter transitions.** Screenshots belong only in the homepage reveal and sixteen-application gallery. Origin and Gene contain no screenshots, software crops or archive imagery. Images are noninteractive: no image links, lightboxes, click-to-open behavior or hover cues suggesting an action. The gallery remains static. Hero framing, surface handoffs and the Origin composition may move. No application movies, Canvas, WebGL, procedural engineering illustrations or animated terrain. TopoTracer remains an equal gallery member. Motion never gates content. No JavaScript and reduced motion show the complete final composition. Native scrolling is mandatory; the legacy film architecture and scroll-jacking remain prohibited.

## 2. Identity and content

- Identity: **ARTIFACTS**. A suite of real semiconductor engineering software built from practical engineering problems.
- Primary hero heading: **ARTIFACTS**. Supporting copy, visually subordinate: **Built from the refusal to accept friction as inevitable.**
- Browser title: **Artifacts by Gene**.
- Canonical URL: `https://artifactsbygene.com/`.
- Character: precise, mature, calm, confident and engineered. The software is the primary visual subject.
- Real logo: `assets/brand/artifacts-symbol.svg`. Preserve its geometry. A single-colour ink or warm-white treatment is permitted for surface contrast; do not invent a replacement symbol or monogram.
- Original screenshots: `C:\Users\Gene\Desktop\Artifacts Images`. Confirm each current source against its application. Repository derivatives must remain traceable to that source.
- Application wording: use verified facts in `content/apps.json` and the real software. One concise value line per application; no invented capability, statistic or outcome.

This is a curated exhibition, not a store, résumé, documentation portal or SaaS landing page. Interface chrome should recede. Give real software enough space to carry the page.

## 3. Colour and surface tokens

Use these semantic tokens consistently. Do not introduce per-application shell colours. Screenshot colours remain unaltered.

| Token | Value | Role |
| --- | --- | --- |
| `surface.canvas` | `#F7F6F2` | Warm mineral white; hero and gallery page background |
| `surface.media` | `#ECECE7` | Light neutral; screenshot presentation stages |
| `surface.ink` | `#17191C` | Deep ink; origin and Gene chapter backgrounds |
| `surface.graphite` | `#25282C` | Dark utility surface, only where a control needs separation |
| `text.primary` | `#17191C` | Headings and body on light surfaces |
| `text.secondary` | `#565B61` | Supporting copy and metadata on light surfaces |
| `text.inverse` | `#F7F6F2` | Headings and body on dark surfaces |
| `text.inverse-secondary` | `#BFC3C9` | Supporting copy and metadata on dark surfaces |
| `accent.on-light` | `#8B4726` | Burnt copper; links and focus on light surfaces |
| `accent.on-dark` | `#D49A73` | Lighter copper; links and focus on dark surfaces |
| `line.on-light` | `#D6D8D6` | Optional nonessential light-surface hairline |
| `line.on-dark` | `#3C4248` | Optional nonessential dark-surface hairline |

Rules:

- Use the two copper values as surface-specific versions of **one accent**. Never interchange them between light and dark surfaces.
- Accent marks interaction; it does not fill large panels or colour every heading. The software supplies most colour variation.
- No decorative gradients, glow, coloured fog, backdrop blur or tinted screenshot overlays.
- Surface changes occur at chapter boundaries, not at every application. Use no additional colour theme or automatic OS dark-mode inversion in this pass.
- Hairlines are decorative separators, never the sole indicator of a control, focus or state. Use the appropriate text colour for a necessary control boundary.

Fixed page rhythm: **light hero → ink origin → light applications → ink Gene and end**. Keep the gallery uninterrupted by alternating themed rows.

## 4. Typography tokens

Use the existing licensed variable font `assets/fonts/Geist-Latin.woff2`, with its `assets/fonts/OFL.txt` retained. Family stack: `"Geist", system-ui, "Segoe UI", sans-serif`; load locally with `font-display: swap`. Do not download or require SF Pro. Use weights 400, 500 and 600 only, with font synthesis disabled. Define the family, weights, line heights, tracking and measures once as shared CSS tokens. Controls inherit the same family. Do not introduce section-specific font scales, rendering filters or synthetic bold.

Sizes below are CSS pixels at a 16px browser default; implement them in rem. Breakpoints are defined in section 5. Do not add unrelated type scales.

| Token | Large desktop | Laptop | Tablet | Mobile | Weight | Line height | Tracking |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `type.hero` (ARTIFACTS) | clamp(184px, 14vw, 208px) | clamp(144px, 14.6vw, 184px) | clamp(112px, 15vw, 144px) | clamp(56px, 16.2vw, 112px) | 500 | 1.08 | -0.055em |
| `type.section` | 64 | 56 | 48 | clamp(36px, 9.8vw, 42px) | 500 | 1.12 | -0.03em |
| `type.app` | 26 | 24 | 24 | 24 | 500 | 1.25 | -0.015em |
| `type.lead` | 24 | 22 | 20 | 20 | 400 | 1.55 | 0 |
| `type.body` | 20 | 20 | 18 | 18 | 400 | 1.55 | 0 |
| `type.ui` | 16 | 16 | 16 | 16 | 400 / 500 | 1.5 | 0 |
| `type.caption` | 14 | 14 | 14 | 14 | 400 | 1.5 | 0 |
| `type.brand` | 18 | 18 | 18 | 18 | 600 | 1.25 | 0 |

- ARTIFACTS occupies one natural line at default sizing, without masks or fitting transforms; allow reflow under enlarged user fonts. Its supporting sentence uses `type.body`, at most 34ch. Section headings: at most 24ch. Body maximum: 50ch. All measures shrink to available width.
- Hero, section and application titles are sentence case. ARTIFACTS retains uppercase. Avoid all-caps paragraphs and excessive tracking.
- All chapter headings, including the Gene opening, use `type.section` with identical weight, tracking and leading. The wordmark alone uses the display scale. Application names use the smaller shared title scale.
- Hero supporting copy, Origin prose, application descriptions and Gene prose use `type.body`. The Origin lead uses `type.lead`. Do not make Gene body text a separate size.
- Navigation, text links, chapter labels and the Gene closing strip use `type.ui`. Navigation and the Gene signature use weight 500; other utility text uses 400. The quiet attribution does not become a giant name treatment.
- Application numbers use `type.caption` at weight 500 with tabular numerals. Image captions use the same size at weight 400. Monospace is unnecessary; if genuine technical metadata later requires it, use `ui-monospace` for that metadata alone.
- Use `text-wrap: balance` on short headings as an enhancement, with natural wrapping as fallback. Body text stays left-aligned, never justified.
- No manual line breaks that force desktop compositions onto mobile. The approved hero statement breaks after “refusal”, with natural wrapping below 360px. The two approved Gene action sentences retain their paragraph break.
- Text is always live HTML, fully visible. No masks, clipping paths, fixed-height text boxes, line clamps, ellipses or transforms used to fit copy. A long app name wraps; it never shrinks to metadata size.

## 5. Spacing and responsive layout

Spacing scale, in CSS pixels: **4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128**. Use rem equivalents. The 4px unit handles optical adjustments; use the named layout values below for structure.

Content width: `min(1440px, 100% - 2 × page-gutter)`, centred. The 1440px maximum applies to the inner content, excluding exterior gutters. Backgrounds run edge to edge; text and media align to this shared inner container.

| Layout token | Large desktop ≥1440px | Laptop 1024–1439px | Tablet 768–1023px | Mobile <768px |
| --- | ---: | ---: | ---: | ---: |
| `page-gutter` | 64px | 48px | 32px | 20px |
| `section-pad` (each end) | 128px | 96px | 80px | 64px |
| `gallery-columns` | 2 | 2 | 1 | 1 |
| `gallery-column-gap` | 48px | 40px | — | — |
| `gallery-row-gap` | 96px | 80px | 64px | 64px |
| `section-title-to-content` | 64px | 48px | 40px | 32px |
| `media-inset` | 16px | 16px | 16px | 12px |
| `header-min-height` | 80px | 80px | 72px | 72px |

- At wide viewports, extra width becomes outer margin. Do not enlarge UI screenshots or type indefinitely.
- Below 360px, use a 16px gutter and a 52px ARTIFACTS hero; retain body and application sizes. Reflow rather than hiding overflow.
- Section padding is applied once per boundary side; do not add an extra arbitrary spacer between padded sections.
- Use `box-sizing: border-box` throughout; aspect ratios include stage padding. All grid children use `min-width: 0`. Headings, email addresses and controls wrap as necessary. Never use page-level `overflow-x: hidden` to conceal a layout defect.
- Keep at least 24px between body copy and adjacent media, and 32px between large headings and adjacent media. Gallery-specific spacings below govern its smaller labels.
- Text containers have automatic height. Grid title tracks may reserve two lines with a **minimum**, never a fixed or maximum height. They must grow at zoom or with longer copy.
- Use natural document flow; no viewport-locked chapters, scroll snapping or scroll-jacking. Landscape mobile follows its width breakpoint and remains height-independent.

## 6. Components

### Header and links

- One opaque, in-flow header on `surface.canvas`, aligned to the page container. No floating overlay or translucent toolbar.
- Real symbol at 28px beside ARTIFACTS, separated by 12px; at least 16px clear space from other controls.
- Desktop section links: Applications and Gene. At widths below 768px, retain Applications beside the brand; Gene remains reachable through normal page scrolling. No menu is needed for one remaining link.
- The logo links to the top. A keyboard skip link precedes navigation and becomes visible on focus.
- Prefer text links with an underline or clear navigation context. Hover strengthens the underline and uses the appropriate accent. No pill CTA, decorative badge, fabricated status indicator or custom cursor.
- Touch/control target minimum: 44 × 44 CSS pixels, with 8px between separate targets. Hit areas must not overlap.
- If a utility button is necessary, use 12px × 16px padding, a 4px radius and a 1px current-text-colour border. No shadow. Do not add buttons without an action.

### Application unit — required order and ownership

Use one semantic `article` per app in a row-major gallery. Each article contains, in this exact reading order:

1. Number and application name together in one header (`type.caption` at weight 500 + `h3` / `type.app`).
2. Real screenshot inside one media stage.
3. One short verified value line in `type.body` / secondary colour.

Number/name gap: 12px. Header/media gap: 16px. Media/value gap: 20px. Keep the value line to one short sentence, ideally 4–10 words; permit natural wrapping. Do not add a second paragraph, feature list or category badge.

In the two-column layout, headers in a row share a minimum two-line title space so screenshots align; single-column headers use their natural height. All content aligns to the same left edge within its article. Text never straddles neighbouring units. The article has **no enclosing border, background panel, radius or shadow**; only its screenshot stage uses `surface.media`.

### Screenshot stage

- Shared stage aspect ratio: **3:2** across breakpoints. Apply `media-inset` and preserve the image's source aspect ratio. Default to the complete capture with `object-fit: contain`.
- Screenshots fill the available inner width or height; do not add a second mat, inset window or artificial desktop/browser frame. Wide captures may have modest vertical breathing room rather than forced cropping.
- Keep all captures complete. Never use `cover` or cut essential labels, controls or results. The former Origin and Gene crops are removed.
- On mobile, preserve the complete image and allow normal browser zoom. Do not upscale beyond native resolution to pretend small UI text is HD.
- Screenshots are noninteractive figures, never links or buttons. Clicking an image does nothing. No zoom cursor, hover emphasis, image dialog, full-capture link or keyboard stop on an image.
- Use PNG or lossless/visually lossless WebP for UI. Preserve native colours and fine text. Never generate, redraw, blur, desaturate or apply colour grading to evidence.
- Supply intrinsic width/height, appropriate `sizes`/`srcset` derivatives no larger than the source, lazy loading below the fold and asynchronous decoding. Preload only a genuine above-fold image when needed. Do not stretch a low-resolution source and call it HD; report insufficient sources.
- Radius: 0 on the stage, at most 2px on the image. Optional image-only shadow: `0 6px 20px rgba(23,25,28,0.08)`. No shadow on the article, headings or controls.

## 7. Page architecture

### Hero — identity, then evidence

Light canvas. The h1 is **ARTIFACTS**, retaining its enormous scale, left alignment and position. The exact supporting sentence is **Built from the refusal to accept friction as inevitable.** It uses the shared body size and breaks after “refusal” except at the narrowest widths. The in-flow header retains the real logo and Applications/Gene navigation. There is no separate hero CTA, stranded Applications anchor or scroll instruction.

At desktop the heading starts 64px below the header; mobile 48px. Supporting copy follows by 4px, bringing it 20px closer to the unchanged wordmark. The heading region has a content-safe minimum height: 72svh on desktop, 74svh on tablet and 78svh on mobile, minus header height and 140px at every breakpoint. Bottom padding is 32px. The desktop homepage now enters approximately 140px higher, with roughly 40% of its frame visible at the initial 1440×900 viewport. This is viewport cropping, never cropping of the source image. Content may expand the region at zoom or on a short landscape screen; do not force it into a fixed viewport. Mobile retains the existing full-width image and safe gutters rather than enlarging beyond the viewport; its shorter capture can be fully visible in the opening frame.

The real homepage is a large composition anchor: the full inner container, capped at 1296px on desktop, approximately 20% larger than the previous framing. It retains its complete interface and native colours. It is not a link. As the interface approaches, the light surface withdraws completely across its height, revealing the same ink environment that continues into Origin. The image persists across this surface change. A quiet caption identifies the environment and sixteen applications. Preserve the page order: Hero → Origin → Applications → Gene → End. The hero introduces the software; it does not relocate or duplicate the gallery.

The initial identity is still and fully readable. After the first 24px of native scroll, the homepage grows from .86 to 1 scale, rises by up to 72px beyond natural scrolling, and resolves from 6° X perspective to a frontal view. Tablet uses .92 scale / 32px / 3°; mobile .96 / 16px / 1°. Smoothstep progress reaches the frontal endpoint when the original image top approaches 10% of the viewport height. The wordmark yields by at most 16px and 12% opacity; the supporting copy stays stable. No letters scatter, no blur, no masks, no added scroll spacer or pinning. No entry autoplay.

Desktop fine-pointer inspection adds at most 1° on either axis with a 220ms damping time constant. Bounds are measured from the untransformed figure. Scrolling neutralizes pointer response; pointer movement resumes only after 180ms without scroll. Touch/tablet/mobile receive no pointer response. The final settled, neutral image has **no transform at all** to preserve frontal raster sharpness. No loops remain running at rest. Reduced motion and no JavaScript show the full frontal capture without perspective, image travel or wordmark changes. There is no fake chrome, hardware, extra mat or decorative shadow.

### Origin — engineering friction, deliberately removed

One ink chapter in natural flow. The heading is **Engineering is difficult enough.** The lead is **The tools around it should not make it harder.** One short paragraph grounds the claim in repeated comparisons and reporting, followed by software as Gene's response. No abstract reasoning-retention slogan or manifesto.

Origin is entirely typographic. At ≥1024px, the premise and response use 7:5 columns with a 64px gap; below that they stack with 32px. A quiet “Why ARTIFACTS exists” caption precedes the heading. The response starts level with the heading on desktop. Keep the premise at most 17ch and the response at most 44ch. Separate the concrete friction from the response into short paragraphs. No application names, screenshots, crops, archive, illustrative diagram or fake evidence.

The premise settles first, then the response, along a shared viewport-based timeline. Travel is at most 40px on desktop/tablet and 16px on mobile, entirely inside the generous section spacing. No opacity gates, text masks, word-by-word reveals or disappearing copy. Both columns are always readable.

The ink surface carries into a convex lower edge that flattens as Applications enters. This is a background-only SVG silhouette, scaled vertically; it is not a diagram and never clips text or media. The transition occupies the next chapter's top padding, not an extra viewport. Its depth is 128px on large desktop, 80px on laptop/tablet and 64px on mobile. The Applications heading settles after the edge starts flattening. Gallery articles remain still. No pinning, blackout, orbit or hidden gallery.

### Applications — the majority of the page

Light canvas, one section heading and the continuous gallery defined above. No instructions about clicking captures. Each short value line describes a distinct practical role, grounded in the catalogue and source images. Retain complete screenshots, the existing stage scale, row rhythm and two-line desktop title minimum. Screenshots, titles and captions have no hover effect or action; no moving chart, image sequence or gallery parallax. No filtering, pagination, carousel, nested collection or hidden applications. Preserve this exact order:

| Number | Name |
| --- | --- |
| 01 | Altus LotViewer |
| 02 | Altus ANKO Viewer |
| 03 | Altus WaferCount |
| 04 | TopoTracer |
| 05 | Papyrus Reader |
| 06 | SPC Pathfinder |
| 07 | GaN Met Compiler |
| 08 | GaN Temp Diagnoser |
| 09 | AIX ΔT Assistant |
| 10 | LT Zone Assistant |
| 11 | GaN XML Assistant |
| 12 | Magus SPC (GaN) |
| 13 | Magus SPC (Legacy) |
| 14 | ANKO Helper |
| 15 | LT Report Compiler |
| 16 | Metria SPC |

If a source image cannot be confidently identified, report the missing asset; never substitute a different app or fabricated screen. Keep the app's place in the content model.

### Gene — a quiet editorial closing chapter

Flat ink surface. Use one primary editorial block, not a two-column composition or centred article. At desktop, begin 16% into the shared inner container, using its remaining 84% up to a maximum of 1040px. At tablet and mobile, use the full inner width with the existing gutters. Do not add a visual column, screenshot, archive, illustration, portrait, marker, hairline, logo or filler. The transition from Applications is a simple light-to-ink boundary; no curved edge, wipe or scroll-driven motion in Gene.

Preserve the following wording and punctuation exactly. Paragraph breaks are intentional; the paired action sentences retain their line break. Use the shared typography system from section 4: `type.section` for the opening, `type.body` for the prose, and `type.ui` for the closing strip. There is no separate Gene font scale.

Opening: maximum 18ch, balanced natural wrapping, with no forced desktop line breaks. Body: maximum 50ch and left aligned. The action pair uses regular weight 400 and warm white; the final paragraph also uses warm white. Do not bold the action sentences. Other body text uses inverse-secondary. Do not mask or clip any copy.

Desktop spacing: opening-to-body 48px, normal paragraph gaps 32px, gap before conclusion 40px. Tablet uses 40px, 24px and 32px. Mobile uses 32px, 24px and 32px. Gene top padding: 112px large desktop, 96px laptop, 80px tablet and 64px mobile. Height is content-driven; no artificial minimum viewport or empty column.

> I spent my entire life improving processes.
>
> ARTIFACTS began when I realised engineering itself was one of them.
>
> What repeated, I automated.  
> What stood in the way, I rebuilt.
>
> ARTIFACTS is the evidence that I never accepted the way things were as the way they had to stay.

Keep every word visible and still in natural flow. No masks, text animation, staged swaps, clipping, pinning, decorative boxes, additional biography or closing slogan. Gene is removed from the scroll-motion timeline. The completed static composition is the intended experience, including without JavaScript and with reduced motion.

### End

Continue the Gene ink surface into one integrated closing strip: Gene, [weigenekhor@gmail.com](mailto:weigenekhor@gmail.com), [LinkedIn](https://www.linkedin.com/in/weigenekhor/) and Back to top. Use the same editorial alignment as the copy. Desktop/tablet: one baseline where space permits, 32px horizontal gaps, Back to top pushed to the far right. Allow natural wrapping at enlarged font sizes. Mobile: stack in that order, 8px gaps, plus 8px before Back to top. All links have at least 44px hit height. Gene is a quiet attribution, not another heading.

Place the strip 56px after the conclusion on desktop, 48px on tablet and 40px on mobile. Bottom padding: 96px large desktop, 80px laptop/tablet and 64px mobile. No separate gap between Gene and the footer, additional catalogue, oversized wordmark or closing slogan. End in stillness.

## 8. Interaction tokens

| Token | Value | Use |
| --- | --- | --- |
| `motion.micro` | 180ms | Link colour, underline and control feedback |
| `motion.inspection` | 220ms time constant | Hero pointer response only |
| `motion.response` | 80ms time constant | Scroll response damping, no overshoot |
| `ease.chapter` | `cubic-bezier(0.16, 1, 0.3, 1)` | Confident acceleration, soft settling, no overshoot |
| `ease.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Consistent settling without bounce |

- The page renders fully visible immediately, including with JavaScript disabled. Do not add entry opacity gates or stagger sixteen cards.
- Screenshots have no hover, focus, click or playback interaction. Keep all sixteen app articles static.
- Only hero framing, Origin composition, the Applications heading and chapter surfaces use scroll motion. The hero alone permits the bounded pointer inspection specified above. Gene text never moves.
- Focus styling is immediate and independent of hover. Restrained colour feedback is enough for pressed states; no spring or large shrink.
- With `prefers-reduced-motion: reduce`, remove image transforms and transitions, use immediate state changes and native instant anchor scrolling. No information or composition may depend on motion.
- Use native scroll; section links use native CSS smooth scrolling, instant with reduced motion. chapter-motion.js has no dependencies. Passive scroll/pointer events share one frame scheduler; cached document positions avoid per-frame layout reads. Smoothstep progress and an 80ms damping response link edge movement to following content. The timeline depends on viewport position, never gallery height. Snap residual interpolation to exact endpoints before stopping so a tiny transform cannot remain. Rendering stops when settled, hidden or in reduced motion. Re-measure after viewport/font changes. No smooth-scroll library, observers that hide content, application-film runtime, scroll locking or pinned sections. Build fingerprints on CSS/JS URLs prevent mixed cached revisions; asset paths remain relative.

## 9. Accessibility and text safety

- Minimum contrast: 4.5:1 for normal text, 3:1 for large text and meaningful control graphics. Prefer 4.5:1 for all site text. Validate actual pairings, including hover and focus; never use opacity to make necessary text faint.
- Focus: 2px solid surface-appropriate accent, 4px offset, visible around the whole interactive target. Do not clip the outline at media boundaries. If placed over a screenshot, add a canvas-colour separation ring so the indicator remains distinct.
- Images are not focusable. Keyboard navigation visits only navigation and contact links; skipping into main shows focus around the hero heading rather than outlining the whole document.
- One `h1`, chapter `h2`s and application `h3`s. Use header, nav, main, section/article and footer landmarks. Keep visual order and DOM reading order identical.
- All interactive elements are native links/buttons with meaningful names, keyboard access and visible focus. Never use hover as the sole way to expose information.
- Images have concise factual alt text describing the application and relevant view, not decorative claims. Logo text must not be announced twice when symbol and wordmark share a link.
- Layout reflows at 200% zoom and at a 320 CSS-pixel viewport. Respect browser font sizing and text-spacing overrides. Allow longer headings and contacts to wrap without truncation.
- No overflow-clipping on text or focus ancestors. Surface SVGs contain only background geometry; they never contain or mask content.

## 10. Implementation and visual acceptance

- Before the rebuild, preserve existing work through a Git checkpoint/archive. Keep original screenshots, logo and verified content. Historical versions remain separate from the active frontend.
- Load only the static page, one stylesheet and the small chapter-motion.js enhancement. Do not restore old hero/origin renderers, film systems, collection positioning or masked Gene choreography. No new animation library or visual runtime dependency is needed.
- Use shared tokens and a single application data model. A screenshot and its title/value line must be authored together, not independently positioned.
- Keep GitHub Pages compatibility, relative asset paths, semantic HTML, title/meta/canonical and favicon support.
- Review rendered compositions at **1440px, 1280px, 834px and ~390px**: hero at rest and mid-transition, Origin, Origin/gallery boundary, first/middle gallery, Gene and end. Inspect intermediate progress, not just endpoints. Check the full static/no-JavaScript composition and reduced-motion behavior separately.
- Check that all sixteen real captures load in order; names own their images; the media is large; titles wrap; Gene wording is complete; no text overlaps or clips; keyboard/reduced-motion/no-JS use remains coherent.
- Assess the page with all animation disabled. If it feels incomplete, fix composition, scale, content or spacing. Do not add motion to conceal weak static design.

### Do

Use the real work, a compact type system, generous but purposeful space, shared alignment, clear application ownership and restrained light/dark rhythm. Keep navigation effortless and surfaces quiet.

### Do not

Copy Apple branding; restore rejected legacy scenes; invent software interfaces; add application movies; make TopoTracer an exception; use random gradients, particles, fake semiconductor imagery, 3D ornaments, neon, glass cards, decorative diagrams, oversized pills, deep shadows, ambiguous labels or clipped text.

The quality criterion is the rendered work, not the number of effects or passing layout assertions. This document defines the new system; it does not certify the existing website as compliant.
