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
      g.ring(sx, sy, -8, 66, P.warm, 1.2);
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
  alpha(at(q, 0.1, 0.15), () => {
    text("Source weights", inputX, inputY - 27, 19, muted);
    weights.forEach((weight, i) => {
      const x = m ? inputX + (i % 3) * W * 0.32 : inputX,
        y = m ? inputY + Math.floor(i / 3) * H * 0.07 : inputY + i * H * 0.1;
      text("BP" + (i + 1), x, y, 18, i === active ? accent : ink);
      text(weight, x + (m ? 55 : 63), y, 18, i === active ? accent : muted);
    });
  });
  alpha(at(q, 0.64, 0.12), () =>
    text(
      "BP3 ↔ BP5 · the other seats stay fixed",
      W * 0.5,
      H * 0.97,
      20,
      muted,
      "center",
    ),
  );
  return (
    "BP" +
    (active + 1) +
    " · " +
    weights[active] +
    " source weight · " +
    (initial ? "initial arrangement" : "BP3/BP5 exchange")
  );
}

export function zones(d, q, f, W, H, m, hit) {
  const { text, line, dot, arc, path, alpha, ink, muted, faint, accent, teal } =
    d;
  const active = Math.min(4, Math.floor(f * 5)),
    origin = at(q, 0.23, 0.23),
    registration = at(q, 0.42, 0.23),
    radius = Math.min(W * 0.28, H * 0.34);
  const cy = mix(H * 0.35, H * 0.49, origin);
  const points = [[], []];
  for (let side = 0; side < 2; side++) {
    const x = mix(W * (side ? 0.74 : 0.26), W * 0.52, origin),
      r = radius * mix(side ? 0.74 : 0.6, 1, registration),
      turn = (1 - registration) * (side ? 0.24 : -0.19),
      color = side ? teal : muted;
    const yy = m ? mix(H * (side ? 0.65 : 0.25), H * 0.49, origin) : cy;
    arc(x, yy, r, color, 1.5);
    dot(x, yy, 4, color);
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5 + turn,
        xx = x + Math.cos(a) * r,
        yyy = yy + Math.sin(a) * r,
        chosen = i === active;
      points[side].push([xx, yyy]);
      arc(xx, yyy, r * 0.31, chosen ? accent : faint, chosen ? 1.8 : 1);
      line(
        [
          [x, yy],
          [xx, yyy],
        ],
        chosen && q > 0.61 ? color : faint,
        1,
      );
      text("S" + (i + 1), xx, yyy + 6, 19, chosen ? ink : muted, "center");
      hit(
        (i + 0.5) / 5,
        xx - r * 0.32,
        yyy - r * 0.32,
        r * 0.64,
        r * 0.64,
        "S" + (i + 1),
      );
    }
    alpha(1 - registration, () =>
      text(
        side ? "Outer reference" : "Inner reference",
        x,
        yy + r + H * 0.09,
        20,
        color,
        "center",
      ),
    );
  }
  alpha(at(q, 0.14, 0.18) * (1 - registration), () => {
    for (let i = 0; i < 5; i++)
      path(points[0][i], points[1][i], i === active ? accent : faint, 1);
  });
  alpha(at(q, 0.6, 0.12), () => {
    const center = [W * 0.52, H * 0.49],
      a = -Math.PI / 2 + (active * Math.PI * 2) / 5;
    for (const offset of [-0.126, 0.126, -0.314, 0.314]) {
      const end = [
        center[0] + Math.cos(a + offset) * radius,
        center[1] + Math.sin(a + offset) * radius,
      ];
      line([center, end], Math.abs(offset) < 0.2 ? teal : accent, 1.7);
      dot(...end, 4, Math.abs(offset) < 0.2 ? teal : accent);
    }
    text(
      "Inner + outer · one registered origin",
      W * 0.5,
      H * 0.95,
      21,
      ink,
      "center",
    );
  });
  return "S" + (active + 1) + " · corresponding inner and outer boundaries";
}
