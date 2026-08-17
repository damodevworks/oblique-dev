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

// force a full reload on any change instead of letting Vite hot-swap GSAP/ScrollTrigger in place
if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}