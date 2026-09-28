import { stage, C, at, mix, colorMix, block, beam, sheet } from "./stage.js";

export function recipes(d, q, f, W, H, m, hit) {
  const t = q * 5.2,
    discover = at(t, 0.9, 1.3),
    second = at(t, 2.05, 1.2),
    quiet = at(t, 3.4, 0.9);
  const s = stage(d, W, H, {
      scale: mix(1.1, 0.87, second),
      yaw: mix(-0.35, 0.08, at(t, 0, 4.4)),
      tilt: mix(0.84, 0.37, at(t, 2.8, 1.7)),
      target: [0, 0, 20],
      cy: 0.48,
    }),
    g = s.g;
  for (let doc = 0; doc < 2; doc++) {
    const x = doc ? mix(740, 154, second) : mix(0, -154, second),
      y = doc ? mix(-135, 0, second) : 0,
      z = doc ? 22 : 45;
    s.shadow([x, y, -40], 180, 62, 0.16);
    const p = sheet(g, {
      x,
      y,
      z,
      w: 278,
      h: 340,
      roll: mix(18, 4, quiet),
      col: doc ? [225, 223, 214] : [240, 237, 226],
    });
    // The actual source is recipe text: parameter headings and grouped statements.
    for (let line = 0; line < 30; line++) {
      const v = 0.09 + line * 0.028,
        section = Math.floor(line / 7),
        focus = line === 15;
      const lift = focus
        ? discover * (doc ? 45 : 30)
        : discover * (1 - quiet) * (section % 2 ? 9 : 3);
      const u = 0.075 + (line % 7 === 0 ? 0 : 0.025),
        len = line % 7 === 0 ? 0.46 : 0.64 + Math.sin(line * 1.7) * 0.13;
      const col = focus
        ? doc
          ? C.burgundy
          : C.blue
        : colorMix(C.ink, C.paper, quiet * 0.53);
      if (focus) {
        const a = p(0.07, v - 0.014, lift),
          b = p(0.92, v + 0.036, lift);
        block(
          g,
          (a[0] + b[0]) / 2,
          (a[1] + b[1]) / 2,
          z + lift,
          236,
          22,
          5,
          col,
        );
      } else
        g.line(
          [p(u, v, lift + 2), p(u + len, v, lift + 2)],
          col,
          line % 7 === 0 ? 2.4 : 1.05,
          0.86,
        );
    }
    beam(
      g,
      p(0.075, 0.055, 4),
      p(0.36, 0.055, 4),
      2,
      doc ? C.burgundy : C.blue,
    );
  }
  s.finish();
  d.alpha(quiet, () => {
    s.label("Anneal_Time", 0.5, 0.81, C.ink, 23);
    s.label("00:05:00", 0.3, 0.9, C.blue, 27);
    s.label("00:15:00", 0.7, 0.9, C.burgundy, 27);
  });
  return "Recipe text compared: Anneal_Time changes from 00:05:00 to 00:15:00 in the current capture.";
}

export function configuration(d, q, f, W, H, m, hit) {
  const t = q * 5.2,
    match = at(t, 0.8, 1.4),
    fold = at(t, 2.2, 1),
    report = at(t, 3.45, 0.95);
  const s = stage(d, W, H, {
      scale: mix(0.91, 0.92, fold),
      yaw: mix(-0.28, 0.04, fold),
      tilt: mix(0.79, 0.5, report),
      cy: 0.44,
    }),
    g = s.g;
  s.shadow([0, 60, -45], 290, 110, 0.18);
  const permutation = [4, 0, 5, 2, 1, 3];
  for (let side = 0; side < 2; side++) {
    const base = (side ? 1 : -1) * mix(179, 79, fold),
      z = side ? mix(35, 42, fold) : 16;
    beam(g, [base, -192, z], [base, 110, z], 6, C.graphite);
    block(g, base, -195, z, 48, 36, 13, C.navy);
    for (let branch = 0; branch < 6; branch++) {
      const y = -143 + branch * 47,
        other = mix(
          -143 + permutation[branch] * 47,
          y,
          at(t, 0.8 + branch * 0.07, 0.9),
        ),
        yy = side ? other : y;
      const tip = base + (side ? 1 : -1) * (55 + (branch % 2) * 17),
        changed = branch >= 3;
      const col = changed
        ? [C.copper, C.teal, C.burgundy][branch - 3]
        : colorMix(C.blue, C.titanium, fold);
      beam(g, [base, yy, z], [tip, yy, z + 13], 4, changed ? C.graphite : col);
      for (let leaf = 0; leaf < 3; leaf++) {
        const p = [
            tip + (side ? 1 : -1) * leaf * 16,
            yy + (leaf - 1) * 13,
            z + 20,
          ],
          progress = report * (changed ? 1 : 0);
        const dest = [(branch - 4) * 119, 158, z + 5];
        const final = p.map((v, i) =>
          mix(v, dest[i] + (i === 1 ? leaf * 6 : 0), progress),
        );
        block(g, ...final, 17, 15, 11, col);
      }
      if (match > 0.05 && !changed)
        beam(
          g,
          [-mix(179, 79, fold), y, 19],
          [mix(179, 79, fold), other, 44],
          1.8,
          C.blue,
          match * 0.46,
        );
    }
  }
  if (report > 0.01) {
    block(g, 0, 165, -11, 425, 89, 8, C.paper, report);
    for (let i = 0; i < 3; i++)
      block(
        g,
        (i - 1) * 119,
        163,
        17,
        70,
        29,
        7,
        [C.copper, C.teal, C.burgundy][i],
        report,
      );
  }
  s.finish();
  d.alpha(report, () => {
    s.label("Changed", 0.28, 0.94, C.copper, 23);
    s.label("Added", 0.5, 0.94, C.teal, 23);
    s.label("Removed", 0.72, 0.94, C.burgundy, 23);
  });
  return "Identity-based XML matching retains true changes, additions and removals; no automatic file edits.";
}

export function report(d, q, f, W, H, m, hit) {
  const t = q * 5.2,
    context = at(t, 0.8, 1.2),
    turn = at(t, 2, 0.8),
    book = at(t, 2.8, 0.7),
    land = at(t, 3.5, 0.9);
  const s = stage(d, W, H, {
      scale: mix(1.1, 1.05, book),
      yaw: mix(-0.35, 0.04, at(t, 2, 2.4)),
      tilt: mix(0.74, 0.37, land),
      cy: 0.53,
    }),
    g = s.g;
  s.shadow([0, 0, -42], 280, 100, 0.18);
  const z = mix(75, 7, land),
    y = mix(-20, 116, land),
    spread = mix(1, 0.55, land);
  if (book > 0.01) {
    const p = sheet(g, {
      x: 0,
      y: 5,
      z: -14,
      w: mix(30, 570, book),
      h: 340,
      roll: (1 - book) * 30,
      col: [213, 221, 224],
    });
    for (let row = 0; row < 8; row++) {
      const v = 0.1 + row * 0.105;
      g.line([p(0.06, v, 2), p(0.94, v, 2)], C.titanium, 1, book);
      if (row < 5)
        for (let col = 0; col < 4; col++)
          block(
            g,
            -220 + col * 143,
            -117 + row * 36,
            -9,
            70 - col * 4,
            7,
            2,
            C.navy,
            book * 0.55,
          );
    }
    for (let col = 1; col < 4; col++)
      g.line(
        [p(col / 4, 0.06, 2), p(col / 4, 0.94, 2)],
        C.titanium,
        0.65,
        book,
      );
  }
  // Context remains attached to the same semantic object through the format boundary.
  block(g, 0, y, z, 180 * spread, 68, 10, C.navy, context);
  const positions = [
    [-157, -50],
    [157, -50],
    [-157, 50],
    [157, 50],
  ];
  positions.forEach(([x, dy], i) => {
    const a = at(t, 0.8 + i * 0.19, 0.45),
      xx = x * context * spread,
      yy = y + dy * (1 - land);
    block(
      g,
      xx,
      yy,
      z - 11 - i * 5,
      108 * spread,
      44,
      5,
      i === 2 ? C.copper : C.titanium,
      a,
    );
    if (a > 0.1) beam(g, [0, y, z], [xx, yy, z - i * 5], 1.5, C.silver, a);
  });
  if (land > 0.05) block(g, 0, 126, 3, 532, 25, 4, C.blue, land * 0.85);
  s.finish();
  const value = g.project([0, y, z + 11]);
  d.text(
    "101.4",
    value[0],
    value[1] + 9,
    mix(64, 29, context),
    context > 0.6 ? "#f5f1e7" : "#233b51",
    "center",
  );
  const labels = 1 - at(t, 2.7, 0.4);
  d.alpha(context * labels, () => {
    s.label("STEP", 0.2, 0.22, C.ink, 22);
    s.label("ZONE", 0.8, 0.22, C.ink, 22);
    s.label("λ 950 nm", 0.5, 0.86, C.copper, 23);
  });
  return "Step, zone, wavelength and analysis context stay attached as a complete record is appended below existing workbook rows.";
}
