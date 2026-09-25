import { palette as C, ease, mix } from "./space.js";

// A spatial map of the categorical observations in the supplied capture.
// Ring thickness is uniform: it encodes no invented temperature or measurement.
export function diagnosticStudy(s, { p, inspect, material, ink, mobile }) {
  const { poly, ring, line, label, dot } = s;
  const align = ease(p / 0.45),
    checks = ease((p - 0.38) / 0.4);
  const active = Math.min(2, Math.floor(inspect * 3));
  const cx = -85;
  const segment = (r0, r1, a, b, z, color) => {
    const point = (r, angle, height) => [
      cx + Math.cos(angle) * r,
      Math.sin(angle) * r,
      height,
    ];
    for (let i = 0; i < 28; i++) {
      const u = mix(a, b, i / 28),
        v = mix(a, b, (i + 1) / 28);
      poly(
        [
          point(r0, u, z + 7),
          point(r1, u, z + 7),
          point(r1, v, z + 7),
          point(r0, v, z + 7),
        ],
        color,
      );
      poly(
        [
          point(r1, u, z),
          point(r1, v, z),
          point(r1, v, z + 7),
          point(r1, u, z + 7),
        ],
        color,
      );
    }
    ring(cx, 0, z + 8, r1, C.metal, 0.7, a, b);
    ring(cx, 0, z + 8, r0, C.metal, 0.5, a, b);
    line([point(r0, a, z + 8), point(r1, a, z + 8)], C.metal, 0.6);
    line([point(r0, b, z + 8), point(r1, b, z + 8)], C.metal, 0.6);
  };
  const processZ = 15 + (1 - align) * 65,
    cleanZ = 18 - (1 - align) * 65;
  const observations = [
    "TFB correction",
    "Ceiling temperature",
    "Ceiling source",
  ];
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI * 0.83 + (i * Math.PI * 2) / 3,
      b = a + Math.PI * 0.6;
    segment(132, 166, a, b, processZ, i === active ? C.warm : material);
    const angle = (a + b) / 2;
    for (let j = 0; j < 9; j++) {
      const t = mix(a + 0.06, b - 0.06, j / 8);
      line(
        [
          [cx + Math.cos(t) * 140, Math.sin(t) * 140, processZ + 9],
          [cx + Math.cos(t) * 148, Math.sin(t) * 148, processZ + 9],
        ],
        ink,
        0.5,
      );
    }
    dot(
      [cx + Math.cos(angle) * 156, Math.sin(angle) * 156, processZ + 9],
      2.8,
      ink,
    );
  }
  for (let i = 0; i < 2; i++)
    segment(
      76,
      108,
      -Math.PI * 0.86 + i * Math.PI,
      -Math.PI * 0.04 + i * Math.PI,
      cleanZ,
      i === active % 2 ? C.teal : material,
    );
  ring(cx, 0, 10, 53, ink, 0.8);
  ring(cx, 0, 12, 48, C.sage, 0.4);
  // The scanning reference joins the two observation sets before checks open.
  const angle = mix(-Math.PI * 0.82, Math.PI * 1.16, ease(p));
  const a = [cx + Math.cos(angle) * 46, Math.sin(angle) * 46, 22];
  const b = [cx + Math.cos(angle) * 176, Math.sin(angle) * 176, 22];
  line([a, b], C.warm, 1.7);
  poly([a, b, [b[0], b[1], 90], [a[0], a[1], 90]], C.warm, 0.065);
  label(
    mobile ? "PROCESS" : "PROCESS / " + observations[active],
    [cx - 185, -215, 12],
    mobile ? 9 : 11,
    ink,
  );
  label("CLEAN", [cx, 6, 22], mobile ? 9 : 11, ink, "center");
  line(
    [
      [cx - 153, -202, 12],
      [cx - 135, -170, processZ + 8],
    ],
    C.sage,
    0.7,
  );

  const routes = ["LayTec / viewport", "Ceiling condition", "Optris settings"];
  for (let i = 0; i < 3; i++) {
    const y = (i - 1) * 78,
      x = mix(85, 195, checks),
      z = mix(12, 36, checks);
    line(
      [
        [cx + 174, y * 0.7, 22],
        [x - 15, y, z],
        [x + 120 * checks, y, z],
      ],
      i === active ? C.warm : C.sage,
      i === active ? 1.7 : 0.7,
      checks,
    );
    dot([x, y, z], i === active ? 4 : 2.5, i === active ? C.warm : C.metal);
    if (checks > 0.65)
      label(routes[i], [x + 12, y - 13, z], mobile ? 8 : 11, ink);
  }

  return { observation: observations[active], check: routes[active] };
}
