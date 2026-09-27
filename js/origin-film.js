import { drawWork } from "./films/environment.js";
import { drawing } from "./films/drawing.js";
import { cinema, at, mix } from "./films/set.js";
import {
  paintCollectionField,
  paintWorkingStructures,
  workSpaceProjection,
} from "./collection-layout.js";

// One architectural environment. The camera visits an obstruction, a correction,
// and an output station before revealing their shared foundation. No mock UI.
export function drawOrigin(c, { width: w, height: h, p, px = 0, py = 0 }) {
  const day = at(p, 0.81, 0.55),
    night = at(p, 4.45, 1.55),
    m = w < 700;
  const color = [8, 14, 19].map((v, i) =>
    mix(mix(v, [232, 232, 224][i], day), [9, 15, 22][i], night),
  );
  c.fillStyle = `rgb(${color.join(",")})`;
  c.fillRect(0, 0, w, h);
  if (p >= 6.15) {
    paintCollectionField(c, w, h);
    paintWorkingStructures(c, w, h, 1);
    return;
  }
  const q = (p - 0.82) / 5.25,
    d = drawing(c, night < 0.55, m);
  const keys = [
    [0, -0.42, 0.72, 1.32, -680, -30],
    [0.16, -0.32, 0.48, 1.08, -610, -20],
    [0.32, -0.28, 0.54, 1.08, -555, 0],
    [0.49, 0.3, 0.64, 1.47, 0, -25],
    [0.64, -0.24, 0.83, 1.4, 600, 0],
    [0.81, -0.1, 0.57, 0.52, 0, 0],
    [1, 0, 0, 1, 0, 0],
  ];
  const mapPoint = workSpaceProjection(w, h, at(p, 4.74, 1.14));
  const g = cinema(d, q, w, h, keys, m, mapPoint);
  drawWork(g, p);
  g.draw();
}

export function workingSurfacePose(w, h, p) {
  const m = w < 700,
    t = at(p, 4.95, 1.15),
    form = at(p, 4.68, 0.45);
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
    visible: form,
    recognition: at(p, 5.5, 0.55),
  };
}
