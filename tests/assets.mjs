import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import sharp from "sharp";
const { apps } = JSON.parse(await readFile("content/apps.json", "utf8"));
const page = await readFile("index.html", "utf8");
const hash = (b) => createHash("sha256").update(b).digest("hex");
assert.equal(apps.length, 16);
assert.equal(new Set(apps.map((a) => a.id)).size, 16);
let total = 0;
for (const app of apps) {
  const hero = await readFile(app.heroImage),
    meta = await sharp(hero).metadata();
  total += hero.length;
  assert.equal(hash(hero), app.heroSha256, app.id + " encoded source");
  assert.equal(meta.width, app.width);
  assert.equal(meta.height, app.height);
  assert.equal(
    hash(await sharp(hero).ensureAlpha().raw().toBuffer()),
    app.sourcePixelSha256,
    app.id + " original pixel fidelity",
  );
  const detail = app.detailImages[0];
  assert.ok(
    (
      await sharp(hero).extract(detail.region).ensureAlpha().raw().toBuffer()
    ).equals(await sharp(detail.src).ensureAlpha().raw().toBuffer()),
    app.id + " detail is an exact source crop",
  );
  assert.equal((await sharp(app.responsiveImage).metadata()).width, 1280);
  assert.equal((await sharp(app.thumbnail).metadata()).width, 480);
  assert.ok(page.includes('data-study-app="' + app.id + '"'));
}
assert.ok(total < 6 * 1024 * 1024, "full capture budget");
const paths = (s) => [...s.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
assert.deepEqual(
  paths(await readFile("assets/favicon.svg", "utf8")),
  paths(await readFile("assets/brand/artifacts-symbol.svg", "utf8")),
);
console.log(
  `Verified all 16 source hashes, decoded pixels, native crops, derivatives and catalogue entries. Full captures: ${(total / 1024 / 1024).toFixed(2)} MiB.`,
);
