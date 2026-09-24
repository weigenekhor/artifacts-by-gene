// One camera and one persistent set of paths, from identity to construction.
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const mix = (a, b, t) => a + (b - a) * t;
const ease = (v) => {
  v = clamp(v);
  return v * v * v * (v * (v * 6 - 15) + 10);
};
const rgb = (a, b, t) => a.map((v, i) => Math.round(mix(v, b[i], t)));
const stages = [
  "An unresolved task",
  "A route worth testing",
  "A repeatable sequence",
  "Revision builds on revision",
  "Methods in working form",
];

export function createGenesis(section, wake) {
  const field = section.querySelector(".logic-field"),
    canvas = field.querySelector("canvas"),
    ctx = canvas.getContext("2d");
  const pages = [...section.querySelectorAll(".construction-page")],
    controls = [...section.querySelectorAll("[data-origin-step]")];
  const legend = section.querySelector(".build-state");
  const intro = section.querySelector(".genesis-intro"),
    nav = section.querySelector(".construction-nav"),
    next = section.querySelector(".construction-next");
  if (ctx) field.classList.add("ready");
  let width = 1,
    height = 1,
    distance = 1,
    top = 0,
    dpr = 1,
    progress = 0,
    clock = 0,
    active = -2,
    lastDraw = "",
    keyX = 0,
    keyY = 0,
    yaw = 0,
    pitch = 0,
    previousReduced = null,
    constructionTime = 0;
  const samples = 100;
  function point(u, i, stage) {
    const row = i - 7.5,
      x = (u - 0.5) * 2.7;
    const raw =
      Math.sin(u * 13 + 0.4) * 0.24 +
      Math.sin(u * 31) * 0.075 +
      (u > 0.55 && u < 0.65 ? -0.14 : 0);
    const step =
      u < 0.18
        ? 0.2
        : u < 0.37
          ? 0.2 - ease((u - 0.18) / 0.08) * 0.34
          : u < 0.62
            ? -0.14 + ease((u - 0.37) / 0.08) * 0.3
            : 0.16 - ease((u - 0.62) / 0.09) * 0.24;
    const build = clamp(stage - 1),
      repeat = ease((stage - 2) / 1.2),
      system = ease(stage - 3);
    const sketch = mix(raw, step, ease(stage));
    const rowOffset = row * mix(0.011, 0.066, repeat);
    const variant =
      (Math.floor(i / 4) - 1.5) * 0.055 * Math.sin(u * Math.PI * 2);
    const signal = mix(sketch, step * 0.42 + variant, ease(build));
    return [
      x,
      signal + rowOffset,
      mix(0, Math.sin(u * Math.PI) * 0.12 + row * 0.042, system),
    ];
  }
  function heroPoint(u, i) {
    const row = i - 7.5;
    // A family of routes, not copies of one wave: event, comparison and return paths.
    const group = Math.floor(i / 4),
      delay = (i % 4) * 0.009;
    const gate =
      ease((u - 0.16 - delay) / 0.055) - ease((u - 0.37 - delay) / 0.055);
    const check =
      ease((u - 0.53 + delay) / 0.05) - ease((u - 0.75 + delay) / 0.05);
    const bend = Math.sin((u - 0.12) * Math.PI * 1.25);
    return [
      (u - 0.5) * 3.2,
      row * 0.086 +
        gate * (group % 2 ? 0.13 : -0.13) +
        check * (group % 2 ? -0.11 : 0.11),
      bend * 0.43 + gate * 0.16 + group * 0.085,
    ];
  }
  field.addEventListener("keydown", (e) => {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "r", "R"].includes(
        e.key,
      )
    )
      return;
    e.preventDefault();
    if (e.key === "ArrowLeft") keyX = clamp(keyX - 0.2, -1, 1);
    if (e.key === "ArrowRight") keyX = clamp(keyX + 0.2, -1, 1);
    if (e.key === "ArrowUp") keyY = clamp(keyY - 0.2, -1, 1);
    if (e.key === "ArrowDown") keyY = clamp(keyY + 0.2, -1, 1);
    if (e.key.toLowerCase() === "r") keyX = keyY = 0;
    wake();
  });
  controls.forEach((b, i) =>
    b.addEventListener("click", () =>
      scrollTo({
        top: top + (distance * (1.25 + i)) / 6.2,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      }),
    ),
  );
  return {
    measure() {
      width = section.clientWidth;
      height = innerHeight;
      top = section.offsetTop;
      distance = Math.max(1, section.offsetHeight - height);
      dpr = Math.min(devicePixelRatio || 1, width <= 700 ? 1.5 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      section.querySelector(".story-anchor").style.top =
        (matchMedia("(prefers-reduced-motion: reduce)").matches
          ? height
          : distance * 0.19) + "px";
      lastDraw = "";
    },
    get state() {
      return { yaw, pitch, progress };
    },
    update(y, time, dt, px, py, reduced) {
      if (y + height < top || y > top + distance + height) return false;
      const target = clamp((y - top) / distance) * 6.2,
        mobile = width <= 700;
      progress = reduced ? 0 : mix(progress, target, 1 - Math.exp(-dt / 95));
      clock += reduced ? 0 : Math.min(dt, 40) / 1000;
      yaw = mix(
        yaw,
        reduced ? 0 : clamp(px * 0.16 + keyX * 0.3, -0.4, 0.4),
        1 - Math.exp(-dt / 170),
      );
      pitch = mix(
        pitch,
        reduced ? 0 : clamp(py * 0.1 + keyY * 0.2, -0.25, 0.25),
        1 - Math.exp(-dt / 170),
      );
      const p = progress,
        handoff = ease((p - 0.25) / 0.85),
        light = ease((p - 0.6) / 0.55) * (1 - ease((p - 5.3) / 0.85));
      const phase = clamp(p - 1, 0, 4),
        index = p < 0.95 ? -1 : Math.min(4, Math.floor(p - 1));
      const storyVisible = ease((p - 0.85) / 0.22),
        departure = ease((p - 5.55) / 0.6);
      section.style.setProperty("--intro", 1 - ease((p - 0.15) / 0.48));
      section.style.setProperty("--story", storyVisible * (1 - departure));
      section.style.setProperty("--light", light);
      section.style.setProperty("--exit", departure);
      section.style.setProperty("--travel", clamp(p / 6.2));
      section.style.setProperty(
        "--reading-ink",
        light > 0.48 ? "#26362f" : "#e5e8df",
      );
      section.style.setProperty(
        "--reading-muted",
        light > 0.48 ? "#5e6c60" : "#a9b6a5",
      );
      section.classList.toggle("construction-active", index >= 0);
      section.classList.toggle("construction-ending", p > 5.5);
      intro.inert = !reduced && p > 0.65;
      nav.inert = reduced || index < 0 || p > 5.5;
      next.inert = reduced || p < 5.8;
      if (index !== active || reduced !== previousReduced) {
        constructionTime = 0;
        previousReduced = reduced;
        active = index;
        pages.forEach((page, i) => {
          const selected = i === index;
          page.classList.toggle("current", selected);
          page.inert = !reduced && !selected;
          page.setAttribute("aria-hidden", String(!reduced && !selected));
        });
        controls.forEach((b, i) =>
          b.setAttribute("aria-current", String(i === index)),
        );
        legend.textContent = stages[Math.max(0, index)];
      }
      constructionTime = Math.min(1400, constructionTime + dt);
      const drawing = ease(constructionTime / 1200);
      // Canvas reuses topology; only its projection, construction and ink change.
      const frame = [
        p.toFixed(3),
        yaw.toFixed(3),
        pitch.toFixed(3),
        reduced,
        Math.floor(clock * 30),
      ].join("|");
      if (!ctx || frame === lastDraw) return false;
      lastDraw = frame;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const bg = rgb([9, 15, 15], [235, 235, 226], light),
        ink = rgb([181, 200, 184], [55, 81, 66], light),
        dim = rgb([61, 84, 76], [148, 157, 141], light),
        gold = rgb([220, 173, 112], [156, 102, 49], light);
      ctx.fillStyle = `rgb(${bg})`;
      ctx.fillRect(0, 0, width, height);
      const cx = width * (mobile ? 0.5 : mix(0.67, 0.69, handoff)),
        cy =
          height *
          (mobile ? mix(0.47, 0.4, handoff) : mix(0.56, 0.49, handoff));
      const scale = Math.min(
        width * (mobile ? 0.29 : 0.205),
        height * (mobile ? 0.32 : 0.34),
      );
      const angle = mix(-0.48, -0.08, handoff) + yaw * (1 - handoff * 0.65),
        tilt = mix(0.82, 0.18, handoff) + pitch * (1 - handoff * 0.65);
      const project = ([x, y, z]) => {
        const a = x * Math.cos(angle) + z * Math.sin(angle),
          b = z * Math.cos(angle) - x * Math.sin(angle);
        const c = y * Math.cos(tilt) - b * Math.sin(tilt),
          d = y * Math.sin(tilt) + b * Math.cos(tilt);
        const k = 3.7 / (3.7 - d);
        return [cx + a * scale * k, cy + c * scale * k, d];
      };
      const selected = clamp(Math.round(7.5 + py * 6), 0, 15);
      const phaseBuild = ease((phase - 1) / 0.8),
        replicate = ease((phase - 2) / 1.1);
      const visibleLines = mix(16, 1 + 15 * replicate, handoff);
      const lines = [];
      for (let i = 0; i < 16; i++) {
        const emphasis =
          i === 8
            ? 1
            : 1 - ease((Math.abs(i - 7.5) - visibleLines * 0.5 + 0.5) * 1.1);
        const alpha =
          mix(0.52 + Math.sin(i * 0.45) * 0.12, emphasis * 0.72, handoff) *
          (1 - departure * 0.25);
        if (alpha < 0.008) continue;
        const points = [];
        for (let j = 0; j <= samples; j++) {
          const u = j / samples,
            h = heroPoint(u, i),
            s = point(u, i, phase);
          const v = h.map((a, k) => mix(a, s[k], handoff));
          const vicinity =
            Math.exp(-((u - (px + 1) / 2) ** 2) * 17) *
            Math.exp(-((i - selected) ** 2) * 0.14);
          v[2] +=
            vicinity * 0.15 * (1 - handoff) +
            Math.sin(clock * 0.22 + i * 0.24) * 0.014 * (1 - handoff);
          points.push(project(v));
        }
        lines.push({ i, points, alpha, depth: points[50][2] });
      }
      lines.sort((a, b) => a.depth - b.depth);
      const stroke = (
        points,
        color,
        alpha,
        lineWidth = 1,
        start = 0,
        end = points.length,
      ) => {
        if (end - start < 2) return;
        ctx.beginPath();
        points
          .slice(start, end)
          .forEach((v, j) =>
            j ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]),
          );
        ctx.strokeStyle = `rgba(${color},${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      };
      // Small transverse spans make the hero an inspectable structure, not loose trails.
      const crossAlpha = (1 - handoff) * 0.34 + replicate * 0.3;
      if (crossAlpha > 0.005)
        for (const u of [0.08, 0.2, 0.37, 0.48, 0.64, 0.81, 0.94]) {
          const pts = [];
          for (let i = 0; i < 16; i++) {
            const h = heroPoint(u, i),
              s = point(u, i, phase);
            pts.push(project(h.map((v, k) => mix(v, s[k], handoff))));
          }
          stroke(pts, dim, crossAlpha, 0.65);
        }
      for (const { i, points, alpha } of lines) {
        // Fine double edges and depth-dependent weight give the field a material presence.
        if (handoff < 0.98) {
          const thickness = 4.5 * (1 - handoff);
          ctx.beginPath();
          points.forEach((v, j) =>
            j ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]),
          );
          [...points]
            .reverse()
            .forEach((v) => ctx.lineTo(v[0], v[1] + thickness));
          ctx.closePath();
          ctx.fillStyle = `rgba(${ink},${alpha * 0.19})`;
          ctx.fill();
          stroke(
            points.map((v) => [v[0], v[1] + thickness]),
            dim,
            alpha * 0.8,
            0.7,
          );
        }
        stroke(points, ink, alpha, i === selected ? 1.65 : 1);
        const main = i === 8;
        if (main) {
          stroke(
            points,
            gold,
            0.96,
            1.7,
            0,
            Math.ceil(mix(0.22, 1, handoff ? drawing : 1) * points.length),
          );
          const head = reduced ? 0.63 : (clock * 0.065) % 1;
          stroke(
            points,
            light > 0.5 ? [77, 62, 41] : [249, 218, 172],
            0.95,
            2.6,
            Math.floor(head * 90),
            Math.min(101, Math.floor(head * 90) + 10),
          );
        }
        if (phaseBuild > 0.02 || handoff < 0.5) {
          for (const j of [18, 37, 62, 83]) {
            const v = points[j],
              r = mix(1.5, 4.5, phaseBuild) * (main ? 1.15 : 1);
            ctx.fillStyle = `rgb(${bg})`;
            ctx.strokeStyle = `rgba(${main ? gold : ink},${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(v[0] - r, v[1]);
            ctx.lineTo(v[0], v[1] - r);
            ctx.lineTo(v[0] + r, v[1]);
            ctx.lineTo(v[0], v[1] + r);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            if (main && phaseBuild > 0.5 && drawing > j / samples) {
              ctx.fillStyle = `rgba(${gold},${alpha * 0.8})`;
              ctx.beginPath();
              ctx.arc(v[0], v[1], 1.6, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
      // The route is surrounded by its construction, then those supports are retained.
      const scaffold =
        ease((phase - 0.35) / 0.6) * (1 - ease((phase - 3.2) / 0.8)) * handoff;
      if (scaffold > 0.01) {
        const main = lines.find((l) => l.i === 8)?.points;
        if (main)
          for (const [n, j] of [18, 37, 62, 83].entries()) {
            const v = main[j],
              w = mobile ? 25 : 45,
              h = mobile ? 30 : 55,
              form = ease((phase - 0.7 - n * 0.13) / 0.7);
            ctx.strokeStyle = `rgba(${dim},${scaffold * 0.48})`;
            ctx.lineWidth = 0.7;
            ctx.setLineDash([3, 5]);
            ctx.beginPath();
            ctx.moveTo(v[0], v[1] - h - 30);
            ctx.lineTo(v[0], v[1] + h + 20);
            ctx.moveTo(v[0] - w - 15, v[1] - h);
            ctx.lineTo(v[0] + w + 15, v[1] - h);
            ctx.stroke();
            ctx.setLineDash([]);
            // The frame draws clockwise; it is a method boundary, not a UI panel.
            const corners = [
              [v[0] - w, v[1] - h],
              [v[0] + w, v[1] - h],
              [v[0] + w, v[1] + h],
              [v[0] - w, v[1] + h],
              [v[0] - w, v[1] - h],
            ];
            for (let k = 0; k < 4; k++) {
              const f = clamp(form * 4 - k);
              stroke(
                [
                  corners[k],
                  corners[k].map((c, a) => mix(c, corners[k + 1][a], f)),
                ],
                ink,
                scaffold * 0.68,
                1,
              );
            }
            if (form > 0.8) {
              ctx.strokeStyle = `rgba(${gold},${scaffold})`;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(v[0] - 5, v[1] - h - 8);
              ctx.lineTo(v[0] - 1, v[1] - h - 4);
              ctx.lineTo(v[0] + 7, v[1] - h - 14);
              ctx.stroke();
            }
          }
      }
      const rework =
        ease((phase - 1.85) / 0.6) * (1 - ease((phase - 3.4) / 0.55));
      if (rework > 0.01) {
        for (let row = 0; row < 3; row++) {
          const u0 = 0.18 + row * 0.22,
            pts = [];
          for (let j = 0; j <= 35; j++) {
            const u = u0 + (j / 35) * 0.19,
              v = point(u, 8, phase);
            v[1] -= Math.sin((j / 35) * Math.PI) * (0.25 + row * 0.1) * rework;
            pts.push(project(v));
          }
          stroke(pts, gold, rework * 0.62, 1);
          const label = pts[16];
          ctx.font = `${mobile ? 8 : 10}px Geist, Arial`;
          ctx.fillStyle = `rgba(${ink},${rework * 0.8})`;
          ctx.fillText(
            ["test", "revise", "retain"][row],
            label[0],
            label[1] - 15,
          );
        }
      }
      // Earlier attempts remain as registration marks, then resolve into one route.
      if (handoff > 0.05 && phase < 2.5) {
        for (let r = 0; r < 3; r++) {
          const pts = Array.from({ length: 61 }, (_, j) => {
            const u = j / 60,
              v = point(u, 8, Math.max(0, phase - 0.65 - r * 0.15));
            v[1] += (r + 1) * 0.11;
            return project(v);
          });
          ctx.setLineDash([2, 5]);
          stroke(
            pts,
            dim,
            handoff * 0.35 * (1 - ease((phase - 1.6) / 0.9)),
            0.8,
          );
          ctx.setLineDash([]);
        }
      }
      // The method gains check positions and retained context before it multiplies.
      const legendAlpha = handoff * (1 - departure);
      ctx.font = `${mobile ? 9 : 11}px Geist, Arial`;
      ctx.textAlign = "left";
      const labels =
        phase < 0.8
          ? ["observation", "unresolved", "another attempt"]
          : phase < 1.8
            ? ["first route", "check", "revise"]
            : phase < 2.8
              ? ["input", "check", "retain"]
              : ["use", "revision", "reuse"];
      [0.08, 0.48, 0.87].forEach((u, j) => {
        const base = point(u, 8, phase);
        base[1] = Math.max(0.45, base[1] + 0.23) + replicate * 0.35;
        const pos = project(base);
        ctx.fillStyle = `rgba(${ink},${legendAlpha * 0.75})`;
        ctx.fillText(labels[j], pos[0] - 10, pos[1] + (mobile ? 24 : 38));
        ctx.strokeStyle = `rgba(${dim},${legendAlpha * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(pos[0], pos[1]);
        ctx.lineTo(pos[0], pos[1] + (mobile ? 12 : 22));
        ctx.stroke();
      });
      return !reduced && (p < 6.18 || Math.abs(progress - target) > 0.001);
    },
  };
}
