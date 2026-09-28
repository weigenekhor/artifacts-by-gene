import {
  stage,
  C,
  at,
  mix,
  colorMix,
  block,
  beam,
  sheet,
  chart,
  waveform,
  ribbon,
} from "./stage.js";

export function compile(d, q, f, W, H, m, hit) {
  const t = q * 5.2,
    detach = at(t, 1.2, 1.4),
    converge = at(t, 2.6, 1.25),
    front = at(t, 3.9, 0.65);
  const s = stage(d, W, H, {
      scale: 0.84,
      yaw: mix(-0.18, 0.03, front),
      tilt: mix(0.77, 0.36, front),
      cy: 0.46,
    }),
    g = s.g;
  s.shadow([0, 0, -44], 340, 112, 0.16);
  const origins = [
      [-225, -150],
      [225, -150],
      [-225, 150],
      [225, 150],
    ],
    colors = [C.blue, C.teal, C.violet, C.copper],
    names = ["PL / Plato", "LayTec", "XRR", "XRD"];
  const shapes = [
    (u, v) =>
      Math.exp(-(((u - 0.5) * 4) ** 2)) *
      Math.exp(-(((v - 0.5) * 2) ** 2)) *
      61,
    (u, v) =>
      (u > 0.22 && u < 0.77 ? 49 : 12) +
      Math.sin(u * 35) * 3 +
      Math.sin(v * 4) * 4,
    (u, v) => 12 + Math.exp(-u * 2.9) * (1 + Math.cos(u * 46 + v)) * 29,
    (u, v) =>
      Math.exp(-(((u - 0.54) * 19) ** 2)) *
      Math.exp(-(((v - 0.5) * 6) ** 2)) *
      91,
  ];
  origins.forEach(([x, y], i) => {
    block(g, x, y, -27, 186, 121, 12, C.graphite);
    const point = (u, v) => [
      x + (u - 0.5) * 176,
      y + (v - 0.5) * 110,
      -12 + shapes[i](u, v),
    ];
    for (let row = 0; row < 8; row++)
      for (let col = 0; col < 20; col++)
        g.poly(
          [
            point(col / 20, row / 8),
            point((col + 1) / 20, row / 8),
            point((col + 1) / 20, (row + 1) / 8),
            point(col / 20, (row + 1) / 8),
          ],
          colors[i],
        );
    const move = at(t, 1.35 + i * 0.17, 2),
      targetY = -95 + i * 57,
      travel = at(move, 0.28, 0.65);
    const pts = Array.from({ length: 25 }, (_, j) => {
      const u = j / 24,
        original = point(u, 0.5);
      return [
        mix(original[0], (u - 0.5) * 218, travel),
        mix(original[1], targetY, travel),
        mix(original[2] + Math.sin(move * Math.PI) * 85, 104, travel),
      ];
    });
    if (detach > 0.01)
      ribbon(g, pts, 9, colors[i], detach * (1 - front * 0.35));
  });
  if (converge > 0.01) {
    const p = sheet(g, {
      x: 0,
      y: 0,
      z: 90,
      w: 300 * converge,
      h: 278,
      roll: (1 - front) * 17,
      col: [217, 224, 228],
      alpha: converge,
    });
    for (let row = 0; row < 5; row++)
      g.line(
        [p(0.07, 0.12 + row * 0.18, 2), p(0.93, 0.12 + row * 0.18, 2)],
        C.titanium,
        1.1,
        front,
      );
    for (let col = 1; col < 4; col++)
      g.line(
        [p(col / 4, 0.08, 2), p(col / 4, 0.91, 2)],
        C.titanium,
        0.7,
        front,
      );
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 4; col++)
        block(
          g,
          -101 + col * 67,
          -78 + row * 50,
          94,
          42,
          9,
          3,
          row === 2 && col === 3 ? C.copper : C.navy,
          front,
        );
  }
  s.finish();
  d.alpha(1 - front, () => {
    s.label(names[0], 0.23, 0.07, C.ink, 23);
    s.label(names[1], 0.77, 0.07, C.ink, 23);
    s.label(names[2], 0.23, 0.965, C.ink, 23);
    s.label(names[3], 0.77, 0.965, C.ink, 23);
  });
  return "PL/Plato, LayTec, XRR and XRD evidence converge into one standardized workbook with conditional emphasis.";
}

export function spc(d, q, f, W, H, m, hit) {
  const t = q * 5.2,
    travel = at(t, 0.8, 2.2),
    overview = at(t, 3, 1),
    status = at(t, 4, 0.5);
  const s = stage(d, W, H, {
      scale: mix(mix(4.8, 2.65, at(t, 0.6, 1.3)), 0.57, overview),
      target: [
        mix(-405 + travel * 710, 0, overview),
        mix(-105, 0, at(t, 0.6, 1.4)),
        38,
      ],
      yaw: mix(0.23, -0.09, overview),
      tilt: mix(0.86, 0.46, overview),
      cy: 0.52,
    }),
    g = s.g;
  s.shadow([0, 0, -65], 570, 135, 0.18);
  const p = (u, v, l = 0) => [
    (u - 0.5) * 1080,
    (v - 0.5) * 340,
    30 + Math.cos((u - 0.5) * 2.8) * 55 + l,
  ];
  for (let col = 0; col < 48; col++) {
    g.poly(
      [
        p(col / 48, 0),
        p((col + 1) / 48, 0),
        p((col + 1) / 48, 1),
        p(col / 48, 1),
      ],
      C.navy,
    );
    const a = p(col / 48, 1),
      b = p((col + 1) / 48, 1);
    g.poly(
      [a, b, [b[0], b[1], b[2] - 10], [a[0], a[1], a[2] - 10]],
      C.graphite,
    );
  }
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 8; col++) {
      const idx = row * 8 + col,
        failure = idx === 10 || idx === 21,
        point = (u, v, l = 0) =>
          p((col + 0.04 + u * 0.91) / 8, (row + 0.07 + v * 0.82) / 3, 3 + l);
      chart(g, point, { color: failure ? C.coral : C.ice, seed: idx, failure });
      if (status > 0.01) {
        const a = p((col + 0.48) / 8, (row + 0.03) / 3, 9);
        block(
          g,
          a[0],
          a[1],
          a[2],
          13,
          6,
          3,
          failure ? C.coral : C.emerald,
          status,
        );
      }
    }
  // One continuous substrate, never a succession of detached chart cards.
  const a = p(0, 0, 4),
    b = p(1, 0, 4);
  g.line([a, b], C.silver, 1.1);
  s.finish();
  return "A continuous SPC review surface: many parameters, observations, limits and compact pass/fail states.";
}

export function legacy(d, q, f, W, H, m, hit) {
  const t = q * 5.2,
    advance = at(t, 0.7, 1.65),
    organize = at(t, 2.4, 1.1),
    rise = at(t, 3.5, 0.9);
  const s = stage(d, W, H, {
      scale: mix(1.25, 0.83, rise),
      target: [0, mix(155, -130, advance) * (1 - organize), 0],
      yaw: mix(-0.2, 0.11, rise),
      tilt: mix(1.12, 0.42, rise),
      cy: 0.5,
    }),
    g = s.g;
  s.shadow([0, 0, -45], 335, 135, 0.16);
  for (let family = 0; family < 4; family++) {
    const targetX = (family % 2 ? 1 : -1) * 172,
      targetY = (family < 2 ? -1 : 1) * 130;
    const x = mix((family % 2 ? 1 : -1) * 70, targetX, organize),
      y = mix(210 - family * 180, targetY, organize),
      z = mix(25 + family * 11, 10, rise);
    const p = sheet(g, {
      x,
      y,
      z,
      w: 300,
      h: 218,
      roll: 18 * (1 - rise),
      col: family % 2 ? C.graphite : C.navy,
    });
    for (let row = 0; row < 4; row++) {
      const point = (u, v, l = 0) =>
        p(0.055 + u * 0.89, (row + 0.1 + v * 0.76) / 4, l + 2);
      chart(g, point, {
        color: family === 2 ? C.copper : C.ice,
        seed: family * 4 + row,
        failure: family === 2 && row === 1,
      });
      if (rise > 0) {
        const a = p(0.95, (row + 0.42) / 4, 4);
        block(
          g,
          a[0],
          a[1],
          a[2],
          7,
          12,
          3,
          family === 2 && row === 1 ? C.coral : C.teal,
          rise,
        );
      }
    }
    const a = p(0.04, 0.04, 4),
      b = p(0.4, 0.04, 4);
    beam(g, a, b, 2, family === 2 ? C.copper : C.titanium);
  }
  s.finish();
  return "Multiple non-GaN process groups retained as a deep analytical archive, then organized for shared review.";
}

export function planning(d, q, f, W, H, m, hit) {
  const t = q * 5.2,
    validate = at(t, 0.8, 1.2),
    future = at(t, 2, 1.5),
    pull = at(t, 3.5, 0.9);
  const s = stage(d, W, H, {
      scale: mix(1.28, 0.96, pull),
      yaw: mix(-0.3, -0.05, pull),
      tilt: mix(0.91, 0.49, pull),
      cy: 0.54,
    }),
    g = s.g;
  s.shadow([0, 0, -50], 315, 108, 0.19);
  block(g, 0, 0, -25, 575, 325, 15, C.graphite);
  beam(g, [-270, 0, -7], [270, 0, -7], 4, C.titanium);
  for (let k = 0; k < 18; k++)
    beam(g, [-260 + k * 30, -8, -5], [-260 + k * 30, 8, -5], 0.8, C.silver);
  for (let i = 0; i < 6; i++) {
    const y = (i % 2 ? 1 : -1) * (67 + Math.floor(i / 2) * 38),
      x = -205 + (i % 3) * 37,
      valid = i !== 1 && i !== 4,
      a = at(t, 0.8 + i * 0.15, 0.32),
      dest = 66 + i * 27;
    block(g, x, y, -8, 59, 25, 18, C.navy);
    for (let k = 0; k < 3; k++)
      block(
        g,
        x - 17 + k * 17,
        y,
        11,
        9,
        12,
        5,
        a > 0.9 ? (valid ? C.teal : k === 2 ? C.burgundy : C.teal) : C.titanium,
      );
    const run = valid ? at(t, 2 + i * 0.09, 1.1) : 0,
      end = mix(x, dest, run);
    if (run > 0.005) {
      beam(g, [x, y, 6], [end, y, 6], 4, i < 2 ? C.copper : C.teal);
      block(g, end, y, 7, 20, 31, 12, i < 2 ? C.copper : C.ice);
    }
    if (!valid && a > 0.9) block(g, x + 40, y, -5, 7, 29, 29, C.burgundy);
  }
  s.finish();
  return "The same validity rules across workcenters. Invalid checks stop; only valid histories produce future due positions.";
}

export function signals(d, q, f, W, H, m, hit, alternate = 0) {
  const t = q * 5.3,
    trace = at(t, 0.65, 0.8),
    pull = at(t, 3.2, 0.8),
    lock = at(t, 4, 0.5);
  const s = stage(d, W, H, {
      scale: mix(1.47, 0.87, pull),
      target: [55, 0, mix(105, 5, pull)],
      yaw: mix(-0.2, 0.1, pull),
      tilt: mix(0.68, 1.03, pull),
      cy: 0.53,
    }),
    g = s.g;
  s.shadow([0, 0, -92], 335, 94, 0.18);
  const colors = [
      [66, 134, 225],
      [38, 176, 164],
      [151, 121, 204],
      C.copper,
      C.ice,
    ],
    starts = [0, 1.6, 2.05, 2.5, 2.85],
    xpin = 84,
    levels = [120, 60, 0, -60, -120];
  for (let i = 4; i >= 0; i--) {
    const arrive = i === 0 ? 1 : at(t, starts[i], 0.52);
    if (arrive < 0.005) continue;
    const shift = (1 - arrive) * 250,
      z = levels[i],
      p = sheet(g, {
        x: shift,
        y: 0,
        z,
        w: 565,
        h: 94,
        roll: 0,
        col: C.navy,
        alpha: arrive,
      });
    for (let k = 0; k < 4; k++)
      g.line(
        [p(0.05, 0.15 + k * 0.22, 2), p(0.95, 0.15 + k * 0.22, 2)],
        C.titanium,
        0.6,
        arrive * 0.33,
      );
    const draw = i === 0 ? trace : arrive,
      point = (u) => {
        const near = i === 2 ? 0.025 * (1 - lock * 0.3) : 0,
          peak =
            Math.exp(-(((u - 0.65 - near) * 27) ** 2)) * (i === 0 ? 34 : 20);
        return [-282 + u * 565 + shift, 12 + waveform(u, i) * 56, z + 6 + peak];
      };
    const pts = Array.from(
      { length: Math.max(2, Math.round(60 * draw)) },
      (_, j) => point(j / 59),
    );
    ribbon(g, pts, 5, colors[i], arrive);
    const clue = point(0.65 + (i === 2 ? 0.018 : 0));
    g.disc(
      clue[0],
      clue[1],
      clue[2],
      i === 0 ? 8 : 5,
      i === 0 ? 9 : 3,
      i === 0 ? C.coral : colors[i],
    );
    if (i === 0)
      beam(
        g,
        [xpin, clue[1], -133],
        [xpin, clue[1], 171],
        2.8,
        C.copper,
        at(t, 0.05, 0.5),
      );
    if (i > 0)
      beam(
        g,
        [xpin, clue[1], clue[2]],
        [clue[0], clue[1], clue[2]],
        i === 2 ? 1 : 2,
        colors[i],
        lock * (i === 2 ? 0.38 : 1),
      );
  }
  if (pull > 0.01) {
    const half = alternate ? 91 : 38;
    g.poly(
      [
        [xpin - half, -53, -130],
        [xpin + half, -53, -130],
        [xpin + half, -53, 163],
        [xpin - half, -53, 163],
      ],
      C.ice,
      pull * 0.14,
    );
    g.poly(
      [
        [xpin - half, -53, -130],
        [xpin - half, 53, -130],
        [xpin - half, 53, 163],
        [xpin - half, -53, 163],
      ],
      C.blue,
      pull * 0.07,
    );
  }
  s.finish();
  if (t >= 2.5 && t < 3.35)
    s.label("Throttle Valve angle", 0.5, 0.12, C.ink, 24);
  d.alpha(pull, () => s.label("Shared time window", 0.5, 0.94, C.ink, 23));
  return "The original clue stays pinned as related signals arrive. Exact identity matches are stronger than nearest-time relationships; Throttle Valve angle is included.";
}
