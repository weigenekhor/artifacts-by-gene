# Assets and source audit

## Source inputs

- Desktop source: `C:\Users\Gene\Desktop\Artifacts\Artifacts\Genepy` (read only).
- Image root: `C:\Users\Gene\Desktop\Artifacts Images` (read only).
- Default-state references: `Empty\1.png` through `Empty\34.png`, ordered pairs for the 17 tools; actual filenames are recorded in the manifest. These are design references, not gallery content.
- Two Homepage PNGs: visual reference only, not the hero and not gallery items.
- Gallery: 58 explicitly mapped PNGs. Ownership was checked against filenames, image content and source application identity.

## Single manifest

`content/apps.json` contains every capture's source filename, caption, theme, source SHA-256, original width/height, optimized base path and responsive sources. No recursive discovery runs at build or runtime. This prevents Empty/homepage images entering galleries and prevents different modes becoming fictitious apps.

Variable counts are intentional: TopoTracer and Papyrus have four each; XML has four; both Magus tools have seven; Metria and Data Lens have six; the other tools have two. Images representing different modes/reports remain with their actual application.

The current source names include Met Compiler, AIX Temp Diagnoser and AIX XML Assistant. Historical `gan-*` URL ids remain stable but do not set visible names. The actual Magus title is Magus SPC (GaN).

## Production assets

- `assets/brand/artifacts-symbol.svg`: the real desktop symbol.
- `assets/native/`: source-exported card/navigation SVGs, tonal background, and prepared wafer materials. These are UI resources, not hero screenshots.
- `assets/screens/<app>/<capture>/`: 768, 1280, 1920, 2560px responsive derivatives plus `full.webp` at original dimensions (typically 10240×5520). All preserve the complete composition.
- `assets/social-preview.svg` and `.png`: current typographic Open Graph artwork. Font licenses remain; the native UI itself uses Segoe UI/platform fonts.

Full-resolution WebPs use quality 100; responsive derivatives use quality 94. They are optimized delivery files, not bit-for-bit lossless archives. Original PNGs are untouched in the source folder. Full resolution is loaded only on request; the viewer uses the 2560px file. No crop, resynthesized UI, invented data or local Windows runtime path.

## Updating captures

Update the explicit app image records first when filenames/counts change. Then:

```sh
pnpm import:captures "C:\Users\Gene\Desktop\Artifacts Images"
pnpm build
pnpm test
```

The importer verifies SHA-256 and encoding version before skipping unchanged assets. Check ownership and order visually, not just filename similarity. A normal production build does not need the source folder.

## Documentation audit

The tracked pre-rebuild Markdown consisted of AGENTS, DESIGN, README and the two historical asset READMEs. The first three are replaced with this architecture; the asset READMEs leave the tracked production tree with the obsolete assets. Old local snapshots remain historical, not specifications.
