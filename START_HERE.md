# Start here — ARTIFACTS public website

This is the current authoritative website direction. The previous fullscreen native exhibition is superseded and recoverable at commit `5e518a7`. Do not restore its global theme state or edition-based public galleries.

## Current experience

- Linear informs PAGE COMPOSITION only: restrained introduction, whitespace and a contained product presentation. No copied branding, illustrations or interactions.
- The ARTIFACTS window itself follows the real desktop source. It is contained, never a fullscreen website. Its homepage retains real Expeditions, modes, controls and identity.
- Only the product changes theme. The outer website has one fixed graphite/warm-neutral identity, including the gallery and viewer.
- There is no public theme switch and no public Legacy/Pentimento switch.
- The public 2D collection shows every canonical app exactly once. Its count and numbering derive from the manifest; there is no permanent count assumption.
- Three original principle diagrams precede the collection. Authorship is compact; the ending is a quiet signature.
- No WebGL gallery, 3D world, custom cursor, personal narrative or simulated engineering processing.

## Read next

1. [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md): composition, type, palette, responsive behavior and motion.
2. [ARCHITECTURE.md](ARCHITECTURE.md): scoped product state, lazy app shells, gallery and deployment.
3. [CONTENT_AND_APPS.md](CONTENT_AND_APPS.md): authoritative source, canonical order, screenshot ownership and updating assets.
4. [STATUS.md](STATUS.md): checks and intentional limitations.

The latest explicit user request overrides these documents. Desktop source governs product fidelity; `content/apps.json` is the normalized application model.

## Run

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm lint
pnpm test
pnpm serve
```

Preview: http://127.0.0.1:8001/ . The generated HTML, app fragments and assets deploy directly to GitHub Pages. Source desktop files are not needed for normal builds. Current branch: `rebuild/contained-product`.
