import fs from "node:fs/promises";
import { build } from "esbuild";
const { apps } = JSON.parse(await fs.readFile("content/apps.json", "utf8"));
const story = JSON.parse(await fs.readFile("content/story.json", "utf8"));
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const lines = (s) =>
  esc(s)
    .split("\n")
    .map((t) => `<span class="type-line"><span>${t}</span></span>`)
    .join("");
const groups = [...new Set(apps.map((a) => a.category))];
let html = await fs.readFile("content/page.html", "utf8");
html = html
  .replace(
    "<!-- SCENES -->",
    story
      .map(
        (s, i) =>
          `<article class="scene scene-${s.layout}" data-scene="${i}" id="${s.id}"><p class="eyebrow">${esc(s.eyebrow)}</p><${i ? "h2" : "h1"}>${lines(s.title)}</${i ? "h2" : "h1"}><p class="scene-text">${lines(s.text)}</p></article>`,
      )
      .join(""),
  )
  .replace(
    "<!-- GROUPS -->",
    groups
      .map(
        (g, i) =>
          `<button data-group="${i}" aria-pressed="${i === 0}"><span>0${i + 1}</span> ${esc(g.split(" - ")[1])}</button>`,
      )
      .join(""),
  )
  .replace(
    "<!-- NODES -->",
    apps
      .map(
        (a) =>
          `<button class="app-node" data-app="${a.id}" data-group="${groups.indexOf(a.category)}" aria-label="${esc(a.name)}: ${esc(a.description)}"><span class="node-number">${String(a.index).padStart(2, "0")}</span><span class="node-title">${esc(a.name)}</span><span class="node-purpose">${esc(a.description)}</span></button>`,
      )
      .join(""),
  )
  .replace(
    "<!-- SOFTWARE -->",
    apps
      .map(
        (a) =>
          `<figure class="software-frame" data-software="${a.id}"><button data-proof="${a.id}" aria-label="Inspect ${esc(a.name)}"><img data-src="${a.evidence.src}" width="${a.evidence.width}" height="${a.evidence.height}" alt="${esc(a.evidence.label)} in ${esc(a.name)}" decoding="async"></button><figcaption>${esc(a.evidence.label)} <span>View complete interface ↗</span></figcaption></figure>`,
      )
      .join(""),
  )
  .replace(
    "<!-- OPTIONS -->",
    apps.map((a) => `<option value="${a.id}">${esc(a.name)}</option>`).join(""),
  )
  .replace(
    "<!-- CHAPTERS -->",
    [0, 2, 4, 5, 7, 9, 11, 12, 13]
      .map(
        (i) =>
          `<a href="#${story[i].id}" data-chapter="${i}" aria-label="${esc(story[i].eyebrow)}"><span></span></a>`,
      )
      .join(""),
  )
  .replace(
    "<!-- CATALOGUE -->",
    groups
      .map(
        (g) =>
          `<h3>${esc(g)}</h3><ul>${apps
            .filter((a) => a.category === g)
            .map(
              (a) =>
                `<li><a href="${a.evidence.full}">${esc(a.name)}</a> — ${esc(a.purpose)}</li>`,
            )
            .join("")}</ul>`,
      )
      .join(""),
  );
await fs.writeFile("index.html", html);
await fs.writeFile(
  "js/apps.js",
  `// Generated from the verified catalogue.\nexport const apps = ${JSON.stringify(
    apps.map(
      ({
        id,
        index,
        name,
        category,
        description,
        purpose,
        headline,
        evidence,
        transformation,
        visualConcept,
        relationships,
      }) => ({
        id,
        index,
        name,
        category,
        description,
        purpose,
        headline,
        evidence,
        transformation,
        visualConcept,
        relationships,
      }),
    ),
    null,
    2,
  )};\nexport const story = ${JSON.stringify(story, null, 2)};\n`,
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
await fs.writeFile(
  "script.js",
  (await fs.readFile("script.js", "utf8")).replace(/[\t ]+$/gm, ""),
);
console.log("Built the continuous static ARTIFACTS experience.");
