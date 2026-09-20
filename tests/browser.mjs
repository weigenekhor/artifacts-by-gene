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
      top: window.artifactsExperience.step * i,
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
  p.screenshot({ path: resolve(root, ".qa/v8-" + name + ".png") });
await mkdir(resolve(root, ".qa"), { recursive: true });
try {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(p);
  await p.goto(url);
  await p.waitForFunction(() => window.artifactsExperience?.world);
  await p.waitForTimeout(2100);
  assert.equal(await p.locator(".app-node").count(), 16);
  assert.equal(await p.locator(".software-frame").count(), 16);
  assert.equal(
    await p.locator("#world img").count(),
    0,
    "brand cannot be motion geometry",
  );
  assert.equal(
    await p.locator('.chapter[data-chapter="2"] [data-proof]').count(),
    0,
  );
  assert.ok(
    !/recipe|Papyrus/i.test(
      await p.locator('.chapter[data-chapter="2"]').innerText(),
    ),
  );
  await axe(p, "opening");
  for (let i = 0; i < 4; i++) {
    await scene(p, i);
    assert.equal(await p.evaluate(() => window.artifactsExperience.active), i);
    await shot(p, "story-" + i);
  }
  // Reach every app using scroll only. No app selector, next button or click.
  for (const a of apps) {
    await scene(p, a.index + 3);
    assert.equal(
      await p.evaluate(() => window.artifactsExperience.selected),
      a.id,
    );
    assert.equal(await p.locator("#app-name").innerText(), a.name);
    const image = p.locator(".software-frame:not([hidden]) img");
    await image.evaluate((img) => img.decode());
    const info = await image.evaluate((img) => ({
      src: img.getAttribute("src"),
      width: img.naturalWidth,
      height: img.naturalHeight,
      ratio: img.clientWidth / img.clientHeight,
      fit: getComputedStyle(img).objectFit,
      transform: getComputedStyle(img.closest("figure")).transform,
    }));
    assert.equal(info.src, a.evidence.full);
    assert.equal(info.width, a.evidence.fullWidth);
    assert.equal(info.height, a.evidence.fullHeight);
    assert.ok(
      Math.abs(info.ratio - a.evidence.fullWidth / a.evidence.fullHeight) <
        0.02,
    );
    assert.equal(info.fit, "contain");
    assert.equal(info.transform, "none");
    const priority = await p.evaluate(() => {
      const w = document.querySelector("#world").getBoundingClientRect(),
        i = document
          .querySelector(".software-frame:not([hidden]) img")
          .getBoundingClientRect();
      return (w.width * w.height) / (i.width * i.height);
    });
    assert.ok(priority > 2, a.name + " motion must dominate the capture");
    const before = createHash("sha256")
      .update(await p.locator("#world").screenshot())
      .digest("hex");
    await p.locator("#study").fill("0");
    await p.locator("#study").dispatchEvent("input");
    await p.waitForTimeout(1100);
    const after = createHash("sha256")
      .update(await p.locator("#world").screenshot())
      .digest("hex");
    assert.notEqual(before, after, a.name + " motion study");
    await p.locator("#study").fill("100");
    await p.locator("#study").dispatchEvent("input");
    await p.waitForTimeout(900);
    await shot(p, "app-" + a.id);
    results.apps.push({
      name: a.name,
      scroll: true,
      uncropped: true,
      study: true,
    });
  }
  await p.evaluate(() =>
    scrollTo({
      top: window.artifactsExperience.step * 7.8,
      behavior: "instant",
    }),
  );
  await p.waitForTimeout(900);
  const startAmount = Number(await p.locator("#study").inputValue());
  await p.evaluate(() =>
    scrollTo({
      top: window.artifactsExperience.step * 8.2,
      behavior: "instant",
    }),
  );
  await p.waitForTimeout(900);
  assert.ok(
    Number(await p.locator("#study").inputValue()) > startAmount + 40,
    "scroll performs the workflow",
  );
  await scene(p, 19);
  await axe(p, "app-study");
  await p.locator(".software-frame:not([hidden]) .enlarge").click();
  await p.locator("#capture-image").evaluate((img) => img.decode());
  await axe(p, "image-viewer");
  assert.equal(
    await p.locator("#capture-image").getAttribute("src"),
    apps[15].evidence.full,
  );
  await p.keyboard.press("Escape");
  assert.equal(
    await p.evaluate(() => document.activeElement.className),
    "enlarge",
  );
  // Reverse scroll, optional navigation and deep links agree with the scroll clock.
  await scene(p, 8);
  await p.click("#next");
  await p.waitForTimeout(1400);
  assert.equal(
    await p.evaluate(() => window.artifactsExperience.selected),
    "spc-pathfinder",
  );
  await p.keyboard.press("ArrowLeft");
  await p.waitForTimeout(1400);
  assert.equal(
    await p.evaluate(() => window.artifactsExperience.selected),
    "papyrus-reader",
  );
  await p.locator(".sequence-buttons a").click();
  await p.waitForTimeout(1700);
  await axe(p, "index");
  await shot(p, "index");
  await p.locator('[data-app="topotracer"]').click();
  await p.waitForTimeout(1700);
  assert.equal(
    await p.evaluate(() => window.artifactsExperience.selected),
    "topotracer",
  );
  for (const [width, height] of [
    [390, 844],
    [844, 390],
    [1440, 900],
  ]) {
    await p.setViewportSize({ width, height });
    await p.waitForTimeout(1200);
    assert.equal(
      await p.evaluate(() => window.artifactsExperience.selected),
      "topotracer",
      "rotation preserves the active app",
    );
  }
  await p.close();
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
    [667, 375, 2],
  ];
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
    await page.waitForTimeout(1900);
    for (const i of [0, 1, 2, 3, 4, 8, 10, 19]) {
      await scene(page, i);
      const bounds = await page.evaluate(() => {
        const h = document.querySelector(".header").getBoundingClientRect(),
          s = document.querySelector(".stage").getBoundingClientRect(),
          img = document
            .querySelector(".software-frame:not([hidden]) .software-image")
            ?.getBoundingClientRect(),
          copy = document.querySelector(".atlas-copy").getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          header: h.bottom,
          stage: s.top,
          img: img
            ? {
                top: img.top,
                bottom: img.bottom,
                left: img.left,
                right: img.right,
              }
            : null,
          copy: { bottom: copy.bottom, right: copy.right },
        };
      });
      assert.equal(bounds.overflow, false, width + " overflow " + i);
      assert.ok(
        bounds.stage >= bounds.header - 1,
        width + " header collision " + i,
      );
      if (i >= 4) {
        assert.ok(
          bounds.img.top >= bounds.header - 1,
          width + " image under header",
        );
        assert.ok(
          bounds.img.bottom < height - 50,
          width + " image clipped by navigation",
        );
        assert.ok(
          bounds.copy.bottom < bounds.img.top - 3 ||
            bounds.copy.right < bounds.img.left - 3,
          width + " text/image overlap " + i,
        );
      }
      await shot(page, width + "x" + height + "-scene-" + i);
    }
    await page.locator(".software-frame:not([hidden]) .enlarge").click();
    await page.locator("#capture-image").evaluate((img) => img.decode());
    await page.click("#pixel-view");
    assert.equal(
      await page
        .locator("#capture-image")
        .evaluate((img) => img.getBoundingClientRect().width),
      1425,
    );
    await page.keyboard.press("Escape");
    if (width === 390) {
      await axe(page, "mobile-study");
      await page.selectOption("#app-select", "papyrus-reader");
      await page.waitForTimeout(1700);
      assert.equal(
        await page.evaluate(() => window.artifactsExperience.selected),
        "papyrus-reader",
      );
    }
    // During exit, the header remains opaque and topmost at its logo position.
    await page.evaluate(() =>
      scrollTo({
        top: window.artifactsExperience.step * 19 + innerHeight * 0.8,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(500);
    assert.equal(
      await page.evaluate(() => {
        const b = document.querySelector(".brand").getBoundingClientRect();
        return !!document
          .elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)
          ?.closest(".header");
      }),
      true,
    );
    await shot(page, width + "x" + height + "-exit");
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
  await fallback.waitForTimeout(2200);
  assert.equal(
    await fallback.evaluate(() => window.artifactsExperience.world.webgl),
    false,
  );
  await scene(fallback, 7);
  assert.equal(
    await fallback.evaluate(() => window.artifactsExperience.selected),
    "topotracer",
  );
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
    let last = performance.now();
    for (let i = 0; i < 360; i++)
      await new Promise((resolve) =>
        requestAnimationFrame((t) => {
          samples.push(t - last);
          last = t;
          scrollTo({
            top: (window.artifactsExperience.step * 19 * i) / 359,
            behavior: "instant",
          });
          resolve();
        }),
      );
    await new Promise((r) => setTimeout(r, 1600));
    const before = window.artifactsExperience.world.frames;
    await new Promise((r) => setTimeout(r, 400));
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
  assert.equal(results.performance.idleFrames, 0, "renderer sleeps at rest");
  assert.deepEqual(errors, []);
  assert.ok(
    results.accessibility.every((a) => !a.violations.length),
    JSON.stringify(results.accessibility),
  );
} finally {
  await writeFile(
    resolve(root, ".qa/validation-v8.json"),
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
  server.close();
}
