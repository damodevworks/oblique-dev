import { gsap } from 'gsap';

export function initCustomCursor() {
  const cursor = document.querySelector('.cursor');
  const core = document.querySelector('.cursor-core');
  const ring = document.querySelector('.cursor-ring');
  const distort = document.querySelector('.cursor-distort');

  const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (!cursor || !core || !ring || !distort || !isDesktopPointer) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  let ringX = mouseX;
  let ringY = mouseY;

  let distortX = mouseX;
  let distortY = mouseY;

  // start hidden until first movement
  gsap.set(cursor, { autoAlpha: 0 });
  gsap.set(core, { xPercent: -50, yPercent: -50 });
  gsap.set(ring, { xPercent: -50, yPercent: -50 });
  gsap.set(distort, { xPercent: -50, yPercent: -50 });

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    gsap.set(cursor, { autoAlpha: 1 });

    gsap.to(core, {
      x: mouseX,
      y: mouseY,
      duration: 0.12,
      ease: 'power2.out',
      overwrite: true
    });
  });

  gsap.ticker.add(() => {
    ringX += (mouseX - ringX) * 0.07;
    ringY += (mouseY - ringY) * 0.07;

    distortX += (mouseX - distortX) * 0.05;
    distortY += (mouseY - distortY) * 0.05;

    gsap.set(ring, {
      x: ringX,
      y: ringY
    });

    gsap.set(distort, {
      x: distortX,
      y: distortY
    });
  });

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

  window.addEventListener('mouseleave', () => {
    gsap.to(cursor, {
      autoAlpha: 0,
      duration: 0.1
    });
  });

  window.addEventListener('mouseenter', () => {
    gsap.to(cursor, {
      autoAlpha: 1,
      duration: 0.1
    });
  });
}