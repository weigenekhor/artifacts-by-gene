# Current ARTIFACTS direction

Branch: `experience/software-exhibition`. Review: PR #4. Production remains on main.

Read AGENTS.md and both governing design documents. Preserve the approved Gene copy and all sixteen applications in canonical order. Gene requests focused visual iteration before comprehensive QA.

The hero and origin share a projected route field in `js/origin-field.js`, controlled by `js/genesis.js`. Routes become recurring observations, acquire retained checks and open the homepage frame. No screenshots appear in the origin. The last viewport overlaps the collection arrival. On scroll the homepage recedes and apps come forward.

All sixteen studies use substantive 3D geometry. `js/space.js` and `js/material-renderer.js` share one lazy WebGL context with a Canvas fallback. `js/spatial-studies.js` covers fifteen applications; TopoTracer uses `js/topography.js`. GaN Temp Diagnoser's new observation/check map is in `js/diagnostic-study.js`. Full uncropped screenshots accompany every study. The diagrams are illustrative; no measured values or cross-app integrations are claimed.

Build with `node scripts/build.mjs`. Generated outputs: index.html, js/apps.js and script.js. Preview: http://127.0.0.1:8001/?v=spatial-methods. Verify the server before sharing.

This pass: focused desktop review of all sixteen studies, mobile and reduced-motion checks, no console/runtime errors. Brief local frame sampling was near 16.7ms median; broad device/GPU validation remains deferred. QA outputs are ignored under .qa/.

Publish through the authenticated GitHub connector, then verify tree equality before synchronizing the local branch. Do not merge production without instruction.
