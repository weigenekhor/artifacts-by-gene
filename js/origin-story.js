const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (v) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
const mix = (a, b, t) => a + (b - a) * t;
// Six holds, one evolving field. All motion runs on the page's shared clock.
export function createOriginStory(section, wake) {
  const pages = [...section.querySelectorAll(".origin-page")];
  const buttons = [...section.querySelectorAll("[data-origin-step]")];
  const fragments = [...section.querySelectorAll(".ev-fragment")];
  const field = section.querySelector(".evidence-field");
  let top = 0,
    distance = 1,
    current = 0,
    manual = null,
    lastY = -1,
    lastDraw = "";
  const scattered = [
    [90, 125, -8],
    [445, 82, 5],
    [300, 285, -5],
    [80, 440, 7],
    [505, 390, -6],
    [360, 530, 4],
  ];
  const ordered = [
    [85, 155, 0],
    [480, 155, 0],
    [85, 330, 0],
    [480, 330, 0],
    [85, 505, 0],
    [480, 505, 0],
  ];
  buttons.forEach((b, i) =>
    b.addEventListener("click", () => {
      manual = i + 0.22;
      wake();
    }),
  );
  return {
    measure() {
      top = section.offsetTop;
      distance = Math.max(1, section.offsetHeight - innerHeight);
    },
    update(y, reduced, dt) {
      if (y !== lastY) manual = null;
      lastY = y;
      const compact = innerWidth <= 700 || reduced;
      const target = manual ?? clamp(((y - top) / distance) * 5.8, 0, 5.8);
      current = reduced
        ? target
        : mix(current, target, 1 - Math.exp(-dt / 105));
      const drawing = current.toFixed(3) + "|" + compact + "|" + reduced;
      if (drawing === lastDraw) return Math.abs(current - target) > 0.001;
      lastDraw = drawing;
      const index = Math.min(5, Math.floor(current));
      pages.forEach((page, i) => {
        page.classList.toggle("current", i === index);
        page.inert = !compact && i !== index;
        page.setAttribute("aria-hidden", String(!compact && i !== index));
      });
      buttons.forEach((b, i) =>
        b.setAttribute("aria-current", String(i === index)),
      );
      // Mobile uses a compact moving evidence field above six readable chapters.
      const p = reduced ? 4.7 : current;
      const repeat = ease(p - 0.5) * (1 - ease((p - 2.4) / 0.8));
      const pressure = ease(p - 1.6) * (1 - ease(p - 3));
      const order = ease((p - 2.5) / 0.6);
      const software = ease(p - 3.7);
      const resolve = ease((p - 4.8) / 0.7);
      field.style.setProperty("--recurrence", repeat);
      field.style.setProperty("--logic", order);
      field.style.setProperty("--software", software);
      field.style.setProperty("--resolution", resolve);
      fragments.forEach((el, i) => {
        const a = scattered[i],
          b = ordered[i];
        const x = mix(a[0] + Math.sin(i * 2) * pressure * 35, b[0], order);
        const yy = mix(a[1] + (i % 2 ? 24 : -24) * pressure, b[1], order);
        const collapse = resolve * 0.48;
        el.setAttribute(
          "transform",
          `translate(${mix(x, 400 + (i % 2 ? 175 : -255), collapse)} ${mix(yy, 160 + Math.floor(i / 2) * 190, collapse)}) rotate(${a[2] * (1 - order)}) scale(${1 - resolve * 0.3})`,
        );
        el.style.opacity = String(1 - resolve * 0.88);
      });
      section.dataset.scene = String(index);
      return Math.abs(current - target) > 0.001;
    },
  };
}
