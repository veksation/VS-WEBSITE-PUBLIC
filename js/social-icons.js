// Unmodified platform artwork from official brand resource pages.
(() => {
  const assets = { Discord: "discord.svg", YouTube: "youtube.png", Instagram: "instagram.png", X: "x.png", TikTok: "tiktok.png" };
  window.VS_ICONS = Object.fromEntries(Object.entries(assets).map(([name, file]) =>
    [name, `<img class="platform-logo" src="assets/Socials/${file}" alt="" aria-hidden="true" decoding="async" />`]));
})();
