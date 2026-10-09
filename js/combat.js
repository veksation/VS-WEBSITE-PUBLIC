(() => {
  const content = window.VS_SHOWCASE;
  document.getElementById("combat-intro").textContent = content.combat.description;
  document.getElementById("combat-moods-description").textContent = content.combat.moodsDescription;
  content.enemies.forEach((enemy) => document.getElementById("enemy-roster").append(window.VS_MOODS.create(enemy, { headingLevel: "h3" })));
  const teaser = window.VS_CONFIG.teasers[1];
  const video = document.getElementById("combat-video");
  const button = document.createElement("button"); button.type = "button"; button.className = "slide__facade";
  button.setAttribute("aria-label", `Play ${teaser.title}`);
  const image = document.createElement("img"); image.src = `https://i.ytimg.com/vi/${teaser.id}/hqdefault.jpg`; image.alt = "Combat Teaser II";
  const play = document.createElement("span"); play.className = "slide__play"; play.textContent = "▶";
  button.append(image, play); video.append(button);
  const fallback = document.createElement("p"); fallback.className = "video-fallback";
  const link = document.createElement("a"); link.href = `https://www.youtube.com/watch?v=${teaser.id}`;
  link.target = "_blank"; link.rel = "noopener"; link.textContent = "Watch on YouTube ↗";
  fallback.append(link); video.after(fallback);
  button.addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${teaser.id}?autoplay=1&rel=0&controls=1&playsinline=1`;
    frame.title = teaser.title; frame.allow = "autoplay; encrypted-media; picture-in-picture";
    frame.referrerPolicy = "strict-origin-when-cross-origin"; frame.allowFullscreen = true;
    video.replaceChildren(frame);
  });
})();
