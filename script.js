import { initializeMotion } from "./js/motion.js";
import { initializeSystems } from "./js/systems.js";
import { initializeSurface } from "./js/surface.js";

initializeMotion();
initializeSystems();
initializeSurface();
document.querySelector("#year").textContent = new Date().getFullYear();
