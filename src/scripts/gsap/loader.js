import { gsap } from 'gsap';

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
        }
    }, barInterval);
}

export function bootAnimation(stage) {
    updateBar(stage);
};