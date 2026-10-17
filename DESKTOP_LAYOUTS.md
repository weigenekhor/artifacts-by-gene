# Desktop application layouts

The current user request supersedes both previous implementations: remove application demos and open the actual desktop interface, without application screenshots or invented layouts.

## Source and rendering

`scripts/export-desktop-layouts.py` starts the current ARTIFACTS MainWindow in the existing isolated offline harness. It opens each real registered application without loading examples, files or sample measurements. It exports the visible QWidget tree: parent/child relationships, coordinates, sizes, current labels, input placeholders, empty tables, font metrics, resolved theme stylesheet declarations and native custom vector geometry. Each app records its source module and SHA-256 digest.

The exporter does not modify desktop source, user settings or captures. Automatic equipment/database/network work is blocked by the existing offline harness. Source examples are never invoked. AIX Temp Diagnoser reads its bundled master vocabulary to construct the normal observation controls, with no case selected. The desktop itself contains buttons named “Load Example”; these remain part of its original layout, without website demo behavior.

`content/desktop-layouts/` has one manifest for each of the 19 apps. Each contains Imprimatura, Tenebrismo and Pentimento at four native workspace widths: collapsed sidebar, expanded navigation, Application Info and both panels. These measurements drive the DOM directly; the browser does not apply a generic grid or scale one workspace screenshot. Native minimum widths are retained: LT Zone Assistant scrolls when both side panels reduce the available width below its minimum.

`desktop-workspace.js` renders real HTML labels, buttons, fields, tables and containers. Native painted diagrams and individual control chrome use inline vector paths. Native button icons are converted to vector spans from the original icon coverage, with no embedded bitmap. There are no application images, iframes, canvases, sample calculations, sample fetches, exports or demo footer. Processing controls are presentation-only; Home, application navigation, edition selection and global theme switching continue to work.

The existing decorative home material remains behind transparent desktop panels. It is not used as an application screenshot. The public screenshot gallery is unchanged and remains separate from opening an application.

## Removed

All demo runtime modules, demo fixtures, sample downloads, screenshot walkthrough manifests and workspace screenshot assets were removed. Previous implementations remain recoverable in Git at `8630200` and earlier commits. Homepage typography fixes and the original website atmosphere remain.

## Verification and limits

Tests check all 19 × 3 × 4 layout variants, desktop source identifiers, measured bounds, source prompts, empty inputs, unique vector IDs, absence of workspace images/demo results, theme selection, navigation and asynchronous load races. Build and JavaScript syntax checks remain required.

The export is based on the actual desktop widget tree, but HTML and Qt are different renderers. Browser font rasterization, native text editing surfaces and table header rendering still require a visual comparison. Automated browser access to the local URL was rejected by the browser security policy in this session; no alternate browser/rendering workaround is used. Do not claim pixel identity before that visual review. The production site remains unchanged.
