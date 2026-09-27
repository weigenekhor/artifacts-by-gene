import {
  cinema,
  block,
  rail,
  note,
  C,
  points,
  at,
  mix,
} from "./set.js";
import { index } from "./studio.js";

// Cases are transcribed from the verified diagnostic-master pairings.
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
    process = at(q, 0.22, 0.22),
    clean = at(q, 0.51, 0.21),
    decide = at(q, 0.76, 0.1);
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.23, 0.17, 1.8, 0, 0],
      [0.23, 0.38, 0.31, 1.42, 0, 0],
      [0.52, -0.2, 0.4, 1.13, 0, 0],
      [0.85, 0.03, 0.14, 1.04, 0, 0],
      [1, 0.03, 0.14, 1.04, 0, 0],
    ],
    m,
  );
  // An ambiguous observation splits into possible directions. These are editorial
  // possibilities, never an invented diagram of sensor positions in a reactor.
  const symptom = points(64, (t) => [
    (t - 0.5) * 218,
    18,
    104 + Math.exp(-(((t - 0.5) * 7) ** 2)) * 70,
  ]);
  rail(g, symptom, 28, 7, C.silver, 1 - decide * 0.75);
  const remaining = data.checks.length;
  for (let i = 0; i < 7; i++) {
    const eligible = i < remaining,
      stage = i > 4 ? process : i >= remaining ? clean : 0;
    const x = mix(
        (i - 3) * 112,
        (i - (remaining - 1) / 2) * 180,
        eligible ? decide : 0,
      ),
      depth = -210 - stage * 360,
      alpha = eligible ? 1 : 1 - stage * 0.95;
    const arch = points(50, (t) => [
      x + Math.sin(t * Math.PI) * 20,
      -145 + t * 290,
      depth,
    ]);
    rail(g, arch, 26, 20, eligible && clean > 0.9 ? C.copper : C.dim, alpha);
    g.line(
      [
        [0, 30, 120],
        [x, 0, depth],
      ],
      eligible ? C.silver : C.dim,
      0.7,
      alpha * 0.35,
    );
  }
  for (let layer = 0; layer < 2; layer++) {
    const t = layer ? clean : process,
      z = mix(230, -100, t),
      w = 420 + layer * 90;
    const border = points(70, (u) => [
      (u - 0.5) * w,
      Math.sin(u * Math.PI) * 38 - 140 + layer * 285,
      z,
    ]);
    rail(g, border, 10, 4, layer ? C.copper : C.blue, t * (1 - decide * 0.7));
  }
  g.draw();
  if (q > 0.2 && q < 0.5)
    note(
      d,
      W,
      H,
      "Process context",
      "TFB ↑  /  " + data.process[1] + " ceiling",
      "left",
      process * (1 - at(q, 0.44, 0.06)),
    );
  else if (q > 0.51 && q < 0.74)
    note(
      d,
      W,
      H,
      "Clean context",
      "Epi true T: " + data.clean[0] + " · ceiling: " + data.clean[1],
      "left",
      clean * (1 - at(q, 0.68, 0.06)),
    );
  else if (q > 0.75) {
    note(
      d,
      W,
      H,
      "Remaining checks",
      "Guidance, not a confirmed physical cause.",
      "left",
      decide,
    );
    data.checks.forEach((s, i) =>
      d.alpha(decide, () =>
        d.text(
          s,
          m ? W * 0.5 : (W * (i + 0.5)) / remaining,
          H * 0.65 + (m ? i * 34 : 0),
          m ? 22 : 21,
          d.ink,
          "center",
        ),
      ),
    );
  }
  return `Paired process + clean observations → ${data.checks.join("; ")}. Recommended checks only; no physical cause is proven.`;
}

export function spc(d, q, f, W, H, m, hit) {
  const pass = at(q, 0.22, 0.28),
    raw = at(q, 0.22, 0.32),
    check = at(q, 0.7, 0.14),
    values = [98, 99, 100, 101, 112];
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.15, 0.7, 1.27, 0, 0],
      [0.21, -0.1, 0.5, 1.9, 0, -40],
      [0.43, 0.06, 0.7, 1.3, 0, 30],
      [0.74, -0.18, 0.36, 1.08, 0, 0],
      [1, -0.18, 0.36, 1.08, 0, 0],
    ],
    m,
  );
  // The calm summary is a real visual occluder. Passing it exposes the population.
  const sy = mix(0, -480, pass),
    sz = mix(170, 780, pass);
  const summary = points(60, (t) => [
    -350 + t * 700,
    sy + Math.sin(t * Math.PI) * 4,
    sz,
  ]);
  rail(g, summary, 110, 7, C.silver, 1 - pass);
  const limitY = -100;
  g.face(
    [
      [-350, limitY, -60],
      [350, limitY, -60],
      [350, limitY, 70],
      [-350, limitY, 70],
    ],
    C.blue,
    raw * 0.2,
  );
  g.line(
    [
      [-350, limitY, 71],
      [350, limitY, 71],
    ],
    C.silver,
    1,
    raw,
  );
  values.forEach((v, i) => {
    const x = -280 + i * 140,
      y = (100 - v) * 10,
      up = at(q, 0.22 + i * 0.034, 0.23);
    block(
      g,
      [x, mix(65, y, up), 0],
      [44, 15, 65],
      i === 4 ? C.copper : C.silver,
      up,
    );
    block(
      g,
      [x, (y + 110) / 2, -20],
      [7, (110 - y) * up, 7],
      i === 4 ? C.copper : C.dim,
      up,
    );
    g.target(hit, (i + 0.5) / 5, [x, y, 20], 32, String(v));
  });
  g.draw();
  if (q < 0.29)
    note(d, W, H, "Mean / 102", "Within 90–110", "left", 1 - at(q, 0.22, 0.07));
  else if (q > 0.72)
    note(
      d,
      W,
      H,
      "112 exceeds 110.",
      "Raw check fails, although the mean passes.",
      "left",
      check,
    );
  return [
    "Mean 102 is within 90–110.",
    "Raw 112 exceeds 110. Review required.",
    "Raw population: 98, 99, 100, 101, 112.",
  ][index(f, 3)];
}

export function legacy(d, q, f, W, H, m, hit, alternate = 0) {
  const select = index(f, 12),
    values = [97, 118, 102, 98, 101, 96, 102, 99, 101, 98, 102, 100],
    n = alternate > 0.5 ? 3 : 5,
    first = 12 - n,
    close = at(q, 0.46, 0.31);
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.74, 0.51, 1.8, -260, 0],
      [0.3, -0.54, 0.49, 1.38, -80, 0],
      [0.58, -0.31, 0.52, 1.08, 0, 0],
      [0.86, 0.04, 0.51, 1.04, 0, 0],
      [1, 0.04, 0.51, 1.04, 0, 0],
    ],
    m,
  );
  for (let i = 0; i < 12; i++) {
    const x = -360 + i * 65,
      y = 60,
      z = (values[i] - 90) * 6,
      active = i >= first;
    const shape = points(35, (t) => [
      x,
      y + (t - 0.5) * 200,
      Math.sin(t * Math.PI) * z,
    ]);
    rail(
      g,
      shape,
      38,
      5,
      i === 1 ? C.copper : active ? C.silver : C.dim,
      active ? 1 : 1 - close * 0.65,
    );
    g.target(hit, (i + 0.5) / 12, [x, 0, z], 28, "Group " + (i + 1));
  }
  const a = -360 + first * 65 - 24,
    b = 380;
  // A bounded review population closes around recent groups, not older excursions.
  for (const x of [a, b]) {
    g.face(
      [
        [x, -70, -8],
        [x, 190, -8],
        [x, 190, 130 * close],
        [x, -70, 130 * close],
      ],
      C.blue,
      close * 0.16,
    );
    g.line(
      [
        [x, -70, 130 * close],
        [x, 190, 130 * close],
      ],
      C.copper,
      1.2,
      close,
    );
  }
  g.line(
    [
      [a, -70, 130],
      [b, -70, 130],
    ],
    C.copper,
    1.2,
    close,
  );
  g.draw();
  if (q > 0.72)
    note(
      d,
      W,
      H,
      `${n} recent groups.`,
      select >= first
        ? "Selected group is inside the review."
        : "Earlier history remains outside the review.",
      "left",
      close,
    );
  return `Group ${select + 1}: ${values[select]}. ${select >= first ? "Inside" : "Outside"} the configured latest ${n} groups. Older excursions do not enter this review.`;
}
