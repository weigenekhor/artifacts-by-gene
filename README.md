# ARTIFACTS

A personal engineering environment at https://artifactsbygene.com.
The current redesign is on `experience/continuous-instruments`. Production is unchanged until review and merge. [Review PR #3](https://github.com/weigenekhor/artifacts-by-gene/pull/3).

## Run the committed website

```sh
python -m http.server 8001 --bind 127.0.0.1
```

Open http://127.0.0.1:8001 while the server is running. A refused connection means that local process has stopped; it does not describe the public website.

GitHub Pages serves the committed HTML, CSS, JavaScript and assets directly. No server, API key, runtime CDN or remote font is required. Preserve `CNAME` and configure Pages to deploy `main / root`. All application asset URLs are relative and are tested under the repository subpath.

## The experience

A measured surface opens into separate inputs, recipe alignment and an ordered set of tools. The logo remains a brand asset in the navigation and footer. It is not motion geometry.

Four concise story beats establish why the tools exist. Scrolling then advances through **all sixteen applications in order**, one viewport-sized reading interval per app. Each app pairs its complete, uncropped interface with its existing purpose-specific motion study. The study develops during entry; its optional control remains available. The camera settles and the screenshot returns to an untransformed plane for inspection.

A segmented progress rail, previous/next controls, direct links such as `#app/topotracer`, and a mobile jump selector offer shortcuts. None is required to see the next app. A clean index follows, grouped into the four original Expeditions. There are no disconnected network strands.

The studies are **illustrative geometry**, not live data, process simulations or measured app output. Original screenshots are the factual visual evidence. An opaque, reserved header band prevents outgoing content from crossing the brand.

## Source and build

```sh
pnpm install --frozen-lockfile
pnpm build
```

- `content/apps.json`: verified app catalogue, editorial headline, purpose, original group, visual concept and capture provenance.
- `content/page.html`: semantic page template and narrative.
- `scripts/build.mjs`: generates `index.html`, `js/apps.js` and the bundled `script.js`.
- `js/forms.js`: common topology and each workflow's geometric transformation.
- `js/world.js`: Three.js measured surface, workflow geometry, materials, camera and SVG fallback.
- `js/experience.js`: native-scroll clock, focus/navigation, motion preference, inspector and lifecycle.
- `styles.css`: layout, typography, desktop, portrait and short-landscape compositions.
- `scripts/prepare-evidence.mjs`: deterministic, lossless capture pipeline.

Three.js 0.180.0 is bundled locally with esbuild. It adds the materials, perspective and continuous geometry needed for this direction. GSAP and Lenis are not needed: the browser retains native scrolling. Only build/QA dependencies are installed; the deployed site runs from static files. Third-party licenses are in `assets/licenses/` and the font directory.

## Real software images

All 17 supplied PNGs in `C:/Users/Gene/Desktop/Artifacts Images` were visually inspected: the homepage and sixteen applications. Each source is **1425 × 950**. They are not native 4K captures.

The experience uses only `assets/evidence/<app-id>/full.webp`: decoded pixels match the supplied PNGs exactly. Full captures load for the active app and its immediate neighbors. They retain their complete 3:2 composition, with intrinsic dimensions, no cropping and no enlargement beyond source width. The larger viewer fits the whole image initially; an optional actual-size view permits scrolling around the original resolution.

Archived crops remain available in the repository but are not used by the current page. `assets/evidence/audit.json` records provenance and decoded-pixel hashes. Screens above the fold do not preload all sixteen images.

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
- Geometry is reused. Normal studies need one draw call; recipe/configuration connectors add one. The opening uses the same reusable geometry as the story.
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
The browser suite serves the site locally under a GitHub Pages-style subpath, checks forward/reverse scroll, every app/control/full capture, header clearance and image composition, captures eleven viewport configurations, scans accessibility, exercises reduced motion, no WebGL and no JavaScript, and measures a local scroll sample and idle renderer behavior.

See `VALIDATION.md` for actual results and limitations. Generated QA captures, reports and videos live in ignored `.qa/`.
