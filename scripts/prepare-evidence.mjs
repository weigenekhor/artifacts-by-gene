import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createHash } from "node:crypto";
const root = process.argv[2] || "C:/Users/Gene/Desktop/Artifacts Images";
const mapping = [
  ["altus-lotviewer", "Altus LotViewer.png", [76, 385, 1315, 490]],
  ["altus-anko-viewer", "Altus Anko Viewer.png", [80, 190, 1310, 630]],
  ["altus-wafercount", "Altus WaferCounter.png", [80, 220, 1310, 610]],
  ["topotracer", "TopoTracer.png", [95, 310, 1280, 570]],
  ["papyrus-reader", "Papyrus Reader.png", [95, 385, 1280, 315]],
  ["spc-pathfinder", "SPC Pathfinder.png", [80, 195, 1310, 630]],
  ["gan-met-compiler", "GaN Met Compiler.png", [80, 190, 1300, 300]],
  ["gan-temp-diagnoser", "GaN Temp Diagnoser.png", [705, 190, 675, 235]],
  ["aix-dt-assistant", "AIX dT Assistant.png", [720, 155, 650, 720]],
  ["lt-zone-assistant", "LT Zone Assistant.png", [410, 170, 975, 720]],
  ["gan-xml-assistant", "GaN XML Assistant.png", [105, 395, 1260, 300]],
  ["magus-spc-gan", "Magus SPC - GaN.png", [110, 290, 1260, 540]],
  ["magus-spc-legacy", "Magus SPC - Legacy.png", [85, 235, 1300, 465]],
  ["anko-helper", "ANKO Helper.png", [95, 255, 1280, 430]],
  ["lt-report-compiler", "LT Report Compiler.png", [80, 130, 1310, 205]],
  ["metria-spc", "Metria SPC.png", [100, 410, 1260, 440]],
];
const catalogue = JSON.parse(fs.readFileSync("content/apps.json", "utf8"));
const hash = (b) => createHash("sha256").update(b).digest("hex");
const only = process.argv[3];
if (only && !mapping.some((m) => m[0] === only))
  throw Error("Unknown app: " + only);
const audit = only
  ? JSON.parse(fs.readFileSync("assets/evidence/audit.json", "utf8"))
  : [];
for (const [id, file, rect] of mapping) {
  if (only && id !== only) continue;
  const app = catalogue.apps.find((a) => a.id === id);
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
    label: app.evidence.label,
  };
  app.evidence = image;
  const existing = audit.findIndex((a) => a.id === id);
  if (existing >= 0) audit.splice(existing, 1);
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
  JSON.stringify(
    audit.sort(
      (a, b) =>
        mapping.findIndex((m) => m[0] === a.id) -
        mapping.findIndex((m) => m[0] === b.id),
    ),
    null,
    2,
  ) + "\n",
);
console.log(
  "Prepared",
  only ? 1 : mapping.length,
  "lossless application captures.",
);
