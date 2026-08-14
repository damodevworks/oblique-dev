import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);


// -----------------------------------------------------------------------------
// Debounce function for setting the seam correctly 
// -----------------------------------------------------------------------------
function debounce(fn, wait) {
    let timeout;

    const debounced = function(...args) {
        const context = this;
        clearTimeout(timeout);

        timeout = setTimeout(() => fn.apply(context, args), wait); 
    };

    debounced.cancel = function() {
            clearTimeout(timeout)
        };

        return debounced;
};

// -----------------------------------------------------------------------------
// Constants: configuration for the loading bar and its animation timing
// -----------------------------------------------------------------------------
const barInterval = 300; // Update progress every 300ms
const animationDuration = 0.3;

// -----------------------------------------------------------------------------
// GSAP timeline used for reveal (kept for potential timeline sequencing)
// -----------------------------------------------------------------------------
let tl = gsap.timeline();

// -----------------------------------------------------------------------------
// Mutable state: store a single tween instance for the loading bar
// -----------------------------------------------------------------------------
let progressTween; // Store a single tween instance

// -----------------------------------------------------------------------------
// Split the title into individual letters
// -----------------------------------------------------------------------------
let split;

// -----------------------------------------------------------------------------
// Storing the resize listener reference
// -----------------------------------------------------------------------------
let debouncedResizeHandler = null;

// Wait for fonts to load before doing anything with SplitText
async function ensureSplitTextReady() {
    if (!split) {
    await document.fonts?.ready;
    try {
        split = new SplitText('.reveal-title', {type: "chars"});
    } catch (e) {
        return false;
        }
    }
    return true;
}

// -----------------------------------------------------------------------------
// Accessibility helper: detect if user prefers reduced motion
// - returns true when the prefers-reduced-motion media query is set to reduce
// -----------------------------------------------------------------------------
function shouldReduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// -----------------------------------------------------------------------------
// Immediate non-animated reveal for reduced-motion or fallback
// - apply final states immediately: remove loader/reveal DOM, clear loading class
// - ensure header (or other content) is visible without animation
// -----------------------------------------------------------------------------
function instantReveal() {
    // Set final states immediately
    const loaderEl = document.querySelector('.loader');
    if (loaderEl) {
        loaderEl.setAttribute('aria-hidden', 'true');
        loaderEl.inert = true;
        loaderEl.remove();
    }
   const revealEl = document.querySelector('.reveal');
   if(revealEl) {
    revealEl.remove();
   }
    document.body.classList.remove('is-loading');
    gsap.set('header', { 
        visibility: 'visible',
        opacity: 1 
    });
}

// -----------------------------------------------------------------------------
// Main curtain reveal animation sequence
// - orchestrates the reveal timeline and respects the user's motion preference
// - if reduced motion is requested, delegate to instantReveal and exit early
// -----------------------------------------------------------------------------

let isRevealed = false // Variable for idempotence

async function animateCurtainReveal() {

    // Checking if the function has been triggered before
    if (isRevealed) {
        return;
    }

    // Checking for user preference
     if (shouldReduceMotion()) {
        instantReveal();
        return; // Exit early, skip all animations
    }

// -----------------------------------------------------------------------------
// GSAP Animation Sequence
// -----------------------------------------------------------------------------

  isRevealed = true; // Mark it as revealed
  tl.clear();

  // Hide hero-grid immediately so it doesn't flash before the entrance animation
  gsap.set('.hero-grid', { opacity: 0 });

  tl.to('.loading-bar-container', {
        width: '130dvw',
        duration: 1,
        ease: 'expo.inOut'
    });

    tl.to(['.reveal-top', '.reveal-bottom'], {  
        duration: 0.5,
        scaleY: 1,
        ease: "expo.inOut"
    });

    const canSplit = await ensureSplitTextReady(); // See if we can split text

    // Split title if we can!
    if (canSplit) {
    // First make the title element visible
    tl.to('.reveal-title', {
        opacity: 1,
        duration: 0.1
    });
    gsap.set(split.chars, { opacity: 0 });
     tl.to(split.chars, {
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "none"
    });

    tl.to(split.chars, {
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "none"
    });
    } else {
        tl.to('.reveal-title', {
            opacity: 1,
            duration: 0.5,
            ease: "none"
        });
        tl.to('.reveal-title', {
            opacity: 0,
            duration: 0.5,
            ease: "none"
        });
    }

    tl.set('.loader', { 
        display: 'none',
        onComplete: () => {
            const loaderEl = document.querySelector('.loader');
            if (loaderEl) {
                loaderEl.setAttribute('aria-hidden', 'true');
                loaderEl.inert = true;
            }
            document.body.classList.remove('is-loading');
            document.documentElement.classList.remove('is-loading');
        }
    });

    tl.to(['.reveal-top', '.reveal-bottom'], {
        duration: 0.8,
        scaleY: 0,
        ease: "expo.inOut",
        onComplete: () => {
            //  Cancel any pending debounced calls
            if(debouncedResizeHandler?.cancel) {
                debouncedResizeHandler.cancel();
            }
            //  Remove the resize listener
            window.removeEventListener('resize', debouncedResizeHandler);
            debouncedResizeHandler = null;

            // DOM cleanup
            document.querySelector('.reveal').remove();
            document.querySelector('.loader').remove();

            // Inform other modules that the loader has fully finished
            document.dispatchEvent(new CustomEvent('loader:complete'));
        }
    });

    // Header entrance: slides in from y:20 as the curtain folds away.
    tl.fromTo('.hero-grid', {
        y: 20,
        opacity: 0
    },{
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "expo.inOut"
    }, '-=0.3');
}

// -----------------------------------------------------------------------------
// Tween creation / management
// - createProgressTween: create the tween once and keep it paused until used
// - updateBar: poll the provided getProgress function and update the tween
// -----------------------------------------------------------------------------
function createProgressTween() {
    // Create the tween once with initial values
    progressTween = gsap.to('.loading-bar', {
        scaleX: 0,
        duration: animationDuration,
        ease: "power1.inOut",
        paused: true // Create it paused initially
    });
}

function updateBar(getProgress) {
    // Create the tween if it doesn't exist
    if (!progressTween) {
        createProgressTween();
    }

    debouncedResizeHandler = debounce(setSeam, 100);
    window.addEventListener('resize', debouncedResizeHandler);

    const trackProgress = setInterval(() => {
        const currentProgress = getProgress();

        // On the tick this hits 100, this already tweens smoothly to
        // scaleX:1 — no separate "snap to final value" needed.
        progressTween.vars.scaleX = currentProgress / 100;
        progressTween.invalidate().restart(); // Refresh and replay the tween

        if (currentProgress === 100) {
            clearInterval(trackProgress);
            // Let the fill tween finish before the curtain takes over —
            // starting both at once cut the fill short.
            gsap.delayedCall(animationDuration, () => {
                setSeamAfterLayout();
                animateCurtainReveal();
            });
        }
    }, barInterval);
}

// -----------------------------------------------------------------------------
// Seam measurement and layout helpers
// - measureSeam: measure the vertical position (middle) of the loading bar
// - setSeam: write the measured seam into a CSS custom property
// - setSeamAfterLayout: ensure measurement after layout using requestAnimationFrame
// -----------------------------------------------------------------------------
function measureSeam() {
  const barContainer = document.querySelector('.loading-bar-container');
  const rect = barContainer.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  const seamPosition = rect.top + (rect.height / 2);
  const seamDvh = (seamPosition / viewportHeight) * 100;
  
  return seamDvh;  
}

function setSeam() {
  const reveal = document.querySelector('.reveal');
  const seamDvh = measureSeam();
  reveal.style.setProperty('--seamY', `${seamDvh}dvh`);  
}

function setSeamAfterLayout() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setSeam();
      resolve();
    });
  });
}

// -----------------------------------------------------------------------------
// Public API
// - bootAnimation: entry point used by the app to start tracking progress
// -----------------------------------------------------------------------------
export function bootAnimation(stage) {
    updateBar(stage);
};