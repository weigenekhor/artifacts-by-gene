# Start here — ARTIFACTS public website

This is the authoritative entry point for the native ARTIFACTS rebuild. It replaces the previous exhibition, film, origin-story and 3D directions. Do not restore them from historical previews.

## Current specification

1. [DESIGN.md](DESIGN.md): five acts, source fidelity, themes, composition and interaction.
2. [ARCHITECTURE.md](ARCHITECTURE.md): components, state, build and deployment.
3. [ASSETS.md](ASSETS.md): source audit, screenshot ownership and import procedure.
4. [STATUS.md](STATUS.md): verification and intentional web boundaries.

The user's latest explicit request takes precedence. The desktop source is the authority for application names, grouping, geometry and default interfaces. `content/apps.json` is the single normalized model.

## Important source finding

The inspected desktop source contains **17 distinct applications**, not 16. Legacy exposes 15 in Expeditions I–IV. Pentimento exposes 10 in V–VI, including shared applications. Preserve this real membership; do not invent or remove a tool to force a count.

## Run

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm lint
pnpm test
pnpm serve
```

Preview: http://127.0.0.1:8001/ . Generated `index.html` and committed assets deploy directly to GitHub Pages. An image import is NOT needed for a normal build.

The previous working implementation is recoverable at Git commit `5126a14`. Current development branch: `rebuild/native-artifacts`. Local frozen versions and historical images remain local; they are not part of the active deployment.
