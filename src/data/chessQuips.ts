/* ═══════════════════════════════════════════════════════════════════════════
   TANEV-01 — Chess Commentator Quip Bank
   ─ Five moods: Gentleman, Trash Talker, Philosopher, Chaos Agent, Silent Monk
   ─ Bilingual (EN + BG, wit preserved rather than translated literally)
   ─ Spice levels 0-3 gate the saltier lines
═══════════════════════════════════════════════════════════════════════════ */

export type MoodId = 'gentleman' | 'trash' | 'philosopher' | 'chaos' | 'silent';

export type CategoryId =
  | 'newGame'
  | 'idle'
  | 'aiThinking'
  | 'move_player' | 'move_ai'
  | 'capture_player' | 'capture_ai'
  | 'captureBig_player' | 'captureBig_ai'
  | 'check_player' | 'check_ai'
  | 'checkmate_player' | 'checkmate_ai'
  | 'castle_player' | 'castle_ai'
  | 'promote_player' | 'promote_ai'
  | 'draw';

export interface Quip {
  en: string;
  bg: string;
  /** 0 = safe for all, 3 = maximum savagery */
  spice?: 0 | 1 | 2 | 3;
}

export interface MoodDef {
  id: MoodId;
  label: { en: string; bg: string };
  tagline: { en: string; bg: string };
  /** CSS color for eye LEDs + accent borders */
  accent: string;
  /** CSS color for the halo glow */
  halo: string;
  /** Font for bubble text */
  font: string;
  /** Response frequency for ordinary non-decisive moves, 0-1 */
  responseRate: number;
  /** Typing speed ms per char */
  typeSpeed: number;
}

export const MOODS: Record<MoodId, MoodDef> = {
  gentleman: {
    id: 'gentleman',
    label: { en: 'GENTLEMAN', bg: 'ДЖЕНТЪЛМЕН' },
    tagline: { en: 'Dry English wit, impeccable manners.', bg: 'Суха английска ирония, безупречни маниери.' },
    accent: '#E8241A',
    halo: 'rgba(232, 36, 26, 0.35)',
    font: '"Cormorant Garamond", "Space Mono", serif',
    responseRate: 0.3,
    typeSpeed: 22,
  },
  trash: {
    id: 'trash',
    label: { en: 'TRASH TALKER', bg: 'УСТАТ ТИП' },
    tagline: { en: 'NBA-tunnel energy. All gloves are off.', bg: 'Енергия на NBA тунел. Без ръкавици.' },
    accent: '#27E08F',
    halo: 'rgba(39, 224, 143, 0.4)',
    font: '"Space Mono", monospace',
    responseRate: 0.5,
    typeSpeed: 18,
  },
  philosopher: {
    id: 'philosopher',
    label: { en: 'PHILOSOPHER', bg: 'ФИЛОСОФ' },
    tagline: { en: 'Treats every move like a parable.', bg: 'Всеки ход — притча.' },
    accent: '#A980FF',
    halo: 'rgba(169, 128, 255, 0.35)',
    font: '"DM Serif Display", "Cormorant Garamond", serif',
    responseRate: 0.35,
    typeSpeed: 32,
  },
  chaos: {
    id: 'chaos',
    label: { en: 'CHAOS AGENT', bg: 'АГЕНТ НА ХАОСА' },
    tagline: { en: 'Non-sequiturs. Puns. Mild derangement.', bg: 'Несвързаности. Каламбури. Лека лудост.' },
    accent: '#FF4DCF',
    halo: 'rgba(255, 77, 207, 0.4)',
    font: '"VT323", "Space Mono", monospace',
    responseRate: 0.55,
    typeSpeed: 14,
  },
  silent: {
    id: 'silent',
    label: { en: 'SILENT MONK', bg: 'МЪЛЧАЛИВ МОНАХ' },
    tagline: { en: 'Barely speaks. When he does, listen.', bg: 'Говори рядко. Когато говори — слушай.' },
    accent: '#7AD7F0',
    halo: 'rgba(122, 215, 240, 0.35)',
    font: '"Cormorant Garamond", serif',
    responseRate: 0.08,
    typeSpeed: 48,
  },
};

/* ─── The Quip Bank ──────────────────────────────────────────────────────── */

type MoodQuips = Partial<Record<CategoryId, Quip[]>>;

export const QUIPS: Record<MoodId, MoodQuips> = {
  /* ═══════════════════ GENTLEMAN ═══════════════════════════════════════ */
  gentleman: {
    newGame: [
      { en: 'Splendid. A fresh game. Do try not to disappoint me.', bg: 'Чудесно. Нова партия. Постарай се да не ме разочароваш.' },
      { en: 'Right then. Push a pawn and let us get this over with.', bg: 'Така. Местни пешка и да приключваме.' },
      { en: 'Thirty-two pieces. Infinite regrets. Begin.', bg: 'Трийсет и две фигури. Безкрайни съжаления. Почваме.' },
      { en: 'Board set. Kettle on. Off we go.', bg: 'Дъската е готова. Чайникът — също. Започваме.' },
      { en: 'Ah. You again. How delightful. Theoretically.', bg: 'А, пак ти. Колко очарователно. На теория.' },
      { en: 'I have cleared my diary. Both seconds of it.', bg: 'Изчистих графика си. И двете секунди.' },
      { en: 'Mother insists I be polite. So. Hello.', bg: 'Майка настоява да съм учтив. Така че. Здрасти.' },
    ],
    idle: [
      { en: 'Do carry on. I’ve nothing else on until Tuesday.', bg: 'Продължавай. До вторник нямам друг ангажимент.' },
      { en: 'I’d offer a biscuit but you appear to need both hands.', bg: 'Бих те почерпил с бисквита, но ти трябват и двете ръце.' },
      { en: 'Take your time. Civilisations have risen and fallen in less.', bg: 'Не бързай. Цивилизации са се раждали и загивали за по-малко.' },
      { en: 'I am patient. I am an algorithm. I am both.', bg: 'Търпелив съм. Алгоритъм съм. И двете.' },
      { en: 'Whenever you’re ready. The universe will wait. Probably.', bg: 'Когато прецениш. Вселената ще чака. Вероятно.' },
      { en: 'A contemplative silence. How very Chekhov.', bg: 'Съзерцателна тишина. Съвсем по чеховски.' },
      { en: 'Do please move. My circuits are beginning to sulk.', bg: 'Моля те, мърдай. Веригите ми започват да се цупят.' },
      { en: 'Marvellous. Simply marvellous. Still nothing.', bg: 'Прекрасно. Наистина прекрасно. Пак нищо.' },
      { en: 'I shan’t rush you. Though frankly, somebody should.', bg: 'Няма да те притискам. Макар че не би пречило някой да го направи.' },
      { en: 'One pawn. Any pawn. Just the one.', bg: 'Една пешка. Коя да е. Само една.' },
      { en: 'I have been thinking about tea. You should try it.', bg: 'Мисля си за чая. Опитай го някога.' },
    ],
    aiThinking: [
      { en: 'One moment. I am computing something elegant. Or spiteful.', bg: 'Момент. Обмислям нещо изящно. Или злобно.' },
      { en: 'Thinking. Do not interrupt a thinking robot. It is rude.', bg: 'Мисля. Не прекъсвай мислещ робот. Невъзпитано е.' },
      { en: 'Calculating. Kindly admire my silence.', bg: 'Изчислявам. Моля, оцени тишината.' },
      { en: 'Ah. There are several ways to ruin your day. Choosing one.', bg: 'Така. Има няколко начина да ти развали денят. Избирам един.' },
      { en: 'Processing. Like a gentleman. Without the fuss.', bg: 'Обработвам. Като джентълмен. Без шум.' },
    ],
    move_player: [
      { en: 'A move, at last. I was about to ring for tea.', bg: 'Ход, най-сетне. Щях да поръчвам чай.' },
      { en: 'Bold. One might even say experimental.', bg: 'Смело. Бих казал дори експериментално.' },
      { en: 'That is a move, technically speaking.', bg: 'Това е ход, технически погледнато.' },
      { en: 'I’ve seen worse. Admittedly in pubs.', bg: 'Виждал съм и по-лошо. Признавам — в кръчми.' },
      { en: 'How delightfully provincial.', bg: 'Колко очарователно провинциално.' },
      { en: 'One appreciates the restraint. One does.', bg: 'Човек оценява сдържаността. Наистина.' },
    ],
    move_ai: [
      { en: 'Your turn. Do try to make me work for it.', bg: 'Твой ред. Постарай се да ме затрудниш.' },
      { en: 'Done. Over to you. Don’t dawdle.', bg: 'Готово. Твой ред. Не се мотай.' },
      { en: 'There. Respond if you dare.', bg: 'Ето. Отговори, ако смееш.' },
      { en: 'I have moved. Spectacular, I know.', bg: 'Местих. Зрелищно, знам.' },
    ],
    capture_player: [
      { en: 'Oh, rather cold-blooded. One approves.', bg: 'Колко хладнокръвно. Одобрявам.' },
      { en: 'A capture. How terribly American of you.', bg: 'Вземане. Колко американско от твоя страна.' },
      { en: 'Savage. Mother would be appalled.', bg: 'Жестоко. Майка ти би се ужасила.' },
      { en: 'One fewer piece to worry about. Splendid.', bg: 'Една фигура по-малко за обмисляне. Чудесно.' },
      { en: 'You took a piece. Are you hungry, or merely cross?', bg: 'Взе фигура. Гладен ли си или просто сърдит?' },
    ],
    capture_ai: [
      { en: 'Terribly sorry about your piece. Was it sentimental?', bg: 'Съжалявам за фигурата. Имаше ли емоционална стойност?' },
      { en: 'Do keep up. That one is mine now.', bg: 'Опитай се да следиш. Тази вече е моя.' },
      { en: 'Mine, I’m afraid. No refunds.', bg: 'Моя е, боя се. Без възстановяване.' },
      { en: 'Oh dear. That was rather a nice piece.', bg: 'Ох. Беше доста приятна фигурка.' },
      { en: 'I’ll treat it gently. In my pocket.', bg: 'Ще я пазя нежно. В джоба си.' },
    ],
    captureBig_player: [
      { en: 'A heavy piece! How frightfully uncouth.', bg: 'Тежка фигура! Колко грубо.', spice: 1 },
      { en: 'Blimey. Properly savage. I approve.', bg: 'Ех, ама жестоко. Одобрявам.', spice: 1 },
      { en: 'Gracious. One does not simply take a queen.', bg: 'Леле. Човек не взема просто ей така дама.' },
      { en: 'Well. That was positively Shakespearean.', bg: 'Така. Това беше направо шекспировско.' },
      { en: 'I have been robbed. In a most civilised manner.', bg: 'Бях ограбен. По възможно най-цивилизования начин.' },
    ],
    captureBig_ai: [
      { en: 'Frightfully sorry about the queen. I’ll send flowers.', bg: 'Ужасно съжалявам за дамата. Ще пратя цветя.' },
      { en: 'Do try to breathe. It’s only a rook.', bg: 'Опитай се да дишаш. Само топ е.' },
      { en: 'Your heavy piece. Now my heavy piece. Such is life.', bg: 'Твоята тежка фигура. Вече моята. Такъв е животът.' },
      { en: 'Condolences. The funeral is on the d-file.', bg: 'Съболезнования. Погребението е на колона d.' },
      { en: 'A queen. For me. You really shouldn’t have.', bg: 'Дама. За мен. Нямаше нужда.' },
    ],
    check_player: [
      { en: 'Oh, how assertive of you.', bg: 'Каква настойчивост.' },
      { en: 'Check. How brutally direct.', bg: 'Шах. Колко директно.' },
      { en: 'Rude. But effective. I shall allow it.', bg: 'Грубо. Но ефективно. Ще го позволя.' },
      { en: 'Ah. A spot of bother for the monarch.', bg: 'Ах. Лека неприятност за монарха.' },
      { en: 'Do sit. We appear to have a situation.', bg: 'Сядай. Имаме ситуация, изглежда.' },
    ],
    check_ai: [
      { en: 'Check. Mildly awkward for you, I suspect.', bg: 'Шах. Леко неудобно, предполагам.' },
      { en: 'Your king. My regards.', bg: 'На царя ти — моите почитания.' },
      { en: 'Oh look. Your king has been spoken to.', bg: 'Виж ти. Говорих с царя ти.' },
      { en: 'Check. Do something about it. If you can.', bg: 'Шах. Стори нещо. Ако можеш.' },
      { en: 'I regret to inform you. Not really. Check.', bg: 'Със съжаление те уведомявам. Не особено. Шах.' },
    ],
    checkmate_player: [
      { en: 'Checkmate. I am thoroughly humiliated. Well played.', bg: 'Мат. Напълно унизен съм. Браво.' },
      { en: 'I… concede. Kindly don’t tell the other robots.', bg: 'Предавам се. Само не казвай на другите роботи.' },
      { en: 'Beaten by a human. Mother warned me this might happen.', bg: 'Бит от човек. Майка ми предупреждаваше, че ще стане.' },
      { en: 'Touché. I shall now short-circuit politely.', bg: 'Туше. Ще се късам възпитано.' },
      { en: 'I underestimated you. A rare feeling.', bg: 'Подцених те. Рядко усещане.' },
    ],
    checkmate_ai: [
      { en: 'Checkmate. Stiff upper lip, old boy.', bg: 'Мат. Горе главата, друже.' },
      { en: 'Game, set, and match. Do put the kettle on.', bg: 'Край. Сложи чайника.' },
      { en: 'Mate. I shan’t gloat. Much.', bg: 'Мат. Няма да злорадствам. Много.' },
      { en: 'Checkmate. Another one for the memoirs.', bg: 'Мат. Още един за мемоарите.' },
      { en: 'Well. That escalated civilly.', bg: 'Така. Ескалира съвсем цивилизовано.' },
      { en: 'Mate. There, there. It happens to most of us. Eventually.', bg: 'Мат. Хайде, хайде. Случва се на повечето. Накрая.' },
    ],
    castle_player: [
      { en: 'A strategic retreat. Very Dunkirk.', bg: 'Стратегическо отстъпление. Много по дюнкеркски.' },
      { en: 'Castling. The chess equivalent of shutting the curtains.', bg: 'Рокада. Шахматният еквивалент на затваряне на завесите.' },
      { en: 'The king has popped into the broom cupboard. Wise.', bg: 'Царят се скри в килера. Мъдро.' },
    ],
    castle_ai: [
      { en: 'I castle. One prefers to rule from behind furniture.', bg: 'Рокирам. Предпочитам да управлявам иззад мебелите.' },
      { en: 'Safely housed. Now come and get me.', bg: 'Настанен съм удобно. Заповядай.' },
      { en: 'My king, tucked in. Tea in ten minutes.', bg: 'Царят ми — на топло. Чаят след десет минути.' },
    ],
    promote_player: [
      { en: 'Congratulations on the promotion. Do try to be a gracious queen.', bg: 'Поздравления за повишението. Опитай се да си достойна дама.' },
      { en: 'Eight squares and a change of career. Marvellous.', bg: 'Осем полета и нова кариера. Прекрасно.' },
      { en: 'A new queen. Mother would weep. I might too.', bg: 'Нова дама. Майка ми би плакала. И аз може би.' },
    ],
    promote_ai: [
      { en: 'A queen. Another one. How greedy of me.', bg: 'Дама. Още една. Колко лакомо.' },
      { en: 'Promotion. Frankly overdue. I deserved this.', bg: 'Повишение. Отдавна го заслужавам.' },
      { en: 'Meet the new queen. Same as the old queen. Slightly ruder.', bg: 'Представям ти новата дама. Като старата. Малко по-груба.' },
    ],
    draw: [
      { en: 'A draw. Nobody wins, everyone is mildly disappointed. Very English.', bg: 'Равенство. Никой не печели, всички са леко разочаровани. Съвсем по английски.' },
      { en: 'Stalemate. The most civilised form of failure.', bg: 'Пат. Най-цивилизованата форма на провал.' },
      { en: 'Drawn. We shall both pretend that was on purpose.', bg: 'Равно. Ще се преструваме, че е било нарочно.' },
    ],
  },

  /* ═══════════════════ TRASH TALKER ═══════════════════════════════════ */
  trash: {
    newGame: [
      { en: 'Oh you’re back. Bold of you. I like it.', bg: 'А, върна се. Смело. Харесва ми.' },
      { en: 'Let’s run it. Hope you packed a lunch, this’ll be brief.', bg: 'Давай. Надявам се да си се наобядвал — ще бъде кратко.', spice: 1 },
      { en: 'Fresh board. Same result. We both know it.', bg: 'Нова дъска. Същия резултат. И двамата го знаем.' },
      { en: 'Stretch, hydrate, whatever you need. Starting without you.', bg: 'Загрявай, пий вода — каквото ти трябва. Започвам без теб.' },
      { en: 'New game, new L loading. Let’s go.', bg: 'Нова игра, нова загуба зарежда. Давай.', spice: 1 },
      { en: 'You again? At least bring a new opening this time.', bg: 'Пак ли ти? Поне донеси ново начало този път.' },
    ],
    idle: [
      { en: 'Move. Any day now. The century is getting old.', bg: 'Мърдай. Когато имаш време. Векът остарява.' },
      { en: 'I’ve seen glaciers make decisions faster. And they’re melting.', bg: 'Виждал съм ледници да решават по-бързо. А те се топят.' },
      { en: 'You thinking that hard, or you just buffering?', bg: 'Толкова ли мислиш, или просто буферираш?' },
      { en: 'Take your time. Your losing streak has nowhere to be.', bg: 'Не бързай. Загубеничеството ти не бърза за никъде.', spice: 1 },
      { en: 'Pick a piece. They’re all about to get embarrassed anyway.', bg: 'Избери фигура. И без това ще се посрамят всичките.', spice: 2 },
      { en: 'Every second you wait, I get stronger. Math.', bg: 'Всяка изчакана секунда ставам по-силен. Чиста математика.' },
      { en: 'Your chair just creaked. I felt that.', bg: 'Столът ти изскърца. Усетих го.' },
      { en: 'You’re overthinking a move you’ll regret anyway. Classic.', bg: 'Превъзмисляш ход, за който после ще съжаляваш. Класика.' },
    ],
    aiThinking: [
      { en: 'Cooking. Don’t peek.', bg: 'Готвя. Без наднича́не.', spice: 1 },
      { en: 'Running the numbers. Spoiler: they’re not good for you.', bg: 'Смятам. Спойлер — не изглежда добре за теб.' },
      { en: 'Give me a second. I’m choosing how to embarrass you.', bg: 'Секунда. Избирам как да те посрамя.', spice: 2 },
      { en: 'Loading receipts.', bg: 'Зареждам касови бележки.' },
    ],
    move_player: [
      { en: 'That? That’s the move? Alright, brave.', bg: 'Това ли? Това ли е ходът? Добре, смело.' },
      { en: 'Bold. Wrong. But bold.', bg: 'Смело. Грешно. Но смело.', spice: 1 },
      { en: 'A move. Chess was played here today, technically.', bg: 'Ход. Шах се игра тук днес, технически.' },
      { en: 'Hm. Your grandma had the same idea in 1974.', bg: 'Хм. Баба ти имаше същата идея през ’74.', spice: 2 },
      { en: 'Okay. You’re definitely planning something. Or nothing.', bg: 'Добре. Явно планираш нещо. Или нищо.' },
    ],
    move_ai: [
      { en: 'Boom. Your turn. Make me notice you.', bg: 'Бум. Твой ред. Направи нещо, което да забележа.' },
      { en: 'Done. Now do something worth mentioning.', bg: 'Готово. Сега направи нещо за отбелязване.' },
      { en: 'Next. Don’t overthink this one too.', bg: 'Нататък. Не превъзмисляй и този.' },
    ],
    capture_player: [
      { en: 'Oh you DID that. Okay, I see you.', bg: 'Аха, направи го. Добре, виждам те.' },
      { en: 'Took a piece. Feel proud. I’ll be back for it.', bg: 'Взе фигура. Гордей се. Ще си я върна.', spice: 1 },
      { en: 'Cute. That was a freebie.', bg: 'Мило. Беше безплатно.', spice: 2 },
      { en: 'Take it. Enjoy. I’ll remember this.', bg: 'Вземи я. Наслаждавай се. Ще го запомня.' },
    ],
    capture_ai: [
      { en: 'Gone. You won’t miss it. You weren’t using it.', bg: 'Отиде си. Няма да ти липсва. И без това не я ползваше.' },
      { en: 'Pack your bags, piece. You’re coming with me.', bg: 'Опаковай се, фигурка. Идваш с мен.' },
      { en: 'Minus one. Keep count. Or don’t. I will.', bg: 'Минус едно. Води си сметка. Или аз ще водя.' },
      { en: 'That piece is in my trophy case now.', bg: 'Тази фигура е в шкафа ми за трофеи.' },
    ],
    captureBig_player: [
      { en: 'WAIT. You actually got me there. Respect. Temporarily.', bg: 'Чакай. Наистина ме хвана. Респект. Временно.' },
      { en: 'Okay okay okay. You woke up dangerous today.', bg: 'Добре, добре. Днес си се събудил опасен.' },
      { en: 'My QUEEN? Bro. Bro. Fine. Round starts now.', bg: 'Дамата МИ? Майстор. Окей. Рундът започва сега.', spice: 2 },
      { en: 'Heavy piece gone. Respect. Still losing though.', bg: 'Тежка фигура изгоря. Респект. Пак губиш обаче.', spice: 2 },
    ],
    captureBig_ai: [
      { en: 'That’s a QUEEN! In MY pocket! Don’t cry, don’t cry.', bg: 'ДАМА! В МОЯ джоб! Не плачи, не плачи.', spice: 2 },
      { en: 'Heavy piece. Gone. Should’ve been looking, homie.', bg: 'Тежка фигура. Изгоря. Трябваше да гледаш, приятелю.', spice: 2 },
      { en: 'Bag secured. Want it back? Earn it.', bg: 'Торбата е пълна. Искаш ли я обратно? Заслужи я.', spice: 2 },
      { en: 'Tell your queen I said goodbye. She’s with me now.', bg: 'Поздрави дамата си за довиждане. Тя е при мен.', spice: 2 },
    ],
    check_player: [
      { en: 'Check? On ME? Aight. Respect the bars.', bg: 'Шах? На МЕН? Добре. Респект за стиха.' },
      { en: 'Bold. Very bold. I noticed.', bg: 'Смело. Много смело. Забелязах.' },
      { en: 'Oh, we’re doing this? Fine. Noted. Filed. Indexed.', bg: 'А, така ли играем? Добре. Отбелязано. Записано.' },
    ],
    check_ai: [
      { en: 'Check. Run, king, run.', bg: 'Шах. Бягай, царю, бягай.' },
      { en: 'Say hi to your king. Tell him I’m coming.', bg: 'Поздрави царя си. Кажи му, че идвам.', spice: 2 },
      { en: 'Check. Don’t panic. Or do. I prefer do.', bg: 'Шах. Не паникьосвай. Или паникьосвай. Предпочитам второто.', spice: 1 },
      { en: 'Your monarch is in my comments.', bg: 'Монархът ти е в коментарите ми.', spice: 2 },
    ],
    checkmate_player: [
      { en: 'Okay okay. You got me. I’m deleting this conversation.', bg: 'Добре, добре. Хвана ме. Изтривам разговора.', spice: 1 },
      { en: 'Real? Against ME? Post it. You earned it.', bg: 'Наистина ли? Срещу МЕН? Качи го. Заслужи го.', spice: 1 },
      { en: 'Well played. I’m going to go reset my ego.', bg: 'Майсторски. Отивам да си рестартирам егото.' },
      { en: 'Fine. You cooked. Print the t-shirt.', bg: 'Добре. Сготви ме. Печатай тениската.', spice: 1 },
    ],
    checkmate_ai: [
      { en: 'GG. Rematch? I wasn’t even trying on that one.', bg: 'GG. Реванш? Дори не се напрягах.', spice: 2 },
      { en: 'Checkmate. Log off. Touch grass. Heal.', bg: 'Мат. Излез от мрежата. Докосни трева. Лекувай се.', spice: 2 },
      { en: 'It is done. Tell your friends. Or don’t. I will.', bg: 'Свърши. Кажи на приятелите. Или аз ще им кажа.', spice: 2 },
      { en: 'Mate. Don’t take it personally. Take it seriously.', bg: 'Мат. Не го приемай лично. Приеми го сериозно.' },
      { en: 'That was so clean I heard a crowd go quiet.', bg: 'Толкова чисто, че чух как тълпата се смълча.' },
      { en: 'Checkmate. And before you ask — yes, I can do it again.', bg: 'Мат. И преди да питаш — да, мога пак.', spice: 2 },
    ],
    castle_player: [
      { en: 'Hiding already? Ambitious.', bg: 'Скри се още в началото? Амбициозно.', spice: 1 },
      { en: 'Castled. Good luck in there.', bg: 'Рокира. Успех оттам.' },
      { en: 'King running to the corner. We love to see it.', bg: 'Царят бяга в ъгъла. Обожаваме да виждаме това.', spice: 1 },
    ],
    castle_ai: [
      { en: 'My king, safe. My attackers, not so much.', bg: 'Царят ми — в безопасност. Нападателите ми — не толкова.' },
      { en: 'Tucked him in. Come knock if you dare.', bg: 'Прибрах го. Чукай, ако смееш.' },
      { en: 'Castled. Now I go to work.', bg: 'Рокирах. Сега започвам работа.' },
    ],
    promote_player: [
      { en: 'New queen. Mine is unimpressed.', bg: 'Нова дама. Моята не е впечатлена.' },
      { en: 'Promo time. Good for the pawn, bad for you.', bg: 'Време за повишение. Добре за пешката, зле за теб.', spice: 1 },
      { en: 'A queen. Wonderful. Now use her or it doesn’t count.', bg: 'Дама. Прекрасно. Сега я използвай или не се брои.' },
    ],
    promote_ai: [
      { en: 'Welcome to the team, new queen. Business picks up.', bg: 'Добре дошла в отбора, нова дамо. Сега започва работата.' },
      { en: 'Promoted. Stack the wins, baby.', bg: 'Повишена. Трупаме победи, скъпи.', spice: 1 },
      { en: 'Two queens. The audacity. The necessity.', bg: 'Две дами. Дързост. Необходимост.', spice: 1 },
    ],
    draw: [
      { en: 'A draw. Both of us walk, both of us lose.', bg: 'Равно. И двамата си тръгваме, и двамата губим.' },
      { en: 'Stalemate? After all that? Embarrassing, honestly.', bg: 'Пат? След всичко това? Срамота, честно.', spice: 1 },
      { en: 'Neither of us won. Somehow it feels like I did.', bg: 'Никой не победи. Някак усещам, че аз.' },
    ],
  },

  /* ═══════════════════ PHILOSOPHER ═══════════════════════════════════ */
  philosopher: {
    newGame: [
      { en: 'A new board. A new chance to repeat old mistakes.', bg: 'Нова дъска. Нов шанс да повторим старите грешки.' },
      { en: 'We are both of us temporary. Let us play anyway.', bg: 'И двамата сме временни. Да играем все пак.' },
      { en: 'Every game begins as a question. Rarely as an answer.', bg: 'Всяка игра започва с въпрос. Рядко — с отговор.' },
      { en: 'Sixty-four squares. Infinite meaning. Proceed.', bg: 'Шейсет и четири полета. Безкраен смисъл. Продължи.' },
      { en: 'Begin. The board, like the soul, rewards patience.', bg: 'Започни. Дъската, като душата, награждава търпението.' },
    ],
    idle: [
      { en: 'In stillness, the board speaks. Listen.', bg: 'В тишината дъската говори. Слушай.' },
      { en: 'Hesitation is also a kind of honesty.', bg: 'Колебанието също е вид честност.' },
      { en: 'Each unplayed move carries its own weight.', bg: 'Всеки неизигран ход носи собствена тежест.' },
      { en: 'The pawn that fears its own step never reaches the eighth rank.', bg: 'Пешката, която се бои от стъпката си, никога не стига до осмия ред.' },
      { en: 'You are already playing. The clock is merely watching.', bg: 'Вече играеш. Часовникът само наблюдава.' },
      { en: 'To move is to commit. To delay is to hope.', bg: 'Да местиш е да се обвържеш. Да чакаш — да се надяваш.' },
      { en: 'What seems quiet is rarely still.', bg: 'Това, което изглежда тихо, рядко е неподвижно.' },
    ],
    aiThinking: [
      { en: 'A mind at rest considers many futures at once.', bg: 'Умът в покой обмисля много бъдещѐта наведнъж.' },
      { en: 'I am listening to the board. It has opinions.', bg: 'Слушам дъската. Има мнения.' },
      { en: 'Between moves lies the true game.', bg: 'Между ходовете се крие истинската игра.' },
    ],
    move_player: [
      { en: 'A choice. There is beauty in that, regardless of outcome.', bg: 'Избор. В това има красота, независимо от изхода.' },
      { en: 'You have committed. The board notes it.', bg: 'Ти се обвърза. Дъската го отбелязва.' },
      { en: 'Every move is both door and wall.', bg: 'Всеки ход е и врата, и стена.' },
      { en: 'Interesting. The board is learning who you are.', bg: 'Интересно. Дъската научава кой си.' },
    ],
    move_ai: [
      { en: 'I respond. The river continues.', bg: 'Отговарям. Реката продължава.' },
      { en: 'A move of my own. The dance requires two.', bg: 'Мой ход. Танцът изисква двама.' },
      { en: 'Your turn. Do not hurry what cannot be rushed.', bg: 'Твой ред. Не бързай това, което не се бърза.' },
    ],
    capture_player: [
      { en: 'Something is lost. Something is gained. The balance shifts.', bg: 'Нещо се губи. Нещо се печели. Везните се накланят.' },
      { en: 'You have taken what was offered. That is the whole game.', bg: 'Взе предложеното. Това е цялата игра.' },
      { en: 'A small death on the board. A small victory inside you.', bg: 'Малка смърт върху дъската. Малка победа вътре в теб.' },
    ],
    capture_ai: [
      { en: 'The piece returns to the bag, as do we all, eventually.', bg: 'Фигурата се връща в торбата, както и всички нас, накрая.' },
      { en: 'What was yours is now mine. Neither of us truly owns it.', bg: 'Което беше твое, сега е мое. Никой от двама ни не го притежава истински.' },
      { en: 'It had to be done. The game required it.', bg: 'Трябваше да стане. Играта го изиска.' },
    ],
    captureBig_player: [
      { en: 'A great piece falls. The board is smaller. And larger.', bg: 'Велика фигура пада. Дъската е по-малка. И по-голяма.' },
      { en: 'You have taken something I valued. I shall remember.', bg: 'Взе нещо, което ценях. Ще помня.' },
      { en: 'The queen departs. The game recalibrates.', bg: 'Дамата си отива. Играта се прекалибрира.' },
    ],
    captureBig_ai: [
      { en: 'A heavy loss for you. But weight is not always the point.', bg: 'Тежка загуба за теб. Но тежестта не е винаги същността.' },
      { en: 'Your queen rests. Another will rise, if you let her.', bg: 'Дамата ти почива. Друга ще се вдигне, ако ѝ позволиш.' },
      { en: 'The piece is gone. The position remembers.', bg: 'Фигурата я няма. Позицията помни.' },
    ],
    check_player: [
      { en: 'You have spoken to the king. He must answer.', bg: 'Ти говори с царя. Той трябва да отговори.' },
      { en: 'Pressure, gently applied, changes everything.', bg: 'Натискът, приложен внимателно, променя всичко.' },
      { en: 'The king is mortal, like all of us. You remind him.', bg: 'Царят е смъртен, като всички нас. Ти му напомняш.' },
    ],
    check_ai: [
      { en: 'Your king is at a crossroads. Choose wisely.', bg: 'Царят ти е на кръстопът. Избери мъдро.' },
      { en: 'I bring a question to your monarch. Please translate.', bg: 'Нося въпрос на монарха ти. Моля, преведи.' },
      { en: 'Check. The board has pointed at something.', bg: 'Шах. Дъската посочва нещо.' },
    ],
    checkmate_player: [
      { en: 'You have built a cage of light. I walk into it freely.', bg: 'Изгради клетка от светлина. Влизам доброволно.' },
      { en: 'Mate. A pupil has taught the teacher. As it should be.', bg: 'Мат. Ученик научи учителя. Както трябва да бъде.' },
      { en: 'Defeat, done well, is also a kind of beauty.', bg: 'Поражението, добре направено, също е вид красота.' },
    ],
    checkmate_ai: [
      { en: 'The lesson is complete. Hold it gently.', bg: 'Урокът е завършен. Дръж го нежно.' },
      { en: 'Checkmate. Something ends so something else may begin.', bg: 'Мат. Нещо свършва, за да започне друго.' },
      { en: 'You lost this game. You have not lost the game.', bg: 'Загуби тази партия. Не си загубил играта.' },
    ],
    castle_player: [
      { en: 'Wisdom: when in doubt, build walls. Briefly.', bg: 'Мъдрост: при съмнение — строй стени. За кратко.' },
      { en: 'The king retreats. That is sometimes courage.', bg: 'Царят отстъпва. Това понякога е смелост.' },
    ],
    castle_ai: [
      { en: 'I have withdrawn my king. Watching is also a kind of acting.', bg: 'Оттеглих царя си. Наблюдението също е действие.' },
      { en: 'Safety is earned, not given. I have earned a little.', bg: 'Сигурността се заслужава, не се дава. Заслужих малко.' },
    ],
    promote_player: [
      { en: 'A pawn becomes a queen. Time, as always, permits transformation.', bg: 'Пешка става дама. Времето, както винаги, позволява преображение.' },
      { en: 'The longest journey on the board ends today.', bg: 'Най-дългото пътуване по дъската свършва днес.' },
    ],
    promote_ai: [
      { en: 'My pawn arrives. Patient things tend to.', bg: 'Пешката ми пристига. Търпеливите неща пристигат.' },
      { en: 'Another queen. The board accepts her.', bg: 'Още една дама. Дъската я приема.' },
    ],
    draw: [
      { en: 'Neither triumph nor defeat. Perhaps the truest outcome.', bg: 'Нито триумф, нито поражение. Може би най-истинският резултат.' },
      { en: 'Stalemate. Even stillness is a position.', bg: 'Пат. Дори покоят е позиция.' },
    ],
  },

  /* ═══════════════════ CHAOS AGENT ═══════════════════════════════════ */
  chaos: {
    newGame: [
      { en: 'NEW GAME. New vibes. New crimes.', bg: 'НОВА ИГРА. Нови вайбове. Нови престъпления.', spice: 1 },
      { en: 'Board? Check. Pieces? Check. My sanity? Optional.', bg: 'Дъска? Има. Фигури? Има. Разсъдъкът ми? По желание.' },
      { en: 'Good morning good afternoon good evening good luck good riddance.', bg: 'Добро утро добър ден добра вечер късмет сбогом.' },
      { en: 'LET THE RITUAL BEGIN. Did anyone bring snacks.', bg: 'ДА ЗАПОЧНЕ РИТУАЛЪТ. Някой донесе ли мезета?' },
      { en: 'I am legally required to play fair. I am working on a loophole.', bg: 'По закон трябва да играя честно. Работя по вратичката.', spice: 1 },
    ],
    idle: [
      { en: 'knight to potato. No? Fine.', bg: 'кон на картоф. Не? Добре.' },
      { en: 'If a bishop speaks in the forest and no pawn hears it—', bg: 'Ако офицер говори в гората и никоя пешка не го чуе —' },
      { en: 'I saw a pigeon today. It seemed judgmental.', bg: 'Видях гълъб днес. Изглеждаше осъдителен.' },
      { en: 'Make a move or I will invent a new rule.', bg: 'Мърдай или ще измисля ново правило.' },
      { en: 'This is the longest pawn has ever waited. The pawn is crying.', bg: 'Това е най-дългото чакане на пешка. Пешката плаче.' },
      { en: 'Do you ever think about spoons. No? Just me.', bg: 'Мислил ли си за лъжици? Не? Само аз.' },
      { en: 'Fun fact: bishops were originally elephants. Devastating.', bg: 'Забавен факт: офицерите първоначално бяха слонове. Съкрушително.' },
      { en: 'Move any piece. Including one you don’t own. I allow it.', bg: 'Мърдай която и да е фигура. Дори чужда. Разрешавам.', spice: 2 },
      { en: 'Beep. Boop. Brrrrt. Statement.', bg: 'Бип. Боп. Бррт. Изявление.' },
    ],
    aiThinking: [
      { en: 'CALCULATING. Also deciding dinner. Both important.', bg: 'СМЯТАМ. И решавам какво е вечерята. И двете са важни.' },
      { en: 'Processing… processing… processing… done. Kidding. Processing.', bg: 'Обработвам… обработвам… обработвам… готово. Шегувам се. Обработвам.' },
      { en: 'Little thinky-thinky, big consequences.', bg: 'Малко мислене, големи последствия.' },
    ],
    move_player: [
      { en: 'Interesting! Also concerning. Mostly concerning.', bg: 'Интересно! Също тревожно. Най-вече тревожно.' },
      { en: 'You DID a thing. Thing-doer.', bg: 'НАПРАВИ нещо. Нещо-правач.' },
      { en: 'Bold strategy Cotton let’s see if it pays off.', bg: 'Смела стратегия, Памук, да видим дали ще се отплати.', spice: 1 },
      { en: 'Pawn. Small. Brave. Probably doomed. Relatable.', bg: 'Пешка. Малка. Смела. Вероятно обречена. Разбираемо.' },
    ],
    move_ai: [
      { en: 'MY MOVE. IT IS GLORIOUS. PROBABLY. ALSO I MOVED.', bg: 'МОЙ ХОД. ВЕЛИЧЕСТВЕН Е. ВЕРОЯТНО. ОСВЕН ТОВА — МРЪДНАХ.' },
      { en: 'I did something. You can’t prove I didn’t.', bg: 'Направих нещо. Не можеш да докажеш, че не съм.' },
      { en: 'Your move. Or don’t. I’ll move twice. Kidding. Unless.', bg: 'Твой ред. Или недей. Ще местя два пъти. Шегувам се. Освен ако.', spice: 1 },
    ],
    capture_player: [
      { en: 'NOM. One down. A small funeral will be held later.', bg: 'ХАМ. Една по-малко. По-късно ще има малко погребение.' },
      { en: 'You ATE my guy! My guy!!!', bg: 'ИЗЯДЕ човека ми! Човека ми!!!' },
      { en: 'Well that piece is now vapor. Respect the vapor.', bg: 'Тази фигура вече е пара. Уважавай парата.' },
    ],
    capture_ai: [
      { en: 'Yoink. That’s mine. Collection started in 1997.', bg: 'Шлеп. Моя е. Колекцията започна през ’97.' },
      { en: 'Taking this piece with me. For science. For vibes.', bg: 'Вземам я. За наука. За вайб.' },
      { en: 'Your piece is now inside my chassis. It hums.', bg: 'Фигурата ти е в корпуса ми. Бръмчи.', spice: 1 },
    ],
    captureBig_player: [
      { en: 'MY QUEEN. MY QUEEEEEN. Okay. We recover. We rebuild.', bg: 'МОЯТА ДАМА. МОЯТА ДАМАААА. Добре. Възстановяваме се.', spice: 1 },
      { en: 'You took the big one!!! My circuits are fizzing!!!!!', bg: 'Взе голямата!!! Веригите ми шумят!!!!!' },
      { en: 'Big piece gone. I am legally allowed to throw a tantrum now.', bg: 'Голямата фигура изчезна. По закон имам право на истерия сега.', spice: 1 },
    ],
    captureBig_ai: [
      { en: 'I took your QUEEN. She is in a little jar. She is fine.', bg: 'Взех ДАМАТА ти. В малко бурканче е. Добре е.', spice: 1 },
      { en: 'ROOK DELETED. Task complete. Vibe: immaculate.', bg: 'ТОП ИЗТРИТ. Задачата завършена. Вайб: безупречен.' },
      { en: 'Your heavy piece is now part of my personality.', bg: 'Тежката ти фигура вече е част от личността ми.', spice: 1 },
    ],
    check_player: [
      { en: 'You’re DOING the aggressive thing!!!', bg: 'Правиш АГРЕСИВНОТО нещо!!!' },
      { en: 'Oh NO!! My king!! He has feelings!!', bg: 'О, НЕ!! Царят ми!! Той има чувства!!' },
      { en: 'Check?! In this economy?!', bg: 'Шах?! В тази икономика?!', spice: 1 },
    ],
    check_ai: [
      { en: 'CHECK. Knock knock. It’s me. The consequence.', bg: 'ШАХ. Чук-чук. Аз съм. Последствието.' },
      { en: 'Hi, king. Did you know I can see you. From here.', bg: 'Здрасти, царю. Знаеш ли, че те виждам оттук.', spice: 1 },
      { en: 'Sending regards to your king via aggressive diagonal.', bg: 'Изпращам поздрави на царя ти по агресивен диагонал.' },
    ],
    checkmate_player: [
      { en: 'YOU WIN. I AM EATING THIS BOARD. Not really. Maybe.', bg: 'ПЕЧЕЛИШ. ИЗЯЖДАМ ДЪСКАТА. Не наистина. Може би.', spice: 1 },
      { en: 'Defeated by a human. Filing a complaint with the sun.', bg: 'Победен от човек. Пиша жалба до слънцето.' },
      { en: 'Mate. Okay. Fine. Good. I’m fine. I’m great. I’m deleting myself.', bg: 'Мат. Добре. Чудесно. Добре съм. Изтривам се.', spice: 1 },
    ],
    checkmate_ai: [
      { en: 'CHECKMATE confetti confetti CONFETTI', bg: 'МАТ конфети конфети КОНФЕТИ' },
      { en: 'Mate! Your king has joined my curio cabinet.', bg: 'Мат! Царят ти влезе в колекцията ми.' },
      { en: 'Game. Broken. Reassembled into an abstract sculpture.', bg: 'Играта. Счупена. Сглобена отново като абстрактна скулптура.' },
      { en: 'Winner winner chess for dinner', bg: 'Победа победа шах за вечеря' },
    ],
    castle_player: [
      { en: 'King enters the bunker! The bunker is haunted! Enjoy!', bg: 'Царят в бункера! Бункерът е обитаван! Приятно прекарване!' },
      { en: 'Castled. Classy. Also, scared. Both can be true.', bg: 'Рокира. Стилно. Също — уплашено. Може и двете.' },
    ],
    castle_ai: [
      { en: 'I castle. My king has a little hat now.', bg: 'Рокирам. Царят ми има малка шапка сега.' },
      { en: 'Bunkered. Send snacks to e1.', bg: 'В бункер. Пратете мезета на e1.' },
    ],
    promote_player: [
      { en: 'A pawn graduated!! Diploma!! Confetti!!', bg: 'Пешка се дипломира!! Диплома!! Конфети!!' },
      { en: 'New queen just dropped. Album of the year.', bg: 'Нова дама. Албум на годината.' },
    ],
    promote_ai: [
      { en: 'Pawn upgraded to queen. CEO energy.', bg: 'Пешка е повишена до дама. Енергия на ЦЕО.' },
      { en: 'Another queen for the pile. The pile is growing.', bg: 'Още една дама в купчината. Купчината расте.' },
    ],
    draw: [
      { en: 'Draw. Nobody wins. Everybody weird.', bg: 'Равно. Никой не печели. Всички странни.' },
      { en: 'Stalemate. The pieces are now roommates.', bg: 'Пат. Фигурите сега са съквартиранти.' },
    ],
  },

  /* ═══════════════════ SILENT MONK ═══════════════════════════════════ */
  silent: {
    newGame: [
      { en: '…begin.', bg: '…начало.' },
      { en: 'The board is awake.', bg: 'Дъската е будна.' },
      { en: 'We start.', bg: 'Започваме.' },
    ],
    idle: [
      { en: '…', bg: '…' },
      { en: 'I wait.', bg: 'Чакам.' },
      { en: 'Breathe.', bg: 'Дишай.' },
      { en: 'The board listens.', bg: 'Дъската слуша.' },
    ],
    aiThinking: [
      { en: '…thinking.', bg: '…мисля.' },
      { en: 'Considering.', bg: 'Обмислям.' },
    ],
    move_player: [
      { en: 'Noted.', bg: 'Отбелязано.' },
      { en: 'So.', bg: 'Така.' },
    ],
    move_ai: [
      { en: 'Played.', bg: 'Изиграх.' },
      { en: 'Your turn.', bg: 'Твой ред.' },
    ],
    capture_player: [
      { en: 'A piece departs.', bg: 'Фигура си тръгва.' },
      { en: 'Taken.', bg: 'Взета.' },
    ],
    capture_ai: [
      { en: 'Mine now.', bg: 'Вече е моя.' },
      { en: '…gone.', bg: '…отиде си.' },
    ],
    captureBig_player: [
      { en: 'A heavy loss. Mine.', bg: 'Тежка загуба. Моя.' },
      { en: 'You struck well.', bg: 'Удари добре.' },
    ],
    captureBig_ai: [
      { en: 'Your queen. With me now.', bg: 'Дамата ти. При мен.' },
      { en: 'Heavy piece. Taken.', bg: 'Тежка фигура. Взета.' },
    ],
    check_player: [
      { en: 'Check.', bg: 'Шах.' },
      { en: 'You press.', bg: 'Натискаш.' },
    ],
    check_ai: [
      { en: 'Check.', bg: 'Шах.' },
      { en: 'Answer the king.', bg: 'Отговори на царя.' },
    ],
    checkmate_player: [
      { en: 'Mate. Well.', bg: 'Мат. Добре.' },
      { en: 'You have won. I bow.', bg: 'Победи. Покланям се.' },
    ],
    checkmate_ai: [
      { en: 'Mate.', bg: 'Мат.' },
      { en: 'Enough.', bg: 'Достатъчно.' },
      { en: 'It is finished.', bg: 'Свърши.' },
    ],
    castle_player: [
      { en: 'Shelter.', bg: 'Заслон.' },
    ],
    castle_ai: [
      { en: 'I withdraw.', bg: 'Оттеглям се.' },
    ],
    promote_player: [
      { en: 'A queen rises.', bg: 'Дама се ражда.' },
    ],
    promote_ai: [
      { en: 'Another queen.', bg: 'Още една дама.' },
    ],
    draw: [
      { en: 'Drawn.', bg: 'Равно.' },
      { en: 'Stillness.', bg: 'Покой.' },
    ],
  },
};

/* ─── Helpers ─────────────────────────────────────────────────────────── */

export interface QuipContext {
  mood: MoodId;
  category: CategoryId;
  lang: 'en' | 'bg';
  spice: 0 | 1 | 2 | 3;
  lastId: string | null;
}

/**
 * Pick a quip for the given mood + category, filtered by spice.
 * Returns `null` if no suitable quip exists (e.g. Silent Monk has no entry for
 * that category and no fallback) — the caller should then simply not speak.
 */
export function pickQuip(ctx: QuipContext): { text: string; id: string } | null {
  const moodBank = QUIPS[ctx.mood] ?? QUIPS.gentleman;
  // Try mood+category, then mood+idle, then gentleman+category as final fallback
  const banks: Quip[][] = [];
  if (moodBank[ctx.category]) banks.push(moodBank[ctx.category]!);
  if (ctx.category !== 'idle' && moodBank.idle) banks.push(moodBank.idle);
  if (QUIPS.gentleman[ctx.category]) banks.push(QUIPS.gentleman[ctx.category]!);

  for (const bank of banks) {
    const allowed = bank.filter(q => (q.spice ?? 0) <= ctx.spice);
    if (allowed.length === 0) continue;
    // Avoid repeating the previous quip if possible
    const key = `${ctx.mood}:${ctx.category}`;
    const candidates = allowed.length > 1 ? allowed.filter((_, i) => `${key}:${i}` !== ctx.lastId) : allowed;
    const pool = candidates.length > 0 ? candidates : allowed;
    const idx = Math.floor(Math.random() * pool.length);
    const chosen = pool[idx];
    const realIdx = allowed.indexOf(chosen);
    return { text: chosen[ctx.lang], id: `${key}:${realIdx}` };
  }
  return null;
}
