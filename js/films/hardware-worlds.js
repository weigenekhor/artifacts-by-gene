import {
  stage,
  C,
  at,
  mix,
  clamp,
  colorMix,
  block,
  beam,
  annulus,
  wafer,
} from "./stage.js";
import { baseplateExample, temperatureSpan } from "../baseplate-example.js";
const TAU = Math.PI * 2;
const seats = Array.from({ length: 5 }, (_, i) => {
  const a = (i * TAU) / 5 - Math.PI / 2;
  return [Math.cos(a) * 139, Math.sin(a) * 139];
});

function thermal(g, amplitude) {
  const n = 48,
    rings = 5;
  const pt = (r, a) => [
    Math.cos(a) * r,
    Math.sin(a) * r,
    -18 + amplitude * (0.5 + 0.5 * Math.sin(a * 2.1 + r * 0.012)) * 20,
  ];
  const material = (r, a) =>
    colorMix(
      C.teal,
      C.copper,
      (0.5 + 0.5 * Math.sin(a * 2.1 + r * 0.012)) * amplitude,
    );
  for (let ring = 0; ring < rings; ring++)
    for (let j = 0; j < n; j++) {
      const a = (j / n) * TAU,
        b = ((j + 1) / n) * TAU,
        r0 = (ring / rings) * 204,
        r1 = ((ring + 1) / rings) * 204;
      const heat =
        (0.5 + 0.5 * Math.sin((a + b) * 1.05 + r1 * 0.012)) * amplitude;
      g.poly(
        [pt(r0, a), pt(r1, a), pt(r1, b), pt(r0, b)],
        colorMix(C.teal, C.copper, heat),
        1,
        false,
        [material(r0, a), material(r1, a), material(r1, b), material(r0, b)],
      );
    }
}
function exchange(a, b, t, out) {
  const lift = at(t, 0, 0.23) * (1 - at(t, 0.79, 0.21)),
    travel = at(t, 0.3, 0.43);
  for (const [from, to, side] of [
    [a, b, 1],
    [b, a, -1],
  ]) {
    const A = seats[from],
      B = seats[to];
    out[from] = [
      mix(A[0], B[0], travel) + Math.sin(travel * Math.PI) * side * 24,
      mix(A[1], B[1], travel),
      lift * (side === 1 ? 112 : 66),
    ];
  }
}
export function baseplatePositions(t, alternate = 0) {
  const pos = seats.map((v) => [...v, 0]);
  exchange(2, 4, clamp((t - 1.5) / 0.9) * (1 - alternate), pos);
  exchange(0, 1, clamp((t - 3.1) / 0.9) * (1 - alternate), pos);
  return pos;
}
export function arrange(d, q, f, W, H, m, hit, alternate = 0) {
  const t = q * 5.2,
    first = clamp((t - 1.5) / 0.9) * (1 - alternate),
    second = clamp((t - 3.1) / 0.9) * (1 - alternate);
  const s = stage(d, W, H, {
      scale: 0.95,
      yaw: mix(-0.26, 0.06, at(t, 0.5, 4.1)),
      tilt: mix(0.84, 0.49, at(t, 3.8, 0.8)),
      cy: 0.43,
      segments: 40,
      rings: 1,
    }),
    g = s.g;
  s.shadow([0, 0, -42], 259, 91, 0.24);
  g.disc(0, 0, -37, 218, 17, C.graphite);
  annulus(g, 0, 0, -20, 218, 205, 13, C.titanium, 0, TAU, 1, 40);
  thermal(g, 1 - at(first, 0.91, 0.09) * 0.46 - at(second, 0.91, 0.09) * 0.52);
  seats.forEach(([x, y]) => {
    g.disc(x, y, 0, 55, 5, C.navy);
    annulus(g, x, y, 3, 55, 50, 4, C.titanium, 0, TAU, 1, 40);
  });
  const pos = baseplatePositions(t, alternate);
  pos.forEach(([x, y, z], i) => {
    const thick = 7 + i * 0.8;
    g.disc(x, y, z + 7, 49, thick, C.titanium);
    g.disc(x, y, z + 7 + thick, 47, 2, [72, 87, 95]);
    g.ring(x, y, z + thick + 9.3, 46, C.silver, 0.8);
    for (let k = 0; k < 3; k++)
      g.ring(x, y, z + thick + 9.4, 16 + k * 10, [142, 155, 160], 0.4);
    for (let k = 0; k <= i; k++) {
      const a = -0.85 + k * 0.09;
      g.line(
        [
          [x + Math.cos(a) * 43, y + Math.sin(a) * 43, z + thick + 10],
          [x + Math.cos(a) * 47, y + Math.sin(a) * 47, z + thick + 10],
        ],
        C.paper,
        1,
      );
    }
    const p = g.project([x, y, z + 20]);
    hit((i + 0.5) / 5, p[0] - 35, p[1] - 35, 70, 70, "Baseplate " + (i + 1));
  });
  s.finish();
  const state = second >= 1 ? 2 : first >= 1 ? 1 : 0;
  s.label(
    "ΔT " + temperatureSpan(baseplateExample.states[state]) + " °C",
    0.5,
    0.92,
    C.ink,
    26,
  );
  return "Illustrative offset assignment: two physical exchanges retain all five plates and reduce the temperature span.";
}

export function zones(d, q, f, W, H, m, hit) {
  const t = q * 5.2,
    rotation = at(t, 0.8, 1.2) * TAU,
    inspect = at(t, 2, 0.6) * (1 - at(t, 3.15, 0.75)),
    overhead = at(t, 3.3, 1);
  const s = stage(d, W, H, {
      scale: 0.9 + inspect * 0.35,
      yaw: mix(-0.15, 0, overhead),
      tilt: mix(1.01, 0.03, overhead),
      target: [inspect * 90, inspect * -60, 0],
      cy: 0.47,
    }),
    g = s.g;
  s.shadow([0, 0, -37], 235, 80, 0.2);
  g.disc(0, 0, -28, 215, 15, C.graphite);
  annulus(g, 0, 0, -12, 214, 206, 4, C.titanium);
  seats.forEach(([xx, yy], i) => {
    const initial = Math.atan2(yy, xx),
      angle = initial + rotation,
      x = Math.cos(angle) * 139,
      y = Math.sin(angle) * 139;
    g.disc(x, y, -9, 56, 6, C.ink);
    wafer(g, x, y, -2, 53, [31, 71, 128]);
    const sampled = at(t, 0.87 + i * 0.2, 0.25);
    for (const [radius, col] of [
      [118, C.ice],
      [167, C.emerald],
    ]) {
      const span = 0.245;
      for (let k = 0; k < 22; k++) {
        const a = angle - span + (k / 22) * span * 2,
          b = a + (span * 2) / 22,
          point = (r, a) => [Math.cos(a) * r, Math.sin(a) * r, 4];
        g.poly(
          [
            point(radius - 6, a),
            point(radius + 6, a),
            point(radius + 6, b),
            point(radius - 6, b),
          ],
          col,
          sampled * 0.97,
        );
      }
    }
    const p = g.project([x, y, 0]);
    hit((i + 0.5) / 5, p[0] - 40, p[1] - 40, 80, 80, "Wafer " + (i + 1));
  });
  if (t > 0.8 && t < 3.45) {
    const alpha = at(t, 0.8, 0.3) * (1 - at(t, 3.05, 0.4));
    for (const [r, col] of [
      [118, C.ice],
      [167, C.emerald],
    ]) {
      const a = -0.9,
        p = [Math.cos(a) * r, Math.sin(a) * r];
      g.poly(
        [
          [p[0] - 8, p[1] - 17, 4],
          [p[0] + 8, p[1] + 17, 4],
          [p[0] + 8, p[1] + 17, 155],
          [p[0] - 8, p[1] - 17, 155],
        ],
        col,
        alpha * 0.17,
      );
      block(g, p[0], p[1], 122, 22, 38, 9, C.graphite, alpha);
    }
  }
  s.finish();
  d.alpha(overhead, () => {
    s.label("Inner", 0.33, 0.92, C.teal, 24);
    s.label("Outer", 0.67, 0.92, C.emerald, 24);
  });
  return "Inner and outer optical sampling windows intersect the five physical wafer surfaces.";
}

export function diagnose(d, q, f, W, H, m, hit) {
  const t = q * 5.2,
    temp = at(t, 0.8, 0.7),
    gas = at(t, 1.6, 0.7),
    process = at(t, 2.4, 0.7),
    clean = at(t, 3.2, 0.6),
    focus = at(t, 3.8, 0.8);
  const s = stage(d, W, H, {
      scale: mix(1.03, 1.1, focus),
      yaw: mix(-0.23, 0.15, at(t, 0, 4.6)),
      tilt: mix(0.82, 0.64, focus),
      target: [0, 0, 25 + focus * 23],
      cy: 0.59,
    }),
    g = s.g;
  s.shadow([0, 0, -46], 200, 70, 0.2);
  // A deliberately schematic reactor: inlet, volume, susceptor, exhaust and thermal jacket.
  g.disc(0, 0, -36, 130, 18, C.graphite);
  annulus(g, 0, 0, -18, 129, 111, 9, C.titanium);
  g.disc(0, 0, 0, 108, 6, C.navy);
  for (let j = 0; j < 40; j++) {
    const a = (j / 40) * TAU,
      b = ((j + 1) / 40) * TAU,
      pt = (a, z) => [Math.cos(a) * 119, Math.sin(a) * 119, z];
    g.poly(
      [pt(a, 0), pt(b, 0), pt(b, 137), pt(a, 137)],
      j > 19 ? C.silver : C.ice,
      j > 19 ? 0.38 : 0.1,
    );
  }
  annulus(g, 0, 0, 136, 137, 83, 12, C.graphite);
  annulus(g, 0, 0, 149, 105, 82, 8, C.titanium);
  g.disc(0, 0, 160, 43, 29, C.graphite);
  g.disc(0, 0, 189, 50, 7, C.titanium);
  for (let i = 0; i < 5; i++) {
    const a = (i * TAU) / 5;
    g.disc(Math.cos(a) * 66, Math.sin(a) * 66, 8, 26, 4, C.blue);
  }
  // The thermal envelope changes before the gas and process observations narrow attention.
  for (let ring = 0; ring < 7; ring++)
    annulus(
      g,
      0,
      0,
      8 + ring * 17,
      124,
      121,
      4,
      colorMix(C.ice, C.copper, temp * (0.5 + 0.5 * Math.sin(ring * 0.7))),
      0,
      TAU,
      temp * 0.48 * (1 - clean * 0.66),
      36,
    );
  if (gas > 0.01)
    for (let i = 0; i < 7; i++) {
      const a = (i * TAU) / 7,
        pts = Array.from({ length: 18 }, (_, j) => {
          const u = j / 17;
          return [
            Math.cos(a) * mix(18, 88, u),
            Math.sin(a) * mix(18, 88, u),
            158 - u * 113,
          ];
        });
      g.line(pts, C.ice, 2, gas * (1 - focus * 0.62));
    }
  annulus(
    g,
    0,
    0,
    17,
    102,
    91,
    6,
    C.blue,
    0,
    TAU,
    process * (1 - clean) * 0.68,
  );
  const inspectionY = -36;
  annulus(
    g,
    0,
    inspectionY,
    128,
    79,
    71,
    5,
    C.copper,
    -Math.PI * 0.1,
    Math.PI * 1.25,
    clean,
  );
  for (let i = 0; i < 3; i++) {
    const a = -2.3 + i * 1.15,
      x = Math.cos(a) * 156,
      y = Math.sin(a) * 156;
    beam(
      g,
      [Math.cos(a) * 77, Math.sin(a) * 77 + inspectionY, 141],
      [x, y, 178],
      1.5,
      C.copper,
      focus,
    );
    if (focus > 0.01) g.disc(x, y, 178, 10 * focus, 7 * focus, C.copper);
  }
  s.finish();
  if (t > 0.8 && t < 3.8) {
    const words = ["Temperature", "Gas", "Process", "Clean"],
      idx = t < 1.6 ? 0 : t < 2.4 ? 1 : t < 3.2 ? 2 : 3;
    s.label(words[idx], 0.5, 0.12, C.ink, 25);
  }
  d.alpha(focus, () => s.label("Recommended checks", 0.5, 0.12, C.copper, 23));
  return "Temperature, gas, process and clean observations direct recommended checks. This reactor is an abstract illustration, not a confirmed cause.";
}
