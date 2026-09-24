// Pointer, keyboard and touch input all settle on the shared page clock.
export function createHeroInteraction(canvas, wake) {
  const scope = canvas.closest("section"),
    expand = scope.querySelector("[data-expand]"),
    reset = scope.querySelector("[data-reset]");
  const target = { yaw: 0, pitch: 0, spread: 0 },
    current = { ...target };
  let manual = false,
    drag = null,
    suppressClick = false;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function toggle() {
    if (!expand) return;
    manual = true;
    target.spread =
      Number(canvas.style.getPropertyValue("--unfold")) > 0.5 ? 0 : 1;
    expand.setAttribute("aria-pressed", String(!!target.spread));
    expand.innerHTML = target.spread
      ? 'Gather the collection <span aria-hidden="true">−</span>'
      : 'Open the collection <span aria-hidden="true">+</span>';
    wake();
  }
  function restore() {
    target.yaw = target.pitch = 0;
    manual = false;
    target.spread = 0;
    wake();
  }
  expand?.addEventListener("click", toggle);
  reset?.addEventListener("click", restore);
  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 5) {
      drag.moved = true;
      canvas.setPointerCapture(e.pointerId);
    }
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
    suppressClick = !!drag?.moved;
    drag = null;
    canvas.classList.remove("dragging");
    if (canvas.hasPointerCapture(e.pointerId))
      canvas.releasePointerCapture(e.pointerId);
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener(
    "click",
    (e) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
      }
    },
    true,
  );
  canvas.addEventListener("keydown", (e) => {
    if (e.target.closest("a, button")) return;
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
      return { ...current, manual, moving };
    },
    get state() {
      return { ...current };
    },
  };
}
