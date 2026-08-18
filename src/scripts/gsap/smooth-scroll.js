import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export function smoothInit () {
    // stops pin positions corrupting when mobile browser chrome resizes mid-scroll
    ScrollTrigger.config({ ignoreMobileResize: true });

    return ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.2,
        effects: true,
        smoothTouch: 0.1,
        normalizeScroll: true // routes through ScrollSmoother's own normalizer, not a competing one
    });
}
