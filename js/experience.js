import { apps, homepage } from "./apps.js";
import { createStudy } from "./studies.js";
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
  archive = $(".archive"),
  stage = $(".archive-stage"),
  features = $$(".feature"),
  frames = $$(".archive-images figure"),
  rail = $$(".archive-rail a");
const collection = [homepage, ...apps],
  lastCapture = collection.length - 1;
const studies = features.map(createStudy);
const silicon = createHero($("#silicon"));
let heroMoving = false;
const preference = matchMedia("(prefers-reduced-motion: reduce)");
let reduced = preference.matches,
  paused = false,
  raf = 0,
  last = 0,
  px = 0,
  py = 0,
  tx = 0,
  ty = 0,
  target = 0,
  current = 0,
  active = -1,
  archiveTop = 0,
  archiveStep = 1,
  featureBounds = [],
  originBounds = {},
  heroHeight = 1,
  renderCount = 0;
let measured = false;
root.classList.add("enhanced");
const heroInteraction = createHeroInteraction(apps, wake);
const motion = $("#motion");
motion.hidden = false;
function syncMotion() {
  reduced = preference.matches || paused;
  if (reduced) stopPlayback();
  root.classList.toggle("reduced", reduced);
  motion.setAttribute("aria-pressed", String(reduced));
  motion.setAttribute("aria-label", reduced ? "Enable motion" : "Pause motion");
  motion.textContent = reduced ? "▷" : "Ⅱ";
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
    motion.textContent = "Ⅱ";
    wake();
  } else syncMotion();
});
preference.addEventListener("change", syncMotion);
function measure() {
  const y = scrollY,
    header = $(".header").offsetHeight,
    position = (y - archiveTop) / archiveStep,
    preserve = measured && position >= 0 && position <= lastCapture;
  heroHeight = hero.offsetHeight;
  silicon.resize();
  originBounds = {
    top: origin.getBoundingClientRect().top + y,
    height: origin.offsetHeight,
  };
  featureBounds = features.map((el) => ({
    top: el.getBoundingClientRect().top + y,
    height: el.offsetHeight,
    stage: el.firstElementChild.offsetHeight,
  }));
  archiveTop = archive.getBoundingClientRect().top + y - header;
  archiveStep = Math.max(
    1,
    (archive.offsetHeight - stage.offsetHeight) / lastCapture,
  );
  target = clamp((y - archiveTop) / archiveStep, 0, lastCapture);
  if (preserve) {
    scrollTo({ top: archiveTop + position * archiveStep, behavior: "instant" });
    target = position;
  }
  measured = true;
  wake();
}
$("#study-select").addEventListener("change", (e) => {
  const section = document.getElementById(e.target.value);
  section.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
  history.replaceState(null, "", "#" + e.target.value);
});
function selectApp(index) {
  index = clamp(index, 0, lastCapture);
  const a = collection[index];
  $("#archive-name").textContent = a.name;
  $("#archive-purpose").textContent = a.purpose;
  $("#archive-group").textContent =
    index === 0 ? "The starting point" : a.category.split(" - ")[1];
  $("#archive-number").textContent =
    index === 0 ? "Home" : String(index).padStart(2, "0");
  $("#previous-app").disabled = index === 0;
  $("#next-app").disabled = index === lastCapture;
  rail.forEach((r, i) => r.setAttribute("aria-current", String(i === index)));
  active = index;
}
function goApp(i, instant = false) {
  i = clamp(i, 0, lastCapture);
  scrollTo({
    top: archiveTop + i * archiveStep,
    behavior: reduced || instant ? "instant" : "smooth",
  });
  history.replaceState(null, "", "#app-" + collection[i].id);
}
rail.forEach((a, i) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    goApp(i);
  }),
);
$("#previous-app").addEventListener("click", () => goApp(active - 1));
$("#next-app").addEventListener("click", () => goApp(active + 1));
let touchStart = null;
$(".archive-images").addEventListener(
  "touchstart",
  (e) => {
    touchStart = [e.touches[0].clientX, e.touches[0].clientY];
  },
  { passive: true },
);
$(".archive-images").addEventListener(
  "touchend",
  (e) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart[0],
      dy = e.changedTouches[0].clientY - touchStart[1];
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5)
      goApp(active + (dx < 0 ? 1 : -1));
    touchStart = null;
  },
  { passive: true },
);
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
      duration: 14500 + (index % 3) * 1500,
    };
    el.querySelector(".study-play").setAttribute("aria-pressed", "true");
    el.querySelector(".study-play").innerHTML =
      "<span aria-hidden=true>Ⅱ</span> Pause sequence";
    manualProgress.set(index, 0);
    wake();
  }),
);
features.forEach((el, i) =>
  el.querySelector("input[type=range]").addEventListener("input", (e) => {
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
  target = clamp((y - archiveTop) / archiveStep, 0, lastCapture);
  current = reduced
    ? target
    : current + (target - current) * (1 - Math.exp(-dt / 85));
  px += (tx - px) * (1 - Math.exp(-dt / 160));
  py += (ty - py) * (1 - Math.exp(-dt / 160));
  if (y < heroHeight) {
    const hp = clamp(y / Math.max(1, heroHeight - innerHeight));
    hero.style.setProperty("--hero", reduced ? 0 : hp);
    const interaction = heroInteraction.update(dt, reduced);
    heroMoving =
      silicon.render(time, hp, px, py, reduced, dt, interaction) ||
      interaction.moving;
    hero.style.setProperty("--px", reduced ? 0 : px);
    hero.style.setProperty("--py", reduced ? 0 : py);
  }
  if (y >= heroHeight) heroMoving = false;
  const op = clamp(
    (y - originBounds.top + innerHeight * 0.4) / (originBounds.height * 0.65),
  );
  origin.style.setProperty("--origin", op);
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
  // Leave a readable frontal hold around each app; travel happens between holds.
  const shown = Math.floor(current) + ease(((current % 1) - 0.22) / 0.56),
    idx = Math.round(current);
  if (active !== idx) selectApp(idx);
  frames.forEach((f, i) => {
    const d = i - shown;
    f.classList.toggle("near", Math.abs(d) < 1.2);
    f.classList.toggle("active", i === idx);
    f.inert = i !== idx;
    f.setAttribute("aria-hidden", String(i !== idx));
    if (Math.abs(d) < 1.2) {
      f.style.setProperty("--offset", reduced ? 0 : d);
      f.style.setProperty("--abs", reduced ? (i === idx ? 0 : 1) : Math.abs(d));
    }
  });
  if (
    heroMoving ||
    studyMoving ||
    Math.abs(current - target) > 0.001 ||
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
$$(".app-node").forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    openCapture(a.dataset.app);
  }),
);
$("#archive-open").addEventListener("click", () =>
  openCapture(collection[Math.max(0, active)].id),
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
addEventListener("keydown", (e) => {
  if (dialog.open || picker.open || e.target.matches("button,input,select"))
    return;
  if (
    scrollY >= archiveTop - 20 &&
    scrollY <= archiveTop + lastCapture * archiveStep + 20 &&
    ["ArrowLeft", "ArrowRight"].includes(e.key)
  ) {
    e.preventDefault();
    goApp(active + (e.key === "ArrowRight" ? 1 : -1));
  }
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
    const i = collection.findIndex((a) => "#app-" + a.id === location.hash);
    if (i >= 0) goApp(i, true);
  }
}
measure();
syncMotion();
selectApp(0);
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
  get active() {
    return active;
  },
  get reduced() {
    return reduced;
  },
  get frames() {
    return renderCount;
  },
  get archiveTop() {
    return archiveTop;
  },
  get archiveStep() {
    return archiveStep;
  },
  goApp,
  openCapture,
};
