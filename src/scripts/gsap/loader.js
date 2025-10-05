import { gsap } from 'gsap';

//GSAP timeline used for reveal
let tl = gsap.timeline();


// Loading bar parameters
const barInterval = 300; // Update progress every 300ms
const animationDuration = 0.3;

let progressTween; // Store a single tween instance

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
        }
    }, barInterval);
}

// Measuring the middle of the loading bar
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

export function bootAnimation(stage) {
    updateBar(stage);
};