"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ContactModal } from "@/components/ContactModal";

type ClientProvidersProps = {
  children: ReactNode;
};

type LenisLike = {
  raf: (time: number) => void;
  scrollTo: (target: string | number | Element, options?: { offset?: number; duration?: number }) => void;
  destroy: () => void;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Lock viewport height on load + only re-fire on width changes (rotation).
 * Prevents address-bar show/hide on Chromium-on-iOS (Brave, Chrome, Edge)
 * and Chrome on Android from triggering layout recalculations mid-scroll.
 * Safari handles this natively, but every other mobile browser does not.
 */
function useAppHeightLock() {
  useEffect(() => {
    const lock = () => {
      document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
    };
    lock();

    let cachedWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth !== cachedWidth) {
        cachedWidth = window.innerWidth;
        lock();
      }
    };
    const onOrientation = () => {
      cachedWidth = window.innerWidth;
      lock();
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onOrientation, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
    };
  }, []);
}

function Preloader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      document.documentElement.classList.add("is-loaded");
      window.setTimeout(() => setHidden(true), 760);
    };

    const loadReady =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));

    const fontReady = "fonts" in document ? document.fonts.ready : Promise.resolve();
    Promise.all([loadReady, fontReady]).then(() => window.setTimeout(finish, 220));

    // Hard fallback: never let the preloader sit longer than 2.5s,
    // even if window.load or font loading hangs (e.g. broken assets,
    // Turbopack HMR quirks, blocked third-party fetches).
    const fallback = window.setTimeout(finish, 2500);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, []);

  if (hidden) return null;

  return (
    <div className="preloader" aria-hidden="true">
      <Image src="/assets/icons/star.svg" width={42} height={42} alt="" />
    </div>
  );
}

function CustomCursor() {
  const cursor = useRef<HTMLDivElement | null>(null);
  const position = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const hasMoved = useRef(false);
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion() || window.innerWidth < 900) return;

    let frame = 0;
    const move = (event: MouseEvent) => {
      target.current.x = event.clientX;
      target.current.y = event.clientY;
      if (!hasMoved.current) {
        hasMoved.current = true;
        setVisible(true);
      }
    };

    const tick = () => {
      position.current.x += (target.current.x - position.current.x) * 0.18;
      position.current.y += (target.current.y - position.current.y) * 0.18;
      if (cursor.current) {
        cursor.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };

    const enter = (event: Event) => {
      const element = event.currentTarget as HTMLElement;
      setLabel(element.dataset.cursor || "OPEN");
    };
    const leave = () => setLabel("");

    const bind = () => {
      document.querySelectorAll<HTMLElement>("[data-cursor]").forEach((element) => {
        element.addEventListener("mouseenter", enter);
        element.addEventListener("mouseleave", leave);
      });
    };

    bind();
    window.addEventListener("mousemove", move, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", move);
      document.querySelectorAll<HTMLElement>("[data-cursor]").forEach((element) => {
        element.removeEventListener("mouseenter", enter);
        element.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  return (
    <div ref={cursor} className={`custom-cursor ${visible ? "is-visible" : ""} ${label ? "is-link" : ""}`} aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}

function useLenis() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let lenis: LenisLike | null = null;
    let frame = 0;
    let mounted = true;

    Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")]).then(([lenisModule, gsapModule, scrollTriggerModule]) => {
      if (!mounted) return;
      const Lenis = lenisModule.default;
      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      // Cross-browser mobile scroll stability — Brave/Chrome/Edge on iOS and
      // Chrome on Android otherwise treat the address-bar animation as a real
      // resize, which causes vh recalcs and visible jank. Safari is fine
      // natively, so we do not need to opt out for it.
      ScrollTrigger.config({ ignoreMobileResize: true });
      // Note: ScrollTrigger.normalizeScroll({ type: "touch" }) was removed
      // because it intercepts touchstart/touchend and fires synthetic clicks
      // on links/buttons during swipe-to-scroll. Native touch handling is
      // preferred — Lenis already opts out via syncTouch: false below.

      lenis = new Lenis({
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        // syncTouch: false lets iOS/Android handle native touch scroll —
        // when true, Lenis fights the browser and breaks toolbar behaviour.
        syncTouch: false,
        touchMultiplier: 2,
        autoResize: true
      } as ConstructorParameters<typeof Lenis>[0]) as LenisLike;

      const raf = (time: number) => {
        lenis?.raf(time);
        ScrollTrigger.update();
        frame = requestAnimationFrame(raf);
      };

      frame = requestAnimationFrame(raf);
    });

    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#']");
      if (!link || !lenis) return;
      const href = link.getAttribute("href");
      if (!href || href === "#" || href === "#contact" || event.defaultPrevented) return;
      event.preventDefault();
      lenis.scrollTo(href, { offset: -80, duration: 1.2 });
    };

    document.addEventListener("click", onClick);

    return () => {
      mounted = false;
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);
}

function useScrollScrubVideo(pathname: string) {
  useEffect(() => {
    const video = document.getElementById("scroll-bg-video") as HTMLVideoElement | null;
    if (!video) return;

    let frame = 0;
    let duration = 0;
    let maxScroll = 1;
    let smoothedTime = 0;
    let cancelled = false;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }

    const measure = () => {
      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.offsetHeight
      );
      maxScroll = Math.max(documentHeight - window.innerHeight, 1);
      duration = Number.isFinite(video.duration) ? Math.max(video.duration - 0.04, 0) : 0;
    };

    // Continuous rAF that LERPS toward the scroll-derived target time.
    // Hard-seeking video.currentTime on every scroll event causes decoder
    // stutter; lerping lets the browser decode forward smoothly.
    const tick = () => {
      if (cancelled) return;

      const scrollY = Math.max(window.scrollY, 0);
      const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      const targetTime = scrollY <= 2 ? 0 : progress * duration;

      // Easing: 0.18 feels responsive yet smooth on top of Lenis.
      const lerp = 0.18;
      smoothedTime += (targetTime - smoothedTime) * lerp;

      // Snap when extremely close to avoid asymptotic float jitter
      if (Math.abs(targetTime - smoothedTime) < 0.0008) {
        smoothedTime = targetTime;
      }

      // Only seek if the gap is meaningful (>~12ms ≈ <1 frame at 80fps)
      if (duration > 0 && Math.abs(video.currentTime - smoothedTime) > 0.012) {
        try {
          video.currentTime = Math.min(Math.max(smoothedTime, 0), duration);
        } catch {
          /* swallow seek errors during teardown */
        }
      }

      frame = requestAnimationFrame(tick);
    };

    const ready = () => {
      video.pause();
      video.currentTime = 0;
      smoothedTime = 0;
      measure();
    };

    const onResize = () => measure();

    video.pause();
    video.defaultPlaybackRate = 0;
    if (video.readyState >= 1) ready();
    else video.addEventListener("loadedmetadata", ready, { once: true });

    window.addEventListener("resize", onResize);
    frame = requestAnimationFrame(tick);

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      video.removeEventListener("loadedmetadata", ready);
    };
  }, [pathname]);
}

function useRevealObserver(pathname: string) {
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const timeout = window.setTimeout(() => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
      if (!nodes.length) return;

      if (prefersReducedMotion()) {
        nodes.forEach((node) => node.classList.add("is-visible"));
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer?.unobserve(entry.target);
          });
        },
        { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
      );

      nodes.forEach((node, index) => {
        node.style.setProperty("--reveal-delay", `${Math.min(index % 8, 7) * 60}ms`);
        observer?.observe(node);
      });
    }, 450);

    return () => {
      window.clearTimeout(timeout);
      observer?.disconnect();
    };
  }, [pathname]);
}

function useMagnetic(pathname: string) {
  useEffect(() => {
    if (prefersReducedMotion() || window.innerWidth < 900) return;

    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const cleanup: Array<() => void> = [];

    items.forEach((item) => {
      const move = (event: MouseEvent) => {
        const rect = item.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        item.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      };
      const leave = () => {
        item.style.transform = "";
      };

      item.addEventListener("mousemove", move);
      item.addEventListener("mouseleave", leave);
      cleanup.push(() => {
        item.removeEventListener("mousemove", move);
        item.removeEventListener("mouseleave", leave);
      });
    });

    return () => cleanup.forEach((fn) => fn());
  }, [pathname]);
}

function useParallax(pathname: string) {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const idle =
      window.requestIdleCallback ||
      ((callback: IdleRequestCallback) => window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 1));

    const id = idle(() => {
      Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapModule, scrollTriggerModule]) => {
        if (cancelled) return;
        const gsap = gsapModule.gsap;
        const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        const triggers = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]")).map((node) =>
          gsap.fromTo(
            node,
            { yPercent: -5, scale: 1.04 },
            {
              yPercent: 5,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: node,
                scrub: 0.6,
                start: "top bottom",
                end: "bottom top"
              }
            }
          )
        );

        cleanup = () => {
          triggers.forEach((trigger) => trigger.kill());
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
      });
    });

    return () => {
      cancelled = true;
      window.cancelIdleCallback?.(id);
      cleanup?.();
    };
  }, [pathname]);
}

/**
 * Cursor-tracked spotlight on cards: writes --mx / --my CSS variables
 * so the radial-gradient ::after follows the pointer. Pure CSS handles
 * the visual; this hook only feeds coordinates.
 */
function useSpotlight(pathname: string) {
  useEffect(() => {
    if (prefersReducedMotion() || window.innerWidth < 900) return;

    const selector = ".service-card, .pricing-card, .blog-card, .service-index-card, .work-row figure, .testimonial-stage";
    const targets = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const cleanups: Array<() => void> = [];

    targets.forEach((node, index) => {
      // Stagger orbit start so each card breathes at its own angle
      node.style.setProperty("--card-angle", `${(index * 47) % 360}deg`);

      const onMove = (event: MouseEvent) => {
        const rect = node.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        node.style.setProperty("--mx", `${x}%`);
        node.style.setProperty("--my", `${y}%`);
      };

      const onLeave = () => {
        node.style.setProperty("--mx", "50%");
        node.style.setProperty("--my", "50%");
      };

      node.addEventListener("mousemove", onMove);
      node.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        node.removeEventListener("mousemove", onMove);
        node.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);
}

function useIntroSplitHighlight(pathname: string) {
  useEffect(() => {
    const node = document.querySelector<HTMLElement>("[data-split-intro]");
    if (!node) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText")]).then(([gsapModule, scrollTriggerModule, splitTextModule]) => {
      if (cancelled) return;
      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      const SplitText = splitTextModule.SplitText;
      gsap.registerPlugin(ScrollTrigger, SplitText);

      const split = new SplitText(node, {
        type: "lines,words",
        linesClass: "split-line",
        wordsClass: "split-word",
        aria: "auto"
      });
      const section = node.closest<HTMLElement>(".elite-intro") ?? node;

      gsap.set(split.words, { color: "rgba(248, 248, 243, 0.18)" });
      const tween = gsap.to(split.words, {
        color: (_index, target) => (target.closest(".elite-intro__accent") ? "#ff4a31" : "#f8f8f3"),
        ease: "power2.out",
        stagger: { each: 0.4, from: "start" },
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          end: "bottom 60%",
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });

      ScrollTrigger.refresh();

      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        split.revert();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [pathname]);
}

/**
 * GSAP ScrollTrigger scenes:
 * - .zoom-in   : starts at scale 0.86, eases to 1 across enter -> center
 * - .zoom-out  : starts at scale 1.18, eases to 1 across enter -> center
 * - .scroll-hold[data-hold] : pins the element while scrolled past
 * - .tilt-3d   : adds a subtle scrub-driven 3D tilt
 * Auto-applied to common landing sections so the user does not need to
 * decorate every node manually.
 */
function useScrollScenes(pathname: string) {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const idle =
      window.requestIdleCallback ||
      ((callback: IdleRequestCallback) => window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 1));

    const id = idle(() => {
      Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapModule, scrollTriggerModule]) => {
        if (cancelled) return;
        const gsap = gsapModule.gsap;
        const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        // Auto-tag well-known surfaces so we get instant payoff without
        // hand-decorating every card.
        document.querySelectorAll<HTMLElement>(".service-card, .blog-card, .service-index-card, .pricing-card").forEach((node) => {
          node.classList.add("zoom-in");
        });
        document.querySelectorAll<HTMLElement>(".work-row figure, .who__portrait, .testimonial-slide img, .detail-cover, .detail-banner").forEach((node) => {
          node.classList.add("zoom-out");
        });
        document.querySelectorAll<HTMLElement>(".hero__title, .quote-block h2, .footer-giant, .archive-hero h1, .detail-title").forEach((node) => {
          node.classList.add("tilt-3d");
        });

        const tweens: gsap.core.Tween[] = [];
        // Zoom in: starts shrunk, grows to natural scale as it enters
        document.querySelectorAll<HTMLElement>(".zoom-in").forEach((node) => {
          tweens.push(
            gsap.fromTo(
              node,
              { scale: 0.86, opacity: 0.55 },
              {
                scale: 1,
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: node,
                  scrub: 0.6,
                  start: "top 92%",
                  end: "top 42%"
                }
              }
            )
          );
        });

        // Zoom out: oversized, settles to natural as it crosses center
        document.querySelectorAll<HTMLElement>(".zoom-out").forEach((node) => {
          tweens.push(
            gsap.fromTo(
              node,
              { scale: 1.18 },
              {
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: node,
                  scrub: 0.6,
                  start: "top 92%",
                  end: "top 38%"
                }
              }
            )
          );
        });

        // Subtle 3D tilt on big headlines as they pass the viewport
        document.querySelectorAll<HTMLElement>(".tilt-3d").forEach((node) => {
          tweens.push(
            gsap.fromTo(
              node,
              { rotateX: 14, transformPerspective: 900, transformOrigin: "50% 100%" },
              {
                rotateX: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: node,
                  scrub: 0.5,
                  start: "top 95%",
                  end: "top 55%"
                }
              }
            )
          );
        });

        // Scroll-hold: pin a section for a beat so the eye lingers
        document.querySelectorAll<HTMLElement>("[data-hold]").forEach((node) => {
          const seconds = Number(node.dataset.hold) || 1;
          ScrollTrigger.create({
            trigger: node,
            start: "top top+=80",
            end: () => `+=${Math.max(seconds, 1) * window.innerHeight * 0.6}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1
          });
        });

        // Scrub mask on the hero title — fills letter-by-letter as you scroll
        const heroTitle = document.querySelector<HTMLElement>(".hero__title");
        if (heroTitle) {
          const obj = { p: 0 };
          tweens.push(
            gsap.to(obj, {
              p: 100,
              ease: "none",
              scrollTrigger: {
                trigger: heroTitle,
                scrub: 0.4,
                start: "top 70%",
                end: "bottom 30%"
              },
              onUpdate: () => {
                heroTitle.style.setProperty("--mask-progress", `${obj.p}%`);
              }
            })
          );
        }

        ScrollTrigger.refresh();

        cleanup = () => {
          tweens.forEach((tween) => tween.kill());
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
      });
    });

    return () => {
      cancelled = true;
      window.cancelIdleCallback?.(id);
      cleanup?.();
    };
  }, [pathname]);
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const pathname = usePathname();

  useAppHeightLock();
  useLenis();
  useScrollScrubVideo(pathname);
  useRevealObserver(pathname);
  useMagnetic(pathname);
  useParallax(pathname);
  useSpotlight(pathname);
  useIntroSplitHighlight(pathname);
  useScrollScenes(pathname);

  return (
    <>
      <Preloader />
      <CustomCursor />
      <div key={pathname} className="route-panel" aria-hidden="true" />
      {children}
      <ContactModal />
    </>
  );
}
