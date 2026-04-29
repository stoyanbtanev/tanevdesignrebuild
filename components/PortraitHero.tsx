"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Linkedin, Twitter, Instagram, Github } from "lucide-react";

const MARQUEE_PHRASE = "Stoyan Tanev · ";
const MARQUEE_TEXT = MARQUEE_PHRASE.repeat(8);
const HERO_IMAGE_SRC = "/assets/mefacemask.svg";

export function PortraitHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  // Track scroll across the full pinned wrapper, not just the visible hero,
  // so the scale-out animation runs smoothly while the hero is pinned.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // Marquee horizontal slide (kept).
  const xRaw = useTransform(scrollYProgress, [0, 1], ["0%", "-130%"]);
  const x = useSpring(xRaw, { stiffness: 260, damping: 50, mass: 0.35 });

  // Image zooms IN from 1 to ~1.18 as you scroll the pinned section, with a
  // soft fade in the final 15% so the next section can take over cleanly.
  // Spring smoothing prevents jitter on Lenis-driven scroll.
  const scaleRaw = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const scale = useSpring(scaleRaw, { stiffness: 200, damping: 40, mass: 0.4 });
  const opacityRaw = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0.55]);
  const opacity = useSpring(opacityRaw, { stiffness: 200, damping: 40, mass: 0.4 });

  return (
    <div ref={sectionRef} className="phero-pin">
      <section ref={heroRef} className="phero">
        <div className="phero__portrait">
          <motion.div className="phero__portrait-inner" style={{ scale, opacity }}>
            <Image
              src={HERO_IMAGE_SRC}
              alt="Stoyan Tanev portrait"
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "contain", objectPosition: "center bottom" }}
              className="phero__portrait-img"
            />
          </motion.div>
        </div>

        <motion.div className="phero__marquee" style={{ x }} aria-hidden="true">
          <span>{MARQUEE_TEXT}</span>
        </motion.div>

      <h1 className="phero__sr-only">Stoyan Tanev — Independent Web Designer in Plovdiv, Bulgaria</h1>

      <div className="phero__socials">
        <a href="https://www.instagram.com/tanev.design/" target="_blank" rel="noreferrer noopener" aria-label="Instagram">
          <Instagram size={14} aria-hidden="true" />
          <span>Instagram</span>
        </a>
        <a href="https://www.linkedin.com/in/stoyan-tanev-a732603b8/" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn">
          <Linkedin size={14} aria-hidden="true" />
          <span>LinkedIn</span>
        </a>
        <a href="https://github.com/stoyanbtanev" target="_blank" rel="noreferrer noopener" aria-label="GitHub">
          <Github size={14} aria-hidden="true" />
          <span>GitHub</span>
        </a>
        <a href="https://x.com/tanevdesign" target="_blank" rel="noreferrer noopener" aria-label="X (formerly Twitter)">
          <Twitter size={14} aria-hidden="true" />
          <span>X</span>
        </a>
      </div>

      <div className="phero__role">
        <div className="phero__role-text">
          <span>{"// Independent"}</span>
          <span>Web Designer</span>
        </div>
      </div>
      </section>
    </div>
  );
}
