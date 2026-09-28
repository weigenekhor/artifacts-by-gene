import assert from "node:assert/strict";
import {
  baseplateExample as e,
  assignedTemperatures,
  temperatureSpan,
} from "../js/baseplate-example.js";
import { baseplatePositions } from "../js/films/hardware-worlds.js";
const permutations = (a) =>
  a.length
    ? a.flatMap((v, i) =>
        permutations(a.filter((_, j) => j !== i)).map((p) => [v, ...p]),
      )
    : [[]];
assert.deepEqual(e.states.map(temperatureSpan), [16, 8, 0]);
assert.equal(
  temperatureSpan(e.states[2]),
  Math.min(...permutations(e.states[0]).map(temperatureSpan)),
);
assert.deepEqual(assignedTemperatures(e.states[2]), [720, 720, 720, 720, 720]);
for (let i = 1; i < e.states.length; i++)
  assert.equal(
    e.states[i].filter((v, j) => v !== e.states[i - 1][j]).length,
    2,
    "Each movement exchanges exactly two baseplates",
  );
const seats = baseplatePositions(0);
for (const [time, assignment] of [
  [2.5, e.states[1]],
  [4.2, e.states[2]],
]) {
  const positions = baseplatePositions(time);
  assignment.forEach((plate, slot) =>
    positions[plate].forEach((value, axis) =>
      assert.ok(
        Math.abs(value - seats[slot][axis]) < 1e-6,
        "The rendered plate must reach the evaluated slot",
      ),
    ),
  );
}
for (let t = 0; t <= 5.2; t += 0.01) {
  const poses = baseplatePositions(t);
  for (let i = 0; i < 5; i++)
    for (let j = i + 1; j < 5; j++) {
      const [a, b] = [poses[i], poses[j]];
      assert.ok(
        Math.hypot(a[0] - b[0], a[1] - b[1]) >= 98 ||
          Math.abs(a[2] - b[2]) > 15,
        "Swapping plates need physical clearance",
      );
    }
}
console.log(
  "Two exchanges preserve all five baseplates and reach the optimal assignment for the labelled illustrative fixture.",
);
