"use client";

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





export function JpeSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<JpeSettings>(defaultSettings);
  const [isHydrated, setIsHydrated] = useState(false);

  /* Hybrid Hydration: Main Vault + Migration */
  useEffect(() => {
    async function hydrate() {
      if (typeof window === 'undefined' || !window.electron) {
        setIsHydrated(true);
        return;
      }

      try {
        // 1. Try to load from Main Vault
        const response = await window.electron.security.vault.get(STORAGE_KEY);
        let vaultedSettings = response.success ? response.value as JpeSettings : null;

        // 2. Migration Check
        const legacyRaw = localStorage.getItem(STORAGE_KEY);
        if (legacyRaw && !vaultedSettings) {
          console.info("[Security:Migration] Found legacy localStorage settings, promoting to AES-256 vault...");
          const legacy = JSON.parse(legacyRaw) as JpeSettings;
          await window.electron.security.vault.set(STORAGE_KEY, legacy);
          vaultedSettings = legacy;
          
          // Clear legacy only after successful vault write
          localStorage.removeItem(STORAGE_KEY);
        }

        if (vaultedSettings) {
          setSettings({ ...defaultSettings, ...vaultedSettings });
        }
      } catch (err) {
        console.error("[Security:Vault] Hydration failed:", err);
      } finally {
        setIsHydrated(true);
      }
    }
    hydrate();
  }, []);

  /* Persist every change to Secure Vault */
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined' && window.electron) {
      window.electron.security.vault.set(STORAGE_KEY, settings);
    }
  }, [settings, isHydrated]);

  const update = useCallback(<K extends keyof JpeSettings>(key: K, value: JpeSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(async () => {
    setSettings(defaultSettings);
    if (typeof window !== 'undefined' && window.electron) {
      await window.electron.security.vault.set(STORAGE_KEY, defaultSettings);
    }
  }, []);

  return (
    <Ctx.Provider value={{ settings, update, reset }}>
      {/* Prevent flash of default styles during hydration */}
      {isHydrated ? children : <div style={{ background: '#0a0c10', width: '100vw', height: '100vh' }} />}
    </Ctx.Provider>
  );
}

export { defaultSettings as jpeDefaultSettings };
