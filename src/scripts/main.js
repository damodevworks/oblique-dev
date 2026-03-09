// ********** IMPORTS ********* //
import '../styles/main.scss';
import { gsap } from 'gsap';
import { bootLoader } from './utils/loader';
import { initHeaderAnimations } from './gsap/header.js';
import { initCustomCursor } from './gsap/cursor.js';

// Mark styles ready (FOUC prevention)
document.documentElement.classList.add('styles-ready');
initCustomCursor();

// ***** LOADER ****** // 
// bootLoader();

// Header Hero Animation
initHeaderAnimations();