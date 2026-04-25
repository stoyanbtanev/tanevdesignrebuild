import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@/hooks/useGSAP';
import { useHls } from '@/hooks/useHls';
import { CONTACT_EMAIL, HERO_VIDEO_SRC, ROLES } from './portfolio.config';

type Props = { ready: boolean };

export function HeroSection({ ready }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [roleIndex, setRoleIndex] = useState(0);

  useHls(videoRef, HERO_VIDEO_SRC, true);

  useEffect(() => {
    const id = window.setInterval(
      () => setRoleIndex((i) => (i + 1) % ROLES.length),
      2000,
    );
    return () => window.clearInterval(id);
  }, []);

  useGSAP((gsap) => {
    if (!ready) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(
      '.hero-name',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2 },
      0.1,
    );
    tl.fromTo(
      '.hero-blur',
      { opacity: 0, filter: 'blur(10px)', y: 20 },
      { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, stagger: 0.1 },
      0.3,
    );
  }, [ready]);

  const role = ROLES[roleIndex];

  return (
    <section
      id="home"
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden"
    >
      {/* HLS background video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/20" aria-hidden />
      <div
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent"
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <span
          className="hero-blur text-xs text-muted uppercase tracking-[0.3em] mb-8"
          style={{ opacity: 0, filter: 'blur(10px)', willChange: 'transform, filter, opacity' }}
        >
          COLLECTION '26
        </span>

        <h1
          className="hero-name text-6xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-6"
          style={{ opacity: 0, transform: 'translateY(50px)', willChange: 'transform, opacity' }}
        >
          Stoyan Tanev
        </h1>

        <p
          className="hero-blur text-base md:text-lg text-text-primary/85 mb-4"
          style={{ opacity: 0, filter: 'blur(10px)', willChange: 'transform, filter, opacity' }}
        >
          A{' '}
          <span
            key={roleIndex}
            className="font-display italic text-text-primary animate-role-fade-in inline-block"
          >
            {role}
          </span>{' '}
          based in Plovdiv.
        </p>

        <p
          className="hero-blur text-sm md:text-base text-muted max-w-md mb-12 text-balance"
          style={{ opacity: 0, filter: 'blur(10px)', willChange: 'transform, filter, opacity' }}
        >
          Custom websites, brand, motion and SEO. One person, end to end —
          working worldwide from Plovdiv, Bulgaria.
        </p>

        <div
          className="hero-blur inline-flex flex-wrap items-center justify-center gap-4"
          style={{ opacity: 0, filter: 'blur(10px)', willChange: 'transform, filter, opacity' }}
        >
          <HeroCta variant="solid" href="#work">
            See work
          </HeroCta>
          <HeroCta variant="outline" href={`mailto:${CONTACT_EMAIL}`}>
            Reach out
            <span aria-hidden className="ml-1.5 text-text-primary/70">↗</span>
          </HeroCta>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        <span className="text-[10px] md:text-xs text-muted uppercase tracking-[0.2em]">
          Scroll
        </span>
        <div className="relative w-px h-10 bg-stroke overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1/2 accent-gradient animate-scroll-down" />
        </div>
      </div>
    </section>
  );
}

type CtaProps = {
  href: string;
  variant: 'solid' | 'outline';
  children: React.ReactNode;
};

function HeroCta({ href, variant, children }: CtaProps) {
  const isSolid = variant === 'solid';
  const isMail = href.startsWith('mailto:');
  return (
    <a
      href={href}
      target={isMail ? undefined : '_self'}
      className="group relative inline-flex items-center text-sm rounded-full transition-transform duration-300 hover:scale-[1.03]"
    >
      <span
        aria-hidden
        className="absolute -inset-[2px] rounded-full opacity-0 group-hover:opacity-100 accent-gradient-shift transition-opacity duration-300"
      />
      <span
        className={[
          'relative inline-flex items-center rounded-full px-7 py-3.5 transition-colors duration-300',
          isSolid
            ? 'bg-text-primary text-bg group-hover:bg-bg group-hover:text-text-primary'
            : 'bg-bg text-text-primary border-2 border-stroke group-hover:border-transparent',
        ].join(' ')}
      >
        {children}
      </span>
    </a>
  );
}
