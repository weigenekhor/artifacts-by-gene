# ARTIFACTS — Visual Design System

Version 1.0 · 28 September 2026 · Static exhibition rebuild

## 1. Authority and scope

This is the **single authoritative visual design system** for ARTIFACTS. Read it completely before visual implementation. An explicit later user instruction takes precedence; otherwise apply this order:

1. This `DESIGN.md`.
2. The clean rebuild brief.
3. Verified application content and source captures.
4. Legacy documentation, for historical context only.

Older creative direction, storyboards, CSS and animation code do not override this file. Their instructions to preserve a hero, origin renderer, TopoTracer film, gallery choreography or masked Gene sequence are superseded. Verified software facts must never be changed to suit a visual concept.

Structural reference: [VoltAgent's Apple design analysis](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/apple/DESIGN.md). Adopt its discipline of hierarchy, spacing, work-first presentation, restrained chrome and clear surface changes. The tokens, composition and identity below are specific to ARTIFACTS. Do not import Apple's branding, blue actions, proprietary fonts, retail layouts or component catalogue.

**Current scope: an excellent static website.** No application movies, hover films, Canvas, WebGL, procedural engineering illustrations or animated terrain. TopoTracer is an equal member of the screenshot gallery. Motion cannot be required to understand or navigate the site. A future film pass requires a new explicit brief.

## 2. Identity and content

- Identity: **ARTIFACTS**. A suite of real semiconductor engineering software built from practical engineering problems.
- Required hero statement: **Software that moves engineering forward.**
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

Use the existing licensed variable font `assets/fonts/Geist-Latin.woff2`, with its `assets/fonts/OFL.txt` retained. Family stack: `"Geist", system-ui, "Segoe UI", sans-serif`; load locally with `font-display: swap`. Do not download or require SF Pro. Use weights 400, 500 and 600 only.

Sizes below are CSS pixels at a 16px browser default; implement them in rem. Breakpoints are defined in section 5. Do not add unrelated type scales.

| Token | Large desktop | Laptop | Tablet | Mobile | Weight | Line height | Tracking |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `type.hero` | 88 | 80 | 64 | 44 | 500 | 1.08 | -0.035em |
| `type.section` | 56 | 48 | 40 | 32 | 500 | 1.15 | -0.025em |
| `type.app` | 26 | 24 | 24 | 24 | 500 | 1.25 | -0.015em |
| `type.lead` | 24 | 22 | 22 | 20 | 400 | 1.5 | -0.01em |
| `type.body` | 18 | 18 | 18 | 17 | 400 | 1.6 | 0 |
| `type.caption` | 14 | 14 | 14 | 14 | 400 | 1.5 | 0 |
| `type.meta` | 13 | 13 | 13 | 13 | 500 | 1.5 | 0.025em |
| `type.brand` | 18 | 18 | 18 | 18 | 600 | 1.25 | 0 |

- Hero measure: at most 17ch. Section headings: at most 24ch. Choose a body maximum between 48–64ch; Gene text: at most 54ch. All measures shrink to the available width on smaller screens.
- Hero, section and application titles are sentence case. ARTIFACTS retains uppercase. Avoid all-caps paragraphs and excessive tracking.
- Navigation uses `type.caption` at weight 500. The quiet Gene attribution uses `type.body`; it does not become a giant name treatment.
- Application numbers use `type.meta` with tabular numerals. Monospace is unnecessary; if genuine technical metadata later requires it, use `ui-monospace` for that metadata alone.
- Use `text-wrap: balance` on short headings as an enhancement, with natural wrapping as fallback. Body text stays left-aligned, never justified.
- No manual line breaks that force desktop compositions onto mobile. The two approved Gene action sentences may retain their paragraph break.
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
- Below 360px, use a 16px gutter and a 40px hero; retain body and application sizes. Reflow rather than hiding overflow.
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

1. Number and application name together in one header (`type.meta` + `h3` / `type.app`).
2. Real screenshot inside one media stage.
3. One short verified value line in `type.body` / secondary colour.

Number/name gap: 12px. Header/media gap: 16px. Media/value gap: 20px. Keep the value line to one short sentence, ideally 6–14 words; permit natural wrapping. Do not add a second paragraph, feature list or category badge.

In the two-column layout, headers in a row share a minimum two-line title space so screenshots align; single-column headers use their natural height. All content aligns to the same left edge within its article. Text never straddles neighbouring units. The article has **no enclosing border, background panel, radius or shadow**; only its screenshot stage uses `surface.media`.

### Screenshot stage and full view

- Shared stage aspect ratio: **3:2** across breakpoints. Apply `media-inset` and preserve the image's source aspect ratio. Default to the complete capture with `object-fit: contain`.
- Screenshots fill the available inner width or height; do not add a second mat, inset window or artificial desktop/browser frame. Wide captures may have modest vertical breathing room rather than forced cropping.
- A deliberate crop is allowed only when it improves understanding of the actual function. Record crop bounds/focal position in content data; keep the complete source accessible. Never arbitrarily use `cover` across all sixteen images or cut essential labels, controls or results.
- On mobile, prefer the complete capture unless an explicit mobile crop makes the function clearer. Do not require all small desktop UI text to be legible in a 350px stage: provide full-resolution inspection instead of dishonest upscaling.
- A screenshot may be a standard link to its original full-resolution image. Give it an accessible name such as “View the full Altus LotViewer interface”. No nested links, autoplay or film dialog. This link must work without JavaScript.
- Use PNG or lossless/visually lossless WebP for UI. Preserve native colours and fine text. Never generate, redraw, blur, desaturate or apply colour grading to evidence.
- Supply intrinsic width/height, appropriate `sizes`/`srcset` derivatives no larger than the source, lazy loading below the fold and asynchronous decoding. Preload only a genuine above-fold image when needed. Do not stretch a low-resolution source and call it HD; report insufficient sources.
- Radius: 0 on the stage, at most 2px on the image. Optional image-only shadow: `0 6px 20px rgba(23,25,28,0.08)`. No shadow on the article, headings or controls.

## 7. Page architecture

### Hero — identity and confidence

Light canvas. Real ARTIFACTS identity in the header; the primary `h1` is exactly **Software that moves engineering forward.** Left-align it with the gallery container. Use the hero scale and measure, generous section padding and a single understated Applications anchor if needed.

The hero can include one current ARTIFACTS homepage capture beneath the statement, at least 32px away, with its full interface intact. It is optional: choose a deliberate typographic composition over a token-sized screenshot. Do not introduce a collage, floating planes, stock semiconductor render or substitute 3D object. No forced full-screen height or empty viewport added for drama.

### Origin — a short reason, with evidence

One ink chapter in normal flow. Use a section heading, no more than two short paragraphs (target ≤70 words total) and at most one real software detail. Explain the actual reason: unnecessary friction in engineering work led Gene to build tools to remove it. Prefer strong approved copy; avoid a new manifesto or unverifiable claim.

At ≥1024px, compose text and evidence in two unequal columns (5:7) with a 48px gap. Below 1024px, stack text then evidence with a 32px gap. If no useful evidence is available, keep one well-proportioned text composition instead of inventing a diagram. A crop must be real, legible and source-linked. Do not repeat the hero homepage image here. The move back to the light gallery is the chapter transition; no renderer or spatial handoff is required.

### Applications — the majority of the page

Light canvas, one section heading and the continuous gallery defined above. No filtering, pagination, carousel, nested collection or hidden applications. Preserve this exact order:

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

### Gene — exact copy, still presentation

Ink surface. A quiet Gene section heading precedes a single left-aligned reading column, at most 54ch wide. At desktop, use a narrow attribution column and a broader text column; stack at tablet/mobile. No huge name or centre-aligned manifesto.

Preserve the following wording and punctuation exactly. Paragraph breaks are intentional; the paired action sentences may use separate lines. Use `type.lead` for the first paragraph and `type.body` for the rest, with 24px paragraph gaps. Do not enlarge every sentence into a separate scene.

> I spent my entire life improving processes.
>
> ARTIFACTS began when I realised engineering itself was one of them.
>
> What repeated, I automated.  
> What stood in the way, I rebuilt.
>
> ARTIFACTS is the evidence that I never accepted the way things were as the way they had to stay.

Keep every word visible in natural flow. No masks, staged text swaps, clipping, pinning, decorative boxes or animation. No additional biography, job-title strip or closing slogan.

### End

Continue the Gene ink surface without a new visual scene. Essential contacts only: [weigenekhor@gmail.com](mailto:weigenekhor@gmail.com) and [LinkedIn](https://www.linkedin.com/in/weigenekhor/). Use `type.body`, clear link treatment and wrapping. Gene attribution and a discreet top link are sufficient. Do not add another catalogue, oversized wordmark or marketing footer. End in stillness.

## 8. Interaction tokens

| Token | Value | Use |
| --- | --- | --- |
| `motion.micro` | 180ms | Link colour, underline and control feedback |
| `motion.media` | 240ms | Optional restrained screenshot hover |
| `motion.ui` | 320ms | An actual utility state transition, if needed |
| `motion.reveal-max` | 600ms | Upper bound for a justified later section reveal; none required now |
| `ease.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Consistent settling without bounce |

- The page renders fully visible immediately, including with JavaScript disabled. Do not add entry opacity gates or stagger sixteen cards.
- Fine-pointer hover may scale an image to **at most 1.015** within its safe inset. Keep essential UI inside the stage. If scaling softens text, use link emphasis alone. Do not move the app name or value line.
- Hover does not trigger a sequence, change the source image or run a continuous loop. Touch has no synthetic hover playback. No parallax or cursor-driven scene.
- Focus styling is immediate and independent of hover. Restrained colour feedback is enough for pressed states; no spring or large shrink.
- With `prefers-reduced-motion: reduce`, remove image transforms and transitions, use immediate state changes and native instant anchor scrolling. No information or composition may depend on motion.
- Use native scroll. No smooth-scroll dependency, continuous `requestAnimationFrame`, observers for decorative reveals or hidden legacy animation runtime.

## 9. Accessibility and text safety

- Minimum contrast: 4.5:1 for normal text, 3:1 for large text and meaningful control graphics. Prefer 4.5:1 for all site text. Validate actual pairings, including hover and focus; never use opacity to make necessary text faint.
- Focus: 2px solid surface-appropriate accent, 4px offset, visible around the whole interactive target. Do not clip the outline at media boundaries. If placed over a screenshot, add a canvas-colour separation ring so the indicator remains distinct.
- One `h1`, chapter `h2`s and application `h3`s. Use header, nav, main, section/article and footer landmarks. Keep visual order and DOM reading order identical.
- All interactive elements are native links/buttons with meaningful names, keyboard access and visible focus. Never use hover as the sole way to expose information.
- Images have concise factual alt text describing the application and relevant view, not decorative claims. Logo text must not be announced twice when symbol and wordmark share a link.
- Layout reflows at 200% zoom and at a 320 CSS-pixel viewport. Respect browser font sizing and text-spacing overrides. Allow longer headings and contacts to wrap without truncation.
- No overflow-clipping on text or focus ancestors. A bounded image viewport may clip only the image for an explicitly approved crop, never captions, controls or outlines.

## 10. Implementation and visual acceptance

- Before the rebuild, preserve existing work through a Git checkpoint/archive. Keep original screenshots, logo and verified content. Historical versions remain separate from the active frontend.
- Load only code needed for the new static page. Do not retain old hero, origin, film, collection-positioning or Gene animation systems in the active bundle. No new visual dependency is required by this document.
- Use shared tokens and a single application data model. A screenshot and its title/value line must be authored together, not independently positioned.
- Keep GitHub Pages compatibility, relative asset paths, semantic HTML, title/meta/canonical and favicon support.
- Review actual rendered compositions at **1440px, 1280px, tablet and ~390px**. At each, inspect hero, origin, first/middle/final gallery rows, Gene and end.
- Check that all sixteen real captures load in order; names own their images; the media is large; titles wrap; Gene wording is complete; no text overlaps or clips; keyboard/reduced-motion/no-JS use remains coherent.
- Assess the page with all animation disabled. If it feels incomplete, fix composition, scale, content or spacing. Do not add motion to conceal weak static design.

### Do

Use the real work, a compact type system, generous but purposeful space, shared alignment, clear application ownership and restrained light/dark rhythm. Keep navigation effortless and surfaces quiet.

### Do not

Copy Apple branding; restore rejected legacy scenes; invent software interfaces; add application movies; make TopoTracer an exception; use random gradients, particles, fake semiconductor imagery, 3D ornaments, neon, glass cards, decorative diagrams, oversized pills, deep shadows, ambiguous labels or clipped text.

The quality criterion is the rendered work, not the number of effects or passing layout assertions. This document defines the new system; it does not certify the existing website as compliant.
