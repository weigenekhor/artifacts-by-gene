import { apps } from "./apps.js";
import { createWorld } from "./world.js";
import { clamp, ease, mix } from "./forms.js";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const root = document.documentElement,
  journey = $(".journey"),
  stage = $(".stage"),
  chapters = $$(".chapter"),
  atlas = $(".atlas"),
  links = $$(".chapter-nav a");
const ids = ["enter", "friction", "structure", "system", "ecosystem"];
const captions = [
  "Engineering software, considered as a whole.",
  "Repeated tasks. Disconnected context.",
  "Papyrus Reader / logical recipe comparison",
  "Individual tools, a shared environment.",
  "Sixteen applications / four Expeditions",
];
const media = matchMedia("(prefers-reduced-motion: reduce)");
let reduced = media.matches,
  selected = null,
  world,
  range = 1,
  progress = 0,
  target = 0,
  frame = 0,
  last = 0,
  px = 0,
  py = 0,
  tx = 0,
  ty = 0,
  velocity = 0,
  lastScroll = scrollY,
  study = 1,
  active = -1,
  visible = true;
let savedPreference = null;
try {
  savedPreference = sessionStorage.getItem("artifacts-motion");
} catch {}
const startTime = performance.now();
if (savedPreference === "off") reduced = true;
root.classList.add("enhanced");
const heroTitle = $(".chapter h1");
heroTitle.innerHTML = [...heroTitle.textContent]
  .map((letter, i) => '<span style="--i:' + i + '">' + letter + "</span>")
  .join("");
const motion = $("#motion");
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
function measure() {
  range = Math.max(1, journey.offsetHeight - stage.offsetHeight);
  $$(".anchors span").forEach(
    (el, i) => (el.style.top = (range * i) / 4 + "px"),
  );
  world?.resize();
  target = clamp(scrollY / range) * 4;
  wake();
}
function go(index, instant = false) {
  window.scrollTo({
    top: (range * index) / 4,
    behavior: reduced || instant ? "instant" : "smooth",
  });
}
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1),
      index = ids.indexOf(id);
    if (index < 0) return;
    e.preventDefault();
    if (index === 4) setApp(null, false);
    history.replaceState(null, "", "#" + id);
    go(index);
  }),
);
function setApp(id, updateHash = true) {
  selected = apps.find((a) => a.id === id) || null;
  stage.classList.toggle("app-open", !!selected);
  $(".app-details").hidden = !selected;
  $(".app-navigation").hidden = !selected;
  $(".study-caption").hidden = !selected;
  $(".node-map").inert = !!selected;
  if (selected) {
    $("#app-category").textContent = selected.category.replace(" - ", " / ");
    $("#atlas-title").textContent = selected.name;
    $("#app-purpose").textContent = selected.purpose;
    $("#transformation").textContent = selected.transformation;
    $("#app-position").textContent =
      String(selected.index).padStart(2, "0") + " / 16";
    $("#app-select").value = selected.id;
    $("#capture-thumbnail").src = selected.evidence.src;
    $("#study-label").textContent = selected.transformation;
    $("#study").value = "100";
    study = 1;
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
    $("#study-action").textContent =
      actions[selected.visualConcept] || "Reveal parameter variation";
  } else {
    $("#app-category").textContent = "04 / The ecosystem";
    $("#atlas-title").innerHTML =
      "Engineering<br>is complex.<br><em>Execution<br>shouldn’t be.</em>";
    $("#app-purpose").innerHTML =
      "Sixteen ways to remove friction.<br>Select an application to explore its work.";
  }
  if (updateHash)
    history.replaceState(
      null,
      "",
      selected ? "#app/" + selected.id : "#ecosystem",
    );
  world?.resize();
  wake();
}
$$("[data-app]").forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    setApp(a.dataset.app);
    $("#atlas-title").tabIndex = -1;
    $("#atlas-title").focus({ preventScroll: true });
  }),
);
$("#overview").addEventListener("click", () => {
  const id = selected?.id;
  setApp(null);
  $('[data-app="' + id + '"]')?.focus({ preventScroll: true });
});
$("#app-select").addEventListener("change", (e) => setApp(e.target.value));
function next(delta) {
  if (!selected) return;
  setApp(apps[(selected.index - 1 + delta + apps.length) % apps.length].id);
}
$("#previous").addEventListener("click", () => next(-1));
$("#next").addEventListener("click", () => next(1));
atlas.addEventListener("keydown", (e) => {
  if (!selected || /INPUT|SELECT/.test(e.target.tagName)) return;
  if (e.key === "ArrowRight") {
    e.preventDefault();
    next(1);
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    next(-1);
  }
});
$("#study").addEventListener("input", (e) => {
  study = Number(e.target.value) / 100;
  wake();
});

const dialog = $("#inspector"),
  capture = $("#capture-image");
let proofApp = null,
  full = false,
  native = false,
  returnFocus;
function paintCapture() {
  if (!proofApp) return;
  const e = proofApp.evidence;
  capture.src = full ? e.full : e.src;
  capture.alt =
    (full ? "Full interface" : "Focused detail") + " of " + proofApp.name;
  const w = full ? e.fullWidth : e.width;
  capture.style.width = w / devicePixelRatio + "px";
  $(".capture-viewport").classList.toggle("native", native);
  $("#detail-view").setAttribute("aria-pressed", String(!full));
  $("#full-view").setAttribute("aria-pressed", String(full));
  $("#pixel-view").setAttribute("aria-pressed", String(native));
}
function openCapture(id) {
  proofApp = apps.find((a) => a.id === id);
  if (!proofApp) return;
  returnFocus = document.activeElement;
  full = false;
  native = false;
  $("#capture-title").textContent = proofApp.name;
  paintCapture();
  dialog.showModal();
  document.body.style.overflow = "hidden";
}
$("#capture").addEventListener("click", () => openCapture(selected?.id));
$$("[data-proof]").forEach((b) =>
  b.addEventListener("click", () => openCapture(b.dataset.proof)),
);
$("#close-inspector").addEventListener("click", () => dialog.close());
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
$("#detail-view").addEventListener("click", () => {
  full = false;
  paintCapture();
});
$("#full-view").addEventListener("click", () => {
  full = true;
  paintCapture();
});
$("#pixel-view").addEventListener("click", () => {
  native = !native;
  paintCapture();
});

function updateText(p) {
  const index = Math.round(p);
  if (index !== active) {
    if (active === 4 && index !== 4 && selected) setApp(null, false);
    active = index;
    chapters.forEach((el, i) => {
      const show = i === index;
      el.classList.toggle("current", show);
      el.inert = !show;
      el.setAttribute("aria-hidden", String(!show));
    });
    atlas.classList.toggle("current", index === 4);
    atlas.inert = index !== 4;
    atlas.setAttribute("aria-hidden", String(index !== 4));
    links.forEach((a, i) => {
      if (i === index) a.setAttribute("aria-current", "step");
      else a.removeAttribute("aria-current");
    });
    $(".stage-caption").textContent = captions[index];
    $(".scroll-cue").style.visibility = index === 4 ? "hidden" : "visible";
    world?.resize();
  }
  chapters.forEach((el, i) => {
    if (i !== index) return;
    const d = p - i;
    const travel = reduced
      ? 0
      : Math.sign(d) * ease((Math.abs(d) - 0.23) / 0.29);
    el.style.transform =
      "perspective(1300px) translate3d(" +
      -travel * 40 +
      "px,0," +
      -Math.abs(travel) * 160 +
      "px) rotateY(" +
      travel * -8 +
      "deg)";
    el.style.clipPath =
      Math.abs(travel) < 0.001
        ? "none"
        : "inset(0 " +
          (d < 0 ? Math.abs(travel) * 100 : 0) +
          "% 0 " +
          (d > 0 ? Math.abs(travel) * 100 : 0) +
          "%)";
  });
}
function tick(time) {
  frame = 0;
  if (document.hidden || !visible) return;
  const dt = Math.min(time - last || 16, 50);
  last = time;
  progress = reduced
    ? Math.round(target)
    : mix(progress, target, 1 - Math.exp(-dt / 65));
  px = mix(px, tx, 1 - Math.exp(-dt / 220));
  py = mix(py, ty, 1 - Math.exp(-dt / 220));
  velocity *= Math.exp(-dt / 100);
  updateText(progress);
  const intro = reduced || target > 0.02 ? 1 : ease((time - startTime) / 2000);
  const unsettled = world?.render({
    progress,
    selected,
    study,
    px,
    py,
    velocity,
    reduced,
    time,
    intro,
  });
  if (
    intro < 1 ||
    unsettled ||
    (Math.abs(target - progress) > 0.0003 && !reduced) ||
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
    target = clamp(scrollY / range) * 4;
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
  if (id.startsWith("app/")) {
    setApp(id.slice(4), false);
    go(4, true);
  } else if (ids.includes(id)) {
    setApp(null, false);
    go(ids.indexOf(id), true);
  }
}
window.addEventListener("hashchange", hashRoute);
hashRoute();
createWorld($("#world"))
  .then((w) => {
    world = w;
    measure();
    wake();
  })
  .catch((error) => {
    console.warn(
      "3D unavailable; the catalogue and original software remain accessible.",
      error.message,
    );
  });
window.addEventListener("pagehide", (e) => {
  if (!e.persisted) world?.dispose();
});
// Read-only diagnostics used by the performance checks.
Object.defineProperty(window, "artifactsExperience", {
  get: () => ({
    progress,
    target,
    selected: selected?.id || null,
    reduced,
    active,
    world: world?.stats,
  }),
});
