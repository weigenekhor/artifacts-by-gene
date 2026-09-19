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
const ids = [
  "entry",
  "friction",
  "execution",
  "origin",
  "observe",
  "compare",
  "diagnose",
  "coordinate",
  "universe",
  "end",
];
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
  const name = new URL(req.url, "http://localhost").pathname.replace(
      /^\/artifacts-by-gene\//,
      "/",
    ),
    file = resolve(root, "." + name.replace(/\/$/, "/index.html"));
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
  results = { viewports: [], accessibility: [], apps: [], performance: {} };
function watch(p) {
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  p.on("response", (r) => {
    if (r.status() >= 400) errors.push(r.status() + " " + r.url());
  });
}
async function scene(p, id, phase = 0) {
  await p.evaluate(
    ({ id, phase }) => {
      const e = document.getElementById(id);
      scrollTo({
        top: e.offsetTop + e.offsetHeight * phase,
        behavior: "instant",
      });
    },
    { id, phase },
  );
  await p.waitForTimeout(550);
}
async function app(p, i) {
  await p.evaluate(
    (i) => document.querySelector(`[data-directory-app="${i}"]`).click(),
    i,
  );
  await p.waitForTimeout(1350);
  assert.equal(await p.locator("#focus-title").textContent(), apps[i].name);
  assert.equal(
    await p.locator("#world-canvas").getAttribute("data-shape"),
    apps[i].visualConcept,
  );
}
async function axe(p, label) {
  await p.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const violations = await p.evaluate(async () =>
    (
      await window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      })
    ).violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  );
  results.accessibility.push({ label, violations });
  assert.deepEqual(violations, [], label + " accessibility");
}
async function noOverflow(p, label) {
  assert.ok(
    await p.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    label + " overflows",
  );
}
try {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(p);
  await p.goto(url);
  await p.waitForTimeout(3400);
  assert.equal(
    await p.locator("#world-canvas").getAttribute("data-renderer"),
    "webgl",
  );
  assert.equal(await p.locator(".system-node").count(), 16);
  assert.equal(await p.locator(".directory article").count(), 16);
  assert.equal(
    await p
      .locator("body")
      .innerText()
      .then((t) => (t.match(/by Gene/g) || []).length),
    1,
  );
  assert.ok(
    !(await p.locator("body").innerText()).includes("Complexity is a given"),
  );
  assert.equal(
    await p.evaluate(
      () =>
        performance
          .getEntriesByType("resource")
          .filter((e) => /assets\/artifacts\/apps/.test(e.name)).length,
    ),
    0,
  );
  await axe(p, "entry");
  for (const id of ids) {
    await scene(p, id, id === "execution" ? 0.3 : 0);
    await noOverflow(p, id);
    await p.screenshot({ path: resolve(output, "review-" + id + ".png") });
  }
  await scene(p, "universe");
  await axe(p, "universe");
  const nodeBounds = await p.locator(".system-node").evaluateAll((nodes) =>
    nodes.map((n) => {
      const r = n.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    }),
  );
  assert.ok(
    nodeBounds.every((r) => r.left >= 0 && r.right <= 1440),
    "desktop nodes clipped",
  );
  for (let i = 0; i < apps.length; i++) {
    await app(p, i);
    await noOverflow(p, apps[i].name);
    results.apps.push({ name: apps[i].name, shape: apps[i].visualConcept });
  }
  await axe(p, "focused instrument");
  await p.locator("#focus-amount").fill("15");
  await p.waitForTimeout(150);
  await p.locator("#focus-amount").fill("95");
  await p.waitForTimeout(150);
  await p.locator("#open-directory").click();
  assert.ok(
    await p
      .locator("#directory")
      .evaluate((d) => d.classList.contains("is-open")),
  );
  await axe(p, "directory");
  await p.keyboard.press("Shift+Tab");
  assert.ok(
    await p
      .locator("#directory a")
      .last()
      .evaluate((e) => e === document.activeElement),
  );
  await p.keyboard.press("Escape");
  assert.ok(
    await p
      .locator("#open-directory")
      .evaluate((e) => e === document.activeElement),
  );
  await p.locator("#return-universe").click();
  await p.waitForTimeout(1300);
  assert.equal(await p.locator(".system-nodes").isVisible(), true);
  await p.locator(".system-node").first().focus();
  await p.keyboard.press("ArrowRight");
  assert.ok(
    await p
      .locator(".system-node")
      .nth(1)
      .evaluate((e) => e === document.activeElement),
  );
  await scene(p, "compare");
  await p.locator('#compare [data-chapter-app="10"]').click();
  await p.waitForTimeout(1300);
  assert.equal(
    await p.locator("#compare .instrument-summary h3").textContent(),
    "GaN XML Assistant",
  );
  assert.equal(
    await p.locator("#world-canvas").getAttribute("data-shape"),
    "configuration",
  );
  await p.locator("#motion-toggle").click();
  await p.waitForTimeout(1400);
  assert.equal(await p.locator("body").getAttribute("data-scene"), "compare");
  const pausedDraws = await p
    .locator("#world-canvas")
    .getAttribute("data-draws");
  await p.waitForTimeout(500);
  assert.equal(
    await p.locator("#world-canvas").getAttribute("data-draws"),
    pausedDraws,
    "paused renderer stays active",
  );
  await p.locator("#motion-toggle").click();
  for (const [w, h, dpr] of [
    [3840, 2160, 1],
    [1440, 900, 2],
    [2560, 1440, 1],
    [1920, 1080, 1],
    [1440, 900, 1],
    [1366, 768, 1],
    [1024, 1366, 1],
    [430, 932, 2],
    [390, 844, 3],
    [320, 740, 2],
    [844, 390, 2],
  ]) {
    const page = await browser.newPage({
      viewport: { width: w, height: h },
      deviceScaleFactor: dpr,
      hasTouch: w <= 1024,
      isMobile: w <= 700,
    });
    watch(page);
    await page.goto(url + "/artifacts-by-gene/");
    await page.waitForTimeout(250);
    for (const id of ids) {
      await scene(page, id, id === "execution" ? 0.3 : 0);
      await noOverflow(page, `${w} ${id}`);
    }
    await scene(page, "universe");
    const clipped = await page.locator(".system-node").evaluateAll((ns) =>
      ns
        .filter((n) => {
          const r = n.getBoundingClientRect();
          return r.left < 0 || r.right > innerWidth;
        })
        .map((n) => n.dataset.app),
    );
    assert.deepEqual(clipped, [], `${w} clipped nodes`);
    await page.screenshot({ path: resolve(output, `universe-${w}x${h}.png`) });
    if (w === 390) {
      await page.locator('[data-app="3"]').tap();
      await page.waitForTimeout(1300);
      assert.equal(
        await page.locator("#focus-title").textContent(),
        "TopoTracer",
      );
      await axe(page, "mobile");
    }
    results.viewports.push({ width: w, height: h, dpr });
    await page.close();
  }
  const reduced = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  watch(reduced);
  await reduced.goto(url);
  await scene(reduced, "execution");
  assert.equal(
    await reduced
      .locator(".execution-line")
      .evaluate((e) => getComputedStyle(e).clipPath),
    "none",
  );
  for (const i of [0, 3, 7, 10, 15]) await app(reduced, i);
  await axe(reduced, "reduced motion");
  await reduced.close();
  const plain = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  watch(plain);
  await plain.goto(url);
  assert.equal(await plain.locator(".directory article").count(), 16);
  await noOverflow(plain, "no JavaScript");
  assert.ok(await plain.locator("#execution-title").isVisible());
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
  await scene(fallback, "universe");
  await fallback.evaluate(() =>
    document.querySelector('[data-directory-app="3"]').click(),
  );
  await fallback.waitForTimeout(1300);
  assert.ok(
    (await fallback.locator(".world-fallback").getAttribute("src")).includes(
      "topology",
    ),
  );
  await fallback.close();
  await scene(p, "entry");
  await p.waitForTimeout(700);
  const sample = await p.evaluate(
    () =>
      new Promise((resolve) => {
        const times = [];
        let prev;
        function f(t) {
          if (prev) times.push(t - prev);
          prev = t;
          if (times.length < 180) requestAnimationFrame(f);
          else resolve(times.sort((a, b) => a - b));
        }
        requestAnimationFrame(f);
      }),
  );
  results.performance.hero = { median: sample[90], p95: sample[171] };
  await scene(p, "end", 0.25);
  await p.waitForTimeout(1500);
  const endingDraws = await p
    .locator("#world-canvas")
    .getAttribute("data-draws");
  await p.waitForTimeout(500);
  assert.equal(
    await p.locator("#world-canvas").getAttribute("data-draws"),
    endingDraws,
    "ending does not sleep",
  );
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ ...results, errors }, null, 2));
} finally {
  await writeFile(
    resolve(output, "validation-v4.json"),
    JSON.stringify({ ...results, errors }, null, 2),
  );
  await browser.close();
  server.close();
}
