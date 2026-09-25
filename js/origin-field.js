import { space, palette as C, mix, ease } from "./space.js";
// The same routes become observations, align, acquire structure and open the tools.
export function drawOriginField(
  ctx,
  { width: w, height: h, p, clock, px, py, reduced },
) {
  const mobile = w < 700,
    enter = ease((p - 0.3) / 0.85),
    align = ease((p - 1.8) / 1.05),
    retain = ease((p - 2.85) / 0.85),
    open = ease((p - 4.8) / 1.1);
  const light = ease((p - 0.75) / 0.6) * (1 - ease((p - 4.4) / 0.85));
  const rgb = (a, b, t) => a.map((v, i) => Math.round(mix(v, b[i], t)));
  ctx.fillStyle = `rgb(${rgb([9, 15, 15], [227, 232, 220], light)})`;
  ctx.fillRect(0, 0, w, h);
  const s = space(ctx, {
    w,
    h,
    cx: mix(mix(0.74, mobile ? 0.5 : 0.58, enter), 0.5, open),
    cy: mix(mix(0.52, mobile ? 0.37 : 0.38, enter), 0.48, open),
    scale: mobile ? 0.86 : mix(0.65, 0.67, enter),
    yaw: (mix(-0.46, -0.12, align) + px * 0.08) * (1 - open),
    tilt: (mix(0.88, 0.53, align) + py * 0.04) * (1 - open),
    light: light > 0.5,
  });
  const material = rgb(C.dark, C.paper, light),
    ink = rgb(C.metal, C.ink, light),
    gold = rgb(C.warm, [159, 97, 44], light);
  const route = (u, i) => {
    const group = Math.floor(i / 4),
      delay = (i % 4) * 0.009;
    const gate =
        ease((u - 0.16 - delay) / 0.055) - ease((u - 0.37 - delay) / 0.055),
      check = ease((u - 0.53 + delay) / 0.05) - ease((u - 0.75 + delay) / 0.05);
    const heroY =
      (i - 7.5) * 17 +
      gate * (group % 2 ? 25 : -25) +
      check * (group % 2 ? -20 : 20);
    const sample =
        Math.sin(u * 11 + group * 0.5) * 29 +
        Math.sin(u * 29 + i * 0.08) * 7 +
        (u > 0.57 && u < 0.69 ? 19 : 0),
      baseY = (group - 1.5) * 100 + ((i % 4) - 1.5) * 13;
    let x = (u - 0.5) * 640 + (1 - align) * enter * Math.sin(i * 2) * 35,
      y = mix(heroY, baseY, enter) * (1 - open * 0.7),
      z = mix(
        Math.sin((u - 0.12) * Math.PI * 1.25) * 85 + gate * 32 + group * 17,
        sample,
        enter,
      );
    z = mix(z, sample * (1 - retain * 0.85) + retain * 22, align);
    // Each retained route becomes one side of a shared aperture. The structure
    // opens rather than disappearing when the real collection enters.
    const side = Math.floor(i / 4),
      offset = ((i % 4) - 1.5) * 5;
    const perimeter = [
      [-220 + u * 440, -135 - offset],
      [220 + offset, -135 + u * 270],
      [220 - u * 440, 135 + offset],
      [-220 - offset, 135 - u * 270],
    ][side];
    return [
      mix(x, perimeter[0], open),
      mix(y, perimeter[1], open),
      mix(z, 0, open),
    ];
  };
  for (let i = 0; i < 16; i++) {
    const points = Array.from({ length: 81 }, (_, j) => route(j / 80, i)),
      active = i === Math.floor((py + 1) * 7.99),
      width = mix(2, 8, retain) * (1 - open * 0.5);
    for (let j = 0; j < 80; j++) {
      const a = points[j],
        b = points[j + 1],
        dx = b[0] - a[0],
        dy = b[1] - a[1],
        length = Math.hypot(dx, dy) || 1,
        offset = [(-dy / length) * width, (dx / length) * width, 0];
      s.poly(
        [a, b, b.map((v, k) => v + offset[k]), a.map((v, k) => v + offset[k])],
        i % 4 === 0 ? C.sage : material,
        0.8,
      );
    }
    s.line(
      points,
      active ? gold : ink,
      active ? 1.65 : 0.7,
      0.5 + retain * 0.4,
    );
    const scan = reduced ? 0.6 : (clock * 0.08 + i * 0.013) % 1,
      j = Math.floor(scan * 74);
    s.line(points.slice(j, j + 7), i % 4 === 0 ? gold : ink, 2.4, 0.8);
    if (enter > 0.1 && open < 0.1)
      for (const u of [0.18, 0.37, 0.62, 0.83]) s.dot(route(u, i), 1.3, ink);
  }
  const inspection = mix(
    -235,
    210,
    reduced ? 0.55 : (Math.sin(clock * 0.18) + 1) / 2,
  );
  if (align > 0.01 && open < 0.99) {
    const opacity = align * (1 - open);
    s.poly(
      [
        [inspection, -190, -12],
        [inspection, 190, -12],
        [inspection, 190, 110],
        [inspection, -190, 110],
      ],
      C.teal,
      0.1 * opacity,
    );
    s.line(
      [
        [inspection, -190, 0],
        [inspection, 190, 0],
      ],
      gold,
      1.5,
      opacity,
    );
    if (retain > 0.001 && open < 0.25)
      for (let j = 0; j < 4; j++) {
        const growth = retain * (1 - ease(open / 0.25)),
          x = -200 + j * 132,
          z = -24 * growth;
        s.box(x, 0, z, 12 * growth, 365 * (1 - open), 7 * growth, material);
        for (let i = 0; i < 4; i++) {
          const y = (i - 1.5) * 100;
          s.line(
            [
              [x, y, z + 7],
              [x, y, 26],
            ],
            gold,
            1,
            growth,
          );
          s.ring(x, y, 26, 7 * growth, gold, 1);
        }
        if (!mobile && open < 0.12)
          s.label(
            ["Evidence", "Reference", "Checks", "Context"][j],
            [x, 205, z],
            11,
            ink,
            "center",
          );
      }
  }
  if (enter > 0.8 && p < 2.8 && !mobile)
    ["Run / 01", "Run / 02", "Run / 03", "Run / 04"].forEach((name, i) =>
      s.label(name, [-337, (i - 1.5) * 100, 0], 11, ink, "right"),
    );
  s.draw();
  // The final opening matches the following homepage's footprint.
  if (open > 0.01) {
    const portalW = w * (mobile ? 0.72 : 0.38),
      portalH = portalW / 1.5,
      x = (w - portalW) / 2,
      y = h * 0.48 - portalH / 2;
    ctx.save();
    ctx.globalAlpha = open;
    ctx.strokeStyle = "#97ac97";
    ctx.lineWidth = 1;
    const corners = [
      [x, y],
      [x + portalW, y],
      [x + portalW, y + portalH],
      [x, y + portalH],
    ];
    ctx.beginPath();
    corners.forEach(([xx, yy], i) => {
      const n = corners[(i + 1) % 4];
      ctx.moveTo(xx, yy);
      ctx.lineTo(mix(xx, n[0], open), mix(yy, n[1], open));
    });
    ctx.stroke();
    const glow = ctx.createLinearGradient(x, y, x + portalW, y + portalH);
    glow.addColorStop(0, "#9cb4a011");
    glow.addColorStop(0.5, "#ac805408");
    glow.addColorStop(1, "#223c3300");
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, portalW, portalH);
    ctx.restore();
  }
}
