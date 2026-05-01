"use client";

import React, { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface MenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  showChevron?: boolean;
}

export function Menu({ trigger, children, align = "left", showChevron = true }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex cursor-pointer items-center border-0 bg-transparent p-0 text-inherit"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
        {showChevron && <ChevronDown className="ml-2 -mr-1 h-4 w-4 text-current opacity-60" aria-hidden="true" />}
      </button>

      {isOpen && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} z-50 mt-2 w-56 rounded-md bg-white py-1 text-neutral-950 shadow-lg ring-1 ring-black/10 focus:outline-none dark:bg-neutral-900 dark:text-neutral-50 dark:ring-white/10`}
          role="menu"
          aria-orientation="vertical"
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface MenuItemProps {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  isActive?: boolean;
  href?: string;
  ariaLabel?: string;
  className?: string;
  tabIndex?: number;
  dataContactTrigger?: boolean;
  dataCursor?: string;
}

export function MenuItem({
  children,
  onClick,
  disabled = false,
  icon,
  isActive = false,
  href,
  ariaLabel,
  className = "",
  tabIndex,
  dataContactTrigger,
  dataCursor
}: MenuItemProps) {
  const sharedClassName = `fluid-menu__item relative block h-16 w-16 text-center transition-colors ${
    disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"
  } ${isActive ? "is-active" : ""} ${className}`;
  const content = (
    <span className="fluid-menu__item-inner flex h-full items-center justify-center">
      {icon && <span className="fluid-menu__item-icon h-6 w-6 transition-all duration-200">{icon}</span>}
      {children}
    </span>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={sharedClassName}
        role="menuitem"
        aria-label={ariaLabel}
        aria-current={isActive ? "page" : undefined}
        data-cursor={dataCursor}
        onClick={onClick}
        tabIndex={tabIndex}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={sharedClassName}
      type="button"
      role="menuitem"
      aria-label={ariaLabel}
      aria-current={isActive ? "page" : undefined}
      data-contact-trigger={dataContactTrigger ? true : undefined}
      data-cursor={dataCursor}
      onClick={onClick}
      disabled={disabled}
      tabIndex={tabIndex}
    >
      {content}
    </button>
  );
}

interface MenuContainerProps {
  children: React.ReactNode;
  expanded?: boolean;
  itemOffset?: number;
  className?: string;
}

export function MenuContainer({ children, expanded = false, itemOffset = 48, className = "" }: MenuContainerProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={`fluid-menu relative w-16 ${className}`} data-expanded={expanded} role="menu">
      <div className="relative">
        {childrenArray.map((child, index) => {
          const isTrigger = index === 0;
          const style = {
            transform: `translateY(${expanded ? index * itemOffset : 0}px)`,
            opacity: isTrigger || expanded ? 1 : 0,
            zIndex: 80 - index,
            clipPath: index === childrenArray.length - 1 ? "circle(50% at 50% 50%)" : "circle(50% at 50% 55%)",
            transition: `transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${expanded ? "300ms" : "350ms"}`,
            backfaceVisibility: "hidden",
            perspective: 1000,
            WebkitFontSmoothing: "antialiased",
            "--fluid-index": index
          } as CSSProperties;

          return (
            <div key={index} className="fluid-menu__slot absolute left-0 top-0 h-16 w-16 will-change-transform" style={style} aria-hidden={!isTrigger && !expanded}>
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
}
