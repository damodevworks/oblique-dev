import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Ignore resize events from mobile browser chrome show/hide.
ScrollTrigger.config({ ignoreMobileResize: true });

export function smoothInit () {
    return ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.2, 
        effects: true, 
        smoothTouch: 0.1 
    });
}

