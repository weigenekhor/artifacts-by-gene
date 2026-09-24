// The opening object is the collection itself: sixteen real interface planes.
// Native scrolling, direct manipulation and replay use the same finite page clock.
const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => {
  v = clamp(v);
  return v * v * v * (v * (v * 6 - 15) + 10);
};
const mix = (a, b, t) => a + (b - a) * t;
export function createHero(stage, apps, wake) {
  let hover = -1,
    clock = 0;
  const caption = document.createElement("div");
  caption.className = "universe-caption";
  const name = document.createElement("strong"),
    purpose = document.createElement("p");
  name.textContent = "Explore ARTIFACTS.";
  purpose.textContent = "Choose an interface. Follow its work.";
  caption.append(name, purpose);
  stage.append(caption);
  const describe = (app) => {
    name.textContent = app.name;
    purpose.textContent = app.description;
  };
  const planes = apps.map((app, i) => {
    const a = document.createElement("a"),
      image = new Image(),
      label = document.createElement("span");
    a.className = "universe-plane";
    a.href =
      "#" + document.querySelector('[data-study-app="' + app.id + '"]').id;
    a.setAttribute("aria-label", "Explore " + app.name);
    a.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const target = document.querySelector(a.hash),
        source = target.querySelector(".study-source");
      const reduced = document.documentElement.classList.contains("reduced");
      const enter = () => {
        target.scrollIntoView({ behavior: "instant" });
        history.replaceState(null, "", a.hash);
      };
      if (reduced || !document.startViewTransition) {
        enter();
        return;
      }
      a.style.viewTransitionName = "artifact-app";
      const transition = document.startViewTransition(() => {
        a.style.viewTransitionName = "";
        source.style.viewTransitionName = "artifact-app";
        enter();
      });
      transition.finished
        .catch(() => {})
        .finally(() => {
          a.style.viewTransitionName = "";
          source.style.viewTransitionName = "";
        });
    });
    image.src = app.evidence.full;
    image.width = app.evidence.fullWidth;
    image.height = app.evidence.fullHeight;
    image.alt = "";
    image.decoding = "async";
    if (i > 3) image.loading = "lazy";
    label.innerHTML =
      "<i>" +
      String(i + 1).padStart(2, "0") +
      "</i>" +
      app.name +
      '<b aria-hidden="true">↗</b>';
    a.append(image, label);
    a.addEventListener("pointerenter", () => {
      hover = i;
      describe(app);
      wake();
    });
    a.addEventListener("pointerleave", () => {
      hover = -1;
      wake();
    });
    a.addEventListener("focus", () => {
      describe(app);
      wake();
    });
    a.addEventListener("blur", () => wake());
    stage.append(a);
    return { a, i };
  });
  stage.classList.add("ready");
  let w = innerWidth,
    h = innerHeight,
    last = "";
  return {
    resize() {
      w = stage.clientWidth;
      h = stage.clientHeight;
      last = "";
    },
    render(time, p, px, py, reduced, dt, state) {
      const expansion = Math.max(
          state.spread,
          reduced ? 0 : ease((p - 0.035) / 0.38),
        ),
        departure = reduced ? 0 : ease((p - 0.53) / 0.38);
      const focused = planes.some(({ a }) => a === document.activeElement);
      const animate = !reduced && departure < 0.98 && hover < 0 && !focused;
      if (animate) clock += Math.min(dt, 40) / 1000;
      const breath = reduced ? 0 : Math.sin(clock * 0.19),
        turn = reduced ? 0 : Math.sin(clock * 0.115);
      const yaw =
        state.yaw * 0.3 +
        (reduced ? 0 : px * 0.045) +
        turn * (0.018 + expansion * 0.14);
      const pitch =
        state.pitch * 0.2 +
        (reduced ? 0 : py * 0.028) +
        breath * (0.012 + expansion * 0.055);
      const key = [expansion, departure, yaw, pitch, clock, w, h]
        .map((n) => n.toFixed(4))
        .join("|");
      if (key === last) return animate;
      last = key;
      const mobile = w < 700,
        unit = mobile ? 0.43 : Math.min(1.2, w / 1440),
        cx = mix(mobile ? 0.52 : 0.69, 0.5, expansion) * w,
        cy = h * mix(mobile ? 0.5 : 0.48, 0.55, expansion);
      stage.style.setProperty("--unfold", expansion);
      stage.parentElement.style.setProperty("--unfold", expansion);
      stage.style.setProperty("--departure", departure);
      stage.classList.toggle("unfolded", expansion > 0.6);
      stage.inert = departure > 0.93;
      const layout = [
        [-330, -180, -240, 0.75],
        [-115, -180, -240, 0.75],
        [100, -180, -240, 0.75],
        [205, -10, 90, 1.15],
        [-95, 100, 160, 1.25],
        [-330, -55, -160, 0.76],
        [-115, -55, -160, 0.76],
        [100, -55, -160, 0.76],
        [-330, 70, -100, 0.76],
        [-115, 70, -100, 0.76],
        [100, 70, -100, 0.76],
        [-260, 195, -60, 0.75],
        [-55, 195, -60, 0.75],
        [150, 195, -60, 0.75],
        [310, 120, -40, 0.72],
        [160, 225, 190, 1.05],
      ];
      for (const { a, i } of planes) {
        const theta = (i / 16) * Math.PI * 2 - Math.PI * 0.5;
        const anchor = [3, 4, 15].includes(i),
          l = layout[i];
        const orbital = theta + turn * 0.08 * expansion;
        const x = mix(
          l[0] * unit,
          Math.cos(orbital) * w * (mobile ? 0.37 : 0.34),
          expansion,
        );
        const y = mix(
          l[1] * unit,
          Math.sin(orbital) * h * (mobile ? 0.22 : 0.27),
          expansion,
        );
        const z = mix(
          l[2] * unit,
          Math.sin(theta * 2 + 0.6) * (mobile ? 35 : 120),
          expansion,
        );
        const X = x * Math.cos(yaw) + z * Math.sin(yaw),
          Z = -x * Math.sin(yaw) + z * Math.cos(yaw);
        const Y = y * Math.cos(pitch) - Z * Math.sin(pitch),
          depth = y * Math.sin(pitch) + Z * Math.cos(pitch);
        const travel = 1 + departure * 4.5;
        const scale = mix(l[3], mobile ? 0.6 : 0.64, expansion) * unit;
        const drift = reduced ? 0 : Math.sin(clock * 0.28 + i * 0.55);
        const angleX =
          mix(7, -Math.sin(theta) * 7, expansion) + pitch * 35 + drift * 0.6;
        const angleY =
          mix(-17, -Math.cos(theta) * 12, expansion) +
          yaw * 45 +
          drift * (anchor ? 1.3 : 0.5);
        const angleZ = 0;
        a.hidden = departure > 0.998;
        a.tabIndex = departure > 0.8 ? -1 : 0;
        a.style.transform =
          "translate3d(" +
          (cx + X * travel) +
          "px," +
          (cy + Y * travel) +
          "px," +
          depth +
          "px) translate(-50%,-50%) rotateX(" +
          angleX +
          "deg) rotateY(" +
          angleY +
          "deg) rotateZ(" +
          angleZ +
          "deg) scale(" +
          scale * (1 + departure * 0.6) +
          ")";
        a.style.opacity =
          (1 - ease((departure - 0.75) / 0.25)) *
          mix(anchor ? 1 : 0.64, 1, expansion);
        a.style.setProperty(
          "--plane-light",
          (0.12 + (depth + 240) / 1000 + breath * 0.025).toFixed(3),
        );
        a.style.zIndex = String(Math.round(depth + 500));
      }
      return animate;
    },
  };
}
