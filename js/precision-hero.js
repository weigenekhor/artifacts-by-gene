// Projected silicon geometry. No textures, WebGL context, or independent render loop.
// The etched surface separates into process layers before opening into raw evidence.
const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (v) => {
  v = clamp(v);
  return v * v * v * (v * (v * 6 - 15) + 10);
};
export function createPrecisionHero(stage) {
  const canvas = stage.querySelector("canvas"),
    ctx = canvas.getContext("2d");
  const control = stage.closest("section").querySelector("[data-expand]");
  let width = 1,
    height = 1,
    dpr = 1,
    clock = 0,
    opening = 0,
    last = "";
  const edge = Array.from({ length: 145 }, (_, i) => {
    const a = (i / 144) * Math.PI * 2;
    return [Math.cos(a), Math.sin(a)];
  });
  const grid = [];
  for (let n = -0.9; n <= 0.91; n += 0.075) {
    const e = Math.sqrt(1 - n * n);
    grid.push(
      [
        [n, -e],
        [n, e],
      ],
      [
        [-e, n],
        [e, n],
      ],
    );
  }
  const dies = [];
  for (let row = -7; row <= 7; row++)
    for (let col = -7; col <= 7; col++) {
      const x = col * 0.122,
        y = row * 0.122,
        half = 0.054;
      if (Math.hypot(Math.abs(x) + half, Math.abs(y) + half) < 0.975)
        dies.push({ x, y, half, row, col });
    }
  if (ctx) stage.classList.add("ready");
  return {
    resize() {
      width = stage.clientWidth;
      height = stage.clientHeight;
      dpr = Math.min(devicePixelRatio || 1, width < 700 ? 1.5 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      last = "";
    },
    render(time, p, px, py, reduced, dt, state) {
      if (!ctx) return false;
      if (!reduced) clock += Math.min(dt, 40) / 1000;
      const target = reduced
        ? 0
        : Math.max(state.spread, smooth((p - 0.05) / 0.8));
      opening += (target - opening) * (reduced ? 1 : 1 - Math.exp(-dt / 230));
      const passage = reduced ? 0 : smooth((p - 0.48) / 0.5);
      const mobile = width < 700,
        scale =
          Math.min(width * (mobile ? 0.47 : 0.36), height * 0.44) *
          (1 - passage * 0.12);
      const yaw =
        -0.36 +
        (reduced
          ? 0
          : px * 0.16 + state.yaw * 0.3 + Math.sin(clock * 0.12) * 0.025);
      const tilt =
        0.98 + (reduced ? 0 : py * 0.13 + state.pitch * 0.23) + passage * 0.2;
      const key = [opening, yaw, tilt, p, width, height, clock].join("|");
      if (key === last) return !reduced;
      last = key;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const paper = [233, 233, 225],
        dark = [10, 16, 16];
      stage.parentElement.style.backgroundColor = `rgb(${dark.map((v, i) => Math.round(v + (paper[i] - v) * passage)).join(",")})`;
      const cx = width * (mobile ? 0.5 : 0.56),
        cy = height * (mobile ? 0.54 : 0.59);
      const project = (x, y, z = 0) => {
        const X = x * Math.cos(yaw) - y * Math.sin(yaw),
          Y = x * Math.sin(yaw) + y * Math.cos(yaw);
        const depth = Y * Math.sin(tilt) + z * Math.cos(tilt),
          persp = 3.6 / (3.6 - depth * 0.35);
        return [
          cx + X * scale * persp,
          cy + (Y * Math.cos(tilt) - z * Math.sin(tilt)) * scale * persp,
        ];
      };
      const path = (pts, z, close = false) => {
        ctx.beginPath();
        pts.forEach(([x, y], i) => {
          const q = project(x, y, z);
          i ? ctx.lineTo(...q) : ctx.moveTo(...q);
        });
        if (close) ctx.closePath();
      };
      // Four visible substrate strata, each retaining its material and common datum.
      const light = ctx.createRadialGradient(
        cx + scale * 0.25,
        cy - scale * 0.2,
        scale * 0.03,
        cx,
        cy,
        scale * 1.3,
      );
      light.addColorStop(0, "#84958d");
      light.addColorStop(0.23, "#4c6058");
      light.addColorStop(0.55, "#263831");
      light.addColorStop(0.82, "#172320");
      light.addColorStop(1, "#0b1413");
      for (let layer = 0; layer < 4; layer++) {
        const z = (layer - 1.5) * (0.022 + opening * 0.27);
        path(edge, z, true);
        ctx.fillStyle =
          layer === 3 ? light : ["#0b1111", "#14201d", "#26312a"][layer];
        ctx.globalAlpha = 1 - passage;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.lineWidth = layer === 3 ? 1.2 : 0.8;
        ctx.strokeStyle =
          passage > 0.5
            ? "#60786366"
            : layer === 3
              ? "#a7b3a588"
              : `rgba(170,184,161,${0.25 + opening * 0.22})`;
        ctx.stroke();
        // A second edge supplies physical thickness without a plastic bevel.
        if (layer === 3 || opening > 0.05) {
          path(edge, z - 0.011);
          ctx.strokeStyle = "#64756655";
          ctx.stroke();
        }
        if (layer === 3) {
          ctx.save();
          path(edge, z, true);
          ctx.clip();
          ctx.strokeStyle = passage > 0.5 ? "#54796044" : "#a6b6a233";
          ctx.lineWidth = 0.6;
          for (const line of grid) {
            path(line, z + 0.003);
            ctx.stroke();
          }
          // Individual diced fields have thickness and proximity-driven lift.
          // Their registration is deterministic: a material system, not particles.
          const pointer = [((px + 1) * width) / 2, ((py + 1) * height) / 2];
          const orderedDies = dies
            .map((d) => ({ ...d, q: project(d.x, d.y, z) }))
            .sort((a, b) => a.q[1] - b.q[1]);
          for (const die of orderedDies) {
            const { x, y, half: r, q } = die;
            const proximity = reduced
              ? 0
              : Math.exp(
                  -((q[0] - pointer[0]) ** 2 + (q[1] - pointer[1]) ** 2) /
                    (scale * 0.2) ** 2,
                );
            const height =
              0.008 + proximity * 0.12 + opening * 0.025 * ((die.row + 8) % 4);
            const top = z + height,
              shift = opening * 0.025;
            const X = x * (1 + shift),
              Y = y * (1 + shift);
            const corners = [
              [X - r, Y - r],
              [X + r, Y - r],
              [X + r, Y + r],
              [X - r, Y + r],
            ];
            const quad = (vertices) => {
              ctx.beginPath();
              vertices.forEach(([x, y, zz], i) => {
                const a = project(x, y, zz);
                i ? ctx.lineTo(...a) : ctx.moveTo(...a);
              });
              ctx.closePath();
            };
            quad([
              [X - r, Y + r, z],
              [X + r, Y + r, z],
              [X + r, Y + r, top],
              [X - r, Y + r, top],
            ]);
            ctx.fillStyle = "#14231e";
            ctx.globalAlpha = 1 - passage;
            ctx.fill();
            quad([
              [X + r, Y - r, z],
              [X + r, Y + r, z],
              [X + r, Y + r, top],
              [X + r, Y - r, top],
            ]);
            ctx.fillStyle = "#3b5044";
            ctx.fill();
            path(corners, top, true);
            const reflection = Math.max(
              0,
              1 - Math.abs(x - y * 0.28 - 0.22 - px * 0.12) * 1.05,
            );
            const value = Math.round(29 + reflection * 42 + proximity * 28);
            ctx.fillStyle =
              "rgb(" + value + "," + (value + 13) + "," + (value + 7) + ")";
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle =
              passage > 0.5
                ? "#59786255"
                : "rgba(178,195,170," + (0.12 + proximity * 0.42) + ")";
            ctx.lineWidth = 0.55;
            ctx.stroke();
            if (proximity > 0.12 || opening > 0.25) {
              path(
                [
                  [X - r * 0.6, Y - r * 0.6],
                  [X + r * 0.6, Y - r * 0.6],
                  [X + r * 0.6, Y + r * 0.6],
                  [X - r * 0.6, Y + r * 0.6],
                ],
                top + 0.002,
                true,
              );
              ctx.strokeStyle =
                "rgba(215,188,144," + (0.12 + proximity * 0.55) + ")";
              ctx.lineWidth = 0.65;
              ctx.stroke();
            }
          }
          // Directional inspection band follows the viewer, rather than a random loop.
          const band =
            0.25 + (reduced ? 0 : px * 0.3 + Math.sin(clock * 0.18) * 0.1);
          for (let j = -3; j <= 3; j++) {
            const x = band + j * 0.024,
              e = Math.sqrt(Math.max(0, 1 - x * x));
            path(
              [
                [x, -e],
                [x, e],
              ],
              z + 0.006,
            );
            ctx.strokeStyle = `rgba(215,221,191,${0.12 - Math.abs(j) * 0.027})`;
            ctx.lineWidth = scale * 0.018;
            ctx.stroke();
          }
          ctx.restore();
        } else if (opening > 0.1) {
          ctx.globalAlpha = opening * 0.5;
          ctx.strokeStyle = layer === 1 ? "#b79a71" : "#8ca294";
          ctx.lineWidth = 0.7;
          for (let j = -5; j <= 5; j++) {
            const yy = j * 0.135,
              e = Math.sqrt(1 - yy * yy);
            const pts = Array.from({ length: 45 }, (_, i) => {
              const x = -e + (2 * e * i) / 44;
              return [x, yy + Math.sin(x * 5 + layer) * 0.025];
            });
            path(pts, z + 0.005);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
      }
      // A physical registration flat; the object has no CD-like central aperture.
      const z = 1.5 * (0.022 + opening * 0.27);
      path(
        [
          [-0.18, 0.975],
          [0.18, 0.975],
        ],
        z + 0.01,
      );
      ctx.strokeStyle = "#d0bb98";
      ctx.lineWidth = 2;
      ctx.stroke();
      stage.style.setProperty("--layer-open", opening.toFixed(4));
      stage.style.setProperty("--unfold", state.spread);
      if (control) {
        const expanded = state.spread > 0.5;
        if (control.dataset.expanded !== String(expanded)) {
          control.dataset.expanded = String(expanded);
          control.innerHTML = expanded
            ? 'Close the layers <span aria-hidden="true">−</span>'
            : 'Separate the layers <span aria-hidden="true">+</span>';
        }
      }
      return !reduced || Math.abs(opening - target) > 0.001;
    },
  };
}
