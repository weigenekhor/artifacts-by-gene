import { space, mix, ease } from "./space.js";
const at = (p, s, l) => ease((p - s) / l),
  blue = [55, 156, 187],
  silver = [155, 188, 203],
  amber = [212, 164, 96],
  ink = [25, 43, 55];
// An inhabited measurement volume. Three retained operations share one camera and material field.
export function drawOrigin(ctx, { width: w, height: h, p, px = 0, py = 0 }) {
  const mobile = w < 700,
    enter = at(p, 0.84, 0.7),
    fault = at(p, 1.42, 0.4),
    repair = at(p, 2.02, 0.46),
    map = at(p, 2.82, 0.54),
    compare = at(p, 3.5, 0.53),
    back = at(p, 4.15, 0.6),
    approach = at(p, 5.1, 0.52),
    home = at(p, 5.68, 0.37);
  const light = enter * (1 - at(p, 4.65, 0.92));
  const bg = ctx.createRadialGradient(
    w * 0.68,
    h * 0.28,
    0,
    w * 0.5,
    h * 0.5,
    w * 0.85,
  );
  bg.addColorStop(
    0,
    `rgb(${mix(18, 35, light)},${mix(30, 62, light)},${mix(39, 79, light)})`,
  );
  bg.addColorStop(
    1,
    `rgb(${mix(5, 9, light)},${mix(10, 19, light)},${mix(15, 29, light)})`,
  );
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  if (p > 6.08) return;
  // The camera visits each operation; the solved structures remain behind it.
  const visit = map * (1 - compare),
    other = compare * (1 - back);
  const scale =
    mix(mobile ? 1.45 : 1.75, mobile ? 0.44 : 0.59, back) *
    (1 - 0.06 * approach);
  const g = space(ctx, {
    w,
    h,
    scale,
    cull: true,
    cx: 0.5,
    cy: mix(0.5, 0.5, approach),
    target: [visit * 500 - other * 530, 0, visit * 40],
    yaw: mix(-0.34, 0.07, back) + px * 0.012,
    tilt: mix(mix(0.95, 0.57, map), 0.28, back) + py * 0.008,
  });
  const opacity = 1 - home;
  // The software substrate exists underneath the working structures before the camera finds it.
  const substrate = [
    [-150, -100, -52],
    [150, -100, -52],
    [150, 100, -52],
    [-150, 100, -52],
  ];
  if (p < 5.3) g.box(0, 0, -58, 300, 200, 6, [31, 48, 58]);
  // A discontinuity appears inside a once continuous bank of measurement profiles.
  for (let j = 0; j < 17; j++) {
    const y = -168 + j * 21,
      points = [];
    for (let i = 0; i <= 48; i++) {
      const u = i / 48,
        x = -300 + u * 600,
        shift = u > 0.5 ? fault * (1 - repair) * 55 : 0;
      const z =
        30 +
        58 * Math.exp(-(((u - 0.36) * 4) ** 2)) +
        Math.sin(u * 10 + j * 0.06) * 16;
      points.push([x, y + shift, z]);
    }
    for (let i = 0; i < 48; i++)
      g.poly(
        [
          [points[i][0], points[i][1], -16],
          [points[i + 1][0], points[i + 1][1], -16],
          points[i + 1],
          points[i],
        ],
        j % 4 === 0 ? blue : ink,
        0.82 * opacity,
      );
    g.line(
      points,
      j === 8 && fault > repair ? amber : silver,
      j === 8 ? 2 : 1,
      opacity * 0.7,
    );
  }
  // A physical datum is brought into registration; leave an actual still interval after repair.
  g.line(
    [
      [-316, mix(75, 0, repair), 108],
      [316, mix(75, 0, repair), 108],
    ],
    repair > 0.98 ? blue : amber,
    2.1,
    at(p, 1.85, 0.25) * opacity,
  );
  // The second visit resolves isolated positions into a curved measured field.
  for (let row = 0; row < 20; row++)
    for (let col = 0; col < 26; col++) {
      const X = 350 + col * 12,
        Y = -172 + row * 18;
      const height = (x, y) =>
        50 + Math.sin(x * 0.12) * Math.cos(y * 0.16) * 52;
      const z = height(col, row),
        jitter = (1 - map) * Math.sin(col * 5 + row * 7) * 39;
      if (opacity > 0.01) g.dot([X + jitter, Y, z], 1.5, blue, opacity);
      if (col < 25 && row < 19)
        g.poly(
          [
            [X, Y, z],
            [X + 12, Y, height(col + 1, row)],
            [X + 12, Y + 18, height(col + 1, row + 1)],
            [X, Y + 18, height(col, row + 1)],
          ],
          blue,
          0.83 * map * opacity,
        );
    }
  // The third visit aligns related structures. Only the changed member keeps its warm material.
  for (let i = 0; i < 24; i++) {
    const x = -650 + (i % 8) * 37,
      y = -160 + Math.floor(i / 8) * 130,
      height = 45 + (i % 5) * 12,
      change = i === 12;
    g.poly(
      [
        [x, y, -14],
        [x + 8, y, -14],
        [x + 8, y + 80, height],
        [x, y + 80, height],
      ],
      silver,
      0.65 * opacity,
    );
    const shift = (1 - compare) * (i % 3) * 25 + (change ? 24 : 0);
    g.poly(
      [
        [x + 14, y + shift, -14],
        [x + 18, y + shift, -14],
        [x + 18, y + 80 + shift, height],
        [x + 14, y + 80 + shift, height],
      ],
      change ? amber : blue,
      0.8 * opacity,
    );
  }
  // Shared reference edges establish a whole without surrounding it in a decorative box.
  for (const y of [-205, 205])
    g.line(
      [
        [-680, y, -18],
        [680, y, -18],
      ],
      silver,
      1,
      back * 0.42 * opacity,
    );
  // Retain that surface as the camera arrives; its projected corners settle into the real UI plane.
  const central = at(p, 4.75, 0.55),
    ww = Math.min(w * (mobile ? 0.8 : 0.38), 640),
    hh = ww / 1.5;
  g.draw();
  const base = [mix(5, 9, light), mix(10, 19, light), mix(15, 29, light)]
    .map(Math.round)
    .join(",");
  const lower = ctx.createLinearGradient(0, h * 0.7, 0, h * 0.92);
  lower.addColorStop(0, "rgba(" + base + ",0)");
  lower.addColorStop(1, "rgb(" + base + ")");
  ctx.fillStyle = lower;
  ctx.fillRect(0, h * 0.7, w, h * 0.3);
  const upper = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.23);
  upper.addColorStop(0, "rgb(" + base + ")");
  upper.addColorStop(1, "rgba(" + base + ",0)");
  ctx.fillStyle = upper;
  ctx.fillRect(0, h * 0.08, w, h * 0.15);
  if (central > 0) {
    ctx.save();
    const target = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ].map(([x, y]) => [w / 2 + (x * ww) / 2, h / 2 + (y * hh) / 2]);
    const corners = substrate.map((v, i) => {
      const projected = g.project(v);
      return [
        mix(projected[0], target[i][0], approach),
        mix(projected[1], target[i][1], approach),
      ];
    });
    const outline = () => {
      ctx.beginPath();
      corners.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
    };
    ctx.globalAlpha = central * (1 - home);
    ctx.shadowColor = "#000a";
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 22;
    const material = ctx.createLinearGradient(...corners[0], ...corners[2]);
    material.addColorStop(0, "#34454f");
    material.addColorStop(0.5, "#122029");
    material.addColorStop(1, "#071116");
    ctx.fillStyle = material;
    outline();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#8da2ab";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(corners[3][0], corners[3][1] + 4);
    ctx.lineTo(corners[2][0], corners[2][1] + 4);
    ctx.strokeStyle = "#304750";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }
}
