import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile("chapter-motion.js", "utf8");
function fixture(reduce = false, includeHero = false) {
  const listeners = new Map();
  const frames = new Map();
  const values = new Map();
  const heroValues = new Map();
  const heroAttributes = new Set();
  const pointerListeners = new Map();
  let sequence = 0, time = 0, measures = 0;
  const preference = { matches: reduce, addEventListener: (_, fn) => listeners.set("motion-change", fn) };
  const fine = { matches: true, addEventListener: (_, fn) => listeners.set("pointer-change", fn) };
  const bridge = {
    getBoundingClientRect: () => { measures++; return { top: 648 - context.scrollY }; },
    addEventListener: (key, fn) => pointerListeners.set(key, fn)
  };
  const evidence = {
    getBoundingClientRect: () => { measures++; return { top: 648 - context.scrollY, left: 180, width: 1080, height: 740 }; },
    addEventListener: (key, fn) => pointerListeners.set(key, fn)
  };
  const hero = {
    dataset: { chapter: "hero" },
    style: { setProperty: (key, value) => heroValues.set(key, Number(value)), removeProperty: key => heroValues.delete(key) },
    querySelector: selector => selector === ".hero-bridge" ? bridge : evidence,
    toggleAttribute: (key, state) => state ? heroAttributes.add(key) : heroAttributes.delete(key),
    removeAttribute: key => heroAttributes.delete(key)
  };
  const element = {
    dataset: { chapter: "origin" },
    style: { setProperty: (key, value) => values.set(key, Number(value)), removeProperty: key => values.delete(key) },
    getBoundingClientRect: () => { measures++; return { top: 600 - context.scrollY, height: 700 }; }
  };
  const context = vm.createContext({
    matchMedia: query => query.includes("reduced-motion") ? preference : fine, innerHeight: 900, innerWidth: 1440, scrollY: 0,
    performance: { now: () => time },
    addEventListener: (key, fn) => listeners.set(key, fn),
    requestAnimationFrame: fn => { const id = ++sequence; frames.set(id, fn); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    document: { hidden: false, fonts: { ready: { then: fn => fn() } }, querySelectorAll: () => includeHero ? [hero, element] : [element], querySelector: () => null, addEventListener: (key, fn) => listeners.set(key, fn) }
  });
  vm.runInContext(source, context);
  function settle() {
    let count = 0;
    while (frames.size) {
      assert.ok(count++ < 100, "The chapter loop must stop when scroll settles");
      const callbacks = [...frames.values()]; frames.clear(); time += 16;
      callbacks.forEach(fn => fn(time));
    }
    return count;
  }
  return { context, listeners, frames, values, preference, settle, measures: () => measures, heroValues, heroAttributes, pointerListeners };
}

const normal = fixture();
normal.settle();
assert.equal(normal.frames.size, 0);
const measurements = normal.measures();
normal.context.scrollY = 480;
normal.listeners.get("scroll")();
normal.listeners.get("scroll")();
assert.equal(normal.frames.size, 1, "Scroll events share one pending frame");
assert.ok(normal.settle() > 1, "Scroll response settles progressively");
assert.equal(normal.measures(), measurements, "Scrolling must not remeasure layout");
for (const value of normal.values.values()) assert.ok(value >= 0 && value <= 1);
const forward = normal.values.get("--chapter-settle");
normal.context.scrollY = 0;
normal.listeners.get("scroll")();
normal.settle();
assert.ok(normal.values.get("--chapter-settle") < forward, "Scrolling back reverses the same chapter transition");
normal.context.document.hidden = true;
normal.listeners.get("visibilitychange")();
normal.listeners.get("scroll")();
assert.equal(normal.frames.size, 0);
normal.preference.matches = true;
normal.listeners.get("motion-change")();
assert.equal(normal.values.size, 0, "Reduced motion restores the static CSS composition");
assert.equal(normal.frames.size, 0);
assert.equal(fixture(true).frames.size, 0, "Reduced motion starts without rendering");
const intro = fixture(false, true);
intro.settle();
assert.equal(intro.heroValues.get("--chapter-settle"), 0, "The initial interface remains at the fold");
const introMeasures = intro.measures();
intro.context.scrollY = 580;
intro.listeners.get("scroll")();
intro.settle();
assert.equal(intro.heroValues.get("--chapter-settle"), 1);
assert.equal(intro.heroAttributes.has("data-hero-moving"), false, "The readable endpoint has no residual transform");
intro.pointerListeners.get("pointermove")({ pointerType: "mouse", clientX: 1100, clientY: 400 });
intro.settle();
assert.ok(intro.heroValues.get("--inspect-x") > 0, "Mouse inspection adds restrained perspective");
assert.equal(intro.measures(), introMeasures, "Pointer and scroll use cached geometry");
intro.listeners.get("scroll")();
intro.settle();
assert.equal(intro.heroValues.get("--inspect-x"), 0, "Scrolling neutralizes pointer rotation");
assert.equal(intro.heroAttributes.has("data-hero-moving"), false);
intro.context.innerWidth = 390;
intro.pointerListeners.get("pointermove")({ pointerType: "mouse", clientX: 1100, clientY: 400 });
assert.equal(intro.frames.size, 0, "Mobile has no pointer motion");
intro.preference.matches = true;
intro.listeners.get("motion-change")();
assert.equal(intro.heroValues.size, 0);
assert.equal(intro.heroAttributes.size, 0);
console.log("PASS: motion settles to idle, batches scroll, caches layout, stops when hidden and respects reduced motion.");
