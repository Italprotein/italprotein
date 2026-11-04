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

/* Make the primary hero autoplay silently, and pause it outside the viewport.
   Keep the old hero photograph visible until video playback actually begins. */
(() => {
  "use strict";
  const media = document.querySelectorAll("[data-hero-video]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.forEach((video) => {
    const scene = video.closest(".hero-product-scene");
    if (!scene) return;
    video.muted = true;
    video.volume = 0;
    video.defaultMuted = true;
    let visible = true;
    const clearVideo = () => scene.classList.remove("hero-video-playing");
    const tryPlay = () => {
      if (reduced.matches || !visible || document.hidden) return;
      video.play().then(() => {
        if (!video.paused && !reduced.matches) scene.classList.add("hero-video-playing");
      }).catch(clearVideo);
    };
    video.addEventListener("playing", () => {
      if (!reduced.matches) scene.classList.add("hero-video-playing");
    });
    video.addEventListener("error", clearVideo);
    video.addEventListener("stalled", clearVideo);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        visible = entries.some(entry => entry.isIntersecting);
        if (visible) tryPlay();
        else {
          video.pause();
          clearVideo();
        }
      }, {threshold:0.08});
      observer.observe(scene);
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) video.pause();
      else tryPlay();
    });
    const updateMotion = () => {
      if (reduced.matches) {video.pause();clearVideo();}
      else tryPlay();
    };
    if (reduced.addEventListener) reduced.addEventListener("change",updateMotion);
    tryPlay();
  });
})();
