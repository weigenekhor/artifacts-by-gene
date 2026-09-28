import { createEpilogue } from "./epilogue.js";
import { createGenesis } from "./genesis.js";
import { createGallery } from "./gallery.js";
import { createStudy } from "./studies.js";
import { apps, homepage } from "./apps.js";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)],
  clamp = (v) => Math.max(0, Math.min(1, v));
const root = document.documentElement,
  hero = $(".genesis"),
  tools = $(".tools-entry"),
  features = $$(".feature"),
  detail = $("#film-detail"),
  collection = [homepage, ...apps];
let raf = 0,
  last = 0,
  frames = 0,
  px = 0,
  py = 0,
  tx = 0,
  ty = 0,
  toolsTop = 0,
  active = -1,
  progress = 0,
  playback = null,
  returnCard = null;
const studies = features.map(() => null),
  preference = matchMedia("(prefers-reduced-motion: reduce)");
let reduced = preference.matches;
root.classList.add("enhanced");
const genesis = createGenesis(hero, wake),
  epilogue = createEpilogue($("#gene")),
  gallery = createGallery($(".app-gallery"), wake, openFilm);
function measure() {
  genesis.measure();
  epilogue.measure();
  toolsTop = tools.offsetTop;
  gallery.measure();
  wake();
}
function syncMotion() {
  reduced = preference.matches;
  root.classList.toggle("reduced", reduced);
  if (reduced) stopPlayback();
  measure();
}
function stopPlayback() {
  if (active >= 0) {
    const b = features[active].querySelector(".study-play");
    b.setAttribute("aria-pressed", "false");
    b.innerHTML = '<span class="play-symbol" aria-hidden="true"></span> Play';
  }
  playback = null;
}
function openFilm(kind, source) {
  const next = features.findIndex((e) => e.id === kind);
  if (next < 0) return;
  stopPlayback();
  if (active >= 0) features[active].classList.remove("is-open");
  active = next;
  progress = 0;
  returnCard = source || document.querySelector(`[data-film="${kind}"]`);
  features[active].classList.add("is-open");
  features[active].firstElementChild.inert = false;
  $("#detail-name").textContent = apps.find(
    (a) => a.id === features[active].dataset.studyApp,
  ).name;
  if (!detail.open) detail.showModal();
  document.body.style.overflow = "hidden";
  studies[active] ??= createStudy(features[active], wake);
  const image = features[active].querySelector(".film-capture img");
  image.loading = "eager";
  image.decode().catch(() => {});
  history.replaceState(null, "", "#" + kind);
  detail.scrollTop = 0;
  $("#detail-close").focus({ preventScroll: true });
  wake();
}
function closeFilm() {
  if (detail.open) detail.close();
}
$("#detail-close").addEventListener("click", closeFilm);
$("#detail-back").addEventListener("click", (e) => {
  e.preventDefault();
  closeFilm();
});
detail.addEventListener("close", () => {
  stopPlayback();
  features[active]?.classList.remove("is-open");
  active = -1;
  document.body.style.overflow = "";
  history.replaceState(null, "", "#collection");
  returnCard?.focus({ preventScroll: true });
  wake();
});
features.forEach((el, i) => {
  el.querySelector(".study-play").addEventListener("click", () => {
    const was = !!playback;
    stopPlayback();
    if (was) {
      wake();
      return;
    }
    progress = 0;
    playback = { start: performance.now(), duration: +el.dataset.playbackMs };
    const b = el.querySelector(".study-play");
    b.setAttribute("aria-pressed", "true");
    b.innerHTML = '<span class="pause-symbol" aria-hidden="true"></span> Pause';
    wake();
  });
  el.querySelector(".study-control input").addEventListener("input", (e) => {
    stopPlayback();
    progress = +e.target.value / 100;
    wake();
  });
});
function tick(time) {
  raf = 0;
  if (document.hidden) return;
  const dt = Math.min(50, time - last || 16);
  last = time;
  frames++;
  const y = scrollY;
  px += (tx - px) * (1 - Math.exp(-dt / 160));
  py += (ty - py) * (1 - Math.exp(-dt / 160));
  let moving = false;
  if (!detail.open) {
    moving = genesis.update(y, time, dt, px, py, reduced);
    epilogue.update(y, reduced);
    const stage = tools.firstElementChild,
      arrived = reduced || y >= toolsTop;
    stage.style.setProperty("--collection-arrival", arrived ? 1 : 0);
    stage.style.setProperty("--collection-labels", arrived ? 1 : 0);
    stage.inert = !arrived;
  }
  moving = gallery.update(y, dt, reduced, detail.open) || moving;
  if (active >= 0) {
    if (playback) {
      progress = clamp((time - playback.start) / playback.duration);
      if (progress === 1) stopPlayback();
    }
    moving =
      studies[active].update(progress, dt, reduced, true, px, py) ||
      moving ||
      !!playback;
  }
  if (moving || Math.abs(px - tx) + Math.abs(py - ty) > 0.001) wake();
}
function wake() {
  if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
}
addEventListener("scroll", wake, { passive: true });
addEventListener("resize", measure, { passive: true });
preference.addEventListener("change", syncMotion);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(raf);
    raf = 0;
  } else wake();
});
if (matchMedia("(pointer:fine)").matches) {
  document.addEventListener(
    "pointermove",
    (e) => {
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
      wake();
    },
    { passive: true },
  );
  hero.addEventListener("pointerleave", () => {
    tx = ty = 0;
    wake();
  });
}
const dialog = $("#capture"),
  capture = $("#capture-image"),
  viewport = $(".capture-viewport");
let returnFocus = null,
  native = false;
function openCapture(id) {
  const a = collection.find((a) => a.id === id);
  if (!a) return;
  returnFocus = document.activeElement;
  native = false;
  viewport.classList.remove("native");
  $("#pixel-view").textContent = "View actual size";
  $("#pixel-view").setAttribute("aria-pressed", "false");
  $("#capture-title").textContent = a.name;
  capture.src = a.evidence.full;
  capture.alt = a.evidence.label + " in " + a.name;
  capture.width = a.evidence.fullWidth;
  capture.height = a.evidence.fullHeight;
  $("#capture-source").href = a.evidence.full;
  $("#capture-size").textContent =
    a.evidence.fullWidth + " × " + a.evidence.fullHeight;
  dialog.showModal();
  document.body.style.overflow = "hidden";
}
$$("[data-capture]").forEach((b) =>
  b.addEventListener("click", () => openCapture(b.dataset.capture)),
);
$("#capture-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  document.body.style.overflow = detail.open ? "hidden" : "";
  returnFocus?.focus({ preventScroll: true });
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
$("#pixel-view").addEventListener("click", () => {
  native = !native;
  viewport.classList.toggle("native", native);
  $("#pixel-view").setAttribute("aria-pressed", String(native));
  $("#pixel-view").textContent = native ? "Fit to view" : "View actual size";
});
$$('a[href^="#"]:not([data-film])').forEach((a) =>
  a.addEventListener("click", (e) => {
    if (a.id === "detail-back") return;
    const to = document.getElementById(a.hash.slice(1));
    if (to && !to.classList.contains("feature")) {
      e.preventDefault();
      to.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
      history.replaceState(null, "", a.hash);
    }
  }),
);
function hashNavigate() {
  const key = location.hash.slice(1),
    match = features.find(
      (e) => e.id === key || e.dataset.studyApp === key.replace(/^app-/, ""),
    );
  if (match) openFilm(match.id);
}
measure();
syncMotion();
document.fonts.ready.then(measure);
addEventListener(
  "load",
  () => {
    measure();
    hashNavigate();
  },
  { once: true },
);
addEventListener("hashchange", hashNavigate);
addEventListener("pagehide", () => {
  cancelAnimationFrame(raf);
  raf = 0;
});
addEventListener("pageshow", (e) => {
  if (e.persisted) measure();
});
window.artifactsExperience = {
  get heroState() {
    return genesis.state;
  },
  get reduced() {
    return reduced;
  },
  get frames() {
    return frames;
  },
  get gallery() {
    return gallery.state;
  },
  openCapture,
  openFilm,
};
