"use client";

import { ArrowUpRight } from "lucide-react";
import { HoverSwapText } from "@/components/HoverSwapText";
import { TextRotate } from "@/components/ui/text-rotate";
import { SimpleTree } from "@/components/ui/simple-growth-tree";

const socials = [
  ["GH", "https://github.com/stoyantanev"],
  ["IN", "https://www.linkedin.com/in/stoyan-tanev/"]
] as const;

const rotatingWords = [
  "MEMORABLE",
  "TRUSTED",
  "FAST",
  "CLEAN",
  "FOUND",
  "CLEAR",
  "POLISHED",
  "SCALABLE"
];

export function Footer() {
  return (
    <footer className="site-footer">
      <SimpleTree />

      <div className="footer-opener page-shell">
        <div>
          <div className="eyebrow footer-rotate" role="text">
            {/* Removed LayoutGroup and layout props to prevent reflow jank
                on mobile devices during text rotation. The TextRotate component
                handles its own enter/exit animations via AnimatePresence. */}
            <div className="footer-rotate__line">
              <span className="footer-rotate__static">
                READY TO BUILD SOMETHING&nbsp;
              </span>
              <TextRotate
                texts={rotatingWords}
                mainClassName="footer-rotate__word"
                splitLevelClassName="overflow-hidden"
                staggerDuration={0.025}
                staggerFrom="last"
                rotationInterval={2600}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              />
              <span className="footer-rotate__static">
                ?
              </span>
            </div>
          </div>
          <button type="button" className="footer-giant" data-contact-trigger data-cursor="CONTACT">
            <HoverSwapText>LETSTALK</HoverSwapText>
          </button>
        </div>
        <button className="pill pill--large" type="button" data-contact-trigger data-magnetic data-cursor="CONTACT">
          LET&apos;S WORK TOGETHER
          <ArrowUpRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="footer-bottom page-shell">
        <p>&copy;2026 TANEV.DESIGN</p>
        <nav aria-label="Social links">
          {socials.map(([label, href]) => (
            <a href={href} key={label} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" data-cursor="OPEN">
              {label}
            </a>
          ))}
          <button type="button" data-contact-trigger data-cursor="CONTACT">
            MAIL
          </button>
        </nav>
        <a href="#top" data-cursor="OPEN">
          BACK TO TOP
        </a>
      </div>
    </footer>
  );
}
