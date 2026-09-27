import { renderMaterialField } from "../material-renderer.js";
import { at, mix, clamp } from "./drawing.js";

// Film coordinates are physical scene coordinates. Camera movement, material faces
// and annotations share this projection; no CSS tilt is used to simulate depth.
export const TAU = Math.PI * 2;
export const C = {
  silver: [161, 174, 185],
  graphite: [39, 47, 56],
  pale: [216, 220, 220],
  copper: [207, 151, 107],
  blue: [111, 151, 166],
  dim: [82, 98, 113],
};
export function camera(q, keys) {
  let i = Math.max(
    0,
    keys.findLastIndex((k) => q >= k[0]),
  );
  const a = keys[i],
    b = keys[Math.min(i + 1, keys.length - 1)];
  const t = a === b ? 1 : at(q, a[0], b[0] - a[0]);
  const values = a.slice(1).map((v, j) => mix(v, b[j + 1], t));
  return {
    yaw: values[0],
    pitch: values[1],
    zoom: values[2],
    x: values[3] || 0,
    y: values[4] || 0,
    z: values[5] || 0,
  };
}
export function studio(d, W, H, state = {}) {
  const {
    yaw = -0.15,
    pitch = -0.22,
    zoom = 1,
    x = 0,
    y = 0,
    z: cameraZ = 0,
  } = state;
  const unit = Math.min(W / 900, H / 530) * zoom;
  const queue = [],
    labels = [];
  const project = (p) => {
    if (state.map) p = state.map(p);
    const X = p[0] - x,
      Y = p[1] - y,
      Z = (p[2] || 0) - cameraZ;
    const u = X * Math.cos(yaw) + Z * Math.sin(yaw);
    const z0 = Z * Math.cos(yaw) - X * Math.sin(yaw);
    const v = Y * Math.cos(pitch) - z0 * Math.sin(pitch);
    const z = z0 * Math.cos(pitch) + Y * Math.sin(pitch);
    const k = 1300 / Math.max(350, 1300 - z);
    return [W / 2 + u * unit * k, H * 0.51 + v * unit * k, z, k];
  };
  const rgb = (c, a = 1) => `rgba(${c.join(",")},${a})`;
  const face = (
    points,
    color = C.silver,
    opacity = 1,
    vertexNormals = null,
    vertexColors = null,
  ) => {
    if (opacity < 0.002) return;
    const p = points.map(project),
      u = points[1].map((v, i) => v - points[0][i]);
    const v = points[2].map((v, i) => v - points[0][i]);
    const n = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
    const l = Math.hypot(...n) || 1;
    const nx = (n[0] * Math.cos(yaw) + n[2] * Math.sin(yaw)) / l;
    const nz = (n[2] * Math.cos(yaw) - n[0] * Math.sin(yaw)) / l;
    const ny = n[1] / l;
    const rotateNormal = (n) => {
      const l = Math.hypot(...n) || 1;
      const nx = (n[0] * Math.cos(yaw) + n[2] * Math.sin(yaw)) / l,
        nz = (n[2] * Math.cos(yaw) - n[0] * Math.sin(yaw)) / l,
        ny = n[1] / l;
      return [
        nx,
        ny * Math.cos(pitch) - nz * Math.sin(pitch),
        nz * Math.cos(pitch) + ny * Math.sin(pitch),
      ];
    };
    queue.push({
      pts: p,
      depth: p.reduce((s, v) => s + v[2], 0) / p.length,
      material: color,
      vertexNormals: vertexNormals?.map(rotateNormal),
      vertexColors,
      normal: [
        nx,
        ny * Math.cos(pitch) - nz * Math.sin(pitch),
        nz * Math.cos(pitch) + ny * Math.sin(pitch),
      ],
      alpha: opacity,
      fill: rgb(color, opacity),
      width: 0,
      lit: 1,
    });
  };
  const line = (points, color = C.silver, width = 1, opacity = 1) => {
    if (opacity < 0.002) return;
    const p = points.map(project);
    for (let i = 1; i < p.length; i++)
      queue.push({
        pts: [p[i - 1], p[i]],
        depth: (p[i - 1][2] + p[i][2]) * 0.5 + 0.2,
        stroke: rgb(color, opacity),
        width,
        fill: null,
      });
  };
  const dot = (
    p,
    radius = 3,
    color = C.copper,
    hollow = false,
    opacity = 1,
  ) => {
    if (opacity < 0.002) return;
    if (hollow) return ring(p, radius, color, 1.4, 0, TAU, opacity);
    const v = project(p);
    queue.push({
      point: v,
      depth: v[2] + 0.4,
      r: radius * Math.sqrt(v[3]),
      fill: rgb(color, opacity),
    });
  };
  const ring = (
    p,
    r,
    color = C.silver,
    width = 1,
    start = 0,
    end = TAU,
    opacity = 1,
  ) => {
    if (opacity < 0.002) return;
    line(
      Array.from({ length: 97 }, (_, i) => [
        p[0] + Math.cos(mix(start, end, i / 96)) * r,
        p[1] + Math.sin(mix(start, end, i / 96)) * r,
        p[2],
      ]),
      color,
      width,
      opacity,
    );
  };
  const arc = (p, r, thickness, start, end, color = C.silver, opacity = 1) => {
    const n = Math.max(2, Math.ceil(Math.abs(end - start) * 18));
    for (let i = 0; i < n; i++) {
      const a = mix(start, end, i / n),
        b = mix(start, end, (i + 1) / n);
      face(
        [
          [
            p[0] + Math.cos(a) * (r - thickness),
            p[1] + Math.sin(a) * (r - thickness),
            p[2],
          ],
          [p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r, p[2]],
          [p[0] + Math.cos(b) * r, p[1] + Math.sin(b) * r, p[2]],
          [
            p[0] + Math.cos(b) * (r - thickness),
            p[1] + Math.sin(b) * (r - thickness),
            p[2],
          ],
        ],
        color,
        opacity,
      );
    }
  };
  const text = (s, p, size = 18, color = d.ink, align = "left", alpha = 1) =>
    labels.push({ s, p: project(p), size, color, align, alpha });
  const softShadow = (p, radius, opacity) => {
    const pts = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ].map(([u, v]) => project([p[0] + u * radius, p[1] + v * radius, p[2]]));
    queue.push({
      pts,
      depth: pts.reduce((s, v) => s + v[2], 0) / 4,
      material: [0, 0, 0],
      alpha: opacity,
      fill: rgb([0, 0, 0], opacity),
      softShadow: true,
      normal: [0, 0, 1],
    });
  };
  const target = (hit, value, p, r, label) => {
    const a = project(p);
    hit?.(value, a[0] - r, a[1] - r, r * 2, r * 2, label);
  };
  function draw() {
    queue.sort((a, b) => a.depth - b.depth);
    if (!renderMaterialField(d.c, queue, W, H))
      for (const f of queue) {
        const ctx = d.c;
        ctx.beginPath();
        if (f.point) {
          ctx.arc(f.point[0], f.point[1], f.r, 0, TAU);
          ctx.fillStyle = f.fill;
          ctx.fill();
          continue;
        }
        f.pts.forEach((p, i) =>
          i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]),
        );
        if (f.fill) {
          ctx.closePath();
          if (f.softShadow) {
            const x = f.pts.reduce((s, p) => s + p[0], 0) / 4,
              y = f.pts.reduce((s, p) => s + p[1], 0) / 4;
            const radius = Math.max(
              ...f.pts.map((p) => Math.hypot(p[0] - x, p[1] - y)),
            );
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, f.fill);
            gradient.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = gradient;
          } else ctx.fillStyle = f.fill;
          ctx.fill();
        }
        if (f.stroke) {
          ctx.strokeStyle = f.stroke;
          ctx.lineWidth = f.width;
          ctx.stroke();
        }
      }
    for (const t of labels) {
      // An annotation may approach the lens, but its lettering must stay whole.
      // Geometry may crop cinematically; words use a safe screen-space margin.
      d.c.font = `400 ${Math.max(t.size, W < 700 ? 21 : 16)}px Geist,Arial`;
      const width = d.c.measureText(t.s).width;
      const offset =
        t.align === "center" ? width / 2 : t.align === "right" ? width : 0;
      if (
        state.cropLabels &&
        (t.p[0] - offset < 16 ||
          t.p[0] - offset + width > W - 16 ||
          t.p[1] < 96 ||
          t.p[1] > H - 30)
      )
        continue;
      const x = Math.max(
        12 + offset,
        Math.min(W - 12 - width + offset, t.p[0]),
      );
      const y = Math.max(26, Math.min(H - 12, t.p[1]));
      d.alpha(t.alpha, () => d.text(t.s, x, y, t.size, t.color, t.align));
    }
  }
  return {
    project,
    face,
    line,
    dot,
    ring,
    arc,
    softShadow,
    text,
    target,
    draw,
    unit,
  };
}
export function points(n, fn) {
  return Array.from({ length: n + 1 }, (_, i) => fn(i / n, i));
}
export function index(f, n) {
  return Math.min(n - 1, Math.floor(clamp(f) * n));
}
