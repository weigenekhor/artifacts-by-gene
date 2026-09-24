// The opening object is the collection itself: sixteen real interface planes.
// Native scrolling, direct manipulation and replay use the same finite page clock.
const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => {
  v = clamp(v);
  return v * v * v * (v * (v * 6 - 15) + 10);
};
const mix = (a, b, t) => a + (b - a) * t;
export function createHero(stage, apps) {
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
    a.addEventListener("pointerenter", () => describe(app));
    a.addEventListener("focus", () => describe(app));
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
      const yaw = state.yaw * 0.38 + (reduced ? 0 : px * 0.035),
        pitch = state.pitch * 0.32 + (reduced ? 0 : py * 0.025);
      const key = [expansion, departure, yaw, pitch, w, h]
        .map((n) => n.toFixed(4))
        .join("|");
      if (key === last) return false;
      last = key;
      const mobile = w < 700,
        unit = mobile ? 0.62 : Math.min(1.2, w / 1440),
        cx = mix(mobile ? 0.5 : 0.65, 0.5, expansion) * w,
        cy = h * (mobile ? 0.52 : 0.57);
      stage.style.setProperty("--unfold", expansion);
      stage.parentElement.style.setProperty("--unfold", expansion);
      stage.style.setProperty("--departure", departure);
      stage.classList.toggle("unfolded", expansion > 0.6);
      stage.inert = departure > 0.93;
      for (const { a, i } of planes) {
        const theta = (i / 16) * Math.PI * 2 - Math.PI * 0.5;
        // A compact helical assembly becomes a radial, legible collection.
        const rx = mix(142 * unit, w * (mobile ? 0.37 : 0.365), expansion),
          ry = mix(118 * unit, h * (mobile ? 0.23 : 0.29), expansion);
        const orbit = theta + yaw * (1 - expansion * 0.55),
          z = Math.sin(theta * 2 + 0.5) * mix(100, 24, expansion) * unit;
        let x = Math.cos(orbit) * rx,
          y = Math.sin(orbit) * ry;
        const sy = Math.sin(pitch),
          co = Math.cos(pitch),
          Y = y * co - z * sy,
          Z = y * sy + z * co;
        const travel = 1 + departure * 4.8;
        const scale =
          mix(0.83 + (i % 3) * 0.04, mobile ? 0.47 : 0.67, expansion) * unit;
        const angleX =
          mix(18 + Math.cos(theta) * 13, Math.sin(theta) * -5, expansion) +
          pitch * 24;
        const angleY =
          mix(-26 + Math.sin(theta) * 24, Math.cos(theta) * -12, expansion) +
          yaw * 20;
        const angleZ = mix(-18 + i * 2.4, Math.cos(theta) * 3, expansion);
        a.hidden = departure > 0.998;
        a.tabIndex = departure > 0.8 ? -1 : 0;
        a.style.transform =
          "translate3d(" +
          (cx + x * travel) +
          "px," +
          (cy + Y * travel) +
          "px," +
          Z +
          "px) translate(-50%,-50%) rotateX(" +
          angleX +
          "deg) rotateY(" +
          angleY +
          "deg) rotateZ(" +
          angleZ +
          "deg) scale(" +
          scale * (1 + departure * 0.6) +
          ")";
        a.style.opacity = 1 - ease((departure - 0.75) / 0.25);
        a.style.setProperty(
          "--plane-light",
          (0.18 + (Z + 160) / 640).toFixed(3),
        );
        a.style.zIndex = String(Math.round(Z + 300));
      }
      return false;
    },
  };
}
