// Header and footer portraits share the original talking/blinking states.
(() => {
  document.querySelectorAll("[data-site-portrait]").forEach(image => {
    const animation = window.VS_PORTRAIT.create(image, `assets/Sprites/${image.dataset.sitePortrait}_neutral`, {
      variants: ["_blink", "_talking", "_talking_blink"],
    });
    image.addEventListener("pointerenter", () => animation.setTalking(true));
    image.addEventListener("pointerleave", () => animation.setTalking(false));
  });
})();
