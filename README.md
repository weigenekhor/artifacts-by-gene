# Artifacts by Gene

A personal engineering software showcase for **https://artifactsbygene.com**.

Plain HTML, CSS, and JavaScript. No build step, framework, CDN, analytics, or runtime dependencies. Geist is self-hosted under the SIL Open Font License; the license is included in `assets/fonts/OFL.txt`.

## Local preview

Run `python -m http.server 8000` from the repository root and open http://localhost:8000. Any static HTTP server works.

## GitHub Pages

This repository is designed for branch-based GitHub Pages publishing. In **Settings → Pages**, choose **Deploy from a branch**, **main**, and **/ (root)**. Merging the website changes into main makes them available to the configured Pages deployment. No build command is needed.

The existing `CNAME` is preserved and specifies `artifactsbygene.com`. Keep the domain's existing DNS configuration. Enable HTTPS in Pages settings once GitHub has provisioned the certificate. Relative asset paths also work at the repository's default GitHub Pages address.

## Content to finish

- **Project profiles:** the `systems` object at the top of `script.js` contains clearly marked placeholder descriptions. Replace them with verified descriptions, interface captures, technical notes, and actual project links. Keep the initial GaN profile in `index.html` synchronized for visitors without JavaScript.
- **Project artwork:** current SVG plots are explicitly labeled conceptual, not live data. Replace them with approved interface captures when available.
- **About and approach:** editorial draft copy in `index.html` is marked for approval or replacement. No employers, dates, achievements, metrics, or unverified capabilities have been added.
- **Experience / CV / contact:** add when ready. No fake contact links or unavailable downloads are exposed.
- **Evolution:** intentionally undated until verified project history is available.
- **Brand:** the temporary geometric A mark appears in the header and `assets/favicon.svg`.
- **Social preview:** `assets/social-preview.png` is the 1200 × 630 sharing image referenced by Open Graph metadata.

## Interaction and performance

The hero uses a custom WebGL shader with one triangle, an analytic surface, a procedural die grid, a measured edge, controlled specular lighting, and slow rotation. It has no downloaded textures or 3D libraries. Rendering pauses offscreen and in hidden tabs; pixel density is capped. Desktop pointer movement subtly shifts lighting and orientation. Mobile renders a still surface. A CSS surface remains visible when WebGL cannot initialize or the context is lost.

Reduced-motion mode disables continuous motion, pointer response, reveal animation, and smooth scrolling. Projects use accessible tabs with arrow keys, Home, and End. Notes use a native modal dialog with Escape dismissal and focus restoration. Navigation uses normal anchors; JavaScript failure leaves the main editorial content readable.

See `VALIDATION.md` for checks and their limitations.
