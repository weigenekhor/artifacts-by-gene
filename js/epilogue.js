import { at, mix } from "./films/drawing.js";
// The last shared time reference survives into the personal closing, then becomes a rule.
export function createEpilogue(section) {
  const stage = section.querySelector(".creator-stage"),
    passages = [...section.querySelectorAll(".creator-passage")],
    canvas = section.querySelector("canvas"),
    ctx = canvas.getContext("2d");
  let top = 0,
    distance = 1,
    w = 1,
    h = 1,
    dpr = 1,
    compact = false,
    last = -1;
  return {
    measure() {
      top = section.offsetTop;
      distance = Math.max(1, section.offsetHeight - innerHeight);
      w = stage.clientWidth;
      h = stage.clientHeight;
      dpr = Math.min(devicePixelRatio || 1, 2);
      compact = innerHeight <= 600;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      last = -1;
    },
    update(y, reduced) {
      if (reduced || compact) {
        passages.forEach((e) => {
          e.style.transform = "none";
          e.style.clipPath = "none";
          e.style.visibility = "visible";
          e.inert = false;
          e.removeAttribute("aria-hidden");
        });
        last = -1;
        return;
      }
      const p = Math.max(0, Math.min(1, (y - top) / distance));
      if (last === p) return;
      last = p;
      passages.forEach((el, i) => {
        const start = i * 0.235,
          entry = at(p, start - 0.05, 0.11),
          exit = i === 3 ? 0 : at(p, start + 0.16, 0.065),
          show = p >= start - 0.05 && (i === 3 || p <= start + 0.23);
        el.style.clipPath = `inset(0 ${100 * (1 - entry)}% 0 0)`;
        el.style.transform = `perspective(1400px) translate3d(${exit * -w * 0.85}px,${(1 - entry) * h * 0.04}px,${-110 * (1 - entry)}px)`;
        el.style.visibility = show ? "visible" : "hidden";
        el.inert = !show;
        el.setAttribute("aria-hidden", String(!show));
      });
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const contract = at(p, 0, 0.19),
        x = w * mix(0.63, 0.075, contract),
        cy = h * 0.5;
      ctx.strokeStyle = "#628381";
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(x, h * 0.08);
      ctx.lineTo(x, h * 0.9);
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < 100; i++) {
        const u = i / 99,
          xx = mix(w * 0.1, w * 0.9, u),
          yy = cy + Math.sin(u * 13) * h * 0.025 * (1 - contract);
        if (!i) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      }
      ctx.globalAlpha = 1 - contract;
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
  };
}
