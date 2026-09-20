import { apps } from "./apps.js";
import { createWorld } from "./world.js";
import { clamp, ease, mix } from "./forms.js";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const root = document.documentElement,
  journey = $(".journey"),
  stage = $(".stage"),
  atlas = $(".atlas");
const chapters = $$(".chapter"),
  ids = ["enter", "friction", "structure", "system", "ecosystem"];
// Native scroll is the only clock: four story beats, then sixteen reading intervals.
const LAST = 19,
  HOLD = 0.29,
  captions = [
    "A field of possibilities.",
    "The effort before the insight.",
    "Repeated effort becomes a reusable method.",
    "Built one problem at a time.",
  ];
const media = matchMedia("(prefers-reduced-motion: reduce)");
let reduced = media.matches,
  world,
  step = 1,
  progress = 0,
  target = 0,
  active = -1,
  selected = null;
let frame = 0,
  last = 0,
  visible = true,
  px = 0,
  py = 0,
  tx = 0,
  ty = 0,
  velocity = 0,
  lastScroll = scrollY,
  study = 1,
  manualStudy = false;
try {
  if (sessionStorage.getItem("artifacts-motion") === "off") reduced = true;
} catch {}
root.classList.add("enhanced");
const startTime = performance.now(),
  motion = $("#motion");
motion.hidden = false;
function updateMotion() {
  root.classList.toggle("reduced", reduced);
  motion.setAttribute("aria-pressed", String(!reduced));
  motion.setAttribute(
    "aria-label",
    reduced ? "Turn motion on" : "Turn motion off",
  );
  wake();
}
motion.addEventListener("click", () => {
  reduced = !reduced;
  try {
    sessionStorage.setItem("artifacts-motion", reduced ? "off" : "on");
  } catch {}
  updateMotion();
});
media.addEventListener("change", (e) => {
  reduced = e.matches;
  updateMotion();
});
let measured = false;
function measure() {
  const previousStep = step,
    previousTarget = target;
  const withinJourney = measured && scrollY <= previousStep * LAST + 1;
  step = Math.max(
    1,
    (journey.offsetHeight -
      stage.offsetHeight -
      parseFloat(getComputedStyle(journey).paddingTop)) /
      LAST,
  );
  $$(".anchors span").forEach((el, i) => (el.style.top = step * i + "px"));
  // Keep the same application when a device rotates or its viewport changes.
  if (withinJourney && Math.abs(step - previousStep) > 0.5) {
    scrollTo({ top: previousTarget * step, behavior: "instant" });
    target = previousTarget;
  } else target = clamp(scrollY / step, 0, LAST);
  measured = true;
  world?.resize();
  wake();
}

function go(index, instant = false) {
  scrollTo({
    top: step * index,
    behavior: reduced || instant ? "instant" : "smooth",
  });
}
function navigateApp(id, instant = false) {
  const i = apps.findIndex((a) => a.id === id);
  if (i < 0) return;
  history.replaceState(null, "", "#app/" + id);
  go(i + 4, instant);
}
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    if (id.startsWith("app/")) {
      e.preventDefault();
      navigateApp(id.slice(4));
      return;
    }
    if (ids.includes(id)) {
      e.preventDefault();
      history.replaceState(null, "", "#" + id);
      go(ids.indexOf(id));
    }
  }),
);
$$("[data-app]").forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    navigateApp(a.dataset.app);
  }),
);
$("#app-select").addEventListener("change", (e) => navigateApp(e.target.value));
function next(delta) {
  if (!selected) return;
  const i = selected.index - 1 + delta;
  if (i >= apps.length) {
    location.hash = "index";
    return;
  }
  navigateApp(apps[Math.max(0, i)].id);
}
$("#previous").addEventListener("click", () => next(-1));
$("#next").addEventListener("click", () => next(1));
atlas.addEventListener("keydown", (e) => {
  if (/INPUT|SELECT/.test(e.target.tagName)) return;
  if (["ArrowRight", "ArrowLeft"].includes(e.key)) {
    e.preventDefault();
    next(e.key === "ArrowRight" ? 1 : -1);
  }
});
$("#study").addEventListener("input", (e) => {
  manualStudy = true;
  study = Number(e.target.value) / 100;
  wake();
});
const actions = {
  topology: "Reveal the surface",
  comparison: "Align equivalent steps",
  configuration: "Align configurations",
  diagnosis: "Converge on a cause",
  usage: "Accumulate usage",
  difference: "Balance the arrangement",
  zones: "Explore zone depth",
  signals: "Reveal signal variation",
  compilation: "Resolve the inputs",
  report: "Assemble the report",
  schedule: "Synchronize the timelines",
  maintenance: "Align status and schedule",
  history: "Align the history",
  pathfinder: "Connect parameters to charts",
};
const figures = $$(".software-frame");
function loadImage(i) {
  const img = figures[i]?.querySelector("img");
  if (img && !img.getAttribute("src")) img.src = img.dataset.src;
}
function setApp(app) {
  selected = app;
  manualStudy = false;
  $("#app-category").textContent = app.category.replace(" - ", " / ");
  $("#app-name").textContent = app.name;
  $("#atlas-title").textContent = app.headline;
  $("#app-purpose").textContent = app.purpose;
  $("#transformation").textContent = app.transformation;
  $("#study-action").textContent =
    actions[app.visualConcept] || "Reveal parameter variation";
  $("#app-position").textContent = String(app.index).padStart(2, "0") + " / 16";
  $("#app-select").value = app.id;
  $("#previous").disabled = app.index === 1;
  $("#next-label").textContent =
    app.index < 16
      ? "Continue scrolling · " + apps[app.index].name
      : "The complete ecosystem follows";
  figures.forEach((el, i) => (el.hidden = i !== app.index - 1));
  [app.index - 2, app.index - 1, app.index].forEach(loadImage);
  $$("[data-jump]").forEach((a, i) => {
    if (i === app.index - 1) a.setAttribute("aria-current", "step");
    else a.removeAttribute("aria-current");
    a.classList.toggle("visited", i < app.index - 1);
  });
}
function updateScene(p) {
  const index = Math.round(p),
    isApp = index >= 4;
  if (index !== active) {
    active = index;
    chapters.forEach((el, i) => {
      const show = i === index;
      el.classList.toggle("current", show);
      el.inert = !show;
      el.setAttribute("aria-hidden", String(!show));
    });
    atlas.classList.toggle("current", isApp);
    atlas.inert = !isApp;
    atlas.setAttribute("aria-hidden", String(!isApp));
    const worldHost = $("#world"),
      before = worldHost.getBoundingClientRect(),
      wasApp = stage.classList.contains("app-open");
    stage.classList.toggle("app-open", isApp);
    if (wasApp !== isApp) world?.resize();
    if (wasApp !== isApp && !reduced) {
      worldHost.getAnimations().forEach((a) => a.cancel());
      const after = worldHost.getBoundingClientRect();
      worldHost.animate(
        [
          {
            transformOrigin: "0 0",
            transform:
              "translate(" +
              (before.x - after.x) +
              "px," +
              (before.y - after.y) +
              "px) scale(" +
              before.width / after.width +
              "," +
              before.height / after.height +
              ")",
          },
          { transformOrigin: "0 0", transform: "none" },
        ],
        { duration: 620, easing: "cubic-bezier(.22,.7,.18,1)" },
      );
    }
    if (isApp) setApp(apps[index - 4]);
    else selected = null;
    $(".stage-caption").textContent = captions[index] || "";
    $$(".chapter-nav a").forEach((a, i) => {
      if (i === Math.min(index, 4)) a.setAttribute("aria-current", "step");
      else a.removeAttribute("aria-current");
    });

    if (index === 3) loadImage(0);
  }
  const distance = p - index,
    travel = reduced
      ? 0
      : Math.sign(distance) * ease((Math.abs(distance) - HOLD) / (0.5 - HOLD));
  if (isApp) {
    const figure = figures[index - 4];
    const phase =
      reduced || study > 0.88
        ? "The result"
        : study < 0.12
          ? "The starting point"
          : "The work, taking shape";
    $("#study-phase").textContent = phase;
    // The complete interface rests in the pixel plane. Perspective is only a handoff.
    figure.style.transform =
      Math.abs(travel) < 0.001
        ? "none"
        : `perspective(1800px) translate3d(${travel * -38}px,0,${-Math.abs(travel) * 130}px) rotateY(${travel * 5}deg)`;
    figure.style.opacity = String(1 - Math.abs(travel));
    $(".atlas-copy").style.opacity = String(1 - Math.abs(travel));
    if (!manualStudy) {
      study = reduced ? 1 : ease((distance + 0.32) / 0.52);
      $("#study").value = String(Math.round(study * 100));
    }
  } else {
    const el = chapters[index];
    el.style.transform = reduced
      ? "none"
      : `perspective(1400px) translate3d(${-travel * 45}px,0,${-Math.abs(travel) * 100}px) rotateY(${-travel * 5}deg)`;
    el.style.clipPath =
      Math.abs(travel) < 0.001
        ? "none"
        : `inset(0 ${distance < 0 ? Math.abs(travel) * 100 : 0}% 0 ${distance > 0 ? Math.abs(travel) * 100 : 0}%)`;
  }
}
const dialog = $("#inspector"),
  capture = $("#capture-image");
let proofApp,
  native = false,
  returnFocus;
function paintCapture() {
  capture.src = proofApp.evidence.full;
  capture.alt = "Complete " + proofApp.name + " interface";
  capture.width = proofApp.evidence.fullWidth;
  capture.height = proofApp.evidence.fullHeight;
  capture.style.width = native ? proofApp.evidence.fullWidth + "px" : "";
  $(".capture-viewport").classList.toggle("native", native);
  $("#pixel-view").setAttribute("aria-pressed", String(native));
  $("#pixel-view").textContent = native ? "Fit to view ↙" : "Actual size ↗";
  $("#capture-download").href = proofApp.evidence.full;
}
function openCapture(id) {
  proofApp = apps.find((a) => a.id === id);
  if (!proofApp) return;
  returnFocus = document.activeElement;
  native = false;
  $("#capture-title").textContent = proofApp.name;
  paintCapture();
  dialog.showModal();
  document.body.style.overflow = "hidden";
}
$$("[data-proof]").forEach((b) =>
  b.addEventListener("click", () => openCapture(b.dataset.proof)),
);
$("#close-inspector").addEventListener("click", () => dialog.close());
$("#pixel-view").addEventListener("click", () => {
  native = !native;
  paintCapture();
});
dialog.addEventListener("close", () => {
  document.body.style.overflow = "";
  returnFocus?.focus({ preventScroll: true });
  wake();
});
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
});
function tick(time) {
  frame = 0;
  if (document.hidden || !visible) return;
  const dt = Math.min(time - last || 16, 50);
  last = time;
  progress = reduced
    ? Math.round(target)
    : mix(progress, target, 1 - Math.exp(-dt / 55));
  px = mix(px, tx, 1 - Math.exp(-dt / 220));
  py = mix(py, ty, 1 - Math.exp(-dt / 220));
  velocity *= Math.exp(-dt / 100);
  updateScene(progress);
  const intro = reduced || target > 0.02 ? 1 : ease((time - startTime) / 1800);
  const unsettled = world?.render({
    progress: Math.min(progress, 4),
    selected,
    study,
    px,
    py,
    velocity,
    reduced,
    time,
    intro,
    scenePhase: selected ? progress - Math.round(progress) : 0,
  });
  if (
    intro < 1 ||
    unsettled ||
    (!reduced && Math.abs(target - progress) > 0.0003) ||
    Math.abs(px - tx) + Math.abs(py - ty) > 0.0003 ||
    Math.abs(velocity) > 0.001
  )
    wake();
}
function wake() {
  if (!frame && visible && !document.hidden)
    frame = requestAnimationFrame(tick);
}
window.addEventListener(
  "scroll",
  () => {
    target = clamp(scrollY / step, 0, LAST);
    velocity = clamp((scrollY - lastScroll) / 60, -1, 1);
    lastScroll = scrollY;
    wake();
  },
  { passive: true },
);
window.addEventListener("resize", measure, { passive: true });
if (matchMedia("(pointer:fine)").matches) {
  stage.addEventListener(
    "pointermove",
    (e) => {
      if (reduced) return;
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
      wake();
    },
    { passive: true },
  );
  stage.addEventListener("pointerleave", () => {
    tx = ty = 0;
    wake();
  });
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(frame);
    frame = 0;
  } else {
    last = 0;
    wake();
  }
});
new IntersectionObserver(
  ([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  },
  { threshold: 0 },
).observe(stage);
$("#world").addEventListener("worldrestore", wake);
measure();
updateMotion();
function hashRoute() {
  const id = location.hash.slice(1);
  if (id.startsWith("app/")) navigateApp(id.slice(4), true);
  else if (ids.includes(id)) go(ids.indexOf(id), true);
}
window.addEventListener("hashchange", hashRoute);
hashRoute();
createWorld($("#world"))
  .then((w) => {
    world = w;
    measure();
    wake();
  })
  .catch(() => root.classList.add("world-unavailable"));
window.addEventListener("pagehide", (e) => {
  if (!e.persisted) world?.dispose();
});
Object.defineProperty(window, "artifactsExperience", {
  get: () => ({
    progress,
    target,
    selected: selected?.id || null,
    reduced,
    active,
    step,
    world: world?.stats,
  }),
});
