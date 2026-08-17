import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createAmbientLifecycle } from './ambient.js';

gsap.registerPlugin(ScrollTrigger);


function lockCentering() {
  gsap.set('.parallax-planet, .parallax-meteorite', { xPercent: -50, yPercent: -50, x: 0, y: 0 });
}

// Index reads 0,81 at pin start and counts up to 1,00 by pin end — throttled
// to ~500ms so it ticks like a terminal readout instead of a smooth blur,
// but the start/end values always snap exactly regardless of scroll speed.
const INDEX_START = 0.81;
const INDEX_END = 1;
let lastIndexUpdate = 0;

function updateIndexReadout(progress) {
  const isBoundary = progress === 0 || progress === 1;
  const now = Date.now();
  if (!isBoundary && now - lastIndexUpdate < 500) return;
  lastIndexUpdate = now;

  const el = document.querySelector('.parallax-index .rust');
  if (!el) return;
  const value = INDEX_START + progress * (INDEX_END - INDEX_START);
  el.textContent = value.toFixed(2).replace('.', ',');
}

function buildPinTimeline() {
lockCentering();

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.parallax',
      start: 'top top',
      // explicit px instead of '+=150%' — sidesteps whatever is making GSAP
      // infer the wrong axis from the percentage
      end: () => '+=' + document.querySelector('.parallax').offsetHeight * 1.5,
      pin: true,
      scrub: true, // ScrollSmoother already smooths the input — a second scrub lag on top overshoots
      onUpdate: (self) => updateIndexReadout(self.progress)
    },
    defaults: { ease: 'none' }
  });

  tl.to('.parallax-meteorite-1', { y: -60 }, 0)
    .to('.parallax-meteorite-2', { y: 40 }, 0)
    .to('.parallax-meteorite-3', { y: '-=60', x: '+=15' }, 0)
    .to('.parallax-meteorite-4', { y: -25 }, 0)
    .to('.parallax-planet', { y: -10 }, 0)


  return tl;
}

export function initParallaxPin() {
  if (!document.querySelector('.parallax')) return;

  if (document.body.classList.contains('is-loading')) {
    document.addEventListener('loader:complete', buildPinTimeline, { once: true });
  } else {
    buildPinTimeline();
  }

  // Re-measure once after the reveal, when layout is final.
  document.addEventListener('loader:complete', () => ScrollTrigger.refresh(), { once: true });
}

// gsap.utils.random(-N, N) alone can draw a value near zero — guarantee a
// minimum sweep magnitude instead, only the direction/exact value is random.
function randomSweep(min, max) {
  const magnitude = gsap.utils.random(min, max);
  return Math.random() < 0.5 ? -magnitude : magnitude;
}

// Each line sweeps its own axis in vh/vw, like a scanner beam — horizontal
// lines scan up/down, the diagonal scans left/right.
function buildLinesAmbientTimeline() {
  const tl = gsap.timeline();

  // wide, overlapping ranges so h1/h2 cross paths rather than staying in their own half
  tl.to('.parallax-line--h1', {
    y: randomSweep(35, 55) + 'vh',
    duration: gsap.utils.random(3, 5),
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  }, 0)
    .to('.parallax-line--h2', {
      y: randomSweep(35, 55) + 'vh',
      duration: gsap.utils.random(3, 5),
      delay: gsap.utils.random(0, 2),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    }, 0);

  ['.parallax-line--diagonal', '.parallax-line--diagonal-2', '.parallax-line--diagonal-3'].forEach((selector) => {
    tl.to(selector, {
      x: randomSweep(45, 70) + 'vw',
      duration: gsap.utils.random(4, 7),
      delay: gsap.utils.random(0, 2),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    }, 0);
  });

  // v1/v2 are desktop-only (hidden on mobile in parallax.scss) — don't bother tweening them there
  if (!isMobileLineLayout()) {
    ['.parallax-line--v1', '.parallax-line--v2'].forEach((selector) => {
      tl.to(selector, {
        x: randomSweep(35, 55) + 'vw',
        duration: gsap.utils.random(3, 5),
        delay: gsap.utils.random(0, 2),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      }, 0);
    });
  }

  // Meteorites tumble gently on their own instead of holding a fixed angle
  ['.parallax-meteorite-1', '.parallax-meteorite-2', '.parallax-meteorite-3', '.parallax-meteorite-4'].forEach((selector) => {
    tl.to(selector, {
      rotation: randomSweep(6, 40),
      duration: gsap.utils.random(4, 7),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    }, 0);
  });

  return tl;
}

// Kept independent of the lines/meteorite ambient timeline so it can keep
// running under prefers-reduced-motion — a terminal cursor blink reads as a
// UI indicator, not decorative motion.
function buildErrorBlinkTimeline() {
  const tl = gsap.timeline();

  // Terminal-style cursor blink — hard cut, not a fade, half a second each way
  tl.to('.parallax-error .gold', {
    opacity: 0,
    duration: 0,
    repeat: -1,
    repeatDelay: 0.5,
    yoyo: true
  }, 0);

  return tl;
}

// Mirrors the mobile media query in parallax.scss that hides .parallax-line--v1/--v2.
function isMobileLineLayout() {
  return window.matchMedia('(orientation: portrait), (max-aspect-ratio: 1/1), (max-aspect-ratio: 12/10)').matches;
}

export function initParallaxAmbientLines() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.querySelector('.parallax')) return;

  // Buffered on both ends by ~a fifth of a viewport so the lines are already
  // moving before the section is visible, and don't visibly freeze right as it leaves.
  const start = () => createAmbientLifecycle({
    trigger: '.parallax',
    start: 'top bottom+=20%',
    end: 'bottom+=100% top-=20%',
    buildTimeline: buildLinesAmbientTimeline
  });

  if (document.body.classList.contains('is-loading')) {
    document.addEventListener('loader:complete', start, { once: true });
  } else {
    start();
  }
}

// Not gated by prefers-reduced-motion — see buildErrorBlinkTimeline.
export function initErrorBlink() {
  if (!document.querySelector('.parallax')) return;

  const start = () => createAmbientLifecycle({
    trigger: '.parallax',
    start: 'top bottom+=20%',
    end: 'bottom+=100% top-=20%',
    buildTimeline: buildErrorBlinkTimeline
  });

  if (document.body.classList.contains('is-loading')) {
    document.addEventListener('loader:complete', start, { once: true });
  } else {
    start();
  }
}

// Randomize whether each line sits in front of or behind each meteorite,
// for a layered depth feel instead of lines always being flat underneath.
export function initParallaxDepthLayering() {
  if (!document.querySelector('.parallax')) return;

  const elements = gsap.utils.shuffle(gsap.utils.toArray('.parallax-line, .parallax-meteorite'));
  elements.forEach((el, i) => {
    el.style.zIndex = i + 1;
  });
}
