// Living, hand-sketched background.
// A low-resolution canvas (scaled up with pixelated rendering) is slowly repainted
// toward a purple/blue gradient that depends on scroll position, while a handful of
// "pens" scribble crayon-like hatching over it. Scrolling makes the pens work faster,
// so the colour shift looks like it is being drawn in by hand.
(() => {
  const canvas = document.getElementById("sketch-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: false });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SCALE = 4;
  const PEN_COUNT = 7;
  const TAU = Math.PI * 2;

  const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const rand = (lo, hi) => lo + Math.random() * (hi - lo);
  const shade = (c, amt) => (amt >= 0 ? mix(c, [255, 255, 255], amt) : mix(c, [6, 8, 24], -amt));
  const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

  // Colour pairs [start, end] sampled from the game art, spread evenly down the page.
  const STOPS = [
    ["#3F3F73", "#2059BE"],
    ["#2059BE", "#34306E"],
    ["#56409C", "#1C5AC2"],
    ["#1B4AA8", "#4C3F8F"],
    ["#443A82", "#2463CF"],
  ].map((pair) => pair.map(hexToRgb));

  function paletteAt(p) {
    const f = clamp(p, 0, 1) * (STOPS.length - 1);
    const i = Math.min(Math.floor(f), STOPS.length - 2);
    const t = smooth(f - i);
    return [mix(STOPS[i][0], STOPS[i + 1][0], t), mix(STOPS[i][1], STOPS[i + 1][1], t)];
  }

  let w = 0;
  let h = 0;
  let progress = 0;
  let targetProgress = 0;
  let lastScrollY = window.scrollY;
  let activity = 0;
  let colors = paletteAt(0);
  let axis = { x0: 0, y0: 0, dx: 1, dy: 0, len2: 1 };

  function scrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  }

  function updateAxis() {
    const angle = (35 + progress * 110) * (Math.PI / 180);
    const r = Math.hypot(w, h) / 2;
    const cx = w / 2;
    const cy = h / 2;
    const x0 = cx - Math.cos(angle) * r;
    const y0 = cy - Math.sin(angle) * r;
    const dx = Math.cos(angle) * r * 2;
    const dy = Math.sin(angle) * r * 2;
    axis = { x0, y0, dx, dy, len2: dx * dx + dy * dy };
  }

  function colorAt(x, y) {
    const t = clamp(((x - axis.x0) * axis.dx + (y - axis.y0) * axis.dy) / axis.len2, 0, 1);
    return mix(colors[0], colors[1], t);
  }

  function paintGradient(alpha) {
    const g = ctx.createLinearGradient(axis.x0, axis.y0, axis.x0 + axis.dx, axis.y0 + axis.dy);
    g.addColorStop(0, css(colors[0]));
    g.addColorStop(0.5, css(mix(colors[0], colors[1], 0.5)));
    g.addColorStop(1, css(colors[1]));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }

  // A pen shades a small patch with back-and-forth hatching, then moves elsewhere.
  class Pen {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = rand(-10, w + 10);
      this.y = rand(-10, h + 10);
      const a = rand(0, TAU);
      this.ux = Math.cos(a);
      this.uy = Math.sin(a);
      this.len = rand(10, 34);
      this.gap = rand(1.2, 2.6);
      this.s = 0;
      this.dirSign = 1;
      this.hatchesLeft = Math.floor(rand(6, 22));
      this.width = rand(1.5, 4.5);
      this.tone = rand(-0.22, 0.2);
      this.wobble = rand(0, TAU);
    }
    step(dist) {
      const px = this.x;
      const py = this.y;
      this.wobble += 0.35;
      const jitter = Math.sin(this.wobble) * 0.35;
      this.x += (this.ux + -this.uy * jitter * 0.3) * dist * this.dirSign;
      this.y += (this.uy + this.ux * jitter * 0.3) * dist * this.dirSign;
      this.s += dist;

      const c = shade(colorAt(this.x, this.y), this.tone);
      ctx.strokeStyle = css(c, 0.32);
      ctx.lineWidth = this.width;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();

      if (this.s >= this.len) {
        this.s = rand(-2, 2);
        this.dirSign *= -1;
        this.x += -this.uy * this.gap;
        this.y += this.ux * this.gap;
        this.len *= rand(0.85, 1.15);
        if (--this.hatchesLeft <= 0) this.reset();
      }
    }
  }

  let pens = [];

  function resize(force) {
    const nw = Math.ceil(window.innerWidth / SCALE);
    const nh = Math.ceil(window.innerHeight / SCALE);
    // Mobile URL bars change the height constantly; only rebuild on real changes.
    if (!force && nw === w && Math.abs(nh - h) < 30) return;
    w = nw;
    h = nh;
    canvas.width = w;
    canvas.height = h;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    updateAxis();
    paintGradient(1);
    pens = Array.from({ length: PEN_COUNT }, () => new Pen());
  }

  function publishColors() {
    const root = document.documentElement.style;
    root.setProperty("--tint-a", css(colors[0]));
    root.setProperty("--tint-b", css(colors[1]));
  }

  function frame() {
    targetProgress = scrollProgress();
    const scrollDelta = Math.abs(window.scrollY - lastScrollY);
    lastScrollY = window.scrollY;

    activity += (Math.min(scrollDelta / 18, 4) - activity) * 0.12;
    progress += (targetProgress - progress) * 0.05;

    colors = paletteAt(progress);
    updateAxis();

    paintGradient(0.014 + activity * 0.01);

    const steps = Math.round(2 + activity * 5);
    for (const pen of pens) {
      for (let i = 0; i < steps; i++) pen.step(1.6);
    }

    publishColors();
    requestAnimationFrame(frame);
  }

  function staticFrame() {
    progress = scrollProgress();
    colors = paletteAt(progress);
    updateAxis();
    paintGradient(1);
    publishColors();
  }

  window.addEventListener("resize", () => resize(false));
  resize(true);

  if (reduceMotion) {
    window.addEventListener("scroll", staticFrame, { passive: true });
    staticFrame();
  } else {
    requestAnimationFrame(frame);
  }

  window.VS_BG = { paletteAt };
})();
