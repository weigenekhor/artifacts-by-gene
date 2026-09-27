import {
  cinema,
  block,
  rail,
  portal,
  landscape,
  note,
  C,
  TAU,
  points,
  at,
  mix,
} from "./set.js";
import { index } from "./studio.js";

export function compare(d, q, selected, W, H, m, data) {
  const failure = at(q, 0.16, 0.12),
    match = at(q, 0.34, 0.27),
    isolate = at(q, 0.66, 0.14),
    row = data.rows[selected];
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.35, 0.13, 1.13, 0, 0],
      [0.24, 0.15, 0.13, 1.32, 0, 10],
      [0.56, -0.13, 0.25, 1.18, 0, 0],
      [0.84, 0.04, 0.04, 1.28, 0, 0],
      [1, 0.04, 0.04, 1.28, 0, 0],
    ],
    m,
  );
  const left = -230,
    right = 230;
  for (let side = 0; side < 2; side++) {
    const x = side ? right : left,
      z = side ? -90 : 15;
    block(
      g,
      [x, 0, z],
      [270, 395, 6],
      C.graphite,
      1 - isolate * 0.55,
      side ? 0.08 : -0.08,
    );
    for (let i = 0; i < data.rows.length; i++) {
      const r = data.rows[i],
        active = i === selected,
        yy = (r.raw[side] - 3.1) * 48;
      const t = at(match, i * 0.045, 0.75),
        target = (i - 2.5) * 48;
      const y = mix(yy, target, t) * (1 - isolate * (active ? 1 : 0.18)),
        zz = z + (active ? isolate * 105 : -isolate * 85);
      const alpha = active ? 1 : 1 - isolate * 0.72;
      const ends = [
        [x - 105, y, zz],
        [x + 105, y, zz],
      ];
      rail(g, ends, active ? 22 : 7, 2, active ? C.silver : C.dim, alpha);
      if (active && isolate > 0.85)
        g.text(
          side ? r.right : r.left,
          [x, y + 10, zz + 4],
          44,
          d.ink,
          "center",
          isolate,
        );
      else if (q > 0.2 && q < 0.58)
        g.text(
          r.property,
          [x - 103, y - 11, zz + 3],
          16,
          d.muted,
          "left",
          alpha,
        );
      if (!side) {
        const ry =
          mix((r.raw[1] - 3.1) * 48, target, t) *
          (1 - isolate * (active ? 1 : 0.18));
        if (q < 0.33)
          g.line(
            [
              [left + 111, yy, 15],
              [right - 111, yy, -90],
            ],
            failure > 0.4 ? C.copper : C.silver,
            1,
            (1 - failure) * 0.7,
          );
        else
          g.line(
            points(40, (u) => [
              mix(left + 111, right - 111, u),
              mix(y, ry, u),
              mix(zz, -90 + (active ? isolate * 105 : -isolate * 85), u) +
                Math.sin(u * Math.PI) * 80 * (1 - t),
            ]),
            active ? C.copper : C.dim,
            active ? 2 : 0.7,
            t * alpha,
          );
      }
    }
  }
  g.draw();
  if (q < 0.32)
    note(
      d,
      W,
      H,
      "Aligned by position.",
      failure > 0.4 ? "The names disagree." : "",
      "left",
      1 - at(q, 0.27, 0.05),
    );
  else if (q > 0.73) {
    note(d, W, H, row.property, row.node, "left", isolate);
    d.alpha(isolate, () =>
      d.text("XML identity comparison", W - 24, H - 22, 17, d.muted, "right"),
    );
  }
}

export function pathfinder(d, q, f, W, H, m, hit) {
  const sel = index(f, 3),
    filter = at(q, 0.21, 0.3),
    dispatch = at(q, 0.62, 0.18),
    selected = [5 + sel, 17 + sel, 29 + sel];
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, 0.57, 0.1, 1.9, 0, -20],
      [0.22, 0.18, 0.16, 1.65, 20, 0],
      [0.5, -0.32, 0.37, 1.04, 0, 0],
      [0.84, -0.27, 0.24, 1.05, 0, 0],
      [1, -0.2, 0.22, 1.05, 0, 0],
    ],
    m,
  );
  for (let i = 47; i >= 0; i--) {
    const col = i % 8,
      row = Math.floor(i / 8),
      chosen = selected.includes(i),
      n = selected.indexOf(i);
    const t = chosen ? filter : at(q, 0.21 + (row % 3) * 0.025, 0.3);
    const x = mix(
      (col - 3.5) * 101,
      chosen ? (n - 1) * 230 : (col - 3.5) * 150,
      t,
    );
    const y = mix((row - 2.5) * 53, chosen ? 15 : (row - 2.5) * 130, t),
      z = mix(-row * 90, chosen ? 45 : -800, t);
    block(
      g,
      [x, y, z],
      [chosen ? 62 : 38, 145, 22],
      chosen ? C.silver : C.dim,
      chosen ? 1 : 1 - filter * 0.87,
    );
    if (chosen) {
      const track = points(45, (u) => [
        x + Math.sin(u * Math.PI) * n * 24,
        y + u * 210 * dispatch,
        z + u * 340 * dispatch,
      ]);
      rail(g, track, 8, 4, C.copper, dispatch);
      if (dispatch > 0.9) g.dot(track.at(-1), 5, C.pale);
      g.target(
        hit,
        (sel + 0.5) / 3,
        [x, y, z],
        42,
        "Selected chart destination",
      );
    }
  }
  g.draw();
  if (q > 0.74)
    note(
      d,
      W,
      H,
      "Three exact destinations.",
      "Selected links dispatch together.",
      "left",
      dispatch,
    );
  return `Selection ${"ABC"[sel]} · three chart destinations. Pathfinder opens links; it does not compute their charts.`;
}

export function configuration(d, q, f, W, H, m, hit) {
  const sel = index(f, 3),
    fold = at(q, 0.25, 0.43),
    approach = at(q, 0.72, 0.14);
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.58, 0.23, 1.7, -90, 0],
      [0.26, -0.25, 0.31, 1.34, 0, 0],
      [0.62, 0.14, 0.2, 1.03, 0, 0],
      [0.88, 0.08, 0.17, 4.2, 0, 0],
      [1, 0.08, 0.17, 4.2, 0, 0],
    ],
    m,
  );
  const chosen = 13;
  // Branches fold at their own hinges. The surviving leaf keeps its address.
  for (let i = 25; i >= 0; i--) {
    const active = i === chosen,
      t = active ? 0 : at(fold, (i % 7) * 0.053, 0.58),
      x = ((i % 9) - 4) * 77,
      y = (Math.floor(i / 9) - 1) * 123;
    const z = -Math.floor(i / 9) * 90 - t * 130;
    block(
      g,
      [mix(x, 0, approach * (active ? 1 : 0)), y, z],
      [64 * (1 - t * 0.97), 102, 7],
      active ? C.silver : C.dim,
      active ? 1 : 1 - t * 0.9,
      t * Math.PI * 0.5,
    );
    if (!active)
      g.line(
        [
          [x, y, z],
          [x, y - 65, z - 45],
          [0, -230, -290],
        ],
        C.dim,
        0.6,
        (1 - t) * 0.5,
      );
    else portal(g, [x, y, z + 6], 74, 112, 1, C.copper);
  }
  g.draw();
  if (q > 0.72) {
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
        ["1 → 0", "0 → removed", "added → −1"][sel],
        W * 0.5,
        H * 0.57,
        50,
        d.ink,
        "center",
      ),
    );
  }
  return `ExHeating / EH35Fault / ${["EnableShow", "Popup", "Number"][sel]} · ${["1 → 0", "removed", "added −1"][sel]}. Matching branches close; structural context stays attached.`;
}

const worlds = [
  (u, v) => Math.exp(-(((u - 0.48) * 7) ** 2)) * (0.6 + 0.3 * Math.sin(v * 6)),
  (u, v) => 0.28 + 0.12 * Math.sin(u * 12 + v * 3) + 0.13 * Math.sin(u * 30),
  (u, v) => Math.cos(u * 44) * (1 - u) * 0.36 + 0.22,
  (u, v) =>
    Math.exp(-(((u - 0.54) * 20) ** 2)) * 1.3 +
    Math.exp(-(((u - 0.3) * 17) ** 2)) * 0.3,
];
export function compile(d, q, f, W, H, m, hit) {
  const sel = index(f, 4),
    gather = at(q, 0.51, 0.26),
    resolve = at(q, 0.8, 0.12),
    names = ["PL / Plato", "LayTec", "XRR", "XRD"];
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.36, 0.95, 2.5, -240, -95],
      [0.17, -0.12, 0.72, 1.55, -160, -60],
      [0.38, 0.31, 0.65, 1.04, 0, 0],
      [0.66, 0.02, 0.49, 0.98, 0, 0],
      [0.91, -0.15, 0.44, 1.1, 0, 0],
      [1, -0.15, 0.44, 1.1, 0, 0],
    ],
    m,
  );
  for (let i = 0; i < 4; i++) {
    const x = (i % 2 ? 1 : -1) * 237,
      y = (i < 2 ? -1 : 1) * 132,
      z = -60 - i * 12;
    const alpha = 1 - gather * 0.83;
    landscape(g, worlds[i], {
      x,
      y,
      z,
      w: 318,
      h: 142,
      height: i === 3 ? 84 : 66,
      nx: 36,
      ny: 10,
      color: i % 2 ? C.silver : C.blue,
      alpha,
    });
    const t = at(gather, i * 0.09, 0.64),
      tx = mix(x, 0, t),
      ty = mix(y, (i - 1.5) * 78, t),
      tz = mix(z + 30, 50 - i * 10, t) + Math.sin(t * Math.PI) * 128;
    // A measured portion leaves each distinct source and settles into one report.
    const path = points(44, (u) => [
      tx + (u - 0.5) * mix(150, 420, t),
      ty,
      tz + worlds[i](u, 0.5) * mix(60, 15, t),
    ]);
    rail(
      g,
      path,
      mix(11, 35, t),
      3,
      i === sel ? C.copper : C.silver,
      at(q, 0.18 + i * 0.04, 0.12),
    );
    g.target(hit, (i + 0.5) / 4, [x, y, z], 60, names[i]);
  }
  // The report arrives behind its identifiable contributions, as one object.
  block(g, [0, 0, -40], [485, 378, 7], d.paper ? C.pale : C.graphite, gather);
  for (let i = 0; i < 3; i++)
    block(
      g,
      [7 + i * 5, 5 + i * 5, -48 - i * 5],
      [485, 378, 3],
      C.dim,
      gather * 0.6,
    );
  g.draw();
  if (q < 0.44)
    note(
      d,
      W,
      H,
      names[Math.min(3, Math.floor(q / 0.11))],
      "Different measurements. A shared report.",
      "left",
      at(q, 0.02, 0.07),
    );
  else if (q > 0.79)
    note(
      d,
      W,
      H,
      "One report. Four sources.",
      names[sel] + " remains traceable.",
      "left",
      resolve,
    );
  return `${names[sel]} → identifiable report content. PL/Plato, LayTec, XRR and XRD remain distinct source groups. Illustrative fields, not instrument results.`;
}

export function report(d, q, f, W, H, m, hit, alternate = 0) {
  const sel = index(f, 4),
    context = at(q, 0.09, 0.29),
    cross = at(q, 0.48, 0.31) * (1 - alternate),
    settle = at(q, 0.82, 0.1);
  const g = cinema(
    d,
    q,
    W,
    H,
    [
      [0, -0.12, 0.14, 1.45, -115, -20],
      [0.35, -0.16, 0.18, 1.12, 0, 0],
      [0.48, -0.17, 0.3, 1.04, 0, 0],
      [1, -0.17, 0.3, 1.04, 0, 0],
    ],
    m,
  );
  const names = ["Step", "Zone", "Wavelength", "Mean"],
    values = ["12", "S2", "950 nm", "101.4"];
  const origin = [-225, -60, 30],
    dest = [210, 117, 0],
    x = mix(origin[0], dest[0], cross),
    y = mix(origin[1], dest[1], cross),
    z = mix(origin[2], dest[2], cross) + Math.sin(cross * Math.PI) * 90;
  portal(g, [0, 0, 25], 18, 325, context * 0.7, C.silver);
  // Existing workbook rows do not change position during append.
  block(g, [218, 25, -15], [277, 281, 5], C.graphite, context);
  for (let r = 0; r < 3; r++)
    rail(
      g,
      [
        [97, -67 + r * 61, -8],
        [337, -67 + r * 61, -8],
      ],
      26,
      3,
      C.dim,
      context,
    );
  block(
    g,
    [x, y, z],
    [mix(160, 242, cross), mix(138, 38, cross), 7],
    C.silver,
    1,
  );
  for (let i = 0; i < 4; i++) {
    const t = at(context, i * 0.13, 0.55),
      a = (i / 4) * TAU;
    const px = mix(origin[0] + Math.cos(a) * 126, x + (i - 1.5) * 53, t),
      py = mix(origin[1] + Math.sin(a) * 103, y, t);
    block(
      g,
      [px, py, z + 9],
      [mix(12, 38, t), 7, 3],
      i === 3 ? C.copper : C.blue,
      t,
    );
  }
  g.draw();
  const moving = cross > 0.005 && cross < 0.995;
  if (q < 0.18) {
    d.text("101.4", W * 0.32, H * 0.47, 66, d.ink, "center");
  } else if (!moving && q < 0.47) {
    const rows = m
      ? ["Step 12", "Zone S2", "950 nm", "Mean 101.4"]
      : ["Step 12  /  Zone S2", "950 nm  /  Mean 101.4"];
    rows.forEach((s, i) =>
      d.alpha(context, () =>
        d.text(s, W * 0.65, H * 0.38 + i * 35, 22, d.ink, "center"),
      ),
    );
  } else if (q > 0.79)
    note(
      d,
      W,
      H,
      "The format changed.",
      names[sel] + " " + values[sel] + " · context preserved.",
      "left",
      settle,
    );
  return `${names[sel]} / ${values[sel]}. Step, zone, wavelength and analysis travel together into the appended row; existing rows stay fixed.`;
}
