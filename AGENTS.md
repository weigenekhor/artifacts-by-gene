# ARTIFACTS Website Instructions

Before performing any substantial frontend, visual, motion, WebGL, layout, storytelling, or UX work:

1. Read root-level `DESIGN.md` completely.
2. Treat `DESIGN.md` as the single authoritative visual specification.
3. Treat older creative directions and storyboards in Git history as historical only.
4. Do not substitute generic SaaS, AI-startup, portfolio, gaming, or template design conventions.
5. Follow the current user prompt when it explicitly overrides the documents.
6. Do not claim visual work is complete without running the project and checking for build/runtime errors.
7. Keep the software itself static. Present all seventeen real applications in the four canonical Expedition chapters. Origin and Gene contain no screenshots. Equal-sized app galleries open an accessible in-page full-resolution viewer; no new tabs. No application movies, Canvas, WebGL, masked text or legacy animation runtime. Multi-image galleries may crossfade automatically with pause, keyboard/touch navigation and reduced-motion alternatives. Hero/chapter transitions may use the progressive enhancement specified in DESIGN.md. Native scrolling and complete no-JavaScript/reduced-motion compositions are mandatory.
8. Edit `content/page.html`, `content/apps.json`, `content/expeditions.json`, `styles.css`, `chapter-motion.js` and `image-viewer.js` and `gallery.js`; run `pnpm build` to regenerate `index.html`. Rescan the authoritative screenshot folder for asset changes and maintain `content/source-manifest.json`. `pnpm test` checks content, capture integrity and motion lifecycle. Review rendered desktop/mobile compositions and transition states.
