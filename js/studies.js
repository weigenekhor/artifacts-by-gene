import { createTopography } from "./topography.js";
import { createBaseplateExchange } from "./baseplate-exchange.js";
import { createInspection } from "./inspection.js";
import { developInstrument } from "./instruments.js";
import { createAnalysis } from "./analysis.js";
// Interface, method, inspection and handoff share the page's single clock.
const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (v) => {
  v = clamp(v);
  return v * v * v * (v * (v * 6 - 15) + 10);
};
export function createStudy(el, wake) {
  const beats = JSON.parse(el.dataset.beats),
    beat = el.querySelector(".study-beat"),
    control = el.querySelector(".study-control input"),
    verbs = [...el.querySelectorAll("[data-phase]")];
  const movers = [...el.querySelectorAll("[data-move]")].map((node) => ({
    node,
    from: node.dataset.move.split(",").map(Number),
    on: node.dataset.on || "gather",
  }));
  const drawers = [...el.querySelectorAll("[data-draw]")],
    reveals = [...el.querySelectorAll("[data-reveal]")],
    rings = [...el.querySelectorAll("[data-ring]")],
    scans = [...el.querySelectorAll("[data-scan]")],
    cursor = el.querySelector("[data-cursor]");
  const develop = developInstrument(el);
  const exchange = createBaseplateExchange(el);
  const topography = createTopography(el, wake);
  const inspectDetail = createInspection(el);
  const analysis = createAnalysis(el),
    timings = el.dataset.timings.split(",").map(Number);
  const stateName = el.querySelector(".state-name"),
    stateNumber = el.querySelector(".state-number");
  const focus = el.querySelector(".focus-range"),
    visual = el.querySelector(".feature-visual");
  let inspection = null,
    box = null;
  focus.addEventListener("input", () => {
    inspection = Number(focus.value) / 100;
    wake();
  });
  visual.addEventListener("pointerenter", () => {
    box = visual.getBoundingClientRect();
  });
  visual.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || !box) return;
    inspection = clamp((e.clientX - box.left) / box.width);
    focus.value = Math.round(inspection * 100);
    wake();
  });
  visual.addEventListener("pointerleave", () => {
    box = null;
    inspection = null;
    wake();
  });
  const camera = el.querySelector(".study-camera"),
    kind = el.dataset.feature;
  const angle = {
    history: [5, -9],
    schedule: [12, 5],
    usage: [19, -11],
    surface: [-5, 9],
    compare: [4, -7],
    pathfinder: [7, 8],
    compile: [12, -12],
    diagnose: [5, -8],
    arrange: [24, -7],
    zones: [22, 8],
    configuration: [4, 11],
    spc: [7, -8],
    legacy: [4, 9],
    planning: [12, -8],
    report: [9, 11],
    signals: [13, -12],
  }[kind];
  el.style.setProperty("--source-rx", angle[0] * 0.55 + "deg");
  el.style.setProperty("--source-ry", angle[1] + "deg");
  const regions = {
    history: ["Event", 7],
    schedule: ["Interval", 8],
    usage: ["Chamber", 3],
    surface: ["Region", 5],
    compare: ["Step", 7],
    pathfinder: ["Chart interval", 8],
    compile: ["Report section", 6],
    diagnose: ["Investigation path", 4],
    arrange: ["Position", 5],
    zones: ["Position", 5],
    configuration: ["Property", 6],
    spc: ["Chart interval", 8],
    legacy: ["Parameter", 5],
    planning: ["Interval", 8],
    report: ["Report section", 6],
    signals: ["Shared interval", 8],
  }[kind];
  const output = el.querySelector(".focus-position");
  let p = 0,
    phase = -1;
  return {
    update(wanted, dt, reduced, manual, px = 0, py = 0) {
      p =
        reduced || manual
          ? wanted
          : p + (wanted - p) * (1 - Math.exp(-dt / 70));
      const functional = clamp((p - 0.27) / 0.53);
      const expand =
        smooth((p - 0.51) / 0.14) * (1 - smooth((p - 0.73) / 0.12));
      const stages = {
        gather: smooth(functional / 0.32),
        resolve: smooth((functional - 0.22) / 0.44),
        inspect:
          inspection === null ? smooth((functional - 0.59) / 0.35) : inspection,
      };
      el.style.setProperty("--progress", p);
      for (const [key, value] of Object.entries(stages))
        el.style.setProperty("--" + key, value);
      control.value = Math.round(p * 100);
      el.style.setProperty("--entry", smooth((p - 0.22) / 0.14));
      el.style.setProperty("--review", smooth((p - 0.79) / 0.1));
      el.style.setProperty(
        "--activation",
        smooth((p - 0.1) / 0.1) * (1 - smooth((p - 0.23) / 0.08)),
      );
      el.style.setProperty(
        "--decompose",
        smooth((p - 0.19) / 0.13) * (1 - smooth((p - 0.32) / 0.06)),
      );
      el.style.setProperty("--analysis", reduced ? 0 : expand);
      el.style.setProperty("--closure", smooth((p - 0.88) / 0.08));
      el.classList.toggle("source-view", !reduced && (p < 0.36 || p > 0.79));
      output.textContent =
        regions[0] +
        " " +
        String(
          Math.min(regions[1] - 1, Math.floor(stages.inspect * regions[1])) + 1,
        ).padStart(2, "0");
      if (inspection === null) focus.value = Math.round(stages.inspect * 100);
      const depth = Math.sin(Math.PI * stages.resolve);
      const orbit = Math.sin(Math.PI * functional),
        settle = 1 - smooth((functional - 0.76) / 0.24);
      const mobile = innerWidth < 700,
        scale = mobile ? 0.22 : 1;
      camera.style.setProperty(
        "--camera-x",
        ((1 - stages.gather) * 32 + orbit * angle[1] * 1.2 + px * 4 * settle) *
          scale +
          "px",
      );
      camera.style.setProperty(
        "--camera-y",
        (-depth * 22 + py * 3 * settle) * scale + "px",
      );
      camera.style.setProperty(
        "--camera-z",
        (depth * 130 + expand * 32) * scale + "px",
      );
      camera.style.setProperty(
        "--camera-rx",
        (angle[0] * ((1 - stages.resolve) * 1.25 + orbit * 0.3) +
          py * 1.5 * settle) *
          scale +
          "deg",
      );
      camera.style.setProperty(
        "--camera-ry",
        (angle[1] * ((1 - stages.resolve) * 1.5 - orbit * 0.45) +
          px * 2 * settle) *
          scale +
          "deg",
      );
      const next = timings.filter((t) => p >= t).length;
      if (next !== phase) {
        beat.textContent = beats[next];
        stateName.textContent = [
          "Identity",
          "Activation",
          "Decomposition",
          "Analysis",
          "Transformation",
          "Resolution",
          "Closure",
        ][next];
        stateNumber.textContent = String(next + 1).padStart(2, "0") + " / 07";
        verbs.forEach((v, i) =>
          v.classList.toggle(
            "active",
            i === Math.max(0, Math.min(2, next - 3)),
          ),
        );
        phase = next;
      }
      for (const [i, { node, from, on }] of movers.entries()) {
        const v =
          1 - smooth((stages[on] - (i % 7) * 0.06) / (1 - (i % 7) * 0.06));
        node.setAttribute(
          "transform",
          `translate(${(from[0] * v).toFixed(2)} ${(from[1] * v).toFixed(2)})`,
        );
      }
      for (const [i, node] of drawers.entries())
        node.style.strokeDashoffset =
          1 -
          smooth(
            (stages[node.dataset.draw] - (i % 6) * 0.045) /
              (1 - (i % 6) * 0.045),
          );
      for (const node of reveals)
        node.style.opacity = stages[node.dataset.reveal];
      for (const node of rings) {
        const extent = Number(node.dataset.ring) * stages.resolve;
        node.style.strokeDasharray = `${extent} ${1 - extent}`;
        node.style.opacity = 0.3 + 0.7 * stages.inspect;
      }
      for (const node of scans) {
        const a = Number(node.dataset.start),
          b = Number(node.dataset.end);
        node.setAttribute(
          node.dataset.scan,
          (a + (b - a) * stages.inspect).toFixed(2),
        );
      }
      if (cursor)
        cursor.setAttribute(
          "transform",
          `translate(${180 + 365 * stages.inspect} 0)`,
        );
      develop(functional, stages);
      analysis(reduced ? 0 : expand, stages.inspect, p);
      inspectDetail(reduced ? 0.7 : p, stages.inspect);
      exchange(reduced ? 1 : functional);
      topography(reduced ? 0.8 : functional, stages.inspect, reduced, px, py);
      return Math.abs(p - wanted) > 0.0005;
    },
  };
}
