# Current capture quality

The exhibition uses complete, uncropped captures. The opening and closing of each film fit the image without stretching; the original viewer offers its native size. The focus rectangle identifies the region used to introduce the explanatory animation. It does not replace the source with a fabricated interface.

The older `sourceQuality` / `needsRecapture` fields at app level describe files under `assets/artifacts/apps/`. They are not warnings about the newer populated PNG captures. Current quality is recorded inside each app's `evidence` object, with pixel hashes in `audit.json`.

## Sources reviewed

- Fourteen populated PNG captures: 1425 × 950, encoded losslessly as WebP.
- Updated Papyrus Reader: 1531 × 1002, encoded losslessly as WebP.
- Metria SPC: populated native 3840 × 2160 capture, now used for the collection, film and original viewer. Its newer 1425 × 950 capture remains preserved as `metria-spc/full.webp`.
- Six other native 4K archive captures: Papyrus, temperature diagnosis, AIX, XML and both Magus tools. These are entry/empty states. They were not substituted for the populated evidence simply to increase pixel dimensions.

## Manual recapture for fullscreen high-DPI inspection

The current files are genuine and usable. To resolve the remaining fullscreen/Retina source limitation, supply native PNGs at **2560px width minimum, 3840px preferred**, with readable application text and these populated states. Do not enlarge the existing files.

| Application        | State to capture                                           |
| ------------------ | ---------------------------------------------------------- |
| Altus LotViewer    | A loaded lot, event rows, wafer states and durations       |
| Altus ANKO Viewer  | Multiple equipment schedules with dates                    |
| Altus WaferCount   | Populated chamber usage counters                           |
| TopoTracer         | Loaded samples and the rendered topographic field          |
| Papyrus Reader     | The current paired XML comparison, with differences        |
| SPC Pathfinder     | Workcentre, group and parameter navigation                 |
| GaN Met Compiler   | LayTec, PL/Plato, XRR and XRD inputs and workbook activity |
| GaN Temp Diagnoser | Process/clean observations and recommended checks          |
| AIX ΔT Assistant   | The populated BP3/BP5 exchange example and input weights   |
| LT Zone Assistant  | Inner/outer reference geometry and selected boundaries     |
| GaN XML Assistant  | Devices.XML comparison with changed properties and parent  |
| Magus SPC (GaN)    | A populated chart review with raw observations             |
| Magus SPC (Legacy) | Parameter states and a selected chart                      |
| ANKO Helper        | Equipment task/status/due-date rows                        |
| LT Report Compiler | HTML analysis selection and append activity                |

Metria needs no resolution recapture. A native capture of its newest interface would be an optional content update.

Keep the filenames used in `scripts/prepare-evidence.mjs`. Place replacements in `C:/Users/Gene/Desktop/Artifacts Images` or a local source folder, review that app's focus-region coordinates for the new layout, then run:

```sh
node scripts/prepare-evidence.mjs /path/to/source-folder app-id
pnpm build
pnpm test:evidence
```

Process one app at a time to avoid replacing Metria's chosen 4K source with its smaller capture. Whole-image aspect ratio and source pixels must remain intact.
