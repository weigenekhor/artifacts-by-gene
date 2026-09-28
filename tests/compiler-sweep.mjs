import { chromium } from "playwright";
import { serveSite } from "./server.mjs";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const { url, stop } = await serveSite();
const b = await chromium.launch({ channel: "msedge", headless: true });
const page = await b.newPage();
await page.goto(url, { waitUntil: "networkidle" });
const results = [];
for (const size of [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  await page.setViewportSize(size);
  for (const kind of ["compile", "report"]) {
    await page
      .locator("#" + kind)
      .evaluate((e) => scrollTo(0, e.offsetTop - 80));
    await page.waitForTimeout(200);
    const result = await page.evaluate(async (kind) => {
      const renderers = await import("./js/films/records.js");
      const { drawing } = await import("./js/films/drawing.js");
      const el = document.querySelector("#" + kind + " .film-operation"),
        w = el.clientWidth,
        h = el.clientHeight,
        m = w < 600,
        W = m ? 600 : 1100,
        H = m
          ? Math.min(900, Math.max(540, (h / w) * 600))
          : Math.min(580, Math.max(430, (h / w) * 1100));
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const ctx = c.getContext("2d"),
        original = ctx.fillText.bind(ctx);
      let texts = [];
      ctx.fillText = (s, x, y) => {
        if (ctx.globalAlpha > 0.35) {
          let a = ctx.measureText(s),
            shift =
              ctx.textAlign === "right"
                ? -a.width
                : ctx.textAlign === "center"
                  ? -a.width / 2
                  : 0;
          texts.push({
            s,
            x: x + shift,
            y: y - a.actualBoundingBoxAscent,
            r: x + shift + a.width,
            b: y + a.actualBoundingBoxDescent,
          });
        }
        original(s, x, y);
      };
      const problems = [];
      for (let i = 0; i <= 200; i++) {
        const q = i / 200;
        texts = [];
        ctx.clearRect(0, 0, W, H);
        renderers[kind](drawing(ctx, false, m), q, 0.16, W, H, m, () => {}, 0);
        for (let a = 0; a < texts.length; a++) {
          const x = texts[a];
          if (x.x < 0 || x.r > W || x.y < 0 || x.b > H)
            problems.push({ q, clipped: x.s });
          for (let b = a + 1; b < texts.length; b++) {
            const y = texts[b];
            if (
              x.r > y.x + 3 &&
              y.r > x.x + 3 &&
              x.b > y.y + 2 &&
              y.b > x.y + 2
            )
              problems.push({ q, collision: [x.s, y.s] });
          }
        }
      }
      return { frames: 201, problems };
    }, kind);
    results.push({ kind, width: size.width, ...result });
  }
}
await fs.writeFile(".qa/compiler-sweep.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify(results));
await b.close();
stop();
assert.ok(results.every((r) => r.problems.length === 0));
