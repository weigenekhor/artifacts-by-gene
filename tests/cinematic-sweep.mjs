import { chromium } from "playwright";
import { serveSite } from "./server.mjs";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const { url, stop } = await serveSite();
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle" });
const results = [];
for (const size of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  await page.setViewportSize(size);
  for (const id of await page
    .locator(".feature")
    .evaluateAll((es) => es.map((e) => e.id))) {
    await page
      .locator("#" + id)
      .evaluate((e) =>
        scrollTo(
          0,
          e.offsetTop -
            parseFloat(
              getComputedStyle(document.documentElement).getPropertyValue(
                "--header",
              ),
            ),
        ),
      );
    await page.waitForTimeout(70);
    const result = await page.evaluate(async (id) => {
      const [time, fields, reports, physical, { drawing }, filmData] =
        await Promise.all([
          import("./js/films/chronology.js"),
          import("./js/films/investigation.js"),
          import("./js/films/records.js"),
          import("./js/films/instruments.js"),
          import("./js/films/drawing.js"),
          fetch("./content/films.json").then((r) => r.json()),
        ]);
      const el = document.getElementById(id),
        stage = el.querySelector(".feature-stage"),
        operation = el.querySelector(".film-operation,.papyrus-comparison"),
        heading = el.querySelector(".film-heading,.papyrus-heading"),
        title = heading.firstElementChild;
      const inspect = el.querySelector(".film-inspection,.papyrus-inspection"),
        transport = el.querySelector(".film-transport,.papyrus-transport"),
        meta = el.querySelector(".film-meta,.papyrus-meta");
      const rect = (e) => {
        const r = e.getBoundingClientRect();
        return { x: r.left, y: r.top, r: r.right, b: r.bottom };
      };
      const intersect = (a, b) =>
        a.r > b.x + 2 && b.r > a.x + 2 && a.b > b.y + 2 && b.b > a.y + 2;
      const outside = (a, b) =>
        a.x < b.x - 1 || a.r > b.r + 1 || a.y < b.y - 1 || a.b > b.b + 1;
      const issues = [],
        bounds = rect(stage),
        saved = title.textContent;
      for (let step = 0; step <= 200; step++) {
        const p = step / 200,
          config = filmData[id];
        const beat = config?.beats.findLast((b) => p >= b[0]);
        title.textContent =
          id === "compare"
            ? "Position changes. Identity stays."
            : beat?.[1] || "";
        const show = beat
          ? !!beat[1] && p > beat[0] + 0.02 && p < beat[0] + 0.17
          : id === "compare" &&
            ((p > 0.15 && p < 0.3) || (p > 0.7 && p < 0.88));
        if (show) {
          const a = rect(title);
          if (outside(a, bounds))
            issues.push({ p, type: "statement beyond stage" });
          if (outside(a, rect(heading)))
            issues.push({ p, type: "statement beyond safe region" });
          for (const [name, e] of [
            ["metadata", meta],
            ["transport", transport],
            ["inspection", inspect],
          ]) {
            if (name === "inspection" && (p < 0.7 || p > 0.9)) continue;
            if (intersect(a, rect(e)))
              issues.push({ p, type: "statement collision", with: name });
          }
        }
        if (p > 0.7 && p < 0.9) {
          const a = rect(inspect);
          if (outside(a, bounds))
            issues.push({ p, type: "inspection beyond stage" });
          if (intersect(a, rect(transport)))
            issues.push({ p, type: "inspection / transport" });
          // Inspect actual child boxes as well as the reserved region.
          for (const child of inspect.children) {
            if (getComputedStyle(child).display === "none") continue;
            if (outside(rect(child), a))
              issues.push({
                p,
                type: "inspection child overflow",
                child: child.className,
              });
          }
        }
      }
      title.textContent = saved;
      let render = { ...time, ...fields, ...reports, ...physical }[id];
      if (id === "compare") {
        const { compare } = await import("./js/films/records.js"),
          data = await fetch("./content/papyrus.json").then((r) => r.json());
        render = (d, q, f, W, H, m) => compare(d, q, 2, W, H, m, data);
      }
      if (render) {
        const w = operation.clientWidth,
          h = operation.clientHeight,
          m = innerWidth < 700,
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
            const a = ctx.measureText(s),
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
        const samples = [
          ...Array.from({ length: 201 }, (_, i) => ({
            q: i / 200,
            focus: filmData[id]?.defaultFocus ?? 0.5,
            alternate: 0,
          })),
          ...Array.from({ length: 12 }, (_, i) => ({
            q: 0.84,
            focus: (i % 6) / 5,
            alternate: i >= 6 ? 1 : 0,
          })),
        ];
        for (const sample of samples) {
          const { q, focus, alternate } = sample;
          texts = [];
          ctx.clearRect(0, 0, W, H);
          render(
            drawing(ctx, el.classList.contains("film-paper"), m),
            q,
            focus,
            W,
            H,
            m,
            () => {},
            alternate,
            0.5,
            1,
          );
          for (let i = 0; i < texts.length; i++) {
            const a = texts[i];
            if (outside(a, { x: 0, y: 0, r: W, b: H }))
              issues.push({ q, type: "canvas clipped", text: a.s });
            for (let j = i + 1; j < texts.length; j++)
              if (intersect(a, texts[j]))
                issues.push({
                  q,
                  type: "canvas collision",
                  text: [a.s, texts[j].s],
                });
          }
        }
      }
      return { samples: 201, issues };
    }, id);
    results.push({ width: size.width, id, ...result });
    console.log(
      JSON.stringify({
        width: size.width,
        id,
        count: result.issues.length,
        examples: result.issues.slice(0, 3),
      }),
    );
  }
}
await fs.writeFile(
  ".qa/cinematic-sweep.json",
  JSON.stringify(results, null, 2),
);
await browser.close();
stop();
assert.ok(
  results.every((r) => !r.issues.length),
  "Full-progress cinematic safe areas and canvas labels",
);
