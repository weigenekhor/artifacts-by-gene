import { studio, camera, C, TAU, points } from "./studio.js";
import { at, mix } from "./drawing.js";

// Shared cinematography and materials. Every film supplies its own set and score.
export { C, TAU, points, at, mix };
export function cinema(d, q, W, H, keys, mobile = false, map = null) {
  const cam = camera(q, keys);
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

export function rail(
  g,
  path,
  width = 22,
  depth = 9,
  color = C.silver,
  alpha = 1,
) {
  if (alpha < 0.002) return;
  const normals = path.map((p, i) => {
    const a = path[Math.max(0, i - 1)],
      b = path[Math.min(path.length - 1, i + 1)];
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      dz = b[2] - a[2];
    return [-dz * dx, -dz * dy, dx * dx + dy * dy];
  });
  const edges = path.map((p, i) => {
    const a = path[Math.max(0, i - 1)],
      b = path[Math.min(path.length - 1, i + 1)],
      len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = ((-(b[1] - a[1]) / len) * width) / 2,
      ny = (((b[0] - a[0]) / len) * width) / 2;
    return [
      [p[0] + nx, p[1] + ny, p[2]],
      [p[0] - nx, p[1] - ny, p[2]],
    ];
  });
  for (let i = 1; i < path.length; i++) {
    const [A, D] = edges[i - 1],
      [B, E] = edges[i];
    g.face([A, B, E, D], color, alpha, [
      normals[i - 1],
      normals[i],
      normals[i],
      normals[i - 1],
    ]);
    g.face(
      [A, [A[0], A[1], A[2] - depth], [B[0], B[1], B[2] - depth], B],
      C.dim,
      alpha,
    );
    g.face(
      [D, E, [E[0], E[1], E[2] - depth], [D[0], D[1], D[2] - depth]],
      C.dim,
      alpha,
    );
    g.line([A, B], C.pale, 0.45, alpha * 0.55);
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
  const n = r <= 28 ? 32 : 56;
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

export function portal(g, p, w, h, open = 1, color = C.silver) {
  block(g, [p[0] - w / 2, p[1], p[2]], [6, h, 10], color, open);
  block(g, [p[0] + w / 2, p[1], p[2]], [6, h, 10], color, open);
  block(g, [p[0], p[1] - h / 2, p[2]], [w, 6, 10], color, open);
  block(g, [p[0], p[1] + h / 2, p[2]], [w, 6, 10], color, open);
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
            C.copper[k],
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
