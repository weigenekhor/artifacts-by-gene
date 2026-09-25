import { mix, ease, clamp } from "./space.js";
import { collectionPosition } from "./collection-layout.js";
const layer = document.createElement("canvas"),
  mask = layer.getContext("2d");
const blend = (a, b, t) =>
  `rgb(${a.map((v, i) => Math.round(mix(v, b[i], t))).join(",")})`;
// Identity, evidence and a constructed framework share this coordinate field.
export function drawIdentityField(
  ctx,
  { width: w, height: h, p, clock, px, py, reduced },
) {
  const mobile = w < 700,
    enter = ease((p - 0.18) / 0.95),
    align = ease((p - 1.7) / 1.1),
    retain = ease((p - 2.8) / 0.9),
    revise = ease((p - 3.7) / 1.05),
    build = ease((p - 4.7) / 0.75),
    open = ease((p - 5.2) / 0.55);
  const light = ease((p - 0.75) / 0.6) * (1 - ease((p - 4.8) / 0.85));
  ctx.fillStyle = blend([5, 7, 8], [234, 234, 224], light);
  ctx.fillRect(0, 0, w, h);
  const ink = blend([123, 145, 143], [55, 72, 64], light),
    accent = blend([215, 165, 105], [151, 95, 43], light);
  const line = (pts, color = ink, width = 1, alpha = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.restore();
  };
  const text = (str, x, y, size = 11, color = ink) => {
    ctx.fillStyle = color;
    ctx.font = `400 ${size}px Geist, Arial`;
    ctx.fillText(str, x, y);
  };
  const field = (target, alpha = 1) => {
    target.save();
    target.globalAlpha = alpha;
    for (let row = 0; row < 32; row++) {
      target.beginPath();
      for (let j = 0; j <= 95; j++) {
        const u = j / 95,
          x = u * w * 1.4 - w * 0.2;
        const v =
          Math.sin(u * 9 + row * 0.11 + clock * 0.07) * h * 0.055 +
          Math.sin(u * 23 + row * 0.09) * h * 0.018;
        const y = h * 0.22 + row * h * 0.017 + v + py * (row - 16) * 0.7;
        j ? target.lineTo(x, y) : target.moveTo(x, y);
      }
      target.strokeStyle = row % 6 === 0 ? "#cba276" : "#799189";
      target.lineWidth = row % 6 === 0 ? 1.4 : 0.7;
      target.stroke();
    }
    target.restore();
  };
  if (p < 1.15) {
    const dpr = ctx.getTransform().a,
      W = Math.round(w * dpr),
      H = Math.round(h * dpr);
    if (layer.width !== W || layer.height !== H) {
      layer.width = W;
      layer.height = H;
    }
    mask.setTransform(dpr, 0, 0, dpr, 0, 0);
    mask.clearRect(0, 0, w, h);
    field(ctx, 0.14 * (1 - enter));
    const font = mobile ? w * 0.235 : w * 0.205;
    mask.font = `650 ${font}px Geist, Arial`;
    mask.textAlign = "center";
    mask.textBaseline = "middle";
    const width = mask.measureText("ARTIFACTS").width,
      sx = (w * 0.95) / width;
    const zoom = 1 + enter * 2.6,
      x = w * 0.5 + px * 9 * (1 - enter) - enter * w * 0.26,
      y = h * (mobile ? 0.43 : 0.45) + py * 6 * (1 - enter) - enter * h * 0.12;
    mask.save();
    mask.translate(x, y);
    mask.transform(sx * zoom, py * 0.004, px * 0.035, zoom, 0, 0);
    for (let z = 11; z > 0; z--) {
      mask.fillStyle = blend([12, 20, 23], [48, 63, 65], z / 11);
      mask.fillText(
        "ARTIFACTS",
        -z * px * 0.9 + z * 0.45,
        z * (1.1 + py * 0.35),
      );
    }
    const material = mask.createLinearGradient(0, -font * 0.5, 0, font * 0.48);
    material.addColorStop(0, "#f2eee1");
    material.addColorStop(0.46, "#cdd3cc");
    material.addColorStop(0.54, "#8b9e99");
    material.addColorStop(1, "#354642");
    mask.fillStyle = material;
    mask.fillText("ARTIFACTS", 0, 0);
    mask.restore();
    mask.globalCompositeOperation = "source-atop";
    field(mask, 0.64);
    const beam = mask.createRadialGradient(
      w * (0.5 + px * 0.26),
      h * (0.38 + py * 0.14),
      1,
      w * (0.5 + px * 0.26),
      h * (0.38 + py * 0.14),
      w * 0.42,
    );
    beam.addColorStop(0, "#fff6db65");
    beam.addColorStop(1, "#ffffff00");
    mask.fillStyle = beam;
    mask.fillRect(0, 0, w, h);
    mask.globalCompositeOperation = "source-over";
    ctx.save();
    ctx.globalAlpha = 1 - ease((p - 0.8) / 0.35);
    ctx.drawImage(layer, 0, 0, w, h);
    ctx.restore();
  }
  if (enter > 0.01) {
    const x0 = w * (mobile ? 0.11 : 0.2),
      x1 = w * (mobile ? 0.89 : 0.85),
      top = h * (mobile ? 0.27 : 0.23),
      gap = h * (mobile ? 0.065 : 0.078);
    ctx.save();
    ctx.globalAlpha = enter;
    for (let r = 0; r < 4; r++) {
      const y = top + r * gap;
      const points = [];
      for (let j = 0; j <= 64; j++) {
        const u = j / 64,
          rough = Math.sin(u * 16 + r * 2.3) * 16 + Math.sin(u * 39 + r) * 5;
        const shared = Math.sin(u * 14) * 15 + (u > 0.55 && u < 0.66 ? -23 : 0);
        let xx = mix(-w * 0.2 + u * w * 1.4, x0 + u * (x1 - x0), enter);
        let yy = mix(
          h * 0.38 + r * 16 + Math.sin(u * 9 + r * 0.2) * h * 0.04,
          y + mix(rough, shared, align) * (1 - retain * 0.8),
          enter,
        );
        // The detour is shortened during Improve; the original route remains as context.
        const detour =
          (ease((u - 0.4) / 0.05) - ease((u - 0.58) / 0.05)) * gap * 0.4;
        yy += detour * retain * (1 - revise);
        yy = mix(yy, top + (r / 3) * gap * 3, build);
        points.push([xx, yy]);
      }
      // The rejected detour remains visible while a shorter route takes its place.
      if (revise > 0.01 && build < 1) {
        const old = points.map(([x, y]) => [
          x,
          y +
            (x > x0 + (x1 - x0) * 0.4 && x < x0 + (x1 - x0) * 0.6
              ? gap * 0.35 * revise
              : 0),
        ]);
        line(old, ink, 0.65, revise * (1 - build) * 0.23);
      }
      line(points, r === 2 ? accent : ink, r === 2 ? 2.1 : 1.2, 1 - open);
      if (!mobile && p > 1.08 && p < 4.9)
        text(
          ["Run context", "Reference", "Comparison", "Checks"][r],
          x0 - 95,
          y + 4,
          11,
        );
      if (p < 5.15) {
        for (let k = 0; k < 5; k++) {
          const u = 0.12 + k * 0.18,
            xx = x0 + u * (x1 - x0),
            yy = y + (1 - align) * Math.sin(r * 4 + k) * 20;
          const lock = ease((retain - k * 0.06) / 0.65),
            length = 5 + lock * 8;
          line(
            [
              [xx, yy - length],
              [xx, yy + length],
            ],
            k === 2 ? accent : ink,
            1,
          );
          if (retain > 0.02 && r < 3)
            line(
              [
                [xx, y + 8],
                [xx, y + gap - 8],
              ],
              ink,
              0.6,
              lock * 0.5,
            );
        }
        if (!mobile && p > 1.08) {
          const words = [
            ["Start", "State", "Duration"],
            ["Source", "Revision", "Baseline"],
            ["Align", "Difference", "Context"],
            ["Observe", "Test", "Record"],
          ][r];
          words.forEach((word, k) => {
            const u = 0.2 + k * 0.29,
              x = x0 + u * (x1 - x0),
              offset = (1 - align) * (Math.sin(r * 3 + k) * 20);
            const yy = y + offset;
            ctx.fillStyle = blend([5, 7, 8], [234, 234, 224], light);
            ctx.fillRect(x - 7, yy - 9, 7 + ctx.measureText(word).width, 18);
            text(word, x, yy + 4, 12, r === 2 ? accent : ink);
          });
        }
      }
      if (revise > 0.01 && revise < 1) {
        const xx = mix(x0, x1, revise);
        line(
          [
            [xx, y - 12],
            [xx, y + 12],
          ],
          accent,
          2,
          Math.sin(revise * Math.PI),
        );
      }
    }
    if (align > 0.01 && build < 1) {
      const x = mix(x0, x1, reduced ? 0.6 : (clock * 0.12) % 1);
      line(
        [
          [x, top - 28],
          [x, top + gap * 3 + 26],
        ],
        accent,
        1.1,
        align * (1 - build) * 0.8,
      );
    }
    // The completed method gains subdivisions, then those same positions open.
    if (build > 0.01) {
      for (let i = 0; i < 16; i++) {
        const cellW = (x1 - x0) / 4,
          cellH = gap * 0.86;
        const from = {
          x: x0 + ((i % 4) + 0.5) * cellW,
          y: top + Math.floor(i / 4) * gap,
        };
        const to = collectionPosition(i, w, h),
          perspective = 1600 / (1600 - to.z);
        const xx = mix(from.x, w * 0.5 + (to.x - w * 0.5) * perspective, open),
          yy = mix(from.y, h * 0.5 + (to.y - h * 0.5) * perspective, open);
        const ww = mix(cellW * 0.87, 240 * to.scale * perspective, open),
          hh = mix(cellH, 191 * to.scale * perspective, open);
        const grow = ease((build - (i % 4) * 0.07) / 0.7);
        line(
          [
            [xx - ww / 2, yy + hh / 2],
            [xx - ww / 2, yy - hh / 2],
            [xx + ww / 2, yy - hh / 2],
            [xx + ww / 2, yy + hh / 2],
            [xx - ww / 2, yy + hh / 2],
          ],
          ink,
          0.75,
          grow,
        );
        line(
          [
            [xx - ww / 2, yy - hh / 2],
            [xx - ww / 2 + ww * 0.18, yy - hh / 2],
          ],
          accent,
          1.5,
          grow,
        );
      }
    }
    ctx.restore();
  }
}
