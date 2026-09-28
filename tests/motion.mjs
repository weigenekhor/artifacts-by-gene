import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile("chapter-motion.js", "utf8");
function fixture(reduce = false) {
  const listeners = new Map();
  const frames = new Map();
  const values = new Map();
  let sequence = 0, time = 0, measures = 0;
  const preference = { matches: reduce, addEventListener: (_, fn) => listeners.set("motion-change", fn) };
  const element = {
    style: { setProperty: (key, value) => values.set(key, Number(value)), removeProperty: key => values.delete(key) },
    getBoundingClientRect: () => { measures++; return { top: 600 - context.scrollY, height: 700 }; }
  };
  const context = vm.createContext({
    matchMedia: () => preference, innerHeight: 900, innerWidth: 1440, scrollY: 0,
    addEventListener: (key, fn) => listeners.set(key, fn),
    requestAnimationFrame: fn => { const id = ++sequence; frames.set(id, fn); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    document: { hidden: false, fonts: { ready: { then: fn => fn() } }, querySelectorAll: () => [element], querySelector: () => null, addEventListener: (key, fn) => listeners.set(key, fn) }
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
  return { context, listeners, frames, values, preference, settle, measures: () => measures };
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
normal.context.document.hidden = true;
normal.listeners.get("visibilitychange")();
normal.listeners.get("scroll")();
assert.equal(normal.frames.size, 0);
normal.preference.matches = true;
normal.listeners.get("motion-change")();
assert.equal(normal.values.size, 0, "Reduced motion restores the static CSS composition");
assert.equal(normal.frames.size, 0);
assert.equal(fixture(true).frames.size, 0, "Reduced motion starts without rendering");
console.log("PASS: motion settles to idle, batches scroll, caches layout, stops when hidden and respects reduced motion.");
