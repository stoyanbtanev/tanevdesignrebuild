import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = '404 — tanev.design';
  }, [location.pathname]);

  return (
    <main className="min-h-[100svh] grid place-items-center bg-bg text-text-primary px-6 md:px-10 py-20">
      <div className="text-center max-w-2xl flex flex-col gap-6">
        <div className="flex items-center justify-center gap-3">
          <span className="block w-8 h-px bg-stroke" aria-hidden />
          <span className="text-xs text-muted uppercase tracking-[0.3em]">
            [404] Not found
          </span>
          <span className="block w-8 h-px bg-stroke" aria-hidden />
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight">
          A door that does not <span className="font-display italic">open.</span>
        </h1>
        <p className="text-base text-muted max-w-md mx-auto text-balance">
          The page you tried to reach is not part of this site. It happens. The way back is below.
        </p>
        <div className="mt-2">
          <a
            href="/"
            className="group relative inline-flex items-center text-sm rounded-full"
          >
            <span
              aria-hidden
              className="absolute -inset-[2px] rounded-full opacity-0 group-hover:opacity-100 accent-gradient-shift transition-opacity duration-300"
            />
            <span className="relative inline-flex items-center gap-2 rounded-full bg-text-primary text-bg px-7 py-3.5 group-hover:bg-bg group-hover:text-text-primary transition-colors duration-300">
              Return home
              <span aria-hidden>→</span>
            </span>
          </a>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
