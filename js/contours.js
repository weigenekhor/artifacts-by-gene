// Marching triangles over the illustrative field: these lines follow equal height,
// rather than decorative concentric rings. Generated once and reused during growth.
export function contourSegments(field) {
  const output = [],
    n = 44,
    step = 5.5 / n;
  for (let level = -0.3; level <= 0.8; level += 0.07) {
    for (let ix = 0; ix < n; ix++)
      for (let iy = 0; iy < n; iy++) {
        const x = ix * step - 2.75,
          y = iy * step - 2.75;
        const corners = [
          [x, y],
          [x + step, y],
          [x + step, y + step],
          [x, y + step],
        ];
        for (const ids of [
          [0, 1, 2],
          [0, 2, 3],
        ]) {
          const points = [];
          for (let e = 0; e < 3; e++) {
            const a = corners[ids[e]],
              b = corners[ids[(e + 1) % 3]],
              va = field(...a),
              vb = field(...b);
            if (va < level === vb < level) continue;
            const t = (level - va) / (vb - va),
              p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, level];
            if (Math.hypot(p[0], p[1]) <= 2.74) points.push(p);
          }
          if (points.length === 2) output.push(...points[0], ...points[1]);
        }
      }
  }
  return new Float32Array(output);
}
