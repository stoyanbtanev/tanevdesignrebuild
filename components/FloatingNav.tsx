"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Code2,
  Handshake,
  House,
  Images,
  MessageCircle,
  Menu,
  Newspaper,
  X,
  UserRound
} from "lucide-react";
import { MenuContainer, MenuItem } from "@/components/ui/fluid-menu";

type FloatingNavItem = {
  href?: string;
  label: string;
  description: string;
  icon: ReactNode;
};

const navItems: FloatingNavItem[] = [
  {
    href: "/",
    label: "Home",
    description: "Where it starts",
    icon: <House size={24} aria-hidden="true" strokeWidth={1.5} />
  },
  {
    href: "/#work",
    label: "Work",
    description: "Selected projects",
    icon: <Images size={24} aria-hidden="true" strokeWidth={1.5} />
  },
  {
    href: "/#about",
    label: "About",
    description: "Me & my background",
    icon: <UserRound size={24} aria-hidden="true" strokeWidth={1.5} />
  },
  {
    href: "/#services",
    label: "Services",
    description: "What I can help with",
    icon: <Handshake size={24} aria-hidden="true" strokeWidth={1.5} />
  },
  {
    href: "/#stack",
    label: "Tools and technologies",
    description: "Technical stack",
    icon: <Code2 size={24} aria-hidden="true" strokeWidth={1.5} />
  },
  {
    href: "/#journal",
    label: "Journal",
    description: "Thoughts & articles",
    icon: <Newspaper size={24} aria-hidden="true" strokeWidth={1.5} />
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
      <nav id="site-floating-navigation" className="float-nav__orbit" aria-label="Primary navigation">
        <MenuContainer expanded={open} itemOffset={48}>
          <MenuItem
            ariaLabel={open ? "Close navigation" : "Open navigation"}
            className="float-nav__trigger"
            dataCursor="MENU"
            onClick={() => setOpen((current) => !current)}
          >
            <span className="float-nav__trigger-ring" aria-hidden="true" />
            <span className="float-nav__trigger-icon" aria-hidden="true">
              <Menu className="float-nav__trigger-open" size={24} strokeWidth={1.5} />
              <X className="float-nav__trigger-close" size={24} strokeWidth={1.5} />
            </span>
            <span className="sr-only">{open ? "Close navigation" : "Open navigation"}</span>
          </MenuItem>

          {navItems.map((item) => (
            <MenuItem
              href={item.href}
              key={item.href}
              ariaLabel={`${item.label}: ${item.description}`}
              className="float-nav__link"
              dataCursor="OPEN"
              isActive={isActive(item.href)}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              icon={item.icon}
            />
          ))}

          <MenuItem
            href="/#contact"
            ariaLabel="Contact footer section"
            className="float-nav__contact"
            dataCursor="OPEN"
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            icon={<MessageCircle size={24} aria-hidden="true" strokeWidth={1.5} />}
          />
        </MenuContainer>
      </nav>
    </div>
  );
}
