import { at, mix, clamp, sample } from "./drawing.js";
export { at, mix, clamp, sample };
export const palette = {
  blue: "#619df6",
  cyan: "#45cbbd",
  amber: "#e1ac68",
  coral: "#e38d96",
  violet: "#b599ef",
  white: "#d9e0e3",
  muted: "#71838e",
  line: "#34454e",
  metal: "#263941",
};
// Shared optical primitives. Choreography and composition remain local to each film.
export function lens(d, W, H, m, accent = palette.cyan) {
  const c = d.c,
    ink = d.ink,
    muted = d.muted;
  const paper = ink === "#24352e",
    contrast = new Map([
      [palette.cyan, "#267685"],
      [palette.blue, "#385da4"],
      [palette.amber, "#96632c"],
      [palette.coral, "#9d4b4b"],
      [palette.violet, "#78579d"],
      [palette.white, "#253843"],
      [palette.muted, "#607884"],
    ]);
  const tone = (color) => (paper ? contrast.get(color) || color : color);
  function label(s, x, y, size = 19, color = muted, align = "left") {
    d.text(s, x, y, size, tone(color), align);
  }
  function line(points, color = accent, width = 1, alpha = 1) {
    d.alpha(alpha, () => d.line(points, tone(color), width));
  }
  function point(x, y, r = 3, color = accent) {
    d.dot(x, y, r, tone(color));
  }
  function path(points, color = accent, width = 1, progress = 1) {
    line(
      points.slice(0, Math.max(2, Math.round(points.length * clamp(progress)))),
      color,
      width,
    );
  }
  function trace(x, y, w, h, seed = 0, t = 1, color = accent, anomaly = false) {
    return d.trace(x, y, w, h, seed, t, tone(color), anomaly);
  }
  function surface(x, y, w, h, light = false) {
    c.save();
    c.shadowColor = "#0007";
    c.shadowBlur = 32;
    c.shadowOffsetY = 12;
    const gr = c.createLinearGradient(x, y, x + w, y + h);
    gr.addColorStop(0, light ? "#f0f1ed" : "#213039");
    gr.addColorStop(1, light ? "#cbd3d2" : "#0b141b");
    d.rect(x, y, w, h, gr);
    c.shadowBlur = 0;
    line(
      [
        [x, y + h],
        [x + w, y + h],
      ],
      light ? "#778990" : "#3f5861",
      3,
    );
    line(
      [
        [x, y],
        [x + w, y],
      ],
      light ? "#ffffff" : "#65808d",
      0.8,
      0.65,
    );
    c.restore();
  }
  function clip(fn) {
    c.save();
    c.beginPath();
    c.rect(12, 12, W - 24, H - 24);
    c.clip();
    fn();
    c.restore();
  }
  function atmosphere() {
    const gr = c.createRadialGradient(
      W * 0.56,
      H * 0.48,
      0,
      W * 0.56,
      H * 0.48,
      W * 0.58,
    );
    gr.addColorStop(0, d.ink === "#24352e" ? "#a9bdc515" : "#42638214");
    gr.addColorStop(1, "#00000000");
    d.rect(0, 0, W, H, gr);
  }
  atmosphere();
  return {
    c,
    W,
    H,
    m,
    accent,
    ink,
    muted,
    label,
    line,
    point,
    path,
    trace,
    surface,
    clip,
    alpha: d.alpha,
    rect: d.rect,
    arc: d.arc,
  };
}
export function waveform(seed, u, excursion = false) {
  return (
    sample(u, seed) +
    (excursion ? 0.27 * Math.exp(-(((u - 0.63) * 24) ** 2)) : 0)
  );
}
