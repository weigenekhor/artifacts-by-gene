import { renderMaterialField } from "./material-renderer.js";
// Shared lightweight 3D projection, depth ordering and directional material light.
// Geometry is illustrative; no diagram represents live application output.
export const clamp = (v) => Math.max(0, Math.min(1, v));
export const mix = (a, b, t) => a + (b - a) * t;
export const ease = (v) => {
  v = clamp(v);
  return v * v * v * (v * (v * 6 - 15) + 10);
};
export const palette = {
  sage: [125, 157, 138],
  metal: [178, 194, 177],
  dark: [35, 56, 49],
  warm: [190, 133, 81],
  paper: [205, 213, 197],
  ink: [58, 82, 68],
  teal: [67, 126, 123],
};
const rgb = (c, l = 1, a = 1) =>
  `rgba(${c.map((v) => Math.round(Math.min(255, v * l))).join(",")},${a})`;
export function space(
  ctx,
  {
    w,
    h,
    scale = 1,
    cx = 0.5,
    cy = 0.5,
    yaw = -0.25,
    tilt = 0.7,
    light = false,
  },
) {
  const unit = Math.min(w / 760, h / 470) * scale,
    queue = [],
    labels = [];
  const project = ([x, y, z = 0]) => {
    const xx = x * Math.cos(yaw) - y * Math.sin(yaw),
      yy = x * Math.sin(yaw) + y * Math.cos(yaw),
      Y = yy * Math.cos(tilt) - z * Math.sin(tilt),
      Z = yy * Math.sin(tilt) + z * Math.cos(tilt),
      k = 1400 / (1400 - Z);
    return [w * cx + xx * unit * k, h * cy + Y * unit * k, Z, k];
  };
  const poly = (pts, color = palette.dark, alpha = 1, edge = false) => {
    const a = pts[0],
      b = pts[1],
      c = pts[2],
      u = b.map((v, i) => v - a[i]),
      v = c.map((v, i) => v - a[i]);
    const n = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0],
      ],
      length = Math.hypot(...n) || 1;
    const lit =
      0.57 +
      0.5 * Math.abs((n[0] * -0.35 + n[1] * -0.5 + n[2] * 0.78) / length);
    const q = pts.map(project);
    queue.push({
      pts: q,
      depth: q.reduce((s, p) => s + p[2], 0) / q.length,
      fill: rgb(color, lit, alpha),
      normal: n.map((v) => v / length),
      material: color,
      alpha,
      lit,
      stroke: edge ? rgb(color, 1.25, alpha * 0.6) : null,
      width: 0.55,
    });
  };
  const line = (pts, color = palette.sage, width = 1, alpha = 1) => {
    if (pts.length < 2) return;
    const q = pts.map(project);
    for (let i = 0; i < q.length - 1; i++)
      queue.push({
        pts: [q[i], q[i + 1]],
        depth: (q[i][2] + q[i + 1][2]) / 2 + 0.4,
        stroke: rgb(color, 1, alpha),
        width,
        fill: null,
      });
  };
  const box = (x, y, z, w, d, t, color = palette.dark) => {
    const a = [x - w / 2, y - d / 2, z],
      b = [x + w / 2, y - d / 2, z],
      c = [x + w / 2, y + d / 2, z],
      e = [x - w / 2, y + d / 2, z],
      top = [a, b, c, e].map((p) => [p[0], p[1], p[2] + t]);
    poly([a, b, top[1], top[0]], color);
    poly([b, c, top[2], top[1]], color);
    poly([c, e, top[3], top[2]], color);
    poly([e, a, top[0], top[3]], color);
    const nx = Math.ceil(w / 65),
      ny = Math.ceil(d / 65);
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < ny; j++) {
        const x0 = x - w / 2 + (i * w) / nx,
          x1 = x0 + w / nx,
          y0 = y - d / 2 + (j * d) / ny,
          y1 = y0 + d / ny;
        poly(
          [
            [x0, y0, z + t],
            [x1, y0, z + t],
            [x1, y1, z + t],
            [x0, y1, z + t],
          ],
          color,
        );
      }
    line(
      [...top, top[0]],
      color.map((v) => Math.min(255, v * 1.65)),
      0.6,
      0.8,
    );
    return z + t;
  };
  const ring = (
    x,
    y,
    z,
    r,
    color = palette.metal,
    width = 1,
    start = 0,
    end = Math.PI * 2,
  ) => {
    const q = Array.from({ length: 65 }, (_, i) => [
      x + Math.cos(mix(start, end, i / 64)) * r,
      y + Math.sin(mix(start, end, i / 64)) * r,
      z,
    ]);
    line(q, color, width);
  };
  const disc = (x, y, z, r, t, color = palette.dark) => {
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2,
        b = ((i + 1) / 64) * Math.PI * 2,
        p = [x + Math.cos(a) * r, y + Math.sin(a) * r, z],
        q = [x + Math.cos(b) * r, y + Math.sin(b) * r, z];
      poly([p, q, [q[0], q[1], z + t], [p[0], p[1], z + t]], color);
      for (let j = 0; j < 4; j++) {
        const r0 = (r * j) / 4,
          r1 = (r * (j + 1)) / 4;
        poly(
          [
            [x + Math.cos(a) * r0, y + Math.sin(a) * r0, z + t],
            [x + Math.cos(a) * r1, y + Math.sin(a) * r1, z + t],
            [x + Math.cos(b) * r1, y + Math.sin(b) * r1, z + t],
            [x + Math.cos(b) * r0, y + Math.sin(b) * r0, z + t],
          ],
          color,
        );
      }
    }
    ring(x, y, z + t + 0.1, r, palette.metal, 0.75);
    return z + t;
  };
  const dot = (p, r = 3, color = palette.warm) => {
    const q = project(p);
    queue.push({
      point: q,
      depth: q[2] + 0.5,
      r: r * Math.sqrt(q[3]),
      fill: rgb(color),
    });
  };
  const label = (
    s,
    p,
    size = 12,
    color = light ? palette.ink : palette.metal,
    align = "left",
  ) => labels.push({ s, p: project(p), size, color, align });
  const plot = (
    fn,
    {
      x = -250,
      y = 0,
      z = 10,
      width = 500,
      height = 70,
      color = palette.sage,
      progress = 1,
      fill = true,
    } = {},
  ) => {
    const count = Math.max(2, Math.floor(64 * clamp(progress))),
      points = [];
    for (let i = 0; i <= count; i++) {
      const u = i / 64;
      points.push([x + u * width, y, z + fn(u) * height]);
    }
    if (fill)
      for (let i = 0; i < points.length - 1; i++)
        poly(
          [
            [points[i][0], y, z],
            [points[i + 1][0], y, z],
            points[i + 1],
            points[i],
          ],
          color,
          0.19,
        );
    line(points, color, 1.8);
    return points;
  };
  const draw = () => {
    queue.sort((a, b) => a.depth - b.depth);
    if (!renderMaterialField(ctx, queue, w, h))
      for (const q of queue) {
        ctx.beginPath();
        if (q.point) {
          ctx.arc(q.point[0], q.point[1], q.r, 0, Math.PI * 2);
          ctx.fillStyle = q.fill;
          ctx.fill();
          continue;
        }
        q.pts.forEach((p, i) =>
          i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]),
        );
        if (q.fill) {
          ctx.closePath();
          const lighting = ctx.createLinearGradient(
            w * 0.18,
            h * 0.1,
            w * 0.85,
            h * 0.9,
          );
          lighting.addColorStop(0, rgb(q.material, q.lit * 1.38, q.alpha));
          lighting.addColorStop(0.48, rgb(q.material, q.lit * 1.06, q.alpha));
          lighting.addColorStop(1, rgb(q.material, q.lit * 0.68, q.alpha));
          ctx.fillStyle = lighting;
          ctx.fill();
          if (q.alpha === 1) {
            ctx.strokeStyle = lighting;
            ctx.lineWidth = 0.45;
            ctx.stroke();
          }
        }
        if (q.stroke) {
          ctx.strokeStyle = q.stroke;
          ctx.lineWidth = q.width;
          ctx.stroke();
        }
      }
    for (const l of labels) {
      ctx.fillStyle = rgb(l.color);
      ctx.font = `400 ${l.size}px Geist, Arial`;
      ctx.textAlign = l.align;
      ctx.fillText(l.s, l.p[0], l.p[1]);
    }
    ctx.textAlign = "left";
  };
  return { poly, line, box, disc, ring, dot, label, plot, draw, project, unit };
}
