import { gsap } from 'gsap';

export function animateLoadingBar() {
    gsap.fromTo('.loading-bar', 
        {
            scaleX: 0
        }, 
        {
            scaleX: 1,
            duration: 5,
            ease: "power1.inOut"
        });
};