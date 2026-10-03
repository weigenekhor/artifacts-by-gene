import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
const read=async p=>JSON.parse(await fs.readFile(p,"utf8"));
const [{apps},chapters,homepage,manifest,cameras,html,css]=await Promise.all([
 read("content/apps.json"),read("content/expeditions.json"),read("content/homepage.json"),read("content/source-manifest.json"),read("content/cinematography.json"),
 fs.readFile("index.html","utf8"),fs.readFile("styles.css","utf8")
]);
const norm=s=>s.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
assert.equal(apps.length,17);
assert.deepEqual(chapters.flatMap(c=>c.apps),apps.map(a=>a.id));
assert.deepEqual([...html.matchAll(/<h3 id="([^"]+)-title" tabindex="-1">([^<]+)<\/h3>/g)].map(m=>m[2]),apps.map(a=>a.name));
assert.ok(html.includes("<title>Artifacts by Gene</title>"));
assert.equal(norm(html.match(/<h1[^>]*>(.*?)<\/h1>/s)[1]),"ARTIFACTS");
assert.equal(norm(html.match(/<p class="hero-fact">(.*?)<\/p>/s)[1]),"Built from the work itself.");
assert.deepEqual([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1].split("?")[0]),["experience.js","image-viewer.js"]);
assert.ok(!/chapter-motion\.js|gallery\.js|<canvas|<video|<iframe/i.test(html));
assert.ok(!/aspect-ratio:\s*3\s*\/\s*2/.test(css));
const gene=html.match(/<div class="gene-editorial">([\s\S]*?)<div class="gene-contact">/)[1];
assert.equal(norm(gene),"I spent my entire life improving processes. ARTIFACTS began when I realised engineering itself was one of them. What repeated, I automated. What stood in the way, I rebuilt. ARTIFACTS is the evidence that I never accepted the way things were as the way they had to stay.");
assert.ok(!/<strong|<b>/.test(gene));
assert.equal([...html.matchAll(/class="capture-button"/g)].length,35);
assert.equal([...html.matchAll(/data-app="/g)].length,17);
assert.equal([...html.matchAll(/data-chapter="/g)].length,4);
assert.ok(css.includes("prefers-reduced-motion:reduce"));
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
for(const a of apps){
 const covered=new Set(cameras[a.id].beats.map(b=>b.image));
 assert.equal(covered.size,a.images.length);
 assert.ok(html.includes('id="'+a.id+'"'));
}
const symbol=await fs.readFile("assets/brand/artifacts-symbol.svg","utf8");
for(const [,d] of symbol.matchAll(/<path d="([^"]+)"/g))assert.ok(html.includes('d="'+d+'"'));
const entries=[...apps.flatMap(a=>a.images.map((s,i)=>({...s,id:a.id,slide:i+1}))),{...homepage,slide:1}];
assert.equal(entries.length,36);
for(const e of entries){
 const c=e.capture;
 const provenance=manifest.entries.find(m=>m.id===e.id&&m.slide===e.slide);
 assert.equal(provenance.sourceSha256,c.sourceSha256);
 const decoded=await sharp(c.src).ensureAlpha().raw().toBuffer();
 assert.equal(createHash("sha256").update(decoded).digest("hex"),c.pixelSha256,e.sourceFilename+" pixels changed");
 for(const s of c.sources){
  const meta=await sharp(s.src).metadata();
  assert.equal(meta.width,s.width);assert.ok(meta.width<=c.width);
  assert.ok(Math.abs(meta.width/meta.height-c.width/c.height)<.003);
 }
}
for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 if(/^(https?:|mailto:|#)/.test(url))continue;
 assert.ok(!url.startsWith("/"));await fs.access(url.split("?")[0]);
}
for(const [,url] of html.matchAll(/data-full="([^"]+)"/g))await fs.access(url.split("?")[0]);
assert.equal((await fs.readFile("CNAME","utf8")).trim(),"artifactsbygene.com");await fs.access(".nojekyll");
console.log("PASS: canonical order, 35 app captures, exact copy, native proportions, source pixels, logo and static paths.");

