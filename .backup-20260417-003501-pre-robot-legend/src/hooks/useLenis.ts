import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './useGSAP';

function isMobileDevice(): boolean {
  const mobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIPadOS = navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent);
  return mobileUA || isIPadOS;
}

let lenisInstance: Lenis | null = null;

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Disable Lenis on ALL mobile/touch devices.
    // Mobile Chromium (Chrome, Samsung Internet, Edge) uses compositor-thread
    // touch scrolling. Lenis intercepts touch events and forces main-thread scroll,
    // causing jank and broken scroll. Native scroll is superior on mobile.
    if (isMobileDevice()) {
      document.documentElement.style.scrollBehavior = 'smooth';
      window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisInstance = lenis;
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return lenisRef;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}
