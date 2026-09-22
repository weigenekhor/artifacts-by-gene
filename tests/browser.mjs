import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url),
  root = resolve(import.meta.dirname, ".."),
  { apps } = JSON.parse(
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
  const p = new URL(req.url, "http://localhost").pathname.replace(
      /^\/artifacts-by-gene\//,
      "/",
    ),
    f = resolve(root, "." + p.replace(/\/$/, "/index.html"));
  if (!f.startsWith(root + sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    res.setHeader("Content-Type", mime[extname(f)] || "text/plain");
    res.end(await readFile(f));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = "http://127.0.0.1:" + server.address().port + "/artifacts-by-gene/";
const browser = await chromium.launch({
    headless: true,
    channel: process.env.BROWSER_CHANNEL || "msedge",
  }),
  report = { apps: [], viewports: [], accessibility: [], errors: [] };
function watch(p) {
  p.on("pageerror", (e) => report.errors.push(e.message));
  p.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) report.errors.push(m.text());
  });
  p.on("response", (r) => {
    if (r.status() >= 400) report.errors.push(r.status() + " " + r.url());
  });
}
async function axe(p, label) {
  await p.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const result = await p.evaluate(() =>
    axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    }),
  );
  report.accessibility.push({
    label,
    violations: result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
}
async function app(p, i) {
  await p.evaluate((i) => window.artifactsExperience.goApp(i, true), i);
  await p.waitForTimeout(650);
  assert.equal(await p.evaluate(() => window.artifactsExperience.active), i);
}
async function feature(p, id) {
  await p.evaluate((id) => {
    const e = document.getElementById(id);
    scrollTo({
      top:
        e.getBoundingClientRect().top +
        scrollY -
        document.querySelector(".header").offsetHeight +
        innerHeight * 0.28,
      behavior: "instant",
    });
  }, id);
  await p.waitForTimeout(200);
}
await mkdir(resolve(root, ".qa"), { recursive: true });
try {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  watch(p);
  await p.goto(url);
  await p.waitForTimeout(1600);
  await axe(p, "desktop");
  assert.equal(await p.locator(".app-node").count(), 16);
  for (let i = 0; i < 16; i++) {
    await app(p, i);
    assert.equal(await p.locator("#archive-name").innerText(), apps[i].name);
    await p.click("#archive-open");
    await p.locator("#capture-image").evaluate((img) => img.decode());
    assert.deepEqual(
      await p
        .locator("#capture-image")
        .evaluate((img) => [img.naturalWidth, img.naturalHeight]),
      [apps[i].evidence.fullWidth, apps[i].evidence.fullHeight],
    );
    if (i === 4) {
      await axe(p, "viewer");
      await p.click("#pixel-view");
      assert.equal(
        await p
          .locator("#capture-image")
          .evaluate((img) => img.getBoundingClientRect().width),
        1531,
      );
    }
    await p.keyboard.press("Escape");
    assert.equal(
      await p.evaluate(() => document.activeElement.id),
      "archive-open",
    );
    report.apps.push(apps[i].id);
  }
  await app(p, 0);
  await p.locator(".archive-rail a").nth(8).click();
  await p.waitForTimeout(1300);
  assert.equal(await p.evaluate(() => window.artifactsExperience.active), 8);
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(1300);
  assert.equal(await p.evaluate(() => window.artifactsExperience.active), 9);
  for (const id of ["compare", "surface", "diagnose", "signals"]) {
    await feature(p, id);
    const input = p.locator("#" + id + " input");
    await input.fill("20");
    await input.dispatchEvent("input");
    await p.waitForTimeout(100);
    assert.equal(
      await p
        .locator("#" + id)
        .evaluate((e) => e.style.getPropertyValue("--progress")),
      "0.2",
    );
    await input.fill("85");
    await input.dispatchEvent("input");
    await p.waitForTimeout(100);
    assert.equal(
      await p
        .locator("#" + id)
        .evaluate((e) => e.style.getPropertyValue("--progress")),
      "0.85",
    );
  }
  await p.goto(url + "#app-papyrus-reader");
  await p.waitForTimeout(1700);
  assert.equal(await p.evaluate(() => window.artifactsExperience.active), 4);
  await p.close();
  for (const [width, height, dpr] of [
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
  ]) {
    const q = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: dpr,
      hasTouch: width < 900,
      isMobile: width < 701,
    });
    watch(q);
    await q.goto(url);
    await q.waitForTimeout(1600);
    await q.screenshot({
      path: resolve(root, `.qa/v10-test-${width}-hero.png`),
    });
    for (const id of ["compare", "surface", "diagnose", "signals"]) {
      await feature(q, id);
      const metrics = await q.locator("#" + id).evaluate((el) => {
        const copy = el.querySelector(".feature-copy").getBoundingClientRect(),
          visual = el.querySelector(".feature-visual").getBoundingClientRect(),
          evidence = el.querySelector(".evidence").getBoundingClientRect(),
          control = el.querySelector(".study-control").getBoundingClientRect();
        const overlap = (a, b) =>
          a.left < b.right - 3 &&
          a.right > b.left + 3 &&
          a.top < b.bottom - 3 &&
          a.bottom > b.top + 3;
        return {
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          copyVisual: overlap(copy, visual),
          copyControl: overlap(copy, control),
          controlEvidence: overlap(control, evidence),
        };
      });
      assert.equal(metrics.overflow, false, width + " overflow");
      assert.equal(metrics.copyVisual, false, width + " copy/visual " + id);
      assert.equal(metrics.copyControl, false, width + " copy/control " + id);
      assert.equal(
        metrics.controlEvidence,
        false,
        width + " control/evidence " + id,
      );
      await q.screenshot({
        path: resolve(root, `.qa/v10-test-${width}-${id}.png`),
      });
    }
    for (const i of [0, 4, 8, 15]) {
      await app(q, i);
      const m = await q.evaluate(() => {
        const stage = document
            .querySelector(".archive-stage")
            .getBoundingClientRect(),
          header = document.querySelector(".header").getBoundingClientRect(),
          img = document
            .querySelector(".archive-images figure.active button")
            .getBoundingClientRect(),
          bottom = document
            .querySelector(".archive-bottom")
            .getBoundingClientRect();
        return {
          stageTop: stage.top,
          headerBottom: header.bottom,
          imgBottom: img.bottom,
          navTop: bottom.top,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      });
      assert.equal(m.overflow, false);
      assert.ok(m.stageTop >= m.headerBottom - 2, width + " archive header");
      assert.ok(m.imgBottom < m.navTop - 2, width + " archive nav");
      await q.screenshot({
        path: resolve(root, `.qa/v10-test-${width}-app-${i}.png`),
      });
    }
    if (width === 390) await axe(q, "mobile");
    report.viewports.push({ width, height, dpr });
    await q.close();
  }
  const reduced = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  watch(reduced);
  await reduced.goto(url);
  await reduced.waitForTimeout(700);
  assert.equal(
    await reduced.evaluate(() => window.artifactsExperience.reduced),
    true,
  );
  await feature(reduced, "surface");
  assert.equal(
    await reduced
      .locator("#surface")
      .evaluate((el) => el.style.getPropertyValue("--progress")),
    "1",
  );
  await app(reduced, 15);
  await axe(reduced, "reduced");
  await reduced.close();
  const nojs = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  watch(nojs);
  await nojs.goto(url);
  assert.equal(await nojs.locator(".app-node").count(), 16);
  assert.equal(await nojs.locator(".archive-images img").count(), 16);
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
  await perf.waitForTimeout(2000);
  report.performance = await perf.evaluate(async () => {
    const frames = [],
      tasks = [];
    const obs = new PerformanceObserver((l) =>
      tasks.push(...l.getEntries().map((e) => e.duration)),
    );
    obs.observe({ type: "longtask" });
    let last = performance.now();
    for (let i = 0; i < 360; i++)
      await new Promise((r) =>
        requestAnimationFrame((t) => {
          frames.push(t - last);
          last = t;
          scrollTo({
            top:
              ((document.documentElement.scrollHeight - innerHeight) * i) / 359,
            behavior: "instant",
          });
          r();
        }),
      );
    await new Promise((r) => setTimeout(r, 1500));
    const before = window.artifactsExperience.frames;
    await new Promise((r) => setTimeout(r, 400));
    const idle = window.artifactsExperience.frames - before;
    obs.disconnect();
    frames.sort((a, b) => a - b);
    return {
      median: frames[180],
      p95: frames[342],
      longTasks: tasks,
      idleFrames: idle,
    };
  });
  assert.equal(report.performance.idleFrames, 0);
  await perf.close();
  assert.deepEqual(report.errors, []);
  assert.ok(
    report.accessibility.every((s) => !s.violations.length),
    JSON.stringify(report.accessibility),
  );
} finally {
  await writeFile(
    resolve(root, ".qa/validation-v10.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  server.close();
}
