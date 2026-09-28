import { C, TAU, points, at, mix, spectral } from "./set.js";

// Three mathematical obstacles share one measurable space. No machinery,
// transported input, or claim that the real applications exchange data.
export function drawWork(g, p) {
  const reference = at(p, 1.7, 0.65),
    register = at(p, 2.85, 0.55),
    isolate = at(p, 3.65, 0.55);
  // A surface has observations but lacks a datum. Reference gives height meaning.
  const amplitude = mix(5, 72, reference);
  const fn = (u, v) =>
    Math.exp(-((u - 0.25) ** 2 + (v + 0.1) ** 2) * 4) -
    0.42 * Math.exp(-((u + 0.45) ** 2 + (v - 0.2) ** 2) * 9);
  for (let j = 0; j < 17; j++)
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * TAU,
        b = ((i + 1) / 36) * TAU,
        r = (j / 17) * 183,
        R = ((j + 1) / 17) * 183;
      const v = [
        [r, a],
        [R, a],
        [R, b],
        [r, b],
      ].map(([r, a]) => {
        const x = Math.cos(a) * r,
          y = Math.sin(a) * r;
        return [-600 + x, y, fn(x / 183, y / 183) * amplitude + 35];
      });
      const ns = v.map(([x, y]) => {
        const u = (x + 600) / 183,
          v = y / 183;
        return [
          ((-(fn(u + 0.002, v) - fn(u, v)) / 0.002) * amplitude) / 183,
          ((-(fn(u, v + 0.002) - fn(u, v)) / 0.002) * amplitude) / 183,
          1,
        ];
      });
      g.face(
        v,
        C.cobalt,
        0.92,
        ns,
        v.map(([x, y]) => {
          const t = (fn((x + 600) / 183, y / 183) + 0.5) / 1.5;
          return C.cobalt.map((c, k) => mix(c, C.cyan[k], t));
        }),
      );
    }
  for (let i = 0; i < 32; i++) {
    const a = i * 2.39996,
      r = Math.sqrt(i / 32) * 174,
      x = Math.cos(a) * r,
      y = Math.sin(a) * r,
      z = fn(x / 183, y / 183) * amplitude + 35;
    g.dot([-600 + x, y, z + 2], 2.7, C.cyan);
    g.line(
      [
        [-600 + x, y, -55],
        [-600 + x, y, z],
      ],
      C.cobalt,
      0.6,
      reference * 0.5,
    );
  }
  g.ring(
    [-600, 0, mix(-220, -55, reference)],
    185,
    C.cobalt,
    1.3,
    0,
    TAU,
    reference,
  );
  for (let k = 0; k < 3; k++)
    g.ring([-600, 0, -55], 45 + k * 52, C.dim, 0.6, 0, TAU, reference * 0.38);
  // Two shaped boundaries miss in three axes before one coordinate transform.
  const miss = (1 - register) * (25 + Math.sin(p * 13) * 13);
  for (let layer = 0; layer < 2; layer++) {
    const path = points(128, (t) => {
      const a = t * TAU,
        r = 138 + 22 * Math.cos(3 * a) + 9 * Math.sin(5 * a);
      return [
        Math.cos(a) * r + (layer ? miss : 0),
        Math.sin(a) * r + (layer ? -miss * 0.8 : 0),
        layer ? mix(125, 9, register) : 0,
      ];
    });
    g.line(path, layer ? C.coral : C.cobalt, layer ? 2 : 1.5, 0.9);
    for (let i = 0; i < path.length - 1; i += 4) {
      const a = path[i],
        b = path[i + 1];
      g.face(
        [
          a,
          b,
          [b[0] * 0.78, b[1] * 0.78, b[2] - 18],
          [a[0] * 0.78, a[1] * 0.78, a[2] - 18],
        ],
        layer ? C.coral : C.cobalt,
        0.55,
      );
    }
  }
  for (let i = 0; i < 8; i++) {
    const a = (i * TAU) / 8;
    g.line(
      [
        [Math.cos(a) * 171, Math.sin(a) * 171, -10],
        [Math.cos(a) * 185, Math.sin(a) * 185, -10],
      ],
      C.dim,
      1,
    );
  }
  // A deep observation volume hides the relevant section. Selection opens the
  // space physically, keeping the evidence at its original coordinates.
  for (let layer = 0; layer < 9; layer++) {
    const relevant = layer === 4,
      z = (layer - 4) * 30;
    const retreat = relevant ? 0 : isolate * Math.sign(layer - 4) * 150;
    const path = points(80, (t) => {
      const y = (t - 0.5) * 340,
        x = 35 * Math.sin(t * 9) + 54 * Math.exp(-(((t - 0.55) * 7) ** 2));
      return [600 + x, y, z + retreat];
    });
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1],
        b = path[i];
      g.face(
        [a, b, [600 - 75, b[1], b[2]], [600 - 75, a[1], a[2]]],
        relevant ? C.emerald : C.dim,
        relevant ? 0.8 : 0.18 * (1 - isolate * 0.95),
      );
    }
    g.line(
      path,
      relevant ? C.emerald : C.dim,
      relevant ? 2.4 : 0.7,
      relevant ? 1 : 1 - isolate * 0.92,
    );
    if (relevant) for (let i = 0; i < 80; i += 8) g.dot(path[i], 3, C.emerald);
  }
}
