import { space } from "../space.js";
import { lens, at, mix, palette as P, waveform } from "./cinema.js";
const sources = ["PL / Plato", "LayTec", "XRR", "XRD"];
const readings = [
  [98, 100, 102],
  [49, 50, 51],
  [24, 25, 26],
  [39, 40, 41],
];
export function compile(d, q, f, W, H, m, hit) {
  const s = lens(d, W, H, m, P.blue),
    combine = at(q, 0.24, 0.35),
    format = at(q, 0.65, 0.18),
    active = Math.min(3, Math.floor(f * 4));
  const sw = W * (m ? 0.37 : 0.36),
    sh = H * 0.23;
  // Four source domains have equal optical weight around the shared record.
  for (let i = 0; i < 4; i++) {
    const x = W * (i % 2 ? 0.55 : 0.08),
      y = H * (i < 2 ? 0.12 : 0.59),
      targetY = H * (0.24 + i * 0.155);
    s.alpha(1 - combine, () => {
      const amount = at(q, i * 0.03, 0.18),
        points = [];
      // Distinct source measurements, not four copies of one chart. Values remain illustrative.
      for (let k = 0; k <= 100; k++) {
        const u = k / 100;
        let v;
        if (i === 0) v = 0.24 + 0.64 * Math.exp(-(((u - 0.47) * 5) ** 2));
        if (i === 1)
          v =
            0.22 +
            0.46 * (u > 0.18 && u < 0.81 ? 1 : 0) +
            Math.sin(u * 70) * 0.024;
        if (i === 2)
          v = 0.12 + 0.75 * Math.exp(-u * 2.7) * (0.7 + Math.cos(u * 66) * 0.3);
        if (i === 3)
          v =
            0.13 +
            0.8 * Math.exp(-(((u - 0.59) * 17) ** 2)) +
            0.11 * Math.exp(-(((u - 0.28) * 10) ** 2));
        points.push([x + u * sw, y + sh * (1 - v)]);
      }
      const visible = points.slice(
          0,
          Math.max(2, Math.round(points.length * amount)),
        ),
        c = s.c;
      const gradient = c.createLinearGradient(x, y, x, y + sh);
      gradient.addColorStop(0, "#749adb5c");
      gradient.addColorStop(1, "#43619300");
      c.beginPath();
      c.moveTo(visible[0][0], y + sh);
      for (const pt of visible) c.lineTo(...pt);
      c.lineTo(visible.at(-1)[0], y + sh);
      c.closePath();
      c.fillStyle = gradient;
      c.fill();
      s.line(visible, P.blue, 1.5);
    });
    s.alpha(1 - at(combine, 0, 0.12), () =>
      s.label(sources[i], x, y - 15, m ? 20 : 23, s.ink),
    );
    s.alpha(at(combine, 0.92, 0.08), () =>
      s.label(sources[i], W * 0.08, targetY, m ? 20 : 23, s.ink),
    );
    for (let j = 0; j < 3; j++) {
      const X = mix(x + (j * sw) / 3, W * (0.43 + j * 0.18), combine),
        Y = mix(y + sh + 18, targetY, combine);
      s.alpha(at(q, 0.08 + i * 0.025, 0.13), () =>
        s.label(
          String(readings[i][j]),
          X,
          Y,
          m ? 24 : 29,
          combine > 0.8 ? s.ink : P.blue,
          "center",
        ),
      );
    }
    s.alpha(combine, () => {
      s.line(
        [
          [W * 0.08, targetY + 22],
          [W * 0.94, targetY + 22],
        ],
        P.muted,
        0.7,
        0.6,
      );
    });
    hit((i + 0.5) / 4, W * 0.05, targetY - 40, W * 0.9, 80, sources[i]);
  }
  s.alpha(format, () => {
    s.label("STANDARDIZED RECORD", W * 0.08, H * 0.09, 18, s.muted);
    s.rect(W * 0.38, H * 0.87, W * 0.56, 3, P.blue);
    s.label(
      "Mean " + readings[active].reduce((a, b) => a + b) / 3,
      W * 0.92,
      H * 0.96,
      24,
      P.blue,
      "right",
    );
    s.label("Illustrative values", W * 0.08, H * 0.96, 18, s.muted);
  });
  return (
    sources[active] +
    " · source readings preserved · mean and conditional formatting applied"
  );
}
export function report(d, q, f, W, H, m, hit, alternate = 0) {
  const s = lens(d, W, H, m, P.amber),
    context = at(q, 0.12, 0.28),
    cross = at(q, 0.46, 0.3) * (1 - alternate),
    settle = at(q, 0.77, 0.1);
  const x = W * 0.5,
    y = mix(H * 0.41, H * 0.71, cross),
    numberSize = mix(m ? 92 : 128, m ? 32 : 40, context);
  s.label(
    "12.4",
    mix(x, W * 0.855, cross),
    mix(y, H * 0.78, cross) + Math.sin(Math.PI * cross) * H * 0.18,
    numberSize,
    s.ink,
    "center",
  );
  const names = ["Step 03", "Outer zone", "λ 950 nm", "Analysis value"];
  names.forEach((name, i) => {
    const sx = W * (0.15 + i * 0.235),
      sy = i % 2 ? H * 0.69 : H * 0.18,
      tx = W * (0.12 + i * 0.245),
      ty = H * 0.7;
    s.alpha(context, () => {
      const xx = mix(sx, tx, cross),
        yy = mix(sy, ty, cross);
      s.label(name, xx, yy, m ? 19 : 22, i === 3 ? P.amber : s.muted, "center");
      if (cross < 0.97)
        s.line(
          [
            [xx, yy + 12],
            [mix(xx, x, 0.6), mix(yy + 12, y + 12, 0.6)],
          ],
          P.muted,
          0.7,
          (1 - cross) * 0.5,
        );
    });
  });
  s.alpha(at(cross, 0.96, 0.04), () => {
    s.label("BASE WORKBOOK", W * 0.08, H * 0.08, 20, s.muted);
    for (let row = 0; row < 3; row++) {
      const yy = H * (0.2 + row * 0.14);
      s.label("Existing record 0" + (row + 1), W * 0.08, yy, 20, s.muted);
      s.line(
        [
          [W * 0.08, yy + 20],
          [W * 0.92, yy + 20],
        ],
        P.muted,
        0.8,
        0.3,
      );
    }
    s.line(
      [
        [W * 0.06, H * 0.58],
        [W * 0.94, H * 0.58],
      ],
      P.amber,
      1.3,
    );
    s.line(
      [
        [W * 0.06, H * 0.83],
        [W * 0.94, H * 0.83],
      ],
      P.amber,
      1.3,
    );
  });
  s.alpha(settle, () =>
    s.label(
      "Appended with context intact",
      W * 0.5,
      H * 0.95,
      23,
      s.ink,
      "center",
    ),
  );
  return alternate > 0.5
    ? "Source context retained"
    : "Step · zone · wavelength · value · appended beneath existing records";
}
function monitor(d, q, f, W, H, m, hit, legacy = false) {
  const s = lens(d, W, H, m, legacy ? P.violet : P.cyan),
    travel = at(q, 0.25, 0.29),
    overview = at(q, 0.62, 0.22),
    count = 18,
    active = Math.min(count - 1, Math.floor(f * count));
  const tint = legacy ? [160, 125, 195] : [71, 151, 175],
    failColor = [204, 112, 103];
  const scale = mix(legacy ? 1.65 : 2.05, m ? 1.25 : 1.04, overview);
  const g = space(d.c, {
    w: W,
    h: H,
    scale,
    cy: mix(0.7, 0.48, overview),
    yaw: legacy ? mix(0.35, -0.13, overview) : mix(-0.24, 0.08, overview),
    tilt: mix(1.09, m ? 0.22 : 0.6, overview),
  });
  // One continuous analytical plane; history direction differs for the non-GaN sibling.
  const width = m ? 460 : legacy ? 620 : 560,
    height = m ? 580 : legacy ? 340 : 390;
  g.box(0, 0, -13, width + 26, height + 22, 8, [30, 42, 53]);
  const cols = legacy ? 1 : m ? 2 : 3,
    rows = count / cols,
    cw = width / cols,
    rh = height / rows;
  for (let i = 0; i < count; i++) {
    const col = i % cols,
      row = Math.floor(i / cols),
      x = -width / 2 + col * cw + 8,
      y = -height / 2 + row * rh + rh * 0.7;
    const scroll = (1 - overview) * travel * (legacy ? 1 : -1) * 145,
      yy = y + scroll,
      fail = i === 4 || i === 13;
    if (yy < -height / 2 || yy > height / 2) continue;
    const pts = [];
    for (let j = 0; j <= 64; j++) {
      const u = j / 64;
      pts.push([
        x + u * (cw - 18),
        yy,
        3 + waveform(i, u, fail) * (legacy ? 16 : 36),
      ]);
    }
    const opacity = at(q, i * 0.009, 0.16);
    g.line(pts, fail ? failColor : tint, 1.35, opacity);
    g.line(
      [
        [x, yy, 0],
        [x + cw - 18, yy, 0],
      ],
      [103, 126, 146],
      0.6,
      0.28,
    );
    g.dot([x + cw - 10, yy - 4, 6], 2.5, fail ? failColor : tint);
    const point = g.project([x, yy, 0]);
    hit(
      (i + 0.5) / count,
      point[0],
      point[1] - 16,
      cw * g.unit,
      rh * g.unit,
      "Parameter " + (i + 1),
    );
  }
  g.draw();
  s.alpha(overview, () => {
    s.label(
      (legacy ? "Non-GaN / " : "GaN / ") + "continuous review",
      W * 0.045,
      H * 0.07,
      23,
      s.ink,
    );
    s.label(
      "Parameter " +
        (active + 1) +
        " · " +
        ([4, 13].includes(active) ? "FAIL" : "PASS"),
      W * 0.045,
      H * 0.94,
      m ? 23 : 26,
      [4, 13].includes(active) ? P.coral : s.ink,
    );
    for (let i = 0; i < count; i++) {
      const x = W * (0.045 + i * 0.051);
      s.rect(
        x,
        H * 0.985,
        W * 0.034,
        3,
        [4, 13].includes(i) ? P.coral : legacy ? P.violet : P.cyan,
      );
    }
  });
  return (
    (legacy ? "Non-GaN" : "GaN") +
    " · all 18 illustrative signals retain a pass/fail status · choose a parameter"
  );
}
export function spc(d, q, f, W, H, m, hit) {
  return monitor(d, q, f, W, H, m, hit, false);
}
export function legacy(d, q, f, W, H, m, hit) {
  return monitor(d, q, f, W, H, m, hit, true);
}
