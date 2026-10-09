// A static hierarchy; only the founder's identity is revealed here.
(() => {
  const roster = document.getElementById("hatter-roster");
  const hatters = [...window.VS_SHOWCASE.bbi.hatters].sort((a, b) => a.rank - b.rank);
  hatters.forEach((entry, index) => {
    const slot = document.createElement("li"); slot.className = "hatter-pyramid__slot";
    const card = document.createElement("article"); card.className = "bbi-shadow sketch";
    const image = document.createElement("img"); image.className = "sprite bbi-shadow__sprite";
    image.src = entry.sprite; image.alt = index === 0 ? "William Business's silhouette" : "An unidentified Hatter's silhouette";
    image.width = image.height = 320; image.loading = "lazy";
    card.append(image);
    if (index === 0) {
      const name = document.createElement("h2"); name.textContent = "William Business"; card.append(name);
    }
    slot.append(card); roster.append(slot);
  });
})();
