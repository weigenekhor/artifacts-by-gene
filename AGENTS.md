# ARTIFACTS Website Instructions

Before performing any substantial frontend, visual, motion, WebGL, layout, storytelling, or UX work:

1. Read root-level `DESIGN.md` completely.
2. Treat `DESIGN.md` as the single authoritative visual specification.
3. Treat older creative directions and storyboards in Git history as historical only.
4. Do not substitute generic SaaS, AI-startup, portfolio, gaming, or template design conventions.
5. Follow the current user prompt when it explicitly overrides the documents.
6. Do not claim visual work is complete without running the project and checking for build/runtime errors.
7. This is a static exhibition: no application movies, Canvas, WebGL, masked text or animation runtime. Use real screenshot evidence and verified facts.
8. Edit `content/page.html`, `content/apps.json` and `styles.css`; run `pnpm build` to regenerate `index.html`. `pnpm test` checks content and capture integrity. Review actual rendered desktop and mobile compositions.
