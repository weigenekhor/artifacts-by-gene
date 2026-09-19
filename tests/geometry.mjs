import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { geometry, indices } from "../js/geometry.js";
import { SCENES, DESIGN } from "../js/tokens.js";
const { apps, workflows } = JSON.parse(
  await readFile("content/apps.json", "utf8"),
);
assert.equal(apps.length, 16);
assert.equal(new Set(apps.map((a) => a.visualConcept)).size, 16);
const concepts = new Set([
    ...apps.map((a) => a.visualConcept),
    ...SCENES.map((s) => s.shape),
  ]),
  hashes = new Set();
for (const [rows, columns, compact] of [
  [DESIGN.rows, DESIGN.columns, false],
  [DESIGN.mobileRows, DESIGN.mobileColumns, true],
]) {
  const ix = indices(rows, columns);
  assert.equal(ix.length, rows * columns * 6);
  assert.ok(Math.max(...ix) < rows * (columns + 1) * 2);
  for (const kind of concepts)
    for (const amount of [0, 0.8, 1]) {
      const g = geometry(kind, apps, rows, columns, amount, compact);
      assert.ok(
        g.positions.every(Number.isFinite),
        kind + " finite coordinates",
      );
      assert.ok(g.meta.every(Number.isFinite), kind + " finite metadata");
      assert.equal(g.positions.length, rows * (columns + 1) * 6);
      if (
        !compact &&
        amount === 0.8 &&
        apps.some((a) => a.visualConcept === kind)
      )
        hashes.add(createHash("sha256").update(g.positions).digest("hex"));
    }
}
assert.equal(hashes.size, 16, "Each function has distinct procedural geometry");
for (const a of apps) {
  assert.ok(workflows.some((w) => w.id === a.workflow));
  assert.ok(
    a.relationships.every((id) =>
      apps.some((b) => b.id === id && b.workflow === a.workflow),
    ),
  );
}
for (const kind of concepts) {
  const svg = await readFile(`assets/concepts/${kind}.svg`, "utf8");
  assert.ok(svg.includes("<title>Synthetic"));
  assert.ok(!/NaN|Infinity/.test(svg));
}
const html = await readFile("index.html", "utf8"),
  runtime = await readFile("js/apps.js", "utf8");
assert.equal((html.match(/by Gene/g) || []).length, 1);
assert.ok(html.includes("Execution shouldn't be."));
assert.ok(!runtime.includes("sourceFile") && !runtime.includes("heroImage"));
console.log(
  `Validated ${concepts.size} procedural states at desktop/mobile density and three control values; all 16 concepts are distinct.`,
);
