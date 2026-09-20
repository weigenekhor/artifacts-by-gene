// Sixteen persistent strips connect the story and the application studies.
// Geometry illustrates a workflow; it is never measured or simulated app output.
export const STRIPS = 16,
  SEGMENTS = 80;
const TAU = Math.PI * 2;
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const mix = (a, b, t) => a + (b - a) * t;
export const ease = (t) => {
  t = clamp(t);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const wave = (x, i) =>
  Math.sin(x * 3.1 + i * 0.8) * 0.12 + Math.sin(x * 7.2 + i) * 0.06;
export function point(kind, i, u, side = 0, amount = 1) {
  let x = 0,
    y = 0,
    z = 0,
    w = 0.024;
  const n = i / 15,
    k = i % 8,
    q = Math.floor(i / 8);
  if (kind === "surface") {
    // Parallel scan lines describe a wafer-sized field, not a brand mark.
    const v = (n - 0.5) * 1.88;
    const span = Math.sqrt(1 - v * v) * 3.4;
    x = (u * 2 - 1) * span;
    y = v * 2.65;
    z =
      Math.exp(-((x - 0.5) ** 2 + (y + 0.3) ** 2) * 0.25) * 0.8 +
      Math.sin(x * 0.6) * 0.12;
    w = 0.055;
  } else if (kind === "friction") {
    x = (u - 0.5) * 7.6 + ((i % 3) - 1) * 0.35;
    y = (n - 0.5) * 4 + wave(u * 4, i) * (0.7 + amount);
    z = Math.sin(u * 3 + i) * 0.65;
    w = 0.028;
  } else if (kind === "comparison" || kind === "configuration") {
    const mismatch = k === 2 || k === 5;
    const length =
      [1.8, 2.4, 1.5, 2.1, 1.7, 2.3, 2, 1.55][k] + (mismatch && q ? 0.25 : 0);
    x = u * length + (q ? 0.5 : -3.2);
    y = (3.5 - k) * 0.45 + (q ? Math.sin(k * 7) * 0.85 * (1 - amount) : 0);
    z = mismatch && q ? 0.3 * amount : 0;
    if (kind === "configuration") {
      x += Math.sin(Math.floor(u * 6) * 2) * 0.22;
      z += q * 0.15;
    }
    w = 0.095 + (mismatch ? 0.028 : 0);
    y += side * w;
    return [x, y, z];
  } else if (kind === "structure") {
    // The same inputs acquire a repeatable method: gather, align, resolve.
    // Four ordered lanes anticipate the four real Expedition groups.
    const group = Math.floor(i / 4),
      lane = i % 4;
    const resolve = ease((u - 0.16) / 0.62);
    x = (u - 0.5) * 7;
    y = mix(
      (n - 0.5) * 4.4,
      (group - 1.5) * 1.25 + (lane - 1.5) * 0.12,
      resolve,
    );
    y += Math.sin(u * 14 + i * 0.6) * 0.2 * (1 - resolve);
    z = Math.sin(u * Math.PI) * (lane - 1.5) * 0.18;
    w = 0.026;
  } else if (kind === "system") {
    // A single ordered stack; no loose endpoints or disconnected network.
    x = (u - 0.5) * 6.4;
    y = (n - 0.5) * 4.1;
    z = Math.sin(u * Math.PI) * 0.18;
    w = 0.065;
  } else if (kind === "topology") {
    const a = u * TAU,
      r =
        (0.12 + n * 2.8) * (1 + 0.06 * Math.cos(a * 3) * Math.sin(n * Math.PI));
    x = Math.cos(a) * r;
    y = Math.sin(a) * r * 0.85;
    z =
      (Math.exp(-((x - 0.8) ** 2 + (y + 0.35) ** 2) * 0.4) * 2.1 +
        Math.sin(x * 0.8 + y) * 0.3) *
      amount;
    w = 0.065;
    return [x + Math.cos(a) * side * w, y + Math.sin(a) * side * w, z];
  } else if (kind === "usage" || kind === "difference" || kind === "zones") {
    const group = Math.floor(i / 4),
      band = i % 4,
      a =
        u *
          TAU *
          (kind === "usage" ? 0.12 + (0.26 + group * 0.13) * amount : 0.98) -
        Math.PI / 2,
      r = 0.65 + band * 0.06,
      ca = (group * TAU) / 4 + 0.4;
    x = Math.cos(ca) * 1.65 + Math.cos(a) * r;
    y = Math.sin(ca) * 1.55 + Math.sin(a) * r;
    z =
      kind === "difference" ? Math.sin(ca) * 0.8 * (1 - amount) : band * 0.025;
    if (kind === "zones") {
      const ang = u * TAU * 0.44 + (group * Math.PI) / 2;
      x = Math.cos(ang) * (1 + band * 0.42);
      y = Math.sin(ang) * (1 + band * 0.42);
      z = Math.sin(ang) * 0.25 * amount;
    }
    w = 0.028;
    return [x + Math.cos(a) * side * w, y + Math.sin(a) * side * w, z];
  } else if (kind === "diagnosis") {
    const yy = (n - 0.5) * 4.6,
      branch = Math.round((n - 0.5) * 4) * 0.72;
    x = (u - 0.5) * 6.2;
    y = mix(yy, branch, ease(u * 2)) * (1 - ease((u - 0.55) / 0.45) * amount);
    z = Math.sin(u * Math.PI) * 0.35;
    w = 0.027;
  } else if (
    kind === "schedule" ||
    kind === "maintenance" ||
    kind === "history"
  ) {
    const lane = Math.floor(i / 2),
      offset = (i % 2) * 0.6;
    x =
      (u - 0.5) * 2.5 +
      (i % 2 ? 1.6 : -1.6) +
      (1 - amount) * Math.sin(i * 3) * 1.1;
    y = (3.5 - lane) * 0.45;
    z = (i % 2) * 0.16;
    w = 0.105;
    if (kind === "history") {
      x = (u - 0.5) * 5.8 + (1 - amount) * Math.sin(i * 3) * 0.75;
      y = (3.5 - lane) * 0.47 + offset * 0.13;
      w = i % 2 ? 0.015 : 0.07;
    }
  } else if (kind === "compilation" || kind === "report") {
    x = (u - 0.5) * 6.8;
    const t = ease((u - 0.2) / 0.55) * amount;
    y = mix((n - 0.5) * 4 + Math.sin(u * 24 + i) * 0.25, (n - 0.5) * 2.9, t);
    z = (1 - t) * Math.sin(u * 7 + i) * 0.5;
    w = mix(0.025, kind === "report" ? 0.072 : 0.03, t);
  } else if (kind === "pathfinder") {
    x = (u - 0.5) * 6.5;
    y =
      mix(0, (n - 0.5) * 4, ease(u * 1.5)) +
      wave(u * 5, i) * ease((u - 0.5) * 2) * amount;
    z = Math.sin(u * Math.PI) * 0.2;
    w = 0.024;
  } else {
    const lane = kind === "legacy" ? Math.floor(i / 2) : i;
    x = (u - 0.5) * 6.3;
    y =
      (lane - (kind === "legacy" ? 3.5 : 7.5)) *
        (kind === "legacy" ? 0.48 : 0.28) +
      wave(u * 6, i) * amount;
    z =
      kind === "observatory"
        ? Math.floor(i / 4) * 0.12
        : Math.sin(u * Math.PI) * (i % 4) * 0.09;
    w = 0.025;
  }
  return [x, y + side * w, z];
}
export function makeForm(kind, amount = 1) {
  const a = new Float32Array(STRIPS * (SEGMENTS + 1) * 2 * 3);
  let p = 0;
  for (let i = 0; i < STRIPS; i++)
    for (let j = 0; j <= SEGMENTS; j++)
      for (const side of [-1, 1]) {
        const xyz = point(kind, i, j / SEGMENTS, side, amount);
        a[p++] = xyz[0];
        a[p++] = xyz[1];
        a[p++] = xyz[2];
      }
  return a;
}
