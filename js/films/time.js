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
  const left = W * (m ? 0.2 : 0.16),
    width = W * (m ? 0.73 : 0.77),
    top = H * 0.18,
    step = H * 0.147,
    names = ["A-M1", "D-M1", "A-M2", "B-M1", "C-M1"],
    dates = [0, 0, 0.2, 0.4, 0.8];
  const shared = q < 0.73 ? at(q, 0.58, 0.16) : f;
  alpha(at(q, 0.15, 0.18), () => {
    line(
      [
        [left, H * 0.1],
        [left + width, H * 0.1],
      ],
      muted,
    );
    for (let i = 0; i < 6; i++)
      text(
        String(20 + i),
        left + (width * i) / 5,
        H * 0.07,
        20,
        muted,
        "center",
      );
  });
  names.forEach((n, i) => {
    const sync = at(q, 0.24 + i * 0.045, 0.26),
      span = width * mix([0.65, 0.42, 0.78, 0.56, 0.7][i], 1, sync),
      x = left + width * [0.12, 0.46, 0.03, 0.32, 0.08][i] * (1 - sync),
      y = top + i * step;
    text(n, W * 0.02, y + 22, m ? 23 : 21, ink);
    alpha(1 - sync, () => {
      rect(x - 8, y - 7, span + 16, step * 0.71, null, faint);
      text("20", x, y + step * 0.84, 16, muted);
      text("25", x + span, y + step * 0.84, 16, muted, "right");
    });
    line(
      [
        [x, y + 35],
        [x + span, y + 35],
      ],
      faint,
    );
    for (let j = 0; j < 6; j++)
      line(
        [
          [x + (span * j) / 5, y + 31],
          [x + (span * j) / 5, y + 39],
        ],
        faint,
      );
    const xx = x + dates[i] * span,
      active = Math.abs(shared - dates[i]) < 0.16 && q > 0.65;
    rect(xx, y, span * 0.13, 29, active ? accent : teal);
    dot(xx, y + 35, 3, teal);
  });
  alpha(at(q, 0.62, 0.12), () => {
    const x = left + width * shared;
    rect(x - width * 0.05, top - 10, width * 0.1, step * 4 + 50, "#be976715");
    line(
      [
        [x, H * 0.1],
        [x, top + step * 4 + 48],
      ],
      accent,
      1.4,
    );
  });
  return (
    String(20 + Math.round(shared * 5)) + " September · equipment schedules"
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
  const selected = days.reduce(
    (best, v, i) =>
      Math.abs((now + v * span * 0.047 - left) / span - review) <
      Math.abs((now + days[best] * span * 0.047 - left) / span - review)
        ? i
        : best,
    0,
  );
  return (
    names[selected] +
    " · " +
    (days[selected] < 0
      ? "past due"
      : days[selected] < 2
        ? "due soon"
        : "upcoming")
  );
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
    left = W * (m ? 0.23 : 0.14),
    width = W * (m ? 0.72 : 0.81),
    top = H * 0.055,
    row = H * 0.177;
  const inspect = q < 0.74 ? mix(0.17, 0.8, at(q, 0.58, 0.16)) : f,
    lock = at(q, 0.53, 0.17),
    range = mix(0.2, 0.08, alternate);
  names.forEach((name, i) => {
    const sync = at(q, 0.2 + i * 0.04, 0.29),
      raw = [0.64, 0.48, 0.79, 0.54, 0.65][i],
      rawX = [0.11, 0.38, 0.02, 0.27, 0.18][i];
    const x = left + rawX * width * (1 - sync),
      ww = width * mix(raw, 1, sync),
      y = top + i * row,
      hh = row * 0.8;
    const local = mix([0.2, 0.74, 0.43, 0.61, 0.32][i], inspect, lock),
      xx = x + ww * local;
    text(
      m
        ? name.replace("Motor speed", "Motor").replace("Temperature", "Temp.")
        : name,
      W * 0.02,
      y + hh * 0.5 + 7,
      m ? 23 : 21,
      ink,
    );
    alpha(1 - sync * 0.83, () =>
      rect(x - 8, y - 3, ww + 16, hh + 8, null, muted),
    );
    for (let j = 0; j < 5; j++)
      line(
        [
          [x + (ww * j) / 4, y + hh],
          [x + (ww * j) / 4, y + hh + 5],
        ],
        faint,
      );
    trace(
      x,
      y + 3,
      ww,
      hh - 6,
      i,
      at(q, 0.02 + i * 0.025, 0.16),
      i === 0 ? accent : teal,
      false,
      (1 - sync) * rawX,
    );
    alpha(at(q, 0.085 + i * 0.015, 0.14), () => {
      rect(xx - (ww * range) / 2, y, ww * range, hh, "#d9b48618");
      line(
        [
          [xx, y],
          [xx, y + hh],
        ],
        accent,
        1.2,
      );
      dot(
        xx,
        y + 3 + (hh - 6) * (1 - sample(local + (1 - sync) * rawX, i)),
        4,
        accent,
      );
    });
  });
  alpha(lock, () => {
    const x = left + width * inspect;
    line(
      [
        [x, top - 8],
        [x, top + row * 4.8],
      ],
      accent,
      1.5,
    );
    line(
      [
        [left, H * 0.965],
        [left + width, H * 0.965],
      ],
      muted,
    );
    for (let i = 0; i < 11; i++)
      line(
        [
          [left + (width * i) / 10, H * 0.955],
          [left + (width * i) / 10, H * 0.973],
        ],
        faint,
      );
  });
  return (
    (alternate > 0.5 ? "Narrow interval" : "Shared interval") +
    " · " +
    Math.round(inspect * 100) +
    "%"
  );
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
