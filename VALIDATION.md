# Validation — continuous instruments

Validated on 20 September 2026 with Playwright and installed Microsoft Edge in headless mode. Browser tests serve the committed static site under `/artifacts-by-gene/`, exercising GitHub Pages-style relative paths.

## Functional and accessibility results

- All sixteen real catalogue entries, study controls and original full captures passed.
- Every transformation control was checked for a visible change in its rendered study.
- Previous/next navigation, keyboard arrows, selection, direct application links, native-pixel inspection and Escape dismissal passed.
- All five story states were captured at every viewport below; no horizontal page overflow. Every ecosystem target stayed within the viewport and met the suite's 44px minimum height and 40px minimum width.
- Six axe WCAG A/AA scans had zero violations: opening, ecosystem, application study, capture dialog, mobile study and reduced-motion state.
- Reduced motion, SVG fallback with WebGL disabled, and the complete no-JavaScript catalogue passed.
- Zero console warnings/errors, page exceptions or failed asset responses.

## Viewports

| Viewport    | Device pixel ratio |
| ----------- | ------------------ |
| 3840 × 2160 | 1                  |
| 2560 × 1440 | 1                  |
| 1920 × 1080 | 1                  |
| 1440 × 900  | 2                  |
| 1366 × 768  | 1                  |
| 1024 × 1366 | 1                  |
| 430 × 932   | 2                  |
| 390 × 844   | 3                  |
| 320 × 740   | 2                  |
| 844 × 390   | 2                  |

Visual review included the opening, friction, alignment, connected tools, ecosystem and all sixteen individual studies. Intermediate transformation frames were also inspected, not only the settled states.

Refinements after review: original SVG extrusion replaced faceted sheet outlines; clipped hero lettering was repaired; comparison connectors and workflow annotations were added; copy holds longer during transformations; the object moves toward the center between chapters; map connections avoid group labels; portrait controls are separated from the geometry; short-landscape controls are separated from the footer.

## Performance sample

A 240-frame native-scroll sweep at 1920 × 1080, after initialization:

- Median frame interval: **16.7 ms**.
- 95th percentile: **16.8 ms**.
- Observed long tasks during the sample: **0**.
- Renderer callbacks during the subsequent idle interval: **0**.
- Final ecosystem render: **2 draw calls, 23,168 triangles**.

An earlier run identified a 169 ms shader-startup stall. Both sheet material states, connectors and nodes are now compiled before the first scroll; the final run above recorded no long tasks.

The local JavaScript bundle is approximately 585 kB uncompressed / 156 kB gzip. The drawing buffer has a 3.4-million-pixel budget, capped DPR, and reduced narrow-screen density. Captures are requested on selection/inspection.

## Source fidelity

Both `tests/evidence.mjs` and `tests/assets.mjs` passed. Sixteen current full captures and their focused crops are pixel-identical to the lossless source exports. All focused details total approximately 492 KiB. Archived captures and original brand/favicon paths also passed their checks.

Every newly supplied source is **1425 × 950**. Testing the page at 4K does not make these sources native 4K. The inspector preserves native pixel density; larger close-ups require larger original captures.

## Reproduce

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test:evidence
pnpm test:assets
BROWSER_CHANNEL=msedge pnpm test
```

For PowerShell: `$env:BROWSER_CHANNEL='msedge'; pnpm test`.

The complete browser report is in ignored `.qa/validation-v6.json`; scene and application captures use `.qa/v6-*.png`.

## Limits

This is a local headless-browser timing sample, not a guarantee for every GPU or device. Portrait and landscape coverage uses emulation; physical mobile hardware, Safari and Firefox have not been tested. Workflow geometry illustrates functions and does not represent measured application output.
