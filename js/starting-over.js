// Editorial evidence, never a reconstructed screenshot or measured result.
// The same relationships survive both tasks and become the collection's frames.
import {
  collectionPosition,
  paintCollectionField,
} from "./collection-layout.js";
import { at, mix } from "./films/drawing.js";
const TAU = Math.PI * 2;
function stroke(c, points, color, width = 1) {
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.strokeStyle = color;
  c.lineWidth = width;
  c.stroke();
}
function dot(c, x, y, r, color) {
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fillStyle = color;
  c.fill();
}
function frame(c, x, y, w, h, color, t = 1) {
  const points = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
    [x, y],
  ];
  let remaining = t * 2 * (w + h);
  c.beginPath();
  c.moveTo(x, y);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i],
      len = Math.hypot(b[0] - a[0], b[1] - a[1]),
      u = Math.min(1, remaining / len);
    c.lineTo(mix(a[0], b[0], u), mix(a[1], b[1], u));
    remaining -= len;
    if (remaining <= 0) break;
  }
  c.strokeStyle = color;
  c.lineWidth = 1;
  c.stroke();
}
function fragment(c, type, variant, color, accent) {
  if (type === 0) {
    // Observations without their reference.
    const pts = [];
    for (let i = 0; i < 35; i++) {
      const x = -88 + i * 5,
        y =
          10 * Math.sin(i * 0.27 + variant) +
          22 * Math.exp(-(((i - 20 - variant * 3) / 5) ** 2));
      pts.push([x, -y]);
    }
    stroke(c, pts, color, 1.7);
    [2, 11, 19, 28, 34].forEach((i) => dot(c, ...pts[i], 3, accent));
  } else if (type === 1) {
    // Two incomplete sequences.
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < 4; i++) {
        const x = -73 + i * 46 + (row ? variant * 7 : 0),
          y = -21 + row * 42;
        stroke(
          c,
          [
            [x, y - 9],
            [x + 24, y - 9],
            [x + 24, y + 9],
            [x, y + 9],
          ],
          color,
          1.2,
        );
        if (i === 2 && row)
          stroke(
            c,
            [
              [x + 4, y],
              [x + 19, y],
            ],
            accent,
            2,
          );
      }
  } else if (type === 2) {
    // A spatial measurement set.
    for (let i = 0; i < 12; i++) {
      const a = i * 2.4,
        r = 18 + Math.sqrt(i) * 15;
      dot(
        c,
        Math.cos(a) * r,
        Math.sin(a) * r * 0.7,
        2.5,
        i % 4 === 0 ? accent : color,
      );
    }
  } else {
    // Isolated intervals become a shared sequence.
    for (let i = 0; i < 5; i++) {
      const x = -77 + i * 37,
        y = (i % 2 ? 1 : -1) * (12 + variant * 4);
      stroke(
        c,
        [
          [x, y - 14],
          [x, y + 14],
        ],
        color,
        1.3,
      );
      dot(c, x, y, 3, color);
    }
  }
}
export function drawStartingOver(
  c,
  { width: w, height: h, p, px = 0, py = 0 },
) {
  const mobile = w < 700,
    dark = at(p, 5.25, 0.75),
    ink = dark > 0.48 ? "#b7c7b7" : "#30473d",
    muted = dark > 0.48 ? "#6c8978" : "#a0aa95",
    accent = dark > 0.48 ? "#dcba82" : "#a76634";
  c.save();
  c.fillStyle = "#eaeae0";
  c.fillRect(0, 0, w, h);
  if (dark > 0) {
    c.save();
    c.globalAlpha *= dark;
    paintCollectionField(c, w, h);
    c.restore();
  }
  const unit = Math.min(w / (mobile ? 650 : 1230), h / (mobile ? 940 : 830));
  const retain = at(p, 3.92, 0.55),
    handoff = at(p, 5.65, 0.78);
  const cx = mix(w * (mobile ? 0.5 : 0.64), w * (mobile ? 0.5 : 0.73), retain),
    cy = h * (mobile ? 0.37 : mix(0.46, 0.55, retain));
  const layout = [
    [-138, -93],
    [132, -72],
    [-131, 98],
    [142, 112],
  ];
  const scatter = [
    [-480, -146],
    [285, -221],
    [-310, 129],
    [323, 194],
  ];
  const second = p > 2.91,
    arrive = second ? at(p, 2.93, 0.3) : at(p, 0.94, 0.37),
    join = second ? at(p, 3.22, 0.58) : at(p, 1.56, 0.7);
  const clear = second ? at(p, 3.95, 0.42) : at(p, 2.47, 0.32);
  const presence = arrive * (1 - clear);

  const spread = mix(1.04, mobile ? 1.13 : 1.25, join) * (1 - handoff * 0.17);
  c.save();
  c.translate(cx + px * unit * 4, cy + py * unit * 3);
  c.scale(unit * spread, unit * spread);
  // Registration is drawn in an order; observations move into those relationships.
  const guide = second
    ? Math.max(at(p, 3.36, 0.4), retain)
    : at(p, 1.81, 0.4) * (1 - at(p, 2.52, 0.27));
  const relationships = [
    [-138, -93, 132, -72],
    [132, -72, 142, 112],
    [142, 112, -131, 98],
    [-131, 98, -138, -93],
  ];
  c.save();
  c.globalAlpha *= guide * (1 - handoff);
  relationships.forEach(([x1, y1, x2, y2], i) => {
    const t = second
      ? at(p, 3.27 + i * 0.08, 0.38)
      : at(p, 1.72 + i * 0.105, 0.35);
    const a = [x1, y1],
      b = [x2, y2];
    stroke(
      c,
      [a, [mix(x1, x2, t), mix(y1, y2, t)]],
      i === 0 ? accent : muted,
      i === 0 ? 1.9 : 1.1,
    );
    if (t > 0.9) dot(c, x2, y2, 4, accent);
  });
  // Two correspondence rails remain when both transient comparisons have left.
  for (let i = 0; i < 4; i++) {
    const x = 59 + i * 46;
    stroke(
      c,
      [
        [x, -105],
        [x, -48],
      ],
      accent,
      0.85,
    );
  }
  c.restore();
  for (let i = 0; i < 4; i++) {
    const t = second
      ? at(p, 3.17 + i * 0.09, 0.43)
      : at(p, 1.48 + i * 0.12, 0.54);
    let x = mix(scatter[i][0] * (second ? -0.85 : 1), layout[i][0], t),
      y = mix(scatter[i][1] * (second ? -0.75 : 1), layout[i][1], t);
    if (mobile) {
      x = mix(scatter[i][0] * 0.5 * (second ? -1 : 1), layout[i][0], t);
      y = mix(scatter[i][1] * 0.8, layout[i][1], t);
    }
    x += clear * (second ? 260 : -160);
    y += clear * (second ? -165 : -180);
    c.save();
    c.globalAlpha *= presence * (1 - handoff);
    c.translate(x, y);
    c.rotate((1 - t) * [0.08, -0.15, 0.11, -0.08][i]);
    c.scale(mix(0.83, 1, t), mix(0.83, 1, t));
    fragment(c, i, second ? 1 : 0, ink, accent);
    c.restore();
  }
  // Retention is behavioral: guides stay while new observations pass through.
  if (retain > 0) {
    c.save();
    c.globalAlpha *= retain * (1 - handoff);
    for (let i = 0; i < 4; i++) {
      const [x, y] = layout[i],
        growth = at(p, 4.32 + i * 0.07, 0.55);
      frame(c, x - 104, y - 62, 208, 124, ink, growth);
      c.save();
      c.globalAlpha *= at(p, 4.95 + i * 0.04, 0.23) * (1 - at(p, 5.5, 0.23));
      c.translate(x, y);
      fragment(c, i, 2, ink, accent);
      c.restore();
      const u = at(p, 4.63 + i * 0.11, 0.55);
      if (u > 0) {
        stroke(
          c,
          [
            [x - 87, y + 46],
            [x - 87 + 174 * u, y + 46],
          ],
          accent,
          2,
        );
        dot(c, x - 87 + 174 * u, y + 46, 3, accent);
      }
    }
    c.restore();
  }
  c.restore();
  // The final image contains the exact projected positions used by the DOM collection.
  if (p > 5.25) {
    for (let i = 15; i >= 0; i--) {
      const dst = collectionPosition(i, w, h),
        k = 1600 / (1600 - dst.z),
        t = at(p, 5.5 + (i % 4) * 0.035, 0.83);
      const from = layout[i % 4],
        x = mix(cx + from[0] * unit, w * 0.5 + (dst.x - w * 0.5) * k, t),
        y = mix(cy + from[1] * unit, h * 0.5 + (dst.y - h * 0.5) * k, t);
      const ww = mix(208 * unit, 240 * dst.scale * k, t),
        hh = mix(124 * unit, 191 * dst.scale * k, t);
      c.save();
      c.globalAlpha *= at(p, 5.25 + (i % 4) * 0.035, 0.35);
      c.fillStyle = "#14261b";
      c.fillRect(x - ww / 2, y - hh / 2, ww, hh);
      frame(c, x - ww / 2, y - hh / 2, ww, hh, "#7c9280");
      stroke(
        c,
        [
          [x - ww / 2, y - hh / 2],
          [x - ww / 2 + ww * 0.12, y - hh / 2],
        ],
        accent,
        1.6,
      );
      c.restore();
    }
    // The retained central opening receives the real homepage first.
    const t = at(p, 5.8, 0.65),
      ww = Math.min(w * (mobile ? 0.76 : 0.31), 530),
      hh = (ww * 2) / 3;
    c.save();
    c.globalAlpha *= t;
    frame(c, w * 0.5 - ww / 2, h * 0.5 - hh / 2, ww, hh, "#819680");
    c.restore();
  }
  c.restore();
}
