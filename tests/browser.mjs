import { chromium } from "playwright";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, ".."),
  output = resolve(root, ".qa");
await mkdir(output, { recursive: true });
const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2",
};
// Also test the exact site under a repository prefix, as on GitHub Pages.
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname.replace(
    /^\/artifacts-by-gene\//,
    "/",
  );
  const path = resolve(root, "." + pathname.replace(/\/$/, "/index.html"));
  if (!path.startsWith(root + sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    res.setHeader("Content-Type", mime[extname(path)] || "text/plain");
    res.end(await readFile(path));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : {}),
});
const errors = [],
  results = { viewports: [], scenes: [], accessibility: [] };
const ids = [
  "object",
  "clarity",
  "systems",
  "gan-temp-diagnoser",
  "aix-dt-assistant",
  "lt-zone-assistant",
  "anko-helper",
  "metria-spc",
  "evolution",
  "gene",
];
async function at(page, id, progress = 0) {
  await page.evaluate(
    ({ id, progress }) => {
      const e = document.getElementById(id);
      scrollTo({
        top: e.offsetTop + Math.max(0, e.offsetHeight - innerHeight) * progress,
        behavior: "instant",
      });
    },
    { id, progress },
  );
  await page.waitForTimeout(90);
}
async function audit(page, label) {
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const violations = await page.evaluate(async () =>
    (
      await axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      })
    ).violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    })),
  );
  results.accessibility.push({ label, violations });
  assert.deepEqual(violations, [], label + " accessibility");
}
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(r.status() + " " + r.url());
  });
  await page.addInitScript(() => {
    window.__draws = 0;
    window.__long = [];
    window.__cls = 0;
    const draw = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      window.__draws++;
      return draw.apply(this, args);
    };
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__long.push(e.duration);
    }).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries())
        if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(url);
  await page.waitForTimeout(1800);
  assert.equal(
    await page.locator("#wafer-canvas").getAttribute("data-renderer"),
    "webgl",
  );
  for (const [width, height] of [
    [2560, 1440],
    [1920, 1080],
    [1440, 900],
    [1366, 768],
    [1024, 1366],
    [390, 844],
    [320, 740],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await at(page, "object");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    );
    assert.ok(overflow <= 1, `${width} overflow ${overflow}`);
    const title = await page.locator("#hero-title").boundingBox();
    assert.ok(
      title.x >= 0 && title.x + title.width <= width + 1,
      `${width} title fits`,
    );
    await page.screenshot({
      path: resolve(output, `hero-${width}x${height}.png`),
    });
    for (const id of ids) {
      await at(page, id, 0.35);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${width} ${id} overflow`,
      );
      if (
        id === "gan-temp-diagnoser" ||
        id === "lt-zone-assistant" ||
        id === "gene"
      )
        await page.screenshot({
          path: resolve(output, `${id}-${width}x${height}.png`),
        });
      if (id === "gan-temp-diagnoser") {
        const box = await page.locator("#" + id + " .instrument").boundingBox();
        assert.ok(box.width > 100 && box.height > 70, "Visible software");
        const bounds = await page.locator("#" + id + " .scene").boundingBox();
        const foot = await page
          .locator("#" + id + " .scene-foot")
          .boundingBox();
        assert.ok(
          foot.y + foot.height <= bounds.y + bounds.height + 1,
          "Controls fit their scene",
        );
      }
    }
    results.viewports.push({ width, height, overflow });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const id of ids.filter(
    (id) => !["object", "clarity", "systems", "evolution", "gene"].includes(id),
  )) {
    await at(page, id, 0);
    const entry = await page
      .locator("#" + id + " .instrument-position")
      .evaluate((e) => e.style.transform);
    await at(page, id, 0.35);
    const readable = await page
      .locator("#" + id + " .instrument-position")
      .evaluate((e) => e.style.transform);
    assert.notEqual(entry, readable);
    assert.equal(
      await page
        .locator("#" + id + " .instrument img")
        .evaluate((e) => e.complete && e.naturalWidth > 900),
      true,
      "Real image loaded",
    );
    await page.screenshot({ path: resolve(output, id + "-readable.png") });
    await at(page, id, 0.86);
    const macro = await page
      .locator("#" + id + " .macro-plane")
      .evaluate((e) => Number(getComputedStyle(e).opacity));
    assert.ok(macro > 0.95, "Macro reveal complete");
    await page.screenshot({ path: resolve(output, id + "-detail.png") });
    await page.locator("#" + id + " .inspect-link").click();
    await page.waitForSelector("#inspector[open]");
    assert.equal(
      await page
        .locator("#inspector-image")
        .evaluate((e) => e.complete && e.naturalWidth === 2048),
      true,
      "Full resolution inspection",
    );
    await page.locator("#zoom-image").click();
    assert.equal(
      await page.locator("#zoom-image").getAttribute("aria-pressed"),
      "true",
    );
    await page.keyboard.press("Escape");
    assert.equal(
      await page.locator("#inspector").evaluate((e) => e.open),
      false,
    );
    assert.equal(
      await page
        .locator("#" + id + " .inspect-link")
        .evaluate((e) => e === document.activeElement),
      true,
      "Focus restored",
    );
    results.scenes.push({ id, spatial: true, macro: true, inspector: true });
  }
  await at(page, "clarity", 0.02);
  const chaos = await page
    .locator(".trace-lines path")
    .first()
    .getAttribute("d");
  await at(page, "clarity", 0.95);
  assert.notEqual(
    await page.locator(".trace-lines path").first().getAttribute("d"),
    chaos,
  );
  await at(page, "gan-temp-diagnoser", 0.35);
  const tilt = await page
    .locator(".instrument-tilt")
    .first()
    .evaluate((e) => e.style.transform);
  await page.mouse.move(1330, 600);
  await page.waitForTimeout(400);
  assert.notEqual(
    await page
      .locator(".instrument-tilt")
      .first()
      .evaluate((e) => e.style.transform),
    tilt,
    "Inertial pointer orientation",
  );
  await audit(page, "desktop");
  await page.locator("#gan-temp-diagnoser .inspect-link").click();
  await audit(page, "inspector");
  await page.keyboard.press("Escape");
  await at(page, "object");
  await page.waitForTimeout(300);
  const performance = await page.evaluate(async () => {
    window.__long = [];
    const startDraws = window.__draws;
    const intervals = [];
    let last = performance.now(),
      start = last;
    await new Promise((resolve) => {
      function frame(now) {
        intervals.push(now - last);
        last = now;
        if (now - start < 2500) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
    const sorted = intervals.slice(1).sort((a, b) => a - b);
    return {
      frames: intervals.length,
      median: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      draws: window.__draws - startDraws,
      longTasks: window.__long,
      cls: window.__cls,
    };
  });
  results.performance = performance;
  assert.ok(performance.draws > 20, "Wafer animation active");
  await at(page, "gene");
  await page.waitForTimeout(150);
  const offscreen = await page.evaluate(() => window.__draws);
  await page.waitForTimeout(300);
  assert.equal(
    await page.evaluate(() => window.__draws),
    offscreen,
    "Offscreen GPU sleeps",
  );
  await at(page, "object");
  await page.locator("#motion-toggle").click();
  await page.waitForTimeout(200);
  assert.ok(
    await page
      .locator("html")
      .evaluate((e) => e.classList.contains("motion-paused")),
  );
  const paused = await page.evaluate(() => window.__draws);
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => window.__draws), paused);
  await page.reload();
  assert.equal(
    await page.locator("#motion-toggle").getAttribute("aria-pressed"),
    "false",
    "Pause session retained",
  );
  await page.locator("#motion-toggle").click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(180);
  assert.equal(await page.locator("#motion-toggle").isDisabled(), true);
  await at(page, "gan-temp-diagnoser");
  assert.equal(
    await page
      .locator("#gan-temp-diagnoser .scene")
      .evaluate((e) => getComputedStyle(e).position),
    "relative",
  );
  await page.screenshot({ path: resolve(output, "reduced-motion.png") });
  await audit(page, "reduced motion");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(150);
  await at(page, "object");
  await page.evaluate(
    () =>
      (window.__glLoss = document
        .querySelector("canvas")
        .getContext("webgl")
        .getExtension("WEBGL_lose_context")),
  );
  await page.evaluate(() => window.__glLoss.loseContext());
  await page.waitForTimeout(120);
  assert.equal(
    await page.locator("canvas").getAttribute("data-renderer"),
    "fallback",
  );
  await page.evaluate(() => window.__glLoss.restoreContext());
  await page.waitForTimeout(200);
  assert.equal(
    await page.locator("canvas").getAttribute("data-renderer"),
    "webgl",
  );
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await mobile.goto(url);
  await at(mobile, "anko-helper", 0.35);
  await mobile.locator("#anko-helper .inspect-link").tap();
  assert.equal(
    await mobile.locator("#inspector").evaluate((e) => e.open),
    true,
  );
  await mobile.locator("#zoom-image").tap();
  await mobile.locator("#close-inspector").tap();
  await audit(mobile, "mobile");
  await mobile.close();
  const nojs = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await nojs.goto(url);
  assert.equal(await nojs.locator(".software .instrument img").count(), 5);
  await nojs.locator("#anko-helper").scrollIntoViewIfNeeded();
  assert.ok(await nojs.locator("#anko-helper .instrument img").isVisible());
  await nojs.screenshot({ path: resolve(output, "no-js.png") });
  await nojs.close();
  const fallback = await browser.newPage();
  await fallback.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === "webgl" ? null : get.call(this, type, ...args);
    };
  });
  await fallback.goto(url);
  assert.equal(
    await fallback.locator("canvas").getAttribute("data-renderer"),
    "fallback",
  );
  await fallback.close();
  await page.goto(url + "/artifacts-by-gene/");
  await at(page, "metria-spc", 0.35);
  assert.equal(
    await page
      .locator("#metria-spc .instrument img")
      .evaluate((e) => e.complete && e.naturalWidth > 900),
    true,
    "Repository-relative deployment",
  );
  results.errors = errors;
  assert.deepEqual(errors, []);
  results.passed = true;
  console.log(JSON.stringify(results, null, 2));
} finally {
  await writeFile(
    resolve(output, "results.json"),
    JSON.stringify({ ...results, errors }, null, 2),
  );
  await browser.close();
  server.close();
}
