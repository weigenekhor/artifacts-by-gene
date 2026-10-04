# Content, applications and assets

## Authority

Desktop source: `C:\Users\Gene\Desktop\Artifacts\Artifacts\Genepy`.
Capture originals: `C:\Users\Gene\Desktop\Artifacts Images`.

Both are read only and used for development reference. Empty captures remain available in the supplied `Empty` folder but are no longer reconstructed into app pages. Empty and Homepage captures are excluded from the gallery.

## Canonical content

`content/apps.json` contains 17 unique apps with names, source keys, order, factual purpose, native icons/metadata, featured status and ordered captures. Count/numbering derive from the model. Source order follows first occurrence: Altus, Interstice, Epitaxy, Monolith, then additional Moonstone apps. Shared tools appear once publicly; internal native mode/Expedition membership is independent.

Current names follow desktop source: Met Compiler, AIX Temp Diagnoser, AIX XML Assistant, Magus SPC (GaN). Historical gan-* identifiers do not determine visible names. Requested wide features: TopoTracer, Met Compiler, AIX Temp Diagnoser, AIX ΔT Assistant, Metria SPC, Data Lens. Other tools keep equal access and source order.

New apps need source membership, manifest facts, screenshot mapping and refreshed native home renders. They do not need a generated default-interface fragment.

## Capture pipeline

58 explicitly mapped populated captures; each stores source filename, theme, caption, hash, dimensions and responsive paths. Theme metadata is used internally only, not added to visible captions/descriptions.

`assets/screens/<app>/<capture>/` includes 768/1280/1920/2560px derivatives and original-dimension full.webp. Every view is complete. Responsive WebP quality 94; full WebP quality 100. These are optimized derivatives, not lossless archives; originals remain untouched. Viewer uses 2560px, full-size loads only through its explicit link. Hero app views choose 1280/2560 based on displayed size and density.

```sh
pnpm import:captures "C:\Users\Gene\Desktop\Artifacts Images"
pnpm build
pnpm test
```

Importer checks hashes and encoding version. Verify ownership when adding captures.

## Native home export (optional developer step)

Requires Windows Segoe UI and PySide6; normal site builds do not.

```sh
python scripts/export-home-reference.py "C:\Users\Gene\Desktop\Artifacts\Artifacts\Genepy"
node scripts/prepare-home-assets.mjs "C:\Users\Gene\Desktop\Artifacts Images"
pnpm build
```

Four 1161×750 logical views render at 2× (2322×1500). Source card coordinates live in `content/home-reference.json`; per-card hover renders use matching bounds. Committed assets are in `assets/native/home/`. Optional image-folder argument refreshes the complete no-JS fallback from Homepage 2.png. Real source text/wafer/card design remains intact.

## Other resources

Real symbol: `assets/brand/artifacts-symbol.svg`. Native glyphs/navigation and home assets: `assets/native/`. Website font: local Geist with OFL license. Product chrome: Segoe UI. Tiny native pointer assets: `assets/brand/cursor*.svg`. Social artwork remains under assets. No desktop source path is a runtime dependency.
