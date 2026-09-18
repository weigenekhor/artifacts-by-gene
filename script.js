import { initializeMotion } from "./js/motion.js";
import { initializeSurface } from "./js/surface.js";
import { initializeExhibition } from "./js/exhibition.js";
initializeMotion();
initializeExhibition();
initializeSurface();
document.querySelector("#year").textContent = new Date().getFullYear();
