// Additional, task-specific choreography. Every state derives from scroll or replay.
const ns = "http://www.w3.org/2000/svg";
const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (v) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
function node(tag, attrs, parent) {
  const n = document.createElementNS(ns, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  parent.append(n);
  return n;
}
function sample(path) {
  const length = path.getTotalLength();
  return Array.from({ length: 101 }, (_, i) => {
    const p = path.getPointAtLength((length * i) / 100);
    return [p.x, p.y];
  });
}
function point(samples, p) {
  const f = clamp(p) * 100,
    i = Math.min(99, Math.floor(f)),
    t = f - i;
  return samples[i].map((v, k) => v + (samples[i + 1][k] - v) * t);
}
export function developInstrument(el) {
  const kind = el.dataset.feature,
    svg = el.querySelector("svg"),
    actions = [];
  if (svg) {
    const defs = node("defs", {}, svg),
      gradient = node(
        "radialGradient",
        { id: "material-" + kind, cx: "32%", cy: "22%", r: "85%" },
        defs,
      );
    node(
      "stop",
      { offset: "0", "stop-color": "var(--diagram-soft)" },
      gradient,
    );
    node(
      "stop",
      { offset: ".4", "stop-color": "var(--diagram-panel)" },
      gradient,
    );
    node(
      "stop",
      { offset: "1", "stop-color": "var(--diagram-panel)" },
      gradient,
    );
    el.style.setProperty("--instrument-surface", "url(#material-" + kind + ")");
    // Packets follow the exact rendered path; there are no unrelated particle fields.
    const routes = [
      ...svg.querySelectorAll("[data-draw]:not(.axis):not(.zone-ray)"),
    ]
      .filter((p) => p.getAttribute("d")?.length > 16)
      .slice(0, 10);
    for (const [i, path] of routes.entries()) {
      const samples = sample(path),
        g = node("g", { "aria-hidden": "true" }, path.parentNode);
      const trail = node("path", { class: "motion-trail" }, g),
        dot = node("circle", { r: 3.6, class: "motion-pulse" }, g);
      actions.push((p, s) => {
        const phase = path.dataset.draw,
          begin = phase === "gather" ? 0.04 : phase === "resolve" ? 0.28 : 0.6;
        const t = clamp((p - begin - i * 0.008) / 0.29),
          xy = point(samples, t);
        g.style.opacity = t > 0 && t < 1 ? ".95" : "0";
        dot.setAttribute("cx", xy[0]);
        dot.setAttribute("cy", xy[1]);
        let d = "";
        for (let j = 0; j < 7; j++) {
          const q = point(samples, Math.max(0, t - j * 0.009));
          d += (j ? "L" : "M") + q.join(",");
        }
        trail.setAttribute("d", d);
      });
    }
  }
  if (["history", "legacy", "planning", "configuration"].includes(kind)) {
    const boxes = [
      ...el.querySelectorAll(".study-box:not(.focus-band):not(.report-paper)"),
    ];
    actions.push((p, s) => {
      const target =
        kind === "legacy"
          ? 2
          : kind === "configuration"
            ? 9
            : kind === "planning"
              ? 3
              : Math.min(6, Math.floor(s.inspect * 7));
      boxes.forEach((n, i) =>
        n.classList.toggle("focused", p > 0.53 && i === target),
      );
    });
  }
  if (kind === "history") {
    const band = el.querySelector(".focus-band"),
      label = [...svg.querySelectorAll("text")].find(
        (n) => n.textContent === "In context",
      );
    actions.push((p, s) => {
      const y = 70 + Math.floor(Math.min(0.999, s.inspect) * 7) * 43;
      band.setAttribute("y", y);
      band.setAttribute("height", 35);
      if (label) label.setAttribute("y", y + 22);
    });
  }
  if (kind === "schedule" || kind === "planning") {
    const g = node("g", {}, svg),
      band = node(
        "rect",
        { x: 135, y: 65, width: 80, height: 320, class: "motion-scan" },
        g,
      );
    const line = node("path", { d: "M135 65V390", class: "motion-focus" }, g);
    actions.push((p, s) => {
      const x = 135 + s.inspect * 430;
      band.setAttribute("x", x);
      line.setAttribute("d", `M${x + 40} 65V390`);
      g.style.opacity = s.resolve * (1 - smooth((p - 0.96) / 0.04));
    });
  }
  if (kind === "usage") {
    const g = node("g", {}, svg),
      markers = [0, 1, 2].map((i) =>
        node("circle", { r: 6, class: "motion-pulse" }, g),
      );
    actions.push((p, s) =>
      markers.forEach((n, i) => {
        const a =
          -Math.PI / 2 +
          Math.PI * 2 * (0.42 + i * 0.19) * smooth((p - 0.3 - i * 0.05) / 0.46);
        n.setAttribute("cx", 150 + i * 210 + 79 * Math.cos(a));
        n.setAttribute("cy", 230 + 79 * Math.sin(a));
        n.style.opacity = s.resolve;
      }),
    );
  }
  if (kind === "surface") {
    const contours = svg.querySelector(".contours"),
      echoes = Array.from({ length: 3 }, () => {
        const c = contours.cloneNode();
        c.removeAttribute("class");
        c.setAttribute("class", "contour-echo");
        svg.insertBefore(c, contours);
        return c;
      });
    const samples = [...svg.querySelectorAll(".sample-dot")];
    const scan = node(
      "circle",
      {
        cx: 300,
        cy: 300,
        r: 10,
        fill: "none",
        stroke: "#e4c59b",
        "stroke-width": 1.1,
      },
      svg,
    );
    actions.push((p, s) => {
      const separation = Math.sin(Math.PI * s.resolve) * (1 - s.inspect);
      echoes.forEach((n, i) => {
        n.style.opacity = separation * (0.65 - i * 0.13);
        n.setAttribute(
          "transform",
          `translate(0 ${-(i + 1) * 30 * separation})`,
        );
      });
      samples.forEach((n, i) => {
        n.setAttribute(
          "r",
          2 + Math.sin(Math.PI * clamp((p - i * 0.006) / 0.24)) * 2.2,
        );
      });
      scan.setAttribute("r", 8 + s.inspect * 216);
      scan.style.opacity = 4 * s.inspect * (1 - s.inspect);
    });
  }
  if (kind === "compare") {
    const comparison = el.querySelector(".comparison"),
      columns = [...el.querySelectorAll(".recipe-column")],
      rows = [...el.querySelectorAll(".recipe-step")];
    columns.forEach((n, i) => n.style.setProperty("--side", i ? 1 : -1));
    const links = node(
      "svg",
      {
        class: "compare-link-layer",
        viewBox: "0 0 100 100",
        preserveAspectRatio: "none",
        "aria-hidden": "true",
      },
      comparison,
    );
    const paths = Array.from({ length: 7 }, (_, i) =>
      node(
        "line",
        { x1: 46, y1: 21 + i * 8.3, x2: 54, y2: 21 + i * 8.3 },
        links,
      ),
    );
    actions.push((p, s) => {
      el.style.setProperty("--separate", 1 - s.resolve);
      el.style.setProperty("--difference", s.inspect);
      rows.forEach((r, i) =>
        r.classList.toggle(
          "is-reading",
          p > 0.28 &&
            p < 0.72 &&
            i % 7 === Math.min(6, Math.floor(s.resolve * 7)),
        ),
      );
      paths.forEach((n, i) => {
        n.style.opacity =
          smooth((p - 0.25 - i * 0.025) / 0.2) * (i === 3 ? 0.9 : 0.3);
        n.setAttribute("x2", 46 + 8 * smooth((p - 0.25 - i * 0.025) / 0.2));
      });
    });
  }
  if (kind === "diagnose") {
    const branches = [...svg.querySelectorAll(".diagnosis-paths path")];
    const g = node("g", {}, svg),
      markers = branches.map(() =>
        node("circle", { r: 4, fill: "#d6af82" }, g),
      ),
      samples = branches.map(sample);
    actions.push((p, s) => {
      branches.forEach((n, i) => {
        const t = smooth((p - 0.1 - i * 0.07) / 0.3),
          xy = point(samples[i], t);
        markers[i].setAttribute("cx", xy[0]);
        markers[i].setAttribute("cy", xy[1]);
        markers[i].style.opacity = (t > 0 && t < 1 ? 1 : 0) * (1 - s.inspect);
        n.style.stroke = i === 1 ? "#d6af82" : "#59635a";
      });
    });
  }
  if (kind === "arrange" || kind === "zones") {
    const plates = [...svg.querySelectorAll("circle.plate")],
      g = node("g", {}, svg);
    const rings = plates.map((n) =>
      node(
        "circle",
        {
          cx: n.getAttribute("cx"),
          cy: n.getAttribute("cy"),
          r: 1,
          class: "motion-focus",
        },
        g,
      ),
    );
    actions.push((p, s) =>
      rings.forEach((n, i) => {
        const t = clamp((p - 0.52 - i * 0.045) / 0.24);
        n.setAttribute("r", (kind === "zones" ? 12 : 25) + t * 33);
        n.style.opacity = Math.sin(t * Math.PI) * 0.85;
      }),
    );
  }
  if (["pathfinder", "spc", "legacy", "signals"].includes(kind)) {
    const paths = [...svg.querySelectorAll("path[data-draw]")].filter(
        (n) => (n.getAttribute("d")?.length || 0) > 900,
      ),
      g = node("g", {}, svg),
      markers = paths.map(() =>
        node("circle", { r: 5, class: "motion-pulse" }, g),
      ),
      samples = paths.map(sample);
    const x0 = kind === "signals" ? 100 : kind === "spc" ? 90 : 350,
      x1 = kind === "signals" ? 625 : kind === "spc" ? 625 : 635;
    const guide = node("path", { class: "motion-focus" }, g);
    // Shared x, independently sampled y: the inspection line genuinely follows each curve.
    actions.push((p, s) => {
      const x = x0 + (x1 - x0) * s.inspect;
      guide.setAttribute("d", `M${x} 65V390`);
      g.style.opacity = smooth((p - 0.57) / 0.13);
      markers.forEach((n, i) => {
        const pts = samples[i];
        let best = pts[0];
        for (const q of pts)
          if (Math.abs(q[0] - x) < Math.abs(best[0] - x)) best = q;
        n.setAttribute("cx", x);
        n.setAttribute("cy", best[1]);
      });
      if (kind === "signals") {
        const old = svg.querySelector("[data-cursor]");
        if (old) old.style.opacity = 0;
        const band = svg.querySelector(".focus-band");
        if (band) band.setAttribute("x", Math.max(80, Math.min(502, x - 80)));
      }
    });
  }
  if (kind === "compile" || kind === "report") {
    const g = node("g", {}, svg),
      sheets = [];
    for (let i = 0; i < 3; i++)
      sheets.push(
        node(
          "path",
          {
            d:
              kind === "compile"
                ? "M490 93H660V358H490Z"
                : "M430 70H650V385H430Z",
            class: "motion-guide",
          },
          g,
        ),
      );
    actions.push((p, s) =>
      sheets.forEach((n, i) => {
        const separation = Math.sin(Math.PI * s.resolve) * (i + 1) * 10;
        n.setAttribute("transform", `translate(${separation} ${-separation})`);
        n.style.opacity = Math.sin(Math.PI * s.resolve) * 0.6;
      }),
    );
  }
  return (p, stages) => actions.forEach((f) => f(p, stages));
}
