import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        paper: {
          DEFAULT: "#FAF8F4",
          deep: "#F2EDE3",
          line: "#E6DFD1",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          soft: "#3A3A3A",
          mute: "#6B6661",
        },
        accent: {
          DEFAULT: "#B8252C",
          deep: "#8E1B22",
          glow: "#E14B53",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        editorial: ["'Spectral'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      fontSize: {
        masthead: ["clamp(3.5rem, 8vw, 7rem)", { lineHeight: "0.9", letterSpacing: "-0.04em" }],
        hero: ["clamp(2.5rem, 5vw, 4.5rem)", { lineHeight: "1.02", letterSpacing: "-0.025em" }],
        deck: ["1.125rem", { lineHeight: "1.55" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        paper: "0 1px 0 0 #E6DFD1, 0 12px 28px -16px rgba(26, 26, 26, 0.18)",
        clip: "0 1px 0 0 #E6DFD1, 0 22px 40px -24px rgba(26, 26, 26, 0.25)",
      },
      keyframes: {
        "rule-grow": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "ticker": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "rule-grow": "rule-grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "ticker": "ticker 40s linear infinite",
      },
    },
  },
  plugins: [animate],
}

export default config
