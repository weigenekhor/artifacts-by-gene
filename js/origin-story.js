// One finite scene clock: evidence develops, repeats, aligns, then resolves into identity.
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (v) => {
  v = clamp(v);
  return v * v * v * (v * (v * 6 - 15) + 10);
};
const mix = (a, b, t) => a + (b - a) * t;
export function createOriginStory(section, wake) {
  const pages = [...section.querySelectorAll(".origin-page")],
    buttons = [...section.querySelectorAll("[data-origin-step]")],
    fragments = [...section.querySelectorAll(".ev-fragment")],
    field = section.querySelector(".evidence-field");
  const artwork = fragments.map((el) => [
    ...el.querySelectorAll(
      ":scope > .ev-art > path,:scope > .ev-art > ellipse",
    ),
  ]);
  artwork.flat().forEach((el) => {
    el.setAttribute("pathLength", "1");
    el.style.strokeDasharray = "1";
  });
  const echoes = fragments.map((el) => [
    ...el.querySelectorAll(".ev-echo > g"),
  ]);
  const marks = fragments.map((el) => [
    ...el.querySelectorAll(":scope > .ev-art > circle"),
  ]);
  const branches = [...section.querySelectorAll(".ev-branches path")];
  let top = 0,
    distance = 1,
    current = 0,
    manual = null,
    lastY = -1,
    lastDraw = "",
    active = -1,
    beatTime = 0;
  const scattered = [
    [55, 145, -5],
    [475, 115, 4],
    [95, 330, -3],
    [465, 345, 3],
    [60, 525, -4],
    [475, 535, 3],
  ];
  const ordered = [
    [80, 140, 0],
    [470, 140, 0],
    [80, 330, 0],
    [470, 330, 0],
    [80, 520, 0],
    [470, 520, 0],
  ];
  buttons.forEach((b, i) =>
    b.addEventListener("click", () => {
      manual = i === 5 ? 6.05 : i + 0.38;
      wake();
    }),
  );
  return {
    measure() {
      top = section.offsetTop;
      distance = Math.max(1, section.offsetHeight - innerHeight);
      lastDraw = "";
    },
    update(y, reduced, dt) {
      if (y !== lastY) manual = null;
      lastY = y;
      const compact = innerWidth <= 700 || reduced;
      const target = manual ?? clamp(((y - top) / distance) * 6.45, 0, 6.45);
      current = reduced
        ? target
        : mix(current, target, 1 - Math.exp(-dt / 125));
      const index = Math.min(5, Math.floor(current));
      if (index !== active) {
        active = index;
        beatTime = 0;
      }
      const visible = y + innerHeight > top && y < top + section.offsetHeight;
      if (visible) beatTime = Math.min(2800, beatTime + dt);
      const beat = reduced ? 1 : ease(beatTime / 2400);
      const drawing = [
        current.toFixed(3),
        compact,
        reduced,
        beat.toFixed(3),
      ].join("|");
      const moving =
        Math.abs(current - target) > 0.001 ||
        (!reduced && visible && beatTime < 2800);
      if (drawing === lastDraw) return moving;
      lastDraw = drawing;
      pages.forEach((page, i) => {
        page.classList.toggle("current", i === index);
        page.inert = !compact && i !== index;
        page.setAttribute("aria-hidden", String(!compact && i !== index));
      });
      buttons.forEach((b, i) =>
        b.setAttribute("aria-current", String(i === index)),
      );
      const p = reduced ? 4.7 : current,
        repeat = ease((p - 0.55) / 0.6) * (1 - ease((p - 2.55) / 0.6)),
        pressure = ease(p - 1.5) * (1 - ease(p - 3)),
        order = ease((p - 2.55) / 0.65),
        software = ease((p - 3.5) / 0.9),
        resolve = ease((p - 4.7) / 0.9),
        finale = compact ? 0 : ease((p - 5.15) / 0.65);
      field.style.setProperty("--recurrence", repeat);
      field.style.setProperty("--logic", order);
      field.style.setProperty("--software", software);
      field.style.setProperty("--resolution", resolve);
      section.style.setProperty("--finale", finale);
      section.style.setProperty("--completion", compact ? 1 : finale);
      section.classList.toggle("finale-active", !compact && finale > 0.75);
      field.style.transform = compact
        ? "none"
        : `perspective(1400px) rotateY(${(1 - order) * -7 + pressure * 3}deg) rotateX(${pressure * 3}deg) translateZ(${pressure * 25}px)`;
      fragments.forEach((el, i) => {
        const a = scattered[i],
          b = ordered[i],
          pulse = Math.sin(beat * Math.PI + i * 0.3) * pressure;
        const x = mix(a[0] + pulse * 14, b[0], order),
          yy = mix(a[1] + (i % 2 ? 10 : -10) * pressure, b[1], order);
        const convergence = ease((p - 4.8) / 0.5);
        el.setAttribute(
          "transform",
          `translate(${mix(x, 360, convergence)} ${mix(yy, 330, convergence)}) rotate(${a[2] * (1 - order)}) scale(${1 - convergence * 0.92})`,
        );
        el.style.opacity = String(1 - ease((p - 4.8) / 0.5));
        artwork[i].forEach((path, j) => {
          const drawing = reduced ? 1 : clamp(beat * 1.6 - j * 0.08 - i * 0.04);
          path.style.strokeDashoffset = 1 - drawing;
        });
        echoes[i].forEach((g, j) => {
          const offset = (j + 1) * (6 + repeat * 12 * beat);
          g.setAttribute("transform", `translate(${offset * 0.4} ${-offset})`);
        });
        marks[i].forEach((dot, j) => {
          dot.style.opacity = 0.2 + 0.8 * ease(beat * 2 - j * 0.1);
          dot.setAttribute(
            "r",
            String(2 + 2 * Math.sin(Math.PI * clamp(beat * 2 - j * 0.12))),
          );
        });
      });
      branches.forEach((path, i) => {
        const draw = ease((p - 2.85 - i * 0.055) / 0.65);
        path.style.strokeDashoffset = 1 - draw;
        path.style.opacity = (1 - resolve) * draw;
      });
      section.dataset.scene = String(index);
      return moving;
    },
  };
}
