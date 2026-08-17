import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger);

const HOLD_MS = 1500;

// Freezes scroll for a beat on first entry so the glitch video gets noticed.
function pinVideoSection() {
  const section = document.querySelector('.video-section');
  if (!section) return;

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    once: true,
    onEnter: () => {
      const smoother = ScrollSmoother.get();
      if (!smoother) return;
      smoother.paused(true);

      const bar = section.querySelector('.video-hold-bar');
      const fill = section.querySelector('.video-hold-bar-fill');
      gsap.set(bar, { opacity: 1 });
      gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: HOLD_MS / 1000, ease: 'none' });

      setTimeout(() => {
        smoother.paused(false);
        gsap.to(bar, { opacity: 0, duration: 0.3 });
      }, HOLD_MS);
    }
  });
}

export function initVideoSectionPin() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.querySelector('.video-section')) return;

  if (document.body.classList.contains('is-loading')) {
    document.addEventListener('loader:complete', pinVideoSection, { once: true });
  } else {
    pinVideoSection();
  }
}

// Mobile browsers (iOS Safari especially) silently pause a looping
// background video after the tab is backgrounded — lock screen, app switch,
// low-power mode — and never resume it on their own. Nudge it back to
// playing whenever the tab regains visibility or the video re-enters view.
export function initVideoPlayback() {
  const video = document.querySelector('.video-section-media');
  if (!video) return;

  const tryPlay = () => { video.play().catch(() => {}); };

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tryPlay();
  });

  video.addEventListener('pause', tryPlay);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) tryPlay();
    });
  }, { threshold: 0.1 });
  observer.observe(video);
}
