import fs from "node:fs";
import { geometry } from "../js/geometry.js";
import { SCENES } from "../js/tokens.js";
const { apps, workflows } = JSON.parse(
  fs.readFileSync("content/apps.json", "utf8"),
);
const esc = (s) =>
  String(s).replace(
    /[&<>\"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const defaults = { observe: 3, compare: 4, diagnose: 7, coordinate: 15 };
const publicApps = apps.map(
  ({
    id,
    name,
    index,
    category,
    workflow,
    purpose,
    visualConcept,
    shortNarrative,
    transformation,
    accent,
    relationships,
  }) => ({
    id,
    name,
    index,
    category,
    workflow,
    purpose,
    visualConcept,
    shortNarrative,
    transformation,
    accent,
    relationships,
  }),
);
const fragments = {
  REAL_LOGO: fs
    .readFileSync("assets/brand/artifacts-symbol.svg", "utf8")
    .replace("<svg ", '<svg class="hero-mark" aria-hidden="true" '),
  PROGRESS: SCENES.map(
    (s, i) =>
      `<a href="#${s.id}" aria-label="${esc(s.name)}"><span>${String(i).padStart(2, "0")}</span><i></i><b>${esc(s.name)}</b></a>`,
  ).join(""),
  NODES: apps
    .map(
      (a, i) =>
        `<button class="system-node" data-app="${i}" aria-label="Explore ${esc(a.name)}"><span>${String(i + 1).padStart(2, "0")}</span><i></i><b>${esc(a.name)}</b></button>`,
    )
    .join(""),
};
for (const workflow of workflows) {
  const list = apps.filter((a) => a.workflow === workflow.id),
    active = apps[defaults[workflow.id]];
  fragments[workflow.id.toUpperCase()] =
    `<div class="chapter-instrument"><div class="instrument-heading"><span class="eyebrow">THE TOOL BEHIND THE IDEA</span><span class="instrument-count">${list.length} RELATED APPLICATIONS</span></div><div class="instrument-summary"><h3>${esc(active.name)}</h3><p>${esc(active.purpose)}</p></div><div class="chapter-apps" aria-label="${workflow.name} applications">${list.map((a) => `<button data-chapter-app="${a.index - 1}" aria-pressed="${a.id === active.id}">${esc(a.name)}</button>`).join("")}</div><label class="concept-control"><span>Explore the form</span><input type="range" min="0" max="100" value="80" aria-label="Explore ${workflow.name.toLowerCase()} visualization"></label><p class="concept-note">Illustration of the workflow. Not a process simulation.</p></div>`;
}
fragments.DIRECTORY = [...new Set(apps.map((a) => a.category))]
  .map(
    (category) =>
      `<div class="directory-group"><h3>${esc(category.replace(" - ", " / "))}</h3>${apps
        .filter((a) => a.category === category)
        .map(
          (a) =>
            `<article id="app-${a.id}"><a href="#universe" data-directory-app="${a.index - 1}"><span>${String(a.index).padStart(2, "0")}</span><h4>${esc(a.name)}</h4><i aria-hidden="true">↗</i></a><p>${esc(a.purpose)}</p></article>`,
        )
        .join("")}</div>`,
  )
  .join("");
let html = fs.readFileSync("content/page.html", "utf8");
for (const [key, value] of Object.entries(fragments))
  html = html.replace(`<!-- ${key} -->`, value);
html = html.replaceAll(
  'class="app-total">16',
  'class="app-total">' + apps.length,
);
fs.writeFileSync("index.html", html);
fs.writeFileSync(
  "js/apps.js",
  "// Generated from content/apps.json.\nexport const apps = " +
    JSON.stringify(publicApps, null, 2) +
    ";\n",
);
fs.mkdirSync("assets/concepts", { recursive: true });
const concepts = [
  ...new Set([
    ...SCENES.map((s) => s.shape),
    ...apps.map((a) => a.visualConcept),
  ]),
];
for (const kind of concepts) {
  const g = geometry(kind, apps, 32, 64, 0.85);
  let paths = "";
  for (let row = 0; row < 32; row++) {
    let d = "";
    for (let c = 0; c <= 64; c++) {
      const k = (row * 65 + c) * 6;
      let x = (g.positions[k] + g.positions[k + 3]) / 2,
        y = (g.positions[k + 1] + g.positions[k + 4]) / 2,
        z = (g.positions[k + 2] + g.positions[k + 5]) / 2;
      if (["material", "topology", "zones"].includes(kind)) {
        const yy = y;
        y = y * 0.55 - z * 0.65;
        z = yy * 0.65 + z * 0.55;
      }
      const xx = x * 0.96 + z * 0.18;
      d +=
        (c ? "L" : "M") +
        (500 + xx * 120).toFixed(1) +
        "," +
        (310 - y * 110).toFixed(1);
    }
    paths += `<path d="${d}" stroke="${row % 9 === 0 ? "#c28b68" : "#808f93"}" opacity="${row % 9 === 0 ? 0.8 : 0.55}"/>`;
  }
  fs.writeFileSync(
    `assets/concepts/${kind}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 620" fill="none" stroke-width="1.2"><title>Synthetic ${kind} visualization</title>${paths}</svg>`,
  );
}
console.log(
  `Built ${apps.length} real apps, ${workflows.length} workflow lenses and ${concepts.length} procedural fallbacks.`,
);
