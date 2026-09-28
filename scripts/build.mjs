import fs from "node:fs/promises";

const { apps } = JSON.parse(await fs.readFile("content/apps.json", "utf8"));
const homepage = JSON.parse(await fs.readFile("content/homepage.json", "utf8"));
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const gallerySizes = "(min-width: 1568px) 664px, (min-width: 1440px) calc((100vw - 240px) / 2), (min-width: 1024px) calc((100vw - 200px) / 2), (min-width: 768px) calc(100vw - 96px), (max-width: 359px) calc(100vw - 56px), calc(100vw - 64px)";
const originSizes = "(min-width: 1568px) 812px, (min-width: 1440px) calc((100vw - 176px) * .583333), (min-width: 1024px) calc((100vw - 144px) * .583333), (min-width: 768px) calc(100vw - 64px), (max-width: 359px) calc(100vw - 32px), calc(100vw - 40px)";
const image = (capture, alt, sizes) => `<img src="${escape(capture.src)}" srcset="${capture.sources.map(s => `${escape(s.src)} ${s.width}w`).join(", ")}" sizes="${sizes}" width="${capture.width}" height="${capture.height}" alt="${escape(alt)}" loading="lazy" decoding="async">`;

if (apps.length !== 16 || apps.some((a, i) => a.index !== i + 1)) throw Error("Expected sixteen applications in canonical order.");
let html = await fs.readFile("content/page.html", "utf8");
const symbol = (await fs.readFile("assets/brand/artifacts-symbol.svg", "utf8"))
  .replace('<svg ', '<svg class="brand-symbol" aria-hidden="true" focusable="false" ')
  .replace(/<title>[\s\S]*?<\/title>|<desc>[\s\S]*?<\/desc>/g, "")
  .replaceAll('fill="#e9edf0"', 'fill="currentColor"');
html = html.replace("<!-- BRAND -->", symbol);
html = html.replace("<!-- HOMEPAGE -->", `<a class="origin-image-link" href="${homepage.capture.src}" aria-label="View the full ARTIFACTS homepage">${image(homepage.capture, "ARTIFACTS homepage with all sixteen engineering applications", originSizes)}</a>`);
html = html.replace("<!-- APPLICATIONS -->", apps.map(a => `<article class="application" id="${a.id}" aria-labelledby="${a.id}-title">
            <header class="application-header"><span class="application-number">${String(a.index).padStart(2, "0")}</span><h3 class="application-title" id="${a.id}-title">${escape(a.name)}</h3></header>
            <a class="media-stage" href="${a.capture.src}" aria-label="View the full ${escape(a.name)} interface">${image(a.capture, a.alt, gallerySizes)}</a>
            <p class="application-value">${escape(a.valueLine)}</p>
          </article>`).join("\n          "));
await fs.writeFile("index.html", html.replace(/[\t ]+$/gm, ""));
console.log(`Built ${apps.length} applications. Static HTML + one stylesheet; no client JavaScript.`);
