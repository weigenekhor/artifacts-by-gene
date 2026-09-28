import {
  stage,
  C,
  at,
  mix,
  colorMix,
  block,
  beam,
  annulus,
  ribbon,
  wafer,
  chart,
} from "./stage.js";

export function history(d, q, f, W, H, m, hit) {
  const t = q * 5.2,
    candidates = at(t, 0.7, 0.7),
    scan = at(t, 1.5, 1.9),
    result = at(t, 3.5, 0.8);
  const s = stage(d, W, H, {
      scale: mix(1.12, 0.81, at(t, 4.1, 0.5)),
      yaw: mix(-0.32, 0.1, at(t, 0, 4.4)),
      tilt: 0.72,
      cy: 0.48,
      target: [0, 0, 28],
    }),
    g = s.g;
  s.shadow([0, 40, -36], 320, 100, 0.19);
  const scanY = mix(-202, 205, scan);
  // Forty-eight solid strata extend past the framing at the beginning.
  for (let j = 0; j < 48; j++) {
    const y = -280 + j * 11.7,
      depth = 1 - result * 0.35;
    const pts = Array.from({ length: 14 }, (_, i) => [
      -330 + i * 51,
      y,
      18 + 12 * Math.sin(i * 0.62 + j * 0.18) + (i % 4 === 0 ? 18 : 0),
    ]);
    const illuminated =
      t > 1.5 && t < 3.5 ? Math.max(0, 1 - Math.abs(y - scanY) / 22) : 0;
    for (let i = 0; i < 13; i++)
      g.poly(
        [[pts[i][0], y, -24], [pts[i + 1][0], y, -24], pts[i + 1], pts[i]],
        colorMix(j % 5 === 0 ? C.navy : C.graphite, C.ice, illuminated),
        depth * 0.9,
      );
    g.line(pts, C.titanium, 0.7, depth * 0.65);
  }
  const selected = 2;
  for (let route = 0; route < 5; route++) {
    const inspected = at(scan, route * 0.18, 0.14),
      valid = route === selected;
    const collapse = valid ? 0 : inspected * (1 - at(scan, 0.94, 0.06) * 0),
      alpha = candidates * (1 - collapse * 0.93);
    const pts = Array.from({ length: 28 }, (_, i) => {
      const u = i / 27,
        step = Math.floor(u * 7) % 3;
      return [
        -310 + u * 620,
        -150 + route * 72 + Math.sin(u * 8 + route) * 18,
        mix(64 + step * 9, 4, collapse) + result * (valid ? 25 : 0),
      ];
    });
    if (alpha > 0.015)
      ribbon(
        g,
        pts,
        15,
        valid && result > 0.05 ? colorMix(C.ice, C.copper, result) : C.blue,
        alpha,
      );
    if (inspected > 0 && valid)
      for (let i = 3; i < 28; i += 5) {
        const p = pts[i];
        block(g, p[0], p[1], p[2], 18, 22, 5, C.copper, result);
      }
  }
  if (t > 1.4 && t < 3.9) {
    const a = (1 - at(t, 3.5, 0.35)) * 0.25;
    g.poly(
      [
        [-330, scanY, -24],
        [330, scanY, -24],
        [330, scanY, 160],
        [-330, scanY, 160],
      ],
      C.ice,
      a,
    );
    beam(g, [-330, scanY, 160], [330, scanY, 160], 1.5, C.ice, a * 3);
  }
  s.finish();
  return "Five candidate histories evaluated; one consistent interpretation retained.";
}

export function schedule(d, q, f, W, H, m, hit) {
  const t = q * 5.2,
    reveal = at(t, 0.5, 1.4),
    pull = at(t, 1.2, 2.5);
  const s = stage(d, W, H, {
      scale: mix(1.1, 0.91, pull),
      yaw: mix(-0.6, -0.18, pull),
      tilt: mix(0.98, 0.6, pull),
      cy: 0.47,
    }),
    g = s.g;
  s.shadow([0, 0, -35], 245, 75, 0.2);
  g.disc(0, 0, -24, 224, 12, C.graphite);
  annulus(g, 0, 0, -10, 218, 207, 5, C.titanium);
  const now = -0.6,
    ends = [now + 0.22, now + 1.35, now + 0.81, now + 0.39, now + 1.68];
  for (let i = 0; i < 5; i++) {
    const r = 82 + i * 25,
      start = -2.85 + i * 0.055,
      next = ends[i],
      a = at(t, 0.5 + i * 0.14, 1.9);
    annulus(g, 0, 0, -8, r + 8, r - 8, 7, C.navy, -3.03, 2.18);
    annulus(g, 0, 0, 0, r + 5, r - 5, 4, C.titanium, start, now, 0.62);
    annulus(
      g,
      0,
      0,
      5,
      r + 5,
      r - 5,
      6,
      i === 0 || i === 3 ? C.copper : C.teal,
      start,
      mix(start, next, a),
      1,
      44,
    );
    for (const [angle, col, z] of [
      [start, C.silver, 8],
      [mix(start, next, a), i === 0 || i === 3 ? C.copper : C.ice, 15],
    ]) {
      const x = Math.cos(angle) * r,
        y = Math.sin(angle) * r;
      g.disc(x, y, z, 8, 7, col);
    }
  }
  beam(
    g,
    [Math.cos(now) * 66, Math.sin(now) * 66, 24],
    [Math.cos(now) * 213, Math.sin(now) * 213, 24],
    2,
    C.paper,
    reveal,
  );
  for (let k = 0; k < 48; k++) {
    const a = (k / 48) * Math.PI * 2;
    g.line(
      [
        [Math.cos(a) * 209, Math.sin(a) * 209, 8],
        [Math.cos(a) * 216, Math.sin(a) * 216, 8],
      ],
      C.silver,
      0.65,
      0.7,
    );
  }
  s.finish();
  s.label("NOW", 0.81, 0.2, C.ink, 23);
  return "Valid historical checks anchor distinct intervals; warmer markers are closer to due.";
}

export function usage(d, q, f, W, H, m, hit) {
  const t = q * 5.2,
    count = at(t, 2.8, 0.85),
    maintenance = at(t, 3.8, 0.65);
  const s = stage(d, W, H, {
      scale: 0.89,
      yaw: mix(-0.12, 0.09, at(t, 0, 4.5)),
      tilt: mix(0.83, 0.59, at(t, 2.6, 1.8)),
      cy: 0.49,
    }),
    g = s.g;
  const seats = [
      [-204, 72],
      [0, -112],
      [204, 72],
    ],
    totals = [126, 168, 210],
    levels = [0.48, 0.64, 0.9];
  seats.forEach(([x, y], i) => {
    s.shadow([x, y, -38], 127, 44, 0.23);
    g.disc(x, y, -34, 104, 17, C.graphite);
    annulus(g, x, y, -17, 100, 69, 16, C.titanium);
    g.disc(x, y, -18, 67, 4, C.navy);
    annulus(g, x, y, 0, 94, 87, 3, C.graphite);
    const run = at(t, 0.8 + i * 0.1, 1.85),
      events = Math.floor(run * (55 + i * 17));
    for (let k = 0; k < events; k++) {
      const a = (k / (55 + i * 17)) * Math.PI * 2 - Math.PI / 2,
        r = mix(108 + (k % 3) * 5, 90, count),
        z = mix(4 + (k % 4) * 3, 3, count);
      g.line(
        [
          [x + Math.cos(a) * r, y + Math.sin(a) * r, z],
          [x + Math.cos(a) * (r + 4), y + Math.sin(a) * (r + 4), z + 2],
        ],
        i === 2 ? C.copper : C.teal,
        2,
        1 - count * 0.75,
      );
    }
    if (t < 3.15) {
      const phase = (Math.max(0, t - 0.8) * 2.9 + i * 0.28) % 1,
        z = 6 + Math.sin(phase * Math.PI) * 58;
      wafer(g, x, y, z, 64, i === 2 ? C.navy : C.teal);
    } else wafer(g, x, y, 2, 64, C.navy);
    annulus(
      g,
      x,
      y,
      3,
      95,
      90,
      4,
      i === 2 ? C.copper : C.teal,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * levels[i] * maintenance,
    );
  });
  s.finish();
  if (count > 0.01)
    seats.forEach(([x, y], i) => {
      const p = g.project([x, y + 141, -8]);
      d.alpha(count, () =>
        d.text(
          String(totals[i]),
          p[0],
          p[1],
          28,
          i === 2 ? "#996039" : "#244e56",
          "center",
        ),
      );
    });
  return "Processed wafer totals retained per reactor, with illustrative maintenance proximity.";
}

export function pathfinder(d, q, f, W, H, m, hit) {
  const t = q * 5.2,
    search = at(t, 0.6, 1.4),
    direct = at(t, 2.1, 0.65),
    flight = at(t, 2.9, 1.2),
    arrive = at(t, 4.05, 0.5);
  const s = stage(d, W, H, {
      scale: mix(0.91, 1.3, arrive),
      yaw: mix(-0.18, 0, flight),
      tilt: mix(1.08, 1.38, flight),
      target: [0, mix(90, -820, flight), 50],
      cy: 0.59,
    }),
    g = s.g;
  s.shadow([0, -220, -35], 310, 125, 0.13);
  for (let level = 0; level < 7; level++) {
    const y = 80 - level * 142,
      spread = flight * (480 + level * 27),
      width = 184 + level * 3;
    for (const sign of [-1, 1]) {
      block(g, sign * (width + spread), y, 0, 24, 29, 244, C.graphite);
      block(
        g,
        sign * (width * 0.52 + spread),
        y,
        222,
        width + 4,
        29,
        22,
        C.titanium,
      );
      // Side rooms open while conventional traversal advances.
      const open = at(search, level * 0.12, 0.2) * 42;
      block(g, sign * (width + 76 + open + spread), y, 0, 110, 24, 170, C.navy);
    }
  }
  if (direct > 0) beam(g, [0, 90, 8], [0, mix(90, -840, direct), 8], 5, C.blue);
  const point = (u, v, lift = 0) => [
    (u - 0.5) * 344,
    -875 + lift,
    210 - v * 196,
  ];
  g.poly([point(0, 0), point(1, 0), point(1, 1), point(0, 1)], C.navy);
  chart(g, point, {
    color: C.ice,
    seed: 2,
    failure: true,
    progress: at(t, 2, 0.7),
  });
  g.line([point(0, 0, 2), point(1, 0, 2)], C.blue, 4);
  s.finish();
  return "Direct access to the intended external SPC chart, bypassing repeated hierarchy traversal.";
}
