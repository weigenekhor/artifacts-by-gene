# Actual ARTIFACTS application imagery

All five interfaces were found in the existing ARTIFACTS desktop application's `resources/images` directory. The images are existing exports, not generated dashboards. Their dimensions are 2048 × 1104. Only WebP compression and a smaller responsive derivative were applied; the interfaces, content, colours, frame and captured pointer have been preserved.

| Website folder       | Original export           | Visible state                                                                    |
| -------------------- | ------------------------- | -------------------------------------------------------------------------------- |
| `gan-temp-diagnoser` | `gan_temp_diagnoser1.png` | Selected observations, diagnostic summary and reactor view                       |
| `aix-dt-assistant`   | `aix_dt_assistant1.png`   | Loaded example; weight mapping and initial assignment                            |
| `lt-zone-assistant`  | `lt_zone_assistant1.png`  | Inner/outer regions and anchor geometry                                          |
| `anko-helper`        | `anko_helper1.png`        | Existing demo report with generic equipment, parameters and DEMO lot identifiers |
| `metria-spc`         | `processscope_spc1.png`   | Actual title is Metria SPC; the export explicitly identifies sample data         |

`provenance.json` records SHA-256 hashes of the source exports and resulting assets.

## Replacing images

Each folder contains:

- `interface.webp`: the complete, full-resolution capture used for desktop and the inspector.
- `preview.webp`: 960px-wide version used on smaller displays.

Replace those files to update the corresponding scene. The detail window uses the same full-screen image, clipped in CSS; there is no fabricated detail image to maintain. Update its `--crop` / `--zoom` properties in `index.html` when the feature moves. Keep `width` and `height` attributes correct to reserve layout space.

## Optional higher-quality captures

Nothing is missing for the first exhibition. For a later refresh, export lossless PNGs at native 2560px or wider with the pointer moved outside the content:

1. **GaN Temp Diagnoser:** full selected-observation state with diagnostic summary and complete reactor visual; optionally a second capture of the explanation detail.
2. **AIX ΔT Assistant:** full weight-mapping example; optionally its temperature-mapping view.
3. **LT Zone Assistant:** full inner/outer zone view with both anchor selections visible.
4. **ANKO Helper:** complete report using generic demo equipment and lot labels; optionally a scheduling detail.
5. **Metria SPC:** full comparison/control-chart view with sample data and one chart expanded.

Provide original application captures. Do not add browser/device frames, image filters or synthetic UI. Existing screenshots already contain the desktop application shell; the website adds only the external physical presentation.
