# ARTIFACTS website instructions

Read `START_HERE.md` and the relevant linked documents before substantial frontend work. They describe the current contained-product website and supersede historical design briefs.

- The latest user prompt takes precedence.
- Read actual desktop source before changing product names, geometry, grouping or controls.
- Keep canonical app facts, screenshot ownership and featured status in `content/apps.json`.
- Product theme/mode state is scoped to `.app-shell`. The surrounding website never changes theme or filters its collection by edition.
- The home content and information panels come from the actual desktop renderer. Hero cards show native information on hover/focus, with a touch selector. They must not open screenshot pages or reconstructed processing interfaces.
- Preserve changes in Git before replacing them. Do not modify source captures or desktop code.
- Build, run relevant checks and inspect rendered output before claiming visual work complete.
