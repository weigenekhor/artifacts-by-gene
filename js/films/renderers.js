import { history, schedule, usage, pathfinder } from "./history-worlds.js";
import { recipes, configuration, report } from "./document-worlds.js";
import { arrange, zones, diagnose } from "./hardware-worlds.js";
import {
  compile,
  spc,
  legacy,
  planning,
  signals,
} from "./measurement-worlds.js";
const scenes = {
  history,
  schedule,
  planning,
  signals,
  usage,
  pathfinder,
  diagnose,
  configuration,
  compile,
  report,
  legacy,
  spc,
  arrange,
  zones,
  compare: recipes,
};
export const renderers = Object.fromEntries(
  Object.entries(scenes).map(([key, scene]) => [
    key,
    (d, q, f, ...rest) => {
      d.focus = f;
      return scene(d, q, f, ...rest);
    },
  ]),
);
