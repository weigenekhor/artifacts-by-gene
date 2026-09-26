import { mix, at, settle, clamp } from "./drawing.js";

export function usage(d, q, f, W, H, m, hit) {
  const { text, line, rect, dot, arc, alpha, ink, muted, faint, accent, teal } =
    d;
  const active = Math.min(2, Math.floor(f * 3)),
    compress = at(q, 0.42, 0.22),
    inspect = at(q, 0.72, 0.1),
    counts = [12, 18, 24];
  const left = W * 0.23,
    right = W * 0.91,
    span = right - left;
  for (let lane = 0; lane < 3; lane++) {
    const cy = H * (0.2 + lane * 0.28),
      count = counts[lane],
      chosen = lane === active;
    text(
      "Reactor " + "ABC"[lane],
      W * 0.04,
      cy - 22,
      m ? 24 : 21,
      chosen ? ink : muted,
    );
    line(
      [
        [left, cy + 20],
        [right, cy + 20],
      ],
      faint,
    );
    const reveal = inspect * (chosen ? 1 : 0);
    let delivered = 0;
    for (let i = 0; i < count; i++) {
      const t = at(q, 0.025 + i * 0.011 + lane * 0.02, 0.18);
      if (t > 0.999) delivered++;
      const hx = left + (span * (i + 0.5)) / 24,
        hy = cy - 14 + (i % 2) * 18;
      const tx = mix(hx, left + (span * count) / 24, compress),
        ty = mix(hy, cy, compress);
      const xx = mix(left - span * 0.25 - i * 3, mix(tx, hx, reveal), t),
        yy = mix(cy - H * 0.14, mix(ty, cy + 48 + (i % 2) * 20, reveal), t);
      alpha(
        at(q, 0.02 + i * 0.011 + lane * 0.02, 0.07) *
          (1 - compress * (1 - reveal) * 0.9),
        () => arc(xx, yy, m ? 5 : 4, teal, 1.4),
      );
    }
    alpha(compress, () => {
      rect(left, cy - 5, (span * delivered) / 24, 10, chosen ? accent : teal);
      dot(left + (span * delivered) / 24, cy, 5, chosen ? accent : teal);
      text(
        String(delivered),
        right,
        cy - 20,
        m ? 34 : 32,
        chosen ? accent : ink,
        "right",
      );
    });
    alpha(reveal, () =>
      line(
        [
          [left, cy + 37],
          [left, cy + 86],
          [left + span, cy + 86],
        ],
        faint,
      ),
    );
    hit(
      (lane + 0.5) / 3,
      W * 0.03,
      cy - H * 0.1,
      W * 0.93,
      H * 0.27,
      "Reactor " + "ABC"[lane],
    );
  }
  return (
    "Reactor " + "ABC"[active] + " · " + counts[active] + " illustrated events"
  );
}

export function pathfinder(d, q, f, W, H, m, hit) {
  const {
    text,
    line,
    rect,
    dot,
    trace,
    path,
    alpha,
    ink,
    muted,
    faint,
    accent,
    teal,
  } = d;
  const active = Math.min(2, Math.floor(f * 3));
  const columns = [
    ["Workcentre A", "Workcentre B"],
    ["Group 1", "Group 2", "Group 3", "Group 4"],
    ["Parameter A", "Parameter M", "Parameter Y"],
  ];
  const selected = [0, 1, active],
    gates = [at(q, 0.14, 0.15), at(q, 0.3, 0.16), at(q, 0.47, 0.14)];
  const positions = [];
  columns.forEach((names, col) => {
    const x = m ? W * (0.08 + col * 0.27) : W * (0.05 + col * 0.22),
      y = H * (m ? 0.16 : 0.22),
      ww = W * (m ? 0.24 : 0.18),
      rh = m ? H * 0.063 : H * 0.1;
    text(
      ["Workcentre", "Chart group", "Parameter"][col],
      x,
      y - 34,
      m ? 21 : 18,
      muted,
    );
    names.forEach((name, i) => {
      const selectedRow = selected[col] === i,
        yy = y + i * rh,
        visible = selectedRow ? 1 : 1 - gates[col] * 0.88;
      alpha(visible, () => {
        line(
          [
            [x, yy + rh * 0.72],
            [x + ww, yy + rh * 0.72],
          ],
          faint,
        );
        text(
          m ? name.split(" ").at(-1) : name,
          x + 10,
          yy + rh * 0.42,
          m ? 24 : 20,
          selectedRow ? ink : muted,
        );
      });
      if (selectedRow) {
        positions.push([x, yy + rh * 0.38, x + ww]);
        alpha(gates[col], () => {
          line(
            [
              [x, yy + 6],
              [x, yy + rh * 0.66],
            ],
            accent,
            2,
          );
          dot(x + ww - 4, yy + rh * 0.38, 3, accent);
        });
      }
      if (col === 2) hit((i + 0.5) / 3, x, yy, ww, rh, name);
    });
  });
  for (let i = 0; i < 2; i++)
    alpha(gates[i], () =>
      path(
        [positions[i][2], positions[i][1]],
        [positions[i + 1][0], positions[i + 1][1]],
        teal,
        1.2,
        gates[i + 1],
      ),
    );
  const appear = at(q, 0.62, 0.12),
    x = m ? W * 0.08 : W * 0.76,
    y = m ? H * 0.58 : H * 0.28,
    ww = m ? W * 0.84 : W * 0.21,
    hh = m ? H * 0.3 : H * 0.4;
  alpha(appear, () => {
    path([positions[2][2], positions[2][1]], [x, y + hh * 0.5], accent, 1.3);
    rect(x, y, ww, hh, d.wash, faint);
    text(
      "Parameter " + ["A", "M", "Y"][active],
      x + 15,
      y + 32,
      m ? 24 : 19,
      ink,
    );
    trace(x + 16, y + 50, ww - 32, hh - 70, active, appear, teal);
  });
  return "A / Group 2 / Parameter " + ["A", "M", "Y"][active];
}

export function diagnose(d, q, f, W, H, m, hit) {
  const {
    text,
    line,
    path,
    dot,
    trace,
    alpha,
    ink,
    muted,
    faint,
    accent,
    teal,
  } = d;
  const checks = ["Ceiling condition", "Optris settings", "LayTec / viewport"],
    active = Math.min(2, Math.floor(f * 3));
  const left = W * 0.04,
    plotW = W * (m ? 0.45 : 0.29),
    plotY = H * 0.3,
    midX = W * (m ? 0.55 : 0.47),
    endX = W * (m ? 0.74 : 0.76),
    narrow = at(q, 0.36, 0.26);
  text("Process", left, H * 0.18, 20, ink);
  text("Clean", left, H * 0.59, 20, ink);
  trace(left, plotY - H * 0.1, plotW, H * 0.2, 2, at(q, 0.015, 0.17), accent);
  trace(left, H * 0.61, plotW, H * 0.13, 0, at(q, 0.09, 0.17), teal);
  alpha(at(q, 0.16, 0.13), () => {
    text("TFB increased", left, H * 0.46, 16, accent);
    text("EpiTrueTemp comparable", left, H * 0.81, 16, muted);
  });
  const roots = [
    [left + plotW, plotY],
    [left + plotW, H * 0.67],
  ];
  for (let i = 0; i < 7; i++) {
    const g = i % 3,
      targetY = H * (0.21 + g * 0.255),
      rawY = H * (0.12 + i * 0.12),
      y = mix(rawY, targetY, narrow),
      kept = i < 3;
    alpha(
      at(q, 0.17 + i * 0.013, 0.15) * (kept ? 1 : 1 - narrow * 0.94),
      () => {
        roots.forEach((root, j) =>
          path(
            root,
            [midX, y],
            i === active ? accent : j ? teal : faint,
            i === active ? 2.1 : 0.8,
          ),
        );
        dot(midX, y, kept ? 4 : 2.5, kept ? muted : faint);
        path([midX, y], [endX, targetY], kept ? muted : faint, 1);
      },
    );
  }
  checks.forEach((check, i) => {
    const y = H * (0.21 + i * 0.255),
      chosen = i === active;
    alpha(at(q, 0.49 + i * 0.025, 0.13), () => {
      arcCheck(endX, y, chosen ? accent : muted);
      const words = m ? check.split(" ") : [check];
      words.forEach((word, k) =>
        text(word, endX + 15, y + k * 24, 18, chosen ? ink : muted),
      );
    });
    hit((i + 0.5) / 3, midX, y - H * 0.11, W - midX, H * 0.23, check);
  });
  function arcCheck(x, y, col) {
    d.arc(x, y, 6, col, 1.4);
  }
  alpha(at(q, 0.64, 0.1), () =>
    text(
      m ? "Recommended checks" : "Recommended checks · no confirmed cause",
      W * 0.5,
      H * 0.97,
      m ? 18 : 21,
      muted,
      "center",
    ),
  );
  return checks[active] + " · recommended check";
}

export function configuration(d, q, f, W, H, m, hit) {
  const {
    text,
    line,
    path,
    dot,
    rect,
    alpha,
    ink,
    muted,
    faint,
    accent,
    teal,
  } = d;
  const compact = at(q, 0.38, 0.24),
    align = at(q, 0.15, 0.22),
    active = Math.min(2, Math.floor(f * 3));
  const labels = ["Popup", "EnableShow", "Number"],
    values = [
      ["0", "—"],
      ["1", "0"],
      ["—", "−1"],
    ];
  for (let side = 0; side < 2; side++) {
    const x = W * (side ? 0.56 : 0.04),
      ww = W * 0.4,
      offset = (1 - align) * (side ? H * 0.09 : 0);
    text(side ? "Target" : "Reference", x, H * 0.055, 20, muted);
    text("Devices.XML", x, H * 0.12, 22, ink);
    for (let g = 0; g < 6; g++) {
      const chosen = g === 2,
        y =
          mix(H * (0.18 + g * 0.12), H * (0.17 + g * 0.025), compact) + offset;
      alpha(chosen ? 1 : 1 - compact * 0.85, () => {
        line(
          [
            [x + 6, H * 0.15],
            [x + 6, y],
            [x + 22, y],
          ],
          faint,
        );
        for (let k = 0; k < 4; k++) {
          const yy = y + 11 + k * 7 * (1 - compact),
            xx = x + ww * (0.22 + (k % 2) * 0.13);
          line(
            [
              [x + 22, y],
              [x + 22, yy],
              [xx, yy],
            ],
            faint,
          );
          dot(xx, yy, 2, teal);
        }
      });
    }
    const y = H * 0.43 + offset;
    alpha(at(q, 0.32, 0.18), () => {
      line(
        [
          [x + 6, H * 0.15],
          [x + 6, y],
          [x + 24, y],
        ],
        muted,
      );
      text("ExHeating", x + 24, y - 24, m ? 22 : 21, muted);
      text("EH35Fault", x + 24, y + 4, m ? 24 : 23, ink);
    });
    labels.forEach((name, i) => {
      const yy = H * (0.58 + i * 0.125) + offset,
        selected = i === active;
      alpha(at(q, 0.5 + i * 0.03, 0.12), () => {
        line(
          [
            [x + 24, y + 14],
            [x + 24, yy],
            [x + 39, yy],
          ],
          selected ? accent : faint,
        );
        text(name, x + 43, yy + 6, m ? 22 : 21, selected ? ink : muted);
        text(values[i][side], x + ww, yy + 6, 24, accent, "right");
        if (selected)
          line(
            [
              [x + 43, yy + 19],
              [x + ww, yy + 19],
            ],
            accent,
            1.2,
          );
      });
      hit((i + 0.5) / 3, x, yy - 28, ww, H * 0.12, name);
    });
  }
  alpha(at(q, 0.65, 0.1), () => {
    const y = H * (0.58 + active * 0.125);
    path([W * 0.445, y], [W * 0.56, y], accent, 1.3);
  });
  return labels[active] + " · " + values[active].join(" → ") + " / EH35Fault";
}
