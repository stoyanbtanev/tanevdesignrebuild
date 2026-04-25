import { useEffect, useState } from 'react';
import { CONTACT_EMAIL, NAV_LINKS } from './portfolio.config';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>('#home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Track current section in view to set active link
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.replace('#', ''));
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
          .forEach((e) => setActive(`#${(e.target as HTMLElement).id}`));
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.1, 0.4, 0.7] },
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 pointer-events-none">
      <div
        className={[
          'pointer-events-auto inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface px-2 py-2 transition-shadow duration-300',
          scrolled ? 'shadow-md shadow-black/10' : '',
        ].join(' ')}
      >
        <a
          href="#home"
          aria-label="Home"
          className="group relative w-9 h-9 rounded-full p-[1.5px] accent-gradient transition-transform duration-700 hover:scale-110 hover:rotate-180"
        >
          <span className="flex w-full h-full items-center justify-center rounded-full bg-bg font-display italic text-[13px] text-text-primary leading-none">
            ST
          </span>
        </a>

        <span className="hidden sm:block w-px h-5 bg-stroke mx-1" aria-hidden />

        <ul className="flex items-center">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.href;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={[
                    'inline-block text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-colors duration-200',
                    isActive
                      ? 'text-text-primary bg-stroke/50'
                      : 'text-muted hover:text-text-primary hover:bg-stroke/50',
                  ].join(' ')}
                  onClick={() => setActive(link.href)}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        <span className="hidden sm:block w-px h-5 bg-stroke mx-1" aria-hidden />

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="group relative inline-flex items-center text-xs sm:text-sm rounded-full"
        >
          <span
            aria-hidden
            className="absolute -inset-[2px] rounded-full opacity-0 group-hover:opacity-100 accent-gradient-shift transition-opacity duration-300"
          />
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-surface backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 text-text-primary">
            Say hi
            <span aria-hidden className="text-text-primary/70">↗</span>
          </span>
        </a>
      </div>
    </nav>
  );
}
