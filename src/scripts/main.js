// ********** IMPORTS ********* //
import '../styles/main.scss';
import { gsap } from 'gsap';
import { bootLoader } from './utils/loader';
import { initHeaderAnimations } from './gsap/header.js';
import { initCustomCursor } from './gsap/cursor.js';
import { smoothInit } from './gsap/smooth-scroll.js';
import { initParallaxPin, initParallaxAmbientLines, initParallaxDepthLayering } from './gsap/parallax.js';

// Chrome keeps re-restoring the old scroll position as images load in, so keep forcing it back to 0
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
const forceScrollTop = () => window.scrollTo(0, 0);
forceScrollTop();
window.addEventListener('load', forceScrollTop);
window.addEventListener('pageshow', forceScrollTop);

// Mark styles ready (FOUC prevention)
document.documentElement.classList.add('styles-ready');
initCustomCursor();

// ***** LOADER ****** //
// false = dev mode - without loader
const USE_LOADER = false;

if (USE_LOADER) {
  bootLoader();
} else {
  document.body.classList.remove('is-loading');
  document.documentElement.classList.remove('is-loading');
  document.querySelector('.loader')?.remove();
  document.querySelector('.reveal')?.remove();
}

// Header Hero Animation
smoothInit();
initHeaderAnimations();
initParallaxPin();
initParallaxAmbientLines();
initParallaxDepthLayering();

// force a full reload on any change instead of letting Vite hot-swap GSAP/ScrollTrigger in place
if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}