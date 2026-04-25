import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGSAP } from '@/hooks/useGSAP';
import { EXPLORATIONS } from './portfolio.config';

export function Explorations() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const colLeftRef = useRef<HTMLDivElement>(null);
  const colRightRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useGSAP((gsap, ScrollTrigger) => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const left = colLeftRef.current;
    const right = colRightRef.current;
    if (!section || !stage || !left || !right) return;

    const pin = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin: stage,
      pinSpacing: false,
    });

    const parallaxLeft = gsap.fromTo(
      left,
      { yPercent: 35 },
      {
        yPercent: -55,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      }
    );

    const parallaxRight = gsap.fromTo(
      right,
      { yPercent: 55 },
      {
        yPercent: -35,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      }
    );

    return () => {
      pin.kill();
      parallaxLeft.kill();
      parallaxRight.kill();
    };
  }, []);

  const left = EXPLORATIONS.filter((_, i) => i % 2 === 0);
  const right = EXPLORATIONS.filter((_, i) => i % 2 === 1);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[300svh] bg-bg overflow-hidden"
    >
      {/* Pinned stage: text + parallax columns travel together */}
      <div
        ref={stageRef}
        className="h-svh w-full relative overflow-hidden"
      >
        {/* Parallax columns */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="max-w-[1400px] h-full mx-auto px-6 md:px-10 lg:px-16 grid grid-cols-2 gap-12 md:gap-32">
            <div ref={colLeftRef} className="flex flex-col gap-16 md:gap-32 pointer-events-auto will-change-transform">
              {left.map((item, i) => (
                <ExplorationCard
                  key={item.src}
                  src={item.src}
                  alt={item.alt}
                  rotate={i % 2 === 0 ? -3 : 2}
                  onOpen={() => setLightbox(item.src)}
                />
              ))}
            </div>
            <div
              ref={colRightRef}
              className="flex flex-col gap-16 md:gap-32 mt-24 md:mt-48 pointer-events-auto will-change-transform"
            >
              {right.map((item, i) => (
                <ExplorationCard
                  key={item.src}
                  src={item.src}
                  alt={item.alt}
                  rotate={i % 2 === 0 ? 3 : -2}
                  onOpen={() => setLightbox(item.src)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center text */}
        <div className="relative z-10 h-full w-full flex items-center justify-center px-6 pointer-events-none">
          <div className="text-center max-w-xl pointer-events-auto">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="block w-8 h-px bg-stroke" aria-hidden />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">
              Explorations
            </span>
            <span className="block w-8 h-px bg-stroke" aria-hidden />
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl text-text-primary leading-[1.05]">
            Visual <span className="font-display italic">playground</span>
          </h2>
          <p className="text-sm md:text-base text-muted mt-5 mb-8">
            Loose frames, mood, and detail studies — captured between client work.
          </p>
          <a
            href="https://x.com/tanevdesign"
            target="_blank"
            rel="noreferrer noopener"
            className="group relative inline-flex items-center text-sm rounded-full"
          >
            <span
              aria-hidden
              className="absolute -inset-[2px] rounded-full opacity-0 group-hover:opacity-100 accent-gradient-shift transition-opacity duration-300"
            />
            <span className="relative inline-flex items-center gap-2 rounded-full bg-bg border border-stroke text-text-primary px-6 py-3 group-hover:border-transparent transition-colors duration-300">
              See more on X
              <span aria-hidden className="text-text-primary/70">↗</span>
            </span>
          </a>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] grid place-items-center bg-bg/90 backdrop-blur-md p-6"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
          >
            <motion.img
              key={lightbox}
              src={lightbox}
              alt=""
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="max-w-[92vw] max-h-[88svh] object-contain rounded-2xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

type CardProps = {
  src: string;
  alt: string;
  rotate: number;
  onOpen: () => void;
};

function ExplorationCard({ src, alt, rotate, onOpen }: CardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block w-full max-w-[320px] aspect-square overflow-hidden rounded-2xl border border-stroke bg-surface"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-label="Open larger view"
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <span
        aria-hidden
        className="absolute inset-0 ring-0 group-hover:ring-1 ring-text-primary/20 transition-all duration-300 rounded-2xl"
      />
    </button>
  );
}
