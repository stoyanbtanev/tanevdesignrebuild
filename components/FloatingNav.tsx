"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  BookOpenText,
  BriefcaseBusiness,
  Home,
  Mail,
  Menu,
  PanelsTopLeft,
  Send,
  UserRound,
  Wrench,
  X
} from "lucide-react";
import { site } from "@/data/site";

type FloatingNavItem = {
  href?: string;
  contact?: boolean;
  label: string;
  eyebrow: string;
  icon: ReactNode;
};

const navItems: FloatingNavItem[] = [
  {
    href: "/",
    label: "Home",
    eyebrow: "00",
    icon: <Home size={18} aria-hidden="true" strokeWidth={1.7} />
  },
  {
    href: "/#work",
    label: "Work",
    eyebrow: "01",
    icon: <PanelsTopLeft size={18} aria-hidden="true" strokeWidth={1.7} />
  },
  {
    href: "/#about",
    label: "About",
    eyebrow: "02",
    icon: <UserRound size={18} aria-hidden="true" strokeWidth={1.7} />
  },
  {
    href: "/#services",
    label: "Services",
    eyebrow: "03",
    icon: <Wrench size={18} aria-hidden="true" strokeWidth={1.7} />
  },
  {
    href: "/#journal",
    label: "Journal",
    eyebrow: "04",
    icon: <BookOpenText size={18} aria-hidden="true" strokeWidth={1.7} />
  },
  {
    contact: true,
    label: "Contact",
    eyebrow: "05",
    icon: <BriefcaseBusiness size={18} aria-hidden="true" strokeWidth={1.7} />
  }
];

export function FloatingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href.includes("#")) {
      return false;
    }

    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href.split("#")[0];
  };

  return (
    <div className={`float-nav ${open ? "is-open" : ""}`}>
      <button
        className="float-nav__scrim"
        type="button"
        aria-label="Close navigation"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
      />

      <aside id="site-floating-navigation" className="float-nav__panel" aria-label="Site navigation" aria-hidden={!open}>
        <div className="float-nav__mast">
          <Link href="/" className="float-nav__brand" onClick={() => setOpen(false)}>
            tanev.design
          </Link>
          <span>{site.location}</span>
        </div>

        <nav className="float-nav__links" aria-label="Primary navigation">
          {navItems.map((item, index) => {
            const style = { "--nav-delay": `${index * 45}ms` } as CSSProperties;
            const content = (
              <>
                <span className="float-nav__link-icon">{item.icon}</span>
                <span className="float-nav__link-copy">
                  <span>{item.eyebrow}</span>
                  {item.label}
                </span>
              </>
            );

            if (item.contact) {
              return (
                <button
                  type="button"
                  key={item.label}
                  className="float-nav__link"
                  style={style}
                  data-contact-trigger
                  data-cursor="CONTACT"
                  onClick={() => setOpen(false)}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                href={item.href ?? "/"}
                key={item.href}
                className="float-nav__link"
                style={style}
                data-active={isActive(item.href)}
                aria-current={isActive(item.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {content}
              </Link>
            );
          })}
        </nav>

        <div className="float-nav__dock">
          <button
            type="button"
            className="float-nav__email"
            data-contact-trigger
            data-cursor="CONTACT"
            onClick={() => setOpen(false)}
          >
            <Mail size={16} aria-hidden="true" strokeWidth={1.8} />
            <span>Contact</span>
          </button>
          <button
            type="button"
            className="float-nav__start"
            data-contact-trigger
            data-cursor="START"
            onClick={() => setOpen(false)}
          >
            Start
            <Send size={15} aria-hidden="true" strokeWidth={1.9} />
          </button>
        </div>
      </aside>

      <button
        className="float-nav__trigger"
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="site-floating-navigation"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="float-nav__trigger-ring" aria-hidden="true" />
        {open ? <X size={24} aria-hidden="true" strokeWidth={1.8} /> : <Menu size={24} aria-hidden="true" strokeWidth={1.8} />}
      </button>
    </div>
  );
}
