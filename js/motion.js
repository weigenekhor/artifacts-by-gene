// Shared timing and a single frame clock. Spatial motion is critically damped:
// it carries weight, reaches its target, and never overshoots.
export const MOTION = Object.freeze({
  ease: "cubic-bezier(.22,.72,.12,1)",
  settle: "cubic-bezier(.16,1,.3,1)",
  fast: 180,
  state: 420,
  reveal: 760,
  entrance: 900,
  stagger: 34,
  morph: 680,
  pointerFrequency: 6.5,
});

const mediaQueries = {
  reduced: matchMedia("(prefers-reduced-motion: reduce)"),
  compact: matchMedia("(max-width: 700px)"),
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
export const ease = (t) => 1 - Math.pow(1 - clamp(t), 4);

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
  const root = document.documentElement;
  root.classList.add("interaction-ready");
  root.style.setProperty("--motion-ease", MOTION.ease);
  root.style.setProperty("--motion-settle", MOTION.settle);
  for (const key of ["fast", "state", "reveal", "entrance"])
    root.style.setProperty(`--motion-${key}`, `${MOTION[key]}ms`);
  const toggle = document.querySelector("#motion-toggle");
  toggle.hidden = false;
  function updateToggle() {
    toggle.setAttribute("aria-pressed", String(motionAllowed()));
    toggle.querySelector("span").textContent = motionAllowed()
      ? "MOTION ON"
      : "MOTION OFF";
    toggle.disabled = preferences.reduced;
    toggle.title = preferences.reduced
      ? "Following your reduced-motion preference"
      : "Toggle animation";
  }
  toggle.addEventListener("click", () => {
    paused = !paused;
    try {
      sessionStorage.setItem("artifacts-motion", paused ? "paused" : "on");
    } catch {
      /* Storage is optional. */
    }
    syncPreference();
  });
  window.addEventListener("artifacts:motion", updateToggle);
  syncPreference();
  initializeEntrance();
  initializeScroll();
  initializeMagnetism();
}

function initializeEntrance() {
  let pace = 1;
  try {
    if (sessionStorage.getItem("artifacts-visited")) pace = 0.6;
    sessionStorage.setItem("artifacts-visited", "yes");
  } catch {
    /* Repeat-visit pacing is optional. */
  }
  const title = document.querySelector("#hero-title");
  const label = title.textContent;
  title.setAttribute("aria-label", label);
  title.replaceChildren(
    ...[...label].map((letter, index) => {
      const mask = document.createElement("span");
      mask.className = `title-mask${letter === "." ? " title-period" : ""}`;
      mask.setAttribute("aria-hidden", "true");
      const glyph = document.createElement("span");
      glyph.className = "title-glyph";
      glyph.textContent = letter;
      mask.append(glyph);
      animate(
        glyph,
        [
          {
            transform:
              letter === "."
                ? "translateY(110%) scaleY(.2)"
                : "translateY(108%) rotate(2deg)",
          },
          { transform: "translateY(0) rotate(0) scaleY(1)" },
        ],
        {
          duration: (letter === "." ? MOTION.state : MOTION.entrance) * pace,
          delay:
            (letter === "." ? MOTION.entrance : index * MOTION.stagger) * pace,
          easing: MOTION.settle,
          fill: "backwards",
        },
      );
      return mask;
    }),
  );
  animate(
    document.querySelector(".hero-topline"),
    [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
    { duration: MOTION.reveal },
  );
  animate(
    document.querySelector(".hero-copy"),
    [
      { transform: "translateY(14px)", opacity: 0.4 },
      { transform: "none", opacity: 1 },
    ],
    { duration: MOTION.reveal, delay: MOTION.fast, fill: "backwards" },
  );
  animate(
    document.querySelector(".hero-visual"),
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: MOTION.entrance, delay: MOTION.fast, fill: "backwards" },
  );
}

function maskHeading(heading) {
  const fragments = [[]];
  for (const node of [...heading.childNodes]) {
    if (node.nodeName === "BR") fragments.push([]);
    else fragments.at(-1).push(node);
  }
  const lines = fragments.map((nodes) => {
    const mask = document.createElement("span");
    mask.className = "heading-mask";
    const line = document.createElement("span");
    line.className = "heading-line";
    line.append(...nodes);
    mask.append(line);
    return mask;
  });
  heading.replaceChildren(...lines);
}

function initializeScroll() {
  const hero = document.querySelector(".hero");
  const title = document.querySelector("#hero-title");
  const visual = document.querySelector(".hero-visual");
  const copy = document.querySelector(".hero-copy");
  const sections = [...document.querySelectorAll(".section-pad")];
  const metrics = new Map();
  let heroHeight = 1;
  let viewportHeight = innerHeight;
  const visible = new Set();
  sections.forEach((section) => {
    section
      .querySelectorAll(".editorial-heading, .gene-title")
      .forEach(maskHeading);
    section.classList.add("motion-section");
  });
  const observer = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (isIntersecting) visible.add(target);
        else visible.delete(target);
        if (!isIntersecting || target.classList.contains("has-entered"))
          continue;
        target.classList.add("has-entered");
      }
      wake(update);
    },
    { rootMargin: "0px 0px -7% 0px", threshold: 0 },
  );
  sections.forEach((section) => observer.observe(section));
  // Observe composed groups at their own positions, so a tall section does not
  // finish its reveal before its interface has reached the viewport.
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        revealObserver.unobserve(target);
        target.classList.remove("reveal-pending");
        const quiet = !!target.closest(".about");
        const lines = target.querySelectorAll(".heading-line");
        if (lines.length)
          lines.forEach((line, index) =>
            animate(
              line,
              [
                { transform: `translateY(${quiet ? 35 : 105}%)` },
                { transform: "none" },
              ],
              {
                duration: MOTION.reveal,
                delay: index * MOTION.stagger * 2,
                fill: "backwards",
              },
            ),
          );
        else
          animate(
            target,
            [
              {
                clipPath: "inset(0 0 100% 0)",
                transform: `translateY(${quiet ? 5 : 12}px)`,
              },
              { clipPath: "inset(0 0 0 0)", transform: "none" },
            ],
            { duration: MOTION.reveal, fill: "backwards" },
          );
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
  );
  document
    .querySelectorAll(
      ".editorial-heading,.gene-title,.section-label,.discipline-strip,.principles,.system-console,.evolution-line,.about-copy",
    )
    .forEach((group) => {
      group.classList.add("reveal-pending");
      revealObserver.observe(group);
    });
  document.addEventListener("focusin", (event) => {
    const group = event.target.closest(".reveal-pending");
    if (group) {
      group.classList.remove("reveal-pending");
      revealObserver.unobserve(group);
    }
  });
  function measure() {
    viewportHeight = innerHeight;
    heroHeight = hero.offsetHeight;
    for (const section of sections)
      metrics.set(section, {
        top: section.offsetTop,
        height: section.offsetHeight,
      });
    wake(update);
  }
  function update() {
    const enabled = motionAllowed();
    const progress = enabled ? clamp(scrollY / heroHeight) : 0;
    const compact = preferences.compact;
    title.style.transform = `translate3d(0,${-progress * (compact ? 22 : 65)}px,0) scale(${1 - progress * 0.035})`;
    visual.style.transform = `translate3d(0,${-progress * (compact ? 15 : 85)}px,0) scale(${1 - progress * 0.06})`;
    copy.style.transform = `translate3d(0,${-progress * (compact ? 6 : 22)}px,0)`;
    for (const section of sections) {
      if (!visible.has(section) && enabled) continue;
      const metric = metrics.get(section);
      if (!metric) continue;
      const distance = clamp((metric.top - scrollY) / viewportHeight, -1, 1);
      const quiet = section.classList.contains("about");
      section.style.setProperty(
        "--section-shift",
        `${enabled ? distance * (compact || quiet ? 4 : 12) : 0}px`,
      );
    }
    window.dispatchEvent(
      new CustomEvent("artifacts:scroll", { detail: progress }),
    );
    return false;
  }
  window.addEventListener("scroll", () => wake(update), { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("artifacts:motion", () => wake(update));
  new ResizeObserver(measure).observe(document.querySelector("main"));
  document.fonts?.ready.then(measure);
  measure();
}

function initializeMagnetism() {
  // Keep the native cursor and the click target stationary. Only the small arrow
  // responds, so precision and text selection are never compromised.
  document.querySelectorAll(".text-link, .back-top").forEach((link) => {
    const icon = link.querySelector(".link-icon, span:last-child");
    let bounds;
    let x = 0,
      y = 0,
      vx = 0,
      vy = 0,
      tx = 0,
      ty = 0;
    function draw(delta) {
      if (!motionAllowed() || !preferences.pointer) {
        x = y = vx = vy = tx = ty = 0;
      } else {
        [x, vx] = spring(x, vx, tx, delta, 13);
        [y, vy] = spring(y, vy, ty, delta, 13);
      }
      icon.style.translate = `${x}px ${y}px`;
      return (
        Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(vx) + Math.abs(vy) >
        0.025
      );
    }
    link.addEventListener("pointerenter", () => {
      bounds = link.getBoundingClientRect();
    });
    link.addEventListener(
      "pointermove",
      (event) => {
        if (
          !motionAllowed() ||
          !preferences.pointer ||
          event.pointerType !== "mouse" ||
          !bounds
        )
          return;
        tx =
          clamp((event.clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5) *
          7;
        ty =
          clamp((event.clientY - bounds.top) / bounds.height - 0.5, -0.5, 0.5) *
          5;
        wake(draw);
      },
      { passive: true },
    );
    link.addEventListener("pointerleave", () => {
      tx = ty = 0;
      wake(draw);
    });
    window.addEventListener("artifacts:motion", () => wake(draw));
  });
}
