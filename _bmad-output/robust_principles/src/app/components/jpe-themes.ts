/* JPE Studio — Color Theme Registry
   Six cyberpunk theme presets injected as CSS custom properties on the root element.
   Key vars: --jpe-primary / --jpe-secondary replace T.cyan / T.violet in chrome elements. */

export interface JpeColorTheme {
  id: string;
  name: string;
  description: string;
  author: string;
  swatches: [string, string, string]; // primary, secondary, accent
  vars: Record<string, string>;
}

export const jpeColorThemes: JpeColorTheme[] = [
  {
    id: "obsidian-crystal",
    name: "Obsidian Crystal",
    description: "Default — deep navy with cyan & violet",
    author: "JPE Studio",
    swatches: ["#63B3ED", "#8B5CF6", "#48BB78"],
    vars: {
      "--jpe-primary":          "#63B3ED",
      "--jpe-primary-bright":   "#90CDF4",
      "--jpe-primary-dim":      "rgba(99,179,237,0.12)",
      "--jpe-primary-glow":     "rgba(99,179,237,0.55)",
      "--jpe-secondary":        "#8B5CF6",
      "--jpe-secondary-bright": "#A78BFA",
      "--jpe-secondary-dim":    "rgba(139,92,246,0.12)",
      "--jpe-secondary-glow":   "rgba(139,92,246,0.55)",
      "--jpe-bg-root":          "#0a0c10",
      "--jpe-bg-chrome":        "#0f1116",
      "--jpe-border-active":    "rgba(99,179,237,0.4)",
      "--jpe-logo-start":       "#63B3ED",
      "--jpe-logo-end":         "#8B5CF6",
    },
  },
  {
    id: "neon-abyss",
    name: "Neon Abyss",
    description: "Oceanic depths — emerald & amber",
    author: "JPE Studio",
    swatches: ["#48BB78", "#F6AD55", "#63B3ED"],
    vars: {
      "--jpe-primary":          "#48BB78",
      "--jpe-primary-bright":   "#68D391",
      "--jpe-primary-dim":      "rgba(72,187,120,0.12)",
      "--jpe-primary-glow":     "rgba(72,187,120,0.55)",
      "--jpe-secondary":        "#F6AD55",
      "--jpe-secondary-bright": "#FAD08A",
      "--jpe-secondary-dim":    "rgba(246,173,85,0.12)",
      "--jpe-secondary-glow":   "rgba(246,173,85,0.55)",
      "--jpe-bg-root":          "#070f0a",
      "--jpe-bg-chrome":        "#0d1610",
      "--jpe-border-active":    "rgba(72,187,120,0.4)",
      "--jpe-logo-start":       "#48BB78",
      "--jpe-logo-end":         "#F6AD55",
    },
  },
  {
    id: "sakura-storm",
    name: "Sakura Storm",
    description: "Cherry blossom haze — rose & sky blue",
    author: "JPE Studio",
    swatches: ["#F687B3", "#63B3ED", "#FC8181"],
    vars: {
      "--jpe-primary":          "#F687B3",
      "--jpe-primary-bright":   "#FBB6CE",
      "--jpe-primary-dim":      "rgba(246,135,179,0.12)",
      "--jpe-primary-glow":     "rgba(246,135,179,0.55)",
      "--jpe-secondary":        "#63B3ED",
      "--jpe-secondary-bright": "#90CDF4",
      "--jpe-secondary-dim":    "rgba(99,179,237,0.12)",
      "--jpe-secondary-glow":   "rgba(99,179,237,0.55)",
      "--jpe-bg-root":          "#100a0d",
      "--jpe-bg-chrome":        "#160e12",
      "--jpe-border-active":    "rgba(246,135,179,0.4)",
      "--jpe-logo-start":       "#F687B3",
      "--jpe-logo-end":         "#63B3ED",
    },
  },
  {
    id: "plasma-grid",
    name: "Plasma Grid",
    description: "High-voltage orange & electric teal",
    author: "JPE Studio",
    swatches: ["#F6AD55", "#38B2AC", "#FC8181"],
    vars: {
      "--jpe-primary":          "#F6AD55",
      "--jpe-primary-bright":   "#FAD08A",
      "--jpe-primary-dim":      "rgba(246,173,85,0.12)",
      "--jpe-primary-glow":     "rgba(246,173,85,0.55)",
      "--jpe-secondary":        "#38B2AC",
      "--jpe-secondary-bright": "#4FD1C5",
      "--jpe-secondary-dim":    "rgba(56,178,172,0.12)",
      "--jpe-secondary-glow":   "rgba(56,178,172,0.55)",
      "--jpe-bg-root":          "#0d0a06",
      "--jpe-bg-chrome":        "#13100a",
      "--jpe-border-active":    "rgba(246,173,85,0.4)",
      "--jpe-logo-start":       "#F6AD55",
      "--jpe-logo-end":         "#38B2AC",
    },
  },
  {
    id: "void-ember",
    name: "Void Ember",
    description: "Burning void — crimson & gold",
    author: "JPE Studio",
    swatches: ["#FC8181", "#F6AD55", "#8B5CF6"],
    vars: {
      "--jpe-primary":          "#FC8181",
      "--jpe-primary-bright":   "#FEB2B2",
      "--jpe-primary-dim":      "rgba(252,129,129,0.12)",
      "--jpe-primary-glow":     "rgba(252,129,129,0.55)",
      "--jpe-secondary":        "#F6AD55",
      "--jpe-secondary-bright": "#FAD08A",
      "--jpe-secondary-dim":    "rgba(246,173,85,0.12)",
      "--jpe-secondary-glow":   "rgba(246,173,85,0.55)",
      "--jpe-bg-root":          "#10070a",
      "--jpe-bg-chrome":        "#160c0f",
      "--jpe-border-active":    "rgba(252,129,129,0.4)",
      "--jpe-logo-start":       "#FC8181",
      "--jpe-logo-end":         "#F6AD55",
    },
  },
  {
    id: "midnight-prism",
    name: "Midnight Prism",
    description: "Iridescent indigo & ethereal lilac",
    author: "JPE Studio",
    swatches: ["#7F9CF5", "#B794F4", "#76E4F7"],
    vars: {
      "--jpe-primary":          "#7F9CF5",
      "--jpe-primary-bright":   "#A3BFFA",
      "--jpe-primary-dim":      "rgba(127,156,245,0.12)",
      "--jpe-primary-glow":     "rgba(127,156,245,0.55)",
      "--jpe-secondary":        "#B794F4",
      "--jpe-secondary-bright": "#D6BCFA",
      "--jpe-secondary-dim":    "rgba(183,148,244,0.12)",
      "--jpe-secondary-glow":   "rgba(183,148,244,0.55)",
      "--jpe-bg-root":          "#08090f",
      "--jpe-bg-chrome":        "#0e0f1a",
      "--jpe-border-active":    "rgba(127,156,245,0.4)",
      "--jpe-logo-start":       "#7F9CF5",
      "--jpe-logo-end":         "#B794F4",
    },
  },
];

export function getTheme(id: string): JpeColorTheme {
  return jpeColorThemes.find(t => t.id === id) ?? jpeColorThemes[0];
}

/** Returns a Record of CSS custom properties for a given theme ID.
 *  Spread this on the root element's style prop (alongside T.bg etc.). */
export function getThemeCssVars(id: string): Record<string, string> {
  return getTheme(id).vars;
}
