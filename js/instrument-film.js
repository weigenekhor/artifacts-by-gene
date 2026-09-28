import films from "../content/films.json";
import { drawing, clamp, mix, at } from "./films/drawing.js";
import { renderers } from "./films/renderers.js";
import { createTopography } from "./topography.js";

export function createInstrumentFilm(el, wake) {
  const kind = el.dataset.feature,
    film = films[kind],
    view = el.querySelector(".film-view"),
    capture = el.querySelector(".film-capture"),
    image = capture.querySelector("img"),
    region = JSON.parse(el.dataset.sourceRegion),
    outline = el.querySelector(".film-source-focus");
  const operation = el.querySelector(".film-operation"),
    canvas = operation.querySelector("canvas"),
    ctx = kind === "surface" ? null : canvas.getContext("2d"),
    topography = kind === "surface" ? createTopography(el, wake) : null;
  const title = el.querySelector(".film-statement"),
    heading = el.querySelector(".film-heading"),
    focusInput = el.querySelector(".film-focus"),
    inspection = el.querySelector(".film-inspection"),
    reading = el.querySelector(".film-reading"),
    transport = el.querySelector(".study-control input"),
    alternateButton = el.querySelector(".film-alternate");
  const iw = +image.getAttribute("width"),
    ih = +image.getAttribute("height");
  let w = 1,
    h = 1,
    dpr = 1,
    fit = 1,
    box = null,
    dirty = true,
    p = 0,
    focus = 0.5,
    targetFocus = null,
    alternate = false,
    alternateProgress = 0,
    targets = [],
    reducedBefore = null,
    beat = -1,
    canInspect = false,
    world = { w: 1100, h: 660, scale: 1, x: 0, y: 0 };
  function measure() {
    w = Math.max(1, view.clientWidth);
    h = Math.max(1, operation.clientHeight);
    dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 2);
    fit = Math.min(w / iw, view.clientHeight / ih, 1);
    if (ctx) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    box = view.getBoundingClientRect();
    dirty = true;
    wake();
  }
  new ResizeObserver(measure).observe(view);
  new ResizeObserver(measure).observe(operation);
  document.fonts.ready.then(measure);
  const choose = (value) => {
    if (!canInspect) return;
    targetFocus = clamp(value);
    dirty = true;
    wake();
  };
  focusInput.addEventListener("input", () => choose(+focusInput.value / 100));
  operation.addEventListener("pointerenter", () => {
    box = view.getBoundingClientRect();
  });
  operation.addEventListener("pointermove", (event) => {
    if (!canInspect || event.pointerType !== "mouse" || !box) return;
    const x = (event.clientX - box.left - world.x) / world.scale,
      y = (event.clientY - box.top - world.y) / world.scale;
    if (film.pointer === "x") choose((x / world.w - 0.08) / 0.84);
    else {
      const target = targets.findLast(
        (t) => x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h,
      );
      if (target) choose(target.value);
    }
  });
  operation.addEventListener("pointerleave", () => {
    targetFocus = null;
    dirty = true;
    wake();
  });
  alternateButton?.addEventListener("click", () => {
    alternate = !alternate;
    alternateButton.setAttribute("aria-pressed", String(alternate));
    dirty = true;
    wake();
  });
  el.querySelector(".study-play").addEventListener("click", (event) => {
    if (event.currentTarget.getAttribute("aria-pressed") === "true") return;
    p = 0;
    targetFocus = null;
    alternate = false;
    alternateProgress = 0;
    alternateButton?.setAttribute("aria-pressed", "false");
    dirty = true;
    wake();
  });
  measure();
  function draw(q, reduced) {
    if (topography) {
      world = { w, h, scale: 1, x: 0, y: 0 };
      topography(q, focus, reduced, 0, 0, reduced ? 0 : at(p, 0.875, 0.05));
      return film.choices[
        Math.min(
          film.choices.length - 1,
          Math.floor(focus * film.choices.length),
        )
      ];
    }
    if (!ctx) return "";
    const mobile = w < 600,
      W = mobile ? 600 : 1100,
      H = mobile
        ? Math.min(900, Math.max(540, (h / w) * 600))
        : Math.min(500, Math.max(350, (h / w) * 1100)),
      scale = Math.min(w / W, h / H),
      x = (w - W * scale) / 2,
      y = (h - H * scale) / 2;
    world = { w: W, h: H, scale, x, y };
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    targets = [];
    const hit = (value, x, y, w, h, label) =>
      targets.push({ value, x, y, w, h, label });
    return renderers[kind](
      drawing(ctx, true, mobile),
      q,
      focus,
      W,
      H,
      mobile,
      hit,
      alternateProgress,
    );
  }
  return {
    update(wanted, dt, reduced, manual) {
      if (reducedBefore !== reduced) {
        reducedBefore = reduced;
        measure();
      }
      const target = reduced ? 0.78 : wanted;
      p = reduced
        ? target
        : mix(p, target, 1 - Math.exp(-dt / (manual ? 48 : 66)));
      const q = clamp((p - 0.21) / 0.66),
        inspectTarget = targetFocus ?? mix(0.16, 0.82, at(q, 0.66, 0.2));
      focus = reduced
        ? inspectTarget
        : mix(focus, inspectTarget, 1 - Math.exp(-dt / 110));
      alternateProgress = reduced
        ? Number(alternate)
        : mix(alternateProgress, Number(alternate), 1 - Math.exp(-dt / 190));
      const moving =
        Math.abs(p - target) > 0.0001 ||
        Math.abs(focus - inspectTarget) > 0.0005 ||
        Math.abs(alternateProgress - Number(alternate)) > 0.0005;
      if (!dirty && !moving) return false;
      dirty = false;
      canInspect = reduced || (p > 0.7 && p < 0.9);
      operation.style.pointerEvents = canInspect ? "auto" : "none";
      inspection.inert = !canInspect;
      inspection.style.opacity = canInspect ? "1" : "0";
      focusInput.value = Math.round(focus * 100);
      transport.value = Math.round(p * 100);
      const entry = at(p, 0.2, 0.11),
        exit = at(p, 0.89, 0.067),
        visible = at(p, 0.205, 0.045) * (1 - at(p, 0.925, 0.025));
      const spread = entry * (1 - exit),
        baseX = (w - iw * fit) / 2,
        baseY = (view.clientHeight - ih * fit) / 2;
      const roi = {
        x: baseX + region.left * fit,
        y: baseY + region.top * fit,
        w: region.width * fit,
        h: region.height * fit,
      };
      if (!reduced) {
        capture.style.width = iw * fit + "px";
        capture.style.height = ih * fit + "px";
        capture.style.transform = `translate3d(${baseX}px,${baseY}px,0)`;
        capture.style.opacity =
          1 - at(p, 0.176, 0.028) * (1 - at(p, 0.95, 0.027));
        operation.style.opacity = visible;
        operation.style.transform = `translate3d(${mix(roi.x, 0, spread)}px,${mix(roi.y, 0, spread)}px,0) scale(${mix(roi.w / w, 1, spread)},${mix(roi.h / h, 1, spread)})`;
      } else {
        capture.style.opacity = 1;
        operation.style.opacity = 1;
        operation.style.transform = "none";
      }
      outline.style.left = (region.left / iw) * 100 + "%";
      outline.style.top = (region.top / ih) * 100 + "%";
      outline.style.width = (region.width / iw) * 100 + "%";
      outline.style.height = (region.height / ih) * 100 + "%";
      outline.style.opacity = reduced
        ? 0
        : at(p, 0.08, 0.05) * (1 - at(p, 0.18, 0.025));
      // Statements are occasional; the source and operation hold the stage alone.
      const newBeat = film.beats.findLastIndex((b) => p >= b[0]);
      if (newBeat !== beat) {
        beat = newBeat;
        title.textContent = film.beats[beat][1];
      }
      const start = film.beats[beat][0];
      heading.style.opacity = reduced
        ? 0
        : at(p, start, 0.025) * (1 - at(p, start + 0.13, 0.045));
      const result =
        reduced || visible > 0.002 ? draw(reduced ? 0.83 : q, reduced) : "";
      if (reading.textContent !== result) reading.textContent = result;
      return moving;
    },
  };
}
