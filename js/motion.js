export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const mix = (a, b, t) => a + (b - a) * t;
export const smooth = (x) => {
  x = clamp(x);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
export const MOTION = {
  scroll: 65,
  camera: 190,
  structure: 120,
  pointer: 240,
  micro: 160,
};
export const damp = (a, b, dt, tau) => mix(a, b, 1 - Math.exp(-dt / tau));
export const interval = (p, a, b) => smooth((p - a) / (b - a));
export const bell = (p, a, b, c, d) =>
  interval(p, a, b) * (1 - interval(p, c, d));
export const LAST = 13;
