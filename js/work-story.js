// Schematic evidence, not app screenshots or measured results. The same records
// are brought into context, retained as a method, and revised through use.
const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
const mix = (a, b, t) => a + (b - a) * t;
// The opening's highlighted route lands on this exact trace in the first record.
export function evidenceTrace({ width, height, phase, mobile }) {
  const align = ease(phase / 0.8);
  if (mobile) {
    const scale = Math.min((width - 40) / 340, (height * 0.36) / 285);
    return Array.from({ length: 101 }, (_, j) => {
      const u = j / 100;
      return [
        width / 2 - 170 * scale + (19 + u * 78) * scale,
        height * 0.4 -
          142 * scale +
          (mix(45, 48, align) +
            76 -
            Math.sin(u * 9.36) * 12 -
            (u > 20 / 39 && u < 27 / 39 ? 10 : 0)) *
            scale,
      ];
    });
  }
  const scale = Math.min((width * 0.54) / 760, (height * 0.58) / 540),
    angle = -0.065 * (1 - align),
    x = mix(66, 40, align),
    y = mix(67, 72, align);
  return Array.from({ length: 101 }, (_, j) => {
    const u = j / 100,
      a = 23 + u * 154,
      b = 103 - Math.sin(u * 9) * 14 - (u > 0.5 && u < 0.72 ? 18 : 0);
    return [
      width * 0.7 +
        (x + a * Math.cos(angle) - b * Math.sin(angle) - 380) * scale,
      height * 0.5 +
        (y + a * Math.sin(angle) + b * Math.cos(angle) - 270) * scale,
    ];
  });
}
export function drawWorkStory(
  ctx,
  { width, height, phase, arrival, clock, mobile, reduced },
) {
  if (arrival < 0.001) return;
  if (mobile) {
    drawCompactStory(ctx, { width, height, phase, arrival, clock, reduced });
    return;
  }
  const areaW = mobile ? width * 0.91 : width * 0.54,
    areaH = mobile ? height * 0.4 : height * 0.58;
  const scale = Math.min(areaW / 760, areaH / 540),
    cx = width * (mobile ? 0.5 : 0.7),
    cy = height * (mobile ? 0.4 : 0.5);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-380, -270);
  ctx.globalAlpha = arrival;
  const ink = "#253c32",
    muted = "#617267",
    line = "#a9b6a8",
    warm = "#ae713e",
    paper = "#f4f3eb";
  const text = (s, x, y, size = 13, color = muted, weight = 400) => {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px Geist, Arial`;
    ctx.fillText(s, x, y);
  };
  const path = (points, color = line, weight = 1) => {
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    ctx.stroke();
  };
  const rule = (x, y, w) =>
    path(
      [
        [x, y],
        [x + w, y],
      ],
      line,
      0.7,
    );
  const panel = (x, y, w, h, angle = 0) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.shadowColor = "#1c322218";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, w, h);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = "#93a58e88";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, h);
  };
  const align = ease(phase / 0.8),
    retained = ease((phase - 1.15) / 0.75),
    revision = ease((phase - 2.1) / 0.8),
    built = ease((phase - 3.15) / 0.85);
  const loose = [
    [66, 67, -0.065],
    [428, 83, 0.055],
    [248, 305, -0.035],
  ];
  const together = [
    [40, 72, 0],
    [283, 72, 0],
    [524, 72, 0],
  ];
  // Three sources remain distinguishable when the context comes together.
  const evidenceTitles = ["The run", "The reference", "The context"];
  for (let i = 0; i < 3; i++) {
    const a = loose[i],
      b = together[i],
      x = mix(mix(a[0], b[0], align), 135 + i * 155, retained),
      y = mix(mix(a[1], b[1], align), 65, retained);
    ctx.save();
    ctx.globalAlpha = arrival * (1 - retained) * (1 - built);
    ctx.translate(x, y);
    ctx.scale(1 - retained * 0.45, 1 - retained * 0.45);
    panel(0, 0, 202, 163, a[2] * (1 - align));
    text(evidenceTitles[i], 17, 29, 17, ink, 500);
    rule(17, 43, 168);
    if (i === 0) {
      path(
        [
          [20, 130],
          [20, 65],
        ],
        line,
      );
      path(
        [
          [20, 130],
          [180, 130],
        ],
        line,
      );
      const points = [];
      for (let j = 0; j < 70; j++) {
        const u = j / 69;
        points.push([
          23 + u * 154,
          103 - Math.sin(u * 9) * 14 - (u > 0.5 && u < 0.72 ? 18 : 0),
        ]);
      }
      path(points, warm, 1.8);
      text("Observed behaviour", 18, 151, 10);
    }
    if (i === 1) {
      for (let r = 0; r < 4; r++) {
        text(String(r + 1).padStart(2, "0"), 18, 67 + r * 23, 10);
        path(
          [
            [44, 63 + r * 23],
            [165 - (r % 2) * 35, 63 + r * 23],
          ],
          r === 2 ? warm : line,
          r === 2 ? 2 : 1,
        );
        if (r === 2) {
          ctx.strokeStyle = warm;
          ctx.strokeRect(39, 52 + r * 23, 136, 20);
        }
      }
    }
    if (i === 2) {
      ["What changed?", "Under which conditions?", "What was checked?"].forEach(
        (s, j) => {
          ctx.beginPath();
          ctx.arc(22, 66 + j * 28, 2, 0, Math.PI * 2);
          ctx.fillStyle = warm;
          ctx.fill();
          text(s, 33, 70 + j * 28, 11, ink);
        },
      );
    }
    ctx.restore();
    ctx.restore();
  }
  // Aligned sources feed a clear, readable sequence, rather than a generic network.
  const route = ease((phase - 0.45) / 0.55) * (1 - retained);
  if (route > 0.001) {
    ctx.save();
    ctx.globalAlpha = arrival * route;
    const yy = 310;
    path(
      [
        [140, 242],
        [140, yy],
        [625, yy],
        [625, 242],
      ],
      warm,
      1.2,
    );
    path(
      [
        [384, 242],
        [384, yy],
      ],
      warm,
      1.2,
    );
    ["Collect", "Align", "Compare", "Record"].forEach((s, i) => {
      const x = 99 + i * 157;
      ctx.fillStyle = paper;
      ctx.fillRect(x - 12, yy - 12, 112, 31);
      text(s, x, yy + 8, 16, ink);
      text("0" + (i + 1), x, yy + 35, 10);
    });
    text("Same checks. Another task.", 242, 425, 21, ink, 450);
    ctx.restore();
  }
  // The method has real content: checks and context are kept beside the result.
  ctx.save();
  ctx.globalAlpha = arrival * retained * (1 - built);
  const lift = Math.sin(revision * Math.PI) * 22;
  for (let r = 2; r >= 0; r--) {
    ctx.save();
    ctx.globalAlpha *= 0.18 + revision * 0.15;
    panel(122 + r * 12, 122 - r * 12, 510, 298);
    ctx.restore();
    ctx.restore();
  }
  panel(116, 110 - lift, 520, 304, -0.006 * revision);
  text("A method worth keeping", 25, 39, 25, ink, 470);
  text("CHECK / RETAIN / REUSE", 25, 62, 10);
  rule(25, 82, 470);
  const labels = [
    "Bring the evidence together",
    "Keep the reference beside it",
    "Check what changed",
    "Retain the result and its context",
  ];
  const sweep = reduced ? 3 : Math.floor((clock * 0.55) % 4);
  labels.forEach((s, i) => {
    const yy = 112 + i * 43,
      done = ease((phase - 1.1 - i * 0.12) / 0.55);
    text("0" + (i + 1), 25, yy, 11);
    text(s, 67, yy, 16, ink);
    rule(67, yy + 15, 400);
    ctx.globalAlpha = arrival * retained * (1 - built) * done;
    path(
      [
        [451, yy - 4],
        [456, yy + 1],
        [466, yy - 11],
      ],
      warm,
      1.8,
    );
    if (i === sweep && revision > 0.3) {
      ctx.fillStyle = "#b4824020";
      ctx.fillRect(59, yy - 20, 418, 34);
    }
    ctx.globalAlpha = arrival * retained * (1 - built);
  });
  ctx.restore();
  ctx.restore();
  if (revision > 0.01 && built < 0.99) {
    ctx.save();
    ctx.globalAlpha = arrival * revision * (1 - built);
    const r = ease((phase - 2.5) / 0.5);
    path(
      [
        [632, 184],
        [700, 184],
        [700, 467],
        [104, 467],
        [104, 414],
      ],
      warm,
      1.3,
    );
    text("Use", 655, 161, 13, ink);
    text("Revise", 526, 491, 13, ink);
    text("Use again", 110, 491, 13, ink);
    ctx.fillStyle = warm;
    ctx.beginPath();
    ctx.arc(mix(640, 110, r), 467, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // The retained sequence now acts on fresh evidence. This resolves the story
  // without pretending to show a software interface or a catalogue of apps.
  if (built > 0.001) {
    ctx.save();
    ctx.globalAlpha = arrival * built;
    const x = 74,
      y = 75;
    panel(x, y, 612, 375);
    text("THE METHOD CAN BE USED AGAIN", 26, 32, 11, muted, 450);
    text("A better starting point.", 26, 72, 30, ink, 470);
    rule(26, 92, 560);
    text("New evidence", 27, 128, 13, ink, 500);
    text("Retained checks", 238, 128, 13, ink, 500);
    text("A result in context", 436, 128, 13, ink, 500);
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.translate(27 + i * 7, 157 - i * 7);
      ctx.strokeStyle = line;
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, 118, 117);
      ctx.strokeRect(0, 0, 118, 117);
      for (let j = 0; j < 4; j++)
        path(
          [
            [13, 20 + j * 18],
            [93 - (j % 2) * 23, 20 + j * 18],
          ],
          j === i ? warm : line,
          1,
        );
      ctx.restore();
    }
    const tick = reduced ? 0.6 : (clock * 0.24) % 1;
    for (let i = 0; i < 4; i++) {
      const yy = 159 + i * 33;
      rule(235, yy + 20, 127);
      text(["Collect", "Align", "Check", "Retain"][i], 238, yy + 6, 14, ink);
      path(
        [
          [338, yy],
          [342, yy + 4],
          [350, yy - 5],
        ],
        warm,
        1.5,
      );
    }
    for (const [left, right] of [
      [157, 224],
      [372, 426],
    ]) {
      path(
        [
          [left, 218],
          [right, 218],
        ],
        line,
        1,
      );
      const sx = mix(left, right, tick);
      path(
        [
          [sx - 7, 218],
          [sx, 218],
        ],
        warm,
        2.5,
      );
      path(
        [
          [right - 5, 214],
          [right, 218],
          [right - 5, 222],
        ],
        warm,
        1,
      );
    }
    ctx.strokeStyle = line;
    ctx.strokeRect(440, 150, 137, 143);
    text("Finding", 453, 177, 12, ink);
    rule(453, 190, 106);
    text("Evidence", 453, 211, 11);
    text("Checks", 453, 237, 11);
    text("Context", 453, 263, 11);
    text("The reasoning stays with the work.", 26, 345, 18, ink, 450);
    ctx.restore();
    ctx.restore();
  }
  ctx.restore();
}

// A separate mobile composition keeps the evidence legible at its actual size.
// It follows the same stages, without shrinking the desktop diagram to a thumbnail.
function drawCompactStory(
  ctx,
  { width, height, phase, arrival, clock, reduced },
) {
  const scale = Math.min((width - 40) / 340, (height * 0.36) / 285);
  const align = ease(phase / 0.8),
    retain = ease((phase - 1.15) / 0.75),
    revise = ease((phase - 2.1) / 0.8),
    built = ease((phase - 3.15) / 0.85);
  const ink = "#253c32",
    muted = "#617267",
    line = "#a9b6a8",
    warm = "#ae713e",
    paper = "#f4f3eb";
  ctx.save();
  ctx.translate(width / 2 - 170 * scale, height * 0.4 - 142 * scale);
  ctx.scale(scale, scale);
  const text = (s, x, y, size = 13, color = ink) => {
    ctx.fillStyle = color;
    ctx.font = `400 ${size}px Geist, Arial`;
    ctx.fillText(s, x, y);
  };
  const path = (points, color = line, weight = 1) => {
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    ctx.stroke();
  };
  const sheet = (x, y, w, h) => {
    ctx.fillStyle = paper;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = line;
    ctx.strokeRect(x, y, w, h);
  };
  ctx.globalAlpha = arrival * (1 - retain);
  ["Run", "Reference", "Context"].forEach((label, i) => {
    const x = 7 + i * 112,
      y = mix([45, 21, 90][i], 48, align);
    sheet(x, y, 102, 118);
    text(label, x + 11, y + 24, 14);
    path([
      [x + 11, y + 35],
      [x + 91, y + 35],
    ]);
    if (i === 0) {
      const pts = Array.from({ length: 40 }, (_, j) => [
        x + 12 + j * 2,
        y + 76 - Math.sin(j * 0.24) * 12 - (j > 20 && j < 27 ? 10 : 0),
      ]);
      path(pts, warm, 1.5);
    } else if (i === 1) {
      for (let j = 0; j < 4; j++)
        path(
          [
            [x + 12, y + 52 + j * 15],
            [x + 85 - (j % 2) * 24, y + 52 + j * 15],
          ],
          j === 2 ? warm : line,
          j === 2 ? 2 : 1,
        );
    } else {
      ["Change", "Conditions", "Checks"].forEach((s, j) =>
        text(s, x + 11, y + 56 + j * 21, 12, muted),
      );
    }
  });
  ctx.globalAlpha = arrival * align * (1 - retain);
  path(
    [
      [58, 172],
      [58, 197],
      [283, 197],
      [283, 172],
    ],
    warm,
  );
  path(
    [
      [170, 172],
      [170, 197],
    ],
    warm,
  );
  text("Collect → Align → Compare → Record", 49, 227, 13);
  text("The next task asks for the same checks.", 37, 256, 13, muted);
  ctx.globalAlpha = arrival * retain;
  const x = mix(15, 5, built),
    y = mix(28, 9, built),
    w = mix(310, 330, built),
    h = mix(225, 263, built);
  // The retained method grows into the final working sequence, in the same frame.
  for (let i = 2; i >= 1; i--) {
    ctx.globalAlpha = arrival * retain * (1 - built) * 0.3;
    sheet(x + i * 5, y - i * 5, w, h);
  }
  ctx.globalAlpha = arrival * retain;
  sheet(x, y, w, h);
  ctx.globalAlpha = arrival * retain * (1 - built);
  text("A method worth keeping", x + 18, y + 30, 19);
  path([
    [x + 18, y + 46],
    [x + w - 18, y + 46],
  ]);
  [
    "Collect the evidence",
    "Keep its reference",
    "Check what changed",
    "Retain the context",
  ].forEach((s, i) => {
    const yy = y + 78 + i * 36;
    text(s, x + 18, yy, 14);
    path(
      [
        [x + w - 37, yy - 5],
        [x + w - 32, yy],
        [x + w - 23, yy - 10],
      ],
      warm,
      1.5,
    );
    if (revise > 0.1 && i === (reduced ? 3 : Math.floor(clock * 0.55) % 4)) {
      ctx.fillStyle = "#b4824020";
      ctx.fillRect(x + 12, yy - 20, w - 24, 29);
    }
  });
  ctx.globalAlpha = arrival * revise * (1 - built);
  text("Use → Revise → Use again", 91, 281, 13, muted);
  ctx.globalAlpha = arrival * built;
  text("Ready for the next task.", x + 19, y + 33, 20);
  path([
    [x + 19, y + 50],
    [x + w - 19, y + 50],
  ]);
  const labels = [
    ["New evidence", "A different run. A new question."],
    ["Retained checks", "The useful sequence stays."],
    ["A result in context", "Keep the reasoning with the answer."],
  ];
  labels.forEach(([title, caption], i) => {
    const yy = y + 82 + i * 65;
    text("0" + (i + 1), x + 19, yy, 12, warm);
    text(title, x + 50, yy, 15);
    text(caption, x + 50, yy + 21, 12, muted);
    if (i < 2) {
      path(
        [
          [x + 26, yy + 11],
          [x + 26, yy + 49],
        ],
        line,
      );
      const t = reduced ? 0.5 : (clock * 0.3) % 1;
      path(
        [
          [x + 26, yy + 11 + t * 29],
          [x + 26, yy + 20 + t * 29],
        ],
        warm,
        2,
      );
    }
  });
  ctx.restore();
}
