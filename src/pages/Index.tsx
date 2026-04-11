import { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage, T } from '@/contexts/LanguageContext';
import { useGSAP, gsap, ScrollTrigger } from '@/hooks/useGSAP';
import { useLenis, getLenis } from '@/hooks/useLenis';

const NavLogo = () => (
  <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="19" fontFamily="'Clash Display', sans-serif" fontWeight="600" fontSize="20" fill="#F5F3EF" letterSpacing="-0.5">T</text>
    <rect x="14.5" y="1" width="2" height="22" rx="1" fill="#E8241A" transform="rotate(12 15.5 12)"/>
    <text x="18" y="19" fontFamily="'Clash Display', sans-serif" fontWeight="600" fontSize="20" fill="#F5F3EF" letterSpacing="-0.5">D</text>
  </svg>
);

// ─── PRELOADER ───
function Preloader({ onComplete }: { onComplete: () => void }) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));

  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(true);
  const minTimeElapsed = useRef(false);
  const assetsLoaded = useRef(false);

  useEffect(() => {
    // Minimum display time for smooth animation
    const timer = setTimeout(() => { minTimeElapsed.current = true; tryAnimate(); }, isMobile ? 1200 : 2500);
    
    // Track image loading
    const images = document.querySelectorAll('.preloader__cell img');
    let loaded = 0;
    const total = images.length;
    
    const onLoad = () => {
      loaded++;
      if (progressRef.current) {
        progressRef.current.style.width = `${(loaded / total) * 100}%`;
      }
      if (loaded >= total) {
        assetsLoaded.current = true;
        tryAnimate();
      }
    };
    
    images.forEach(img => {
      if ((img as HTMLImageElement).complete) onLoad();
      else {
        img.addEventListener('load', onLoad);
        img.addEventListener('error', onLoad);
      }
    });

    function tryAnimate() {
      if (!minTimeElapsed.current || !assetsLoaded.current) return;
      runExitAnimation();
    }

    function runExitAnimation() {
      const el = containerRef.current;
      const cells = gridRef.current?.querySelectorAll('.preloader__cell');
      const logo = logoRef.current;
      if (!el || !cells || !logo) return;

      const tl = gsap.timeline();

      if (isMobile) {
        // Lightweight exit: no scatter transforms, GPU-friendly opacity only
        tl.to(logo, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);
        tl.to('.preloader__domain', { opacity: 0, duration: 0.2 }, 0);
        tl.to(cells, { opacity: 0, duration: 0.35, stagger: 0.03, ease: 'power2.in' }, 0.05);
        tl.to(el, {
          opacity: 0, duration: 0.3, ease: 'none',
          onComplete: () => { setShow(false); onComplete(); }
        }, '-=0.15');
      } else {
        // Desktop: original scatter animation
        const scatterDirections = [
          { x: -60, y: -40 }, { x: -20, y: -50 }, { x: 20, y: -50 }, { x: 60, y: -40 },
          { x: -60, y: 40 },  { x: 60, y: 40 },   { x: -40, y: 50 }, { x: 40, y: 50 }
        ];

        cells.forEach((cell, i) => {
          const dir = scatterDirections[i] || { x: 0, y: -30 };
          tl.to(cell, {
            x: dir.x, y: dir.y, opacity: 0, scale: 0.92,
            duration: 0.7, ease: 'power3.in'
          }, i === 0 ? 0 : '<0.04');
        });

        tl.to(logo, { scale: 1.15, opacity: 0, duration: 0.6, ease: 'power2.in' }, '<0.1');
        tl.to('.preloader__domain', { opacity: 0, y: 10, duration: 0.3, ease: 'power2.in' }, '<');
        tl.to(el, {
          opacity: 0, duration: 0.4, ease: 'none',
          onComplete: () => { setShow(false); onComplete(); }
        }, '-=0.4');
      }
    }

    // Safety net
    const safety = setTimeout(() => {
      if (containerRef.current) {
        gsap.to(containerRef.current, { opacity: 0, duration: 0.4, onComplete: () => { setShow(false); onComplete(); } });
      }
    }, isMobile ? 3000 : 6000);

    return () => { clearTimeout(timer); clearTimeout(safety); };
  }, [onComplete]);

  // Entrance animation
  useEffect(() => {
    const cells = gridRef.current?.querySelectorAll('.preloader__cell');
    const logo = logoRef.current;
    if (!cells || !logo) return;

    if (isMobile) {
      // Simple fade-up entrance on mobile — no clip-path (GPU-intensive)
      gsap.set(cells, { opacity: 0, y: 20 });
      gsap.set('.preloader__domain', { opacity: 0 });

      const tl = gsap.timeline();
      tl.to(progressRef.current, { width: '100%', duration: 1.1, ease: 'power2.inOut' }, 0);
      tl.to(logo, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.1);
      tl.to('.preloader__domain', { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.15);
      tl.to(cells, { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: 'power2.out' }, 0.1);
    } else {
      // Desktop: original clip-path entrance
      gsap.set(cells, { clipPath: 'inset(100% 0 0 0)' });
      gsap.set('.preloader__cell img', { scale: 1.3 });
      gsap.set('.preloader__domain', { opacity: 0 });

      const tl = gsap.timeline();
      tl.to(progressRef.current, { width: '100%', duration: 2.4, ease: 'power2.inOut' }, 0);
      tl.to(logo, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.1);
      tl.to('.preloader__domain', { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.2);

      cells.forEach((cell, i) => {
        const img = cell.querySelector('img');
        const startTime = 0.15 + i * 0.18;
        tl.to(cell, { clipPath: 'inset(0% 0 0 0)', duration: 0.6, ease: 'power3.inOut' }, startTime);
        if (img) tl.to(img, { scale: 1, duration: 1.2, ease: 'power2.out' }, startTime);
      });
    }
  }, []);

  if (!show) return null;

  return (
    <div className="preloader" ref={containerRef}>
      <div className="preloader__grid" ref={gridRef}>
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="preloader__cell">
            <img src={`/${i}.png`} alt="" />
          </div>
        ))}
      </div>
      <div className="preloader__logo" ref={logoRef}>
        <span className="pl-t">T</span>
        <div className="pl-slash"></div>
        <span className="pl-d">D</span>
      </div>
      <div className="preloader__progress" ref={progressRef}></div>
      <span className="preloader__domain">tanev.design</span>
    </div>
  );
}

// ─── NAVIGATION ───
function Navigation() {
  const { lang, setLang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 80);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMenu = () => {
    const lenis = getLenis();
    if (!menuOpen) lenis?.stop();
    else lenis?.start();
    setMenuOpen(!menuOpen);
  };

  const closeAndNavigate = () => {
    setMenuOpen(false);
    getLenis()?.start();
  };

  return (
    <>
      <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <a href="#hero" className="nav__logo" aria-label="tanev.design — back to top">
          <NavLogo />
        </a>
        <div className="nav__links">
          <a href="#styles"><T en="Work" bg="Проекти" /></a>
          <a href="#services"><T en="Services" bg="Услуги" /></a>
          <a href="#faq"><T en="FAQ" bg="Въпроси" /></a>
          <a href="#contact"><T en="Contact" bg="Контакт" /></a>
        </div>
        <div className="nav__divider"></div>
        <div className="nav__lang">
          <button className={lang === 'bg' ? 'active' : ''} onClick={() => setLang('bg')}>BG</button>
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
        </div>
        <button className="nav__hamburger" onClick={toggleMenu}>☰</button>
      </nav>

      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`}>
        <button className="menu-overlay__close" onClick={toggleMenu}>Close</button>
        <a href="#hero" className="menu-overlay__link" onClick={closeAndNavigate}><T en="HOME" bg="НАЧАЛО" /></a>
        <a href="#about" className="menu-overlay__link" onClick={closeAndNavigate}><T en="MISSION" bg="МИСИЯ" /></a>
        <a href="#services" className="menu-overlay__link" onClick={closeAndNavigate}><T en="SERVICES" bg="УСЛУГИ" /></a>
        <a href="#styles" className="menu-overlay__link" onClick={closeAndNavigate}><T en="AESTHETICS" bg="ЕСТЕТИКА" /></a>
        <a href="#faq" className="menu-overlay__link" onClick={closeAndNavigate}><T en="FAQ" bg="ВЪПРОСИ" /></a>
        <a href="#contact" className="menu-overlay__link" onClick={closeAndNavigate}><T en="CONTACT" bg="КОНТАКТ" /></a>
      </div>
    </>
  );
}

// ─── HERO ───
function Hero() {
  const floatingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Split headline text for char animation
    document.querySelectorAll('.hero__headline span.en-text, .hero__headline span.bg-text').forEach(el => {
      const text = el.textContent || '';
      el.innerHTML = '';
      text.split('').forEach(char => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        el.appendChild(span);
      });
    });
  }, []);

  // Parallax floating
  useEffect(() => {
    const container = floatingRef.current;
    if (!container) return;
    const els = container.querySelectorAll<HTMLElement>('[data-depth]');
    const sensitivity = 1;
    const easingFactor = 0.05;
    let mouse = { x: 0, y: 0 };
    const elState = new Map<Element, { currentX: number; currentY: number; targetX: number; targetY: number }>();
    els.forEach(el => elState.set(el, { currentX: 0, currentY: 0, targetX: 0, targetY: 0 }));

    const heroEl = container.closest('.hero');
    if (!heroEl) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = heroEl.getBoundingClientRect();
      mouse.x = e.clientX - rect.left - rect.width / 2;
      mouse.y = e.clientY - rect.top - rect.height / 2;
    };
    const onMouseLeave = () => { mouse.x = 0; mouse.y = 0; };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const rect = heroEl.getBoundingClientRect();
      mouse.x = t.clientX - rect.left - rect.width / 2;
      mouse.y = t.clientY - rect.top - rect.height / 2;
    };
    const onTouchEnd = () => { mouse.x = 0; mouse.y = 0; };

    heroEl.addEventListener('mousemove', onMouseMove as any);
    heroEl.addEventListener('mouseleave', onMouseLeave);
    heroEl.addEventListener('touchmove', onTouchMove as any, { passive: true });
    heroEl.addEventListener('touchend', onTouchEnd);

    let rafId: number;
    function animate() {
      els.forEach(el => {
        const depth = parseFloat(el.dataset.depth || '1');
        const strength = (depth * sensitivity) / 20;
        const state = elState.get(el)!;
        state.targetX = mouse.x * strength;
        state.targetY = mouse.y * strength;
        state.currentX += (state.targetX - state.currentX) * easingFactor;
        state.currentY += (state.targetY - state.currentY) * easingFactor;
        el.style.transform = `translate3d(${state.currentX}px, ${state.currentY}px, 0)`;
      });
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      heroEl.removeEventListener('mousemove', onMouseMove as any);
      heroEl.removeEventListener('mouseleave', onMouseLeave);
      heroEl.removeEventListener('touchmove', onTouchMove as any);
      heroEl.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <section className="hero" id="hero">
      <div className="hero__floating" id="heroFloating" ref={floatingRef}>
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="hero__float-el" data-depth={[0.5,1,2,1,1,2,4,1][i-1]}>
            <img src={`/${i}.png`} alt={`Design sample ${i}`} loading="eager" />
          </div>
        ))}
      </div>
      <div className="hero__content">
        <div className="hero__headline">
          <span className="line-wrapper"><T en="YOUR NEXT WEBSITE." bg="СЛЕДВАЩИЯТ ТИ САЙТ." /></span>
        </div>
        <div className="hero__headline">
          <span className="line-wrapper"><T en="NO COMPROMISE." bg="БЕЗ КОМПРОМИСИ." /></span>
        </div>
        <p className="hero__sub">
          <T en="ONE PERSON. EVERY DETAIL CONSIDERED." bg="ЕДИН ЧОВЕК. ВСЕКИ ДЕТАЙЛ — ОБМИСЛЕН." />
        </p>
        <a href="#contact" className="hero__cta"><T en="LET'S TALK ↗" bg="ПИШИ МИ ↗" /></a>
      </div>
      <div className="hero__bottom">
        <span className="label"><T en="PLOVDIV, BULGARIA" bg="ПЛОВДИВ, БЪЛГАРИЯ" /></span>
        <div className="hero__scroll">
          <span>SCROLL</span>
          <div className="hero__scroll-line"></div>
        </div>
      </div>
    </section>
  );
}

// ─── MISSION ───
function Mission() {
  const lines = [
    { align: 'left' as const, en: 'I WORK ALONE.', bg: 'РАБОТЯ САМ.' },
    { align: 'right' as const, en: 'NO HANDOFFS. NO MIDDLEMEN.', bg: 'БЕЗ ПОСРЕДНИЦИ. БЕЗ ПРЕДАВАНИЯ.' },
    { align: 'left' as const, en: 'YOUR PROJECT GETS', bg: 'ПРОЕКТЪТ ТИ ПОЛУЧАВА' },
    { align: 'right' as const, en: 'MY FULL ATTENTION.', bg: 'ЦЯЛОТО МИ ВНИМАНИЕ.' },
    { align: 'left' as const, en: 'NO DELAYS.', bg: 'БЕЗ ЗАКЪСНЕНИЯ.' },
    { align: 'right' as const, en: 'NO EXCUSES.', bg: 'БЕЗ ИЗВИНЕНИЯ.' },
    { align: 'left' as const, en: 'JUST THE WORK.', bg: 'САМО РАБОТАТА.' },
    { align: 'right' as const, en: 'DONE PROPERLY.', bg: 'НАПРАВЕНА КАКТО ТРЯБВА.' },
  ];

  return (
    <section className="mission" id="about">
      <span className="label mission__label"><T en="MISSION" bg="МИСИЯ" /></span>
      <div className="mission__lines">
        {lines.map((line, i) => (
          <div key={i} className="mission__line-wrap">
            <div className={`mission__line mission__line--${line.align}`}>
              <T en={line.en} bg={line.bg} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── STATS BAR ───
function StatsBar() {
  return (
    <section className="stats-bar">
      <div className="stats-bar__inner">
        <div className="stats-bar__item">
          <div className="stats-bar__number" data-target="1" data-suffix="">1</div>
          <div className="stats-bar__label"><T en="PERSON. START TO FINISH." bg="ЧОВЕК. ОТ НАЧАЛО ДО КРАЙ." /></div>
        </div>
        <div className="stats-bar__divider"></div>
        <div className="stats-bar__item">
          <div className="stats-bar__number" data-target="24" data-suffix="">24</div>
          <div className="stats-bar__label"><T en="VISUAL DIRECTIONS" bg="ВИЗУАЛНИ ПОСОКИ" /></div>
        </div>
        <div className="stats-bar__divider"></div>
        <div className="stats-bar__item">
          <div className="stats-bar__number" data-target="100" data-suffix="%">100%</div>
          <div className="stats-bar__label"><T en="CUSTOM CODE" bg="АВТОРСКИ КОД" /></div>
        </div>
      </div>
    </section>
  );
}

// ─── SERVICES ───
function Services() {
  const services = [
    { num: '01', titleEn: 'STATIC SITES — FAST BY DEFAULT', titleBg: 'СТАТИЧНИ САЙТОВЕ — БЪРЗИ ПО ПОДРАЗБИРАНЕ', descEn: 'Loads in under a second. Converts before they think twice. No page builders. No shortcuts.', descBg: 'Зарежда се за секунда. Конвертира, преди да се замислят. Без конструктори. Без кръпки.' },
    { num: '02', titleEn: '3D & MOTION — BUILT TO REMEMBER', titleBg: '3D И ДВИЖЕНИЕ — НАПРАВЕНИ ДА ЗАПОМНИШ', descEn: "The kind of site people send their friends at 2 AM. WebGL & GSAP — not templates.", descBg: 'Сайтът, който хората пращат на приятелите си в 2 сутринта. WebGL и GSAP — без шаблони.' },
    { num: '03', titleEn: 'BRAND IDENTITY — YOUR VISUAL DNA', titleBg: 'БРАНДИНГ — ТВОЯТА ВИЗУАЛНА ДНК', descEn: "Your brand shouldn't look like your competitor's. Logo, type, color — crafted to be instantly yours.", descBg: 'Брандът ти не трябва да прилича на конкурента. Лого, шрифт, цвят — създадени да бъдат разпознаваемо твои.' },
    { num: '04', titleEn: 'VIDEO — STOPS THE SCROLL', titleBg: 'ВИДЕО — СПИРА СКРОЛА', descEn: 'Edited to capture attention instantly. Short-form, long-form, product — whatever the format, it delivers.', descBg: 'Монтирано да грабне вниманието от първия кадър. Кратко, дълго, продуктово — форматът е подчинен на резултата.' },
    { num: '05', titleEn: 'SEO — VISIBILITY THAT COMPOUNDS', titleBg: 'SEO — ВИДИМОСТ, КОЯТО РАСТЕ', descEn: 'When your clients search, they find you — not the competition. On-page SEO built into every project.', descBg: 'Когато клиентите ти търсят — намират теб, не конкуренцията. SEO, вградено във всеки проект.' },
    { num: '06', titleEn: 'FULL REDESIGN — CLEAN SLATE', titleBg: 'ПЪЛЕН РЕДИЗАЙН — ОТ НУЛАТА', descEn: "If you're embarrassed to share your own site — it's time. Total rebuild. No compromises with the old version.", descBg: 'Ако се притесняваш да покажеш сайта си — дойде моментът. Пълна подмяна. Без компромиси със старото.' },
  ];

  return (
    <section className="horizontal-services" id="services">
      <span className="label" style={{ position: 'absolute', top: 40, left: 40, zIndex: 10 }}><T en="SERVICES" bg="УСЛУГИ" /></span>
      <div className="hz-wrapper">
        <div className="hz-container">
          {services.map(s => (
            <div key={s.num} className="hz-panel">
              <div className="hz-panel-num">{s.num}</div>
              <div className="hz-panel-title"><T en={s.titleEn} bg={s.titleBg} /></div>
              <div className="hz-panel-desc"><T en={s.descEn} bg={s.descBg} /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PROCESS ───
function Process() {
  const steps = [
    { num: '01', titleEn: 'BRIEF', titleBg: 'БРИФ', descEn: 'You fill the form. I study your world — not just your industry.', descBg: 'Попълваш формата. Аз проучвам твоя свят — не само бранша.', icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="5" y="3" width="22" height="26" rx="2" stroke="currentColor" strokeWidth="1.5"/><line x1="10" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.5"/><line x1="10" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.5"/><line x1="10" y1="20" x2="18" y2="20" stroke="currentColor" strokeWidth="1.5"/></svg> },
    { num: '02', titleEn: 'DESIGN', titleBg: 'ДИЗАЙН', descEn: 'First visual direction lands in your inbox. Fast.', descBg: 'Първата визуална посока пристига бързо.', icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M6 26L10 22L24 8L28 12L14 26L6 26Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><line x1="21" y1="11" x2="25" y2="15" stroke="currentColor" strokeWidth="1.5"/></svg> },
    { num: '03', titleEn: 'BUILD', titleBg: 'РАЗРАБОТКА', descEn: 'Pixel-perfect, animated, fast. Every detail considered.', descBg: 'Пиксел-перфектно, анимирано, бързо. Всеки детайл — обмислен.', icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><polyline points="9,12 4,16 9,20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="23,12 28,16 23,20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="19" y1="8" x2="13" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
    { num: '04', titleEn: 'LAUNCH', titleBg: 'ПУСКАНЕ', descEn: 'Goes live. You keep 100% ownership of everything.', descBg: 'Пуска се на живо. Запазваш 100% собственост над всичко.', icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 28V16M16 16L10 22M16 16L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 12C6.5 10.8 5 8.5 6 6C7 3.5 10 4 11.5 5.5C12.5 3 14 2 16 2C18 2 19.5 3 20.5 5.5C22 4 25 3.5 26 6C27 8.5 25.5 10.8 24 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  ];

  return (
    <section className="process-section">
      <span className="label process-section__label"><T en="/ HOW IT WORKS" bg="/ КАК РАБОТЯ" /></span>
      <div className="process-track">
        {steps.map((step, i) => (
          <React.Fragment key={step.num}>
            {i > 0 && (
              <div className="process-connector">
                <svg className="process-line" viewBox="0 0 120 2" preserveAspectRatio="none">
                  <line x1="0" y1="1" x2="120" y2="1" stroke="var(--td-accent)" strokeWidth="1.5" strokeDasharray="6 4"/>
                </svg>
              </div>
            )}
            <div className="process-step">
              <div className="process-step__num">{step.num}</div>
              <div className="process-step__icon">{step.icon}</div>
              <div className="process-step__title"><T en={step.titleEn} bg={step.titleBg} /></div>
              <div className="process-step__desc"><T en={step.descEn} bg={step.descBg} /></div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

// ─── ARSENAL ───
function Arsenal() {
  const lensRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const lens = lensRef.current;
    const base = baseRef.current;
    const reveal = revealRef.current;
    if (!viewport || !lens || !base || !reveal) return;

    const LENS_SIZE = 92;
    let isDragging = false;
    let lx = 0, ly = 0;
    let startPX = 0, startPY = 0, startLX = 0, startLY = 0;

    function applyLens(x: number, y: number) {
      lx = x; ly = y;
      const cx = `calc(50% + ${lx - 10}px)`;
      const cy = `calc(50% + ${ly - 10}px)`;
      lens!.style.transform = `translate(calc(-50% + ${lx}px), calc(-50% + ${ly}px))`;
      const maskVal = `radial-gradient(circle 30px at ${cx} ${cy}, transparent 100%, black 100%)`;
      base!.style.maskImage = maskVal;
      base!.style.webkitMaskImage = maskVal;
      reveal!.style.clipPath = `circle(30px at ${cx} ${cy})`;
    }

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      startPX = e.clientX; startPY = e.clientY;
      startLX = lx; startLY = ly;
      lens!.classList.add('dragging');
      lens!.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const rect = viewport!.getBoundingClientRect();
      const halfW = (rect.width - LENS_SIZE) / 2;
      const halfH = (rect.height - LENS_SIZE) / 2;
      let nx = startLX + (e.clientX - startPX);
      let ny = startLY + (e.clientY - startPY);
      nx = Math.max(-halfW, Math.min(halfW, nx));
      ny = Math.max(-halfH, Math.min(halfH, ny));
      applyLens(nx, ny);
    };
    const onPointerUp = () => { isDragging = false; lens!.classList.remove('dragging'); };

    lens.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

    return () => {
      lens.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  const baseTags = [
    ['Next.js', 'React', 'Tailwind CSS', 'TypeScript', 'Framer Motion'],
    ['Figma', 'VS Code', 'GitHub', 'Vercel', 'Cursor'],
    ['Claude', 'ChatGPT', 'Node.js', 'Supabase', 'Photoshop'],
  ];

  const MagnifyingSvg = () => (
    <svg width="92" height="92" viewBox="0 0 512 512" fill="none">
      <path d="M365.424 335.392L342.24 312.192L311.68 342.736L334.88 365.936L365.424 335.392Z" fill="#B0BDC6"/>
      <path d="M358.08 342.736L334.88 319.552L319.04 335.392L342.24 358.584L358.08 342.736Z" fill="#DFE9EF"/>
      <path d="M352.368 321.808L342.752 312.192L312.208 342.752L321.824 352.36L352.368 321.808Z" fill="#B0BDC6"/>
      <path d="M332 332C260 404 142.4 404 69.6001 332C-2.3999 260 -2.3999 142.4 69.6001 69.6C141.6 -3.20003 259.2 -2.40002 332 69.6C404.8 142.4 404.8 260 332 332ZM315.2 87.2C252 24 150.4 24 88.0001 87.2C24.8001 150.4 24.8001 252 88.0001 314.4C151.2 377.6 252.8 377.6 315.2 314.4C377.6 252 377.6 150.4 315.2 87.2Z" fill="#DFE9EF"/>
      <path d="M319.2 319.2C254.4 384 148.8 384 83.2001 319.2C18.4001 254.4 18.4001 148.8 83.2001 83.2C148 18.4 253.6 18.4 319.2 83.2C384 148.8 384 254.4 319.2 319.2ZM310.4 92C250.4 32 152 32 92.0001 92C32.0001 152 32.0001 250.4 92.0001 310.4C152 370.4 250.4 370.4 310.4 310.4C370.4 250.4 370.4 152 310.4 92Z" fill="#7A858C"/>
      <path d="M484.104 428.784L373.8 318.472L318.36 373.912L428.672 484.216L484.104 428.784Z" fill="#333333"/>
      <path d="M471.664 441.224L361.344 330.928L330.8 361.48L441.12 471.76L471.664 441.224Z" fill="#575B5E"/>
      <path d="M495.2 423.2C504 432 432.8 504 423.2 495.2L417.6 489.6C408.8 480.8 480 408.8 489.6 417.6L495.2 423.2Z" fill="#B0BDC6"/>
      <path d="M483.2 435.2C492 444 444.8 492 435.2 483.2L429.6 477.6C420.8 468.8 468 420.8 477.6 429.6L483.2 435.2Z" fill="#DFE9EF"/>
    </svg>
  );

  return (
    <section className="arsenal-section" id="arsenal">
      <div className="arsenal-grid">
        <div className="arsenal-text">
          <p className="arsenal-eyebrow"><T en="The Stack" bg="Стекът" /></p>
          <h2 className="arsenal-h2"><T en="Modern tools. Serious output." bg="Модерни инструменти. Сериозен резултат." /></h2>
          <p className="arsenal-sub"><T en="Every project ships with a hand-picked, production-grade stack." bg="Всеки проект се изгражда с внимателно подбран, професионален стек." /></p>
        </div>
        <div className="bento-card">
          <div className="bento-viewport" ref={viewportRef}>
            <div className="bento-base" ref={baseRef}>
              {baseTags.map((row, i) => (
                <div key={i} className={`bento-row-track ${i % 2 === 0 ? 'dir-left' : 'dir-right'}`}>
                  {[...row, ...row, ...row].map((tag, j) => <span key={j} className="bento-tag">{tag}</span>)}
                </div>
              ))}
            </div>
            <div className="bento-reveal" ref={revealRef}>
              {baseTags.map((row, i) => (
                <div key={i} className={`bento-row-track ${i % 2 === 0 ? 'dir-left' : 'dir-right'}`}>
                  {[...row, ...row, ...row].map((tag, j) => <span key={j} className="bento-tag">{tag}</span>)}
                </div>
              ))}
            </div>
            <div className="bento-lens" ref={lensRef}>
              <div className="bento-lens-inner">
                <MagnifyingSvg />
                <div className="bento-lens-glare"></div>
              </div>
            </div>
            <div className="bento-fade bento-fade-left"></div>
            <div className="bento-fade bento-fade-right"></div>
          </div>
          <div className="bento-footer">
            <h3><T en="Built with the right tools" bg="Направено с правилните инструменти" /></h3>
            <p><T en="Every site is crafted with a modern stack — fast to ship, built to last." bg="Всеки сайт е изграден с модерен стек — бързо, стабилно и за дълго." /></p>
          </div>
        </div>
      </div>
      <div className="arsenal-cards">
        <div className="arsenal-card">
          <div className="arsenal-card-label"><T en="AI Models" bg="AI Модели" /></div>
          <div className="arsenal-pills">
            {['Claude','ChatGPT','Gemini','Cursor','v0','Midjourney','Windsurf'].map(t => <span key={t} className="arsenal-pill">{t}</span>)}
          </div>
        </div>
        <div className="arsenal-card">
          <div className="arsenal-card-label"><T en="Development" bg="Разработка" /></div>
          <div className="arsenal-pills">
            {['Next.js','React','Tailwind CSS','Vercel','GitHub','Node.js','GSAP'].map(t => <span key={t} className="arsenal-pill">{t}</span>)}
          </div>
        </div>
        <div className="arsenal-card">
          <div className="arsenal-card-label"><T en="Design" bg="Дизайн" /></div>
          <div className="arsenal-pills">
            {['Figma','Photoshop','Illustrator','After Effects','Canva'].map(t => <span key={t} className="arsenal-pill">{t}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── STYLES UNIVERSE ───
function StylesUniverse() {
  const [view, setView] = useState<'compact' | 'masonry'>('compact');

  const handleToggle = (v: 'compact' | 'masonry') => {
    setView(v);
    setTimeout(() => ScrollTrigger.refresh(), 100);
  };

  return (
    <section className="styles-section" id="styles">
      <span className="label" style={{ display: 'block', marginBottom: 24, textAlign: 'center' }}>/ <T en="AESTHETICS" bg="ЕСТЕТИКА" /></span>
      <div className="styles-section__intro">
        <h2><T en="24 DIRECTIONS. ONE STANDARD." bg="24 ПОСОКИ. ЕДИН СТАНДАРТ." /></h2>
        <p><T en="These are starting points — not a menu. Every project gets its own direction." bg="Това са отправни точки — не каталог. Всеки проект получава собствена посока." /></p>
      </div>
      <div className="styles-toggle">
        <button className={view === 'compact' ? 'active' : ''} onClick={() => handleToggle('compact')}><T en="Grid" bg="Мрежа" /></button>
        <button className={view === 'masonry' ? 'active' : ''} onClick={() => handleToggle('masonry')}><T en="Showcase" bg="Витрина" /></button>
      </div>
      <div className={`universe ${view === 'compact' ? 'universe--compact' : ''}`}>
        {/* 1. Neo-Minimal */}
        <div className="style-card card-minimal">
          <div className="m-eyebrow">✦ &nbsp; <T en="Refined" bg="Изчистено" /> &nbsp; ✦</div>
          <div className="m-headline"><T en="The Art of Saying Less" bg="Изкуството да казваш малко" /></div>
          <div className="m-rule"></div>
          <div className="m-body"><T en="Zero noise. Pure function. The aesthetic of ruthless elegance." bg="Нулев шум. Чиста функция. Естетиката на безпощадната елегантност." /></div>
          <button className="m-btn"><T en="Explore →" bg="Разгледай →" /></button>
          <span className="style-badge">Neo-Minimal</span>
        </div>
        {/* 2. Cyberpunk */}
        <div className="style-card card-cyberpunk">
          <div className="cy-topline"></div><div className="cy-corner"></div><div className="cy-corner2"></div>
          <div className="cy-headline"><T en="NEURAL INTERFACE" bg="НЕВРОНЕН ИНТЕРФЕЙС" /><span className="blink">_</span></div>
          <div className="cy-sub"><T en="High-tech, low-life. Neon grids and rogue AI terminals." bg="Висока технология, нисък живот. Неонови мрежи и AI в бунт." /></div>
          <span className="style-badge">Cyberpunk</span>
        </div>
        {/* 3. Art Deco */}
        <div className="style-card card-artdeco">
          <div className="ad-ornament">◆ &ensp; ◇ &ensp; ◆</div>
          <div className="ad-headline"><T en="The Grand Salon" bg="Гранд Салонът" /></div>
          <div className="ad-sub"><T en="The Great Gatsby, digitized. Unapologetic geometry and gold." bg="Великият Гетсби, дигитализиран. Безупречна геометрия и злато." /></div>
          <span className="style-badge">Art Deco</span>
        </div>
        {/* 4-24 abbreviated for size — using same pattern */}
        <div className="style-card card-paper">
          <div className="pk-stamp">✦ &nbsp; <T en="Handcrafted" bg="Ръчно" /> &nbsp;—&nbsp; Vol. I</div>
          <div className="pk-headline"><T en="Written in Ink" bg="Написано с мастило" /></div>
          <div className="pk-body"><T en="Typewriters, tactile parchment, and timeless craftsmanship." bg="Пишещи машини, текстура на хартия и вечно майсторство." /></div>
          <span className="style-badge">Paper &amp; Ink</span>
        </div>
        <div className="style-card card-japanese">
          <div className="jp-stripe"></div>
          <div className="jp-content">
            <div className="jp-headline"><T en="The Way of the Warrior" bg="Пътят на воина" /></div>
            <div className="jp-body"><T en="Zen minimalism forged with the discipline of a samurai." bg="Дзен минимализъм, изкован с дисциплината на самурай." /></div>
            <div className="jp-mega">武道</div>
          </div>
          <span className="style-badge" style={{ background: 'rgba(192,57,43,0.9)' }}>Japanese Edo</span>
        </div>
        <div className="style-card card-brutalist">
          <div className="brut-header"><div className="brut-title">BRUTALISM.EXE</div></div>
          <div className="brut-body">
            <div className="brut-headline"><T en="NO APOLOGIES FOR ART" bg="ИЗКУСТВО БЕЗ ИЗВИНЕНИЯ" /></div>
            <div className="brut-text"><T en="Function screams loudest. Unpolished, unapologetic, unforgettable." bg="Функцията крещи най-силно. Нешлифовано, без извинения, незабравимо." /></div>
          </div>
          <span className="style-badge">Brutalist</span>
        </div>
        <div className="style-card card-glass">
          <div className="glass-blob1"></div><div className="glass-blob2"></div>
          <div className="glass-panel">
            <div className="glass-headline"><T en="Crystal Clear" bg="Кристално ясно" /></div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}><T en="Frosted interfaces floating through the creative void." bg="Матирани интерфейси, реещи се в творческата пустош." /></div>
          </div>
          <span className="style-badge">Glassmorphism</span>
        </div>
        <div className="style-card card-vaporwave">
          <div className="vw-sun"></div>
          <div className="vw-headline">VAPORWAVE</div>
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, color: '#05ffa1', fontFamily: "'VT323'", fontSize: '1.2rem' }}><T en="Retro Future" bg="Ретро Бъдеще" /></div>
          <span className="style-badge" style={{ background: 'rgba(185,103,255,0.7)' }}>Vaporwave</span>
        </div>
        <div className="style-card card-darkacademia">
          <div className="da-headline"><T en="Of Books & Candlelight" bg="Книги и свещи" /></div>
          <div className="da-body"><T en="Ivy league shadows, hidden libraries, and unspoken secrets." bg="Сенки от стари библиотеки, книги и неразказани тайни." /></div>
          <span className="style-badge">Dark Academia</span>
        </div>
        <div className="style-card card-memphis">
          <div className="mem-headline"><T en="TOTALLY RAD" bg="ТОТАЛНО РАДИКАЛНО" /></div>
          <div style={{ position: 'relative', zIndex: 1, fontFamily: "'General Sans'", fontSize: '0.8rem' }}><T en="Loud, abstract shapes clashing in perfect retro harmony." bg="Шумни, абстрактни форми в перфектна ретро хармония." /></div>
          <span className="style-badge">Memphis 80s</span>
        </div>
        <div className="style-card card-bauhaus">
          <div className="bh-headline">BAUS<br/>HAUS</div>
          <div style={{ position: 'relative', zIndex: 1, borderTop: '2px solid #111', paddingTop: 16, fontWeight: 600 }}><T en="Form strictly follows function. The origin of modernism." bg="Формата строго следва функцията. Раждането на модернизма." /></div>
          <span className="style-badge">Bauhaus</span>
        </div>
        <div className="style-card card-zen">
          <div className="zen-headline"><T en="Beauty in Imperfection" bg="Красота в несъвършенството" /></div>
          <div style={{ position: 'relative', zIndex: 1, fontFamily: "'Cormorant Garamond'", fontSize: '1rem', opacity: 0.8 }}><T en="Finding profound beauty in empty space and fleeting moments." bg="Откриване на дълбока красота в празното пространство и мига." /></div>
          <span className="style-badge">Zen</span>
        </div>
        <div className="style-card card-steampunk">
          <div className="sp-headline"><T en="Mechanical Wonders" bg="Механични чудеса" /></div>
          <div style={{ position: 'relative', zIndex: 1, fontFamily: "'Cormorant Garamond'", fontSize: '0.9rem', color: 'rgba(200,150,90,0.8)' }}><T en="Copper gears, steam-powered mechanics, and Victorian futurism." bg="Медни зъбчати колела, парни механизми и викторианско бъдеще." /></div>
          <span className="style-badge">Steampunk</span>
        </div>
        <div className="style-card card-y2k">
          <div className="y2k-headline">CYBER<br/>2000</div>
          <div style={{ position: 'relative', zIndex: 1, fontFamily: "'General Sans'", fontSize: '0.8rem', fontWeight: 500 }}><T en="Liquid metal interfaces from the year 2000. Jack in." bg="Интерфейси от течен метал от 2000-та година. Свържи се." /></div>
          <span className="style-badge">Y2K Chrome</span>
        </div>
        <div className="style-card card-terminal">
          <div className="term-headline"><T en="SYSTEM ONLINE" bg="СИСТЕМА АКТИВНА" /><span className="term-cursor"></span></div>
          <div style={{ position: 'relative', zIndex: 1, fontFamily: "'Space Mono',monospace", fontSize: '0.7rem', color: 'rgba(51,255,51,0.6)' }}><T en="> Green phosphor screens and command-line aesthetics." bg="> Зелени екрани и естетика на командния ред." /></div>
          <span className="style-badge">Retro Terminal</span>
        </div>
        <div className="style-card card-swiss">
          <div className="sw-headline"><T en="ORDER IN TYPE" bg="РЕД В ШРИФТА" /></div>
          <div className="sw-rule"></div>
          <div style={{ position: 'relative', zIndex: 1, fontFamily: "'General Sans'", fontSize: '0.8rem', color: '#555' }}><T en="Grid-first thinking. Helvetica discipline. Swiss precision." bg="Решетката на първо място. Хелветика. Швейцарска прецизност." /></div>
          <span className="style-badge">Swiss International</span>
        </div>
        <div className="style-card card-nouveau">
          <div className="nv-headline"><T en="Nature's Ornament" bg="Орнаментът на природата" /></div>
          <div style={{ position: 'relative', zIndex: 1, fontFamily: "'Playfair Display',serif", fontSize: '0.85rem', color: 'rgba(143,188,143,0.7)', fontStyle: 'italic' }}><T en="Organic curves, floral motifs, and handcrafted elegance." bg="Органични извивки, флорални мотиви и ръчна елегантност." /></div>
          <span className="style-badge">Art Nouveau</span>
        </div>
        <div className="style-card card-grunge">
          <div className="grn-headline"><T en="RAW ENERGY" bg="СУРОВА ЕНЕРГИЯ" /></div>
          <div style={{ position: 'relative', zIndex: 1, fontFamily: "'General Sans'", fontSize: '0.8rem', color: 'rgba(212,197,160,0.5)' }}><T en="Distressed textures, broken grids, and analog rebellion." bg="Износени текстури, счупени решетки и аналогов бунт." /></div>
          <span className="style-badge">Grunge</span>
        </div>
        <div className="style-card card-popart">
          <div className="pop-headline"><T en="BOLD & LOUD" bg="СМЕЛО & СИЛНО" /></div>
          <div style={{ position: 'relative', zIndex: 1, fontFamily: "'General Sans'", fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}><T en="Halftone dots, saturated color, and unapologetic impact." bg="Полутонове, наситени цветове и удар в очите." /></div>
          <span className="style-badge">Pop Art</span>
        </div>
        <div className="style-card card-luxury">
          <div className="lux-headline"><T en="Black & Gold" bg="Черно и злато" /></div>
          <div style={{ position: 'relative', zIndex: 1, fontFamily: "'Cormorant Garamond',serif", fontSize: '0.9rem', color: 'rgba(212,175,55,0.5)' }}><T en="Whispered opulence. Understated wealth. Dark prestige." bg="Тих разкош. Сдържано богатство. Тъмен престиж." /></div>
          <span className="style-badge">Luxury Noir</span>
        </div>
        <div className="style-card card-nordic">
          <div className="nrd-headline"><T en="Quiet Confidence" bg="Тиха увереност" /></div>
          <div style={{ position: 'relative', zIndex: 1, fontFamily: "'General Sans'", fontSize: '0.8rem', color: '#6b7b8d' }}><T en="Scandinavian clarity. Warm neutrals, open space, calm logic." bg="Скандинавска яснота. Топли неутрали, отворено пространство, спокойна логика." /></div>
          <span className="style-badge">Nordic Clean</span>
        </div>
        <div className="style-card card-scifi">
          <div className="sf-headline"><T en="DEEP SPACE" bg="ДЪЛБОК КОСМОС" /></div>
          <div style={{ position: 'relative', zIndex: 1, fontFamily: "'Orbitron',sans-serif", fontSize: '0.65rem', color: 'rgba(0,212,255,0.5)', letterSpacing: '0.15em' }}><T en="Interstellar interfaces. Built for the next frontier." bg="Интерстеларни интерфейси. За следващата граница." /></div>
          <span className="style-badge">Sci-Fi</span>
        </div>
        <div className="style-card card-organic">
          <div className="org-headline"><T en="Rooted in the Earth" bg="Вкоренено в земята" /></div>
          <div style={{ position: 'relative', zIndex: 1, fontFamily: "'Cormorant Garamond',serif", fontSize: '0.9rem', color: 'rgba(90,114,71,0.7)' }}><T en="Natural tones, soft textures, and grounded authenticity." bg="Природни тонове, меки текстури и автентичност." /></div>
          <span className="style-badge">Organic Nature</span>
        </div>
        <div className="style-card card-neonnoir">
          <div className="nn-headline"><T en={`AFTER DARK`} bg={`СЛЕД МРАКА`} /></div>
          <div style={{ position: 'relative', zIndex: 1, fontFamily: "'General Sans'", fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}><T en="Neon reflections on wet asphalt. Cinema meets interface." bg="Неонови отражения по мокър асфалт. Кино среща интерфейс." /></div>
          <span className="style-badge">Neon Noir</span>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ───
function FAQ() {
  const items = [
    { qEn: 'HOW DOES THE PROCESS WORK?', qBg: 'КАК ПРОТИЧА ПРОЦЕСЪТ?', aEn: 'You fill out the form below and within 24 hours you get a reply with a rough plan. No discovery calls that waste your morning.', aBg: 'Попълваш формата, до 24 часа получаваш отговор с груб план. Без излишни разговори, които губят времето ти.' },
    { qEn: 'WHO WORKS ON MY PROJECT?', qBg: 'КОЙ РАБОТИ ПО ПРОЕКТА МИ?', aEn: 'Me. One person from brief to launch. Nothing gets lost in translation. The vision stays intact.', aBg: 'Аз. Един човек от брифа до финала. Нищо не се губи по пътя. Визията остава цяла.' },
    { qEn: 'HOW FAST CAN YOU DELIVER?', qBg: 'КОЛКО БЪРЗО МОЖЕ ДА Е ГОТОВО?', aEn: "Fast. Scope defines timeline, but I don't sit on projects. You'll know the exact timeline after the brief.", aBg: 'Бързо. Обхватът определя срока, но аз не чакам. Точния срок ще знаеш след брифа.' },
    { qEn: 'WHAT DO I OWN AFTER THE PROJECT?', qBg: 'КАКВО ПРИТЕЖАВАМ СЛЕД ПРОЕКТА?', aEn: "Everything. Source files, code, assets. No subscriptions, no hostage-taking. Once delivered, it's 100% yours.", aBg: 'Всичко. Файловете, кодът, материалите. Без абонаменти, без задържане. След предаването е 100% твое.' },
    { qEn: 'DO YOU WORK WITH INTERNATIONAL CLIENTS?', qBg: 'РАБОТИШ ЛИ С МЕЖДУНАРОДНИ КЛИЕНТИ?', aEn: 'Yes. About half my work is international. English, async communication, European payment methods — all standard.', aBg: 'Да. Около половината ми работа е с международни клиенти. Английски, асинхронна комуникация, европейски методи за плащане — всичко по стандарт.' },
  ];

  return (
    <section className="faq-section" id="faq">
      <span className="label faq-section__label"><T en="FAQ" bg="ВЪПРОСИ" /></span>
      {items.map((item, i) => (
        <details key={i} className="faq-item">
          <summary>
            <span><T en={item.qEn} bg={item.qBg} /></span>
            <span className="faq-icon">+</span>
          </summary>
          <div className="faq-content">
            <p><T en={item.aEn} bg={item.aBg} /></p>
          </div>
        </details>
      ))}
    </section>
  );
}

// ─── CONTACT & FOOTER ───
function ContactFooter() {
  const { lang } = useLanguage();
  const [selectedStyle, setSelectedStyle] = useState('Not specified');
  const [status, setStatus] = useState<{ text: string; type: '' | 'success' | 'error' }>({ text: '', type: '' });
  const [sending, setSending] = useState(false);

  const styleOptions = [
    { name: 'Neo-Minimal', color: '#d0d0d0' },
    { name: 'Cyberpunk', color: 'linear-gradient(90deg,#00ff41,#ff006e)' },
    { name: 'Art Deco', color: '#d4af37' },
    { name: 'Paper & Ink', color: '#b08055' },
    { name: 'Japanese Edo', color: '#c0392b' },
    { name: 'Brutalist', color: '#ffe600' },
    { name: 'Glassmorphism', color: 'linear-gradient(90deg,#7c3aed,#0ea5e9)' },
    { name: 'Vaporwave', color: 'linear-gradient(90deg,#ff71ce,#05ffa1)' },
    { name: 'Dark Academia', color: '#c8a45a' },
    { name: 'Memphis 80s', color: '#ffe600' },
    { name: 'Bauhaus', color: 'linear-gradient(90deg,#e63946,#457b9d,#f1c40f)' },
    { name: 'Zen', color: '#8b7d6b' },
    { name: 'Steampunk', color: '#c87941' },
    { name: 'Y2K Chrome', color: 'linear-gradient(90deg,#ccc,#fff,#999)' },
    { name: 'Retro Terminal', color: '#33ff33' },
    { name: 'Swiss International', color: '#e20000' },
    { name: 'Art Nouveau', color: '#8fbc8f' },
    { name: 'Grunge', color: '#d4c5a0' },
    { name: 'Pop Art', color: '#ff1493' },
    { name: 'Luxury Noir', color: '#d4af37' },
    { name: 'Nordic Clean', color: '#2c3e50' },
    { name: 'Sci-Fi', color: '#00d4ff' },
    { name: 'Organic Nature', color: '#5a7247' },
    { name: 'Neon Noir', color: '#ff0064' },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setStatus({ text: '', type: '' });

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('preferred_style', selectedStyle);
      const data = Object.fromEntries(formData.entries());
      const response = await fetch('https://formsubmit.co/ajax/stoyanbtanev@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setStatus({ text: lang === 'bg' ? 'ПОЛУЧЕНО. ЩЕ ОТГОВОРЯ ДО 24 ЧАСА ✓' : "RECEIVED. I'LL REPLY WITHIN 24H ✓", type: 'success' });
        (e.target as HTMLFormElement).reset();
        setSelectedStyle('Not specified');
      } else {
        setStatus({ text: lang === 'bg' ? 'НЕЩО СЕ ОБЪРКА — ОПИТАЙ ОТНОВО' : 'SOMETHING WENT WRONG — TRY AGAIN', type: 'error' });
      }
    } catch {
      setStatus({ text: lang === 'bg' ? 'НЕЩО СЕ ОБЪРКА — ОПИТАЙ ОТНОВО' : 'SOMETHING WENT WRONG — TRY AGAIN', type: 'error' });
    }

    setSending(false);
    setTimeout(() => setStatus({ text: '', type: '' }), 5000);
  };

  return (
    <div className="cta-container" id="contact">
      <div className="cta-pin-layer">
        <div
          className="cta-huge-text"
          aria-label={lang === 'bg' ? 'ГОТОВ ЛИ СИ.' : 'READY.'}
        >
          {(lang === 'bg' ? 'ГОТОВ ЛИ СИ.' : 'READY.').split('').map((char, i) => (
            <span key={i} className="cta-char">
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
      </div>
      <div className="footer-reveal">
        {/* Portfolio */}
        <div className="footer-work">
          <span className="label" style={{ marginBottom: 20, display: 'block' }}><T en="/ RECENT WORK" bg="/ СКОРОШНИ ПРОЕКТИ" /></span>
          <div className="portfolio-grid">
            {[
              { href: 'https://pekarnisiana.github.io/site/', img: '/work-siana.jpg', name: 'PEKARNI SIANA' },
              { href: 'https://speedlink-eu.vercel.app/', img: '/work-speedlink.jpg', name: 'SPEEDLINK EU' },
              { href: 'https://exelkonsol.github.io/elk/', img: '/work-exel.jpg', name: '$SELK — SOLANA' },
            ].map(p => (
              <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" className="portfolio-card">
                <div className="portfolio-card__img" style={{ backgroundImage: `url('${p.img}')` }}></div>
                <div className="portfolio-card__overlay">
                  <span className="portfolio-card__name">{p.name}</span>
                  <span className="portfolio-card__link"><T en="VIEW PROJECT →" bg="ВИЖ ПРОЕКТА →" /></span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="testimonials">
          <span className="label" style={{ display: 'block', textAlign: 'center', marginBottom: 48 }}><T en="/ WHAT CLIENTS SAY" bg="/ КАКВО КАЗВАТ КЛИЕНТИТЕ" /></span>
          <div className="testimonials__grid">
            {[
              { quoteEn: '"Fast, clean, and exactly what I envisioned."', quoteBg: '„Бързо, чисто и точно това, което исках."', clientEn: 'BAKERY CLIENT — PEKARNI SIANA', clientBg: 'КЛИЕНТ — ПЕКАРНИ СИЯНА' },
              { quoteEn: '"Best investment for our startup. The site converted from day one."', quoteBg: '„Най-добрата инвестиция за стартъпа ни. Сайтът конвертира от ден едно."', clientEn: 'LOGISTICS CLIENT — SPEEDLINK EU', clientBg: 'КЛИЕНТ — SPEEDLINK EU' },
              { quoteEn: '"He understands brand DNA instantly. No revisions needed."', quoteBg: '„Разбира ДНК-то на бранда от първия път. Нула корекции."', clientEn: 'CRYPTO CLIENT — $SELK / SOLANA', clientBg: 'КРИПТО КЛИЕНТ — $SELK / SOLANA' },
            ].map((t, i) => (
              <div key={i} className="testimonial-card">
                <p className="testimonial-card__quote"><T en={t.quoteEn} bg={t.quoteBg} /></p>
                <div className="testimonial-card__client"><T en={t.clientEn} bg={t.clientBg} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <input type="hidden" name="_subject" value="New Project — tanev.design" />
          <input type="text" name="_honey" style={{ display: 'none' }} />

          <div className="form-row">
            <div className="form-group">
              <label><T en="YOUR NAME" bg="ТВОЕТО ИМЕ" /></label>
              <input type="text" name="name" required />
            </div>
            <div className="form-group">
              <label><T en="YOUR EMAIL" bg="ТВОЯТ ИМЕЙЛ" /></label>
              <input type="email" name="email" required />
            </div>
          </div>

          <div className="form-group">
            <label><T en="PREFERRED AESTHETIC" bg="ПРЕДПОЧИТАНА ЕСТЕТИКА" /></label>
            <div className="style-picker">
              {styleOptions.map(s => (
                <div key={s.name} className={`style-pick ${selectedStyle === s.name ? 'selected' : ''}`}
                  style={{ '--pick-color': s.color } as any}
                  onClick={() => setSelectedStyle(s.name)}>
                  {s.name}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label><T en="ABOUT YOUR PROJECT" bg="ЗА ПРОЕКТА ТИ" /></label>
            <textarea name="message" rows={5} required></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><T en="SERVICE TYPE" bg="ВИД УСЛУГА" /></label>
              <select name="service">
                <option value="Website">{lang === 'bg' ? 'Уебсайт' : 'Website'}</option>
                <option value="Branding">{lang === 'bg' ? 'Брандинг' : 'Branding'}</option>
                <option value="Video">{lang === 'bg' ? 'Видео' : 'Video'}</option>
                <option value="SEO">SEO</option>
                <option value="Not sure yet">{lang === 'bg' ? 'Все още не знам' : 'Not sure yet'}</option>
              </select>
            </div>
          </div>

          <button type="submit" className="form-submit" disabled={sending}>
            <span>{sending ? (lang === 'bg' ? 'ИЗПРАЩАНЕ...' : 'SENDING...') : <T en="SEND INQUIRY" bg="ИЗПРАТИ ЗАПИТВАНЕ" />}</span>
          </button>
          {status.text && <div className={`form-status ${status.type}`}>{status.text}</div>}
        </form>

        {/* Contact Info */}
        <div style={{ textAlign: 'center', color: 'var(--td-fg)', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase' as const, opacity: 0.6 }}>
          <p style={{ marginBottom: 20, opacity: 0.7, letterSpacing: '0.12em', fontSize: 11 }}><T en="PLOVDIV, BULGARIA — WORKING WITH CLIENTS EVERYWHERE" bg="ПЛОВДИВ, БЪЛГАРИЯ — РАБОТЯ С КЛИЕНТИ ОТВСЯКЪДЕ" /></p>
          <p>stoyanbtanev@gmail.com</p>
          <p style={{ marginTop: 16 }}>
            <a href="https://x.com/tanevdesign" target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: 2 }}>X</a>
            <a href="https://www.linkedin.com/in/stoyan-tanev-a732603b8/" target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: 2 }}>LINKEDIN</a>
            <a href="https://github.com/stoyanbtanev" target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: 2 }}>GITHUB</a>
          </p>
          <p style={{ marginTop: 60, opacity: 0.3 }}>© 2026 TANEV DESIGN</p>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN INDEX ───
import React from 'react';

export default function Index() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const lenisRef = useLenis();

  const heroEntranceTriggeredRef = useRef(false);
  const triggerHeroEntrance = useCallback(() => {
    if (heroEntranceTriggeredRef.current) return;
    heroEntranceTriggeredRef.current = true;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));

    const tl = gsap.timeline();
    tl.to('.nav', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0);
    tl.to('.hero__headline .char', {
      y: 0, opacity: 1,
      duration: isMobile ? 0.7 : 1,
      stagger: isMobile ? 0.025 : 0.04,
      ease: 'expo.out'
    }, isMobile ? 0.1 : 0.2);
    tl.to('.hero__sub', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, isMobile ? 0.3 : 0.6);
    tl.to('.hero__cta', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, isMobile ? 0.4 : 0.75);
    tl.to('.hero__bottom', { opacity: 1, duration: 0.5, ease: 'power3.out' }, isMobile ? 0.45 : 0.8);
  }, []);

  const onPreloaderComplete = useCallback(() => {
    triggerHeroEntrance();
    setPreloaderDone(true);
  }, [triggerHeroEntrance]);

  // Pre-hide hero elements so there's no flash behind the preloader
  useEffect(() => {
    gsap.set('.hero__headline .char', { y: 120, opacity: 0 });
    gsap.set('.hero__sub', { opacity: 0, y: 20 });
    gsap.set('.hero__cta', { opacity: 0, y: 15 });
    gsap.set('.hero__bottom', { opacity: 0 });
    gsap.set('.nav', { opacity: 0, y: -10 });
  }, []);

  // GSAP scroll animations - after preloader
  useGSAP((gsap, ScrollTrigger) => {
    if (!preloaderDone) return;

    // Mission lines
    gsap.utils.toArray('.mission__line-wrap').forEach((wrap: any, i: number) => {
      const line = wrap.querySelector('.mission__line');
      gsap.from(line, {
        x: i % 2 === 0 ? '-10vw' : '10vw',
        opacity: 0, scale: 0.9,
        scrollTrigger: { trigger: wrap, start: 'top 95%', end: 'top 40%', scrub: 1 }
      });
    });

    // Horizontal scroll services (desktop only)
    ScrollTrigger.matchMedia({
      '(min-width: 769px)': function() {
        const hzWrap = document.querySelector('.hz-container') as HTMLElement;
        if (!hzWrap) return;
        gsap.to(hzWrap, {
          x: () => -(hzWrap.scrollWidth - window.innerWidth),
          ease: 'none',
          scrollTrigger: {
            trigger: '.horizontal-services',
            pin: true,
            scrub: 0.8,
            end: () => '+=' + hzWrap.scrollWidth
          }
        });
      }
    });

    // Style cards 3D entrance
    gsap.from('.style-card', {
      y: 150, z: -300, rotationX: -15, opacity: 0,
      stagger: 0.05, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.universe', start: 'top 85%', end: 'top 20%', scrub: 1.5 }
    });

    // 3D tilt on style cards
    document.querySelectorAll('.style-card').forEach(card => {
      card.addEventListener('mousemove', (e: any) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const x = e.clientX - cx;
        const y = e.clientY - cy;
        gsap.to(card, {
          rotationX: -12 * (y / (rect.height / 2)),
          rotationY: 12 * (x / (rect.width / 2)),
          transformPerspective: 1200,
          ease: 'power2.out', duration: 0.4
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotationX: 0, rotationY: 0, ease: 'power3.out', duration: 0.7 });
      });
    });

    // ── CTA Assembly Animation ────────────────────────────────────────────────
    const isMobileCtaCheck = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));

    const ctaTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.cta-pin-layer',
        pin: true,
        start: 'top top',
        end: '+=220%',
        scrub: isMobileCtaCheck ? 1.5 : 1,
      }
    });

    // Phase 1 (progress 0 → 0.5): chars fly in from alternating above/below
    gsap.set('.cta-char', {
      y: (i: number) => i % 2 === 0 ? -120 : 120,
      opacity: 0
    });

    ctaTl.to('.cta-char', {
      y: 0,
      opacity: 1,
      stagger: 0.04,
      ease: 'power3.out',
      duration: 0.5,
    }, 0);

    // Phase 1 simultaneous: letter-spacing expands as chars land
    ctaTl.fromTo('.cta-huge-text',
      { letterSpacing: '-0.12em' },
      { letterSpacing: '0.04em', ease: 'power2.out', duration: 0.5 },
      0
    );

    // Phase 2 (progress 0.6 → 1): exit — chars scatter outward from center
    ctaTl.to('.cta-char', {
      y: (i: number) => i % 2 === 0 ? -200 : 200,
      opacity: 0,
      stagger: { each: 0.03, from: 'center' },
      ease: 'power2.in',
      duration: 0.4,
    }, 0.6);

    // Stats countUp
    document.querySelectorAll('.stats-bar__number').forEach((el: any) => {
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 1.8, ease: 'power3.out',
        snap: { val: 1 },
        onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; },
        scrollTrigger: { trigger: '.stats-bar', start: 'top 80%', once: true }
      });
    });

    // Process steps
    gsap.from('.process-step', {
      opacity: 0, y: 40, stagger: 0.15, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.process-section', start: 'top 75%' }
    });

    // Testimonials
    gsap.from('.testimonial-card', {
      opacity: 0, y: 40, stagger: 0.12, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.testimonials', start: 'top 80%' }
    });

    // Arsenal
    gsap.from('.arsenal-text', {
      opacity: 0, x: -40, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.arsenal-section', start: 'top 75%' }
    });
    gsap.from('.bento-card', {
      opacity: 0, x: 40, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.arsenal-section', start: 'top 75%' }
    });
    gsap.from('.arsenal-card', {
      opacity: 0, y: 36, stagger: 0.1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.arsenal-cards', start: 'top 82%' }
    });

  }, [preloaderDone]);

  return (
    <>
      <Preloader onComplete={onPreloaderComplete} />
      <Navigation />
      <Hero />
      <Mission />
      <StatsBar />
      <Services />
      <Process />
      <Arsenal />
      <StylesUniverse />
      <FAQ />
      <ContactFooter />
    </>
  );
}
