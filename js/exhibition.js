import {
  animate,
  clamp,
  mix,
  spring,
  wake,
  motionAllowed,
  preferences,
  MOTION,
} from "./motion.js";

// Native scrolling drives a measured scene timeline. No wheel/touch interception.
// The only continuous render is the visible wafer; DOM scenes sleep when settled.
export function initializeExhibition() {
  const root = document.documentElement;
  root.classList.add("exhibition-ready");
  const hero = document.querySelector(".hero");
  const title = document.querySelector("#hero-title");
  const visual = document.querySelector(".hero-visual");
  const heroCopy = document.querySelector(".hero-copy");
  const second = document.querySelector(".hero-second");
  const clarity = document.querySelector("#clarity");
  const statement = clarity.querySelector("h2 span");
  const ecosystem = document.querySelector("#systems");
  const fan = [...document.querySelectorAll(".fan-plane")];
  const evolution = document.querySelector("#evolution");
  const layers = [...document.querySelectorAll(".layer-word span")];
  const chapterLinks = [...document.querySelectorAll(".chapter-rail a")];
  const navLinks = [...document.querySelectorAll(".site-header nav a")];
  const sections = [...document.querySelectorAll("[data-chapter]")];
  const software = [...document.querySelectorAll(".software")].map(
    (section) => ({
      section,
      side: Number(section.dataset.side),
      position: section.querySelector(".instrument-position"),
      tilt: section.querySelector(".instrument-tilt"),
      macro: section.querySelector(".macro-plane"),
      thought: section.querySelector(".software-thought"),
      light: section.querySelector(".surface-light"),
    }),
  );
  const geometry = new Map();
  let viewport = innerHeight,
    pageHeight = 1,
    dirty = true;
  let activeChapter = "",
    force = true,
    lastScroll = -1;
  const pointer = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
  const smooth = (value) => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  function measure() {
    viewport = innerHeight;
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      geometry.set(section, { top: rect.top + scrollY, height: rect.height });
    }
    pageHeight = Math.max(1, document.documentElement.scrollHeight - viewport);
    dirty = force = true;
    wake(render);
  }
  const progress = (element) => {
    const { top, height } = geometry.get(element);
    return clamp((scrollY - top) / Math.max(1, height - viewport));
  };
  const near = (element) => {
    const { top, height } = geometry.get(element);
    return scrollY + viewport >= top - 150 && scrollY <= top + height;
  };
  const reveal = (element, amount) => {
    element.style.opacity = amount;
    element.style.visibility = amount > 0.005 ? "visible" : "hidden";
  };
  function render(delta) {
    if (!geometry.size) return false;
    const moving = motionAllowed() && !preferences.short;
    const compact = preferences.compact;
    const scrollChanged = lastScroll !== scrollY || force;
    lastScroll = scrollY;
    [pointer.x, pointer.vx] = spring(
      pointer.x,
      pointer.vx,
      moving ? pointer.tx : 0,
      delta,
      6,
    );
    [pointer.y, pointer.vy] = spring(
      pointer.y,
      pointer.vy,
      moving ? pointer.ty : 0,
      delta,
      6,
    );
    const settling =
      Math.abs(pointer.x - pointer.tx) +
        Math.abs(pointer.y - pointer.ty) +
        Math.abs(pointer.vx) +
        Math.abs(pointer.vy) >
      0.002;
    if (scrollChanged || dirty) {
      root.style.setProperty("--progress", clamp(scrollY / pageHeight));
      let chapter = "object";
      for (const section of sections)
        if (geometry.get(section).top <= scrollY + viewport * 0.45)
          chapter = section.dataset.chapter;
      if (chapter !== activeChapter) {
        activeChapter = chapter;
        for (const link of [...chapterLinks, ...navLinks]) {
          const selected = link.hash === "#" + chapter;
          if (selected) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        }
      }
    }
    if ((scrollChanged || dirty) && (near(hero) || force)) {
      const p = moving ? progress(hero) : 0;
      const departure = smooth(p / 0.78);
      title.style.transform = `translate3d(0,${-departure * 100}px,${departure * 240}px) rotateX(${departure * 15}deg) scale(${1 + departure * 0.12})`;
      title.style.opacity = 1 - smooth((p - 0.1) / 0.45);
      visual.style.transform = `translate3d(${departure * (compact ? 6 : 16)}%,${-departure * 10}%,0) scale(${1 + departure * 0.5})`;
      visual.style.opacity = 1 - departure * 0.62;
      heroCopy.style.transform = `translateY(${-departure * 45}px)`;
      heroCopy.style.opacity = 1 - smooth(p / 0.36);
      const idea = moving ? smooth((p - 0.4) / 0.35) : 0;
      reveal(second, idea);
      second.style.transform = `perspective(900px) translate3d(0,${(1 - idea) * 25}px,${(1 - idea) * -100}px)`;
      window.dispatchEvent(new CustomEvent("artifacts:scroll", { detail: p }));
    }
    if ((scrollChanged || dirty) && (near(clarity) || force)) {
      const p = moving ? smooth((progress(clarity) - 0.03) / 0.8) : 1;
      for (let i = 0; i < paths.length; i++) {
        const points = [];
        for (let j = 0; j <= 40; j++) {
          const x = j * 30;
          const chaos =
            250 +
            Math.sin(j * 0.21 + i * 0.58) * 115 +
            Math.sin(j * 0.69 + i * 1.31) * 48 +
            (i - 8) * 8;
          const lane = 150 + i * 12;
          const entry = smooth((x - 160) / 340),
            exit = smooth((x - 880) / 260);
          const ordered = mix(250, lane, entry) * (1 - exit) + 250 * exit;
          points.push(
            `${j ? "L" : "M"}${x} ${mix(chaos, ordered, p).toFixed(1)}`,
          );
        }
        paths[i].setAttribute("d", points.join(" "));
      }
      statement.style.clipPath = moving
        ? `inset(0 ${(1 - smooth((p - 0.12) / 0.55)) * 100}% 0 0)`
        : "none";
      statement.style.transform = `perspective(1000px) rotateX(${(1 - p) * 10}deg)`;
      clarity.querySelector(".structure-label i").style.transform =
        `scaleX(${0.2 + p * 0.8})`;
    }
    if ((scrollChanged || dirty) && (near(ecosystem) || force)) {
      const bounds = geometry.get(ecosystem);
      const p = moving
        ? smooth(
            (scrollY + viewport - bounds.top) /
              (bounds.height + viewport * 0.25),
          )
        : 1;
      fan.forEach((plane, i) => {
        const spread = mix(5, 24, p);
        plane.style.transform = `translateX(${(i - 2) * spread}%) translateY(${(i - 2) * 5}%) rotateX(${mix(62, 38, p)}deg) rotateY(-23deg) rotateZ(${mix(-22, -12, p)}deg) translateZ(${i * (compact ? 10 : 28)}px)`;
      });
    }
    for (const scene of software) {
      if (!near(scene.section) && !force) continue;
      if (!moving) {
        scene.position.style.transform = "translateX(-50%)";
        scene.position.style.opacity = 1;
        scene.tilt.style.transform = "none";
        reveal(scene.macro, 0);
        reveal(scene.thought, 0);
        continue;
      }
      const p = progress(scene.section);
      const approach = smooth(p / 0.32);
      const detail = smooth((p - 0.49) / 0.31);
      const factor = compact ? 0.32 : 1;
      const reverse =
        innerWidth > 1100 &&
        ["lt-zone-assistant", "metria-spc"].includes(scene.section.id)
          ? -1
          : 1;
      if (scrollChanged || dirty) {
        scene.position.style.transform = `translateX(-50%) translate3d(${((1 - approach) * scene.side * 9 - detail * 18 * reverse) * factor}vw,${(1 - approach) * 40 - detail * 25}px,${-140 * (1 - approach) * factor}px) scale(${1 - (1 - approach) * 0.08 - detail * 0.25})`;
        scene.position.style.opacity = 1 - detail * 0.74;
        reveal(scene.macro, detail);
        scene.macro.style.transform = `translate3d(${(1 - detail) * 75}px,${(1 - detail) * 35}px,${detail * 60}px) rotateY(${-8 + detail * 5}deg) scale(${0.9 + detail * 0.1})`;
        reveal(scene.thought, detail);
        scene.thought.style.clipPath = `inset(0 ${(1 - detail) * 100}% 0 0)`;
      }
      scene.tilt.style.transform = `rotateX(${((1 - approach) * 8 + pointer.y * -1.4) * factor}deg) rotateY(${(scene.side * ((1 - approach) * 16 + 2 + detail * 9) + pointer.x * 2) * factor}deg) rotateZ(${scene.side * (1 - approach) * 1.5 * factor}deg)`;
      scene.light.style.opacity = 0.6 + Math.abs(pointer.x) * 0.25;
    }
    if ((scrollChanged || dirty) && near(evolution)) {
      const p = moving
        ? smooth(
            (scrollY + viewport - geometry.get(evolution).top) /
              (viewport * 1.4),
          )
        : 1;
      layers.forEach(
        (layer, i) =>
          (layer.style.transform = `rotateX(${(1 - p) * (45 - i * 13)}deg) translateY(${(1 - p) * (i ? 25 : -35)}px)`),
      );
    }
    force = dirty = false;
    return moving && settling;
  }
  // Ordered mathematical traces express complexity; these are never presented as application data.
  const group = clarity.querySelector(".trace-lines");
  const paths = Array.from({ length: 16 }, () => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    group.append(path);
    return path;
  });
  // Assemble the title through depth and a baseline mask, without a loading gate.
  title.setAttribute("aria-label", "ARTIFACTS.");
  title.replaceChildren(
    ...[..."ARTIFACTS."].map((letter, i) => {
      const mask = document.createElement("span");
      mask.className = "title-mask" + (letter === "." ? " period" : "");
      mask.setAttribute("aria-hidden", "true");
      const glyph = document.createElement("span");
      glyph.className = "title-glyph";
      glyph.textContent = letter;
      mask.append(glyph);
      animate(
        glyph,
        [
          {
            transform: `translate3d(0,110%,-250px) rotateX(75deg) rotateY(${(i - 4) * 5}deg)`,
            opacity: 0.1,
          },
          { transform: "translate3d(0,0,0) rotateX(0) rotateY(0)", opacity: 1 },
        ],
        {
          duration: MOTION.entrance,
          delay: i * MOTION.stagger,
          easing: MOTION.settle,
          fill: "backwards",
        },
      );
      return mask;
    }),
  );
  window.addEventListener(
    "scroll",
    () => {
      dirty = true;
      wake(render);
    },
    { passive: true },
  );
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("artifacts:motion", () => {
    // Keep the same chapter in view as sticky scenes become static layouts.
    const previousY = lastScroll;
    const current = [...sections]
      .reverse()
      .find((section) => geometry.get(section)?.top <= previousY + 1);
    const previousBounds = current && geometry.get(current);
    measure();
    if (current && previousBounds) {
      const local = clamp(
        previousY - previousBounds.top,
        0,
        Math.max(0, geometry.get(current).height - viewport),
      );
      scrollTo({ top: geometry.get(current).top + local, behavior: "instant" });
    }
  });
  window.addEventListener(
    "pointermove",
    (event) => {
      if (
        !motionAllowed() ||
        !preferences.pointer ||
        event.pointerType !== "mouse"
      )
        return;
      pointer.tx = clamp((event.clientX / innerWidth) * 2 - 1, -1, 1);
      pointer.ty = clamp((event.clientY / innerHeight) * 2 - 1, -1, 1);
      wake(render);
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => {
    pointer.tx = pointer.ty = 0;
    wake(render);
  });
  // Browser find, keyboard focus and anchor navigation retain normal document flow.
  document.fonts.ready.then(measure);
  new ResizeObserver(measure).observe(document.querySelector("main"));
  measure();
  initializeInspector();
}

function initializeInspector() {
  const dialog = document.querySelector("#inspector");
  const image = document.querySelector("#inspector-image");
  const viewport = dialog.querySelector(".inspector-viewport");
  const zoom = document.querySelector("#zoom-image");
  let opener;
  for (const link of document.querySelectorAll("[data-inspect]"))
    link.addEventListener("click", (event) => {
      // Preserve modified-click and the no-JS original-image destination.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      opener = link;
      const section = link.closest(".software");
      const name = section.querySelector("h2").textContent;
      document.querySelector("#inspector-title").textContent = name;
      document.querySelector("#inspector-caption").textContent =
        section.querySelector(".scene-foot>p").textContent;
      image.src = link.href;
      image.alt = name + " — original application capture";
      viewport.classList.remove("is-zoomed");
      zoom.setAttribute("aria-pressed", "false");
      zoom.textContent = "Zoom in";
      dialog.showModal();
      viewport.scrollTo(0, 0);
    });
  zoom.addEventListener("click", () => {
    const enlarged = viewport.classList.toggle("is-zoomed");
    zoom.setAttribute("aria-pressed", String(enlarged));
    zoom.textContent = enlarged ? "Fit image" : "Zoom in";
    if (!enlarged) viewport.scrollTo(0, 0);
  });
  document
    .querySelector("#close-inspector")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener("close", () =>
    opener?.focus({ preventScroll: true }),
  );
}
