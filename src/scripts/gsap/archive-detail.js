import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ARCHIVE_FRAGMENTS, playCursorReveal } from './archive.js';

gsap.registerPlugin(Flip);

const COPY_REVEAL_SELECTOR = '.archive-detail-eyebrow, .archive-detail-status';

function isDesktopLayout() {
  const desktop = document.querySelector('.archive--desktop');
  return desktop ? getComputedStyle(desktop).display !== 'none' : true;
}

// Matches the direction the copy panel curtain travels in on each layout:
// in from the right on desktop, up from the bottom on mobile — same
// inset()-sweep technique as the mobile carousel's card transition.
function hiddenClip(desktopLayout) {
  return desktopLayout ? 'inset(0% 0% 0% 100%)' : 'inset(100% 0% 0% 0%)';
}

// The terminal-cursor timelines leave their final (visible) inline styles in
// place after playing once, so replaying them on a re-open needs the
// cursor/text reset back to their CSS starting point first.
function resetCopyReveal(root) {
  gsap.set(root.querySelectorAll('.archive-reveal-text'), { clipPath: 'inset(0% 100% 0% 0%)' });
  gsap.set(root.querySelectorAll('.archive-reveal-cursor'), { scaleY: 0, left: '0%', opacity: 1 });
}

export function initArchiveDetail() {
  const dialog = document.querySelector('.archive-detail');
  const scrim = dialog?.querySelector('.archive-detail-scrim');
  const inner = dialog?.querySelector('.archive-detail-inner');
  const imageContainer = dialog?.querySelector('.archive-detail-image');
  const copyPanel = dialog?.querySelector('.archive-detail-copy');
  const closeBtn = dialog?.querySelector('.archive-detail-close');
  const eyebrowText = dialog?.querySelector('.archive-detail-eyebrow .archive-reveal-text');
  const titleEl = dialog?.querySelector('.archive-detail-title');
  const statusValue = dialog?.querySelector('.archive-detail-status .gold');
  const bodyEl = dialog?.querySelector('.archive-detail-body');
  const triggers = document.querySelectorAll('.archive-card, .archive-card--mobile');
  const customCursor = document.querySelector('.cursor');

  if (!dialog || !scrim || !inner || !imageContainer || !copyPanel || !closeBtn || !triggers.length) return;

  let isAnimating = false;
  let activeClone = null;
  let sourcePhotoEl = null;
  let openedOnDesktop = true;
  let cursorHomeParent = null;
  let cursorHomeNextSibling = null;

  // <dialog> renders in the browser's top layer, which paints above every
  // normal element regardless of z-index — including the custom cursor. The
  // only way to keep the cursor visible over dialog content is to make it a
  // descendant of the dialog for as long as the dialog is open.
  function moveCursorIntoDialog() {
    if (!customCursor) return;
    cursorHomeParent = customCursor.parentNode;
    cursorHomeNextSibling = customCursor.nextSibling;
    dialog.appendChild(customCursor);
  }

  function restoreCursorHome() {
    if (!customCursor || !cursorHomeParent) return;
    cursorHomeParent.insertBefore(customCursor, cursorHomeNextSibling);
    cursorHomeParent = null;
    cursorHomeNextSibling = null;
  }

  function fragmentForCard(cardEl) {
    const photoEl = cardEl.querySelector('.archive-card-photo');
    if (!photoEl) return null;
    const index = ARCHIVE_FRAGMENTS.findIndex((f) => photoEl.classList.contains(`archive-card-photo--${f.photo}`));
    return index === -1 ? null : { fragment: ARCHIVE_FRAGMENTS[index], photoEl };
  }

  function populateCopy(fragment) {
    eyebrowText.textContent = `FRAGMENT_${fragment.number}`;
    titleEl.textContent = fragment.title;
    statusValue.textContent = `${fragment.memory}%`;
    bodyEl.textContent = fragment.body;
  }

  function makeClone(rect, photoModifierClass) {
    const clone = document.createElement('div');
    clone.className = `archive-detail-flip-photo archive-card-photo ${photoModifierClass}`;
    Object.assign(clone.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: 0,
      transform: 'none'
    });
    return clone;
  }

  function openDetail(cardEl) {
    if (isAnimating || dialog.open) return;
    const match = fragmentForCard(cardEl);
    if (!match) return;

    isAnimating = true;
    const { fragment, photoEl } = match;
    sourcePhotoEl = photoEl;
    openedOnDesktop = isDesktopLayout();

    const photoModifierClass = `archive-card-photo--${fragment.photo}`;
    const sourceRect = photoEl.getBoundingClientRect();

    populateCopy(fragment);
    resetCopyReveal(copyPanel);

    const smoother = ScrollSmoother.get();
    if (smoother) smoother.paused(true);

    activeClone = makeClone(sourceRect, photoModifierClass);
    document.body.appendChild(activeClone);
    const state = Flip.getState(activeClone);

    dialog.showModal();
    moveCursorIntoDialog();
    imageContainer.appendChild(activeClone);
    // Drop the inline fixed-position styles so the element falls back to the
    // .archive-detail-flip-photo class (absolute, filling the container) —
    // that resting layout is what Flip.from() below measures as the target.
    activeClone.style.cssText = '';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.set(scrim, { opacity: 0 });
    gsap.set(copyPanel, { clipPath: hiddenClip(openedOnDesktop) });

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
        playCursorReveal(COPY_REVEAL_SELECTOR, 0.5);
      }
    });

    tl.to(scrim, { opacity: 1, duration: reduceMotion ? 0.2 : 0.4, ease: 'power1.out' }, 0);

    if (reduceMotion) {
      // Clone already landed in its resting layout (cssText was cleared
      // above) — no position tween, just let the copy panel fade in.
      tl.to(copyPanel, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.2 }, 0);
    } else {
      tl.add(Flip.from(state, { duration: 0.7, ease: 'expo.inOut', absolute: true, scale: true }), 0)
        .to(copyPanel, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'expo.inOut' }, 0.3);
    }
  }

  function closeDetail() {
    if (isAnimating || !dialog.open || !activeClone) return;
    isAnimating = true;

    const targetRect = sourcePhotoEl.getBoundingClientRect();
    const state = Flip.getState(activeClone);

    document.body.appendChild(activeClone);
    Object.assign(activeClone.style, {
      position: 'fixed',
      top: `${targetRect.top}px`,
      left: `${targetRect.left}px`,
      width: `${targetRect.width}px`,
      height: `${targetRect.height}px`,
      margin: 0
    });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tl = gsap.timeline({
      onComplete: () => {
        dialog.close();
        restoreCursorHome();
        activeClone.remove();
        activeClone = null;
        sourcePhotoEl = null;
        const smoother = ScrollSmoother.get();
        if (smoother) smoother.paused(false);
        isAnimating = false;
      }
    });

    tl.to(copyPanel, { clipPath: hiddenClip(openedOnDesktop), duration: 0.4, ease: 'expo.inOut' }, 0)
      .to(scrim, { opacity: 0, duration: 0.5, ease: 'power1.in' }, 0.15);

    if (reduceMotion) {
      tl.to(activeClone, { opacity: 0, duration: 0.2 }, 0);
    } else {
      tl.add(Flip.from(state, { duration: 0.6, ease: 'expo.inOut', absolute: true, scale: true }), 0);
    }
  }

  triggers.forEach((cardEl) => {
    cardEl.addEventListener('click', () => openDetail(cardEl));
    cardEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDetail(cardEl);
      }
    });
  });

  closeBtn.addEventListener('click', closeDetail);

  // Native <dialog> closes immediately on Esc by default — intercept so Esc
  // plays the same animated close as the button instead of a hard cut.
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDetail();
  });
}
