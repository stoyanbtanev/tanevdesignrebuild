import { motion } from 'framer-motion';
import { STATS } from './portfolio.config';

const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function Stats() {
  return (
    <section className="bg-bg py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.header
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          variants={headerVariants}
          className="flex flex-col gap-4 mb-10 md:mb-14 max-w-2xl"
        >
          <div className="flex items-center gap-3">
            <span className="block w-8 h-px bg-stroke" aria-hidden />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">
              The shape of the studio
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-text-primary leading-tight">
            Small on purpose.{' '}
            <span className="font-display italic">Built to ship.</span>
          </h2>
        </motion.header>

        <ul className="grid grid-cols-1 md:grid-cols-3 border-t border-stroke">
          {STATS.map((s, i) => (
            <motion.li
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{
                duration: 0.8,
                delay: i * 0.08,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="flex flex-col gap-3 py-8 md:py-12 md:px-8 border-b md:border-b-0 md:border-r border-stroke last:border-r-0"
            >
              <span className="text-5xl md:text-6xl lg:text-7xl font-display italic text-text-primary leading-none">
                {s.value}
              </span>
              <span className="text-sm md:text-base text-muted max-w-[28ch]">
                {s.label}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
