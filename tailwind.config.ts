import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  variants: {
    extend: {
      backgroundColor: ['high-contrast'],
      textColor: ['high-contrast'],
      borderColor: ['high-contrast'],
    },
  },
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Spectral Brand Remap (Eliminates Aesthetic Drift)
        slate: {
          950: "#070810", // bgDeep
          900: "#0a0c10", // bg
          800: "#0f1116", // bgPanel
          700: "#181b24", // bgElevated
        },
        // shadcn/ui compatibility
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        // JPE Studio Cyberpunk Theme — direct CSS var access
        bg: "var(--jpe-bg)",
        bgDeep: "var(--jpe-bg-deep)",
        "bg-deep": "var(--jpe-jpe-bg-deep)", // Supporting both for backward/forward compatibility
        "bg-panel": "var(--jpe-bg-panel)",
        bgPanel: "var(--jpe-bg-panel)",
        "bg-surface": "var(--jpe-bg-surface)",
        bgSurface: "var(--jpe-bg-surface)",
        "bg-elevated": "var(--jpe-bg-elevated)",
        bgElevated: "var(--jpe-bg-elevated)",
        "bg-hover": "var(--jpe-bg-hover)",
        bgHover: "var(--jpe-bg-hover)",
        "bg-active": "var(--jpe-bg-active)",
        bgActive: "var(--jpe-bg-active)",
        "bg-input": "var(--jpe-bg-input)",
        bgInput: "var(--jpe-bg-input)",
        "background-secondary": "var(--jpe-bg-surface)",
        "background-tertiary": "var(--jpe-bg-elevated)",
        "background-app": "var(--jpe-bg)",
        "background-panel": "var(--jpe-bg-panel)",

        cyan: {
          DEFAULT: "var(--jpe-cyan)",
          bright: "var(--jpe-cyan-bright)",
          dim: "var(--jpe-cyan-dim)",
          deep: "var(--jpe-cyan-deep)",
        },
        cyanBright: "var(--jpe-cyan-bright)",
        cyanDim: "var(--jpe-cyan-dim)",
        cyanDeep: "var(--jpe-cyan-deep)",

        violet: {
          DEFAULT: "var(--jpe-violet)",
          bright: "var(--jpe-violet-bright)",
          dim: "var(--jpe-violet-dim)",
          deep: "var(--jpe-violet-deep)",
        },
        violetBright: "var(--jpe-violet-bright)",
        violetDim: "var(--jpe-violet-dim)",
        violetDeep: "var(--jpe-violet-deep)",

        emerald: {
          DEFAULT: "var(--jpe-emerald)",
          dim: "var(--jpe-emerald-dim)",
        },
        emeraldDim: "var(--jpe-emerald-dim)",

        rose: {
          DEFAULT: "var(--jpe-rose)",
          dim: "var(--jpe-rose-dim)",
        },
        roseDim: "var(--jpe-rose-dim)",

        amber: {
          DEFAULT: "var(--jpe-amber)",
          dim: "var(--jpe-amber-dim)",
        },
        amberDim: "var(--jpe-amber-dim)",

        text: {
          primary: "var(--jpe-text-primary)",
          secondary: "var(--jpe-text-secondary)",
          tertiary: "var(--jpe-text-tertiary)",
          muted: "var(--jpe-text-muted)",
          dim: "var(--jpe-text-dim)",
        },
        textPrimary: "var(--jpe-text-primary)",
        textSecondary: "var(--jpe-text-secondary)",
        textTertiary: "var(--jpe-text-tertiary)",
        textMuted: "var(--jpe-text-muted)",
        textDim: "var(--jpe-text-dim)",

        border: {
          DEFAULT: "var(--jpe-border)",
          subtle: "var(--jpe-border-subtle)",
          active: "var(--jpe-border-active)",
          violet: "var(--jpe-border-violet)",
          glow: "var(--jpe-border-glow)",
        },
        borderSubtle: "var(--jpe-border-subtle)",
        borderActive: "var(--jpe-border-active)",
        borderViolet: "var(--jpe-border-violet)",
        borderGlow: "var(--jpe-border-glow)",

        // Legacy JPE tokens
        "jpe-bg": "var(--jpe-bg)",
        "jpe-surface": "var(--jpe-bg-panel)",
        "jpe-border": "var(--jpe-border)",
        "jpe-text": "var(--jpe-text-primary)",
        "jpe-muted": "var(--jpe-text-secondary)",
        "jpe-primary": "var(--jpe-cyan)",
        "jpe-accent-focus": "var(--jpe-cyan)",
        "jpe-secondary": "var(--jpe-violet)",
      },
      borderRadius: {
        sm: "var(--radius-sm, 6px)",
        md: "var(--radius-md, 8px)",
        lg: "var(--radius-lg, 10px)",
        xl: "var(--radius-xl, 12px)",
        "2xl": "var(--radius-2xl, 16px)",
        full: "var(--radius-full, 9999px)",
      },
      boxShadow: {
        "glow-cyan": "var(--shadow-glow-cyan)",
        "glow-violet": "var(--shadow-glow-violet)",
        "glow-cyan-intense": "var(--shadow-glow-cyan-intense)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "skeleton-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-opacity": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "skeleton-shimmer": "skeleton-shimmer 1.5s infinite",
        "pulse-opacity": "pulse-opacity 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      transitionDuration: {
        fast: "100ms",
        base: "200ms",
        slow: "300ms",
        slower: "500ms",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        display: ["var(--font-display)"],
      },
      fontSize: {
        xs: "var(--text-xs, 9px)",
        sm: "var(--text-sm, 10px)",
        base: "var(--text-base, 11px)",
        md: "var(--text-md, 12px)",
        lg: "var(--text-lg, 13px)",
        xl: "var(--text-xl, 14px)",
        "2xl": "var(--text-2xl, 16px)",
      },
      letterSpacing: {
        tight: "var(--tracking-tight, 0.02em)",
        wide: "var(--tracking-wide, 0.14em)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
