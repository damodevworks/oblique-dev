import { gsap } from 'gsap';

let isCursorInitialized = false;
let removeCursorTicker = null;

export function initCustomCursor() {
  if (isCursorInitialized) return;

  const cursor = document.querySelector('.cursor');
  const core = document.querySelector('.cursor-core');
  const ring = document.querySelector('.cursor-ring');
  const distort = document.querySelector('.cursor-distort');

  const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (!cursor || !core || !ring || !distort || !isDesktopPointer) return;

  isCursorInitialized = true;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  let ringX = mouseX;
  let ringY = mouseY;

  let distortX = mouseX;
  let distortY = mouseY;

  let isCtaHovered = false;

  let effectiveX = mouseX;
  let effectiveY = mouseY;

  const ctaMagnetConfig = {
    radius: 140,
    maxPull: 20,
    strength: 0.22
  };

  // start hidden until first movement
  gsap.set(cursor, { autoAlpha: 0 });
  gsap.set(core, { xPercent: -50, yPercent: -50 });
  gsap.set(ring, { xPercent: -50, yPercent: -50 });
  gsap.set(distort, { xPercent: -50, yPercent: -50 });

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isCtaHovered) {
      gsap.set(cursor, { autoAlpha: 1 });
    }
  });

  function updateCtaMagnetPosition() {
    effectiveX = mouseX;
    effectiveY = mouseY;

    if (isCtaHovered) return;

    let activeCta = null;
    let closestDistance = Infinity;

    ctaHoverTargets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = centerX - mouseX;
      const dy = centerY - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ctaMagnetConfig.radius && distance < closestDistance) {
        closestDistance = distance;
        activeCta = { dx, dy, distance };
      }
    });

    if (!activeCta) return;

    const strengthFactor = 1 - activeCta.distance / ctaMagnetConfig.radius;
    const pullX = Math.max(
      -ctaMagnetConfig.maxPull,
      Math.min(ctaMagnetConfig.maxPull, activeCta.dx * strengthFactor * ctaMagnetConfig.strength)
    );
    const pullY = Math.max(
      -ctaMagnetConfig.maxPull,
      Math.min(ctaMagnetConfig.maxPull, activeCta.dy * strengthFactor * ctaMagnetConfig.strength)
    );

    effectiveX = mouseX + pullX;
    effectiveY = mouseY + pullY;
  }

  function applyCtaHoverState(target) {
    const styles = window.getComputedStyle(target);

    if (!target.dataset.cursorMergeBg) {
      target.dataset.cursorMergeBg = styles.backgroundColor;
      target.dataset.cursorMergeBorder = styles.borderColor;
      target.dataset.cursorMergeColor = styles.color;
      target.dataset.cursorMergeShadow = styles.boxShadow;
    }

    gsap.to(cursor, {
      autoAlpha: 0,
      duration: 0.12,
      ease: 'power2.out',
      overwrite: true
    });

    gsap.to(target, {
      backgroundColor: '#EDF2F4',
      borderColor: '#0F0A0A',
      color: '#0F0A0A',
      boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
      y: -2,
      duration: 0.22,
      ease: 'power2.out',
      overwrite: true
    });
  }

  function releaseCtaHoverState(target) {
    if (!target) return;

    isCtaHovered = false;
    effectiveX = mouseX;
    effectiveY = mouseY;

    gsap.to(cursor, {
      autoAlpha: 1,
      duration: 0.14,
      ease: 'power2.out',
      overwrite: true
    });

    gsap.to(target, {
      backgroundColor: target.dataset.cursorMergeBg || '#DFBC21',
      borderColor: target.dataset.cursorMergeBorder || '#DFBC21',
      color: target.dataset.cursorMergeColor || '#EDF2F4',
      boxShadow: target.dataset.cursorMergeShadow || '0 6px 18px rgba(0,0,0,0.12)',
      y: 0,
      duration: 0.22,
      ease: 'power2.out',
      overwrite: true
    });
  }

  const tickCursor = () => {
    updateCtaMagnetPosition();

    const coreFollowSpeed = isCtaHovered ? 0.03 : 0.18;

    mouseX += (effectiveX - mouseX) * 0;
    mouseY += (effectiveY - mouseY) * 0;

    gsap.set(core, {
      x: effectiveX,
      y: effectiveY
    });

    const ringFollowSpeed = isCtaHovered ? 0.018 : 0.07;
    const distortFollowSpeed = isCtaHovered ? 0.012 : 0.05;

    ringX += (effectiveX - ringX) * ringFollowSpeed;
    ringY += (effectiveY - ringY) * ringFollowSpeed;

    distortX += (effectiveX - distortX) * distortFollowSpeed;
    distortY += (effectiveY - distortY) * distortFollowSpeed;

    gsap.set(ring, {
      x: ringX,
      y: ringY
    });

    gsap.set(distort, {
      x: distortX,
      y: distortY
    });
  };

  gsap.ticker.add(tickCursor);
  removeCursorTicker = () => gsap.ticker.remove(tickCursor);

  // subtle idle pulse
  gsap.to(ring, {
    scale: 1.08,
    duration: 2.6,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  gsap.to(distort, {
    scaleX: 1.08,
    scaleY: 0.96,
    duration: 2.8,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  // Hover targets
  const defaultHoverTargets = document.querySelectorAll('button, .fracture');
  const ctaHoverTargets = document.querySelectorAll('.CTA-button');

  function handleHoverEnter() {
    gsap.to(ring, {
      scale: 1.3,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: true
    });

    gsap.to(distort, {
      scale: 1.15,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: true
    });

    gsap.to(core, {
      scale: 0.75,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: true
    });
  }

  function handleHoverLeave() {
    gsap.to(ring, {
      scale: 1,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: true
    });

    gsap.to(distort, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: true
    });

    gsap.to(core, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: true
    });
  }

  function handleCtaHoverEnter(event) {
    const target = event.currentTarget;

    isCtaHovered = true;

    applyCtaHoverState(target);
  }

  function handleCtaHoverLeave(event) {
    const target = event.currentTarget;
    releaseCtaHoverState(target);
  }

  defaultHoverTargets.forEach((target) => {
    target.addEventListener('mouseenter', handleHoverEnter);
    target.addEventListener('mouseleave', handleHoverLeave);
  });

  ctaHoverTargets.forEach((target) => {
    target.addEventListener('mouseenter', handleCtaHoverEnter);
    target.addEventListener('mouseleave', handleCtaHoverLeave);
  });

  window.addEventListener('mouseleave', () => {
    gsap.to(cursor, {
      autoAlpha: 0,
      duration: 0.1
    });
  });

  window.addEventListener('mouseenter', () => {
    if (!isCtaHovered) {
      gsap.to(cursor, {
        autoAlpha: 1,
        duration: 0.1
      });
    }
  });
}