import comparison from "../content/papyrus.json";

const clamp = (x) => Math.max(0, Math.min(1, x));
const mix = (a, b, t) => a + (b - a) * t;
const ease = (v) => {
  const x = clamp(v);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const phase = (p, start, length) => ease((p - start) / length);
// A critically damped convergence: no overshoot, no identical row travel.
const settle = (v) => {
  const x = clamp(v);
  return (1 - (1 + 9 * x) * Math.exp(-9 * x)) / (1 - 10 * Math.exp(-9));
};
const rectMix = (a, b, t) =>
  Object.fromEntries(Object.keys(a).map((k) => [k, mix(a[k], b[k], t)]));

export function createPapyrusStudy(el, wake) {
  const view = el.querySelector(".papyrus-view"),
    capture = el.querySelector(".papyrus-capture");
  const focus = el.querySelector(".papyrus-source-focus"),
    panes = [...el.querySelectorAll(".papyrus-pane")];
  const rows = [...el.querySelectorAll(".papyrus-row")],
    relations = el.querySelector(".papyrus-relations");
  const paths = [...relations.querySelectorAll("path")],
    dots = [...relations.querySelectorAll("circle")];
  // A positional candidate is plausible until its node/property identity is read.
  const candidates = [
    [1, 0],
    [3, 2],
  ].map(() => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#ccaa8a");
    path.setAttribute("stroke-dasharray", "3 5");
    relations.prepend(path);
    return path;
  });
  const register = relations.querySelector(".papyrus-register"),
    surface = el.querySelector(".papyrus-comparison");
  const statement = el.querySelector(".papyrus-statement"),
    chapter = el.querySelector(".papyrus-chapter");
  const control = el.querySelector(".study-control input"),
    progressLabel = el.querySelector(".papyrus-progress-label");
  const inspection = el.querySelector(".papyrus-inspection"),
    reading = el.querySelector(".papyrus-reading");
  const buttons = [...el.querySelectorAll("[data-difference]")],
    provenance = el.querySelector(".papyrus-provenance");
  const original = el.querySelector(".papyrus-original"),
    source = comparison.source;
  const weights = comparison.rows.map(() => 0);
  let w = 1,
    h = 1,
    labelHeight = 38,
    reducedHeight = 560,
    base = { x: 0, y: 0, width: 1, height: 1 },
    p = 0,
    selected = null,
    canInspect = false,
    dirty = true,
    lastState = -1,
    lastReading = "",
    previousReduced = null;
  function measure() {
    w = view.clientWidth;
    h = view.clientHeight;
    labelHeight = panes[0].firstElementChild.offsetHeight;
    reducedHeight = surface.clientHeight;
    const fit = Math.min(w / source.width, h / source.height, 1);
    base = {
      x: (w - source.width * fit) / 2,
      y: (h - source.height * fit) / 2,
      width: source.width * fit,
      height: source.height * fit,
    };
    relations.setAttribute("viewBox", `0 0 ${w} ${h}`);
    dirty = true;
    wake();
  }
  new ResizeObserver(measure).observe(view);
  document.fonts.ready.then(measure);
  function choose(index) {
    if (!canInspect) return;
    selected = index;
    dirty = true;
    wake();
  }
  el.querySelector(".study-play").addEventListener("click", (event) => {
    if (event.currentTarget.getAttribute("aria-pressed") === "true") return;
    p = 0;
    selected = null;
    dirty = true;
    wake();
  });
  rows.forEach((row) => {
    const i = +row.dataset.row;
    row.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") choose(i);
    });
    row.addEventListener("focus", () => choose(i));
    row.addEventListener("click", () => choose(i));
    row.addEventListener("keydown", (e) => {
      if (!canInspect || !["ArrowUp", "ArrowDown", "Escape"].includes(e.key))
        return;
      e.preventDefault();
      if (e.key === "Escape") {
        selected = null;
        dirty = true;
        row.blur();
        wake();
        return;
      }
      const index = Math.max(
        0,
        Math.min(
          comparison.rows.length - 1,
          i + (e.key === "ArrowDown" ? 1 : -1),
        ),
      );
      panes[+row.dataset.side]
        .querySelector(`[data-row="${index}"]`)
        .focus({ preventScroll: true });
    });
  });
  surface.addEventListener("pointerleave", () => {
    if (!surface.contains(document.activeElement)) {
      selected = null;
      dirty = true;
      wake();
    }
  });
  buttons.forEach((button) =>
    button.addEventListener("click", () =>
      choose(
        comparison.rows.findIndex((r) => r.id === button.dataset.difference),
      ),
    ),
  );
  function place(element, rect) {
    element.style.width = rect.width + "px";
    element.style.height = rect.height + "px";
    element.style.transform = `translate3d(${rect.x}px,${rect.y}px,0)`;
  }
  measure();
  return {
    update(wanted, dt, reduced, manual) {
      const target = reduced ? 0.77 : wanted;
      p = reduced
        ? target
        : mix(p, target, 1 - Math.exp(-dt / (manual ? 55 : 80)));
      if (previousReduced !== reduced) {
        previousReduced = reduced;
        measure();
      }
      const unfold = phase(p, 0.205, 0.15) * (1 - phase(p, 0.855, 0.085));
      const visible = phase(p, 0.263, 0.045) * (1 - phase(p, 0.927, 0.022));
      const distinguish = phase(p, 0.635, 0.057),
        closing = phase(p, 0.86, 0.1);
      canInspect = reduced || (p > 0.65 && p < 0.87);
      const active = canInspect ? (selected ?? (p < 0.775 ? 2 : 3)) : -1;
      let moving = Math.abs(p - target) > 0.0001;
      weights.forEach((value, i) => {
        const to = i === active ? 1 : 0;
        weights[i] = reduced ? to : mix(value, to, 1 - Math.exp(-dt / 140));
        moving ||= Math.abs(weights[i] - to) > 0.001;
      });
      if (!moving && !dirty) return false;
      dirty = false;
      const diagramHeight = reduced ? reducedHeight : h;
      relations.setAttribute("viewBox", `0 0 ${w} ${diagramHeight}`);
      el.style.setProperty("--papyrus-demo", reduced ? 1 : visible);
      el.classList.toggle("papyrus-inspecting", canInspect);
      control.value = Math.round(p * 100);
      surface.inert = !canInspect;
      surface.setAttribute("aria-hidden", String(!reduced && visible < 0.02));
      rows.forEach((row) => (row.tabIndex = canInspect ? 0 : -1));
      inspection.inert = !canInspect;
      inspection.style.opacity = reduced
        ? 1
        : phase(p, 0.635, 0.05) * (1 - phase(p, 0.855, 0.045));
      original.inert = !reduced && p > 0.2 && p < 0.955;
      original.style.opacity = reduced || p < 0.2 || p > 0.955 ? "1" : "0";

      const roi = source.comparison;
      const focusedScale = Math.min(w / roi.width, h / roi.height) * 0.97;
      const focused = {
        x: (w - roi.width * focusedScale) / 2 - roi.x * focusedScale,
        y: (h - roi.height * focusedScale) / 2 - roi.y * focusedScale,
        width: source.width * focusedScale,
        height: source.height * focusedScale,
      };
      const zoom = phase(p, 0.14, 0.13) * (1 - phase(p, 0.95, 0.047));
      const frame = rectMix(base, focused, zoom),
        sourceScale = frame.width / source.width;
      if (!reduced) place(capture, frame);
      // Keep the two text representations separate during the optical handoff.
      capture.style.opacity = reduced
        ? 1
        : 1 - phase(p, 0.235, 0.026) * (1 - phase(p, 0.949, 0.02));
      focus.style.left = (roi.x / source.width) * 100 + "%";
      focus.style.top = (roi.y / source.height) * 100 + "%";
      focus.style.width = (roi.width / source.width) * 100 + "%";
      focus.style.height = (roi.height / source.height) * 100 + "%";
      focus.style.opacity = reduced
        ? 0
        : phase(p, 0.13, 0.055) * (1 - phase(p, 0.29, 0.05));

      const mobile = w < 600,
        gap = mobile ? 30 : Math.min(114, w * 0.085),
        paneW = (w - gap) / 2;
      const rowHeight = (diagramHeight - labelHeight - 10) / 7.55,
        rowSize = Math.min(mobile ? 61 : 76, rowHeight * 0.94);
      const positions = [[], []];
      panes.forEach((pane, side) => {
        const paneSource = source.panes[side];
        const from = {
          x: frame.x + paneSource.x * sourceScale,
          y: frame.y + paneSource.y * sourceScale,
          width: paneSource.width * sourceScale,
          height: paneSource.height * sourceScale,
        };
        const to = {
          x: side * (paneW + gap),
          y: 0,
          width: paneW,
          height: diagramHeight,
        };
        const paneRect = reduced ? to : rectMix(from, to, unfold);
        place(pane, paneRect);
        pane.style.setProperty("--papyrus-row-height", rowSize + "px");
        pane.querySelectorAll(".papyrus-row").forEach((row) => {
          const i = +row.dataset.row,
            r = comparison.rows[i];
          const t = reduced ? 1 : settle((p - r.matchStart) / r.matchDuration);
          const y = mix(r.raw[side], r.aligned, t) * rowHeight;
          row.style.transform = `translate3d(0,${y}px,0)`;
          const changed = r.left !== r.right;
          const quiet = mix(1, changed ? 0.92 : 0.42, distinguish);
          row.style.opacity = mix(quiet, 1, weights[i]);
          row.querySelector(".papyrus-node").style.opacity = reduced
            ? 1
            : mix(0.3, 1, phase(p, 0.34, 0.065));
          row.style.setProperty(
            "--difference",
            distinguish * (changed ? 1 : 0),
          );
          row.style.setProperty("--inspection", weights[i]);
          row.setAttribute("aria-pressed", String(i === active));
          row.classList.toggle("paired", t > 0.995);
          row.style.zIndex = String(i === active ? 3 : 1);
          positions[side][i] = {
            x: paneRect.x + (side ? 0 : paneRect.width),
            y: paneRect.y + labelHeight + y + rowSize * 0.5,
          };
        });
      });
      candidates.forEach((path, i) => {
        const indices = [
            [1, 0],
            [3, 2],
          ][i],
          a = positions[0][indices[0]],
          b = positions[1][indices[1]];
        path.setAttribute(
          "d",
          `M${a.x} ${a.y} C${a.x + gap * 0.45} ${a.y} ${b.x - gap * 0.45} ${b.y} ${b.x} ${b.y}`,
        );
        path.style.opacity = reduced
          ? 0
          : phase(p, 0.315 + i * 0.009, 0.03) *
            (1 - phase(p, 0.37 + i * 0.008, 0.035)) *
            0.7;
      });
      paths.forEach((path, i) => {
        const a = positions[0][i],
          b = positions[1][i],
          r = comparison.rows[i];
        const t = phase(p, r.matchStart - 0.042, 0.085),
          changed = r.left !== r.right;
        path.setAttribute(
          "d",
          `M${a.x - 8} ${a.y} C${a.x + gap * 0.52} ${a.y} ${b.x - gap * 0.52} ${b.y} ${b.x + 8} ${b.y}`,
        );
        path.style.opacity =
          (reduced ? 1 : t) *
          mix(1, changed ? 0.72 : 0.13, distinguish) *
          (1 - closing);
        path.style.stroke =
          changed && distinguish > 0.15
            ? "#df9e88"
            : i === active
              ? "#dce3d7"
              : "#6d8079";
        path.style.strokeWidth = 1 + weights[i] * 0.7;
        const match = reduced
          ? 1
          : phase(p, r.matchStart + r.matchDuration - 0.026, 0.036);
        const dot = dots[i];
        dot.setAttribute("cx", w * 0.5);
        dot.setAttribute("cy", mix(a.y, b.y, 0.5));
        dot.style.opacity =
          match * mix(0.6, changed ? 1 : 0.16, distinguish) * (1 - closing);
        dot.style.fill = changed && distinguish > 0.15 ? "#f0ac8e" : "#b7cabc";
      });
      register.setAttribute("x1", w * 0.5);
      register.setAttribute("x2", w * 0.5);
      register.setAttribute("y1", labelHeight);
      register.setAttribute("y2", diagramHeight - 28);
      register.style.opacity =
        (reduced
          ? 0.18
          : phase(p, 0.578, 0.035) * (1 - phase(p, 0.665, 0.06)) * 0.4) *
        (1 - closing);
      el.querySelector(".papyrus-axis").style.opacity =
        (reduced ? 1 : phase(p, 0.57, 0.05)) * (1 - closing);

      const state =
        p < 0.2 ? 0 : p < 0.365 ? 1 : p < 0.625 ? 2 : p < 0.875 ? 3 : 4;
      if (state !== lastState) {
        lastState = state;
        statement.textContent = [
          "Papyrus Reader.",
          "Position is not meaning.",
          "Match the step.",
          "Keep the difference.",
          "Papyrus Reader.",
        ][state];
        chapter.textContent = [
          "Logical recipe and text comparison.",
          "Two raw positions. The same named structure.",
          "Match by node and property.",
          "Same structure. A changed value.",
          "The difference, back in context.",
        ][state];
        progressLabel.textContent = [
          "01 / Interface",
          "02 / Raw positions",
          "03 / Correspondence",
          "04 / Differences",
          "05 / Original interface",
        ][state];
      }
      const sourceLabel =
        !reduced && (p < 0.235 || p > 0.968)
          ? "Actual Papyrus Reader interface"
          : "Illustrative XML excerpt · example differences";
      if (provenance.textContent !== sourceLabel)
        provenance.textContent = sourceLabel;
      if (active >= 0) {
        const r = comparison.rows[active];
        if (lastReading !== r.id) {
          lastReading = r.id;
          reading.replaceChildren(document.createTextNode(r.property + " "));
          const values = document.createElement("b");
          values.textContent =
            r.left + (r.left === r.right ? " = " : " → ") + r.right;
          reading.append(values);
          buttons.forEach((b) =>
            b.setAttribute(
              "aria-pressed",
              String(b.dataset.difference === r.id),
            ),
          );
        }
      }
      el.dataset.papyrusState = [
        "interface",
        "raw",
        "matching",
        "difference",
        "return",
      ][state];
      return moving;
    },
  };
}
