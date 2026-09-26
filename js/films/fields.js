import { mix, at, settle, clamp } from "./drawing.js";

export function usage(d, q, f, W, H, m, hit) {
  const { text, line, dot, arc, alpha, muted, ink, faint, accent, teal } = d;
  const count = 60,
    compression = at(q, 0.4, 0.24),
    active = Math.min(2, Math.floor(f * 3));
  for (let lane = 0; lane < 3; lane++) {
    const cx = m ? W * 0.55 : W * (0.19 + lane * 0.31),
      cy = m ? H * (0.19 + lane * 0.28) : H * 0.55;
    const r = m ? H * 0.075 : W * 0.09,
      flowStart = m ? [W * 0.07, cy] : [cx, H * 0.09];
    let delivered = 0;
    for (let i = 0; i < count; i++) {
      const travel = clamp((q - 0.035 - i * 0.004 - lane * 0.018) / 0.23),
        arrived = travel >= 1;
      if (arrived) delivered++;
      const ringA = -Math.PI / 2 + (i / count) * Math.PI * 2;
      const pile = [
        cx + ((i % 10) - 4.5) * 7,
        cy + (Math.floor(i / 10) - 2.5) * 7,
      ];
      const target = [cx + Math.cos(ringA) * r, cy + Math.sin(ringA) * r];
      const unpack = lane === active ? at(q, 0.7, 0.08) * 0.68 : 0;
      const compress = mix(compression, 0, unpack);
      const destination = [
        mix(pile[0], target[0], compress),
        mix(pile[1], target[1], compress),
      ];
      const x = mix(flowStart[0] + (i % 3) * 6, destination[0], travel),
        y = mix(flowStart[1] - i * 2, destination[1], travel);
      alpha(at(q, 0.015 + i * 0.004, 0.035), () => {
        arc(
          x,
          y,
          arrived ? mix(2.8, 2.1, compress) : 3.4,
          arrived ? teal : muted,
          1.1,
        );
      });
    }
    alpha(at(q, 0.28, 0.16), () => arc(cx, cy, r + 9, faint, 1));
    alpha(compression, () => {
      text(
        String(delivered),
        cx,
        cy + 10,
        m ? 28 : 42,
        active === lane ? accent : ink,
        "center",
      );
      text("illustrated events", cx, cy + r + 42, 16, muted, "center");
      text("Reactor " + "ABC"[lane], cx, cy - r - 34, 21, ink, "center");
    });
    alpha(at(q, 0.61, 0.12), () => {
      arc(
        cx,
        cy,
        r + 20,
        active === lane ? accent : faint,
        active === lane ? 2 : 1,
        -Math.PI * 0.65,
        Math.PI * 0.65,
      );
    });
    hit(
      (lane + 0.5) / 3,
      cx - r - 30,
      cy - r - 30,
      r * 2 + 60,
      r * 2 + 60,
      "Reactor " + "ABC"[lane],
    );
  }
  alpha(at(q, 0.63, 0.1), () =>
    text(
      "Historical activity stays behind the count.",
      W * 0.5,
      H * 0.97,
      20,
      muted,
      "center",
    ),
  );
  return "Reactor " + "ABC"[active] + " · activity behind its usage state";
}

export function pathfinder(d, q, f, W, H, m, hit) {
  const {
    text,
    line,
    path,
    dot,
    rect,
    trace,
    alpha,
    ink,
    muted,
    faint,
    accent,
    teal,
  } = d;
  const narrow = at(q, 0.24, 0.37),
    chart = at(q, 0.61, 0.13),
    active = Math.min(4, Math.floor(f * 5)),
    recall = q > 0.75 && active < 2;
  const root = [W * 0.05, H * 0.48],
    wcX = W * 0.24,
    groupX = W * 0.45,
    paramX = W * 0.68;
  const selectedWC = 0,
    selectedGroup = 1,
    selectedParam = Math.max(0, active - 2);
  dot(...root, 5, ink);
  for (let wc = 0; wc < 2; wc++) {
    const yy = H * (0.25 + wc * 0.46),
      selected = wc === selectedWC,
      opacity = selected ? 1 : 1 - at(q, 0.25, 0.14) * (recall ? 0.65 : 0.94);
    alpha(opacity, () => {
      path(root, [wcX, yy], selected ? teal : faint, 1.3, at(q, 0.02, 0.14));
      dot(wcX, yy, 5, teal);
      text("Workcentre " + "AB"[wc], wcX, yy - 23, 17, muted, "center");
      for (let g = 0; g < 3; g++) {
        const y = yy + (g - 1) * H * 0.12,
          keep = selected && g === selectedGroup,
          fade = keep ? 1 : 1 - at(q, 0.35, 0.15) * (recall ? 0.35 : 0.95);
        alpha(fade, () => {
          path(
            [wcX, yy],
            [groupX, y],
            keep ? accent : faint,
            1.2,
            at(q, 0.06 + g * 0.018, 0.17),
          );
          dot(groupX, y, 4, keep ? accent : muted);
          if (keep || q < 0.38)
            text("Group " + (g + 1), groupX, y - 17, 16, muted, "center");
          for (let j = 0; j < 3; j++) {
            const py = y + (j - 1) * H * 0.033,
              target = keep && j === selectedParam;
            alpha(target ? 1 : 1 - at(q, 0.46, 0.15) * 0.9, () => {
              path(
                [groupX, y],
                [paramX, py],
                target ? accent : faint,
                1.4,
                at(q, 0.13 + j * 0.015, 0.2),
              );
              dot(paramX, py, target ? 5 : 2.5, target ? accent : muted);
            });
          }
        });
      }
    });
  }
  const y = H * 0.25 + (selectedParam - 1) * H * 0.033;
  alpha(chart, () => {
    const x = m ? W * 0.34 : W * 0.75,
      yy = m ? H * 0.67 : H * 0.47,
      ww = m ? W * 0.6 : W * 0.22,
      hh = H * 0.27;
    path([paramX, y], [x + ww * 0.12, yy], accent, 1.7);
    rect(x, yy, ww, hh, null, faint);
    trace(x + 12, yy + 20, ww - 24, hh - 35, selectedParam, chart, teal);
    text("Parameter " + ["A", "M", "Y"][selectedParam], x, yy - 18, 19, ink);
  });
  for (let i = 0; i < 5; i++)
    hit(
      (i + 0.5) / 5,
      W * (0.1 + i * 0.16),
      H * 0.09,
      W * 0.16,
      H * 0.8,
      [
        "Workcentre",
        "Chart group",
        "Parameter A",
        "Parameter M",
        "Parameter Y",
      ][i],
    );
  return [
    "Recall the workcentre branches",
    "Recall the chart groups",
    "Parameter A",
    "Parameter M",
    "Parameter Y",
  ][active];
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
            i === active ? 1.7 : 0.9,
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
      text("CHECK", endX + 15, y + (m ? 65 : 32), 14, accent);
    });
    hit((i + 0.5) / 3, midX, y - H * 0.11, W - midX, H * 0.23, check);
  });
  function arcCheck(x, y, col) {
    d.arc(x, y, 6, col, 1.4);
  }
  alpha(at(q, 0.64, 0.1), () =>
    text(
      m
        ? "Checks to investigate. Not a confirmed cause."
        : "Evidence narrows the checks. It does not confirm a cause.",
      W * 0.5,
      H * 0.97,
      m ? 18 : 21,
      muted,
      "center",
    ),
  );
  return (
    checks[active] + " · supporting process and clean observations retained"
  );
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
  const compact = at(q, 0.4, 0.23),
    active = Math.min(2, Math.floor(f * 3)),
    gap = W * 0.16;
  const labels = ["Popup", "EnableShow", "Number"],
    values = [
      ["0", "—"],
      ["1", "0"],
      ["—", "−1"],
    ];
  const parentY = H * 0.22;
  for (let side = 0; side < 2; side++) {
    const x = side ? W * 0.59 : W * 0.05,
      ww = W * 0.36,
      align = settle((q - 0.16 - side * 0.035) / 0.3),
      offset = (1 - align) * (side ? H * 0.11 : 0);
    text(side ? "Target" : "Reference", x, H * 0.08, 20, muted);
    text("Devices.XML", x, H * 0.15, 22, ink);
    line(
      [
        [x + 8, H * 0.17],
        [x + 8, H * 0.85],
      ],
      faint,
    );
    for (let group = 0; group < 4; group++) {
      const keep = group === 1,
        rawY = H * (0.23 + group * 0.15),
        endY = H * (0.18 + group * 0.026),
        y = mix(rawY, endY, compact) + offset;
      const yy = keep ? H * 0.39 + offset : y;
      alpha(keep ? 1 : 1 - compact * 0.82, () => {
        line(
          [
            [x + 8, yy],
            [x + 30, yy],
          ],
          muted,
        );
        dot(x + 30, yy, 3, teal);
        alpha(keep ? 1 : 1 - compact, () =>
          text(
            keep
              ? m
                ? "EH35Fault"
                : "ExHeating.EH35Fault"
              : "Device branch " + (group + 1),
            x + (m ? 30 : 43),
            yy + 5,
            m ? 18 : 19,
            keep ? ink : muted,
          ),
        );
        if (!keep)
          for (let k = 0; k < 3; k++)
            line(
              [
                [x + 43, yy + 16 + k * 8 * (1 - compact)],
                [x + ww * 0.78, yy + 16 + k * 8 * (1 - compact)],
              ],
              faint,
            );
      });
    }
    labels.forEach((name, i) => {
      const y = H * (0.5 + i * 0.125) + offset,
        chosen = i === active;
      alpha(at(q, 0.5 + i * 0.025, 0.12), () => {
        line(
          [
            [x + 31, H * 0.41 + offset],
            [x + 31, y],
            [x + 46, y],
          ],
          faint,
        );
        text(name, x + 50, y + 5, 20, chosen ? ink : muted);
        text(values[i][side], x + ww, y + 5, 26, accent, "right");
        if (chosen)
          line(
            [
              [x + 46, y + 18],
              [x + ww, y + 18],
            ],
            accent,
            1.4,
          );
      });
      hit((i + 0.5) / 3, x, y - 22, ww, 65, name);
    });
  }
  alpha(at(q, 0.59, 0.11), () => {
    const y = H * (0.5 + active * 0.125);
    path([W * 0.43, y], [W * 0.59, y], accent, 1.6);
    text(
      ["Removed", "Changed", "Added"][active],
      W * 0.5,
      H * 0.92,
      23,
      accent,
      "center",
    );
  });
  return (
    "ExHeating.EH35Fault / " +
    labels[active] +
    " · " +
    values[active].join(" → ")
  );
}
