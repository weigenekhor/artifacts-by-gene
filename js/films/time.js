import { space } from "../space.js";
import { lens, at, mix, palette as P, waveform } from "./cinema.js";
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
      interval = [0.18, 0.46, 0.31, 0.24, 0.4][i],
      due = check + interval,
      accent = interval < 0.25 ? P.amber : interval > 0.38 ? P.blue : P.cyan;
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
      accent,
      3,
    );
    s.alpha(derive, () => {
      s.point(end, y, 6, accent);
      s.line(
        [
          [x, y - 24],
          [end, y - 24],
        ],
        accent,
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
    scale: m ? 1.12 : 1.05,
    cy: 0.59,
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
      y = mix(0, (i - 2) * (m ? 100 : 80), expand),
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
          visible * 0.28,
        );
      g.line(points, colors[i], 2.4, visible);
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
