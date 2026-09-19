import { apps } from "./apps.js";
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
const smooth = (v) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};

export function initializeExhibition() {
  const root = document.documentElement;
  root.classList.add("enhanced");
  const hero = document.querySelector(".hero"),
    idea = document.querySelector("#idea"),
    collection = document.querySelector("#collection"),
    atlas = document.querySelector("#systems");
  const stage = atlas.querySelector(".atlas-stage"),
    indexPanel = document.querySelector("#app-index"),
    indexToggle = document.querySelector("#index-toggle");
  const nav = [...indexPanel.querySelectorAll("[data-app]")],
    planes = [...document.querySelectorAll(".constellation-plane")];
  const articles = [...document.querySelectorAll(".artifact")].map(
    (element, i) => ({
      element,
      pose: element.querySelector(".artifact-pose"),
      surface: element.querySelector(".screen-object"),
      shards: [...element.querySelectorAll(".screen-shard")],
      detail: element.querySelector(".extracted-detail"),
      app: apps[i],
    }),
  );
  const ruler = document.querySelector(".app-ruler");
  apps.forEach(() => ruler.append(document.createElement("i")));
  const previous = document.querySelector("#previous-app"),
    next = document.querySelector("#next-app");
  previous.hidden = next.hidden = indexToggle.hidden = false;
  let viewport = innerHeight,
    width = innerWidth,
    active = -1,
    manualIndex = 0,
    dirty = true,
    force = true,
    lastY = scrollY,
    velocity = 0;
  let geometry = new Map(),
    starts = [],
    total = 0,
    visibleAtlas = false;
  const pointer = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
  const directCamera = { offset: 0, velocity: 0, index: 0, scrollTop: 0 };
  const manual = () => !motionAllowed() || preferences.short;
  function measure() {
    viewport = innerHeight;
    width = innerWidth;
    let sum = 0;
    starts = apps.map((a) => {
      const start = sum;
      sum += a.pace;
      return start;
    });
    total = sum;
    root.style.setProperty("--atlas-length", `${total * 100 + 100}svh`);
    for (const el of [hero, idea, collection, atlas]) {
      const r = el.getBoundingClientRect();
      geometry.set(el, { top: r.top + scrollY, height: r.height });
    }
    const world = articles[0].element
      .querySelector(".camera-world")
      .getBoundingClientRect();
    const caption = articles[0].element
      .querySelector(".artifact-caption")
      .getBoundingClientRect();
    const screenHeight = Math.max(
      150,
      caption.top - world.top - world.height * 0.05 - 38,
    );
    for (const article of articles) {
      // Never invent pixels: cap the screen and extracted region at source / DPR.
      const a = article.app,
        native = a.width / (devicePixelRatio || 1),
        available = Math.min(world.width, (screenHeight * a.width) / a.height);
      article.pose.style.width =
        Math.max(100, Math.floor(Math.min(native, available) / 2) * 2) + "px";
      const density = devicePixelRatio || 1;
      article.pose.style.left =
        Math.round((world.left + world.width * 0.5) * density) / density -
        world.left +
        "px";
      for (const image of article.element.querySelectorAll("img[srcset]"))
        image.sizes = article.pose.style.width;
      article.element.style.setProperty(
        "--detail-width",
        Math.floor(a.detailImages[0].width / (devicePixelRatio || 1)) + "px",
      );
    }
    dirty = force = true;
    wake(render);
  }
  const progress = (el) => {
    const g = geometry.get(el);
    return clamp((scrollY - g.top) / Math.max(1, g.height - viewport));
  };
  const nearby = (el) => {
    const g = geometry.get(el);
    return scrollY + viewport > g.top - 50 && scrollY < g.top + g.height;
  };
  function load(article) {
    for (const image of article.element.querySelectorAll("img[data-src]")) {
      if (image.hasAttribute("src")) continue;
      if (image.dataset.srcset) {
        image.sizes = `${Math.ceil(parseFloat(article.pose.style.width))}px`;
        image.srcset = image.dataset.srcset;
      }
      image.src = image.dataset.src;
    }
  }
  function setActive(i, announce = false) {
    if (i === active) return;
    active = i;
    manualIndex = i;
    articles.forEach((a, j) => {
      a.element.classList.toggle("is-current", j === i);
      a.element.setAttribute("aria-hidden", String(j !== i));
      a.element.inert = j !== i;
    });
    nav.forEach((a, j) => {
      if (j === i) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    [...ruler.children].forEach((e, j) =>
      e.classList.toggle("active", i === j),
    );
    document.querySelector("#app-counter").textContent = String(i + 1).padStart(
      2,
      "0",
    );
    previous.disabled = i === 0;
    next.disabled = i === 15;
    if (announce)
      document.querySelector("#app-announcement").textContent =
        `${i + 1} of 16. ${apps[i].name}. ${apps[i].description}`;
    const selected = nav[i],
      top = selected.offsetTop,
      bottom = top + selected.offsetHeight;
    if (top < indexPanel.scrollTop) indexPanel.scrollTop = top - 25;
    else if (bottom > indexPanel.scrollTop + indexPanel.clientHeight)
      indexPanel.scrollTop = bottom - indexPanel.clientHeight + 25;
    if (nearby(atlas))
      for (let j = Math.max(0, i - 1); j <= Math.min(15, i + 1); j++)
        load(articles[j]);
  }
  function goTo(i, { announce = true, updateHash = true } = {}) {
    i = clamp(i, 0, 15);
    manualIndex = i;
    if (!manual() && i !== active) {
      directCamera.offset = Math.sign(i - active) * 0.8;
      directCamera.velocity = 0;
      directCamera.index = i;
    }
    if (manual()) {
      setActive(i, announce);
      scrollTo({ top: geometry.get(atlas).top, behavior: "instant" });
    } else {
      const top =
        geometry.get(atlas).top + (starts[i] + apps[i].pace * 0.24) * viewport;
      // Direct navigation is immediate. The camera performs its own spatial settling.
      directCamera.scrollTop = top;
      scrollTo({ top, behavior: "instant" });
      setActive(i, announce);
    }
    if (updateHash) history.replaceState(null, "", "#app-" + apps[i].id);
    indexPanel.classList.remove("is-open");
    indexToggle.setAttribute("aria-expanded", "false");
    dirty = force = true;
    wake(render);
  }
  for (const link of document.querySelectorAll("[data-app]"))
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      goTo(Number(link.dataset.app));
    });
  previous.addEventListener("click", () => goTo(active - 1));
  next.addEventListener("click", () => goTo(active + 1));
  indexToggle.addEventListener("click", () => {
    const open = indexPanel.classList.toggle("is-open");
    indexToggle.setAttribute("aria-expanded", String(open));
    if (open) nav[active].focus({ preventScroll: true });
  });
  indexPanel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      indexPanel.classList.remove("is-open");
      indexToggle.setAttribute("aria-expanded", "false");
      indexToggle.focus();
      return;
    }
    const actions = {
      ArrowDown: active + 1,
      ArrowUp: active - 1,
      Home: 0,
      End: 15,
    };
    if (event.key in actions) {
      event.preventDefault();
      goTo(actions[event.key]);
      nav[active].focus({ preventScroll: true });
    }
  });
  // Horizontal swipes on the presentation plane; vertical touch scrolling stays native.
  let touchStart = null;
  stage.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch" && e.target.closest(".camera-world"))
      touchStart = { x: e.clientX, y: e.clientY, time: performance.now() };
  });
  stage.addEventListener("pointerup", (e) => {
    if (!touchStart) return;
    const dx = e.clientX - touchStart.x,
      dy = e.clientY - touchStart.y;
    if (
      Math.abs(dx) > 70 &&
      Math.abs(dx) > Math.abs(dy) * 1.7 &&
      performance.now() - touchStart.time < 700
    ) {
      goTo(active + (dx < 0 ? 1 : -1));
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 350);
    }
    touchStart = null;
  });
  stage.addEventListener("pointercancel", () => (touchStart = null));
  let suppressClick = false;
  stage.addEventListener(
    "click",
    (e) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );
  function render(dt) {
    if (!geometry.size) return false;
    const moving = motionAllowed(),
      staged = moving && !preferences.short,
      compact = width <= 700;
    [directCamera.offset, directCamera.velocity] = spring(
      directCamera.offset,
      directCamera.velocity,
      0,
      dt,
      9,
    );
    if (!staged) directCamera.offset = directCamera.velocity = 0;
    const scrollChanged = scrollY !== lastY || force;
    const dy = scrollY - lastY;
    lastY = scrollY;
    if (scrollChanged && Math.abs(scrollY - directCamera.scrollTop) > 2)
      directCamera.offset = directCamera.velocity = 0;
    const targetVelocity = scrollChanged
      ? clamp(dy / Math.max(1, viewport), -0.1, 0.1)
      : 0;
    velocity = mix(velocity, targetVelocity, 1 - Math.exp(-9 * dt));
    if (Math.abs(velocity) < 0.0001) velocity = 0;
    [pointer.x, pointer.vx] = spring(
      pointer.x,
      pointer.vx,
      moving ? pointer.tx : 0,
      dt,
      5.5,
    );
    [pointer.y, pointer.vy] = spring(
      pointer.y,
      pointer.vy,
      moving ? pointer.ty : 0,
      dt,
      5.5,
    );
    if ((dirty || scrollChanged) && nearby(hero)) {
      const p = staged ? progress(hero) : 0,
        out = smooth(p / 0.8),
        title = document.querySelector("#hero-title");
      title.style.transform = `perspective(1300px) translate3d(0,${-out * 80}px,${out * 330}px) rotateX(${out * 16}deg)`;
      title.style.opacity = 1 - smooth(p / 0.53);
      const visual = hero.querySelector(".hero-visual");
      visual.style.transform = `translate3d(${out * 28}%,${-out * 9}%,0) scale(${1 + out * 0.6})`;
      visual.style.opacity = 1 - out * 0.58;
      hero.querySelector(".hero-copy").style.opacity = 1 - smooth(p / 0.32);
      const question = hero.querySelector(".hero-question");
      question.style.opacity = smooth((p - 0.38) / 0.32);
      question.style.visibility = p > 0.38 ? "visible" : "hidden";
      question.style.transform = `translateZ(${(1 - out) * -130}px)`;
      hero.querySelector(".hero-logo").style.transform =
        `perspective(1000px) translate3d(0,${-out * 60}px,${-out * 180}px)`;
      window.dispatchEvent(new CustomEvent("artifacts:scroll", { detail: p }));
    }
    if ((dirty || scrollChanged) && nearby(idea)) {
      const p = staged ? progress(idea) : 0.7,
        t = smooth(p);
      [...idea.querySelectorAll(".idea-material img")].forEach((image, i) => {
        const sign = i % 2 ? -1 : 1;
        image.style.transform = `translate3d(${sign * (1 - t) * 18}%,${(i - 1) * (1 - t) * 80}px,${-220 * (1 - t)}px) rotateY(${sign * (1 - t) * 32}deg) rotateZ(${sign * (1 - t) * 14}deg) scale(${0.8 + t * 0.2})`;
        image.style.opacity = 0.16 + (1 - t) * 0.22;
      });
      const clarity = idea.querySelector("h2 span");
      clarity.style.clipPath = moving
        ? `inset(0 ${(1 - smooth((p - 0.1) / 0.55)) * 100}% 0 0)`
        : "none";
    }
    if ((dirty || scrollChanged) && nearby(collection)) {
      const p = staged ? progress(collection) : 0.6,
        t = smooth(p);
      planes.forEach((plane, i) => {
        // A helix resolves into four overlapping Expedition stacks, then a camera corridor.
        const angle = (i / 16) * Math.PI * 2,
          group = i < 3 ? 0 : i < 6 ? 1 : i < 11 ? 2 : 3;
        const spread = compact ? 115 : 240;
        const x = mix(
          Math.cos(angle) * spread,
          (group - 1.5) * (compact ? 60 : 110) + (i % 3) * 14,
          t,
        );
        const y = mix(Math.sin(angle) * spread * 0.6, ((i % 5) - 2) * 25, t);
        const z = mix(-360 + i * 23, (i - 8) * 22, t);
        plane.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateX(${mix(20, 9, t)}deg) rotateY(${mix(-35, 22, t)}deg) rotateZ(${mix((i - 8) * 1.1, -7, t)}deg)`;
      });
      collection.querySelector(".collection-copy").style.transform =
        `perspective(1200px) translateZ(${-t * 70}px)`;
    }
    visibleAtlas = nearby(atlas);
    if (visibleAtlas || force) {
      let raw = manualIndex,
        phase = 0.25,
        position = manualIndex;
      if (staged) {
        const track = clamp(
          (scrollY - geometry.get(atlas).top) / viewport,
          0,
          total - 0.0001,
        );
        raw = starts.findLastIndex((start) => start <= track);
        phase = clamp((track - starts[raw]) / apps[raw].pace);
        position = raw + smooth((phase - 0.68) / 0.32);
        if (raw === 15) position = 15;
        if (raw === 0 && phase < 0.22)
          position = -0.55 * (1 - smooth(phase / 0.22));
      }
      const directMoving = Math.abs(directCamera.offset) > 0.002;
      if (directMoving) position -= directCamera.offset;
      const current = directMoving
        ? directCamera.index
        : clamp(Math.round(position), 0, 15);
      setActive(current);
      for (let i = 0; i < articles.length; i++) {
        const s = articles[i],
          distance = i - position,
          abs = Math.abs(distance),
          on = abs < 1.65;
        s.element.style.visibility = on ? "visible" : "hidden";
        if (!on) continue;
        if (visibleAtlas) load(s);
        const factor = compact ? 0.42 : 1,
          turn = clamp(abs),
          split = staged ? smooth((abs - 0.16) / 0.68) : 0;
        const pose = s.app.pose,
          front = 1 - smooth(abs / 0.55);
        const copy = s.element.querySelector(".artifact-copy");
        copy.style.clipPath = staged
          ? `inset(0 ${smooth(abs) * 45}% 0 0)`
          : "none";
        copy.style.transform = staged
          ? `perspective(1000px) translateZ(${-abs * 70}px)`
          : "none";
        const rx = staged
          ? (pose[0] * turn + pointer.y * -1.2 * front + velocity * 18) * factor
          : 0;
        const ry = staged
          ? (pose[1] * distance + pointer.x * 1.8 * front) * factor
          : 0;
        const rz = staged ? (pose[2] * distance + velocity * 9) * factor : 0;
        const x = distance * (compact ? 105 : 360),
          y = abs * (compact ? 20 : 45),
          z = -abs * (compact ? 260 : 550);
        s.pose.style.transform = `translateX(-50%) translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg)`;
        s.pose.style.opacity = clamp(1 - abs * 0.64);
        s.surface.style.opacity = split > 0.015 ? 0 : 1;
        for (let n = 0; n < 3; n++) {
          const columns = ["document", "xml_compare", "pathfinder"].includes(
            s.app.visualType,
          );
          s.shards[n].style.opacity = split > 0.015 ? 1 : 0;
          s.shards[n].style.transform =
            `translate3d(${columns ? (n - 1) * split * 90 : distance * split * (n - 1) * 25}px,${columns ? split * (n - 1) * 20 : (n - 1) * split * 65}px,${split * n * 65}px) rotateY(${split * (n - 1) * pose[1] * 0.3}deg)`;
        }
        const reveal =
          staged && i === raw
            ? smooth((phase - 0.36) / 0.16) *
              (1 - smooth((phase - 0.61) / 0.08))
            : 0;
        s.detail.style.opacity = reveal;
        s.detail.style.visibility = reveal > 0.01 ? "visible" : "hidden";
        s.detail.style.transform = `translate3d(${(1 - reveal) * 30}px,${(1 - reveal) * 30}px,${reveal * 25}px) rotateY(${(1 - reveal) * -12}deg)`;
      }
    }
    force = dirty = false;
    return (
      moving &&
      (Math.abs(directCamera.offset) + Math.abs(directCamera.velocity) >
        0.002 ||
        Math.abs(pointer.x - pointer.tx) +
          Math.abs(pointer.y - pointer.ty) +
          Math.abs(pointer.vx) +
          Math.abs(pointer.vy) >
          0.005 ||
        Math.abs(velocity) > 0.0001)
    );
  }
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
    const within = visibleAtlas;
    measure();
    if (within)
      goTo(Math.max(0, active), { announce: false, updateHash: false });
  });
  stage.addEventListener(
    "pointermove",
    (e) => {
      if (!motionAllowed() || !preferences.pointer || e.pointerType !== "mouse")
        return;
      pointer.tx = clamp((e.clientX / width) * 2 - 1, -1, 1);
      pointer.ty = clamp((e.clientY / viewport) * 2 - 1, -1, 1);
      wake(render);
    },
    { passive: true },
  );
  stage.addEventListener("pointerleave", () => {
    pointer.tx = pointer.ty = 0;
    wake(render);
  });
  document.fonts.ready.then(measure);
  new ResizeObserver(measure).observe(document.querySelector("main"));
  measure();
  setActive(0);
  initializeOpening();
  initializeInspector();
  const initial = apps.findIndex((a) => "#app-" + a.id === location.hash);
  if (initial >= 0)
    requestAnimationFrame(() =>
      goTo(initial, { announce: false, updateHash: false }),
    );
  window.addEventListener("hashchange", () => {
    const i = apps.findIndex((a) => "#app-" + a.id === location.hash);
    if (i >= 0) goTo(i, { announce: false, updateHash: false });
  });
}

function initializeOpening() {
  const title = document.querySelector("#hero-title"),
    skip = document.querySelector("#skip-opening"),
    animations = [];
  let repeat = false;
  try {
    repeat = Boolean(sessionStorage.getItem("artifacts-opened"));
    sessionStorage.setItem("artifacts-opened", "1");
  } catch {}
  const pace = repeat ? 0.35 : 1;
  const play = (element, keyframes, options) => {
    const a = animate(element, keyframes, options);
    if (a) animations.push(a);
    return a;
  };
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
      play(
        glyph,
        [
          {
            transform: `translate3d(0,112%,-200px) rotateX(76deg) rotateY(${(i - 4) * 4}deg)`,
          },
          { transform: "translate3d(0,0,0) rotateX(0) rotateY(0)" },
        ],
        {
          duration: 1450 * pace,
          delay: (850 + i * 55) * pace,
          fill: "backwards",
          easing: MOTION.settle,
        },
      );
      return mask;
    }),
  );
  [...document.querySelectorAll(".hero-mark path")].forEach((path, i) =>
    play(
      path,
      [
        {
          transform: `translate(${(i - 1) * 22}px,${(2 - i) * 22}px)`,
          opacity: 0,
        },
        { transform: "translate(0,0)", opacity: 1 },
      ],
      { duration: 1000 * pace, delay: i * 120 * pace, fill: "backwards" },
    ),
  );
  [...document.querySelectorAll(".distant-systems img")].forEach((image, i) =>
    play(
      image,
      [
        { clipPath: "inset(0 100% 0 0)", translate: "0 30px" },
        { clipPath: "inset(0 0 0 0)", translate: "0 0" },
      ],
      {
        duration: 1800 * pace,
        delay: (2300 + i * 450) * pace,
        fill: "backwards",
      },
    ),
  );
  play(
    document.querySelector(".hero-copy"),
    [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
    { duration: 1250 * pace, delay: 2100 * pace, fill: "backwards" },
  );
  play(
    document.querySelector(".hero .scene-footer>a"),
    [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
    { duration: 1300 * pace, delay: 3900 * pace, fill: "backwards" },
  );
  const finish = () => {
    animations.forEach((a) => {
      try {
        a.finish();
      } catch {}
    });
    skip.hidden = true;
  };
  if (motionAllowed()) {
    skip.hidden = false;
    skip.addEventListener("click", finish);
    setTimeout(() => (skip.hidden = true), 5600 * pace);
    window.addEventListener(
      "scroll",
      () => {
        if (scrollY > 80) finish();
      },
      { passive: true },
    );
  }
}

function initializeInspector() {
  const dialog = document.querySelector("#inspector"),
    image = document.querySelector("#inspector-image"),
    viewport = document.querySelector(".inspector-viewport"),
    options = document.querySelector("#capture-options"),
    native = document.querySelector("#native-size");
  let opener, currentApp;
  const setImage = (src, label, quality) => {
    image.alt = `${currentApp.name} — ${label}`;
    viewport.classList.remove("is-native");
    native.setAttribute("aria-pressed", "false");
    native.textContent = "Native pixels";
    image.onload = () => {
      const pixels = image.naturalWidth / (devicePixelRatio || 1);
      image.style.setProperty("--inspect-native", pixels + "px");
      document.querySelector("#image-dimensions").textContent =
        `${image.naturalWidth} × ${image.naturalHeight}`;
      viewport.scrollTo(0, 0);
    };
    image.src = src;
    document.querySelector("#capture-caption").textContent =
      quality === "jpeg-derived-archive"
        ? "Original archive capture. Source compression is retained; a native recapture is pending."
        : `${label}. Original native capture; no upscaling.`;
  };
  for (const link of document.querySelectorAll("[data-inspect]"))
    link.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      opener = link;
      currentApp = apps[Number(link.dataset.inspect)];
      document.querySelector("#inspector-title").textContent = currentApp.name;
      options.replaceChildren();
      const choices = [
        {
          label: "Full interface",
          src: currentApp.heroImage,
          quality: currentApp.sourceQuality,
        },
        {
          label: "Detail",
          src: currentApp.detailImages[0].src,
          quality: currentApp.sourceQuality,
        },
        ...(currentApp.exampleImage
          ? [
              {
                label: "Archive example",
                src: currentApp.exampleImage,
                quality: "jpeg-derived-archive",
              },
            ]
          : []),
      ];
      for (const [i, choice] of choices.entries()) {
        const button = document.createElement("button");
        button.textContent = choice.label;
        button.setAttribute("aria-pressed", String(i === 0));
        button.addEventListener("click", () => {
          for (const b of options.children)
            b.setAttribute("aria-pressed", String(b === button));
          setImage(choice.src, choice.label, choice.quality);
        });
        options.append(button);
      }
      setImage(
        currentApp.heroImage,
        currentApp.captureNote,
        currentApp.sourceQuality,
      );
      dialog.showModal();
    });
  window.addEventListener("resize", () => {
    if (image.naturalWidth)
      image.style.setProperty(
        "--inspect-native",
        image.naturalWidth / (devicePixelRatio || 1) + "px",
      );
  });
  native.addEventListener("click", () => {
    const enabled = viewport.classList.toggle("is-native");
    native.setAttribute("aria-pressed", String(enabled));
    native.textContent = enabled ? "Fit image" : "Native pixels";
    if (!enabled) viewport.scrollTo(0, 0);
  });
  document
    .querySelector("#close-inspector")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () =>
    opener?.focus({ preventScroll: true }),
  );
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        dialog.close();
    }
  });
}
