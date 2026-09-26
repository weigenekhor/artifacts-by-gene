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
    const lerp = (a, b, t) => a.map((v, i) => mix(v, b[i], t));
    const selected = (n) => Math.min(n - 1, Math.floor(inspection * n));
    const alpha = (v, fn) => {
      c.save();
      c.globalAlpha *= v;
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
      heading("DISPLACED LOT EVENTS", "A HISTORY WITH CONTEXT");
      const lengths = [0.11, 0.14, 0.07, 0.2, 0.12, 0.16, 0.08],
        names = [
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
        const lock = ease((p - 0.07 - i * 0.018) / 0.34),
          x = mix(52 + (i % 3) * 241, 70 + elapsed * 690, lock),
          y = mix(95 + ((i * 3) % 7) * 39, 205, lock),
          ww = mix(182, lengths[i] * 680, lock);
        elapsed += lengths[i];
        rect(
          x,
          y,
          ww,
          31,
          wash,
          i === selected(7) && inspect > 0.1 ? accent : faint,
        );
        label(names[i], x + 3, y - 15, 12, muted);
        label(String(i + 1).padStart(2, "0"), x + 7, y + 21, 12);
        line(
          [
            [x + 3, y + 29],
            [x + ww - 3, y + 29],
          ],
          i === selected(7) ? accent : teal,
          3,
        );
        alpha(lock, () => {
          line(
            [
              [x, y + 34],
              [x, 319],
            ],
            faint,
          );
        });
        // A short registration stroke signals exact chronological seating.
        alpha(Math.sin(lock * Math.PI), () =>
          line(
            [
              [x, y - 5],
              [x, y + 39],
            ],
            accent,
            2,
          ),
        );
      }
      alpha(gather, () => axis(70, 319, 682, ["Earlier", "Later"]));
      alpha(inspect, () => {
        let begin = 0;
        for (let i = 0; i < selected(7); i++) begin += lengths[i];
        const x = 70 + begin * 690;
        rect(x, 199, lengths[selected(7)] * 680, 43, "#b2935020", accent);
        label(
          names[selected(7)] + " · state and duration in sequence",
          70,
          425,
          17,
        );
      });
    } else if (kind === "schedule") {
      heading("SEPARATE EQUIPMENT SCHEDULES", "A COMMON TIME REFERENCE");
      const lock = ease((p - 0.16) / 0.31);
      for (let i = 0; i < 4; i++) {
        const y = 104 + i * 69,
          offset = (1 - lock) * (i % 2 ? 83 : -67);
        label("Equipment " + (i + 1), 25, y + 14, 13, muted);
        line(
          [
            [176, y + 30],
            [751, y + 30],
          ],
          faint,
        );
        for (let j = 0; j < 3; j++) {
          const x = 187 + j * 163 + (i % 2) * 34 + offset;
          rect(x, y, 64 + (j % 2) * 34, 23, wash, teal);
          for (let k = 0; k < 2; k++)
            line(
              [
                [x + k * 24, y + 25],
                [x + k * 24, y + 35],
              ],
              faint,
            );
        }
        const reference = 355 + offset;
        line(
          [
            [reference, y - 13],
            [reference, y + 38],
          ],
          accent,
          1.2,
        );
        alpha(1 - lock, () =>
          label("Local reference", reference, y - 24, 11, muted, "center"),
        );
      }
      alpha(lock, () => {
        line(
          [
            [355, 65],
            [355, 375],
          ],
          accent,
          1.7,
        );
        label("Shared reference", 355, 410, 13, accent, "center");
      });
      alpha(inspect, () => {
        const x = 390 + inspection * 293;
        rect(x, 84, 48, 286, "#c69c6520", null);
        line(
          [
            [x, 84],
            [x, 370],
          ],
          teal,
          1.5,
        );
        label("Upcoming window", x + 24, 444, 12, teal, "center");
      });
    } else if (kind === "usage") {
      heading("INDIVIDUAL WAFER EVENTS", "RETAINED CHAMBER USAGE");
      for (let chamber = 0; chamber < 3; chamber++) {
        const y = 119 + chamber * 112,
          n = 14 + chamber * 3;
        label("Chamber " + (chamber + 1), 24, y - 33, 14, muted);
        line(
          [
            [30, y + 28],
            [751, y + 28],
          ],
          faint,
        );
        let count = 0;
        for (let event = 0; event < n; event++) {
          const t = ease((p - 0.015 * event - 0.018 * chamber) / 0.39),
            ready = t > 0.985;
          if (ready) count++;
          const x = mix(40 + (event % 7) * 54, 648, t),
            yy = mix(y + (Math.floor(event / 7) - 1) * 18, y, t);
          alpha(1 - ease((t - 0.82) / 0.18), () => {
            ring(x, yy, 7, teal, 1.2);
            line(
              [
                [x - 2, yy + 6],
                [x + 2, yy + 6],
              ],
              wash,
              2,
            );
          });
          // One discrete event leaves one permanent increment in the usage state.
          if (ready) {
            const theta = -Math.PI / 2 + (event / n) * Math.PI * 1.6;
            ring(
              689,
              y,
              37,
              selected(3) === chamber ? accent : teal,
              4,
              theta,
              theta + ((Math.PI * 1.6) / n) * 0.8,
            );
          }
        }
        ring(689, y, 46, faint);
        label(
          String(count).padStart(2, "0"),
          689,
          y + 7,
          23,
          selected(3) === chamber ? accent : ink,
          "center",
        );
        label("illustrative events", 689, y + 65, 11, muted, "center");
        alpha(resolve, () => {
          line(
            [
              [30, y],
              [574, y],
            ],
            faint,
          );
          label("Events pass. Usage remains.", 32, y + 4, 15, muted);
        });
      }
    } else if (kind === "pathfinder") {
      heading("SEARCH SPACE", "TARGET CHART");
      const labels = ["Workcentre", "Parameter family", "Parameter"],
        xs = [62, 245, 436];
      for (let level = 0; level < 3; level++) {
        const choose = ease((p - level * 0.14) / 0.28);
        label(labels[level], xs[level] - 22, 76, 13, muted);
        for (let j = 0; j < 5 - level; j++) {
          const keep = j === (level === 2 ? selected(3) : 1),
            y = mix(
              126 + j * 56,
              126 + (level === 2 ? selected(3) : 1) * 56,
              keep ? 0 : choose * 0.82,
            );
          alpha(keep ? 1 : 1 - choose * 0.95, () =>
            dot(xs[level], y, keep ? 4 : 2, keep ? accent : muted),
          );
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
      heading("METROLOGY SOURCE RECORDS", "CALCULATION → REPORT");
      const names = ["LayTec", "PL", "XRR / XRD"],
        assemble = ease((p - 0.3) / 0.39),
        chosen = selected(3);
      for (let i = 0; i < 3; i++) {
        const y = 105 + i * 105;
        label(names[i], 25, y - 19, 14, muted);
        for (let j = 0; j < 4; j++) {
          const t = ease((p - 0.1 - i * 0.07 - j * 0.035) / 0.48),
            x = mix(26 + j * 34, 543 + j * 35, t),
            yy = mix(y + ((j + i) % 2) * 17, 139 + i * 88, t);
          line(
            [
              [x, yy],
              [x + 23, yy],
            ],
            i === chosen ? accent : teal,
            2,
          );
          dot(x, yy, 2, i === chosen ? accent : teal);
        }
        path([172, y + 11], [323, 233], i === chosen ? accent : faint, gather);
        path(
          [398, 233],
          [527, 139 + i * 88],
          i === chosen ? accent : faint,
          assemble,
        );
        alpha(assemble, () => {
          label(
            names[i] + " / source retained",
            543,
            123 + i * 88,
            12,
            i === chosen ? ink : muted,
          );
          line(
            [
              [537, 158 + i * 88],
              [713, 158 + i * 88],
            ],
            faint,
          );
        });
      }
      rect(309, 193, 102, 79, wash, accent);
      label("Predefined", 360, 223, 12, muted, "center");
      label("calculations", 360, 246, 14, ink, "center");
      alpha(assemble, () => {
        line(
          [
            [520, 82],
            [752, 82],
            [752, 400],
            [520, 400],
            [520, 82],
          ],
          muted,
          1.3,
        );
        label("METROLOGY REPORT", 538, 64, 12, muted);
      });
      alpha(inspect, () =>
        label("The report keeps a path back to its inputs.", 25, 442, 16),
      );
    } else if (kind === "diagnose") {
      heading("OBSERVED BEHAVIOUR", "NEXT CHECKS");
      label("Process recipe", 24, 88, 14, muted);
      curve(25, 104, 191, 102, 0.2, accent, gather, 0, true);
      label("Clean recipe", 24, 286, 14, muted);
      curve(25, 294, 191, 79, 0.2, teal, gather);
      const names = [
          "Ceiling condition",
          "Optris settings",
          "LayTec / viewport",
        ],
        narrow = ease((p - 0.45) / 0.26);
      // Both evidence sets initially support several questions; routes narrow to checks, never a verdict.
      for (let branch = 0; branch < 9; branch++) {
        const group = Math.floor(branch / 3),
          chosen = group === selected(3),
          rootY = branch % 2 ? 331 : 154;
        const midY = mix(77 + branch * 37, 128 + group * 104, narrow),
          midX = mix(376, 415, narrow);
        const opacity =
          (1 - narrow) * 0.55 + (branch % 3 === 1 ? 0.65 : 0) * narrow;
        path(
          [226, rootY],
          [midX, midY],
          chosen ? accent : faint,
          opacity * ease((p - 0.12 - branch * 0.012) / 0.25),
        );
        if (branch % 3 !== 1)
          alpha(1 - narrow, () => {
            ring(midX, midY, 3, muted);
            line(
              [
                [midX + 10, midY],
                [midX + 42, midY],
              ],
              faint,
            );
          });
      }
      names.forEach((name, i) => {
        const y = 128 + i * 104,
          selectedCheck = i === selected(3),
          t = ease((p - 0.25 - i * 0.035) / 0.3);
        alpha(t, () => {
          ring(420, y, 7, selectedCheck ? accent : muted, 1.4);
          line(
            [
              [430, y],
              [473, y],
            ],
            selectedCheck ? accent : faint,
            1.5,
          );
          label(name, 486, y + 5, 15, selectedCheck ? ink : muted);
        });
        alpha(narrow, () => {
          label(
            selectedCheck ? "INSPECT NEXT" : "CHECK REMAINS",
            486,
            y + 29,
            11,
            selectedCheck ? accent : muted,
          );
        });
      });
      alpha(resolve, () =>
        label(
          "A narrower investigation. A check still to be made.",
          24,
          442,
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
            ? [0, 2, 0.16]
            : i === 1 || i === 4
              ? [1, 4, 0.55]
              : null;
        let z = 0;
        if (pair) {
          const motion = clamp((p - pair[2]) / 0.34),
            t = ease((motion - 0.16) / 0.67),
            to = seats[pair[0] === i ? pair[1] : pair[0]];
          z = (ease(motion / 0.22) - ease((motion - 0.77) / 0.23)) * 94;
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
      label(
        p < 0.16
          ? "Select the exchange."
          : p < 0.49
            ? "A ↔ C · surrounding seats remain fixed"
            : p < 0.55
              ? "First exchange seated."
              : p < 0.89
                ? "B ↔ E · surrounding seats remain fixed"
                : "Both exchanges seated. Inputs retained.",
        32,
        429,
        15,
        muted,
      );
    } else if (kind === "zones") {
      heading("INNER / OUTER REFERENCE", "ONE SPATIAL CORRESPONDENCE");
      const overlay = ease((p - 0.15) / 0.47),
        cx = mix(259, 445, overlay),
        cy = 236,
        radius = mix(104, 145, overlay),
        turn = (1 - overlay) * 0.32;
      const secondX = mix(579, 445, overlay),
        secondR = mix(119, 145, overlay);
      for (let side = 0; side < 2; side++) {
        const x = side ? secondX : cx,
          R = side ? secondR : radius;
        ring(x, cy, R, side ? teal : muted, 1.1);
        dot(x, cy, 3, side ? teal : ink);
        for (let i = 0; i < 5; i++) {
          const a =
              -Math.PI / 2 + (i * Math.PI * 2) / 5 + (side ? turn : -turn),
            xx = x + Math.cos(a) * R * 0.67,
            yy = cy + Math.sin(a) * R * 0.67,
            chosen = i === selected(5);
          ring(
            xx,
            yy,
            R * 0.255,
            chosen ? accent : side ? teal : faint,
            chosen ? 1.8 : 1,
          );
          if (!side || overlay < 0.85)
            label(
              "S" + (i + 1),
              xx,
              yy + 4,
              12,
              chosen ? accent : muted,
              "center",
            );
          if (chosen) {
            const end = x + Math.cos(a) * R,
              ey = cy + Math.sin(a) * R;
            line(
              [
                [x, cy],
                [end, ey],
              ],
              side ? teal : accent,
              1.7,
            );
          }
        }
      }
      alpha(1 - overlay, () => {
        label("Inner reference", 259, 414, 14, muted, "center");
        label("Outer reference", 579, 414, 14, teal, "center");
      });
      alpha(resolve, () => {
        const a = -Math.PI / 2 + (selected(5) * Math.PI * 2) / 5;
        for (const d of [-0.13, 0.13])
          line(
            [
              [445, 236],
              [445 + Math.cos(a + d) * 173, 236 + Math.sin(a + d) * 173],
            ],
            accent,
            1.5,
          );
        label(
          "Shared origin · selected zone " + (selected(5) + 1),
          445,
          429,
          16,
          ink,
          "center",
        );
      });
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
            y =
              140 +
              branch * 98 +
              (side ? (1 - gather) * [22, -19, 17][branch] : 0);
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
              : 1 - resolve * 0.97;
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
      heading("PROCESS SIGNALS ARRIVE TOGETHER", "RELEASE REVIEW");
      const review = ease((p - 0.36) / 0.3),
        active = selected(3);
      for (let i = 0; i < 9; i++) {
        const group = i % 3,
          selectedRow = i === 4,
          normal = !selectedRow,
          smallX = 30 + (i % 3) * 252,
          smallY = 89 + Math.floor(i / 3) * 94;
        const x = mix(smallX, 145, review),
          y = mix(smallY, 92 + group * 91, review),
          ww = mix(218, 410, review);
        const opacity = normal ? 1 - review * (i < 3 ? 0.6 : 0.94) : 1;
        alpha(opacity, () => {
          curve(
            x,
            y,
            ww,
            65,
            i,
            selectedRow ? accent : teal,
            gather,
            0,
            selectedRow,
          );
          line(
            [
              [x, y + 8],
              [x + ww, y + 8],
            ],
            faint,
          );
          line(
            [
              [x, y + 57],
              [x + ww, y + 57],
            ],
            faint,
          );
        });
      }
      alpha(review, () => {
        for (let i = 0; i < 3; i++) {
          label("Signal " + (i + 1), 25, 125 + i * 91, 13, muted);
          if (i === active) {
            line(
              [
                [138, 89 + i * 91],
                [138, 157 + i * 91],
              ],
              accent,
              2,
            );
            path([563, 122 + i * 91], [614, 221], accent);
          }
        }
        rect(394, 176, 57, 63, "#b3914518", accent);
        label("Needs review", 619, 205, 16, accent);
        label("Inspect in context", 619, 233, 12, muted);
        label("Release remains a review.", 25, 429, 16, muted);
      });
    } else if (kind === "legacy") {
      heading("FRAGMENTED LEGACY FORMATS", "CONSISTENT REVIEW FRAME");
      const normalise = ease((p - 0.15) / 0.45),
        active = selected(5);
      for (let i = 0; i < 5; i++) {
        const x = mix(28 + (i % 2) * 169, 28, normalise),
          y = mix(95 + ((i * 3) % 5) * 53, 102 + i * 54, normalise),
          ww = mix(i % 2 ? 162 : 122, 195, normalise);
        line(
          [
            [x, y],
            [x + ww, y],
          ],
          i === active ? accent : faint,
          1.2,
        );
        label(
          "Parameter " + (i + 1),
          x,
          y - 12,
          13,
          i === active ? ink : muted,
        );
        // The same record begins as a column, row or compact trace, then gains a shared review structure.
        for (let j = 0; j < 3; j++) {
          const a = [x + j * 28, y + 12],
            b = [x + j * 28, y + 27 - ((i + j) % 3) * 6];
          line(
            [
              lerp(a, [x + ww - 44 + j * 14, y - 12], normalise),
              lerp(b, [x + ww - 44 + j * 14, y - 12], normalise),
            ],
            teal,
            2,
          );
        }
      }
      alpha(normalise, () => {
        rect(327, 85, 435, 299, wash);
        label(
          "Parameter " + (active + 1) + " / retained context",
          346,
          116,
          14,
          muted,
        );
        curve(347, 151, 390, 146, active * 0.43, teal, ease((p - 0.37) / 0.3));
        axis(347, 337, 390);
        path([231, 102 + active * 54], [322, 220], accent);
      });
      alpha(resolve, () =>
        label("Different formats. One readable review structure.", 28, 437, 16),
      );
    } else if (kind === "planning") {
      heading("STATUS + DUE DATES", "TEMPORAL PRIORITY");
      const order = ease((p - 0.13) / 0.4),
        now = 432,
        due = [0.18, 0.64, 0.4, 0.87, 0.51, 0.74],
        rank = [0, 3, 1, 5, 2, 4];
      axis(193, 374, 557, ["Overdue", "Upcoming"]);
      line(
        [
          [now, 68],
          [now, 383],
        ],
        accent,
        1.5,
      );
      label("NOW", now, 411, 13, accent, "center");
      for (let i = 0; i < 6; i++) {
        const x = mix(205 + (i % 3) * 180, 193 + due[i] * 557, order),
          y = mix(102 + ((i * 5) % 7) * 36, 96 + rank[i] * 46, order);
        label(
          "Equipment " + (i + 1),
          mix(x - 16, 25, order),
          y - 12 * (1 - order) + 5 * order,
          13,
          muted,
        );
        line(
          [
            [183, y],
            [x, y],
          ],
          faint,
          1,
          order,
        );
        const col = due[i] < 0.43 ? accent : teal;
        dot(x, y, 5, col);
        line(
          [
            [x, y - 9],
            [x, y + 9],
          ],
          col,
          1.4,
        );
        alpha(resolve, () =>
          label(
            due[i] < 0.43
              ? "overdue"
              : due[i] < 0.58
                ? "due soon"
                : "scheduled",
            x + 12,
            y + 5,
            12,
            col,
          ),
        );
      }
      alpha(inspect, () => {
        const x = 193 + inspection * 557;
        rect(x - 17, 79, 34, 278, "#a3b29720", null);
      });
    } else if (kind === "report") {
      heading("LAYTEC RUN RESULTS", "SELECTION → REPORT");
      const choose = ease((p - 0.14) / 0.25),
        assemble = ease((p - 0.4) / 0.31),
        chosen = selected(3);
      const names = ["Run context", "Measurement trace", "Report summary"];
      for (let i = 0; i < 3; i++) {
        const y = 109 + i * 96,
          active = i === chosen;
        label(names[i], 26, y - 19, 13, active ? accent : muted);
        if (i === 1) curve(27, y, 236, 55, 0.9, teal, gather);
        else
          for (let j = 0; j < 3; j++)
            line(
              [
                [28, y + j * 13],
                [224 - j * 31, y + j * 13],
              ],
              faint,
              1.4,
            );
        const t = ease((p - 0.34 - i * 0.08) / 0.36),
          x = mix(289, 526, t),
          yy = mix(y + 13, 127 + i * 88, t);
        alpha(choose, () => {
          rect(283, y - 9, 17, 17, wash, active ? accent : muted);
          line(
            [
              [286, y - 2],
              [290, y + 2],
              [297, y - 5],
            ],
            active ? accent : muted,
            1.2,
          );
        });
        path([304, y + 7], [515, 127 + i * 88], active ? accent : faint, t);
        if (i === 1) {
          curve(x, yy - 10, mix(62, 183, t), mix(31, 51, t), 0.9, teal, choose);
        } else
          alpha(choose, () => {
            for (let j = 0; j < 3; j++)
              line(
                [
                  [x, yy + j * 10],
                  [x + mix(40 - j * 6, 176 - j * 22, t), yy + j * 10],
                ],
                active ? accent : muted,
                1.2,
              );
          });
      }
      alpha(assemble, () => {
        line(
          [
            [503, 69],
            [757, 69],
            [757, 410],
            [503, 410],
            [503, 69],
          ],
          muted,
          1.2,
        );
        names.forEach((name, i) =>
          label(name, 527, 105 + i * 88, 12, i === chosen ? ink : muted),
        );
      });
      alpha(inspect, () =>
        label("Selected results, placed with their run context.", 27, 446, 16),
      );
    } else if (kind === "signals") {
      heading("SEPARATE PARAMETER WINDOWS", "INSPECT THE SAME MOMENT");
      const sync = ease((p - 0.17) / 0.36),
        inspectX = clamp(inspection, 0.05, 0.95);
      for (let i = 0; i < 3; i++) {
        const y = 92 + i * 101,
          x = 156 + (1 - sync) * (i - 1) * 55,
          ww = 579 - (1 - sync) * i * 72,
          local = mix([0.22, 0.75, 0.47][i], inspectX, sync);
        label("Parameter " + (i + 1), 22, y + 35, 13, muted);
        curve(x, y, ww, 72, i, teal, 1, (1 - sync) * i * 0.16);
        line(
          [
            [x, y + 78],
            [x + ww, y + 78],
          ],
          faint,
        );
        for (let j = 0; j < 7; j++)
          line(
            [
              [x + (j * ww) / 6, y + 76],
              [x + (j * ww) / 6, y + 82],
            ],
            muted,
            0.7,
          );
        const cursor = x + local * ww;
        rect(cursor - 20, y - 8, 40, 86, "#bd995022", null);
        line(
          [
            [cursor, y - 8],
            [cursor, y + 78],
          ],
          accent,
          1.3,
        );
        dot(
          cursor,
          y + 72 * (1 - signal(local + (1 - sync) * i * 0.16, i)),
          4,
          accent,
        );
      }
      alpha(sync, () => {
        const x = 156 + inspectX * 579;
        line(
          [
            [x, 77],
            [x, 377],
          ],
          accent,
          1.3,
        );
        label("ONE SHARED INSPECTION WINDOW", 405, 432, 13, accent, "center");
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
