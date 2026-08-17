import { gsap } from 'gsap';

const BASE_INTERVAL_MS = 2000;
const INTERVAL_JITTER_MS = 400;

// Same tinted-ghost-duplicate technique as the fracture title, just on a
// timer instead of a click. Shared by .pathway and .location, each with
// its own independent timer so they don't pulse in lockstep.
function initGlitchOn(root) {
  const text = root.querySelector('.glitch-text');
  const redGhost = root.querySelector('.glitch-ghost--red');
  const cyanGhost = root.querySelector('.glitch-ghost--cyan');
  if (!text || !redGhost || !cyanGhost) return;

  function glitchPulse() {
    const stepCount = 1 + Math.floor(Math.random() * 3); // 1-3 stutters
    const tl = gsap.timeline();
    let t = 0;

    for (let i = 0; i < stepCount; i++) {
      const mag = 6 + Math.random() * 16; // 6-22px split
      const magY = (Math.random() - 0.5) * 8;
      const skew = (Math.random() - 0.5) * 10;
      const stepDuration = 0.03 + Math.random() * 0.05;

      tl.set(redGhost, { x: -mag, y: magY, skewX: skew, opacity: 0.7 + Math.random() * 0.3 }, t)
        .set(cyanGhost, { x: mag, y: -magY, skewX: -skew, opacity: 0.7 + Math.random() * 0.3 }, t)
        .set(text, { x: (Math.random() - 0.5) * 6 }, t);

      t += stepDuration;
    }

    tl.to([redGhost, cyanGhost], { opacity: 0, x: 0, y: 0, skewX: 0, duration: 0.16, ease: 'power2.out' }, t)
      .to(text, { x: 0, duration: 0.14, ease: 'power2.out' }, t);
  }

  function scheduleNext() {
    const delay = BASE_INTERVAL_MS + (Math.random() - 0.5) * INTERVAL_JITTER_MS;
    setTimeout(() => {
      glitchPulse();
      scheduleNext();
    }, delay);
  }

  scheduleNext();
}

export function initHeroTextGlitch() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.pathway, .location').forEach((root) => initGlitchOn(root));
}
