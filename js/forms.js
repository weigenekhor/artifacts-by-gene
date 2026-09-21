import { mix, clamp, smooth } from "./motion.js";
export const COUNT = 192;
export const GROUPS = [0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3];
export const STARTS = [0, 3, 6, 11],
  SIZES = [3, 3, 5, 5];
export function nodePosition(i, mobile = false, group = 0, short = false) {
  const g = GROUPS[i],
    j = i - STARTS[g],
    n = SIZES[g];
  if (mobile && short) return [3, 1.5 - j * 0.9, g === group ? 0 : -25];
  if (mobile)
    return [j % 2 ? 1.1 : -1.1, 2.5 - j * 1.25, g === group ? 0 : -25];
  const x = (j - (n - 1) / 2) * (n === 3 ? 3.8 : 2.45);
  return [x, 2.15 - g * 1.5 + Math.cos(x * 0.35) * 0.25, -Math.abs(x) * 0.045];
}
export const field = (x, y) =>
  0.72 * Math.exp(-((x - 0.75) ** 2 + (y + 0.2) ** 2) * 0.7) -
  0.4 * Math.exp(-((x + 1.1) ** 2 + (y - 0.65) ** 2) * 1.3) +
  0.16 * Math.sin(x * 1.4 + y);
// The same instanced pieces persist across the whole journey. Their role changes,
// from repeated records to a tool, recipe steps, samples, paths and instruments.
export function element(stage, i, mobile = false, group = 0, short = false) {
  let x = 0,
    y = 0,
    z = 0,
    sx = 0.1,
    sy = 0.04,
    sz = 0.035,
    rz = 0;
  const lane = i % 16,
    col = Math.floor(i / 16),
    g = Math.floor(i / 32);
  if (stage === 0) {
    x = (lane - 7.5) * 0.34;
    y = (col - 5.5) * 0.43;
    z = 0.015;
    sx = 0.3;
    sy = 0.38;
    sz = 0.018;
    if (Math.hypot(x, y) > 2.65) sx = sy = sz = 0.001;
    if (i > 175) {
      x = -1.25 + (i - 175) * 0.11;
      y = -2.3 - (i - 175) * 0.23;
      z = (i - 175) * 0.05;
      sx = 0.12;
      sy = 0.06;
      sz = 0.035;
    }
  } else if (stage === 1) {
    // Six recognisable families of repeated work, separated in depth.
    const j = i % 32,
      row = Math.floor(j / 4),
      c = j % 4;
    x = ((g % 3) - 1) * 3.4 + c * 0.52;
    y = (g < 3 ? 1.45 : -1.6) + row * 0.24;
    z = ((g % 3) - 1) * 1.35 + Math.sin(j * 3.7) * 0.25;
    sx = 0.25 + (j % 3) * 0.13;
    sy = 0.045;
    sz = 0.045;
    if (g === 2 || g === 5) {
      y += Math.sin(c * 1.5 + row) * 0.23;
      rz = Math.cos(c + row) * 0.16;
    }
    if (g === 3) {
      const a = (j / 32) * Math.PI * 2;
      x = -3 + Math.cos(a) * 1.15;
      y = -1.5 + Math.sin(a) * 0.85;
      sx = 0.065;
      sy = 0.065;
      sz = 0.065;
    }
  } else if (stage === 2) {
    x = (col - 5.5) * 0.65;
    y = (lane - 7.5) * 0.19;
    z = -1.4;
    sx = 0.58;
    sy = 0.013;
    sz = 0.025;
  } else if (stage === 3) {
    const n = i % 12,
      row = Math.floor(i / 12);
    x = (n - 5.5) * 0.16;
    y = (row - 7.5) * 0.12;
    z = (n % 3) * 0.025;
    sx = 0.145;
    sy = 0.045;
    sz = 0.23;
  } else if (stage === 4 || stage >= 12) {
    const app = Math.floor(i / 12),
      part = i % 12;
    const p = nodePosition(app, mobile, group, short);
    x = p[0];
    y = p[1];
    z = p[2];
    const kind = [0, 0, 1, 1, 3, 3, 0, 2, 1, 1, 3, 2, 0, 0, 3, 2][app];
    if (kind === 0) {
      x += ((part % 4) - 1.5) * 0.16;
      y += (Math.floor(part / 4) - 1) * 0.12;
      sx = 0.12;
      sy = 0.035;
    } else if (kind === 1) {
      const a = (part / 12) * Math.PI * 2;
      x += Math.cos(a) * 0.29;
      y += Math.sin(a) * 0.2;
      rz = a + Math.PI / 2;
      sx = 0.11;
      sy = 0.04;
    } else if (kind === 2) {
      x += (part - 5.5) * 0.065;
      y += Math.sin(part * 0.8) * 0.12;
      sx = 0.065;
      sy = 0.045;
      rz = Math.cos(part * 0.8) * 0.3;
    } else {
      x += ((part % 3) - 1) * 0.19;
      y += (Math.floor(part / 3) - 1.5) * 0.085;
      sx = 0.12;
      sy = 0.035;
      z += (part % 3) * 0.045;
    }
    sz = 0.12;
    if (app === 3) z += field(x - p[0], y - p[1]) * 0.15;
    if (app === 7) {
      const branch = Math.floor(part / 4),
        t = (part % 4) / 3;
      x = p[0] - 0.35 + t * 0.7;
      y = p[1] + (branch - 1) * 0.24 * smooth(t);
      rz = (branch - 1) * 0.25;
    }
    if (app === 4 || app === 10) {
      x = p[0] + (part < 6 ? -0.23 : 0.23);
      y = p[1] + (2.5 - (part % 6)) * 0.09;
      sx = 0.28;
      sy = 0.023;
    }
    if (app === 6 || app === 14) {
      const lane = Math.floor(part / 4),
        t = (part % 4) / 3;
      x = p[0] + (t - 0.5) * 0.65;
      y = p[1] + (lane - 1) * mix(0.25, 0.08, t);
      sx = 0.12;
      sy = 0.03;
    }
    if (mobile && stage >= 12 && GROUPS[app] !== group) sx = sy = sz = 0.0001;
    if (stage === 13) {
      x *= 1.35;
      y *= 1.3;
      z -= 4;
    }
  } else if (stage === 5 || stage === 6) {
    const side = i >= 96 ? 1 : 0,
      j = i % 96,
      row = Math.floor(j / 12),
      bit = j % 12;
    const order = [3, 0, 6, 2, 7, 1, 4, 5];
    x = (side ? 1.4 : -1.65) + (bit - 5.5) * 0.145;
    y = (3.5 - (stage === 5 && side ? order[row] : row)) * 0.44;
    z =
      stage === 5
        ? side
          ? -1.1
          : 0.8
        : side && (row === 2 || row === 5)
          ? 0.45
          : 0;
    sx = 0.135;
    sy = 0.11;
    sz = 0.095;
    if (
      stage === 6 &&
      ((side === 0 && row === 7) || (side === 1 && row === 6))
    ) {
      sx = 0.026;
      sy = 0.026;
    }
  } else if (stage === 7 || stage === 8 || stage === 9) {
    const a = i * 2.399963,
      r = Math.sqrt(i / COUNT) * 2.75;
    x = Math.cos(a) * r;
    y = Math.sin(a) * r;
    z = stage === 7 ? 0 : field(x, y) * 2.1 + 0.023;
    sx = sy = sz = stage === 7 ? 0.055 : 0.032;
  } else if (stage === 10) {
    const row = Math.floor(i / 24),
      j = i % 24,
      t = j / 23;
    x = -3 + t * 6;
    y = mix(0, (row - 3.5) * 0.51, smooth(t * 2));
    z = (row % 2) * 0.22;
    sx = 0.09;
    sy = 0.035;
    sz = 0.035;
    rz = t < 0.5 ? Math.atan2((row - 3.5) * 0.51, 3) : 0;
    if (row !== 3 && row !== 4) {
      sx *= 0.3;
      sy *= 0.5;
    }
  } else if (stage === 11) {
    const row = Math.floor(i / 24),
      t = (i % 24) / 23;
    x = (t - 0.5) * 6;
    y =
      (row - 3.5) * 0.46 +
      Math.sin(t * 18 + row) * 0.12 +
      Math.sin(t * 43 + row * 2) * 0.04;
    z = (row % 2) * 0.15;
    sx = 0.055;
    sy = 0.055;
    sz = 0.04;
  }
  return [x, y, z, sx, sy, sz, rz];
}
export function stageBlend(p) {
  const a = Math.floor(clamp(p, 0, 13)),
    b = Math.min(a + 1, 13);
  return [a, b, smooth(clamp((p - a - 0.2) / 0.64))];
}
