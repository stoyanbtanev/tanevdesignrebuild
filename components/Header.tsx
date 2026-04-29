"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Mail, Menu, X } from "lucide-react";
import { site } from "@/data/site";

const nav = [
  ["WORK", "/#work"],
  ["SERVICES", "/#services"],
  ["TOOLS", "/#stack"],
  ["CONTACT", "#contact"]
] as const;

function useClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      timeZone: site.timezone
    });

    const update = () => setTime(formatter.format(new Date()).replace(/:\d{2}\s/, " "));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const time = useClock();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="site-header__inner">
          <Link href="/" className="wordmark" aria-label="tanev.design home" data-cursor="OPEN">
            <Image src="/assets/icons/tanev-logo.svg" width={164} height={42} alt="Tanev Design" priority />
          </Link>

          <p className="header-meta header-meta--location">{site.location}</p>
          <time className="header-meta" aria-live="polite">
            {time || "--:--"}
          </time>
          <button className="header-meta header-email" type="button" data-contact-trigger data-cursor="CONTACT">
            <Mail size={14} aria-hidden="true" />
            Contact
          </button>

          <button className="pill pill--header" type="button" data-contact-trigger data-magnetic data-cursor="CONTACT">
            LET&apos;S WORK TOGETHER
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>

          <button
            className="menu-button"
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        className={`mobile-menu ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        inert={!open}
      >
        <button className="mobile-menu__close" type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
          <X size={28} aria-hidden="true" />
        </button>
        <div className="mobile-menu__mark">
          <Image src="/assets/icons/star.svg" width={76} height={76} alt="" />
        </div>
        <nav className="mobile-menu__nav" aria-label="Mobile navigation">
          {nav.map(([label, href], index) =>
            href === "#contact" ? (
              <button
                type="button"
                key={label}
                data-contact-trigger
                onClick={() => setOpen(false)}
                style={{ transitionDelay: `${index * 40}ms` }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {label}
              </button>
            ) : (
              <Link key={label} href={href} onClick={() => setOpen(false)} style={{ transitionDelay: `${index * 40}ms` }}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {label}
              </Link>
            )
          )}
        </nav>
        <div className="mobile-menu__footer">
          <p>{site.location}</p>
          <button type="button" data-contact-trigger onClick={() => setOpen(false)}>
            Start a project
          </button>
        </div>
      </div>
    </>
  );
}
