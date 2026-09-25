// Shared positions let the constructed framework become the real collection.
export function collectionPosition(i, w, h, open = 0, turn = 0) {
  const mobile = w < 700,
    angle = (i / 16) * Math.PI * 2 - Math.PI / 2 + turn * 0.05 * open;
  return {
    x:
      w * 0.5 +
      Math.cos(angle) * w * (0.37 + ((mobile ? 0.37 : 0.33) - 0.37) * open),
    y:
      h * (0.48 + ((mobile ? 0.57 : 0.59) - 0.48) * open) +
      Math.sin(angle) *
        h *
        ((mobile ? 0.245 : 0.23) +
          ((mobile ? 0.27 : 0.225) - (mobile ? 0.245 : 0.23)) * open),
    z:
      ((i % 3) - 1) * 90 * (1 - open) +
      (Math.sin(angle * 2 + 0.6) * (mobile ? 25 : 105) + (mobile ? 35 : 90)) *
        open,
    scale:
      ((mobile ? 0.51 : 0.56) +
        ((mobile ? 0.67 : 0.76) - (mobile ? 0.51 : 0.56)) * open) *
      (mobile ? 0.46 : Math.min(1.35, w / 1400)),
    angle,
  };
}

// The constructed environment retains its lighting as real interfaces occupy it.
export function paintCollectionField(ctx, w, h) {
  const light = ctx.createLinearGradient(0, 0, w, h);
  light.addColorStop(0, "#15271d");
  light.addColorStop(0.5, "#0b1710");
  light.addColorStop(1, "#050708");
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, w, h);
}
