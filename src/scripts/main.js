// ********** IMPORTS ********* //
import '../styles/main.scss';
import { gsap } from 'gsap';
import { bootLoader } from './utils/loader';
import { startHeaderWaves } from './gsap/header.js';

// Mark styles ready (FOUC prevention)
document.documentElement.classList.add('styles-ready');

// ***** LOADER ****** // 
// bootLoader();

// Header Hero Animation
startHeaderWaves();