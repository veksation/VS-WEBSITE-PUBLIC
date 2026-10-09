// Greg delivers the same temporary notice on the two upcoming launch pages.
(() => {
  const dialogue = document.querySelector('.construction-dialogue');
  if (!dialogue) return;
  const text = dialogue.querySelector('.construction-dialogue__text');
  const line = text.textContent;
  const portrait = window.VS_PORTRAIT.create(dialogue.querySelector('img'), 'assets/Sprites/greg_neutral');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let timer, started = false;
  const finish = () => { clearInterval(timer); text.textContent = line; portrait.setTalking(false); };
  function speak() {
    finish();
    if (motion.matches) return;
    let position = 0;
    text.textContent = '';
    portrait.setTalking(true);
    timer = setInterval(() => {
      text.textContent = line.slice(0, ++position);
      if (position === line.length) finish();
    }, 8);
  }
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || started) return;
    started = true;
    observer.disconnect();
    speak();
  });
  observer.observe(dialogue);
  dialogue.setAttribute('role', 'button');
  dialogue.tabIndex = 0;
  dialogue.setAttribute('aria-label', `${dialogue.getAttribute('aria-label')} Press to replay.`);
  dialogue.addEventListener('click', speak);
  dialogue.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); speak(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });
  motion.addEventListener('change', finish);
  window.addEventListener('pagehide', finish);
})();
