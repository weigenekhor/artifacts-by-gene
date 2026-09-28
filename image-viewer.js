// Native dialog supplies background inertness. Only the selected original is loaded.
const viewer = document.querySelector(".image-viewer");
const closeButton = viewer.querySelector(".viewer-close");
const imageSlot = viewer.querySelector(".viewer-image");
const status = viewer.querySelector(".viewer-status");
const reduceViewerMotion = matchMedia("(prefers-reduced-motion: reduce)");
let trigger = null, request = 0, closing = 0, opening = 0, position = 0;

function finishClose() {
  clearTimeout(closing);
  closing = 0;
  viewer.close();
}

function closeViewer() {
  if (!viewer.open || closing) return;
  request++;
  cancelAnimationFrame(opening);
  viewer.classList.remove("is-visible");
  if (reduceViewerMotion.matches) finishClose();
  else closing = setTimeout(finishClose, 360);
}

async function openViewer(button) {
  if (viewer.open) return;
  const ticket = ++request;
  trigger = button;
  position = scrollY;
  const preview = button.querySelector("img");
  const width = Number(preview.getAttribute("width"));
  const height = Number(preview.getAttribute("height"));
  imageSlot.style.setProperty("--capture-width", `${width}px`);
  imageSlot.style.setProperty("--capture-ratio", width / height);
  const image = new Image();
  image.alt = preview.alt;
  image.width = width;
  image.height = height;
  image.src = preview.currentSrc || preview.src;
  imageSlot.replaceChildren(image);
  status.textContent = "Loading full-resolution image…";
  viewer.setAttribute("aria-label", `${button.dataset.name} — full-resolution screenshot`);
  document.documentElement.classList.add("viewer-open");
  viewer.showModal();
  closeButton.focus({preventScroll: true});
  // Two frames give the starting opacity a painted state without a forced layout.
  opening = requestAnimationFrame(() => {
    opening = requestAnimationFrame(() => viewer.classList.add("is-visible"));
  });
  const original = new Image();
  original.alt = preview.alt;
  original.decoding = "async";
  original.src = button.dataset.full;
  try {
    await original.decode();
    if (ticket !== request || !viewer.open) return;
    original.width = original.naturalWidth;
    original.height = original.naturalHeight;
    imageSlot.replaceChildren(original);
    status.textContent = "";
  } catch {
    if (ticket === request && viewer.open) status.textContent = "Full-resolution image unavailable. Showing the gallery capture.";
  }
}

if (typeof viewer.showModal === "function") {
  for (const button of document.querySelectorAll(".capture-button")) {
    button.disabled = false;
    button.addEventListener("click", () => openViewer(button));
  }
}
closeButton.addEventListener("click", closeViewer);
viewer.addEventListener("cancel", event => { event.preventDefault(); closeViewer(); });
viewer.addEventListener("click", event => {
  if (event.target === viewer || event.target === imageSlot) closeViewer();
});
viewer.addEventListener("keydown", event => {
  // There is one interactive control; keep Tab and Shift+Tab inside the modal.
  if (event.key === "Tab") { event.preventDefault(); closeButton.focus(); }
});
viewer.addEventListener("close", () => {
  request++;
  cancelAnimationFrame(opening);
  clearTimeout(closing);
  closing = 0;
  viewer.classList.remove("is-visible");
  document.documentElement.classList.remove("viewer-open");
  imageSlot.replaceChildren();
  status.textContent = "";
  trigger?.focus({preventScroll: true});
  if (scrollY !== position) scrollTo({top: position, behavior: "instant"});
  trigger = null;
});
reduceViewerMotion.addEventListener("change", () => {
  if (closing && reduceViewerMotion.matches) finishClose();
});
