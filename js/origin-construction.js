import { space, mix, ease } from "./space.js";
const phase = (p, s, l) => ease((p - s) / l);
const cyan = [53, 156, 173], cobalt = [73, 98, 199], coral = [218, 103, 69], amber = [219, 166, 67], ink = [34, 58, 65];
const blend = (a, b, t) => a.map((v, i) => mix(v, b[i], t));
// One persistent evidence surface: congestion, intervention, resolved structure, software.
// Values and geometry are illustrative engineering material, never application output.
export function drawOrigin(ctx, { width: w, height: h, p, px = 0, py = 0 }) {
  const m = w < 700, open = phase(p, 1.02, 0.64), strain = phase(p, 1.65, 0.55), release = phase(p, 2.35, 0.58), clarify = phase(p, 3.05, 0.63), widen = phase(p, 3.84, 0.55), unite = phase(p, 4.55, 0.64), home = phase(p, 5.25, 0.5);
  const dark = phase(p, 5.05, 0.7), paper = blend([235, 233, 223], [10, 17, 16], dark);
  ctx.fillStyle = `rgb(${paper.join(",")})`;
  ctx.fillRect(0, 0, w, h);
  const opacity = 1 - home;
  if (opacity < 1e-3) return;
  ctx.save();
  ctx.globalAlpha *= opacity;
  const scale = (m ? 0.69 : 0.78) * mix(1.3, 1, clarify) * mix(1, 0.92, widen) * mix(1, 0.7, unite);
  const g = space(ctx, {
    w,
    h,
    scale,
    cx: mix(0.54, 0.5, clarify),
    cy: m ? 0.44 : 0.49,
    yaw: mix(-0.42, 0.06, release) + px * 0.014 * (1 - unite),
    tilt: mix(0.81, 0.02, unite) + py * 9e-3
  });
  const cols = 32, rows = 18;
  function point(x, y) {
    const a = x / cols, b = y / rows;
    const sx = (a - 0.5) * 670, sy = (b - 0.5) * 395;
    const disruption = Math.sin(b * 18 + a * 3) * Math.sin(a * 11) * 65 * (1 - release);
    const twist = Math.sin(a * 6.3 + b * 2.6) * 100 * (1 - open) + strain * (1 - release) * Math.sin(b * 19) * 77;
    const depth = (1 - clarify) * (28 + Math.sin(a * 9 + b * 12) * 20) + twist;
    return [sx + disruption * (1 - clarify), sy + Math.sin(a * 14) * 18 * (1 - clarify), depth];
  }
  // The same cells retain their identity through the intervention; nothing resets.
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const value = (Math.sin(x * 0.37 + y * 0.17) + Math.cos(y * 0.47 - x * 0.21) + 2) / 4;
    const color = blend(cobalt, cyan, value), strength = mix(0.5, 1, release);
    const a = point(x, y), b = point(x + 1, y), c = point(x + 1, y + 1), d = point(x, y + 1);
    const gap = (1 - release) * (0.04 + strain * 0.18);
    const mx = (a[0] + c[0]) / 2, my = (a[1] + c[1]) / 2;
    const quad = [a, b, c, d].map((v) => [mix(v[0], mx, gap), mix(v[1], my, gap), v[2]]);
    g.poly(quad, color.map((v) => v * strength), mix(0.46, 0.85, release), false);
  }
  // Correctly aligned measurement references emerge from the surface, then stay.
  for (let row = 0; row < 5; row++) {
    const path = [];
    for (let x = 0; x < 70; x++) {
      const u = x / 69, pt = point(u * cols, (row + 1) * rows / 6);
      pt[2] += 14 + clarify * (Math.sin(u * 12 + row) * 17 + Math.cos(u * 26) * 6);
      path.push(pt);
    }
    g.line(path, [cyan, coral, amber, cobalt, ink][row], 2.1, clarify);
  }
  // Different retained capabilities: spatial field, comparison alignment, structured records.
  // They are raised from one shared surface, not another gallery of floating cards.
  const capability = phase(p, 3.8, 0.56) * (1 - unite);
  if (capability > 0) {
    for (let zone = 0; zone < 3; zone++) {
      const cx = -215 + zone * 215, z = 80 * capability;
      g.line([[cx - 82, -145, z], [cx - 82, 145, z]], blend(ink, cyan, zone * 0.2), 1, 0.55);
      if (zone === 0) {
        for (let r = 1; r < 8; r++) g.ring(cx, 0, z + 7, r * 11, [...cyan], 1);
        g.line([[cx - 68, 0, z + 8], [cx + 68, 0, z + 8]], amber, 2);
      } else if (zone === 1) {
        for (let i = 0; i < 7; i++) {
          const y = -96 + i * 30;
          g.line([[cx - 70, y, z + 7], [cx - 12, y, z + 7]], cyan, 2);
          g.line([[cx + 12, y, z + 7], [cx + 70, y, z + 7]], i === 3 ? coral : cyan, 2);
          g.line([[cx - 12, y, z + 7], [cx + 12, y, z + 7]], i === 3 ? coral : cyan, 1);
        }
      } else {
        for (let i = 0; i < 7; i++) for (let j = 0; j < 3; j++) g.box(cx - 52 + j * 51, -96 + i * 30, z + 4, 42, 18, 2, i === 4 ? amber : cyan);
      }
    }
  }
  if (unite > 0) {
    const z = 30 * (1 - unite);
    g.line([[-338, -201, z], [338, -201, z], [338, 201, z], [-338, 201, z], [-338, -201, z]], blend(ink, [163, 183, 174], dark), 1.5, unite);
  }
  g.draw();
  ctx.restore();
}
