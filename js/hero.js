import { createPassage } from "./passage.js";
// Sixteen sections of one computed surface. No textures, shaders or idle render loop.
const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
const field = (x, y) =>
  0.13 +
  0.24 * Math.exp(-((x - 0.25) ** 2 + (y + 0.15) ** 2) * 3) +
  0.08 * Math.sin(y * 3 + x * 2) * (1 - x * x - y * y);
export function createHero(canvas, apps) {
  const passage = createPassage(canvas, apps);
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx)
    return {
      resize() {},
      render() {
        return false;
      },
    };
  let width = 1,
    height = 1,
    dpr = 1,
    lastKey = "";
  const strips = Array.from({ length: 16 }, (_, i) => {
    const x = -0.94 + (i * 1.88) / 15,
      half = 0.049;
    const edge = (dx, reverse = false) =>
      Array.from({ length: 37 }, (_, k) => {
        const end = Math.sqrt(1 - (x + dx) ** 2),
          y = (-1 + (reverse ? 36 - k : k) / 18) * end;
        return [x + dx, y, field(x + dx, y)];
      });
    const cap = (sign) =>
      Array.from({ length: 9 }, (_, k) => {
        const X = x + (sign === 1 ? -half : half) + ((sign * k) / 8) * half * 2,
          Y = sign * Math.sqrt(1 - X * X);
        return [X, Y, field(X, Y)];
      });
    return {
      index: i,
      x,
      points: [...edge(-half), ...cap(1), ...edge(half, true), ...cap(-1)],
    };
  });
  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    dpr = Math.min(devicePixelRatio, innerWidth < 700 ? 1.5 : 1.7);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    lastKey = "";
    passage.resize();
  }
  resize();
  canvas.classList.add("ready");
  return {
    resize,
    render(time, p, px, py, reduced, dt, state) {
      const progress = reduced ? 0 : p,
        opening = Math.max(state.spread, ease((progress - 0.08) / 0.4)),
        exit = ease((progress - 0.47) / 0.41);
      canvas.inert = !reduced && progress > 0.72;
      passage.update(progress, opening, reduced, px, py);
      const yaw =
          (-0.55 + state.yaw * 0.35 + (reduced ? 0 : px * 0.07)) *
          (1 - opening * 0.72),
        pitch = 0.78 + state.pitch * 0.3 + (reduced ? 0 : py * 0.035);
      const key = [progress, opening, yaw, pitch, width, height]
        .map((n) => n.toFixed(4))
        .join("|");
      if (key === lastKey) return false;
      lastKey = key;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (exit >= 0.999) return false;
      const mobile = width < 650,
        scale =
          Math.min(width * (mobile ? 0.32 : 0.39), height * 0.52) *
          (1 + exit * 1.8),
        cx = width * (mobile ? 0.5 : 0.65 - opening * 0.15),
        cy = height * (mobile ? 0.57 : 0.61 - opening * 0.1);
      const sy = Math.sin(yaw),
        co = Math.cos(yaw),
        sp = Math.sin(pitch),
        cp = Math.cos(pitch);
      const project = (v, i, down = 0) => {
        const side = i < 8 ? -1 : 1;
        const x =
            v[0] +
            (i - 7.5) * opening * 0.02 +
            side * (opening * 0.8 + exit * 1.75),
          y = v[1],
          z = v[2] - down + opening * Math.sin((i / 15) * Math.PI) * 0.19;
        const X = x * co - y * sy,
          Y = x * sy + y * co,
          Z = z * cp - Y * sp;
        return [
          cx + X * scale,
          cy + (Y * cp + z * -sp) * scale - exit * height * 0.05,
          Z,
        ];
      };
      const draw = (points) => {
        ctx.beginPath();
        points.forEach((v, i) =>
          i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]),
        );
        ctx.closePath();
      };
      ctx.globalAlpha = (1 - exit) ** 2;
      // Soft ambient contact is a single gradient, not a full-canvas blur pass.
      const shadow = ctx.createRadialGradient(
        cx,
        cy + scale * 0.36,
        scale * 0.02,
        cx,
        cy + scale * 0.36,
        scale * 0.9,
      );
      shadow.addColorStop(0, "#00000080");
      shadow.addColorStop(1, "#00000000");
      ctx.fillStyle = shadow;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      const ordered = strips
        .map((s) => ({ ...s, depth: project([s.x, 0, 0.1], s.index)[2] }))
        .sort((a, b) => a.depth - b.depth);
      for (const s of ordered) {
        const top = s.points.map((v) => project(v, s.index)),
          bottom = s.points.map((v) => project(v, s.index, 0.036));
        draw(bottom);
        ctx.fillStyle = "#080c0c";
        ctx.fill();
        ctx.strokeStyle = "#475552";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        const light = ctx.createLinearGradient(
          cx - scale,
          cy - scale * 0.3,
          cx + scale,
          cy + scale * 0.35,
        );
        light.addColorStop(0, "#2a3534");
        light.addColorStop(0.32, "#8a9690");
        light.addColorStop(0.49, "#d3d6c4");
        light.addColorStop(0.58, "#728782");
        light.addColorStop(0.8, "#243935");
        light.addColorStop(1, "#0a1615");
        draw(top);
        ctx.fillStyle = light;
        ctx.fill();
        ctx.strokeStyle = "rgba(200,213,202,.40)";
        ctx.lineWidth = 0.65;
        ctx.stroke();
        // Fine section contours stay attached to their surface as the lamellae separate.
        for (let j = 1; j < 4; j++) {
          const x = s.x - 0.05 + j * 0.025,
            end = Math.sqrt(Math.max(0, 1 - (Math.abs(s.x) + 0.049) ** 2));
          ctx.beginPath();
          for (let k = 0; k <= 36; k++) {
            const y = (-1 + k / 18) * end,
              q = project([x, y, field(x, y) + 0.001], s.index);
            k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
          }
          ctx.strokeStyle =
            j === 2 ? "rgba(235,221,179,.34)" : "rgba(15,36,30,.27)";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      return false;
    },
  };
}
