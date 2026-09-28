import { mix, at, world, sheet, curve, colors as C } from "./drawing.js";
export function usage(d, q, f, W, H, m, hit) {
  const active = Math.min(2, Math.floor(f * 3)), counts = [12, 18, 24];
  const g = world(d, W, H, m, { scale: m ? 0.83 : 1.22, tilt: mix(0.78, 0.5, at(q, 0.55, 0.25)), yaw: mix(-0.23, 0.1, at(q, 0.24, 0.5)), cy: 0.57 });
  for (let r = 0; r < 3; r++) {
    const x = (r - 1) * 207, color = [C.cyan, C.cobalt, C.coral][r];
    g.disc(x, 24, -18, 81, 12, C.graphite);
    let delivered = 0;
    for (let wafer = 0; wafer < counts[r]; wafer++) {
      const t = at(q, 0.025 + wafer * 0.018 + r * 0.025, 0.16), z = mix(240 + wafer * 4, wafer * 4, t);
      if (t > 0.995) delivered++;
      if (t > 0 && t < 0.995) g.disc(x + (1 - t) * (r - 1) * 55, 24 - (1 - t) * 185, z, 65, 2, color);
    }
    if (delivered) {
      g.disc(x, 24, 0, 65, delivered * 4, color);
      for (let n = 1; n < delivered; n++) g.ring(x, 24, n * 4, 65, C.silver, 0.5);
    }
    g.label("Reactor " + "ABC"[r], [x, 148, 0], m ? 22 : 20, C.silver, "center");
    g.label(String(delivered), [x, 24, counts[r] * 4 + 65], m ? 36 : 32, C.silver, "center");
    if (active === r) g.ring(x, 24, -2, 87, C.amber, 2);
    const p = g.project([x, 24, 60]);
    hit((r + 0.5) / 3, p[0] - 70, p[1] - 110, 140, 220, "Reactor " + "ABC"[r]);
  }
  g.draw();
  return "Reactor " + "ABC"[active] + " \xB7 " + counts[active] + " illustrated wafers \xB7 preventive-maintenance indicator";
}
export function pathfinder(d, q, f, W, H, m, hit) {
  const open = at(q, 0.1, 0.25), bypass = at(q, 0.39, 0.27), arrive = at(q, 0.68, 0.15), active = Math.min(2, Math.floor(f * 3));
  const g = world(d, W, H, m, { scale: m ? 0.88 : 1.32, tilt: mix(0.66, 0.12, arrive), yaw: mix(-0.24, 0, bypass), cy: 0.54 });
  for (let level = 0; level < 3; level++) {
    const x2 = -240 + level * 160, y2 = -100 + level * 78, z2 = (1 - bypass) * level * 45;
    const retreat = bypass * (level < 2 ? 155 : 0);
    for (let row = 0; row < 4; row++) {
      const yy = y2 + row * 34 - retreat, selected = row === [0, 1, active][level];
      g.line([[x2 - 52, yy, z2], [x2 + 52, yy, z2]], selected ? C.cyan : C.silver, selected ? 2 : 1, selected ? 1 : 0.23);
      if (selected) g.dot([x2 - 52, yy, z2], 3, C.cyan);
    }
  }
  const x = mix(-205, 135, bypass), y = mix(165, 15, bypass), z = mix(6, 32, bypass);
  sheet(g, x, y, z, 230, 145, C.graphite);
  curve(g, x - 97, y, z + 5, 192, 100, active, arrive, C.cyan);
  const a = g.project([-245, 150, 12]), b = g.project([x - 115, y, z + 5]);
  g.draw();
  d.alpha(open, () => {
    d.text("Workcentre", W * 0.06, H * 0.12, 20, d.muted);
    d.text("Chart group", W * 0.39, H * 0.12, 20, d.muted);
    d.text("Parameter", W * 0.72, H * 0.12, 20, d.muted);
  });
  d.alpha(bypass, () => d.path(a, b, "#42b8bc", 2.4, bypass));
  for (let i = 0; i < 3; i++) hit((i + 0.5) / 3, W * (0.1 + i * 0.28), H * 0.72, W * 0.26, H * 0.15, "Parameter " + ["A", "M", "Y"][i]);
  return "Direct shortcut \xB7 Parameter " + ["A", "M", "Y"][active] + " \xB7 external SPC chart";
}
export function diagnose(d, q, f, W, H, m, hit) {
  const evidence = at(q, 0.04, 0.2), reason = at(q, 0.28, 0.29), answer = at(q, 0.62, 0.17), active = Math.min(2, Math.floor(f * 3));
  const g = world(d, W, H, m, { scale: m ? 0.94 : 1.28, tilt: mix(0.74, 0.24, answer), yaw: mix(-0.25, 0.04, reason), cy: 0.58 });
  const colors = [C.coral, C.cyan];
  for (let source = 0; source < 2; source++) {
    const y = -124 + source * 104;
    sheet(g, -145, y, 28, 290, 77, C.graphite);
    curve(g, -270, y, 34, 250, 100, source, evidence, colors[source], source === 0);
    g.label(source ? "Clean" : "Process", [-275, y - 48, 33], m ? 22 : 20, C.silver);
    for (let branch = 0; branch < 3; branch++) {
      const t = at(q, 0.28 + branch * 0.055, 0.25), yy = -125 + branch * 118;
      g.line([[-2, y, 33], [74, y, 33], [74, yy, 33], [74 + 90 * t, yy, 33]], colors[source], 1.2, 0.4);
    }
  }
  const checks = ["Ceiling", "Optris", "Viewport"];
  checks.forEach((name, i) => {
    const y = -125 + i * 118, z = 8 + answer * 22;
    g.disc(193, y, z, 30, 5, i === active ? C.amber : C.cobalt);
    if (answer > 0.3) g.label(name, [193, y + 58, z + 6], m ? 21 : 20, C.silver, "center");
    if (i === active) g.ring(193, y, z + 7, 40, C.amber, 1.5);
    const p = g.project([193, y, z]);
    hit((i + 0.5) / 3, p[0] - 70, p[1] - 42, 140, 84, name);
  });
  g.draw();
  return ["Ceiling condition", "Optris settings", "LayTec / viewport"][active] + " \xB7 suggested investigation, not a confirmed fault";
}
export function configuration(d, q, f, W, H, m, hit) {
  const align = at(q, 0.12, 0.29), compare = at(q, 0.43, 0.18), report = at(q, 0.69, 0.14), active = Math.min(2, Math.floor(f * 3));
  const g = world(d, W, H, m, { scale: m ? 0.91 : 1.35, tilt: mix(0.72, 0.15, report), yaw: mix(-0.13, 0, align), cy: 0.56 });
  for (let side = 0; side < 2; side++) {
    const x = side ? 140 : -170;
    g.label(side ? "Target reactor" : "Reference reactor", [x - 105, -175, 10], m ? 20 : 19, C.silver);
    for (let row = 0; row < 8; row++) {
      const y = -130 + row * 37 + (1 - align) * (side ? (row * 3 % 8 - row) * 37 : 0), z = (1 - align) * (row % 3) * 12;
      g.line([[x - 96, y - 13, z], [x - 96, y, z], [x - 62, y, z]], C.silver, 0.8, 0.6);
      const selected = row === 3 || row === 5 || row === 6;
      g.box(x, y, z, 130, 18, 2, selected && compare > 0.1 ? C.coral : C.graphite);
      g.line([[x - 45, y, z + 4], [x + 45, y, z + 4]], selected ? C.coral : C.cyan, 1.3);
      if (side === 0 && align > 0.5) g.line([[x + 65, y, z], [140 - 65, y, z]], selected ? C.coral : C.silver, 1, 0.18 + compare * 0.27);
    }
  }
  g.draw();
  d.alpha(report, () => {
    const labels = ["Popup  0 \u2192 missing", "EnableShow  1 \u2192 0", "Number  missing \u2192 \u22121"];
    d.text(labels[active], W * 0.5, H * 0.91, m ? 23 : 22, d.ink, "center");
  });
  for (let i = 0; i < 3; i++) hit((i + 0.5) / 3, W * 0.12, H * (0.32 + i * 0.16), W * 0.76, H * 0.15, ["Popup", "EnableShow", "Number"][i]);
  return "devices.xml \xB7 EH35Fault \xB7 " + ["Popup", "EnableShow", "Number"][active] + " \xB7 difference retained in report";
}
