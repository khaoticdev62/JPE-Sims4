/* JPE STUDIO — Global Settings Context
   Provides font scale, live wallpaper, color theme, and other UI settings
   with automatic localStorage persistence. */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type WallpaperPreset = "none" | "particles" | "grid" | "aurora" | "matrix" | "custom";

export interface JpeSettings {
  fontScale: number;            // 0.85 … 1.6
  wallpaper: WallpaperPreset;
  wallpaperOpacity: number;     // 0 … 100
  wallpaperSpeed: number;       // 0.5 … 2
  customWallpaperUrl: string;
  uiBlur: boolean;              // frosted-glass panels
  colorTheme: string;           // theme ID from jpe-themes.ts
  minimapEnabled: boolean;      // global minimap toggle
  animationsEnabled: boolean;   // global animation toggle
  compactMode: boolean;         // tighter UI density
}

const defaultSettings: JpeSettings = {
  fontScale: 1.15,
  wallpaper: "grid",
  wallpaperOpacity: 30,
  wallpaperSpeed: 1,
  customWallpaperUrl: "",
  uiBlur: true,
  colorTheme: "obsidian-crystal",
  minimapEnabled: true,
  animationsEnabled: true,
  compactMode: false,
};

interface JpeSettingsCtx {
  settings: JpeSettings;
  update: <K extends keyof JpeSettings>(key: K, value: JpeSettings[K]) => void;
  reset: () => void;
}

const Ctx = createContext<JpeSettingsCtx>({
  settings: defaultSettings,
  update: () => {},
  reset: () => {},
});

export function useJpeSettings() { return useContext(Ctx); }

/** Shrinks a fixed-pixel width when zoom > 1 so panels keep their on-screen proportion. */
export function useScaledPx(basePx: number): number {
  const { settings: { fontScale } } = useContext(Ctx);
  return Math.round(basePx / Math.max(fontScale, 1));
}

const STORAGE_KEY = "jpe-global-settings-v1";

function loadSettings(): JpeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<JpeSettings>;
    // Merge with defaults so new keys are always present
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

function saveSettings(s: JpeSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* ignore QuotaExceededError */ }
}

export function JpeSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<JpeSettings>(loadSettings);

  /* Persist every change */
  useEffect(() => { saveSettings(settings); }, [settings]);

  const update = useCallback(<K extends keyof JpeSettings>(key: K, value: JpeSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setSettings(defaultSettings);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return <Ctx.Provider value={{ settings, update, reset }}>{children}</Ctx.Provider>;
}

export { defaultSettings as jpeDefaultSettings };
