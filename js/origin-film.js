import { drawWork } from "./films/environment.js";
import { drawing } from "./films/drawing.js";
import { cinema, at, mix } from "./films/set.js";
import {
  paintCollectionField,
  paintWorkingStructures,
  workSpaceProjection,
} from "./collection-layout.js";

export function drawOrigin(c, { width: w, height: h, p, px = 0, py = 0 }) {
  const day = at(p, 0.81, 0.55),
    night = at(p, 4.4, 1.6),
    m = w < 700;
  const color = [8, 14, 19].map((v, i) =>
    mix(mix(v, [232, 235, 233][i], day), [7, 13, 22][i], night),
  );
  c.fillStyle = "rgb(" + color.join(",") + ")";
  c.fillRect(0, 0, w, h);
  if (p >= 6.15) {
    paintCollectionField(c, w, h);
    paintWorkingStructures(c, w, h, 1);
    return;
  }
  const q = (p - 0.82) / 5.25,
    d = drawing(c, night < 0.55, m);
  const keys = [
    [0, -0.52, 0.98, 2.8, -650, -50, 40],
    [0.14, -0.31, 0.84, 1.65, -600, -10, 10],
    [0.3, 0.12, 0.58, 1.35, -600, 0, 0],
    [0.38, -0.32, 0.53, 1.2, -190, 0, 10],
    [0.49, 0.2, 0.42, 1.5, 0, 0, 0],
    [0.57, 0.34, 0.25, 1.15, 440, -20, 45],
    [0.68, -0.15, 0.5, 1.5, 600, 0, 0],
    [0.81, -0.12, 0.48, 0.48, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 0],
  ];
  const g = cinema(
    d,
    q,
    w,
    h,
    keys,
    m,
    workSpaceProjection(w, h, at(p, 4.74, 1.14)),
  );
  drawWork(g, p);
  g.draw();
}
export function workingSurfacePose(w, h, p) {
  const m = w < 700,
    t = at(p, 4.95, 1.15);
  return {
    x: w * 0.5,
    y: mix(h * 0.56, h * 0.48, t),
    width: mix(
      Math.min(w * (m ? 0.64 : 0.34), 570),
      Math.min(w * (m ? 0.72 : 0.38), 640),
      t,
    ),
    ry: mix(-35, 0, t),
    rx: mix(34, 0, t),
    visible: at(p, 4.68, 0.45),
    recognition: at(p, 5.5, 0.55),
  };
}
