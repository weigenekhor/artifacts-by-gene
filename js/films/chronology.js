import {
  cinema,
  block,
  rail,
  wafer,
  portal,
  note,
  C,
  TAU,
  points,
  at,
  mix,
} from "./set.js";
import { index } from "./studio.js";
import { sample } from "./drawing.js";

// Illustrative histories explain identity and reruns, not physical layer thickness.
export function history(d, q, f, W, H, m, hit) {
  const repair = at(q, 0.32, 0.25),
    lot = at(q, 0.63, 0.21),
    chosen = index(f, 5);
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.78, 0.68, 2.05, -120, -74],
      [0.3, -0.65, 0.4, 1.65, -70, -74],
      [0.61, -0.45, 0.5, 1.35, 0, -40],
      [0.84, -0.48, 0.92, 1.08, 0, 0],
      [1, -0.48, 0.92, 1.08, 0, 0],
    ],
    m,
  );
  const counts = [5, 5, 3, 0, 6],
    states = ["Complete", "Recovered", "Partial", "Missing", "Excessive"];
  for (let i = 4; i >= 0; i--) {
    const y = (i - 2) * 91,
      z = (i === chosen ? 20 : 0) * lot;
    const visibility = i === 1 ? 1 : at(q, 0.58 + i * 0.016, 0.17);
    const path = points(70, (t) => [
      -395 + t * 790,
      y + Math.sin(t * Math.PI) * 18,
      z - 165 * Math.sin(t * Math.PI),
    ]);
    // A whole track remains broken until the identified rerun arrives.
    const left = path.slice(0, 29),
      right = path.slice(36);
    rail(
      g,
      i === 1 ? left : path,
      20,
      12,
      i === 1 ? C.silver : C.dim,
      visibility,
    );
    if (i === 1) {
      rail(g, right, 20, 12, C.silver);
      rail(g, path.slice(28, 37), 20, 12, C.copper, repair);
    }
    for (let j = 0; j < 6; j++) {
      const x = -320 + j * 122,
        valid = j < counts[i],
        rerun = i === 1 && j === 2;
      const z0 = z - 165 * Math.sin(((x + 395) / 790) * Math.PI);
      if (!valid) {
        g.ring([x, y, z0], 20, C.dim, 0.65, 0, TAU, visibility);
        continue;
      }
      const lift = rerun ? (1 - repair) * 155 : 0;
      wafer(
        g,
        [x + (rerun ? (1 - repair) * 60 : 0), y - lift * 0.4, z0 + 12 + lift],
        22,
        3,
        rerun ? C.copper : C.silver,
        visibility,
      );
      if (rerun && repair < 1)
        g.line(
          points(40, (t) => [
            x + 60 * (1 - t),
            y - 62 * (1 - t),
            z0 + 12 + 155 * (1 - t),
          ]),
          C.copper,
          1,
          repair,
        );
    }
    g.target(hit, (i + 0.5) / 5, [0, y, z], 40, states[i]);
  }
  g.draw();
  if (q > 0.76)
    note(
      d,
      W,
      H,
      "W0" + (chosen + 1) + " / " + states[chosen],
      counts[chosen] + " deposition events · expected 5",
      "left",
      lot,
    );
  else if (q > 0.22 && q < 0.59)
    note(
      d,
      W,
      H,
      "W02",
      "Same wafer. Returning run.",
      "left",
      at(q, 0.22, 0.08),
    );
  return `W0${chosen + 1} · ${states[chosen]} · ${counts[chosen]} events; expected five. Only W02 receives the rerun.`;
}

export function schedule(d, q, f, W, H, m, hit) {
  const sel = index(f, 4),
    extend = at(q, 0.07, 0.48),
    reveal = at(q, 0.62, 0.23),
    days = [8, 10, 13, 15],
    intervals = [4, 7, 4, 7];
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.64, 0.52, 2.15, -310, 0],
      [0.19, -0.52, 0.36, 1.9, -260, 0],
      [0.49, -0.33, 0.35, 1.75, -165, 0],
      [0.83, 0.2, 0.53, 1.22, 0, 145],
      [1, 0.18, 0.43, 1.22, 0, 145],
    ],
    m,
  );
  for (let i = 0; i < 4; i++) {
    const y = (i - sel) * 105,
      visibility = i === sel ? 1 : reveal;
    const start = -350 + (days[i] - 8) * 19,
      end = start + intervals[i] * 69;
    const travel = i === sel ? extend : reveal;
    block(g, [start, y, 0], [14, 65, 28], C.silver, visibility);
    const route = points(48, (t) => [
      mix(start, end, t * travel),
      y,
      -Math.sin(t * Math.PI) * 27,
    ]);
    rail(g, route, 18, 9, i === sel ? C.copper : C.dim, visibility);
    block(
      g,
      [mix(start, end, travel), y, 5],
      [8, 88 * at(travel, 0.85, 0.15), 36],
      i === sel ? C.copper : C.silver,
      visibility,
    );
    g.target(hit, (i + 0.5) / 4, [end, y, 5], 30, "Chamber " + "ABCD"[i]);
  }
  const now = -350 + (16 - days[sel]) * 69;
  g.face(
    [
      [now, -240, -70],
      [now, 260, -70],
      [now, 260, 60],
      [now, -240, 60],
    ],
    C.blue,
    reveal * 0.12,
  );
  g.draw();
  note(
    d,
    W,
    H,
    q < 0.58
      ? "Last ANKO / " + days[sel] + " September"
      : "Due / " + (days[sel] + intervals[sel]) + " September",
    q < 0.58
      ? "Chamber " + "ABCD"[sel]
      : `From ${days[sel]} Sep + ${intervals[sel]} days`,
    "left",
    at(q, 0.035, 0.08),
  );
  if (q > 0.78)
    d.alpha(reveal, () =>
      d.text("NOW / 16 SEP", W - 28, H - 25, 17, d.muted, "right"),
    );
  return `Chamber ${"ABCD"[sel]} · ${days[sel]} Sep + ${intervals[sel]} days → ${days[sel] + intervals[sel]} Sep. The interval starts at a recorded ANKO event.`;
}

export function planning(d, q, f, W, H, m, hit) {
  const sel = index(f, 3),
    fail = sel !== 0,
    pass = at(q, 0.25, 0.18),
    travel = at(q, 0.48, 0.3),
    hold = at(q, 0.81, 0.08);
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, 0.32, 0.1, 1.6, -140, 0],
      [0.32, 0.06, 0.04, 1.35, -60, 0],
      [0.64, -0.4, 0.37, 1.12, 0, 10],
      [1, -0.18, 0.26, 1.1, 0, 0],
    ],
    m,
  );
  // Three independent checks form a physical gate. A rejected check leaves it closed.
  for (let i = 0; i < 3; i++) {
    const x = -255 + i * 80,
      t = at(q, 0.06 + i * 0.075, 0.13),
      blocked = i === 2 && fail;
    const opening = blocked ? 0 : pass;
    block(
      g,
      [x, -70 - opening * 35, 0],
      [35, 95, 22],
      blocked ? C.copper : C.silver,
      t,
    );
    block(
      g,
      [x, 70 + opening * 35, 0],
      [35, 95, 22],
      blocked ? C.copper : C.silver,
      t,
    );
  }
  const distance = fail ? 170 : 590,
    edge = -325 + travel * distance;
  rail(
    g,
    [
      [-325, 0, 18],
      [edge, 0, 18],
    ],
    13,
    10,
    fail ? C.dim : C.copper,
  );
  if (fail) {
    block(g, [-155, 0, 18], [7, 62, 30], C.copper, travel);
  } else {
    portal(g, [265, 0, 18], 100, 165, at(travel, 0.9, 0.1), C.copper);
  }
  g.draw();
  if (q < 0.43)
    note(
      d,
      W,
      H,
      "Mean. Spread. Raw evidence.",
      sel === 2
        ? "Raw evidence missing"
        : sel === 1
          ? "112 exceeds the limit of 110"
          : "Checks within their configured limits",
      "left",
      pass,
    );
  else if (!fail)
    d.alpha(hold, () => {
      d.text("23 SEP", W * 0.66, H * 0.49, 50, d.ink, "center");
      d.text("16 Sep + 7 days", W * 0.66, H * 0.49 + 35, 18, d.muted, "center");
    });
  else
    note(
      d,
      W,
      H,
      sel === 1 ? "Check failed." : "Evidence missing.",
      "No valid next date.",
      "right",
      hold,
    );
  return fail
    ? sel === 1
      ? "FAIL · raw value 112 exceeds 110. No valid date."
      : "MISSING · no eligible evidence. No valid date."
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
  const grow = at(q, 0.25, 0.46),
    interval = at(q, 0.7, 0.16),
    names = ["Temperature", "Correction", "Power", "Pressure", "Flow"];
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.2, 0.22, 3.1, 0, 0],
      [0.22, -0.2, 0.22, 2.7, 0, 0],
      [0.54, -0.34, 0.58, 1.38, 0, 0],
      [0.84, 0.16, 0.62, 0.86, 0, 8],
      [1, 0.16, 0.62, 0.86, 0, 8],
    ],
    m,
  );
  const bound = m ? 275 : 360,
    pointX = (f - 0.5) * bound * 0.8;
  const pinPoint = [
    pointX,
    (sample(0.5 + (f - 0.5) * 0.4, 0) - sample(0.5, 0)) * 135,
    8,
  ];
  for (let i = 4; i >= 0; i--) {
    const arrive =
        i === 0 ? at(q, 0.05, 0.13) : at(q, 0.25 + (i - 1) * 0.09, 0.17),
      depth = -i * 79,
      y = [0, 108, -105, 208, -206][i] * grow;
    const path = points(75, (t) => {
      const u = 0.5 + (t - 0.5) * mix(1, 0.62, alternate);
      const x = -bound + t * bound * 2,
        turn = [0, 0.29, -0.33, 0.45, -0.5][i] * grow;
      return [
        x,
        y + Math.sin(turn) * x + (sample(u, i) - sample(0.5, i)) * 135,
        depth + Math.sin(turn) * x * 0.46,
      ];
    });
    // Related signals are spatial territories around the clue, with distinct relief.
    for (let j = 1; j < path.length; j++) {
      const a = path[j - 1],
        b = path[j];
      g.face(
        [a, b, [b[0], b[1] + 30, depth - 45], [a[0], a[1] + 30, depth - 45]],
        i === 0 ? C.blue : C.dim,
        arrive * (i === 0 ? 1 : 0.8),
      );
    }
    g.line(path, i === 0 ? C.pale : C.silver, 1.25, arrive);
    const yy =
      y +
      Math.sin([0, 0.29, -0.33, 0.45, -0.5][i] * grow) * pointX +
      (sample(0.5 + (f - 0.5) * 0.4, i) - sample(0.5, i)) * 135;
    const x = pointX + (i === 3 ? 13 : 0);
    g.dot(
      [x, yy, depth + 4],
      i === 0 ? 7 : 4,
      i === 0 ? C.copper : C.silver,
      i === 3,
      i === 0 ? 1 : arrive,
    );
    if (i > 0)
      g.line(
        [pinPoint, [x, yy, depth + 5]],
        C.copper,
        0.7,
        arrive * pin * 0.48,
      );
    const span = Math.round(8 * interval);
    if (span > 0) {
      const a = path[37 - span],
        b = path[37 + span];
      g.face(
        [a, b, [b[0], b[1] + 30, b[2] - 45], [a[0], a[1] + 30, a[2] - 45]],
        C.copper,
        interval * 0.2,
      );
      for (const v of [a, b])
        g.line([v, [v[0], v[1] + 30, v[2] - 45]], C.copper, 1, interval * 0.75);
    }
  }
  g.ring(pinPoint, 13, C.copper, 1.5, 0, TAU, at(q, 0.12, 0.08) * pin);
  const top = [pointX, -205 * grow - 12, 12],
    bottom = [pointX, 215, -325];
  g.line([top, bottom], C.copper, 1.3, interval * pin);
  g.draw();
  note(
    d,
    W,
    H,
    q < 0.24
      ? "One observation."
      : q < 0.73
        ? "Pinned."
        : "The investigation stays with it.",
    q > 0.75 ? "Solid / matching identity     Hollow / nearest time" : "",
    "left",
    at(q, 0.015, 0.05),
  );
  d.axis?.(g.project(top), g.project(bottom), interval * pin);
  return pin > 0.5
    ? `Pinned inspection at ${Math.round(f * 100)}% of the displayed interval. Pressure uses hollow nearest-time correspondence, not matching identity.`
    : `Pin released. Inspecting ${Math.round(f * 100)}% of the shared interval.`;
}
