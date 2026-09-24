import fs from "node:fs/promises";
import { build } from "esbuild";
import { contourSegments } from "../js/contours.js";
import { evidenceField } from "./evidence-field.mjs";
import { expandedVisual } from "./study-visuals.mjs";
const read = async (p) =>
  JSON.parse((await fs.readFile(p, "utf8")).replace(/^\uFEFF/, ""));
const { apps } = await read("content/apps.json"),
  features = await read("content/exhibition.json");
const homepage = await read("content/homepage.json");
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const lines = (s) => esc(s).replaceAll("\n", "<br>");
const number = (n) => String(n).padStart(2, "0");
const image = (a, full = false) =>
  `<img src="${full ? a.evidence.full : a.evidence.src}" width="${full ? a.evidence.fullWidth : a.evidence.width}" height="${full ? a.evidence.fullHeight : a.evidence.height}" alt="${esc(a.evidence.label)} in ${esc(a.name)}" loading="lazy" decoding="async">`;
function sceneLayers(a) {
  return (
    '<div class="study-source" aria-hidden="true">' +
    [0, 1, 2]
      .map(
        (i) =>
          '<div class="source-slice" style="--slice:' +
          i +
          '">' +
          image(a, true) +
          "</div>",
      )
      .join("") +
    '<div class="source-activation"></div><span>' +
    esc(a.name) +
    "</span></div>"
  );
}
function visual(f, a) {
  const extended = expandedVisual(f, a);
  if (extended) return extended;
  if (f.kind === "compare")
    return `<div class="comparison" aria-hidden="true"><div class="compare-labels"><span>Reference recipe</span><span>Compared recipe</span></div><div class="compare-columns">${[0, 1].map((col) => `<div class="recipe-column">${Array.from({ length: 7 }, (_, i) => `<div class="recipe-step ${i === 3 ? "changed" : ""}" style="--row:${i};--shift:${col ? [2, -1, 3, -2, 1, -3, 0][i] : 0}"><span>${number(i + 1)}</span><i style="width:${[64, 43, 70, 52, 38, 58, 46][i]}%"></i><b></b></div>`).join("")}</div>`).join("")}</div><div class="compare-guide"><span>Equivalent steps aligned</span><span class="changed-key">Difference retained</span></div></div>`;
  if (f.kind === "surface") {
    const field = (x, y) =>
      0.72 * Math.exp(-((x - 0.75) ** 2 + (y + 0.2) ** 2) * 0.7) -
      0.4 * Math.exp(-((x + 1.1) ** 2 + (y - 0.65) ** 2) * 1.3) +
      0.16 * Math.sin(x * 1.4 + y);
    const c = contourSegments(field);
    let path = "";
    for (let i = 0; i < c.length; i += 6)
      path += `M${(300 + c[i] * 82).toFixed(2)},${(300 + c[i + 1] * 82).toFixed(2)}L${(300 + c[i + 3] * 82).toFixed(2)},${(300 + c[i + 4] * 82).toFixed(2)}`;
    return `<div class="surface-object" aria-hidden="true"><div class="surface-shadow"></div><svg class="surface-map" viewBox="0 0 600 600"><defs><radialGradient id="wafer-light" cx="66%" cy="30%"><stop stop-color="#ac794e"/><stop offset=".38" stop-color="#4c3f32"/><stop offset="1" stop-color="#181b19"/></radialGradient></defs><circle class="wafer-base" cx="300" cy="300" r="228" fill="url(#wafer-light)"/><circle cx="300" cy="300" r="230" fill="none" stroke="#b1a48c" stroke-opacity=".35"/><path class="contours" d="${path}" fill="none" stroke="#e5cda6" stroke-width=".8"/>${Array.from(
      { length: 49 },
      (_, i) => {
        const x = ((i % 7) - 3) * 53,
          y = (Math.floor(i / 7) - 3) * 53;
        return Math.hypot(x, y) < 217
          ? `<circle class="sample-dot" cx="${300 + x}" cy="${300 + y}" r="2" fill="#ece4d3"/>`
          : "";
      },
    ).join(
      "",
    )}<path d="M65 300H535M300 65V535" stroke="#d3b78d" stroke-opacity=".18" stroke-width=".6"/></svg><span class="surface-label label-a">Discrete measurements</span><span class="surface-label label-b">Continuous understanding</span></div>`;
  }
  if (f.kind === "diagnose")
    return `<div class="diagnosis-object" aria-hidden="true"><svg viewBox="0 0 700 430"><defs><linearGradient id="path-light"><stop stop-color="#e7b17c"/><stop offset="1" stop-color="#8da092"/></linearGradient></defs><g class="diagnosis-paths" fill="none" stroke="#49504a">${[70, 165, 265, 360].map((y, i) => `<path d="M80 215H190C260 215 260 ${y} 325 ${y}H585"/>`).join("")}</g><path class="diagnosis-route" d="M80 215H190C260 215 260 165 325 165H585" fill="none" stroke="url(#path-light)" stroke-width="2" pathLength="1"/><circle cx="80" cy="215" r="8" fill="#d6b086"/>${[70, 165, 265, 360].map((y, i) => `<circle cx="585" cy="${y}" r="5" fill="${i === 1 ? "#d6b086" : "#49504a"}"/>`).join("")}<g fill="#b5bcb3" font-family="Geist,Arial" font-size="12"><text x="65" y="251">Observed drift</text><text x="380" y="53">Temperature behavior</text><text x="380" y="148" fill="#dfbd96">Recommended checks</text><text x="380" y="248">Process observations</text><text x="380" y="343">Other possibilities</text></g></svg></div>`;
  return `<div class="signal-object" aria-hidden="true">${[0, 1, 2].map((n) => `<div class="signal-plane" style="--plane:${n}"><span>Shared equipment context <i>0${n + 1}</i></span>${image(a)}<div class="signal-crosshair"></div></div>`).join("")}</div>`;
}
let html = await fs.readFile("content/page.html", "utf8");
const story = await read("content/story.json");
html = html.replace(
  "<!-- ORIGIN PAGES -->",
  story.phases
    .map(
      (p, i) =>
        '<article class="origin-page" data-origin-phase="' +
        i +
        '"><span class="origin-label">0' +
        (i + 1) +
        " / " +
        esc(p.label) +
        "</span><h2>" +
        lines(p.title) +
        "</h2><p>" +
        esc(p.text) +
        "</p></article>",
    )
    .join(""),
);
html = html.replace(
  "<!-- ORIGIN CONTROLS -->",
  story.phases
    .map(
      (p, i) =>
        '<button data-origin-step="' +
        i +
        '"><span>0' +
        (i + 1) +
        "</span>" +
        esc(p.label) +
        "</button>",
    )
    .join(""),
);
html = html.replace("<!-- EVIDENCE FIELD -->", evidenceField());
html = html.replace(
  "<!-- FEATURES -->",
  features
    .map((f, i) => {
      const a = apps.find((a) => a.id === f.id),
        next = features[i + 1];
      return `<section class="feature feature-${f.kind}${f.paper ? " feature-paper" : ""}" id="${f.kind}" style="--scene-length:${f.duration}svh" data-feature="${f.kind}" data-timings="${f.timings.join(",")}" data-study-app="${a.id}" data-beats="${esc(JSON.stringify(f.beats))}" aria-labelledby="title-${f.kind}"><div class="feature-stage"><div class="feature-top"><span>${f.number} / 16</span><span>${esc(a.name)}</span><button class="study-menu" aria-haspopup="dialog" aria-controls="study-picker">Choose an application ↗</button></div><div class="feature-copy"><p class="eyebrow">${esc(a.description)}</p><h2 id="title-${f.kind}">${lines(f.title)}</h2><p>${esc(f.text)}</p><div class="feature-verbs">${f.verbs.map((v, i) => `<span data-phase="${i}">${v}</span>`).join("<i>→</i>")}</div><p class="study-beat">${esc(f.beats[0])}</p></div><div class="feature-visual"><div class="study-camera">${visual(f, a)}</div><div class="focus-caption"><span>${esc(f.focusLabel)}</span><output class="focus-position">01</output></div></div>${sceneLayers(a)}<button class="evidence" data-capture="${a.id}" aria-label="See the actual ${esc(a.name)} interface">${image(a, true)}<span><b>Inside ${esc(a.name)}</b><i>↗</i></span></button><div class="study-actions"><label class="study-focus">${esc(f.focusLabel)}<input type="range" min="0" max="100" value="50" class="focus-range" aria-label="Inspect ${esc(f.focusLabel)} in the concept demonstration"></label><button class="study-play" aria-label="Play the ${esc(a.name)} sequence" aria-pressed="false"><span aria-hidden="true">▷</span> Watch sequence</button></div><label class="study-control"><span>Explore the sequence <b>↔</b></span><input type="range" min="0" max="100" value="0" aria-label="Explore ${esc(a.name)} concept motion"></label><div class="study-state" aria-hidden="true"><span class="state-number">01 / 07</span><span class="state-name">Identity</span></div><div class="study-timeline" aria-hidden="true"><i></i></div><div class="feature-foot"><span>Illustrative sequence · actual interface ↗</span><a href="#${next ? next.kind : "gene"}">Next / ${esc(next ? f.handoff : "A note from Gene")} <b>↓</b></a></div></div></section>`;
    })
    .join(""),
);
html = html.replace(
  "<!-- STUDY OPTIONS -->",
  features
    .map(
      (f) =>
        `<option value="${f.kind}">${f.number} — ${esc(apps.find((a) => a.id === f.id).name)}</option>`,
    )
    .join(""),
);
html = html.replace(
  "<!-- PICKER -->",
  features
    .map((f, i) => {
      const a = apps.find((a) => a.id === f.id);
      return (
        '<a href="#' +
        f.kind +
        '" data-study-jump="' +
        f.kind +
        '"><span>' +
        number(i + 1) +
        "</span><div><b>" +
        esc(a.name) +
        "</b><small>" +
        esc(a.description) +
        '</small></div><i aria-hidden="true">↗</i></a>'
      );
    })
    .join(""),
);
await fs.writeFile("index.html", html.replace(/^\uFEFF/, ""));
await fs.writeFile(
  "js/apps.js",
  `// Generated from the verified source catalogue.\nexport const homepage=${JSON.stringify(homepage)};\nexport const apps=${JSON.stringify(apps.map(({ id, index, name, category, description, purpose, evidence, headline }) => ({ id, index, name, category, description, purpose, evidence, headline })))};`,
);
await build({
  entryPoints: ["js/experience.js"],
  bundle: true,
  format: "esm",
  minify: true,
  target: ["es2022"],
  outfile: "script.js",
  legalComments: "eof",
});
console.log("Built ARTIFACTS software exhibition.");
