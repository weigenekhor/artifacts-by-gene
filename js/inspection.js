// Inspection labels follow existing explanatory geometry. These are not live results.
const ns = "http://www.w3.org/2000/svg";
const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
export function createInspection(el) {
  const kind = el.dataset.feature,
    visual = el.querySelector(".study-camera"),
    svg = visual.querySelector("svg");
  const notes = {
    history: [
      "Select the event",
      "Retain the adjacent sequence",
      "Read the event in lot context",
    ],
    schedule: [
      "Choose an interval",
      "Compare the equipment lanes",
      "Keep each date with its equipment",
    ],
    usage: [
      "Select the chamber",
      "Isolate its accumulated activity",
      "Review usage across chambers",
    ],
    surface: [
      "Choose a region",
      "Extract a section through the field",
      "Retain position within the wafer",
    ],
    compare: [
      "Align equivalent steps",
      "Isolate the changed step",
      "Keep both recipes in view",
    ],
    pathfinder: [
      "Start with the workcentre",
      "Narrow the parameter context",
      "Inspect the selected chart",
    ],
    compile: [
      "Keep the source records distinct",
      "Follow the calculation structure",
      "Inspect a section of the report",
    ],
    diagnose: [
      "Observe the temperature behaviour",
      "Separate possible directions",
      "Choose a check to investigate",
    ],
    arrange: [
      "Read the input context",
      "Inspect a baseplate position",
      "Keep the arrangement in view",
    ],
    zones: [
      "Establish the shared origin",
      "Select inner and outer regions",
      "Read the boundaries together",
    ],
    configuration: [
      "Align matching properties",
      "Inspect the selected value",
      "Retain the reference and target",
    ],
    spc: [
      "Keep the equipment context",
      "Select an interval",
      "Read it across the parameter charts",
    ],
    legacy: [
      "Select the parameter",
      "Follow its chart",
      "Keep the selected state in view",
    ],
    planning: [
      "Select the equipment",
      "Locate its due date",
      "Review the planning context",
    ],
    report: [
      "Keep the LayTec records visible",
      "Follow the report structure",
      "Inspect the assembled sections",
    ],
    signals: [
      "Choose the interval",
      "Track the same point across traces",
      "Read variation in a shared time context",
    ],
  }[kind];
  const note = document.createElement("div");
  note.className = "inspection-reading";
  note.setAttribute("aria-hidden", "true");
  note.innerHTML = "<i></i><span></span>";
  visual.append(note);
  const label = note.querySelector("span");
  let corners, leader;
  const add = (tag, attr) => {
    const n = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attr)) n.setAttribute(k, v);
    svg.append(n);
    return n;
  };
  if (svg) {
    corners = add("path", {
      class: "inspection-bracket",
      fill: "none",
      "stroke-width": 1.2,
      stroke: "currentColor",
    });
    leader = add("path", {
      class: "inspection-leader",
      fill: "none",
      "stroke-width": 0.65,
      stroke: "currentColor",
    });
  }
  let last = -1;
  return (p, inspection) => {
    const amount = ease((p - 0.55) / 0.06) * (1 - ease((p - 0.77) / 0.035)),
      step = Math.min(2, Math.floor(clamp((p - 0.55) / 0.23) * 3));
    note.style.setProperty("--inspect-presence", amount);
    if (step !== last) {
      label.textContent = notes[step];
      last = step;
    }
    if (!svg) return;
    const chosen = (n) => Math.min(n - 1, Math.floor(inspection * n));
    let box;
    switch (kind) {
      case "history":
        box = [130, 68 + chosen(7) * 43, 412, 40];
        break;
      case "schedule":
        box = [146 + inspection * 360, 71, 112, 275];
        break;
      case "usage":
        box = [56 + chosen(3) * 210, 136, 188, 188];
        break;
      case "surface":
        box = [174 + inspection * 100, 180, 120, 190];
        break;
      case "pathfinder":
        box = [318 + inspection * 238, 140, 72, 185];
        break;
      case "compile":
        box = [490, 98 + chosen(6) * 16, 170, 28];
        break;
      case "diagnose":
        box = [366, [42, 137, 237, 332][chosen(4)], 235, 47];
        break;
      case "arrange":
      case "zones": {
        const a = (chosen(5) * Math.PI * 2) / 5 - Math.PI / 2,
          r = kind === "zones" ? 116 : 101,
          x = kind === "zones" ? 360 : 470;
        box = [x + Math.cos(a) * r - 62, 220 + Math.sin(a) * r - 62, 124, 124];
        break;
      }
      case "configuration":
        box = [388, 66 + chosen(6) * 48, 280, 47];
        break;
      case "spc":
        box = [78 + inspection * 466, 128, 96, 248];
        break;
      case "legacy":
        box = [35, 67 + chosen(5) * 53, 218, 47];
        break;
      case "planning":
        box = [420, 75 + chosen(4) * 68, 240, 54];
        break;
      case "report":
        box = [430, 77 + chosen(6) * 16, 220, 28];
        break;
      case "signals":
        box = [80 + inspection * 470, 62, 100, 328];
        break;
    }
    if (!box) return;
    const [x, y, w, h] = box,
      l = 12 + amount * 8;
    corners.setAttribute(
      "d",
      `M${x + l} ${y}H${x}V${y + l}M${x + w - l} ${y}H${x + w}V${y + l}M${x} ${y + h - l}V${y + h}H${x + l}M${x + w - l} ${y + h}H${x + w}V${y + h - l}`,
    );
    const vb = svg.viewBox.baseVal;
    leader.setAttribute(
      "d",
      `M${x + w / 2} ${y + h}V${Math.max(y + h, vb.height - 18)}H${vb.width * 0.45}`,
    );
    corners.style.opacity = amount * 0.85;
    leader.style.opacity = amount * 0.3;
  };
}
