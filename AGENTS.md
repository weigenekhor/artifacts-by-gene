# ARTIFACTS Website Instructions

Before performing any substantial frontend, visual, motion, WebGL, layout, storytelling, or UX work:

1. Read root-level `DESIGN.md` completely.
2. Treat `DESIGN.md` as the single authoritative visual specification.
3. Treat older creative directions and storyboards in Git history as historical only.
4. Do not substitute generic SaaS, AI-startup, portfolio, gaming, or template design conventions.
5. Follow the current user prompt when it explicitly overrides the documents.
6. Do not claim visual work is complete without running the project and checking for build/runtime errors.
7. Keep the application gallery static. Origin and Gene must contain no screenshots. Images must not open when clicked. No application movies, Canvas, WebGL, masked text or legacy animation runtime. Hero/chapter transitions may use the progressively enhanced motion specified in DESIGN.md. Natural scrolling and complete no-JavaScript/reduced-motion compositions are mandatory.
8. Edit `content/page.html`, `content/apps.json`, `styles.css` and, for chapter motion only, `chapter-motion.js`; run `pnpm build` to regenerate `index.html`. `pnpm test` checks content, capture integrity and motion lifecycle. Review rendered desktop/mobile compositions and transition states.
