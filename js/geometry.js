const TAU = Math.PI * 2;
const mix = (a, b, t) => a + (b - a) * t;
// These are intentionally synthetic geometries: no process values or limits.
export const nodePositions = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * TAU - 0.3;
  return [
    Math.cos(angle) * 3.18,
    Math.sin(angle) * 1.78,
    Math.sin(angle * 2) * 0.36,
  ];
});
function relief(x, z) {
  return (
    0.65 * Math.exp(-((x - 0.6) ** 2 + (z + 0.4) ** 2) * 0.48) -
    0.4 * Math.exp(-((x + 1.2) ** 2 + (z - 0.5) ** 2) * 0.8) +
    0.12 * Math.sin(x * 1.7 + z * 0.8)
  );
}
function point(kind, t, j, n, amount) {
  const r = j / Math.max(1, n - 1),
    x = (t - 0.5) * 6,
    y = (r - 0.5) * 3.5;
  switch (kind) {
    case "material": {
      const layer = Math.floor(j / (n / 3)),
        v = (j % (n / 3)) / (n / 3 - 1);
      const z = (v - 0.5) * 3.9;
      const xx = x * Math.sqrt(Math.max(0.012, 1 - ((v - 0.5) * 2) ** 2));
      return [
        xx + (layer - 1) * 0.13,
        relief(xx, z) * 0.18 + (layer - 1) * 0.34,
        z,
      ];
    }
    case "topology": {
      const z = (r - 0.5) * 4.9,
        span = Math.sqrt(Math.max(0.01, 1 - ((r - 0.5) * 2) ** 2));
      const xx = x * span;
      return [xx, relief(xx, z) * amount * 1.6, z];
    }
    case "friction":
      return [
        x + (Math.floor(t * 6) % 2) * 0.23 * Math.sin(j * 2),
        y + Math.sin(t * TAU * 1.8 + j * 0.63) * 0.45,
        Math.sin(j * 2.3) * 1.3 + Math.cos(t * 7 + j) * 0.3,
      ];
    case "aligned":
      return [x * 1.3, (j < n / 2 ? -0.8 : 0.8) + (j % (n / 2)) * 0.004, 0];
    case "history": {
      const lane = j % 8,
        event = Math.floor(j / 8);
      return [
        x,
        y * 0.75 + Math.sin(t * 6 + event) * 0.24 * (1 - amount),
        Math.sin(j) * 0.6 * (1 - amount) + (lane % 2) * 0.07,
      ];
    }
    case "comparison": {
      const side = j < n / 2 ? -1 : 1,
        k = j % (n / 2),
        row = k / (n / 2 - 1);
      const mismatch = k % 7 === 0;
      return [
        side * (0.22 + t * 2.9),
        (row - 0.5) * 3.6 +
          (mismatch ? side * 0.18 : Math.sin(k * 2) * 0.65 * (1 - amount)) *
            (1 - t),
        Math.sin(t * Math.PI) * side * 0.3 * (1 - amount),
      ];
    }
    case "configuration": {
      const level = j % 4,
        branch = Math.floor(j / 4),
        s = Math.floor(t * 4) / 4;
      return [
        (s - 0.5) * 5.2,
        (branch / (n / 4) - 0.5) * 3.6 +
          (level - 1.5) * 0.12 * Math.sin(t * Math.PI),
        Math.sin(level) * 0.35 * (1 - amount) +
          (branch % 5 === 0 ? amount * 0.4 : 0),
      ];
    }
    case "diagnosis": {
      const lane = (j - n / 2) / (n / 2),
        converge = Math.pow(t, 1.7) * amount;
      return [
        x,
        lane * 1.9 * (1 - converge) +
          Math.sin(t * 7 + lane * 2) * 0.18 * (1 - t),
        Math.sin(lane * 5) * 0.65 * (1 - converge),
      ];
    }
    case "difference": {
      const circle = Math.floor(j / (n / 5)),
        v = (j % (n / 5)) / (n / 5),
        a = (circle / 5) * TAU - 0.5;
      const phase = t * TAU,
        rad = 0.36 + v * 0.17;
      return [
        Math.cos(a) * 1.85 + Math.cos(phase) * rad,
        Math.sin(a) * 1.5 + Math.sin(phase) * rad,
        Math.sin(a * 2) * 0.48 * (1 - amount) + Math.sin(phase) * 0.08,
      ];
    }
    case "zones": {
      const sector = j % 6,
        ring = Math.floor(j / 6) / (n / 6),
        angle = ((sector + t * 0.9) / 6) * TAU,
        rad = 0.5 + ring * 2;
      return [
        Math.cos(angle) * rad,
        Math.sin(sector * 1.4) * 0.55 * (1 - amount) + Math.cos(angle) * 0.12,
        Math.sin(angle) * rad,
      ];
    }
    case "usage": {
      const unit = j % 12,
        ring = Math.floor(j / 12) / (n / 12),
        a = (unit / 12) * TAU;
      const theta = t * TAU * (0.42 + unit / 28),
        radius = 0.34 + ring * 0.045;
      return [
        Math.cos(a) * 2.7 + Math.cos(theta) * radius,
        Math.sin(a) * 1.45 + Math.sin(theta) * radius,
        Math.sin(a) * 0.35,
      ];
    }
    case "pathfinder": {
      const a = (j / n) * TAU,
        dist = 0.4 + t * 2.7;
      return [
        Math.cos(a) * dist,
        Math.sin(a) * dist * 0.65,
        Math.sin(a * 3) * 0.4 * t,
      ];
    }
    case "compilation": {
      const order = Math.min(1, t * 1.6) * amount;
      return [
        x,
        mix(
          y + Math.sin(j * 3 + t * 20) * 0.12,
          Math.sin(t * TAU) * 0.48 + ((j % 8) - 3.5) * 0.24,
          order,
        ),
        mix(Math.sin(j * 3) * 1.2, (Math.floor(j / 8) - 4) * 0.045, order),
      ];
    }
    case "report": {
      const order = Math.pow(t, 1.2) * amount;
      return [
        x,
        mix(y + Math.sin(t * 10 + j) * 0.28, ((j % 24) - 12) * 0.13, order),
        mix(Math.sin(j * 2) * 1.2, Math.floor(j / 24) * 0.14, order),
      ];
    }
    case "schedule":
    case "maintenance": {
      const lane = j % 8,
        cycle = Math.floor(j / 8);
      const offset = kind === "maintenance" ? Math.sin(lane) * 0.3 : 0;
      return [
        x + (cycle % 2) * 0.12 * (1 - amount),
        (lane - 3.5) * 0.43 + Math.sin(t * 2) * 0.08,
        cycle * 0.08 + offset * (1 - amount),
      ];
    }
    case "signals":
    case "observatory":
    case "legacy": {
      const group = Math.floor(j / 4),
        line = j % 4,
        total = Math.max(1, Math.floor(n / 4)),
        cols = Math.min(4, total),
        rowCount = Math.ceil(total / cols),
        col = group % cols,
        row = Math.floor(group / cols),
        v = kind === "legacy" ? 0.23 : 0.17;
      const signal =
        Math.sin(t * 24 + group) * v + Math.sin(t * 67 + group * 3) * 0.065;
      const anomaly =
        group === 6 ? Math.exp(-(((t - 0.68) * 12) ** 2)) * 0.42 * amount : 0;
      return [
        (col - (cols - 1) / 2) * 1.72 + (t - 0.5) * 1.48,
        (row - (rowCount - 1) / 2) * 0.98 + signal + anomaly + line * 0.024,
        (col + row - 3) * 0.13 +
          (kind === "observatory"
            ? (Math.cos(col * 0.8) - 0.5) * amount * 0.9
            : 0),
      ];
    }
    default:
      return [x, y, 0];
  }
}
export function geometry(
  kind,
  apps,
  rows,
  columns,
  amount = 1,
  compact = false,
) {
  const positions = new Float32Array(rows * (columns + 1) * 2 * 3),
    meta = new Float32Array(rows * (columns + 1) * 2 * 3);
  let k = 0;
  const system = kind === "universe" || kind === "tools";
  for (let j = 0; j < rows; j++)
    for (let c = 0; c <= columns; c++) {
      const t = c / columns,
        node = Math.min(15, Math.floor(j / (rows / 16))),
        local = j % (rows / 16),
        n = rows / 16;
      let p, prev, next, width;
      if (system) {
        const concept = apps[node].visualConcept,
          scale = kind === "tools" ? 0.16 : 0.105,
          center = nodePositions[node].map(
            (v, a) => v * (compact && a === 1 ? 1.45 : 1),
          );
        const spread = kind === "tools" ? 0.25 + node / 18 : 1;
        const make = (u) => {
          if (local >= n - 1) {
            const members = apps
              .map((a, i) => (a.category === apps[node].category ? i : -1))
              .filter((i) => i >= 0);
            const end = nodePositions[
              members[(members.indexOf(node) + 1) % members.length]
            ].map((v, a) => v * (compact && a === 1 ? 1.45 : 1));
            return center.map(
              (v, a) =>
                mix(v, end[a], u) * (1 - Math.sin(u * Math.PI) * 0.14) * spread,
            );
          }
          let p = point(concept, u, local, n - 1, 1);
          if (["topology", "zones"].includes(concept)) {
            const y = p[1];
            p[1] = y * 0.5 - p[2] * 0.85;
            p[2] = y * 0.85 + p[2] * 0.5;
          }
          return p.map((v, a) => v * scale + center[a] * spread);
        };
        p = make(t);
        prev = make(Math.max(0, t - 0.002));
        next = make(Math.min(1, t + 0.002));
        width = local >= n - 1 ? 0.004 : 0.012;
      } else {
        p = point(kind, t, j, rows, amount);
        prev = point(kind, Math.max(0, t - 0.002), j, rows, amount);
        next = point(kind, Math.min(1, t + 0.002), j, rows, amount);
        width =
          kind === "material"
            ? (3.9 / (rows / 3)) * 0.49
            : kind === "topology"
              ? (4.9 / rows) * 0.48
              : ["friction", "aligned"].includes(kind)
                ? 0.01
                : 0.014;
      }
      const tangent = next.map((v, a) => v - prev[a]);
      const horizontal =
        ["material", "topology", "zones"].includes(kind) && !system;
      let side = horizontal
        ? [-tangent[2], 0, tangent[0]]
        : [-tangent[1], tangent[0], 0];
      const len = Math.hypot(...side) || 1;
      side = side.map((v) => (v / len) * width);
      for (const edge of [-1, 1]) {
        const v = p.map((value, a) => value + side[a] * edge);
        if (["material", "topology"].includes(kind) && !system) {
          const radius = kind === "material" ? 1.95 : 2.45;
          const zz = Math.max(-radius + 0.001, Math.min(radius - 0.001, v[2]));
          const oldSpan = Math.sqrt(Math.max(0.012, 1 - (p[2] / radius) ** 2)),
            newSpan = Math.sqrt(Math.max(0.012, 1 - (zz / radius) ** 2));
          const layer =
            kind === "material" ? Math.floor(j / (rows / 3)) - 1 : 0;
          v[0] = ((p[0] - layer * 0.13) * newSpan) / oldSpan + layer * 0.13;
          v[2] = zz;
          v[1] =
            relief(v[0], zz) * (kind === "material" ? 0.18 : amount * 1.6) +
            layer * 0.34;
        }
        positions.set(v, k * 3);
        meta.set([edge, j / (rows - 1), t], k * 3);
        k++;
      }
    }
  return { positions, meta };
}
export function indices(rows, columns) {
  const array = new Uint16Array(rows * columns * 6);
  let k = 0;
  for (let row = 0; row < rows; row++)
    for (let c = 0; c < columns; c++) {
      const a = (row * (columns + 1) + c) * 2;
      array.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], k);
      k += 6;
    }
  return array;
}
