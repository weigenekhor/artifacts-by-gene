const clamp = (v) => Math.max(0, Math.min(1, v)),
  ease = (v) => {
    v = clamp(v);
    return v * v * (3 - 2 * v);
  };
export function createNarrative(el) {
  const lanes = [...el.querySelectorAll(".investigation-lane")],
    caption = el.querySelector(".story-current"),
    count = el.querySelector(".story-count"),
    phase = el.querySelector(".story-phase");
  let previous = -1;
  return (p, reduced) => {
    if (reduced) p = 0.8;
    const gather = ease((p - 0.09) / 0.22),
      problem = ease((p - 0.31) / 0.15),
      response = ease((p - 0.55) / 0.2),
      finish = ease((p - 0.85) / 0.06),
      headingOut = ease((p - 0.53) / 0.07),
      responseIn = ease((p - 0.61) / 0.12),
      responseOut = ease((p - 0.81) / 0.04);
    el.style.setProperty("--gather", gather);
    el.style.setProperty("--problem", problem);
    el.style.setProperty("--response", response);
    el.style.setProperty("--finish", finish);
    el.style.setProperty("--heading-out", headingOut);
    el.style.setProperty("--response-in", responseIn);
    el.style.setProperty("--response-out", responseOut);
    el.querySelectorAll(".investigation-tool").forEach(
      (a) => (a.inert = response < 0.9),
    );
    el.querySelector(".investigation-end").inert = finish < 0.9;
    const dark = problem * (1 - response);
    el.style.setProperty(
      "--chapter-bg",
      `rgb(${224 - dark * 210} ${226 - dark * 208} ${214 - dark * 199})`,
    );
    el.style.setProperty(
      "--chapter-ink",
      `rgb(${39 + dark * 193} ${48 + dark * 187} ${32 + dark * 191})`,
    );
    lanes.forEach((l, i) =>
      l.style.setProperty("--lane-in", ease((p - i * 0.052) / 0.16)),
    );
    const next = p < 0.17 ? 0 : p < 0.34 ? 1 : p < 0.56 ? 2 : p < 0.83 ? 3 : 4;
    if (next !== previous) {
      phase.textContent = [
        "The records",
        "The workload",
        "The repeated investigation",
        "The method becomes software",
        "The collection",
      ][next];
      caption.textContent = [
        "A run leaves more than one kind of record.",
        "History to reconstruct. Revisions to compare. Variation to locate.",
        "The data is available. Connecting it is still manual work.",
        "Recurring requirements became dedicated applications.",
        "Sixteen tools developed around specific engineering tasks.",
      ][next];
      count.textContent = String(next + 1).padStart(2, "0") + " / 05";
      previous = next;
    }
  };
}
