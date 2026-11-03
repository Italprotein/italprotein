/* Video is loaded only when visible: storefront remains fast and works without it. */
(() => {
  "use strict";
  const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const videos = document.querySelectorAll("[data-promo-video]");
  videos.forEach((video) => {
    if (!motionOK) return;
    const stage = video.closest(".promo-film-stage");
    if (!stage) return;
    let ready = false;
    let visible = false;
    video.addEventListener("loadeddata", () => {
      ready = true;
      stage.classList.add("has-video");
      if (visible) video.play().catch(() => stage.classList.remove("has-video"));
    });
    video.addEventListener("error", () => {
      ready = false;
      stage.classList.remove("has-video");
    });
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        visible = entries.some(e => e.isIntersecting);
        if (visible) {
          video.preload = "metadata";
          if (ready) video.play().catch(() => stage.classList.remove("has-video"));
          else video.load();
        } else video.pause();
      }, {threshold:0.12});
      observer.observe(stage);
    } else {
      visible = true;
      video.preload = "metadata";
      video.load();
    }
    document.addEventListener("visibilitychange", () => {
      if(document.hidden) video.pause();
      else if(visible && ready) video.play().catch(() => {});
    });
  });
})();
