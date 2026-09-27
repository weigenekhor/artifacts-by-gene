import { mix, ease } from "./space.js";
const layer = document.createElement("canvas"),
  mask = layer.getContext("2d");
const blend = (a, b, t) =>
  `rgb(${a.map((v, i) => Math.round(mix(v, b[i], t))).join(",")})`;
// Approved identity surface. Origin choreography lives in starting-over.js.
export function drawIdentityField(
  ctx,
  { width: w, height: h, p, clock, px, py, reduced },
) {
  const mobile = w < 700,
    enter = ease((p - 0.18) / 0.95);
  const light = ease((p - 0.75) / 0.6) * (1 - ease((p - 4.8) / 0.85));
  ctx.fillStyle = blend([5, 7, 8], [234, 234, 224], light);
  ctx.fillRect(0, 0, w, h);
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
}
