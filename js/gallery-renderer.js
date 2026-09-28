import { renderers } from "./films/renderers.js";
import { drawing } from "./films/drawing.js";

// The preview uses one aspect-correct coordinate space; DPR changes pixel density only.
export function renderPreview(
  canvas,
  { kind, w, h, q, mobile = false, topography },
) {
  if (kind === "surface") {
    topography(q, 0.56, false, 0, 0);
    return;
  }
  const ctx = canvas.getContext("2d"),
    dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2),
    W = 1000,
    H = (W * h) / w;
  if (
    canvas.width !== Math.round(w * dpr) ||
    canvas.height !== Math.round(h * dpr)
  ) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const d = drawing(ctx, false, false),
    text = d.text;
  d.preview = true;
  // Long explanatory statements live in the caption/detail; preview labels identify evidence.
  d.text = (str, x, y, size, color, align) => {
    if (str.length > 31) return;
    text(str, x, y, Math.max(size || 18, w < 420 ? 29 : 23), color, align);
  };
  renderers[kind](d, q, 0.55, W, H, false, () => {}, 0);
}
