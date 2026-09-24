import { createOriginStory } from "./origin-story.js";
import { apps, homepage } from "./apps.js";
import { createStudy } from "./studies.js";
import { createPrecisionHero } from "./precision-hero.js";
import { createHero } from "./hero.js";
import { createHeroInteraction } from "./hero-interaction.js";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)],
  clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)),
  ease = (v) => {
    v = clamp(v);
    return v * v * (3 - 2 * v);
  };
const root = document.documentElement,
  hero = $(".hero"),
  origin = $(".origin"),
  toolsSection = $(".tools-entry"),
  features = $$(".feature");
const collection = [homepage, ...apps];
const studies = features.map((el) => createStudy(el, wake));
const originStory = createOriginStory(origin, wake);
const silicon = createPrecisionHero($("#silicon"));
const toolsScene = createHero($("#tools-universe"), apps, wake);
let heroMoving = false,
  toolsMoving = false,
  toolsTop = 0,
  toolsHeight = 1;
const preference = matchMedia("(prefers-reduced-motion: reduce)");
let reduced = preference.matches,
  paused = false,
  raf = 0,
  last = 0,
  px = 0,
  py = 0,
  tx = 0,
  ty = 0,
  featureBounds = [],
  heroHeight = 1,
  renderCount = 0;

root.classList.add("enhanced");
const heroInteraction = createHeroInteraction($("#silicon"), wake);
const toolsInteraction = createHeroInteraction($("#tools-universe"), wake);
const motion = $("#motion");
motion.hidden = false;
function motionIcon(stopped) {
  return (
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' +
    (stopped
      ? '<path d="M8 5L19 12 8 19Z" fill="currentColor"/>'
      : '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>') +
    "</svg><span>" +
    (stopped ? "Play" : "Pause") +
    "</span>"
  );
}
function syncMotion() {
  reduced = preference.matches || paused;
  if (reduced) stopPlayback();
  root.classList.toggle("reduced", reduced);
  motion.setAttribute("aria-pressed", String(reduced));
  motion.setAttribute("aria-label", reduced ? "Enable motion" : "Pause motion");
  motion.innerHTML = motionIcon(reduced);
  measure();
}
motion.addEventListener("click", () => {
  paused = !reduced;
  if (preference.matches && !paused) {
    paused = false;
    reduced = false;
    root.classList.remove("reduced");
    motion.setAttribute("aria-pressed", "false");
    motion.setAttribute("aria-label", "Pause motion");
    motion.innerHTML = motionIcon(false);
    measure();
  } else syncMotion();
});
preference.addEventListener("change", syncMotion);
function measure() {
  const y = scrollY;
  heroHeight = hero.offsetHeight;
  silicon.resize();
  toolsScene.resize();
  originStory.measure();
  toolsTop = toolsSection.offsetTop;
  toolsHeight = toolsSection.offsetHeight;
  featureBounds = features.map((el) => ({
    top: el.getBoundingClientRect().top + y,
    height: el.offsetHeight,
    stage: el.firstElementChild.offsetHeight,
  }));
  wake();
}
$("#study-select").addEventListener("change", (e) => {
  const section = document.getElementById(e.target.value);
  section.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
  history.replaceState(null, "", "#" + e.target.value);
});
const manualProgress = new Map();
let playback = null;
function stopPlayback() {
  if (!playback) return;
  const b = features[playback.index].querySelector(".study-play");
  b.setAttribute("aria-pressed", "false");
  b.innerHTML = "<span aria-hidden=true>▷</span> Watch sequence";
  playback = null;
}
features.forEach((el, index) =>
  el.querySelector(".study-play").addEventListener("click", () => {
    const same = playback?.index === index;
    stopPlayback();
    if (same) {
      wake();
      return;
    }
    playback = {
      index,
      start: performance.now(),
      duration: 17000 + (index % 3) * 900,
    };
    el.querySelector(".study-play").setAttribute("aria-pressed", "true");
    el.querySelector(".study-play").innerHTML =
      "<span aria-hidden=true>Ⅱ</span> Pause sequence";
    manualProgress.set(index, 0);
    wake();
  }),
);
features.forEach((el, i) =>
  el.querySelector(".study-control input").addEventListener("input", (e) => {
    stopPlayback();
    manualProgress.set(i, Number(e.target.value) / 100);
    wake();
  }),
);
function tick(time) {
  raf = 0;
  if (document.hidden) return;
  const dt = Math.min(50, time - last || 16);
  last = time;
  renderCount++;
  const y = scrollY;
  px += (tx - px) * (1 - Math.exp(-dt / 160));
  py += (ty - py) * (1 - Math.exp(-dt / 160));
  if (y < heroHeight) {
    const hp = clamp(y / Math.max(1, heroHeight - innerHeight));
    hero.style.setProperty("--hero", reduced ? 0 : hp);
    hero.style.setProperty("--passage", reduced ? 0 : ease((hp - 0.55) / 0.4));
    hero.style.setProperty(
      "--entry-copy",
      reduced ? 1 : 1 - ease((hp - 0.08) / 0.25),
    );
    hero.classList.toggle("past-entry", !reduced && hp > 0.75);

    const interaction = heroInteraction.update(dt, reduced);
    heroMoving =
      silicon.render(time, hp, px, py, reduced, dt, interaction) ||
      interaction.moving;
    hero.style.setProperty("--px", reduced ? 0 : px);
    hero.style.setProperty("--py", reduced ? 0 : py);
  }
  if (y >= heroHeight) heroMoving = false;
  const originMoving = originStory.update(y, reduced, dt);
  toolsMoving = false;
  if (y + innerHeight > toolsTop && y < toolsTop + toolsHeight) {
    const p = clamp((y - toolsTop) / Math.max(1, toolsHeight - innerHeight));
    const interaction = toolsInteraction.update(dt, reduced);
    toolsMoving =
      toolsScene.render(time, p, px, py, reduced, dt, interaction) ||
      interaction.moving;
  }
  if (playback) {
    const p = clamp((time - playback.start) / playback.duration);
    manualProgress.set(playback.index, p);
    if (p === 1) stopPlayback();
  }
  let studyMoving = Boolean(playback);
  features.forEach((el, i) => {
    const b = featureBounds[i];
    if (y + innerHeight < b.top || y > b.top + b.height) return;
    const manual = manualProgress.has(i),
      p = manual
        ? manualProgress.get(i)
        : reduced
          ? 1
          : clamp(
              (y - b.top + innerHeight * 0.18) /
                (Math.max(innerHeight * 0.7, b.height - b.stage) +
                  innerHeight * 0.18),
            );
    studyMoving =
      studies[i].update(p, dt, reduced, manual, px, py) || studyMoving;
  });
  if (
    heroMoving ||
    toolsMoving ||
    originMoving ||
    studyMoving ||
    Math.abs(px - tx) + Math.abs(py - ty) > 0.001
  )
    wake();
}

function wake() {
  if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
}
addEventListener(
  "scroll",
  () => {
    stopPlayback();
    manualProgress.clear();
    wake();
  },
  { passive: true },
);
addEventListener("resize", measure, { passive: true });
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
const picker = $("#study-picker");
let pickerFocus = null;
$$(".study-menu").forEach((b) =>
  b.addEventListener("click", () => {
    pickerFocus = b;
    stopPlayback();
    picker.showModal();
    document.body.style.overflow = "hidden";
  }),
);
$("#picker-close").addEventListener("click", () => picker.close());
picker.addEventListener("close", () => {
  document.body.style.overflow = "";
  pickerFocus?.focus({ preventScroll: true });
});
$$("[data-study-jump]").forEach((a) =>
  a.addEventListener("click", () => picker.close()),
);
picker.addEventListener("click", (e) => {
  if (e.target === picker) {
    const r = picker.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      picker.close();
  }
});
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
dialog.addEventListener("close", () => {
  document.body.style.overflow = "";
  returnFocus?.focus({ preventScroll: true });
});
$("#pixel-view").addEventListener("click", () => {
  native = !native;
  viewport.classList.toggle("native", native);
  $("#pixel-view").setAttribute("aria-pressed", String(native));
  $("#pixel-view").textContent = native ? "Fit to view" : "View actual size";
});
$$('a[href^="#"]:not([data-jump])').forEach((a) =>
  a.addEventListener("click", (e) => {
    const to = document.getElementById(a.hash.slice(1));
    if (to) {
      e.preventDefault();
      to.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
      history.replaceState(null, "", a.hash);
    }
  }),
);
function hashNavigate() {
  if (location.hash.startsWith("#app-")) {
    const id = location.hash.slice(5),
      el = features.find((el) => el.dataset.studyApp === id);
    if (el) el.scrollIntoView({ behavior: "instant" });
    else if (id === "homepage")
      toolsSection.scrollIntoView({ behavior: "instant" });
  }
}
measure();
syncMotion();
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
addEventListener("pageshow", (event) => {
  if (event.persisted) measure();
});
window.artifactsExperience = {
  get heroState() {
    return heroInteraction.state;
  },
  get toolsState() {
    return toolsInteraction.state;
  },
  get reduced() {
    return reduced;
  },
  get frames() {
    return renderCount;
  },
  openCapture,
};
