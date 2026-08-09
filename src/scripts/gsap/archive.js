import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Gap after "the rest" finishes, before the cards start.
const CARDS_DELAY_MS = 300;
// Time between each card's reveal.
const CARD_STAGGER = 0.5;

let hudTimeline = null;

// Terminal-cursor reveal: cursor grows from center, sweeps left-to-right in
// sync with the text's clip-path, then fades out. Reused for the HUD,
// Memory and System Recovery lines.
function buildCursorRevealTimeline(container, sweepDuration = 0.9) {
  const cursor = container.querySelector('.archive-reveal-cursor');
  const text = container.querySelector('.archive-reveal-text');
  if (!cursor || !text) return null;

  const tl = gsap.timeline({ defaults: { ease: 'expo.inOut' } });

  tl.to(cursor, { scaleY: 1, duration: 0.35 })
    .addLabel('sweep')
    .to(text, { clipPath: 'inset(0% 0% 0% 0%)', duration: sweepDuration }, 'sweep')
    .to(cursor, { left: '100%', duration: sweepDuration }, 'sweep')
    .to(cursor, { opacity: 0, duration: 0.3 });

  return tl;
}

// Plays the cursor reveal on every matching element and resolves once they're all done.
function playCursorReveal(selector, sweepDuration) {
  return new Promise((resolve) => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return resolve();

    let pending = elements.length;
    elements.forEach((el) => {
      const tl = buildCursorRevealTimeline(el, sweepDuration);
      if (!tl) {
        pending -= 1;
        if (pending === 0) resolve();
        return;
      }
      tl.eventCallback('onComplete', () => {
        pending -= 1;
        if (pending === 0) resolve();
      });
      tl.play();
    });
  });
}

// Fades in title/gallery/fragments/carousel/footer with a slight downward drop, plus the diagonal line wiping in left-to-right.
function buildRestRevealTimeline(section) {
  const fadeDropTargets = section.querySelectorAll(
    '.archive-title, .archive-gallery, .archive-fragment, .archive-fragment-2--mobile, .archive-carousel'
  );
  const line = section.querySelector('.archive-line');

  const tl = gsap.timeline({ defaults: { ease: 'expo.inOut', duration: 1 } });

  tl.to(fadeDropTargets, { opacity: 1, y: 0 }, 0);
  if (line) tl.to(line, { opacity: 0.12, scaleX: 1 }, 0);

  return tl;
}

// Staggers in whichever tree (desktop/mobile) is currently visible.
function buildCardsRevealTimeline(section) {
  const desktopVisible = getComputedStyle(section.querySelector('.archive--desktop')).display !== 'none';
  const cards = desktopVisible
    ? section.querySelectorAll('.archive-card')
    : section.querySelectorAll('.archive-card--mobile');
  const offsetVars = desktopVisible ? { y: 0 } : { marginTop: 0 };

  return gsap.timeline({ defaults: { ease: 'expo.inOut', duration: 0.6 } })
    .to(cards, { opacity: 1, ...offsetVars, stagger: CARD_STAGGER });
}

// Reveals the section and plays the ACCESS_KEY cursor reveal.
function revealAccessKey() {
  const section = document.querySelector('.archive');
  if (!section) return;

  gsap.set(section, { opacity: 1, visibility: 'visible' });

  const timelines = Array.from(document.querySelectorAll('.archive-hud'))
    .map((hud) => buildCursorRevealTimeline(hud))
    .filter(Boolean);

  timelines.forEach((tl) => tl.play());
  hudTimeline = timelines[0] || null;
}

// Chains Memory -> Recovery -> rest -> cards, each step waiting for the previous one to finish.
async function revealRestOfSection() {
  const section = document.querySelector('.archive');
  if (!section) return;

  if (hudTimeline && hudTimeline.isActive()) {
    await new Promise((resolve) => hudTimeline.eventCallback('onComplete', resolve));
  }

  await playCursorReveal('.archive-status', 0.45);
  await playCursorReveal('.archive-recovery', 0.45);

  await new Promise((resolve) => {
    buildRestRevealTimeline(section).eventCallback('onComplete', resolve);
  });

  await new Promise((resolve) => setTimeout(resolve, CARDS_DELAY_MS));

  await new Promise((resolve) => {
    buildCardsRevealTimeline(section).eventCallback('onComplete', resolve);
  });

  gsap.to(section.querySelectorAll('.archive-topo'), { opacity: 1, duration: 0.8, ease: 'expo.inOut' });
}

// Scroll-linked pan on the fragment photos and card photos, synced to the same trigger point the reveal chain starts from.
function initImageDrift(section) {
  const makeScrollTriggerVars = () => ({
    trigger: section,
    start: 'top 40%',
    end: '+=350',
    scrub: true
  });

  gsap.fromTo(
    section.querySelectorAll('.archive-drift-image'),
    { y: -12 },
    { y: 12, ease: 'none', scrollTrigger: makeScrollTriggerVars() }
  );

  gsap.fromTo(
    section.querySelectorAll('.archive-card-photo'),
    { y: -14 },
    { y: 14, ease: 'none', scrollTrigger: makeScrollTriggerVars() }
  );
}

export function initArchiveAnimation() {
  const section = document.querySelector('.archive');
  if (!section) return;

  gsap.set('.archive-line', { scaleX: 0 });
  gsap.set('.archive-card', { y: -20 });
  gsap.set('.archive-card--mobile', { marginTop: -20 });

  initImageDrift(section);

  ScrollTrigger.create({
    trigger: section,
    start: 'top 80%',
    once: true,
    onEnter: revealAccessKey
  });

  ScrollTrigger.create({
    trigger: section,
    start: 'top 40%',
    once: true,
    onEnter: revealRestOfSection
  });
}
