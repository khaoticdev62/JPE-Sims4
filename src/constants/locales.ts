/**
 * LOCALIZATION CONSTANTS
 * 
 * Centralized strings for the JPE Studio UI to support future i18n.
 */

export const LOCALES = {
  en: {
    editor: {
      compilation_failed: "Compilation failed:",
      ai_suggested_fix: "AI Suggested Fix",
      saving: "Saving...",
      compiling: "Compiling...",
    },
    common: {
      ok: "OK",
      cancel: "Cancel",
      apply: "Apply",
      close: "Close",
    }
  }
};

export const t = (path: string, locale: keyof typeof LOCALES = 'en') => {
  const keys = path.split('.');
  let result: any = LOCALES[locale];
  
  for (const key of keys) {
    if (result[key] === undefined) return path;
    result = result[key];
  }
  
  return result;
};
