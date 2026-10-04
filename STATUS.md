# Implementation status

## Current version

The public website now presents ARTIFACTS inside a contained interactive product frame. A fixed website palette surrounds the real product's independent theme and mode controls. The initial HTML includes the homepage; individual default application interfaces load only when selected and are cached for return visits within the page.

Three original principle illustrations lead into one canonical collection. All 17 applications appear once, in source-derived order, with 58 explicitly mapped populated captures. Met Compiler, Metria SPC and Data Lens receive wider editorial treatment. Public edition filters, duplicate galleries, fullscreen product framing and global website theme state are removed.

Compact authorship and the quiet “Built around real engineering work.” ending replace the oversized closing sections. Current direction is documented in START_HERE, DESIGN_SYSTEM, ARCHITECTURE and CONTENT_AND_APPS.

The preceding implementation is preserved at `5e518a7`; earlier exhibition work at `5126a14`. This review is on `rebuild/contained-product`. Production has not been promoted.

## Verification

- Production build and syntax checks pass. Seven automated checks cover unique ordered membership, all 290 screenshot derivatives, deployment paths, product-only theme state, swipe intent, autoplay pauses and on-demand interface fragments.
- Rendered composition reviewed at 1920×1080, 2560×1440 and 2560×1600, with additional 1280×900, 1024×900 and 390×844 reviews. At 2560×1600, the saved capture covers the complete central product/intro region rather than the empty outer margins. Large-viewport capture support varies in the in-app browser.
- Source/reference comparison corrected card sizing, label font, icon scale, column fitting, frame dimensions and source theme treatment. Website typography remains Geist; both product themes use Segoe UI. This is a source-informed browser recreation, not a claim of pixel-identical Qt rendering.
- All 17 applications were opened in the contained frame. Initial application-page count was zero; visiting all distinct tools produced 17 cached pages. Home return, internal modes/themes, sidebar and lightweight interface controls were checked. Mobile hover obstruction and home layout after resizing an open app were corrected during review.
- The outer website and canonical gallery remain unchanged when product theme/mode changes. The gallery viewer was checked for full-image containment, keyboard navigation, Escape and restored trigger focus. No console errors or warnings were observed.
- All 358 checked local asset/module/fragment URLs returned HTTP 200. Initial HTML is approximately 118 KB and runtime modules approximately 33 KB uncompressed; no app workspace is shipped in the initial HTML. These are transfer-size checks, not a hardware FPS or network-speed benchmark.
- Reduced-motion and no-JavaScript branches were rendered with local fixtures. The reduced-motion fixture exercises runtime media-query branches without changing OS preferences; all 17 autoplay controls disable while manual navigation remains available. The no-script fixture removes scripts and exposes 58 real full-resolution links.
- Mobile layout and touch-intent logic were checked. Physical-device touch testing is not claimed.

## Intentional boundaries

The interactive product is a public interface exhibition, not an engineering backend. Processing, data connections, file analysis, plotting and export actions requiring desktop functionality are disabled. Lightweight controls alter real interface state; no calculation result or processing success is fabricated.

The supplied `Empty` folder contains the default-state references. The older `Empty Apps` name in the brief no longer matches the supplied location. Empty and homepage references are excluded from the public gallery.

Original PNGs and desktop source remain unchanged outside this repository. Optimized WebPs preserve the complete composition and source dimensions; they are not lossless archives. Local source paths are not runtime dependencies.

Review captures and fixtures live under ignored `.qa/native-review/`. GitHub Pages remains a static-root deployment with the custom domain unchanged.
