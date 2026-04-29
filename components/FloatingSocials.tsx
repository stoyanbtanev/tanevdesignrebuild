"use client";

import { ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

type FloatingItem = {
  href?: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
  contact?: boolean;
};

const items: FloatingItem[] = [
  {
    href: "https://github.com/stoyantanev",
    label: "GitHub",
    icon: <Github size={20} aria-hidden="true" strokeWidth={1.6} />,
    external: true
  },
  {
    href: "https://www.linkedin.com/in/stoyan-tanev/",
    label: "LinkedIn",
    icon: <Linkedin size={20} aria-hidden="true" strokeWidth={1.6} />,
    external: true
  },
  {
    href: "https://x.com/",
    label: "X / Twitter",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25Zm-1.16 17.52h1.833L7.084 4.126H5.117L17.084 19.77Z" />
      </svg>
    ),
    external: true
  },
  {
    contact: true,
    label: "Email",
    icon: <Mail size={20} aria-hidden="true" strokeWidth={1.6} />
  }
];

export function FloatingSocials() {
  return (
    <aside className="floating-cta" aria-label="Quick contact">
      <div className="floating-cta__pod">
        <span className="floating-cta__eyebrow" aria-hidden="true">
          <span className="floating-cta__pulse" />
          AVAILABLE
        </span>

        <div className="floating-cta__socials">
          {items.map((item, index) => {
            const style = {
              "--cta-delay": `${160 + index * 90}ms`,
              "--ping-delay": `${index * 700}ms`
            } as CSSProperties;

            if (item.contact) {
              return (
                <button
                  key={item.label}
                  type="button"
                  className="floating-cta__btn"
                  style={style}
                  aria-label={item.label}
                  data-contact-trigger
                  data-cursor="CONTACT"
                  data-magnetic
                >
                  <span className="floating-cta__ping" aria-hidden="true" />
                  {item.icon}
                  <span className="floating-cta__label" aria-hidden="true">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <a
                key={item.label}
                href={item.href ?? "#"}
                className="floating-cta__btn"
                style={style}
                aria-label={item.label}
                data-cursor="OPEN"
                data-magnetic
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
              >
                <span className="floating-cta__ping" aria-hidden="true" />
                {item.icon}
                <span className="floating-cta__label" aria-hidden="true">
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>

        <button
          type="button"
          className="floating-cta__primary"
          data-contact-trigger
          data-cursor="CONTACT"
          data-magnetic
        >
          <span className="floating-cta__dot" aria-hidden="true" />
          Let&apos;s Talk
          <ArrowUpRight size={14} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
