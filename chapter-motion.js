// Progressive enhancement only. The HTML and CSS already contain the final composition.
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
const chapters = [...document.querySelectorAll("[data-chapter]")].map(element => ({ element, kind: element.dataset.chapter, top: 0, enter: null, settle: null }));
const hero = chapters.find(chapter => chapter.kind === "hero");
const bridge = hero?.element.querySelector(".hero-bridge");
const evidence = hero?.element.querySelector(".hero-evidence");
const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => value * value * (3 - 2 * value);
let frame = 0;
let previousTime = 0;
let previousPointerTime = 0;
let viewportHeight = innerHeight;
let measureNeeded = true;
let lastScroll = -Infinity;
const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, left: 0, top: 0, width: 1, height: 1 };

function measure() {
  viewportHeight = innerHeight;
  for (const chapter of chapters) {
    const rect = (chapter === hero ? bridge : chapter.element).getBoundingClientRect();
    chapter.top = rect.top + scrollY;
  }
  if (evidence) {
    const rect = evidence.getBoundingClientRect();
    Object.assign(pointer, { left: rect.left, top: rect.top + scrollY, width: rect.width, height: rect.height });
  }
  measureNeeded = false;
}

function render(time) {
  frame = 0;
  if (reduced.matches || document.hidden) return;
  if (measureNeeded) measure();
  const amount = 1 - Math.exp(-Math.min(64, time - (previousTime || time - 16)) / 80);
  previousTime = time;
  const y = scrollY;
  let settling = false;
  for (const chapter of chapters) {
    // A shared viewport rhythm links the surface handoff to the following text.
    // It is independent of gallery length: sixteen apps do not stretch the transition.
    const position = (chapter.top - y) / Math.max(1, viewportHeight);
    // The homepage approaches a readable frontal view near the top of the viewport.
    // Its original document position supplies the travel; no pinning or extra spacer.
    const progress = chapter === hero ? clamp((y - 24) / Math.max(1, chapter.top - viewportHeight * .1 - 24)) : 0;
    const enter = chapter === hero ? ease(clamp(progress / .8)) : ease(clamp((.98 - position) / .52));
    const settle = chapter === hero ? ease(progress) : ease(clamp((.78 - position) / .52));
    for (const [key, target] of [["enter", enter], ["settle", settle]]) {
      const old = chapter[key];
      const interpolated = old === null ? target : old + (target - old) * amount;
      const next = Math.abs(target - interpolated) < .001 ? target : interpolated;
      if (Math.abs(target - next) >= .001) settling = true;
      if (old !== next) chapter.element.style.setProperty(`--chapter-${key}`, next.toFixed(4));
      chapter[key] = next;
    }
  }
  if (hero) {
    const visible = y < pointer.top + pointer.height && y + viewportHeight > pointer.top;
    if (!visible) pointer.targetX = pointer.targetY = 0;
    const inertia = 1 - Math.exp(-Math.min(64, time - (previousPointerTime || time - 16)) / 220);
    previousPointerTime = time;
    for (const [axis, target] of [["x", pointer.targetX], ["y", pointer.targetY]]) {
      const old = pointer[axis];
      const interpolated = old + (target - old) * inertia;
      const next = Math.abs(target - interpolated) < .001 ? target : interpolated;
      pointer[axis] = next;
      if (Math.abs(target - next) >= .001) settling = true;
      if (old !== next) hero.element.style.setProperty(`--inspect-${axis}`, next.toFixed(4));
    }
    // Remove the transform completely at rest: the final UI is rasterized frontally.
    hero.element.toggleAttribute("data-hero-moving", hero.settle < 1 || pointer.x !== 0 || pointer.y !== 0);
  }
  if (settling) frame = requestAnimationFrame(render);
  else previousTime = previousPointerTime = 0;
}

function schedule() {
  if (!frame && !reduced.matches && !document.hidden) frame = requestAnimationFrame(render);
}

function reset() {
  cancelAnimationFrame(frame);
  frame = 0;
  previousTime = 0;
  previousPointerTime = 0;
  pointer.x = pointer.y = pointer.targetX = pointer.targetY = 0;
  if (hero) {
    hero.element.removeAttribute("data-hero-moving");
    hero.element.style.removeProperty("--inspect-x");
    hero.element.style.removeProperty("--inspect-y");
  }
  for (const chapter of chapters) {
    chapter.element.style.removeProperty("--chapter-enter");
    chapter.element.style.removeProperty("--chapter-settle");
    chapter.enter = chapter.settle = null;
  }
  measureNeeded = true;
  schedule();
}

addEventListener("scroll", () => {
  lastScroll = performance.now();
  pointer.targetX = pointer.targetY = 0;
  schedule();
}, { passive: true });
addEventListener("resize", () => { measureNeeded = true; schedule(); }, { passive: true });
addEventListener("pageshow", () => { measureNeeded = true; schedule(); });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previousTime = previousPointerTime = 0; pointer.targetX = pointer.targetY = 0; }
  else { measureNeeded = true; schedule(); }
});
reduced.addEventListener("change", reset);
finePointer.addEventListener("change", reset);
document.fonts.ready.then(() => { measureNeeded = true; schedule(); });

evidence?.addEventListener("pointermove", event => {
  if (!finePointer.matches || innerWidth < 1024 || reduced.matches || event.pointerType !== "mouse" || performance.now() - lastScroll < 180) return;
  // Cache the untransformed figure bounds so the response cannot chase its own tilt.
  pointer.targetX = Math.max(-1, Math.min(1, ((event.clientX - pointer.left) / pointer.width - .5) * 2));
  pointer.targetY = Math.max(-1, Math.min(1, ((event.clientY + scrollY - pointer.top) / pointer.height - .5) * 2));
  schedule();
}, { passive: true });
evidence?.addEventListener("pointerleave", () => { pointer.targetX = pointer.targetY = 0; schedule(); });
schedule();
