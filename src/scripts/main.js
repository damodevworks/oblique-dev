import '../styles/main.scss';
import { gsap } from 'gsap';
import { bootLoader } from './utils/loader';
import { initHeaderAnimations } from './gsap/header.js';
import { initFractureGlitch } from './gsap/fracture.js';
import { initHeroTextGlitch } from './gsap/hero-text-glitch.js';
import { initCustomCursor } from './gsap/cursor.js';
import { smoothInit } from './gsap/smooth-scroll.js';
import { initParallaxPin, initParallaxAmbientLines, initParallaxDepthLayering, initErrorBlink } from './gsap/parallax.js';
import { initVideoSectionPin, initVideoPlayback } from './gsap/video-section.js';
import { initArchiveAnimation, initArchiveCarousel } from './gsap/archive.js';
import { initArchiveDetail } from './gsap/archive-detail.js';

// Chrome keeps re-restoring the old scroll position as images load in — on a
// long page a single reset can lose that race, so keep forcing it back to 0
// for as long as the loader is up, not just once.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
const forceScrollTop = () => window.scrollTo(0, 0);
forceScrollTop();
window.addEventListener('load', forceScrollTop);
window.addEventListener('pageshow', forceScrollTop);
const scrollLockInterval = setInterval(forceScrollTop, 100);
document.addEventListener('loader:complete', () => clearInterval(scrollLockInterval), { once: true });

// Mark styles ready (FOUC prevention)
document.documentElement.classList.add('styles-ready');
initCustomCursor();
bootLoader();

// Header Hero Animation
smoothInit();
initHeaderAnimations();
initFractureGlitch();
initHeroTextGlitch();
initParallaxPin();
initParallaxAmbientLines();
initParallaxDepthLayering();
initErrorBlink();
initVideoSectionPin();
initVideoPlayback();

// Archive animation
initArchiveAnimation();
initArchiveCarousel();
initArchiveDetail();

// TEMP debug overlay — remove after diagnosing the mobile pin issue.
(function initDebugOverlay() {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;top:0;left:0;z-index:999999;background:rgba(0,0,0,0.85);color:#0f0;font:11px monospace;padding:4px 6px;pointer-events:none;white-space:pre;';
  document.body.appendChild(el);
  let resizes = 0;
  window.addEventListener('resize', () => { resizes++; });
  function tick() {
    const p = document.querySelector('.parallax');
    const top = p ? Math.round(p.getBoundingClientRect().top) : 'n/a';
    el.textContent = `h:${window.innerHeight} y:${Math.round(window.scrollY)} pTop:${top} rz:${resizes}`;
    requestAnimationFrame(tick);
  }
  tick();
})();

// force a full reload on any change instead of letting Vite hot-swap GSAP/ScrollTrigger in place
if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}