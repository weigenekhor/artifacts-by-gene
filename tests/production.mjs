import assert from "node:assert/strict";
import { chromium } from "playwright";
import fs from "node:fs/promises";
import sharp from "sharp";
await fs.mkdir(".qa", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true }),
  p = await browser.newPage({ viewport: { width: 1440, height: 900 } }),
  errors = [],
  issues = [],
  results = [];
p.on("pageerror", (e) => errors.push(e.stack));
p.on("response", (r) => {
  if (r.status() >= 400) errors.push(r.status() + " " + r.url());
});
await p.addInitScript(() => {
  const old = CanvasRenderingContext2D.prototype.fillText,
    clear = CanvasRenderingContext2D.prototype.clearRect;
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    this.__texts = [];
    return clear.apply(this, args);
  };
  CanvasRenderingContext2D.prototype.fillText = function (s, x, y, ...rest) {
    if (this.globalAlpha > 0.35 && this.canvas.closest(".film-operation")) {
      const m = this.measureText(s),
        t = this.getTransform();
      const align =
        this.textAlign === "center"
          ? -m.width / 2
          : this.textAlign === "right"
            ? -m.width
            : 0;
      const a = t.transformPoint({
          x: x + align,
          y: y - m.actualBoundingBoxAscent,
        }),
        b = t.transformPoint({
          x: x + align + m.width,
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
    return old.call(this, s, x, y, ...rest);
  };
});
await p.goto("http://127.0.0.1:8001/?v=production-check", {
  waitUntil: "networkidle",
});
const ids = await p
  .locator(".feature")
  .evaluateAll((es) => es.map((e) => e.id));
const state = async (id, value) => {
  await p.evaluate((id) => {
    const e = document.getElementById(id);
    scrollTo(
      0,
      e.offsetTop -
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--header",
          ),
        ),
    );
  }, id);
  await p.waitForTimeout(70);
  await p.locator("#" + id + " .study-control input").evaluate((e, v) => {
    e.value = v;
    e.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
  await p.waitForTimeout(450);
};
for (const size of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  await p.setViewportSize(size);
  await p.waitForTimeout(150);
  let captures = [];
  for (const [i, id] of ids.entries()) {
    for (const v of [35, 53, 78]) {
      await state(id, v);
      const geometry = await p.locator("#" + id).evaluate((e) => {
        const stage = e.querySelector(".feature-stage"),
          view = e.querySelector(".film-view,.papyrus-view"),
          inspect = e.querySelector(".film-inspection,.papyrus-inspection"),
          transport = e.querySelector(".film-transport,.papyrus-transport");
        const rect = (x) => {
          const b = x.getBoundingClientRect();
          return {
            l: b.left,
            t: b.top,
            r: b.right,
            b: b.bottom,
            w: b.width,
            h: b.height,
          };
        };
        const c = e.querySelector("canvas"),
          texts = c?.getContext("2d").__texts || [];
        const collisions = [];
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
        const clipped = texts
          .filter(
            (t) => t.x < -0.003 || t.r > 1.003 || t.y < -0.003 || t.b > 1.003,
          )
          .map((t) => t.s);
        return {
          stage: rect(stage),
          view: rect(view),
          inspect: rect(inspect),
          transport: rect(transport),
          clipped,
          collisions,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      });
      if (
        geometry.overflow ||
        geometry.view.b > geometry.inspect.t + 2 ||
        geometry.inspect.b > geometry.transport.t + 2 ||
        geometry.transport.b > geometry.stage.b + 2 ||
        geometry.clipped.length ||
        geometry.collisions.length
      )
        issues.push({ width: size.width, id, v, geometry });
      if (v === 78) {
        const path = ".qa/final-" + size.width + "-" + id + ".png";
        await p.screenshot({ path });
        const tw = size.width === 1440 ? 480 : 195,
          th = size.width === 1440 ? 300 : 422;
        captures.push({
          input: await sharp(path).resize(tw).png().toBuffer(),
          left: (i % 4) * tw,
          top: Math.floor(i / 4) * th,
        });
      }
    }
    await p.evaluate((id) => {
      const e = document.getElementById(id);
      scrollTo(0, e.offsetTop + e.offsetHeight - innerHeight * 0.55);
    }, id);
    await p.waitForTimeout(260);
    const leaving = await p
      .locator("#" + id + " .feature-stage")
      .evaluate((e) => ({
        opacity: +getComputedStyle(e).opacity,
        inert: e.inert,
      }));
    if (leaving.opacity > 0.02 || !leaving.inert)
      issues.push({ id, width: size.width, leaving });
  }
  const tw = size.width === 1440 ? 480 : 195,
    th = size.width === 1440 ? 300 : 422;
  await sharp({
    create: { width: tw * 4, height: th * 4, channels: 3, background: "#111" },
  })
    .composite(captures)
    .png()
    .toFile(".qa/final-" + size.width + ".png");
  results.push({ width: size.width, films: ids.length });
}
await fs.writeFile(
  ".qa/production-results.json",
  JSON.stringify({ errors, issues, results }, null, 2),
);
console.log(
  JSON.stringify({
    errors,
    issues: issues.map(({ width, id, v, geometry, leaving }) => ({
      width,
      id,
      v,
      clipped: geometry?.clipped,
      collisions: geometry?.collisions,
      leaving,
    })),
    results,
  }),
);
await browser.close();
assert.deepEqual(errors, [], "Runtime and asset errors");
assert.deepEqual(issues, [], "Film geometry, labels and exits");
