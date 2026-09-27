import { block, rail, C, points, at, mix } from "./set.js";

// The same built mechanisms persist into the real collection.
export function drawWork(g, p) {
  const open = at(p, 1.96, 0.59),
    align = at(p, 3.0, 0.57),
    bind = at(p, 3.8, 0.52),
    visibility = 1;
  // A deeply recessed channel has an unnecessary detour. The obstruction is a
  // mechanical interruption, with evidence visibly waiting on the approach.
  const path = points(90, (t) => {
    const x = -920 + t * 620,
      y =
        Math.sin(Math.max(0, Math.min(1, (t - 0.28) / 0.43)) * Math.PI) *
        165 *
        (1 - open);
    return [x, y, -36];
  });
  // Continuous channel walls replace the old featureless rectangular plinth.
  for (const side of [-1, 1])
    rail(
      g,
      path.map(([x, y, z]) => [x, y + side * 40, z - 15]),
      24,
      25,
      C.graphite,
      visibility,
    );
  for (let i = 0; i < 7; i++) {
    const t = 0.08 + i * 0.14,
      x = -920 + t * 620,
      y =
        Math.sin(Math.max(0, Math.min(1, (t - 0.28) / 0.43)) * Math.PI) *
        165 *
        (1 - open);
    block(g, [x, y, -70], [16, 116, 12], C.dim, visibility);
  }
  rail(g, path, 22, 13, C.silver, visibility);
  block(
    g,
    [-600, 0, mix(-9, -106, open)],
    [68, 123, 46],
    C.graphite,
    visibility,
  );
  for (let i = 0; i < 11; i++) {
    const travel = at(p, 1.05 + i * 0.052, 0.63),
      start = -925 - i * 20;
    const x = mix(start, -875 + i * 51, travel * mix(0.49, 1, open));
    const t = (x + 920) / 620,
      y =
        Math.sin(Math.max(0, Math.min(1, (t - 0.28) / 0.43)) * Math.PI) *
        165 *
        (1 - open);
    block(g, [x, y, -11], [15, 15, 11], C.copper, visibility);
  }
  // Comparison: two combs initially obstruct each other's correspondence. A
  // deliberate local alignment leaves clear, interlocking registration.
  for (let side = 0; side < 2; side++) {
    const offset = (side ? 1 : -1) * mix(48, 0, align),
      x = (side ? 1 : -1) * 96;
    block(g, [x, offset, -22], [18, 249, 32], C.dim, visibility);
    for (let i = 0; i < 8; i++)
      block(
        g,
        [x * 0.5, (i - 3.5) * 30 + offset, -12],
        [96, 9, 15],
        side ? C.silver : C.blue,
        visibility,
      );
  }
  // Reporting: independent sections arrive as distinct physical leaves and seat
  // into an ordered volume. They are not identical copies of the first mechanism.
  for (let i = 0; i < 5; i++) {
    const x = 600 + mix((i % 2 ? 1 : -1) * 76, 0, bind),
      y = (i - 2) * mix(53, 33, bind),
      z = mix(i * 25, 5 - i * 5, bind);
    block(
      g,
      [x, y, z],
      [280, 26, 7],
      i === 2 ? C.copper : C.silver,
      visibility,
    );
  }
  block(g, [600, 0, -33], [322, 243, 13], C.graphite, bind * visibility);
  // Pullback reveals a single deliberate foundation beneath all interventions.
  rail(
    g,
    [
      [-950, 194, -80],
      [965, 194, -80],
    ],
    20,
    9,
    C.dim,
    at(p, 4.25, 0.35) * visibility,
  );
}
