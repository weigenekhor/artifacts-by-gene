import { chromium } from "playwright";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { createHash } from "node:crypto";
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
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
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
const results = { apps: [], viewports: [], accessibility: [], errors: [] },
  errors = results.errors;
function watch(p) {
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") errors.push(m.text());
  });
  p.on("response", (r) => {
    if (r.status() >= 400) errors.push(r.status() + " " + r.url());
  });
}
async function scene(p, i) {
  await p.evaluate((i) => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo({
      top:
        ((document.querySelector(".journey").offsetHeight -
          document.querySelector(".stage").offsetHeight) *
          i) /
        4,
      behavior: "instant",
    });
  }, i);
  await p.waitForTimeout(1050);
}
async function axe(p, label) {
  await p.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const r = await p.evaluate(() =>
    axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    }),
  );
  results.accessibility.push({
    label,
    violations: r.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  });
}
const shot = async (p, name) =>
  p.screenshot({ path: resolve(root, ".qa/v6-" + name + ".png") });
await mkdir(resolve(root, ".qa"), { recursive: true });
try {
  const p = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  watch(p);
  await p.goto(url);
  await p.waitForFunction(() => window.artifactsExperience?.world);
  await p.waitForTimeout(2100);
  assert.equal(await p.locator(".app-node").count(), 16);
  await axe(p, "opening");
  for (let i = 0; i < 5; i++) {
    await scene(p, i);
    assert.equal(await p.evaluate(() => window.artifactsExperience.active), i);
    await shot(p, "desktop-scene-" + i);
  }
  await axe(p, "ecosystem");
  await p.locator('[data-app="papyrus-reader"]').click();
  await p.waitForTimeout(1300);
  for (const a of apps) {
    await p.selectOption("#app-select", a.id);
    await p.waitForTimeout(1100);
    assert.equal(await p.locator("#atlas-title").innerText(), a.name);
    const before = createHash("sha256")
      .update(await p.locator("#world").screenshot())
      .digest("hex");
    await p.locator("#study").fill("0");
    await p.locator("#study").dispatchEvent("input");
    await p.waitForTimeout(1100);
    const after = createHash("sha256")
      .update(await p.locator("#world").screenshot())
      .digest("hex");
    assert.notEqual(
      before,
      after,
      a.name + " control must change its visible study",
    );
    await p.locator("#study").fill("100");
    await p.locator("#study").dispatchEvent("input");
    await p.waitForTimeout(900);
    await shot(p, "app-" + a.id);
    await p.click("#capture");
    await p.locator("#capture-image").evaluate((img) => img.decode());
    assert.ok(
      await p.locator("#capture-image").evaluate((img) => img.naturalWidth > 0),
    );
    await p.click("#full-view");
    await p.locator("#capture-image").evaluate((img) => img.decode());
    assert.equal(
      await p.locator("#capture-image").evaluate((img) => img.naturalWidth),
      1425,
    );
    await p.keyboard.press("Escape");
    results.apps.push(a.name);
  }
  await axe(p, "app-study");
  await p.click("#capture");
  await axe(p, "capture-dialog");
  await p.keyboard.press("Escape");
  await p.click("#next");
  const previous = await p.evaluate(() => window.artifactsExperience.selected);
  await p.keyboard.press("ArrowLeft");
  assert.notEqual(
    await p.evaluate(() => window.artifactsExperience.selected),
    previous,
  );
  const viewports = [
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
  ];
  await p.close();
  for (const [width, height, dpr] of viewports) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: dpr,
      isMobile: width < 701,
      hasTouch: width < 701,
    });
    watch(page);
    await page.goto(url);
    await page.waitForFunction(() => window.artifactsExperience?.world);
    await page.waitForTimeout(2100);
    for (const i of [0, 1, 2, 3, 4]) {
      await scene(page, i);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      assert.equal(overflow, false, width + " scene " + i + " overflow");
      await shot(page, width + "x" + height + "-scene-" + i);
    }
    const boxes = await page.locator(".app-node").evaluateAll((nodes) =>
      nodes.map((n) => {
        const r = n.getBoundingClientRect();
        return { y: r.y, bottom: r.bottom, height: r.height, width: r.width };
      }),
    );
    assert.ok(
      boxes.every(
        (r) =>
          r.height >= 44 && r.width >= 40 && r.y >= 0 && r.bottom <= height,
      ),
      width + " touch bounds",
    );
    await page.locator('[data-app="gan-temp-diagnoser"]').click();
    await page.waitForTimeout(1250);
    await shot(page, width + "x" + height + "-study");
    await page.click("#capture");
    await page.locator("#capture-image").evaluate((img) => img.decode());
    await page.click("#pixel-view");
    const size = await page
      .locator("#capture-image")
      .evaluate((img) => ({
        width: img.getBoundingClientRect().width,
        natural: img.naturalWidth,
        dpr: devicePixelRatio,
      }));
    assert.ok(Math.abs(size.width - size.natural / size.dpr) < 1);
    await page.keyboard.press("Escape");
    if (width === 390) await axe(page, "mobile-study");
    results.viewports.push({ width, height, dpr });
    await page.close();
  }
  const reduced = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  watch(reduced);
  await reduced.goto(url + "#app/topotracer");
  await reduced.waitForTimeout(2200);
  assert.equal(
    await reduced.evaluate(() => window.artifactsExperience.selected),
    "topotracer",
  );
  assert.equal(
    await reduced.evaluate(() => window.artifactsExperience.reduced),
    true,
  );
  await axe(reduced, "reduced-motion");
  await shot(reduced, "reduced");
  await reduced.close();
  const fallback = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === "webgl2" ? null : original.call(this, type, ...args);
    };
  });
  watch(fallback);
  await fallback.goto(url);
  await fallback.waitForTimeout(2300);
  assert.equal(
    await fallback.evaluate(() => window.artifactsExperience.world.webgl),
    false,
  );
  await scene(fallback, 4);
  await fallback.locator('[data-app="topotracer"]').click();
  await fallback.waitForTimeout(1200);
  await shot(fallback, "no-webgl");
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
  await perf.waitForTimeout(2500);
  results.performance = await perf.evaluate(async () => {
    const samples = [],
      longTasks = [];
    const obs = new PerformanceObserver((list) =>
      longTasks.push(...list.getEntries().map((e) => e.duration)),
    );
    obs.observe({ type: "longtask" });
    const max = document.querySelector(".journey").offsetHeight - innerHeight;
    let last = performance.now();
    document.documentElement.style.scrollBehavior = "auto";
    for (let i = 0; i < 240; i++)
      await new Promise((resolve) =>
        requestAnimationFrame((t) => {
          samples.push(t - last);
          last = t;
          scrollTo(0, (max * i) / 239);
          resolve();
        }),
      );
    await new Promise((r) => setTimeout(r, 1400));
    const before = window.artifactsExperience.world.frames;
    await new Promise((r) => setTimeout(r, 300));
    const idleFrames = window.artifactsExperience.world.frames - before;
    obs.disconnect();
    samples.sort((a, b) => a - b);
    return {
      median: samples[Math.floor(samples.length * 0.5)],
      p95: samples[Math.floor(samples.length * 0.95)],
      longTasks,
      idleFrames,
      renderer: window.artifactsExperience.world,
    };
  });
  await perf.close();
  assert.equal(
    results.performance.idleFrames,
    0,
    "renderer must sleep at rest",
  );
  assert.deepEqual(errors, []);
  assert.ok(
    results.accessibility.every((a) => !a.violations.length),
    JSON.stringify(results.accessibility),
  );
} finally {
  await writeFile(
    resolve(root, ".qa/validation-v6.json"),
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
  server.close();
}
