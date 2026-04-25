import { useEffect, useRef, useState } from "react";
import { gsap } from "@/hooks/useGSAP";
import { X } from "lucide-react";
import { SectionTag } from "./SectionTag";
import { useHeadingReveal } from "@/hooks/useReveal";

const BASE_ROWS = [
  ["Next.js", "React", "TypeScript", "Tailwind CSS", "GSAP", "Vite"],
  ["Figma", "VS Code", "GitHub", "Vercel", "Cloudflare", "Cursor"],
  ["Claude", "ChatGPT", "Node.js", "Supabase", "Photoshop", "After Effects"],
];

type StackCategory = {
  id: string;
  label: string;
  items: string[];
  intro: string;
  details: { name: string; note: string }[];
};

const STACK_CARDS: StackCategory[] = [
  {
    id: "ai",
    label: "AI Models",
    items: ["Claude", "ChatGPT", "Gemini", "Cursor", "v0", "Midjourney", "Windsurf"],
    intro: "AI tools used as research and pairing partners — not as the writer or the designer.",
    details: [
      { name: "Claude", note: "Long-context reasoning, copy editing, code review." },
      { name: "ChatGPT", note: "Quick research and structured exploration." },
      { name: "Gemini", note: "Visual prompts and asset references." },
      { name: "Cursor", note: "Inline AI pair-programming inside the editor." },
      { name: "v0", note: "First-pass UI explorations to compare against." },
      { name: "Midjourney", note: "Reference imagery and moodboarding." },
      { name: "Windsurf", note: "Agentic refactors across larger codebases." },
    ],
  },
  {
    id: "dev",
    label: "Development",
    items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vercel", "GitHub", "Node.js", "GSAP"],
    intro: "A modern, hand-coded stack — small, fast, and easy to hand to another developer.",
    details: [
      { name: "Next.js / React", note: "App Router for content sites, Vite for SPAs." },
      { name: "TypeScript", note: "Typed end-to-end, including build configs." },
      { name: "Tailwind CSS", note: "Design tokens shared between Figma and code." },
      { name: "GSAP / Lenis", note: "Performant motion and smooth scroll." },
      { name: "Vercel / Cloudflare", note: "Edge hosting, image optimisation, analytics." },
      { name: "Node.js", note: "API routes and tooling. Nothing else on the server." },
      { name: "GitHub", note: "Source under your account, never mine." },
    ],
  },
  {
    id: "design",
    label: "Design",
    items: ["Figma", "Photoshop", "Illustrator", "After Effects", "DaVinci Resolve", "Lightroom"],
    intro: "The classic Adobe set, plus Figma. Used for what each one is actually best at.",
    details: [
      { name: "Figma", note: "UI, components, and design tokens." },
      { name: "Photoshop", note: "Compositing, retouching, OG images." },
      { name: "Illustrator", note: "Wordmarks, icons, vector type." },
      { name: "After Effects", note: "Motion design and short-form animation." },
      { name: "DaVinci Resolve", note: "Edit, colour, and finishing for video." },
      { name: "Lightroom", note: "Photography pipeline for hero imagery." },
    ],
  },
];

export function Stack() {
  const ref = useRef<HTMLElement>(null);
  const titleRef = useHeadingReveal<HTMLHeadingElement>();
  const lensRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const [openCard, setOpenCard] = useState<StackCategory | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>("[data-stack-reveal]");
    const tween = gsap.fromTo(
      items,
      { y: 44, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 78%" },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  // Magnifier lens drag (replicates the previous build's behaviour)
  useEffect(() => {
    const viewport = viewportRef.current;
    const lens = lensRef.current;
    const base = baseRef.current;
    const reveal = revealRef.current;
    if (!viewport || !lens || !base || !reveal) return;

    const LENS_SIZE = 92;
    const REVEAL_RADIUS = 30;
    let lx = 0;
    let ly = 0;
    let startPX = 0;
    let startPY = 0;
    let startLX = 0;
    let startLY = 0;
    let isDragging = false;

    const applyLens = (x: number, y: number) => {
      lx = x;
      ly = y;
      const cx = `calc(50% + ${lx - 10}px)`;
      const cy = `calc(50% + ${ly - 10}px)`;
      lens.style.transform = `translate(calc(-50% + ${lx}px), calc(-50% + ${ly}px))`;
      const mask = `radial-gradient(circle ${REVEAL_RADIUS}px at ${cx} ${cy}, transparent 100%, black 100%)`;
      base.style.maskImage = mask;
      base.style.webkitMaskImage = mask;
      reveal.style.clipPath = `circle(${REVEAL_RADIUS}px at ${cx} ${cy})`;
    };

    applyLens(0, 0);

    const onDown = (e: PointerEvent) => {
      isDragging = true;
      startPX = e.clientX;
      startPY = e.clientY;
      startLX = lx;
      startLY = ly;
      lens.classList.add("dragging");
      lens.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const rect = viewport.getBoundingClientRect();
      const halfW = (rect.width - LENS_SIZE) / 2;
      const halfH = (rect.height - LENS_SIZE) / 2;
      const nx = Math.max(-halfW, Math.min(halfW, startLX + (e.clientX - startPX)));
      const ny = Math.max(-halfH, Math.min(halfH, startLY + (e.clientY - startPY)));
      applyLens(nx, ny);
    };
    const onUp = () => {
      isDragging = false;
      lens.classList.remove("dragging");
    };

    lens.addEventListener("pointerdown", onDown);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);

    return () => {
      lens.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
  }, []);

  // ESC closes modal
  useEffect(() => {
    if (!openCard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenCard(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCard]);

  return (
    <section ref={ref} id="stack" className="arsenal-section section" style={{ borderTop: "1px solid var(--td-line)" }}>
      <div className="container-x" style={{ maxWidth: 1200, marginInline: "auto" }}>
        <div className="arsenal-grid">
          <div className="arsenal-text" data-stack-reveal>
            <SectionTag label="Stack" />
            <h2 ref={titleRef} className="arsenal-h2 display" style={{ marginTop: 16 }}>Modern tools. Serious output.</h2>
            <p className="arsenal-sub">
              Every project ships with a hand-picked, production-grade stack. Drag the lens to read the underlying tech.
            </p>
          </div>

          <div className="bento-card" data-stack-reveal>
            <div className="bento-viewport" ref={viewportRef}>
              <div className="bento-base" ref={baseRef}>
                {BASE_ROWS.map((row, i) => (
                  <div key={i} className={`bento-row-track ${i % 2 === 0 ? "dir-left" : "dir-right"}`}>
                    {[...row, ...row, ...row].map((tag, j) => (
                      <span key={j} className="bento-tag">{tag}</span>
                    ))}
                  </div>
                ))}
              </div>
              <div className="bento-reveal" ref={revealRef}>
                {BASE_ROWS.map((row, i) => (
                  <div key={i} className={`bento-row-track ${i % 2 === 0 ? "dir-left" : "dir-right"}`}>
                    {[...row, ...row, ...row].map((tag, j) => (
                      <span key={j} className="bento-tag">{tag}</span>
                    ))}
                  </div>
                ))}
              </div>
              <div className="bento-lens" ref={lensRef} aria-label="Magnifier">
                <Magnifier />
                <span className="bento-lens-glare" />
              </div>
              <div className="bento-fade bento-fade-left" />
              <div className="bento-fade bento-fade-right" />
            </div>
            <div className="bento-footer">
              <h3>Built with the right tools</h3>
              <p>Modern stack, fast to ship, built to last. Drag the lens to magnify.</p>
            </div>
          </div>
        </div>

        <div className="arsenal-cards" data-stack-reveal>
          {STACK_CARDS.map((card) => (
            <button
              type="button"
              key={card.id}
              className="arsenal-card"
              onClick={() => setOpenCard(card)}
              aria-label={`Open ${card.label} details`}
            >
              <div className="arsenal-card-label">{card.label}</div>
              <div className="arsenal-pills">
                {card.items.map((tag) => (
                  <span key={tag} className="arsenal-pill">{tag}</span>
                ))}
              </div>
              <div className="arsenal-card-cta">
                <span>Read more</span>
                <span aria-hidden="true">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {openCard && (
        <StackModal card={openCard} onClose={() => setOpenCard(null)} />
      )}

      <style>{`
        .arsenal-section {
          padding-block: clamp(96px, 12vw, 192px);
          overflow: hidden;
        }
        .arsenal-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(36px, 5vw, 64px);
          align-items: center;
          margin-bottom: clamp(32px, 5vw, 56px);
        }
        @media (min-width: 900px) {
          .arsenal-grid { grid-template-columns: 1fr 1fr; }
        }
        .arsenal-text { max-width: 480px; }
        .arsenal-h2 {
          font-size: clamp(34px, 4.6vw, 64px);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0 0 16px;
          color: var(--td-fg);
        }
        .arsenal-sub {
          font-size: clamp(14px, 1.3vw, 16px);
          color: rgba(245,243,239,0.55);
          line-height: 1.65;
          margin: 0;
          max-width: 420px;
        }
        .bento-card {
          border-radius: clamp(18px, 2vw, 28px);
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.025);
          padding: 6px;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 4px 32px rgba(0,0,0,0.5);
          transition: box-shadow 480ms ease, transform 480ms ease;
          overflow: hidden;
          max-width: 100%;
        }
        .bento-card:hover {
          box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 12px 48px rgba(0,0,0,0.6), 0 0 60px rgba(232,36,26,0.07);
          transform: translateY(-4px);
        }
        .bento-viewport {
          position: relative;
          height: clamp(220px, 26vw, 320px);
          padding: 30px 0;
          overflow: hidden;
          border-radius: clamp(14px, 1.4vw, 22px);
          background: rgba(255,255,255,0.02);
          touch-action: none;
        }
        .bento-base, .bento-reveal {
          display: flex;
          flex-direction: column;
          gap: 14px;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .bento-base {
          position: relative;
          z-index: 1;
          mask-image: radial-gradient(circle 30px at calc(50% - 10px) calc(50% - 10px), transparent 100%, black 100%);
          -webkit-mask-image: radial-gradient(circle 30px at calc(50% - 10px) calc(50% - 10px), transparent 100%, black 100%);
        }
        .bento-reveal {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          user-select: none;
          clip-path: circle(30px at calc(50% - 10px) calc(50% - 10px));
        }
        .bento-row-track {
          display: flex;
          gap: 10px;
          width: max-content;
          align-items: center;
          will-change: transform;
        }
        @keyframes bento-left  { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
        @keyframes bento-right { from { transform: translateX(-33.333%); } to { transform: translateX(0); } }
        .bento-row-track.dir-left  { animation: bento-left  35s linear infinite; }
        .bento-row-track.dir-right { animation: bento-right 35s linear infinite; }
        .bento-card:hover .bento-row-track { animation-play-state: paused; }
        .bento-tag {
          display: inline-flex;
          align-items: center;
          padding: 6px 13px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,10,10,0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          white-space: nowrap;
          font-size: 11px;
          font-family: var(--font-body);
          color: rgba(245,243,239,0.48);
          line-height: 1;
        }
        .bento-reveal .bento-tag {
          background: #0a0a0a;
          border-color: rgba(232,36,26,0.3);
          color: var(--td-accent);
          font-weight: 500;
          box-shadow: 0 1px 6px rgba(0,0,0,0.3);
        }
        .bento-lens {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 92px;
          height: 92px;
          z-index: 10;
          cursor: grab;
          user-select: none;
          touch-action: none;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.55));
        }
        .bento-lens.dragging { cursor: grabbing; }
        .bento-lens svg { width: 92px; height: 92px; display: block; }
        .bento-lens-glare {
          position: absolute;
          top: 6px; left: 6px;
          width: 56px; height: 56px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          pointer-events: none;
        }
        .bento-fade {
          position: absolute;
          inset-block: 0;
          width: 22%;
          z-index: 5;
          pointer-events: none;
        }
        .bento-fade-left  { left: 0;  background: linear-gradient(to right, rgba(10,10,10,1), transparent); }
        .bento-fade-right { right: 0; background: linear-gradient(to left,  rgba(10,10,10,1), transparent); }
        .bento-footer { padding: 18px 20px 24px; }
        .bento-footer h3 {
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--td-fg);
          margin: 0 0 6px;
        }
        .bento-footer p {
          margin: 0;
          font-size: 12px;
          color: rgba(245,243,239,0.38);
          line-height: 1.6;
        }

        .arsenal-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 720px) { .arsenal-cards { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1000px) { .arsenal-cards { grid-template-columns: repeat(3, 1fr); } }

        .arsenal-card {
          appearance: none;
          font: inherit;
          text-align: left;
          color: inherit;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          padding: clamp(20px, 2vw, 28px);
          cursor: pointer;
          display: grid;
          gap: 16px;
          transition: border-color 280ms ease, background 280ms ease, transform 280ms ease;
        }
        .arsenal-card:hover,
        .arsenal-card:focus-visible {
          border-color: rgba(232,36,26,0.3);
          background: rgba(232,36,26,0.04);
          transform: translateY(-2px);
        }
        .arsenal-card-label {
          font-size: 9px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--td-accent);
          font-family: var(--font-mono);
        }
        .arsenal-pills { display: flex; flex-wrap: wrap; gap: 7px; }
        .arsenal-pill {
          padding: 5px 11px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          font-size: 11px;
          color: rgba(245,243,239,0.55);
          font-family: var(--font-body);
        }
        .arsenal-card-cta {
          display: inline-flex;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--td-fg);
          opacity: 0.78;
        }
        .arsenal-card:hover .arsenal-card-cta { color: var(--td-accent); opacity: 1; }

        @media (max-width: 600px) {
          .bento-tag { font-size: 10px; padding: 5px 11px; }
          .bento-card { border-radius: 18px; }
          .bento-viewport { border-radius: 14px; padding: 20px 0; }
          .arsenal-pill { font-size: 10px; padding: 4px 9px; }
        }

        /* Modal */
        .stack-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(5,5,6,0.78);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: grid;
          place-items: center;
          padding: clamp(20px, 4vw, 48px);
          animation: stack-modal-fade 220ms ease-out;
        }
        .stack-modal {
          position: relative;
          width: min(100%, 720px);
          max-height: 84svh;
          overflow: auto;
          background: rgba(10,10,10,0.96);
          border: 1px solid rgba(245,243,239,0.12);
          border-radius: 14px;
          padding: clamp(28px, 4vw, 56px);
          box-shadow: 0 36px 120px rgba(0,0,0,0.65);
          animation: stack-modal-pop 360ms cubic-bezier(0.65,0.05,0.36,1);
        }
        @keyframes stack-modal-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes stack-modal-pop {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .stack-modal__close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          background: transparent;
          border: 1px solid var(--td-line-strong);
          color: var(--td-fg);
          border-radius: 999px;
          cursor: pointer;
          transition: background 220ms, color 220ms;
        }
        .stack-modal__close:hover { background: var(--td-fg); color: var(--td-bg); }
        .stack-modal__eyebrow {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--td-accent);
          margin-bottom: 14px;
        }
        .stack-modal__title {
          font-family: var(--font-display);
          font-size: clamp(28px, 3.6vw, 44px);
          line-height: 1.02;
          letter-spacing: -0.02em;
          margin: 0 0 14px;
        }
        .stack-modal__intro {
          color: var(--td-fg-2);
          font-size: clamp(15px, 1.4vw, 17px);
          line-height: 1.6;
          margin: 0 0 26px;
          max-width: 560px;
        }
        .stack-modal__list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 8px;
        }
        .stack-modal__list li {
          display: grid;
          grid-template-columns: minmax(120px, 0.4fr) 1fr;
          gap: clamp(12px, 2vw, 28px);
          padding: 14px 16px;
          border: 1px solid rgba(245,243,239,0.07);
          border-radius: 10px;
          background: rgba(255,255,255,0.018);
        }
        .stack-modal__list li strong {
          font-weight: 500;
          font-family: var(--font-display);
          font-size: clamp(14px, 1.3vw, 16px);
          color: var(--td-fg);
        }
        .stack-modal__list li span {
          font-size: clamp(13px, 1.2vw, 15px);
          line-height: 1.55;
          color: var(--td-fg-2);
        }
        @media (max-width: 540px) {
          .stack-modal__list li { grid-template-columns: 1fr; gap: 4px; }
        }
      `}</style>
    </section>
  );
}

function StackModal({ card, onClose }: { card: StackCategory; onClose: () => void }) {
  return (
    <div className="stack-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="stack-modal-title" onClick={onClose}>
      <div className="stack-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="stack-modal__close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
        <div className="stack-modal__eyebrow">{card.label}</div>
        <h3 id="stack-modal-title" className="stack-modal__title">{card.label} stack</h3>
        <p className="stack-modal__intro">{card.intro}</p>
        <ul className="stack-modal__list">
          {card.details.map((d) => (
            <li key={d.name}>
              <strong>{d.name}</strong>
              <span>{d.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Magnifier() {
  return (
    <svg viewBox="0 0 512 512" fill="none" aria-hidden="true">
      <path d="M365.424 335.392L342.24 312.192L311.68 342.736L334.88 365.936L365.424 335.392Z" fill="#B0BDC6" />
      <path d="M358.08 342.736L334.88 319.552L319.04 335.392L342.24 358.584L358.08 342.736Z" fill="#DFE9EF" />
      <path d="M352.368 321.808L342.752 312.192L312.208 342.752L321.824 352.36L352.368 321.808Z" fill="#B0BDC6" />
      <path d="M332 332C260 404 142.4 404 69.6001 332C-2.3999 260 -2.3999 142.4 69.6001 69.6C141.6 -3.20003 259.2 -2.40002 332 69.6C404.8 142.4 404.8 260 332 332ZM315.2 87.2C252 24 150.4 24 88.0001 87.2C24.8001 150.4 24.8001 252 88.0001 314.4C151.2 377.6 252.8 377.6 315.2 314.4C377.6 252 377.6 150.4 315.2 87.2Z" fill="#DFE9EF" />
      <path d="M319.2 319.2C254.4 384 148.8 384 83.2001 319.2C18.4001 254.4 18.4001 148.8 83.2001 83.2C148 18.4 253.6 18.4 319.2 83.2C384 148.8 384 254.4 319.2 319.2ZM310.4 92C250.4 32 152 32 92.0001 92C32.0001 152 32.0001 250.4 92.0001 310.4C152 370.4 250.4 370.4 310.4 310.4C370.4 250.4 370.4 152 310.4 92Z" fill="#7A858C" />
      <path d="M484.104 428.784L373.8 318.472L318.36 373.912L428.672 484.216L484.104 428.784Z" fill="#333333" />
      <path d="M471.664 441.224L361.344 330.928L330.8 361.48L441.12 471.76L471.664 441.224Z" fill="#575B5E" />
      <path d="M495.2 423.2C504 432 432.8 504 423.2 495.2L417.6 489.6C408.8 480.8 480 408.8 489.6 417.6L495.2 423.2Z" fill="#B0BDC6" />
      <path d="M483.2 435.2C492 444 444.8 492 435.2 483.2L429.6 477.6C420.8 468.8 468 420.8 477.6 429.6L483.2 435.2Z" fill="#DFE9EF" />
    </svg>
  );
}
