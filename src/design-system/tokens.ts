/**
 * JPE Studio Design Tokens
 * Cyberpunk theme — exact values from Figma spec
 */

export const tokens = {
  colors: {
    // Background layers
    bg: "#0a0c10",
    "bg-deep": "#070810",
    "bg-panel": "#0f1116",
    "bg-surface": "#13151c",
    "bg-elevated": "#181b24",
    "bg-hover": "#1b1f2a",
    "bg-active": "#1f2330",
    "bg-input": "#0d0f15",
    "bg-glass": "rgba(15,17,22,0.88)",
    "bg-glass-hover": "rgba(22,25,34,0.92)",

    // Accent colors
    cyan: "#63B3ED",
    "cyan-bright": "#90CDF4",
    "cyan-dim": "rgba(99,179,237,0.12)",
    "cyan-deep": "#4299E1",
    violet: "#8B5CF6",
    "violet-bright": "#A78BFA",
    "violet-dim": "rgba(139,92,246,0.12)",
    "violet-deep": "#7C3AED",

    // Semantic/status colors
    emerald: "#48BB78",
    "emerald-dim": "rgba(72,187,120,0.12)",
    rose: "#FC8181",
    "rose-dim": "rgba(252,129,129,0.10)",
    amber: "#F6AD55",
    "amber-dim": "rgba(246,173,85,0.10)",

    // Border colors
    border: "rgba(255,255,255,0.06)",
    "border-subtle": "rgba(255,255,255,0.03)",
    "border-active": "rgba(99,179,237,0.4)",
    "border-violet": "rgba(139,92,246,0.35)",
    "border-glow": "rgba(99,179,237,0.2)",

    // Text colors
    "text-primary": "#E2E8F0",
    "text-secondary": "#A0AEC0",
    "text-tertiary": "#718096",
    "text-muted": "#4A5568",
    "text-dim": "#2D3748",
  },

  typography: {
    fontFamily: {
      sans: "'Inter', system-ui, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
      display: "'Outfit', 'Inter', system-ui, sans-serif",
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    fontSize: {
      xs: "9px",
      sm: "10px",
      base: "11px",
      md: "12px",
      lg: "13px",
      xl: "14px",
      "2xl": "16px",
    },
    letterSpacing: {
      tight: "0.02em",
      wide: "0.14em",
    },
  },

  spacing: {
    1: "2px",
    2: "4px",
    3: "6px",
    4: "8px",
    5: "10px",
    6: "12px",
    8: "16px",
    10: "20px",
    12: "24px",
    14: "28px",
    16: "32px",
  },

  borderRadius: {
    sm: "6px",
    md: "8px",
    lg: "10px",
    xl: "12px",
    "2xl": "16px",
    full: "9999px",
  },

  shadows: {
    sm: "0 2px 8px rgba(0,0,0,0.3)",
    md: "0 4px 16px rgba(0,0,0,0.4)",
    lg: "0 8px 32px rgba(0,0,0,0.5)",
    xl: "0 16px 48px rgba(0,0,0,0.6)",
    "2xl": "0 40px 80px rgba(0,0,0,0.7)",
    "glow-cyan": "0 0 12px rgba(99,179,237,0.15)",
    "glow-violet": "0 0 12px rgba(139,92,246,0.15)",
    "glow-cyan-intense": "0 0 20px rgba(99,179,237,0.25)",
  },

  transitions: {
    fast: "0.1s ease",
    base: "0.2s ease",
    slow: "0.3s ease",
    slower: "0.5s ease",
  },

  effects: {
    glassBlur: "blur(24px)",
    glowCyan: "0 0 20px rgba(99,179,237,0.15)",
    glowViolet: "0 0 20px rgba(139,92,246,0.15)",
  },
} as const;

export type DesignTokens = typeof tokens;
export default tokens;

/**
 * Figma-compatible flat export with exact token names
 * Matches the T object from the original Figma export
 */
export const T = {
  // Background colors
  bg: tokens.colors.bg,
  bgDeep: tokens.colors["bg-deep"],
  bgPanel: tokens.colors["bg-panel"],
  bgSurface: tokens.colors["bg-surface"],
  bgElevated: tokens.colors["bg-elevated"],
  bgHover: tokens.colors["bg-hover"],
  bgActive: tokens.colors["bg-active"],
  bgInput: tokens.colors["bg-input"],
  bgGlass: tokens.colors["bg-glass"],
  bgGlassHover: tokens.colors["bg-glass-hover"],

  // Accent colors
  cyan: tokens.colors.cyan,
  cyanBright: tokens.colors["cyan-bright"],
  cyanDim: tokens.colors["cyan-dim"],
  cyanDeep: tokens.colors["cyan-deep"],
  violet: tokens.colors.violet,
  violetBright: tokens.colors["violet-bright"],
  violetDim: tokens.colors["violet-dim"],
  violetDeep: tokens.colors["violet-deep"],

  // Semantic colors
  emerald: tokens.colors.emerald,
  emeraldDim: tokens.colors["emerald-dim"],
  rose: tokens.colors.rose,
  roseDim: tokens.colors["rose-dim"],
  amber: tokens.colors.amber,
  amberDim: tokens.colors["amber-dim"],
  blue: tokens.colors.cyan,

  // Text colors
  textPrimary: tokens.colors["text-primary"],
  textSecondary: tokens.colors["text-secondary"],
  textTertiary: tokens.colors["text-tertiary"],
  textMuted: tokens.colors["text-muted"],
  textDim: tokens.colors["text-dim"],

  // Border colors
  border: tokens.colors.border,
  borderSubtle: tokens.colors["border-subtle"],
  borderActive: tokens.colors["border-active"],
  borderViolet: tokens.colors["border-violet"],
  borderGlow: tokens.colors["border-glow"],

  // Typography
  sans: tokens.typography.fontFamily.sans,
  mono: tokens.typography.fontFamily.mono,
  display: tokens.typography.fontFamily.display,

  // Effects
  glassBlur: tokens.effects.glassBlur,
  glowCyan: tokens.effects.glowCyan,
  glowViolet: tokens.effects.glowViolet,
} as const;
