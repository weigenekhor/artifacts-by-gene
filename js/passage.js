// The current sectional surface opens around the actual application captures.
// DOM images stay at their native aspect ratio; the page clock owns all motion.
const clamp = (v) => Math.max(0, Math.min(1, v)),
  ease = (v) => {
    v = clamp(v);
    return v * v * (3 - 2 * v);
  };
export function createPassage(canvas, apps) {
  const stage = document.createElement("div");
  stage.className = "app-passage";
  stage.setAttribute("aria-hidden", "true");
  canvas.closest(".hero-scene").append(stage);
  const planes = apps.map((app, i) => {
    const plane = document.createElement("figure"),
      image = new Image(),
      label = document.createElement("figcaption");
    plane.className = "passage-plane";
    image.alt = "";
    image.width = app.evidence.fullWidth;
    image.height = app.evidence.fullHeight;
    image.decoding = "async";
    label.textContent = String(i + 1).padStart(2, "0") + " / " + app.name;
    plane.append(image, label);
    stage.append(plane);
    return { plane, image, src: app.evidence.full, index: i, loaded: false };
  });
  let w = innerWidth;
  return {
    resize() {
      w = canvas.closest(".hero-scene").clientWidth;
    },
    update(p, opening, reduced, px, py) {
      const travel = reduced ? 0 : ease((p - 0.47) / 0.41),
        reveal = ease((opening - 0.3) / 0.48),
        mobile = w < 700;
      stage.style.opacity = reveal;
      for (const a of planes) {
        const rank = Math.floor(a.index / 2),
          side = a.index % 2 ? 1 : -1,
          z = -rank * 175 + travel * 1610,
          scale = 720 / Math.max(140, 720 - z),
          alpha = reveal * (1 - ease((p - 0.86) / 0.1));
        const visible = alpha > 0.005 && z < 280;
        a.plane.hidden = !visible;
        if (!visible) continue;
        if (!a.loaded) {
          a.image.src = a.src;
          a.loaded = true;
        }
        const x =
            side * (mobile ? 130 : Math.min(w * 0.255, 385)) * scale * opening,
          y = (rank - 3.5) * 9 * scale;
        a.plane.style.transform = `translate3d(calc(-50% + ${x + px * 3}px),calc(-50% + ${y + py * 2}px),0) rotateY(${-side * (1 - travel * 0.2) * 28}deg) scale(${scale * (mobile ? 0.7 : 1)})`;
        a.plane.style.opacity = alpha;
        a.plane.style.zIndex = String(16 - rank);
      }
    },
  };
}
