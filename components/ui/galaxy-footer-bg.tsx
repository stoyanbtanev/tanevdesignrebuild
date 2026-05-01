"use client";

import React, { Suspense, lazy, useEffect, useState } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

export function GalaxyFooterBg() {
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    setMounted(true);
  }, []);

  if (reduced) {
    return <div className="footer-galaxy-bg footer-galaxy-bg--static" aria-hidden="true" />;
  }

  return (
    <div className="footer-galaxy-bg" aria-hidden="true">
      <div className="footer-galaxy-bg__scene">
        {mounted && (
          <Suspense fallback={null}>
            <Spline
              style={{ width: "100%", height: "100%", pointerEvents: "auto" }}
              scene="https://prod.spline.design/us3ALejTXl6usHZ7/scene.splinecode"
            />
          </Suspense>
        )}
      </div>
      <div className="footer-galaxy-bg__overlay" />
    </div>
  );
}
