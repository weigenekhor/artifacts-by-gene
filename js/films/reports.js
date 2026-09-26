import { mix, at, settle, sample } from "./drawing.js";

export function compile(d, q, f, W, H, m, hit) {
  const {
    text,
    line,
    path,
    rect,
    dot,
    trace,
    alpha,
    ink,
    muted,
    faint,
    accent,
    teal,
  } = d;
  const sources = ["LayTec", "PL / Plato", "XRR", "XRD"],
    active = Math.min(3, Math.floor(f * 4)),
    rx = W * (m ? 0.59 : 0.63),
    ry = H * 0.14,
    rw = W * (m ? 0.36 : 0.31),
    rh = H * 0.72;
  alpha(at(q, 0.24, 0.18), () => {
    rect(rx, ry, rw, rh, null, muted);
    text(m ? "Workbook" : "Base workbook", rx + 14, ry + 32, 20, ink);
  });
  sources.forEach((name, i) => {
    const x = W * 0.055,
      y = H * (0.12 + i * 0.21),
      ww = W * (m ? 0.34 : 0.3),
      selected = i === active,
      arrive = at(q, 0.34 + i * 0.055, 0.22);
    alpha(1 - at(q, 0.67, 0.1) * (selected ? 0 : 0.58), () => {
      text(name, x, y, 23, selected ? accent : ink);
      if (i === 0) trace(x, y + 10, ww, H * 0.11, 2, at(q, 0.02, 0.16), teal);
      if (i === 1)
        for (let j = 0; j < 22; j++) {
          const ht = Math.exp(-(((j - 11) / 4.4) ** 2)) * H * 0.1;
          line(
            [
              [x + (ww * j) / 22, y + H * 0.14],
              [x + (ww * j) / 22, y + H * 0.14 - ht],
            ],
            teal,
            1.8,
          );
        }
      if (i === 2)
        for (let j = 0; j < 32; j++)
          dot(
            x + (ww * j) / 31,
            y +
              18 +
              H *
                0.11 *
                (1 - Math.exp(-j / 9) * (0.7 + Math.cos(j * 0.7) * 0.16)),
            2,
            teal,
          );
      if (i === 3) {
        const pts = [];
        for (let j = 0; j < 70; j++)
          pts.push([
            x + (ww * j) / 69,
            y +
              H * 0.14 -
              H *
                0.11 *
                (Math.exp(-(((j - 29) / 4) ** 2)) +
                  0.5 * Math.exp(-(((j - 51) / 3) ** 2))),
          ]);
        line(pts, teal, 1.6);
      }
    });
    const yy = ry + H * (0.15 + i * 0.14);
    alpha(
      at(q, 0.3 + i * 0.055, 0.1) *
        (1 - at(q, 0.68, 0.1) * (selected ? 0 : 0.94)),
      () =>
        path(
          [x + ww, y + H * 0.07],
          [rx + 14, yy],
          selected ? accent : muted,
          1.2,
        ),
    );
    for (let j = 0; j < 4; j++) {
      const t = at(q, 0.31 + i * 0.055 + j * 0.015, 0.26),
        xx = mix(x + (ww * (j + 0.5)) / 4, rx + 16 + (j * (rw - 32)) / 4, t),
        ty = mix(y + H * 0.09, yy + 24, t);
      alpha(at(q, 0.27 + i * 0.055 + j * 0.015, 0.08), () =>
        line(
          [
            [xx, ty],
            [xx + mix(8, (rw - 40) / 4, t), ty],
          ],
          selected ? accent : teal,
          2,
        ),
      );
    }
    alpha(arrive, () => {
      text(name, rx + 14, yy, 18, selected ? ink : muted);
      line(
        [
          [rx + 14, yy + 36],
          [rx + rw - 14, yy + 36],
        ],
        faint,
      );
    });
    hit((i + 0.5) / 4, rx, yy - 25, rw, H * 0.14, name);
  });
  return sources[active] + " → workbook";
}

export function report(d, q, f, W, H, m, hit, alternate) {
  const { text, line, path, rect, alpha, ink, muted, faint, accent, teal } = d;
  const active = Math.min(2, Math.floor(f * 3)),
    extract = at(q, 0.18, 0.2),
    append = at(q, 0.4, 0.25) * (1 - alternate);
  const x = W * 0.055,
    y = H * (m ? 0.1 : 0.2),
    sw = W * (m ? 0.89 : 0.34),
    outX = m ? x : W * 0.61,
    outY = m ? H * 0.56 : y,
    outW = sw,
    row = H * (m ? 0.045 : 0.085);
  text("LayTec analysis .htm", x, y - 25, 22, ink);
  text("Base workbook .xlsx", outX, outY - 25, 22, ink);
  rect(x, y, sw, row * 5.7, null, faint);
  rect(outX, outY, outW, row * 7, null, muted);
  for (let i = 0; i < 2; i++) {
    line(
      [
        [outX + 18, outY + 20 + i * row],
        [outX + outW - 18, outY + 20 + i * row],
      ],
      faint,
      1.5,
    );
  }
  alpha(at(q, 0.1, 0.12), () =>
    text("Existing rows", outX + 16, outY + row * 2.3, 17, muted),
  );
  for (let i = 0; i < 3; i++) {
    const yy = y + row * (1.3 + i * 1.3),
      t = at(q, 0.39 + i * 0.06, 0.24) * (1 - alternate),
      tx = mix(x + sw * 0.18, outX + outW * 0.08, t),
      ty = mix(yy, outY + row * (3.4 + i), t);
    alpha(1 - t * 0.8, () => {
      text("<tr>", x + 14, yy + 5, 17, muted);
      for (let j = 0; j < 3; j++)
        line(
          [
            [x + sw * (0.22 + j * 0.25), yy],
            [x + sw * (0.4 + j * 0.25), yy],
          ],
          teal,
          2,
        );
    });
    alpha(extract, () => {
      rect(
        tx - 8,
        ty - row * 0.35,
        outW * 0.86,
        row * 0.73,
        null,
        t > 0.99 ? faint : accent,
      );
      for (let j = 0; j < 3; j++)
        line(
          [
            [tx + j * outW * 0.27, ty],
            [tx + (j + 0.7) * outW * 0.27, ty],
          ],
          teal,
          2.3,
        );
    });
  }
  alpha(append, () =>
    line(
      [
        [outX + 12, outY + row * 2.8],
        [outX + outW - 12, outY + row * 2.8],
      ],
      accent,
      1.7,
    ),
  );
  alpha(extract * (1 - at(q, 0.7, 0.12)), () => {
    const a = [x + sw, y + row * 3],
      b = [outX, outY + row * 4];
    if (m) path([W * 0.82, y + row * 5.7], [W * 0.82, outY], accent, 1.3);
    else path(a, b, accent, 1.3);
  });
  hit(0.16, x, y, sw, row * 5.7, "Analysis file");
  hit(
    0.5,
    m ? W * 0.3 : W * 0.43,
    m ? H * 0.41 : y,
    m ? W * 0.4 : W * 0.14,
    m ? H * 0.12 : H * 0.5,
    "Extracted rows",
  );
  hit(0.84, outX, outY, outW, row * 7, "Base workbook");
  return [
    "HTML analysis",
    "Selected analysis rows",
    "Appended beneath existing rows",
  ][active];
}

export function legacy(d, q, f, W, H, m, hit, alternate) {
  const {
    text,
    line,
    rect,
    dot,
    trace,
    alpha,
    ink,
    muted,
    faint,
    accent,
    teal,
  } = d;
  const names = ["G", "J", "B", "E", "H"],
    states = ["Passed", "Passed", "Failed", "Passed", "Failed"],
    active = Math.min(4, Math.floor(f * 5));
  const t = at(q, 0.2, 0.4) * (1 - alternate),
    left = W * 0.06,
    width = W * 0.88,
    top = H * 0.13;
  for (let i = 0; i < 5; i++) {
    const rx = W * (0.06 + (i % 2) * 0.48),
      ry = H * (0.12 + Math.floor(i / 2) * 0.25),
      rawWidth = W * (i === 4 ? 0.86 : 0.4),
      x = mix(rx, left, t),
      y = mix(ry, top + i * H * 0.085, t),
      ww = mix(rawWidth, width, t);
    const selected = i === active;
    alpha(1 - t, () => {
      rect(x, y + 25, ww, H * 0.17, null, faint);
      if (i === 0 || i === 2) {
        for (let k = 0; k < 3; k++) {
          line(
            [
              [x + ww * (0.15 + k * 0.28), y + 38],
              [x + ww * (0.15 + k * 0.28), y + H * 0.14],
            ],
            muted,
          );
        }
      }
      if (i === 1) {
        for (let k = 0; k < 3; k++)
          line(
            [
              [x + 10, y + 39 + k * H * 0.035],
              [x + ww - 10, y + 39 + k * H * 0.035],
            ],
            muted,
          );
      }
      if (i === 3 || i === 4)
        trace(x + 12, y + 40, ww - 24, H * 0.11, i, 1, teal);
    });
    text(
      "Parameter " + names[i],
      x,
      y + 14,
      m ? 23 : 20,
      selected ? ink : muted,
    );
    const sx = mix(x + 12, x + ww * 0.52, t),
      sy = mix(y + H * 0.2, y + 14, t);
    alpha(at(q, 0.1, 0.1), () =>
      text(
        states[i],
        sx,
        sy,
        m ? 21 : 18,
        states[i] === "Failed" ? accent : teal,
      ),
    );
    alpha(t, () => {
      line(
        [
          [x, y + 29],
          [x + ww, y + 29],
        ],
        selected ? accent : faint,
      );
      trace(x + ww * 0.77, y - 4, ww * 0.22, 24, i, 1, selected ? teal : muted);
    });
    hit((i + 0.5) / 5, x, y - 8, ww, H * 0.085, "Parameter " + names[i]);
  }
  alpha(at(q, 0.57, 0.16) * (1 - alternate), () => {
    const y = H * 0.71,
      hh = H * 0.22;
    text("Parameter " + names[active], left, y - 22, 22, ink);
    rect(left, y, width, hh, null, faint);
    trace(left + 16, y + 12, width - 32, hh - 24, active, 1, teal);
    dot(left + width * 0.65, y + hh * (1 - sample(0.65, active)), 4, accent);
  });
  return "Parameter " + names[active] + " · " + states[active];
}

export function spc(d, q, f, W, H, m, hit) {
  const {
    text,
    line,
    rect,
    dot,
    trace,
    alpha,
    ink,
    muted,
    faint,
    accent,
    teal,
  } = d;
  const focus = at(q, 0.32, 0.31),
    active = Math.min(2, Math.floor(f * 3));
  for (let i = 0; i < 9; i++) {
    const selected = i === 4,
      rawX = W * (0.04 + (i % 3) * 0.32),
      rawY = H * (0.13 + Math.floor(i / 3) * 0.24),
      x = mix(rawX, selected ? W * 0.12 : W * (0.04 + (i % 4) * 0.245), focus),
      y = mix(rawY, selected ? H * 0.27 : H * (i < 4 ? 0.1 : 0.81), focus),
      ww = mix(W * 0.27, selected ? W * 0.76 : W * 0.19, focus),
      hh = mix(H * 0.17, selected ? H * 0.34 : H * 0.1, focus);
    alpha(selected ? 1 : mix(1, 0.32, focus), () => {
      rect(x - 8, y - 8, ww + 16, hh + 16, null, faint);
      line(
        [
          [x, y + hh * 0.15],
          [x + ww, y + hh * 0.15],
        ],
        faint,
      );
      line(
        [
          [x, y + hh * 0.85],
          [x + ww, y + hh * 0.85],
        ],
        faint,
      );
      trace(
        x,
        y,
        ww,
        hh,
        i === 4 ? active : i,
        at(q, 0.02 + i * 0.008, 0.22),
        selected ? accent : teal,
        selected,
      );
      if (selected) {
        alpha(at(q, 0.5, 0.15), () => {
          rect(
            x + ww * 0.59,
            y + hh * 0.13,
            ww * 0.12,
            hh * 0.73,
            null,
            accent,
          );
          text("Parameter " + "ABC"[active], x, y - 25, 22, ink);
          for (let j = 0; j < 30; j++) {
            const u = j / 29;
            dot(
              x + u * ww,
              y + hh + 40 + sample(u, active) * H * 0.06,
              2.4,
              muted,
            );
          }
        });
      }
    });
  }
  for (let i = 0; i < 3; i++)
    hit(
      (i + 0.5) / 3,
      W * (0.05 + i * 0.31),
      H * 0.1,
      W * 0.3,
      H * 0.78,
      "Parameter " + "ABC"[i],
    );
  return "Parameter " + "ABC"[active] + " · signal + raw observations";
}
