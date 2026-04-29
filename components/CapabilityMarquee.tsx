import { Badge } from "@/components/ui/badge";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";

const rows = [
  [
    { name: "Website design", className: "border-[#401513] bg-[#160504] text-[#ffb3ad]" },
    { name: "UI/UX design", className: "border-[#123638] bg-[#041315] text-[#a7f4f1]" },
    { name: "SEO optimization", className: "border-[#334017] bg-[#101604] text-[#d8f07a]" },
    { name: "Landing pages", className: "border-[#2a2e48] bg-[#090b18] text-[#b7c4ff]" },
    { name: "Business websites", className: "border-[#373737] bg-[#101010] text-[#f4f0e7]" }
  ],
  [
    { name: "React", className: "border-[#153341] bg-[#07141a] text-[#8edcff]" },
    { name: "Next.js", className: "border-[#303030] bg-[#050505] text-[#f8f8f3]" },
    { name: "TypeScript", className: "border-[#17305d] bg-[#071126] text-[#9dbdff]" },
    { name: "Tailwind CSS", className: "border-[#12373a] bg-[#041617] text-[#8cf0ed]" },
    { name: "Framer Motion", className: "border-[#3a1730] bg-[#160612] text-[#f3a3d8]" },
    { name: "GSAP", className: "border-[#2f4015] bg-[#0d1504] text-[#bef06a]" }
  ],
  [
    { name: "Responsive design", className: "border-[#2b3347] bg-[#080d18] text-[#b7cdfd]" },
    { name: "Performance", className: "border-[#452810] bg-[#170c03] text-[#ffc078]" },
    { name: "Accessibility", className: "border-[#223a2e] bg-[#07150e] text-[#9ae6b4]" },
    { name: "Analytics setup", className: "border-[#3a263e] bg-[#120714] text-[#e0acf5]" },
    { name: "Fast deployment", className: "border-[#3d1612] bg-[#170604] text-[#ff9f98]" }
  ],
  [
    { name: "shadcn/ui", className: "border-[#332240] bg-[#110817] text-[#d9b4ff]" },
    { name: "Radix UI", className: "border-[#263e34] bg-[#07150f] text-[#a8f0c6]" },
    { name: "Lucide Icons", className: "border-[#45310f] bg-[#170f03] text-[#ffd166]" },
    { name: "Vercel", className: "border-[#343434] bg-[#070707] text-[#f8f8f3]" },
    { name: "Netlify", className: "border-[#123c42] bg-[#041416] text-[#8cecf2]" },
    { name: "Cloudflare", className: "border-[#47220c] bg-[#180a02] text-[#ffad73]" }
  ]
] as const;

const badgeClassName =
  "h-10 shrink-0 !rounded-md border px-4 py-2 font-mono text-[11px] font-black uppercase tracking-[0.12em] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_36px_rgba(0,0,0,0.22)]";

export function CapabilityMarquee() {
  return (
    <section className="elite-marquee" aria-label="Core capabilities and technologies">
      {rows.map((row, rowIndex) => (
        <Marquee
          key={rowIndex}
          className="elite-marquee__row"
          pauseOnHover
          repeat={4}
          reverse={rowIndex % 2 === 1}
          speed={rowIndex === 0 ? "slow" : rowIndex === rows.length - 1 ? "fast" : "normal"}
        >
          {row.map((item) => (
            <Badge key={item.name} variant="outline" className={cn(badgeClassName, item.className)}>
              {item.name}
            </Badge>
          ))}
        </Marquee>
      ))}
    </section>
  );
}
