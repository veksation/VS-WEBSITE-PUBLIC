// One header and footer for every page. Edit navigation here once.
(() => {
  const discord = window.VS_CONFIG.socials.find((social) => social.name === "Discord");
  if (discord) document.querySelectorAll("[data-discord]").forEach((link) => { link.href = discord.url; });
  const chevron = '<svg class="btn__chevron" viewBox="0 0 8 10" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M1 0h2v2H1zM3 2h2v2H3zM5 4h2v2H5zM3 6h2v2H3zM1 8h2v2H1z"/></svg>';
  const nav = [
    ["Home", "index.html#home", "home"],
    ["Steam", "steam.html", "steam"], ["Kickstarter", "kickstarter.html", "kickstarter"], ["Contact", "support.html", "support"], ["Socials", "socials.html", "socials"],
  ];
  document.querySelector(".site-header").innerHTML = `<div class="site-header__inner">
    <div class="header-left"><a class="studio-name" href="index.html#home">Sandy Studio</a><a class="brand" href="index.html#home" aria-label="Vex &amp; Shell — home"><img data-site-portrait="vex" src="assets/Sprites/vex_neutral.webp" alt="Vex" width="800" height="480" /></a></div>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu"><span></span><span></span><span></span></button>
    <nav class="site-nav" id="site-nav" aria-label="Main"><ul>${nav.map(([label, href, section]) => `<li><a class="nav-link" href="${href}" data-section="${section}">${label}</a></li>`).join("")}</ul></nav>
    <div class="header-right"><img class="header-shell" data-site-portrait="shell" src="assets/Sprites/shell_neutral.webp" alt="Shell" width="800" height="480" /><a class="btn btn--outline nav-cta" data-link="steam" href="steam.html">Wishlist ${chevron}</a></div>
  </div>`;
  const destinations = [
    ["Home", "index.html#home"], ["Karma", "about.html"], ["Art style", "art-style.html"], ["Co-op", "coop.html"],
    ["Meet (some of) the characters", "characters.html"], ["Dialogue", "dialogue.html"],
    ["Combat & enemies", "combat.html"], ["Hatters", "bbi.html"], ["Composers", "music.html"], ["Jukebox", "jukebox.html"],
    ["Socials", "socials.html"], ["Steam", "steam.html"], ["Kickstarter", "kickstarter.html"], ["Contact", "support.html"],
  ];
  if (!/(?:\/|\/index\.html)$/.test(location.pathname)) {
    const back = document.createElement("div"); back.className = "page-home-return";
    back.innerHTML = '<a class="btn btn--primary" href="index.html#info">‹ Back to home</a>';
    document.getElementById("main-content").append(back);
  }
  document.querySelector(".site-footer").innerHTML = `<div class="footer-walkers" aria-hidden="true">
    <span class="sprite--walker walker--vex"><img class="sprite toy-walker" src="assets/Sprites/vex-toy.webp" alt="" width="160" height="160" loading="lazy" /></span>
    <span class="sprite--walker walker--shell"><img class="sprite toy-walker" src="assets/Sprites/shell-toy.webp" alt="" width="160" height="160" loading="lazy" /></span>
  </div><div class="site-footer__inner"><div class="footer-portraits" aria-label="Vex and Shell"><img class="sprite" data-site-portrait="vex" src="assets/Sprites/vex_neutral.webp" alt="Vex" width="800" height="480" loading="lazy" /><img class="sprite" data-site-portrait="shell" src="assets/Sprites/shell_neutral.webp" alt="Shell" width="800" height="480" loading="lazy" /></div>
    <nav aria-label="Footer">${destinations.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}</nav>
    <p>&copy; <span id="year">2026</span> Sandy Studio LLC. All rights reserved. Vex &amp; Shell is a trademark of Sandy Studio LLC.</p></div>`;
})();
