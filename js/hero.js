import {
  collectionPosition,
  collectionBounds,
  configureCollection,
  paintCollectionField,
  paintWorkingStructures,
} from "./collection-layout.js";
// Direct inspection presents one interface without rearranging the collection.
const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
const mix = (a, b, t) => a + (b - a) * t;
export function createHero(stage, apps, wake) {
  const home = document.querySelector(".collection-home");
  const scaffold = document.createElement("canvas");
  scaffold.className = "collection-scaffold";
  scaffold.setAttribute("aria-hidden", "true");
  stage.prepend(scaffold);
  const context = scaffold.getContext("2d");
  let hovered = -1,
    focused = -1,
    touched = -1,
    inspection = 0,
    anchor = { x: 0, y: 0 };
  stage.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || stage.classList.contains("dragging"))
      return;
    const target = e.target.closest(".universe-plane");
    if (Math.hypot(e.clientX - anchor.x, e.clientY - anchor.y) > 12) {
      hovered = target ? Number(target.dataset.position) : -1;
      anchor = { x: e.clientX, y: e.clientY };
      wake();
    }
  });
  stage.addEventListener("pointerleave", () => {
    hovered = -1;
    wake();
  });
  let w = 1,
    h = 1,
    clock = 0,
    opening = 0;
  const planes = apps.map((app, i) => {
    const a = document.createElement("a"),
      image = new Image();
    a.className = "universe-plane";
    a.style.opacity = "0";
    a.dataset.app = app.id;
    a.dataset.position = i;
    a.addEventListener("pointerenter", (e) => {
      if (
        e.pointerType === "mouse" &&
        (hovered < 0 ||
          Math.hypot(e.clientX - anchor.x, e.clientY - anchor.y) > 12)
      ) {
        hovered = i;
        anchor = { x: e.clientX, y: e.clientY };
        wake();
      }
    });
    a.addEventListener("focus", () => {
      focused = i;
      hovered = -1;
      wake();
    });
    a.addEventListener("blur", () => {
      if (focused === i) focused = -1;
      wake();
    });
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
        if (e.pointerType === "touch" && touched !== i) {
          touched = i;
          focused = i;
          a.focus({ preventScroll: true });
          wake();
          return;
        }
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
        const source = target.querySelector(".film-capture, .papyrus-capture");
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
      configureCollection(
        w,
        h,
        planes.map(
          (plane) =>
            (plane.size = { w: plane.a.offsetWidth, h: plane.a.offsetHeight }),
        ),
      );
      scaffold.width = w * Math.min(devicePixelRatio || 1, 2);
      scaffold.height = h * Math.min(devicePixelRatio || 1, 2);
    },
    render(time, p, px, py, reduced, dt, state, arrival = 1) {
      const active = hovered >= 0 ? hovered : focused;
      inspection = mix(
        inspection,
        active >= 0 ? 1 : 0,
        1 - Math.exp(-dt / 240),
      );
      const desiredOpen = reduced
        ? 1
        : state.manual
          ? ease(state.spread)
          : ease((p - 0.12) / 0.58);
      opening +=
        (desiredOpen - opening) * (reduced ? 1 : 1 - Math.exp(-dt / 170));
      const open = opening;

      if (!reduced)
        clock += (Math.min(dt, 40) / 1000) * (1 - inspection * 0.96);
      const turn = reduced ? 0 : Math.sin(clock * 0.045),
        breath = reduced ? 0 : Math.sin(clock * 0.055);
      const yaw =
        state.yaw * 0.26 + (reduced ? 0 : px * 0.1) + turn * 0.035 * open;
      const pitch =
        state.pitch * 0.18 + (reduced ? 0 : py * 0.035) + breath * 0.008;
      const mobile = w < 700;
      const cx = w * 0.5,
        cy = h * mix(0.48, mobile ? 0.46 : 0.51, open);
      if (home && (arrival > 0 || reduced)) {
        if (home.parentElement !== stage) stage.append(home);
        home.classList.remove("origin-surface");
        home.style.position = "absolute";
        home.style.left = "50%";
        home.style.width = "";
        home.inert = arrival < 0.6 && !reduced;
        home.style.setProperty("--recognition", 1);
        const retreat = ease(open);
        home.style.transform = `translate(-50%,-50%) translateZ(${-retreat * 230}px) rotateY(${reduced ? 0 : yaw * 12}deg) rotateX(${reduced ? 0 : pitch * 14 - retreat * 5}deg) scale(${mix(1, 0.86, retreat)})`;
        home.style.zIndex = String(Math.round(mix(850, 50, retreat)));
        home.style.opacity = String(mix(1, 0.8, retreat));
        home.style.top = (cy / h) * 100 + "%";
        home.style.setProperty("--home-light", 0.1 + Math.max(0, px) * 0.12);
      }
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
      if (context) {
        context.setTransform(
          scaffold.width / w,
          0,
          0,
          scaffold.height / h,
          0,
          0,
        );
        context.clearRect(0, 0, w, h);
        if (arrival > 0) {
          paintCollectionField(context, w, h);
          paintWorkingStructures(context, w, h, 1, ease(arrival / 0.65));
        }
      }
      planes.forEach((plane, i) => {
        const { a } = plane;
        const position = collectionPosition(i, w, h, open, turn),
          { angle, scale } = position;
        let x = position.x - cx,
          y = position.y - cy,
          z = position.z;
        const target = i === active ? 1 : 0;
        plane.weight = reduced
          ? target
          : mix(plane.weight, target, 1 - Math.exp(-dt / 230));
        const focus = plane.weight;
        const neighbor =
          active < 0
            ? 0
            : Math.exp(
                -Math.hypot(
                  position.x - collectionPosition(active, w, h, open, turn).x,
                  position.y - collectionPosition(active, w, h, open, turn).y,
                ) /
                  (w * 0.16),
              ) *
              inspection *
              (1 - focus);
        x += Math.sign(x) * neighbor * 18;
        z -= neighbor * 65;
        const X = x * Math.cos(yaw) + z * Math.sin(yaw),
          Z = -x * Math.sin(yaw) + z * Math.cos(yaw);
        const Y = y * Math.cos(pitch) - Z * Math.sin(pitch),
          depth =
            y * Math.sin(pitch) +
            Z * Math.cos(pitch) +
            focus * (mobile ? 155 : 360);
        const drift = reduced ? 0 : Math.sin(clock * 0.075 + i * 0.6) * 0.25;
        const reveal = ease((arrival - 0.16 - (i % 4) * 0.11) / 0.42);
        const k = 1600 / (1600 - depth),
          projectedW = plane.size.w * scale * (1 + focus * 0.12) * k,
          projectedH = plane.size.h * scale * (1 + focus * 0.12) * k;
        const { margin: left, top, bottom } = collectionBounds(w, h);
        const screenX = Math.max(
          left + projectedW / 2,
          Math.min(w - left - projectedW / 2, cx + X * (1 - focus * 0.2) * k),
        );
        const screenY = Math.max(
          top + projectedH / 2,
          Math.min(
            bottom - projectedH / 2,
            h / 2 + (cy + Y * (1 - focus * 0.08) - h / 2) * k,
          ),
        );
        const planeX = cx + (screenX - cx) / k,
          planeY = h / 2 + (screenY - h / 2) / k;
        a.style.transform = `translate3d(${planeX}px,${planeY}px,${depth}px) translate(-50%,-50%) rotateX(${(5 + pitch * 35 + drift) * (1 - focus * 0.95)}deg) rotateY(${(-Math.cos(angle) * 11 + yaw * 45 + drift) * (1 - focus * 0.95)}deg) scale(${scale * (1 + focus * 0.12)})`;
        a.style.opacity = String(reveal * (1 - neighbor * 0.16));
        a.style.setProperty(
          "--label-arrival",
          Math.max(focus, ease((open - 0.12) / 0.4) * 0.16),
        );
        a.style.clipPath = `inset(${(1 - reveal) * 100}% 0 0)`;
        a.style.zIndex = String(Math.round(depth + 500 + focus * 1000));
        a.style.setProperty(
          "--plane-brightness",
          ([3, 10, 11, 12].includes(i) ? 0.83 : 1) +
            focus * 0.17 -
            neighbor * 0.16,
        );
        a.style.setProperty(
          "--plane-label",
          focus > 0.5 ? "#fff5dc" : "#c4cdc1",
        );
        if (context && arrival > 0 && reveal < 1) {
          const k = 1600 / (1600 - position.z),
            ww = 240 * scale * k,
            hh = 191 * scale * k;
          context.strokeStyle = `rgba(137,155,142,${1 - reveal})`;
          context.lineWidth = 0.75;
          context.strokeRect(
            w * 0.5 + (position.x - w * 0.5) * k - ww / 2,
            h * 0.5 + (position.y - h * 0.5) * k - hh / 2,
            ww,
            hh,
          );
        }
        a.style.setProperty(
          "--plane-light",
          (0.1 + focus * 0.2 + breath * 0.02).toFixed(3),
        );
      });
      return !reduced;
    },
  };
}
