import { gsap } from 'gsap';

// Store GSAP timelines for both desktop and mobile SVG animations
let desktopTimeline = null;
let mobileTimeline = null;

// Debounce
let resizeTimeout;

// Check if an element is visible in the viewport
function isVisible(element) {
  if(!element) return false;
  const style = getComputedStyle(element);
  
  // Check display, opacity, and visibility properties
  if (style.display === 'none') return false;
  if (style.opacity === '0') return false;
  if (style.visibility === 'hidden') return false;
  
  // Check if element has dimensions
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  
  return true;
};

export function startHeaderWaves() {
  // Get SVG elements and their feOffset nodes
  const svgDesktop = document.querySelector('.header-shape');
  const feOffsetDesktop = svgDesktop?.querySelector('feOffset');
  const svgMobile = document.querySelector('.header-shape--mobile');
  const feOffsetMobile = svgMobile?.querySelector('feOffset');

  // Handle desktop SVG animation
  if (svgDesktop && feOffsetDesktop) {
    if(isVisible(svgDesktop)) {
      if(!desktopTimeline) {
        // Create new timeline if it doesn't exist
        desktopTimeline = gsap.to(feOffsetDesktop, {
          attr: { dx: 300 },
          duration: 20,
          repeat: -1,
          yoyo: true,
          ease: "none"
        });
      } else {
        // Resume existing timeline
        desktopTimeline.play();
      }
    } else {
      // Pause animation when desktop SVG is hidden
      if(desktopTimeline) {
        desktopTimeline.pause();
      }
    }
  }

  // Handle mobile SVG animation
  if (svgMobile && feOffsetMobile) {
    if (isVisible(svgMobile)) {
      if (!mobileTimeline) {
        // Create new timeline if it doesn't exist
        mobileTimeline = gsap.to(feOffsetMobile, {
          attr: { dx: 100 },
          duration: 8,
          repeat: -1,
          yoyo: true,
          ease: "none"
        });
      } else {
        // Resume existing timeline
        mobileTimeline.play();
      }
    } else {
      // Pause animation when mobile SVG is hidden
      if (mobileTimeline) {
        mobileTimeline.pause();
      }
    }
  }
};

// Debounced resize listener to optimize performance
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(startHeaderWaves, 150);
});