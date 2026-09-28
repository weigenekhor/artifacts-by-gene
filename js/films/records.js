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

export function compare(d, q, selected, W, H, m, data) {
  const falseMatch = at(q, 0.13, 0.11),
    quiet = at(q, 0.7, 0.12);
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.46, 0.23, 1.28, 0, 0, 0],
      [0.23, 0.31, 0.12, 1.42, -40, 0, 0],
      [0.5, -0.18, 0.36, 1.25, 0, 0, -40],
      [0.72, -0.12, 0.12, 1.25, 0, 0, 0],
      [0.87, 0, 0.08, 1.42, 0, 0, 0],
      [1, 0, 0.08, 1.42, 0, 0, 0],
    ],
    m,
  );
  const row = data.rows[selected];
  for (let side = 0; side < 2; side++) {
    const x = side ? 228 : -228,
      base = side ? -125 : 30;
    // Unprinted document edges make order and depth visible without a fake UI.
    for (let page = 3; page >= 0; page--)
      block(
        g,
        [x + page * 4, 0, base - page * 8],
        [235, 360, 2],
        C.dim,
        (1 - quiet * 0.75) * 0.24,
      );
    for (let i = 0; i < data.rows.length; i++) {
      const r = data.rows[i],
        active = i === selected,
        t = at(q, 0.29 + i * 0.045 + (i === 4 ? 0.08 : 0), 0.22);
      const initial = (r.raw[side] - 3.1) * 45,
        target = (i - 2.5) * 46;
      const y = mix(initial, target, t) * (1 - quiet * (active ? 1 : 0.15));
      const z =
        base +
        Math.sin(t * Math.PI) * (side ? -1 : 1) * (55 + i * 13) +
        quiet * (active ? 105 : -140);
      const alpha = active ? 1 : 1 - quiet * 0.84,
        color = active ? C.coral : C.violet;
      const path = points(20, (u) => [
        x + (u - 0.5) * 185,
        y + Math.sin(u * Math.PI) * 6 * (1 - t),
        z,
      ]);
      curtain(g, path, z - 7, color, alpha);
      if (!side) {
        if (q < 0.28) {
          const gap = falseMatch * 90;
          g.line(
            [
              [x + 96, initial, base],
              [-gap, initial, base - 50],
            ],
            C.coral,
            0.8,
            1 - falseMatch,
          );
          g.line(
            [
              [gap, initial, -80],
              [132, initial, -125],
            ],
            C.coral,
            0.8,
            1 - falseMatch,
          );
        } else {
          const ry =
            mix((r.raw[1] - 3.1) * 45, target, t) *
            (1 - quiet * (active ? 1 : 0.15));
          g.line(
            points(48, (u) => [
              mix(-128, 128, u),
              mix(y, ry, u),
              mix(z, -125 + quiet * (active ? 105 : -140), u) +
                Math.sin(u * Math.PI) * (1 - t) * 135,
            ]),
            color,
            active ? 1.6 : 0.65,
            t * alpha,
          );
        }
      }
    }
  }
  g.draw();
  if (q > 0.78) {
    const a = at(q, 0.78, 0.07);
    note(d, W, H, row.property, row.node, "left", a);
    d.alpha(a, () => {
      d.text(row.left, W * 0.3, H * 0.55, 46, d.ink, "center");
      d.text(row.right, W * 0.7, H * 0.55, 46, "#ff897a", "center");
    });
  }
}

export function pathfinder(d, q, f, W, H, m, hit) {
  const sel = index(f, 3),
    filter = at(q, 0.2, 0.29),
    open = at(q, 0.47, 0.17),
    dispatch = at(q, 0.71, 0.12);
  const chosen = [8 + sel, 26 + sel, 44 + sel];
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, 0.3, 0.08, 2.5, 0, 0, 80],
      [0.22, -0.22, 0.16, 1.65, 0, -5, -30],
      [0.49, -0.13, 0.25, 1.38, 0, 0, -140],
      [0.65, 0.22, 0.4, 1.05, 0, 0, -120],
      [0.87, -0.1, 0.36, 0.84, 0, 0, -160],
      [1, -0.1, 0.36, 0.84, 0, 0, -160],
    ],
    m,
  );
  for (let i = 53; i >= 0; i--) {
    const tier = Math.floor(i / 9),
      col = i % 9,
      selected = chosen.includes(i),
      n = chosen.indexOf(i);
    const a = (col / 8 - 0.5) * Math.PI * 1.35,
      r = 290 + tier * 45;
    const t = at(filter, tier * 0.06, 0.6);
    const x = mix(
      Math.sin(a) * r,
      selected ? (n - 1) * 265 : Math.sin(a) * (r + 500),
      selected ? open : t,
    );
    const y = mix(
      Math.cos(a) * -100 + 80,
      selected ? 0 : (tier - 2.5) * 180,
      selected ? open : t,
    );
    const z = mix(-tier * 100, selected ? -60 : -1100, selected ? open : t);
    const alpha = selected ? 1 : 1 - t * 0.94,
      color = selected ? C.emerald : C.dim;
    // Destinations are apertures in an archive, not a smaller list of cards.
    for (let k = 0; k < 3; k++)
      g.line(
        [
          [x - 22 - k * 4, y - 36 - k * 5, z - k * 10],
          [x + 22 + k * 4, y - 36 - k * 5, z - k * 10],
          [x + 22 + k * 4, y + 36 + k * 5, z - k * 10],
        ],
        color,
        selected ? 1.2 : 0.6,
        alpha,
      );
    g.dot([x, y, z + 5], selected ? 5 : 2.5, color, false, alpha);
    if (selected) {
      const route = points(60, (u) => [
        x * (1 - u * 0.24),
        y + Math.sin(u * Math.PI) * 90,
        z + u * 430,
      ]);
      g.line(
        route.slice(0, Math.max(2, Math.ceil(dispatch * 60))),
        C.emerald,
        2,
        dispatch,
      );
      if (dispatch > 0.01)
        g.dot(route[Math.min(60, Math.floor(dispatch * 60))], 4, C.emerald);
      g.target(hit, (sel + 0.5) / 3, [x, y, z], 35, "Selected destination");
    }
  }
  g.draw();
  if (q > 0.83)
    note(d, W, H, "Three exact destinations.", "", "left", at(q, 0.83, 0.04));
  return (
    "Selection " +
    "ABC"[sel] +
    " · three shortcuts dispatch together. Pathfinder does not calculate the destination charts."
  );
}

export function configuration(d, q, f, W, H, m, hit) {
  const sel = index(f, 3),
    close = at(q, 0.29, 0.37),
    approach = at(q, 0.69, 0.17);
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.52, 0.2, 1.85, -210, 20, -50],
      [0.23, -0.25, 0.24, 1.65, -75, 0, -95],
      [0.44, 0.25, 0.37, 1.05, 0, 0, -100],
      [0.69, 0.12, 0.3, 1, 0, 0, -90],
      [0.9, 0.05, 0.16, 2.9, 0, 0, -10],
      [1, 0.05, 0.16, 2.9, 0, 0, -10],
    ],
    m,
  );
  // NODE / DEVICE / PROPERTY depth levels, not a generic dependency network.
  for (let node = 0; node < 5; node++) {
    const nx = (node - 2) * 180,
      t = at(close, node * 0.065, 0.55);
    for (let device = 0; device < 3; device++) {
      const dy = (device - 1) * 120,
        activeBranch = node === 2 && device === 1;
      const turn = activeBranch ? 0 : (t * Math.PI) / 2;
      for (let prop = 0; prop < 5; prop++) {
        const active = activeBranch && prop === 2,
          x = nx + (prop - 2) * 27 * (1 - t * 0.7);
        const yy = dy + (active ? 0 : Math.sin(turn) * 35),
          z = -180 + prop * 27 - (active ? 0 : t * 190);
        const visible = active ? 1 : 1 - t * 0.96;
        const h = active ? 90 : 52;
        if (active) {
          const az = mix(-100, 0, approach);
          for (const side of [-1, 1]) {
            const xx = side * mix(12, 90, approach);
            block(g, [xx, 0, az], [8, 94, 12], C.coral, 1, side * 0.3);
            g.line(
              [
                [xx, 0, az],
                [xx + side * 24, 0, az],
              ],
              C.coral,
              1.5,
              approach,
            );
          }
        } else block(g, [x, yy, z], [17, h, 4], C.cobalt, visible, turn);
      }
      g.line(
        [
          [nx - 56, dy, -200],
          [nx + 56, dy, -200],
          [nx + 56, dy, -80],
        ],
        C.cyan,
        0.7,
        (1 - t) * 0.45,
      );
    }
  }
  g.draw();
  if (q > 0.79) {
    note(
      d,
      W,
      H,
      "ExHeating / EH35Fault",
      ["EnableShow", "Popup", "Number"][sel],
      "left",
      approach,
    );
    d.alpha(approach, () =>
      d.text(
        ["1 → 0", "removed", "added −1"][sel],
        W * 0.5,
        H * 0.59,
        48,
        d.ink,
        "center",
      ),
    );
  }
  return (
    "ExHeating / EH35Fault / " +
    ["EnableShow", "Popup", "Number"][sel] +
    " · " +
    ["1 → 0", "removed", "added −1"][sel] +
    ". Equivalent boolean values remain equal."
  );
}

const worldPositions = [
  [-360, -130, -35],
  [230, -160, -80],
  [-290, 170, -110],
  [330, 160, -60],
];
const sourceColors = [C.violet, C.cyan, C.coral, C.amber];
const distributions = [
  (u, v) => Math.exp(-(((u - 0.48) * 7) ** 2)) * (0.7 + 0.2 * Math.sin(v * 6)),
  (u, v) => 0.3 + 0.13 * Math.sin(u * 12 + v * 3) + 0.06 * Math.sin(u * 30),
  (u, v) => Math.cos(u * 44) * (1 - u) * 0.36 + 0.22,
  (u, v) =>
    Math.exp(-(((u - 0.54) * 20) ** 2)) * 1.3 +
    Math.exp(-(((u - 0.3) * 17) ** 2)) * 0.3,
];
export function compile(d, q, f, W, H, m, hit) {
  const sel = index(f, 4),
    gather = at(q, 0.59, 0.23),
    names = ["PL / Plato", "LayTec", "XRR", "XRD"];
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.35, 0.82, 2.2, -360, -140, 20],
      [0.16, 0.16, 0.6, 1.6, 150, -145, -30],
      [0.3, -0.25, 0.62, 1.5, -260, 135, -40],
      [0.45, 0.22, 0.72, 1.5, 295, 110, -50],
      [0.59, 0.12, 0.55, 0.82, 0, 0, -70],
      [0.88, -0.1, 0.4, 1.05, 0, 0, 0],
      [1, -0.1, 0.4, 1.05, 0, 0, 0],
    ],
    m,
  );
  for (let i = 0; i < 4; i++) {
    const [x, y, z] = worldPositions[i],
      color = sourceColors[i],
      alpha = 1 - gather * 0.94;
    if (i === 0)
      landscape(g, distributions[0], {
        x,
        y,
        z,
        w: 300,
        h: 170,
        height: 95,
        nx: 34,
        ny: 14,
        color,
        alpha,
      });
    if (i === 1)
      for (let k = 0; k < 5; k++) {
        const path = points(70, (u) => [
          x + (u - 0.5) * 320,
          y + (k - 2) * 22,
          z + distributions[1](u, k * 0.15) * 90,
        ]);
        g.line(path, color, k === 2 ? 2.4 : 0.8, alpha * (k === 2 ? 1 : 0.38));
      }
    if (i === 2)
      for (let k = 0; k < 100; k++) {
        const u = (k % 20) / 19,
          v = Math.floor(k / 20) / 4;
        g.dot(
          [
            x + (u - 0.5) * 300,
            y + (v - 0.5) * 155,
            z + distributions[2](u, v) * 70,
          ],
          k % 4 === 0 ? 3 : 1.6,
          color,
          false,
          alpha * 0.8,
        );
      }
    if (i === 3)
      for (let k = 0; k < 5; k++) {
        const path = points(90, (u) => [
          x + (u - 0.5) * 285,
          y + (k - 2) * 24,
          z + distributions[3](u, 0.5) * 100,
        ]);
        curtain(g, path, z, color, alpha * (k === 2 ? 1 : 0.42));
      }
    // Only a measured subset travels; the broader source population stays behind.
    const t = at(q, 0.56 + i * 0.046, 0.19),
      ty = (i - 1.5) * 64;
    const path = points(50, (u) => [
      mix(x + (u - 0.5) * 150, (u - 0.5) * 360, t),
      mix(y, ty, t),
      mix(
        z + distributions[i](u, 0.5) * 60,
        20 + distributions[i](u, 0.5) * 18,
        t,
      ) +
        Math.sin(t * Math.PI) * 130,
    ]);
    g.line(path, color, 2, at(q, 0.08 + i * 0.08, 0.1));
    if (t > 0.4) curtain(g, path, 12, color, t * 0.38);
    g.target(
      hit,
      (i + 0.5) / 4,
      [mix(x, 0, t), mix(y, ty, t), 20],
      45,
      names[i],
    );
  }
  // One report gains its four provenances progressively; no four-card storyboard.
  const page = at(q, 0.71, 0.12);
  block(
    g,
    [0, 0, -15],
    [460, 340, 3],
    d.paper ? [197, 209, 217] : [36, 48, 65],
    page,
  );
  g.draw();
  if (q < 0.57)
    note(
      d,
      W,
      H,
      names[Math.min(3, Math.floor(q / 0.145))],
      "",
      "left",
      at(q, 0.02, 0.06),
    );
  else if (q > 0.83)
    note(
      d,
      W,
      H,
      "One record. Four sources.",
      names[sel] + " remains traceable.",
      "left",
      at(q, 0.83, 0.04),
    );
  return (
    names[sel] +
    " → shared engineering record. Four distinct measurement sources; all displayed fields are illustrative."
  );
}

export function report(d, q, f, W, H, m, hit, alternate = 0) {
  const sel = index(f, 4),
    form = at(q, 0.11, 0.3),
    change = at(q, 0.48, 0.29) * (1 - alternate),
    settle = at(q, 0.79, 0.1);
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, 0, 0.05, 1.8, 0, 0, 0],
      [0.28, -0.18, 0.22, 1.35, 0, 0, 0],
      [0.5, 0.33, 0.48, 1.2, 0, 0, 0],
      [0.77, -0.15, 0.36, 1.1, 0, 0, 0],
      [1, -0.1, 0.2, 1.05, 0, 0, 0],
    ],
    m,
  );
  const value = [mix(0, 8, change), mix(0, 128, change), mix(50, 10, change)];
  // Context orbits the value's own coordinate system, then flattens into a record.
  for (let i = 0; i < 4; i++) {
    const a = -Math.PI / 2 + (i * TAU) / 4;
    const x = mix(Math.cos(a) * 125, (i - 1.5) * 83, change),
      y = mix(Math.sin(a) * 94, 128, change);
    const z = mix(35 + i * 15, 10, change);
    g.line(
      points(34, (t) => [
        mix(value[0], x, t),
        mix(value[1], y, t),
        mix(value[2], z, t) + Math.sin(t * Math.PI) * 30 * (1 - change),
      ]),
      C.cyan,
      0.9,
      form * (1 - change),
    );
    g.dot([x, y, z], 3, C.cyan, false, form);
  }
  // Existing rows are fixed from their first appearance through the append.
  const sheet = at(q, 0.43, 0.16);
  block(
    g,
    [0, -2, -13],
    [445, 339, 3],
    d.paper ? [196, 208, 218] : [30, 44, 62],
    sheet,
  );
  for (let i = 0; i < 3; i++) {
    for (let col = 0; col < 4; col++) {
      const x = (col - 1.5) * 83,
        y = -100 + i * 61;
      g.line(
        [
          [x - 23, y, 0],
          [x + 23, y, 0],
        ],
        C.dim,
        3,
        sheet,
      );
    }
  }
  g.line(
    [
      [-178, 128, 10],
      [178, 128, 10],
    ],
    C.cyan,
    2,
    change,
  );
  g.draw();
  if (q < 0.47 || alternate > 0.5) {
    d.text("101.4", W * 0.5, H * 0.51, 72, d.ink, "center");
    const texts = ["Step 12", "Zone S2", "λ 950", "Mean"],
      loc = m
        ? [
            [0.5, 0.28],
            [0.77, 0.51],
            [0.5, 0.73],
            [0.23, 0.51],
          ]
        : [
            [0.5, 0.24],
            [0.76, 0.5],
            [0.5, 0.78],
            [0.24, 0.5],
          ];
    texts.forEach((s, i) =>
      d.alpha(at(q, 0.11 + i * 0.055, 0.1), () =>
        d.text(s, W * loc[i][0], H * loc[i][1], 23, d.muted, "center"),
      ),
    );
  } else if (q > 0.8) {
    note(d, W, H, "Step 12 · Zone S2 · λ 950 · Mean", "", "left", settle);
    d.alpha(settle, () =>
      d.text("101.4", W * 0.5, H * 0.72, 32, d.ink, "center"),
    );
  }
  return (
    ["Step 12", "Zone S2", "Wavelength 950 nm", "Mean 101.4"][sel] +
    ". Context stays attached through conversion; existing workbook rows stay fixed."
  );
}
