import { space } from "../space.js";
import { lens, at, mix, palette as P } from "./cinema.js";
export function usage(d, q, f, W, H, m, hit) {
  const s = lens(d, W, H, m, P.cyan),
    register = at(q, 0.1, 0.5),
    hold = at(q, 0.7, 0.12),
    active = Math.min(2, Math.floor(f * 3)),
    counts = [126, 168, 210];
  if (m) {
    for (let r = 0; r < 3; r++) {
      const y = H * (0.16 + r * 0.275),
        cols = 21,
        span = W * 0.69,
        step = span / cols;
      s.label("Reactor " + "ABC"[r], W * 0.06, y - 30, 25, s.ink);
      for (let e = 0; e < counts[r]; e++) {
        const t = at(q, 0.025 + e * 0.0014 + r * 0.026, 0.16),
          x = W * 0.06 + (e % cols) * step,
          yy = y + Math.floor(e / cols) * H * 0.013;
        s.alpha(t, () => s.arc(x, yy - (1 - t) * 40, step * 0.28, P.cyan, 0.9));
      }
      s.alpha(hold, () =>
        s.label(
          String(counts[r]),
          W * 0.94,
          y + H * 0.095,
          35,
          r === active ? P.cyan : s.ink,
          "right",
        ),
      );
      hit(
        (r + 0.5) / 3,
        W * 0.04,
        y - 45,
        W * 0.92,
        H * 0.22,
        "Reactor " + "ABC"[r],
      );
    }
    return (
      "Reactor " +
      "ABC"[active] +
      " · " +
      counts[active] +
      " illustrated completed wafers · maintenance context"
    );
  }
  const g = space(d.c, {
    w: W,
    h: H,
    scale: m ? 1.02 : 1.05,
    cy: 0.49,
    tilt: mix(0.98, 0.46, hold),
    yaw: mix(-0.28, 0.06, register),
  });
  for (let r = 0; r < 3; r++) {
    const x0 = -276 + r * 194;
    for (let e = 0; e < counts[r]; e++) {
      const col = e % 12,
        row = Math.floor(e / 12),
        t = at(q, 0.025 + e * 0.0014 + r * 0.026, 0.16),
        x = x0 + col * 13.5,
        y = -150 + row * 17;
      const z = (1 - t) * (60 + (e % 9) * 6);
      if (t > 0) {
        const points = Array.from({ length: 17 }, (_, j) => {
          const a = (j / 16) * Math.PI * 2;
          return [x + Math.cos(a) * 5.2, y + Math.sin(a) * 5.2, z];
        });
        g.poly(points.slice(0, -1), [55, 93, 104], t);
        g.line(points, [111, 182, 193], 0.65, t);
      }
    }
    const p = g.project([x0 + 74, 140, 0]);
    hit((r + 0.5) / 3, p[0] - 85, 30, 170, H - 60, "Reactor " + "ABC"[r]);
  }
  g.draw();
  for (let r = 0; r < 3; r++) {
    const x = W * (0.17 + r * 0.33);
    s.label("Reactor " + "ABC"[r], x, H * 0.065, m ? 21 : 23, s.ink, "center");
    s.alpha(hold, () =>
      s.label(
        String(counts[r]),
        x,
        H * 0.94,
        m ? 33 : 48,
        r === active ? P.cyan : s.ink,
        "center",
      ),
    );
  }
  return (
    "Reactor " +
    "ABC"[active] +
    " · " +
    counts[active] +
    " completed events in the illustrative record · maintenance indicator"
  );
}
export function pathfinder(d, q, f, W, H, m, hit) {
  const s = lens(d, W, H, m, P.blue),
    approach = at(q, 0.13, 0.3),
    target = at(q, 0.43, 0.24),
    arrive = at(q, 0.72, 0.12),
    chosen = Math.min(2, Math.floor(f * 3));
  // Recursively divided destinations occupy depth, then a single shortcut crosses it.
  const project = (x, y, z) => {
    const k = 900 / (900 + z);
    return [W * 0.5 + x * k, H * 0.49 + y * k, k];
  };
  const nodes = [];
  for (let depth = 3; depth >= 0; depth--) {
    const count = 2 ** (depth + 2),
      z = depth * 230 - mix(0, 330, approach) * (1 - target);
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2,
        rx = W * (m ? 0.56 : 0.6),
        ry = H * 0.48;
      const p = project(Math.cos(theta) * rx, Math.sin(theta) * ry, z),
        parent = project(
          Math.cos((Math.floor(i / 2) / (count / 2)) * Math.PI * 2) * rx * 0.7,
          Math.sin((Math.floor(i / 2) / (count / 2)) * Math.PI * 2) * ry * 0.7,
          z - 230,
        );
      nodes.push(p);
      s.line([p, parent], P.muted, 0.6, (1 - target * 0.86) * 0.55);
      s.point(p[0], p[1], 2.4 * p[2], P.muted);
    }
  }
  const tx = W * (m ? 0.67 : 0.71),
    ty = H * 0.35,
    start = [W * 0.13, H * 0.78];
  const route = Array.from({ length: 80 }, (_, i) => {
    const u = i / 79;
    return [
      mix(start[0], tx, u),
      mix(start[1], ty, u) - Math.sin(u * Math.PI) * H * 0.13,
    ];
  });
  s.path(route, P.blue, 2.4, target);
  s.alpha(target, () => {
    s.arc(tx, ty, 18 + 8 * (1 - arrive), P.blue, 1.2);
    s.point(tx, ty, 5, P.white);
  });
  const ww = W * (m ? 0.7 : 0.46),
    hh = H * 0.43,
    x = mix(tx, W * 0.5, arrive) - ww / 2,
    y = mix(ty, H * 0.49, arrive) - hh / 2;
  s.alpha(arrive, () => {
    s.surface(x, y, ww, hh);
    s.label("External SPC chart", x + 20, y + 32, 20, "#e5edf2");
    s.trace(x + 20, y + 45, ww - 40, hh - 70, chosen, 1, P.blue);
  });
  for (let i = 0; i < 3; i++)
    hit(
      (i + 0.5) / 3,
      W * 0.1 + i * W * 0.27,
      H * 0.79,
      W * 0.25,
      H * 0.15,
      "Parameter " + ["A", "M", "Y"][i],
    );
  return (
    "Parameter " +
    ["A", "M", "Y"][chosen] +
    " · direct shortcut to an external chart"
  );
}
export function diagnose(d, q, f, W, H, m, hit) {
  const s = lens(d, W, H, m, P.coral),
    evidence = at(q, 0.13, 0.32),
    reason = at(q, 0.39, 0.26),
    result = at(q, 0.71, 0.12),
    active = Math.min(2, Math.floor(f * 3));
  const checks = ["Ceiling condition", "Optris settings", "LayTec / viewport"];
  const g = space(d.c, {
    w: W,
    h: H,
    scale: m ? 1.02 : 1.22,
    cy: m ? mix(0.47, 0.3, result) : 0.52,
    cx: m ? 0.5 : mix(0.5, 0.34, result),
    tilt: mix(0.94, 0.68, reason),
    yaw: mix(-0.31, 0.14, reason),
  });
  // Independent observations alter the candidate field. Receding planes are rejected paths,
  // not causal links and never a claim that the reactor's fault has been proved.
  for (let i = 0; i < 7; i++) {
    const retained = i === 0 || i === 3 || i === 6,
      fade = retained ? 1 : 1 - reason;
    const y = (i - 3) * 44,
      z = retained ? evidence * 18 : -reason * 120;
    const pts = Array.from({ length: 90 }, (_, j) => {
      const u = j / 89,
        v =
          18 +
          Math.sin(u * 9 + i * 0.5) * 12 +
          Math.exp(-(((u - 0.62) * 17) ** 2)) * (i % 3 ? 18 : 72);
      return [-240 + u * 480, y, z + v];
    });
    for (let j = 0; j < pts.length - 1; j++)
      g.poly(
        [[pts[j][0], y, z], [pts[j + 1][0], y, z], pts[j + 1], pts[j]],
        i === 0 ? [196, 114, 114] : [65, 89, 107],
        fade * 0.25,
      );
    g.line(
      pts,
      i === 0 ? [212, 139, 135] : [118, 146, 161],
      i === 0 ? 2.2 : 1,
      fade,
    );
    if (retained && evidence > 0.5)
      g.dot(pts[55], 4, i === 0 ? [236, 198, 167] : [167, 191, 201]);
  }
  g.draw();
  s.alpha(1 - result, () =>
    s.label(
      "Temperature / gas / process / clean",
      W * 0.08,
      H * 0.94,
      m ? 21 : 24,
      s.muted,
    ),
  );
  s.alpha(result, () => {
    const x = m ? W * 0.08 : W * 0.65,
      top = m ? H * 0.61 : H * 0.25,
      step = m ? H * 0.125 : H * 0.19;
    s.label("Suggested checks", x, top - 36, 19, s.muted);
    checks.forEach((name, i) => {
      const y = top + i * step;
      s.label(name, x, y, m ? 23 : 25, i === active ? s.ink : s.muted);
      s.line(
        [
          [x, y + 18],
          [W * 0.94, y + 18],
        ],
        P.coral,
        1,
        i === active ? 0.8 : 0.18,
      );
      hit((i + 0.5) / 3, x, y - 28, W * 0.9 - x, 65, name);
    });
  });
  return (
    checks[active] +
    " · suggested investigation, not a confirmed physical cause"
  );
}
export function configuration(d, q, f, W, H, m, hit) {
  const s = lens(d, W, H, m, P.blue),
    align = at(q, 0.13, 0.3),
    quiet = at(q, 0.46, 0.17),
    report = at(q, 0.7, 0.13),
    active = Math.min(2, Math.floor(f * 3));
  const props = [
      "Name",
      "Type",
      "Popup",
      "EnableShow",
      "Number",
      "Group",
      "Description",
    ],
    order = [4, 0, 5, 2, 6, 1, 3];
  const ys = props.map((_, i) => H * (0.19 + i * 0.103));
  for (let side = 0; side < 2; side++) {
    const left = W * (side ? 0.55 : 0.07),
      ww = W * 0.37;
    s.alpha(1 - report, () =>
      s.label(side ? "Target" : "Reference", left, H * 0.08, 22, s.ink),
    );
    props.forEach((name, i) => {
      const y = mix(ys[side ? order[i] : i], ys[i], align),
        changed = i >= 2 && i <= 4;
      s.alpha((changed ? 1 : 1 - quiet * 0.83) * (1 - report), () => {
        if (!side || align > 0.995)
          s.label(
            name,
            left + 12,
            y,
            m ? 21 : 21,
            changed && quiet > 0.4
              ? i === 3
                ? P.blue
                : i === 2
                  ? P.coral
                  : P.cyan
              : s.muted,
          );
        s.line(
          [
            [left, y + 15],
            [left + ww, y + 15],
          ],
          changed && quiet > 0.4 ? P.blue : P.muted,
          0.8,
          0.5,
        );
      });
      if (side === 0)
        s.line(
          [
            [left + ww, y + 15],
            [W * 0.55, mix(ys[order[i]], ys[i], align) + 15],
          ],
          changed ? P.blue : P.muted,
          1,
          align * (changed ? 0.45 : 0.12),
        );
    });
  }
  s.alpha(report, () => {
    s.rect(
      W * 0.04,
      H * 0.14,
      W * 0.92,
      H * 0.79,
      d.ink === "#24352e" ? "#edf0e6" : "#0c141a",
    );
    s.label("ExHeating.EH35Fault", W * 0.08, H * 0.23, m ? 27 : 30, s.ink);
    const rows = [
      ["Popup", "0", "—", "Removed"],
      ["EnableShow", "1", "0", "Changed"],
      ["Number", "—", "−1", "Added"],
    ];
    rows.forEach((row, i) => {
      const y = H * (0.42 + i * 0.2),
        color = [P.coral, P.blue, P.cyan][i];
      s.label(row[0], W * 0.08, y, m ? 22 : 27, s.ink);
      s.label(row[1] + " → " + row[2], W * 0.8, y, m ? 23 : 29, color, "right");
      s.label(row[3], W * 0.08, y + 30, 18, color);
      s.line(
        [
          [W * 0.08, y + 48],
          [W * 0.89, y + 48],
        ],
        color,
        0.8,
        0.45,
      );
      hit((i + 0.5) / 3, W * 0.06, y - 30, W * 0.88, 80, row[0]);
    });
  });
  return (
    "ExHeating.EH35Fault · " +
    ["Popup removed", "EnableShow changed", "Number added"][active] +
    " · from the supplied comparison capture"
  );
}
