import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Start/stop lifecycle for animations that run on their own clock instead of
// being driven by scroll progress — reused by any section that wants a
// "living interface" effect rather than a scroll-scrubbed one. The timeline
// is built lazily on first activation, then just played/paused afterwards.
export function createAmbientLifecycle({ trigger, start, end, buildTimeline }) {
  let timeline = null;

  function activate() {
    if (!timeline) timeline = buildTimeline();
    timeline.play();
  }

  function deactivate() {
    timeline?.pause();
  }

  return ScrollTrigger.create({
    trigger,
    start,
    end,
    onEnter: activate,
    onEnterBack: activate,
    onLeave: deactivate,
    onLeaveBack: deactivate
  });
}
