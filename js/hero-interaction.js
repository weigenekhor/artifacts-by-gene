// Pointer, keyboard and touch input all settle on the shared page clock.
export function createHeroInteraction(apps, wake) {
  const canvas = document.querySelector("#silicon"),
    expand = document.querySelector("#hero-expand"),
    reset = document.querySelector("#hero-reset");
  const target = { yaw: 0, pitch: 0, spread: 0 },
    current = { ...target };
  let drag = null;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function toggle() {
    target.spread = target.spread ? 0 : 1;
    expand.setAttribute("aria-pressed", String(!!target.spread));
    expand.innerHTML = target.spread
      ? 'Rejoin the sections <span aria-hidden="true">−</span>'
      : 'Separate the sections <span aria-hidden="true">+</span>';
    wake();
  }
  function restore() {
    target.yaw = target.pitch = 0;
    if (target.spread) toggle();
    wake();
  }
  expand.addEventListener("click", toggle);
  reset.addEventListener("click", restore);
  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    target.yaw = clamp(target.yaw + (e.clientX - drag.x) * 0.009, -1.3, 1.3);
    target.pitch = clamp(
      target.pitch + (e.clientY - drag.y) * 0.006,
      -0.8,
      0.55,
    );
    drag.x = e.clientX;
    drag.y = e.clientY;
    wake();
  });
  const release = (e) => {
    drag = null;
    canvas.classList.remove("dragging");
    if (canvas.hasPointerCapture(e.pointerId))
      canvas.releasePointerCapture(e.pointerId);
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener("keydown", (e) => {
    if (
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Enter",
        " ",
        "r",
        "R",
      ].includes(e.key)
    )
      return;
    e.preventDefault();
    e.stopPropagation();
    if (e.key === "ArrowLeft") target.yaw = clamp(target.yaw - 0.3, -1.3, 1.3);
    if (e.key === "ArrowRight") target.yaw = clamp(target.yaw + 0.3, -1.3, 1.3);
    if (e.key === "ArrowUp")
      target.pitch = clamp(target.pitch - 0.18, -0.8, 0.55);
    if (e.key === "ArrowDown")
      target.pitch = clamp(target.pitch + 0.18, -0.8, 0.55);
    if (e.key === "Enter" || e.key === " ") toggle();
    if (e.key.toLowerCase() === "r") restore();
    wake();
  });
  return {
    update(dt, reduced) {
      let moving = false;
      for (const k of Object.keys(current)) {
        current[k] = reduced
          ? target[k]
          : current[k] + (target[k] - current[k]) * (1 - Math.exp(-dt / 90));
        if (Math.abs(current[k] - target[k]) < 0.0005) current[k] = target[k];
        else moving = true;
      }
      return { ...current, moving };
    },
    get state() {
      return { ...current };
    },
  };
}
