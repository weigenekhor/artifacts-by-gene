const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
export function createNarrative(el) {
  const blades = [...el.querySelectorAll(".method-blade")],
    phase = el.querySelector(".method-phase"),
    caption = el.querySelector(".method-caption");
  let last = -1;
  return (p, reduced) => {
    if (reduced) p = 0.95;
    const align = ease((p - 0.08) / 0.52),
      response = ease((p - 0.54) / 0.15),
      expand = ease((p - 0.68) / 0.25);
    el.style.setProperty("--method-out", ease((p - 0.42) / 0.08));
    el.style.setProperty("--method-align", align);
    el.style.setProperty("--method-response", response);
    el.style.setProperty("--method-expand", expand);
    blades.forEach((b, i) => {
      b.style.setProperty("--blade-arrive", ease((p - i * 0.015) / 0.28));
      b.inert = !reduced && expand < 0.8;
    });
    const next = p < 0.37 ? 0 : p < 0.7 ? 1 : 2;
    if (last !== next) {
      phase.textContent = [
        "01 / The requirement",
        "02 / The method",
        "03 / The applications",
      ][next];
      caption.textContent = [
        "The process produces data. Engineering gives it context.",
        "Each repeated task becomes a dedicated tool.",
        "Sixteen applications. Explore each one below.",
      ][next];
      last = next;
    }
  };
}
