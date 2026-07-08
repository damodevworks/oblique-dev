import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createAmbientLifecycle } from './ambient.js';

gsap.registerPlugin(ScrollTrigger);


function lockCentering() {
  gsap.set('.parallax-planet, .parallax-meteorite', { xPercent: -50, yPercent: -50 });
}

function buildPinTimeline() {
lockCentering();

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.parallax',
      start: 'top top',
      // explicit px instead of '+=150%' — sidesteps whatever is making GSAP
      // infer the wrong axis from the percentage (see parallax-save.md)
      end: () => '+=' + document.querySelector('.parallax').offsetHeight * 1.5,
      pin: true,
      scrub: true, // ScrollSmoother already smooths the input — a second scrub lag on top overshoots
      anticipatePin: 1,
      markers: true // dev only — remove once pin behaviour is confirmed
    },
    defaults: { ease: 'none' }
  });

  tl.to('.parallax-meteorite-1', { y: -60 }, 0)
    .to('.parallax-meteorite-2', { y: 40 }, 0)
    .to('.parallax-meteorite-3', { y: -7, x: 7 }, 0)
    .to('.parallax-meteorite-4', { y: -25 }, 0)
    .to('.parallax-planet', { y: -10 }, 0)
    

  return tl;
}

export function initParallaxPin() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.querySelector('.parallax')) return;

  if (document.body.classList.contains('is-loading')) {
    document.addEventListener('loader:complete', buildPinTimeline, { once: true });
  } else {
    buildPinTimeline();
  }

  // page geometry can still shift after images/fonts finish loading —
  // re-measure the pin boundaries once everything has settled.
  window.addEventListener('load', () => ScrollTrigger.refresh());
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

  return tl;
}

export function initParallaxAmbientLines() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.querySelector('.parallax')) return;

  const start = () => createAmbientLifecycle({
    trigger: '.parallax',
    start: 'top center',
    end: 'bottom+=100% top',
    buildTimeline: buildLinesAmbientTimeline
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
