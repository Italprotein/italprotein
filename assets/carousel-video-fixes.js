/* Keep all three banner rails seamless: two identical runs, each wider
   than the visible window, animated continuously with CSS rather than a
   stepped JavaScript carousel. The original cards remain intact. */
(() => {
  "use strict";

  const rails = [
    {windowSelector: ".announcement-marquee .marquee-window", track: ".marquee-track", group: ".marquee-group", pixelsPerSecond: 54},
    {windowSelector: ".network-section .network-rail", track: ".network-track", group: ".network-group", pixelsPerSecond: 43},
    {windowSelector: ".network-section .research-rail", track: ".research-track", group: ".research-group", pixelsPerSecond: 45}
  ];

  rails.forEach(config => {
    const viewport = document.querySelector(config.windowSelector);
    if (!viewport) return;
    const track = viewport.querySelector(config.track);
    if (!track) return;
    const groups = Array.from(track.children).filter(node => node.matches(config.group));
    if (groups.length !== 2) return;

    const sourceCards = Array.from(groups[0].children).map(child => child.cloneNode(true));
    if (!sourceCards.length) return;

    // Fixed palette for each original application, independent of its position.
    if (config.group === ".research-group") {
      groups.forEach(group => {
        Array.from(group.children).forEach((card, index) => {
          card.setAttribute("data-tone", String(index % 3));
        });
      });
      sourceCards.forEach((card, index) => card.setAttribute("data-tone", String(index % 3)));
    }

    let lastWidth = 0;
    let queued = false;

    const build = () => {
      queued = false;
      const viewportWidth = viewport.getBoundingClientRect().width;
      if (viewportWidth <= 0 || Math.abs(viewportWidth - lastWidth) < 0.75) return;
      lastWidth = viewportWidth;

      // Start from the two original identical groups, remove only our clones.
      for (const group of groups) {
        group.querySelectorAll("[data-seamless-copy]").forEach(node => node.remove());
      }

      const sampleWidth = sourceCards[0].getBoundingClientRect().width || 80;
      const minimumWidth = viewportWidth + Math.min(480, sampleWidth + 32);
      let repetitions = 0;

      // Expand BOTH groups in exactly the same order. This guarantees that
      // translating by 50% of the two-group track can never expose empty space.
      while (groups[0].getBoundingClientRect().width < minimumWidth && repetitions < 24) {
        groups.forEach(group => {
          const fragment = document.createDocumentFragment();
          sourceCards.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute("data-seamless-copy", "");
            clone.setAttribute("aria-hidden", "true");
            clone.inert = true;
            clone.querySelectorAll("img").forEach(img => { img.loading = "eager"; });
            fragment.appendChild(clone);
          });
          group.appendChild(fragment);
        });
        repetitions++;
      }

      const firstWidth = groups[0].getBoundingClientRect().width;
      const secondWidth = groups[1].getBoundingClientRect().width;
      // Maintain a readable linear speed on both small and large screens.
      const seconds = Math.max(20, firstWidth / config.pixelsPerSecond);
      track.style.setProperty("--marquee-seconds", seconds.toFixed(2) + "s");

      // Restart the CSS loop after sizes change; no content is ever removed
      // from the visible strip during an ordinary rotation.
      track.style.setProperty("animation", "none", "important");
      void track.offsetWidth;
      track.style.removeProperty("animation");

      if (Math.abs(firstWidth - secondWidth) > 1) {
        // A difference would break the seamless midpoint. The two groups
        // have identical items and styles; report in console for QA only.
        console.warn("Carousel group width mismatch", config.group, firstWidth, secondWidth);
      }
    };

    const schedule = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(build);
    };

    schedule();
    if ("ResizeObserver" in window) new ResizeObserver(schedule).observe(viewport);
    else window.addEventListener("resize", schedule, {passive: true});
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {lastWidth = 0; schedule();});
    }
  });
})();