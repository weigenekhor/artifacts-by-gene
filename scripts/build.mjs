import fs from "node:fs/promises";

const { apps } = JSON.parse(await fs.readFile("content/apps.json", "utf8"));
const homepage = JSON.parse(await fs.readFile("content/homepage.json", "utf8"));
const composition = JSON.parse(await fs.readFile("content/composition.json", "utf8"));
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const gallerySizes = "(min-width: 1568px) 664px, (min-width: 1440px) calc((100vw - 240px) / 2), (min-width: 1024px) calc((100vw - 200px) / 2), (min-width: 768px) calc(100vw - 96px), (max-width: 359px) calc(100vw - 56px), calc(100vw - 64px)";
const heroSizes = "(min-width: 1440px) 1080px, (min-width: 1024px) calc((100vw - 96px) * .84), (min-width: 768px) calc(100vw - 64px), (max-width: 359px) calc(100vw - 32px), calc(100vw - 40px)";
const image = (capture, alt, sizes, priority = false) => `<img src="${escape(capture.src)}" srcset="${capture.sources.map(s => `${escape(s.src)} ${s.width}w`).join(", ")}" sizes="${sizes}" width="${capture.width}" height="${capture.height}" alt="${escape(alt)}" loading="${priority ? "eager" : "lazy"}" ${priority ? 'fetchpriority="high" ' : ''}decoding="async">`;
const crop = (record, className) => {
  const app = apps.find(a => a.id === record.appId);
  const c = record.crop;
  if (!app || c.x < 0 || c.y < 0 || c.x + c.width > app.capture.width || c.y + c.height > app.capture.height) throw Error(`Invalid source crop: ${record.appId}`);
  let style = `--crop-ratio:${c.width}/${c.height};--crop-width:${app.capture.width/c.width*100}%;--crop-left:${-c.x/c.width*100}%;--crop-top:${-c.y/c.height*100}%`;
  if (record.focus) style += `;--focus-x:${record.focus.x/app.capture.width*100}%;--focus-y:${record.focus.y/app.capture.height*100}%`;
  if (record.mobileCrop) {
    const m = record.mobileCrop;
    if (m.x < 0 || m.y < 0 || m.x + m.width > app.capture.width || m.y + m.height > app.capture.height) throw Error(`Invalid mobile crop: ${record.appId}`);
    style += `;--mobile-ratio:${m.width}/${m.height};--mobile-width:${app.capture.width/m.width*100}%;--mobile-left:${-m.x/m.width*100}%;--mobile-top:${-m.y/m.height*100}%`;
  }
  return `<a class="evidence-link ${className}" href="${app.capture.src}" aria-label="View the full ${escape(app.name)} interface"><span class="crop-window" style="${style}"><img src="${app.capture.src}" width="${app.capture.width}" height="${app.capture.height}" alt="${escape(record.alt)}" loading="lazy" decoding="async"></span></a>`;
};

if (apps.length !== 16 || apps.some((a, i) => a.index !== i + 1)) throw Error("Expected sixteen applications in canonical order.");
let html = await fs.readFile("content/page.html", "utf8");
const symbol = (await fs.readFile("assets/brand/artifacts-symbol.svg", "utf8"))
  .replace('<svg ', '<svg class="brand-symbol" aria-hidden="true" focusable="false" ')
  .replace(/<title>[\s\S]*?<\/title>|<desc>[\s\S]*?<\/desc>/g, "")
  .replaceAll('fill="#e9edf0"', 'fill="currentColor"');
html = html.replace("<!-- BRAND -->", symbol);
html = html.replace("<!-- HOMEPAGE -->", `<a class="hero-image-link" href="${homepage.capture.src}" aria-label="View the full ARTIFACTS homepage">${image(homepage.capture, "ARTIFACTS homepage with all sixteen engineering applications", heroSizes, true)}</a>`);
html = html.replace("<!-- ORIGIN EVIDENCE -->", crop(composition.origin, "origin-image-link"));
html = html.replace("<!-- WORK ARCHIVE -->", composition.archive.map((record, i) => crop(record, `archive-record archive-record-${i+1}`)).join("\n          "));
html = html.replace("<!-- APPLICATIONS -->", apps.map(a => `<article class="application" id="${a.id}" aria-labelledby="${a.id}-title">
            <header class="application-header"><span class="application-number">${String(a.index).padStart(2, "0")}</span><h3 class="application-title" id="${a.id}-title">${escape(a.name)}</h3></header>
            <a class="media-stage" href="${a.capture.src}" aria-label="View the full ${escape(a.name)} interface">${image(a.capture, a.alt, gallerySizes)}</a>
            <p class="application-value">${escape(a.valueLine)}</p>
          </article>`).join("\n          "));
await fs.writeFile("index.html", html.replace(/[\t ]+$/gm, ""));
console.log(`Built ${apps.length} static applications and three progressively enhanced chapters.`);
