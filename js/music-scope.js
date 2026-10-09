// A small, nearest-neighbour display of the preview's actual audio waveform.
(() => {
  const canvas = document.getElementById("music-scope");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const audio = document.getElementById("music-audio");
  const state = document.getElementById("scope-state");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let audioContext, analyser, samples, frame, lastDraw = 0;
  const width = canvas.width, height = canvas.height;
  ctx.imageSmoothingEnabled = false;

  function prepareAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioContext) {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      samples = new Float32Array(analyser.fftSize);
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    }
    if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  }

  function draw() {
    ctx.fillStyle = "#080e20";
    ctx.fillRect(0, 0, width, height);
    // Sparse grid and ticks are all aligned to the display's native pixels.
    ctx.fillStyle = "#1a2c45";
    for (let x = 20; x < width; x += 20) {
      for (let y = 0; y < height; y += 4) ctx.fillRect(x, y, 1, 1);
    }
    for (let y = 20; y < height; y += 20) {
      for (let x = 0; x < width; x += 4) ctx.fillRect(x, y, 1, 1);
    }
    ctx.fillStyle = "#29455b";
    ctx.fillRect(0, height / 2, width, 1);
    ctx.fillRect(width / 2, 0, 1, height);
    for (let x = 0; x < width; x += 10) ctx.fillRect(x, height / 2 - 2, 1, 5);

    const playing = !audio.paused && !audio.ended;
    if (playing && analyser) analyser.getFloatTimeDomainData(samples);
    // Trigger on a rising zero crossing to steady the trace like a real scope.
    let start = 0;
    if (playing && samples) {
      for (let i = 1; i < 512; i++) {
        if (samples[i - 1] < 0 && samples[i] >= 0) { start = i; break; }
      }
    }
    let peak = 0;
    if (playing && samples) {
      for (let i = start; i < start + width * 4; i++) peak = Math.max(peak, Math.abs(samples[i]));
    }
    const gain = 60 / Math.max(.04, peak);
    let previousY = height / 2;
    for (let x = 0; x < width; x++) {
      const sample = playing && samples ? samples[start + x * 4] : 0;
      const y = Math.round(Math.max(5, Math.min(height - 6, height / 2 - sample * gain)));
      const top = x ? Math.min(y, previousY) : y;
      const length = x ? Math.abs(y - previousY) + 1 : 1;
      ctx.fillStyle = "#184b56";
      ctx.fillRect(x, top - 1, 1, length + 2);
      ctx.fillStyle = playing ? "#a0f3e7" : "#619caf";
      ctx.fillRect(x, top, 1, length);
      previousY = y;
    }
  }
  function tick(now) {
    if (now - lastDraw >= 33) { draw(); lastDraw = now; }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    const playing = !audio.paused && !audio.ended;
    state.textContent = playing ? "Playing" : audio.currentTime ? "Paused" : "Ready";
    state.classList.toggle("is-live", playing);
    draw();
    if (playing && !reducedMotion.matches) frame = requestAnimationFrame(tick);
  }
  // Set up the audio graph within the existing user-initiated play gesture.
  document.getElementById("music-play").addEventListener("click", prepareAudio);
  ["play", "pause", "ended", "emptied"].forEach(event => audio.addEventListener(event, sync));
  reducedMotion.addEventListener("change", sync);
  draw();
})();
