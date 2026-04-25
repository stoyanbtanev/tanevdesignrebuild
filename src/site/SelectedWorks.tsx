import { motion } from 'framer-motion';
import { SELECTED_WORKS, type Work } from './portfolio.config';

const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function SelectedWorks() {
  return (
    <section id="work" className="bg-bg py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.header
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          variants={headerVariants}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-14"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="block w-8 h-px bg-stroke" aria-hidden />
              <span className="text-xs text-muted uppercase tracking-[0.3em]">
                Selected work
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-text-primary leading-tight">
              Featured{' '}
              <span className="font-display italic">projects</span>
            </h2>
            <p className="text-sm md:text-base text-muted max-w-md">
              A selection of projects I have shipped — from concept to launch.
            </p>
          </div>

          <a
            href="#contact"
            className="hidden md:inline-flex group relative items-center text-xs rounded-full"
          >
            <span
              aria-hidden
              className="absolute -inset-[2px] rounded-full opacity-0 group-hover:opacity-100 accent-gradient-shift transition-opacity duration-300"
            />
            <span className="relative inline-flex items-center gap-2 rounded-full bg-bg border border-stroke text-text-primary px-5 py-2.5 group-hover:border-transparent transition-colors duration-300">
              View all work
              <span aria-hidden className="text-text-primary/70">→</span>
            </span>
          </a>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {SELECTED_WORKS.map((w, i) => (
            <WorkCard key={w.title} work={w} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkCard({ work, index }: { work: Work; index: number }) {
  const span =
    work.span === 7 ? 'md:col-span-7' : 'md:col-span-5';
  const aspect = work.span === 7 ? 'md:aspect-[16/10]' : 'md:aspect-[4/5]';

  const Inner = (
    <>
      <img
        src={work.image}
        alt={`${work.title} — ${work.blurb}`}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div
        aria-hidden
        className="absolute inset-0 halftone-overlay opacity-20 pointer-events-none"
      />

      {/* Hover dim */}
      <div
        aria-hidden
        className="absolute inset-0 bg-bg/70 backdrop-blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      {/* Static caption */}
      <div className="absolute left-5 right-5 bottom-5 flex items-end justify-between gap-3 z-10 group-hover:opacity-0 transition-opacity duration-300">
        <div>
          <p className="text-xs text-text-primary/70 uppercase tracking-[0.25em] mb-1.5">
            {work.scope}
          </p>
          <h3 className="text-xl md:text-2xl text-text-primary font-display italic leading-tight">
            {work.title}
          </h3>
        </div>
      </div>

      {/* Hover label */}
      <div className="absolute inset-0 grid place-items-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="relative inline-flex items-center rounded-full text-sm">
          <span
            aria-hidden
            className="absolute -inset-[2px] rounded-full accent-gradient-shift"
          />
          <span className="relative inline-flex items-center gap-2 rounded-full bg-text-primary text-bg px-5 py-2.5">
            View — <span className="font-display italic">{work.title}</span>
          </span>
        </div>
      </div>
    </>
  );

  const className = [
    'group relative bg-surface border border-stroke rounded-3xl overflow-hidden aspect-[4/3]',
    aspect,
    span,
  ].join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {work.href ? (
        <a
          href={work.href}
          target="_blank"
          rel="noreferrer noopener"
          className="absolute inset-0 block"
          aria-label={`Open ${work.title}`}
        >
          {Inner}
        </a>
      ) : (
        Inner
      )}
    </motion.div>
  );
}
