// One spatial model, a quiet opening glimpse and a later complete reveal.
const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
const mix = (a, b, t) => a + (b - a) * t;
export function createHero(stage, apps, wake) {
  let w = 1,
    h = 1,
    clock = 0,
    captionIndex = -1,
    opening = 0;
  const caption = document.createElement("div");
  caption.className = "universe-caption";
  const name = document.createElement("strong"),
    purpose = document.createElement("p");
  name.textContent = "Sixteen working methods.";
  purpose.textContent = "Move through the collection, or enter an application.";
  caption.append(name, purpose);
  stage.append(caption);
  const planes = apps.map((app, i) => {
    const a = document.createElement("a"),
      image = new Image();
    a.className = "universe-plane";
    image.src = app.evidence.full;
    image.width = app.evidence.fullWidth;
    image.height = app.evidence.fullHeight;
    image.alt = app.name + " interface";
    image.decoding = "async";
    image.loading = "lazy";
    a.append(image);
    {
      const target = document.querySelector(
        '[data-study-app="' + app.id + '"]',
      );
      a.href = "#" + target.id;
      a.setAttribute("aria-label", "Explore " + app.name);
      const label = document.createElement("span");
      label.innerHTML =
        "<i>" +
        String(i + 1).padStart(2, "0") +
        "</i>" +
        app.name +
        '<b aria-hidden="true">↗</b>';
      a.append(label);
      a.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const enter = () => {
          target.scrollIntoView({ behavior: "instant" });
          history.replaceState(null, "", a.hash);
        };
        if (
          document.documentElement.classList.contains("reduced") ||
          !document.startViewTransition
        ) {
          enter();
          return;
        }
        const source = target.querySelector(".study-source");
        a.style.viewTransitionName = "artifact-app";
        document
          .startViewTransition(() => {
            a.style.viewTransitionName = "";
            source.style.viewTransitionName = "artifact-app";
            enter();
          })
          .finished.catch(() => {})
          .finally(() => {
            a.style.viewTransitionName = "";
            source.style.viewTransitionName = "";
          });
      });
      a.addEventListener("focus", wake);
      a.addEventListener("blur", wake);
    }
    stage.append(a);
    return { a, app, weight: 0 };
  });
  stage.classList.add("ready");

  return {
    resize() {
      w = stage.clientWidth;
      h = stage.clientHeight;
    },
    render(time, p, px, py, reduced, dt, state) {
      const desiredOpen = reduced
        ? 1
        : state.manual
          ? ease(state.spread)
          : ease(p / 0.58);
      opening +=
        (desiredOpen - opening) * (reduced ? 1 : 1 - Math.exp(-dt / 170));
      const open = opening;

      if (!reduced) clock += Math.min(dt, 40) / 1000;
      const turn = reduced ? 0 : Math.sin(clock * 0.12),
        breath = reduced ? 0 : Math.sin(clock * 0.19);
      const yaw =
        state.yaw * 0.26 + (reduced ? 0 : px * 0.1) + turn * 0.14 * open;
      const pitch =
        state.pitch * 0.18 + (reduced ? 0 : py * 0.035) + breath * 0.025;
      const mobile = w < 700,
        unit = mobile ? 0.46 : Math.min(1.35, w / 1400);
      const cx = w * 0.5,
        cy = h * 0.5;
      stage.style.setProperty("--unfold", open);
      const expand = stage.closest("section").querySelector("[data-expand]");
      if (
        expand &&
        expand.getAttribute("aria-pressed") !== String(open > 0.5)
      ) {
        expand.setAttribute("aria-pressed", String(open > 0.5));
        expand.innerHTML =
          open > 0.5
            ? 'Gather the collection <span aria-hidden="true">−</span>'
            : 'Open the collection <span aria-hidden="true">+</span>';
      }
      stage.parentElement.style.setProperty("--unfold", open);
      let strongest = -1,
        maxWeight = 0.3;
      planes.forEach((plane, i) => {
        const { a } = plane;
        const angle = (i / 16) * Math.PI * 2 - Math.PI / 2 + turn * 0.05 * open;
        let x, y, z, scale;
        {
          // Three interleaved depth registers open into a continuous ellipse.
          x = mix(
            ((i % 4) - 1.5) * 220 * unit,
            Math.cos(angle) * w * (mobile ? 0.35 : 0.36),
            open,
          );
          y = mix(
            (Math.floor(i / 4) - 1.5) * 95 * unit,
            Math.sin(angle) * h * (mobile ? 0.24 : 0.31),
            open,
          );
          z = mix(
            ((i % 3) - 1) * 90,
            Math.sin(angle * 2 + 0.6) * (mobile ? 25 : 105),
            open,
          );
          scale = mix(0.8, mobile ? 0.62 : 0.67, open) * unit;
        }
        const normX = ((cx + x) / w) * 2 - 1,
          normY = ((cy + y) / h) * 2 - 1;
        const distance = (px - normX) ** 2 + (py - normY) ** 2;
        const target = reduced
          ? 0
          : document.activeElement === a
            ? 1
            : Math.exp(-distance * 9);
        plane.weight = mix(plane.weight, target, 1 - Math.exp(-dt / 230));
        const focus = plane.weight;
        if (focus > maxWeight) {
          strongest = i;
          maxWeight = focus;
        }
        const X = x * Math.cos(yaw) + z * Math.sin(yaw),
          Z = -x * Math.sin(yaw) + z * Math.cos(yaw);
        const Y = y * Math.cos(pitch) - Z * Math.sin(pitch),
          depth =
            y * Math.sin(pitch) +
            Z * Math.cos(pitch) +
            focus * (mobile ? 16 : 65);
        const drift = reduced ? 0 : Math.sin(clock * 0.25 + i * 0.6);
        a.style.transform = `translate3d(${cx + X}px,${cy + Y}px,${depth}px) translate(-50%,-50%) rotateX(${(5 + pitch * 35 + drift) * (1 - focus * 0.65)}deg) rotateY(${(-Math.cos(angle) * 11 + yaw * 45 + drift) * (1 - focus * 0.55)}deg) scale(${scale * (1 + focus * 0.09)})`;
        a.style.opacity = "1";
        a.style.zIndex = String(Math.round(depth + 500));
        a.style.setProperty(
          "--plane-light",
          (0.1 + focus * 0.2 + breath * 0.02).toFixed(3),
        );
      });
      if (strongest >= 0 && strongest !== captionIndex) {
        name.textContent = planes[strongest].app.name;
        purpose.textContent = planes[strongest].app.description;
        captionIndex = strongest;
      }
      return !reduced;
    },
  };
}
