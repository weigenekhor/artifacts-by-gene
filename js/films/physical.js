import { baseplateExample, temperatureSpan } from '../baseplate-example.js';
import { mix, at, world, colors as C } from "./drawing.js";
// The two physical exchanges follow the independently tested illustrative temperature fixture.
const seats = Array.from({ length: 5 }, (_, i) => {
  const a = i * Math.PI * 2 / 5 - Math.PI / 2;
  return [Math.cos(a) * 154, Math.sin(a) * 154];
});
export function arrange(d, q, f, W, H, m, hit, alternate = 0) {
  const first = at(q, 0.19, 0.23) * (1 - alternate), second = at(q, 0.49, 0.24) * (1 - alternate);
  const g = world(d, W, H, m, { scale: m ? 0.8 : 1.08, tilt: mix(0.3, 0.73, at(q, 0.05, 0.15)), yaw: mix(0.04, -0.16, at(q, 0.35, 0.4)), cy: 0.5 });
  g.disc(0, 0, -22, 225, 16, C.graphite);
  seats.forEach(([x, y], i) => {
    g.ring(x, y, -4, 60, C.silver, 0.8);
    g.label("S" + (i + 1), [x * 1.5, y * 1.5, 0], m ? 19 : 17, C.silver, "center");
  });
  const positions = seats.map((v) => [...v, 0]);
  function exchange(a, b, t) {
    for (const [from, to, sign] of [[a, b, 1], [b, a, -1]]) {
      const A = seats[from], B = seats[to], arc = Math.sin(Math.PI * t);
      positions[from] = [mix(A[0], B[0], t) + arc * sign * 34, mix(A[1], B[1], t), arc * (sign > 0 ? 116 : 74)];
    }
  }
  exchange(2, 4, first);
  exchange(0, 1, second);
  const active = Math.min(4, Math.floor(f * 5));
  const state = second > .98 ? 2 : first > .98 ? 1 : 0;
  positions.forEach(([x, y, z], i) => {
    const moving = i === 2 || i === 4 ? first : i === 0 || i === 1 ? second : 1;
    const hue = i === 2 || i === 4 ? C.cyan : i === 0 || i === 1 ? C.coral : C.cobalt;
    const finish = at(second, .92, .08);
    const material = hue.map((v,k)=>mix(v,C.emerald[k],finish));
    g.disc(x, y, z, 54, 9, material);
    g.ring(x, y, z + 10, 44, hue, 1.3);
    if (i === active) g.ring(x, y, z + 11, 58, C.amber, 2);
    g.label("BP" + (i + 1), [x, y, z + 13], m ? 20 : 18, C.silver, "center");
    const p = g.project([x, y, z]);
    hit((i + 0.5) / 5, p[0] - 45, p[1] - 35, 90, 70, "BP" + (i + 1));
    if (moving > 0 && moving < 1) g.line([[x, y, -3], [x, y, z]], hue, 1, 0.4);
  });
  g.draw();
  const step = second > 0.98 ? "Assignment settled" : second > 0 ? "BP1 \u2194 BP2" : first > 0.98 ? "First exchange settled" : first > 0 ? "BP3 \u2194 BP5" : "Weights \xD7 slot temperatures";
  d.text(step, W * 0.5, H * 0.09, m ? 24 : 22, d.ink, "center");
  return "BP" + (active + 1) + " · illustrative ΔT: " + temperatureSpan(baseplateExample.states[state]) + " °C · synthetic temperature example";
}
export function zones(d, q, f, W, H, m, hit) {
  const active = Math.min(4, Math.floor(f * 5)), enter = at(q, 0.03, 0.18), inner = at(q, 0.22, 0.22), outer = at(q, 0.51, 0.22);
  const g = world(d, W, H, m, { scale: m ? 0.84 : 1.16, tilt: mix(0.68, 0.38, at(q, 0.58, 0.24)), yaw: mix(-0.22, 0.04, at(q, 0.25, 0.5)), cy: 0.48 });
  g.disc(0, 0, -21, 228, 13, C.graphite);
  seats.forEach(([x, y], i) => {
    const z = (1 - enter) * 50;
    g.disc(x, y, z, 58, 4, C.cobalt);
    for (let r = 0; r < 4; r++) g.ring(x, y, z + 5, 20 + r * 10, C.silver, 0.5);
    g.label("S" + (i + 1), [x * 1.5, y * 1.5, 3], m ? 20 : 18, C.silver, "center");
    const p = g.project([x, y, z]);
    hit((i + 0.5) / 5, p[0] - 40, p[1] - 35, 80, 70, "S" + (i + 1));
  });
  // The measurement tracks intersect the real five-wafer carrier geometry.
  for (const [radius, phase, color, anchor] of [[126, inner, C.cyan, -0.94], [179, outer, C.emerald, 0.39]]) {
    g.ring(0, 0, 8, radius, color, 1.5, anchor, anchor + Math.PI * 2 * phase);
    if (phase > 0) {
      const a = anchor + Math.PI * 2 * phase;
      g.line([[0, 0, 12], [Math.cos(a) * radius, Math.sin(a) * radius, 12]], color, 1.5);
      g.dot([Math.cos(a) * radius, Math.sin(a) * radius, 12], 5, color);
    }
    if (phase > 0.6) {
      const [x, y] = seats[active];
      const a = Math.atan2(y, x), span = 0.24 * at(phase, 0.6, 0.4);
      for (let i = 0; i < 28; i++) {
        const a0 = a - span + i * span * 2 / 28, a1 = a0 + span * 2 / 28;
        g.poly([[Math.cos(a0) * (radius - 9), Math.sin(a0) * (radius - 9), 10], [Math.cos(a0) * (radius + 9), Math.sin(a0) * (radius + 9), 10], [Math.cos(a1) * (radius + 9), Math.sin(a1) * (radius + 9), 10], [Math.cos(a1) * (radius - 9), Math.sin(a1) * (radius - 9), 10]], color, 0.85);
      }
    }
  }
  g.draw();
  d.text("Inner window", W * 0.25, H * 0.08, 21, "#47cdd8", "center");
  d.text("Outer window", W * 0.75, H * 0.08, 21, "#53cba7", "center");
  return "S" + (active + 1) + " \xB7 inner and outer LayTec measurement regions";
}
