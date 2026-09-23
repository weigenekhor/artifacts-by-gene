// Direct manipulation and layer selection feed the same rendering clock as scrolling.
export function createHeroInteraction(apps, wake) {
  const canvas = document.querySelector("#silicon"),
    expand = document.querySelector("#hero-expand"),
    range = document.querySelector("#hero-layer"),
    panel = document.querySelector(".hero-layer-select");
  const target = { yaw: 0, pitch: 0, spread: 0, selected: 0 },
    current = { ...target };
  let drag = null,
    velocity = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function select(index) {
    const a = apps[index];
    target.selected = index;
    range.value = index;
    range.setAttribute("aria-valuetext", a.name);
    document.querySelector("#hero-layer-number").textContent =
      String(index + 1).padStart(2, "0") + " / 16";
    document.querySelector("#hero-layer-name").textContent = a.name;
    const section = document.querySelector('[data-study-app="' + a.id + '"]');
    document.querySelector("#hero-layer-link").href = "#" + section.id;
  }
  function separate() {
    target.spread = target.spread ? 0 : 1;
    panel.hidden = !target.spread;
    expand.setAttribute("aria-pressed", String(Boolean(target.spread)));
    expand.innerHTML = target.spread
      ? 'Close the structure <span aria-hidden="true">↙</span>'
      : 'Open the structure <span aria-hidden="true">↗</span>';
    wake();
  }
  expand.addEventListener("click", separate);
  range.addEventListener("input", () => {
    select(Number(range.value));
    wake();
  });
  document.querySelector("#hero-reset").addEventListener("click", () => {
    target.yaw = target.pitch = 0;
    velocity = 0;
    select(0);
    if (target.spread) separate();
    wake();
  });
  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 };
    velocity = 0;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    target.yaw = clamp(target.yaw + dx * 0.005, -1.4, 1.4);
    target.pitch = clamp(target.pitch + dy * 0.005, -0.75, 0.6);
    velocity = dx * 0.003;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    drag.x = e.clientX;
    drag.y = e.clientY;
    wake();
  });
  function release(e) {
    if (!drag) return;
    const click = drag.moved < 5;
    drag = null;
    canvas.classList.remove("dragging");
    if (canvas.hasPointerCapture(e.pointerId))
      canvas.releasePointerCapture(e.pointerId);
    if (click && e.type === "pointerup") separate();
    wake();
  }
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", (e) => {
    velocity = 0;
    release(e);
  });
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
    velocity = 0;
    if (e.key === "ArrowLeft") target.yaw -= 0.28;
    if (e.key === "ArrowRight") target.yaw += 0.28;
    if (e.key === "ArrowUp")
      target.pitch = clamp(target.pitch - 0.18, -0.75, 0.6);
    if (e.key === "ArrowDown")
      target.pitch = clamp(target.pitch + 0.18, -0.75, 0.6);
    if (e.key === "Enter" || e.key === " ") separate();
    if (e.key.toLowerCase() === "r") {
      target.yaw = target.pitch = 0;
    }
    wake();
  });
  select(0);
  return {
    update(dt, reduced) {
      if (!drag && !reduced) {
        target.yaw = clamp(target.yaw + velocity * (dt / 16.7), -1.4, 1.4);
        velocity *= Math.exp(-dt / 100);
      }
      for (const key of Object.keys(current))
        current[key] =
          key === "selected" || reduced
            ? target[key]
            : current[key] +
              (target[key] - current[key]) * (1 - Math.exp(-dt / 125));
      canvas.parentElement.style.setProperty(
        "--orbit-yaw",
        current.yaw + "rad",
      );
      canvas.parentElement.style.setProperty(
        "--orbit-pitch",
        current.pitch + "rad",
      );
      canvas.parentElement.style.setProperty("--separation", current.spread);
      return {
        ...current,
        moving:
          Math.abs(velocity) > 0.0001 ||
          Object.keys(current).some(
            (k) => Math.abs(current[k] - target[k]) > 0.001,
          ),
      };
    },
    get state() {
      return { ...current };
    },
  };
}
