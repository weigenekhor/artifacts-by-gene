// Five causal stages share the page clock. No autonomous story animation loop.
const clamp = (v) => Math.max(0, Math.min(1, v)),
  ease = (v) => {
    v = clamp(v);
    return v * v * (3 - 2 * v);
  };
export function createMethodStory(section, wake) {
  const pages = [...section.querySelectorAll("[data-method-phase]")],
    units = [...section.querySelectorAll(".method-unit")],
    controls = [...section.querySelectorAll("[data-method-step]")],
    caption = section.querySelector("#method-field-label");
  const captions = [
    "Recurring engineering work",
    "A response worth keeping",
    "Reusable engineering methods",
    "Methods with an interface",
    "The accumulated collection",
  ];
  let top = 0,
    length = 1,
    manual = null,
    last = -1,
    lastKey = "";
  controls.forEach((button, i) =>
    button.addEventListener("click", () => {
      manual = i / 4;
      wake();
    }),
  );
  addEventListener(
    "scroll",
    () => {
      manual = null;
    },
    { passive: true },
  );
  return {
    measure() {
      top = section.getBoundingClientRect().top + scrollY;
      length = Math.max(1, section.offsetHeight - innerHeight);
      lastKey = "";
    },
    update(y, reduced) {
      const staticLayout = reduced || innerWidth < 700;
      const p = staticLayout ? 1 : (manual ?? clamp((y - top) / length)),
        step = staticLayout ? 4 : Math.min(4, Math.floor(p * 5));
      const key = p.toFixed(4) + staticLayout;
      if (key === lastKey) return;
      lastKey = key;
      section.style.setProperty("--method-p", p);
      section.style.setProperty(
        "--method-align",
        staticLayout ? 1 : ease((p - 0.15) / 0.3),
      );
      section.style.setProperty(
        "--method-software",
        staticLayout ? 1 : ease((p - 0.56) / 0.15),
      );
      if (step !== last || staticLayout) {
        pages.forEach((page, i) => {
          page.classList.toggle("current", i === step);
          page.setAttribute("aria-hidden", String(!staticLayout && i !== step));
        });
        controls.forEach((button, i) =>
          button.setAttribute("aria-current", String(i === step)),
        );
        caption.textContent = captions[step];
        last = step;
      }
      units.forEach((u, i) => {
        const col = Math.floor(i / 8),
          align = staticLayout ? 1 : ease((p - 0.12) / 0.3),
          software = staticLayout ? 1 : ease((p - 0.57) / 0.15);
        const shift = (1 - align) * ((i % 3) - 1) * 20;
        u.style.transform = staticLayout
          ? "none"
          : `translate3d(${shift}px,${(1 - align) * Math.sin(i * 2) * 5}px,${(1 - align) * (i % 4) * 4}px) rotateY(${(1 - align) * (col ? -6 : 6)}deg)`;
        u.style.setProperty("--task-opacity", 1 - ease((p - 0.32) / 0.08));
        u.style.setProperty(
          "--method-opacity",
          ease((p - 0.32) / 0.08) * (1 - software),
        );
        u.style.setProperty("--tool-opacity", software);
      });
    },
  };
}
