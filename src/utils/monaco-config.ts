import { Monaco } from "@monaco-editor/react";
import { tuningSearch } from "@/services/TuningSearchService";

export const registerJPELanguage = (monaco: Monaco) => {
  // Register a new language
  monaco.languages.register({ id: "jpe" });

  // Define tokens for our language
  monaco.languages.setMonarchTokensProvider("jpe", {
    tokenizer: {
      root: [
        [/\b(WHEN|DO|ONLY_IF|CONDITIONS|LOCALIZATION|true|false)\b/, "keyword"],
        [/[a-zA-Z_]\w*/, "variable"],
        [/".*?"/, "string"],
        [/\d+(\.\d+)?/, "number"],
        [/#.*$/, "comment"],
        [/[{}()[\],:]/, "@brackets"],
      ],
    },
  });

  // Define a custom theme
  monaco.editor.defineTheme("jpe-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "#38bdf8", fontStyle: "bold" }, // sky-400
      { token: "string", foreground: "#a78bfa" }, // violet-400
      { token: "number", foreground: "#fbbf24" }, // amber-400
      { token: "comment", foreground: "#64748b", fontStyle: "italic" }, // slate-500
      { token: "variable", foreground: "#f1f5f9" }, // slate-100
      { token: "@brackets", foreground: "#94a3b8" }, // slate-400
    ],
    colors: {
      "editor.background": "#0a0c10", // spectral-brand-bg-panel
      "editorCursor.foreground": "#38bdf8", // sky-400
      "editor.lineHighlightBackground": "#181b24", // spectral-bg-elevated
      "editorLineNumber.foreground": "#475569", // slate-600
      "editor.selectionBackground": "#334155", // slate-700
      "editorIndentGuide.background": "#181b24", // spectral-bg-elevated
    },
  });

  monaco.languages.registerCompletionItemProvider("jpe", {
    provideCompletionItems: (
      model: any,
      position: any
    ) => {
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      };

      const suggestions = [
        {
          label: "interaction",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "interaction ${1:Name} {\n  id: ${2:12345}\n  target: sim\n  $0\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: "buff.apply",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "buff.apply(${1:BuffName})",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: "available_when",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "available_when {\n  $0\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        }
      ];
      return { suggestions } as any;
    },
  } as any);
};

export const registerXMLLanguage = (monaco: Monaco) => {
  monaco.languages.registerCompletionItemProvider("xml", {
    triggerCharacters: ['"', 'n=', 's='],
    provideCompletionItems: (model: any, position: any) => {
      const lineContent = model.getLineContent(position.lineNumber);
      const textUntilPosition = lineContent.substring(0, position.column);

      // Check if we are inside a name (n=) or static (s=) attribute
      const isAttributeMatch = textUntilPosition.match(/(n|s)="([^"]*)$/);
      if (!isAttributeMatch) return { suggestions: [] };

      const query = isAttributeMatch[2];
      const results = tuningSearch.search(query);

      // Recalculating range more simply
      const startColumn = position.column - query.length;
      const simpleRange = {
         startLineNumber: position.lineNumber,
         endLineNumber: position.lineNumber,
         startColumn: startColumn,
         endColumn: position.column
      };

      const suggestions = results.map(res => ({
        label: res.name,
        kind: monaco.languages.CompletionItemKind.Reference,
        detail: `[${res.type}] ID: ${res.id}`,
        documentation: res.desc,
        insertText: res.name,
        range: simpleRange
      }));

      return { suggestions };
    }
  });
};
