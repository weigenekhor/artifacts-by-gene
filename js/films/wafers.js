import { space } from "../space.js";
import { lens, at, mix, palette as P } from "./cinema.js";

// A completed wafer becomes an entry in the reactor's usage record, not a physical pile.
export function usage(d, q, f, W, H, m, hit) {
  const s = lens(d, W, H, m, P.cyan),
    register = at(q, 0.12, 0.54),
    overview = at(q, 0.55, 0.25),
    active = Math.min(2, Math.floor(f * 3)),
    counts = [126, 168, 210];
  const g = space(d.c, {
    w: W,
    h: H,
    scale: m ? 0.91 : 1.07,
    cy: 0.5,
    tilt: mix(0.84, 0.41, overview),
    yaw: mix(-0.2, 0.035, overview),
    segments: 64,
    rings: 3,
    cull: true,
  });
  const x = mix(-60, 0, overview),
    y = mix(0, -35, overview),
    radius = mix(148, 29, overview),
    z = mix(110, 2, overview);
  g.disc(x, y, z, radius, 3, [45, 104, 117]);
  g.ring(x, y, z + 3.5, radius - 1, [123, 218, 224], 1.4);
  // Die geometry belongs to this wafer and remains clipped to its circular surface.
  for (let n = -8; n <= 8; n++) {
    const yy = (n * radius) / 9,
      extent = Math.sqrt(radius * radius - yy * yy);
    g.line(
      [
        [x - extent, y + yy, z + 4],
        [x + extent, y + yy, z + 4],
      ],
      [56, 144, 158],
      0.6,
      1 - overview,
    );
    g.line(
      [
        [x + yy, y - extent, z + 4],
        [x + yy, y + extent, z + 4],
      ],
      [56, 144, 158],
      0.6,
      1 - overview,
    );
  }
  for (let r = 0; r < 3; r++) {
    const x0 = -270 + r * 193;
    for (let e = 0; e < counts[r]; e++) {
      const t = at(q, 0.1 + e * 0.0019 + r * 0.019, 0.14),
        xx = x0 + (e % 12) * 13.7,
        yy = -138 + Math.floor(e / 12) * 16.5;
      if (t < 0.01) continue;
      const p = [];
      for (let j = 0; j <= 12; j++) {
        const a = (j * Math.PI) / 6;
        p.push([
          xx + Math.cos(a) * 5.15,
          yy + Math.sin(a) * 5.15,
          -16 - (1 - t) * 42,
        ]);
      }
      g.poly(p.slice(0, -1), r === active ? [40, 132, 142] : [29, 77, 95], t);
      g.line(p, r === active ? [84, 208, 205] : [73, 148, 170], 0.65, t);
    }
    hit(
      (r + 0.5) / 3,
      (W * r) / 3,
      0,
      W / 3,
      H,
      "Reactor " + String.fromCharCode(65 + r),
    );
  }
  g.draw();
  s.alpha(1 - at(overview, 0, 0.4), () =>
    s.label("Every wafer leaves a record.", W * 0.08, H * 0.085, 27, s.ink),
  );
  s.alpha(at(overview, 0.6, 0.4), () => {
    counts.forEach((count, i) => {
      const xx = W * (0.18 + i * 0.32);
      s.label("Reactor " + "ABC"[i], xx, H * 0.075, 22, s.ink, "center");
      s.label(
        String(Math.round(count * register)),
        xx,
        H * 0.87,
        44,
        i === active ? P.cyan : s.ink,
        "center",
      );
    });
    s.label(
      "Processed count → maintenance context",
      W * 0.5,
      H * 0.97,
      22,
      s.muted,
      "center",
    );
  });
  return (
    "Reactor " +
    "ABC"[active] +
    " · " +
    counts[active] +
    " illustrative processed wafers · preventive-maintenance indicator"
  );
}
