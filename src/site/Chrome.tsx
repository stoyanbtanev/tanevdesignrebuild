import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/hooks/useGSAP";
import { CHAPTERS, SITE } from "./config";
import { useScramble } from "@/hooks/useReveal";

function NavMark() {
  return (
    <a
      href="#top"
      aria-label="tanev.design home"
      style={{ display: "inline-flex", alignItems: "center", gap: 12 }}
    >
      <svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
        <text
          x="0"
          y="25"
          fontFamily="Clash Display, sans-serif"
          fontWeight={600}
          fontSize="28"
          fill="currentColor"
          letterSpacing="-0.5"
        >
          T
        </text>
        <rect x="19" y="2" width="2.4" height="28" rx="1.2" fill="var(--td-accent)" transform="rotate(12 20.2 16)" />
        <text
          x="24"
          y="25"
          fontFamily="Clash Display, sans-serif"
          fontWeight={600}
          fontSize="28"
          fill="currentColor"
          letterSpacing="-0.5"
        >
          D
        </text>
      </svg>
      <span
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--td-fg-2)",
          paddingTop: 2,
        }}
      >
        tanev.design
      </span>
    </a>
  );
}

/** Live Plovdiv (Europe/Sofia) local time, ticking every minute. */
function useLocalTime() {
  const [time, setTime] = useState(() => formatPlovdivTime());
  useEffect(() => {
    const tick = () => setTime(formatPlovdivTime());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

function formatPlovdivTime(): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Sofia",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
  } catch {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
}

export function Chrome() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(CHAPTERS[0].id);
  const headerRef = useRef<HTMLDivElement>(null);
  const localTime = useLocalTime();
  // Scramble fires on the inner text span (not the link itself, which contains
  // the live dot — overwriting textContent would erase that child).
  const timeTextRef = useScramble<HTMLSpanElement>(380);

  useEffect(() => {
    const triggers = CHAPTERS.map((c) => {
      const el = document.getElementById(c.id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => setActive(c.id),
        onEnterBack: () => setActive(c.id),
      });
    }).filter(Boolean) as ReturnType<typeof ScrollTrigger.create>[];

    const head = headerRef.current;
    if (head) {
      gsap.fromTo(
        head,
        { y: -40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.05 }
      );
    }

    return () => triggers.forEach((t) => t.kill());
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        ref={headerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 80,
          padding: "20px clamp(20px, 4vw, 48px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mixBlendMode: open ? "normal" : "difference",
          color: "var(--td-fg)",
        }}
      >
        <NavMark />
        <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="#contact" className="pill chrome-time-pill" style={{ display: "inline-flex" }} aria-label={`Plovdiv local time ${localTime}`}>
            <span className="chrome-time-pill__dot" aria-hidden="true" />
            <span ref={timeTextRef}>Plovdiv · {localTime}</span>
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            style={{
              width: 32,
              height: 32,
              border: "1px solid var(--td-line-strong)",
              borderRadius: 999,
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <span
              style={{
                position: "relative",
                width: 12,
                height: 8,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: open ? 3.5 : 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: "currentColor",
                  transform: open ? "rotate(45deg)" : "none",
                  transition: "transform 360ms cubic-bezier(0.65,0.05,0.36,1), top 360ms",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  top: open ? 3.5 : 7,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: "currentColor",
                  transform: open ? "rotate(-45deg)" : "none",
                  transition: "transform 360ms cubic-bezier(0.65,0.05,0.36,1), top 360ms",
                }}
              />
            </span>
          </button>
        </nav>
      </header>

      <SideRail active={active} />
      <Overlay open={open} onClose={() => setOpen(false)} />

      <style>{`
        .chrome-time-pill { font-variant-numeric: tabular-nums; }
        .chrome-time-pill__dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--td-accent);
          box-shadow: 0 0 10px var(--td-accent);
          animation: chrome-time-dot 2.4s ease-out infinite;
        }
        @keyframes chrome-time-dot {
          0%   { box-shadow: 0 0 0 0   rgba(232, 36, 26, 0.6), 0 0 10px var(--td-accent); }
          70%  { box-shadow: 0 0 0 8px rgba(232, 36, 26, 0),   0 0 10px var(--td-accent); }
          100% { box-shadow: 0 0 0 0   rgba(232, 36, 26, 0),   0 0 10px var(--td-accent); }
        }
      `}</style>
    </>
  );
}

function SideRail({ active }: { active: string }) {
  // Locked: position never changes, all labels always rendered, only the
  // active row gets the accent treatment + an extended progress line.
  // Layout is stable -> reserved label width prevents any horizontal jump.
  return (
    <aside aria-label="Section navigation" className="side-rail hidden md:flex">
      <ul className="side-rail__list">
        {CHAPTERS.map((c) => {
          const isActive = c.id === active;
          return (
            <li key={c.id} className={`side-rail__item ${isActive ? "is-active" : ""}`}>
              <a href={`#${c.id}`} className="side-rail__link">
                <span className="side-rail__line" aria-hidden="true">
                  <span className="side-rail__line-fill" />
                </span>
                <span className="side-rail__label">{c.label}</span>
                <span className="side-rail__dot" aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ul>

      <style>{`
        .side-rail {
          position: fixed;
          right: clamp(18px, 2.4vw, 36px);
          top: 50%;
          transform: translate3d(0, -50%, 0);
          z-index: 70;
          /* IMPORTANT: never animate top/right/transform on this element;
             only descendants animate. This guarantees the rail itself
             cannot drift while sections change. */
          will-change: auto;
          pointer-events: none;
        }
        .side-rail__list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 6px;
          /* Reserved width = label + line + dot, so the rail never resizes. */
          width: 156px;
          justify-items: end;
          pointer-events: auto;
        }
        .side-rail__item { width: 100%; }
        .side-rail__link {
          --line-w: 14px;
          --label-c: rgba(245, 243, 239, 0.45);
          --line-c: rgba(245, 243, 239, 0.35);
          --dot-c: transparent;
          display: grid;
          grid-template-columns: 1fr 28px 8px;
          align-items: center;
          gap: 12px;
          padding: 6px 0;
          color: var(--label-c);
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          line-height: 1;
          transition: color 360ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .side-rail__label {
          grid-column: 1;
          text-align: right;
          white-space: nowrap;
          opacity: 0.85;
          transform: translate3d(0, 0, 0);
          transition: opacity 360ms ease, color 360ms ease;
        }
        .side-rail__line {
          grid-column: 2;
          position: relative;
          width: 28px;
          height: 1px;
          background: rgba(245, 243, 239, 0.12);
          overflow: hidden;
          border-radius: 1px;
        }
        .side-rail__line-fill {
          position: absolute;
          inset: 0 auto 0 0;
          width: var(--line-w);
          background: var(--line-c);
          transition:
            width 520ms cubic-bezier(0.65, 0.05, 0.36, 1),
            background 360ms ease;
        }
        .side-rail__dot {
          grid-column: 3;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--dot-c);
          transform: translate3d(0, 0, 0) scale(0.5);
          opacity: 0;
          transition:
            transform 360ms cubic-bezier(0.4, 0, 0.2, 1),
            opacity 320ms ease,
            background 320ms ease,
            box-shadow 320ms ease;
        }

        /* Hover (still inactive): brighten without layout change */
        .side-rail__link:hover {
          --label-c: rgba(245, 243, 239, 0.92);
          --line-c: rgba(245, 243, 239, 0.7);
          --line-w: 22px;
        }

        /* Active state: full accent treatment, ALL via colors + scales -> no layout jump */
        .side-rail__item.is-active .side-rail__link {
          --label-c: var(--td-fg);
          --line-c: var(--td-accent);
          --line-w: 28px;
          --dot-c: var(--td-accent);
        }
        .side-rail__item.is-active .side-rail__label { opacity: 1; }
        .side-rail__item.is-active .side-rail__dot {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          box-shadow: 0 0 12px rgba(232, 36, 26, 0.6);
        }

        @media (max-width: 900px) {
          .side-rail { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .side-rail__link,
          .side-rail__line-fill,
          .side-rail__dot { transition: none !important; }
        }
      `}</style>
    </aside>
  );
}

function Overlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 75,
        background: "var(--td-bg)",
        clipPath: open
          ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
          : "polygon(0 0, 100% 0, 100% 0, 0 0)",
        transition: "clip-path 720ms cubic-bezier(0.86,0,0.07,1)",
        pointerEvents: open ? "auto" : "none",
        overflowY: "auto",
        overscrollBehavior: "contain",
      }}
    >
      <div
        className="container-x"
        style={{
          paddingTop: "clamp(88px, 10svh, 120px)",
          paddingBottom: "clamp(32px, 4svh, 56px)",
          display: "grid",
          gap: "clamp(32px, 5svh, 56px)",
          minHeight: "100%",
          alignContent: "space-between",
        }}
      >
        <nav style={{ display: "grid", gap: 0, maxWidth: 720 }}>
          {CHAPTERS.map((c, i) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              onClick={onClose}
              className="overlay-link"
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                alignItems: "baseline",
                columnGap: 18,
                padding: "clamp(10px, 1.2vw, 16px) 0",
                borderTop: i === 0 ? "1px solid var(--td-line)" : "none",
                borderBottom: "1px solid var(--td-line)",
                color: "var(--td-fg)",
                transition: "color 320ms",
                textDecoration: "none",
              }}
            >
              <span
                className="mono"
                aria-hidden="true"
                style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--td-fg-2)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="display"
                style={{ fontSize: "clamp(22px, 2.6vw, 36px)", lineHeight: 1.05, letterSpacing: "-0.015em" }}
              >
                {c.label}
              </span>
              <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--td-fg-2)" }}>
                ↗
              </span>
            </a>
          ))}
        </nav>
        <style>{`
          .overlay-link { transition: color 320ms ease, padding-left 360ms cubic-bezier(0.65,0.05,0.36,1); }
          .overlay-link:hover { color: var(--td-accent); padding-left: 12px; }
        `}</style>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 32,
            alignItems: "end",
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Contact</div>
            <a
              className="underline-link"
              href={`mailto:${SITE.email}`}
              style={{ fontFamily: "var(--font-display)", fontSize: 22 }}
            >
              {SITE.email}
            </a>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Studio</div>
            <div style={{ fontSize: 16 }}>
              {SITE.city}, {SITE.country}
              <br />
              EET / EEST · UTC+2/+3
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Elsewhere</div>
            <div style={{ display: "grid", gap: 4, fontSize: 16 }}>
              <a className="underline-link" href={SITE.socials.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
              <a className="underline-link" href={SITE.socials.x} target="_blank" rel="noopener noreferrer">X / Twitter ↗</a>
              <a className="underline-link" href={SITE.socials.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
