import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LOADING_WORDS } from './portfolio.config';

type Props = { onComplete: () => void };

const DURATION_MS = 2700;
const WORD_INTERVAL_MS = 900;

export function LoadingScreen({ onComplete }: Props) {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  // Counter 000 → 100 over DURATION_MS
  useEffect(() => {
    let start: number | null = null;
    let raf = 0;
    const tick = (now: number) => {
      if (start == null) start = now;
      const t = Math.min(1, (now - start) / DURATION_MS);
      setCount(Math.round(t * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Trigger onComplete 400ms after 100 lands
  useEffect(() => {
    if (count < 100) return;
    const id = window.setTimeout(onComplete, 400);
    return () => window.clearTimeout(id);
  }, [count, onComplete]);

  // Cycle words
  useEffect(() => {
    const id = window.setInterval(
      () => setWordIndex((i) => (i + 1) % LOADING_WORDS.length),
      WORD_INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  const word = LOADING_WORDS[wordIndex];

  return (
    <div className="fixed inset-0 z-[9999] bg-bg" aria-hidden>
      {/* Top-left label */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute left-6 top-6 md:left-10 md:top-10 text-xs text-muted uppercase tracking-[0.3em]"
      >
        Portfolio
      </motion.div>

      {/* Center rotating word */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.span
            key={word}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary/80"
          >
            {word}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Bottom-right counter */}
      <div className="absolute right-6 bottom-10 md:right-10 md:bottom-14 text-6xl md:text-8xl lg:text-9xl font-display text-text-primary tabular-nums leading-none">
        {String(count).padStart(3, '0')}
      </div>

      {/* Bottom progress bar */}
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-stroke/50">
        <div
          className="h-full origin-left accent-gradient"
          style={{
            transform: `scaleX(${count / 100})`,
            boxShadow: '0 0 8px rgba(137, 170, 204, 0.35)',
            transition: 'transform 80ms linear',
          }}
        />
      </div>
    </div>
  );
}
