# ARTIFACTS website instructions

Read `START_HERE.md` and the relevant linked documents before substantial frontend work. They describe the current contained-product website and supersede historical design briefs.

- The latest user prompt takes precedence.
- Read actual desktop source before changing product names, geometry, grouping or controls.
- Keep canonical app facts, screenshot ownership and featured status in `content/apps.json`.
- The hero contains one native product window, defaulting to Pentimento edition and Tenebrismo appearance. Mode (Legacy/Pentimento) and visual theme (Imprimatura/Tenebrismo/Pentimento) are independent controls in `state.js`; all 19 applications stay represented. The surrounding website palette stays graphite.
- Home surfaces, icons, card geometry and information panels come from the actual desktop renderer. Typography is live browser text for display-density sharpness. Hover/focus shows native information; clicking a card or sidebar app opens its local interactive sample demo. The user's 17 October request explicitly authorizes these demos, superseding earlier restrictions. Keep sample data visibly identified; never imply desktop processing or live equipment connections.
- Preserve changes in Git before replacing them. Do not modify source captures or desktop code.
- Build, run relevant checks and inspect rendered output before claiming visual work complete.
