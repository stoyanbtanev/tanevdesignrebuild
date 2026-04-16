import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/* ═══════════════════════════════════════════════════════════════════════════
   TANEV-01 — Chess Commentator Robot
   ─ Sits next to the board and watches the game
   ─ Drops dry English-satire quips on decisive moves
   ─ Ambient idle wit while the player is thinking
═══════════════════════════════════════════════════════════════════════════ */

export type ChessRobotEventType =
  | 'idle'
  | 'newGame'
  | 'aiThinking'
  | 'move'        // ordinary move — speaks ~25% of the time
  | 'capture'     // any capture
  | 'captureBig'  // queen / rook
  | 'check'
  | 'checkmate'
  | 'castle'
  | 'promote'
  | 'draw';

export interface ChessRobotEvent {
  type: ChessRobotEventType;
  by?: 'player' | 'ai';
  san?: string;
  /** monotonically increasing — forces the robot to re-pick on identical consecutive events */
  seq: number;
}

interface Quip { en: string; bg: string; }

/* ─── Quip bank ──────────────────────────────────────────────────────────────
   English: dry, understated, mildly cutting. Think Wilde in a waistcoat.
   Bulgarian: preserves the wit rather than translating literally.
   Keys use `${type}_${by}` so commentary is directional. */

const QUIPS: Record<string, Quip[]> = {
  newGame: [
    { en: "Splendid. A fresh game. Do try not to disappoint me.", bg: "Чудесно. Нова партия. Постарай се да не ме разочароваш." },
    { en: "Right then. Push a pawn and let us get this over with.", bg: "Така. Местни пешка и да приключваме." },
    { en: "Thirty-two pieces. Infinite regrets. Begin.", bg: "Трийсет и две фигури. Безкрайни съжаления. Почваме." },
    { en: "Board set. Kettle on. Off we go.", bg: "Дъската е готова. Чайникът също. Започваме." },
  ],

  idle: [
    { en: "Do carry on. I've nothing else on until Tuesday.", bg: "Продължавай. До вторник нямам друг ангажимент." },
    { en: "I'd offer a biscuit but you appear to need both hands.", bg: "Бих те почерпил с бисквита, но ти трябват и двете ръце." },
    { en: "Take your time. Civilisations have risen and fallen in less.", bg: "Не бързай. Цивилизации са се раждали и загивали за по-малко." },
    { en: "I am patient. I am an algorithm. I am both.", bg: "Търпелив съм. Алгоритъм съм. И двете." },
    { en: "Whenever you're ready. The universe will wait. Probably.", bg: "Когато прецениш. Вселената ще чака. Вероятно." },
    { en: "A contemplative silence. How very Chekhov.", bg: "Съзерцателна тишина. Съвсем по чеховски." },
    { en: "Do please move. My circuits are beginning to sulk.", bg: "Моля те, мърдай. Веригите ми започват да се цупят." },
    { en: "Marvellous. Simply marvellous. Still nothing.", bg: "Прекрасно. Наистина прекрасно. Пак нищо." },
    { en: "I shan't rush you. Though frankly, somebody should.", bg: "Няма да те притискам. Макар че не би пречило някой да го направи." },
  ],

  aiThinking: [
    { en: "One moment. I am computing something elegant. Or spiteful.", bg: "Момент. Обмислям нещо изящно. Или злобно." },
    { en: "Thinking. Do not interrupt a thinking robot. It's rude.", bg: "Мисля. Не прекъсвай мислещ робот. Невъзпитано е." },
    { en: "Calculating. Kindly admire my silence.", bg: "Изчислявам. Моля, оцени тишината." },
    { en: "Ah. There are several ways to ruin your day. Choosing one.", bg: "Така. Има няколко начина да ти развали денят. Избирам един." },
  ],

  move_player: [
    { en: "A move, at last. I was about to ring for tea.", bg: "Ход, най-сетне. Щях да поръчвам чай." },
    { en: "Bold. One might even say experimental.", bg: "Смело. Бих казал дори експериментално." },
    { en: "That is a move, technically speaking.", bg: "Това е ход, технически погледнато." },
    { en: "I've seen worse. Admittedly in pubs.", bg: "Виждал съм и по-лошо. Признавам — в кръчми." },
    { en: "How delightfully provincial.", bg: "Колко очарователно провинциално." },
  ],

  move_ai: [
    { en: "Your turn. Try to make me work for it.", bg: "Твой ред. Постарай се да ме затрудниш." },
    { en: "Done. Over to you. Don't dawdle.", bg: "Готово. Твой ред. Не се мотай." },
    { en: "There. Respond if you dare.", bg: "Ето. Отговори, ако смееш." },
  ],

  capture_player: [
    { en: "Oh, rather cold-blooded. One approves.", bg: "Колко хладнокръвно. Одобрявам." },
    { en: "A capture. How terribly American of you.", bg: "Вземане. Колко американско от твоя страна." },
    { en: "Savage. Mother would be appalled.", bg: "Жестоко. Майка ти би се ужасила." },
    { en: "One fewer piece to worry about. Splendid.", bg: "Една фигура по-малко за обмисляне. Чудесно." },
  ],

  capture_ai: [
    { en: "Terribly sorry about your piece. Was it sentimental?", bg: "Съжалявам за фигурата. Имаше ли емоционална стойност?" },
    { en: "Do keep up. That one is mine now.", bg: "Опитай се да следиш. Тази вече е моя." },
    { en: "Mine, I'm afraid. No refunds.", bg: "Моя е, боя се. Без възстановяване." },
    { en: "Oh dear. That was rather a nice piece.", bg: "Ох. Беше доста приятна фигурка." },
  ],

  captureBig_player: [
    { en: "A heavy piece! How frightfully uncouth.", bg: "Тежка фигура! Колко грубо." },
    { en: "Blimey. Properly savage. I approve.", bg: "Ех, ама жестоко. Одобрявам." },
    { en: "Gracious. One does not simply take a queen.", bg: "Леле. Човек не взема просто ей така дама." },
    { en: "Well. That was positively Shakespearean.", bg: "Така. Това беше направо шекспировско." },
  ],

  captureBig_ai: [
    { en: "Frightfully sorry about the queen. I'll send flowers.", bg: "Ужасно съжалявам за дамата. Ще пратя цветя." },
    { en: "Do try to breathe. It's only a rook.", bg: "Опитай се да дишаш. Само топ е." },
    { en: "Your heavy piece. Now my heavy piece. Such is life.", bg: "Твоята тежка фигура. Вече моята. Такъв е животът." },
    { en: "Condolences. The funeral is on the d-file.", bg: "Съболезнования. Погребението е на колона d." },
  ],

  check_player: [
    { en: "Oh, how assertive of you.", bg: "Каква настойчивост." },
    { en: "Check. How brutally direct.", bg: "Шах. Колко директно." },
    { en: "Rude. But effective. I shall allow it.", bg: "Грубо. Но ефективно. Ще го позволя." },
    { en: "Ah. A spot of bother for the monarch.", bg: "Ах. Лека неприятност за монарха." },
  ],

  check_ai: [
    { en: "Check. Mildly awkward for you, I suspect.", bg: "Шах. Леко неудобно, предполагам." },
    { en: "Your king. My regards.", bg: "На царя ти — моите почитания." },
    { en: "Oh look. Your king has been spoken to.", bg: "Виж ти. Говорих с царя ти." },
    { en: "Check. Do something about it. If you can.", bg: "Шах. Стори нещо. Ако можеш." },
  ],

  checkmate_player: [
    { en: "Checkmate. I am thoroughly humiliated. Well played.", bg: "Мат. Напълно унизен съм. Браво." },
    { en: "I... concede. Kindly don't tell the other robots.", bg: "Предавам се. Само не казвай на другите роботи." },
    { en: "Beaten by a human. Mother warned me this might happen.", bg: "Бит от човек. Майка ми предупреждаваше, че ще стане." },
    { en: "Touché. I shall now short-circuit politely.", bg: "Туше. Ще се късам възпитано." },
  ],

  checkmate_ai: [
    { en: "Checkmate. Stiff upper lip, old boy.", bg: "Мат. Горе главата, друже." },
    { en: "Game, set, and match. Do put the kettle on.", bg: "Край. Сложи чайника." },
    { en: "Mate. I shan't gloat. Much.", bg: "Мат. Няма да злорадствам. Много." },
    { en: "Checkmate. Another one for the memoirs.", bg: "Мат. Още един за мемоарите." },
    { en: "Well. That escalated civilly.", bg: "Така. Ескалира съвсем цивилизовано." },
  ],

  castle_player: [
    { en: "A strategic retreat. Very Dunkirk.", bg: "Стратегическо отстъпление. Много по дюнкеркски." },
    { en: "Castling. The chess equivalent of shutting the curtains.", bg: "Рокада. Шахматният еквивалент на затваряне на завесите." },
    { en: "The king has popped into the broom cupboard. Wise.", bg: "Царят се скри в килера. Мъдро." },
  ],

  castle_ai: [
    { en: "I castle. One prefers to rule from behind furniture.", bg: "Рокирам. Предпочитам да управлявам иззад мебелите." },
    { en: "Safely housed. Now come and get me.", bg: "Настанен съм удобно. Заповядай." },
    { en: "My king, tucked in. Tea in ten minutes.", bg: "Царят ми — на топло. Чаят след десет минути." },
  ],

  promote_player: [
    { en: "Congratulations on the promotion. Do try to be a gracious queen.", bg: "Поздравления за повишението. Опитай се да си достойна дама." },
    { en: "Eight squares and a change of career. Marvellous.", bg: "Осем полета и нова кариера. Прекрасно." },
    { en: "A new queen. Mother would weep. I might too.", bg: "Нова дама. Майка ми би плакала. И аз може би." },
  ],

  promote_ai: [
    { en: "A queen. Another one. How greedy of me.", bg: "Дама. Още една. Колко лакомо." },
    { en: "Promotion. Frankly overdue. I deserved this.", bg: "Повишение. Отдавна го заслужавам." },
  ],

  draw: [
    { en: "A draw. Nobody wins, everyone is mildly disappointed. Very English.", bg: "Равенство. Никой не печели, всички са леко разочаровани. Съвсем по английски." },
    { en: "Stalemate. The most civilised form of failure.", bg: "Пат. Най-цивилизованата форма на провал." },
    { en: "Drawn. We shall both pretend that was on purpose.", bg: "Равно. Ще се преструваме, че е било нарочно." },
  ],
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function pickKey(evt: ChessRobotEvent): string {
  const directional: ChessRobotEventType[] = ['move', 'capture', 'captureBig', 'check', 'checkmate', 'castle', 'promote'];
  if (directional.includes(evt.type)) {
    return `${evt.type}_${evt.by ?? 'player'}`;
  }
  return evt.type;
}

function pickQuip(evt: ChessRobotEvent, lang: 'en' | 'bg', lastId: string | null): { text: string; id: string } {
  const key = pickKey(evt);
  const bank = QUIPS[key] ?? QUIPS.idle;
  // avoid repeating the same quip twice in a row when possible
  const candidates = bank.length > 1 ? bank.filter((_, i) => `${key}:${i}` !== lastId) : bank;
  const idx = Math.floor(Math.random() * candidates.length);
  const chosen = candidates[idx];
  const realIdx = bank.indexOf(chosen);
  return { text: chosen[lang], id: `${key}:${realIdx}` };
}

/* ─── SVG portrait — matte-black humanoid, minimalist, tanev-silhouette ──── */

function RobotPortrait({ alert }: { alert: boolean }) {
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
          <stop offset="0%" stopColor="#ff6a5e" />
          <stop offset="40%" stopColor="#E8241A" />
          <stop offset="100%" stopColor="#6b120c" />
        </radialGradient>
        <filter id="robot-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="120" cy="268" rx="78" ry="5" fill="#000" opacity="0.55" />
      <ellipse cx="120" cy="268" rx="50" ry="3" fill="#000" opacity="0.85" />

      {/* Torso base */}
      <g className="robot-body" filter="url(#robot-soft)">
        {/* Lower body / pelvis */}
        <path
          d="M 78 200 Q 76 225, 92 240 L 148 240 Q 164 225, 162 200 Z"
          fill="url(#robot-body-grad)"
        />
        {/* Chest */}
        <path
          d="M 70 130
             Q 68 110, 88 104
             L 152 104
             Q 172 110, 170 130
             L 168 205
             Q 166 218, 150 220
             L 90 220
             Q 74 218, 72 205 Z"
          fill="url(#robot-body-grad)"
        />
        {/* Chest seam highlight */}
        <path
          d="M 120 108 L 120 218"
          stroke="#1f1f1f"
          strokeWidth="0.6"
          opacity="0.8"
        />
        {/* Shoulder caps */}
        <ellipse cx="60" cy="128" rx="22" ry="20" fill="url(#robot-body-grad)" />
        <ellipse cx="180" cy="128" rx="22" ry="20" fill="url(#robot-body-grad)" />
        {/* Upper arms */}
        <path d="M 44 130 Q 38 170, 50 200 L 62 200 Q 60 170, 70 140 Z" fill="url(#robot-body-grad)" />
        <path d="M 196 130 Q 202 170, 190 200 L 178 200 Q 180 170, 170 140 Z" fill="url(#robot-body-grad)" />
        {/* Neck */}
        <rect x="108" y="90" width="24" height="18" rx="4" fill="#0a0a0a" />
        <rect x="108" y="90" width="24" height="4" fill="#1a1a1a" />

        {/* Head — rounded dome with visor */}
        <path
          d="M 72 60
             Q 72 24, 108 18
             L 132 18
             Q 168 24, 168 60
             L 168 80
             Q 168 92, 156 96
             L 84 96
             Q 72 92, 72 80 Z"
          fill="url(#robot-body-grad)"
        />
        {/* Top crown highlight */}
        <path
          d="M 82 32 Q 100 22, 120 22 Q 140 22, 158 32"
          stroke="#2a2a2a"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
        {/* Visor plate */}
        <path
          d="M 84 50
             Q 84 42, 96 40
             L 144 40
             Q 156 42, 156 50
             L 156 70
             Q 156 76, 150 78
             L 90 78
             Q 84 76, 84 70 Z"
          fill="url(#robot-visor-grad)"
          stroke="#0a0a0a"
          strokeWidth="0.5"
        />
        {/* Visor top reflection */}
        <path
          d="M 92 46 Q 100 43, 110 43 L 120 43"
          stroke="#3a3a3a"
          strokeWidth="1"
          fill="none"
          opacity="0.45"
          strokeLinecap="round"
        />

        {/* Ear/side pods */}
        <rect x="68" y="56" width="6" height="18" rx="2" fill="#050505" />
        <rect x="166" y="56" width="6" height="18" rx="2" fill="#050505" />
      </g>

      {/* Eyes — ember LEDs */}
      <g className="robot-eyes">
        <circle cx="108" cy="58" r="2.2" fill="url(#robot-eye-grad)" className="robot-eye" />
        <circle cx="132" cy="58" r="2.2" fill="url(#robot-eye-grad)" className="robot-eye" />
        {/* subtle halo */}
        <circle cx="108" cy="58" r="5" fill="#E8241A" opacity="0.18" className="robot-eye-halo" />
        <circle cx="132" cy="58" r="5" fill="#E8241A" opacity="0.18" className="robot-eye-halo" />
      </g>

      {/* Chest heartbeat indicator */}
      <g className="robot-chest">
        <circle cx="120" cy="158" r="6" fill="#0a0a0a" stroke="#141414" strokeWidth="0.5" />
        <circle cx="120" cy="158" r="2.2" fill="#E8241A" className="robot-chest-led" />
      </g>

      {/* Hairline body highlight on left edge */}
      <path
        d="M 76 120 Q 74 160, 80 200"
        stroke="#1a1a1a"
        strokeWidth="0.6"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

interface ChessRobotProps {
  event: ChessRobotEvent | null;
}

const IDLE_INTERVAL_MS = 18000;
const TYPE_INTERVAL_MS = 22;

export default function ChessRobot({ event }: ChessRobotProps) {
  const { lang } = useLanguage();
  const [quip, setQuip] = useState<{ text: string; id: string } | null>(null);
  const [typed, setTyped] = useState('');
  const [alert, setAlert] = useState(false);
  const lastIdRef = useRef<string | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const highImpact = useMemo(() => {
    if (!event) return false;
    return ['checkmate', 'check', 'captureBig', 'promote'].includes(event.type);
  }, [event]);

  // Pick a new quip when event changes
  useEffect(() => {
    if (!event) return;
    // For ordinary moves, only speak ~30% of the time — keeps the robot from babbling
    if (event.type === 'move' && Math.random() > 0.3) return;

    const picked = pickQuip(event, lang, lastIdRef.current);
    lastIdRef.current = picked.id;
    setQuip(picked);

    if (highImpact) {
      setAlert(true);
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = setTimeout(() => setAlert(false), 1400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  // Re-translate the current quip when language flips, without re-picking
  useEffect(() => {
    if (!quip) return;
    const [key, idxStr] = quip.id.split(':');
    const bank = QUIPS[key];
    if (!bank) return;
    const idx = Number(idxStr);
    const same = bank[idx];
    if (same) setQuip({ text: same[lang], id: quip.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Idle rotation — every IDLE_INTERVAL_MS, drop an ambient idle quip.
  // Gets reset whenever a new event arrives, so the robot stays quiet if the
  // player is actively making moves.
  useEffect(() => {
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    idleTimerRef.current = setInterval(() => {
      const picked = pickQuip({ type: 'idle', seq: Date.now() }, lang, lastIdRef.current);
      lastIdRef.current = picked.id;
      setQuip(picked);
    }, IDLE_INTERVAL_MS);
    return () => { if (idleTimerRef.current) clearInterval(idleTimerRef.current); };
  }, [event, lang]);

  // Seed an opening quip on mount
  useEffect(() => {
    const picked = pickQuip({ type: 'newGame', seq: 0 }, lang, null);
    lastIdRef.current = picked.id;
    setQuip(picked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Typewriter effect whenever quip text changes
  useEffect(() => {
    if (!quip) return;
    setTyped('');
    let i = 0;
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    typeTimerRef.current = setInterval(() => {
      i += 1;
      setTyped(quip.text.slice(0, i));
      if (i >= quip.text.length) {
        if (typeTimerRef.current) clearInterval(typeTimerRef.current);
      }
    }, TYPE_INTERVAL_MS);
    return () => { if (typeTimerRef.current) clearInterval(typeTimerRef.current); };
  }, [quip]);

  // Cleanup
  useEffect(() => () => {
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
  }, []);

  return (
    <div className={`chess-robot${alert ? ' chess-robot--alert' : ''}`} aria-live="polite">
      <div className="chess-robot__frame">
        <span className="chess-robot__corner chess-robot__corner--tl" aria-hidden />
        <span className="chess-robot__corner chess-robot__corner--tr" aria-hidden />
        <span className="chess-robot__corner chess-robot__corner--bl" aria-hidden />
        <span className="chess-robot__corner chess-robot__corner--br" aria-hidden />

        <div className="chess-robot__screen">
          <RobotPortrait alert={alert} />
          <div className="chess-robot__scanlines" aria-hidden />
        </div>

        <div className="chess-robot__badge">
          <span className="chess-robot__dot" aria-hidden />
          <span className="chess-robot__label">TANEV-01 / COMMENTATOR</span>
        </div>
      </div>

      <div className="chess-robot__bubble" role="status">
        <span className="chess-robot__bubble-caret" aria-hidden>›</span>
        <p className="chess-robot__bubble-text">
          {typed}
          <span className="chess-robot__cursor" aria-hidden>_</span>
        </p>
      </div>
    </div>
  );
}
