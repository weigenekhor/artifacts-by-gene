import { space } from "../space.js";
export const clamp = (v) => Math.max(0, Math.min(1, v));
export const mix = (a, b, t) => a + (b - a) * t;
export const ease = (v) => {
  const t = clamp(v);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
export const at = (p, s, d) => ease((p - s) / d);
export const settle = (v) => {
  const x = clamp(v);
  return (1 - (1 + 8 * x) * Math.exp(-8 * x)) / (1 - 9 * Math.exp(-8));
};
export const sample = (u, i = 0) =>
  0.48 + 0.11 * Math.sin(u * 13 + i) + 0.035 * Math.sin(u * 37 + i * 2);
// A shared lens and materials; each film owns its geometry and sequence.
export const colors = {
  cyan: [71, 205, 216], cobalt: [74, 115, 230], coral: [240, 117, 91],
  amber: [230, 178, 83], emerald: [58, 181, 137], violet: [155, 130, 224],
  silver: [179, 199, 202], graphite: [30, 46, 53], paper: [195, 211, 211],
};
export const world = (d, W, H, mobile, options = {}) => space(d.c, {
  w: W, h: H, cy: 0.55,
  yaw: -0.13, tilt: 0.58, ...options, scale: mobile ? 1.12 : (options.scale ?? 1.32),
});
export function sheet(g, x, y, z, w, h, color = colors.graphite) {
  return g.box(x, y, z, w, h, 3, color);
}
export function curve(g, x, y, z, w, h, seed, progress, color, excursion = false) {
  const pts = [];
  for (let i = 0; i <= 70 * clamp(progress); i++) {
    const u = i / 70;
    const v = sample(u, seed) + (excursion ? 0.35 * Math.exp(-(((u - 0.68) * 28) ** 2)) : 0);
    pts.push([x + u * w, y + h * (0.5 - v), z]);
  }
  g.line(pts, color, 2);
}
// Drawing primitives share typography and strokes, never application choreography.
export function drawing(c, paper, mobile) {
  const ink = paper ? "#24352e" : "#e3e7dd",
    muted = paper ? "#647266" : "#9aad9f",
    faint = paper ? "#c5cdbd" : "#33463e",
    accent = paper ? "#965c36" : "#dfb38a",
    teal = paper ? "#397c71" : "#8db9ab",
    wash = paper ? "#e1e7d9" : "#13221d";
  const alpha = (v, fn) => {
    c.save();
    c.globalAlpha *= clamp(v);
    fn();
    c.restore();
  };
  const text = (s, x, y, size = 18, color = ink, align = "left") => {
    c.font = `400 ${Math.max(size, mobile ? 21 : 16)}px Geist,Arial`;
    c.fillStyle = color;
    c.textAlign = align;
    c.fillText(s, x, y);
    c.textAlign = "left";
  };
  const line = (pts, color = faint, width = 1) => {
    if (pts.length < 2) return;
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.strokeStyle = color;
    c.lineWidth = width;
    c.stroke();
  };
  const rect = (x, y, w, h, fill = wash, stroke = null) => {
    if (fill) {
      c.fillStyle = fill;
      c.fillRect(x, y, w, h);
    }
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = 1;
      c.strokeRect(x, y, w, h);
    }
  };
  const dot = (x, y, r = 3, color = accent) => {
    c.beginPath();
    c.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
    c.fillStyle = color;
    c.fill();
  };
  const arc = (
    x,
    y,
    r,
    color = faint,
    width = 1,
    start = 0,
    end = Math.PI * 2,
  ) => {
    c.beginPath();
    c.arc(x, y, Math.max(0, r), start, end);
    c.strokeStyle = color;
    c.lineWidth = width;
    c.stroke();
  };
  const path = (a, b, color = muted, width = 1, progress = 1) => {
    c.save();
    c.beginPath();
    c.moveTo(...a);
    c.bezierCurveTo(
      mix(a[0], b[0], 0.5),
      a[1],
      mix(a[0], b[0], 0.5),
      b[1],
      ...b,
    );
    c.strokeStyle = color;
    c.lineWidth = width;
    if (progress < 1) {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) * 1.4;
      c.setLineDash([len * progress, len * 2]);
    }
    c.stroke();
    c.restore();
  };
  const trace = (
    x,
    y,
    w,
    h,
    seed = 0,
    draw = 1,
    color = teal,
    excursion = false,
    offset = 0,
  ) => {
    const pts = [];
    for (let j = 0; j <= 120 * clamp(draw); j++) {
      const u = j / 120,
        v =
          sample(u + offset, seed) +
          (excursion ? 0.28 * Math.exp(-(((u - 0.65) * 24) ** 2)) : 0);
      pts.push([x + u * w, y + h * (1 - v)]);
    }
    line(pts, color, 1.8);
    return pts;
  };
  return {
    c,
    ink,
    muted,
    faint,
    accent,
    teal,
    wash,
    alpha,
    text,
    line,
    rect,
    dot,
    arc,
    path,
    trace,
  };
}
