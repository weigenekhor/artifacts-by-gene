# Design specification — native ARTIFACTS

## Authority

Source: `C:\Users\Gene\Desktop\Artifacts\Artifacts\Genepy`.
References: `C:\Users\Gene\Desktop\Artifacts Images`, including the user-supplied `Empty` folder (34 default-state references). The previous `Empty Apps` path is obsolete. These paths are development inputs, never runtime dependencies.

`widgets/home_page.py`, `artifacts_style.py`, `edition_theme.py`, `Artifacts.py`, navigation resources and individual widgets govern the native interface. Existing screenshots establish visual evidence; they never replace interactive UI.

## Five acts

1. **Interactive ARTIFACTS.** The real home composition, actual Expedition cards, metadata panel, native titlebar, sidebar and corresponding default app workspaces. Opening tools stays within one shell. A separate edge cue leads into the website. The hero is not a screenshot, video, canvas or image map.
2. **Principle.** “What repeated was automated. What stood in the way was rebuilt.” One impersonal supporting sentence about engineering friction and the actual tools.
3. **Expedition galleries.** Real membership and order, selected by Legacy/Pentimento. Calm two-column editorial layout, with full-width TopoTracer and Data Lens features. One complete image per app at a time. Every screenshot has clear application ownership.
4. **Authorship.** “Developed by / Gene (Wei Gene Khor)”, email and LinkedIn only.
5. **Ending.** “ARTIFACTS / Built for engineering that has to be right.” No following campaign or CTA.

No personal history, duration framing, first-person origin narrative, film sequences, decorative 3D, custom cursor or WebGL.

## Source geometry and materials

`tokens.css` contains the two actual palettes: Origin and Pentimento. Pentimento is the default; mode and theme are independent. Use one theme state for the application, website, galleries, authorship and viewer. Screenshots retain their original colors.

Native typography: Segoe UI with platform fallbacks; 14px shell, 12px cards, 13px Expedition labels. Source card footprint is 148×116px with 12px gaps. Pentimento uses four columns; Legacy uses six on wide desktop. Titlebar 44px, collapsed sidebar 60px, nav rows 40px, status bar 21px. Do not magnify controls merely because the viewport is larger.

The wafer comes from the actual desktop material and contour. Its geometry follows the source. The slow 1°/s drift uses a compositor animation, paused offscreen, while a tool is open, in a hidden tab and under reduced motion. Mouse dragging rotates that background; touch remains available for scrolling.

Website surfaces remain within the same theme palette. Editorial type scales deliberately; page width caps at 1720px. Use fine borders, ordinary focus rings and whitespace. No ornamental gradients or invented branding.

## Interaction

- App activation: source-like 220ms transition; no engineering calculations, file access or fake results. Desktop-only actions are visibly disabled.
- Home hover: real icon, title, source description/version/release, small source-derived motion strip and interface preview. Keyboard focus also exposes the panel. Returning home restores focus without unexpectedly reopening it.
- Gallery: 6.5s dwell; 420ms decoded-image crossfade. Only the most central meaningfully visible card advances. Pause for hover/focus, explicit pause, hidden document, offscreen, modal or reduced motion. Manual actions restart the dwell.
- Focused viewer: contain the whole image, current app/count, previous/next, arrows, Escape, native dialog focus containment and restoration, full-resolution link. No image crop or perspective distortion.
- Entrance motion is a short 8px settling movement; never hide content waiting for JavaScript. Browser scrolling remains native.

## Responsive/accessibility

Desktop fidelity checks: 1920×1080, 2560×1440, 2560×1600. Native controls retain their source scale.

Below 1100/900px, reduce native card columns. At 700px use two 132px cards, a 46px rail and overlay expanded panels. Complex tool controls reflow and workspaces scroll internally. Below 760px galleries become one column and the viewer places arrows below the image. Horizontal swipe must not intercept vertical page scrolling.

Use semantic buttons/forms/dialogs, labelled controls, visible focus, keyboard navigation, source defaults and reasonable contrast. Respect `prefers-reduced-motion`: no wafer drift, preview cycling, entry motion or gallery autoplay. Without JS, preserve the complete galleries, screenshot links, narrative, authorship and ending.
