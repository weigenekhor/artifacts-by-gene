# Start here — ARTIFACTS public website

This is the authoritative website direction. The preceding implementation is preserved at `cc2c3fc` and local tag `review/native-captures-cc2c3fc`. Older contained/fullscreen versions remain in Git. Do not restore generated app forms, global theme state or edition-based public galleries.

## Current experience

- A restrained introduction leads into a contained ARTIFACTS product window. Linear informed page composition only; no copied branding or assets.
- Home content is rendered offline from actual HomeWidget in 16 appearance/mode/panel states. Browser controls overlay exact source card positions.
- Hero cards show native information on hover/focus; touch uses the same panel through an accessible selector. Cards never open screenshot pages. Sidebar and Application Info push content right and use the desktop's native reflow. The complete 1229:820 window scales uniformly.
- Hero is another 10% smaller. Its page composition settles into a centered product scene through native scrolling. Bottom-right status always says Pentimento, independently of Legacy mode.
- Only the product changes theme. The website, gallery and image viewer keep one graphite/warm-neutral identity.
- The existing connected graphics explain the whole collection: actual problems, repeatable reasoning, and refinement through use.
- Every canonical app appears once in the public gallery. Six receive wide emphasis; all retain names, purpose and complete capture sets in source order.
- Authorship is only BUILT BY / Gene / Wei Gene Khor / Email / LinkedIn, about 40% shorter, with a restrained closing-credit reveal and footer handoff.
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
