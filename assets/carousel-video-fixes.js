/* Infinite full-card carousels: repopulate ahead of the viewport on every move.
   Avoid an end-of-track blank area, even after many complete rotations. */
(() => {
  "use strict";

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const configs = [
    {rail: ".network-rail", track: ".network-track", title: "Partner e collaborazioni / Partners and collaborations", desktop: 2},
    {rail: ".research-rail", track: ".research-track", title: "Applicazioni / Applications", desktop: 3}
  ];

  configs.forEach(({rail: railSelector, track: trackSelector, title, desktop}) => {
    const rail = document.querySelector(railSelector);
    if (!rail) return;
    const track = rail.querySelector(trackSelector);
    if (!track) return;

    // Preserve the true articles as a template. The old HTML includes two
    // fixed groups; they cannot guarantee a filled viewport as the rail loops.
    const sourceGroup = track.querySelector(railSelector === ".network-rail" ? ".network-group" : ".research-group");
    if (!sourceGroup) return;
    const templates = Array.from(sourceGroup.children).map(item => item.cloneNode(true));
    const total = templates.length;
    if (total < 2) return;

    let first = 0;
    let shown = 1;
    let step = 0;
    let busy = false;
    let hovered = false;
    let focused = false;
    let inView = !("IntersectionObserver" in window);
    let fallbackTimer = null;
    let pendingDirection = 0;
    const gap = 16;

    const controls = document.createElement("div");
    controls.className = "rail-carousel-controls";
    const button = (symbol, action) => {
      const el = document.createElement("button");
      el.type = "button";
      el.textContent = symbol;
      el.setAttribute("aria-label", action + " – " + title);
      return el;
    };
    const previous = button("‹", "Precedente / Previous");
    const next = button("›", "Successivo / Next");
    controls.append(previous, next);
    rail.insertAdjacentElement("afterend", controls);

    const cardAt = index => templates[((index % total) + total) % total].cloneNode(true);

    // Always build one full additional card beyond the right edge. As soon as
    // movement completes, rebuild the next run before the next animation.
    const draw = () => {
      track.style.transition = "none";
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < shown + 1; i++) {
        const card = cardAt(first + i);
        if (i === shown) {
          card.setAttribute("aria-hidden", "true");
          card.inert = true;
        }
        fragment.appendChild(card);
      }
      track.replaceChildren(fragment);
      track.style.transform = "translate3d(0,0,0)";
      void track.offsetWidth;
      track.style.transition = "";
    };

    const resize = () => {
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      busy = false;
      pendingDirection = 0;
      const width = rail.getBoundingClientRect().width;
      if (width < 1) return;
      shown = Math.min(total, width <= 620 ? 1 : width <= 1020 ? 2 : desktop);
      step = width / shown;
      rail.style.setProperty("--full-card-width", (step - gap) + "px");
      rail.style.setProperty("--full-card-gap", gap + "px");
      draw();
    };

    const finish = () => {
      if (!busy) return;
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      first = (first + pendingDirection + total) % total;
      pendingDirection = 0;
      busy = false;
      draw();
    };

    const go = direction => {
      if (busy || step <= 0) return;
      if (motionPreference.matches) {
        first = (first + direction + total) % total;
        draw();
        return;
      }

      busy = true;
      pendingDirection = direction;
      if (direction === 1) {
        // The next item already exists at the right, fully rendered.
        track.style.transform = "translate3d(" + (-step) + "px,0,0)";
      } else {
        // Prepend a full card invisibly, then animate it into view.
        track.style.transition = "none";
        track.insertBefore(cardAt(first - 1), track.firstChild);
        track.style.transform = "translate3d(" + (-step) + "px,0,0)";
        void track.offsetWidth;
        track.style.transition = "";
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (busy && pendingDirection === -1) {
              track.style.transform = "translate3d(0,0,0)";
            }
          });
        });
      }
      fallbackTimer = window.setTimeout(finish, 850);
    };

    track.addEventListener("transitionend", event => {
      if (event.target === track && event.propertyName === "transform") finish();
    });
    previous.addEventListener("click", () => go(-1));
    next.addEventListener("click", () => go(1));
    rail.addEventListener("keydown", event => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      go(event.key === "ArrowRight" ? 1 : -1);
    });
    rail.addEventListener("mouseenter", () => { hovered = true; });
    rail.addEventListener("mouseleave", () => { hovered = false; });
    rail.addEventListener("focusin", () => { focused = true; });
    rail.addEventListener("focusout", event => {
      if (!rail.contains(event.relatedTarget)) focused = false;
    });
    controls.addEventListener("focusin", () => { focused = true; });
    controls.addEventListener("focusout", event => {
      if (!controls.contains(event.relatedTarget)) focused = false;
    });

    rail.classList.add("is-card-carousel");
    rail.setAttribute("role", "region");
    rail.setAttribute("aria-roledescription", "carousel");
    rail.setAttribute("aria-label", title);
    track.setAttribute("aria-live", "off");

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(entries => {
        inView = entries.some(entry => entry.isIntersecting);
      }, {threshold: 0.05}).observe(rail);
    }
    if ("ResizeObserver" in window) {
      new ResizeObserver(resize).observe(rail);
    } else {
      window.addEventListener("resize", resize, {passive: true});
    }
    resize();

    window.setInterval(() => {
      if (!document.hidden && !hovered && !focused && inView && !motionPreference.matches) {
        go(1);
      }
    }, 4800);
  });
})();
