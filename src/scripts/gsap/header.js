import { gsap } from 'gsap';

// Find feOffset in SVG
export function startHeaderWaves() {
  const feOffset = document.querySelector('.header-shape feOffset');
  if (feOffset) {
    gsap.to(feOffset, {
        attr: { dx: 420 },
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "none"
    });
  }
};