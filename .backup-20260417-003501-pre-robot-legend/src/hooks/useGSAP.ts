import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export function useGSAP(callback: (gsap: typeof import('gsap').default, ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger) => void | (() => void), deps: any[] = []) {
  const cleanup = useRef<(() => void) | void>();

  useEffect(() => {
    cleanup.current = callback(gsap, ScrollTrigger);
    return () => {
      if (typeof cleanup.current === 'function') cleanup.current();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, deps);
}

export { gsap, ScrollTrigger };
