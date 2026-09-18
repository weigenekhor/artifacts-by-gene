import {
  MOTION,
  preferences,
  motionAllowed,
  animate,
  wake,
  sleep,
  mix,
  ease,
  clamp,
} from "./motion.js";

// CONTENT PLACEHOLDERS: replace with verified descriptions, screenshots and
// project links. All visual studies below are synthetic, with no measured data.
export const systems = {
  gan: {
    title: "GaN Temp Diagnoser",
    category: "SEMICONDUCTOR ENGINEERING",
    id: "A—01",
    label: "THERMAL / PROFILE STUDY",
    left: "PROFILE",
    right: "RESPONSE",
    description:
      "Part of the ARTIFACTS semiconductor engineering collection. A detailed walkthrough, verified capabilities, and selected interface views will be added here.",
  },
  aix: {
    title: "AIX ΔT Assistant",
    category: "SEMICONDUCTOR ENGINEERING",
    id: "A—02",
    label: "DELTA / DEVIATION STUDY",
    left: "REFERENCE",
    right: "DEVIATION",
    description:
      "A system in the ARTIFACTS semiconductor engineering collection. Project context, verified functionality, and selected examples will be documented here.",
  },
  lt: {
    title: "LT Zone Assistant",
    category: "SEMICONDUCTOR ENGINEERING",
    id: "A—03",
    label: "ZONES / DISTRIBUTION STUDY",
    left: "ZONES",
    right: "BALANCE",
    description:
      "One of the engineering tools that make up ARTIFACTS. A closer look at its purpose, interface, and verified capabilities is planned for this profile.",
  },
  anko: {
    title: "ANKO Helper",
    category: "ENGINEERING SOFTWARE",
    id: "A—04",
    label: "PROCESS / WORKFLOW STUDY",
    left: "INPUT",
    right: "OUTPUT",
    description:
      "Part of Gene’s ARTIFACTS software ecosystem. A project walkthrough, verified feature overview, and interface views will be added as the collection is documented.",
  },
};

function initializeDiagram() {
  const container = document.querySelector(".system-diagram");
  const svg = container.querySelector("svg");
  const primary = svg.querySelector("#diagram-primary");
  const secondary = svg.querySelector("#diagram-secondary");
  const area = svg.querySelector("#diagram-area");
  const point = svg.querySelector("#diagram-point");
  const guide = svg.querySelector(".diagram-guide");
  const namespace = "http://www.w3.org/2000/svg";
  const create = (tag, attributes, parent = svg) => {
    const node = document.createElementNS(namespace, tag);
    for (const [key, value] of Object.entries(attributes))
      node.setAttribute(key, value);
    parent.append(node);
    return node;
  };
  const zonesGroup = create("g", { class: "zone-study", opacity: 0 });
  const zoneHeights = [95, 144, 119, 161, 128, 105];
  const zones = zoneHeights.map((height, index) => {
    const group = create("g", {}, zonesGroup);
    create(
      "rect",
      {
        x: 75 + index * 78,
        y: 280 - height,
        width: 36,
        height,
        class: "zone-column",
      },
      group,
    );
    create(
      "path",
      { d: `M${71 + index * 78} ${280 - height}h44`, class: "zone-cap" },
      group,
    );
    return group;
  });
  const deltaGroup = create("g", { class: "delta-study", opacity: 0 });
  const deltaLines = [110, 190, 270, 350, 430, 510].map((x) =>
    create("path", { class: "delta-stem", d: `M${x} 160v0` }, deltaGroup),
  );
  const workflowGroup = create("g", { class: "workflow-study", opacity: 0 });
  create(
    "path",
    { d: "M180 160V230H450V160", class: "workflow-branch", pathLength: 1 },
    workflowGroup,
  );
  const nodes = [
    [70, 160],
    [180, 160],
    [280, 105],
    [390, 105],
    [450, 160],
    [540, 160],
  ].map(([x, y], index) => {
    const group = create(
      "g",
      { transform: `translate(${x} ${y})` },
      workflowGroup,
    );
    create(
      index === 2 ? "path" : "rect",
      index === 2
        ? { d: "M0-11 11 0 0 11-11 0Z", class: "workflow-node" }
        : { x: -9, y: -9, width: 18, height: 18, class: "workflow-node" },
      group,
    );
    create("circle", { r: 2, class: "workflow-core" }, group);
    return group;
  });
  const probe = create("g", { class: "diagram-probe", opacity: 0 });
  const probeLine = create("path", { d: "M300 40V280" }, probe);
  const probeDot = create("circle", { cx: 300, cy: 160, r: 4 }, probe);
  const pointHalo = create("circle", {
    cx: 0,
    cy: 0,
    r: 9,
    class: "diagram-halo",
  });
  // Equal sample counts allow interpolation through interrupted transitions.
  // New inputs always begin at the currently shown geometry.
  const sampleCount = 81;
  const study = (key) => {
    const primary = [],
      secondary = [];
    for (let i = 0; i < sampleCount; i++) {
      const t = i / (sampleCount - 1),
        x = 50 + t * 500;
      let y, y2;
      if (key === "gan") {
        y = 245 - 166 * (t * t * (3 - 2 * t)) + Math.sin(t * Math.PI * 5) * 9;
        y2 = y + 22 + Math.sin(t * Math.PI) * 18;
      }
      if (key === "aix") {
        y = 160 + Math.sin(t * Math.PI * 3.2) * 47 * (0.8 - 0.3 * t);
        y2 = 160;
      }
      if (key === "lt") {
        y = 280 - zoneHeights[Math.min(5, Math.floor(t * 6))];
        y2 = 153;
      }
      if (key === "anko") {
        const anchors = [
          [0, 160],
          [0.26, 160],
          [0.46, 105],
          [0.68, 105],
          [0.8, 160],
          [1, 160],
        ];
        const end = anchors.findIndex(([at]) => at >= t);
        const a = anchors[Math.max(0, end - 1)],
          b = anchors[Math.max(0, end)];
        y = mix(a[1], b[1], b[0] === a[0] ? 0 : (t - a[0]) / (b[0] - a[0]));
        y2 = y;
      }
      primary.push([x, y]);
      secondary.push([x, y2]);
    }
    return {
      primary,
      secondary,
      zones: key === "lt" ? 1 : 0,
      delta: key === "aix" ? 1 : 0,
      workflow: key === "anko" ? 1 : 0,
      area: key === "anko" ? 0 : 1,
      line: key === "lt" ? 0.28 : 1,
    };
  };
  let current = study("gan"),
    from = current,
    target = current;
  let transition = 1,
    visible = false,
    phase = 0,
    key = "gan";
  let probeTarget = 0.5,
    probePosition = 0.5,
    probeVisible = false,
    bounds;
  const path = (points) =>
    points
      .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`)
      .join("");
  const interpolate = (a, b, t) => ({
    primary: a.primary.map((p, i) => [
      mix(p[0], b.primary[i][0], t),
      mix(p[1], b.primary[i][1], t),
    ]),
    secondary: a.secondary.map((p, i) => [
      mix(p[0], b.secondary[i][0], t),
      mix(p[1], b.secondary[i][1], t),
    ]),
    ...Object.fromEntries(
      ["zones", "delta", "workflow", "area", "line"].map((name) => [
        name,
        mix(a[name], b[name], t),
      ]),
    ),
  });
  function geometry() {
    primary.setAttribute("d", path(current.primary));
    primary.style.opacity = current.line;
    secondary.setAttribute("d", path(current.secondary));
    secondary.style.opacity = 1 - current.workflow;
    area.setAttribute(
      "d",
      `${path(current.primary)}${path([...current.secondary].reverse()).replace("M", "L")}Z`,
    );
    area.style.opacity = current.area;
    zonesGroup.style.opacity = current.zones;
    deltaGroup.style.opacity = current.delta;
    workflowGroup.style.opacity = current.workflow;
    guide.style.opacity = 1 - current.workflow * 0.7;
    zones.forEach((group, index) =>
      group.setAttribute(
        "transform",
        `translate(0 ${mix(30, 0, current.zones) * (1 + index * 0.1)})`,
      ),
    );
    deltaLines.forEach((line, index) => {
      const x = 110 + index * 80;
      const y =
        current.primary[Math.round(((x - 50) / 500) * (sampleCount - 1))][1];
      line.setAttribute("d", `M${x} 160V${y.toFixed(2)}m-4 0h8`);
    });
  }
  function positionAt(t) {
    const index = clamp(t) * (sampleCount - 1),
      a = Math.floor(index),
      b = Math.min(sampleCount - 1, a + 1);
    return [
      mix(current.primary[a][0], current.primary[b][0], index - a),
      mix(current.primary[a][1], current.primary[b][1], index - a),
    ];
  }
  function render(delta) {
    if (!visible) return false;
    const moving = motionAllowed();
    if (transition < 1) {
      transition = moving
        ? Math.min(1, transition + delta / (MOTION.morph / 1000))
        : 1;
      current = interpolate(from, target, ease(transition));
      geometry();
    }
    if (moving) phase = (phase + delta * 0.065) % 1;
    const [x, y] = positionAt(moving ? phase : 0.5);
    point.setAttribute("cx", x.toFixed(2));
    point.setAttribute("cy", y.toFixed(2));
    pointHalo.setAttribute(
      "transform",
      `translate(${x.toFixed(2)} ${y.toFixed(2)})`,
    );
    const flowOpacity = moving ? clamp(Math.min(phase, 1 - phase) * 18) : 1;
    pointHalo.style.opacity = key === "lt" ? "0" : String(flowOpacity * 0.5);
    point.style.opacity = key === "lt" ? "0" : String(flowOpacity);
    probePosition = moving
      ? mix(probePosition, probeTarget, 1 - Math.exp(-delta * 14))
      : probeTarget;
    const [px, py] = positionAt(probePosition);
    probeLine.setAttribute("d", `M${px.toFixed(2)} 40V280`);
    probeDot.setAttribute("cx", px.toFixed(2));
    probeDot.setAttribute("cy", py.toFixed(2));
    probe.style.opacity = probeVisible ? "1" : "0";
    nodes.forEach((node, index) =>
      node.classList.toggle(
        "is-lit",
        key === "anko" &&
          (moving ? Math.floor(phase * 6) === index : index === 2),
      ),
    );
    zones.forEach((zone, index) =>
      zone.classList.toggle(
        "is-lit",
        key === "lt" &&
          (moving ? Math.floor(phase * 6) === index : index === 2),
      ),
    );
    return moving || transition < 1;
  }
  container.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse" || !preferences.pointer) return;
    bounds = svg.getBoundingClientRect();
    probeVisible = true;
    wake(render);
  });
  container.addEventListener(
    "pointermove",
    (event) => {
      if (!bounds || !preferences.pointer) return;
      probeTarget = clamp(
        (((event.clientX - bounds.left) / bounds.width) * 600 - 50) / 500,
      );
      wake(render);
    },
    { passive: true },
  );
  container.addEventListener("pointerleave", () => {
    probeVisible = false;
    bounds = null;
    wake(render);
  });
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) wake(render);
      else sleep(render);
    },
    { threshold: 0 },
  ).observe(container);
  window.addEventListener("artifacts:motion", () => wake(render));
  geometry();
  return (nextKey) => {
    key = nextKey;
    container.dataset.mode = key;
    from = current;
    target = study(key);
    transition = 0;
    if (!motionAllowed() || !visible) {
      current = target;
      transition = 1;
      geometry();
    }
    wake(render);
  };
}

export function initializeSystems() {
  const tabs = [...document.querySelectorAll(".system-tab")];
  const selector = document.querySelector(".system-selector");
  const panel = document.querySelector("#system-panel");
  const changeDiagram = initializeDiagram();
  const indicator = document.createElement("span");
  indicator.className = "system-indicator";
  indicator.setAttribute("aria-hidden", "true");
  selector.append(indicator);
  let active = "gan",
    hoverTimer = 0,
    contentAnimation;
  function moveIndicator() {
    const tab = tabs.find((tab) => tab.dataset.system === active);
    const previous = indicator.getBoundingClientRect();
    indicator.style.width = `${preferences.compact ? tab.offsetWidth : 2}px`;
    indicator.style.height = `${preferences.compact ? 2 : tab.offsetHeight}px`;
    indicator.style.left = `${tab.offsetLeft}px`;
    indicator.style.top = `${tab.offsetTop}px`;
    const next = indicator.getBoundingClientRect();
    if (previous.width && previous.height)
      animate(
        indicator,
        [
          {
            transform: `translate(${previous.left - next.left}px,${previous.top - next.top}px)`,
          },
          { transform: "none" },
        ],
        { duration: MOTION.state },
      );
  }
  function select(key, focus = false) {
    clearTimeout(hoverTimer);
    const changed = key !== active;
    active = key;
    tabs.forEach((tab) => {
      const selected = tab.dataset.system === key;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus({ preventScroll: true });
    });
    if (!changed) return;
    const system = systems[key];
    panel.setAttribute("aria-labelledby", `tab-${key}`);
    for (const [id, value] of Object.entries({
      "panel-title": system.title,
      "panel-description": system.description,
      "panel-id": system.id,
      "panel-category": system.category,
      "diagram-label": system.label,
      "diagram-left": system.left,
      "diagram-right": system.right,
    }))
      document.getElementById(id).textContent = value;
    contentAnimation?.cancel();
    contentAnimation = animate(
      panel.querySelector(".panel-content"),
      [
        { clipPath: "inset(0 0 100% 0)", transform: "translateY(9px)" },
        { clipPath: "inset(0 0 0 0)", transform: "none" },
      ],
      { duration: MOTION.state },
    );
    changeDiagram(key);
    moveIndicator();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab.dataset.system));
    tab.addEventListener("pointerenter", (event) => {
      if (
        event.pointerType !== "mouse" ||
        !preferences.pointer ||
        document.activeElement.closest('[role="tablist"]')
      )
        return;
      hoverTimer = setTimeout(() => select(tab.dataset.system), MOTION.fast);
    });
    tab.addEventListener("pointerleave", () => clearTimeout(hoverTimer));
    tab.addEventListener("keydown", (event) => {
      const moves = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      let next;
      if (event.key in moves)
        next = (index + moves[event.key] + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next].dataset.system, true);
    });
  });
  new ResizeObserver(moveIndicator).observe(selector);
  window.addEventListener("artifacts:motion", () =>
    selector.setAttribute(
      "aria-orientation",
      preferences.compact ? "horizontal" : "vertical",
    ),
  );
  selector.setAttribute(
    "aria-orientation",
    preferences.compact ? "horizontal" : "vertical",
  );
  const dialog = document.querySelector("#project-dialog");
  document.querySelector("#open-project").addEventListener("click", () => {
    const system = systems[active];
    document.querySelector("#dialog-title").textContent = system.title;
    document.querySelector("#dialog-description").textContent =
      system.description;
    document.querySelector("#dialog-id").textContent = system.id;
    dialog.showModal();
    animate(dialog, [
      { opacity: 0, transform: "translateY(12px) scale(.99)" },
      { opacity: 1, transform: "none" },
    ]);
  });
  document
    .querySelector(".dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
}
