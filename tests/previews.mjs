import { build } from "esbuild";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";
import assert from "node:assert/strict";
await fs.mkdir(".qa", { recursive: true });
const html = await fs.readFile("index.html", "utf8"),
  section = html.match(/<section\s+class="app-gallery"[\s\S]*?<\/section>/)[0],
  head = html
    .match(/<head>[\s\S]*?<\/head>/)[0]
    .replace(/<script[\s\S]*?<\/script>/, "")
    .replaceAll('href="', 'href="../');
await fs.writeFile(
  ".qa/preview-review.html",
  '<!doctype html><html class="enhanced"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    head +
    "<body>" +
    section.replaceAll('src="assets/', 'src="../assets/') +
    '<script src="preview-review.js"></script></body></html>',
);
await build({
  stdin: {
    contents: `import {renderPreview} from './js/gallery-renderer.js';import {createTopography} from './js/topography.js';import settings from './content/gallery.json';const cards=[...document.querySelectorAll('.gallery-card')];let topo;window.renderQA=async(kind,q)=>{const e=cards.find(e=>e.dataset.film===kind),c=e.querySelector('.gallery-preview'),a=e.querySelector('.gallery-art');c.style.opacity=q===null?0:1;a.style.setProperty('--film-reveal',q===null?0:1);if(q===null){await e.querySelector('img').decode();return}if(kind==='surface'&&!topo){topo=createTopography({querySelector:()=>c},()=>{});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}renderPreview(c,{kind,q,w:a.clientWidth,h:a.clientHeight,mobile:innerWidth<700,topography:topo})};window.qaSettings=settings;`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  outfile: ".qa/preview-review.js",
  format: "iife",
});
const b = await chromium.launch({ channel: "msedge", headless: true }),
  p = await b.newPage(),
  issues = [],
  errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.addInitScript(() => {
  const text = CanvasRenderingContext2D.prototype.fillText,
    clear = CanvasRenderingContext2D.prototype.clearRect;
  CanvasRenderingContext2D.prototype.clearRect = function (...a) {
    this.__texts = [];
    return clear.apply(this, a);
  };
  CanvasRenderingContext2D.prototype.fillText = function (s, x, y, ...args) {
    if (this.globalAlpha > 0.35) {
      const m = this.measureText(s),
        t = this.getTransform(),
        offset =
          this.textAlign === "center"
            ? -m.width / 2
            : this.textAlign === "right"
              ? -m.width
              : 0,
        a = t.transformPoint({
          x: x + offset,
          y: y - m.actualBoundingBoxAscent,
        }),
        b = t.transformPoint({
          x: x + offset + m.width,
          y: y + m.actualBoundingBoxDescent,
        });
      (this.__texts ??= []).push({
        s,
        x: a.x / this.canvas.width,
        y: a.y / this.canvas.height,
        r: b.x / this.canvas.width,
        b: b.y / this.canvas.height,
      });
    }
    return text.call(this, s, x, y, ...args);
  };
});
for (const width of [1440, 1280, 390]) {
  await p.setViewportSize({ width, height: 900 });
  await p.goto("http://127.0.0.1:8001/.qa/preview-review.html", {
    waitUntil: "networkidle",
  });
  await p.evaluate(() => document.fonts.ready);
  const ids = await p.evaluate(() => Object.keys(window.qaSettings));
  for (const phase of ["rest", "development", "decisive"]) {
    const captures = [];
    for (const [i, kind] of ids.entries()) {
      const q = phase === "rest" ? null : phase === "development" ? 0.45 : 0.96;
      await p.evaluate(({ kind, q }) => window.renderQA(kind, q), { kind, q });
      const card = p.locator('[data-film="' + kind + '"]');
      await card.scrollIntoViewIfNeeded();
      const geometry = await card.evaluate((e) => {
        const c = e.querySelector("canvas"),
          texts = c.getContext("2d").__texts || [],
          clipped = texts.filter(
            (t) => t.x < 0.01 || t.r > 0.99 || t.y < 0.005 || t.b > 0.998,
          ),
          collisions = [];
        for (let i = 0; i < texts.length; i++)
          for (let j = i + 1; j < texts.length; j++) {
            const a = texts[i],
              b = texts[j];
            if (
              a.r > b.x + 0.005 &&
              b.r > a.x + 0.005 &&
              a.b > b.y + 0.004 &&
              b.b > a.y + 0.004
            )
              collisions.push([a.s, b.s]);
          }
        return { clipped, collisions };
      });
      if (geometry.clipped.length || geometry.collisions.length)
        issues.push({ width, kind, phase, ...geometry });
      const buffer = await card.screenshot({
        path: ".qa/preview-" + width + "-" + kind + "-" + phase + ".png",
      });
      captures.push({
        input: await sharp(buffer)
          .resize(400, 340, { fit: "contain", background: "#080d12" })
          .png()
          .toBuffer(),
        left: (i % 4) * 400,
        top: Math.floor(i / 4) * 340,
      });
    }
    await sharp({
      create: { width: 1600, height: 1360, channels: 3, background: "#080d12" },
    })
      .composite(captures)
      .png()
      .toFile(".qa/previews-" + width + "-" + phase + ".png");
  }
  console.log("Reviewed preview frames at " + width);
}
await fs.writeFile(
  ".qa/preview-results.json",
  JSON.stringify({ errors, issues }, null, 2),
);
console.log(JSON.stringify({ errors, issues }));
await b.close();
assert.deepEqual(errors, []);
assert.deepEqual(issues, []);
