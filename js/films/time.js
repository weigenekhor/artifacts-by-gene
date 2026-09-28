import { mix, at, world, sheet, curve, colors as C } from "./drawing.js";
export function history(d, q, f, W, H, m, hit) {
  const resolve = at(q, 0.23, 0.34), lift = at(q, 0.62, 0.18), active = Math.min(4, Math.floor(f * 5));
  const g = world(d, W, H, m, { tilt: mix(0.82, 0.3, lift), yaw: mix(-0.3, 0.02, resolve), scale: m ? 0.83 : 1.18, cy: 0.48 });
  const status = ["Complete", "Partial", "Missing", "Excess", "Rerun"];
  for (let wafer = 0; wafer < 5; wafer++) {
    const x = (wafer - 2) * 112;
    g.disc(x, 88, -12, 40, 5, C.graphite);
    for (let e = 0; e < 5; e++) {
      const align = at(q, 0.16 + e * 0.033, 0.3);
      const xx = mix(x + Math.sin(wafer * 4 + e * 2) * 90, x, align), yy = mix(-170 + e * 43, -116 + e * 32, align);
      const z = mix(20 + (wafer * 3 + e) % 5 * 23, 4, align);
      const valid = wafer !== 2 && !(wafer === 1 && e > 2);
      if (valid) {
        g.box(xx, yy, z, 76, 18, 3, wafer === 3 ? C.coral : wafer === 4 ? C.violet : C.cyan);
      } else g.line([[xx - 38, yy, z], [xx + 38, yy, z]], C.silver, 0.8, 0.35);
      if (wafer === 3 && e === 4) g.box(xx, yy, z + 8, 76, 18, 3, C.coral);
    }
    const h = [20, 11, 0, 30, 22][wafer] * lift;
    if (h) g.disc(x, 88, -6, 37, h, wafer === 1 || wafer === 3 ? C.coral : wafer === 4 ? C.violet : C.cyan);
    g.label("W" + String(wafer + 1).padStart(2, "0"), [x, 151, 5], m ? 20 : 18, C.silver, "center");
    const p = g.project([x, 0, 5]);
    hit((wafer + 0.5) / 5, p[0] - 50, p[1] - 95, 100, 190, status[wafer]);
    if (wafer === active && lift > 0.5) g.ring(x, 88, h, 46, C.amber, 2);
  }
  g.draw();
  d.alpha(lift, () => d.text(status[active], W * 0.5, H * 0.08, 26, d.ink, "center"));
  return "Wafer " + (active + 1) + " \xB7 " + status[active] + " deposition \xB7 illustrative lot";
}
export function schedule(d, q, f, W, H, m, hit) {
  const find = at(q, 0.14, 0.22), calculate = at(q, 0.41, 0.22), lock = at(q, 0.7, 0.12);
  const g = world(d, W, H, m, { tilt: mix(0.68, 0.22, lock), yaw: mix(-0.18, 0.02, calculate), scale: m ? 0.93 : 1.36 });
  const selected = Math.min(2, Math.floor(f * 3));
  for (let r = 0; r < 3; r++) {
    const y = (r - 1) * 116;
    for (let e = 0; e < 8; e++) {
      const match = e === [2, 4, 3][r], x = -285 + e * 64;
      const z = mix(e % 3 * 12, match ? 37 : -40, find);
      g.box(x, y, z, 36, 46, 4, match ? C.cyan : C.graphite);
      if (match) {
        g.line([[x, y, z + 5], [mix(x, 220, calculate), y, z + 5]], C.cyan, 2);
        g.box(mix(x, 220, calculate), y, mix(z, 8, calculate), 42, 48, 5, C.emerald);
        g.label("Next check", [220, y + 47, 10], m ? 19 : 18, C.silver, "center");
      }
    }
    g.label("Reactor " + "ABC"[r], [-295, y - 40, 10], m ? 21 : 19, C.silver);
    if (selected === r) g.line([[-285, y + 65, 10], [250, y + 65, 10]], C.amber, 1.5);
    const p = g.project([0, y, 10]);
    hit((r + 0.5) / 3, 40, p[1] - 40, W - 80, 80, "Reactor " + "ABC"[r]);
  }
  g.draw();
  d.alpha(calculate, () => d.text("Valid check \u2192 next due", W * 0.5, H * 0.07, 22, d.ink, "center"));
  return "Reactor " + "ABC"[selected] + " \xB7 next check derived from valid ANKO history";
}
export function planning(d, q, f, W, H, m, hit) {
  const g = world(d, W, H, m, { tilt: mix(0.72, 0.25, at(q, 0.48, 0.3)), yaw: mix(0.16, -0.05, at(q, 0.2, 0.5)), scale: m ? 0.91 : 1.32 });
  const active = Math.min(2, Math.floor(f * 3)), names = ["ALTUS", "AIXTRON", "LAYTEC"];
  for (let r = 0; r < 3; r++) {
    const y = (r - 1) * 118;
    g.label(names[r], [-293, y - 40, 12], m ? 22 : 20, C.silver);
    for (let i = 0; i < 6; i++) {
      const x = -255 + i * 76, passed = i !== 2 && i !== 4 && !(r === 1 && i === 5), t = at(q, 0.1 + i * 0.047 + r * 0.025, 0.18);
      const z = mix(66, -4, t);
      g.box(x, y, z, 55, 50, 6, passed ? C.emerald : C.coral);
      if (passed && t > 0.7) g.line([[x - 12, y, z + 7], [x - 2, y + 9, z + 7], [x + 15, y - 11, z + 7]], C.silver, 2);
      if (!passed) g.line([[x - 9, y - 9, z + 7], [x + 9, y + 9, z + 7]], C.silver, 2);
    }
    const due = at(q, 0.56 + r * 0.045, 0.17);
    // A date is issued only after a passing check; a failed check stays unresolved.
    g.box(240, y, 5, 63, 58, 6, r === 1 ? C.coral : C.cyan);
    if (due > 0.5) g.label(r === 1 ? "Review" : "Due", [240, y + 8, 14], m ? 21 : 20, C.silver, "center");
    g.line([[160, y, 6], [160 + 55 * due, y, 6]], r === 1 ? C.coral : C.cyan, 2);
    if (active === r) g.line([[-288, y + 52, 5], [274, y + 52, 5]], C.amber, 1.3);
    const p = g.project([0, y, 0]);
    hit((r + 0.5) / 3, 30, p[1] - 45, W - 60, 90, names[r]);
  }
  g.draw();
  return names[active] + " \xB7 " + (active === 1 ? "failed check requires review" : "next date follows a valid pass");
}
export function signals(d, q, f, W, H, m, hit, alternate = 0) {
  const gather = at(q, 0.17, 0.33), pin = at(q, 0.52, 0.18), range = at(q, 0.68, 0.13), names = ["Flow A", "Flow B", "Throttle Valve angle", "Pressure", "Temperature"];
  const g = world(d, W, H, m, { tilt: mix(0.85, 0.16, at(q, 0.56, 0.2)), yaw: mix(-0.19, 0, gather), scale: m ? 0.88 : 1.2, cy: 0.52 });
  const cursor = mix(-170, 220, f), colors = [C.cyan, C.cobalt, C.amber, C.violet, C.coral];
  names.forEach((name, i) => {
    const y = (i - 2) * 69, offset = (1 - gather) * (i % 2 ? 65 : -65), z = (1 - gather) * (i - 2) * 25;
    sheet(g, 0, y, z, 610, 56, C.graphite);
    curve(g, -205 + offset, y, z + 5, 445, 75, i, at(q, i * 0.025, 0.18), colors[i]);
    if (pin > 0.5 && i < 2) g.dot([-276, y, z + 7], 4, colors[i]);
    g.label(m ? ["Flow A", "Flow B", "Valve angle", "Pressure", "Temp."][i] : name, [-280, y - 23, z + 6], m ? 18 : 17, C.silver);
    if (range > 0) {
      const half = mix(50, 105, alternate);
      g.poly([[cursor - half, y - 24, z + 8], [cursor + half, y - 24, z + 8], [cursor + half, y + 24, z + 8], [cursor - half, y + 24, z + 8]], C.cyan, 0.1 * range);
      g.line([[cursor, y - 24, z + 10], [cursor, y + 24, z + 10]], C.amber, 1.5);
      g.dot([cursor, y + 12 * Math.sin(f * 13 + i), z + 11], 3, colors[i]);
    }
  });
  g.draw();
  return "Shared interval \xB7 linked traces \xB7 Flow A and Flow B pinned";
}
