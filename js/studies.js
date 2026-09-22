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
  let p = 0,
    phase = -1;
  return {
    update(wanted, dt, reduced, manual) {
      p =
        reduced || manual
          ? wanted
          : p + (wanted - p) * (1 - Math.exp(-dt / 105));
      const stages = {
        gather: smooth(p / 0.32),
        resolve: smooth((p - 0.25) / 0.4),
        inspect: smooth((p - 0.62) / 0.29),
      };
      el.style.setProperty("--progress", p);
      for (const [key, value] of Object.entries(stages))
        el.style.setProperty("--" + key, value);
      if (!manual) control.value = Math.round(p * 100);
      const next = p < 0.32 ? 0 : p < 0.67 ? 1 : 2;
      if (next !== phase) {
        beat.textContent = beats[next];
        verbs.forEach((v, i) => v.classList.toggle("active", i === next));
        phase = next;
      }
      for (const { node, from, on } of movers) {
        const v = 1 - stages[on];
        node.setAttribute(
          "transform",
          `translate(${(from[0] * v).toFixed(2)} ${(from[1] * v).toFixed(2)})`,
        );
      }
      for (const node of drawers)
        node.style.strokeDashoffset = 1 - stages[node.dataset.draw];
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
      return Math.abs(p - wanted) > 0.0005;
    },
  };
}
