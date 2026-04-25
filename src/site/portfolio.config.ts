/**
 * Content for the new dark-portfolio concept (Hybrid mode).
 * Design system follows the spec verbatim; identity is Stoyan's;
 * stats are factual only — nothing invented.
 */

export const HERO_VIDEO_SRC =
  'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';

export const LOADING_WORDS = ['Design', 'Build', 'Ship'] as const;

export const ROLES = ['Designer', 'Developer', 'Brand maker', 'Director'] as const;

export type NavLink = { label: string; href: string };
export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'Work', href: '#work' },
  { label: 'Notes', href: '#notes' },
];

export type Work = {
  title: string;
  blurb: string;
  scope: string;
  image: string;
  href?: string;
  span: 7 | 5;
};

export const SELECTED_WORKS: Work[] = [
  {
    title: 'SpeedLink EU',
    blurb: 'Logistics, made to feel as fast as it is.',
    scope: 'Identity · Site · Motion · SEO',
    image: '/work-speedlink.webp',
    href: 'https://speedlink-eu.vercel.app',
    span: 7,
  },
  {
    title: 'Pekarni Siana',
    blurb: 'A neighbourhood bakery, set as an editorial.',
    scope: 'Site · Art direction',
    image: '/work-siana.webp',
    href: 'https://pekarnisiana.github.io/site/',
    span: 5,
  },
  {
    title: '$SELK',
    blurb: 'A community memecoin, handled as a real brand.',
    scope: 'Brand · Site · Motion',
    image: '/work-exel.webp',
    href: 'https://exelkonsol.github.io/elk/',
    span: 5,
  },
  {
    title: 'tanev.design',
    blurb: 'This site. Built start to finish.',
    scope: 'Everything',
    image: '/hero-12.jpg',
    span: 7,
  },
];

export type Note = {
  title: string;
  blurb: string;
  cover: string;
  read: string;
  date: string;
};

export const NOTES: Note[] = [
  {
    title: 'Less design is better design.',
    blurb: 'Subtraction first. Spacing carries the weight.',
    cover: '/sections/process-direction.jpg',
    read: '3 min',
    date: 'Mar 2026',
  },
  {
    title: 'One person, end to end.',
    blurb: 'No layers, no handoffs. The hand that designs is the hand that ships.',
    cover: '/sections/profile-portrait.jpg',
    read: '4 min',
    date: 'Feb 2026',
  },
  {
    title: 'Custom over template.',
    blurb: 'Every site is built from a blank file. Hand-coded, top to bottom.',
    cover: '/sections/process-build.jpg',
    read: '5 min',
    date: 'Jan 2026',
  },
  {
    title: 'Twenty-four hours.',
    blurb: 'A reply within a day. No discovery calls that waste your morning.',
    cover: '/sections/process-launch.jpg',
    read: '2 min',
    date: 'Dec 2025',
  },
];

export type Exploration = { src: string; alt: string };

export const EXPLORATIONS: Exploration[] = [
  { src: '/1.webp', alt: 'Studio frame — 01' },
  { src: '/2.webp', alt: 'Studio frame — 02' },
  { src: '/3.webp', alt: 'Studio frame — 03' },
  { src: '/4.webp', alt: 'Studio frame — 04' },
  { src: '/5.webp', alt: 'Studio frame — 05' },
  { src: '/6.webp', alt: 'Studio frame — 06' },
];

export type Stat = { value: string; label: string };

export const STATS: Stat[] = [
  { value: '2021', label: 'Working as a solo studio.' },
  { value: '01', label: 'Person, brief to launch.' },
  { value: 'EN', label: 'International, async, EU hours.' },
];

export type Social = { label: string; href: string };

export const SOCIALS: Social[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/stoyan-tanev-a732603b8/' },
  { label: 'GitHub', href: 'https://github.com/stoyanbtanev' },
  { label: 'X', href: 'https://x.com/tanevdesign' },
];

export const CONTACT_EMAIL = 'stoyanbtanev@gmail.com';

export const MARQUEE_PHRASE = 'ONE PERSON · EVERY DETAIL CONSIDERED · ';
