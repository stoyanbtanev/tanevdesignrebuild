import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Zap, Box, Sparkles, Film, Search, RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export type OrbitalNode = {
  id: string;
  code: string;
  titleEn: string;
  titleBg: string;
  descEn: string;
  descBg: string;
  icon: JSX.Element;
  tag: string;
  status: 'LIVE' | 'FAST' | 'CORE' | 'NEW';
  energy: number; // 0-100
  relatedIds: string[];
};

const ICON_MAP: Record<string, JSX.Element> = {
  static: <Zap size={16} strokeWidth={2} />,
  motion: <Box size={16} strokeWidth={2} />,
  brand: <Sparkles size={16} strokeWidth={2} />,
  video: <Film size={16} strokeWidth={2} />,
  seo: <Search size={16} strokeWidth={2} />,
  redesign: <RefreshCw size={16} strokeWidth={2} />,
};

export const SERVICE_NODES: OrbitalNode[] = [
  {
    id: 'static',
    code: '01',
    titleEn: 'Static Sites',
    titleBg: 'Статични сайтове',
    descEn: 'Sub-second loads. Built to convert before they think twice. Hand-coded — no page builders.',
    descBg: 'Зарежда за секунда. Конвертира преди да се замислят. Ръчен код — без конструктори.',
    icon: ICON_MAP.static,
    tag: 'Performance',
    status: 'FAST',
    energy: 95,
    relatedIds: ['motion', 'seo'],
  },
  {
    id: 'motion',
    code: '02',
    titleEn: '3D & Motion',
    titleBg: '3D и движение',
    descEn: 'The kind of site people share at 2 AM. Real WebGL and GSAP — not templates.',
    descBg: 'Сайтът, който споделят в 2 сутринта. WebGL и GSAP — без шаблони.',
    icon: ICON_MAP.motion,
    tag: 'WebGL / GSAP',
    status: 'NEW',
    energy: 88,
    relatedIds: ['static', 'brand'],
  },
  {
    id: 'brand',
    code: '03',
    titleEn: 'Brand Identity',
    titleBg: 'Бранд идентичност',
    descEn: 'Your brand should not look like the competition. Logo, type, color — crafted to be yours.',
    descBg: 'Брандът ти не трябва да прилича на конкурента. Лого, шрифт, цвят — направени да бъдат твои.',
    icon: ICON_MAP.brand,
    tag: 'Visual DNA',
    status: 'CORE',
    energy: 82,
    relatedIds: ['motion', 'video'],
  },
  {
    id: 'video',
    code: '04',
    titleEn: 'Video',
    titleBg: 'Видео',
    descEn: 'Edited to stop the scroll from the first frame. Short-form, long-form, product.',
    descBg: 'Монтирано да спира скрола от първия кадър. Кратко, дълго, продуктово.',
    icon: ICON_MAP.video,
    tag: 'Editing',
    status: 'LIVE',
    energy: 70,
    relatedIds: ['brand'],
  },
  {
    id: 'seo',
    code: '05',
    titleEn: 'SEO',
    titleBg: 'SEO',
    descEn: 'When clients search, they find you — not the competition. On-page SEO baked into every build.',
    descBg: 'Когато търсят — намират теб, не конкуренцията. SEO, вградено във всеки проект.',
    icon: ICON_MAP.seo,
    tag: 'Organic Growth',
    status: 'CORE',
    energy: 78,
    relatedIds: ['static'],
  },
  {
    id: 'redesign',
    code: '06',
    titleEn: 'Full Redesign',
    titleBg: 'Пълен редизайн',
    descEn: 'If you are embarrassed to share your own site — it is time. Total rebuild. No compromise with the old.',
    descBg: 'Ако се притесняваш да покажеш сайта си — дойде моментът. Пълна подмяна. Без компромиси със старото.',
    icon: ICON_MAP.redesign,
    tag: 'Rebuild',
    status: 'NEW',
    energy: 90,
    relatedIds: ['static', 'brand'],
  },
];

export default function RadialOrbitalTimeline() {
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [angle, setAngle] = useState(0);
  const [pulseId, setPulseId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Auto-rotate loop
  useEffect(() => {
    if (!autoRotate) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setAngle((a) => (a + dt * 12) % 360); // 12deg/s, one lap ~30s
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [autoRotate]);

  // Pulse for related nodes
  useEffect(() => {
    if (!expanded) return;
    const node = SERVICE_NODES.find((n) => n.id === expanded);
    if (!node) return;
    let i = 0;
    const iv = setInterval(() => {
      setPulseId(node.relatedIds[i % node.relatedIds.length]);
      i++;
    }, 700);
    return () => clearInterval(iv);
  }, [expanded]);

  const toggleNode = useCallback((id: string) => {
    setExpanded((cur) => {
      const next = cur === id ? null : id;
      setAutoRotate(next === null);
      return next;
    });
  }, []);

  const onBgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setExpanded(null);
      setAutoRotate(true);
    }
  };

  const radius = 220;
  const mobileRadius = 150;

  return (
    <section className="orbital" id="services" onClick={onBgClick}>
      <span className="orbital__label">/ {lang === 'bg' ? 'УСЛУГИ' : 'SERVICES'}</span>

      <div className="orbital__intro">
        <h2>
          {lang === 'bg' ? (
            <>ШЕСТ УСЛУГИ. ЕДИН СТАНДАРТ.</>
          ) : (
            <>SIX SERVICES. ONE STANDARD.</>
          )}
        </h2>
        <p>
          {lang === 'bg'
            ? 'Кликни върху орбита, за да разгледаш. Всичко, от което проектът ти има нужда — под един покрив.'
            : 'Tap any orbit to explore. Every discipline your project needs — under one roof.'}
        </p>
      </div>

      <div className="orbital__stage" ref={containerRef}>
        {/* Central core */}
        <div className="orbital__core" aria-hidden>
          <div className="orbital__core-ring" />
          <div className="orbital__core-ring orbital__core-ring--2" />
          <div className="orbital__core-inner">
            <span className="orbital__core-t">T</span>
            <span className="orbital__core-slash" />
            <span className="orbital__core-d">D</span>
          </div>
        </div>

        {/* Orbit rings */}
        <div className="orbital__ring orbital__ring--1" />
        <div className="orbital__ring orbital__ring--2" />

        {/* Nodes */}
        <div className="orbital__nodes">
          {SERVICE_NODES.map((node, i) => {
            const total = SERVICE_NODES.length;
            const nodeAngle = (i * 360) / total + angle;
            const rad = (nodeAngle * Math.PI) / 180;
            const r = window.innerWidth < 640 ? mobileRadius : radius;
            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;
            const zIndex = Math.round(100 + 50 * Math.cos(rad));
            const opacity = Math.max(0.45, 0.55 + 0.45 * Math.cos(rad));
            const isExpanded = expanded === node.id;
            const flipCardUp = y > 10; // node in bottom half → open card upward
            const isRelated =
              expanded &&
              SERVICE_NODES.find((n) => n.id === expanded)?.relatedIds.includes(node.id);
            const isPulse = pulseId === node.id;

            return (
              <div
                key={node.id}
                className={`orbital__node ${isExpanded ? 'is-expanded' : ''} ${
                  isRelated ? 'is-related' : ''
                } ${isPulse ? 'is-pulse' : ''}`}
                style={{
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                  zIndex: isExpanded ? 300 : zIndex,
                  opacity: isExpanded ? 1 : opacity,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.id);
                }}
              >
                <div className="orbital__node-halo" />
                <button
                  type="button"
                  className="orbital__node-btn"
                  aria-expanded={isExpanded}
                  aria-label={lang === 'bg' ? node.titleBg : node.titleEn}
                >
                  {node.icon}
                </button>
                <div className="orbital__node-label">
                  {lang === 'bg' ? node.titleBg : node.titleEn}
                </div>

                {isExpanded && (
                  <div
                    className={`orbital__card ${flipCardUp ? 'orbital__card--up' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="orbital__card-top">
                      <span className={`orbital__status orbital__status--${node.status.toLowerCase()}`}>
                        {node.status}
                      </span>
                      <span className="orbital__code">{node.code}</span>
                    </div>
                    <h3 className="orbital__card-title">
                      {lang === 'bg' ? node.titleBg : node.titleEn}
                    </h3>
                    <p className="orbital__card-desc">
                      {lang === 'bg' ? node.descBg : node.descEn}
                    </p>
                    <div className="orbital__card-meta">
                      <span>{node.tag}</span>
                      <span className="orbital__dot" />
                      <span>
                        {lang === 'bg' ? 'Интензитет' : 'Energy'} {node.energy}%
                      </span>
                    </div>
                    <div className="orbital__card-bar">
                      <div
                        className="orbital__card-bar-fill"
                        style={{ width: `${node.energy}%` }}
                      />
                    </div>
                    {node.relatedIds.length > 0 && (
                      <div className="orbital__related">
                        <span className="orbital__related-label">
                          {lang === 'bg' ? 'Свързано с' : 'Pairs with'}
                        </span>
                        <div className="orbital__related-chips">
                          {node.relatedIds.map((rid) => {
                            const r = SERVICE_NODES.find((n) => n.id === rid);
                            if (!r) return null;
                            return (
                              <button
                                key={rid}
                                className="orbital__chip"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpanded(rid);
                                  setAutoRotate(false);
                                }}
                              >
                                {lang === 'bg' ? r.titleBg : r.titleEn}
                                <ArrowRight size={12} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`orbital__hint ${expanded ? 'is-hidden' : ''}`}>
        {lang === 'bg'
          ? 'Кликни на услуга за детайли • Кликни извън, за да затвориш'
          : 'Click a service to expand • Click outside to close'}
      </div>
    </section>
  );
}
