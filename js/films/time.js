import { mix, at, settle, sample, clamp } from "./drawing.js";

export function history(d, q, f, W, H, m, hit) {
  if (m) return historyPortrait(d, q, f, W, H);
  const {
    text,
    line,
    rect,
    dot,
    path,
    alpha,
    ink,
    muted,
    faint,
    accent,
    teal,
  } = d;
  const names = [
      "Arrival",
      "Process start",
      "Deposition",
      "Process end",
      "Transfer",
    ],
    positions = [0, 0.13, 0.39, 0.78, 1],
    states = ["Loaded", "Processing", "Depositing", "Complete", "Transferred"];
  const left = W * 0.08,
    width = W * 0.84,
    baseline = H * 0.48,
    order = at(q, 0.19, 0.4),
    cursor = q < 0.72 ? mix(0.04, 0.96, at(q, 0.57, 0.17)) : f;
  const camera = m ? 0 : (1 - at(q, 0.63, 0.12)) * at(q, 0.28, 0.2) * W * 0.035;
  d.c.save();
  d.c.translate(-camera, 0);
  alpha(at(q, 0.06, 0.18), () => {
    line(
      [
        [left, baseline],
        [left + width * at(q, 0.06, 0.26), baseline],
      ],
      muted,
    );
    for (let i = 0; i < 11; i++)
      line(
        [
          [left + (width * i) / 10, baseline - 5],
          [left + (width * i) / 10, baseline + 5],
        ],
        faint,
      );
  });
  const sweep = left + width * at(q, 0.08, 0.31);
  alpha(at(q, 0.06, 0.08) * (1 - at(q, 0.46, 0.12)), () =>
    line(
      [
        [sweep, H * 0.13],
        [sweep, H * 0.78],
      ],
      accent,
      1,
    ),
  );
  const locs = [];
  names.forEach((name, i) => {
    const lock = settle((q - 0.18 - i * 0.027) / 0.35),
      rawX = left + width * [0.69, 0.04, 0.44, 0.26, 0.85][i],
      rawY = H * [0.17, 0.36, 0.7, 0.24, 0.64][i];
    const x = mix(rawX, left + positions[i] * width, lock),
      y = mix(rawY, baseline, lock);
    locs.push([x, y]);
    const selected = Math.round(cursor * 4) === i;
    alpha(mix(0.72, 1, lock), () => {
      line(
        [
          [x, y - 13],
          [x, y + 13],
        ],
        selected && q > 0.6 ? accent : teal,
        2,
      );
      dot(x, y, 4, selected && q > 0.6 ? accent : ink);
      text(
        name,
        x,
        y - (i % 2 ? 42 : 68),
        m ? 21 : 19,
        ink,
        i === 4 ? "right" : i === 0 ? "left" : "center",
      );
      alpha(at(q, 0.13 + i * 0.025, 0.1), () =>
        text(["t₀", "t₁", "t₂", "t₃", "t₄"][i], x, y + 33, 16, muted, "center"),
      );
      alpha(at(q, 0.38 + i * 0.02, 0.15), () =>
        text(
          states[i],
          x,
          y + (i % 2 ? 85 : 57),
          16,
          selected ? accent : muted,
          i === 4 ? "right" : i === 0 ? "left" : "center",
        ),
      );
    });
  });
  alpha(at(q, 0.43, 0.2), () => {
    const a = locs[1],
      b = locs[3],
      y = H * 0.76;
    line(
      [
        [a[0], y - 7],
        [a[0], y],
        [b[0], y],
        [b[0], y - 7],
      ],
      accent,
      1.4,
    );
    text(
      "Processing duration",
      mix(a[0], b[0], 0.5),
      y + 32,
      20,
      accent,
      "center",
    );
  });
  alpha(at(q, 0.59, 0.1), () => {
    const x = left + width * cursor;
    line(
      [
        [x, H * 0.24],
        [x, H * 0.68],
      ],
      accent,
      1.2,
    );
    dot(x, baseline, 7, accent);
  });
  d.c.restore();
  return `${names[Math.round(cursor * 4)]} · ${states[Math.round(cursor * 4)]}`;
}

export function schedule(d, q, f, W, H, m, hit) {
  const { text, line, rect, dot, alpha, muted, ink, faint, accent, teal } = d;
  const left = W * (m ? 0.23 : 0.17),
    width = W * (m ? 0.7 : 0.77),
    top = H * 0.17,
    step = H * 0.126;
  const names = ["A-M1", "D-M1", "A-M2", "B-M1", "C-M1"],
    dates = [0, 0, 0.2, 0.4, 0.8];
  const shared = q < 0.73 ? at(q, 0.58, 0.16) : f;
  alpha(at(q, 0.1, 0.2), () => {
    line(
      [
        [left, H * 0.1],
        [left + width * at(q, 0.1, 0.2), H * 0.1],
      ],
      muted,
    );
    for (let i = 0; i < 6; i++)
      text(
        String(20 + i),
        left + (width * i) / 5,
        H * 0.07,
        17,
        muted,
        "center",
      );
  });
  names.forEach((n, i) => {
    const sync = settle((q - 0.24 - i * 0.029) / 0.29),
      offset = (1 - sync) * [0.19, -0.13, 0.23, -0.07, 0.06][i] * width,
      y = top + step * i;
    text(m ? n : "Reactor " + n, W * 0.025, y + 22, 17, muted);
    line(
      [
        [left + offset, y + 35],
        [left + width + offset, y + 35],
      ],
      faint,
    );
    for (let j = 0; j < 6; j++)
      line(
        [
          [left + offset + (width * j) / 5, y + 31],
          [left + offset + (width * j) / 5, y + 39],
        ],
        faint,
      );
    const x = left + offset + dates[i] * width,
      active = Math.abs(shared - dates[i]) < 0.19;
    rect(x, y, width * 0.13, 29, active && q > 0.64 ? accent : teal);
    dot(x, y + 35, 3, teal);
    alpha(at(q, 0.43 + i * 0.017, 0.14), () =>
      text("20–25 Sep", left + width, y + 64, 14, muted, "right"),
    );
    hit(i / 4, left, y, width, step, n);
  });
  alpha(at(q, 0.57, 0.1), () => {
    const x = left + width * shared;
    rect(
      x - width * 0.065,
      top - 10,
      width * 0.13,
      step * 4 + 64,
      m ? "#be976717" : "#be976711",
    );
    line(
      [
        [x, H * 0.1],
        [x, top + step * 4 + 76],
      ],
      accent,
      1.4,
    );
    names.forEach((n, i) => {
      if (Math.abs(shared - dates[i]) < 0.19)
        dot(x, top + step * i + 35, 5, accent);
    });
    text("One shared date", W * 0.5, H * 0.93, 22, ink, "center");
  });
  return (
    "Schedule context · " + String(20 + Math.round(shared * 5)) + " September"
  );
}

export function planning(d, q, f, W, H, m, hit) {
  const { text, line, rect, dot, alpha, muted, ink, faint, accent, teal } = d;
  const days = [10, 1, 12, -2, 7],
    names = [
      "Parameter A",
      "Parameter B",
      "Parameter C",
      "Parameter D",
      "Parameter E",
    ];
  const now = W * 0.33,
    left = W * 0.08,
    span = W * 0.84,
    y0 = H * 0.3,
    row = H * 0.105;
  const review = q < 0.76 ? mix(0.22, 0.66, at(q, 0.61, 0.15)) : f;
  alpha(at(q, 0.1, 0.22), () => {
    line(
      [
        [left, H * 0.18],
        [left + span, H * 0.18],
      ],
      muted,
    );
    text("Past due", left, H * 0.12, 19, accent);
    text("Upcoming", left + span, H * 0.12, 19, teal, "right");
  });
  alpha(at(q, 0.3, 0.13), () => {
    line(
      [
        [now, H * 0.16],
        [now, H * 0.88],
      ],
      accent,
      1.5,
    );
    text("NOW", now, H * 0.95, 18, accent, "center");
  });
  names.forEach((name, i) => {
    const t = settle((q - 0.17 - i * 0.017) / 0.4),
      target = now + days[i] * (span * 0.047),
      x = mix(left + [0.4, 0.08, 0.65, 0.52, 0.18][i] * span, target, t),
      y = mix(H * (0.23 + ((i * 3) % 5) * 0.13), y0 + i * row, t);
    const color = days[i] < 0 ? accent : days[i] < 2 ? ink : teal;
    line(
      [
        [now, y],
        [x, y],
      ],
      faint,
    );
    dot(x, y, 5, color);
    text(
      m ? name.replace("Parameter ", "") : name,
      x + (days[i] < 0 ? -13 : 13),
      y - 10,
      18,
      color,
      days[i] < 0 ? "right" : "left",
    );
    alpha(at(q, 0.48 + i * 0.025, 0.11), () =>
      text(
        `${days[i] > 0 ? "+" : ""}${days[i]} days`,
        x + (days[i] < 0 ? -13 : 13),
        y + 20,
        16,
        muted,
        days[i] < 0 ? "right" : "left",
      ),
    );
    const selected = Math.abs((x - left) / span - review) < 0.14;
    alpha(at(q, 0.61, 0.14) * (selected ? 1 : 0), () => {
      line(
        [
          [x - 12, y - 22],
          [x - 12, y + 29],
        ],
        color,
        2,
      );
      if (!m)
        text(
          days[i] < 0 ? "Overdue" : days[i] < 2 ? "Due soon" : "Scheduled",
          W * 0.94,
          y + 5,
          17,
          color,
          "right",
        );
    });
  });
  alpha(at(q, 0.64, 0.1), () => {
    const x = left + span * review;
    rect(x - 20, H * 0.2, 40, H * 0.65, "#be986a11");
    line(
      [
        [x, H * 0.2],
        [x, H * 0.85],
      ],
      muted,
    );
  });
  return "Due dates relative to the displayed reference date";
}

export function signals(d, q, f, W, H, m, hit, alternate) {
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
  const names = ["Flow A", "Flow B", "Motor speed", "Pressure", "Temperature"],
    left = W * (m ? 0.23 : 0.17),
    width = W * (m ? 0.7 : 0.77),
    top = H * 0.1,
    row = H * 0.157;
  const focus = q < 0.76 ? mix(0.12, 0.88, at(q, 0.59, 0.17)) : f,
    range = mix(0.19, 0.09, alternate);

  names.forEach((name, i) => {
    const sync = settle((q - 0.22 - i * 0.025) / 0.32),
      offset = (1 - sync) * [0.14, -0.09, 0.19, -0.15, 0.05][i],
      x = left + offset * width,
      y = top + i * row;
    text(
      m
        ? name.replace("Motor speed", "Motor").replace("Temperature", "Temp.")
        : name,
      W * 0.025,
      y + row * 0.45,
      18,
      i === 0 ? accent : muted,
    );
    const rawWidth =
      width * (1 + (1 - sync) * [0.1, -0.07, 0.02, -0.13, 0.08][i]);
    line(
      [
        [x, y + row * 0.84],
        [x + rawWidth, y + row * 0.84],
      ],
      faint,
    );
    trace(
      x,
      y,
      rawWidth,
      row * 0.79,
      i,
      at(q, 0.03 + i * 0.018, 0.23),
      i === 0 ? accent : teal,
      false,
      offset,
    );
    for (let k = 0; k < 6; k++)
      line(
        [
          [x + (rawWidth * k) / 5, y + row * 0.84],
          [x + (rawWidth * k) / 5, y + row * 0.89],
        ],
        faint,
      );
    const u = mix([0.24, 0.74, 0.41, 0.62, 0.35][i], focus, at(q, 0.53, 0.16)),
      xx = left + width * u;
    alpha(at(q, 0.43, 0.14), () => {
      rect(xx - width * range * 0.5, y, width * range, row * 0.8, "#d5b27812");
      line(
        [
          [xx, y],
          [xx, y + row * 0.84],
        ],
        accent,
        1.1,
      );
      dot(xx, y + row * 0.79 * (1 - sample(u, i)), 4, accent);
    });
  });
  alpha(at(q, 0.64, 0.1), () => {
    line(
      [
        [left + width * focus, top - 14],
        [left + width * focus, top + row * 4.85],
      ],
      accent,
      1.4,
    );
    text("Shared temporal window", W * 0.5, H * 0.97, 21, ink, "center");
  });
  return `${alternate > 0.5 ? "Narrow" : "Shared"} interval · ${Math.round(focus * 100)}% through the illustrative range`;
}

function historyPortrait(d, q, f, W, H) {
  const { text, line, dot, alpha, ink, muted, accent, teal } = d;
  const names = [
    "Arrival",
    "Process start",
    "Deposition",
    "Process end",
    "Transfer",
  ];
  const states = [
    "Loaded",
    "Processing",
    "Depositing",
    "Complete",
    "Transferred",
  ];
  const fractions = [0, 0.2, 0.46, 0.75, 1],
    x = W * 0.3,
    top = H * 0.1,
    span = H * 0.7;
  const cursor = q < 0.72 ? mix(0.04, 0.96, at(q, 0.57, 0.17)) : f;
  const chosen = fractions.reduce(
    (best, v, i) =>
      Math.abs(v - cursor) < Math.abs(fractions[best] - cursor) ? i : best,
    0,
  );
  alpha(at(q, 0.08, 0.2), () =>
    line(
      [
        [x, top],
        [x, top + span * at(q, 0.08, 0.27)],
      ],
      muted,
    ),
  );
  names.forEach((name, i) => {
    const t = settle((q - 0.18 - i * 0.027) / 0.35),
      xx = mix(W * (0.25 + (i % 3) * 0.22), x, t),
      y = mix(H * (0.15 + ((i * 3) % 5) * 0.145), top + fractions[i] * span, t);
    dot(xx, y, 5, i === chosen ? accent : teal);
    line(
      [
        [xx - 8, y],
        [xx + 12, y],
      ],
      muted,
    );
    text(name, xx + 29, y - 8, 26, ink);
    alpha(at(q, 0.37 + i * 0.022, 0.15), () =>
      text(states[i], xx + 29, y + 27, 22, i === chosen ? accent : muted),
    );
    text("t" + i, xx - 30, y + 6, 21, muted, "right");
  });
  alpha(at(q, 0.43, 0.2), () => {
    const a = top + span * 0.2,
      b = top + span * 0.75;
    line(
      [
        [W * 0.11 + 8, a],
        [W * 0.11, a],
        [W * 0.11, b],
        [W * 0.11 + 8, b],
      ],
      accent,
      1.5,
    );
    text("Processing duration", x, H * 0.94, 23, accent);
  });
  alpha(at(q, 0.59, 0.1), () => {
    const y = top + span * cursor;
    line(
      [
        [x - 12, y],
        [W * 0.94, y],
      ],
      accent,
      1,
    );
  });
  return names[chosen] + " · " + states[chosen];
}
