# Native ARTIFACTS walkthroughs

All results are rendered by the real ARTIFACTS widgets using their bundled examples or the approved ARTIFACTS Test Files. The website replays recorded states; it does not calculate new engineering results or connect to equipment. All states are available in Imprimatura, Tenebrismo and Pentimento.

| Application | Sample source | Views per appearance | Recorded actions |
| --- | --- | ---: | ---: |
| Altus Lot Viewer | Built-in lot-history example | 4 | 4 |
| Altus ANKO Viewer | Built-in ANKO schedule | 2 | 1 |
| Altus WaferCount | Built-in reactor counters | 2 | 1 |
| TopoTracer | Native TopoTracer sample surface | 4 | 4 |
| Papyrus Reader | Synthetic Devices XML files | 5 | 4 |
| SPC Pathfinder | Bundled Path Master chart index | 6 | 5 |
| Met Compiler | Met Compiler PL, LayTec, XRR and XRD test inputs | 5 | 6 |
| AIX Temp Diagnoser | Bundled Pyra Master diagnosis cases | 7 | 4 |
| AIX ΔT Assistant | Load Example: native baseplate assignment | 13 | 4 |
| LT Zone Assistant | Inner and outer measurement-zone controls | 15 | 4 |
| AIX XML Assistant | Synthetic Devices XML pair | 4 | 5 |
| Magus SPC (GaN) | Built-in GaN SPC fixture | 6 | 4 |
| Magus SPC (Legacy) | Built-in Legacy SPC fixture | 6 | 4 |
| ANKO Helper | Built-in ANKO family example | 2 | 1 |
| LT Report Compiler | Synthetic LayTec analysis processed by ARTIFACTS | 2 | 2 |
| Metria SPC | Metria test workbook · 900 wafers / 36,000 readings | 12 | 12 |
| Aperture SPC | Aperture test snapshot · 3,120 measurements | 13 | 5 |
| Data Lens | Data Lens test sessions · 2,637 measured sites | 15 | 17 |
| Telemetry | Telemetry_Full_Test.telemetry | 11 | 11 |

## How the views were produced

The export imports the current desktop source read-only, loads its actual samples, performs the native actions, and records each result with its measured controls. Native 2× lossless images are shown at their matching aspect ratio. TopoPro uses the previously verified GPU capture, cropped to the same native workspace. The original capture archive and desktop application code are untouched.

The public walkthrough manifest contains only relative assets and usable control targets. The full measurement records are retained under content/workspaces for regeneration and review. Compiled Met and LayTec workbooks are actual outputs of the native processors on the sample inputs.

## Interaction boundaries

Supported buttons and selectors replay their recorded desktop result; the footer selects the main recorded views, returns to the previous view, resets the sample, or returns Home. Theme changes keep the current view. App state is isolated for the page session. Unrecorded desktop controls, text editing, arbitrary filters, plot panning/rotation, equipment retrieval and user file processing are not implemented. The footer identifies the experience as a native walkthrough with sample data.

## Verification

Automated checks verify every application and theme, image density, native hotspot bounds, scene destinations, download assets, important app-specific actions, state isolation, stale image loads, and Home navigation. Existing tests retain gallery, global appearance, notification and persistence coverage. Native views and reports were inspected as rendered images. Full browser composition and mobile interaction review remain pending because the browser tool reports local browser use disabled in Work settings.
