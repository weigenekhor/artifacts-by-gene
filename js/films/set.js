import { studio, camera, C, TAU, points } from "./studio.js";
import { at, mix } from "./drawing.js";

// Shared cinematography and materials. Every film supplies its own set and score.
export { C, TAU, points, at, mix };
export function cinema(d, q, W, H, keys, mobile = false, map = null) {
  const cam = camera(q, keys);
  if (mobile) cam.zoom *= 1.22;
  const g = studio(d, W, H, { ...cam, cropLabels: true, map });
  const light = d.c.createRadialGradient(
    W * 0.57,
    H * 0.38,
    0,
    W * 0.55,
    H * 0.5,
    W * 0.63,
  );
  light.addColorStop(
    0,
    d.paper ? "rgba(255,255,255,.66)" : "rgba(114,135,154,.12)",
  );
  light.addColorStop(1, d.paper ? "rgba(223,224,217,0)" : "rgba(8,12,17,0)");
  d.c.fillStyle = light;
  d.c.fillRect(0, 0, W, H);
  return g;
}

export function block(g, p, size, color = C.graphite, opacity = 1, turn = 0) {
  const [w, h, z] = size;
  const vertex = (x, y, d) => [
    p[0] + x * Math.cos(turn) + d * Math.sin(turn),
    p[1] + y,
    p[2] + d * Math.cos(turn) - x * Math.sin(turn),
  ];
  if (opacity < 0.002 || w < 0.01 || h < 0.01 || z < 0.01) return;
  // A small machined bevel catches light while broad surfaces remain quiet.
  // Shared vertices avoid coplanar seams as the camera passes the object.
  const bevel = Math.min(3, w * 0.09, h * 0.09, z * 0.22);
  const ring = (inset, depth) => {
    const x = w / 2 - inset,
      y = h / 2 - inset,
      c = bevel;
    return [
      [-x + c, -y],
      [x - c, -y],
      [x, -y + c],
      [x, y - c],
      [x - c, y],
      [-x + c, y],
      [-x, y - c],
      [-x, -y + c],
    ].map(([a, b]) => vertex(a, b, depth));
  };
  const top = ring(bevel, z / 2),
    rim = ring(0, z / 2 - bevel),
    base = ring(0, -z / 2);
  g.face(top, color, opacity);
  g.face(
    [...base].reverse(),
    color.map((v) => v * 0.48),
    opacity,
  );
  for (let i = 0; i < 8; i++) {
    const j = (i + 1) % 8;
    g.face([top[i], rim[i], rim[j], top[j]], color, opacity);
    g.face([rim[i], base[i], base[j], rim[j]], color, opacity);
  }
}

export function wafer(
  g,
  p,
  r = 50,
  thickness = 4,
  color = C.blue,
  alpha = 1,
  notch = true,
) {
  if (alpha < 0.002) return;
  const n = r <= 18 ? 16 : r <= 32 ? 20 : 56;
  const v = (a, z) => {
    const radius = notch && Math.abs(a - Math.PI * 1.5) < 0.09 ? r * 0.945 : r;
    return [p[0] + Math.cos(a) * radius, p[1] + Math.sin(a) * radius, p[2] + z];
  };
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU,
      b = ((i + 1) / n) * TAU,
      A = v(a, 0),
      B = v(b, 0);
    g.face([p, A, B], color, alpha, [
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
    ]);
    g.face([A, v(a, -thickness), v(b, -thickness), B], C.dim, alpha, [
      [Math.cos(a), Math.sin(a), 0],
      [Math.cos(a), Math.sin(a), 0],
      [Math.cos(b), Math.sin(b), 0],
      [Math.cos(b), Math.sin(b), 0],
    ]);
  }
  g.ring([p[0], p[1], p[2] + 0.2], r, C.silver, 0.6, 0, TAU, alpha * 0.75);
}

export function shadow(g, p, r, lift = 0) {
  g.softShadow(p, r * (1.14 + lift * 0.001), 0.14 * (1 - lift / 400));
}

export function landscape(
  g,
  fn,
  {
    x = 0,
    y = 0,
    z = 0,
    w = 500,
    h = 300,
    nx = 42,
    ny = 20,
    color = C.blue,
    height = 70,
    alpha = 1,
    circular = false,
  } = {},
) {
  const pos = (u, v) => [
    x + (u - 0.5) * w,
    y + (v - 0.5) * h,
    z + fn(u, v) * height,
  ];
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const u = i / nx,
        v = j / ny;
      if (circular && Math.hypot(u + 0.5 / nx - 0.5, v + 0.5 / ny - 0.5) > 0.5)
        continue;
      const uv = [
        [u, v],
        [u + 1 / nx, v],
        [u + 1 / nx, v + 1 / ny],
        [u, v + 1 / ny],
      ];
      const ns = uv.map(([a, b]) => [
        ((-(fn(a + 0.002, b) - fn(a, b)) / 0.002) * height) / w,
        ((-(fn(a, b + 0.002) - fn(a, b)) / 0.002) * height) / h,
        1,
      ]);
      const colors = uv.map(([a, b]) =>
        color.map((c, k) =>
          mix(
            c,
            Math.min(255, color[k] + 72),
            Math.max(0, Math.min(0.85, fn(a, b) * 0.7 + 0.25)),
          ),
        ),
      );
      g.face(
        uv.map(([a, b]) => pos(a, b)),
        color,
        alpha,
        ns,
        colors,
      );
    }
}

// Labels have their own screen-space territories. No clamping into other labels.
export function note(d, W, H, text, sub = "", align = "left", alpha = 1) {
  const x = align === "center" ? W * 0.5 : align === "right" ? W - 28 : 28;
  d.alpha(alpha, () => {
    d.text(text, x, 42, W < 700 ? 25 : 23, d.ink, align);
    if (sub) d.text(sub, x, 72, W < 700 ? 21 : 17, d.muted, align);
  });
}

// A curve with material depth: reserved for measured evidence, not generic tracks.
export function curtain(g, path, floor, color, alpha = 1) {
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1],
      b = path[i];
    g.face([a, b, [b[0], b[1], floor], [a[0], a[1], floor]], color, alpha);
  }
  g.line(
    path,
    color.map((v) => mix(v, 245, 0.28)),
    1.6,
    alpha,
  );
}
export function spectral(t) {
  const stops = [
    [36, 65, 185],
    [31, 138, 226],
    [32, 210, 194],
    [92, 211, 119],
    [240, 216, 70],
    [255, 132, 45],
    [227, 66, 59],
  ];
  const v = Math.max(0, Math.min(0.9999, t)) * (stops.length - 1),
    i = Math.floor(v);
  return stops[i].map((n, k) => mix(n, stops[i + 1][k], v - i));
}
export function glow(d, g, point, radius, color, alpha = 0.25) {
  const p = g.project(point),
    r = radius * g.unit * Math.sqrt(p[3]);
  if (r < 1 || alpha < 0.002) return;
  const gradient = d.c.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
  gradient.addColorStop(0, `rgba(${color.join(",")},${alpha})`);
  gradient.addColorStop(1, `rgba(${color.join(",")},0)`);
  d.c.fillStyle = gradient;
  d.c.fillRect(p[0] - r, p[1] - r, r * 2, r * 2);
}
