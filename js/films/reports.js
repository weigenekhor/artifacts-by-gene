import { mix, at, settle, sample } from "./drawing.js";

export function compile(d, q, f, W, H, m, hit) {
  const {
    text,
    line,
    path,
    rect,
    dot,
    trace,
    alpha,
    ink,
    muted,
    faint,
    accent,
    teal,
  } = d;
  const sources = ["LayTec", "PL / Plato", "XRR", "XRD"],
    active = Math.min(3, Math.floor(f * 4));
  const reportX = W * (m ? 0.56 : 0.62),
    reportY = H * 0.17,
    reportW = W * (m ? 0.39 : 0.32),
    reportH = H * 0.68;
  const frame = at(q, 0.25, 0.2);
  alpha(frame, () => {
    rect(reportX, reportY, reportW, reportH, null, muted);
    text("Base workbook", reportX + 18, reportY + 34, 20, ink);
    line(
      [
        [reportX + 18, reportY + 51],
        [reportX + reportW - 18, reportY + 51],
      ],
      faint,
    );
  });
  sources.forEach((name, i) => {
    const y = H * (0.14 + i * 0.205),
      x = W * 0.06,
      ww = W * (m ? 0.35 : 0.29),
      t = settle((q - 0.31 - i * 0.049) / 0.24),
      toY = reportY + H * (0.14 + i * 0.13),
      chosen = i === active && q > 0.68;
    alpha(mix(1, chosen ? 1 : 0.4, at(q, 0.63, 0.13)), () => {
      text(name, x, y, 23, chosen ? accent : ink);
      if (i === 0) trace(x, y + 10, ww, H * 0.1, 2, at(q, 0.025, 0.17), teal);
      else if (i === 1) {
        for (let j = 0; j < 28; j++) {
          const xx = x + (ww * j) / 28;
          line(
            [
              [xx, y + H * 0.13],
              [xx, y + H * 0.13 - Math.exp(-(((j - 14) / 5) ** 2)) * H * 0.105],
            ],
            teal,
            2,
          );
        }
      } else {
        for (let j = 0; j < 34; j++)
          dot(
            x + (ww * j) / 34,
            y + 45 + Math.sin(j * 0.25 + i) * 20 * (1 - j / 44),
            2,
            teal,
          );
      }
      text("Selected source", x, y + H * 0.16, 14, muted);
    });
    alpha(
      at(q, 0.26 + i * 0.035, 0.11) * (q > 0.7 ? (chosen ? 1 : 0.16) : 1),
      () =>
        path(
          [x + ww, y + 30],
          [reportX + 18, toY],
          chosen ? accent : muted,
          1.1,
        ),
    );
    for (let j = 0; j < 5; j++) {
      const travel = settle((q - 0.29 - i * 0.045 - j * 0.009) / 0.25),
        xx = mix(
          x + ww * 0.2 + j * ww * 0.12,
          reportX + 18 + (j * (reportW - 36)) / 5,
          travel,
        ),
        yy = mix(y + H * 0.1, toY + 23, travel);
      alpha(at(q, 0.22 + i * 0.045 + j * 0.009, 0.04), () =>
        line(
          [
            [xx, yy],
            [xx + mix(12, (reportW - 50) / 5, travel), yy],
          ],
          chosen ? accent : teal,
          2,
        ),
      );
    }
    alpha(t, () => text(name, reportX + 18, toY, 18, chosen ? accent : ink));
    hit((i + 0.5) / 4, reportX, toY - 23, reportW, H * 0.13, name);
  });
  alpha(at(q, 0.63, 0.13), () => {
    text(
      "Source → processed record",
      reportX,
      reportY + reportH + 39,
      19,
      muted,
    );
    line(
      [
        [reportX, reportY + reportH + 10],
        [reportX + reportW, reportY + reportH + 10],
      ],
      accent,
      1.3,
    );
  });
  return sources[active] + " · source provenance remains available";
}

export function report(d, q, f, W, H, m, hit, alternate) {
  const { text, line, path, rect, alpha, ink, muted, faint, accent, teal } = d;
  const extract = at(q, 0.18, 0.28),
    append = (1 - alternate) * at(q, 0.44, 0.23),
    active = Math.min(2, Math.floor(f * 3));
  const x = W * 0.06,
    y = H * 0.18,
    sw = W * 0.33,
    outX = W * 0.64,
    outW = W * 0.3,
    row = H * 0.053;
  text("LayTec analysis .htm", x, H * 0.1, 22, ink);
  text("Base file .xlsx", outX, H * 0.1, 22, ink);
  rect(x, y, sw, H * 0.63, null, faint);
  rect(outX, y, outW, H * 0.63, null, muted);
  // Source capture shows analysis-file row extraction and append to an existing workbook.
  for (let i = 0; i < 10; i++) {
    const yy = y + 35 + i * row,
      kept = i >= 2 && i <= 7;
    alpha(kept ? 1 : 1 - extract * 0.8, () => {
      text(
        i === 0 ? "<table>" : i === 9 ? "</table>" : "<tr>",
        x + 12,
        yy,
        15,
        faint,
      );
      for (let c = 0; c < 3; c++)
        line(
          [
            [x + sw * 0.23 + c * sw * 0.23, yy - 6],
            [x + sw * 0.39 + c * sw * 0.23, yy - 6],
          ],
          kept ? teal : faint,
          2,
        );
    });
    if (kept) {
      const t = settle((q - 0.36 - (i - 2) * 0.018) / 0.3) * (1 - alternate),
        xx = mix(x + sw * 0.23, outX + outW * 0.1, t),
        ty = mix(yy, y + H * 0.22 + (i - 2) * row, t);
      alpha(extract, () => {
        for (let c = 0; c < 3; c++)
          line(
            [
              [xx + c * outW * 0.28, ty - 6],
              [xx + (c + 0.7) * outW * 0.28, ty - 6],
            ],
            active === 1 ? accent : teal,
            2.2,
          );
      });
    }
  }
  alpha(at(q, 0.12, 0.18), () => {
    for (let i = 0; i < 3; i++) {
      const yy = y + 31 + i * row;
      line(
        [
          [outX + 18, yy],
          [outX + outW - 18, yy],
        ],
        muted,
      );
    }
    text("Existing rows", outX + 14, y + H * 0.18, 15, muted);
  });
  alpha(extract, () => {
    const cutY = y + H * 0.19;
    line(
      [
        [x + sw + 10, cutY],
        [x + sw + 10, y + H * 0.55],
      ],
      accent,
      1.5,
    );
    path([x + sw + 10, cutY], [outX - 14, y + H * 0.24], accent, 1.4);
    text("Extract", W * 0.5, H * 0.52, 20, accent, "center");
  });
  alpha(append, () => {
    line(
      [
        [outX + 9, y + H * 0.2],
        [outX + outW - 9, y + H * 0.2],
      ],
      accent,
      2,
    );
    text("Appended analysis rows", outX, y + H * 0.71, 18, ink);
  });
  text(
    "Run identity remains attached to the analysis.",
    W * 0.5,
    H * 0.96,
    20,
    muted,
    "center",
  );
  hit(0.16, x, y, sw, H * 0.63, "Analysis file");
  hit(0.5, W * 0.4, y, W * 0.23, H * 0.63, "Extracted rows");
  hit(0.84, outX, y, outW, H * 0.63, "Base workbook");
  return [
    "Analysis file · LayTec HTML",
    "Row extraction · selected analysis",
    "Base workbook · append with run context",
  ][active];
}

export function legacy(d, q, f, W, H, m, hit, alternate) {
  const {
    text,
    line,
    rect,
    dot,
    trace,
    alpha,
    ink,
    muted,
    faint,
    accent,
    teal,
  } = d;
  const names = ["G", "J", "B", "E", "H"],
    states = ["Passed", "Passed", "Review", "Passed", "Review"],
    active = Math.min(4, Math.floor(f * 5));
  const normalise = at(q, 0.2, 0.39) * (1 - alternate),
    top = H * 0.14,
    left = W * 0.06,
    width = W * 0.86;
  for (let i = 0; i < 5; i++) {
    const rawX = W * (0.07 + (i % 2) * 0.4),
      rawY = H * (0.17 + Math.floor(i / 2) * 0.21),
      x = mix(rawX, left, normalise),
      y = mix(rawY, top + i * H * 0.083, normalise),
      ww = mix(W * 0.33, width, normalise),
      chosen = i === active;
    line(
      [
        [x, y + 30],
        [x + ww, y + 30],
      ],
      chosen ? accent : faint,
      1.1,
    );
    text("Parameter " + names[i], x, y + 11, 20, chosen ? ink : muted);
    alpha(at(q, 0.12, 0.2), () => {
      const statusX = mix(x + ww * 0.1, x + ww * 0.5, normalise),
        statusY = mix(y + 56, y + 11, normalise);
      text(
        states[i],
        statusX,
        statusY,
        17,
        states[i] === "Review" ? accent : teal,
      );
      const chipX = mix(x + ww * 0.55, x + ww * 0.78, normalise),
        chipY = mix(y + 51, y + 6, normalise);
      for (let j = 0; j < 4; j++)
        line(
          [
            [chipX + j * 9, chipY],
            [chipX + j * 9, chipY + Math.sin(i + j) * 10],
          ],
          muted,
        );
    });
    hit((i + 0.5) / 5, left, y - 16, width, H * 0.08, "Parameter " + names[i]);
  }
  alpha(at(q, 0.54, 0.15), () => {
    const y = H * 0.69,
      h = H * 0.2;
    text(
      "Parameter " + names[active] + " / retained chart context",
      left,
      y - 25,
      21,
      ink,
    );
    rect(left, y, width, h, null, faint);
    trace(
      left + 12,
      y + 9,
      width - 24,
      h - 16,
      active,
      at(q, 0.58, 0.14),
      teal,
    );
    dot(left + width * 0.65, y + h * (1 - sample(0.65, active)), 4, accent);
  });
  return "Parameter " + names[active] + " · record, state and chart";
}

export function spc(d, q, f, W, H, m, hit) {
  const {
    text,
    line,
    rect,
    dot,
    trace,
    alpha,
    ink,
    muted,
    faint,
    accent,
    teal,
  } = d;
  const focus = at(q, 0.32, 0.31),
    active = Math.min(2, Math.floor(f * 3));
  for (let i = 0; i < 9; i++) {
    const selected = i === 4,
      rawX = W * (0.04 + (i % 3) * 0.32),
      rawY = H * (0.13 + Math.floor(i / 3) * 0.24),
      x = mix(rawX, selected ? W * 0.12 : W * (0.04 + (i % 4) * 0.245), focus),
      y = mix(rawY, selected ? H * 0.27 : H * (i < 4 ? 0.1 : 0.81), focus),
      ww = mix(W * 0.27, selected ? W * 0.76 : W * 0.19, focus),
      hh = mix(H * 0.17, selected ? H * 0.34 : H * 0.1, focus);
    alpha(selected ? 1 : mix(1, 0.32, focus), () => {
      line(
        [
          [x, y + hh * 0.15],
          [x + ww, y + hh * 0.15],
        ],
        faint,
      );
      line(
        [
          [x, y + hh * 0.85],
          [x + ww, y + hh * 0.85],
        ],
        faint,
      );
      trace(
        x,
        y,
        ww,
        hh,
        i === 4 ? active : i,
        at(q, 0.02 + i * 0.008, 0.22),
        selected ? accent : teal,
        selected,
      );
      if (selected) {
        alpha(at(q, 0.5, 0.15), () => {
          rect(
            x + ww * 0.59,
            y + hh * 0.13,
            ww * 0.12,
            hh * 0.73,
            null,
            accent,
          );
          text("Review the departure", x, y - 22, 22, ink);
          for (let j = 0; j < 30; j++) {
            const u = j / 29;
            dot(
              x + u * ww,
              y + hh + 40 + sample(u, active) * H * 0.06,
              2.4,
              muted,
            );
          }
        });
      }
    });
  }
  alpha(at(q, 0.62, 0.1), () =>
    text(
      "Release remains an engineering review.",
      W * 0.5,
      H * 0.97,
      21,
      muted,
      "center",
    ),
  );
  for (let i = 0; i < 3; i++)
    hit(
      (i + 0.5) / 3,
      W * (0.05 + i * 0.31),
      H * 0.1,
      W * 0.3,
      H * 0.78,
      "Parameter " + "ABC"[i],
    );
  return (
    "Parameter " +
    "ABC"[active] +
    " · excursion, surrounding trend and raw context"
  );
}
