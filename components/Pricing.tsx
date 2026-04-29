"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { pricing } from "@/data/site";

function formatPrice(value: number) {
  if (value === 0) return "CUSTOM QUOTE";
  return `EUR ${value.toLocaleString("en-US")}`;
}

function AnimatedPrice({ value }: { value: string }) {
  return (
    <span className="animated-price" aria-label={value}>
      {value.split("").map((char, index) => (
        <span className="price-char" key={`${char}-${index}-${value}`}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

export function Pricing() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const customOnly = pricing.every((tier) => tier.monthly === 0);
  const yearly = !customOnly && params.get("billing") === "yearly";

  const setYearly = (next: boolean) => {
    const search = new URLSearchParams(params.toString());
    if (next) search.set("billing", "yearly");
    else search.delete("billing");
    const query = search.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  };

  return (
    <div className="pricing-wrap">
      {!customOnly ? (
        <div className="billing-toggle" role="group" aria-label="Billing frequency">
          <button type="button" className={!yearly ? "is-active" : ""} onClick={() => setYearly(false)}>
            MONTHLY
          </button>
          <button type="button" className={yearly ? "is-active" : ""} onClick={() => setYearly(true)}>
            YEARLY -20%
          </button>
          <span style={{ transform: yearly ? "translateX(100%)" : "translateX(0)" }} aria-hidden="true" />
        </div>
      ) : null}

      <div className="pricing-grid">
        {pricing.map((tier) => {
          const price = yearly ? Math.round(tier.monthly * 12 * 0.8) : tier.monthly;
          return (
            <article className={`pricing-card ${tier.recommended ? "is-recommended" : ""}`} key={tier.name}>
              <div>
                <p className="eyebrow">{tier.recommended ? "RECOMMENDED" : "PACKAGE"}</p>
                <h3>{tier.name}</h3>
                <p>{tier.description}</p>
              </div>
              <strong className="price">
                <AnimatedPrice value={formatPrice(price)} />
                <small>{price === 0 ? "AFTER BRIEF" : yearly ? "/YR" : "/PROJECT"}</small>
              </strong>
              <ul>
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a className="pill" href="#contact" data-magnetic data-cursor="OPEN">
                REQUEST SLOT
              </a>
            </article>
          );
        })}
      </div>
    </div>
  );
}
