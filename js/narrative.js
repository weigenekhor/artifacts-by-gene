// A finite set of engineering records accumulates, aligns and becomes repeatable work.
const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
export function createNarrative(el) {
  const fragments = [...el.querySelectorAll(".work-fragment")],
    caption = el.querySelector(".story-current"),
    count = el.querySelector(".story-count");
  let state = -1;
  return (p, reduced) => {
    if (reduced) p = 1;
    const align = ease((p - 0.4) / 0.24),
      resolve = ease((p - 0.7) / 0.19);
    el.style.setProperty("--align", align);
    el.style.setProperty("--resolve", resolve);
    el.style.setProperty("--accumulate", ease(p / 0.35));
    fragments.forEach((f, i) =>
      f.style.setProperty(
        "--arrive",
        ease((p - (i % 4) * 0.057 - Math.floor(i / 4) * 0.045) / 0.12),
      ),
    );
    const next = p < 0.38 ? 0 : p < 0.7 ? 1 : 2;
    if (next !== state) {
      caption.textContent = [
        "Each record holds part of the answer.",
        "The investigation has to reconnect them. Every time.",
        "A repeated investigation becomes a repeatable method.",
      ][next];
      count.textContent = "0" + (next + 1) + " / 03";
      state = next;
    }
  };
}
