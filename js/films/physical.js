import { baseplateExample, temperatureSpan } from "../baseplate-example.js";
import { space } from "../space.js";
import { mix, at } from "./drawing.js";
const seats = Array.from({ length: 5 }, (_, i) => {
  const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
  return [Math.cos(a) * 142, Math.sin(a) * 142];
});
const carbon = [32, 42, 48],
  metal = [104, 122, 132],
  edge = [170, 184, 187],
  cool = [51, 216, 197],
  warm = [231, 166, 79];
function carrier(g) {
  g.disc(0, 0, -30, 211, 17, carbon);
  g.ring(0, 0, -12, 209, edge, 1.1);
  g.ring(0, 0, -11, 200, metal, 0.5);
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    g.line(
      [
        [Math.cos(a) * 203, Math.sin(a) * 203, -11],
        [Math.cos(a) * 207, Math.sin(a) * 207, -11],
      ],
      metal,
      0.65,
    );
  }
  seats.forEach(([x, y]) => {
    g.disc(x, y, -12, 57, 3, [18, 28, 34]);
    g.ring(x, y, -8, 57, metal, 0.8);
  });
}
function plate(g, x, y, z, i, selected, heat = 0) {
  g.disc(x, y, z, 52, 11, metal);
  g.ring(x, y, z + 11, 51, edge, 1);
  g.disc(x, y, z + 11.2, 47, 1, [51, 68, 78]);
  for (let j = 0; j < 5; j++)
    g.ring(x, y, z + 12.3, 13 + j * 7, [81, 100, 111], 0.35);
  for (let j = 0; j < 6; j++) {
    const a = (j * Math.PI) / 3;
    g.dot([x + Math.cos(a) * 41, y + Math.sin(a) * 41, z + 12.5], 1.6, carbon);
  }
  if (heat > 0) g.ring(x, y, z + 13, 48, warm, 2, 0, Math.PI * 2 * heat);
  if (selected) g.ring(x, y, z + 13, 54, cool, 1.5);
}
function exchange(a, b, t, out) {
  // Release and rise, hold at clearance, translate, then make contact. No spring bounce.
  const lift = at(t, 0, 0.22) * (1 - at(t, 0.78, 0.22)),
    travel = at(t, 0.28, 0.42);
  for (const [from, to, sign] of [
    [a, b, 1],
    [b, a, -1],
  ]) {
    const A = seats[from],
      B = seats[to];
    out[from] = [
      mix(A[0], B[0], travel) + Math.sin(Math.PI * travel) * sign * 32,
      mix(A[1], B[1], travel),
      lift * (sign > 0 ? 88 : 54),
    ];
  }
}
export function arrange(d, q, f, W, H, m, hit, alternate = 0) {
  const first = at(q, 0.13, 0.28) * (1 - alternate),
    second = at(q, 0.51, 0.29) * (1 - alternate),
    active = Math.min(4, Math.floor(f * 5));
  const g = space(d.c, {
    w: W,
    h: H,
    segments: 40,
    rings: 2,
    scale: m ? 1.4 : 1.08,
    cy: 0.48,
    yaw: mix(-0.18, 0.12, at(q, 0.4, 0.42)),
    tilt: mix(0.6, 0.8, at(q, 0.14, 0.3)),
  });
  carrier(g);
  const pos = seats.map((v) => [...v, 0]);
  exchange(2, 4, first, pos);
  exchange(0, 1, second, pos);
  const state = second > 0.995 ? 2 : first > 0.995 ? 1 : 0;
  pos.forEach(([x, y, z], i) => {
    plate(
      g,
      x,
      y,
      z,
      i,
      i === active,
      [0.35, 0.7, 0.12, 0.52, 0.9][i] * (1 - second),
    );
    const p = g.project([x, y, z]);
    hit((i + 0.5) / 5, p[0] - 38, p[1] - 32, 76, 64, "BP" + (i + 1));
    if (z > 1)
      g.line(
        [
          [x, y, -8],
          [x, y, z],
        ],
        metal,
        0.7,
        0.25,
      );
  });
  g.draw();
  const label =
    second > 0.995
      ? "Assignment settled"
      : second > 0
        ? "Second exchange"
        : first > 0.995
          ? "Re-evaluate the assignment"
          : first > 0
            ? "First exchange"
            : "Measured offsets, different positions";
  d.text(label, W * 0.5, H * 0.07, m ? 23 : 24, d.ink, "center");
  d.text(
    "ΔT " + temperatureSpan(baseplateExample.states[state]) + " °C",
    W * 0.5,
    H * 0.91,
    m ? 26 : 29,
    d.ink,
    "center",
  );
  d.text("Illustrative assignment", W * 0.5, H * 0.98, 16, d.muted, "center");
  return (
    "BP" +
    (active + 1) +
    " · two physical exchanges · synthetic temperature example"
  );
}
export function zones(d, q, f, W, H, m, hit) {
  const active = Math.min(4, Math.floor(f * 5)),
    overhead = at(q, 0.37, 0.3),
    inner = at(q, 0.19, 0.24),
    outer = at(q, 0.49, 0.24);
  const g = space(d.c, {
    w: W,
    h: H,
    segments: 40,
    rings: 2,
    scale: m ? 1.32 : 0.93,
    cy: 0.54,
    yaw: mix(-0.2, 0, overhead),
    tilt: mix(0.95, 0.12, overhead),
  });
  carrier(g);
  seats.forEach(([x, y], i) => {
    g.disc(x, y, -5, 53, 3, [59, 75, 92]);
    g.ring(x, y, -1, 52, [136, 158, 176], 0.7);
    // Intersections with the global LayTec measurement radii, clipped geometrically to each wafer.
    for (const [radius, t, col] of [
      [119, inner, cool],
      [171, outer, warm],
    ]) {
      const angle = Math.atan2(y, x),
        span = 0.22;
      for (let k = 0; k < 30 * t; k++) {
        const a = angle - span + (k / 30) * span * 2,
          b = a + (span * 2) / 30;
        const verts = [radius - 7, radius + 7].flatMap((r) => [
          [Math.cos(a) * r, Math.sin(a) * r, 2],
          [Math.cos(b) * r, Math.sin(b) * r, 2],
        ]);
        g.poly(
          [verts[0], verts[2], verts[3], verts[1]],
          col,
          i === active ? 1 : 0.82,
        );
      }
    }
    g.label("S" + (i + 1), [x, y + 5, 5], 19, edge, "center");
    const p = g.project([x, y, 0]);
    hit((i + 0.5) / 5, p[0] - 40, p[1] - 40, 80, 80, "S" + (i + 1));
  });
  const [x, y] = seats[active],
    a = Math.atan2(y, x);
  for (const [r, t, c] of [
    [119, inner, cool],
    [171, outer, warm],
  ])
    if (t > 0)
      g.line(
        [
          [0, 0, 8],
          [Math.cos(a) * r, Math.sin(a) * r, 8],
        ],
        c,
        1.5,
        t,
      );
  g.draw();
  d.text("Inner", W * 0.23, H * 0.08, 22, "#56afbc", "center");
  d.text("Outer", W * 0.77, H * 0.08, 22, "#d3a467", "center");
  return (
    "S" +
    (active + 1) +
    " · highlighted arcs show where LayTec measures on the wafer"
  );
}
