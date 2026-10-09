// Rotate a pixel rim traced from the game reference; lettering drifts subtly.
(() => {
  const ring = document.getElementById("explore-ring");
  if (!ring) return;
  const root = document.getElementById("ring-categories");
  const buttons = [...ring.querySelectorAll("[data-explore-group]")];
  const menus = [...ring.querySelectorAll(".action-ring__submenu")];
  let opener;
  function closeMenu() {
    menus.forEach(menu => { menu.hidden = true; });
    buttons.forEach(button => button.setAttribute("aria-expanded", "false"));
    root.hidden = false;
    opener?.focus({ preventScroll: true });
  }
  buttons.forEach(button => button.addEventListener("click", () => {
    opener = button;
    root.hidden = true;
    const selected = document.getElementById(button.getAttribute("aria-controls"));
    menus.forEach(menu => { menu.hidden = menu !== selected; });
    buttons.forEach(other => other.setAttribute("aria-expanded", String(other === button)));
    selected.querySelector("a").focus({ preventScroll: true });
  }));
  ring.querySelectorAll(".action-ring__back").forEach(button => button.addEventListener("click", closeMenu));
  ring.addEventListener("keydown", event => {
    if (event.key === "Escape" && root.hidden) { event.preventDefault(); closeMenu(); return; }
    const directions = { ArrowUp: 0, ArrowLeft: 1, ArrowRight: 2, ArrowDown: 3 };
    if (!root.hidden && buttons.includes(document.activeElement) && event.key in directions) {
      event.preventDefault(); buttons[directions[event.key]].focus();
    }
  });
  const canvas = document.getElementById("explore-ring-art");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  // Main-purple contours sampled from the supplied game reference.
  const outer = [57.43,57.21,56.46,56.24,55.92,55.7,55.6,55.49,55.7,55.7,55.7,55.7,55.81,56.46,57.0,57.54,58.07,58.72,59.37,59.47,59.37,59.37,59.15,58.94,58.07,57.43,56.89,56.57,56.35,56.13,56.24,56.35,56.57,56.78,56.89,57.0,57.0,57.21,57.43,57.75,57.97,57.97,58.07,58.07,57.97,57.75,57.54,57.32,57.54,56.89,56.24,55.16,54.95,55.06,55.16,55.38,55.7,55.92,56.35,56.57,57.32,57.86,58.07,58.07,57.97,58.07,58.07,58.18,58.4,58.51,58.4,58.18,57.86,57.54,57.21,56.89,56.57,56.13,55.92,55.7,55.6,55.6,56.13,56.78,57.32,57.21,57.21,57.0,56.89,57.32,57.86,58.4,58.4,58.4,58.51,58.29,58.07,57.97,57.75,57.64,57.1,57.1,56.78,56.78,56.35,56.24,56.03,56.03,56.35,56.89,57.32,57.97,58.51,59.26,59.15,59.26,58.83,58.72,58.07,58.07];
  const inner = [51.72,51.82,51.39,51.5,51.39,51.5,51.61,51.5,51.39,51.18,50.96,51.18,51.29,51.93,52.15,52.58,53.01,53.66,54.09,54.09,53.98,53.98,53.87,53.66,53.44,53.33,53.12,52.79,52.58,52.58,52.69,52.58,52.36,52.04,51.61,51.39,51.18,51.5,51.82,52.47,52.69,53.01,53.12,53.33,53.55,53.44,53.23,52.47,52.15,51.82,51.61,51.07,50.64,50.64,50.75,50.64,50.42,50.21,50.53,50.75,51.5,51.82,52.26,52.69,53.44,53.87,53.98,54.09,54.2,54.41,54.3,54.41,53.76,53.23,52.15,51.61,50.96,50.53,50.21,50.1,50.32,50.42,50.86,51.39,51.93,52.15,52.47,52.69,52.79,53.01,53.12,53.33,53.12,53.12,53.01,52.79,52.79,52.69,52.69,52.26,52.04,51.93,51.93,51.93,51.61,51.61,51.5,51.82,52.36,52.9,53.12,53.33,53.44,53.76,53.44,53.23,52.79,52.47,52.04,52.04];
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let angle = 0, frame = 0, previous = 0, animation = 0, visible = false;
  function contour(profile, offset) {
    profile.forEach((radius, i) => {
      const a = i * Math.PI * 2 / profile.length;
      const x = Math.cos(a) * (radius + offset), y = Math.sin(a) * (radius + offset);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
  }
  function paint() {
    ctx.clearRect(0, 0, 128, 128);
    ctx.save(); ctx.translate(64, 64); ctx.rotate(angle);
    ctx.beginPath(); contour(outer, 1.6); contour(inner, -1.6);
    ctx.fillStyle = "#221c42"; ctx.fill("evenodd");
    ctx.beginPath(); contour(outer, 0); contour(inner, 0);
    ctx.fillStyle = "#40407c"; ctx.fill("evenodd");
    ctx.restore();
    // Keep the game pixels solid as the outline rotates through the raster.
    const pixels = ctx.getImageData(0, 0, 128, 128);
    for (let i = 0; i < pixels.data.length; i += 4) {
      pixels.data[i + 3] = pixels.data[i + 3] >= 128 ? 255 : 0;
      const purple = pixels.data[i] >= 49;
      pixels.data[i] = purple ? 64 : 34;
      pixels.data[i + 1] = purple ? 64 : 28;
      pixels.data[i + 2] = purple ? 124 : 66;
    }
    ctx.putImageData(pixels, 0, 0);
    canvas.dataset.frame = String(++frame);
  }
  function tick(now) {
    if (now - previous >= 32) {
      angle += Math.min(now - previous, 200) / 1000 * .38;
      previous = now; paint();
    }
    animation = requestAnimationFrame(tick);
  }
  function synchronize() {
    cancelAnimationFrame(animation);
    paint();
    if (visible && !document.hidden && !motion.matches) {
      previous = performance.now(); animation = requestAnimationFrame(tick);
    }
  }
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; synchronize(); });
  observer.observe(ring);
  canvas.classList.add("has-artwork"); synchronize();
  motion.addEventListener("change", synchronize);
  document.addEventListener("visibilitychange", synchronize);
  window.addEventListener("pagehide", () => { cancelAnimationFrame(animation); observer.disconnect(); });
  window.addEventListener("pageshow", () => { observer.observe(ring); synchronize(); });
})();
