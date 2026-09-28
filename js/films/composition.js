// A real image gets the whole stage. Cinema and occasional words get explicitly
// separate territories; transport and inspection never borrow from either one.
export const compositions = Object.fromEntries(
  [
    "history",
    "schedule",
    "usage",
    "surface",
    "comparison",
    "pathfinder",
    "compile",
    "diagnose",
    "arrange",
    "zones",
    "configuration",
    "spc",
    "legacy",
    "planning",
    "report",
    "signals",
  ].map((id, i) => [
    id,
    {
      words:
        i % 3 === 0
          ? [0.02, 0, 0.8, 0.16]
          : i % 3 === 1
            ? [0.27, 0, 0.7, 0.16]
            : [0.02, 0, 0.8, 0.16],
      world: [0, 0.17, 1, 0.83],
      size: 42,
    },
  ]),
);
export function compose(kind, view, operation, heading) {
  const profile = compositions[kind],
    mobile = innerWidth < 700,
    W = view.clientWidth,
    H = view.clientHeight;
  const headH = mobile ? 80 : Math.min(78, H * 0.15),
    gap = mobile ? 4 : 10;
  const bounds = {
    x: 0,
    y: headH + gap,
    w: W,
    h: Math.max(100, H - headH - gap),
  };
  Object.assign(operation.style, {
    left: "0px",
    top: bounds.y + "px",
    width: W + "px",
    height: bounds.h + "px",
  });
  const stage = view.closest(".feature-stage");
  stage.classList.remove("film-side-inspection");
  const inspection = stage.querySelector(
    ".film-inspection,.papyrus-inspection",
  );
  for (const prop of ["left", "top", "width", "height"])
    inspection.style.removeProperty(prop);
  Object.assign(heading.style, {
    left: view.offsetLeft + (mobile ? 0 : profile.words[0] * W) + "px",
    top: view.offsetTop + "px",
    width: (mobile ? W : profile.words[2] * W) + "px",
    height: headH + "px",
    fontSize:
      (mobile ? 28 : Math.min(36, Math.max(28, innerWidth / 40))) + "px",
  });
  return bounds;
}
