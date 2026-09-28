import { chromium } from "playwright";
import { createServer } from "node:http";
import fs from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url),
  root = resolve(import.meta.dirname, "..");
const { apps } = JSON.parse(await fs.readFile("content/apps.json", "utf8"));
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
  const path = new URL(req.url, "http://localhost").pathname.replace(
      /^\/artifacts-by-gene\//,
      "/",
    ),
    file = resolve(root, "." + path.replace(/\/$/, "/index.html"));
  if (!file.startsWith(root + sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    res.setHeader("Content-Type", mime[extname(file)] || "text/plain");
    res.end(await fs.readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = "http://127.0.0.1:" + server.address().port + "/artifacts-by-gene/";
const browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || "msedge",
    headless: true,
  }),
  report = {
    errors: [],
    images: [],
    interactions: [],
    handoff: [],
    accessibility: [],
  };
await fs.mkdir(".qa", { recursive: true });
const page = async (options = {}) => {
  const p = await browser.newPage(options);
  p.on("pageerror", (e) => report.errors.push(e.message));
  p.on("response", (r) => {
    if (r.status() >= 400) report.errors.push(r.status() + " " + r.url());
  });
  await p.goto(url, { waitUntil: "networkidle" });
  return p;
};
const scroll = async (p, selector) => {
  await p.locator(selector).first().scrollIntoViewIfNeeded();
  await p.waitForTimeout(220);
};
const axe = async (p, label) => {
  await p.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const violations = await p.evaluate(async () => {
    const r = await axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    });
    return r.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        reason: n.failureSummary,
      })),
    }));
  });
  report.accessibility.push({ label, violations });
};
try {
  const p = await page({ viewport: { width: 1440, height: 900 } });
  assert.equal(await p.title(), "Artifacts by Gene");
  assert.equal(await p.locator(".gallery-card").count(), 16);
  assert.equal(await p.locator("main .feature").count(), 0);
  assert.equal(
    await p
      .locator(".gallery-grid")
      .evaluate(
        (e) => getComputedStyle(e).gridTemplateColumns.split(" ").length,
      ),
    2,
  );
  for (const [i, a] of apps.entries())
    assert.equal(
      await p.locator(".gallery-card h3").nth(i).innerText(),
      a.name,
    );
  const text = await p.locator("body").innerText();
  for (const phrase of [
    "What the work demanded.",
    "Correspondence",
    "A software suite by",
  ])
    assert.ok(!text.includes(phrase));
  await scroll(p, ".gallery-card");
  await p.mouse.move(0, 0);
  assert.equal(
    (await p.evaluate(() => window.artifactsExperience.gallery)).filter(
      (s) => s.active,
    ).length,
    0,
    "Desktop does not autoplay",
  );
  const rest = p.locator(".gallery-card").first().locator(".gallery-fallback");
  await rest.evaluate((e) => e.decode());
  assert.equal(
    await rest.evaluate((e) => getComputedStyle(e).opacity),
    "1",
    "The actual screenshot is the resting frame",
  );
  await p.locator(".gallery-card").first().hover();
  await p.waitForTimeout(700);
  let states = await p.evaluate(() => window.artifactsExperience.gallery);
  assert.equal(states.filter((s) => s.active).length, 1);
  assert.ok(states[0].elapsed > 300);
  await p.waitForTimeout(7100);
  const elapsed = (
    await p.evaluate(() => window.artifactsExperience.gallery)
  )[0].elapsed;
  await p.waitForTimeout(300);
  assert.equal(
    (await p.evaluate(() => window.artifactsExperience.gallery))[0].elapsed,
    elapsed,
  );
  await p.mouse.move(0, 0);
  await p.waitForTimeout(1300);
  assert.equal(
    (await p.evaluate(() => window.artifactsExperience.gallery))[0].alpha,
    0,
  );
  assert.equal(
    await rest.evaluate((e) => getComputedStyle(e).opacity),
    "1",
    "Mouse leave returns to the original screenshot",
  );
  await p.locator(".gallery-card").first().focus();
  await p.waitForTimeout(250);
  assert.equal(
    (await p.evaluate(() => window.artifactsExperience.gallery))[0].active,
    true,
  );
  await axe(p, "desktop gallery");
  for (let i = 0; i < 16; i++) {
    const card = p.locator(".gallery-card").nth(i);
    await card.scrollIntoViewIfNeeded();
    await card.click();
    assert.equal(await p.locator("#film-detail").evaluate((e) => e.open), true);
    const id = await p.locator(".feature.is-open").getAttribute("id");
    await p.locator("#" + id + " .film-original").click();
    await p.locator("#capture-image").evaluate((e) => e.decode());
    assert.deepEqual(
      await p
        .locator("#capture-image")
        .evaluate((e) => [e.naturalWidth, e.naturalHeight]),
      [apps[i].evidence.fullWidth, apps[i].evidence.fullHeight],
    );
    if (i === 4) {
      await p.locator("#pixel-view").click();
      assert.equal(
        await p
          .locator("#capture-image")
          .evaluate((e) => e.getBoundingClientRect().width),
        1425,
      );
    }
    await p.keyboard.press("Escape");
    assert.equal(
      await p.evaluate(() => document.activeElement.className),
      "film-original",
    );
    await p.keyboard.press("Escape");
    assert.equal(
      await card.evaluate((e) => e === document.activeElement),
      true,
    );
    report.images.push(apps[i].id);
  }
  report.interactions.push(
    "desktop one-shot, hold, settle, keyboard focus, all 16 details and originals, modal return focus",
  );
  // Trace the shared homepage across the boundary. Its opacity cannot fall after first reveal.
  await p.mouse.move(0, 0);
  await p
    .locator(".gallery-card")
    .first()
    .evaluate((e) => e.blur());
  for (const v of [5.7, 5.9, 6.1, 6.3, 6.5, 6.65, 6.75, 6.8, 6.85, 6.9]) {
    await p.evaluate((v) => {
      const s = document.querySelector(".genesis");
      scrollTo({
        top: ((s.offsetHeight - innerHeight) * v) / 6.8,
        behavior: "instant",
      });
    }, v);
    await p.waitForTimeout(400);
    const st = await p.locator(".collection-home").evaluate((e) => {
      const r = e.getBoundingClientRect();
      let opacity = 1;
      for (let p = e; p; p = p.parentElement)
        opacity *= +getComputedStyle(p).opacity;
      return {
        count: document.querySelectorAll(".collection-home").length,
        opacity,
        x: r.x,
        y: r.y,
        w: r.width,
        h: r.height,
        owner: e.parentElement.className,
      };
    });
    report.handoff.push({ v, ...st });
    assert.equal(st.count, 1);
    if (v >= 6.1)
      assert.ok(st.opacity > 0.98, "homepage lost during handoff at " + v);
  }
  for (const width of [1440, 1280, 390]) {
    await p.setViewportSize({
      width,
      height: width === 1440 ? 900 : width === 1280 ? 800 : 844,
    });
    for (const v of [0, 1.7, 2.7, 3.6, 4.7, 5.7, 6.1, 6.8]) {
      await p.evaluate(
        (v) =>
          scrollTo({
            top:
              ((document.querySelector(".genesis").offsetHeight - innerHeight) *
                v) /
              6.8,
            behavior: "instant",
          }),
        v,
      );
      await p.waitForTimeout(250);
      await p.screenshot({
        path: ".qa/review-" + width + "-origin-" + v + ".png",
      });
    }
    await scroll(p, ".app-gallery");
    await p.mouse.move(0, 0);
    await p.screenshot({ path: ".qa/review-" + width + "-gallery.png" });
    await p.evaluate(() => {
      const e = document.querySelector("#gene");
      scrollTo(0, e.offsetTop + (e.offsetHeight - innerHeight) * 0.78);
    });
    await p.waitForTimeout(200);
    await p.screenshot({ path: ".qa/review-" + width + "-gene.png" });
    assert.equal(
      await p.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
    );
  }
  await p.close();
  const mobile = await page({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
  });
  assert.equal(
    await mobile
      .locator(".gallery-grid")
      .evaluate(
        (e) => getComputedStyle(e).gridTemplateColumns.split(" ").length,
      ),
    1,
  );
  for (const i of [0, 3, 8, 15]) {
    await mobile
      .locator(".gallery-card")
      .nth(i)
      .evaluate((e) =>
        e.scrollIntoView({ block: "center", behavior: "instant" }),
      );
    await mobile.waitForTimeout(400);
    const s = await mobile.evaluate(() => window.artifactsExperience.gallery);
    assert.equal(s.filter((x) => x.active).length, 1);
    assert.equal(s[i].active, true);
  }
  await axe(mobile, "mobile gallery");
  await mobile.close();
  report.interactions.push("single-column mobile, one centered preview");
  const reduced = await page({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await scroll(reduced, ".app-gallery");
  await reduced.waitForTimeout(500);
  assert.equal(
    (await reduced.evaluate(() => window.artifactsExperience.gallery)).filter(
      (s) => s.active,
    ).length,
    0,
  );
  await reduced.locator(".gallery-card").nth(4).click();
  await reduced.waitForTimeout(350);
  await reduced.screenshot({ path: ".qa/review-reduced-film.png" });
  await axe(reduced, "reduced detail");
  await reduced.close();
  const nojs = await page({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false,
  });
  assert.equal(await nojs.locator(".gallery-fallback").count(), 16);
  assert.equal(
    await nojs.locator(".gallery-card").first().getAttribute("href"),
    apps[0].evidence.full,
  );
  await nojs.close();
  report.interactions.push("reduced motion and static/no-JS originals");
  assert.deepEqual(report.errors, []);
  assert.equal(
    report.accessibility.flatMap((x) => x.violations).length,
    0,
    "accessibility: see .qa/browser-results.json",
  );
} finally {
  await fs.writeFile(
    ".qa/browser-results.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
  await browser.close();
  server.close();
}
