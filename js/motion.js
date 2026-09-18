// Shared timing and a single frame clock. Spatial motion is critically damped:
// it carries weight, reaches its target, and never overshoots.
export const MOTION = Object.freeze({
  ease: "cubic-bezier(.22,.72,.12,1)",
  settle: "cubic-bezier(.16,1,.3,1)",
  state: 420,
  entrance: 1250,
  stagger: 42,
  pointerFrequency: 6.5,
});

const mediaQueries = {
  reduced: matchMedia("(prefers-reduced-motion: reduce)"),
  compact: matchMedia("(max-width: 700px), (max-height: 600px)"),
  short: matchMedia("(max-height: 600px)"),
  pointer: matchMedia("(hover: hover) and (pointer: fine)"),
};
// Cache query state from change events. Reading MediaQueryList.matches during
// animation frames can race media-change delivery in some Chromium versions.
export const preferences = Object.fromEntries(
  Object.entries(mediaQueries).map(([key, query]) => [key, query.matches]),
);
let paused = false;
try {
  paused = sessionStorage.getItem("artifacts-motion") === "paused";
} catch {
  /* Storage is optional. */
}
export const motionAllowed = () => !preferences.reduced && !paused;
export const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
export const mix = (a, b, t) => a + (b - a) * t;

const tasks = new Set();
const animations = new Set();
let frame = 0;
let ticking = false;
let previous = 0;
let elapsed = 0;
function tick(now) {
  frame = 0;
  ticking = true;
  const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 1 / 60;
  previous = now;
  elapsed += delta;
  for (const task of tasks)
    if (task(delta, elapsed, now) === false) tasks.delete(task);
  ticking = false;
  if (tasks.size && !document.hidden) frame = requestAnimationFrame(tick);
  else previous = 0;
}
export function wake(task) {
  tasks.add(task);
  if (!frame && !ticking && !document.hidden)
    frame = requestAnimationFrame(tick);
}
export function sleep(task) {
  tasks.delete(task);
}
document.addEventListener("visibilitychange", () => {
  cancelAnimationFrame(frame);
  frame = 0;
  previous = 0;
  if (!document.hidden && tasks.size) frame = requestAnimationFrame(tick);
});

export function spring(
  position,
  velocity,
  target,
  delta,
  frequency = MOTION.pointerFrequency,
) {
  const displacement = position - target;
  const decay = Math.exp(-frequency * delta);
  const impulse = velocity + frequency * displacement;
  return [
    (displacement + impulse * delta) * decay + target,
    (velocity - frequency * impulse * delta) * decay,
  ];
}
export function animate(element, keyframes, options = {}) {
  if (!motionAllowed() || !element?.animate) return;
  const animation = element.animate(keyframes, {
    duration: MOTION.state,
    easing: MOTION.ease,
    ...options,
  });
  animations.add(animation);
  animation.finished
    .catch(() => {})
    .finally(() => animations.delete(animation));
  return animation;
}
function syncPreference() {
  document.documentElement.classList.toggle("motion-paused", !motionAllowed());
  if (!motionAllowed()) for (const animation of animations) animation.finish();
  window.dispatchEvent(new Event("artifacts:motion"));
}
for (const [key, query] of Object.entries(mediaQueries))
  query.addEventListener("change", (event) => {
    preferences[key] = event.matches;
    syncPreference();
  });

export function initializeMotion() {
  const toggle = document.querySelector("#motion-toggle");
  toggle.hidden = false;
  function update() {
    toggle.setAttribute("aria-pressed", String(motionAllowed()));
    toggle.querySelector("span").textContent = motionAllowed()
      ? "Motion on"
      : "Motion off";
    toggle.disabled = preferences.reduced;
    toggle.title = preferences.reduced
      ? "Following your reduced-motion preference"
      : "Toggle spatial animation";
  }
  toggle.addEventListener("click", () => {
    paused = !paused;
    try {
      sessionStorage.setItem("artifacts-motion", paused ? "paused" : "on");
    } catch {
      /* Optional. */
    }
    syncPreference();
  });
  window.addEventListener("artifacts:motion", update);
  syncPreference();
}
