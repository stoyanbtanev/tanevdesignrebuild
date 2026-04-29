import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--ink-dim)",
        accent: "var(--accent)"
      },
      fontFamily: {
        body: ["var(--font-body)"],
        display: ["var(--font-display)"]
      },
      keyframes: {
        "ui-marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" }
        },
        "ui-marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" }
        }
      },
      animation: {
        marquee: "ui-marquee var(--duration) infinite linear",
        "marquee-vertical": "ui-marquee-vertical var(--duration) linear infinite"
      },
      maxWidth: {
        page: "var(--max-w)"
      }
    }
  },
  plugins: []
};

export default config;
