# Live application demo implementation — 17 October 2026

This supersedes the screenshot walkthrough described in NATIVE_WALKTHROUGHS.md. The user explicitly rejected screenshot-based app workspaces. Those assets remain archived in Git, but neither the page build nor runtime loads them for interactive apps.

## Implementation

- `demo-model.js`: app registry, independent initial state, statistics, filtering, diagnosis matching, XML properties, LayTec parsing, baseplate assignment and multiquadric RBF interpolation.
- `demo-view.js`: controls, tables and SVG plots, boxplots and wafer maps. No app workspace uses an image or iframe.
- `demo-analysis.js`: Data Lens, Metria, Aperture, Magus and Telemetry workflows.
- `demo-engineering.js`: AIX temperature diagnosis, AIX ΔT assignment, LT zones and TopoTracer.
- `demo-operations.js`: lot history, schedules, wafer counts, chart lookup, ANKO, XML readers/comparison and compiler samples.
- `demo-workspace.js`: lazy fixture loading, event handling, per-app state, focus, export and theme refresh. Late fetches cannot replace a newly selected app. Pointerdown commits an edited field before a button action to avoid losing clicks on blur-triggered rendering.
- `demo.css`: scoped theme-role styling, source-aligned panel arrangements and crisp vector charts. TopoTracer deliberately retains its white native plotting canvas in every theme.
- `scripts/export-live-fixtures.py`: read-only extraction of approved Desktop inputs and isolated desktop built-in demo functions. It writes website JSON only; there is no equipment/database access or modification to desktop sources/preferences. Most fixture tables retain every row. Telemetry is evenly sampled to at most 360 display points per numeric signal, preserving endpoints.

All fixture files carry source filenames and SHA-256 hashes. Python/scientific libraries are needed only to re-export; ordinary builds and browsers require none of them.

## Coverage

| App | Working local sample interactions |
| --- | --- |
| Altus Lot Viewer | Built-in 25-wafer history, chamber/text filters, sample restore, CSV |
| Altus ANKO Viewer | Built-in module schedule, text filter, restore, CSV |
| Altus WaferCounter | Twelve native-generated readings, original limits and progress-colour interpolation, six-reactor/two-chamber canvas |
| SPC Pathfinder | Source chart index, workcenter/type/search filters, selection and local chart metadata |
| ANKO Helper | Built-in summary, equipment filtering, projected schedule, CSV |
| Magus SPC GaN / Legacy | Separate native-generated series, chart/period/status selections, mean/sigma/range, raw points, sample report, CSV |
| TopoTracer | Editable 49-point native sample, recomputed multiquadric RBF, contour, rotatable projected surface, radial and axial profiles, histogram |
| Papyrus Reader | Three actual XML samples, raw/diffs/line-sequence/property comparisons, search, font size, scroll sync and report |
| AIX XML Assistant | Reference/target choice, swap, block/property comparison, differences filter, index, HTML report |
| AIX Temp Diagnoser | Actual paired master cases; selectable process/clean observations; exact-match checks and no-match handling |
| AIX ΔT Assistant | Editable 3–8 pocket inputs, weight assignment and temperature-offset reassignment, native 4°C and 6°C checks, live susceptor map |
| LT Zone Assistant | Inner half-angle, outer range and both anchors update the live five-pocket geometry |
| LT Report Compiler | Source analysis rows, step filter, parsed averages/deviations/min/max, CSV |
| Met Compiler | Legacy sample role/worksheet selection and measured result cells; Plessey joins of native-parsed Plato/Bow records with growth-plan enrichment; CSV |
| Metria SPC | 900 wafer records, parameter/reactor/run-type selection, family-specific limits, comparisons, averaging, summary, CSV |
| Aperture SPC | 3,120 source readings, trend/scatter/distribution/boxplot, parameter/equipment/lot filters, source limits, summary, CSV |
| Data Lens | 2,637 source sites, all five modes, parameter/group/run/wafer controls, statistics and wafer-average correlations, CSV |
| Telemetry | Numeric signals from the synthetic session, module/parameter/period choices, latest-12-hour selection, hover values including the latest point, CSV |

## Explicit demo boundaries

These are bounded browser demos, not complete desktop ports. Inputs are the bundled samples; arbitrary user-file parsing, equipment connections, database writes and desktop OS integrations are not exposed. Pathfinder resolves the selected index entry locally and does not open the internal chart service. Legacy compiler modes currently share the explicitly labelled HV sample rather than claiming distinct AIXDEMO/RG ENG source data. Legacy compiler result cells were processed by the desktop; Plessey joins and LayTec parsing run locally. Native Excel formatting, validation rules and every desktop setting are not reproduced. The demo exports CSV/HTML rather than pretending to generate native workbooks. Telemetry's data remains a dated synthetic session, not a live feed or a full forecast implementation.

## Hero correction

Home card labels now use the native 9pt-equivalent regular font without extra padding and cannot wrap. Expedition headings remain 13px semibold, on one line. Chrome labels cannot wrap. Native card positions, surfaces and artwork are preserved. The original grey website atmosphere/shadow and enlarged ARTIFACTS heading remain.

## Verification

`node scripts/build-native.mjs`, `node scripts/check-syntax.mjs`, and `node --test tests/*.test.mjs` pass. Tests exercise every listed mode, actual fixture counts and values, filters, independent app/theme state, stale fetches, assignments, diagnostic matching, XML differences, compiler joins, and exact RBF agreement against SciPy reference probes. Existing gallery, appearance, notification and homepage geometry checks remain.

Final browser rendering and real pointer/keyboard interaction still require visual review. The automation browser explicitly rejected local-URL access by security policy in this session; no alternate browser or rendering workaround was used. Unit/event tests do not prove pixel-identical rendering at every display size. Production remains unchanged until that review is complete.
