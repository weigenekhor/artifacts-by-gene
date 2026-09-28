import {
  cinema,
  wafer,
  curtain,
  note,
  glow,
  C,
  TAU,
  points,
  at,
  mix,
} from "./set.js";
import { index } from "./studio.js";
import { sample } from "./drawing.js";

// Illustrative event histories. Deposition positions are not physical film thickness.
export function history(d, q, f, W, H, m, hit) {
  const broken = at(q, 0.13, 0.13),
    repair = at(q, 0.36, 0.3),
    reveal = at(q, 0.67, 0.18),
    chosen = index(f, 5);
  const counts = [5, 5, 3, 0, 6],
    names = ["Complete", "Recovered", "Partial", "Missing", "Excessive"];
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.65, 0.36, 1.15, -140, -165, 0],
      [0.16, -0.32, 0.12, 2.5, -190, -166, 65],
      [0.31, 0.15, 0.32, 2.15, -180, -174, 40],
      [0.58, 0.36, 0.45, 1.65, -170, -158, 15],
      [0.83, -0.15, 0.65, 0.72, 0, 20, -30],
      [1, -0.15, 0.65, 0.72, 0, 20, -30],
    ],
    m,
  );
  for (let i = 14; i >= 0; i--) {
    const row = Math.floor(i / 5),
      col = i % 5,
      active = i === 1;
    const X = (col - 2) * 192,
      Y = (row - 1) * 192,
      Z = -row * 78;
    const visibility = active ? 1 : mix(0.48, 1, reveal);
    const state = i < 5 ? i : i % 5,
      count = counts[state];
    const color =
      state === 1
        ? C.coral
        : state === 0
          ? C.cyan
          : state === 4
            ? C.violet
            : C.dim;
    const curve = (t) => [
      X + (t - 0.5) * 145,
      Y + Math.sin(t * Math.PI) * 55,
      Z + Math.sin(t * Math.PI) * 55,
    ];
    const fracture = active ? broken * (1 - repair) : 0;
    const path = points(50, (t) => {
      const v = curve(t);
      if (t > 0.4) {
        v[0] += fracture * 52;
        v[1] -= fracture * 56;
        v[2] += fracture * 145;
      }
      return v;
    });
    g.line(path.slice(0, 20), color, 1, visibility * 0.7);
    g.line(path.slice(26), color, 1, visibility * 0.7);
    if (!active) g.line(path.slice(19, 27), color, 1, visibility * 0.7);
    else g.line(path.slice(19, 27), C.coral, 1.8, repair);
    for (let j = 0; j < 6; j++) {
      const p = curve(j / 5),
        valid = j < count;
      const t = at(q, 0.35 + j * 0.043, 0.12);
      if (active && j >= 2) {
        p[0] += 52 * broken * (1 - t);
        p[1] -= 56 * broken * (1 - t);
        p[2] += 145 * broken * (1 - t);
      }
      if (active && j === 2) {
        p[0] -= 80 * (1 - t);
        p[1] -= 120 * (1 - t);
        p[2] -= 130 * (1 - t);
        const source = [X - 80, Y - 170, Z - 80];
        g.line([source, p], C.coral, 0.8, (1 - t) * at(q, 0.31, 0.08));
      }
      if (valid) {
        // Only the investigated history needs a surfaced close-up. Distant
        // event marks retain their identity without thousands of hidden facets.
        if (active || (i === chosen && reveal > 0.75))
          wafer(g, p, 14, 2, color, visibility);
        else g.dot(p, 4.8, color, false, visibility);
        if (active && j >= 2)
          g.ring(
            [p[0], p[1], p[2] + 2],
            18,
            C.coral,
            0.8,
            0,
            TAU,
            t * (1 - reveal),
          );
      } else g.ring(p, 12, C.dim, 0.65, 0, TAU, visibility * 0.5);
    }
    if (i === chosen)
      g.line(
        [
          [X - 85, Y + 92, Z],
          [X + 85, Y + 92, Z],
        ],
        color,
        2,
        reveal,
      );
    if (i < 5) g.target(hit, (i + 0.5) / 5, [X, Y + 35, Z + 25], 42, names[i]);
  }
  g.draw();
  if (q > 0.78)
    note(
      d,
      W,
      H,
      "W0" + (chosen + 1) + " / " + names[chosen],
      counts[chosen] + " events · expected 5",
      "left",
      reveal,
    );
  return (
    "W0" +
    (chosen + 1) +
    " · " +
    names[chosen] +
    " · " +
    counts[chosen] +
    " events; expected five. Returning-run evidence repairs W02 only."
  );
}

export function schedule(d, q, f, W, H, m, hit) {
  const sel = index(f, 4),
    extend = at(q, 0.19, 0.43),
    wide = at(q, 0.67, 0.18);
  const days = [8, 10, 13, 15],
    intervals = [4, 7, 4, 7];
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.4, 0.42, 2.8, -232, 175, 90],
      [0.18, -0.26, 0.32, 2.3, -220, 165, 40],
      [0.4, 0.24, 0.35, 1.95, -214, 125, -80],
      [0.62, 0.15, 0.55, 1.65, -232, 46, -230],
      [0.86, -0.2, 0.52, 0.94, 0, 0, -140],
      [1, -0.2, 0.52, 0.94, 0, 0, -140],
    ],
    m,
  );
  for (let i = 0; i < 4; i++) {
    const a = i === sel ? 1 : wide,
      x = (i - 1.5) * 155;
    const start = [x, 170 - (days[i] - 8) * 20, 90],
      end = [x, start[1] - intervals[i] * 37, -360];
    // A historical event has depth and a precise origin; time grows from it.
    for (let j = 0; j < 4; j++) {
      const z = start[2] - j * 14,
        offset = j * 7;
      g.face(
        [
          [x - 32 - offset, start[1] - 36, z],
          [x + 32 + offset, start[1] - 36, z],
          [x + 22 + offset, start[1] + 30, z],
          [x - 22 - offset, start[1] + 30, z],
        ],
        C.cobalt,
        a * 0.76,
      );
      g.line(
        [
          [x - 32 - offset, start[1] - 36, z],
          [x + 32 + offset, start[1] - 36, z],
        ],
        C.cyan,
        1,
        a,
      );
    }
    g.dot(start, 6, C.cyan, false, a);
    const route = points(80, (t) => [
      x + Math.sin(t * Math.PI) * 28,
      mix(start[1], end[1], t),
      mix(start[2], end[2], t),
    ]);
    const visibleRoute = route.slice(
      0,
      Math.max(2, Math.floor(80 * (i === sel ? extend : wide))),
    );
    for (let j = 1; j < visibleRoute.length; j++) {
      const A = visibleRoute[j - 1],
        B = visibleRoute[j];
      g.face(
        [
          [A[0] - 9, A[1], A[2]],
          [B[0] - 9, B[1], B[2]],
          [B[0] + 9, B[1], B[2]],
          [A[0] + 9, A[1], A[2]],
        ],
        C.cyan,
        a * 0.72,
      );
    }
    g.line(visibleRoute, C.cyan, 2, a);
    for (let j = 1; j <= intervals[i]; j++) {
      const t = j / intervals[i],
        r = route[Math.round(t * 80)],
        v = at(extend, t - 0.08, 0.08);
      g.line(
        [
          [r[0] - 6, r[1], r[2]],
          [r[0] + 6, r[1], r[2]],
        ],
        C.pale,
        0.9,
        v * a,
      );
    }
    const due = at(q, 0.6, 0.08);
    g.arc(end, 18, 4, 0, TAU, C.amber, a * due);
    g.target(hit, (i + 0.5) / 4, end, 32, "Chamber " + "ABCD"[i]);
  }
  // A single present plane gives all historical intervals the same temporal reference.
  g.face(
    [
      [-360, -65, -210],
      [360, -65, -210],
      [360, 25, -290],
      [-360, 25, -290],
    ],
    C.cyan,
    wide * 0.12,
  );
  g.line(
    [
      [-360, -65, -210],
      [360, -65, -210],
    ],
    C.cyan,
    1.2,
    wide,
  );
  g.draw();
  if (q > 0.76)
    note(
      d,
      W,
      H,
      "Due / " + (days[sel] + intervals[sel]) + " September",
      "From " + days[sel] + " Sep + " + intervals[sel] + " days",
      "left",
      wide,
    );
  else if (q < 0.29)
    note(
      d,
      W,
      H,
      days[sel] + " September",
      "Recorded ANKO event",
      "left",
      at(q, 0.025, 0.06) * (1 - at(q, 0.23, 0.06)),
    );
  return (
    "Chamber " +
    "ABCD"[sel] +
    " · " +
    days[sel] +
    " Sep + " +
    intervals[sel] +
    " days → " +
    (days[sel] + intervals[sel]) +
    " Sep. Recipe-based interval from a recorded event."
  );
}

export function planning(d, q, f, W, H, m, hit) {
  const sel = index(f, 3),
    fail = sel !== 0,
    attempt = at(q, 0.51, 0.21),
    collapse = fail ? at(q, 0.73, 0.09) : 0;
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.24, 0.58, 1.8, 0, 55, 80],
      [0.23, 0.25, 0.52, 1.45, 0, 25, 40],
      [0.46, 0.14, 0.36, 1.28, 0, 0, 0],
      [0.72, -0.28, 0.4, 1.05, 0, -10, -50],
      [0.88, -0.1, 0.25, 1.1, 0, 0, -70],
      [1, -0.1, 0.25, 1.1, 0, 0, -70],
    ],
    m,
  );
  // Three independent evidence populations close an incomplete decision surface.
  for (let i = 0; i < 3; i++) {
    const t = at(q, 0.05 + i * 0.11, 0.14),
      bad = i === 2 && fail;
    const a0 = -Math.PI / 2 + (i * TAU) / 3;
    const z = mix(-160, 25, t) - (bad ? collapse * 65 : 0);
    g.arc(
      [0, 72, z],
      102,
      17,
      a0,
      a0 + TAU / 3 - 0.08,
      bad ? C.coral : C.emerald,
      t,
    );
    for (let j = 0; j < 8; j++) {
      const a = a0 + 0.1 + j * 0.21,
        r = 56 + Math.sin(j * 1.7 + i) * 18;
      g.dot(
        [Math.cos(a) * r, 72 + Math.sin(a) * r, z + 12],
        2.3,
        bad ? C.coral : C.emerald,
        false,
        t,
      );
    }
  }
  const path = points(100, (t) => [
    Math.sin(t * Math.PI) * 92,
    -10 - t * 230,
    20 - t * 360,
  ]);
  const length = attempt * (1 - collapse) * (fail ? 0.65 : 1);
  g.line(
    path.slice(0, Math.max(2, Math.floor(length * 100))),
    fail ? C.coral : C.emerald,
    2.4,
    attempt,
  );
  if (!fail) {
    const end = path.at(-1);
    g.arc(end, 27, 3, 0, TAU, C.emerald, at(q, 0.75, 0.07));
    glow(d, g, end, 130, C.emerald, at(q, 0.75, 0.08) * 0.16);
  }
  g.draw();
  if (q > 0.8) {
    const alpha = at(q, 0.8, 0.05);
    if (!fail) {
      d.alpha(alpha, () => {
        d.text("23 SEP", W * 0.5, H * 0.35, 64, d.ink, "center");
        d.text(
          "16 Sep + 7 days",
          W * 0.5,
          H * 0.35 + 36,
          19,
          d.muted,
          "center",
        );
      });
    } else
      note(
        d,
        W,
        H,
        sel === 1 ? "Check failed." : "Evidence missing.",
        "No valid next date.",
        "center",
        alpha,
      );
  }
  return fail
    ? sel === 1
      ? "FAIL · raw 112 exceeds 110. No valid date."
      : "MISSING · no eligible raw evidence. No valid date."
    : "PASS · 16 September + configured seven days → 23 September.";
}

export function signals(
  d,
  q,
  f,
  W,
  H,
  m,
  hit,
  alternate = 0,
  adjust = 0.5,
  pin = 1,
) {
  const names = ["Temperature", "Correction", "Power", "Pressure", "Flow"];
  const colors = [C.coral, C.cyan, C.cobalt, C.violet, C.emerald];
  const spread = at(q, 0.28, 0.46),
    interval = at(q, 0.72, 0.12);
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.22, 0.08, 3.4, 0, 0, 40],
      [0.2, -0.15, 0.2, 2.65, 0, 0, 15],
      [0.42, -0.3, 0.43, 1.4, 0, -10, -70],
      [0.67, 0.1, 0.63, 0.82, 0, 0, -110],
      [0.87, 0.16, 0.72, 0.66, 0, 0, -130],
      [1, 0.16, 0.72, 0.66, 0, 0, -130],
    ],
    m,
  );
  const bound = 475,
    selected = (f - 0.5) * 0.5,
    pointX = selected * bound * 2;
  const pinPoint = [
    pointX,
    (sample(0.5 + selected, 0) - sample(0.5, 0)) * 240 + 44,
    50,
  ];
  for (let i = 4; i >= 0; i--) {
    const show =
      i === 0 ? at(q, 0.09, 0.14) : at(q, 0.26 + (i - 1) * 0.1, 0.14);
    const y = [0, 130, -130, 260, -260][i] * spread,
      z = -i * 105;
    const trace = points(96, (t) => {
      const u = 0.5 + (t - 0.5) * mix(1, 0.55, alternate);
      return [
        (t - 0.5) * bound * 2,
        y + (sample(u, i) - sample(0.5, i)) * 240 + 44,
        z + 50,
      ];
    });
    // Signals extend through a shared time-space, each with a different relief.
    const portion = trace.slice(
      Math.max(0, 48 - Math.ceil(show * 48)),
      Math.min(97, 49 + Math.ceil(show * 48)),
    );
    if (portion.length > 1)
      curtain(g, portion, z - 35, colors[i], show * (i === 0 ? 0.94 : 0.7));
    const pos = [
      pointX + (i === 3 ? 16 : 0),
      y + (sample(0.5 + selected, i) - sample(0.5, i)) * 240 + 44,
      z + 52,
    ];
    g.dot(pos, i === 0 ? 7 : 4, colors[i], i === 3, i === 0 ? 1 : show);
    if (i === 0) {
      const core = [pos[0], pos[1], pos[2]];
      glow(d, g, core, 60, C.coral, 0.2);
      g.ring(core, 15, C.coral, 1.5, 0, TAU, pin);
    } else g.line([pinPoint, pos], C.pale, 0.55, show * pin * 0.3);
    for (const side of [-1, 1]) {
      const x = side * bound * mix(0.23, 0.15, adjust);
      g.line(
        [
          [x, y - 55, z + 54],
          [x, y + 100, z - 32],
        ],
        colors[i],
        1.3,
        interval,
      );
    }
  }
  const top = [pointX, -260 * spread - 40, 60],
    bottom = [pointX, 290 * spread, -420];
  g.line([top, bottom], C.coral, 1.5, interval * pin);
  g.draw();
  d.axis?.(g.project(top), g.project(bottom), interval * pin);
  if (q > 0.83)
    note(
      d,
      W,
      H,
      "One investigation. Five signals.",
      "Solid: matching identity · hollow: nearest time",
      "left",
      interval,
    );
  return pin > 0.5
    ? "Pinned at " +
        Math.round(f * 100) +
        "%. Pressure uses nearest-time correspondence, not identity or causal proof."
    : "Pin released. Shared interval remains inspectable.";
}
