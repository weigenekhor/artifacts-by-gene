export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const mix = (a, b, t) => a + (b - a) * t;
export const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
export const phase = (p, start, end) => smooth((p - start) / (end - start));

// Crop coordinates are normalized to the original screenshot, not the viewport.
// Limit magnification so a useful region remains in context.
export function frameFor(focus) {
  const scale = Math.min(1.75, 1 / Math.max(focus.width, focus.height));
  const x = clamp((.5 - focus.x - focus.width / 2) * scale, -(scale - 1) / 2, (scale - 1) / 2);
  const y = clamp((.5 - focus.y - focus.height / 2) * scale, -(scale - 1) / 2, (scale - 1) / 2);
  return { x, y, scale };
}
export function shotAt(beats, progress) {
  const position = clamp((progress - .12) / .73) * (beats.length - 1);
  const index = Math.min(beats.length - 1, Math.floor(position));
  const next = Math.min(index + 1, beats.length - 1);
  const t = phase(position - index, .16, .88);
  const a = frameFor(beats[index].focus), b = frameFor(beats[next].focus);
  return { index, next, a: beats[index], b: beats[next], t,
    frame: { x: mix(a.x,b.x,t), y: mix(a.y,b.y,t), scale: mix(a.scale,b.scale,t) } };
}

