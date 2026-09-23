import { developInstrument } from "./instruments.js";
// Shared three-stage choreography for every application, on the page's single clock.
const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (v) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
export function createStudy(el) {
  const beats = JSON.parse(el.dataset.beats),
    beat = el.querySelector(".study-beat"),
    control = el.querySelector("input"),
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
  const phases = {
    gather: [0, 0.32],
    resolve: [0.23, 0.7],
    inspect: [0.61, 0.96],
  };
  const stage = (key, delay = 0) =>
    smooth(
      (p - phases[key][0] - delay) / (phases[key][1] - phases[key][0] - delay),
    );
  let p = 0,
    phase = -1;
  return {
    update(wanted, dt, reduced, manual, px = 0, py = 0) {
      p =
        reduced || manual
          ? wanted
          : p + (wanted - p) * (1 - Math.exp(-dt / 105));
      const stages = {
        gather: stage("gather"),
        resolve: stage("resolve"),
        inspect: stage("inspect"),
      };
      el.style.setProperty("--progress", p);
      for (const [key, value] of Object.entries(stages))
        el.style.setProperty("--" + key, value);
      control.value = Math.round(p * 100);
      const depth = Math.sin(Math.PI * stages.resolve);
      const mobile = innerWidth < 700,
        scale = mobile ? 0.22 : 1;
      camera.style.setProperty(
        "--camera-x",
        ((1 - stages.gather) * 18 + px * 3) * scale + "px",
      );
      camera.style.setProperty(
        "--camera-y",
        (-depth * 13 + py * 2) * scale + "px",
      );
      camera.style.setProperty(
        "--camera-z",
        (depth * 80 + stages.inspect * 8) * scale + "px",
      );
      camera.style.setProperty(
        "--camera-rx",
        (angle[0] * (1 - stages.resolve) + py * 1.2 * (1 - stages.inspect)) *
          scale +
          "deg",
      );
      camera.style.setProperty(
        "--camera-ry",
        (angle[1] * (1 - stages.gather) + px * 1.7 * (1 - stages.inspect)) *
          scale +
          "deg",
      );
      const next = p < 0.32 ? 0 : p < 0.67 ? 1 : 2;
      if (next !== phase) {
        beat.textContent = beats[next];
        verbs.forEach((v, i) => v.classList.toggle("active", i === next));
        phase = next;
      }
      for (const [i, { node, from, on }] of movers.entries()) {
        const v = 1 - stage(on, (i % 7) * 0.018);
        node.setAttribute(
          "transform",
          `translate(${(from[0] * v).toFixed(2)} ${(from[1] * v).toFixed(2)})`,
        );
      }
      for (const [i, node] of drawers.entries())
        node.style.strokeDashoffset =
          1 - stage(node.dataset.draw, (i % 6) * 0.015);
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
      develop(p, stages);
      return Math.abs(p - wanted) > 0.0005;
    },
  };
}
