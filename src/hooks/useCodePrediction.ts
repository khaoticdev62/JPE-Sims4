import { useState, useEffect, useCallback, useRef } from 'react'
import { CodePredictor, PredictionResult } from '@/services/ml/CodePredictor'
import { PatternStore } from '@/engine/ml/PatternStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { getEditorInstance } from '@/components/editor/MonacoEditor'
import { TextInputHandler } from '@/services/input/TextInputHandler'

import { useControllerStore } from '@/stores/useControllerStore'

export function useCodePrediction() {
  const { currentProject } = useProjectStore()
  const { activeTabId, tabs } = useEditorStore()
  const { predictionsEnabled } = useControllerStore()
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const [cursorPixelPosition, setCursorPixelPosition] = useState<{ top: number; left: number } | null>(null)

  const predictor = useRef(CodePredictor.getInstance())
  const textInputHandler = useRef(TextInputHandler.getInstance())
  const lastPosition = useRef<{ line: number; column: number } | null>(null)

  const activeTab = tabs.find(t => t.id === activeTabId)

  const updatePredictions = useCallback(async () => {
    if (!predictionsEnabled) {
      setVisible(false)
      return
    }

    const editor = getEditorInstance('current')
    if (!editor || !activeTab || !currentProject) {
      setVisible(false)
      return
    }

    const position = editor.getPosition()
    const model = editor.getModel()
    if (!position || !model) return

    // Get pixel position for UI placement
    const pixelPos = editor.getScrolledVisiblePosition(position)
    if (pixelPos) {
      setCursorPixelPosition({
        top: pixelPos.top,
        left: pixelPos.left + 10
      })
    }

    // Trigger check
    const content = editor.getValue()
    const offset = model.getOffsetAt(position)
    const lineBefore = model.getLineContent(position.lineNumber).slice(0, position.column - 1)
    
    // Only predict on trigger characters or 3+ characters typed
    const isTrigger = /[: ">\n]$/.test(lineBefore) || lineBefore.trim().length >= 3
    if (!isTrigger) {
      setVisible(false)
      return
    }

    // Don't predict if position hasn't changed significantly
    if (lastPosition.current?.line === position.lineNumber && 
        Math.abs(lastPosition.current?.column - position.column) < 2) {
      return
    }
    lastPosition.current = { line: position.lineNumber, column: position.column }

    // Analyze context
    const context = predictor.current.analyzeContext(content, offset, activeTab.name)
    
    // Load patterns
    const patterns = PatternStore.loadPatterns(currentProject.name)
    
    // Get predictions (Enable AI pass)
    const results = await predictor.current.predict(
      context, 
      patterns, 
      5, 
      true, 
      undefined // Optional: load from store in future story
    )
    
    if (results.length > 0) {
      setPredictions(results)
      setSelectedIndex(0)
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [activeTab, currentProject, predictionsEnabled])

  // Story 6.5: Automated Debouncing
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  
  const debouncedUpdate = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(updatePredictions, 300)
  }, [updatePredictions])

  const acceptPrediction = useCallback((index: number = selectedIndex) => {
    const prediction = predictions[index]
    if (prediction) {
      predictor.current.recordAcceptance(prediction.token, prediction.type)
      textInputHandler.current.insertText(prediction.token)
      setVisible(false)
    }
  }, [predictions, selectedIndex])

  const rejectPrediction = useCallback(() => {
    if (predictions[selectedIndex]) {
      predictor.current.recordRejection(predictions[selectedIndex].token, predictions[selectedIndex].type)
    }
    setVisible(false)
  }, [predictions, selectedIndex])

  // Setup editor listeners
  useEffect(() => {
    const editor = getEditorInstance('current')
    if (!editor) return

    const disposable = editor.onDidChangeCursorPosition(() => {
      debouncedUpdate()
    })

    return () => {
      disposable.dispose()
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [debouncedUpdate])

  return {
    predictions,
    selectedIndex,
    setSelectedIndex,
    visible,
    setVisible,
    cursorPixelPosition,
    acceptPrediction,
    rejectPrediction
  }
}
