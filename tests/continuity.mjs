import { chromium } from "playwright";
import { serveSite } from "./server.mjs";
const { url, stop } = await serveSite();
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const b = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "msedge",
  headless: true,
});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await fs.mkdir(".qa", { recursive: true });
await p.goto(url, { waitUntil: "networkidle" });
await p.evaluate(
  () => (window.surfaceIdentity = document.querySelector(".collection-home")),
);
const states = [];
for (const t of [
  0, 1.45, 2.17, 2.84, 3.65, 4.53, 5.3, 5.9, 6.32, 6.43, 7.5, 9,
]) {
  await p.evaluate((t) => {
    const e = document.querySelector(".genesis");
    scrollTo(0, ((e.offsetHeight - innerHeight) * t) / 6.8);
  }, t);
  await p.waitForTimeout(650);
  states.push(
    await p.evaluate((t) => {
      const e = document.querySelector(".collection-home"),
        r = e.getBoundingClientRect();
      return {
        t,
        same: e === surfaceIdentity,
        home: { x: r.x, y: r.y, w: r.width, h: r.height },
        copies: document.querySelectorAll(".collection-home").length,
        origin: !!e.closest(".genesis-stage"),
        planes: [...document.querySelectorAll(".universe-plane")].filter(
          (e) => +getComputedStyle(e).opacity > 0.01,
        ).length,
      };
    }, t),
  );
  if (t === 9) {
    await p.locator(".universe-plane").first().focus();
    await p.waitForTimeout(600);
    assert.ok(
      (
        await p
          .locator(".universe-plane")
          .first()
          .evaluate((e) => e.style.transform)
      ).includes("translate3d"),
    );
  }
}
const before = states.find((s) => s.t === 6.32).home,
  after = states.find((s) => s.t === 6.43).home;
for (const key of ["x", "y", "w", "h"])
  assert.ok(
    Math.abs(before[key] - after[key]) < 2,
    "Persistent surface moved on reparent: " + key,
  );
assert.ok(states.every((s) => s.same && s.copies === 1));
assert.ok(states.filter((s) => s.t < 6.32).every((s) => s.planes === 0));
await p.screenshot({ path: ".qa/collection-cinematic.png" });
// Returning through the story must restore ownership without exposing the collection.
await p.evaluate(() =>
  scrollTo(
    0,
    ((document.querySelector(".genesis").offsetHeight - innerHeight) * 4.53) /
      6.8,
  ),
);
await p.waitForTimeout(850);
assert.equal(
  await p
    .locator(".collection-home")
    .evaluate((e) => e === surfaceIdentity && !!e.closest(".genesis-stage")),
  true,
);
assert.equal(
  await p
    .locator(".tools-stage")
    .evaluate((e) => getComputedStyle(e).visibility),
  "hidden",
);
await p.evaluate(() => scrollTo(0, 0));
await p.waitForTimeout(850);
assert.equal(
  await p.locator(".collection-home").evaluate((e) => Number(e.style.opacity)),
  0,
);
await p.locator("#signals").evaluate((e) => scrollTo(0, e.offsetTop - 84));
await p.waitForTimeout(100);
await p.locator("#signals .study-control input").evaluate((e) => {
  e.value = 78;
  e.dispatchEvent(new Event("input", { bubbles: true }));
});
await p.waitForTimeout(500);
await p.locator(".film-pin").click();
assert.equal(
  await p.locator(".film-pin").getAttribute("aria-pressed"),
  "false",
);
await p.screenshot({ path: ".qa/metria-cinematic.png" });
await p.setViewportSize({ width: 390, height: 844 });
await p.evaluate(() => scrollTo(0, 0));
await p.waitForTimeout(500);
for (const t of [2.17, 3.65, 4.53, 5.9, 7.5]) {
  await p.evaluate(
    (t) =>
      scrollTo(
        0,
        ((document.querySelector(".genesis").offsetHeight - innerHeight) * t) /
          6.8,
      ),
    t,
  );
  await p.waitForTimeout(500);
  await p.screenshot({ path: ".qa/origin-mobile-" + t + ".png" });
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
}
const no = await b.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  }),
  np = await no.newPage();
await np.goto(url);
assert.equal(await np.locator(".feature").count(), 16);
assert.equal(await np.locator("noscript a").count(), 16);
assert.equal(
  await np.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  false,
);
await fs.writeFile(
  ".qa/continuity-results.json",
  JSON.stringify({ errors, states, noJS: 16, pin: "passed" }, null, 2),
);
console.log(
  JSON.stringify({
    errors,
    sameSurface: true,
    noEarlyApps: true,
    noJS: 16,
    pin: "passed",
  }),
);
await b.close();
stop();
assert.deepEqual(errors, []);
