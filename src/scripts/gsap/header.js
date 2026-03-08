import { gsap } from 'gsap';

// Store GSAP timelines for both desktop and mobile SVG animations
let desktopWaveTimeline = null;
let mobileWaveTimeline = null;
let desktopImageTimeline = null;
let mobileImageTimeline = null;
let resizeTimeout;

// Global DOM elements
const svgDesktop = document.querySelector('.header-shape');
const svgMobile = document.querySelector('.header-shape--mobile');

function randomBetween(min, max) {
  return gsap.utils.random(min, max, 0.01);
}

// Check if an element is visible in the viewport
function isVisible(element) {
  if (!element) return false;
  const style = getComputedStyle(element);
  
  if (style.display === 'none') return false;
  if (style.opacity === '0') return false;
  if (style.visibility === 'hidden') return false;
  
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  
  return true;
}

// Set up debounced resize handler
function setupResizeHandler() {
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateHeaderWaveDistortion();
      updateHeaderImageDrift();
    }, 150);
  });
}

// Create desktop wave animation timeline
function createDesktopWaveAnimation(feOffset) {
  return gsap.to(feOffset, {
    attr: { dx: 300 },
    duration: 20,
    repeat: -1,
    yoyo: true,
    ease: "none"
  });
}

// Create mobile wave animation timeline
function createMobileWaveAnimation(feOffset) {
  return gsap.to(feOffset, {
    attr: { dx: 100 },
    duration: 8,
    repeat: -1,
    yoyo: true,
    ease: "none"
  });
}

// Handle desktop SVG animation
function handleDesktopWaveAnimation(svg, feOffset) {
  if (!svg || !feOffset) return;
  
  if (isVisible(svg)) {
    if (!desktopWaveTimeline) {
      desktopWaveTimeline = createDesktopWaveAnimation(feOffset);
    } else {
      desktopWaveTimeline.play();
    }
  } else {
    if (desktopWaveTimeline) {
      desktopWaveTimeline.pause();
    }
  }
}

// Handle mobile SVG animation
function handleMobileWaveAnimation(svg, feOffset) {
  if (!svg || !feOffset) return;
  
  if (isVisible(svg)) {
    if (!mobileWaveTimeline) {
      mobileWaveTimeline = createMobileWaveAnimation(feOffset);
    } else {
      mobileWaveTimeline.play();
    }
  } else {
    if (mobileWaveTimeline) {
      mobileWaveTimeline.pause();
    }
  }
}

// Update header wave animations based on current visibility
function updateHeaderWaveDistortion() {
  const feOffsetDesktop = svgDesktop?.querySelector('feOffset');
  const feOffsetMobile = svgMobile?.querySelector('feOffset');

  handleDesktopWaveAnimation(svgDesktop, feOffsetDesktop);
  handleMobileWaveAnimation(svgMobile, feOffsetMobile);
}

// ********* Image Drift Animation *****************

function createDesktopImageDrift(image) {
  gsap.set(image, {
    transformBox: 'fill-box',
    transformOrigin: '50% 50%'
  });

  const tl = gsap.timeline({
    repeat: -1,
    repeatRefresh: true,
    defaults: {
      ease: 'sine.inOut'
    }
  });

  tl
    .to(image, {
      attr: {
        x: () => randomBetween(-18, -50),
        y: () => randomBetween(-12, -50)
      },
      duration: () => randomBetween(2.8, 4.2)
    })
    .to(image, {
      scale: () => randomBetween(1.015, 1.1),
      duration: () => randomBetween(1.8, 2.8)
    }, '<')
    .to(image, {
      attr: {
        x: () => randomBetween(-8, -40),
        y: () => randomBetween(-24, -25)
      },
      duration: () => randomBetween(2.6, 4.4)
    })
    .to(image, {
      scale: () => randomBetween(0.995, 1.1),
      duration: () => randomBetween(1.6, 2.4)
    }, '<')
    .to(image, {
      attr: {
        x: 0,
        y: 0
      },
      scale: 1,
      duration: () => randomBetween(2.8, 4.5)
    });

  return tl;
}

function createMobileImageDrift(image) {
  gsap.set(image, {
    transformBox: 'fill-box',
    transformOrigin: '50% 50%'
  });

  const tl = gsap.timeline({
    repeat: -1,
    repeatRefresh: true,
    defaults: {
      ease: 'sine.inOut'
    }
  });

  tl
    .to(image, {
      attr: {
        x: () => randomBetween(-24, -10),
        y: () => randomBetween(-20, -34)
      },
      duration: () => randomBetween(3.2, 4.8)
    })
    .to(image, {
      scale: () => randomBetween(1.02, 1.2),
      duration: () => randomBetween(2, 3)
    }, '<')
    .to(image, {
      attr: {
        x: () => randomBetween(2, 10),
        y: () => randomBetween(-8, -26)
      },
      duration: () => randomBetween(3, 5)
    })
    .to(image, {
      scale: () => randomBetween(0.998, 1.2),
      duration: () => randomBetween(1.8, 2.8)
    }, '<')
    .to(image, {
      attr: {
        x: () => randomBetween(-12, 2),
        y: () => randomBetween(-18, -6)
      },
      duration: () => randomBetween(2.6, 4.2)
    })
    .to(image, {
      scale: () => randomBetween(1.01, 1.08),
      duration: () => randomBetween(1.8, 2.6)
    }, '<')
    .to(image, {
      attr: {
        x: 0,
        y: 0
      },
      scale: 1,
      duration: () => randomBetween(3.4, 5.2)
    });

  return tl;
}

function handleDesktopImageDrift(svg, image) {
 if (!svg || !image) return;
 if (isVisible(svg)) {
  if (!desktopImageTimeline) {
    desktopImageTimeline = createDesktopImageDrift(image);
  } else {
    desktopImageTimeline.play();
  }
 } else {
  if (desktopImageTimeline) {
    desktopImageTimeline.pause();
  }
 }
}

function handleMobileImageDrift (svg, image) {
   if (!svg || !image) return;
 if (isVisible(svg)) {
  if (!mobileImageTimeline) {
    mobileImageTimeline = createMobileImageDrift(image);
  } else {
    mobileImageTimeline.play();
  }
 } else {
  if (mobileImageTimeline) {
    mobileImageTimeline.pause();
  }
 }
}
function updateHeaderImageDrift() {
  const imageDesktop = svgDesktop?.querySelector('#svg-image-desktop');
  const imageMobile = svgMobile?.querySelector('#svg-image-mobile');
  handleDesktopImageDrift(svgDesktop, imageDesktop);
  handleMobileImageDrift(svgMobile, imageMobile);
}

// Initialize header wave animations
export function initHeaderAnimations() {
  updateHeaderWaveDistortion();
  updateHeaderImageDrift();
  setupResizeHandler();
}