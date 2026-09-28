import { space } from "../space.js";
import { at, mix, clamp } from "./drawing.js";
export { at, mix, clamp };
export const C = {
  ink: [26, 36, 48],
  graphite: [45, 56, 64],
  navy: [24, 43, 67],
  titanium: [129, 143, 151],
  silver: [191, 201, 207],
  paper: [228, 225, 214],
  blue: [40, 91, 165],
  ice: [102, 184, 209],
  teal: [23, 123, 126],
  emerald: [34, 151, 122],
  copper: [179, 109, 57],
  burgundy: [124, 49, 69],
  coral: [188, 85, 85],
  violet: [102, 80, 150],
  pale: [205, 212, 213],
};
export const colorMix = (a, b, t) => a.map((v, i) => mix(v, b[i], clamp(t)));
export const rgb = (c) => `rgb(${c.map(Math.round).join(",")})`;

// A photographic light stage. Scene geometry and camera remain owned by each film.
export function stage(d, W, H, camera = {}) {
  const c = d.c;
  const wash = c.createLinearGradient(0, 0, W * 0.3, H);
  wash.addColorStop(0, "#f6f5ef");
  wash.addColorStop(0.6, "#edeee8");
  wash.addColorStop(1, "#e1e5e3");
  c.fillStyle = wash;
  c.fillRect(0, 0, W, H);
  const g = space(c, {
    w: W,
    h: H,
    scale: 1.02,
    cy: 0.55,
    tilt: 0.74,
    segments: 56,
    rings: 2,
    cull: true,
    ...camera,
    yaw:
      (camera.yaw ?? -0.22) + (d.preview ? 0 : ((d.focus ?? 0.5) - 0.5) * 0.22),
  });
  const shadow = (p, rx = 180, ry = 45, opacity = 0.18) => {
    const [x, y] = g.project(p),
      u = g.unit;
    c.save();
    c.translate(x, y);
    c.scale(rx * u, ry * u);
    const v = c.createRadialGradient(0, 0, 0, 0, 0, 1);
    v.addColorStop(0, `rgba(24,38,48,${opacity})`);
    v.addColorStop(0.48, `rgba(24,38,48,${opacity * 0.48})`);
    v.addColorStop(1, "rgba(24,38,48,0)");
    c.fillStyle = v;
    c.beginPath();
    c.arc(0, 0, 1, 0, Math.PI * 2);
    c.fill();
    c.restore();
  };
  const label = (text, x, y, col = C.ink, size = 24, align = "center") =>
    d.text(text, W * x, H * y, size, rgb(col), align);
  return { g, shadow, label, finish: () => g.draw() };
}

// Solid prisms, sheets and machined annuli. No scene is constructed from DOM cards.
export function block(g, x, y, z, w, h, t, col = C.graphite, a = 1) {
  const p = [
      [x - w / 2, y - h / 2, z],
      [x + w / 2, y - h / 2, z],
      [x + w / 2, y + h / 2, z],
      [x - w / 2, y + h / 2, z],
    ],
    up = p.map(([x, y, z]) => [x, y, z + t]);
  g.poly(up, col, a);
  for (let i = 0; i < 4; i++)
    g.poly([p[i], p[(i + 1) % 4], up[(i + 1) % 4], up[i]], col, a);
}
export function beam(g, A, B, r, col = C.titanium, a = 1) {
  const v = B.map((x, i) => x - A[i]),
    length = Math.hypot(...v) || 1,
    u = v.map((x) => x / length),
    xy = Math.hypot(u[0], u[1]);
  const n = xy > 0.001 ? [(-u[1] / xy) * r, (u[0] / xy) * r, 0] : [r, 0, 0],
    b = [
      u[1] * n[2] - u[2] * n[1],
      u[2] * n[0] - u[0] * n[2],
      u[0] * n[1] - u[1] * n[0],
    ];
  const ends = [A, B].map((p) =>
    [
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, -1],
    ].map(([s, t]) => p.map((x, i) => x + n[i] * s + b[i] * t)),
  );
  g.poly(ends[0], col, a);
  g.poly(ends[1], col, a);
  for (let i = 0; i < 4; i++)
    g.poly(
      [ends[0][i], ends[0][(i + 1) % 4], ends[1][(i + 1) % 4], ends[1][i]],
      col,
      a,
    );
}
export function annulus(
  g,
  x,
  y,
  z,
  outer,
  inner,
  thick,
  col,
  start = 0,
  end = Math.PI * 2,
  alpha = 1,
  steps = 48,
) {
  const count = Math.max(2, Math.ceil((steps * (end - start)) / (Math.PI * 2)));
  for (let i = 0; i < count; i++) {
    const a = mix(start, end, i / count),
      b = mix(start, end, (i + 1) / count),
      pt = (r, a, z) => [x + Math.cos(a) * r, y + Math.sin(a) * r, z];
    g.poly(
      [
        pt(inner, a, z + thick),
        pt(outer, a, z + thick),
        pt(outer, b, z + thick),
        pt(inner, b, z + thick),
      ],
      col,
      alpha,
    );
    g.poly(
      [
        pt(outer, a, z),
        pt(outer, b, z),
        pt(outer, b, z + thick),
        pt(outer, a, z + thick),
      ],
      col,
      alpha,
    );
    g.poly(
      [
        pt(inner, b, z),
        pt(inner, a, z),
        pt(inner, a, z + thick),
        pt(inner, b, z + thick),
      ],
      col,
      alpha,
    );
  }
}
export function sheet(
  g,
  {
    x = 0,
    y = 0,
    z = 0,
    w = 360,
    h = 300,
    roll = 0,
    col = C.paper,
    alpha = 1,
  } = {},
) {
  const point = (u, v, lift = 0) => [
    x + (u - 0.5) * w,
    y + (v - 0.5) * h,
    z + Math.sin(u * Math.PI) * roll + lift,
  ];
  for (let i = 0; i < 14; i++)
    g.poly(
      [
        point(i / 14, 0),
        point((i + 1) / 14, 0),
        point((i + 1) / 14, 1),
        point(i / 14, 1),
      ],
      col,
      alpha,
    );
  for (const v of [0, 1])
    g.line(
      Array.from({ length: 15 }, (_, i) => point(i / 14, v)),
      colorMix(col, C.ink, 0.24),
      0.7,
      alpha,
    );
  g.poly(
    [point(0, 1), point(1, 1), point(1, 1, -3), point(0, 1, -3)],
    colorMix(col, C.ink, 0.32),
    alpha,
  );
  return point;
}
export function waveform(u, i = 0) {
  return 0.16 * Math.sin(u * 16 + i) + 0.06 * Math.cos(u * 41 + i * 0.7);
}
export function chart(
  g,
  point,
  {
    color = C.ice,
    seed = 0,
    failure = false,
    progress = 1,
    limits = true,
  } = {},
) {
  for (const v of [0.18, 0.5, 0.82])
    g.line([point(0.06, v, 1), point(0.94, v, 1)], C.titanium, 0.55, 0.34);
  if (limits)
    for (const v of [0.24, 0.76])
      g.line(
        [point(0.06, v, 1.3), point(0.94, v, 1.3)],
        failure ? C.copper : C.teal,
        0.8,
        0.65,
      );
  const pts = Array.from(
    { length: Math.max(2, Math.round(52 * progress)) },
    (_, j) => {
      const u = j / 51,
        v =
          0.5 +
          waveform(u, seed) +
          (failure ? 0.34 * Math.exp(-(((u - 0.64) * 28) ** 2)) : 0);
      return point(0.06 + u * 0.88, v, 3);
    },
  );
  g.line(pts, color, 1.7);
  for (let j = 3; j < pts.length; j += 8) g.dot(pts[j], 1.8, color);
}
export function ribbon(g, points, width, col, alpha = 1) {
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i],
      b = points[i + 1];
    g.poly(
      [
        [a[0], a[1] - width / 2, a[2]],
        [b[0], b[1] - width / 2, b[2]],
        [b[0], b[1] + width / 2, b[2]],
        [a[0], a[1] + width / 2, a[2]],
      ],
      col,
      alpha,
    );
    g.poly(
      [
        [a[0], a[1] - width / 2, a[2] - 3],
        [b[0], b[1] - width / 2, b[2] - 3],
        [b[0], b[1] - width / 2, b[2]],
        [a[0], a[1] - width / 2, a[2]],
      ],
      colorMix(col, C.ink, 0.25),
      alpha,
    );
  }
}
export function wafer(g, x, y, z, r, col = C.blue) {
  g.disc(x, y, z, r, 3, C.titanium);
  g.disc(x, y, z + 3, r - 2, 1, col);
  g.ring(x, y, z + 4.2, r - 2, C.silver, 0.65);
  for (let k = -4; k <= 4; k++) {
    const offset = (k * r) / 5,
      l = Math.sqrt(r * r - offset * offset) * 0.96;
    g.line(
      [
        [x - l, y + offset, z + 4.4],
        [x + l, y + offset, z + 4.4],
      ],
      C.silver,
      0.45,
      0.3,
    );
    g.line(
      [
        [x + offset, y - l, z + 4.4],
        [x + offset, y + l, z + 4.4],
      ],
      C.silver,
      0.45,
      0.3,
    );
  }
}
