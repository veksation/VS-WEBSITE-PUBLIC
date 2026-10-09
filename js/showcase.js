(() => {
  const content = window.VS_SHOWCASE || {};
  for (const [id, value] of Object.entries(content.karma || {})) {
    const node = document.getElementById(`karma-${id}`);
    if (node) node.textContent = value;
  }
  const roster = document.getElementById("character-roster");
  const dialog = document.getElementById("character-dialog");
  if (!dialog) return;
  let opener;

  function element(tag, className, text) {
    const el = document.createElement(tag);
    el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function createCharacterCard(entry, prompt = "Read more ↗") {
    const card = element("button", "character-card sketch");
    card.type = "button";
    card.setAttribute("aria-label", `Meet ${entry.name}${entry.role ? `, ${entry.role}` : ""}`);
    card.setAttribute("aria-haspopup", "dialog");
    card.style.setProperty("--character-color", entry.color);
    let artwork;
    if (entry.sprite) {
      artwork = element("img", "sprite character-card__sprite");
      artwork.src = entry.sprite;
      artwork.alt = "";
      artwork.loading = "lazy";
    } else {
      artwork = element("span", "character-card__emblem", entry.emblem || "?");
      artwork.setAttribute("aria-hidden", "true");
    }
    card.append(artwork, element("span", "character-card__name", entry.name),
      element("span", "party-card__role", entry.role || ""), element("span", "character-card__prompt", prompt));
    card.addEventListener("click", () => {
      opener = card;
      dialog.classList.toggle("character-dialog--redacted", Boolean(entry.redacted));
      dialog.style.setProperty("--character-color", entry.color);
      const sprite = document.getElementById("character-sprite");
      const emblem = document.getElementById("character-emblem");
      sprite.hidden = !entry.sprite;
      emblem.hidden = Boolean(entry.sprite);
      if (entry.sprite) { sprite.src = entry.sprite; sprite.alt = entry.name; }
      else { sprite.removeAttribute("src"); emblem.textContent = entry.emblem || "?"; }
      document.getElementById("character-name").textContent = entry.name;
      document.getElementById("character-role").textContent = entry.role || "";
      document.getElementById("character-role").hidden = !entry.role;
      document.getElementById("character-description").textContent = entry.description;
      dialog.showModal();
      document.body.classList.add("character-open");
    });
    return card;
  }
  const mainRoster = document.getElementById("main-character-roster");
  if (roster) (content.characters || []).forEach((entry) => {
    const target = mainRoster && ["vex", "shell"].includes(entry.id) ? mainRoster : roster;
    target.append(createCharacterCard(entry));
  });
  document.getElementById("character-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("character-open");
    opener?.focus({ preventScroll: true });
  });
  const guests = document.getElementById("guest-roster");
  if (guests) (content.guests || []).forEach((entry) => {
    if (!entry.concealed) { guests.append(createCharacterCard(entry, "Meet Riyan ↗")); return; }
    const card = element("article", "character-card sketch guest-card--concealed");
    card.style.setProperty("--character-color", entry.color);
    card.setAttribute("aria-label", "Unrevealed guest party member");
    const sprite = element("img", "sprite character-card__sprite");
    sprite.src = entry.sprite; sprite.alt = "A concealed guest's silhouette"; sprite.loading = "lazy";
    const name = element("span", "character-card__name guest-hidden-name", "????????");
    name.setAttribute("aria-hidden", "true");
    card.append(sprite, name, element("span", "party-card__role", "Guest Party Member"), element("span", "guest-card__secret", "Identity concealed"));
    guests.append(card);
  });

})();
