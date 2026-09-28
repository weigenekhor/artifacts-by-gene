import comparison from "../content/papyrus.json";
import { compose } from "./films/composition.js";
import { at, mix, clamp, drawing } from "./films/drawing.js";
import { compare as drawComparison } from "./films/records.js";

// The current source is text-mode. The middle demonstrates the separately verified XML mode.
export function createPapyrusStudy(el, wake) {
  const view = el.querySelector(".papyrus-view"),
    capture = el.querySelector(".papyrus-capture"),
    surface = el.querySelector(".papyrus-comparison");
  const canvas = surface.querySelector("canvas"),
    ctx = canvas.getContext("2d"),
    heading = el.querySelector(".papyrus-heading"),
    statement = el.querySelector(".papyrus-statement");
  const focus = el.querySelector(".papyrus-source-focus"),
    inspection = el.querySelector(".papyrus-inspection"),
    reading = el.querySelector(".papyrus-reading");
  const control = el.querySelector(".study-control input"),
    buttons = [...el.querySelectorAll("[data-difference]")];
  const beforeButton = document.createElement("button");
  beforeButton.className = "film-before";
  beforeButton.textContent = "Show starting state";
  beforeButton.setAttribute("aria-pressed", "false");
  inspection.append(beforeButton);
  let p = 0,
    selected = 2,
    before = false,
    canInspect = false,
    dirty = true,
    lastReduced = null,
    w = 1,
    h = 1,
    dpr = 1,
    bounds = { x: 0, y: 0, w: 1, h: 1 };
  const source = comparison.source;
  function measure() {
    if (!document.documentElement.classList.contains("reduced"))
      bounds = compose("comparison", view, surface, heading);
    else
      for (const prop of ["left", "top", "width", "height"])
        surface.style.removeProperty(prop);
    w = surface.clientWidth;
    h = surface.clientHeight;
    dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    dirty = true;
    wake();
  }
  new ResizeObserver(measure).observe(view);
  new ResizeObserver(measure).observe(surface);
  document.fonts.ready.then(measure);
  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      if (!canInspect) return;
      selected = comparison.rows.findIndex(
        (r) => r.id === b.dataset.difference,
      );
      dirty = true;
      wake();
    }),
  );
  beforeButton.addEventListener("click", () => {
    before = !before;
    beforeButton.setAttribute("aria-pressed", String(before));
    beforeButton.textContent = before
      ? "Show resolved state"
      : "Show starting state";
    dirty = true;
    wake();
  });
  el.querySelector(".study-play").addEventListener("click", (e) => {
    if (e.currentTarget.getAttribute("aria-pressed") === "true") return;
    p = 0;
    selected = 2;
    dirty = true;
    wake();
  });
  function draw(q) {
    const m = innerWidth < 700,
      W = m ? 600 : 1100,
      H = m
        ? Math.min(850, Math.max(540, (h / w) * 600))
        : Math.min(580, Math.max(430, (h / w) * 1100));
    const scale = Math.min(w / W, h / H);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.translate((w - W * scale) / 2, (h - H * scale) / 2);
    ctx.scale(scale, scale);
    drawComparison(drawing(ctx, false, m), q, selected, W, H, m, comparison);
  }
  measure();
  return {
    update(wanted, dt, reduced, manual) {
      if (lastReduced !== reduced) {
        lastReduced = reduced;
        measure();
      }
      const target = reduced ? 0.78 : wanted;
      p = reduced
        ? target
        : mix(p, target, 1 - Math.exp(-dt / (manual ? 48 : 66)));
      const moving = Math.abs(p - target) > 0.0001;
      if (!dirty && !moving) return false;
      dirty = false;
      const q = clamp((p - 0.21) / 0.66),
        visible = at(p, 0.205, 0.045) * (1 - at(p, 0.925, 0.025));
      canInspect = reduced || (p > 0.7 && p < 0.9);
      inspection.inert = !canInspect;
      inspection.style.opacity = canInspect ? 1 : 0;
      control.value = Math.round(p * 100);
      const fit = Math.min(
          view.clientWidth / source.width,
          view.clientHeight / source.height,
          1,
        ),
        x = (view.clientWidth - source.width * fit) / 2,
        y = (view.clientHeight - source.height * fit) / 2;
      if (!reduced) {
        capture.style.width = source.width * fit + "px";
        capture.style.height = source.height * fit + "px";
        capture.style.transform = `translate3d(${x}px,${y}px,0)`;
      }
      capture.style.opacity = reduced
        ? 1
        : 1 - at(p, 0.235, 0.065) * (1 - at(p, 0.92, 0.04));
      surface.style.opacity = reduced ? 1 : visible;
      const roi = source.comparison;
      Object.assign(focus.style, {
        left: (roi.x / source.width) * 100 + "%",
        top: (roi.y / source.height) * 100 + "%",
        width: (roi.width / source.width) * 100 + "%",
        height: (roi.height / source.height) * 100 + "%",
        opacity: reduced ? 0 : at(p, 0.08, 0.05) * (1 - at(p, 0.18, 0.025)),
      });
      statement.textContent = "Position changes. Identity stays.";
      heading.style.opacity = reduced
        ? 0
        : at(p, 0.13, 0.035) * (1 - at(p, 0.29, 0.04));
      if (visible > 0.002 || reduced)
        draw(reduced ? (before ? 0.12 : 0.83) : q);
      const row = comparison.rows[selected];
      reading.textContent = `${row.property} ${row.left} → ${row.right}`;
      buttons.forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.difference === row.id)),
      );
      return moving;
    },
  };
}
