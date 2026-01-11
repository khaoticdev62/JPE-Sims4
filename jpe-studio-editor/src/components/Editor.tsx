import React, { useEffect, useRef } from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  fileName: string;
}

const Editor: React.FC<EditorProps> = ({ content, onChange, fileName }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    const initMonaco = async () => {
      const monaco = await import('monaco-editor');
      
      if (editorRef.current) {
        // Create the editor instance
        const editor = monaco.editor.create(editorRef.current, {
          value: content,
          language: 'jpe', // We'll define this custom language
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: true },
          fontSize: 14,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
        });

        // Define a custom JPE language (simplified for now)
        monaco.languages.register({ id: 'jpe' });

        // Register a completion item provider for JPE
        monaco.languages.registerCompletionItemProvider('jpe', {
          provideCompletionItems: () => {
            const suggestions = [
              {
                label: 'interaction',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'interaction "${1:name}":\n  id: ${2:id}\n  target: ${3|Sim,Object|}\n  \n  available_when:\n    - ${4:condition}\n  \n  on_success:\n    - ${5:action}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Define a new interaction'
              },
              {
                label: 'buff',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'buff "${1:name}":\n  id: ${2:id}\n  \n',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Define a new buff'
              },
              {
                label: 'trait',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'trait "${1:name}":\n  id: ${2:id}\n  \n',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Define a new trait'
              },
              {
                label: 'available_when',
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: 'available_when:\n  - ',
                documentation: 'Define conditions for when the interaction is available'
              },
              {
                label: 'on_success',
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: 'on_success:\n  - ',
                documentation: 'Define actions to perform when the interaction succeeds'
              }
            ];
            return { suggestions };
          }
        });

        monaco.languages.setMonarchTokensProvider('jpe', {
          tokenizer: {
            root: [
              // Keywords
              [/\b(interaction|buff|trait|available_when|on_success|target|pie_menu|id|name|duration|apply|modify|set|to|for|actor|is|not|and|or|has|age|sleeping|relationship|teen_or_older|child|toddler|adult|elder|statistic|commodity|value|delta|hours|minutes)\b/, 'keyword'],
              // Strings
              [/"([^"\\]|\\.)*"/, 'string'],
              // Comments
              [/#[^\n\r]*/, 'comment'],
              // Numbers
              [/\d+/, 'number'],
              // Operators
              [/[:\-]/, 'operator'],
            ],
          },
        });

        // Update content when it changes
        editor.getModel()?.onDidChangeContent(() => {
          const newValue = editor.getValue();
          onChange(newValue);
        });

        monacoRef.current = editor;
      }
    };

    // Dynamically import Monaco Editor
    if (typeof window !== 'undefined') {
      initMonaco();
    }

    // Cleanup function
    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
      }
    };
  }, [fileName]);

  useEffect(() => {
    // Update editor content when prop changes
    if (monacoRef.current && monacoRef.current.getValue() !== content) {
      monacoRef.current.setValue(content);
    }
  }, [content]);

  return (
    <div className="editor-container">
      <div className="editor-header">
        <span className="file-name">{fileName}</span>
      </div>
      <div ref={editorRef} className="editor" />
    </div>
  );
};

export default Editor;