import fs from "node:fs/promises";
import { build } from "esbuild";
const { apps } = JSON.parse(await fs.readFile("content/apps.json", "utf8"));
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const groups = [...new Set(apps.map((a) => a.category))];
const nodes = groups
  .map(
    (group, g) =>
      `<div class="expedition" data-group="${g}"><h3>${esc(group.replace(" - ", " / "))}</h3><div class="expedition-track">${apps
        .filter((a) => a.category === group)
        .map(
          (a) =>
            `<a href="${a.evidence.full}" class="app-node" data-app="${a.id}"><span class="node-number">${String(a.index).padStart(2, "0")}</span><span class="node-name">${esc(a.name)}</span></a>`,
        )
        .join("")}</div></div>`,
  )
  .join("");
let html = await fs.readFile("content/page.html", "utf8");
html = html
  .replace("<!-- NODES -->", nodes)
  .replace(
    "<!-- SOFTWARE -->",
    apps
      .map(
        (a) =>
          `<figure class="software-frame" data-software="${a.id}" hidden><button class="software-image" data-proof="${a.id}" aria-label="Enlarge ${esc(a.name)} interface"><img data-src="${a.evidence.full}" width="${a.evidence.fullWidth}" height="${a.evidence.fullHeight}" alt="Complete ${esc(a.name)} interface" decoding="async" /></button><figcaption><span>${esc(a.name)} <span class="capture-tag">/ Actual software</span></span><button class="enlarge" data-proof="${a.id}" aria-label="Enlarge ${esc(a.name)}">View larger <span aria-hidden="true">↗</span></button></figcaption></figure>`,
      )
      .join(""),
  )
  .replace(
    "<!-- RAIL -->",
    apps
      .map(
        (a) =>
          `<a href="#app/${a.id}" data-jump="${a.id}" aria-label="${esc(a.name)}" title="${esc(a.name)}"${[4, 7, 12].includes(a.index) ? ' class="group-start"' : ""}><span>${String(a.index).padStart(2, "0")}</span></a>`,
      )
      .join(""),
  )
  .replace(
    "<!-- OPTIONS -->",
    apps
      .map(
        (a) =>
          `<option value="${a.id}">${String(a.index).padStart(2, "0")} / ${esc(a.name)}</option>`,
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
  `// Generated from content/apps.json. Edit the source catalogue.\nexport const apps = ${JSON.stringify(
    apps.map(
      ({
        id,
        index,
        name,
        category,
        purpose,
        headline,
        evidence,
        transformation,
        visualConcept,
        accent,
      }) => ({
        id,
        index,
        name,
        category,
        purpose,
        headline,
        evidence,
        transformation,
        visualConcept,
        accent,
      }),
    ),
    null,
    2,
  )};\n`,
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
// Upstream shader templates include trailing line whitespace; remove it from
// the committed generated module without changing GLSL tokens or line breaks.
await fs.writeFile(
  "script.js",
  (await fs.readFile("script.js", "utf8")).replace(/[\t ]+$/gm, ""),
);
console.log(
  "Built static HTML and one local ES module. No runtime CDN or server required.",
);
