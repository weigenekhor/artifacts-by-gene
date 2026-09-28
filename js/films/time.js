import { space } from "../space.js";
import { lens, at, mix, palette as P, waveform } from "./cinema.js";
export function history(d, q, f, W, H, m, hit) {
  const s = lens(d, W, H, m, P.blue),
    enter = at(q, 0.09, 0.27),
    resolve = at(q, 0.38, 0.26),
    hold = at(q, 0.7, 0.13),
    active = Math.min(4, Math.floor(f * 5));
  const g = space(d.c, {
    w: W,
    h: H,
    scale: m ? 1.15 : 1.37,
    cy: 0.54,
    yaw: mix(-0.38, 0.035, resolve),
    tilt: mix(1.04, 0.54, resolve),
  });
  // Histories are depth planes in an event volume. The selected lot advances through them.
  for (let layer = 0; layer < 12 && resolve < 0.995; layer++) {
    const z = -layer * 24 - 120 * enter;
    for (let row = 0; row < 12; row++) {
      const y = -160 + row * 29;
      for (let e = 0; e < 28; e++) {
        const x = -280 + e * 20;
        g.line(
          [
            [x, y, z],
            [x + 8 + ((e * 7) % 5), y, z],
          ],
          layer % 3 === 0 ? [118, 163, 210] : [106, 131, 153],
          1,
          (1 - resolve) * (0.65 - layer * 0.026),
        );
      }
    }
  }
  const names = ["Complete", "Interrupted", "Missing", "Repeated", "Rerun"];
  for (let row = 0; row < 5; row++) {
    const y = (row - 2) * (m ? 145 : 70),
      z = mix(-80, 22, enter),
      colour = row === 1 || row === 3 ? [208, 168, 109] : [105, 160, 220];
    const pts = [];
    for (let i = 0; i <= 100; i++) {
      const u = i / 100,
        x = -270 + 540 * u;
      let height = u > 0.17 && u < 0.78 ? 27 : 0;
      if (row === 1 && u > 0.48) height = 0;
      if (row === 2) height = 0;
      if (row === 3 && u > 0.4 && u < 0.9) height = 43;
      if (row === 4)
        height = (u > 0.18 && u < 0.36) || (u > 0.57 && u < 0.89) ? 27 : 0;
      pts.push([x, y, z + height * resolve]);
    }
    for (let i = 0; i < pts.length - 1; i++)
      g.poly(
        [[pts[i][0], y, z], [pts[i + 1][0], y, z], pts[i + 1], pts[i]],
        colour,
        0.18 * resolve,
      );
    g.line(pts, colour, 2, enter);
    for (let i = 0; i < 25; i++)
      g.line(
        [
          [-270 + i * 22, y - 5, z],
          [-270 + i * 22, y + 5, z],
        ],
        [151, 170, 191],
        0.9,
        enter * 0.7,
      );
    if (row === active && hold > 0.5)
      g.line(
        [
          [-280, y, z],
          [-280, y, z + 48],
        ],
        colour,
        2,
      );
    const p = g.project([-280, y, z]);
    hit((row + 0.5) / 5, 0, p[1] - 25, W, 50, names[row]);
  }
  g.draw();
  s.label("Event history / illustrative", W * 0.08, H * 0.075, 19, s.muted);
  s.alpha(hold, () =>
    s.label(
      names[active] + " deposition",
      W * 0.08,
      H * 0.94,
      m ? 25 : 29,
      s.ink,
    ),
  );
  return (
    "Wafer " +
    (active + 1) +
    " · " +
    names[active] +
    " · event interpretation, not manual reconstruction"
  );
}
export function schedule(d, q, f, W, H, m, hit) {
  const s = lens(d, W, H, m, P.amber),
    align = at(q, 0.12, 0.32),
    derive = at(q, 0.43, 0.28),
    active = Math.min(4, Math.floor(f * 5));
  const left = W * (m ? 0.2 : 0.15),
    width = W * (m ? 0.73 : 0.78),
    names = ["A-M1", "D-M1", "A-M2", "B-M1", "C-M1"];
  s.label("History", left, H * 0.09, 20);
  s.label("Next ANKO", W * 0.94, H * 0.09, 20, P.amber, "right");
  names.forEach((name, i) => {
    const y = H * (0.23 + i * 0.14),
      raw = [0.11, 0.43, 0.24, 0.38, 0.09][i],
      check = 0.13 + i * 0.055,
      due = check + 0.37;
    s.label(name, W * 0.03, y + 6, 22, s.ink);
    for (let t = 0; t < 24; t++) {
      const x = left + (width * t) / 24,
        offset = (1 - align) * Math.sin(i * 3) * W * 0.05;
      s.line(
        [
          [x + offset, y - 14],
          [x + offset, y + 14],
        ],
        P.muted,
        0.8,
        0.35,
      );
    }
    const x = left + width * mix(raw, check, align),
      end = mix(x, left + width * due, derive);
    s.line(
      [
        [left, y],
        [left + width, y],
      ],
      P.muted,
      0.6,
      0.45,
    );
    s.point(x, y, 5, P.white);
    s.line(
      [
        [x, y],
        [end, y],
      ],
      P.amber,
      3,
    );
    s.alpha(derive, () => {
      s.point(end, y, 6, P.amber);
      s.line(
        [
          [x, y - 24],
          [end, y - 24],
        ],
        P.amber,
        0.8,
        0.7,
      );
    });
    if (i === active && q > 0.72) s.rect(end - 9, y - 33, 18, 66, "#d6b07b20");
    hit((i + 0.5) / 5, 0, y - H * 0.06, W, H * 0.12, name);
  });
  s.alpha(derive, () =>
    s.label(
      "Valid check + required interval",
      W * 0.5,
      H * 0.96,
      20,
      P.white,
      "center",
    ),
  );
  return (
    names[active] +
    " · valid historical check → interval → next due · illustrative time"
  );
}
export function planning(d, q, f, W, H, m, hit) {
  const s = lens(d, W, H, m, P.amber),
    validate = at(q, 0.16, 0.28),
    schedule = at(q, 0.51, 0.24),
    active = Math.min(2, Math.floor(f * 3));
  const names = ["Workcenter A", "Workcenter B", "Workcenter C"],
    cx = W * 0.5,
    cy = H * 0.46,
    rx = W * (m ? 0.32 : 0.36),
    ry = H * 0.33;
  // History sits on concentric time horizons; future positions are earned by valid checks.
  for (let lane = 0; lane < 3; lane++) {
    const y = H * (0.25 + lane * 0.23),
      left = W * 0.17,
      right = W * 0.88;
    s.label(names[lane], W * 0.035, y - 35, m ? 21 : 20, s.ink);
    for (let e = 0; e < 24; e++) {
      const t = e / 23,
        theta = Math.PI * (0.15 + t * 0.7),
        x = mix(cx + Math.cos(theta) * rx, left + t * (right - left), validate),
        yy = mix(cy + Math.sin(theta) * ry + (lane - 1) * 35, y, validate);
      s.line(
        [
          [x, yy - 9],
          [x, yy + 9],
        ],
        e % 7 === 3 ? P.coral : P.muted,
        1.5,
        0.75,
      );
    }
    const valid = lane !== 1,
      origin = left + (right - left) * 0.58,
      forecast = valid ? mix(origin, right, schedule) : origin;
    s.line(
      [
        [origin, y],
        [forecast, y],
      ],
      valid ? P.amber : P.coral,
      3,
      schedule,
    );
    s.point(origin, y, 5, valid ? P.white : P.coral);
    s.alpha(schedule, () => {
      s.point(forecast, y, 7, valid ? P.amber : P.coral);
      s.label(
        valid ? "NEXT DUE" : "REVIEW",
        right,
        y + 42,
        19,
        valid ? P.amber : P.coral,
        "right",
      );
    });
    hit((lane + 0.5) / 3, W * 0.05, y - 40, W * 0.9, 85, names[lane]);
  }
  s.alpha(schedule, () =>
    s.line(
      [
        [W * 0.65, H * 0.1],
        [W * 0.65, H * 0.9],
      ],
      P.white,
      1,
      0.2,
    ),
  );
  return (
    names[active] +
    " · illustrative check history · " +
    (active === 1
      ? "No future date issued for a failed check"
      : "Due state derived from passing history")
  );
}
export function signals(d, q, f, W, H, m, hit, alternate = 0) {
  const s = lens(d, W, H, m, P.cyan),
    expand = at(q, 0.17, 0.5),
    front = at(q, 0.68, 0.16),
    names = [
      "Flow A",
      "Flow B",
      "Throttle Valve angle",
      "Pressure",
      "Temperature",
    ];
  const g = space(d.c, {
    w: W,
    h: H,
    scale: m ? 1.12 : 1.42,
    cy: 0.56,
    yaw: mix(-0.27, 0, front),
    tilt: mix(0.93, 0.31, front),
  });
  const cursor = q > 0.76 ? f : 0.63,
    colors = [
      [78, 185, 200],
      [90, 132, 201],
      [205, 164, 101],
      [127, 149, 165],
      [150, 165, 172],
    ];
  names.forEach((name, i) => {
    const visible = i === 0 ? 1 : at(q, 0.13 + i * 0.095, 0.14),
      y = mix(0, (i - 2) * (m ? 140 : 70), expand),
      z = (1 - expand) * (i * -45);
    const points = [];
    for (let j = 0; j <= 110; j++) {
      const u = j / 110;
      points.push([-285 + u * 570, y, z + waveform(i, u, i < 2) * 75]);
    }
    if (visible > 0.01) {
      for (let j = 0; j < points.length - 1; j++)
        g.poly(
          [
            [points[j][0], y, z],
            [points[j + 1][0], y, z],
            points[j + 1],
            points[j],
          ],
          colors[i],
          visible * 0.12,
        );
      g.line(points, colors[i], 1.8, visible);
      const clue = [-285 + 570 * 0.63, y, z + waveform(i, 0.63, i < 2) * 75];
      if (i === 0) {
        g.dot(clue, 5, [225, 240, 239]);
        g.line([[clue[0], y, z - 12], clue], colors[0], 1.3);
      }
      const xx = -285 + cursor * 570,
        half = 570 * mix(0.055, 0.14, alternate),
        start = Math.max(-285, xx - half),
        end = Math.min(285, xx + half);
      g.poly(
        [
          [start, y, z],
          [end, y, z],
          [end, y, z + 85],
          [start, y, z + 85],
        ],
        colors[0],
        front * 0.09,
      );
      for (const boundary of [start, end])
        g.line(
          [
            [boundary, y, z],
            [boundary, y, z + 85],
          ],
          colors[0],
          0.8,
          front * 0.4,
        );
      g.line(
        [
          [xx, y - 16, z],
          [xx, y + 16, z + 85],
        ],
        colors[0],
        1,
        front * 0.5,
      );
      const p = g.project([-290, y, z]);
      s.alpha(front, () =>
        s.label(
          name,
          m ? W * 0.055 : W * 0.08,
          p[1] - 35,
          m ? 19 : 17,
          i === 0 ? P.cyan : s.muted,
        ),
      );
    }
  });
  g.draw();
  return (
    "Flow A remains pinned · " +
    (alternate > 0.5 ? "Wider" : "Narrow") +
    " shared interval · illustrative signals"
  );
}
