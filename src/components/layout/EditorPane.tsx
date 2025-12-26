import { useMemo } from 'react'
import { useEditorStore } from '@stores/useEditorStore'
import { useProjectStore } from '@stores/useProjectStore'
import { useFileLoader } from '@hooks/useFileLoader'

/**
 * Simple syntax highlighter component
 */
function SyntaxHighlightedCode({
  content,
  language,
}: {
  content: string
  language: string
}) {
  const highlightedLines = useMemo(() => {
    const lines = content.split('\n')

    return lines.map((line, lineIndex) => {
      if (language === 'xml') {
        // Simple XML syntax highlighting
        const parts: JSX.Element[] = []
        let lastIndex = 0

        // Match XML tags
        const tagRegex = /(<[^>]+>)/g
        let match

        while ((match = tagRegex.exec(line)) !== null) {
          // Add text before tag
          if (match.index > lastIndex) {
            parts.push(
              <span key={`text-${lastIndex}`} className="text-slate-300">
                {line.substring(lastIndex, match.index)}
              </span>
            )
          }

          // Add tag with color
          const tag = match[1]
          const isClosing = tag.startsWith('</')
          parts.push(
            <span
              key={`tag-${match.index}`}
              className={
                isClosing ? 'text-red-400' : 'text-blue-400'
              }
            >
              {tag}
            </span>
          )

          lastIndex = match.index + tag.length
        }

        // Add remaining text
        if (lastIndex < line.length) {
          parts.push(
            <span key={`text-end-${lineIndex}`} className="text-slate-300">
              {line.substring(lastIndex)}
            </span>
          )
        }

        return (
          <div key={lineIndex} className="whitespace-pre">
            <span className="text-slate-600 mr-4">{lineIndex + 1}</span>
            {parts.length > 0 ? parts : <span className="text-slate-300">{line}</span>}
          </div>
        )
      }

      // Default highlighting for other languages
      return (
        <div key={lineIndex} className="whitespace-pre">
          <span className="text-slate-600 mr-4">{lineIndex + 1}</span>
          <span className="text-slate-300">{line}</span>
        </div>
      )
    })
  }, [content, language])

  return <>{highlightedLines}</>
}

export default function EditorPane() {
  const { tabs, activeTabId, setActiveTab, closeTab, editorContent } = useEditorStore()
  const { getFile } = useProjectStore()

  const activeTab = tabs.find((t) => t.id === activeTabId)
  const activeFile = activeTab ? getFile(activeTab.fileId) : null

  // Load file content when tab changes
  useFileLoader(activeTab?.id ?? null, activeFile?.id ?? null)

  const fileContent = activeFile ? editorContent.get(activeTab!.id) || '' : ''

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Editor Tabs */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center overflow-x-auto">
        {tabs.length > 0 ? (
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-xs border-r border-slate-800 whitespace-nowrap flex items-center gap-2 transition-colors ${
                  tab.id === activeTabId
                    ? 'bg-slate-800 text-slate-100'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span>{tab.name}</span>
                {tab.isDirty && <span className="text-yellow-500">●</span>}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                  className="ml-1 text-slate-500 hover:text-slate-300"
                >
                  ✕
                </button>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 px-4">No files open</div>
        )}
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden">
        {activeFile ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* File header */}
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
              <span>{activeFile.path}</span>
              <span className="ml-4">Type: {activeFile.type.toUpperCase()}</span>
              <span className="ml-4">{activeFile.size} bytes</span>
            </div>

            {/* Text content display with basic syntax highlighting */}
            <div className="flex-1 overflow-auto bg-slate-950">
              <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-words leading-relaxed">
                {fileContent ? (
                  <SyntaxHighlightedCode
                    content={fileContent}
                    language={activeFile.type}
                  />
                ) : (
                  <span className="text-slate-500">
                    No content loaded
                  </span>
                )}
              </pre>
            </div>

            {/* Status bar */}
            <div className="h-6 bg-slate-900 border-t border-slate-800 px-4 flex items-center text-xs text-slate-400">
              <span>Line 1, Col 1</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="text-4xl mb-4">📄</div>
            <div className="text-sm mb-2">No file selected</div>
            <div className="text-xs">Click a file in the project tree to open it</div>
          </div>
        )}
      </div>
    </div>
  )
}
