export type DetailBlock = {
  eyebrow: string;
  body: string[];
};

export type DetailPage = {
  slug: string;
  title: string;
  compactTitle: string;
  subtitle: string;
  categoryLabel: string;
  categories: string[];
  typeLabel: string;
  typeValue: string;
  cover: string;
  detailImages: [string, string];
  blocks: [DetailBlock, DetailBlock, DetailBlock];
  ctaLabel: string;
  ctaHref: string;
  closingImage: string;
};

export type Project = DetailPage & {
  year: string;
  outcome: string;
  externalUrl?: string;
};

export type BlogPost = DetailPage & {
  date: string;
  readTime: string;
};

export type Service = DetailPage & {
  label: string;
  summary: string;
  deliverables: string[];
  price: string;
  visual: string;
};

export const site = {
  name: "tanev.design",
  legalName: "Tanev Design",
  person: "Stoyan Tanev",
  location: "Plovdiv, BG",
  timezone: "Europe/Sofia",
  url: "https://tanev.design",
  description:
    "Website design, UI/UX, SEO, and fast front-end builds for local businesses in Bulgaria and the EU."
};

export const contactHref = "#contact";

export const image = {
  portrait: "/assets/newherowithbackground.png?v=masked-hero-20260429",
  style: {
    websiteDesign: "/assets/mockup.png",
    uiux: "/assets/UIUXDesignService.png",
    seo: "/assets/SEO.png",
    landingPage: "/assets/landingpage.jpg",
    businessWebsite: "/assets/BusinessWebsitesService.png",
    performance: "/assets/PerformanceOptimizationService.png",
    responsive: "/assets/ResponsiveDesignService.png",
    why: "/assets/whymesec.jpg",
    faq: "/assets/FAQ Section.png",
    tools: "/assets/Tools&TechnologiesBlock.png",
    blogUx: "/assets/BlogCoverUXMistakes.png",
    blogSeo: "/assets/BlogCoverSEOBasics.png",
    blogLanding: "/assets/BlogCoverLandingvsMultipage.png",
    darkMetro: "/assets/mockup.png",
    darkStreet: "/assets/BlogCoverUXMistakes.png",
    graff: "/assets/BusinessWebsitesService.png",
    concept: "/assets/Tools&TechnologiesBlock.png",
    rust: "/assets/ResponsiveDesignService.png",
    oldBall: "/assets/BlogCoverLandingvsMultipage.png",
    underwater: "/assets/BlogCoverSEOBasics.png",
    vlood: "/assets/SEO.png",
    vloodHand: "/assets/FAQ Section.png",
    targetBoard: "/assets/UIUXDesignService.png",
    midnightStreet: "/assets/PerformanceOptimizationService.png",
    brokenSkate: "/assets/landingpage.jpg"
  },
  works: {
    speedlink: "/assets/media/works/speedlink.png",
    pekarniSiana: "/assets/media/works/pekarnisiana.png",
    nusiClima: "/assets/media/works/nusiclima.png",
    wonderplayStudio: "/assets/media/works/wonderplaystudio.png",
    elk: "/assets/media/works/elk.png"
  }
};

const projectBlocks = (name: string): [DetailBlock, DetailBlock, DetailBlock] => [
  {
    eyebrow: "CONTEXT",
    body: [
      `${name} needed a site that felt direct, memorable, and easy to act on without turning into a generic template.`,
      "The work focused on sharpening the first impression, reducing friction, and giving the brand a clear visual system."
    ]
  },
  {
    eyebrow: "METHOD",
    body: [
      "I mapped the visitor decisions first, then designed the key sections around proof, speed, and one obvious next step.",
      "The build uses reusable sections, responsive image ratios, and measured motion so the interface feels alive without getting in the way."
    ]
  },
  {
    eyebrow: "OUTCOME",
    body: [
      "The final direction is lean, cinematic, and commercially clear. Every scroll either explains the offer or moves the visitor closer to contact."
    ]
  }
];

export const projects: Project[] = [
  {
    slug: "speedlink-eu",
    title: "Speedlink EU",
    compactTitle: "SPEEDLINKEU",
    subtitle: "A logistics web presence rebuilt for trust, routes, and quote requests.",
    categoryLabel: "SERVICES",
    categories: ["UI/UX", "DEVELOPMENT", "SEO"],
    typeLabel: "Project Type",
    typeValue: "Business website",
    year: "2026",
    outcome: "Quote-first site system",
    cover: image.works.speedlink,
    detailImages: [image.works.speedlink, image.style.performance],
    blocks: projectBlocks("Speedlink EU"),
    ctaLabel: "VIEW LIVE SITE",
    ctaHref: "https://speedlink-eu.vercel.app/",
    externalUrl: "https://speedlink-eu.vercel.app/",
    closingImage: image.works.speedlink
  },
  {
    slug: "pekarni-siana",
    title: "Pekarni Siana",
    compactTitle: "PEKARNISIANA",
    subtitle: "A warm bakery site translated into a sharper ordering and discovery flow.",
    categoryLabel: "SERVICES",
    categories: ["BRANDING", "WEBSITE", "LOCAL SEO"],
    typeLabel: "Project Type",
    typeValue: "Local business",
    year: "2026",
    outcome: "Local demand engine",
    cover: image.works.pekarniSiana,
    detailImages: [image.works.pekarniSiana, image.style.businessWebsite],
    blocks: projectBlocks("Pekarni Siana"),
    ctaLabel: "VIEW LIVE SITE",
    ctaHref: "https://pekarnisiana.github.io/site/",
    externalUrl: "https://pekarnisiana.github.io/site/",
    closingImage: image.works.pekarniSiana
  },
  {
    slug: "nusi-clima",
    title: "Nusi Clima",
    compactTitle: "NUSICLIMA",
    subtitle: "A climate services site built around fast quotes and local trust.",
    categoryLabel: "SERVICES",
    categories: ["UI/UX", "DEVELOPMENT", "SEO"],
    typeLabel: "Project Type",
    typeValue: "Service business",
    year: "2026",
    outcome: "Quote-led service site",
    cover: image.works.nusiClima,
    detailImages: [image.works.nusiClima, image.style.seo],
    blocks: projectBlocks("Nusi Clima"),
    ctaLabel: "VIEW LIVE SITE",
    ctaHref: "https://nusiclima.vercel.app/",
    externalUrl: "https://nusiclima.vercel.app/",
    closingImage: image.works.nusiClima
  },
  {
    slug: "wonderplay-studio",
    title: "Wonderplay Studio",
    compactTitle: "WONDERPLAYSTUDIO",
    subtitle: "A creative studio surface with motion-led storytelling and editorial pacing.",
    categoryLabel: "SERVICES",
    categories: ["BRANDING", "UI/UX", "MOTION"],
    typeLabel: "Project Type",
    typeValue: "Creative studio",
    year: "2026",
    outcome: "Studio launch surface",
    cover: image.works.wonderplayStudio,
    detailImages: [image.works.wonderplayStudio, image.style.uiux],
    blocks: projectBlocks("Wonderplay Studio"),
    ctaLabel: "VIEW LIVE SITE",
    ctaHref: "https://wonderplay-studio-preview.vercel.app/",
    externalUrl: "https://wonderplay-studio-preview.vercel.app/",
    closingImage: image.works.wonderplayStudio
  },
  {
    slug: "elk",
    title: "Elk Konsol",
    compactTitle: "ELKKONSOL",
    subtitle: "A specialist supplier site shaped for fast catalog scanning and direct contact.",
    categoryLabel: "SERVICES",
    categories: ["WEBSITE", "CATALOG", "SEO"],
    typeLabel: "Project Type",
    typeValue: "Industrial supplier",
    year: "2025",
    outcome: "Catalog-led site system",
    cover: image.works.elk,
    detailImages: [image.works.elk, image.style.responsive],
    blocks: projectBlocks("Elk Konsol"),
    ctaLabel: "VIEW LIVE SITE",
    ctaHref: "https://exelkonsol.github.io/elk/",
    externalUrl: "https://exelkonsol.github.io/elk/",
    closingImage: image.works.elk
  }
];

const serviceBlocks = (service: string, fit: string, outcome: string): [DetailBlock, DetailBlock, DetailBlock] => [
  {
    eyebrow: "WHAT IT SOLVES",
    body: [
      `${service} is for ${fit}.`,
      `The work is framed around ${outcome}, so the site has a clear business purpose instead of just another section list.`
    ]
  },
  {
    eyebrow: "HOW WE WORK",
    body: [
      "We start with the audience, offer, proof, and the action the page needs to earn.",
      "Then I shape the layout, responsive behavior, SEO structure, and launch details in focused loops so the final site is clear, fast, and useful."
    ]
  },
  {
    eyebrow: "WHAT YOU GET",
    body: [
      "You get a responsive, maintainable web presence with clean visuals, semantic structure, performance care, and direct support from the person designing and building it."
    ]
  }
];

export const services: Service[] = [
  {
    slug: "website-design",
    label: "WEBSITE DESIGN",
    title: "Website Design",
    compactTitle: "WEBDESIGN",
    summary: "Clean, modern, brand-aligned visuals for local businesses that need to look trustworthy fast.",
    deliverables: ["Visual direction", "Page layout", "Brand-aligned UI"],
    price: "custom quote",
    subtitle: "Clean, modern visuals shaped around your offer, audience, and brand.",
    categoryLabel: "DELIVERABLES",
    categories: ["VISUAL DESIGN", "LOCAL BUSINESS", "TRUST"],
    typeLabel: "Project Fit",
    typeValue: "Local businesses",
    cover: image.style.websiteDesign,
    visual: image.style.websiteDesign,
    detailImages: [image.style.websiteDesign, image.style.tools],
    blocks: serviceBlocks(
      "Website design",
      "local businesses that need a professional first impression online",
      "clear trust, brand alignment, and a page visitors can understand quickly"
    ),
    ctaLabel: "PLAN A WEBSITE",
    ctaHref: contactHref,
    closingImage: image.style.why
  },
  {
    slug: "ui-ux",
    label: "UI/UX DESIGN",
    title: "UI UX Design",
    compactTitle: "UIUXDESIGN",
    summary: "Intuitive layouts, user-flow optimization, and mobile-first experiences with one obvious next step.",
    deliverables: ["User flow", "Mobile-first layouts", "Responsive UI"],
    price: "custom quote",
    subtitle: "Clear interfaces for websites that need to explain, guide, and convert.",
    categoryLabel: "DELIVERABLES",
    categories: ["UX", "INTERFACE", "MOBILE FIRST"],
    typeLabel: "Project Fit",
    typeValue: "Service websites",
    cover: image.style.uiux,
    visual: image.style.uiux,
    detailImages: [image.style.uiux, image.style.responsive],
    blocks: serviceBlocks(
      "UI/UX design",
      "businesses, startups, and service teams with pages that need better flow",
      "less friction, better scanning, and a smoother path from interest to contact"
    ),
    ctaLabel: "DESIGN THE FLOW",
    ctaHref: contactHref,
    closingImage: image.style.faq
  },
  {
    slug: "seo-optimization",
    label: "SEO OPTIMIZATION",
    title: "SEO Optimization",
    compactTitle: "SEOOPTIMIZATION",
    summary: "On-page SEO, semantic HTML, Core Web Vitals, and fast load times so your site can be found and used.",
    deliverables: ["On-page SEO", "Semantic HTML", "Core Web Vitals"],
    price: "custom quote",
    subtitle: "SEO that helps your site get found on Google and feel fast once visitors arrive.",
    categoryLabel: "DELIVERABLES",
    categories: ["ON-PAGE SEO", "PERFORMANCE", "SEARCH"],
    typeLabel: "Project Fit",
    typeValue: "Local search",
    cover: image.style.seo,
    visual: image.style.seo,
    detailImages: [image.style.seo, image.style.blogSeo],
    blocks: serviceBlocks(
      "SEO optimization",
      "local businesses that rely on search visibility, fast pages, and clear service content",
      "stronger technical foundations, cleaner metadata, and pages search engines can read"
    ),
    ctaLabel: "IMPROVE SEO",
    ctaHref: contactHref,
    closingImage: image.style.performance
  },
  {
    slug: "landing-pages",
    label: "LANDING PAGES",
    title: "Landing Pages",
    compactTitle: "LANDINGPAGES",
    summary: "High-conversion single-page sites for campaigns, services, products, and focused offers.",
    deliverables: ["Offer structure", "Single-page build", "Conversion CTA"],
    price: "custom quote",
    subtitle: "Focused one-page websites built around one offer and one clear action.",
    categoryLabel: "DELIVERABLES",
    categories: ["CAMPAIGN", "CONVERSION", "LAUNCH"],
    typeLabel: "Project Fit",
    typeValue: "Campaigns",
    cover: image.style.landingPage,
    visual: image.style.landingPage,
    detailImages: [image.style.landingPage, image.style.blogLanding],
    blocks: serviceBlocks(
      "Landing pages",
      "local campaigns, product launches, and service offers that need a focused page",
      "one sharp message, one conversion path, and a fast route from visitor attention to enquiry"
    ),
    ctaLabel: "BUILD A LANDING PAGE",
    ctaHref: contactHref,
    closingImage: image.style.uiux
  },
  {
    slug: "performance-optimization",
    label: "PERFORMANCE",
    title: "Performance Optimization",
    compactTitle: "PERFORMANCE",
    summary: "Audits and speed improvements focused on Lighthouse scores, loading behavior, and smoother browsing.",
    deliverables: ["Audit", "Speed fixes", "Lighthouse review"],
    price: "custom quote",
    subtitle: "Speed and performance care for websites that need to feel lighter and load faster.",
    categoryLabel: "DELIVERABLES",
    categories: ["AUDITS", "SPEED", "LIGHTHOUSE"],
    typeLabel: "Project Fit",
    typeValue: "Existing websites",
    cover: image.style.performance,
    visual: image.style.performance,
    detailImages: [image.style.performance, image.style.seo],
    blocks: serviceBlocks(
      "Performance optimization",
      "existing websites that feel slow, heavy, or unstable across devices",
      "faster loading, better Lighthouse signals, and fewer technical distractions for visitors"
    ),
    ctaLabel: "AUDIT PERFORMANCE",
    ctaHref: contactHref,
    closingImage: image.style.tools
  },
  {
    slug: "responsive-design",
    label: "RESPONSIVE DESIGN",
    title: "Responsive Design",
    compactTitle: "RESPONSIVEDESIGN",
    summary: "Pixel-careful layouts that hold up across mobile, tablet, desktop, and modern browsers.",
    deliverables: ["Breakpoint polish", "Browser checks", "Responsive QA"],
    price: "custom quote",
    subtitle: "Responsive web design that keeps the experience polished across devices and browsers.",
    categoryLabel: "DELIVERABLES",
    categories: ["MOBILE", "BROWSERS", "QA"],
    typeLabel: "Project Fit",
    typeValue: "All launches",
    cover: image.style.responsive,
    visual: image.style.responsive,
    detailImages: [image.style.responsive, image.style.uiux],
    blocks: serviceBlocks(
      "Responsive design",
      "businesses that need the site to look professional on phones, tablets, laptops, and large screens",
      "layouts that stay readable, usable, and visually consistent wherever people open them"
    ),
    ctaLabel: "FIX RESPONSIVE DESIGN",
    ctaHref: contactHref,
    closingImage: image.style.responsive
  }
];

const blogBlocks = (topic: string): [DetailBlock, DetailBlock, DetailBlock] => [
  {
    eyebrow: "FRAME",
    body: [
      `${topic} is a practical note for teams who want their site to feel clear before it feels clever.`,
      "The strongest sites usually come from fewer decisions made with more discipline."
    ]
  },
  {
    eyebrow: "DETAILS",
    body: [
      "The article breaks the idea into page structure, interface behavior, and the parts that affect conversion.",
      "It is written from the builder side: what I look for, what I remove, and what I test before launch."
    ]
  },
  {
    eyebrow: "TAKEAWAY",
    body: [
      "Good web design is not a style layer. It is the visible edge of a business decision made clearly."
    ]
  }
];

export const blogs: BlogPost[] = [
  {
    slug: "ux-mistakes",
    title: "UX Mistakes",
    compactTitle: "UXMISTAKES",
    subtitle: "Small interface decisions that quietly cost trust.",
    date: "2026-04-12",
    readTime: "6 min",
    categoryLabel: "TOPICS",
    categories: ["UX", "CONVERSION", "CLARITY"],
    typeLabel: "Blog Author",
    typeValue: "Stoyan Tanev",
    cover: image.style.blogUx,
    detailImages: [image.style.blogUx, image.style.uiux],
    blocks: blogBlocks("UX mistakes"),
    ctaLabel: "FIX THE FLOW",
    ctaHref: contactHref,
    closingImage: image.style.faq
  },
  {
    slug: "user-flow",
    title: "User Flow",
    compactTitle: "USERFLOW",
    subtitle: "How to make the next step obvious without making the page loud.",
    date: "2026-03-28",
    readTime: "5 min",
    categoryLabel: "TOPICS",
    categories: ["IA", "COPY", "ACTION"],
    typeLabel: "Blog Author",
    typeValue: "Stoyan Tanev",
    cover: image.style.uiux,
    detailImages: [image.style.uiux, image.style.websiteDesign],
    blocks: blogBlocks("User flow"),
    ctaLabel: "MAP A FLOW",
    ctaHref: contactHref,
    closingImage: image.style.responsive
  },
  {
    slug: "seo-basics",
    title: "SEO Basics",
    compactTitle: "SEOBASICS",
    subtitle: "The page details that help local businesses show up and load fast.",
    date: "2026-03-04",
    readTime: "7 min",
    categoryLabel: "TOPICS",
    categories: ["SEO", "SEMANTIC HTML", "SPEED"],
    typeLabel: "Blog Author",
    typeValue: "Stoyan Tanev",
    cover: image.style.blogSeo,
    detailImages: [image.style.blogSeo, image.style.performance],
    blocks: blogBlocks("SEO basics"),
    ctaLabel: "IMPROVE SEO",
    ctaHref: contactHref,
    closingImage: image.style.seo
  },
  {
    slug: "landing-vs-multipage",
    title: "Landing vs Multi-page",
    compactTitle: "LANDINGVSMULTIPAGE",
    subtitle: "When a one-page site is enough, and when a business needs full site structure.",
    date: "2026-02-18",
    readTime: "4 min",
    categoryLabel: "TOPICS",
    categories: ["LANDING PAGE", "BUSINESS SITE", "STRATEGY"],
    typeLabel: "Blog Author",
    typeValue: "Stoyan Tanev",
    cover: image.style.blogLanding,
    detailImages: [image.style.landingPage, image.style.businessWebsite],
    blocks: blogBlocks("Landing page vs multi-page"),
    ctaLabel: "CHOOSE THE RIGHT SITE",
    ctaHref: contactHref,
    closingImage: image.style.blogLanding
  },
  {
    slug: "logo-basics",
    title: "Logo Basics",
    compactTitle: "LOGOBASICS",
    subtitle: "A useful mark should survive the browser tab.",
    date: "2026-01-30",
    readTime: "5 min",
    categoryLabel: "TOPICS",
    categories: ["BRAND", "IDENTITY", "SYSTEM"],
    typeLabel: "Blog Author",
    typeValue: "Stoyan Tanev",
    cover: image.style.websiteDesign,
    detailImages: [image.style.websiteDesign, image.style.businessWebsite],
    blocks: blogBlocks("Logo basics"),
    ctaLabel: "SHARPEN A BRAND",
    ctaHref: contactHref,
    closingImage: image.style.tools
  },
  {
    slug: "clean-layout",
    title: "Clean Layout",
    compactTitle: "CLEANLAYOUT",
    subtitle: "Spacing is not decoration. It is hierarchy.",
    date: "2025-12-10",
    readTime: "6 min",
    categoryLabel: "TOPICS",
    categories: ["LAYOUT", "TYPE", "GRID"],
    typeLabel: "Blog Author",
    typeValue: "Stoyan Tanev",
    cover: image.style.responsive,
    detailImages: [image.style.responsive, image.style.performance],
    blocks: blogBlocks("Clean layout"),
    ctaLabel: "REDESIGN A PAGE",
    ctaHref: contactHref,
    closingImage: image.style.websiteDesign
  },
  {
    slug: "grid-play",
    title: "Grid Play",
    compactTitle: "GRIDPLAY",
    subtitle: "How to make strict layouts feel less stiff.",
    date: "2025-11-22",
    readTime: "4 min",
    categoryLabel: "TOPICS",
    categories: ["GRID", "MOTION", "EDITORIAL"],
    typeLabel: "Blog Author",
    typeValue: "Stoyan Tanev",
    cover: image.style.tools,
    detailImages: [image.style.tools, image.style.uiux],
    blocks: blogBlocks("Grid play"),
    ctaLabel: "EXPLORE A GRID",
    ctaHref: contactHref,
    closingImage: image.style.blogUx
  }
];

export const faqs = [
  {
    q: "How soon can a website start?",
    a: "Most focused projects can begin within one to two weeks, depending on content readiness and scope."
  },
  {
    q: "Do you only work with Bulgarian businesses?",
    a: "No. I am based in Plovdiv and work with teams in Bulgaria, Europe, and remote-first markets."
  },
  {
    q: "Can you redesign an existing website?",
    a: "Yes. A redesign usually starts with a quick audit so we keep what already works and replace what slows people down."
  },
  {
    q: "Do you handle copy and SEO basics?",
    a: "Yes. I can shape on-page copy, metadata, semantic headings, internal structure, and launch essentials for search visibility."
  },
  {
    q: "Do you build landing pages and multi-page sites?",
    a: "Yes. A focused offer usually fits a single landing page, while restaurants, medical services, parks, cooperatives, and service businesses often need a multi-page structure."
  },
  {
    q: "What happens after launch?",
    a: "I offer support for fixes, analytics, new sections, performance checks, and careful iteration after the site is live."
  }
];

export const testimonials = [
  {
    quote: "WEBSITE DESIGN FOR LOCAL BUSINESSES THAT NEED A CLEAR, TRUSTWORTHY FIRST IMPRESSION.",
    name: "Service Focus",
    role: "Website design",
    avatar: image.style.websiteDesign
  },
  {
    quote: "UI/UX THAT MAKES THE NEXT STEP OBVIOUS ON MOBILE, TABLET, AND DESKTOP.",
    name: "Service Focus",
    role: "UI/UX design",
    avatar: image.style.uiux
  },
  {
    quote: "SEO FOUNDATIONS BUILT INTO THE PAGE STRUCTURE INSTEAD OF ADDED AS AN AFTERTHOUGHT.",
    name: "Service Focus",
    role: "SEO optimization",
    avatar: image.style.seo
  },
  {
    quote: "LANDING PAGES AND BUSINESS WEBSITES SHAPED AROUND ONE CLEAN CONVERSION PATH.",
    name: "Service Focus",
    role: "Conversion pages",
    avatar: image.style.landingPage
  },
  {
    quote: "PERFORMANCE, ACCESSIBILITY, AND RESPONSIVE QA INCLUDED BEFORE LAUNCH.",
    name: "Service Focus",
    role: "Technical polish",
    avatar: image.style.responsive
  }
];

export const awards = [
  ["SERVICE", "Website Design", "Brand-aligned visuals", image.style.websiteDesign],
  ["SERVICE", "UI/UX Design", "Mobile-first user flows", image.style.uiux],
  ["SERVICE", "SEO Optimization", "Semantic pages and speed", image.style.seo],
  ["SERVICE", "Landing Pages", "Focused single-page campaigns", image.style.landingPage],
  ["SERVICE", "Business Websites", "Multi-page local business sites", image.style.businessWebsite]
] as const;

export const education = [
  {
    era: "2018 - 2020",
    items: [
      ["Front-end Foundations", "HTML5, CSS3, JavaScript"],
      ["Visual Design Practice", "Clean, brand-aligned web layouts"]
    ]
  },
  {
    era: "2021 - 2024",
    items: [
      ["Freelance Web Design", "Small business websites"],
      ["UI/UX and Responsive Design", "Mobile-first layouts and user flows"],
      ["SEO and Content Structure", "Local service pages"]
    ]
  },
  {
    era: "2025 - NOW",
    items: [
      ["Tanev Design", "Independent studio practice"],
      ["React and Vite Builds", "Custom front-end websites"],
      ["Performance and Launch Support", "Core Web Vitals, analytics, and iteration"]
    ]
  }
];

export const pricing = [
  {
    name: "LANDING PAGE",
    monthly: 0,
    description: "A focused single-page site for a campaign, product, or service offer.",
    features: ["Offer structure", "One-page design", "Responsive build", "SEO basics"]
  },
  {
    name: "BUSINESS WEBSITE",
    monthly: 0,
    description: "A multi-page website for local businesses with clear service structure.",
    features: [
      "UX structure",
      "Custom visual system",
      "Multi-page build",
      "Responsive design",
      "SEO-ready sections",
      "Analytics setup"
    ],
    recommended: true
  },
  {
    name: "OPTIMIZATION",
    monthly: 0,
    description: "A focused audit and improvement pass for an existing website.",
    features: [
      "Performance audit",
      "Core Web Vitals",
      "Responsive QA",
      "Accessibility pass",
      "Technical SEO",
      "Search Console setup",
      "Launch support"
    ]
  }
];

export const clientLogos = ["SIANA", "SPEEDLINK", "NUSI CLIMA", "WONDERPLAY", "ELK"];

export const secondaryCarousel = [
  [image.style.websiteDesign, "WEBSITE DESIGN"],
  [image.style.uiux, "UI/UX FLOWS"],
  [image.style.seo, "SEO STRUCTURE"],
  [image.style.responsive, "RESPONSIVE BUILDS"]
] as const;
