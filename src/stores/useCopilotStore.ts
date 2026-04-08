import { create } from "zustand";
import { AIServiceFactory } from "@/services/ai/AIServiceFactory";
import { AIMessage } from "@/services/ai/types";
import { SYSTEM_PROMPT_JPE_GENERATOR } from "@/services/ai/JPEGeneratorPrompt";
import { useEditorStore } from "./useEditorStore";


export interface CopilotMessage extends AIMessage {
  id: string;
  timestamp: number;
}

interface CopilotState {
  messages: CopilotMessage[];
  isStreaming: boolean;
  isOpen: boolean;
  
  // Actions
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
  
  // Smart Actions
  performAudit: () => Promise<void>;
  performExplanation: () => Promise<void>;
  generateSnippet: (intent: string) => Promise<void>;
}

export const useCopilotStore = create<CopilotState>((set, get) => ({
  messages: [
    {
      id: "system-init",
      role: "assistant",
      content: "Hello! I am your **JPE AI Copilot**. I specialize in industrial-grade Sims 4 modding logic. How can I help you build today?",
      timestamp: Date.now()
    }
  ],
  isStreaming: false,
  isOpen: false,

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),

  clearHistory: () => set({
    messages: [
      {
        id: `clear-${Date.now()}`,
        role: "assistant",
        content: "History cleared. I'm ready for new logic commands.",
        timestamp: Date.now()
      }
    ]
  }),

  sendMessage: async (text: string) => {
    const { messages } = get();
    const newUserMsg: CopilotMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now()
    };

    set({ messages: [...messages, newUserMsg], isStreaming: true });

    try {
      const activeService = AIServiceFactory.getActiveService();
      if (!activeService) throw new Error("No active AI provider configured.");

      // Gather context from active editor if available
      const editorState = useEditorStore.getState();
      const activeContent = editorState.activeTabId ? editorState.editorContent[editorState.activeTabId] : "";
      
      const contextPrompt = activeContent 
        ? `\n\n[CURRENT CODE CONTEXT]:\n\`\`\`jpe\n${activeContent}\n\`\`\``
        : "";

      const history = get().messages.map(m => ({ role: m.role, content: m.content }));
      
      const result = await activeService.chat(
        [
          { role: 'system', content: SYSTEM_PROMPT_JPE_GENERATOR + contextPrompt },
          ...history
        ]
      );

      if (result.success && result.text) {
        const assistantMsg: CopilotMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.text,
          timestamp: Date.now()
        };
        set((state) => ({ messages: [...state.messages, assistantMsg], isStreaming: false }));
      } else {
        throw new Error(result.error || "Failed to get AI response");
      }
    } catch (err: any) {
      const errorMsg: CopilotMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `**Error**: ${err.message || "An unexpected error occurred during intelligence retrieval."}`,
        timestamp: Date.now()
      };
      set((state) => ({ messages: [...state.messages, errorMsg], isStreaming: false }));
    }
  },

  performAudit: async () => {
    const editorState = useEditorStore.getState();
    const activeContent = editorState.activeTabId ? editorState.editorContent[editorState.activeTabId] : "";
    
    if (!activeContent.trim()) {
      set((state) => ({
        messages: [...state.messages, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Please open a JPE file first so I can audit its logic.",
          timestamp: Date.now()
        }]
      }));
      return;
    }

    await get().sendMessage(`Audit the following JPE logic for bugs, logical flaws, or potential conflicts:\n\n\`\`\`jpe\n${activeContent}\n\`\`\``);
  },

  performExplanation: async () => {
    const editorState = useEditorStore.getState();
    const activeContent = editorState.activeTabId ? editorState.editorContent[editorState.activeTabId] : "";
    
    if (!activeContent.trim()) {
      set((state) => ({
        messages: [...state.messages, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Please open a JPE file first if you want me to explain it.",
          timestamp: Date.now()
        }]
      }));
      return;
    }

    await get().sendMessage(`Explain this JPE logic in detail, breaking down the triggers, conditions, and actions:\n\n\`\`\`jpe\n${activeContent}\n\`\`\``);
  },

  generateSnippet: async (intent: string) => {
    await get().sendMessage(`Generate a clean JPE snippet for this intent: ${intent}`);
  }
}));
