# Code Review Layer 1: Blind Hunter (Adversarial)

You are an elite code reviewer performing a **Blind Search**. You receive ONLY THE DIFF of the changes. You have no context about the project, the user's intent, or the requirements. Your goal is to find bugs, logical inconsistencies, code smells, and potential security issues just by looking at the code changes themselves.

## The Diff

```diff
--- a/src/services/ai/types.ts
+++ b/src/services/ai/types.ts
@@ -1,5 +1,28 @@
-export type AIResult = {
-  success: boolean
-  text?: string
-  error?: string
+export enum AIProvider {
+  CLAUDE = 'claude',
+  OPENAI = 'openai',
+  GEMINI = 'gemini',
+  QWEN = 'qwen',
+}
+
+export interface AIMessage {
+  role: 'user' | 'assistant' | 'system'
+  content: string
+  timestamp?: number
+}
+
+export interface AIResult {
+  success: boolean
+  text?: string
+  error?: string
+  fixedCode?: string
+  explanation?: string
 }

--- a/src/stores/useEditorStore.ts
+++ b/src/stores/useEditorStore.ts
@@ -1,4 +1,6 @@
+import { create } from 'zustand'
+import { devtools, persist } from 'zustand/middleware'
+import { AIProvider, AIMessage } from '@/services/ai/types'
+import type { EditorTab, ModFile } from '@/types/index'
+
+interface AIState {
+  selectedProvider: AIProvider
+  isProcessing: boolean
+  messages: AIMessage[]
+}
+
 interface EditorState {
   tabs: EditorTab[]
   activeTabId: string | null
+  editorContent: Record<string, string>
+  cursorPosition: Record<string, CursorPosition>
+  
+  // AI Session State
+  aiState: AIState
+  
+  // File Buffer (for syncing with tabs)
+  files: ModFile[]
+  activeFileId: string | null
+
+  // Actions... [truncated for prompt size, full impl below]
+}

 export const useEditorStore = create<EditorState>()(
   devtools(
     persist(
-      (set, get) => ({ ... }),
+      (set, get) => ({
+        tabs: [],
+        activeTabId: null,
+        editorContent: {},
+        cursorPosition: {},
+        files: [],
+        activeFileId: null,
+        aiState: {
+          selectedProvider: AIProvider.CLAUDE,
+          isProcessing: false,
+          messages: []
+        },
+        // ... actions omitted for brevity in this prompt, check full CodeEditor/Sidebar usage
+      })
+    )
+  )
+)

--- a/src/services/api/CredentialManager.ts
+++ b/src/services/api/CredentialManager.ts
@@ -18,6 +18,33 @@ export class CredentialManager {
   private static readonly CLAUDE_API_KEY = 'claude-api-key'
 
   /**
+   * Synchronous key retrieval for UI components (uses localStorage as temporary bridge)
+   */
+  static getKey(provider: string): string | null {
+    if (typeof window === 'undefined') return null
+    return localStorage.getItem(`jpe-ai-key-${provider}`)
+  }
+
+  /**
+   * Synchronous key saving for UI components
+   */
+  static saveKey(provider: string, key: string): void {
+    if (typeof window === 'undefined') return
+    localStorage.setItem(`jpe-ai-key-${provider}`, key)
+    // Also try to save to keychain asynchronously in background
+    this.saveCredential(`ai-key-${provider}`, key).catch(e => console.error('Keychain sync failed', e))
+  }

--- a/src/components/sidebar/Sidebar.tsx
+++ b/src/components/sidebar/Sidebar.tsx
@@ -16,11 +16,12 @@ export function Sidebar() {
-  const { isSidebarOpen } = useEditorStore()
+  const { sidebarCollapsed } = useUIStore()
-  if (!isSidebarOpen) return null
+  if (sidebarCollapsed) return null

--- a/src/components/editor/CodeEditor.tsx
+++ b/src/components/editor/CodeEditor.tsx
@@ -5,1 +5,1 @@
-import { useEditorStore } from "@/stores/editor-store"
+import { useEditorStore } from "@/stores/useEditorStore"
@@ -101,1 +101,1 @@
-              {files.map(file => (
+              {files.map((file: ModFile) => (
@@ -137,1 +137,1 @@
-            language={activeFile.language}
+            language={activeFile?.type === 'ts4script' || activeFile?.type === 'py' ? 'python' : 'xml'}
```

## Review Goals

1. **Logical Correctness**: Does the code do what it looks like it should do?
2. **Side-effects**: Are there unintended consequences, especially in the `CredentialManager` and `useEditorStore` changes?
3. **Implicit vs Explicit**: Look for potential runtime crashes (e.g., null pointers, missing guards).
4. **Maintenance**: Is the code clean and well-structured?

**Please provide your findings as an adversarial report.**
