import {
  cinema,
  block,
  curtain,
  landscape,
  note,
  glow,
  C,
  TAU,
  points,
  at,
  mix,
} from "./set.js";
import { index } from "./studio.js";

// Pairings transcribed from the actual diagnostic master, not a root-cause claim.
const cases = [
  {
    process: ["Increased", "Same / hotter", "Increased / max"],
    clean: ["Comparable", "Hotter"],
    checks: ["LayTec + viewport", "Ceiling + viewport", "Optris settings"],
  },
  {
    process: ["Increased", "Comparable", "Same / increased"],
    clean: ["Colder", "Comparable"],
    checks: ["Verify LayTec", "Inspect viewport"],
  },
  {
    process: ["Increased", "Same / colder", "Decreased / min"],
    clean: ["Colder", "Colder"],
    checks: ["Lightpipe accuracy", "Eurotherm accuracy"],
  },
];
export function diagnose(d, q, f, W, H, m, hit) {
  const sel = index(f, 3),
    data = cases[sel],
    process = at(q, 0.26, 0.17),
    clean = at(q, 0.52, 0.2),
    resolve = at(q, 0.76, 0.1);
  const colors = [C.coral, C.cyan, C.violet, C.amber, C.emerald, C.cobalt];
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.1, 0.12, 2.5, 0, 0, 90],
      [0.2, 0.28, 0.33, 1.42, 0, -15, 0],
      [0.41, -0.2, 0.58, 1.08, 0, 0, -160],
      [0.64, 0.25, 0.45, 1.08, 40, 0, -170],
      [0.88, 0, 0.34, 0.95, 0, 0, -90],
      [1, 0, 0.34, 0.95, 0, 0, -90],
    ],
    m,
  );
  // A single ambiguous symptom opens several alternative evidence landscapes.
  const symptom = points(70, (t) => [
    (t - 0.5) * 230,
    0,
    90 + Math.exp(-(((t - 0.5) * 8) ** 2)) * 95,
  ]);
  curtain(g, symptom, 50, C.coral, 1 - at(q, 0.2, 0.16) * 0.84);
  for (let i = 5; i >= 0; i--) {
    const visible = at(q, 0.12 + i * 0.025, 0.16),
      eligible = i < data.checks.length;
    const excluded = i > 3 ? process : eligible ? 0 : clean;
    const x = mix(
      ((i % 3) - 1) * 238,
      (i - (data.checks.length - 1) / 2) * 235,
      eligible ? resolve : 0,
    );
    const y = mix(i < 3 ? -88 : 112, 8, eligible ? resolve : 0),
      z = -120 - Math.floor(i / 3) * 175 - excluded * 330;
    const a = visible * (1 - excluded * 0.99);
    const shape = (u, v) =>
      Math.exp(-(((u - 0.48) * 5) ** 2)) *
        (0.45 + 0.38 * Math.sin(v * 3 + i * 0.2)) +
      0.14 * Math.sin(u * 14 + i);
    landscape(g, shape, {
      x,
      y,
      z,
      w: 192,
      h: 105,
      height: 120,
      nx: 28,
      ny: 10,
      color: colors[i],
      alpha: a * 0.8,
    });
    const ridge = points(60, (u) => [
      x + (u - 0.5) * 192,
      y,
      z + shape(u, 0.5) * 120 + 1,
    ]);
    g.line(ridge, colors[i], 1.6, a);
    if (eligible) glow(d, g, [x, y, z + 25], 150, colors[i], clean * 0.12);
  }
  // New observations act as moving cuts through the environment, not branching arrows.
  for (let layer = 0; layer < 2; layer++) {
    const t = layer ? clean : process,
      alpha = t * (1 - at(t, 0.65, 0.35));
    g.line(
      points(60, (u) => [
        (u - 0.5) * 810,
        mix(-180, 180, t),
        mix(100, -400, t),
      ]),
      layer ? C.cyan : C.coral,
      2,
      alpha,
    );
  }
  g.draw();
  if (q > 0.81) {
    note(d, W, H, "Recommended checks", "", "left", resolve);
    data.checks.forEach((s, i) =>
      d.alpha(resolve, () =>
        d.text(
          s,
          m ? W * 0.5 : (W * (i + 0.5)) / data.checks.length,
          H * 0.72 + (m ? i * 32 : 0),
          m ? 22 : 21,
          d.ink,
          "center",
        ),
      ),
    );
  }
  return (
    "Process: " +
    data.process.join(" / ") +
    ". Clean: " +
    data.clean.join(" / ") +
    ". Recommended checks: " +
    data.checks.join("; ") +
    ". No physical cause is proven."
  );
}

export function spc(d, q, f, W, H, m, hit) {
  const enter = at(q, 0.2, 0.24),
    raw = at(q, 0.36, 0.26),
    failure = at(q, 0.62, 0.16),
    values = [98, 99, 100, 101, 112];
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.22, 0.82, 1.65, 0, 0, 70],
      [0.22, -0.1, 0.68, 2.6, 0, 20, 180],
      [0.43, 0.14, 0.87, 1.28, 0, 45, -30],
      [0.66, -0.12, 0.51, 1.22, 0, 0, 0],
      [0.88, -0.18, 0.4, 1.02, 0, 0, -10],
      [1, -0.18, 0.4, 1.02, 0, 0, -10],
    ],
    m,
  );
  // The summary is an occluding surface; the camera's passage reveals what it hides.
  const sy = mix(0, -430, enter),
    sz = mix(160, 620, enter);
  for (let j = 0; j < 18; j++) {
    const y = sy + (j - 8.5) * 17;
    const path = points(45, (t) => [
      (t - 0.5) * 680,
      y,
      sz + Math.sin(t * Math.PI) * 12,
    ]);
    curtain(g, path, sz - 5, C.cobalt, (1 - enter) * 0.8);
  }
  const limit = 110;
  g.face(
    [
      [-355, -100, -70],
      [355, -100, -70],
      [355, -100, 100],
      [-355, -100, 100],
    ],
    C.cyan,
    raw * 0.14,
  );
  g.line(
    [
      [-355, -100, 100],
      [355, -100, 100],
    ],
    C.cyan,
    1.2,
    raw,
  );
  values.forEach((v, i) => {
    const x = (i - 2) * 133,
      y = (100 - mix(100, v, raw)) * 10,
      color = i === 4 ? C.coral : C.cyan;
    const radius = i === 4 ? 16 : 10,
      show = at(q, 0.34 + i * 0.04, 0.1);
    for (let k = 0; k < 5; k++)
      g.arc(
        [x, y, -45 + k * 12],
        radius,
        3,
        0,
        TAU,
        color,
        show * (k === 4 ? 1 : 0.3),
      );
    g.line(
      [
        [x, 100, -40],
        [x, y, 16],
      ],
      color,
      1,
      show * 0.5,
    );
    if (i === 4) {
      glow(d, g, [x, y, 18], 100, C.coral, failure * 0.24);
      g.line(
        [
          [x - 25, -100, 20],
          [x + 25, -100, 20],
        ],
        C.coral,
        2,
        failure,
      );
    }
    g.target(hit, (i + 0.5) / 5, [x, y, 18], 30, String(v));
  });
  g.draw();
  if (q < 0.26)
    note(d, W, H, "Mean / 102", "Within 90–110", "left", 1 - at(q, 0.18, 0.08));
  if (q > 0.8)
    note(
      d,
      W,
      H,
      "112 exceeds 110.",
      "The mean passes. The raw check fails.",
      "left",
      failure,
    );
  return [
    "Mean 102 is within 90–110.",
    "Raw 112 exceeds 110. Review required.",
    "Raw population: 98, 99, 100, 101, 112.",
  ][index(f, 3)];
}

export function legacy(d, q, f, W, H, m, hit, alternate = 0) {
  const selected = index(f, 12),
    values = [97, 118, 102, 98, 101, 96, 102, 99, 101, 98, 102, 100],
    n = alternate > 0.5 ? 3 : 5,
    first = 12 - n;
  const choose = at(q, 0.43, 0.3),
    hold = at(q, 0.77, 0.1);
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.48, 0.44, 1.75, -240, 0, 50],
      [0.22, -0.16, 0.62, 1.55, -130, 0, -50],
      [0.43, 0.28, 0.5, 1.23, 20, 0, -60],
      [0.69, -0.2, 0.64, 1.03, 40, 0, -30],
      [0.88, 0.12, 0.55, 0.92, 0, 0, -30],
      [1, 0.12, 0.55, 0.92, 0, 0, -30],
    ],
    m,
  );
  for (let i = 0; i < 12; i++) {
    const active = i >= first,
      x0 = (i - 5.5) * 78,
      x = active ? mix(x0, (i - first - (n - 1) / 2) * 106, choose) : x0;
    const z = active ? mix(-i * 12, 90, choose) : -i * 12 - choose * 270;
    const y = active ? mix(0, 75, choose) : -choose * 150;
    const a = active ? 1 : 1 - choose * 0.84,
      color = i === 1 ? C.coral : active ? C.violet : C.dim;
    const curve = points(48, (t) => [
      x,
      y + (t - 0.5) * 210,
      z + Math.sin(t * Math.PI) * (values[i] - 90) * 6,
    ]);
    curtain(g, curve, z, color, a * 0.8);
    g.dot([x, y, z + (values[i] - 90) * 6], 4, color, false, a);
    g.target(hit, (i + 0.5) / 12, [x, y, z + 40], 30, "Group " + (i + 1));
  }
  g.draw();
  if (q > 0.79)
    note(
      d,
      W,
      H,
      n + " recent groups.",
      selected >= first
        ? "Inside the active review."
        : "Earlier evidence stays in history.",
      "left",
      hold,
    );
  return (
    "Group " +
    (selected + 1) +
    ": " +
    values[selected] +
    ". " +
    (selected >= first ? "Inside" : "Outside") +
    " the latest " +
    n +
    " groups. Older excursions do not enter this review."
  );
}
