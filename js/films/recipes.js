import { lens, at, mix, palette as P } from "./cinema.js";
// Recipe text comparison, grounded in the current Ref.txt / Golden HEMT Coat capture.
// The changed anneal time is transcribed; the surrounding sequence is illustrative.
export function recipes(d, q, f, W, H, m, hit) {
  const s = lens(d, W, H, m, P.violet),
    align = at(q, 0.12, 0.3),
    isolate = at(q, 0.48, 0.22),
    inspect = at(q, 0.73, 0.14);
  const left = W * 0.1,
    right = W * 0.57,
    width = W * 0.33;
  for (let side = 0; side < 2; side++) {
    const x = side ? right : left;
    s.label(
      side ? "Compared recipe" : "Reference recipe",
      x,
      H * 0.09,
      22,
      s.ink,
    );
    for (let row = 0; row < 28; row++) {
      const y = H * (0.17 + row * 0.023),
        offset =
          (side ? 1 : -1) * (1 - align) * Math.sin(row * 0.7) * H * 0.035;
      const changed = row === 10 || row === 19;
      s.line(
        [
          [x, y + offset],
          [x + width * (0.35 + ((row * 7) % 13) / 20), y + offset],
        ],
        changed ? P.violet : P.muted,
        changed ? 2.5 : 1,
        changed ? 1 : 1 - isolate * 0.86,
      );
    }
  }
  const y = H * 0.4,
    spread = at(q, 0.48, 0.23);
  s.alpha(align * (1 - inspect), () => {
    s.line(
      [
        [left + width, y],
        [right, y],
      ],
      P.violet,
      1.5,
    );
    s.point(mix(left + width, right, at(q, 0.36, 0.18)), y, 4, P.violet);
  });
  const plateY = mix(y, H * 0.53, spread);
  s.alpha(spread, () => {
    s.rect(W * 0.07, plateY - 56, W * 0.86, 126, "#111725");
    s.label("Anneal_Time", W * 0.1, plateY - 18, 26, s.ink);
    s.label("00:05:00", W * 0.1, plateY + 39, m ? 34 : 45, P.violet);
    s.label("00:15:00", W * 0.9, plateY + 39, m ? 34 : 45, "#ee9895", "right");
    s.line(
      [
        [W * 0.43, plateY + 25],
        [W * 0.55, plateY + 25],
      ],
      P.violet,
      1.8,
    );
  });
  s.alpha(inspect, () => {
    s.label(
      "A changed duration, found in context.",
      W * 0.1,
      H * 0.89,
      23,
      s.ink,
    );
  });
  hit(0.5, W * 0.06, H * 0.4, W * 0.9, H * 0.4, "Anneal duration");
  return "Recipe comparison · Anneal_Time 00:05:00 → 00:15:00 · from the supplied capture";
}
