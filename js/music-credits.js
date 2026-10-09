(() => {
  const music = window.VS_SHOWCASE.music;
  document.getElementById("music-description").textContent = music.description;
  music.composers.forEach((composer) => {
    const card = document.createElement("article"); card.className = "panel sketch composer-card";
    const image = document.createElement("img"); image.className = "composer-card__photo";
    image.src = composer.image; image.alt = `${composer.name}'s profile picture`; image.width = image.height = 160; image.loading = "lazy";
    const name = document.createElement("h3"); name.textContent = composer.name;
    card.append(image, name);
    if (composer.description) { const p = document.createElement("p"); p.textContent = composer.description; card.append(p); }
    if (composer.url) {
      const link = document.createElement("a"); link.className = "composer-card__link";
      link.innerHTML = window.VS_ICONS.YouTube + '<span>YouTube</span>';
      link.setAttribute("aria-label", `Visit ${composer.name} on YouTube`);
      link.href = composer.url; link.target = "_blank"; link.rel = "noopener"; card.append(link);
    }
    document.getElementById("composer-roster").append(card);
  });
})();
