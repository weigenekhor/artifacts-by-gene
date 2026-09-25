# Current ARTIFACTS direction

Branch: `experience/software-exhibition`. Review: PR #4. Production remains on main.

Read AGENTS.md and both governing design documents. Preserve the approved Gene copy and all sixteen applications in canonical order. Gene requests focused visual iteration before comprehensive QA.

The hero is monumental ARTIFACTS typography inside a continuous field, rendered by `js/identity-field.js` and controlled by `js/genesis.js`. The same geometry becomes evidence, recurring patterns, retained checks and a refined method. It constructs sixteen positions before screenshots enter. `js/collection-layout.js` shares those positions with the later collection. No screenshots appear in the origin. On scroll the homepage recedes and apps come forward.

Collection selection follows actual hover or keyboard focus, not cursor proximity. The selected app advances in Z and turns frontal; neighbors recede and the clock slows during inspection. Touch presents on the first tap and navigates on the second. Leaving returns smoothly.

All sixteen studies now demonstrate their own input, operation and result. `js/function-studies.js` covers fifteen, using 2D where alignment and comparison are clearer. TopoTracer stays in `js/topography.js`. TopoTracer and AIX use `js/space.js` and the shared lazy WebGL renderer with a Canvas fallback. The old screenshot-slicing, common camera routine, spatial-studies and diagnostic-study modules are removed. Seven state names are specific to each app in `content/exhibition.json`. Full uncropped screenshots accompany every study. Diagrams are illustrative; no measured values or cross-app integrations are claimed.

Build with `node scripts/build.mjs`. Generated outputs: index.html, js/apps.js and script.js. Preview: http://127.0.0.1:8001/?v=identity-and-method. Verify the server before sharing.

This pass: build, asset/pixel-fidelity checks, focused desktop review of all sixteen studies, hover/focus depth assertions, touch navigation, mobile and reduced-motion checks. No page errors were reported. Brief local hero frame sampling was 16.7ms median, 17.4ms p95; broad device/GPU validation remains deferred. Approved Gene section verified unchanged. QA outputs are ignored under .qa/.

Publish through the authenticated GitHub connector, then verify tree equality before synchronizing the local branch. Do not merge production without instruction.
