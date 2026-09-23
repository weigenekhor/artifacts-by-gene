# Current ARTIFACTS direction

Branch: `experience/software-exhibition`. Review: PR #4. Do not merge production without instruction.

Read `AGENTS.md`, `ARTIFACTS_CREATIVE_DIRECTION.md` and `ARTIFACTS_EXPERIENCE_STORYBOARD.md` completely before visual work. The current storyboard replaces the older content storyboard. Gene wants focused visual iteration; comprehensive QA is deferred until visual approval.

The Artifact is a faceted object with sixteen software-bearing leaves. It opens into a physical camera passage, reaching the light origin chapter. It replaces the earlier wafer renderer. Native WebGL2, sixteen draws, capped/adaptive DPR, lazy texture loading and offscreen suspension. CSS fallback. Drag, keyboard, structure separation, layer selection and reset remain available.

All sixteen apps follow the catalogue order. Each now has a five-beat sequence: original interface, assembly, functional method, inspection, next surface. Functional geometry remains task-specific. Pointer and range input inspect events, chambers, recipes, regions, report sections, diagnostic paths and shared chart intervals. Full uncropped captures return for a quiet inspection interval. All original media files remain unchanged.

The archive still starts with the homepage, then all sixteen captures. Full-image containment and the original-size viewer remain. Dark/light chapter rhythm and quiet creator attribution are preserved. Copy now follows evidence → repeated task → specific tool → accumulated collection.

Build: `node scripts/build.mjs`. Sources: `content/page.html`, `content/exhibition.json`, `scripts/build.mjs`, `scripts/study-visuals.mjs`, `js/hero.js`, `js/hero-interaction.js`, `js/studies.js`, `js/instruments.js`, `js/experience.js`, `artifact.css`. Generated outputs: `index.html`, `js/apps.js`, `script.js`.

This pass: build and focused runtime review; opening stages, all sixteen desktop study compositions and representative mobile scenes inspected. No console/page errors in those checks. Full browser suite, hardware FPS/GPU profiling and broad accessibility/responsive validation remain deferred. Ignored review outputs: `.qa/v14-*`.

Preview: http://127.0.0.1:8001/?v=the-artifact. Verify the server before sharing. Publish through the authenticated GitHub connector, then verify tree equality before synchronizing the local branch.
