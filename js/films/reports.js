import { mix, at, world, sheet, curve, colors as C } from "./drawing.js";
// Reference: 84baa04's source-to-workbook relationship, rebuilt in ee65f20's renderer.
const sources = ["PL / Plato", "LayTec", "XRR", "XRD"];
const readings = [[98, 100, 102], [49, 50, 51], [24, 25, 26], [39, 40, 41]];
export function compile(d, q, f, W, H, m, hit) {
  const active = Math.min(3, Math.floor(f * 4)), gather = at(q, 0.2, 0.36), format = at(q, 0.62, 0.18);
  const g = world(d, W, H, m, { scale: m ? 0.91 : 1.25, tilt: mix(0.72, 0.18, format), yaw: mix(-0.18, 0, gather), cy: 0.55 });
  sheet(g, 140, 0, -6, 340, 310, C.graphite);
  for (let s = 0; s < 4; s++) {
    const y = -113 + s * 76, t = at(q, 0.2 + s * 0.065, 0.23), col = [C.coral, C.cyan, C.violet, C.amber][s];
    g.label(sources[s], [-310, y - 26, 20], m ? 20 : 19, C.silver);
    curve(g, -310, y + 10, 12, 138, 70, s, at(q, s * 0.04, 0.18), col);
    const mean = readings[s].reduce((a, b) => a + b, 0) / 3;
    readings[s].forEach((value, j) => {
      const x = mix(-285 + j * 34, 27 + j * 73, t), yy = mix(y + 18, y, t), z = Math.sin(Math.PI * t) * 72 + 12;
      g.box(x, yy, z, 61, 43, 3, col);
      if (t > 0.97) g.label(String(value), [x, yy + 6, z + 5], m ? 20 : 19, [24, 38, 43], "center");
    });
    if (format > 0.2) {
      g.label(String(mean), [277, y + 7, 18], m ? 24 : 23, C.silver, "center");
      g.line([[0, y + 31, 12], [307, y + 31, 12]], s === active ? col : C.silver, 1, 0.6);
    }
    const p = g.project([140, y, 0]);
    hit((s + 0.5) / 4, 20, p[1] - 32, W - 40, 64, sources[s]);
  }
  g.draw();
  return sources[active] + " \xB7 " + readings[active].join(" + ") + " / 3 \u2192 " + readings[active].reduce((a, b) => a + b) / 3 + " \xB7 illustrative values";
}
export function report(d, q, f, W, H, m, hit, alternate = 0) {
  const extract = at(q, 0.12, 0.24), append = at(q, 0.42, 0.32) * (1 - alternate), hold = at(q, 0.76, 0.1);
  const g = world(d, W, H, m, { scale: m ? 0.9 : 1.28, tilt: mix(0.63, 0.17, hold), yaw: mix(-0.19, 0.03, append) });
  sheet(g, -183, -35, -7, 233, 257, C.graphite);
  sheet(g, 145, 0, -10, 333, 323, C.graphite);
  g.label("LayTec analysis", [-295, -186, 4], m ? 21 : 20, C.silver);
  g.label("Base workbook", [-18, -186, 4], m ? 21 : 20, C.silver);
  // Existing records are never moved, replaced or compressed.
  for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) {
    g.box(28 + col * 71, -125 + row * 43, 0, 64, 31, 2, C.graphite);
    g.line([[4 + col * 71, -125 + row * 43, 4], [45 + col * 71, -125 + row * 43, 4]], C.silver, 1, 0.6);
  }
  for (let row = 0; row < 3; row++) {
    const t = at(append, row * 0.13, 0.65), color = [C.cyan, C.amber, C.violet][row];
    for (let col = 0; col < 4; col++) {
      const x = mix(-264 + col * 54, 28 + col * 71, t), y = mix(-103 + row * 66, 17 + row * 44, t), z = extract * 12 + Math.sin(t * Math.PI) * 55;
      g.box(x, y, z, 47 + 17 * t, 31, 3, color);
      if (col === 0 && t > 0.96) g.label(["Step", "Zone", "\u03BB"][row], [x, y + 6, z + 5], m ? 18 : 16, [22, 39, 45], "center");
    }
  }
  g.draw();
  return alternate > 0.5 ? "Source retained" : "Append beneath existing rows \xB7 step, zone and wavelength context retained";
}
function monitor(d, q, f, W, H, m, hit, legacy2 = false, alternate = 0) {
  const rise = at(q, 0.06, 0.25), travel = at(q, 0.31, 0.29), overview = at(q, 0.66, 0.18), active = Math.min(5, Math.floor(f * 6));
  const g = world(d, W, H, m, { scale: (m ? 0.91 : 1.3) * mix(1.28, 1, overview), cy: mix(0.67, 0.54, overview), tilt: mix(0.74, 0.2, overview), yaw: legacy2 ? mix(0.16, 0.02, overview) : mix(-0.19, -0.02, overview) });
  const color = legacy2 ? C.violet : C.cyan, ink = [49, 72, 77], surface = [213, 223, 216];
  // One continuous sheet: chart regions share the same scroll coordinate.
  sheet(g, 0, 0, -6, 570, 360, surface);
  for (let i = 0; i < 6; i++) {
    const row = Math.floor(i / 2), col = i % 2, x = -263 + col * 284, y = -130 + row * 117;
    const displacement = (1 - overview) * travel * mix(90, -90, f), yy = y + displacement;
    const fail = i === 2 || i === 5;
    const start = at(q, 0.02 + i * 0.035, 0.22);
    g.line([[x, yy + 42, 4], [x + 244, yy + 42, 4]], ink, 0.5, 0.25);
    for (const b of [-24, 24]) g.line([[x, yy + b, 4], [x + 244, yy + b, 4]], C.coral, 0.8, 0.6);
    curve(g, x, yy, 6, 244, 87, i, start, fail ? C.coral : color, fail);
    g.label((legacy2 ? "Process " : "Parameter ") + String.fromCharCode(65 + i), [x, yy - 39, 8], m ? 18 : 16, ink);
    if (overview > 0.2) g.label(fail ? "FAIL" : "PASS", [x + 244, yy - 39, 8], m ? 18 : 16, fail ? [171, 63, 40] : [28, 111, 93], "right");
    if (i === active && overview > 0.5) g.line([[x, yy + 50, 6], [x + 244, yy + 50, 6]], color, 2);
    const p = g.project([x, yy, 5]);
    hit((i + 0.5) / 6, p[0], p[1] - 40, 240, 80, "Parameter " + String.fromCharCode(65 + i));
  }
  g.draw();
  return (legacy2 ? "Non-GaN processes" : "GaN parameters") + " \xB7 one scrollable canvas \xB7 pass/fail for every parameter";
}
export function spc(d, q, f, W, H, m, hit) {
  return monitor(d, q, f, W, H, m, hit, false);
}
export function legacy(d, q, f, W, H, m, hit, alternate) {
  return monitor(d, q, f, W, H, m, hit, true, alternate);
}
