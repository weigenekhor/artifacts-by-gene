import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url),
  root = resolve(import.meta.dirname, "..");
const { apps } = JSON.parse(
  await readFile(resolve(root, "content/apps.json"), "utf8"),
);
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const server = createServer(async (req, res) => {
  const name = new URL(req.url, "http://localhost").pathname.replace(
    /^\/artifacts-by-gene\//,
    "/",
  );
  const file = resolve(root, "." + name.replace(/\/$/, "/index.html"));
  if (!file.startsWith(root + sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    res.setHeader("Content-Type", mime[extname(file)] || "text/plain");
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = "http://127.0.0.1:" + server.address().port + "/artifacts-by-gene/";
const browser = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL || "msedge",
});
const report = {
  scenes: [],
  apps: [],
  viewports: [],
  accessibility: [],
  errors: [],
};
function watch(p) {
  p.on("pageerror", (e) => report.errors.push(e.message));
  p.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning")
      report.errors.push(m.text());
  });
  p.on("response", (r) => {
    if (r.status() >= 400) report.errors.push(r.status() + " " + r.url());
  });
}
async function scene(p, n) {
  await p.evaluate((n) => window.artifactsExperience.go(n, true), n);
  await p.waitForTimeout(950);
  assert.equal(
    await p.evaluate(() => window.artifactsExperience.active),
    Math.round(n),
  );
}
async function shot(p, name) {
  await p.screenshot({ path: resolve(root, ".qa/v9-test-" + name + ".png") });
}
async function axe(p, label) {
  await p.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const r = await p.evaluate(() =>
    axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    }),
  );
  report.accessibility.push({
    label,
    violations: r.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  });
}
await mkdir(resolve(root, ".qa"), { recursive: true });
try {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(p);
  await p.goto(url);
  await p.waitForTimeout(2700);
  await axe(p, "opening");
  for (let i = 0; i <= 13; i++) {
    await scene(p, i);
    assert.equal(await p.locator('.scene[aria-hidden="false"]').count(), 1);
    await shot(p, "scene-" + i);
    report.scenes.push(i);
  }
  await scene(p, 12);
  await axe(p, "environment");
  assert.equal(await p.locator(".app-node").count(), 16);
  for (const a of apps) {
    const n = p.locator('[data-app="' + a.id + '"]');
    await n.focus();
    await p.waitForTimeout(180);
    assert.equal(await p.locator("#selected-name").innerText(), a.name);
    await p.click("#selected-capture");
    await p.locator("#capture-image").evaluate((img) => img.decode());
    const d = await p
      .locator("#capture-image")
      .evaluate((img) => [img.naturalWidth, img.naturalHeight]);
    assert.deepEqual(d, [a.evidence.fullWidth, a.evidence.fullHeight]);
    await p.keyboard.press("Escape");
    assert.equal(
      await p.evaluate(() => document.activeElement.id),
      "selected-capture",
    );
    report.apps.push(a.id);
  }
  await scene(p, 6);
  await p.click("#proof-open");
  await axe(p, "viewer");
  await p.click("#pixel-view");
  assert.equal(
    await p
      .locator("#capture-image")
      .evaluate((img) => img.getBoundingClientRect().width),
    1531,
  );
  await p.keyboard.press("Escape");
  await scene(p, 13);
  await axe(p, "software");
  for (const a of apps) {
    await p.selectOption("#capture-select", a.id);
    const f = p.locator('[data-software="' + a.id + '"]');
    await f.locator("img").evaluate((img) => img.decode());
    assert.equal(await f.locator("img").getAttribute("src"), a.evidence.src);
    assert.equal(await f.evaluate((el) => el.inert), false);
  }
  await scene(p, 0);
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(1300);
  assert.equal(await p.evaluate(() => window.artifactsExperience.active), 1);
  await p.goto(url + "#app/topotracer");
  await p.waitForTimeout(2000);
  assert.equal(await p.locator("#selected-name").innerText(), "TopoTracer");
  await p.setViewportSize({ width: 390, height: 844 });
  await p.waitForTimeout(1200);
  assert.equal(await p.evaluate(() => window.artifactsExperience.active), 12);
  await p.close();
  const sizes = [
    [3840, 2160, 1],
    [2560, 1440, 1],
    [1920, 1080, 1],
    [1440, 900, 2],
    [1366, 768, 1],
    [1024, 1366, 1],
    [430, 932, 2],
    [390, 844, 3],
    [320, 740, 2],
    [844, 390, 2],
    [667, 375, 2],
  ];
  for (const [width, height, dpr] of sizes) {
    const q = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: dpr,
      isMobile: width < 701,
      hasTouch: width < 701,
    });
    watch(q);
    await q.goto(url);
    await q.waitForTimeout(2400);
    for (const i of [0, 2, 4, 6, 8, 10, 12, 13]) {
      await scene(q, i);
      const b = await q.evaluate(() => {
        const header = document
            .querySelector(".header")
            .getBoundingClientRect(),
          stage = document.querySelector(".stage").getBoundingClientRect(),
          copy = document
            .querySelector('.scene[aria-hidden="false"]')
            .getBoundingClientRect(),
          proof = document.querySelector(".proof").getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          header: header.bottom,
          stage: stage.top,
          copyBottom: copy.bottom,
          proofTop: proof.top,
          proofBottom: proof.bottom,
          hasProof: !document.querySelector(".proof").hidden,
        };
      });
      assert.equal(b.overflow, false, width + " overflow " + i);
      assert.ok(b.stage >= b.header - 1, width + " header " + i);
      if (b.hasProof) {
        assert.ok(b.proofTop > b.header, width + " proof header");
        assert.ok(b.proofBottom < height - 40, width + " proof footer");
        if (width > 700)
          assert.ok(b.copyBottom < b.proofTop - 4, width + " copy/proof " + i);
      }
      await shot(q, width + "x" + height + "-" + i);
    }
    await scene(q, 12);
    for (let g = 0; g < 4; g++) {
      await q.locator(".group-switch button").nth(g).click();
      await q.waitForTimeout(600);
      const collisions = await q
        .locator(".app-node:not([hidden])")
        .evaluateAll((ns) => {
          const rects = ns.map((n) => n.getBoundingClientRect());
          return rects.flatMap((a, i) =>
            rects
              .slice(i + 1)
              .filter(
                (b) =>
                  a.left < b.right - 2 &&
                  a.right > b.left + 2 &&
                  a.top < b.bottom - 2 &&
                  a.bottom > b.top + 2,
              )
              .map(() => ns[i].dataset.app),
          );
        });
      assert.deepEqual(collisions, [], width + " node overlap group " + g);
    }
    await q.locator(".app-node:not([hidden])").last().click();
    await q.click("#selected-capture");
    await q.keyboard.press("Escape");
    if (width === 390) await axe(q, "mobile");
    report.viewports.push({ width, height, dpr });
    await q.close();
  }
  const reduced = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  watch(reduced);
  await reduced.goto(url + "#surface");
  await reduced.waitForTimeout(2200);
  assert.equal(
    await reduced.evaluate(() => window.artifactsExperience.reduced),
    true,
  );
  await axe(reduced, "reduced");
  await shot(reduced, "reduced");
  await reduced.close();
  const fallback = await browser.newPage();
  watch(fallback);
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, ...args) {
      return t === "webgl2" ? null : original.call(this, t, ...args);
    };
  });
  await fallback.goto(url);
  await fallback.waitForTimeout(2400);
  assert.equal(
    await fallback.evaluate(() => window.artifactsExperience.world.webgl),
    false,
  );
  await scene(fallback, 8);
  assert.equal(await fallback.locator(".fallback-world path").count(), 192);
  await shot(fallback, "fallback");
  await fallback.close();
  const nojs = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  watch(nojs);
  await nojs.goto(url);
  assert.equal(await nojs.locator(".text-catalogue li").count(), 16);
  assert.equal(
    await nojs.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
  );
  await nojs.close();
  const perf = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });
  watch(perf);
  await perf.goto(url);
  await perf.waitForTimeout(3000);
  report.performance = await perf.evaluate(async () => {
    const samples = [],
      longTasks = [];
    const obs = new PerformanceObserver((list) =>
      longTasks.push(...list.getEntries().map((e) => e.duration)),
    );
    obs.observe({ type: "longtask" });
    let last = performance.now();
    for (let i = 0; i < 360; i++)
      await new Promise((resolve) =>
        requestAnimationFrame((t) => {
          samples.push(t - last);
          last = t;
          scrollTo({
            top: (window.artifactsExperience.step * 13 * i) / 359,
            behavior: "instant",
          });
          resolve();
        }),
      );
    await new Promise((r) => setTimeout(r, 2200));
    const before = window.artifactsExperience.world.frames;
    await new Promise((r) => setTimeout(r, 400));
    const idleFrames = window.artifactsExperience.world.frames - before;
    obs.disconnect();
    samples.sort((a, b) => a - b);
    return {
      median: samples[180],
      p95: samples[342],
      longTasks,
      idleFrames,
      renderer: window.artifactsExperience.world,
    };
  });
  assert.equal(report.performance.idleFrames, 0);
  await perf.close();
  assert.deepEqual(report.errors, []);
  assert.ok(
    report.accessibility.every((a) => !a.violations.length),
    JSON.stringify(report.accessibility),
  );
} finally {
  await writeFile(
    resolve(root, ".qa/validation-v9.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  server.close();
}
