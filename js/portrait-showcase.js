(() => {
  const content = window.VS_SHOWCASE.dialogue;
  document.getElementById("dialogue-description").textContent = content.description;
  const audio = new Audio(); audio.volume = .55; audio.loop = true; audio.preload = "none";
  let active, timer, request = 0;
  function stop() {
    request++; clearTimeout(timer); audio.pause(); audio.currentTime = 0;
    if (active) {
      active.animation.setTalking(false); active.button.textContent = `Hear ${active.name} ▷`;
      active.button.setAttribute("aria-pressed", "false"); active.status.textContent = "";
    }
    active = null;
  }
  audio.addEventListener("error", () => { const previous = active; stop(); if (previous) previous.status.textContent = "Couldn't play this voice. Please try again."; });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  window.addEventListener("pagehide", stop);
  // The portrait gallery and conversation demo take turns using the sound.
  document.addEventListener("vs-dialogue-playing", stop);
  content.portraits.forEach((portrait) => {
    const card = document.createElement("article"); card.className = "portrait-card panel sketch"; card.style.setProperty("--person-color", portrait.color);
    const image = document.createElement("img"); image.className = "sprite"; image.alt = `${portrait.name}'s animated dialogue portrait`; image.src = portrait.base + ".webp";
    const title = document.createElement("h3"); title.textContent = portrait.name;
    const button = document.createElement("button"); button.className = "btn btn--primary"; button.type = "button"; button.textContent = `Hear ${portrait.name} ▷`; button.setAttribute("aria-pressed", "false");
    const status = document.createElement("p"); status.className = "portrait-status"; status.setAttribute("role", "status");
    const entry = { name: portrait.name, animation: window.VS_PORTRAIT.create(image, portrait.base), button, status };
    button.addEventListener("click", async () => {
      if (active === entry) { stop(); return; }
      stop(); document.dispatchEvent(new Event("vs-portrait-playing")); active = entry; const token = request;
      audio.src = portrait.voice; button.textContent = "Stop voice Ⅱ"; button.setAttribute("aria-pressed", "true"); entry.animation.setTalking(true);
      try { await audio.play(); if (token === request) timer = setTimeout(stop, 1800); }
      catch (error) { if (token === request && error.name !== "AbortError") { stop(); status.textContent = "Couldn't play this voice. Please try again."; } }
    });
    card.append(image, title);
    if (portrait.expressions) {
      const label = document.createElement("label"); label.className = "portrait-expression"; label.textContent = "Expression";
      const select = document.createElement("select"); select.setAttribute("aria-label", `${portrait.name}'s expression`);
      portrait.expressions.forEach(([name, suffix]) => {
        const option = document.createElement("option"); option.textContent = name;
        option.value = `assets/Sprites/${portrait.name.toLowerCase()}_${suffix}`; select.append(option);
      });
      select.addEventListener("change", () => entry.animation.setBase(select.value));
      label.append(select); card.append(label);
    }
    card.append(button, status); document.getElementById("portrait-roster").append(card);
  });
})();
