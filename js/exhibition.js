import { apps } from "./apps.js";
import { SCENES, DESIGN } from "./tokens.js";
import { createWorld } from "./world.js";
import {
  wake,
  clamp,
  mix,
  motionAllowed,
  preferences,
  animate,
} from "./motion.js";
const smooth = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const defaults = { observe: 3, compare: 4, diagnose: 7, coordinate: 15 };
function appCamera(kind) {
  return [
    ["material", "topology", "zones"].includes(kind) ? 1.02 : 0.2,
    -0.22,
    -0.1,
    0.79,
    1.55,
    0.05,
  ];
}
export function initializeExhibition() {
  document.documentElement.classList.add("enhanced");
  const canvas = document.querySelector("#world-canvas"),
    world = createWorld(canvas, apps),
    fallback = document.querySelector(".world-fallback");
  const sections = SCENES.map((s) => document.getElementById(s.id)),
    links = [...document.querySelectorAll(".story-progress>a")],
    universe = document.querySelector("#universe"),
    nodes = [...document.querySelectorAll(".system-node")];
  const directory = document.querySelector("#directory"),
    openDirectory = document.querySelector("#open-directory"),
    closeDirectory = document.querySelector("#close-directory");
  closeDirectory.hidden = false;
  const overview = universe.querySelector(".universe-overview"),
    focus = universe.querySelector(".universe-focus"),
    focusControls = universe.querySelector(".focus-controls"),
    nodeGroup = document.querySelector("#node-group"),
    nodeName = document.querySelector("#node-name");
  let bounds = [],
    active = -1,
    focusIndex = -1,
    transition = null,
    override = {},
    amounts = { observe: 0.8, compare: 0.8, diagnose: 0.8, coordinate: 0.8 },
    lastY = scrollY,
    velocity = 0,
    settleUntil = 0,
    opener;
  let height = innerHeight,
    aboutTop = 0;
  function measure() {
    height = innerHeight;
    aboutTop = document.getElementById("about").offsetTop;
    bounds = sections.map((e) => {
      const r = e.getBoundingClientRect();
      return { top: r.top + scrollY, height: r.height };
    });
    settleUntil = performance.now() + 1200;
    wake(render);
  }
  const staged = () => motionAllowed() && !preferences.short;
  function render(dt, time, now) {
    if (!bounds.length) return false;
    const dy = scrollY - lastY;
    lastY = scrollY;
    velocity = mix(
      velocity,
      clamp(dy / height, -0.1, 0.1),
      1 - Math.exp(-10 * dt),
    );
    const probe = scrollY + (staged() ? 1 : height * 0.4);
    let i = Math.max(
      0,
      bounds.findLastIndex((b) => b.top <= probe),
    );
    const p = clamp((scrollY - bounds[i].top) / bounds[i].height),
      next = Math.min(i + 1, SCENES.length - 1);
    if (i !== active) {
      active = i;
      document.body.dataset.scene = SCENES[i].id;
      links.forEach((a, j) =>
        j === i
          ? a.setAttribute("aria-current", "step")
          : a.removeAttribute("aria-current"),
      );
      if (i !== 8 && focusIndex >= 0) resetFocus(false);
      if (transition?.chapter && transition.chapter !== SCENES[i].id)
        transition = null;
    }
    document.body.classList.toggle(
      "at-about",
      scrollY > aboutTop - height * 0.45,
    );
    const state = SCENES[i],
      nextState = SCENES[next],
      local = override[state.id],
      a = local !== undefined ? apps[local].visualConcept : state.shape,
      b = nextState.shape;
    let morph = staged() ? smooth((p - 0.06) / 0.82) : 0,
      camera = state.camera.map((v, k) => mix(v, nextState.camera[k], morph)),
      from = a,
      to = staged() ? b : a;
    let amount = amounts[state.id] ?? state.amount,
      amountB = nextState.amount;
    if (local !== undefined) {
      camera = appCamera(a).map((v, k) => mix(v, nextState.camera[k], morph));
    }
    if (i === 8 && focusIndex >= 0) {
      from = to = apps[focusIndex].visualConcept;
      morph = 0;
      camera = appCamera(from);
      amount = Number(document.querySelector("#focus-amount").value) / 100;
      amountB = amount;
    }
    if (transition && motionAllowed()) {
      const t = smooth((now - transition.started) / DESIGN.morphDuration);
      from = transition.from;
      to = transition.to;
      morph = t;
      camera = transition.cameraFrom.map((v, k) =>
        mix(v, transition.cameraTo[k], t),
      );
      amountB = amount;
      if (t >= 1) transition = null;
    }
    world.set({
      a: from,
      b: to,
      mix: morph,
      amountA: amount,
      amountB,
      camera,
      quiet: i >= 9,
    });
    const visibleShape = morph < 0.5 ? from : to;
    if (fallback.dataset.shape !== visibleShape) {
      fallback.src = `assets/concepts/${visibleShape}.svg`;
      fallback.dataset.shape = visibleShape;
    }
    if (i === 8 && focusIndex < 0) {
      for (let j = 0; j < nodes.length; j++) {
        const pos = world.project(j);
        if (pos) {
          nodes[j].style.left = pos.x + "px";
          nodes[j].style.top = pos.y + "px";
        } else {
          const angle = (j / 16) * Math.PI * 2;
          nodes[j].style.left = 50 + Math.cos(angle) * 37 + "%";
          nodes[j].style.top = 56 + Math.sin(angle) * 18 + "%";
        }
      }
    }
    const moving = staged();
    if (i === 0) {
      const title = document.querySelector("#entry-title");
      title.style.transform = moving
        ? `perspective(1600px) translateZ(${p * 110}px) rotateX(${p * 13}deg) rotateY(${-p * 7}deg)`
        : "none";
      document.querySelector(".entry-mark").style.transform = moving
        ? `translate3d(${p * -25}px,0,${p * -160}px)`
        : "none";
    }
    if (i === 1) {
      document
        .querySelectorAll(".friction-words span")
        .forEach(
          (word, j) =>
            (word.style.transform = moving
              ? `translate3d(${Math.sin(j * 2) * p * 75}px,${(j - 1) * p * 36}px,0) rotate(${(j - 1) * p * 3}deg)`
              : "none"),
        );
    }
    if (i === 2) {
      const t = moving ? smooth((p + 0.1) / 0.5) : 1;
      document.querySelector(".complex-line").style.clipPath =
        `inset(0 ${(1 - smooth(t * 2)) * 100}% 0 0)`;
      document.querySelector(".execution-line").style.clipPath =
        `inset(0 0 0 ${(1 - smooth((t - 0.2) / 0.65)) * 100}%)`;
      document.querySelector(".execution-line").style.transform = moving
        ? `perspective(1500px) rotateX(${(1 - t) * 16}deg)`
        : "none";
    }
    return (
      Boolean(transition) || now < settleUntil || Math.abs(velocity) > 0.0001
    );
  }
  function announce(i) {
    document.querySelector("#announcement").textContent =
      `${i + 1} of ${apps.length}. ${apps[i].name}. ${apps[i].purpose}`;
  }
  function morphTo(from, to, fromCamera, toCamera, chapter) {
    transition = motionAllowed()
      ? {
          from,
          to,
          cameraFrom: fromCamera,
          cameraTo: toCamera,
          started: performance.now(),
          chapter,
        }
      : null;
    settleUntil = performance.now() + DESIGN.morphDuration + 300;
    wake(render);
  }
  function resetFocus(animateBack = true) {
    const old = focusIndex;
    focusIndex = -1;
    overview.hidden = false;
    focus.hidden = focusControls.hidden = true;
    document.querySelector(".system-nodes").hidden = false;
    universe.classList.remove("is-focused");
    nodeGroup.textContent = "EXPLORE THE CONNECTIONS";
    nodeName.textContent = "Choose an instrument.";
    world.highlight(-1);
    if (animateBack && old >= 0)
      morphTo(
        apps[old].visualConcept,
        "universe",
        appCamera(apps[old].visualConcept),
        SCENES[8].camera,
      );
  }
  function selectApp(i, { scroll = true, hash = true } = {}) {
    i = (i + apps.length) % apps.length;
    const old = focusIndex,
      from = old < 0 ? "universe" : apps[old].visualConcept;
    focusIndex = i;
    const app = apps[i];
    overview.hidden = true;
    focus.hidden = focusControls.hidden = false;
    document.querySelector(".system-nodes").hidden = true;
    universe.classList.add("is-focused");
    document.querySelector("#focus-category").textContent =
      app.category.replace(" - ", " / ");
    document.querySelector("#focus-title").textContent = app.name;
    document.querySelector("#focus-purpose").textContent = app.purpose;
    document.querySelector("#app-position").textContent =
      `${String(i + 1).padStart(2, "0")} / ${apps.length}`;
    nodeGroup.textContent = app.workflow.toUpperCase();
    nodeName.textContent = app.transformation;
    document.querySelector("#related-apps").replaceChildren(
      ...app.relationships.map((id) => {
        const index = apps.findIndex((a) => a.id === id),
          button = document.createElement("button");
        button.textContent = apps[index].name;
        button.addEventListener("click", () => selectApp(index));
        return button;
      }),
    );
    world.highlight(-1);
    if (scroll) scrollTo({ top: bounds[8].top, behavior: "instant" });
    active = 8;
    document.body.dataset.scene = "universe";
    links.forEach((a, j) =>
      j === 8
        ? a.setAttribute("aria-current", "step")
        : a.removeAttribute("aria-current"),
    );
    morphTo(
      from,
      app.visualConcept,
      old < 0 ? SCENES[8].camera : appCamera(from),
      appCamera(app.visualConcept),
    );
    if (hash) history.replaceState(null, "", "#app-" + app.id);
    announce(i);
    closeIndex(false);
  }
  nodes.forEach((node, i) => {
    node.addEventListener("click", () => selectApp(i));
    const preview = () => {
      world.highlight(i);
      nodeGroup.textContent = apps[i].category
        .replace(" - ", " / ")
        .toUpperCase();
      nodeName.textContent = apps[i].name;
    };
    node.addEventListener("pointerenter", preview);
    node.addEventListener("focus", preview);
    node.addEventListener("pointerleave", () => world.highlight(-1));
    node.addEventListener("blur", () => world.highlight(-1));
    node.addEventListener("keydown", (e) => {
      const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
        e.key
      ];
      if (delta) {
        e.preventDefault();
        nodes[(i + delta + apps.length) % apps.length].focus({
          preventScroll: true,
        });
      }
    });
  });
  document.querySelector("#return-universe").addEventListener("click", () => {
    const old = focusIndex;
    resetFocus();
    history.replaceState(null, "", "#universe");
    nodes[old].focus({ preventScroll: true });
  });
  document
    .querySelector("#previous-app")
    .addEventListener("click", () => selectApp(focusIndex - 1));
  document
    .querySelector("#next-app")
    .addEventListener("click", () => selectApp(focusIndex + 1));
  document.querySelector("#focus-amount").addEventListener("input", () => {
    transition = null;
    wake(render);
  });
  for (const section of document.querySelectorAll(".chapter")) {
    const id = section.id,
      buttons = [...section.querySelectorAll("[data-chapter-app]")];
    for (const button of buttons)
      button.addEventListener("click", () => {
        const index = Number(button.dataset.chapterApp),
          old = override[id] ?? defaults[id],
          app = apps[index];
        override[id] = index;
        section.querySelector(".instrument-summary h3").textContent = app.name;
        section.querySelector(".instrument-summary p").textContent =
          app.purpose;
        section.querySelector("h2").textContent = app.shortNarrative;
        section.classList.add("alternate-concept");
        buttons.forEach((b) =>
          b.setAttribute("aria-pressed", String(b === button)),
        );
        morphTo(
          apps[old].visualConcept,
          app.visualConcept,
          appCamera(apps[old].visualConcept),
          appCamera(app.visualConcept),
          id,
        );
        announce(index);
      });
    section.querySelector("input").addEventListener("input", (e) => {
      amounts[id] = Number(e.target.value) / 100;
      transition = null;
      wake(render);
    });
  }
  function closeIndex(restore = true) {
    directory.classList.remove("is-open");
    document.body.classList.remove("directory-open");
    directory.removeAttribute("role");
    directory.removeAttribute("aria-modal");
    openDirectory.setAttribute("aria-expanded", "false");
    document.querySelector("main").inert = false;
    document.querySelector("header").inert = false;
    document.querySelector(".story-progress").inert = false;
    document.querySelector("footer").inert = false;
    if (restore) opener?.focus({ preventScroll: true });
  }
  openDirectory.addEventListener("click", () => {
    opener = document.activeElement;
    directory.classList.add("is-open");
    directory.setAttribute("role", "dialog");
    directory.setAttribute("aria-modal", "true");
    document.body.classList.add("directory-open");
    openDirectory.setAttribute("aria-expanded", "true");
    for (const e of document.querySelectorAll(
      "main,header,footer,.story-progress",
    ))
      e.inert = true;
    closeDirectory.focus();
  });
  closeDirectory.addEventListener("click", () => closeIndex());
  directory.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeIndex();
    }
    if (e.key === "Tab") {
      const items = [...directory.querySelectorAll("a,button")],
        first = items[0],
        last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  for (const link of directory.querySelectorAll("[data-directory-app]"))
    link.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      selectApp(Number(link.dataset.directoryApp));
      document.querySelector("#return-universe").focus({ preventScroll: true });
    });
  for (const anchor of document.querySelectorAll('a[href^="#"]'))
    anchor.addEventListener("click", (event) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        anchor.hasAttribute("data-directory-app")
      )
        return;
      const index = SCENES.findIndex(
        (s) => "#" + s.id === anchor.getAttribute("href"),
      );
      if (index < 0) return;
      event.preventDefault();
      if (index === 8) resetFocus(false);
      const top =
        bounds[index].top +
        (index === 2 && staged() ? bounds[index].height * 0.3 : 0);
      history.pushState(null, "", anchor.getAttribute("href"));
      scrollTo({ top, behavior: motionAllowed() ? "smooth" : "instant" });
      sections[index].tabIndex = -1;
      sections[index].focus({ preventScroll: true });
    });
  window.addEventListener(
    "scroll",
    () => {
      settleUntil = performance.now() + 400;
      wake(render);
    },
    { passive: true },
  );
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("artifacts:motion", () => {
    const previous = Math.max(0, active);
    transition = null;
    measure();
    scrollTo({ top: bounds[previous].top, behavior: "instant" });
  });
  document.fonts.ready.then(measure);
  new ResizeObserver(measure).observe(document.querySelector("main"));
  const onHash = () => {
    const index = apps.findIndex((a) => "#app-" + a.id === location.hash);
    if (index >= 0) selectApp(index, { hash: false });
  };
  window.addEventListener("hashchange", onHash);
  measure();
  opening();
  if (location.hash.startsWith("#app-")) requestAnimationFrame(onHash);
}
function opening() {
  const skip = document.querySelector("#skip-opening"),
    title = document.querySelector("#entry-title"),
    animations = [];
  let returning = false;
  try {
    returning = sessionStorage.getItem("artifacts-narrative-opened") === "yes";
    sessionStorage.setItem("artifacts-narrative-opened", "yes");
  } catch {}
  if (!motionAllowed()) return;
  const pace = returning ? 0.4 : 1;
  const play = (el, frames, options) => {
    const a = animate(el, frames, options);
    if (a) animations.push(a);
  };
  document.querySelectorAll(".hero-mark path").forEach((path, i) =>
    play(
      path,
      [
        {
          transform: `translate(${(i - 1) * 28}px,${(i - 1) * -12}px) rotate(${(i - 1) * 9}deg)`,
          clipPath: "inset(0 100% 0 0)",
        },
        { transform: "translate(0,0) rotate(0)", clipPath: "inset(0 0 0 0)" },
      ],
      {
        duration: DESIGN.opening * 0.65 * pace,
        delay: i * 140 * pace,
        fill: "backwards",
      },
    ),
  );
  play(
    title,
    [
      {
        clipPath: "inset(0 100% 0 0)",
        letterSpacing: "-.035em",
        filter: "blur(4px)",
      },
      {
        clipPath: "inset(0 0 0 0)",
        letterSpacing: "-.08em",
        filter: "blur(0px)",
      },
    ],
    {
      duration: DESIGN.opening * pace,
      delay: 450 * pace,
      fill: "backwards",
      easing: DESIGN.cinematic,
    },
  );
  const finish = () => {
    animations.forEach((a) => {
      try {
        a.finish();
      } catch {}
    });
    skip.hidden = true;
  };
  skip.hidden = false;
  skip.addEventListener("click", finish);
  setTimeout(finish, 3200 * pace);
  window.addEventListener(
    "scroll",
    () => {
      if (scrollY > 50) finish();
    },
    { passive: true },
  );
}
