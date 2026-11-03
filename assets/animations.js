/* Free website animation enhancements. All effects are optional and fail open. */
(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (gsap) {
    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    const heroCopy = document.querySelectorAll(
      ".hero .hero-copy > .eyebrow, .hero .hero-copy > h1, .hero .hero-copy > .hero-desc, .hero .hero-copy > .hero-choice-cta"
    );
    if (heroCopy.length) {
      gsap.from(heroCopy, {
        opacity: 0,
        y: 24,
        duration: 0.85,
        stagger: 0.11,
        ease: "power3.out",
        clearProps: "opacity,transform"
      });
    }

    const heroVisual = document.querySelector(".hero .hero-product-scene");
    if (heroVisual) {
      gsap.from(heroVisual, {
        opacity: 0,
        y: 28,
        duration: 1.05,
        delay: 0.14,
        ease: "power2.out",
        clearProps: "opacity,transform"
      });
    }

    if (ScrollTrigger) {
      const headings = document.querySelectorAll(
        ".section-head h2, .network-intro h2, .research-head h3, .editorial-copy h2, .photo-story-content h2, .detail-section h1"
      );
      headings.forEach((heading) => {
        gsap.from(heading, {
          opacity: 0,
          y: 20,
          duration: 0.85,
          ease: "power2.out",
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: heading,
            start: "top 92%",
            once: true
          }
        });
      });

      const story = document.querySelector(".photo-story-banner");
      const storyImage = story && story.querySelector(".photo-story-image");
      if (storyImage && finePointer) {
        storyImage.classList.add("scroll-parallax-image");
        gsap.fromTo(storyImage,
          { scale: 1.09, yPercent: -2 },
          {
            scale: 1.09,
            yPercent: 2,
            ease: "none",
            scrollTrigger: {
              trigger: story,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.7
            }
          }
        );
      }
    }
  }

  // Lenis enhances desktop wheel scrolling only: touch and reduced-motion stay native.
  if (window.Lenis && finePointer && window.innerWidth >= 1024) {
    const lenis = new window.Lenis({
      autoRaf: !gsap,
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
      anchors: true
    });

    if (gsap) {
      const tick = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      if (ScrollTrigger) lenis.on("scroll", () => ScrollTrigger.update());
      window.addEventListener("pagehide", () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
      }, { once: true });
    } else {
      window.addEventListener("pagehide", () => lenis.destroy(), { once: true });
    }
  }
})();
