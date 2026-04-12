/**
 * Prompt-to-JPE Dialog
 *
 * Allows users to generate JPE code from natural language descriptions.
 * Uses AI services (OpenAI, Claude, Qwen, Gemini) to translate prompts
 * into valid JPE syntax with explanations.
 */

"use client"

import { useState, useCallback } from 'react'
import { Sparkles, Loader2, Copy, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { AIServiceFactory } from '@/services/ai/AIServiceFactory'
import { AIProvider } from '@/services/ai/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface PromptToJPEDialogProps {
  isOpen: boolean
  onClose: () => void
  onGenerated?: (jpeCode: string) => void
}

export default function PromptToJPEDialog({ isOpen, onClose, onGenerated }: PromptToJPEDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [generatedJPE, setGeneratedJPE] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AIProvider.OPENAI)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description')
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedJPE(null)

    try {
      const aiService = AIServiceFactory.getService(selectedProvider)

      const systemPrompt = `You are an expert Sims 4 modding assistant. Generate valid JPE (Just Plain English) code from the user's natural language description.

JPE Syntax Rules:
- WHEN <condition> DO ... END for conditional blocks
- ONLY_IF <condition> for guard clauses
- sim_has_trait("trait_name") for trait checks
- sim_has_buff("buff_name") for buff checks
- interaction_apply_buff("buff_name") for applying buffs
- Use proper indentation (2 spaces)
- End all blocks with END

Return ONLY the JPE code, no explanations. Wrap in a code block.`

      const userMessage = `Generate JPE code for: ${prompt}`

      const response = await aiService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ])

      // Extract code from response (remove markdown code blocks if present)
      let jpeCode = response.text || ''
      const codeBlockMatch = jpeCode.match(/```(?:jpe)?\n([\s\S]*?)```/)
      if (codeBlockMatch) {
        jpeCode = codeBlockMatch[1].trim()
      }

      setGeneratedJPE(jpeCode)
      onGenerated?.(jpeCode)
      toast.success('JPE code generated successfully!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed'
      setError(message)
      toast.error(`Failed to generate JPE: ${message}`)
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, selectedProvider, onGenerated])

  const handleCopy = useCallback(() => {
    if (!generatedJPE) return
    navigator.clipboard.writeText(generatedJPE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }, [generatedJPE])

  const examplePrompts = [
    'A buff that gives Sims energy when they eat',
    'An interaction that requires the Creative trait',
    'A moodlet that lasts 4 hours and boosts happiness',
    'A social interaction that unlocks at friendship level 5',
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Prompt to JPE
          </DialogTitle>
          <DialogDescription>
            Describe what you want in plain English, and AI will generate JPE code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
        {/* Provider Selection */}
        <div className="flex gap-2">
          {([AIProvider.OPENAI, AIProvider.CLAUDE, AIProvider.QWEN, AIProvider.GEMINI] as AIProvider[]).map((provider) => (
            <Button
              key={provider}
              variant={selectedProvider === provider ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedProvider(provider)}
              className="capitalize"
            >
              {provider}
            </Button>
          ))}
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your mod... e.g., 'A buff that gives Sims energy when they eat'"
            className="min-h-[100px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleGenerate()
              }
            }}
          />
        </div>

        {/* Example Prompts */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Try an example:</label>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example) => (
              <Badge
                key={example}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => setPrompt(example)}
              >
                {example}
              </Badge>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate JPE
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Generated JPE Output */}
        {generatedJPE && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Generated JPE Code</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>

            <pre className="p-4 bg-slate-900 border border-slate-700 rounded-lg overflow-auto max-h-[400px] text-sm font-mono text-slate-100">
              {generatedJPE}
            </pre>
          </div>
        )}

        {/* Keyboard Shortcut Hint */}
        <p className="text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">Enter</kbd> to generate
        </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
