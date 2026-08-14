import { gsap } from 'gsap';
import fracture1 from '../../../assets/fracture1.webp';
import eddieGlitch from '../../../assets/eddie-glitch-sci-fi.webp';
import nelliPortal from '../../../assets/nelli-portal-cinematic.webp';
import omkForest from '../../../assets/omk-forest-enhanced.webp';

const FRACTURE_PHOTOS = [fracture1, eddieGlitch, nelliPortal, omkForest];

// Ambient "this is clickable" pulse for the desktop tile — mobile doesn't
// need it, it has visible prev/next arrows instead. Plain opacity/scale
// yoyo, no randomized jitter (unlike hero-text-glitch.js's ambient timer);
// a steady breathing pulse reads as "idle affordance" without competing
// with the click-glitch itself. Fades for good the first time the tile is
// actually clicked/activated.
function initFractureHint(tile) {
  const hint = tile?.querySelector('.fracture-hint');
  if (!hint) return () => {};

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    gsap.set(hint, { opacity: 0.85 });
  } else {
    gsap.to(hint, {
      opacity: 0.95,
      scale: 1.06,
      duration: 1.1,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  let dismissed = false;
  return () => {
    if (dismissed) return;
    dismissed = true;
    gsap.killTweensOf(hint);
    gsap.to(hint, { opacity: 0, duration: 0.3, ease: 'power1.out' });
  };
}

// Desktop triggers on the tile itself; mobile triggers via the arrow
// buttons below it instead. Same chromatic-split filter family as the
// hero's #wave filter.
export function initFractureGlitch() {
  const tiles = document.querySelectorAll('.image-fracture');
  const desktopTile = document.querySelector('.hero-left--desktop .image-fracture');
  const prevBtn = document.querySelector('.fracture-nav-btn:not(.fracture-nav-btn--next)');
  const nextBtn = document.querySelector('.fracture-nav-btn--next');
  const redOffset = document.getElementById('fracture-red-offset');
  const blueOffset = document.getElementById('fracture-blue-offset');
  const redGhosts = document.querySelectorAll('.fracture-ghost--red');
  const cyanGhosts = document.querySelectorAll('.fracture-ghost--cyan');

  if (!tiles.length || !redOffset || !blueOffset) return;

  const dismissHint = initFractureHint(desktopTile);

  // Fetch the other 3 photos into the browser cache up front, so the
  // mid-glitch swap never has to wait on a first-time network request.
  FRACTURE_PHOTOS.slice(1).forEach((src) => { new Image().src = src; });

  let currentIndex = 0;
  let isAnimating = false;

  function setPhoto(index) {
    const url = `url(${FRACTURE_PHOTOS[index]})`;
    tiles.forEach((tile) => { tile.style.backgroundImage = url; });
  }

  function shift(direction) {
    if (isAnimating) return;
    isAnimating = true;

    const total = FRACTURE_PHOTOS.length;
    const nextIndex = (currentIndex + direction + total) % total;
    const sign = direction >= 0 ? 1 : -1;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tl = gsap.timeline({ onComplete: () => { isAnimating = false; } });

    if (reduceMotion) {
      tl.to(tiles, { opacity: 0.4, duration: 0.15 })
        .call(() => setPhoto(nextIndex))
        .to(tiles, { opacity: 1, duration: 0.15 });
      currentIndex = nextIndex;
      return;
    }

    // Rotate/ghost direction mirrors depending on prev vs next — same idea
    // as the archive carousel's sweep direction matching the arrow clicked.
    tl.to(redOffset, { attr: { dx: -8 * sign, dy: 2 }, duration: 0.06 }, 0)
      .to(blueOffset, { attr: { dx: 8 * sign, dy: -2 }, duration: 0.06 }, 0)
      .to(tiles, { rotate: -1.4 * sign, scale: 0.97, duration: 0.06 }, 0)
      .to(redGhosts, { opacity: 0.85, x: -6 * sign, duration: 0.06 }, 0)
      .to(cyanGhosts, { opacity: 0.85, x: 6 * sign, duration: 0.06 }, 0)

      .to(redOffset, { attr: { dx: 5 * sign, dy: -3 }, duration: 0.07 })
      .to(blueOffset, { attr: { dx: -5 * sign, dy: 3 }, duration: 0.07 }, '<')
      .to(tiles, { rotate: 1 * sign, scale: 1.02, duration: 0.07 }, '<')

      .call(() => setPhoto(nextIndex))

      .to(redOffset, { attr: { dx: -2 * sign, dy: 1 }, duration: 0.06 })
      .to(blueOffset, { attr: { dx: 2 * sign, dy: -1 }, duration: 0.06 }, '<')
      .to(tiles, { rotate: -0.4 * sign, scale: 0.995, duration: 0.06 }, '<')

      .to(redOffset, { attr: { dx: 0, dy: 0 }, duration: 0.22, ease: 'power2.out' })
      .to(blueOffset, { attr: { dx: 0, dy: 0 }, duration: 0.22, ease: 'power2.out' }, '<')
      .to(tiles, { rotate: 0, scale: 1, duration: 0.3, ease: 'back.out(2.2)' }, '<')
      .to([redGhosts, cyanGhosts], { opacity: 0, x: 0, duration: 0.2, ease: 'power2.out' }, '<');

    currentIndex = nextIndex;
  }

  if (desktopTile) {
    const activate = () => {
      shift(1);
      dismissHint();
    };
    desktopTile.addEventListener('click', activate);
    desktopTile.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => shift(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => shift(1));
}
