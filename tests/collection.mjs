import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import { serveSite } from "./server.mjs";

const { url, stop } = await serveSite();
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "msedge",
  headless: true,
});
const page = await browser.newPage();
const issues = [];
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto(url, { waitUntil: "networkidle" });

for (const size of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
  { width: 844, height: 390 },
]) {
  await page.setViewportSize(size);
  await page.evaluate(() => {
    const section = document.querySelector(".tools-entry");
    scrollTo(
      0,
      section.offsetTop + (section.offsetHeight - innerHeight) * 0.78,
    );
  });
  await page.waitForTimeout(1000);
  const planes = page.locator(".universe-plane");
  const overlaps = await page
    .locator(".universe-plane,.collection-home")
    .evaluateAll((elements) => {
      const boxes = elements.map((element) => ({
        name: element.dataset.app || "homepage",
        box: element.getBoundingClientRect(),
      }));
      const collisions = [];
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i].box,
            b = boxes[j].box;
          const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          // Ignore narrow projected edge intersections, not overlapping interfaces.
          if (x > 8 && y > 8) collisions.push([boxes[i].name, boxes[j].name]);
        }
      return collisions;
    });
  if (overlaps.length) issues.push({ size, restOverlaps: overlaps });
  for (let index = -1; index < 16; index++) {
    if (index >= 0) {
      await planes.nth(index).focus();
      await page.waitForTimeout(850);
    }
    const bounds = await planes.evaluateAll((elements, selected) => {
      const header = document.querySelector(".header");
      const headerBottom = header?.getBoundingClientRect().bottom || 65;
      return elements.flatMap((element, i) => {
        if (selected >= 0 && selected !== i) return [];
        const box = element.getBoundingClientRect();
        return box.left < 0 ||
          box.right > innerWidth ||
          box.top < headerBottom ||
          box.bottom > innerHeight
          ? [
              {
                app: element.dataset.app,
                x: box.x,
                y: box.y,
                right: box.right,
                bottom: box.bottom,
              },
            ]
          : [];
      });
    }, index);
    if (bounds.length) issues.push({ size, index, bounds });
  }
  await planes.last().blur();
}

const touch = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
const phone = await touch.newPage();
await phone.goto(url, { waitUntil: "networkidle" });
await phone.evaluate(() => {
  const section = document.querySelector(".tools-entry");
  scrollTo(0, section.offsetTop + (section.offsetHeight - innerHeight) * 0.78);
});
await phone.waitForTimeout(1000);
const target = phone.locator('.universe-plane[data-position="0"]');
const tapMovingPlane = async () => {
  const box = await target.boundingBox();
  assert.ok(box, "Plane must be rendered before tapping");
  // The installation is continuously animated; tap its current screen position.
  await phone.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
};
await tapMovingPlane();
await phone.waitForTimeout(800);
assert.ok(
  !phone.url().endsWith("#history"),
  "First touch must inspect, not navigate",
);
assert.equal(
  await target.evaluate((element) => element === document.activeElement),
  true,
);
await tapMovingPlane();
await phone.waitForTimeout(800);
assert.ok(phone.url().endsWith("#history"), "Second touch must enter the app");
await fs.mkdir(".qa", { recursive: true });
await fs.writeFile(
  ".qa/collection-results.json",
  JSON.stringify(
    { errors, issues, focusedStates: 64, touch: "passed" },
    null,
    2,
  ),
);
await browser.close();
stop();
console.log(
  JSON.stringify({ errors, issues, focusedStates: 64, touch: "passed" }),
);
assert.deepEqual(errors, []);
assert.deepEqual(
  issues,
  [],
  "Collection planes must stay inside the viewport and below the header",
);
