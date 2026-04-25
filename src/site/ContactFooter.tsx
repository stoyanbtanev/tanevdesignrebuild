import { useRef } from 'react';
import { useGSAP } from '@/hooks/useGSAP';
import { useHls } from '@/hooks/useHls';
import {
  CONTACT_EMAIL,
  HERO_VIDEO_SRC,
  MARQUEE_PHRASE,
  SOCIALS,
} from './portfolio.config';

const PHRASE = MARQUEE_PHRASE.repeat(10);

export function ContactFooter() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useHls(videoRef, HERO_VIDEO_SRC, true);

  useGSAP((gsap) => {
    if (!marqueeRef.current) return;
    const tween = gsap.to(marqueeRef.current, {
      xPercent: -50,
      duration: 40,
      ease: 'none',
      repeat: -1,
    });
    return () => {
      tween.kill();
    };
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="relative bg-bg pt-16 md:pt-20 pb-8 md:pb-12 overflow-hidden"
    >
      {/* HLS background video — flipped vertically */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 scale-y-[-1]"
      />
      <div className="absolute inset-0 bg-black/60" aria-hidden />
      <div
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg to-transparent"
        aria-hidden
      />

      {/* Marquee */}
      <div className="relative overflow-hidden py-6 md:py-10 border-y border-stroke/60">
        <div
          ref={marqueeRef}
          className="flex w-max whitespace-nowrap text-text-primary/85 text-5xl md:text-7xl lg:text-8xl font-display italic"
        >
          <span className="px-4">{PHRASE}</span>
          <span className="px-4" aria-hidden>
            {PHRASE}
          </span>
        </div>
      </div>

      {/* CTA block */}
      <div className="relative max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 pt-16 md:pt-24 pb-12 md:pb-16 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex flex-col gap-5 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="block w-8 h-px bg-stroke" aria-hidden />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">
              Reach out
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-text-primary leading-[1.05]">
            Got a project in mind?{' '}
            <span className="font-display italic">Let's build it.</span>
          </h2>
          <p className="text-sm md:text-base text-muted max-w-md">
            One reply within twenty-four hours. No discovery calls that waste
            your morning — just a clear plan.
          </p>
        </div>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="group relative inline-flex items-center self-start text-sm md:text-base rounded-full"
        >
          <span
            aria-hidden
            className="absolute -inset-[2px] rounded-full opacity-0 group-hover:opacity-100 accent-gradient-shift transition-opacity duration-300"
          />
          <span className="relative inline-flex items-center gap-3 rounded-full bg-text-primary text-bg px-7 md:px-9 py-4 md:py-5 group-hover:bg-bg group-hover:text-text-primary transition-colors duration-300">
            {CONTACT_EMAIL}
            <span aria-hidden>↗</span>
          </span>
        </a>
      </div>

      {/* Footer bar */}
      <div className="relative max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 pt-6 border-t border-stroke flex flex-col md:flex-row md:items-center justify-between gap-4">
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.2em]">
          {SOCIALS.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-muted hover:text-text-primary transition-colors duration-200"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted uppercase tracking-[0.2em]">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Available for projects
          </span>
          <span aria-hidden className="block w-px h-3 bg-stroke" />
          <span>© {year} Stoyan Tanev</span>
        </div>
      </div>
    </footer>
  );
}
