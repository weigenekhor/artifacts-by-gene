# Artifacts by Gene

A personal exhibition of engineering software at **https://artifactsbygene.com**.

Static HTML, CSS and ES modules. No build step, runtime packages, CDN, analytics, autoplay audio or scroll interception. Geist is self-hosted; its OFL license is included.

## Preview and deployment

Run `python -m http.server 8000` from the repository root. Open `http://localhost:8000`.

GitHub Pages uses **main / root**. Merge the review branch to publish through the existing Pages configuration. `CNAME` remains `artifactsbygene.com`; no DNS changes are required. All asset and module URLs are relative, including the original-image inspection links, so the site also works under `/artifacts-by-gene/`.

## The exhibition

1. **The object:** a masked, spatially assembled ARTIFACTS title and a silicon surface turning from edge to face. Scrolling moves past the object toward the question behind it.
2. **The idea:** disordered mathematical traces converge into a structured set of paths. “Complexity is a given. Clarity is engineered.” These traces are abstract, not presented as application measurements.
3. **The ecosystem:** real application planes separate into a connected collection; direct links let visitors choose a system.
4. **The software:** GaN Temp Diagnoser, AIX ΔT Assistant, LT Zone Assistant, ANKO Helper and Metria SPC. Each screen approaches, settles into a readable view, then yields to a magnified region of the same capture. Alternating compositions and damped pointer orientation give the surfaces depth. Inspect opens the original capture with fit/zoom, keyboard scrolling, Escape and focus restoration.
5. **The evolution and Gene:** layers resolve into ARTIFACTS, then the environment quiets for the person behind it.

The images are actual existing exports from Gene’s desktop application. No interface imagery was generated or recreated. ANKO shows existing demo data; Metria shows existing sample data. See [asset provenance and replacement instructions](assets/software/README.md).

## File ownership

- `index.html`: semantic, fully readable content and real image links even without JavaScript. Section IDs also power navigation. Application descriptions refer only to visible features in the captures.
- `styles.css`: typography, physical screen layers, responsive composition, static and reduced-motion layouts.
- `js/motion.js`: shared frame scheduler, exact critically damped spring, motion preferences and entrance timings.
- `js/exhibition.js`: cached section geometry, native-scroll camera choreography, trace organisation, scene focus and image inspection.
- `js/surface.js`: a single-draw WebGL wafer with reflected strip lighting, rim thickness, die pattern and a controlled entrance. CSS provides the fallback.
- `assets/software/<application>/`: `interface.webp` (2048px export) and `preview.webp` (960px). Full-resolution images total approximately 615 KiB.
- `tests/browser.mjs`: Playwright and axe checks. `.qa/` holds ignored screenshots and results.

## Motion and performance

Scroll stays native. Sticky staging adds 75–80% of a viewport per desktop scene, with shorter mobile sequences. The full-screen view occupies the middle of each software scene; the magnified detail follows it. Direct links bypass the narrative sequence.

The shared clock sleeps when DOM motion settles, pauses when the document is hidden and stops WebGL when the wafer is offscreen. Desktop shader rendering is capped at 1.1 million pixels, with a maximum pixel ratio of 1.5. Compact screens use at most 420,000 pixels at 24 Hz. Sustained slow frames lower the rendering resolution. There are no screen textures uploaded to WebGL: software is crisp DOM imagery with CSS perspective.

**Motion off** persists for the session. OS reduced motion takes precedence. Both produce a complete static layout, removing sticky distances and macro overlays while retaining full-screen captures and inspection. Short landscape viewports use ordinary document flow so controls cannot become trapped below a pinned scene.

## Content maintenance

To replace a capture, keep the two filenames in its application folder. If the aspect ratio changes, update image width/height attributes in `index.html` and the plane width calculation in CSS. The `--crop` and `--zoom` properties on each software section choose its magnified detail; the original image stays intact. `data-side` sets its approach direction.

New CV, experience or contact material belongs at the marked comment after the Gene section. No personal history, dates, qualifications, contact details or project performance claims have been invented.

## Validation

Install development dependencies with `pnpm install --frozen-lockfile`. Run `pnpm exec playwright install chromium` once, then `pnpm test`.

On Windows with Edge installed: `$env:BROWSER_CHANNEL='msedge'; node tests/browser.mjs`.

See [VALIDATION.md](VALIDATION.md) for measured results and the limits of browser/device coverage.
