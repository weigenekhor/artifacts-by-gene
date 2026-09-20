import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createHash } from "node:crypto";
const root = process.argv[2] || "C:/Users/Gene/Desktop/Artifacts Images";
const mapping = [
  [
    "altus-lotviewer",
    "Altus LotViewer.png",
    [76, 385, 1315, 490],
    "Lot events, wafer states and durations",
    "Events, in order.",
  ],
  [
    "altus-anko-viewer",
    "Altus Anko Viewer.png",
    [80, 190, 1310, 630],
    "Reactor schedules in a common view",
    "The next task, visible.",
  ],
  [
    "altus-wafercount",
    "Altus WaferCounter.png",
    [80, 220, 1310, 610],
    "Chamber usage counters",
    "Usage, across chambers.",
  ],
  [
    "topotracer",
    "TopoTracer.png",
    [95, 310, 1280, 570],
    "Interpolated wafer surface and scale",
    "Give measurements a shape.",
  ],
  [
    "papyrus-reader",
    "Papyrus Reader.png",
    [95, 385, 1280, 315],
    "Actual paired recipe panes with marked changes",
    "Compare meaning, not line numbers.",
  ],
  [
    "spc-pathfinder",
    "SPC Pathfinder.png",
    [80, 195, 1310, 630],
    "Grouped chart selection",
    "Find the chart. Keep the context.",
  ],
  [
    "gan-met-compiler",
    "GaN Met Compiler.png",
    [80, 190, 1300, 300],
    "Metrology processing log",
    "From source files to reports.",
  ],
  [
    "gan-temp-diagnoser",
    "GaN Temp Diagnoser.png",
    [705, 190, 675, 235],
    "Diagnostic summary and recommended checks",
    "Turn observations into a direction.",
  ],
  [
    "aix-dt-assistant",
    "AIX dT Assistant.png",
    [720, 155, 650, 720],
    "Baseplate assignment visualization",
    "Make the arrangement visible.",
  ],
  [
    "lt-zone-assistant",
    "LT Zone Assistant.png",
    [410, 170, 975, 720],
    "Inner and outer zone geometry",
    "See the zone you are adjusting.",
  ],
  [
    "gan-xml-assistant",
    "GaN XML Assistant.png",
    [105, 395, 1260, 300],
    "Structured configuration differences",
    "See what changed.",
  ],
  [
    "magus-spc-gan",
    "Magus SPC - GaN.png",
    [110, 290, 1260, 540],
    "GaN parameter control charts",
    "The process, in view.",
  ],
  [
    "magus-spc-legacy",
    "Magus SPC - Legacy.png",
    [85, 235, 1300, 465],
    "Legacy parameter review and statuses",
    "Bring the checks together.",
  ],
  [
    "anko-helper",
    "ANKO Helper.png",
    [95, 255, 1280, 430],
    "Maintenance statuses and due dates",
    "Know what needs attention.",
  ],
  [
    "lt-report-compiler",
    "LT Report Compiler.png",
    [80, 130, 1310, 205],
    "Report compilation activity",
    "Bring the report together.",
  ],
  [
    "metria-spc",
    "Metria SPC.png",
    [100, 410, 1260, 440],
    "Interactive parameter chart and range overview",
    "One parameter. The full context.",
  ],
];
const catalogue = JSON.parse(fs.readFileSync("content/apps.json", "utf8"));
const hash = (b) => createHash("sha256").update(b).digest("hex");
const audit = [];
for (const [id, file, rect, label, line] of mapping) {
  const src = path.join(root, file),
    m = await sharp(src).metadata(),
    [left, top, width, height] = rect,
    region = { left, top, width, height };
  const dest = `assets/evidence/${id}`;
  fs.mkdirSync(dest, { recursive: true });
  await sharp(src)
    .extract(region)
    .webp({ lossless: true, effort: 6 })
    .toFile(dest + "/detail.webp");
  await sharp(src)
    .webp({ lossless: true, effort: 6 })
    .toFile(dest + "/full.webp");
  const image = {
    src: dest + "/detail.webp",
    full: dest + "/full.webp",
    width,
    height,
    fullWidth: m.width,
    fullHeight: m.height,
    label,
  };
  Object.assign(
    catalogue.apps.find((a) => a.id === id),
    { evidence: image, headline: line },
  );
  audit.push({
    id,
    file,
    sourceWidth: m.width,
    sourceHeight: m.height,
    sourceSha256: hash(fs.readFileSync(src)),
    fullPixelSha256: hash(await sharp(src).ensureAlpha().raw().toBuffer()),
    region,
    detailSha256: hash(fs.readFileSync(image.src)),
    pixelSha256: hash(
      await sharp(src).extract(region).ensureAlpha().raw().toBuffer(),
    ),
  });
}
fs.writeFileSync(
  "content/apps.json",
  JSON.stringify(catalogue, null, 2) + "\n",
);
fs.writeFileSync(
  "assets/evidence/audit.json",
  JSON.stringify(audit, null, 2) + "\n",
);
console.log("Prepared", audit.length, "lossless current UI details.");
