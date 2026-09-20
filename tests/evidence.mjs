import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import sharp from "sharp";
const { apps } = JSON.parse(await readFile("content/apps.json", "utf8")),
  audit = JSON.parse(await readFile("assets/evidence/audit.json", "utf8"));
const hash = (b) => createHash("sha256").update(b).digest("hex");
assert.equal(apps.length, 16);
assert.equal(audit.length, 16);
let bytes = 0;
for (const a of apps) {
  const record = audit.find((r) => r.id === a.id),
    e = a.evidence,
    detail = await readFile(e.src),
    full = await sharp(e.full).metadata();
  assert.equal(hash(detail), record.detailSha256);
  assert.equal(
    hash(await sharp(e.full).ensureAlpha().raw().toBuffer()),
    record.fullPixelSha256,
  );
  assert.equal(
    hash(await sharp(detail).ensureAlpha().raw().toBuffer()),
    record.pixelSha256,
  );
  assert.ok(
    (
      await sharp(e.full).extract(record.region).ensureAlpha().raw().toBuffer()
    ).equals(await sharp(detail).ensureAlpha().raw().toBuffer()),
    a.id + " crop fidelity",
  );
  assert.equal(full.width, e.fullWidth);
  assert.equal(full.height, e.fullHeight);
  assert.equal(full.width, record.sourceWidth);
  assert.equal(full.height, record.sourceHeight);
  const m = await sharp(detail).metadata();
  assert.equal(m.width, e.width);
  assert.equal(m.height, e.height);
  bytes += detail.length;
}
const html = await readFile("index.html", "utf8");
assert.equal((html.split("<body>")[1].match(/by Gene/g) || []).length, 1);
assert.equal((html.match(/class="app-node"/g) || []).length, 16);
for (const app of apps) {
  assert.ok(html.includes('data-app="' + app.id + '"'));
  assert.ok(html.includes('data-software="' + app.id + '"'));
  assert.ok(html.includes('data-src="' + app.evidence.full + '"'));
  assert.ok(html.includes('href="' + app.evidence.full + '"'));
}
assert.ok(!html.includes("®"));
console.log(
  `All 16 full captures and archived crops preserve source pixels; the page uses complete captures. Archived detail payload: ${(bytes / 1024).toFixed(0)} KiB.`,
);
