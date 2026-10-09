// Original open, talking, blinking, and talking+blinking portrait frames.
(() => {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  function create(image, initialBase, options = {}) {
    let base = initialBase, talking = false, mouth = false, blink = false;
    let blinkTimer, mouthTimer, visible = false;
    const variants = () => options.variants || window.VS_SHOWCASE?.dialogue?.frames[base.split("/").pop()] || [];
    const animated = () => visible && !motion.matches && !document.hidden;
    function preload() { for (const suffix of ["", ...variants()]) new Image().src = `${base}${suffix}.webp`; }
    function render() {
      const frames = variants();
      const candidate = `${talking && mouth ? "_talking" : ""}${blink ? "_blink" : ""}`;
      const suffix = !animated() ? "" : frames.includes(candidate) ? candidate : blink && frames.includes("_blink") ? "_blink" : talking && mouth && frames.includes("_talking") ? "_talking" : "";
      const src = `${base}${suffix}.webp`;
      if (image.getAttribute("src") !== src) image.src = src;
      image.dataset.portraitState = suffix || "idle";
    }
    function scheduleBlink() {
      if (!animated()) return;
      blinkTimer = setTimeout(() => {
        blink = true; render();
        blinkTimer = setTimeout(() => { blink = false; render(); scheduleBlink(); }, 130);
      }, 3200 + Math.random() * 4200);
    }
    function clear() { clearTimeout(blinkTimer); clearInterval(mouthTimer); mouth = blink = false; }
    function restart() {
      clear(); render(); scheduleBlink();
      if (talking && animated()) mouthTimer = setInterval(() => { mouth = !mouth; render(); }, 110);
    }
    function setBase(next) { if (base !== next) { base = next; preload(); restart(); } }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; restart(); });
    observer.observe(image);
    document.addEventListener("visibilitychange", restart); motion.addEventListener("change", restart);
    window.addEventListener("pagehide", clear);
    window.addEventListener("pageshow", restart);
    preload(); render();
    return { setBase, setTalking(on) { if (talking !== on) { talking = on; restart(); } } };
  }
  window.VS_PORTRAIT = { create };
})();
