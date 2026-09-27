import { createPapyrusStudy } from "./papyrus-study.js";
import { createInstrumentFilm } from "./instrument-film.js";

export function createStudy(el, wake) {
  const stage = el.querySelector(".feature-stage");
  let idle;
  const showControls = () => {
    stage.dataset.controls = "active";
    clearTimeout(idle);
    idle = setTimeout(() => {
      stage.dataset.controls = "quiet";
    }, 1400);
  };
  stage.addEventListener("pointermove", showControls, { passive: true });
  stage.addEventListener("pointerdown", showControls, { passive: true });
  stage.addEventListener("focusin", showControls);
  stage.dataset.controls = "quiet";
  return el.dataset.feature === "compare"
    ? createPapyrusStudy(el, wake)
    : createInstrumentFilm(el, wake);
}
