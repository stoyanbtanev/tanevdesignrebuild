"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ParallaxFeatureItem = {
  id: string | number;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt?: string;
  reverse?: boolean;
  eyebrow?: string;
  cta?: ReactNode;
};

type RowProps = {
  item: ParallaxFeatureItem;
  index: number;
};

/**
 * Single parallax row. Extracted into a child component so each row owns its
 * own hooks instead of calling them inside `.map()` (rules-of-hooks safe).
 */
function ParallaxRow({ item, index }: RowProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.7],
    ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]
  );
  const translateY = useTransform(scrollYProgress, [0, 1], [-50, 0]);

  const reverse = Boolean(item.reverse ?? index % 2 === 1);

  return (
    <div
      ref={ref}
      className={cn(
        "min-h-screen flex items-center justify-center md:gap-40 gap-12 md:flex-row flex-col py-20",
        reverse ? "md:flex-row-reverse" : ""
      )}
    >
      <motion.div style={{ y: translateY }} className="max-w-sm">
        {item.eyebrow ? (
          <p className="elite-kicker mb-4">{item.eyebrow}</p>
        ) : null}
        <div className="text-4xl md:text-6xl leading-[1.05] font-[var(--font-display)]">
          {item.title}
        </div>
        <motion.p
          style={{ y: translateY }}
          className="text-white/70 mt-6 md:mt-10 text-base"
        >
          {item.description}
        </motion.p>
        {item.cta ? <div className="mt-8">{item.cta}</div> : null}
      </motion.div>

      <motion.div
        style={{ opacity, clipPath }}
        className="relative shrink-0"
      >
        <Image
          src={item.imageUrl}
          alt={item.imageAlt ?? item.title}
          width={640}
          height={640}
          sizes="(max-width: 768px) 70vw, 384px"
          loading="eager"
          fetchPriority="high"
          className="size-72 md:size-80 lg:size-96 object-cover"
        />
      </motion.div>
    </div>
  );
}

type ParallaxImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  imgClassName?: string;
  rounded?: boolean;
};

/**
 * Single image that reveals with a left-to-right clip-path sweep and fades in
 * as it scrolls into view. Used to apply the same parallax language to one-off
 * figures across the site.
 */
export function ParallaxImage({
  src,
  alt,
  width = 1280,
  height = 960,
  className,
  imgClassName,
  rounded = true
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center start"]
  });
  const opacity = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.7],
    ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]
  );

  return (
    <motion.div
      ref={ref}
      style={{ opacity, clipPath }}
      className={cn("relative w-full h-full block", className)}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 768px) 92vw, (max-width: 1280px) 70vw, 1200px"
        loading="eager"
        fetchPriority="high"
        className={cn(
          "w-full h-auto object-cover",
          rounded ? "rounded-[var(--radius)]" : "",
          imgClassName
        )}
      />
    </motion.div>
  );
}

export type ParallaxFeatureSectionProps = {
  items: ParallaxFeatureItem[];
  intro?: ReactNode;
  outro?: ReactNode;
  className?: string;
};

/**
 * Configurable, site-friendly version of the parallax feature section. Use
 * this anywhere a list of feature rows should reveal with a clip-path image
 * sweep and a translate-y text parallax.
 */
export function ParallaxFeatureSection({
  items,
  intro,
  outro,
  className
}: ParallaxFeatureSectionProps) {
  return (
    <div className={cn("flex flex-col md:px-0 px-6", className)}>
      {intro}
      {items.map((item, index) => (
        <ParallaxRow key={item.id} item={item} index={index} />
      ))}
      {outro}
    </div>
  );
}

/**
 * Original demo component preserved verbatim in spirit, with sections data and
 * the intro/outro frames. Useful as a standalone showcase route or a fallback.
 */
export const Component = () => {
  const sections: ParallaxFeatureItem[] = [
    {
      id: 1,
      title: "Feature 1",
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ab maxime sequi, pariatur illum, adipisci ullam optio quod tempora necessitatibus consectetur eaque deleniti id totam possimus unde dolorum inventore incidunt. Ea.",
      imageUrl:
        "https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=800&q=80",
      reverse: false
    },
    {
      id: 2,
      title: "Feature 2",
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ab maxime sequi, pariatur illum, adipisci ullam optio quod tempora necessitatibus consectetur eaque deleniti id totam possimus unde dolorum inventore incidunt. Ea.",
      imageUrl:
        "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=800&q=80",
      reverse: true
    },
    {
      id: 3,
      title: "Feature 3",
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ab maxime sequi, pariatur illum, adipisci ullam optio quod tempora necessitatibus consectetur eaque deleniti id totam possimus unde dolorum inventore incidunt. Ea.",
      imageUrl:
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80",
      reverse: false
    }
  ];

  return (
    <div>
      <div className="min-h-screen w-screen flex flex-col items-center justify-center">
        <h1 className="text-6xl max-w-2xl text-center">
          PARALLAX SCROLL FEATURE SECTION
        </h1>
        <p className="mt-20 flex items-center gap-1.5 text-sm">
          SCROLL <ArrowDown size={15} />
        </p>
      </div>
      <ParallaxFeatureSection items={sections} />
      <div className="min-h-screen w-screen flex flex-col items-center justify-center">
        <h1 className="text-8xl">The End</h1>
      </div>
    </div>
  );
};

export default Component;
