import type { Metadata, Viewport } from "next";
import { Inter, DM_Mono, Space_Grotesk } from "next/font/google";
import "@/app/globals.css";
import { ClientProviders } from "@/components/ClientProviders";
import { FloatingNav } from "@/components/FloatingNav";
import { Footer } from "@/components/Footer";
import { site } from "@/data/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  axes: ["opsz"]
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-dm-mono"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-visual",
  themeColor: "#050607"
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" }
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  title: {
    default: "Independent Web Designer in Plovdiv, Bulgaria — Tanev Design",
    template: "%s — Tanev Design"
  },
  description:
    "Custom website design and development for founders and small businesses across Bulgaria and the EU. One person, end-to-end. Fast, accessible, SEO-ready builds.",
  keywords: [
    "web designer Bulgaria",
    "freelance web designer Plovdiv",
    "premium web design EU",
    "Next.js developer Bulgaria",
    "small business website",
    "landing page design",
    "UI/UX designer Bulgaria",
    "Tanev Design"
  ],
  authors: [{ name: "Stoyan Tanev", url: site.url }],
  creator: "Stoyan Tanev",
  publisher: "Tanev Design",
  alternates: { canonical: site.url },
  category: "Web Design",
  formatDetection: { email: false, telephone: false, address: false },
  openGraph: {
    title: "Independent Web Designer in Plovdiv, Bulgaria — Tanev Design",
    description:
      "Custom website design and development for founders and small businesses across Bulgaria and the EU. One person, end-to-end.",
    url: site.url,
    siteName: "tanev.design",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    site: "@tanevdesign",
    creator: "@tanevdesign",
    title: "Independent Web Designer in Plovdiv, Bulgaria — Tanev Design",
    description:
      "Custom website design and development for founders and small businesses across Bulgaria and the EU."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${site.url}/#business`,
    name: "Tanev Design",
    alternateName: "tanev.design",
    description:
      "Independent web designer and developer based in Plovdiv, Bulgaria. Custom website design, UI/UX, SEO, and front-end development for founders and small businesses across the EU.",
    url: site.url,
    image: `${site.url}/assets/newherowithbackground.png?v=masked-hero-20260429`,
    priceRange: "€€",
    founder: { "@type": "Person", "@id": `${site.url}/#stoyan` },
    areaServed: ["Bulgaria", "European Union", "Worldwide"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Plovdiv",
      addressCountry: "BG"
    },
    serviceType: ["Web Design", "Web Development", "UI/UX Design", "SEO", "Landing Pages"],
    sameAs: [
      "https://www.linkedin.com/in/stoyan-tanev-a732603b8/",
      "https://x.com/tanevdesign",
      "https://github.com/stoyanbtanev"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${site.url}/#stoyan`,
    name: "Stoyan Tanev",
    jobTitle: "Independent Web Designer & Developer",
    url: site.url,
    image: `${site.url}/assets/newherowithbackground.png`,
    worksFor: { "@id": `${site.url}/#business` },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Plovdiv",
      addressCountry: "BG"
    },
    knowsAbout: [
      "Web Design",
      "Next.js",
      "React",
      "GSAP",
      "Framer Motion",
      "SEO",
      "UI/UX Design",
      "Tailwind CSS"
    ],
    sameAs: [
      "https://www.linkedin.com/in/stoyan-tanev-a732603b8/",
      "https://x.com/tanevdesign",
      "https://github.com/stoyanbtanev"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: "tanev.design",
    url: site.url,
    publisher: { "@id": `${site.url}/#business` },
    inLanguage: "en-US"
  }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body id="top">
        <div id="root">
          <ClientProviders>
            <FloatingNav />
            <main id="main-content" role="main">
              {children}
            </main>
            <Footer />
          </ClientProviders>
        </div>
      </body>
    </html>
  );
}
