import { schedule, signals } from "./time.js";
import { usage } from "./wafers.js";
import { compile, report } from "./reports.js";
import {
  history,
  pathfinder,
  diagnose,
  configuration,
  spc,
  legacy,
  planning,
} from "./exhibition.js";
import { arrange, zones } from "./physical.js";
import { recipes } from "./recipes.js";
export const renderers = {
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
