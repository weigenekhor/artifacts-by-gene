# ARTIFACTS capture audit and replacement checklist

## What is real

All 16 names, descriptions and four original Expedition groups were verified against the desktop application, `widgets/home_widget.py`: `TITLES`, `CARD_DESCRIPTIONS`, `LEGACY_HOME_GROUPS`. Each site entry has its desktop `sourceKey` in `content/apps.json`.

`assets/brand/artifacts-symbol.svg` and `artifacts-symbol-metal.svg` are the original vectors from `resources/images/`, copied without editing. The favicon uses the same three paths on a dark field for light browser tabs. No replacement monogram was drawn.

All interface imagery comes from the actual application. No generated screens, recreated dashboards, inserted charts or invented measurements are used. Archive captures already contained demo/sample data. Entry workspaces are labelled as such.

## Source quality findings

The 2048 × 1104 `*1.png` exports were made from screenshot-tool JPEG captures. This is documented in the existing capture archive (`artifacts-hover-previews-20260917`, including its `staged/*.capture.jpg` files). A PNG extension did not make them lossless originals.

Seven genuine 3840 × 2160 Qt captures were found in `artifacts-final-integration-20260917/home/scale-2`. Those now replace the lower-definition primary images. Most show entry workspaces; the lower-resolution archive example remains available separately in the inspector, with an explicit compression note. Metria's native capture contains sample data.

The nine remaining primary images preserve their archive pixels, with **no further compression loss and no enlargement**. They still need native recapture. This is a source limitation, not an HD conversion claim.

## Exact recapture checklist

Provide a full-window **native PNG at 3840 × 2160 preferred, 2560px width minimum**, with the actual UI rendered at that resolution. Keep application text comfortably sized. Use shareable demo/sample inputs. For each app, the full interface is sufficient to generate the responsive image and first detail; an additional native close-up can improve the detail composition.

| App / folder under `assets/artifacts/apps/` | Current primary           | Capture needed                                                               |
| ------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------- |
| Altus LotViewer / `altus-lotviewer`         | 2048 × 1104 archive       | Full lot history view with rows and chart; close-up of history/chart region. |
| Altus ANKO Viewer / `altus-anko-viewer`     | 2048 × 1104 archive       | Populated schedule view; schedule rows at native scale.                      |
| Altus WaferCount / `altus-wafercount`       | 2048 × 1104 archive       | Loading planner with representative demo values.                             |
| TopoTracer / `topotracer`                   | 2048 × 1104 archive       | Loaded contour/topography plot with readable controls.                       |
| SPC Pathfinder / `spc-pathfinder`           | 2048 × 1104 archive       | Populated chart index with a selected chart.                                 |
| GaN Met Compiler / `gan-met-compiler`       | 2048 × 1104 entry archive | Compilation workspace with shareable inputs or output.                       |
| LT Zone Assistant / `lt-zone-assistant`     | 2048 × 1104 archive       | Zone mapping view with geometry and legend.                                  |
| ANKO Helper / `anko-helper`                 | 2048 × 1104 archive       | Status/due-date report with demo rows.                                       |
| LT Report Compiler / `lt-report-compiler`   | 2048 × 1104 entry archive | Report compilation with shareable inputs or completed report.                |

Already native 3840 × 2160:

| App                | Primary state   | Optional improvement                       |
| ------------------ | --------------- | ------------------------------------------ |
| Papyrus Reader     | Entry workspace | Loaded comparison or document.             |
| GaN Temp Diagnoser | Entry workspace | Completed diagnostic selection and result. |
| AIX ΔT Assistant   | Entry workspace | Populated wafer-to-wafer comparison.       |
| GaN XML Assistant  | Entry workspace | Loaded Devices.XML comparison.             |
| Magus SPC (GaN)    | Entry workspace | Populated SPC review.                      |
| Magus SPC (Legacy) | Entry workspace | Populated legacy SPC review.               |
| Metria SPC         | Sample charts   | No resolution replacement required.        |

The optional populated captures would improve storytelling; current native entry captures are genuine and sharp. Do not fabricate a result merely to fill these screens.

## Folder contract and processing

Each of all sixteen app folders contains:

- `hero.webp`: native resolution, lossless, no upscaling.
- `hero-1280.webp`: lossless downsample for responsive display.
- `thumbnail.webp`: 480px overview-only derivative, WebP quality 88.
- `detail-01.webp`: lossless crop of actual source pixels, never enlarged.
- `example.webp`: where available, the older archive example, explicitly labelled in inspection.

`content/apps.json` records source filename, source and encoded SHA-256, decoded source pixel SHA-256, dimensions, quality status and detail crop coordinates. `needsRecapture` is true for the nine archive primaries. An automated asset test verifies all sixteen hero pixel hashes and exact crops.

Use `node scripts/prepare-capture.mjs <app-id> <native-capture.png>` after installing development dependencies. It preserves the app's proportional detail region when dimensions change. Review the crop and `captureNote`, then run `pnpm build` and `pnpm test:assets`.

Avoid hand-editing only `hero.webp`: stale dimensions, responsive files or crops could make an otherwise sharp replacement render incorrectly. Archive examples are retained unless deliberately replaced or removed from the model.
