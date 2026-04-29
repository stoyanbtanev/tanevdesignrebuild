"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { blogs, faqs, image, services } from "@/data/site";
import type { DetailPage } from "@/data/site";
import { DetailModal, type DetailKind } from "@/components/DetailModal";
import { FAQ } from "@/components/FAQ";
import { PortraitHero } from "@/components/PortraitHero";
import { CapabilityMarquee } from "@/components/CapabilityMarquee";
import {
  ParallaxFeatureSection,
  ParallaxImage,
  type ParallaxFeatureItem
} from "@/components/ui/parallax-scroll-feature-section";

const reasons: ParallaxFeatureItem[] = [
  {
    id: "offer",
    eyebrow: "01",
    title: "Built Around The Offer",
    description:
      "Every section is mapped around what the business does, why it should be trusted, and what the visitor should do next.",
    imageUrl: image.style.businessWebsite,
    imageAlt: "Business website layout planning",
    reverse: false
  },
  {
    id: "mobile",
    eyebrow: "02",
    title: "Mobile-first UX",
    description:
      "Layouts are designed for real visitors on real devices, with clear user flows and responsive behavior from the start.",
    imageUrl: image.style.responsive,
    imageAlt: "Responsive mobile-first layout",
    reverse: true
  },
  {
    id: "seo",
    eyebrow: "03",
    title: "SEO and Speed Included",
    description:
      "Semantic HTML, on-page SEO, Core Web Vitals, and launch setup are treated as part of the website, not extras.",
    imageUrl: image.style.seo,
    imageAlt: "On-page SEO and performance work",
    reverse: false
  }
];

const technicalStack = [
  {
    title: "React / Vite",
    copy: "Modern component builds when a custom front-end is the right fit.",
    tags: ["React", "Vite"]
  },
  {
    title: "HTML5 / CSS3 / JavaScript",
    copy: "Semantic structure, responsive styling, and clean browser behavior.",
    tags: ["HTML5", "CSS3", "JS"]
  },
  {
    title: "SVG Animations",
    copy: "Micro-interactions and small motion details that support the interface.",
    tags: ["SVG", "Motion"]
  },
  {
    title: "Fast Deployment",
    copy: "Launch-ready hosting setup for Vercel, Netlify, or Cloudflare Pages.",
    tags: ["Vercel", "Netlify", "Cloudflare"]
  },
  {
    title: "Accessibility",
    copy: "WCAG-minded structure, contrast, labels, keyboard states, and readable UI.",
    tags: ["WCAG", "A11y"]
  },
  {
    title: "Analytics Setup",
    copy: "Google Analytics and Search Console integration for launch visibility.",
    tags: ["GA", "Search Console"]
  }
] as const;

export default function Home() {
  const [active, setActive] = useState<{ kind: DetailKind; page: DetailPage } | null>(null);
  const openDetail = (kind: DetailKind, page: DetailPage) => setActive({ kind, page });
  const closeDetail = () => setActive(null);

  return (
    <div className="elite-home">
      <PortraitHero />

      <CapabilityMarquee />

      <section className="elite-section page-shell elite-intro" id="work">
        <div className="elite-intro__eyebrow reveal">
          <span>{"// Intro"}</span>
          <span>Designer &amp; developer for early-stage brands</span>
        </div>

        <div className="elite-intro__layout">
          <h2 className="elite-intro__headline" data-split-intro>
            I’m a <span className="elite-intro__accent">versatile designer who partners with founders</span> to ship
            real websites — focused on clear interfaces, sharp decisions, and fast execution.
          </h2>

          <div className="elite-intro__panel reveal">
            <p>
              Branding, marketing sites, or product UI — I cover the whole build end-to-end and deliver clean, effective
              work from first sketch to launch.
            </p>

            <a className="elite-pill" href="#contact" data-cursor="START">
              Start a project
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="elite-section page-shell elite-why" id="about">
        <div className="elite-section__head reveal">
          <p className="elite-kicker">Why choose me?</p>
          <h2>Websites people can understand, use, and find.</h2>
        </div>

        <ParallaxFeatureSection items={reasons} className="elite-why__parallax" />
      </section>

      <section className="elite-section page-shell" id="services">
        <div className="elite-section__head reveal">
          <p className="elite-kicker">Services</p>
          <h2>Client-facing services, framed around real business outcomes.</h2>
        </div>

        <div className="elite-service-grid">
          {services.map((service) => (
            <button
              type="button"
              className="elite-service-card reveal"
              key={service.slug}
              data-cursor="OPEN"
              onClick={() => openDetail("Service", service)}
            >
              <span>{service.price}</span>
              <h3>{service.label}</h3>
              <p>{service.summary}</p>
              <ArrowUpRight size={18} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      <section className="elite-section page-shell elite-experience" id="stack">
        <div className="elite-section__head reveal">
          <p className="elite-kicker">Tools &amp; Technologies</p>
          <h2>The technical stack behind the work.</h2>
        </div>

        <figure className="elite-stack-media reveal">
          <ParallaxImage
            src={image.style.tools}
            alt="Web design tools and technologies workspace"
            width={1672}
            height={941}
            rounded={false}
          />
        </figure>

        <div className="elite-experience__grid">
          {technicalStack.map((item) => (
            <article className="elite-exp-card reveal" key={item.title}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
              <div>
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="elite-section page-shell elite-faq">
        <div className="elite-section__head reveal">
          <p className="elite-kicker">Find answers here</p>
          <h2>Before we build.</h2>
        </div>

        <div className="elite-faq__grid">
          <figure className="elite-faq__media reveal">
            <ParallaxImage
              src={image.style.faq}
              alt="Website project briefing cards"
              width={900}
              height={900}
              rounded={false}
            />
          </figure>
          <div className="elite-faq__list">
            <FAQ items={faqs} />
          </div>
        </div>
      </section>

      <section className="elite-section page-shell" id="journal">
        <div className="elite-section__head reveal">
          <p className="elite-kicker">Design notes</p>
          <h2>Practical notes on websites that work.</h2>
        </div>

        <div className="elite-blog-grid">
          {blogs.slice(0, 3).map((post) => (
            <button
              type="button"
              className="elite-blog-card reveal"
              key={post.slug}
              data-cursor="READ"
              onClick={() => openDetail("Blog", post)}
            >
              <Image
                src={post.cover}
                width={800}
                height={520}
                alt={`${post.title} article cover`}
                sizes="(max-width: 760px) 92vw, (max-width: 1200px) 33vw, 400px"
                loading="eager"
                fetchPriority="high"
                className="elite-blog-card__img"
              />
              <span>{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              <h3>{post.subtitle}</h3>
              <p>
                Learn more
                <ArrowRight size={14} aria-hidden="true" />
              </p>
            </button>
          ))}
        </div>
      </section>

      <DetailModal page={active?.page ?? null} kind={active?.kind ?? "Project"} onClose={closeDetail} />
    </div>
  );
}
