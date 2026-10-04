# Implementation status

## Delivered

The native rebuild implements the five acts in `DESIGN.md`. All 17 distinct source applications open to browser-native default workspaces. Origin/Pentimento themes share one state across the shell and website; Legacy/Pentimento modes preserve the actual source membership. The 34 supplied `Empty` references inform the interfaces and never appear in galleries.

The galleries contain 58 explicitly mapped captures, with complete composition, responsive derivatives, one active slideshow, manual navigation and a focused viewer. Minimal authorship, correct contact links and the exact requested ending replace the previous personal narrative.

The previous implementation is safely preserved at `5126a14`. This rebuild is on `rebuild/native-artifacts`; production has not been promoted.

## Verification

- Production HTML build and syntax checks pass. Six automated checks cover source membership, all 290 screenshot files and dimensions, deployment paths/content, synchronized state with blocked storage, swipe intent and autoplay pause conditions.
- Rendered homepage reviewed at 1920×1080, 2560×1440 and 2560×1600, including both source themes and source-sized card geometry. Additional rendered reviews at 1440×900, 1024×900 and 390×844 cover gallery, default workspaces, authorship and ending.
- Every distinct application was opened through its real card. Home return, mode/theme synchronization, metadata panel, sidebar, information drawer, tabs and lightweight geometry controls were exercised.
- Gallery advance/count, single-owner autoplay, keyboard arrows, viewer containment, Escape and focus restoration were exercised in the browser. No console errors or warnings were observed. All 341 checked local production asset URLs returned HTTP 200.
- Reduced-motion and no-JavaScript branches were rendered through local test fixtures. The reduced-motion fixture exercises actual runtime media-query branches without changing the user's OS setting. The no-script fixture removes scripts and exposes the real static fallback.
- Mobile layout and swipe-intent logic were checked; this is not a claim of physical-device touch testing.

## Intentional boundaries

This is a public interface exhibition, not a port of the engineering backend. File loading, analysis, report generation, plotting and exports are disabled where they require desktop functionality. Controls only alter legitimate interface state; no processing success or engineering data is simulated.

The supplied screenshot PNGs remain unchanged outside the repository. Optimized full-size WebPs preserve original dimensions but are not lossless archives. Source inputs are not required to build or deploy the committed website. Historical local version previews are not current specifications or production dependencies.

Review captures and diagnostic fixtures are local under `.qa/native-review/`, excluded from deployment. GitHub Pages configuration and the custom domain remain intact.
