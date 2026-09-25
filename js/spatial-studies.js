import { diagnosticStudy } from "./diagnostic-study.js";
import { space, palette as C, mix, ease, clamp } from "./space.js";
const wave = (u, seed = 0) =>
  0.38 + Math.sin(u * 11 + seed) * 0.14 + Math.sin(u * 31 + seed * 2) * 0.065;
export function createSpatialStudy(el, wake) {
  const canvas = el.querySelector(".spatial-study canvas");
  if (!canvas) return () => {};
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const kind = el.dataset.feature,
    light = el.classList.contains("feature-paper");
  let w = 1,
    h = 1,
    dpr = 1,
    last = "";
  new ResizeObserver(() => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    last = "";
    wake();
  }).observe(canvas);
  return (p, inspect, reduced, px, py) => {
    const key = [
      p.toFixed(3),
      inspect.toFixed(3),
      px.toFixed(2),
      py.toFixed(2),
      w,
      h,
      reduced,
    ].join("|");
    if (key === last) return;
    last = key;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const mobile = innerWidth < 700,
      g = ease(p / 0.36),
      reveal = ease((p - 0.27) / 0.43),
      focus = ease((p - 0.55) / 0.25),
      selected = (n) => Math.min(n - 1, Math.floor(inspect * n));
    const material = light ? C.paper : C.dark,
      ink = light ? C.ink : C.metal,
      muted = light ? C.sage : C.sage;
    const s = space(ctx, {
      w,
      h,
      cy: 0.52,
      scale: mobile ? 1.05 : 1.07,
      light,
      yaw: mix(-0.38, -0.12, reveal) + (reduced ? 0 : px * 0.055),
      tilt:
        mix(1.06, kind === "diagnose" ? 0.82 : 0.65, reveal) +
        (reduced ? 0 : py * 0.035),
    });
    const { box, disc, line, ring, dot, label, plot, poly } = s;
    const caption = (str, x = -275, y = -175, z = 0) =>
      label(str, [x, y, z], mobile ? 9 : 12, ink);
    const trace = (seed, x, y, z, width = 470, height = 85, color = C.sage) =>
      plot((u) => wave(u, seed), {
        x,
        y,
        z,
        width,
        height,
        color,
        progress: g,
      });
    if (kind === "history") {
      line(
        [
          [-290, 10, 0],
          [285, 10, 0],
        ],
        muted,
        1,
      );
      for (let i = 0; i < 7; i++) {
        const x = mix(-270 + i * 86 + (i % 2 ? 85 : -55), -258 + i * 86, g),
          y = mix(((i % 3) - 1) * 100, 0, g),
          z = 10 + (i === selected(7) ? 55 * focus : 0);
        box(x, y, z, 64, 95, 7, i === selected(7) ? C.warm : material);
        line(
          [
            [x, y - 37, z + 8],
            [x, y + 35, z + 8],
          ],
          ink,
          0.7,
        );
        dot([x, 10, z + 10], 3);
        label(String(i + 1).padStart(2, "0"), [x - 23, y + 62, z + 8], 11, ink);
        if (i === selected(7))
          line(
            [
              [x, 10, 0],
              [x, 10, z],
            ],
            C.warm,
            1,
          );
      }
      caption("Lot events / ordered by time");
    } else if (kind === "schedule" || kind === "planning") {
      const n = kind === "schedule" ? 4 : 5;
      for (let i = 0; i < n; i++) {
        const y = (i - (n - 1) / 2) * 64,
          z = (1 - g) * (n - i) * 22;
        box(0, y, z, 550, 41, 4, material);
        for (let j = 0; j < 3; j++) {
          const x = -220 + ((i * 47 + j * 119) % 410);
          box(
            x,
            y,
            z + 5,
            kind === "schedule" ? 58 + j * 11 : 26,
            23,
            kind === "planning" ? 10 : 5,
            j === selected(3) ? C.warm : C.sage,
          );
        }
        label("0" + (i + 1), [-300, y, z + 8], 11, ink);
      }
      const x = mix(-245, 245, inspect);
      poly(
        [
          [x, -170, 6],
          [x, 170, 6],
          [x, 170, 105 * reveal],
          [x, -170, 105 * reveal],
        ],
        C.warm,
        0.13,
      );
      line(
        [
          [x, -172, 9],
          [x, 172, 9],
        ],
        C.warm,
        2,
      );
      caption(
        kind === "schedule"
          ? "Equipment schedules / shared interval"
          : "Equipment / status / due date",
        -280,
        -215,
      );
    } else if (kind === "usage") {
      for (let i = 0; i < 3; i++) {
        const x = -205 + i * 205,
          z = disc(x, 0, -20, 82, 12, material);
        for (let j = 0; j < 7; j++) {
          const lift = ease((p - j * 0.018) / 0.36);
          disc(
            x,
            0,
            z + j * 8 + (1 - lift) * (130 + j * 14),
            68,
            3,
            i === selected(3) ? C.sage : material,
          );
        }
        ring(
          x,
          0,
          70,
          92,
          i === selected(3) ? C.warm : muted,
          2,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * reveal * (0.48 + i * 0.17),
        );
        label("Chamber " + (i + 1), [x, 112, -10], 12, ink, "center");
      }
      caption("Wafer activity / kept with its chamber", -285, -150);
    } else if (kind === "compare" || kind === "configuration") {
      const n = kind === "compare" ? 7 : 6;
      for (let i = 0; i < n; i++) {
        const y = (i - (n - 1) / 2) * 49,
          z = i === selected(n) ? focus * 43 : 0,
          changed = i === 3;
        for (let side = 0; side < 2; side++) {
          const x = side ? 155 : -155,
            yy = y + (side ? (1 - g) * ((i % 3) - 1) * 50 : 0);
          box(x, yy, z, 205, 30, changed ? 9 : 4, changed ? C.warm : material);
          line(
            [
              [x - 81, yy, z + 11],
              [x + mix(58, 80, side && changed ? 1 : 0), yy, z + 11],
            ],
            ink,
            1,
          );
        }
        line(
          [
            [-52, y, z + 5],
            [52, y + (1 - g) * ((i % 3) - 1) * 50, z + 5],
          ],
          changed ? C.warm : muted,
          changed ? 1.4 : 0.6,
          reveal,
        );
        label(
          (kind === "compare" ? "Step " : "Property ") + (i + 1),
          [-291, y, z + 7],
          10,
          ink,
        );
      }
      caption(
        kind === "compare"
          ? "REFERENCE                           COMPARED RECIPE"
          : "REFERENCE                           TARGET",
        -250,
        -205,
      );
    } else if (kind === "pathfinder") {
      for (let i = 0; i < 3; i++) {
        const x = -260 + i * 102,
          y = -85 + i * 48;
        box(x, y, i * 24 * reveal, 78, 70, 9, material);
        label(
          ["Workcentre", "Group", "Parameter"][i],
          [x, y + 48, i * 24 * reveal],
          10,
          ink,
          "center",
        );
        if (i < 2)
          line(
            [
              [x + 40, y, 12 + i * 24],
              [x + 62, y, 12 + i * 24],
              [x + 62, y + 48, 36 + i * 24],
            ],
            C.warm,
            1.4,
          );
      }
      box(145, 65, 22, 270, 215, 7, material);
      trace(0.4, 25, 115, 35, 240, 120, C.teal);
      const x = 25 + inspect * 240;
      line(
        [
          [x, -20, 31],
          [x, 155, 31],
          [x, 155, 145],
        ],
        C.warm,
        1.1,
      );
      caption("The selection becomes a chart", -260, -190);
    } else if (kind === "compile" || kind === "report") {
      for (let i = 0; i < 4; i++) {
        const t = ease((p - 0.22 - i * 0.055) / 0.47),
          x = mix(-240, 135, t),
          y = mix((i - 1.5) * 75, (i - 1.5) * 39, t),
          z = mix(i * 14, 15 + i * 9, t);
        box(x, y, z, kind === "report" ? 195 : 155, 62, 4, material);
        for (let j = 0; j < 3; j++)
          line(
            [
              [x - 62, y - 17 + j * 14, z + 5],
              [x + 48 - (j % 2) * 23, y - 17 + j * 14, z + 5],
            ],
            i === selected(4) ? C.warm : ink,
            0.9,
          );
      }
      box(130, 0, -5, 255, 242, 8, material);
      line(
        [
          [-70, -95, 6],
          [-70, 100, 6],
        ],
        C.warm,
        2,
      );
      for (let i = 0; i < 7; i++) {
        const y = -80 + i * 26;
        line(
          [
            [-99, y, 6],
            [-40, y, 6],
          ],
          muted,
          0.8,
        );
      }
      caption(
        kind === "compile"
          ? "Measurement files / predefined calculations"
          : "LayTec records / report sections",
        -280,
        -190,
      );
      label("SOURCE", [-260, 190, 0], 10, ink);
      label("REPORT", [135, 190, 0], 10, ink, "center");
    } else if (kind === "diagnose") {
      diagnosticStudy(s, { p, inspect, material, ink, mobile });
    } else if (kind === "arrange" || kind === "zones") {
      disc(0, 0, -24, 215, 10, material);
      const seats = Array.from({ length: 5 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
        return [Math.cos(a) * 140, Math.sin(a) * 140];
      });
      seats.forEach(([x, y], i) => {
        ring(x, y, -12, 57, muted, 0.8);
        label("S" + (i + 1), [x, y + 68, -11], 10, ink, "center");
      });
      if (kind === "arrange")
        seats.forEach(([x, y], i) => {
          const pair =
            i === 0 || i === 2
              ? [0, 2, 0.23]
              : i === 1 || i === 4
                ? [1, 4, 0.62]
                : null;
          let z = 0;
          if (pair) {
            const t = ease((p - pair[2]) / 0.33),
              dest = seats[pair[0] === i ? pair[1] : pair[0]],
              side = pair[0] === i ? 1 : -1;
            x = mix(x, dest[0], t) + Math.sin(t * Math.PI) * side * 42;
            y = mix(y, dest[1], t);
            z = Math.sin(t * Math.PI) * 110;
          }
          disc(x, y, z, 49, 12, i === selected(5) ? C.warm : material);
          ring(
            x,
            y,
            z + 12,
            37,
            i === selected(5) ? C.warm : ink,
            i === selected(5) ? 1.8 : 0.8,
          );
          label("ABCDE"[i], [x, y, z + 17], 14, ink, "center");
        });
      else {
        const [x, y] = seats[selected(5)];
        seats.forEach(([a, b], i) =>
          disc(a, b, 2, 48, 3, i === selected(5) ? C.teal : material),
        );
        ring(0, 0, 13, 124, C.teal, 1.5);
        ring(0, 0, 15, 185, C.warm, 1.3, -1.4, -1.4 + reveal * 4.8);
        for (const v of [-0.18, 0, 0.18]) {
          const a = Math.atan2(y, x) + v;
          line(
            [
              [0, 0, 16],
              [Math.cos(a) * 190, Math.sin(a) * 190, 16 + focus * 30],
            ],
            v ? C.sage : C.warm,
            1.3,
          );
        }
        dot([0, 0, 18], 4, C.metal);
      }
      caption(
        kind === "arrange"
          ? "Weight + temperature / paired baseplate exchanges"
          : "Inner + outer / one coordinate system",
        -260,
        -260,
      );
    } else if (kind === "spc" || kind === "legacy" || kind === "signals") {
      const n = kind === "legacy" ? 1 : 3;
      for (let i = 0; i < n; i++) {
        const y = (i - (n - 1) / 2) * 128,
          z = (n - i - 1) * (1 - g) * 48;
        box(0, y, z, 545, 97, 5, material);
        for (let j = 0; j < 4; j++)
          line(
            [
              [-253, y - 32 + j * 22, z + 6],
              [253, y - 32 + j * 22, z + 6],
            ],
            muted,
            0.5,
            0.3,
          );
        trace(
          i * 0.9,
          -250,
          y + 25,
          z + 9,
          500,
          kind === "signals" ? 120 : 85,
          i === 1 ? C.warm : C.teal,
        );
        const x = -250 + inspect * 500;
        line(
          [
            [x, y - 44, z + 7],
            [x, y + 49, z + 7],
            [x, y + 49, z + 105],
          ],
          C.warm,
          1.2,
        );
        dot(
          [
            x,
            y + 25,
            z + 9 + wave(inspect, i * 0.9) * (kind === "signals" ? 120 : 85),
          ],
          3,
          C.warm,
        );
      }
      if (kind === "legacy")
        for (let i = 0; i < 5; i++)
          box(
            -235 + i * 108,
            -140,
            10,
            82,
            28,
            i === selected(5) ? 22 : 4,
            i === selected(5) ? C.warm : material,
          );
      if (n > 1)
        line(
          [
            [-250 + inspect * 500, -160, 15],
            [-250 + inspect * 500, 180, 15],
          ],
          C.warm,
          1.3,
          reveal,
        );
      caption(
        kind === "signals"
          ? "Independent parameters / shared inspection"
          : kind === "legacy"
            ? "Parameter index / retained chart context"
            : "Configured charts / retained parameter state",
        -275,
        n === 3 ? -240 : -220,
      );
    }
    s.draw();
  };
}
