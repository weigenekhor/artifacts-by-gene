const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => {
  v = clamp(v);
  return v * v * v * (v * (v * 6 - 15) + 10);
};
// Illustrative paired swaps, not an asserted optimization or measured arrangement.
export function createBaseplateExchange(section) {
  if (section.dataset.feature !== "arrange") return () => {};
  const plates = [...section.querySelectorAll(".swap-carrier")];
  const routes = [...section.querySelectorAll("[data-swap-route]")];
  const positions = plates.map((p) => [
    Number(p.dataset.x),
    Number(p.dataset.y),
  ]);
  const caption = section.querySelector(".swap-caption");
  let foreground = -1;
  return (progress) => {
    plates.forEach((p) => p.setAttribute("transform", "translate(0 0)"));
    const pairs = [
      [0, 2, 0.28, 0.29],
      [1, 4, 0.65, 0.29],
    ];
    pairs.forEach(([a, b, start, duration], pair) => {
      const t = ease((progress - start) / duration),
        lift = Math.sin(t * Math.PI);
      const from = positions[a],
        to = positions[b];
      [a, b].forEach((i, j) => {
        const source = positions[i],
          dest = positions[j ? a : b],
          side = j ? -1 : 1;
        const dx = (dest[0] - source[0]) * t + side * lift * 40;
        const dy = (dest[1] - source[1]) * t - lift * (j ? 24 : 65);
        plates[i].setAttribute("transform", `translate(${dx} ${dy})`);
        plates[i].style.setProperty("--plate-lift", lift);
      });
      routes[pair].setAttribute(
        "d",
        `M${from[0]} ${from[1]}Q${(from[0] + to[0]) / 2 + 40} ${(from[1] + to[1]) / 2 - 65} ${to[0]} ${to[1]}`,
      );
      routes[pair].style.opacity = lift * 0.6;
      // Draw the travelling plate last so the lifted object crosses above its seat.
      if (lift > 0.01 && foreground !== a) {
        plates[a].parentElement.parentElement.append(plates[a].parentElement);
        foreground = a;
      }
    });
    caption.textContent =
      progress < 0.28
        ? "Weight and temperature remain in view"
        : progress < 0.57
          ? "A ↔ C / lift, exchange, seat"
          : progress < 0.65
            ? "First pair seated"
            : progress < 0.94
              ? "B ↔ E / second exchange"
              : "New positions. Original inputs retained.";
  };
}
