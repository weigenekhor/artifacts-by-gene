import { apps, story } from "./apps.js";
import { createWorld } from "./world.js";
import { clamp, smooth, damp, MOTION, LAST } from "./motion.js";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const root = document.documentElement,
  journey = $(".journey"),
  stage = $(".stage"),
  scenes = $$(".scene"),
  nodes = $$(".app-node"),
  frames = $$(".software-frame");
const media = matchMedia("(prefers-reduced-motion: reduce)");
let reduced = media.matches,
  world,
  stats = {},
  step = 1,
  target = 0,
  progress = 0,
  active = -1,
  raf = 0,
  last = 0,
  visible = true,
  measured = false,
  start = performance.now(),
  px = 0,
  py = 0,
  tx = 0,
  ty = 0,
  velocity = 0,
  lastScroll = scrollY,
  group = 0,
  selection = null,
  reelIndex = 0,
  proofApp = null,
  returnFocus = null,
  native = false;
try {
  if (sessionStorage.getItem("artifacts-motion") === "off") reduced = true;
} catch {}
root.classList.add("enhanced");
const motion = $("#motion");
motion.hidden = false;
function syncMotion() {
  root.classList.toggle("reduced", reduced);
  motion.setAttribute("aria-pressed", String(!reduced));
  motion.setAttribute("aria-label", reduced ? "Enable motion" : "Pause motion");
  motion.firstElementChild.textContent = reduced ? "▷" : "Ⅱ";
  wake();
}
motion.addEventListener("click", () => {
  reduced = !reduced;
  try {
    sessionStorage.setItem("artifacts-motion", reduced ? "off" : "on");
  } catch {}
  syncMotion();
});
media.addEventListener("change", (e) => {
  reduced = e.matches;
  syncMotion();
});
function measure() {
  const old = step,
    position = target,
    inside = scrollY <= step * LAST + 10;
  step = Math.max(340, innerHeight * (innerWidth < 701 ? 0.92 : 0.88));
  journey.style.height = step * LAST + stage.offsetHeight + "px";
  world?.resize();
  if (measured && inside && Math.abs(old - step) > 1) {
    scrollTo({ top: position * step, behavior: "instant" });
    target = position;
  } else target = clamp(scrollY / step, 0, LAST);
  measured = true;
  wake();
}
function go(i, instant = false) {
  scrollTo({
    top: clamp(i, 0, LAST) * step,
    behavior: reduced || instant ? "instant" : "smooth",
  });
}
function navigate(id, instant = false) {
  const i = story.findIndex((s) => s.id === id);
  if (i < 0) return false;
  history.replaceState(null, "", "#" + id);
  go(i, instant);
  return true;
}
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    if (navigate(id)) {
      e.preventDefault();
    }
  }),
);
function chooseApp(id, focus = false) {
  const a = apps.find((x) => x.id === id);
  if (!a) return;
  selection = id;
  group = Number(nodes[a.index - 1].dataset.group);
  $("#selected-category").textContent = a.category.replace(" - ", " / ");
  $("#selected-name").textContent = a.name;
  $("#selected-purpose").textContent = a.purpose;
  $("#selected-capture").hidden = false;
  nodes.forEach((n) => {
    const selected = n.dataset.app === id;
    n.classList.toggle("selected", selected);
    n.classList.toggle("related", a.relationships.includes(n.dataset.app));
    n.setAttribute("aria-pressed", String(selected));
  });
  if (focus) {
    history.replaceState(null, "", "#app/" + id);
    go(12);
  }
  syncGroup();
  wake();
}
function syncGroup() {
  $$(".group-switch button").forEach((b) =>
    b.setAttribute("aria-pressed", String(Number(b.dataset.group) === group)),
  );
  root.style.setProperty("--group", group);
  wake();
}
nodes.forEach((n) => {
  n.addEventListener("pointerenter", () => chooseApp(n.dataset.app));
  n.addEventListener("focus", () => chooseApp(n.dataset.app));
  n.addEventListener("click", () => chooseApp(n.dataset.app));
});
$$(".group-switch button").forEach((b) =>
  b.addEventListener("click", () => {
    group = Number(b.dataset.group);
    const n = nodes.find((n) => Number(n.dataset.group) === group);
    chooseApp(n.dataset.app);
    syncGroup();
  }),
);
$("#selected-capture").addEventListener("click", () => openCapture(selection));
function loadImage(img, src) {
  if (img.getAttribute("src") !== src) img.src = src;
}
function paintReel() {
  const a = apps[reelIndex];
  $("#reel-name").textContent = a.name;
  $("#reel-count").textContent =
    String(reelIndex + 1).padStart(2, "0") + " / 16";
  $("#capture-select").value = a.id;
  frames.forEach((f, i) => {
    let offset = i - reelIndex;
    f.hidden = Math.abs(offset) > 1;
    f.inert = offset !== 0;
    f.setAttribute("aria-hidden", String(offset !== 0));
    f.style.setProperty("--offset", offset);
    if (Math.abs(offset) <= 1)
      loadImage(f.querySelector("img"), apps[i].evidence.src);
  });
  $("#reel-prev").disabled = reelIndex === 0;
  $("#reel-next").disabled = reelIndex === 15;
  wake();
}
$("#reel-prev").addEventListener("click", () => {
  reelIndex = clamp(reelIndex - 1, 0, 15);
  paintReel();
});
$("#reel-next").addEventListener("click", () => {
  reelIndex = clamp(reelIndex + 1, 0, 15);
  paintReel();
});
$("#capture-select").addEventListener("change", (e) => {
  reelIndex = apps.findIndex((a) => a.id === e.target.value);
  paintReel();
});
let touchX = null;
$(".reel").addEventListener(
  "touchstart",
  (e) => {
    touchX = e.touches[0].clientX;
  },
  { passive: true },
);
$(".reel").addEventListener(
  "touchend",
  (e) => {
    if (touchX === null) return;
    const d = e.changedTouches[0].clientX - touchX;
    if (Math.abs(d) > 55) {
      reelIndex = clamp(reelIndex + (d < 0 ? 1 : -1), 0, 15);
      paintReel();
    }
    touchX = null;
  },
  { passive: true },
);
const dialog = $("#capture-dialog");
function openCapture(id) {
  proofApp = apps.find((a) => a.id === id);
  if (!proofApp) return;
  returnFocus = document.activeElement;
  native = false;
  $("#capture-title").textContent = proofApp.name;
  const img = $("#capture-image");
  img.alt = "Complete " + proofApp.name + " interface";
  img.src = proofApp.evidence.full;
  img.width = proofApp.evidence.fullWidth;
  img.height = proofApp.evidence.fullHeight;
  $("#capture-size").textContent =
    img.width + " × " + img.height + " · original capture";
  $("#capture-original").href = img.src;
  paintCapture();
  dialog.showModal();
  document.body.style.overflow = "hidden";
}
function paintCapture() {
  $(".capture-viewport").classList.toggle("native", native);
  $("#pixel-view").setAttribute("aria-pressed", String(native));
  $("#pixel-view").textContent = native ? "Fit to view ↙" : "Actual size ↗";
}
$("#proof-open").addEventListener("click", () =>
  openCapture(story[active].app),
);
$$("[data-proof]").forEach((b) =>
  b.addEventListener("click", () => openCapture(b.dataset.proof)),
);
$("#close-capture").addEventListener("click", () => dialog.close());
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
const annotations = $(".world-annotations");
const labelSets = {
  1: [
    "Log events",
    "Recipe steps",
    "SPC signals",
    "Wafer measurements",
    "Maintenance",
    "Temperature",
  ],
  5: ["REFERENCE", "COMPARED", "Equivalent steps, different order"],
  6: ["REFERENCE", "COMPARED", "Matched", "Changed", "Added / missing"],
  7: ["Samples", "Measurement axis"],
  8: ["Interpolated surface", "Spatial variation"],
  9: ["Observed temperature behavior", "Possible causes"],
  10: ["Observations", "Likely causes", "Recommended checks"],
  11: ["Related parameters", "Shared equipment context"],
};
function updateScene(p, intro) {
  const index = clamp(Math.round(p), 0, LAST);
  if (index !== active) {
    active = index;
    root.dataset.scene = index;
    scenes.forEach((s, i) => {
      s.inert = i !== index;
      s.setAttribute("aria-hidden", String(i !== index));
    });
    const s = story[index];
    $("#chapter-caption").textContent = s.caption;
    $("#chapter-count").textContent =
      String(index + 1).padStart(2, "0") + " / 14";
    $(".environment").hidden = index !== 12;
    $(".software").hidden = index !== 13;
    $(".proof").hidden = !s.proof;
    annotations.innerHTML = (labelSets[index] || [])
      .map(
        (label, i) =>
          `<span class="annotation annotation-${i}">${label}</span>`,
      )
      .join("");
    if (s.proof) {
      const a = apps.find((a) => a.id === s.app),
        img = $("#proof-image");
      loadImage(img, a.evidence.src);
      img.width = a.evidence.width;
      img.height = a.evidence.height;
      img.alt = a.evidence.label;
      $("#proof-name").textContent = a.name;
    }
    if (index === 13) paintReel();
    $$("[data-chapter]").forEach((a) => {
      const start = Number(a.dataset.chapter),
        next = Number(a.nextElementSibling?.dataset.chapter ?? 14);
      a.setAttribute(
        "aria-current",
        index >= start && index < next ? "step" : "false",
      );
    });
  }
  for (let i = Math.max(0, index - 1); i <= Math.min(LAST, index + 1); i++) {
    const distance = p - i,
      phase = smooth(clamp((Math.abs(distance) - 0.32) / 0.18)),
      opening = i === 0 ? 1 - intro : 0;
    scenes[i].style.setProperty("--reveal", Math.max(phase, opening));
    scenes[i].style.setProperty("--direction", distance < 0 ? 1 : -1);
    scenes[i].classList.toggle("near", i === index);
  }
  scenes.forEach((s, i) => {
    if (Math.abs(i - index) > 1) s.classList.remove("near");
  });
  $(".proof").style.setProperty(
    "--proof-enter",
    1 - smooth(clamp((p - index + 0.42) / 0.36)),
  );
  annotations.style.opacity = String(
    1 - smooth(clamp((Math.abs(p - index) - 0.25) / 0.23)),
  );
}
function tick(time) {
  raf = 0;
  if (!visible || document.hidden) return;
  const dt = Math.min(50, time - last || 16);
  last = time;
  progress = reduced
    ? Math.round(target)
    : damp(progress, target, dt, MOTION.scroll);
  px = damp(px, tx, dt, MOTION.pointer);
  py = damp(py, ty, dt, MOTION.pointer);
  velocity = damp(velocity, 0, dt, 110);
  const intro = reduced || target > 0.04 ? 1 : smooth((time - start) / 2200);
  updateScene(progress, intro);
  stats = world.render({
    progress,
    px,
    py,
    velocity,
    time,
    reduced,
    intro,
    group,
    selected: selection,
  });
  [...annotations.children].forEach((el, i) => {
    const p = stats.labels[i];
    if (p) {
      el.style.left = Math.max(18, Math.min(innerWidth - 120, p[0])) + "px";
      el.style.top = p[1] + "px";
    }
  });
  if (active === 12) {
    nodes.forEach((n, i) => {
      const show = !stats.mobile || Number(n.dataset.group) === group;
      n.hidden = !show;
      if (show) {
        n.style.left = stats.nodes[i][0] + "px";
        n.style.top = stats.nodes[i][1] + "px";
        if (!stats.mobile) {
          const peers = nodes.map((other, j) =>
            other.dataset.group === n.dataset.group && j !== i
              ? Math.abs(stats.nodes[j][0] - stats.nodes[i][0])
              : Infinity,
          );
          n.style.width =
            Math.min(innerWidth > 2200 ? 250 : 180, Math.min(...peers) * 0.86) +
            "px";
        } else n.style.removeProperty("width");
      }
    });
  }
  if (
    stats.moving ||
    intro < 1 ||
    (Math.abs(progress - target) > 0.0001 && !reduced) ||
    Math.abs(px - tx) + Math.abs(py - ty) > 0.0005 ||
    Math.abs(velocity) > 0.001
  )
    wake();
}
function wake() {
  if (!raf && world && visible && !document.hidden)
    raf = requestAnimationFrame(tick);
}
addEventListener(
  "scroll",
  () => {
    target = clamp(scrollY / step, 0, LAST);
    velocity = clamp((scrollY - lastScroll) / 70, -1, 1);
    lastScroll = scrollY;
    wake();
  },
  { passive: true },
);
addEventListener("resize", measure, { passive: true });
addEventListener("keydown", (e) => {
  if (dialog.open || e.target.matches("input,select,button")) return;
  if (["ArrowRight", "ArrowLeft"].includes(e.key)) {
    e.preventDefault();
    if (active === 13) {
      reelIndex = clamp(reelIndex + (e.key === "ArrowRight" ? 1 : -1), 0, 15);
      paintReel();
    } else go(active + (e.key === "ArrowRight" ? 1 : -1));
  }
});
if (matchMedia("(pointer:fine)").matches)
  stage.addEventListener(
    "pointermove",
    (e) => {
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
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(raf);
    raf = 0;
  } else wake();
});
new IntersectionObserver(
  ([e]) => {
    visible = e.isIntersecting;
    if (!visible) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else wake();
  },
  { threshold: 0 },
).observe(journey);
$("#world").addEventListener("worldrestore", wake);
world = createWorld($("#world"));
syncMotion();
measure();
paintReel();
function hashNavigate() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (id.startsWith("app/")) chooseApp(id.slice(4), true);
  else if (id) navigate(id, true);
}
hashNavigate();
addEventListener("hashchange", hashNavigate);
// Native fragment restoration runs after module initialization. Reapply the
// timeline location once loading completes so story links land at their scene.
addEventListener(
  "load",
  () =>
    requestAnimationFrame(() => {
      measure();
      hashNavigate();
    }),
  { once: true },
);
window.artifactsExperience = {
  get progress() {
    return progress;
  },
  get active() {
    return active;
  },
  get step() {
    return step;
  },
  get reduced() {
    return reduced;
  },
  get selected() {
    return selection;
  },
  get world() {
    return stats;
  },
  go,
  chooseApp,
};
addEventListener("pagehide", (e) => {
  if (!e.persisted) world.dispose();
});
wake();
