// ********** IMPORTS ********* //
import '../styles/main.scss';
import { gsap } from 'gsap';
import { bootLoader } from './utils/loader';
import { initHeaderAnimations } from './gsap/header.js';
import { initCustomCursor } from './gsap/cursor.js';
import { smoothInit } from './gsap/smooth-scroll.js';


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