import { space, palette as P, mix, ease, clamp } from "./space.js";
// Schematic examples explain operations; values are never presented as software output.
const signal = (u, i = 0) =>
  0.48 + Math.sin(u * 13 + i) * 0.1 + Math.sin(u * 29 + i * 2) * 0.035;
export function createFunctionStudy(el, wake) {
  const canvas = el.querySelector(".function-study canvas");
  if (!canvas) return () => {};
  const c = canvas.getContext("2d");
  if (!c) return () => {};
  let w = 1,
    h = 1,
    dpr = 1,
    last = "";
  document.fonts.ready.then(() => {
    last = "";
    wake();
  });
  const kind = el.dataset.feature,
    paper = el.classList.contains("feature-paper");
  new ResizeObserver(() => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    last = "";
    wake();
  }).observe(canvas);
  return (p, inspection, reduced, px, py) => {
    const key = [
      p.toFixed(3),
      inspection.toFixed(3),
      px.toFixed(2),
      py.toFixed(2),
      w,
      h,
    ].join("|");
    if (last === key) return;
    last = key;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    const scale = Math.min(w / 800, h / 470),
      mobile = w < 450;
    c.translate((w - 800 * scale) / 2, (h - 470 * scale) / 2);
    c.scale(scale, scale);
    const ink = paper ? "#26392f" : "#e4e6da",
      muted = paper ? "#61725e" : "#93a395",
      faint = paper ? "#bec5b3" : "#34423b",
      accent = paper ? "#a06937" : "#dbac72",
      teal = paper ? "#477f77" : "#80b5a9",
      wash = paper ? "#e1e4d7" : "#15231d";
    const gather = ease(p / 0.36),
      resolve = ease((p - 0.3) / 0.4),
      inspect = ease((p - 0.66) / 0.22);
    const selected = (n) => Math.min(n - 1, Math.floor(inspection * n));
    const alpha = (v, fn) => {
      c.save();
      c.globalAlpha = v;
      fn();
      c.restore();
    };
    const label = (s, x, y, size = 14, color = ink, align = "left") => {
      c.fillStyle = color;
      c.font = `400 ${Math.max(size, mobile ? 18 : 12)}px Geist, Arial`;
      c.textAlign = align;
      c.fillText(s, x, y);
      c.textAlign = "left";
    };
    const line = (pts, color = faint, width = 1, a = 1) =>
      alpha(a, () => {
        c.beginPath();
        pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
        c.strokeStyle = color;
        c.lineWidth = width;
        c.stroke();
      });
    const rect = (x, y, ww, hh, color = wash, stroke = faint) => {
      c.fillStyle = color;
      c.fillRect(x, y, ww, hh);
      if (stroke) {
        c.strokeStyle = stroke;
        c.lineWidth = 1;
        c.strokeRect(x, y, ww, hh);
      }
    };
    const dot = (x, y, r = 3, color = accent) => {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fillStyle = color;
      c.fill();
    };
    const ring = (
      x,
      y,
      r,
      color = faint,
      width = 1,
      start = 0,
      end = Math.PI * 2,
    ) => {
      c.beginPath();
      c.arc(x, y, r, start, end);
      c.strokeStyle = color;
      c.lineWidth = width;
      c.stroke();
    };
    const path = (a, b, color = muted, a1 = 1) =>
      alpha(a1, () => {
        c.beginPath();
        c.moveTo(...a);
        c.bezierCurveTo((a[0] + b[0]) / 2, a[1], (a[0] + b[0]) / 2, b[1], ...b);
        c.strokeStyle = color;
        c.lineWidth = 1;
        c.stroke();
      });
    const curve = (
      x,
      y,
      ww,
      hh,
      seed = 0,
      color = teal,
      progress = 1,
      offset = 0,
      excursion = false,
    ) => {
      const pts = [];
      for (let j = 0; j <= Math.round(progress * 90); j++) {
        const u = j / 90,
          v =
            signal(u + offset, seed) +
            (excursion ? Math.exp(-(((u - 0.64) * 22) ** 2)) * 0.38 : 0);
        pts.push([x + u * ww, y + hh * (1 - v)]);
      }
      line(pts, color, 1.8);
      return pts;
    };
    const axis = (x, y, ww, labels = ["Earlier", "Later"]) => {
      line(
        [
          [x, y],
          [x + ww, y],
        ],
        muted,
      );
      for (let i = 0; i < 9; i++)
        line(
          [
            [x + (i * ww) / 8, y - 4],
            [x + (i * ww) / 8, y + 4],
          ],
          faint,
        );
      label(labels[0], x, y + 26, 12, muted);
      label(labels[1], x + ww, y + 26, 12, muted, "right");
    };
    const heading = (a, b) => {
      label(a, 28, 33, 13, muted);
      if (b) label(b, 772, 33, 13, muted, "right");
    };
    if (kind === "history") {
      heading("PROCESS EVENTS", "LOT HISTORY");
      const duration = [0.11, 0.14, 0.07, 0.2, 0.12, 0.16, 0.08],
        states = [
          "Load",
          "Process",
          "Hold",
          "Process",
          "Check",
          "Process",
          "Unload",
        ];
      let elapsed = 0;
      for (let i = 0; i < 7; i++) {
        const t = ease((p - i * 0.012) / 0.43),
          xx = 80 + elapsed * 670,
          ww = duration[i] * 660,
          y = mix(97 + ((i * 3) % 7) * 38, 215, t),
          x = mix(65 + (i % 3) * 235, xx, t);
        elapsed += duration[i];
        rect(
          x,
          y,
          mix(180, ww, t),
          28,
          wash,
          i === selected(7) && inspect > 0.1 ? accent : faint,
        );
        line(
          [
            [x + 3, y + 25],
            [x + 3 + mix(150, ww - 6, t), y + 25],
          ],
          i === selected(7) ? accent : teal,
          3,
        );
        label(states[i], x + 3, y - 12, 12, muted);
        label(String(i + 1).padStart(2, "0"), x + 5, y + 19, 12, ink);
        if (t > 0.9)
          line(
            [
              [x, y + 30],
              [x, 310],
            ],
            faint,
            1,
            resolve,
          );
      }
      alpha(gather, () => axis(80, 310, 660, ["Lot begins", "Lot complete"]));
      alpha(inspect, () => {
        label("State + duration remain attached to the event.", 80, 394, 17);
        const x = 80 + inspection * 660;
        line(
          [
            [x, 187],
            [x, 322],
          ],
          accent,
          1.5,
        );
      });
    } else if (kind === "schedule") {
      heading("EQUIPMENT SCHEDULES", "ONE TIME AXIS");
      const y0 = 100;
      for (let i = 0; i < 4; i++) {
        const y = y0 + i * 67,
          offset = (1 - gather) * (i % 2 ? 95 : -70);
        label("Equipment " + (i + 1), 30, y + 16, 13, muted);
        line(
          [
            [173, y + 26],
            [750, y + 26],
          ],
          faint,
        );
        for (let j = 0; j < 3; j++) {
          const x = 190 + j * 165 + (i % 2) * 42 + offset;
          rect(x, y, 72 + (j % 2) * 38, 25, wash, teal);
        }
        if (!mobile)
          label(
            gather < 0.8 ? "Local dates" : "Shared dates",
            700,
            y - 9,
            11,
            muted,
            "right",
          );
      }
      alpha(resolve, () => {
        const x = 190 + inspection * 480;
        rect(x, 76, 42, 302, paper ? "#b4c2a433" : "#dcac7220", null);
        line(
          [
            [x, 76],
            [x, 378],
          ],
          accent,
          1.5,
        );
        label("Future window", x, 400, 13, accent, "center");
      });
      axis(190, 375, 555);
    } else if (kind === "usage") {
      heading("WAFER ACTIVITY", "CHAMBER USAGE");
      for (let chamber = 0; chamber < 3; chamber++) {
        const y = 123 + chamber * 110;
        label("Chamber " + (chamber + 1), 26, y + 5, 14, muted);
        line(
          [
            [170, y],
            [660, y],
          ],
          faint,
        );
        ring(706, y, 31, muted);
        ring(706, y, 24, faint);
        let count = 0;
        for (let event = 0; event < 6; event++) {
          const t = ease((p - event * 0.055 - chamber * 0.018) / 0.27),
            x = mix(186 + event * 38, 630 - event * 15, t),
            r = mix(10, 5, resolve);
          ring(x, y, r, t > 0.95 ? accent : teal, 1.4);
          if (t > 0.95) count++;
        }
        for (let j = 0; j < count; j++)
          ring(
            706,
            y,
            36,
            selected(3) === chamber ? accent : teal,
            3,
            -Math.PI / 2 + (j * Math.PI) / 3,
            -Math.PI / 2 + (j * Math.PI) / 3 + 0.72,
          );
        alpha(resolve, () => {
          label("Usage retained", 675, y + 60, 12, muted, "center");
          line(
            [
              [652, y],
              [670, y],
            ],
            accent,
            2,
          );
        });
      }
    } else if (kind === "compare") {
      heading("REFERENCE RECIPE", "COMPARED RECIPE");
      const raw = [0, 1.65, 2.15, 3.95, 4.2, 5.55, 6.8],
        active = selected(7);
      for (let i = 0; i < 7; i++) {
        const y = 89 + i * 43,
          yy = mix(80 + raw[i] * 46 + (i % 2) * 9, y, gather),
          changed = i === 3;
        const opacity = changed || i === active ? 1 : mix(1, 0.38, resolve);
        alpha(opacity, () => {
          label("Step " + (i + 1), 34, y + 5, 13, muted);
          line(
            [
              [116, y],
              [315, y],
            ],
            changed ? accent : ink,
            changed ? 2 : 1,
          );
          label("Step " + (i + 1), 452, yy + 5, 13, muted);
          line(
            [
              [536, yy],
              [752 - (changed ? 45 : 0), yy],
            ],
            changed ? accent : ink,
            changed ? 2 : 1,
          );
          path(
            [325, y],
            [441, yy],
            changed ? accent : muted,
            ease((p - 0.15) / 0.35),
          );
          if (changed && resolve > 0.1) {
            rect(555, yy - 13, 90, 26, paper ? "#b7804225" : "#ce9c6228", null);
            label("changed", 560, yy + 5, 12, accent);
          }
        });
      }
      alpha(resolve, () =>
        label(
          "Line position changes. Logical correspondence remains.",
          34,
          433,
          16,
        ),
      );
    } else if (kind === "pathfinder") {
      heading("SEARCH SPACE", "TARGET CHART");
      const labels = ["Workcentre", "Parameter family", "Parameter"],
        xs = [62, 245, 436];
      for (let level = 0; level < 3; level++) {
        const choose = ease((p - level * 0.14) / 0.28);
        label(labels[level], xs[level] - 22, 76, 13, muted);
        for (let j = 0; j < 5 - level; j++) {
          const y = 126 + j * 56,
            keep = j === (level === 2 ? selected(3) : 1);
          dot(xs[level], y, keep ? 4 : 2, keep ? accent : muted);
          if (!keep)
            alpha(1 - choose * 0.8, () =>
              line(
                [
                  [xs[level] + 12, y],
                  [xs[level] + 92, y],
                ],
                faint,
              ),
            );
          if (level < 2)
            for (let k = 0; k < 4 - level; k++)
              path(
                [xs[level] + 10, y],
                [xs[level + 1] - 10, 126 + k * 56],
                keep && k === (level === 1 ? selected(3) : 1) ? accent : faint,
                keep && k === (level === 1 ? selected(3) : 1)
                  ? choose
                  : (1 - choose) * 0.22,
              );
        }
      }
      alpha(resolve, () => {
        path([447, 126 + selected(3) * 56], [570, 182], accent);
        rect(570, 112, 202, 191, wash);
        curve(582, 130, 176, 140, 0.4 + selected(3) * 0.6, teal, resolve);
        label("Selected SPC chart", 570, 339, 15);
      });
    } else if (kind === "compile") {
      heading("METROLOGY INPUTS", "COMPILED REPORT");
      const fields = ["Measurements", "Source records", "Calculation inputs"];
      fields.forEach((name, i) => {
        label(name, 25, 102 + i * 106, 14, muted);
        for (let j = 0; j < 3; j++) {
          const yy = 121 + i * 106 + j * 15;
          line(
            [
              [30, yy],
              [170 - j * 20, yy],
            ],
            j === 1 ? teal : faint,
            1.5,
          );
        }
        path([185, 132 + i * 106], [340, 228], muted, gather);
      });
      rect(305, 180, 106, 96, wash, accent);
      label("Calculate", 358, 223, 14, ink, "center");
      label("Assemble", 358, 247, 12, muted, "center");
      rect(518, 76, 225, 331, paper ? "#eef0e5" : "#16231e");
      label("REPORT", 538, 104, 13, muted);
      for (let i = 0; i < 3; i++) {
        const t = ease((p - 0.3 - i * 0.09) / 0.32),
          yy = 130 + i * 82;
        path([412, 229], [536, yy + 22], i === selected(3) ? accent : faint, t);
        alpha(t, () => {
          rect(538, yy, 182, 60, wash, i === selected(3) ? accent : faint);
          label(fields[i], 550, yy + 23, 12);
          line(
            [
              [550, yy + 39],
              [687, yy + 39],
            ],
            teal,
            1.5,
          );
        });
      }
    } else if (kind === "diagnose") {
      heading("OBSERVED DRIFT", "CHECKS, NOT A VERDICT");
      label("Process observations", 28, 82, 14, muted);
      curve(30, 94, 243, 105, 0.2, accent, gather, 0, true);
      label("Clean-recipe observations", 28, 246, 14, muted);
      curve(30, 255, 243, 95, 0.2, teal, gather);
      const causes = [
        "Ceiling condition",
        "Optris settings",
        "LayTec / viewport",
      ];
      causes.forEach((name, i) => {
        const y = 130 + i * 98,
          t = ease((p - 0.2 - i * 0.045) / 0.34),
          active = i === selected(3);
        path([282, 172], [447, y], active ? accent : faint, t);
        path([282, 302], [447, y], active ? teal : faint, t);
        alpha(t, () => {
          ring(453, y, 6, active ? accent : muted, 1.3);
          label(name, 479, y + 5, 15, active ? ink : muted);
        });
        alpha(resolve, () => {
          line(
            [
              [674, y],
              [736, y],
            ],
            active ? accent : faint,
            active ? 2 : 1,
          );
          label(
            active ? "CHECK" : "possible",
            732,
            y - 14,
            11,
            active ? accent : muted,
            "right",
          );
        });
      });
      alpha(resolve, () =>
        label(
          "Evidence narrows an investigation. It does not prove a cause.",
          30,
          433,
          16,
        ),
      );
    } else if (kind === "arrange") {
      // Only this operation uses physical movement: identified baseplates exchange seats.
      heading("WEIGHT + TEMPERATURE INPUTS", "BASEPLATE EXCHANGE");
      const g = space(c, {
        w: 800,
        h: 470,
        scale: 0.77,
        cx: 0.58,
        cy: 0.51,
        yaw: -0.14 + (reduced ? 0 : px * 0.02),
        tilt: 1.0,
      });
      g.disc(0, 0, -20, 209, 6, P.dark);
      const seats = Array.from({ length: 5 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
        return [Math.cos(a) * 135, Math.sin(a) * 135];
      });
      seats.forEach(([x, y], i) => {
        g.ring(x, y, -12, 56, P.sage, 0.8);
        g.label("S" + (i + 1), [x, y + 66, -10], 12, P.metal, "center");
      });
      seats.forEach(([x, y], i) => {
        const pair =
          i === 0 || i === 2
            ? [0, 2, 0.2]
            : i === 1 || i === 4
              ? [1, 4, 0.56]
              : null;
        let z = 0;
        if (pair) {
          const t = ease((p - pair[2]) / 0.32),
            to = seats[pair[0] === i ? pair[1] : pair[0]];
          z = Math.sin(t * Math.PI) * 105;
          x =
            mix(x, to[0], t) +
            Math.sin(t * Math.PI) * (pair[0] === i ? 32 : -32);
          y = mix(y, to[1], t);
        }
        g.disc(x, y, z, 47, 12, i === selected(5) ? P.warm : P.dark);
        g.ring(x, y, z + 13, 36, P.metal, 0.8);
        g.label("ABCDE"[i], [x, y, z + 18], 16, P.metal, "center");
      });
      g.draw();
      ["A", "B", "C", "D", "E"].forEach((name, i) => {
        label(name, 32, 119 + i * 43, 14, i === selected(5) ? accent : muted);
        line(
          [
            [58, 113 + i * 43],
            [112, 113 + i * 43],
          ],
          teal,
          2,
        );
        line(
          [
            [58, 121 + i * 43],
            [92 + (i % 2) * 15, 121 + i * 43],
          ],
          accent,
          2,
        );
      });
      label("Inputs stay with each plate.", 32, 429, 15, muted);
    } else if (kind === "zones") {
      heading("ZONE REFERENCES", "MAPPED POSITION");
      const cx = 532,
        cy = 241,
        R = 155;
      ring(cx, cy, R, muted);
      ring(cx, cy, R * 0.66, teal);
      dot(cx, cy, 4, ink);
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / 5,
          x = cx + Math.cos(a) * 104,
          y = cy + Math.sin(a) * 104,
          sy = 106 + i * 66,
          t = ease((p - i * 0.028) / 0.5),
          chosen = i === selected(5);
        label("Zone " + (i + 1), 32, sy + 5, 14, chosen ? accent : muted);
        line(
          [
            [115, sy],
            [184, sy],
          ],
          chosen ? accent : faint,
          2,
        );
        path(
          [185, sy],
          [mix(238, x, t), mix(sy, y, t)],
          chosen ? accent : faint,
        );
        ring(
          x,
          y,
          39,
          chosen ? accent : muted,
          chosen ? 2 : 1,
          0,
          Math.PI * 2 * t,
        );
        label("S" + (i + 1), x, y + 5, 13, ink, "center");
        if (chosen)
          alpha(resolve, () => {
            const delta = 0.13;
            for (const d of [-delta, delta])
              line(
                [
                  [cx, cy],
                  [cx + Math.cos(a + d) * R, cy + Math.sin(a + d) * R],
                ],
                accent,
                1.4,
              );
          });
      }
      label(
        "One origin. Inner and outer boundaries.",
        405,
        437,
        15,
        muted,
        "center",
      );
    } else if (kind === "configuration") {
      heading("REFERENCE / Devices.XML", "TARGET / Devices.XML");
      for (let side = 0; side < 2; side++) {
        const x = 30 + side * 410;
        label("Device", x, 88, 16);
        line(
          [
            [x + 7, 102],
            [x + 7, 363],
          ],
          faint,
        );
        for (let branch = 0; branch < 3; branch++) {
          const change = branch === 1,
            y = 140 + branch * 98;
          line(
            [
              [x + 7, y],
              [x + 31, y],
            ],
            muted,
          );
          label(
            ["Settings", "Constants", "Properties"][branch],
            x + 40,
            y + 5,
            14,
            change ? ink : muted,
          );
          const expanded =
            change || branch === Math.floor(selected(6) / 2)
              ? 1
              : 1 - resolve * 0.82;
          for (let j = 0; j < 2; j++) {
            const yy =
              y + 29 + j * 25 * expanded + (side ? (1 - gather) * 16 : 0);
            alpha(expanded, () => {
              line(
                [
                  [x + 43, y + 12],
                  [x + 43, yy],
                  [x + 67, yy],
                ],
                faint,
              );
              line(
                [
                  [x + 75, yy],
                  [x + 211 - (change && side ? 40 : 0), yy],
                ],
                change ? accent : muted,
                branch * 2 + j === selected(6) ? 3 : change ? 2 : 1,
              );
              if (branch * 2 + j === selected(6)) dot(x + 70, yy, 3, accent);
            });
          }
          if (change)
            path(
              [side ? x - 95 : x + 242, y + 40],
              [side ? x - 20 : x + 314, y + 40],
              accent,
              resolve,
            );
        }
      }
      alpha(resolve, () =>
        label(
          "Changed values stay inside their device hierarchy.",
          30,
          444,
          16,
        ),
      );
    } else if (kind === "spc") {
      heading("GaN SPC SIGNALS", "RELEASE REVIEW CONTEXT");
      for (let i = 0; i < 3; i++) {
        const y = 91 + i * 95;
        label("Signal " + (i + 1), 28, y + 12, 13, muted);
        line(
          [
            [149, y + 52],
            [562, y + 52],
          ],
          faint,
        );
        line(
          [
            [149, y + 12],
            [562, y + 12],
          ],
          faint,
          1,
          0.7,
        );
        curve(
          149,
          y - 12,
          413,
          89,
          i,
          i === 1 ? accent : teal,
          gather,
          0,
          i === 1,
        );
        if (i === 1)
          alpha(resolve, () =>
            rect(396, y - 4, 58, 61, paper ? "#b7804220" : "#daa26720", accent),
          );
        if (i === selected(3))
          alpha(resolve, () => {
            line(
              [
                [143, y - 10],
                [143, y + 70],
              ],
              accent,
              2,
            );
            path([567, y + 29], [624, 230], accent);
          });
      }
      alpha(resolve, () => {
        label("Inspect signal " + (selected(3) + 1), 620, 216, 16, accent);
        label("Signal + context", 620, 245, 13, muted);
        label("remain together", 620, 267, 13, muted);
      });
      label(
        "An exception directs attention. Release remains a review.",
        28,
        426,
        16,
        muted,
      );
    } else if (kind === "legacy") {
      heading("LEGACY PARAMETER RECORDS", "CONSISTENT REVIEW");
      const chosen = selected(5);
      for (let i = 0; i < 5; i++) {
        const y = mix(98 + ((i * 3) % 5) * 61, 99 + i * 57, gather),
          x = mix(20 + (i % 2) * 43, 24, gather);
        label(
          "Parameter " + (i + 1),
          x,
          y + 3,
          14,
          i === chosen ? accent : muted,
        );
        line(
          [
            [x, y + 15],
            [x + 154, y + 15],
          ],
          i === chosen ? accent : faint,
          i === chosen ? 2 : 1,
        );
      }
      path([193, 99 + chosen * 57], [321, 227], accent, resolve);
      rect(323, 88, 437, 292, wash);
      label("Retained parameter context", 343, 119, 14, muted);
      curve(343, 145, 394, 172, chosen * 0.43, teal, resolve);
      axis(343, 337, 394);
      alpha(resolve, () =>
        label(
          "A stable review frame for the selected legacy parameter.",
          28,
          433,
          16,
        ),
      );
    } else if (kind === "planning") {
      heading("STATUS + DUE DATES", "TIME MAKES PRIORITY VISIBLE");
      const now = 428;
      axis(195, 365, 553, ["Overdue", "Upcoming"]);
      for (let i = 0; i < 6; i++) {
        const y = 94 + i * 43;
        label("Equipment " + (i + 1), 25, y + 5, 13, muted);
        line(
          [
            [183, y],
            [750, y],
          ],
          faint,
        );
        const due = [0.19, 0.63, 0.41, 0.88, 0.51, 0.74][i],
          x = mix(204 + (i % 3) * 185, 195 + due * 553, gather);
        dot(x, y, 5, x < now ? accent : teal);
        line(
          [
            [x, y - 9],
            [x, y + 9],
          ],
          x < now ? accent : teal,
          1.3,
        );
        alpha(resolve, () =>
          label(
            x < now ? "due" : "scheduled",
            x + 12,
            y + 5,
            12,
            x < now ? accent : muted,
          ),
        );
      }
      line(
        [
          [now, 65],
          [now, 373],
        ],
        accent,
        1.5,
      );
      label("NOW", now, 407, 13, accent, "center");
      alpha(inspect, () => {
        const x = 195 + inspection * 553;
        rect(x - 20, 74, 40, 280, paper ? "#a9bba625" : "#9dbcab18", null);
      });
    } else if (kind === "report") {
      heading("LAYTEC RESULT FRAGMENTS", "ORDERED REPORT SECTIONS");
      const rows = ["Run context", "Result traces", "Summary"];
      for (let i = 0; i < 3; i++) {
        const y = 88 + i * 107;
        label(rows[i], 28, y, 13, i === selected(3) ? accent : muted);
        curve(28, y + 9, 222, 71, i, i === selected(3) ? accent : teal, gather);
        const t = ease((p - 0.2 - i * 0.1) / 0.39),
          x = mix(267, 483, t),
          yy = mix(y + 29, 109 + i * 92, t);
        line(
          [
            [267, y + 42],
            [483, 109 + i * 92],
          ],
          i === selected(3) ? accent : faint,
          i === selected(3) ? 1.6 : 0.8,
          t,
        );
        rect(x, yy - 10, 44, 20, wash, accent);
      }
      line(
        [
          [475, 64],
          [755, 64],
          [755, 403],
          [475, 403],
        ],
        muted,
      );
      alpha(resolve, () => {
        rows.forEach((name, i) => {
          label(name, 503, 113 + i * 92, 14);
          if (i === 1) curve(503, 205, 225, 68, 0.9, accent, resolve);
          else
            for (let j = 0; j < 3; j++)
              line(
                [
                  [503, 129 + i * 92 + j * 12],
                  [715 - j * 28, 129 + i * 92 + j * 12],
                ],
                faint,
              );
        });
      });
      label("Extract the result. Keep its run context.", 28, 441, 16, muted);
    } else if (kind === "signals") {
      heading("INDEPENDENT PARAMETERS", "COMMON TIME BASIS");
      for (let i = 0; i < 3; i++) {
        const y = 92 + i * 103,
          x = 154 + (1 - gather) * (i - 1) * 48,
          ww = 580 - (1 - gather) * i * 80;
        label("Parameter " + (i + 1), 22, y + 36, 13, muted);
        curve(x, y, ww, 77, i, teal, 1, (1 - gather) * i * 0.2);
        line(
          [
            [x, y + 81],
            [x + ww, y + 81],
          ],
          faint,
        );
        if (!mobile)
          label(
            gather < 0.9 ? "Independent range" : "Common range",
            x + ww,
            y + 95,
            11,
            muted,
            "right",
          );
      }
      alpha(resolve, () => {
        const x = 154 + inspection * 580;
        rect(x - 25, 75, 50, 303, paper ? "#a5bca420" : "#d2ae7420", null);
        line(
          [
            [x, 70],
            [x, 380],
          ],
          accent,
          1.4,
        );
        for (let i = 0; i < 3; i++)
          dot(x, 92 + i * 103 + 77 * (1 - signal(inspection, i)), 4, accent);
        label("SHARED INTERVAL", x, 430, 13, accent, "center");
      });
    }
    // The study's own temporal baseline hands off to the next chapter without its image.
    if (p > 0.9)
      line(
        [
          [28, 461],
          [28 + 744 * ease((p - 0.9) / 0.1), 461],
        ],
        accent,
        1.2,
      );
  };
}
