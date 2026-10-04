# Start here — ARTIFACTS public website

This is the authoritative website direction. The preceding contained-product implementation is recoverable at `a706a60`; the older fullscreen exhibition at `5e518a7`. Do not restore generated app forms, global theme state or edition-based public galleries.

## Current experience

- A restrained introduction leads into a contained ARTIFACTS product window. Linear informed page composition only; no copied branding or assets.
- Home content is rendered offline from the actual desktop HomeWidget in four appearance/mode states. Browser controls retain semantic navigation over those exact source-rendered cards.
- Opening an app fills the frame with its supplied real capture. The complete product scales uniformly at every window size; internal geometry does not reflow.
- Only the product changes theme. The website, gallery and image viewer keep one graphite/warm-neutral identity.
- A connected cycle explains the thinking behind the whole collection: understand the work, build a better response, refine through use.
- Every canonical app appears once in the public gallery. Six receive wide emphasis; all retain names, purpose and complete capture sets in source order.
- Authorship is a centered personal credit with direct contact links, followed by a quiet ending.
- No WebGL, decorative 3D, generated engineering results or recreated default app pages. Cursor styling uses a small native arrow asset, never a trailing overlay.

## Read next

1. [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md): composition, type, palette, responsive behavior and motion.
2. [ARCHITECTURE.md](ARCHITECTURE.md): scoped product state, native home assets, capture views and deployment.
3. [CONTENT_AND_APPS.md](CONTENT_AND_APPS.md): sources, order, screenshot ownership and asset updates.
4. [STATUS.md](STATUS.md): verification and boundaries.

The latest explicit user request overrides these documents. Desktop source governs product fidelity; `content/apps.json` is the normalized application model.

## Run

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm lint
pnpm test
pnpm serve
```

Preview: http://127.0.0.1:8001/ . The generated HTML, ES modules and committed assets deploy directly to GitHub Pages. Desktop/Python sources are not needed for normal builds. Review branch: `rebuild/contained-product`.
