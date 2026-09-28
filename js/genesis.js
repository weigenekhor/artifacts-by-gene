import { drawIdentityField } from "./identity-field.js";
import { drawOrigin } from "./origin-construction.js";
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const mix = (a, b, t) => a + (b - a) * t;
const ease = (v) => {
  const x = clamp(v);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const LENGTH = 6.8;
export function createGenesis(section, wake) {
  const field = section.querySelector(".identity-field"),
    canvas = field.querySelector("canvas"),
    ctx = canvas.getContext("2d");
  const home = document.querySelector(".collection-home"),
    homeParent = home.parentElement;
  const intro = section.querySelector(".genesis-intro"),
    film = section.querySelector(".origin-film");
  const captions = [...section.querySelectorAll(".origin-caption")].map(
    (el) => ({
      el,
      start: +el.dataset.originStart,
      end: +el.dataset.originEnd,
      still: +el.dataset.originStill,
    }),
  );

  if (ctx) field.classList.add("ready");
  let collectionTop = 0,
    width = 1,
    height = 1,
    distance = 1,
    top = 0,
    dpr = 1,
    progress = 0,
    clock = 0,
    yaw = 0,
    pitch = 0,
    keyX = 0,
    keyY = 0,
    lastDraw = "",
    stillsDirty = true;
  document.fonts.ready.then(() => {
    lastDraw = "";
    stillsDirty = true;
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
  function drawStills() {
    captions.forEach(({ el, still }) => {
      const surface = el.querySelector("canvas"),
        context = surface.getContext("2d");
      if (!context) return;
      const w = surface.clientWidth || width,
        h = w * 0.62;
      surface.width = Math.round(w * dpr);
      surface.height = Math.round(h * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawOrigin(context, { width: w, height: h, p: still });
    });
    stillsDirty = false;
  }
  return {
    measure() {
      width = section.clientWidth;
      height = innerHeight;
      top = section.offsetTop;
      distance = Math.max(1, section.offsetHeight - height);
      collectionTop = homeParent.closest(".tools-entry").offsetTop;
      dpr = Math.min(devicePixelRatio || 1, width <= 700 ? 1.5 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      section.querySelector(".story-anchor").style.top =
        (matchMedia("(prefers-reduced-motion: reduce)").matches
          ? height
          : (distance * 1.3) / LENGTH) + "px";
      lastDraw = "";
      stillsDirty = true;
    },
    get state() {
      return { yaw, pitch, progress };
    },
    update(y, time, dt, px, py, reduced) {
      if (reduced && stillsDirty) drawStills();
      if (y + height < top || y > top + distance + height) {
        if (home.parentElement !== homeParent) {
          homeParent.append(home);
          home.classList.remove("origin-home");
          home.inert = false;
        }
        return false;
      }
      const target = clamp((y - top) / distance) * LENGTH;
      progress = reduced ? 0 : mix(progress, target, 1 - Math.exp(-dt / 60));
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
        light = ease((p - 0.75) / 0.6) * (1 - ease((p - 5.25) / 0.75));
      section.style.setProperty("--intro", 1 - ease((p - 0.38) / 0.38));
      section.style.setProperty(
        "--story",
        ease((p - 0.97) / 0.18) * (1 - ease((p - 5.38) / 0.22)),
      );
      section.style.setProperty("--travel", clamp(p / LENGTH));
      section.style.setProperty("--reading-ink", "#e1ebee");
      section.style.setProperty("--reading-muted", "#9eb8c5");
      section.style.setProperty("--light", light);
      intro.inert = !reduced && p > 0.65;
      film.inert = !reduced && (p < 1 || p > 5.6);
      let current = -1;
      captions.forEach(({ el, start, end }, i) => {
        const opacity =
          ease((p - start) / 0.16) * (1 - ease((p - end + 0.14) / 0.14));
        const showing = p >= start && p <= end;
        if (showing) current = i;
        el.style.setProperty("--caption", opacity);
        el.classList.toggle("current", showing);
        el.inert = !reduced && !showing;
        el.setAttribute("aria-hidden", String(!reduced && !showing));
      });
      section.dataset.originBeat = String(current);
      // One actual homepage element crosses the chapter boundary, in both directions.

      const transferring = !reduced && p > 5.62 && y < collectionTop;
      if (transferring) {
        if (home.parentElement !== section.querySelector(".genesis-stage"))
          section.querySelector(".genesis-stage").append(home);
        home.classList.add("origin-home");
        home.style.opacity = ease((p - 5.62) / 0.42);
        home.style.top = "50%";
        home.style.transform = `translate(-50%,-50%) perspective(1600px) rotateX(${(1 - ease((p - 5.45) / 0.6)) * 20}deg)`;
        home.style.zIndex = "4";
        home.inert = p < 5.65;
      } else if (home.parentElement !== homeParent) {
        homeParent.append(home);
        home.classList.remove("origin-home");
        home.inert = false;
      }
      if (!transferring) {
        home.style.top = "50%";
        home.style.opacity = "1";
        home.style.transform = "translate(-50%,-50%)";
      }
      const moving = Math.abs(progress - target) > 0.0005;
      // Only the approved identity has ambient motion. The film renders on scroll/pointer input.
      const ambient = p < 1.1;
      const frame = [
        p.toFixed(4),
        yaw.toFixed(3),
        pitch.toFixed(3),
        reduced,
        ambient ? Math.floor(clock * 30) : 0,
      ].join("|");
      if (!ctx || frame === lastDraw) return !reduced && (ambient || moving);
      lastDraw = frame;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (p < 1.32)
        drawIdentityField(ctx, {
          width,
          height,
          p,
          clock,
          px: yaw * 6,
          py: pitch * 10,
          reduced,
        });
      if (p > 0.84) {
        ctx.save();
        ctx.globalAlpha = ease((p - 0.84) / 0.48);
        drawOrigin(ctx, {
          width,
          height,
          p,
          clock,
          px: yaw * 6,
          py: pitch * 10,
        });
        ctx.restore();
      }
      return (
        !reduced &&
        (ambient ||
          moving ||
          Math.abs(yaw - clamp(px * 0.16 + keyX * 0.3, -0.4, 0.4)) > 0.001 ||
          Math.abs(pitch - clamp(py * 0.1 + keyY * 0.2, -0.25, 0.25)) > 0.001)
      );
    },
  };
}
