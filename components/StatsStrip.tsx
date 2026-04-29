"use client";

import { useEffect, useRef, useState } from "react";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type CounterProps = {
  target: number;
  suffix?: string;
};

function Counter({ target, suffix = "" }: CounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasRun.current) return;
        hasRun.current = true;
        const start = performance.now();
        const duration = 1400;

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setValue(Math.round(target * easeOut(progress)));
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

export function StatsStrip() {
  return (
    <section className="stats-strip page-shell" aria-label="Selected performance counters">
      <div className="stat reveal">
        <Counter target={36} suffix="+" />
        <p>LAUNCHED PAGES</p>
      </div>
      <span className="stat-rule" aria-hidden="true">
        {"//"}
      </span>
      <div className="stat reveal">
        <Counter target={14} suffix="+" />
        <p>LOCAL BRANDS</p>
      </div>
      <span className="stat-rule" aria-hidden="true">
        {"//"}
      </span>
      <div className="stat reveal">
        <Counter target={2026} />
        <p>ACTIVE STUDIO YEAR</p>
      </div>
    </section>
  );
}
