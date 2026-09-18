import { chromium } from "playwright";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
const output = resolve(root, ".qa");
await mkdir(output, { recursive: true });
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
};
const server = createServer(async (req, res) => {
  const path = resolve(
    root,
    "." +
      new URL(req.url, "http://localhost").pathname.replace(
        /\/$/,
        "/index.html",
      ),
  );
  if (!path.startsWith(root + sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    res.setHeader("Content-Type", types[extname(path)] || "text/plain");
    res.end(await readFile(path));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : {}),
});
const errors = [],
  results = {};
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  await page.addInitScript(() => {
    window.__qa = { draws: 0, frames: [], tasks: [], cls: 0 };
    const draw = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      window.__qa.draws++;
      return draw.apply(this, args);
    };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        window.__qa.tasks.push(entry.duration);
    }).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        if (!entry.hadRecentInput) window.__qa.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() =>
    document.querySelector(".hero-visual").classList.contains("is-ready"),
  );
  await page.waitForTimeout(1300);
  assert.equal(
    await page.locator("#hero-title").getAttribute("aria-label"),
    "ARTIFACTS.",
  );
  assert.equal(await page.locator(".title-mask").count(), 10);
  for (const [width, height] of [
    [1920, 1080],
    [1440, 900],
    [1366, 768],
    [834, 1112],
    [390, 844],
    [320, 740],
  ]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(250);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `No overflow at ${width}`,
    );
    const titleFits = await page.locator("#hero-title").evaluate((el) => {
      const last = el.lastElementChild.getBoundingClientRect();
      return last.right <= innerWidth;
    });
    assert.ok(titleFits, `Title fits ${width}`);
    await page.screenshot({ path: resolve(output, `hero-${width}.png`) });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator("#systems").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const stationary = await page.evaluate(() => __qa.draws);
  await page.waitForTimeout(250);
  assert.equal(
    await page.evaluate(() => __qa.draws),
    stationary,
    "WebGL stops offscreen",
  );
  const original = await page.locator("#diagram-primary").getAttribute("d");
  await page.locator("#tab-aix").click();
  await page.waitForTimeout(80);
  const intermediate = await page.locator("#diagram-primary").getAttribute("d");
  await page.waitForTimeout(720);
  const finished = await page.locator("#diagram-primary").getAttribute("d");
  assert.notEqual(intermediate, original);
  assert.notEqual(intermediate, finished, "Geometry actually interpolates");
  for (const key of ["gan", "aix", "lt", "anko"]) {
    await page.locator(`#tab-${key}`).click();
    await page.waitForTimeout(720);
    assert.equal(
      await page.locator(".system-diagram").getAttribute("data-mode"),
      key,
    );
    assert.equal(
      await page.locator(`#tab-${key}`).getAttribute("aria-selected"),
      "true",
    );
    await page.screenshot({ path: resolve(output, `system-${key}.png`) });
  }
  await page.locator("#tab-gan").focus();
  await page.keyboard.press("End");
  assert.equal(
    await page.locator("#tab-anko").getAttribute("aria-selected"),
    "true",
  );
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowDown");
  assert.equal(
    await page.locator("#panel-title").textContent(),
    "AIX ΔT Assistant",
  );
  for (const key of ["lt", "gan", "anko", "aix"]) {
    await page.locator(`#tab-${key}`).click();
    await page.waitForTimeout(45);
  }
  await page.waitForTimeout(800);
  assert.equal(
    await page.locator("#panel-title").textContent(),
    "AIX ΔT Assistant",
  );
  await page.locator("#open-project").click();
  assert.equal(
    await page.locator("#dialog-title").textContent(),
    "AIX ΔT Assistant",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    "open-project",
  );
  await page.locator("#approach").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.screenshot({ path: resolve(output, "approach.png") });
  await page.locator("#gene").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.screenshot({ path: resolve(output, "gene.png") });
  await page.locator(".back-top").click();
  await page.waitForTimeout(1000);
  assert.ok(
    await page.evaluate(() => scrollY < 150),
    "Back to surface navigates",
  );
  await page.locator("#motion-toggle").click();
  await page.waitForTimeout(200);
  const paused = await page.evaluate(() => __qa.draws);
  await page.waitForTimeout(250);
  assert.equal(
    await page.evaluate(() => __qa.draws),
    paused,
    "Pause stops WebGL",
  );
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(
    await page.locator("#motion-toggle").getAttribute("aria-pressed"),
    "false",
    "Pause persists across navigation",
  );
  await page.locator("#motion-toggle").click();
  await page.waitForTimeout(200);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(100);
  const reduced = await page.evaluate(() => __qa.draws);
  await page.waitForTimeout(250);
  assert.equal(
    await page.evaluate(() => __qa.draws),
    reduced,
    "Reduced motion stops WebGL",
  );
  assert.equal(await page.locator("#motion-toggle").isDisabled(), true);
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
    "auto",
  );
  await page.locator("#tab-lt").click();
  assert.equal(
    await page
      .locator(".zone-study")
      .evaluate((el) => getComputedStyle(el).opacity),
    "1",
    "Reduced-motion selection is immediate",
  );
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const accessibility = await page.evaluate(() =>
    axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    }),
  );
  results.accessibility = accessibility.violations.map((v) => ({
    id: v.id,
    nodes: v.nodes.map((n) => ({
      target: n.target,
      summary: n.failureSummary,
    })),
  }));
  assert.deepEqual(results.accessibility, []);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.evaluate(() => {
    window.__qa.contextExtension = document
      .querySelector("canvas")
      .getContext("webgl")
      .getExtension("WEBGL_lose_context");
    window.__qa.contextExtension.loseContext();
  });
  await page.waitForTimeout(1000);
  assert.equal(
    await page
      .locator(".wafer-fallback")
      .evaluate((el) => getComputedStyle(el).opacity),
    "1",
  );
  await page.evaluate(() => window.__qa.contextExtension.restoreContext());
  await page.waitForFunction(
    () => document.querySelector("canvas").dataset.renderer === "webgl",
  );

  const touch = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  touch.on("pageerror", (error) => errors.push(error.message));
  await touch.goto(url, { waitUntil: "networkidle" });
  await touch.locator("#tab-lt").tap();
  await touch.waitForTimeout(750);
  assert.equal(
    await touch.locator("#panel-title").textContent(),
    "LT Zone Assistant",
  );
  await touch.screenshot({ path: resolve(output, "touch-systems.png") });
  await touch.emulateMedia({ reducedMotion: "reduce" });
  await touch.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const mobileAxe = await touch.evaluate(() =>
    axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    }),
  );
  assert.deepEqual(
    mobileAxe.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
    [],
    "Mobile accessibility",
  );
  const noJs = await browser.newPage({ javaScriptEnabled: false });
  await noJs.goto(url);
  assert.equal(await noJs.locator("#hero-title").isVisible(), true);
  assert.equal(await noJs.locator(".wafer-fallback").isVisible(), true);
  const fallback = await browser.newPage();
  await fallback.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      return type === "webgl" ? null : get.call(this, type, ...rest);
    };
  });
  await fallback.goto(url);
  assert.equal(
    await fallback.locator("canvas").getAttribute("data-renderer"),
    "fallback",
  );
  await fallback.locator("#tab-anko").click();
  assert.equal(
    await fallback.locator("#panel-title").textContent(),
    "ANKO Helper",
  );

  await touch.close();
  await noJs.close();
  await fallback.close();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(600);
  results.performance = await page.evaluate(async () => {
    const frames = [];
    let previous = 0;
    const taskCount = __qa.tasks.length;
    const started = performance.now(),
      before = __qa.draws;
    await new Promise((resolve) => {
      function measure(now) {
        if (previous) frames.push(now - previous);
        previous = now;
        if (now - started < 3000) requestAnimationFrame(measure);
        else resolve();
      }
      requestAnimationFrame(measure);
    });
    const sorted = frames.sort((a, b) => a - b),
      gl = document.querySelector("canvas").getContext("webgl"),
      extension = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      rafFrames: frames.length,
      durationMs: Math.round(performance.now() - started),
      medianFrameMs: sorted[Math.floor(sorted.length * 0.5)],
      p95FrameMs: sorted[Math.floor(sorted.length * 0.95)],
      draws: __qa.draws - before,
      renderer: extension
        ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL)
        : "unavailable",
      longTasksDuringSample: __qa.tasks.slice(taskCount),
      layoutShift: __qa.cls,
    };
  });
  assert.deepEqual(errors, []);
  results.errors = errors;
  results.status = "passed";
  console.log(JSON.stringify(results, null, 2));
} finally {
  results.errors = errors;
  await writeFile(
    resolve(output, "results.json"),
    JSON.stringify(results, null, 2),
  );
  await browser.close();
  server.close();
}
