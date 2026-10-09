// Teaser player: one window, arrow through the YouTube teasers.
// Each slide shows a thumbnail facade until clicked, so only the playing video
// has a live iframe. Switching slides is a jagged "hand-drawn" wipe with a shifting pixel edge.
(() => {
  const cfg = window.VS_CONFIG;
  const player = document.getElementById("teaser-player");
  if (!player || !cfg || !cfg.teasers.length) return;

  const teasers = cfg.teasers;
  const slidesEl = document.getElementById("teaser-slides");
  const orderEl = document.getElementById("teaser-order");
  const countEl = document.getElementById("teaser-count");
  const titleEl = document.getElementById("teaser-title");
  const liveEl = document.getElementById("teaser-live");
  const youtubeLink = document.getElementById("teaser-youtube");
  const screen = player.querySelector(".player__screen");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // YouTube rejects embeds without a Referer (error 153), which is what a page opened
  // straight from disk sends. Hop over to the local server when it's running.
  const SERVER_URL = "http://localhost:8080/";
  const isFilePage = location.protocol === "file:";
  if (isFilePage) {
    fetch(SERVER_URL, { mode: "no-cors" })
      .then(() => location.replace(SERVER_URL + location.hash))
      .catch(() => {});
  }

  const shortTitle = (t) => t.replace(/^Vex\s*&\s*Shell:\s*/i, "");
  const thumb = (id, q) => `https://i.ytimg.com/vi/${id}/${q}.jpg`;

  const PLAY_ICON =
    '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M4 2h2v12H4zM6 3h2v10H6zM8 4h2v8H8zM10 5h2v6h-2zM12 6h2v4h-2z"/></svg>';

  let index = 0;
  let animating = false;
  let typeTimer = null;

  const slides = teasers.map((t, i) => {
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.id = `teaser-slide-${i}`;
    slide.setAttribute("role", "tabpanel");
    slide.setAttribute("aria-label", t.title);
    slide.hidden = i !== 0;
    slide.appendChild(makeFacade(t, i));
    slidesEl.appendChild(slide);
    return slide;
  });

  const tabs = teasers.map((t, i) => {
    const b = document.createElement("button");
    b.className = "order__item";
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-controls", `teaser-slide-${i}`);
    b.innerHTML =
      `<span class="order__thumb"><img src="${thumb(t.id, "mqdefault")}" alt="" loading="lazy" /></span>` +
      `<span class="order__num">${i + 1}.</span>` +
      `<span class="order__name">${shortTitle(t.title)}</span>`;
    b.addEventListener("click", () => go(i, i > index ? 1 : -1));
    orderEl.appendChild(b);
    return b;
  });


  function makeFacade(t, i) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slide__facade";
    btn.setAttribute("aria-label", `Play ${t.title}`);

    const img = document.createElement("img");
    img.alt = "";
    img.src = thumb(t.id, "maxresdefault");
    img.addEventListener("load", function onLoad() {
      // YouTube serves a 120px placeholder when a max-res thumbnail doesn't exist.
      if (img.naturalWidth <= 120) img.src = thumb(t.id, "hqdefault");
    });
    img.addEventListener("error", () => (img.src = thumb(t.id, "hqdefault")), { once: true });

    const play = document.createElement("span");
    play.className = "slide__play";
    play.innerHTML = PLAY_ICON;

    btn.append(img, play);
    btn.addEventListener("click", () => playSlide(i));
    return btn;
  }

  function showServerNotice(i) {
    const note = document.createElement("div");
    note.className = "slide__notice";
    note.innerHTML =
      "<p><strong>Almost there!</strong></p>" +
      "<p>YouTube won't play videos on a page opened straight from a file.</p>" +
      "<p>Double-click <code>start.bat</code> (or run <code>npm start</code>) in the website folder, " +
      `then open <a href="${SERVER_URL}">${SERVER_URL}</a>.</p>`;
    slides[i].replaceChildren(note);
  }

  function playSlide(i) {
    if (isFilePage) {
      showServerNotice(i);
      return;
    }
    const t = teasers[i];
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${t.id}?autoplay=1&rel=0&controls=1&playsinline=1`;
    iframe.title = t.title;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    slides[i].replaceChildren(iframe);
    player.classList.add("is-playing");
  }

  function resetSlide(i) {
    if (!slides[i].querySelector(".slide__facade")) slides[i].replaceChildren(makeFacade(teasers[i], i));
  }

  function typeTitle(text) {
    clearInterval(typeTimer);
    liveEl.textContent = text;
    if (reduceMotion) {
      titleEl.textContent = text;
      return;
    }
    let n = 0;
    titleEl.textContent = "";
    typeTimer = setInterval(() => {
      n++;
      titleEl.textContent = text.slice(0, n);
      if (n >= text.length) clearInterval(typeTimer);
    }, 26);
  }

  function updateUI() {
    youtubeLink.href = `https://www.youtube.com/watch?v=${teasers[index].id}`;
    youtubeLink.setAttribute("aria-label", `Watch ${teasers[index].title} on YouTube`);
    countEl.textContent = `Teaser ${index + 1} / ${teasers.length}`;
    typeTitle(teasers[index].title);
    tabs.forEach((b, i) => {
      b.setAttribute("aria-selected", String(i === index));
      b.tabIndex = i === index ? 0 : -1;
    });
  }

  // Polygon covering the revealed part of the slide, with a scribbly leading edge.
  function wipePolygon(p, dir) {
    const pts = [];
    const segments = 12;
    for (let s = 0; s <= segments; s++) {
      const y = (s / segments) * 100;
      const jitter = (Math.random() - 0.5) * 7;
      const x = dir > 0 ? 100 - p + jitter : p + jitter;
      pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    }
    const edge = dir > 0 ? ["100% 100%", "100% 0%"] : ["0% 100%", "0% 0%"];
    return `polygon(${pts.join(", ")}, ${edge.join(", ")})`;
  }

  function go(next, dir) {
    next = (next + teasers.length) % teasers.length;
    if (animating || next === index) return;

    const prev = index;
    index = next;
    updateUI();
    player.classList.remove("is-playing");

    const from = slides[prev];
    const to = slides[next];
    to.hidden = false;

    if (reduceMotion) {
      from.hidden = true;
      resetSlide(prev);
      return;
    }

    animating = true;
    to.classList.add("slide--incoming");

    const steps = 10;
    const frames = [];
    for (let k = 0; k <= steps; k++) {
      const p = -8 + (116 * k) / steps;
      frames.push({ clipPath: wipePolygon(p, dir) });
    }
    frames[frames.length - 1] = { clipPath: "polygon(-10% -10%, 110% -10%, 110% 110%, -10% 110%)" };

    const duration = 700;
    const easing = "cubic-bezier(.55,.1,.35,1)";
    const anim = to.animate(frames, { duration, easing });

    anim.onfinish = () => {
      to.classList.remove("slide--incoming");
      from.hidden = true;
      resetSlide(prev);
      animating = false;
    };
  }

  document.getElementById("teaser-prev").addEventListener("click", () => go(index - 1, -1));
  document.getElementById("teaser-next").addEventListener("click", () => go(index + 1, 1));

  orderEl.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    go(index + dir, dir);
    tabs[index].focus();
  });

  let inView = false;
  new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), { threshold: 0.4 }).observe(player);
  document.addEventListener("keydown", (e) => {
    if (!inView || e.defaultPrevented) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
    if (orderEl.contains(document.activeElement)) return;
    if (e.key === "ArrowRight") go(index + 1, 1);
    if (e.key === "ArrowLeft") go(index - 1, -1);
  });

  let startX = null;
  let swiped = false;
  screen.addEventListener("pointerdown", (e) => {
    startX = e.clientX;
    swiped = false;
  });
  screen.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) {
      swiped = true;
      go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }
  });
  screen.addEventListener(
    "click",
    (e) => {
      if (!swiped) return;
      swiped = false;
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );

  updateUI();
})();
