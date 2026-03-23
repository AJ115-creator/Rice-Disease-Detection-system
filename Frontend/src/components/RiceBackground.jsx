import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/*
 * Aurora gradient background (pure CSS) + GSAP-animated floating particles (DOM)
 *
 * "dense"  → Login: vivid aurora + many particles + mouse interaction
 * "subtle" → Dashboard: dim aurora + fewer particles
 */

function FloatingParticles({ count, intense }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles = [];
    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const size = intense ? 2 + Math.random() * 4 : 1.5 + Math.random() * 3;
      el.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(17,212,98,${intense ? 0.8 : 0.5}) 0%, rgba(17,212,98,0) 70%);
        pointer-events: none;
        will-change: transform;
      `;
      container.appendChild(el);
      particles.push({ el, size });
    }

    // Animate each particle on a looping path
    particles.forEach((p) => {
      const startX = Math.random() * w();
      const startY = Math.random() * h();
      gsap.set(p.el, { x: startX, y: startY, scale: 0 });

      // Fade in
      gsap.to(p.el, {
        scale: 1,
        duration: 0.8 + Math.random() * 1.2,
        delay: Math.random() * 2,
        ease: 'power2.out',
      });

      // Continuous floating
      const float = () => {
        const duration = 8 + Math.random() * 12;
        gsap.to(p.el, {
          x: Math.random() * w(),
          y: Math.random() * h(),
          duration,
          ease: 'sine.inOut',
          onComplete: float,
        });
      };
      // Stagger start
      gsap.delayedCall(Math.random() * 3, float);

      // Pulsing glow
      gsap.to(p.el, {
        opacity: 0.3 + Math.random() * 0.7,
        scale: 0.6 + Math.random() * 0.8,
        duration: 2 + Math.random() * 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2,
      });
    });

    // Mouse interaction (dense mode only)
    let mouseMoveHandler;
    if (intense) {
      mouseMoveHandler = (e) => {
        particles.forEach((p) => {
          const rect = p.el.getBoundingClientRect();
          const dx = e.clientX - (rect.left + rect.width / 2);
          const dy = e.clientY - (rect.top + rect.height / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const push = (200 - dist) / 200 * 30;
            gsap.to(p.el, {
              x: `+=${-dx / dist * push}`,
              y: `+=${-dy / dist * push}`,
              duration: 0.5,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }
        });
      };
      window.addEventListener('mousemove', mouseMoveHandler);
    }

    return () => {
      if (mouseMoveHandler) window.removeEventListener('mousemove', mouseMoveHandler);
      particles.forEach((p) => {
        gsap.killTweensOf(p.el);
        p.el.remove();
      });
    };
  }, [count, intense]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
    />
  );
}

export default function RiceBackground({ variant = 'dense' }) {
  const isDense = variant === 'dense';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Aurora gradient blobs — pure CSS animation */}
      <div className="aurora-wrap">
        <div
          className="aurora-blob aurora-1"
          style={{ '--aurora-color': isDense ? 'rgba(17,212,98,0.35)' : 'rgba(17,212,98,0.15)' }}
        />
        <div
          className="aurora-blob aurora-2"
          style={{ '--aurora-color': isDense ? 'rgba(24,220,106,0.3)' : 'rgba(24,220,106,0.1)' }}
        />
        <div
          className="aurora-blob aurora-3"
          style={{ '--aurora-color': isDense ? 'rgba(121,210,158,0.25)' : 'rgba(121,210,158,0.08)' }}
        />
        <div
          className="aurora-blob aurora-4"
          style={{ '--aurora-color': isDense ? 'rgba(52,168,83,0.2)' : 'rgba(52,168,83,0.06)' }}
        />
      </div>

      {/* GSAP-driven floating particles */}
      <FloatingParticles count={isDense ? 40 : 15} intense={isDense} />
    </div>
  );
}
