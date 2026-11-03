/* Motion's free vanilla JavaScript API works on this static HTML site (no React required). */
import { animate } from "https://cdn.jsdelivr.net/npm/motion@14.9.0/+esm";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

if (!reduceMotion) {
  // Subtle, responsive product feedback without altering the cart behavior.
  document.querySelectorAll("[data-select-product]").forEach((button) => {
    const price = button.querySelector("span");
    if (!price) return;
    button.addEventListener("click", () => {
      animate(price, { scale: [1, 1.09, 1] }, { duration: 0.38, ease: "easeOut" });
    });
  });

  if (finePointer) {
    // Animate the picture only; all original links/buttons stay fully functional.
    document.querySelectorAll(".product, .other-format").forEach((card) => {
      const image = card.querySelector("img");
      if (!image) return;
      card.addEventListener("pointerenter", () => {
        animate(image, { scale: 1.055 }, { duration: 0.38, ease: "easeOut" });
      });
      card.addEventListener("pointerleave", () => {
        animate(image, { scale: 1 }, { duration: 0.38, ease: "easeOut" });
      });
    });
  }
}
