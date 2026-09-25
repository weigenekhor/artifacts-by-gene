import { mix, ease, clamp } from "./space.js";
import {
  collectionPosition,
  paintCollectionField,
} from "./collection-layout.js";
const TAU = Math.PI * 2;
const roles = ["Reference", "Compare", "Check", "Keep"];
const fragments = [
  "Run / A",
  "Prior revision",
  "Observation",
  "Check required",
  "Run / B",
  "Baseline",
  "Changed state",
  "Review note",
  "Run / C",
  "Reference recovered",
  "Measurement",
  "Follow-up",
  "Run / D",
  "Known condition",
  "Comparison",
  "Recorded result",
];
const lerpPoint = (a, b, t) => a.map((v, i) => mix(v, b[i], t));
// Evidence keeps its identity as fragments become patterns, memory, a tested method and architecture.
export function drawOriginConstruction(
  c,
  { width: w, height: h, p, px, py, reduced },
) {
  const mobile = w < 700,
    recognise = ease((p - 1.72) / 0.66),
    retain = ease((p - 2.7) / 0.7),
    improve = ease((p - 3.72) / 0.66),
    build = ease((p - 4.64) / 0.7),
    open = ease((p - 5.15) / 0.6);
  const dark = build > 0.44,
    ink = dark ? "#d0d8ce" : "#294439",
    muted = dark ? "#97aca0" : "#6a7b69",
    accent = dark ? "#e0b782" : "#a26934";
  c.fillStyle = "#eaeae0";
  c.fillRect(0, 0, w, h);
  const path = (pts, color = ink, lw = 1, a = 1, dash = []) => {
    c.save();
    c.globalAlpha *= a;
    c.strokeStyle = color;
    c.lineWidth = lw;
    c.setLineDash(dash);
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke();
    c.restore();
  };
  const text = (s, x, y, size = 12, col = muted, align = "left") => {
    c.fillStyle = col;
    c.font = `400 ${size}px Geist, Arial`;
    c.textAlign = align;
    c.fillText(s, x, y);
    c.textAlign = "left";
  };
  const circle = (x, y, r, col = accent, fill = false) => {
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.strokeStyle = col;
    c.fillStyle = col;
    fill ? c.fill() : c.stroke();
  };
  const methodY = mobile ? 0.39 : mix(0.64, 0.44, improve);
  const route = (i) => [
    w * (0.14 + (i % 4) * 0.24),
    h * (methodY + Math.sin((i % 4) * 1.5) * 0.055 * (1 - improve)),
  ];
  // Darkness is the face of the constructed environment advancing through the paper field.
  if (build > 0) {
    const growth = 0.03 + ease(build / 0.82) * 1.5,
      cx = w * 0.5,
      cy = h * 0.46;
    c.save();
    c.translate(cx, cy);
    c.scale(growth, growth);
    const pts = [
      [-w * 0.65, -h * 0.55],
      [w * 0.7, -h * 0.69],
      [w * 0.8, h * 0.65],
      [-w * 0.7, h * 0.75],
    ];
    c.shadowColor = "#17281e80";
    c.shadowBlur = 60;
    c.shadowOffsetY = 32;
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    const material = c.createLinearGradient(
      -w * 0.4,
      -h * 0.6,
      w * 0.2,
      h * 0.5,
    );
    material.addColorStop(0, "#24372c");
    material.addColorStop(0.38, "#101d17");
    material.addColorStop(1, "#050708");
    c.fillStyle = material;
    c.fill();
    c.shadowBlur = 0;
    path([...pts, pts[0]], "#718579", 1.2);
    path(
      pts.map(([x, y]) => [x, y + 15]),
      "#18281e",
      7,
    );
    c.restore();
  }
  if (open > 0.3) {
    c.save();
    c.globalAlpha = ease((open - 0.3) / 0.7);
    paintCollectionField(c, w, h);
    c.restore();
  }
  const samples = Array.from({ length: 16 }, (_, i) => {
    const row = Math.floor(i / 4),
      col = i % 4;
    const fragment = [
      w * (-0.035 + (((i * 7) % 17) / 16) * 1.08),
      h * (0.22 + (((i * 5) % 13) / 12) * (mobile ? 0.27 : 0.37)),
    ];
    const pattern = [
      w * (0.12 + col * 0.25),
      h * (0.22 + row * (mobile ? 0.078 : 0.103)),
    ];
    const memory = route(i);
    const arrive = ease((p - 1.01) / 0.43),
      carried = [
        fragment[0],
        h * 0.38 +
          col * 16 +
          Math.sin((fragment[0] / w) * 9 + col * 0.2) * h * 0.04,
      ];
    let pos = lerpPoint(
      lerpPoint(carried, fragment, arrive),
      pattern,
      recognise,
    );
    pos = lerpPoint(pos, memory, retain);
    const to = collectionPosition(i, w, h),
      k = 1600 / (1600 - to.z);
    const final = [
      w * 0.5 + (to.x - w * 0.5) * k,
      h * 0.5 + (to.y - h * 0.5) * k,
    ];
    const assembled = [
      memory[0] + (row - 1.5) * w * 0.034,
      memory[1] + (row - 1.5) * h * 0.082 + h * 0.12,
    ];
    pos = lerpPoint(pos, assembled, build);
    pos = lerpPoint(pos, final, open);
    return { i, row, col, pos, to, k };
  });
  // Recurrence: different runs share a relation, while their local traces remain different.
  if (recognise > 0.01 && retain < 1) {
    for (let row = 0; row < 4; row++) {
      const points = samples.filter((s) => s.row === row).map((s) => s.pos);
      path(points, muted, 1, recognise * (1 - retain) * 0.35, [3, 6]);
      if (!mobile)
        text(
          ["Run / A", "Run / B", "Run / C", "Run / D"][row],
          w * 0.025,
          points[0][1] + 32,
          10,
          muted,
        );
    }
    for (let col = 0; col < 4; col++) {
      const points = samples.filter((s) => s.col === col).map((s) => s.pos);
      path(points, accent, 1.7, recognise * (1 - retain) * 0.65);
    }
  }
  // A single retained spine outlasts the temporary observations that discovered it.
  if (retain > 0 && build < 1) {
    const pts = [0, 1, 2, 3].map(route),
      a = retain * (1 - build);
    path(pts, ink, 2.2, a);
    for (let i = 0; i < 3; i++) {
      const [x, y] = pts[i],
        end = pts[i + 1];
      const detour = [
        [x, y],
        [mix(x, end[0], 0.25), y + h * 0.105],
        [mix(x, end[0], 0.78), end[1] + h * 0.105],
        end,
      ];
      path(detour, muted, 1, a * (1 - improve) * 0.48, [3, 5]);
      // Iteration tests the retained route, then removes the unnecessary detour.
      if (improve > 0) {
        const t = clamp((p - 3.74 - i * 0.1) / 0.45),
          head = lerpPoint(pts[i], end, ease(t));
        circle(...head, 4, accent, true);
      }
    }
    for (let i = 0; i < 4; i++) {
      const [x, y] = pts[i],
        size = mix(17, 23, improve);
      c.save();
      c.globalAlpha = a;
      c.fillStyle = "#eaeae0";
      c.fillRect(x - size, y - size, size * 2, size * 2);
      path(
        [
          [x - size, y - size],
          [x + size, y - size],
          [x + size, y + size],
          [x - size, y + size],
          [x - size, y - size],
        ],
        ink,
        1.5,
      );
      path(
        [
          [x - 5, y],
          [x - 1, y + 4],
          [x + 6, y - 5],
        ],
        accent,
        1.8,
      );
      text(roles[i], x, y + size + 26, mobile ? 11 : 14, ink, "center");
      c.restore();
    }
  }
  samples.forEach(({ i, row, col, pos: [x, y], to, k }) => {
    const persistent = row === 0 ? 1 : 1 - retain,
      alpha = (1 - build) * persistent;
    const fw = mobile ? w * 0.21 : w * 0.155,
      fh = h * (mobile ? 0.047 : 0.056);
    if (alpha > 0.01) {
      c.save();
      c.globalAlpha = alpha * (1 - retain * 0.65);
      c.translate(x, y);
      c.rotate((1 - recognise) * Math.sin(i * 2.4) * 0.11);
      const pts = [];
      for (let j = 0; j < 26; j++) {
        const u = j / 25;
        pts.push([
          (u - 0.5) * fw,
          Math.sin(u * (10 + col * 3) + row) * fh * 0.22 +
            Math.sin(u * 25) * fh * 0.08,
        ]);
      }
      // Missing stretches precede reconstructed correspondence.
      if (col === 0) {
        path(
          [
            [-fw * 0.5, 0],
            [-fw * 0.08, 0],
          ],
          ink,
          1.4,
        );
        path(
          [
            [fw * 0.12, 0],
            [fw * 0.5, 0],
          ],
          ink,
          1.4,
        );
        for (let j = 0; j < 5; j++) {
          const xx = -fw * 0.43 + j * fw * 0.2;
          path(
            [
              [xx, -fh * 0.15],
              [xx, fh * 0.15],
            ],
            ink,
            1.2,
          );
          circle(xx, 0, 2, ink, true);
        }
      } else if (col === 1) {
        path(
          [
            [-fw * 0.5, -fh * 0.14],
            [-fw * 0.03, -fh * 0.14],
            [-fw * 0.03, -fh * 0.31],
            [fw * 0.35, -fh * 0.31],
          ],
          ink,
          1.5,
        );
        path(
          [
            [-fw * 0.3, fh * 0.2],
            [fw * 0.15, fh * 0.2],
            [fw * 0.15, fh * 0.05],
            [fw * 0.5, fh * 0.05],
          ],
          muted,
          1.2,
        );
      } else if (col === 2) {
        path(pts.slice(0, 10), accent, 1.7);
        path(pts.slice(13), accent, 1.7);
      } else {
        path(
          [
            [-fw * 0.4, 0],
            [-fw * 0.13, 0],
            [-fw * 0.13, -fh * 0.32],
            [fw * 0.3, -fh * 0.32],
          ],
          ink,
          1.3,
        );
        path(
          [
            [-fw * 0.13, 0],
            [-fw * 0.13, fh * 0.25],
            [fw * 0.12, fh * 0.25],
          ],
          muted,
          1,
          1,
          [3, 4],
        );
        circle(fw * 0.36, -fh * 0.32, 4, ink);
      }

      path(
        [
          [-fw * 0.5, -fh * 0.5],
          [-fw * 0.5, -fh * 0.2],
        ],
        muted,
        1,
      );
      path(
        [
          [fw * 0.5, fh * 0.2],
          [fw * 0.5, fh * 0.5],
        ],
        muted,
        1,
      );
      if (!mobile || i % 2 === 0)
        text(
          recognise > 0.65 ? roles[col] : fragments[i],
          -fw * 0.5,
          -fh * 0.72,
          mobile ? 9 : 12,
          muted,
        );
      if (!mobile && recognise < 0.5)
        text(
          [
            "context missing",
            "reference needed",
            "check pending",
            "note retained",
          ][col],
          fw * 0.5,
          fh * 0.8,
          10,
          muted,
          "right",
        );
      c.restore();
    }
    // Four retained operations generate a sixteen-position software architecture.
    if (build > 0) {
      const ww = mix(w * (mobile ? 0.12 : 0.15), 240 * to.scale * k, open),
        hh = mix(h * 0.085, 191 * to.scale * k, open),
        depth = (1 - open) * build * 24;
      const tilt = (1 - open) * 0.19,
        dx = Math.sin(i) * depth;
      const poly = [
        [-ww / 2, -hh / 2],
        [ww / 2, -hh / 2 - ww * tilt],
        [ww / 2, hh / 2 - ww * tilt],
        [-ww / 2, hh / 2],
      ];
      c.save();
      c.translate(x, y);
      c.globalAlpha = ease((build - col * 0.07) / 0.65);
      c.shadowColor = "#0007";
      c.shadowBlur = depth * 1.8;
      c.shadowOffsetY = depth * 0.4;
      c.beginPath();
      poly.forEach(([a, b], j) => (j ? c.lineTo(a, b) : c.moveTo(a, b)));
      c.closePath();
      const fill = c.createLinearGradient(-ww / 2, -hh / 2, ww / 2, hh / 2);
      fill.addColorStop(0, "#24382e");
      fill.addColorStop(1, "#0a120e");
      c.fillStyle = fill;
      c.fill();
      c.shadowBlur = 0;
      path([...poly, poly[0]], "#758e7d", 0.9);
      if (depth > 1)
        path(
          [
            [ww / 2, -hh / 2 - ww * tilt],
            [ww / 2 + dx, depth - hh / 2 - ww * tilt],
            [ww / 2 + dx, hh / 2 + depth - ww * tilt],
            poly[2],
          ],
          "#3b5546",
          1,
        );
      path(
        [poly[0], [poly[0][0] + ww * 0.24, poly[0][1] - ww * tilt * 0.24]],
        "#c7aa79",
        1.7,
      );
      if (open < 0.7)
        text(
          String(i + 1).padStart(2, "0"),
          -ww / 2 + 8,
          hh / 2 - 8,
          10,
          "#8b9f8f",
        );
      c.restore();
    }
  });
}
