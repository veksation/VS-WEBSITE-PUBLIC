(() => {
  const content = window.VS_SHOWCASE || {};
  const audio = document.getElementById("music-audio");
  function element(tag, className, text) {
    const el = document.createElement(tag); el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  const tracks = content.tracks || [];
  const play = document.getElementById("music-play");
  const restart = document.getElementById("music-restart");
  const jukebox = document.getElementById("jukebox");
  const progress = document.getElementById("music-progress");
  const status = document.getElementById("music-status");
  const trackButtons = [];
  let selected = 0, playRequest = 0;
  // Vorbis can report a few milliseconds below the nominal clip length.
  const format = (seconds) => `0:${String(Math.floor((seconds || 0) + 0.01)).padStart(2, "0")}`;
  const limit = () => Math.min(30, tracks[selected]?.seconds || 30, Number.isFinite(audio.duration) ? audio.duration : 30);
  function updateProgress() {
    progress.max = limit();
    progress.value = audio.currentTime;
    document.getElementById("music-time").textContent = `${format(audio.currentTime)} / ${format(limit())}`;
  }
  function updatePlayback() {
    const playing = !audio.paused && !audio.ended;
    play.textContent = playing ? "Pause preview Ⅱ" : audio.ended ? "Replay preview ▷" : "Play preview ▷";
    play.setAttribute("aria-pressed", String(playing));
    jukebox.classList.toggle("is-playing", playing);
  }
  function selectTrack(index) {
    playRequest++;
    audio.pause();
    selected = index;
    const track = tracks[index];
    audio.src = track.src;
    document.getElementById("music-track-title").textContent = track.title;
    trackButtons.forEach((btn, i) => btn.setAttribute("aria-pressed", String(i === index)));
    status.textContent = "";
    updateProgress();
    updatePlayback();
  }
  tracks.forEach((track, index) => {
    const btn = element("button", "jukebox__track", track.title);
    btn.type = "button";
    btn.addEventListener("click", () => selectTrack(index));
    trackButtons.push(btn);
    document.getElementById("music-tracks").append(btn);
  });
  play.addEventListener("click", async () => {
    if (!audio.paused) { playRequest++; audio.pause(); return; }
    const request = ++playRequest;
    if (audio.ended || audio.currentTime >= limit()) audio.currentTime = 0;
    status.textContent = "";
    try {
      await audio.play();
      if (request !== playRequest) return;
      updatePlayback();
    } catch (error) {
      if (request === playRequest && error.name !== "AbortError") {
        status.textContent = "Couldn't play this preview. Please try again.";
      }
    }
  });
  restart.addEventListener("click", () => {
    playRequest++;
    audio.pause();
    audio.currentTime = 0;
    status.textContent = "";
    updateProgress();
    updatePlayback();
  });
  audio.volume = 0.6;
  document.getElementById("music-volume").addEventListener("input", (event) => { audio.volume = Number(event.target.value); });
  ["play", "pause", "ended"].forEach((event) => audio.addEventListener(event, updatePlayback));
  audio.addEventListener("loadedmetadata", updateProgress);
  audio.addEventListener("timeupdate", () => {
    if (audio.currentTime >= limit() && !audio.paused) audio.pause();
    updateProgress();
  });
  audio.addEventListener("ended", () => { status.textContent = "That's your sneak peek! Thanks for listening."; });
  audio.addEventListener("error", () => { status.textContent = "This preview isn't available right now. Please try again later."; });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { playRequest++; audio.pause(); } });
  if (tracks.length) selectTrack(0);
  else { play.disabled = true; restart.disabled = true; status.textContent = "Music previews coming soon."; }
})();
