import { createTopography } from "./topography.js";
import { createFunctionStudy } from "./function-studies.js";
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
  const spatial = createFunctionStudy(el, wake);
  const topography = createTopography(el, wake);
  const timings = el.dataset.timings.split(",").map(Number);
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
  const kind = el.dataset.feature,
    states = JSON.parse(el.dataset.states);
  const regions = {
    history: ["Event", 7],
    schedule: ["Interval", 8],
    usage: ["Chamber", 3],
    surface: ["Region", 5],
    compare: ["Step", 7],
    pathfinder: ["Parameter", 3],
    compile: ["Report section", 3],
    diagnose: ["Recommended check", 3],
    arrange: ["Position", 5],
    zones: ["Position", 5],
    configuration: ["Property", 6],
    spc: ["Signal", 3],
    legacy: ["Parameter", 5],
    planning: ["Interval", 8],
    report: ["Report section", 3],
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
      const functional = clamp((p - 0.15) / 0.72);
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
      el.style.setProperty("--entry", smooth((p - 0.12) / 0.1));
      el.style.setProperty("--review", smooth((p - 0.89) / 0.07));
      el.style.setProperty("--closure", smooth((p - 0.91) / 0.08));
      el.classList.toggle("source-view", !reduced && (p < 0.19 || p > 0.92));
      output.textContent =
        regions[0] +
        " " +
        String(
          Math.min(regions[1] - 1, Math.floor(stages.inspect * regions[1])) + 1,
        ).padStart(2, "0");
      if (inspection === null) focus.value = Math.round(stages.inspect * 100);
      const next = timings.filter((t) => p >= t).length;
      if (next !== phase) {
        beat.textContent = beats[next];
        stateName.textContent = states[next];
        stateNumber.textContent = String(next + 1).padStart(2, "0") + " / 07";
        verbs.forEach((v, i) =>
          v.classList.toggle(
            "active",
            i === Math.max(0, Math.min(2, next - 3)),
          ),
        );
        phase = next;
      }
      spatial(reduced ? 0.8 : functional, stages.inspect, reduced, px, py);
      topography(reduced ? 0.8 : functional, stages.inspect, reduced, px, py);
      return Math.abs(p - wanted) > 0.0005;
    },
  };
}
