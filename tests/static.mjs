import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";

const html = await fs.readFile("index.html", "utf8");
const design = await fs.readFile("DESIGN.md", "utf8");
const { apps } = JSON.parse(await fs.readFile("content/apps.json", "utf8"));
const homepage = JSON.parse(await fs.readFile("content/homepage.json", "utf8"));
const hash = b => createHash("sha256").update(b).digest("hex");
const norm = s => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

assert.equal(apps.length, 16);
const names = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map(m => m[1]);
assert.deepEqual(names, apps.map(a => a.name));
assert.equal(new Set(apps.map(a => a.id)).size, 16);
for (const app of apps) assert.ok(design.includes(`| ${String(app.index).padStart(2, "0")} | ${app.name} |`));
assert.ok(html.includes("<title>Artifacts by Gene</title>"));
assert.equal(norm(html.match(/<h1[^>]*>(.*?)<\/h1>/s)[1]), "Software that moves engineering forward.");
const gene = html.match(/<div class="gene-copy">([\s\S]*?)<\/div>/)[1];
assert.equal(norm(gene), "I spent my entire life improving processes. ARTIFACTS began when I realised engineering itself was one of them. What repeated, I automated. What stood in the way, I rebuilt. ARTIFACTS is the evidence that I never accepted the way things were as the way they had to stay.");
assert.ok(!/<script|<canvas|<video|<iframe|data-film/i.test(html));
assert.ok(!/\son\w+=/i.test(html), "No script-dependent event handlers");
const css = await fs.readFile("styles.css", "utf8");
assert.ok(css.includes("prefers-reduced-motion: reduce"));
assert.ok(css.includes("transition: none !important"));
assert.ok(!/@keyframes|animation:|scroll-snap|position:\s*(fixed|sticky)/.test(css));
assert.equal([...html.matchAll(/rel="stylesheet"/g)].length, 1);
const symbol = await fs.readFile("assets/brand/artifacts-symbol.svg", "utf8");
for (const [, d] of symbol.matchAll(/<path d="([^"]+)"/g)) assert.ok(html.includes(`d="${d}"`));

for (const entry of [...apps, homepage]) {
  const c = entry.capture;
  const decoded = await sharp(c.src).ensureAlpha().raw().toBuffer();
  assert.equal(hash(decoded), c.pixelSha256, `${entry.id}: full capture pixels changed`);
  for (const source of c.sources) {
    const m = await sharp(source.src).metadata();
    assert.equal(m.width, source.width);
    assert.ok(m.width <= c.width, `${entry.id}: upscaled derivative`);
    assert.ok(Math.abs(m.width / m.height - c.width / c.height) < .003);
  }
  assert.ok(html.includes(`href="${c.src}"`));
}
for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/^(https?:|mailto:|#)/.test(url)) continue;
  assert.ok(!url.startsWith("/"), `Relative deployment path required: ${url}`);
  await fs.access(url);
}
assert.equal((await fs.readFile("CNAME", "utf8")).trim(), "artifactsbygene.com");
await fs.access(".nojekyll");
console.log("PASS: 16 ordered applications, lossless full captures, source dimensions, real logo, exact copy, local assets and zero client runtime.");
