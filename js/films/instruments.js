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
} from "./set.js";
import { index } from "./studio.js";

export function usage(d, q, f, W, H, m, hit) {
  const sel = index(f, 3),
    total = [24, 36, 48][sel],
    gather = at(q, 0.15, 0.53),
    resolve = at(q, 0.76, 0.1);
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.25, 0.93, 1.55, -180, -50],
      [0.23, 0.24, 1.1, 1.36, -30, 0],
      [0.6, -0.2, 1.02, 1.24, 0, 0],
      [0.9, -0.12, 0.88, 1.18, 0, 0],
      [1, -0.12, 0.88, 1.18, 0, 0],
    ],
    m,
  );
  for (let i = 0; i < 3; i++) shadow(g, [(i - 1) * 205, 40, -60], 77, 25);
  let processed = 0;
  const seated = [0, 0, 0];
  for (let i = total - 1; i >= 0; i--) {
    const stack = i % 3,
      level = Math.floor(i / 3),
      t = at(gather, (i / total) * 0.82, 0.17);
    if (t > 0.98) {
      processed++;
      seated[stack]++;
      continue;
    }
    if (t < 0.002 && i > 2) continue;
    const start = [
        (stack - 1) * 245 - 140,
        -190 - level * 42,
        -270 + level * 9,
      ],
      end = [(stack - 1) * 205, 40, -55 + level * 9];
    const p = start.map((v, k) => mix(v, end[k], t));
    p[2] += Math.sin(t * Math.PI) * 105;
    wafer(g, p, 76, 2.2, t > 0.98 ? [119, 144, 162] : C.dim);
  }
  // Landed wafers become a single capped stack with separate visible seams.
  // Buried faces contribute no pixels and no longer consume frame time.
  seated.forEach((count, i) => {
    if (!count) return;
    const x = (i - 1) * 205,
      top = -55 + (count - 1) * 9;
    wafer(g, [x, 40, top], 76, 2.2 + (count - 1) * 9, [119, 144, 162]);
    for (let j = 0; j < count - 1; j++)
      g.line(
        points(40, (t) => [
          x + Math.cos(t * TAU) * 76,
          40 + Math.sin(t * TAU) * 76,
          -55 + j * 9,
        ]),
        C.silver,
        0.65,
      );
  });
  g.draw();
  note(
    d,
    W,
    H,
    "Wafers processed",
    "Illustrative count · latest chamber record",
    "left",
    at(q, 0.01, 0.08),
  );
  d.alpha(resolve, () => {
    d.text(String(processed), W * 0.82, H * 0.82, 72, d.ink, "center");
    d.text("wafers", W * 0.82, H * 0.82 + 29, 21, d.muted, "center");
  });
  return `Illustrative ${total}-wafer count. The real application reads latest A/B counters; the film does not imply an event-history parser.`;
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
      [0, -0.34, 1.25, 3.1, -65, -36],
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
        return [70, 110, 130].map((c, k) => mix(c, [227, 188, 129][k], t));
      });
      if (grow > 0.01) g.face(v, C.blue, grow, normals, colors);
    }
  for (let i = 0; i < 25; i++) {
    const a = i * 2.39996,
      r = Math.sqrt(i / 25) * 207,
      p = vertex(r, a);
    p[2] += 2;
    const show = i === 0 ? 1 : at(q, 0.04 + i * 0.003, 0.13);
    g.dot(p, mix(3, 1.4, grow), C.pale);
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
        C.copper,
        cut * 0.75,
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
  wafer(g, [0, 0, -34], 224, 15, [45, 52, 60]);
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
    wafer(g, [xx, yy, z], 53, 10, moving ? [168, 178, 185] : [82, 95, 108]);
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
      moving ? "#17202a" : "#e6e9e9",
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
  if (q < 0.24)
    note(
      d,
      W,
      H,
      "Heavier plates. Colder bare pockets.",
      "Weight-based reassignment",
      "left",
      release * (1 - at(q, 0.2, 0.04)),
    );
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
  wafer(g, [0, 0, -14], 222, 9, [29, 40, 50]);
  const angle = (i) => -Math.PI / 2 + (i * TAU) / 5,
    half = ((alternate > 0.5 ? 12 : 7.2) * Math.PI) / 180,
    omin = (10.8 * Math.PI) / 180,
    omax = ((alternate > 0.5 ? 25 : 18) * Math.PI) / 180;
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  for (let i = 0; i < 5; i++) {
    const a = angle(i) + rotation,
      cx = Math.cos(a) * 135,
      cy = Math.sin(a) * 135;
    wafer(g, [cx, cy, 0], 64, 2, C.dim);
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
            blue ? C.blue : C.copper,
            open,
          );
      }
    if (q > 0.7) g.text("S" + (i + 1), [cx, cy + 6, 4], 18, d.ink, "center");
  }
  // The windows remain in instrument coordinates as wafer regions pass through.
  for (const [a, b, r, w, color] of [
    [angle(inner) - half, angle(inner) + half, 158, 50, C.blue],
    [angle(outer) - omax, angle(outer) - omin, 200, 31, C.copper],
    [angle(outer) + omin, angle(outer) + omax, 200, 31, C.copper],
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
