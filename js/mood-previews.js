// Enemy mood previews on the dedicated combat page.
(() => {
  const cryAudio = new Audio();
  cryAudio.volume = .65;
  cryAudio.preload = "none";
  let activeCry, cryRequest = 0;
  function stopCry() {
    cryRequest++;
    cryAudio.pause();
    cryAudio.currentTime = 0;
    if (activeCry) {
      activeCry.button.textContent = "Hear cry ▷";
      activeCry.button.setAttribute("aria-pressed", "false");
      activeCry.status.textContent = "";
    }
    activeCry = null;
  }
  cryAudio.addEventListener("ended", stopCry);
  cryAudio.addEventListener("error", () => {
    const current = activeCry;
    stopCry();
    if (current) current.status.textContent = "Couldn't play this cry. Please try again.";
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopCry(); });
  window.addEventListener("pagehide", stopCry);
  function element(tag, className, text) {
    const el = document.createElement(tag);
    el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function create(enemy, { compact = false, headingLevel = compact ? "h3" : "h2" } = {}) {
    const card = element("article", `enemy-card sketch${compact ? " enemy-card--compact" : ""}`);
    card.dataset.enemy = enemy.id;
    card.style.setProperty("--enemy-color", enemy.color);
    const title = element(headingLevel, "enemy-card__title", enemy.name);
    const description = element("p", "enemy-card__description", enemy.description);
    const stage = element("button", "enemy-card__stage");
    stage.type = "button";
    const image = element("img", "sprite enemy-card__sprite");
    image.width = 640;
    image.height = 640;
    image.loading = "eager";
    stage.append(image);
    const moodLabel = element("p", "enemy-card__mood");
    moodLabel.setAttribute("aria-live", "polite");
    const controls = element("div", "enemy-card__moods");
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", `${enemy.name} moods`);
    const hint = element("p", "enemy-card__hint");
    const status = element("p", "enemy-card__status");
    status.setAttribute("role", "status");
    const cryButton = element("button", "btn btn--ghost enemy-card__cry", "Hear cry ▷");
    cryButton.type = "button";
    cryButton.setAttribute("aria-label", `Hear ${enemy.name}'s cry`);
    cryButton.setAttribute("aria-pressed", "false");
    const cryStatus = element("p", "enemy-card__cry-status");
    cryStatus.setAttribute("role", "status");
    const cry = { button: cryButton, status: cryStatus };
    async function playCry() {
      if (!enemy.cry) return;
      if (activeCry === cry) { stopCry(); return; }
      stopCry();
      const token = cryRequest;
      activeCry = cry;
      cryAudio.src = enemy.cry;
      cryButton.textContent = "Stop cry Ⅱ";
      cryButton.setAttribute("aria-pressed", "true");
      try { await cryAudio.play(); }
      catch (error) {
        if (token !== cryRequest || error.name === "AbortError") return;
        stopCry(); cryStatus.textContent = "Couldn't play this cry. Please try again.";
      }
    }
    cryButton.addEventListener("click", playCry);
    let current, timer, pendingLoad, request = 0, playing = false;
    const buttons = [];
    function cancelAction() {
      request++;
      clearTimeout(timer);
      if (pendingLoad) image.removeEventListener("load", pendingLoad);
      pendingLoad = null;
      playing = false;
      stage.removeAttribute("aria-busy");
    }
    function selectMood(mood) {
      cancelAction();
      current = mood;
      image.src = mood.sprite;
      image.alt = enemy.moods.length > 1 ? `${enemy.name}, ${mood.label} battle sprite` : `${enemy.name} battle sprite`;
      moodLabel.textContent = mood.label;
      buttons.forEach(({ button, value }) => button.setAttribute("aria-pressed", String(value.id === mood.id)));
      stage.disabled = !mood.action && !enemy.cry;
      stage.setAttribute("aria-label", `Hear ${enemy.name}'s cry`);
      hint.textContent = enemy.cry ? `Click ${enemy.name} to hear its cry.` : "Select a mood to compare appearances.";
      status.textContent = "";
    }
    (enemy.moods || []).forEach((mood) => {
      const button = element("button", "btn btn--outline", mood.label);
      button.type = "button";
      button.addEventListener("click", () => selectMood(mood));
      controls.append(button);
      buttons.push({ button, value: mood });
    });
    function finishAction(token) {
      if (token !== request) return;
      selectMood(current);
    }
    stage.addEventListener("click", () => {
      playCry();
      if (!current?.action || playing) return;
      cancelAction();
      const token = request;
      playing = true;
      stage.disabled = true;
      stage.setAttribute("aria-busy", "true");
      image.alt = `${enemy.name}, ${current.label} battle sprite`;
      pendingLoad = () => {
        pendingLoad = null;
        if (token !== request) return;
        // The file itself is encoded to play once. Restore idle after its cycle.
        timer = setTimeout(() => finishAction(token), current.action.durationMs);
      };
      image.addEventListener("load", pendingLoad, { once: true });
      // A fresh URL also restarts a previously cached one-shot animation.
      image.src = `${current.action.sprite}?play=${Date.now()}-${token}`;
    });
    image.addEventListener("error", () => {
      if (playing) {
        const idle = current;
        selectMood(idle);
        status.textContent = "Couldn't load that animation. Try again.";
      } else status.textContent = "This sprite couldn't load. Please refresh the page.";
    });
    document.addEventListener("visibilitychange", () => { if (document.hidden && playing) selectMood(current); });
    if (compact) card.append(title, stage, moodLabel, controls, hint, status);
    else card.append(stage, title, description, moodLabel, controls, hint, status);
    moodLabel.hidden = controls.hidden = enemy.moods.length < 2;
    if (enemy.cry) card.append(cryButton, cryStatus);
    selectMood(enemy.moods.find((mood) => mood.id === enemy.initialMood) || enemy.moods[0]);
    return card;
  }
  window.VS_MOODS = { create };
})();
