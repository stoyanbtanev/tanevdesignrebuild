"use client";

import { HoverSwapText } from "@/components/HoverSwapText";
import { TextRotate } from "@/components/ui/text-rotate";
import { GalaxyFooterBg } from "@/components/ui/galaxy-footer-bg";

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
    <footer id="contact" className="site-footer" style={{ background: "transparent" }}>
      <GalaxyFooterBg />

      <div className="footer-opener page-shell" style={{ zIndex: 2 }}>
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
      </div>

      <div className="footer-bottom page-shell" style={{ zIndex: 2 }}>
        <p>&copy;2026 TANEV.DESIGN</p>
        <a className="footer-back-to-top" href="#top" data-cursor="OPEN">BACK TO TOP</a>
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
      </div>
    </footer>
  );
}
