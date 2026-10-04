# Content, applications and assets

## Authority

Desktop source: `C:\Users\Gene\Desktop\Artifacts\Artifacts\Genepy`.
Gallery originals: `C:\Users\Gene\Desktop\Artifacts Images`.
Empty references: its `Empty` folder, 34 supplied default-state views.

Originals and desktop files are read only. They are development references, never runtime dependencies. Empty and Homepage captures are explicitly excluded from the gallery.

## One canonical model

`content/apps.json` contains unique application ids, canonical names/order, concise factual purpose, source widget key, native icons, metadata, default-screen references, `shellPath`, `featured`, and ordered screenshot records. Current source has 17 unique apps. The gallery count and numbering derive from the model and do not assume that number permanently.

Canonical order follows the first occurrence in ARTIFACTS: original Altus, Interstice, Epitaxy and Monolith membership, followed by the additional Moonstone applications. Shared tools appear once in the public collection. Internal mode/Expedition membership remains separate in the same model and is used only by the product UI.

Use the current names from source: Met Compiler, AIX Temp Diagnoser, AIX XML Assistant and Magus SPC (GaN). Stable historical `gan-*` ids do not determine visible names.

Featured status is editorial metadata, not a filename rule. Met Compiler, Metria SPC and Data Lens are currently selected for wide treatment. New applications need manifest/content, screenshots and a corresponding empty-interface generator; the gallery architecture does not need changing.

## Screenshot pipeline

There are currently 58 explicitly mapped populated captures. Each record includes original filename, theme, caption, SHA-256, native dimensions and responsive paths. Different modes/reports remain attached to their canonical app. No runtime discovery or filename parsing.

`assets/screens/<app>/<capture>/` contains 768/1280/1920/2560px derivatives and original-dimension `full.webp`. They preserve the whole composition. Responsive files use quality 94, full-size WebP quality 100; these are not bit-for-bit lossless archives. Original PNGs are untouched. Large full-size files load only through the full-resolution link. The viewer normally uses 2560px.

To update an explicitly mapped source set:

```sh
pnpm import:captures "C:\Users\Gene\Desktop\Artifacts Images"
pnpm build
pnpm test
```

A normal build uses committed assets and needs no source folder. The importer checks hashes and encoding version before skipping unchanged files. Visually verify ownership/order when adding captures.

## Other resources

The real symbol is `assets/brand/artifacts-symbol.svg`. Source-exported glyphs, navigation resources and wafer materials are in `assets/native/`. The website uses the local Geist font with its OFL license; the product uses Segoe UI. Current social artwork has SVG source and PNG output in `assets/`.

## Documentation reset

All seven root Markdown files from the preceding rebuild were reviewed. DESIGN and ASSETS were replaced by DESIGN_SYSTEM and this document; START_HERE, ARCHITECTURE, STATUS, AGENTS and the short README were rewritten. No old fullscreen, global-theme or public-edition specification remains active. Historical previews stay recoverable in Git, not competing documentation.
