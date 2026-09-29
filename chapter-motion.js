// Progressive enhancement: all copy and imagery already exist in the static HTML.
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const desktop = matchMedia("(min-width: 1024px) and (min-height: 700px)");
const hero = document.querySelector(".hero");
const stage = document.querySelector(".hero-stage");
const root = document.documentElement;
const beats = [...document.querySelectorAll("[data-motion]")].map(element => ({
  element, kind: element.dataset.motion, top: 0, value: null
}));
const clamp = n => Math.max(0, Math.min(1, n));
const smooth = n => n * n * (3 - 2 * n);
const mix = (a, b, p) => a + (b - a) * p;
const phase = (p, start, end) => smooth(clamp((p - start) / (end - start)));
let frame = 0, lastTime = 0, dirty = true, heroProgress = null;
let geometry = { height: innerHeight, top: 0, range: 1, startX: 0, endX: 0, startWidth: 1, endWidth: 1 };
function measure() {
  const height = innerHeight;
  const width = innerWidth;
  const heroRect = hero.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  const container = hero.querySelector(".container").getBoundingClientRect();
  const endWidth = Math.min(1024, container.width, (height - 224) * 1.5);
  geometry = { height, top: heroRect.top + scrollY, range: Math.max(1, heroRect.height - stageRect.height),
    startX: container.left + container.width * .37, endX: (width - endWidth) / 2,
    startWidth: Math.min(1425, container.width * .96), endWidth };
  if (desktop.matches) stage.style.setProperty("--image-width", geometry.startWidth.toFixed(2) + "px");
  for (const beat of beats) {
    // Remove the previous transform from the cached document position.
    const travel = ["build", "another", "resolution"].includes(beat.kind) ? 0 : width < 768 ? 16 : beat.kind === "capture" ? 20 : 24;
    beat.top = beat.element.getBoundingClientRect().top + scrollY - (1 - (beat.value ?? 1)) * travel;
  }
  dirty = false;
}
function render(time) {
  frame = 0;
  if (reduced.matches || document.hidden) return;
  const layoutChanged = dirty;
  if (dirty) measure();
  const alpha = 1 - Math.exp(-Math.min(64, time - (lastTime || time - 16)) / 65);
  lastTime = time;
  let settling = false;
  const approach = (current, target) => {
    const value = current === null ? target : mix(current, target, alpha);
    if (Math.abs(value - target) < .0005) return target;
    settling = true;
    return value;
  };
  if (desktop.matches) {
    const nextProgress = approach(heroProgress, clamp((scrollY - geometry.top) / geometry.range));
    if (nextProgress !== heroProgress || layoutChanged) {
      heroProgress = nextProgress;
      const p = heroProgress;
      const open = phase(p, .08, .78);
      const retreat = phase(p, .35, .76);
      const surface = phase(p, .64, 1);
      const ink = phase(p, .78, 1);
      stage.style.setProperty("--image-x", mix(geometry.startX, geometry.endX, open).toFixed(2) + "px");
      stage.style.setProperty("--image-y", (mix(geometry.height * .32, 220, open) - 68 * phase(p, .62, .95)).toFixed(2) + "px");
      stage.style.setProperty("--image-scale", mix(1, geometry.endWidth / geometry.startWidth, open).toFixed(5));
      stage.style.setProperty("--fact-y", (geometry.height * .38 - 24 * phase(p, .12, .53)).toFixed(2) + "px");
      stage.style.setProperty("--fact-opacity", (1 - phase(p, .27, .48)).toFixed(4));
      stage.style.setProperty("--descriptor-opacity", (1 - phase(p, .2, .45)).toFixed(4));
      stage.style.setProperty("--title-y", (-24 * retreat).toFixed(2) + "px");
      stage.style.setProperty("--title-scale", mix(1, .76, retreat).toFixed(4));
      stage.style.setProperty("--title-opacity", (1 - phase(p, .56, .76)).toFixed(4));
      // Copy has receded before the intermediate surface tones cross its luminance.
      stage.style.setProperty("--hero-surface", [mix(247,23,surface),mix(246,25,surface),mix(242,28,surface)].map(n => n.toFixed(2)).join(" "));
      stage.style.setProperty("--hero-ink", [mix(23,247,ink),mix(25,246,ink),mix(28,242,ink)].map(n => n.toFixed(2)).join(" "));
    }
  }
  for (const beat of beats) {
    const target = phase(scrollY + geometry.height - beat.top, geometry.height * .04, geometry.height * (beat.kind === "capture" ? .3 : .48));
    const value = approach(beat.value, target);
    if (value !== beat.value) {
      beat.element.style.setProperty("--progress", value.toFixed(4));
      beat.value = value;
    }
  }
  if (settling) frame = requestAnimationFrame(render);
  else lastTime = 0;
}
function schedule() {
  if (!frame && !reduced.matches && !document.hidden) frame = requestAnimationFrame(render);
}
function reset() {
  cancelAnimationFrame(frame); frame = 0; lastTime = 0; heroProgress = null;
  root.classList.toggle("motion-hero", desktop.matches && !reduced.matches);
  stage.removeAttribute("style");
  for (const beat of beats) {
    beat.element.style.removeProperty("--progress");
    beat.value = null;
  }
  dirty = true;
  schedule();
}
addEventListener("scroll", schedule, {passive:true});
addEventListener("resize", () => { dirty = true; schedule(); }, {passive:true});
addEventListener("pageshow", () => { dirty = true; schedule(); });
document.addEventListener("visibilitychange", () => {
  if(document.hidden) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  else { dirty = true; schedule(); }
});
reduced.addEventListener("change", reset);
desktop.addEventListener("change", reset);
document.fonts.ready.then(() => { dirty = true; schedule(); });
reset();
