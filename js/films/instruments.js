import {
  cinema,
  block,
  wafer,
  shadow,
  note,
  C,
  TAU,
  points,
  at,
  mix,
  spectral,
} from "./set.js";
import { index } from "./studio.js";

export function usage(d, q, f, W, H, m, hit) {
  const total = [24, 36, 48][index(f, 3)],
    settle = at(q, 0.65, 0.18);
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.15, 0.85, 2.8, -180, -90, 0],
      [0.18, 0.25, 1.02, 2, -100, -30, 30],
      [0.42, -0.28, 0.68, 1.12, 0, 0, -40],
      [0.68, -0.16, 0.64, 0.92, 0, 0, -60],
      [0.86, -0.1, 0.52, 1.06, -30, 15, -40],
      [1, -0.1, 0.52, 1.06, -30, 15, -40],
    ],
    m,
  );
  let completed = 0;
  for (let i = total - 1; i >= 0; i--) {
    const t = at(
        q,
        i === 0 ? 0.025 : 0.16 + ((i - 1) / (total - 1)) * 0.4,
        0.14,
      ),
      x = ((i % 8) - 3.5) * 80,
      y = (Math.floor(i / 8) - 2.5) * 77;
    if (t > 0.99) completed++;
    const p = [
      mix(x, x * 0.47 - 165, settle),
      mix(y, y * 0.47 + 25, settle),
      mix(-180, 10, t) - Math.floor(i / 8) * 10,
    ];
    if (t > 0.001) {
      const radius = mix(31, 14, settle);
      if (i === 0 && q < 0.38) wafer(g, p, radius, 2, [65, 120, 162], t);
      else {
        // Small completed discs need one lit cap, not buried side tessellation.
        const edge = points(20, (u) => [
          p[0] + Math.cos(u * TAU) * radius,
          p[1] + Math.sin(u * TAU) * radius,
          p[2],
        ]);
        g.face(edge.slice(0, -1), t > 0.94 ? [65, 120, 162] : C.cobalt, t);
        g.line(edge, C.cyan, 0.75, t);
      }
      if (t < 0.995)
        g.arc(
          [p[0], p[1], p[2] + 1],
          mix(34, 16, settle),
          2,
          -Math.PI / 2,
          -Math.PI / 2 + TAU * t,
          C.cyan,
          t * (1 - settle * 0.5),
        );
    }
  }
  g.draw();
  if (q > 0.76)
    d.alpha(at(q, 0.76, 0.07), () => {
      d.text(String(completed), W * 0.7, H * 0.54, 98, d.ink, "center");
      d.text("wafers processed", W * 0.7, H * 0.54 + 38, 21, d.muted, "center");
    });
  return (
    "Illustrative " +
    total +
    "-wafer count. WaferCount reads the latest chamber counters; the scene does not imply an event-history parser."
  );
}

const height = (x, y) =>
  0.76 * Math.exp(-((x - 0.75) ** 2 + (y + 0.2) ** 2) * 0.7) -
  0.45 * Math.exp(-((x + 1.1) ** 2 + (y - 0.65) ** 2) * 1.3) +
  0.13 * Math.sin(x * 1.4 + y);
export function surface(d, q, f, W, H, m, hit) {
  const grow = at(q, 0.12, 0.22),
    map = at(q, 0.51, 0.18),
    cut = at(q, 0.68, 0.16),
    mode = index(f, 2);
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.34, 1.25, 3.8, 0, 0],
      [0.15, -0.35, 1.1, 2.2, -30, -15],
      [0.37, 0.1, 1.13, 1.6, 28, 0],
      [0.6, 0, 0.08, 1.25, 0, 0],
      [0.75, -0.14, 0.3, 1.05, 0, 0],
      [1, -0.2, 0.52, 1.05, 0, 0],
    ],
    m,
  );
  const radius = 222,
    amplitude = 105 * (1 - map * 0.83),
    sectors = 64,
    rings = 20;
  const vertex = (r, a) => {
    const x = Math.cos(a) * r,
      y = Math.sin(a) * r;
    return [x, y, height(x / 85, y / 85) * amplitude * grow];
  };
  for (let j = 0; j < rings; j++)
    for (let i = 0; i < sectors; i++) {
      const a = (i / sectors) * TAU,
        b = ((i + 1) / sectors) * TAU,
        v = [
          vertex((j / rings) * radius, a),
          vertex(((j + 1) / rings) * radius, a),
          vertex(((j + 1) / rings) * radius, b),
          vertex((j / rings) * radius, b),
        ];
      const normals = v.map(([x, y]) => [
        ((-(height(x / 85 + 0.002, y / 85) - height(x / 85, y / 85)) / 0.002) *
          amplitude) /
          85,
        ((-(height(x / 85, y / 85 + 0.002) - height(x / 85, y / 85)) / 0.002) *
          amplitude) /
          85,
        1,
      ]);
      const colors = v.map(([x, y]) => {
        const t = Math.max(
          0,
          Math.min(1, (height(x / 85, y / 85) + 0.45) / 1.2),
        );
        return spectral(t);
      });
      if (grow > 0.01)
        g.face(v, C.cyan, at(grow, (j / rings) * 0.65, 0.32), normals, colors);
    }
  for (let i = 0; i < 25; i++) {
    const a = i * 2.39996,
      r = Math.sqrt(i / 25) * 207,
      p = vertex(r, a);
    p[2] += 2;
    const show = i === 0 ? 1 : at(q, 0.04 + i * 0.003, 0.13);
    g.dot(p, mix(5, 1.8, grow), C.cyan, false, show);
    if (grow < 0.92)
      g.line([[p[0], p[1], -60], p], C.dim, 0.7, show * (1 - grow));
  }
  g.ring([0, 0, -8], radius, C.silver, 0.6);
  const section = points(80, (t) => {
    const v = -radius + t * 2 * radius;
    return mode === 1
      ? [0, v, height(0, v / 85) * amplitude]
      : [v, 0, height(v / 85, 0) * amplitude];
  });
  if (cut > 0.001) {
    const extracted = section.map(([x, y, z], i) => [
      mix(x, -222 + (i / 80) * 444, cut),
      mix(y, 222, cut),
      mix(z, z * 3 + 90, cut),
    ]);
    for (let i = 1; i < extracted.length; i++) {
      const a = extracted[i - 1],
        b = extracted[i];
      g.face(
        [a, b, [b[0], b[1], 50 * cut], [a[0], a[1], 50 * cut]],
        C.cyan,
        cut * 0.85,
      );
    }
    g.line(section, C.pale, 2, cut);
    g.line(extracted, C.pale, 1.4, cut);
  }
  g.draw();
  if (q > 0.77)
    note(
      d,
      W,
      H,
      mode === 1 ? "Vertical centre section" : "Horizontal centre section",
      "A section of the same measurement field.",
      "left",
      cut,
    );
  return `${mode === 1 ? "Vertical" : "Horizontal"} centre section. Surface height represents a measured parameter, not necessarily physical topography.`;
}

export function arrange(d, q, f, W, H, m, hit, alternate = 0) {
  const choose = index(f, 5),
    release = at(q, 0.18, 0.09),
    up = at(q, 0.27, 0.14),
    move = at(q, 0.47, 0.24),
    down = at(q, 0.74, 0.16),
    lift = (up - down) * (1 - alternate),
    travel = move * (1 - alternate);
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.25, 1.08, 1.25, 0, 0],
      [0.23, -0.23, 0.87, 1.32, 0, 0],
      [0.43, 0.06, 0.98, 1.15, 0, 0],
      [0.72, 0.36, 0.86, 1.07, 0, 0],
      [1, 0.18, 0.68, 1.11, 0, 0],
    ],
    m,
  );
  const seats = Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + (i * TAU) / 5;
    return [Math.cos(a) * 146, Math.sin(a) * 146];
  });
  wafer(g, [0, 0, -34], 230, 24, [33, 42, 57]);
  for (let i = 0; i < 10; i++) {
    const a = (i * TAU) / 10;
    wafer(g, [Math.cos(a) * 212, Math.sin(a) * 212, -32], 4, 3, C.silver);
  }
  seats.forEach(([x, y], i) => {
    shadow(g, [x, y, -17], 58, 0);
    wafer(g, [x, y, -20], 57, 3, [19, 25, 32]);
    g.ring([x, y, -16], 58, C.dim, 1);
  });
  seats.forEach(([x, y], i) => {
    const moving = i === 2 || i === 4,
      to = seats[i === 2 ? 4 : 2],
      weights = [500.6, 521, 509.9, 541.3, 530.5];
    const xx = moving
      ? mix(x, to[0], travel) +
        Math.sin(travel * Math.PI) * (i === 2 ? 52 : -52)
      : x;
    const yy = moving
      ? mix(y, to[1], travel) +
        Math.sin(travel * Math.PI) * (i === 2 ? 60 : -60)
      : y;
    const z = moving ? -7 + lift * (i === 2 ? 117 : 190) : -7;
    shadow(g, [xx, yy, -16], 53, z + 7);
    wafer(
      g,
      [xx, yy, z],
      53,
      13,
      moving
        ? [110, 123, 142].map((v, k) =>
            mix(v, (i === 2 ? C.cobalt : C.coral)[k], release),
          )
        : [110, 123, 142],
    );
    g.arc(
      [xx, yy, z + 0.8],
      49,
      2,
      0,
      TAU,
      moving ? (i === 2 ? C.cyan : C.amber) : C.silver,
      0.8,
    );
    for (let k = 0; k < 6; k++)
      g.ring([xx, yy, z + 0.5], 19 + k * 4.7, C.graphite, 0.4, 0, TAU, 0.27);
    // During the lift, the moving plates own the annotation plane. Fixed-seat
    // labels return after contact instead of drawing through foreground plates.
    const labelPresence = moving
      ? 1
      : 1 - at(q, 0.27, 0.06) * (1 - at(q, 0.89, 0.06));
    g.text(
      "BP" + (i + 1),
      [xx, yy + 6, z + 1],
      18,
      "#f5f6fa",
      "center",
      labelPresence,
    );
    if (choose === i) g.ring([xx, yy, z + 1], 55, C.copper, 1.3);
    g.target(
      hit,
      (i + 0.5) / 5,
      [xx, yy, z],
      32,
      "BP" + (i + 1) + " · " + weights[i] + " g",
    );
  });
  g.draw();
  return `BP${choose + 1} · ${[500.6, 521, 509.9, 541.3, 530.5][choose]} g. Weight-mode illustration: BP3 ↔ BP5; BP1, BP2 and BP4 remain in their original seats.`;
}

export function zones(d, q, f, W, H, m, hit, alternate = 0, adjust = 0.5) {
  const inner = index(f, 5),
    outer = index(adjust, 5),
    open = at(q, 0.14, 0.17),
    rotation = at(q, 0.25, 0.45) * TAU * 0.41;
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.17, 1.15, 1.7, 0, 10],
      [0.36, 0.1, 0.98, 1.36, 0, 0],
      [0.67, 0.04, 0.54, 1.1, 0, 0],
      [0.84, 0, 0.05, 1.04, 0, 0],
      [1, 0, 0.05, 1.04, 0, 0],
    ],
    m,
  );
  wafer(g, [0, 0, -14], 228, 18, [22, 32, 46]);
  for (let r = 205; r < 226; r += 5)
    g.ring([0, 0, -12], r, C.silver, 0.45, 0, TAU, 0.35);
  const angle = (i) => -Math.PI / 2 + (i * TAU) / 5,
    half = ((alternate > 0.5 ? 12 : 7.2) * Math.PI) / 180,
    omin = (10.8 * Math.PI) / 180,
    omax = ((alternate > 0.5 ? 25 : 18) * Math.PI) / 180;
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  for (let i = 0; i < 5; i++) {
    const a = angle(i) + rotation,
      cx = Math.cos(a) * 135,
      cy = Math.sin(a) * 135;
    wafer(g, [cx, cy, 0], 64, 3, [55, 85 + i * 3, 132 + i * 5]);
    for (let band = 0; band < 5; band++)
      g.arc(
        [cx, cy, 0.6],
        26 + band * 8,
        1.5,
        -1.2 + rotation,
        0.8 + rotation,
        C.cyan,
        0.05 + band * 0.014,
      );
    for (let j = 0; j < 18; j++)
      for (let k = 0; k < 18; k++) {
        const x = (j - 8.5) * 7,
          y = (k - 8.5) * 7;
        if (Math.hypot(x, y) > 59) continue;
        const ax = x + cx,
          ay = y + cy,
          r = Math.hypot(ax, ay),
          ang = Math.atan2(ay, ax);
        const blue =
          r > 108 && r < 158 && Math.abs(wrap(ang - angle(inner))) < half;
        const copper =
          r > 169 &&
          r < 200 &&
          Math.abs(wrap(ang - angle(outer))) > omin &&
          Math.abs(wrap(ang - angle(outer))) < omax;
        if (blue || copper)
          g.face(
            [
              [ax - 3.5, ay - 3.5, 1],
              [ax + 3.5, ay - 3.5, 1],
              [ax + 3.5, ay + 3.5, 1],
              [ax - 3.5, ay + 3.5, 1],
            ],
            blue ? C.cyan : C.emerald,
            open,
          );
      }
    if (q > 0.7) g.text("S" + (i + 1), [cx, cy + 6, 4], 18, d.ink, "center");
  }
  // The windows remain in instrument coordinates as wafer regions pass through.
  for (const [a, b, r, w, color] of [
    [angle(inner) - half, angle(inner) + half, 158, 50, C.cyan],
    [angle(outer) - omax, angle(outer) - omin, 200, 31, C.emerald],
    [angle(outer) + omin, angle(outer) + omax, 200, 31, C.emerald],
  ]) {
    g.arc([0, 0, 25], r, w, a, b, color, open * 0.32);
    for (const t of [a, b])
      g.face(
        [
          [Math.cos(t) * (r - w), Math.sin(t) * (r - w), 0],
          [Math.cos(t) * r, Math.sin(t) * r, 0],
          [Math.cos(t) * r, Math.sin(t) * r, 25],
          [Math.cos(t) * (r - w), Math.sin(t) * (r - w), 25],
        ],
        color,
        open * 0.28,
      );
  }
  g.draw();
  if (q > 0.72)
    note(
      d,
      W,
      H,
      "The sampled regions.",
      "Inner and outer windows remain independent.",
      "left",
      at(q, 0.72, 0.1),
    );
  return `Inner anchor S${inner + 1}: ±${alternate > 0.5 ? 12 : 7.2}°. Outer anchor S${outer + 1}: ${10.8}°–${alternate > 0.5 ? 25 : 18}°. Windows define measurement locations, not temperature.`;
}
