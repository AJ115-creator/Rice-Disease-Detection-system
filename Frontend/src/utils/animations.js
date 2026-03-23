import { gsap } from 'gsap';

export function animateTabSwitch(element) {
  if (!element) return;
  gsap.fromTo(element,
    { opacity: 0, y: 24, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
  );
}

export function animateResultReveal(element) {
  if (!element) return;
  gsap.fromTo(element,
    { opacity: 0, y: -16, scale: 0.96 },
    { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.4)' }
  );
}

export function animateHistoryItems(elements) {
  if (!elements || elements.length === 0) return;
  gsap.fromTo(elements,
    { opacity: 0, x: -30, scale: 0.97 },
    { opacity: 1, x: 0, scale: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
  );
}

export function animateHeader(element) {
  if (!element) return;
  gsap.fromTo(element,
    { opacity: 0, y: -30 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
  );
}
