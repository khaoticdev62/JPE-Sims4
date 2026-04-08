/* ─────────────────────────────────────────────────────────────
   JPE Studio — Google Gemini API Client Utility
   Wraps @google/generative-ai for use throughout JPE Studio.
   Replace GEMINI_API_KEY with your key from:
     https://aistudio.google.com/apikey
   ───────────────────────────────────────────────────────────── */
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type GenerateContentResult,
  type Part,
} from "@google/generative-ai";

/* ── API Key Management ─────────────────────────────────────── */
const STORAGE_KEY = "jpe-gemini-api-key";

export function getGeminiKey(): string {
  return (
    localStorage.getItem(STORAGE_KEY) ??
    // Fallback: set GEMINI_API_KEY as a build-time env var in your .env
    // VITE_GEMINI_API_KEY=your_key_here
    (import.meta as any).env?.VITE_GEMINI_API_KEY ??
    ""
  );
}

export function setGeminiKey(key: string) {
  localStorage.setItem(STORAGE_KEY, key);
}

export function clearGeminiKey() {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasGeminiKey(): boolean {
  return getGeminiKey().length > 10;
}

/* ── Model catalogue ────────────────────────────────────────── */
export type GeminiModelId =
  | "gemini-2.0-flash"
  | "gemini-2.0-flash-lite"
  | "gemini-1.5-pro"
  | "gemini-1.5-flash"
  | "gemini-1.5-flash-8b";

export interface GeminiModelMeta {
  id: GeminiModelId;
  label: string;
  desc: string;
  contextK: number;
  tier: "fast" | "balanced" | "powerful";
  badge?: string;
}

export const GEMINI_MODELS: GeminiModelMeta[] = [
  {
    id: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    desc: "Next-gen speed + quality. Best for real-time translation and code generation.",
    contextK: 1000,
    tier: "balanced",
    badge: "Recommended",
  },
  {
    id: "gemini-2.0-flash-lite",
    label: "Gemini 2.0 Flash Lite",
    desc: "Ultra-fast, lowest latency. Ideal for autocomplete and short completions.",
    contextK: 1000,
    tier: "fast",
  },
  {
    id: "gemini-1.5-pro",
    label: "Gemini 1.5 Pro",
    desc: "Largest context (2M tokens), most capable. Best for full project analysis.",
    contextK: 2000,
    tier: "powerful",
    badge: "Max Context",
  },
  {
    id: "gemini-1.5-flash",
    label: "Gemini 1.5 Flash",
    desc: "Fast and versatile, great for batch translations and doc generation.",
    contextK: 1000,
    tier: "fast",
  },
  {
    id: "gemini-1.5-flash-8b",
    label: "Gemini 1.5 Flash 8B",
    desc: "Smallest & fastest. Good for high-volume string tasks.",
    contextK: 1000,
    tier: "fast",
  },
];

/* ── Safety configuration ───────────────────────────────────── */
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/* ── Sims 4 modding system prompt ───────────────────────────── */
export const JPE_SYSTEM_PROMPT = `You are JPE AI, an expert AI assistant embedded in JPE Studio — a professional IDE for Sims 4 mod translation and development.

Your domain expertise covers:
- Sims 4 XML tuning files (TunableSimData, Trait, Buff, SuperInteraction, Skill, Career, etc.)
- JPE (JPE Project Encoding) format — a human-readable superset of Sims 4 tuning XML
- STBL (String Table) format — FNV-32a hashed key-value pairs for localization
- .package file structure and resource types (TYPE:GROUP:INSTANCE keys)
- EA Sims 4 Python Script API (ts4script, sims4.tuning, interactions, buffs, traits)
- Translation workflows: English → es-ES, fr-FR, de-DE, pt-BR, zh-CN, ko-KR, ru-RU, and more
- Mod conflict detection and dependency graph analysis
- Mod validation: schema checks, hash collisions, orphan resources, naming conventions

Respond in structured Markdown. When producing code, always specify the language (xml, python, json, jpe). 
For XML tuning, always include the TunableSimData root element with correct n= and s= attributes.
For STBL operations, show FNV-32a hashes in 0x hex format.
Keep responses focused and actionable — you are operating inside an IDE.`;

/* ── Core client class ──────────────────────────────────────── */
export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private modelId: GeminiModelId;

  constructor(apiKey: string, modelId: GeminiModelId = "gemini-2.0-flash") {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelId = modelId;
  }

  setModel(id: GeminiModelId) {
    this.modelId = id;
  }

  /* ── Single-shot text generation ─────────────────────────── */
  async generate(prompt: string, systemInstruction?: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelId,
      systemInstruction: systemInstruction ?? JPE_SYSTEM_PROMPT,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    const result: GenerateContentResult = await model.generateContent(prompt);
    return result.response.text();
  }

  /* ── Streaming generation ────────────────────────────────── */
  async *generateStream(
    prompt: string,
    systemInstruction?: string
  ): AsyncGenerator<string> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelId,
      systemInstruction: systemInstruction ?? JPE_SYSTEM_PROMPT,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    const result = await model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  }

  /* ── Chat session (multi-turn) ───────────────────────────── */
  startChat(history: Array<{ role: "user" | "model"; parts: Part[] }> = []) {
    const model = this.genAI.getGenerativeModel({
      model: this.modelId,
      systemInstruction: JPE_SYSTEM_PROMPT,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: {
        temperature: 0.75,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });
    return model.startChat({ history });
  }
}

/* ── Convenience factory (uses stored key) ──────────────────── */
export function createGeminiClient(modelId?: GeminiModelId): GeminiClient | null {
  const key = getGeminiKey();
  if (!key) return null;
  return new GeminiClient(key, modelId);
}

/* ── Task-specific prompt builders ─────────────────────────── */
export const GeminiPrompts = {
  translateToJpe: (xmlContent: string) =>
    `Translate the following Sims 4 XML tuning file to JPE format. Preserve all attribute names and values exactly.\n\nXML INPUT:\n\`\`\`xml\n${xmlContent}\n\`\`\`\n\nReturn only the JPE output with brief inline comments.`,

  generateStblEntry: (key: string, context: string) =>
    `Generate a Sims 4 STBL string entry for the key "${key}". Context: ${context}. Return FNV-32a hash and localized string for: en-US, es-ES, fr-FR, de-DE, pt-BR. Format as a table.`,

  explainTuning: (xmlSnippet: string) =>
    `Explain what this Sims 4 tuning XML does in plain English for a mod creator. Include any gotchas or common mistakes:\n\`\`\`xml\n${xmlSnippet}\n\`\`\``,

  validateMod: (fileList: string[], errors: string[]) =>
    `Review this Sims 4 mod project. Files: ${fileList.join(", ")}. Validation errors found:\n${errors.map((e, i) => `${i + 1}. ${e}`).join("\n")}\n\nFor each error, provide: root cause, fix, and prevention tip.`,

  generateDocumentation: (modName: string, fileList: string[]) =>
    `Generate comprehensive Markdown documentation for the Sims 4 mod "${modName}" containing: ${fileList.join(", ")}. Include overview, installation, compatibility, and known issues sections.`,

  suggestTranslation: (sourceText: string, targetLocale: string) =>
    `Translate this Sims 4 UI string to ${targetLocale} while maintaining the game's tone (casual, slightly humorous, family-friendly). Source: "${sourceText}". Return the translation with a confidence note and any cultural adaptation notes.`,
};
