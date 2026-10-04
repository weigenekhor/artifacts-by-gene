# Architecture

## Build and deployment

The site is static HTML/CSS/ES modules. `scripts/build-native.mjs` reads `content/apps.json` and generates `index.html`. `scripts/native-ui.mjs` and `scripts/complex-shells.mjs` generate native components/default workspaces. Edit generators, not generated HTML.

`pnpm build` is deterministic and needs only committed assets. `pnpm lint` syntax-checks active JS modules. `pnpm test` checks source membership, all image dimensions/paths, generated links/content, and central state behavior with blocked storage. `pnpm serve` binds localhost:8001.

GitHub Pages can serve the committed repository root. All asset URLs are relative. `CNAME`, `.nojekyll`, robots and sitemap are retained. No SPA fallback or rewrite is necessary. Publishing a new branch does not change production; production promotion is separate.

## Active runtime

- `state.js`: authoritative theme/mode, validated choices, local persistence and synchronized controls.
- `native-shell.js`: active application, home/focus, metadata panel lifecycle, navigation/info drawer, tabs, default ranges and geometric shell controls.
- `native-motion.js`: small source-derived metadata-preview motifs, not application films or data results.
- `native-wafer.js`: source background geometry, compositor rotation and direct drag; visibility/reduced-motion pausing.
- `gallery.js`: per-app slide state, one active autoplay owner, responsive image decoding, touch intent, keyboard controls, native dialog viewer and focus restoration.
- `site.js`: module entry point.
- `tokens.css`: source palette, type and timing variables.
- `shell.css`: native application layout and responsive adaptation.
- `site.css`: the four lower acts, gallery and viewer.

There is no third-party runtime package. Sharp is a build-time image dependency only. Desktop source is inspected/extracted during development, never imported into browser code.

## Content and image state

The single model stores canonical ids, source keys, current/Legacy names, factual purpose, source descriptions, metadata, navigation/card icons, default-screen references, ordered image records, modes, themes and Expedition membership. Shared tools appear in the correct place in both editions while reusing one image set.

Slide state belongs to each rendered gallery instance. The lightbox references the opening instance and returns its final slide and focus. Edition changes stop old autoplay and choose a newly visible card. Full-size files are not preloaded. Initial gallery images are lazy; only the likely next active image is preloaded.

## History

Checkpoint `5126a14` preserves the rejected visual system. Old `experience.js`, `image-viewer.js`, `motion-math.js`, `styles.css`, cinematography/page manifests and their tests/build scripts are removed from the active frontend. Old evidence/artifact/cursor assets are untracked and ignored, retained locally for frozen previews. They are not deployment dependencies.
