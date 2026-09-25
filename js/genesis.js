import { drawIdentityField } from "./identity-field.js";
// One camera and one persistent set of paths, from identity to construction.
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const mix = (a, b, t) => a + (b - a) * t;
const ease = (v) => {
  v = clamp(v);
  return v * v * v * (v * (v * 6 - 15) + 10);
};
const stages = [
  "Evidence has a history",
  "The reasoning returns",
  "Retain the useful sequence",
  "A method becomes software",
  "Enter what was built",
];

export function createGenesis(section, wake) {
  const field = section.querySelector(".identity-field"),
    canvas = field.querySelector("canvas"),
    ctx = canvas.getContext("2d");
  const pages = [...section.querySelectorAll(".construction-page")],
    controls = [...section.querySelectorAll("[data-origin-step]")];
  const legend = section.querySelector(".build-state");
  const intro = section.querySelector(".genesis-intro"),
    nav = section.querySelector(".construction-nav"),
    next = section.querySelector(".construction-next");
  if (ctx) field.classList.add("ready");
  let width = 1,
    height = 1,
    distance = 1,
    top = 0,
    dpr = 1,
    progress = 0,
    clock = 0,
    active = -2,
    lastDraw = "",
    keyX = 0,
    keyY = 0,
    yaw = 0,
    pitch = 0,
    previousReduced = null;
  document.fonts.ready.then(() => {
    lastDraw = "";
    wake();
  });
  field.addEventListener("keydown", (e) => {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "r", "R"].includes(
        e.key,
      )
    )
      return;
    e.preventDefault();
    if (e.key === "ArrowLeft") keyX = clamp(keyX - 0.2, -1, 1);
    if (e.key === "ArrowRight") keyX = clamp(keyX + 0.2, -1, 1);
    if (e.key === "ArrowUp") keyY = clamp(keyY - 0.2, -1, 1);
    if (e.key === "ArrowDown") keyY = clamp(keyY + 0.2, -1, 1);
    if (e.key.toLowerCase() === "r") keyX = keyY = 0;
    wake();
  });
  controls.forEach((b, i) =>
    b.addEventListener("click", () =>
      scrollTo({
        top: top + (distance * (1.25 + i)) / 6.2,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      }),
    ),
  );
  return {
    measure() {
      width = section.clientWidth;
      height = innerHeight;
      top = section.offsetTop;
      distance = Math.max(1, section.offsetHeight - height);
      dpr = Math.min(devicePixelRatio || 1, width <= 700 ? 1.5 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      section.querySelector(".story-anchor").style.top =
        (matchMedia("(prefers-reduced-motion: reduce)").matches
          ? height
          : distance * 0.19) + "px";
      lastDraw = "";
    },
    get state() {
      return { yaw, pitch, progress };
    },
    update(y, time, dt, px, py, reduced) {
      if (y + height < top || y > top + distance + height) return false;
      const target = clamp((y - top) / distance) * 6.2,
        mobile = width <= 700;
      progress = reduced ? 0 : mix(progress, target, 1 - Math.exp(-dt / 95));
      clock += reduced ? 0 : Math.min(dt, 40) / 1000;
      yaw = mix(
        yaw,
        reduced ? 0 : clamp(px * 0.16 + keyX * 0.3, -0.4, 0.4),
        1 - Math.exp(-dt / 170),
      );
      pitch = mix(
        pitch,
        reduced ? 0 : clamp(py * 0.1 + keyY * 0.2, -0.25, 0.25),
        1 - Math.exp(-dt / 170),
      );
      const p = progress,
        light = ease((p - 0.75) / 0.6) * (1 - ease((p - 4.8) / 0.85));
      const index = p < 0.95 ? -1 : Math.min(4, Math.floor(p - 1));
      const storyVisible = ease((p - 0.85) / 0.22),
        departure = ease((p - 5.3) / 0.4);
      section.style.setProperty("--intro", 1 - ease((p - 0.38) / 0.38));
      section.style.setProperty("--story", storyVisible * (1 - departure));
      section.style.setProperty("--light", light);
      section.style.setProperty("--exit", departure);
      section.style.setProperty("--travel", clamp(p / 6.2));
      section.style.setProperty(
        "--reading-ink",
        light > 0.48 ? "#26362f" : "#e5e8df",
      );
      section.style.setProperty(
        "--reading-muted",
        light > 0.48 ? "#5e6c60" : "#a9b6a5",
      );
      section.classList.toggle("construction-active", index >= 0);
      section.classList.toggle("construction-ending", p > 5.5);
      intro.inert = !reduced && p > 0.65;
      nav.inert = reduced || index < 0 || p > 5.5;
      next.inert = reduced || p < 5.8;
      if (index !== active || reduced !== previousReduced) {
        previousReduced = reduced;
        active = index;
        pages.forEach((page, i) => {
          const selected = i === index;
          page.classList.toggle("current", selected);
          page.inert = !reduced && !selected;
          page.setAttribute("aria-hidden", String(!reduced && !selected));
        });
        controls.forEach((b, i) =>
          b.setAttribute("aria-current", String(i === index)),
        );
        legend.textContent = stages[Math.max(0, index)];
      }
      // Canvas reuses topology; only its projection, construction and ink change.
      const frame = [
        p.toFixed(3),
        yaw.toFixed(3),
        pitch.toFixed(3),
        reduced,
        Math.floor(clock * 30),
      ].join("|");
      if (!ctx || frame === lastDraw) return false;
      lastDraw = frame;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      drawIdentityField(ctx, {
        width,
        height,
        p,
        clock,
        px: yaw * 6,
        py: pitch * 10,
        reduced,
      });
      return !reduced && (p < 6.18 || Math.abs(progress - target) > 0.001);
    },
  };
}
