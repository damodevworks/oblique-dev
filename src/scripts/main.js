// ********** IMPORTS ********* //
import '../styles/main.scss';
import { gsap } from 'gsap';
import { bootLoader } from './utils/loader';

// Mark styles ready (FOUC prevention)
document.documentElement.classList.add('styles-ready');

// ***** LOADER ****** // 
// bootLoader();