import { drawWork } from "./films/environment.js";
import { mix } from "./films/drawing.js";
import { drawing } from "./films/drawing.js";
import { studio } from "./films/studio.js";
// Four anchors establish the composition. Image luminance, actual bounds and available
// viewport space determine final size; the coordinates are only the initial arrangement.
const cache = new Map();
export function collectionBounds(w, h) {
  const mobile = w < 700;
  return {
    top: mobile ? 136 : h < 600 ? 116 : Math.min(150, h * 0.19),
    bottom: h - (mobile ? 174 : 80),
    margin: mobile ? 14 : Math.max(30, w * 0.04),
  };
}
export function configureCollection(w, h, dimensions = []) {
  const mobile = w < 700;
  const { top, bottom, margin } = collectionBounds(w, h);
  const locations = mobile
    ? [
        [0.21, 0.29],
        [0.12, 0.2],
        [0.35, 0.18],
        [0.8, 0.29],
        [0.62, 0.2],
        [0.87, 0.18],
        [0.91, 0.45],
        [0.21, 0.67],
        [0.12, 0.76],
        [0.35, 0.77],
        [0.62, 0.76],
        [0.87, 0.77],
        [0.09, 0.45],
        [0.5, 0.29],
        [0.5, 0.64],
        [0.8, 0.67],
      ]
    : [
        [0.21, 0.34],
        [0.1, 0.19],
        [0.34, 0.21],
        [0.78, 0.34],
        [0.66, 0.19],
        [0.91, 0.2],
        [0.88, 0.56],
        [0.24, 0.72],
        [0.1, 0.61],
        [0.39, 0.82],
        [0.7, 0.79],
        [0.9, 0.82],
        [0.12, 0.83],
        [0.5, 0.22],
        [0.51, 0.77],
        [0.77, 0.63],
      ];
  const base =
    (mobile ? 0.38 : Math.min(w / 1550, h / 900, 1.12)) *
    Math.min(1, (bottom - top) / (h * 0.65));
  const planes = locations.map(([x, y], i) => {
    const anchor = [0, 3, 7, 15].includes(i),
      bright = [3, 10, 11, 12].includes(i),
      size = dimensions[i] || { w: 240, h: 195 };
    return {
      x: x * w,
      y: y * h,
      z: (anchor ? 70 : -85) - (bright ? 50 : 0),
      scale: base * (anchor ? 1.0 : mobile ? 0.72 : 0.64) * (bright ? 0.85 : 1),
      angle: x < 0.5 ? 0 : Math.PI,
      anchor,
      size,
    };
  });
  const rect = (p) => {
    const k = 1600 / (1600 - p.z),
      ww = p.size.w * p.scale * k + 8,
      hh = p.size.h * p.scale * k + 8;
    return {
      x: w / 2 + (p.x - w / 2) * k - ww / 2,
      y: h / 2 + (p.y - h / 2) * k - hh / 2,
      w: ww,
      h: hh,
    };
  };
  const homeWidth = mobile
      ? Math.min(w * 0.72, 440)
      : Math.min(w * (h <= 600 ? 0.32 : 0.38), 640),
    homeScale = (0.86 * 1600) / 1830,
    homeW = homeWidth * homeScale + 18,
    homeH = (homeWidth / 1.5 + (mobile ? 30 : 42)) * homeScale + 18,
    homeY = h / 2 + ((h * (mobile ? 0.46 : 0.51) - h / 2) * 1600) / 1830;
  const home = { x: (w - homeW) / 2, y: homeY - homeH / 2, w: homeW, h: homeH };
  const collision = (a, b) =>
    a.x + a.w > b.x && b.x + b.w > a.x && a.y + a.h > b.y && b.y + b.h > a.y;
  const order = [
    0,
    3,
    7,
    15,
    13,
    14,
    ...planes
      .map((_, i) => i)
      .filter((i) => ![0, 3, 7, 15, 13, 14].includes(i)),
  ];
  const seeds = planes.map((p) => ({ x: p.x, y: p.y, scale: p.scale }));
  // If one plane cannot fit, recompute the whole installation at a smaller scale.
  // Falling back to unplaced seed positions would silently create piles on short screens.
  for (let pass = 0; pass < 16; pass++) {
    const occupied = [home];
    let complete = true;
    planes.forEach((p, i) =>
      Object.assign(p, { ...seeds[i], scale: seeds[i].scale * 0.93 ** pass }),
    );
    for (const i of order) {
      const p = planes[i],
        ideal = rect(p),
        cx = ideal.x + ideal.w / 2,
        cy = ideal.y + ideal.h / 2,
        k = 1600 / (1600 - p.z);
      let best = null;
      for (let attempt = 0; attempt < 9 && !best; attempt++) {
        const box = rect(p),
          step = mobile ? 8 : 16;
        let score = Infinity;
        for (let yy = top + box.h / 2; yy <= bottom - box.h / 2; yy += step) {
          for (
            let xx = margin + box.w / 2;
            xx <= w - margin - box.w / 2;
            xx += step
          ) {
            const candidate = {
              x: xx - box.w / 2 - 5,
              y: yy - box.h / 2 - 5,
              w: box.w + 10,
              h: box.h + 10,
            };
            if (occupied.some((other) => collision(candidate, other))) continue;
            const cost = (xx - cx) ** 2 + (yy - cy) ** 2;
            if (cost < score) {
              score = cost;
              best = { x: xx, y: yy, box: candidate };
            }
          }
        }
        if (!best) p.scale *= 0.94;
      }
      if (best) {
        p.x = w / 2 + (best.x - w / 2) / k;
        p.y = h / 2 + (best.y - h / 2) / k;
        occupied.push(best.box);
      } else {
        complete = false;
        break;
      }
    }
    if (complete) break;
  }
  cache.set(w + ":" + h, planes);
  return planes;
}
export function collectionPosition(i, w, h, open = 0, turn = 0) {
  const positions = cache.get(w + ":" + h) || configureCollection(w, h),
    p = positions[i];
  return { ...p, z: p.z + open * 15 + turn * 5 };
}

// The constructed environment retains its lighting as real interfaces occupy it.
export function paintCollectionField(ctx, w, h) {
  const light = ctx.createLinearGradient(0, 0, w, h);
  light.addColorStop(0, "#14212c");
  light.addColorStop(0.5, "#0b1117");
  light.addColorStop(1, "#050708");
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, w, h);
}

// The same completed mechanisms occupy the four future anchor positions.
export function workSpaceProjection(w, h, transform) {
  const unit = Math.min(w / 900, h / 530);
  return (P) => {
    const station = P[0] < -260 ? 0 : P[0] > 260 ? 2 : 1,
      from = [-600, 0, 600][station],
      pos = collectionPosition([0, 3, 15][station], w, h),
      k = 1600 / (1600 - pos.z);
    const x = ((pos.x - w * 0.5) * k) / unit,
      y = ((pos.y - h * 0.51) * k) / unit,
      scale =
        (240 * pos.scale * k) /
        (station === 0 ? 680 : station === 1 ? 290 : 340) /
        unit;
    return [
      mix(P[0], x + (P[0] - from) * scale, transform),
      mix(P[1], y + P[1] * scale, transform),
      P[2] * (1 - transform),
    ];
  };
}
export function paintWorkingStructures(ctx, w, h, progress, recognition = 0) {
  const opacity = progress * (1 - recognition);
  if (opacity < 0.002) return;
  ctx.save();
  ctx.globalAlpha *= opacity;
  const d = drawing(ctx, false, w < 700),
    g = studio(d, w, h, {
      yaw: 0,
      pitch: 0,
      zoom: 1,
      map: workSpaceProjection(w, h, 1),
    });
  drawWork(g, 6.15);
  g.draw();
  ctx.restore();
}
