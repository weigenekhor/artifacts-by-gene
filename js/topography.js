import { renderMaterialField } from "./material-renderer.js";
import { contourSegments } from "./contours.js";
const clamp = (v) => Math.max(0, Math.min(1, v)),
  mix = (a, b, t) => a + (b - a) * t;
const smooth = (v) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
// Same illustrative field in mesh, equal-height contours, samples and section.
const field = (x, y) =>
  0.72 * Math.exp(-((x - 0.75) ** 2 + (y + 0.2) ** 2) * 0.7) -
  0.4 * Math.exp(-((x + 1.1) ** 2 + (y - 0.65) ** 2) * 1.3) +
  0.16 * Math.sin(x * 1.4 + y);
export function createTopography(el, wake) {
  const canvas = el.querySelector(".topography canvas");
  if (!canvas) return () => {};
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const contours = contourSegments(field),
    triangles = [],
    dots = [];
  const angular = 112,
    radial = 30;
  const polar = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
  for (let ring = 0; ring < radial; ring++)
    for (let sector = 0; sector < angular; sector++) {
      const r0 = (ring / radial) * 2.74,
        r1 = ((ring + 1) / radial) * 2.74,
        a0 = (sector / angular) * Math.PI * 2,
        a1 = ((sector + 1) / angular) * Math.PI * 2;
      const corners = [
        polar(r0, a0),
        polar(r1, a0),
        polar(r1, a1),
        polar(r0, a1),
      ];
      for (const ids of ring === 0
        ? [[0, 1, 2]]
        : [
            [0, 1, 2],
            [0, 2, 3],
          ]) {
        const vertices = ids.map((i) => corners[i]),
          mx = vertices.reduce((s, v) => s + v[0], 0) / 3,
          my = vertices.reduce((s, v) => s + v[1], 0) / 3,
          v = field(mx, my),
          dx = (field(mx + 0.03, my) - v) / 0.03,
          dy = (field(mx, my + 0.03) - v) / 0.03;
        const vertexColors = vertices.map(([x, y]) => {
          const v = field(x, y),
            dx = (field(x + 0.015, y) - v) / 0.015,
            dy = (field(x, y + 0.015) - v) / 0.015;
          return { v, light: clamp(0.72 - dx * 0.27 - dy * 0.2) };
        });
        triangles.push({
          vertices: vertices.map((v) => [...v, field(...v)]),
          x: mx,
          y: my,
          v,
          shade: clamp(0.68 - dx * 0.32 - dy * 0.24),
          vertexColors,
        });
      }
    }
  for (let x = -2.1; x < 2.2; x += 0.6)
    for (let y = -2.1; y < 2.2; y += 0.6)
      if (Math.hypot(x, y) < 2.55) dots.push([x, y, field(x, y)]);
  let w = 1,
    h = 1,
    dpr = 1,
    last = "";
  const observer = new ResizeObserver(() => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    last = "";
    wake();
  });
  observer.observe(canvas);
  const color = (value, light) => {
    const stops = [
        [39, 80, 88],
        [74, 119, 108],
        [158, 166, 109],
        [207, 168, 93],
        [173, 91, 53],
      ],
      t = clamp((value + 0.4) / 1.22) * 4,
      i = Math.min(3, Math.floor(t));
    return (
      "rgb(" +
      stops[i]
        .map((v, k) =>
          Math.round(mix(v, stops[i + 1][k], t - i) * (0.72 + light * 0.43)),
        )
        .join(",") +
      ")"
    );
  };
  return (p, inspection, reduced, px, py) => {
    const growth = smooth((p - 0.08) / 0.54),
      top = smooth((p - 0.48) / 0.3),
      key = [
        p.toFixed(3),
        inspection.toFixed(3),
        px.toFixed(2),
        py.toFixed(2),
        reduced,
        w,
        h,
      ].join("|");
    if (key === last) return;
    last = key;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const scale = Math.min(w / 7.3, h / 5.4),
      cx = w * 0.5,
      cy = h * 0.4,
      yaw = -0.3 + (reduced ? 0 : px * 0.07),
      tilt = mix(0.75, 0.92, top) + (reduced ? 0 : py * 0.03),
      lift = 0.96 * growth;
    const project = ([x, y, z]) => {
      const xx = x * Math.cos(yaw) - y * Math.sin(yaw),
        yy = x * Math.sin(yaw) + y * Math.cos(yaw),
        Y = yy * Math.cos(tilt) - z * lift * Math.sin(tilt),
        Z = yy * Math.sin(tilt) + z * lift * Math.cos(tilt),
        k = 12 / (12 - Z);
      return [cx + xx * scale * k, cy + Y * scale * k, Z];
    };
    const line = (pts, color, width = 1) => {
      ctx.beginPath();
      pts.forEach((v, i) =>
        i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]),
      );
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    };
    const ring = (z) =>
      Array.from({ length: 129 }, (_, i) => {
        const a = (i / 128) * Math.PI * 2;
        return project([Math.cos(a) * 2.75, Math.sin(a) * 2.75, z]);
      });
    ctx.save();
    ctx.translate(cx, cy + scale * 0.55);
    ctx.scale(1, 0.55);
    const shadow = ctx.createRadialGradient(
      0,
      0,
      scale * 0.9,
      0,
      0,
      scale * 3.2,
    );
    shadow.addColorStop(0, "#263e322e");
    shadow.addColorStop(1, "#263e3200");
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(0, 0, scale * 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const lower = ring(-0.3);
    ctx.beginPath();
    lower.forEach((v, i) =>
      i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]),
    );
    ctx.closePath();
    ctx.fillStyle = "#25483e";
    ctx.fill();
    for (let i = 0; i < 128; i++) {
      const a = (i / 128) * Math.PI * 2,
        b = ((i + 1) / 128) * Math.PI * 2,
        x = Math.cos(a) * 2.74,
        y = Math.sin(a) * 2.74,
        xx = Math.cos(b) * 2.74,
        yy = Math.sin(b) * 2.74;
      const pts = [
        project([x, y, field(x, y)]),
        project([xx, yy, field(xx, yy)]),
        project([xx, yy, -0.3]),
        project([x, y, -0.3]),
      ];
      ctx.beginPath();
      pts.forEach((v, j) =>
        j ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]),
      );
      ctx.closePath();
      const edgeLight = 0.75 + Math.sin(a + 0.6) * 0.22;
      ctx.fillStyle = `rgb(${[54, 91, 80].map((v) => Math.round(v * edgeLight)).join(",")})`;
      ctx.fill();
    }
    const faces = triangles
      .map((t) => ({
        ...t,
        pts: t.vertices.map(project),
        depth: project([t.x, t.y, t.v])[2],
      }))
      .sort((a, b) => a.depth - b.depth);
    ctx.globalAlpha = 0.18 + growth * 0.82;
    const mesh = faces.map((t) => ({
      pts: t.pts.map((q) => [q[0], q[1], q[2] * 80]),
      depth: t.depth * 80,
      normal: [0, 0, 1],
      material: [125, 157, 138],
      alpha: 1,
      fill: true,
      unlit: true,
      vertexColors: t.vertexColors.map((v) =>
        color(v.v, v.light).match(/\d+/g).map(Number),
      ),
    }));
    if (!renderMaterialField(ctx, mesh, w, h))
      for (const t of faces) {
        ctx.beginPath();
        t.pts.forEach((v, i) =>
          i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]),
        );
        ctx.closePath();
        // Interpolate each face across its height range instead of flat triangle ink.
        const indices = [0, 1, 2].sort(
            (a, b) => t.vertexColors[a].v - t.vertexColors[b].v,
          ),
          a = indices[0],
          b = indices[2];
        const gradient = ctx.createLinearGradient(
          t.pts[a][0],
          t.pts[a][1],
          t.pts[b][0],
          t.pts[b][1],
        );
        gradient.addColorStop(
          0,
          color(t.vertexColors[a].v, t.vertexColors[a].light),
        );
        gradient.addColorStop(
          1,
          color(t.vertexColors[b].v, t.vertexColors[b].light),
        );
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    ctx.globalAlpha = growth * 0.65;
    ctx.beginPath();
    for (let i = 0; i < contours.length; i += 6) {
      const a = project([
          contours[i],
          contours[i + 1],
          contours[i + 2] + 0.006,
        ]),
        b = project([
          contours[i + 3],
          contours[i + 4],
          contours[i + 5] + 0.006,
        ]);
      ctx.moveTo(...a.slice(0, 2));
      ctx.lineTo(...b.slice(0, 2));
    }
    ctx.strokeStyle = "#e8e8c8";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    const rim = Array.from({ length: 145 }, (_, i) => {
      const a = (i / 144) * Math.PI * 2,
        x = Math.cos(a) * 2.74,
        y = Math.sin(a) * 2.74;
      return project([x, y, field(x, y) + 0.008]);
    });
    line(rim, "#e3e8c78c", 1.05);
    line(ring(-0.29), "#3e6153a0", 1.2);
    ctx.globalAlpha = 1;
    for (const [i, d] of dots.entries()) {
      const q = project(d),
        base = project([d[0], d[1], -0.15]),
        draw = smooth((p - i * 0.002) / 0.25);
      line([base, [q[0], mix(base[1], q[1], draw)]], "#536f6060", 0.7);
      ctx.beginPath();
      ctx.arc(q[0], q[1], 1.8 + 1.8 * (1 - growth), 0, Math.PI * 2);
      ctx.fillStyle = growth > 0.8 ? "#f3e8bd" : "#476256";
      ctx.fill();
    }
    // The section follows the same function and selected wafer position.
    const selectedY = mix(-2.05, 2.05, inspection),
      extent = Math.sqrt(2.74 ** 2 - selectedY ** 2),
      section = [];
    for (let i = 0; i < 90; i++) {
      const x = mix(-extent, extent, i / 89);
      section.push([x, selectedY, field(x, selectedY)]);
    }
    ctx.globalAlpha = smooth((p - 0.45) / 0.2);
    line(section.map(project), "#fff4cf", 2);
    const ends = [project(section[0]), project(section.at(-1))];
    ctx.font = "11px Geist, Arial";
    ctx.fillStyle = "#314b3e";
    ends.forEach((v, i) =>
      ctx.fillText(i ? "A′" : "A", v[0] + (i ? 9 : -18), v[1]),
    );
    const baseY = h * 0.86,
      profile = section.map((v, i) => [
        w * 0.38 + (i / 89) * w * 0.45,
        baseY - v[2] * scale * 0.6,
      ]);
    line(
      [
        [w * 0.38, baseY],
        [w * 0.82, baseY],
      ],
      "#8a9d8360",
      1,
    );
    line(profile, "#aa763f", 1.8);
    ctx.fillStyle = "#556d55";
    ctx.font = `${w < 400 ? 9 : 11}px Geist, Arial`;
    ctx.fillText("A — A′ / selected section", w * 0.38, h * 0.96);
    ctx.globalAlpha = 1;
  };
}
