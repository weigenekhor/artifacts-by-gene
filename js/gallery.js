import data from "../content/gallery.json";
import { renderPreview } from "./gallery-renderer.js";
import { mix } from "./films/drawing.js";
import { createTopography } from "./topography.js";

// The original interface is the resting state. Only one film advances on the page clock.
export function createGallery(section, wake, openFilm) {
  let mobile = false,
    hover = -1,
    center = -1;
  const cards = [...section.querySelectorAll(".gallery-card")].map(
    (el, index) => {
      const kind = el.dataset.film,
        art = el.querySelector(".gallery-art"),
        preview = el.querySelector(".gallery-preview");
      const state = {
        el,
        kind,
        art,
        preview,
        index,
        visible: false,
        dirty: true,
        top: 0,
        h: 1,
        w: 1,
        elapsed: 0,
        alpha: 0,
        active: false,
        drawn: -1,
      };
      if (kind === "surface") {
        state.topoPreview = createTopography(
          { querySelector: () => preview },
          wake,
        );
      }
      el.addEventListener("pointerenter", (e) => {
        if (e.pointerType === "mouse") {
          hover = index;
          wake();
        }
      });
      el.addEventListener("pointerleave", () => {
        hover = -1;
        wake();
      });
      el.addEventListener("focus", () => {
        hover = index;
        wake();
      });
      el.addEventListener("blur", () => {
        hover = -1;
        wake();
      });
      el.addEventListener("click", (e) => {
        e.preventDefault();
        openFilm(kind, el);
      });
      return state;
    },
  );
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const s = cards.find((c) => c.el === e.target);
        s.visible = e.isIntersecting;
      }
      wake();
    },
    { rootMargin: "120px" },
  );
  cards.forEach((c) => io.observe(c.el));
  function render(s, canvas, q) {
    renderPreview(canvas, {
      kind: s.kind,
      w: s.w,
      h: s.h,
      q,
      mobile,
      topography: s.topoPreview,
    });
  }
  return {
    measure() {
      mobile = matchMedia("(hover:none)").matches || innerWidth < 700;
      cards.forEach((s) => {
        s.w = s.art.clientWidth;
        s.h = s.art.clientHeight;
        s.top = s.el.getBoundingClientRect().top + scrollY;
        s.bottom = s.top + s.el.offsetHeight;
        s.dirty = true;
      });
    },
    update(y, dt, reduced, blocked = false) {
      center = -1;
      if (mobile && !blocked) {
        let best = Infinity;
        for (const s of cards) {
          const c = (s.top + s.bottom) / 2 - y,
            dist = Math.abs(c - innerHeight * 0.5);
          if (s.visible && c > 100 && c < innerHeight - 60 && dist < best) {
            center = s.index;
            best = dist;
          }
        }
      }
      let moving = false;
      for (const s of cards) {
        if (!s.visible) {
          s.active = false;
          s.alpha = 0;
          s.preview.style.opacity = 0;
          s.art.style.setProperty("--film-reveal", 0);
          continue;
        }
        if (s.dirty) {
          // Prewarm the first film frame near the viewport, behind the real capture.
          render(s, s.preview, 0);
          s.drawn = -1;
          s.dirty = false;
        }
        const active =
          !blocked && !reduced && (mobile ? center : hover) === s.index;
        if (active && !s.active && s.alpha === 0) {
          s.elapsed = 0;
          s.drawn = -1;
        }
        s.active = active;
        if (active)
          s.elapsed = Math.min(s.elapsed + dt, data[s.kind].seconds * 1000);
        const alphaTarget = active ? 1 : 0;
        s.alpha = mix(
          s.alpha,
          alphaTarget,
          1 - Math.exp(-dt / (active ? 90 : 170)),
        );
        if (Math.abs(s.alpha - alphaTarget) < 0.002) s.alpha = alphaTarget;
        s.preview.style.opacity = s.alpha;
        s.art.style.setProperty("--film-reveal", s.alpha);
        s.el.classList.toggle("is-previewing", active);
        // One shot: hold the decisive frame, never restart while the pointer stays.
        // Linear film clock; each authored event owns its easing. Last 0.6 seconds hold.
        const q = Math.min(1, s.elapsed / data[s.kind].seconds / 1000);
        if ((active || s.alpha > 0.005) && Math.abs(q - s.drawn) > 0.0002) {
          render(s, s.preview, q);
          s.drawn = q;
        }
        moving ||=
          (active && s.elapsed < data[s.kind].seconds * 1000) ||
          s.alpha !== alphaTarget;
      }
      return moving;
    },
    get state() {
      return cards.map((s) => ({
        kind: s.kind,
        active: s.active,
        elapsed: s.elapsed,
        visible: s.visible,
        alpha: s.alpha,
      }));
    },
  };
}
