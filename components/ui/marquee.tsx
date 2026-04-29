import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: ReactNode;
  vertical?: boolean;
  repeat?: number;
  speed?: "slow" | "normal" | "fast";
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 5,
  speed = "normal",
  style,
  ...props
}: MarqueeProps) {
  const speedVariants = {
    slow: "120s",
    normal: "40s",
    fast: "10s"
  };

  return (
    <div
      {...props}
      data-pause-on-hover={pauseOnHover || undefined}
      data-reverse={reverse || undefined}
      data-vertical={vertical || undefined}
      style={
        {
          ...style,
          "--duration": speedVariants[speed],
          "--gap": "6px"
        } as CSSProperties
      }
      className={cn("ui-marquee", className)}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="ui-marquee__group">
            {children}
          </div>
        ))}
    </div>
  );
}
