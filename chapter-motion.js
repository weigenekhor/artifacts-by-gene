// Progressive enhancement only. The HTML and CSS already contain the final composition.
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const chapters = [...document.querySelectorAll("[data-chapter]")].map(element => ({ element, top: 0, height: 0, progress: null, exit: null }));
const clamp = value => Math.max(0, Math.min(1, value));
let frame = 0;
let previousTime = 0;
let viewportHeight = innerHeight;
let measureNeeded = true;
const entranceAnimations = [];

function measure() {
  viewportHeight = innerHeight;
  for (const chapter of chapters) {
    const rect = chapter.element.getBoundingClientRect();
    chapter.top = rect.top + scrollY;
    chapter.height = rect.height;
  }
  measureNeeded = false;
}

function render(time) {
  frame = 0;
  if (reduced.matches || document.hidden) return;
  if (measureNeeded) measure();
  const amount = 1 - Math.exp(-Math.min(64, time - (previousTime || time - 16)) / 65);
  previousTime = time;
  const y = scrollY;
  let settling = false;
  for (const chapter of chapters) {
    // All reads above, then only compositor-friendly CSS variables below.
    const progress = clamp((y + viewportHeight * .88 - chapter.top) / Math.max(1, chapter.height * .65 + viewportHeight * .2));
    const exit = clamp((y + viewportHeight - chapter.top - chapter.height * .58) / Math.max(1, chapter.height * .42));
    for (const [key, target] of [["progress", progress], ["exit", exit]]) {
      const old = chapter[key];
      const next = old === null || Math.abs(target - old) < .001 ? target : old + (target - old) * amount;
      if (Math.abs(target - next) >= .001) settling = true;
      if (old !== next) chapter.element.style.setProperty(`--chapter-${key}`, next.toFixed(4));
      chapter[key] = next;
    }
  }
  if (settling) frame = requestAnimationFrame(render);
  else previousTime = 0;
}

function schedule() {
  if (!frame && !reduced.matches && !document.hidden) frame = requestAnimationFrame(render);
}

function reset() {
  cancelAnimationFrame(frame);
  frame = 0;
  previousTime = 0;
  for (const animation of entranceAnimations) animation.cancel();
  for (const chapter of chapters) {
    chapter.element.style.removeProperty("--chapter-progress");
    chapter.element.style.removeProperty("--chapter-exit");
    chapter.progress = chapter.exit = null;
  }
  measureNeeded = true;
  schedule();
}

addEventListener("scroll", schedule, { passive: true });
addEventListener("resize", () => { measureNeeded = true; schedule(); }, { passive: true });
addEventListener("pageshow", () => { measureNeeded = true; schedule(); });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previousTime = 0; }
  else { measureNeeded = true; schedule(); }
});
reduced.addEventListener("change", reset);
document.fonts.ready.then(() => { measureNeeded = true; schedule(); });

if (!reduced.matches && scrollY < 100) {
  const small = innerWidth < 768;
  for (const [selector, distance, duration] of [[".hero-title", 12, 800], [".hero-intro", 8, 1000], [".hero-evidence", 20, 1000]]) {
    const element = document.querySelector(selector);
    if (element?.animate) entranceAnimations.push(element.animate([
      { transform: `translateY(${small ? distance / 2 : distance}px)` },
      { transform: "translateY(0)" }
    ], { duration: small ? 600 : duration, easing: "cubic-bezier(.16,1,.3,1)" }));
  }
}
schedule();
