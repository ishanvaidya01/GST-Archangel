import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Dark command-center surfaces (always dark) ───────────────
        bg: {
          base: "#09090f",
          surface: "#0f1017",
          elevated: "#141520",
          overlay: "#1a1b2e",
        },
        border: {
          DEFAULT: "#1e2130",
          strong: "#2d3250",
          subtle: "#161825",
        },
        text: {
          primary: "#e8eaf6",
          secondary: "#9ba3bf",
          muted: "#5a6380",
          disabled: "#383d52",
        },
        accent: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          muted: "#1d3a6e",
          subtle: "#0f1f40",
        },
        // ─── Risk colors — COMPLIANCE SEMANTICS ONLY ─────────────────
        risk: {
          low: "#22c55e",
          "low-muted": "#14532d",
          "low-subtle": "#052e16",
          medium: "#f59e0b",
          "medium-muted": "#78350f",
          "medium-subtle": "#431a01",
          high: "#ef4444",
          "high-muted": "#7f1d1d",
          "high-subtle": "#3f0d0d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(30,33,48,0.8)",
        "glow-blue": "0 0 24px rgba(59,130,246,0.15)",
        "glow-risk-high": "0 0 24px rgba(239,68,68,0.15)",
        "glow-risk-low": "0 0 24px rgba(34,197,94,0.12)",
        "glow-indigo": "0 0 40px rgba(79,70,229,0.12), 0 0 80px rgba(79,70,229,0.06)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "floatY 4s ease-in-out infinite",
        "spin-slow": "spinSlow 8s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
