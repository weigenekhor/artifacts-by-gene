// Each inspection unfolds the application's existing geometry; no fabricated results.
const ns = "http://www.w3.org/2000/svg";
const select = (p, n) => Math.min(n - 1, Math.floor(p * n));
export function createAnalysis(el) {
  const kind = el.dataset.feature,
    svg = el.querySelector(".feature-visual svg"),
    rows = [...el.querySelectorAll("[data-move]")],
    rects = [...el.querySelectorAll(".study-box")],
    paths = [...el.querySelectorAll("path[data-draw]")].filter(
      (p) => (p.getAttribute("d") || "").length > 900,
    );
  const add = (tag, attributes, parent = svg) => {
    const n = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attributes)) n.setAttribute(k, v);
    parent.append(n);
    return n;
  };
  const shift = (n, x, y) => {
    const prior = n.getAttribute("transform") || "";
    n.setAttribute("transform", prior + ` translate(${x} ${y})`);
  };
  let profile = null,
    section = null;
  if (kind === "surface") {
    const g = add("g", { class: "section-profile" });
    profile = g;
    add("path", { d: "M80 492H520", class: "motion-guide" }, g);
    const label = add(
      "text",
      { x: 80, y: 543, fill: "currentColor", "font-size": 11 },
      g,
    );
    label.textContent = "Section through the illustrative field";
    section = add(
      "path",
      { fill: "none", stroke: "#e3be87", "stroke-width": 2 },
      g,
    );
  }
  const compareRows = [...el.querySelectorAll(".recipe-step")];
  const plates = svg ? [...svg.querySelectorAll("circle.plate")] : [];
  const diagnostic = svg
    ? [...svg.querySelectorAll(".diagnosis-paths path")]
    : [];
  // Analytical windows use the same plotted paths, enlarged around their own centre.
  const pathTransforms = paths.map((p) => p.getAttribute("transform") || "");
  return (amount, inspection, p) => {
    if (kind === "history") {
      const chosen = select(inspection, 7);
      rows.forEach((r, i) => {
        const d = i - chosen;
        shift(r, Math.abs(d) < 2 ? amount * 45 : 0, amount * d * 8);
        r.style.opacity = 1 - amount * (Math.abs(d) > 1 ? 0.65 : 0);
      });
    }
    if (kind === "schedule" || kind === "planning") {
      rows.forEach((r, i) => {
        const pair =
          kind === "schedule" ? Math.floor(i / 3) : Math.floor(i / 2);
        shift(r, amount * (pair % 2 ? 20 : -20), amount * (pair - 1.5) * 12);
      });
      rects.forEach((r, i) => {
        r.style.strokeWidth =
          amount > 0.3 && i % 4 === select(inspection, 4) ? 2 : 1;
      });
    }
    if (kind === "usage") {
      [...svg.querySelectorAll(".usage-ring,.ring-track")].forEach((r, i) => {
        const chamber = Math.floor(i / 2);
        r.setAttribute(
          "r",
          79 + amount * (chamber === select(inspection, 3) ? 15 : -10),
        );
      });
      rows.forEach((r, i) => shift(r, 0, amount * ((i % 6) - 2.5) * 8));
    }
    if (kind === "surface") {
      profile.style.opacity = amount;
      const y = (inspection - 0.5) * 2.8;
      let d = "";
      for (let i = 0; i < 80; i++) {
        const x = (i / 79 - 0.5) * 4,
          v =
            0.72 * Math.exp(-((x - 0.75) ** 2 + (y + 0.2) ** 2) * 0.7) -
            0.4 * Math.exp(-((x + 1.1) ** 2 + (y - 0.65) ** 2) * 1.3) +
            0.16 * Math.sin(x * 1.4 + y);
        d +=
          (i ? "L" : "M") +
          (80 + (i / 79) * 440) +
          "," +
          (496 - v * 65 * amount);
      }
      section.setAttribute("d", d);
      svg.style.transform = `translateY(${-amount * 12}px) scale(${1 - amount * 0.06})`;
    }
    if (kind === "compare") {
      compareRows.forEach((r, i) => {
        const active = i % 7 === 3;
        r.style.translate = `${amount * (i < 7 ? -1 : 1) * (active ? 12 : 0)}px ${amount * ((i % 7) - 3) * 4}px`;
        r.style.opacity = 1 - amount * (active ? 0 : 0.65);
      });
    }
    if (["pathfinder", "spc", "legacy", "signals"].includes(kind)) {
      paths.forEach((path, i) => {
        const centre =
          kind === "signals"
            ? 116 + i * 113
            : kind === "spc"
              ? 180 + i * 110
              : 225;
        path.setAttribute(
          "transform",
          pathTransforms[i] +
            ` translate(0 ${centre}) scale(1 ${1 + amount * 0.42}) translate(0 ${-centre})`,
        );
      });
      [...svg.querySelectorAll(".chart-inspector")].forEach((n, i) => {
        const centre =
          kind === "signals"
            ? 116 + i * 113
            : kind === "spc"
              ? 180 + i * 110
              : 225;
        n.setAttribute(
          "cy",
          centre +
            (Number(n.getAttribute("cy")) - centre) * (1 + amount * 0.42),
        );
      });
      if (kind === "signals")
        rows.forEach((r, i) => shift(r, 0, amount * (i - 1) * 9));
      if (kind === "pathfinder" || kind === "legacy")
        rows.forEach((r, i) => {
          r.style.opacity =
            1 - amount * (i === select(inspection, rows.length) ? 0 : 0.55);
        });
    }
    if (kind === "compile" || kind === "report") {
      rows.forEach((r, i) => {
        const n = rows.length;
        shift(
          r,
          amount * (kind === "compile" ? 75 : 105),
          -amount * (i - (n - 1) / 2) * 12,
        );
        r.style.opacity = 1 - amount * 0.2;
      });
      const paper = svg.querySelector(".report-paper");
      if (paper) paper.style.strokeWidth = 1 + amount * 1.4;
    }
    if (kind === "diagnose") {
      diagnostic.forEach(
        (r, i) =>
          (r.style.opacity =
            1 - amount * (i === select(inspection, 4) ? 0 : 0.8)),
      );
      const route = svg.querySelector(".diagnosis-route");
      route.style.opacity = 1 - amount * 0.8;
    }
    if (kind === "arrange" || kind === "zones") {
      plates.forEach((r, i) => {
        const chosen = i === select(inspection, 5);
        r.setAttribute(
          "r",
          (kind === "zones" ? 54 : 42) + amount * (chosen ? 13 : -5),
        );
        r.style.fillOpacity = 1 - amount * (chosen ? 0 : 0.45);
      });
      if (kind === "zones")
        [...svg.querySelectorAll(".zone-ray")].forEach(
          (r, i) =>
            (r.style.opacity =
              1 - amount * (i === select(inspection, 5) ? 0 : 0.8)),
        );
    }
    if (kind === "configuration")
      rows.forEach((r, i) => {
        const chosen = i % 6 === select(inspection, 6);
        shift(r, amount * (i < 6 ? -14 : 14), amount * ((i % 6) - 2.5) * 5);
        r.style.opacity = 1 - amount * (chosen ? 0 : 0.6);
      });
  };
}
