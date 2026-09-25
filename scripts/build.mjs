import fs from "node:fs/promises";
import { build } from "esbuild";
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
function visual(f) {
  if (f.kind === "surface")
    return `<div class="topography" aria-hidden="true"><div class="topography-key"><span>Sample positions → contour field</span><span>Illustrative geometry</span></div><canvas></canvas><div class="topography-scale"><span>Lower</span><i></i><span>Higher</span></div></div>`;
  return `<div class="spatial-study" aria-hidden="true"><canvas></canvas></div>`;
}

let html = await fs.readFile("content/page.html", "utf8");
const story = await read("content/story.json");
html = html.replace(
  "<!-- ORIGIN PAGES -->",
  story.phases
    .map(
      (p, i) =>
        '<article class="construction-page" data-origin-phase="' +
        i +
        '"><span class="construction-label">0' +
        (i + 1) +
        " / " +
        esc(p.label) +
        "</span><h2>" +
        esc(p.title).replaceAll("\n", " ") +
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
