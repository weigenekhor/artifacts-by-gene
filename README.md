# ARTIFACTS

A personal engineering environment at https://artifactsbygene.com.
The current redesign is on `experience/continuous-instruments`. Production is unchanged until review and merge.

## Run the committed website

```sh
python -m http.server 8001 --bind 127.0.0.1
```

Open http://127.0.0.1:8001 while the server is running. A refused connection means that local process has stopped; it does not describe the public website.

GitHub Pages serves the committed HTML, CSS, JavaScript and assets directly. No server, API key, runtime CDN or remote font is required. Preserve `CNAME` and configure Pages to deploy `main / root`. All application asset URLs are relative and are tested under the repository subpath.

## The experience

One persistent scene carries the visitor from the original ARTIFACTS symbol through engineering friction, logical comparison, connected tools and the full ecosystem. The original SVG outlines become beveled metal sheets; sixteen continuous strips carry the transitions into traces, recipe steps and application connections. Geometry morphs and damped camera orientation share a single native-scroll timeline. There is no wheel interception or scroll lock.

The ecosystem retains the sixteen real application names and four original Expeditions. A spatial index opens a purpose-specific workflow study for every app: wafer surfaces, recipe/configuration alignment, diagnostic convergence, reactor usage, synchronized schedules, metrology/report compilation and parameter signals. Each study has a working control and a real software detail available to inspect. Previous/next, arrow keys, the application selector and direct links such as `#app/topotracer` are supported.

These studies are **illustrative geometry**, not application output, live data, process simulations or claims about measured performance. The supplied software captures are the factual visual evidence.

## Source and build

```sh
pnpm install --frozen-lockfile
pnpm build
```

- `content/apps.json`: verified app catalogue, purpose, original group, visual concept and capture provenance.
- `content/page.html`: semantic page template and narrative.
- `scripts/build.mjs`: generates `index.html`, `js/apps.js` and the bundled `script.js`.
- `js/forms.js`: common topology and each workflow's geometric transformation.
- `js/world.js`: Three.js scene, original-logo extrusion, materials, camera and SVG fallback.
- `js/experience.js`: native-scroll clock, focus/navigation, motion preference, inspector and lifecycle.
- `styles.css`: layout, typography, desktop, portrait and short-landscape compositions.
- `scripts/prepare-evidence.mjs`: deterministic, lossless capture pipeline.

Three.js 0.180.0 is bundled locally with esbuild. It adds the materials, perspective and continuous geometry needed for this direction. GSAP and Lenis are not needed: the browser retains native scrolling. Only build/QA dependencies are installed; the deployed site runs from static files. Third-party licenses are in `assets/licenses/` and the font directory.

## Real software images

All 17 supplied PNGs in `C:/Users/Gene/Desktop/Artifacts Images` were visually inspected: the homepage and sixteen applications. Each source is **1425 × 950**. They are not native 4K captures.

`assets/evidence/<app-id>/detail.webp` and `full.webp` preserve the original pixels losslessly. `assets/evidence/audit.json` records source hashes, decoded-pixel hashes and exact crop rectangles. All focused details together are approximately 492 KiB. A detail is loaded when its app is selected; full captures are requested by the inspector. The inspector offers focused/full views and native physical pixels, respecting the actual display density. It never invents detail by upscaling.

To replace images:

```sh
node scripts/prepare-evidence.mjs /path/to/Artifacts-Images
pnpm build
pnpm test:evidence
```

Keep the source filenames or update the explicit mapping in the preparation script. Review crop rectangles if the source layout or dimensions change. Larger close-ups require larger **native** recaptures. Earlier screenshots remain archived under `assets/artifacts/apps/`; they are not used by this experience.

## Motion, accessibility and performance

- Native semantic links and controls, visible focus, native modal focus handling and Escape dismissal.
- OS reduced motion and a persistent session motion control present composed static states without camera travel.
- Portrait keeps the same narrative with a separate framing and touch controls; landscape moves inspection controls away from the story footer.
- No WebGL: the workflow geometry renders as SVG. No JavaScript: the story and complete catalogue remain readable and linked to actual captures.
- One scheduled animation loop sleeps when settled, hidden or offscreen.
- Geometry is reused. Normal studies need one draw call; connectors/nodes add one. The opening uses three original logo shapes.
- Device pixel ratio is capped at 2 on desktop, 1.6 on narrow screens, with a further 3.4-million-pixel drawing-buffer budget.
- No textures are needed for the workflow studies. Screenshots remain DOM images so they can be inspected without 3D sampling blur.

## Validation

```sh
pnpm test:evidence
pnpm test:assets
# Install Playwright Chromium, or select an installed browser:
BROWSER_CHANNEL=msedge pnpm test
```

In PowerShell use `$env:BROWSER_CHANNEL='msedge'; pnpm test`.
The browser suite serves the site locally under a GitHub Pages-style subpath, checks every app/control/capture, captures ten viewport configurations, scans accessibility, exercises reduced motion, no WebGL and no JavaScript, and measures a local scroll sample and idle renderer behavior.

See `VALIDATION.md` for actual results and limitations. Generated QA captures, reports and videos live in ignored `.qa/`.
