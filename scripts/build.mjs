import { renderFilm } from "./film-markup.mjs";
import fs from "node:fs/promises";
import { build } from "esbuild";
const read = async (p) =>
  JSON.parse((await fs.readFile(p, "utf8")).replace(/^\uFEFF/, ""));
const { apps } = await read("content/apps.json"),
  features = await read("content/exhibition.json");
const homepage = await read("content/homepage.json");
const gallery = await read("content/gallery.json");
const films = await read("content/films.json");
const captureAudit = await read("assets/evidence/audit.json");
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const lines = (s) => esc(s).replaceAll("\n", "<br>");

let html = await fs.readFile("content/page.html", "utf8");
const story = await read("content/story.json");
html = html.replace(
  "<!-- ORIGIN PAGES -->",
  story.phases
    .map(
      (p) =>
        `<article class="origin-caption origin-${p.id}" data-origin-start="${p.start}" data-origin-end="${p.end}" data-origin-still="${p.still}"><div class="origin-words"><h2>${lines(p.title)}</h2>${p.text ? `<p>${esc(p.text)}</p>` : ""}</div><canvas class="origin-still" aria-hidden="true"></canvas><p class="origin-description">${esc(p.description)}</p></article>`,
    )
    .join(""),
);
html = html.replace(
  "<!-- FEATURES -->",
  features
    .map((f, i) => {
      const a = apps.find((a) => a.id === f.id);
      return renderFilm(
        a,
        f,
        films[f.kind],
        captureAudit.find((r) => r.id === a.id).region,
        esc,
      );
    })
    .join(""),
);
html = html.replace(
  "<!-- GALLERY -->",
  features
    .map((f) => {
      const app = apps.find((a) => a.id === f.id),
        card = gallery[f.kind];
      return `<a class="gallery-card ${f.kind === "surface" ? "gallery-paper" : ""}" href="${esc(app.evidence.full)}" data-film="${f.kind}" style="--accent:${card.accent}" aria-label="Explore ${esc(app.name)}"><div class="gallery-art ${f.kind === "surface" ? "topography" : ""}" aria-hidden="true"><img class="gallery-fallback" src="${esc(app.evidence.full)}" width="${app.evidence.fullWidth}" height="${app.evidence.fullHeight}" loading="lazy" alt=""><canvas class="gallery-poster"></canvas><canvas class="gallery-preview"></canvas><span class="gallery-open">↗</span></div><div class="gallery-caption"><span class="gallery-number">${f.number}</span><div><h3>${esc(app.name)}</h3><p>${esc(card.cue)}</p></div><span class="gallery-evidence">View the film ↗</span></div></a>`;
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
