import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);


// Debounces the resize-triggered seam re-measure.
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

const barInterval = 300;
const animationDuration = 0.3;

let tl = gsap.timeline();
let progressTween;
let split;
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

function shouldReduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Non-animated reveal for reduced-motion or fallback: apply final states immediately.
function instantReveal() {
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

let isRevealed = false;

async function animateCurtainReveal() {
    if (isRevealed) return;

     if (shouldReduceMotion()) {
        instantReveal();
        return;
    }

  isRevealed = true;
  tl.clear();

  // Hide hero-grid immediately so it doesn't flash before the entrance animation
  gsap.set('.hero-grid', { opacity: 0 });

  tl.to('.loading-bar-container', {
        width: '100dvw',
        duration: 1,
        ease: 'expo.inOut'
    });

    tl.to(['.reveal-top', '.reveal-bottom'], {  
        duration: 0.5,
        scaleY: 1,
        ease: "expo.inOut"
    });

    const canSplit = await ensureSplitTextReady();

    if (canSplit) {
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
            if(debouncedResizeHandler?.cancel) {
                debouncedResizeHandler.cancel();
            }
            window.removeEventListener('resize', debouncedResizeHandler);
            debouncedResizeHandler = null;

            document.querySelector('.reveal').remove();
            document.querySelector('.loader').remove();

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

function createProgressTween() {
    progressTween = gsap.to('.loading-bar', {
        scaleX: 0,
        duration: animationDuration,
        ease: "power1.inOut",
        paused: true
    });
}

function updateBar(getProgress) {
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
        progressTween.invalidate().restart();

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