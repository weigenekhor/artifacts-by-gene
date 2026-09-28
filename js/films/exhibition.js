import { space } from "../space.js";
import { lens, at, mix, palette as P } from "./cinema.js";

export function history(d, q, f, W, H, m, hit) {
  const s = lens(d, W, H, m, P.blue),
    split = at(q, 0.05, 0.21),
    evaluate = at(q, 0.28, 0.38),
    resolve = at(q, 0.72, 0.16);
  const g = space(d.c, {
    w: W,
    h: H,
    scale: m ? 0.78 : 0.99,
    cy: 0.55,
    yaw: mix(-0.32, 0.03, resolve),
    tilt: mix(0.85, 0.36, resolve),
    cull: true,
  });
  // Depth implies log volume. The three candidate interpretations share the same history.
  for (let layer = 0; layer < 9; layer++)
    for (let row = 0; row < 10; row++) {
      const y = -190 + row * 40,
        z = -layer * 22 - 50;
      for (let n = 0; n < 34; n++) {
        const x = -305 + n * 18;
        g.line(
          [
            [x, y, z],
            [x + 10 + (n % 4), y, z],
          ],
          [87, 135, 177],
          1,
          (1 - resolve) * 0.38,
        );
      }
    }
  const scanner = Math.min(2, Math.floor(evaluate * 3));
  for (let r = 0; r < 3; r++) {
    const chosen = r === 1,
      clear = chosen ? 1 : 1 - resolve * 0.94,
      y = mix(0, (r - 1) * 140, split) * (1 - resolve),
      z = 20 + r * 18 - resolve * (chosen ? -40 : 130);
    const pts = [];
    for (let i = 0; i <= 90; i++) {
      const u = i / 90,
        v =
          (u > 0.13 && u < 0.4 ? 30 : 0) +
          (u > 0.59 && u < 0.84 ? (r === 0 ? 0 : r === 1 ? 30 : 54) : 0);
      pts.push([-290 + 580 * u, y, z + v * mix(1, 2.8, resolve)]);
    }
    for (let i = 0; i < 90; i++)
      g.poly(
        [[pts[i][0], y, z], [pts[i + 1][0], y, z], pts[i + 1], pts[i]],
        chosen ? [56, 147, 228] : [68, 85, 108],
        split * clear * 0.6,
      );
    g.line(
      pts,
      chosen ? [94, 181, 253] : [133, 149, 173],
      chosen ? 2.8 : 1.5,
      clear,
    );
    if (chosen && resolve > 0) {
      for (let i = 0; i < 90; i++)
        g.poly(
          [
            pts[i],
            pts[i + 1],
            [pts[i + 1][0], y + 36 * resolve, pts[i + 1][2]],
            [pts[i][0], y + 36 * resolve, pts[i][2]],
          ],
          [54, 119, 181],
          resolve,
        );
      g.line(
        pts.map((p) => [p[0], p[1] + 36 * resolve, p[2]]),
        [106, 183, 242],
        1.4,
        resolve,
      );
    }
    const scan = at(q, 0.28 + r * 0.115, 0.12),
      xx = -290 + 580 * scan;
    if (scan > 0 && scan < 1)
      g.line(
        [
          [xx, y - 22, z - 12],
          [xx, y + 22, z + 85],
        ],
        [245, 206, 142],
        2.5,
        clear,
      );
    if (scan > 0.99)
      g.dot(
        [305, y, z + 20],
        chosen ? 6 : 3,
        chosen ? [88, 192, 230] : [143, 116, 119],
      );
    hit(
      (r + 0.5) / 3,
      0,
      H * (0.16 + r * 0.22),
      W,
      H * 0.22,
      "Route " + (r + 1),
    );
  }
  g.draw();
  s.label(
    resolve > 0.5 ? "Rerun correctly interpreted" : "Three possible histories",
    W * 0.08,
    H * 0.085,
    m ? 25 : 28,
    s.ink,
  );
  s.alpha(evaluate * (1 - resolve), () =>
    s.label(
      "Evaluating route " + (scanner + 1) + " / 3",
      W * 0.08,
      H * 0.94,
      23,
      P.blue,
    ),
  );
  s.alpha(resolve, () =>
    s.label(
      "The evidence determines the outcome.",
      W * 0.08,
      H * 0.94,
      24,
      P.blue,
    ),
  );
  return "Illustrative history · three candidate routes scanned · retained interpretation includes the rerun";
}

export function pathfinder(d, q, f, W, H, m, hit) {
  const s = lens(d, W, H, m, P.blue),
    travel = at(q, 0.08, 0.27),
    shortcut = at(q, 0.37, 0.28),
    arrive = at(q, 0.71, 0.17);
  const g = space(d.c, {
    w: W,
    h: H,
    scale: 1.15,
    cy: 0.52,
    yaw: mix(-0.52, 0, arrive),
    tilt: 0.3,
    cull: true,
  });
  for (let layer = 0; layer < 5; layer++) {
    const x = mix(-255 + layer * 120, (layer - 2) * 40, shortcut),
      z = -layer * 58,
      y = (1 - shortcut) * Math.sin(layer * 2) * 65;
    for (let branch = 0; branch < 7; branch++) {
      const yy = y + (branch - 3) * 44,
        selected = branch === 3;
      g.line(
        [
          [x, yy, z],
          [x + 80, yy, z],
        ],
        selected ? [93, 162, 246] : [70, 91, 123],
        selected ? 3 : 1,
        selected ? 1 : 1 - shortcut * 0.9,
      );
      if (layer < 4)
        g.line(
          [
            [x + 80, yy, z],
            [x + 120, y, z - 58],
          ],
          [62, 86, 116],
          0.8,
          (1 - shortcut) * 0.8,
        );
    }
  }
  const end = mix(-270, 270, travel);
  g.line(
    [
      [-280, 0, 60],
      [end, 0, 60],
    ],
    [94, 165, 250],
    4,
    1 - arrive,
  );
  g.dot([end, 0, 60], 6, [171, 212, 255]);
  g.draw();
  s.alpha(1 - arrive, () =>
    s.label(
      shortcut > 0.6
        ? "Direct route established"
        : "The chart is beyond the hierarchy.",
      W * 0.08,
      H * 0.92,
      26,
      s.ink,
    ),
  );
  s.alpha(arrive, () => {
    const x = W * 0.14,
      y = H * 0.18,
      ww = W * 0.72,
      hh = H * 0.62;
    s.surface(x, y, ww, hh);
    s.label("External SPC chart", x + 28, y + 38, 25, "#d9e7f6");
    for (const t of [0.28, 0.72])
      s.line(
        [
          [x + 30, y + hh * t],
          [x + ww - 30, y + hh * t],
        ],
        "#9ba8bb",
        1,
        0.35,
      );
    s.trace(
      x + 30,
      y + hh * 0.22,
      ww - 60,
      hh * 0.6,
      Math.floor(f * 3),
      1,
      P.blue,
      true,
    );
  });
  return "A direct shortcut opens the intended external chart; SPC Pathfinder is not the chart engine";
}

export function diagnose(d, q, f, W, H, m, hit) {
  const s = lens(d, W, H, m, P.coral),
    observed = at(q, 0.13, 0.28),
    weigh = at(q, 0.4, 0.27),
    resolve = at(q, 0.72, 0.14);
  const g = space(d.c, {
    w: W,
    h: H,
    scale: m ? 1.07 : 1.05,
    cy: mix(0.55, 0.46, resolve),
    yaw: mix(-0.42, 0.04, weigh),
    tilt: mix(0.65, 0.35, resolve),
    cull: true,
    segments: 32,
    rings: 2,
  });
  // A retained symptom sits above candidate explanations. Evidence changes their prominence.
  for (let i = 0; i < 9; i++) {
    const selected = [1, 4, 7].includes(i),
      rank = (i - 1) / 3,
      x = selected ? mix(0, (rank - 1) * 182, weigh) : ((i % 3) - 1) * 175,
      y = selected
        ? mix((Math.floor(i / 3) - 1) * 120, 65, weigh)
        : (Math.floor(i / 3) - 1) * 120,
      z = selected ? weigh * 55 : -weigh * 130;
    const a = selected ? 1 : 1 - weigh * 0.97;
    if (a > 0.08) {
      g.box(x, y, z, 132, 86, 4, selected ? [78, 45, 62] : [26, 37, 53]);
      for (let k = 0; k < 4; k++) {
        const e = at(q, 0.14 + k * 0.065, 0.16),
          yy = y - 27 + k * 18;
        g.line(
          [
            [x - 48, yy, z + 6],
            [x - 48 + e * (selected ? 88 : 29), yy, z + 6],
          ],
          selected ? [229, 137, 153] : [71, 94, 122],
          2.2,
          a,
        );
      }
    }
    const evidence = at(q, 0.15 + i * 0.025, 0.13);
    if (a > 0.08)
      g.line(
        [
          [x - 65, y + 44, z + 7],
          [x - 65 + 130 * evidence, y + 44, z + 7],
        ],
        [225, 121, 144],
        2,
        a,
      );
  }
  const symptom = Array.from({ length: 70 }, (_, j) => {
    const u = j / 69;
    return [
      -280 + 560 * u,
      -120,
      72 + Math.exp(-(((u - 0.62) * 19) ** 2)) * 60,
    ];
  });
  g.line(symptom, [238, 155, 152], 2.5);
  g.draw();
  s.alpha(observed * (1 - at(resolve, 0, 0.45)), () => {
    ["Temperature", "Gas", "Process", "Clean"].forEach((name, i) =>
      s.alpha(at(q, 0.13 + i * 0.045, 0.12), () =>
        s.label(name, W * (0.08 + i * 0.24), H * 0.94, 23, s.ink),
      ),
    );
  });
  const names = ["Ceiling condition", "Optris settings", "LayTec / viewport"];
  s.alpha(resolve, () => {
    const selected = Math.min(2, Math.floor(f * 3));
    s.label("Recommended checks", W * 0.08, H * 0.77, 22, P.coral);
    if (m) {
      s.label(names[selected], W * 0.08, H * 0.9, 31, s.ink);
    } else
      names.forEach((n, i) => {
        s.label(
          n,
          W * (0.08 + i * 0.31),
          H * 0.9,
          24,
          i === selected ? s.ink : s.muted,
        );
      });
  });
  return (
    names[Math.min(2, Math.floor(f * 3))] +
    " · suggested check, not a proven physical cause"
  );
}

export function configuration(d, q, f, W, H, m, hit) {
  const s = lens(d, W, H, m, P.blue),
    align = at(q, 0.12, 0.38),
    quiet = at(q, 0.54, 0.17),
    final = at(q, 0.76, 0.12);
  const rows = [
    ["Name", "EH35Fault", "EH35Fault"],
    ["Type", "Boolean", "Boolean"],
    ["Popup", "0", "—"],
    ["EnableShow", "1", "0"],
    ["Number", "—", "−1"],
  ];
  const raw = [3, 0, 4, 1, 2],
    left = W * 0.075,
    right = W * 0.57;
  s.label("Reference reactor", left, H * 0.08, 22, s.ink);
  s.label("Target reactor", right, H * 0.08, 22, s.ink);
  rows.forEach((row, i) => {
    const changed = i > 1,
      y = H * (0.23 + i * 0.13),
      other = mix(H * (0.23 + raw[i] * 0.13), y, at(q, 0.12 + i * 0.035, 0.25));
    const a = changed ? 1 : 1 - quiet * 0.86,
      col = i === 2 ? P.coral : i === 4 ? P.cyan : P.blue;
    s.alpha(a, () => {
      s.line(
        [
          [left + W * 0.31, y],
          [right, other],
        ],
        col,
        1.2,
        0.55 * align,
      );
      s.label(row[0], left, y - 14, 21, changed ? col : s.muted);
      s.label(row[1], left + W * 0.31, y - 14, 23, s.ink, "right");
      if (align > 0.99)
        s.label(row[0], right, other - 14, 21, changed ? col : s.muted);
      s.alpha(1 - at(q, 0.08, 0.04) + at(q, 0.53, 0.08), () =>
        s.label(row[2], W * 0.91, other - 14, 23, s.ink, "right"),
      );
      s.line(
        [
          [left, y],
          [left + W * 0.32, y],
        ],
        col,
        1,
        0.6,
      );
      s.line(
        [
          [right, other],
          [W * 0.92, other],
        ],
        col,
        1,
        0.6,
      );
    });
    hit((i + 0.5) / 5, 0, y - 25, W, 45, row[0]);
  });
  s.alpha(final, () =>
    s.label(
      "ExHeating.EH35Fault / 3 differences",
      W * 0.075,
      H * 0.94,
      24,
      s.ink,
    ),
  );
  return "Popup removed · EnableShow changed · Number added · from the actual devices.xml report";
}

function analytical(d, q, f, W, H, m, hit, legacy) {
  const s = lens(d, W, H, m, legacy ? P.violet : P.cyan),
    overview = at(q, 0.49, 0.34),
    status = at(q, 0.77, 0.12),
    active = Math.min(17, Math.floor(f * 18));
  const g = space(d.c, {
    w: W,
    h: H,
    scale: mix(1.65, m ? 1 : 0.79, overview),
    cy: mix(0.66, 0.5, overview),
    yaw: mix(legacy ? 0.36 : -0.35, legacy ? -0.08 : 0.05, overview),
    tilt: mix(0.85, 0.12, overview),
    cull: true,
  });
  const cw = legacy ? 270 : 190,
    ch = legacy ? 48 : 70,
    cols = legacy ? 2 : 3,
    rows = legacy ? 9 : 6,
    count = 18;
  const color = legacy ? [164, 130, 230] : [58, 192, 174],
    fail = [224, 127, 130];
  g.box(0, 0, -15, cw * cols + 30, ch * rows + 20, 7, [23, 35, 48]);
  for (let i = 0; i < count; i++) {
    const col = i % cols,
      row = Math.floor(i / cols),
      x = (col - cols / 2) * cw + 14,
      y = (row - rows / 2) * ch + 10,
      visible = at(q, i * 0.012, 0.13),
      bad = i === 4 || i === 13;
    for (const limit of [0.25, 0.76])
      g.line(
        [
          [x, y + ch * limit, 0],
          [x + cw - 27, y + ch * limit, 0],
        ],
        [85, 111, 127],
        0.7,
        visible * 0.8,
      );
    const pts = [];
    for (let j = 0; j < 35; j++) {
      const u = j / 34,
        v =
          0.48 +
          Math.sin(u * 19 + i) * 0.12 +
          Math.sin(u * 43 + i) * 0.035 +
          (bad && j === 21 ? 0.4 : 0);
      pts.push([x + u * (cw - 27), y + (1 - v) * ch, 5]);
    }
    g.line(pts, bad ? fail : color, 1.7, visible);
    for (let j = 0; j < 35; j += 2)
      g.dot(pts[j], 1.7, bad && j === 20 ? fail : color, visible);
    if (status > 0.1)
      g.dot(
        [x + cw - 17, y + ch * 0.48, 5],
        bad ? 4 : 3,
        bad ? fail : color,
        status,
      );
    hit(
      (i + 0.5) / count,
      W * (col / cols),
      H * (row / rows),
      W / cols,
      H / rows,
      "Parameter " + (i + 1),
    );
  }
  g.draw();
  s.alpha(status, () => {
    s.label(
      legacy
        ? "Legacy processes / review in context"
        : "Every parameter / one review surface",
      W * 0.05,
      H * 0.075,
      24,
      s.ink,
    );
    s.label(
      "Parameter " +
        (active + 1) +
        "  " +
        ([4, 13].includes(active) ? "FAIL" : "PASS"),
      W * 0.05,
      H * 0.96,
      24,
      [4, 13].includes(active) ? P.coral : legacy ? P.violet : P.cyan,
    );
  });
  return "18 illustrative parameter charts · individual control limits and pass/fail status";
}
export const spc = (d, q, f, W, H, m, hit) =>
  analytical(d, q, f, W, H, m, hit, false);
export const legacy = (d, q, f, W, H, m, hit) =>
  analytical(d, q, f, W, H, m, hit, true);

export function planning(d, q, f, W, H, m, hit) {
  const s = lens(d, W, H, m, P.amber),
    validate = at(q, 0.12, 0.3),
    future = at(q, 0.49, 0.27),
    active = Math.min(5, Math.floor(f * 6));
  const g = space(d.c, {
    w: W,
    h: H,
    scale: m ? 1 : 0.86,
    cy: 0.51,
    yaw: mix(-0.37, 0, future),
    tilt: mix(0.83, 0.18, future),
    cull: true,
  });
  const colors = [
    [231, 169, 86],
    [73, 103, 137],
    [228, 177, 107],
    [95, 169, 204],
    [135, 71, 86],
    [64, 163, 174],
  ];
  for (let i = 0; i < 6; i++) {
    const y = (i - 2.5) * 64,
      valid = i !== 1 && i !== 4,
      x0 = -265,
      check = -55 + (i % 3) * 26,
      due = check + 90 + (i % 4) * 34;
    for (let j = 0; j < 29; j++) {
      const x = x0 + j * 18,
        offset = (1 - validate) * Math.sin(i + j * 0.6) * 18;
      g.line(
        [
          [x, y - 8, offset],
          [x, y + 8, offset],
        ],
        [66, 93, 114],
        1,
        0.8,
      );
    }
    g.line(
      [
        [x0, y, 0],
        [check, y, 0],
      ],
      [131, 152, 167],
      1.5,
    );
    const col = valid ? colors[i] : [220, 112, 119];
    g.dot([check, y, 5], 5, col);
    if (valid) {
      const end = mix(check, due, future);
      g.line(
        [
          [check, y, 5],
          [end, y, 5],
        ],
        col,
        4,
      );
      g.dot([end, y, 5], 6, col);
    } else if (future > 0.01)
      g.line(
        [
          [check - 6, y - 6, 5],
          [check + 6, y + 6, 5],
        ],
        col,
        2.4,
      );
    const a = g.project([-292, y, 5]);
    s.alpha(validate, () =>
      s.label(String.fromCharCode(65 + i), a[0], a[1] + 6, 24, s.ink, "center"),
    );
    hit(
      (i + 0.5) / 6,
      0,
      H * (0.15 + i * 0.115),
      W,
      H * 0.12,
      "Workcenter " + String.fromCharCode(65 + i),
    );
  }
  g.draw();
  s.label("Across the workcenters", W * 0.08, H * 0.075, 25, s.ink);
  s.alpha(future, () =>
    s.label(
      m
        ? "Passing checks earn a due date."
        : "A failed check cannot earn a future due date.",
      W * 0.08,
      H * 0.95,
      24,
      P.amber,
    ),
  );
  return (
    "Workcenter " +
    String.fromCharCode(65 + active) +
    " · " +
    ([1, 4].includes(active)
      ? "Failed check: no future date issued"
      : "Valid history: next check scheduled") +
    " · illustrative histories"
  );
}
