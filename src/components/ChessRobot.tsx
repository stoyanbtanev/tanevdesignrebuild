import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Settings2, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  MOODS,
  pickQuip,
  type CategoryId,
  type MoodId,
} from '@/data/chessQuips';

/* ═══════════════════════════════════════════════════════════════════════════
   TANEV-01 — Chess Commentator Robot  (LEGEND EDITION)
   ─ Watches the board, tilts its head toward your cursor
   ─ Five selectable moods with their own color palette & font
   ─ Spice level 0-3, typing speed, shake toggle, cursor-tracking toggle
   ─ All settings persist to localStorage
═══════════════════════════════════════════════════════════════════════════ */

export type ChessRobotEventType =
  | 'idle'
  | 'newGame'
  | 'aiThinking'
  | 'move'
  | 'capture'
  | 'captureBig'
  | 'check'
  | 'checkmate'
  | 'castle'
  | 'promote'
  | 'draw';

export interface ChessRobotEvent {
  type: ChessRobotEventType;
  by?: 'player' | 'ai';
  san?: string;
  seq: number;
}

interface ChessRobotProps {
  event: ChessRobotEvent | null;
}

type Spice = 0 | 1 | 2 | 3;
type SpeedPref = 'auto' | 'slow' | 'normal' | 'fast' | 'instant';

const STORAGE_KEYS = {
  mood: 'tanev_robot_mood',
  spice: 'tanev_robot_spice',
  speed: 'tanev_robot_speed',
  track: 'tanev_robot_track',
  shake: 'tanev_robot_shake',
} as const;

function readStored<T>(key: string, fallback: T, parse: (s: string) => T): T {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : parse(v);
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* no-op */ }
}

const SPEED_MAP: Record<Exclude<SpeedPref, 'auto'>, number> = {
  slow: 48,
  normal: 24,
  fast: 12,
  instant: 0,
};

const IDLE_INTERVAL_MS = 17000;

/* ─── Map an event to a category key used by the quip bank ───────────── */
function eventToCategory(evt: ChessRobotEvent): CategoryId {
  switch (evt.type) {
    case 'newGame':    return 'newGame';
    case 'idle':       return 'idle';
    case 'aiThinking': return 'aiThinking';
    case 'draw':       return 'draw';
    case 'move':
    case 'capture':
    case 'captureBig':
    case 'check':
    case 'checkmate':
    case 'castle':
    case 'promote':
      return `${evt.type}_${evt.by ?? 'player'}` as CategoryId;
  }
}

/* ─── Robot SVG portrait (matte-black, tanev silhouette) ──────────────── */
function RobotPortrait({
  alert,
  headRx,
  headRy,
  eyeTx,
  eyeTy,
}: {
  alert: boolean;
  headRx: number;
  headRy: number;
  eyeTx: number;
  eyeTy: number;
}) {
  return (
    <svg
      className={`robot-portrait${alert ? ' robot-portrait--alert' : ''}`}
      viewBox="0 0 240 280"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id="robot-body-grad" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="60%" stopColor="#0a0a0a" />
          <stop offset="100%" stopColor="#030303" />
        </radialGradient>
        <radialGradient id="robot-visor-grad" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#141414" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="robot-eye-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--robot-eye-inner, #ff6a5e)" />
          <stop offset="40%" stopColor="var(--robot-accent, #E8241A)" />
          <stop offset="100%" stopColor="var(--robot-eye-outer, #3a0a06)" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="120" cy="268" rx="78" ry="5" fill="#000" opacity="0.55" />
      <ellipse cx="120" cy="268" rx="50" ry="3" fill="#000" opacity="0.85" />

      {/* Torso */}
      <g>
        <path d="M 78 200 Q 76 225, 92 240 L 148 240 Q 164 225, 162 200 Z" fill="url(#robot-body-grad)" />
        <path
          d="M 70 130 Q 68 110, 88 104 L 152 104 Q 172 110, 170 130 L 168 205 Q 166 218, 150 220 L 90 220 Q 74 218, 72 205 Z"
          fill="url(#robot-body-grad)"
        />
        <path d="M 120 108 L 120 218" stroke="#1f1f1f" strokeWidth="0.6" opacity="0.8" />
        <ellipse cx="60" cy="128" rx="22" ry="20" fill="url(#robot-body-grad)" />
        <ellipse cx="180" cy="128" rx="22" ry="20" fill="url(#robot-body-grad)" />
        <path d="M 44 130 Q 38 170, 50 200 L 62 200 Q 60 170, 70 140 Z" fill="url(#robot-body-grad)" />
        <path d="M 196 130 Q 202 170, 190 200 L 178 200 Q 180 170, 170 140 Z" fill="url(#robot-body-grad)" />
        <rect x="108" y="90" width="24" height="18" rx="4" fill="#0a0a0a" />
        <rect x="108" y="90" width="24" height="4" fill="#1a1a1a" />
      </g>

      {/* Head group — rotates toward cursor */}
      <g
        className="robot-head"
        style={{
          transform: `rotate(${headRx}deg) rotate(${headRy}deg)`,
          transformOrigin: '120px 100px',
          transformBox: 'view-box',
          transition: 'transform 0.18s cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <path
          d="M 72 60 Q 72 24, 108 18 L 132 18 Q 168 24, 168 60 L 168 80 Q 168 92, 156 96 L 84 96 Q 72 92, 72 80 Z"
          fill="url(#robot-body-grad)"
        />
        <path
          d="M 82 32 Q 100 22, 120 22 Q 140 22, 158 32"
          stroke="#2a2a2a"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
        {/* Visor */}
        <path
          d="M 84 50 Q 84 42, 96 40 L 144 40 Q 156 42, 156 50 L 156 70 Q 156 76, 150 78 L 90 78 Q 84 76, 84 70 Z"
          fill="url(#robot-visor-grad)"
          stroke="#0a0a0a"
          strokeWidth="0.5"
        />
        <path
          d="M 92 46 Q 100 43, 110 43 L 120 43"
          stroke="#3a3a3a"
          strokeWidth="1"
          fill="none"
          opacity="0.45"
          strokeLinecap="round"
        />
        {/* Side pods */}
        <rect x="68" y="56" width="6" height="18" rx="2" fill="#050505" />
        <rect x="166" y="56" width="6" height="18" rx="2" fill="#050505" />

        {/* Eyes — translate toward cursor within the visor */}
        <g
          style={{
            transform: `translate(${eyeTx}px, ${eyeTy}px)`,
            transition: 'transform 0.15s cubic-bezier(.2,.8,.2,1)',
          }}
        >
          <circle cx="108" cy="58" r="2.4" fill="url(#robot-eye-grad)" className="robot-eye" />
          <circle cx="132" cy="58" r="2.4" fill="url(#robot-eye-grad)" className="robot-eye" />
          <circle cx="108" cy="58" r="5.5" fill="var(--robot-accent, #E8241A)" opacity="0.18" className="robot-eye-halo" />
          <circle cx="132" cy="58" r="5.5" fill="var(--robot-accent, #E8241A)" opacity="0.18" className="robot-eye-halo" />
        </g>
      </g>

      {/* Chest heartbeat */}
      <g>
        <circle cx="120" cy="158" r="6" fill="#0a0a0a" stroke="#141414" strokeWidth="0.5" />
        <circle cx="120" cy="158" r="2.2" fill="var(--robot-accent, #E8241A)" className="robot-chest-led" />
      </g>

      <path d="M 76 120 Q 74 160, 80 200" stroke="#1a1a1a" strokeWidth="0.6" fill="none" opacity="0.7" />
    </svg>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function ChessRobot({ event }: ChessRobotProps) {
  const { lang } = useLanguage();

  // Persisted preferences
  const [mood, setMood] = useState<MoodId>(() => readStored(STORAGE_KEYS.mood, 'gentleman' as MoodId, (s) => {
    return (['gentleman','trash','philosopher','chaos','silent'].includes(s) ? s : 'gentleman') as MoodId;
  }));
  const [spice, setSpice] = useState<Spice>(() => readStored(STORAGE_KEYS.spice, 1 as Spice, (s) => {
    const n = Number(s);
    return ((n >= 0 && n <= 3) ? n : 1) as Spice;
  }));
  const [speedPref, setSpeedPref] = useState<SpeedPref>(() => readStored(STORAGE_KEYS.speed, 'auto' as SpeedPref, (s) =>
    (['auto','slow','normal','fast','instant'].includes(s) ? s : 'auto') as SpeedPref
  ));
  const [trackCursor, setTrackCursor] = useState<boolean>(() => readStored(STORAGE_KEYS.track, true, (s) => s === '1'));
  const [shakeOn, setShakeOn] = useState<boolean>(() => readStored(STORAGE_KEYS.shake, true, (s) => s === '1'));

  // UI state
  const [panelOpen, setPanelOpen] = useState(false);

  // Quip + typewriter state
  const [quip, setQuip] = useState<{ text: string; id: string } | null>(null);
  const [typed, setTyped] = useState('');
  const [alert, setAlert] = useState(false);

  // Cursor-tracking state (the SVG head rotates / eyes translate)
  const [headRx, setHeadRx] = useState(0);
  const [headRy, setHeadRy] = useState(0);
  const [eyeTx, setEyeTx] = useState(0);
  const [eyeTy, setEyeTy] = useState(0);

  // Refs
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingMouseRef = useRef<{ x: number; y: number } | null>(null);

  const moodDef = MOODS[mood];

  const highImpact = useMemo(() => {
    if (!event) return false;
    return ['checkmate', 'check', 'captureBig', 'promote'].includes(event.type);
  }, [event]);

  const effectiveTypeSpeed = useMemo(() => {
    if (speedPref === 'auto') return moodDef.typeSpeed;
    return SPEED_MAP[speedPref];
  }, [speedPref, moodDef.typeSpeed]);

  /* ─── Persist preferences ───────────────────────────────────────────── */
  useEffect(() => { writeStored(STORAGE_KEYS.mood, mood); }, [mood]);
  useEffect(() => { writeStored(STORAGE_KEYS.spice, String(spice)); }, [spice]);
  useEffect(() => { writeStored(STORAGE_KEYS.speed, speedPref); }, [speedPref]);
  useEffect(() => { writeStored(STORAGE_KEYS.track, trackCursor ? '1' : '0'); }, [trackCursor]);
  useEffect(() => { writeStored(STORAGE_KEYS.shake, shakeOn ? '1' : '0'); }, [shakeOn]);

  /* ─── Pick a quip on each new event ─────────────────────────────────── */
  useEffect(() => {
    if (!event) return;
    // ordinary moves: mood-dependent response rate
    if (event.type === 'move' && Math.random() > moodDef.responseRate) return;
    // silent monk: even for big events, occasionally stay quiet (but never for mate/draw)
    if (
      mood === 'silent' &&
      event.type !== 'checkmate' &&
      event.type !== 'draw' &&
      event.type !== 'newGame' &&
      Math.random() > moodDef.responseRate * 2
    ) return;

    const category = eventToCategory(event);
    const picked = pickQuip({ mood, category, lang, spice, lastId: lastIdRef.current });
    if (!picked) return;
    lastIdRef.current = picked.id;
    setQuip(picked);

    if (highImpact && shakeOn) {
      setAlert(true);
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = setTimeout(() => setAlert(false), 1400);
    } else {
      setAlert(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  /* ─── Re-translate the current quip when language flips ─────────────── */
  useEffect(() => {
    if (!quip) return;
    const parts = quip.id.split(':');
    if (parts.length !== 3) return;
    const [m, cat, idxStr] = parts;
    const repicked = pickQuip({
      mood: m as MoodId,
      category: cat as CategoryId,
      lang,
      spice,
      // force the same quip by pretending all others were last
      lastId: null,
    });
    // Simpler approach: just switch to first-available in same mood+category.
    // If we can't, keep what we have.
    if (repicked && repicked.id.startsWith(`${m}:${cat}:`) && repicked.id.endsWith(`:${idxStr}`)) {
      setQuip(repicked);
    } else if (repicked) {
      setQuip(repicked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  /* ─── Idle rotation — resets whenever event changes ─────────────────── */
  useEffect(() => {
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    idleTimerRef.current = setInterval(() => {
      const picked = pickQuip({ mood, category: 'idle', lang, spice, lastId: lastIdRef.current });
      if (!picked) return;
      lastIdRef.current = picked.id;
      setQuip(picked);
    }, IDLE_INTERVAL_MS);
    return () => { if (idleTimerRef.current) clearInterval(idleTimerRef.current); };
  }, [event, lang, mood, spice]);

  /* ─── Re-pick when the mood changes (so the robot introduces himself) ─ */
  useEffect(() => {
    const picked = pickQuip({ mood, category: 'newGame', lang, spice, lastId: null });
    if (picked) {
      lastIdRef.current = picked.id;
      setQuip(picked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood]);

  /* ─── Typewriter animation ──────────────────────────────────────────── */
  useEffect(() => {
    if (!quip) return;
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    if (effectiveTypeSpeed === 0) {
      setTyped(quip.text);
      return;
    }
    setTyped('');
    let i = 0;
    typeTimerRef.current = setInterval(() => {
      i += 1;
      setTyped(quip.text.slice(0, i));
      if (i >= quip.text.length) {
        if (typeTimerRef.current) clearInterval(typeTimerRef.current);
      }
    }, effectiveTypeSpeed);
    return () => { if (typeTimerRef.current) clearInterval(typeTimerRef.current); };
  }, [quip, effectiveTypeSpeed]);

  /* ─── Cursor tracking ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!trackCursor) {
      setHeadRx(0); setHeadRy(0); setEyeTx(0); setEyeTy(0);
      return;
    }
    // Respect reduced-motion preference
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const onMove = (e: MouseEvent) => {
      pendingMouseRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const pm = pendingMouseRef.current;
        if (!pm) return;
        const el = frameRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // Normalise cursor offset from center, clamp -1..1
        const dx = Math.max(-1, Math.min(1, (pm.x - cx) / (r.width * 1.5)));
        const dy = Math.max(-1, Math.min(1, (pm.y - cy) / (r.height * 1.5)));
        // Head: subtle tilt — max ±10deg on Y (horizontal), ±6deg on X (vertical)
        setHeadRy(dx * 10);
        setHeadRx(-dy * 6);
        // Eyes: max ±3px translate for the "he is watching" effect
        setEyeTx(dx * 3);
        setEyeTy(dy * 2.5);
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [trackCursor]);

  /* ─── Cleanup ───────────────────────────────────────────────────── */
  useEffect(() => () => {
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, []);

  /* ─── Close panel on ESC + outside-tap ───────────────────────────── */
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPanelOpen(false); };
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(e.target as Node)) return;
      setPanelOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown, true);
    };
  }, [panelOpen]);

  const handleReset = useCallback(() => {
    setMood('gentleman');
    setSpice(1);
    setSpeedPref('auto');
    setTrackCursor(true);
    setShakeOn(true);
  }, []);

  const rootStyle = useMemo(() => ({
    ['--robot-accent' as string]: moodDef.accent,
    ['--robot-halo' as string]: moodDef.halo,
    ['--robot-font' as string]: moodDef.font,
  }) as React.CSSProperties, [moodDef]);

  const moodList: MoodId[] = ['gentleman', 'trash', 'philosopher', 'chaos', 'silent'];
  const spiceLabels = [
    { n: 0, en: 'Safe',    bg: 'Чисто' },
    { n: 1, en: 'Sprinkle', bg: 'Леко' },
    { n: 2, en: 'Spicy',    bg: 'Люто' },
    { n: 3, en: 'Savage',   bg: 'Жестоко' },
  ] as const;
  const speedLabels: { v: SpeedPref; en: string; bg: string }[] = [
    { v: 'auto',    en: 'Auto',    bg: 'Авто' },
    { v: 'slow',    en: 'Slow',    bg: 'Бавно' },
    { v: 'normal',  en: 'Normal',  bg: 'Нормално' },
    { v: 'fast',    en: 'Fast',    bg: 'Бързо' },
    { v: 'instant', en: 'Instant', bg: 'Мигновено' },
  ];

  return (
    <div
      ref={rootRef}
      className={`chess-robot chess-robot--mood-${mood}${alert ? ' chess-robot--alert' : ''}${panelOpen ? ' chess-robot--panel-open' : ''}`}
      style={rootStyle}
      aria-live="polite"
    >
      <div className="chess-robot__frame" ref={frameRef}>
        <span className="chess-robot__corner chess-robot__corner--tl" aria-hidden />
        <span className="chess-robot__corner chess-robot__corner--tr" aria-hidden />
        <span className="chess-robot__corner chess-robot__corner--bl" aria-hidden />
        <span className="chess-robot__corner chess-robot__corner--br" aria-hidden />

        {/* Gear button — opens the customization panel */}
        <button
          type="button"
          className="chess-robot__gear"
          aria-label={lang === 'bg' ? 'Настройки на коментатора' : 'Commentator settings'}
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen((v) => !v)}
        >
          {panelOpen ? <X size={14} strokeWidth={2} /> : <Settings2 size={14} strokeWidth={2} />}
        </button>

        <div className="chess-robot__screen">
          <RobotPortrait alert={alert} headRx={headRx} headRy={headRy} eyeTx={eyeTx} eyeTy={eyeTy} />
          <div className="chess-robot__scanlines" aria-hidden />
        </div>

        <div className="chess-robot__badge">
          <span className="chess-robot__dot" aria-hidden />
          <span className="chess-robot__label">
            TANEV-01 / {moodDef.label[lang]}
          </span>
        </div>

        {/* Customization panel */}
        {panelOpen && (
          <div
            className="chess-robot__panel"
            role="dialog"
            aria-label={lang === 'bg' ? 'Персонализация на робота' : 'Robot customization'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chess-robot__panel-section">
              <div className="chess-robot__panel-title">
                {lang === 'bg' ? 'НАСТРОЕНИЕ' : 'MOOD'}
              </div>
              <div className="chess-robot__moods">
                {moodList.map((m) => {
                  const def = MOODS[m];
                  return (
                    <button
                      key={m}
                      type="button"
                      className={`chess-robot__mood-chip${m === mood ? ' is-active' : ''}`}
                      style={{ ['--chip-accent' as string]: def.accent }}
                      onClick={() => setMood(m)}
                      aria-pressed={m === mood}
                    >
                      <span className="chess-robot__mood-swatch" aria-hidden />
                      <span>{def.label[lang]}</span>
                    </button>
                  );
                })}
              </div>
              <div className="chess-robot__tagline">{moodDef.tagline[lang]}</div>
            </div>

            <div className="chess-robot__panel-section">
              <div className="chess-robot__panel-title">
                {lang === 'bg' ? 'ЛЮТИВОСТ' : 'SPICE'}
              </div>
              <div className="chess-robot__spice">
                {spiceLabels.map((sl) => (
                  <button
                    key={sl.n}
                    type="button"
                    className={`chess-robot__pill${spice === sl.n ? ' is-active' : ''}`}
                    onClick={() => setSpice(sl.n as Spice)}
                    aria-pressed={spice === sl.n}
                  >
                    {lang === 'bg' ? sl.bg : sl.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="chess-robot__panel-section">
              <div className="chess-robot__panel-title">
                {lang === 'bg' ? 'СКОРОСТ НА ПИСАНЕ' : 'TYPING SPEED'}
              </div>
              <div className="chess-robot__speed">
                {speedLabels.map((sl) => (
                  <button
                    key={sl.v}
                    type="button"
                    className={`chess-robot__pill${speedPref === sl.v ? ' is-active' : ''}`}
                    onClick={() => setSpeedPref(sl.v)}
                    aria-pressed={speedPref === sl.v}
                  >
                    {lang === 'bg' ? sl.bg : sl.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="chess-robot__panel-section chess-robot__panel-section--toggles">
              <label className="chess-robot__toggle">
                <input
                  type="checkbox"
                  checked={trackCursor}
                  onChange={(e) => setTrackCursor(e.target.checked)}
                />
                <span className="chess-robot__toggle-label">
                  {lang === 'bg' ? 'Следи курсора' : 'Track cursor'}
                </span>
              </label>
              <label className="chess-robot__toggle">
                <input
                  type="checkbox"
                  checked={shakeOn}
                  onChange={(e) => setShakeOn(e.target.checked)}
                />
                <span className="chess-robot__toggle-label">
                  {lang === 'bg' ? 'Реакция на големи ходове' : 'React to big moves'}
                </span>
              </label>
            </div>

            <button
              type="button"
              className="chess-robot__reset"
              onClick={handleReset}
            >
              {lang === 'bg' ? 'Върни по подразбиране' : 'Reset to default'}
            </button>
          </div>
        )}
      </div>

      <div className="chess-robot__bubble" role="status">
        <span className="chess-robot__bubble-caret" aria-hidden>›</span>
        <p className="chess-robot__bubble-text">
          {typed}
          {typed.length < (quip?.text.length ?? 0) && (
            <span className="chess-robot__cursor" aria-hidden>_</span>
          )}
        </p>
      </div>
    </div>
  );
}
