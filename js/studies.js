import { createPapyrusStudy } from "./papyrus-study.js";
import { createInstrumentFilm } from "./instrument-film.js";

export function createStudy(el, wake) {
  return el.dataset.feature === "compare"
    ? createPapyrusStudy(el, wake)
    : createInstrumentFilm(el, wake);
}
