// Build-time explanatory diagrams. They are concept studies, never measured output.
const text = (x, y, t, cls = "") =>
  `<text x="${x}" y="${y}" class="${cls}">${t}</text>`;
const line = (d, phase = "resolve", cls = "") =>
  `<path d="${d}" class="study-line ${cls}" pathLength="1" data-draw="${phase}"/>`;
const move = (body, x, y, phase = "gather") =>
  `<g data-move="${x},${y}" data-on="${phase}">${body}</g>`;
const reveal = (body, phase = "inspect") =>
  `<g data-reveal="${phase}">${body}</g>`;
const dot = (x, y, r = 4, cls = "") =>
  `<circle cx="${x}" cy="${y}" r="${r}" class="study-dot ${cls}"/>`;
const rect = (x, y, w, h, cls = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" class="study-box ${cls}"/>`;
const svg = (body, kind) =>
  `<div class="instrument instrument-${kind}" aria-hidden="true"><svg viewBox="0 0 720 460" class="instrument-svg">${body}</svg></div>`;
const chart = (x, y, w, h, seed = 0) =>
  Array.from(
    { length: 100 },
    (_, i) =>
      `${i ? "L" : "M"}${(x + (i * w) / 99).toFixed(1)},${(y + h * 0.5 + Math.sin(i * 0.27 + seed) * h * 0.18 + Math.sin(i * 0.95 + seed) * h * 0.08 + (i > 60 ? (i - 60) * h * 0.004 : 0)).toFixed(1)}`,
  ).join("");
const paper = (x, y, w, h) =>
  `${rect(x, y, w, h, "report-paper")}${Array.from({ length: 6 }, (_, i) => line(`M${x + 15} ${y + 22 + i * 16}H${x + w - 15 - (i % 2) * 20}`, "inspect")).join("")}`;
export function expandedVisual(f, a) {
  const k = f.kind;
  if (k === "history")
    return svg(
      `${text(55, 34, "PROCESS EVENTS")}${text(560, 34, "LOT HISTORY")}${line("M110 70V390", "gather", "axis")}${Array.from(
        { length: 7 },
        (_, i) => {
          const y = 88 + i * 43;
          return move(
            `${dot(110, y, 4, "warm")}${rect(139, y - 15, 390, 29)}${text(155, y + 4, ["Arrival", "Process start", "Deposition", "Process end", "Wafer state", "Transfer", "Duration"][i])}${line(`M350 ${y}H${435 + i * 10}`, "resolve")}`,
            i % 2 ? 110 : -90,
            ((i % 3) - 1) * 80,
          );
        },
      ).join(
        "",
      )}${reveal(`${rect(92, 191, 470, 44, "focus-band")}${text(555, 218, "In context", "warm")}`)}${line("M115 405H645", "inspect", "warm")}`,
      k,
    );
  if (k === "schedule")
    return svg(
      `${text(45, 34, "EQUIPMENT")}${text(540, 34, "SHARED SCHEDULE")}${Array.from(
        { length: 4 },
        (_, i) => {
          const y = 105 + i * 73;
          return `${text(38, y + 4, "Lane " + String(i + 1).padStart(2, "0"))}${line(`M135 ${y}H660`, "gather", "axis")}${[0, 1, 2].map((n) => move(`${rect(162 + n * 147, y - 19, 94, 38, n === i % 3 ? "warm-box" : "")}${line(`M${177 + n * 147} ${y}H${225 + n * 147}`, "inspect")}`, n * 25, (i - 1.5) * 55, "resolve")).join("")}`;
        },
      ).join(
        "",
      )}${reveal(`${line("M425 65V390", "inspect", "warm")}${text(436, 407, "Look ahead", "warm")}`)}`,
      k,
    );
  if (k === "usage")
    return svg(
      `${text(45, 34, "WAFER ACTIVITY")}${text(520, 34, "CHAMBER USAGE")}${[
        0, 1, 2,
      ]
        .map((n) => {
          const x = 150 + n * 210;
          return `${Array.from({ length: 6 }, (_, i) => move(`<ellipse cx="${x}" cy="230" rx="47" ry="15" class="wafer-event"/>`, -70 + n * 20, (i - 2.5) * 15, "gather")).join("")}<circle cx="${x}" cy="230" r="79" class="ring-track"/><circle cx="${x}" cy="230" r="79" class="usage-ring" pathLength="1" data-ring="${0.42 + n * 0.19}"/>${text(x - 39, 354, "Chamber " + String(n + 1).padStart(2, "0"))}${reveal(text(x - 42, 233, "Usage in view", "warm"))}`;
        })
        .join("")}${line("M70 395H650", "inspect", "axis")}`,
      k,
    );
  if (k === "pathfinder")
    return svg(
      `${text(38, 32, "FROM THE WORKCENTRE")}${text(475, 32, "TO THE RIGHT CHART")}${[85, 180, 275].map((y, i) => `${move(`${rect(38, y, 155, 42)}${text(52, y + 25, ["Workcentre", "Parameter group", "Chart selection"][i])}`, -50, (i - 1) * 50)}${line(`M193 ${y + 21}H255V211H302`, "resolve", i === 1 ? "warm" : "axis")}`).join("")}${reveal(`${rect(302, 75, 355, 284, "report-paper")}${text(322, 108, "Selected parameter")}${line("M330 320H631M330 320V133", "inspect", "axis")}${line(chart(332, 170, 295, 110), "inspect", "warm")}`, "resolve")}${dot(270, 211, 5, "warm")}`,
      k,
    );
  if (k === "compile")
    return svg(
      `${text(45, 32, "METROLOGY INPUTS")}${text(514, 32, "CONSISTENT OUTPUT")}${[0, 1, 2].map((i) => move(`${paper(55, 65 + i * 105, 115, 78)}${line(`M170 ${101 + i * 105}C240 ${101 + i * 105} 230 225 288 225`, "resolve")}`, -65, (i - 1) * 60)).join("")}${rect(285, 159, 128, 132, "calculation-block")}${text(310, 198, "Predefined")}${text(309, 219, "calculations")}${line("M307 247H390", "resolve", "warm")}${line("M413 225H490", "inspect", "warm")}${reveal(`${paper(490, 93, 170, 265)}${text(517, 390, "Compiled report", "warm")}`)}`,
      k,
    );
  if (k === "arrange")
    return svg(
      `${text(44, 32, "INPUTS")}${text(474, 32, "BASEPLATE ARRANGEMENT")}${[0, 1].map((i) => move(`${rect(30, 100 + i * 75, 143, 47)}${text(47, 128 + i * 75, ["Weight", "Temperature"][i])}`, -70, i * 50)).join("")}${line("M173 125C250 125 250 220 300 220M173 200H300", "resolve")}${line("M173 282H305", "inspect", "axis")}<circle cx="470" cy="220" r="154" class="ring-track"/>${Array.from(
        { length: 5 },
        (_, i) => {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2,
            x = 470 + Math.cos(angle) * 101,
            y = 220 + Math.sin(angle) * 101;
          return move(
            `<circle cx="${x}" cy="${y}" r="42" class="plate"/>${text(x - 8, y + 4, "S" + (i + 1))}${reveal(`<circle cx="${x}" cy="${y}" r="48" class="plate-ring"/>`)}`,
            -280 + (i % 2) * 60,
            (i - 2) * 30,
            "resolve",
          );
        },
      ).join("")}${text(377, 411, "Inputs remain beside the arrangement")}`,
      k,
    );
  if (k === "zones")
    return svg(
      `${text(45, 32, "INNER / OUTER REGIONS")}<g class="zone-orbit"><circle cx="360" cy="220" r="165" class="ring-track"/>${Array.from(
        { length: 5 },
        (_, i) => {
          const a = (i * Math.PI * 2) / 5 - Math.PI / 2,
            x = 360 + Math.cos(a) * 116,
            y = 220 + Math.sin(a) * 116;
          return `${move(`<circle cx="${x}" cy="${y}" r="54" class="plate"/>${text(x - 8, y + 4, "S" + (i + 1))}`, 0, 50, "gather")}${line(`M360 220L${x} ${y}`, "resolve", "zone-ray")}${reveal(`<circle cx="${x}" cy="${y}" r="${i === 2 ? 43 : 29}" class="plate-ring ${i === 2 ? "warm" : ""}"/>`)}`;
        },
      ).join(
        "",
      )}${dot(360, 220, 5, "warm")}</g>${text(45, 405, "One coordinate system")}${text(498, 405, "Every zone in relation", "warm")}`,
      k,
    );
  if (k === "configuration")
    return svg(
      `${text(52, 32, "REFERENCE")}${text(451, 32, "TARGET CONFIGURATION")}${[0, 1].map((col) => Array.from({ length: 6 }, (_, i) => move(`${rect(45 + col * 350, 72 + i * 48, 265, 35, i === 3 && col ? "warm-box" : "")}${text(59 + col * 350, 94 + i * 48, ["Property", "Name", "Type", "Value", "Setting", "Constant"][i])}${line(`M${186 + col * 350} ${90 + i * 48}H${285 + col * 350}`, "inspect", i === 3 && col ? "warm" : "")}`, col ? 60 : -60, (i % 2 ? 1 : -1) * 35, "gather")).join("")).join("")}${Array.from({ length: 6 }, (_, i) => line(`M310 ${90 + i * 48}H395`, "resolve", i === 3 ? "warm" : "axis")).join("")}${reveal(`${rect(388, 210, 280, 47, "focus-band")}${text(477, 412, "Change, with context", "warm")}`)}`,
      k,
    );
  if (k === "spc")
    return svg(
      `${text(40, 32, "GaN PROCESS CONTEXT")}${move(`${rect(35, 65, 645, 45)}${text(55, 93, "Equipment")}${text(245, 93, "Parameter")}${text(510, 93, "Chart state")}`, 0, -45)}${[0, 1].map((n) => `${line(`M60 ${264 + n * 110}H659`, "gather", "axis")}${line(chart(60, 135 + n * 110, 595, 95, n * 2), "resolve", "warm")}`).join("")}${reveal(`<rect x="385" y="130" width="100" height="245" class="focus-band"/>${line("M435 130V375", "inspect", "warm")}${text(445, 412, "Follow the detail")}`)}${text(40, 412, "Keep the process in view")}`,
      k,
    );
  if (k === "legacy")
    return svg(
      `${text(43, 32, "ESTABLISHED WORKFLOWS")}${Array.from({ length: 5 }, (_, i) => move(`${rect(40, 72 + i * 53, 207, 37, i === 2 ? "warm-box" : "")}${text(58, 96 + i * 53, "Parameter " + String.fromCharCode(65 + i))}${dot(225, 91 + i * 53, 3, i === 2 ? "warm" : "")}`, -45, (i - 2) * 16)).join("")}${line("M247 197H312", "resolve", "warm")}${reveal(`${rect(312, 86, 365, 265, "report-paper")}${text(335, 119, "Parameter chart")}${line("M337 323H650M337 323V143", "resolve", "axis")}${line(chart(340, 180, 300, 95, 2), "inspect", "warm")}`, "resolve")}${text(43, 405, "State")}${text(318, 405, "Context")}${text(585, 405, "Review", "warm")}`,
      k,
    );
  if (k === "planning")
    return svg(
      `${text(40, 32, "EQUIPMENT STATUS")}${text(451, 32, "DUE DATES")}${Array.from({ length: 4 }, (_, i) => `${move(`${rect(40, 80 + i * 68, 220, 44)}${text(60, 107 + i * 68, "Equipment " + String(i + 1).padStart(2, "0"))}${dot(237, 103 + i * 68, 4, i % 2 ? "warm" : "")}`, -60, (i - 1.5) * 30)}${move(`${rect(427, 80 + i * 68, 225, 44, i === 1 ? "warm-box" : "")}${line(`M448 ${102 + i * 68}H${524 + i * 21}`, "inspect", i === 1 ? "warm" : "")}`, 60, (1.5 - i) * 40)}${line(`M260 ${103 + i * 68}H427`, "resolve", i === 1 ? "warm" : "axis")}`).join("")}${reveal(`${line("M392 68V365", "inspect", "warm")}${text(442, 403, "Attention, before action", "warm")}`)}`,
      k,
    );
  if (k === "report")
    return svg(
      `${text(44, 32, "LAYTEC RECORDS")}${text(480, 32, "ENGINEERING REPORT")}${Array.from({ length: 9 }, (_, i) => move(`${rect(40 + (i % 2) * 23, 75 + i * 29, 205, 21)}${line(`M${60 + (i % 2) * 23} ${85 + i * 29}H${155 + (i % 2) * 23}`, "gather")}`, -60, (i - 4) * 14)).join("")}${line("M270 95C367 95 323 143 430 143M270 218H430M270 339C365 339 320 294 430 294", "resolve", "warm")}${reveal(`${paper(430, 70, 220, 315)}${text(451, 417, "A repeatable structure", "warm")}`, "resolve")}`,
      k,
    );
  if (k === "signals")
    return svg(
      `${text(44, 30, "SEPARATE PARAMETERS")}${text(465, 30, "ONE SHARED INTERVAL")}${[0, 1, 2].map((n) => move(`<g>${line(`M80 ${142 + n * 113}H662`, "gather", "axis")}${text(35, 92 + n * 113, ["Flow", "Temperature", "Motion"][n])}${line(chart(80, 84 + n * 113, 580, 58, n * 1.6), "gather", n === 1 ? "cool" : "warm")}</g>`, n % 2 ? -40 : 40, (n - 1) * 35, "resolve")).join("")}${reveal(`<rect y="63" height="327" x="100" width="160" class="focus-band" data-scan="x" data-start="100" data-end="465"/><g data-cursor="true">${line("M0 62V390", "inspect", "warm")}${[116, 229, 342].map((y) => dot(0, y, 5, "warm")).join("")}</g>${text(82, 425, "Read across the same time window", "warm")}`, "resolve")}`,
      k,
    );
  return "";
}
