import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";

const html = await fs.readFile("index.html", "utf8");
const design = await fs.readFile("DESIGN.md", "utf8");
const { apps } = JSON.parse(await fs.readFile("content/apps.json", "utf8"));
const homepage = JSON.parse(await fs.readFile("content/homepage.json", "utf8"));
const expeditions = JSON.parse(await fs.readFile("content/expeditions.json", "utf8"));
const manifest = JSON.parse(await fs.readFile("content/source-manifest.json", "utf8"));
const hash = b => createHash("sha256").update(b).digest("hex");
const norm = s => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

assert.equal(apps.length, 16);
const names = [...html.matchAll(/<h3 id="[^"]+-title">([^<]+)<\/h3>/g)].map(m => m[1]);
assert.deepEqual(names, apps.map(a => a.name));
assert.deepEqual(expeditions.map(e => e.name), ["ALTUS", "INTERSTICE", "GaN EPI", "PLANETFALL"]);
assert.deepEqual(expeditions.flatMap(e => e.apps), apps.map(a => a.id));
assert.equal(new Set(apps.map(a => a.id)).size, 16);
for (const app of apps) assert.ok(design.includes(`| ${String(app.index).padStart(2, "0")} | ${app.name} |`));
assert.ok(html.includes("<title>Artifacts by Gene</title>"));
assert.equal(norm(html.match(/<h1[^>]*>(.*?)<\/h1>/s)[1]), "ARTIFACTS");
assert.equal(norm(html.match(/<p class="hero-descriptor">(.*?)<\/p>/s)[1]), "Software that moves engineering forward.");
assert.equal(norm(html.match(/<p class="hero-fact">(.*?)<\/p>/s)[1]), "Built from the work itself.");
assert.ok(!/Three years\. Sixteen applications\.|GaN Met Compiler|friction-lines|origin-friction/.test(html));
for (const copy of ["One problem became a tool.", "Then another.", "There was no masterplan.", "Tool by tool, ARTIFACTS took shape."]) assert.ok(norm(html).includes(copy), copy);
assert.ok(!html.includes("Good reasoning should outlive the task."));
assert.ok(!html.includes("Select an interface to view the full capture."));
const gene = html.match(/<div class="gene-editorial gene-copy">([\s\S]*?)<\/div>/)[1];
assert.equal(norm(gene), "I spent my entire life improving processes. ARTIFACTS began when I realised engineering itself was one of them. What repeated, I automated. What stood in the way, I rebuilt. ARTIFACTS is the evidence that I never accepted the way things were as the way they had to stay.");
assert.ok(!/<canvas|<video|<iframe|data-film/i.test(html));
assert.deepEqual([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1].split("?")[0]), ["chapter-motion.js", "image-viewer.js"]);
assert.ok(!/\son\w+=/i.test(html), "No script-dependent event handlers");
const css = await fs.readFile("styles.css", "utf8");
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.ok(css.includes("transition:none!important"));
assert.ok(!/@keyframes|animation:|scroll-snap/.test(css));
assert.ok(css.includes("object-fit:contain"), "Equal stages must preserve complete UI");
assert.ok(!/\.application\.(anchor|spatial|comparison|support)/.test(css), "No featured app sizes");
assert.match(html, /<dialog[^>]+aria-modal="true"/);
assert.equal([...html.matchAll(/rel="stylesheet"/g)].length, 1);
for (const id of ["origin", "gene"]) {
  const section = html.match(new RegExp(`<section[^>]+id="${id}"[^>]*>([\\s\\S]*?)</section>`))[1];
  assert.ok(!/<img|<picture/.test(section), `${id} must not contain screenshots`);
}
assert.equal([...html.matchAll(/<img /g)].length, 17, "One homepage and sixteen app captures only");
const captureLinks = [...html.matchAll(/data-full="([^"]+)"/g)];
assert.equal(captureLinks.length, 16, "Every application offers the in-page original");
assert.deepEqual(captureLinks.map(m => m[1].split("?")[0]), apps.map(a => a.capture.src));
assert.ok(!/target="_blank"/.test(html));
const symbol = await fs.readFile("assets/brand/artifacts-symbol.svg", "utf8");
for (const [, d] of symbol.matchAll(/<path d="([^"]+)"/g)) assert.ok(html.includes(`d="${d}"`));

for (const entry of [...apps, homepage]) {
  const c = entry.capture;
  const record = manifest.entries.find(r => r.id === entry.id);
  assert.ok(record, `${entry.id}: no source provenance`);
  assert.equal(record.sourceFilename, entry.sourceFilename);
  assert.equal(record.sourceSha256, c.sourceSha256);
  assert.equal(record.width, c.width);
  const decoded = await sharp(c.src).ensureAlpha().raw().toBuffer();
  assert.equal(hash(decoded), c.pixelSha256, `${entry.id}: full capture pixels changed`);
  for (const source of c.sources) {
    const m = await sharp(source.src).metadata();
    assert.equal(m.width, source.width);
    assert.ok(m.width <= c.width, `${entry.id}: upscaled derivative`);
    assert.ok(Math.abs(m.width / m.height - c.width / c.height) < .003);
  }
  assert.ok(html.includes(c.sources[0].src));
}
for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/^(https?:|mailto:|#)/.test(url)) continue;
  assert.ok(!url.startsWith("/"), `Relative deployment path required: ${url}`);
  await fs.access(url.split("?")[0]);
}
assert.equal((await fs.readFile("CNAME", "utf8")).trim(), "artifactsbygene.com");
await fs.access(".nojekyll");
console.log("PASS: four chapters, 16 complete captures and viewer triggers, source integrity, approved story/Gene copy, real logo and deployment paths.");
