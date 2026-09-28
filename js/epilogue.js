import { at, mix, drawing } from "./films/drawing.js";
import { studio, C } from "./films/studio.js";

// The investigation's rule persists in the DOM while the surrounding set clears.
// Each sentence occupies a different physical composition, with no copy rewrite.
export function createEpilogue(section) {
  const beats = [...section.querySelectorAll(".creator-beat")],
    stage = section.querySelector(".creator-stage"),
    rule = section.querySelector(".creator-rule"),
    contact = section.querySelector(".creator-contact"),
    canvas = section.querySelector("canvas"),
    c = canvas.getContext("2d");
  document.body.append(rule);
  let top = 0,
    height = 1,
    p = 0,
    gutter = 0,
    header = 0,
    w = 1,
    h = 1,
    dpr = 1,
    last = -1;
  return {
    measure() {
      top = section.offsetTop;
      height = Math.max(1, section.offsetHeight - innerHeight);
      const style = getComputedStyle(stage);
      gutter = parseFloat(style.paddingLeft) || 0;
      header = parseFloat(style.top) || 0;
      w = stage.clientWidth;
      h = stage.clientHeight;
      dpr = Math.min(devicePixelRatio || 1, w < 700 ? 1.5 : 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      last = -1;
    },
    update(y, dt, reduced) {
      if (y + innerHeight < top || y > top + height + innerHeight) {
        if (y + innerHeight < document.querySelector("#signals").offsetTop)
          rule.style.opacity = "0";
        return false;
      }
      const target = Math.max(0, Math.min(1, (y - top) / height));
      p = reduced ? target : mix(p, target, 1 - Math.exp(-dt / 65));
      const starts = [0, 0.245, 0.49, 0.75],
        ends = [0.24, 0.49, 0.75, 1.2];
      beats.forEach((el, i) => {
        const enter = i === 0 ? 1 : at(p, starts[i], 0.07),
          leave = at(p, ends[i] - 0.055, 0.055),
          visible = enter * (1 - leave);
        el.style.setProperty("--beat", visible > 0.001 ? 1 : 0);
        const moves = [
            [-20, 0, 0],
            [100, 14, -100],
            [0, 0, 80],
            [0, 32, 0],
          ],
          t = moves[i];
        el.style.transform = reduced
          ? "none"
          : `perspective(1600px) translate3d(${(1 - enter) * t[0] - leave * 35}px,${(1 - enter) * t[1] - leave * 22}px,${(1 - enter) * t[2]}px) rotateY(${i === 1 ? (1 - enter) * 8 : 0}deg)`;
        el.style.clipPath = reduced
          ? "none"
          : `inset(${(1 - enter) * 100}% 0 ${leave * 100}% 0)`;
        el.inert = !reduced && visible < 0.1;
        el.setAttribute("aria-hidden", String(!reduced && visible < 0.1));
      });
      const handoff = at((y - top) / innerHeight, -0.92, 0.92),
        crossing = !reduced && y < top + innerHeight * 0.06;
      rule.classList.toggle("is-handoff", crossing);
      const rotation = -90 * at(p, 0.235, 0.15) * (1 - at(p, 0.7, 0.05)),
        length = mix(w - gutter * 2, h * 0.64, at(p, 0.235, 0.15));
      Object.assign(rule.style, {
        left:
          (crossing
            ? mix(Number(rule.dataset.originX) || w * 0.53, gutter, handoff)
            : gutter) + "px",
        top:
          (crossing
            ? mix(
                Number(rule.dataset.originY) || h * 0.3,
                header + h * 0.78,
                handoff,
              )
            : header + h * 0.78) + "px",
        width:
          (crossing
            ? mix(
                Number(rule.dataset.originLength) || h * 0.5,
                w - gutter * 2,
                handoff,
              )
            : length) + "px",
        transform: `rotate(${crossing ? mix(Number(rule.dataset.originAngle) || 90, 0, handoff) : rotation}deg)`,
        opacity: reduced ? "0" : String(0.45 * (1 - at(p, 0.75, 0.055))),
      });
      if (c && Math.abs(p - last) > 0.0001) {
        last = p;
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.clearRect(0, 0, w, h);
        if (!reduced) {
          const visible = at(p, 0.49, 0.055) * (1 - at(p, 0.72, 0.03)),
            automate = at(p, 0.52, 0.07),
            rebuild = at(p, 0.62, 0.07);
          const d = drawing(c, true, w < 700),
            g = studio(d, w, h, {
              yaw: -0.16,
              pitch: 0.25,
              zoom: w < 700 ? 0.6 : 0.86,
              x: -80,
              y: 0,
            });
          // One crease persists. Repeated depth compresses into its fold; the
          // barrier opens in the perpendicular axis. No framed prose or extra copy.
          const fold = Math.PI * 0.42 * (1 - automate);
          for (let i = 0; i < 12; i++) {
            const x = 210 + i * 18 * (1 - automate);
            const z = Math.sin(fold) * i * 12;
            g.line(
              [
                [x, -260, z],
                [x, 250, z],
              ],
              C.dim,
              0.6,
              visible * 0.12,
            );
          }
          const hinge = 225,
            opening = rebuild * Math.PI * 0.36;
          for (const side of [-1, 1]) {
            const edge = hinge + side * 170 * Math.cos(opening);
            const z = Math.sin(opening) * 170;
            g.face(
              [
                [hinge, -300, 0],
                [edge, -300, z],
                [edge, 300, z],
                [hinge, 300, 0],
              ],
              C.pale,
              visible * 0.12,
            );
            g.line(
              [
                [edge, -300, z],
                [edge, 300, z],
              ],
              C.dim,
              0.8,
              visible * 0.25,
            );
          }
          g.draw();
        }
      }
      contact.style.opacity = reduced ? 1 : at(p, 0.91, 0.05);
      contact.inert = !reduced && p < 0.91;
      return !reduced && Math.abs(p - target) > 0.0002;
    },
  };
}
