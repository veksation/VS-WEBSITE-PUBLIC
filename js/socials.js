(() => {
  const links = window.VS_CONFIG.socials || [];
  const roster = document.getElementById("social-links");
  document.getElementById("socials-pending").hidden = Boolean(links.length);
  links.forEach((social) => {
    const link = document.createElement("a"); link.className = "social-card sketch";
    const icon = document.createElement("span"); icon.className = "social-card__icon"; icon.innerHTML = window.VS_ICONS[social.name];
    const name = document.createElement("span"); name.className = "social-card__name"; name.textContent = social.name;
    const handle = document.createElement("span"); handle.className = "social-card__handle"; handle.textContent = social.handle;
    link.append(icon, name, handle); link.href = social.url; link.target = "_blank"; link.rel = "noopener noreferrer";
    roster.append(link);
  });
  const discord = links.find((link) => /discord/i.test(link.name));
  if (discord) {
    const link = document.getElementById("creator-discord");
    link.href = discord.url; link.target = "_blank"; link.rel = "noopener noreferrer"; link.hidden = false;
    document.getElementById("creator-discord-pending").hidden = true;
  }
})();
