import { mix, at, clamp } from "./drawing.js";
import { space, palette as P } from "../space.js";

export function arrange(d, q, f, W, H, m, hit, alternate) {
  const { text, line, alpha, ink, muted, accent, teal } = d;
  const active = Math.min(4, Math.floor(f * 5)),
    initial = alternate > 0.5;
  const motion = clamp((q - 0.32) / 0.34) * (1 - alternate),
    travel = at(motion, 0.2, 0.55),
    lift = (at(motion, 0.025, 0.23) - at(motion, 0.76, 0.24)) * 98;
  const camera = at(q, 0.15, 0.16),
    g = space(d.c, {
      w: W,
      h: H,
      scale: m ? 1.24 : 0.91,
      cx: m ? 0.5 : 0.61,
      cy: m ? 0.45 : 0.48,
      yaw: mix(-0.06, -0.18, camera),
      tilt: mix(0.12, 0.73, camera),
      light: false,
    });
  const seats = Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + ((i - 1) * Math.PI * 2) / 5;
    return [Math.cos(a) * 164, Math.sin(a) * 164];
  });
  // The displayed recommendation keeps BP1/2/4 and exchanges BP3/BP5.
  // Weights below are transcribed from the source capture; motion is explanatory.
  const weights = ["500.6", "521.0", "509.9", "541.3", "530.5"];
  g.disc(0, 0, -23, 244, 9, P.dark);
  seats.forEach(([x, y], i) => {
    g.ring(x, y, -10, 63, P.sage, 0.75);
    g.label("S" + (i + 1), [x, y + 78, -8], m ? 16 : 15, P.metal, "center");
  });
  seats.forEach(([sx, sy], i) => {
    const swapped = i === 2 || i === 4,
      to = seats[i === 2 ? 4 : 2];
    const x = swapped
      ? mix(sx, to[0], travel) +
        Math.sin(travel * Math.PI) * (i === 2 ? 60 : -60)
      : sx;
    const y = swapped
      ? mix(sy, to[1], travel) +
        Math.sin(travel * Math.PI) * (i === 2 ? 45 : -45)
      : sy;
    const z = swapped ? lift : 0,
      selected = q > 0.72 && i === active;
    if (swapped && q > 0.26) {
      g.ring(sx, sy, -8, 66, P.sage, 0.6);
      g.line(
        [
          [sx, sy, -8],
          [x, y, z],
        ],
        P.sage,
        0.7,
        0.35,
      );
    }
    g.disc(x, y, z, 54, 13, selected ? P.warm : swapped ? P.sage : P.dark);
    g.ring(x, y, z + 13.5, 43, P.metal, 0.8);
    g.label("BP" + (i + 1), [x, y, z + 20], m ? 19 : 18, P.metal, "center");
    const pt = g.project([x, y, z]);
    hit((i + 0.5) / 5, pt[0] - 50, pt[1] - 50, 100, 100, "BP" + (i + 1));
  });
  g.draw();
  const inputX = W * 0.03,
    inputY = m ? H * 0.77 : H * 0.2;
  alpha(at(q, 0.1, 0.15) * (1 - at(q, 0.35, 0.15) * 0.55), () => {
    text("Source weights", inputX, inputY - 27, 19, muted);
    weights.forEach((weight, i) => {
      const x = m ? inputX + (i % 3) * W * 0.32 : inputX,
        y = m ? inputY + Math.floor(i / 3) * H * 0.07 : inputY + i * H * 0.1;
      text("BP" + (i + 1), x, y, 18, i === active ? accent : ink);
      text(weight, x + (m ? 55 : 63), y, 18, i === active ? accent : muted);
    });
  });
  return (
    "BP" +
    (active + 1) +
    " · " +
    weights[active] +
    (initial ? " · initial seat" : "")
  );
}

export function zones(d, q, f, W, H, m, hit) {
  const { text, line, dot, arc, path, alpha, ink, muted, faint, accent, teal } =
    d;
  const active = Math.min(4, Math.floor(f * 5)),
    origin = at(q, 0.22, 0.26),
    registration = at(q, 0.43, 0.23),
    radius = Math.min(W * 0.3, H * 0.31);
  const points = [[], []],
    cx = W * 0.5,
    cy = H * 0.49;
  for (let side = 0; side < 2; side++) {
    const x = m ? cx : mix(W * (side ? 0.75 : 0.25), cx, origin),
      y = m
        ? mix(H * (side ? 0.72 : 0.27), cy, origin)
        : mix(H * (side ? 0.58 : 0.37), cy, origin);
    const r = radius * mix(0.67, side ? 1 : 0.72, registration),
      turn = (1 - registration) * (side ? 0.32 : -0.24),
      color = side ? teal : accent;
    arc(x, y, r, color, 1.4);
    line(
      [
        [x - 11, y],
        [x + 11, y],
      ],
      color,
    );
    line(
      [
        [x, y - 11],
        [x, y + 11],
      ],
      color,
    );
    alpha(1 - at(q, 0.24, 0.13), () =>
      text(
        side ? "Outer reference" : "Inner reference",
        x,
        y - r - 30,
        21,
        color,
        "center",
      ),
    );
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5 + turn,
        xx = x + Math.cos(a) * r,
        yy = y + Math.sin(a) * r,
        chosen = i === active;
      points[side].push([xx, yy]);
      arc(xx, yy, r * 0.17, chosen ? color : faint, chosen ? 1.8 : 1);
      if (side)
        alpha(registration, () =>
          text(
            "S" + (i + 1),
            x + Math.cos(a) * (r + 28),
            y + Math.sin(a) * (r + 28) + 7,
            20,
            chosen ? ink : muted,
            "center",
          ),
        );
      alpha(at(q, 0.13, 0.12), () =>
        line(
          [
            [x, y],
            [xx, yy],
          ],
          chosen && q > 0.68 ? color : faint,
        ),
      );
      hit((i + 0.5) / 5, xx - 30, yy - 30, 60, 60, "S" + (i + 1));
    }
  }
  alpha(at(q, 0.16, 0.2), () => {
    for (let i = 0; i < 5; i++)
      path(
        points[0][i],
        points[1][i],
        i === active ? accent : faint,
        i === active ? 1.5 : 0.8,
      );
  });
  alpha(at(q, 0.65, 0.13), () => {
    const a = -Math.PI / 2 + (active * Math.PI * 2) / 5;
    for (let side = 0; side < 2; side++) {
      const r = radius * (side ? 1 : 0.72),
        delta = side ? 0.314 : 0.126,
        color = side ? teal : accent;
      d.c.save();
      d.c.globalAlpha *= 0.13;
      d.c.beginPath();
      d.c.moveTo(cx, cy);
      d.c.arc(cx, cy, r, a - delta, a + delta);
      d.c.closePath();
      d.c.fillStyle = color;
      d.c.fill();
      d.c.restore();
      arc(cx, cy, r, color, 3, a - delta, a + delta);
      for (const angle of [a - delta, a + delta]) {
        const end = [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
        line([[cx, cy], end], color, 1.2);
        dot(...end, 4, color);
      }
    }
  });
  return "S" + (active + 1) + " · inner + outer reference";
}
