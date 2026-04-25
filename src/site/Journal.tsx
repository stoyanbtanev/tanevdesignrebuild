import { motion } from 'framer-motion';
import { NOTES, type Note } from './portfolio.config';

const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function Journal() {
  return (
    <section id="notes" className="bg-bg py-16 md:py-24">
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
                Field notes
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-text-primary leading-tight">
              Recent <span className="font-display italic">thoughts</span>
            </h2>
            <p className="text-sm md:text-base text-muted max-w-md">
              Short notes from the studio — on craft, motion, and the way I work.
            </p>
          </div>
        </motion.header>

        <div className="flex flex-col gap-4 md:gap-5">
          {NOTES.map((n, i) => (
            <NoteRow key={n.title} note={n} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NoteRow({ note, index }: { note: Note; index: number }) {
  return (
    <motion.a
      href="#contact"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      className="group flex items-center gap-4 md:gap-6 p-3 md:p-4 bg-surface/30 hover:bg-surface border border-stroke rounded-[28px] md:rounded-full transition-colors duration-300"
    >
      <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 overflow-hidden rounded-full bg-bg">
        <img
          src={note.cover}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-base md:text-xl text-text-primary leading-snug">
          {note.title.replace(/\.$/, '')}
          <span className="font-display italic">.</span>
        </h3>
        <p className="hidden md:block text-sm text-muted mt-1 truncate">
          {note.blurb}
        </p>
      </div>

      <div className="hidden sm:flex items-center gap-4 text-xs text-muted uppercase tracking-[0.2em] shrink-0">
        <span>{note.read}</span>
        <span aria-hidden className="block w-px h-3 bg-stroke" />
        <span>{note.date}</span>
      </div>

      <span
        aria-hidden
        className="shrink-0 inline-flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full border border-stroke text-text-primary/80 group-hover:bg-text-primary group-hover:text-bg group-hover:border-transparent transition-colors duration-300"
      >
        →
      </span>
    </motion.a>
  );
}
