import { chromium } from "playwright";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url),
  root = resolve(import.meta.dirname, ".."),
  output = resolve(root, ".qa");
await mkdir(output, { recursive: true });
const { apps } = JSON.parse(
  await readFile(resolve(root, "content/apps.json"), "utf8"),
);
const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2",
};
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname.replace(
    /^\/artifacts-by-gene\//,
    "/",
  );
  const file = resolve(root, "." + pathname.replace(/\/$/, "/index.html"));
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
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : {}),
});
const errors = [],
  results = {
    viewports: [],
    accessibility: [],
    catalogue: [],
    performance: {},
  };
const watch = (page) => {
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(r.status() + " " + r.url());
  });
};
async function jump(page, i) {
  await page.evaluate(
    (i) => document.querySelector(`#app-index [data-app="${i}"]`).click(),
    i,
  );
  await page.waitForTimeout(700);
  await page
    .locator(".artifact.is-current .screen-image")
    .evaluate((image) => image.decode());
  assert.equal(
    await page.locator(".artifact.is-current").getAttribute("id"),
    "app-" + apps[i].id,
  );
}
async function scene(page, id, p = 0) {
  await page.evaluate(
    ({ id, p }) => {
      const e = document.getElementById(id);
      scrollTo({
        top: e.offsetTop + Math.max(0, e.offsetHeight - innerHeight) * p,
        behavior: "instant",
      });
    },
    { id, p },
  );
  await page.waitForTimeout(200);
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
async function composition(page, label) {
  const data = await page.evaluate(() => {
    const a = document.querySelector(".artifact.is-current"),
      image = a.querySelector(".screen-object").getBoundingClientRect(),
      caption = a.querySelector(".artifact-caption").getBoundingClientRect(),
      pose = a.querySelector(".artifact-pose"),
      stage = document.querySelector(".atlas-stage").getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      imageBottom: image.bottom,
      captionTop: caption.top,
      imageTop: image.top,
      stageTop: stage.top,
      poseWidth: parseFloat(pose.style.width),
      dpr: devicePixelRatio,
      current: a.id,
    };
  });
  assert.ok(data.overflow <= 1, label + " horizontal overflow");
  assert.ok(
    data.imageBottom + 10 < data.captionTop,
    label + " image collides with caption " + JSON.stringify(data),
  );
  const app = apps.find((a) => "app-" + a.id === data.current);
  assert.ok(
    data.poseWidth * data.dpr <= app.width + 1,
    label + " exceeds native pixels",
  );
  return data;
}
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  watch(page);
  await page.addInitScript(() => {
    window.longTasks = [];
    new PerformanceObserver((list) => {
      window.longTasks.push(...list.getEntries().map((e) => e.duration));
    }).observe({ type: "longtask", buffered: true });
  });
  await page.goto(url);
  await page.waitForTimeout(5700);
  assert.equal(await page.locator(".artifact").count(), 16);
  assert.equal(await page.locator(".index-group").count(), 4);
  const initialHeroes = await page.evaluate(
    () =>
      performance
        .getEntriesByType("resource")
        .filter((r) => /\/hero(?:-1280)?\.webp/.test(r.name)).length,
  );
  assert.equal(
    initialHeroes,
    0,
    "initial page eagerly loads large application screens",
  );
  results.initialHeroRequests = initialHeroes;
  await page.screenshot({ path: resolve(output, "hero-desktop.png") });
  await audit(page, "hero");
  for (let i = 0; i < 16; i++) {
    await jump(page, i);
    const layout = await composition(page, apps[i].id);
    assert.equal(
      await page.locator("#app-counter").textContent(),
      String(i + 1).padStart(2, "0"),
    );
    assert.equal(await page.locator("#app-index [aria-current]").count(), 1);
    assert.equal(await page.locator(".artifact:not([inert])").count(), 1);
    results.catalogue.push({ name: apps[i].name, ...layout });
  }
  await audit(page, "atlas");
  await page
    .locator(".artifact.is-current .artifact-caption [data-inspect]")
    .click();
  await page.locator("#inspector-image").evaluate((i) => i.decode());
  assert.ok(await page.locator("#inspector").evaluate((d) => d.open));
  await audit(page, "inspector");
  await page.locator("#native-size").click();
  assert.equal(
    await page.locator("#native-size").getAttribute("aria-pressed"),
    "true",
  );
  await page.getByRole("button", { name: "Detail", exact: true }).click();
  await page.locator("#inspector-image").evaluate((i) => i.decode());
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#inspector").evaluate((d) => d.open), false);
  assert.ok(
    await page
      .locator(".artifact.is-current .artifact-caption [data-inspect]")
      .evaluate((e) => e === document.activeElement),
  );
  await jump(page, 7);
  await page
    .locator(".artifact.is-current .artifact-caption [data-inspect]")
    .click();
  await page.getByRole("button", { name: "Archive example" }).click();
  await page.locator("#inspector-image").evaluate((i) => i.decode());
  assert.match(
    await page.locator("#capture-caption").textContent(),
    /Source compression/,
  );
  await page.keyboard.press("Escape");
  await page.locator("#next-app").click();
  await page.waitForTimeout(750);
  assert.equal(
    await page.locator(".artifact.is-current").getAttribute("id"),
    "app-" + apps[8].id,
  );
  await page.locator("#app-index [aria-current]").focus();
  await page.keyboard.press("End");
  await page.waitForTimeout(750);
  assert.equal(
    await page.locator("#app-index [aria-current]").getAttribute("data-app"),
    "15",
  );
  await page.keyboard.press("Home");
  await page.waitForTimeout(750);
  assert.equal(
    await page.locator("#app-index [aria-current]").getAttribute("data-app"),
    "0",
  );
  // Observe the real transition, not just its endpoints.
  const start7 = apps.slice(0, 7).reduce((sum, a) => sum + a.pace, 0);
  await page.evaluate(
    ({ start, pace }) =>
      scrollTo({
        top:
          document.querySelector("#systems").offsetTop +
          (start + pace * 0.83) * innerHeight,
        behavior: "instant",
      }),
    { start: start7, pace: apps[7].pace },
  );
  await page.waitForTimeout(500);
  assert.ok(
    ["07", "08", "09"].includes(
      await page.locator("#app-counter").textContent(),
    ),
  );
  assert.ok(
    await page
      .locator(".screen-shard")
      .evaluateAll((es) => es.some((e) => Number(e.style.opacity) > 0)),
  );
  await page.screenshot({ path: resolve(output, "atlas-transition.png") });
  await page.evaluate(
    ({ start, pace }) =>
      scrollTo({
        top:
          document.querySelector("#systems").offsetTop +
          (start + pace * 0.55) * innerHeight,
        behavior: "instant",
      }),
    { start: start7, pace: apps[7].pace },
  );
  await page.waitForTimeout(400);
  assert.equal(await page.locator("#app-counter").textContent(), "08");
  assert.ok(
    await page
      .locator("#app-gan-temp-diagnoser .extracted-detail")
      .evaluate((e) => Number(e.style.opacity) > 0.9),
  );
  await page.screenshot({ path: resolve(output, "atlas-detail.png") });
  for (const [width, height, dpr] of [
    [2560, 1440, 1],
    [1920, 1080, 1],
    [1440, 900, 1],
    [1366, 768, 1],
    [1024, 1366, 1],
    [390, 844, 3],
    [844, 390, 2],
    [3840, 2160, 1],
    [1440, 900, 2],
  ]) {
    const p = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: dpr,
      hasTouch: width < 1100,
      isMobile: width < 700,
    });
    watch(p);
    await p.goto(url + "/artifacts-by-gene/");
    await p.waitForTimeout(150);
    for (const i of [0, 7, 15]) {
      await jump(p, i);
      await composition(p, `${width}x${height}@${dpr} app${i}`);
    }
    await p.screenshot({
      path: resolve(output, `atlas-${width}x${height}-${dpr}.png`),
    });
    if (width === 390) {
      await p.locator("#index-toggle").click();
      assert.equal(
        await p.locator("#index-toggle").getAttribute("aria-expanded"),
        "true",
      );
      await p.keyboard.press("Escape");
      assert.equal(
        await p.locator("#index-toggle").getAttribute("aria-expanded"),
        "false",
      );
      await audit(p, "mobile");
      await jump(p, 8);
      await p
        .locator(".artifact.is-current .camera-world")
        .dispatchEvent("pointerdown", {
          pointerType: "touch",
          clientX: 320,
          clientY: 440,
        });
      await p
        .locator(".artifact.is-current .camera-world")
        .dispatchEvent("pointerup", {
          pointerType: "touch",
          clientX: 80,
          clientY: 445,
        });
      await p.waitForTimeout(750);
      assert.equal(
        await p.locator(".artifact.is-current").getAttribute("data-index"),
        "9",
      );
    }
    results.viewports.push({
      width,
      height,
      dpr,
      overflow: await p.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    });
    await p.close();
  }
  const reduced = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  watch(reduced);
  await reduced.goto(url);
  await reduced.waitForTimeout(200);
  assert.ok(
    await reduced
      .locator("html")
      .evaluate((e) => e.classList.contains("motion-paused")),
  );
  for (let i = 0; i < 16; i++) await jump(reduced, i);
  assert.ok(
    await reduced
      .locator("#systems")
      .evaluate((e) => e.offsetHeight <= innerHeight + 1),
  );
  await audit(reduced, "reduced motion");
  await reduced.close();
  const plain = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  watch(plain);
  await plain.goto(url);
  assert.equal(await plain.locator(".artifact").count(), 16);
  assert.equal(await plain.locator(".artifact noscript img").count(), 16);
  assert.equal(
    await plain.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
    0,
  );
  await plain.close();
  const fallback = await browser.newPage();
  watch(fallback);
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
  await fallback.goto(url);
  await fallback.waitForTimeout(500);
  assert.ok(await fallback.locator(".wafer-fallback").isVisible());
  await jump(fallback, 15);
  await fallback.close();
  await scene(page, "object");
  await page.waitForTimeout(600);
  const frames = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const values = [];
        let previous;
        function frame(t) {
          if (previous) values.push(t - previous);
          previous = t;
          if (values.length < 180) requestAnimationFrame(frame);
          else resolve(values.sort((a, b) => a - b));
        }
        requestAnimationFrame(frame);
      }),
  );
  results.performance.hero = {
    median: frames[90],
    p95: frames[171],
    approximateFPS: 1000 / frames[90],
  };
  await jump(page, 0);
  results.performance.longTasks = await page.evaluate(() => ({
    count: longTasks.length,
    max: Math.max(0, ...longTasks),
  }));
  results.errors = errors;
  assert.deepEqual(errors, [], "browser/HTTP errors");
  console.log(JSON.stringify(results, null, 2));
} finally {
  await writeFile(
    resolve(output, "validation-v3.json"),
    JSON.stringify({ ...results, errors }, null, 2),
  );
  await browser.close();
  server.close();
}
