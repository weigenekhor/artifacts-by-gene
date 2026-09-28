# ARTIFACTS

Static software exhibition at https://artifactsbygene.com. `DESIGN.md` is the authoritative visual specification.

## Preview

The committed `index.html`, `styles.css` and `assets/` work without a build or JavaScript. With Node.js installed:

```sh
pnpm serve
```

Open http://127.0.0.1:8001/. Keep the server running while reviewing. Alternatively use `py -m http.server 8001 --bind 127.0.0.1`.

## Edit and build

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

- `content/page.html`: semantic page template and exact approved Gene copy.
- `content/apps.json`: canonical application order, verified facts, concise captions and capture provenance.
- `content/homepage.json`: real ARTIFACTS homepage capture.
- `styles.css`: the DESIGN.md tokens and responsive layouts; the only active stylesheet.
- `scripts/build.mjs`: generates complete static HTML. There is no client bundle.
- `scripts/import-captures.mjs`: imports current named PNG sources as lossless full-size WebP plus smaller responsive derivatives.

To refresh captures, use `pnpm import:captures` or `pnpm import:captures "path/to/Artifacts Images"`, then rebuild. The default source folder is `C:\Users\Gene\Desktop\Artifacts Images`. Keep filenames aligned with `sourceFilename` in the catalogue. Importing preserves full native pixels and records source and decoded-pixel SHA-256 hashes. All current source captures are 1425 x 950; derivatives never upscale them. Higher-resolution recaptures can replace these later.

## GitHub Pages

Publish the committed static files from the repository root. Preserve `CNAME` (`artifactsbygene.com`), `.nojekyll`, `robots.txt` and `sitemap.xml`. Asset paths are relative and also work under a project subpath. Node and Sharp are development tools only; Pages needs no server, runtime dependency or build service.

## History

The pre-rebuild implementation, including DESIGN.md, is checkpointed at `29bcb3d`, tagged `archive/pre-static-exhibition-with-design-20260928`. The earlier frontend is also tagged `archive/pre-static-exhibition-20260928`. Existing ignored `versions/` previews remain intact. Review history with `git show` or a separate checkout; do not overwrite the current working tree to view an archive.

The clean rebuild lives on `rebuild/static-exhibition`. Old films, renderers, animation styles and conflicting direction documents were removed from the active source tree and remain recoverable in Git. Source screenshots and verified software content were retained.
