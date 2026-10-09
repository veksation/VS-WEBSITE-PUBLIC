// Main-world, battle, and an unrevealed appearance.
(() => {
  const content = window.VS_SHOWCASE;
  document.querySelectorAll("[data-art-description]").forEach((node) => { node.textContent = content.artStyle.description; });
  function card(enemy, titleTag = "h2") {
    const article = document.createElement("article"); article.className = "style-comparison panel sketch";
    article.style.setProperty("--enemy-color", enemy.color);
    const title = document.createElement(titleTag); title.textContent = enemy.name;
    const pair = document.createElement("div"); pair.className = "style-comparison__pair";
    const initial = enemy.moods.find((mood) => mood.id === enemy.initialMood) || enemy.moods[0];
    for (const [label, src, hidden] of [["In the main world", enemy.mainWorldSprite], ["In battle", initial.sprite], ["Unrevealed", enemy.unrevealedSprite, true]]) {
      const figure = document.createElement("figure"), image = document.createElement("img"), caption = document.createElement("figcaption");
      image.className = "sprite"; image.src = src; image.alt = hidden ? "" : `${enemy.name}: ${label.toLowerCase()} sprite`; image.width = image.height = 320; image.loading = "lazy";
      if (hidden) {
        const concealed = document.createElement("div"); concealed.className = "style-concealed";
        concealed.setAttribute("role", "img"); concealed.setAttribute("aria-label", `${enemy.name}'s unrevealed appearance`);
        const mark = document.createElement("span"); mark.textContent = "?"; mark.setAttribute("aria-hidden", "true");
        concealed.append(image, mark); figure.append(concealed);
      } else figure.append(image);
      caption.textContent = label; figure.append(caption); pair.append(figure);
    }
    article.append(title, pair); return article;
  }
  const roster = document.getElementById("style-roster");
  if (roster) content.enemies.forEach((enemy) => roster.append(card(enemy)));
})();
