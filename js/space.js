// Mathematical helpers retained for the approved opening.
export const clamp = (v) => Math.max(0, Math.min(1, v));
export const mix = (a, b, t) => a + (b - a) * t;
export const ease = (v) => {
  v = clamp(v);
  return v * v * v * (v * (v * 6 - 15) + 10);
};
