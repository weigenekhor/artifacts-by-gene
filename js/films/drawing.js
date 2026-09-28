export const clamp = (v) => Math.max(0, Math.min(1, v));
export const mix = (a, b, t) => a + (b - a) * t;
export const ease = (v) => {
  const t = clamp(v);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
export const at = (p, s, d) => ease((p - s) / d);
export const sample = (u, i = 0) =>
  0.48 + 0.11 * Math.sin(u * 13 + i) + 0.035 * Math.sin(u * 37 + i * 2);
// Drawing primitives share typography and strokes, never application choreography.
export function drawing(c, paper, mobile) {
  const ink = paper ? "#20252a" : "#eeeae2",
    muted = paper ? "#525d67" : "#a4adb5",
    faint = paper ? "#c7ccd0" : "#303943",
    accent = paper ? "#96542f" : "#dca77b",
    teal = paper ? "#637b86" : "#a6bac4",
    wash = paper ? "#e8e9e5" : "#11171d";
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
    paper,
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
