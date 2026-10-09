(() => {
  const onHome = /(?:\/|\/index\.html)$/.test(location.pathname);
  const movedPages = { "#music": "music.html", "#jukebox": "jukebox.html", "#combat": "combat.html", "#characters": "characters.html", "#bbi": "bbi.html", "#demo": "dialogue.html", "#karma": "about.html#karma", "#steam": "steam.html", "#kickstarter": "kickstarter.html", "#support": "support.html" };
  if (onHome && movedPages[location.hash]) { location.replace(movedPages[location.hash]); return; }
  const cfg = window.VS_CONFIG || {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SVG_NS = "http://www.w3.org/2000/svg";

  // ---------- Boiling lines: cycle the rough filters like hand-drawn animation ----------
  if (!reduceMotion) {
    let boil = 0;
    setInterval(() => {
      boil = (boil + 1) % 3;
      document.body.dataset.boil = String(boil);
    }, 150);
  }

  // ---------- Scribbles injected into titles and nav links ----------
  function scribbleSvg(className, viewBox, d) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", className);
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("pathLength", "1");
    svg.appendChild(path);
    return svg;
  }

  // Title underlines: the scribble path is stamped onto a low-res canvas with a square
  // brush (no anti-aliasing) and scaled up, so it reads as pixel art.
  const UNDERLINE_PATH = "M4 14 C 50 6, 90 20, 150 11 S 250 5, 296 13 M 40 19 C 110 14, 190 22, 262 16";
  const UNDERLINE_BOX = { w: 300, h: 24 };
  const PIXEL = 4;

  const underlinePoints = (() => {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "svg-defs");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", UNDERLINE_PATH);
    svg.appendChild(path);
    document.body.appendChild(svg);
    const total = path.getTotalLength();
    const pts = [];
    for (let i = 0; i <= 900; i++) {
      const p = path.getPointAtLength((total * i) / 900);
      pts.push([p.x / UNDERLINE_BOX.w, p.y / UNDERLINE_BOX.h]);
    }
    svg.remove();
    return pts;
  })();

  function pixelUnderline(title) {
    const canvas = document.createElement("canvas");
    canvas.className = "scribble-underline";
    canvas.setAttribute("aria-hidden", "true");
    title.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    let progress = 0;

    function draw() {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width / PIXEL));
      const h = Math.max(1, Math.round(rect.height / PIXEL));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.clearRect(0, 0, w, h);
      const count = Math.floor(underlinePoints.length * progress);
      for (const [color, off] of [["#0A0C1C", 1], ["#F9E9A3", 0]]) {
        ctx.fillStyle = color;
        for (let i = 0; i < count; i++) {
          const x = Math.round(underlinePoints[i][0] * (w - 2));
          const y = Math.round(underlinePoints[i][1] * (h - 2));
          ctx.fillRect(x + off, y + off, 2, 2);
        }
      }
    }

    title._reveal = () => {
      if (reduceMotion) {
        progress = 1;
        draw();
        return;
      }
      const start = performance.now() + 200;
      const duration = 900;
      const tick = (now) => {
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        progress = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        draw();
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    window.addEventListener("resize", () => progress > 0 && draw());
    document.fonts?.ready.then(() => progress > 0 && draw());
  }

  document.querySelectorAll(".scribble-title").forEach(pixelUnderline);

  document.querySelectorAll(".nav-link").forEach((el) => {
    el.appendChild(
      scribbleSvg("scribble-circle", "0 0 120 50", "M 18 10 C 45 0, 100 2, 114 20 C 124 38, 80 49, 50 47 C 18 45, 2 34, 6 22 C 9 12, 30 5, 62 4")
    );
  });

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll(".reveal, .scribble-title");
  (window.siteReady || Promise.resolve()).then(startReveals);

  function startReveals() {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => {
        el.classList.add("is-visible");
        el._reveal?.();
      });
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          entry.target._reveal?.();
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${(i % 4) * 70}ms`);
      io.observe(el);
    });
  }

  // ---------- Header state + active tab ----------
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const sections = navLinks.map((a) => document.getElementById(a.dataset.section)).filter(Boolean);

  function setActive(id) {
    navLinks.forEach((a) => {
      const on = a.dataset.section === id;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function updateActive() {
    if (!onHome) {
      const page = location.pathname.split("/").pop().replace(".html", "");
      setActive(["steam", "kickstarter", "support", "socials"].includes(page) ? page : "home");
      return;
    }
    const probe = window.innerHeight * 0.35;
    let current = sections[0]?.id;
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= probe) current = s.id;
    }
    if (sections.length && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = sections[sections.length - 1].id;
    }
    setActive("home");
  }
  window.addEventListener("scroll", updateActive, { passive: true });
  window.addEventListener("resize", updateActive);
  updateActive();

  // ---------- Mobile menu ----------
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  function setMenu(open) {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  toggle.addEventListener("click", () => setMenu(!header.classList.contains("nav-open")));
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });
  // Clear the open drawer when resizing between the full and compact header.
  window.matchMedia("(max-width: 1280px)").addEventListener("change", () => setMenu(false));

  // ---------- External links from config ----------
  const links = { steam: cfg.steamUrl, kickstarter: cfg.kickstarterUrl };
  document.querySelectorAll("[data-link]").forEach((a) => {
    const url = links[a.dataset.link];
    if (url) {
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
    } else {
      a.href = `${a.dataset.link}.html`;
      a.removeAttribute("target");
      a.removeAttribute("rel");
    }
  });
  document.querySelectorAll("[data-when-missing]").forEach((el) => {
    el.hidden = Boolean(links[el.dataset.whenMissing]);
  });

  // ---------- Email ----------
  const contact = cfg.contact || {};
  const email = contact.email || "";
  document.querySelectorAll("[data-email]").forEach((a) => {
    a.href = `mailto:${email}`;
    a.textContent = email;
  });

  // ---------- Contact form ----------
  // Sent as FormData (not JSON) so the browser skips the CORS preflight, which
  // Web3Forms' Cloudflare front sometimes challenges.
  function sendMessage({ name, from, topic, message }) {
    if (!contact.web3formsKey) return Promise.reject(new Error("the contact form isn't set up yet"));
    const body = new FormData();
    const fields = {
      access_key: contact.web3formsKey,
      subject: `[Vex & Shell] ${topic} - ${name}`,
      from_name: "Vex & Shell website",
      name,
      email: from,
      topic,
      message,
    };
    for (const [key, value] of Object.entries(fields)) body.append(key, value);
    return fetch("https://api.web3forms.com/submit", { method: "POST", headers: { Accept: "application/json" }, body }).then(
      async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) throw new Error(data.message || `request failed (${res.status})`);
        return data;
      }
    );
  }

  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  const submitBtn = form?.querySelector("button[type=submit]");
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setNote(text, state) {
    note.textContent = text;
    note.dataset.state = state || "";
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const from = String(data.get("email") || "").trim();
    const topic = String(data.get("topic") || "").trim();
    const message = String(data.get("message") || "").trim();

    const invalid = { name: !name, email: !EMAIL_RE.test(from), message: !message };
    form.querySelectorAll("[required]").forEach((field) => field.classList.toggle("is-invalid", invalid[field.name]));
    if (invalid.name || invalid.email || invalid.message) {
      setNote("Please fill in your name, a valid email and a message.", "error");
      form.querySelector(".is-invalid")?.focus();
      return;
    }

    // Honeypot: real visitors never see this field.
    if (data.get("website")) {
      form.reset();
      setNote("Thanks! Your message has been sent.", "success");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    setNote("", "");

    sendMessage({ name, from, topic, message })
      .then(() => {
        form.reset();
        setNote("Thanks! Your message has been sent - we'll get back to you soon.", "success");
      })
      .catch((err) => {
        const mailto = `mailto:${email}?subject=${encodeURIComponent(`[Vex & Shell] ${topic} - ${name}`)}&body=${encodeURIComponent(message)}`;
        note.dataset.state = "error";
        note.replaceChildren(
          `Couldn't send your message (${err.message}). You can `,
          Object.assign(document.createElement("a"), { href: mailto, textContent: "email us directly" }),
          " instead."
        );
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send message";
      });
  });

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
