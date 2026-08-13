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
// Exported so the fragment detail dialog can replay the same terminal-typing
// effect on its own eyebrow/status lines instead of duplicating the timeline logic.
export function playCursorReveal(selector, sweepDuration) {
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

  tl.to(fadeDropTargets, { opacity: 1, y: 0, pointerEvents: 'auto' }, 0);
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
    .to(cards, { opacity: 1, pointerEvents: 'auto', ...offsetVars, stagger: CARD_STAGGER });
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

// Single source of truth for the 4 archive fragments — same order as the
// desktop gallery. Shared by the mobile carousel (photo/number) and the
// fragment detail dialog (title/memory/body), so the content only lives here.
export const ARCHIVE_FRAGMENTS = [
  {
    photo: 'abstract',
    number: '01',
    title: 'Static Bloom',
    memory: 78,
    body: 'A waveform recovered from corrupted storage. No timestamp, no source — just color where data used to be.'
  },
  {
    photo: 'brutalism',
    number: '02',
    title: 'Dead Reckoning',
    memory: 41,
    body: 'Overlapping scans: a lunar mission log spliced with something older. The system can’t separate the two.'
  },
  {
    photo: 'space1',
    number: '03',
    title: 'Pulse',
    memory: 92,
    body: 'Vitals from a body that was never logged. The pulse is real. Everything else is inference.'
  },
  {
    photo: 'nasa1',
    number: '04',
    title: 'Cosmos',
    memory: 24,
    body: 'The widest frame the archive could reconstruct. Most of it is still missing.'
  }
];
const CAROUSEL_WIPE_DURATION = 0.5;

// Mobile carousel: swaps the single card's photo/number in place, wiped in
// with the same clip-path sweep used by the terminal-cursor reveal elsewhere
// in this section, so the transition reads as part of the same motion language.
export function initArchiveCarousel() {
  const carousel = document.querySelector('.archive-carousel');
  const card = carousel?.querySelector('.archive-card--mobile');
  const photo = card?.querySelector('.archive-card-photo');
  const numberEl = card?.querySelector('.archive-card-number');
  const prevBtn = carousel?.querySelector('.archive-arrow-btn:not(.archive-arrow-btn--right)');
  const nextBtn = carousel?.querySelector('.archive-arrow-btn--right');
  if (!card || !photo || !numberEl || !prevBtn || !nextBtn) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentIndex = ARCHIVE_FRAGMENTS.findIndex((slide) =>
    photo.classList.contains(`archive-card-photo--${slide.photo}`)
  );
  if (currentIndex === -1) currentIndex = 0;
  let animating = false;

  function applySlide(index) {
    const slide = ARCHIVE_FRAGMENTS[index];
    ARCHIVE_FRAGMENTS.forEach((s) => photo.classList.remove(`archive-card-photo--${s.photo}`));
    photo.classList.add(`archive-card-photo--${slide.photo}`);
    numberEl.textContent = slide.number;
    card.setAttribute('aria-label', `View fragment ${slide.number}`);
  }

  function pressButton(btn) {
    gsap.timeline()
      .to(btn, { scale: 0.85, duration: 0.15, ease: 'power2.out' })
      .to(btn, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
  }

  function goTo(direction) {
    if (animating) return;
    animating = true;

    const nextIndex = (currentIndex + direction + ARCHIVE_FRAGMENTS.length) % ARCHIVE_FRAGMENTS.length;

    if (reduceMotion) {
      gsap.to(card, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          applySlide(nextIndex);
          currentIndex = nextIndex;
          gsap.to(card, { opacity: 1, duration: 0.2, onComplete: () => { animating = false; } });
        }
      });
      return;
    }

    // Sweeps left-to-right for "next", right-to-left for "prev" — same
    // direction logic as the reveal cursor's clip-path wipe.
    const exitTarget = direction > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)';
    const enterStart = direction > 0 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)';

    gsap.timeline({ defaults: { ease: 'expo.inOut' } })
      .to(card, { clipPath: exitTarget, duration: CAROUSEL_WIPE_DURATION })
      .call(() => {
        applySlide(nextIndex);
        currentIndex = nextIndex;
        gsap.set(card, { clipPath: enterStart });
      })
      .to(card, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: CAROUSEL_WIPE_DURATION,
        onComplete: () => { animating = false; }
      });
  }

  prevBtn.addEventListener('click', () => { pressButton(prevBtn); goTo(-1); });
  nextBtn.addEventListener('click', () => { pressButton(nextBtn); goTo(1); });
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
