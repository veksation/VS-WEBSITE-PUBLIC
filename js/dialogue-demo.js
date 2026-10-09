// Interactive dialogue demo: typewriter text with looping voice SFX and portraits,
// advanced with the Z key (or a click / tap). Timings match the in-game dialogue.
//
// Script markup: [wave]...[/wave] makes letters ride a big sine wave,
// [shake]...[/shake] makes them jitter, and "\n" starts a new line.
(() => {
  const screen = document.getElementById("demo-screen");
  if (!screen) return;

  const portraitEl = document.getElementById("demo-portrait");
  const portraitAnimation = window.VS_PORTRAIT.create(portraitEl, "assets/Sprites/vex_neutral");
  const nameEl = document.getElementById("demo-name");
  const textEl = document.getElementById("demo-text");
  const nextEl = document.getElementById("demo-next");
  const startEl = document.getElementById("demo-start");
  const liveEl = document.getElementById("demo-live");
  const soundBtn = document.getElementById("demo-sound");
  const hintEl = document.getElementById("demo-hint");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SPRITES = "assets/Sprites/";

  const SFX = "assets/SoundEffects/";

  const SPEAKERS = {
    vex: { name: "Vex", voice: `${SFX}vexsfx2NEW.flac`, volume: 0.55 },
    shell: { name: "Shell", voice: `${SFX}shellsfxNEW.flac`, volume: 0.55 },
  };

  const SCRIPT = [
    { who: "vex", face: "vex_kawaii", text: "Woah.\nThis dialogue thing is.. kinda sick." },
    { who: "shell", face: "shell_neutral", text: "It could use some work." },
    { who: "vex", face: "vex_angry", text: "You're so negative, you know that?" },
    { who: "shell", face: "shell_neutral", text: "I'm not negative, Vex. I'm honest." },
    { who: "vex", face: "vex_sad", text: "You really can't say one positive thing?" },
    { who: "shell", face: "shell_neutral", text: "...Fine.\nIt's a decent start, I guess." },
    { who: "vex", face: "vex_slightsmile", text: "See? That wasn't so hard.\nThank you, Shell." },
    { who: "shell", face: "shell_neutral", text: "Whatever." },
    { text: "Press Z to start over" },
  ];

  // Every character (spaces included) takes one tick; punctuation holds for longer.
  // A run like ".." or "?!" only pauses after its last mark.
  const CHAR_DELAY = 33;
  const PAUSES = { ".": 300, "!": 240, "?": 240, ",": 240, "\n": 200 };

  for (const line of SCRIPT) if (line.face) new Image().src = `${SPRITES}${line.face}.webp`;

  // ---------- Parsing ----------
  function parse(text) {
    const out = [];
    let fx = "";
    const re = /\[(\/?)(wave|shake)\]/g;
    let last = 0;
    let m;
    const push = (chunk) => {
      for (const ch of chunk) out.push({ ch, fx });
    };
    while ((m = re.exec(text))) {
      push(text.slice(last, m.index));
      fx = m[1] ? "" : m[2];
      last = re.lastIndex;
    }
    push(text.slice(last));
    return out;
  }

  const plain = (text) => text.replace(/\[\/?(wave|shake)\]/g, "").replace(/\n/g, " ");

  // ---------- Audio ----------
  // Each speaker's voice clip loops gaplessly (AudioBufferSourceNode.loop) while
  // their text is typing, and stops during punctuation pauses and at the end of a line.
  let audio = null;
  let soundOn = true;
  let voice = null;
  const buffers = {};

  function ensureAudio() {
    if (!audio) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audio = new AC();
      for (const [who, speaker] of Object.entries(SPEAKERS)) {
        fetch(speaker.voice)
          .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
          .then((data) => audio.decodeAudioData(data))
          .then((buf) => {
            buffers[who] = buf;
            if (typing && SCRIPT[index].who === who && isTalking) startVoice(who);
          })
          .catch(() => {});
      }
    }
    if (audio.state === "suspended") audio.resume();
  }

  function startVoice(who) {
    if (!soundOn || !audio || !buffers[who] || voice) return;
    const src = audio.createBufferSource();
    const gain = audio.createGain();
    src.buffer = buffers[who];
    src.loop = true;
    const t = audio.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(SPEAKERS[who].volume, t + 0.005);
    src.connect(gain).connect(audio.destination);
    src.start(t);
    voice = { src, gain };
  }

  function stopVoice() {
    if (!voice) return;
    const t = audio.currentTime;
    voice.gain.gain.cancelScheduledValues(t);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, t);
    voice.gain.gain.linearRampToValueAtTime(0, t + 0.02);
    voice.src.stop(t + 0.03);
    voice = null;
  }

  let isTalking = false;
  function setTalking(on) {
    isTalking = on;
    portraitAnimation.setTalking(on);
    portraitEl.classList.toggle("is-talking", on);
    if (on) startVoice(SCRIPT[index].who);
    else stopVoice();
  }

  // ---------- Rendering ----------
  let index = -1;
  let chars = [];
  let revealed = 0;
  let typing = false;
  let typeTimer = null;
  let started = false;

  function build(line) {
    textEl.replaceChildren();
    chars = [];
    let word = null;
    for (const token of parse(line.text)) {
      if (token.ch === "\n") {
        word = null;
        textEl.appendChild(document.createElement("br"));
        chars.push({ el: null, ch: "\n" });
        continue;
      }
      if (token.ch === " ") {
        word = null;
        textEl.appendChild(document.createTextNode(" "));
        chars.push({ el: null, ch: " " });
        continue;
      }
      if (!word) {
        word = document.createElement("span");
        word.className = "demo__word";
        textEl.appendChild(word);
      }
      const span = document.createElement("span");
      span.className = "demo__char" + (token.fx ? ` fx-${token.fx}` : "");
      span.textContent = token.ch;
      word.appendChild(span);
      chars.push({ el: span, ch: token.ch, fx: token.fx, i: chars.length });
    }
  }

  function restartAnimation(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function showLine(i) {
    clearTimeout(typeTimer);
    index = i;
    const line = SCRIPT[i];
    const speaker = SPEAKERS[line.who];
    const isInstruction = !speaker;
    setTalking(false);
    portraitEl.hidden = nameEl.hidden = isInstruction;
    screen.classList.toggle("is-instruction", isInstruction);
    hintEl.innerHTML = `<kbd>Z</kbd> ${isInstruction ? "start over" : "continue"}`;

    if (speaker) {
      portraitAnimation.setBase(`${SPRITES}${line.face}`);
      portraitEl.alt = `${speaker.name} portrait`;
      restartAnimation(portraitEl, "is-popping");
      if (nameEl.textContent !== speaker.name) {
        nameEl.textContent = speaker.name;
        restartAnimation(nameEl, "is-popping");
      }
      nameEl.dataset.who = line.who;
    } else {
      nameEl.textContent = "";
      portraitEl.alt = "";
      delete nameEl.dataset.who;
    }

    liveEl.textContent = speaker ? `${speaker.name}: ${plain(line.text)}` : plain(line.text);
    build(line);
    revealed = 0;
    typing = true;
    screen.classList.remove("is-done");
    stopVoice();
    if (isInstruction) {
      finishLine();
      return;
    }
    setTalking(true);
    nextAt = performance.now();
    typeNext();
  }

  // Characters are scheduled against a running deadline rather than chained
  // timeouts, so timer jitter doesn't slow the 33ms rhythm down.
  let nextAt = 0;
  function typeNext() {
    if (revealed >= chars.length) {
      finishLine();
      return;
    }
    const c = chars[revealed++];
    c.el?.classList.add("is-on");
    const next = chars[revealed];
    const pause = PAUSES[c.ch] && next && !(PAUSES[next.ch] && c.ch !== "\n");
    if (!next) {
      finishLine();
      return;
    }
    setTalking(!pause);
    nextAt += reduceMotion ? 0 : pause ? PAUSES[c.ch] : CHAR_DELAY;
    typeTimer = setTimeout(typeNext, Math.max(0, nextAt - performance.now()));
  }

  function finishLine() {
    clearTimeout(typeTimer);
    for (const c of chars) c.el?.classList.add("is-on");
    revealed = chars.length;
    typing = false;
    setTalking(false);
    screen.classList.add("is-done");
  }

  function advance() {
    document.dispatchEvent(new Event("vs-dialogue-playing"));
    ensureAudio();
    if (!started) {
      started = true;
      startEl.hidden = true;
      showLine(0);
      return;
    }
    if (typing) {
      finishLine();
      return;
    }
    showLine((index + 1) % SCRIPT.length);
  }

  function restart() {
    document.dispatchEvent(new Event("vs-dialogue-playing"));
    ensureAudio();
    started = true;
    startEl.hidden = true;
    showLine(0);
  }

  // ---------- Letter wobble ----------
  let inView = false;
  let rafId = 0;

  function wobble(now) {
    const t = now / 1000;
    const shakeTick = Math.floor(now / 50);
    for (let k = 0; k < chars.length; k++) {
      const c = chars[k];
      if (!c.el || !c.fx) continue;
      let x = 0;
      let y = 0;
      let r = 0;
      if (c.fx === "wave") {
        y = Math.sin(t * 7 + c.i * 0.7) * 5;
        r = Math.sin(t * 7 + c.i * 0.7 + 1) * 6;
      } else if (c.fx === "shake") {
        const seed = Math.sin((shakeTick + c.i * 13.7) * 91.3) * 43758.5453;
        const rand = seed - Math.floor(seed);
        x = (rand - 0.5) * 3.2;
        y = (((rand * 7.1) % 1) - 0.5) * 3.2;
        r = (((rand * 3.3) % 1) - 0.5) * 10;
      }
      c.el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) rotate(${r.toFixed(1)}deg)`;
    }
    rafId = requestAnimationFrame(wobble);
  }

  if (!reduceMotion) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      cancelAnimationFrame(rafId);
      if (inView) rafId = requestAnimationFrame(wobble);
    }).observe(screen);
  }

  // ---------- Controls ----------
  let keyZone = false;
  new IntersectionObserver(([entry]) => (keyZone = entry.intersectionRatio >= 0.5), { threshold: [0, 0.5, 1] }).observe(screen);

  document.addEventListener("keydown", (e) => {
    if (document.getElementById("character-dialog")?.open) return;
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
    const focused = document.activeElement === screen;
    const isZ = e.key === "z" || e.key === "Z";
    const isConfirm = focused && (e.key === "Enter" || e.key === " ");
    if ((isZ && (keyZone || focused)) || isConfirm) {
      e.preventDefault();
      advance();
    }
  });

  screen.addEventListener("click", advance);
  document.getElementById("demo-advance").addEventListener("click", advance);
  document.getElementById("demo-restart").addEventListener("click", restart);

  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    if (soundOn && isTalking) startVoice(SCRIPT[index].who);
    else stopVoice();
    soundBtn.textContent = `Sound: ${soundOn ? "On" : "Off"}`;
    soundBtn.setAttribute("aria-pressed", String(soundOn));
  });
  document.addEventListener("vs-portrait-playing", () => { if (typing) finishLine(); else stopVoice(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { if (typing) finishLine(); else stopVoice(); } });

  nextEl.innerHTML =
    '<svg viewBox="0 0 7 4" shape-rendering="crispEdges"><path fill="currentColor" d="M0 0h7v1H0zM1 1h5v1H1zM2 2h3v1H2zM3 3h1v1H3z"/></svg>';
})();
