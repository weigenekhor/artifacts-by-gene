import fs from "node:fs/promises";
import { createHash } from "node:crypto";
const { apps } = JSON.parse(await fs.readFile("content/apps.json", "utf8"));
const expeditions = JSON.parse(await fs.readFile("content/expeditions.json", "utf8"));
const homepage = JSON.parse(await fs.readFile("content/homepage.json", "utf8"));
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const gallerySizes = "(min-width: 1568px) 696px, (min-width: 1440px) calc((100vw - 176px)/2), (min-width: 1024px) calc((100vw - 136px)/2), (min-width: 768px) calc(100vw - 64px), (max-width: 359px) calc(100vw - 32px), calc(100vw - 40px)";
const versioned = (src, capture) => `${src}?v=${capture.sourceSha256.slice(0,10)}`;
const image = (capture, alt, imageSizes, priority = false) => `<img src="${escape(versioned(capture.sources.find(s => s.width === 1120)?.src || capture.src, capture))}" srcset="${capture.sources.map(s => `${escape(versioned(s.src, capture))} ${s.width}w`).join(", ")}" sizes="${imageSizes}" width="${capture.width}" height="${capture.height}" alt="${escape(alt)}" loading="${priority ? "eager" : "lazy"}" ${priority ? 'fetchpriority="high" ' : ''}decoding="async">`;
const arrow = '<svg class="open-mark" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12 12 4M4 4h8v8" stroke="currentColor" stroke-width="1.25"/></svg>';
if (apps.length !== 16 || apps.some((a, i) => a.index !== i + 1)) throw Error("Expected sixteen applications in canonical order.");
if (expeditions.flatMap(e => e.apps).join() !== apps.map(a => a.id).join()) throw Error("Expedition order does not match the catalogue.");
const article = app => `<article class="application" id="${app.id}" aria-labelledby="${app.id}-title">
          <header class="application-header"><span class="application-number">${String(app.index).padStart(2, "0")}</span><h3 id="${app.id}-title">${escape(app.name)}</h3>${arrow}</header>
          <figure class="application-image" data-motion="capture"><button class="capture-button" type="button" disabled data-full="${escape(versioned(app.capture.src, app.capture))}" data-name="${escape(app.name)}" aria-haspopup="dialog" aria-label="Enlarge ${escape(app.name)} screenshot">${image(app.capture, app.alt, gallerySizes)}</button></figure>
          <p class="application-value">${escape(app.valueLine)}</p>
        </article>`;
let html = await fs.readFile("content/page.html", "utf8");
const symbol = (await fs.readFile("assets/brand/artifacts-symbol.svg", "utf8"))
  .replace('<svg ', '<svg class="brand-symbol" aria-hidden="true" focusable="false" ')
  .replace(/<title>[\s\S]*?<\/title>|<desc>[\s\S]*?<\/desc>/g, "")
  .replaceAll('fill="#e9edf0"', 'fill="currentColor"');
html = html.replace("<!-- BRAND -->", symbol);
html = html.replace("<!-- HOMEPAGE -->", image(homepage.capture, "ARTIFACTS homepage with all sixteen engineering applications", "(min-width: 1024px) 1425px, (min-width: 768px) calc(100vw - 64px), calc(100vw - 40px)", true));
html = html.replace("<!-- EXPEDITIONS -->", expeditions.map(e => `<section class="expedition expedition--${e.id}" id="${e.id}" aria-labelledby="${e.id}-title">
      <div class="container">
        <header class="expedition-heading" data-motion="chapter">
          <p class="chapter-label">${e.marker}</p>
          <h2 id="${e.id}-title">${escape(e.name)}</h2>
          <p class="expedition-descriptor">${escape(e.descriptor)}</p>
        </header>
        <div class="expedition-works">${e.apps.map(id => article(apps.find(a => a.id === id))).join("\n        ")}</div>
      </div>
    </section>`).join("\n    "));
for (const asset of ["styles.css", "chapter-motion.js", "image-viewer.js"]) {
  const revision = createHash("sha256").update(await fs.readFile(asset)).digest("hex").slice(0, 10);
  html = html.replace(`"${asset}"`, `"${asset}?v=${revision}"`);
}
await fs.writeFile("index.html", html.replace(/[\t ]+$/gm, ""));
console.log(`Built four Expeditions, ${apps.length} applications and one real homepage reveal.`);
