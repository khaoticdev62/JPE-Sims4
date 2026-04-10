/* JPE STUDIO — DESIGN TOKENS (Complete Reference) */
export const T = {
  // Background colors
  bg: "#0a0c10",
  bgDeep: "#070810",
  bgPanel: "#0f1116",
  bgSurface: "#13151c",
  bgElevated: "#181b24",
  bgHover: "#1b1f2a",
  bgActive: "#1f2330",
  bgGlass: "rgba(15,17,22,0.88)",
  bgGlassHover: "rgba(22,25,34,0.92)",
  bgInput: "#0d0f15",
  bgApp: "#0a0c10",

  // Border colors
  border: "rgba(255,255,255,0.06)",
  borderSubtle: "rgba(255,255,255,0.03)",
  borderActive: "rgba(99,179,237,0.4)",
  borderViolet: "rgba(139,92,246,0.35)",
  borderGlow: "rgba(99,179,237,0.2)",

  // Accent colors
  cyan: "#63B3ED",
  cyanBright: "#90CDF4",
  cyanDim: "rgba(99,179,237,0.12)",
  cyanDeep: "#4299E1",
  violet: "#8B5CF6",
  violetBright: "#A78BFA",
  violetDim: "rgba(139,92,246,0.12)",
  violetDeep: "#7C3AED",

  // Semantic colors
  emerald: "#48BB78",
  emeraldDim: "rgba(72,187,120,0.12)",
  rose: "#FC8181",
  roseDim: "rgba(252,129,129,0.10)",
  amber: "#F6AD55",
  amberDim: "rgba(246,173,85,0.10)",
  blue: "#63B3ED",

  // Text colors
  textPrimary: "#E2E8F0",
  textSecondary: "#A0AEC0",
  textTertiary: "#718096",
  textMuted: "#4A5568",
  textDim: "#2D3748",

  // Typography
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  sans: "'Inter', system-ui, sans-serif",
  display: "'Outfit', 'Inter', system-ui, sans-serif",

  // Font sizes
  textXxs: "7px",
  textXs: "9px",
  textSm: "10px",
  textBase: "11px",
  textMd: "12px",
  textLg: "13px",
  textXl: "14px",
  text2Xl: "16px",
  text3Xl: "18px",
  text4Xl: "24px",

  // Font weights
  fontLight: 300,
  fontRegular: 400,
  fontMedium: 500,
  fontSemibold: 600,
  fontBold: 700,
  fontExtrabold: 800,
  fontBlack: 900,

  // Letter spacing
  trackingTight: "0.02em",
  trackingWide: "0.14em",
  trackingWider: "0.2em",

  // Spacing (2px base unit)
  space1: 2,
  space2: 4,
  space3: 6,
  space4: 8,
  space5: 10,
  space6: 12,
  space8: 16,
  space10: 20,
  space12: 24,
  space14: 28,
  space16: 32,
  space20: 40,
  space24: 48,

  // UI Element Heights
  heightXs: 24,
  heightSm: 28,
  heightMd: 32,
  heightLg: 38,
  heightXl: 40,
  height2Xl: 48,

  // Panel Widths
  panelXs: 192,
  panelSm: 220,
  panelMd: 256,
  panelLg: 280,
  panelXl: 320,

  // Border radius
  radiusNone: 0,
  radiusXs: 2,
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 10,
  radiusXl: 12,
  radius2Xl: 16,
  radiusFull: 9999,

  // Z-Index Scale
  zBase: 0,
  zDock: 10,
  zDropdown: 100,
  zSticky: 200,
  zOverlay: 500,
  zModal: 1000,
  zToast: 2000,
  zMax: 9999,

  // Shadows
  shadowSm: "0 2px 8px rgba(0,0,0,0.3)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.4)",
  shadowLg: "0 8px 32px rgba(0,0,0,0.5)",
  shadowXl: "0 16px 48px rgba(0,0,0,0.6)",
  shadow2Xl: "0 40px 80px rgba(0,0,0,0.7)",
  shadowGlowCyan: "0 0 12px rgba(99,179,237,0.15)",
  shadowGlowViolet: "0 0 12px rgba(139,92,246,0.15)",
  shadowGlowCyanIntense: "0 0 20px rgba(99,179,237,0.25)",

  // Transitions
  transitionFast: "0.1s ease",
  transitionBase: "0.2s ease",
  transitionSlow: "0.3s ease",
  transitionSlower: "0.5s ease",

  // Effects
  glassBlur: "blur(24px)",
  glowCyan: "0 0 20px rgba(99,179,237,0.15)",
  glowViolet: "0 0 20px rgba(139,92,246,0.15)",

  // Textures
  noiseSvg: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`,
};

export type WorkspaceMode = "dashboard" | "code" | "translation" | "jpe" | "depgraph" | "conflicts" | "build" | "library" | "plugin" | "debug" | "datavis" | "ai" | "settings" | "vault" | "diff" | "playground" | "visual" | "manual" | "rebels";