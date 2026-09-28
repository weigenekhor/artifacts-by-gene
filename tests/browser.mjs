import { chromium } from "playwright";
import { serveSite } from "./server.mjs";
const { url, stop } = await serveSite();
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const b = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL || "msedge",
});
const page = await b.newPage({ viewport: { width: 1440, height: 900 } }),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("response", (r) => {
  if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
});
await fs.mkdir(".qa", { recursive: true });
await page.goto(url, { waitUntil: "networkidle" });
const ids = await page
  .locator(".feature")
  .evaluateAll((es) => es.map((e) => e.id));
assert.equal(ids.length, 16);
const catalogue = JSON.parse(await fs.readFile("content/apps.json", "utf8"));
assert.deepEqual(
  await page
    .locator(".feature")
    .evaluateAll((es) => es.map((e) => e.dataset.studyApp)),
  catalogue.apps.map((a) => a.id),
);
const at = async (id, t) => {
  await page.evaluate(
    (id) =>
      scrollTo(
        0,
        document.getElementById(id).offsetTop -
          parseInt(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--header",
            ),
          ),
      ),
    id,
  );
  await page.waitForTimeout(110);
  await page.locator(`#${id} .study-control input`).evaluate((e, t) => {
    e.value = t;
    e.dispatchEvent(new Event("input", { bubbles: true }));
  }, t);
  await page.waitForTimeout(450);
};
const failed = [];
for (const id of ids) {
  await at(id, 0);
  const selector = id === "compare" ? ".papyrus-capture" : ".film-capture";
  for (const t of [0, 100]) {
    if (t) await at(id, t);
    const capture = await page.locator(`#${id} ${selector}`).evaluate((e) => {
      const img = e.querySelector("img"),
        r = e.getBoundingClientRect(),
        parent = e.parentElement.getBoundingClientRect();
      return {
        loaded: img.complete && img.naturalWidth > 0,
        opacity: +getComputedStyle(e).opacity,
        inside:
          r.left >= parent.left - 2 &&
          r.right <= parent.right + 2 &&
          r.top >= parent.top - 2 &&
          r.bottom <= parent.bottom + 2,
      };
    });
    if (!capture.loaded || capture.opacity < 0.99 || !capture.inside)
      failed.push({ id, t, capture });
  }
  await at(id, 77);
  const input = page.locator(`#${id} .film-focus`);
  if (await input.count()) {
    const before = await page.locator(`#${id} .film-reading`).innerText();
    const value = Number(await input.inputValue());
    await input.focus();
    await input.press(value > 50 ? "Home" : "End");
    await page.waitForTimeout(600);
    const after = await page.locator(`#${id} .film-reading`).innerText();
    if (before === after && id !== "planning")
      failed.push({ id, inspection: "unchanged" });
    const alternate = page.locator(`#${id} .film-alternate`);
    if (await alternate.count()) {
      await alternate.click();
      await page.waitForTimeout(700);
      assert.equal(await alternate.getAttribute("aria-pressed"), "true");
    }
  }
}
await at("signals", 77);
await page.waitForTimeout(900);
const first = await page.evaluate(() => artifactsExperience.frames);
await page.waitForTimeout(550);
const idleFrames =
  (await page.evaluate(() => artifactsExperience.frames)) - first;
await page.locator("#signals [data-capture]").click();
assert.equal(await page.locator("#capture-title").innerText(), "Metria SPC");
await page.keyboard.press("Escape");
for (const size of [
  { width: 844, height: 390 },
  { width: 320, height: 568 },
  { width: 1024, height: 1366 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
  { width: 3840, height: 2160 },
]) {
  await page.setViewportSize(size);
  await at("configuration", 76);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({ path: `.qa/film-size-${size.width}.png` });
}
await page.setViewportSize({ width: 1440, height: 900 });
await page.locator("#gene").scrollIntoViewIfNeeded();
await page.screenshot({ path: ".qa/gene-final.png" });
const copy = await page
  .locator(".creator-account")
  .evaluate((e) =>
    [...e.querySelectorAll("h2,p")].map((n) => n.textContent).join(" "),
  );
assert.equal(
  copy.replace(/\s+/g, " ").trim(),
  "I spent my entire life improving processes. ARTIFACTS began when I realised engineering itself was one of them. What repeated, I automated. What stood in the way, I rebuilt. ARTIFACTS is the evidence that I never accepted the way things were as the way they had to stay.",
);
await page.emulateMedia({ reducedMotion: "reduce" });
await page.setViewportSize({ width: 390, height: 844 });
for (const id of ids) {
  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const r = await page.locator(`#${id}`).evaluate((e) => ({
    height: e.offsetHeight,
    stage: e.firstElementChild.offsetHeight,
    copy: !!e.querySelector(".film-description,.papyrus-accessible"),
  }));
  if (r.stage > r.height + 2 || !r.copy) failed.push({ id, reduced: r });
  const visual = page.locator(
    `#${id} .film-operation, #${id} .papyrus-comparison`,
  );
  const resolved = await visual.screenshot();
  const before = page.locator(`#${id} .film-before`);
  await before.click();
  await page.waitForTimeout(160);
  assert.equal(await before.getAttribute("aria-pressed"), "true");
  const starting = await visual.screenshot();
  assert.ok(
    !resolved.equals(starting),
    `${id}: reduced-motion starting state must differ from the result`,
  );
  await before.click();
  await page.waitForTimeout(160);
  assert.equal(await before.getAttribute("aria-pressed"), "false");
}
await page.locator("#signals .film-inspection").scrollIntoViewIfNeeded();
await page.screenshot({ path: ".qa/film-reduced.png" });
await page.addScriptTag({ path: "node_modules/axe-core/axe.min.js" });
const access = await page.evaluate(async () =>
  (
    await axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    })
  ).violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
);
assert.deepEqual(access, []);
const result = {
  errors,
  failed,
  idleFrames,
  coverage: ids.length,
  copy: "exact",
  viewports: 9,
  reduced: "all16",
  accessibility: access,
};
await fs.writeFile(".qa/browser-results.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await b.close();
stop();
assert.equal(errors.length, 0);
assert.equal(failed.length, 0);
assert.ok(idleFrames <= 2);
