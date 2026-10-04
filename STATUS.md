# Implementation status

## Current pass

Hero is another 10% smaller at the same 1229:820 aspect. Native geometry replaces the previous sidebar: full-height 60→240px navigation and 240px Application Info push the application content right. Sixteen source-rendered home layouts preserve card size and desktop reflow. The greeting is removed; bottom-right status remains Pentimento in both modes.

Hero application screenshot launches are removed. Hover/focus/touch selection shows the actual native information panel, with native metadata, preview and motion strip. Fifty theme/mode/tool variants are exported read-only from the desktop. Panel placement is viewport-bounded; short landscape screens scroll the panel internally instead of shrinking its text.

Native scroll hands the introduction into a centered product scene. Current thinking graphics remain, with rewritten copy grounded in actual problems, repeatable checks, automation and refinement through use. The creator is a roughly 246px closing credit (about 40% shorter), containing only BUILT BY, Gene, Wei Gene Khor, Email and LinkedIn, with staged motion and footer handoff.

The public gallery remains independent: 17 apps, 58 captures, six wider features, 3.6-second dwell and 300ms crossfade. Its existing controls and image viewer remain functional.

## Verification

- Build and syntax checks pass. Eleven tests cover canonical ownership/order, all screenshot derivatives, relative deployment paths, state isolation, gallery gesture/autoplay rules, sixteen native layouts, fifty native information variants, viewport placement and exact creator content.
- Sidebar/navigation/information combinations, theme/mode switching, fixed Pentimento status, native card inspection, keyboard focus/Escape and touch selection were exercised in the browser. Initial resize/focus timing and a native-export background artifact were corrected during review.
- Rendered output reviewed at 1280×900, 1024×768, 390×844 and 844×390; 2560×1440 reviewed using a central capture because the browser screenshot surface truncates the full outer viewport. Native aspect and no document overflow were measured. 1440px no-script/reduced-motion fixtures were also inspected.
- No-script fixture has zero scripts and retains the native home plus all 58 full-resolution links. Reduced-motion fixture disables autoplay and native animated strips and removes scroll transforms; content/manual controls remain.
- No console errors/warnings observed. 673 asset/module URLs returned HTTP 200. Runtime modules total approximately 26 KB; initial HTML approximately 134 KB. All native layout/panel variants total approximately 17.8 MB on disk; only selected state/panel assets are requested. This is not a physical-device, GPU or sustained FPS benchmark.
- Review captures and fixtures are under ignored `.qa/native-review/`.

## Preservation and boundaries

Review branch: `rebuild/contained-product`. Prior state is recoverable at `cc2c3fc` and local tag `review/native-captures-cc2c3fc`. Production is not promoted by this pass.

The old home export pipeline/assets and hero screenshot runtime were removed. No desktop source or original capture was modified; no source asset is missing. Normal builds need only committed assets/content and Node. GitHub Pages remains static with unchanged CNAME.

Native artwork is rendered by the actual Qt widgets. Browser window decorations follow source geometry/styles, but are not claimed pixel-identical to OS-native decorations on every platform. Hover information uses browser-safe viewport placement, and touch/short-height adaptations preserve readability. This exhibition does not execute engineering processing.
