// One reversible film: evidence changes; the useful relationships survive.
// Every value below is illustrative, never a captured run or a software result.
import {
  collectionPosition,
  paintCollectionField,
} from "./collection-layout.js";
const clamp = (x) => Math.max(0, Math.min(1, x));
const mix = (a, b, t) => a + (b - a) * t;
const ease = (v) => {
  const x = clamp(v);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const at = (p, start, duration) => ease((p - start) / duration);
const ink = "#253c36",
  muted = "#718079",
  amber = "#b56d33",
  paper = "#f6f3e9";
const pieces = [
  {
    kind: "run",
    w: 370,
    h: 96,
    x: -120,
    y: -245,
    scatter: [0.68, 0.23, 120, -0.09],
  },
  {
    kind: "trace",
    w: 470,
    h: 252,
    x: 155,
    y: -65,
    scatter: [0.2, 0.35, -130, -0.12],
  },
  {
    kind: "recipe",
    w: 210,
    h: 280,
    x: -290,
    y: 106,
    scatter: [0.84, 0.63, 140, 0.12],
  },
  {
    kind: "reference",
    w: 210,
    h: 280,
    x: -55,
    y: 106,
    scatter: [0.48, 0.38, -320, 0.05],
  },
  {
    kind: "values",
    w: 210,
    h: 248,
    x: 510,
    y: -64,
    scatter: [1.04, 0.32, 90, -0.04],
  },
  {
    kind: "note",
    w: 255,
    h: 128,
    x: 208,
    y: 166,
    scatter: [0.57, 0.87, 110, -0.09],
  },
  {
    kind: "report",
    w: 225,
    h: 180,
    x: 500,
    y: 175,
    scatter: [0.94, 0.91, -80, 0.15],
  },
];

function text(c, s, x, y, size = 13, color = ink, weight = 400) {
  c.fillStyle = color;
  c.font = `${weight} ${size}px Geist, Arial`;
  c.fillText(s, x, y);
}
function line(c, points, color = muted, width = 1, alpha = 1) {
  c.save();
  c.globalAlpha *= alpha;
  c.strokeStyle = color;
  c.lineWidth = width;
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.stroke();
  c.restore();
}
function rect(c, x, y, w, h, color, alpha = 1) {
  c.save();
  c.globalAlpha *= alpha;
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
  c.restore();
}
function ring(c, x, y, r, color = amber, fill = false) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.strokeStyle = color;
  c.fillStyle = color;
  fill ? c.fill() : c.stroke();
}
function tick(c, x, y, color = amber) {
  line(
    c,
    [
      [x - 5, y],
      [x - 1, y + 4],
      [x + 7, y - 6],
    ],
    color,
    1.6,
  );
}

// Unequal, paper-like source fragments. No window chrome or invented app interfaces.
function evidence(c, piece, task, reveal) {
  const { kind, w, h } = piece,
    second = task === 1;
  const run = second ? "R / 027" : "R / 026",
    stamp = second ? "09:42:18" : "08:17:06";
  rect(c, -w / 2, -h / 2, w, h, kind === "note" ? "#efe5cf" : paper);
  c.shadowBlur = 0;
  c.shadowOffsetY = 0;
  c.strokeStyle = "#d5d6c9";
  c.lineWidth = 0.75;
  c.strokeRect(-w / 2, -h / 2, w, h);
  c.translate(-w / 2, -h / 2);
  if (kind === "run") {
    text(c, "RUN RECORD", 20, 24, 10, muted, 550);
    text(c, run, 20, 65, 30, ink, 480);
    text(c, stamp, 224, 28, 11, muted);
    text(c, second ? "Revision / 08" : "Revision / 07", 224, 57, 12);
    for (let i = 0; i < 18; i++)
      rect(c, 224 + i * 6, 70, i % 3 === 0 ? 2 : 1, 11, ink, 0.35);
  } else if (kind === "trace") {
    text(c, "PROCESS OBSERVATION", 20, 26, 11, muted, 500);
    text(
      c,
      reveal > 0.18 ? run : "Run context / unassigned",
      w - 184,
      26,
      11,
      reveal > 0.18 ? amber : muted,
    );
    const points = [];
    for (let i = 0; i <= 76; i++) {
      const u = i / 76;
      const v =
        0.57 -
        0.24 * at(u, 0.18, 0.12) +
        0.16 * at(u, second ? 0.58 : 0.5, 0.04) -
        0.08 * at(u, 0.74, 0.13) +
        Math.sin(i * 1.7) * 0.014;
      points.push([28 + u * (w - 53), h * 0.28 + v * h * 0.64]);
    }
    for (let j = 0; j < 4; j++)
      line(
        c,
        [
          [28, 65 + j * 43],
          [w - 25, 65 + j * 43],
        ],
        "#d8ded3",
        0.7,
      );
    line(c, points, ink, 1.7);
    const ex = 28 + (second ? 0.6 : 0.52) * (w - 53);
    if (reveal > 0.25) {
      rect(c, ex - 12, 57, 24, h - 84, amber, at(reveal, 0.25, 0.25) * 0.09);
      line(
        c,
        [
          [ex, 58],
          [ex, h - 28],
        ],
        amber,
        1,
        at(reveal, 0.25, 0.25),
      );
      text(c, "Step 04", ex + 9, 70, 10, amber);
      ring(c, ex, points[second ? 46 : 40][1], 4);
    }
    text(c, "Start", 28, h - 14, 10, muted);
    text(c, "End", w - 44, h - 14, 10, muted);
  } else if (kind === "recipe" || kind === "reference") {
    const ref = kind === "reference";
    text(c, ref ? "REFERENCE" : "RECIPE FRAGMENT", 17, 25, 10, muted, 550);
    text(
      c,
      ref ? "Rev. 06" : second ? "Rev. 08" : "Rev. 07",
      17,
      54,
      23,
      ink,
      450,
    );
    const values = ref
      ? ["00:30", "01:20", "02:00", "00:45", "01:00"]
      : second
        ? ["00:30", "01:20", "02:00", "01:05", "01:00"]
        : ["00:30", "01:20", "02:00", "00:55", "01:00"];
    for (let i = 0; i < 5; i++) {
      const yy = 92 + i * 34;
      if (i === 3) rect(c, 12, yy - 19, w - 24, 29, amber, 0.12 * reveal);
      text(c, `0${i + 1}`, 18, yy, 12, muted);
      text(c, ["Prepare", "Ramp", "Hold", "Settle", "Close"][i], 51, yy, 12);
      text(c, values[i], 148, yy, 12, i === 3 && reveal > 0.35 ? amber : ink);
      line(
        c,
        [
          [17, yy + 11],
          [w - 17, yy + 11],
        ],
        "#d9dccc",
        0.7,
      );
    }
  } else if (kind === "values") {
    text(c, "MEASUREMENT SERIES", 17, 25, 10, muted, 550);
    text(
      c,
      reveal > 0.55 ? "Context / step 04" : "Context / —",
      17,
      52,
      12,
      reveal > 0.55 ? amber : muted,
    );
    for (let i = 0; i < 5; i++) {
      const y = 86 + i * 29;
      text(c, String(i + 1).padStart(2, "0"), 17, y, 11, muted);
      text(c, (0.412 + Math.sin(i * 2.1 + task) * 0.026).toFixed(3), 57, y, 15);
      ring(c, 155 + Math.sin(i * 2.1 + task) * 18, y - 5, 2.5, ink, true);
    }
    text(c, "Illustrative values", 17, h - 15, 9, muted);
  } else if (kind === "note") {
    text(c, "REVIEW NOTE", 17, 24, 10, "#85765f", 550);
    text(c, "Check the settling step.", 17, 55, 16);
    text(c, "Was the reference unchanged?", 17, 80, 13);
    if (reveal > 0.75) {
      tick(c, 21, 105);
      text(c, "Attached to step 04", 37, 110, 10, amber);
    }
  } else {
    text(c, "INVESTIGATION RECORD", 17, 25, 10, muted, 550);
    text(c, run, 17, 60, 22);
    ["Source identified", "Reference compared", "Observation recorded"].forEach(
      (s, i) => {
        const yy = 96 + i * 27;
        text(c, s, 35, yy, 11);
        if (reveal > 0.72 + i * 0.075) tick(c, 22, yy - 4);
        else {
          c.strokeStyle = "#a5b0a1";
          c.strokeRect(17, yy - 11, 8, 8);
        }
      },
    );
  }
}

function pose(a, b, t) {
  return a.map((v, i) => mix(v, b[i], t));
}
function sheet(c, p, draw, alpha = 1, shadow = true) {
  if (alpha < 0.002) return;
  const [x, y, s, z, rot, tilt = 0] = p,
    k = 1500 / (1500 - z);
  c.save();
  c.globalAlpha *= alpha;
  c.translate(x, y);
  c.rotate(rot);
  c.transform(
    s * k,
    Math.sin(tilt) * s * 0.12,
    Math.sin(tilt) * s * 0.22,
    s * k * Math.cos(tilt),
    0,
    0,
  );
  if (shadow) {
    c.shadowColor = "#22352c19";
    c.shadowBlur = 32;
    c.shadowOffsetY = 12;
  }
  draw(c);
  c.restore();
}

function casePos(i, w, h, scale = 1) {
  const m = w < 700,
    q = pieces[i],
    unit = Math.min(w / (m ? 960 : 1500), h / 900) * scale;
  return [
    w * (m ? 0.48 : 0.64) + q.x * unit,
    h * (m ? 0.43 : 0.55) + q.y * unit,
    unit,
    0,
    0,
    0,
  ];
}
function scattered(i, w, h) {
  const q = pieces[i],
    m = w < 700,
    [x, y, z, r] = q.scatter;
  if (m)
    return [
      w * (0.5 + (x - 0.5) * 1.05),
      h * (0.19 + y * 0.46),
      w / 780,
      z * 0.35,
      r,
      0.1,
    ];
  return [
    w * x,
    h * y,
    Math.min(w / 1460, h / 820) * (0.75 + (i % 3) * 0.09),
    z,
    r,
    -0.09 + i * 0.035,
  ];
}

// These marks are the actual registration of the source pair above. They remain
// in place when records are cleared, then become the boundaries of the software.
function retainedGuide(c, p, w, h, alpha, development = 0) {
  const write = (...args) => {
    c.save();
    c.globalAlpha *= 1 - at(p, 7.16, 0.26);
    text(c, ...args);
    c.restore();
  };
  if (alpha < 0.002) return;
  const m = w < 700,
    unit = Math.min(w / (m ? 1030 : 1500), h / 900);
  const move = at(p, 4.58, 0.8),
    form = at(p, 5.45, 0.85),
    execute = at(p, 6.35, 0.82);
  const normal = [
    w * (m ? 0.48 : 0.64) - 174 * unit,
    h * (m ? 0.43 : 0.55) + 106 * unit,
    unit,
    0,
    0,
    0,
  ];
  const inspected = [
    w * (m ? 0.51 : 0.7),
    h * (m ? 0.4 : 0.6),
    unit * (m ? 1.9 : 1.36),
    80,
    -0.13,
    -0.15,
  ];
  const structure = [
    w * (m ? 0.5 : 0.72),
    h * (m ? 0.4 : 0.52),
    unit * (m ? 1.75 : 1.22),
    65,
    -0.06,
    0.38,
  ];
  let position = pose(pose(normal, inspected, move), structure, form);
  position[4] = mix(position[4], -0.04, execute);
  position[5] = mix(position[5], 0.28, execute);
  const passage = at(p, 7.24, 0.52);
  position[0] = mix(position[0], w * 0.55, passage);
  position[2] *= 1 + passage * 4;
  position[4] *= 1 - passage;
  position[5] *= 1 - passage;
  sheet(
    c,
    position,
    (c) => {
      const depth = development * 12;
      // The side register, row correspondence and check are kept, not the values.
      const material = c.createLinearGradient(-245, -164, 245, 166);
      material.addColorStop(0, execute > 0.1 ? "#364d40" : "#ebe9dc");
      material.addColorStop(1, execute > 0.1 ? "#101f18" : "#d5ddcb");
      c.save();
      c.globalAlpha *= form;
      c.fillStyle = material;
      c.fillRect(-245, -164, 490, 330);
      c.restore();
      const localInk = execute > 0.1 ? "#dce5d2" : ink;
      const localRule = execute > 0.1 ? "#758e79" : "#6f8b7a";
      c.shadowBlur = 0;
      c.shadowOffsetY = 0;
      if (form > 0) {
        line(
          c,
          [
            [-245, -164],
            [-245 + depth, -164 - depth],
            [245 + depth, -164 - depth],
            [245 + depth, 166 - depth],
            [245, 166],
          ],
          "#8d9c8b",
          1,
          form,
        );
        c.strokeStyle = "#7f9583";
        c.lineWidth = 1;
        c.strokeRect(-245, -164, 490, 330);
      }
      for (let side = 0; side < 2; side++) {
        const xx = -225 + side * 235;
        line(
          c,
          [
            [xx + 20, -144],
            [xx, -144],
            [xx, 137],
            [xx + 20, 137],
          ],
          amber,
          1.5,
        );
        for (let row = 0; row < 5; row++) {
          const y = -48 + row * 34;
          line(
            c,
            [
              [xx + 4, y],
              [xx + 200, y],
            ],
            row === 3 ? amber : localRule,
            row === 3 ? 1.7 : 0.7,
            row === 3 ? 1 : 0.5,
          );
          if (form > 0.01)
            write(
              String(row + 1).padStart(2, "0"),
              xx + 9,
              y - 8,
              9,
              localRule,
            );
        }
        if (move > 0.01)
          write(
            side ? "Reference" : "Observation",
            xx + 10,
            -108,
            12,
            localInk,
            500,
          );
        if (execute > 0) {
          c.save();
          c.globalAlpha *= execute;
          ["Prepare", "Ramp", "Hold", "Settle", "Close"].forEach((label, j) => {
            write(label, xx + 37, -56 + j * 34, 11, localInk);
            write(
              j === 3
                ? side
                  ? "00:45"
                  : "01:05"
                : ["00:30", "01:20", "02:00", "", "01:00"][j],
              xx + 145,
              -56 + j * 34,
              11,
              j === 3 ? "#e6b779" : localInk,
            );
          });
          c.restore();
        }
      }
      // Four unchanged rows can recede because the comparison retains their identity.
      line(
        c,
        [
          [-25, 54],
          [10, 54],
        ],
        amber,
        2,
      );
      ring(c, -8, 54, 4, amber, true);
      if (move > 0.01) {
        write("CORRESPONDENCE / RETAINED", -225, 195, 10, amber, 500);
        tick(c, 227, 151);
      }
      if (execute > 0.01) {
        rect(c, -245, -164, 490, 40, "#253b31", execute);
        c.save();
        c.globalAlpha *= execute;
        write("Reference loaded", -229, -140, 11, "#dfe6d5");
        ring(c, 220, -145, 3, "#d6b181", true);
        rect(c, 92, 121, 134, 30, "#284437");
        write(
          p > 6.92
            ? "Compared  ✓"
            : p > 6.65
              ? "Comparing…"
              : "Run the check  →",
          102,
          140,
          11,
          "#f1eddf",
        );
        c.restore();
        const scan = mix(-47, 88, at(p, 6.48, 0.7));
        rect(c, -205, scan, 401, 26, amber, 0.12 * execute);
        if (p > 6.92) {
          tick(c, 62, 136);
          write("Ready again", -225, 142, 11, localInk);
        }
      }
    },
    alpha,
    false,
  );
}

function contextLinks(c, p, w, h, alpha = 1) {
  const u = Math.min(w / (w < 700 ? 960 : 1500), h / 900),
    source = casePos(0, w, h),
    trace = casePos(1, w, h),
    recipe = casePos(2, w, h),
    ref = casePos(3, w, h),
    note = casePos(5, w, h);
  const links = [
    [
      [source[0] + 105 * u, source[1] + 30 * u],
      [source[0] + 200 * u, source[1] + 30 * u],
      [trace[0] + 150 * u, trace[1] - 110 * u],
    ],
    [
      [recipe[0] + 90 * u, recipe[1] + 54 * u],
      [ref[0] - 95 * u, ref[1] + 54 * u],
    ],
    [
      [ref[0] + 97 * u, ref[1] + 54 * u],
      [trace[0] + 8 * u, ref[1] + 54 * u],
      [trace[0] + 8 * u, trace[1] + 24 * u],
    ],
    [
      [note[0], note[1] - 62 * u],
      [note[0], trace[1] + 125 * u],
    ],
  ];
  links.forEach((points, i) => {
    const t = at(p, 1.95 + i * 0.16, 0.35);
    if (!t) return;
    c.save();
    c.globalAlpha *= alpha;
    line(c, points, amber, 1.1, t * 0.7);
    const start = points[0],
      end = points.at(-1);
    ring(
      c,
      mix(start[0], end[0], t),
      mix(start[1], end[1], t),
      2.4,
      amber,
      true,
    );
    c.restore();
  });
}

export function drawStartingOver(
  c,
  { width: w, height: h, p, px = 0, py = 0, clock = 0 },
) {
  const m = w < 700,
    entry = at(p, 0.84, 0.5),
    mature = at(p, 6.12, 1.12),
    release = at(p, 7.24, 0.92);
  // Enter the pale working field through the opening's inspection light.
  paintCollectionField(c, w, h);
  if (mature < 1) {
    c.save();
    // The light work surface withdraws into depth, revealing the environment behind it.
    c.translate(-mature * w * 1.25, mature * h * 0.06);
    c.transform(1, -mature * 0.08, mature * 0.1, 1, 0, 0);
    const illumination = c.createLinearGradient(0, 0, w, h);
    illumination.addColorStop(0, "#dce1d1");
    illumination.addColorStop(0.52, "#fbf9f1");
    illumination.addColorStop(1, "#dfe1d3");
    c.shadowColor = "#0008";
    c.shadowBlur = 55 * mature;
    c.shadowOffsetX = 25 * mature;
    c.fillStyle = illumination;
    c.fillRect(-w * 0.2, -h * 0.2, w * 1.2, h * 1.4);
    c.restore();
  }
  c.save();
  c.globalAlpha = entry;
  const gather = at(p, 1.72, 1.12),
    clear = at(p, 2.87, 0.43),
    incoming = at(p, 3.25, 0.65),
    again = at(p, 3.77, 0.79),
    keep = at(p, 4.28, 0.56);
  const camera = at(p, 1.6, 0.95);
  // First task: seven unlike fragments find context in a deliberately staggered order.
  if (p < 3.42) {
    const archive = clear;
    const objects = pieces.map((q, i) => {
      const settle = at(p, 1.72 + i * 0.105, 0.43),
        from = scattered(i, w, h),
        to = casePos(i, w, h);
      let pos = pose(from, to, settle);
      const ax = w * 0.86,
        ay = h * 0.25,
        shrink = 1 - archive * 0.93;
      pos[0] = mix(pos[0], ax + (pos[0] - w * 0.64) * 0.07, archive);
      pos[1] = mix(pos[1], ay + (pos[1] - h * 0.55) * 0.07, archive);
      pos[2] *= shrink;
      pos[3] -= archive * 280;
      pos[4] += archive * 0.2;
      pos[0] += px * (1 - camera) * (i - 2) * 3;
      pos[1] += py * (1 - camera) * (i - 2) * 2;
      return { q, pos, i, settle };
    });
    objects
      .sort((a, b) => a.pos[3] - b.pos[3])
      .forEach(({ q, pos, i, settle }) =>
        sheet(c, pos, (c) => evidence(c, q, 0, gather), 1 - at(p, 3.2, 0.13)),
      );
    if (clear < 0.05) {
      contextLinks(c, p, w, h, 1 - clear);
      retainedGuide(c, 2.6, w, h, at(p, 2.3, 0.35) * 0.55 * (1 - clear));
    }
    if (clear > 0.4) {
      c.save();
      c.globalAlpha = at(clear, 0.4, 0.3) * (1 - at(p, 3.25, 0.16));
      text(c, "R / 026   •   RECORDED", w * 0.73, h * 0.32, m ? 9 : 11, muted);
      c.restore();
    }
  }
  // There is a genuine empty interval after archiving, before the next records enter.
  if (p > 3.25 && p < 5.48) {
    const depart = at(p, 4.42, 0.44);
    pieces.forEach((q, i) => {
      let to = casePos(i, w, h),
        from = scattered(i, w, h, 1);
      from[0] += w * (0.2 + (i % 3) * 0.18) * (1 - incoming);
      from[3] += 150 * (1 - incoming);
      let pos = pose(from, to, at(p, 3.76 + i * 0.06, 0.43));
      // Source paper peels away; the comparison register stays at exactly this location.
      pos[0] += depart * w * (0.4 + i * 0.025);
      pos[1] += depart * h * (0.18 + i * 0.02);
      pos[3] -= depart * 350;
      pos[4] += depart * (i % 2 ? 0.22 : -0.18);
      const visibility = incoming * (1 - depart);
      sheet(c, pos, (c) => evidence(c, q, 1, again), visibility);
    });
    if (p < 4.48) contextLinks(c, p - 1.85, w, h, again * 0.72);
  }
  retainedGuide(c, p, w, h, keep * (1 - at(p, 7.57, 0.22)), at(p, 5.43, 0.7));
  // The retained comparison grows into distinct spaces for source, check and record.
  if (p > 5.36 && p < 7.4) {
    const grow = at(p, 5.36, 0.8),
      built = at(p, 6.25, 0.75),
      away = at(p, 6.08, 0.48);
    const unit = Math.min(w / (m ? 980 : 1550), h / 950);
    const slots = [
      [-175, -170, "Source", 0],
      [50, -215, "Check", 1],
      [280, -170, "Record", 2],
    ];
    slots.forEach(([x, y, name, i]) => {
      const spread = at(p, 5.4 + i * 0.12, 0.48),
        pos = [
          w * (m ? 0.5 : 0.72) + x * unit * spread,
          h * (m ? 0.4 : 0.45) + y * unit * spread,
          unit * 0.44,
          -100 * (1 - spread),
          mix(-0.13, (i - 1) * 0.075, grow),
          0.15,
        ];
      sheet(
        c,
        pos,
        (c) => {
          rect(c, -120, -90, 240, 180, mature > 0.35 ? "#20372c" : "#e1e5d7");
          c.shadowBlur = 0;
          c.strokeStyle = mature > 0.35 ? "#769080" : "#8d9d88";
          c.strokeRect(-120, -90, 240, 180);
          const col = mature > 0.35 ? "#d5ddcd" : ink;
          text(c, name, -102, -65, 12, col, 500);
          if (i === 0) {
            for (let k = 0; k < 4; k++) {
              text(c, `0${k + 1}`, -100, -26 + k * 23, 10, col);
              line(
                c,
                [
                  [-73, -30 + k * 23],
                  [70, -30 + k * 23],
                ],
                col,
                0.8,
                0.5,
              );
            }
          } else if (i === 1) {
            ring(c, 0, 8, 42, col);
            line(
              c,
              [
                [-23, 9],
                [-5, 25],
                [27, -13],
              ],
              amber,
              2.5,
              built,
            );
            if (built > 0.1) text(c, "Repeatable", -32, 71, 10, col);
          } else {
            for (let k = 0; k < 3; k++) {
              rect(c, -99, -35 + k * 32, 7, 7, col, 0.7);
              line(
                c,
                [
                  [-78, -32 + k * 32],
                  [80 - k * 17, -32 + k * 32],
                ],
                col,
                1,
              );
            }
          }
        },
        spread * (1 - away),
        false,
      );
    });
  }
  if (release > 0) {
    const fan = at(p, 7.6, 0.55);
    if (p > 7.48)
      for (let i = 15; i >= 0; i--) {
        const destination = collectionPosition(i, w, h),
          k = 1600 / (1600 - destination.z);
        const toX = w * 0.5 + (destination.x - w * 0.5) * k,
          toY = h * 0.5 + (destination.y - h * 0.5) * k;
        const x = mix(w * 0.69 + ((i % 4) - 1.5) * w * 0.06, toX, fan),
          y = mix(h * 0.51 + (Math.floor(i / 4) - 1.5) * h * 0.07, toY, fan);
        const ww = mix(w * 0.1, 240 * destination.scale * k, fan),
          hh = mix(h * 0.11, 191 * destination.scale * k, fan);
        c.save();
        c.globalAlpha = at(p, 7.49 + i * 0.006, 0.21);
        c.fillStyle = "#15271c";
        c.fillRect(x - ww / 2, y - hh / 2, ww, hh);
        c.strokeStyle = "#849784";
        c.lineWidth = 0.75;
        c.strokeRect(x - ww / 2, y - hh / 2, ww, hh);
        line(
          c,
          [
            [x - ww / 2, y - hh / 2],
            [x - ww / 2 + ww * 0.12, y - hh / 2],
          ],
          "#d1aa76",
          1.6,
        );
        c.restore();
      }
  }
  c.restore();
}
