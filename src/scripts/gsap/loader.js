import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);

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

// Wait for fonts to load before doing anything with SplitText
document.fonts.ready.then(() => {
    split = new SplitText('.reveal-title', {
        type: "chars"
    });
});

// -----------------------------------------------------------------------------
// GSAP Animation Sequence
// -----------------------------------------------------------------------------
function animateCurtainReveal() {
  tl.clear();
    
    // Debug log
    console.log("Starting animation sequence");
    
    tl.to('.loading-bar-container', {
        width: "100vw",  
        duration: 1,
        ease: "expo.inOut",
        left: "0"  
    });

    tl.to(['.reveal-top', '.reveal-bottom'], {  
        duration: 0.5,
        scaleY: 1,
        ease: "expo.inOut"
    });

    // First make the title element visible
    tl.to('.reveal-title', {
        opacity: 1,
        duration: 0.1
    });

   // Set initial state for chars
    gsap.set(split.chars, { opacity: 0 });

    // Animate chars in sequence
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

    tl.set('.loader', { 
        display: 'none',
        onComplete: () => {
            document.body.classList.remove('is-loading');
        }
    });

    tl.to(['.reveal-top', '.reveal-bottom'], {
        duration: 0.8,
        scaleY: 0,
        ease: "expo.inOut",
        onComplete: () => {
            document.querySelector('.reveal').remove();
        }
    });
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

    const trackProgress = setInterval(() => {
        const currentProgress = getProgress();

        // Update the tween's target value
        progressTween.vars.scaleX = currentProgress / 100;
        progressTween.invalidate().restart(); // Refresh and replay the tween

        if (currentProgress === 100) {
            clearInterval(trackProgress);
            setSeamAfterLayout();
            animateCurtainReveal(); // Run the animation sequence
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